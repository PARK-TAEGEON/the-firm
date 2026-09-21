(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('../engine/core.js') : root.FirmEngine;
  function createService(definition) {
    const d = E.copy(definition); E.validate(d);
    let serial = 0, session = 0, state;
    const next = () => d.id + ':runtime:' + (++serial);
    function reset() {
      state = { session: ++session, phase: 'plan', theoryId: null, planId: d.argumentPlans[0].id, selected: [], asked: [], presses: [],
        records: { evidence: [], procedural: [], advocacy: [] }, commitments: [], history: [], resolution: null,
        witnessObservation: d.witnesses[0].initialObservation, judgeObservation: '쟁점 중심의 질문을 기다립니다.', lastResponseType: null,
        dialogue: [{ id: next(), speaker: d.profile.roles.factFinder, text: '변호인, 반대신문을 준비하십시오.', kind: 'opening' }] };
      return projection();
    }
    function line(s, speaker, text, kind) { s.dialogue.push({ id: next(), speaker, text, kind }); }
    function recordResponse(s, r, source, basis) {
      line(s, d.witnesses[0].name, r.text, 'answer');
      s.lastResponseType = r.type;
      if (r.observation) s.witnessObservation = r.observation;
      for (const id of r.adds) if (!E.recordIds(s).includes(id)) s.records.evidence.push({ id: next(), propositionId: id, witnessId: d.witnesses[0].id, source, basis: [...basis], responseId: r.id, testimony: r.text });
    }
    function commitPosition(s, kind) {
      const p = E.argument(d, s).plan;
      const item = { id: next(), kind, theoryId: s.theoryId, planId: p.id, issue: p.issue, premises: [...s.selected], text: p.statement };
      s.records.advocacy.push(item);
      s.commitments.push({ id: next(), advocacyId: item.id, theoryId: s.theoryId, issue: p.issue, text: p.title });
    }
    function command(action, payload = {}) {
      const beforeSerial = serial;
      try {
        E.ensure(d.profile.actions.includes(action), '허용되지 않은 행동입니다.');
        const s = E.copy(state), a = E.availability(d, s);
        E.ensure(a[action], '현재 상태에서는 실행할 수 없습니다.');
        if (action === 'strategy') {
          E.ensure(E.find(d.theories, payload.id), '알 수 없는 전략입니다.');
          E.ensure(s.theoryId !== payload.id, '이미 선택한 전략입니다.');
          s.theoryId = payload.id; s.phase = 'examine';
        } else if (action === 'establish') {
          const goal = E.find(d.goals, payload.id);
          E.ensure(goal && !s.asked.includes(goal.id), '이미 확보했거나 알 수 없는 사실입니다.');
          E.ensure(Array.isArray(payload.basis) && payload.basis.length === goal.basis.length && new Set(payload.basis).size === payload.basis.length && goal.basis.every(id => payload.basis.includes(id)), '질문의 증거 근거가 맞지 않습니다.');
          line(s, d.profile.roles.respondent, goal.question, 'question');
          recordResponse(s, E.find(d.responses, goal.response), goal.id, payload.basis);
          s.asked.push(goal.id);
        } else if (action === 'select') {
          E.ensure(Array.isArray(payload.ids), '전제 목록이 필요합니다.');
          const p = E.argument(d, s).plan;
          E.ensure(new Set(payload.ids).size === payload.ids.length && payload.ids.length <= p.max && payload.ids.every(id => E.recordIds(s).includes(id) && p.premises.includes(id)), '기록된 호환 전제만 선택할 수 있습니다.');
          s.selected = [...payload.ids];
        } else if (action === 'press') {
          const r = E.response(d, s);
          const p = E.argument(d, s).plan;
          const premiseText = s.selected.map(id => E.find(d.propositions, id).short).join(' · ');
          line(s, d.profile.roles.respondent, premiseText + '. ' + p.question, 'question');
          commitPosition(s, 'press');
          recordResponse(s, r, p.id, []);
          if (s.presses.length) s.judgeObservation = '판사가 반복되는 결론 질문에 시선을 듭니다.';
          s.presses.push({ id: next(), responseId: r.id, premises: [...s.selected] });
        } else if (action === 'frame') {
          commitPosition(s, 'argument');
          line(s, d.profile.roles.respondent, E.argument(d, s).plan.statement, 'argument');
        } else if (action === 'stop') {
          s.resolution = { id: next(), ...E.resolve(d, s) }; s.phase = 'resolved';
          line(s, d.profile.roles.factFinder, '신문을 마칩니다. 남은 기록을 확인하겠습니다.', 'closing');
        }
        s.history.push({ id: next(), action, payload: E.copy(payload) });
        state = s;
        return { ok: true, view: projection() };
      } catch (error) { serial = beforeSerial; return { ok: false, error: error.message }; }
    }
    function projection() {
      const s = E.copy(state), theory = E.find(d.theories, s.theoryId), plan = E.find(d.argumentPlans, s.planId);
      return { state: s, case: E.copy(d), availability: E.availability(d, s), argument: E.copy(E.argument(d, s)),
        strategy: theory ? { ...E.copy(theory), preferred: theory.preferredPlans.includes(plan.id),
          potentialConflict: s.commitments.some(c => c.theoryId !== theory.id && !theory.contestedIssues.includes(c.issue)) } : null };
    }
    reset();
    return Object.freeze({ command, projection, reset });
  }
  const api = { createService };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmService = api;
})(globalThis);
