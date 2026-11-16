'use strict';
// Real UI integration test. Game state is read from localStorage, never written by this test.
// Usage: FIRM_CHROMIUM=/path/to/chrome node tests/ui-smoke.cjs
// Optional: FIRM_HTML=/absolute/file.html FIRM_QA_DIR=/tmp/qa-output
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
let playwright;
try { playwright = require('playwright'); }
catch (error) {
  if (!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw new Error('Install playwright or set CODEX_PRIMARY_RUNTIME_NODE_MODULES.');
  playwright = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright'));
}
const PROJECT = path.resolve(__dirname, '..');
const HTML = path.resolve(process.env.FIRM_HTML || path.join(PROJECT, 'dist/THE_FIRM_Management_Play_v0.3.html'));
const TEMP = path.resolve(process.env.FIRM_QA_DIR || path.join(os.tmpdir(), 'the-firm-ui-qa-' + Date.now()));
const FALLBACK_CHROMIUM = '/tmp/thefirm-runtime/chromium/chrome-linux/headless_shell';
const executablePath = process.env.FIRM_CHROMIUM || (fs.existsSync(FALLBACK_CHROMIUM) ? FALLBACK_CHROMIUM : undefined);
const KEY = 'thefirm.management.0.3';
const hash = () => crypto.createHash('sha256').update(fs.readFileSync(HTML)).digest('hex');
const checks = [];
const runtimeErrors = [];
const blockedRequests = [];
const overflow = [];
let browser, context, page;
const report = { html: HTML, startHash: hash(), started: new Date().toISOString(), checks, runtimeErrors, blockedRequests, overflow };
fs.mkdirSync(TEMP, { recursive: true });

async function check(name, run) {
  try { await run(); checks.push({ name, pass: true }); process.stdout.write('PASS ' + name + '\n'); }
  catch (error) { checks.push({ name, pass: false, error: error.message }); throw error; }
}
async function state() {
  return page.evaluate(key => { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }, KEY);
}
async function stateText() { return page.evaluate(key => localStorage.getItem(key), KEY); }
function action(name, id, inside = '') {
  return page.locator((inside ? inside + ' ' : '') + '[data-action="' + name + '"]' + (id === undefined ? '' : '[data-id="' + id + '"]')).first();
}
async function click(name, id, inside) { await action(name, id, inside).click(); }
async function closeDialog() {
  if (await page.locator('#modal-root [role="dialog"]').count()) await click('close', undefined, '#modal-root');
}
async function nav(id) { await closeDialog(); await page.locator('.nav-item[data-id="' + id + '"]').click(); }
async function saveMenu() { await closeDialog(); await click('save'); }
async function reset() { await saveMenu(); await click('reset-confirm', undefined, '#modal-root'); await click('reset', undefined, '#modal-root'); }
async function assign(taskId, staffId) {
  await nav('people');
  await page.locator('#work-search').fill('');
  await click('filter', 'all');
  await click('assign', taskId);
  await click('choose-person', staffId, '#modal-root');
  assert.equal(await action('commit-assignment', undefined, '#modal-root').isEnabled(), true);
  await click('commit-assignment', undefined, '#modal-root');
  assert.equal((await state()).tasks.find(t => t.id === taskId).assignee, staffId);
}
async function advance() {
  await closeDialog();
  const before = await state();
  await page.locator('.advance[data-action="advance"]').click();
  const after = await state();
  assert.equal(after.dayIndex, before.dayIndex + 1);
  assert.equal(after.reports.length, after.dayIndex);
  return after;
}
async function importFile(contents, name = 'test-snapshot.json') {
  await saveMenu();
  const chooser = page.waitForEvent('filechooser');
  await click('import', undefined, '#modal-root');
  await (await chooser).setFiles({ name, mimeType: 'application/json', buffer: Buffer.from(contents, 'utf8') });
}
async function waitToast(text) {
  await page.waitForFunction(expected => document.querySelector('#toast')?.textContent.includes(expected), text);
}
async function measureOverflow(label) {
  const metrics = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth, html: document.documentElement.scrollWidth }));
  overflow.push({ label, ...metrics, excess: Math.max(metrics.body, metrics.html) - metrics.viewport });
  return metrics;
}

(async () => {
  try {
    browser = await playwright.chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', acceptDownloads: true });
    await context.route('**/*', route => {
      const url = route.request().url();
      if (/^https?:\/\//i.test(url)) { blockedRequests.push(url); return route.abort('internetdisconnected'); }
      return route.continue();
    });
    page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => runtimeErrors.push({ type: 'pageerror', message: error.message }));
    page.on('console', msg => { if (msg.type() === 'error') runtimeErrors.push({ type: 'console', message: msg.text() }); });
    await page.goto(pathToFileURL(HTML).href, { waitUntil: 'load' });
    await page.locator('.advance').waitFor();
    await check('offline single-file boot and initial state through UI reset', async () => {
      await reset();
      const current = await state();
      assert.equal(current.dayIndex, 0); assert.equal(current.cash, 18200000);
      assert.equal(current.intake.status, 'pending'); assert.equal(current.tasks.length, 4);
      assert.equal(current.cases.find(c => c.id === 'jung').dueDay, 3);
    });
    const initialState = await state();
    await check('A/B/C and all navigation pages preserve game state', async () => {
      const before = await stateText();
      for (const mode of ['brief', 'dossier', 'operations']) {
        await click('mode', mode);
        assert.equal(await action('mode', mode).getAttribute('aria-pressed'), 'true');
        await measureOverflow('1440-' + mode);
        assert.equal(await stateText(), before);
      }
      for (const destination of ['cases', 'people', 'finance', 'reports', 'home']) { await nav(destination); assert.equal(await stateText(), before); }
    });
    await check('C risk list opens assignment and Escape closes it without game mutation', async () => {
      await nav('home'); await click('mode', 'operations');
      const before = await stateText();
      const risk = page.locator('.risk-item').first();
      assert.equal(await risk.isVisible(), true);
      const taskId = await risk.getAttribute('data-id');
      const task = (await state()).tasks.find(entry => entry.id === taskId);
      assert.ok(task, 'Risk item must reference an existing task.');
      await risk.click();
      assert.equal(await page.locator('#modal-root [role="dialog"]').count(), 1);
      assert.ok((await page.locator('#dialog-title').innerText()).includes(task.title));
      assert.equal(await stateText(), before);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#modal-root [role="dialog"]').count(), 0);
      assert.equal(await stateText(), before);
    });
    await check('intake review is read-only until acceptance', async () => {
      const before = await stateText();
      await page.locator('.advance').click();
      assert.match(await page.locator('#dialog-title').innerText(), /윤지훈/);
      assert.equal(await stateText(), before);
      await closeDialog(); assert.equal(await stateText(), before);
      await page.locator('.advance').click(); await click('accept', undefined, '#modal-root');
      const current = await state();
      assert.equal(current.intake.status, 'accepted'); assert.equal(current.tasks.length, 7);
      assert.equal(current.cash, 18200000); assert.equal(current.reports.length, 0);
      assert.equal(current.invoices.find(i => i.id === 'invoice-yoon-upfront').status, 'unpaid');
    });
    await check('unapplied assignee/priority preview is discarded with Escape', async () => {
      const before = await stateText();
      await click('assign', 'jung-organize'); await click('choose-person', 'kim', '#modal-root');
      await page.locator('#priority-select').selectOption('3');
      assert.equal(await stateText(), before);
      assert.equal(await page.locator('#modal-root table.comparison').count(), 1);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#modal-root [role="dialog"]').count(), 0);
      assert.equal(await stateText(), before);
    });
    await check('ineligible legal-task assignment is disabled', async () => {
      await click('assign', 'jung-review');
      assert.equal(await action('choose-person', 'han', '#modal-root').isDisabled(), true);
      await closeDialog();
    });
    await check('apply initial assignments through real dialogs', async () => {
      for (const [taskId, staffId] of [['jung-organize', 'kim'], ['go-memo', 'lee'], ['yoon-collect', 'park'], ['yoon-brief', 'kim']]) await assign(taskId, staffId);
      assert.equal((await state()).dayIndex, 0);
    });
    await check('day 0 execution produces real work and no premature receipt', async () => {
      const current = await advance();
      assert.equal(current.dayIndex, 1);
      assert.equal(current.tasks.find(t => t.id === 'jung-organize').doneHours, 4);
      assert.equal(current.tasks.find(t => t.id === 'yoon-collect').completedDay, 0);
      assert.equal(current.reports[0].income, 0);
      assert.equal(current.invoices.find(i => i.id === 'invoice-yoon-upfront').status, 'unpaid');
    });
    await check('handoff preserves progress; day 1 posts the upfront receipt once', async () => {
      await assign('jung-organize', 'park');
      assert.equal((await state()).tasks.find(t => t.id === 'jung-organize').doneHours, 4);
      const current = await advance();
      assert.equal(current.tasks.find(t => t.id === 'jung-organize').completedDay, 1);
      assert.equal(current.ledger.filter(l => l.sourceId === 'invoice-yoon-upfront').length, 1);
      assert.equal(current.reports[1].income, 2400000);
      await assign('go-memo', 'park');
    });
    let completedState;
    await check('finish five days with every task on time and no duplicate receipts', async () => {
      for (let day = 2; day < 5; day++) await advance();
      completedState = await state();
      assert.equal(completedState.completed, true); assert.equal(completedState.dayIndex, 5);
      assert.equal(completedState.reports.length, 5);
      assert.ok(completedState.tasks.every(t => t.completedDay !== null && t.completedDay <= t.dueDay));
      assert.ok(completedState.reports.every(r => r.lateTasks.length === 0));
      assert.equal(completedState.ledger.filter(l => l.sourceId === 'invoice-existing').length, 1);
      assert.equal(completedState.ledger.find(l => l.sourceId === 'invoice-existing').day, 2);
      assert.equal(completedState.invoices.find(i => i.id === 'invoice-yoon-balance').status, 'unpaid');
      assert.equal(completedState.invoices.find(i => i.id === 'invoice-yoon-balance').dueDay, 5);
      assert.match(await page.locator('.week-summary').innerText(), /모든 준비 업무를 기한 안에 완료/);
    });
    await check('daily report tabs and finance show actual state without mutation', async () => {
      const before = await stateText();
      for (const entry of completedState.reports) {
        await click('report-tab', entry.id);
        assert.ok((await page.locator('.report-body').innerText()).includes(entry.summary));
      }
      await nav('finance');
      const text = await page.locator('#main').innerText();
      assert.ok(text.includes(completedState.cash.toLocaleString('ko-KR')));
      assert.ok(text.includes('1,200,000')); assert.ok(text.includes('준비 보고 잔금'));
      assert.equal(await stateText(), before);
    });
    let snapshot;
    await check('JSON download contains the exact raw snapshot', async () => {
      await saveMenu();
      const downloadPromise = page.waitForEvent('download');
      await click('export', undefined, '#modal-root');
      const download = await downloadPromise;
      const destination = path.join(TEMP, download.suggestedFilename());
      await download.saveAs(destination);
      snapshot = JSON.parse(fs.readFileSync(destination, 'utf8'));
      assert.deepEqual(snapshot, completedState);
      report.snapshot = destination;
    });
    await check('invalid JSON and malformed imported IDs preserve the active game', async () => {
      const before = await stateText();
      await importFile('{ this is not JSON }', 'invalid.json'); await waitToast('가져오지 못했습니다');
      assert.equal(await stateText(), before);
      const badId = JSON.parse(JSON.stringify(snapshot)); badId.events[0].id = 'x" autofocus onfocus="alert(1)';
      await importFile(JSON.stringify(badId), 'malformed-id.json'); await waitToast('ID');
      assert.equal(await stateText(), before);
      const badCash = JSON.parse(JSON.stringify(snapshot)); badCash.cash += 1;
      await importFile(JSON.stringify(badCash), 'corrupt-cash.json'); await waitToast('원장');
      assert.equal(await stateText(), before);
    });
    await check('normal JSON import restores a completed game after UI reset', async () => {
      await reset(); assert.equal((await state()).dayIndex, 0);
      await importFile(JSON.stringify(snapshot)); await waitToast('저장된 진행을 가져왔습니다');
      assert.deepEqual(await state(), completedState);
      assert.equal(await page.locator('.advance').innerText(), '주간 보고');
    });
    await check('page reload restores the saved game and A/B/C remain read-only', async () => {
      await page.reload({ waitUntil: 'load' }); await page.locator('.advance').waitFor();
      assert.deepEqual(await state(), completedState);
      const before = await stateText();
      for (const mode of ['brief', 'dossier', 'operations']) { await click('mode', mode); assert.equal(await stateText(), before); }
      await nav('reports');
      await page.screenshot({ path: path.join(TEMP, 'completed-reports-1440.png'), fullPage: true });
    });
    await check('null-assignee import renders, filters, and can be assigned through UI', async () => {
      const unassigned = JSON.parse(JSON.stringify(initialState)); unassigned.tasks[0].assignee = null;
      await importFile(JSON.stringify(unassigned), 'unassigned.json'); await waitToast('저장된 진행을 가져왔습니다');
      assert.equal((await state()).tasks[0].assignee, null);
      for (const mode of ['brief', 'dossier', 'operations']) await click('mode', mode);
      await nav('people'); await page.locator('#work-search').fill('미배정');
      assert.equal(await page.locator('.work-table tbody tr').count(), 1);
      await click('assign', 'jung-organize');
      assert.equal(await action('commit-assignment', undefined, '#modal-root').isDisabled(), true);
      await click('choose-person', 'kim', '#modal-root'); await click('commit-assignment', undefined, '#modal-root');
      assert.equal((await state()).tasks.find(t => t.id === 'jung-organize').assignee, 'kim');
    });
    await check('temporary cash shortfall remains visible despite a positive final forecast', async () => {
      const lowCash = JSON.parse(JSON.stringify(initialState));
      lowCash.cash = lowCash.openingCash = 100000;
      await importFile(JSON.stringify(lowCash), 'low-cash.json'); await waitToast('저장된 진행을 가져왔습니다');
      await page.locator('.advance').click(); await click('accept', undefined, '#modal-root');
      for (const mode of ['brief', 'dossier', 'operations']) {
        await click('mode', mode);
        assert.match(await page.locator('[data-cash-warning]').innerText(), /업무일 중 현금 부족 예상/);
      }
      await nav('finance');
      assert.match(await page.locator('[data-cash-warning]').innerText(), /최종 현금이 양수여도/);
      await page.screenshot({ path: path.join(TEMP, 'cash-warning-1440.png'), fullPage: true });
      await advance();
      assert.equal((await state()).cash, -274000);
      assert.match(await page.locator('[data-cash-warning]').innerText(), /현재 현금 부족/);
      await page.setViewportSize({ width: 390, height: 844 });
      await measureOverflow('390-cash-warning');
      await page.setViewportSize({ width: 1440, height: 900 });
    });
    await check('imported person capacities update all aggregate UI totals', async () => {
      const reduced = JSON.parse(JSON.stringify(initialState));
      reduced.staff.find(p => p.id === 'lee').capacity = 1;
      await importFile(JSON.stringify(reduced), 'reduced-capacity.json'); await waitToast('저장된 진행을 가져왔습니다');
      for (const mode of ['brief', 'operations']) {
        await click('mode', mode);
        assert.match(await page.locator('#main').innerText(), /\/ 12(?:시간|h)/);
      }
      await nav('people'); assert.match(await page.locator('.head-note').innerText(), /\/ 12시간/);
    });
    await check('390px window keeps body width bounded across all views and dialogs', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      const before = await stateText();
      for (const mode of ['brief', 'dossier', 'operations']) {
        await click('mode', mode); await measureOverflow('390-' + mode);
      }
      for (const destination of ['cases', 'people', 'finance', 'reports']) {
        await nav(destination); await measureOverflow('390-' + destination);
      }
      await nav('people'); await page.locator('#work-search').fill(''); await click('assign', 'jung-organize');
      await measureOverflow('390-assignment-dialog');
      assert.equal(await action('commit-assignment', undefined, '#modal-root').isVisible(), true);
      await page.screenshot({ path: path.join(TEMP, 'assignment-390.png'), fullPage: true });
      await closeDialog();
      assert.equal(await stateText(), before);
      const excess = overflow.filter(item => item.excess > 1);
      assert.deepEqual(excess, [], 'Body overflow: ' + JSON.stringify(excess));
    });
    await check('no JavaScript/console errors or remote network dependencies', async () => {
      assert.deepEqual(runtimeErrors, []);
      assert.deepEqual(blockedRequests, []);
    });
  } catch (error) {
    report.error = error.stack || error.message;
    if (page) { try { await page.screenshot({ path: path.join(TEMP, 'failure.png'), fullPage: true }); } catch (_) {} }
    process.stderr.write((error.stack || error.message) + '\n');
    process.exitCode = 1;
  } finally {
    report.endHash = hash(); report.artifactChangedDuringRun = report.startHash !== report.endHash;
    report.passed = checks.filter(item => item.pass).length;
    report.failed = checks.filter(item => !item.pass).length + (report.error && !checks.some(item => !item.pass) ? 1 : 0);
    report.finished = new Date().toISOString();
    fs.writeFileSync(path.join(TEMP, 'result.json'), JSON.stringify(report, null, 2));
    if (context) await context.close(); if (browser) await browser.close();
    process.stdout.write(JSON.stringify({ passed: report.passed, failed: report.failed, runtimeErrors: runtimeErrors.length, blockedRequests: blockedRequests.length, artifactChangedDuringRun: report.artifactChangedDuringRun, report: path.join(TEMP, 'result.json') }) + '\n');
    if (report.artifactChangedDuringRun && !process.exitCode) process.exitCode = 2;
  }
})();
