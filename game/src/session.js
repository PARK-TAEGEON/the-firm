(function (root) {
'use strict';
// PORTFOLIO-002 game session: 상담 → 사무소 한 주 → 변론 계획 → 자동 공판(중요한 순간만 개입) → 결산.
// 저장은 "사무소 상태 + 계획 + 공판 명령 기록"이다. 공판은 결정적이므로 기록을 다시 실행해 복원한다.
// UI는 이 서비스의 command/view만 쓴다. 실패한 명령은 아무것도 바꾸지 않는다.
const isNode = typeof module !== 'undefined' && module.exports;
const Firm = isNode ? require('../vendor/firm/engine.js') : root.FirmEngine;
const Case = isNode ? require('../vendor/court/data/demo-separated-moments.js') : root.FirmDemoCase;
const Pack = isNode ? require('../vendor/court/data/demo-ko-pack.js') : root.FirmDemoKoPack;
const Court = isNode ? require('../vendor/court/services/demo-session.js') : root.FirmDemoSession;
const Bridge = isNode ? require('./bridge.js') : root.FirmBridge;
const Plan = isNode ? require('./plan.js') : root.FirmPlan;
const { SHEET } = isNode ? require('./case-sheet.js') : root.FirmCaseSheet;

const SAVE_VERSION = 2;
const SCENES = ['title', 'intro', 'office', 'weekend', 'plan', 'court', 'result'];
const AUTO_LIMIT = 400;
const clone = v => JSON.parse(JSON.stringify(v));

function createGame(saved) {
  let g, court = null;

  function fresh() {
    return { v: SAVE_VERSION, scene: 'title', firm: null, plan: null, courtLog: [], runs: 0, seed: 1, rolls: [] };
  }
  const tierOf = d => Bridge.prepFromFirm(d.firm).tierId;

  function apply(c, entry) {
    const res = c.command(entry.action, entry.payload);
    if (!res.ok) throw new Error(res.error);
  }
  function buildCourt(plan, log) {
    const c = Court.createDemoSession({ cases: [Plan.trialCase(plan)], daily: [], pack: Pack });
    apply(c, { action: 'start', payload: { caseId: Case.id, prosecutorId: SHEET.prosecutorId } });
    for (const entry of log) {
      try { apply(c, entry); } catch (e) { throw new Error('저장된 공판 기록을 다시 실행할 수 없습니다: ' + e.message); }
    }
    return c;
  }
  // 자동 진행: 플레이어에게 물어야 할 순간이나 선고까지 계획대로 둔다. 둔 수는 모두 기록에 남는다.
  function autoRun(d, c) {
    for (let i = 0; i < AUTO_LIMIT; i++) {
      const tr = c.projection().trial, m = Plan.nextMove(tr, d.plan, d.seed);
      const at = tr.displayRecords.filter(r => r.lines && r.lines.length).length;
      m.rolls.forEach(r => { if (!d.rolls.some(x => x.key === r.key)) d.rolls.push({ ...r, at }); });
      if (m.done) { d.scene = 'result'; d.runs += 1; return; }
      if (m.ask) { d.scene = 'court'; return; }
      apply(c, m.cmd); d.courtLog.push(clone(m.cmd));
    }
    throw new Error('자동 공판이 끝나지 않았습니다.');
  }
  function pendingAsk() {
    if (!court || g.scene !== 'court') return null;
    const m = Plan.nextMove(court.projection().trial, g.plan, g.seed);
    return m.ask || null;
  }

  function load(data) {
    if (!data || data.v !== SAVE_VERSION || !SCENES.includes(data.scene)) throw new Error('읽을 수 없는 저장 데이터입니다.');
    const next = clone(data);
    if (next.seed === undefined) next.seed = 1;
    if (!Number.isInteger(next.seed) || next.seed < 1) throw new Error('저장된 시드가 올바르지 않습니다.');
    if (!Array.isArray(next.rolls)) next.rolls = [];
    if (next.firm) { const ok = Firm.validateState(next.firm); if (!ok.ok) throw new Error(ok.error); }
    if (next.plan) Plan.validate(next.plan, Bridge.prepFromFirm(next.firm).tierId);
    const nextCourt = ['court', 'result'].includes(next.scene) ? buildCourt(next.plan, next.courtLog) : null;
    if (next.scene === 'court' && !Plan.nextMove(nextCourt.projection().trial, next.plan, next.seed).ask) throw new Error('저장된 공판이 결정 대기 상태가 아닙니다.');
    if (next.scene === 'result' && nextCourt.projection().trial.state.phase !== 'verdict') throw new Error('저장된 공판이 끝나지 않았습니다.');
    g = next; court = nextCourt;
  }

  const handlers = {
    newGame(d, payload) {
      const runs = d.runs, seed = payload && Number.isInteger(payload.seed) && payload.seed > 0 ? payload.seed : (Date.now() % 2147483646) + 1;
      Object.assign(d, fresh(), { scene: 'intro', runs, seed }); d.firm = Firm.createInitialState({ experiment: 'commitment-v1' }); return null; },
    finishIntro(d) { if (d.scene !== 'intro') throw new Error('상담 장면이 아닙니다.'); d.scene = 'office'; return null; },
    firm(d, { action }) {
      if (d.scene !== 'office') throw new Error('사무소 업무 시간이 아닙니다.');
      const res = Firm.command(d.firm, action);
      if (!res.ok) throw new Error(res.error);
      d.firm = res.state;
      if (d.firm.completed) d.scene = 'weekend';
      return null;
    },
    // 한 주가 끝나면 김현우가 변론 계획서 초안을 쓴다.
    beginPlan(d) {
      if (d.scene !== 'weekend') throw new Error('아직 한 주가 끝나지 않았습니다.');
      d.plan = Plan.draft(tierOf(d), 'kim'); d.scene = 'plan'; d.courtLog = [];
      return null;
    },
    editPlan(d, change) {
      if (d.scene !== 'plan') throw new Error('계획을 고칠 수 있는 때가 아닙니다.');
      d.plan = Plan.edit(d.plan, tierOf(d), change);
      return null;
    },
    // 날인: 계획대로 공판 전 준비와 모두진술을 마치고, 첫 결정 순간이나 선고까지 진행한다.
    sealPlan(d) {
      if (d.scene !== 'plan') throw new Error('날인할 계획이 없습니다.');
      Plan.validate(d.plan, tierOf(d));
      d.courtLog = Plan.setupCommands(d.plan); d.rolls = [];
      const c = buildCourt(d.plan, d.courtLog);
      autoRun(d, c);
      return c;
    },
    decide(d, { object }, c) {
      if (d.scene !== 'court' || !c) throw new Error('결정할 순간이 아닙니다.');
      const ask = Plan.nextMove(c.projection().trial, d.plan, d.seed).ask;
      if (!ask) throw new Error('결정할 순간이 아닙니다.');
      if (typeof object !== 'boolean') throw new Error('이의 여부를 고르십시오.');
      const cmd = { action: 'trial', payload: { action: 'objection', payload: { object } } };
      apply(c, cmd); d.courtLog.push(cmd);
      autoRun(d, c);
      return c;
    },
    // 같은 한 주의 결과를 두고 계획부터 다시. 확인 항목 수는 그대로다.
    retryTrial(d) { if (d.scene !== 'result') throw new Error('결산 화면이 아닙니다.'); d.scene = 'plan'; d.courtLog = []; d.rolls = []; d.seed = Plan.nextSeed(d.seed); return null; }
  };

  // 계획서 되돌리기: 화면이 아닌 서비스가 직전 계획을 기억한다(저장하지 않음, 계획 장면에서만).
  let undo = [];
  function command(action, payload) {
    if (action === 'undoPlan') {
      if (g.scene !== 'plan' || !undo.length) return { ok: false, error: '되돌릴 것이 없습니다.' };
      g = { ...clone(g), plan: undo.pop() };
      return { ok: true };
    }
    const before = action === 'editPlan' ? clone(g.plan) : null;
    const res = run(action, payload);
    if (res.ok) { if (before) { undo.push(before); if (undo.length > 30) undo.shift(); } else undo = []; }
    return res;
  }
  function run(action, payload) {
    const h = handlers[action];
    if (!h) return { ok: false, error: '알 수 없는 명령: ' + action };
    const draft = clone(g);
    // 공판 서비스는 명령마다 원자적이지만, 날인·결정은 여러 명령을 잇는다.
    // 그래서 기존 공판을 직접 건드리지 않고 기록으로 새로 만든 사본에서 진행한다. 실패하면 사본째 버린다.
    let nextCourt;
    try {
      const work = ['decide'].includes(action) && court ? buildCourt(draft.plan, draft.courtLog) : court;
      nextCourt = h(draft, payload || {}, work);
    } catch (e) { return { ok: false, error: e.message }; }
    g = draft; court = nextCourt;
    return { ok: true };
  }

  function planView() {
    const tierId = tierOf(g), p = g.plan, def = Case.variants[SHEET.prosecutorId];
    const staff = id => g.firm.staff.find(s => s.id === id);
    return {
      plan: clone(p), tierId, prep: Bridge.prepFromFirm(g.firm),
      lawyers: Plan.LAWYER_ORDER.map(id => {
        const L = Plan.LAWYERS[id], s = staff(id);
        return { id, name: s.name, specialty: s.specialty, years: L.years, note: L.note, stats: Plan.STATS.map(x => ({ ...x, value: L.stats[x.id], tier: Plan.tier(L.stats[x.id]), pct: Plan.ROLL_STATS[x.id] ? Plan.chance(L.stats[x.id]) : null })),
          slots: Plan.checkSlots(tierId, id), fee: Plan.courtFee(g.firm, id), asks: Plan.expectedAsks({ lawyerId: id }) };
      }),
      draft: (() => { const d0 = Plan.draft(tierId, p.lawyerId); return { stance: d0.stance, focus: d0.focus, advice: d0.advice, checks: d0.checks }; })(),
      checks: SHEET.checks.map(c => ({ ...c, on: p.checks.includes(c.id) })),
      threats: Plan.threats(p),
      stances: def.opening.stance.map(s => ({ id: s.id, title: s.title, word: SHEET.stances[s.id].word, short: SHEET.stances[s.id].short })),
      focus: def.opening.focus.map(f => ({ id: f.id, title: f.title, word: SHEET.focus[f.id].word, short: SHEET.focus[f.id].short,
        time: Object.fromEntries(Object.entries(f.time).map(([w, n]) => [w, n + (Plan.LAWYERS[p.lawyerId].stats.examine >= Plan.T.examineBonus ? 1 : 0)])) })),
      witnesses: def.witnesses.map(w => ({ id: w.id, name: Case.presentation.witnesses[w.id].name, role: Case.presentation.witnesses[w.id].role, goal: SHEET.witnessGoal[w.id] })),
      advice: Case.settlement.advice.map(a => ({ id: a.id, title: a.title, word: SHEET.adviceWord[a.id], short: SHEET.advice[a.id] })),
      offer: clone(Case.settlement.offer), settles: p.checks.includes('INV_SIG_SETTLE'),
      asks: Plan.expectedAsks(p), odds: Plan.odds(p), fee: Plan.courtFee(g.firm, p.lawyerId), canUndo: undo.length > 0
    };
  }

  // 받은 편지함: 사무소 상태에서 만든 메시지 목록(최신이 위). 내용은 화면이 상태에서 그린다.
  function inboxView(firm) {
    const admin = firm.staff.find(s => s.role === 'admin');
    const list = [
      { id: 'case-jung', day: 0, from: '정민호', tag: 'case', title: '사건 의뢰' },
      { id: 'court-notice', day: 0, from: '법원', tag: 'court', title: '공판 기일' },
      { id: 'intake-yoon', day: 0, from: firm.intake.client, tag: 'intake', title: '새 의뢰', must: firm.intake.status === 'pending', status: firm.intake.status }
    ];
    firm.reports.forEach((r, i) => list.push({ id: 'report-' + r.day, day: r.day, from: admin.name, fromId: admin.id, tag: 'report', title: '업무 보고', report: i, late: r.lateTasks.length }));
    return list.reverse();
  }

  function view() {
    const v = { scene: g.scene, runs: g.runs, firm: null, forecast: null, summary: null, outlook: null, prep: null, plan: null,
      court: null, ask: null, settlement: null,
      caseInfo: { id: Case.id, memoWords: SHEET.memoWords.slice(), presentation: clone(Case.presentation), prosecutors: clone(Case.prosecutors), nextTry: clone(Case.nextTry || []), prosecutorId: SHEET.prosecutorId } };
    if (g.firm) {
      v.firm = clone(g.firm);
      v.forecast = Firm.forecast(g.firm);
      v.summary = Firm.summarize(g.firm);
      v.outlook = Bridge.prepOutlook(g.firm, v.forecast);
      if (g.firm.completed) v.prep = Bridge.prepFromFirm(g.firm);
      v.inbox = inboxView(g.firm);
    }
    if (g.plan) v.plan = planView();
    if (court) {
      v.court = court.projection();
      v.rolls = clone(g.rolls);
      v.ask = pendingAsk();
      if (v.ask) v.ask.question = Plan.objectionStep(v.ask.witnessId, v.ask.stepId).question;
      if (v.court.outcome) {
        const base = Bridge.settle(g.firm, v.summary, v.court.outcome.key), fee = Plan.courtFee(g.firm, g.plan.lawyerId);
        v.settlement = { ...base, courtFee: fee, finalCash: base.finalCash - fee };
      }
    }
    return v;
  }

  // 배정을 바꾸기 전에 결과를 비교한다. 실제 상태는 바뀌지 않는다.
  function previewFirm(action) {
    const res = Firm.command(g.firm, action);
    if (!res.ok) return { ok: false, error: res.error };
    const forecast = Firm.forecast(res.state);
    return { ok: true, forecast, outlook: Bridge.prepOutlook(res.state, forecast) };
  }

  g = fresh();
  if (saved) load(saved);
  return { command, view, previewFirm, exportSave: () => clone(g), load: data => { try { load(data); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; } } };
}

const api = { createGame, SAVE_VERSION };
if (isNode) module.exports = api; else root.FirmGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
