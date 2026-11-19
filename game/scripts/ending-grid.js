'use strict';
// 엔딩 조건 격자. 엔진의 위대한 로펌 값(명성 40 · 1억 2,000만)은 바꾸지 않는다.
// 그 조건은 12주 판정의 이름만 가른다. 자동 정책·강등·폐업은 그 값을 읽지 않으므로
// 시드 1..300을 조합마다 한 번 돌리고, 20칸은 그 결과로 다시 분류한다.
const fs = require('fs');
const path = require('path');
const Loop = require('../src/loop.js');
const cases = require('../data/cases.json');

const SEEDS = 300;
const REPS = [35, 37, 40, 42, 45];
const REVS = [90000000, 100000000, 110000000, 120000000];
const BUILDS = [
  { name: '5·5·5·5', stats: null },
  { name: '분석8·변론6·협상4·영업2', stats: { 분석: 8, 변론: 6, 협상: 4, 영업: 2 } },
  { name: '변론8·영업6·분석4·협상2', stats: { 변론: 8, 영업: 6, 분석: 4, 협상: 2 } },
  { name: '영업8·협상6·변론4·분석2', stats: { 영업: 8, 협상: 6, 변론: 4, 분석: 2 } }
];

function play(stats) {
  const rows = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    const state = Loop.runSeason({ seed: seed, cases: cases, stats: stats || undefined });
    rows.push({
      rep: state.reputation,
      rev: state.revenue,
      weeks: state.weeksPlayed,
      kind: state.ending.kind
    });
  }
  return rows;
}

function classify(row, repBar, revBar) {
  if (row.kind === 'bankrupt') return 'bankrupt';
  if (row.weeks < Loop.WEEKS) return 'other';
  if (row.rep >= repBar && row.rev >= revBar) return 'great';
  if (row.rep < repBar) return 'repMiss';
  return 'revMiss';
}

function summarize(rows, repBar, revBar) {
  const counts = { great: 0, bankrupt: 0, repMiss: 0, revMiss: 0, other: 0 };
  rows.forEach(function (row) { counts[classify(row, repBar, revBar)] += 1; });
  return counts;
}

function pct(n) { return (n / SEEDS * 100).toFixed(1) + '%'; }
function man(n) { return (n / 10000).toLocaleString('ko-KR') + '만'; }

const played = BUILDS.map(function (build) { return play(build.stats); });

const shipped = summarize(played[0], Loop.GREAT_REPUTATION, Loop.GREAT_REVENUE);
let shippedGreat = 0;
let shippedBankrupt = 0;
played[0].forEach(function (row) {
  if (row.kind === 'great') shippedGreat += 1;
  if (row.kind === 'bankrupt') shippedBankrupt += 1;
});
if (shipped.great !== shippedGreat || shipped.bankrupt !== shippedBankrupt) {
  throw new Error('재분류가 엔진 엔딩과 다릅니다. 칸마다 다시 돌려야 합니다.');
}

const cells = [];
REPS.forEach(function (repBar) {
  REVS.forEach(function (revBar) {
    const builds = played.map(function (rows) { return summarize(rows, repBar, revBar); });
    const base = builds[0];
    const greatOk = base.great >= 30 && base.great <= 60;
    const bankruptOk = base.bankrupt >= 15 && base.bankrupt <= 30;
    const spreadOk = builds.every(function (row) { return row.great >= 9 && row.great <= 105; });
    const bothMiss = base.repMiss > 0 && base.revMiss > 0;
    const allBuildsBoth = builds.every(function (row) { return row.repMiss > 0 && row.revMiss > 0; });
    const pass = greatOk && bankruptOk && spreadOk && bothMiss;
    let distance = 0;
    distance += base.great < 30 ? 30 - base.great : base.great > 60 ? base.great - 60 : Math.abs(base.great - 45);
    distance += base.bankrupt < 15 ? (15 - base.bankrupt) * 5 : base.bankrupt > 30 ? (base.bankrupt - 30) * 5 : 0;
    builds.forEach(function (row) {
      if (row.great < 9) distance += (9 - row.great) * 5;
      if (row.great > 105) distance += (row.great - 105) * 5;
    });
    if (base.repMiss === 0) distance += 1000;
    if (base.revMiss === 0) distance += 1000;
    cells.push({
      repBar: repBar, revBar: revBar, builds: builds, pass: pass,
      greatOk: greatOk, bankruptOk: bankruptOk, spreadOk: spreadOk, bothMiss: bothMiss,
      allBuildsBoth: allBuildsBoth, distance: distance
    });
  });
});

const passed = cells.filter(function (cell) { return cell.pass; });
passed.sort(function (a, b) { return a.distance - b.distance; });
const featured = passed.length ? passed.slice(0, 3) : cells.slice().sort(function (a, b) { return a.distance - b.distance; }).slice(0, 3);

const lines = [];
lines.push('# LOOP-001 엔딩 조건 격자');
lines.push('');
lines.push('엔진에 들어 있는 위대한 로펌 조건은 그대로다. 12주차 명성 ' + Loop.GREAT_REPUTATION + ', 누적 매출 ' + man(Loop.GREAT_REVENUE) + ' 원. 임대료는 설계의 6.25배(T1 500만, T2 750만, T3 1,250만), 성공보수는 승소 `fee`·조정 절반·패소 0, 강등은 주 종료 때 한 단계다.');
lines.push('');
lines.push('자동 정책은 슬롯·남은 업무·수임료·난이도만 본다. 강등은 T2 명성 15, T3 명성 35·누적 매출 4,000만만 본다. 폐업은 현금이 두 주 연속 마이너스일 때이고 엔딩 문턱보다 먼저 판정한다. 그래서 위대한 로펌 문턱은 12주를 마친 판의 이름만 바꾼다. 조합 4개 × 시드 300을 한 번씩 돌리고 20칸은 그 기록으로 다시 분류했다. 기본 조합에서 엔진 엔딩(위대한 ' + shippedGreat + ', 폐업 ' + shippedBankrupt + ')과 재분류가 같다.');
lines.push('');
lines.push('명령:');
lines.push('');
lines.push('```');
lines.push('cd game && node scripts/ending-grid.js');
lines.push('```');
lines.push('');
lines.push('## 정의');
lines.push('');
lines.push('- 위대한 로펌: 12주를 마쳤고, 폐업이 아니며, 명성이 칸의 기준 이상이고 누적 매출도 칸의 기준 이상.');
lines.push('- 폐업: 현금이 두 주 연속 마이너스. 문턱과 무관해서 20칸이 같다.');
lines.push('- 명성 미달 탈락: 12주를 마쳤는데 명성이 칸의 기준 미만. 매출도 모자라면 이쪽만 센다.');
lines.push('- 매출 미달 탈락: 12주를 마쳤고 명성은 칸의 기준 이상인데 누적 매출이 칸의 기준 미만.');
lines.push('- 후보: (1) 기본 위대한 로펌 30~60건(10~20%) (2) 기본 폐업 15~30건(5~10%) (3) 네 조합 모두 위대한 로펌 9~105건(3~35%) (4) 기본 조합에 명성 미달과 매출 미달이 둘 다 1건 이상. 경계는 포함한다.');
lines.push('');
lines.push('## 20칸');
lines.push('');
lines.push('| 명성 | 누적 매출 | 기본 위대한 | 기본 폐업 | 기본 명성 미달 | 기본 매출 미달 | 분석 위대한 | 변론 위대한 | 영업 위대한 | 기준 |');
lines.push('| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |');
cells.forEach(function (cell) {
  const mark = cell.pass ? '충족' : '아님';
  const b = cell.builds;
  lines.push('| ' + cell.repBar + ' | ' + man(cell.revBar) + ' | ' + pct(b[0].great) + ' (' + b[0].great + ') | ' + pct(b[0].bankrupt) + ' (' + b[0].bankrupt + ') | ' + b[0].repMiss + ' | ' + b[0].revMiss + ' | ' + pct(b[1].great) + ' (' + b[1].great + ') | ' + pct(b[2].great) + ' (' + b[2].great + ') | ' + pct(b[3].great) + ' (' + b[3].great + ') | ' + mark + ' |');
});
lines.push('');
lines.push('충족 ' + passed.length + '칸. 폐업은 전 칸 기본 ' + cells[0].builds[0].bankrupt + '건(' + pct(cells[0].builds[0].bankrupt) + ')이다.');
lines.push('');
lines.push('## 기준을 칸마다');
lines.push('');
lines.push('| 명성 | 매출 | 위대한 10~20% | 폐업 5~10% | 4조합 3~35% | 미달 둘 다 | 4조합도 미달 둘 다 |');
lines.push('| ---: | ---: | --- | --- | --- | --- | --- |');
cells.forEach(function (cell) {
  function yn(flag) { return flag ? '예' : '아니오'; }
  lines.push('| ' + cell.repBar + ' | ' + man(cell.revBar) + ' | ' + yn(cell.greatOk) + ' | ' + yn(cell.bankruptOk) + ' | ' + yn(cell.spreadOk) + ' | ' + yn(cell.bothMiss) + ' | ' + yn(cell.allBuildsBoth) + ' |');
});
lines.push('');
lines.push('## 후보');
lines.push('');
if (!passed.length) {
  lines.push('네 기준을 모두 만족하는 칸은 없다. 아래 3칸은 벗어난 거리에 가장 가깝다.');
} else if (passed.length <= 3) {
  lines.push('기준을 만족하는 칸은 ' + passed.length + '개다.');
} else {
  lines.push('기준을 만족하는 칸은 ' + passed.length + '개다. 기본 위대한 로펌이 15%(45건)에 가까운 3칸을 적는다. 만족한 칸은 위 표의 충족 행이다.');
}
lines.push('');

featured.forEach(function (cell) {
  lines.push('### 명성 ' + cell.repBar + ' · 누적 매출 ' + man(cell.revBar));
  lines.push('');
  if (!cell.pass) {
    const misses = [];
    if (!cell.greatOk) misses.push('기본 위대한 로펌 ' + pct(cell.builds[0].great) + '는 10~20% 밖');
    if (!cell.bankruptOk) misses.push('기본 폐업 ' + pct(cell.builds[0].bankrupt) + '는 5~10% 밖');
    if (!cell.spreadOk) misses.push('어떤 조합의 위대한 로펌이 3~35% 밖');
    if (!cell.bothMiss) misses.push('기본 조합에 명성 미달 또는 매출 미달이 없음');
    lines.push('못 맞춘 기준: ' + misses.join('. ') + '.');
    lines.push('');
  }
  lines.push('| 능력치 | 위대한 로펌 | 폐업 | 명성 미달 탈락 | 매출 미달 탈락 |');
  lines.push('| --- | ---: | ---: | ---: | ---: |');
  cell.builds.forEach(function (row, index) {
    lines.push('| ' + BUILDS[index].name + ' | ' + pct(row.great) + ' (' + row.great + '/300) | ' + pct(row.bankrupt) + ' (' + row.bankrupt + '/300) | ' + row.repMiss + ' | ' + row.revMiss + ' |');
  });
  lines.push('');
});

const out = path.join(__dirname, '..', 'reports', 'LOOP-001-grid.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'));
console.log(lines.join('\n'));
