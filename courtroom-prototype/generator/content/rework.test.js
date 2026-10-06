'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const C = require('./index');
const rows = require('./catalog-data.json');
const { copyErrors, duplicateSentences, playerStrings, forbidden } = require('./player-copy');
const { runPolicy, automaticCase } = require('../core/automatic');
const { publicForecastInput, forecastFromPublic } = require('../core/forecast');
const { createTrialService } = require('../../services/trial');

test('all ten archetypes: every authored visible string is free of document syntax and internal codes', () => {
  for (const id of Object.keys(C.archetypes)) for (let seed = 1; seed <= 50; seed++) {
    const d = C.buildContestedCase(id, seed);
    assert.deepEqual(copyErrors(d), [], `${id}/${seed}`);
    assert.ok(playerStrings(d).length > 80);
  }
});
test('visible-string guard rejects leaks in menu, alternative dialogue, notes, cards and verdict', () => {
  for (const bad of ['T1 물건 대조', 'N1 내부 수치', '**메모**', '[검토](docs/design.md)', 'https://example.test', '# 문서', '[확인 필요]', '검토 메모: 문장 수정']) {
    for (const inject of [d => d.investigations[0].title = bad, d => d.cards[0].text = bad,
      d => d.witnesses[0].presses[0].fail.lines[0][1] = bad, d => d.issues[0].memo.doubt = bad,
      d => d.adjudication.guilty.text = bad]) {
      const d = C.buildContestedCase('ARCH_THEFT', 1); inject(d);
      assert.ok(copyErrors(d).length, bad);
    }
  }
  assert.deepEqual(duplicateSentences(['장면은 기억합니다. 다른 설명입니다.', '장면은 기억합니다.']), ['장면은 기억합니다.']);
});
test('eight authored casts and dialogue are distinct; witnesses never repeat a sentence within a hearing', () => {
  const names = [], clients = [], categories = new Map();
  for (const row of rows) {
    const d = C.buildContestedCase(row.id, 1);
    clients.push(d.client.name);
    for (const w of d.witnesses) {
      names.push(w.name); assert.ok(w.speechStyle && w.role);
      const spoken = [...w.direct[0].lines.filter(l => l[0] === w.id).map(l => l[1]),
        ...w.direct.filter(x => x.type === 'objection').flatMap(x => x.pass.lines.filter(l => l[0] === w.id).map(l => l[1])),
        ...w.approaches.flatMap(a => a.lines.filter(l => l[0] === w.id).map(l => l[1])),
        ...w.presses.flatMap(p => [p.success, p.fail].filter(Boolean).flatMap(x => x.lines.filter(l => l[0] === w.id).map(l => l[1])))];
      assert.deepEqual(duplicateSentences(spoken), [], w.name);
      for (const [kind, text] of [['direct',w.direct[0].lines[1][1]],['press',w.presses[0].question],['overreach',w.presses[1].question],
        ['resistance',w.approaches.find(a => a.id.endsWith('_UNSUPPORTED')).lines[1][1]],['objection',w.direct[1].question[1]]]) {
        if (!categories.has(kind)) categories.set(kind,new Set());
        assert.ok(!categories.get(kind).has(text), `${kind}: ${text}`); categories.get(kind).add(text);
      }
    }
    for (let seed=1;seed<=8;seed++) for (const targetIndex of [0,1]) {
      const def=C.buildContestedCase(row.id,seed), targetIssue=def.issues[targetIndex].id;
      const investigations=def.investigations.filter(i=>i.id.startsWith(`INV_${targetIssue}_`)).map(i=>i.id);
      const play=runPolicy(def,{targetIssue,investigations});
      const ids=new Set(def.witnesses.map(w=>w.id));
      const spoken=play.view.records.flatMap(r=>r.lines||[]).filter(l=>ids.has(l.speaker)).map(l=>l.text);
      assert.deepEqual(duplicateSentences(spoken),[], `${row.id}/${seed}`);
    }
  }
  assert.equal(new Set(names).size,16); assert.equal(new Set(clients).size,8);
});
test('scene facts reach briefing, testimony, cards and judgments without changing the game RNG', () => {
  for (const row of rows) {
    const signatures=new Set();
    for(let seed=1;seed<=3;seed++) {
      const d=C.buildContestedCase(row.id,seed), text=playerStrings(d).map(x=>x.text).join('\n');
      for(const key of ['place','time','amount','relation','date']) assert.ok(text.includes(String(d.facts[key])),`${row.id}/${key}`);
      assert.ok(d.briefing[0].includes(d.facts.place));
      assert.ok(d.cards.some(c=>c.text.includes(d.facts.place)));
      assert.ok(d.witnesses.some(w=>w.direct[0].lines.some(l=>l[1].includes(d.facts.time)||l[1].includes(d.facts.place))));
      assert.ok(d.adjudication.guilty.text.includes(d.facts.place)||d.adjudication.guilty.text.includes(String(d.facts.amount)));
      signatures.add(JSON.stringify([d.facts.place,d.facts.time,d.facts.amount,d.facts.relation]));
    }
    assert.equal(signatures.size,3);
  }
});
test('all ten archetypes: no repeated testimony sentences, and automatic CLI renders no metadata', () => {
  for (const id of Object.keys(C.archetypes)) for (let seed=1;seed<=12;seed++) {
    const d=C.buildContestedCase(id,seed), all=[];
    for (const w of d.witnesses) {
      all.push(...[...w.direct[0].lines,...w.direct[1].pass.lines,...w.approaches.flatMap(a=>a.lines),
        ...w.presses.flatMap(p=>[p.success,p.fail].filter(Boolean).flatMap(x=>x.lines))]
        .filter(l=>l[0]===w.id).map(l=>l[1]));
    }
    assert.deepEqual(duplicateSentences(all),[],`${id}/${seed}`);
    assert.ok(duplicateSentences([...all,all[0]]).length,'duplicate injection must be rejected');
    const result=automaticCase(d);
    const rendered=require('../auto').formatResult(result.player);
    assert.doesNotMatch(rendered,forbidden);
    assert.doesNotMatch(rendered,/ARCH_|ISSUE_|recordId|baseline|delta|truth|seed|matched/);
  }
});
test('forecast cannot import the engine or inspect unshown strengths and future records', () => {
  const context={module:{exports:{}},require:()=>{throw Error('forecast may not import anything');}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../core/forecast'),'utf8'),context);
  for(const id of Object.keys(C.archetypes)) {
    const d=C.buildContestedCase(id,5), s=createTrialService(d), targetIssue=d.issues[0].id;
    const before=publicForecastInput(s.projection(),{targetIssue});
    const poisoned=s.projection();
    poisoned.projection.issues.forEach(i=>{i.strength=999; i.band='doubt';});
    Object.defineProperty(poisoned,'definition',{get(){throw Error('private definition read');}});
    Object.defineProperty(poisoned,'records',{get(){throw Error('records read');}});
    assert.deepEqual(publicForecastInput(poisoned,{targetIssue}),before);
    assert.equal(context.module.exports.forecastFromPublic(before).band,forecastFromPublic(before).band);
    for(const inv of d.investigations.filter(i=>i.id.startsWith(`INV_${targetIssue}_`))) assert.ok(s.command('investigate',{id:inv.id}).ok);
    const after=publicForecastInput(s.projection(),{targetIssue});
    assert.notEqual(forecastFromPublic(before).band,forecastFromPublic(after).band);
    const changed=structuredClone(d); changed.issues.forEach(i=>i.baseline+=10);
    changed.witnesses.forEach(w=>{w.redirect=[];w.presses[0].success.delta=100;});
    assert.equal(automaticCase(d,{targetIssue}).audit.forecast,automaticCase(changed,{targetIssue}).audit.forecast);
    assert.doesNotMatch(JSON.stringify(after), /"(?:baseline|strength|delta|truth|seed|points|redirect|presses)"/);
  }
});
test('ko pack describes all archetypes and distinct assault/defamation variants; money is data driven', () => {
  const pack=require('./packs/ko.json');
  for(const id of Object.keys(C.archetypes)) {
    const r=pack.archetypeRules[id]; assert.ok(r);
    assert.ok([true,false,'conditional'].includes(r.nonProsecutionAgainstWill));
    assert.ok([true,false,'conditional'].includes(r.complaintRequired));
    assert.equal(r.settlement.paymentAloneEndsCase,false); assert.equal(r.settlement.automaticAcquittal,false);
    assert.equal(r.execution.prosecutionConditions,false); assert.ok(r.sources.length);
  }
  const assault=pack.archetypeRules.ARCH_CRIMINAL_ASSAULT;
  assert.equal(assault.nonProsecutionAgainstWill,false);
  assert.equal(assault.variants.simple_assault.nonProsecutionAgainstWill,true);
  assert.equal(pack.archetypeRules.ARCH_DUI.nonProsecutionAgainstWill,false);
  assert.equal(pack.archetypeRules.ARCH_ONLINE_DEFAMATION.variants.insult.complaintRequired,true);
  const code=fs.readFileSync(require.resolve('./index'),'utf8');
  assert.doesNotMatch(code,/archetypeId\s*===\s*'ARCH_CRIMINAL_ASSAULT'|합의금 참고액/);
  const old=assault.settlement.amountSummary;
  try { assault.settlement.amountSummary=null; assert.doesNotMatch(C.generateDailyCase('ARCH_CRIMINAL_ASSAULT',1).outcomeSummary,/합의금/); }
  finally { assault.settlement.amountSummary=old; }
});
test('human report contains thirty complete case transcripts, with named speakers and verdicts', () => {
  const report=require('../report-gen002').sampleReport();
  assert.equal((report.match(/^### /gm)||[]).length,30);
  assert.equal((report.match(/^공판 기록:/gm)||[]).length,30);
  assert.equal((report.match(/^결과: (?:유죄|무죄)/gm)||[]).length,30);
  assert.equal((report.match(/^선택하지 않은 대안 대사:/gm)||[]).length,30);
  assert.doesNotMatch(report,/undefined|PLACEHOLDER|ARCH_|ISSUE_|^W_|^JUDGE:|^PROSECUTOR:/m);
});
