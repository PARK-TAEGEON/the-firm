'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createWorld, simulate } = require('./service');
const { initialState, step, prepareCase, resolveCase, clientAppeal, rankings, canHire, canTransfer, canFound, burnoutRisk, workCapacity } = require('./simulation');
const { present, frontPage, articleOrder, renderNews } = require('./presentation');
const { calendar, LEAVES, KO, NEWS } = require('./data');
const { parseArgs } = require('./run');

const world = simulate({ years: 10, seed: 1 });
const report = present(world);

test('same seed reproduces full state, news and stats byte for byte', () => {
  const again = simulate({ years: 10, seed: 1 });
  assert.deepEqual(again, world);
  assert.equal(present(again).news, report.news);
  assert.equal(JSON.stringify(present(again).stats), JSON.stringify(report.stats));
});

test('different seed changes the world; seed zero is reproducible', () => {
  const zero = simulate({ years: 1, seed: 0 });
  assert.deepEqual(zero, simulate({ years: 1, seed: 0 }));
  assert.notEqual(present(zero).news, present(simulate({ years: 1, seed: 1 })).news);
});

test('chunked commands preserve RNG, state, records and old record prefixes', () => {
  const service = createWorld(1);
  service.advance(17);
  const prefix = service.snapshot().events;
  service.advance(35);
  for (let n = 0; n < 9; n++) service.advance(52);
  assert.deepEqual(service.snapshot(), world);
  assert.deepEqual(service.snapshot().events.slice(0, prefix.length), prefix);
});

test('invalid commands leave state, RNG, ID counters and records untouched', () => {
  const service = createWorld(1);
  service.advance(4);
  const before = service.snapshot();
  for (const value of [0, -1, 1.5, NaN, Infinity, '4', 5200]) {
    assert.throws(() => service.advance(value));
    assert.deepEqual(service.snapshot(), before);
  }
  service.advance(48);
  assert.deepEqual(service.snapshot(), simulate({ years: 1, seed: 1 }));
});

test('external snapshots cannot mutate the service', () => {
  const service = createWorld(2);
  const expected = service.snapshot();
  const snapshot = service.snapshot();
  snapshot.people[0].id = 'bad';
  snapshot.events[0].name = 'changed';
  snapshot.rng = 123;
  assert.deepEqual(service.snapshot(), expected);
});

test('seed and duration boundaries reject malformed values', () => {
  for (const seed of [-1, 4294967296, 0.5, NaN, '1']) assert.throws(() => createWorld(seed));
  assert.equal(createWorld(4294967295).snapshot().seed, 4294967295);
  for (const years of [0, -1, 101, 0.5, Infinity, '10']) assert.throws(() => simulate({ years }));
});

test('initial contract counts and five strategies are exact', () => {
  const s = createWorld().snapshot();
  assert.equal(s.firms.length, 35);
  assert.equal(new Set(s.firms.map(f => f.strategy)).size, 5);
  for (const strategy of new Set(s.firms.map(f => f.strategy))) assert.equal(s.firms.filter(f => f.strategy === strategy).length, 7);
  assert.ok(s.people.every(p => p.lastMove >= -52 && p.lastMove <= 0));
  assert.ok(new Set(s.people.map(p => p.lastMove)).size > 40);
  for (const [role, count] of [['lawyer', 600], ['judge', 50], ['prosecutor', 30]]) {
    assert.equal(s.people.filter(p => p.role === role).length, count);
  }
});

test('person, firm, case and record identities are unique and monotone', () => {
  for (const list of [world.people, world.firms, world.events]) {
    assert.equal(new Set(list.map(x => x.id)).size, list.length);
    assert.deepEqual(list.map(x => x.id), [...list.map(x => x.id)].sort());
  }
  const cases = world.events.filter(e => e.caseId).map(e => e.caseId);
  assert.equal(new Set(cases).size, cases.length);
  assert.equal(cases.length + 1, world.nextCase);
  assert.equal(world.people.length + 1, world.nextPerson);
  const events = new Set(world.events.map(e => e.id));
  for (const p of world.people) for (const id of p.history) assert.ok(events.has(id));
});

test('retirees and their actual career histories survive in exported stats', () => {
  const retirees = report.stats.people.filter(p => p.status === 'retired');
  assert.ok(retirees.length > 0);
  for (const p of retirees) {
    assert.ok(p.careerHistory.some(e => e.type === 'person_entered'));
    const retirement = p.careerHistory.find(e => e.type === 'person_retired');
    assert.ok(retirement);
    assert.ok(!world.events.some(e => e.week > retirement.week && e.personIds?.includes(p.id)));
  }
});

test('population ledger replays every weekly census and annual total', () => {
  let population = 0;
  for (const e of world.events) {
    if (e.type === 'person_entered') population++;
    if (['person_retired', 'market_exit'].includes(e.type)) population--;
    if (['weekly_census', 'year_closed'].includes(e.type)) assert.equal(e.total, population);
    if (e.type === 'weekly_census') assert.equal(e.working + e.onLeave, e.total);
  }
  assert.equal(population, world.people.filter(p => ['working', 'leave'].includes(p.status)).length);
});

test('every case result and annual score can be recalculated from records', () => {
  let totals = new Map();
  for (const e of world.events) {
    if (e.type === 'market_year') totals = new Map();
    if (e.type === 'case_completed') {
      assert.deepEqual(resolveCase(e.input), { achieved: e.achieved, strength: e.strength, difficulty: e.difficulty });
      const total = totals.get(e.firmId) || { count: 0, achieved: 0, revenue: 0 };
      total.count++; total.achieved += Number(e.achieved); total.revenue += e.fee;
      totals.set(e.firmId, total);
    }
    if (e.type === 'year_closed') for (const row of e.ranking) {
      const total = totals.get(row.firmId) || { count: 0, achieved: 0, revenue: 0 };
      assert.equal(row.cases, total.count);
      assert.equal(row.achieved, total.achieved);
      assert.equal(row.revenue, total.revenue);
      assert.equal(row.score, Math.round((total.achieved + 5) / (total.count + 10) * 10000) / 100);
    }
  }
});

test('former office attracts clients but cannot alter case resolution', () => {
  const firm = { reputation: 50, specialty: 'criminal' };
  const normal = [{ status: 'working', formerOffice: null }];
  const former = [{ status: 'working', formerOffice: 'judge' }];
  assert.equal(clientAppeal(firm, former, 'criminal', 'criminal') - clientAppeal(firm, normal, 'criminal', 'criminal'), 6);
  assert.equal(clientAppeal(firm, [{ status: 'leave', formerOffice: 'judge' }], 'criminal', 'criminal'), clientAppeal(firm, normal, 'criminal', 'criminal'));
  const input = { skill: 40, experience: 0, specialty: 'criminal', workload: 0, type: 'criminal', difficulty: 55 };
  input.preparation = prepareCase(input);
  assert.equal(resolveCase(input).achieved, true);
  assert.equal(resolveCase({ ...input, difficulty: 56 }).achieved, false);
  for (const formerOffice of ['judge', 'prosecutor', null]) {
    assert.deepEqual(resolveCase({ ...input, formerOffice, detail: 'ordinary' }), resolveCase(input));
  }
});

test('all leave types occur; no leave-time case assignment and exact returns', () => {
  const active = new Map();
  const types = new Set();
  let returns = 0;
  for (const e of world.events) {
    const id = e.personIds?.[0];
    if (e.type === 'leave_started') {
      assert.ok(!active.has(id));
      assert.equal(e.returnWeek - e.week, LEAVES[e.leaveType][1]);
      if (e.leaveType === 'burnout') assert.ok(e.fatigue > 50);
      active.set(id, e); types.add(e.leaveType);
    }
    if (e.type === 'leave_returned') {
      assert.ok(active.has(id));
      assert.equal(e.week, active.get(id).returnWeek);
      active.delete(id); returns++;
    }
    if (['person_retired', 'office_departure'].includes(e.type)) active.delete(id);
    if (e.type === 'case_completed') assert.ok(!active.has(id));
  }
  assert.deepEqual([...types].sort(), Object.keys(LEAVES).sort());
  assert.ok(returns > 0);
  for (const p of world.people) assert.equal(active.has(p.id), p.status === 'leave');
});

test('spring and February calendar events occur once a year at the right month', () => {
  const intakes = world.events.filter(e => e.type === 'spring_intake');
  assert.equal(intakes.length, 10);
  for (const e of intakes) assert.equal(calendar(e.week).month, 3);
  const rotations = world.events.filter(e => e.type === 'judge_rotation');
  assert.equal(rotations.length, 500);
  for (const e of rotations) {
    assert.equal(calendar(e.week).month, 2);
    assert.notEqual(e.from, e.to);
  }
});

test('case assignments respect recorded weekly capacity and experience continuity', () => {
  const people = new Map();
  const loads = new Map();
  const firms = new Map(world.firms.map(f => [f.id, f]));
  for (const e of world.events) {
    const id = e.personIds?.[0];
    if (e.type === 'person_entered') people.set(id, Math.max(0, e.age - 28) * 4);
    if (e.type === 'case_completed') {
      const key = `${e.week}/${id}`;
      const prior = loads.get(key) || 0;
      assert.equal(e.input.workload, prior);
      assert.ok(prior < firms.get(e.firmId).capacity);
      assert.equal(e.input.experience, people.get(id));
      loads.set(key, prior + 1);
      people.set(id, people.get(id) + 1);
    }
  }
  for (const p of world.people) assert.equal(p.experience, people.get(p.id));
});

test('news is read-only and every article references a real event', () => {
  const before = JSON.stringify(world);
  const projection = present(world);
  const ids = new Set(world.events.map(e => e.id));
  for (const a of projection.articles) assert.ok(ids.has(a.eventId));
  assert.equal(JSON.stringify(world), before);
  assert.ok(projection.articles.length >= 5);
  assert.equal(projection.stats.observations.humanStoryReview, 'pending');
});

test('ten-year census retains office quotas without a population target', () => {
  assert.equal(report.stats.annual.length, 10);
  for (const year of report.stats.annual) {
    assert.equal(year.population.judge, 50);
    assert.equal(year.population.prosecutor, KO.policy.events[0].quota);
  }
});

test('leave rates and spring inflow replay from the population ledger', () => {
  for (const year of report.stats.annual) {
    const events = world.events.filter(e => calendar(Math.max(1, e.week)).year === year.year && e.week > 0);
    const starts = events.filter(e => e.type === 'leave_started').length;
    const average = events.filter(e => e.type === 'weekly_census').reduce((n, e) => n + e.total, 0) / 52;
    assert.equal(year.leaveStarts, starts);
    assert.equal(year.averagePopulation, average);
    assert.equal(year.leaveStartRate, starts / average);
  }
  let lawyers = 0;
  let springEntries = 0;
  for (const e of world.events) {
    if (e.type === 'person_entered' && e.role === 'lawyer') { lawyers++; if (e.week && calendar(e.week).month === 3) springEntries++; }
    if (e.type === 'office_departure') lawyers++;
    if (e.type === 'office_appointment' && e.fromRole === 'lawyer') lawyers--;
    if (['person_retired', 'market_exit'].includes(e.type) && e.role === 'lawyer') lawyers--;
    if (e.type === 'spring_intake') {
      assert.equal(e.activeLawyers, lawyers - springEntries);
      assert.equal(e.count, Math.round(e.activeLawyers * KO.policy.inflowRate));
      assert.equal(e.count, springEntries);
      springEntries = 0;
    }
  }
});

test('three rankings use distinct metrics and achievement eligibility starts at 20', () => {
  const firms = [
    { id: 'F1', yearCases: 19, yearAchieved: 19, yearRevenue: 500 },
    { id: 'F2', yearCases: 20, yearAchieved: 20, yearRevenue: 100 },
    { id: 'F3', yearCases: 40, yearAchieved: 20, yearRevenue: 300 },
    { id: 'F4', yearCases: 0, yearAchieved: 0, yearRevenue: 0 },
  ];
  const r = rankings({ firms, people: [] });
  assert.deepEqual(r.ranking.map(x => x.firmId), ['F1', 'F3', 'F2', 'F4']);
  assert.deepEqual(r.throughputRanking.map(x => x.firmId), ['F3', 'F2', 'F1', 'F4']);
  assert.deepEqual(r.achievementRanking.map(x => x.firmId), ['F2', 'F3']);
  for (const e of world.events.filter(e => e.ranking)) {
    assert.deepEqual(e.achievementRanking.map(r => r.firmId).sort(), e.ranking.filter(r => r.cases >= 20).map(r => r.firmId).sort());
    assert.deepEqual(e.ranking.map(r => r.revenue), e.ranking.map(r => r.revenue).sort((a,b) => b-a));
    assert.deepEqual(e.throughputRanking.map(r => r.cases), e.throughputRanking.map(r => r.cases).sort((a,b) => b-a));
  }
});

test('individual personnel news uses historical prominence; summary source records remain in stats', () => {
  const articleIds = new Set(report.articles.filter(a => a.category === '인사' && a.type !== 'personnel_summary').map(a => a.eventId));
  const statsIds = new Set(report.stats.events.map(e => e.id));
  const major = new Set(); let top = new Set(world.firms.slice(0,10).map(f => f.id)); let omitted = 0;
  for (const e of world.events) {
    if ((e.type === 'person_entered' && e.detail === 'major') || e.type === 'person_prominent') major.add(e.personIds[0]);
    if (e.ranking) top = new Set(e.ranking.slice(0,10).map(f => f.firmId));
    const eligible = (e.personIds || []).some(id => major.has(id)) || [e.firmId,e.from,e.to].some(id => top.has(id));
    if (articleIds.has(e.id)) assert.ok(eligible);
    if (!eligible && e.type === 'leave_started') { assert.ok(statsIds.has(e.id)); omitted++; }
  }
  assert.ok(omitted > 0);
});

test('transfers require both strict utility improvement and unused hiring quota', () => {
  const person = { motive: 'money' };
  const current = { pay: 50 };
  const target = { pay: 62, hireQuota: 1, yearHires: 0 };
  assert.equal(canHire(target), true);
  assert.equal(canTransfer(person, current, target, [], []), false);
  target.pay = 63;
  assert.equal(canTransfer(person, current, target, [], []), true);
  target.yearHires = 1;
  assert.equal(canTransfer(person, current, target, [], []), false);
  assert.equal(canTransfer(person, current, undefined, [], []), false);
});

test('annual hiring budgets, cooldowns and transfers replay from records', () => {
  const budgets = new Map(), remainders = new Map(), moves = new Map();
  for (const e of world.events) {
    if (e.type === 'person_entered') moves.set(e.personIds[0], e.lastMove);
    if (e.type === 'hiring_budget') {
      const solo = world.firms.find(f => f.id === e.firmId).strategy === '1인';
      const allowance = solo ? 0 : e.population * KO.policy.hiringRate + (remainders.get(e.firmId) || 0);
      assert.equal(e.hireQuota, Math.floor(allowance));
      assert.equal(e.hireRemainder, allowance - e.hireQuota);
      remainders.set(e.firmId, e.hireRemainder);
      budgets.set(e.firmId, { quota: e.hireQuota, used: 0 });
    }
    if (['person_moved', 'person_hired'].includes(e.type)) {
      if (e.reason === 'spring') {
        assert.ok(e.springHires <= e.springQuota);
      } else if (e.reason !== 'founding') {
        const b = budgets.get(e.to);
        assert.ok(b && b.used < b.quota);
        b.used++;
        assert.equal(e.yearHires, b.used);
        assert.equal(e.hireQuota, b.quota);
      }
      if (e.from) {
        assert.ok(e.week - moves.get(e.personIds[0]) >= 52);
        if (e.reason !== 'founding') assert.ok(e.utilityGain > 12);
      }
      moves.set(e.personIds[0], e.week);
    }
  }
  for (const y of report.stats.annual) {
    const events = world.events.filter(e => e.week > 0 && calendar(e.week).year === y.year);
    assert.equal(y.transfers, events.filter(e => e.type === 'person_moved' && e.reason !== 'founding').length);
    assert.equal(y.openings, events.filter(e => e.type === 'firm_opened').length);
  }
});

test('weekly supply and firm capacity scale with recorded lawyer population', () => {
  let market, counts;
  const finish = () => {
    if (!market) return;
    assert.equal([...counts.values()].reduce((a,b) => a+b, 0), market.supply);
    for (const f of market.capacities) assert.ok((counts.get(f.firmId) || 0) <= f.capacity);
  };
  for (const e of world.events) {
    if (e.type === 'weekly_market') {
      finish(); market = e; counts = new Map();
      assert.equal(e.supply, Math.round(e.activeLawyers * 12 / 52));
      for (const f of e.capacities) {
        const capacity = world.firms.find(x => x.id === f.firmId).capacity;
        assert.equal(f.capacity, (f.working - f.recovering) * capacity + f.recovering * Math.min(capacity, KO.policy.recoveryCapacity));
      }
    }
    if (e.type === 'case_completed' || e.type === 'case_unserved') counts.set(e.firmId, (counts.get(e.firmId) || 0) + 1);
  }
  finish();
  for (const y of report.stats.annual) {
    const average = world.events.filter(e => e.type === 'weekly_census' && calendar(e.week).year === y.year).reduce((n,e) => n + e.lawyers, 0) / 52;
    assert.equal(y.averageLawyers, average);
    const completed = world.events.filter(e => e.type === 'case_completed' && calendar(e.week).year === y.year).length;
    assert.equal(y.cases, completed);
    assert.equal(y.casesPerLawyer, completed / average);
  }
});

test('founding gate counts active firms against initial experiment size', () => {
  const state = { initialFirmCount: 35, firms: Array.from({ length: 42 }, () => ({})) };
  assert.equal(canFound(state), false);
  state.firms[0].closedWeek = 1;
  assert.equal(canFound(state), true);
});

test('annual strategy leaders match revenue rankings and appear in the year-end news', () => {
  for (const y of report.stats.annual) {
    assert.equal(y.strategyLeaders.length, 5);
    const article = report.articles.find(a => a.eventId === y.eventId);
    assert.ok(article);
    for (const leader of y.strategyLeaders) {
      assert.deepEqual(leader, y.ranking.find(f => f.strategy === leader.strategy));
      assert.ok(article.body.includes(`${leader.name}(${leader.firmId})`));
    }
  }
});

test('overload raises burnout risk; return capacity falls and expires exactly', () => {
  assert.equal(burnoutRisk({ fatigue: 0 }), 0);
  assert.equal(burnoutRisk({ fatigue: KO.policy.burnoutThreshold }), 0);
  assert.ok(burnoutRisk({ fatigue: 100 }) > burnoutRisk({ fatigue: 70 }));
  const person = { recoveryUntil: 30 }, firm = { capacity: 3 };
  assert.equal(workCapacity(person, firm, 29), 1);
  assert.equal(workCapacity(person, firm, 30), 3);
  const recovering = new Map();
  let checked = 0;
  for (const e of world.events) {
    if (e.type === 'leave_returned' && e.leaveType === 'burnout') {
      assert.equal(e.recoveryUntil - e.week, KO.policy.recoveryWeeks);
      recovering.set(e.personIds[0], e.recoveryUntil);
    }
    if (e.type === 'case_completed' && recovering.get(e.personIds[0]) > e.week) {
      assert.ok(e.input.workload < KO.policy.recoveryCapacity);
      checked++;
    }
    if (e.type === 'monthly_leave_risk') assert.ok(Math.abs(e.starts - e.expectedStarts) < 1);
  }
  assert.ok(checked > 0);
});

test('closures conserve firm identities and remove all hiring, assignments and ranking access', () => {
  const closed = new Set();
  let firms = 0, openings = 0, closures = 0;
  for (const e of world.events) {
    if (e.type === 'market_year') { openings = 0; closures = 0; }
    if (e.type === 'firm_opened') { firms++; if (e.week) openings++; }
    if (e.type === 'firm_closed') {
      assert.ok(!closed.has(e.firmId));
      assert.equal(world.firms.find(f => f.id === e.firmId).closedWeek, e.week);
      if (e.reason === 'revenue') assert.ok(e.windowRevenue < KO.policy.minimumWeeklyRevenue * e.windowWeeks);
      closed.add(e.firmId); firms--; closures++;
    }
    if (['hiring_budget', 'case_completed'].includes(e.type)) assert.ok(!closed.has(e.firmId));
    if (e.type === 'person_hired' || e.type === 'person_moved') assert.ok(!closed.has(e.to));
    if (e.ranking) for (const row of e.ranking) assert.ok(!closed.has(row.firmId));
    if (e.type === 'weekly_market') for (const row of e.capacities) assert.ok(!closed.has(row.firmId));
    if (e.type === 'year_closed') {
      assert.equal(e.firmCount, firms); assert.equal(e.openings, openings); assert.equal(e.closures, closures);
    }
  }
  assert.ok(closed.size > 0);
  assert.equal(canHire({ closedWeek: 10, hireQuota: 99, yearHires: 0 }), false);
  assert.ok(world.people.filter(p => p.status !== 'retired').every(p => !closed.has(p.firmId)));
});

test('employment terms change utility without forcing a transfer or replacing motives', () => {
  const p = { motive: 'public' }, current = { public: 70, offer: { public: 10 } };
  const target = { public: 70, offer: { public: 0 }, hireQuota: 1, yearHires: 0 };
  assert.equal(canTransfer(p, current, target, [], []), false);
  target.offer.public = 23;
  assert.equal(canTransfer(p, current, target, [], []), true);
  target.yearHires = 1;
  assert.equal(canTransfer(p, current, target, [], []), false);
  const terms = world.events.filter(e => e.type === 'employment_terms');
  assert.ok(terms.length > 35);
  for (const e of terms) for (const value of Object.values(e.offer)) assert.ok(Math.abs(value) <= KO.policy.offerSpread);
});

test('news metadata, monthly summaries and source links replay genuine records', () => {
  const events = new Map(world.events.map(e => [e.id, e]));
  const people = new Set(world.people.map(p => p.id)), firms = new Set(world.firms.map(f => f.id));
  const ids = new Set(), months = new Set();
  const promotions = new Set();
  for (const a of report.articles) {
    assert.ok(!ids.has(a.eventId)); ids.add(a.eventId);
    assert.ok(NEWS.categories.includes(a.category));
    assert.ok(Number.isInteger(a.importance) && a.importance >= 1 && a.importance <= 5);
    assert.ok(a.firmIds.every(id => firms.has(id)));
    assert.ok(a.personIds.every(id => people.has(id)));
    assert.ok(a.eventIds.length > 0);
    if (a.type === 'firm_opened') {
      assert.equal(a.personIds.length, 1);
      assert.ok(world.events.some(e => ['person_moved', 'person_hired'].includes(e.type) && e.reason === 'founding'
        && e.to === a.firmIds[0] && e.personIds[0] === a.personIds[0]));
    }
    for (const id of a.eventIds) {
      assert.ok(events.has(id)); assert.ok(events.get(id).week <= a.week);
      if (events.get(id).type === 'person_prominent') promotions.add(id);
    }
    assert.notEqual(a.type, 'person_prominent');
    if (a.type === 'personnel_summary') {
      const key = `${a.year}/${a.month}`;
      assert.ok(!months.has(key)); months.add(key);
      for (const id of a.eventIds) {
        const date = calendar(events.get(id).week);
        assert.equal(date.year, a.year); assert.equal(date.month, a.month);
      }
    }
  }
  assert.equal(promotions.size, world.events.filter(e => e.type === 'person_prominent').length);
  assert.ok(months.size > 0);
});

test('annual top ten and weekly selection are deterministic, relevant and free of future news', () => {
  for (const y of report.annualTopTen) {
    assert.equal(y.articles.length, 10);
    assert.deepEqual(y.articles, [...y.articles].sort(articleOrder));
    const ids = y.articles.flatMap(a=>a.personIds);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(y.articles.some(a=>a.type === 'firm_opened'));
    assert.ok(y.articles.some(a=>a.largeTransfer));
  }
  for (const page of report.weeklyFrontPages) {
    assert.ok(page.articles.length >= 1 && page.articles.length <= 7);
    assert.equal(new Set(page.articles.map(a => a.eventId)).size, page.articles.length);
    assert.ok(page.articles.every(a => a.week <= page.week && a.week > page.week - NEWS.lookbackWeeks));
  }
  const article = (eventId, week, importance, firmIds = []) => ({ eventId, week, importance,
    category: '시장', firmIds, personIds: [], specialties: [] });
  const fixtures = [article('one', 1, 5), article('mine', 1, 1, ['F1']), article('future', 2, 5, ['F1'])];
  assert.equal(frontPage(fixtures, 1, { myFirmId: 'F1' })[0].eventId, 'mine');
  assert.equal(frontPage(fixtures, 1).length, 2); // Never invent filler when no source exists.
  assert.deepEqual(frontPage([], 1), []);
  const sample = renderNews(report, 1);
  assert.equal((sample.match(/주간 1면/g) || []).length, 52);
  assert.ok(!sample.includes('## 2년'));
  const mine = present(world, { myFirmId: 'F0005' });
  assert.ok(mine.articles.some(a => a.category === '내 로펌'));
  for (const a of mine.articles.filter(a => a.firmIds.includes('F0005'))) assert.equal(a.category, '내 로펌');
});

test('ko pack owns new local labels and calibration; service outcome remains RNG-free', () => {
  const source = fs.readFileSync(path.join(__dirname, 'simulation.js'), 'utf8');
  for (const label of [KO.officeSuffix, ...KO.surnames, ...KO.names]) assert.ok(!source.includes(`'${label}'`));
  for (const key of ['officeQuotas', 'retirementAge', 'inflowRate', 'hiringRate', 'events']) assert.ok(source.includes(`policy.${key}`));
  assert.ok(!source.includes('Math.random'));
  assert.ok(!resolveCase.toString().includes('random('));
  assert.ok(!resolveCase.toString().includes('formerOffice'));
  assert.deepEqual(world.pack, { id: KO.id, version: KO.version });
});

test('CLI parsing rejects unknown, duplicate, missing and non-integer arguments', () => {
  assert.deepEqual(parseArgs([]), { years: 10, seed: 1 });
  assert.deepEqual(parseArgs(['--seed', '0', '--years', '2']), { years: 2, seed: 0 });
  for (const args of [['--x', '1'], ['--seed'], ['--seed', '1.5'], ['--years', '-1'], ['--seed', '1', '--seed', '2']]) {
    assert.throws(() => parseArgs(args));
  }
});

test('real CLI is reproducible from different directories; invalid input preserves artifacts', () => {
  const run = path.join(__dirname, 'run.js');
  const read = () => ['news.md', 'stats.json'].map(name => fs.readFileSync(path.join(__dirname, 'out', name), 'utf8'));
  const first = spawnSync(process.execPath, [run, '--years', '10', '--seed', '1'], { cwd: __dirname, encoding: 'utf8' });
  assert.equal(first.status, 0, first.stderr);
  const before = read();
  assert.equal(before[0], report.news);
  assert.equal(before[1], JSON.stringify(report.stats, null, 2) + '\n');
  const second = spawnSync(process.execPath, [run, '--years', '10', '--seed', '1'], { cwd: path.dirname(__dirname), encoding: 'utf8' });
  assert.equal(second.status, 0, second.stderr);
  assert.deepEqual(read(), before);
  const invalid = spawnSync(process.execPath, [run, '--years', '0'], { encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.deepEqual(read(), before);
});


test('spring quota is independent; blocked novices enter the statistical layer after the search window', () => {
  const s = initialState(19);
  for (let i = 0; i < 9; i++) step(s);
  for (const f of s.firms) { f.yearHires = f.hireQuota; f.springQuota = 0; f.springHires = 0; }
  const target = s.firms.find(f => !f.closedWeek && f.strategy !== '1인');
  target.springQuota = 1;
  const before = s.nextPerson;
  step(s);
  const entrants = s.people.filter(p => Number(p.id.slice(1)) >= before);
  assert.ok(entrants.length > 1);
  const hires = s.events.filter(e => e.week === s.week && e.reason === 'spring');
  assert.equal(hires.length, 1);
  assert.equal(hires[0].to, target.id);
  assert.equal(target.yearHires, target.hireQuota);
  assert.equal(canHire(target), false);
  assert.equal(canHire(target, true), false);
  for (let i = 0; i < 31; i++) {
    for (const f of s.firms) { f.yearHires = f.hireQuota; f.springQuota = f.springHires; }
    step(s);
  }
  const exits = s.events.filter(e => e.type === 'market_exit' && entrants.some(p => p.id === e.personIds[0]));
  assert.ok(exits.length > 0);
  for (const e of exits) {
    const p = s.people.find(p=>p.id===e.personIds[0]);
    assert.equal(p.status, 'statistical'); assert.equal(p.firmId, null);
    assert.ok(KO.policy.exits.includes(e.destination)); assert.ok(p.history.includes(e.id));
    assert.ok(!s.events.some(c=>c.type==='case_completed' && c.week >= e.week && c.personIds.includes(p.id)));
  }
});

test('dated policy applies once across chunks and records quota departures without deleting people', () => {
  const service = createWorld(1);
  service.advance(39);
  assert.equal(service.snapshot().events.filter(e=>e.type==='policy_changed').length, 0);
  service.advance(2);
  const s = service.snapshot(), change = s.events.find(e=>e.type==='policy_changed');
  assert.equal(change.effectiveDate, '2026-10-02');
  assert.ok(change.appliedDate >= change.effectiveDate);
  assert.equal(s.people.filter(p=>['working','leave'].includes(p.status) && p.role==='prosecutor').length, KO.policy.events[0].quota);
  assert.equal(s.events.filter(e=>e.type==='office_departure' && e.reason===change.policyId).length, 6);
  service.advance(63);
  assert.equal(service.snapshot().events.filter(e=>e.type==='policy_changed').length, 1);
  assert.deepEqual(service.snapshot(), simulate({ years:2, seed:1 }));
});

test('N4: ability affects preparation time, fixed action records give identical outcomes', () => {
  const input = { skill:40, experience:0, specialty:'criminal', type:'criminal', workload:0, difficulty:60 };
  const slow = prepareCase(input), fast = prepareCase({ ...input, skill:80 });
  assert.ok(fast.minutesPerTask < slow.minutesPerTask);
  assert.ok(fast.reviewedTasks > slow.reviewedTasks);
  assert.ok(prepareCase({ ...input, workload:2 }).reviewedTasks < slow.reviewedTasks);
  assert.equal(resolveCase({ preparation:slow, difficulty:60 }).achieved, false);
  assert.equal(resolveCase({ preparation:fast, difficulty:60 }).achieved, true);
  assert.deepEqual(resolveCase({ ...input, preparation:slow }), resolveCase({ ...input, skill:100, experience:10000, formerOffice:'judge', preparation:slow }));
});

test('news respects statistics limit, preceding issue exclusions, historical roles and closure dates', () => {
  const statistical = new Set(['weekly_market','service_brief','monthly_ranking','year_closed','personnel_summary']);
  let previous = new Set();
  for (const page of report.weeklyFrontPages) {
    assert.ok(page.articles.filter(a=>statistical.has(a.type)).length <= 1);
    assert.ok(page.articles.every(a=>!previous.has(a.eventId)));
    previous = new Set(page.articles.map(a=>a.eventId));
  }
  const events = new Map(world.events.map(e=>[e.id,e]));
  for (const a of report.articles) {
    if (a.type==='monthly_ranking') {
      const e = events.get(a.eventId);
      if (a.month !== 1) assert.ok(!a.body.includes('1월 실적 초기화'));
      if (!e.ranking[0].revenue) assert.ok(!a.title.includes('선두'));
    }
    if (a.type==='judge_rotation') assert.ok(a.body.includes(world.events.filter(e=>e.type==='judge_rotation' && e.week===a.week).length+'명'));
    if (a.type==='personnel_summary') for (const id of a.firmIds) {
      const f=world.firms.find(f=>f.id===id); assert.ok(!f.closedWeek || f.closedWeek>a.week);
    }
    if (['major_case','precedent_notice'].includes(a.type)) {
      const e=events.get(a.eventId); assert.ok(events.has(e.sourceEventId));
      if (a.type==='precedent_notice') assert.equal(e.fixture,true);
    }
  }
  assert.ok(report.articles.some(a=>a.category==='대형사건'));
  assert.ok(report.articles.some(a=>a.category==='판례'));
  const fixture = initialState(4), person = fixture.people[0];
  fixture.week = 54;
  const append = (type, week, leaveType) => fixture.events.push({ id: 'E' + String(fixture.nextEvent++).padStart(7,'0'),
    type, week, personIds:[person.id], role:'lawyer', firmId:null, leaveType, returnWeek:week+26 });
  append('leave_started',1,'parenting'); append('leave_returned',27,'parenting');
  append('leave_started',28,'public'); append('leave_returned',54,'public');
  person.role = 'judge'; // Current role must not overwrite historical event wording.
  const oldStart = NEWS.types.leave_started, oldReturn = NEWS.types.leave_returned;
  try {
    // Expose individual copy independently of the low-importance monthly grouping policy.
    NEWS.types.leave_started = ['인사',3]; NEWS.types.leave_returned = ['인사',3];
    const articles = present(fixture).articles.filter(a=>['leave_started','leave_returned'].includes(a.type));
    assert.equal(articles.length,4);
    for (const a of articles) {
      assert.ok(a.body.includes('무소속')); assert.ok(!a.body.includes('피로'));
      assert.ok(!a.body.includes('공직의')); assert.ok(!a.body.includes('소속: 공직'));
    }
  } finally { NEWS.types.leave_started = oldStart; NEWS.types.leave_returned = oldReturn; }
});

test('twenty years in three seeds meet employment, firm, transfer and leave targets from raw events', () => {
  const { audit } = require('./audit');
  for (const seed of [1,2,3]) {
    const state=simulate({years:20,seed}), rows=audit(state.events);
    // Aggregate fields are deliberately corrupted: the independent replay must not use them.
    assert.deepEqual(rows,audit(state.events.map(e=>['year_closed','weekly_census'].includes(e.type) ? {id:e.id,type:e.type,week:e.week,total:-999,lawyers:-999} : e)));
    assert.equal(rows.length,20);
    for (const y of rows) {
      assert.ok(y.unemployedRate<=0.10);
      assert.ok(y.openingRate>=0.02 && y.openingRate<=0.04);
      assert.ok(y.firmCount>=28 && y.firmCount<=42);
      assert.ok(y.transferRate>=0.07 && y.transferRate<=0.10);
      assert.ok(y.leaveRate>=0.03 && y.leaveRate<=0.05);
      assert.ok(y.burnoutRate<=y.leaveRate);
      assert.equal(y.judges,KO.policy.officeQuotas.judge);
      assert.equal(y.prosecutors,KO.policy.events[0].quota);
      const summary=state.events.find(e=>e.type==='year_closed' && e.year===y.year);
      assert.equal(y.transfers,summary.transfers); assert.equal(y.openings,summary.openings);
      assert.equal(y.leaves,summary.leaveStarts); assert.equal(y.burnout,summary.burnoutStarts);
      assert.equal(y.population,summary.total);
    }
    const mean=(list,key)=>list.reduce((n,y)=>n+y[key],0)/list.length;
    // Allow 0.5 percentage points of finite-population rounding, not secular decline/growth.
    assert.ok(mean(rows.slice(-5),'transferRate') >= mean(rows.slice(0,5),'transferRate')-0.005);
    assert.ok(mean(rows.slice(-5),'leaveRate') <= mean(rows.slice(0,5),'leaveRate')+0.005);
    assert.ok(mean(rows.slice(-5),'unemployedRate') <= mean(rows.slice(0,5),'unemployedRate')+0.005);
  }
});
