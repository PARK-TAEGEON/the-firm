'use strict';
// GEN-001 — 결정성·검증기 회귀. `node --test generator/core/tests`로 실행한다.

const test = require('node:test');
const assert = require('node:assert/strict');

const archetype = require('../archetype.example.js');
const twist = require('../twist.example.js');
const { generateDailyCase } = require('../generate.js');
const { validateArchetype, validateTwist } = require('../validate.js');
const { evaluateActivation, computeBaseStrength } = require('../format.js');

test('generateDailyCase: 같은 시드는 같은 사건을 만든다', () => {
  const a = generateDailyCase(archetype, 20260928);
  const b = generateDailyCase(archetype, 20260928);
  assert.deepEqual(a, b);
});

test('generateDailyCase: 다른 시드는 다른 사건을 만든다', () => {
  const a = generateDailyCase(archetype, 1);
  const b = generateDailyCase(archetype, 2);
  assert.notDeepEqual(a, b);
});

test('generateDailyCase: 값이 원형 범위 안에 있다', () => {
  for (const seed of [1, 42, 999, 123456]) {
    const c = generateDailyCase(archetype, seed);
    assert.ok(c.fee.retainer >= archetype.fee.retainer[0] && c.fee.retainer <= archetype.fee.retainer[1]);
    assert.ok(c.claimAmount >= archetype.claim_amount[0] && c.claimAmount <= archetype.claim_amount[1]);
    assert.ok(c.durationWeeks >= archetype.duration_weeks[0] && c.durationWeeks <= archetype.duration_weeks[1]);
    for (const key of Object.keys(archetype.truth_params)) {
      const [min, max] = archetype.truth_params[key];
      assert.ok(c.truth[key] >= min && c.truth[key] <= max, `truth.${key} out of range`);
    }
  }
});

test('generateDailyCase: outcomeSummary는 claim_amount(보증금)를 쓰고 retainer(착수금)와 섞이지 않는다', () => {
  const c = generateDailyCase(archetype, 20260928);
  assert.ok(c.outcomeSummary.includes(`보증금 ${c.claimAmount}만원대`));
  assert.ok(!c.outcomeSummary.includes(`보증금 ${c.fee.retainer}만원대`) || c.claimAmount === c.fee.retainer);
});

test('evaluateActivation: 연산자별로 truth 값을 올바르게 비교한다', () => {
  assert.equal(evaluateActivation({ param: 'x', op: '>=', value: 0.6 }, { x: 0.6 }), true);
  assert.equal(evaluateActivation({ param: 'x', op: '>=', value: 0.6 }, { x: 0.59 }), false);
  assert.equal(evaluateActivation({ param: 'x', op: '<', value: 0.6 }, { x: 0.1 }), true);
  assert.equal(evaluateActivation({ param: 'x', op: '==', value: 1 }, { x: 1 }), true);
});

test('computeBaseStrength: direct/inverse 방향이 반대로 움직인다', () => {
  const rule = { strengthRange: [1, 7] };
  const direct = computeBaseStrength({ ...rule, direction: 'direct' }, 1);
  const inverse = computeBaseStrength({ ...rule, direction: 'inverse' }, 1);
  assert.equal(direct, 7);
  assert.equal(inverse, 1);
});

test('validateArchetype: 유효한 예시 원형은 문제가 없다', () => {
  assert.deepEqual(validateArchetype(archetype), []);
});

test('validateArchetype: issue를 커버하지 않는 evidence_strength_rules는 거부된다', () => {
  const broken = { ...archetype, evidence_strength_rules: [archetype.evidence_strength_rules[0]] };
  const errors = validateArchetype(broken);
  assert.ok(errors.some((e) => e.includes('DEDUCTION')));
});

test('validateArchetype: claim_amount 범위가 없으면 거부된다', () => {
  const { claim_amount, ...broken } = archetype;
  const errors = validateArchetype(broken);
  assert.ok(errors.some((e) => e.includes('claim_amount')));
});

test('validateTwist: 유효한 예시 반전은 문제가 없다', () => {
  assert.deepEqual(validateTwist(archetype, twist), []);
});

test('validateTwist: targetIssue가 원형에 없으면 거부된다', () => {
  const broken = { ...twist, targetIssue: 'NOT_AN_ISSUE' };
  const errors = validateTwist(archetype, broken);
  assert.ok(errors.some((e) => e.includes('targetIssue')));
});

test('validateTwist: activation.param이 truth_params에 없으면 거부된다', () => {
  const broken = { ...twist, activation: { param: 'not_a_truth_param', op: '>=', value: 0.5 } };
  const errors = validateTwist(archetype, broken);
  assert.ok(errors.some((e) => e.includes('truth_params')));
});

test('validateTwist: opponentRecovery.effect.issue가 targetIssue와 다르면 거부된다', () => {
  const broken = { ...twist, opponentRecovery: { ...twist.opponentRecovery, effect: { issue: 'CONTRACT_END', delta: 1 } } };
  const errors = validateTwist(archetype, broken);
  assert.ok(errors.some((e) => e.includes('opponentRecovery')));
});

// buildContestedCase/selectActivatedTwists 회귀는 tests/contested.test.js(activation 게이팅, item 1)와
// tests/criminal-template.test.js(템플릿, engine validate, item 2·3)에 있다.
