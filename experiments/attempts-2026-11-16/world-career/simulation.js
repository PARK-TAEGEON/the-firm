'use strict';

const { FIRMS, TYPES, FEES, LEAVES, MOTIVES, KO, clamp, calendar, random } = require('./data');
const policy = KO.policy;
const careerHooks = require('./career-simulation');
const activeFirms = s => s.firms.filter(f => !f.closedWeek);
const live = p => p.status === 'working' || p.status === 'leave';
const working = p => p.status === 'working';
const staff = (s, id) => s.people.filter(p => live(p) && p.role === 'lawyer' && p.firmId === id);
const byId = (a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

function emit(s, type, detail = {}) {
  const event = { id: `E${String(s.nextEvent++).padStart(7, '0')}`, week: s.week, type, ...detail };
  s.events.push(event);
  for (const id of event.personIds || []) {
    s.people[Number(id.slice(1)) - 1].history.push(event.id);
  }
  return event;
}

function addPerson(s, role, age, firmId = null) {
  const number = s.nextPerson++;
  const { surnames, names } = KO;
  const p = {
    id: `P${String(number).padStart(5, '0')}`,
    name: surnames[random(s, surnames.length)] + names[random(s, names.length)],
    role, age, firmId, status: 'working', motive: MOTIVES[random(s, MOTIVES.length)],
    skill: 35 + random(s, 36), experience: Math.max(0, age - policy.entryAge) * 4,
    reputation: 50, fatigue: 0, workload: 0, formerOffice: null, recoveryUntil: 0,
    leave: null, leaveCount: 0, enteredWeek: s.week, unemployedSince: firmId ? null : s.week, lastMove: s.week === 0 ? -random(s, 53) : s.week, district: random(s, policy.districts) + 1,
    detail: number <= 74 ? 'major' : 'ordinary', history: [],
  };
  if (s.career) careerHooks.registerPerson(s, p);
  s.people.push(p);
  emit(s, 'person_entered', { personIds: [p.id], role, age, firmId, detail: p.detail, lastMove: p.lastMove });
  return p;
}

function addFirm(s, template, name = template.name, founderId = null) {
  const f = {
    id: `F${String(s.nextFirm++).padStart(4, '0')}`, name,
    strategy: template.strategy, specialty: template.specialty, pay: template.pay,
    growth: template.growth, public: template.public, capacity: template.capacity,
    reputation: 50, yearCases: 0, yearAchieved: 0, yearRevenue: 0, totalCases: 0,
    hireQuota: 0, yearHires: 0, hireRemainder: 0, springQuota: 0, springHires: 0,
    openedWeek: s.week, closedWeek: null, recentRevenue: [], offer: {}, sector: template.sector,
  };
  if (s.career) careerHooks.registerFirm(s, f);
  s.firms.push(f);
  emit(s, 'firm_opened', { firmId: f.id, name: f.name, strategy: f.strategy, personIds: founderId ? [founderId] : [] });
  if (s.week > 0) s.yearOpenings++;
  return f;
}

function initialState(seed, scale = 1, career = null) {
  const s = { seed, rng: seed >>> 0, week: 0, nextPerson: 1, nextFirm: 1, nextCase: 1, nextEvent: 1,
    people: [], firms: [], events: [], demand: TYPES[0], previousLeader: null,
    scale, quotas: { ...policy.officeQuotas }, appliedPolicies: [], foundingCredit: 0, transferCredit: 0, leaveCredit: 0,
    pack: { id: KO.id, version: KO.version } };
  if (career) {
    s.career = career;
    careerHooks.initialize(s, { addFirm, addPerson, emit });
    return s;
  }
  for (let group = 0; group < policy.initialFirmGroups * scale; group++) for (const [index, template] of FIRMS.entries()) {
    const f = addFirm(s, template, group ? `${template.name}${group + 1}` : template.name);
    const count = template.count + (group % policy.initialFirmGroups < 5 && index === 1 ? 1 : 0);
    for (let n = 0; n < count; n++) addPerson(s, 'lawyer', policy.entryAge + random(s, policy.retirementAge - policy.entryAge - 3), f.id);
  }
  for (let n = 0; n < policy.officeQuotas.judge * scale; n++) addPerson(s, 'judge', policy.initialJudgeAge[0] + random(s, policy.initialJudgeAge[1]));
  for (let n = 0; n < policy.officeQuotas.prosecutor * scale; n++) addPerson(s, 'prosecutor', policy.initialProsecutorAge[0] + random(s, policy.initialProsecutorAge[1]));
  s.initialFirmCount = s.firms.length;
  emit(s, 'world_started', { seed, population: s.people.length });
  return s;
}

// Ability changes preparation throughput; the resolver reads the resulting work record only.
function prepareCase({ skill, experience, specialty, workload, type }) {
  const fit = specialty === type ? 15 : specialty === 'general' ? 7 : 0;
  const minutesPerTask = 100 / (skill + Math.min(15, Math.floor(experience / 30)) + fit);
  const minutes = Math.max(0, 100 - workload * 20);
  return { minutes, minutesPerTask, reviewedTasks: Math.floor(minutes / minutesPerTask) };
}
function resolveCase({ preparation, difficulty }) {
  const strength = preparation.reviewedTasks;
  return { achieved: strength >= difficulty, strength, difficulty };
}

function clientAppeal(firm, people, type, demand) {
  const fit = firm.specialty === type ? 22 : firm.specialty === 'general' ? 12 : 0;
  const former = people.filter(p => p.formerOffice && working(p)).length;
  return firm.reputation + fit + Math.min(18, former * 6) + (type === demand ? 5 : 0);
}

function utility(person, firm, members) {
  const load = members.length ? (members.fatigueTotal ?? members.reduce((n, p) => n + p.fatigue, 0)) / members.length : 0;
  const components = { money: firm.pay, honor: (firm.reputation + firm.growth) / 2,
    balance: 100 - load, public: firm.public, independence: 100 / (members.length + 1) };
  return components[person.motive] + (firm.offer?.[person.motive] || 0);
}

function move(s, p, target, reason, index) {
  if (!target || (reason !== 'founding' && !canHire(target, reason === 'spring'))) return false;
  const from = p.firmId;
  const members = id => index?.get(id) || staff(s, id);
  const utilityGain = from ? utility(p, target, members(target.id)) - utility(p, s.firms.find(f => f.id === from), members(from)) : null;
  if (index && from) {
    const old = members(from), next = old.filter(x => x.id !== p.id);
    next.fatigueTotal = old.fatigueTotal - p.fatigue; index.set(from, next);
  }
  if (index) {
    if (!index.has(target.id)) { const roster = []; roster.fatigueTotal = 0; index.set(target.id, roster); }
    const roster = index.get(target.id); roster.push(p); roster.fatigueTotal += p.fatigue;
  }
  p.firmId = target.id; p.unemployedSince = null;
  p.lastMove = s.week;
  if (reason === 'spring') target.springHires++;
  else if (reason !== 'founding') target.yearHires++;
  if (from && reason !== 'founding') s.yearTransfers++;
  emit(s, from ? 'person_moved' : 'person_hired', { personIds: [p.id], from, to: target.id, reason,
    utilityGain, springQuota: target.springQuota, springHires: target.springHires, largeTransfer: Boolean(from && reason !== 'founding' && (members(from).length >= 15 || members(target.id).length >= 15)), hireQuota: target.hireQuota, yearHires: target.yearHires });
  return true;
}

const canHire = (firm, spring = false) => !firm.closedWeek && (spring ? firm.springHires < firm.springQuota : firm.yearHires < firm.hireQuota);
const canFound = s => activeFirms(s).length < Math.floor(s.initialFirmCount * policy.firmRange[1]);
function canTransfer(p, current, target, currentStaff, targetStaff) {
  const extra = careerHooks.movementCooldown(p) ? require('./packs/ko-career').mobility.partnerExtraGain : 0;
  return Boolean(target && canHire(target) && utility(p, target, targetStaff) > utility(p, current, currentStaff) + policy.transferGain + extra);
}
function membership(s) {
  const index = new Map(s.firms.map(f => { const roster = []; roster.fatigueTotal = 0; return [f.id, roster]; }));
  for (const p of s.people) if (live(p) && p.role === 'lawyer' && p.firmId) {
    const roster = index.get(p.firmId); roster.push(p); roster.fatigueTotal += p.fatigue;
  }
  return index;
}
function preferredFirm(s, p, index = membership(s), spring = false) {
  let best, score = -Infinity;
  for (const f of s.firms) {
    if (f.id === p.firmId || !canHire(f, spring)) continue;
    const value = utility(p, f, index.get(f.id));
    if (value > score) { best = f; score = value; }
  }
  return best;
}
function exitMarket(s, p) {
  const destination = policy.exits[random(s, policy.exits.length)];
  p.status = 'statistical'; p.firmId = null; p.leave = null;
  emit(s, 'market_exit', { personIds: [p.id], role: p.role, destination });
}
function applyPolicies(s) {
  const date = new Date(Date.parse(policy.startDate) + Math.floor((s.week - 1) * 365.25 / 52) * 86400000).toISOString().slice(0, 10);
  for (const change of policy.events) {
    if (date < change.effectiveDate || s.appliedPolicies.includes(change.id)) continue;
    s.appliedPolicies.push(change.id); s.quotas[change.role] = change.quota;
    const { id: policyId, ...detail } = change;
    emit(s, 'policy_changed', { ...detail, policyId, appliedDate: date, quota: change.quota * s.scale });
    const officers = s.people.filter(p => live(p) && p.role === change.role).sort((a,b) => b.age-a.age || byId(a,b));
    for (const p of officers.slice(0, Math.max(0, officers.length - change.quota * s.scale))) {
      const fromRole = p.role; p.formerOffice = fromRole; p.role = 'lawyer'; p.status = 'working'; p.leave = null; p.unemployedSince = s.week;
      emit(s, 'office_departure', { personIds: [p.id], fromRole, reason: change.id });
    }
  }
}

function annual(s, year) {
  s.yearLeaveStarts = 0; s.yearPopulation = 0; s.yearLawyers = 0;
  s.yearTransfers = 0; s.yearOpenings = 0; s.yearClosures = 0; s.yearBurnoutStarts = 0;
  s.yearCases = 0;
  s.demand = TYPES[random(s, TYPES.length)];
  emit(s, 'market_year', { year, demand: s.demand });
  for (const f of s.firms) {
    f.yearCases = 0; f.yearAchieved = 0; f.yearRevenue = 0;
    if (f.closedWeek) continue;
    // Changes in the world's employment offers, never a random move or verdict.
    f.offer = Object.fromEntries(MOTIVES.map(m => [m, random(s, policy.offerSpread * 2 + 1) - policy.offerSpread]));
    emit(s, 'employment_terms', { firmId: f.id, offer: { ...f.offer } });
    const population = staff(s, f.id).length;
    const allowance = f.strategy === FIRMS[4].strategy ? 0 : population * policy.hiringRate + f.hireRemainder;
    f.hireQuota = Math.floor(allowance); f.hireRemainder = allowance - f.hireQuota; f.yearHires = 0; f.springQuota = f.strategy === FIRMS[4].strategy ? 0 : Math.ceil(population * policy.springHiringRate); f.springHires = 0;
    emit(s, 'hiring_budget', { firmId: f.id, population, springQuota: f.springQuota, hireQuota: f.hireQuota, hireRemainder: f.hireRemainder });
  }
  for (const p of s.people.filter(live)) {
    if (year > 1) p.age++;
    if (p.age >= policy.retirementAge) {
      p.status = 'retired';
      p.leave = null;
      emit(s, 'person_retired', { personIds: [p.id], role: p.role, firmId: p.firmId, age: p.age });
    } else if (policy.departureAge[p.role] && p.age >= policy.departureAge[p.role]) {
      const fromRole = p.role;
      p.formerOffice = fromRole;
      p.role = 'lawyer';
      p.status = 'working';
      p.leave = null;
      p.unemployedSince = s.week;
      emit(s, 'office_departure', { personIds: [p.id], fromRole });
      const target = preferredFirm(s, p);
      move(s, p, target, 'former_office');
    }
  }
  for (const [role, quota] of Object.entries(s.quotas)) {
    while (s.people.filter(p => live(p) && p.role === role).length < quota * s.scale) {
      const candidates = s.people.filter(p => working(p) && p.role === 'lawyer' && !p.formerOffice && p.age >= policy.appointmentAge[0] && p.age < policy.appointmentAge[1])
        .sort((a, b) => Number(b.motive === 'honor') - Number(a.motive === 'honor') || b.experience - a.experience || byId(a, b));
      const p = candidates[0] || addPerson(s, role, policy.fallbackOfficeAge);
      const from = p.firmId;
      const fromRole = p.role;
      p.role = role;
      p.firmId = null;
      emit(s, 'office_appointment', { personIds: [p.id], role, from, fromRole });
    }
  }
}

function monthly(s, year, month) {
  closeFirms(s);
  if (month === policy.rotationMonth) {
    for (const p of s.people.filter(p => live(p) && p.role === 'judge')) {
      const from = p.district;
      p.district = p.district % policy.districts + 1;
      emit(s, 'judge_rotation', { personIds: [p.id], from, to: p.district });
    }
  }
  if (month === policy.intakeMonth) {
    const activeLawyers = s.people.filter(p => live(p) && p.role === 'lawyer').length;
    const count = Math.round(activeLawyers * policy.inflowRate);
    for (let n = 0; n < count; n++) addPerson(s, 'lawyer', policy.entryAge);
    emit(s, 'spring_intake', { year, count, activeLawyers, rate: policy.inflowRate });
  }
  const index = membership(s);
  const lawyers = s.people.filter(p => live(p) && p.role === 'lawyer');
  const employed = lawyers.filter(p => p.firmId && index.get(p.firmId).length > 1);
  s.foundingCredit += lawyers.length * policy.foundingRate / 12;
  s.transferCredit += employed.length * policy.transferRate / 12;
  const candidates = lawyers.filter(working);
  // Rotate the stable list to prevent permanent priority for older IDs.
  const offset = random(s, Math.max(1, candidates.length));
  const ordered = candidates.slice(offset).concat(candidates.slice(0, offset));
  for (const p of ordered) {
    if (!p.firmId) {
      const spring = p.enteredWeek > 0 && s.week - p.enteredWeek < policy.unemploymentWeeks && !p.formerOffice;
      const target = preferredFirm(s, p, index, spring) || preferredFirm(s, p, index);
      move(s, p, target, spring && target && canHire(target, true) ? 'spring' : p.formerOffice ? 'former_office' : 'recruitment', index);
      if (!p.firmId && s.week - p.unemployedSince >= policy.unemploymentWeeks) exitMarket(s, p);
    } else if (s.week - p.lastMove >= Math.max(policy.moveCooldown, s.career ? careerHooks.movementCooldown(p) : 0)) {
      const current = s.firms.find(f => f.id === p.firmId);
      if (s.foundingCredit >= 1 && p.motive === 'independence' && index.get(current.id).length >= 3 && canFound(s)) {
        const template = { ...FIRMS[4], specialty: current.specialty === 'general' ? 'criminal' : current.specialty };
        const target = addFirm(s, template, `${p.name} ${KO.officeSuffix}`, p.id);
        move(s, p, target, 'founding', index); s.foundingCredit--;
      } else if (s.transferCredit >= 1 && index.get(current.id).length > 1) {
        const target = preferredFirm(s, p, index);
        if (canTransfer(p, current, target, index.get(current.id), target ? index.get(target.id) : [])) {
          move(s, p, target, p.motive, index); s.transferCredit--;
        }
      }
    }
  }
  // Life-stage/workload weights distribute a population-proportional leave budget.
  s.leaveCredit += s.people.filter(live).length * policy.leaveRate / 12;
  const eligible = s.people.filter(working);
  const risks = eligible.map(p => [burnoutRisk(p), p.age >= 30 && p.age <= 45 ? policy.parentingRisk : 0,
    p.age < 45 ? policy.studyRisk : 0, p.role === 'lawyer' ? policy.publicRisk : 0]);
  let totalRisk = risks.reduce((n, row) => n + row.reduce((a,b) => a+b, 0), 0), starts = 0;
  const expectedStarts = Math.floor(s.leaveCredit);
  while (s.leaveCredit >= 1 && totalRisk > 0) {
    let draw = random(s, totalRisk), chosen = -1, kind = -1;
    outer: for (let i=0; i<risks.length; i++) for (let j=0; j<risks[i].length; j++) {
      draw -= risks[i][j]; if (draw < 0) { chosen=i; kind=j; break outer; }
    }
    const p = eligible[chosen], type = ['burnout', 'parenting', 'study', 'public'][kind];
    totalRisk -= risks[chosen].reduce((a,b) => a+b, 0); risks[chosen] = [0,0,0,0];
    p.status = 'leave'; p.leave = { type, start: s.week, returnWeek: s.week + LEAVES[type][1] }; p.leaveCount++;
    s.yearLeaveStarts++; starts++; s.leaveCredit--;
    if (type === 'burnout') s.yearBurnoutStarts++;
    emit(s, 'leave_started', { personIds: [p.id], role: p.role, firmId: p.firmId, leaveType: type,
      start: s.week, returnWeek: p.leave.returnWeek, fatigue: p.fatigue, workload: p.workload });
  }
  emit(s, 'monthly_leave_risk', { expectedStarts, starts });
  emit(s, 'monthly_ranking', { year, month, ...rankings(s) });
}

function closeFirms(s) {
  const index = membership(s);
  for (const f of activeFirms(s)) {
    const members = index.get(f.id);
    const revenue = f.recentRevenue.reduce((a, b) => a + b, 0);
    const empty = members.length === 0;
    const trialExpired = f.openedWeek > 0 && s.week - f.openedWeek >= policy.trialBusinessWeeks
      && members.length === 1 && revenue < policy.trialWeeklyRevenue * f.recentRevenue.length;
    const unsustainable = s.week - f.openedWeek >= policy.minimumBusinessWeeks && members.length === 1
      && members.every(working) && f.recentRevenue.length === policy.businessWindow
      && revenue < policy.minimumWeeklyRevenue * policy.businessWindow;
    if (!empty && !unsustainable && !trialExpired) continue;
    f.closedWeek = s.week;
    s.yearClosures++;
    for (const p of members) { p.firmId = null; p.unemployedSince = s.week; }
    emit(s, 'firm_closed', { firmId: f.id, personIds: members.map(p => p.id), reason: empty ? 'empty' : trialExpired ? 'trial_expired' : 'revenue',
      windowRevenue: revenue, windowWeeks: f.recentRevenue.length });
  }
}

const burnoutRisk = p => Math.max(0, p.fatigue - policy.burnoutThreshold) * policy.burnoutRisk;
const workCapacity = (p, firm, week) => p.recoveryUntil > week ? Math.min(firm.capacity, policy.recoveryCapacity) : firm.capacity;

function market(s) {
  for (const p of s.people.filter(live)) p.workload = 0;
  const activeLawyers = s.people.filter(p => live(p) && p.role === 'lawyer').length;
  const count = Math.round(activeLawyers * 12 / 52);
  // Membership is fixed within the weekly market; workloads remain live references.
  const rosters = new Map(s.firms.map(f => [f.id, []]));
  for (const p of s.people) if (working(p) && p.role === 'lawyer' && p.firmId) rosters.get(p.firmId).push(p);
  const capacities = activeFirms(s).map(f => ({ firmId: f.id, working: rosters.get(f.id).length,
    capacity: rosters.get(f.id).reduce((n, p) => n + workCapacity(p, f, s.week), 0),
    recovering: rosters.get(f.id).filter(p => p.recoveryUntil > s.week).length }));
  emit(s, 'weekly_market', { activeLawyers, supply: count, capacities });
  const revenueBefore = new Map(activeFirms(s).map(f => [f.id, f.yearRevenue]));
  const eligibleFirms = activeFirms(s).filter(f => rosters.get(f.id).length);
  for (let n = 0; n < count; n++) {
    const type = random(s, 100) < 55 ? s.demand : TYPES[random(s, 3)];
    const difficulty = 35 + random(s, 51);
    const caseId = `C${String(s.nextCase++).padStart(7, '0')}`;
    const choices = eligibleFirms;
    if (!choices.length) { emit(s, 'case_unserved', { caseId, caseType: type }); continue; }
    // Each client samples three firms, so reputation does not grant every case to one firm.
    const sampled = [];
    const picked = [];
    for (let k = 0; k < 3 && k < choices.length; k++) {
      let position = random(s, choices.length - k);
      for (const excluded of picked) if (position >= excluded) position++;
      picked.push(position); picked.sort((a,b) => a-b);
      const f = choices[position];
      sampled.push({ f, people: rosters.get(f.id).filter(p => p.workload < workCapacity(p, f, s.week)) });
    }
    sampled.sort((a, b) => clientAppeal(b.f, b.people, type, s.demand) - clientAppeal(a.f, a.people, type, s.demand) || byId(a.f, b.f));
    const { f, people } = sampled[0];
    const p = people.reduce((best, candidate) =>
      (candidate.workload - best.workload || candidate.experience - best.experience || byId(candidate, best)) < 0 ? candidate : best);
    const input = { skill: p.skill, experience: p.experience, specialty: f.specialty,
      workload: p.workload, type, difficulty };
    input.preparation = prepareCase(input);
    const outcome = resolveCase(input);
    p.workload++;
    if (!rosters.get(f.id).some(x => x.workload < workCapacity(x, f, s.week))) eligibleFirms.splice(eligibleFirms.indexOf(f), 1);
    p.experience++;
    if (s.career) careerHooks.completeRoutine(s, p, f, outcome);
    else {
      p.reputation = clamp(p.reputation + (outcome.achieved ? 1 : -1), 0, 100);
      f.reputation = clamp(f.reputation + (outcome.achieved ? 1 : -1), 0, 100);
    }
    f.yearCases++; f.totalCases++; s.yearCases++;
    f.yearAchieved += Number(outcome.achieved);
    const fee = FEES[type] * (outcome.achieved ? 2 : 1);
    f.yearRevenue += fee;
    if (!s.career) {
    const completed = emit(s, 'case_completed', { caseId, personIds: [p.id], firmId: f.id, caseType: type, input, ...outcome, fee });
    const newsRoll = random(s, KO.news.chanceScale);
    if (newsRoll < KO.news.majorChance) emit(s, 'major_case', { sourceEventId: completed.id, subjectCaseId: caseId, personIds: [p.id], firmId: f.id, caseType: type, achieved: outcome.achieved });
    else if (newsRoll < KO.news.majorChance + KO.news.precedentChance) emit(s, 'precedent_notice', { sourceEventId: completed.id, firmId: f.id, personIds: [p.id], title: KO.news.precedents[random(s, KO.news.precedents.length)], fixture: true });
    if (p.detail === 'ordinary' && p.experience >= 60 && p.reputation >= 65) {
      p.detail = 'major';
      emit(s, 'person_prominent', { personIds: [p.id], firmId: f.id });
    }
    }
  }
  for (const p of s.people.filter(live)) {
    // Judges/prosecutors have a compressed docket workload of 1 per working week.
    if (p.role !== 'lawyer' && working(p)) p.workload = 1;
    p.fatigue = clamp(p.fatigue + (working(p) ? p.workload * policy.fatiguePerCase - policy.weeklyRecovery : -8), 0, 100);
  }
  for (const f of activeFirms(s)) {
    f.recentRevenue.push(f.yearRevenue - revenueBefore.get(f.id));
    if (f.recentRevenue.length > policy.businessWindow) f.recentRevenue.shift();
  }
}

function rankings(s) {
  const index = membership(s);
  const rows = activeFirms(s).map(f => ({ firmId: f.id, name: f.name, strategy: f.strategy,
    population: index.get(f.id).length, working: index.get(f.id).filter(working).length,
    cases: f.yearCases, achieved: f.yearAchieved, revenue: f.yearRevenue,
    // Ten neutral prior cases prevent a single lucky case from topping the table.
    score: Math.round((f.yearAchieved + 5) / (f.yearCases + 10) * 10000) / 100,
    reputation: f.reputation,
  }));
  const tie = (a, b) => a.firmId < b.firmId ? -1 : a.firmId > b.firmId ? 1 : 0;
  const revenue = [...rows].sort((a, b) => b.revenue - a.revenue || tie(a, b));
  return { ranking: revenue,
    strategyLeaders: FIRMS.map(template => revenue.find(r => r.strategy === template.strategy)).filter(Boolean),
    throughputRanking: [...rows].sort((a, b) => b.cases - a.cases || tie(a, b)),
    achievementRanking: rows.filter(r => r.cases >= 20).sort((a, b) => b.score - a.score || b.cases - a.cases || tie(a, b)) };
}

function step(s) {
  s.week++;
  const date = calendar(s.week);
  for (const p of s.people.filter(p => p.status === 'leave' && p.leave.returnWeek <= s.week)) {
    const type = p.leave.type;
    p.status = 'working'; p.leave = null; p.fatigue = 0;
    if (type === 'burnout') p.recoveryUntil = s.week + policy.recoveryWeeks;
    if (type === 'study') p.skill = Math.min(90, p.skill + 5);
    emit(s, 'leave_returned', { personIds: [p.id], role: p.role, firmId: p.firmId, leaveType: type,
      recoveryUntil: p.recoveryUntil, recoveryCapacity: type === 'burnout' ? policy.recoveryCapacity : null });
  }
  if (!s.career) applyPolicies(s);
  if ((s.week - 1) % 52 === 0) annual(s, date.year);
  if (s.week === 1 || calendar(s.week - 1).month !== date.month) monthly(s, date.year, date.month);
  market(s);
  if (s.career) careerHooks.afterWeek(s, { emit });
  s.yearPopulation += s.people.filter(live).length;
  const lawyers = s.people.filter(p => live(p) && p.role === 'lawyer').length;
  s.yearLawyers += lawyers;
  emit(s, 'weekly_census', { total: s.people.filter(live).length,
    lawyers, working: s.people.filter(working).length, onLeave: s.people.filter(p => p.status === 'leave').length });
  if (s.week % 52 === 0) {
    const ranks = rankings(s);
    const population = Object.fromEntries(['lawyer', 'judge', 'prosecutor'].map(role => [role, s.people.filter(p => live(p) && p.role === role).length]));
    const onLeave = Object.fromEntries(Object.keys(LEAVES).map(type => [type, s.people.filter(p => p.leave?.type === type).length]));
    emit(s, 'year_closed', { year: date.year, population, total: Object.values(population).reduce((a, b) => a + b, 0),
      retired: s.people.filter(p => p.status === 'retired').length, onLeave, ...ranks, leaveStarts: s.yearLeaveStarts, averagePopulation: s.yearPopulation / 52, leaveStartRate: s.yearLeaveStarts / (s.yearPopulation / 52),
      transfers: s.yearTransfers, openings: s.yearOpenings, closures: s.yearClosures, firmCount: activeFirms(s).length,
      burnoutStarts: s.yearBurnoutStarts, burnoutRate: s.yearBurnoutStarts / (s.yearPopulation / 52),
      averageLawyers: s.yearLawyers / 52, cases: s.yearCases,
      casesPerLawyer: s.yearCases / (s.yearLawyers / 52),
      previousLeader: s.previousLeader });
    s.previousLeader = ranks.ranking[0].firmId;
  }
}

function beginCareerPlay(s) { careerHooks.beginPlay(s, { addFirm, addPerson, emit }); }
module.exports = { initialState, step, beginCareerPlay, prepareCase, resolveCase, clientAppeal, rankings, canHire, canTransfer, canFound, burnoutRisk, workCapacity };
