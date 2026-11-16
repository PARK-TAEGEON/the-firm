#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const runs = [
  ['original and audit regressions', ['--test','tests/engine.test.cjs','tests/audit-regressions.cjs','tests/audit-ui.test.cjs']],
  ['original strategy parity', ['tools/audit-strategies.cjs','--compare','docs/audit-strategies-baseline.json']],
  ['play experiment regressions', ['--test','tests/play-engine.test.cjs','tests/play-ui.test.cjs']],
  ['play experiment strategies', ['tools/play-experiments.cjs']],
];
if(process.argv.includes('--browser')) runs.push(
  ['original browser flows', ['tests/ui-smoke.cjs']],
  ['new browser flows', ['tests/play-ui-smoke.cjs']],
  ['improved UI invariants and responsive flows', ['tests/ui-improvement-smoke.cjs']]
);
const lines = ['THE FIRM 0.4 play experiment verification',new Date().toISOString(),'Node '+process.version];
for(const name of ['src/engine.js','src/ui.js','src/style.css','dist/THE_FIRM_Management_Play_v0.4.html']) {
  lines.push('SHA256 '+name+' '+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'));
}
let failures=0;
for(const [label,args] of runs) {
  const env={...process.env};
  // Keep each browser suite's evidence separate, including when a parent QA path is set.
  if(args.includes('tests/ui-smoke.cjs')) env.FIRM_QA_DIR=path.join(root,'docs/ui-legacy-final');
  if(args.includes('tests/play-ui-smoke.cjs')) env.FIRM_QA_DIR=path.join(root,'docs/ui-play-final');
  const result=spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8',timeout:180000,windowsHide:true,maxBuffer:6*1024*1024});
  lines.push('\nCOMMAND node '+args.join(' '),result.stdout||'',result.stderr||'','EXIT '+result.status);
  if(result.error) lines.push(result.error.message);
  if(result.status!==0) failures++;
  console.log(label+': '+(result.status===0?'PASS':'FAIL')+' (exit '+result.status+')');
}
lines.push('\nCommand groups: '+runs.length+'; failed: '+failures);
fs.writeFileSync(path.join(root,'test-results.log'),lines.join('\n')+'\n','utf8');
console.log('Evidence: test-results.log');
process.exitCode=failures?1:0;
