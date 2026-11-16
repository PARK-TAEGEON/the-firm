'use strict';
// PORTFOLIO-001 핵심 검증: 연결 규칙, 결정성, 원자성, 저장 복원. node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Firm = require('../vendor/firm/engine.js');
const Case = require('../vendor/court/data/demo-separated-moments.js');
const Bridge = require('../src/bridge.js');
const Game = require('../src/session.js');

const trial = (g, action, payload) => g.command('court', { action: 'trial', payload: { action, payload: payload || {} } });
function must(res) { assert.equal(res.ok, true, res.error); }

function playWeek(g, { accept = false, assign = {} } = {}) {
  must(g.command('newGame')); must(g.command('finishIntro'));
  must(g.command('firm', { action: { type: accept ? 'ACCEPT_INTAKE' : 'DECLINE_INTAKE' } }));
  for (const [taskId, staffId] of Object.entries(assign)) must(g.command('firm', { action: { type: 'ASSIGN_TASK', taskId, staffId } }));
  while (g.view().scene === 'office') must(g.command('firm', { action: { type: 'ADVANCE_DAY' } }));
}

// 공판을 정해진 방침으로 끝까지 진행한다(자료가 있는 접근법을 모두 쓰고 한정 결론만 요구).
function playTrial(g, { prosecutorId = 'novice', consult = 'ADV_SIG_REVISE', objectTo = [] } = {}) {
  must(g.command('beginPrep', { prosecutorId }));
  if (consult) must(g.command('court', { action: 'consult', payload: { adviceId: consult } }));
  for (const inv of g.view().court.trial.investigations) {
    if (g.view().court.trial.projection.budgetLeft < 1) break;
    must(trial(g, 'investigate', { id: inv.id }));
  }
  for (const c of g.view().court.trial.cards) if (c.filing === 'required') must(trial(g, 'fileEvidence', { id: c.id, status: 'filed' }));
  must(trial(g, 'finishPrep'));
  must(trial(g, 'open', { focusId: 'F_SIG_CAUSE', stanceId: 'S_SIG_RESERVE' }));
  const ex = g.view().court.trial.exhibits;
  must(trial(g, 'evidenceOpinions', { opinions: Object.fromEntries(ex.map(x => [x.id, x.witnessId ? 'disagree' : 'agree'])) }));
  for (let i = 0; i < 200 && g.view().scene === 'court'; i++) {
    const t = g.view().court.trial, st = t.state;
    if (st.pending) { must(st.pending.type === 'objection' ? trial(g, 'objection', { object: objectTo.includes(st.pending.stepId) }) : trial(g, 'rebut', { use: true })); continue; }
    if (t.actions.closing) { must(trial(g, 'closingArgument', { id: 'FINAL_SIG_CAUSE' })); continue; }
    if (t.actions.verdict) { must(trial(g, 'verdict')); continue; }
    if (st.cursor.part === 'cross') {
      const a = t.actions.approaches.find(x => x.available && x.cards.length);
      const p = t.actions.presses.find(x => x.available && x.kind === 'limited');
      must(a ? trial(g, 'approach', { id: a.id }) : p ? trial(g, 'press', { id: p.id }) : trial(g, 'endCross'));
      continue;
    }
    must(trial(g, 'continue'));
  }
  assert.equal(g.view().scene, 'result');
}

test('연결 규칙: 기록 검토 완료 시점이 공판 준비 횟수를 정한다', () => {
  assert.equal(Bridge.tierFor(3, 3).budget, 4);
  assert.equal(Bridge.tierFor(4, 3).budget, 3);
  assert.equal(Bridge.tierFor(null, 3).budget, 2);
});

test('세 단계 모두 실제 한 주 플레이로 도달할 수 있다', () => {
  // 담당자 조합을 전부 돌려 도달 가능한 단계를 모은다(수임 여부 포함). 무작위 없음.
  const reached = {};
  const lawyers = ['lee', 'kim', 'park'], anyone = ['lee', 'kim', 'park', 'han'];
  for (const accept of [false, true]) for (const org of anyone) for (const rev of lawyers) for (const memo of lawyers) for (const gr of lawyers) {
    const g = Game.createGame();
    playWeek(g, { accept, assign: { 'jung-organize': org, 'jung-review': rev, 'go-memo': memo, 'go-review': gr } });
    const prep = g.view().prep;
    reached[prep.tierId] = reached[prep.tierId] || { accept, org, rev, memo, gr };
  }
  assert.deepEqual(Object.keys(reached).sort(), ['late', 'on_time', 'unfinished']);
  // 기본 배정(아무것도 바꾸지 않음)은 기한을 넘긴다: 플레이어의 조정이 의미를 가진다.
  const g = Game.createGame(); playWeek(g);
  assert.equal(g.view().prep.tierId, 'late');
});

test('사건 정의 원본은 바뀌지 않는다', () => {
  const before = JSON.stringify(Case);
  const copy = Bridge.caseForTrial(Case, 2);
  assert.equal(copy.variants.novice.prep.budget, 2);
  assert.equal(JSON.stringify(Case), before);
  assert.throws(() => Bridge.caseForTrial(Case, 5));
});

test('한 판 전체: 한 주 → 공판 → 결산이 이어지고, 준비 횟수가 공판에 반영된다', () => {
  const g = Game.createGame();
  playWeek(g, { assign: { 'jung-organize': 'park' } });
  const prep = g.view().prep;
  playTrial(g);
  const v = g.view();
  assert.equal(v.court.trial.definition.prep.budget, prep.budget);
  assert.ok(Bridge.OUTCOME_ORDER.includes(v.court.outcome.key));
  assert.equal(v.settlement.successFee, Bridge.SUCCESS_FEE[v.court.outcome.key]);
  assert.equal(v.settlement.finalCash, v.summary.cash + v.settlement.successFee);
});

test('결정성: 같은 선택은 같은 기록과 같은 판결을 만든다', () => {
  const run = () => { const g = Game.createGame(); playWeek(g, { accept: true }); playTrial(g, { prosecutorId: 'veteran' }); return g.view(); };
  const a = run(), b = run();
  assert.deepEqual(a.court.trial.records, b.court.trial.records);
  assert.deepEqual(a.settlement, b.settlement);
});

test('준비가 결과를 바꾼다: 같은 법정 방침이라도 준비 횟수에 따라 판결이 달라진다', () => {
  const outcome = assign => { const g = Game.createGame(); playWeek(g, { assign }); playTrial(g, { objectTo: ['OBJ_SIG_OBSERVER_VALID', 'OBJ_SIG_INVESTIGATOR_VALID'] }); return { key: g.view().court.outcome.key, budget: g.view().prep.budget }; };
  const full = outcome({ 'jung-organize': 'park' }), short = outcome({});
  assert.equal(full.budget, 4); assert.equal(short.budget, 3);
  assert.ok(Bridge.OUTCOME_ORDER.indexOf(full.key) >= Bridge.OUTCOME_ORDER.indexOf(short.key));
});

test('원자성: 실패한 명령은 상태와 저장 기록을 바꾸지 않는다', () => {
  const g = Game.createGame(); playWeek(g);
  const before = JSON.stringify(g.exportSave());
  assert.equal(g.command('firm', { action: { type: 'ADVANCE_DAY' } }).ok, false);
  assert.equal(g.command('court', { action: 'trial', payload: { action: 'continue' } }).ok, false);
  assert.equal(g.command('beginPrep', { prosecutorId: 'nobody' }).ok, false);
  assert.equal(JSON.stringify(g.exportSave()), before);
  must(g.command('beginPrep', { prosecutorId: 'novice' }));
  const mid = JSON.stringify(g.exportSave());
  assert.equal(trial(g, 'investigate', { id: 'NOPE' }).ok, false);
  assert.equal(trial(g, 'verdict').ok, false);
  assert.equal(JSON.stringify(g.exportSave()), mid);
});

test('저장 복원: 공판 도중 저장을 다시 읽으면 같은 화면 상태가 된다', () => {
  const g = Game.createGame(); playWeek(g, { assign: { 'jung-organize': 'park' } });
  must(g.command('beginPrep', { prosecutorId: 'novice' }));
  must(trial(g, 'investigate', { id: 'INV_SIG_SEQUENCE' }));
  must(trial(g, 'finishPrep')); must(trial(g, 'open', { focusId: 'F_SIG_BALANCED', stanceId: 'S_SIG_RESERVE' }));
  const save = JSON.parse(JSON.stringify(g.exportSave()));
  const h = Game.createGame(save);
  assert.deepEqual(h.view(), g.view());
  assert.equal(Game.createGame().load({ v: 99 }).ok, false);
  const broken = JSON.parse(JSON.stringify(save)); broken.courtLog.push({ action: 'trial', payload: { action: 'verdict' } });
  const k = Game.createGame(); assert.equal(k.load(broken).ok, false); assert.equal(k.view().scene, 'title');
});

test('경계: 엔진 원본과 UI에 사건 판정 로직이 섞이지 않는다', () => {
  const src = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  // vendor 원본은 PROVENANCE.json의 해시와 같아야 한다(수정 금지).
  const prov = JSON.parse(src('vendor/PROVENANCE.json'));
  const crypto = require('node:crypto');
  for (const f of prov.files) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', f.path))).digest('hex'), f.sha256, f.path);
  // UI는 엔진을 직접 부르지 않고 session 서비스만 쓴다. 무작위도 쓰지 않는다.
  const ui = src('src/ui.js');
  for (const banned of ['FirmEngine', 'FirmDemoSession', 'FirmTrial', 'Math.random']) assert.equal(ui.includes(banned), false, 'ui.js must not use ' + banned);
  assert.equal(src('src/bridge.js').includes('Math.random'), false);
  assert.equal(src('src/session.js').includes('Math.random'), false);
});
