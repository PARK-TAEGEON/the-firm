#!/usr/bin/env python3
"""브라우저에서 한 판을 처음부터 끝까지 자동으로 플레이한다(file:// 로 직접 연다).
사용: python3 tests/browser_play.py [--shots DIR]   · 환경변수 FIRM_CHROMIUM 으로 실행 파일 지정 가능.
검사: 장면 전환, 계획서 수정·날인, 자동 공판과 개입, 콘솔 오류 0, 가로 넘침 없음(1440·1366·390), 새로고침 뒤 이어하기, 용어 설명 중첩."""
import asyncio, os, sys, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
URL = (ROOT / 'index.html').as_uri() + '?seed=2'  # 확률 판정을 고정해 같은 판을 재현한다
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
    check(await page.locator('.msg.sel.must').count() == 1, tag + ' must-respond message opens first')
    check(await page.locator('.strip .cell').count() == 5, tag + ' summary strip has 5 cells')
    check(await page.locator('.wk .wk-p').count() == 4, tag + ' week grid has 4 people')
    if tag == 'desk':
        await act(page, 'theme'); await shot(page, tag + '-04b-office-cool'); await act(page, 'theme')
    await act(page, 'decline')
    check(await page.locator('[data-act="advance"]').is_enabled(), tag + ' advance enabled after intake decided')
    if improve:
        await page.locator('[data-act="assign"][data-id="jung-organize"]').click()
        await shot(page, tag + '-05-assign')
        await page.locator('[data-act="doAssign"][data-staff="park"]').click()
        check('3' in await page.locator('.strip [data-cell="budget"] b').inner_text(), tag + ' strip shows 3 checks after reassignment')
    for day in range(5):
        await act(page, 'advance')
        if day == 0:
            check('업무 보고' in await page.locator('.msg.sel').inner_text(), tag + ' new report lands in the inbox')
            await shot(page, tag + '-06-report')
    check(await scene(page) == 'weekend', tag + ' weekend'); await shot(page, tag + '-07-weekend')
    await act(page, 'beginPlan')
    check(await scene(page) == 'plan', tag + ' plan board')
    await page.wait_for_timeout(300); await shot(page, tag + '-08-plan'); await no_overflow(page, tag + ' plan')
    # 새로고침 뒤 이어하기: 같은 장면으로 돌아와야 한다.
    await page.reload(); check(await scene(page) == 'title', tag + ' reload shows title')
    await act(page, 'resume'); check(await scene(page) == 'plan', tag + ' resume restores plan')
    if improve:
        # 펜으로 고친다: 목격자 최초 진술을 빼고 합의 상담을 넣고, 문구를 고치는 조건을 붙인다.
        check(await page.locator('[data-act="toggleCheck"]').count() == 0, tag + ' delegated rows are read-only')
        await page.locator('[data-act="control"][data-f="checks"]').click()
        await page.locator('[data-act="toggleCheck"][data-id="INV_SIG_STATEMENT"]').click()
        await page.locator('[data-act="toggleCheck"][data-id="INV_SIG_SETTLE"]').click()
        check(await page.locator('[data-act="setStance"], .prow .wits').count() == 0, tag + ' stance/focus/witness rows folded by default')
        check(await page.locator('.odds li').count() == 3, tag + ' plan shows 3 roll chances')
        await act(page, 'planMore')
        check(await page.locator('.pmore.open .prow').count() >= 4, tag + ' details unfold')
        await page.locator('[data-act="control"][data-f="advice"]').click()
        await page.locator('[data-act="advice"][data-id="ADV_SIG_REVISE"]').click()
        await act(page, 'undoPlan')
        check(await page.locator('.wchip.on[data-id="ADV_SIG_REVISE"]').count() == 0, tag + ' undo reverts the last edit')
        await page.locator('[data-act="advice"][data-id="ADV_SIG_REVISE"]').click()
        check(await page.locator('.wchip.mine').count() >= 1, tag + ' player edit shown in pen')
        await shot(page, tag + '-09-plan-edited')
        if tag == 'desk':
            await act(page, 'theme'); await shot(page, tag + '-09c-plan-cool'); await act(page, 'theme')
        await act(page, 'lawyers'); check(await page.locator('.lp').count() == 3, tag + ' lawyer compare opens')
        await shot(page, tag + '-10-lawyers'); await act(page, 'closeModal')
    if width > 700:
        # 단어만 보이고, 올리면 자세한 설명이 뜬다.
        await page.locator('.lawyer-card .stat-i').first.hover(); await page.wait_for_timeout(350)
        check(await page.locator('.tip').count() == 1, tag + ' tooltip on hover')
        await shot(page, tag + '-09b-tip')
        await page.mouse.move(2, 2); await page.wait_for_timeout(300)
        check(await page.locator('.tip').count() == 0, tag + ' tooltip hides on leave')
        visible = await page.evaluate("document.querySelector('main').innerText.length")
        check(visible < 700, tag + ' plan screen text is short (%d chars)' % visible)
    await act(page, 'seal')
    check(await scene(page) == 'court', tag + ' court (auto)')
    await page.locator('[data-act="speed"][data-v="fast"]').click()
    await page.wait_for_timeout(2600); await shot(page, tag + '-11-court-auto'); await no_overflow(page, tag + ' court')
    asks = 0
    for _ in range(40):
        if await page.locator('[data-act="toResult"]').count(): break
        if await page.locator('[data-act="decide"]').count():
            asks += 1
            if asks == 1: await shot(page, tag + '-12-ask')
            await page.locator('[data-act="decide"][data-v="1"]').click(); continue
        if await page.locator('[data-act="skipAhead"]').count():
            await act(page, 'skipAhead'); continue
        await page.wait_for_timeout(300)
    check(asks == 2, tag + ' seed 2: kim misses both leading questions (got %d)' % asks)
    check(await page.locator('.roll').count() >= 4, tag + ' roll stamps appear in the transcript')
    check(await page.locator('[data-act="toResult"]').count() == 1, tag + ' trial plays to the end')
    await act(page, 'toResult')
    check(await scene(page) == 'result', tag + ' result reached')
    await page.wait_for_timeout(1300); await shot(page, tag + '-15-result'); await no_overflow(page, tag + ' result')
    if SHOTS: await page.screenshot(path=str(SHOTS / (tag + '-16-result-full.png')), full_page=True)
    headline = await page.locator('.verdict h1').inner_text()
    await act(page, 'records'); check(await page.locator('.modal .rec').count() > 10, tag + ' full record opens'); await act(page, 'closeModal')
    await act(page, 'retry'); check(await scene(page) == 'plan', tag + ' retry returns to the plan')
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
