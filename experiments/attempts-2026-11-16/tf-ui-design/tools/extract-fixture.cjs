'use strict';
// Offline evidence extraction only. The mockup never loads a game service.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../../..'),out=path.resolve(__dirname,'..');
const sha=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
if(sha!=='d6fa4a303691f60eedf79b829780f443f915e245') throw Error('Extract only from pinned runtime HEAD');
const c=require(path.join(root,'courtroom-prototype/data/demo-separated-moments.js'));
const service=require(path.join(root,'courtroom-prototype/services/plan-demo.js'));
const pick=(x,ks)=>Object.fromEntries(ks.filter(k=>x[k]!==undefined).map(k=>[k,x[k]]));
const safeRecord=r=>pick(r,['id','seq','kind','source','witnessId','refId','memo','lines','blockedReason']);
const reports={};
for(const [key,useLayout] of [['included',true],['excluded',false]]){
 const r=service.play({useLayout});
 reports[key]={plan:r.plan,records:r.records.map(safeRecord),results:Object.fromEntries(['video','medical','layout'].map(k=>[k,{performed:r.results[k].performed,recordId:r.results[k].record?.id||null}])),outcome:{...pick(r.outcome,['key','headline','text','pronouncement','judgment','offense','sentence']),issues:r.outcome.issues.map(x=>pick(x,['id','title','bandLabel','memo']))}};
}
const cards=c.variants.novice.cards.filter(x=>['CARD_SIG_SEQUENCE','CARD_SIG_MEDICAL','CARD_SIG_LAYOUT','CARD_SIG_CONTACT'].includes(x.id));
const fixture={version:'1.0.0',fixture:true,baseline:sha,consultation:c.presentation.consultation,speakers:{...Object.fromEntries(c.presentation.consultation.speakers.map(s=>[s.id,s.name])),W_SIG_OBSERVER:'한지수',W_SIG_INVESTIGATOR:'서동국',PROSECUTOR:'검찰 · 윤가람',JUDGE:'재판장',CLIENT:'정민호'},cards:cards.map(x=>pick(x,['id','title','text','description','detail','source','lines'])),reports};
fs.mkdirSync(path.join(out,'evidence'),{recursive:true});
fs.writeFileSync(path.join(out,'fixture.js'),'window.TF_FIXTURE = '+JSON.stringify(fixture,null,2)+';\n');
const files=cp.execFileSync('git',['ls-tree','-r','--name-only',sha],{cwd:root,encoding:'utf8'}).trim().split('\n');
const hashes=files.map(file=>({path:file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')}));
fs.writeFileSync(path.join(out,'evidence/protected-files.json'),JSON.stringify({baseline:sha,algorithm:'SHA-256',files:hashes},null,2)+'\n');
console.log(JSON.stringify({baseline:sha,protected:files.length,consultationLines:fixture.consultation.lines.length,records:Object.fromEntries(Object.entries(reports).map(([k,r])=>[k,r.records.length])),cards:fixture.cards}));
