'use strict';
// Hooks inside WORLD's weekly engine; no second clock or cohort replacement.
const pack = require('./packs/ko-career');
const { random, FIRMS } = require('./data');
const fame = require('./reputation');
const names = require('./names');
const { generator } = require('./generator-source');
const { makeRecord } = require('./case-records');
const pick = (s, values) => values[random(s, values.length)];
const live = p => ['working', 'leave'].includes(p.status);
function quotas(rows, total) {
  const sum = rows.reduce((n, r) => n + r.count, 0), exact = rows.map(r => total * r.count / sum), result = exact.map(Math.floor);
  const order = exact.map((v, i) => i).sort((a, b) => exact[b] % 1 - exact[a] % 1 || a - b);
  const remainder = total - result.reduce((a, b) => a + b, 0);
  for (let i = 0; i < remainder; i++) result[order[i]]++;
  return result;
}
function registerPerson(s, p) {
  p.name = names.personName(s, p.age);
  p.years = Math.max(0, p.age - pack.population.entryAge); p.active = live(p);
  p.specialtyTag = pick(s, pack.specialties); p.city = pick(s, s.careerCities);
  p.partnershipTrack = random(s, 100) < pack.reputation.partnershipTrackPercent;
  p.title = fame.titleFor(p, s.firms.find(f => f.id === p.firmId));
  p.practice = { years: p.years, focus: random(s, 2) };
  p.reputation = fame.initialReputation(p.years, p.formerOffice, p.role, p.title);
  p.routine = { count: 0, achieved: 0 }; p.origin = { years: p.years, title: p.title, firmId: p.firmId, week: s.week };
}
function registerFirm(s, f) {
  f.name = names.firmName(s); f.sector ||= 'outside'; f.caseMerit = { total: 0, count: 0 };
}
function initialize(s, api) {
  s.records = []; s.annual = []; s.startWeek = s.career.warmupYears * 52; s.playerId = null;
  s.careerCities = quotas(pack.population.cities, pack.population.lawyers).flatMap((n, i) => Array(n).fill(pack.population.cities[i].name));
  const cities = [...s.careerCities];
  for (let i = cities.length - 1; i > 0; i--) { const j = random(s, i + 1); [cities[i], cities[j]] = [cities[j], cities[i]]; }
  const counts = quotas(pack.population.sectors, pack.population.lawyers);
  for (const [index, sector] of pack.population.sectors.entries()) {
    const firms = Array.from({ length: sector.firms }, () => api.addFirm(s, { ...FIRMS[index === 0 ? 1 : index === 1 ? 3 : index === 2 ? 0 : 4], sector: sector.id }));
    for (let n = 0; n < counts[index]; n++) {
      let roll = random(s, 100); const band = pack.population.tenureBands.find(b => (roll -= b.weight) < 0);
      const years = band.min + random(s, band.max - band.min + 1);
      const p = api.addPerson(s, 'lawyer', pack.population.entryAge + years, firms[n % firms.length].id);
      p.city = cities.pop();
    }
  }
  for (const role of ['judge', 'prosecutor']) for (let n = 0; n < pack.population[`${role}s`]; n++) {
    const [min, max] = pack.population.initialOfficeYears;
    api.addPerson(s, role, pack.population.entryAge + min + random(s, max - min + 1));
  }
  s.initialFirmCount = s.firms.length;
  api.emit(s, 'world_started', { seed: s.seed, population: s.people.length });
}
function beginPlay(s, api) {
  const f = api.addFirm(s, { ...FIRMS[4], sector: 'outside' });
  const p = api.addPerson(s, 'lawyer', pack.population.entryAge, f.id);
  s.playerId = p.id; p.city = pack.population.cities[0].name;
}
function sync(s, api) {
  for (const p of s.people) {
    p.active = live(p); p.years = Math.max(0, p.age - pack.population.entryAge); p.practice.years = p.years;
    if (!p.active) continue;
    const previous = p.title; fame.promote(p, s.firms.find(f => f.id === p.firmId));
    if (previous !== p.title) api.emit(s, 'career_title', { personIds: [p.id], title: p.title, fromTitle: previous, firmId: p.firmId });
  }
  for (const f of s.firms) f.reputation = fame.firmStars(s, f) * 20;
}
function completeRoutine(s, p, f, outcome) { p.routine.count++; p.routine.achieved += Number(outcome.achieved); }
function assignmentWeight(p, specialty) {
  const c = pack.assignment;
  return Math.round((c.minimumWeight + fame.stars(p.reputation.value) * c.starWeight)
    * (p.specialtyTag === specialty ? c.specialtyMultiplier : 1));
}
function assignLawyer(s, lawyers, specialty) {
  const weights = lawyers.map(p => assignmentWeight(p, specialty));
  let draw = random(s, weights.reduce((a,b) => a+b,0));
  return lawyers[weights.findIndex(w => (draw -= w) < 0)];
}
function movementCooldown(p) {
  return p.title === 'partner' && p.years >= pack.mobility.partnerYears ? pack.mobility.partnerCooldownWeeks : 0;
}
function afterWeek(s, api) {
  sync(s, api);
  const warmup = s.week <= s.startWeek, count = warmup ? pack.experiment.warmupCases : pack.experiment.annualCases;
  const localWeek = (s.week - 1) % 52;
  const scheduled = Math.floor((localWeek + 1) * count / 52) > Math.floor(localWeek * count / 52);
  if (scheduled) {
    const lawyers = s.people.filter(p => p.status === 'working' && p.role === 'lawyer' && p.firmId);
    const judges = s.people.filter(p => p.status === 'working' && p.role === 'judge');
    const prosecutors = s.people.filter(p => p.status === 'working' && p.role === 'prosecutor');
    if (lawyers.length && judges.length && prosecutors.length) {
      // All currently supported GEN archetypes are criminal trials. The field
      // affects client selection only, never trial policy or adjudication.
      const specialty = pack.assignment.defaultSpecialty;
      const lawyer = assignLawyer(s, lawyers, specialty), judge = pick(s, judges), prosecutor = pick(s, prosecutors);
      const firm = s.firms.find(f => f.id === lawyer.firmId), grade = s.records.length % 3 === 0 ? 'major' : 'contested';
      const record = makeRecord({ id: `WC${String(s.records.length + 1).padStart(6, '0')}`, week: s.week,
        archetype: pick(s, generator().catalog).id, seed: random(s, 0x100000000), grade,
        parties: { firm: firm.id, lawyer: lawyer.id, judge: judge.id, prosecutor: prosecutor.id, court: pack.labels.court, prosecution: pack.labels.prosecution },
        actorName: lawyer.name, previousRecords: s.records, practice: lawyer.practice, opponentStars: fame.stars(prosecutor.reputation.value),
        defenderStars: fame.stars(lawyer.reputation.value), attention: grade === 'major' ? 1.25 : 1 });
      record.assignment = { specialty, weight: assignmentWeight(lawyer, specialty), stars: fame.stars(lawyer.reputation.value), specialtyTag: lawyer.specialtyTag };
      s.records.push(record); fame.applyRecord(lawyer, record);
      fame.applyRecord(prosecutor, { ...record, opponentStars: record.defenderStars }, 'prosecutor');
      firm.caseMerit.total += fame.evaluate(record); firm.caseMerit.count++;
      api.emit(s, 'career_case', { personIds: [lawyer.id, judge.id, prosecutor.id], firmId: firm.id, caseId: record.id, outcome: record.official.verdict });
    }
  }
  if (s.week % 52 === 0) {
    for (const p of s.people) {
      if (p.routine.count) {
        const summary = api.emit(s, 'routine_performance', { personIds: [p.id], ...p.routine, visibility: 'public' });
        fame.applyRoutine(p, summary); p.routine = { count: 0, achieved: 0 };
      }
      fame.decay(p, s.week);
    }
    sync(s, api);
    const records = s.records.filter(r => r.week > s.week - 52);
    s.annual.push({ fromWeek: s.week - 52, toWeek: s.week, warmup, engineCount: records.length, routineCases: s.yearCases,
      distribution: starDistribution(s), lawyers: s.people.filter(p => p.active && p.role === 'lawyer').length,
      hires: s.firms.reduce((n, f) => n + f.yearHires + f.springHires, 0), transfers: s.yearTransfers,
      openings: s.yearOpenings, closures: s.yearClosures, leaves: s.yearLeaveStarts });
  }
}
function starDistribution(s) {
  const people = s.people.filter(p => p.active && p.role === 'lawyer');
  const counts = [0, 0, 0]; for (const p of people) { const v = fame.stars(p.reputation.value); counts[v <= 1.5 ? 0 : v <= 3 ? 1 : 2]++; }
  return counts.map(n => people.length ? n / people.length : 0);
}
module.exports = { initialize, registerPerson, registerFirm, beginPlay, afterWeek, completeRoutine, sync, starDistribution, quotas, assignmentWeight, assignLawyer, movementCooldown };
