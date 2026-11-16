'use strict';
const pack = require('./packs/ko-career');
const { random } = require('./data');
const registry = require('./packs/ko.json').firmRegistry;
const take = (s, a) => a[random(s, a.length)];
const normalized = value => value.normalize('NFKC').replace(/공증인가|법무법인|유한|[\s()]/g, '').toLocaleLowerCase();
const blocked = new Set([...pack.naming.bannedFirms, ...registry.names].map(normalized));
function bannedFirm(name) { return blocked.has(normalized(name)); }
function personName(s, age) {
  const cohort = pack.naming.cohorts.find(c => age >= c.minAge);
  for (let attempt = 0; attempt < 10000; attempt++) {
    const name = take(s, pack.naming.surnames) + take(s, cohort.first) + take(s, cohort.last);
    if (!s.people.some(p => p.name === name)) return name;
  }
  throw Error('synthetic person name pool exhausted');
}
function firmName(s) {
  for (let attempt = 0; attempt < 10000; attempt++) {
    const name = `${pack.naming.firmPrefix} ${take(s, pack.naming.first)}${random(s, 2) ? take(s, pack.naming.middle) : ''}${take(s, pack.naming.last)}`;
    if (!bannedFirm(name) && !s.firms.some(f => f.name === name)) return name;
  }
  throw Error('synthetic firm name pool exhausted');
}
module.exports = { personName, firmName, bannedFirm };
