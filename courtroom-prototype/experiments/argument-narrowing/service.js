(function (root) {
'use strict';
const D = typeof module !== 'undefined' && module.exports ? require('./data') : root.FirmNarrowingData;
const clone = x => JSON.parse(JSON.stringify(x));
function matches(r, rule) {
  return r.kind === rule.kind && r.refId === rule.ref && !r.blockedReason &&
    (!rule.admitted || r.opinion === 'agree') && (!rule.success || r.succeeded === true) &&
    (!rule.ruling || r.ruling === rule.ruling);
}
function project(records) {
  const claim = records.find(r => r.kind === 'argument_claim') ||
    records.find(r => r.kind === 'press' && r.refId === D.overreachRef);
  const revision = records.find(r => r.kind === 'argument_revision');
  const rows = rules => records.flatMap(r => rules.filter(rule => matches(r, rule)).map(rule => ({
    id: r.id, text: rule.useMemo ? r.memo : rule.text, lines: r.lines || [], ruleId: rule.id,
    qualifiedBy: rule.qualificationRef ? records.filter(q => q.kind === 'rebuttal' && q.refId === rule.qualificationRef && !q.blockedReason).map(q => q.id) : []
  })));
  const response = records.find(r => r.kind === 'argument_response');
  return clone({ version: D.version, claim, revision, response, facts: rows(D.facts),
    bases: rows(D.bases), counters: rows(D.counters), strong: D.strong, narrow: D.narrow,
    withdrawn: D.withdrawn, reservation: D.reservation, finalId: D.finalId, retainId: D.retainId });
}
function claim(s, push) {
  if (s.phase !== 'opening' || project(s.records).claim) throw new Error('모두진술에서 한 번만 선언할 수 있습니다.');
  push(s, { kind: 'argument_claim', source: 'defense', definitionVersion: D.version,
    memo: '상해 인과관계 전면 부정', lines: [{ speaker: 'DEFENSE', text: D.strong }] });
}
function revise(s, payload, push) {
  const p = project(s.records), ids = payload.basisIds;
  if (s.phase !== 'trial' || s.cursor.part !== 'closing' || s.pending || !p.claim || p.revision)
    throw new Error('기존 인과관계 부정 주장은 최후변론 전에 한 번만 수정할 수 있습니다.');
  if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length ||
      ids.some(id => !p.bases.some(b => b.id === id))) throw new Error('법정에서 확인된 서로 다른 근거를 선택하십시오.');
  if (payload.acknowledgeCounters !== true) throw new Error('남은 반론을 확인하십시오.');
  // Canonical record order, independent of checkbox order; no court facts/effects are changed.
  const bases = p.bases.filter(b => ids.includes(b.id));
  const revision = push(s, { kind: 'argument_revision', source: 'defense', definitionVersion: D.version,
    revises: p.claim.id, basisIds: bases.map(b => b.id), factIds: p.facts.map(f => f.id),
    counterIds: p.counters.map(c => c.id), memo: '주장 범위 축소 — 입증 충분성 다툼',
    lines: [{ speaker: 'DEFENSE', text: D.withdrawn + ' ' + D.narrow + ' ' + D.reservation }] });
  push(s, { kind: 'argument_response', source: 'prosecution', respondsTo: revision.id,
    basisIds: p.facts.map(f => f.id), counterIds: p.counters.map(c => c.id),
    memo: '검사: 수정 뒤에도 남는 반론',
    lines: [{ speaker: 'PROSECUTOR', text: p.bases.some(b => s.records.find(r => r.id === b.id)?.kind === 'rebuttal') ? D.rebuttalResponse :
      p.facts.some(f => s.records.find(r => r.id === f.id)?.refId === D.injuryRef) ? D.response : D.limitedResponse }] });
}
function closing(records, id) {
  const p = project(records);
  if (id === D.retainId) {
    if (!p.claim || p.revision) throw new Error('유지할 기존 주장이 없습니다.');
    return { id, basis: 'cause', title: '기존 인과관계 부정 유지', claimId: p.claim.id, text: D.strong };
  }
  if (id !== D.finalId) return null;
  if (!p.revision) throw new Error('먼저 주장 범위를 수정하십시오.');
  const chosen = p.bases.filter(b => p.revision.basisIds.includes(b.id));
  const facts = p.facts.length ? '법정 기록에서 확인한 내용: ' + p.facts.map(f => f.text).join(' ') : '';
  const counter = p.counters.length ? '남는 반론: ' + p.counters.map(c => c.text + (c.qualifiedBy.length ? ' 다만 다른 낙상 경로의 미검토가 확인되었습니다.' : '')).join(' ') : '';
  return { id, basis: 'cause', title: '수정한 논증으로 최후변론', revisionId: p.revision.id,
    basisIds: p.revision.basisIds, responseId: p.response.id,
    text: [D.withdrawn, facts, ...chosen.map(b => b.text + '.'), counter,
      '검사의 대응: ' + p.response.lines[0].text, D.reservation, D.closingRequest].filter(Boolean).join(' ') };
}
const api = { project, claim, revise, closing };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmNarrowing = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
