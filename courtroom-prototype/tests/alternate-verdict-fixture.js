'use strict';
const D=require('../data/case');
module.exports=function alternateCase(){
 const d=JSON.parse(JSON.stringify(D));
 for(const [issue,id] of [['IDENTITY','P_TEST_ATTACKER'],['COMMISSION','P_TEST_OFFENSE_USE']]){
  const p=d.argumentPlans.find(p=>p.issue===issue),w=d.witnesses.find(w=>w.planId===p.id);
  d.propositions.push({id,planId:p.id,short:'검증용 직접 진술',text:'UI 검증용 직접 진술: '+issue,tags:[],side:'prosecution'});
  d.adjudication.issues.find(i=>i.issue===issue).proof.claimant=[{id:'PROOF_'+id,all:[id],text:'검증용 직접 진술이 해당 연결을 뒷받침한다.'}];
  if(w.directResponse)d.responses.find(r=>r.id===w.directResponse).adds.push(id);
  else {w.directResponse='R_TEST_DIRECT';d.responses.push({id:w.directResponse,type:'EXPLAIN',text:'UI 검증용 직접 진술입니다.',adds:[id]});}
 }
 return d;
};
