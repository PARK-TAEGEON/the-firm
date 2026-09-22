'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url'),{createServer}=require('../serve');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,checks=0;const errors=[];
 const check=(ok,msg)=>{assert.ok(ok,msg);checks++;};
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1080}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  const click=async selector=>page.locator(selector).click();
  const action=async a=>{if(a==='stop'&&await page.locator('[data-action=close-argument]').count())await click('[data-action=close-argument]');return click(`[data-action="${a}"]`);};
  const response=async a=>click(`[data-response="${a}"]`);
  const facts=async ids=>{if(await page.locator('[data-action=close-argument]').count())await click('[data-action=close-argument]');for(const id of ids){if(!await page.locator(`[data-goal="${id}"]`).count()){const t=require('../data/case').threads.find(t=>t.goals.includes(id));await click(`[data-thread="${t.id}"]`);}await click(`[data-goal="${id}"]`);}};
  const select=async ids=>{if(await page.locator('[data-action=compose]').count())await click('[data-action=compose]');for(const id of ids)await click(`[data-premise="${id}"]`);};
  const start=async()=>{await click('footer [data-action="reset"]');await click('[data-theory="THEORY_IDENTITY"]');};
  const limited=async()=>{await facts(['G_DISTANCE','G_DURATION']);await select(['P_DISTANCE_27M','P_OBSERVATION_SHORT']);await action('press');};
  const text=async selector=>page.locator(selector).innerText();
  const shot=async name=>page.screenshot({path:path.join(__dirname,'artifacts',name+'.png'),fullPage:true});
  fs.mkdirSync(path.join(__dirname,'artifacts'),{recursive:true});
  await click('[data-theory="THEORY_IDENTITY"]');
  check(await page.locator('[data-premise]').count()===0,'No unrecorded tokens in normal mode');
  check(await page.locator('[data-action="compose"]').isDisabled(),'Cannot compose before facts');
  await facts(['G_INITIAL','G_DURATION','G_DISTANCE']);await select(['P_INITIAL_UNCERTAIN','P_OBSERVATION_SHORT','P_DISTANCE_27M']);
  check((await text('.conclusion')).includes('제한된 관찰과 초기 불확실성'),'Authored strong inference');
  check(await page.locator('#procedureActions').count()===0,'Clean questions have no procedure UI');
  check(await page.locator('.lane').evaluate(e=>e.getBoundingClientRect().bottom<innerHeight),'Lane above fold');
  check(await page.locator('.decisions').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),'Action buttons above fold');
  check(await page.locator('#scene').getAttribute('aria-live')===null,'Scene outside live region');
  check(await page.locator('#announcement').getAttribute('aria-live')==='polite','Small live region');
  check(await page.locator('.response-type,.inference-strength,.counter-status,.position-status,#pressureHint').count()===0,'No status badges or permanent hints');
  check(!/[✓✔★]/.test(await text('body')),'No decorative checks or stars');await shot('desktop-v06');
  await action('press');check((await text('#scene')).includes('단정'), 'Witness admission visible');
  check(await page.locator('#procedureActions').count()===0,'Strong Press clean');
  await action('frame');check(await page.locator('[data-action="frame"]').isDisabled(),'Duplicate Frame disabled');
  check((await text('#recordPanel')).includes('식별 한계 인정'),'Admission recorded');
  await action('open-strategy');await click('[data-theory="THEORY_INTENT"]');await click('#inferenceDetail summary');
  check((await text('#inferenceDetail')).includes('보조 쟁점'),'Theory B peripheral evaluation');
  check(!(await text('#recordPanel')).includes('공개 입장'),'Frame does not invent major commitment');
  await action('stop');check((await text('.result-box h1')).includes('약화'),'Record-based result');await click('.result-box summary');
  check((await text('.result-box')).includes('고의는 판단하지'),'Bounded result');
  // Basis permits the original explanation/counter; hard counter remains unanswerable.
  await start();await facts(['G_DISTANCE','G_LIGHTING']);await select(['P_DISTANCE_27M','P_LIGHTING_POOR']);await action('press');
  check(await page.locator('[data-response]').count()===4,'Four relevant form choices');await response('basis');
  check(await page.locator('#procedureActions').count()===0,'Procedure disappears after ruling');
  check((await text('#recordPanel')).includes('간판 불빛'),'Original hard counter retained');
  await page.locator('.record-item.evidence').filter({hasText:'간판 불빛'}).locator('summary').click();
  check((await text('#recordPanel')).includes('현장 사진이나 조도 자료'),'Hard counter explanation disclosed');
  check(await page.locator('[data-counter]').count()===0,'Hard counter has no response action');
  await action('stop');check((await text('.result-box h1')).includes('상반된'),'Counter affects result');
  // Court Address is temporary and contextual.
  await start();await limited();check((await text('#scene')).includes('이의'),'Form objection visible');
  check(await page.locator('.lane').count()===0,'Procedure replaces lane temporarily');await shot('objection-v06');
  await response('maintain');check(await page.locator('#addressContext').isVisible(),'Judge explanation request opens address');
  check(await page.locator('[data-response]').count()===3,'Only contextual address actions');
  check((await text('#addressContext')).length>10,'Existing inference supplies justification');await shot('court-address-v06');
  await response('justify');check(await page.locator('#addressContext').count()===0,'Court Address disappears');
  check(await page.locator('.lane').isVisible(),'Lane returns');
  check(await page.evaluate(()=>document.activeElement.closest('#examination')!==null),'Focus restored after response');
  check((await text('#announcement')).includes('서지훈'),'Latest answer announced');
  check(!(await text('#announcement')).includes('기록 연결'),'Past history not announced');
  // Repetition -> Maintain -> counter -> rebuttal -> reinforced Press.
  await action('press');check((await text('#scene')).includes('이미 답한'),'Repetition detected');
  check(await page.locator('[data-response="basis"]').count()===0,'Redundant basis action omitted for repetition');await response('maintain');
  await page.setViewportSize({width:390,height:844});await click('[data-evidence]');
  check(await page.locator('#evidenceDialog').isVisible(),'Mobile evidence dialog');await page.keyboard.press('Escape');
  check(!await page.locator('#evidenceDialog').isVisible(),'Evidence Escape');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile no overflow');
  await action('open-record');check(await page.locator('#recordDialog').isVisible(),'Mobile record sheet');
  await page.locator('.record-item.evidence').filter({hasText:'6년'}).locator('summary').click();
  check(await page.locator('[data-counter]').isDisabled(),'Counter missing basis disabled');
  check((await text('#recordDialog')).includes('최초 불확실'),'Missing basis disclosed');await page.keyboard.press('Escape');
  check(!await page.locator('#recordDialog').isVisible(),'Record Escape');
  await facts(['G_INITIAL']);await action('open-record');await click('[data-counter]');
  check((await text('#recordDialog')).includes('친분과 당시 식별의 확신은 구분됨'),'Counter qualification shown in details');
  check((await text('#recordDialog')).includes('6년'),'Original counter retained');
  check(await page.locator('[data-counter]').count()===0,'Completed counter action removed');await shot('mobile-record-v06');
  await click('#closeRecord');
  check(await page.evaluate(()=>new Set([...document.querySelectorAll('[id]')].map(e=>e.id)).size===document.querySelectorAll('[id]').length),'Record sheet no cloned IDs');
  await select(['P_INITIAL_UNCERTAIN']);await action('press');
  check((await text('#recordPanel')).includes('식별 한계 인정'),'Reinforced Press produces admission');
  await action('mobile-case');check(await page.locator('#mobileCaseInfo').isVisible(),'Mobile case information');
  check(await page.locator('[data-detail="case-issues"]').getAttribute('open')!==null,'Mobile issues open');
  check((await text('#mobileCaseInfo')).includes('무죄 판결'),'Client goal accessible');
  await action('stop');check((await text('.result-box h1')).includes('증인의 인정'),'Reinforced outcome');
  // Block / withdrawal / narrow / basis on the foundation question.
  for(const choice of ['maintain','withdraw','narrow','basis']){
   await start();await facts(['G_LIGHT_SOURCE']);
   check(!(await text('#recordPanel')).includes('조명 제한'),'No witness fact before ruling: '+choice);
   check(await page.locator('dialog[open]').count()===0,'No popup overlap during objection: '+choice);
   if(choice==='narrow'){await page.locator('#procedureActions').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,'artifacts','mobile-objection-v06.png')});}
   await response(choice);check(await page.locator('#procedureActions').count()===0,'Procedure cleared: '+choice);
   const summary=await page.locator('.record-item.evidence summary').allTextContents();
   check(summary.length===(choice==='basis'?2:choice==='narrow'?1:0),'Evidence count for '+choice);
   if(choice==='maintain'||choice==='withdraw')check(await page.locator('[data-goal="G_LIGHT_SOURCE"]').isEnabled(),'Blocked/withdrawn goal still available');
   if(choice==='narrow')check(!summary.some(t=>t.includes('간판')),'Narrow forfeits mixed light conclusion');
  }
  await shot('mobile-v06');
  // Safe stop and Frame remain distinct.
  for(const mode of ['safe','frame']){
   await start();await facts(['G_INITIAL','G_DURATION','G_DISTANCE']);
   if(mode==='frame'){await select(['P_INITIAL_UNCERTAIN','P_OBSERVATION_SHORT','P_DISTANCE_27M']);await action('frame');}
   await action('stop');check((await text('.result-box h1')).includes(mode==='safe'?'안전하게 보존':'논증으로 구축'),mode+' outcome');
   check(!(await text('#recordPanel')).includes('식별 한계 인정'),mode+' no invented admission');
  }
  // Preserve exact DOM, scroll, disclosure and keyboard focus during selection.
  await page.setViewportSize({width:1440,height:800});await start();await facts(['G_INITIAL','G_DURATION','G_DISTANCE']);await select(['P_INITIAL_UNCERTAIN','P_OBSERVATION_SHORT','P_DISTANCE_27M']);
  await page.evaluate(()=>{const details=document.querySelector('#recordPanel details');details.open=true;document.querySelector('#inferenceDetail').open=true;window.uiBefore={chip:document.querySelector('[data-premise="P_DISTANCE_27M"]'),details,record:document.querySelector('#recordPanel').firstElementChild};scrollTo(0,190);window.uiBefore.chip.focus({preventScroll:true});window.uiBefore.scroll=scrollY;window.uiBefore.live=document.querySelector('#announcement').textContent;});await page.keyboard.press('Space');
  check(await page.evaluate(()=>document.activeElement===window.uiBefore.chip),'Selection keyboard focus');
  check(await page.evaluate(()=>window.uiBefore.details.isConnected&&window.uiBefore.details.open),'Record details retained');
  check(await page.evaluate(()=>document.querySelector('#recordPanel').firstElementChild===window.uiBefore.record),'Record DOM preserved');
  check(await page.evaluate(()=>Math.abs(scrollY-window.uiBefore.scroll)<2),'Selection scroll preserved');
  check(await page.locator('#inferenceDetail').getAttribute('open')!==null,'Inference disclosure retained');
  check(await page.evaluate(()=>document.querySelector('#announcement').textContent===window.uiBefore.live),'Selection not announced as repeated dialogue');
  await page.keyboard.press('Space');check(await page.locator('[data-premise="P_DISTANCE_27M"]').getAttribute('aria-pressed')==='true','Keyboard reselect');
  await action('frame');check(await page.locator('#recordPanel details').first().getAttribute('open')!==null,'Disclosure survives service render');
  await page.locator('#recordFilter').selectOption('advocacy');check(await page.locator('.record-item.evidence').count()===0,'Record filter excludes evidence');
  check(await page.locator('.record-item.advocacy').count()===1,'Frame in advocacy filter');await page.locator('#recordFilter').selectOption('all');
  // Inference changes, mixed exploration and worse stopping result.
  await start();await facts(['G_DISTANCE','G_DURATION','G_INITIAL']);await select(['P_DISTANCE_27M','P_OBSERVATION_SHORT']);
  check((await text('.conclusion')).includes('제한된 관찰 기회'),'Limited variant');await select(['P_DISTANCE_27M','P_INITIAL_UNCERTAIN']);
  check((await text('.conclusion')).includes('사후 확신 강화 가능성'),'Different premises different inference');await select(['P_DISTANCE_27M']);await action('frame');
  await facts(['G_LIGHT_SOURCE']);await response('basis');await page.locator('#recordFilter').selectOption('procedural');
  check(await page.locator('.record-item.procedural').count()===1,'Objection response ruling grouped in one transaction');check(await page.locator('.record-item.evidence').count()===0,'Procedural filter excludes testimony');await page.locator('#recordFilter').selectOption('all');
  await action('stop');check((await text('.result-box h1')).includes('상반된'),'Continuing can worsen record');
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);await click('[data-theory="THEORY_IDENTITY"]');await action('stop');
  check((await text('.result-box h1')).includes('부족'),'Portable file URL zero-fact stop');check(errors.length===0,'No browser errors '+errors.join(';'));
  console.log(`Browser: ${checks} checks, 0 failures, exit 0`);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
