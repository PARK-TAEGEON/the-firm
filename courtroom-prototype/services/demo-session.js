(function (root) {
'use strict';
// DEMO-001 session service. 사건·검사 선택, 재판 전 합의, 공판 위임, 결과 판정을 묶는다.
// 공판 상태는 기존 v0.10 services/trial.js가 소유한다(수정하지 않음). 이 서비스는 그 앞뒤의 기록만 소유한다.
// 명령은 원자적이다: 실패한 명령은 세션 기록과 공판 상태를 바꾸지 않는다. 무작위 없음.
const isNode = typeof module !== 'undefined' && module.exports;
const T = isNode ? require('../engine/trial.js') : root.FirmTrial;
const TS = isNode ? require('./trial.js') : root.FirmTrialService;
const O = isNode ? require('./demo-outcome.js') : root.FirmDemoOutcome;

function createDemoSession({ cases, daily, pack }) {
  const caseList = T.copy(cases), dailyList = T.copy(daily || []), ko = T.copy(pack);
  caseList.forEach(c => { if (c.packId !== ko.id) throw new Error('DemoCase: pack mismatch ' + c.id); Object.values(c.variants).forEach(v => T.validate(v)); });
  let state, trial = null, sessionNo = 0;
  const find = (list, id) => list.find(x => x.id === id);
  const current = s => s.caseId ? find(caseList, s.caseId) : null;

  function push(s, rec) {
    const r = Object.assign({ id: 'demo:s' + s.session + ':r' + (++s.serial), seq: s.records.length + 1 }, rec);
    s.records.push(r); return r;
  }

  function reset() {
    state = { session: ++sessionNo, serial: 0, phase: 'select', caseId: null, prosecutorId: null, records: [] };
    trial = null;
  }

  // 각 handler는 초안(s)과 다음 공판 서비스를 돌려준다. 예외가 나면 아무것도 반영하지 않는다.
  const handlers = {
    start(s, { caseId, prosecutorId }) {
      if (s.phase !== 'select') throw new Error('이미 사건을 시작했습니다.');
      const c = find(caseList, caseId); if (!c) throw new Error('알 수 없는 사건 파일입니다.');
      const def = c.variants[prosecutorId]; if (!def) throw new Error('검사를 고르십시오.');
      s.phase = 'play'; s.caseId = caseId; s.prosecutorId = prosecutorId;
      push(s, { kind: 'case_selected', caseId, caseVersion: c.version, packId: ko.id, packVersion: ko.version, prosecutorId });
      return TS.createTrialService(def);
    },
    consult(s, { adviceId }, t) {
      const c = current(s); if (s.phase !== 'play' || !c.settlement) throw new Error('합의 제안이 없습니다.');
      const st = c.settlement;
      if (t.projection().state.phase !== 'prep') throw new Error('합의 상담은 공판 준비 중에만 할 수 있습니다.');
      if (s.records.some(r => r.kind === 'settlement_consult')) throw new Error('이미 의뢰인과 합의를 상담했습니다.');
      const adv = find(st.advice, adviceId); if (!adv) throw new Error('조언을 고르십시오.');
      const res = t.command('investigate', { id: st.consultInvestigation });
      if (!res.ok) throw new Error(res.error);
      const lines = [
        { speaker: 'CLIENT', text: st.clientQuestion }, { speaker: 'DEFENSE', text: st.lawyerAnswer },
        { speaker: 'DEFENSE', text: adv.title + '.' }, { speaker: 'CLIENT', text: adv.clientReply }
      ];
      if (adv.accepted) lines.push({ speaker: 'VICTIM', text: adv.victimReply });
      push(s, { kind: 'settlement_consult', adviceId, accepted: !!adv.accepted, lines });
      if (adv.accepted) {
        push(s, { kind: 'settlement_agreed', amount: st.offer.amount });
        // 재판 전 제출. trialSeq = 제출 시점까지의 공판 기록 수(마감 판정은 demo-outcome이 팩 규칙으로 한다).
        push(s, { kind: 'victim_will_filed', document: ko.victimWill.documentLabel, trialSeq: t.projection().records.length });
      }
      return t;
    },
    trial(s, { action, payload }, t) {
      if (s.phase !== 'play') throw new Error('사건을 먼저 고르십시오.');
      if (action === 'reset') throw new Error('처음부터 다시 하려면 사건 선택으로 돌아가십시오.');
      const c = current(s);
      if (action === 'investigate' && c.settlement && payload && payload.id === c.settlement.consultInvestigation) throw new Error('합의 상담은 합의 제안 창에서 진행합니다.');
      const res = t.command(action, payload);
      if (!res.ok) throw new Error(res.error);
      return t;
    }
  };

  function command(action, payload = {}) {
    if (action === 'reset') { reset(); return { ok: true, view: projection() }; }
    const h = handlers[action];
    if (!h) return { ok: false, error: '알 수 없는 명령: ' + action, view: projection() };
    const draft = T.copy(state);
    // 공판 서비스는 자체 원자성을 가진다. 합의 상담처럼 세션 검증 뒤 공판 명령을 부르는 경우, 공판 명령이 마지막 실패 지점이다.
    let nextTrial;
    try { nextTrial = h(draft, payload || {}, trial); } catch (e) { return { ok: false, error: e.message.replaceAll(ko.presentation.openingLegacy, ko.presentation.opening), view: projection() }; }
    state = draft; trial = nextTrial;
    return { ok: true, view: projection() };
  }

  function projection() {
    const s = state, c = current(s);
    const view = {
      state: { phase: s.phase, session: s.session, caseId: s.caseId, prosecutorId: s.prosecutorId },
      files: caseList.map(x => ({ id: x.id, kind: 'signature', title: x.presentation.title, charge: x.variants[Object.keys(x.variants)[0]].charge, file: x.file, prosecutors: x.prosecutors, prosecutorNote: x.prosecutorNote }))
        .concat(dailyList),
      pack: { id: ko.id, version: ko.version, label: ko.label, disclaimer: ko.sentencing.disclaimer },
      records: s.records,
      trial: null, settlement: null, outcome: null, bandLabels: c ? c.bandLabels : null
    };
    if (!c) return T.copy(view);
    const tv = trial.projection(), st = c.settlement;
    if (st) tv.investigations = tv.investigations.filter(v => v.id !== st.consultInvestigation);
    view.trial = tv;
    view.presentation = c.presentation;
    view.prosecutor = find(c.prosecutors, s.prosecutorId);
    view.hint = c.file.hint;
    if (st) {
      const consult = s.records.find(r => r.kind === 'settlement_consult') || null;
      const cost = find(c.variants[s.prosecutorId].investigations, st.consultInvestigation).cost;
      const inPrep = tv.state.phase === 'prep';
      view.settlement = {
        offer: st.offer, note: st.note, unitLabel: tv.definition.prep.unitLabel, cost,
        advice: st.advice.map(a => ({ id: a.id, title: a.title })),
        consult, filed: s.records.some(r => r.kind === 'victim_will_filed'), documentLabel: ko.victimWill.documentLabel,
        available: inPrep && !consult && tv.projection.budgetLeft >= cost,
        reason: consult ? '상담함' : !inPrep ? '공판이 시작됨' : tv.projection.budgetLeft < cost ? '남은 시간 없음' : ''
      };
    }
    if (tv.state.phase === 'verdict') view.outcome = O.decide(c, ko, c.variants[s.prosecutorId], tv.records, s.records);
    // Presentation copy only: retain original append-only records for replay.
    tv.displayRecords = tv.records.map(r => {
      const display = T.copy(r);
      if (r.kind === 'witness_call') display.lines[0].text = ko.presentation.witnessCall;
      if (r.kind === 'verdict' && view.outcome.pronouncement) {
        display.lines = [...display.lines.slice(0, -1), { speaker: 'JUDGE', text: view.outcome.pronouncement }];
      }
      return display;
    });
    return T.copy(view);
  }

  reset();
  return { command, projection, reset: () => command('reset') };
}

const api = { createDemoSession };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmDemoSession = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
