'use strict';
// v0.10 Adversarial Trial — engine/service regressions.
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../data/trial-case');
const T = require('../engine/trial');
const { createTrialService } = require('../services/trial');

function ok(s, action, payload) { const r = s.command(action, payload); assert.equal(r.ok, true, action + ': ' + r.error); return r.view; }
function unchanged(s, action, payload) { const before = s.projection(); const r = s.command(action, payload); assert.equal(r.ok, false, action + ' should fail'); assert.deepEqual(s.projection(), before); return r.error; }

// Plays the whole trial. plan: { prep, focus, stance, object: {stepId: bool}, rebut: bool, W_SEO: [...], W_HAN: [...] }
function play(plan) {
  const s = createTrialService(D);
  (plan.prep || []).forEach(id => ok(s, 'investigate', { id }));
  ok(s, 'finishPrep');
  ok(s, 'open', { focusId: plan.focus || 'F_BALANCED', stanceId: plan.stance || 'S_SILENT' });
  const queues = { W_SEO: [...(plan.W_SEO || [])], W_HAN: [...(plan.W_HAN || [])] };
  let v = s.projection(), guard = 0;
  while (v.state.phase === 'trial' && guard++ < 300) {
    const st = v.state;
    if (st.pending) {
      v = st.pending.type === 'objection' ? ok(s, 'objection', { object: !!(plan.object || {})[st.pending.stepId] }) : ok(s, 'rebut', { use: plan.rebut !== false });
      continue;
    }
    if (v.actions.verdict) { v = ok(s, 'verdict'); break; }
    if (st.cursor.part === 'cross') {
      const q = queues[v.witness.id].shift();
      v = !q ? ok(s, 'endCross') : ok(s, q.startsWith('P_') ? 'press' : 'approach', { id: q });
      continue;
    }
    v = ok(s, 'continue');
  }
  assert.equal(v.state.phase, 'verdict');
  return { s, v };
}
const band = (v, id) => v.projection.issues.find(i => i.id === id).band;

const IDENTITY_PLAN = { prep: ['INV_RECORDS', 'INV_SCENE'], focus: 'F_IDENTITY', object: { OBJ_SEO_LEADING: true }, W_SEO: ['A_SEO_OBSERVE', 'A_SEO_INITIAL', 'P_SEO_LIMITED'], W_HAN: ['A_HAN_TIMING'] };
const KNIFE_PLAN = { prep: ['INV_REPORT', 'INV_CLIENT'], focus: 'F_KNIFE', stance: 'S_ADMIT', W_SEO: ['A_SEO_TIME'], W_HAN: ['A_HAN_TIMING', 'A_HAN_PRIOR', 'P_HAN_LIMITED'] };

test('definition validates and service does not mutate input', () => {
  const before = T.copy(D);
  assert.ok(T.validate(D));
  play(IDENTITY_PLAN);
  assert.deepEqual(D, before);
});

test('validation rejects broken references', () => {
  const bad = T.copy(D); bad.investigations[0].grants = ['CARD_NOPE'];
  assert.throws(() => T.validate(bad), /grant/);
  const dup = T.copy(D); dup.cards[1].id = dup.cards[0].id;
  assert.throws(() => T.validate(dup), /duplicate/);
  const time = T.copy(D); delete time.opening.focus[0].time.W_HAN;
  assert.throws(() => T.validate(time), /focus time/);
  const neut = T.copy(D); neut.witnesses[0].approaches[2].neutralizes = ['RH_NONE'];
  assert.throws(() => T.validate(neut), /neutralizes/);
});

test('prep budget is enforced atomically and investigations are irreversible', () => {
  const s = createTrialService(D);
  ok(s, 'investigate', { id: 'INV_LUX' });
  ok(s, 'investigate', { id: 'INV_SCENE' });
  unchanged(s, 'investigate', { id: 'INV_SCENE' });
  ok(s, 'investigate', { id: 'INV_REPORT' });
  assert.equal(s.projection().projection.budgetLeft, 0);
  assert.match(unchanged(s, 'investigate', { id: 'INV_CLIENT' }), /시간/);
  unchanged(s, 'investigate', { id: 'INV_UNKNOWN' });
  assert.deepEqual(s.projection().projection.cards.sort(), ['CARD_DISTANCE', 'CARD_LIGHT_OFF', 'CARD_PRINT_TIMING', 'CARD_SIGN_ANGLE'].sort());
});

test('prosecution exhibits stay sealed until records are inspected; client reinterview adds a statement', () => {
  const s = createTrialService(D);
  assert.ok(s.projection().exhibits.every(x => !x.revealed && x.content === null));
  assert.equal(s.projection().clientStatements.length, 1);
  ok(s, 'investigate', { id: 'INV_RECORDS' });
  assert.ok(s.projection().exhibits.every(x => x.revealed && x.content));
  ok(s, 'investigate', { id: 'INV_CLIENT' });
  assert.equal(s.projection().clientStatements.length, 2);
});

test('phase gates: commands out of phase fail without state change', () => {
  const s = createTrialService(D);
  unchanged(s, 'open', { focusId: 'F_BALANCED', stanceId: 'S_SILENT' });
  unchanged(s, 'continue');
  unchanged(s, 'verdict');
  ok(s, 'finishPrep');
  unchanged(s, 'investigate', { id: 'INV_SCENE' });
  unchanged(s, 'open', { focusId: 'F_BALANCED' });
  ok(s, 'open', { focusId: 'F_BALANCED', stanceId: 'S_SILENT' });
  unchanged(s, 'open', { focusId: 'F_BALANCED', stanceId: 'S_SILENT' });
  unchanged(s, 'approach', { id: 'A_SEO_TIME' });
  unchanged(s, 'objection', { object: true });
  unchanged(s, 'rebut', { use: true });
});

test('objection window blocks progress until decided', () => {
  const s = createTrialService(D);
  ok(s, 'finishPrep'); ok(s, 'open', { focusId: 'F_BALANCED', stanceId: 'S_SILENT' });
  let v; for (let i = 0; i < 4; i++) v = ok(s, 'continue');
  assert.equal(v.state.pending.type, 'objection');
  unchanged(s, 'continue');
  v = ok(s, 'objection', { object: true });
  assert.equal(v.records.at(-1).ruling, 'sustained');
});

test('bait objection is overruled and costs judge credibility', () => {
  const baited = play({ object: { OBJ_HAN_EXPERT: true } }).v;
  const calm = play({}).v;
  assert.equal(baited.records.find(r => r.refId === 'OBJ_HAN_EXPERT' && r.kind === 'objection').ruling, 'overruled');
  assert.equal(baited.projection.credibility, calm.projection.credibility - 1);
  assert.ok(baited.review.backfired.some(b => /기각/.test(b.text)));
});

test('approaches require prepared cards; time is limited per opening focus', () => {
  const s = createTrialService(D);
  ok(s, 'finishPrep'); ok(s, 'open', { focusId: 'F_KNIFE', stanceId: 'S_SILENT' });
  let v = s.projection();
  while (v.state.cursor.part !== 'cross') v = v.state.pending ? ok(s, 'objection', { object: false }) : ok(s, 'continue');
  assert.equal(v.witness.time, 2);
  assert.equal(v.actions.approaches.find(a => a.id === 'A_SEO_OBSERVE').available, false);
  assert.match(unchanged(s, 'approach', { id: 'A_SEO_OBSERVE' }), /준비/);
  assert.match(unchanged(s, 'press', { id: 'P_SEO_LIMITED' }), /근거/);
  ok(s, 'approach', { id: 'A_SEO_TIME' });
  unchanged(s, 'approach', { id: 'A_SEO_TIME' });
  v = ok(s, 'press', { id: 'P_SEO_OVER' });
  assert.equal(v.state.cursor.part, 'redirect', 'cross ends automatically when time runs out');
  assert.equal(v.records.filter(r => r.kind === 'cross_end').at(-1).timeUp, true);
});

test('no preparation leads to conviction', () => {
  const { v } = play({ W_SEO: ['A_SEO_TIME', 'P_SEO_LIMITED'], W_HAN: ['A_HAN_TIMING', 'P_HAN_LIMITED'] });
  assert.equal(v.verdict.outcome, 'guilty');
  assert.ok(v.review.missed.length >= 3);
});

test('identity-focused preparation can win; knife-focused preparation can win', () => {
  const a = play(IDENTITY_PLAN).v;
  assert.equal(a.verdict.outcome, 'not_guilty');
  assert.equal(band(a, 'ISSUE_IDENTITY'), 'doubt');
  assert.notEqual(band(a, 'ISSUE_KNIFE'), 'doubt');
  const b = play(KNIFE_PLAN).v;
  assert.equal(b.verdict.outcome, 'not_guilty');
  assert.equal(band(b, 'ISSUE_KNIFE'), 'doubt');
  assert.notEqual(band(b, 'ISSUE_IDENTITY'), 'doubt');
});

test('limited press succeeds only with enough grounds; overreach always backfires', () => {
  const early = play({ prep: ['INV_SCENE'], W_SEO: ['A_SEO_TIME', 'P_SEO_LIMITED'] }).v;
  const earlyPress = early.records.find(r => r.refId === 'P_SEO_LIMITED');
  assert.equal(earlyPress.succeeded, false);
  assert.ok(earlyPress.effects[0][1] > 0);
  const ready = play({ prep: ['INV_SCENE'], W_SEO: ['A_SEO_OBSERVE', 'A_SEO_TIME', 'P_SEO_LIMITED'] }).v;
  assert.equal(ready.records.find(r => r.refId === 'P_SEO_LIMITED').succeeded, true);
  for (const plan of [{ W_SEO: ['A_SEO_TIME', 'P_SEO_OVER'] }, { prep: ['INV_REPORT', 'INV_CLIENT'], stance: 'S_ADMIT', W_HAN: ['A_HAN_TIMING', 'A_HAN_PRIOR', 'P_HAN_OVER'] }]) {
    const over = play(plan).v.records.find(r => r.pressKind === 'overreach');
    assert.equal(over.succeeded, false); assert.ok(over.effects[0][1] > 0); assert.equal(over.credibility, -1);
  }
});

test('sign-light redirect: rebuttal card neutralizes it, absence is reported as missed prep', () => {
  const base = { focus: 'F_IDENTITY', W_SEO: ['A_SEO_OBSERVE', 'A_SEO_TIME', 'P_SEO_LIMITED'] };
  const withLux = play({ ...base, prep: ['INV_SCENE', 'INV_LUX'] }).v;
  assert.ok(withLux.records.some(r => r.kind === 'rebuttal' && r.refId === 'RH_SIGN_LIGHT'));
  assert.ok(!withLux.review.missed.some(m => /조도/.test(m.text)));
  const without = play({ ...base, prep: ['INV_SCENE'] }).v;
  assert.ok(without.records.some(r => r.kind === 'redirect' && r.refId === 'RH_SIGN_LIGHT'));
  assert.ok(without.review.missed.some(m => /조도/.test(m.text)));
  assert.ok(band(withLux, 'ISSUE_IDENTITY') === 'doubt');
  const skipped = play({ ...base, prep: ['INV_SCENE', 'INV_LUX'], rebut: false }).v;
  assert.ok(skipped.records.some(r => r.kind === 'rebuttal_pass'));
  assert.ok(skipped.review.missed.some(m => /제시하지 않아/.test(m.text)));
});

test('initial-statement contrast neutralizes the familiarity redirect', () => {
  const v = play(IDENTITY_PLAN).v;
  const fam = v.records.find(r => r.refId === 'RH_FAMILIARITY');
  assert.equal(fam.neutralized, true); assert.deepEqual(fam.effects, []);
  const w = play({ prep: ['INV_SCENE'], W_SEO: ['A_SEO_OBSERVE'] }).v.records.find(r => r.refId === 'RH_FAMILIARITY');
  assert.equal(w.neutralized, false); assert.equal(w.effects[0][1], 1);
});

test('opening denial is attacked by the prosecutor; client reinterview reveals the trap', () => {
  const deny = play({ ...KNIFE_PLAN, stance: 'S_DENY' }).v;
  assert.ok(deny.records.some(r => r.refId === 'D_HAN_DENY' && r.conflict));
  assert.ok(deny.records.some(r => r.kind === 'stance_conflict'));
  assert.equal(deny.verdict.outcome, 'guilty');
  assert.ok(deny.projection.credibility < D.credibility.start);
  const noCard = play({ prep: ['INV_REPORT'], stance: 'S_DENY', W_HAN: ['A_HAN_TIMING'] }).v;
  assert.ok(noCard.review.missed.some(m => /의뢰인/.test(m.text)));
  const admitNoCard = play({ prep: ['INV_REPORT'], stance: 'S_ADMIT', W_HAN: ['A_HAN_TIMING'] }).v;
  assert.ok(admitNoCard.records.some(r => r.refId === 'D_HAN_ADMIT'));
  const admitWithCard = play(KNIFE_PLAN).v;
  assert.ok(!admitWithCard.records.some(r => r.refId === 'D_HAN_ADMIT'));
});

test('low credibility shortens the next cross-examination', () => {
  const v = play({ stance: 'S_DENY', object: { OBJ_SEO_LEADING: false }, W_SEO: ['A_SEO_TIME', 'P_SEO_OVER'], prep: ['INV_CLIENT'], W_HAN: ['A_HAN_PRIOR'] }).v;
  const han = v.records.find(r => r.kind === 'cross_start' && r.witnessId === 'W_HAN');
  assert.equal(han.warned, true);
  assert.equal(han.time, D.opening.focus.find(f => f.id === 'F_BALANCED').time.W_HAN - 1);
});

test('determinism and record-only replay', () => {
  const a = play(IDENTITY_PLAN).v, b = play(IDENTITY_PLAN).v;
  const strip = rs => rs.map(r => ({ ...r, id: null }));
  assert.deepEqual(strip(a.records), strip(b.records));
  const replayed = T.replay(D, JSON.parse(JSON.stringify(a.records)));
  assert.deepEqual(replayed.projection, a.projection);
  assert.equal(replayed.verdict.outcome, a.verdict.outcome);
  assert.deepEqual(T.review(D, a.records), a.review);
});

test('records are append-only across commands and reset starts clean', () => {
  const s = createTrialService(D);
  ok(s, 'investigate', { id: 'INV_SCENE' });
  const first = s.projection().records[0];
  ok(s, 'finishPrep'); ok(s, 'open', { focusId: 'F_BALANCED', stanceId: 'S_SILENT' }); ok(s, 'continue');
  assert.deepEqual(s.projection().records[0], first);
  const ids = s.projection().records.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length);
  const v = ok(s, 'reset');
  assert.equal(v.records.length, 0); assert.equal(v.state.phase, 'prep'); assert.equal(v.projection.budgetLeft, D.prep.budget);
  ok(s, 'investigate', { id: 'INV_SCENE' });
  assert.ok(!ids.includes(s.projection().records[0].id), 'new session ids never reuse old ids');
});

test('projection exposes no numeric win probability or issue strength to the UI text', () => {
  const v = play(IDENTITY_PLAN).v;
  v.projection.issues.forEach(i => assert.equal(typeof i.memo, 'string'));
  assert.ok(['guilty', 'not_guilty'].includes(v.verdict.outcome));
  assert.ok(!/\d+\s*%/.test(JSON.stringify(D)));
});

test('engine and service do not inspect case-specific ids', () => {
  const fs = require('node:fs'), path = require('node:path');
  for (const f of ['../engine/trial.js', '../services/trial.js', '../ui/trial-app.js']) {
    const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
    assert.ok(!/(CARD_|INV_|W_SEO|W_HAN|S_DENY|S_ADMIT|RH_|ISSUE_)/.test(src), f);
  }
});
