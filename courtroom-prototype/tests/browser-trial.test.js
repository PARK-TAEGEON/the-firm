'use strict';
// v0.10 Adversarial Trial — browser full-flow regressions (desktop/mobile, file:// and localhost).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), { pathToFileURL } = require('node:url');
const { createServer } = require('../serve');

async function launch() {
  try { return await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge', headless: true }); }
  catch { return chromium.launch({ headless: true }); } // bundled Chromium fallback for CI/cloud
}

async function run() {
  const out = path.join(__dirname, 'artifacts'); fs.mkdirSync(out, { recursive: true });
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const httpUrl = 'http://127.0.0.1:' + server.address().port + '/trial.html';
  const fileUrl = pathToFileURL(path.join(__dirname, '..', 'trial.html')).href;
  const browser = await launch();
  let checks = 0; const check = (cond, msg) => { assert.ok(cond, msg); checks++; };
  const paths = {
    acquit: { prep: ['INV_RECORDS', 'INV_SCENE'], focus: 'F_IDENTITY', stance: 'S_SILENT', object: ['OBJ_SEO_LEADING'], W_SEO: ['approach:A_SEO_OBSERVE', 'approach:A_SEO_INITIAL', 'press:P_SEO_LIMITED'], W_HAN: ['approach:A_HAN_TIMING'], expect: '무죄' },
    convict: { prep: [], focus: 'F_BALANCED', stance: 'S_DENY', object: ['OBJ_HAN_EXPERT'], W_SEO: ['approach:A_SEO_TIME', 'press:P_SEO_OVER'], W_HAN: ['approach:A_HAN_TIMING'], expect: '유죄' }
  };
  const viewports = { desktop: { width: 1440, height: 900 }, short: { width: 1280, height: 720 }, mobile: { width: 390, height: 844 } };
  try {
    for (const [vpName, vp] of Object.entries(viewports)) for (const [pName, plan] of Object.entries(paths)) {
      const url = vpName === 'mobile' && pName === 'convict' ? fileUrl : httpUrl;
      const page = await browser.newPage({ viewport: vp }); page.setDefaultTimeout(4000);
      const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(url);
      const noOverflow = async label => check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${vpName}/${pName}: no horizontal overflow at ${label}`);
      const noNumbers = async label => { const memo = await page.textContent('#memoPanel'); check(!/\d+\s*%|승률|점수/.test(memo), `${vpName}/${pName}: memo has no numeric odds at ${label}`); };

      // prep
      check(await page.isVisible('text=공판 준비'), 'prep title');
      check((await page.$$('[data-action=investigate]')).length === 6, 'six investigations');
      check(await page.textContent('#filePanel').then(t => t.includes('내용 미열람')), 'exhibits sealed before inspection');
      for (const id of plan.prep) await page.click(`[data-action=investigate][data-id=${id}]`);
      if (plan.prep.includes('INV_RECORDS')) check(!(await page.textContent('#filePanel')).includes('내용 미열람'), 'exhibits revealed by records inspection');
      check((await page.$$('#filePanel .card')).length === plan.prep.reduce((n, id) => n + require('../data/trial-case').investigations.find(v => v.id === id).grants.length, 0), 'cards equal granted evidence');
      await noOverflow('prep');
      await page.click('[data-action=finishPrep]');

      // opening
      check(await page.isDisabled('[data-action=open]'), 'opening blocked until both choices');
      await page.click(`label:has(input[value=${plan.focus}])`);
      check(await page.isDisabled('[data-action=open]'), 'opening still blocked with one choice');
      await page.click(`label:has(input[value=${plan.stance}])`);
      check((await page.textContent('#speechPreview')).length > 20, 'speech preview assembled');
      await noOverflow('opening');
      await page.click('[data-action=open]');

      // trial loop
      const queues = { W_SEO: [...plan.W_SEO], W_HAN: [...plan.W_HAN] }; let sawCross = 0, sawObjection = 0, guard = 0;
      while (guard++ < 120) {
        if (await page.$('[data-action=verdict]')) { await page.click('[data-action=verdict]'); break; }
        if (await page.$('[data-action=object]')) {
          sawObjection++;
          const txt = await page.textContent('#stage');
          const stepObj = txt.includes('피고인 김도윤이었지요') ? 'OBJ_SEO_LEADING' : 'OBJ_HAN_EXPERT';
          await page.click(plan.object.includes(stepObj) ? '[data-action=object]' : '[data-action=pass]');
          continue;
        }
        if (await page.$('[data-action=rebut]')) { await page.click('[data-action=rebut]'); continue; }
        if (await page.$('[data-action=endCross]')) {
          sawCross++; await noOverflow('cross'); await noNumbers('cross');
          const name = await page.textContent('#bar .bar-head .label');
          const wid = name.includes('서지훈') ? 'W_SEO' : 'W_HAN';
          const step = queues[wid].shift();
          if (!step) { await page.click('[data-action=endCross]'); continue; }
          const [kind, id] = step.split(':');
          check(!(await page.isDisabled(`[data-action=${kind}][data-id=${id}]`)), `${id} available`);
          await page.click(`[data-action=${kind}][data-id=${id}]`);
          continue;
        }
        if (await page.$('[data-action=continue]')) { await page.click('[data-action=continue]'); continue; }
        break;
      }
      check(sawObjection === 2, `${vpName}/${pName}: two objection windows`);
      check(sawCross >= 2, 'cross-examination bar shown');
      await page.waitForSelector('#verdictTitle');
      check((await page.textContent('#verdictTitle')).includes(plan.expect), `${vpName}/${pName}: verdict ${plan.expect}`);
      check(await page.evaluate(() => document.activeElement && document.activeElement.id === 'verdictTitle'), 'focus moves to verdict');
      const review = await page.textContent('.review');
      check(review.includes('유효했던 것') && review.includes('역효과') && review.includes('놓친 준비'), 'review sections');
      if (pName === 'convict') check(/기각|과욕|배치/.test(review), 'convict path lists backfires');
      if (pName === 'acquit') check(/최초 진술/.test(review), 'acquit path lists effective contrast');
      await noOverflow('verdict'); await noNumbers('verdict');
      await page.screenshot({ path: path.join(out, `trial-v010-${vpName}-${pName}.png`), fullPage: true });

      // reset
      await page.click('[data-action=reset]');
      check(await page.isVisible('text=공판 준비'), 'reset returns to prep');
      check((await page.$$('#filePanel .card')).length === 0, 'reset clears cards');
      check((await page.textContent('#filePanel')).includes('내용 미열람'), 'reset re-seals exhibits');
      check(!errors.length, `${vpName}/${pName}: no page errors ${errors.join(';')}`);
      await page.close();
    }
    // keyboard: Space advances when nothing is focused
    const page = await browser.newPage({ viewport: viewports.desktop }); await page.goto(httpUrl);
    await page.click('[data-action=finishPrep]'); await page.click('label:has(input[value=F_BALANCED])'); await page.click('label:has(input[value=S_SILENT])'); await page.click('[data-action=open]');
    const before = await page.textContent('.transcript summary');
    await page.evaluate(() => document.activeElement.blur()); await page.keyboard.press('Space');
    check((await page.textContent('.transcript summary')) !== before, 'Space advances proceedings');
    await page.close();
    console.log(`Trial browser: ${checks} checks, 0 failures, exit 0`);
    return checks;
  } finally { await browser.close(); server.close(); }
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e); process.exitCode = 1; });
