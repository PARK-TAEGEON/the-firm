'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../../content');
const { forecastFromPublic, comparableForecastBand } = require('../forecast');
const card = (issueId, id) => ({ id, issueId, kind: 'foundation', finding: 'observation' });
const input = { skill: 'novice', targetIssue: 'A',
  issues: ['A','B'].map(id => ({id, band: '아직 심리 전'})), investigations: [{done:false}], cards: [] };
const forecast = cards => forecastFromPublic({...input,cards});
test('novice favorable requires independent held foundations on every issue and no known strong response',()=>{
  const complete=[card('A','a'),card('A','b'),card('B','c'),card('B','d')];
  assert.equal(forecast(complete).band,'유리');
  assert.equal(forecast(complete.slice(0,3)).band,'정석');
  assert.equal(forecast([complete[0],complete[2]]).band,'변수');
  assert.equal(forecast(complete.slice(0,2)).band,'불리');
  assert.equal(forecastFromPublic({...input,skill:'experienced',cards:complete.slice(0,2)}).band,'불리');
  assert.equal(forecast([]).band,'불리');
  assert.equal(forecast([complete[0],complete[0],complete[2]]).band,'변수');
  for(const issueId of ['A','B']) {
    const additional={id:'adverse',issueId,kind:'response',finding:'additional'};
    assert.equal(forecast([...complete,additional]).band,'불리');
    assert.equal(forecastFromPublic({...input,skill:'experienced',cards:[...complete,additional]}).band,'불리');
    assert.equal(forecast([...complete,{...additional,finding:'none'}]).band,'유리');
    assert.equal(forecastFromPublic({...input,cards:[...complete,additional],issues:input.issues.map(i=>({...i,band:'의심'}))}).band,'불리');
  }
  assert.equal(forecastFromPublic({...input,cards:complete,issues:input.issues.map(i=>({...i,band:'입증 유지'}))}).band,'변수');
  const before=structuredClone(input); forecastFromPublic(input); assert.deepEqual(input,before);
  for(const cards of [[],complete,complete.slice(0,3),[complete[0],complete[2]]]) {
    assert.doesNotMatch(JSON.stringify(forecast(cards)),/[0-9%]|확률|승률/);
  }
  assert.equal(comparableForecastBand('정석'),'다툼');
  assert.equal(comparableForecastBand('변수'),'다툼');
});
test('briefing manuscripts report consistently to the representative across all archetypes and variants',()=>{
  for(const id of Object.keys(C.archetypes)) for(let seed=1;seed<=60;seed++) {
    const d=C.buildContestedCase(id,seed);
    for(const text of d.briefing) for(const sentence of text.split(/(?<=[.!?])\s+/u)) {
      assert.match(sentence,/니다\.$/,`${id}/${seed}: ${sentence}`);
    }
  }
});
