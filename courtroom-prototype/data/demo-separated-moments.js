(function (root) {
'use strict';
// DEMO-001 대표 사건 — SIGNATURE §1 “두 장면 사이”. 죄명 상해. authored data only, no runtime mutation.
// 판정은 v0.10 엔진의 더하기 방식 그대로(effects 합산 + bands). DEMO-DESIGN §1.4의 “갱신” 방식은 쓰지 않는다.
// 신참/베테랑 검사는 아래 두 trial 정의의 상대 행동 데이터로만 다르다. 사건·진실·쟁점·기준값·bands·판정 규칙은 같다(DEC-031 N4).
// 수치는 플레이 경로 검증용 실험 값이며 실제 법적 입증 강도가 아니다. 상세는 demo/RULES.md.
//
// 고정된 숨은 진실(판정 입력으로 읽지 않는다): 피고인은 어깨를 한 번 밀었다. 피해자는 자세를 회복했고,
// 가림막 뒤에서 바퀴 달린 운반대에 걸려 넘어져 손목을 다쳤다. 목격자는 팔 움직임과 밀리는 모습을 봤지만
// 손이 닿는 순간과 낙상 순간은 보지 못했다. 수사관은 진단서와 사진을 성실히 취합했을 뿐 원인을 감정하지 않았다.

const ACT = 'ISSUE_SIG_ACT', CAUSE = 'ISSUE_SIG_CAUSE';
const OBS = 'W_SIG_OBSERVER', INV = 'W_SIG_INVESTIGATOR';

// ---------- 두 버전 공통 ----------
const common = {
  id: 'SIG_SEPARATED_MOMENTS',
  version: '1.0.0-demo',
  title: '두 장면 사이',
  charge: '상해',
  client: { id: 'CLIENT_SIG_CONTACT', name: '의뢰인', role: '피고인' },
  briefing: [
    '공동 작업장에서 정산 문제로 말다툼이 있었다. 그 뒤 한 사람이 넘어져 오른쪽 손목을 다쳤다.',
    '검찰은 목격 진술과 진단서를 근거로, 피고인이 피해자를 밀어 다치게 했다며 상해로 기소했다.',
    '의뢰인은 “말다툼은 했지만 몸을 건드린 적은 없다”고 한다.'
  ],
  clientStatements: [
    { id: 'CS_SIG_INITIAL', text: '말다툼은 했지만 몸을 건드린 적은 없어요.' },
    { id: 'CS_SIG_REINTERVIEW', requiresCard: 'CARD_SIG_CONTACT', text: '…어깨를 한 번 민 건 맞습니다. 바로 다시 서 있었고, 그 뒤로는 손대지 않았어요.' }
  ],
  prep: { budget: 4, unitLabel: '반나절', deadlineLabel: '제1회 공판까지 D-2' },
  investigations: [
    { id: 'INV_SIG_STATEMENT', title: '최초 진술 대조', cost: 1, blurb: '목격자가 사건 직후 경찰에서 한 진술을 법정 진술과 맞춰 본다.', grants: ['CARD_SIG_STATEMENT'] },
    { id: 'INV_SIG_SEQUENCE', title: '연속 영상 열람', cost: 1, blurb: '검찰이 정지 사진으로 낸 작업장 영상을 앞뒤로 이어서 본다.', grants: ['CARD_SIG_SEQUENCE'] },
    { id: 'INV_SIG_MEDICAL', title: '진료자료 확인', cost: 1, blurb: '진단서 뒤의 진료기록이 무엇을 말하고 무엇을 말하지 않는지 본다.', grants: ['CARD_SIG_MEDICAL'] },
    { id: 'INV_SIG_LAYOUT', title: '가림막 뒤 현장 동선 확인', cost: 1, blurb: '피해자가 넘어진 가림막 뒤 공간을 직접 살핀다.', grants: ['CARD_SIG_LAYOUT'] },
    { id: 'INV_SIG_CLIENT', title: '의뢰인 재면담', cost: 1, blurb: '처음 진술에서 빠진 것이 없는지 다시 묻는다.', grants: ['CARD_SIG_CONTACT'] },
    // 합의 상담. 준비 예산을 함께 쓰기 위해 조사 목록에 두지만, 화면에는 합의 제안 창에서만 열린다(services/demo-session.js).
    { id: 'INV_SIG_SETTLE', title: '합의 제안 검토 · 의뢰인 상담', cost: 1, blurb: '피해자 측 합의 제안을 의뢰인에게 설명하고 결정을 듣는다.', grants: [] }
  ],
  cards: [
    { id: 'CARD_SIG_STATEMENT', filing: 'none', title: '목격자 최초 진술', text: '“피고인이 팔을 뻗는 걸 봤다. 손이 닿는 순간은 피고인 등에 가려 정확히 못 봤다. 곧 가림막 뒤에서 넘어지는 소리가 났다.”', issue: ACT },
    { id: 'CARD_SIG_SEQUENCE', filing: 'required', title: '연속 영상', text: '피해자가 한 걸음 뒤로 밀렸다가 자세를 회복하고 가림막 뒤로 걸어간다. 접촉 순간은 기둥에 가려 보이지 않는다. 가림막 뒤 낙상은 화면 밖이다. 두 장면 사이 약 40초.', issue: CAUSE },
    { id: 'CARD_SIG_MEDICAL', filing: 'required', title: '진료기록', text: '오른쪽 손목 타박상. 넘어지며 손을 짚을 때 흔한 손상이라는 기재. 누가 어떤 동작으로 다치게 했는지 판단한 감정은 없다.', issue: CAUSE },
    { id: 'CARD_SIG_LAYOUT', filing: 'required', title: '가림막 뒤 현장 동선', text: '낙상 지점 바로 앞에 바퀴 달린 운반대와 밀린 바퀴 자국이 있다. 검찰 사진에는 이 구역이 없다. 이것만으로 원인을 확정하지는 않는다.', issue: CAUSE, rebuttal: true },
    { id: 'CARD_SIG_CONTACT', filing: 'none', title: '의뢰인 재면담', text: '의뢰인이 어깨를 한 번 민 사실을 인정했다. 상해의 원인까지 인정하지는 않는다.', issue: ACT }
  ],
  prosecutionExhibits: [
    { id: 'PX_SIG_STATEMENT', title: '목격자 진술조서(한지수)', witnessId: OBS, consentIssue: CAUSE, consentMemo: '조서: 팔을 뻗은 뒤 넘어지는 소리', content: '“팔을 뻗는 걸 봤고, 가림막 뒤에서 넘어지는 소리가 났다.” 손이 닿는 순간은 가려졌다는 기재가 있다.' },
    { id: 'PX_SIG_VIDEO', title: '현장 사진(정지 사진 2매)', content: '검찰은 피해자가 뒤로 밀리는 장면과 가림막 쪽으로 가는 장면을 정지 사진으로 냈다. 연속본에는 그 사이 약 40초가 있다.' },
    { id: 'PX_SIG_REPORT', title: '수사보고서(서동국)', witnessId: INV, consentIssue: CAUSE, consentMemo: '수사보고서: 밀침 → 낙상 → 상해로 정리', content: '서동국 경위가 사건 경위를 정리했다. 밀침, 낙상, 손목 상해의 순서로 기록되어 있다. 별도의 원인 감정은 없다.' },
    { id: 'PX_SIG_MEDICAL', title: '상해진단서', content: '오른쪽 손목 타박상, 2주 치료 소견. 원인 감정 기재 없음.' }
  ],
  issues: [
    { id: ACT, title: '밀침', question: '피고인이 피해자를 밀었는가?', baseline: 5,
      memo: { proven: '목격 진술 — 피고인이 피해자를 밀었다', shaken: '접촉 순간의 관찰에 의문 — 확인 필요', doubt: '밀침 사실 불확실 — 합리적 의심 남음' } },
    { id: CAUSE, title: '상해와의 연결', question: '그 밀침으로 손목 상해가 생겼는가?', baseline: 5,
      memo: { proven: '진단서·목격 — 밀침에서 상해로 이어짐', shaken: '낙상 경위에 의문 — 연결 확인 필요', doubt: '밀침과 손목 상해의 연결 불확실 — 합리적 의심 남음' } }
  ],
  bands: { proven: 5, doubt: 2 },
  // 엔진 판결(guilty/not_guilty)은 “공소사실(상해) 전체가 입증됐는가”만 뜻한다. 주문은 services/demo-outcome.js가 ko 팩으로 정한다.
  adjudication: { rule: 'all_required', required: [ACT, CAUSE],
    guilty: { title: '공소사실 판단', text: '재판부는 공소사실과 그 안에 포함된 사실을 차례로 판단하였다.' },
    notGuilty: { title: '공소사실 판단', text: '재판부는 공소사실과 그 안에 포함된 사실을 차례로 판단하였다.' } },
  credibility: { start: 3, max: 3, warnAtOrBelow: 1 },
  opening: {
    focus: [
      { id: 'F_SIG_BALANCED', title: '두 증인의 설명을 차례로 확인한다', time: { [OBS]: 2, [INV]: 2 }, text: '두 증인이 본 것과 판단한 것을 차례로 확인하겠습니다.' },
      { id: 'F_SIG_ACT', title: '목격자가 본 동작의 범위를 좁힌다', time: { [OBS]: 3, [INV]: 1 }, text: '목격자가 실제로 본 것이 어디까지인지 확인하겠습니다.' },
      { id: 'F_SIG_CAUSE', title: '밀침과 낙상 사이의 연결을 다툰다', time: { [OBS]: 1, [INV]: 3 }, text: '이 사건의 핵심은 두 장면 사이에 무슨 일이 있었는가입니다.' }
    ],
    stance: [
      { id: 'S_SIG_RESERVE', title: '접촉 경위는 기록으로 확인한다', text: '피고인은 공소사실을 다툽니다. 무슨 일이 있었는지는 기록으로 확인하겠습니다.' },
      { id: 'S_SIG_CONTACT', title: '밀침은 인정하고, 상해와의 연결은 다툰다', text: '피고인은 어깨를 한 번 민 사실을 인정합니다. 그러나 그 밀침이 손목 상해로 이어졌는지는 다툽니다.' },
      { id: 'S_SIG_DENY', title: '접촉한 적이 없다고 주장한다', text: '피고인은 피해자의 몸에 손을 댄 적이 없습니다.' }
    ],
    close: '검찰의 주장은 합리적 의심을 넘지 못할 것입니다.',
    caution: { unlessCard: 'CARD_SIG_CONTACT', text: '의뢰인은 “몸을 건드린 적은 없다”고 했습니다. 그 말을 다시 확인해 봤습니까?' }
  },
  lines: {
    trialOpen: [['JUDGE', '사건번호 2026고단917, 피고인에 대한 상해 사건 공판을 시작합니다.'], ['PROSECUTOR', '검찰은 목격 진술과 진단서로, 피고인이 피해자를 밀어 손목을 다치게 한 사실을 입증하겠습니다.']],
    crossStart: [['JUDGE', '변호인, 반대신문 하십시오.']],
    crossWarn: [['JUDGE', '변호인, 신문은 요점만 간결히 하십시오.']],
    crossTimeUp: [['JUDGE', '시간 관계상 반대신문은 여기까지 하겠습니다.']],
    crossStop: [['DEFENSE', '이상입니다.']],
    noRedirect: [['PROSECUTOR', '재주신문 없습니다.']],
    rebutPass: [['DEFENSE', '재반대신문 없습니다.']],
    witnessDone: [['JUDGE', '증인은 돌아가도 좋습니다.']],
    verdictLead: [['JUDGE', '지금부터 판결을 선고하겠습니다.']]
  },
  // 복기 “놓친 준비”: 해당 카드 없이 상해 연결이 의심에 이르지 못했을 때만 표시(엔진 review 규칙).
  missedPrep: [
    { card: 'CARD_SIG_SEQUENCE', issue: CAUSE, text: '연속 영상을 열람했다면 피해자가 다시 선 장면과 화면 밖의 낙상을 나눌 수 있었다.' },
    { card: 'CARD_SIG_MEDICAL', issue: CAUSE, text: '진료자료를 확인했다면 진단서가 원인을 감정한 자료가 아니라는 점을 짚을 수 있었다.' },
    { card: 'CARD_SIG_LAYOUT', issue: CAUSE, text: '가림막 뒤를 직접 살폈다면 검찰 사진에 없는 다른 낙상 경로를 제시할 수 있었다.' }
  ]
};

// ---------- 증인 공통 조각 ----------
const obsIntro = { type: 'lines', id: 'D_SIG_OBS_1', lines: [['PROSECUTOR', '증인은 사건 당시 어디에 있었습니까?'], [OBS, '같은 작업장에서 피고인 자리와 대여섯 걸음 떨어진 책상에 있었습니다.']] };
// 모두진술 입장에 따른 주신문. 엔진 v0.10의 when.stance 단계를 그대로 쓴다.
const obsDeny = { type: 'lines', id: 'D_SIG_OBS_DENY', when: { stance: 'S_SIG_DENY' },
  lines: [['PROSECUTOR', '변호인은 모두진술에서 피고인이 피해자 몸에 손을 댄 적이 없다고 했습니다. 증인, 피해자가 뒤로 밀리는 걸 봤지요?'], [OBS, '네. 피고인이 팔을 뻗었고 피해자가 뒤로 밀렸습니다.']],
  effects: [[ACT, 1]], credibility: -1, memo: '변호인 모두진술과 배치되는 목격 진술', tone: 'prosecution', conflict: true,
  missedUnlessCard: 'CARD_SIG_CONTACT', knownMemo: '의뢰인의 밀침 인정과 다른 모두진술 — 목격 진술과도 배치됨',
  missed: '의뢰인을 다시 만났다면 접촉 사실을 모두진술 전에 알았을 것이다.' };
const obsAdmit = { type: 'lines', id: 'D_SIG_OBS_ADMIT', when: { stance: 'S_SIG_CONTACT' },
  lines: [['PROSECUTOR', '변호인도 피고인이 어깨를 민 사실은 인정했습니다. 증인이 본 것도 그 장면이지요?'], [OBS, '네, 그 장면입니다.']],
  effects: [[ACT, 3]], memo: '변호인 측이 밀침 인정 — 접촉 사실은 양측 인정', tone: 'prosecution' };
const obsValid = { type: 'objection', id: 'OBJ_SIG_OBSERVER_VALID', proper: true, ground: '유도신문',
  question: ['PROSECUTOR', '그 팔 움직임이 피해자를 넘어뜨린 동작이었지요?'],
  sustained: { lines: [['DEFENSE', '이의 있습니다. 증인이 보지 않은 결론을 넣은 유도신문입니다.'], ['JUDGE', '인용합니다. 본 것을 물으십시오.'], ['PROSECUTOR', '…무슨 움직임을 보았습니까?'], [OBS, '피고인이 팔을 뻗는 걸 봤습니다.']],
    effects: [[CAUSE, 0]], memo: '유도신문 이의 인용 — 목격자는 본 동작만 진술', tone: 'defense' },
  pass: { lines: [[OBS, '네. 그 동작 뒤에 넘어지는 소리가 났으니까요.']], effects: [[CAUSE, 1]], missed: '목격자에게 보지 않은 낙상까지 연결하는 질문을 통과시켰습니다. 그 답변이 밀침과 상해의 연결을 뒷받침하는 기록으로 남았습니다.', memo: '목격자: 밀어서 넘어뜨렸다고 연결', tone: 'prosecution' } };
const obsInvalid = { type: 'objection', id: 'OBJ_SIG_OBSERVER_INVALID', proper: false, ground: '유도신문',
  question: ['PROSECUTOR', '현장에서 무엇을 보았는지 순서대로 말씀해 주십시오.'],
  sustained: null,
  overruled: { lines: [['DEFENSE', '이의 있습니다. 유도신문입니다.'], ['JUDGE', '기각합니다. 본 것을 자유롭게 설명하도록 묻는 질문입니다.'], [OBS, '피고인이 팔을 뻗었고, 피해자가 뒤로 밀렸다가 가림막 뒤로 갔습니다. 곧 넘어지는 소리가 났습니다.']],
    effects: [], credibility: -1, memo: '이의 기각 — 정당한 질문', tone: 'prosecution' },
  pass: { lines: [[OBS, '피고인이 팔을 뻗었고, 피해자가 뒤로 밀렸다가 가림막 뒤로 갔습니다. 곧 넘어지는 소리가 났습니다.']], memo: '목격자: 밀림 → 가림막 뒤 → 넘어지는 소리', tone: 'neutral' } };
const obsContact = { id: 'A_SIG_OBS_CONTACT', title: '의뢰인의 인정과 맞춰 본다', hint: '의뢰인 재면담', requiresAny: ['CARD_SIG_CONTACT'], points: [],
  byStance: { S_SIG_RESERVE: 0, S_SIG_CONTACT: 0, S_SIG_DENY: 0 },
  lines: [['DEFENSE', '의뢰인은 어깨를 한 번 민 사실을 인정했습니다. 증인이 본 팔 움직임에 관한 설명은 그대로입니까?'], [OBS, '네. 제가 본 움직임에 관한 설명은 그대로입니다.']],
  memo: '밀침 사실은 양측 인정 — 관찰 범위와 원인은 별개', tone: 'neutral',
  stanceConflict: { stance: 'S_SIG_DENY', lines: [['PROSECUTOR', '변호인은 모두진술에서 접촉 자체를 부인했습니다.'], ['JUDGE', '입장이 달라졌음을 기록하겠습니다.']], credibility: -1, memo: '접촉 전면 부인 뒤 밀침 인정 — 모두진술과 모순', tone: 'prosecution' } };
const obsPresses = (limitedSuccess) => [
  { id: 'P_SIG_OBS_LIMITED', kind: 'limited', title: '한정 결론을 요구한다', question: '증인이 직접 본 것은 팔을 뻗는 동작과 피해자가 밀리는 모습까지이고, 손이 닿는 순간은 보지 못했지요?', minPoints: 2,
    success: { lines: [[OBS, limitedSuccess]], delta: -1, memo: '목격자: 손이 닿는 순간은 직접 보지 못함', tone: 'defense' },
    fail: { lines: [[OBS, '어느 부분이 문제인지 먼저 짚어 주십시오. 저는 본 대로 말했습니다.']], delta: 1, memo: '목격자: 본 대로 말했다 — 진술 유지', tone: 'prosecution' } },
  { id: 'P_SIG_OBS_OVER', kind: 'overreach', title: '과한 결론을 요구한다', question: '그러면 피고인은 피해자에게 손도 대지 않았다는 말이군요?',
    fail: { lines: [[OBS, '아닙니다. 팔을 뻗었고 피해자가 밀렸습니다. 그건 제가 봤습니다.'], ['JUDGE', '변호인, 증언을 넘겨짚지 마십시오.']], delta: 2, credibility: -1, memo: '변호인 과욕 — 목격자가 밀침을 재확인', tone: 'prosecution' } }
];

const invIntro = { type: 'lines', id: 'D_SIG_INV_1', lines: [['PROSECUTOR', '증인은 이 사건에서 무엇을 했습니까?'], [INV, '현장 사진을 찍고, 피해자의 진단서와 목격 진술을 취합했습니다.']] };
const invInjury = { type: 'lines', id: 'D_SIG_INV_2', lines: [['PROSECUTOR', '피해자의 상처는 무엇이었습니까?'], [INV, '오른쪽 손목 타박상입니다. 사건 당일 진단서가 발급됐습니다.']], memo: '사건 당일 손목 타박상 진단', tone: 'prosecution' };
const invValid = { type: 'objection', id: 'OBJ_SIG_INVESTIGATOR_VALID', proper: true, ground: '의견을 묻는 신문',
  question: ['PROSECUTOR', '타박상이 있으니 그 밀침 때문에 다친 것이지요?'],
  sustained: { lines: [['DEFENSE', '이의 있습니다. 자료 취합 담당자에게 결론을 유도하고 있습니다.'], ['JUDGE', '인용합니다. 확인한 자료를 물으십시오.'], ['PROSECUTOR', '…진단서에 어떤 손상이 기재돼 있습니까?'], [INV, '손목 타박상입니다.']],
    effects: [[CAUSE, 0]], memo: '이의 인용 — 수사관은 자료 내용만 진술', tone: 'defense' },
  pass: { lines: [[INV, '네. 밀친 뒤 넘어져 다친 것으로 정리했습니다.']], effects: [[CAUSE, 1]], missed: '자료 취합 담당자에게 원인에 관한 의견을 묻는 질문을 통과시켰습니다. 밀침 때문에 상해가 생겼다는 답변이 기록에 남았습니다.', memo: '수사관: 밀침 → 낙상 → 상해로 정리', tone: 'prosecution' } };
const invInvalid = { type: 'objection', id: 'OBJ_SIG_INVESTIGATOR_INVALID', proper: false, ground: '유도신문',
  question: ['PROSECUTOR', '취합한 자료가 무엇인지 말씀해 주십시오.'],
  sustained: null,
  overruled: { lines: [['DEFENSE', '이의 있습니다. 유도신문입니다.'], ['JUDGE', '기각합니다. 본인이 취합한 자료를 묻는 질문입니다.'], [INV, '진단서, 현장 사진, 목격 진술입니다.']],
    effects: [], credibility: -1, memo: '이의 기각 — 정당한 질문', tone: 'prosecution' },
  pass: { lines: [[INV, '진단서, 현장 사진, 목격 진술입니다.']], memo: '수사관: 진단서·사진·목격 진술 취합', tone: 'neutral' } };
const invMedical = (answer) => ({ id: 'A_SIG_CAUSE_MEDICAL', title: '진료기록의 범위', hint: '진료기록', requiresAny: ['CARD_SIG_MEDICAL'], delta: -1, points: ['POINT_SIG_MEDICAL'],
  lines: [['DEFENSE', '진료기록은 상처를 기록한 것이지, 누가 어떤 동작으로 다치게 했는지 판단한 감정은 아니지요?'], [INV, answer]],
  memo: '진료기록: 상처는 확인 — 원인 감정은 아님', tone: 'defense' });
const invSequence = (answer) => ({ id: 'A_SIG_CAUSE_SEQUENCE', title: '두 장면 사이', hint: '연속 영상', requiresAny: ['CARD_SIG_SEQUENCE'], delta: -1, points: ['POINT_SIG_INTERVAL'],
  lines: [['DEFENSE', '연속 영상에서 피해자는 밀린 뒤 다시 서서 가림막 뒤로 걸어갑니다. 넘어지는 장면은 화면 밖이지요?'], [INV, answer]],
  memo: '영상: 피해자 자세 회복 — 낙상은 화면 밖', tone: 'defense' });
const invPresses = [
  { id: 'P_SIG_CAUSE_LIMITED', kind: 'limited', title: '한정 결론을 요구한다', question: '진료기록과 영상만으로는 밀침부터 낙상까지의 경위를 확인할 수 없지요?', minPoints: 2,
    success: { lines: [[INV, '네. 상처는 확인되지만, 그 사이 경위를 직접 보여주는 자료는 아닙니다.']], delta: -1, memo: '수사관: 밀침과 낙상 사이 경위는 미확인', tone: 'defense' },
    fail: { lines: [[INV, '진단서와 사진, 목격 진술을 함께 보면 경위는 정리됩니다. 어느 자료를 말씀하시는지 짚어 주십시오.']], delta: 1, memo: '수사관: 자료를 함께 보면 경위 정리됨', tone: 'prosecution' } },
  { id: 'P_SIG_CAUSE_OVER', kind: 'overreach', title: '과한 결론을 요구한다', question: '그러니까 손목 상처는 피고인과 아무 관계가 없다는 말이지요?',
    fail: { lines: [[INV, '그런 뜻이 아닙니다. 상처가 있었다는 사실은 그대로입니다.'], ['JUDGE', '변호인, 증언을 왜곡하지 마십시오.']], delta: 2, credibility: -1, memo: '변호인 과욕 — 수사관이 상처를 재확인', tone: 'prosecution' } }
];
const layoutRebuttal = { card: 'CARD_SIG_LAYOUT', title: '가림막 뒤 현장 동선 제시', delta: -1,
  lines: [['DEFENSE', '재반대신문입니다. 가림막 뒤 낙상 지점 바로 앞에 바퀴 달린 운반대와 밀린 바퀴 자국이 있었습니다. 이 경로를 검토했습니까?'], [INV, '…당시 취합한 진단서와 사진만으로는 그 경로까지 검토하지 못했습니다. 다른 낙상 경로도 살펴야 합니다.'], ['PROSECUTOR', '운반대가 있었다는 것만으로 원인이 확정되지는 않습니다.'], ['DEFENSE', '그렇습니다. 원인을 단정하려는 것이 아니라, 앞의 밀침만으로 설명할 수 있는지 묻는 것입니다.']],
  memo: '현장 동선: 검토되지 않은 다른 낙상 경로(운반대)', tone: 'defense' };

// ---------- 신참 검사 ----------
// 증인 준비가 덜 됐다: 주신문에서 관찰의 한계를 먼저 정리하지 않아, 최초 진술을 제시받으면 그 한계가 새로 드러난다.
// 재주신문은 이미 나온 진술을 반복할 뿐 복구하지 못한다(delta 0). 변호인의 의견 질문에 이의하지 않는다.
const novice = Object.assign({}, common, {
  prosecutorProfile: 'novice',
  roles: {
    judge: { id: 'JUDGE', name: '재판장', initial: '재' },
    prosecutor: { id: 'PROSECUTOR', name: '신참 검사', initial: '검', styleLabel: '임용 1년차' },
    defense: { id: 'DEFENSE', name: '변호인', initial: '변' }
  },
  witnesses: [
    { id: OBS, name: '목격자', role: '공동 작업자', initial: '목', issue: ACT,
      direct: [obsIntro,
        { type: 'lines', id: 'D_SIG_OBS_2', lines: [['PROSECUTOR', '무엇을 보았습니까?'], [OBS, '두 사람이 정산 문제로 언성을 높였고, 피고인이 피해자를 밀었습니다.']], memo: '목격자: 피고인이 피해자를 밀었다', tone: 'prosecution' },
        obsDeny, obsAdmit, obsValid, obsInvalid],
      approaches: [
        { id: 'A_SIG_OBS_SCOPE', title: '최초 진술과 대조', hint: '최초 진술', requiresAny: ['CARD_SIG_STATEMENT'], delta: -1, points: ['POINT_SIG_SCOPE'],
          lines: [['DEFENSE', '최초 진술서입니다. 당시에는 “손이 닿는 순간은 피고인 등에 가려 정확히 못 봤다”고 했지요?'], [OBS, '…네, 그렇게 말했습니다. 닿는 순간은 못 봤습니다. 팔을 뻗는 건 봤어요.']],
          memo: '목격자: 손이 닿는 순간은 가려져 못 봄', tone: 'defense' },
        { id: 'A_SIG_OBS_SEQUENCE', title: '영상과 대조', hint: '연속 영상', requiresAny: ['CARD_SIG_SEQUENCE'], delta: -1, points: ['POINT_SIG_FRAME'],
          lines: [['DEFENSE', '연속 영상에서도 접촉 순간은 기둥에 가려 보이지 않지요?'], [OBS, '네, 영상에서는 안 보이네요. 저는 팔이 뻗는 걸 봤습니다.']],
          memo: '영상에서도 접촉 순간은 가려짐', tone: 'defense' },
        obsContact,
        { id: 'A_SIG_OBS_PRESSURE', title: '기억을 추궁한다', hint: '자료 없이 가능', requiresAny: [], delta: 0, points: [],
          lines: [['DEFENSE', '그 순간을 정말 정확히 기억합니까? 착각일 수도 있지 않습니까?'], [OBS, '제가 본 것은 말씀드린 그대로입니다. 다른 경위를 뒷받침하는 자료가 있으면 보여 주십시오.']],
          memo: '자료 없는 추궁 — 목격자 진술 유지', tone: 'neutral' }
      ],
      presses: obsPresses('…네. 닿는 순간 자체는 못 봤습니다.'),
      redirect: [
        { id: 'RH_SIG_OBSERVER', when: { anyDefenseGain: true }, delta: 0,
          lines: [['PROSECUTOR', '그래도 피고인이 팔을 뻗는 건 보셨지요?'], [OBS, '네, 봤습니다.']],
          memo: '검사 재주신문 — 이미 나온 진술 반복', tone: 'neutral' }
      ] },
    { id: INV, name: '담당 수사관', role: '자료 취합 담당', initial: '조', issue: CAUSE,
      direct: [invIntro, invInjury, invValid, invInvalid],
      approaches: [
        invMedical('네. 상처의 진료기록입니다. 원인을 감정한 자료는 아닙니다.'),
        invSequence('네. 다시 선 뒤의 경위는 영상으로 확인할 수 없습니다.'),
        { id: 'A_SIG_CAUSE_OPINION', title: '원인 판단을 묻는다', hint: '자료 없이 가능', requiresAny: [], delta: 0, points: ['POINT_SIG_ROLE'],
          lines: [['DEFENSE', '증인, 피해자가 다시 선 뒤에 넘어졌다면 그 낙상이 밀침 때문인지 단정할 수 있습니까?'], [INV, '저는 자료를 취합했을 뿐, 원인을 판단한 사람은 아닙니다. 진단서와 사진으로 정리했습니다.']],
          memo: '수사관: 원인 판단은 자기 역할 밖', tone: 'neutral' }
      ],
      presses: invPresses,
      redirect: [
        { id: 'RH_SIG_CAUSE', when: { anyDefenseGain: true }, delta: 0,
          lines: [['PROSECUTOR', '그래도 사건 당일 손목을 다친 건 사실이지요?'], [INV, '네, 손목 타박상입니다.']],
          memo: '검사 재주신문 — 상처가 있었다는 진술 반복', tone: 'neutral',
          rebuttal: layoutRebuttal }
      ] }
  ]
});

// ---------- 베테랑 검사 ----------
// 증인 준비: 주신문에서 목격자가 본 것과 가려진 것을 먼저 나눠 말하게 해, 최초 진술을 제시받아도 새로 드러나는 한계가 없다.
// 이의: 자료 취합 담당자에게 원인 의견을 묻는 질문, 근거 없는 추궁을 즉시 막는다(질문 시간만 쓰이고 답은 없다).
// 재주신문: 흔들린 부분을 본 것/판단으로 나눠 다시 세운다(delta +1). 가림막 뒤 동선은 검찰도 조사하지 않았다.
const veteran = Object.assign({}, common, {
  prosecutorProfile: 'veteran',
  roles: {
    judge: { id: 'JUDGE', name: '재판장', initial: '재' },
    prosecutor: { id: 'PROSECUTOR', name: '노련한 공판검사', initial: '검', styleLabel: '공판 전담 10년차' },
    defense: { id: 'DEFENSE', name: '변호인', initial: '변' }
  },
  witnesses: [
    { id: OBS, name: '목격자', role: '공동 작업자', initial: '목', issue: ACT,
      direct: [obsIntro,
        { type: 'lines', id: 'D_SIG_OBS_2', lines: [['PROSECUTOR', '본 것과 들은 것을 나눠서 말씀해 주십시오.'], [OBS, '피고인이 팔을 뻗자 피해자가 뒤로 밀렸습니다. 손이 닿는 순간은 피고인 등에 가려졌지만, 밀리는 모습은 바로 이어서 봤습니다. 넘어진 건 가림막 뒤라 소리만 들었습니다.']], memo: '목격자: 팔을 뻗자 밀림 — 본 것과 들은 것을 구분', tone: 'prosecution' },
        obsDeny, obsAdmit, obsValid, obsInvalid],
      approaches: [
        { id: 'A_SIG_OBS_SCOPE', title: '최초 진술과 대조', hint: '최초 진술', requiresAny: ['CARD_SIG_STATEMENT'], delta: 0, points: ['POINT_SIG_SCOPE'],
          lines: [['DEFENSE', '최초 진술서입니다. 당시에는 “손이 닿는 순간은 피고인 등에 가려 정확히 못 봤다”고 했지요?'], [OBS, '네, 그 진술 그대로입니다. 오늘도 같은 말씀을 드렸습니다. 팔을 뻗는 동작과 피해자가 밀리는 모습은 이어서 봤습니다.']],
          memo: '최초 진술 — 주신문에서 이미 밝힌 한계와 같음', tone: 'neutral' },
        { id: 'A_SIG_OBS_SEQUENCE', title: '영상과 대조', hint: '연속 영상', requiresAny: ['CARD_SIG_SEQUENCE'], delta: -1, points: ['POINT_SIG_FRAME'],
          lines: [['DEFENSE', '연속 영상에서도 접촉 순간은 기둥에 가려 보이지 않지요?'], [OBS, '영상에서는 가려져 있습니다. 피해자가 뒤로 밀리는 장면은 영상에도 있습니다.']],
          memo: '영상에서도 접촉 순간은 가려짐', tone: 'defense' },
        obsContact,
        { id: 'A_SIG_OBS_PRESSURE', title: '기억을 추궁한다', hint: '자료 없이 가능', requiresAny: [], delta: 0, points: [],
          lines: [['DEFENSE', '그 순간을 정말 정확히 기억합니까? 착각일 수도 있지 않습니까?'], ['PROSECUTOR', '이의 있습니다. 근거 없이 증인의 기억을 몰아세우는 질문입니다.'], ['JUDGE', '인용합니다. 변호인, 질문을 바꾸십시오.']],
          memo: '검사 이의 인용 — 질문 시간만 쓰임', tone: 'prosecution' }
      ],
      presses: obsPresses('네. 닿는 순간은 가려졌습니다. 그 앞뒤로 본 것은 말씀드린 그대로입니다.'),
      redirect: [
        { id: 'RH_SIG_OBSERVER', when: { anyDefenseGain: true }, delta: 1,
          lines: [['PROSECUTOR', '낙상 원인에 관한 판단은 빼고, 직접 본 것만 순서대로 말씀해 주십시오.'], [OBS, '피고인이 팔을 뻗었고, 피해자가 바로 뒤로 밀렸습니다. 닿는 순간은 가려졌지만 밀리는 모습은 이어서 봤습니다.']],
          memo: '검사 재주신문 — 본 것과 판단을 나눠 밀침 진술을 다시 세움', tone: 'prosecution' }
      ] },
    { id: INV, name: '담당 수사관', role: '자료 취합 담당', initial: '조', issue: CAUSE,
      direct: [invIntro, invInjury,
        { type: 'lines', id: 'D_SIG_INV_VIDEO', lines: [['PROSECUTOR', '영상에 보이는 것과 보이지 않는 것을 나눠 주십시오.'], [INV, '피해자가 뒤로 밀린 뒤 다시 서는 모습까지 보입니다. 가림막 뒤는 화면 밖입니다.']], memo: '수사관: 영상의 범위를 먼저 밝힘', tone: 'neutral' },
        invValid, invInvalid],
      approaches: [
        invMedical('네. 진료기록은 상처를 기록한 것입니다. 원인은 현장 자료와 함께 봐야 합니다.'),
        invSequence('네. 다시 서는 모습까지 보이고, 가림막 뒤는 화면 밖입니다. 그 뒤 경위는 영상만으로 정할 수 없습니다.'),
        { id: 'A_SIG_CAUSE_OPINION', title: '원인 판단을 묻는다', hint: '자료 없이 가능', requiresAny: [], delta: 0, points: [],
          lines: [['DEFENSE', '증인, 피해자가 다시 선 뒤에 넘어졌다면 그 낙상이 밀침 때문인지 단정할 수 있습니까?'], ['PROSECUTOR', '이의 있습니다. 자료 취합 담당자에게 확인 범위를 넘는 인과관계 의견을 묻고 있습니다.'], ['JUDGE', '인용합니다. 변호인, 확인한 자료와 그 한계를 물으십시오.']],
          memo: '검사 이의 인용 — 질문 시간만 쓰임', tone: 'prosecution' }
      ],
      presses: invPresses,
      redirect: [
        { id: 'RH_SIG_CAUSE', when: { anyDefenseGain: true }, delta: 1,
          lines: [['PROSECUTOR', '영상에서 피해자가 다시 선 것은 확인됩니다. 그렇다고 앞선 밀침이 이후 낙상에 영향을 주지 않았다고 단정할 수 있습니까?'], [INV, '아닙니다. 피해자가 다시 선 모습만으로는 이후 낙상에 밀침의 영향이 없었다고 단정할 수 없습니다.']],
          memo: '검사 재주신문 — “회복만으로 밀침 영향 배제 불가”', tone: 'prosecution',
          rebuttal: layoutRebuttal,
          missed: '가림막 뒤 현장 동선을 조사했다면 검사의 수습에 별도 자료로 답할 수 있었다.' }
      ] }
  ]
});

// ---------- 데모 사건 파일(시작 화면·합의·결과 문구) ----------
// DEMO procedure metadata; persistent case/card/witness IDs stay intact.
veteran.witnesses.forEach(w => w.redirect.forEach(r => {
  if (r.rebuttal) r.preparedAgainst = [r.rebuttal.card];
}));
const investigationScenes = {
  INV_SIG_STATEMENT: ['한지수가 처음 남긴 진술을 다시 읽었습니다.', '팔의 움직임과 실제 접촉을 구분한 대목에 표시를 했습니다.'],
  INV_SIG_SEQUENCE: ['정지 사진 앞뒤의 영상을 끊지 않고 확인했습니다.', '피해자가 자세를 회복한 뒤 가림막으로 걸어가는 장면을 따로 정리했습니다.'],
  INV_SIG_MEDICAL: ['진단서와 그 뒤의 진료기록을 나란히 펼쳤습니다.', '상처에 관한 기재와 원인에 관한 판단을 구분해 적었습니다.'],
  INV_SIG_LAYOUT: ['작업실의 가림막 뒤로 돌아가 낙상 지점을 살폈습니다.', '검찰 사진 밖에 있는 운반대와 바퀴 자국을 현장 사진으로 남겼습니다.'],
  INV_SIG_CLIENT: ['정민호 씨를 다시 만나 접촉 순간을 천천히 물었습니다.', '한동안 말을 멈추던 정민호 씨가 처음과 다른 이야기를 꺼냈습니다.']
};
common.investigations.forEach(v => { v.resultLines = investigationScenes[v.id] || []; });
const procedure = {
  closingChoices: [
    { id: 'FINAL_SIG_ACQUIT', title: '무죄 주장', text: '밀침 자체가 합리적 의심 없이 입증되지 않았으므로 무죄를 선고해 주십시오.', basis: 'act' },
    { id: 'FINAL_SIG_CAUSE', title: '상해 연결 부정 + 예비적으로 선처 호소', text: '밀침과 상해의 연결은 입증되지 않았습니다. 예비적으로 피고인의 사정을 살펴 선처해 주십시오.', basis: 'cause' },
    { id: 'FINAL_SIG_MERCY', title: '선처 호소만', text: '피고인의 사정과 피해 회복 노력을 살펴 선처해 주십시오.', basis: 'sentence' }
  ],
  finalStatements: {
    S_SIG_CONTACT: { agreed: '어깨를 민 행동은 잘못했습니다. 합의한 약속을 지키고 다시는 이런 일이 없도록 하겠습니다.', none: '어깨를 민 것은 잘못했습니다. 아직 피해 회복에 이르지 못한 점이 마음에 걸립니다.' },
    S_SIG_DENY: { agreed: '몸에 손을 댄 적은 없다는 말씀은 같습니다. 다툼에 대해서는 사과했고 합의한 약속을 지키겠습니다.', none: '몸에 손을 댄 적은 없다는 제 말씀을 살펴 주십시오. 다툼이 여기까지 온 것이 괴롭습니다.' },
    S_SIG_RESERVE: { agreed: '그날 경위는 기록으로 살펴 주십시오. 합의한 약속을 지키며 일을 이어 가고 싶습니다.', none: '그날 무슨 일이 있었는지 기록을 살펴 주십시오. 다시 차분히 일할 수 있기를 바랍니다.' }
  }
};
const demoCase = {
  procedure,
  presentation: {
    title: '작업실 정산 다툼 상해 사건',
    client: { name: '정민호', age: 38, detail: '프리랜서 영상 편집자 · 작업실 공동 운영자' },
    victim: { name: '오태윤', age: 41, role: '피해자 · 작업실 공동 운영자', situation: '오태윤 씨는 손목 부상으로 3주째 편집 작업을 못 하고 있습니다.' },
    witnesses: {
      W_SIG_OBSERVER: { name: '한지수', role: '목격자 · 공동 작업자', detail: '34세 · 디자이너', initial: '한' },
      W_SIG_INVESTIGATOR: { name: '서동국', role: '담당 수사관 · 경위', detail: '관할 경찰서 형사팀', initial: '서' }
    },
    prosecutors: {
      novice: { name: '윤가람', role: '신참 검사', initial: '윤' },
      veteran: { name: '최형석', role: '노련한 공판검사', initial: '최' }
    },
    stakes: {
      convicted: '정민호 씨는 다음 달 방송 외주 계약 갱신을 앞두고, 계약서의 “형사처벌 이력 시 해지” 조항이 걱정입니다.',
      cleared: '정민호 씨는 이번 사건의 형사처벌 이력으로 계약이 끊길 걱정을 덜고, 방송 외주 계약을 유지합니다.'
    },
    consultation: {
      location: 'office_lounge',
      speakers: [
        { id: 'CLIENT_SIG_CONTACT', name: '정민호', detail: '38세 · 프리랜서 영상 편집자', initial: '정' },
        { id: 'DEFENSE', name: '변호인', detail: '당신', initial: '변' }
      ],
      lines: [
        { speaker: 'CLIENT_SIG_CONTACT', text: '저는 프리랜서 영상 편집자입니다. 오태윤 씨와 작업실을 같이 운영하는데, 정산 문제로 말다툼을 했어요.' },
        { speaker: 'DEFENSE', text: '우선 앉으세요. 서두르지 않으셔도 됩니다. 그날 어떤 일이 있었는지 말씀해 주세요.' },
        { speaker: 'CLIENT_SIG_CONTACT', text: '말이 좀 심하게 오가긴 했습니다. 그래도 몸은 건드리지 않았어요.' },
        { speaker: 'CLIENT_SIG_CONTACT', text: '태윤 씨가 넘어져 손목을 다쳤다고 하더라고요. 검찰에서는 제가 밀어서 그렇게 됐다며 상해로 기소했습니다.' },
        { speaker: 'DEFENSE', text: '같은 작업실을 쓰는 한지수 씨의 진술과 진단서가 나와 있네요. 민호 씨 말씀도 듣고, 자료가 어디까지 확인해 주는지 살펴보겠습니다.' },
        { speaker: 'CLIENT_SIG_CONTACT', text: '다음 달에 방송 외주 계약을 갱신해야 해요. 계약서에 “형사처벌 이력 시 해지”라고 적혀 있어서, 일을 계속할 수 있을지 걱정입니다.' },
        { speaker: 'CLIENT_SIG_CONTACT', text: '합의 이야기도 들었습니다. 돈을 드리면 재판까지 끝나는 건가요?' },
        { speaker: 'DEFENSE', text: '합의해도 재판은 계속될 수 있어요. 합의 조건과 걱정하시는 계약 조항을 함께 살펴보겠습니다. 설명을 들으신 뒤 결정하시죠.' }
      ],
      tasks: ['반나절 4번을 나누어 자료를 조사하고, 검사 측 증인에게 물을 내용을 준비하세요.', '피해자 측 합의 제안을 검토해 정민호 씨에게 조언하세요. 수락 여부는 정민호 씨가 결정합니다.']
    },
    memo: {
      background: ['혐의는 상해입니다. 정민호 씨가 오태윤 씨를 밀어 손목을 다치게 했다는 사건입니다.', '두 사람은 함께 운영하는 작업실에서 정산 문제로 말다툼을 했습니다.', '그 뒤 오태윤 씨가 넘어져 오른쪽 손목을 다쳤습니다.'],
      people: ['정민호(38세): 프리랜서 영상 편집자. 다음 달 방송 외주 계약 갱신 예정이며 계약서에 “형사처벌 이력 시 해지” 조항이 있습니다.', '오태윤(41세): 피해자이자 작업실 공동 운영자. 정산 다툼 상대이며 손목 부상으로 3주째 편집 작업을 못 하고 있습니다.', '한지수(34세): 같은 작업실을 쓰는 디자이너이자 목격자.', '서동국 경위: 관할 경찰서 형사팀 소속 담당 수사관.', '검사: 신참 윤가람 또는 노련한 공판검사 최형석. 재판은 재판장이 진행합니다.'],
      prosecution: '한지수 씨의 목격 진술과 진단서를 근거로 정민호 씨의 밀침이 오태윤 씨의 상해로 이어졌다고 주장합니다.',
      client: '말다툼은 했지만 몸을 건드린 적은 없습니다.',
      tasks: ['당신은 정민호 씨의 변호인입니다. 반나절 4번의 시간을 나누어 자료를 조사하세요.', '준비한 자료로 검사 측 증인에게 질문하고, 직접 본 사실과 판단을 구분하세요.', '합의 제안을 검토하고 정민호 씨에게 조언하세요. 수락 여부는 정민호 씨가 결정합니다.'],
      closing: '무죄만이 좋은 결과는 아닙니다. 준비와 신문에 따라 결과가 달라집니다.'
    }
  },
  id: common.id,
  version: common.version,
  packId: 'ko',
  title: common.title,
  file: {
    kicker: '대표 사건 · 직접 변론',
    summary: '정산을 둘러싼 말다툼 뒤 한 사람이 넘어져 손목을 다쳤다. 검찰은 피고인의 밀침이 상해로 이어졌다고 본다.',
    hint: '자료를 준비하고, 증인이 본 것과 추측한 것을 나눠 물어보세요.'
  },
  // 판정 해석에 필요한 쟁점 연결. 서비스는 사건 ID가 아니라 이 값으로 동작한다.
  charge: { offense: 'injury', actIssue: ACT, causationIssue: CAUSE },
  prosecutors: [
    { id: 'novice', label: '신참 검사', sub: '임용 1년차' },
    { id: 'veteran', label: '노련한 공판검사', sub: '공판 전담 10년차' }
  ],
  prosecutorNote: '노련한 공판검사 = 어려움 모드, 첫 판은 신참 권장. 같은 사건이지만 검사가 질문에 대응하는 방식이 달라집니다.',
  variants: { novice, veteran },
  bandLabels: { proven: '입증됨', shaken: '다툼 있음', doubt: '의심' },

  // 재판 전 합의(§1.13). 상대는 검사가 아니라 피해자다. 의뢰인의 결정은 상담에서 고른 조언과 그 조건에 대한 의뢰인 자신의 반응이다.
  // 같은 조언에는 같은 반응(재현 가능). 재시도로 승낙을 끌어내는 루프는 없다: 상담은 한 번이다.
  settlement: {
    consultInvestigation: 'INV_SIG_SETTLE',
    offer: { from: '피해자 측 대리인', amount: '150만 원',
      text: '치료비와 위로금을 포함해 150만 원을 지급하면 합의서와 처벌불원서를 작성하겠습니다. 합의서에는 “피고인의 폭행으로 상해를 입었다”는 문구를 넣겠습니다.' },
    note: '피해자와의 합의입니다. 이 사건은 합의해도 형사재판이 계속됩니다.',
    clientQuestion: '돈을 드리면 재판도 없어지는 거죠?',
    lawyerAnswer: '아닙니다. 상해 사건은 합의해도 재판이 계속됩니다. 처벌을 원하지 않는다는 서류는 선고 때 고려됩니다. 다만 상해가 아니라 폭행만 인정된다면 그 서류로 사건이 끝날 수도 있습니다.',
    advice: [
      { id: 'ADV_SIG_AS_IS', title: '제안 그대로 합의를 권한다', accepted: false,
        clientReply: '돈은 드릴 수 있어요. 사과도 하고 싶고요. 그런데 “폭행으로 상해를 입었다”는 문구에는 서명 못 합니다. 재판에서 그걸 다툰다면서요. 이 조건이면 거절하겠습니다.' },
      { id: 'ADV_SIG_REVISE', title: '상해 인정 문구를 빼는 조건으로 합의를 권한다', accepted: true,
        clientReply: '그 조건이면 하겠습니다. 다툼이 있었던 건 사실이니 치료비는 드리고 싶어요.',
        victimReply: '사과와 치료비면 됩니다. 문구는 빼고 처벌불원서를 써 드리겠습니다.' },
      { id: 'ADV_SIG_DECLINE', title: '합의하지 말고 재판에 집중하자고 권한다', accepted: false,
        clientReply: '알겠습니다. 재판 결과를 보고 생각하겠습니다.' }
    ]
  },

  // 결과별 문구. {offense}{sentence}{article}{deadline}은 ko 팩 값으로 채운다.
  outcomes: {
    acquittal: { headline: '무죄', text: '피고인이 피해자를 밀었다는 사실 자체가 합리적 의심 없이 입증되지 않았습니다.',
      review: '목격자가 직접 본 범위를 최초 진술과 영상으로 좁혔습니다. 접촉 순간을 본 사람이 없다는 점이 기록에 남았습니다.' },
    dismissal: { headline: '공소기각', text: '밀침(폭행)은 인정되지만 손목 상해와의 연결은 입증되지 않았습니다. 폭행은 피해자가 처벌을 원하지 않으면 처벌할 수 없는 죄이고, {deadline}에 처벌불원서가 제출되어 있었습니다.',
      review: '재판 전 합의로 처벌불원서를 확보했고, 법정에서는 밀침과 상해 사이를 끊었습니다. 두 준비가 함께 맞물려 사건이 끝났습니다.' },
    assault: { headline: '유죄 · 폭행', text: '손목 상해와의 연결은 입증되지 않아 상해는 인정되지 않았습니다. 그 안에 포함된 밀침(폭행)만 유죄입니다.',
      review: '상해와의 연결은 끊었지만, 선고 전 처벌불원서가 없어 폭행으로 처벌받았습니다.' },
    injury: { headline: '유죄 · 상해', text: '밀침과 그로 인한 손목 상해가 모두 인정되었습니다.',
      reviewWithWill: '처벌불원서는 상해 사건에서 처벌을 막지 못하지만, 형을 정할 때 고려되었습니다.',
      review: '검찰이 연결한 밀침과 상해 사이를 기록으로 끊지 못했습니다.' }
  },
  // “다툼 있음”에서 유죄가 나왔을 때의 설명. {issue}는 쟁점 이름.
  shakenNote: '재판장 메모의 “{issue}” 판세는 “다툼 있음”이었습니다. 그러나 형사재판에서 그 사실을 인정하지 않으려면 합리적 의심이 남아야 합니다. 의문을 제기한 것만으로는 그 기준에 닿지 않았습니다.',
  shakenRecovered: '검사는 재주신문에서 이 부분을 보충했습니다: {memo}.',
  // “다음에 시도해 볼 것”: 위에서부터 처음 맞는 한 줄. 조건은 기록에서만 읽는다(검사 버전 이름을 읽지 않는다).
  nextTry: [
    { when: { outcome: 'acquittal' }, text: '같은 사건을 다른 검사 버전으로 해 보세요. 준비된 증인은 같은 자료에 다르게 답합니다.' },
    { when: { outcome: 'dismissal' }, text: '합의 없이 같은 신문을 하면 결과가 어떻게 달라지는지 확인해 보세요.' },
    { when: { outcome: 'assault' }, text: '선고 전에 처벌불원서가 있었다면 이 사건은 공소기각으로 끝났습니다. 재판 전 합의 제안을 다시 검토해 보세요.' },
    { when: { outcome: 'injury', hasCard: 'CARD_SIG_LAYOUT', lacksRebuttal: 'RH_SIG_CAUSE' }, text: '준비한 가림막 뒤 현장 동선 자료를 재반대신문에서 제시해 보세요.' },
    { when: { outcome: 'injury', recovered: CAUSE, lacksCard: 'CARD_SIG_LAYOUT' }, text: '검사가 재주신문으로 다시 세운 부분은 같은 자료로는 무너지지 않습니다. 검찰이 사진에 담지 않은 가림막 뒤를 조사해 보세요.' },
    { when: { outcome: 'injury', shaken: ACT }, text: '밀침에 대한 목격은 흔들려도 무너지지 않았습니다. 밀침은 인정하고 상해와의 연결을 다투는 길도 검토해 보세요.' },
    { when: { outcome: 'injury', lacksCard: 'CARD_SIG_SEQUENCE' }, text: '연속 영상에서 두 장면 사이를 확인하고, 진료기록이 무엇을 말하지 않는지 살펴보세요.' },
    { when: { outcome: 'injury', focusNot: 'F_SIG_CAUSE' }, text: '모두진술에서 상해와의 연결에 신문 시간을 더 배정해 보세요.' },
    { when: { outcome: 'injury' }, text: '검사의 질문에 정확히 이의를 제기하고, 확보한 자료로 증인이 인정할 수 있는 범위를 물어보세요.' }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = demoCase; else root.FirmDemoCase = demoCase;
})(typeof globalThis !== 'undefined' ? globalThis : this);
