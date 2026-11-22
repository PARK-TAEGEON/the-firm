'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Loop = require('../src/loop.js');
const cases = require('../data/cases.json');

test('개업 시 첫 책상만 열리고 잔액 부족·등급 상한·중복 구매는 원자적으로 거절한다', () => {
  const { state } = Loop.createRun({ seed: 8 });
  assert.deepEqual(Loop.officeDesks(state).map(s => s.unlocked), [true, false]);
  state.cash = 999999;
  const before = structuredClone(state);
  assert.equal(Loop.unlockDesk(state, 2), false);
  assert.deepEqual(state, before);
  state.cash = 1000000;
  assert.equal(Loop.unlockDesk(state, 2), true);
  assert.equal(state.cash, 0);
  state.cash = 10000000;
  const paid = structuredClone(state);
  for (const number of [2, 3, 0, -1, 1.5]) assert.equal(Loop.unlockDesk(state, number), false);
  assert.deepEqual(state, paid);
});

test('직원은 빈 해금 책상에만 앉거나 이동하며 사건 업무와 주간 슬롯은 독립이다', () => {
  const run = Loop.createRun({ seed: 8, cases });
  Loop.openWeek(run);
  const { state } = run;
  const accepts = Loop.previewAccepts(run);
  const work = Loop.previewAssignments(run, accepts);
  const staff = structuredClone(state.staff);
  assert.equal(Loop.seatStaff(state, 2, 'kim'), false);
  Loop.unlockDesk(state, 2);
  assert.equal(Loop.seatStaff(state, 1, 'kim'), true);
  assert.equal(Loop.seatStaff(state, 2, 'park'), true);
  const occupied = structuredClone(state.desks);
  assert.equal(Loop.seatStaff(state, 2, 'kim'), false);
  assert.deepEqual(state.desks, occupied);
  assert.equal(Loop.seatStaff(state, 2, null), true);
  assert.equal(Loop.seatStaff(state, 2, 'han'), false);
  assert.equal(Loop.seatStaff(state, 2, 'kim'), true);
  assert.deepEqual(state.desks.assignments, { 2: 'kim' });
  assert.equal(Loop.seatStaff(state, 2, null), true);
  assert.deepEqual(state.desks.assignments, {});
  assert.deepEqual(state.staff, staff);
  assert.deepEqual(Loop.previewAssignments(run, accepts), work);
});

test('주간 승강등은 2·3·5자리 상한을 적용하고 재승급 때 구매한 자리만 무료 복구한다', () => {
  const run = Loop.createRun({ seed: 8 });
  const { state } = run;
  state.cash = 200000000;
  const week = (rep, revenue, tier, cap) => {
    const before = state.cash;
    const rent = Loop.RENT[state.tier];
    state.reputation = rep;
    state.revenue = revenue;
    Loop.advanceWeek(run);
    assert.equal(state.cash, before - rent - 1700000);
    assert.equal(state.tier, tier);
    assert.equal(Loop.officeDesks(state).length, cap);
  };
  const buy = (number, cost) => {
    const before = state.cash;
    assert.equal(Loop.unlockDesk(state, number), true);
    assert.equal(state.cash, before - cost);
  };
  buy(2, 1000000);
  week(15, 0, 2, 3);
  buy(3, 2000000);
  week(35, 40000000, 3, 5);
  assert.equal(Loop.unlockDesk(state, 5), false);
  buy(4, 3000000);
  Loop.seatStaff(state, 3, 'kim');
  Loop.seatStaff(state, 4, 'park');
  week(14, 40000000, 2, 3);
  assert.deepEqual(state.desks.assignments, { 3: 'kim' });
  assert.equal(Loop.seatStaff(state, 4, 'park'), false);
  week(14, 40000000, 1, 2);
  assert.deepEqual(state.desks.assignments, {});
  week(35, 40000000, 3, 5);
  assert.deepEqual(Loop.officeDesks(state).map(s => [s.unlocked, s.staffId]), [
    [true, null], [true, null], [true, null], [true, null], [false, null]
  ]);
  buy(5, 4000000);
});
