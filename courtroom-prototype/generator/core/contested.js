(function (root) {
'use strict';
// GEN-001 core 수정 (2026-09-30) — 원형(+TwistModule 후보 목록) + 시드 → 승부 사건(ContestedCaseOutput).
// 기준 문서: docs/DESIGN-NOTES-2026-09.md §1.9~1.11, DEC-LITIGATION-031(N1~N7), DEC-LITIGATION-032.
//
// 이번 수정으로 추가된 것 (이전 버전과의 차이):
//   1) 준비 예산 < 조사 총비용 — 뭘 조사할지 고르는 선택이 생긴다.
//   2) 개회사 focus 2~3개(균형 + 쟁점별), stance 3개(contest/admit/deny). 활성화된 twist가 있는 쟁점에는
//      "잘못된 조합의 비용"(stance 충돌 접근법, credibility -1 → crossStart의 기존 warnAtOrBelow 로직으로
//      다음 신문 시간이 줄어든다)을 붙인다 — v0.10/SIGNATURE.md §1의 stanceConflict 패턴 그대로.
//   3) 증인별 주신문에 이의 창 1개. proper/improper를 쟁점 인덱스로 번갈아 섞는다.
//   4) 결론 요구(press)를 2종(limited + overreach)으로. limited는 그 쟁점의 접근법을 전부 써야
//      minPoints를 채운다 — "경계선 사건에서 성공 시 뒤집힘"의 실제 경로.
//   5) 원형별 RNG 스트림 분리(rng.js의 seedFor).
//   6) 한국 고유 명칭(재판장/검사/변호인, 유죄/무죄)을 KO_PACK 하나로 모았다(DEC-032 D3·D4 — 팩 로더까지는
//      만들지 않는다, 과잉 설계 금지).
//
// 대사(주신문 스크립트, 카드/조사 제목·본문, memo)는 여전히 전부 placeholder다 — content 단계(Codex)가
// generator/content/hearing-copy.js(focus/stance/이의/overreach)로 채운다. content 문구는 이 파일에서
// 만들지 않는다 — generator/content/index.js가 연결한다.

const rngModule = (typeof module !== 'undefined' && module.exports) ? require('./rng.js') : root.FirmGeneratorRng;
const { createRng, randRange, seedFor } = rngModule;
const formatModule = (typeof module !== 'undefined' && module.exports) ? require('./format.js') : root.FirmGeneratorFormat;
const { evaluateActivation } = formatModule;
const validateModule = (typeof module !== 'undefined' && module.exports) ? require('./validate.js') : root.FirmGeneratorValidate;
const { validateArchetype, validateTwist } = validateModule;
const generateModule = (typeof module !== 'undefined' && module.exports) ? require('./generate.js') : root.FirmGeneratorGenerate;
const { resolveTruth, deriveIssueStrengths } = generateModule;

// DEC-LITIGATION-032 D3: 한국 고유 명칭은 팩 데이터로 모은다. D4(과잉 설계 금지)에 따라 별도 파일·로더는
// 만들지 않는다 — 지금은 "코드 여기저기에 문자열로 섞어 박지 않고 한 자리에 모으기"만 한다.
const KO_PACK = {
  roles: {
    judge: { id: 'JUDGE', name: '재판장', initial: '재' },
    prosecutor: { id: 'PROSECUTOR', name: '검사', initial: '검' },
    defense: { id: 'DEFENSE', name: '변호인', initial: '변' }
  },
  outcomeLabels: { guilty: '유죄', notGuilty: '무죄' }
};

// 항목 1: 준비 예산 = 조사 총비용의 약 55~65% (최소 2). 게임 밸런스 상수라 KO_PACK과 달리 팩 데이터로
// 옮기지 않는다 — 법체계 고유 규칙이 아니다(DEC-032는 "한국 고유 규칙"만 데이터로 요구한다).
const PREP_BUDGET_MIN = 2;
const PREP_BUDGET_RATIO = 0.6;
const FOCUS_BALANCED_TIME = 2;

// archetype.twists_allowed 중 이 원형에 실제로 적용되고(appliesTo) 진실 조건(activation)을 만족하는 것만
// 고른다. availableTwists는 아직 구현되지 않은 twists_allowed id를 포함할 수 있다 — 그런 id는 조용히
// 무시한다(해당 콘텐츠가 아직 없다는 뜻이지 오류가 아니다). 형식이 깨진 후보(candidate)는 예외를 던진다.
function selectActivatedTwists(archetype, truth, availableTwists) {
  const candidates = (availableTwists || []).filter((twist) => {
    if (!archetype.twists_allowed.includes(twist.id)) return false;
    return twist.appliesTo.includes(archetype.id) || twist.appliesTo.includes('ANY');
  });
  return candidates.filter((twist) => {
    const errors = validateTwist(archetype, twist);
    if (errors.length) throw new Error(`selectActivatedTwists: 유효하지 않은 twist ${twist.id} — ${errors.join('; ')}`);
    return evaluateActivation(twist.activation, truth);
  });
}

// evidence 항목 하나 → 조사 1개 + 카드 1개 + 반대신문 접근법 1개. 순수 함수 — RNG 없음, authored 문구 없음.
function buildEvidenceTemplate(issueId, evidenceType, index) {
  const invId = `INV_${issueId}_${index}`;
  const cardId = `CARD_${issueId}_${index}`;
  const pointId = `POINT_${issueId}_${index}`;
  const approachId = `A_${issueId}_${index}`;
  return {
    investigation: {
      id: invId,
      title: `[조사] ${evidenceType} 확인 (PLACEHOLDER)`,
      cost: 1,
      blurb: '(placeholder — content 단계 authored 문구로 교체)',
      grants: [cardId]
    },
    card: { id: cardId, title: `[카드] ${evidenceType} (PLACEHOLDER)`, text: '(placeholder — content 단계 authored 문구로 교체)', issue: issueId },
    approach: {
      id: approachId,
      title: `[접근법] ${evidenceType} 반박 (PLACEHOLDER)`,
      hint: evidenceType,
      requiresAny: [cardId],
      delta: -1,
      points: [pointId],
      lines: [['DEFENSE', '(placeholder — content 단계 authored 대사로 교체)']],
      memo: `(placeholder memo — ${evidenceType})`,
      tone: 'defense'
    }
  };
}

// 항목 3: 이의 창 1개. proper=true면 인용될 유도신문(플레이어가 이의하면 질문이 좁혀진다), proper=false면
// 기각될 이의(플레이어가 이의해도 credibility만 깎인다) — 어느 쪽인지는 buildWitnessTemplate이 쟁점
// 인덱스로 교대해 섞는다.
function buildObjectionStep(issueId, witnessId, proper) {
  return {
    type: 'objection',
    id: `OBJ_${issueId}`,
    proper,
    ground: '(PLACEHOLDER)',
    question: ['PROSECUTOR', '(PLACEHOLDER — content 단계 authored 유도신문으로 교체)'],
    sustained: proper ? {
      lines: [['DEFENSE', '(PLACEHOLDER)'], ['JUDGE', '(PLACEHOLDER)'], ['PROSECUTOR', '(PLACEHOLDER)'], [witnessId, '(PLACEHOLDER)']],
      effects: [], memo: '(PLACEHOLDER)', tone: 'defense'
    } : null,
    overruled: !proper ? {
      lines: [['DEFENSE', '(PLACEHOLDER)'], ['JUDGE', '(PLACEHOLDER)'], [witnessId, '(PLACEHOLDER)']],
      effects: [], credibility: -1, memo: '(PLACEHOLDER)', tone: 'prosecution'
    } : null,
    pass: {
      lines: [[witnessId, '(PLACEHOLDER)']],
      effects: proper ? [[issueId, 1]] : [],
      memo: '(PLACEHOLDER)', tone: proper ? 'prosecution' : 'neutral'
    }
  };
}

// 항목 4: 결론 요구 2종. limited는 그 쟁점의 접근법을 전부 써야(minPoints = evidence 개수) 성공할 수
// 있다 — baseline이 경계선인 사건에서 이 성공이 doubt로 넘기는 실제 경로가 된다. overreach는 언제나
// 실패하고(engine pressSucceeds가 kind==='overreach'면 항상 false) 역효과(+2, credibility -1)를 낸다.
function buildLimitedPress(issueId, witnessId, evidenceCount) {
  return {
    id: `P_${issueId}_LIMITED`,
    kind: 'limited',
    title: '(PLACEHOLDER) 한정 결론을 요구한다',
    question: '(PLACEHOLDER)',
    minPoints: evidenceCount,
    success: { lines: [[witnessId, '(PLACEHOLDER)']], delta: -1, memo: '(PLACEHOLDER)', tone: 'defense' },
    fail: { lines: [[witnessId, '(PLACEHOLDER)']], delta: 1, memo: '(PLACEHOLDER)', tone: 'prosecution' }
  };
}
function buildOverreachPress(issueId, witnessId) {
  return {
    id: `P_${issueId}_OVER`,
    kind: 'overreach',
    title: '(PLACEHOLDER) 지나치게 몰아붙인다',
    question: '(PLACEHOLDER)',
    fail: { lines: [[witnessId, '(PLACEHOLDER)'], ['JUDGE', '(PLACEHOLDER)']], delta: 2, credibility: -1, memo: '(PLACEHOLDER)', tone: 'prosecution' }
  };
}

// ArchetypeIssue 하나 → witness 1개(1 issue = 1 witness).
function buildWitnessTemplate(issue, index) {
  const parts = issue.evidence.map((evidenceType, i) => buildEvidenceTemplate(issue.id, evidenceType, i));
  const witnessId = `W_${issue.id}`;
  const proper = index % 2 === 0; // 항목 3: 유효/무효 이의가 사건 안에서 섞이도록 교대.
  return {
    witness: {
      id: witnessId,
      name: '(PLACEHOLDER 증인명)',
      role: '(PLACEHOLDER 역할)',
      initial: '?',
      issue: issue.id,
      direct: [
        { type: 'lines', id: `D_${issue.id}_0`, lines: [['PROSECUTOR', '(placeholder — content 단계 authored 주신문 대사로 교체)']] },
        buildObjectionStep(issue.id, witnessId, proper)
      ],
      approaches: parts.map((p) => p.approach),
      presses: [buildLimitedPress(issue.id, witnessId, parts.length), buildOverreachPress(issue.id, witnessId)],
      redirect: [] // 활성화된 twist가 있으면 buildContestedCase가 채운다.
    },
    investigations: parts.map((p) => p.investigation),
    cards: parts.map((p) => p.card)
  };
}

// TwistModule → trial-case.js witnesses[].redirect[] 항목 하나 (activation을 만족할 때만 호출됨).
function buildRedirectFromTwist(twist) {
  const card = twist.investigationCard;
  return {
    redirect: {
      id: `RH_${twist.id}`,
      when: { anyDefenseGain: true },
      delta: twist.opponentRecovery.effect.delta,
      lines: [['PROSECUTOR', twist.opponentRecovery.text]],
      memo: `${twist.targetIssue} — 상대 수습`,
      tone: 'prosecution',
      rebuttal: {
        card: card.cardId,
        title: card.cardTitle,
        delta: twist.playerCounter.effect.delta,
        lines: [['DEFENSE', twist.playerCounter.text]],
        memo: `${twist.targetIssue} — 재반대(카드 확보 시)`,
        tone: 'defense'
      },
      missed: `${card.investigationTitle}을 하지 않았다면 이 재반대를 쓸 수 없다.`
    },
    investigation: { id: card.investigationId, title: card.investigationTitle, cost: card.cost, blurb: '(placeholder — content 단계 authored 문구로 교체)', grants: [card.cardId] },
    card: { id: card.cardId, title: card.cardTitle, text: card.cardText, issue: twist.targetIssue, rebuttal: true }
  };
}

// 항목 2: "잘못된 조합의 비용". 활성화된 twist가 있는 쟁점에만 붙는다 — 반전(=숨은 진실, §1.4)이 있어야
// "최초 입장과 다른 사실"이 존재하기 때문이다. requiresAny로 그 twist의 카드를 요구한다: 카드 없이는 이
// 접근법 자체를 쓸 수 없다(우연히 잘못 누를 수 없다 — 플레이어가 그 카드를 들고 일부러 꺼내야 한다).
// byStance는 전부 0(이 접근법 자체는 쟁점 점수를 바꾸지 않는다 — SIGNATURE.md §1의 A_SIG_OBS_CONTACT와
// 동일 설계) — 대신 stance가 S_DENY였다면 stanceConflict가 credibility -1을 낸다. crossStart의 기존
// warnAtOrBelow 로직이 그 credibility 하락을 다음 신문 시간 감소로 바꾼다(v0.10 방식 그대로, 새 엔진
// 로직을 만들지 않았다).
function buildStanceConflictApproach(twist, witnessId) {
  const card = twist.investigationCard;
  return {
    id: `A_${twist.targetIssue}_STANCE_${twist.id}`,
    title: '(PLACEHOLDER) 최초 입장과 다른 사실을 언급한다',
    hint: '(PLACEHOLDER)',
    requiresAny: [card.cardId],
    byStance: { S_CONTEST: 0, S_ADMIT: 0, S_DENY: 0 },
    points: [],
    lines: [['DEFENSE', '(PLACEHOLDER)'], [witnessId, '(PLACEHOLDER)']],
    memo: '(PLACEHOLDER)',
    tone: 'neutral',
    stanceConflict: {
      stance: 'S_DENY',
      lines: [['PROSECUTOR', '(PLACEHOLDER)'], ['JUDGE', '(PLACEHOLDER)']],
      credibility: -1,
      memo: '(PLACEHOLDER)',
      tone: 'prosecution'
    }
  };
}

// 항목 2: 개회사 focus 2~3개(균형 1 + 쟁점별 1개씩) + stance 3개(contest/admit/deny).
// balanced는 모든 증인에게 같은 시간을, 쟁점별 focus는 그 쟁점의 증인에게 +1·나머지에 -1(최소 1)을 준다
// — SIGNATURE.md §1의 2/2 균형 · 3/1 집중 패턴과 같다. 집중 focus를 골라야 그 증인에게 press를 쓸 시간이
// 남는다(균형 focus는 접근법 전부 쓰면 시간이 딱 떨어진다) — 항목 4 "결론 요구가 실제로 영향을 주는 경로".
function buildOpening(archetype, witnesses) {
  const focus = [];
  const balancedTime = {};
  witnesses.forEach((w) => { balancedTime[w.id] = FOCUS_BALANCED_TIME; });
  focus.push({ id: 'F_BALANCED', title: '(PLACEHOLDER)', text: '(PLACEHOLDER)', time: balancedTime });
  for (const issue of archetype.issues) {
    const time = {};
    witnesses.forEach((w) => {
      time[w.id] = w.issue === issue.id ? FOCUS_BALANCED_TIME + 1 : Math.max(1, FOCUS_BALANCED_TIME - 1);
    });
    focus.push({ id: `F_${issue.id}`, title: '(PLACEHOLDER)', text: '(PLACEHOLDER)', time });
  }
  const stance = [
    { id: 'S_CONTEST', title: '(PLACEHOLDER)', text: '(PLACEHOLDER)' },
    { id: 'S_ADMIT', title: '(PLACEHOLDER)', text: '(PLACEHOLDER)' },
    { id: 'S_DENY', title: '(PLACEHOLDER)', text: '(PLACEHOLDER)' }
  ];
  return { focus, stance, close: '(PLACEHOLDER)' };
}

// seed → {claimAmount, retainer, truth}. rng 소비 순서(claimAmount → retainer → truth)를 buildContestedCase와
// 공유한다 — 이 순서를 벗어나 truth만 따로 계산하면 같은 seed라도 다른 값이 나온다(테스트에서도 이 함수를
// 써야 한다). 항목 6: seedFor(seed, archetype.id)로 원형별 독립 스트림을 쓴다 — 같은 seed 번호라도
// 원형이 다르면 truth가 상관되지 않는다.
function resolveContestedInputs(archetype, seed) {
  const rng = createRng(seedFor(seed, archetype.id));
  const claimAmount = randRange(rng, archetype.claim_amount, true);
  const retainer = randRange(rng, archetype.fee.retainer, true);
  const truth = resolveTruth(archetype, rng);
  return { rng, claimAmount, retainer, truth };
}

function buildContestedCase(archetype, seed, availableTwists) {
  const archetypeErrors = validateArchetype(archetype);
  if (archetypeErrors.length) throw new Error(`buildContestedCase: 유효하지 않은 archetype — ${archetypeErrors.join('; ')}`);

  const { rng, claimAmount, retainer, truth } = resolveContestedInputs(archetype, seed);
  const issueStrengths = deriveIssueStrengths(archetype, truth, rng);
  const activatedTwists = selectActivatedTwists(archetype, truth, availableTwists || []);

  const issues = archetype.issues.map((issue) => ({
    id: issue.id,
    question: issue.question,
    baseline: issueStrengths[issue.id],
    // memo: 구조 검증용 placeholder. content 단계 authored 문구로 교체 예정.
    memo: {
      proven: `${issue.question} — 상대측 주장 쪽으로 정리됨`,
      shaken: `${issue.question} — 다툴 여지 확인됨`,
      doubt: `${issue.question} — 상대측 근거 부족`
    }
  }));

  const templates = archetype.issues.map((issue, i) => buildWitnessTemplate(issue, i));
  const witnessesByIssue = new Map(templates.map((t) => [t.witness.issue, t.witness]));
  const investigations = templates.flatMap((t) => t.investigations);
  const cards = templates.flatMap((t) => t.cards);

  for (const twist of activatedTwists) {
    const built = buildRedirectFromTwist(twist);
    const witness = witnessesByIssue.get(twist.targetIssue);
    witness.redirect.push(built.redirect);
    investigations.push(built.investigation);
    cards.push(built.card);
    witness.approaches.push(buildStanceConflictApproach(twist, witness.id)); // 항목 2
  }

  const witnesses = templates.map((t) => t.witness);
  const opening = buildOpening(archetype, witnesses);

  // 항목 1: 준비 예산 < 조사 총비용 — 전부 조사할 수 없으므로 어디를 조사할지 골라야 한다.
  const totalCost = investigations.reduce((sum, inv) => sum + inv.cost, 0);
  const budget = Math.max(PREP_BUDGET_MIN, Math.round(totalCost * PREP_BUDGET_RATIO));

  return {
    id: `${archetype.id}_CONTESTED_${seed}`,
    version: '0.0.2-gen',
    title: archetype.title,
    charge: archetype.title,
    client: { id: 'CLIENT_PLACEHOLDER', name: '(PLACEHOLDER)', role: archetype.side },
    briefing: ['(placeholder — content 단계 authored 사건 개요로 교체)'],
    seed,
    claimAmount,
    fee: { retainer },
    truth,
    twistsApplied: activatedTwists.map((t) => t.id),
    roles: KO_PACK.roles,
    prep: { budget, unitLabel: '반나절', deadlineLabel: '(placeholder)' },
    credibility: { start: 3, max: 3, warnAtOrBelow: 1 },
    issues,
    bands: { proven: 5, doubt: 2 },
    adjudication: {
      rule: 'all_required',
      required: archetype.issues.map((i) => i.id),
      guilty: { title: KO_PACK.outcomeLabels.guilty, text: '(placeholder)' },
      notGuilty: { title: KO_PACK.outcomeLabels.notGuilty, text: '(placeholder)' }
    },
    clientStatements: [{ id: 'CS_INITIAL', text: '(placeholder — content 단계 authored 의뢰인 진술로 교체)' }],
    prosecutionExhibits: archetype.issues.map((issue) => ({
      id: `PX_${issue.id}`,
      title: `[증거서류] ${issue.question} (PLACEHOLDER)`,
      content: '(placeholder — content 단계 authored 문구로 교체)'
    })),
    investigations,
    cards,
    opening,
    witnesses,
    // lines: services/trial.js가 고정으로 읽는 9개 키. 전부 placeholder — content 단계에서 authored 대사로 교체.
    lines: {
      trialOpen: [['JUDGE', `(placeholder) ${archetype.title} 공판을 시작합니다.`], ['PROSECUTOR', '(placeholder) 검찰 모두진술']],
      crossStart: [['JUDGE', '(placeholder) 변호인, 반대신문 하십시오.']],
      crossWarn: [['JUDGE', '(placeholder) 변호인, 신문은 요점만 간결히 하십시오.']],
      crossTimeUp: [['JUDGE', '(placeholder) 시간 관계상 반대신문은 여기까지 하겠습니다.']],
      crossStop: [['DEFENSE', '(placeholder) 이상입니다.']],
      noRedirect: [['PROSECUTOR', '(placeholder) 재주신문 없습니다.']],
      rebutPass: [['DEFENSE', '(placeholder) 재반대신문 없습니다.']],
      witnessDone: [['JUDGE', '(placeholder) 증인은 돌아가도 좋습니다.']],
      verdictLead: [['JUDGE', '(placeholder) 변론을 종결합니다. 판결을 선고하겠습니다.']]
    },
    missedPrep: []
  };
}

const contestedModule = {
  KO_PACK, selectActivatedTwists, buildEvidenceTemplate, buildObjectionStep, buildLimitedPress, buildOverreachPress,
  buildWitnessTemplate, buildStanceConflictApproach, buildOpening, resolveContestedInputs, buildContestedCase
};
if (typeof module !== 'undefined' && module.exports) module.exports = contestedModule; else root.FirmGeneratorContested = contestedModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
