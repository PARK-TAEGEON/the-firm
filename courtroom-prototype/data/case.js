(function (root) {
  'use strict';
  const caseDefinition = {
    id: 'CASE_B_WAREHOUSE', title: '22시 14분, B동 창고',
    resolutionNotice: '사건 전용 시연 판정 · 유무죄와 고의는 판단하지 않습니다.',
    client: { id: 'CLIENT_KDY', name: '김도윤' },
    parties: [{ id: 'PARTY_STATE', role: 'claimant' }, { id: 'PARTY_CLIENT', role: 'respondent' }],
    clientObjectives: { primary: '무죄 판결', secondary: ['평판 피해 최소화'], constraints: ['협상 조건 미설정'] },
    profile: {
      id: 'CRIMINAL_TRIAL', roles: { claimant: '검사', respondent: '변호인', factFinder: '재판장' },
      phases: { plan: '반대신문 준비', examine: '서지훈 반대신문', resolved: '신문 종료' },
      actions: ['establish', 'select', 'press', 'frame', 'stop', 'strategy', 'counter'],
      resolutionTypes: ['adjudicated', 'negotiated']
    },
    issues: [{ id: 'IDENTITY', title: '식별', question: '목격자가 공격자를 정확히 식별했는가?' }, { id: 'INTENT', title: '고의', question: '고의적인 공격이었는가? 이번 신문의 판단 범위 밖입니다.' }],
    facts: ['범행 추정 시각 22:14', 'B동 출입 22:08–22:17', '목격 장소: 야외 흡연구역'],
    theories: [
      { id: 'THEORY_IDENTITY', title: '현장에 있었지만 범인은 아니다', claims: ['공격자 특정에 의문이 있다'], concessions: ['B동에 있었다'], contestedIssues: ['IDENTITY'], preferredPlans: ['PLAN_IDENTIFICATION'], conflictTags: ['counter'], workingStrategy: '목격자의 식별 신빙성 약화', relevance: '핵심 전략 · 식별 쟁점을 직접 다툽니다.' },
      { id: 'THEORY_INTENT', title: '접촉은 있었지만 고의는 없었다', claims: ['고의적인 공격은 아니었다'], concessions: ['피해자와 접촉했다'], contestedIssues: ['INTENT'], preferredPlans: [], conflictTags: [], workingStrategy: '고의 쟁점 중심 · 식별 조건은 보조적으로 확인', relevance: '보조 전략 · 식별 의문만으로 고의가 부정되지는 않습니다.' }
    ],
    witnesses: [{ id: 'WITNESS_SJH', name: '서지훈', initialObservation: '자세를 바로잡고 질문을 기다립니다.' }],
    evidence: [{ id: 'E_INITIAL_STATEMENT', title: '최초 경찰 진술서', text: '“어두워서 얼굴은 정확히 못 봤지만, 체격과 걸음걸이가 김도윤 씨 같았다.” 법정에서는 김도윤이었다고 확신한다고 진술합니다.' }],
    propositions: [
      { id: 'P_DISTANCE_27M', short: '27m', text: '증인과 출입구 사이 거리는 약 27m였다.', tags: ['observation'], side: 'support' },
      { id: 'P_LIGHTING_POOR', short: '조명 제한', text: '출입구 조명 일부가 꺼져 있었다.', tags: ['observation', 'lighting'], side: 'support' },
      { id: 'P_OBSERVATION_SHORT', short: '1–2초', text: '인물을 관찰한 시간은 약 1–2초였다.', tags: ['observation'], side: 'support' },
      { id: 'P_INITIAL_UNCERTAIN', short: '최초 불확실', text: '최초 진술에서는 김도윤임을 확신하지 못했다.', tags: ['uncertain'], side: 'support' },
      { id: 'P_IDENTIFICATION_LIMIT', short: '식별 한계 인정', text: '증인은 당시 조건에서 얼굴 식별을 단정하기 어렵다고 인정했다.', tags: ['concession'], side: 'support' },
      { id: 'P_SIGN_LIGHT', short: '간판 불빛', text: '증인은 간판 불빛이 얼굴을 비췄다고 추가 설명했다.', tags: ['counter'], side: 'counter' },
      { id: 'P_FAMILIARITY', short: '6년 근무', text: '증인은 김도윤과 6년간 함께 일했다고 설명했다.', tags: ['counter'], side: 'counter' },
      { id: 'P_FAMILIARITY_LIMIT', short: '친분의 한계', text: '증인은 6년간 알고 지냈어도 사건 직후에는 식별을 확신하지 못했다고 인정했다.', tags: ['qualification'], side: 'support', qualifies: 'P_FAMILIARITY' }
    ],
    goals: [
      { id: 'G_DISTANCE', title: '거리', hint: '관찰 위치를 구체화', question: '흡연구역에서 창고 출입구까지, 약 27미터였지요?', basis: [], response: 'R_DISTANCE' },
      { id: 'G_LIGHTING', title: '조명', hint: '야간 시야를 확인', question: '그날 출입구 위 조명 하나는 꺼져 있었습니까?', basis: [], response: 'R_LIGHTING' },
      { id: 'G_DURATION', title: '관찰 시간', hint: '얼굴을 본 시간을 확인', question: '그 사람의 얼굴을 본 시간은 얼마나 됐습니까?', basis: [], response: 'R_DURATION' },
      { id: 'G_INITIAL', title: '최초 진술', hint: '진술서를 제시해 대조', question: '최초 진술서를 제시합니다. 당시에는 “김도윤 씨 같았다”고 진술했지요?', basis: ['E_INITIAL_STATEMENT'], response: 'R_INITIAL' }
    ],
    responses: [
      { id: 'R_DISTANCE', type: 'ADMIT', text: '네. 그 정도 거리는 됐을 겁니다.', adds: ['P_DISTANCE_27M'] },
      { id: 'R_LIGHTING', type: 'ADMIT', text: '네, 한쪽은 꺼져 있었습니다. 사람 형태는 보였습니다.', adds: ['P_LIGHTING_POOR'] },
      { id: 'R_DURATION', type: 'ADMIT', text: '길지는 않았습니다. 1~2초쯤이었던 것 같습니다.', adds: ['P_OBSERVATION_SHORT'] },
      { id: 'R_INITIAL', type: 'ADMIT', text: '그렇게 말했습니다. 그때는 확신까지는 못 했습니다.', adds: ['P_INITIAL_UNCERTAIN'] },
      { id: 'R_CONCEDE', type: 'ADMIT', text: '그 조건에서 얼굴을 확실히 봤다고 단정하기는 어렵겠네요.', adds: ['P_IDENTIFICATION_LIMIT'], observation: '잠시 시선을 내리고, 답변이 짧아집니다.' },
      { id: 'R_SIGN', type: 'EXPLAIN', text: '그래도 간판 불빛이 얼굴 정면을 비췄습니다. 그 순간은 보였습니다.', adds: ['P_SIGN_LIGHT'], observation: '몸을 앞으로 기울이며 설명을 덧붙입니다.' },
      { id: 'R_FAMILIAR', type: 'EXPLAIN', text: '저는 김도윤 씨와 6년을 함께 일했습니다. 낯선 사람을 본 게 아닙니다.', adds: ['P_FAMILIARITY'], observation: '목소리에 힘을 주며 익숙한 사이임을 강조합니다.' },
      { id: 'R_RESIST', type: 'RESIST', text: '말씀하신 조건은 맞습니다. 하지만 제 생각은 여전히 같습니다.', adds: [], observation: '같은 입장을 짧게 반복합니다.' },
      { id: 'R_FAMILIAR_LIMIT', type: 'ADMIT', text: '네. 오래 알고 지냈지만 그날 처음 진술할 때는 확신하지 못했습니다. 친분만으로 그 순간을 단정할 수는 없겠지요.', adds: ['P_FAMILIARITY_LIMIT'], observation: '친분과 당시 관찰을 구분하며 답합니다.' }
    ],
    counterResponses: [{ id: 'COUNTER_INITIAL', target: 'P_FAMILIARITY', requires: ['P_INITIAL_UNCERTAIN'], response: 'R_FAMILIAR_LIMIT', title: '최초 진술과 대조', hint: '친분이 당시 식별의 확신까지 보장했는지 확인합니다.', question: '6년간 알고 지냈는데도 최초 진술에서는 확신하지 못했지요. 친분이 그날의 식별까지 보장하는 것은 아니지 않습니까?' }],
    argumentPlans: [{ id: 'PLAN_IDENTIFICATION', issue: 'IDENTITY', title: '식별 정확성에 의문', goal: '목격자의 식별 신빙성 약화',
      premises: ['P_DISTANCE_27M', 'P_LIGHTING_POOR', 'P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN'], min: 2, max: 4,
      question: '지금 확인한 조건에서, 정말 김도윤 씨의 얼굴을 확실히 식별했다고 말씀하실 수 있습니까?',
      statement: '확보한 관찰 조건과 진술을 근거로, 목격 식별의 정확성에 의문을 제기합니다.',
      responseRules: [
        { when: { repeated: true, absent: ['P_FAMILIARITY'] }, response: 'R_FAMILIAR' },
        { when: { repeated: true }, response: 'R_RESIST' },
        { when: { selectedTags: { uncertain: 1, observation: 2 } }, response: 'R_CONCEDE' },
        { when: { selectedTags: { lighting: 1 }, absent: ['P_INITIAL_UNCERTAIN', 'P_SIGN_LIGHT'] }, response: 'R_SIGN' },
        { when: {}, response: 'R_RESIST' }
      ]
    }],
    resolutionRules: [
      { when: { recordTags: { concession: 1 }, absentTags: ['counter'] }, code: 'WITNESS_ADMISSION', title: '증인의 인정으로 식별 확신이 약화되었습니다', text: '증인이 직접 식별의 한계를 인정했습니다. 단순 전제 확보나 변호인의 주장보다 강한 증언 근거입니다.' },
      { when: { any: [{ recordTags: { observation: 2 } }, { recordTags: { uncertain: 1 } }], recordTags: { counter: 1 } }, code: 'CONFLICTING', title: '상반된 식별 근거가 남았습니다', text: '관찰의 한계와 증인의 추가 설명을 함께 기록했습니다. 어느 쪽도 자동으로 소거되지 않습니다.' },
      { when: { framed: true, absentTags: ['counter'] }, code: 'WEAKENED', title: '식별 의문을 논증으로 구축했습니다', text: '전제들을 식별 쟁점에 연결한 공개 논증이 남았습니다. 향후 변론에 재사용할 수 있지만 증인의 인정은 아닙니다.' },
      { when: { any: [{ recordTags: { observation: 2 } }, { recordTags: { uncertain: 1 } }] }, code: 'DOUBT_RECORDED', title: '식별 관련 전제를 안전하게 보존했습니다', text: '사실 자료는 확보했습니다. 명시적 논증이나 증인의 추가 인정은 이 전제만으로 생성되지 않습니다.' },
      { when: {}, code: 'INSUFFICIENT', title: '식별 판단 자료가 부족합니다', text: '확보된 기록만으로는 이 쟁점의 판단을 닫기 어렵습니다. 상대 주장을 인정한 것은 아닙니다.' }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = caseDefinition;
  else root.FirmCase = caseDefinition;
})(globalThis);
