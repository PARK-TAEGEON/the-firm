(function(root) {
'use strict';
// Separate presentation history: no trial state, records, profiles or NPC inputs.
const KEY = 'firm.demo.profile-history.v1';
const outcomes = ['acquittal','dismissal','assault','injury'];
function createHistory(storage) {
  let totals = {}; const completed = new Set();
  try {
    const parsed = JSON.parse(storage.getItem(KEY));
    for (const id of ['novice','veteran','JUDGE']) {
      if (!parsed || !parsed[id]) continue;
      totals[id] = {};
      for (const key of outcomes) {
        const n = parsed[id][key]; totals[id][key] = Number.isSafeInteger(n) && n >= 0 ? n : 0;
      }
    }
  } catch (_) { /* Storage unavailable or corrupt: use memory. */ }
  return {
    record(round, ids, outcome) {
      if (completed.has(round) || !outcomes.includes(outcome)) return;
      completed.add(round);
      for (const id of new Set(ids)) {
        if (!['novice','veteran','JUDGE'].includes(id)) continue;
        const row = totals[id] || (totals[id] = {}); row[outcome] = (row[outcome] || 0) + 1;
      }
      try { storage.setItem(KEY, JSON.stringify(totals)); } catch (_) { /* Memory remains usable. */ }
    },
    get(id) { const row = totals[id] || {}; return Object.fromEntries(outcomes.map(k => [k,row[k] || 0])); }
  };
}
const api = { createHistory, KEY };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmDemoProfileHistory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
