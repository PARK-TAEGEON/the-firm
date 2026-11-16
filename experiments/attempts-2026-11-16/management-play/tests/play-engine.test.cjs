'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../src/engine.js');
const original = require('./fixtures/engine-before-audit.cjs');
const copy = value => JSON.parse(JSON.stringify(value));
const sum = values => values.reduce((a, b) => a + b, 0);
const source = 'contract-refund:yoon';
function act(state, type, fields = {}) {
  const result = E.command(state, { type, ...fields });
  assert.equal(result.ok, true, result.error);
  return result.state;
}
function initial(refundPercent = 50, openingCash = 18200000) {
  return E.createInitialState({ experiment: 'commitment-v1', refundPercent, openingCash });
}
function start(percent = 50, accept = true, openingCash = 18200000) {
  return act(initial(percent, openingCash), accept ? 'ACCEPT_INTAKE' : 'DECLINE_INTAKE');
}
function finish(state) { while (!state.completed) state = act(state, 'ADVANCE_DAY'); return state; }
function handoffPlan(state) {
  for (const [taskId, staffId] of [['jung-organize', 'kim'], ['go-memo', 'lee'], ['yoon-collect', 'park'], ['yoon-brief', 'kim']]) {
    state = act(state, 'ASSIGN_TASK', { taskId, staffId });
  }
  state = act(state, 'ADVANCE_DAY');
  state = act(state, 'ASSIGN_TASK', { taskId: 'jung-organize', staffId: 'park' });
  state = act(state, 'ADVANCE_DAY');
  return act(state, 'ASSIGN_TASK', { taskId: 'go-memo', staffId: 'park' });
}
function reconcile(state) {
  let cash = state.openingCash;
  for (const report of state.reports) {
    const entries = state.ledger.filter(entry => entry.day === report.day);
    report.income = sum(entries.filter(entry => entry.type === 'income').map(entry => entry.amount));
    report.expenses = sum(entries.filter(entry => entry.type === 'expense').map(entry => entry.amount));
    report.cashBefore = cash;
    cash += report.income - report.expenses;
    report.cashAfter = cash;
  }
  state.cash = cash;
}
function rejectsUnchanged(state) {
  const before = JSON.stringify(state);
  assert.equal(E.validateState(state).ok, false);
  assert.equal(E.command(state, { type: 'ADVANCE_DAY' }).ok, false);
  assert.throws(() => E.exportSnapshot(state));
  assert.equal(JSON.stringify(state), before);
}

test('PLAY-01 no-option factory and legacy progress retain the exact original economy', () => {
  assert.deepEqual(E.createInitialState(), original.createInitialState());
  assert.equal(E.createInitialState().version, '0.3.0');
  for (const decision of ['ACCEPT_INTAKE', 'DECLINE_INTAKE']) {
    let legacy = original.command(original.createInitialState(), { type: decision }).state;
    const current = finish(act(E.createInitialState(), decision));
    while (!legacy.completed) legacy = original.command(legacy, { type: 'ADVANCE_DAY' }).state;
    assert.deepEqual(current, legacy);
    assert.equal(E.summarize(current).refundPaid, 0);
  }
});

test('PLAY-02 explicit experiment options are validated and cannot silently change a legacy save', () => {
  const options = { experiment: 'commitment-v1', refundPercent: 25, openingCash: 200000 };
  const state = E.createInitialState(options);
  assert.deepEqual(options, { experiment: 'commitment-v1', refundPercent: 25, openingCash: 200000 });
  assert.equal(state.version, '0.4.0');
  assert.deepEqual(state.experiment, { id: 'commitment-v1', refundPercent: 25 });
  assert.equal(state.cash, 200000);
  assert.equal(E.createInitialState({ experiment: 'commitment-v1' }).experiment.refundPercent, 50);
  for (const options of [null, {}, [], { experiment: 'other' }, { experiment: 'commitment-v1', refundPercent: 10 },
    { experiment: 'commitment-v1', refundPercent: '50' }, { experiment: 'commitment-v1', openingCash: -1 },
    { experiment: 'commitment-v1', openingCash: 1.5 }, { experiment: 'commitment-v1', unrelated: true }]) {
    assert.throws(() => E.createInitialState(options));
  }
  const injected = E.createInitialState(); injected.experiment = { id: 'commitment-v1', refundPercent: 50 };
  rejectsUnchanged(injected);
  for (const mutate of [s => { delete s.experiment; }, s => { s.experiment.refundPercent = 10; },
    s => { s.experiment.id = 'different'; }, s => { s.version = '0.3.0'; }]) {
    const damaged = initial(); mutate(damaged); rejectsUnchanged(damaged);
  }
  const active = start();
  const failed = E.command(active, { type: 'SET_EXPERIMENT', refundPercent: 0 });
  assert.equal(failed.ok, false); assert.equal(failed.state, active);
});

test('PLAY-03 incomplete preparation refunds the configured upfront share once at the contract deadline', () => {
  let state = start();
  while (state.dayIndex < state.intake.dueDay) {
    state = act(state, 'ADVANCE_DAY');
    assert.equal(E.summarize(state).refundPaid, 0);
    assert.equal(state.ledger.some(entry => entry.sourceId === source), false);
  }
  const before = copy(state);
  state = act(state, 'ADVANCE_DAY');
  assert.equal(state.tasks.find(task => task.id === 'yoon-brief').completedDay, null);
  const refunds = state.ledger.filter(entry => entry.sourceId === source);
  assert.equal(refunds.length, 1); assert.equal(refunds[0].day, state.intake.dueDay);
  assert.equal(refunds[0].amount, 1200000); assert.equal(refunds[0].type, 'expense');
  const final = state.reports.at(-1);
  assert.equal(final.expenses, 160000 + sum(final.work.map(work => work.cost)) + 1200000);
  assert.equal(state.cash, 21084000);
  assert.equal(state.invoices.find(invoice => invoice.id === 'invoice-existing').amount, 4500000);
  assert.equal(state.invoices.find(invoice => invoice.id === 'invoice-existing').paidDay, 2);
  assert.equal(state.ledger.filter(entry => entry.sourceId === 'invoice-yoon-upfront').length, 1);
  assert.deepEqual(act(before, 'ADVANCE_DAY'), state);
  const repeated = E.command(state, { type: 'ADVANCE_DAY' });
  assert.equal(repeated.ok, false); assert.equal(repeated.state, state);
  assert.equal(E.validateState(state).ok, true);
});

test('PLAY-04 completing on the deadline avoids refund and preserves the final receivable', () => {
  let state = handoffPlan(start());
  assert.equal(E.forecast(state).projectedRefund, 0);
  state = finish(state);
  assert.equal(state.tasks.find(task => task.id === 'yoon-brief').completedDay, state.intake.dueDay);
  assert.equal(E.summarize(state).refundPaid, 0);
  assert.equal(state.ledger.some(entry => entry.sourceId === source), false);
  assert.equal(state.cash, 21880000);
  assert.equal(E.summarize(state).receivables, 1200000);
  assert.equal(E.summarize(state).cashAndReceivables, 23080000);
  assert.equal(E.summarize(state).lateTasks, 0);
  assert.equal(E.summarize(state).readyCases, 3);
});

test('PLAY-05 refusing the new contract creates no refund or new fee', () => {
  const state = finish(start(100, false));
  const summary = E.summarize(state);
  assert.equal(summary.cash, 20456000); assert.equal(summary.refundPaid, 0);
  assert.equal(summary.activeCases, 2); assert.equal(summary.readyCases, 2);
  assert.equal(summary.totalTasks, 4);
  assert.ok(state.ledger.every(entry => !entry.sourceId.includes('yoon')));
});

test('PLAY-06 forecast and summary remain pure and equal actual execution including refund', () => {
  let state = start();
  for (let day = 0; day <= 5; day++) {
    const before = JSON.stringify(state);
    const actualSummary = E.summarize(state);
    const forecast = E.forecast(state);
    const executed = finish(state);
    assert.deepEqual(forecast.summary, E.summarize(executed));
    assert.equal(forecast.projectedCash, executed.cash);
    assert.equal(forecast.projectedRefund, 1200000 - actualSummary.refundPaid);
    assert.equal(forecast.totalPlannedCost, sum(executed.reports.slice(state.dayIndex).map(report => report.expenses)));
    assert.equal(JSON.stringify(state), before);
    if (day < 5) state = act(state, 'ADVANCE_DAY');
  }
});

test('PLAY-07 roundtrip preserves experiment identity, forecast, and the next command on every day', () => {
  let state = start(25);
  for (let day = 0; day <= 5; day++) {
    const restored = JSON.parse(JSON.stringify(E.exportSnapshot(state)));
    assert.deepEqual(restored, state);
    assert.deepEqual(restored.experiment, { id: 'commitment-v1', refundPercent: 25 });
    assert.deepEqual(E.forecast(restored), E.forecast(state));
    assert.deepEqual(E.command(restored, { type: 'ADVANCE_DAY' }), E.command(state, { type: 'ADVANCE_DAY' }));
    if (day < 5) state = act(state, 'ADVANCE_DAY');
  }
});

test('PLAY-08 missing, moved, duplicated, or altered refunds are rejected even with reconciled cash', () => {
  const completed = finish(start());
  for (const corrupt of [
    state => { state.ledger = state.ledger.filter(entry => entry.sourceId !== source); },
    state => { state.ledger.find(entry => entry.sourceId === source).amount += 1; },
    state => { state.ledger.find(entry => entry.sourceId === source).day = 3; },
    state => { state.ledger.find(entry => entry.sourceId === source).id = 'fake-refund'; },
    state => { state.ledger.find(entry => entry.sourceId === source).sourceId = 'fake-refund'; },
    state => { state.ledger.find(entry => entry.sourceId === source).type = 'income'; },
    state => { state.ledger.push({ ...state.ledger.find(entry => entry.sourceId === source), id: 'copy-refund' }); },
    state => { state.experiment.refundPercent = 25; }
  ]) {
    const damaged = copy(completed); corrupt(damaged); reconcile(damaged); rejectsUnchanged(damaged);
  }
  for (const state of [finish(start(0)), finish(start(50, false)), finish(handoffPlan(start())), finish(act(E.createInitialState(), 'ACCEPT_INTAKE'))]) {
    const damaged = copy(state);
    damaged.ledger.push({ id: 'ledger-contract-refund-yoon', sourceId: source, day: 4, type: 'expense', amount: 1200000, title: 'fake refund' });
    reconcile(damaged); rejectsUnchanged(damaged);
  }
  let early = start();
  early = act(early, 'ADVANCE_DAY');
  early.ledger.push({ id: 'ledger-contract-refund-yoon', sourceId: source, day: 0, type: 'expense', amount: 1200000, title: 'early refund' });
  reconcile(early); rejectsUnchanged(early);
});

test('PLAY-09 cash shortfall remains visible without introducing a date-progress lock', () => {
  let state = start(50, true, 200000);
  const prediction = E.forecast(state);
  assert.ok(prediction.warnings.some(warning => warning.code === 'cash_shortfall'));
  state = act(state, 'ADVANCE_DAY');
  assert.equal(state.cash, -174000);
  state = finish(state);
  const summary = E.summarize(state);
  assert.equal(state.completed, true);
  assert.equal(summary.minimumCash, -174000);
  assert.equal(summary.negativeCashDays, 1);
  assert.equal(summary.cash, 3084000);
  assert.deepEqual(summary, prediction.summary);
});

test('PLAY-10 refund sensitivity changes only the contractual expense and uses whole KRW', () => {
  const results = [0, 25, 50, 100].map(percent => finish(start(percent)));
  for (let i = 0; i < results.length; i++) {
    const percent = [0, 25, 50, 100][i], state = results[i], summary = E.summarize(state);
    assert.equal(summary.refundPaid, 2400000 * percent / 100);
    assert.equal(summary.cash, 22284000 - summary.refundPaid);
    assert.deepEqual(state.tasks, results[0].tasks);
    assert.deepEqual(state.invoices, results[0].invoices);
  }
  const zero = copy(results[0]); zero.version = '0.3.0'; delete zero.experiment;
  assert.deepEqual(zero, finish(act(E.createInitialState(), 'ACCEPT_INTAKE')));
  let odd = initial(25);
  odd.intake.upfront = 2400001; odd.intake.fee = odd.intake.upfront + odd.intake.balance;
  odd = finish(act(odd, 'ACCEPT_INTAKE'));
  assert.equal(E.summarize(odd).refundPaid, 600000);
  assert.equal(E.validateState(odd).ok, true);
});

test('PLAY-11 summary counts distinct late work and uses actual closing balances, not predictions', () => {
  const state = start(); const before = JSON.stringify(state);
  assert.deepEqual(E.summarize(state), {
    cash: 18200000, receivables: 6900000, cashAndReceivables: 25100000,
    minimumCash: 18200000, negativeCashDays: 0, readyCases: 0, activeCases: 3,
    completedTasks: 0, totalTasks: 7, lateTasks: 0, remainingHours: 52, refundPaid: 0
  });
  assert.equal(JSON.stringify(state), before);
  const completed = finish(state), summary = E.summarize(completed);
  assert.equal(summary.lateTasks, 3);
  assert.equal(summary.completedTasks, 6); assert.equal(summary.totalTasks, 7);
  assert.equal(summary.readyCases, 2); assert.equal(summary.remainingHours, 1);
  assert.equal(summary.receivables, 0);
  let concentrated = start();
  for (const task of concentrated.tasks) concentrated = act(concentrated, 'ASSIGN_TASK', { taskId: task.id, staffId: 'park' });
  concentrated = finish(concentrated);
  assert.equal(E.summarize(concentrated).lateTasks, 6);
  assert.ok(sum(concentrated.reports.map(report => report.lateTasks.length)) > 6);
});
