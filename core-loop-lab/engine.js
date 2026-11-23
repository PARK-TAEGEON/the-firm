(function(root){
'use strict';
const D=typeof module!=='undefined'?require('./data'):root.LabData;
const ids=Object.keys(D.issues), clone=x=>JSON.parse(JSON.stringify(x));
function initial(){return {phase:'brief',round:1,energy:D.energy,active:null,guard:null,mode:null,issues:Object.fromEntries(ids.map(id=>[id,{scope:'broad',sources:{},linked:false,admitted:false}])),records:[]};}
function strength(i){return Object.values(i.sources).reduce((a,x)=>a+x.value,0);}
function status(i){const n=strength(i);return i.scope==='narrow' ? n>=3?'limited':'open' : n>=5&&i.linked?'strong':'open';}
function outcome(s){return ids.map(id=>({id,status:status(s.issues[id]),scope:s.issues[id].scope,sources:Object.values(s.issues[id].sources).map(x=>x.recordId),linked:s.issues[id].linked}));}
function options(s){
 if(s.phase==='tactic')return ['question','evidence','concede','recover'].map(kind=>{
 const i=s.issues[s.active], cost=kind==='question'?1:kind==='evidence'?2:0;
 const guarded=s.guard===s.active&&s.mode===kind;
 const reason=i.sources[kind]?'이미 기록된 출처입니다. 반복해도 근거가 늘지 않습니다.':kind==='concede'&&i.admitted?'이미 인정했습니다.':s.energy<cost?'집중이 부족합니다. 기록 정리로 회복하세요.':'';
 return {kind,cost,guarded,reason};});
 if(s.phase==='revise')return ['hold','reinforce','narrow','switch'].map(kind=>{
 const i=s.issues[s.active];return {kind,cost:kind==='reinforce'?1:0,reason:kind==='reinforce'?(i.linked?'이미 연결했습니다.':Object.keys(i.sources).length<2?'질문과 증거 두 출처가 필요합니다.':s.energy<1?'집중 1이 필요합니다. 다음 공방에서 회복할 수 있습니다.':''):kind==='narrow'&&i.scope==='narrow'?'이미 한정 주장입니다.':''};});
 return [];
}
function transition(state,cmd){
 const s=clone(state);const add=(type,text,extra={})=>{const r={id:'R'+String(s.records.length+1).padStart(3,'0'),round:s.round,type,issue:s.active,text,...extra};s.records.push(r);return r.id;};
 if(s.phase==='brief'){
  if(cmd.type!=='start'||!ids.includes(cmd.issue))throw Error('주력 쟁점을 먼저 선택하세요.');
  s.active=cmd.issue;s.phase='tactic';add('opening',D.issues[s.active].broad);add('opponent',D.issues[s.active].claim);return s;
 }
 const o=options(s).find(x=>x.kind===cmd.type);if(!o||o.reason)throw Error(o?.reason||'지금 할 수 없는 행동입니다.');
 const i=s.issues[s.active],d=D.issues[s.active];s.energy-=o.cost;
 if(s.phase==='tactic'){
  if(cmd.type==='recover'){s.energy=Math.min(D.energy,s.energy+2);add('recovery','기록을 정리해 집중을 2 회복했습니다. 이번 공방에는 새 근거를 추가하지 않았습니다.');}
  else if(cmd.type==='concede'){i.admitted=true;i.scope='narrow';s.energy=Math.min(D.energy,s.energy+2);add('admission',d.admission+' 주장을 한정하고 집중을 2 회복합니다.');}
  else {const source=d[cmd.type],value=(cmd.type==='question'?2:3)-(o.guarded?1:0);const recordId=add('source',source.say,{source:source.source,kind:cmd.type,guarded:o.guarded});i.sources[cmd.type]={value,recordId};}
  if(cmd.type==='recover')add('opponent','새 근거가 없다면 기존 주장을 유지하겠습니다. 방어 태세는 바뀌지 않습니다.');
  else if(cmd.type==='concede'){s.guard=s.active;s.mode=null;add('opponent','인정한 부분은 기록에 남기겠습니다. 남은 한정 주장에만 답하겠습니다.');}
  else {s.guard=s.active;s.mode=cmd.type==='question'?'evidence':'question';add('opponent',d.counter[s.mode]+(o.guarded?' 준비한 반박으로 이번 자료의 설명력이 제한됐습니다.':''));}
  s.phase='revise';
 }else{
  if(cmd.type==='reinforce'){i.linked=true;for(const [kind,source]of Object.entries(i.sources))source.value=kind==='question'?2:3;add('link',d.link,{citations:Object.values(i.sources).map(x=>x.recordId)});}
  if(cmd.type==='narrow'){i.scope='narrow';s.energy=Math.min(D.energy,s.energy+1);add('revision','주장 축소: '+d.narrow+' 집중을 1 회복합니다. 이전의 넓은 주장은 기록에 남습니다.');}
  if(cmd.type==='hold'){s.energy=Math.min(D.energy,s.energy+1);add('revision','현재 주장을 유지하고 집중을 1 회복합니다.');}
  if(cmd.type==='switch'){const from=s.active;s.active=ids.find(id=>id!==from);add('revision',D.issues[from].name+'에서 '+D.issues[s.active].name+'으로 전환. 기존 기록은 유지됩니다.');}
  if(s.round===D.rounds){s.phase='result';add('end','여섯 공방을 마쳤습니다. 최종 주장의 범위와 출처를 검토합니다.');}
  else{s.round++;s.phase='tactic';add('opponent',D.issues[s.active].claim);}
 }
 return s;
}
function createService(){let state=initial(),commands=[];return {get:()=>clone(state),commands:()=>clone(commands),send(cmd){const next=transition(state,cmd);state=next;commands.push(clone(cmd));return clone(state);}};}
function replay(commands){return commands.reduce(transition,initial());}
const api={initial,transition,options,outcome,status,createService,replay};
if(typeof module!=='undefined')module.exports=api;else root.Lab=api;
})(typeof globalThis!=='undefined'?globalThis:this);
