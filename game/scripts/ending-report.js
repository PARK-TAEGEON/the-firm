'use strict';
// 시드 1..300 자동 정책 엔딩 분포. 위대한 로펌은 12주차 명성 45 · 누적 매출 1억 2,000만.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Loop = require('../src/loop.js');
const cases = require('../data/cases.json');

const SEEDS = 300;
const GREAT_REPUTATION = Loop.GREAT_REPUTATION;
const GREAT_REVENUE = Loop.GREAT_REVENUE;
const BUILDS = [
  { name: '5·5·5·5', label: '기본', stats: null },
  { name: '분석8·변론6·협상4·영업2', label: '분석', stats: { 분석: 8, 변론: 6, 협상: 4, 영업: 2 } },
  { name: '변론8·영업6·분석4·협상2', label: '변론', stats: { 변론: 8, 영업: 6, 분석: 4, 협상: 2 } },
  { name: '영업8·협상6·변론4·분석2', label: '영업', stats: { 영업: 8, 협상: 6, 변론: 4, 분석: 2 } }
];

function tally(stats) {
  const counts = { great: 0, bankrupt: 0, T1: 0, T2: 0, T3: 0, revMiss: 0 };
  let repSum = 0;
  let revenueSum = 0;
  let maxRep = 0;
  let maxRevenue = 0;
  let repAt = 0;
  let revenueAt = 0;
  let excluded = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    const state = Loop.runSeason({ seed: seed, cases: cases, stats: stats || undefined });
    if (seed === 1) excluded = state.excluded;
    repSum += state.reputation;
    revenueSum += state.revenue;
    if (state.reputation > maxRep) maxRep = state.reputation;
    if (state.revenue > maxRevenue) maxRevenue = state.revenue;
    if (state.reputation >= GREAT_REPUTATION) repAt += 1;
    if (state.revenue >= GREAT_REVENUE) revenueAt += 1;
    if (state.reputation >= GREAT_REPUTATION && state.revenue < GREAT_REVENUE && state.ending.kind === 'tier') counts.revMiss += 1;
    if (state.ending.kind === 'great') counts.great += 1;
    else if (state.ending.kind === 'bankrupt') counts.bankrupt += 1;
    else if (state.ending.tier === 1) counts.T1 += 1;
    else if (state.ending.tier === 2) counts.T2 += 1;
    else counts.T3 += 1;
  }
  return { counts: counts, repSum: repSum, revenueSum: revenueSum, maxRep: maxRep, maxRevenue: maxRevenue, repAt: repAt, revenueAt: revenueAt, excluded: excluded };
}

function pct(n) { return (n / SEEDS * 100).toFixed(1) + '% (' + n + '/' + SEEDS + ')'; }
function man(n) { return Math.round(n / 10000).toLocaleString('ko-KR') + '만'; }

const rows = BUILDS.map(function (build) {
  return { build: build, result: tally(build.stats) };
});
const base = rows[0].result;

const root = path.join(__dirname, '..', '..');
function git(args) {
  try { return execSync('git ' + args, { encoding: 'utf8', cwd: root }).trim(); }
  catch (error) { return ''; }
}
const merge = git('log --merges -1 --format=%H');
let hasCases = '아니오';
try {
  execSync('git merge-base --is-ancestor 151f53b HEAD', { cwd: root, stdio: 'ignore' });
  hasCases = '예';
} catch (error) { hasCases = '아니오'; }

const lines = [];
lines.push('# LOOP-001 엔딩 분포');
lines.push('');
lines.push('위대한 로펌은 12주차 명성 45 · 누적 매출 1억 2,000만 원이다. 성공보수는 승소 `fee`, 조정 절반, 패소 0이다. 주간 임대료는 설계값의 6.25배다.');
lines.push('');
lines.push('## 최종 숫자');
lines.push('');
lines.push('| 항목 | 설계 | 이번 |');
lines.push('| --- | --- | --- |');
lines.push('| 착수금 | 수임 시 `fee` (영업 보정) | 같음 |');
lines.push('| 성공보수 | 승소 = `fee`, 조정 = 절반, 패소 = 0 | 같음 |');
lines.push('| 임대료 배수 | 1배 | 6.25배 (직전 6.4배) |');
lines.push('| T1 주간 임대료 | 80만 원 | ' + man(Loop.RENT[1]) + ' 원 |');
lines.push('| T2 주간 임대료 | 120만 원 | ' + man(Loop.RENT[2]) + ' 원 |');
lines.push('| T3 주간 임대료 | 200만 원 | ' + man(Loop.RENT[3]) + ' 원 |');
lines.push('| 주급 | 사무원 70만, 보조원 100만 | 같음 |');
lines.push('| T1 주간 운영비 (주급+임대료) | 250만 원 | ' + man(1700000 + Loop.RENT[1]) + ' 원 |');
lines.push('| T2 주간 운영비 (주급+임대료) | 290만 원 | ' + man(1700000 + Loop.RENT[2]) + ' 원 |');
lines.push('| T3 주간 운영비 (주급+임대료) | 370만 원 | ' + man(1700000 + Loop.RENT[3]) + ' 원 |');
lines.push('| 위대한 로펌 | 12주차 명성 45 · 누적 매출 1억 2,000만 | 같음 |');
lines.push('| 강등 | 없음 | 주 종료 때 현재 등급 기준 미달이면 한 단계 |');
lines.push('');
lines.push('강등은 정산 뒤다. T3는 명성 35 미만이거나 누적 매출 4,000만 미만이면 T2, T2는 명성 15 미만이면 T1이다. 한 주에 두 단계는 내리지 않는다. 이번 주 임대료는 주 시작 등급이고, 다음 주 임대료와 난이도 해금이 강등된 등급을 따른다. 이미 맡은 사건은 유지한다. 승급은 기존처럼 한 주에 T3까지 갈 수 있다.');
lines.push('');
lines.push('자동 정책(수임은 이번 주 처리량 약 2주치까지만, 배정은 철회가 가까운 업무를 성공률이 높은 직원에게)으로 시드 1부터 ' + SEEDS + '까지 돌렸다. 채용·교육·휴가·광고는 넘겼다. T1·T2·T3는 위대한 로펌이 아닌 12주 엔딩의 도달 등급이다.');
lines.push('');
lines.push('명령:');
lines.push('');
lines.push('```');
lines.push('cd game && node scripts/ending-report.js');
lines.push('```');
lines.push('');
lines.push('## 능력치 조합');
lines.push('');
lines.push('| 능력치 (분석·변론·협상·영업) | 위대한 로펌 | T1 | T2 | T3 | 폐업 | 평균 명성 | 평균 누적 매출 |');
lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
rows.forEach(function (row) {
  const c = row.result.counts;
  lines.push('| ' + row.build.name + ' | ' + pct(c.great) + ' | ' + pct(c.T1) + ' | ' + pct(c.T2) + ' | ' + pct(c.T3) + ' | ' + pct(c.bankrupt) + ' | ' + (row.result.repSum / SEEDS).toFixed(1) + ' | ' + man(row.result.revenueSum / SEEDS) + ' 원 |');
});
lines.push('');
lines.push('## 기본 5·5·5·5');
lines.push('');
const counts = base.counts;
const ordinary = counts.T1 + counts.T2 + counts.T3;
lines.push('| 엔딩 | 비율 |');
lines.push('| --- | ---: |');
lines.push('| 위대한 로펌 | ' + pct(counts.great) + ' |');
lines.push('| 보통 (도달 등급) | ' + pct(ordinary) + ' |');
lines.push('| 보통 · T1 개인 사무소 | ' + pct(counts.T1) + ' |');
lines.push('| 보통 · T2 동네 법률사무소 | ' + pct(counts.T2) + ' |');
lines.push('| 보통 · T3 중견 로펌 | ' + pct(counts.T3) + ' |');
lines.push('| 폐업 | ' + pct(counts.bankrupt) + ' |');
lines.push('');
lines.push('시드 평균 명성 ' + (base.repSum / SEEDS).toFixed(1) + ', 평균 누적 매출 ' + man(base.revenueSum / SEEDS) + ' 원. 최대 명성 ' + base.maxRep + ' (' + base.repAt + '시드가 45 이상), 최대 누적 매출 ' + man(base.maxRevenue) + ' 원 (' + base.revenueAt + '시드가 1억 2,000만 이상).');
lines.push('');
lines.push('매출 미달 탈락: 12주를 마친 뒤 명성 45 이상이고 누적 매출이 1억 2,000만 미만이라 위대한 로펌이 아닌 판은 ' + counts.revMiss + '건이다.');
lines.push('');
const seed7 = Loop.runSeason({ seed: 7, cases: cases });
lines.push('시드 7: ' + seed7.ending.label + ', ' + seed7.weeksPlayed + '주, 명성 ' + seed7.reputation + ', 누적 매출 ' + man(seed7.revenue) + ' 원, 현금 ' + man(seed7.cash) + ' 원, 등급 ' + seed7.tier + '.');
lines.push('');
lines.push('위대한 로펌 10~20%는 맞추지 못했다. 임대료를 설계값(1배)으로 내려도 명성 45와 매출 1억 2,000만을 같이 넘는 시드는 10개(3.3%)다. 임대료는 그 10개를 줄이지 않으면서 폐업이 5~10%에 들어오는 6.25배로 뒀다.');
lines.push('');
lines.push('수임에서 뺀 사건: ' + (base.excluded.length ? base.excluded.map(function (row) { return row.id + ' (' + row.reason + ')'; }).join(', ') : '없음') + '.');
lines.push('');
lines.push('cases.json 기준 커밋 151f53b 포함: ' + hasCases + '.');
if (merge) lines.push('가장 최근 merge 커밋: `' + merge + '`.');
lines.push('');

const out = path.join(__dirname, '..', 'reports', 'LOOP-001-endings.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'));
console.log(lines.join('\n'));
