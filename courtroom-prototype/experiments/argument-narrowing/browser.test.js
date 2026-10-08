'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createServer } = require('../../serve');
(async () => {
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser, checks = 0;
  const check = (value, label) => { assert.ok(value, label); checks++; };
  const out = path.resolve(__dirname, '../../tests/artifacts/argument-narrowing');
  fs.mkdirSync(out, { recursive: true });
  try {
    browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge', headless: true });
    for (const transport of ['http', 'file']) for (const width of [1440, 390]) for (const prosecutor of ['novice', 'veteran']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } }), errors = [];
      page.setDefaultTimeout(5000); page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => {
        Object.defineProperty(window, 'FirmDemoSession', { configurable: true, set(api) {
          const create = api.createDemoSession;
          api.createDemoSession = options => { const s = create(options); window.readDemo = () => s.projection(); return s; };
          Object.defineProperty(window, 'FirmDemoSession', { configurable: true, value: api });
        } });
      });
      const base = transport === 'http' ? 'http://127.0.0.1:' + server.address().port + '/demo.html' : pathToFileURL(path.resolve(__dirname, '../../demo.html')).href;
      await page.goto(base + '?argumentRevision=1');
      await page.click('label:has(input[value=' + prosecutor + '])');
      await page.click('[data-action=start]'); await page.click('[data-scene=all]');
      await page.click('[data-scene=finish]'); await page.click('[data-action=closeReader]');
      for (const id of ['INV_SIG_MEDICAL', 'INV_SIG_SEQUENCE']) {
        await page.click('[data-action=investigate][data-id=' + id + ']');
        await page.click('[data-action=fileEvidence][data-status=filed]');
      }
      await page.click('[data-action=finishPrep]');
      await page.click('[data-revision=claim]');
      await page.click('label:has(input[value=F_SIG_CAUSE])'); await page.click('label:has(input[value=S_SIG_CONTACT])');
      await page.click('[data-action=open]');
      for (const [id, opinion] of Object.entries({ PX_SIG_STATEMENT: 'disagree', PX_SIG_REPORT: 'disagree', PX_SIG_MEDICAL: 'agree', PX_SIG_VIDEO: 'agree' }))
        await page.check('input[name="opinion:' + id + '"][value=' + opinion + ']');
      await page.click('[data-action=evidenceOpinions]');
      const queue = ['A_SIG_CAUSE_MEDICAL', 'A_SIG_CAUSE_SEQUENCE', 'P_SIG_CAUSE_LIMITED'];
      for (let guard = 0; guard < 120; guard++) {
        const t = await page.evaluate(() => window.readDemo().trial);
        if (t.actions.closing) break;
        if (t.state.pending) {
          await page.click('[data-action=' + (t.state.pending.type === 'objection' ? (t.state.pending.stepId.endsWith('_VALID') ? 'object' : 'pass') : 'skipRebut') + ']');
        } else if (t.actions.endCross) {
          const q = t.witness.id === 'W_SIG_INVESTIGATOR' ? queue.shift() : null;
          await page.click(q ? '[data-action=' + (q.startsWith('P_') ? 'press' : 'approach') + '][data-id=' + q + ']' : '[data-action=endCross]');
        } else await page.click('[data-action=continue]');
      }
      check(await page.locator('[name=revisionBasis]').count() === 3, 'three confirmed bases');
      check((await page.textContent('#argumentRevision')).includes('남은 반론'), 'counters visible');
      await page.locator('[name=revisionBasis]').nth(0).check(); await page.locator('[name=revisionBasis]').nth(1).check();
      await page.check('[name=revisionCounters]');
      const before = await page.evaluate(() => window.readDemo().trial.records);
      await page.locator('[data-revision=revise]').focus(); await page.keyboard.press('Enter');
      const after = await page.evaluate(() => window.readDemo().trial);
      check(JSON.stringify(after.records.slice(0, before.length)) === JSON.stringify(before), 'old records unchanged');
      check(after.argumentRevision.revision.basisIds.length === 2, 'selected bases recorded');
      check(await page.evaluate(() => document.activeElement.matches('#argumentRevision h2')), 'keyboard focus restored');
      check((await page.textContent('#argumentRevision')).includes('검사의 대응'), 'response visible');
      await page.locator('#argumentRevision details').last().locator('summary').click();
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal overflow');
      if (transport === 'http' && prosecutor === 'veteran') {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ fullPage: true, path: path.join(out, 'revision-' + width + '.png') });
      }
      await page.click('[data-revision=final]');
      await page.click('[data-action=continue]'); await page.click('[data-action=verdict]');
      const v = await page.evaluate(() => window.readDemo());
      check(v.trial.state.phase === 'verdict', 'finished verdict');
      check(!!v.trial.records.find(r => r.kind === 'closing_argument').revisionId, 'closing linked');
      check((await page.textContent('#argumentRevision')).includes('최후변론에 반영'), 'result recap');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'result no overflow');
      check(errors.length === 0, errors.join('\n'));
      // Reopen without the flag; no test-only UI or state should leak across reloads.
      await page.goto(base); await page.click('[data-action=start]');
      check(await page.evaluate(() => window.readDemo().trial.argumentRevision === undefined), 'default flag off');
      await page.close();
    }
    console.log('argument-narrowing browser: ' + checks + ' checks, 0 failures; 8 complete UI runs (HTTP/file, 1440/390, novice/veteran)');
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
