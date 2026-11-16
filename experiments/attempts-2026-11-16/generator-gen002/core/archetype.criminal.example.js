(function (root) {
'use strict';
// GEN-001 2단계 원형 — 형사 폭행·상해. generator/core/format.js의 Archetype 형식을 따른다.
// GEN-001 2단계 사람 결정(REPORT.md): 이번 버전의 승부 사건(ContestedCaseOutput) 생성은 이 원형만
// 대상으로 한다. ARCH_LEASE_DEPOSIT은 일상 사건 출력만 유지한다.
//
// issues 2개: v0.10 trial-case.js(TRIAL_B_WAREHOUSE)의 IDENTITY/KNIFE 두 쟁점 구조를 따랐다.
// claim_amount: 이 원형에서는 청구금액(민사) 개념이 없어 "합의금 참고 구간"으로 재해석했다 — 실무상
// 합의 여부·금액이 양형에 영향을 주는 참고 수치이며, 판결 자체의 입증 로직에는 쓰지 않는다.

const archetypeExample = {
  id: 'ARCH_CRIMINAL_ASSAULT',
  title: '폭행치상',
  field: 'criminal_assault',
  side: '피고인',
  fee: { retainer: [150, 400], success_pct: [0, 0] }, // 만원. 형사 성공보수는 관례상 0 처리(합의·감형 별도 보수는 범위 밖).
  duration_weeks: [6, 16],
  claim_amount: [300, 1500], // 만원. 합의금 참고 구간 — 청구금액이 아니다(위 주석).
  issues: [
    {
      id: 'ISSUE_IDENTITY',
      question: '피고인이 실제로 피해자를 가격했는가?',
      evidence: ['목격 진술', 'CCTV 영상']
    },
    {
      id: 'ISSUE_CAUSATION',
      question: '피고인의 행위가 상해를 초래했는가, 정당방위였는가?',
      evidence: ['진단서', '현장 사진']
    }
  ],
  defenses: ['정당방위', '목격자 오인', '상해와 행위의 인과관계 부족'],
  // 아직 TwistModule로 구현되지 않은 후보 id — DESIGN-NOTES §1.3 반전 목록에서 형사에 맞는 것만 골랐다.
  // content 단계(Codex)에서 채운다.
  twists_allowed: ['TWIST_WITNESS_CONFLICT_OF_INTEREST', 'TWIST_MEDIA_ATTENTION', 'TWIST_LATE_DECISIVE_DOCUMENT'],
  truth_params: {
    eyewitness_reliability: [0, 1],  // 목격자가 실제로 정확히 봤는가 → ISSUE_IDENTITY 쟁점 강도
    self_defense_evidence: [0, 1]    // 정당방위를 뒷받침하는 객관적 정황이 얼마나 있는가 → ISSUE_CAUSATION 쟁점 강도
  },
  // 방향 규약(format.js EvidenceStrengthRule 참고): strength가 높을수록 side 반대편(검찰)에게 유리하다.
  // ISSUE_CAUSATION은 self_defense_evidence가 클수록 검찰에게 불리해야 하므로 inverse.
  evidence_strength_rules: [
    { issueId: 'ISSUE_IDENTITY', truthParam: 'eyewitness_reliability', direction: 'direct', strengthRange: [3, 7], noise: 1 },
    { issueId: 'ISSUE_CAUSATION', truthParam: 'self_defense_evidence', direction: 'inverse', strengthRange: [3, 7], noise: 1 }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = archetypeExample; else root.FirmArchetypeCriminalExample = archetypeExample;
})(typeof globalThis !== 'undefined' ? globalThis : this);
