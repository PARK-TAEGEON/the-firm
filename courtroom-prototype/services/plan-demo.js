(function (root) {
'use strict';
// PLAN-DEMO-001: deterministic adapter around the existing DEMO-001 session service.
// The plan is internal; only the existing case records can reach the trial engine.
const isNode = typeof module !== 'undefined' && module.exports;
const C = isNode ? require('../data/demo-separated-moments.js') : root.FirmDemoCase;
const PACK = isNode ? require('../data/demo-ko-pack.js') : root.FirmDemoKoPack;
const SESSION = isNode ? require('./demo-session.js') : root.FirmDemoSession;

const PREP = ['INV_SIG_CLIENT', 'INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL', 'INV_SIG_LAYOUT'];
const OBJECTION_IDS = new Set(['OBJ_SIG_OBSERVER_VALID', 'OBJ_SIG_INVESTIGATOR_VALID']);
const CAUSE_APPROACHES = ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE'];
const OWNED_PLAN = Object.freeze({
  stance: 'S_SIG_CONTACT',
  focus: 'F_SIG_CAUSE',
  aim: '밀침은 인정하되 손목 상해와의 인과관계는 다툰다.'
});

function play(options = {}) {
  const useLayout = options.useLayout !== false;
  if (options.useLayout !== undefined && typeof options.useLayout !== 'boolean') {
    throw new Error('useLayout must be boolean');
  }
  const session = SESSION.createDemoSession({ cases: [C], daily: [], pack: PACK });
  function call(action, payload) {
    const res = session.command(action, payload);
    if (!res.ok) throw new Error(action + ': ' + res.error);
    return res.view;
  }
  const trial = (action, payload) => call('trial', { action, payload: payload || {} });
  const start = call('start', { caseId: C.id, prosecutorId: 'novice' });
  for (const id of PREP) trial('investigate', { id });
  const cards = session.projection().trial.cards;
  for (const card of cards) {
    if (card.filing === 'required' && !card.rebuttal) {
      trial('fileEvidence', { id: card.id, status: 'filed' });
    }
  }
  trial('finishPrep');
  trial('open', { focusId: OWNED_PLAN.focus, stanceId: OWNED_PLAN.stance });
  const opinions = Object.fromEntries(C.variants.novice.prosecutionExhibits.map(x => [
    x.id, x.witnessId ? 'disagree' : 'agree'
  ]));
  trial('evidenceOpinions', { opinions });

  // Legacy DEMO-001 has an early-filing "prepared" gate on this specific
  // redirect/rebuttal. File in its existing supported window only when planned.
  // This is compatibility with the old experiment, NOT a newly approved rule.
  if (useLayout) trial('fileEvidence', { id: 'CARD_SIG_LAYOUT', status: 'filed' });

  let view = session.projection(), steps = 0;
  let requestedCause = 0;
  while (view.trial.state.phase === 'trial') {
    if (++steps > 200) throw new Error('Trial did not terminate within 200 actions.');
    const t = view.trial;
    const st = t.state;
    if (st.pending) {
      if (st.pending.type === 'objection') {
        view = trial('objection', { object: OBJECTION_IDS.has(st.pending.stepId) });
      } else if (st.pending.type === 'rebuttal') {
        view = trial('rebut', { use: useLayout });
      } else {
        throw new Error('Unexpected pending event: ' + st.pending.type);
      }
      continue;
    }
    if (t.actions.closing) {
      view = trial('closingArgument', { id: 'FINAL_SIG_CAUSE' });
      continue;
    }
    if (t.actions.verdict) {
      view = trial('verdict');
      break;
    }
    if (st.cursor.part === 'cross') {
      if (t.witness && t.witness.id === 'W_SIG_INVESTIGATOR' && requestedCause < CAUSE_APPROACHES.length) {
        const next = CAUSE_APPROACHES[requestedCause];
        const available = t.actions.approaches.find(a => a.id === next);
        if (!available || !available.available) throw new Error('Planned question unavailable: ' + next);
        requestedCause++;
        view = trial('approach', { id: next });
      } else {
        view = trial('endCross');
      }
    } else {
      view = trial('continue');
    }
  }
  if (view.trial.state.phase !== 'verdict') throw new Error('Trial did not reach verdict.');
  if (requestedCause !== CAUSE_APPROACHES.length) throw new Error('Planned questions not completed.');
  const records = view.trial.records;
  const find = (kind, refId) => records.find(r => r.kind === kind && r.refId === refId);
  const medical = find('approach', 'A_SIG_CAUSE_MEDICAL');
  const sequence = find('approach', 'A_SIG_CAUSE_SEQUENCE');
  if (!medical || !sequence) throw new Error('Core examination actions not recorded.');

  return {
    plan: { ...OWNED_PLAN, useLayout },
    records,
    outcome: view.outcome,
    results: {
      video: { performed: !!sequence && !sequence.blockedReason, record: sequence },
      medical: { performed: !!medical && !medical.blockedReason, record: medical },
      layout: useLayout ? {
        performed: !!find('rebuttal', 'RH_SIG_CAUSE') && !find('rebuttal', 'RH_SIG_CAUSE').blockedReason,
        record: find('rebuttal', 'RH_SIG_CAUSE') || null
      } : { performed: false, record: null },
      prosecution: records.filter(r => r.source === 'prosecution' || r.kind === 'redirect')
    }
  };
}

const api = { play, OWNED_PLAN, PREP };
if (isNode) module.exports = api;
else root.FirmPlanDemo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
