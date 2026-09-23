'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('./case-v065');
const E = require('../engine/core');
const { createService } = require('../services/courtroom');
const fresh = (d = D) => { const s = createService(d); ok(s, 'strategy', { id: d.theories[0].id }); return s; };
const standardGoalIds = D.goals.filter(g => g.witnessId === D.witnesses[0].id && g.informationType !== 'mixed').map(g => g.id);
function ok(s, action, payload) { const result = require('./settle-procedure')(s,s.command(action, payload)); assert.equal(result.ok, true, result.error); return result.view; }
function establish(s, ids = standardGoalIds, d = D) { ids.forEach(id => { const g = d.goals.find(g => g.id === id); ok(s, 'establish', { id, basis: g.basis }); }); }
function select(s, ids) { ok(s, 'select', { ids }); }
function unchanged(s, action, payload) { const before = s.projection(); assert.equal(s.command(action, payload).ok, false); assert.deepEqual(s.projection(), before); }
const permutations = xs => xs.length ? xs.flatMap((x, i) => permutations(xs.filter((_, j) => j !== i)).map(rest => [x, ...rest])) : [[]];
test('authored content is valid and original input is not mutated', () => { const before = E.copy(D); fresh(); assert.deepEqual(D, before); assert.ok(E.validate(D)); });
for (const order of permutations(standardGoalIds)) test('all favorable fact orders: ' + order.join('/'), () => {
  const s = fresh(); establish(s, order); assert.equal(s.projection().state.records.evidence.length, 4);
  select(s, D.argumentPlans[0].premises); ok(s, 'frame'); const v = ok(s, 'stop'); assert.equal(v.state.resolution.code, 'COMPELLING_ARGUMENT');
});
test('ADMIT from uncertain statement plus two observation conditions', () => { const s = fresh(); establish(s, ['G_INITIAL', 'G_DISTANCE', 'G_DURATION']); select(s, ['P_INITIAL_UNCERTAIN', 'P_DISTANCE_27M', 'P_OBSERVATION_SHORT']); const v = ok(s, 'press'); assert.equal(v.state.lastResponseType, 'ADMIT'); assert.ok(E.recordIds(v.state).includes('P_IDENTIFICATION_LIMIT')); });
test('EXPLAIN adds durable counter and repeat adds familiarity', () => { const s = fresh(); establish(s, ['G_DISTANCE', 'G_LIGHTING']); select(s, ['P_DISTANCE_27M', 'P_LIGHTING_POOR']); let v = ok(s, 'press'); assert.equal(v.state.lastResponseType, 'EXPLAIN'); assert.ok(E.recordIds(v.state).includes('P_SIGN_LIGHT')); ok(s, 'press'); v = ok(s, 'press'); assert.equal(v.state.lastResponseType, 'RESIST'); assert.equal(v.state.records.evidence.length, 4); assert.equal(ok(s, 'stop').state.resolution.code, 'CONFLICTING'); });
test('RESIST has no invented proposition', () => { const s = fresh(); establish(s, ['G_DISTANCE', 'G_DURATION']); select(s, ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT']); const v = ok(s, 'press'); assert.equal(v.state.lastResponseType, 'RESIST'); assert.equal(v.state.records.evidence.length, 2); });
test('record context changes response without changing selected lighting premises', () => { const s = fresh(); establish(s, ['G_INITIAL', 'G_DISTANCE', 'G_LIGHTING']); select(s, ['P_DISTANCE_27M', 'P_LIGHTING_POOR']); assert.equal(ok(s, 'press').state.lastResponseType, 'RESIST'); });
test('early stop is always available, including zero evidence', () => { const s = fresh(); assert.equal(ok(s, 'stop').state.resolution.code, 'INSUFFICIENT'); });
test('one premise cannot press/frame, two can; unrecorded and duplicate premises fail atomically', () => {
  const s = fresh(); unchanged(s, 'select', { ids: ['P_DISTANCE_27M'] }); unchanged(s, 'press'); unchanged(s, 'frame');
  establish(s, ['G_DISTANCE']); select(s, ['P_DISTANCE_27M']); unchanged(s, 'press'); unchanged(s, 'frame');
  unchanged(s, 'select', { ids: ['P_DISTANCE_27M', 'P_DISTANCE_27M'] }); establish(s, ['G_DURATION']); select(s, ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT']); assert.ok(s.projection().availability.press);
});
test('counter propositions are recorded but incompatible with plan', () => { const s = fresh(); establish(s, ['G_DISTANCE', 'G_LIGHTING']); select(s, ['P_DISTANCE_27M', 'P_LIGHTING_POOR']); ok(s, 'press'); unchanged(s, 'select', { ids: ['P_DISTANCE_27M', 'P_SIGN_LIGHT'] }); });
test('all failed commands preserve complete state and ID allocation', () => {
  const a = fresh(), b = fresh();
  unchanged(a, 'unknown'); unchanged(a, 'strategy', { id: 'bad' }); unchanged(a, 'establish', { id: 'G_INITIAL', basis: [] });
  unchanged(a, 'establish', { id: 'G_DISTANCE', basis: ['E_INITIAL_STATEMENT'] }); unchanged(a, 'establish', { id: 'missing', basis: [] });
  unchanged(a, 'select', { ids: ['missing'] }); unchanged(a, 'select', { ids: Array(5).fill('P_DISTANCE_27M') }); unchanged(a, 'select', null);
  establish(a, ['G_DISTANCE']); establish(b, ['G_DISTANCE']); assert.deepEqual(a.projection(), b.projection()); unchanged(a, 'establish', { id: 'G_DISTANCE', basis: [] });
});
test('Frame remains advocacy; duplicate combination rejected even if reordered', () => {
  const s = fresh(); establish(s, ['G_DISTANCE', 'G_DURATION']); select(s, ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT']); ok(s, 'frame'); select(s, ['P_OBSERVATION_SHORT', 'P_DISTANCE_27M']); unchanged(s, 'frame');
  const v = s.projection(); assert.equal(v.state.records.evidence.length, 2); assert.equal(v.state.records.advocacy.length, 1); assert.equal(v.state.records.advocacy.filter(r => r.kind === 'major_commitment').length, 0);
});
test('working strategy changes preserve argument frames without inventing a major commitment', () => {
  const s = fresh(); establish(s, ['G_DISTANCE', 'G_DURATION']); select(s, ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT']); ok(s, 'frame');
  const old = s.projection().state.records.advocacy; const v = ok(s, 'strategy', { id: 'THEORY_INTENT' }); assert.deepEqual(v.state.records.advocacy, old); assert.equal(v.state.records.advocacy.filter(r => r.kind === 'major_commitment').length, 0); assert.equal(v.strategy.preferred, false); assert.equal(v.strategy.potentialConflict, false); assert.match(v.strategy.relevance, /고의/);
});
// Facts-only Stop never manufactures a framed inference or an intent finding.
test('theory B does not manufacture an intent finding', () => { const s = fresh(); ok(s, 'strategy', { id: 'THEORY_INTENT' }); establish(s); const v = ok(s, 'stop'); assert.equal(v.state.resolution.scope, 'IDENTITY'); assert.equal(v.state.resolution.code, 'DOUBT_RECORDED'); assert.deepEqual(v.state.resolution.strategy.unresolvedIssues, ['INTENT']); });
test('resolution reads records, not question counts, selection, advocacy or question IDs', () => {
  const s = fresh(); establish(s, ['G_DISTANCE', 'G_DURATION']); const state = s.projection().state;
  const before = E.resolve(D, state); state.asked = Array(100).fill('statement'); state.selected = []; state.presses = []; state.records.advocacy = [{ id: 'adv-only' }];
  const after = E.resolve(D, state); assert.equal(before.code, after.code); state.records.evidence = []; assert.equal(E.resolve(D, state).code, 'INSUFFICIENT');
});
test('returned state and input definition are defensive copies', () => { const d = E.copy(D), s = fresh(d); d.goals[0].response = 'bad'; const v = s.projection(); v.case.propositions[0].tags.push('counter'); v.state.selected.push('bad'); v.availability.stop = false; v.argument.plan.min = 1; v.argument.plan.premises.push('bad'); v.argument.plan.responseRules[0].response = 'bad'; establish(s, ['G_DISTANCE']); assert.equal(s.projection().state.records.evidence.length, 1); assert.deepEqual(s.projection().state.selected, []); assert.deepEqual(s.projection().argument.plan, D.argumentPlans[0]); select(s, ['P_DISTANCE_27M']); unchanged(s, 'press'); const fractional = E.copy(D); fractional.argumentPlans[0].min = 2.5; assert.throws(() => createService(fractional)); const duplicateTag = E.copy(D); duplicateTag.propositions[0].tags.push('observation'); assert.throws(() => createService(duplicateTag)); });
test('reset creates a new session with no reused runtime IDs', () => {
  const s = fresh(); establish(s); const ids = runtimeIds(s.projection().state); const next = s.reset(); assert.equal(next.state.session, 2); assert.equal(next.state.records.evidence.length, 0); runtimeIds(next.state).forEach(id => assert.ok(!ids.has(id)));
});
function runtimeIds(s) { const ids = new Set(); function walk(v) { if (!v || typeof v !== 'object') return; if (v.id) { assert.ok(!ids.has(v.id), 'Runtime ID reused'); ids.add(v.id); } Object.values(v).forEach(walk); } walk(s); return ids; }
test('complete sessions have globally unique runtime record IDs', () => { const s = fresh(); establish(s); select(s, D.argumentPlans[0].premises); ok(s, 'frame'); ok(s, 'press'); ok(s, 'press'); ok(s, 'stop'); runtimeIds(s.projection().state); });
test('terminal state rejects all gameplay commands atomically', () => { const s = fresh(); ok(s, 'stop'); for (const action of D.profile.actions) unchanged(s, action, { id: D.theories[1].id, ids: [], basis: [] }); });
test('a selected plan can be used before exhausting available facts', () => { const s = fresh(); establish(s, ['G_DISTANCE', 'G_LIGHTING']); select(s, ['P_DISTANCE_27M', 'P_LIGHTING_POOR']); assert.ok(s.projection().availability.press); assert.equal(s.projection().availability.goals.filter(g => g.available).length, 3); });
test('deterministic replay', () => { const a = fresh(), b = fresh(); for (const s of [a, b]) { establish(s); select(s, D.argumentPlans[0].premises); ok(s, 'press'); ok(s, 'frame'); ok(s, 'stop'); } assert.deepEqual(a.projection(), b.projection()); });
for (const [name, mutate] of [
  ['missing proposition', d => d.responses[0].adds.push('missing')],
  ['missing evidence', d => d.goals[0].basis.push('missing')],
  ['duplicate ID', d => { d.goals[0].id = d.responses[0].id; }],
  ['unreachable premise', d => { d.argumentPlans[0].premises[0] = 'P_SIGN_LIGHT'; }],
  ['missing fallback', d => d.resolutionRules.pop()],
  ['unknown condition', d => { d.argumentPlans[0].responseRules[0].when.magic = true; }],
  ['invalid tag', d => { d.resolutionRules[0].when.absentTags = ['missing']; }],
  ['invalid bounds', d => { d.argumentPlans[0].max = 5; }]
]) test('content validator rejects ' + name, () => { const d = E.copy(D); mutate(d); assert.throws(() => createService(d)); });
test('civil architecture smoke: all IDs and content replaced without engine edits', () => {
  const d = E.copy(D); const map = new Map(); let count = 0;
  function remap(v) { if (Array.isArray(v)) return v.map(remap); if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, remap(x)])); if (typeof v === 'string' && /^[A-Z][A-Z0-9_]+$/.test(v) && !E.types.includes(v)) { if (!map.has(v)) map.set(v, 'CIVIL_' + (++count)); return map.get(v); } return v; }
  const civil = remap(d); civil.title = 'Test-only contract dispute'; civil.profile.roles.claimant = 'Plaintiff'; civil.profile.roles.respondent = 'Defendant';
  civil.issues[0].title = 'Breach'; civil.issues[1].title = 'Damages'; civil.propositions[0].text = 'Contract Exists'; civil.propositions[1].text = 'Breach'; civil.propositions[2].text = 'Damages';
  const s = fresh(civil); establish(s, civil.goals.filter(g=>g.witnessId===civil.witnesses[0].id).map(g => g.id), civil); select(s, civil.argumentPlans[0].premises); ok(s, 'frame'); const v = ok(s, 'stop'); assert.equal(v.state.resolution.type, 'adjudicated'); assert.equal(v.case.profile.roles.claimant, 'Plaintiff');
});
