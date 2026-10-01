'use strict';
// Experiment policies and acceptance gates. Authored rules: content/RULES.md.
const content = require('./content');
const { playThrough, playThroughRandom, playThroughSensible, playBestPathForIssue } = require('./core/playthrough');
const { createRng, seedFor } = require('./core/rng');
const SEED_COUNT = 300, BEST_PATH_MIN = .90, RANDOM_MIN = .40, RANDOM_MAX = .65, CHOICE_MATTERS_MIN = .50;

// Change investigation priority only. Target, focus, stance and hearing policy stay fixed.
function otherIssueFirst(caseDef, issueId) {
  const cards = new Set(caseDef.witnesses.filter(w => w.issue !== issueId)
    .flatMap(w => w.approaches.flatMap(a => a.requiresAny || [])));
  return caseDef.investigations.filter(i => i.grants.some(c => cards.has(c))).map(i => i.id);
}
function runForArchetype(archetypeId, seedCount = SEED_COUNT) {
  let noPrepGuilty = 0, noPrepNotGuilty = 0, bestPathWinnable = 0, randomNotGuilty = 0;
  let choiceMattersSeeds = 0, legacyRandomNotGuilty = 0, strategyChoiceSeeds = 0;
  const errors = [], unwinnableSeeds = [], noPrepAcquittals = [];
  for (let seed = 1; seed <= seedCount; seed++) {
    try {
      const d = content.buildContestedCase(archetypeId, seed);
      if (playThrough(d, { fullPrep: false }).outcome === 'not_guilty') {
        noPrepNotGuilty++; noPrepAcquittals.push(seed);
      } else noPrepGuilty++;
      const outcomes = d.issues.map(i => playBestPathForIssue(d, i.id).outcome);
      if (outcomes.includes('not_guilty')) bestPathWinnable++; else unwinnableSeeds.push(seed);
      if (new Set(outcomes).size > 1) strategyChoiceSeeds++;
      if (d.issues.some((i, j) => playBestPathForIssue(d, i.id,
        { investigationOrder: otherIssueFirst(d, i.id) }).outcome !== outcomes[j])) choiceMattersSeeds++;
      const rng = () => createRng(seedFor(seed, archetypeId + ':random-policy'));
      if (playThroughSensible(d, rng()).outcome === 'not_guilty') randomNotGuilty++;
      if (playThroughRandom(d, rng()).outcome === 'not_guilty') legacyRandomNotGuilty++;
    } catch (e) { errors.push('seed ' + seed + ': ' + e.message); }
  }
  const bestPathRate = bestPathWinnable / seedCount, randomRate = randomNotGuilty / seedCount;
  const choiceMattersRate = choiceMattersSeeds / seedCount;
  const checks = [
    { name: '(a) no preparation: 0%', pass: noPrepNotGuilty === 0 },
    { name: '(b) best path: >=90%', pass: bestPathRate >= BEST_PATH_MIN },
    { name: '(c) random preparation + sensible cross: 40..65%', pass: randomRate >= RANDOM_MIN && randomRate <= RANDOM_MAX },
    { name: '(d) investigation choice alone: >=50%', pass: choiceMattersRate >= CHOICE_MATTERS_MIN }
  ].map(c => ({ ...c, pass: c.pass && errors.length === 0 }));
  return { archetypeId, seedCount, checks, errors, noPrepGuilty, noPrepNotGuilty, noPrepAcquittals,
    bestPathWinnable, bestPathRate, unwinnableSeeds, randomNotGuilty, randomRate,
    choiceMattersSeeds, choiceMattersRate, legacyRandomNotGuilty, strategyChoiceSeeds };
}
function run() { return Object.keys(content.archetypes).map(id => runForArchetype(id)); }
function report(results) {
  for (const r of results) {
    console.log('GEN-001 ' + r.archetypeId + ' seeds 1..' + r.seedCount);
    for (const [label, count] of [['(a) no preparation', r.noPrepNotGuilty], ['(b) best path', r.bestPathWinnable],
      ['(c) random preparation + sensible cross', r.randomNotGuilty], ['(d) investigation choice alone', r.choiceMattersSeeds],
      ['(e) legacy completely random (reference)', r.legacyRandomNotGuilty],
      ['old (d) different target strategies (reference)', r.strategyChoiceSeeds]]) {
      console.log('  ' + label + ': ' + count + '/' + r.seedCount + ' (' + (count / r.seedCount * 100).toFixed(1) + '%)');
    }
    console.log('  Unwinnable seeds: ' + (r.unwinnableSeeds.join(', ') || 'none'));
    console.log('  Errors: ' + r.errors.length);
    r.errors.forEach(e => console.log('    ' + e));
    r.checks.forEach(c => console.log('  ' + (c.pass ? 'PASS ' : 'FAIL ') + c.name));
  }
  const checks = results.flatMap(r => r.checks);
  const failures = checks.filter(c => !c.pass).length;
  console.log('Checks: ' + checks.length + ', failures: ' + failures);
  return failures === 0;
}
if (require.main === module) process.exitCode = report(run()) ? 0 : 1;
module.exports = { run, report, runForArchetype, otherIssueFirst, SEED_COUNT, BEST_PATH_MIN, RANDOM_MIN, RANDOM_MAX, CHOICE_MATTERS_MIN };
