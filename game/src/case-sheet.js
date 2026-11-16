(function (root) {
'use strict';
// PORTFOLIO-002 사건 시트: 정민호 사건을 "변론 계획서"로 보여 주기 위한 authored 데이터.
// 엔진·사건 정의(vendor/)는 그대로다. 여기에는 계획 보드가 쓰는 이름표와 연결표만 있다.
// 판정 수치는 하나도 없다. 실험용이며 DEC가 아니다(RULES.md P-규칙).

const SHEET = Object.freeze({
  caseId: 'jung',
  prosecutorId: 'novice',

  // 확인 항목: 공판 전 조사(investigation)를 초안의 "확인한 것" 줄로 보여 준다. 순서 = 초안이 고르는 우선순위.
  checks: [
    { id: 'INV_SIG_SEQUENCE', label: '연속 영상', line: '정지 사진 앞뒤의 영상을 이어서 봤다' },
    { id: 'INV_SIG_MEDICAL', label: '진료기록', line: '진단서 뒤 진료기록이 원인을 말하는지 봤다' },
    { id: 'INV_SIG_STATEMENT', label: '목격자 최초 진술', line: '한지수의 사건 직후 진술을 대조했다' },
    { id: 'INV_SIG_CLIENT', label: '의뢰인 재면담', line: '정민호에게 접촉 여부를 다시 물었다' },
    { id: 'INV_SIG_LAYOUT', label: '가림막 뒤 현장', line: '피해자가 넘어진 자리를 직접 살폈다' },
    { id: 'INV_SIG_SETTLE', label: '합의 상담', line: '피해자 측 제안을 의뢰인과 상의했다', settlement: true }
  ],

  // 검사의 예고: 공판에서 검사가 꺼낼 것과, 그것을 받아칠 자료.
  threats: [
    { id: 'T_PHOTO', text: '정지 사진에 밀리는 장면과 넘어진 자리가 이어집니다.', counter: 'INV_SIG_SEQUENCE', answer: '두 장면 사이 40초가 비어 있다' },
    { id: 'T_DIAG', text: '진단서는 사건 당일 발급됐습니다.', counter: 'INV_SIG_MEDICAL', answer: '상처 기록일 뿐 원인 감정은 아니다' },
    { id: 'T_REDIRECT', text: '그래도 사건 당일 손목을 다친 건 사실이지요?', counter: 'INV_SIG_LAYOUT', answer: '가림막 뒤 운반대, 다른 낙상 경로' }
  ],

  // 방침(개회사 입장)과 최후변론의 짝. 최후변론은 판정에 쓰이지 않으므로 계획에서 자동으로 정한다.
  stances: {
    S_SIG_CONTACT: { short: '밀침은 인정하고, 다쳤다는 연결을 다툰다', closing: 'FINAL_SIG_CAUSE' },
    S_SIG_RESERVE: { short: '접촉 경위는 기록으로 확인한다', closing: 'FINAL_SIG_CAUSE' },
    S_SIG_DENY: { short: '접촉한 적이 없다고 주장한다', closing: 'FINAL_SIG_ACQUIT' }
  },
  focus: {
    F_SIG_CAUSE: { short: '밀침과 낙상 사이' },
    F_SIG_ACT: { short: '목격자가 본 동작의 범위' },
    F_SIG_BALANCED: { short: '두 증인을 고르게' }
  },
  witnessGoal: {
    W_SIG_OBSERVER: '직접 본 것과 짐작한 것을 가른다',
    W_SIG_INVESTIGATOR: '밀침과 낙상 사이가 확인되지 않았음을 인정받는다'
  },
  advice: {
    ADV_SIG_REVISE: '상해 인정 문구를 빼면 받는다',
    ADV_SIG_AS_IS: '제안 그대로 받으라고 권한다',
    ADV_SIG_DECLINE: '받지 않고 판결로 간다'
  }
});

const api = { SHEET };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmCaseSheet = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
