(function (root) {
'use strict';
// GEN-001 원형 예시 1개 — 임대차 보증금 반환.
// generator/core/format.js의 Archetype 형식을 따른다. docs/DESIGN-NOTES-2026-09.md §1.7의
// yaml 예시를 그 형식으로 옮기고 issues[].question을 추가했다.
// twists_allowed의 TWIST_* 모듈은 아직 정의되지 않았다 — content 단계(Codex)에서 채운다.
// 이 파일은 예시/기준이며, 실제 콘텐츠는 courtroom-prototype/generator/content/에 들어간다.

const archetypeExample = {
  id: 'ARCH_LEASE_DEPOSIT',
  title: '임대차 보증금 반환',
  field: 'lease_deposit',
  side: '원고(임차인)',
  fee: { retainer: [200, 500], success_pct: [10, 20] }, // 만원, %
  duration_weeks: [8, 20],
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
    damage_by_tenant: [0, 1],   // 실제 파손 중 임차인 책임 비율
    landlord_solvent: [0.6, 1]  // 임대인의 실제 지급 능력
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = archetypeExample; else root.FirmArchetypeExample = archetypeExample;
})(typeof globalThis !== 'undefined' ? globalThis : this);
