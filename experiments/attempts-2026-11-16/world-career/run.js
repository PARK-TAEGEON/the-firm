'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { simulate } = require('./service');
const { present } = require('./presentation');

function parseArgs(args) {
  const values = { years: 10, seed: 1 };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].slice(2);
    if (!['--years', '--seed'].includes(args[i]) || seen.has(key) || !/^\d+$/.test(args[i + 1] || '')) {
      throw new Error('Usage: node world/run.js --years 10 --seed 1 (integer arguments only)');
    }
    seen.add(key);
    values[key] = Number(args[i + 1]);
  }
  return values;
}
function main(args) {
  if (args[0] === '--career') return require('./career-run').main(args.slice(1));
  // Invalid input and failed simulation cannot overwrite a previous report.
  const state = simulate(parseArgs(args));
  const { news, stats } = present(state);
  const output = path.join(__dirname, 'out');
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'news.md'), news, 'utf8');
  fs.writeFileSync(path.join(output, 'stats.json'), JSON.stringify(stats, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ years: state.week / 52, seed: state.seed, articles: stats.articleCount, ...stats.observations }));
}
if (require.main === module) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { parseArgs, main };
