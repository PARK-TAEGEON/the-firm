(function (root) {
'use strict';
// GEN-001 — 원형 + 시드 → 일상 사건(DailyCaseSummary) 1개.
// 형식은 generator/core/format.js의 DailyCaseSummary를 따른다.
// 승부 사건(ContestedCaseOutput)은 generator/core/contested.js가 담당한다 (TwistModule 필요).

const rngModule = (typeof module !== 'undefined' && module.exports) ? require('./rng.js') : root.FirmGeneratorRng;
const { createRng, randRange, seedFor } = rngModule;
const formatModule = (typeof module !== 'undefined' && module.exports) ? require('./format.js') : root.FirmGeneratorFormat;
const { computeBaseStrength, clamp } = formatModule;

// 숨은 진실 파라미터 확정값. §1.4 "진실을 먼저 만든다" — 이후 증거/카드/문구는 전부 이 값에서 도출한다.
function resolveTruth(archetype, rng) {
  const truth = {};
  for (const key of Object.keys(archetype.truth_params)) {
    truth[key] = Number(randRange(rng, archetype.truth_params[key], false).toFixed(2));
  }
  return truth;
}

// truth → 쟁점별 증거 강도. base는 순수 계산(computeBaseStrength), 잡음은 seed 기반 rng로 더한다
// (§1.4 "잡음 필터를 거친다"). 같은 rng 스트림을 공유하므로 같은 seed면 항상 같은 값이 나온다.
function deriveIssueStrengths(archetype, truth, rng) {
  const strengths = {};
  for (const rule of archetype.evidence_strength_rules) {
    const base = computeBaseStrength(rule, truth[rule.truthParam]);
    const noiseSample = (rng() * 2 - 1) * rule.noise;
    const [min, max] = rule.strengthRange;
    strengths[rule.issueId] = Math.round(clamp(base + noiseSample, min, max));
  }
  return strengths;
}

function generateDailyCase(archetype, seed) {
  // 항목 6: 원형별 RNG 스트림 분리 — seed 그대로가 아니라 seedFor(seed, archetype.id)를 쓴다.
  const rng = createRng(seedFor(seed, archetype.id));
  const retainer = randRange(rng, archetype.fee.retainer, true);
  const successPct = randRange(rng, archetype.fee.success_pct, true);
  const durationWeeks = randRange(rng, archetype.duration_weeks, true);
  const claimAmount = randRange(rng, archetype.claim_amount, true);
  const truth = resolveTruth(archetype, rng);
  const issueStrengths = deriveIssueStrengths(archetype, truth, rng);

  return {
    id: `${archetype.id}_${seed}`,
    archetypeId: archetype.id,
    seed,
    title: archetype.title,
    fee: { retainer, success_pct: successPct },
    durationWeeks,
    claimAmount,
    // truth/issueStrengths: §1.4 검증용 디버그 노출. format.js DailyCaseSummary typedef에는 아직
    // 없다 — content 단계에서 증거/문구 도출에 쓰일 값.
    truth,
    issueStrengths,
    outcomeSummary: `${archetype.title} — 보증금 ${claimAmount}만원대(착수금 ${retainer}만원 별도), 쟁점 ${archetype.issues.length}개. (문구는 content 단계 authored 텍스트로 대체 예정)`
  };
}

const generateModule = { generateDailyCase, resolveTruth, deriveIssueStrengths };
if (typeof module !== 'undefined' && module.exports) module.exports = generateModule; else root.FirmGeneratorGenerate = generateModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
