'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createWorld, simulate } = require('./service');
const { resolveCase, clientAppeal } = require('./simulation');
const { present } = require('./presentation');
const { calendar, LEAVES } = require('./data');
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
  service.advance(52);
  const prefix = service.snapshot().events;
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
  assert.equal(s.firms.length, 5);
  assert.equal(new Set(s.firms.map(f => f.strategy)).size, 5);
  for (const [role, count] of [['lawyer', 60], ['judge', 8], ['prosecutor', 6]]) {
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
    if (e.type === 'person_retired') population--;
    if (['weekly_census', 'year_closed'].includes(e.type)) assert.equal(e.total, population);
    if (e.type === 'weekly_census') assert.equal(e.working + e.onLeave, e.total);
  }
  assert.equal(population, world.people.filter(p => p.status !== 'retired').length);
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
      if (e.leaveType === 'burnout') assert.ok(e.fatigue > 35);
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
  assert.equal(rotations.length, 80);
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

test('ten-year seed 1 observation: stable weekly population and multiple leaders', () => {
  assert.equal(report.stats.annual.length, 10);
  assert.ok(report.stats.observations.withinExperimentalPopulationBand);
  assert.ok(report.stats.observations.noSingleFirmLeadsEveryYear);
  for (const year of report.stats.annual) {
    assert.equal(year.population.judge, 8);
    assert.equal(year.population.prosecutor, 6);
  }
});

test('20 seed sensitivity runs keep weekly population within the experimental band', () => {
  for (let seed = 0; seed < 20; seed++) {
    const s = seed === 1 ? world : simulate({ years: 10, seed });
    const census = s.events.filter(e => e.type === 'weekly_census');
    assert.ok(census.every(e => e.total >= 60 && e.total <= 90), `population seed ${seed}`);
    const leaders = new Set(s.events.filter(e => e.type === 'year_closed').map(e => e.ranking[0].firmId));
    assert.ok(leaders.size > 1, `single leader seed ${seed}`);
  }
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
