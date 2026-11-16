#!/usr/bin/env node
'use strict';
// Replay policies call the shipped engine; this file does not model scheduling or money.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const enginePath = path.resolve(root, opt('--engine', 'src/engine.js'));
const prefix = path.resolve(root, opt('--out', 'docs/play-experiments'));
const E = require(enginePath);
const copy = value => JSON.parse(JSON.stringify(value));
const sum = values => values.reduce((total, value) => total + value, 0);
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
let assertions = 0;
function check(condition, message) { assert.ok(condition, message); assertions++; }
function equal(actual, expected, message) { assert.deepEqual(actual, expected, message); assertions++; }
function valid(state, context) { const result = E.validateState(state); check(result.ok, context + ': ' + (result.error || '')); }
function command(state, action, trace) {
  const before = JSON.stringify(state);
  const result = E.command(state, action);
  check(result.ok, action.type + ': ' + (result.error || ''));
  equal(JSON.stringify(state), before, 'command must not mutate input');
  valid(result.state, action.type);
  if (trace) trace.push({ day: state.dayIndex, ...action });
  return result.state;
}
function finish(state) { while (!state.completed) state = command(state, { type: 'ADVANCE_DAY' }); return state; }
function plan(state, assignments, trace) {
  for (const [taskId, staffId] of assignments) {
    const task = state.tasks.find(item => item.id === taskId);
    if (task && task.completedDay === null) state = command(state, { type: 'ASSIGN_TASK', taskId, staffId }, trace);
  }
  return state;
}
function priorities(state, pick, trace) {
  for (const task of state.tasks.filter(item => item.completedDay === null)) {
    state = command(state, { type: 'SET_PRIORITY', taskId: task.id, priority: pick(task) }, trace);
  }
  return state;
}
// Seven explicit policies from the October 25 audit plus one cheaper handoff policy.
// Handoffs are scripted actions,
// not secretly included in the engine's frozen-plan forecast.
const strategies = [
  { id: 'decline_default', label: '신규 거절·기본 배정', accept: false },
  { id: 'accept_default', label: '신규 수락·기본 배정', accept: true },
  { id: 'accept_concentrated_cheap', label: '저비용 직원 집중', accept: true,
    setup: (state, trace) => plan(state, state.tasks.map(task => [task.id, 'park']), trace) },
  { id: 'accept_distributed', label: '고정 분산', accept: true,
    setup(state, trace) {
      state = plan(state, [['yoon-collect', 'kim'], ['yoon-review', 'lee'], ['yoon-brief', 'park']], trace);
      return command(state, { type: 'SET_PRIORITY', taskId: 'yoon-review', priority: 1 }, trace);
    } },
  { id: 'accept_deadline_handoff', label: '기한 준수 인계', accept: true,
    setup: (state, trace) => plan(state, [['jung-organize', 'kim'], ['go-memo', 'lee'], ['yoon-collect', 'park'], ['yoon-brief', 'kim']], trace),
    beforeDay(state, trace) {
      if (state.dayIndex === 1) return plan(state, [['jung-organize', 'park']], trace);
      if (state.dayIndex === 2) return plan(state, [['go-memo', 'park']], trace);
      return state;
    } },
  { id: 'accept_deadline_priority', label: '분산·마감 우선', accept: true,
    setup: (state, trace) => plan(state, [['yoon-collect', 'kim'], ['yoon-review', 'lee'], ['yoon-brief', 'park']], trace),
    beforeDay: (state, trace) => priorities(state, task => task.dueDay <= state.dayIndex + 1 ? 1 : task.dueDay <= state.dayIndex + 2 ? 2 : 3, trace) },
  { id: 'accept_reward_priority', label: '분산·신규 보수 우선', accept: true,
    setup: (state, trace) => plan(state, [['yoon-collect', 'kim'], ['yoon-review', 'lee'], ['yoon-brief', 'park']], trace),
    beforeDay: (state, trace) => priorities(state, task => task.caseId === 'yoon' ? 1 : 3, trace) },
  { id: 'accept_cash_safe_handoff', label: '절약형 기한 준수 인계', accept: true,
    setup: (state, trace) => plan(state, [['jung-organize', 'kim'], ['go-memo', 'lee'], ['yoon-brief', 'kim']], trace),
    beforeDay(state, trace) {
      if (state.dayIndex === 1) return plan(state, [['jung-organize', 'park']], trace);
      if (state.dayIndex === 2) return plan(state, [['go-memo', 'park']], trace);
      return state;
    } }
];
const scenarios = [
  { id: 'original', label: '원본 규칙·원본 현금', options: null },
  { id: 'refund_25', label: '미이행 착수금 25% 환급', options: { experiment: 'commitment-v1', refundPercent: 25, openingCash: 18200000 } },
  { id: 'refund_50', label: '미이행 착수금 50% 환급', options: { experiment: 'commitment-v1', refundPercent: 50, openingCash: 18200000 } },
  { id: 'refund_100', label: '미이행 착수금 100% 환급', options: { experiment: 'commitment-v1', refundPercent: 100, openingCash: 18200000 } },
  { id: 'cash_200k_refund_50', label: '현금 20만원·환급 50%', options: { experiment: 'commitment-v1', refundPercent: 50, openingCash: 200000 } },
  { id: 'cash_600k_refund_50', label: '현금 60만원·환급 50%', options: { experiment: 'commitment-v1', refundPercent: 50, openingCash: 600000 } },
  { id: 'capacity_minus1_refund_50', label: '각 직원 가용시간 −1h·환급 50%', options: { experiment: 'commitment-v1', refundPercent: 50, openingCash: 18200000 }, capacityDelta: -1 },
  { id: 'refund_0_control', label: '환급 0%·원본 대조군', options: { experiment: 'commitment-v1', refundPercent: 0, openingCash: 18200000 }, control: true }
];
function initial(scenario) {
  const state = scenario.options ? E.createInitialState(scenario.options) : E.createInitialState();
  if (scenario.capacityDelta) for (const person of state.staff) person.capacity += scenario.capacityDelta;
  valid(state, scenario.id + ' initial');
  const original = E.createInitialState();
  equal(state.intake, original.intake, 'contract fee and split remain unchanged');
  equal(state.tasks, original.tasks, 'original task hours and deadlines remain unchanged');
  equal(state.staff.map(person => person.hourlyCost), original.staff.map(person => person.hourlyCost), 'original hourly costs remain unchanged');
  return state;
}
function measure(state, scenario, strategy, initialHash, trace) {
  const summary = E.summarize(state);
  const work = state.reports.flatMap(report => report.work);
  const lateIds = [...new Set(state.reports.flatMap(report => report.lateTasks))].sort();
  const hours = sum(work.map(entry => entry.hours));
  const staffHours = Object.fromEntries(state.staff.map(person => [person.id, sum(work.filter(entry => entry.staffId === person.id).map(entry => entry.hours))]));
  const refundEntries = state.ledger.filter(entry => entry.sourceId === 'contract-refund:yoon');
  equal(summary.cash, state.cash, 'summary uses actual cash');
  equal(summary.receivables, sum(state.invoices.filter(invoice => invoice.status === 'unpaid').map(invoice => invoice.amount)), 'only issued invoices are receivables');
  equal(summary.cashAndReceivables, summary.cash + summary.receivables, 'cash plus receivables');
  equal(summary.minimumCash, Math.min(state.openingCash, ...state.reports.map(report => report.cashAfter)), 'minimum includes actual processed days');
  equal(summary.negativeCashDays, state.reports.filter(report => report.cashAfter < 0).length, 'negative days count actual closes');
  equal(summary.lateTasks, lateIds.length, 'late tasks count distinct task IDs');
  equal(summary.refundPaid, sum(refundEntries.map(entry => entry.amount)), 'refund is reflected in actual ledger');
  check(refundEntries.length <= 1, 'contract refund can be paid at most once');
  return {
    scenario: scenario.id, strategy: strategy.id, label: strategy.label, control: !!scenario.control,
    opening_cash: state.openingCash, final_cash: summary.cash, unpaid_invoices: summary.receivables,
    cash_plus_unpaid_invoices: summary.cashAndReceivables,
    minimum_day_end_cash: summary.minimumCash, negative_cash_days: summary.negativeCashDays,
    ready_cases: summary.readyCases, active_cases: summary.activeCases,
    incomplete_cases: summary.activeCases - summary.readyCases,
    completed_tasks: summary.completedTasks, total_tasks: summary.totalTasks,
    late_distinct_tasks: summary.lateTasks, late_task_days: sum(state.reports.map(report => report.lateTasks.length)),
    remaining_hours: summary.remainingHours, worked_hours: hours,
    unused_capacity_hours: sum(state.staff.map(person => person.capacity * 5)) - hours,
    refund_paid: summary.refundPaid,
    income: sum(state.ledger.filter(entry => entry.type === 'income').map(entry => entry.amount)),
    expenses: sum(state.ledger.filter(entry => entry.type === 'expense').map(entry => entry.amount)),
    goal_all_prepared: summary.readyCases === summary.activeCases,
    goal_all_on_time: summary.completedTasks === summary.totalTasks && summary.lateTasks === 0,
    goal_cash_nonnegative: summary.minimumCash >= 0,
    lee_hours: staffHours.lee, kim_hours: staffHours.kim, park_hours: staffHours.park, han_hours: staffHours.han,
    initial_state_sha256: initialHash, final_state_sha256: hash(state),
    late_task_ids: lateIds.join('|'),
    task_completion_days: Object.fromEntries(state.tasks.map(task => [task.id, task.completedDay])),
    action_trace: trace, day_reports: state.reports
  };
}
function execute(scenario, strategy, verify) {
  let state = initial(scenario);
  const initialHash = hash(state), trace = [];
  state = command(state, { type: strategy.accept ? 'ACCEPT_INTAKE' : 'DECLINE_INTAKE' }, trace);
  if (strategy.setup) state = strategy.setup(state, trace);
  while (!state.completed) {
    if (strategy.beforeDay) state = strategy.beforeDay(state, trace);
    if (verify) {
      const before = JSON.stringify(state);
      const prediction = E.forecast(state);
      check(prediction.ok, 'forecast must succeed');
      equal(JSON.stringify(state), before, 'forecast must not mutate state');
      const frozenActual = finish(copy(state));
      equal(prediction.projectedCash, frozenActual.cash, 'forecast cash matches frozen-plan execution');
      equal(prediction.summary, E.summarize(frozenActual), 'forecast summary matches frozen-plan execution');
      equal(prediction.projectedRefund, E.summarize(frozenActual).refundPaid - E.summarize(state).refundPaid, 'forecast counts only future refunds');
      equal(prediction.days, frozenActual.reports.slice(state.dayIndex).map(report => ({ day: report.day, work: report.work })), 'forecast work matches actual work');
      const restored = JSON.parse(JSON.stringify(E.exportSnapshot(state)));
      valid(restored, 'round-trip snapshot');
      equal(E.command(state, { type: 'ADVANCE_DAY' }), E.command(restored, { type: 'ADVANCE_DAY' }), 'restored next day must match');
    }
    state = command(state, { type: 'ADVANCE_DAY' }, trace);
  }
  const finishedBefore = JSON.stringify(state);
  const refused = E.command(state, { type: 'ADVANCE_DAY' });
  check(!refused.ok && refused.state === state, 'sixth execution day rejected');
  equal(JSON.stringify(state), finishedBefore, 'rejected extra day does not refund or pay again');
  const restored = E.exportSnapshot(state);
  valid(restored, 'finished snapshot including refund');
  equal(E.summarize(restored), E.summarize(state), 'finished summary survives restoration');
  return measure(state, scenario, strategy, initialHash, trace);
}
const rows = [];
for (const scenario of scenarios) {
  for (const strategy of strategies) {
    const row = execute(scenario, strategy, true);
    equal(row, execute(scenario, strategy, false), scenario.id + '/' + strategy.id + ' deterministic replay');
    rows.push(row);
  }
  equal(new Set(rows.filter(row => row.scenario === scenario.id).map(row => row.initial_state_sha256)).size, 1, 'same starting state for every strategy in condition');
}
const originalRows = rows.filter(row => row.scenario === 'original');
const baselinePath = path.join(root, 'docs/audit-strategies-baseline.json');
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const priorEnginePath = path.join(root, 'tests/fixtures/engine-before-audit.cjs');
const priorEngine = require(priorEnginePath);
for (const original of originalRows) {
  const previous = baseline.rows.find(row => row.scenario === 'original' && row.strategy === original.strategy);
  if (previous) {
    for (const key of ['final_cash', 'unpaid_invoices', 'ready_cases', 'completed_tasks', 'late_distinct_tasks', 'minimum_day_end_cash', 'negative_cash_days', 'worked_hours', 'initial_state_sha256', 'final_state_sha256', 'action_trace', 'day_reports']) {
      equal(original[key], previous[key], 'original strategy baseline unchanged: ' + original.strategy + '/' + key);
    }
  } else {
    equal(original.strategy, 'accept_cash_safe_handoff', 'only newly added policy lacks an old CSV row');
    let historical = priorEngine.createInitialState();
    equal(hash(historical), original.initial_state_sha256, 'new policy old-engine initial state matches');
    for (const recorded of original.action_trace) {
      const { day, ...action } = recorded;
      equal(historical.dayIndex, day, 'new policy old-engine action day matches');
      const result = priorEngine.command(historical, action);
      check(result.ok, 'new policy command succeeds on original engine');
      historical = result.state;
    }
    equal(hash(historical), original.final_state_sha256, 'new policy final state matches original engine');
    equal(historical.reports, original.day_reports, 'new policy day reports match original engine');
  }
  const zero = rows.find(row => row.scenario === 'refund_0_control' && row.strategy === original.strategy);
  for (const key of ['final_cash', 'unpaid_invoices', 'ready_cases', 'completed_tasks', 'late_distinct_tasks', 'minimum_day_end_cash', 'negative_cash_days', 'worked_hours', 'refund_paid', 'action_trace', 'day_reports']) {
    equal(zero[key], original[key], 'zero-percent control unchanged: ' + original.strategy + '/' + key);
  }
  for (const scenarioId of ['refund_25', 'refund_50', 'refund_100']) {
    const changed = rows.find(row => row.scenario === scenarioId && row.strategy === original.strategy);
    equal(changed.final_cash, original.final_cash - changed.refund_paid, 'contract rule changes cash only by actual refund');
    for (const key of ['unpaid_invoices', 'ready_cases', 'completed_tasks', 'late_distinct_tasks', 'worked_hours', 'task_completion_days']) equal(changed[key], original[key], 'refund does not rewrite work outcomes');
  }
}
const playableCashRoute = rows.find(row => row.scenario === 'cash_600k_refund_50' && row.strategy === 'accept_cash_safe_handoff');
equal([playableCashRoute.goal_all_prepared, playableCashRoute.goal_all_on_time, playableCashRoute.goal_cash_nonnegative, playableCashRoute.minimum_day_end_cash, playableCashRoute.refund_paid], [true, true, true, 26000, 0], 'selectable cash challenge has a verified route meeting all three goals');
const columns = Object.keys(rows[0]).filter(key => !['task_completion_days', 'action_trace', 'day_reports'].includes(key));
const quote = value => '"' + String(value).replaceAll('"', '""') + '"';
const csv = [columns, ...rows.map(row => columns.map(key => row[key]))].map(row => row.map(quote).join(',')).join('\n') + '\n';
const metadata = {
  engine_path: path.relative(root, enginePath).replaceAll('\\', '/'), engine_sha256: hash(fs.readFileSync(enginePath)),
  original_state_version: E.createInitialState().version,
  experiment_state_version: E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50 }).version,
  calendar: E.createInitialState().dates, random_source: 'none', seed: null,
  scenarios, strategies: strategies.map(({ id, label, accept }) => ({ id, label, accept })),
  scope: 'Five execution days; two existing cases and one optional intake. Ready means preparation completed, not legal victory or closure.',
  fixture_boundary: 'Original fees, hourly costs, task hours and deadlines unchanged. Refund percentages are separately authored experiment settings. Opening cash 600k is a selectable challenge; 200k and reduced capacity are stress fixtures, not ordinary actions.',
  forecast_boundary: 'Forecast uses unchanged assignments from each decision point; later scripted handoffs are not promised by the preview.',
  outcome_boundary: 'Measured financial/work consequences, not human enjoyment. Policies are selected examples, not exhaustive optimization.',
  baseline_comparison: { path: 'docs/audit-strategies-baseline.json', identical_original_strategies: 7, new_policy_original_engine_replay: 1, original_engine_sha256: hash(fs.readFileSync(priorEnginePath)), compared: 'initial/final state hashes, actual day reports, command traces, and key outcomes' },
  runs: rows.length, reruns: rows.length, main_comparisons: rows.filter(row => !row.control).length, zero_refund_controls: rows.filter(row => row.control).length,
  checks: assertions, failures: 0, rows
};
fs.mkdirSync(path.dirname(prefix), { recursive: true });
fs.writeFileSync(prefix + '.csv', '\ufeff' + csv);
fs.writeFileSync(prefix + '.json', JSON.stringify(metadata, null, 2) + '\n');
const won = amount => amount.toLocaleString('ko-KR') + '원';
const table = scenarioId => rows.filter(row => row.scenario === scenarioId).map(row => `| ${row.label} | ${won(row.final_cash)} | ${won(row.unpaid_invoices)} | ${row.ready_cases}/${row.active_cases} | ${row.completed_tasks}/${row.total_tasks} | ${row.late_distinct_tasks} | ${won(row.refund_paid)} | ${won(row.minimum_day_end_cash)} | ${row.negative_cash_days} |`).join('\n');
const headings = '| 전략 | 마감 현금 | 확정 미수 | 준비 사건 | 완료 업무 | 지연 업무 | 환급 | 최저 현금 | 적자일 |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|';
const rowFor = (scenario, strategy) => rows.find(row => row.scenario === scenario && row.strategy === strategy);
const concentrated = rowFor('refund_50', 'accept_concentrated_cheap');
const distributed = rowFor('refund_50', 'accept_distributed');
const handoff = rowFor('refund_50', 'accept_deadline_handoff');
const safeHandoff = rowFor('cash_600k_refund_50', 'accept_cash_safe_handoff');
const originalConcentrated = rowFor('original', 'accept_concentrated_cheap');
const originalDistributed = rowFor('original', 'accept_distributed');
const markdown = `# THE FIRM · 계약 책임과 재도전 실험\n\n2026-10-27 · 실제 \`src/engine.js\` 호출. 원본 수치의 교체가 아닌 별도 실험 설정이다.\n\n## 재실행\n\n\`node tools/play-experiments.cjs\`\n\n기본 의존성은 Node 표준 라이브러리뿐이다. CSV/JSON/로그/이 문서를 같은 명령으로 갱신한다. \`--out docs/다른이름\`으로 출력 접두어를 바꿀 수 있다.\n\n## 실행 조건과 검증\n\n- 8개 정책 × 7개 주 실험 조건 = 56회, 환급 0% 대조 8회: 총 **${rows.length}회 + ${rows.length}회 동일 재실행**. **${assertions.toLocaleString('ko-KR')}개 검증, 실패 0**.\n- 조건마다 모든 전략이 같은 초기 상태에서 출발한다. 초기·최종 SHA-256, 명령 trace, 일일 보고는 JSON에 있다. 난수·현재 시간 의존 없음, seed는 null.\n- 원본 7개 전략은 이전 감사 결과의 초기·최종 상태 hash, 실제 보고, 명령 trace 및 경제·완료 지표와 일치한다. 추가 절약형 인계 1개는 보존한 원본 엔진에 같은 명령을 재생해 초기·최종 상태 및 보고가 일치함을 확인했다. 환급 0% 대조군도 원본과 경제·수행 결과가 같다.\n- 각 결정 지점에서 실제 엔진의 forecast를 배정 고정 실행과 비교한다. 예측·명령의 입력 불변, 저장 복원 후 다음 날 결과, 종료 후 추가 날짜 거부, 환급 단일 지급을 검사했다.\n- 원본 보수·업무비·업무량·마감은 유지했다. 가용시간 감소는 스트레스용 초기 입력이며 일상 플레이에서 누르는 행동이 아니다.\n\n## 원본 규칙\n\n${headings}\n${table('original')}\n\n## 착수금 50% 환급 실험\n\n윤지훈의 준비 보고가 계약 기한 종료까지 끝나지 않은 경우에만 착수금의 50%, 원본 계약 기준 120만원을 한 번 환급한다. 만기 당일 완료하면 환급하지 않는다. 거절한 계약에는 환급이 없고 과거 업무 미수금 450만원도 취소하지 않는다. 다른 사건의 지연에는 새 경제 효과를 붙이지 않았다.\n\n${headings}\n${table('refund_50')}\n\n## 직접 관찰한 변화\n\n- 저비용 집중은 원본에서 분산보다 현금이 ${won(originalConcentrated.final_cash - originalDistributed.final_cash)} 높았다. 50% 환급에서는 집중이 ${won(concentrated.refund_paid)}를 환급하여, 분산의 현금이 ${won(distributed.final_cash - concentrated.final_cash)} 더 높아졌다. **비교한 이 두 경로의 현금 순위가 바뀌었다.**\n- 환급은 준비를 끝내지 못한 계약에만 걸린다. 분산의 준비 3건 완료·지연 3개와, 기한 준수 인계의 준비 3건 완료·지연 0개 사이의 선택은 남는다. 현금과 확정 미수를 합치면 두 전략의 차이는 ${won(distributed.cash_plus_unpaid_invoices - handoff.cash_plus_unpaid_invoices)}다.\n- 무료 인계 경로는 새 규칙에서도 모든 준비 업무를 기한 내 완료하며 환급이 없다. 이 사실은 인계가 유효한 조정 수단임을 보여주지만 플레이가 즐겁다는 증명은 아니다.\n- 25%·50%·100%는 강도를 비교하는 실험값이다. 50%가 최적이라고 확정하지 않았으며, 한 계약만 평가하는 5일 실험을 장기 경제 균형으로 일반화하지 않는다.\n\n## 현금 60만원 도전 — 실제 선택 가능\n\n${headings}\n${table('cash_600k_refund_50')}\n\n새 절약형 인계는 윤지훈 자료 취합을 한도윤에게 유지하고, 정민호 자료 정리와 고은아 조사 메모만 시점에 맞춰 인계한다. 첫날 57.4만원을 지출해 최저 현금 ${won(safeHandoff.minimum_day_end_cash)}을 남기며, 준비 ${safeHandoff.ready_cases}/${safeHandoff.active_cases}건·지연 ${safeHandoff.late_distinct_tasks}개·적자 ${safeHandoff.negative_cash_days}일을 달성했다. 비싼 직원을 모든 일에 투입할 필요가 없음을 같은 엔진으로 확인했다. 새 규칙이 만들지 않아도 원래 존재했던 경로이며 전역 최적해를 뜻하지 않는다.\n\n## 현금 20만원 스트레스 — UI 도전과 구분\n\n${headings}\n${table('cash_200k_refund_50')}\n\n비교한 8개 경로 모두 기간 중 적자가 났다. 적자가 난 경로도 자동 파산시키지 않는다. 시작 현금 20만원에서는 모든 기한 준수와 무적자의 동시 달성이 불가능하다. 자료 정리 8h를 day1까지 끝내려면 day0에 변호사 최소 4h가 필요하고, 가장 저렴한 업무비 16만원에 운영비 16만원을 더하면 첫날에 최소 32만원이 필요하기 때문이다. 이 입력을 도전으로 제공한다면 모든 목표를 동시에 달성할 수 있다고 표현해서는 안 된다. 현금 부족 경고를 읽고 대응 선택을 고민하는지 사람 플레이 확인이 필요하다. 기간 중 최저 현금은 시작 현금과 처리한 각 업무일의 마감 현금 중 최솟값이며, 하루 안의 순간 잔액을 뜻하지 않는다.\n\n## 가용시간 감소 스트레스\n\n${headings}\n${table('capacity_minus1_refund_50')}\n\n각 직원 하루 가용시간을 1h씩 줄인 입력이다. 검증된 경로들의 준비 완료 여부는 위 표와 같다. 수락 경로 모두 같은 120만원을 환급하므로 저비용 집중의 현금이 분산보다 다시 높다. 환급 하나로 모든 조건의 미이행 유인을 해결한 것은 아니다. 다른 모든 배정을 탐색했다는 뜻은 아니며, 받아들인 업무량과 전체 가용시간, 선행 관계를 구분해 해석한다.\n\n## 다음 사람 플레이 판정\n\n1. 수임 전에 계약 보수와 미이행 환급을 자신의 말로 설명할 수 있는가.\n2. 배정 변경으로 빨라지는 일과 밀리는 일을 예측 비교에서 찾을 수 있는가.\n3. 무료 인계가 상황을 풀어내는 선택인지, 반복 클릭으로 느껴지는지 확인한다.\n4. 현금·미수·기한·준비 상태를 보고 다음 시도에서 바꿀 행동 하나를 설명할 수 있는가.\n\n이 검증은 규칙의 일관성과 선택의 결과를 측정했다. 사용자 플레이 테스트, 장기 고객 관계, 평판, 급여, 재판 결과는 검증하지 않았다.\n`;
fs.writeFileSync(prefix + '.md', markdown.replaceAll('\`', '`'));
const log = `PASS: ${rows.length} runs + ${rows.length} deterministic reruns; ${assertions} assertions; 0 failures\nMain comparison rows: 56; zero-refund controls: 8\nOriginal 7 strategies match audited state hashes, reports, traces and metrics; added policy matches original-engine replay\nEngine SHA-256: ${metadata.engine_sha256}\nRandom source: none; seed: null\n`;
fs.writeFileSync(prefix + '.log', log);
console.log(log.trim());
console.table(rows.filter(row => row.scenario === 'refund_50').map(row => ({ strategy: row.strategy, cash: row.final_cash, receivables: row.unpaid_invoices, ready: `${row.ready_cases}/${row.active_cases}`, late: row.late_distinct_tasks, refund: row.refund_paid, minimum: row.minimum_day_end_cash })));
