'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Loop = require('../src/loop.js');
const cases = require('../data/cases.json');

test('개업 시 첫 책상만 열리고 잔액 부족·등급 상한·중복 구매는 원자적으로 거절한다', () => {
  const { state } = Loop.createRun({ seed: 8 });
  assert.deepEqual(Loop.deskCapacity(state), { cap: 2, usable: 1, placed: 1, nextCost: 1000000 });
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
  assert.equal(Loop.seatStaff(state, 'B', 'kim'), false);
  Loop.unlockDesk(state, 2);
  assert.ok(Loop.placeDesk(state, 'B'));
  assert.equal(Loop.seatStaff(state, 'A', 'kim'), true);
  assert.equal(Loop.seatStaff(state, 'B', 'park'), true);
  const occupied = structuredClone(state.desks);
  assert.equal(Loop.seatStaff(state, 'B', 'kim'), false);
  assert.deepEqual(state.desks, occupied);
  assert.equal(Loop.seatStaff(state, 'B', null), true);
  assert.equal(Loop.seatStaff(state, 'B', 'han'), false);
  assert.equal(Loop.seatStaff(state, 'B', 'kim'), true);
  assert.deepEqual(state.desks.placements, { A: null, B: 'kim' });
  assert.equal(Loop.seatStaff(state, 'B', null), true);
  assert.deepEqual(state.desks.placements, { A: null, B: null });
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
    assert.equal(Loop.deskCapacity(state).cap, cap);
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
  for (const id of ['B', 'C', 'D']) assert.ok(Loop.placeDesk(state, id));
  Loop.seatStaff(state, 'C', 'kim');
  Loop.seatStaff(state, 'D', 'park');
  week(14, 40000000, 2, 3);
  assert.deepEqual(state.desks.placements, { A: null, B: null, C: 'kim' });
  assert.equal(Loop.seatStaff(state, 'D', 'park'), false);
  week(14, 40000000, 1, 2);
  assert.deepEqual(state.desks.placements, { A: null, B: null });
  week(35, 40000000, 3, 5);
  assert.deepEqual(Loop.deskCapacity(state), { cap: 5, usable: 4, placed: 2, nextCost: 4000000 });
  assert.ok(Loop.placeDesk(state, 'F'));
  assert.equal(state.desks.placements.F, null);
  buy(5, 4000000);
});
