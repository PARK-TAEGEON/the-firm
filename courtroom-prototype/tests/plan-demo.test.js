'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../data/demo-separated-moments.js');
const { play, PREP } = require('../services/plan-demo.js');

const find = (list, kind, id) => list.find(x => x.kind === kind && (!id || x.refId === id));
const prepIds = out => out.records.filter(x => x.kind === 'investigation').map(x => x.refId);

test('both internal plans execute the existing courtroom service through a verdict', () => {
  for (const useLayout of [false, true]) {
    const out = play({useLayout});
    assert.ok(out.records.some(x => x.kind === 'verdict'));
    assert.ok(out.outcome && out.outcome.judgment);
    assert.equal(out.plan.useLayout, useLayout);
    assert.equal(out.results.video.performed,true);
    assert.equal(out.results.medical.performed,true);
    assert.ok(find(out.records, 'opening'));
    assert.deepEqual(prepIds(out), PREP);
  }
});

test('partial change modifies only the planned layout response, not the common preparation and hearing', () => {
  const a = play({useLayout:false});
  const b = play({useLayout:true});
  assert.deepEqual(prepIds(a), prepIds(b));
  const common = out => out.records.filter(r => r.kind==='approach' &&
    ['A_SIG_CAUSE_MEDICAL','A_SIG_CAUSE_SEQUENCE'].includes(r.refId))
    .map(r => ({refId:r.refId,lines:r.lines,blockedReason:r.blockedReason||null}));
  assert.deepEqual(common(a), common(b));
  assert.equal(a.results.layout.performed,false);
  assert.equal(a.results.layout.record,null);
  assert.equal(b.results.layout.performed,true);
  const response = find(b.records,'rebuttal','RH_SIG_CAUSE');
  assert.ok(response, 'the authored re-cross-examination is recorded');
  assert.ok(response.lines.some(l => l.speaker === 'W_SIG_INVESTIGATOR'));
  assert.ok(response.lines.some(l => l.speaker === 'PROSECUTOR'));
  assert.equal(response.blockedReason,undefined);
  assert.ok(a.records.some(r => r.kind === 'rebuttal_pass'));
});

test('same plan and existing case data produce identical record and judgment', () => {
  for (const useLayout of [false,true]) {
    const a = play({useLayout}),b = play({useLayout});
    assert.deepEqual(a.records,b.records);
    assert.deepEqual(a.outcome,b.outcome);
  }
});

test('case data remains unchanged; no hidden truth or plan toggle becomes a judgment bonus', () => {
  const before = JSON.stringify(C);
  play({useLayout:true}); play({useLayout:false});
  assert.equal(JSON.stringify(C),before);
  const code = fs.readFileSync(path.join(__dirname,'../services/plan-demo.js'),'utf8');
  assert.doesNotMatch(code,/\b(adjudicate|resolveApproach)\s*\(/, 'the adapter delegates engine calculations');
  assert.doesNotMatch(code,/\bMath\.random\s*\(/);
  assert.throws(()=>play({useLayout:'yes'}),/boolean/);
});

test('page loads the existing case/engine and the new controller without modifying demo.html', () => {
  const html=fs.readFileSync(path.join(__dirname,'../plan-demo.html'),'utf8');
  for(const asset of ['data/demo-separated-moments.js','engine/trial.js',
    'services/demo-session.js','services/plan-demo.js','ui/plan-demo-app.js']) {
    assert.ok(html.includes('src="'+asset+'"'),asset);
  }
  assert.ok(html.indexOf('services/demo-session.js')<html.indexOf('services/plan-demo.js'));
  assert.ok(html.indexOf('services/plan-demo.js')<html.indexOf('ui/plan-demo-app.js'));
});
