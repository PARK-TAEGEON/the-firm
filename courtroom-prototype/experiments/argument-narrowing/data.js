(function (root) {
'use strict';
const data = {
  version: 'argument-narrowing-001/v1',
  strong: '손목 상해는 피고인의 밀침과 아무 관계가 없습니다.',
  narrow: '밀침과 손목 상해 사이의 연결이 충분히 입증되었는지 다툽니다.',
  overreachRef: 'P_SIG_CAUSE_OVER',
  injuryRef: 'D_SIG_INV_2',
  finalId: 'FINAL_NARROWING_CAUSE',
  retainId: 'FINAL_NARROWING_RETAIN',
  withdrawn: '상해와 밀침이 무관하다는 단정은 철회합니다.',
  reservation: '다른 원인을 확정하는 것도, 상해가 없었다고 주장하는 것도 아닙니다.',
  response: '주장을 좁혀도 밀침 뒤 상처가 확인된 기록은 남습니다. 자료의 한계만으로 연결이 부정되지는 않습니다.',
  limitedResponse: '자료의 한계가 있다는 주장과 밀침이 상해와 무관하다는 주장은 다릅니다. 범위를 좁힌 것만으로 입증 부족이 확인되는 것은 아닙니다.',
  rebuttalResponse: '다른 낙상 경로를 검토하지 못한 점은 남지만, 그 경로가 실제 원인으로 확정된 것은 아닙니다.',
  closingRequest: '이 한계가 남은 기록으로 상해와의 연결을 충분히 입증했는지 살펴 주십시오.',
  facts: [
    { kind: 'direct', ref: 'D_SIG_INV_2', text: '수사관이 사건 당일 손목 타박상 진단을 확인했다.' },
    { kind: 'direct', ref: 'D_SIG_OBS_2', text: '목격자가 피고인의 동작과 피해자가 밀리는 모습을 진술했다.' },
    { kind: 'evidence_opinion', ref: 'PX_SIG_MEDICAL', admitted: true, text: '동의한 진단서에 손목 타박상과 치료 소견이 기재되어 있다.' }
  ],
  bases: [
    { kind: 'approach', ref: 'A_SIG_CAUSE_MEDICAL', text: '진료기록은 상처 기록이며 원인 감정은 아니라는 답변' },
    { kind: 'approach', ref: 'A_SIG_CAUSE_SEQUENCE', text: '피해자가 다시 섰고 낙상은 화면 밖이라는 답변' },
    { kind: 'press', ref: 'P_SIG_CAUSE_LIMITED', success: true, text: '밀침과 낙상 사이 경위는 자료로 확인되지 않는다는 답변' },
    { kind: 'rebuttal', ref: 'RH_SIG_CAUSE', text: '운반대 쪽 다른 낙상 경로를 검토하지 못했다는 답변' }
  ],
  counters: [
    { id: 'COUNTER_NARROWING_INJURY', kind: 'direct', ref: 'D_SIG_INV_2', text: '상처의 존재와 발생 시점은 그대로 남는다.' },
    { id: 'COUNTER_NARROWING_OPINION', kind: 'objection', ruling: 'pass', ref: 'OBJ_SIG_INVESTIGATOR_VALID', text: '통과시킨 원인 의견: 수사관이 밀침 → 낙상 → 상해로 정리했다.' },
    { id: 'COUNTER_NARROWING_OBSERVER', kind: 'objection', ruling: 'pass', ref: 'OBJ_SIG_OBSERVER_VALID', text: '통과시킨 목격자 답변에 밀침과 낙상을 연결한 진술이 남는다.' },
    { id: 'COUNTER_NARROWING_REPORT', kind: 'evidence_opinion', admitted: true, ref: 'PX_SIG_REPORT', text: '동의한 수사보고서의 인과관계 정리는 그대로 남는다.' },
    { id: 'COUNTER_NARROWING_REDIRECT', kind: 'redirect', ref: 'RH_SIG_CAUSE', useMemo: true, qualificationRef: 'RH_SIG_CAUSE' },
    { id: 'COUNTER_NARROWING_OVERREACH', kind: 'press', ref: 'P_SIG_CAUSE_OVER', text: '수사관이 무관하다는 결론을 거부했다. 과욕 기록은 지워지지 않는다.' }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = data; else root.FirmNarrowingData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
