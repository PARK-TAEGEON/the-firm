'use strict';
// 시드 1..300 자동 정책 엔딩 분포. 설계 숫자는 바꾸지 않는다.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Loop = require('../src/loop.js');
const cases = require('../data/cases.json');

const SEEDS = 300;
const counts = { great: 0, bankrupt: 0, T1: 0, T2: 0, T3: 0 };
let repSum = 0;
let revenueSum = 0;
let excluded = [];

for (let seed = 1; seed <= SEEDS; seed++) {
  const state = Loop.runSeason({ seed: seed, cases: cases });
  if (seed === 1) excluded = state.excluded;
  repSum += state.reputation;
  revenueSum += state.revenue;
  if (state.ending.kind === 'great') counts.great += 1;
  else if (state.ending.kind === 'bankrupt') counts.bankrupt += 1;
  else if (state.ending.tier === 1) counts.T1 += 1;
  else if (state.ending.tier === 2) counts.T2 += 1;
  else counts.T3 += 1;
}

function pct(n) { return (n / SEEDS * 100).toFixed(1) + '% (' + n + '/' + SEEDS + ')'; }

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

const ordinary = counts.T1 + counts.T2 + counts.T3;
const lines = [];
lines.push('# LOOP-001 엔딩 분포');
lines.push('');
lines.push('자동 정책(수임은 이번 주 처리량 약 2주치까지만, 배정은 철회가 가까운 업무를 성공률이 높은 직원에게)으로 시드 1부터 ' + SEEDS + '까지 12주 루프를 돌렸다. 대표 능력치는 5·5·5·5. 채용·교육·휴가·광고는 넘겼다.');
lines.push('');
lines.push('명령:');
lines.push('');
lines.push('```');
lines.push('cd game && node scripts/ending-report.js');
lines.push('```');
lines.push('');
lines.push('| 엔딩 | 비율 |');
lines.push('| --- | ---: |');
lines.push('| 위대한 로펌 | ' + pct(counts.great) + ' |');
lines.push('| 보통 (도달 등급) | ' + pct(ordinary) + ' |');
lines.push('| 보통 · T1 개인 사무소 | ' + pct(counts.T1) + ' |');
lines.push('| 보통 · T2 동네 법률사무소 | ' + pct(counts.T2) + ' |');
lines.push('| 보통 · T3 중견 로펌 | ' + pct(counts.T3) + ' |');
lines.push('| 폐업 | ' + pct(counts.bankrupt) + ' |');
lines.push('');
lines.push('시드 평균 명성 ' + (repSum / SEEDS).toFixed(1) + ', 평균 누적 매출 ' + Math.round(revenueSum / SEEDS / 10000).toLocaleString('ko-KR') + '만 원.');
lines.push('');
if (counts.great === 0 || counts.bankrupt / SEEDS >= 0.9) {
  lines.push('분포가 한쪽으로 몰린다. 설계 숫자는 바꾸지 않았다. 위대한 로펌 ' + counts.great + '건, 폐업 ' + counts.bankrupt + '건.');
  lines.push('');
}
lines.push('수임에서 뺀 사건: ' + (excluded.length ? excluded.map(function (row) { return row.id + ' (' + row.reason + ')'; }).join(', ') : '없음') + '.');
lines.push('');
lines.push('cases.json 기준 커밋 151f53b 포함: ' + hasCases + '.');
if (merge) lines.push('가장 최근 merge 커밋: `' + merge + '`.');
lines.push('');

const out = path.join(__dirname, '..', 'reports', 'LOOP-001-endings.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'));
console.log(lines.join('\n'));
