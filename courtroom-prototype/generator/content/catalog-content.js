'use strict';
const rows = require('./catalog-data.json');
const scenes = require('./catalog-scenes');
const dialogue = require('./catalog-dialogue');
const ko = require('./packs/ko.json');
const archetypes = {}, twists = [], copies = {}, hearings = {};
const PRESS_HINT = '결론 요구는 이 증인에게 서로 다른 자료로 확인한 근거 2개 이상 필요';
// CATALOG order: delivery concerns intent; accounting classification concerns use;
// crossing location concerns care, and speech is distinct from lawful duty.
const twistTargets = [[0, 1, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
  [0, 1, 0], [0, 1, 1], [0, 1, 1], [1, 0, 1]];

rows.forEach((row, rowIndex) => {
  const issueIds = ['A', 'B'].map(letter => `ISSUE_${row.id.slice(5)}_${letter}`);
  const twistIds = row.twists.map((_, j) => `TWIST_${row.id.slice(5)}_${j + 1}`);
  archetypes[row.id] = {
    id: row.id, catalogId: row.catalogId, title: row.title, field: 'criminal_catalog', side: '피고인',
    fee: { retainer: row.retainer, success_pct: ko.criminalSuccessFee.range }, duration_weeks: [4, 12], claim_amount: [0, 0],
    issues: issueIds.map((id, j) => ({ id, question: row.issues[j], evidence: scenes[rowIndex][j].slice(2).map(e => e[0]) })),
    defenses: row.twists.map(t => t[3]), twists_allowed: twistIds,
    truth_params: { observation_a: [0, 1], observation_b: [0, 1], twist_1: [0, 1], twist_2: [0, 1], twist_3: [0, 1] },
    evidence_strength_rules: issueIds.map((issueId, j) => ({ issueId, truthParam: j ? 'observation_b' : 'observation_a', direction: 'direct', strengthRange: j ? [3, 5] : [3, 4], noise: 1 }))
  };
  row.twists.forEach((t, j) => {
    const targetIndex = twistTargets[rowIndex][j];
    const targetIssue = issueIds[targetIndex];
    twists.push({ id: twistIds[j], title: t[1].split(' ')[0] + ' — ' + t[0], appliesTo: [row.id], targetIssue,
      activation: { param: `twist_${j + 1}`, op: '>=', value: 0.6 }, truthEffect: t[0],
      investigationCard: { investigationId: `INV_${twistIds[j]}`, investigationTitle: t[1], cost: 1,
        cardId: `CARD_${twistIds[j]}`, cardTitle: t[1], cardText: t[0],
        absentText: '조사한 자료에서 추가 반전의 근거는 확인되지 않았다. 기본 쟁점의 자료는 별도로 검토한다.' },
      opponentRecovery: { text: dialogue[rowIndex][j][0], effect: { issue: targetIssue, delta: targetIndex ? 2 : 1 } },
      playerCounter: { text: dialogue[rowIndex][j][1], effect: { issue: targetIssue, delta: targetIndex ? -2 : -1 } }
    });
  });
  copies[row.id] = truth => {
    const issues = {};
    issueIds.forEach((id, j) => {
      const [role, statement, ...evidence] = scenes[rowIndex][j];
      const detailed = truth[j ? 'observation_b' : 'observation_a'] >= .6;
      const detail = detailed ? ' 확인한 구간은 별도 메모에 구체적으로 남겼습니다.' : ' 당시 확인한 내용을 요약해 진술했습니다.';
      issues[id] = {
        title: row.issues[j], name: j ? '한서림' : '윤도현', initial: j ? '한' : '윤', role,
        memo: { proven: `${role}의 자료 연결이 유지됐다.`, shaken: `${role}의 확인 범위를 다툰다.`, doubt: `${role}의 자료만으로 쟁점을 확정하기 어렵다.` },
        directQuestion: '당시 확인한 사실을 말씀해 주십시오.', directAnswer: statement + detail, directMemo: statement,
        evidence: evidence.map(([title, fact]) => ({ title: `${title} 확인`, blurb: `${title}의 확인 범위를 조사한다.`, cardTitle: title,
          text: fact, memo: fact, question: `${title}을 제시합니다. 이 자료의 확인 범위를 구분해 주시겠습니까?`,
          answer: `네. ${fact} 제가 확인한 사실에 관한 진술은 유지합니다.` })),
        resistance: evidence.map(() => ({ question: '말씀하신 판단 전체가 틀린 것 아닙니까?', answer: '제가 확인한 기억은 그대로입니다. 구체적인 자료를 제시해 주십시오.' })),
        press: { title: '자료의 확인 범위까지만 진술을 한정한다', question: '두 자료에서 확인한 한계 밖의 사실까지 직접 확인했다고 할 수는 없지요?',
          success: '네. 제가 확인한 범위는 여기까지입니다. 그 밖의 사실은 별도 확인이 필요합니다.', successMemo: '독립 자료의 한계를 연결해 진술 범위를 한정',
          fail: '그렇게 한정할 자료가 충분히 제시되지 않았습니다. 기존 진술을 유지합니다.', failMemo: '근거가 부족한 결론 요구에 증인이 기존 진술 유지' }
      };
    });
    return { title: row.title, charge: row.title.split(' — ')[0], client: { id: `CLIENT_${row.catalogId}`, name: '이도겸', role: '성인 의뢰인' },
      briefing: [`가상 사건: ${row.title}. 성인 관계자들의 기록을 대조한다.`, '유무죄 방어 실험이다. 소추 조건과 양형은 [확인 필요]이며 별도 종결 규칙을 적용하지 않는다.', PRESS_HINT],
      clientStatements: [{ id: `CS_${row.catalogId}`, text: '제가 설명한 경위와 자료가 다르면 다시 확인해 주십시오. 기억만으로 단정하지 않겠습니다.' }],
      close: '기록에 남은 사실과 한계를 쟁점별로 살펴 주십시오.', guilty: '제출된 기록에서 필수 쟁점의 입증이 유지됐습니다.',
      notGuilty: '필수 쟁점에 관한 기록에 합리적 의심이 남았습니다.', issues };
  };
  hearings[row.id] = { focus: { balanced: { title: '두 쟁점을 함께 확인한다', text: '각 자료의 확인 범위를 차례로 묻겠습니다.' } },
    stance: { contest: { title: '기록으로 다툰다', text: '확인된 기록에 따라 다투겠습니다.' },
      admit: { title: '관여한 경위부터 설명한다', text: '관여한 경위와 혐의 성립은 구분하겠습니다.' },
      deny: { title: '혐의를 부인한다', text: '혐의를 부인하며 각 자료를 검토하겠습니다.' } }, witnesses: {} };
  issueIds.forEach((id, j) => {
    hearings[row.id].focus[id] = { title: `${j ? '두 번째' : '첫 번째'} 쟁점에 집중한다`, text: row.issues[j] };
    const statement = scenes[rowIndex][j][1];
    hearings[row.id].witnesses[id] = {
      proper: { ground: '유도신문', question: '지금 말한 사실만으로 피고인의 혐의가 확실하다는 것이지요?',
        objection: '이의 있습니다. 답변의 범위를 넘어 결론을 유도합니다.', ruling: '확인한 사실을 먼저 물으십시오.',
        corrected: '직접 확인한 사실은 무엇입니까?', answer: statement, passed: `${statement} 저는 그 사실을 공소사실과 연결해 설명했습니다.`,
        memo: '관찰 사실의 범위로 질문을 좁힘', passMemo: '확인 사실과 공소사실을 연결한 진술' },
      improper: { ground: '유도신문', question: '직접 확인한 내용을 말씀해 주십시오.', objection: '이의 있습니다. 답을 유도합니다.',
        ruling: '확인 내용을 자유롭게 설명하는 질문입니다.', answer: statement, memo: '직접 확인 내용 유지', passMemo: '직접 확인 내용 설명' },
      overreach: { title: '진술 전체를 철회하라고 요구한다', question: '그러면 진술이 전부 틀린 것이지요?',
        answer: '아닙니다. 확인한 사실까지 취소하는 것은 아닙니다.', ruling: '구체적인 확인 범위를 물으십시오.', memo: '한계를 진술 전체의 부정으로 확대함' }
    };
  });
});
module.exports = { archetypes, twists, copies, hearings, PRESS_HINT };
