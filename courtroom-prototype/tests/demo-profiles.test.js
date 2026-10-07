'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createHistory,KEY}=require('../services/demo-profile-history');
const profiles=require('../data/demo-profiles');
test('profile history deduplicates one round, persists two rounds, copies reads',()=>{
 let saved=null;const storage={getItem:()=>saved,setItem:(k,v)=>{assert.equal(k,KEY);saved=v;}};
 const h=createHistory(storage);h.record(1,['novice','JUDGE'],'acquittal');h.record(1,['novice','JUDGE'],'acquittal');h.record(2,['novice','JUDGE'],'injury');
 assert.deepEqual(h.get('novice'),{acquittal:1,dismissal:0,assault:0,injury:1});assert.deepEqual(createHistory(storage).get('JUDGE'),h.get('novice'));
 h.get('novice').injury=50;assert.equal(h.get('novice').injury,1);assert.equal(h.get('veteran').injury,0);
});
test('storage failure and malformed storage preserve in-memory counting',()=>{
 for(const storage of [undefined,{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}},{getItem:()=>'{bad',setItem(){throw Error('quota')}}]){
 const h=createHistory(storage);h.record(1,['veteran','JUDGE'],'dismissal');h.record(2,['veteran','JUDGE'],'assault');assert.equal(h.get('JUDGE').dismissal,1);assert.equal(h.get('JUDGE').assault,1);
 }
});
test('profiles have bounded half-stars, fictional history and nonnumeric hints',()=>{
 assert.deepEqual(profiles.map(p=>p.reputation),[1.5,3.5,3]);for(const p of profiles){assert.ok(p.history.length>=3&&p.history.length<=5);assert.ok(p.style.length>=2&&p.style.length<=3);assert.ok(p.style.every(s=>!/[0-9]/.test(s)));}
});
