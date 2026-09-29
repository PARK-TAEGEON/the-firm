(function (root) {
'use strict';
// GEN-001 — 원형 + 시드 → 일상 사건(DailyCaseSummary) 1개.
// 형식은 generator/core/format.js의 DailyCaseSummary를 따른다.
// 승부 사건(ContestedCaseOutput)은 TwistModule 콘텐츠가 아직 없어 이 단계에서 구현하지 않는다.

const rngModule = (typeof module !== 'undefined' && module.exports) ? require('./rng.js') : root.FirmGeneratorRng;
const { createRng, randRange } = rngModule;

function generateDailyCase(archetype, seed) {
  const rng = createRng(seed);
  const retainer = randRange(rng, archetype.fee.retainer, true);
  const successPct = randRange(rng, archetype.fee.success_pct, true);
  const durationWeeks = randRange(rng, archetype.duration_weeks, true);

  // truth: 숨은 진실 파라미터 확정값. §1.4 "진실을 먼저 만든다"를 검증하기 위한 디버그 노출이며
  // format.js DailyCaseSummary typedef에는 아직 없다 — content 단계에서 증거/문구 도출에 쓰일 값.
  const truth = {};
  for (const key of Object.keys(archetype.truth_params)) {
    truth[key] = Number(randRange(rng, archetype.truth_params[key], false).toFixed(2));
  }

  return {
    id: `${archetype.id}_${seed}`,
    archetypeId: archetype.id,
    seed,
    title: archetype.title,
    fee: { retainer, success_pct: successPct },
    durationWeeks,
    truth,
    outcomeSummary: `${archetype.title} — 보증금 ${retainer}만원대, 쟁점 ${archetype.issues.length}개. (문구는 content 단계 authored 텍스트로 대체 예정)`
  };
}

const generateModule = { generateDailyCase };
if (typeof module !== 'undefined' && module.exports) module.exports = generateModule; else root.FirmGeneratorGenerate = generateModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
