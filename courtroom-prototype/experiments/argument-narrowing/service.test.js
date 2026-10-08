'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { C, prepare, toClosing, finish, tr, command } = require('./paths');
const N = require('./service'), T = require('../../engine/trial');
const projection = s => s.projection().trial.argumentRevision;
const revisionPayload = s => ({ basisIds: projection(s).bases.slice(0, 2).map(b => b.id), acknowledgeCounters: true });
function fail(s, action, payload) {
  const before = s.projection();
  assert.equal(s.command('trial', { action, payload }).ok, false);
  assert.deepEqual(s.projection(), before);
}
for (const prosecutorId of ['novice', 'veteran']) test(prosecutorId + ': append-only revision, replay, final speech and unchanged verdict', () => {
  const s = toClosing(prepare({ prosecutorId })), before = s.projection().trial;
  const verdict = T.adjudicate(C.variants[prosecutorId], T.project(C.variants[prosecutorId], before.records));
  tr(s, 'narrowArgument', revisionPayload(s));
  const after = s.projection().trial, p = projection(s);
  assert.deepEqual(after.records.slice(0, before.records.length), before.records);
  assert.deepEqual(N.project(after.records), p);
  assert.deepEqual(T.adjudicate(C.variants[prosecutorId], T.project(C.variants[prosecutorId], after.records)), verdict);
  assert.equal(p.revision.revises, p.claim.id);
  assert.equal(p.response.respondsTo, p.revision.id);
  assert.equal(p.counters.find(c => c.ruleId === 'COUNTER_NARROWING_REDIRECT').text,
    before.records.find(r => r.kind === 'redirect' && r.refId === 'RH_SIG_CAUSE').memo);
  for (const r of after.records.slice(before.records.length)) assert.deepEqual(r.effects, []);
  const result = finish(s), closing = result.trial.records.find(r => r.kind === 'closing_argument');
  assert.equal(closing.revisionId, p.revision.id);
  assert.equal(closing.responseId, p.response.id);
  assert.deepEqual(closing.basisIds, p.revision.basisIds);
  assert.match(closing.lines[0].text, /단정은 철회/);
  assert.match(closing.lines[0].text, /남는 반론/);
  assert.equal(result.trial.state.phase, 'verdict');
});
test('off flag rejects experiment commands and preserves original result', () => {
  const s = prepare({ enabled: false, declare: false });
  assert.equal(s.projection().trial.argumentRevision, undefined);
  fail(s, 'commitCauseClaim'); toClosing(s);
  fail(s, 'narrowArgument', { basisIds: [], acknowledgeCounters: true });
  fail(s, 'closingArgument', { id: 'FINAL_NARROWING_CAUSE' });
  const base = finish(s, 'FINAL_SIG_CAUSE');
  const enabled = toClosing(prepare()); tr(enabled, 'narrowArgument', revisionPayload(enabled));
  const revised = finish(enabled);
  for (const key of ['key', 'convicted', 'judgment', 'offense', 'sentence', 'pronouncement']) assert.deepEqual(revised.outcome[key], base.outcome[key]);
});
test('invalid, missing, duplicate, foreign and stale bases fail atomically', () => {
  const s = toClosing(prepare()), valid = revisionPayload(s);
  for (const basisIds of [undefined, [], ['unknown'], [valid.basisIds[0], valid.basisIds[0]], [projection(s).facts[0].id]]) fail(s, 'narrowArgument', { basisIds, acknowledgeCounters: true });
  fail(s, 'narrowArgument', { ...valid, acknowledgeCounters: false });
  fail(s, 'closingArgument', { id: 'FINAL_NARROWING_CAUSE' });
  command(s, 'reset'); command(s, 'start', { caseId: C.id, prosecutorId: 'veteran' });
  assert.equal(projection(s).claim, undefined); assert.equal(projection(s).revision, undefined);
  fail(s, 'narrowArgument', valid);
  for (const id of ['INV_SIG_MEDICAL', 'INV_SIG_SEQUENCE']) tr(s, 'investigate', { id });
  s.projection().trial.cards.forEach(c => tr(s, 'fileEvidence', { id: c.id, status: 'filed' }));
  tr(s, 'finishPrep'); tr(s, 'commitCauseClaim'); toClosing(s);
  fail(s, 'narrowArgument', valid);
});
test('phase gates, one revision and no mutation after closing', () => {
  const s = prepare(); fail(s, 'commitCauseClaim'); fail(s, 'narrowArgument', { basisIds: [], acknowledgeCounters: true });
  toClosing(s); fail(s, 'commitCauseClaim'); tr(s, 'narrowArgument', revisionPayload(s));
  fail(s, 'narrowArgument', revisionPayload(s)); fail(s, 'closingArgument', { id: 'FINAL_NARROWING_RETAIN' });
  finish(s); fail(s, 'narrowArgument', revisionPayload(s));
});
test('unfiled material never becomes a selectable confirmed basis', () => {
  const s = toClosing(prepare({ file: false }));
  assert.equal(projection(s).bases.length, 0);
  fail(s, 'narrowArgument', { basisIds: s.projection().trial.records.filter(r => r.kind === 'approach').map(r => r.id), acknowledgeCounters: true });
});
test('overreach is a revisable public claim but retains its adverse effects', () => {
  const s = toClosing(prepare({ declare: false }), { overreach: true });
  const p = projection(s); assert.equal(p.claim.refId, 'P_SIG_CAUSE_OVER');
  assert.ok(p.counters.some(c => c.ruleId === 'COUNTER_NARROWING_OVERREACH'));
  const rec = p.claim; tr(s, 'narrowArgument', revisionPayload(s));
  assert.deepEqual(s.projection().trial.records.find(r => r.id === rec.id), rec);
  assert.ok(rec.effects.some(([, value]) => value > 0));
});
test('prepared rebuttal remains unresolved; successful rebuttal only qualifies the counter', () => {
  const prep = ['INV_SIG_MEDICAL', 'INV_SIG_SEQUENCE', 'INV_SIG_LAYOUT'];
  const blocked = prepare({ prep }); tr(blocked, 'fileEvidence', { id: 'CARD_SIG_LAYOUT', status: 'filed' });
  toClosing(blocked, { earlyLayout: true });
  assert.ok(!projection(blocked).bases.some(b => b.text.includes('운반대')));
  assert.equal(projection(blocked).counters.find(c => c.ruleId === 'COUNTER_NARROWING_REDIRECT').qualifiedBy.length, 0);
  const success = toClosing(prepare({ prep }));
  assert.equal(projection(success).counters.find(c => c.ruleId === 'COUNTER_NARROWING_REDIRECT').qualifiedBy.length, 1);
  tr(success, 'narrowArgument', revisionPayload(success));
  assert.match(projection(success).response.lines[0].text, /실제 원인으로 확정된 것은 아닙니다/);
});
test('passed causal opinion remains a counter; acknowledging does not resolve it', () => {
  const s = toClosing(prepare(), { pass: true });
  assert.ok(projection(s).counters.some(c => c.ruleId === 'COUNTER_NARROWING_OPINION'));
  const counters = projection(s).counters; tr(s, 'narrowArgument', revisionPayload(s));
  assert.deepEqual(projection(s).counters, counters);
});
test('canonical basis order, deterministic replay, no mutation by projection', () => {
  const a = toClosing(prepare()), b = toClosing(prepare());
  const p = revisionPayload(a); tr(a, 'narrowArgument', p); tr(b, 'narrowArgument', { ...p, basisIds: [...p.basisIds].reverse() });
  assert.deepEqual(a.projection(), b.projection());
  const reversed = [...a.projection().trial.records].reverse();
  assert.deepEqual(N.project(reversed).bases.map(x => x.id), [...projection(a).bases].reverse().map(x => x.id));
  const view = projection(a); view.revision.basisIds.length = 0;
  assert.equal(projection(a).revision.basisIds.length, 2);
});
test('selected subset alone supplies favorable closing premises; alternatives stay available', () => {
  const s = toClosing(prepare()); const basisIds = [projection(s).bases[0].id];
  tr(s, 'narrowArgument', { basisIds, acknowledgeCounters: true });
  const speech = N.closing(s.projection().trial.records, 'FINAL_NARROWING_CAUSE');
  assert.deepEqual(speech.basisIds, basisIds);
  assert.ok(!speech.text.includes(projection(s).bases[1].text));
  const alternative = finish(s, 'FINAL_SIG_MERCY');
  assert.equal(alternative.trial.records.find(r => r.kind === 'closing_argument').revisionId, undefined);
});
test('retaining strong claim and absence of a prior claim', () => {
  const s = toClosing(prepare()); const result = finish(s, 'FINAL_NARROWING_RETAIN');
  assert.match(result.trial.records.find(r => r.kind === 'closing_argument').lines[0].text, /아무 관계가 없습니다/);
  const noClaim = toClosing(prepare({ declare: false }));
  fail(noClaim, 'narrowArgument', revisionPayload(noClaim)); fail(noClaim, 'closingArgument', { id: 'FINAL_NARROWING_RETAIN' });
});
