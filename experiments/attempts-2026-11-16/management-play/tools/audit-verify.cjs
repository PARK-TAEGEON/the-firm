#!/usr/bin/env node
'use strict';
// Run from any directory. Node-only core checks; optional browser suite uses README environment variables.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const runs = [
  ['regressions', ['--test', 'tests/engine.test.cjs', 'tests/audit-regressions.cjs', 'tests/audit-ui.test.cjs']],
  ['strategy comparisons', ['tools/audit-strategies.cjs', '--compare', 'docs/audit-strategies-baseline.json']],
];
if (process.argv.includes('--browser')) runs.push(['browser flow', ['tests/ui-smoke.cjs']]);
const lines = ['THE FIRM management audit verification', new Date().toISOString(), 'Node ' + process.version];
for (const name of ['src/engine.js', 'src/ui.js', 'dist/THE_FIRM_Management_Play_v0.3.html']) {
  lines.push('SHA256 ' + name + ' ' + crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex'));
}
let failures = 0;
for (const [name, args] of runs) {
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 120000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  lines.push('\nCOMMAND node ' + args.join(' '), r.stdout || '', r.stderr || '', 'EXIT ' + r.status);
  if (r.error) lines.push(r.error.message);
  if (r.status !== 0) failures++;
  console.log(name + ': ' + (r.status === 0 ? 'PASS' : 'FAIL') + ' (exit ' + r.status + ')');
}
lines.push('\nCommand groups: ' + runs.length + '; failed: ' + failures);
fs.writeFileSync(path.join(root, 'test-results.log'), lines.join('\n') + '\n', 'utf8');
console.log('Full evidence: test-results.log');
process.exitCode = failures ? 1 : 0;
