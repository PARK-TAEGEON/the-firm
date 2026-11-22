(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FirmLoop = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // 12주 위임 루프. DEC가 아니다.
  // 위대한 로펌은 12주차 명성 42 · 누적 매출 1억 1,000만.
  // 수임료는 착수금이다. 판결 성공보수는 승소면 fee, 조정이면 fee의 절반, 패소면 0.
  // 주간 임대료는 설계(80만·120만·200만)의 6.25배다. 직전 6.4배보다 낮다.
  // 확률·능력·등급 명성 조건은 설계 그대로. 주 종료 때 기준 미달이면 한 단계만 강등한다.
  // 해석(데이터에 필드가 없어 설계와 맞춘 것):
  // - cases.json의 fee(원)는 수임 시 착수금이다. 영업 보정은 착수금에만 곱한다.
  //   판결 성공보수는 승소면 fee, 조정이면 fee의 절반, 패소면 0. fee.success가 있으면 그 금액을 기준으로 한다.
  // - 대표 보정은 설계의 업무표와 같다. 데이터 업무명 대신 (역할, 능력)으로 고른다.
  //   응대 → 협상×2, 보조원+정확 → 분석×2, 그 밖(속도, 사무원+정확) → 0.
  // - 사건의 keyStat은 분석·변론·협상 중 하나다. 영업은 의뢰 수와 착수금에만 쓴다.
  // - 피로/5는 내림. 응대 업무 실패는 의뢰인 응대 실패로 명성 −1.
  // - 경험치는 그 업무의 핵심 능력에 쌓이고, 6마다 그 능력 +1(최대 10).
  // - 수임한 주도 1주다. 기한+2주가 차도 업무가 안 끝나면 철회.
  // - 임대료는 그 주 시작 등급. 승급·강등은 정산 뒤라 다음 주 임대료와 수임 해금에 반영된다.
  //   이미 맡은 사건은 유지한다. 승급은 한 주에 T3까지 갈 수 있고, 강등은 한 단계만이다.
  //   T3는 명성 35 미만이거나 누적 매출 4,000만 미만이면 T2. T2는 명성 15 미만이면 T1.
  // - 12주를 넘는 사건(durationWeeks > 12)은 수임 후보에서 뺀다.
  // - 자동 정책은 채용·교육·휴가·광고를 넘긴다. T2의 3번째 슬롯은 비어 있다.
  // - 명성 하한은 없다. 현금 0은 마이너스가 아니다.

  var WEEKS = 12;
  var OPENING_CASH = 10000000;
  var GREAT_REPUTATION = 42;
  var GREAT_REVENUE = 110000000;
  var T2_REPUTATION = 15;
  var T3_REPUTATION = 35;
  var T3_REVENUE = 40000000;
  var VERDICT_STATS = ['분석', '변론', '협상'];
  var STAT_KEYS = VERDICT_STATS.concat('영업');
  var TASK_STATS = ['정확', '속도', '응대'];
  var ROLES = ['사무원', '보조원'];
  // 설계 임대료 80만·120만·200만의 6.25배. 6.4배보다 낮추고도 폐업이 나오게 둔 주간 운영비다.
  var RENT = { 1: 5000000, 2: 7500000, 3: 12500000 };
  var TIER_NAME = { 1: 'T1 개인 사무소', 2: 'T2 동네 법률사무소', 3: 'T3 중견 로펌' };

  var DESK_CAP = { 1: 2, 2: 3, 3: 5 };
  var DESK_COST = [0, 1000000, 2000000, 3000000, 4000000];
  var ANCHORS = { 1: 'ABC', 2: 'ABCDE', 3: 'ABCDEFG' };

  function deskCapacity(state) {
    var cap = DESK_CAP[state.tier];
    var usable = Math.min(state.desks.unlocked, cap);
    return { cap: cap, usable: usable, placed: Object.keys(state.desks.placements).length,
      nextCost: usable < cap ? DESK_COST[usable] : null };
  }

  function unlockDesk(state, number) {
    var capacity = deskCapacity(state);
    if (state.ending || number !== capacity.usable + 1 ||
        capacity.nextCost === null || state.cash < capacity.nextCost) return false;
    state.cash -= capacity.nextCost;
    state.desks.unlocked = number;
    return true;
  }

  function hasDesk(state, anchor) {
    return typeof anchor === 'string' && Object.hasOwn(state.desks.placements, anchor);
  }

  function placeDesk(state, anchor) {
    var capacity = deskCapacity(state);
    if (state.ending || typeof anchor !== 'string' || anchor.length !== 1 ||
        !ANCHORS[state.tier].includes(anchor) || hasDesk(state, anchor) ||
        capacity.placed >= capacity.usable) return false;
    state.desks.placements[anchor] = null;
    return true;
  }

  function removeDesk(state, anchor) {
    if (state.ending || !hasDesk(state, anchor)) return false;
    delete state.desks.placements[anchor];
    return true;
  }

  function seatStaff(state, anchor, staffId) {
    if (state.ending || !hasDesk(state, anchor)) return false;
    var seats = state.desks.placements;
    if (staffId === null) {
      if (!seats[anchor]) return false;
    } else {
      if (seats[anchor] || !state.staff.some(function (person) { return person.id === staffId; })) return false;
      Object.keys(seats).forEach(function (previous) {
        if (seats[previous] === staffId) seats[previous] = null;
      });
    }
    seats[anchor] = staffId;
    return true;
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function clamp(value, lo, hi) { return Math.max(lo, Math.min(hi, value)); }
  function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return {
      next: function () {
        a |= 0;
        a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      },
      get state() { return a >>> 0; },
      set state(value) { a = value >>> 0; }
    };
  }

  function defaultStats() { return { 분석: 5, 변론: 5, 협상: 5, 영업: 5 }; }

  function normalizeStats(stats) {
    if (stats == null) return defaultStats();
    var next = {};
    var sum = 0;
    for (var i = 0; i < STAT_KEYS.length; i++) {
      var key = STAT_KEYS[i];
      var value = stats[key];
      if (!Number.isInteger(value) || value < 1 || value > 10) throw new Error('능력치는 1에서 10 사이여야 합니다.');
      next[key] = value;
      sum += value;
    }
    if (sum !== 20) throw new Error('능력치 합은 20이어야 합니다.');
    return next;
  }

  function isGreatFirm(reputation, revenue) {
    return reputation >= GREAT_REPUTATION && revenue >= GREAT_REVENUE;
  }

  function offerCount(sales) { return 2 + Math.floor(sales / 4); }

  function scaleRetainer(fee, sales) {
    var num = fee * (100 + 3 * (sales - 5));
    var sign = num < 0 ? -1 : 1;
    return sign * Math.round(Math.abs(num) / 100);
  }

  function partnerBonus(task, stats) {
    if (task.staffStat === '응대') return 2 * stats.협상;
    if (task.staffStat === '정확' && task.role === '보조원') return 2 * stats.분석;
    return 0;
  }

  function taskRate(input) {
    var raw = 35 + 6 * input.core + (input.fit ? 10 : 0) + input.partnerBonus - 10 * input.difficulty - Math.floor(input.fatigue / 5);
    var p = clamp(raw, 10, 95);
    var partial = Math.min(20, 95 - p);
    return { p: p, success: p, partial: partial, fail: 100 - p - partial };
  }

  function verdictRate(input) {
    var raw = 20 + 10 * input.prep + 3 * input.stat - 10 * input.difficulty;
    var v = clamp(raw, 5, 95);
    var partial = Math.min(20, 95 - v);
    return { v: v, win: v, partial: partial, lose: 100 - v - partial };
  }

  function moneyOf(entry) {
    if (entry.fee && typeof entry.fee === 'object') {
      var retainer = entry.fee.retainer;
      return {
        retainer: retainer,
        success: entry.fee.success == null ? retainer : entry.fee.success
      };
    }
    return {
      retainer: entry.fee,
      success: Object.prototype.hasOwnProperty.call(entry, 'success') ? entry.success : entry.fee
    };
  }

  function normalizeCase(entry) {
    if (!entry || typeof entry.id !== 'string' || !entry.id) return { ok: false, id: '', reason: 'id' };
    if (Number.isInteger(entry.durationWeeks) && entry.durationWeeks > WEEKS) {
      return { ok: false, id: entry.id, reason: 'over-12' };
    }
    var money = moneyOf(entry);
    if (!Number.isInteger(entry.difficulty) || entry.difficulty < 1 || entry.difficulty > 3) return { ok: false, id: entry.id, reason: 'difficulty' };
    if (!Number.isInteger(entry.durationWeeks) || entry.durationWeeks < 1) return { ok: false, id: entry.id, reason: 'duration' };
    if (!Number.isInteger(money.retainer) || money.retainer <= 0) return { ok: false, id: entry.id, reason: 'fee' };
    if (!Number.isInteger(money.success) || money.success < 0) return { ok: false, id: entry.id, reason: 'success' };
    if (VERDICT_STATS.indexOf(entry.keyStat) < 0) return { ok: false, id: entry.id, reason: 'keyStat' };
    if (!Array.isArray(entry.tasks) || entry.tasks.length < 1) return { ok: false, id: entry.id, reason: 'tasks' };
    var tasks = [];
    for (var i = 0; i < entry.tasks.length; i++) {
      var task = entry.tasks[i];
      if (!task || ROLES.indexOf(task.role) < 0 || TASK_STATS.indexOf(task.staffStat) < 0) {
        return { ok: false, id: entry.id, reason: 'task' };
      }
      tasks.push({ name: typeof task.name === 'string' && task.name ? task.name : '업무', role: task.role, staffStat: task.staffStat });
    }
    var client = entry.client || {};
    return {
      ok: true,
      spec: {
        id: entry.id,
        title: typeof entry.title === 'string' ? entry.title : entry.id,
        difficulty: entry.difficulty,
        durationWeeks: entry.durationWeeks,
        keyStat: entry.keyStat,
        retainer: money.retainer,
        success: money.success,
        tasks: tasks,
        client: { name: client.name || '', oneLine: client.oneLine || '' },
        lines: {
          win: entry.lines && entry.lines.win || '',
          settle: entry.lines && (entry.lines.settle || entry.lines.partial) || '',
          lose: entry.lines && entry.lines.lose || ''
        },
        news: {
          win: entry.news && entry.news.win || '',
          settle: entry.news && (entry.news.settle || entry.news.partial) || '',
          lose: entry.news && entry.news.lose || ''
        }
      }
    };
  }

  function startingStaff() {
    return [
      { id: 'kim', name: '김', role: '사무원', pay: 700000, stats: { 정확: 5, 속도: 6, 응대: 7 }, xp: { 정확: 0, 속도: 0, 응대: 0 }, fatigue: 0, slots: 2 },
      { id: 'park', name: '박', role: '보조원', pay: 1000000, stats: { 정확: 7, 속도: 5, 응대: 4 }, xp: { 정확: 0, 속도: 0, 응대: 0 }, fatigue: 0, slots: 2 }
    ];
  }

  function loadCatalog(cases) {
    var catalog = {};
    var pool = [];
    var excluded = [];
    var seen = {};
    var list = Array.isArray(cases) ? cases : [];
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      var id = entry && entry.id;
      if (id && seen[id]) { excluded.push({ id: id, reason: 'duplicate' }); continue; }
      if (id) seen[id] = true;
      var parsed = normalizeCase(entry);
      if (!parsed.ok) { excluded.push({ id: parsed.id, reason: parsed.reason }); continue; }
      catalog[parsed.spec.id] = parsed.spec;
      pool.push(parsed.spec.id);
    }
    return { catalog: catalog, pool: pool, excluded: excluded };
  }

  function presentOffer(spec, sales) {
    return {
      id: spec.id,
      title: spec.title,
      difficulty: spec.difficulty,
      durationWeeks: spec.durationWeeks,
      keyStat: spec.keyStat,
      client: spec.client.name,
      tasks: spec.tasks.map(function (task) { return { name: task.name, role: task.role, staffStat: task.staffStat }; }),
      retainer: spec.retainer,
      pay: scaleRetainer(spec.retainer, sales),
      success: spec.success
    };
  }

  function createMatter(spec) {
    return {
      id: spec.id,
      title: spec.title,
      difficulty: spec.difficulty,
      durationWeeks: spec.durationWeeks,
      keyStat: spec.keyStat,
      success: spec.success,
      prep: 0,
      weeksOpen: 0,
      status: 'active',
      lines: spec.lines,
      news: spec.news,
      tasks: spec.tasks.map(function (task) {
        return { name: task.name, role: task.role, staffStat: task.staffStat, result: null };
      })
    };
  }

  function gainXp(staff, stat, amount) {
    staff.xp[stat] += amount;
    while (staff.xp[stat] >= 6 && staff.stats[stat] < 10) {
      staff.stats[stat] += 1;
      staff.xp[stat] -= 6;
    }
  }

  function shuffle(list, rng) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(rng.next() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function openTaskCount(state) {
    var total = 0;
    for (var i = 0; i < state.matters.length; i++) {
      var matter = state.matters[i];
      if (matter.status !== 'active') continue;
      for (var t = 0; t < matter.tasks.length; t++) if (!matter.tasks[t].result) total += 1;
    }
    return total;
  }

  function chooseAccepts(state) {
    var cap = 0;
    for (var s = 0; s < state.staff.length; s++) cap += state.staff[s].slots;
    var load = openTaskCount(state);
    var weeksLeft = Math.max(1, WEEKS + 1 - state.week);
    var ranked = state.offers.slice().sort(function (a, b) {
      return (b.pay - a.pay) || (a.difficulty - b.difficulty) || cmp(a.id, b.id);
    });
    var ids = [];
    var startedEmpty = load === 0;
    for (var i = 0; i < ranked.length; i++) {
      var offer = ranked[i];
      var span = Math.max(1, Math.min(offer.durationWeeks, weeksLeft));
      var limit = cap * Math.min(2, span);
      if (limit < offer.tasks.length) limit = offer.tasks.length;
      if (load + offer.tasks.length > limit && !(startedEmpty && ids.length === 0)) continue;
      ids.push(offer.id);
      load += offer.tasks.length;
    }
    return ids;
  }

  function chooseAssignments(state) {
    var slots = {};
    for (var s = 0; s < state.staff.length; s++) slots[state.staff[s].id] = state.staff[s].slots;
    var pending = [];
    for (var m = 0; m < state.matters.length; m++) {
      var matter = state.matters[m];
      if (matter.status !== 'active') continue;
      for (var t = 0; t < matter.tasks.length; t++) {
        if (!matter.tasks[t].result) pending.push({ matter: matter, taskIndex: t, task: matter.tasks[t] });
      }
    }
    pending.sort(function (a, b) {
      var leftA = a.matter.durationWeeks + 2 - a.matter.weeksOpen;
      var leftB = b.matter.durationWeeks + 2 - b.matter.weeksOpen;
      return (leftA - leftB) || cmp(a.matter.id, b.matter.id) || (a.taskIndex - b.taskIndex);
    });
    var out = [];
    for (var i = 0; i < pending.length; i++) {
      var item = pending[i];
      var best = null;
      var bestP = -1;
      for (var n = 0; n < state.staff.length; n++) {
        var staff = state.staff[n];
        if (slots[staff.id] <= 0) continue;
        var rate = taskRate({
          core: staff.stats[item.task.staffStat],
          fit: staff.role === item.task.role,
          partnerBonus: partnerBonus(item.task, state.stats),
          difficulty: item.matter.difficulty,
          fatigue: staff.fatigue
        });
        if (best == null || rate.p > bestP || (rate.p === bestP && staff.id < best.id)) {
          best = staff;
          bestP = rate.p;
        }
      }
      if (!best) break;
      slots[best.id] -= 1;
      out.push({ caseId: item.matter.id, taskIndex: item.taskIndex, staffId: best.id });
    }
    return out;
  }

  var autoPolicy = { chooseAccepts: chooseAccepts, chooseAssignments: chooseAssignments };

  function makeEnding(kind, tier) {
    if (kind === 'great') return { kind: 'great', tier: tier, label: '위대한 로펌' };
    if (kind === 'bankrupt') return { kind: 'bankrupt', tier: tier, label: '폐업' };
    return { kind: 'tier', tier: tier, label: TIER_NAME[tier] };
  }

  function adjustTier(state) {
    if (state.tier >= 3 && (state.reputation < T3_REPUTATION || state.revenue < T3_REVENUE)) state.tier -= 1;
    else if (state.tier === 2 && state.reputation < T2_REPUTATION) state.tier -= 1;
    else if (state.reputation >= T3_REPUTATION && state.revenue >= T3_REVENUE) state.tier = 3;
    else if (state.reputation >= T2_REPUTATION) state.tier = Math.max(state.tier, 2);
    // 축소 후에도 존재하는 자리 중 A부터 보유 한도까지 남긴다.
    var seats = state.desks.placements;
    var surviving = ANCHORS[state.tier].split('').filter(function (id) { return hasDesk(state, id); })
      .slice(0, Math.min(state.desks.unlocked, DESK_CAP[state.tier]));
    Object.keys(seats).forEach(function (id) {
      if (!surviving.includes(id)) delete seats[id];
    });
    return state.tier;
  }

  function headlineFor(matter, outcome) {
    var key = outcome === 'partial' ? 'settle' : outcome;
    if (matter.news && matter.news[key]) return matter.news[key];
    if (outcome === 'partial') return matter.title + ' 조정';
    return matter.title;
  }

  function lineFor(matter, outcome) {
    var key = outcome === 'partial' ? 'settle' : outcome;
    return matter.lines && matter.lines[key] || '';
  }

  function createRun(options) {
    var opts = options || {};
    if (!Number.isInteger(opts.seed)) throw new Error('시드는 정수여야 합니다.');
    var loaded = loadCatalog(opts.cases);
    var rng = typeof opts.next === 'function' ? { next: opts.next, get state() { return 0; }, set state(_) {} } : mulberry32(opts.seed);
    var policy = opts.policy || autoPolicy;
    if (typeof policy.chooseAccepts !== 'function' || typeof policy.chooseAssignments !== 'function') {
      throw new Error('정책에는 chooseAccepts와 chooseAssignments가 있어야 합니다.');
    }
    return {
      rng: rng,
      catalog: loaded.catalog,
      policy: policy,
      state: {
        seed: opts.seed,
        week: 1,
        weeksPlayed: 0,
        cash: OPENING_CASH,
        revenue: 0,
        reputation: 0,
        tier: 1,
        negativeStreak: 0,
        stats: normalizeStats(opts.stats),
        staff: startingStaff(),
        desks: { unlocked: 1, placements: { A: null } },
        pool: loaded.pool,
        excluded: loaded.excluded,
        matters: [],
        offers: [],
        headlines: [],
        lastWeek: null,
        weekLog: [],
        ending: null,
        investment: 'skip'
      }
    };
  }

  // 화면용 조회·입력. 판정 순서와 수식은 advanceWeek와 같다.
  // openWeek는 피로를 쉬게 하고 수임 후보를 뽑는다(셔플 난수 1회). 이미 열렸으면 다시 뽑지 않는다.
  // settleWeek는 수임·배정을 확정하고 굴린다. choices를 생략하면 정책 그대로다.
  // 명시 목록을 주면 그 입력을 쓰고, 검증·슬롯·굴림 순서는 정책 경로와 같다.
  function openWeek(run) {
    if (run.state.ending) return run.state;
    if (run.opened) return run.state;
    var state = run.state;
    var tierAtStart = state.tier;
    for (var s = 0; s < state.staff.length; s++) {
      var staff = state.staff[s];
      staff.fatigue = Math.max(0, staff.fatigue - 20);
      staff.slots = staff.fatigue >= 80 ? 1 : 2;
    }
    var eligible = state.pool.filter(function (id) { return run.catalog[id].difficulty <= tierAtStart; });
    var offeredIds = shuffle(eligible, run.rng).slice(0, offerCount(state.stats.영업));
    state.offers = offeredIds.map(function (id) { return presentOffer(run.catalog[id], state.stats.영업); });
    run.opened = { tierAtStart: tierAtStart, offeredIds: offeredIds };
    return state;
  }

  function copyOpened(opened) {
    if (!opened) return null;
    return { tierAtStart: opened.tierAtStart, offeredIds: opened.offeredIds.slice() };
  }

  function previewAccepts(run) {
    if (!run.opened) return [];
    return (run.policy.chooseAccepts(run.state) || []).slice();
  }

  function previewAssignments(run, acceptIds) {
    if (!run.opened) return [];
    var state = clone(run.state);
    var ids = acceptIds || [];
    var offered = run.opened.offeredIds;
    for (var a = 0; a < ids.length; a++) {
      var acceptId = ids[a];
      if (offered.indexOf(acceptId) < 0 || state.pool.indexOf(acceptId) < 0) continue;
      if (state.matters.some(function (row) { return row.id === acceptId; })) continue;
      state.matters.push(createMatter(run.catalog[acceptId]));
    }
    return (run.policy.chooseAssignments(state) || []).map(function (row) {
      return { caseId: row.caseId, taskIndex: row.taskIndex, staffId: row.staffId };
    });
  }

  function lookupMatter(run, caseId) {
    for (var i = 0; i < run.state.matters.length; i++) {
      if (run.state.matters[i].id === caseId) return run.state.matters[i];
    }
    return run.catalog[caseId] || null;
  }

  function previewRate(run, caseId, taskIndex, staffId) {
    var matter = lookupMatter(run, caseId);
    if (!matter || !matter.tasks || !matter.tasks[taskIndex]) return null;
    var task = matter.tasks[taskIndex];
    var staff = null;
    for (var s = 0; s < run.state.staff.length; s++) {
      if (run.state.staff[s].id === staffId) staff = run.state.staff[s];
    }
    if (!staff) return null;
    return taskRate({
      core: staff.stats[task.staffStat],
      fit: staff.role === task.role,
      partnerBonus: partnerBonus(task, run.state.stats),
      difficulty: matter.difficulty,
      fatigue: staff.fatigue
    });
  }

  function applyWeek(run, choices) {
    var state = run.state;
    var week = state.week;
    var tierAtStart = run.opened.tierAtStart;
    var offeredIds = run.opened.offeredIds;
    var acceptIds = choices && Array.isArray(choices.acceptIds) ? choices.acceptIds : (run.policy.chooseAccepts(state) || []);
      var accepted = [];
      for (var a = 0; a < acceptIds.length; a++) {
        var acceptId = acceptIds[a];
        if (offeredIds.indexOf(acceptId) < 0 || state.pool.indexOf(acceptId) < 0) continue;
        if (accepted.some(function (row) { return row.id === acceptId; })) continue;
        var spec = run.catalog[acceptId];
        var retainer = scaleRetainer(spec.retainer, state.stats.영업);
        state.cash += retainer;
        state.revenue += retainer;
        state.pool = state.pool.filter(function (id) { return id !== acceptId; });
        state.matters.push(createMatter(spec));
        accepted.push({ id: acceptId, retainer: retainer });
      }

      var planned = choices && Array.isArray(choices.assignments) ? choices.assignments : (run.policy.chooseAssignments(state) || []);
      var used = {};
      var applied = [];
      for (var p = 0; p < planned.length; p++) {
        var plan = planned[p];
        var matter = null;
        for (var m = 0; m < state.matters.length; m++) {
          if (state.matters[m].id === plan.caseId && state.matters[m].status === 'active') matter = state.matters[m];
        }
        if (!matter || !matter.tasks[plan.taskIndex] || matter.tasks[plan.taskIndex].result) continue;
        var assignee = null;
        for (var n = 0; n < state.staff.length; n++) if (state.staff[n].id === plan.staffId) assignee = state.staff[n];
        if (!assignee) continue;
        used[assignee.id] = used[assignee.id] || 0;
        if (used[assignee.id] >= assignee.slots) continue;
        if (applied.some(function (row) { return row.caseId === plan.caseId && row.taskIndex === plan.taskIndex; })) continue;
        used[assignee.id] += 1;
        applied.push({ caseId: plan.caseId, taskIndex: plan.taskIndex, staffId: assignee.id });
      }

      var taskResults = [];
      for (var r = 0; r < applied.length; r++) {
        var job = applied[r];
        var active = null;
        for (var mi = 0; mi < state.matters.length; mi++) if (state.matters[mi].id === job.caseId) active = state.matters[mi];
        var task = active.tasks[job.taskIndex];
        var worker = null;
        for (var si = 0; si < state.staff.length; si++) if (state.staff[si].id === job.staffId) worker = state.staff[si];
        var rate = taskRate({
          core: worker.stats[task.staffStat],
          fit: worker.role === task.role,
          partnerBonus: partnerBonus(task, state.stats),
          difficulty: active.difficulty,
          fatigue: worker.fatigue
        });
        var roll = Math.floor(run.rng.next() * 100);
        var result = roll < rate.success ? 'success' : roll < rate.success + rate.partial ? 'partial' : 'fail';
        task.result = result;
        active.prep += result === 'success' ? 2 : result === 'partial' ? 1 : 0;
        gainXp(worker, task.staffStat, result === 'success' ? 2 : 1);
        worker.fatigue += 15;
        var repDelta = 0;
        if (result === 'fail' && task.staffStat === '응대') {
          state.reputation -= 1;
          repDelta = -1;
        }
        taskResults.push({
          caseId: active.id, taskIndex: job.taskIndex, name: task.name, staffId: worker.id,
          result: result, roll: roll, p: rate.p, rep: repDelta
        });
      }

      var verdicts = [];
      var withdrawn = [];
      var activeMatters = state.matters.filter(function (matter) { return matter.status === 'active'; })
        .sort(function (a, b) { return cmp(a.id, b.id); });
      for (var v = 0; v < activeMatters.length; v++) {
        var current = activeMatters[v];
        var finished = current.tasks.every(function (task) { return task.result; });
        if (finished) {
          var verdict = verdictRate({
            prep: current.prep,
            stat: state.stats[current.keyStat] || 0,
            difficulty: current.difficulty
          });
          var vRoll = Math.floor(run.rng.next() * 100);
          var outcome = vRoll < verdict.win ? 'win' : vRoll < verdict.win + verdict.partial ? 'partial' : 'lose';
          var successFee = outcome === 'win' ? current.success : outcome === 'partial' ? Math.round(current.success / 2) : 0;
          state.cash += successFee;
          state.revenue += successFee;
          var rep = outcome === 'win' ? 3 * current.difficulty : outcome === 'partial' ? 1 : -2;
          state.reputation += rep;
          current.status = 'done';
          current.outcome = outcome;
          var headline = headlineFor(current, outcome);
          state.headlines.unshift(headline);
          verdicts.push({
            id: current.id, outcome: outcome, roll: vRoll, v: verdict.v, successFee: successFee,
            rep: rep, headline: headline, line: lineFor(current, outcome)
          });
        } else {
          current.weeksOpen += 1;
          if (current.weeksOpen >= current.durationWeeks + 2) {
            current.status = 'withdrawn';
            state.reputation -= 2;
            var pulled = current.title + ' 의뢰 철회';
            state.headlines.unshift(pulled);
            withdrawn.push({ id: current.id, headline: pulled });
          }
        }
      }
      state.headlines = state.headlines.slice(0, 5);

      var salary = 0;
      for (var pay = 0; pay < state.staff.length; pay++) salary += state.staff[pay].pay;
      var rent = RENT[tierAtStart];
      state.cash -= salary + rent;
      var tier = adjustTier(state);
      var negative = state.cash < 0;
      var ending = null;
      if (negative && state.negativeStreak >= 1) ending = makeEnding('bankrupt', state.tier);
      else if (week >= WEEKS) {
        ending = isGreatFirm(state.reputation, state.revenue)
          ? makeEnding('great', state.tier)
          : makeEnding('tier', state.tier);
      }
      state.negativeStreak = negative ? state.negativeStreak + 1 : 0;
      state.weeksPlayed = week;
      if (ending) state.ending = ending;
      else state.week = week + 1;
      state.lastWeek = {
        week: week, accepted: accepted, taskResults: taskResults, verdicts: verdicts, withdrawn: withdrawn,
        salary: salary, rent: rent, tier: tier, cash: state.cash, revenue: state.revenue,
        reputation: state.reputation, headlines: state.headlines.slice(), investment: 'skip'
      };
      state.weekLog.push(state.lastWeek);
      state.offers = [];
      run.opened = null;
      return state;
  }

  function settleWeek(run, choices) {
    if (run.state.ending) return run.state;
    var backup = clone(run.state);
    var rngBackup = run.rng.state;
    var openedBackup = copyOpened(run.opened);
    try {
      if (!run.opened) openWeek(run);
      return applyWeek(run, choices || null);
    } catch (error) {
      run.state = backup;
      run.rng.state = rngBackup;
      run.opened = openedBackup;
      throw error;
    }
  }

  function advanceWeek(run) {
    if (run.state.ending) return run.state;
    return settleWeek(run, null);
  }

  function runSeason(options) {
    var run = createRun(options);
    for (var i = 0; i < WEEKS && !run.state.ending; i++) advanceWeek(run);
    return run.state;
  }

  return {
    WEEKS: WEEKS,
    OPENING_CASH: OPENING_CASH,
    GREAT_REPUTATION: GREAT_REPUTATION,
    GREAT_REVENUE: GREAT_REVENUE,
    T2_REPUTATION: T2_REPUTATION,
    T3_REPUTATION: T3_REPUTATION,
    RENT: RENT,
    isGreatFirm: isGreatFirm,
    TIER_NAME: TIER_NAME,
    offerCount: offerCount,
    scaleRetainer: scaleRetainer,
    partnerBonus: partnerBonus,
    taskRate: taskRate,
    verdictRate: verdictRate,
    STAT_KEYS: STAT_KEYS,
    autoPolicy: autoPolicy,
    createRun: createRun,
    deskCapacity: deskCapacity,
    placeDesk: placeDesk,
    removeDesk: removeDesk,
    hasDesk: hasDesk,
    unlockDesk: unlockDesk,
    seatStaff: seatStaff,
    openWeek: openWeek,
    previewAccepts: previewAccepts,
    previewAssignments: previewAssignments,
    previewRate: previewRate,
    settleWeek: settleWeek,
    advanceWeek: advanceWeek,
    runSeason: runSeason
  };
});
