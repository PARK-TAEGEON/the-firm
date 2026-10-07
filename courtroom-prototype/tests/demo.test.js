'use strict';
// DEMO-001 — automated path, settlement, determinism and invariant tests (node --test tests/demo.test.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const C = require('../data/demo-separated-moments');
const PACK = require('../data/demo-ko-pack');
const DAILY = require('../data/demo-daily-cases');
const T = require('../engine/trial');
const { createTrialService } = require('../services/trial');
const { createDemoSession } = require('../services/demo-session');
const O = require('../services/demo-outcome');

const OBS = 'W_SIG_OBSERVER', INV = 'W_SIG_INVESTIGATOR', ACT = 'ISSUE_SIG_ACT', CAUSE = 'ISSUE_SIG_CAUSE';
const VALID = ['OBJ_SIG_OBSERVER_VALID', 'OBJ_SIG_INVESTIGATOR_VALID'];
const session = () => createDemoSession({ cases: [C], daily: DAILY, pack: PACK });
function ok(s, action, payload) { const r = s.command(action, payload); assert.equal(r.ok, true, action + ' ' + JSON.stringify(payload) + ': ' + r.error); return r.view; }
const tr = (s, action, payload) => ok(s, 'trial', { action, payload });
function unchanged(s, action, payload) { const before = s.projection(); const r = s.command(action, payload); assert.equal(r.ok, false, action + ' should fail'); assert.deepEqual(s.projection(), before); return r.error; }

// Plays a whole demo through the session service. plan: { prep, advice, focus, stance, object: [stepId], rebut, obs: [...], inv: [...] }
function play(prosecutorId, plan, caseData = C) {
  const s = createDemoSession({ cases: [caseData], daily: DAILY, pack: PACK });
  ok(s, 'start', { caseId: C.id, prosecutorId });
  (plan.prep || []).forEach(id => tr(s, 'investigate', { id }));
  for (const card of s.projection().trial.cards) if (card.filing === 'required' && !card.rebuttal && plan.autoFile !== false) tr(s, 'fileEvidence', { id: card.id, status: 'filed' });
  if (plan.earlyLayout) tr(s, 'fileEvidence', { id: 'CARD_SIG_LAYOUT', status: 'filed' });
  if (plan.advice) ok(s, 'consult', { adviceId: plan.advice });
  tr(s, 'finishPrep');
  tr(s, 'open', { focusId: plan.focus || 'F_SIG_BALANCED', stanceId: plan.stance || 'S_SIG_RESERVE' });
  tr(s, 'evidenceOpinions', { opinions: plan.opinions || Object.fromEntries(C.variants[prosecutorId].prosecutionExhibits.map(x => [x.id, x.witnessId ? 'disagree' : 'agree'])) });
  if (!plan.earlyLayout && plan.autoFile !== false && s.projection().trial.cards.some(c => c.rebuttal)) tr(s, 'fileEvidence', { id: 'CARD_SIG_LAYOUT', status: 'filed' });
  if (plan.refileLayout) { tr(s,'fileEvidence',{id:'CARD_SIG_LAYOUT',status:'withheld'}); tr(s,'fileEvidence',{id:'CARD_SIG_LAYOUT',status:'filed'}); }
  const queues = { [OBS]: [...(plan.obs || [])], [INV]: [...(plan.inv || [])] };
  let v = s.projection(), guard = 0;
  while (v.trial.state.phase === 'trial' && guard++ < 300) {
    const t = v.trial, st = t.state;
    if (st.pending) { v = st.pending.type === 'objection' ? tr(s, 'objection', { object: (plan.object || []).includes(st.pending.stepId) }) : tr(s, 'rebut', { use: plan.rebut !== false }); continue; }
    if (t.actions.closing) { v = tr(s, 'closingArgument', { id: plan.final || 'FINAL_SIG_CAUSE' }); continue; }
    if (t.actions.verdict) { v = tr(s, 'verdict'); break; }
    if (st.cursor.part === 'cross') { const q = queues[t.witness.id].shift(); v = !q ? tr(s, 'endCross') : tr(s, q.startsWith('P_') ? 'press' : 'approach', { id: q }); continue; }
    v = tr(s, 'continue');
  }
  assert.equal(v.trial.state.phase, 'verdict');
  assert.ok(v.outcome, 'outcome after verdict');
  return { s, v, o: v.outcome };
}

// ---------- 대표 경로 ----------
const PATHS = {
  novice_acquittal: ['novice', { prep: ['INV_SIG_STATEMENT', 'INV_SIG_SEQUENCE'], focus: 'F_SIG_ACT', stance: 'S_SIG_RESERVE', obs: ['A_SIG_OBS_SCOPE', 'A_SIG_OBS_SEQUENCE', 'P_SIG_OBS_LIMITED'] }],
  novice_dismissal: ['novice', { prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL'], advice: 'ADV_SIG_REVISE', focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, inv: ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE', 'P_SIG_CAUSE_LIMITED'] }],
  novice_assault: ['novice', { prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL'], focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, inv: ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE', 'P_SIG_CAUSE_LIMITED'] }],
  novice_injury_fine: ['novice', { prep: ['INV_SIG_CLIENT'], advice: 'ADV_SIG_REVISE', focus: 'F_SIG_BALANCED', stance: 'S_SIG_CONTACT' }],
  novice_injury_suspended: ['novice', { prep: [], focus: 'F_SIG_BALANCED', stance: 'S_SIG_RESERVE' }],
  veteran_dismissal: ['veteran', { prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL', 'INV_SIG_LAYOUT'], advice: 'ADV_SIG_REVISE', focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, inv: ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE', 'P_SIG_CAUSE_LIMITED'] }],
  veteran_assault: ['veteran', { prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL', 'INV_SIG_LAYOUT', 'INV_SIG_CLIENT'], focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, inv: ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE', 'P_SIG_CAUSE_LIMITED'] }],
  veteran_surface_fine: ['veteran', { prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL', 'INV_SIG_CLIENT'], advice: 'ADV_SIG_REVISE', focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, inv: ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE', 'P_SIG_CAUSE_LIMITED'] }],
  veteran_injury_suspended: ['veteran', { prep: [], focus: 'F_SIG_BALANCED', stance: 'S_SIG_RESERVE' }],
  veteran_act_attack: ['veteran', { prep: ['INV_SIG_STATEMENT', 'INV_SIG_SEQUENCE'], focus: 'F_SIG_ACT', stance: 'S_SIG_RESERVE', obs: ['A_SIG_OBS_SCOPE', 'A_SIG_OBS_SEQUENCE', 'P_SIG_OBS_LIMITED'] }]
};
const run = name => play(...PATHS[name]);

test('definitions validate; the two prosecutor variants differ only in prosecutor behavior data', () => {
  const { novice, veteran } = C.variants;
  assert.ok(T.validate(novice)); assert.ok(T.validate(veteran));
  const shared = ['id', 'version', 'title', 'charge', 'client', 'briefing', 'clientStatements', 'prep', 'investigations', 'cards', 'prosecutionExhibits', 'issues', 'bands', 'adjudication', 'credibility', 'opening', 'lines', 'missedPrep'];
  shared.forEach(k => assert.deepEqual(novice[k], veteran[k], 'shared field ' + k));
  assert.deepEqual(novice.witnesses.map(w => [w.id, w.issue]), veteran.witnesses.map(w => [w.id, w.issue]));
  // 같은 출처·같은 쟁점 구조: 접근법·결론 요구·재주신문 ID 집합이 같다.
  novice.witnesses.forEach((w, i) => {
    const v = veteran.witnesses[i];
    ['approaches', 'presses', 'redirect'].forEach(k => assert.deepEqual(w[k].map(x => x.id), v[k].map(x => x.id), w.id + '.' + k));
  });
  // 서비스·엔진은 검사 버전을 읽지 않는다(숨은 판정 보너스 없음).
  ['services/demo-outcome.js', 'services/trial.js', 'engine/trial.js'].forEach(f => assert.doesNotMatch(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), /prosecutorProfile|veteran|novice/, f));
});

test('rule 3: redirect recovery is 0 for the novice and +1 for the veteran', () => {
  const d = id => Object.fromEntries(C.variants[id].witnesses.map(w => [w.id, w.redirect.map(r => r.delta)]));
  assert.deepEqual(d('novice'), { [OBS]: [0], [INV]: [0] });
  assert.deepEqual(d('veteran'), { [OBS]: [1], [INV]: [1] });
  const { v } = run('veteran_surface_fine');
  const rec = v.trial.records.find(r => r.kind === 'redirect' && r.witnessId === INV);
  assert.deepEqual(rec.effects, [[CAUSE, 1]]);
  const nv = run('novice_assault').v.trial.records.find(r => r.kind === 'redirect' && r.witnessId === INV);
  assert.deepEqual(nv.effects, [[CAUSE, 0]]);
});

test('rule 3: a sustained veteran objection costs the player one question of time and yields nothing', () => {
  const at = prosecutorId => {
    const s = session(); ok(s, 'start', { caseId: C.id, prosecutorId });
    tr(s, 'finishPrep'); tr(s, 'open', { focusId: 'F_SIG_CAUSE', stanceId: 'S_SIG_CONTACT' });
    tr(s, 'evidenceOpinions', { opinions: { PX_SIG_STATEMENT:'disagree', PX_SIG_REPORT:'disagree', PX_SIG_VIDEO:'agree', PX_SIG_MEDICAL:'agree' } });
    let v = s.projection();
    while (!(v.trial.state.cursor.part === 'cross' && v.trial.witness.id === INV)) v = v.trial.state.pending ? tr(s, 'objection', { object: false }) : v.trial.state.cursor.part === 'cross' ? tr(s, 'endCross') : tr(s, 'continue');
    const before = v.trial.witness.timeLeft;
    v = tr(s, 'approach', { id: 'A_SIG_CAUSE_OPINION' });
    const rec = v.trial.records[v.trial.records.length - 1];
    return { before, after: v.trial.witness.timeLeft, rec, points: v.trial.projection.witnesses.find(w => w.id === INV).points };
  };
  const vet = at('veteran'), nov = at('novice');
  assert.equal(vet.after, vet.before - 1);
  assert.ok(vet.rec.lines.some(l => l.speaker === 'PROSECUTOR' && /이의/.test(l.text)), 'veteran objects');
  assert.ok(vet.rec.lines.some(l => l.speaker === 'JUDGE' && /인용/.test(l.text)), 'judge sustains');
  assert.ok(!vet.rec.lines.some(l => l.speaker === INV), 'no answer after sustained objection');
  assert.deepEqual(vet.points, []);
  assert.deepEqual(nov.points, ['POINT_SIG_ROLE']);
  assert.ok(!nov.rec.lines.some(l => l.speaker === 'PROSECUTOR'), 'novice does not object');
});

test('rule 4 (§1.10): no-card questions never move the record; witness prep shows only in what is conceded after a card', () => {
  for (const v of Object.values(C.variants)) v.witnesses.forEach(w => w.approaches.filter(a => !(a.requiresAny || []).length).forEach(a => assert.equal(a.delta, 0, v.prosecutorProfile + ' ' + a.id)));
  const scope = id => C.variants[id].witnesses[0].approaches.find(a => a.id === 'A_SIG_OBS_SCOPE').delta;
  assert.equal(scope('novice'), -1); assert.equal(scope('veteran'), 0);
});

test('outcome: every result is reachable — 무죄 / 공소기각 / 폭행 유죄 / 상해 유죄 + 벌금 / 상해 유죄 + 집행유예', () => {
  const expect = {
    novice_acquittal: ['acquittal', null], novice_dismissal: ['dismissal', null], novice_assault: ['assault', 'fine'],
    novice_injury_fine: ['injury', 'fine'], novice_injury_suspended: ['injury', 'suspended'],
    veteran_dismissal: ['dismissal', null], veteran_assault: ['assault', 'fine'], veteran_surface_fine: ['injury', 'fine'],
    veteran_injury_suspended: ['injury', 'suspended'], veteran_act_attack: ['injury', 'suspended']
  };
  for (const [name, [key, sentence]] of Object.entries(expect)) {
    const { o } = run(name);
    assert.equal(o.key, key, name);
    assert.equal(o.sentence ? o.sentence.kind : null, sentence, name + ' sentence');
    assert.ok(o.next, name + ' has next-try line');
    assert.ok(o.reviewText, name + ' has review text');
    if (o.sentence) assert.equal(o.sentence.disclaimer, '실험용 단순화 — 실제 양형기준 아님');
  }
});

test('outcome labels and articles come from the ko pack', () => {
  const d = run('veteran_dismissal').o;
  assert.equal(d.judgment.label, PACK.judgments.dismissal.label);
  assert.equal(d.judgment.article, PACK.judgments.dismissal.article);
  assert.equal(d.offense.id, 'assault');
  assert.equal(d.victimWill, true);
  const i = run('novice_injury_fine').o;
  assert.equal(i.offense.label, PACK.offenses.injury.label);
  assert.equal(i.victimWill, true, '상해는 처벌불원이 있어도 공소기각이 아니라 양형 감경');
  assert.equal(i.sentence.text, PACK.sentencing.table.find(x => x.offense === 'injury' && x.victimWill).text);
});

test('review: shaken-band conviction is explained; blocked / broke lists come from records', () => {
  const { o, v } = run('veteran_surface_fine');
  assert.equal(o.issues.find(i => i.id === CAUSE).bandLabel, '다툼 있음');
  assert.equal(o.shaken.length, 1);
  assert.match(o.shaken[0], /합리적 의심/);
  assert.match(o.shaken[0], /재주신문/);
  assert.ok(o.blocked.some(b => /재주신문/.test(b.text)), 'blocked lists the recovered redirect');
  assert.ok(o.broke.length >= 3, 'broke lists effective defense records');
  const ids = new Set(v.trial.records.map(r => r.id));
  [...o.blocked, ...o.broke].forEach(x => assert.ok(ids.has(x.recordId), 'cites a real record'));
  assert.match(o.next, /가림막 뒤/);
  const dis = run('veteran_dismissal').o;
  assert.ok(dis.broke.some(b => /운반대/.test(b.text)), 'veteran breakthrough cites the layout rebuttal');
});

// ---------- 합의 ----------
test('settlement: client autonomy — good advice can be refused, refusal leaves no waiver, trial continues', () => {
  for (const adviceId of ['ADV_SIG_AS_IS', 'ADV_SIG_DECLINE']) {
    const s = session(); ok(s, 'start', { caseId: C.id, prosecutorId: 'novice' });
    const v = ok(s, 'consult', { adviceId });
    assert.equal(v.settlement.consult.accepted, false);
    assert.equal(v.settlement.filed, false);
    assert.equal(v.trial.projection.budgetLeft, 3, 'consult costs half a day even when refused');
    unchanged(s, 'consult', { adviceId: 'ADV_SIG_REVISE' }); // 한 번뿐 — 재시도로 승낙을 끌어내지 않는다
    tr(s, 'finishPrep');
    assert.equal(s.projection().trial.state.phase, 'opening');
  }
  const { o } = play('novice', { prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL'], advice: 'ADV_SIG_AS_IS', focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, inv: ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE', 'P_SIG_CAUSE_LIMITED'] });
  assert.equal(o.key, 'assault', 'refused settlement → no waiver → 폭행 유죄');
});

test('settlement: acceptance files the waiver before trial; settling does not end the trial', () => {
  const s = session(); ok(s, 'start', { caseId: C.id, prosecutorId: 'veteran' });
  const v = ok(s, 'consult', { adviceId: 'ADV_SIG_REVISE' });
  assert.deepEqual(v.records.map(r => r.kind), ['case_selected', 'settlement_consult', 'settlement_agreed', 'victim_will_filed']);
  assert.equal(v.trial.state.phase, 'prep');
  assert.equal(v.outcome, null);
  assert.ok(!v.trial.records.some(r => r.kind === 'verdict'));
});

test('settlement and session commands are atomic', () => {
  const s = session();
  unchanged(s, 'consult', { adviceId: 'ADV_SIG_REVISE' });
  unchanged(s, 'trial', { action: 'finishPrep' });
  unchanged(s, 'start', { caseId: C.id, prosecutorId: 'nobody' });
  unchanged(s, 'start', { caseId: 'NOPE', prosecutorId: 'novice' });
  ok(s, 'start', { caseId: C.id, prosecutorId: 'novice' });
  unchanged(s, 'start', { caseId: C.id, prosecutorId: 'veteran' });
  unchanged(s, 'trial', { action: 'investigate', payload: { id: 'INV_SIG_SETTLE' } });
  unchanged(s, 'consult', { adviceId: 'ADV_NOPE' });
  ['INV_SIG_STATEMENT', 'INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL', 'INV_SIG_LAYOUT'].forEach(id => tr(s, 'investigate', { id }));
  assert.equal(s.projection().settlement.available, false);
  assert.match(unchanged(s, 'consult', { adviceId: 'ADV_SIG_REVISE' }), /시간/);
  const s2 = session(); ok(s2, 'start', { caseId: C.id, prosecutorId: 'novice' }); tr(s2, 'finishPrep');
  unchanged(s2, 'consult', { adviceId: 'ADV_SIG_REVISE' });
  unchanged(s2, 'trial', { action: 'reset' });
  unchanged(s2, 'trial', { action: 'verdict' });
});

// ---------- 같은 기록이면 같은 결과 ----------
test('same record → same result (replay, re-run, and prosecutor label swap)', () => {
  for (const name of Object.keys(PATHS)) {
    const a = run(name), b = run(name);
    assert.deepEqual(a.v.trial.records, b.v.trial.records, name + ' trial records');
    assert.deepEqual(a.v.records.map(({ id, ...r }) => r), b.v.records.map(({ id, ...r }) => r), name + ' session records');
    assert.deepEqual(a.o, b.o, name + ' outcome');
    const [pid] = PATHS[name], other = pid === 'novice' ? 'veteran' : 'novice';
    const swapped = O.decide(C, PACK, C.variants[other], a.v.trial.records, a.v.records);
    assert.equal(swapped.key, a.o.key, name + ' key under other label');
    assert.deepEqual(swapped.sentence, a.o.sentence, name + ' sentence under other label');
    assert.deepEqual(swapped.issues.map(i => i.band), a.o.issues.map(i => i.band));
  }
});

test('the waiver deadline is read from record order', () => {
  const { v } = run('novice_dismissal');
  const late = v.records.map(r => r.kind === 'victim_will_filed' ? Object.assign({}, r, { trialSeq: 9999 }) : r);
  assert.equal(O.decide(C, PACK, C.variants.novice, v.trial.records, late).key, 'assault');
  assert.equal(O.decide(C, PACK, C.variants.novice, v.trial.records, []).key, 'assault');
});

// ---------- 경로 전수 탐색 ----------
// 준비 예산을 풀고 모든 카드를 쥔 상태(가능한 선택의 상위집합)에서 개회사·이의·신문·재반대 모든 합법 명령열을 탐색한다.
// 카드 보유는 선택지를 늘리기만 하므로(lacksCard 조건 없음) 이 상위집합에서 성립하면 실제 예산 안의 모든 경로에서도 성립한다.
function exploreAll(def, onLeaf) {
  const relaxed = T.copy(def); relaxed.prep.budget = 99;
  assert.ok(!JSON.stringify(def).includes('lacksCard'), 'monotonicity assumption: no lacksCard conditions');
  const prep = def.investigations.filter(v => v.grants.length).map(v => ['investigate', { id: v.id }]);
  const seen = new Set(); let leaves = 0;
  // 신문이 끝난 증인의 세부 상태는 이후 선택에 영향이 없으므로(쟁점 강도·신뢰는 따로 남김) 같은 상태로 묶는다.
  const witnessKey = w => w.done ? 'done' : Object.assign({}, w, { approaches: [...w.approaches].sort(), presses: [...w.presses].sort(), points: [...w.points].sort() });
  const key = v => JSON.stringify([v.state.phase, v.state.cursor, v.state.pending, v.projection.credibility, v.projection.issues.map(i => i.strength), v.projection.witnesses.map(witnessKey), v.projection.stanceId, v.projection.focusId,
    v.records.filter(r => r.kind === 'rebuttal').map(r => r.refId)]);
  const build = cmds => { const s = createTrialService(relaxed); cmds.forEach(([a, p]) => { const r = s.command(a, p); if (!r.ok) throw new Error(a + ': ' + r.error); }); return s; };
  function options(v) {
    const st = v.state;
    if (st.phase === 'verdict') return [];
    if (st.pending) return st.pending.type === 'objection' ? [['objection', { object: true }], ['objection', { object: false }]] : [['rebut', { use: true }], ['rebut', { use: false }]];
    if (v.actions.verdict) return [['verdict']];
    if (v.actions.continue) return [['continue']];
    return [...v.actions.approaches.filter(a => a.available).map(a => ['approach', { id: a.id }]), ...v.actions.presses.filter(p => p.available).map(p => ['press', { id: p.id }]), ['endCross']];
  }
  function walk(s, cmds) {
    let v = s.projection(), opts = options(v);
    while (opts.length === 1) { const [a, p] = opts[0]; const r = s.command(a, p); assert.ok(r.ok, a + ': ' + r.error); cmds = [...cmds, opts[0]]; v = r.view; opts = options(v); }
    if (!opts.length) { leaves++; onLeaf(v, cmds); return; }
    const k = key(v); if (seen.has(k)) return; seen.add(k);
    opts.forEach((o, i) => { const child = i === opts.length - 1 ? s : build(cmds); const r = child.command(o[0], o[1]); assert.ok(r.ok, o[0] + ': ' + r.error); walk(child, [...cmds, o]); });
  }
  for (const f of def.opening.focus) for (const st of def.opening.stance) {
    const cmds = [...prep, ['finishPrep'], ['open', { focusId: f.id, stanceId: st.id }]];
    walk(build(cmds), cmds);
  }
  return leaves;
}
const outcomeOf = (def, v) => O.decide(C, PACK, def, v.records, []).key;

test('veteran: no command sequence acquits, and the injury link breaks only through the layout rebuttal', () => {
  const def = C.variants.veteran; let leaves = 0, dismissable = 0;
  leaves = exploreAll(def, (v, cmds) => {
    const key = outcomeOf(def, v);
    assert.notEqual(key, 'acquittal', 'veteran acquittal found: ' + JSON.stringify(cmds));
    const causeDoubt = v.projection.issues.find(i => i.id === CAUSE).band === 'doubt';
    const usedLayout = v.records.some(r => r.kind === 'rebuttal' && r.cardsUsed.includes('CARD_SIG_LAYOUT'));
    if (causeDoubt) { assert.ok(usedLayout, 'surface-only causation doubt: ' + JSON.stringify(cmds)); dismissable++; }
  });
  assert.ok(leaves > 100, 'explored ' + leaves);
  assert.ok(dismissable > 0, 'a layout breakthrough exists');
});

test('novice: acquittal and causation doubt are both reachable without the layout card', () => {
  const def = C.variants.novice; const found = new Set();
  exploreAll(def, (v) => {
    const usedLayout = v.records.some(r => r.kind === 'rebuttal');
    const key = outcomeOf(def, v);
    if (!usedLayout) found.add(key);
  });
  assert.ok(found.has('acquittal')); assert.ok(found.has('assault')); assert.ok(found.has('injury'));
});

// ---------- DEC-032: 한국 규칙 값은 팩에 ----------
test('DEC-032: demo services hold no Korean rule values, names or article numbers', () => {
  const values = new Set();
  Object.values(PACK.offenses).forEach(o => { values.add(o.label); values.add(o.article); });
  Object.values(PACK.judgments).forEach(j => { values.add(j.label); if (j.article) values.add(j.article); });
  [PACK.victimWill.deadlineLabel, PACK.victimWill.documentLabel, PACK.sentencing.disclaimer, PACK.sentencing.unassessed, ...Object.values(PACK.sentencing.labels), ...PACK.sentencing.table.map(r => r.text)].forEach(x => values.add(x));
  for (const f of fs.readdirSync(path.join(__dirname, '..', 'services')).filter(f => f.startsWith('demo-'))) {
    const src = fs.readFileSync(path.join(__dirname, '..', 'services', f), 'utf8').replace(/\/\/.*$/gm, '');
    const literals = src.match(/'(?:[^'\\]|\\.)*'/g) || [];
    for (const lit of literals) {
      for (const v of values) assert.ok(!lit.includes(v), f + ' hardcodes ' + v);
      assert.doesNotMatch(lit, /제\s*\d+\s*조|형법|형사소송법/, f + ' hardcodes an article: ' + lit);
    }
    assert.doesNotMatch(src, /SIG_|SEPARATED/, f + ' references a case id');
  }
});


test('review: acquittal and dismissal omit unrelated missed preparation', () => {
  for (const name of ['novice_acquittal', 'novice_dismissal', 'veteran_dismissal']) assert.deepEqual(run(name).o.missed, [], name);
  assert.deepEqual(run('novice_assault').o.missed, [], 'causation preparation is not an assault verdict basis');
  assert.ok(run('novice_injury_suspended').o.missed.length > 0, 'relevant missing preparation still shown');
});

test('review: passed valid objections cite the actual record, not invalid or sustained objections', () => {
  const [pid, plan] = PATHS.veteran_dismissal;
  const passed = play(pid, { ...plan, object: [VALID[1]] });
  assert.equal(passed.o.key, 'injury');
  assert.equal(passed.o.passed.length, 1);
  const rec = passed.v.trial.records.find(r => r.id === passed.o.passed[0].recordId);
  assert.equal(rec.refId, VALID[0]); assert.equal(rec.ruling, 'pass');
  assert.match(passed.o.passed[0].text, /밀침과 상해/);
  assert.deepEqual(run('veteran_dismissal').o.passed, []);
  assert.equal(run('veteran_injury_suspended').o.passed.length, 2);
});

test('review: reinterviewed denial is a known contradiction, not missed preparation', () => {
  for (const pid of ['novice', 'veteran']) {
    const unknown = play(pid, { stance: 'S_SIG_DENY' });
    const known = play(pid, { prep: ['INV_SIG_CLIENT'], stance: 'S_SIG_DENY' });
    assert.ok(unknown.o.missed.some(x => /다시 만났다면/.test(x.text)));
    assert.ok(!known.o.missed.some(x => /다시 만났다면/.test(x.text)));
    assert.ok(known.o.backfired.some(x => /의뢰인의 밀침 인정과 다른/.test(x.text)));
    assert.deepEqual(known.o.issues, unknown.o.issues, 'wording fix does not alter adjudication');
  }
});

test('review: one layout reminder prefers the concrete redirect record; held but unused is distinct', () => {
  const absent = run('veteran_surface_fine');
  const layout = absent.o.missed.filter(x => /가림막 뒤/.test(x.text));
  assert.equal(layout.length, 1); assert.ok(layout[0].recordId);
  const unused = play('veteran', { ...PATHS.veteran_dismissal[1], rebut: false });
  assert.equal(unused.o.missed.length, 1);
  assert.match(unused.o.missed[0].text, /준비한/);
  assert.equal(run('veteran_dismissal').o.missed.length, 0);
});

test('presentation: orders come from the pack and display records never rewrite raw records', () => {
  for (const name of Object.keys(PATHS)) {
    const { s, v, o } = run(name);
    assert.match(o.pronouncement, /^주문\./);
    const raw = JSON.stringify(v.trial.records);
    const call = v.trial.displayRecords.find(r => r.kind === 'witness_call');
    assert.equal(call.lines[0].text, PACK.presentation.witnessCall);
    assert.equal(v.trial.displayRecords.at(-1).lines.at(-1).text, o.pronouncement);
    assert.notEqual(v.trial.records.at(-1).lines.at(-1).text, o.pronouncement);
    assert.equal(JSON.stringify(s.projection().trial.records), raw);
  }
});

test('presentation: Korean object particles handle both final-consonant and vowel card titles', () => {
  const text = require('../ui/trial-demo-text');
  assert.equal(text.objectParticle('현장 동선'), '현장 동선을');
  assert.equal(text.objectParticle('준비 자료'), '준비 자료를');
  assert.equal(text.format('준비한 현장 동선을(를) 제시하지 않았다.'), '준비한 현장 동선을 제시하지 않았다.');
  assert.equal(text.format('준비 자료을(를) 제시'), '준비 자료를 제시');
});

test('presentation: personal circumstances and names never change raw records or five outcome types', () => {
  const changed = JSON.parse(JSON.stringify(C));
  changed.presentation.client.name = '표시 대체';
  changed.presentation.victim.name = '피해자 표시 대체';
  changed.presentation.victim.situation = '사정 대체';
  changed.presentation.stakes = { convicted: '표시 A', cleared: '표시 B' };
  for (const p of Object.values(changed.presentation.prosecutors)) p.name = '검사 표시 대체';
  for (const w of Object.values(changed.presentation.witnesses)) w.name = '증인 표시 대체';
  for (const [name, args] of Object.entries(PATHS)) {
    const baseline = play(...args), relabeled = play(...args, changed);
    assert.deepEqual(relabeled.v.records, baseline.v.records, name + ' session records');
    assert.deepEqual(relabeled.v.trial.records, baseline.v.trial.records, name + ' trial records');
    assert.deepEqual(relabeled.o, baseline.o, name + ' complete outcome');
    assert.equal(relabeled.v.trial.definition.roles.prosecutor.name, '검사 표시 대체');
    assert.deepEqual(relabeled.v.trial.definition.witnesses.map(w => w.id), [OBS, INV]);
  }
});

test('procedure: opinions summon only disputed statement witnesses and record consent effects', () => {
  for (const pid of ['novice','veteran']) for (const a of ['agree','disagree']) for (const b of ['agree','disagree']) {
    const opinions = { PX_SIG_STATEMENT:a, PX_SIG_REPORT:b, PX_SIG_VIDEO:'agree', PX_SIG_MEDICAL:'agree' };
    const {v}=play(pid,{ opinions });
    assert.deepEqual(v.trial.records.filter(r=>r.kind==='witness_call').map(r=>r.witnessId), [a==='disagree'?OBS:null,b==='disagree'?INV:null].filter(Boolean));
    assert.equal(v.trial.records.filter(r=>r.kind==='evidence_opinion').flatMap(r=>r.effects).reduce((n,[,delta])=>n+delta,0), Number(a==='agree')+Number(b==='agree'));
    assert.equal(v.trial.records.filter(r=>r.kind==='sentencing_request').length,1);
    for(const r of v.trial.records.filter(r=>r.kind==='evidence_opinion'&&r.opinion==='agree')) assert.equal(r.admittedContent,C.variants[pid].prosecutionExhibits.find(x=>x.id===r.refId).content);
  }
});
test('procedure: document disputes lose credibility only; invalid/repeated opinions are atomic', () => {
  const s=session();ok(s,'start',{caseId:C.id,prosecutorId:'novice'});tr(s,'finishPrep');tr(s,'open',{focusId:'F_SIG_CAUSE',stanceId:'S_SIG_CONTACT'});
  unchanged(s,'trial',{action:'evidenceOpinions',payload:{opinions:{}}});
  unchanged(s,'trial',{action:'closingArgument',payload:{id:'FINAL_SIG_CAUSE'}});
  unchanged(s,'trial',{action:'verdict'});
  const before=s.projection().trial.projection;
  tr(s,'evidenceOpinions',{opinions:{PX_SIG_STATEMENT:'disagree',PX_SIG_REPORT:'disagree',PX_SIG_VIDEO:'disagree',PX_SIG_MEDICAL:'disagree'}});
  const after=s.projection().trial.projection;
  assert.equal(after.credibility,before.credibility-2);
  assert.deepEqual(after.issues.map(x=>x.strength),before.issues.map(x=>x.strength));
  unchanged(s,'trial',{action:'evidenceOpinions',payload:{opinions:{}}});
});
test('procedure: unfiled question spends time without effects, points or neutralization', () => {
  const {v}=play('novice',{...PATHS.novice_acquittal[1],autoFile:false});
  const r=v.trial.records.find(r=>r.kind==='approach'&&r.refId==='A_SIG_OBS_SEQUENCE');
  assert.equal(r.blockedReason,'unfiled');assert.deepEqual(r.effects,[]);assert.deepEqual(r.points,[]);assert.deepEqual(r.neutralizes,[]);
  assert.equal(v.trial.projection.witnesses.find(w=>w.id===OBS).used,3);
  assert.ok(v.outcome.blocked.some(x=>x.recordId===r.id));
});
test('procedure: veteran prepares for early layout; late filing costs credibility; novice does not prepare', () => {
  const plan=PATHS.veteran_dismissal[1];
  const early=play('veteran',{...plan,earlyLayout:true}),late=play('veteran',plan),novice=play('novice',{...plan,earlyLayout:true});
  assert.ok(play('veteran',{...plan,earlyLayout:true,refileLayout:true}).v.trial.records.some(r=>r.blockedReason==='prepared'));
  assert.equal(play('novice',plan).v.trial.records.find(r=>r.kind==='evidence_filing'&&r.timing==='late').credibility,-1);
  assert.equal(early.o.key,'injury');assert.equal(late.o.key,'dismissal');
  assert.ok(early.v.trial.records.some(r=>r.blockedReason==='prepared'&&r.effects.length===0));
  assert.ok(!novice.v.trial.records.some(r=>r.blockedReason==='prepared'));
  assert.equal(late.v.trial.records.find(r=>r.kind==='evidence_filing'&&r.cardId==='CARD_SIG_LAYOUT'&&r.status==='filed').credibility,-1);
  assert.equal(early.v.trial.records.find(r=>r.kind==='evidence_filing'&&r.cardId==='CARD_SIG_LAYOUT'&&r.status==='filed').credibility,0);
});
test('procedure: deferred filing finalizes at closure; closed changes and unknown filing fail atomically', () => {
  const {s,v}=play('novice',{prep:['INV_SIG_SEQUENCE'],autoFile:false});
  assert.ok(v.trial.records.some(r=>r.kind==='evidence_filing'&&r.automatic&&r.status==='withheld'));
  unchanged(s,'trial',{action:'fileEvidence',payload:{id:'CARD_SIG_SEQUENCE',status:'filed'}});
  const n=session();ok(n,'start',{caseId:C.id,prosecutorId:'novice'});tr(n,'investigate',{id:'INV_SIG_SEQUENCE'});
  unchanged(n,'trial',{action:'fileEvidence',payload:{id:'BAD',status:'filed'}});
  unchanged(n,'trial',{action:'fileEvidence',payload:{id:'CARD_SIG_SEQUENCE',status:'BAD'}});
  tr(n,'fileEvidence',{id:'CARD_SIG_SEQUENCE',status:'withheld'});tr(n,'fileEvidence',{id:'CARD_SIG_SEQUENCE',status:'filed'});
  assert.deepEqual(n.projection().trial.records.filter(r=>r.kind==='evidence_filing').map(r=>r.status),['deferred','withheld','filed']);
});
test('procedure: final speeches never affect adjudication, six client statements and deterministic records', () => {
  for(const choice of C.procedure.closingChoices) {
    const a=play('veteran',{...PATHS.veteran_dismissal[1],final:choice.id});
    const b=play('veteran',{...PATHS.veteran_dismissal[1],final:choice.id});
    assert.deepEqual(a.v.trial.records,b.v.trial.records);
    const without=a.v.trial.records.filter(r=>!['closing_argument','last_statement'].includes(r.kind));
    assert.deepEqual(T.adjudicate(C.variants.veteran,T.project(C.variants.veteran,without)),T.adjudicate(C.variants.veteran,a.v.trial.projection));
    assert.equal(a.o.key,'dismissal');assert.ok(a.o.closingReview.includes(choice.title));
  }
  const lines=new Set();
  for(const stance of C.variants.novice.opening.stance) for(const advice of [undefined,'ADV_SIG_REVISE']){
    const {v}=play('novice',{stance:stance.id,advice});
    const rec=v.trial.records.find(r=>r.kind==='last_statement');lines.add(rec.lines[0].text);
    assert.deepEqual(rec.effects,[]);
  }
  assert.equal(lines.size,6);
  for(const key of ['evidenceConsent','filing','request','finalOpinion','impeachment'])assert.equal(PACK.procedure[key].verified,'unverified');
});

test('procedure: unfiled rebuttal consumes recorded time; early preparation cannot be undone by withdrawal', () => {
  const plan=PATHS.veteran_dismissal[1];
  const {v}=play('veteran',{...plan,autoFile:false});
  // A separate run preserves filed medical/video while leaving layout unfiled.
  const s=session();ok(s,'start',{caseId:C.id,prosecutorId:'veteran'});
  for(const id of plan.prep)tr(s,'investigate',{id});
  for(const id of ['CARD_SIG_SEQUENCE','CARD_SIG_MEDICAL'])tr(s,'fileEvidence',{id,status:'filed'});
  tr(s,'finishPrep');tr(s,'open',{focusId:plan.focus,stanceId:plan.stance});
  tr(s,'evidenceOpinions',{opinions:{PX_SIG_STATEMENT:'disagree',PX_SIG_REPORT:'disagree',PX_SIG_VIDEO:'agree',PX_SIG_MEDICAL:'agree'}});
  let q=[...plan.inv],guard=0;
  while(guard++<100){
    const t=s.projection().trial;
    if(t.state.pending?.type==='rebuttal'){tr(s,'rebut',{use:true});break;}
    if(t.state.pending){tr(s,'objection',{object:true});continue;}
    if(t.actions.endCross){const id=t.witness.id===INV?q.shift():null;tr(s,id?(id.startsWith('P_')?'press':'approach'):'endCross',id?{id}:{});continue;}
    tr(s,'continue');
  }
  const t=s.projection().trial,r=t.records.findLast(r=>r.kind==='rebuttal');
  assert.equal(r.blockedReason,'unfiled');assert.equal(r.timeCost,1);assert.deepEqual(r.effects,[]);
  assert.equal(t.projection.witnesses.find(w=>w.id===INV).used,T.project(C.variants.veteran,t.records).witnesses.find(w=>w.id===INV).used+1);
  assert.ok(v.trial.records.some(r=>r.kind==='evidence_filing'&&r.automatic));
});

test('record access: four prosecution exhibits are initially readable, investigations grant only preparation cards', () => {
  for (const pid of ['novice','veteran']) {
    const s=session();const v=ok(s,'start',{caseId:C.id,prosecutorId:pid});
    assert.equal(v.trial.exhibits.length,4);
    assert.ok(v.trial.exhibits.every(x=>x.revealed && x.content));
    assert.deepEqual(v.trial.projection.revealed,v.trial.exhibits.map(x=>x.id));
    assert.ok(C.variants[pid].investigations.every(x=>!Object.hasOwn(x,'reveals')));
    const after=tr(s,'investigate',{id:'INV_SIG_MEDICAL'});
    assert.deepEqual(after.trial.exhibits,v.trial.exhibits);
    assert.ok(after.trial.cards.some(c=>c.id==='CARD_SIG_MEDICAL'));
  }
  assert.equal(PACK.procedure.recordAccess.article,'형사소송법 제266조의3');
  assert.equal(PACK.procedure.recordAccess.verified,'unverified');
});
