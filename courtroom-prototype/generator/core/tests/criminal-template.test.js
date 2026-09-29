'use strict';
// GEN-001 2단계 항목 2·3 — ARCH_CRIMINAL_ASSAULT 템플릿 회귀.
// `node --test generator/core/tests`로 실행한다.
// engine/trial.js는 courtroom-prototype/engine/ 소유이며 이 테스트는 그 validate()를 '읽기'로만
// 사용한다 (generator/ 밖 파일을 수정하지 않았다).

const test = require('node:test');
const assert = require('node:assert/strict');

const archetype = require('../archetype.criminal.example.js');
const { buildContestedCase } = require('../contested.js');
const { validateArchetype } = require('../validate.js');
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

test('buildContestedCase(criminal): engine/trial.js validate()를 통과한다 (여러 시드)', () => {
  for (const seed of [1, 2, 3, 42, 777, 123456]) {
    const c = buildContestedCase(archetype, seed, []);
    assert.equal(engineTrial.validate(c), true, `seed ${seed} validate 실패`);
  }
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
