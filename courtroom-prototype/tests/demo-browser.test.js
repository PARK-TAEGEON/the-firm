'use strict';
// DEMO-001 — browser completion runs at 1440 and 390 width (HTTP and file://): no horizontal overflow, no numeric odds, outcome + review shown.
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
PLANS.veteran_passed = { ...PLANS.veteran_dismissal, object: [VALID[1]], expect: '유죄', sentence: true };
PLANS.novice_reinterview = { ...PLANS.novice_assault, prep: ['INV_SIG_CLIENT'], stance: 'S_SIG_DENY', inv: [], expect: '유죄', sentence: true };
PLANS.veteran_unused = { ...PLANS.veteran_dismissal, rebut: false, expect: '유죄', sentence: true };
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

async function run() {
  const out = path.join(__dirname, 'artifacts'); fs.mkdirSync(out, { recursive: true });
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const httpUrl = 'http://127.0.0.1:' + server.address().port + '/demo.html';
  const fileUrl = pathToFileURL(path.join(__dirname, '..', 'demo.html')).href;
  const browser = await launch();
  let checks = 0; const check = (cond, msg) => { assert.ok(cond, msg); checks++; };
  try {
    for (const transport of ['http','file']) for (const [vpName, vp] of Object.entries(VIEWPORTS)) for (const [pName, plan] of Object.entries(PLANS)) {
      const tag = transport + '/' + vpName + '/' + pName;
      const prosecutorName = plan.prosecutor === 'novice' ? '윤가람' : '최형석';
      const page = await browser.newPage({ viewport: vp }); page.setDefaultTimeout(4000);
      const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.addInitScript(() => {
        Object.defineProperty(window, 'FirmDemoSession', { configurable: true, set(api) {
          const create = api.createDemoSession;
          api.createDemoSession = opts => {
            const session = create(opts);
            window.demoSnapshot = () => { const v = session.projection(); return JSON.stringify({ records: v.records, trial: v.trial && v.trial.records, outcome: v.outcome }); };
            return session;
          };
          Object.defineProperty(window, 'FirmDemoSession', { value: api, configurable: true });
        } });
      });
      await page.goto(transport === 'http' ? httpUrl : fileUrl);
      if (transport === 'http') { const response=await page.request.get(httpUrl.replace('demo.html','assets/portraits/default.svg')); check(response.headers()['content-type']==='image/svg+xml','SVG MIME'); }
      const noOverflow = async label => check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${tag}: no horizontal overflow at ${label}`);
      const noNumbers = async label => { const t = await page.textContent('#app'); check(!/\d+\s*%|승률|점수|확률/.test(t), `${tag}: no numeric odds at ${label}`); };

      // start screen: signature + daily files, prosecutor choice
      check(await page.isVisible('text=사건 파일'), 'start screen');
      check((await page.$$('.file-card.daily')).length === 2, 'two daily summaries');
      check(await page.isChecked('input[value=novice]') && !(await page.isDisabled('[data-action=start]')), 'novice selected by default');
      await page.click('.file-card.daily >> nth=0');
      check((await page.textContent('.daily-open')).includes('전망'), 'daily summary shows forecast in words');
      await noOverflow('daily');
      check((await page.textContent('.file-card.daily >> nth=0')).includes('닫기'), 'daily toggle label');
      await page.click('.file-card.daily >> nth=0');
      check(!(await page.$('.daily-open')), 'same daily button closes summary');
      check((await page.textContent('#stage')).includes('노련한 공판검사 = 어려움 모드, 첫 판은 신참 권장'), 'difficulty guidance');
      check((await page.textContent(`label:has(input[value=${plan.prosecutor}])`)).includes(prosecutorName), 'named prosecutor choice');
      await page.click(`label:has(input[value=${plan.prosecutor}])`);
      await noOverflow('start');
      if (pName === 'novice_acquittal') await page.screenshot({ animations: 'disabled',path:path.join(out, 'ui1-after-' + vpName + '-select.png'), fullPage:true});
      await page.click('[data-action=start]');

      check((await page.textContent('#consultation')).includes('사무실 회의실'), 'location fallback label');
      check((await page.textContent('#consultation')).includes('정민호'), 'named client in consultation');
      check((await page.textContent('#caseTitle')).includes('작업실 정산 다툼 상해 사건 · 상대 ' + prosecutorName + ' 검사'), 'header omits repeated charge and prosecutor role');
      await page.waitForFunction(() => [...document.querySelectorAll('#consultation img')].every(i => i.complete && i.naturalWidth > 0));
      check(await page.locator('.scene-photo, .scene-portrait img').count() === 2, 'location photo and default portrait loaded');
      check(await page.locator('.scene-portrait').textContent() === '정', 'surname initial fallback');
      check(await page.evaluate(() => {
        const dialog = document.querySelector('#consultation').getBoundingClientRect();
        const header = document.querySelector('.scene-layout header').getBoundingClientRect();
        const dock = document.querySelector('.scene-dock').getBoundingClientRect();
        return header.top - dialog.top <= 30 && dock.top >= header.bottom && dialog.bottom - dock.bottom <= 30;
      }), 'photo consultation docks dialogue at bottom');
      check(await page.evaluate(() => document.activeElement.dataset.scene === 'next'), 'continue button initially focused');
      const startRecord = await page.evaluate(() => window.demoSnapshot());
      await page.keyboard.press('Escape'); await page.mouse.click(1, 1);
      check(await page.isVisible('#consultation'), 'consultation cannot dismiss by Escape or backdrop');
      check(await page.locator('[data-scene=finish]').count() === 0, 'case file gated until dialogue completed');
      await noOverflow('consultation');
      if (pName === 'novice_acquittal') await page.screenshot({ animations: 'disabled', path: path.join(out, 'art-' + vpName + '-consultation' + '.png') });
      if (pName === 'novice_acquittal') {
        const seenLines = [await page.textContent('.scene-speech')];
        for (let i = 0; i < 7; i++) {
          if (i % 2) await page.click('[data-scene=next]'); else await page.keyboard.press('Enter');
          seenLines.push(await page.textContent('.scene-speech'));
          await noOverflow('consultation line ' + (i + 2));
        }
        check(seenLines.join(' ').includes('오태윤') && seenLines.join(' ').includes('계약'), 'consultation names co-operator and contract stakes');
        check(await page.locator('[data-scene=next]').count() === 0, 'last line replaces continue with final tasks');
        check(new Set(seenLines).size === 8, 'click/Enter advances exactly eight lines');
        check(seenLines.some(l => l.includes('몸은 건드리지 않았어요')), 'initial denial preserves reinterview reveal');
      } else {
        await page.click('[data-scene=all]');
        check(await page.locator('.scene-transcript li').count() === 8, 'full dialogue disclosure');
        check((await page.textContent('.scene-transcript')).includes('오태윤') && (await page.textContent('.scene-transcript')).includes('계약'), 'full consultation includes personal circumstances');
        check((await page.textContent('.scene-transcript')).includes('몸은 건드리지 않았어요'), 'full view preserves initial denial');
      }
      check(await page.locator('.scene-tasks li').count() === 2, 'two final tasks');
      await noOverflow('consultation final');
      await page.click('[data-scene=finish]');
      check(await page.evaluate(() => document.activeElement.id === 'phaseTitle'), 'consultation closes to phase title focus');
      check(!(await page.$('dialog[open]')), 'consultation enters case file');
      check(await page.evaluate(() => window.demoSnapshot()) === startRecord, 'consultation does not mutate records');
      await page.click('[data-action=memo]');
      check((await page.textContent('#reader')).includes('정민호 · 38세'), 'named reference memo retained');
      check((await page.textContent('#reader')).includes('무죄만이 좋은 결과는 아닙니다.'), 'memo reference content retained');
      await page.keyboard.press('Escape');
      check(await page.evaluate(() => document.activeElement.dataset.action === 'memo'), 'memo restores focus');
      check(await page.evaluate(() => window.demoSnapshot()) === startRecord, 'memo does not mutate records');
      const panel = async id => { if (vpName === 'mobile') await page.click('[data-action=panel][data-id=' + id + ']'); };
      await panel('filePanel');
      check(await page.isVisible('#filePanel'), 'file tab accessible');
      if (vpName === 'mobile') check(!(await page.isVisible('#courtPanel')) && !(await page.isVisible('#memoPanel')), 'one mobile panel visible');
      await page.click('[data-action=exhibit] >> nth=0');
      check((await page.textContent('#reader .document-body')).includes('팔을 뻗는'), 'prosecution statement available before investigation');
      check(await page.locator('.exhibit.sealed').count() === 0, 'all four exhibits initially readable');
      if (pName==='novice_acquittal') await page.screenshot({animations:'disabled',path:path.join(out,'cleanup-'+transport+'-'+vpName+'-document.png'),fullPage:true});
      await page.keyboard.press('Escape');
      await panel('courtPanel');

      // prep + settlement
      check(await page.isVisible('text=공판 준비'), 'prep');
      check(!(await page.isVisible('#memoPanel')) && await page.locator('[data-action=panel][data-id=memoPanel]').count() === 0, 'prep hides memo panel and tab');
      check(!(await page.isVisible('.settle-body')), 'settlement starts collapsed');
      if (pName === 'novice_acquittal') await page.screenshot({ animations: 'disabled',path:path.join(out, 'ui1-after-' + vpName + '-prep.png'), fullPage:true});
      await page.locator('.settle > summary').click();
      check(await page.isVisible('.settle-body'), 'settlement expands');
      await noOverflow('expanded settlement');
      if (pName === 'novice_acquittal') await page.screenshot({ animations: 'disabled',path:path.join(out, 'ui1-after-' + vpName + '-settlement.png'), fullPage:true});
      check((await page.textContent('.settle')).includes('오태윤') && (await page.textContent('.victim-situation')).includes('3주째'), 'victim settlement circumstances');
      check((await page.$$('[data-action=investigate]')).length === 5, 'five investigations (settlement consult is separate)');
      for (const id of plan.prep) {
        await page.click('[data-action=investigate][data-id=' + id + ']');
        check(await page.isVisible('#reader'), 'investigation result scene');
        await noOverflow('investigation result');
        if (pName === 'novice_acquittal') await page.screenshot({ animations:'disabled', path:path.join(out,'cleanup-' + transport + '-' + vpName + '-investigation.png'),fullPage:true });
        const filing = page.locator('[data-action=fileEvidence][data-status=filed]');
        if (await filing.count() && id !== 'INV_SIG_LAYOUT') { check(await page.locator('#reader [data-action=closeReader]').count()===0,'no extra investigation close button'); await filing.click(); check(!(await page.locator('#reader[open]').count()),'filing closes result immediately'); }
        else await page.keyboard.press('Escape');
      }
      await panel('filePanel');
      check(!(await page.isVisible('.card p >> nth=0')), 'cards start collapsed');
      const cardKey = await page.getAttribute('.card >> nth=0', 'data-disclosure');
      await page.locator('.card summary').first().focus(); await page.keyboard.press('Enter');
      check(await page.isVisible('.card p >> nth=0'), 'card opens with keyboard');
      const revealed = page.locator('.exhibit:not(.sealed)').first();
      if (await revealed.count()) {
        const unchanged = await page.evaluate(() => window.demoSnapshot());
        await revealed.focus(); await page.keyboard.press('Enter');
        check(await page.isVisible('#reader .document-body'), 'document opens with keyboard');
        await noOverflow('document');
        await page.keyboard.press('Tab');
        check(await page.evaluate(() => !!document.activeElement.closest('#reader')), 'modal traps keyboard focus');
        await page.keyboard.press('Escape');
        check(await page.evaluate(() => document.activeElement.dataset.action === 'exhibit'), 'document restores focus');
        await revealed.click(); await page.mouse.click(2, 2);
        check(!(await page.$('dialog[open]')), 'outside click closes document');
        check(await page.evaluate(() => window.demoSnapshot()) === unchanged, 'document/card UI leaves records unchanged');
      }
      await noOverflow('materials');
      await panel('courtPanel');
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
      if (vpName === 'mobile') {
        check(await page.locator('[data-action=panel][data-id=memoPanel]').count() === 1, 'opening restores memo tab');
        await panel('memoPanel');
      }
      check(await page.isVisible('#memoPanel'), 'opening restores memo panel');
      check(!(await page.isVisible('.memo-foot')), 'memo legend starts collapsed');
      await page.locator('[data-disclosure=memo-legend] > summary').click();
      check(await page.isVisible('.memo-foot'), 'memo legend expands');
      await page.locator('[data-disclosure=memo-legend] > summary').click();
      if (vpName === 'mobile') await panel('courtPanel');
      if (pName === 'novice_acquittal') await page.screenshot({ animations: 'disabled',path:path.join(out, 'ui1-after-' + vpName + '-opening.png'), fullPage:true});

      check(await page.getAttribute('[data-disclosure="' + cardKey + '"]', 'open') !== null, 'card expansion survives progress');
      check(!(await page.$('dialog[open]')), 'briefing is not repeated on progress');
      // opening
      await page.click(`label:has(input[value=${plan.focus}])`);
      await page.click(`label:has(input[value=${plan.stance}])`);
      await noOverflow('opening');
      await page.click('[data-action=open]');
      check(await page.isVisible('[data-action=evidenceOpinions]'), 'evidence opinion stage');
      check(!/제318조|unverified|열람하지 않은|미열람/.test(await page.textContent('#stage')), 'no legal metadata or unread warning in opinions');
      check(await page.locator('.evidence-opinion [data-action=exhibit]').count()===4,'all four opinion documents readable');
      check(await page.isDisabled('[data-action=evidenceOpinions]'), 'all four opinions required');
      await noOverflow('evidence opinions');
      if (pName === 'novice_acquittal') await page.screenshot({animations:'disabled',path:path.join(out,'cleanup-' + transport + '-' + vpName + '-evidence.png'),fullPage:true});
      for (const [id, value] of Object.entries({PX_SIG_STATEMENT:'disagree',PX_SIG_REPORT:'disagree',PX_SIG_MEDICAL:'agree',PX_SIG_VIDEO:'agree'})) {
        await page.locator('input[name="opinion:' + id + '"][value=' + value + ']').check();
      }
      await page.click('[data-action=evidenceOpinions]');
      if (plan.prep.includes('INV_SIG_LAYOUT')) {
        await panel('filePanel');
        const card=page.locator('[data-disclosure="card:CARD_SIG_LAYOUT"]');
        if (!(await card.getAttribute('open'))) await card.locator('summary').click();
        await card.locator('[data-action=filing]').click();
        await page.click('[data-action=fileEvidence][data-status=filed]');
        await panel('courtPanel');
      }

      // trial
      const queues = { '목격자': [...plan.obs], '담당 수사관': [...plan.inv] }; let guard = 0, sawCross = 0;
      while (guard++ < 150) {
        if (await page.$('[data-action=closingArgument]')) {
          await noOverflow('closing argument');
          check((await page.textContent('#stage')).includes('재판부에 마지막으로 할 말을 고르세요.') && !(await page.textContent('#stage')).includes('판정에 영향'), 'closing guidance is in-world');
          if (pName === 'novice_acquittal') await page.screenshot({animations:'disabled',path:path.join(out,'cleanup-' + transport + '-' + vpName + '-closing.png'),fullPage:true});
          await page.click('[data-action=closingArgument][data-id=FINAL_SIG_CAUSE]'); continue;
        }
        if (await page.$('[data-action=verdict]')) { await noOverflow('closing'); if(pName==='novice_acquittal') await page.screenshot({animations:'disabled',path:path.join(out,'procedure-' + vpName + '-sentencing-date.png'),fullPage:true}); await page.click('[data-action=verdict]'); break; }
        if (await page.$('[data-action=object]')) {
          const txt = await page.textContent('.dialogue');
          const stepId = txt.includes('넘어뜨린 동작이었지요') ? VALID[0] : txt.includes('그 밀침 때문에 다친 것이지요') ? VALID[1] : 'INVALID';
          await page.click(plan.object.includes(stepId) ? '[data-action=object]' : '[data-action=pass]');
          continue;
        }
        if (await page.$('[data-action=rebut]')) { await page.click(plan.rebut === false ? '[data-action=skipRebut]' : '[data-action=rebut]'); continue; }
        if (await page.$('[data-action=endCross]')) {
          sawCross++;
          await page.waitForFunction(() => [...document.querySelectorAll('.face img')].length === 3 && [...document.querySelectorAll('.face img')].every(i => i.complete && i.naturalWidth > 0));
          check(await page.locator('.face img').count() === 3, 'three court silhouettes load');
          const witnessLabel = await page.textContent('#bar .bar-head .label');
          const witnessName = witnessLabel.includes('서동국') ? '서동국' : '한지수';
          check((await page.textContent('.bench')).includes(witnessName) && (await page.textContent('.bench')).includes(prosecutorName), 'named witness and prosecutor on court');
          check(await page.locator('[data-side=W] .face').textContent() === witnessName[0], 'witness surname portrait');
          check(await page.locator('[data-side=PROSECUTOR] .face').textContent() === prosecutorName[0], 'prosecutor surname portrait');
          if (sawCross === 1) {
            if (pName === 'novice_acquittal') await page.screenshot({ animations: 'disabled',path:path.join(out, 'art-' + vpName + '-court.png'), fullPage:true});
            await panel('filePanel'); await noOverflow('cross materials');
            const usable = await page.locator('.card.usable').count();
            if (pName === 'novice_acquittal') check(usable === 2, 'currently available cards highlighted');
            await panel('memoPanel');
            check(!(await page.isVisible('.notes >> nth=0')), 'memo evidence starts collapsed');
            await page.locator('.issue summary').first().click();
            check(await page.isVisible('.notes >> nth=0'), 'memo evidence expands');
            await noOverflow('memo'); await panel('courtPanel');
            await page.locator('.transcript summary').click();
            check(await page.isVisible('.transcript ol'), 'prior records expand');
          }
          await noOverflow('cross'); await noNumbers('cross');
          const label = await page.textContent('#bar .bar-head .label');
          const q = queues[label.includes('서동국') ? '담당 수사관' : '목격자'];
          const step = q.shift();
          if (!step) { await page.click('[data-action=endCross]'); continue; }
          const [kind, id] = step.split(':');
          check(!(await page.isDisabled(`[data-action=${kind}][data-id=${id}]`)), `${tag}: ${id} available`);
          await page.click(`[data-action=${kind}][data-id=${id}]`);
          continue;
        }
        if (await page.$('[data-action=continue]')) {
          const phaseTitle=await page.locator('#phaseTitle').count() ? await page.textContent('#phaseTitle') : '';
          if (['구형','최후진술'].includes(phaseTitle)) {
            await noOverflow(phaseTitle);
            if(pName==='novice_acquittal')await page.screenshot({animations:'disabled',path:path.join(out,'procedure-' + vpName + '-' + (phaseTitle==='구형'?'request':'statement') + '.png'),fullPage:true});
          }
          await page.click('[data-action=continue]'); continue; }
        break;
      }
      check(sawCross >= 2, `${tag}: cross-examination shown`);
      await page.waitForSelector('#verdictTitle');
      check((await page.textContent('#verdictTitle')).includes(plan.expect), `${tag}: outcome ${plan.expect}`);
      check(await page.evaluate(() => document.activeElement && document.activeElement.id === 'verdictTitle'), 'focus moves to outcome');
      await page.screenshot({ animations: 'disabled', path: path.join(out, 'demo-compact-' + vpName + '-' + pName + '.png'), fullPage: true });
      check((await page.locator('.outcome-core > li').count()) === 3, 'three core result lines');
      check(!(await page.isVisible('.review')), 'review details start collapsed');
      check(await page.getAttribute('.transcript', 'open') !== null, 'history expansion survives progress');
      await page.locator('[data-disclosure=review] > summary').click();
      await page.locator('[data-disclosure=outcome-reasons] > summary').click();
      const review = await page.textContent('.review');
      check(['당신이 뚫은 것', '상대가 막은 것', '역효과', '놓친 준비', '통과시킨 이의'].every(x => review.includes(x)), `${tag}: review sections`);
      check((await page.textContent('.next')).length > 20, `${tag}: next-try line`);
      const sentence = await page.$('.sentence');
      check(!!sentence === plan.sentence, `${tag}: sentence shown only on conviction`);
      if (plan.sentence) check((await sentence.textContent()).includes('실험용 단순화 — 실제 양형기준 아님'), `${tag}: sentencing disclaimer`);
      if (pName === 'veteran_injury') check((await page.textContent('.why')).includes('다툼 있음'), `${tag}: shaken-band conviction explained`);
      check((await page.textContent('.pronouncement')).includes('주문.'), 'judge reads order');
      check((await page.textContent('.outcome .kicker')).includes('선고 · 상대:'), 'prosecutor is opponent');
      if (pName === 'novice_acquittal' || pName === 'veteran_dismissal') check((await page.textContent('.miss')).includes('놓친 준비 없음'), 'successful outcome has no irrelevant missed preparation');
      if (pName === 'veteran_passed') check((await page.textContent('.passed')).includes('목격자에게 보지 않은 낙상'), 'passed objection explains injury outcome');
      if (pName === 'novice_reinterview') check(!review.includes('다시 만났다면') && review.includes('의뢰인의 밀침 인정과 다른'), 'reinterview is acknowledged');
      if (pName === 'veteran_unused') check((await page.textContent('.miss')).includes('동선을 제시하지'), 'natural card particle');
      check((await page.textContent('.client-stakes')).includes(plan.sentence ? '조항이 걱정' : '계약을 유지'), 'outcome client stakes');
      const history = await page.textContent('.transcript');
      check(['한지수', '서동국', prosecutorName].every(n => history.includes(n)), 'both witnesses and prosecutor named in transcript');
      check(history.includes('검사 측 증인, 증인석으로 나와 주십시오.') && history.includes('주문.'), 'corrected transcript');
      check(!/개회사|현장 조사관|의견 유도|을\(를\)/.test(await page.textContent('#app')), 'old terminology absent');
      await noOverflow('outcome'); await noNumbers('outcome');
      await page.screenshot({ animations: 'disabled', path: path.join(out, `demo-${vpName}-${pName}.png`), fullPage: true });

      await page.click('[data-action=reset]');
      check(await page.isVisible('text=사건 파일'), 'reset returns to case files');
      check(await page.isChecked('input[value=novice]'), 'new selection defaults to novice');
      await page.evaluate(() => { window.FirmDemoPortraits.pool.push({ image: 'unused-pool-image.png', tags: ['client'] }); });
      await page.click('[data-action=start]');
      check(await page.isVisible('#consultation'), 'new game shows consultation again');
      check((await page.textContent('.scene-controls')).includes('1 / 8'), 'new consultation resets line');
      check(await page.locator('.scene-portrait img').getAttribute('src') === 'assets/portraits/default.svg', 'reserved pool does not override default portrait');
      if (pName === 'novice_acquittal') {
        await page.evaluate(() => {
          const image = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          window.FirmDemoLocations[0].image = image;
          window.FirmDemoPortraits.byId.CLIENT_SIG_CONTACT = image;
        });
        // The next speaker has no mapping: explicit ID lookup must not spill over.
        await page.keyboard.press('Enter');
        check(await page.locator('.scene-photo').count() === 1, 'optional location image used');
        check(await page.locator('.scene-portrait img').getAttribute('src') === 'assets/portraits/default.svg', 'unmapped speaker uses default silhouette');
        await page.keyboard.press('Enter');
        check(await page.locator('.scene-portrait img').count() === 1, 'portrait selected by person ID');
        check(await page.locator('.scene-shade').evaluate(el => getComputedStyle(el).backgroundColor.includes('0.58')), 'location photo dark overlay');
      }
      await page.click('[data-scene=all]'); await page.click('[data-scene=finish]');
      await page.click('[data-action=investigate][data-id=' + plan.prep[0] + ']');
      await page.keyboard.press('Escape');
      check(await page.locator('details[open]').count() === 0, 'new game resets all disclosure states');
      if (vpName === 'mobile') check(await page.isVisible('#courtPanel') && !(await page.isVisible('#filePanel')), 'new game resets mobile tab');
      check(!errors.length, `${tag}: no page errors ${errors.join(';')}`);
      await page.close();
    }
    console.log(`Demo browser: ${checks} checks, 0 failures, exit 0`);
    return checks;
  } finally { await browser.close(); server.close(); }
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e); process.exitCode = 1; });
