'use strict';
// GEN-001 2.5단계 — 밸런스 점검 스크립트. ARCH_CRIMINAL_ASSAULT × seed 1~300으로 두 시나리오를 끝까지
// 플레이하고 다음을 확인한다:
//   (a) 준비 없이 진행 시 무죄 0건
//   (b) 모든 준비 후 무죄가 30~70% 사이
// 실행: `node generator/balance.js` (courtroom-prototype/ 안에서). 통과하면 exit 0, 실패하면 exit 1로
// 결과를 stdout에 표로 출력한다. node:test가 아니다 — repo의 tests/ui-budget.js와 같은 plain 스크립트 관례.

const archetype = require('./core/archetype.criminal.example.js');
const { buildContestedCase } = require('./core/contested.js');
const { playThrough } = require('./core/playthrough.js');

const SEED_COUNT = 300;
const FULL_PREP_MIN = 0.30;
const FULL_PREP_MAX = 0.70;

function run() {
  let noPrepGuilty = 0, noPrepNotGuilty = 0;
  let fullPrepGuilty = 0, fullPrepNotGuilty = 0;
  const noPrepAcquittals = [];
  const errors = [];

  for (let seed = 1; seed <= SEED_COUNT; seed++) {
    const caseDef = buildContestedCase(archetype, seed, []);
    try {
      const noPrep = playThrough(caseDef, { fullPrep: false });
      if (noPrep.outcome === 'not_guilty') { noPrepNotGuilty++; noPrepAcquittals.push(seed); } else noPrepGuilty++;
    } catch (e) {
      errors.push(`seed ${seed} (no prep): ${e.message}`);
    }
    try {
      const fullPrep = playThrough(caseDef, { fullPrep: true });
      if (fullPrep.outcome === 'not_guilty') fullPrepNotGuilty++; else fullPrepGuilty++;
    } catch (e) {
      errors.push(`seed ${seed} (full prep): ${e.message}`);
    }
  }

  const fullPrepTotal = fullPrepGuilty + fullPrepNotGuilty;
  const fullPrepRate = fullPrepTotal ? fullPrepNotGuilty / fullPrepTotal : NaN;

  const checks = [
    { name: '(a) 준비 없이 진행 시 무죄 0건', pass: errors.length === 0 && noPrepNotGuilty === 0, detail: `무죄 ${noPrepNotGuilty}건 / ${SEED_COUNT}건${noPrepAcquittals.length ? ` (seed: ${noPrepAcquittals.slice(0, 10).join(', ')}${noPrepAcquittals.length > 10 ? ' ...' : ''})` : ''}` },
    { name: `(b) 모든 준비 후 무죄 30~70%`, pass: errors.length === 0 && fullPrepRate >= FULL_PREP_MIN && fullPrepRate <= FULL_PREP_MAX, detail: `무죄 ${fullPrepNotGuilty}/${fullPrepTotal}건 = ${(fullPrepRate * 100).toFixed(1)}%` }
  ];

  return { checks, errors, seedCount: SEED_COUNT, noPrepGuilty, noPrepNotGuilty, fullPrepGuilty, fullPrepNotGuilty, fullPrepRate };
}

function report(result) {
  console.log(`GEN-001 밸런스 점검 — ${result.seedCount}시드, ${archetype.id}`);
  console.log(`  준비 없이: 유죄 ${result.noPrepGuilty} / 무죄 ${result.noPrepNotGuilty}`);
  console.log(`  모든 준비: 유죄 ${result.fullPrepGuilty} / 무죄 ${result.fullPrepNotGuilty} (무죄율 ${(result.fullPrepRate * 100).toFixed(1)}%)`);
  if (result.errors.length) {
    console.log(`  오류 ${result.errors.length}건:`);
    result.errors.slice(0, 10).forEach((e) => console.log(`    - ${e}`));
    if (result.errors.length > 10) console.log(`    ... 외 ${result.errors.length - 10}건`);
  }
  result.checks.forEach((c) => console.log(`  ${c.pass ? 'PASS' : 'FAIL'} ${c.name} — ${c.detail}`));
  return result.checks.every((c) => c.pass);
}

if (require.main === module) {
  const result = run();
  const ok = report(result);
  process.exit(ok ? 0 : 1);
}

module.exports = { run, report, SEED_COUNT, FULL_PREP_MIN, FULL_PREP_MAX };
