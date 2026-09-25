(function(root){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./core'):root.FirmEngine;
const C=typeof module!=='undefined'&&module.exports?require('./closing'):root.FirmClosing;
const sides=['claimant','respondent'];
function validate(d){
 const x=d.adjudication,declared=[!!x,!!d.profile.phases.verdict,d.profile.actions.includes('deliverVerdict')];
 E.ensure(declared.every(Boolean)||declared.every(v=>!v),'Incomplete verdict profile');if(!x)return;
 E.ensure(x.version&&x.factFinder==='judge'&&x.decisionRule==='all_required','Unsupported adjudication profile');
 E.ensure(x.evidenceSides&&sides.every(side=>Array.isArray(x.evidenceSides[side])&&x.evidenceSides[side].length&&x.evidenceSides[side].every(v=>typeof v==='string'&&v))&&new Set(sides.flatMap(side=>x.evidenceSides[side])).size===sides.flatMap(side=>x.evidenceSides[side]).length,'Invalid evidence side mapping');
 E.ensure(Array.isArray(x.issues)&&x.issues.length&&new Set(x.issues.map(i=>i.issue)).size===x.issues.length,'Invalid finding issues');
 const ruleIds=new Set();
 for(const config of x.issues){
  E.ensure(E.find(d.issues,config.issue),'Unknown finding issue');
  E.ensure(config.reasoning&&['missing','doubt','proven'].every(k=>typeof config.reasoning[k]==='string'&&config.reasoning[k]),'Missing finding reasoning');
  E.ensure(config.proof&&sides.every(side=>Array.isArray(config.proof[side]))&&Array.isArray(config.doubts),'Invalid finding rules');
  for(const r of [...sides.flatMap(side=>config.proof[side]),...config.doubts]){
   E.ensure(r.id&&!ruleIds.has(r.id),'Duplicate finding rule');ruleIds.add(r.id);
   E.ensure(Array.isArray(r.all)&&r.all.length&&new Set(r.all).size===r.all.length&&r.all.every(id=>{const p=E.find(d.propositions,id);return p&&E.find(d.argumentPlans,p.planId).issue===config.issue;}),'Foreign or empty finding premises');
   E.ensure(typeof r.text==='string'&&r.text,'Missing rule reasoning');
  }
  E.ensure(config.doubts.every(r=>sides.includes(r.against)),'Invalid doubt burden');
 }
 E.ensure(Array.isArray(x.requiredIssues)&&x.requiredIssues.length&&new Set(x.requiredIssues.map(r=>r.issue)).size===x.requiredIssues.length,'Invalid required issues');
 for(const r of x.requiredIssues)E.ensure(x.issues.some(i=>i.issue===r.issue)&&sides.includes(r.burden)&&r.standard==='beyond_reasonable_doubt','Unsupported required issue / burden / standard');
 for(const key of ['satisfied','notSatisfied'])E.ensure(x.outcomes?.[key]&&['code','title','text'].every(k=>typeof x.outcomes[key][k]==='string'&&x.outcomes[key][k]),'Missing verdict outcome');
}
function available(d,s){return !!d.adjudication&&!!d.profile.phases.verdict&&d.profile.actions.includes('deliverVerdict')&&!s.pendingQuestion&&!s.records.procedural.some(r=>r.kind==='verdict_delivered')&&d.witnesses.every(w=>s.endedWitnesses.includes(w.id))&&(d.profile.phases.closing?s.phase==='closed':s.phase==='resolved');}
function evaluate(d,records){
 validate(d);E.ensure(d.adjudication,'No adjudication profile');
 // Record references, not UI selections, questions, totals or advocacy strength, establish facts.
 const assessments=d.argumentPlans.map(p=>E.evaluateRecord(d,records,null,p.id));
 const closing=C.replay(d,records).position;
 const findings=d.adjudication.issues.map(config=>{
  const issue=config.issue,plans=d.argumentPlans.filter(p=>p.issue===issue),local=records.evidence.filter(r=>plans.some(p=>p.id===E.find(d.propositions,r.propositionId)?.planId));
  const localIds=new Set(local.map(r=>r.id)),as=assessments.filter(a=>a.scope===issue);
  const qualifiedCounterRefs=[...new Set(as.flatMap(a=>a.qualifiedCounterRefs))];
  const activeCounterRefs=[...new Set(as.flatMap(a=>a.activeCounterRefs))];
  const relations=as.flatMap(a=>a.commitmentRelations).filter(r=>localIds.has(r.recordRef)&&localIds.has(r.sourceRef));
  const supportStates=Object.assign({},...as.map(a=>a.supportStates));
  const usable=local.filter(r=>!qualifiedCounterRefs.includes(r.id)&&supportStates[r.id]!=='withdrawn'&&!relations.some(rel=>rel.recordRef===r.id&&rel.kind==='retreat'));
  const refs=rule=>usable.filter(r=>rule.all.includes(r.propositionId)).map(r=>r.id);
  const matches=rule=>rule.all.every(id=>usable.some(r=>r.propositionId===id));
  const doubts=config.doubts.filter(matches).map(r=>({id:r.id,against:r.against,evidenceRefs:refs(r),text:r.text}));
  const unresolvedConflicts=relations.filter(r=>r.kind==='contradiction');
  const matchedRoutes=Object.fromEntries(sides.map(side=>[side,config.proof[side].filter(matches).map(r=>({id:r.id,evidenceRefs:refs(r),text:r.text}))]));
  if(sides.every(side=>matchedRoutes[side].length))unresolvedConflicts.push({kind:'opposing_proof_routes',claimantRefs:matchedRoutes.claimant.flatMap(r=>r.evidenceRefs),respondentRefs:matchedRoutes.respondent.flatMap(r=>r.evidenceRefs)});
  const proof=Object.fromEntries(sides.map(side=>[side,{routes:matchedRoutes[side],established:matchedRoutes[side].length>0&&!doubts.some(r=>r.against===side)&&!unresolvedConflicts.length}]));
  const required=d.adjudication.requiredIssues.find(r=>r.issue===issue),burden=required?.burden||'claimant';
  const state=proof[burden].established?'established':doubts.some(r=>r.against===burden)||unresolvedConflicts.length?'unresolved':'not_established';
  const supportingEvidence=local.filter(r=>d.adjudication.evidenceSides.claimant.includes(E.find(d.propositions,r.propositionId).side)).map(r=>r.id);
  const opposingEvidence=local.filter(r=>d.adjudication.evidenceSides.respondent.includes(E.find(d.propositions,r.propositionId).side)).map(r=>r.id);
  const objections=records.procedural.filter(r=>r.kind==='objection'&&plans.some(p=>p.witnessId===r.witnessId));
  const transactionIds=new Set(objections.map(r=>r.questionId));
  const qualificationRefs=local.filter(r=>qualifiedCounterRefs.includes(r.qualifiesRecordId)).map(r=>r.id);
  const context={frameRefs:as.flatMap(a=>a.framedArguments.map(f=>f.recordId)),openingRefs:records.advocacy.filter(r=>r.kind==='major_commitment'&&r.issue===issue).map(r=>r.id),conflictRefs:records.advocacy.filter(r=>r.kind==='commitment_conflict'&&r.issue===issue).map(r=>r.id),closing:closing?{recordRef:closing.id,selected:closing.issueIds.includes(issue),arguments:closing.arguments.filter(a=>a.issue===issue),evidenceRefs:closing.evidenceRefs.filter(id=>localIds.has(id)),counters:closing.counters.filter(c=>c.issue===issue),positions:closing.positions.filter(p=>p.issue===issue)}:null};
  return {issue,title:E.find(d.issues,issue).title,required:!!required,burden:required?.burden||null,standard:required?.standard||null,state,
   supportingEvidence,opposingEvidence,evidenceRefs:local.map(r=>r.id),admissionRefs:local.filter(r=>r.commitment||E.find(d.propositions,r.propositionId).tags.includes('concession')).map(r=>r.id),activeCounterRefs,qualifiedCounterRefs,qualificationRefs,relations,supportStates,unresolvedConflicts,doubts,proof,advocacy:context,proceduralRefs:records.procedural.filter(r=>transactionIds.has(r.questionId)).map(r=>r.id),
   reasoning:(state==='established'?proof[burden].routes[0].text:config.reasoning[state==='unresolved'?'doubt':'missing'])+(activeCounterRefs.length?' 반대 설명도 기록에 남아 있다.':'')+(qualifiedCounterRefs.length?' 반대 설명에 대한 한정도 함께 고려했다.':'')};
 });
 const requirements=d.adjudication.requiredIssues.map(r=>({...r,satisfied:findings.find(f=>f.issue===r.issue).proof[r.burden].established}));
 const satisfied=requirements.every(r=>r.satisfied),outcome=d.adjudication.outcomes[satisfied?'satisfied':'notSatisfied'];
 return E.copy({definitionVersion:d.adjudication.version,factFinder:d.adjudication.factFinder,findings,verdict:{...outcome,decisionRule:d.adjudication.decisionRule,requirements,unprovedIssues:requirements.filter(r=>!r.satisfied).map(r=>r.issue)}});
}
function replay(d,records){
 const marker=records.procedural.find(r=>r.kind==='verdict_delivered');if(!marker)return null;
 E.ensure(marker.definitionVersion===d.adjudication?.version,'Adjudication definition mismatch');
 const input=Object.fromEntries(['evidence','advocacy','procedural'].map(layer=>{
  const refs=marker.inputRefs?.[layer];E.ensure(Array.isArray(refs)&&new Set(refs).size===refs.length,'Invalid decision input references');
  const selected=refs.map(id=>records[layer].find(r=>r.id===id));E.ensure(selected.every(Boolean),'Missing decision input record');return [layer,selected];
 }));
 return {recordRef:marker.id,...evaluate(d,input)};
}
const api={validate,available,evaluate,replay};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FirmAdjudication=api;
})(globalThis);
