'use strict';
const C = require('./content');
const { automaticCase, runPolicy } = require('./core/automatic');
function schedule(d, seed) {
  const targetIssue = d.issues[seed % 2].id, preparation = seed % 5;
  const investigations = d.investigations.filter(i => i.id.startsWith(`INV_${targetIssue}_`))
    .slice(0, Math.min(2, preparation)).map(i => i.id);
  const leads = new Set(d.cards.filter(c => c.rebuttal).map(c => c.id));
  investigations.push(...d.investigations.filter(i => i.grants.some(id => leads.has(id)))
    .slice(0, Math.max(0, preparation - 2)).map(i => i.id));
  return { targetIssue, investigations };
}
// Previous published heuristic, retained only for before/after measurement on identical public inputs.
function previousForecast(input) {
  const issue = input.issues.find(i => i.id === input.targetIssue);
  const cards = input.cards.filter(c => c.issueId === input.targetIssue);
  const basic = new Set(cards.filter(c => c.kind === 'foundation').map(c => c.id)).size;
  const extra = cards.some(c => c.kind === 'response' && c.finding === 'additional');
  if (input.skill === 'novice' && extra) return '불리';
  if (issue.band === '의심') return '유리';
  if (basic === 0) return '불리';
  return basic < 2 || input.skill === 'novice' || issue.band === '입증 유지' ? '다툼' : '유리';
}
function automaticReport(n = 300) {
  const results = [];
  for (const row of Object.values(C.archetypes)) for (const skill of ['novice', 'experienced']) {
    const r = { id: row.id, title: row.title, skill, n, matched: 0, upset: 0, unexplained: 0,
      favorable: 0, contested: 0, adverse: 0, coarseMismatch: 0, discoveryMismatch: 0,
      previousMatched: 0, previousPessimisticAcquittals: 0, pessimisticAcquittals: 0,
      matrix: Array.from({ length: 4 }, () => [0, 0, 0]) };
    for (let seed = 1; seed <= n; seed++) {
      const d = C.buildContestedCase(row.id, seed), result = automaticCase(d, { ...schedule(d, seed), skill });
      const a = result.audit, bands = ['유리', '정석', '변수', '불리'];
      const previous = previousForecast(a.publicInput);
      r.previousMatched += previous === a.actualBand;
      r.previousPessimisticAcquittals += previous !== '유리' && a.outcome === 'not_guilty';
      r.pessimisticAcquittals += a.forecast !== '유리' && a.outcome === 'not_guilty';
      r.matched += a.matched; r.upset += a.upset; r.unexplained += a.upset && !result.player.discoveries.length;
      r.favorable += a.forecast === '유리'; r.contested += ['정석', '변수'].includes(a.forecast); r.adverse += a.forecast === '불리';
      r.coarseMismatch += a.mismatchReason === 'coarse_public_estimate';
      r.discoveryMismatch += a.mismatchReason === 'uninvestigated_discovery';
      r.matrix[bands.indexOf(a.forecast)][['유리', '다툼', '불리'].indexOf(a.actualBand)]++;
    }
    results.push(r);
    if (require.main === module) console.log(`${row.id} ${skill}: ${r.matched}/${n}`);
  }
  return results;
}
function sampleReport() {
  const lines = ['## 사건 전문 — 원형 10개 × 시드 1·2·3', '',
    '실제 서비스 기록이다. 시드 1·3은 두 번째 쟁점, 시드 2는 첫 번째 쟁점에 집중한다. 기본 자료 둘을 우선 조사하고 메뉴 순서의 추가 조사 둘을 예산 안에서 한다. 숙련 정책으로 선고까지 진행하며 이의 창은 통과한다. 미선택 저항·이의·과욕 대사는 사건 뒤에 별도로 싣는다.', ''];
  for (const a of Object.values(C.archetypes)) for (let seed = 1; seed <= 3; seed++) {
    const d = C.buildContestedCase(a.id, seed), options = schedule(d, seed % 2 ? 9 : 4);
    const { prepared, view } = runPolicy(d, options), result = automaticCase(d, options);
    const names = Object.fromEntries([...Object.values(d.roles), ...d.witnesses].map(x => [x.id, x.name]));
    lines.push(`### ${a.title} / 시드 ${seed}`, '', `사건명: ${d.title}`, `의뢰인: ${d.client.name} · ${d.client.role}`, '',
      ...d.briefing.map(t => t + '\n'), ...prepared.clientStatements.map(c => `의뢰인: ${c.text}\n`),
      `전망: ${result.player.forecast}. ${result.player.explanation}`, '', '증인:', ...d.witnesses.map(w => `- ${w.name} · ${w.role}${w.speechStyle ? ' · ' + w.speechStyle : ''}`), '', '확보한 자료:', '');
    for (const c of prepared.cards) lines.push(`자료: ${c.title}`, c.text, '');
    lines.push('공판 기록:', '');
    for (const r of view.records) for (const l of r.lines || []) lines.push(`${names[l.speaker] || l.speaker}: ${l.text}`, '');
    lines.push(`결과: ${view.verdict.text.title} / 판세 ${result.player.resultBand}`, '', '선고 이유:', ...view.verdict.issues.map(i => `- ${i.title}: ${i.memo}`), '',
      '복기:', ...view.review.effective.map(x => `- 확인한 근거: ${x.text}`), ...view.review.missed.map(x => `- 남긴 쟁점: ${x.text}`), '', '선택하지 않은 대안 대사:', '');
    for (const w of d.witnesses) {
      lines.push(`${w.name}에게 자료 없이 추궁:`, '');
      for (const a of w.approaches.filter(a => a.id.endsWith('_UNSUPPORTED'))) for (const [speaker, text] of a.lines) lines.push(`${names[speaker]}: ${text}`, '');
      const obj = w.direct.find(x => x.type === 'objection');
      lines.push('이의를 제기했다면:', '');
      for (const [speaker, text] of (obj.sustained || obj.overruled).lines) lines.push(`${names[speaker]}: ${text}`, '');
      const over = w.presses.find(p => p.kind === 'overreach');
      lines.push(`변호인: ${over.question}`, ...over.fail.lines.map(([speaker, text]) => `${names[speaker]}: ${text}`), '');
    }
  }
  return lines.join('\n');
}
module.exports = { sampleReport, automaticReport, schedule, previousForecast };
if (require.main === module) require('./report-forecast').generateReport();
