'use strict';
// Run unchanged checks against the preserved original with --baseline.
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require(process.argv.includes('--baseline') ? './fixtures/engine-before-audit.cjs' : '../src/engine.js');
const copy = value => JSON.parse(JSON.stringify(value));
function act(state, type, fields = {}) {
  const result = E.command(state, { type, ...fields });
  assert.equal(result.ok, true, result.error);
  return result.state;
}
function start(accept = true) { return act(E.createInitialState(), accept ? 'ACCEPT_INTAKE' : 'DECLINE_INTAKE'); }
function finish(state) { while (!state.completed) state = act(state, 'ADVANCE_DAY'); return state; }
function rejectedWithoutMutation(state) {
  const before = JSON.stringify(state);
  assert.equal(E.validateState(state).ok, false, 'inconsistent imported snapshot must be rejected');
  assert.equal(E.command(state, { type: 'ADVANCE_DAY' }).ok, false);
  assert.throws(() => E.exportSnapshot(state));
  assert.equal(JSON.stringify(state), before);
}
function moveCompletion(state, taskId, day) {
  state.reports.forEach(report => { report.completed = report.completed.filter(id => id !== taskId); });
  state.tasks.find(task => task.id === taskId).completedDay = day;
  state.reports[day].completed.push(taskId);
}
function reconcileReports(state) {
  let cash = state.openingCash;
  state.reports.forEach(report => {
    const entries = state.ledger.filter(line => line.day === report.day);
    report.income = entries.filter(line => line.type === 'income').reduce((n, line) => n + line.amount, 0);
    report.expenses = entries.filter(line => line.type === 'expense').reduce((n, line) => n + line.amount, 0);
    report.cashBefore = cash;
    cash += report.income - report.expenses;
    report.cashAfter = cash;
  });
  state.cash = cash;
}

test('AUDIT-01 import completion day must equal the day actual recorded hours first reach the requirement', () => {
  for (const fakeDay of [0, 4]) {
    const state = finish(start(false));
    assert.equal(state.tasks.find(task => task.id === 'jung-organize').completedDay, 2);
    moveCompletion(state, 'jung-organize', fakeDay);
    rejectedWithoutMutation(state);
  }
});

test('AUDIT-02 upfront invoice must use configured contract amount, next-day timing, and the correct case', () => {
  for (const corrupt of [invoice => { invoice.amount += 1000000; }, invoice => { invoice.dueDay = 0; }, invoice => { invoice.caseId = 'go'; }]) {
    const state = start();
    corrupt(state.invoices.find(invoice => invoice.id === 'invoice-yoon-upfront'));
    rejectedWithoutMutation(state);
  }
});

test('AUDIT-03 canonical receipt-trigger task identity cannot be lost during import', () => {
  const state = start();
  state.tasks.find(task => task.id === 'yoon-brief').id = 'renamed-final-report';
  rejectedWithoutMutation(state);
});

test('AUDIT-04 processed due-day invoices cannot be restored as unpaid after deleting and reconciling their receipt', () => {
  let state = start();
  state = act(act(state, 'ADVANCE_DAY'), 'ADVANCE_DAY');
  const invoice = state.invoices.find(item => item.id === 'invoice-yoon-upfront');
  assert.equal(invoice.status, 'paid');
  invoice.status = 'unpaid'; invoice.paidDay = null;
  state.ledger = state.ledger.filter(line => line.sourceId !== invoice.id);
  reconcileReports(state);
  rejectedWithoutMutation(state);
});

test('AUDIT-05 balance invoice keeps the receipt-trigger case identity', () => {
  let state = start();
  for (const [taskId, staffId] of [['yoon-collect', 'kim'], ['yoon-review', 'lee'], ['yoon-brief', 'park']]) state = act(state, 'ASSIGN_TASK', { taskId, staffId });
  state = act(state, 'SET_PRIORITY', { taskId: 'yoon-review', priority: 1 });
  state = finish(state);
  state.invoices.find(invoice => invoice.id === 'invoice-yoon-balance').caseId = 'go';
  rejectedWithoutMutation(state);
});

test('AUDIT-06 valid imported event IDs cannot collide with the next generated event', () => {
  const state = E.createInitialState();
  state.events[0].id = 'event-0002';
  assert.equal(E.validateState(state).ok, true);
  const next = act(state, 'ACCEPT_INTAKE');
  assert.equal(new Set(next.events.map(event => event.id)).size, next.events.length);
  assert.deepEqual(next.events[0], state.events[0]);
});

test('AUDIT-07 valid snapshots resume identically on every day and cannot advance after the fifth day', () => {
  let state = start();
  for (let day = 0; day <= 5; day++) {
    const restored = JSON.parse(JSON.stringify(E.exportSnapshot(state)));
    assert.deepEqual(restored, state);
    assert.deepEqual(E.forecast(restored), E.forecast(state));
    const left = E.command(state, { type: 'ADVANCE_DAY' });
    const right = E.command(restored, { type: 'ADVANCE_DAY' });
    assert.deepEqual(right, left);
    if (day === 5) { assert.equal(left.ok, false); assert.equal(left.state, state); }
    else { assert.equal(left.ok, true, left.error); state = left.state; }
  }
});

test('AUDIT-08 separate initial balance fixtures remain supported without modifying default economics', () => {
  const state = E.createInitialState();
  state.cash = state.openingCash = 0;
  state.staff.forEach(person => { person.hourlyCost *= 2; person.capacity = Math.max(1, person.capacity - 1); });
  state.intake.upfront = 1200000; state.intake.balance = 2400000; state.intake.fee = 3600000;
  state.tasks[0].requiredHours = 9; state.tasks[0].dueDay = 0;
  assert.equal(E.validateState(state).ok, true);
  const actual = finish(act(state, 'ACCEPT_INTAKE'));
  assert.equal(E.validateState(actual).ok, true);
  assert.ok(actual.reports.some(report => report.cashAfter < 0));
  assert.equal(E.createInitialState().staff[0].hourlyCost, 60000);
});

test('AUDIT-09 action history limit rejects extra edits atomically but reserves all mandatory week events', () => {
  // A snapshot reachable in the original implementation must not softlock.
  for (const accept of [true, false]) {
    let legacy = start(accept);
    for (let n = 0; n < 998; n++) legacy = act(legacy, 'SET_PRIORITY', { taskId: 'go-memo', priority: n % 2 ? 2 : 1 });
    assert.equal(legacy.events.length, 1000);
    assert.equal(E.validateState(legacy).ok, true);
    const retained = copy(legacy.events);
    const completed = finish(legacy);
    assert.deepEqual(completed.events.slice(0, retained.length), retained);
    assert.equal(completed.dayIndex, 5);
  }
  for (const intakeType of ['ACCEPT_INTAKE', 'DECLINE_INTAKE']) {
    let state = E.createInitialState();
    for (let n = 0; n < 999; n++) state = act(state, 'SET_PRIORITY', { taskId: 'go-memo', priority: n % 2 ? 2 : 1 });
    assert.equal(state.events.length, 1000);
    const retained = copy(state.events);
    const nextPriority = state.tasks.find(task => task.id === 'go-memo').priority === 1 ? 2 : 1;
    const failed = E.command(state, { type: 'SET_PRIORITY', taskId: 'go-memo', priority: nextPriority });
    assert.equal(failed.ok, false); assert.equal(failed.state, state);
    const failedAssignment = E.command(state, { type: 'ASSIGN_TASK', taskId: 'go-memo', staffId: 'lee' });
    assert.equal(failedAssignment.ok, false); assert.equal(failedAssignment.state, state);
    assert.deepEqual(state.events, retained);
    state = finish(act(state, intakeType));
    assert.equal(state.dayIndex, 5);
    assert.deepEqual(state.events.slice(0, retained.length), retained);
    assert.equal(E.validateState(state).ok, true);
    assert.equal(state.events.length, 1000 + 1 + 5 + state.tasks.filter(task => task.completedDay !== null).length);
  }
});

test('AUDIT-10 default economic state and normal command outcomes remain byte-equivalent to original engine', () => {
  const original = require('./fixtures/engine-before-audit.cjs');
  assert.deepEqual(E.createInitialState(), original.createInitialState());
  for (const plan of ['decline', 'accept', 'distributed', 'concentrated', 'on-time-handoffs']) {
    function play(api) {
      function command(state, type, fields = {}) { const result = api.command(state, { type, ...fields }); assert.equal(result.ok, true, result.error); return result.state; }
      let state = command(api.createInitialState(), plan === 'decline' ? 'DECLINE_INTAKE' : 'ACCEPT_INTAKE');
      if (plan === 'distributed') {
        for (const [taskId, staffId] of [['yoon-collect', 'kim'], ['yoon-review', 'lee'], ['yoon-brief', 'park']]) state = command(state, 'ASSIGN_TASK', { taskId, staffId });
        state = command(state, 'SET_PRIORITY', { taskId: 'yoon-review', priority: 1 });
      }
      if (plan === 'concentrated') for (const task of state.tasks) state = command(state, 'ASSIGN_TASK', { taskId: task.id, staffId: 'lee' });
      if (plan === 'on-time-handoffs') for (const [taskId, staffId] of [['jung-organize', 'kim'], ['go-memo', 'lee'], ['yoon-collect', 'park'], ['yoon-brief', 'kim']]) state = command(state, 'ASSIGN_TASK', { taskId, staffId });
      while (!state.completed) {
        state = command(state, 'ADVANCE_DAY');
        if (plan === 'on-time-handoffs' && state.dayIndex === 1) state = command(state, 'ASSIGN_TASK', { taskId: 'jung-organize', staffId: 'park' });
        if (plan === 'on-time-handoffs' && state.dayIndex === 2) state = command(state, 'ASSIGN_TASK', { taskId: 'go-memo', staffId: 'park' });
      }
      return state;
    }
    assert.deepEqual(play(E), play(original), plan);
  }
});
