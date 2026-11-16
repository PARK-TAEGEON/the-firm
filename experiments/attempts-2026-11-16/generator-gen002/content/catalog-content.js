'use strict';
const rows = require('./catalog-data.json');
const scenes = require('./catalog-scenes');
const dialogue = require('./catalog-dialogue');
const voices = require('./catalog-voices');
const ko = require('./packs/ko.json');
const { factsFor } = require('./catalog-facts');
const { render } = require('./korean');
const archetypes = {}, twists = [], copies = {}, hearings = {};
const PRESS_HINT = '서로 다른 두 자료를 증인에게 확인한 뒤, 그 범위 안에서 답변을 요구할 수 있습니다.';
const twistTargets = [[0, 1, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 1, 0], [0, 1, 1], [0, 1, 1], [1, 0, 1]];
const issueTitles = [
  ['허락 없이 타인의 물건을 가져갔는가', '남의 물건임을 알고 자기 것처럼 취급하려 했는가'],
  ['누가 어떤 설명으로 대금 지급을 이끌었는가', '입금 당시 물건을 보내지 않고 돈을 가질 생각이었는가'],
  ['운영비를 업무상 보관·집행하는 지위였는가', '승인 범위를 벗어나 자기 것처럼 돈을 썼는가'],
  ['독자가 글의 대상을 알아볼 수 있었는가', '게시한 사실의 내용과 당시 인식·목적은 무엇인가'],
  ['보행자 접촉을 피할 주의의무를 위반했는가', '접촉이 주장된 상해를 일으켰는가'],
  ['실제로 거주 공간의 어떤 경계를 넘었는가', '출입 제한을 알면서 들어갔는가'],
  ['공적 기관에 신고한 구체적인 내용이 허위였는가', '허위임을 알면서 형사처분 또는 징계처분을 받게 하려 했는가'],
  ['발언 당시 점검이 적법한 직무집행이었는가', '발언이 직무 담당자에 대한 협박이었는가']
];
const focusStatements = [
  ['반출 장면에서 물건의 주인까지 알아볼 수 있었는지 다투겠습니다.', '입고 상태만으로 반출 당시 소유 인식을 정할 수 없습니다.'],
  ['계정 명의와 설명을 입력한 사람을 구분해야 합니다.', '미배송만으로 입금 당시 편취 의사를 단정할 수 없습니다.'],
  ['전표 입력과 자금 처분 권한은 별개의 사실입니다.', '지출 항목의 이름보다 실제 사용처를 보아야 합니다.'],
  ['게시 이전에 독자가 알고 있던 정보가 누구를 떠올렸는지에 영향을 줍니다.', '작성자가 본 정산 화면과 전체 글이 게시 경위를 설명합니다.'],
  ['보행자를 볼 수 있던 거리가 회피 가능성의 출발점입니다.', '접촉 뒤 통증과 그 통증 전부의 원인은 구분되어야 합니다.'],
  ['공용 출입문과 세대 문턱을 하나의 경계로 취급할 수 없습니다.', '회수 약속과 입장 당시 전달된 제한을 함께 살펴야 합니다.'],
  ['요약 조서보다 원문에서 허위라는 문장을 특정해야 합니다.', '원사건 종결이 신고자의 허위 인식을 대신 입증하지는 않습니다.'],
  ['공식 일정표만으로 모든 현장 조치의 권한을 확인할 수 없습니다.', '잘린 청취 구간을 이어서 발언 전체의 의미를 단정할 수 없습니다.']
];
const correctedAnswers = [
  '오수빈 씨가 오른손으로 가방 손잡이를 잡는 동작을 보았습니다.',
  '대화창에서 재고가 있다는 설명과 입금 계좌를 받았습니다.',
  '담당자 이름은 전표의 입력자 칸에서 확인했습니다.',
  '별명과 거래 금액을 읽고 제가 아는 사람을 떠올렸습니다.',
  '저는 세탁소 문 앞에 서서 차 앞쪽의 접촉을 봤습니다.',
  '관리실 앞에서 공용 출입문을 통과하는 모습을 확인했습니다.',
  '최종 조서의 확인란에 신고자 서명이 남아 있습니다.',
  '시설 점검 일정에 따라 방문했고 현장에서 대상 시설을 안내했습니다.'
];
const correctedQuestions = [
  '가방을 집는 손동작을 구체적으로 말씀해 주십시오.',
  '입금 전에 대화창으로 받은 정보는 무엇입니까?',
  '담당자 이름을 어느 칸에서 확인했습니까?',
  '증인 본인이 사람을 떠올릴 때 읽은 단서는 무엇입니까?',
  '증인이 서 있던 위치와 보았던 접촉 장면을 말씀해 주십시오.',
  '관리실에서 어느 출입문을 통과하는 모습을 보았습니까?',
  '최종 조서의 확인란에는 누구의 서명이 있습니까?',
  '방문 일정에 따라 현장에서 어떤 안내를 했습니까?'
];
const overreachRulings = [
  ['변호인, 물건 식별의 한계를 목격 장면의 부재로 바꾸지 마십시오.', '수리 상태를 증인의 의사 보증으로 확대하는 질문은 허용하지 않습니다.'],
  ['설명 작성자 문제와 구매자가 믿은 문장을 구분해 질문하십시오.', '송장 발급과 물품 접수는 나누어 확인하십시오.'],
  ['입력자의 지위가 남는다는 증언을 정확히 기록하겠습니다.', '업무 일정만으로 모든 지출을 승인받았다고 요구할 수는 없습니다.'],
  ['개별 독자의 이해를 부정하는 결론까지 요구하지 마십시오.', '게시판 용도와 증인이 겪은 일을 구별하십시오.'],
  ['시야의 차이를 접촉 장면 자체의 부정으로 확대하지 마십시오.', '원인 분석의 한계가 진료 기록 전체의 오류라는 뜻은 아닙니다.'],
  ['목격 범위가 한정됐을 뿐 출입 사실까지 철회된 것은 아닙니다.', '거주자가 정한 제한과 방문자의 인식은 따로 물으십시오.'],
  ['요약 조서와 원문을 구별해서 질문하십시오.', '종결 이유를 넘어 신고 전체의 진실성을 보증하게 할 수 없습니다.'],
  ['어떤 조치의 근거가 부족한지 특정하십시오.', '청취하지 못한 구간과 실제 들은 말을 혼동하지 마십시오.']
];
const leadTitle = s => s.replace(/^[A-Z]\d+\s*/, '').replace(/\.$/, '');
rows.forEach((row, ri) => {
  const issueIds = ['A', 'B'].map(letter => `ISSUE_${row.id.slice(5)}_${letter}`);
  const twistIds = row.twists.map((_, j) => `TWIST_${row.id.slice(5)}_${j + 1}`);
  archetypes[row.id] = {
    id: row.id, catalogId: row.catalogId, title: row.title, field: 'criminal_catalog', side: '피고인',
    fee: { retainer: row.retainer, success_pct: ko.criminalSuccessFee.range }, duration_weeks: [4, 12], claim_amount: [0, 0],
    issues: issueIds.map((id, j) => ({ id, question: issueTitles[ri][j], evidence: scenes[ri][j].slice(2).map(e => e[0]) })),
    defenses: row.twists.map(t => t[3]), twists_allowed: twistIds,
    truth_params: { observation_a: [0, 1], observation_b: [0, 1], twist_1: [0, 1], twist_2: [0, 1], twist_3: [0, 1] },
    evidence_strength_rules: issueIds.map((issueId, j) => ({ issueId, truthParam: j ? 'observation_b' : 'observation_a', direction: 'direct', strengthRange: j ? [3, 5] : [3, 4], noise: 1 }))
  };
  row.twists.forEach((t, j) => {
    const targetIndex = twistTargets[ri][j], targetIssue = issueIds[targetIndex];
    twists.push({ id: twistIds[j], title: leadTitle(t[1]), appliesTo: [row.id], targetIssue,
      activation: { param: `twist_${j + 1}`, op: '>=', value: .6 }, truthEffect: t[0],
      investigationCard: { investigationId: `INV_${twistIds[j]}`, investigationTitle: leadTitle(t[1]), cost: 1,
        cardId: `CARD_${twistIds[j]}`, cardTitle: leadTitle(t[1]), cardText: t[0],
        absentText: require('./catalog-discoveries')[ri][j][1] },
      opponentRecovery: { text: dialogue[ri][j][0], effect: { issue: targetIssue, delta: targetIndex ? 2 : 1 } },
      playerCounter: { text: dialogue[ri][j][1], effect: { issue: targetIssue, delta: targetIndex ? -2 : -1 } }
    });
  });
  copies[row.id] = (truth, providedFacts) => {
    const facts = providedFacts || factsFor(row.id, truth), voice = render(voices[ri], facts), issues = {};
    issueIds.forEach((id, j) => {
      const [name, role, speechStyle, directQuestion, directAnswer, evidenceQA, resistanceQA, press, extra, over, objection, ruling] = voice.witnesses[j];
      const evidence = scenes[ri][j].slice(2);
      issues[id] = { title: issueTitles[ri][j], name, role, speechStyle, initial: name[0],
        memo: { proven: `${name}: “${directAnswer}”`, shaken: evidence[0][1], doubt: `${name}: “${press[1]}”` },
        directQuestion, directAnswer, directMemo: directAnswer,
        evidence: evidence.map(([title, fact], i) => ({ title: `${title} 확인`, blurb: fact, cardTitle: title,
          text: `${facts.date} / ${facts.place}\n${fact}`, memo: evidenceQA[i][1], question: evidenceQA[i][0], answer: evidenceQA[i][1] })),
        resistance: resistanceQA.map(([question, answer]) => ({ question, answer })),
        press: { title: press[0], question: press[0], success: press[1], successMemo: press[1], fail: press[2], failMemo: press[2] }
      };
    });
    return { title: `${row.title} — ${facts.place}`, charge: row.title.split(' — ')[0],
      client: { id: `CLIENT_${row.catalogId}`, name: voice.client[0], role: voice.client[1] },
      briefing: [voice.briefing, PRESS_HINT], clientStatements: [{ id: `CS_${row.catalogId}`, text: voice.statement }],
      close: voice.close, guilty: voice.guilty, notGuilty: voice.notGuilty, issues };
  };
  hearings[row.id] = facts => {
    const voice = render(voices[ri], facts), h = { focus: { balanced: { title: voice.opening[0], text: voice.close } },
      stance: Object.fromEntries(['contest', 'admit', 'deny'].map((key, j) => [key, { title: voice.opening[j + 1], text: voice.opening[j + 1] }])), witnesses: {} };
    issueIds.forEach((id, j) => {
      const v = voice.witnesses[j], extra = v[8], over = v[9];
      h.focus[id] = { title: issueTitles[ri][j], text: focusStatements[ri][j] };
      const variant = { ground: '유도신문', question: extra[0], objection: v[10], ruling: v[11],
        corrected: correctedQuestions[ri], answer: j === 0 ? correctedAnswers[ri] : extra[1], passed: extra[1], memo: v[11], passMemo: extra[1] };
      h.witnesses[id] = { proper: variant, improper: variant,
        overreach: { title: over[0], question: over[0], answer: over[1], ruling: overreachRulings[ri][j], memo: over[1] } };
    });
    return h;
  };
});
module.exports = { archetypes, twists, copies, hearings, PRESS_HINT, render };
