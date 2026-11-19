'use strict';
// LOOP-001: 12주 위임 루프. 공식, 철회, 폐업, 시드 고정 자동 플레이.
const test = require('node:test');
const assert = require('node:assert/strict');
const cases = require('../data/cases.json');
const Loop = require('../src/loop.js');

function matter(id, extra) {
  return Object.assign({
    id: id,
    title: id,
    difficulty: 1,
    fee: 3000000,
    durationWeeks: 4,
    keyStat: '변론',
    tasks: [{ name: '서면 초안', role: '보조원', staffStat: '정확' }],
    lines: { win: '이겼다.', settle: '조정했다.', lose: '졌다.' },
    news: { win: id + ' 승', lose: id + ' 패' },
    client: { name: '의뢰인', oneLine: '한 줄' }
  }, extra);
}

const takeAll = {
  chooseAccepts: function (state) { return state.offers.map(function (offer) { return offer.id; }); },
  chooseAssignments: Loop.autoPolicy.chooseAssignments
};

test('업무 성공률 P와 판결 확률 V는 설계 예시와 클램프를 따른다', () => {
  assert.deepEqual(Loop.taskRate({ core: 5, fit: true, partnerBonus: 0, difficulty: 1, fatigue: 10 }), { p: 63, success: 63, partial: 20, fail: 17 });
  assert.deepEqual(Loop.taskRate({ core: 7, fit: true, partnerBonus: 12, difficulty: 1, fatigue: 30 }), { p: 83, success: 83, partial: 12, fail: 5 });
  assert.deepEqual(Loop.taskRate({ core: 4, fit: false, partnerBonus: 10, difficulty: 1, fatigue: 30 }), { p: 53, success: 53, partial: 20, fail: 27 });
  assert.deepEqual(Loop.taskRate({ core: 10, fit: true, partnerBonus: 20, difficulty: 1, fatigue: 0 }), { p: 95, success: 95, partial: 0, fail: 5 });
  assert.deepEqual(Loop.taskRate({ core: 1, fit: false, partnerBonus: 0, difficulty: 3, fatigue: 200 }), { p: 10, success: 10, partial: 20, fail: 70 });
  assert.equal(Loop.taskRate({ core: 5, fit: true, partnerBonus: 0, difficulty: 1, fatigue: 14 }).p, 63);
  assert.equal(Loop.taskRate({ core: 5, fit: true, partnerBonus: 0, difficulty: 1, fatigue: 15 }).p, 62);
  assert.deepEqual(Loop.verdictRate({ prep: 3, stat: 5, difficulty: 1 }), { v: 55, win: 55, partial: 20, lose: 25 });
  assert.deepEqual(Loop.verdictRate({ prep: 10, stat: 10, difficulty: 1 }), { v: 95, win: 95, partial: 0, lose: 5 });
  assert.deepEqual(Loop.verdictRate({ prep: 0, stat: 1, difficulty: 3 }), { v: 5, win: 5, partial: 20, lose: 75 });
  var stats = { 분석: 6, 변론: 5, 협상: 5, 영업: 4 };
  assert.equal(Loop.partnerBonus({ role: '사무원', staffStat: '정확' }, stats), 0);
  assert.equal(Loop.partnerBonus({ role: '보조원', staffStat: '정확' }, stats), 12);
  assert.equal(Loop.partnerBonus({ role: '보조원', staffStat: '응대' }, stats), 10);
  assert.equal(Loop.partnerBonus({ role: '사무원', staffStat: '속도' }, stats), 0);
  assert.equal(Loop.offerCount(1), 2);
  assert.equal(Loop.offerCount(4), 3);
  assert.equal(Loop.offerCount(5), 3);
  assert.equal(Loop.offerCount(8), 4);
  assert.equal(Loop.scaleRetainer(2500000, 4), 2425000);
  assert.equal(Loop.scaleRetainer(2500000, 5), 2500000);
  assert.equal(Loop.scaleRetainer(2500000, 10), 2875000);
});

test('성공보수가 있는 사건은 승소 시 전액, 준비도 공식으로 판결한다', () => {
  const run = Loop.createRun({
    seed: 1,
    cases: [matter('fee-case', { fee: { retainer: 2500000, success: 3000000 }, durationWeeks: 2, tasks: [
      { name: '기록 정리', role: '사무원', staffStat: '정확' },
      { name: '서면 초안', role: '보조원', staffStat: '정확' }
    ] })],
    policy: takeAll,
    next: function () { return 0; }
  });
  Loop.advanceWeek(run);
  const week = run.state.lastWeek;
  assert.equal(week.verdicts.length, 1);
  assert.equal(week.verdicts[0].outcome, 'win');
  assert.equal(week.verdicts[0].v, 65);
  assert.equal(week.verdicts[0].successFee, 3000000);
  assert.equal(week.accepted[0].retainer, 2500000);
  assert.equal(run.state.reputation, 3);
  assert.equal(run.state.revenue, 5500000);
});

test('기한을 2주 넘기면 철회하고 명성이 2 줄고, 응대 실패는 1 준다', () => {
  const slow = Loop.createRun({
    seed: 1,
    cases: [matter('slow', { durationWeeks: 1, tasks: [
      { name: '기록 정리', role: '사무원', staffStat: '정확' },
      { name: '의뢰인 응대', role: '사무원', staffStat: '응대' }
    ] })],
    policy: {
      chooseAccepts: function (state) { return state.offers.map(function (offer) { return offer.id; }); },
      chooseAssignments: function () { return []; }
    }
  });
  Loop.advanceWeek(slow);
  Loop.advanceWeek(slow);
  assert.equal(slow.state.matters[0].status, 'active');
  assert.equal(slow.state.reputation, 0);
  Loop.advanceWeek(slow);
  assert.equal(slow.state.matters[0].status, 'withdrawn');
  assert.equal(slow.state.reputation, -2);

  const rude = Loop.createRun({
    seed: 1,
    cases: [matter('rude', { tasks: [
      { name: '기록 정리', role: '사무원', staffStat: '정확' },
      { name: '의뢰인 응대', role: '사무원', staffStat: '응대' }
    ] })],
    policy: {
      chooseAccepts: function (state) { return [state.offers[0].id]; },
      chooseAssignments: function (state) {
        const found = state.matters[0];
        const taskIndex = found.tasks.findIndex(function (task) { return task.staffStat === '응대'; });
        return [{ caseId: found.id, taskIndex: taskIndex, staffId: 'kim' }];
      }
    },
    next: function () { return 0.99; }
  });
  Loop.advanceWeek(rude);
  assert.equal(rude.state.matters[0].status, 'active');
  assert.equal(rude.state.matters[0].tasks[1].result, 'fail');
  assert.equal(rude.state.reputation, -1);
});

test('현금이 2주 연속 마이너스면 12주 전에 폐업한다', () => {
  const state = Loop.runSeason({ seed: 1, cases: [] });
  assert.equal(state.ending.kind, 'bankrupt');
  assert.equal(state.ending.label, '폐업');
  assert.equal(state.weeksPlayed, 6);
  assert.equal(state.cash, -5000000);
  assert.equal(state.tier, 1);
});

test('12주에 명성 60·누적 매출 1억이면 위대한 로펌, 못 채우면 도달 등급이다', () => {
  const many = [];
  for (let i = 0; i < 20; i++) many.push(matter('g' + i, { fee: 5000000, durationWeeks: 4 }));
  const great = Loop.runSeason({ seed: 1, cases: many, policy: takeAll, next: function () { return 0; } });
  assert.equal(great.ending.kind, 'great');
  assert.equal(great.ending.label, '위대한 로펌');
  assert.equal(great.weeksPlayed, 12);
  assert.ok(great.reputation >= 60);
  assert.ok(great.revenue >= 100000000);
  assert.equal(great.tier, 3);

  const few = [];
  for (let i = 0; i < 4; i++) few.push(matter('t' + i, { fee: 10000000, durationWeeks: 4 }));
  const tier = Loop.runSeason({ seed: 1, cases: few, policy: takeAll, next: function () { return 0; } });
  assert.equal(tier.ending.kind, 'tier');
  assert.equal(tier.tier, 1);
  assert.equal(tier.ending.label, 'T1 개인 사무소');
  assert.equal(tier.weeksPlayed, 12);
  assert.ok(tier.cash >= 0);
});

test('12주를 넘는 사건은 수임되지 않고, 사건 원본은 그대로다', () => {
  const before = JSON.stringify(cases);
  const extra = JSON.parse(before);
  extra.push(matter('long-case', { durationWeeks: 14 }));
  const state = Loop.runSeason({ seed: 1, cases: extra });
  assert.ok(state.excluded.some(function (row) { return row.id === 'long-case' && row.reason === 'over-12'; }));
  const accepted = state.weekLog.flatMap(function (week) { return week.accepted.map(function (row) { return row.id; }); });
  assert.equal(accepted.indexOf('long-case'), -1);
  const byId = new Map(cases.map(function (entry) { return [entry.id, entry]; }));
  for (const week of state.weekLog) for (const row of week.accepted) {
    if (byId.has(row.id)) assert.ok(byId.get(row.id).durationWeeks <= 12);
  }
  assert.equal(JSON.stringify(cases), before);
});

test('같은 시드의 12주 자동 플레이는 같고, 한 주씩 진행해도 같으며, 실패하면 상태가 그대로다', () => {
  const a = Loop.runSeason({ seed: 7, cases: cases });
  const b = Loop.runSeason({ seed: 7, cases: cases });
  assert.deepEqual(a, b);
  assert.ok(a.ending);
  assert.ok(a.weeksPlayed >= 1 && a.weeksPlayed <= 12);
  assert.notDeepEqual(Loop.runSeason({ seed: 1, cases: cases }), Loop.runSeason({ seed: 2, cases: cases }));

  const stepped = Loop.createRun({ seed: 4, cases: cases });
  while (!stepped.state.ending) Loop.advanceWeek(stepped);
  assert.deepEqual(stepped.state, Loop.runSeason({ seed: 4, cases: cases }));
  const frozen = JSON.stringify(stepped.state);
  Loop.advanceWeek(stepped);
  assert.equal(JSON.stringify(stepped.state), frozen);

  const broken = Loop.createRun({
    seed: 1,
    cases: [matter('boom')],
    policy: {
      chooseAccepts: function () { throw new Error('멈춤'); },
      chooseAssignments: function () { return []; }
    }
  });
  const snapshot = JSON.stringify(broken.state);
  assert.throws(function () { Loop.advanceWeek(broken); }, /멈춤/);
  assert.equal(JSON.stringify(broken.state), snapshot);
  Loop.advanceWeek(Object.assign(broken, { policy: takeAll }));
  assert.equal(broken.state.weeksPlayed, 1);
});
