'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const E = require('../src/engine.js');
const copy = value => JSON.parse(JSON.stringify(value));
const total = items => items.reduce((a, b) => a + b, 0);
function act(state, type, fields = {}) {
  const result = E.command(state, { type, ...fields });
  assert.equal(result.ok, true, result.error);
  return result.state;
}
function start(accept = true) { return act(E.createInitialState(), accept ? 'ACCEPT_INTAKE' : 'DECLINE_INTAKE'); }
function finish(state) { while (!state.completed) state = act(state, 'ADVANCE_DAY'); return state; }
function balancedPlan() {
  let state = start();
  state = act(state, 'ASSIGN_TASK', { taskId: 'yoon-collect', staffId: 'kim' });
  state = act(state, 'ASSIGN_TASK', { taskId: 'yoon-review', staffId: 'lee' });
  state = act(state, 'ASSIGN_TASK', { taskId: 'yoon-brief', staffId: 'park' });
  return act(state, 'SET_PRIORITY', { taskId: 'yoon-review', priority: 1 });
}

test('UMD loads in a browser global and CommonJS with independent initial states', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/engine.js'), 'utf8'), context);
  assert.equal(typeof context.FirmEngine.command, 'function');
  assert.equal(context.FirmEngine.createInitialState().version, '0.3.0');
  const a = E.createInitialState(); const b = E.createInitialState();
  a.staff[0].name = 'changed'; assert.notEqual(a.staff[0].name, b.staff[0].name);
  assert.deepEqual(E.validateState(b), { ok: true });
});

test('invalid commands are atomic and cannot bypass the intake decision', () => {
  const state = E.createInitialState(); const before = JSON.stringify(state);
  for (const action of [{ type: 'ADVANCE_DAY' }, { type: 'MISSING' }, { type: 'SET_PRIORITY', taskId: 'jung-review', priority: 9 }, { type: 'ASSIGN_TASK', taskId: 'jung-review', staffId: 'han' }]) {
    const result = E.command(state, action);
    assert.equal(result.ok, false); assert.equal(result.state, state);
    assert.equal(JSON.stringify(state), before); assert.equal(typeof result.error, 'string');
  }
});

test('acceptance creates commitments and a receivable but no instant cash or output', () => {
  const original = E.createInitialState(); const state = act(original, 'ACCEPT_INTAKE');
  assert.equal(original.intake.status, 'pending'); assert.equal(original.tasks.length, 4);
  assert.equal(state.tasks.length, 7); assert.equal(state.cash, original.cash);
  assert.equal(state.invoices.find(i => i.id === 'invoice-yoon-upfront').dueDay, 1);
  assert.equal(state.reports.length, 0); assert.ok(state.tasks.every(t => t.doneHours === 0 && t.completedDay === null));
  const repeated = E.command(state, { type: 'ACCEPT_INTAKE' });
  assert.equal(repeated.ok, false); assert.equal(repeated.state, state);
});

test('declining creates no new work, invoice, fee, or penalty', () => {
  const state = finish(start(false));
  assert.equal(state.tasks.length, 4); assert.equal(state.invoices.length, 1);
  assert.equal(state.cash, 20456000);
  assert.equal(state.cases.find(c => c.id === 'yoon').status, 'declined');
  assert.ok(state.ledger.every(line => !line.sourceId.includes('yoon')));
});

test('overcommitment is permitted while actual person time never exceeds capacity', () => {
  let state = start();
  for (const task of state.tasks.filter(t => t.roles.includes('lawyer'))) state = act(state, 'ASSIGN_TASK', { taskId: task.id, staffId: 'lee' });
  assert.ok(E.forecast(state).today.find(p => p.staffId === 'lee').assignedRemainingHours > 3);
  state = finish(state);
  for (const report of state.reports) for (const person of state.staff) {
    assert.ok(total(report.work.filter(w => w.staffId === person.id).map(w => w.hours)) <= person.capacity);
  }
  assert.ok(state.tasks.some(t => t.doneHours < t.requiredHours));
});

test('dependencies, actual hours, and completion evidence survive the full week', () => {
  let state = start();
  state = act(state, 'ADVANCE_DAY');
  assert.equal(state.tasks.find(t => t.id === 'jung-review').doneHours, 0);
  assert.equal(state.tasks.find(t => t.id === 'go-review').doneHours, 0);
  assert.deepEqual(state.reports[0].completed, []);
  state = finish(state);
  const done = Object.fromEntries(state.tasks.map(t => [t.id, 0]));
  for (const report of state.reports) {
    for (const work of report.work) {
      const task = state.tasks.find(t => t.id === work.taskId);
      for (const dependency of task.requires) assert.equal(done[dependency], state.tasks.find(t => t.id === dependency).requiredHours);
      done[task.id] += work.hours;
    }
    for (const id of report.completed) {
      const task = state.tasks.find(t => t.id === id);
      assert.equal(done[id], task.requiredHours); assert.equal(task.completedDay, report.day);
    }
  }
  assert.equal(state.tasks.find(t => t.id === 'yoon-brief').completedDay, null);
  assert.equal(state.invoices.some(i => i.id === 'invoice-yoon-balance'), false);
});

test('same-day prerequisites release downstream work without double booking', () => {
  let state = start(false);
  for (let n = 0; n < 3; n++) state = act(state, 'ADVANCE_DAY');
  const report = state.reports[2];
  assert.ok(report.completed.includes('jung-organize'));
  assert.ok(report.work.some(w => w.taskId === 'jung-review'));
  assert.ok(report.work.findIndex(w => w.taskId === 'jung-organize') < report.work.findIndex(w => w.taskId === 'jung-review'));
});

test('each receipt is posted exactly once and the final fee follows the actual report', () => {
  let state = balancedPlan();
  state = act(state, 'ADVANCE_DAY');
  assert.equal(state.ledger.filter(l => l.type === 'income').length, 0);
  state = act(state, 'ADVANCE_DAY');
  assert.equal(state.ledger.find(l => l.sourceId === 'invoice-yoon-upfront').amount, 2400000);
  assert.equal(state.invoices.find(i => i.id === 'invoice-existing').status, 'unpaid');
  state = finish(state);
  assert.equal(state.tasks.find(t => t.id === 'yoon-brief').completedDay, 3);
  assert.equal(state.invoices.find(i => i.id === 'invoice-yoon-balance').paidDay, 4);
  for (const invoice of state.invoices) {
    const payments = state.ledger.filter(l => l.type === 'income' && l.sourceId === invoice.id);
    assert.equal(payments.length, 1); assert.equal(payments[0].amount, invoice.amount);
  }
  assert.equal(total(state.ledger.filter(l => l.type === 'income').map(l => l.amount)), 8100000);
  const closed = E.command(state, { type: 'ADVANCE_DAY' }); assert.equal(closed.ok, false); assert.equal(closed.state, state);
});

test('changing staff allocation changes real outputs rather than only forecast labels', () => {
  const distributed = finish(balancedPlan());
  let concentrated = start();
  for (const id of ['jung-review', 'go-memo', 'go-review', 'yoon-review', 'yoon-brief']) concentrated = act(concentrated, 'ASSIGN_TASK', { taskId: id, staffId: 'lee' });
  concentrated = finish(concentrated);
  assert.notDeepEqual(distributed.reports, concentrated.reports);
  assert.ok(distributed.tasks.filter(t => t.completedDay !== null).length > concentrated.tasks.filter(t => t.completedDay !== null).length);
  assert.notEqual(distributed.cash, concentrated.cash);
});

test('reassignment keeps prior work and execution history', () => {
  let state = act(start(false), 'ADVANCE_DAY');
  const report = copy(state.reports[0]);
  assert.equal(state.tasks.find(t => t.id === 'go-memo').doneHours, 4);
  state = act(state, 'ASSIGN_TASK', { taskId: 'go-memo', staffId: 'kim' });
  assert.deepEqual(state.reports[0], report);
  assert.equal(state.tasks.find(t => t.id === 'go-memo').doneHours, 4);
  state = act(state, 'ADVANCE_DAY');
  assert.ok(state.reports[1].work.some(w => w.taskId === 'go-memo' && w.staffId === 'kim'));
  assert.equal(E.validateState(state).ok, true);
});

test('forecast reuses actual scheduling without mutating state or persisted reports', () => {
  const initial = E.createInitialState(); const pending = E.forecast(initial);
  assert.equal(pending.requiresIntakeDecision, true); assert.equal(pending.intakeIncluded, false);
  assert.equal(pending.tasks.some(t => t.taskId.startsWith('yoon')), false);
  const state = act(balancedPlan(), 'ADVANCE_DAY'); const before = JSON.stringify(state);
  const prediction = E.forecast(state); const actual = finish(state);
  assert.equal(JSON.stringify(state), before);
  assert.equal(prediction.projectedCash, actual.cash);
  assert.deepEqual(prediction.days, actual.reports.slice(1).map(r => ({ day: r.day, work: r.work })));
  assert.equal(prediction.totalPlannedCost, total(actual.reports.slice(1).map(r => r.expenses)));
  for (const task of prediction.tasks) assert.equal(task.predictedCompletionDay, actual.tasks.find(t => t.id === task.taskId).completedDay);
  assert.deepEqual(E.forecast(actual).days, []);
  assert.equal(E.forecast(actual).totalPlannedCost, 0);
});

test('ledger and daily report reconcile to cash, with one operating expense each day', () => {
  const state = finish(balancedPlan());
  const net = total(state.ledger.map(line => line.type === 'income' ? line.amount : -line.amount));
  assert.equal(state.cash, state.openingCash + net);
  let cash = state.openingCash;
  for (const report of state.reports) {
    assert.equal(report.cashBefore, cash);
    assert.equal(report.expenses, 160000 + total(report.work.map(w => w.cost)));
    assert.equal(state.ledger.filter(l => l.sourceId === 'operating:' + report.day).length, 1);
    cash += report.income - report.expenses; assert.equal(report.cashAfter, cash);
  }
  assert.equal(E.validateState(state).ok, true);
});

test('snapshot roundtrip is independent and rejects corrupt or fabricated history', () => {
  const original = finish(balancedPlan()); const restored = JSON.parse(JSON.stringify(E.exportSnapshot(original)));
  assert.deepEqual(restored, original); assert.equal(E.validateState(restored).ok, true);
  restored.cash++; assert.equal(E.validateState(restored).ok, false); assert.notEqual(restored.cash, original.cash);
  assert.throws(() => E.exportSnapshot(restored));
  for (const corrupt of [null, {}, { ...original, schemaVersion: 99 }, { ...original, version: 'future' }]) assert.equal(E.validateState(corrupt).ok, false);
  const badRole = copy(original); badRole.tasks.find(t => t.id === 'jung-review').assignee = 'han'; assert.equal(E.validateState(badRole).ok, false);
  const cycle = E.createInitialState(); cycle.tasks[0].requires = ['jung-review']; assert.equal(E.validateState(cycle).ok, false);
  const fabricated = E.createInitialState(); fabricated.tasks[0].doneHours = 8; fabricated.tasks[0].completedDay = 0; assert.equal(E.validateState(fabricated).ok, false);
  const doubled = copy(original); doubled.ledger.push({ ...doubled.ledger[0], id: 'duplicate-copy' }); assert.equal(E.validateState(doubled).ok, false);
  const missing = copy(original); missing.reports[0].work = []; assert.equal(E.validateState(missing).ok, false);
});

test('a valid sequence is deterministic and failed requests do not contaminate later progress', () => {
  const first = start(); const saved = copy(first);
  const invalid = E.command(first, { type: 'ASSIGN_TASK', taskId: 'go-review', staffId: 'han' });
  assert.equal(invalid.ok, false);
  assert.deepEqual(finish(first), finish(saved));
  assert.deepEqual(E.command(saved, { type: 'ADVANCE_DAY' }), E.command(saved, { type: 'ADVANCE_DAY' }));
});

test('accepting the new case has a reachable plan that completes all seven tasks on time', () => {
  let state = start();
  assert.equal(state.cases.find(c => c.id === 'jung').dueDay, 3);
  assert.equal(state.tasks.find(t => t.id === 'jung-review').dueDay, 3);
  for (const [taskId, staffId] of [['jung-organize', 'kim'], ['go-memo', 'lee'], ['yoon-collect', 'park'], ['yoon-brief', 'kim']]) {
    state = act(state, 'ASSIGN_TASK', { taskId, staffId });
  }
  state = act(state, 'ADVANCE_DAY');
  state = act(state, 'ASSIGN_TASK', { taskId: 'jung-organize', staffId: 'park' });
  state = act(state, 'ADVANCE_DAY');
  state = act(state, 'ASSIGN_TASK', { taskId: 'go-memo', staffId: 'park' });
  const prediction = E.forecast(state);
  assert.ok(prediction.tasks.every(t => t.onTime === true));
  state = finish(state);
  assert.ok(state.tasks.every(t => t.completedDay !== null && t.completedDay <= t.dueDay));
  assert.ok(state.reports.every(r => r.lateTasks.length === 0));
  assert.ok(state.cases.every(c => c.status === 'ready'));
  assert.deepEqual(Object.fromEntries(state.tasks.map(t => [t.id, t.completedDay])), {
    'jung-organize': 1, 'jung-review': 3, 'go-memo': 2, 'go-review': 3,
    'yoon-collect': 0, 'yoon-review': 4, 'yoon-brief': 4
  });
  const finalInvoice = state.invoices.find(i => i.id === 'invoice-yoon-balance');
  assert.equal(finalInvoice.status, 'unpaid'); assert.equal(finalInvoice.dueDay, 5);
  assert.equal(E.validateState(state).ok, true);
});

test('import rejects malformed IDs before exposing imported entities to UI attributes', () => {
  const original = finish(balancedPlan());
  const malformed = ['x\" autofocus onfocus=\"alert(1)', "x' onclick='alert(1)", '<img src=x>', 'a b', 'a:b', 'UPPER', '1starts-with-number', '_starts-with-underscore', 'a'.repeat(101), 123, null];
  for (const collection of ['staff', 'cases', 'tasks', 'ledger', 'invoices', 'reports', 'events']) {
    for (const id of malformed) {
      const imported = copy(original);
      imported[collection][0].id = id;
      const before = JSON.stringify(imported);
      const validation = E.validateState(imported);
      assert.equal(validation.ok, false, collection + ': ' + String(id));
      assert.match(validation.error, /ID/);
      assert.equal(JSON.stringify(imported), before);
      assert.throws(() => E.exportSnapshot(imported), /ID/);
    }
  }
  assert.equal(E.validateState(original).ok, true);
  const unassigned = E.createInitialState();
  unassigned.tasks[0].assignee = null;
  assert.equal(E.validateState(unassigned).ok, true);
});
