'use strict';
const fs = require('node:fs');
const path = require('node:path');
const C = require('./content');
const rows = require('./content/catalog-data.json');
const { automaticCase } = require('./core/automatic');

function sampleReport() {
  const lines = ['## 원형별 사건 샘플 — 시드 1~10', '', '검토용 출력이며 반전은 숨은 정보를 포함한다. 플레이어에게 이 표를 제공하지 않는다.', ''];
  for (const row of rows) {
    lines.push(`### ${row.title}`, '', '| 시드 | 제목 | 쟁점 | 반전 | 증인 첫 대사 |', '|---|---|---|---|---|');
    for (let seed = 1; seed <= 10; seed++) {
      const d = C.buildContestedCase(row.id, seed);
      const discoveries = d.twistsApplied.map(id => C.twists.find(t => t.id === id).truthEffect).join('<br>') || '추가 반전 없음';
      lines.push(`| ${seed} | ${d.title} | ${d.issues.map(i => i.question).join('<br>')} | ${discoveries} | ${d.witnesses.map(w => `${w.role}: ${w.direct[0].lines[1][1]}`).join('<br>')} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function automaticReport(n = 300) {
  const results = [];
  for (const row of rows) for (const skill of ['novice', 'experienced']) {
    const stats = { id: row.id, skill, n, matched: 0, upset: 0, unexplained: 0, favorable: 0, contested: 0, adverse: 0, correctBinary: 0 };
    for (let seed = 1; seed <= n; seed++) {
      const d = C.buildContestedCase(row.id, seed);
      // Same public preparation schedule across archetypes; alternate target without reading truth.
      const targetIssue = d.issues[seed % 2].id;
      const preparation = seed % 5;
      const investigations = d.investigations.filter(i => i.id.startsWith(`INV_${targetIssue}_`))
        .slice(0, Math.min(2, preparation)).map(i => i.id);
      // Five public schedules: none, one basic, two basic, plus one lead, plus two leads.
      investigations.push(...d.investigations.filter(i => i.id.startsWith('INV_TWIST_'))
        .slice(0, Math.max(0, preparation - 2)).map(i => i.id));
      const result = automaticCase(d, { investigations, targetIssue, skill });
      const a = result.audit;
      stats.matched += a.matched; stats.upset += a.upset;
      stats.unexplained += a.upset && !result.player.discoveries.length;
      stats.favorable += a.forecast === '유리'; stats.contested += a.forecast === '다툼'; stats.adverse += a.forecast === '불리';
      stats.correctBinary += (a.forecast === '유리') === (a.outcome === 'not_guilty');
    }
    results.push(stats);
  }
  return results;
}

function stageOne() {
  const bytes = fs.readFileSync(path.join(__dirname, 'balance-results.log'));
  const balance = bytes.toString(bytes[0] === 255 && bytes[1] === 254 ? 'utf16le' : 'utf8').replace(/^\uFEFF/, '');
  const report = '# GEN-002 REPORT\n\nLane: experiment. 사용자 요청은 `TASK-GEN-002.md`에 보존. 커밋·병합 없음.\n\n' +
    '## 1단계 — 콘텐츠와 밸런스\n\n8개 원형·24개 반전, 기존 2종 보존. 각 원형 시드 1~300을 검사했다.\n\n' +
    '상식적 정책은 `pressSucceeds`를 읽지 않는다. 모든 사건의 limited press에 hint “결론 요구는 이 증인에게 서로 다른 자료로 확인한 근거 2개 이상 필요”를 명시하고 briefing에도 표시했다. 기존 서비스는 press hint를 투영하지 않으므로 briefing이 현재 화면에서의 공개 경로다.\n\n' +
    '```text\n' + balance + '\n```\n\n' + sampleReport() + '\n\n## 2단계\n\n진행 중.\n\n## 3단계\n\n전체 회귀 대기. 사람 플레이테스트 대기.\n';
  fs.writeFileSync(path.join(__dirname, 'REPORT.md'), report);
}
if (require.main === module) {
  if (process.argv.includes('--stage-one')) stageOne();
  else {
    const results = automaticReport();
    fs.writeFileSync(path.join(__dirname, 'automatic-results.json'), JSON.stringify(results, null, 2) + '\n');
    const lines = ['## 2단계 — 자동 정책과 전망', '', '원형·정책마다 시드 1~300. 같은 엔진의 동일 정책을 조사된 정보로 예상한 뒤 실제 기록과 비교했다.',
      '시드 순서로 무준비 / 기본 자료 하나 / 기본 자료 둘 / 기본 자료 둘+반전 조사 하나 / 기본 자료 둘+반전 조사 둘을 각 60건씩 배정했다. 집중 쟁점은 교대로 선택하며 숨은 사실을 보고 준비를 고르지 않는다.',
      '결과 밴드: 무죄=유리, 유죄이지만 shaken 쟁점이 있으면 다툼, 나머지 유죄=불리. 다툼은 무승부나 제3의 판결을 뜻하지 않는다.',
      '일치율은 3단계 전망과 판결 후 기록 밴드의 정확 일치율이다. 숫자는 개발자 보고서에만 표시한다.', '',
      '| 원형 | 정책 | 유리/다툼/불리 건수 | 일치 건수 | 일치율 | 유리→유죄 | 설명 없는 역배 |', '|---|---|---|---|---|---|---|'];
    results.forEach(r => lines.push(`| ${r.id} | ${r.skill} | ${r.favorable}/${r.contested}/${r.adverse} | ${r.matched}/${r.n} | ${(100 * r.matched / r.n).toFixed(1)}% | ${r.upset} | ${r.unexplained} |`));
    lines.push('', '역배에는 실제 실행된 미조사 재주신문의 recordId·쟁점·빠뜨린 조사 문구가 남는다. 조사로 확인된 반전만 전망에 반영한다. 정책의 숙련 차이는 결론 요구·재반대 행동에만 있다.');
    const f = path.join(__dirname, 'REPORT.md');
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/## 2단계\n[\s\S]*?(?=## 3단계)/, lines.join('\n') + '\n\n'));
    console.log(JSON.stringify({ rows: results.length, cases: results.reduce((s, r) => s + r.n, 0), unexplained: results.reduce((s, r) => s + r.unexplained, 0) }));
  }
}
module.exports = { sampleReport, automaticReport };
