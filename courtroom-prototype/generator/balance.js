'use strict';
// GEN-001 core 수정 (2026-09-30) — 밸런스 점검 스크립트. generator/content 진입점
// (content.buildContestedCase)으로 content.archetypes의 모든 원형 × seed 1~300을 검사해 원형별로:
//   (a) 준비 없이 진행 시 무죄 0%
//   (b) 최선 경로(탐색) 기준 무죄 가능 사건 ≥ 90% — 재판으로 못 이기는 사건은 목록으로 출력
//   (c) 무작위 합법 준비·무작위 선택 플레이 무죄 40~65%
//   (d) 조사 선택에 따라 결과가 달라지는 사건 비율(목표 50% 이상)을 출력한다.
// 실행: `node generator/balance.js` (courtroom-prototype/ 안에서). node:test가 아니다 — repo의
// tests/ui-budget.js와 같은 plain 스크립트 관례.
//
// 항목 8: 이번 단계는 (b)(c)(d)를 측정·출력까지만 한다 — 기준 미달이어도 이 스크립트가 twist delta나
// 접근법 수치를 튜닝하지 않는다. 수치 조정은 다음에 Codex가 한다(REPORT.md).
//
// (b)와 (d)는 같은 계산을 공유한다: 각 쟁점을 "이거 하나만 doubt로 민다"는 목표로 탐색하는
// playBestPathForIssue를 쟁점마다 돌려서 나온 판결 집합을 본다. 하나라도 not_guilty면 그 사건은
// "이길 수 있다"(b). 쟁점별 판결이 서로 다르면(하나는 무죄, 하나는 유죄) "조사 선택이 결과를 바꾼다"(d).

const content = require('./content');
const { playThrough, playThroughRandom, playBestPathForIssue } = require('./core/playthrough.js');
const { createRng, seedFor } = require('./core/rng.js');

const SEED_COUNT = 300;
const BEST_PATH_MIN = 0.90;
const RANDOM_MIN = 0.40;
const RANDOM_MAX = 0.65;
const CHOICE_MATTERS_MIN = 0.50;

function runForArchetype(archetypeId) {
  const archetype = content.archetypes[archetypeId];
  let noPrepGuilty = 0, noPrepNotGuilty = 0;
  const noPrepAcquittals = [];
  let bestPathWinnable = 0;
  const unwinnableSeeds = [];
  let randomNotGuilty = 0;
  let choiceMattersSeeds = 0;
  const errors = [];

  for (let seed = 1; seed <= SEED_COUNT; seed++) {
    let caseDef;
    try {
      caseDef = content.buildContestedCase(archetypeId, seed);
    } catch (e) {
      errors.push(`seed ${seed} (build): ${e.message}`);
      continue;
    }

    // (a) 준비 없이 진행
    try {
      const noPrep = playThrough(caseDef, { fullPrep: false });
      if (noPrep.outcome === 'not_guilty') { noPrepNotGuilty++; noPrepAcquittals.push(seed); } else noPrepGuilty++;
    } catch (e) {
      errors.push(`seed ${seed} (no prep): ${e.message}`);
    }

    // (b)(d) 쟁점별 최선 경로
    try {
      const perIssueOutcomes = archetype.issues.map((issue) => playBestPathForIssue(caseDef, issue.id).outcome);
      const winnable = perIssueOutcomes.includes('not_guilty');
      if (winnable) bestPathWinnable++; else unwinnableSeeds.push(seed);
      if (new Set(perIssueOutcomes).size > 1) choiceMattersSeeds++;
    } catch (e) {
      errors.push(`seed ${seed} (best-path): ${e.message}`);
    }

    // (c) 무작위 합법 준비 + 무작위 선택
    try {
      const rng = createRng(seedFor(seed, `${archetypeId}:random-policy`));
      const random = playThroughRandom(caseDef, rng);
      if (random.outcome === 'not_guilty') randomNotGuilty++;
    } catch (e) {
      errors.push(`seed ${seed} (random): ${e.message}`);
    }
  }

  const bestPathRate = bestPathWinnable / SEED_COUNT;
  const randomRate = randomNotGuilty / SEED_COUNT;
  const choiceMattersRate = choiceMattersSeeds / SEED_COUNT;

  const checks = [
    { name: '(a) 준비 없이 진행 시 무죄 0%', pass: errors.length === 0 && noPrepNotGuilty === 0, detail: `무죄 ${noPrepNotGuilty}건 / ${SEED_COUNT}건${noPrepAcquittals.length ? ` (seed: ${noPrepAcquittals.slice(0, 10).join(', ')}${noPrepAcquittals.length > 10 ? ' ...' : ''})` : ''}` },
    { name: `(b) 최선 경로 기준 무죄 가능 사건 ≥ ${BEST_PATH_MIN * 100}%`, pass: errors.length === 0 && bestPathRate >= BEST_PATH_MIN, detail: `${bestPathWinnable}/${SEED_COUNT}건 = ${(bestPathRate * 100).toFixed(1)}%, 못 이기는 사건 ${unwinnableSeeds.length}건` },
    { name: `(c) 무작위 준비·무작위 선택 무죄 ${RANDOM_MIN * 100}~${RANDOM_MAX * 100}%`, pass: errors.length === 0 && randomRate >= RANDOM_MIN && randomRate <= RANDOM_MAX, detail: `${randomNotGuilty}/${SEED_COUNT}건 = ${(randomRate * 100).toFixed(1)}%` },
    { name: `(d, 참고) 조사 선택에 따라 결과가 달라지는 사건 비율 ≥ ${CHOICE_MATTERS_MIN * 100}%`, pass: errors.length === 0 && choiceMattersRate >= CHOICE_MATTERS_MIN, detail: `${choiceMattersSeeds}/${SEED_COUNT}건 = ${(choiceMattersRate * 100).toFixed(1)}%` }
  ];

  return {
    archetypeId, checks, errors, seedCount: SEED_COUNT,
    noPrepGuilty, noPrepNotGuilty,
    bestPathWinnable, bestPathRate, unwinnableSeeds,
    randomNotGuilty, randomRate,
    choiceMattersSeeds, choiceMattersRate
  };
}

function run() {
  return Object.keys(content.archetypes).map(runForArchetype);
}

function report(results) {
  let allPass = true;
  for (const result of results) {
    console.log(`GEN-001 밸런스 점검 — ${result.seedCount}시드, ${result.archetypeId}`);
    console.log(`  (a) 준비 없이: 유죄 ${result.noPrepGuilty} / 무죄 ${result.noPrepNotGuilty}`);
    console.log(`  (b) 최선 경로 무죄 가능: ${result.bestPathWinnable}/${result.seedCount} (${(result.bestPathRate * 100).toFixed(1)}%)`);
    if (result.unwinnableSeeds.length) {
      console.log(`      재판으로 못 이기는 사건(${result.unwinnableSeeds.length}건): ${result.unwinnableSeeds.slice(0, 30).join(', ')}${result.unwinnableSeeds.length > 30 ? ' ...' : ''}`);
    }
    console.log(`  (c) 무작위 준비·무작위 선택 무죄: ${result.randomNotGuilty}/${result.seedCount} (${(result.randomRate * 100).toFixed(1)}%)`);
    console.log(`  (d) 조사 선택에 따라 결과가 달라지는 사건: ${result.choiceMattersSeeds}/${result.seedCount} (${(result.choiceMattersRate * 100).toFixed(1)}%)`);
    if (result.errors.length) {
      console.log(`  오류 ${result.errors.length}건:`);
      result.errors.slice(0, 10).forEach((e) => console.log(`    - ${e}`));
      if (result.errors.length > 10) console.log(`    ... 외 ${result.errors.length - 10}건`);
    }
    result.checks.forEach((c) => { console.log(`  ${c.pass ? 'PASS' : 'FAIL'} ${c.name} — ${c.detail}`); if (!c.pass) allPass = false; });
    console.log('');
  }
  return allPass;
}

if (require.main === module) {
  const results = run();
  const ok = report(results);
  process.exit(ok ? 0 : 1);
}

module.exports = { run, report, runForArchetype, SEED_COUNT, BEST_PATH_MIN, RANDOM_MIN, RANDOM_MAX, CHOICE_MATTERS_MIN };
