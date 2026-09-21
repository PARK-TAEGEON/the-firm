(function (root) {
  'use strict';
  const types = ['ADMIT', 'RESIST', 'EVADE', 'EXPLAIN', 'CONTRADICT'];
  const inferenceStrengths = ['limited', 'strong', 'compelling'];
  const informationTypes = ['favorable', 'mixed', 'risky', 'unknown'];
  const copy = value => JSON.parse(JSON.stringify(value));
  const find = (list, id) => list.find(item => item.id === id);
  function ensure(condition, message) { if (!condition) throw new Error(message); }
  function validate(d) {
    const collections = ['parties', 'issues', 'theories', 'witnesses', 'evidence', 'propositions', 'goals', 'responses', 'argumentPlans', 'counterResponses'];
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
    ensure(!d.counterResponses.length || d.profile.actions.includes('counter'), 'Missing counter action');
    const ref = (key, id) => ensure(find(d[key], id), 'Unknown ' + key + ' reference: ' + id);
    ensure(d.caseProfile && ['factualComplexity', 'legalComplexity', 'proceduralComplexity', 'adversarialIntensity'].every(key => typeof d.caseProfile[key] === 'string' && d.caseProfile[key]), 'Invalid case profile');
    d.propositions.forEach(p => {
      ensure(Array.isArray(p.tags) && new Set(p.tags).size === p.tags.length && p.tags.every(t => typeof t === 'string'), 'Invalid tags');
      if (p.side === 'counter') ensure(['contestable', 'hard'].includes(p.counterType) && typeof p.counterNote === 'string' && p.counterNote, 'Invalid counter metadata');
      if (p.qualifies) { ref('propositions', p.qualifies); ensure(find(d.propositions, p.qualifies).side === 'counter', 'Qualification must target counter'); }
    });
    d.parties.forEach(p => ensure(d.profile.roles[p.role], 'Unknown party role'));
    d.responses.forEach(r => { ensure(types.includes(r.type), 'Unknown response type'); r.adds.forEach(id => ref('propositions', id)); });
    d.goals.forEach(g => { ref('responses', g.response); g.basis.forEach(id => ref('evidence', id)); ensure(find(d.responses, g.response).adds.length, 'Unproductive goal'); ensure(informationTypes.includes(g.informationType), 'Invalid information type'); });
    const obtainable = new Set(d.goals.flatMap(g => find(d.responses, g.response).adds));
    const tags = new Set(d.propositions.flatMap(p => p.tags));
    function condition(c, recordOnly = false) {
      const allowed = recordOnly ? ['any', 'absent', 'recordTags', 'absentTags', 'frameStrength'] : ['any', 'repeated', 'absent', 'selectedTags', 'recordTags', 'absentTags'];
      ensure(c && Object.keys(c).every(k => allowed.includes(k)), 'Unknown rule condition');
      if (c.any) { ensure(c.any.length > 0, 'Empty rule alternatives'); c.any.forEach(child => condition(child, recordOnly)); }
      if ('repeated' in c) ensure(typeof c.repeated === 'boolean', 'Invalid boolean condition');
      if ('frameStrength' in c) ensure(inferenceStrengths.includes(c.frameStrength), 'Invalid frame strength');
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
      ensure(Array.isArray(p.inferenceVariants) && p.inferenceVariants.length > 0, 'Missing inference variants');
      const signatures = new Set();
      p.inferenceVariants.forEach(v => {
        ensure(typeof v.id === 'string' && v.id && !ids.has(v.id), 'Duplicate or invalid inference ID'); ids.add(v.id);
        ensure(typeof v.title === 'string' && v.title && typeof v.text === 'string' && v.text, 'Invalid inference text');
        ensure(inferenceStrengths.includes(v.strength), 'Invalid inference strength');
        ensure(Array.isArray(v.premises) && v.premises.length >= p.min && v.premises.length <= p.max && new Set(v.premises).size === v.premises.length && v.premises.every(id => p.premises.includes(id)), 'Invalid inference premises');
        const signature = [...v.premises].sort().join('|'); ensure(!signatures.has(signature), 'Duplicate inference premises'); signatures.add(signature);
      });
      ensure(p.responseRules.length && Object.keys(p.responseRules.at(-1).when).length === 0, 'Missing response fallback');
      p.responseRules.forEach(r => { condition(r.when); ref('responses', r.response); });
    });
    d.counterResponses.forEach(c => { ref('propositions', c.target); ref('responses', c.response); ensure(find(d.propositions, c.target).side === 'counter', 'Response target must be a counter'); c.requires.forEach(id => { ref('propositions', id); ensure(obtainable.has(id), 'Unreachable counter basis'); }); ensure(c.requires.length > 0 && new Set(c.requires).size === c.requires.length, 'Invalid counter basis'); ensure(find(d.responses, c.response).adds.some(id => find(d.propositions, id).qualifies === c.target), 'Missing linked qualification'); ensure(d.responses.some(r => r.adds.includes(c.target) && d.argumentPlans.some(p => p.responseRules.some(rule => rule.response === r.id))), 'Unreachable counter'); });
    d.propositions.filter(p => p.counterType === 'hard').forEach(p => ensure(!d.counterResponses.some(c => c.target === p.id), 'Hard counter cannot have an immediate response route'));
    d.theories.forEach(t => { t.contestedIssues.forEach(id => ref('issues', id)); t.preferredPlans.forEach(id => ref('argumentPlans', id)); t.conflictTags.forEach(tag => ensure(tags.has(tag), 'Unknown conflict tag')); });
    ensure(d.resolutionRules.length && Object.keys(d.resolutionRules.at(-1).when).length === 0, 'Missing resolution fallback');
    ensure(new Set(d.resolutionRules.map(r => r.code)).size === d.resolutionRules.length, 'Duplicate resolution code');
    d.resolutionRules.forEach(r => condition(r.when, true));
    return true;
  }
  const recordIds = s => s.records.evidence.map(r => r.propositionId);
  function tagCounts(d, ids) {
    const counts = Object.create(null);
    for (const id of ids) for (const tag of find(d.propositions, id).tags) counts[tag] = (counts[tag] || 0) + 1;
    return counts;
  }
  function matches(context, c) {
    const { ids, recorded, selected = {}, repeated = false, frameStrength = null } = context;
    const has = (actual, needed) => Object.entries(needed || {}).every(([tag, n]) => (actual[tag] || 0) >= n);
    return (!c.any || c.any.some(v => matches(context, v))) &&
      (!('repeated' in c) || c.repeated === repeated) && (!('frameStrength' in c) || c.frameStrength === frameStrength) &&
      (c.absent || []).every(id => !ids.includes(id)) &&
      (c.absentTags || []).every(t => !recorded[t]) && has(recorded, c.recordTags) && has(selected, c.selectedTags);
  }
  function pressure(d, s) {
    const target = d.witnesses[0].id;
    const signature = JSON.stringify([s.planId, target, [...s.selected].sort()]);
    const prior = s.presses.filter(p => p.planId === s.planId && p.target === target);
    const repeated = prior.some(p => s.selected.every(id => p.premises.includes(id)));
    const reinforced = !repeated && prior.some(p => p.premises.length < s.selected.length && p.premises.every(id => s.selected.includes(id)));
    return { signature, target, kind: repeated ? 'repeated' : reinforced ? 'reinforced' : prior.length ? 'new_basis' : 'first' };
  }
  function counterOptions(d, s) {
    const ids = recordIds(s);
    return d.counterResponses.map(c => ({ id: c.id, target: c.target, visible: ids.includes(c.target),
      available: s.phase === 'examine' && !s.pendingQuestion && ids.includes(c.target) && c.requires.every(id => ids.includes(id)) && !find(d.responses, c.response).adds.every(id => ids.includes(id)),
      completed: find(d.responses, c.response).adds.every(id => ids.includes(id)), missing: c.requires.filter(id => !ids.includes(id)) }));
  }
  function argument(d, s) {
    const p = find(d.argumentPlans, s.planId);
    const signature = [...s.selected].sort().join('|');
    const inference = p?.inferenceVariants.find(v => [...v.premises].sort().join('|') === signature) || null;
    const valid = !!p && !!inference && s.selected.length >= p.min && s.selected.length <= p.max &&
      new Set(s.selected).size === s.selected.length && s.selected.every(id => recordIds(s).includes(id) && p.premises.includes(id));
    return { valid, plan: p, inference, reason: valid ? '' : s.selected.length >= (p?.min || 2) ? '이 조합으로 만들 수 있는 논증이 없습니다.' : '기록된 호환 전제 2–4개를 선택하세요.' };
  }
  function availability(d, s) {
    const active = s.phase === 'examine' && !s.pendingQuestion, a = argument(d, s);
    const duplicateFrame = s.records.advocacy.some(r => r.kind === 'argument' && r.planId === s.planId && r.theoryId === s.theoryId && r.inferenceId === a.inference?.id);
    return { establish: active, select: active, strategy: s.phase !== 'resolved' && !s.pendingQuestion, press: active && a.valid, frame: active && a.valid && !duplicateFrame, stop: active, counter: active && counterOptions(d, s).some(c => c.available), counters: counterOptions(d, s),
      respond: s.pendingQuestion?.stage === 'objection', address: s.pendingQuestion?.stage === 'address', answer: s.pendingQuestion?.stage === 'answer',
      goals: d.goals.map(g => ({ id: g.id, available: active && !s.asked.includes(g.id) && find(d.responses, g.response).adds.some(id => !recordIds(s).includes(id)) })),
      premises: d.propositions.map(p => ({ id: p.id, available: active && recordIds(s).includes(p.id) && a.plan.premises.includes(p.id) && (s.selected.includes(p.id) || s.selected.length < a.plan.max) })) };
  }
  function response(d, s) { const p = argument(d, s).plan, ids = recordIds(s); const context = { ids, recorded: tagCounts(d, ids), selected: tagCounts(d, s.selected), repeated: pressure(d, s).kind === 'repeated' }; return find(d.responses, p.responseRules.find(r => matches(context, r.when)).response); }
  // This entry point accepts only a court record snapshot and a theory identifier.
  // Lane selections, questions and transient press history cannot affect evaluation.
  function evaluateRecord(d, records, theoryId) {
    const ids = records.evidence.map(r => r.propositionId), theory = find(d.theories, theoryId);
    const qualified = records.evidence.filter(r => {
      const p = find(d.propositions, r.propositionId), target = records.evidence.find(e => e.id === r.qualifiesRecordId);
      const route = find(d.counterResponses, r.source);
      return p.qualifies && target?.propositionId === p.qualifies && route?.target === p.qualifies &&
        route.requires.every(id => records.evidence.some(e => e.propositionId === id && r.premiseRefs?.includes(e.id)));
    }).map(r => r.qualifiesRecordId);
    const counters = records.evidence.filter(r => find(d.propositions, r.propositionId).side === 'counter');
    const activeCounters = counters.filter(r => !qualified.includes(r.id));
    const counts = tagCounts(d, records.evidence.filter(r => !qualified.includes(r.id)).map(r => r.propositionId));
    const framedArguments = records.advocacy.filter(r => {
      const plan = find(d.argumentPlans, r.planId);
      const inference = plan?.inferenceVariants.find(v => v.id === r.inferenceId);
      return r.kind === 'argument' && plan && r.issue === plan.issue && Array.isArray(r.premises) && r.premises.length >= plan.min && r.premises.length <= plan.max &&
        inference && [...inference.premises].sort().join('|') === [...r.premises].sort().join('|') &&
        new Set(r.premises).size === r.premises.length && r.premises.every(id => plan.premises.includes(id) && ids.includes(id));
    }).map(r => { const plan = find(d.argumentPlans, r.planId), inference = plan.inferenceVariants.find(v => v.id === r.inferenceId); return { recordId: r.id, planId: plan.id, issue: plan.issue,
      inferenceId: inference.id, title: inference.title, text: inference.text, strength: inference.strength,
      value: theory?.contestedIssues.includes(plan.issue) ? (theory.preferredPlans.includes(plan.id) ? 'core' : 'relevant') : 'peripheral',
      status: activeCounters.length ? 'contested' : 'supported', reusable: true }; });
    const admissionRefs = records.evidence.filter(r => find(d.propositions, r.propositionId).tags.includes('concession')).map(r => r.id);
    const conflicts = counters.filter(r => find(d.propositions, r.propositionId).tags.some(t => theory?.conflictTags.includes(t))).map(r => ({ recordId: r.id, propositionId: r.propositionId, qualified: qualified.includes(r.id) }));
    const scope = d.argumentPlans[0].issue;
    const developed = framedArguments.some(a => a.value !== 'peripheral') || (admissionRefs.length > 0 && theory?.contestedIssues.includes(scope));
    const argumentFrames = records.advocacy.filter(r => r.kind === 'argument');
    const majorCommitments = records.advocacy.filter(r => r.kind === 'major_commitment');
    const commitmentReviewRefs = majorCommitments.filter(r => !theory?.contestedIssues.includes(r.issue) || activeCounters.length > 0).map(r => r.id);
    const strategy = { theoryId, priorityIssues: theory?.contestedIssues || [], framedArguments,
      development: developed ? (activeCounters.length ? 'contested' : 'developed') : framedArguments.length || admissionRefs.length ? 'peripheral' : 'facts_only',
      unresolvedIssues: (theory?.contestedIssues || []).filter(issue => issue !== scope || !developed || activeCounters.length > 0), conflicts,
      argumentFrameRefs: argumentFrames.map(r => r.id), majorCommitmentRefs: majorCommitments.map(r => r.id), commitmentReviewRefs,
      positionStatus: commitmentReviewRefs.length ? 'review_required' : majorCommitments.length ? 'committed' : 'no_major_commitment' };
    const rank = value => inferenceStrengths.indexOf(value);
    const frameStrength = framedArguments.reduce((best, item) => rank(item.strength) > rank(best) ? item.strength : best, null);
    const rule = d.resolutionRules.find(r => matches({ ids, recorded: counts, frameStrength }, r.when));
    return { type: 'adjudicated', scope, code: rule.code, title: rule.title, text: rule.text,
      evidenceRefs: records.evidence.map(r => r.id), advocacyRefs: records.advocacy.map(r => r.id), admissionRefs,
      activeCounterRefs: activeCounters.map(r => r.id), qualifiedCounterRefs: qualified, framedArguments, strategy, limitation: d.resolutionNotice };
  }
  const resolve = (d, s) => evaluateRecord(d, s.records, s.theoryId);
  const api = { copy, find, ensure, validate, recordIds, argument, availability, pressure, response, evaluateRecord, resolve, types, inferenceStrengths };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmEngine = api;
})(globalThis);
