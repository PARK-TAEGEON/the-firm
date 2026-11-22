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
    ['ABC', ['업무실', '접수'], 0],
    ['ABCDE', ['업무실', '소회의실', '대기 공간'], 1],
    ['ABCDEFG', ['민사 송무팀', '형사팀', '회의실', '대기실', '접수', '대표실'], 1]
  ];
  for (const [index, [ids, rooms, tables]] of expected.entries()) {
    const { state } = Loop.createRun({ seed: 1 });
    state.tier = index + 1;
    Loop.removeDesk(state, 'A');
    const buttons = [];
    const svg = Floorplan.render(state.tier, id => { buttons.push(id); return {}; }, '한서진');
    assert.equal(buttons.sort().join(''), ids);
    assert.deepEqual([...svg.matchAll(/class="iso-room[^"]*"[^>]*>([^<]*)/g)].map(m => m[1]), rooms);
    assert.equal((svg.match(/data-fixture="meeting"/g) || []).length, tables);
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

test('2:1 투영의 중심은 자기 자리만 가리키고 모든 앵커의 클릭 다각형은 분리된다', () => {
  assert.deepEqual(Floorplan.project(10, 0, 0), [10, 5]);
  assert.deepEqual(Floorplan.project(0, 10, 0), [-10, 5]);
  assert.deepEqual(Floorplan.project(0, 0, 10), [0, -10]);
  const inverse = ([x,y]) => [y+x/2, y-x/2];
  for (const tier of [1,2,3]) {
    const svg = Floorplan.render(tier, () => ({}), '대표');
    const shapes = [...svg.matchAll(/translate\(([-\d.]+) ([-\d.]+)\)"><g id="anchor-([A-G])"[^>]*><polygon[^>]+points="([^"]+)"/g)].map(m => {
      const x = +m[1], y = +m[2];
      const corners = m[4].split(' ').map(pt => pt.split(',').map(Number)).map(([u,v]) => inverse([x+u,y+v]));
      const xs = corners.map(p => p[0]), ys = corners.map(p => p[1]);
      return { id:m[3], center:inverse([x,y]), left:Math.min(...xs), right:Math.max(...xs), top:Math.min(...ys), bottom:Math.max(...ys) };
    });
    assert.equal(shapes.length, [3,5,7][tier-1]);
    for (const seat of shapes) {
      const [x,y] = seat.center;
      assert.deepEqual(shapes.filter(s => s.left <= x && x <= s.right && s.top <= y && y <= s.bottom), [seat]);
      for (const other of shapes.filter(s => s !== seat)) {
        assert.ok(seat.right < other.left || other.right < seat.left || seat.bottom < other.top || other.bottom < seat.top, seat.id + other.id);
      }
    }
  }
});

test('가구와 유리 칸막이는 같은 깊이 순서로, 이름표는 맨 뒤에 그린다', () => {
  for (const tier of [1,2,3]) {
    const svg = Floorplan.render(tier, id => ({ placed: id === 'A', person: id === 'A' ? '김 사무원' : null }), '한서진');
    const depth = [...svg.matchAll(/data-depth="([\d.]+)"/g)].map(m => +m[1]);
    assert.ok(depth.length > 8);
    assert.deepEqual(depth, [...depth].sort((a,b) => a-b));
    assert.ok(svg.lastIndexOf('data-fixture=') < svg.indexOf('class="iso-nameplate"'));
    assert.ok(svg.includes('한서진 법률사무소'));
  }
});

test('개별 책상 표식은 무료 설치·잠금 비용·상한을 구분하고 대표 이름을 이스케이프한다', () => {
  const svg = Floorplan.render(1, id => ({ placed: id === 'A', full: id === 'B', lockLabel: '100만 해금' }), '<대표>');
  assert.match(svg, /id="anchor-B"[^>]*aria-label="B 자리 · 100만 해금"[^>]*aria-disabled="true"/);
  assert.match(svg, /id="anchor-C"[^>]*aria-label="C 자리 · 책상 놓기"/);
  const capped = Floorplan.render(1, () => ({ full: true, lockLabel: '보유 한도' }), '대표');
  assert.match(capped, /aria-label="A 자리 · 보유 한도" aria-disabled="true"/);
  assert.ok(svg.includes('&lt;대표&gt; 법률사무소'));
});
