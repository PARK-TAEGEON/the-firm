'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{run}=require('./browser-full-flow.test'),baseline=require('./ui-flow-baseline.json');
(async()=>{const {metrics}=await run({budgetOnly:true});let checks=0;assert.equal(metrics.length,baseline.length);checks++;
for(const m of metrics){const b=baseline.find(b=>b.viewport===m.viewport&&b.phase===m.phase);assert.ok(b,'All phases have a v0.9 comparator');checks++;assert.ok(!m.horizontalOverflow,'No overflow '+m.phase);checks++;assert.ok(m.visibleCharacters<=b.visibleCharacters,`Text grew: ${m.viewport} ${m.phase}: ${m.visibleCharacters}/${b.visibleCharacters}`);checks++;assert.ok(m.documentHeight<=b.documentHeight*1.1,'Height budget '+m.phase);checks++;assert.equal(m.panels,2,'No added panels');checks++;}
fs.writeFileSync(path.join(__dirname,'artifacts/ui-budget-flow-current.json'),JSON.stringify({comparison:'v0.9 shipped UI, identical A journey',metrics},null,2));console.log(`Full-flow UI budget: ${checks} checks, 0 failures, exit 0`);
})().catch(e=>{console.error(e);process.exitCode=1;});
