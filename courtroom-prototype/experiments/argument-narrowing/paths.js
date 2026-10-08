'use strict';
const assert = require('node:assert/strict');
const C = require('../../data/demo-separated-moments');
const pack = require('../../data/demo-ko-pack');
const { createDemoSession } = require('../../services/demo-session');
const command = (s, action, payload) => {
  const r = s.command(action, payload); assert.equal(r.ok, true, action + ': ' + r.error); return r.view;
};
const tr = (s, action, payload) => command(s, 'trial', { action, payload });
function prepare({ enabled = true, prosecutorId = 'veteran', declare = true, prep = ['INV_SIG_MEDICAL', 'INV_SIG_SEQUENCE'], file = true } = {}) {
  const s = createDemoSession({ cases: [C], pack, argumentRevision: enabled });
  command(s, 'start', { caseId: C.id, prosecutorId });
  prep.forEach(id => tr(s, 'investigate', { id }));
  if (file) s.projection().trial.cards.filter(c => c.filing === 'required' && c.id !== 'CARD_SIG_LAYOUT').forEach(c => tr(s, 'fileEvidence', { id: c.id, status: 'filed' }));
  tr(s, 'finishPrep');
  if (declare) tr(s, 'commitCauseClaim');
  return s;
}
function toClosing(s, { overreach = false, pass = false, earlyLayout = false, rebut = true } = {}) {
  tr(s, 'open', { stanceId: 'S_SIG_CONTACT', focusId: 'F_SIG_CAUSE' });
  tr(s, 'evidenceOpinions', { opinions: { PX_SIG_STATEMENT: 'disagree', PX_SIG_REPORT: 'disagree', PX_SIG_VIDEO: 'agree', PX_SIG_MEDICAL: 'agree' } });
  if (!earlyLayout && s.projection().trial.cards.some(c => c.id === 'CARD_SIG_LAYOUT')) tr(s, 'fileEvidence', { id: 'CARD_SIG_LAYOUT', status: 'filed' });
  const queue = ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE', overreach ? 'P_SIG_CAUSE_OVER' : 'P_SIG_CAUSE_LIMITED'];
  for (let guard = 0; guard < 120; guard++) {
    const t = s.projection().trial, st = t.state;
    if (t.actions.closing) return s;
    if (st.pending) {
      tr(s, st.pending.type === 'objection' ? 'objection' : 'rebut', st.pending.type === 'objection' ? { object: !pass && st.pending.stepId.endsWith('_VALID') } : { use: rebut });
    } else if (st.cursor.part === 'cross') {
      const a = t.witness.id === 'W_SIG_INVESTIGATOR' ? queue.shift() : null;
      if (!a) tr(s, 'endCross');
      else if (a.startsWith('P_')) tr(s, 'press', { id: a });
      else if (t.actions.approaches.find(x => x.id === a).available) tr(s, 'approach', { id: a });
      else tr(s, 'endCross');
    } else tr(s, 'continue');
  }
  throw new Error('closing guard exceeded');
}
function finish(s, id = 'FINAL_NARROWING_CAUSE') {
  tr(s, 'closingArgument', { id }); tr(s, 'continue'); return tr(s, 'verdict');
}
module.exports = { C, prepare, toClosing, finish, tr, command };
