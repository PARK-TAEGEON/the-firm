'use strict';

const { initialState, step, beginCareerPlay } = require('./simulation');

function validateSeed(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('seed must be an integer in 0..4294967295');
}
function createWorld(seed = 1, { scale = 1, career = null } = {}) {
  validateSeed(seed);
  if (!Number.isInteger(scale) || scale < 1 || scale > 5) throw new Error('scale must be an integer in 1..5');
  if (career && (!Number.isInteger(career.warmupYears) || career.warmupYears < 0 || career.warmupYears > 20 || scale !== 1)) throw Error('career warmupYears requires 0..20 and scale 1');
  let state = initialState(seed, scale, career ? { ...career } : null);
  if (career) {
    for (let n = 0; n < career.warmupYears * 52; n++) step(state);
    beginCareerPlay(state);
  }
  return {
    advance(weeks = 1) {
      if (!Number.isInteger(weeks) || weeks < 1 || state.week + weeks > 5200) throw new Error('advance requires 1..5200 total weeks');
      // Commit once after all requested weeks succeed. Historical records are never edited.
      const draft = structuredClone({ ...state, events: [] });
      for (let n = 0; n < weeks; n++) step(draft);
      draft.events = state.events.concat(draft.events);
      state = draft;
      return state.week;
    },
    snapshot() { return structuredClone(state); },
  };
}
function simulate({ years = 10, seed = 1, scale = 1 } = {}) {
  if (!Number.isInteger(years) || years < 1 || years > 100) throw new Error('years must be an integer in 1..100');
  validateSeed(seed);
  if (!Number.isInteger(scale) || scale < 1 || scale > 5) throw new Error('scale must be an integer in 1..5');
  // One-shot service owns this fresh draft exclusively; no retained state needs a snapshot copy.
  const state = initialState(seed, scale);
  for (let n = 0; n < years * 52; n++) step(state);
  return state;
}
module.exports = { createWorld, simulate, validateSeed };
