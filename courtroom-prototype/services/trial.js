(function (root) {
'use strict';
// v0.10 Adversarial Trial service. The only state mutation owner.
// Commands are atomic: a failed command leaves state (including ID serial) untouched.
const T = typeof module !== 'undefined' && module.exports ? require('../engine/trial.js') : root.FirmTrial;

function createTrialService(definition) {
  const d = T.copy(definition); T.validate(d);
  let state, session = 0;
  const W = idx => d.witnesses[idx];
  const find = (list, id) => list.find(x => x.id === id);

  function reset() {
    state = { session: ++session, serial: 0, phase: 'prep', cursor: null, pending: null, records: [] };
    return projection();
  }

  // ----- helpers operating on a draft state -----
  function push(s, rec) {
    const r = Object.assign({ id: d.id + ':s' + s.session + ':r' + (++s.serial), seq: s.records.length + 1, source: 'court', effects: [], lines: [] }, rec);
    s.records.push(r); return r;
  }
  const proj = s => T.project(d, s.records);
  function linesFor(w, lines) { return lines.map(([speaker, text]) => ({ speaker, text })); }

  function crossStart(s) {
    const p = proj(s), w = W(s.cursor.w), focus = find(d.opening.focus, p.focusId);
    const warn = p.credibility <= d.credibility.warnAtOrBelow;
    const time = Math.max(1, focus.time[w.id] - (warn ? 1 : 0));
    push(s, { kind: 'cross_start', witnessId: w.id, time, warned: warn, lines: linesFor(w, [...d.lines.crossStart, ...(warn ? d.lines.crossWarn : [])]) });
    s.cursor.part = 'cross';
  }
  function endCross(s, timeUp) {
    const w = W(s.cursor.w);
    push(s, { kind: 'cross_end', witnessId: w.id, timeUp: !!timeUp, lines: linesFor(w, timeUp ? d.lines.crossTimeUp : d.lines.crossStop) });
    const p = proj(s), ctx = T.contextFor(p, w.id);
    s.cursor.part = 'redirect';
    s.cursor.redirectQueue = w.redirect.filter(r => T.evalWhen(r.when, ctx)).map(r => r.id);
    s.cursor.redirectEmitted = 0;
  }
  function afterCrossAction(s) {
    const p = proj(s), wp = p.witnesses.find(x => x.id === W(s.cursor.w).id);
    if (wp.used >= wp.time) endCross(s, true);
  }

  function stepContinue(s) {
    const c = s.cursor;
    if (c.part === 'intro') {
      const w = W(c.w);
      push(s, { kind: 'witness_call', witnessId: w.id, lines: [{ speaker: 'JUDGE', text: '검찰 측 증인 ' + w.name + ', 증인석으로 나오십시오.' }, { speaker: 'PROSECUTOR', text: '주신문하겠습니다.' }] });
      c.part = 'direct'; c.step = 0; return;
    }
    if (c.part === 'direct') {
      const w = W(c.w), p = proj(s), ctx = T.contextFor(p, w.id);
      while (c.step < w.direct.length && !T.evalWhen(w.direct[c.step].when, ctx)) c.step++;
      if (c.step >= w.direct.length) { crossStart(s); return; }
      const step = w.direct[c.step]; c.step++;
      if (step.type === 'lines') {
        push(s, { kind: 'direct', witnessId: w.id, refId: step.id, source: 'prosecution', effects: step.effects || [], credibility: step.credibility, memo: step.memo, tone: step.tone, conflict: !!step.conflict, missed: step.missed || null, lines: linesFor(w, step.lines) });
      } else {
        push(s, { kind: 'question', witnessId: w.id, refId: step.id, source: 'prosecution', lines: linesFor(w, [step.question]) });
        s.pending = { type: 'objection', stepId: step.id, witnessId: w.id, ground: step.ground };
      }
      return;
    }
    if (c.part === 'redirect') {
      const w = W(c.w);
      if (!c.redirectQueue.length) {
        if (!c.redirectEmitted) push(s, { kind: 'redirect_none', witnessId: w.id, source: 'prosecution', lines: linesFor(w, d.lines.noRedirect) });
        push(s, { kind: 'witness_done', witnessId: w.id, lines: linesFor(w, d.lines.witnessDone) });
        c.w += 1; c.redirectQueue = null;
        if (c.w >= d.witnesses.length) { c.part = 'closed'; } else { c.part = 'intro'; }
        return;
      }
      const id = c.redirectQueue.shift(), r = find(w.redirect, id), p = proj(s);
      const wp = p.witnesses.find(x => x.id === w.id);
      const neutralized = wp.neutralized.includes(id);
      const canRebut = !neutralized && r.rebuttal && p.cards.includes(r.rebuttal.card);
      c.redirectEmitted += 1;
      push(s, { kind: 'redirect', witnessId: w.id, refId: id, source: 'prosecution', neutralized,
        effects: neutralized ? [] : [[w.issue, r.delta]],
        memo: neutralized ? (r.neutralizedMemo || r.memo) : r.memo, tone: neutralized ? 'defense' : r.tone,
        missed: neutralized || canRebut ? null : (r.missed || null), lines: linesFor(w, r.lines) });
      if (canRebut) s.pending = { type: 'rebuttal', redirectId: id, witnessId: w.id, card: r.rebuttal.card, title: r.rebuttal.title };
      return;
    }
    throw new Error('계속할 진행이 없습니다.');
  }

  const handlers = {
    investigate(s, { id }) {
      if (s.phase !== 'prep') throw new Error('준비 단계가 아닙니다.');
      const v = find(d.investigations, id); if (!v) throw new Error('알 수 없는 조사입니다.');
      const p = proj(s);
      if (p.investigations.includes(id)) throw new Error('이미 한 조사입니다.');
      if (v.cost > p.budgetLeft) throw new Error('남은 시간이 부족합니다.');
      push(s, { kind: 'investigation', refId: id, source: 'defense', cost: v.cost, cards: [...(v.grants || [])], reveals: [...(v.reveals || [])] });
    },
    finishPrep(s) {
      if (s.phase !== 'prep') throw new Error('준비 단계가 아닙니다.');
      push(s, { kind: 'prep_closed', source: 'defense' }); s.phase = 'opening';
    },
    open(s, { focusId, stanceId }) {
      if (s.phase !== 'opening') throw new Error('개회사 단계가 아닙니다.');
      const f = find(d.opening.focus, focusId), st = find(d.opening.stance, stanceId);
      if (!f || !st) throw new Error('개회사 입장을 모두 고르십시오.');
      const speech = [f.text, st.text, d.opening.close].filter(Boolean).join(' ');
      push(s, { kind: 'trial_open', lines: d.lines.trialOpen.map(([speaker, text]) => ({ speaker, text })) });
      push(s, { kind: 'opening', source: 'defense', focusId, stanceId, lines: [{ speaker: 'DEFENSE', text: speech }] });
      s.phase = 'trial'; s.cursor = { w: 0, part: 'intro', step: 0 };
    },
    continue(s) {
      if (s.phase !== 'trial') throw new Error('공판 중이 아닙니다.');
      if (s.pending) throw new Error('먼저 결정해야 합니다.');
      if (!['intro', 'direct', 'redirect'].includes(s.cursor.part)) throw new Error('지금은 변호인이 행동할 차례입니다.');
      stepContinue(s);
    },
    objection(s, { object }) {
      if (!s.pending || s.pending.type !== 'objection') throw new Error('이의 제기할 질문이 없습니다.');
      const w = W(s.cursor.w), step = find(w.direct, s.pending.stepId);
      let outcome;
      if (object) outcome = step.proper ? { kind: 'sustained', data: step.sustained } : { kind: 'overruled', data: step.overruled };
      else outcome = { kind: 'pass', data: step.pass };
      const o = outcome.data;
      push(s, { kind: 'objection', witnessId: w.id, refId: step.id, ruling: outcome.kind,
        source: object ? 'defense' : 'prosecution', effects: o.effects || [], credibility: o.credibility,
        memo: o.memo, tone: o.tone, lines: linesFor(w, o.lines) });
      s.pending = null;
    },
    approach(s, { id }) {
      if (s.phase !== 'trial' || s.cursor.part !== 'cross' || s.pending) throw new Error('반대신문 중이 아닙니다.');
      const w = W(s.cursor.w), p = proj(s), wp = p.witnesses.find(x => x.id === w.id);
      if (wp.approaches.includes(id)) throw new Error('이미 사용한 접근법입니다.');
      if (wp.used >= wp.time) throw new Error('신문 시간이 없습니다.');
      const res = T.resolveApproach(d, p, w.id, id);
      if (res.error === 'unknown approach') throw new Error('알 수 없는 접근법입니다.');
      if (res.error) throw new Error('필요한 준비 자료가 없습니다.');
      push(s, { kind: 'approach', witnessId: w.id, refId: id, source: 'defense', effects: [[w.issue, res.delta]], points: res.points, cardsUsed: res.cardsUsed, neutralizes: res.neutralizes, memo: res.memo, tone: res.tone, lines: linesFor(w, res.lines) });
      res.followups.forEach(f => push(s, { kind: 'stance_conflict', witnessId: w.id, refId: id, source: 'prosecution', credibility: f.credibility, memo: f.memo, tone: f.tone, conflict: true, lines: linesFor(w, f.lines) }));
      afterCrossAction(s);
    },
    press(s, { id }) {
      if (s.phase !== 'trial' || s.cursor.part !== 'cross' || s.pending) throw new Error('반대신문 중이 아닙니다.');
      const w = W(s.cursor.w), p = proj(s), wp = p.witnesses.find(x => x.id === w.id);
      const pr = find(w.presses, id); if (!pr) throw new Error('알 수 없는 질문입니다.');
      if (!wp.approaches.length) throw new Error('먼저 근거를 쌓아야 합니다.');
      if (wp.presses.includes(id)) throw new Error('이미 요구한 결론입니다.');
      if (wp.used >= wp.time) throw new Error('신문 시간이 없습니다.');
      const ok = T.pressSucceeds(pr, wp.points), o = ok ? pr.success : pr.fail;
      push(s, { kind: 'press', witnessId: w.id, refId: id, pressKind: pr.kind, succeeded: ok, source: 'defense', effects: [[w.issue, o.delta]], credibility: o.credibility, memo: o.memo, tone: o.tone,
        lines: linesFor(w, [['DEFENSE', pr.question], ...o.lines]) });
      afterCrossAction(s);
    },
    endCross(s) {
      if (s.phase !== 'trial' || s.cursor.part !== 'cross' || s.pending) throw new Error('반대신문 중이 아닙니다.');
      endCross(s, false);
    },
    rebut(s, { use }) {
      if (!s.pending || s.pending.type !== 'rebuttal') throw new Error('재반대신문할 수 없습니다.');
      const w = W(s.cursor.w), r = find(w.redirect, s.pending.redirectId);
      if (use) push(s, { kind: 'rebuttal', witnessId: w.id, refId: r.id, source: 'defense', effects: [[w.issue, r.rebuttal.delta]], cardsUsed: [r.rebuttal.card], memo: r.rebuttal.memo, tone: r.rebuttal.tone, lines: linesFor(w, r.rebuttal.lines) });
      else push(s, { kind: 'rebuttal_pass', witnessId: w.id, refId: r.id, source: 'defense', missed: '준비한 ' + find(d.cards, r.rebuttal.card).title + '을(를) 제시하지 않아 검사의 수습이 그대로 남았다.', lines: linesFor(w, d.lines.rebutPass) });
      s.pending = null;
    },
    verdict(s) {
      if (s.phase !== 'trial' || s.cursor.part !== 'closed') throw new Error('아직 판결할 수 없습니다.');
      const v = T.adjudicate(d, proj(s));
      push(s, { kind: 'verdict', outcome: v.outcome, doubtIssues: v.doubtIssues, lines: [...d.lines.verdictLead, ['JUDGE', v.text.text]].map(([speaker, text]) => ({ speaker, text })) });
      s.phase = 'verdict';
    }
  };

  function command(action, payload = {}) {
    if (action === 'reset') return { ok: true, view: reset() };
    const h = handlers[action];
    if (!h) return { ok: false, error: '알 수 없는 명령: ' + action, view: projection() };
    const draft = T.copy(state);
    try { h(draft, payload || {}); } catch (e) { return { ok: false, error: e.message, view: projection() }; }
    state = draft;
    return { ok: true, view: projection() };
  }

  // ----- read model for UI -----
  function projection() {
    const s = state, p = T.project(d, s.records);
    const cur = s.cursor, w = cur && cur.w < d.witnesses.length ? W(cur.w) : null;
    const wp = w ? p.witnesses.find(x => x.id === w.id) : null;
    let actions = { continue: false, approaches: [], presses: [], endCross: false, verdict: false };
    if (s.phase === 'trial' && !s.pending) {
      if (['intro', 'direct', 'redirect'].includes(cur.part)) actions.continue = true;
      if (cur.part === 'closed') actions.verdict = true;
      if (cur.part === 'cross') {
        actions.endCross = true;
        actions.approaches = w.approaches.map(a => {
          const used = wp.approaches.includes(a.id);
          const held = (a.requiresAny || []).filter(c => p.cards.includes(c));
          const missing = (a.requiresAny || []).length && !held.length;
          const cardsShown = a.cardBonus ? (p.cards.includes(a.cardBonus.card) ? [a.cardBonus.card] : []) : held;
          return { id: a.id, title: a.title, hint: a.hint, used, available: !used && !missing, reason: used ? '사용함' : missing ? '준비 자료 없음' : '', cards: cardsShown, requires: a.requiresAny || [] };
        });
        actions.presses = w.presses.map(pr => {
          const used = wp.presses.includes(pr.id);
          return { id: pr.id, title: pr.title, kind: pr.kind, question: pr.question, used, available: !used && wp.approaches.length > 0, reason: used ? '사용함' : !wp.approaches.length ? '근거를 먼저 쌓아야 함' : '' };
        });
      }
    }
    const verdict = s.phase === 'verdict' ? T.adjudicate(d, p) : null;
    return T.copy({
      state: { phase: s.phase, cursor: cur, pending: s.pending, session: s.session },
      definition: { title: d.title, charge: d.charge, client: d.client, roles: d.roles, witnesses: d.witnesses.map(x => ({ id: x.id, name: x.name, role: x.role, initial: x.initial, issue: x.issue })), briefing: d.briefing, prep: d.prep, opening: { focus: d.opening.focus.map(f => ({ id: f.id, title: f.title, time: f.time })), stance: d.opening.stance.map(x => ({ id: x.id, title: x.title })), caution: d.opening.caution && !p.cards.includes(d.opening.caution.unlessCard) ? d.opening.caution.text : null }, credibilityMax: d.credibility.max },
      projection: p,
      investigations: d.investigations.map(v => ({ id: v.id, title: v.title, cost: v.cost, blurb: v.blurb, done: p.investigations.includes(v.id), affordable: v.cost <= p.budgetLeft })),
      cards: p.cards.map(id => find(d.cards, id)),
      exhibits: d.prosecutionExhibits.map(x => ({ id: x.id, title: x.title, revealed: p.revealed.includes(x.id), content: p.revealed.includes(x.id) ? x.content : null })),
      clientStatements: d.clientStatements.filter(c => !c.requiresCard || p.cards.includes(c.requiresCard)),
      witness: w ? { id: w.id, name: w.name, role: w.role, initial: w.initial, timeLeft: wp.time == null ? null : wp.time - wp.used, time: wp.time } : null,
      actions,
      records: s.records,
      verdict,
      review: s.phase === 'verdict' ? T.review(d, s.records) : null
    });
  }

  reset();
  return { command, projection, reset: () => command('reset'), definition: () => T.copy(d) };
}

const api = { createTrialService };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmTrialService = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
