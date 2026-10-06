'use strict';
// All command output and run metadata stay in the ignored out directory.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const out = path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });
const cwd = path.dirname(__dirname);
const suites = [
  ['generator', process.execPath, ['--test', '--test-reporter=tap',
    ...fs.readdirSync(path.join(__dirname, 'core/tests')).filter(f => f.endsWith('.test.js')).map(f => `generator/core/tests/${f}`),
    'generator/content/content.test.js', 'generator/content/rework.test.js']],
  ['npm', process.platform === 'win32' ? 'cmd.exe' : 'npm', process.platform === 'win32' ? ['/d', '/s', '/c', 'npm test'] : ['test']],
  ['balance', process.execPath, ['generator/balance.js']]
];
const summary = [];
for (const [name, executable, args] of suites) {
  console.log(`Starting ${name}`);
  const r = spawnSync(executable, args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const output = (r.stdout || '') + (r.stderr || '') + (r.error ? String(r.error) : '');
  fs.writeFileSync(path.join(out, `${name === 'generator' ? '' : name + '-'}test-results.log`), output);
  const count = output.match(/(?:#|ℹ) tests (\d+)/), fails = output.match(/(?:#|ℹ) fail (\d+)/);
  const balance = output.match(/Checks: (\d+), failures: (\d+)/);
  const item = { suite: name, command: name === 'npm' ? 'npm test' : `node ${args.join(' ')}`,
    checks: Number((count || balance || [])[1] || 0), failures: Number(fails?.[1] || balance?.[2] || 0), exitCode: r.status };
  summary.push(item); console.log(JSON.stringify(item));
}
fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(summary, null, 2) + '\n');
process.exitCode = summary.some(x => x.exitCode !== 0 || x.failures || !x.checks) ? 1 : 0;
