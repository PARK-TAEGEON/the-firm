(function (root) {
  'use strict';
  const types = ['ADMIT', 'RESIST', 'EVADE', 'EXPLAIN', 'CONTRADICT'];
  const copy = value => JSON.parse(JSON.stringify(value));
  const find = (list, id) => list.find(item => item.id === id);
  function ensure(condition, message) { if (!condition) throw new Error(message); }
  function validate(d) {
    const collections = ['parties', 'issues', 'theories', 'witnesses', 'evidence', 'propositions', 'goals', 'responses', 'argumentPlans'];
    const ids = new Set([d.id, d.profile.id, d.client.id]);
    ensure(ids.size === 3 && [...ids].every(id => typeof id === 'string' && id), 'Invalid root IDs');
    for (const key of collections) {
      ensure(Array.isArray(d[key]), 'Missing collection: ' + key);
      for (const item of d[key]) { ensure(typeof item.id === 'string' && item.id && !ids.has(item.id), 'Duplicate or invalid ID'); ids.add(item.id); }
    }
    ensure(d.witnesses.length === 1, 'This slice requires one witness');
    ensure(d.profile.resolutionTypes.includes('adjudicated'), 'Missing adjudicated resolution');
    ensure(['plan', 'examine', 'resolved'].every(k => d.profile.phases[k]), 'Missing phase');
    ensure(['claimant', 'respondent', 'factFinder'].every(k => d.profile.roles[k]), 'Missing role');
    ensure(['establish', 'select', 'press', 'frame', 'stop', 'strategy'].every(k => d.profile.actions.includes(k)), 'Missing action');
    const ref = (key, id) => ensure(find(d[key], id), 'Unknown ' + key + ' reference: ' + id);
    d.propositions.forEach(p => ensure(Array.isArray(p.tags) && new Set(p.tags).size === p.tags.length && p.tags.every(t => typeof t === 'string'), 'Invalid tags'));
    d.parties.forEach(p => ensure(d.profile.roles[p.role], 'Unknown party role'));
    d.responses.forEach(r => { ensure(types.includes(r.type), 'Unknown response type'); r.adds.forEach(id => ref('propositions', id)); });
    d.goals.forEach(g => { ref('responses', g.response); g.basis.forEach(id => ref('evidence', id)); ensure(find(d.responses, g.response).adds.length, 'Unproductive goal'); });
    const obtainable = new Set(d.goals.flatMap(g => find(d.responses, g.response).adds));
    const tags = new Set(d.propositions.flatMap(p => p.tags));
    function condition(c) {
      const allowed = ['any', 'pressed', 'absent', 'selectedTags', 'recordTags', 'absentTags'];
      ensure(c && Object.keys(c).every(k => allowed.includes(k)), 'Unknown rule condition');
      if (c.any) { ensure(c.any.length > 0, 'Empty rule alternatives'); c.any.forEach(condition); }
      if ('pressed' in c) ensure(typeof c.pressed === 'boolean', 'Invalid pressed condition');
      (c.absent || []).forEach(id => ref('propositions', id));
      (c.absentTags || []).forEach(t => ensure(tags.has(t), 'Unknown tag'));
      for (const group of ['selectedTags', 'recordTags']) for (const [tag, count] of Object.entries(c[group] || {})) ensure(tags.has(tag) && Number.isInteger(count) && count > 0, 'Invalid tag requirement');
    }
    ensure(d.argumentPlans.length > 0 && d.theories.length > 0, 'Missing plan or strategy');
    d.argumentPlans.forEach(p => {
      ref('issues', p.issue);
      ensure(Number.isInteger(p.min) && Number.isInteger(p.max) && p.min >= 2 && p.max <= 4 && p.min <= p.max && new Set(p.premises).size === p.premises.length, 'Invalid premise bounds');
      p.premises.forEach(id => { ref('propositions', id); ensure(obtainable.has(id), 'Unreachable premise'); });
      ensure(p.premises.length >= p.min, 'Unreachable plan');
      ensure(p.responseRules.length && Object.keys(p.responseRules.at(-1).when).length === 0, 'Missing response fallback');
      p.responseRules.forEach(r => { condition(r.when); ref('responses', r.response); });
    });
    d.theories.forEach(t => { t.contestedIssues.forEach(id => ref('issues', id)); t.preferredPlans.forEach(id => ref('argumentPlans', id)); });
    ensure(d.resolutionRules.length && Object.keys(d.resolutionRules.at(-1).when).length === 0, 'Missing resolution fallback');
    ensure(new Set(d.resolutionRules.map(r => r.code)).size === d.resolutionRules.length, 'Duplicate resolution code');
    d.resolutionRules.forEach(r => condition(r.when));
    return true;
  }
  const recordIds = s => s.records.evidence.map(r => r.propositionId);
  function tagCounts(d, ids) {
    const counts = Object.create(null);
    for (const id of ids) for (const tag of find(d.propositions, id).tags) counts[tag] = (counts[tag] || 0) + 1;
    return counts;
  }
  function matches(d, s, c) {
    const ids = recordIds(s), recorded = tagCounts(d, ids), selected = tagCounts(d, s.selected);
    const has = (actual, needed) => Object.entries(needed || {}).every(([tag, n]) => (actual[tag] || 0) >= n);
    return (!c.any || c.any.some(v => matches(d, s, v))) &&
      (!('pressed' in c) || c.pressed === (s.presses.length > 0)) &&
      (c.absent || []).every(id => !ids.includes(id)) &&
      (c.absentTags || []).every(t => !recorded[t]) && has(recorded, c.recordTags) && has(selected, c.selectedTags);
  }
  function argument(d, s) {
    const p = find(d.argumentPlans, s.planId);
    const valid = !!p && s.selected.length >= p.min && s.selected.length <= p.max &&
      new Set(s.selected).size === s.selected.length && s.selected.every(id => recordIds(s).includes(id) && p.premises.includes(id));
    return { valid, plan: p, reason: valid ? '' : '기록된 호환 전제 2–4개를 선택하세요.' };
  }
  function availability(d, s) {
    const active = s.phase === 'examine', a = argument(d, s);
    const duplicateFrame = s.records.advocacy.some(r => r.kind === 'argument' && r.planId === s.planId && r.theoryId === s.theoryId && [...r.premises].sort().join('|') === [...s.selected].sort().join('|'));
    return { establish: active, select: active, strategy: s.phase !== 'resolved', press: active && a.valid, frame: active && a.valid && !duplicateFrame, stop: active,
      goals: d.goals.map(g => ({ id: g.id, available: active && !s.asked.includes(g.id) })),
      premises: d.propositions.map(p => ({ id: p.id, available: active && recordIds(s).includes(p.id) && a.plan.premises.includes(p.id) && (s.selected.includes(p.id) || s.selected.length < a.plan.max) })) };
  }
  function response(d, s) { const p = argument(d, s).plan; return find(d.responses, p.responseRules.find(r => matches(d, s, r.when)).response); }
  function resolve(d, s) {
    const rule = d.resolutionRules.find(r => matches(d, s, r.when));
    return { type: 'adjudicated', scope: find(d.argumentPlans, s.planId).issue, code: rule.code, title: rule.title, text: rule.text,
      evidenceRefs: s.records.evidence.map(r => r.id), advocacyRefs: s.records.advocacy.map(r => r.id), limitation: d.resolutionNotice };
  }
  const api = { copy, find, ensure, validate, recordIds, argument, availability, response, resolve, types };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmEngine = api;
})(globalThis);
