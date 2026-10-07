'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({ headless: true });
  let checks = 0;
  const check = (value, label) => { assert.ok(value, label); checks++; };
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.setDefaultTimeout(4000);
      await page.goto(pathToFileURL(path.resolve(__dirname, '../demo.html')).href);
      await page.click('[data-action=start]');
      await page.waitForFunction(() => document.querySelector('.scene-photo')?.naturalWidth > 0 && document.querySelector('.scene-portrait img')?.naturalWidth > 0);
      check(await page.locator('.scene-shade').evaluate(e => getComputedStyle(e).backgroundColor === 'rgba(0, 0, 0, 0.58)'), 'photo overlay unchanged');
      const size = await page.locator('.scene-portrait').boundingBox();
      check(size.width === (width === 390 ? 56 : 96) && size.height === (width === 390 ? 66 : 112), 'portrait dimensions');
      // A genuinely unavailable URL must trigger the same fallback as a removed asset.
      await page.evaluate(() => {
        window.FirmDemoLocations[0].image = 'assets/locations/missing-test-photo.jpg';
        window.FirmDemoPortraits.default = 'assets/portraits/missing-test-portrait.svg';
      });
      await page.click('[data-scene=next]');
      await page.waitForFunction(() => !document.querySelector('.scene-photo, .scene-portrait img'));
      check(await page.locator('.scene-portrait').textContent() === '변', 'failed default portrait reveals initial');
      check(await page.locator('#consultation').evaluate(e => !e.classList.contains('has-photo') && getComputedStyle(e).backgroundImage.includes('linear-gradient')), 'missing photo uses gradient');
      check((await page.textContent('.scene-location')) === '사무실 회의실', 'location label retained');
      check(await page.evaluate(() => {
        const d=document.querySelector('#consultation').getBoundingClientRect(), h=document.querySelector('.scene-layout header').getBoundingClientRect(), b=document.querySelector('.scene-dock').getBoundingClientRect();
        return h.top-d.top<=30 && b.top-h.bottom<=16 && d.bottom-b.bottom<=30;
      }), 'missing photo uses compact layout');
      await page.evaluate(() => { delete window.FirmDemoLocations[0].image; });
      await page.click('[data-scene=next]');
      await page.waitForFunction(() => !document.querySelector('.scene-portrait img'));
      check(await page.locator('.scene-portrait').textContent() === '정', 'client surname on load failure');
      check(!(await page.locator('#consultation').evaluate(e=>e.classList.contains('has-photo'))), 'unset photo stays compact');
      await page.click('[data-scene=all]'); await page.click('[data-scene=finish]');
      await page.click('[data-action=finishPrep]');
      await page.click('label:has(input[value=F_SIG_ACT])');
      await page.click('label:has(input[value=S_SIG_RESERVE])');
      await page.click('[data-action=open]');
      await page.waitForFunction(() => !document.querySelector('.face img'));
      check(await page.locator('.face').allTextContents().then(xs=>xs.join('')==='윤한변'), 'court load failure retains initials');
      await page.evaluate(() => { window.FirmDemoPortraits.default = 'assets/portraits/default.svg'; });
      await page.click('[data-action=continue]');
      await page.waitForFunction(() => [...document.querySelectorAll('.face img')].length===3 && [...document.querySelectorAll('.face img')].every(i=>i.naturalWidth>0));
      check(await page.locator('.face').evaluateAll(faces => faces.every(f=>{
        const style=getComputedStyle(f), img=f.querySelector('img'), box=f.getBoundingClientRect(), ib=img.getBoundingClientRect();
        const variable=f.parentElement.dataset.side==='PROSECUTOR'?'--pros':f.parentElement.dataset.side==='DEFENSE'?'--def':'--brass';
        const probe=document.createElement('span');probe.style.color='var('+variable+')';f.append(probe);
        const expected=getComputedStyle(probe).color;probe.remove();
        return style.borderRadius==='50%' && style.overflow==='hidden' && style.borderColor===expected && getComputedStyle(img).objectFit==='cover' && ib.width<=box.width && ib.height<=box.height;
      })), 'three circular portraits preserve party border colors');
      await page.evaluate(() => { window.FirmDemoPortraits.byId.PROSECUTOR='assets/locations/office_lounge.jpg'; });
      await page.click('[data-action=continue]');
      check(await page.locator('[data-side=PROSECUTOR] img').getAttribute('src')==='assets/locations/office_lounge.jpg', 'court byId overrides default');
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), 'no horizontal overflow');
      await page.close();
    }
    console.log('Demo art browser: '+checks+' checks, 0 failures, exit 0');
  } finally { await browser.close(); }
})().catch(e=>{ console.error(e); process.exitCode=1; });
