'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Loop = require('../src/loop.js');
const Floorplan = require('../src/floorplan.js');

test('구매는 수량만 열고 배치·제거·재배치는 무료이며 제거하면 직원도 빠진다', () => {
  const { state } = Loop.createRun({ seed: 8 });
  assert.equal(Loop.placeDesk(state, 'B'), false);
  assert.ok(Loop.unlockDesk(state, 2));
  assert.deepEqual(state.desks.placements, { A: null });
  const balance = state.cash;
  assert.ok(Loop.placeDesk(state, 'C'));
  assert.ok(Loop.seatStaff(state, 'C', 'park'));
  assert.equal(Loop.placeDesk(state, 'B'), false);
  assert.ok(Loop.removeDesk(state, 'C'));
  assert.equal(Loop.seatStaff(state, 'C', 'kim'), false);
  assert.ok(Loop.placeDesk(state, 'B'));
  assert.deepEqual(state.desks, { unlocked: 2, placements: { A: null, B: null } });
  assert.equal(state.cash, balance);
});

test('빈 수량이 있어도 중복·없는 앵커·다른 층의 자리 요청은 상태를 보존한다', () => {
  const { state } = Loop.createRun({ seed: 8 });
  Loop.unlockDesk(state, 2);
  const before = structuredClone(state);
  for (const id of ['A', 'D', 'AB', '', 'constructor', '__proto__', 1, null]) {
    assert.equal(Loop.placeDesk(state, id), false);
  }
  assert.equal(Loop.removeDesk(state, 'B'), false);
  assert.deepEqual(state, before);
});

test('등급별 SVG의 앵커·방·회의 탁자와 실제 배치 가능한 자리가 일치한다', () => {
  const expected = [
    ['ABC', ['업무실'], 0],
    ['ABCDE', ['업무실', '소회의 공간'], 1],
    ['ABCDEFG', ['업무실', '창가', '회의실', '대표실'], 1]
  ];
  for (const [index, [ids, rooms, tables]] of expected.entries()) {
    const { state } = Loop.createRun({ seed: 1 });
    state.tier = index + 1;
    Loop.removeDesk(state, 'A');
    const buttons = [];
    const svg = Floorplan.render(state.tier, id => { buttons.push(id); return ''; });
    assert.equal(buttons.join(''), ids);
    assert.deepEqual([...svg.matchAll(/class="plan-room"[^>]*>([^<]*)/g)].map(m => m[1]), rooms);
    assert.equal((svg.match(/<g class="plan-chair">/g) || []).length, tables);
    for (const id of 'ABCDEFG') {
      assert.equal(Loop.placeDesk(state, id), buttons.includes(id), id);
      Loop.removeDesk(state, id);
    }
  }
});

test('강등은 사라진 앵커를 먼저 비우고 살아 있는 자리 중 알파벳 앞쪽을 보존한다', () => {
  const run = Loop.createRun({ seed: 2 });
  const { state } = run;
  state.cash = 200000000;
  state.tier = 3;
  state.reputation = 20;
  Loop.removeDesk(state, 'A');
  for (let n = 2; n <= 5; n++) Loop.unlockDesk(state, n);
  for (const id of ['G', 'E', 'D', 'C', 'B']) assert.ok(Loop.placeDesk(state, id));
  Loop.seatStaff(state, 'E', 'kim');
  Loop.seatStaff(state, 'G', 'park');
  Loop.advanceWeek(run);
  assert.equal(state.tier, 2);
  assert.deepEqual(state.desks.placements, { B: null, C: null, D: null });
  assert.equal(state.desks.unlocked, 5);
  state.revenue = 40000000;
  state.reputation = 35;
  Loop.advanceWeek(run);
  assert.equal(Loop.deskCapacity(state).usable, 5);
  assert.ok(Loop.placeDesk(state, 'G'));
  assert.equal(state.desks.placements.G, null);
});
