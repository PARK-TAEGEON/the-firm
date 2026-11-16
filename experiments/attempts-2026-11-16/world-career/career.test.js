'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const { createCareerWorld } = require('./career-service');
const { createWorld } = require('./service');
const { regenerate, policyFor, makeRecord } = require('./case-records');
const { generator } = require('./generator-source');
const fame = require('./reputation'), pages = require('./career-pages'), news = require('./career-news');
const { starDistribution, quotas } = require('./career-simulation');
const { bannedFirm } = require('./names'), pack = require('./packs/ko-career');
const { parseArgs } = require('./career-run');
const worldService = createCareerWorld(1), start = worldService.snapshot();
worldService.advance(20); const world = worldService.snapshot();

test('career wrapper and WORLD main service execute the same weekly state and lifecycle', () => {
  const a = createCareerWorld(7, { warmupYears: 1 }), b = createWorld(7, { career: { warmupYears: 1 } });
  assert.deepEqual(a.snapshot(), b.snapshot()); a.advance(2); b.advance(104);
  assert.deepEqual(a.snapshot(), b.snapshot());
  for (const kind of ['person_hired','person_moved','firm_opened','firm_closed','leave_started','leave_returned','office_departure','person_retired'])
    assert.ok(world.events.some(e => e.type === kind), kind);
  assert.ok(world.annual.filter(a => !a.warmup).every(a => a.hires && a.transfers && a.openings && a.leaves));
});
test('same seed reproduces all records, public pages and news; chunking preserves prefixes', () => {
  const a = createCareerWorld(0, { warmupYears: 1 }), b = createCareerWorld(0, { warmupYears: 1 });
  a.advance(2); b.advance(1); const prefix = b.snapshot(); b.advance(1);
  const left = a.snapshot(), right = b.snapshot(); assert.deepEqual(left, right);
  assert.deepEqual(left.records.slice(0, prefix.records.length), prefix.records);
  assert.deepEqual(left.events.slice(0, prefix.events.length), prefix.events);
  for (const p of left.people) assert.equal(pages.personPage(left, p.id), pages.personPage(right, p.id));
  assert.equal(news.careerNews(left), news.careerNews(right));
  for (const list of [world.people, world.firms, world.events, world.records]) assert.equal(new Set(list.map(x => x.id)).size, list.length);
});
test('invalid commands and detached snapshots cannot mutate state', () => {
  const service = createCareerWorld(0, { warmupYears: 0 }), before = service.snapshot();
  for (const n of [0,-1,1.5,NaN,Infinity,'1',101]) assert.throws(() => service.advance(n));
  assert.throws(() => service.openRecord('missing')); assert.deepEqual(service.snapshot(), before);
  before.people[0].reputation.value = 999; assert.notEqual(service.snapshot().people[0].reputation.value, 999);
  for (const seed of [-1, 2 ** 32, NaN, '1']) assert.throws(() => createCareerWorld(seed));
  for (const warmupYears of [-1,21,0.5,'1']) assert.throws(() => createCareerWorld(1, { warmupYears }));
});
test('GEN failure after personnel and market changes rolls back the entire WORLD transaction', () => {
  const service = createCareerWorld(2, { warmupYears: 0 }), before = service.snapshot();
  const api = generator().automatic, original = api.automaticCase; let calls = 0;
  api.automaticCase = (...args) => { if (++calls === 3) throw Error('injected failure'); return original(...args); };
  try { assert.throws(() => service.advance(), /injected failure/); } finally { api.automaticCase = original; }
  assert.deepEqual(service.snapshot(), before);
  service.advance(); const control = createCareerWorld(2, { warmupYears: 0 }); control.advance();
  assert.deepEqual(service.snapshot(), control.snapshot());
});
test('all 560 major cases regenerate and replay; every decisive contribution actually changes outcome', () => {
  assert.equal(world.records.length, 560);
  const g = generator(); let single = 0, joint = 0, absent = 0;
  for (const r of world.records) {
    const { definition, result } = regenerate(r), rows = result.audit.records;
    assert.equal(g.trial.replay(definition, rows).verdict.outcome, r.outcome);
    if (r.scene.kind === 'no_single_pivot') { absent++; assert.equal(r.scene.recordId, null); continue; }
    if (r.scene.kind === 'joint_pivot') joint++; else single++;
    const ids = r.scene.recordIds;
    assert.ok(ids.every(id => rows.some(x => x.id === id)));
    const replayWithout = excluded => g.trial.replay(definition, rows.map(x => excluded.includes(x.id) ? { ...x, effects: [] } : x)).verdict.outcome;
    assert.equal(replayWithout(ids), r.scene.counterfactual); assert.notEqual(replayWithout(ids), r.outcome);
    for (const id of ids) assert.equal(replayWithout(ids.filter(x => x !== id)), r.outcome, 'causal set must be inclusion-minimal');
  }
  assert.ok(single && joint && absent);
  const sentences = new Map();
  for (const r of world.records) if (r.scene.text) {
    assert.doesNotMatch(r.scene.text, /\.\./);
    sentences.set(r.scene.text, (sentences.get(r.scene.text) || 0) + 1);
  }
  assert.ok([...sentences.values()].every(n => n <= 2));
});
test('unsupported versions, changed results and tampered digests fail closed', () => {
  const r = world.records[0];
  for (const delta of [{ generatorVersion:'bad' }, { worldPack:{ id:'ko',version:'bad' } }, { sceneVersion:'bad' },
    { definitionVersion:'bad' }, { legalSystem:{id:'ko',version:'bad'} }, { policyVersion:'bad' },
    { hearingDigest:'tampered' }, { outcome:'invented' }, { policy:{...r.policy,skill:'invalid'} }]) assert.throws(() => regenerate({...r,...delta}));
});
test('major cases use working participants and retain the actual firm at that time', () => {
  const statuses = new Map(), firms = new Map();
  for (const e of world.events) {
    for (const id of e.personIds || []) {
      if (['person_entered','leave_returned','office_departure'].includes(e.type)) statuses.set(id,'working');
      if (e.type === 'leave_started') statuses.set(id,'leave');
      if (['person_retired','market_exit'].includes(e.type)) statuses.set(id,'inactive');
      if (e.type === 'person_entered') firms.set(id,e.firmId);
      if (['person_moved','person_hired'].includes(e.type)) firms.set(id,e.to);
      if (['office_appointment','firm_closed','market_exit'].includes(e.type)) firms.set(id,null);
    }
    if (e.type === 'career_case') {
      const r = world.records.find(r => r.id === e.caseId);
      for (const key of ['lawyer','judge','prosecutor']) assert.equal(statuses.get(r.parties[key]),'working');
      assert.equal(firms.get(r.parties.lawyer),r.parties.firm);
    }
  }
});
test('routine performance is source-backed aggregate work, with small positive and negative fame effects', () => {
  assert.throws(() => makeRecord({grade:'daily'}));
  assert.ok(world.events.some(e => e.type === 'routine_performance'));
  assert.ok(!world.events.some(e => e.type === 'case_completed' || e.type === 'major_case'));
  const person = () => ({reputation:fame.initialReputation(0,null,'lawyer')});
  const good = person(), bad = person(); bad.reputation.durable = 2; bad.reputation.peak = 2; fame.refresh(bad);
  fame.applyRoutine(good,{id:'R1',week:52,count:12,achieved:12});
  fame.applyRoutine(bad,{id:'R2',week:52,count:12,achieved:0});
  assert.ok(good.reputation.value > 1 && good.reputation.value < 1.05);
  assert.ok(bad.reputation.value < 2);
  for (const p of world.people) for (const e of p.reputation.evidence) if (e.eventId) {
    const source = world.events.find(x => x.id === e.eventId); assert.equal(e.count,source.count); assert.equal(e.achieved,source.achieved);
  }
});
test('expectations, opponent and case grade affect reputation, never fixed adjudication', () => {
  const base={outcome:'not_guilty',forecast:'불리',grade:'contested',attention:1,opponentStars:1};
  assert.ok(fame.evaluate(base)>fame.evaluate({...base,forecast:'유리'}));
  assert.ok(fame.evaluate({...base,opponentStars:5})>fame.evaluate(base));
  assert.ok(fame.evaluate({...base,grade:'major'})>fame.evaluate(base));
  assert.ok(fame.evaluate({...base,outcome:'guilty'})<0);
  const r=world.records[0]; assert.deepEqual(regenerate(r).summary,regenerate({...r,opponentStars:5,defenderStars:5,formerOffice:'judge',relationship:'friend'}).summary);
});
test('title sets starting stars; durable peak and title protect an inactive retired legend while flash cools', () => {
  const rookie={years:0,role:'lawyer'}, partner={years:25,role:'lawyer',partnershipTrack:true};
  assert.equal(pack.reputation.titles[fame.titleFor(rookie,{sector:'large'})][1],1);
  assert.equal(pack.reputation.titles[fame.titleFor(partner,{sector:'large'})][1],3.5);
  const legend={reputation:fame.initialReputation(30,null,'lawyer','partner')};
  legend.reputation.durable=4.8;legend.reputation.flash=0.2;fame.refresh(legend);
  for(let year=1;year<=20;year++) fame.decay(legend,52*year);
  assert.ok(legend.reputation.value>=4.3);assert.ok(legend.reputation.flash<0.001);
  assert.ok(legend.reputation.durable>=legend.reputation.titleFloor);
  legend.reputation.durable=99;fame.refresh(legend);assert.equal(legend.reputation.value,5);
});
test('every fame value replays from its initial title, recorded promotions, work, cases and annual decay', () => {
  const states = new Map(), records = new Map(world.records.map(r=>[r.id,r]));
  for(const e of world.events) {
    if(e.type==='person_entered') {
      const p=world.people.find(p=>p.id===e.personIds[0]);
      states.set(p.id,{reputation:fame.initialReputation(p.origin.years,null,e.role,p.origin.title)});
    }
    if(e.type==='career_title') { const p=states.get(e.personIds[0]);p.reputation.titleFloor=Math.max(p.reputation.titleFloor,pack.reputation.titles[e.title][1]);fame.refresh(p); }
    if(e.type==='routine_performance') fame.applyRoutine(states.get(e.personIds[0]),e);
    if(e.type==='career_case') { const r=records.get(e.caseId);fame.applyRecord(states.get(r.parties.lawyer),r);fame.applyRecord(states.get(r.parties.prosecutor),{...r,opponentStars:r.defenderStars},'prosecutor'); }
    if(e.type==='year_closed') for(const p of states.values()) fame.decay(p,e.week);
  }
  for(const p of world.people) assert.deepEqual(states.get(p.id).reputation,p.reputation,p.id);
});
test('twenty years retain broad star bands without quotas, forced replacements or targeted promotions', () => {
  const rows=world.annual.filter(a=>!a.warmup);
  assert.equal(rows.length,20);
  // Broad experimental guardrail, not an exact target distribution or a UI budget.
  for(const a of rows) a.distribution.forEach((v,i)=>assert.ok(Math.abs(v-[.4,.45,.15][i])<.12));
  assert.ok(world.people.filter(p=>p.active&&p.role==='lawyer').length!==600);
  assert.deepEqual(starDistribution(world),rows.at(-1).distribution);
});
test('synthetic Korean names use cohort pools and firm names reject normalized real-name blacklist', () => {
  for(const p of world.people) { assert.match(p.name,/^[가-힣]{3}$/); assert.ok(pack.naming.surnames.includes(p.name[0])); }
  assert.equal(new Set(world.people.map(p=>p.name)).size,world.people.length);
  for(const f of world.firms) { assert.match(f.name,/^법무법인 [가-힣]{2,3}$/);assert.equal(bannedFirm(f.name),false); }
  for(const name of pack.naming.bannedFirms) assert.ok(bannedFirm(`법무법인 (유한) ${name}`));
  const registry=require('./packs/ko.json').firmRegistry; assert.equal(registry.count,1715);
  for(const name of registry.names) assert.ok(bannedFirm(name));
  for(const name of ['서림','해안','우연']) assert.ok(bannedFirm(`법무법인 ${name}`));
  assert.equal(new Set(world.firms.map(f=>f.name)).size,world.firms.length);
  for (const e of world.events.filter(e=>e.type==='firm_opened')) assert.equal(e.name,world.firms.find(f=>f.id===e.firmId).name);
});
test('each lawyer has exactly one stable specialty across hires, moves, leave and retirement', () => {
  for(const p of world.people) assert.ok(pack.specialties.includes(p.specialtyTag));
  for(const p of start.people) assert.equal(world.people.find(x=>x.id===p.id).specialtyTag,p.specialtyTag);
});
test('public pages expose current affiliation/title/specialty and sourced career, not hidden profiles', () => {
  const p=world.people.find(p=>p.active&&p.role==='lawyer'&&p.firmId), copy=structuredClone(world);
  const view=pages.publicPerson(world,p.id);
  assert.equal(view.organization,world.firms.find(f=>f.id===p.firmId).name);
  assert.equal(view.title,pack.reputation.titles[p.title][0]);assert.equal(view.field,p.specialtyTag);
  for (const [role, label] of [['judge',pack.labels.court],['prosecutor',pack.labels.prosecution]]) {
    const officer=world.people.find(p=>p.active&&p.role===role);
    assert.equal(pages.publicPerson(world,officer.id).organization,label);
  }
  copy.people.find(x=>x.id===p.id).practice.secret='SECRET_CANARY';copy.events.push({personIds:[p.id],visibility:'hidden',type:'career_case',outcome:'SECRET_CANARY'});
  assert.equal(pages.personPage(copy,p.id),pages.personPage(world,p.id));
  assert.doesNotMatch(JSON.stringify(view),/SECRET_CANARY|"(?:truth|points|practice|delta|probability)"/);
});
test('representative firm cases prioritize achieved performance and firm rating derives from members and history', () => {
  for(const f of world.firms) {
    const cases=pages.representativeCases(world,f.id);
    for(let i=1;i<cases.length;i++) assert.ok(fame.evaluate(cases[i-1])>=fame.evaluate(cases[i]));
    assert.ok(cases.every(r=>r.parties.firm===f.id));
    const history=world.records.filter(r=>r.parties.firm===f.id);
    assert.equal(f.caseMerit.count,history.length);
    assert.ok(Math.abs(f.caseMerit.total-history.reduce((n,r)=>n+fame.evaluate(r),0))<1e-9);
  }
});
test('news uses at least ten distinct templates, factual sources and read-only record links', () => {
  const before=structuredClone(world), articles=news.careerArticles(world);
  assert.ok(new Set(articles.map(a=>a.templateId)).size>=10);
  for(const a of articles) {const r=world.records.find(r=>r.id===a.sourceCaseId);assert.equal(r.grade,'major');assert.ok(a.body.includes(r.scene.text));}
  news.careerNews(world);assert.deepEqual(world,before);
});
test('GEN guilt never invents sentencing and routine work is not an adjudicated case', () => {
  const r=world.records.find(r=>r.outcome==='guilty');assert.equal(r.official.defense,null);
  assert.match(pages.casePage(world,r.id),/양형 미제공/);
  assert.notEqual(r.official.verdict,'유죄(실형)');
});
test('policy changes actions through experience only; courtroom randomness is forbidden', () => {
  const g=generator(),d=g.content.buildContestedCase(g.catalog[0].id,1);
  const novice=policyFor(d,{years:0,focus:0}),expert=policyFor(d,{years:20,focus:0});assert.notDeepEqual(novice,expert);
  assert.deepEqual(expert,policyFor(d,{years:20,focus:0,reputation:5,formerOffice:'judge'}));
  const old=Math.random;Math.random=()=>{throw Error('courtroom RNG');};
  try {assert.notDeepEqual(g.automatic.automaticCase(d,novice).audit.records,g.automatic.automaticCase(d,expert).audit.records);} finally {Math.random=old;}
});
test('initial mixed roster uses reference shares and player starts as a solo rookie', () => {
  const s=createCareerWorld(0,{warmupYears:0}).snapshot();
  assert.deepEqual(quotas([{count:1},{count:1},{count:1}],5),[2,2,1]);
  assert.ok(pages.distribution(s).rows.every(r=>Math.abs(r.gap)<1));
  const p=s.people.find(p=>p.id===s.playerId);assert.equal(p.years,0);assert.equal(p.reputation.value,1);assert.equal(p.formerOffice,null);
  assert.equal(s.people.filter(x=>x.firmId===p.firmId).length,1);
});
test('new Korean names and policy values live in data, CLI rejects malformed inputs', () => {
  for(const file of ['career-simulation.js','case-records.js','reputation.js']) assert.doesNotMatch(fs.readFileSync(path.join(__dirname,file),'utf8'),/서울|부산|형법|제\d+조|24572|0\.033|Math\.random/);
  for(const args of [['--years','0'],['--seed','1','--seed','2'],['--warmup-years'],['--unknown','1']]) assert.throws(()=>parseArgs(args));
});

test('shared ko JSON is self-contained with fifteen fields, cohort/city data and full firm bans', () => {
  const json = JSON.parse(fs.readFileSync(path.join(__dirname,'packs/ko.json'),'utf8'));
  assert.deepEqual(json,pack); assert.equal(new Set(json.specialties).size,15);
  assert.ok(json.specialties.includes('도산·회생'));
  assert.equal(json.firmRegistry.names.length,1715); assert.ok(bannedFirm('김앤장'));
  assert.ok(json.naming.cohorts.length>=3 && json.population.cities.length>10);
  assert.doesNotMatch(JSON.stringify(json),/\?\?/);
  assert.equal(require('./data').KO,pack.legacyWorld);
});

test('client assignment favors reputation and specialty, retains unknown newcomers and is deterministic', () => {
  const {assignmentWeight,assignLawyer}=require('./career-simulation');
  const specialist=pack.assignment.defaultSpecialty;
  const people=[{id:'rookie',specialtyTag:'도산·회생',reputation:{value:1}},
    {id:'known',specialtyTag:'도산·회생',reputation:{value:4}},
    {id:'fit',specialtyTag:specialist,reputation:{value:4}}];
  assert.ok(assignmentWeight(people[0],specialist)>0);
  assert.ok(assignmentWeight(people[1],specialist)>assignmentWeight(people[0],specialist));
  assert.ok(assignmentWeight(people[2],specialist)>assignmentWeight(people[1],specialist));
  const a={rng:31},b={rng:31},counts={rookie:0,known:0,fit:0};
  for(let i=0;i<10000;i++) {const chosen=assignLawyer(a,people,specialist);assert.equal(chosen.id,assignLawyer(b,people,specialist).id);counts[chosen.id]++;}
  assert.ok(counts.fit>counts.known && counts.known>counts.rookie && counts.rookie>0);
  for(const r of world.records) assert.equal(r.assignment.weight,assignmentWeight({specialtyTag:r.assignment.specialtyTag,reputation:{value:r.assignment.stars}},r.assignment.specialty));
});

test('repeated scene prose is capped by content rather than case IDs and replay preserves reference display', () => {
  const r=world.records.find(r=>r.scene.text),practice={years:20,focus:0};
  const input={...r,actorName:'김하린',practice,previousRecords:[]};
  const first=makeRecord(input),second=makeRecord({...input,id:'SECOND',previousRecords:[first]});
  assert.equal(first.scene.text,second.scene.text);
  const third=makeRecord({...input,id:'THIRD',previousRecords:[first,second]});
  assert.equal(third.scene.text,'');assert.equal(third.scene.display,'references');
  assert.deepEqual(third.scene.recordIds,first.scene.recordIds);
  assert.deepEqual(regenerate(third).summary.scene,third.scene);
});

test('public status separates retirement, leave and ending private practice even for a rookie', () => {
  const s=createCareerWorld(1,{warmupYears:0}).snapshot(),p=s.people.find(p=>p.id===s.playerId);
  p.active=false;p.status='statistical';p.firmId=null;
  s.events.push({id:'EX',type:'market_exit',personIds:[p.id],week:0});
  assert.doesNotMatch(pages.personPage(s,p.id),/은퇴|통계 집단|statistical/);
  assert.match(pages.personPage(s,p.id),/개업 활동 종료/);
  p.status='retired';assert.match(pages.personPage(s,p.id),/은퇴/);
  p.status='leave';p.active=true;assert.equal(pages.publicPerson(s,p.id).status,'휴직');
});

test('senior partners have longer voluntary move cooldown and need a material benefit', () => {
  const {movementCooldown}=require('./career-simulation'),{canTransfer}=require('./simulation');
  const senior={title:'partner',years:20,motive:'money'},current={pay:50,offer:{}},target={pay:70,offer:{},yearHires:0,hireQuota:1};
  assert.equal(movementCooldown(senior),260);assert.equal(movementCooldown({...senior,title:'associate'}),0);
  assert.equal(canTransfer(senior,current,target,[],[]),false);
  assert.equal(canTransfer({...senior,title:'associate'},current,target,[],[]),true);
  assert.equal(canTransfer(senior,current,{...target,pay:90},[],[]),true);
  const titles=new Map(),lastMove=new Map();let checked=0;
  for(const e of world.events) for(const id of e.personIds||[]) {
    if(e.type==='person_entered') {const p=world.people.find(p=>p.id===id);titles.set(id,p.origin.title);lastMove.set(id,e.lastMove);}
    if(e.type==='career_title') titles.set(id,e.title);
    if(e.type==='person_moved' && titles.get(id)==='partner') {assert.ok(e.week-lastMove.get(id)>=260);checked++;}
    if(['person_moved','person_hired'].includes(e.type))lastMove.set(id,e.week);
  }
  assert.ok(checked>0);
});

test('firm size and case record both affect stars without enforcing sector ranks', () => {
  const rating=(n,value,merit=0)=>fame.firmStars({people:Array.from({length:n},()=>({role:'lawyer',firmId:'F',active:true,reputation:{value}}))},{id:'F',caseMerit:{total:merit,count:10}});
  assert.ok(rating(30,2)>rating(1,2));
  // Half-star display may tie nearby sizes, but greater size cannot lower it.
  for(let n=2;n<=30;n++) assert.ok(rating(n,2)>=rating(n-1,2));
  assert.ok(rating(5,2,20)>rating(5,2,-20));
  assert.ok(rating(1,5,20)>rating(30,2,-20),'exceptional small practice may outrank a large one');
});

test('headlines reuse the pinned Korean particle helper for both name endings', () => {
  const {korean}=require('./generator-source');
  assert.equal(korean().render('{name:이/가}',{name:'김하린'}),'김하린이');
  assert.equal(korean().render('{name:이/가}',{name:'김민우'}),'김민우가');
  assert.equal(korean().withParticle('유죄','으로/로'),'유죄로');
  const s=structuredClone(world),major=s.records.filter(r=>r.grade==='major')[3];
  for(const [name,phrase] of [['김하린','김하린이 맡은'],['김민우','김민우가 맡은']]) {
    s.people.find(p=>p.id===major.parties.lawyer).name=name;
    assert.match(news.careerArticles(s)[3].headline,new RegExp(phrase));
  }
});
