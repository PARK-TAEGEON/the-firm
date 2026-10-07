'use strict';
const { chromium }=require('playwright'), assert=require('node:assert/strict'), path=require('node:path'), {pathToFileURL}=require('node:url');
(async()=>{
 const b=await chromium.launch({headless:true});let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
 try{
  for(const width of [1440,390]) for(const onlyInvestigator of [false,true]){
   const page=await b.newPage({viewport:{width,height:900}});page.setDefaultTimeout(4000);
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../demo.html')).href);
   await page.click('[data-action=start]');await page.click('[data-scene=all]');await page.click('[data-scene=finish]'); await page.click('[data-action=closeReader]');
   const judgeProfile = async (selector, capture=false) => {
    await page.click(selector);await page.waitForSelector('#reader[open]');
    check(await page.textContent('#readerTitle')==='문혜진 프로필','judge profile available');
    check(await page.evaluate(()=>{const el=document.querySelector('#readerTitle');return !el.matches(':focus-visible') && getComputedStyle(el).outlineStyle==='none';}),'programmatic non-visible focus has no outline');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'profile no overflow');
    if(capture)await page.screenshot({animations:'disabled',path:path.resolve(__dirname,'artifacts/ui2-'+width+'-judge-profile.png'),fullPage:true});
    await page.keyboard.press('Escape');await page.waitForFunction(sel=>document.activeElement===document.querySelector(sel),selector);
    check(!(await page.isVisible('#reader')),'profile closes with original focus');
   };
   if(!onlyInvestigator)await page.screenshot({animations:'disabled',path:path.resolve(__dirname,'artifacts/ui2-'+width+'-prep.png'),fullPage:true});
   await judgeProfile('#caseTitle [data-action=profile]',!onlyInvestigator);
   if(width===390)await page.click('[data-action=panel][data-id=filePanel]');
   check((await page.textContent('#filePanel')).includes('재판부·상대'),'combined court and opponent panel');
   await judgeProfile('#filePanel [data-action=profile][data-id=JUDGE]');
   if(width===390)await page.click('[data-action=panel][data-id=courtPanel]');
   await page.click('[data-action=finishPrep]');await judgeProfile('#caseTitle [data-action=profile]');await page.click('label:has(input[value=F_SIG_CAUSE])');await page.click('label:has(input[value=S_SIG_CONTACT])');await page.click('[data-action=open]');
   await judgeProfile('#caseTitle [data-action=profile]');
   check(await page.locator('.evidence-opinion').count()===4,'four exhibits');
   check(!(await page.textContent('#stage')).includes('열람하지 않은 증거입니다'),'no unread warning');
   for(const id of ['PX_SIG_STATEMENT','PX_SIG_REPORT','PX_SIG_VIDEO','PX_SIG_MEDICAL'])await page.locator('input[name="opinion:'+id+'"][value='+(onlyInvestigator&&id==='PX_SIG_REPORT'?'disagree':'agree')+']').check();
   await page.click('[data-action=evidenceOpinions]');
   await judgeProfile('#caseTitle [data-action=profile]');
   if(!onlyInvestigator){
    check(!(await page.textContent('#memoPanel')).includes('아직 심리 전'),'actual bands after evidence opinions with no witnesses');
    if(width===390)await page.click('[data-action=panel][data-id=memoPanel]');
    const details=page.locator('#memoPanel details[data-disclosure^="memo:"]');
    for(let i=0;i<await details.count();i++)await details.nth(i).locator('summary').click();
    check(await page.locator('#memoPanel .notes').isVisible(),'consent basis expands');
    check((await page.textContent('#memoPanel .notes')).includes('조서: 팔을 뻗은 뒤 넘어지는 소리') && (await page.textContent('#memoPanel .notes')).includes('수사보고서: 밀침 → 낙상 → 상해로 정리'),'both consent records in memo');
    if(width===390)await page.click('[data-action=panel][data-id=courtPanel]');
   }
   if(onlyInvestigator){
    check((await page.textContent('#steps')).includes('서동국') && !(await page.textContent('#steps')).includes('한지수'),'only disputed witness in steps');
    check((await page.textContent('#steps .now'))==='서동국','second witness current step');
    for(let i=0;i<50;i++){
      if(await page.locator('[data-action=endCross]').count()){await page.click('[data-action=endCross]');continue;}
      if(await page.locator('[data-action=pass]').count()){await page.click('[data-action=pass]');continue;}
      if(await page.locator('#phaseTitle').count() && await page.textContent('#phaseTitle')==='구형')break;
      await page.click('[data-action=continue]');
    }
   }else check(await page.textContent('#phaseTitle')==='구형','zero witnesses directly request');
   check(!(await page.locator('.bench').count()),'request does not show unsummoned witnesses');
   await page.click('[data-action=continue]');check(await page.locator('[data-action=closingArgument]').count()===3,'three final arguments');
   await page.click('[data-action=closingArgument][data-id=FINAL_SIG_MERCY]');
   check(await page.textContent('#phaseTitle')==='최후진술','client last statement');
   await page.click('[data-action=continue]');
   check((await page.textContent('#stage')).includes('2주 뒤 · 제2회 공판기일 · 선고'),'separate sentencing date');
   await page.click('[data-action=verdict]');
   await judgeProfile('#caseTitle [data-action=profile]');
   if(!onlyInvestigator){
    check(await page.locator('#memoPanel .lean.pending').count()===0 && await page.locator('#memoPanel .lean').count()===2,'no-witness verdict has both actual issue bands');
    if(width===390)await page.click('[data-action=panel][data-id=memoPanel]');
    await page.screenshot({animations:'disabled',path:path.resolve(__dirname,'artifacts/ui2-'+width+'-no-witness-memo.png'),fullPage:true});
    if(width===390)await page.click('[data-action=panel][data-id=courtPanel]');
    await page.screenshot({animations:'disabled',path:path.resolve(__dirname,'artifacts/ui2-'+width+'-no-witness-verdict.png'),fullPage:true});
   }
   await page.locator('[data-disclosure=outcome-reasons]>summary').click();
   check((await page.textContent('.closing-review')).includes('선처 호소만'),'closing review');
   await page.locator('[data-disclosure=review]>summary').click();
   await page.locator('[data-disclosure=procedure-review]>summary').click();
   check((await page.textContent('[data-disclosure=procedure-review]')).includes('조서: 팔을 뻗은 뒤 넘어지는 소리'),'consent in review');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow');
   await page.screenshot({animations:'disabled',path:path.resolve(__dirname,'artifacts/procedure-'+width+'-'+(onlyInvestigator?'one-witness':'no-witness')+'-result.png'),fullPage:true});
   check(!errors.length,'no page errors');await page.close();
  }
  console.log('Demo procedure browser: '+checks+' checks, 0 failures, exit 0');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
