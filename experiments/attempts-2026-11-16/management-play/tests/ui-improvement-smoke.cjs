'use strict';
// Additional UI acceptance checks. Real UI controls invoke the unmodified engine;
// fixture snapshots enter only through the same JSON import used by players.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {pathToFileURL} = require('node:url');
const E = require('../src/engine.js');
let playwright;
try { playwright = require('playwright'); }
catch (_) { playwright = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '', 'playwright')); }
const ROOT = path.resolve(__dirname, '..');
const HTML = path.resolve(process.env.FIRM_HTML || path.join(ROOT, 'dist/THE_FIRM_Management_Play_v0.4.html'));
const OUTPUT = path.resolve(process.env.FIRM_UI_QA_DIR || path.join(ROOT, 'docs/ui-improvement-qa'));
const KEY = 'thefirm.management.0.3';
const hash = () => crypto.createHash('sha256').update(fs.readFileSync(HTML)).digest('hex');
const report = {started:new Date().toISOString(), html:HTML, startHash:hash(), checks:[], layouts:[], fontEvidence:[], runtimeErrors:[], remoteRequests:[]};
report.explicitFontRequests=[];report.expectedFontNetworkErrors=[];
let explicitFontRequest=false;
fs.mkdirSync(OUTPUT, {recursive:true});
let browser, context, page;
const act = (name,id,scope='') => page.locator((scope ? scope+' ' : '')+'[data-action="'+name+'"]'+(id===undefined?'':'[data-id="'+id+'"]')).first();
const click = (name,id,scope) => act(name,id,scope).click();
const textState = () => page.evaluate(key=>localStorage.getItem(key),KEY);
const state = async () => JSON.parse(await textState());
async function check(name,fn) {
  try { await fn(); report.checks.push({name,pass:true}); console.log('PASS '+name); }
  catch(error) { report.checks.push({name,pass:false,error:error.message}); throw error; }
}
async function close() {
  if(await page.locator('#modal-root [role="dialog"]').count()) await click('close',undefined,'#modal-root');
}
async function nav(id) { await close(); await page.locator('.nav-item[data-id="'+id+'"]').click(); }
async function reset(rule='commitment',challenge='first') {
  await close(); await click('save'); await click('reset-confirm',undefined,'#modal-root');
  await page.locator('#restart-rules').selectOption(rule); await page.locator('#restart-challenge').selectOption(challenge);
  await click('reset',undefined,'#modal-root');
}
async function importSnapshot(snapshot,name='ui-review-fixture.json') {
  await close(); await click('save'); const choose=page.waitForEvent('filechooser'); await click('import',undefined,'#modal-root');
  await(await choose).setFiles({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snapshot))});
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('저장된 진행을 가져왔습니다'));
  assert.deepEqual(await state(),snapshot);
}
async function bounded(label) {
  const value=await page.evaluate(()=>({width:innerWidth,height:innerHeight,body:document.body.scrollWidth,html:document.documentElement.scrollWidth}));
  report.layouts.push({label,...value});
  assert.ok(Math.max(value.body,value.html)<=value.width+1,label+' has page-level horizontal overflow');
}
async function reachableControl(control,label) {
  await control.scrollIntoViewIfNeeded(); const box=await control.boundingBox();
  const size=page.viewportSize();
  assert.ok(box && box.width>0 && box.height>0,label+' is not visible');
  assert.ok(box.x>=-1 && box.x+box.width<=size.width+1 && box.y>=-1 && box.y+box.height<=size.height+1,label+' lies outside viewport');
  const point={x:box.x+box.width/2,y:box.y+box.height/2};
  assert.ok(await control.evaluate((element,p)=>{const top=document.elementFromPoint(p.x,p.y); return top===element || element.contains(top);},point),label+' is covered');
}
async function exportSnapshot() {
  await close(); await click('save'); const promise=page.waitForEvent('download'); await click('export',undefined,'#modal-root');
  const download=await promise, target=path.join(OUTPUT,'exported-ui-review-state.json');
  await download.saveAs(target); return JSON.parse(fs.readFileSync(target,'utf8'));
}
async function summaryMatches() {
  const summary=E.summarize(await state());
  for(const key of ['cash','receivables','minimumCash','negativeCashDays','readyCases','lateTasks','refundPaid']) {
    const field=page.locator('.week-summary [data-metric="'+key+'"]');
    assert.equal(await field.count(),1,key+' needs a separate actual result field');
    assert.equal(Number(await field.getAttribute('data-value')),summary[key],key+' differs from engine');
  }
}
(async()=>{
  try {
    browser=await playwright.chromium.launch({executablePath:process.env.FIRM_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
    context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce',acceptDownloads:true});
    await context.route('**/*',route=>{ if(/^https?:\/\//i.test(route.request().url())) {(explicitFontRequest?report.explicitFontRequests:report.remoteRequests).push(route.request().url());return route.abort();} return route.continue(); });
    page=await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror',error=>report.runtimeErrors.push(error.message));
    page.on('console',message=>{if(message.type()==='error') (explicitFontRequest && /net::ERR_FAILED|Failed to load resource/.test(message.text())?report.expectedFontNetworkErrors:report.runtimeErrors).push(message.text());});
    await page.goto(pathToFileURL(HTML).href,{waitUntil:'load'}); await page.locator('.advance').waitFor();
    await check('defaults use Graphite and the embedded Korean font with unchanged experiment schema',async()=>{
      await reset(); assert.deepEqual(await state(),E.createInitialState({experiment:'commitment-v1',refundPercent:50,openingCash:18200000}));
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'graphite');
      await page.evaluate(()=>document.fonts.ready);
      const faces=await page.evaluate(()=>Array.from(document.fonts).map(face=>({family:face.family,status:face.status,weight:face.weight})));
      report.fontEvidence.push({label:'initial embedded face',faces});
      assert.ok(faces.some(face=>face.family.replace(/['"]/g,'')==='Firm Sans' && face.status==='loaded'),'embedded Firm Sans did not load');
    });
    await check('viewing all screens and layout modes preserves the byte-exact game save',async()=>{
      const before=await textState();
      for(const id of ['home','cases','people','finance','reports']) {await nav(id);await bounded('1366-'+id); assert.equal(await textState(),before);}
      for(const mode of ['brief','dossier','operations']) {await click('mode',mode);await bounded('1366-'+mode);assert.equal(await textState(),before);}
      await click('mode','brief');
    });
    await check('visual themes are separate from layout modes and preserve the game save',async()=>{
      const before=await textState(); await click('appearance');
      for(const theme of ['navy','paper','graphite']) {await click('theme',theme,'#modal-root');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme);assert.equal(await textState(),before);}
      assert.equal(await page.locator('#modal-root [data-action="theme"]').count(),3);
      await close(); assert.equal(await textState(),before);
    });
    await check('font candidates disclose actual availability and do not mutate the game save',async()=>{
      const before=await textState(); await click('appearance');
      await page.waitForFunction(()=>!document.querySelector('[data-font-status]').textContent.includes('확인 중'));
      for(const preset of ['F0','F1','F2','F3','F4','F5','F6','F7','F8','F9','local-pretendard','embedded']) {
        await click('font',preset,'#modal-root');
        const status=await page.locator('[data-font-status]').innerText();
        report.fontEvidence.push({preset,status});assert.match(status,/로드|불러|대체|로컬|내장|설치|확인/);
        if(preset==='embedded') assert.ok(!status.includes('미로드') && !status.includes('대체'),'embedded font incorrectly reported as fallback');
        if(preset==='F2') {
          const ibmLoaded=await page.evaluate(()=>Array.from(document.fonts).some(face=>face.family.replace(/['"]/g,'')==='IBM Plex Sans KR' && face.status==='loaded'));
          if(!ibmLoaded) assert.match(status,/본문: 미로드 · 내장 글꼴로 대체/,'an unavailable candidate must disclose the body fallback');
        }
        assert.equal(await textState(),before);
      }
      await close(); await page.reload({waitUntil:'load'}); await page.locator('.advance').waitFor();
      assert.equal(await textState(),before);assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'graphite');
    });
    await check('case selection retains the three-file context and separates preparation from money',async()=>{
      const before=await textState();await nav('cases');
      for(const id of ['jung','go','yoon']) {
        await click('file',id,'.case-workspace-list');assert.equal(await page.locator('.case-workspace-list .file-tab').count(),3);
        assert.equal(await page.locator('.case-workspace-list .file-tab.active').getAttribute('data-id'),id);
        const content=await page.locator('.case-workspace').innerText();assert.match(content,/준비/);assert.match(content,/기한/);
        if(id==='yoon') {assert.match(content,/착수금|계약/);assert.match(content,/확정 미수|미수/);}
        assert.equal(await textState(),before);
      }
    });
    await check('client review discloses refund and cash timing before acceptance',async()=>{
      const before=await textState();await click('intake');
      const terms=await page.locator('#modal-root').innerText();assert.match(terms,/50%/);assert.match(terms,/환급/);assert.match(terms,/다음 업무일/);assert.match(terms,/준비 보고/);
      assert.equal(await textState(),before);await close();
    });
    await check('acceptance changes the exact engine state and creates seven tasks without instant cash',async()=>{
      const before=await state();await click('intake');await click('accept',undefined,'#modal-root');
      const expected=E.command(before,{type:'ACCEPT_INTAKE'}).state;assert.deepEqual(await state(),expected);assert.equal(expected.tasks.length,7);assert.equal(expected.cash,before.cash);
    });
    await check('remaining-hours sorting changes visible order without changing the allocation',async()=>{
      await nav('people');const before=await textState();
      for(const direction of ['ascending','descending']) {
        await click('sort','remaining','.work-table');
        const values=await page.locator('.work-table tbody td.progress-cell strong').allTextContents();
        const hours=values.map(text=>Number(text.replace(/[^0-9.]/g,'')));
        assert.equal(hours.length,7);assert.deepEqual(hours,[...hours].sort((a,b)=>direction==='ascending'?a-b:b-a));
        assert.equal(await act('sort','remaining','.work-table').locator('..').getAttribute('aria-sort'),direction);assert.equal(await textState(),before);
      }
    });
    await check('staff comparison shows legal-role restrictions and cancellation is atomic',async()=>{
      await nav('people');const before=await textState();await click('assign','jung-review');
      const forbidden=act('choose-person','han','#modal-root');assert.equal(await forbidden.isDisabled(),true);assert.match(await forbidden.innerText(),/법률|배정 불가/);
      await click('choose-person','park','#modal-root');await page.locator('#priority-select').selectOption('3');
      assert.equal(await page.locator('[data-plan-impact]').count(),1);assert.match(await page.locator('#modal-root').innerText(),/변경 전|현재 배정/);assert.match(await page.locator('#modal-root').innerText(),/변경 후/);
      assert.equal(await textState(),before);await page.keyboard.press('Escape');assert.equal(await textState(),before);
    });
    await check('applying a draft uses the same assignment and priority commands',async()=>{
      const before=await state();await click('assign','jung-organize');await click('choose-person','kim','#modal-root');await page.locator('#priority-select').selectOption('2');
      const assigned=E.command(before,{type:'ASSIGN_TASK',taskId:'jung-organize',staffId:'kim'});
      const expected=E.command(assigned.state,{type:'SET_PRIORITY',taskId:'jung-organize',priority:2}).state;
      await click('commit-assignment',undefined,'#modal-root');assert.deepEqual(await state(),expected);
    });
    await check('desktop and mobile screens keep main actions and assignment apply reachable',async()=>{
      const before=await textState();
      for(const size of [{width:1440,height:900},{width:1366,height:768},{width:390,height:844}]) {
        await page.setViewportSize(size);
        for(const id of ['home','cases','people','finance','reports']) {await nav(id);await bounded(size.width+'-'+id);await reachableControl(page.locator('.advance'),'advance '+size.width+' '+id);}
        for(const mode of ['brief','dossier','operations']) {await click('mode',mode);await bounded(size.width+'-'+mode);}
        await nav('people');await click('assign','jung-organize');await bounded(size.width+'-assignment');await reachableControl(act('commit-assignment',undefined,'#modal-root'),'assignment apply '+size.width);await close();
        assert.equal(await textState(),before);
      }
      await page.setViewportSize({width:1366,height:768});
    });
    await check('five actual day actions match the engine and actual accounting fields',async()=>{
      for(let index=0;index<5;index++) {const before=await state();const expected=E.command(before,{type:'ADVANCE_DAY'}).state;await page.locator('.advance').click();assert.deepEqual(await state(),expected);}
      assert.equal((await state()).completed,true);await summaryMatches();
      const before=await textState();await page.locator('.advance').click();assert.equal(await textState(),before);
    });
    await check('v0.4 export import and reload preserve exact actual history',async()=>{
      const before=await state();assert.equal(before.version,'0.4.0');assert.deepEqual(await exportSnapshot(),before);await close();await page.reload({waitUntil:'load'});await page.locator('.advance').waitFor();assert.deepEqual(await state(),before);
      await reset();await importSnapshot(before,'experiment-v0.4.json');assert.deepEqual(await state(),before);
    });
    await check('legacy v0.3 save keeps its version and contract through views export and next day',async()=>{
      const original=E.createInitialState();await importSnapshot(original,'legacy-v0.3.json');
      await click('appearance');await click('theme','paper','#modal-root');await click('font','F2','#modal-root');await close();await nav('cases');assert.deepEqual(await state(),original);
      assert.deepEqual(await exportSnapshot(),original);await close();await click('intake');await click('accept',undefined,'#modal-root');
      const accepted=E.command(original,{type:'ACCEPT_INTAKE'}).state;assert.deepEqual(await state(),accepted);
      await page.locator('.advance').click();assert.deepEqual(await state(),E.command(accepted,{type:'ADVANCE_DAY'}).state);assert.equal((await state()).version,'0.3.0');assert.equal((await state()).experiment,undefined);
    });
    await check('default offline use has no remote requests or runtime errors and keeps the HTML unchanged',async()=>{
      assert.deepEqual(report.remoteRequests,[]);assert.deepEqual(report.runtimeErrors,[]);assert.equal(hash(),report.startHash);
    });
    await check('explicit online font request handles offline failure without claiming success or changing the save',async()=>{
      const before=await textState();await click('appearance');await click('font','F2','#modal-root');explicitFontRequest=true;
      await click('load-online-fonts',undefined,'#modal-root');
      await page.waitForFunction(()=>document.querySelector('[data-action="load-online-fonts"]').textContent.includes('다시 불러오기'));
      assert.ok(report.explicitFontRequests.length>=1);assert.ok(report.explicitFontRequests.every(url=>url.startsWith('https://fonts.googleapis.com/')));
      const status=await page.locator('[data-font-status]').innerText();
      const localIbm=await page.evaluate(()=>Array.from(document.fonts).some(face=>face.family.replace(/['"]/g,'')==='IBM Plex Sans KR' && face.status==='loaded'));
      assert.match(status,localIbm?/IBM Plex Sans KR 로드 확인/:/본문: 미로드 · 내장 글꼴로 대체/);assert.equal(await textState(),before);assert.deepEqual(report.runtimeErrors,[]);
      await close();explicitFontRequest=false;
    });
  } catch(error) {
    report.error=error.stack||error.message;process.stderr.write(report.error+'\n');process.exitCode=1;
    if(page) try {await page.screenshot({path:path.join(OUTPUT,'failure.png'),fullPage:true});} catch(_) {}
  } finally {
    report.endHash=hash();report.finished=new Date().toISOString();report.passed=report.checks.filter(c=>c.pass).length;report.failed=report.checks.filter(c=>!c.pass).length+(report.error&&!report.checks.some(c=>!c.pass)?1:0);
    fs.writeFileSync(path.join(OUTPUT,'result.json'),JSON.stringify(report,null,2)+'\n');if(context)await context.close();if(browser)await browser.close();
    console.log(JSON.stringify({passed:report.passed,failed:report.failed,layouts:report.layouts.length,runtimeErrors:report.runtimeErrors.length,remoteRequests:report.remoteRequests.length,report:path.join(OUTPUT,'result.json')}));
  }
})();
