(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./core') : root.FirmEngine;
  function validate(d) {
    E.ensure(d.procedure && Array.isArray(d.procedure.rules), 'Missing procedure definitions');
    const p = d.procedure;
    E.ensure(['standard', 'strict'].includes(p.judge.proceduralStrictness) && ['patient', 'firm'].includes(p.judge.tolerance) && ['broad', 'narrow'].includes(p.judge.advocacyLatitude), 'Invalid judge profile');
    E.ensure(p.rules.length === 3 && new Set(p.rules.map(r => r.kind)).size === 3, 'Three authored procedural openings required');
    const allIds = [d.id, d.profile.id, d.client.id, ...['parties','issues','theories','witnesses','evidence','propositions','goals','responses','argumentPlans','counterResponses'].flatMap(k => d[k].map(x => x.id)), ...d.argumentPlans.flatMap(x => x.inferenceVariants.map(v => v.id))];
    p.rules.forEach(r => { E.ensure(r.id && !allIds.includes(r.id) && ['repetition','foundation','form'].includes(r.kind) && r.title && r.objection, 'Invalid procedure rule'); allIds.push(r.id); });
    E.ensure(['respond','address','answer'].every(a => d.profile.actions.includes(a)), 'Missing procedural commands');
    E.ensure(p.narrowedPress.question && E.types.includes(p.narrowedPress.response.type) && p.narrowedPress.response.adds.length === 0, 'Narrowed pressure cannot create conclusion evidence');
    for (const g of d.goals.filter(g => g.procedure)) {
      const m = g.procedure;
      E.ensure(m.foundationRefs.length && m.foundationRefs.every(id => E.find(d.propositions,id)), 'Unknown procedural foundation');
      E.ensure(m.basisEvidence.length && m.basisEvidence.every(id => E.find(d.evidence,id)), 'Unknown procedural evidence');
      E.ensure(m.narrowed.question && E.find(d.responses,m.narrowed.response), 'Invalid narrowed question');
    }
  }
  function opening(d, s, action, payload) {
    let kind;
    if (action === 'press') {
      if (E.pressure(d,s).kind === 'repeated') kind = 'repetition';
      else if (E.argument(d,s).inference.strength === 'limited') kind = 'form';
    } else if (action === 'establish') {
      const meta = E.find(d.goals,payload.id).procedure;
      if (meta && meta.foundationRefs.some(id => !E.recordIds(s).includes(id))) kind = 'foundation';
    }
    return d.procedure.rules.find(r => r.kind === kind) || null;
  }
  function options(d, s) {
    const p = s.pendingQuestion;
    if (!p) return null;
    const rule = E.find(d.procedure.rules,p.ruleId);
    const meta = p.action === 'establish' ? E.find(d.goals,p.payload.id).procedure : null;
    const plan = E.find(d.argumentPlans,p.planId), inference = plan.inferenceVariants.find(v => v.id === p.inferenceId);
    const basis = rule.kind === 'foundation' ? meta.basisEvidence.map(id => ({ kind: 'evidence', refId: id, title: E.find(d.evidence,id).title })) :
      p.premises.map(id => ({ kind: 'record', refId: s.records.evidence.find(r => r.propositionId === id).id, title: E.find(d.propositions,id).short }));
    return { pendingId: p.id, stage: p.stage, objection: rule.title, actions: p.stage === 'objection' ? (rule.kind === 'repetition' ? ['maintain','narrow','withdraw'] : ['maintain','basis','narrow','withdraw']) : p.stage === 'address' ? ['justify','narrow','withdraw'] : [],
      basis, issue: plan.issue, inferenceId: inference?.id || null,
      justification: rule.kind === 'foundation' ? '최초 진술의 조명 설명을 확인하려는 질문입니다.' : inference?.text,
      question: p.text };
  }
  function checkBasis(d, s, payload) {
    const o = options(d,s);
    E.ensure(Array.isArray(payload.basis) && payload.basis.length === o.basis.length && new Set(payload.basis.map(b => JSON.stringify([b.kind,b.refId]))).size === o.basis.length &&
      o.basis.every(b => payload.basis.some(x => x.kind === b.kind && x.refId === b.refId)), '현재 질문에 연결된 근거가 필요합니다.');
    E.ensure(payload.issue === o.issue && payload.inferenceId === o.inferenceId, '현재 쟁점과 논증을 연결해야 합니다.');
  }
  function rule(d,s,response) {
    const pending = s.pendingQuestion, kind = E.find(d.procedure.rules,pending.ruleId).kind, judge = d.procedure.judge;
    if (response === 'withdraw') return { outcome: 'withdrawn', proceed: false, text: '질문을 철회합니다.', reason: 'withdrawal' };
    if (response === 'narrow') return { outcome: 'limited', proceed: true, narrowed: true, text: kind === 'foundation' ? '조명 상태를 먼저 확인하십시오.' : '확인된 조건에 한해 물으십시오.', reason: 'scope_narrowed' };
    if (kind === 'foundation') return response === 'basis' ?
      { outcome: 'overruled', proceed: true, text: '최초 진술과의 대조 질문을 허용합니다.', reason: 'prior_statement_basis' } :
      { outcome: 'sustained', proceed: false, text: '전제를 먼저 확인하십시오.', reason: 'missing_foundation' };
    if (kind === 'repetition') {
      const previous = s.presses.filter(p => p.planId === pending.planId && pending.premises.every(id => p.premises.includes(id))).at(-1);
      const answer = previous && E.find(d.responses,previous.responseId);
      const clarification = answer && ['RESIST','EXPLAIN'].includes(answer.type);
      if (clarification && judge.tolerance === 'patient') return { outcome: 'overruled', proceed: true, text: '이전 답변의 확인 범위에서 허용합니다.', reason: 'ambiguous_answer_clarification' };
      return { outcome: 'sustained', proceed: false, text: '이미 답했습니다. 다른 질문을 하십시오.', reason: clarification ? 'discretion_repetition_limit' : 'answered_conclusion' };
    }
    if (response === 'maintain') return { requestAddress: true, text: '이 질문이 어떤 쟁점을 확인하는지 설명하십시오.', reason: 'explain_issue_connection' };
    return judge.advocacyLatitude === 'broad' && judge.proceduralStrictness === 'standard' ?
      { outcome: 'overruled', proceed: true, text: '기록된 관찰 조건과 연결된 질문으로 허용합니다.', reason: 'connected_argument' } :
      { outcome: 'limited', proceed: true, narrowed: true, text: '식별 결론 대신 관찰 조건에 한정하십시오.', reason: 'discretion_form_limit' };
  }
  const api = { validate, opening, options, checkBasis, rule };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmProcedure = api;
})(globalThis);
