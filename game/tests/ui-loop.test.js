'use strict';
// UI-LOOP-001: 화면 핸들러로 12주를 끝내고, 같은 시드의 엔진 엔딩과 비교한다.
const test = require('node:test');
const assert = require('node:assert/strict');
const cases = require('../data/cases.json');
const Loop = require('../src/loop.js');
const Desk = require('../src/ui.js');

const SEED = 7;
const STATS = { 분석: 5, 변론: 5, 협상: 5, 영업: 5 };

function fakeDoc() {
  const listeners = {};
  const nodes = {
    app: { innerHTML: '' },
    pops: { appendChild() {}, innerHTML: '' }
  };
  return {
    nodes: nodes,
    getElementById(id) { return nodes[id] || null; },
    addEventListener(type, fn) { (listeners[type] || (listeners[type] = [])).push(fn); },
    createElement() { return { className: '', style: {}, setAttribute() {}, remove() {}, innerHTML: '' }; },
    click(act, data) {
      const target = {
        dataset: Object.assign({ act: act }, data || {}),
        disabled: false,
        closest(sel) { return sel === '[data-act]' ? target : null; }
      };
      (listeners.click || []).forEach(function (fn) { fn({ target: target }); });
    },
    change(act, data, value) {
      const target = {
        dataset: Object.assign({ act: act }, data || {}),
        value: value,
        disabled: false,
        closest(sel) { return sel === '[data-act]' ? target : null; }
      };
      (listeners.change || []).forEach(function (fn) { fn({ target: target }); });
    }
  };
}

function mounted(seed) {
  const doc = fakeDoc();
  const desk = Desk.create({ loop: Loop, cases: cases, seed: seed });
  Desk.attach(doc, desk);
  return { doc: doc, desk: desk };
}

function clickRendered(doc, act, data) {
  assert.match(doc.nodes.app.innerHTML, new RegExp('data-act="' + act + '"'), act + ' 버튼이 화면에 없다');
  doc.click(act, data);
}

function playDefaults(doc) {
  assert.match(doc.nodes.app.innerHTML, /data-screen="setup"/);
  clickRendered(doc, 'start');
  let guard = 0;
  while (!doc.nodes.app.innerHTML.includes('data-screen="ending"')) {
    assert.ok(++guard <= 40, '엔딩에 닿지 못했다');
    if (doc.nodes.app.innerHTML.includes('data-screen="office"')) clickRendered(doc, 'endWeek');
    else if (doc.nodes.app.innerHTML.includes('data-screen="result"')) clickRendered(doc, 'next');
    else assert.fail(doc.nodes.app.innerHTML.slice(0, 180));
  }
}

test('열어 둔 주를 정책 그대로 확정하면 advanceWeek와 같고, 추천을 그대로 넘겨도 같다', () => {
  const direct = Loop.runSeason({ seed: SEED, cases: cases, stats: STATS });
  const opened = Loop.createRun({ seed: SEED, cases: cases, stats: STATS });
  while (!opened.state.ending) {
    Loop.openWeek(opened);
    const again = JSON.stringify(opened.state.offers);
    const rng = opened.rng.state;
    Loop.openWeek(opened);
    assert.equal(JSON.stringify(opened.state.offers), again);
    assert.equal(opened.rng.state, rng);
    Loop.settleWeek(opened, null);
  }
  assert.deepEqual(opened.state, direct);

  const picked = Loop.createRun({ seed: SEED, cases: cases, stats: STATS });
  while (!picked.state.ending) {
    Loop.openWeek(picked);
    const acceptIds = Loop.previewAccepts(picked);
    const assignments = Loop.previewAssignments(picked, acceptIds);
    Loop.settleWeek(picked, { acceptIds: acceptIds, assignments: assignments });
  }
  assert.deepEqual(picked.state, direct);
});

test('시드 7을 화면 클릭으로 12주 완주하면 엔진과 같은 보통 엔딩이다', () => {
  const engine = Loop.runSeason({ seed: SEED, cases: cases, stats: STATS });
  const { doc, desk } = mounted(SEED);
  playDefaults(doc);
  assert.equal(desk.screen(), 'ending');
  assert.equal(desk.seed(), SEED);
  assert.equal(engine.ending.kind, 'tier');
  assert.equal(engine.ending.label, 'T1 개인 사무소');
  assert.equal(engine.weeksPlayed, 12);
  assert.match(doc.nodes.app.innerHTML, /data-screen="ending"/);
  assert.match(doc.nodes.app.innerHTML, /data-ending="tier"/);
  assert.match(doc.nodes.app.innerHTML, />보통</);
  assert.match(doc.nodes.app.innerHTML, /T1 개인 사무소/);
  assert.deepEqual(desk.state(), engine);
  assert.deepEqual(desk.ending(), engine.ending);
});

test('같은 클릭은 같은 결과를 만들고, 수임을 바꾸면 그 입력의 엔진 결과와 같다', () => {
  function once(toggle) {
    const { doc, desk } = mounted(SEED);
    clickRendered(doc, 'start');
    const id = desk.state().offers[0].id;
    if (toggle) {
      assert.match(doc.nodes.app.innerHTML, new RegExp('data-act="toggle" data-id="' + id + '"'));
      doc.change('toggle', { id: id });
    }
    clickRendered(doc, 'endWeek');
    return { desk: desk, id: id };
  }
  const left = once(false);
  const right = once(false);
  assert.deepEqual(left.desk.state(), right.desk.state());

  const changed = once(true);
  const again = once(true);
  assert.notDeepEqual(changed.desk.state().revenue, left.desk.state().revenue);
  assert.deepEqual(changed.desk.state(), again.desk.state());

  const engine = Loop.createRun({ seed: SEED, cases: cases, stats: STATS });
  Loop.openWeek(engine);
  const recommended = Loop.previewAccepts(engine);
  const acceptIds = recommended.indexOf(changed.id) >= 0
    ? recommended.filter(function (id) { return id !== changed.id; })
    : recommended.concat(changed.id);
  Loop.settleWeek(engine, { acceptIds: acceptIds });
  assert.deepEqual(changed.desk.state(), engine.state);
});

test('합이 20이 아니면 시작되지 않고, 다른 능력치도 같은 시드의 엔진과 같다', () => {
  const { doc, desk } = mounted(1);
  desk.handle('stat', { key: '분석', dir: '1' });
  Desk.attach(doc, desk);
  assert.match(doc.nodes.app.innerHTML, /data-act="start"[^>]*disabled/);
  doc.click('start');
  assert.equal(desk.screen(), 'setup');
  desk.handle('stat', { key: '영업', dir: '-1' });
  assert.equal(desk.handle('start'), true);
  assert.equal(desk.state().stats.분석, 6);
  assert.equal(desk.state().stats.영업, 4);
  const stats = { 분석: 6, 변론: 5, 협상: 5, 영업: 4 };
  while (desk.screen() !== 'ending') {
    if (desk.screen() === 'office') desk.handle('endWeek');
    else desk.handle('next');
  }
  assert.deepEqual(desk.state(), Loop.runSeason({ seed: 1, cases: cases, stats: stats }));
});

test('11주에 폐업해도 엔딩 화면으로 간다', () => {
  const seed = 44;
  const engine = Loop.runSeason({ seed: seed, cases: cases, stats: STATS });
  const { doc, desk } = mounted(seed);
  playDefaults(doc);
  assert.equal(engine.ending.kind, 'bankrupt');
  assert.equal(engine.weeksPlayed, 11);
  assert.match(doc.nodes.app.innerHTML, />폐업</);
  assert.match(doc.nodes.app.innerHTML, /data-week="11"/);
  assert.deepEqual(desk.state(), engine);
});
