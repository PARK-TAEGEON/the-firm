'use strict';

// 실험용 authored 규칙, DEC 아님. See RULES.md.
const FIRMS = [
  { name: '해온', strategy: '형사 부티크', specialty: 'criminal', count: 14, pay: 65, growth: 85, public: 45, capacity: 2 },
  { name: '다온', strategy: '대형 종합', specialty: 'general', count: 29, pay: 85, growth: 75, public: 30, capacity: 2 },
  { name: '새길', strategy: '공장형', specialty: 'insolvency', count: 26, pay: 55, growth: 45, public: 65, capacity: 3 },
  { name: '이음', strategy: '기업 자문', specialty: 'corporate', count: 15, pay: 90, growth: 65, public: 20, capacity: 2 },
  { name: '한결', strategy: '1인', specialty: 'criminal', count: 1, pay: 50, growth: 90, public: 75, capacity: 2 },
];
const TYPES = ['criminal', 'insolvency', 'corporate'];
const TYPE_NAMES = { criminal: '형사 대응', insolvency: '채무 조정', corporate: '기업 자문' };
const FEES = { criminal: 4, insolvency: 2, corporate: 6 };
const LEAVES = { parenting: ['육아', 26], burnout: ['번아웃', 8], study: ['유학', 52], public: ['공직 파견', 26] };
const MOTIVES = ['money', 'honor', 'balance', 'public', 'independence'];
// ko fictional-world pack: calibration, not verified Korean legal/statistical rules.
const KO = require('./packs/ko.json').legacyWorld;
const NEWS = {
  categories: ['순위', '대형사건', '판례', '인사', '시장', '내 로펌'],
  minimum: 5, maximum: 7, lookbackWeeks: 4, perCategory: 3,
  types: {
    market_year: ['시장', 4], spring_intake: ['시장', 3],
    firm_opened: ['시장', 4], firm_closed: ['시장', 3],
    office_departure: ['인사', 4], office_appointment: ['인사', 4],
    person_moved: ['인사', 3], person_hired: ['인사', 2],
    leave_started: ['인사', 2], leave_returned: ['인사', 2], person_retired: ['인사', 3],
    judge_rotation: ['인사', 3], person_prominent: ['인사', 1],
    case_completed: ['시장', 2], monthly_ranking: ['순위', 3], year_closed: ['순위', 5],
    weekly_market: ['시장', 1], major_case: ['대형사건', 5], precedent_notice: ['판례', 5], policy_changed: ['시장', 4],
  },
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function calendar(week) {
  return { year: Math.floor((week - 1) / 52) + 1, month: Math.floor(((week - 1) % 52) * 12 / 52) + 1 };
}
// One stateful RNG, advanced only in the simulation's private draft.
function random(state, limit) {
  state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
  return Math.floor((state.rng / 4294967296) * limit);
}
module.exports = { FIRMS, TYPES, TYPE_NAMES, FEES, LEAVES, MOTIVES, KO, NEWS, clamp, calendar, random };
