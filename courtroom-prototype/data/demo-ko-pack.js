(function (root) {
'use strict';
// DEMO-001 `ko` legal-system pack (DEC-032). Korean rule values, names and article labels live here, not in services.
// 실험용 authored 데이터, DEC 아님. 조문 확인 상태는 각 항목의 `verified`에 남긴다.
//   'checked-2026-09-30' = DEMO-DESIGN §6에서 국가법령정보센터 원문을 열람해 확인한 범위
//   'unverified'         = [확인 필요] — 원문·판례 대조 전. 출시 전 법률 검수 필요
const koPack = {
  id: 'ko',
  version: 'demo-0.1.0',
  label: '한국을 닮은 가상의 법 세계',

  presentation: { opening: '모두진술', openingLegacy: '개회사', witnessCall: '검사 측 증인, 증인석으로 나와 주십시오.' },

  // 죄명. victimWillBar = 피해자가 처벌을 원하지 않으면 공소를 제기할 수 없는 죄(반의사불벌).
  offenses: {
    injury: { label: '상해', article: '형법 제257조 제1항', victimWillBar: false,
      verified: 'checked-2026-09-30',
      note: '반의사불벌죄가 아니다. 처벌불원은 양형 사유로만 쓴다.' },
    assault: { label: '폭행', article: '형법 제260조 제1항', victimWillBar: true, barArticle: '형법 제260조 제3항',
      verified: 'checked-2026-09-30',
      note: '반의사불벌죄. 처벌불원 의사가 선고 전에 표시되면 공소기각.' }
  },

  // 축소사실: 기소된 죄의 사실 중 일부만 인정될 때 그 안에 포함된 죄로 판단한다.
  // [확인 필요] 상해 공소사실 중 폭행만 인정되고 처벌불원이 있을 때 공소장 변경 없이 공소기각하는 실무·판례의 현행 원문 대조.
  lesserIncluded: { injury: 'assault', verified: 'unverified' },

  judgments: {
    acquittal: { label: '무죄', pronouncement: '주문. 피고인은 무죄.', article: '형사소송법 제325조', verified: 'unverified' },
    dismissal: { label: '공소기각', pronouncement: '주문. 이 사건 공소를 기각한다.', article: '형사소송법 제327조 제6호', verified: 'checked-2026-09-30' },
    conviction: { label: '유죄' }
  },

  // 처벌불원 의사표시의 마감. [확인 필요] 제232조 링크가 2027-12-31 시행 예정본으로 열려 2026-09-30 적용본 대조가 남았다.
  victimWill: {
    deadline: 'first_instance_verdict',
    deadlineLabel: '제1심 판결 선고 전',
    article: '형사소송법 제232조 제1항·제3항',
    verified: 'unverified',
    documentLabel: '처벌불원서'
  },

  // 양형: 실험용 단순 규칙 표(초범 전제). 실제 양형기준이 아니다.
  // 법정형 범위(상해: 7년 이하 징역 또는 1천만 원 이하 벌금 / 폭행: 2년 이하 징역 또는 500만 원 이하 벌금)와
  // 집행유예 요건(3년 이하 징역, 유예기간 1~5년, 형법 제62조 제1항) 안에서 고른 값이다. [확인 필요] 양형위원회 기준과의 차이.
  sentencing: {
    disclaimer: '실험용 단순화 — 실제 양형기준 아님',
    premise: '초범 전제',
    verified: 'unverified',
    table: [
      { offense: 'injury', victimWill: true, sentence: 'fine', text: '벌금 300만 원', pronouncement: '주문. 피고인을 벌금 300만 원에 처한다.', reason: '처벌불원서가 제출되어 피해 회복과 피해자 의사를 고려했다.' },
      { offense: 'injury', victimWill: false, sentence: 'suspended', text: '징역 6월에 집행유예 1년', pronouncement: '주문. 피고인을 징역 6월에 처한다. 다만, 이 판결 확정일부터 1년간 위 형의 집행을 유예한다.', reason: '초범이지만 피해 회복이 확인되지 않았다.' },
      { offense: 'assault', victimWill: false, sentence: 'fine', text: '벌금 100만 원', pronouncement: '주문. 피고인을 벌금 100만 원에 처한다.', reason: '초범이고 상해와의 연결은 인정되지 않았다.' }
    ],
    labels: { fine: '벌금', suspended: '징역 집행유예' },
    unassessed: '양형 미산정'
  }
};
if (typeof module !== 'undefined' && module.exports) module.exports = koPack; else root.FirmDemoKoPack = koPack;
})(typeof globalThis !== 'undefined' ? globalThis : this);
