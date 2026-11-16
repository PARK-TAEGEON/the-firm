#!/usr/bin/env node
'use strict';
// Calls the shipped engine directly. No alternate scheduling or economic model.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
function option(name, fallback) { const i = argv.indexOf(name); return i < 0 ? fallback : argv[i + 1]; }
const enginePath = path.resolve(root, option('--engine', 'src/engine.js'));
const prefix = path.resolve(root, option('--out', 'docs/audit-strategies'));
const E = require(enginePath);
const copy = x => JSON.parse(JSON.stringify(x));
const sum = xs => xs.reduce((a, b) => a + b, 0);
const hash = x => crypto.createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x)).digest('hex');
let assertions = 0;
function check(value, message) { assert.ok(value, message); assertions++; }
function valid(s, label) { const v = E.validateState(s); check(v.ok, `${label}: ${v.error || ''}`); }
function command(s, action, trace) {
  const before = JSON.stringify(s);
  const result = E.command(s, action);
  check(result.ok, `${action.type}: ${result.error || ''}`);
  check(JSON.stringify(s) === before, 'command mutated its input');
  valid(result.state, action.type);
  if (trace) trace.push({ day: s.dayIndex, ...action });
  return result.state;
}
function finish(s) { while (!s.completed) s = command(s, { type: 'ADVANCE_DAY' }); return s; }
function applyPlan(s, changes, trace) {
  for (const [taskId, staffId] of changes) {
    const t = s.tasks.find(t => t.id === taskId);
    if (t && t.completedDay === null) s = command(s, { type: 'ASSIGN_TASK', taskId, staffId }, trace);
  }
  return s;
}
function priorities(s, decide, trace) {
  for (const t of s.tasks.filter(t => t.completedDay === null)) {
    s = command(s, { type: 'SET_PRIORITY', taskId: t.id, priority: decide(t) }, trace);
  }
  return s;
}
const strategies = [
  { id: 'decline_default', label: '선별 수임: 신규 거절·기본 배정', accept: false },
  { id: 'accept_default', label: '수임 확대: 신규 수락·기본 배정', accept: true },
  { id: 'accept_concentrated_cheap', label: '신규 수락·박서윤에게 모든 업무 집중', accept: true,
    setup: (s, trace) => applyPlan(s, s.tasks.map(t => [t.id, 'park']), trace) },
  { id: 'accept_distributed', label: '신규 수락·고정 분산 배정', accept: true,
    setup(s, trace) {
      s = applyPlan(s, [['yoon-collect', 'kim'], ['yoon-review', 'lee'], ['yoon-brief', 'park']], trace);
      return command(s, { type: 'SET_PRIORITY', taskId: 'yoon-review', priority: 1 }, trace);
    } },
  { id: 'accept_deadline_handoff', label: '신규 수락·기한 준수 인계 경로', accept: true,
    setup: (s, trace) => applyPlan(s, [['jung-organize', 'kim'], ['go-memo', 'lee'], ['yoon-collect', 'park'], ['yoon-brief', 'kim']], trace),
    beforeDay(s, trace) {
      if (s.dayIndex === 1) return applyPlan(s, [['jung-organize', 'park']], trace);
      if (s.dayIndex === 2) return applyPlan(s, [['go-memo', 'park']], trace);
      return s;
    } },
  { id: 'accept_deadline_priority', label: '분산 배정·마감 우선순위', accept: true,
    setup: (s, trace) => applyPlan(s, [['yoon-collect', 'kim'], ['yoon-review', 'lee'], ['yoon-brief', 'park']], trace),
    beforeDay: (s, trace) => priorities(s, t => t.dueDay <= s.dayIndex + 1 ? 1 : t.dueDay <= s.dayIndex + 2 ? 2 : 3, trace) },
  { id: 'accept_reward_priority', label: '분산 배정·신규 보수 우선순위', accept: true,
    setup: (s, trace) => applyPlan(s, [['yoon-collect', 'kim'], ['yoon-review', 'lee'], ['yoon-brief', 'park']], trace),
    beforeDay: (s, trace) => priorities(s, t => t.caseId === 'yoon' ? 1 : 3, trace) }
];
// Fixtures change only fields already accepted by validateState, before execution.
// They are imported scenario experiments, never ordinary in-game actions or default edits.
const scenarios = [
  { id: 'original', label: '원본 수치', overrides: {} },
  { id: 'cash_200k', label: '초기 현금 20만원', overrides: { openingCash: 200000 } },
  { id: 'capacity_minus1', label: '각 담당자 하루 가용시간 1시간 감소', overrides: { capacityDelta: -1 } },
  { id: 'deadlines_day2', label: '모든 업무 기한을 day2 이내로 집중', overrides: { taskDueCap: 2 } },
  { id: 'hourly_cost_75pct', label: '시간당 업무비 75%', overrides: { hourlyCostFactor: 0.75 } },
  { id: 'hourly_cost_150pct', label: '시간당 업무비 150%', overrides: { hourlyCostFactor: 1.5 } },
  { id: 'fee_50pct', label: '신규 보수 50%', overrides: { intakeFeeFactor: 0.5 } },
  { id: 'fee_150pct', label: '신규 보수 150%', overrides: { intakeFeeFactor: 1.5 } },
  { id: 'hours_75pct', label: '요구 업무시간 75%·올림', overrides: { requiredHoursFactor: 0.75 } },
  { id: 'hours_125pct', label: '요구 업무시간 125%·올림', overrides: { requiredHoursFactor: 1.25 } }
];
function configuredInitial(sc) {
  const s = E.createInitialState(); const o = sc.overrides;
  if (o.openingCash !== undefined) s.cash = s.openingCash = o.openingCash;
  for (const p of s.staff) {
    if (o.capacityDelta) p.capacity += o.capacityDelta;
    if (o.hourlyCostFactor) p.hourlyCost = Math.round(p.hourlyCost * o.hourlyCostFactor);
  }
  if (o.intakeFeeFactor) {
    s.intake.upfront = Math.round(s.intake.upfront * o.intakeFeeFactor);
    s.intake.balance = Math.round(s.intake.balance * o.intakeFeeFactor);
    s.intake.fee = s.intake.upfront + s.intake.balance;
  }
  valid(s, sc.id + ' initial');
  return s;
}
function applyTaskFixture(s, sc) {
  s = copy(s); const o = sc.overrides;
  for (const t of s.tasks) {
    if (o.requiredHoursFactor) t.requiredHours = Math.ceil(t.requiredHours * o.requiredHoursFactor);
    if (o.taskDueCap !== undefined) t.dueDay = Math.min(t.dueDay, o.taskDueCap);
  }
  if (o.taskDueCap !== undefined) for (const c of s.cases) if (c.status !== 'declined') c.dueDay = Math.min(c.dueDay, o.taskDueCap);
  valid(s, sc.id + ' task fixture');
  return s;
}
function measure(s, sc, st, initialHash, trace) {
  const work = s.reports.flatMap(r => r.work);
  const activeCases = s.cases.filter(c => c.status !== 'declined' && c.status !== 'pending');
  const ready = activeCases.filter(c => c.status === 'ready');
  const lateIds = [...new Set(s.reports.flatMap(r => r.lateTasks))].sort();
  const staffHours = Object.fromEntries(s.staff.map(p => [p.id, sum(work.filter(w => w.staffId === p.id).map(w => w.hours))]));
  const totalHours = sum(work.map(w => w.hours));
  return {
    scenario: sc.id, strategy: st.id, label: st.label,
    opening_cash: s.openingCash, final_cash: s.cash, minimum_day_end_cash: Math.min(s.openingCash, ...s.reports.map(r => r.cashAfter)),
    negative_cash_days: s.reports.filter(r => r.cashAfter < 0).length,
    income: sum(s.ledger.filter(l => l.type === 'income').map(l => l.amount)),
    expenses: sum(s.ledger.filter(l => l.type === 'expense').map(l => l.amount)),
    unpaid_invoices: sum(s.invoices.filter(i => i.status === 'unpaid').map(i => i.amount)),
    cash_plus_unpaid_invoices: s.cash + sum(s.invoices.filter(i => i.status === 'unpaid').map(i => i.amount)),
    ready_cases: ready.length, incomplete_cases: activeCases.length - ready.length,
    completed_tasks: s.tasks.filter(t => t.completedDay !== null).length, total_tasks: s.tasks.length,
    late_distinct_tasks: lateIds.length, late_task_days: sum(s.reports.map(r => r.lateTasks.length)),
    late_distinct_cases: new Set(lateIds.map(id => s.tasks.find(t => t.id === id).caseId)).size,
    worked_hours: totalHours, remaining_hours: sum(s.tasks.map(t => t.requiredHours - t.doneHours)),
    unused_capacity_hours: sum(s.staff.map(p => p.capacity * 5)) - totalHours,
    max_staff_week_utilization_pct: Math.max(...s.staff.map(p => p.capacity ? Math.round(10000 * staffHours[p.id] / (p.capacity * 5)) / 100 : 0)),
    lee_hours: staffHours.lee, kim_hours: staffHours.kim, park_hours: staffHours.park, han_hours: staffHours.han,
    initial_state_sha256: initialHash,
    late_task_ids: lateIds.join('|'),
    task_completion_days: Object.fromEntries(s.tasks.map(t => [t.id, t.completedDay])),
    action_trace: trace, day_reports: s.reports, final_state_sha256: hash(s)
  };
}
function execute(sc, st, verify) {
  let s = configuredInitial(sc); const initialHash = hash(s); const trace = [];
  s = command(s, { type: st.accept ? 'ACCEPT_INTAKE' : 'DECLINE_INTAKE' }, trace);
  s = applyTaskFixture(s, sc);
  if (st.setup) s = st.setup(s, trace);
  while (!s.completed) {
    if (st.beforeDay) s = st.beforeDay(s, trace);
    if (verify) {
      const before = JSON.stringify(s);
      const prediction = E.forecast(s);
      check(prediction.ok, 'forecast failure');
      check(JSON.stringify(s) === before, 'forecast mutated state');
      const frozenPlanActual = finish(copy(s));
      check(prediction.projectedCash === frozenPlanActual.cash, 'forecast cash diverged from unchanged-plan execution');
      check(JSON.stringify(prediction.days) === JSON.stringify(frozenPlanActual.reports.slice(s.dayIndex).map(r => ({ day: r.day, work: r.work }))), 'forecast work diverged');
      const restored = JSON.parse(JSON.stringify(E.exportSnapshot(s)));
      valid(restored, 'roundtrip');
      check(JSON.stringify(E.command(s, { type: 'ADVANCE_DAY' })) === JSON.stringify(E.command(restored, { type: 'ADVANCE_DAY' })), 'restore diverged on next day');
    }
    s = command(s, { type: 'ADVANCE_DAY' }, trace);
  }
  const refused = E.command(s, { type: 'ADVANCE_DAY' });
  check(!refused.ok && refused.state === s, 'day six must be rejected');
  return measure(s, sc, st, initialHash, trace);
}
const rows = [];
for (const scenario of scenarios) {
  for (const strategy of strategies) {
    const row = execute(scenario, strategy, true);
    const repeated = execute(scenario, strategy, false);
    check(JSON.stringify(row) === JSON.stringify(repeated), scenario.id + '/' + strategy.id + ' nondeterministic');
    rows.push(row);
  }
  const hashes = new Set(rows.filter(r => r.scenario === scenario.id).map(r => r.initial_state_sha256));
  check(hashes.size === 1, 'strategies must share configured starting state');
}
const columns = Object.keys(rows[0]).filter(k => !['task_completion_days', 'action_trace', 'day_reports'].includes(k));
const quote = value => '"' + String(value).replaceAll('"', '""') + '"';
const csv = [columns, ...rows.map(row => columns.map(k => row[k]))].map(row => row.map(quote).join(',')).join('\n') + '\n';
const comparisonPath = option('--compare', null);
let comparison = null;
if (comparisonPath) {
  const prior = JSON.parse(fs.readFileSync(path.resolve(root, comparisonPath), 'utf8'));
  assert.deepEqual(rows, prior.rows, 'strategy outcomes, actions, or actual reports changed');
  assertions++;
  comparison = { baseline: comparisonPath, baseline_engine_sha256: prior.engine_sha256, identical_rows: rows.length };
}
const metadata = {
  engine_path: path.relative(root, enginePath).replaceAll('\\', '/'), engine_sha256: hash(fs.readFileSync(enginePath)),
  engine_version: E.createInitialState().version, calendar: E.createInitialState().dates,
  scope: 'Five execution days; prepared cases are not closed or won cases. One intake only; no multi-case market.',
  random_source: 'none', seed: null,
  scenarios, strategies: strategies.map(({ id, label, accept }) => ({ id, label, accept })),
  fixture_boundary: 'Only validator-supported imported-state fields changed before any work. Production defaults untouched; fee splits remain consistent. Workload/deadline overrides also apply to tasks created by intake before first ADVANCE_DAY.',
  forecast_boundary: 'Checked against actual frozen-plan execution at every decision state. Does not predict subsequent scripted handoffs.',
  comparison, checks: assertions, failures: 0, runs: rows.length, reruns: rows.length, rows
};
fs.mkdirSync(path.dirname(prefix), { recursive: true });
fs.writeFileSync(prefix + '.csv', '\ufeff' + csv);
fs.writeFileSync(prefix + '.json', JSON.stringify(metadata, null, 2) + '\n');
const output = `PASS: ${rows.length} strategy/scenario runs + ${rows.length} deterministic reruns; ${assertions} assertions; 0 failures\nEngine SHA-256: ${metadata.engine_sha256}\n` + (comparison ? `PASS: all ${comparison.identical_rows} rows, action traces and daily reports equal baseline ${comparison.baseline_engine_sha256}\n` : '');
fs.writeFileSync(prefix + '.log', output);
console.log(output.trim());
console.table(rows.filter(r => r.scenario === 'original').map(r => ({ strategy: r.strategy, cash: r.final_cash, receivables: r.unpaid_invoices, ready: r.ready_cases, unfinished: r.incomplete_cases, tasks: `${r.completed_tasks}/${r.total_tasks}`, late: r.late_distinct_tasks, hours: r.worked_hours })));
