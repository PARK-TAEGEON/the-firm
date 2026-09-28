'use strict';

const { initialState, step } = require('./simulation');

function validateSeed(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('seed must be an integer in 0..4294967295');
}
function createWorld(seed = 1) {
  validateSeed(seed);
  let state = initialState(seed);
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
function simulate({ years = 10, seed = 1 } = {}) {
  if (!Number.isInteger(years) || years < 1 || years > 100) throw new Error('years must be an integer in 1..100');
  const world = createWorld(seed);
  world.advance(years * 52);
  return world.snapshot();
}
module.exports = { createWorld, simulate, validateSeed };
