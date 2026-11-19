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

test('강등된 주의 결산·엔딩 임대료 툴팁은 그 주에 빠진 금액과 같다', () => {
  function shown(n) {
    if (!n) return '0';
    const sign = n < 0 ? '−' : '';
    const v = Math.abs(Math.round(n));
    if (v >= 100000000) {
      const e = Math.floor(v / 100000000);
      const rest = Math.round((v % 100000000) / 10000);
      return sign + e.toLocaleString('ko-KR') + '억' + (rest ? ' ' + rest.toLocaleString('ko-KR') + '만' : '');
    }
    return sign + Math.round(v / 10000).toLocaleString('ko-KR') + '만';
  }
  function tipOf(html, label) {
    const matched = html.match(new RegExp('data-tip="([^"]*)"[^>]*>\\s*<small>' + label));
    assert.ok(matched, label);
    return matched[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  function openAtTier3(doc, desk) {
    clickRendered(doc, 'start');
    const first = desk.state();
    first.offers = [];
    first.reputation = 35;
    first.revenue = 40000000;
    first.cash = 100000000;
    clickRendered(doc, 'endWeek');
    assert.equal(desk.state().tier, 3);
    clickRendered(doc, 'next');
    assert.equal(desk.screen(), 'office');
    assert.equal(desk.state().tier, 3);
  }
  function assertPaidRent(html, paid, later) {
    const paidText = '임대 ' + shown(paid);
    const laterText = '임대 ' + shown(later);
    for (const label of ['현금', '등급']) {
      const text = tipOf(html, label);
      assert.ok(text.includes(paidText), label);
      assert.equal(text.includes(laterText), false, label);
    }
  }

  const result = mounted(1);
  openAtTier3(result.doc, result.desk);
  const mid = result.desk.state();
  mid.offers = [];
  mid.reputation = 34;
  mid.revenue = 40000000;
  mid.cash = 100000000;
  clickRendered(result.doc, 'endWeek');
  assert.equal(result.desk.screen(), 'result');
  assert.equal(result.desk.state().tier, 2);
  const paid = result.desk.state().lastWeek.rent;
  assert.equal(paid, Loop.RENT[3]);
  assertPaidRent(result.doc.nodes.app.innerHTML, paid, Loop.RENT[2]);

  const ending = mounted(1);
  openAtTier3(ending.doc, ending.desk);
  const last = ending.desk.state();
  last.offers = [];
  last.reputation = 34;
  last.revenue = 40000000;
  last.cash = 100000000;
  last.week = 12;
  clickRendered(ending.doc, 'endWeek');
  assert.equal(ending.desk.screen(), 'ending');
  assert.equal(ending.desk.state().tier, 2);
  const endingPaid = ending.desk.state().lastWeek.rent;
  assert.equal(endingPaid, Loop.RENT[3]);
  assertPaidRent(ending.doc.nodes.app.innerHTML, endingPaid, Loop.RENT[2]);
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
