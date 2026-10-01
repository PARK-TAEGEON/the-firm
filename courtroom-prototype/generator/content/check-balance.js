'use strict';

// 콘텐츠 검증용 드라이버. 실제 상태·효과·판정은 기존 서비스로 처리한다.
const C = require('./index');
const { playThrough, playThroughSensible } = require('../core/playthrough');
const { createRng, seedFor } = require('../core/rng');
const { createTrialService } = require('../../services/trial');

function playWithoutCards(d) {
  const s = createTrialService(d);
  const command = (action, payload) => {
    const result = s.command(action, payload);
    if (!result.ok) throw new Error(`${action}: ${result.error}`);
    return result.view;
  };
  command('finishPrep');
  let v = command('open', { focusId: d.opening.focus[0].id, stanceId: d.opening.stance[0].id });
  const acted = new Set();
  for (let step = 0; step < 200 && v.state.phase !== 'verdict'; step++) {
    if (v.state.pending?.type === 'objection') v = command('objection', { object: false });
    else if (v.state.pending?.type === 'rebuttal') v = command('rebut', { use: false });
    else if (v.actions.verdict) v = command('verdict');
    else if (v.state.cursor.part === 'cross') {
      const w = d.witnesses.find(w => w.id === v.witness.id);
      if (!acted.has(w.id)) {
        acted.add(w.id);
        v = command('approach', { id: w.approaches.find(a => a.id.endsWith('_UNSUPPORTED')).id });
      } else v = command('press', { id: w.presses[0].id });
    } else v = command('continue');
  }
  if (v.state.phase !== 'verdict') throw new Error('카드 없는 질문 경로 미완주');
  if (v.projection.witnesses.some(w => w.points.length)) throw new Error('카드 없는 질문이 근거 점수를 획득함');
  return v.verdict.outcome;
}

function run(seedCount = 300) {
  return Object.keys(C.archetypes).map(id => {
    let noPrep = 0, unsupported = 0, fullPrep = 0, sensible = 0, rebuttals = 0;
    for (let seed = 1; seed <= seedCount; seed++) {
      const d = C.buildContestedCase(id, seed);
      noPrep += playThrough(d, { fullPrep: false }).outcome === 'not_guilty';
      unsupported += playWithoutCards(d) === 'not_guilty';
      sensible += playThroughSensible(d, createRng(seedFor(seed, id + ':random-policy'))).outcome === 'not_guilty';
      const full = playThrough(d, { fullPrep: true });
      fullPrep += full.outcome === 'not_guilty';
      rebuttals += full.view.records.filter(r => r.kind === 'rebuttal').length;
    }
    const rate = sensible / seedCount;
    return { id, seedCount, noPrep, unsupported, fullPrep, sensible, rate, rebuttals,
      pass: noPrep === 0 && unsupported === 0 && rate >= 0.40 && rate <= 0.65 };
  });
}

if (require.main === module) {
  const results = run();
  for (const r of results) console.log(JSON.stringify(r));
  process.exitCode = results.every(r => r.pass) ? 0 : 1;
}
module.exports = { run, playWithoutCards };
