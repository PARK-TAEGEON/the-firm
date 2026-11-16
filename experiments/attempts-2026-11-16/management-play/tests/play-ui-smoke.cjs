'use strict';
// Tests the offline UI through real controls. Snapshot fixtures enter only through JSON import.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const E = require('../src/engine.js');
let playwright;
try { playwright = require('playwright'); }
catch (_) { playwright = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '', 'playwright')); }
const ROOT = path.resolve(__dirname, '..');
const HTML = path.resolve(process.env.FIRM_HTML || path.join(ROOT, 'dist/THE_FIRM_Management_Play_v0.4.html'));
const OUTPUT = path.resolve(process.env.FIRM_QA_DIR || path.join(ROOT, 'docs/play-ui-qa'));
const KEY = 'thefirm.management.0.3';
const hash = () => crypto.createHash('sha256').update(fs.readFileSync(HTML)).digest('hex');
const report = { started: new Date().toISOString(), html: HTML, startHash: hash(), checks: [], overflow: [], errors: [], remoteRequests: [] };
fs.mkdirSync(OUTPUT, { recursive: true });
let browser, context, page;
async function check(name, fn) {
  try { await fn(); report.checks.push({ name, pass: true }); console.log('PASS ' + name); }
  catch (error) { report.checks.push({ name, pass: false, error: error.message }); throw error; }
}
const action = (name, id, scope = '') => page.locator((scope ? scope + ' ' : '') + '[data-action="' + name + '"]' + (id === undefined ? '' : '[data-id="' + id + '"]')).first();
const click = (name, id, scope) => action(name, id, scope).click();
const stateText = () => page.evaluate(key => localStorage.getItem(key), KEY);
async function state() { return JSON.parse(await stateText()); }
async function close() { if (await page.locator('#modal-root [role="dialog"]').count()) await click('close', undefined, '#modal-root'); }
async function nav(id) { await close(); await page.locator('.nav-item[data-id="' + id + '"]').click(); }
async function saveMenu() { await close(); await click('save'); }
async function reset(rule = 'commitment', challenge = 'first') {
  await saveMenu(); await click('reset-confirm', undefined, '#modal-root');
  await page.locator('#restart-rules').selectOption(rule);
  await page.locator('#restart-challenge').selectOption(challenge);
  await click('reset', undefined, '#modal-root');
}
async function accept() { await close(); await click('intake'); await click('accept', undefined, '#modal-root'); }
async function advance() {
  await close(); const before = await state();
  await page.locator('.advance[data-action="advance"]').click();
  const after = await state(); assert.equal(after.dayIndex, before.dayIndex + 1);
  return after;
}
async function importState(snapshot, name = 'play-fixture.json', valid = true) {
  await saveMenu(); const promise = page.waitForEvent('filechooser');
  await click('import', undefined, '#modal-root');
  await (await promise).setFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(snapshot)) });
  await page.waitForFunction(text => document.querySelector('#toast').textContent.includes(text), valid ? '저장된 진행을 가져왔습니다' : '가져오지 못했습니다');
  if (valid) assert.deepEqual(await state(), snapshot);
}
async function metricsMatch(summary) {
  for (const key of ['cash', 'receivables', 'minimumCash', 'negativeCashDays', 'readyCases', 'lateTasks', 'refundPaid']) {
    const field = page.locator('.week-summary [data-metric="' + key + '"]');
    assert.equal(await field.count(), 1, key + ' must have its own result field');
    assert.equal(Number(await field.getAttribute('data-value')), summary[key], key + ' differs from engine');
  }
}
async function bounded(label) {
  const value = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth, html: document.documentElement.scrollWidth }));
  report.overflow.push({ label, ...value });
  assert.ok(Math.max(value.body, value.html) <= value.viewport + 1, label + ' body overflow');
}
function execute(initial) {
  let current = E.command(initial, { type: 'ACCEPT_INTAKE' }).state;
  while (!current.completed) current = E.command(current, { type: 'ADVANCE_DAY' }).state;
  return current;
}
(async () => {
  try {
    browser = await playwright.chromium.launch({ executablePath: process.env.FIRM_CHROMIUM, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce', acceptDownloads: true });
    await context.route('**/*', route => {
      if (/^https?:\/\//i.test(route.request().url())) { report.remoteRequests.push(route.request().url()); return route.abort(); }
      return route.continue();
    });
    page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') report.errors.push(msg.text()); });
    await page.goto(pathToFileURL(HTML).href, { waitUntil: 'load' });
    await page.locator('.advance').waitFor();
    await check('first run and reset expose the commitment contract before acceptance', async () => {
      await reset(); const initial = await state();
      assert.deepEqual(initial, E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50, openingCash: 18200000 }));
      const before = await stateText(); await click('intake');
      const terms = await page.locator('#modal-root').innerText();
      assert.match(terms, /환급/); assert.match(terms, /50%/); assert.match(terms, /1,200,000|120만/);
      assert.equal(await stateText(), before); await close();
    });
    await check('all views expose a current-plan goal panel without mutating the state', async () => {
      const before = await stateText();
      for (const mode of ['brief', 'dossier', 'operations']) {
        await click('mode', mode);
        assert.equal(await page.locator('[data-goal]').count(), 3);
        await bounded('1366-' + mode); assert.equal(await stateText(), before);
      }
    });
    await check('assignment preview shows portfolio effects and cancellation changes nothing', async () => {
      await accept(); await nav('people'); const before = await stateText();
      await click('assign', 'jung-organize'); await click('choose-person', 'kim', '#modal-root');
      assert.equal(await page.locator('[data-plan-impact]').count(), 1);
      assert.equal(await stateText(), before);
      await page.keyboard.press('Escape'); assert.equal(await stateText(), before);
    });
    await check('five real UI days post one refund and keep separate result metrics', async () => {
      for (let day = 0; day < 5; day++) await advance();
      const actual = await state(); const expected = execute(E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50, openingCash: 18200000 }));
      assert.deepEqual(actual, expected);
      assert.equal(E.summarize(actual).refundPaid, 1200000);
      await metricsMatch(E.summarize(actual));
      const last = actual.reports[4];
      assert.equal(last.cashBefore + last.income - last.expenses, last.cashAfter);
      assert.match(await page.locator('.report-body').innerText(), /환급/);
      await page.screenshot({ path: path.join(OUTPUT, 'commitment-result-1366.png'), fullPage: true });
    });
    await check('new snapshot export and reload preserve exact state and contract', async () => {
      const before = await state(); await saveMenu();
      const promise = page.waitForEvent('download'); await click('export', undefined, '#modal-root');
      const download = await promise; const target = path.join(OUTPUT, 'exported-play-state.json');
      await download.saveAs(target); assert.deepEqual(JSON.parse(fs.readFileSync(target, 'utf8')), before);
      await page.reload({ waitUntil: 'load' }); await page.locator('.advance').waitFor();
      assert.deepEqual(await state(), before);
      await reset(); await importState(before); assert.deepEqual(await state(), before);
    });
    await check('tampered refund import is rejected atomically', async () => {
      const before = await stateText(); const forged = JSON.parse(before);
      const refund = forged.ledger.find(entry => entry.sourceId === 'contract-refund:yoon');
      assert.ok(refund); refund.amount += 1; forged.cash -= 1;
      forged.reports[4].expenses += 1; forged.reports[4].cashAfter -= 1;
      await importState(forged, 'tampered-refund.json', false);
      assert.equal(await stateText(), before);
    });
    await check('legacy import remains under original rules and receives no retroactive refund', async () => {
      const original = E.createInitialState(); await importState(original, 'original-v0.3.json');
      await accept(); for (let day = 0; day < 5; day++) await advance();
      const actual = await state(); assert.deepEqual(actual, execute(original));
      assert.equal(actual.version, '0.3.0'); assert.equal(E.summarize(actual).refundPaid, 0);
      await metricsMatch(E.summarize(actual));
    });
    await check('new-week settings are drafts until applied and original comparison is selectable', async () => {
      const before = await stateText(); await saveMenu(); await click('reset-confirm', undefined, '#modal-root');
      await page.locator('#restart-rules').selectOption('baseline');
      await page.locator('#restart-challenge').selectOption('tight');
      assert.equal(await stateText(), before); await close(); assert.equal(await stateText(), before);
      await reset('baseline', 'first'); assert.deepEqual(await state(), E.createInitialState());
    });
    await check('tight-cash selection and a stress import preserve interim deficit in final results', async () => {
      await reset('commitment', 'tight'); assert.equal((await state()).openingCash, 600000);
      // The 200k fixture is a deliberate stress condition, separate from the playable 600k challenge.
      await importState(E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50, openingCash: 200000 }), 'cash-stress-200k.json');
      await accept(); await advance(); assert.ok((await state()).cash < 0);
      assert.match(await page.locator('[data-cash-warning]').innerText(), /현재 현금 부족/);
      for (let day = 1; day < 5; day++) await advance();
      const actual = await state(); const summary = E.summarize(actual);
      assert.ok(summary.cash > 0); assert.ok(summary.minimumCash < 0); assert.ok(summary.negativeCashDays > 0);
      await metricsMatch(summary);
      const goal = page.locator('.week-summary [data-goal="liquidity"]');
      assert.match(await goal.getAttribute('class'), /at-risk/);
      assert.doesNotMatch(await goal.getAttribute('class'), /achieved/);
      await page.screenshot({ path: path.join(OUTPUT, 'tight-cash-result-1366.png'), fullPage: true });
    });
    await check('mobile results and new-week controls stay within the viewport', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      for (const mode of ['brief', 'dossier', 'operations']) { await click('mode', mode); await bounded('390-' + mode); }
      for (const destination of ['people', 'finance', 'reports']) { await nav(destination); await bounded('390-' + destination); }
      await saveMenu(); await click('reset-confirm', undefined, '#modal-root'); await bounded('390-new-week');
      assert.equal(await page.locator('#restart-rules').isVisible(), true);
      assert.equal(await action('reset', undefined, '#modal-root').isVisible(), true);
      const resetBox = await action('reset', undefined, '#modal-root').boundingBox();
      assert.ok(resetBox.x >= 0 && resetBox.x + resetBox.width <= 391 && resetBox.y + resetBox.height <= 845, 'New-week confirmation must be in the viewport');
      await page.screenshot({ path: path.join(OUTPUT, 'new-week-390.png'), fullPage: true }); await close();
    });
    await check('offline play has no runtime errors or remote dependencies', async () => {
      assert.deepEqual(report.errors, []); assert.deepEqual(report.remoteRequests, []);
    });
  } catch (error) {
    report.error = error.stack || error.message; process.stderr.write(report.error + '\n'); process.exitCode = 1;
    if (page) try { await page.screenshot({ path: path.join(OUTPUT, 'failure.png'), fullPage: true }); } catch (_) {}
  } finally {
    report.endHash = hash(); report.artifactChangedDuringRun = report.startHash !== report.endHash;
    report.passed = report.checks.filter(c => c.pass).length;
    report.failed = report.checks.filter(c => !c.pass).length + (report.error && !report.checks.some(c => !c.pass) ? 1 : 0);
    report.finished = new Date().toISOString();
    fs.writeFileSync(path.join(OUTPUT, 'result.json'), JSON.stringify(report, null, 2) + '\n');
    if (context) await context.close(); if (browser) await browser.close();
    console.log(JSON.stringify({ passed: report.passed, failed: report.failed, runtimeErrors: report.errors.length, remoteRequests: report.remoteRequests.length, artifactChangedDuringRun: report.artifactChangedDuringRun, report: path.join(OUTPUT, 'result.json') }));
    if (report.artifactChangedDuringRun && !process.exitCode) process.exitCode = 2;
  }
})();

