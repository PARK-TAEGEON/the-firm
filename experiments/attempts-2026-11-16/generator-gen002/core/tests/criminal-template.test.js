'use strict';
// GEN-001 2단계(항목 2·3) + 2.5단계 — ARCH_CRIMINAL_ASSAULT 템플릿 회귀.
// `node --test generator/core/tests`로 실행한다.
// engine/trial.js, services/trial.js는 courtroom-prototype 소유 파일이며 이 테스트는 그 API를
// '읽기'로만 사용한다 (generator/ 밖 파일을 수정하지 않았다).
//
// 2.5단계 사람 리뷰: 판정 기준을 validate() 통과에서 "준비·개회사·주신문·반대신문·재주신문·판결까지
// 끝까지 진행"으로 바꿨다. validate() 테스트는 빠른 구조 점검으로 남겨두되, 아래 playThrough 기반
// 테스트가 실제 acceptance bar다. 300시드 통계 밸런스 점검은 generator/balance.js에 있다.

const test = require('node:test');
const assert = require('node:assert/strict');

const archetype = require('../archetype.criminal.example.js');
const { buildContestedCase } = require('../contested.js');
const { validateArchetype } = require('../validate.js');
const { playThrough } = require('../playthrough.js');
const engineTrial = require('../../../engine/trial.js');

test('archetype.criminal.example: 형식 검증을 통과한다', () => {
  assert.deepEqual(validateArchetype(archetype), []);
});

test('buildContestedCase(criminal, seed, []): 반전 후보가 없으면 템플릿만으로 사건을 만든다', () => {
  const c = buildContestedCase(archetype, 1, []);
  assert.deepEqual(c.twistsApplied, []);
  // issue 2개 × evidence 2개 = investigation/card 4개씩, 전부 템플릿 생성.
  assert.equal(c.investigations.length, 4);
  assert.equal(c.cards.length, 4);
  c.witnesses.forEach((w) => assert.deepEqual(w.redirect, []));
});

test('buildContestedCase(criminal): engine/trial.js validate()를 통과한다 (빠른 구조 점검, 여러 시드)', () => {
  for (const seed of [1, 2, 3, 42, 777, 123456]) {
    const c = buildContestedCase(archetype, seed, []);
    assert.equal(engineTrial.validate(c), true, `seed ${seed} validate 실패`);
  }
});

test('buildContestedCase(criminal) → playThrough: 준비 없이도 판결까지 끝까지 진행된다 (acceptance bar)', () => {
  for (const seed of [1, 2, 3, 42, 777, 123456]) {
    const c = buildContestedCase(archetype, seed, []);
    const result = playThrough(c, { fullPrep: false });
    assert.ok(['guilty', 'not_guilty'].includes(result.outcome), `seed ${seed} 판결 결과가 이상하다: ${result.outcome}`);
  }
});

test('buildContestedCase(criminal) → playThrough: 모든 준비 후에도 판결까지 끝까지 진행된다 (acceptance bar)', () => {
  for (const seed of [1, 2, 3, 42, 777, 123456]) {
    const c = buildContestedCase(archetype, seed, []);
    const result = playThrough(c, { fullPrep: true });
    assert.ok(['guilty', 'not_guilty'].includes(result.outcome), `seed ${seed} 판결 결과가 이상하다: ${result.outcome}`);
  }
});

test('playThrough: 준비 없이 진행하면 카드가 없어 approach를 쓸 수 없고 무죄가 나오지 않는다 (2.5단계 항목 a 단위 회귀)', () => {
  const c = buildContestedCase(archetype, 1, []);
  const result = playThrough(c, { fullPrep: false });
  assert.equal(result.outcome, 'guilty');
  result.view.projection.issues.forEach((issue) => assert.notEqual(issue.band, 'doubt'));
});

test('buildContestedCase(criminal): 같은 시드는 같은 사건을 만든다', () => {
  const a = buildContestedCase(archetype, 777, []);
  const b = buildContestedCase(archetype, 777, []);
  assert.deepEqual(a, b);
});

test('buildContestedCase(criminal): issue baseline이 항상 bands.doubt보다 크다 (2단계 항목 2)', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const c = buildContestedCase(archetype, seed, []);
    for (const issue of c.issues) {
      assert.ok(issue.baseline > c.bands.doubt, `seed ${seed} issue ${issue.id} baseline=${issue.baseline}는 doubt(${c.bands.doubt}) 이하다`);
    }
  }
});

test('buildContestedCase(criminal): 전역 id가 모두 유일하다 (engine validate의 암묵적 요구사항)', () => {
  const c = buildContestedCase(archetype, 42, []);
  const ids = [];
  ids.push(c.id);
  c.cards.forEach((x) => ids.push(x.id));
  c.prosecutionExhibits.forEach((x) => ids.push(x.id));
  c.issues.forEach((x) => ids.push(x.id));
  c.investigations.forEach((x) => ids.push(x.id));
  c.opening.focus.forEach((x) => ids.push(x.id));
  c.opening.stance.forEach((x) => ids.push(x.id));
  c.witnesses.forEach((w) => {
    ids.push(w.id);
    w.direct.forEach((x) => ids.push(x.id));
    w.approaches.forEach((x) => ids.push(x.id));
    w.presses.forEach((x) => ids.push(x.id));
    w.redirect.forEach((x) => ids.push(x.id));
  });
  assert.equal(new Set(ids).size, ids.length, 'id 중복이 있다');
});
