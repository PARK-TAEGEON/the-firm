'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '../../../../..');
const {createServer} = require(path.join(root, 'courtroom-prototype/serve.js'));
(async () => {
 const server = createServer();
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const browser = await chromium.launch({channel:'msedge',headless:true});
 const rows=[]; let checks=0; const failures=[];
 const check=(value, label)=>{checks++;if(!value)failures.push(label);};
 try {
  for(const vp of [{width:1440,height:900},{width:1280,height:720},{width:390,height:844}]) {
   const page=await browser.newPage({viewport:vp}); const errors=[];
   page.on('pageerror', e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto(`http://127.0.0.1:${server.address().port}/plan-demo.html`);
   const sample=async stage=>{const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,documentHeight:document.documentElement.scrollHeight,focused:document.activeElement?.outerHTML.slice(0,200),primary:[...document.querySelectorAll('button.primary')].filter(e=>e.checkVisibility()).map(e=>({text:e.textContent,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,inViewport:e.getBoundingClientRect().top>=0&&e.getBoundingClientRect().bottom<=innerHeight}))}));rows.push({viewport:vp,stage,...metrics});check(!metrics.overflow,`${vp.width} ${stage} no horizontal overflow`);await page.screenshot({path:path.join(__dirname,`baseline-${vp.width}-${stage}.png`),fullPage:true});};
   check(await page.locator('#consultation[open]').count()===1,`${vp.width} consultation opens`);await sample('consultation');
   for(let i=0;i<7;i++)await page.locator('[data-scene=next]').click();
   check((await page.locator('.scene-utterance').innerText()).includes('합의해도 재판은 계속될 수 있어요.'),`${vp.width} eight lines sequential`);
   await page.locator('[data-scene=finish]').click();await page.locator('[data-action=approve]').waitFor({state:'visible'});await sample('plan');
   await page.locator('[data-action=edit]').click();await page.locator('#layout-toggle').uncheck();
   rows.push({viewport:vp,stage:'after-checkbox-change',focused:await page.evaluate(()=>document.activeElement?.tagName)});
   await page.locator('[data-action=cancel-edit]').click();check((await page.locator('.plan-row').last().innerText()).includes('준비'),`${vp.width} cancel preserves original inclusion`);
   await page.locator('[data-action=edit]').click();await page.locator('#layout-toggle').uncheck();await page.locator('[data-action=save-edit]').click();
   await page.locator('[data-action=replay-intro]').click();await page.locator('[data-scene=all]').click();check(await page.locator('.scene-transcript li').count()===8,`${vp.width} all eight originals visible`);await page.locator('[data-scene=finish]').click();check((await page.locator('.plan-row').last().innerText()).includes('제외'),`${vp.width} replay preserves exclusion`);
   await page.locator('[data-action=approve]').click();await sample('court');check((await page.locator('.court-banner').innerText()).includes('현장 동선 대응 제외'),`${vp.width} exclusion executed`);
   await page.locator('[data-action=show-record]').click();await sample('record');check((await page.locator('.record-line').last().innerText()).includes('미실행'),`${vp.width} exclusion recorded`);
   check(errors.length===0,`${vp.width} console and page errors zero`);rows.push({viewport:vp,stage:'errors',errors});await page.close();
  }
 } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
 fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({baseline:'d6fa4a303691f60eedf79b829780f443f915e245',runtime:process.version,browser:'msedge',checks,failures,rows},null,2));
 console.log(`Baseline plan actual browser: ${checks} checks, ${failures.length} failures`);if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
