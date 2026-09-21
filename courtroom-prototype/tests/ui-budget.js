'use strict';
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('[data-theory="THEORY_IDENTITY"]').click();
    for (const id of ['G_DISTANCE', 'G_DURATION', 'G_INITIAL']) await page.locator(`[data-goal="${id}"]`).click();
    for (const id of ['P_DISTANCE_27M', 'P_OBSERVATION_SHORT', 'P_INITIAL_UNCERTAIN']) await page.locator(`[data-premise="${id}"]`).click();
    const metrics = await page.evaluate(() => {
      // Visible text only: exclude sr-only announcements and closed details/dialogs.
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let node, chars = 0;
      while ((node = walker.nextNode())) {
        const el = node.parentElement;
        if (!el || el.closest('script,style,.sr-only') || !node.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(node);
        if ([...range.getClientRects()].some(r => r.width && r.height) && el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) chars += node.textContent.replace(/\s/g, '').length;
      }
      return { viewport: '1440x1080', scene: 'three facts, selected strong inference, before Press/Frame', visibleCharacters: chars,
        documentHeight: document.documentElement.scrollHeight, examinationHeight: Math.round(document.querySelector('#examination').getBoundingClientRect().height),
        laneBottom: Math.round(document.querySelector('.lane').getBoundingClientRect().bottom) };
    });
    fs.mkdirSync(path.join(__dirname, 'artifacts'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'artifacts', `ui-budget-${process.argv[2] || 'current'}.json`), JSON.stringify(metrics, null, 2));
    if(process.argv[2]==='v05'){assert.ok(metrics.visibleCharacters<=1004,'Visible-text budget');assert.ok(metrics.documentHeight<=1080,'Page height budget');assert.ok(metrics.laneBottom<=1080,'Lane remains in viewport');}
    console.log(JSON.stringify(metrics));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
