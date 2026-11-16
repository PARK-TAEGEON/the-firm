'use strict';
const { createWorld } = require('./service');
const { regenerate } = require('./case-records');
const pack = require('./packs/ko-career');
function createCareerWorld(seed = 1, { warmupYears = pack.experiment.warmupYears } = {}) {
  const world = createWorld(seed, { career: { warmupYears } });
  return {
    advance(years = 1) {
      if (!Number.isInteger(years) || years < 1 || years > 100) throw Error('years requires 1..100');
      return world.advance(years * 52);
    },
    snapshot: world.snapshot,
    openRecord(id) {
      const record = world.snapshot().records.find(r => r.id === id);
      if (!record) throw Error('unknown case record');
      return regenerate(record);
    },
  };
}
module.exports = { createCareerWorld };
