'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../../content');
const rows = require('../../content/catalog-data.json');
const { factsFor } = require('../../content/catalog-facts');
const { runPolicy, automaticCase } = require('../automatic');
const { playThroughSensible } = require('../playthrough');
const { createRng, seedFor } = require('../rng');
const { createTrialService } = require('../../../services/trial');
const T = require('../../../engine/trial');
const { publicForecastInput, forecastFromPublic } = require('../forecast');

test('GEN-002: eight catalog mappings, complete factual profiles and pack provenance', () => {
  assert.equal(rows.length, 8);
  for (const row of rows) {
    const a = C.archetypes[row.id];
    assert.equal(a.catalogId, row.catalogId);
    assert.equal(a.twists_allowed.length, 3);
    for (let mask = 0; mask < 8; mask++) {
      const truth = { observation_a: .2, observation_b: .8, twist_1: mask & 1 ? 1 : 0, twist_2: mask & 2 ? 1 : 0, twist_3: mask & 4 ? 1 : 0 };
      const facts = factsFor(row.id, truth);
      for (const key of Object.keys(row.variables)) assert.ok(facts[key]);
      assert.equal(facts.discoveries.length, [1, 2, 4].filter(bit => mask & bit).length);
    }
    const d = C.buildContestedCase(row.id, 42);
    const daily = C.generateDailyCase(row.id, 42);
    assert.deepEqual(daily.truth, d.truth);
    assert.deepEqual(daily.facts, d.facts);
    assert.equal(daily.fee.retainer, d.fee.retainer);
    assert.deepEqual(d.legalSystem, { id: 'ko', version: 'gen-002-2' });
    assert.deepEqual(a.fee.success_pct, require('../../content/packs/ko.json').criminalSuccessFee.range);
    assert.equal(require('../../content/packs/ko.json').legalCandidates[row.id].status, 'unverified');
  }
});

test('GEN-002: daily and contested auto entrypoints use identical commands and outcomes', () => {
  for (const row of rows) {
    const daily = C.resolveCase(row.id, 42, { grade: 'daily' });
    const contested = C.resolveCase(row.id, 42, { grade: 'contested' });
    assert.deepEqual({ ...daily, grade: 'same' }, { ...contested, grade: 'same' });
    assert.notEqual(daily.forecast, '유리');
    assert.equal(daily.upset, false);
  }
  assert.throws(() => C.resolveCase(rows[0].id, 1, { grade: 'unknown' }), /daily/);
});

test('GEN-002: catalog twists affect the relevant issue rather than their array position', () => {
  for (const [id, suffixes] of Object.entries({ ARCH_RESALE_FRAUD: ['B', 'A', 'B'],
    ARCH_BUSINESS_EMBEZZLEMENT: ['B', 'B', 'B'], ARCH_TRAFFIC_INJURY: ['A', 'B', 'A'],
    ARCH_OBSTRUCTION_THREAT: ['B', 'A', 'B'] })) {
    assert.deepEqual(C.twists.filter(t => t.appliesTo.includes(id)).map(t => t.targetIssue.slice(-1)), suffixes);
  }
});

test('GEN-002: investigation menu never discloses active twists; facts stay out of public projection', () => {
  for (const row of rows) {
    let menu;
    for (let seed = 1; seed <= 30; seed++) {
      const d = C.buildContestedCase(row.id, seed), view = createTrialService(d).projection();
      const current = view.investigations;
      if (menu) assert.deepEqual(current, menu); else menu = current;
      assert.equal(current.length, 7);
      assert.equal(view.facts, undefined); assert.equal(view.truth, undefined);
      for (const w of d.witnesses) assert.ok(view.definition.briefing.includes(w.presses[0].hint));
      assert.equal(view.cards.length, 0);
    }
  }
});

test('GEN-002: sensible policy does not read hidden press success requirements', () => {
  let attemptedAgainstHiddenRule = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const d = C.buildContestedCase('ARCH_THEFT', seed), changed = structuredClone(d);
    changed.witnesses.forEach(w => { w.presses[0].minPoints = 99; });
    const play = def => playThroughSensible(def, createRng(seedFor(seed, 'public-policy')));
    const normal = play(d), poisoned = play(changed);
    const decisions = x => x.view.records.filter(r => ['approach', 'press'].includes(r.kind)).map(r => [r.kind, r.refId]);
    assert.deepEqual(decisions(poisoned), decisions(normal));
    attemptedAgainstHiddenRule += poisoned.view.records.filter(r => r.kind === 'press' && !r.succeeded).length;
  }
  assert.ok(attemptedAgainstHiddenRule > 0, 'policy must try public hint even when hidden success condition disagrees');
});

test('GEN-002: automatic policies deterministic, atomic, replayable; forecast disagreement is audited without replay', () => {
  let mismatches = 0, upsets = 0, policyDifferences = 0;
  const oldRandom = Math.random;
  Math.random = () => { throw Error('courtroom RNG forbidden'); };
  try {
    for (const row of rows) for (let seed = 1; seed <= 24; seed++) {
      const d = C.buildContestedCase(row.id, seed), before = structuredClone(d);
      const targetIssue = d.issues[seed % 2].id;
      const investigations = d.investigations.filter(i => d.issues.some(issue => i.id.startsWith(`INV_${issue.id}_`))).map(i => i.id);
      const options = { investigations, targetIssue, skill: 'experienced' };
      const a = automaticCase(d, options), b = automaticCase(d, options);
      assert.deepEqual(a, b); assert.deepEqual(d, before);
      assert.equal(T.replay(d, a.audit.records).verdict.outcome, a.audit.outcome);
      assert.deepEqual(T.replay(d, a.audit.records).projection, a.audit.projection);
      assert.equal(forecastFromPublic(a.audit.publicInput).band, a.audit.forecast);
      if (!a.audit.matched) { mismatches++; assert.ok(['uninvestigated_discovery', 'coarse_public_estimate'].includes(a.audit.mismatchReason)); }
      if (a.audit.upset) { upsets++; assert.ok(a.player.discoveries.every(x => x.recordId && x.issue && x.missed)); }
      const rookie = automaticCase(d, { ...options, skill: 'novice' });
      if (rookie.audit.outcome !== a.audit.outcome) policyDifferences++;
      assert.ok(!rookie.audit.records.some(r => r.kind === 'press' || r.kind === 'rebuttal'));
      assert.doesNotMatch(JSON.stringify(a.player), /"(?:strength|baseline|probability|rate|delta|weight|truth|points)"/);
      const service = createTrialService(d), snapshot = service.projection();
      assert.equal(service.command('investigate', { id: 'UNKNOWN' }).ok, false);
      assert.deepEqual(service.projection(), snapshot);
      assert.throws(() => runPolicy(d, { skill: 'unsupported' }), /unknown automatic policy/);
    }
  } finally { Math.random = oldRandom; }
  assert.ok(mismatches > 0); assert.ok(upsets > 0); assert.ok(policyDifferences > 0);
});

test('GEN-002: unobserved discoveries cannot influence forecast; investigation can reveal adverse facts', () => {
  const d = C.buildContestedCase('ARCH_THEFT', 1);
  const altered = structuredClone(d);
  altered.truth = { secret: 'changed' }; altered.facts = { secret: 'changed' };
  altered.witnesses.forEach(w => w.redirect.forEach(r => { r.delta += 50; r.memo = 'unobserved alteration'; }));
  const options = { targetIssue: d.issues[0].id };
  assert.deepEqual(publicForecastInput(createTrialService(d).projection(), options), publicForecastInput(createTrialService(altered).projection(), options));
  let worsening = false;
  for (let seed = 1; seed <= 30 && !worsening; seed++) {
    const def = C.buildContestedCase('ARCH_THEFT', seed);
    const targetIssue = def.issues[1].id;
    // Cover both issues, leaving one slot for the revealed opponent material.
    const base = def.investigations.filter(i => i.id.startsWith(`INV_${targetIssue}_`)).map(i => i.id);
    base.push(def.investigations.find(i => def.issues.some(issue => issue.id !== targetIssue && i.id.startsWith(`INV_${issue.id}_`))).id);
    const active = def.witnesses[1].redirect[0];
    if (!active) continue;
    const inv = def.investigations.find(i => i.grants.includes(active.rebuttal.card));
    const before = automaticCase(def, { targetIssue, investigations: base, skill: 'novice' });
    const after = automaticCase(def, { targetIssue, investigations: [...base, inv.id], skill: 'novice' });
    const rank = { '유리': 0, '정석': 1, '변수': 2, '불리': 3 };
    worsening = rank[after.audit.forecast] > rank[before.audit.forecast];
  }
  assert.ok(worsening, 'more knowledge may worsen forecast when policy cannot counter it');
});

test('GEN-002: new automatic engine contains no Korean jurisdiction rules or gameplay RNG', () => {
  const code = fs.readFileSync(path.join(__dirname, '../automatic.js'), 'utf8');
  assert.doesNotMatch(code, /Math\.random|createRng|randRange|형법|친고죄|반의사불벌|성공보수|제\d+조/);
});
