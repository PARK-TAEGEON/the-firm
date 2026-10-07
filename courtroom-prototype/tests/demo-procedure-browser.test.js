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
   await page.click('[data-action=finishPrep]');await page.click('label:has(input[value=F_SIG_CAUSE])');await page.click('label:has(input[value=S_SIG_CONTACT])');await page.click('[data-action=open]');
   check(await page.locator('.evidence-opinion').count()===4,'four exhibits');
   check(!(await page.textContent('#stage')).includes('열람하지 않은 증거입니다'),'no unread warning');
   for(const id of ['PX_SIG_STATEMENT','PX_SIG_REPORT','PX_SIG_VIDEO','PX_SIG_MEDICAL'])await page.locator('input[name="opinion:'+id+'"][value='+(onlyInvestigator&&id==='PX_SIG_REPORT'?'disagree':'agree')+']').check();
   await page.click('[data-action=evidenceOpinions]');
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
