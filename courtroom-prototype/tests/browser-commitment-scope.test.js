'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),{createServer}=require('../serve');
(async()=>{const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;const errors=[];const check=(x,m)=>{assert.ok(x,m);checks++;};
try{for(const width of [1440,390])for(const issue of ['IDENTITY','INTENT']){
 const page=await browser.newPage({viewport:{width,height:width===1440?1080:844}});page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(issue=>{
  // Reverse direction uses an explicit scope fixture; no new Intent case content is shipped.
  if(issue==='INTENT')Object.defineProperty(window,'FirmCase',{configurable:true,set(d){d.argumentPlans[0].issue='INTENT';for(const c of d.opening.options)if(c.planId===d.argumentPlans[0].id)c.issue='INTENT';Object.defineProperty(window,'FirmCase',{value:d});}});
  Object.defineProperty(window,'FirmService',{configurable:true,set(api){Object.defineProperty(window,'FirmService',{value:{createService(d){const s=api.createService(d);window.inspectCourt=()=>s.projection();return s;}}});}});
 },issue);
 const click=q=>page.locator(q).click(),action=a=>click(`[data-action="${a}"]`),view=()=>page.evaluate(()=>inspectCourt());
 await page.goto('http://127.0.0.1:'+server.address().port);await click('[data-theory="THEORY_IDENTITY"]');
 for(const id of ['OPEN_NO_CONTACT','OPEN_IDENTITY','OPEN_INTENT'])await click(`[data-opening="${id}"]`);await action('opening');const before=await view();
 await action('open-strategy');await click('[data-theory="THEORY_INTENT"]');let v=await view();check(v.caseRecord.conflicts.length===1,'Factual strategy conflict remains');check(v.assessment.strategy.commitmentReviewRefs.length===0,'Priority or strategy conflict alone is not evidentiary challenge');
 await click('[data-thread="THREAD_OBSERVATION"]');for(const id of ['G_DISTANCE','G_DURATION'])await click(`[data-goal="${id}"]`);
 for(const id of ['CLAIM_SIGHT_LIMIT','CLAIM_SIGHT_EXCESS']){await action('press');await click(`[data-claim="${id}"]`);}
 v=await view();const expected=before.caseRecord.commitments.filter(c=>c.issue===issue).map(c=>c.id);
 check(v.assessment.activeCounterRefs.length>0,'Actual examination records an active counter');check(JSON.stringify(v.assessment.strategy.commitmentReviewRefs)===JSON.stringify(expected),issue+' reviews only same issue');check(JSON.stringify(v.caseRecord.commitments)===JSON.stringify(before.caseRecord.commitments),'No public record rewrite');
 const replay=await page.evaluate(()=>{const v=inspectCourt();return {assessment:FirmEngine.evaluateRecord(v.case,JSON.parse(JSON.stringify(v.state.records)),v.state.theoryId,v.state.planId),public:FirmOpening.replay(v.case,JSON.parse(JSON.stringify(v.state.records)))};});
 check(JSON.stringify(replay.assessment)===JSON.stringify(v.assessment),'Record-only examination replay');check(JSON.stringify(replay.public)===JSON.stringify(v.caseRecord),'Opening and strategy replay');
 await action('stop');check(await page.locator('.result-box').isVisible(),'Path completes');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');await page.close();
}
check(!errors.length,'No page errors: '+errors.join(';'));console.log(`Cross-issue browser: ${checks} checks, 0 failures, exit 0`);
}finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
