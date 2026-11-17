'use strict';
// PORTFOLIO-002 핵심 검증: 연결 규칙, 계획 → 자동 공판, 개입, 결정성, 원자성, 저장 복원, 경계. node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Case = require('../vendor/court/data/demo-separated-moments.js');
const Bridge = require('../src/bridge.js');
const Plan = require('../src/plan.js');
const Game = require('../src/session.js');

function must(res) { assert.equal(res.ok, true, res.error); }

function playWeek(g, { accept = false, assign = {} } = {}) {
  must(g.command('newGame')); must(g.command('finishIntro'));
  must(g.command('firm', { action: { type: accept ? 'ACCEPT_INTAKE' : 'DECLINE_INTAKE' } }));
  for (const [taskId, staffId] of Object.entries(assign)) must(g.command('firm', { action: { type: 'ASSIGN_TASK', taskId, staffId } }));
  while (g.view().scene === 'office') must(g.command('firm', { action: { type: 'ADVANCE_DAY' } }));
  must(g.command('beginPlan'));
}
// 계획을 날인하고, 묻는 순간마다 같은 답을 준다.
function playTrial(g, { object = true } = {}) {
  must(g.command('sealPlan'));
  let asks = 0;
  while (g.view().scene === 'court') { asks += 1; must(g.command('decide', { object })); }
  assert.equal(g.view().scene, 'result');
  return asks;
}
const ON_TIME = { 'jung-organize': 'park' };

test('연결 규칙: 기록 검토 시점과 기록 분석이 확인 항목 수를 정한다', () => {
  assert.equal(Bridge.tierFor(3, 3).budget, 3);
  assert.equal(Bridge.tierFor(4, 3).budget, 2);
  assert.equal(Bridge.tierFor(null, 3).budget, 1);
  assert.equal(Plan.checkSlots('on_time', 'kim'), 4);
  assert.equal(Plan.checkSlots('on_time', 'lee'), 3);
  assert.equal(Plan.checkSlots('late', 'kim'), 3);
  assert.equal(Plan.checkSlots('unfinished', 'park'), 1);
});

test('세 단계 모두 실제 한 주 플레이로 도달하고, 기본 배정은 기한을 넘긴다', () => {
  const reached = new Set();
  const lawyers = ['lee', 'kim', 'park'], anyone = ['lee', 'kim', 'park', 'han'];
  for (const accept of [false, true]) for (const org of anyone) for (const rev of lawyers) for (const memo of lawyers) {
    const g = Game.createGame(); playWeek(g, { accept, assign: { 'jung-organize': org, 'jung-review': rev, 'go-memo': memo } });
    reached.add(g.view().plan.tierId);
  }
  assert.deepEqual([...reached].sort(), ['late', 'on_time', 'unfinished']);
  const g = Game.createGame(); playWeek(g);
  assert.equal(g.view().plan.tierId, 'late');
});

test('초안: 담당 변호사에 따라 확인 항목·합의 조언이 달라진다', () => {
  const kim = Plan.draft('late', 'kim'), park = Plan.draft('late', 'park');
  assert.equal(kim.checks.length, 3); assert.equal(kim.checks.includes('INV_SIG_SETTLE'), false); assert.equal(kim.advice, 'ADV_SIG_AS_IS');
  assert.equal(park.checks.length, 2); assert.equal(park.checks.includes('INV_SIG_SETTLE'), true); assert.equal(park.advice, 'ADV_SIG_REVISE');
  assert.throws(() => Plan.edit(kim, 'late', { field: 'check', value: 'INV_SIG_LAYOUT' }), /가득/);
  const swapped = Plan.edit(Plan.edit(kim, 'late', { field: 'check', value: 'INV_SIG_STATEMENT' }), 'late', { field: 'check', value: 'INV_SIG_LAYOUT' });
  assert.deepEqual(swapped.checks, ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL', 'INV_SIG_LAYOUT']);
  assert.deepEqual(swapped.edited, ['checks']);
  assert.deepEqual(kim.checks, ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL', 'INV_SIG_STATEMENT'], '원본 계획은 그대로');
});

test('사건 정의 원본은 바뀌지 않고, 신문 능력치만 사본의 질문 수를 늘린다', () => {
  const before = JSON.stringify(Case);
  const lee = Plan.trialCase(Plan.draft('late', 'lee')), kim = Plan.trialCase(Plan.draft('late', 'kim'));
  const t = (c, f, w) => c.variants.novice.opening.focus.find(x => x.id === f).time[w];
  assert.equal(t(lee, 'F_SIG_CAUSE', 'W_SIG_INVESTIGATOR'), t(kim, 'F_SIG_CAUSE', 'W_SIG_INVESTIGATOR') + 1);
  assert.equal(kim.variants.novice.prep.budget, 3);
  assert.equal(JSON.stringify(Case), before);
});

test('개입: 법정 대응이 낮은 변호사만 유도신문에서 플레이어에게 묻는다', () => {
  for (const [lawyerId, expected] of [['kim', 2], ['lee', 0], ['park', 2]]) {
    const g = Game.createGame(); playWeek(g);
    if (lawyerId !== 'kim') must(g.command('editPlan', { field: 'lawyer', value: lawyerId }));
    assert.equal(g.view().plan.asks, expected);
    assert.equal(playTrial(g), expected, lawyerId);
  }
});

test('한 판 전체: 기본 초안은 폭행 유죄, 합의 상담을 넣고 문구를 고치면 공소기각', () => {
  const g = Game.createGame(); playWeek(g);
  playTrial(g);
  assert.equal(g.view().court.outcome.key, 'assault');
  must(g.command('retryTrial'));
  must(g.command('editPlan', { field: 'check', value: 'INV_SIG_STATEMENT' }));
  must(g.command('editPlan', { field: 'check', value: 'INV_SIG_SETTLE' }));
  must(g.command('editPlan', { field: 'advice', value: 'ADV_SIG_REVISE' }));
  playTrial(g);
  const v = g.view();
  assert.equal(v.court.outcome.key, 'dismissal');
  assert.equal(v.settlement.courtFee, 45000 * 8);
  assert.equal(v.settlement.finalCash, v.summary.cash + v.settlement.successFee - v.settlement.courtFee);
  assert.equal(v.runs, 2);
});

test('개입의 답이 판결을 바꾼다: 유도신문을 그냥 두면 상해 유죄', () => {
  const g = Game.createGame(); playWeek(g);
  playTrial(g, { object: false });
  assert.equal(g.view().court.outcome.key, 'injury');
});

test('결정성: 같은 선택은 같은 기록과 같은 판결을 만든다', () => {
  const run = () => { const g = Game.createGame(); playWeek(g, { accept: true, assign: ON_TIME }); must(g.command('editPlan', { field: 'lawyer', value: 'park' })); playTrial(g); return g.view(); };
  const a = run(), b = run();
  assert.deepEqual(a.court.trial.records, b.court.trial.records);
  assert.deepEqual(a.settlement, b.settlement);
});

test('원자성: 실패한 명령은 상태와 저장 기록을 바꾸지 않는다', () => {
  const g = Game.createGame(); playWeek(g);
  const before = JSON.stringify(g.exportSave());
  for (const [a, p] of [['firm', { action: { type: 'ADVANCE_DAY' } }], ['decide', { object: true }], ['editPlan', { field: 'lawyer', value: 'nobody' }], ['editPlan', { field: 'stance', value: 'S_NOPE' }], ['editPlan', { field: 'check', value: 'INV_SIG_LAYOUT' }], ['retryTrial', {}]]) {
    assert.equal(g.command(a, p).ok, false, a);
  }
  assert.equal(JSON.stringify(g.exportSave()), before);
  must(g.command('sealPlan'));
  assert.equal(g.view().scene, 'court');
  const mid = JSON.stringify(g.exportSave());
  assert.equal(g.command('decide', { object: 'yes' }).ok, false);
  assert.equal(g.command('editPlan', { field: 'focus', value: 'F_SIG_ACT' }).ok, false);
  assert.equal(JSON.stringify(g.exportSave()), mid);
});

test('저장 복원: 결정 대기 중 저장을 다시 읽으면 같은 화면 상태가 된다', () => {
  const g = Game.createGame(); playWeek(g, { assign: ON_TIME });
  must(g.command('sealPlan'));
  const save = JSON.parse(JSON.stringify(g.exportSave()));
  const h = Game.createGame(save);
  assert.deepEqual(h.view(), g.view());
  must(h.command('decide', { object: true })); must(g.command('decide', { object: true }));
  assert.deepEqual(h.view(), g.view());
  assert.equal(Game.createGame().load({ v: 1 }).ok, false);
  const broken = JSON.parse(JSON.stringify(save)); broken.courtLog.push({ action: 'trial', payload: { action: 'verdict' } });
  const k = Game.createGame(); assert.equal(k.load(broken).ok, false); assert.equal(k.view().scene, 'title');
  const forged = JSON.parse(JSON.stringify(save)); forged.plan.slots = 2;
  assert.equal(Game.createGame().load(forged).ok, false);
});

test('경계: 엔진 원본과 UI에 판정 로직이 섞이지 않는다', () => {
  const src = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const prov = JSON.parse(src('vendor/PROVENANCE.json'));
  const crypto = require('node:crypto');
  for (const f of prov.files) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', f.path))).digest('hex'), f.sha256, f.path);
  const ui = src('src/ui.js');
  for (const banned of ['FirmEngine', 'FirmDemoSession', 'FirmTrial', 'FirmPlan', 'Math.random']) assert.equal(ui.includes(banned), false, 'ui.js must not use ' + banned);
  for (const f of ['src/bridge.js', 'src/session.js', 'src/plan.js', 'src/case-sheet.js']) assert.equal(src(f).includes('Math.random'), false, f);
});

test('위임/조정: 줄을 맡기면 초안으로 돌아가고, 되돌리기는 직전 계획을 복원한다', () => {
  const g = Game.createGame(); playWeek(g);
  const draft = g.view().plan.plan;
  must(g.command('editPlan', { field: 'stance', value: 'S_SIG_DENY' === draft.stance ? 'S_SIG_ADMIT' : g.view().plan.stances.find(s => s.id !== draft.stance).id }));
  must(g.command('editPlan', { field: 'check', value: g.view().plan.plan.checks[0] }));
  assert.ok(g.view().plan.canUndo);
  must(g.command('undoPlan'));
  assert.deepEqual(g.view().plan.plan.checks, draft.checks);
  assert.notEqual(g.view().plan.plan.stance, draft.stance);
  must(g.command('editPlan', { field: 'reset', value: 'stance' }));
  assert.equal(g.view().plan.plan.stance, draft.stance);
  assert.ok(!g.view().plan.plan.edited.includes('stance'));
  must(g.command('editPlan', { field: 'check', value: g.view().plan.plan.checks[0] }));
  must(g.command('editPlan', { field: 'reset', value: 'all' }));
  assert.deepEqual(g.view().plan.plan, draft);
  assert.equal(g.command('editPlan', { field: 'reset', value: 'lawyerId' }).ok, false);
  must(g.command('sealPlan'));
  assert.equal(g.command('undoPlan').ok, false);
});

test('받은 편지함: 새 의뢰는 결정 전까지 응답 필요, 하루가 지나면 보고가 맨 위에 온다', () => {
  const g = Game.createGame(); must(g.command('newGame')); must(g.command('finishIntro'));
  let box = g.view().inbox;
  assert.equal(box.filter(m => m.must).length, 1);
  must(g.command('firm', { action: { type: 'DECLINE_INTAKE' } }));
  must(g.command('firm', { action: { type: 'ADVANCE_DAY' } }));
  box = g.view().inbox;
  assert.equal(box.filter(m => m.must).length, 0);
  assert.equal(box[0].tag, 'report'); assert.equal(box[0].id, 'report-0');
});
