(function (root) {
'use strict';
// PORTFOLIO-001 game session: 한 판 전체(상담 → 사무소 한 주 → 공판 → 결산)의 상태를 소유한다.
// 저장은 "사무소 상태 + 공판 명령 기록"이다. 공판은 결정적이므로 기록을 다시 실행해 복원한다.
// UI는 이 서비스의 command/view만 쓴다. 실패한 명령은 아무것도 바꾸지 않는다.
const isNode = typeof module !== 'undefined' && module.exports;
const Firm = isNode ? require('../vendor/firm/engine.js') : root.FirmEngine;
const Case = isNode ? require('../vendor/court/data/demo-separated-moments.js') : root.FirmDemoCase;
const Pack = isNode ? require('../vendor/court/data/demo-ko-pack.js') : root.FirmDemoKoPack;
const Court = isNode ? require('../vendor/court/services/demo-session.js') : root.FirmDemoSession;
const Bridge = isNode ? require('./bridge.js') : root.FirmBridge;

const SAVE_VERSION = 1;
const SCENES = ['title', 'intro', 'office', 'weekend', 'prep', 'court', 'result'];
const clone = v => JSON.parse(JSON.stringify(v));

function createGame(saved) {
  let g, court = null;

  function fresh() {
    return { v: SAVE_VERSION, scene: 'title', firm: null, prosecutorId: null, budget: null, courtLog: [], runs: 0 };
  }

  function buildCourt(prosecutorId, budget, log) {
    const c = Court.createDemoSession({ cases: [Bridge.caseForTrial(Case, budget)], daily: [], pack: Pack });
    const start = c.command('start', { caseId: Case.id, prosecutorId });
    if (!start.ok) throw new Error(start.error);
    for (const entry of log) {
      const res = c.command(entry.action, entry.payload);
      if (!res.ok) throw new Error('저장된 공판 기록을 다시 실행할 수 없습니다: ' + res.error);
    }
    return c;
  }

  function load(data) {
    if (!data || data.v !== SAVE_VERSION || !SCENES.includes(data.scene)) throw new Error('읽을 수 없는 저장 데이터입니다.');
    const next = clone(data);
    if (next.firm) { const ok = Firm.validateState(next.firm); if (!ok.ok) throw new Error(ok.error); }
    const nextCourt = next.prosecutorId ? buildCourt(next.prosecutorId, next.budget, next.courtLog) : null;
    g = next; court = nextCourt;
  }

  const handlers = {
    newGame(d) { const runs = d.runs; Object.assign(d, fresh(), { scene: 'intro', runs }); d.firm = Firm.createInitialState({ experiment: 'commitment-v1' }); return null; },
    finishIntro(d) { if (d.scene !== 'intro') throw new Error('상담 장면이 아닙니다.'); d.scene = 'office'; return null; },
    firm(d, { action }) {
      if (d.scene !== 'office') throw new Error('사무소 업무 시간이 아닙니다.');
      const res = Firm.command(d.firm, action);
      if (!res.ok) throw new Error(res.error);
      d.firm = res.state;
      if (d.firm.completed) d.scene = 'weekend';
      return null;
    },
    beginPrep(d, { prosecutorId }) {
      if (d.scene !== 'weekend') throw new Error('아직 한 주가 끝나지 않았습니다.');
      if (!Case.variants[prosecutorId]) throw new Error('상대 검사를 고르십시오.');
      const budget = Bridge.prepFromFirm(d.firm).budget;
      const c = buildCourt(prosecutorId, budget, []);
      d.prosecutorId = prosecutorId; d.budget = budget; d.courtLog = []; d.scene = 'prep';
      return c;
    },
    court(d, { action, payload }, c) {
      if (!c || !['prep', 'court'].includes(d.scene)) throw new Error('공판 중이 아닙니다.');
      const entry = { action, payload: payload || {} };
      const res = c.command(entry.action, entry.payload);
      if (!res.ok) throw new Error(res.error);
      d.courtLog.push(clone(entry));
      const phase = res.view.trial.state.phase;
      d.scene = phase === 'prep' ? 'prep' : phase === 'verdict' ? 'result' : 'court';
      if (phase === 'verdict') d.runs += 1;
      return c;
    },
    // 같은 한 주의 결과를 두고 공판만 다시: 준비 횟수는 그대로다.
    retryTrial(d) { if (d.scene !== 'result') throw new Error('결산 화면이 아닙니다.'); d.scene = 'weekend'; d.prosecutorId = null; d.courtLog = []; return null; }
  };

  function command(action, payload) {
    const h = handlers[action];
    if (!h) return { ok: false, error: '알 수 없는 명령: ' + action };
    const draft = clone(g);
    // 공판 서비스는 자체적으로 원자적이다. court 명령이 실패하면 예외로 빠져 draft를 버린다.
    let nextCourt;
    try { nextCourt = h(draft, payload || {}, court); } catch (e) { return { ok: false, error: e.message }; }
    g = draft; court = nextCourt;
    return { ok: true };
  }

  function view() {
    const v = { scene: g.scene, runs: g.runs, firm: null, forecast: null, summary: null, outlook: null, prep: null,
      court: null, settlement: null, caseInfo: { id: Case.id, presentation: clone(Case.presentation), prosecutors: clone(Case.prosecutors), nextTry: clone(Case.nextTry || []) } };
    if (g.firm) {
      v.firm = clone(g.firm);
      v.forecast = Firm.forecast(g.firm);
      v.summary = Firm.summarize(g.firm);
      v.outlook = Bridge.prepOutlook(g.firm, v.forecast);
      if (g.firm.completed) v.prep = Bridge.prepFromFirm(g.firm);
    }
    if (court) {
      v.court = court.projection();
      v.prosecutorId = g.prosecutorId;
      if (v.court.outcome) v.settlement = Bridge.settle(g.firm, v.summary, v.court.outcome.key);
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
