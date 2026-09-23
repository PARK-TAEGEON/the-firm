(function(root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./core') : root.FirmEngine;
  function validate(d) {
    if (!d.opening) return;
    E.ensure(d.profile.actions.includes('opening') && d.profile.phases.opening, 'Missing opening flow');
    const ids = new Set();
    const collect = value => { if (!value || typeof value !== 'object') return; if (value.id) ids.add(value.id); Object.values(value).forEach(collect); };
    for (const [key,value] of Object.entries(d)) if(key!=='opening') collect(value);
    ids.add(d.id);
    for (const c of d.opening.options) {
      E.ensure(c.id && !ids.has(c.id) && c.label && c.text, 'Invalid opening option'); ids.add(c.id);
      E.ensure(['admit','contest','emphasize','introduce'].includes(c.group) && E.find(d.issues,c.issue), 'Invalid opening issue/group');
      if(c.planId) E.ensure(E.find(d.argumentPlans,c.planId)?.issue===c.issue,'Invalid opening plan');
      if(c.position) E.ensure(typeof c.position.key==='string' && typeof c.position.value==='string','Invalid opening position');
    }
    for (const t of d.theories) E.ensure(t.workingPositions && Object.values(t.workingPositions).every(v=>typeof v==='string'),'Missing working positions');
  }
  function selection(d, ids) {
    E.ensure(Array.isArray(ids) && ids.length && new Set(ids).size===ids.length,'공개할 입장을 선택하십시오.');
    const choices=ids.map(id=>E.find(d.opening.options,id));
    E.ensure(choices.every(Boolean),'알 수 없는 개회사 입장입니다.');
    const positions=new Map();
    for(const c of choices) if(c.position) {
      E.ensure(!positions.has(c.position.key)||positions.get(c.position.key)===c.position.value,'서로 모순되는 입장은 함께 공개할 수 없습니다.');
      positions.set(c.position.key,c.position.value);
    }
    return d.opening.options.filter(c=>ids.includes(c.id));
  }
  function conflicts(d,records,theoryId) {
    const positions=E.find(d.theories,theoryId)?.workingPositions||{};
    return records.advocacy.filter(c=>c.kind==='major_commitment' && c.position && Object.hasOwn(positions,c.position.key) && positions[c.position.key]!==c.position.value);
  }
  // All public positions and links are derived from persisted records, never UI draft/history.
  function replay(d,records,theoryId) {
    const opening=records.advocacy.find(r=>r.kind==='opening_position')||null;
    const revisions=records.advocacy.filter(r=>r.kind==='strategy_revision');
    const currentTheoryId=theoryId||revisions.at(-1)?.theoryId||opening?.theoryId||null;
    const theory=E.find(d.theories,currentTheoryId);
    const commitments=records.advocacy.filter(r=>r.kind==='major_commitment');
    return E.copy({opening,commitments,revisions,conflicts:records.advocacy.filter(r=>r.kind==='commitment_conflict'),
      activeConflictRefs:conflicts(d,records,currentTheoryId).map(c=>c.id),theoryId:currentTheoryId,
      workingStrategy:theory?.workingStrategy||null,clientObjectives:d.clientObjectives,
      links:commitments.map(c=>({commitmentRef:c.id,issue:c.issue,
        priority:theory?.contestedIssues.includes(c.issue)?'core':'peripheral',
        arguments:records.advocacy.filter(a=>a.kind==='argument'&&a.issue===c.issue).map(a=>({recordRef:a.id,planId:a.planId,
          evidenceRefs:records.evidence.filter(e=>a.premises.includes(e.propositionId)&&E.find(d.propositions,e.propositionId)?.planId===a.planId).map(e=>e.id)}))}))});
  }
  const api={validate,selection,conflicts,replay};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FirmOpening=api;
})(globalThis);
