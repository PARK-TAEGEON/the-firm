(function (root) {
  'use strict';
  const caseDefinition = {
    id: 'CASE_B_WAREHOUSE', title: '22시 14분, B동 창고',
    caseProfile: { factualComplexity: 'low', legalComplexity: 'low', proceduralComplexity: 'low', adversarialIntensity: 'moderate' },
    resolutionNotice: '사건 전용 시연 판정 · 유무죄와 고의는 판단하지 않습니다.',
    client: { id: 'CLIENT_KDY', name: '김도윤' },
    parties: [{ id: 'PARTY_STATE', role: 'claimant' }, { id: 'PARTY_CLIENT', role: 'respondent' }],
    clientObjectives: { primary: '무죄 판결', secondary: ['평판 피해 최소화'], constraints: ['협상 조건 미설정'] },
    profile: {
      id: 'CRIMINAL_TRIAL', roles: { claimant: '검사', respondent: '변호인', factFinder: '재판장' },
      phases: { plan: '반대신문 준비', examine: '서지훈 반대신문', resolved: '신문 종료' },
      actions: ['establish', 'select', 'press', 'frame', 'stop', 'strategy', 'counter', 'respond', 'address', 'answer'],
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
      { id: 'P_SIGN_LIGHT', short: '간판 불빛', text: '증인은 간판 불빛이 얼굴을 비췄다고 추가 설명했다.', tags: ['counter'], side: 'counter', counterType: 'hard', counterNote: '현재 신문에서 제한할 현장 자료가 없습니다. 현장 사진이나 조도 자료가 더 필요합니다.' },
      { id: 'P_FAMILIARITY', short: '6년 근무', text: '증인은 김도윤과 6년간 함께 일했다고 설명했다.', tags: ['counter'], side: 'counter', counterType: 'contestable', counterNote: '최초 진술의 확신 수준과 대조할 수 있습니다.' },
      { id: 'P_FAMILIARITY_LIMIT', short: '친분의 한계', text: '증인은 6년간 알고 지냈어도 사건 직후에는 식별을 확신하지 못했다고 인정했다.', tags: ['qualification'], side: 'support', qualifies: 'P_FAMILIARITY' }
    ],
    goals: [
      { id: 'G_DISTANCE', title: '거리', hint: '관찰 위치를 구체화', informationType: 'favorable', question: '흡연구역에서 창고 출입구까지, 약 27미터였지요?', basis: [], response: 'R_DISTANCE' },
      { id: 'G_LIGHTING', title: '조명', hint: '야간 시야를 확인', informationType: 'favorable', question: '그날 출입구 위 조명 하나는 꺼져 있었습니까?', basis: [], response: 'R_LIGHTING' },
      { id: 'G_DURATION', title: '관찰 시간', hint: '얼굴을 본 시간을 확인', informationType: 'favorable', question: '그 사람의 얼굴을 본 시간은 얼마나 됐습니까?', basis: [], response: 'R_DURATION' },
      { id: 'G_INITIAL', title: '최초 진술', hint: '진술서를 제시해 대조', informationType: 'favorable', question: '최초 진술서를 제시합니다. 당시에는 “김도윤 씨 같았다”고 진술했지요?', basis: ['E_INITIAL_STATEMENT'], response: 'R_INITIAL' },
      { id: 'G_LIGHT_SOURCE', title: '주변 광원', hint: '얼굴을 비춘 빛을 구체화', informationType: 'mixed', question: '꺼진 조명 말고, 당시 인물의 얼굴을 비춘 다른 빛은 없었습니까?', basis: [], response: 'R_LIGHT_SOURCE', procedure: { foundationRefs: ['P_LIGHTING_POOR'], basisEvidence: ['E_INITIAL_STATEMENT'], narrowed: { question: '출입구 조명 하나가 꺼져 있었습니까?', response: 'R_LIGHTING' } } }
    ],
    responses: [
      { id: 'R_DISTANCE', type: 'ADMIT', text: '네. 그 정도 거리는 됐을 겁니다.', adds: ['P_DISTANCE_27M'] },
      { id: 'R_LIGHTING', type: 'ADMIT', text: '네, 한쪽은 꺼져 있었습니다. 사람 형태는 보였습니다.', adds: ['P_LIGHTING_POOR'] },
      { id: 'R_DURATION', type: 'ADMIT', text: '길지는 않았습니다. 1~2초쯤이었던 것 같습니다.', adds: ['P_OBSERVATION_SHORT'] },
      { id: 'R_INITIAL', type: 'ADMIT', text: '그렇게 말했습니다. 그때는 확신까지는 못 했습니다.', adds: ['P_INITIAL_UNCERTAIN'] },
      { id: 'R_LIGHT_SOURCE', type: 'EXPLAIN', text: '주변은 어두웠지만 창고 간판 불빛이 얼굴 쪽을 비추고 있었습니다.', adds: ['P_LIGHTING_POOR', 'P_SIGN_LIGHT'], observation: '간판의 위치를 떠올리며 시야가 확보됐다고 설명합니다.' },
      { id: 'R_CONCEDE', type: 'ADMIT', text: '그 조건에서 얼굴을 확실히 봤다고 단정하기는 어렵겠네요.', adds: ['P_IDENTIFICATION_LIMIT'], observation: '잠시 시선을 내리고, 답변이 짧아집니다.' },
      { id: 'R_SIGN', type: 'EXPLAIN', text: '그래도 간판 불빛이 얼굴 정면을 비췄습니다. 그 순간은 보였습니다.', adds: ['P_SIGN_LIGHT'], observation: '몸을 앞으로 기울이며 설명을 덧붙입니다.' },
      { id: 'R_FAMILIAR', type: 'EXPLAIN', text: '저는 김도윤 씨와 6년을 함께 일했습니다. 낯선 사람을 본 게 아닙니다.', adds: ['P_FAMILIARITY'], observation: '목소리에 힘을 주며 익숙한 사이임을 강조합니다.' },
      { id: 'R_RESIST', type: 'RESIST', text: '말씀하신 조건은 맞습니다. 하지만 제 생각은 여전히 같습니다.', adds: [], observation: '같은 입장을 짧게 반복합니다.' },
      { id: 'R_FAMILIAR_LIMIT', type: 'ADMIT', text: '네. 오래 알고 지냈지만 그날 처음 진술할 때는 확신하지 못했습니다. 친분만으로 그 순간을 단정할 수는 없겠지요.', adds: ['P_FAMILIARITY_LIMIT'], observation: '친분과 당시 관찰을 구분하며 답합니다.' }
    ],
    procedure: {
      judge: { proceduralStrictness: 'standard', tolerance: 'patient', advocacyLatitude: 'broad' },
      rules: [
        { id: 'PROC_REPETITION', kind: 'repetition', title: '반복 질문', objection: '이의 있습니다. 이미 답한 질문입니다.' },
        { id: 'PROC_FOUNDATION', kind: 'foundation', title: '근거 미확립', objection: '이의 있습니다. 조명에 관한 전제가 아직 확인되지 않았습니다.' },
        { id: 'PROC_FORM', kind: 'form', title: '결론을 요구하는 형식', objection: '이의 있습니다. 확인한 조건을 넘어 결론을 요구하고 있습니다.' }
      ],
      narrowedPress: { question: '방금 확인한 관찰 조건 자체는 맞습니까?', response: { type: 'ADMIT', text: '네. 그 조건들까지는 맞습니다.', adds: [] } }
    },
    counterResponses: [{ id: 'COUNTER_INITIAL', target: 'P_FAMILIARITY', requires: ['P_INITIAL_UNCERTAIN'], response: 'R_FAMILIAR_LIMIT', title: '최초 진술과 대조', hint: '친분이 당시 식별의 확신까지 보장했는지 확인합니다.', question: '6년간 알고 지냈는데도 최초 진술에서는 확신하지 못했지요. 친분이 그날의 식별까지 보장하는 것은 아니지 않습니까?' }],
    argumentPlans: [{ id: 'PLAN_IDENTIFICATION', issue: 'IDENTITY', title: '식별 정확성에 의문', goal: '목격자의 식별 신빙성 약화',
      premises: ['P_DISTANCE_27M', 'P_LIGHTING_POOR', 'P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN'], min: 2, max: 4,
      question: '지금 확인한 조건에서, 정말 김도윤 씨의 얼굴을 확실히 식별했다고 말씀하실 수 있습니까?',
      statement: '확보한 관찰 조건과 진술을 근거로, 목격 식별의 정확성에 의문을 제기합니다.',
      inferenceVariants: [
        { id: 'INF_DISTANCE_DURATION', premises: ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT'], strength: 'limited', title: '제한된 관찰 기회', text: '거리와 짧은 관찰 시간 때문에 인물을 확인할 기회가 제한적이었다.' },
        { id: 'INF_DISTANCE_LIGHT', premises: ['P_DISTANCE_27M', 'P_LIGHTING_POOR'], strength: 'limited', title: '원거리 야간 관찰', text: '먼 거리와 제한된 조명은 얼굴 식별에 불리한 조건이었다.' },
        { id: 'INF_LIGHT_DURATION', premises: ['P_LIGHTING_POOR', 'P_OBSERVATION_SHORT'], strength: 'strong', title: '불리한 시각 조건', text: '어두운 환경에서 짧게 본 인물을 정확히 식별하기 어려웠다.' },
        { id: 'INF_DISTANCE_INITIAL', premises: ['P_DISTANCE_27M', 'P_INITIAL_UNCERTAIN'], strength: 'limited', title: '원거리 식별의 초기 한계', text: '먼 거리에서 본 뒤 작성한 최초 진술도 피고인임을 확신하지 못했다.' },
        { id: 'INF_LIGHT_INITIAL', premises: ['P_LIGHTING_POOR', 'P_INITIAL_UNCERTAIN'], strength: 'strong', title: '조명과 최초 불확실성', text: '제한된 조명에서의 관찰은 최초 진술 단계에서도 확신으로 이어지지 못했다.' },
        { id: 'INF_DURATION_INITIAL', premises: ['P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN'], strength: 'strong', title: '사후 확신 강화 가능성', text: '짧게 관찰한 직후에는 확신하지 못했으므로 현재의 확신은 사후적으로 강화되었을 가능성이 있다.' },
        { id: 'INF_OBSERVATION_CONDITIONS', premises: ['P_DISTANCE_27M', 'P_LIGHTING_POOR', 'P_OBSERVATION_SHORT'], strength: 'strong', title: '열악한 관찰 조건', text: '거리·조명·관찰 시간을 함께 보면 정확한 얼굴 식별이 어려운 조건이었다.' },
        { id: 'INF_DISTANCE_DURATION_INITIAL', premises: ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN'], strength: 'strong', title: '제한된 관찰과 초기 불확실성', text: '멀리서 짧게 본 뒤 최초 진술에서도 확신하지 못했다는 점은 현재 식별의 신빙성을 약화한다.' },
        { id: 'INF_DISTANCE_LIGHT_INITIAL', premises: ['P_DISTANCE_27M', 'P_LIGHTING_POOR', 'P_INITIAL_UNCERTAIN'], strength: 'strong', title: '원거리 야간 식별의 불확실성', text: '먼 거리와 제한된 조명에서 이루어진 식별은 최초 진술에서도 확정되지 않았다.' },
        { id: 'INF_LIGHT_DURATION_INITIAL', premises: ['P_LIGHTING_POOR', 'P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN'], strength: 'strong', title: '짧은 야간 관찰과 확신 변화', text: '어두운 환경에서 잠깐 본 뒤 확신하지 못했던 증언이 법정에서 더 강해졌다.' },
        { id: 'INF_IDENTIFICATION_RELIABILITY', premises: ['P_DISTANCE_27M', 'P_LIGHTING_POOR', 'P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN'], strength: 'compelling', title: '식별 진술 전반의 신빙성 의문', text: '관찰 조건의 한계와 최초 진술의 불확실성을 함께 보면 피고인 식별 진술 전반의 신빙성에 상당한 의문이 있다.' }
      ],
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
      { when: { recordTags: { counter: 1 } }, code: 'CONFLICTING', title: '상반된 식별 근거가 남았습니다', text: '관찰의 한계와 증인의 추가 설명을 함께 기록했습니다. 어느 쪽도 자동으로 소거되지 않습니다.' },
      { when: { frameStrength: 'compelling', absentTags: ['counter'] }, code: 'COMPELLING_ARGUMENT', title: '식별 진술 전반에 강한 의문을 구축했습니다', text: '관찰 조건 전체와 최초 진술의 불확실성이 하나의 강한 논증으로 연결되었습니다. 증인의 직접 인정과는 구분됩니다.' },
      { when: { frameStrength: 'strong', absentTags: ['counter'] }, code: 'WEAKENED', title: '식별 의문을 논증으로 구축했습니다', text: '서로 연결되는 전제들이 식별 신빙성을 약화하는 논증으로 남았습니다. 증인의 직접 인정은 아닙니다.' },
      { when: { frameStrength: 'limited', absentTags: ['counter'] }, code: 'LIMITED_ARGUMENT', title: '제한적인 식별 논증을 남겼습니다', text: '선택한 전제들은 식별에 의문을 주지만, 진술 전반을 흔들기에는 아직 제한적입니다.' },
      { when: { any: [{ recordTags: { observation: 2 } }, { recordTags: { uncertain: 1 } }] }, code: 'DOUBT_RECORDED', title: '식별 관련 전제를 안전하게 보존했습니다', text: '사실 자료는 확보했습니다. 명시적 논증이나 증인의 추가 인정은 이 전제만으로 생성되지 않습니다.' },
      { when: {}, code: 'INSUFFICIENT', title: '식별 판단 자료가 부족합니다', text: '확보된 기록만으로는 이 쟁점의 판단을 닫기 어렵습니다. 상대 주장을 인정한 것은 아닙니다.' }
    ]
  };
  // Explicit ownership lets the same engine examine two patterns in one case.
  const d = caseDefinition;
  d.profile.actions.push('witness','thread','endThread');
  d.witnesses[0].planId = 'PLAN_IDENTIFICATION';
  d.witnesses[0].role = '목격자';
  d.witnesses[0].evidenceIds = ['E_INITIAL_STATEMENT'];
  d.argumentPlans[0].witnessId = 'WITNESS_SJH';
  d.goals.forEach(g => { g.witnessId = 'WITNESS_SJH'; });
  d.propositions.forEach(p => { p.planId = 'PLAN_IDENTIFICATION'; });
  d.counterResponses.forEach(c => { c.witnessId = 'WITNESS_SJH'; });
  d.propositions.find(p=>p.id==='P_FAMILIARITY').qualificationText = '친분과 당시 식별의 확신은 구분됨.';
  d.goals.find(g=>g.id==='G_LIGHTING').followup = 'G_LIGHT_SOURCE';
  d.goals.find(g=>g.id==='G_LIGHT_SOURCE').followupLabel = '광원까지 확인';
  d.goals.find(g=>g.id==='G_LIGHT_SOURCE').procedure.justification = '최초 진술의 조명 설명을 확인하려는 질문입니다.';
  d.threads = [
    { id:'THREAD_OBSERVATION', witnessId:'WITNESS_SJH', title:'관찰 조건', goals:['G_DISTANCE','G_DURATION','G_LIGHTING','G_LIGHT_SOURCE'] },
    { id:'THREAD_STATEMENT', witnessId:'WITNESS_SJH', title:'진술 변화', goals:['G_INITIAL'] },
    { id:'THREAD_ANALYSIS', witnessId:'WITNESS_HSY', title:'감식 한계', goals:['G_PRINT_TIME','G_PRINT_SCOPE'] },
    { id:'THREAD_ACCESS', witnessId:'WITNESS_HSY', title:'접촉 경위', goals:['G_SHARED_KNIFE','G_PRIOR_USE'] }
  ];
  d.procedure.messages = { connected:'기록된 관찰 조건과 연결된 질문으로 허용합니다.', limited:'식별 결론 대신 관찰 조건에 한정하십시오.' };
  d.witnesses.push({ id:'WITNESS_HSY', name:'한서윤', role:'감식 담당 수사관', planId:'PLAN_CONTACT_USE', initialObservation:'감식 보고서를 펴고 질문을 기다립니다.', directResponse:'R_FORENSIC_DIRECT', evidenceIds:['E_FORENSIC_REPORT','E_SHARED_INVENTORY','E_PRIOR_USE_STATEMENT'] });
  d.issues.push({ id:'COMMISSION', title:'범행 당시 사용', question:'지문이 사건 당시 칼을 사용했다는 연결까지 뒷받침하는가?' });
  d.theories[0].contestedIssues.push('COMMISSION'); d.theories[0].preferredPlans.push('PLAN_CONTACT_USE');
  d.evidence.push(
    { id:'E_FORENSIC_REPORT', title:'감식 보고서', text:'손잡이의 지문은 김도윤의 지문과 일치하고 칼날 혈액은 피해자의 혈액과 일치한다. 지문 생성 시점이나 두 흔적의 선후관계는 특정하지 않았다.' },
    { id:'E_SHARED_INVENTORY', title:'공용 비품 기록', text:'문제의 칼은 직원 휴게실 공동 비품으로 기재되어 있다. 개인별 사용 시각은 관리하지 않았다.' },
    { id:'E_PRIOR_USE_STATEMENT', title:'이전 사용 진술', text:'김도윤은 사건 이전 휴게실에서 과일을 깎을 때 이 칼을 사용한 적이 있다고 진술했다. 이 진술만으로 실제 접촉 시각이 확정되지는 않는다.' }
  );
  d.propositions.push(
    {id:'P_FINGERPRINT_PRESENT',short:'손잡이의 피고인 지문',text:'칼 손잡이에서 김도윤의 지문이 검출되었다.',tags:['contact_finding'],side:'prosecution'},
    {id:'P_VICTIM_BLOOD',short:'칼날의 피해자 혈액',text:'칼날에서 피해자의 혈액이 검출되었다.',tags:['blood_finding'],side:'prosecution'},
    {id:'P_PRINT_TIME_UNKNOWN',short:'지문 시점 불명',text:'해당 지문이 언제 남았는지는 특정할 수 없다.',tags:['timing'],side:'support'},
    {id:'P_SHARED_KNIFE',short:'공용 비품',text:'칼은 직원들이 공동 사용하는 휴게실 비품이었다.',tags:['shared'],side:'support'},
    {id:'P_PRIOR_USE_POSSIBLE',short:'이전 사용 기회',text:'피고인이 사건 이전에 해당 칼을 사용할 기회가 있었다.',tags:['prior_access'],side:'support'},
    {id:'P_PRINT_ONLY_CONTACT',short:'접촉까지 확인',text:'지문은 접촉 사실을 보여주지만 접촉 시점을 직접 특정하지 않는다.',tags:['analysis_scope'],side:'support'},
    {id:'P_USE_TIME_LIMIT',short:'범행 당시 사용 연결의 한계',text:'증인은 지문만으로 사건 당시 피고인이 칼을 사용했다고 연결할 수 없음을 인정했다.',tags:['concession'],side:'support'}
  );
  d.propositions.filter(p=>!p.planId).forEach(p=>{p.planId='PLAN_CONTACT_USE';});
  d.responses.push(
    {id:'R_FORENSIC_DIRECT',type:'EXPLAIN',text:'범행에 사용된 것으로 추정되는 칼에서 피해자의 혈액과 피고인의 지문이 검출되었습니다.',adds:['P_FINGERPRINT_PRESENT','P_VICTIM_BLOOD']},
    {id:'R_PRINT_TIME',type:'ADMIT',text:'아닙니다. 지문의 생성 시점까지는 특정할 수 없습니다.',adds:['P_PRINT_TIME_UNKNOWN']},
    {id:'R_SHARED_KNIFE',type:'ADMIT',text:'현장 확인과 비품 기록상 직원 휴게실에서 함께 쓰던 칼입니다.',adds:['P_SHARED_KNIFE']},
    {id:'R_PRIOR_USE',type:'ADMIT',text:'네. 근무 중 이용할 수 있었습니다. 다만 실제로 언제 썼는지까지 확인한 것은 아닙니다.',adds:['P_PRIOR_USE_POSSIBLE']},
    {id:'R_PRINT_SCOPE',type:'ADMIT',text:'접촉했다는 점은 확인됩니다. 지문만으로 접촉 시각이나 당시 행동까지 알 수는 없습니다.',adds:['P_PRINT_ONLY_CONTACT']},
    {id:'R_USE_TIME_CONCEDE',type:'ADMIT',text:'네. 이전 접촉 가능성도 있으므로 지문만으로 범행 당시 이 칼을 사용했다고 연결할 수는 없습니다. 혈액과 지문 검출 사실은 그대로입니다.',adds:['P_USE_TIME_LIMIT']},
    {id:'R_USE_TIME_EXPLAIN',type:'EXPLAIN',text:'시점은 특정하지 못합니다. 그렇지만 피고인이 칼에 접촉했다는 감식 결과까지 없어지는 것은 아닙니다.',adds:[]},
    {id:'R_USE_TIME_RESIST',type:'RESIST',text:'감식 결과와 그 해석의 한계를 이미 말씀드렸습니다.',adds:[]}
  );
  d.goals.push(
    {id:'G_PRINT_TIME',witnessId:'WITNESS_HSY',title:'생성 시점을 묻는다',informationType:'favorable',question:'이 지문이 언제 남았는지는 확인할 수 있습니까?',basis:['E_FORENSIC_REPORT'],response:'R_PRINT_TIME'},
    {id:'G_PRINT_SCOPE',witnessId:'WITNESS_HSY',title:'해석 범위를 확인',informationType:'favorable',question:'지문으로 확인되는 것은 접촉 사실이지, 접촉 시각이나 행동까지는 아니지요?',basis:['E_FORENSIC_REPORT'],response:'R_PRINT_SCOPE'},
    {id:'G_SHARED_KNIFE',witnessId:'WITNESS_HSY',title:'누가 쓰던 칼인가',informationType:'favorable',question:'이 칼은 직원들이 공동 사용하는 휴게실 비품이었습니까?',basis:['E_SHARED_INVENTORY'],response:'R_SHARED_KNIFE'},
    {id:'G_PRIOR_USE',witnessId:'WITNESS_HSY',title:'이전 사용 기회를 묻는다',informationType:'favorable',question:'김도윤도 사건 이전 근무 중 이 칼을 사용할 기회가 있었습니까?',basis:['E_PRIOR_USE_STATEMENT'],response:'R_PRIOR_USE'}
  );
  d.argumentPlans.push({id:'PLAN_CONTACT_USE',witnessId:'WITNESS_HSY',issue:'COMMISSION',title:'접촉과 범행 당시 사용의 구분',goal:'감식 결과가 말할 수 있는 범위 확인',min:2,max:4,
    premises:['P_PRINT_TIME_UNKNOWN','P_SHARED_KNIFE','P_PRIOR_USE_POSSIBLE','P_PRINT_ONLY_CONTACT'],
    question:'그렇다면 이 지문만으로 사건 당시 피고인이 이 칼을 사용했다고 말할 수는 없는 거죠?',
    inferenceVariants:[
      {id:'INF_PRINT_TIME_SHARED',premises:['P_PRINT_TIME_UNKNOWN','P_SHARED_KNIFE'],strength:'limited',title:'생성 시점 특정의 한계',text:'공용 칼의 지문이 범행 당시 생성되었다고 특정할 수 없다.'},
      {id:'INF_PRINT_TIME_PRIOR',premises:['P_PRINT_TIME_UNKNOWN','P_PRIOR_USE_POSSIBLE'],strength:'strong',title:'이전 접촉 가능성',text:'지문 시점을 알 수 없고 이전 사용 기회가 있어 사건 이전의 정상 접촉을 배제할 수 없다.'},
      {id:'INF_PRINT_TIME_SCOPE',premises:['P_PRINT_TIME_UNKNOWN','P_PRINT_ONLY_CONTACT'],strength:'limited',title:'접촉 시점을 말하지 않는 감식',text:'감식은 접촉 사실을 확인했지만 언제 접촉했는지는 확인하지 못했다.'},
      {id:'INF_PRINT_SHARED_PRIOR',premises:['P_SHARED_KNIFE','P_PRIOR_USE_POSSIBLE'],strength:'limited',title:'통상적 접근 기회',text:'공용 비품을 사용할 기회가 있었다. 이 두 사실만으로 지문이 남은 시점은 알 수 없다.'},
      {id:'INF_PRINT_SHARED_SCOPE',premises:['P_SHARED_KNIFE','P_PRINT_ONLY_CONTACT'],strength:'limited',title:'공용 물품과 접촉 흔적',text:'공용 물품의 접촉 흔적만으로 당시 행동을 직접 확인할 수는 없다.'},
      {id:'INF_PRINT_PRIOR_SCOPE',premises:['P_PRIOR_USE_POSSIBLE','P_PRINT_ONLY_CONTACT'],strength:'strong',title:'접촉의 다른 경위',text:'감식의 접촉 확인과 사건 이전 사용 기회는 함께 고려되어야 한다.'},
      {id:'INF_PRINT_TIME_SHARED_PRIOR',premises:['P_PRINT_TIME_UNKNOWN','P_SHARED_KNIFE','P_PRIOR_USE_POSSIBLE'],strength:'compelling',title:'범행 당시 사용으로 연결되지 않는 지문',text:'생성 시점이 불명인 공용 칼의 지문과 이전 사용 기회를 함께 보면 지문만으로 범행 당시 사용을 연결하기 어렵다.'},
      {id:'INF_PRINT_TIME_SHARED_SCOPE',premises:['P_PRINT_TIME_UNKNOWN','P_SHARED_KNIFE','P_PRINT_ONLY_CONTACT'],strength:'strong',title:'공용 칼 감식의 시간적 한계',text:'공용 칼의 지문은 접촉을 보여주지만 범행 시각의 사용까지 특정하지 못한다.'},
      {id:'INF_PRINT_TIME_PRIOR_SCOPE',premises:['P_PRINT_TIME_UNKNOWN','P_PRIOR_USE_POSSIBLE','P_PRINT_ONLY_CONTACT'],strength:'compelling',title:'이전 접촉을 배제하지 못하는 감식',text:'감식의 시간적 한계와 구체적인 이전 사용 기회를 연결하면 정상 접촉 가능성을 배제할 수 없다.'},
      {id:'INF_PRINT_SHARED_PRIOR_SCOPE',premises:['P_SHARED_KNIFE','P_PRIOR_USE_POSSIBLE','P_PRINT_ONLY_CONTACT'],strength:'strong',title:'접촉 흔적의 제한된 의미',text:'공용 비품에 대한 이전 접근 가능성이 있어 접촉 흔적을 범행 행동과 동일시할 수 없다.'},
      {id:'INF_PRINT_ALL',premises:['P_PRINT_TIME_UNKNOWN','P_SHARED_KNIFE','P_PRIOR_USE_POSSIBLE','P_PRINT_ONLY_CONTACT'],strength:'compelling',title:'접촉과 범행 사용의 구분',text:'지문 검출 사실은 유지되지만 시간적 한계와 이전 정상 접촉 가능성 때문에 범행 당시 사용으로의 연결에는 공백이 남는다.'}
    ],
    responseRules:[{when:{repeated:true},response:'R_USE_TIME_RESIST'},{when:{selectedTags:{timing:1,prior_access:1,shared:1}},response:'R_USE_TIME_CONCEDE'},{when:{selectedTags:{timing:1,prior_access:1,analysis_scope:1}},response:'R_USE_TIME_CONCEDE'},{when:{},response:'R_USE_TIME_EXPLAIN'}],
    procedure:{
      messages:{connected:'감식의 해석 범위를 확인하는 질문으로 허용합니다.',limited:'접촉 시점의 한계까지만 확인하십시오.'},
      narrowedPress:{question:'감식으로 지문 생성 시점은 특정하지 못했다는 뜻이지요?',response:{type:'ADMIT',text:'네. 생성 시점은 특정하지 못했습니다. 그 이상의 결론에는 답하지 않겠습니다.',adds:[]}},
      basisChoice:{inferenceIds:['INF_PRINT_TIME_SHARED'],min:1,max:2,requiredCoverage:['analysis'],candidates:[
        {kind:'evidence',sourceId:'E_FORENSIC_REPORT',coverage:['analysis']},
        {kind:'evidence',sourceId:'E_SHARED_INVENTORY',coverage:['access']},
        {kind:'record',sourceId:'P_PRINT_TIME_UNKNOWN',coverage:['analysis']},
        {kind:'evidence',sourceId:'E_PRIOR_USE_STATEMENT',coverage:['access']}
      ]}
    },
    resolutionRules:[
      {when:{recordTags:{concession:1}},code:'USE_LIMIT_ADMITTED',title:'범행 당시 사용 연결의 한계를 인정받았습니다',text:'접촉 사실은 남지만 그 시점과 행동까지 연결할 수 없다는 증언을 확보했습니다.'},
      {when:{frameStrength:'compelling'},code:'USE_LINK_WEAKENED',title:'접촉과 범행 사용을 구분하는 논점을 남겼습니다',text:'지문 검출을 부정하지 않고 이전 접촉 가능성과 시간적 한계를 함께 연결했습니다.'},
      {when:{frameStrength:'strong'},code:'PRIOR_CONTACT_ARGUMENT',title:'이전 접촉 가능성을 논점으로 남겼습니다',text:'정상적인 이전 접촉을 배제할 수 없다는 논증입니다. 실제 접촉 시점을 확정하지는 않습니다.'},
      {when:{frameStrength:'limited'},code:'LIMITED_USE_ARGUMENT',title:'감식 해석에 제한적인 논점을 남겼습니다',text:'감식의 일부 한계를 기록했지만 범행 당시 사용 전체를 부정한 것은 아닙니다.'},
      {when:{any:[{recordTags:{timing:1}},{recordTags:{analysis_scope:1}},{recordTags:{shared:1}},{recordTags:{prior_access:1}}]},code:'ANALYSIS_FACTS',title:'감식과 접촉 경위의 사실을 남겼습니다',text:'확보한 사실만 보존했습니다. 논증이나 증인의 결론 인정은 별도입니다.'},
      {when:{},code:'FORENSIC_UNCHALLENGED',title:'검출 결과에 관한 기본 증언이 남았습니다',text:'피해자 혈액과 피고인 지문이 검출되었다는 증언입니다. 이 결과만으로 사건의 유무죄를 판정하지 않습니다.'}
    ]
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = caseDefinition;
  else root.FirmCase = caseDefinition;
})(globalThis);
