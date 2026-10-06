'use strict';
// Explicit authoring utility; generation never parses Markdown at runtime.
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'CATALOG.md'), 'utf8');
const legalCandidates = {};
const rows = source.split(/\r?\n## \d+\. /).slice(1).map(block => {
  const catalogId = block.match(/ID: `(CAT_[A-Z_]+)`/)[1];
  const id = catalogId.replace('CAT_', 'ARCH_');
  const fee = block.match(/고정 보수 \*\*(\d+)~(\d+)만원/);
  legalCandidates[id] = { status: 'unverified', label: '[확인 필요] 사건별 소추·양형·적용법 확인 전 실행 금지',
    notes: block.split('### 합의·양형 / 수임료')[1].split(/\r?\n##/)[0].trim() };
  return { catalogId, id, title: block.split(/\r?\n/)[0],
    issues: [...block.matchAll(/^- [AB]\. (.+)/gm)].map(m => m[1].trim()),
    variables: Object.fromEntries([...block.matchAll(/^\d+\. `([^`]+)`: (.+)/gm)].map(m => [m[1], m[2].trim()])),
    twists: block.split(/\r?\n/).filter(s => s.startsWith('| ') && !s.startsWith('| 조건') && !s.startsWith('| ---'))
      .map(s => s.slice(1, -1).split('|').map(x => x.trim())).filter(x => x.length === 4),
    retainer: [+fee[1], +fee[2]] };
});
if (rows.length !== 8 || rows.some(r => r.issues.length !== 2 || r.twists.length !== 3)) throw Error('catalog shape');
fs.mkdirSync(path.join(__dirname, 'packs'), { recursive: true });
for (const [name, data] of [['catalog-data.json', rows], ['packs/ko.json', {
  id: 'ko', version: 'gen-002-1', criminalSuccessFee: { allowed: false, range: [0, 0], status: 'accepted DEC-032 D3' }, legalCandidates
}]]) fs.writeFileSync(path.join(__dirname, name), JSON.stringify(data, null, 2) + '\n');
