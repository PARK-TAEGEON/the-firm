(function (root) {
'use strict';
// PORTFOLIO-002 변론 계획: 변호사 능력치 → 초안 → 공판 명령, 그리고 자동 공판의 다음 한 수.
// 순수 함수만 있다. 상태를 바꾸지 않고, 무작위가 없다. 엔진(vendor/)의 판정·수치는 건드리지 않는다.
// 여기의 수치는 실험용 authored 규칙이다(RULES.md P1~P7). Accepted DEC가 아니다.
const isNode = typeof module !== 'undefined' && module.exports;
const Case = isNode ? require('../vendor/court/data/demo-separated-moments.js') : root.FirmDemoCase;
const { SHEET } = isNode ? require('./case-sheet.js') : root.FirmCaseSheet;
const Bridge = isNode ? require('./bridge.js') : root.FirmBridge;

// P1. 변호사 능력치(1~20). 종합 점수는 없다. 넷 모두 공판에서 실제로 쓰인다.
const STATS = Object.freeze([
  { id: 'analysis', label: '기록 분석', use: '확인 항목 수 · 재반대신문 성공 확률' },
  { id: 'examine', label: '신문', use: '증인 질문 수 · 반대신문 성공 확률' },
  { id: 'court', label: '법정 대응', use: '유도신문에 스스로 이의를 낼 확률' },
  { id: 'negotiate', label: '협상', use: '초안의 합의 조언' }
]);
const LAWYERS = Object.freeze({
  kim: { id: 'kim', stats: { analysis: 15, examine: 11, court: 9, negotiate: 8 }, years: 4, note: '기록은 꼼꼼히 읽지만 법정에서는 판단을 넘긴다.' },
  lee: { id: 'lee', stats: { analysis: 12, examine: 17, court: 16, negotiate: 13 }, years: 15, note: '법정에 강하다. 대신 비싸다.' },
  park: { id: 'park', stats: { analysis: 13, examine: 9, court: 11, negotiate: 16 }, years: 3, note: '협상에 강하고 신문은 약하다.' }
});
const LAWYER_ORDER = Object.freeze(['kim', 'lee', 'park']);
const T = Object.freeze({ analysisBonus: 14, examineBonus: 15, courtSelf: 13, negotiateRevise: 13 });
// 사무소의 한 주 → 초안이 확인해 오는 항목 기본값(기록 검토 완료 시점).
const BASE_CHECKS = Object.freeze(Object.fromEntries(Bridge.PREP_TIERS.map(t => [t.id, t.budget])));
const COURT_DAY_HOURS = 8;

function tier(n) { return n >= 17 ? 'elite' : n >= 13 ? 'strong' : n >= 9 ? 'fair' : 'weak'; }

function lawyer(id) { const l = LAWYERS[id]; if (!l) throw new Error('법정에 세울 변호사를 고르십시오.'); return l; }

// P2. 확인 항목 수 = 기록 검토 시점 기본값 + (기록 분석 14 이상이면 1). 최대 4.
function checkSlots(tierId, lawyerId) {
  if (!(tierId in BASE_CHECKS)) throw new Error('알 수 없는 기록 검토 결과: ' + tierId);
  return Math.min(4, BASE_CHECKS[tierId] + (lawyer(lawyerId).stats.analysis >= T.analysisBonus ? 1 : 0));
}

// 초안: 담당 변호사가 우선순위대로 확인 항목을 채우고, 방침과 합의 조언을 적는다.
// 협상 13 이상인 변호사는 마지막 확인 칸을 의뢰인 합의 상담에 쓰고, 문구를 고치는 조건을 붙인다.
function draft(tierId, lawyerId) {
  const L = lawyer(lawyerId), slots = checkSlots(tierId, lawyerId), negotiator = L.stats.negotiate >= T.negotiateRevise;
  const facts = SHEET.checks.filter(c => !c.settlement).map(c => c.id);
  const checks = negotiator && slots > 1 ? facts.slice(0, slots - 1).concat('INV_SIG_SETTLE') : facts.slice(0, slots);
  return {
    lawyerId, slots, stance: 'S_SIG_CONTACT', focus: 'F_SIG_CAUSE',
    checks: SHEET.checks.map(c => c.id).filter(id => checks.includes(id)),
    advice: negotiator ? 'ADV_SIG_REVISE' : 'ADV_SIG_AS_IS',
    edited: []
  };
}

function validate(plan, tierId) {
  const def = Case.variants[SHEET.prosecutorId];
  lawyer(plan.lawyerId);
  if (plan.slots !== checkSlots(tierId, plan.lawyerId)) throw new Error('확인 항목 수가 담당 변호사와 맞지 않습니다.');
  if (!def.opening.stance.some(s => s.id === plan.stance)) throw new Error('방침을 고르십시오.');
  if (!def.opening.focus.some(f => f.id === plan.focus)) throw new Error('주력 쟁점을 고르십시오.');
  if (!Array.isArray(plan.checks) || new Set(plan.checks).size !== plan.checks.length) throw new Error('확인 항목이 잘못되었습니다.');
  if (plan.checks.length > plan.slots) throw new Error('확인할 수 있는 항목은 ' + plan.slots + '개까지입니다.');
  if (plan.checks.some(id => !SHEET.checks.some(c => c.id === id))) throw new Error('알 수 없는 확인 항목입니다.');
  if (!Case.settlement.advice.some(a => a.id === plan.advice)) throw new Error('합의 조언을 고르십시오.');
  return true;
}

// 플레이어의 수정. 새 계획을 돌려준다(원본은 그대로). 담당을 바꾸면 그 변호사의 초안으로 다시 쓴다.
function edit(plan, tierId, change) {
  const next = JSON.parse(JSON.stringify(plan));
  const mark = f => { if (!next.edited.includes(f)) next.edited.push(f); };
  switch (change && change.field) {
    case 'lawyer': { if (change.value === plan.lawyerId) throw new Error('이미 담당입니다.'); return draft(tierId, change.value); }
    case 'stance': next.stance = change.value; mark('stance'); break;
    case 'focus': next.focus = change.value; mark('focus'); break;
    case 'advice': next.advice = change.value; mark('advice'); break;
    case 'check': {
      const on = next.checks.includes(change.value);
      if (on) next.checks = next.checks.filter(x => x !== change.value);
      else { if (next.checks.length >= next.slots) throw new Error('확인 항목이 가득 찼습니다. 먼저 하나를 빼십시오.'); next.checks.push(change.value); }
      // 순서는 시트 순서로 고정해 같은 계획이 같은 기록을 만들게 한다.
      next.checks = SHEET.checks.map(c => c.id).filter(id => next.checks.includes(id));
      mark('checks'); break;
    }
    // 위임으로 되돌린다: 그 줄(또는 전부)을 담당 변호사의 초안대로 돌려놓는다.
    case 'reset': {
      const d0 = draft(tierId, plan.lawyerId), all = ['stance', 'focus', 'advice', 'checks'];
      const fields = change.value === 'all' ? all : [change.value];
      fields.forEach(f => {
        if (!all.includes(f)) throw new Error('되돌릴 항목을 알 수 없습니다.');
        next[f] = JSON.parse(JSON.stringify(d0[f]));
        next.edited = next.edited.filter(x => x !== f);
      });
      break;
    }
    default: throw new Error('고칠 항목을 알 수 없습니다.');
  }
  validate(next, tierId);
  return next;
}

// P3. 공판용 사건 정의 사본: 준비 횟수 = 확인 항목 수, 신문 15 이상이면 증인마다 질문 +1.
function trialCase(plan) {
  const copy = JSON.parse(JSON.stringify(Case));
  const bonus = lawyer(plan.lawyerId).stats.examine >= T.examineBonus ? 1 : 0;
  Object.values(copy.variants).forEach(v => {
    v.prep.budget = plan.slots;
    v.opening.focus.forEach(f => { Object.keys(f.time).forEach(w => { f.time[w] += bonus; }); });
  });
  return copy;
}

// 계획 → 공판 전 명령들(세션 명령 형태). 합의 상담은 확인 항목에 들어 있을 때만 한다.
function setupCommands(plan) {
  const def = Case.variants[SHEET.prosecutorId], cmds = [];
  const t = (action, payload) => ({ action: 'trial', payload: { action, payload: payload || {} } });
  if (plan.checks.includes('INV_SIG_SETTLE')) cmds.push({ action: 'consult', payload: { adviceId: plan.advice } });
  plan.checks.filter(id => id !== 'INV_SIG_SETTLE').forEach(id => cmds.push(t('investigate', { id })));
  const granted = new Set(def.investigations.filter(v => plan.checks.includes(v.id)).flatMap(v => v.grants || []));
  def.cards.filter(c => c.filing === 'required' && granted.has(c.id)).forEach(c => cmds.push(t('fileEvidence', { id: c.id, status: 'filed' })));
  cmds.push(t('finishPrep'));
  cmds.push(t('open', { focusId: plan.focus, stanceId: plan.stance }));
  return cmds;
}

function objectionStep(witnessId, stepId) {
  const w = Case.variants[SHEET.prosecutorId].witnesses.find(x => x.id === witnessId);
  return w && w.direct.find(s => s.id === stepId);
}

// 자동 공판의 다음 한 수. { cmd } | { ask } | { done }.
// P4. 법정 대응 13 이상이면 이의를 스스로 판단한다. 낮으면 유도신문(이의가 맞는 질문)에서 플레이어에게 묻는다.
// 정당한 질문에는 누구든 이의하지 않는다. 재반대신문 기회는 자료가 있으면 쓴다.
// P8. 확률 판정. 공판의 결정적 순간 몇 번만 능력치로 굴린다.
// 확률 = 55% + (능력치 − 10) × 6%p, 15~92%. 반대신문은 실패하면 한 번 더 묻는다. 굴림 값은 (시드, 순간)으로 정해져 같은 판은 다시 실행해도 같다.
const ROLL_STATS = Object.freeze({ examine: '신문', court: '법정 대응', analysis: '기록 분석' });
function chance(value) { return Math.round(Math.max(0.15, Math.min(0.92, 0.55 + (value - 10) * 0.06)) * 100); }
function rollValue(seed, key) {
  let h = 2166136261 ^ (seed >>> 0);
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return (h >>> 0) % 100;
}
function roll(seed, plan, key, statId, label) {
  const value = lawyer(plan.lawyerId).stats[statId], pct = chance(value), r = rollValue(seed, key);
  return { key, stat: statId, statLabel: ROLL_STATS[statId], value, pct, ok: r < pct, label };
}
function nextSeed(seed) { return (rollValue(seed, 'next') * 1000003 + (seed >>> 0) % 1000003 + 1) % 2147483647 || 1; }
function odds(plan) { const L = lawyer(plan.lawyerId); return Object.keys(ROLL_STATS).map(id => ({ stat: id, label: ROLL_STATS[id], value: L.stats[id], pct: chance(L.stats[id]) })); }

function nextMove(trial, plan, seed) {
  const rolls = [], out = m => Object.assign(m, { rolls });
  const res = nextMoveInner(trial, plan, seed === undefined ? 1 : seed, rolls);
  return out(res);
}
function nextMoveInner(trial, plan, seed, rolls) {
  const st = trial.state, a = trial.actions, L = lawyer(plan.lawyerId);
  const t = (action, payload) => ({ cmd: { action: 'trial', payload: { action, payload: payload || {} } } });
  if (st.phase === 'verdict') return { done: true };
  if (st.pending && st.pending.type === 'objection') {
    const step = objectionStep(st.pending.witnessId, st.pending.stepId);
    if (!step.proper) return t('objection', { object: false });
    // 변호사가 유도신문을 알아채면 스스로 이의, 놓치면 당신에게 묻는다(개입).
    const r = roll(seed, plan, 'obj:' + st.pending.stepId, 'court', '유도신문 이의'); rolls.push(r);
    if (r.ok) return t('objection', { object: true });
    return { ask: { type: 'objection', witnessId: st.pending.witnessId, stepId: st.pending.stepId } };
  }
  if (st.pending && st.pending.type === 'rebuttal') {
    const r = roll(seed, plan, 'reb:' + st.pending.redirectId, 'analysis', '재반대신문 · ' + st.pending.title); rolls.push(r);
    return t('rebut', { use: r.ok });
  }
  if (a.evidence) {
    const opinions = Object.fromEntries(trial.exhibits.map(x => [x.id, x.witnessId ? 'disagree' : 'agree']));
    return t('evidenceOpinions', { opinions });
  }
  if (a.closing) return t('closingArgument', { id: SHEET.stances[plan.stance].closing });
  if (a.verdict) return t('verdict');
  if (st.cursor && st.cursor.part === 'cross') {
    // 준비한 질문마다 굴린다. 실패한 질문은 꺼내지 못하고 지나간다.
    const ready = a.approaches.filter(x => x.available && x.cards.length);
    for (const ap of ready) {
      const r = roll(seed, plan, 'ap:' + ap.id, 'examine', '반대신문 · ' + ap.title); rolls.push(r);
      if (r.ok) return t('approach', { id: ap.id });
    }
    for (const ap of ready) {
      const r = roll(seed, plan, 'ap2:' + ap.id, 'examine', '다시 묻기 · ' + ap.title); rolls.push(r);
      if (r.ok) return t('approach', { id: ap.id });
    }
    const pr = a.presses.find(x => x.available && x.kind === 'limited');
    if (pr) return t('press', { id: pr.id });
    return t('endCross');
  }
  if (a.continue) return t('continue');
  throw new Error('자동 공판이 다음 수를 찾지 못했습니다.');
}

// 계획 보드에 보일 예고: 검사가 꺼낼 것마다 받아칠 자료를 확인했는가.
function threats(plan) {
  return SHEET.threats.map(x => ({ ...x, ready: plan.checks.includes(x.counter), counterLabel: SHEET.checks.find(c => c.id === x.counter).label }));
}

// 개입이 생길 수 있는 최대 횟수(맞는 유도신문 수). 실제 횟수는 법정 대응 굴림에 달렸다.
function expectedAsks() {
  return Case.variants[SHEET.prosecutorId].witnesses.reduce((n, w) => n + w.direct.filter(s => s.type === 'objection' && s.proper).length, 0);
}

// P5. 출정 비용: 법정에 선 변호사의 시간당 비용 × 8시간. 결산에서만 뺀다.
function courtFee(firmState, lawyerId) {
  const person = firmState.staff.find(s => s.id === lawyerId);
  if (!person) throw new Error('사무소에 없는 변호사입니다.');
  return person.hourlyCost * COURT_DAY_HOURS;
}

const api = { chance, rollValue, nextSeed, odds, ROLL_STATS, STATS, LAWYERS, LAWYER_ORDER, T, BASE_CHECKS, tier, checkSlots, draft, validate, edit, trialCase, setupCommands, nextMove, threats, expectedAsks, courtFee, objectionStep };
if (isNode) module.exports = api; else root.FirmPlan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
