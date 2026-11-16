'use strict';
// GEN-001 2단계 항목 1 — activation 게이팅 회귀. `node --test generator/core/tests`로 실행한다.
// 버그: activation이 false인 twist가 그대로 사건에 붙던 문제. 고침: selectActivatedTwists가 truth를
// 먼저 확정하고, archetype.twists_allowed 중 activation을 만족하는 것만 고른다. 없으면 반전 없는 사건.

const test = require('node:test');
const assert = require('node:assert/strict');

const archetype = require('../archetype.example.js'); // ARCH_LEASE_DEPOSIT — twist 게이팅 검증용 고정 fixture
const twist = require('../twist.example.js'); // TWIST_CLIENT_HIDES_DAMAGE, activation: damage_by_tenant >= 0.6
const { selectActivatedTwists, buildContestedCase, resolveContestedInputs } = require('../contested.js');

// buildContestedCase와 반드시 같은 rng 소비 순서로 truth를 구해야 한다 — resolveContestedInputs를 통해서만.
function truthForSeed(seed) {
  return resolveContestedInputs(archetype, seed).truth;
}

function findSeed(predicate, limit = 5000) {
  for (let seed = 1; seed < limit; seed++) {
    if (predicate(truthForSeed(seed))) return seed;
  }
  return null;
}

test('selectActivatedTwists: activation을 만족하면 고른다', () => {
  const seed = findSeed((t) => t.damage_by_tenant >= 0.6);
  assert.ok(seed !== null, 'damage_by_tenant >= 0.6인 시드를 찾지 못했다');
  const selected = selectActivatedTwists(archetype, truthForSeed(seed), [twist]);
  assert.deepEqual(selected.map((t) => t.id), ['TWIST_CLIENT_HIDES_DAMAGE']);
});

test('selectActivatedTwists: activation을 만족하지 않으면 고르지 않는다 (버그 회귀)', () => {
  const seed = findSeed((t) => t.damage_by_tenant < 0.6);
  assert.ok(seed !== null, 'damage_by_tenant < 0.6인 시드를 찾지 못했다');
  const selected = selectActivatedTwists(archetype, truthForSeed(seed), [twist]);
  assert.deepEqual(selected, []);
});

test('selectActivatedTwists: 후보 목록이 비어 있으면 언제나 빈 배열이다', () => {
  const selected = selectActivatedTwists(archetype, truthForSeed(1), []);
  assert.deepEqual(selected, []);
});

test('selectActivatedTwists: appliesTo가 다른 원형이면 activation과 무관하게 고르지 않는다', () => {
  const otherArchetypeTwist = { ...twist, appliesTo: ['ARCH_SOMETHING_ELSE'] };
  const seed = findSeed((t) => t.damage_by_tenant >= 0.6);
  const selected = selectActivatedTwists(archetype, truthForSeed(seed), [otherArchetypeTwist]);
  assert.deepEqual(selected, []);
});

test('buildContestedCase: activation false면 witness redirect가 비어 있고 twist 카드가 안 붙는다', () => {
  const seed = findSeed((t) => t.damage_by_tenant < 0.6);
  const c = buildContestedCase(archetype, seed, [twist]);
  assert.deepEqual(c.twistsApplied, []);
  const witness = c.witnesses.find((w) => w.issue === 'DEDUCTION');
  assert.deepEqual(witness.redirect, []);
  assert.ok(!c.cards.some((card) => card.id === 'CARD_CLIENT_DAMAGE_ADMIT'));
  assert.ok(!c.investigations.some((inv) => inv.id === 'INV_CLIENT_REINTERVIEW'));
});

test('buildContestedCase: activation true면 witness redirect에 twist가 정확히 변환되어 붙는다', () => {
  const seed = findSeed((t) => t.damage_by_tenant >= 0.6);
  const c = buildContestedCase(archetype, seed, [twist]);
  assert.deepEqual(c.twistsApplied, ['TWIST_CLIENT_HIDES_DAMAGE']);
  const witness = c.witnesses.find((w) => w.issue === 'DEDUCTION');
  assert.equal(witness.redirect.length, 1);
  const redirect = witness.redirect[0];
  assert.equal(redirect.delta, twist.opponentRecovery.effect.delta);
  assert.equal(redirect.rebuttal.delta, twist.playerCounter.effect.delta);
  assert.equal(redirect.rebuttal.card, twist.investigationCard.cardId);
  assert.ok(c.cards.some((card) => card.id === twist.investigationCard.cardId));
  assert.ok(c.investigations.some((inv) => inv.id === twist.investigationCard.investigationId));
});

test('buildContestedCase: 같은 시드는 twistsApplied를 포함해 같은 사건을 만든다', () => {
  const seed = findSeed((t) => t.damage_by_tenant >= 0.6);
  const a = buildContestedCase(archetype, seed, [twist]);
  const b = buildContestedCase(archetype, seed, [twist]);
  assert.deepEqual(a, b);
});

test('buildContestedCase: 후보 twist 없이도 반전 없는 사건을 만든다 (하나도 없으면 반전 없는 사건)', () => {
  const c = buildContestedCase(archetype, 1, []);
  assert.deepEqual(c.twistsApplied, []);
  c.witnesses.forEach((w) => assert.deepEqual(w.redirect, []));
});
