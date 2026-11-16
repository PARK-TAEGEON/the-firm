#!/usr/bin/env python3
"""브라우저에서 한 판을 처음부터 끝까지 자동으로 플레이한다(file:// 로 직접 연다).
사용: python3 tests/browser_play.py [--shots DIR]   · 환경변수 FIRM_CHROMIUM 으로 실행 파일 지정 가능.
검사: 장면 전환, 콘솔 오류 0, 가로 넘침 없음(1440·390), 새로고침 뒤 이어하기, 용어 설명 중첩."""
import asyncio, os, sys, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
URL = (ROOT / 'index.html').as_uri()
SHOTS = pathlib.Path(sys.argv[sys.argv.index('--shots') + 1]) if '--shots' in sys.argv else None
checks = fails = 0

def check(ok, label):
    global checks, fails
    checks += 1
    if not ok:
        fails += 1
        print('FAIL', label)

async def shot(page, name):
    if SHOTS:
        SHOTS.mkdir(parents=True, exist_ok=True)
        await page.wait_for_timeout(700)
        await page.screenshot(path=str(SHOTS / (name + '.png')))

async def act(page, name, nth=0):
    await page.locator(('.modal .btn' if name == 'closeModal' else '') + '[data-act="%s"]:not([disabled])' % name).nth(nth).click()

async def scene(page):
    return await page.evaluate("(document.querySelector('main.scene')||{className:'title'}).className.replace('scene scene-','').split(' ')[0]")

async def no_overflow(page, label):
    wide = await page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
    check(not wide, 'no horizontal overflow: ' + label)

async def play(page, tag, width, improve):
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    await page.goto(URL); await page.evaluate('localStorage.clear()'); await page.reload()
    check(await scene(page) == 'title', tag + ' title'); await shot(page, tag + '-01-title'); await no_overflow(page, tag + ' title')
    await act(page, 'new')
    check(await scene(page) == 'intro', tag + ' intro'); await shot(page, tag + '-02-intro')
    for _ in range(8): await act(page, 'nextIntro')
    await shot(page, tag + '-03-memo'); await act(page, 'finishIntro')
    check(await scene(page) == 'office', tag + ' office'); await shot(page, tag + '-04-office'); await no_overflow(page, tag + ' office')
    check(await page.locator('[data-act="advance"]').is_disabled(), tag + ' advance blocked until intake decided')
    await act(page, 'decline')
    if improve:
        await page.locator('[data-act="assign"][data-id="jung-organize"]').click()
        await shot(page, tag + '-05-assign')
        await page.locator('[data-act="doAssign"][data-staff="park"]').click()
        check('4' in await page.locator('.outlook .big b').inner_text(), tag + ' outlook shows 4 after reassignment')
    for day in range(5):
        await act(page, 'advance')
        if day == 0: await shot(page, tag + '-06-report')
        await act(page, 'closeModal')
    check(await scene(page) == 'weekend', tag + ' weekend'); await shot(page, tag + '-07-weekend')
    await act(page, 'beginPrep')
    check(await scene(page) == 'prep', tag + ' prep')
    # 새로고침 뒤 이어하기: 같은 장면으로 돌아와야 한다.
    await page.reload(); check(await scene(page) == 'title', tag + ' reload shows title')
    await act(page, 'resume'); check(await scene(page) == 'prep', tag + ' resume restores prep')
    await page.locator('[data-act="consult"]').nth(1).click()
    while await page.locator('[data-act="investigate"]:not([disabled])').count():
        await page.locator('[data-act="investigate"][data-id="INV_SIG_SEQUENCE"]:not([disabled]), [data-act="investigate"][data-id="INV_SIG_MEDICAL"]:not([disabled]), [data-act="investigate"][data-id="INV_SIG_LAYOUT"]:not([disabled]), [data-act="investigate"]:not([disabled])').first.click()
    while await page.locator('[data-act="file"][data-status="filed"]:not([disabled])').count():
        await page.locator('[data-act="file"][data-status="filed"]:not([disabled])').first.click()
    await shot(page, tag + '-08-prep'); await no_overflow(page, tag + ' prep')
    # 용어 설명: 열고, 설명 안의 용어를 다시 연다(중첩).
    if width > 700:
        await page.locator('.term[data-term="합의"]').first.click()
        check(await page.locator('.pop').count() == 1, tag + ' glossary opens')
        inner = page.locator('.pop .term')
        if await inner.count():
            await inner.first.click(); check(await page.locator('.pop').count() == 2, tag + ' glossary nests')
        await shot(page, tag + '-09-glossary'); await page.keyboard.press('Escape')
        check(await page.locator('.pop').count() == 0, tag + ' glossary closes on Escape')
    await act(page, 'finishPrep')
    check(await scene(page) == 'court', tag + ' court (opening)')
    await page.locator('[data-act="pickOpen"][data-id="F_SIG_CAUSE"]').click(); await page.locator('[data-act="pickOpen"][data-id="S_SIG_RESERVE"]').click()
    await shot(page, tag + '-10-opening'); await act(page, 'open')
    for row in await page.locator('.row-evi').all():
        text = await row.inner_text()
        await row.locator('[data-v="%s"]' % ('disagree' if '조서' in text or '보고서' in text else 'agree')).click()
    await shot(page, tag + '-11-evidence'); await act(page, 'opinions')
    shots = set()
    for _ in range(120):
        if await scene(page) != 'court': break
        if await page.locator('[data-act="object"]').count():
            if 'obj' not in shots: shots.add('obj'); await shot(page, tag + '-12-objection')
            await page.locator('[data-act="object"][data-v="%s"]' % ('1' if _ % 2 == 0 and improve else '0')).click(); continue
        if await page.locator('[data-act="rebut"]').count():
            await page.locator('[data-act="rebut"][data-v="1"]').click(); continue
        if await page.locator('[data-act="approach"]').count():
            if 'cross' not in shots: shots.add('cross'); await shot(page, tag + '-13-cross'); await no_overflow(page, tag + ' cross')
            ok = page.locator('[data-act="approach"]:not([disabled])')
            if await ok.count(): await ok.first.click(); continue
            lim = page.locator('.press.limited:not([disabled])')
            if await lim.count(): await lim.first.click(); continue
            await act(page, 'endCross'); continue
        if await page.locator('[data-act="closing"]').count():
            await shot(page, tag + '-14-closing'); await page.locator('[data-act="closing"]').nth(1).click(); continue
        if await page.locator('[data-act="verdict"]').count(): await act(page, 'verdict'); continue
        await act(page, 'continue')
    check(await scene(page) == 'result', tag + ' result reached')
    await page.wait_for_timeout(1300); await shot(page, tag + '-15-result'); await no_overflow(page, tag + ' result')
    if SHOTS: await page.screenshot(path=str(SHOTS / (tag + '-16-result-full.png')), full_page=True)
    headline = await page.locator('.verdict h1').inner_text()
    await act(page, 'records'); check(await page.locator('.modal .rec').count() > 10, tag + ' full record opens'); await act(page, 'closeModal')
    await act(page, 'retry'); check(await scene(page) == 'weekend', tag + ' retry returns to prosecutor choice')
    check(not errors, tag + ' console errors: ' + '; '.join(errors[:3]))
    return headline

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('FIRM_CHROMIUM', '/usr/bin/google-chrome'), args=['--no-sandbox', '--allow-file-access-from-files'])
        results = {}
        for tag, w, h, improve in [('desk', 1440, 900, True), ('default', 1366, 768, False), ('phone', 390, 844, True)]:
            ctx = await browser.new_context(viewport={'width': w, 'height': h})
            results[tag] = await play(await ctx.new_page(), tag, w, improve)
            await ctx.close()
        await browser.close()
    print('outcomes:', results)
    print('browser checks: %d, failures: %d' % (checks, fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
