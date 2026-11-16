(function (root) {
'use strict';
// GEN-001 반전 예시 1개 — 의뢰인이 사실을 숨김 (DESIGN-NOTES §1.3 반전 목록의 첫 항목).
// generator/core/format.js의 TwistModule 형식을 따른다. archetype.example.js(ARCH_LEASE_DEPOSIT)에 붙는다.
// 이 파일은 예시/기준이며, 실제 반전 5개 콘텐츠는 courtroom-prototype/generator/content/에 들어간다.
//
// 진실 (§1.4, 진실을 먼저 만든다): 의뢰인은 반려동물로 인한 바닥 파손이 있었는데도 최초 상담에서
// "파손 없다"고 말했다. damage_by_tenant가 높을 때만(activation) 이 반전이 성립한다 — 파손이 거의
// 없는 사건(damage_by_tenant 낮음)에서는 숨길 사실 자체가 없으므로 이 반전이 붙지 않는다.
// 의뢰인은 파손 자체는 인정하되, 임대인이 청구한 공제액(전체 재시공)까지는 인정하지 않는다 — 그래서
// 재반대는 "파손 부인"이 아니라 "공제 범위 다툼"이다. 상대의 수습과 모순되지 않는다.

const twistExample = {
  id: 'TWIST_CLIENT_HIDES_DAMAGE',
  title: '의뢰인이 파손 사실을 숨김',
  appliesTo: ['ARCH_LEASE_DEPOSIT'],
  targetIssue: 'DEDUCTION',
  activation: { param: 'damage_by_tenant', op: '>=', value: 0.6 },
  truthEffect: '의뢰인은 최초 상담에서 파손이 없었다고 말했지만, 실제로는 반려동물로 인한 바닥 파손이 있었다. 다만 의뢰인은 파손 자체는 인정해도 임대인이 청구한 전체 재시공비까지는 동의하지 않는다.',
  investigationCard: {
    investigationId: 'INV_CLIENT_REINTERVIEW',
    investigationTitle: '의뢰인 재면담',
    cost: 1,
    cardId: 'CARD_CLIENT_DAMAGE_ADMIT',
    cardTitle: '의뢰인의 뒤늦은 인정',
    cardText: '재면담에서 의뢰인은 반려동물로 인한 바닥 파손이 있었다고 인정했다. 다만 바닥 전체 재시공에는 동의하지 않았다 — 파손은 일부 구역에 한정됐다고 말한다.'
  },
  opponentRecovery: {
    text: '임대인은 입주 당시 사진과 퇴거 후 사진을 대조하며 바닥 전체 재시공이 불가피했다고 주장한다.',
    effect: { issue: 'DEDUCTION', delta: 2 }
  },
  playerCounter: {
    text: '재반대신문입니다. 의뢰인은 파손 사실 자체는 인정합니다. 다만 파손은 일부 구역에 한정됐습니다. 전체 재시공이 필요하다는 근거가 있습니까?',
    effect: { issue: 'DEDUCTION', delta: -3 }
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = twistExample; else root.FirmTwistExample = twistExample;
})(typeof globalThis !== 'undefined' ? globalThis : this);
