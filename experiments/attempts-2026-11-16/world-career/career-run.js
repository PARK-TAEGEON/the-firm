'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { createCareerWorld } = require('./career-service');
const pages = require('./career-pages');
const { careerNews } = require('./career-news');
const { generator } = require('./generator-source');
function parseArgs(args) {
  const options = { seed: 1, years: 10, warmupYears: 10 };
  const keys = { '--seed': 'seed', '--years': 'years', '--warmup-years': 'warmupYears' }, seen = new Set();
  for (let n = 0; n < args.length; n += 2) {
    if (!keys[args[n]] || seen.has(args[n]) || !/^\d+$/.test(args[n + 1] || '')) throw Error('Usage: --seed N --years 1..100 --warmup-years 0..20');
    seen.add(args[n]); options[keys[args[n]]] = Number(args[n + 1]);
  }
  if (options.years < 1 || options.years > 100) throw Error('years requires 1..100');
  return options;
}
function exportWorld(s, directory) {
  fs.mkdirSync(path.join(directory, 'cases'), { recursive: true });
  const write = (name, body) => fs.writeFileSync(path.join(directory, name), body, 'utf8');
  for (const p of s.people) write(`${p.id}.md`, pages.personPage(s, p.id));
  for (const f of s.firms) write(`${f.id}.md`, pages.firmPage(s, f.id));
  for (const r of s.records) write(`cases/${r.id}.md`, pages.casePage(s, r.id));
  write('news.md', careerNews(s));
  write('index.md', ['# WORLD-003', '', `[신입 개업자](${s.playerId}.md) · [업계 소식](news.md)`, '',
    '## 인물', '', ...s.people.filter(p => p.active).map(p => `- [${p.name}](${p.id}.md)`), '',
    '## 로펌', '', ...s.firms.map(f => `- [${f.name}](${f.id}.md)`)].join('\n'));
}
function main(args) {
  const options = parseArgs(args), started = performance.now();
  generator(); const dependencyMs = performance.now() - started;
  const begin = performance.now(), service = createCareerWorld(options.seed, options), initial = service.snapshot();
  const warmupMs = performance.now() - begin, run = performance.now(), annualMs = [];
  for (let n = 0; n < options.years; n++) { const time = performance.now(); service.advance(); annualMs.push(performance.now() - time); }
  const simulationMs = performance.now() - run, state = service.snapshot();
  const output = path.join(__dirname, 'out', `world-003-s${options.seed}-w${options.warmupYears}-y${options.years}`);
  exportWorld(initial, path.join(output, 'start'));
  exportWorld(state, path.join(output, 'final'));
  fs.writeFileSync(path.join(output, 'audit.json'), JSON.stringify({ options, dependencyMs, warmupMs, simulationMs, annualMs,
    annual: state.annual, distribution: pages.distribution(initial), records: state.records }, null, 2));
  console.log(JSON.stringify({ output, dependencyMs, warmupMs, simulationMs, engineCount: state.records.length,
    annual: state.annual.filter(a => !a.warmup).map((a, i) => ({ ...a, ms: annualMs[i] })) }));
}
if (require.main === module) { try { main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 1; } }
module.exports = { main, parseArgs, exportWorld };
