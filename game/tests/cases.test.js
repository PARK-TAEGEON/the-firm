'use strict';
// 데모 사건 24건. 스키마, 난이도 10/8/6, 12주 상한, 의뢰인 이름. node --test tests/cases.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const cases = require('../data/cases.json');

const KEY_STATS = ['분석', '변론', '협상', '영업'];
const TYPES = ['형사', '민사', '자문'];
const ROLES = ['사무원', '보조원'];
const STAFF_STATS = ['정확', '속도', '응대'];
const ARCHETYPES = [
  'ARCH_CRIMINAL_ASSAULT', 'ARCH_DUI', 'ARCH_THEFT', 'ARCH_RESALE_FRAUD',
  'ARCH_BUSINESS_EMBEZZLEMENT', 'ARCH_ONLINE_DEFAMATION', 'ARCH_TRAFFIC_INJURY',
  'ARCH_RESIDENTIAL_INTRUSION', 'ARCH_FALSE_REPORT', 'ARCH_OBSTRUCTION_THREAT'
];
const ROLE_NAMES = new Set(['의뢰인', '재판장', '변호인', '목격자', '피고인', '검사', '피해자']);
const COMPOUND_SURNAMES = ['남궁', '선우', '제갈', '사공', '독고', '황보'];

function chars(value) {
  return Array.from(value).length;
}

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(js|json)$/.test(name)) acc.push(full);
  }
  return acc;
}

// 직원·기존 의뢰인·법정 인물. engine.js와 court data의 name/client만 본다.
function reservedNames() {
  const files = walk(path.join(__dirname, '../vendor/court/data'), [
    path.join(__dirname, '../vendor/firm/engine.js')
  ]);
  const names = new Set();
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/(?:name|client):\s*['"]([가-힣]{2,4})['"]/g)) {
      if (!ROLE_NAMES.has(match[1])) names.add(match[1]);
    }
  }
  return names;
}

function surnameOf(name) {
  const compound = COMPOUND_SURNAMES.find(item => name.startsWith(item) && name.length > item.length);
  return compound || Array.from(name)[0];
}

// CASES.md 난이도 규칙과 같다. 실험용 authored 규칙, DEC 아님.
function difficultyOf(entry) {
  const strengthPts = entry.issueStrength >= 4.5 ? 2 : entry.issueStrength >= 4 ? 1 : 0;
  const twistPts = entry.activeTwists >= 3 ? 2 : entry.activeTwists >= 2 ? 1 : 0;
  const weekPts = entry.durationWeeks >= 10 ? 1 : 0;
  const sum = strengthPts + twistPts + weekPts;
  if (sum <= 1) return 1;
  if (sum <= 3) return 2;
  return 3;
}

function sentenceCount(text) {
  assert.match(text, /[.?!]$/);
  return (text.match(/[.?!]/g) || []).length;
}

test('24건이고 id는 고유하며 난이도는 10/8/6, 능력치 4종이 모두 있다', () => {
  assert.equal(cases.length, 24);
  assert.equal(new Set(cases.map(entry => entry.id)).size, 24);
  assert.equal(new Set(cases.map(entry => entry.title)).size, 24);
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const entry of cases) counts[entry.difficulty] += 1;
  assert.deepEqual(counts, { 1: 10, 2: 8, 3: 6 });
  for (const stat of KEY_STATS) assert.equal(cases.some(entry => entry.keyStat === stat), true);
});

test('스키마, 수임료 정액, 글자 수, 원형 10종×2를 지킨다', () => {
  const perArchetype = Object.fromEntries(ARCHETYPES.map(id => [id, []]));
  let authored = 0;
  for (const entry of cases) {
    assert.equal(entry.difficulty, difficultyOf(entry), entry.id);
    assert.ok(TYPES.includes(entry.type), entry.id);
    assert.ok(KEY_STATS.includes(entry.keyStat), entry.id);
    assert.equal(entry.fee % 10000, 0, entry.id);
    assert.ok(entry.fee > 0, entry.id);
    assert.ok(Number.isInteger(entry.durationWeeks) && entry.durationWeeks >= 1 && entry.durationWeeks <= 12, entry.id);
    assert.ok(Number.isFinite(entry.issueStrength) && entry.issueStrength > 0, entry.id);
    assert.ok(Number.isInteger(entry.activeTwists) && entry.activeTwists >= 0, entry.id);
    assert.ok(entry.client.name.trim().length > 0, entry.id);
    assert.ok(entry.client.oneLine.trim().length > 0, entry.id);
    assert.ok(chars(entry.title) >= 1 && chars(entry.title) <= 16, entry.id + ' title');
    assert.ok(chars(entry.hook) >= 1 && chars(entry.hook) <= 30, entry.id + ' hook ' + chars(entry.hook));
    assert.ok(entry.tasks.length >= 2 && entry.tasks.length <= 4, entry.id);
    for (const task of entry.tasks) {
      assert.ok(chars(task.name) >= 1 && chars(task.name) <= 10, entry.id + ' ' + task.name);
      assert.ok(ROLES.includes(task.role), task.role);
      assert.ok(STAFF_STATS.includes(task.staffStat), task.staffStat);
    }
    for (const key of ['win', 'settle', 'lose']) {
      const text = entry.lines[key];
      assert.equal(typeof text, 'string', entry.id);
      assert.ok(chars(text) >= 1 && chars(text) <= 80, entry.id + ' ' + key + ' ' + chars(text));
      const sentences = sentenceCount(text);
      assert.ok(sentences >= 1 && sentences <= 2, entry.id + ' ' + key);
    }
    for (const key of ['win', 'lose']) {
      assert.ok(chars(entry.news[key]) >= 1 && chars(entry.news[key]) <= 25, entry.id + ' news');
    }
    assert.match(entry.comment, /정액/);
    const source = entry.source.match(/^gen-001:(ARCH_[A-Z_]+):(\d+)$/);
    if (source) {
      assert.equal(entry.type, '형사', entry.id);
      assert.match(entry.comment, /성공보수/);
      perArchetype[source[1]].push(entry);
    } else {
      assert.equal(entry.source, 'authored', entry.id);
      authored += 1;
    }
    const facing = JSON.stringify({
      title: entry.title, client: entry.client, hook: entry.hook,
      tasks: entry.tasks, lines: entry.lines, news: entry.news
    });
    assert.doesNotMatch(facing, /ARCH_|PLACEHOLDER|TODO|TBD|확인 필요/);
  }
  assert.equal(authored, 4);
  for (const id of ARCHETYPES) {
    const pair = perArchetype[id];
    assert.equal(pair.length, 2, id);
    assert.notEqual(pair[0].issueStrength, pair[1].issueStrength, id);
    assert.notEqual(pair[0].activeTwists, pair[1].activeTwists, id);
    assert.notEqual(pair[0].source, pair[1].source, id);
  }
});

test('의뢰인 이름은 고유하고, 게임 인물과 겹치지 않으며, 같은 성은 3번까지다', () => {
  const reserved = reservedNames();
  for (const required of ['정민호', '고은아', '윤지훈', '한도윤', '이정우', '김현우', '박서윤']) {
    assert.equal(reserved.has(required), true, required);
  }
  const names = cases.map(entry => entry.client.name);
  assert.equal(new Set(names).size, 24);
  const surnames = {};
  for (const entry of cases) {
    assert.match(entry.client.name, /^[가-힣]{2,4}$/, entry.id);
    assert.equal(reserved.has(entry.client.name), false, entry.client.name);
    assert.match(entry.comment, new RegExp('이름:.*' + entry.client.name));
    const surname = surnameOf(entry.client.name);
    surnames[surname] = (surnames[surname] || 0) + 1;
  }
  for (const [surname, count] of Object.entries(surnames)) assert.ok(count <= 3, surname + ' ' + count);
});
