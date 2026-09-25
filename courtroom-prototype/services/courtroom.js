(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('../engine/core.js') : root.FirmEngine;
  const P = typeof module !== 'undefined' && module.exports ? require('../engine/procedure.js') : root.FirmProcedure;
  const O = typeof module !== 'undefined' && module.exports ? require('../engine/opening.js') : root.FirmOpening;
  const C = typeof module !== 'undefined' && module.exports ? require('../engine/closing.js') : root.FirmClosing;
  function createService(definition) {
    const d = E.copy(definition); E.validate(d); P.validate(d); O.validate(d);
    let serial = 0, session = 0, state;
    const next = () => d.id + ':runtime:' + (++serial);
    function reset() {
      state = { session: ++session, phase: 'plan', theoryId: null, planId: d.witnesses[0].planId, selected: [], asked: [], presses: [],
        witnessId:d.witnesses[0].id, visitedWitnesses:[], endedWitnesses:[], threadId:null, followupGoalId:null,
        records: { evidence: [], procedural: [], advocacy: [] }, pendingQuestion: null, history: [], resolution: null,
        witnessObservation: d.witnesses[0].initialObservation, judgeObservation: '쟁점 중심의 질문을 기다립니다.', lastResponseType: null,
        dialogue: [{ id: next(), speaker: d.profile.roles.factFinder, text: d.opening ? '변호인, 개회사를 준비하십시오.' : '변호인, 반대신문을 준비하십시오.', kind: 'opening' }] };
      return projection();
    }
    function line(s, speaker, text, kind) { s.dialogue.push({ id: next(), speaker, text, kind, witnessId:s.witnessId }); }
    function recordResponse(s, r, source, basis, provenance = {}) {
      line(s, E.find(d.witnesses,s.witnessId).name, r.text, 'answer');
      s.lastResponseType = r.type;
      if (r.observation) s.witnessObservation = r.observation;
      const relations=(r.relations||[]).flatMap(rel=>{const target=s.records.evidence.find(e=>e.witnessId===s.witnessId&&e.propositionId===rel.propositionId&&e.commitment);return target?[{kind:rel.kind,recordRef:target.id}]:[];});
      const supportEffects=(r.supportEffects||[]).flatMap(effect=>{const target=s.records.evidence.find(e=>e.witnessId===s.witnessId&&e.propositionId===effect.propositionId);return target?[{recordRef:target.id,status:effect.status}]:[];});
      for (const id of r.adds) if (!E.recordIds(s).includes(id) || r.relations?.length || (r.commitments?.includes(id)&&!E.commitments(s).includes(id))) s.records.evidence.push({ id: next(), propositionId: id, witnessId: s.witnessId, source, basis: [...basis], responseId: r.id, testimony: r.text, commitment:!!r.commitments?.includes(id), relations, supportEffects, rehabilitationOpportunity:!!r.rehabilitationOpportunity, ...provenance });
    }
    function commitPosition(s, kind, claim = null) {
      const argument = E.argument(d, s), p = argument.plan, inference = argument.inference;
      const item = { id: next(), kind, theoryId: s.theoryId, planId: p.id, issue: p.issue, premises: [...s.selected],
        inferenceId: inference?.id || null, claimId:claim?.id || null, text: kind === 'argument' ? inference.text : claim?.question || p.question };
      s.records.advocacy.push(item);
    }
    function procedural(s, questionId, kind, fields) { s.records.procedural.push({ id: next(), questionId, kind, ...E.copy(fields) }); }
    function performQuestion(s, action, payload) {
      if (action === 'establish') {
        const goal = E.find(d.goals,payload.id);
        recordResponse(s,goal.responseRoutes?E.routeResponse(d,s,goal.responseRoutes):E.find(d.responses,goal.response),goal.id,payload.basis); s.asked.push(goal.id);
        s.followupGoalId=goal.followup||null;
      } else if (action === 'press') {
        const pressure = E.pressure(d,s,payload.claimId), r = E.response(d,s,payload.claimId), p = E.argument(d,s).plan;
        commitPosition(s,'press',E.find(p.claimVariants||[],payload.claimId)); recordResponse(s,r,p.id,[]);
        s.presses.push({ id: next(), responseId: r.id, planId: p.id, claimId:payload.claimId || null, ...pressure, premises: [...s.selected] });
      } else {
        const route = E.find(d.counterResponses,payload.id), target = s.records.evidence.find(r => r.propositionId === route.target);
        const premiseRefs = route.requires.map(id => s.records.evidence.find(r => r.propositionId === id).id);
        recordResponse(s,E.find(d.responses,route.response),route.id,[],{ qualifiesRecordId: target.id,premiseRefs });
      }
    }
    function beginQuestion(s, action, payload, text) {
      line(s,d.profile.roles.respondent,text,'question');
      const opening = P.opening(d,s,action,payload);
      if (!opening) { performQuestion(s,action,payload); return; }
      const argument = E.argument(d,s);
      const pending = { id: next(), action, payload: E.copy(payload), text, ruleId: opening.id, stage: 'objection',
        planId: s.planId, inferenceId: argument.inference?.id || null, premises: [...s.selected] };
      s.pendingQuestion = pending;
      procedural(s,pending.id,'objection',{ titleShort: action==='establish'?E.find(d.goals,payload.id).title:E.find(d.argumentPlans,s.planId).title, witnessId:s.witnessId, ruleId: opening.id, title: opening.title, question: text });
      line(s,d.profile.roles.claimant,opening.objection,'objection');
    }
    function respond(s, action, payload) {
      const pending = s.pendingQuestion, options = P.options(d,s);
      E.ensure(payload.pendingId === pending.id, '현재 질문에 대한 대응이 아닙니다.');
      E.ensure(options.actions.includes(payload.response), '현재 사용할 수 없는 대응입니다.');
      if (['basis','justify'].includes(payload.response)) P.checkBasis(d,s,payload);
      const decision = P.rule(d,s,payload.response,payload);
      const linked = ['basis','justify'].includes(payload.response);
      procedural(s,pending.id,'response',{ response: payload.response, basis: linked ? payload.basis.map(({kind,refId}) => ({kind,refId})) : [], issue: linked ? payload.issue : null, inferenceId: linked ? payload.inferenceId : null });
      if (decision.requestAddress) {
        pending.stage = 'address'; procedural(s,pending.id,'court_instruction',{ text: decision.text, reason: decision.reason });
        line(s,d.profile.roles.factFinder,decision.text,'instruction'); return;
      }
      procedural(s,pending.id,'court_ruling',{ outcome: decision.outcome, reason: decision.reason, text: decision.text });
      line(s,decision.outcome === 'withdrawn' ? d.profile.roles.respondent : d.profile.roles.factFinder,decision.text,'ruling');
      if (decision.outcome === 'withdrawn') procedural(s,pending.id,'question_withdrawn',{ text: pending.text });
      if (decision.narrowed) procedural(s,pending.id,'question_limited',{ original: pending.text, reason: decision.reason });
      if (!decision.proceed) { s.pendingQuestion = null; return; }
      pending.stage = 'answer'; pending.narrowed = !!decision.narrowed;
    }
    function command(action, payload = {}) {
      const beforeSerial = serial;
      try {
        E.ensure(d.profile.actions.includes(action), '허용되지 않은 행동입니다.');
        const s = E.copy(state), a = E.availability(d, s);
        E.ensure(a[action], '현재 상태에서는 실행할 수 없습니다.');
        if (action === 'beginClosing') {
          s.records.advocacy.push({id:next(),kind:'closing_started',scope:'case',theoryId:s.theoryId,text:'최종변론을 준비합니다.'});
          s.phase='closing';s.resolution=null;s.selected=[];
        } else if (action === 'submitClosing') {
          const result=C.synthesize(d,s.records,s.theoryId,payload);
          const closing={id:next(),kind:'closing_position',scope:'case',theoryId:s.theoryId,selection:E.copy(payload),text:result.text};
          s.records.advocacy.push(closing);
          for(const p of result.positions.filter(p=>p.mode==='revise'))s.records.advocacy.push({id:next(),kind:'closing_revision',scope:'case',closingRef:closing.id,...p});
          for(const c of result.conflicts)s.records.advocacy.push({id:next(),kind:'commitment_conflict',scope:'case',closingRef:closing.id,theoryId:s.theoryId,...c});
          s.phase='closed';line(s,d.profile.roles.respondent,result.text,'closing_position');
        } else if (action === 'strategy') {
          E.ensure(E.find(d.theories, payload.id), '알 수 없는 전략입니다.');
          E.ensure(s.theoryId !== payload.id, '이미 선택한 전략입니다.');
          const fromTheoryId = s.theoryId;
          s.theoryId = payload.id;
          if (d.opening && O.replay(d,s.records).opening) {
            const revision = {id:next(),kind:'strategy_revision',scope:'case',fromTheoryId,theoryId:s.theoryId,text:E.find(d.theories,s.theoryId).workingStrategy};
            s.records.advocacy.push(revision);
            for (const c of O.conflicts(d,s.records,s.theoryId)) s.records.advocacy.push({id:next(),kind:'commitment_conflict',scope:'case',commitmentRef:c.id,revisionRef:revision.id,theoryId:s.theoryId,issue:c.issue,text:c.text+' 현재 전략: '+revision.text});
          }
          s.phase = d.opening && !O.replay(d,s.records).opening ? 'opening' : 'examine';
          if(s.phase==='examine'&&!s.visitedWitnesses.includes(s.witnessId)){s.visitedWitnesses.push(s.witnessId);const w=E.find(d.witnesses,s.witnessId);if(w.directResponse)recordResponse(s,E.find(d.responses,w.directResponse),w.id,[],{examination:'direct'});}
        } else if (action === 'opening') {
          const choices = O.selection(d,payload.ids);
          const opening = {id:next(),kind:'opening_position',scope:'case',theoryId:s.theoryId,choiceIds:choices.map(c=>c.id),text:choices.map(c=>c.text).join(' ')};
          s.records.advocacy.push(opening);
          for (const c of choices) s.records.advocacy.push({id:next(),kind:'major_commitment',scope:'case',openingRef:opening.id,theoryId:s.theoryId,choiceId:c.id,issue:c.issue,planId:c.planId||null,position:c.position||null,text:c.text});
          // An initially inconsistent private plan is recorded too, never silently repaired.
          for (const c of O.conflicts(d,s.records,s.theoryId)) s.records.advocacy.push({id:next(),kind:'commitment_conflict',scope:'case',commitmentRef:c.id,openingRef:opening.id,theoryId:s.theoryId,issue:c.issue,text:c.text+' 현재 전략: '+E.find(d.theories,s.theoryId).workingStrategy});
          line(s,d.profile.roles.respondent,opening.text,'opening_position');
          s.phase='examine';s.visitedWitnesses.push(s.witnessId);
          const w=E.find(d.witnesses,s.witnessId);if(w.directResponse)recordResponse(s,E.find(d.responses,w.directResponse),w.id,[],{examination:'direct'});
        } else if (action === 'witness') {
          const w=E.find(d.witnesses,payload.id);E.ensure(w&&w.id!==s.witnessId,'현재 증인이거나 알 수 없는 증인입니다.');
          s.witnessId=w.id;s.planId=w.planId;s.witnessObservation=w.initialObservation;s.lastResponseType=null;s.selected=[];s.threadId=null;s.followupGoalId=null;s.resolution=null;
          s.phase=s.endedWitnesses.includes(w.id)?'resolved':'examine';
          if(!s.visitedWitnesses.includes(w.id)){s.visitedWitnesses.push(w.id);if(w.directResponse)recordResponse(s,E.find(d.responses,w.directResponse),w.id,[],{examination:'direct'});else line(s,d.profile.roles.factFinder,w.name+' 증인, 질문에 답하십시오.','opening');}
          else line(s,d.profile.roles.factFinder,w.name+' 신문 기록을 확인합니다.','opening');
          if(s.phase==='resolved')s.resolution={id:next(),...E.resolve(d,s)};
        } else if (action === 'thread') {
          const t=E.find(d.threads,payload.id);E.ensure(t&&t.witnessId===s.witnessId,'현재 증인의 질문 방향이 아닙니다.');s.threadId=t.id;s.followupGoalId=null;
        } else if (action === 'endThread') {
          s.threadId=null;s.followupGoalId=null;
        } else if (action === 'establish') {
          const goal = E.find(d.goals, payload.id);
          E.ensure(goal && a.goals.some(item => item.id === goal.id && item.available), '이미 확보했거나 알 수 없는 사실입니다.');
          E.ensure(Array.isArray(payload.basis) && payload.basis.length === goal.basis.length && new Set(payload.basis).size === payload.basis.length && goal.basis.every(id => payload.basis.includes(id)), '질문의 증거 근거가 맞지 않습니다.');
          s.threadId=d.threads.find(t=>t.goals.includes(goal.id)).id;s.followupGoalId=null;
          beginQuestion(s,'establish',payload,goal.question);
        } else if (action === 'select') {
          E.ensure(Array.isArray(payload.ids), '전제 목록이 필요합니다.');
          const p = E.argument(d, s).plan;
          E.ensure(new Set(payload.ids).size === payload.ids.length && payload.ids.length <= p.max && payload.ids.every(id => E.recordIds(s).includes(id) && p.premises.includes(id)), '기록된 호환 전제만 선택할 수 있습니다.');
          s.selected = [...payload.ids];
        } else if (action === 'press') {
          const p = E.argument(d, s).plan;
          const premiseText = s.selected.map(id => E.find(d.propositions, id).short).join(' · ');
          const claim=E.find(p.claimVariants||[],payload.claimId);
          E.ensure(payload.claimId?!!claim:E.argument(d,s).valid,'현재 질문의 결론 범위를 선택하십시오.');
          beginQuestion(s,'press',payload,claim?claim.question:premiseText + '. ' + p.question);
        } else if (action === 'counter') {
          const route = E.find(d.counterResponses, payload.id);
          E.ensure(route && a.counters.some(c => c.id === route.id && c.available), '반박에 필요한 기록이 없거나 이미 대응했습니다.');
          beginQuestion(s,'counter',payload,route.question);
        } else if (action === 'respond' || action === 'address') {
          respond(s,action,payload);
        } else if (action === 'answer') {
          const pending = s.pendingQuestion;
          E.ensure(payload.pendingId === pending.id, '현재 허용된 질문이 아닙니다.');
          if (pending.narrowed) {
            const narrowed = pending.action === 'press' ? P.config(d,s).narrowedPress : E.find(d.goals,pending.payload.id).procedure.narrowed;
            line(s,d.profile.roles.respondent,narrowed.question,'question');
            const response = typeof narrowed.response === 'string' ? E.find(d.responses,narrowed.response) : { id: pending.ruleId, ...narrowed.response };
            recordResponse(s,response,pending.id,[],{ proceduralQuestionId: pending.id });
          } else performQuestion(s,pending.action,pending.payload);
          s.pendingQuestion = null;
        } else if (action === 'frame') {
          commitPosition(s, 'argument');
          line(s, d.profile.roles.respondent, E.argument(d, s).inference.text, 'argument');
        } else if (action === 'stop') {
          s.resolution = { id: next(), ...E.resolve(d, s) }; s.phase = 'resolved'; s.endedWitnesses.push(s.witnessId);s.threadId=null;s.followupGoalId=null;
          line(s, d.profile.roles.factFinder, '신문을 마칩니다. 남은 기록을 확인하겠습니다.', 'closing');
        }
        s.history.push({ id: next(), action, payload: E.copy(payload) });
        const view = projection(s);
        state = s;
        return { ok: true, view };
      } catch (error) { serial = beforeSerial; return { ok: false, error: error.message }; }
    }
    function projection(source = state) {
      const s = E.copy(source), theory = E.find(d.theories, s.theoryId), plan = E.find(d.argumentPlans, s.planId);
      return { closing: C.replay(d,s.records), closingCatalog:C.catalog(d,s.records,s.theoryId), caseRecord: O.replay(d,s.records,s.theoryId), state: s, case: E.copy(d), availability: E.availability(d, s), argument: E.copy(E.argument(d, s)),
        pressure: E.pressure(d, s), procedure: E.copy(P.options(d,s)), assessment: E.copy(E.evaluateRecord(d, s.records, s.theoryId,s.planId)), assessments:d.argumentPlans.map(p=>E.evaluateRecord(d,s.records,s.theoryId,p.id)), witness:E.copy(E.find(d.witnesses,s.witnessId)), threads:E.copy(d.threads.filter(t=>t.witnessId===s.witnessId)),
        strategy: theory ? { ...E.copy(theory), preferred: theory.preferredPlans.includes(plan.id),
          potentialConflict: O.conflicts(d,s.records,theory.id).length > 0 } : null };
    }
    reset();
    return Object.freeze({ command, projection, reset });
  }
  const api = { createService };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmService = api;
})(globalThis);
