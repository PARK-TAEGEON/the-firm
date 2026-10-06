'use strict';

// Node 콘텐츠 진입점. 작성된 문구·접근법을 구성한다. RNG·상태 변경·판정은 기존 계층이 담당한다.
const archetypes = require('./archetypes');
const twists = require('./twists');
const copies = require('./copy');
const hearingCopies = require('./hearing-copy');
const { varyCopy } = require('./sentence-variants');
const { buildContestedCase: buildTemplate } = require('../core/contested');
const { generateDailyCase: buildDailyTemplate } = require('../core/generate');

function getArchetype(id) {
  if (!Object.hasOwn(archetypes, id)) throw new Error(`콘텐츠가 없는 원형: ${id}`);
  return archetypes[id];
}

function buildContestedCase(archetypeId, seed) {
  const d = buildTemplate(getArchetype(archetypeId), seed, twists);
  const catalogIndex = require('./catalog-data.json').findIndex(r => r.id === archetypeId);
  const { factsFor, settingFor } = require('./catalog-facts');
  d.facts = catalogIndex >= 0 ? factsFor(archetypeId, d.truth, seed) : settingFor(archetypeId, seed);
  const copy = varyCopy(copies[archetypeId](d.truth, d.facts), archetypeId, seed, d.facts, d.truth);
  const hearing = typeof hearingCopies[archetypeId] === 'function' ? hearingCopies[archetypeId](d.facts) : hearingCopies[archetypeId];
  d.version = '0.0.7-gen-content';
  for (const key of ['title', 'charge', 'client', 'briefing', 'clientStatements']) d[key] = copy[key];
  if (!d.briefing.includes(require('./catalog-content').PRESS_HINT)) d.briefing.push(require('./catalog-content').PRESS_HINT);
  d.legalSystem = { id: 'ko', version: require('./packs/ko.json').version };
  d.prep.deadlineLabel = '첫 공판 전 조사';

  // core 수정 항목 2: focus는 이제 균형 1개 + 쟁점별 1개씩(2~3개), stance는 contest/admit/deny 3개다.
  Object.assign(d.opening.focus[0], hearing.focus.balanced);
  d.opening.focus.slice(1).forEach((f) => {
    const issueId = f.id.slice('F_'.length);
    Object.assign(f, hearing.focus[issueId]);
  });
  Object.assign(d.opening.stance[0], hearing.stance.contest);
  Object.assign(d.opening.stance[1], hearing.stance.admit);
  Object.assign(d.opening.stance[2], hearing.stance.deny);
  d.opening.close = copy.close;
  d.adjudication.guilty.text = copy.guilty;
  d.adjudication.notGuilty.text = copy.notGuilty;

  for (const issue of d.issues) {
    const c = copy.issues[issue.id];
    const h = hearing.witnesses[issue.id];
    Object.assign(issue, { title: c.title, memo: c.memo });
    const exhibit = d.prosecutionExhibits.find(item => item.id === `PX_${issue.id}`);
    if (exhibit) Object.assign(exhibit, {
      title: `${c.title} 관련 제출 자료`,
      content: c.evidence.map(e => `${e.cardTitle}: ${e.text}`).join('\n')
    });
    const w = d.witnesses.find(item => item.issue === issue.id);
    Object.assign(w, { name: c.name, role: c.role, initial: c.initial });
    if (c.speechStyle) w.speechStyle = c.speechStyle;
    Object.assign(w.direct[0], {
      lines: [['PROSECUTOR', c.directQuestion], [w.id, c.directAnswer]],
      memo: c.directMemo, tone: 'neutral'
    });

    // core 수정 항목 3: 이의 창 1개. core가 proper/improper 중 하나를 이미 골라 뒀다(objectionStep.proper,
    // 쟁점 인덱스로 교대) — hearing-copy의 대응 변형만 채운다. content는 어느 쪽을 쓸지 결정하지 않는다.
    const objectionStep = w.direct.find(step => step.type === 'objection');
    const variant = objectionStep.proper ? h.proper : h.improper;
    objectionStep.ground = variant.ground;
    objectionStep.question = ['PROSECUTOR', variant.question];
    if (objectionStep.proper) {
      objectionStep.sustained.lines = [
        ['DEFENSE', variant.objection], ['JUDGE', variant.ruling],
        ['PROSECUTOR', variant.corrected], [w.id, variant.answer]
      ];
      objectionStep.sustained.memo = variant.memo;
    } else {
      objectionStep.overruled.lines = [
        ['DEFENSE', variant.objection], ['JUDGE', variant.ruling], [w.id, variant.answer]
      ];
      objectionStep.overruled.memo = variant.memo;
    }
    objectionStep.pass.lines = [[w.id, objectionStep.proper ? variant.passed : variant.answer]];
    objectionStep.pass.memo = variant.passMemo;

    c.evidence.forEach((e, i) => {
      const inv = d.investigations.find(item => item.id === `INV_${issue.id}_${i}`);
      const card = d.cards.find(item => item.id === `CARD_${issue.id}_${i}`);
      const approach = w.approaches.find(item => item.id === `A_${issue.id}_${i}`);
      Object.assign(inv, { title: e.title, blurb: e.blurb });
      Object.assign(card, { title: e.cardTitle, text: e.text });
      Object.assign(approach, {
        title: e.title, hint: e.cardTitle, memo: e.memo,
        lines: [['DEFENSE', e.question], [w.id, e.answer]]
      });
      const resistance = c.resistance[i];
      w.approaches.push({
        id: `${approach.id}_UNSUPPORTED`, title: `${e.title} — 자료 없이 추궁`,
        hint: '근거 자료 없이 질문한다', requiresAny: [], delta: 0, points: [],
        lines: [['DEFENSE', resistance.question], [w.id, resistance.answer]],
        memo: `${e.cardTitle} 제시 없이 추궁 — 증인이 기존 진술을 유지`, tone: 'neutral'
      });
    });

    // core 수정 항목 4: presses[0]=limited(기존), presses[1]=overreach(신규) — hearing-copy의 overreach로 채운다.
    const [limited, overreach] = w.presses;
    Object.assign(limited, { title: c.press.title, question: c.press.question, hint: require('./catalog-content').PRESS_HINT });
    Object.assign(limited.success, { lines: [[w.id, c.press.success]], memo: c.press.successMemo });
    Object.assign(limited.fail, { lines: [[w.id, c.press.fail]], memo: c.press.failMemo });
    Object.assign(overreach, { title: h.overreach.title, question: h.overreach.question });
    Object.assign(overreach.fail, {
      lines: [[w.id, h.overreach.answer], ['JUDGE', h.overreach.ruling]],
      memo: h.overreach.memo
    });

    for (const r of w.redirect) {
      const twist = twists.find(t => `RH_${t.id}` === r.id);
      r.memo = `${twist.title}: ${twist.opponentRecovery.text}`;
      r.rebuttal.memo = `${twist.title}: ${twist.playerCounter.text}`;
      r.missed = `${twist.investigationCard.investigationTitle} 조사를 했다면 수습 주장의 범위를 다툴 수 있었다.`;
      const inv = d.investigations.find(item => item.id === twist.investigationCard.investigationId);
      inv.blurb = getArchetype(archetypeId).catalogId ? twist.investigationCard.cardTitle : `${twist.investigationCard.cardTitle} 자료를 확보해 진술과 대조한다.`;

      // core 수정 항목 2: 이 twist가 만든 stance 충돌 접근법(id: A_${issueId}_STANCE_${twist.id})에 문구를
      // 채운다. hearing-copy에는 이 조합 전용 대사가 없어 이미 작성된 twist 문구를 다시 구성한다 — 새
      // 사건별 대사를 짓지 않는다. 판사·검사의 절차적 반응 두 줄만 d.lines와 같은 성격의 보일러플레이트로
      // 둔다(사건마다 달라지는 내용이 아니다).
      const conflictApproach = w.approaches.find(item => item.id === `A_${issue.id}_STANCE_${twist.id}`);
      if (conflictApproach) {
        conflictApproach.title = `${twist.title} — 최초 입장과 다른 사실을 먼저 꺼낸다`;
        conflictApproach.hint = twist.investigationCard.cardTitle;
        conflictApproach.memo = `${twist.title} 관련 사실을 스스로 언급 — 최초 입장과의 관계는 별도 확인 필요`;
        conflictApproach.lines = [
          ['DEFENSE', `${twist.investigationCard.cardTitle} 확인 결과를 먼저 말씀드립니다.`],
          [w.id, twist.truthEffect]
        ];
        conflictApproach.stanceConflict.lines = [
          ['PROSECUTOR', '방금 진술은 개회사에서 밝힌 입장과 다릅니다.'],
          ['JUDGE', '입장이 달라졌음을 기록하겠습니다.']
        ];
        conflictApproach.stanceConflict.memo = `${twist.title} — 부인 입장과 상충하는 사실을 스스로 제시`;
      }
    }
  }

  if (catalogIndex >= 0) {
    const { render } = require('./catalog-content');
    getArchetype(archetypeId).twists_allowed.forEach((id, index) => {
      const card = d.cards.find(c => c.id === `CARD_${id}`);
      const active = d.twistsApplied.includes(id);
      card.text = render(require('./catalog-discoveries')[catalogIndex][index][active ? 0 : 1], d.facts);
      const approach = d.witnesses.flatMap(w => w.approaches).find(a => a.id.endsWith(`_STANCE_${id}`));
      if (approach) {
        // Counsel owns this assertion; a witness does not read an author's hidden-truth synopsis.
        approach.lines = [['DEFENSE', card.text]];
      }
    });
  }
  // Metadata describes the investigation result shown in the prose, not a future hearing outcome.
  d.cards.forEach(card => {
    const found = d.witnesses.some(w => w.redirect.some(r => r.rebuttal.card === card.id));
    card.assessment = { issueId: card.issue, kind: card.rebuttal ? 'response' : 'foundation',
      finding: card.rebuttal ? (found ? 'additional' : 'none') : 'observation' };
    const question = d.issues.find(i => i.id === card.issue).title.replace(/[?.]$/, '') + '?';
    card.text = `${question}\n${card.text}`;
  });

  d.lines = {
    trialOpen: [['JUDGE', `피고인의 ${copy.charge} 사건 공판을 시작합니다.`], ['PROSECUTOR', '검찰은 제출 자료와 증인 신문으로 공소사실을 입증하겠습니다.']],
    crossStart: [['JUDGE', '변호인, 반대신문 하십시오.']],
    crossWarn: [['JUDGE', '변호인, 확인할 사항을 간결하게 질문하십시오.']],
    crossTimeUp: [['JUDGE', '변호인, 예정된 신문 시간이 지났습니다. 질문을 마무리해 주십시오.']],
    crossStop: [['DEFENSE', '이상입니다.']],
    noRedirect: [['PROSECUTOR', '추가로 확인할 사항은 없습니다.']],
    rebutPass: [['DEFENSE', '재반대신문은 하지 않겠습니다.']],
    witnessDone: [['JUDGE', '증인은 돌아가도 좋습니다.']],
    verdictLead: [['JUDGE', '변론을 종결하고 판결을 선고하겠습니다.']]
  };
  d.missedPrep = d.cards.map(card => ({
    card: card.id, issue: card.issue,
    text: `${card.title} 자료를 확보했다면 해당 쟁점의 근거를 대조할 수 있었다.`
  }));
  return d;
}

function generateDailyCase(archetypeId, seed) {
  const archetype = getArchetype(archetypeId);
  const d = buildDailyTemplate(archetype, seed);
  // New daily summaries and contested hearings share the same hidden case, not two RNG orders.
  if (archetype.catalogId) {
    const hearing = buildContestedCase(archetypeId, seed);
    d.truth = hearing.truth;
    d.facts = hearing.facts;
    d.issueStrengths = Object.fromEntries(hearing.issues.map(i => [i.id, i.baseline]));
    d.fee.retainer = hearing.fee.retainer;
    d.legalSystem = hearing.legalSystem;
  }
  const summary = require('./packs/ko.json').archetypeRules[archetypeId].settlement.amountSummary;
  const amount = summary ? ' ' + summary.replace('{amount}', d.claimAmount) : '';
  d.outcomeSummary = `${archetype.title} — 착수금 ${d.fee.retainer}만원, 예상 기간 ${d.durationWeeks}주.${amount} 쟁점: ${archetype.issues.map(i => i.question).join(' ')}`;
  return d;
}

function resolveCase(archetypeId, seed, options = {}) {
  const { grade = 'daily', ...policy } = options;
  if (!['daily', 'contested'].includes(grade)) throw new Error('자동 진행 등급은 daily 또는 contested여야 합니다.');
  const d = buildContestedCase(archetypeId, seed);
  const { automaticCase } = require('../core/automatic');
  return { ...automaticCase(d, policy).player, grade };
}

module.exports = { archetypes, twists, buildContestedCase, generateDailyCase, resolveCase };
