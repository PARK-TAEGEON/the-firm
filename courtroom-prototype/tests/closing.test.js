'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),D=require('../data/case'),E=require('../engine/core'),C=require('../engine/closing'),{createService}=require('../services/courtroom');
const settle=require('./settle-procedure');
const cmd=(s,a,p)=>{const r=settle(s,s.command(a,p));assert.ok(r.ok,r.error);return r.view;};
const fact=(s,id)=>cmd(s,'establish',{id,basis:D.goals.find(g=>g.id===id).basis});
const fresh=()=>{const s=createService(D);cmd(s,'strategy',{id:'THEORY_IDENTITY'});cmd(s,'opening',{ids:['OPEN_NO_CONTACT','OPEN_IDENTITY','OPEN_TIME_ARGUMENT']});return s;};
const finish=s=>{cmd(s,'stop');cmd(s,'witness',{id:'WITNESS_HSY'});cmd(s,'stop');return cmd(s,'beginClosing');};
function ready(){const s=fresh();for(const id of ['G_DISTANCE','G_DURATION','G_INITIAL'])fact(s,id);cmd(s,'select',{ids:['P_DISTANCE_27M','P_OBSERVATION_SHORT','P_INITIAL_UNCERTAIN']});cmd(s,'frame');cmd(s,'stop');cmd(s,'witness',{id:'WITNESS_HSY'});for(const id of ['G_PRINT_TIME','G_PRIOR_USE'])fact(s,id);cmd(s,'select',{ids:['P_PRINT_TIME_UNKNOWN','P_PRIOR_USE_POSSIBLE']});cmd(s,'frame');cmd(s,'stop');cmd(s,'beginClosing');return s;}
const empty=(issue='IDENTITY')=>({issueIds:[issue],argumentIds:[],evidenceRefs:[],counterRefs:[],positions:[]});
const selection=(s,index=0)=>{const a=s.projection().closingCatalog.arguments[index];return {...empty(a.issue),argumentIds:[a.id],evidenceRefs:a.evidenceRefs};};
const reject=(s,a,p)=>{const before=s.projection();assert.equal(s.command(a,p).ok,false);assert.deepEqual(s.projection(),before);};
test('Closing requires both ended examinations and cannot create evidence or alter earlier advocacy',()=>{
 const s=fresh();reject(s,'beginClosing');cmd(s,'stop');reject(s,'beginClosing');cmd(s,'witness',{id:'WITNESS_HSY'});cmd(s,'stop');const before=s.projection().state.records;cmd(s,'beginClosing');const v=cmd(s,'submitClosing',empty());assert.deepEqual(v.state.records.evidence,before.evidence);assert.deepEqual(v.state.records.procedural,before.procedural);assert.deepEqual(v.state.records.advocacy.slice(0,before.advocacy.length),before.advocacy);assert.equal(v.state.phase,'closed');assert.equal(v.closing.position.arguments.length,0);for(const a of ['submitClosing','beginClosing','strategy','witness','establish','stop'])reject(s,a,empty());
});
test('Case-wide catalog uses both witnesses and recorded frames; unrecorded variants unavailable',()=>{
 const s=ready(),v=s.projection();assert.equal(new Set(v.closingCatalog.arguments.map(a=>a.planId)).size,2);assert.ok(v.closingCatalog.arguments.some(a=>a.frameRefs.length));assert.ok(v.closingCatalog.arguments.every(a=>a.premises.every(id=>v.state.records.evidence.some(e=>e.propositionId===id))));
});
test('same CourtRecord and different selected arguments yield different Advocacy without auto inclusion',()=>{
 const s=ready(),v=s.projection(),a=selection(s),b=selection(s,v.closingCatalog.arguments.findIndex(a=>a.issue==='COMMISSION'));
 const x=C.synthesize(D,v.state.records,v.state.theoryId,a),y=C.synthesize(D,v.state.records,v.state.theoryId,b);assert.notEqual(x.text,y.text);assert.equal(x.arguments.length,1);assert.equal(y.arguments.length,1);assert.notEqual(x.arguments[0].id,y.arguments[0].id);assert.deepEqual(s.projection(),v);
});
test('published Closing replays from JSON CourtRecord without UI, history or witness state',()=>{
 const s=ready();const v=cmd(s,'submitClosing',selection(s));assert.deepEqual(C.replay(D,JSON.parse(JSON.stringify(v.state.records))),v.closing);assert.equal(v.closing.position.text,v.state.records.advocacy.find(r=>r.kind==='closing_position').text);
});
test('closing draft phase also replays from records, and reset clears it',()=>{const s=ready();assert.equal(C.replay(D,s.projection().state.records).phase,'closing');s.reset();assert.equal(s.projection().closing.phase,'not_started');});
test('Core/Peripheral independent of closing selection and no fabricated intent support',()=>{const s=ready(),v=s.projection(),p=selection(s);assert.equal(C.synthesize(D,v.state.records,'THEORY_IDENTITY',p).arguments[0].priority,'core');assert.equal(C.synthesize(D,v.state.records,'THEORY_INTENT',p).arguments[0].priority,'peripheral');assert.equal(v.closingCatalog.arguments.filter(a=>a.issue==='INTENT').length,0);assert.deepEqual(v.closingCatalog.clientObjectives,D.clientObjectives);});
test('Opening revision links original commitment and appends conflict, preserving Strategy Revision history',()=>{
 const s=fresh();cmd(s,'strategy',{id:'THEORY_INTENT'});finish(s);const v=s.projection(),original=v.caseRecord.commitments.find(c=>c.choiceId==='OPEN_NO_CONTACT'),p=empty('INTENT');p.positions=[{commitmentRef:original.id,mode:'revise',choiceId:'OPEN_CONTACT'}];const after=cmd(s,'submitClosing',p);assert.deepEqual(after.caseRecord.commitments,v.caseRecord.commitments);assert.equal(after.caseRecord.conflicts.length,2);const c=after.caseRecord.conflicts.at(-1);assert.equal(c.closingRef,after.closing.position.id);assert.equal(c.commitmentRef,original.id);assert.equal(after.closing.position.priorConflictRefs.length,1);assert.deepEqual(C.replay(D,after.state.records),after.closing);
});
test('maintaining or omitting public positions does not silently rewrite or invent conflicts',()=>{const s=ready(),p=empty();p.positions=[{commitmentRef:s.projection().caseRecord.commitments[0].id,mode:'maintain'}];const v=cmd(s,'submitClosing',p);assert.equal(v.closing.position.conflicts.length,0);assert.equal(v.caseRecord.commitments.length,3);assert.match(v.closing.position.text,/유지합니다/);});
test('missing, foreign, duplicate and incomplete argument references fail atomically',()=>{
 const s=ready(),p=selection(s);for(const bad of [{...p,evidenceRefs:[]},{...p,argumentIds:['missing']},{...p,argumentIds:[p.argumentIds[0],p.argumentIds[0]]},{...p,evidenceRefs:['missing']},{...p,issueIds:['INTENT']},{...p,counterRefs:[p.evidenceRefs[0]]},{...p,positions:[{commitmentRef:'missing',mode:'maintain'}]},{...p,issueIds:[]}])reject(s,'submitClosing',bad);
});
test('active counters and later witness qualifications remain in selected closing synthesis',()=>{
 const s=fresh();fact(s,'G_DISTANCE');fact(s,'G_DURATION');cmd(s,'press',{claimId:'CLAIM_SIGHT_LIMIT'});cmd(s,'press',{claimId:'CLAIM_SIGHT_EXCESS'});finish(s);const v=s.projection(),p=empty();p.evidenceRefs=v.closingCatalog.evidence.filter(e=>e.admission&&e.issue==='IDENTITY'&&e.side!=='counter').map(e=>e.id);p.counterRefs=v.closingCatalog.counters.filter(e=>e.issue==='IDENTITY').map(e=>e.id);assert.ok(p.counterRefs.length);const r=cmd(s,'submitClosing',p).closing.position;assert.ok(r.counters.every(c=>c.addressed));assert.ok(r.qualifications.some(q=>q.kind==='qualification'));for(const id of new Set(r.qualifications.map(q=>q.sourceRef))){const text=v.closingCatalog.evidence.find(e=>e.id===id).text;assert.ok(r.text.includes(text));assert.equal(r.text.split(text).length-1,1,'Qualification text is included once');}
});
test('qualified counter uses only actual recorded qualification and preserves adverse record',()=>{
 const s=fresh();fact(s,'G_DISTANCE');fact(s,'G_DURATION');cmd(s,'select',{ids:['P_DISTANCE_27M','P_OBSERVATION_SHORT']});cmd(s,'press');cmd(s,'press');fact(s,'G_INITIAL');cmd(s,'counter',{id:'COUNTER_INITIAL'});finish(s);const v=s.projection(),q=v.closingCatalog.counters.find(c=>c.qualified);assert.ok(q);const p=empty();p.counterRefs=[q.id];const out=cmd(s,'submitClosing',p);assert.match(out.closing.position.text,/한정도 함께/);assert.ok(out.state.records.evidence.some(e=>e.id===q.id));assert.ok(out.closing.position.counters[0].qualificationRefs.length);
});
test('unaddressed counters survive synthesis without being silently resolved',()=>{const s=fresh();for(const id of ['G_DISTANCE','G_DURATION'])fact(s,id);cmd(s,'press',{claimId:'CLAIM_SIGHT_EXCESS'});finish(s);const r=cmd(s,'submitClosing',empty()).closing.position;assert.ok(r.counters.length);assert.ok(r.counters.every(c=>!c.addressed));});

test('two witness arguments combine only their own cited premises in one Closing',()=>{
 const a=ready(),b=ready(),v=a.projection();assert.deepEqual(v.state.records,b.projection().state.records);
 const first=v.closingCatalog.arguments.find(x=>x.issue==='IDENTITY'),second=v.closingCatalog.arguments.find(x=>x.issue==='COMMISSION');
 const p={...empty(),issueIds:['IDENTITY','COMMISSION'],argumentIds:[first.id,second.id],evidenceRefs:[...new Set([...first.evidenceRefs,...second.evidenceRefs])]};
 const x=cmd(a,'submitClosing',p),y=cmd(b,'submitClosing',selection(b));assert.equal(x.closing.position.arguments.length,2);assert.equal(y.closing.position.arguments.length,1);assert.notEqual(x.state.records.advocacy.at(-1).text,y.state.records.advocacy.at(-1).text);assert.deepEqual(x.state.records.evidence,y.state.records.evidence);
});
