'use strict';

// Node 콘텐츠 진입점. 작성된 문구·접근법을 구성한다. RNG·상태 변경·판정은 기존 계층이 담당한다.
const archetypes = require('./archetypes');
const twists = require('./twists');
const copies = require('./copy');
const hearingCopies = require('./hearing-copy');
const { buildContestedCase: buildTemplate } = require('../core/contested');
const { generateDailyCase: buildDailyTemplate } = require('../core/generate');

function getArchetype(id) {
  if (!Object.hasOwn(archetypes, id)) throw new Error(`콘텐츠가 없는 원형: ${id}`);
  return archetypes[id];
}

function buildContestedCase(archetypeId, seed) {
  const d = buildTemplate(getArchetype(archetypeId), seed, twists);
  const copy = copies[archetypeId](d.truth);
  const hearing = hearingCopies[archetypeId];
  d.version = '0.0.3-gen-content';
  for (const key of ['title', 'charge', 'client', 'briefing', 'clientStatements']) d[key] = copy[key];
  d.prep.deadlineLabel = '첫 공판 전 조사';
  Object.assign(d.opening.focus[0], hearing.focus.balanced);
  Object.assign(d.opening.stance[0], hearing.stance.contest);
  d.opening.close = copy.close;
  d.adjudication.guilty.text = copy.guilty;
  d.adjudication.notGuilty.text = copy.notGuilty;

  for (const issue of d.issues) {
    const c = copy.issues[issue.id];
    Object.assign(issue, { title: c.title, memo: c.memo });
    const exhibit = d.prosecutionExhibits.find(item => item.id === `PX_${issue.id}`);
    if (exhibit) Object.assign(exhibit, {
      title: `${c.title} 관련 제출 자료`,
      content: c.evidence.map(e => `${e.cardTitle}: ${e.text}`).join('\n')
    });
    const w = d.witnesses.find(item => item.issue === issue.id);
    Object.assign(w, { name: c.name, role: c.role, initial: c.initial });
    Object.assign(w.direct[0], {
      lines: [['PROSECUTOR', c.directQuestion], [w.id, c.directAnswer]],
      memo: c.directMemo, tone: 'neutral'
    });
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
    const p = w.presses[0];
    Object.assign(p, { title: c.press.title, question: c.press.question });
    Object.assign(p.success, { lines: [[w.id, c.press.success]], memo: c.press.successMemo });
    Object.assign(p.fail, { lines: [[w.id, c.press.fail]], memo: c.press.failMemo });
    for (const r of w.redirect) {
      const twist = twists.find(t => `RH_${t.id}` === r.id);
      r.memo = `${twist.title}: ${twist.opponentRecovery.text}`;
      r.rebuttal.memo = `${twist.title}: ${twist.playerCounter.text}`;
      r.missed = `${twist.investigationCard.investigationTitle} 조사를 했다면 수습 주장의 범위를 다툴 수 있었다.`;
      const inv = d.investigations.find(item => item.id === twist.investigationCard.investigationId);
      inv.blurb = `${twist.investigationCard.cardTitle} 자료를 확보해 진술과 대조한다.`;
    }
  }

  d.lines = {
    trialOpen: [['JUDGE', `피고인의 ${copy.charge} 사건 공판을 시작합니다.`], ['PROSECUTOR', '검찰은 제출 자료와 증인 신문으로 공소사실을 입증하겠습니다.']],
    crossStart: [['JUDGE', '변호인, 반대신문 하십시오.']],
    crossWarn: [['JUDGE', '변호인, 확인할 사항을 간결하게 질문하십시오.']],
    crossTimeUp: [['JUDGE', '반대신문을 마치겠습니다.']],
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
  const amount = archetypeId === 'ARCH_CRIMINAL_ASSAULT' ? ` 합의금 참고액 ${d.claimAmount}만원.` : '';
  d.outcomeSummary = `${archetype.title} — 착수금 ${d.fee.retainer}만원, 예상 기간 ${d.durationWeeks}주.${amount} 쟁점: ${archetype.issues.map(i => i.question).join(' ')}`;
  return d;
}

module.exports = { archetypes, twists, buildContestedCase, generateDailyCase };
