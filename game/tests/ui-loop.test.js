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

function mounted(seed, loop = Loop) {
  const doc = fakeDoc();
  const desk = Desk.create({ loop: loop, cases: cases, seed: seed });
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
    assert.match(doc.nodes.app.innerHTML, /id="detail-cases"[^>]* hidden>/);
    if (toggle) {
      clickRendered(doc, 'panel', { id: 'cases' });
      assert.match(doc.nodes.app.innerHTML, /aria-expanded="true" aria-controls="detail-cases"/);
      assert.match(doc.nodes.app.innerHTML, new RegExp('data-act="toggle" data-id="' + id + '"'));
      doc.change('toggle', { id: id });
      assert.match(doc.nodes.app.innerHTML, /id="detail-cases" aria-labelledby="metric-cases">/);
      clickRendered(doc, 'panel', { id: 'staff' });
      assert.match(doc.nodes.app.innerHTML, /id="detail-cases"[^>]* hidden>/);
      clickRendered(doc, 'panel', { id: 'staff' });
      assert.match(doc.nodes.app.innerHTML, /id="detail-staff"[^>]* hidden>/);
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

test('대표·사무소·결산·엔딩의 표시와 수치 툴팁 형식이 같다', () => {
  const { doc, desk } = mounted(SEED);
  const html = () => doc.nodes.app.innerHTML;

  function assertTips() {
    const tips = [...html().matchAll(/data-tip="([^"]*)"/g)];
    assert.ok(tips.length > 0);
    for (const [, tip] of tips) {
      assert.match(tip, /^&lt;b&gt;.+?&lt;\/b&gt;(?:&lt;span&gt;[^&]*\d[^&]*&lt;\/span&gt;){1,2}$/);
      assert.doesNotMatch(tip, /습니다|세요|&lt;em/);
    }
  }

  assertTips();
  clickRendered(doc, 'start');
  assert.match(html(), /1주차 <span>\/ 12주<\/span>/);
  assert.match(html(), /<span>자금<\/span><strong>1,000만<\/strong>/);
  assert.match(html(), /<dt>누적 매출<\/dt><dd>0만<\/dd>/);
  assert.match(html(), /<dt>위대한 로펌<\/dt><dd>명성 42 · 누적 매출 1억 1,000만<\/dd>/);
  const offerTipTasks = [...html().matchAll(/&lt;span&gt;(업무 \d+건 · [^&]+)&lt;\/span&gt;/g)].map(([, line]) => line);
  assert.deepEqual(offerTipTasks, desk.state().offers.map(({ tasks }) =>
    '업무 ' + tasks.length + '건 · ' + tasks.map(task => task.name).join(' / ')));
  assert.match(html(), /성공 \d+% · 부분 성공 \d+% · 실패 \d+%/);
  assert.match(html(), />\d+%<\/td>/);
  assertTips();

  clickRendered(doc, 'endWeek');
  assert.match(html(), /굴림 \d+&lt;\/span&gt;&lt;span&gt;성공 확률 \d+%/);
  assert.match(html(), /<small>주차<\/small><b>1주차<\/b>/);
  assertTips();

  for (let week = 2; week <= Loop.WEEKS; week++) {
    clickRendered(doc, 'next');
    assertTips();
    clickRendered(doc, 'endWeek');
    assertTips();
  }
  assert.match(html(), /종료 12주차/);
  assert.match(html(), /<small>주차<\/small><b>12주차<\/b>/);
});

test('등급 기준이 바뀌면 사무실 상세와 상단 표시줄에 함께 반영된다', () => {
  assert.ok(Number.isInteger(Loop.T2_REPUTATION));
  assert.ok(Number.isInteger(Loop.T3_REPUTATION));
  const { doc } = mounted(SEED, { ...Loop, T2_REPUTATION: 1017, T3_REPUTATION: 2039 });
  const html = () => doc.nodes.app.innerHTML;

  clickRendered(doc, 'start');
  clickRendered(doc, 'panel', { id: 'rep' });
  assert.match(html(), /<dt>등급별 명성<\/dt><dd>T2 · 1,017 \/ T3 · 2,039<\/dd>/);

  clickRendered(doc, 'endWeek');
  assert.match(html(), /등급별 명성 기준&lt;\/b&gt;&lt;span&gt;T2 1,017 · T3 2,039&lt;\/span&gt;/);
});

test('등록 막대는 기본 5칸이고 1~10만 허용하며 남은 점수가 0일 때 개업한다', () => {
  const { desk } = mounted(SEED);
  const initial = desk.html();
  assert.equal((initial.match(/aria-valuenow="5"/g) || []).length, 4);
  assert.equal((initial.match(/class="filled"/g) || []).length, 20);
  for (const text of ['기록 검토, 증거 정리', '법정 주장, 신문', '합의, 고객 응대', '의뢰 수, 착수금']) {
    assert.ok(initial.includes(text));
  }
  assert.match(initial, /남은 점수 <b>0\/20/);
  assert.match(initial, /data-act="start">개업/);
  for (let i = 0; i < 4; i++) assert.ok(desk.handle('stat', { key: '분석', dir: -1 }));
  assert.equal(desk.handle('stat', { key: '분석', dir: -1 }), false);
  assert.match(desk.html(), /남은 점수 <b>4\/20/);
  assert.equal(desk.handle('start'), false);
  for (let i = 0; i < 5; i++) assert.ok(desk.handle('stat', { key: '협상', dir: 1 }));
  assert.equal(desk.handle('stat', { key: '협상', dir: 1 }), false);
  assert.match(desk.html(), /남은 점수 <b>−1\/20/);
  assert.equal(desk.handle('start'), false);
  desk.handle('stat', { key: '변론', dir: -1 });
  assert.ok(desk.handle('start'));
  assert.deepEqual(desk.state().stats, { 분석: 1, 변론: 4, 협상: 10, 영업: 5 });
});

test('대표 이름은 한서진으로 시작하고 재배분 뒤에도 남으며 빈 이름은 기본 이름으로 개업한다', () => {
  for (const [input, expected] of [['  서하  ', '서하'], ['   ', '한서진'], ['', '한서진'], ['<대표>', '&lt;대표&gt;']]) {
    const { desk } = mounted(SEED);
    assert.match(desk.html(), /id="partner-name"[^>]*value="한서진"/);
    desk.handle('name', {}, input);
    desk.handle('stat', { key: '분석', dir: -1 });
    desk.handle('stat', { key: '변론', dir: 1 });
    assert.ok(desk.html().includes('value="' + (input === '<대표>' ? expected : input) + '"'));
    assert.ok(desk.handle('start'));
    assert.ok(desk.html().includes(expected + ' 대표</span>'));
    assert.ok(desk.handle('endWeek'));
    assert.ok(desk.html().includes(expected + ' 대표</span>'));
    desk.handle('again');
    assert.match(desk.html(), /id="partner-name"[^>]*value="한서진"/);
  }
});

test('사무실 책상 클릭으로 현금·빈자리·직원 이름표·해제가 반영되고 사건 배정 선택은 유지된다', () => {
  const { doc, desk } = mounted(8);
  const html = () => doc.nodes.app.innerHTML;
  const act = (name, anchor, staff) => {
    const attrs = 'data-act="' + name + '" data-anchor="' + anchor + '"' + (staff ? ' data-staff="' + staff + '"' : '');
    assert.ok(html().includes(attrs), attrs);
    doc.click(name, { anchor, staff });
  };
  clickRendered(doc, 'start');
  clickRendered(doc, 'panel', { id: 'cases' });
  const table = () => html().match(/<section class="office-detail" id="detail-cases"[\s\S]*?<\/section>/)[0];
  const before = table();
  assert.match(html(), /id="anchor-B"[^>]*disabled/);
  clickRendered(doc, 'unlockDesk', { number: '2' });
  assert.match(html(), /<span>자금<\/span><strong>900만<\/strong>/);
  act('placeDesk', 'C');
  act('chooseDesk', 'C');
  assert.doesNotMatch(html(), /aria-label="C 책상 관리"/);
  act('chooseDesk', 'C');
  act('seatStaff', 'C', 'kim');
  assert.match(html(), /class="iso-nameplate" data-seat="C"[^>]*>[\s\S]*?<text[^>]*>김 사무원<\/text>/);
  act('clearDesk', 'C');
  assert.doesNotMatch(html(), /class="iso-nameplate" data-seat="C"/);
  assert.equal(desk.state().desks.placements.C, null);
  act('seatStaff', 'C', 'park');
  act('removeDesk', 'C');
  assert.deepEqual(desk.state().desks.placements, { A: null });
  assert.match(html(), /id="anchor-C"[^>]*data-act="placeDesk"[^>]*책상 놓기/);
  assert.equal(table(), before);
});
