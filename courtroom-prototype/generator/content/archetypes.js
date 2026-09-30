'use strict';

// 실험용 authored 규칙, DEC 아님. 수치·사실 범위는 RULES.md 참조.
const assault = structuredClone(require('../core/archetype.criminal.example.js'));
assault.twists_allowed = [
  'TWIST_WITNESS_CONFLICT_OF_INTEREST', 'TWIST_MEDIA_ATTENTION',
  'TWIST_LATE_DECISIVE_DOCUMENT', 'TWIST_CLIENT_HIDES_CONTACT'
];
Object.assign(assault.truth_params, {
  witness_interest: [0, 1], media_contamination: [0, 1],
  prior_injury_record: [0, 1], hidden_contact: [0, 1]
});

const dui = {
  id: 'ARCH_DUI', title: '음주운전', field: 'dui', side: '피고인',
  fee: { retainer: [150, 350], success_pct: [0, 0] },
  duration_weeks: [4, 12], claim_amount: [0, 0],
  issues: [
    { id: 'ISSUE_DRIVER', question: '이동 중 차량을 운전한 사람이 피고인인가?', evidence: ['정차 직후 관찰 기록', '주차장 영상'] },
    { id: 'ISSUE_INTOXICATION', question: '운전 당시의 음주 상태가 제출된 자료로 입증되는가?', evidence: ['음주 측정 기록', '운전·측정 시각 대조표'] }
  ],
  defenses: ['정차 후 운전석에 앉은 경위', '운전 장면의 식별 한계', '측정 시점과 운전 시점의 구분'],
  twists_allowed: ['TWIST_DUI_MEASUREMENT_GAP', 'TWIST_DUI_DRIVER_REVISION', 'TWIST_DUI_DEVICE_LOG'],
  truth_params: {
    driver_observation: [0, 1], measurement_connection: [0, 1],
    measurement_delay: [0, 1], driver_revision: [0, 1], device_log_gap: [0, 1]
  },
  evidence_strength_rules: [
    { issueId: 'ISSUE_DRIVER', truthParam: 'driver_observation', direction: 'direct', strengthRange: [3, 7], noise: 1 },
    { issueId: 'ISSUE_INTOXICATION', truthParam: 'measurement_connection', direction: 'direct', strengthRange: [3, 7], noise: 1 }
  ]
};

module.exports = { ARCH_CRIMINAL_ASSAULT: assault, ARCH_DUI: dui };
