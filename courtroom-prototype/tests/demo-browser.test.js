'use strict';
// DEMO-001 — browser completion runs at 1440 and 390 width (localhost + file://): no horizontal overflow, no numeric odds, outcome + review shown.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), { pathToFileURL } = require('node:url');
const { createServer } = require('../serve');

async function launch() {
  try { return await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge', headless: true }); }
  catch { return chromium.launch({ headless: true }); }
}

const VALID = ['OBJ_SIG_OBSERVER_VALID', 'OBJ_SIG_INVESTIGATOR_VALID'];
const PLANS = {
  novice_acquittal: { prosecutor: 'novice', prep: ['INV_SIG_STATEMENT', 'INV_SIG_SEQUENCE'], focus: 'F_SIG_ACT', stance: 'S_SIG_RESERVE', object: [], obs: ['approach:A_SIG_OBS_SCOPE', 'approach:A_SIG_OBS_SEQUENCE', 'press:P_SIG_OBS_LIMITED'], inv: [], expect: '무죄', sentence: false },
  veteran_dismissal: { prosecutor: 'veteran', prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL', 'INV_SIG_LAYOUT'], advice: 'ADV_SIG_REVISE', focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, obs: [], inv: ['approach:A_SIG_CAUSE_MEDICAL', 'approach:A_SIG_CAUSE_SEQUENCE', 'press:P_SIG_CAUSE_LIMITED'], expect: '공소기각', sentence: false },
  veteran_injury: { prosecutor: 'veteran', prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL'], advice: 'ADV_SIG_AS_IS', focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, obs: [], inv: ['approach:A_SIG_CAUSE_MEDICAL', 'approach:A_SIG_CAUSE_OPINION', 'approach:A_SIG_CAUSE_SEQUENCE'], expect: '유죄', sentence: true },
  novice_assault: { prosecutor: 'novice', prep: ['INV_SIG_SEQUENCE', 'INV_SIG_MEDICAL'], focus: 'F_SIG_CAUSE', stance: 'S_SIG_CONTACT', object: VALID, obs: [], inv: ['approach:A_SIG_CAUSE_MEDICAL', 'approach:A_SIG_CAUSE_SEQUENCE', 'press:P_SIG_CAUSE_LIMITED'], expect: '유죄', sentence: true }
};
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

async function run() {
  const out = path.join(__dirname, 'artifacts'); fs.mkdirSync(out, { recursive: true });
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const httpUrl = 'http://127.0.0.1:' + server.address().port + '/demo.html';
  const fileUrl = pathToFileURL(path.join(__dirname, '..', 'demo.html')).href;
  const browser = await launch();
  let checks = 0; const check = (cond, msg) => { assert.ok(cond, msg); checks++; };
  try {
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) for (const [pName, plan] of Object.entries(PLANS)) {
      const tag = vpName + '/' + pName;
      const page = await browser.newPage({ viewport: vp }); page.setDefaultTimeout(4000);
      const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(vpName === 'mobile' && pName === 'novice_assault' ? fileUrl : httpUrl);
      const noOverflow = async label => check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${tag}: no horizontal overflow at ${label}`);
      const noNumbers = async label => { const t = await page.textContent('#app'); check(!/\d+\s*%|승률|점수|확률/.test(t), `${tag}: no numeric odds at ${label}`); };

      // start screen: signature + daily files, prosecutor choice
      check(await page.isVisible('text=사건 파일'), 'start screen');
      check((await page.$$('.file-card.daily')).length === 2, 'two daily summaries');
      check(await page.isDisabled('[data-action=start]'), 'start blocked until prosecutor chosen');
      await page.click('.file-card.daily >> nth=0');
      check((await page.textContent('.daily-open')).includes('전망'), 'daily summary shows forecast in words');
      await noOverflow('daily');
      await page.click('.daily-open [data-action=daily]');
      await page.click(`label:has(input[value=${plan.prosecutor}])`);
      await noOverflow('start');
      await page.click('[data-action=start]');

      // prep + settlement
      check(await page.isVisible('text=공판 준비'), 'prep');
      check((await page.$$('[data-action=investigate]')).length === 5, 'five investigations (settlement consult is separate)');
      for (const id of plan.prep) await page.click(`[data-action=investigate][data-id=${id}]`);
      if (plan.advice) {
        await page.click('[data-action=openConsult]');
        check((await page.textContent('.settle')).includes('재판이 계속됩니다'), 'consult explains the trial continues');
        await noOverflow('consult');
        await page.click(`[data-action=consult][data-id=${plan.advice}]`);
        const res = await page.textContent('.settle .result');
        check(plan.advice === 'ADV_SIG_REVISE' ? res.includes('합의 성립') : res.includes('의뢰인의 결정'), `${tag}: consult result`);
      }
      await noOverflow('prep');
      await page.click('[data-action=finishPrep]');

      // opening
      await page.click(`label:has(input[value=${plan.focus}])`);
      await page.click(`label:has(input[value=${plan.stance}])`);
      await noOverflow('opening');
      await page.click('[data-action=open]');

      // trial
      const queues = { '목격자': [...plan.obs], '현장 조사관': [...plan.inv] }; let guard = 0, sawCross = 0;
      while (guard++ < 150) {
        if (await page.$('[data-action=verdict]')) { await noOverflow('closing'); await page.click('[data-action=verdict]'); break; }
        if (await page.$('[data-action=object]')) {
          const txt = await page.textContent('.dialogue');
          const stepId = txt.includes('넘어뜨린 동작이었지요') ? VALID[0] : txt.includes('그 밀침 때문에 다친 것이지요') ? VALID[1] : 'INVALID';
          await page.click(plan.object.includes(stepId) ? '[data-action=object]' : '[data-action=pass]');
          continue;
        }
        if (await page.$('[data-action=rebut]')) { await page.click('[data-action=rebut]'); continue; }
        if (await page.$('[data-action=endCross]')) {
          sawCross++; await noOverflow('cross'); await noNumbers('cross');
          const label = await page.textContent('#bar .bar-head .label');
          const q = queues[label.includes('조사관') ? '현장 조사관' : '목격자'];
          const step = q.shift();
          if (!step) { await page.click('[data-action=endCross]'); continue; }
          const [kind, id] = step.split(':');
          check(!(await page.isDisabled(`[data-action=${kind}][data-id=${id}]`)), `${tag}: ${id} available`);
          await page.click(`[data-action=${kind}][data-id=${id}]`);
          continue;
        }
        if (await page.$('[data-action=continue]')) { await page.click('[data-action=continue]'); continue; }
        break;
      }
      check(sawCross >= 2, `${tag}: cross-examination shown`);
      await page.waitForSelector('#verdictTitle');
      check((await page.textContent('#verdictTitle')).includes(plan.expect), `${tag}: outcome ${plan.expect}`);
      check(await page.evaluate(() => document.activeElement && document.activeElement.id === 'verdictTitle'), 'focus moves to outcome');
      const review = await page.textContent('.review');
      check(['당신이 뚫은 것', '상대가 막은 것', '역효과', '놓친 준비'].every(x => review.includes(x)), `${tag}: review sections`);
      check((await page.textContent('.next')).length > 20, `${tag}: next-try line`);
      const sentence = await page.$('.sentence');
      check(!!sentence === plan.sentence, `${tag}: sentence shown only on conviction`);
      if (plan.sentence) check((await sentence.textContent()).includes('실험용 단순화 — 실제 양형기준 아님'), `${tag}: sentencing disclaimer`);
      if (pName === 'veteran_injury') check((await page.textContent('.why')).includes('다툼 있음'), `${tag}: shaken-band conviction explained`);
      await noOverflow('outcome'); await noNumbers('outcome');
      await page.screenshot({ path: path.join(out, `demo-${vpName}-${pName}.png`), fullPage: true });

      await page.click('[data-action=reset]');
      check(await page.isVisible('text=사건 파일'), 'reset returns to case files');
      check(!errors.length, `${tag}: no page errors ${errors.join(';')}`);
      await page.close();
    }
    console.log(`Demo browser: ${checks} checks, 0 failures, exit 0`);
    return checks;
  } finally { await browser.close(); server.close(); }
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e); process.exitCode = 1; });
