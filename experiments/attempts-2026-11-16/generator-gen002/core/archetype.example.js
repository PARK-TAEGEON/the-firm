(function (root) {
'use strict';
// GEN-001 원형 예시 1개 — 임대차 보증금 반환.
// generator/core/format.js의 Archetype 형식을 따른다. docs/DESIGN-NOTES-2026-09.md §1.7의
// yaml 예시를 그 형식으로 옮기고 issues[].question, claim_amount, evidence_strength_rules를 더했다.
// truth_params에 notice_defective를 추가했다 — DESIGN-NOTES §1.7 원문에는 없던 값으로, 두 issue
// 모두 evidence_strength_rules에서 truth_param 근거를 갖게 하려는 GEN-001 1.5단계 요구로 추가했다
// (REPORT.md 참고). twists_allowed의 나머지 TWIST_* 모듈은 아직 정의되지 않았다 — content 단계(Codex)에서 채운다.
// 이 파일은 예시/기준이며, 실제 콘텐츠는 courtroom-prototype/generator/content/에 들어간다.
//
// GEN-001 2단계 사람 결정(REPORT.md): 이번 버전의 승부 사건 생성은 형사 원형(archetype.criminal.example.js)만
// 대상으로 한다. 이 원형은 일상 사건(DailyCaseSummary) 출력만 유지하고 buildContestedCase의 대상에서 뺐다.
// strengthRange는 [1,7] → [3,7]로 바꿨다(2단계 항목 2, doubt=2 구간에서 시작하지 않도록) — daily 출력의
// issueStrengths 디버그 필드에만 영향을 준다.

const archetypeExample = {
  id: 'ARCH_LEASE_DEPOSIT',
  title: '임대차 보증금 반환',
  field: 'lease_deposit',
  side: '원고(임차인)',
  fee: { retainer: [200, 500], success_pct: [10, 20] }, // 만원, %. 착수금 — claim_amount(보증금 원금)와 다르다.
  duration_weeks: [8, 20],
  claim_amount: [1000, 8000], // 만원. 청구금액(보증금 원금).
  issues: [
    {
      id: 'CONTRACT_END',
      question: '계약이 적법하게 종료됐는가?',
      evidence: ['계약서', '해지 통지 문자', '내용증명']
    },
    {
      id: 'DEDUCTION',
      question: '원상복구비 공제가 정당한가?',
      evidence: ['입주 당시 사진', '수리 견적서', '관리비 내역']
    }
  ],
  defenses: ['원상복구비 공제', '연체 차임 상계', '묵시적 갱신 주장'],
  twists_allowed: ['TWIST_CLIENT_HIDES_DAMAGE', 'TWIST_LANDLORD_BANKRUPT', 'TWIST_WITNESS_IS_BROKER_RELATIVE'],
  truth_params: {
    damage_by_tenant: [0, 1],    // 실제 파손 중 임차인 책임 비율 → DEDUCTION 쟁점 강도
    notice_defective: [0, 1],    // 해지 통지 절차 흠결 정도 → CONTRACT_END 쟁점 강도
    landlord_solvent: [0.6, 1]   // 임대인의 실제 지급 능력. 쟁점 강도에는 쓰지 않는다 (회수 가능성 등 후속 로직용, TBD)
  },
  // 방향 규약(format.js EvidenceStrengthRule 참고): strength가 높을수록 side 반대편(임대인)에게 유리하다.
  evidence_strength_rules: [
    { issueId: 'CONTRACT_END', truthParam: 'notice_defective', direction: 'direct', strengthRange: [3, 7], noise: 1 },
    { issueId: 'DEDUCTION', truthParam: 'damage_by_tenant', direction: 'direct', strengthRange: [3, 7], noise: 1 }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = archetypeExample; else root.FirmArchetypeExample = archetypeExample;
})(typeof globalThis !== 'undefined' ? globalThis : this);
