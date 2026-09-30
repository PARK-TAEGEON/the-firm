'use strict';
// GEN-001 3단계 — 밸런스 점검 스크립트. generator/content 진입점(content.buildContestedCase)으로
// content.archetypes의 모든 원형 × seed 1~300을 끝까지 플레이하고 원형별로 다음을 출력한다:
//   (a) 준비 없이 진행 시 무죄 0건
//   (b) 모든 준비 후 무죄가 40~65% 사이
//   (c) 반전이 1개 이상 붙는 시드 비율 (twistsApplied.length >= 1)
//   (d) 재반대(rebuttal) 발생 수 (모든 준비 시나리오에서 실제로 rebut(use:true)가 기록으로 남은 횟수)
// 실행: `node generator/balance.js` (courtroom-prototype/ 안에서). 통과하면 exit 0, 실패하면 exit 1로
// 결과를 stdout에 표로 출력한다. node:test가 아니다 — repo의 tests/ui-budget.js와 같은 plain 스크립트 관례.
// 이번 단계는 이 파일만 바꾼다 — generator/core/, generator/content/는 건드리지 않았다.

const content = require('./content');
const { playThrough } = require('./core/playthrough.js');

const SEED_COUNT = 300;
const FULL_PREP_MIN = 0.40;
const FULL_PREP_MAX = 0.65;

function runForArchetype(archetypeId) {
  let noPrepGuilty = 0, noPrepNotGuilty = 0;
  let fullPrepGuilty = 0, fullPrepNotGuilty = 0;
  let twistedSeeds = 0;
  let rebuttals = 0;
  const noPrepAcquittals = [];
  const errors = [];

  for (let seed = 1; seed <= SEED_COUNT; seed++) {
    let caseDef;
    try {
      caseDef = content.buildContestedCase(archetypeId, seed);
    } catch (e) {
      errors.push(`seed ${seed} (build): ${e.message}`);
      continue;
    }
    if ((caseDef.twistsApplied || []).length >= 1) twistedSeeds++;

    try {
      const noPrep = playThrough(caseDef, { fullPrep: false });
      if (noPrep.outcome === 'not_guilty') { noPrepNotGuilty++; noPrepAcquittals.push(seed); } else noPrepGuilty++;
    } catch (e) {
      errors.push(`seed ${seed} (no prep): ${e.message}`);
    }
    try {
      const fullPrep = playThrough(caseDef, { fullPrep: true });
      if (fullPrep.outcome === 'not_guilty') fullPrepNotGuilty++; else fullPrepGuilty++;
      rebuttals += fullPrep.view.records.filter((r) => r.kind === 'rebuttal').length;
    } catch (e) {
      errors.push(`seed ${seed} (full prep): ${e.message}`);
    }
  }

  const fullPrepTotal = fullPrepGuilty + fullPrepNotGuilty;
  const fullPrepRate = fullPrepTotal ? fullPrepNotGuilty / fullPrepTotal : NaN;
  const twistedRate = twistedSeeds / SEED_COUNT;

  const checks = [
    { name: '(a) 준비 없이 진행 시 무죄 0건', pass: errors.length === 0 && noPrepNotGuilty === 0, detail: `무죄 ${noPrepNotGuilty}건 / ${SEED_COUNT}건${noPrepAcquittals.length ? ` (seed: ${noPrepAcquittals.slice(0, 10).join(', ')}${noPrepAcquittals.length > 10 ? ' ...' : ''})` : ''}` },
    { name: `(b) 모든 준비 후 무죄 ${FULL_PREP_MIN * 100}~${FULL_PREP_MAX * 100}%`, pass: errors.length === 0 && fullPrepRate >= FULL_PREP_MIN && fullPrepRate <= FULL_PREP_MAX, detail: `무죄 ${fullPrepNotGuilty}/${fullPrepTotal}건 = ${(fullPrepRate * 100).toFixed(1)}%` }
  ];

  return {
    archetypeId, checks, errors, seedCount: SEED_COUNT,
    noPrepGuilty, noPrepNotGuilty, fullPrepGuilty, fullPrepNotGuilty, fullPrepRate,
    twistedSeeds, twistedRate, rebuttals
  };
}

function run() {
  return Object.keys(content.archetypes).map(runForArchetype);
}

function report(results) {
  let allPass = true;
  for (const result of results) {
    console.log(`GEN-001 밸런스 점검 — ${result.seedCount}시드, ${result.archetypeId}`);
    console.log(`  준비 없이: 유죄 ${result.noPrepGuilty} / 무죄 ${result.noPrepNotGuilty}`);
    console.log(`  모든 준비: 유죄 ${result.fullPrepGuilty} / 무죄 ${result.fullPrepNotGuilty} (무죄율 ${(result.fullPrepRate * 100).toFixed(1)}%)`);
    console.log(`  (c) 반전 1개 이상 붙는 시드 비율: ${result.twistedSeeds}/${result.seedCount} (${(result.twistedRate * 100).toFixed(1)}%)`);
    console.log(`  (d) 재반대(rebuttal) 발생 수(모든 준비 시나리오 합계): ${result.rebuttals}`);
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

module.exports = { run, report, runForArchetype, SEED_COUNT, FULL_PREP_MIN, FULL_PREP_MAX };
