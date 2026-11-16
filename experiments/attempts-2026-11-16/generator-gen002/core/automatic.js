'use strict';
// Deterministic service policy. No seed, RNG, verdict bonus, or truth access.
const { createTrialService } = require('../../services/trial');
const { publicForecastInput, forecastFromPublic, comparableForecastBand } = require('./forecast');

function runPolicy(d, { investigations = [], targetIssue = d.issues[0].id, skill = 'experienced' } = {}) {
  if (!['novice', 'experienced'].includes(skill)) throw Error('unknown automatic policy');
  if (!d.issues.some(i => i.id === targetIssue)) throw Error('unknown target issue');
  const s = createTrialService(d);
  const command = (action, payload) => {
    const r = s.command(action, payload);
    if (!r.ok) throw Error(`${action}: ${r.error}`);
    return r.view;
  };
  for (const id of investigations) {
    const inv = s.projection().investigations.find(i => i.id === id);
    if (!inv) throw Error('unknown investigation');
    if (!inv.done && inv.affordable) command('investigate', { id });
  }
  const prepared = s.projection();
  command('finishPrep');
  let v = command('open', { focusId: `F_${targetIssue}`, stanceId: 'S_CONTEST' });
  for (let guard = 0; guard < 500 && v.state.phase !== 'verdict'; guard++) {
    if (v.state.pending?.type === 'objection') {
      // Fixed cautious policy; never reads the hidden proper flag.
      v = command('objection', { object: false });
    } else if (v.state.pending?.type === 'rebuttal') {
      v = command('rebut', { use: skill === 'experienced' });
    } else if (v.actions.verdict) v = command('verdict');
    else if (v.state.cursor.part === 'cross') {
      const target = v.definition.witnesses.find(w => w.id === v.witness.id).issue === targetIssue;
      const a = target && v.actions.approaches.find(a => a.available && a.cards.length && !a.id.includes('_STANCE_'));
      const confirmed = new Set(v.records.filter(r => r.kind === 'approach' && r.witnessId === v.witness.id)
        .flatMap(r => r.cardsUsed || [])).size;
      const p = target && skill === 'experienced' && confirmed >= 2 && v.actions.presses.find(p => p.available && p.kind === 'limited');
      if (a) v = command('approach', { id: a.id });
      else if (p && d.witnesses.find(w => w.id === v.witness.id).presses.find(x => x.id === p.id).hint
        === require('../content/catalog-content').PRESS_HINT)
        v = command('press', { id: p.id });
      else v = command('endCross');
    } else v = command('continue');
  }
  if (v.state.phase !== 'verdict') throw Error('automatic policy did not finish');
  return { prepared, view: v, outcome: v.verdict.outcome };
}

function outcomeBand(view) {
  if (view.verdict.outcome === 'not_guilty') return '유리';
  return view.verdict.issues.some(i => i.band === 'shaken') ? '다툼' : '불리';
}

function automaticCase(d, options = {}) {
  // Prepare through the service before forecasting; do not peek at actual hearing outcome.
  const prepService = createTrialService(d);
  for (const id of options.investigations || []) {
    const inv = prepService.projection().investigations.find(i => i.id === id);
    if (!inv) throw Error('unknown investigation');
    if (!inv.done && inv.affordable) {
      const r = prepService.command('investigate', { id });
      if (!r.ok) throw Error(r.error);
    }
  }
  const prepared = prepService.projection();
  const targetIssue = options.targetIssue || prepared.projection.issues[0].id;
  const publicInput = publicForecastInput(prepared, { ...options, targetIssue });
  const estimate = forecastFromPublic(publicInput);
  const forecast = estimate.band;
  const actual = runPolicy(d, options);
  const band = outcomeBand(actual.view);
  const held = new Set(prepared.cards.map(c => c.id));
  const discoveries = actual.view.records.filter(r => r.kind === 'redirect').flatMap(r => {
    const w = d.witnesses.find(w => w.id === r.witnessId), redirect = w.redirect.find(x => x.id === r.refId);
    if (held.has(redirect.rebuttal.card)) return [];
    return [{ recordId: r.id, issue: w.issue, text: r.memo, missed: redirect.missed }];
  });
  const disagreement = comparableForecastBand(forecast) !== band;
  const upset = forecast === '유리' && actual.outcome !== 'not_guilty' && discoveries.length > 0;
  return {
    player: { id: d.id, title: d.title, forecast,
      explanation: estimate.explanation,
      outcome: actual.view.verdict.text.title, resultBand: band, upset,
      discoveries, review: { effective: actual.view.review.effective.map(({ recordId, text }) => ({ recordId, text })),
        missed: actual.view.review.missed.map(({ recordId, text }) => ({ recordId, text })) } },
    audit: { forecast, actualBand: band, matched: !disagreement, upset, outcome: actual.outcome,
      records: actual.view.records, projection: actual.view.projection, publicInput,
      mismatchReason: !disagreement ? null : discoveries.length ? 'uninvestigated_discovery' : 'coarse_public_estimate' }
  };
}
module.exports = { runPolicy, outcomeBand, automaticCase };
