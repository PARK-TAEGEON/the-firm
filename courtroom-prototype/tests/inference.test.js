'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('./case-v065');
const E = require('../engine/core');
const { createService } = require('../services/courtroom');

function command(service, action, payload) {
  const result = require('./settle-procedure')(service,service.command(action, payload));
  assert.equal(result.ok, true, result.error);
  return result.view;
}
function fresh(theory = 'THEORY_IDENTITY') {
  const service = createService(D);
  command(service, 'strategy', { id: theory });
  return service;
}
function establish(service, ids) {
  for (const id of ids) {
    const goal = D.goals.find(item => item.id === id);
    command(service, 'establish', { id, basis: goal.basis });
  }
}
function frameResult(goalIds, propositionIds, theory = 'THEORY_IDENTITY') {
  const service = fresh(theory);
  establish(service, goalIds);
  command(service, 'select', { ids: propositionIds });
  const before = service.projection().argument.inference;
  command(service, 'frame');
  const result = command(service, 'stop').state.resolution;
  return { before, result };
}

test('different proposition combinations resolve to authored inference variants', () => {
  const cases = [
    [['G_DISTANCE', 'G_DURATION'], ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT'], 'INF_DISTANCE_DURATION', 'limited'],
    [['G_LIGHTING', 'G_DURATION'], ['P_LIGHTING_POOR', 'P_OBSERVATION_SHORT'], 'INF_LIGHT_DURATION', 'strong'],
    [['G_DURATION', 'G_INITIAL'], ['P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN'], 'INF_DURATION_INITIAL', 'strong'],
  ];
  for (const [goals, premises, id, strength] of cases) {
    const service = fresh(); establish(service, goals); command(service, 'select', { ids: premises });
    assert.equal(service.projection().argument.inference.id, id);
    assert.equal(service.projection().argument.inference.strength, strength);
  }
});

test('weak, strong and compelling Frames create different record-only outcomes', () => {
  const limited = frameResult(['G_DISTANCE', 'G_DURATION'], ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT']);
  const strong = frameResult(['G_LIGHTING', 'G_DURATION'], ['P_LIGHTING_POOR', 'P_OBSERVATION_SHORT']);
  const compelling = frameResult(['G_DISTANCE', 'G_LIGHTING', 'G_DURATION', 'G_INITIAL'], D.argumentPlans[0].premises);
  assert.deepEqual([limited.result.code, strong.result.code, compelling.result.code], ['LIMITED_ARGUMENT', 'WEAKENED', 'COMPELLING_ARGUMENT']);
  assert.deepEqual([limited.result.framedArguments[0].strength, strong.result.framedArguments[0].strength, compelling.result.framedArguments[0].strength], ['limited', 'strong', 'compelling']);
});

test('mixed light-source exploration adds favorable and hard counter propositions', () => {
  const service = fresh(); establish(service, ['G_LIGHT_SOURCE']);
  const ids = E.recordIds(service.projection().state);
  assert.ok(ids.includes('P_LIGHTING_POOR'));
  assert.ok(ids.includes('P_SIGN_LIGHT'));
  assert.equal(D.goals.find(goal => goal.id === 'G_LIGHT_SOURCE').informationType, 'mixed');
  assert.equal(D.propositions.find(p => p.id === 'P_SIGN_LIGHT').counterType, 'hard');
});

test('stopping before a mixed exploration preserves a strong uncontested argument', () => {
  const goals = ['G_DISTANCE', 'G_DURATION', 'G_INITIAL'];
  const premises = ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN'];
  const safe = frameResult(goals, premises).result;
  const service = fresh(); establish(service, goals); command(service, 'select', { ids: premises }); command(service, 'frame'); establish(service, ['G_LIGHT_SOURCE']);
  const explored = command(service, 'stop').state.resolution;
  assert.equal(safe.code, 'WEAKENED');
  assert.equal(safe.activeCounterRefs.length, 0);
  assert.equal(explored.code, 'CONFLICTING');
  assert.equal(explored.activeCounterRefs.length, 1);
});

test('hard counter remains in CourtRecord without an immediate response route', () => {
  const service = fresh(); establish(service, ['G_LIGHT_SOURCE']);
  const view = service.projection();
  const record = view.state.records.evidence.find(item => item.propositionId === 'P_SIGN_LIGHT');
  assert.ok(record);
  assert.equal(view.availability.counters.some(item => item.target === 'P_SIGN_LIGHT'), false);
  assert.ok(view.assessment.activeCounterRefs.includes(record.id));
});

test('argument frame is separate from a CaseTheory-level major commitment', () => {
  const { result } = frameResult(['G_DISTANCE', 'G_DURATION'], ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT']);
  assert.equal(result.strategy.argumentFrameRefs.length, 1);
  assert.equal(result.strategy.majorCommitmentRefs.length, 0);
  assert.equal(result.strategy.positionStatus, 'no_major_commitment');
});

test('the same inference remains core in Theory A and peripheral in Theory B', () => {
  const service = fresh(); establish(service, ['G_LIGHTING', 'G_DURATION']); command(service, 'select', { ids: ['P_LIGHTING_POOR', 'P_OBSERVATION_SHORT'] }); command(service, 'frame');
  const records = service.projection().state.records;
  const a = E.evaluateRecord(D, records, 'THEORY_IDENTITY');
  const b = E.evaluateRecord(D, records, 'THEORY_INTENT');
  assert.equal(a.framedArguments[0].inferenceId, b.framedArguments[0].inferenceId);
  assert.equal(a.framedArguments[0].value, 'core');
  assert.equal(b.framedArguments[0].value, 'peripheral');
  assert.deepEqual(b.strategy.unresolvedIssues, ['INTENT']);
});

test('inference evaluation replays from CourtRecord and rejects forged variants', () => {
  const service = fresh(); establish(service, ['G_DISTANCE', 'G_DURATION']); command(service, 'select', { ids: ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT'] }); command(service, 'frame');
  const records = service.projection().state.records;
  const baseline = E.evaluateRecord(D, records, 'THEORY_IDENTITY');
  assert.equal(baseline.code, 'LIMITED_ARGUMENT');
  const forged = E.copy(records); forged.advocacy[0].inferenceId = 'INF_IDENTIFICATION_RELIABILITY';
  assert.equal(E.evaluateRecord(D, forged, 'THEORY_IDENTITY').code, 'DOUBT_RECORDED');
  assert.equal(E.evaluateRecord(D, forged, 'THEORY_IDENTITY').framedArguments.length, 0);
});

test('content validation rejects duplicate inference basis and invalid hard-counter routes', () => {
  const duplicate = E.copy(D); duplicate.argumentPlans[0].inferenceVariants[1].premises = [...duplicate.argumentPlans[0].inferenceVariants[0].premises];
  assert.throws(() => createService(duplicate));
  const routedHard = E.copy(D); routedHard.counterResponses.push({ ...routedHard.counterResponses[0], id: 'COUNTER_HARD', target: 'P_SIGN_LIGHT' });
  assert.throws(() => createService(routedHard));
});
