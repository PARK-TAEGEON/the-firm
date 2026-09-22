(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./core') : root.FirmEngine;
  const config = (d,s) => ({...d.procedure,...E.find(d.argumentPlans,s.planId).procedure});
  function validate(d) {
    E.ensure(d.procedure && Array.isArray(d.procedure.rules), 'Missing procedure definitions');
    const p = d.procedure;
    E.ensure(['standard', 'strict'].includes(p.judge.proceduralStrictness) && ['patient', 'firm'].includes(p.judge.tolerance) && ['broad', 'narrow'].includes(p.judge.advocacyLatitude), 'Invalid judge profile');
    E.ensure(p.rules.length === 3 && new Set(p.rules.map(r => r.kind)).size === 3, 'Three authored procedural openings required');
    const allIds = [...d.threads.map(t=>t.id), d.id, d.profile.id, d.client.id, ...['parties','issues','theories','witnesses','evidence','propositions','goals','responses','argumentPlans','counterResponses'].flatMap(k => d[k].map(x => x.id)), ...d.argumentPlans.flatMap(x => x.inferenceVariants.map(v => v.id))];
    p.rules.forEach(r => { E.ensure(r.id && !allIds.includes(r.id) && ['repetition','foundation','form'].includes(r.kind) && r.title && r.objection, 'Invalid procedure rule'); allIds.push(r.id); });
    E.ensure(['respond','address','answer'].every(a => d.profile.actions.includes(a)), 'Missing procedural commands');
    E.ensure(p.narrowedPress.question && E.types.includes(p.narrowedPress.response.type) && p.narrowedPress.response.adds.length === 0, 'Narrowed pressure cannot create conclusion evidence');
    for(const plan of d.argumentPlans){
      const m=plan.procedure;if(!m)continue;
      if(m.judge) E.ensure(['standard','strict'].includes(m.judge.proceduralStrictness)&&['patient','firm'].includes(m.judge.tolerance)&&['broad','narrow'].includes(m.judge.advocacyLatitude),'Invalid plan judge');
      if(m.narrowedPress) E.ensure(m.narrowedPress.question&&E.types.includes(m.narrowedPress.response.type)&&m.narrowedPress.response.adds.length===0,'Invalid narrowed plan response');
      const b=m.basisChoice;if(!b)continue;
      E.ensure(b.min===1&&b.max===2&&b.candidates.length>=2&&new Set(b.candidates.map(c=>c.kind+':'+c.sourceId)).size===b.candidates.length,'Invalid basis candidates');
      E.ensure(b.inferenceIds.length&&b.inferenceIds.every(id=>plan.inferenceVariants.some(v=>v.id===id)),'Unknown basis inference');
      b.candidates.forEach(c=>{E.ensure(['record','evidence'].includes(c.kind)&&E.find(c.kind==='record'?d.propositions:d.evidence,c.sourceId)&&Array.isArray(c.coverage)&&c.coverage.length,'Invalid basis source');if(c.kind==='record')E.ensure(E.find(d.propositions,c.sourceId).planId===plan.id,'Foreign basis record');else E.ensure(E.find(d.witnesses,plan.witnessId).evidenceIds.includes(c.sourceId),'Foreign basis evidence');});
      E.ensure(b.requiredCoverage.length&&b.requiredCoverage.every(x=>b.candidates.some(c=>c.coverage.includes(x))),'Unreachable basis coverage');
    }
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
    let basis = rule.kind === 'foundation' ? meta.basisEvidence.map(id => ({ kind: 'evidence', refId: id, title: E.find(d.evidence,id).title })) :
      p.premises.map(id => ({ kind: 'record', refId: s.records.evidence.find(r => r.propositionId === id).id, title: E.find(d.propositions,id).short }));
    const choice=plan.procedure?.basisChoice;
    const pick=rule.kind==='form'&&choice?.inferenceIds.includes(p.inferenceId);
    if(pick)basis=choice.candidates.flatMap(c=>{const record=c.kind==='record'?s.records.evidence.find(r=>r.propositionId===c.sourceId):null;if(c.kind==='record'&&!record)return [];return [{kind:c.kind,refId:record?.id||c.sourceId,title:c.kind==='record'?E.find(d.propositions,c.sourceId).short:E.find(d.evidence,c.sourceId).title}];});
    return { pendingId: p.id, stage: p.stage, objection: rule.title, actions: p.stage === 'objection' ? (rule.kind === 'repetition' ? ['maintain','narrow','withdraw'] : pick ? ['basis','narrow','withdraw'] : ['maintain','basis','narrow','withdraw']) : p.stage === 'address' ? ['justify','narrow','withdraw'] : [],
      basis, pickBasis: !!pick && basis.length>1, basisMin: pick?choice.min:basis.length, basisMax: pick?choice.max:basis.length, issue: plan.issue, inferenceId: inference?.id || null,
      justification: rule.kind === 'foundation' ? meta.justification : inference?.text,
      question: p.text };
  }
  function checkBasis(d, s, payload) {
    const o = options(d,s);
    E.ensure(Array.isArray(payload.basis)&&payload.basis.length>=o.basisMin&&payload.basis.length<=o.basisMax&&new Set(payload.basis.map(b=>JSON.stringify([b.kind,b.refId]))).size===payload.basis.length&&payload.basis.every(b=>o.basis.some(x=>x.kind===b.kind&&x.refId===b.refId)), '현재 질문에 연결된 근거가 필요합니다.');
    E.ensure(payload.issue === o.issue && payload.inferenceId === o.inferenceId, '현재 쟁점과 논증을 연결해야 합니다.');
  }
  function rule(d,s,response,payload={}) {
    const pending = s.pendingQuestion, kind = E.find(d.procedure.rules,pending.ruleId).kind, judge = config(d,s).judge;
    const messages=config(d,s).messages;
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
    const choice=E.find(d.argumentPlans,pending.planId).procedure?.basisChoice;
    if(choice?.inferenceIds.includes(pending.inferenceId)&&['basis','justify'].includes(response)){
      const covered=payload.basis.flatMap(b=>{const sourceId=b.kind==='record'?s.records.evidence.find(r=>r.id===b.refId)?.propositionId:b.refId;return choice.candidates.find(c=>c.kind===b.kind&&c.sourceId===sourceId)?.coverage||[];});
      if(choice.requiredCoverage.some(c=>!covered.includes(c)))return {outcome:'limited',proceed:true,narrowed:true,text:'제시한 근거가 결론까지 뒷받침하지는 않습니다. 확인된 범위에 한정하십시오.',reason:'basis_scope_limit'};
    }
    return judge.advocacyLatitude === 'broad' && judge.proceduralStrictness === 'standard' ?
      { outcome: 'overruled', proceed: true, text: messages.connected, reason: 'connected_argument' } :
      { outcome: 'limited', proceed: true, narrowed: true, text: messages.limited, reason: 'discretion_form_limit' };
  }
  const api = { config, validate, opening, options, checkBasis, rule };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmProcedure = api;
})(globalThis);
