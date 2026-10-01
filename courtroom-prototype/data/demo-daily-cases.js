(function (root) {
'use strict';
// DEMO-001 시작 화면의 일상 사건 요약. authored data only. GEN-001의 일상 사건 원형(임대차·절도)과 §1.9 전망 3단계 문구를 따른다.
// 데모에서는 요약만 보여 준다. 자동 진행은 구현하지 않았다(§1.9 후속).
const dailyCases = [
  { id: 'DAILY_DEPOSIT_RETURN', kind: 'daily', title: '원룸 보증금 반환', area: '임대차 · 민사',
    summary: '퇴거한 세입자가 보증금 일부를 돌려받지 못했다. 집주인은 벽지·바닥 수리비를 공제했다고 한다. 입주 사진과 퇴거 확인서가 남아 있다.',
    forecast: '정석대로 갈 것 같다',
    forecastWhy: '입주·퇴거 사진이 모두 있어 다툴 범위가 좁습니다. 공제 항목별 견적만 확인하면 됩니다.' },
  { id: 'DAILY_LOCKER_SWAP', kind: 'daily', title: '공용 보관대의 바뀐 물건', area: '절도 · 형사',
    summary: '공용 보관대에서 비슷한 물건 두 개가 바뀌었다. 의뢰인은 자기 물건인 줄 알았다고 한다. 영상에는 교체 순간이 사람에게 가려져 있다.',
    forecast: '변수가 있다',
    forecastWhy: '물건의 표식과 반출 허락 메시지를 아직 확인하지 않았습니다. 확인 전에는 어느 쪽으로 기울지 단정하기 어렵습니다.' }
];
if (typeof module !== 'undefined' && module.exports) module.exports = dailyCases; else root.FirmDemoDailyCases = dailyCases;
})(typeof globalThis !== 'undefined' ? globalThis : this);
