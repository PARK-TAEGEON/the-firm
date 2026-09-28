'use strict';

// 실험용 authored 규칙, DEC 아님. See RULES.md.
const FIRMS = [
  { name: '해온', strategy: '형사 부티크', specialty: 'criminal', count: 10, pay: 65, growth: 85, public: 45, capacity: 2 },
  { name: '다온', strategy: '대형 종합', specialty: 'general', count: 20, pay: 85, growth: 75, public: 30, capacity: 2 },
  { name: '새길', strategy: '공장형', specialty: 'insolvency', count: 18, pay: 55, growth: 45, public: 65, capacity: 3 },
  { name: '이음', strategy: '기업 자문', specialty: 'corporate', count: 11, pay: 90, growth: 65, public: 20, capacity: 2 },
  { name: '한결', strategy: '1인', specialty: 'criminal', count: 1, pay: 50, growth: 90, public: 75, capacity: 2 },
];
const TYPES = ['criminal', 'insolvency', 'corporate'];
const TYPE_NAMES = { criminal: '형사 대응', insolvency: '채무 조정', corporate: '기업 자문' };
const FEES = { criminal: 4, insolvency: 2, corporate: 6 };
const LEAVES = { parenting: ['육아', 26], burnout: ['번아웃', 8], study: ['유학', 52], public: ['공직 파견', 26] };
const MOTIVES = ['money', 'honor', 'balance', 'public', 'independence'];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function calendar(week) {
  return { year: Math.floor((week - 1) / 52) + 1, month: Math.floor(((week - 1) % 52) * 12 / 52) + 1 };
}
// One stateful RNG, advanced only in the simulation's private draft.
function random(state, limit) {
  state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
  return Math.floor((state.rng / 4294967296) * limit);
}
module.exports = { FIRMS, TYPES, TYPE_NAMES, FEES, LEAVES, MOTIVES, clamp, calendar, random };
