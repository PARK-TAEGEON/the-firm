'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const C = require('./index');
const { particle, withParticle, render } = require('./korean');
const { playerStrings, duplicateSentences } = require('./player-copy');
const { variantIndex, alternatives } = require('./sentence-variants');
const { createTrialService } = require('../../services/trial');
const { runPolicy, automaticCase } = require('../core/automatic');
const { publicForecastInput, forecastFromPublic } = require('../core/forecast');
const { schedule } = require('../report-gen002');
const pairs = ['을/를','이/가','은/는','과/와','으로/로'];
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function grammarErrors(text, nouns) {
  const errors=[];
  for (const noun of new Set(nouns)) {
    const final=(noun.normalize('NFC').at(-1).codePointAt(0)-0xac00)%28;
    for(const m of text.matchAll(new RegExp(escape(noun)+'(으로|로|을|를|이|가|은|는|과|와)(?=[\\s.,!?“”])','gu'))) {
      const pair=pairs.find(p=>p.split('/').includes(m[1])), [closed,open]=pair.split('/');
      const expected=final===0||(pair==='으로/로'&&final===8)?open:closed;
      if(m[1]!==expected) errors.push(m[0]);
    }
  }
  return errors;
}
test('Korean particles handle open, closed and rieul endings, names, quotes and invalid inputs',()=>{
  const examples=[
    ['장태오',['를','가','는','와','로']], ['문혜진',['을','이','은','과','으로']],
    ['조은결',['을','이','은','과','로']], ['노진아',['를','가','는','와','로']],
    ['달우림 소극장',['을','이','은','과','으로']], ['해솔 문화창고',['를','가','는','와','로']],
    ['느티골 시장길',['을','이','은','과','로']], ['꽃비 의상실',['을','이','은','과','로']],
    ['연두빌라',['를','가','는','와','로']], ['박수경”',['을','이','은','과','으로']]
  ];
  for(const [noun,expected] of examples) pairs.forEach((pair,i)=>{
    assert.equal(particle(noun,pair),expected[i]);
    assert.equal(withParticle(noun,pair),noun+expected[i]);
    assert.equal(render(`{noun:${pair}}`,{noun}),noun+expected[i]);
  });
  assert.equal(withParticle('7','으로/로'),'7로');
  assert.equal(withParticle('6','으로/로'),'6으로');
  assert.equal(particle('노진아','이/가'),'가');
  assert.throws(()=>particle('','이/가'),/noun/);
  assert.throws(()=>particle('미지','무효'),/unsupported/);
  assert.throws(()=>render('{missing:을/를}',{}),/missing/);
  assert.deepEqual(grammarErrors('해솔 문화창고를 방문했다. 조은결과 대화했다.',['해솔 문화창고','조은결']),[]);
  assert.deepEqual(grammarErrors('해솔 문화창고을 방문했다. 조은결으로 갔다.',['해솔 문화창고','조은결']),['해솔 문화창고을','조은결으로']);
});

test('10 archetypes × 60 seeds: every visible substitution and actual hearing uses correct particles',()=>{
  let cases=0;
  for(const id of Object.keys(C.archetypes)) for(let seed=1;seed<=60;seed++) {
    const d=C.buildContestedCase(id,seed);
    const nouns=[d.facts.place,d.client.name,...d.witnesses.map(w=>w.name),d.facts.relation];
    const text=playerStrings(d).map(x=>x.text).join('\n');
    assert.deepEqual(grammarErrors(text,nouns),[],`${id}/${seed}`);
    assert.doesNotMatch(text,/사이 관계|사이 사이|관계 관계|\{\w+(?::[^{}]+)?\}/);
    assert.doesNotMatch(d.cards.map(c=>c.text).join("\n"),/^(?:신문 자료|수습 대응 자료|추가 확인 사항 있음|추가 확인 사항 없음|관찰 범위 자료)\s*$/m);
    assert.ok(d.lines.crossTimeUp.every(([speaker,line])=>speaker==='JUDGE'&&line!=='반대신문을 마치겠습니다.'));
    for(const noun of nouns) for(const pair of pairs) {
      assert.deepEqual(grammarErrors(render(`{noun:${pair}} 확인합니다.`,{noun}),[noun]),[]);
    }
    const play=runPolicy(d,schedule(d,seed)), names=new Set(d.witnesses.map(w=>w.id));
    const lines=play.view.records.flatMap(r=>r.lines||[]);
    assert.deepEqual(grammarErrors(lines.map(l=>l.text).join('\n'),nouns),[]);
    assert.deepEqual(duplicateSentences(lines.filter(l=>names.has(l.speaker)).map(l=>l.text)),[],`${id}/${seed}`);
    cases++;
  }
  assert.equal(cases,600);
});

test('each archetype has three narrative/examination structures; consecutive theft seeds change place',()=>{
  for(const id of Object.keys(C.archetypes)) {
    const structures=new Set(), direct=new Set();
    for(let seed=1;seed<=3;seed++) {
      const d=C.buildContestedCase(id,seed);
      const normalize=s=>[d.facts.place,d.facts.date,d.facts.time,String(d.facts.amount),d.facts.relation,d.client.name]
        .reduce((text,value)=>text.replaceAll(value,'사실'),s);
      structures.add(normalize(d.briefing[0]));
      direct.add(d.witnesses.map(w=>w.direct[0].lines[0][1]).join('|'));
      assert.equal(variantIndex(seed),seed-1);
      assert.deepEqual(d,C.buildContestedCase(id,seed));
    }
    assert.equal(alternatives[id].length,2);
    assert.equal(structures.size,3,id); assert.equal(direct.size,3,id);
  }
  for(let seed=1;seed<=58;seed++) assert.equal(new Set([seed,seed+1,seed+2].map(n=>C.buildContestedCase('ARCH_THEFT',n).facts.place)).size,3);
  for(const file of ['./catalog-voices','./catalog-discoveries','./sentence-variants']) {
    const source=fs.readFileSync(require.resolve(file),'utf8');
    assert.doesNotMatch(source,/\{\w+\}(?:을|를|이|가|은|는|과|와|으로|로)(?=[\s.,!?])/);
  }
});

test('card prose is not a forecast protocol; only held investigation metadata crosses the boundary',()=>{
  for(const id of Object.keys(C.archetypes)) {
    const d=C.buildContestedCase(id,8), targetIssue=d.issues[0].id;
    const s=createTrialService(d), initial=publicForecastInput(s.projection(),{targetIssue});
    assert.deepEqual(initial.cards,[]);
    assert.equal(forecastFromPublic(initial).band,'불리');
    assert.equal(forecastFromPublic({...initial,skill:'novice'}).band,'불리');
    const inv=d.investigations.filter(i=>i.id.startsWith(`INV_${targetIssue}_`));
    for(const i of inv) assert.ok(s.command('investigate',{id:i.id}).ok);
    const v=s.projection(), input=publicForecastInput(v,{targetIssue});
    assert.equal(input.cards.length,2);
    assert.ok(input.cards.every(c=>c.kind==='foundation'&&c.finding==='observation'&&c.issueId===targetIssue));
    const before=forecastFromPublic(input);
    v.cards.forEach(c=>{ c.title='바뀐 카드 이름'; c.text='전혀 다른 줄 배치의 설명입니다.'; });
    assert.deepEqual(forecastFromPublic(publicForecastInput(v,{targetIssue})),before);
    const unowned=structuredClone(d);
    unowned.cards.forEach(c=>{c.assessment.finding='additional';c.text='공개되지 않은 자료';});
    assert.deepEqual(publicForecastInput(createTrialService(unowned).projection(),{targetIssue}),initial);
    // Missing another core issue remains adverse even when extra discoveries are added.
    const novice={...input,skill:'novice'};
    assert.equal(forecastFromPublic(novice).band,'불리');
    const changed={...novice,cards:[...novice.cards,{id:'observed',issueId:targetIssue,kind:'response',finding:'additional'}]};
    assert.equal(forecastFromPublic(changed).band,'불리');
    assert.equal(forecastFromPublic({...changed,cards:[...changed.cards,{id:'second',issueId:targetIssue,kind:'response',finding:'additional'}]}).band,'불리');
  }
});

test('conservative novice forecast preserves actual service outcomes on separate 1001..1060 seeds',()=>{
  let cases=0;
  for(const id of Object.keys(C.archetypes)) for(let seed=1001;seed<=1060;seed++) {
    const d=C.buildContestedCase(id,seed);
    const {audit}=automaticCase(d,{...schedule(d,seed),skill:'novice'});
    const actual=runPolicy(d,{...schedule(d,seed),skill:'novice'});
    assert.equal(audit.outcome,actual.outcome);
    assert.deepEqual(audit.records,actual.view.records);
    assert.equal(audit.forecast,'불리','legacy preparation leaves a core issue without our evidence');
    cases++;
  }
  assert.equal(cases,600);
});
