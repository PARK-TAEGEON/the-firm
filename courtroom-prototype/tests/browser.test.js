'use strict';
// Requires Playwright in the test environment only; the shipped app has no dependencies.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const { createServer } = require('../serve');
(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser, checks = 0;
  const errors = [];
  const check = (condition, message) => { assert.ok(condition, message); checks++; };
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.locator('[data-theory="THEORY_IDENTITY"]').click();
    check(await page.locator('[data-premise="P_DISTANCE_27M"]').isDisabled(), 'Unrecorded disabled');
    check(await page.locator('[data-action="press"]').isDisabled(), 'Press initially disabled');
    for (const id of ['G_INITIAL', 'G_DURATION', 'G_DISTANCE']) await page.locator(`[data-goal="${id}"]`).click();
    for (const id of ['P_INITIAL_UNCERTAIN', 'P_OBSERVATION_SHORT', 'P_DISTANCE_27M']) await page.locator(`[data-premise="${id}"]`).click();
    check(await page.locator('.conclusion').innerText().then(t => t.includes('식별 정확성')), 'Argument visible');
    await page.locator('[data-action="press"]').click();
    check((await page.locator('.response-type').innerText()) === '인정', 'Admit');
    await page.locator('[data-action="frame"]').click();
    check(await page.locator('[data-action="frame"]').isDisabled(), 'Duplicate frame disabled');
    check((await page.locator('#recordPanel').innerText()).includes('식별 한계 인정'), 'Recorded concession');
    fs.mkdirSync(path.join(__dirname, 'artifacts'), { recursive: true });
    await page.screenshot({ path: path.join(__dirname, 'artifacts', 'desktop.png'), fullPage: true });
    await page.locator('[data-action="open-strategy"]').click();
    await page.locator('[data-theory="THEORY_INTENT"]').click();
    check(await page.locator('.warning').isVisible(), 'Strategy conflict visible');
    await page.locator('[data-action="stop"]').click();
    check((await page.locator('.result-box h1').innerText()).includes('약화'), 'Record-based result');
    check((await page.locator('.result-box').innerText()).includes('고의는 판단하지'), 'Bounded result');
    await page.locator('#examination [data-action="reset"]').click();
    await page.locator('[data-theory="THEORY_IDENTITY"]').click();
    for (const id of ['G_DISTANCE', 'G_LIGHTING']) await page.locator(`[data-goal="${id}"]`).click();
    for (const id of ['P_DISTANCE_27M', 'P_LIGHTING_POOR']) await page.locator(`[data-premise="${id}"]`).click();
    await page.locator('[data-action="press"]').click();
    check((await page.locator('.response-type').innerText()) === '설명', 'Explain');
    check((await page.locator('.record-item.counter').innerText()).includes('간판 불빛'), 'Counter visible');
    await page.locator('[data-action="stop"]').click();
    check((await page.locator('.result-box h1').innerText()).includes('상반된'), 'Counter changes finding');
    await page.locator('#examination [data-action="reset"]').click();
    await page.locator('[data-theory="THEORY_IDENTITY"]').click();
    for (const id of ['G_DISTANCE', 'G_DURATION']) await page.locator(`[data-goal="${id}"]`).click();
    for (const id of ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT']) await page.locator(`[data-premise="${id}"]`).click();
    await page.locator('[data-action="press"]').click();
    check((await page.locator('.response-type').innerText()) === '버팀', 'Resist');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-evidence]').click();
    check(await page.locator('#evidenceDialog').isVisible(), 'Mobile evidence dialog');
    await page.keyboard.press('Escape');
    check(!(await page.locator('#evidenceDialog').isVisible()), 'Dialog Escape');
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No mobile horizontal overflow');
    check(await page.locator('#recordPanel').isVisible(), 'Mobile court record available');
    await page.screenshot({ path: path.join(__dirname, 'artifacts', 'mobile.png'), fullPage: true });
    await page.locator('[data-action="stop"]').click();
    check(await page.locator('.result-box').isVisible(), 'Mobile stop');
    // Repetition -> counter -> scoped rebuttal -> reinforced admission, through UI.
    await page.locator('#examination [data-action="reset"]').click();
    await page.locator('[data-theory="THEORY_IDENTITY"]').click();
    for (const id of ['G_DISTANCE', 'G_DURATION']) await page.locator(`[data-goal="${id}"]`).click();
    for (const id of ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT']) await page.locator(`[data-premise="${id}"]`).click();
    await page.locator('[data-action="press"]').click(); await page.locator('[data-action="press"]').click();
    await page.locator('[data-action="open-record"]').click();
    check(await page.locator('#recordDialog').isVisible(), 'Fixed Record opens mobile sheet');
    check(await page.locator('[data-counter]').isDisabled(), 'Counter response requires initial statement');
    check((await page.locator('#recordDialog').innerText()).includes('최초 불확실'), 'Missing basis explained');
    await page.keyboard.press('Escape');
    check(!(await page.locator('#recordDialog').isVisible()), 'Record sheet Escape');
    await page.locator('[data-goal="G_INITIAL"]').click();
    await page.locator('[data-action="open-record"]').click(); await page.locator('[data-counter]').click();
    check((await page.locator('#recordDialog').innerText()).includes('의미 제한됨'), 'Counter visibly qualified');
    check((await page.locator('#recordDialog').innerText()).includes('6년'), 'Original counter retained');
    check(await page.locator('[data-counter]').isDisabled(), 'Counter cannot be answered twice');
    await page.locator('#closeRecord').click();
    check(await page.evaluate(() => new Set([...document.querySelectorAll('[id]')].map(x => x.id)).size === document.querySelectorAll('[id]').length), 'Sheet does not clone IDs');
    await page.locator('[data-premise="P_INITIAL_UNCERTAIN"]').click();
    check((await page.locator('#pressureHint').innerText()).includes('근거 보강'), 'Reinforced preview');
    await page.locator('[data-action="press"]').click();
    check((await page.locator('.response-type').innerText()) === '인정', 'Reinforced Press works after previous presses');
    await page.locator('[data-action="mobile-case"]').click();
    check(await page.locator('#mobileCaseInfo').isVisible(), 'Mobile case information accessible');
    check(await page.locator('[data-detail="case-issues"]').getAttribute('open') !== null, 'Mobile issues expanded');
    check((await page.locator('#mobileCaseInfo').innerText()).includes('무죄 판결'), 'Client objective remains on mobile');
    await page.locator('[data-action="stop"]').click();
    check((await page.locator('.result-box h1').innerText()).includes('증인의 인정'), 'Strong admission outcome');
    // Same prepared facts, two different conservative decisions.
    for (const mode of ['safe', 'frame']) {
      await page.locator('#examination [data-action="reset"]').click(); await page.locator('[data-theory="THEORY_IDENTITY"]').click();
      for (const id of ['G_INITIAL', 'G_DURATION', 'G_DISTANCE']) await page.locator(`[data-goal="${id}"]`).click();
      if (mode === 'frame') {
        for (const id of ['P_INITIAL_UNCERTAIN', 'P_OBSERVATION_SHORT', 'P_DISTANCE_27M']) await page.locator(`[data-premise="${id}"]`).click();
        await page.locator('[data-action="frame"]').click();
      }
      await page.locator('[data-action="stop"]').click();
      check((await page.locator('.result-box h1').innerText()).includes(mode === 'safe' ? '안전하게 보존' : '논증으로 구축'), `${mode} has its own outcome`);
      check((await page.locator('.result-box').innerText()).includes('식별 한계 인정 0건'), `${mode} does not invent admission`);
    }
    // Selection updates in place: exact DOM identity, keyboard focus, disclosure and scroll.
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.locator('#examination [data-action="reset"]').click(); await page.locator('[data-theory="THEORY_IDENTITY"]').click();
    for (const id of ['G_INITIAL', 'G_DURATION', 'G_DISTANCE']) await page.locator(`[data-goal="${id}"]`).click();
    for (const id of ['P_INITIAL_UNCERTAIN', 'P_OBSERVATION_SHORT', 'P_DISTANCE_27M']) await page.locator(`[data-premise="${id}"]`).click();
    await page.evaluate(() => {
      const details = document.querySelector('#recordPanel details'); details.open = true;
      window.uiBefore = { chip: document.querySelector('[data-premise="P_DISTANCE_27M"]'), details, record: document.querySelector('#recordPanel').firstElementChild };
      window.scrollTo(0, 190); window.uiBefore.chip.focus({ preventScroll: true }); window.uiBefore.scroll = window.scrollY;
    });
    await page.keyboard.press('Space');
    check(await page.evaluate(() => document.activeElement === window.uiBefore.chip), 'Keyboard focus preserved on selection');
    check(await page.evaluate(() => window.uiBefore.details.isConnected && window.uiBefore.details.open), 'Expanded record DOM preserved');
    check(await page.evaluate(() => document.querySelector('#recordPanel').firstElementChild === window.uiBefore.record), 'Record panel not rebuilt');
    check(await page.evaluate(() => Math.abs(window.scrollY - window.uiBefore.scroll) < 2), 'Scroll preserved');
    await page.keyboard.press('Space');
    check(await page.locator('[data-premise="P_DISTANCE_27M"]').getAttribute('aria-pressed') === 'true', 'Keyboard reselect works');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(__dirname, 'artifacts', 'desktop-v03.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 }); await page.locator('[data-action="open-record"]').click();
    await page.screenshot({ path: path.join(__dirname, 'artifacts', 'mobile-record-v03.png') });
    await page.locator('#closeRecord').click();
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Final mobile has no horizontal overflow');
    // Test actual double-click distribution path without a local HTTP server.
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('[data-theory="THEORY_IDENTITY"]').click();
    await page.locator('[data-action="stop"]').click();
    check((await page.locator('.result-box h1').innerText()).includes('부족'), 'Portable file URL and zero-evidence stop');
    check(errors.length === 0, 'No browser errors: ' + errors.join('; '));
    console.log(`Browser: ${checks} checks, 0 failures, exit 0`);
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
