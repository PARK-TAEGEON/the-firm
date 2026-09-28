'use strict';

const { FIRMS, TYPES, FEES, LEAVES, MOTIVES, clamp, calendar, random } = require('./data');
const live = p => p.status !== 'retired';
const working = p => p.status === 'working';
const staff = (s, id) => s.people.filter(p => live(p) && p.role === 'lawyer' && p.firmId === id);
const available = (s, id) => staff(s, id).filter(working);
const byId = (a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

function emit(s, type, detail = {}) {
  const event = { id: `E${String(s.nextEvent++).padStart(7, '0')}`, week: s.week, type, ...detail };
  s.events.push(event);
  for (const id of event.personIds || []) {
    s.people.find(p => p.id === id).history.push(event.id);
  }
  return event;
}

function addPerson(s, role, age, firmId = null) {
  const number = s.nextPerson++;
  const surnames = ['김', '이', '박', '최', '정', '윤', '장', '임'];
  const names = ['서진', '지우', '도윤', '하린', '민재', '수현', '예린', '준서', '시온', '다은', '태윤', '유진'];
  const p = {
    id: `P${String(number).padStart(5, '0')}`,
    name: surnames[random(s, surnames.length)] + names[random(s, names.length)],
    role, age, firmId, status: 'working', motive: MOTIVES[random(s, MOTIVES.length)],
    skill: 35 + random(s, 36), experience: Math.max(0, age - 28) * 4,
    reputation: 50, fatigue: 0, workload: 0, formerOffice: null,
    leave: null, leaveCount: 0, lastMove: -52, district: random(s, 4) + 1,
    detail: number <= 74 ? 'major' : 'ordinary', history: [],
  };
  s.people.push(p);
  emit(s, 'person_entered', { personIds: [p.id], role, age, firmId });
  return p;
}

function addFirm(s, template, name = template.name) {
  const f = {
    id: `F${String(s.nextFirm++).padStart(4, '0')}`, name,
    strategy: template.strategy, specialty: template.specialty, pay: template.pay,
    growth: template.growth, public: template.public, capacity: template.capacity,
    reputation: 50, yearCases: 0, yearAchieved: 0, yearRevenue: 0, totalCases: 0,
  };
  s.firms.push(f);
  emit(s, 'firm_opened', { firmId: f.id, name, strategy: f.strategy });
  return f;
}

function initialState(seed) {
  const s = { seed, rng: seed >>> 0, week: 0, nextPerson: 1, nextFirm: 1, nextCase: 1, nextEvent: 1,
    people: [], firms: [], events: [], demand: TYPES[0], previousLeader: null };
  for (const template of FIRMS) {
    const f = addFirm(s, template);
    for (let n = 0; n < template.count; n++) addPerson(s, 'lawyer', 28 + random(s, 34), f.id);
  }
  for (let n = 0; n < 8; n++) addPerson(s, 'judge', 44 + random(s, 17));
  for (let n = 0; n < 6; n++) addPerson(s, 'prosecutor', 38 + random(s, 21));
  emit(s, 'world_started', { seed, population: s.people.length });
  return s;
}

// Service outcome only: no verdict, finding, judge profile, former-office field or RNG.
function resolveCase({ skill, experience, specialty, workload, type, difficulty }) {
  const fit = specialty === type ? 15 : specialty === 'general' ? 7 : 0;
  const strength = skill + Math.min(15, Math.floor(experience / 30)) + fit - workload * 15;
  return { achieved: strength >= difficulty, strength, difficulty };
}

function clientAppeal(firm, people, type, demand) {
  const fit = firm.specialty === type ? 22 : firm.specialty === 'general' ? 12 : 0;
  const former = people.filter(p => p.formerOffice && working(p)).length;
  return firm.reputation + fit + Math.min(18, former * 6) + (type === demand ? 5 : 0);
}

function utility(person, firm, members) {
  const load = members.length ? members.reduce((n, p) => n + p.fatigue, 0) / members.length : 0;
  const components = { money: firm.pay, honor: (firm.reputation + firm.growth) / 2,
    balance: 100 - load, public: firm.public, independence: 100 / (members.length + 1) };
  return components[person.motive];
}

function move(s, p, target, reason) {
  const from = p.firmId;
  p.firmId = target.id;
  p.lastMove = s.week;
  emit(s, from ? 'person_moved' : 'person_hired', { personIds: [p.id], from, to: target.id, reason });
}

function annual(s, year) {
  s.demand = TYPES[random(s, TYPES.length)];
  emit(s, 'market_year', { year, demand: s.demand });
  for (const f of s.firms) { f.yearCases = 0; f.yearAchieved = 0; f.yearRevenue = 0; }
  for (const p of s.people.filter(live)) {
    if (year > 1) p.age++;
    if (p.age >= 65) {
      p.status = 'retired';
      p.leave = null;
      emit(s, 'person_retired', { personIds: [p.id], role: p.role, firmId: p.firmId, age: p.age });
    } else if ((p.role === 'judge' && p.age >= 58) || (p.role === 'prosecutor' && p.age >= 56)) {
      const fromRole = p.role;
      p.formerOffice = fromRole;
      p.role = 'lawyer';
      p.status = 'working';
      p.leave = null;
      emit(s, 'office_departure', { personIds: [p.id], fromRole });
      const target = [...s.firms].sort((a, b) => utility(p, b, staff(s, b.id)) - utility(p, a, staff(s, a.id)) || byId(a, b))[0];
      move(s, p, target, 'former_office');
    }
  }
  for (const [role, quota] of [['judge', 8], ['prosecutor', 6]]) {
    while (s.people.filter(p => live(p) && p.role === role).length < quota) {
      const candidates = s.people.filter(p => working(p) && p.role === 'lawyer' && !p.formerOffice && p.age >= 35 && p.age < 50)
        .sort((a, b) => Number(b.motive === 'honor') - Number(a.motive === 'honor') || b.experience - a.experience || byId(a, b));
      const p = candidates[0] || addPerson(s, role, 38);
      const from = p.firmId;
      p.role = role;
      p.firmId = null;
      emit(s, 'office_appointment', { personIds: [p.id], role, from });
    }
  }
}

function monthly(s, year, month) {
  if (month === 2) {
    for (const p of s.people.filter(p => live(p) && p.role === 'judge')) {
      const from = p.district;
      p.district = p.district % 4 + 1;
      emit(s, 'judge_rotation', { personIds: [p.id], from, to: p.district });
    }
  }
  if (month === 3) {
    const count = Math.max(0, 74 - s.people.filter(live).length);
    for (let n = 0; n < count; n++) addPerson(s, 'lawyer', 28);
    emit(s, 'spring_intake', { year, count });
  }
  // Stable ID iteration; one decision per person, with a one-year move cooldown.
  for (const p of s.people.filter(p => working(p) && p.role === 'lawyer')) {
    if (!p.firmId) {
      const target = [...s.firms].sort((a, b) => utility(p, b, staff(s, b.id)) - utility(p, a, staff(s, a.id)) || byId(a, b))[0];
      move(s, p, target, 'recruitment');
    } else if (s.week - p.lastMove >= 52) {
      const current = s.firms.find(f => f.id === p.firmId);
      if (p.motive === 'independence' && p.experience >= 60 && staff(s, current.id).length >= 3 && s.firms.length < 12) {
        const template = { ...FIRMS[4], specialty: current.specialty === 'general' ? 'criminal' : current.specialty };
        const target = addFirm(s, template, `${p.name} 법률사무소`);
        move(s, p, target, 'founding');
      } else {
        const target = [...s.firms].sort((a, b) => utility(p, b, staff(s, b.id)) - utility(p, a, staff(s, a.id)) || byId(a, b))[0];
        if (utility(p, target, staff(s, target.id)) > utility(p, current, staff(s, current.id)) + 12) move(s, p, target, p.motive);
      }
    }
  }
  for (const p of s.people.filter(working)) {
    // Draw once per working person each month; excessive work increases burnout risk.
    const roll = random(s, 10000);
    let type = null;
    if (roll < Math.max(0, p.fatigue - 35) * 10) type = 'burnout';
    else if (roll >= 8000 && roll < 8060 && p.age >= 30 && p.age <= 45) type = 'parenting';
    else if (roll >= 8500 && roll < 8535 && p.age < 45) type = 'study';
    else if (roll >= 9000 && roll < 9040 && p.role === 'lawyer') type = 'public';
    if (type) {
      p.status = 'leave';
      p.leave = { type, start: s.week, returnWeek: s.week + LEAVES[type][1] };
      p.leaveCount++;
      emit(s, 'leave_started', { personIds: [p.id], firmId: p.firmId, leaveType: type,
        start: p.leave.start, returnWeek: p.leave.returnWeek, fatigue: p.fatigue });
    }
  }
  emit(s, 'monthly_ranking', { year, month, ranking: ranking(s) });
}

function market(s) {
  for (const p of s.people.filter(live)) p.workload = 0;
  const count = 18 + random(s, 13);
  for (let n = 0; n < count; n++) {
    const type = random(s, 100) < 55 ? s.demand : TYPES[random(s, 3)];
    const difficulty = 35 + random(s, 51);
    const caseId = `C${String(s.nextCase++).padStart(7, '0')}`;
    const choices = s.firms.map(f => ({ f, people: available(s, f.id).filter(p => p.workload < f.capacity) }))
      .filter(x => x.people.length);
    if (!choices.length) { emit(s, 'case_unserved', { caseId, caseType: type }); continue; }
    // Each client samples three firms, so reputation does not grant every case to one firm.
    const sampled = [];
    for (let k = 0; k < 3 && choices.length; k++) sampled.push(choices.splice(random(s, choices.length), 1)[0]);
    sampled.sort((a, b) => clientAppeal(b.f, b.people, type, s.demand) - clientAppeal(a.f, a.people, type, s.demand) || byId(a.f, b.f));
    const { f, people } = sampled[0];
    people.sort((a, b) => a.workload - b.workload || a.experience - b.experience || byId(a, b));
    const p = people[0];
    const input = { skill: p.skill, experience: p.experience, specialty: f.specialty,
      workload: p.workload, type, difficulty };
    const outcome = resolveCase(input);
    p.workload++;
    p.experience++;
    p.reputation = clamp(p.reputation + (outcome.achieved ? 1 : -1), 0, 100);
    f.reputation = clamp(f.reputation + (outcome.achieved ? 1 : -1), 0, 100);
    f.yearCases++; f.totalCases++;
    f.yearAchieved += Number(outcome.achieved);
    const fee = FEES[type] * (outcome.achieved ? 2 : 1);
    f.yearRevenue += fee;
    emit(s, 'case_completed', { caseId, personIds: [p.id], firmId: f.id, caseType: type, input, ...outcome, fee });
    if (p.detail === 'ordinary' && p.experience >= 60 && p.reputation >= 65) {
      p.detail = 'major';
      emit(s, 'person_prominent', { personIds: [p.id] });
    }
  }
  for (const p of s.people.filter(live)) {
    // Judges/prosecutors have a compressed docket workload of 1 per working week.
    if (p.role !== 'lawyer' && working(p)) p.workload = 1;
    p.fatigue = clamp(p.fatigue + (working(p) ? p.workload * 4 - 3 : -8), 0, 100);
  }
}

function ranking(s) {
  return s.firms.map(f => ({ firmId: f.id, name: f.name, strategy: f.strategy,
    population: staff(s, f.id).length, working: available(s, f.id).length,
    cases: f.yearCases, achieved: f.yearAchieved, revenue: f.yearRevenue,
    // Ten neutral prior cases prevent a single lucky case from topping the table.
    score: Math.round((f.yearAchieved + 5) / (f.yearCases + 10) * 10000) / 100,
    reputation: f.reputation,
  })).sort((a, b) => b.score - a.score || b.cases - a.cases || (a.firmId < b.firmId ? -1 : 1));
}

function step(s) {
  s.week++;
  const date = calendar(s.week);
  for (const p of s.people.filter(p => p.status === 'leave' && p.leave.returnWeek <= s.week)) {
    const type = p.leave.type;
    p.status = 'working'; p.leave = null; p.fatigue = 0;
    if (type === 'study') p.skill = Math.min(90, p.skill + 5);
    emit(s, 'leave_returned', { personIds: [p.id], firmId: p.firmId, leaveType: type });
  }
  if ((s.week - 1) % 52 === 0) annual(s, date.year);
  if (s.week === 1 || calendar(s.week - 1).month !== date.month) monthly(s, date.year, date.month);
  market(s);
  emit(s, 'weekly_census', { total: s.people.filter(live).length,
    working: s.people.filter(working).length, onLeave: s.people.filter(p => p.status === 'leave').length });
  if (s.week % 52 === 0) {
    const ranks = ranking(s);
    const population = Object.fromEntries(['lawyer', 'judge', 'prosecutor'].map(role => [role, s.people.filter(p => live(p) && p.role === role).length]));
    const onLeave = Object.fromEntries(Object.keys(LEAVES).map(type => [type, s.people.filter(p => p.leave?.type === type).length]));
    emit(s, 'year_closed', { year: date.year, population, total: Object.values(population).reduce((a, b) => a + b, 0),
      retired: s.people.filter(p => !live(p)).length, onLeave, ranking: ranks,
      previousLeader: s.previousLeader });
    s.previousLeader = ranks[0].firmId;
  }
}

module.exports = { initialState, step, resolveCase, clientAppeal };
