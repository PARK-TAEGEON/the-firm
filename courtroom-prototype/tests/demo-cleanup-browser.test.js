'use strict';
const {chromium}=require('playwright'), assert=require('node:assert/strict'), path=require('node:path'), {pathToFileURL}=require('node:url');
const {createServer}=require('../serve');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});let checks=0;
 const check=(v,m)=>{assert.ok(v,m);checks++;};
 try{
  for(const transport of ['http','file'])for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(4000);
   const url=transport==='http'?'http://127.0.0.1:'+server.address().port+'/demo.html':pathToFileURL(path.resolve(__dirname,'../demo.html')).href;
   for(const mode of ['filed','withheld','deferred','escape','outside']){
    await page.goto(url);await page.click('[data-action=start]');await page.click('[data-scene=all]');await page.click('[data-scene=finish]');
    await page.click('[data-action=investigate][data-id=INV_SIG_SEQUENCE]');
    check(await page.locator('#reader [data-action=fileEvidence]').count()===3,'three result choices');
    check(await page.locator('#reader [data-action=closeReader]').count()===0,'no separate close button');
    check(!(await page.textContent('#reader')).includes('보류하고 닫기'),'removed extra close label');
    if(mode==='filed')await page.screenshot({animations:'disabled',path:path.resolve(__dirname,'artifacts/cleanup-'+transport+'-'+width+'-result-choices.png'),fullPage:true});
    if(mode==='escape')await page.keyboard.press('Escape');
    else if(mode==='outside')await page.mouse.click(1,1);
    else if(mode==='deferred' && width===1440){
      await page.evaluate(()=>{document.querySelector('[data-action=fileEvidence][data-status=deferred]').click();document.querySelector('.card summary').focus();});
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      check(await page.evaluate(()=>document.activeElement.matches('.card summary')),'queued close does not steal the next focus');
    }else await page.click('[data-action=fileEvidence][data-status='+mode+']');
    check(!(await page.locator('#reader[open]').count()),'choice/Escape/outside closes immediately');
    const expected={filed:'신청',withheld:'미신청'}[mode]||'보류';
    check((await page.textContent('[data-disclosure="card:CARD_SIG_SEQUENCE"] summary')).endsWith(' · '+expected),'chosen or deferred state retained');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow');
   }
   await page.close();
  }
  console.log('Demo cleanup browser: '+checks+' checks, 0 failures, exit 0');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
