'use strict';
const fs = require('node:fs');
const path = require('node:path');
const C = require('./content');
const { automaticCase, runPolicy } = require('./core/automatic');
const out = path.join(__dirname, 'out');
function schedule(d, seed) {
  const targetIssue = d.issues[seed % 2].id, preparation = seed % 5;
  const investigations = d.investigations.filter(i => i.id.startsWith(`INV_${targetIssue}_`))
    .slice(0, Math.min(2, preparation)).map(i => i.id);
  const leads = new Set(d.cards.filter(c => c.rebuttal).map(c => c.id));
  investigations.push(...d.investigations.filter(i => i.grants.some(id => leads.has(id)))
    .slice(0, Math.max(0, preparation - 2)).map(i => i.id));
  return { targetIssue, investigations };
}
function automaticReport(n = 300) {
  const results = [];
  for (const row of Object.values(C.archetypes)) for (const skill of ['novice', 'experienced']) {
    const r = { id: row.id, title: row.title, skill, n, matched: 0, upset: 0, unexplained: 0,
      favorable: 0, contested: 0, adverse: 0, coarseMismatch: 0, discoveryMismatch: 0,
      matrix: Array.from({ length: 3 }, () => [0, 0, 0]) };
    for (let seed = 1; seed <= n; seed++) {
      const d = C.buildContestedCase(row.id, seed), result = automaticCase(d, { ...schedule(d, seed), skill });
      const a = result.audit, bands = ['유리', '다툼', '불리'];
      r.matched += a.matched; r.upset += a.upset; r.unexplained += a.upset && !result.player.discoveries.length;
      r.favorable += a.forecast === '유리'; r.contested += a.forecast === '다툼'; r.adverse += a.forecast === '불리';
      r.coarseMismatch += a.mismatchReason === 'coarse_public_estimate';
      r.discoveryMismatch += a.mismatchReason === 'uninvestigated_discovery';
      r.matrix[bands.indexOf(a.forecast)][bands.indexOf(a.actualBand)]++;
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
function generateReport() {
  fs.mkdirSync(out, { recursive: true });
  const f = path.join(__dirname, 'REPORT.md'), previous = path.join(out, 'REPORT-before-rework.md');
  if (fs.existsSync(f) && !fs.existsSync(previous)) fs.copyFileSync(f, previous);
  const verification = JSON.parse(fs.readFileSync(path.join(out, 'verification.json'), 'utf8'));
  const results = automaticReport();
  fs.writeFileSync(path.join(out, 'automatic-results.json'), JSON.stringify(results, null, 2) + '\n');
  const lines = ['# GEN-002 1단계 재작업 REPORT', '', '2026-10-06 · Lane: experiment · 커밋·병합 없음 · 사람 플레이테스트 대기', '',
    '## 검증', '', '| 실행 | checks | failures | exit code |', '|---|---:|---:|---:|',
    ...verification.map(r => `| ${r.command} | ${r.checks} | ${r.failures} | ${r.exitCode} |`), '',
    '재실행: courtroom-prototype에서 `node generator/verify.js`, 이어서 `node generator/report-gen002.js`. 로그와 집계는 generator/out/에 저장한다.', '',
    '## 숫자 게이트', '', '기존 시드·판정 강도·준비 예산·효과·반전 조건은 변경하지 않았다. 원형 10개 각각 300시드의 네 게이트를 동일한 balance.js로 검사했다.', '',
    '```text', fs.readFileSync(path.join(out, 'balance-test-results.log'), 'utf8').trim(), '```', '',
    '## 요청별 자체 점검', '',
    '1. 충족: 새 원형 8개에 의뢰인 8명·증인 16명, 직업·말투·주신문·반박·저항·압박·과욕·이의·판결문을 별도로 집필했다. 장소·날짜·시각·금액·관계는 별도 결정적 스트림에서 생성해 브리핑·진술·카드·선고문에 쓴다. 기존 폭행·음주운전은 반복 단답만 제거하고 사건과 수치는 보존했다.',
    '2. 충족: 화면에 들어갈 authored 문자열을 대안 분기까지 검사한다. 코드·링크·마크다운·검토 표시를 주입한 음성 테스트가 누출을 검출한다. 설계 문서 문구를 화면에 그대로 쓰지 않는다.',
    '3. 충족: 변호인 재반대는 구체적 기록에 대한 주장이다. 증언을 문장 단위로 정규화하여 원형 안에서 같은 문장이 두 번 나오면 실패한다. 원고의 응답과 실제 서비스 경로를 검사한다.',
    '4. 충족: forecast.js는 import나 재판 실행 없이 공개 카드 본문·조사 완료·선택 쟁점·정책·화면의 언어 밴드만 쓴다. 준비 화면에 숨겨진 초기 강도는 제외한다. 아래 표는 기존 2종 포함 10개다.',
    '5. 충족: ko.json에 10개 원형의 반의사불벌·친고죄·합의 효과·예외·실행 여부를 구조화했다. 폭행치상/단순폭행, 명예훼손/모욕을 구별한다. 합의금 문구 조건은 팩 데이터다. 사건별 적용은 미검증이므로 절차 종결·양형 실행은 하지 않는다.',
    '6. 충족: 아래 10개 원형 각각 3시드, 실제 서비스 공판 전문 30건과 미선택 대안을 출력했다.', '',
    '## 새로 정한 실험 규칙', '', '실험용 authored 규칙, DEC 아님. RULES.md 재작업 절 참조. 장면 난수 스트림, 개별 인물/대사, 카드에 보이는 쟁점·용도·발견 표시, 공개 정보의 거친 전망 규칙을 정했다. 판정 수치는 그대로다.', '',
    '## 전망·실제 일치표', '',
    '각 원형×정책 300시드. 무준비 / 기본 하나 / 기본 둘 / 기본 둘+추가 하나 / 기본 둘+추가 둘 일정을 순환하고 쟁점을 교대한다. 기존 2종은 활성 단서만 조사 메뉴에 나오는 기존 동작을 유지한다.',
    '행렬의 행은 전망 유리·다툼·불리, 열은 실제 유리·다툼·불리다. 실제 유리는 무죄, 다툼은 유죄지만 흔들린 쟁점이 남은 경우, 불리는 나머지 유죄다. 전망을 맞추기 위해 실제 기록을 미리 실행하지 않는다.',
    '미조사 자료 동반 불일치는 숨은 사실이 공판에 나온 경우다. 그 사실만이 오차 원인이라는 인과 판정은 아니다. 나머지는 거친 공개 정보 추정의 한계로 따로 집계한다.', '',
    '| 원형 | 정책 | 전망→실제 행렬 | 일치 | 일치율 | 미조사 자료 동반 불일치 | 그 외 추정 오차 | 유리→유죄 중 미조사 자료 등장 |',
    '|---|---|---|---:|---:|---:|---:|---:|',
    ...results.map(r => `| ${r.title} | ${r.skill} | ${r.matrix.map(row => row.join('/')).join(' ; ')} | ${r.matched}/${r.n} | ${(100*r.matched/r.n).toFixed(1)}% | ${r.discoveryMismatch} | ${r.coarseMismatch} | ${r.upset} |`), '',
    '## 한계와 사람 판단', '',
    '- 대사와 사실은 직접 작성한 실험 콘텐츠다. 법률 추론·자동 양형·합의 종결을 구현한 것이 아니다. 사건별 적용법·친족 예외·교통 특례는 미검증 표시를 유지한다.',
    '- 공개 정보 전망은 승소 보증이 아니다. 자료의 준비 정도와 언어 판세에 따른 거친 추정이며 같은 공개 정보에서도 실제 결과는 달라질 수 있다. 오차를 숨은 반전 탓으로 일괄 처리하지 않는다.',
    '- 기존 브라우저 UI에 생성기를 연결하는 다음 단계는 시작하지 않았다. 콘텐츠 API와 기존 공판 서비스 출력까지 검증했다.',
    '- 사람 질문 1: 증인마다 다른 사람으로 느껴지는가?',
    '- 사람 질문 2: 자료를 제시한 뒤 답변이 좁혀지는 흐름이 설득력 있는가?',
    '- 사람 질문 3: 준비 정보 전망과 실제 판결의 차이를 받아들일 수 있는가?', '', sampleReport(), ''];
  fs.writeFileSync(f, lines.join('\n').trimEnd() + '\n');
  console.log(`REPORT: ${results.length} comparison rows, ${results.reduce((s,r)=>s+r.n,0)} cases, 30 full transcripts`);
}
if (require.main === module) generateReport();
module.exports = { sampleReport, automaticReport, schedule };
