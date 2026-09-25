'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../data/case'),E=require('../engine/core'),O=require('../engine/opening'),{createService}=require('../services/courtroom');
const settle=require('./settle-procedure');
const cmd=(s,a,p)=>{const r=settle(s,s.command(a,p));assert.ok(r.ok,r.error);return r.view;};
const fresh=(theory='THEORY_IDENTITY')=>{const s=createService(D);cmd(s,'strategy',{id:theory});return s;};
const open=(s,ids=['OPEN_PRESENT','OPEN_IDENTITY','OPEN_SIGHT','OPEN_TIME_ARGUMENT'])=>cmd(s,'opening',{ids});
const reject=(s,a,p)=>{const before=s.projection();assert.equal(s.command(a,p).ok,false);assert.deepEqual(s.projection(),before);};
test('opening gates examination, choices are advocacy only and cannot be resubmitted',()=>{
 const s=fresh();assert.equal(s.projection().state.phase,'opening');for(const a of ['stop','frame','press','witness'])reject(s,a,{id:'WITNESS_HSY'});
 const v=open(s);assert.equal(v.state.phase,'examine');assert.equal(v.state.records.evidence.length,0);assert.equal(v.caseRecord.commitments.length,4);assert.equal(v.caseRecord.opening.choiceIds.length,4);
 assert.ok(v.caseRecord.commitments.every(c=>c.openingRef===v.caseRecord.opening.id&&c.scope==='case'));
 reject(s,'opening',{ids:['OPEN_INTENT']});assert.equal(v.assessment.framedArguments.length,0);
});
test('invalid, duplicate and mutually inconsistent opening choices fail atomically',()=>{
 const s=fresh();for(const ids of [[],null,['bad'],['OPEN_CONTACT','OPEN_CONTACT'],['OPEN_CONTACT','OPEN_NO_CONTACT']])reject(s,'opening',{ids});
 const clean=fresh();assert.deepEqual(open(s).state.records,open(clean).state.records);
});
test('strategy revisions preserve opening and evidence, record explicit referential conflicts',()=>{
 const s=fresh();open(s,['OPEN_NO_CONTACT','OPEN_IDENTITY']);cmd(s,'establish',{id:'G_DISTANCE',basis:D.goals.find(g=>g.id==='G_DISTANCE').basis});
 const before=s.projection().state.records;const v=cmd(s,'strategy',{id:'THEORY_INTENT'});
 assert.deepEqual(v.state.records.evidence,before.evidence);assert.deepEqual(v.state.records.advocacy.slice(0,before.advocacy.length),before.advocacy);
 assert.equal(v.caseRecord.conflicts.length,1);const c=v.caseRecord.conflicts[0];assert.equal(c.commitmentRef,v.caseRecord.commitments[0].id);assert.equal(c.revisionRef,v.caseRecord.revisions[0].id);
 assert.equal(v.caseRecord.workingStrategy,D.theories[1].workingStrategy);assert.deepEqual(v.caseRecord.clientObjectives,D.clientObjectives);
 const back=cmd(s,'strategy',{id:'THEORY_IDENTITY'});assert.equal(back.caseRecord.conflicts.length,1);assert.equal(back.caseRecord.activeConflictRefs.length,0);
 const again=cmd(s,'strategy',{id:'THEORY_INTENT'});assert.equal(again.caseRecord.conflicts.length,2);assert.notEqual(again.caseRecord.conflicts[0].revisionRef,again.caseRecord.conflicts[1].revisionRef);
 reject(s,'strategy',{id:'THEORY_INTENT'});reject(s,'strategy',{id:'bad'});
});
test('priority change alone is not a factual conflict and initial private/public conflict is visible',()=>{
 const s=fresh();open(s);assert.equal(cmd(s,'strategy',{id:'THEORY_INTENT'}).caseRecord.conflicts.length,0);
 const b=fresh('THEORY_INTENT');assert.equal(open(b,['OPEN_NO_CONTACT']).caseRecord.conflicts.length,1);
 const c=fresh('THEORY_INTENT');assert.equal(open(c,['OPEN_CONTACT','OPEN_INTENT']).caseRecord.conflicts.length,0);
});
test('record-only replay recovers public state and latest strategy with no history or selection',()=>{
 const s=fresh();open(s,['OPEN_NO_CONTACT']);cmd(s,'strategy',{id:'THEORY_INTENT'});const v=s.projection();
 assert.deepEqual(O.replay(D,JSON.parse(JSON.stringify(v.state.records))),v.caseRecord);
 const snapshot=JSON.stringify(v.state.records);O.replay(D,v.state.records);assert.equal(JSON.stringify(v.state.records),snapshot);
});
test('opening issue links reach witness arguments and actual evidence; Theory B remains peripheral',()=>{
 const s=fresh();open(s,['OPEN_SIGHT','OPEN_TIME_ARGUMENT']);
 for(const id of ['G_DISTANCE','G_DURATION','G_INITIAL'])cmd(s,'establish',{id,basis:D.goals.find(g=>g.id===id).basis});
 cmd(s,'select',{ids:['P_DISTANCE_27M','P_OBSERVATION_SHORT','P_INITIAL_UNCERTAIN']});const v=cmd(s,'frame');
 assert.equal(v.caseRecord.commitments.length,2);assert.equal(v.caseRecord.links[0].arguments.length,1);assert.equal(v.caseRecord.links[0].arguments[0].evidenceRefs.length,3);assert.equal(v.caseRecord.links[0].priority,'core');
 const b=cmd(s,'strategy',{id:'THEORY_INTENT'});assert.equal(b.assessment.framedArguments[0].value,'peripheral');assert.equal(b.caseRecord.links[0].priority,'peripheral');
 const publicBefore=b.caseRecord.commitments;cmd(s,'stop');const forensic=cmd(s,'witness',{id:'WITNESS_HSY'});assert.deepEqual(forensic.caseRecord.commitments,publicBefore);assert.equal(forensic.state.records.evidence.filter(e=>e.witnessId==='WITNESS_HSY').length,2);
});
test('bad authored opening references fail construction',()=>{
 for(const change of [d=>d.opening.options[0].issue='bad',d=>d.opening.options[0].id=d.opening.options[1].id,d=>d.opening.options[0].id=d.goals[0].id,d=>d.opening.options[0].planId='bad',d=>delete d.theories[1].workingPositions]){const d=E.copy(D);change(d);assert.throws(()=>createService(d));}
});
test('same examination commands yield identical semantic evidence and outcomes with/without opening',()=>{
 const legacy=E.copy(D);delete legacy.opening;const a=createService(legacy),b=createService(D);
 for(const s of [a,b]){cmd(s,'strategy',{id:'THEORY_IDENTITY'});if(s===b)open(s);for(const id of ['G_DISTANCE','G_DURATION','G_INITIAL'])cmd(s,'establish',{id,basis:D.goals.find(g=>g.id===id).basis});cmd(s,'select',{ids:['P_DISTANCE_27M','P_OBSERVATION_SHORT','P_INITIAL_UNCERTAIN']});cmd(s,'press',{claimId:'CLAIM_SIGHT_LIMIT'});cmd(s,'press',{claimId:'CLAIM_SIGHT_EXCESS'});cmd(s,'stop');}
 const semantic=s=>s.projection().state.records.evidence.map(({propositionId,testimony,commitment,rehabilitationOpportunity})=>({propositionId,testimony,commitment,rehabilitationOpportunity}));assert.deepEqual(semantic(a),semantic(b));assert.equal(a.projection().assessment.code,b.projection().assessment.code);
});

for (const issue of ['IDENTITY','INTENT']) test(`${issue} counter reviews only same-issue public commitments after Opening and strategy revision`,()=>{
 const d=E.copy(D);
 // Reverse direction is a scope fixture, not newly authored Intent gameplay.
 if(issue==='INTENT') { d.argumentPlans[0].issue='INTENT'; for(const c of d.opening.options)if(c.planId===d.argumentPlans[0].id)c.issue='INTENT'; }
 const s=createService(d);cmd(s,'strategy',{id:'THEORY_IDENTITY'});open(s,['OPEN_IDENTITY','OPEN_INTENT','OPEN_NO_CONTACT']);
 const original=s.projection().caseRecord.commitments;
 cmd(s,'strategy',{id:'THEORY_INTENT'});
 assert.deepEqual(s.projection().assessment.strategy.commitmentReviewRefs,[], 'priority change and factual strategy conflict are not evidentiary challenges');
 for(const id of ['G_DISTANCE','G_DURATION'])cmd(s,'establish',{id,basis:d.goals.find(g=>g.id===id).basis});
 cmd(s,'press',{claimId:'CLAIM_SIGHT_LIMIT'});cmd(s,'press',{claimId:'CLAIM_SIGHT_EXCESS'});
 const v=s.projection(), same=original.filter(c=>c.issue===issue).map(c=>c.id), foreign=original.filter(c=>c.issue!==issue).map(c=>c.id);
 assert.ok(v.assessment.activeCounterRefs.length>0);assert.deepEqual(v.assessment.strategy.commitmentReviewRefs,same);
 assert.ok(foreign.every(id=>!v.assessment.strategy.commitmentReviewRefs.includes(id)));
 assert.deepEqual(v.caseRecord.commitments,original);assert.equal(v.caseRecord.conflicts.length,1,'authored strategy conflict preserved separately');
 const records=JSON.parse(JSON.stringify(v.state.records));
 for(const theory of d.theories) assert.deepEqual(E.evaluateRecord(d,records,theory.id,d.argumentPlans[0].id).strategy.commitmentReviewRefs,same,'evidentiary review independent of priority');
 assert.deepEqual(O.replay(d,records),v.caseRecord);
 const other=E.evaluateRecord(d,records,'THEORY_INTENT',d.argumentPlans[1].id);assert.deepEqual(other.strategy.commitmentReviewRefs,[],'other plan does not import counter');
});

test('peripheral Frame keeps priority without challenging its same-issue commitment',()=>{
 const s=fresh();open(s,['OPEN_IDENTITY']);for(const id of ['G_DISTANCE','G_DURATION','G_INITIAL'])cmd(s,'establish',{id,basis:D.goals.find(g=>g.id===id).basis});
 cmd(s,'select',{ids:['P_DISTANCE_27M','P_OBSERVATION_SHORT','P_INITIAL_UNCERTAIN']});cmd(s,'frame');
 const a=s.projection();assert.equal(a.assessment.framedArguments[0].value,'core');
 const b=cmd(s,'strategy',{id:'THEORY_INTENT'});assert.equal(b.assessment.framedArguments[0].value,'peripheral');assert.deepEqual(b.assessment.strategy.commitmentReviewRefs,[]);assert.equal(b.assessment.strategy.positionStatus,'committed');
});

for(const issue of ['IDENTITY','INTENT'])test(`record-only ${issue} counter cannot contaminate the opposite issue`,()=>{
 const d=E.copy(D);d.argumentPlans[0].issue=issue;
 const records={evidence:[{id:'counter',propositionId:'P_SIGN_LIGHT'}],procedural:[],advocacy:[{id:'identity-public',kind:'major_commitment',issue:'IDENTITY'},{id:'intent-public',kind:'major_commitment',issue:'INTENT'}]};
 const result=E.evaluateRecord(d,records,'THEORY_IDENTITY',d.argumentPlans[0].id);
 assert.deepEqual(result.activeCounterRefs,['counter']);assert.deepEqual(result.strategy.commitmentReviewRefs,[issue==='IDENTITY'?'identity-public':'intent-public']);
});

test('all theories must explicitly declare every position key, including unspecified',()=>{
 for(const change of [d=>delete d.theories[0].workingPositions.contact,d=>d.theories[0].workingPositions.contact='',d=>d.theories[0].workingPositions.contact=null,d=>d.theories[0].workingPositions=[],d=>d.theories[1].workingPositions.extra='admitted',d=>d.opening.options[0].position={key:'new-key',value:'denied'}]){const d=E.copy(D);change(d);assert.throws(()=>createService(d),/Every theory/);}
 const s=fresh();assert.equal(open(s,['OPEN_NO_CONTACT']).caseRecord.activeConflictRefs.length,0);assert.equal(cmd(s,'strategy',{id:'THEORY_INTENT'}).caseRecord.activeConflictRefs.length,1);assert.equal(cmd(s,'strategy',{id:'THEORY_IDENTITY'}).caseRecord.activeConflictRefs.length,0);
});

test('case-wide links explicitly represent issue progression, not evidentiary support',()=>{
 const s=fresh();const v=open(s,['OPEN_IDENTITY']);assert.equal(v.caseRecord.links[0].relationKind,'issue_progression');assert.deepEqual(v.caseRecord.links[0].arguments,[]);assert.equal(v.state.records.evidence.length,0);
});
