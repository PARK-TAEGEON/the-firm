'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../data/case'), E = require('../engine/core');
const { createService } = require('../services/courtroom');
const pair = ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT'], strong = [...pair, 'P_INITIAL_UNCERTAIN'];
function cmd(s, action, payload) { const r = require('./settle-procedure')(s,s.command(action, payload)); assert.ok(r.ok, r.error); return r.view; }
function fresh(theory = 'THEORY_IDENTITY') { const s = createService(D); cmd(s, 'strategy', { id: theory }); return s; }
function facts(s, ids = ['G_DISTANCE', 'G_DURATION', 'G_INITIAL']) { ids.forEach(id => cmd(s, 'establish', { id, basis: D.goals.find(g => g.id === id).basis })); }
const select = (s, ids = strong) => cmd(s, 'select', { ids });
const result = s => cmd(s, 'stop').state.resolution;
function rejected(s, action, payload) { const before = s.projection(); assert.equal(s.command(action, payload).ok, false); assert.deepEqual(s.projection(), before); }
function familiarity(s) { facts(s, ['G_DISTANCE', 'G_DURATION']); select(s, pair); cmd(s, 'press'); cmd(s, 'press'); }
test('Safe / Constructive / Aggressive have distinct payoffs and advocacy records', () => {
  const safe = fresh(), frame = fresh(), press = fresh();
  for (const s of [safe, frame, press]) { facts(s); select(s); }
  const evidence = safe.projection().state.records.evidence; cmd(frame, 'frame'); cmd(press, 'press');
  const a = result(safe), b = result(frame), c = result(press);
  assert.deepEqual([a.code, b.code, c.code], ['DOUBT_RECORDED', 'WEAKENED', 'WITNESS_ADMISSION']);
  assert.deepEqual(safe.projection().state.records.evidence, evidence);
  assert.equal(a.admissionRefs.length + a.framedArguments.length + a.activeCounterRefs.length + a.strategy.argumentFrameRefs.length, 0);
  assert.equal(b.admissionRefs.length, 0); assert.equal(b.framedArguments.length, 1); assert.equal(b.framedArguments[0].reusable, true); assert.equal(b.strategy.development, 'developed');
  assert.equal(c.admissionRefs.length, 1); assert.equal(c.framedArguments.length, 0); assert.equal(c.strategy.development, 'developed');
});
test('Press can be worse than safe/framed play from identical premises', () => {
  const outcomes = ['stop', 'frame', 'press'].map(action => { const s = fresh(); facts(s, ['G_DISTANCE', 'G_LIGHTING']); select(s, ['P_DISTANCE_27M', 'P_LIGHTING_POOR']); if (action !== 'stop') cmd(s, action); return result(s); });
  assert.deepEqual(outcomes.map(o => o.code), ['DOUBT_RECORDED', 'LIMITED_ARGUMENT', 'CONFLICTING']); assert.deepEqual(outcomes.map(o => o.activeCounterRefs.length), [0, 0, 1]);
});
test('reinforced Press with new selected basis obtains admission', () => {
  const s = fresh(); facts(s, ['G_DISTANCE', 'G_DURATION']); select(s, pair); cmd(s, 'press'); assert.equal(s.projection().state.lastResponseType, 'RESIST');
  facts(s, ['G_INITIAL']); select(s); assert.equal(s.projection().pressure.kind, 'reinforced'); const v = cmd(s, 'press');
  assert.equal(v.state.lastResponseType, 'ADMIT'); assert.equal(v.state.presses[1].kind, 'reinforced'); assert.notEqual(v.state.presses[0].signature, v.state.presses[1].signature); assert.equal(result(s).code, 'WITNESS_ADMISSION');
});
test('permutations and newly banked but unselected facts do not evade repetition', () => {
  const s = fresh(); facts(s, ['G_DISTANCE', 'G_DURATION']); select(s, pair); cmd(s, 'press'); facts(s, ['G_INITIAL']); select(s, [...pair].reverse());
  assert.equal(s.projection().pressure.kind, 'repeated'); const first = s.projection().state.presses[0].signature, v = cmd(s, 'press');
  assert.equal(v.state.presses[1].signature, first); assert.equal(v.state.lastResponseType, 'EXPLAIN'); assert.ok(E.recordIds(v.state).includes('P_FAMILIARITY'));
});
test('subsets and restoring an earlier strong basis remain repeated', () => { const s = fresh(); facts(s); select(s); cmd(s, 'press'); select(s, pair); assert.equal(s.projection().pressure.kind, 'repeated'); cmd(s, 'press'); select(s); assert.equal(s.projection().pressure.kind, 'repeated'); assert.equal(result(s).activeCounterRefs.length,0); assert.ok(s.projection().state.records.procedural.some(r => r.outcome === 'sustained')); });
test('incomparable new premise combination is not a simple repeat', () => { const s = fresh(); facts(s, D.goals.filter(g=>g.witnessId===D.witnesses[0].id).map(g => g.id)); select(s, pair); cmd(s, 'press'); select(s, ['P_LIGHTING_POOR', 'P_INITIAL_UNCERTAIN']); assert.equal(s.projection().pressure.kind, 'new_basis'); });
test('counter requires both counter and initial statement; failures atomic', () => {
  const s = fresh(); rejected(s, 'counter', { id: 'COUNTER_INITIAL' }); facts(s, ['G_INITIAL']); rejected(s, 'counter', { id: 'COUNTER_INITIAL' });
  const b = fresh(); familiarity(b); rejected(b, 'counter', { id: 'COUNTER_INITIAL' }); facts(b, ['G_INITIAL']); rejected(b, 'counter', { id: 'invalid' }); assert.ok(b.projection().availability.counters[0].available);
});
test('counter rebuttal preserves original, records provenance and improves framed outcome', () => {
  const s = fresh(); familiarity(s); facts(s, ['G_INITIAL']); select(s); cmd(s, 'frame');
  const before = s.projection(), counter = before.state.records.evidence.find(r => r.propositionId === 'P_FAMILIARITY'); assert.equal(before.assessment.code, 'CONFLICTING');
  const after = cmd(s, 'counter', { id: 'COUNTER_INITIAL' }); assert.deepEqual(after.state.records.evidence.find(r => r.id === counter.id), counter);
  const q = after.state.records.evidence.find(r => r.propositionId === 'P_FAMILIARITY_LIMIT'); assert.equal(q.qualifiesRecordId, counter.id); assert.equal(q.premiseRefs.length, 1);
  assert.equal(after.assessment.admissionRefs.length, 0); assert.deepEqual(after.assessment.qualifiedCounterRefs, [counter.id]); assert.equal(after.assessment.code, 'WEAKENED'); rejected(s, 'counter', { id: 'COUNTER_INITIAL' });
});
test('familiarity rebuttal never erases sign-light counter', () => {
  const s = fresh(); facts(s, ['G_DISTANCE', 'G_LIGHTING']); select(s, ['P_DISTANCE_27M', 'P_LIGHTING_POOR']); cmd(s, 'press'); cmd(s, 'press'); facts(s, ['G_INITIAL']); cmd(s, 'counter', { id: 'COUNTER_INITIAL' });
  const r = result(s); assert.equal(r.qualifiedCounterRefs.length, 1); assert.equal(r.activeCounterRefs.length, 1); assert.equal(r.code, 'CONFLICTING');
});
test('qualification without provenance does not neutralize counter', () => {
  const s = fresh(); familiarity(s); facts(s, ['G_INITIAL']); cmd(s, 'counter', { id: 'COUNTER_INITIAL' }); const records = s.projection().state.records;
  records.evidence.find(r => r.propositionId === 'P_FAMILIARITY_LIMIT').premiseRefs = []; assert.equal(E.evaluateRecord(D, records, 'THEORY_IDENTITY').activeCounterRefs.length, 1);
});
test('same record/argument means core progress in A and peripheral argument in B without a major commitment', () => {
  const s = fresh(); facts(s); select(s); cmd(s, 'frame'); const records = s.projection().state.records;
  const a = E.evaluateRecord(D, records, 'THEORY_IDENTITY'), b = E.evaluateRecord(D, records, 'THEORY_INTENT');
  assert.equal(a.code, b.code); assert.equal(a.framedArguments[0].value, 'core'); assert.equal(b.framedArguments[0].value, 'peripheral');
  assert.equal(a.strategy.development, 'developed'); assert.equal(b.strategy.development, 'peripheral'); assert.deepEqual(b.strategy.unresolvedIssues, ['INTENT']); assert.equal(b.strategy.argumentFrameRefs.length, 1);
  assert.equal(a.strategy.positionStatus, 'no_major_commitment'); assert.equal(b.strategy.positionStatus, 'no_major_commitment'); assert.equal(b.strategy.majorCommitmentRefs.length, 0);
  const safe = fresh('THEORY_INTENT'); facts(safe); const safeResult = result(safe); assert.equal(safeResult.strategy.positionStatus, 'no_major_commitment'); assert.equal(safeResult.strategy.commitmentReviewRefs.length, 0);
});
test('identification counter conflicts with A but not contact-conceding B', () => {
  const s = fresh(); familiarity(s); const records = s.projection().state.records;
  assert.equal(E.evaluateRecord(D, records, 'THEORY_IDENTITY').strategy.conflicts.length, 1); assert.equal(E.evaluateRecord(D, records, 'THEORY_INTENT').strategy.conflicts.length, 0);
});
test('record-only evaluation ignores invalid UI plan/selection and question/pressure history', () => {
  const s = fresh(); facts(s); select(s); cmd(s, 'frame'); const state = s.projection().state, baseline = E.evaluateRecord(D, state.records, state.theoryId);
  state.selected = ['NOT_A_PROPOSITION']; state.asked = ['arbitrary']; state.presses = Array(100).fill({}); state.planId = 'bad'; assert.deepEqual(E.resolve(D, state), baseline);
  delete state.selected; delete state.asked; delete state.presses; assert.deepEqual(E.resolve(D, state), baseline);
});
test('nested UI/pressure-dependent final rules are rejected', () => {
  for (const rule of [{ selectedTags: { uncertain: 1 } }, { repeated: true }, { any: [{ selectedTags: { observation: 2 } }] }]) { const d = E.copy(D); d.resolutionRules[0].when = rule; assert.throws(() => createService(d)); }
});
test('counter definitions reject missing targets, basis, qualification and action', () => {
  for (const change of [d => { d.counterResponses[0].target = 'missing'; }, d => { d.counterResponses[0].requires = ['missing']; }, d => { d.counterResponses[0].response = 'R_RESIST'; }, d => { d.profile.actions = d.profile.actions.filter(a => a !== 'counter'); }]) { const d = E.copy(D); change(d); assert.throws(() => createService(d)); }
});
test('invalid or press-only advocacy cannot create a Frame payoff', () => {
  const s = fresh(); facts(s, ['G_DISTANCE']); const records = s.projection().state.records;
  records.advocacy.push({ id: 'fake', kind: 'argument', planId: 'PLAN_IDENTIFICATION', issue: 'IDENTITY', premises: strong }); assert.equal(E.evaluateRecord(D, records, 'THEORY_IDENTITY').framedArguments.length, 0);
  records.advocacy[0].kind = 'press'; assert.equal(E.evaluateRecord(D, records, 'THEORY_IDENTITY').framedArguments.length, 0);
});
test('reinforced admission and qualified counter replay from record only', () => {
  const s = fresh(); familiarity(s); facts(s, ['G_INITIAL']); cmd(s, 'counter', { id: 'COUNTER_INITIAL' }); select(s); cmd(s, 'press'); const records = s.projection().state.records;
  assert.equal(E.evaluateRecord(D, records, 'THEORY_IDENTITY').code, 'WITNESS_ADMISSION'); const r = result(s); assert.deepEqual(r, { id: r.id, ...E.evaluateRecord(D, records, 'THEORY_IDENTITY') });
});
