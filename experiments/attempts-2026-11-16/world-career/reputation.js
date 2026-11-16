'use strict';
const pack = require('./packs/ko-career');
const { clamp } = require('./data');
const cfg = pack.reputation, config = pack.experiment;
const stars = value => clamp(Math.round(value * 2) / 2, 0.5, 5);
function titleFor(person, firm) {
  if (person.role !== 'lawyer') return person.role;
  if (person.years < cfg.rookieYears) return 'rookie';
  if (person.partnershipTrack && ['large', 'medium'].includes(firm?.sector) && person.years >= cfg.partnerYears) return 'partner';
  if (firm?.sector === 'outside') return person.years >= cfg.soloSeniorYears ? 'principal' : 'solo';
  return person.years >= cfg.seniorYears ? 'senior' : 'associate';
}
function initialReputation(years, formerOffice, role, title = role === 'lawyer' ? 'rookie' : role) {
  const initial = cfg.titles[title][1];
  return { initial, value: initial, durable: initial, flash: 0, peak: initial, titleFloor: initial,
    lastActive: null, field: null, evidence: [] };
}
function refresh(person) {
  const r = person.reputation;
  r.durable = clamp(Math.max(r.durable, r.titleFloor, r.peak * cfg.peakRetention), 0.5, 5);
  r.peak = Math.max(r.peak, r.durable);
  r.value = clamp(r.durable + r.flash, Math.max(0.5, r.titleFloor, r.peak * cfg.peakRetention), 5);
}
function promote(person, firm) {
  const title = titleFor(person, firm); person.title = title;
  person.reputation.titleFloor = Math.max(person.reputation.titleFloor, cfg.titles[title][1]);
  refresh(person);
}
function evaluate(record, role = 'lawyer') {
  const actual = config.resultValue[record.outcome], forecast = config.forecastExpectation[record.forecast];
  if (actual === undefined || forecast === undefined || !config.gradeWeight[record.grade]) throw Error('unsupported reputation input');
  const expected = forecast * (1 - config.referenceExpectationWeight) + pack.baseline.acquittal * config.referenceExpectationWeight;
  return (role === 'prosecutor' ? expected - actual : actual - expected) * config.fameGain * config.gradeWeight[record.grade]
    * record.attention * (0.75 + record.opponentStars / 5);
}
function applyRecord(person, record, role = 'lawyer') {
  const delta = evaluate(record, role), r = person.reputation;
  r.durable += delta * cfg.durableShare; r.flash += delta * (1 - cfg.durableShare);
  r.lastActive = record.week;
  r.evidence.push({ caseId: record.id, week: record.week, delta, role, field: record.archetype });
  refresh(person);
}
function applyRoutine(person, summary) {
  if (!summary.count) return;
  const delta = cfg.routineRate * Math.min(1, summary.count / 12) * (summary.achieved / summary.count - cfg.routineReference);
  person.reputation.durable += delta; person.reputation.lastActive = summary.week;
  person.reputation.evidence.push({ eventId: summary.id, week: summary.week, delta, kind: 'routine', count: summary.count, achieved: summary.achieved });
  refresh(person);
}
function decay(person, week) {
  const r = person.reputation;
  if (r.lastActive === null || week - r.lastActive >= 52) r.durable -= cfg.slowDecay;
  r.flash *= cfg.flashRetention;
  refresh(person);
}
function firmStars(state, firm) {
  const members = state.people.filter(p => p.role === 'lawyer' && p.firmId === firm.id && p.active);
  const mean = members.length ? members.reduce((sum, p) => sum + p.reputation.value, 0) / members.length : 0.5;
  const history = firm.caseMerit || { total: 0, count: 0 };
  const c = pack.firmReputation;
  const size = 0.5 + 4.5 * Math.min(1, Math.log1p(members.length) / Math.log1p(c.sizeFullStaff));
  return stars(mean * c.memberWeight + size * c.sizeWeight
    + history.total / (history.count + c.recordPriorCount) * c.recordWeight);
}
module.exports = { stars, initialReputation, evaluate, applyRecord, applyRoutine, decay, firmStars, titleFor, promote, refresh };
