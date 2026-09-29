(function (root) {
'use strict';
// GEN-001 2단계 — 원형(+TwistModule 후보 목록) + 시드 → 승부 사건(ContestedCaseOutput), trial-case.js 형식.
//
// 두 개의 생성원이 있다:
//   1) 기계적 템플릿(buildWitnessTemplate) — archetype.issues[].evidence 각 항목을
//      조사(investigation) → 카드(card) → 반대신문 접근법(approach) 한 세트로 변환한다. 항상 생성된다.
//   2) 활성화된 TwistModule(selectActivatedTwists) — activation을 만족하는 것만 골라 붙인다(2단계 항목 1
//      버그 수정). 하나도 만족하지 않으면 반전 없는 사건이 된다 — investigations/cards/redirect가
//      템플릿분만 남는다.
//
// 대사(주신문 스크립트, 카드/조사 제목·본문, memo)는 전부 placeholder다 — content 단계(Codex)가 채운다.
// 목표는 engine/trial.js의 validate()를 통과하는 구조를 기계적으로 만드는 것이다.

const rngModule = (typeof module !== 'undefined' && module.exports) ? require('./rng.js') : root.FirmGeneratorRng;
const { createRng, randRange } = rngModule;
const formatModule = (typeof module !== 'undefined' && module.exports) ? require('./format.js') : root.FirmGeneratorFormat;
const { evaluateActivation } = formatModule;
const validateModule = (typeof module !== 'undefined' && module.exports) ? require('./validate.js') : root.FirmGeneratorValidate;
const { validateArchetype, validateTwist } = validateModule;
const generateModule = (typeof module !== 'undefined' && module.exports) ? require('./generate.js') : root.FirmGeneratorGenerate;
const { resolveTruth, deriveIssueStrengths } = generateModule;

// archetype.twists_allowed 중 이 원형에 실제로 적용되고(appliesTo) 진실 조건(activation)을 만족하는 것만
// 고른다. availableTwists는 아직 구현되지 않은 twists_allowed id를 포함할 수 있다 — 그런 id는 조용히
// 무시한다(해당 콘텐츠가 아직 없다는 뜻이지 오류가 아니다). 형식이 깨진 후보(candidate)는 예외를 던진다 —
// 오탈자를 조용히 넘기지 않기 위해서다.
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

// ArchetypeIssue 하나 → witness 1개(1 issue = 1 witness). direct/press는 최소 구조만 갖춘 placeholder다.
function buildWitnessTemplate(issue) {
  const parts = issue.evidence.map((evidenceType, i) => buildEvidenceTemplate(issue.id, evidenceType, i));
  const witnessId = `W_${issue.id}`;
  return {
    witness: {
      id: witnessId,
      name: '(PLACEHOLDER 증인명)',
      role: '(PLACEHOLDER 역할)',
      initial: '?',
      issue: issue.id,
      direct: [{
        type: 'lines',
        id: `D_${issue.id}_0`,
        lines: [['PROSECUTOR', '(placeholder — content 단계 authored 주신문 대사로 교체)']]
      }],
      approaches: parts.map((p) => p.approach),
      presses: [{
        id: `P_${issue.id}_LIMITED`,
        kind: 'limited',
        title: '(placeholder) 한정 결론을 요구한다',
        question: '(placeholder — content 단계 authored 질문으로 교체)',
        minPoints: 1,
        success: { lines: [['WITNESS_PLACEHOLDER', '(placeholder)']], delta: -1, memo: '(placeholder)', tone: 'defense' },
        fail: { lines: [['WITNESS_PLACEHOLDER', '(placeholder)']], delta: 1, memo: '(placeholder)', tone: 'prosecution' }
      }],
      redirect: [] // 활성화된 twist가 있으면 buildContestedCase가 채운다.
    },
    investigations: parts.map((p) => p.investigation),
    cards: parts.map((p) => p.card)
  };
}

// TwistModule → trial-case.js witnesses[].redirect[] 항목 하나 (2단계 항목 1: activation을 만족할 때만 호출됨).
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

// seed → {claimAmount, retainer, truth}. rng 소비 순서(claimAmount → retainer → truth)를 buildContestedCase와
// 공유한다 — 이 순서를 벗어나 truth만 따로 계산하면 같은 seed라도 다른 값이 나온다(테스트에서도 이 함수를
// 써야 한다. 직접 resolveTruth(archetype, createRng(seed))를 부르면 안 된다).
function resolveContestedInputs(archetype, seed) {
  const rng = createRng(seed);
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

  const templates = archetype.issues.map(buildWitnessTemplate);
  const witnessesByIssue = new Map(templates.map((t) => [t.witness.issue, t.witness]));
  const investigations = templates.flatMap((t) => t.investigations);
  const cards = templates.flatMap((t) => t.cards);

  for (const twist of activatedTwists) {
    const built = buildRedirectFromTwist(twist);
    const witness = witnessesByIssue.get(twist.targetIssue);
    witness.redirect.push(built.redirect);
    investigations.push(built.investigation);
    cards.push(built.card);
  }

  const witnesses = templates.map((t) => t.witness);

  // opening.focus: 모든 witness에 양수 time이 있어야 하는 validate() 규칙을 기계적으로 만족시킨다.
  const focusTime = {};
  witnesses.forEach((w) => { focusTime[w.id] = 2; });
  const opening = {
    focus: [{ id: 'F_GEN_BALANCED', title: '(placeholder) 쟁점을 고르게 다룬다', time: focusTime, text: '(placeholder)' }],
    stance: [{ id: 'S_GEN_CONTEST', title: '(placeholder) 다툰다', text: '(placeholder)' }],
    close: '(placeholder)'
  };

  return {
    id: `${archetype.id}_CONTESTED_${seed}`,
    version: '0.0.1-gen',
    title: archetype.title,
    charge: archetype.title,
    client: { id: 'CLIENT_PLACEHOLDER', name: '(PLACEHOLDER)', role: archetype.side },
    briefing: ['(placeholder — content 단계 authored 사건 개요로 교체)'],
    seed,
    claimAmount,
    fee: { retainer },
    truth,
    twistsApplied: activatedTwists.map((t) => t.id),
    roles: {
      judge: { id: 'JUDGE', name: '재판장', initial: '재' },
      prosecutor: { id: 'PROSECUTOR', name: '검사', initial: '검' },
      defense: { id: 'DEFENSE', name: '변호인', initial: '변' }
    },
    prep: { budget: Math.max(1, investigations.length), unitLabel: '반나절', deadlineLabel: '(placeholder)' },
    credibility: { start: 3, max: 3, warnAtOrBelow: 1 },
    issues,
    bands: { proven: 5, doubt: 2 },
    adjudication: {
      rule: 'all_required',
      required: archetype.issues.map((i) => i.id),
      guilty: { title: '유죄', text: '(placeholder)' },
      notGuilty: { title: '무죄', text: '(placeholder)' }
    },
    prosecutionExhibits: [],
    investigations,
    cards,
    opening,
    witnesses,
    lines: {},
    missedPrep: []
  };
}

const contestedModule = { selectActivatedTwists, buildEvidenceTemplate, buildWitnessTemplate, resolveContestedInputs, buildContestedCase };
if (typeof module !== 'undefined' && module.exports) module.exports = contestedModule; else root.FirmGeneratorContested = contestedModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
