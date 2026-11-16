'use strict';
const { createHash } = require('node:crypto');
const { generator, COMMIT, korean } = require('./generator-source');
const pack = require('./packs/ko-career');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fragment = value => String(value).replace(/[.!?。]+/g, ' · ').replace(/(?:\s*·\s*)+$/g, '').trim();
function policyFor(definition, practice) {
  const targetIssue = definition.issues[practice.focus % definition.issues.length].id;
  const experienced = practice.years >= pack.experiment.policyExperienced;
  // Menu identifiers only; no hidden truth, active twists, future outcome, reputation or office.
  const investigations = definition.investigations.filter(i => i.id.startsWith(`INV_${targetIssue}_`))
    .slice(0, experienced ? 2 : 1).map(i => i.id);
  return { targetIssue, investigations, skill: experienced ? 'experienced' : 'novice' };
}
function decisiveScene(definition, result, context) {
  const g = generator(), rows = result.audit.records, outcome = result.audit.outcome;
  const pivots = rows.filter(r => r.effects?.some(([, delta]) => delta !== 0)).map(r => {
    const without = rows.map(x => x.id === r.id ? { ...x, effects: [] } : x);
    return { r, outcome: g.trial.replay(definition, without).verdict.outcome };
  }).filter(x => x.outcome !== outcome);
  // If two independently sufficient contributions exist, neither is a single
  // pivot. Find an inclusion-minimal joint set instead of inventing a hero line.
  let joint = [];
  const withoutOutcome = removed => g.trial.replay(definition,
    rows.map(r => removed.includes(r.id) ? { ...r, effects: [] } : r)).verdict.outcome;
  if (!pivots.length) {
    joint = rows.filter(r => r.effects?.some(([, delta]) => outcome === 'not_guilty' ? delta < 0 : delta > 0)).map(r => r.id);
    if (withoutOutcome(joint) === outcome) joint = [];
    else for (const id of [...joint]) {
      const smaller = joint.filter(x => x !== id);
      if (withoutOutcome(smaller) !== outcome) joint = smaller;
    }
  }
  if (joint.length) {
    const refs = rows.filter(r => joint.includes(r.id));
    const opposite = withoutOutcome(joint);
    return { kind: 'joint_pivot', recordId: joint[0], recordIds: joint, counterfactual: opposite,
      text: `${context.actorName} 담당 「${definition.title}」에서는 “${refs.map(r => fragment(r.memo || r.kind)).join(' / ')}” 기록들의 공동 기여가 결론을 바꿨다(${pack.labels.results[opposite].verdict} → ${pack.labels.results[outcome].verdict}).` };
  }
  if (!pivots.length) return { kind: 'no_single_pivot', recordId: null, counterfactual: null,
    text: `${context.actorName} 담당 「${definition.title}」에서는 직접 기여를 제외해도 ${pack.labels.results[outcome].verdict} 결론이 유지되어 결정적 장면을 특정하지 않았다.` };
  const pivot = pivots[context.seed % pivots.length];
  const quote = fragment(pivot.r.memo || pivot.r.lines?.map(x => x.text).join(' ') || pivot.r.kind);
  const fields = { actor: context.actorName, case: definition.title, quote,
    opposite: pack.labels.results[pivot.outcome].verdict, result: pack.labels.results[outcome].verdict };
  const template = pack.sceneFrames[context.seed % pack.sceneFrames.length];
  return { kind: 'outcome_pivot', recordId: pivot.r.id, recordIds: [pivot.r.id], counterfactual: pivot.outcome,
    text: korean().render(template, fields) + '.' };
}
function execute(archetype, seed, policy, context) {
  const g = generator();
  const definition = g.content.buildContestedCase(archetype, seed);
  const result = g.automatic.automaticCase(definition, policy);
  const official = pack.labels.results[result.audit.outcome];
  if (!official) throw Error('unsupported generator outcome');
  const verdict = result.audit.records.findLast(r => r.kind === 'verdict');
  if (!verdict) throw Error('missing recorded verdict');
  const scene = decisiveScene(definition, result, context);
  if (context.referencesOnly) { scene.text = ''; scene.display = 'references'; }
  return { definition, result, summary: {
    outcome: result.audit.outcome, official: structuredClone(official),
    sentenceStatus: result.audit.outcome === 'guilty' ? 'unsupported' : 'not_applicable',
    forecast: result.audit.forecast,
    scene,
    hearingDigest: digest(result.audit.records),
  } };
}
function makeRecord({ id, week, archetype, seed, grade, parties, actorName, practice, opponentStars, defenderStars, attention, previousRecords = [] }) {
  if (!['major', 'contested'].includes(grade)) throw Error('only major/contested cases use GEN');
  const definition = generator().content.buildContestedCase(archetype, seed);
  const policy = policyFor(definition, practice);
  const sceneContext = { id, actorName, seed };
  const { summary } = execute(archetype, seed, policy, sceneContext);
  // Count actual prose, not docket IDs. Once a sentence has appeared twice,
  // retain the causal record references rather than pad it with a fake variant.
  if (previousRecords.filter(r => r.scene.text === summary.scene.text).length >= 2) {
    sceneContext.referencesOnly = true; summary.scene.text = ''; summary.scene.display = 'references';
  }
  return { id, week, archetype, seed, grade, title: definition.title, parties: structuredClone(parties),
    generatorVersion: COMMIT, definitionVersion: definition.version,
    legalSystem: definition.legalSystem, worldPack: { id: pack.id, version: pack.version },
    policyVersion: 'world-auto-1', sceneVersion: 'counterfactual-2', sceneContext, policy, opponentStars, defenderStars, attention, visibility: 'public', ...summary };
}
function regenerate(record) {
  if (record.generatorVersion !== COMMIT || record.worldPack?.id !== pack.id || record.worldPack?.version !== pack.version || record.policyVersion !== 'world-auto-1')
    throw Error('unavailable historical version');
  if (record.sceneVersion !== 'counterfactual-2') throw Error('unavailable scene version');
  const run = execute(record.archetype, record.seed, record.policy, record.sceneContext);
  if (run.definition.version !== record.definitionVersion || digest(run.definition.legalSystem) !== digest(record.legalSystem))
    throw Error('pack/definition version mismatch');
  for (const key of Object.keys(run.summary)) if (digest(run.summary[key]) !== digest(record[key])) throw Error(`record mismatch: ${key}`);
  return run;
}
module.exports = { makeRecord, regenerate, policyFor, digest, decisiveScene };
