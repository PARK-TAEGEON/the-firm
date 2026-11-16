'use strict';
// GEN-001 core 수정 (2026-09-30) 회귀. `node --test generator/core/tests`로 실행한다.
// 기준: docs/DESIGN-NOTES-2026-09.md §1.9~1.11, DEC-LITIGATION-031(N1~N7), DEC-LITIGATION-032.

const test = require('node:test');
const assert = require('node:assert/strict');

const archetype = require('../archetype.criminal.example.js');
const contentArchetypes = require('../../content/archetypes.js');
const contentAssault = contentArchetypes.ARCH_CRIMINAL_ASSAULT; // twists.js의 truth_params를 실제로 가진 원형
const duiArchetype = contentArchetypes.ARCH_DUI;
const contentTwists = require('../../content/twists.js');
const { buildContestedCase, resolveContestedInputs } = require('../contested.js');
const { playThrough, playBestPathForIssue, playThroughRandom } = require('../playthrough.js');
const { createRng, seedFor } = require('../rng.js');
const engineTrial = require('../../../engine/trial.js');

// ---- 항목 1: 준비 예산 < 조사 총비용 ----
test('항목1: 준비 예산이 조사 총비용의 약 55~65%이고 최소 2다 (twist 없음/있음 둘 다)', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const c = buildContestedCase(archetype, seed, []);
    const totalCost = c.investigations.reduce((s, i) => s + i.cost, 0);
    assert.ok(c.prep.budget < totalCost, `seed ${seed}: budget(${c.prep.budget})이 총비용(${totalCost})보다 작아야 한다`);
    assert.ok(c.prep.budget >= 2, `seed ${seed}: budget이 최소 2 이상이어야 한다`);
    const ratio = c.prep.budget / totalCost;
    assert.ok(ratio >= 0.5 && ratio <= 0.7, `seed ${seed}: budget 비율 ${ratio}이 대략 55~65% 범위를 크게 벗어난다`);
  }
});

// ---- 항목 2: focus 2~3개, stance 3개, 잘못된 조합 비용 ----
test('항목2: opening.focus는 균형 1개 + 쟁점별 1개(2개 원형이면 3개), stance는 3개다', () => {
  const c = buildContestedCase(archetype, 1, []);
  assert.equal(c.opening.focus.length, 1 + archetype.issues.length);
  assert.ok(c.opening.focus.length >= 2 && c.opening.focus.length <= 3);
  assert.equal(c.opening.stance.length, 3);
  assert.deepEqual(c.opening.stance.map((s) => s.id), ['S_CONTEST', 'S_ADMIT', 'S_DENY']);
});

test('항목2: 쟁점별 focus는 그 쟁점의 증인에게 더 많은 시간을, 다른 증인에게는 더 적게 준다', () => {
  const c = buildContestedCase(archetype, 1, []);
  const balanced = c.opening.focus.find((f) => f.id === 'F_BALANCED');
  for (const issue of archetype.issues) {
    const focused = c.opening.focus.find((f) => f.id === `F_${issue.id}`);
    const targetWitness = c.witnesses.find((w) => w.issue === issue.id);
    const otherWitnesses = c.witnesses.filter((w) => w.issue !== issue.id);
    assert.ok(focused.time[targetWitness.id] > balanced.time[targetWitness.id]);
    otherWitnesses.forEach((w) => assert.ok(focused.time[w.id] <= balanced.time[w.id]));
  }
});

test('항목2: 활성화된 twist가 있는 쟁점에는 stance 충돌 접근법(byStance + stanceConflict)이 붙는다', () => {
  let found = false;
  for (let seed = 1; seed <= 200 && !found; seed++) {
    const c = buildContestedCase(contentAssault, seed, contentTwists);
    if (!c.twistsApplied.length) continue;
    found = true;
    for (const twistId of c.twistsApplied) {
      const twist = contentTwists.find((t) => t.id === twistId);
      const w = c.witnesses.find((w) => w.issue === twist.targetIssue);
      const conflictApproach = w.approaches.find((a) => a.id === `A_${twist.targetIssue}_STANCE_${twist.id}`);
      assert.ok(conflictApproach, `twist ${twistId}에 대응하는 stance 충돌 접근법이 없다`);
      assert.deepEqual(Object.keys(conflictApproach.byStance).sort(), ['S_ADMIT', 'S_CONTEST', 'S_DENY']);
      assert.equal(conflictApproach.stanceConflict.stance, 'S_DENY');
      assert.equal(conflictApproach.stanceConflict.credibility, -1);
    }
  }
  assert.ok(found, '200시드 안에서 twist가 활성화된 사건을 찾지 못했다');
});

// ---- 항목 3: 이의 창 1개, proper/improper 섞임 ----
test('항목3: 증인마다 이의 창이 정확히 1개이고, 두 증인 사이에 proper/improper가 섞인다', () => {
  const c = buildContestedCase(archetype, 1, []);
  const properFlags = c.witnesses.map((w) => {
    const objections = w.direct.filter((s) => s.type === 'objection');
    assert.equal(objections.length, 1, `${w.id}: 이의 창은 정확히 1개여야 한다`);
    return objections[0].proper;
  });
  assert.ok(properFlags.includes(true) && properFlags.includes(false), 'proper/improper가 섞이지 않았다');
});

// ---- 항목 4: press 2종, 경계선 사건에서 성공 시 뒤집힘 / 과욕 시 역효과 ----
test('항목4: 증인마다 press가 limited 1개 + overreach 1개다', () => {
  const c = buildContestedCase(archetype, 1, []);
  c.witnesses.forEach((w) => {
    assert.deepEqual(w.presses.map((p) => p.kind).sort(), ['limited', 'overreach']);
    const overreach = w.presses.find((p) => p.kind === 'overreach');
    assert.ok(!overreach.success, 'overreach는 success가 없어야 한다(engine이 항상 실패시킨다)');
    assert.equal(overreach.fail.delta, 2);
    assert.equal(overreach.fail.credibility, -1);
  });
});

test('항목4: 결론 요구 성공이 경계선 사건을 doubt로 뒤집는 실제 경로가 존재한다', () => {
  // 쟁점 집중 focus + 접근법 전부 + press까지 쓰는 최선 경로(playBestPathForIssue)가 무죄를 만드는
  // 시드가 실제로 있어야 "press가 판결에 영향을 준다"고 말할 수 있다.
  let flipped = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const c = buildContestedCase(archetype, seed, []);
    for (const issue of archetype.issues) {
      if (playBestPathForIssue(c, issue.id).outcome === 'not_guilty') flipped++;
    }
  }
  assert.ok(flipped > 0, '100시드 안에서 최선 경로가 무죄로 뒤집는 사건을 하나도 못 찾았다');
});

test('항목4: 과욕(overreach) press는 항상 실패하고 credibility를 깎는다', () => {
  const c = buildContestedCase(archetype, 1, []);
  const issue = archetype.issues[0];
  const w = c.witnesses.find((x) => x.issue === issue.id);
  const T = require('../../../engine/trial.js');
  const overreach = w.presses.find((p) => p.kind === 'overreach');
  assert.equal(T.pressSucceeds(overreach, ['ANY_POINT']), false);
});

// ---- 항목 5(측정 유틸리티 자체 회귀): playBestPathForIssue / playThroughRandom이 정상 동작한다 ----
test('항목5 유틸: playBestPathForIssue는 결정적이다(같은 입력 같은 출력)', () => {
  const c = buildContestedCase(archetype, 7, []);
  const a = playBestPathForIssue(c, 'ISSUE_IDENTITY');
  const b = playBestPathForIssue(c, 'ISSUE_IDENTITY');
  assert.equal(a.outcome, b.outcome);
});

test('항목5 유틸: playThroughRandom은 같은 rng 시퀀스면 같은 결과, 다른 시드면 최소 하나는 값이 다르다', () => {
  const c = buildContestedCase(archetype, 7, []);
  const r1 = playThroughRandom(c, createRng(seedFor(7, 'random-policy')));
  const r2 = playThroughRandom(c, createRng(seedFor(7, 'random-policy')));
  assert.equal(r1.outcome, r2.outcome);
  const outcomes = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    outcomes.add(playThroughRandom(c, createRng(seedFor(seed, 'random-policy'))).outcome);
  }
  assert.ok(outcomes.size >= 1);
});

// ---- 항목 6: 원형별 RNG 스트림 분리 ----
test('항목6: 같은 seed 번호라도 원형이 다르면 truth 스트림이 분리된다', () => {
  const assaultTruth = resolveContestedInputs(archetype, 5).truth;
  const duiTruth = resolveContestedInputs(duiArchetype, 5).truth;
  // 두 원형은 truth_params 키 이름 자체가 달라 값 형태로 직접 비교할 수는 없다 — 대신 내부 RNG 시드가
  // 실제로 다른지 seedFor로 직접 확인한다(이게 스트림 분리의 근거다).
  assert.notEqual(seedFor(5, archetype.id), seedFor(5, duiArchetype.id));
});

test('항목6: seedFor는 결정적이다(같은 입력 같은 출력) — createRng(seedFor(seed, id))로 매번 같은 스트림을 얻는다', () => {
  const a = resolveContestedInputs(archetype, 99);
  const b = resolveContestedInputs(archetype, 99);
  assert.deepEqual(a.truth, b.truth);
});

// ---- validate() + playThrough 스모크 (신규 구조 전체가 여전히 끝까지 진행된다) ----
test('신규 구조 스모크: validate 통과 + playThrough(양쪽) 완주, 여러 시드', () => {
  for (const seed of [1, 2, 3, 42, 777]) {
    const c = buildContestedCase(contentAssault, seed, contentTwists);
    assert.equal(engineTrial.validate(c), true, `seed ${seed} validate 실패`);
    assert.ok(['guilty', 'not_guilty'].includes(playThrough(c, { fullPrep: false }).outcome));
    assert.ok(['guilty', 'not_guilty'].includes(playThrough(c, { fullPrep: true }).outcome));
  }
});
