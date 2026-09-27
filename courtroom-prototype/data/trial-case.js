(function (root) {
'use strict';
// v0.10 Adversarial Trial experiment — authored data only. No runtime mutation.
// 사실관계는 data/case.js(B동 창고)와 같다. 수치는 플레이테스트용 authored 규칙이며 법률 기준이 아니다.
const trialCase = {
  id: 'TRIAL_B_WAREHOUSE',
  version: '0.10.0',
  title: '22시 14분, B동 창고',
  charge: '특수상해',
  client: { id: 'CLIENT_KDY', name: '김도윤', role: '피고인' },
  roles: {
    judge: { id: 'JUDGE', name: '재판장', initial: '재' },
    prosecutor: { id: 'PROSECUTOR', name: '윤재경 검사', initial: '윤', style: 'thorough', styleLabel: '꼼꼼형 — 약점을 재주신문으로 반드시 수습한다' },
    defense: { id: 'DEFENSE', name: '변호인', initial: '변' }
  },
  briefing: [
    '22:14, 물류센터 B동 창고 출입구에서 직원 한 명이 칼에 찔려 다쳤다.',
    '동료 서지훈이 흡연구역에서 김도윤을 공격자로 지목했다.',
    '공용 휴게실 칼 손잡이에서 김도윤의 지문이 나왔다.'
  ],
  clientStatements: [
    { id: 'CS_INITIAL', text: '그날 B동에 간 건 맞아요. 피해자와 말다툼도 했고요. 하지만 찌르지 않았어요. 그 칼은 만진 적도 없어요.' },
    { id: 'CS_REINTERVIEW', requiresCard: 'CARD_PRIOR_USE', text: '생각해 보니… 사건 며칠 전 휴게실에서 그 칼로 과일을 깎은 적이 있어요. 별일 아니라서 잊고 있었어요.' }
  ],

  // 준비: 반나절 단위 예산.
  prep: { budget: 4, unitLabel: '반나절', deadlineLabel: '제1회 공판까지 D-2' },
  investigations: [
    { id: 'INV_RECORDS', title: '검찰 수사기록 열람·등사', cost: 1, blurb: '검찰이 법정에 낼 자료의 내용을 미리 본다.', grants: ['CARD_INITIAL_STATEMENT'], reveals: ['PX_STATEMENT', 'PX_REPORT', 'PX_PHOTOS'] },
    { id: 'INV_SCENE', title: '야간 현장 방문', cost: 1, blurb: '사건 시각에 흡연구역에서 출입구를 직접 본다.', grants: ['CARD_DISTANCE', 'CARD_LIGHT_OFF'] },
    { id: 'INV_LUX', title: '조도·간판 방향 측정', cost: 2, blurb: '조도계와 사진으로 출입구 주변 빛을 기록한다.', grants: ['CARD_SIGN_ANGLE'] },
    { id: 'INV_REPORT', title: '감식 보고서 정밀 검토', cost: 1, blurb: '보고서가 말하는 것과 말하지 않는 것을 가려낸다.', grants: ['CARD_PRINT_TIMING'] },
    { id: 'INV_INVENTORY', title: '휴게실 비품 관리 확인', cost: 1, blurb: '칼이 누구의 물건이었는지 확인한다.', grants: ['CARD_SHARED'] },
    { id: 'INV_CLIENT', title: '의뢰인 재면담', cost: 1, blurb: '처음 진술에서 빠진 것이 없는지 다시 묻는다.', grants: ['CARD_PRIOR_USE'] }
  ],
  cards: [
    { id: 'CARD_INITIAL_STATEMENT', title: '최초 경찰 진술', text: '사건 직후 서지훈: "어두워서 얼굴은 정확히 못 봤지만, 체격과 걸음걸이가 김도윤 씨 같았다."', issue: 'ISSUE_IDENTITY' },
    { id: 'CARD_DISTANCE', title: '관찰 거리 27m', text: '흡연구역에서 창고 출입구까지 약 27미터.', issue: 'ISSUE_IDENTITY' },
    { id: 'CARD_LIGHT_OFF', title: '출입구 조명 소등', text: '출입구 위 조명 두 개 중 하나가 꺼져 있었다.', issue: 'ISSUE_IDENTITY' },
    { id: 'CARD_SIGN_ANGLE', title: '간판 방향·조도 측정', text: '창고 간판은 출입구 옆면을 향한다. 흡연구역 쪽에서 본 인물의 얼굴 정면을 비추지 않는다. 출입구 앞 조도 3lx.', issue: 'ISSUE_IDENTITY', rebuttal: true },
    { id: 'CARD_PRINT_TIMING', title: '감식 보고서 p.4', text: '"지문 생성 시점이나 혈흔과의 선후관계는 특정하지 않았다."', issue: 'ISSUE_KNIFE' },
    { id: 'CARD_SHARED', title: '공용 비품 대장', text: '문제의 칼은 휴게실 공동 비품. 개인별 사용 기록 없음.', issue: 'ISSUE_KNIFE' },
    { id: 'CARD_PRIOR_USE', title: '의뢰인의 이전 사용', text: '사건 며칠 전 휴게실에서 이 칼로 과일을 깎았다.', issue: 'ISSUE_KNIFE' }
  ],
  prosecutionExhibits: [
    { id: 'PX_STATEMENT', title: '서지훈 진술조서', content: '최초 진술에서 "얼굴은 정확히 못 봤지만 김도윤 씨 같았다". 김도윤과 6년 동료라고 기재.' },
    { id: 'PX_REPORT', title: '감식 결과 보고서', content: '손잡이 지문 김도윤 일치, 칼날 혈액 피해자 일치. 요약본에는 생성 시점 언급 없음.' },
    { id: 'PX_PHOTOS', title: '현장 사진 3매', content: '출입구와 창고 간판. 간판 불이 켜져 있다. 검찰은 이 불빛으로 시야를 설명할 것으로 보인다.' }
  ],

  issues: [
    { id: 'ISSUE_IDENTITY', title: '공격자 동일성', question: '목격자가 본 공격자가 피고인인가?', baseline: 4,
      memo: { proven: '목격 진술 구체적 — 피고인 지목 명확', shaken: '식별에 의문 제기 — 관찰 조건 확인 필요', doubt: '식별 불확실 — 합리적 의심 남음' } },
    { id: 'ISSUE_KNIFE', title: '범행 당시 칼 사용', question: '지문이 범행 당시 사용을 보여주는가?', baseline: 4,
      memo: { proven: '지문·혈흔 — 범행 도구 사용 연결', shaken: '지문 시점 불분명 — 연결 약화', doubt: '범행 당시 사용 연결 안 됨' } }
  ],
  bands: { proven: 5, doubt: 2 },
  adjudication: { rule: 'all_required', required: ['ISSUE_IDENTITY', 'ISSUE_KNIFE'],
    guilty: { title: '유죄', text: '검찰이 두 쟁점을 모두 합리적 의심 없이 입증했다. 피고인에게 유죄를 선고한다.' },
    notGuilty: { title: '무죄', text: '필수 쟁점에 합리적 의심이 남았다. 검찰의 입증이 부족하므로 피고인에게 무죄를 선고한다.' } },
  credibility: { start: 3, max: 3, warnAtOrBelow: 1 },

  opening: {
    focus: [
      { id: 'F_IDENTITY', title: '목격 식별을 집중적으로 다툰다', time: { W_SEO: 4, W_HAN: 2 }, text: '이 사건의 핵심은 어둠 속 27미터 밖의 목격입니다.' },
      { id: 'F_BALANCED', title: '두 쟁점을 고르게 다툰다', time: { W_SEO: 3, W_HAN: 3 }, text: '목격과 지문, 두 증거 모두 보이는 것만큼 단단하지 않습니다.' },
      { id: 'F_KNIFE', title: '지문 증거를 집중적으로 다툰다', time: { W_SEO: 2, W_HAN: 4 }, text: '지문은 접촉을 말할 뿐, 그 시각을 말하지 않습니다.' }
    ],
    stance: [
      { id: 'S_ADMIT', title: '피고인은 평소 그 칼을 사용했다', text: '피고인은 휴게실의 그 칼을 평소에 사용한 적이 있습니다.' },
      { id: 'S_SILENT', title: '칼 접촉은 언급하지 않는다', text: '' },
      { id: 'S_DENY', title: '피고인은 그 칼을 만진 적이 없다', text: '피고인은 그 칼을 만진 적조차 없습니다.' }
    ],
    close: '검찰의 주장은 합리적 의심을 넘지 못할 것입니다.',
    caution: { unlessCard: 'CARD_PRIOR_USE', text: '의뢰인은 “그 칼은 만진 적도 없다”고 했습니다. 그 말을 확인해 봤습니까?' }
  },

  witnesses: [
    { id: 'W_SEO', name: '서지훈', role: '목격자 · 물류센터 동료', initial: '서', issue: 'ISSUE_IDENTITY',
      direct: [
        { type: 'lines', id: 'D_SEO_1', lines: [['PROSECUTOR', '증인은 사건 당일 22시 14분경 어디에 있었습니까?'], ['W_SEO', 'B동 창고 옆 야외 흡연구역에 있었습니다.']] },
        { type: 'lines', id: 'D_SEO_2', lines: [['PROSECUTOR', '그때 무엇을 보았습니까?'], ['W_SEO', '창고 출입구에서 피해자와 다투던 사람이 칼을 휘두르는 걸 봤습니다.']],
          effects: [['ISSUE_IDENTITY', 1]], memo: '목격자: 출입구에서 공격 장면 목격', tone: 'prosecution' },
        { type: 'objection', id: 'OBJ_SEO_LEADING', proper: true, ground: '유도신문',
          question: ['PROSECUTOR', '그 사람이 바로 피고인 김도윤이었지요?'],
          sustained: { lines: [['DEFENSE', '이의 있습니다. 핵심 사실에 대한 유도신문입니다.'], ['JUDGE', '인용합니다. 검사는 질문을 바꾸십시오.'], ['PROSECUTOR', '…그 사람이 누구였습니까?'], ['W_SEO', '김도윤 씨… 였습니다.']],
            effects: [['ISSUE_IDENTITY', 1]], memo: '유도신문 이의 인용 — 지목 답변은 머뭇거림', tone: 'defense' },
          pass: { lines: [['W_SEO', '네. 김도윤 씨가 틀림없습니다.']], effects: [['ISSUE_IDENTITY', 2]], memo: '피고인 지목 — 확신에 찬 답변', tone: 'prosecution' } },
        { type: 'lines', id: 'D_SEO_4', lines: [['PROSECUTOR', '증인은 피고인을 어떻게 압니까?'], ['W_SEO', '같은 물류센터에서 6년을 함께 일했습니다.']], memo: '피고인과 6년 동료', tone: 'neutral' }
      ],
      approaches: [
        { id: 'A_SEO_OBSERVE', title: '관찰 조건 추궁', hint: '거리와 조명', requiresAny: ['CARD_DISTANCE', 'CARD_LIGHT_OFF'], perCard: -1,
          cardPoints: { CARD_DISTANCE: 'POINT_DISTANCE', CARD_LIGHT_OFF: 'POINT_LIGHT' },
          lines: { CARD_DISTANCE: [['DEFENSE', '흡연구역에서 출입구까지 약 27미터였지요?'], ['W_SEO', '네. 그 정도 거리는 됐을 겁니다.']],
                   CARD_LIGHT_OFF: [['DEFENSE', '그날 출입구 위 조명 하나는 꺼져 있었습니까?'], ['W_SEO', '네, 한쪽은 꺼져 있었습니다. 사람 형태는 보였습니다.']] },
          memo: '관찰 조건 제한 — 거리·조명', tone: 'defense' },
        { id: 'A_SEO_TIME', title: '관찰 시간 확인', hint: '카드 없이 가능', requiresAny: [], delta: -1, points: ['POINT_TIME'],
          lines: [['DEFENSE', '그 사람의 얼굴을 본 시간은 얼마나 됐습니까?'], ['W_SEO', '길지는 않았습니다. 1~2초쯤이었던 것 같습니다.']],
          memo: '관찰 시간 1~2초', tone: 'defense' },
        { id: 'A_SEO_INITIAL', title: '최초 진술과 대조', hint: '경찰 진술서', requiresAny: ['CARD_INITIAL_STATEMENT'], delta: -2, points: ['POINT_INITIAL'], neutralizes: ['RH_FAMILIARITY'],
          lines: [['DEFENSE', '최초 진술서를 제시합니다. 당시에는 "얼굴은 정확히 못 봤지만 김도윤 씨 같았다"고 했지요?'], ['W_SEO', '…그렇게 말했습니다. 그때는 확신까지는 못 했습니다.'], ['DEFENSE', '6년을 알고 지냈는데도 말이지요?'], ['W_SEO', '네. 친분만으로 그 순간을 단정할 수는 없겠지요.']],
          memo: '최초 진술에선 확신 못 함 — 6년 친분에도', tone: 'defense' }
      ],
      presses: [
        { id: 'P_SEO_LIMITED', kind: 'limited', title: '한정 결론을 요구한다', question: '그 거리와 조명, 1~2초 만으로 얼굴을 정확히 봤다고 단정할 수는 없지요?', minPoints: 3,
          success: { lines: [['W_SEO', '…말씀하신 조건만으로 얼굴을 정확히 식별했다고 단정하기는 어렵습니다.']], delta: -2, memo: '증인 스스로 식별 한계 인정', tone: 'defense' },
          fail: { lines: [['W_SEO', '짧게 봤어도 평소 알던 인상과 목소리가 있었습니다. 저는 확실합니다.']], delta: 1, memo: '증인: 인상과 목소리로 식별 — 확신 유지', tone: 'prosecution' } },
        { id: 'P_SEO_OVER', kind: 'overreach', title: '과한 결론을 요구한다', question: '그렇다면 피고인을 봤다는 증언 자체가 틀렸다는 말씀이죠?',
          fail: { lines: [['W_SEO', '아닙니다. 조건이 나빴다는 거지, 제가 본 사람이 김도윤 씨가 아니라는 게 아닙니다.'], ['JUDGE', '변호인, 증인의 답변 범위를 넘지 마십시오.']], delta: 2, credibility: -1, memo: '변호인 과욕 — 증인이 지목을 재확인', tone: 'prosecution' } }
      ],
      redirect: [
        { id: 'RH_SIGN_LIGHT', when: { anyPoint: ['POINT_DISTANCE', 'POINT_LIGHT', 'POINT_TIME'] }, delta: 2,
          lines: [['PROSECUTOR', '조명 하나가 꺼져 있었다고 했는데, 그 순간 창고 간판 불빛이 얼굴을 비추고 있었지요?'], ['W_SEO', '네. 간판 불빛에 얼굴이 보였습니다. 그 순간은 분명했습니다.']],
          memo: '간판 불빛 — 시야 확보 설명', tone: 'prosecution',
          rebuttal: { card: 'CARD_SIGN_ANGLE', title: '조도·간판 측정 결과 제시', delta: -3,
            lines: [['DEFENSE', '재반대신문입니다. 측정 결과 간판은 출입구 옆면을 향하고, 출입구 앞 조도는 3럭스였습니다. 흡연구역에서 본 얼굴 정면을 비출 수 있습니까?'], ['W_SEO', '…정면이라고는… 확실히 말씀드리기 어렵습니다.']],
            memo: '간판은 측면 조명 — 얼굴 정면 아님(측정)', tone: 'defense' },
          missed: '조도·간판 방향 측정을 했다면 간판 불빛 설명을 재반대신문으로 무너뜨릴 수 있었다.' },
        { id: 'RH_FAMILIARITY', when: { anyDefenseGain: true }, delta: 1,
          lines: [['PROSECUTOR', '6년을 함께 일한 동료를 몰라볼 수 있습니까?'], ['W_SEO', '없습니다. 걸음걸이만 봐도 압니다.']],
          memo: '6년 동료 — 걸음걸이로도 식별', tone: 'prosecution',
          neutralizedMemo: '6년 친분 강조 — 최초 진술과 맞지 않음',
          missed: '최초 진술과 대조했다면 "6년 친분" 논리를 미리 꺾을 수 있었다.' }
      ]
    },
    { id: 'W_HAN', name: '한서윤', role: '감식 담당 수사관', initial: '한', issue: 'ISSUE_KNIFE',
      direct: [
        { type: 'lines', id: 'D_HAN_1', lines: [['PROSECUTOR', '범행 도구로 추정되는 칼에서 무엇이 검출되었습니까?'], ['W_HAN', '손잡이에서 피고인의 지문, 칼날에서 피해자의 혈액이 검출되었습니다.']],
          effects: [['ISSUE_KNIFE', 2]], memo: '손잡이 지문 = 피고인, 칼날 혈액 = 피해자', tone: 'prosecution' },
        { type: 'lines', id: 'D_HAN_DENY', when: { stance: 'S_DENY' },
          lines: [['PROSECUTOR', '변호인은 개회사에서 피고인이 그 칼을 만진 적도 없다고 했습니다. 증인, 그 지문은 누구의 것입니까?'], ['W_HAN', '피고인의 것입니다. 일치 판정에 이견은 없습니다.']],
          effects: [['ISSUE_KNIFE', 1]], credibility: -1, memo: '변호인 개회사와 배치되는 감식 결과', tone: 'prosecution', conflict: true,
          missed: '의뢰인을 다시 만났다면 칼을 만진 적이 있다는 사실을 개회사 전에 알았을 것이다.' },
        { type: 'lines', id: 'D_HAN_ADMIT', when: { stance: 'S_ADMIT', lacksCard: 'CARD_PRIOR_USE' },
          lines: [['PROSECUTOR', '변호인조차 피고인이 그 칼을 썼다고 인정했습니다. 증인, 지문은 그 사용의 흔적이지요?'], ['W_HAN', '접촉의 흔적인 것은 맞습니다.']],
          effects: [['ISSUE_KNIFE', 1]], memo: '변호인이 칼 사용을 인정 — 경위 설명 없음', tone: 'prosecution',
          missed: '의뢰인 재면담으로 사용 경위를 확보했다면 이 인정이 오히려 무기가 됐을 것이다.' },
        { type: 'objection', id: 'OBJ_HAN_EXPERT', proper: false, ground: '의견 진술',
          question: ['PROSECUTOR', '증인의 전문가 의견으로, 그 지문이 피고인의 것이라는 데 의문이 있습니까?'],
          sustained: null,
          overruled: { lines: [['DEFENSE', '이의 있습니다. 증인에게 의견을 묻고 있습니다.'], ['JUDGE', '기각합니다. 감식관의 전문 영역 안의 질문입니다.'], ['W_HAN', '의문 없습니다. 12개 특징점이 일치합니다.']],
            effects: [['ISSUE_KNIFE', 1]], credibility: -1, memo: '이의 기각 — 전문 영역 내 질문', tone: 'prosecution' },
          pass: { lines: [['W_HAN', '의문 없습니다. 12개 특징점이 일치합니다.']], memo: '지문 일치 — 특징점 12개', tone: 'neutral' } }
      ],
      approaches: [
        { id: 'A_HAN_TIMING', title: '지문 생성 시점', hint: '카드 없이도 가능 · 보고서로 강화', requiresAny: [], delta: -1, cardBonus: { card: 'CARD_PRINT_TIMING', delta: -2 }, points: ['POINT_TIMING'],
          lines: [['DEFENSE', '이 지문이 언제 남았는지는 확인할 수 있습니까?'], ['W_HAN', '생성 시점까지는 특정할 수 없습니다.']],
          bonusLines: [['DEFENSE', '보고서 4쪽입니다. "생성 시점이나 혈흔과의 선후관계는 특정하지 않았다." 증인이 직접 쓴 문장이지요?'], ['W_HAN', '네. 제가 작성했습니다. 시점은 특정하지 않았습니다.']],
          memo: '지문 생성 시점 특정 불가', tone: 'defense' },
        { id: 'A_HAN_SHARED', title: '공용 비품 확인', hint: '비품 대장', requiresAny: ['CARD_SHARED'], delta: -1, points: ['POINT_SHARED'],
          lines: [['DEFENSE', '비품 대장상 이 칼은 휴게실 공동 비품이지요?'], ['W_HAN', '네. 직원들이 함께 쓰던 칼입니다.']],
          memo: '칼은 휴게실 공용 비품', tone: 'defense' },
        { id: 'A_HAN_PRIOR', title: '이전 사용 기회', hint: '의뢰인 재면담', requiresAny: ['CARD_PRIOR_USE'], points: ['POINT_PRIOR'],
          byStance: { S_ADMIT: -2, S_SILENT: -1, S_DENY: 0 },
          lines: [['DEFENSE', '피고인이 사건 며칠 전 이 칼로 과일을 깎았다면, 그때 지문이 남았을 수도 있습니까?'], ['W_HAN', '사건 이전에 남았을 가능성을 배제할 수는 없습니다.']],
          memo: '사건 이전 접촉 가능성 배제 불가', tone: 'defense',
          stanceConflict: { stance: 'S_DENY', lines: [['PROSECUTOR', '이의 있습니다. 변호인은 개회사에서 피고인이 그 칼을 만진 적도 없다고 했습니다.'], ['JUDGE', '변호인, 입장을 바꾸는 겁니까? 기록에 남기겠습니다.']], credibility: -1, memo: '변호인 입장 번복 — 개회사와 모순', tone: 'prosecution' } }
      ],
      presses: [
        { id: 'P_HAN_LIMITED', kind: 'limited', title: '한정 결론을 요구한다', question: '그렇다면 이 지문만으로 사건 당시 피고인이 이 칼을 사용했다고 말할 수는 없는 거죠?', requiresPoints: { all: ['POINT_TIMING'], any: ['POINT_SHARED', 'POINT_PRIOR'] },
          success: { lines: [['W_HAN', '감식 결과만으로 범행 당시 사용이라고 특정할 수는 없습니다. 지문과 혈액의 주인이 누구인지는 그대로입니다.']], delta: -2, memo: '감식관: 범행 당시 사용 특정 불가 인정', tone: 'defense' },
          fail: { lines: [['W_HAN', '지문만 떼어 말하기는 어렵습니다. 같은 칼에서 피해자 혈액이 나왔고, 현장에서 발견됐습니다.']], delta: 1, memo: '감식관: 혈흔·현장 정황과 함께 판단', tone: 'prosecution' } },
        { id: 'P_HAN_OVER', kind: 'overreach', title: '과한 결론을 요구한다', question: '그러니까 피고인은 이 칼을 사용하지 않았다는 뜻입니까?',
          fail: { lines: [['W_HAN', '아닙니다. 사용하지 않았다는 뜻이 아닙니다. 제 감정의 한계가 무사용의 증거는 아닙니다.'], ['JUDGE', '변호인, 증언을 왜곡하지 마십시오.']], delta: 2, credibility: -1, memo: '변호인 과욕 — "무사용 증거 아님"', tone: 'prosecution' } }
      ],
      redirect: [
        { id: 'RH_BLOOD', when: { anyDefenseGain: true }, delta: 1,
          lines: [['PROSECUTOR', '시점과 무관하게, 피해자 혈액이 묻은 칼에 피고인 지문이 있다는 사실은 그대로지요?'], ['W_HAN', '그렇습니다. 검출 결과는 바뀌지 않습니다.']],
          memo: '혈흔 칼 + 피고인 지문 — 사실은 유지', tone: 'prosecution' },
        { id: 'RH_CRIME_TIME', when: { anyDefenseGain: true, lacksPoint: 'POINT_TIMING' }, delta: 1,
          lines: [['PROSECUTOR', '그 지문이 사건 당시 남았을 가능성도 충분하지요?'], ['W_HAN', '가능성은 있습니다.']],
          memo: '사건 당시 지문 생성 가능성', tone: 'prosecution',
          missed: '지문 생성 시점을 먼저 확정했다면 "사건 당시 가능성" 수습을 막을 수 있었다.' }
      ]
    }
  ],
  lines: {
    trialOpen: [['JUDGE', '사건번호 2026고합1214, 피고인 김도윤 특수상해 사건 공판을 시작합니다.'], ['PROSECUTOR', '검찰은 목격자 진술과 감식 결과로 피고인의 범행을 입증하겠습니다.']],
    crossStart: [['JUDGE', '변호인, 반대신문 하십시오.']],
    crossWarn: [['JUDGE', '변호인, 신문은 요점만 간결히 하십시오.']],
    crossTimeUp: [['JUDGE', '시간 관계상 반대신문은 여기까지 하겠습니다.']],
    crossStop: [['DEFENSE', '이상입니다.']],
    noRedirect: [['PROSECUTOR', '재주신문 없습니다.']],
    rebutPass: [['DEFENSE', '재반대신문 없습니다.']],
    witnessDone: [['JUDGE', '증인은 돌아가도 좋습니다.']],
    verdictLead: [['JUDGE', '변론을 종결합니다. 판결을 선고하겠습니다.']]
  },
  // 복기용 준비 누락 안내: 해당 카드 없이 쟁점이 입증 방향으로 끝났을 때만 표시.
  missedPrep: [
    { card: 'CARD_INITIAL_STATEMENT', issue: 'ISSUE_IDENTITY', text: '검찰 수사기록을 열람했다면 최초 진술의 불확실성으로 목격자를 흔들 수 있었다.' },
    { cardsAny: ['CARD_DISTANCE', 'CARD_LIGHT_OFF'], issue: 'ISSUE_IDENTITY', text: '야간 현장을 방문했다면 거리와 조명 조건으로 관찰을 추궁할 수 있었다.' },
    { card: 'CARD_PRINT_TIMING', issue: 'ISSUE_KNIFE', text: '감식 보고서를 정밀 검토했다면 감식관 자신의 문장으로 시점 불명을 못 박을 수 있었다.' },
    { cardsAny: ['CARD_SHARED', 'CARD_PRIOR_USE'], issue: 'ISSUE_KNIFE', text: '비품 대장이나 의뢰인 재면담이 있었다면 지문이 남은 다른 경위를 제시할 수 있었다.' }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = trialCase; else root.FirmTrialCase = trialCase;
})(typeof globalThis !== 'undefined' ? globalThis : this);
