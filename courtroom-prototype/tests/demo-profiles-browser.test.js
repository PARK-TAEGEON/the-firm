'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true});let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
 try {for(const width of [1440,390])for(const blocked of [false,true]){
 const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(4000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Object.defineProperty(window,'FirmDemoSession',{configurable:true,set(api){const create=api.createDemoSession;api.createDemoSession=opts=>{const session=create(opts);window.profileSnapshot=()=>JSON.stringify(session.projection());return session;};Object.defineProperty(window,'FirmDemoSession',{value:api,configurable:true});}}));
 if(blocked)await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../demo.html')).href);
 const open=async(selector,id,rating,close)=>{
   const before=await page.evaluate(()=>window.profileSnapshot());
   const button=page.locator(selector);await button.focus();await page.keyboard.press('Enter');await page.waitForSelector('#reader[open]');
   check(await page.locator('.profile-stars').getAttribute('aria-label')==='명성 별 '+rating+'개 중 5','accessible rating');
   check(await page.locator('.profile-star').count()===5,'five star positions');
   check(await page.locator('.profile-star i[style="width:50%" ]').count()===(rating%1?1:0),'half star fill');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390 no overflow');
   if(!blocked)await page.screenshot({path:path.resolve(__dirname,'artifacts/profile-'+width+'-'+id+'.png'),fullPage:true});
   if(close==='escape')await page.keyboard.press('Escape');else if(close==='outside')await page.mouse.click(1,1);else await page.click('[data-action=closeReader]');
   await page.waitForFunction(sel=>document.activeElement===document.querySelector(sel),selector);check(!(await page.locator('#reader').isVisible()),'profile closed and focus restored');
   check(await page.evaluate(()=>window.profileSnapshot())===before,'profile never mutates trial state or records');
 };
 await open('[data-action=profile][data-id=novice]','novice',1.5,'escape');await open('[data-action=profile][data-id=veteran]','veteran',3.5,'outside');
 check(await page.isChecked('input[value=novice]'),'profile does not select prosecutor');
 for(let round=1;round<=2;round++){
 await page.click('[data-action=start]');await page.click('[data-scene=all]');await page.click('[data-scene=finish]');await page.click('[data-action=closeReader]');
 if(width===390)await page.click('[data-action=panel][data-id=filePanel]');
 await page.click('#filePanel [data-action=profile]');check((await page.textContent('.profile-history')).includes(round===1?'처음 만나는 상대':'1전'),'history before next verdict');await page.keyboard.press('Escape');
 if(width===390)await page.click('[data-action=panel][data-id=courtPanel]');
 await page.click('[data-action=finishPrep]');await page.click('label:has(input[value=F_SIG_CAUSE])');await page.click('label:has(input[value=S_SIG_CONTACT])');await page.click('[data-action=open]');
 for(const id of ['PX_SIG_STATEMENT','PX_SIG_REPORT','PX_SIG_VIDEO','PX_SIG_MEDICAL'])await page.check('input[name="opinion:'+id+'"][value='+(id==='PX_SIG_REPORT'?'disagree':'agree')+']');
 await page.click('[data-action=evidenceOpinions]');
 await open('.judge-line [data-action=profile]','JUDGE',3,'button');
 await open('.face[data-action=profile]','novice-seat',1.5,'escape');
 for(let guard=0;guard<60;guard++){
 if(await page.locator('[data-action=verdict]').count()){await page.click('[data-action=verdict]');break;}
 for(const action of ['closingArgument','endCross','pass','skipRebut','continue'])if(await page.locator('[data-action='+action+']').count()){await page.locator('[data-action='+action+']').first().click();break;}
 }
 check(await page.locator('.outcome .kicker').textContent()==='선고','only sentencing label');
 check((await page.textContent('.transcript')).includes('재판장 문혜진'),'judge name in transcript');
 if(width===390)await page.click('[data-action=panel][data-id=filePanel]');
 await page.click('#filePanel [data-action=profile]');check((await page.textContent('.profile-history')).includes(round+'전'),'one count per completed round');await page.keyboard.press('Escape');
 if(!blocked){const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('firm.demo.profile-history.v1')));check(Object.values(stored.JUDGE).reduce((a,b)=>a+b,0)===round,'judge accumulates same results');}
 if(width===390)await page.click('[data-action=panel][data-id=courtPanel]');
 await page.click('[data-action=reset]');
 }
 check(!errors.length,'storage failures do not break UI');await page.close();
 }console.log('Demo profiles browser: '+checks+' checks, 0 failures, exit 0');}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
