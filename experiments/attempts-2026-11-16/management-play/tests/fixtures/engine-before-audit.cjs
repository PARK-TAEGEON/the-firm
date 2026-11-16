(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FirmEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Isolated experiment: these are authored scenario rules, not the production economy.
  var VERSION = '0.3.0';
  var DATES = ['2026-06-12', '2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19'];
  var WORK_DAYS = 5;
  var OPERATING_COST = 160000;
  var ROLES = ['lawyer', 'admin'];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function order(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
  function sum(values) { return values.reduce(function (total, value) { return total + value; }, 0); }
  function find(items, id) { return items.find(function (item) { return item.id === id; }); }
  function remaining(task) { return task.requiredHours - task.doneHours; }
  function event(state, title, detail) {
    state.events.push({ id: 'event-' + String(state.events.length + 1).padStart(4, '0'), day: state.dayIndex, title: title, detail: detail });
  }
  function task(id, caseId, title, hours, assignee, priority, dueDay, requires, roles, outputText) {
    return { id: id, caseId: caseId, title: title, requiredHours: hours, doneHours: 0,
      assignee: assignee, priority: priority, dueDay: dueDay, requires: requires,
      roles: roles, outputText: outputText, completedDay: null };
  }

  function createInitialState() {
    return {
      schemaVersion: 1, version: VERSION, dayIndex: 0, dates: DATES.slice(),
      cash: 18200000, openingCash: 18200000,
      intake: { status: 'pending', client: '윤지훈', fee: 3600000, upfront: 2400000, balance: 1200000, dueDay: 4 },
      staff: [
        { id: 'lee', name: '이정우', role: 'lawyer', specialty: '형사 · 총괄 검토', capacity: 3, hourlyCost: 60000 },
        { id: 'kim', name: '김현우', role: 'lawyer', specialty: '형사 · 기록 분석', capacity: 4, hourlyCost: 45000 },
        { id: 'park', name: '박서윤', role: 'lawyer', specialty: '계약 · 조사', capacity: 4, hourlyCost: 40000 },
        { id: 'han', name: '한도윤', role: 'admin', specialty: '자료 정리 · 사건 운영', capacity: 3, hourlyCost: 18000 }
      ],
      cases: [
        { id: 'jung', client: '정민호', title: '정민호 사건', status: 'active', dueDay: 3, summary: '자료를 정리한 뒤 기록을 검토합니다. 자료 정리가 후속 검토의 선행 조건입니다.' },
        { id: 'go', client: '고은아', title: '고은아 사건', status: 'active', dueDay: 3, summary: '조사 메모를 작성하고 대표 검토를 마무리합니다. 기존 업무의 미수금 입금이 예정되어 있습니다.' },
        { id: 'yoon', client: '윤지훈', title: '윤지훈 수임 검토', status: 'pending', dueDay: 4, summary: '신규 수임을 결정하면 자료 취합·초기 검토·준비 보고가 추가됩니다.' }
      ],
      tasks: [
        task('jung-organize', 'jung', '정민호 · 자료 정리', 8, 'han', 1, 1, [], ['admin', 'lawyer'], '수집한 자료를 항목별로 정리했습니다. 기록 검토를 시작할 수 있습니다.'),
        task('jung-review', 'jung', '정민호 · 기록 검토', 12, 'kim', 1, 3, ['jung-organize'], ['lawyer'], '정리된 기록의 확인 범위와 추가 검토 항목을 정리했습니다. 법적 판단이나 승소 전망을 확정하지 않습니다.'),
        task('go-memo', 'go', '고은아 · 조사 메모', 10, 'park', 2, 3, [], ['lawyer'], '확인한 자료와 아직 확인하지 못한 사항을 조사 메모로 정리했습니다.'),
        task('go-review', 'go', '고은아 · 검토 마무리', 6, 'lee', 2, 3, ['go-memo'], ['lawyer'], '조사 메모 검토를 마쳤습니다. 준비된 범위와 추가 확인 사항을 의뢰인 설명용으로 정리했습니다.')
      ],
      ledger: [],
      invoices: [{ id: 'invoice-existing', caseId: 'go', amount: 4500000, dueDay: 2, status: 'unpaid', paidDay: null, title: '기존 업무 미수금' }],
      reports: [],
      events: [{ id: 'event-0001', day: 0, title: '업무 주간 시작', detail: '기존 사건 2건과 신규 수임 요청 1건을 검토합니다. 배정·준비 범위와 현금 변화를 확인하세요.' }],
      completed: false
    };
  }

  function updateCaseStatuses(state) {
    state.cases.forEach(function (matter) {
      if (matter.id === 'yoon' && state.intake.status !== 'accepted') {
        matter.status = state.intake.status;
        return;
      }
      var work = state.tasks.filter(function (item) { return item.caseId === matter.id; });
      matter.status = work.length && work.every(function (item) { return remaining(item) === 0; }) ? 'ready' : 'active';
    });
  }

  // Responsibilities may be overcommitted; actual execution shares one capacity per person.
  // Newly completed prerequisites can release downstream work on the same day.
  function scheduleDay(state) {
    var capacity = {};
    state.staff.forEach(function (person) { capacity[person.id] = person.capacity; });
    var work = [];
    var completed = [];
    while (true) {
      var candidates = state.tasks.filter(function (item) {
        if (remaining(item) <= 0 || !item.assignee || capacity[item.assignee] <= 0) return false;
        var person = find(state.staff, item.assignee);
        if (!person || item.roles.indexOf(person.role) < 0) return false;
        return item.requires.every(function (id) { return remaining(find(state.tasks, id)) === 0; });
      }).sort(function (a, b) { return a.priority - b.priority || order(a.id, b.id); });
      if (!candidates.length) break;
      var item = candidates[0];
      var person = find(state.staff, item.assignee);
      var hours = Math.min(remaining(item), capacity[person.id]);
      item.doneHours += hours;
      capacity[person.id] -= hours;
      work.push({ taskId: item.id, staffId: person.id, hours: hours, cost: hours * person.hourlyCost });
      if (remaining(item) === 0) {
        item.completedDay = state.dayIndex;
        completed.push(item.id);
      }
    }
    return { work: work, completed: completed };
  }

  function addLedger(state, entry) {
    if (state.ledger.some(function (existing) { return existing.id === entry.id || existing.sourceId === entry.sourceId; })) {
      throw new Error('이미 반영된 입출금입니다.');
    }
    state.ledger.push(entry);
    state.cash += entry.type === 'income' ? entry.amount : -entry.amount;
  }

  function runDay(state) {
    var day = state.dayIndex;
    var cashBefore = state.cash;
    var schedule = scheduleDay(state);
    if (schedule.completed.indexOf('yoon-brief') >= 0 && !find(state.invoices, 'invoice-yoon-balance')) {
      state.invoices.push({ id: 'invoice-yoon-balance', caseId: 'yoon', amount: state.intake.balance,
        dueDay: day + 1, status: 'unpaid', paidDay: null, title: '윤지훈 · 준비 보고 잔금' });
    }
    var income = 0;
    state.invoices.filter(function (invoice) { return invoice.status === 'unpaid' && invoice.dueDay <= day; })
      .sort(function (a, b) { return order(a.id, b.id); }).forEach(function (invoice) {
        addLedger(state, { id: 'ledger-' + invoice.id, day: day, type: 'income', amount: invoice.amount,
          title: invoice.title, sourceId: invoice.id });
        invoice.status = 'paid'; invoice.paidDay = day; income += invoice.amount;
      });
    addLedger(state, { id: 'ledger-operating-' + day, day: day, type: 'expense', amount: OPERATING_COST,
      title: '사무실 일일 운영비', sourceId: 'operating:' + day });
    schedule.work.forEach(function (entry) {
      addLedger(state, { id: 'ledger-work-' + day + '-' + entry.taskId, day: day, type: 'expense', amount: entry.cost,
        title: find(state.tasks, entry.taskId).title + ' · 업무비', sourceId: 'work:' + day + ':' + entry.taskId + ':' + entry.staffId });
    });
    var expenses = OPERATING_COST + sum(schedule.work.map(function (entry) { return entry.cost; }));
    var late = state.tasks.filter(function (item) { return item.dueDay <= day && remaining(item) > 0; }).map(function (item) { return item.id; });
    var hours = sum(schedule.work.map(function (entry) { return entry.hours; }));
    state.reports.push({ id: 'report-day-' + day, day: day, title: DATES[day] + ' 업무 보고',
      summary: '총 ' + hours + '시간 수행 · ' + schedule.completed.length + '건 완료' + (late.length ? ' · 기한 내 미완료 ' + late.length + '건' : ''),
      work: schedule.work, completed: schedule.completed, cashBefore: cashBefore, cashAfter: state.cash,
      income: income, expenses: expenses, lateTasks: late });
    schedule.completed.forEach(function (id) { event(state, '업무 완료', find(state.tasks, id).title); });
    event(state, '하루 업무 마감', hours + '시간을 수행하고 입금 ' + income + '원, 지출 ' + expenses + '원을 반영했습니다.');
    updateCaseStatuses(state);
    state.dayIndex += 1;
    state.completed = state.dayIndex === WORK_DAYS;
    return state;
  }

  function command(state, action) {
    var valid = validateState(state);
    if (!valid.ok) return { ok: false, state: state, error: '현재 상태를 읽을 수 없습니다: ' + valid.error };
    if (!action || typeof action.type !== 'string') return { ok: false, state: state, error: '실행할 명령을 지정해 주세요.' };
    if (state.completed) return { ok: false, state: state, error: '이번 검증 주간이 마감되었습니다. 새로 시작해 다른 배정을 비교할 수 있습니다.' };
    var next = clone(state);
    try {
      switch (action.type) {
        case 'ACCEPT_INTAKE':
          if (next.intake.status !== 'pending') throw new Error('이미 수임 여부를 결정했습니다.');
          next.intake.status = 'accepted';
          find(next.cases, 'yoon').status = 'active';
          next.tasks.push(
            task('yoon-collect', 'yoon', '윤지훈 · 자료 취합', 4, 'han', 2, 3, [], ['admin', 'lawyer'], '의뢰인이 제공한 자료를 취합했습니다. 초기 검토에 사용할 수 있습니다.'),
            task('yoon-review', 'yoon', '윤지훈 · 초기 검토', 8, 'park', 2, 4, ['yoon-collect'], ['lawyer'], '의뢰 범위와 자료의 확인 사항을 검토했습니다. 추가 확인 항목을 남겼습니다.'),
            task('yoon-brief', 'yoon', '윤지훈 · 준비 보고', 4, 'lee', 2, 4, ['yoon-review'], ['lawyer'], '완료된 자료 취합·초기 검토를 준비 보고로 정리했습니다. 다음 대응은 별도 판단이 필요합니다.')
          );
          next.invoices.push({ id: 'invoice-yoon-upfront', caseId: 'yoon', amount: next.intake.upfront,
            dueDay: next.dayIndex + 1, status: 'unpaid', paidDay: null, title: '윤지훈 · 착수금' });
          event(next, '신규 사건 수임', '윤지훈 사건을 수임했습니다. 착수금은 다음 업무일 입금 예정이며 준비 업무 16시간이 추가됩니다.');
          break;
        case 'DECLINE_INTAKE':
          if (next.intake.status !== 'pending') throw new Error('이미 수임 여부를 결정했습니다.');
          next.intake.status = 'declined'; find(next.cases, 'yoon').status = 'declined';
          event(next, '신규 사건 거절', '윤지훈 사건을 받지 않고 기존 업무에 집중합니다. 신규 입금과 업무는 추가되지 않습니다.');
          break;
        case 'ASSIGN_TASK': {
          var assignedTask = find(next.tasks, action.taskId);
          var assignee = find(next.staff, action.staffId);
          if (!assignedTask) throw new Error('배정할 업무를 찾을 수 없습니다.');
          if (assignedTask.completedDay !== null) throw new Error('완료된 업무의 담당자는 변경할 수 없습니다.');
          if (!assignee) throw new Error('담당자를 선택해 주세요.');
          if (assignedTask.roles.indexOf(assignee.role) < 0) throw new Error('이 업무를 수행할 수 없는 직무입니다.');
          if (assignedTask.assignee !== assignee.id) {
            var old = find(next.staff, assignedTask.assignee);
            assignedTask.assignee = assignee.id;
            event(next, '담당자 변경', assignedTask.title + ': ' + (old ? old.name : '미배정') + ' → ' + assignee.name + '. 이미 수행한 범위와 기록은 유지합니다.');
          }
          break;
        }
        case 'SET_PRIORITY': {
          var prioritizedTask = find(next.tasks, action.taskId);
          if (!prioritizedTask) throw new Error('우선순위를 바꿀 업무를 찾을 수 없습니다.');
          if (prioritizedTask.completedDay !== null) throw new Error('완료된 업무의 우선순위는 변경할 수 없습니다.');
          if (![1, 2, 3].includes(action.priority)) throw new Error('우선순위는 1, 2, 3 중에서 선택해 주세요.');
          if (prioritizedTask.priority !== action.priority) {
            prioritizedTask.priority = action.priority;
            event(next, '우선순위 변경', prioritizedTask.title + ' · ' + ({ 1: '높음', 2: '보통', 3: '낮음' })[action.priority]);
          }
          break;
        }
        case 'ADVANCE_DAY':
          if (next.intake.status === 'pending') throw new Error('윤지훈 사건의 수임 또는 거절을 먼저 결정해 주세요.');
          runDay(next);
          break;
        default: throw new Error('지원하지 않는 명령입니다.');
      }
      var checked = validateState(next);
      if (!checked.ok) throw new Error('변경을 반영하지 못했습니다: ' + checked.error);
      return { ok: true, state: next };
    } catch (error) {
      return { ok: false, state: state, error: error.message || '명령을 실행하지 못했습니다.' };
    }
  }

  function forecast(state) {
    var checked = validateState(state);
    if (!checked.ok) return { ok: false, error: checked.error };
    var preview = clone(state);
    var start = state.dayIndex;
    var warnings = [];
    var todaySchedule = state.completed ? { work: [], completed: [] } : scheduleDay(clone(state));
    // Forecast never decides an intake. It projects only work already committed.
    while (!preview.completed) runDay(preview);
    var futureReports = preview.reports.slice(state.reports.length);
    var tasks = state.tasks.map(function (item) {
      var predicted = find(preview.tasks, item.id);
      var completion = predicted.completedDay;
      var status = item.completedDay !== null ? 'completed' : completion === null ? 'beyond_horizon' : completion <= item.dueDay ? 'on_time' : 'late';
      if (status === 'late' || status === 'beyond_horizon') warnings.push({ code: status, taskId: item.id,
        message: item.title + (status === 'late' ? '는 현재 배정으로 기한 이후 완료가 예상됩니다.' : '는 현재 배정으로 이번 주간 안에 완료되지 않습니다.') });
      if (!item.assignee && remaining(item) > 0) warnings.push({ code: 'unassigned', taskId: item.id, message: item.title + '의 담당자가 없습니다.' });
      return { taskId: item.id, title: item.title, assignee: item.assignee, dueDay: item.dueDay,
        remainingHours: remaining(item), predictedCompletionDay: completion,
        onTime: completion === null ? null : completion <= item.dueDay, status: status };
    });
    var today = state.staff.map(function (person) {
      var work = todaySchedule.work.filter(function (entry) { return entry.staffId === person.id; });
      var assigned = sum(state.tasks.filter(function (item) { return item.assignee === person.id; }).map(remaining));
      return { staffId: person.id, capacity: person.capacity, assignedRemainingHours: assigned,
        scheduledHours: sum(work.map(function (entry) { return entry.hours; })),
        cost: sum(work.map(function (entry) { return entry.cost; })), taskIds: work.map(function (entry) { return entry.taskId; }) };
    });
    if (state.intake.status === 'pending') warnings.unshift({ code: 'intake_pending', message: '신규 수임은 아직 미결정이므로 예측에서 제외했습니다.' });
    if (futureReports.some(function (report) { return report.cashAfter < 0; })) warnings.push({ code: 'cash_shortfall', message: '예정된 입출금과 업무비를 반영하면 현금이 부족해지는 날이 있습니다.' });
    return { ok: true, asOfDay: start, endDay: WORK_DAYS,
      assumptions: '현재 담당자·우선순위·정해진 작업시간이 유지되고 예정된 입금이 제때 들어오는 경우의 실험 예측입니다. 선행 업무가 끝나야 후속 업무를 시작하며 신규 의뢰·결근·추가 요청은 계산하지 않습니다. 법적 결과나 승률 예측이 아닙니다.',
      requiresIntakeDecision: state.intake.status === 'pending', intakeIncluded: state.intake.status === 'accepted',
      tasks: tasks, today: today, warnings: warnings,
      days: futureReports.map(function (report) { return { day: report.day, work: clone(report.work) }; }),
      totalPlannedCost: sum(futureReports.map(function (report) { return report.expenses; })),
      expectedIncome: sum(futureReports.map(function (report) { return report.income; })),
      projectedCash: preview.cash,
      outstandingReceivables: sum(preview.invoices.filter(function (invoice) { return invoice.status === 'unpaid'; }).map(function (invoice) { return invoice.amount; })) };
  }

  function validateState(raw) {
    function fail(message) { throw new Error(message); }
    function record(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
    function int(value, min, max) { return Number.isSafeInteger(value) && value >= min && value <= max; }
    function text(value, limit) { return typeof value === 'string' && value.length > 0 && value.length <= (limit || 2000); }
    function list(value, max) { return Array.isArray(value) && value.length <= max; }
    function unique(items, label) {
      var seen = new Set();
      items.forEach(function (item) { if (!record(item) || typeof item.id !== 'string' || !/^[a-z][a-z0-9_-]{0,99}$/.test(item.id) || seen.has(item.id)) fail(label + ' ID가 잘못되었거나 중복되었습니다.'); seen.add(item.id); });
    }
    try {
      if (!record(raw) || raw.schemaVersion !== 1 || raw.version !== VERSION) fail('지원하지 않는 저장 형식입니다.');
      if (!list(raw.dates, 6) || JSON.stringify(raw.dates) !== JSON.stringify(DATES)) fail('업무일 달력이 일치하지 않습니다.');
      if (!int(raw.dayIndex, 0, WORK_DAYS) || typeof raw.completed !== 'boolean' || raw.completed !== (raw.dayIndex === WORK_DAYS)) fail('진행 날짜 또는 마감 상태가 잘못되었습니다.');
      if (!int(raw.cash, -1000000000000, 1000000000000) || !int(raw.openingCash, 0, 1000000000000)) fail('현금 값이 잘못되었습니다.');
      if (!record(raw.intake) || !['pending', 'accepted', 'declined'].includes(raw.intake.status) || !text(raw.intake.client) ||
          !int(raw.intake.fee, 1, 1000000000) || !int(raw.intake.upfront, 1, 1000000000) || !int(raw.intake.balance, 1, 1000000000) ||
          raw.intake.fee !== raw.intake.upfront + raw.intake.balance || raw.intake.dueDay !== 4) fail('수임 조건이 잘못되었습니다.');
      if (raw.intake.status === 'pending' && raw.dayIndex > 0) fail('수임 미결정 상태에서는 업무일이 진행될 수 없습니다.');
      if (!list(raw.staff, 4) || raw.staff.length !== 4 || !list(raw.cases, 3) || raw.cases.length !== 3 || !list(raw.tasks, 7) || raw.tasks.length < 4) fail('인력·사건·업무 목록이 잘못되었습니다.');
      if (!list(raw.ledger, 100) || !list(raw.invoices, 3) || !list(raw.reports, WORK_DAYS) || !list(raw.events, 1000)) fail('기록 목록이 잘못되었습니다.');
      [raw.staff, raw.cases, raw.tasks, raw.ledger, raw.invoices, raw.reports, raw.events].forEach(function (items, i) { unique(items, ['인력', '사건', '업무', '원장', '청구', '보고', '이벤트'][i]); });
      if (['lee', 'kim', 'park', 'han'].some(function (id) { return !find(raw.staff, id); }) || ['jung', 'go', 'yoon'].some(function (id) { return !find(raw.cases, id); })) fail('필수 인력 또는 사건이 없습니다.');
      raw.staff.forEach(function (person) {
        if (!text(person.name, 100) || !text(person.specialty) || !ROLES.includes(person.role) || !int(person.capacity, 0, 24) || !int(person.hourlyCost, 0, 10000000)) fail('인력 설정이 잘못되었습니다.');
      });
      raw.cases.forEach(function (matter) {
        if (!text(matter.client, 100) || !text(matter.title) || !text(matter.summary) || !['active', 'pending', 'declined', 'ready'].includes(matter.status) || !int(matter.dueDay, 0, 4)) fail('사건 설정이 잘못되었습니다.');
      });
      var yoonTasks = raw.tasks.filter(function (item) { return item.caseId === 'yoon'; });
      if ((raw.intake.status === 'accepted' && yoonTasks.length !== 3) || (raw.intake.status !== 'accepted' && yoonTasks.length)) fail('수임 상태와 생성된 업무가 다릅니다.');
      raw.tasks.forEach(function (item) {
        if (!find(raw.cases, item.caseId) || !text(item.title) || !text(item.outputText) || !int(item.requiredHours, 1, 1000) || !int(item.doneHours, 0, item.requiredHours) || ![1, 2, 3].includes(item.priority) || !int(item.dueDay, 0, 4)) fail('업무 설정이 잘못되었습니다.');
        if (!list(item.roles, 2) || !item.roles.length || new Set(item.roles).size !== item.roles.length || item.roles.some(function (role) { return !ROLES.includes(role); })) fail('업무의 수행 직무가 잘못되었습니다.');
        if (item.assignee !== null) { var person = find(raw.staff, item.assignee); if (!person || !item.roles.includes(person.role)) fail('담당자 또는 직무가 맞지 않습니다.'); }
        if (!list(item.requires, 6) || new Set(item.requires).size !== item.requires.length || item.requires.some(function (id) { return id === item.id || !find(raw.tasks, id); })) fail('선행 업무 참조가 잘못되었습니다.');
        if (item.doneHours === item.requiredHours ? !int(item.completedDay, 0, raw.dayIndex - 1) : item.completedDay !== null) fail('수행량과 완료 날짜가 다릅니다.');
      });
      var visited = new Set(); var visiting = new Set();
      function visit(id) { if (visiting.has(id)) fail('선행 업무가 순환합니다.'); if (visited.has(id)) return; visiting.add(id); find(raw.tasks, id).requires.forEach(visit); visiting.delete(id); visited.add(id); }
      raw.tasks.forEach(function (item) { visit(item.id); });
      var expectedCases = clone(raw); updateCaseStatuses(expectedCases);
      if (raw.cases.some(function (matter) { return matter.status !== find(expectedCases.cases, matter.id).status; })) fail('사건 상태와 실제 준비 업무가 다릅니다.');
      var sources = new Set();
      raw.ledger.forEach(function (entry) {
        if (!int(entry.day, 0, raw.dayIndex - 1) || !['income', 'expense'].includes(entry.type) || !int(entry.amount, 0, 1000000000) || !text(entry.title) || !text(entry.sourceId, 200) || sources.has(entry.sourceId)) fail('입출금 원장이 잘못되었거나 중복 반영되었습니다.');
        sources.add(entry.sourceId);
      });
      var balance = raw.openingCash + sum(raw.ledger.map(function (entry) { return entry.type === 'income' ? entry.amount : -entry.amount; }));
      if (balance !== raw.cash) fail('현금과 입출금 원장이 일치하지 않습니다.');
      raw.invoices.forEach(function (invoice) {
        if (!find(raw.cases, invoice.caseId) || !int(invoice.amount, 1, 1000000000) || !int(invoice.dueDay, 0, 5) || !text(invoice.title) || !['unpaid', 'paid'].includes(invoice.status)) fail('청구 정보가 잘못되었습니다.');
        var payments = raw.ledger.filter(function (entry) { return entry.type === 'income' && entry.sourceId === invoice.id; });
        if (invoice.status === 'paid') {
          if (!int(invoice.paidDay, invoice.dueDay, raw.dayIndex - 1) || payments.length !== 1 || payments[0].amount !== invoice.amount || payments[0].day !== invoice.paidDay) fail('입금 기록과 청구 상태가 다릅니다.');
        } else if (invoice.paidDay !== null || payments.length) fail('미입금 청구에 입금 기록이 있습니다.');
      });
      if (raw.ledger.some(function (entry) { return entry.type === 'income' && !find(raw.invoices, entry.sourceId); })) fail('청구 근거 없는 입금이 있습니다.');
      if (!find(raw.invoices, 'invoice-existing')) fail('기존 미수금 기록이 없습니다.');
      if (raw.intake.status === 'accepted' ? !find(raw.invoices, 'invoice-yoon-upfront') : raw.invoices.some(function (invoice) { return invoice.caseId === 'yoon'; })) fail('수임 상태와 착수금 청구가 다릅니다.');
      var brief = find(raw.tasks, 'yoon-brief');
      var finalInvoice = find(raw.invoices, 'invoice-yoon-balance');
      if (!!finalInvoice !== !!(brief && brief.completedDay !== null) || (finalInvoice && (finalInvoice.dueDay !== brief.completedDay + 1 || finalInvoice.amount !== raw.intake.balance))) fail('준비 보고 완료 전에는 잔금을 청구할 수 없습니다.');
      if (raw.reports.length !== raw.dayIndex) fail('진행 날짜와 일일 보고 수가 다릅니다.');
      var performed = {}; raw.tasks.forEach(function (item) { performed[item.id] = 0; });
      var cashBefore = raw.openingCash;
      raw.reports.forEach(function (report, day) {
        if (report.day !== day || !text(report.title) || !text(report.summary) || !list(report.work, 7) || !list(report.completed, 7) || !list(report.lateTasks, 7)) fail('업무 보고 형식이 잘못되었습니다.');
        var used = {}; raw.staff.forEach(function (person) { used[person.id] = 0; });
        report.work.forEach(function (entry) {
          var item = find(raw.tasks, entry.taskId); var person = find(raw.staff, entry.staffId);
          if (!item || !person || !item.roles.includes(person.role) || !int(entry.hours, 1, 24) || entry.cost !== entry.hours * person.hourlyCost) fail('실제 작업 기록이 잘못되었습니다.');
          if (item.requires.some(function (id) { return performed[id] < find(raw.tasks, id).requiredHours; })) fail('선행 업무 완료 전에 후속 업무가 수행되었습니다.');
          used[person.id] += entry.hours; performed[item.id] += entry.hours;
          if (used[person.id] > person.capacity || performed[item.id] > item.requiredHours) fail('실제 작업량이 가용시간 또는 업무 요구량을 넘습니다.');
          var expense = raw.ledger.find(function (line) { return line.sourceId === 'work:' + day + ':' + item.id + ':' + person.id; });
          if (!expense || expense.type !== 'expense' || expense.day !== day || expense.amount !== entry.cost) fail('수행 기록과 업무비가 다릅니다.');
        });
        var dayLedger = raw.ledger.filter(function (entry) { return entry.day === day; });
        var operating = dayLedger.filter(function (entry) { return entry.sourceId === 'operating:' + day && entry.type === 'expense'; });
        if (operating.length !== 1 || operating[0].amount !== OPERATING_COST || dayLedger.filter(function (entry) { return entry.type === 'expense'; }).length !== report.work.length + 1) fail('일일 운영비 또는 업무비가 중복·누락되었습니다.');
        var income = sum(dayLedger.filter(function (entry) { return entry.type === 'income'; }).map(function (entry) { return entry.amount; }));
        var expenses = sum(dayLedger.filter(function (entry) { return entry.type === 'expense'; }).map(function (entry) { return entry.amount; }));
        if (report.income !== income || report.expenses !== expenses || report.cashBefore !== cashBefore || report.cashAfter !== cashBefore + income - expenses) fail('일일 보고의 현금 합계가 다릅니다.');
        cashBefore = report.cashAfter;
        var completed = raw.tasks.filter(function (item) { return item.completedDay === day; }).map(function (item) { return item.id; }).sort(order);
        if (JSON.stringify(report.completed.slice().sort(order)) !== JSON.stringify(completed)) fail('완료 보고와 업무 완료 상태가 다릅니다.');
        var late = raw.tasks.filter(function (item) { return item.dueDay <= day && performed[item.id] < item.requiredHours; }).map(function (item) { return item.id; }).sort(order);
        if (JSON.stringify(report.lateTasks.slice().sort(order)) !== JSON.stringify(late)) fail('기한 보고와 실제 수행 내역이 다릅니다.');
      });
      if (raw.tasks.some(function (item) { return performed[item.id] !== item.doneHours; })) fail('누적 업무량과 일일 수행 기록이 다릅니다.');
      raw.events.forEach(function (entry) { if (!int(entry.day, 0, raw.dayIndex) || !text(entry.title) || !text(entry.detail)) fail('이벤트 기록이 잘못되었습니다.'); });
      return { ok: true };
    } catch (error) { return { ok: false, error: error.message || '저장 데이터를 검증할 수 없습니다.' }; }
  }

  function exportSnapshot(state) {
    var checked = validateState(state);
    if (!checked.ok) throw new Error(checked.error);
    return clone(state);
  }

  return { createInitialState: createInitialState, command: command, forecast: forecast,
    validateState: validateState, exportSnapshot: exportSnapshot };
});
