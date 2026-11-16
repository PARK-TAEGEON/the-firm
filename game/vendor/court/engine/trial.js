(function (root) {
'use strict';
// v0.10 Adversarial Trial engine. Pure functions: definition + records → projection/verdict/review.
// No RNG, no UI state, no click counts. Records are the only source of truth.

const copy = value => JSON.parse(JSON.stringify(value));
const byId = (list, id) => list.find(x => x.id === id);
function fail(message) { throw new Error('TrialDefinition: ' + message); }

function validate(d) {
  if (!d || !d.id) fail('missing id');
  const ids = new Set();
  const unique = (id, where) => { if (!id || typeof id !== 'string') fail('missing id in ' + where); if (ids.has(id)) fail('duplicate id ' + id); ids.add(id); };
  const cardIds = new Set(d.cards.map(c => c.id));
  const exhibitIds = new Set(d.prosecutionExhibits.map(x => x.id));
  const issueIds = new Set(d.issues.map(i => i.id));
  const witnessIds = new Set(d.witnesses.map(w => w.id));
  d.cards.forEach(c => { unique(c.id, 'cards'); if (!issueIds.has(c.issue)) fail('card issue ' + c.id); });
  d.prosecutionExhibits.forEach(x => unique(x.id, 'exhibits'));
  d.issues.forEach(i => { unique(i.id, 'issues'); if (typeof i.baseline !== 'number') fail('issue baseline ' + i.id); ['proven', 'shaken', 'doubt'].forEach(k => { if (!i.memo || !i.memo[k]) fail('issue memo ' + i.id + '.' + k); }); });
  if (!(d.bands && d.bands.proven > d.bands.doubt)) fail('bands');
  if (!(d.prep && d.prep.budget > 0)) fail('prep budget');
  d.investigations.forEach(v => {
    unique(v.id, 'investigations');
    if (!(v.cost > 0)) fail('cost ' + v.id);
    (v.grants || []).forEach(c => { if (!cardIds.has(c)) fail('grant ' + c); });
    (v.reveals || []).forEach(x => { if (!exhibitIds.has(x)) fail('reveal ' + x); });
  });
  d.adjudication.required.forEach(i => { if (!issueIds.has(i)) fail('required issue ' + i); });
  if (d.adjudication.rule !== 'all_required') fail('unsupported adjudication rule');
  d.opening.focus.forEach(f => { unique(f.id, 'focus'); d.witnesses.forEach(w => { if (!(f.time[w.id] > 0)) fail('focus time ' + f.id + '/' + w.id); }); });
  d.opening.stance.forEach(s => unique(s.id, 'stance'));
  const stanceIds = new Set(d.opening.stance.map(s => s.id));
  d.witnesses.forEach(w => {
    unique(w.id, 'witnesses');
    if (!issueIds.has(w.issue)) fail('witness issue ' + w.id);
    const pointIds = new Set();
    w.direct.forEach(step => {
      unique(step.id, 'direct');
      if (!['lines', 'objection'].includes(step.type)) fail('direct type ' + step.id);
      if (step.when && step.when.stance && !stanceIds.has(step.when.stance)) fail('when stance ' + step.id);
      if (step.type === 'objection') { if (typeof step.proper !== 'boolean') fail('objection proper ' + step.id); if (step.proper ? !step.sustained : !step.overruled) fail('objection outcome ' + step.id); if (!step.pass) fail('objection pass ' + step.id); }
    });
    w.approaches.forEach(a => {
      unique(a.id, 'approaches');
      (a.requiresAny || []).forEach(c => { if (!cardIds.has(c)) fail('approach card ' + c); });
      if (a.cardPoints) Object.entries(a.cardPoints).forEach(([c, p]) => { if (!cardIds.has(c)) fail('cardPoints ' + c); pointIds.add(p); });
      (a.points || []).forEach(p => pointIds.add(p));
      if (a.byStance) d.opening.stance.forEach(s => { if (typeof a.byStance[s.id] !== 'number') fail('byStance ' + a.id + '/' + s.id); });
      if (typeof a.delta !== 'number' && typeof a.perCard !== 'number' && !a.byStance) fail('approach effect ' + a.id);
    });
    w.presses.forEach(p => {
      unique(p.id, 'presses');
      if (!['limited', 'overreach'].includes(p.kind)) fail('press kind ' + p.id);
      if (p.kind === 'limited' && !p.success) fail('limited success ' + p.id);
      if (!p.fail) fail('press fail ' + p.id);
      const req = p.requiresPoints ? [...(p.requiresPoints.all || []), ...(p.requiresPoints.any || [])] : [];
      req.forEach(x => { if (!pointIds.has(x)) fail('press point ' + x); });
    });
    w.redirect.forEach(r => {
      unique(r.id, 'redirect');
      if (r.rebuttal && !cardIds.has(r.rebuttal.card)) fail('rebuttal card ' + r.id);
    });
    w.approaches.forEach(a => (a.neutralizes || []).forEach(n => { if (!w.redirect.some(r => r.id === n)) fail('neutralizes ' + n); }));
  });
  if (!witnessIds.size) fail('no witnesses');
  return true;
}

// ---------- Projection ----------
function band(d, strength) { return strength >= d.bands.proven ? 'proven' : strength <= d.bands.doubt ? 'doubt' : 'shaken'; }

function project(d, records) {
  const p = {
    budgetUsed: 0, investigations: [], cards: [], revealed: [],
    focusId: null, stanceId: null,
    credibility: d.credibility.start,
    issues: d.issues.map(i => ({ id: i.id, title: i.title, question: i.question, strength: i.baseline, notes: [] })),
    witnesses: d.witnesses.map(w => ({ id: w.id, points: [], approaches: [], presses: [], time: null, used: 0, defenseGain: false, neutralized: [], crossEnded: false, done: false, conflict: false })),
    verdict: null
  };
  const wp = id => p.witnesses.find(w => w.id === id);
  for (const r of records) {
    if (r.kind === 'investigation') {
      p.budgetUsed += r.cost; p.investigations.push(r.refId);
      r.cards.forEach(c => { if (!p.cards.includes(c)) p.cards.push(c); });
      r.reveals.forEach(x => { if (!p.revealed.includes(x)) p.revealed.push(x); });
    }
    if (r.kind === 'opening') { p.focusId = r.focusId; p.stanceId = r.stanceId; }
    if (typeof r.credibility === 'number') p.credibility = Math.max(0, Math.min(d.credibility.max, p.credibility + r.credibility));
    (r.effects || []).forEach(([issueId, delta]) => { const i = p.issues.find(x => x.id === issueId); i.strength += delta; });
    if (r.memo) {
      const issueId = (r.effects && r.effects[0] && r.effects[0][0]) || (r.witnessId && byId(d.witnesses, r.witnessId).issue);
      if (issueId) p.issues.find(x => x.id === issueId).notes.push({ recordId: r.id, text: r.memo, tone: r.tone || 'neutral' });
    }
    if (r.witnessId) {
      const w = wp(r.witnessId);
      (r.points || []).forEach(x => { if (!w.points.includes(x)) w.points.push(x); });
      (r.neutralizes || []).forEach(x => { if (!w.neutralized.includes(x)) w.neutralized.push(x); });
      if (r.kind === 'cross_start') w.time = r.time;
      if (r.kind === 'approach') { w.approaches.push(r.refId); w.used += 1; }
      if (r.kind === 'press') { w.presses.push(r.refId); w.used += 1; }
      if ((r.kind === 'approach' || r.kind === 'press') && (r.effects || []).some(([, delta]) => delta < 0)) w.defenseGain = true;
      if (r.kind === 'cross_end') w.crossEnded = true;
      if (r.kind === 'witness_done') w.done = true;
      if (r.conflict) w.conflict = true;
    }
    if (r.kind === 'verdict') p.verdict = { outcome: r.outcome, recordId: r.id };
  }
  p.issues.forEach(i => { i.band = band(d, i.strength); i.memo = byId(d.issues, i.id).memo[i.band]; });
  p.budgetLeft = d.prep.budget - p.budgetUsed;
  return p;
}

// ---------- Conditions ----------
function evalWhen(when, ctx) {
  if (!when) return true;
  if (when.stance && ctx.stanceId !== when.stance) return false;
  if (when.lacksCard && ctx.cards.includes(when.lacksCard)) return false;
  if (when.anyPoint && !when.anyPoint.some(x => ctx.points.includes(x))) return false;
  if (when.lacksPoint && ctx.points.includes(when.lacksPoint)) return false;
  if (when.anyDefenseGain && !ctx.defenseGain) return false;
  return true;
}
function contextFor(p, witnessId) {
  const w = p.witnesses.find(x => x.id === witnessId);
  return { stanceId: p.stanceId, cards: p.cards, points: w.points, defenseGain: w.defenseGain, neutralized: w.neutralized };
}

// Approach resolution: returns effect payload for a record. Never mutates.
function resolveApproach(d, p, witnessId, approachId) {
  const w = byId(d.witnesses, witnessId), a = byId(w.approaches, approachId);
  if (!a) return { error: 'unknown approach' };
  const held = (a.requiresAny || []).filter(c => p.cards.includes(c));
  if ((a.requiresAny || []).length && !held.length) return { error: 'missing card' };
  let delta, lines = [], points = [...(a.points || [])], cardsUsed = held, extra = [];
  if (typeof a.perCard === 'number') {
    delta = a.perCard * held.length;
    held.forEach(c => { lines.push(...a.lines[c]); points.push(a.cardPoints[c]); });
  } else if (a.byStance) {
    delta = a.byStance[p.stanceId];
    lines = [...a.lines];
    if (a.stanceConflict && p.stanceId === a.stanceConflict.stance) extra.push(a.stanceConflict);
  } else {
    delta = a.delta; lines = [...a.lines];
    if (a.cardBonus && p.cards.includes(a.cardBonus.card)) { delta = a.cardBonus.delta; lines.push(...a.bonusLines); cardsUsed = [a.cardBonus.card]; }
  }
  return { delta, lines, points, cardsUsed, neutralizes: a.neutralizes || [], memo: a.memo, tone: a.tone, followups: extra };
}

function pressSucceeds(press, points) {
  if (press.kind === 'overreach') return false;
  if (typeof press.minPoints === 'number') return points.length >= press.minPoints;
  const req = press.requiresPoints || {};
  return (req.all || []).every(x => points.includes(x)) && (!(req.any || []).length || req.any.some(x => points.includes(x)));
}

function adjudicate(d, p) {
  const issues = d.adjudication.required.map(id => { const i = p.issues.find(x => x.id === id); return { id, title: i.title, band: i.band, memo: i.memo }; });
  const doubt = issues.filter(i => i.band === 'doubt');
  const outcome = doubt.length ? 'not_guilty' : 'guilty';
  return { outcome, issues, doubtIssues: doubt.map(i => i.id), text: outcome === 'guilty' ? d.adjudication.guilty : d.adjudication.notGuilty };
}

function replay(d, records) { const p = project(d, records); return { projection: p, verdict: adjudicate(d, p) }; }

// ---------- Review (복기) ----------
function review(d, records) {
  const p = project(d, records);
  const effective = [], backfired = [], missed = [];
  for (const r of records) {
    const total = (r.effects || []).reduce((s, [, x]) => s + x, 0);
    if (r.kind === 'objection') {
      if (r.ruling === 'sustained') effective.push({ recordId: r.id, text: r.memo, weight: 1 });
      if (r.ruling === 'overruled') backfired.push({ recordId: r.id, text: r.memo });
      continue;
    }
    if (['approach', 'press', 'rebuttal'].includes(r.kind) && r.source === 'defense' && total <= -1) effective.push({ recordId: r.id, text: r.memo, weight: -total });
    if (r.source === 'defense' && (total > 0 || (r.credibility || 0) < 0)) backfired.push({ recordId: r.id, text: r.memo });
    if (r.source === 'prosecution' && (r.credibility || 0) < 0) backfired.push({ recordId: r.id, text: r.memo });
    if (r.missed && ((['redirect', 'direct'].includes(r.kind) && total > 0) || r.kind === 'rebuttal_pass')) missed.push({ recordId: r.id, text: r.missed });
  }
  const proven = new Set(p.issues.filter(i => i.band !== 'doubt').map(i => i.id));
  d.missedPrep.forEach(m => {
    const has = m.card ? p.cards.includes(m.card) : m.cardsAny.some(c => p.cards.includes(c));
    if (!has && proven.has(m.issue)) missed.push({ recordId: null, text: m.text });
  });
  effective.sort((a, b) => b.weight - a.weight);
  return { effective, backfired, missed: missed.filter((m, i, xs) => xs.findIndex(y => y.text === m.text) === i) };
}

const api = { copy, validate, project, band, evalWhen, contextFor, resolveApproach, pressSucceeds, adjudicate, replay, review };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmTrial = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
