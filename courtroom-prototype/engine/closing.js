(function(root){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./core'):root.FirmEngine;
function catalog(d,records,theoryId){
 const assessments=d.argumentPlans.map(p=>E.evaluateRecord(d,records,theoryId,p.id));
 const theory=E.find(d.theories,theoryId);
 const evidence=records.evidence.map(r=>{const p=E.find(d.propositions,r.propositionId);return {...E.copy(r),issue:E.find(d.argumentPlans,p.planId).issue,title:p.short,text:p.text,side:p.side,admission:!!r.commitment||p.tags.includes('concession')};});
 const argumentsList=d.argumentPlans.flatMap(p=>p.inferenceVariants.filter(v=>v.premises.every(id=>evidence.some(e=>e.propositionId===id))).map(v=>({id:v.id,planId:p.id,issue:p.issue,title:v.title,text:v.text,premises:v.premises,
  evidenceRefs:evidence.filter(e=>v.premises.includes(e.propositionId)).map(e=>e.id),frameRefs:E.evaluateRecord(d,records,theoryId,p.id).framedArguments.filter(a=>a.inferenceId===v.id).map(a=>a.recordId)||[],
  priority:theory?.contestedIssues.includes(p.issue)?(theory.preferredPlans.includes(p.id)?'core':'relevant'):'peripheral'})));
 const counters=evidence.filter(e=>e.side==='counter').map(e=>{const a=assessments.find(a=>a.evidenceRefs.includes(e.id));return {...e,qualified:a.qualifiedCounterRefs.includes(e.id),qualificationRefs:records.evidence.filter(q=>q.qualifiesRecordId===e.id&&a.qualifiedCounterRefs.includes(e.id)).map(q=>q.id)};});
 return {arguments:argumentsList,evidence,counters,commitments:records.advocacy.filter(r=>r.kind==='major_commitment'),assessments,clientObjectives:E.copy(d.clientObjectives)};
}
function synthesize(d,records,theoryId,input){
 const c=catalog(d,records,theoryId),theory=E.find(d.theories,theoryId);E.ensure(theory,'Unknown closing strategy');
 const list=(key)=>{const x=input[key];E.ensure(Array.isArray(x)&&new Set(x).size===x.length,'중복 없는 선택 목록이 필요합니다.');return x;};
 const issueIds=list('issueIds'),argumentIds=list('argumentIds'),evidenceRefs=list('evidenceRefs'),counterRefs=list('counterRefs');
 E.ensure(issueIds.length&&issueIds.every(id=>E.find(d.issues,id)),'변론할 쟁점을 선택하십시오.');
 const args=argumentIds.map(id=>E.find(c.arguments,id));E.ensure(args.every(a=>a&&issueIds.includes(a.issue)),'선택한 쟁점의 기록된 논증만 사용할 수 있습니다.');
 const evidence=evidenceRefs.map(id=>E.find(c.evidence,id));E.ensure(evidence.every(e=>e&&issueIds.includes(e.issue)&&e.side!=='counter'),'선택한 쟁점의 증언만 인용할 수 있습니다.');
 E.ensure(args.every(a=>a.premises.every(id=>evidence.some(e=>e.propositionId===id))),'논증에 필요한 기록을 연결하십시오.');
 const counters=counterRefs.map(id=>E.find(c.counters,id));E.ensure(counters.every(x=>x&&issueIds.includes(x.issue)),'선택한 쟁점의 반박 기록만 다룰 수 있습니다.');
 E.ensure(Array.isArray(input.positions),'공개 입장 선택이 필요합니다.');
 const seen=new Set(),positions=input.positions.map(x=>{
  const original=E.find(c.commitments,x.commitmentRef);E.ensure(original&&!seen.has(original.id),'유효한 공개 입장을 한 번만 선택하십시오.');seen.add(original.id);
  E.ensure(['maintain','revise'].includes(x.mode),'입장 처리 방식을 선택하십시오.');
  const option=x.mode==='maintain'?E.find(d.opening.options,original.choiceId):E.find(d.opening.options,x.choiceId);
  E.ensure(option&&(x.mode==='maintain'||option.id!==original.choiceId&&(option.issue===original.issue||option.position&&original.position&&option.position.key===original.position.key)),'연결 가능한 수정 입장이 아닙니다.');
  return {commitmentRef:original.id,mode:x.mode,choiceId:option.id,issue:option.issue,position:option.position||null,text:option.closingText||option.text};
 });
 const pos=new Map();for(const p of positions)if(p.position){E.ensure(!pos.has(p.position.key)||pos.get(p.position.key)===p.position.value,'서로 모순되는 최종 입장입니다.');pos.set(p.position.key,p.position.value);}
 const conflicts=c.commitments.flatMap(original=>positions.filter(p=>original.position&&p.position&&original.position.key===p.position.key&&original.position.value!==p.position.value).map(p=>({commitmentRef:original.id,choiceId:p.choiceId,issue:original.issue,text:original.text+' 최종 입장: '+p.text})));
 const relevantCounters=c.counters.filter(x=>issueIds.includes(x.issue));
 const qualifications=c.assessments.flatMap(a=>a.commitmentRelations).filter(r=>evidenceRefs.includes(r.recordRef)||evidenceRefs.includes(r.sourceRef));
 const lines=[issueIds.map(id=>E.find(d.issues,id).title).join(' · ')+' 쟁점을 중심으로 말씀드리겠습니다.',...positions.map(p=>p.mode==='maintain'?'개회사에서 밝힌 입장을 유지합니다. '+p.text:'개회사에서 밝힌 입장을 수정합니다. '+p.text),
 ...evidence.map(e=>'기록된 증언을 인용합니다. '+e.text),...args.map(a=>a.text),
 ...[...new Set(qualifications.map(q=>q.sourceRef))].filter(id=>!counterRefs.includes(id)&&!evidenceRefs.includes(id)).map(id=>'이 진술에는 후속 설명이 남아 있습니다. '+E.find(c.evidence,id).text),
 ...counters.map(x=>'불리한 기록도 다루겠습니다. '+x.text+(x.qualified?' 다만 기록된 한정도 함께 보아야 합니다. '+x.qualificationRefs.map(id=>E.find(c.evidence,id).text).join(' '):' 이 한계는 기록에 남아 있습니다.')),
 '의뢰인의 요청은 '+d.clientObjectives.primary+'입니다.'];
 return E.copy({theoryId,issueIds,arguments:args,evidenceRefs,counters:relevantCounters.map(x=>({...x,addressed:counterRefs.includes(x.id)})),qualifications,positions,conflicts,
  priorConflictRefs:records.advocacy.filter(r=>r.kind==='commitment_conflict').map(r=>r.id),clientObjectives:d.clientObjectives,text:lines.join('\n\n')});
}
function replay(d,records){
 const closing=records.advocacy.find(r=>r.kind==='closing_position');
 if(!closing)return {phase:records.advocacy.some(r=>r.kind==='closing_started')?'closing':'not_started',position:null};
 // Exclude later advocacy so the closing's own conflicts cannot become its prior conflicts.
 const prior={...records,advocacy:records.advocacy.slice(0,records.advocacy.indexOf(closing))};
 return {phase:'closed',position:{id:closing.id,...synthesize(d,prior,closing.theoryId,closing.selection)}};
}
const api={catalog,synthesize,replay};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FirmClosing=api;
})(globalThis);
