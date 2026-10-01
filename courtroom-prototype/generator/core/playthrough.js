(function (root) {
'use strict';
// GEN-001 — buildContestedCase 출력을 services/trial.js의 createTrialService로 끝까지 플레이한다.
// services/trial.js, engine/trial.js는 courtroom-prototype 소유 파일이다. 이 모듈은 그 API를 '읽기'로만
// 쓴다(require) — 수정하지 않았다.
//
// 플레이 정책:
//   playThrough(caseDef, {fullPrep})      — 고정 정책(준비 없음 / 예산이 허락하는 만큼 전부). 결정론적.
//   playThroughSensible(caseDef, rng)     — 무작위 준비 + 카드 기반 상식적 신문. balance.js (c).
//   playThroughRandom(caseDef, rng)       — 기존 완전 무작위 선택. balance.js (e) 참고.
//   playBestPathForIssue(caseDef, issueId) — 그 쟁점 하나를 doubt로 미는 데 전지적으로 최선을 다한다.
//                                            balance.js (b)(d) — "탐색 기준 최선 경로".
//
// fullPrep=false: 준비 단계에서 아무 조사도 하지 않고 바로 finishPrep → 카드가 없어 cross에서 approach를
//   쓸 수 없다(missing card) → 매 witness endCross만 반복. 밸런스 점검 (a) "준비 없이 진행" 시나리오.
// fullPrep=true: 예산이 허락하는 investigation을 등장 순서대로 산다(항목 1: 예산이 총비용보다 작아졌으므로
//   "전부"가 아니라 "살 수 있는 만큼"이다). cross마다 "사용 가능한 접근법을 먼저 쓰고, 다음으로 사용 가능한
//   질문(press)을 쓰고, 더 없으면 endCross"를 반복한다. redirect의 재반대는 카드가 있으면 항상 사용한다.
// 신문 시간(focus.time)이 다 되면 서비스가 자동으로 cross를 끝내므로(afterCrossAction), 준비한 접근법을
// 전부 쓰지 못하고 시간이 먼저 끝날 수 있다 — 이는 버그가 아니라 실제 플레이의 제약이다.

const serviceModule = (typeof module !== 'undefined' && module.exports) ? require('../../services/trial.js') : root.FirmTrialService;
const { createTrialService } = serviceModule;
const trialEngine = (typeof module !== 'undefined' && module.exports) ? require('../../engine/trial.js') : root.FirmTrial;

const MAX_STEPS = 5000;

function driver(caseDef) {
  const service = createTrialService(caseDef);
  const run = (action, payload) => {
    const r = service.command(action, payload);
    if (!r.ok) throw new Error(`playThrough: ${action} 실패 — ${r.error}`);
    return r.view;
  };
  return { service, run };
}

// caseDef를 끝까지 플레이해 판결까지 도달시킨다. 실패(예상 못한 command 오류)는 예외로 던진다 — 밸런스
// 점검은 "정상적으로 플레이했을 때"만 의미 있고, 조용히 넘기면 버그를 숨긴다.
function playThrough(caseDef, { fullPrep }) {
  const { service, run } = driver(caseDef);

  if (fullPrep) {
    // 항목 1: 예산 < 총비용이라 전부 살 수 없다 — 등장 순서대로, 살 수 있는 것만 산다.
    for (const inv of caseDef.investigations) {
      const affordable = service.projection().investigations.find((i) => i.id === inv.id).affordable;
      if (affordable) run('investigate', { id: inv.id });
    }
  }
  run('finishPrep');
  run('open', { focusId: caseDef.opening.focus[0].id, stanceId: caseDef.opening.stance[0].id });

  let view = service.projection();
  let steps = 0;
  while (view.state.phase !== 'verdict') {
    if (++steps > MAX_STEPS) throw new Error(`playThrough: ${MAX_STEPS}스텝 안에 끝나지 않았다 — phase=${view.state.phase} part=${view.state.cursor && view.state.cursor.part}`);

    if (view.state.pending) {
      if (view.state.pending.type === 'objection') { view = run('objection', { object: false }); continue; }
      if (view.state.pending.type === 'rebuttal') { view = run('rebut', { use: fullPrep }); continue; }
      throw new Error(`playThrough: 알 수 없는 pending 타입 — ${view.state.pending.type}`);
    }

    const part = view.state.cursor && view.state.cursor.part;
    if (part === 'cross') {
      const approach = fullPrep && view.actions.approaches.find((a) => a.available);
      if (approach) { view = run('approach', { id: approach.id }); continue; }
      const press = fullPrep && view.actions.presses.find((p) => p.available && p.kind === 'limited');
      if (press) { view = run('press', { id: press.id }); continue; }
      view = run('endCross');
      continue;
    }
    if (['intro', 'direct', 'redirect'].includes(part)) { view = run('continue'); continue; }
    if (part === 'closed') { view = run('verdict'); continue; }
    throw new Error(`playThrough: 알 수 없는 진행 상태 — part=${part}`);
  }

  return { outcome: view.verdict.outcome, view };
}

// balance.js (e) — 기존 "무작위 합법 준비·무작위 선택". rng는 generator/core/rng.js의 createRng(seedFor(...))로
// 만든 결정적 스트림을 넘겨야 한다(재현 가능해야 하므로 Math.random 사용 금지). 예산 안에서 무작위 순서로
// 살 수 있는 조사를 사고, focus/stance를 무작위로 고르고, cross에서 매 순간 "가능한 행동" 중 하나를
// 무작위로 고른다(approach/press/endCross). objection·rebuttal 결정도 50/50 무작위.
function shuffle(list, rng) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function pickRandom(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

function playRandomPolicy(caseDef, rng, sensible) {
  const { service, run } = driver(caseDef);

  for (const id of shuffle(caseDef.investigations.map((i) => i.id), rng)) {
    const affordable = service.projection().investigations.find((i) => i.id === id).affordable;
    if (affordable) run('investigate', { id });
  }
  run('finishPrep');
  const focus = pickRandom(caseDef.opening.focus, rng);
  const stance = pickRandom(caseDef.opening.stance, rng);
  run('open', { focusId: focus.id, stanceId: stance.id });

  let view = service.projection();
  let steps = 0;
  while (view.state.phase !== 'verdict') {
    if (++steps > MAX_STEPS) throw new Error(`playThroughRandom: ${MAX_STEPS}스텝 안에 끝나지 않았다 — phase=${view.state.phase} part=${view.state.cursor && view.state.cursor.part}`);

    if (view.state.pending) {
      if (view.state.pending.type === 'objection') { view = run('objection', { object: rng() < 0.5 }); continue; }
      if (view.state.pending.type === 'rebuttal') { view = run('rebut', { use: sensible || rng() < 0.5 }); continue; }
      throw new Error(`playThroughRandom: 알 수 없는 pending 타입 — ${view.state.pending.type}`);
    }

    const part = view.state.cursor && view.state.cursor.part;
    if (part === 'cross') {
      if (sensible) {
        const approaches = view.actions.approaches.filter(a => a.available && a.cards.length > 0);
        if (approaches.length) {
          view = run('approach', { id: pickRandom(approaches, rng).id });
          continue;
        }
        const witness = caseDef.witnesses.find(w => w.id === view.witness.id);
        const points = view.projection.witnesses.find(w => w.id === witness.id).points;
        const press = view.actions.presses.find(p => p.available && p.kind === 'limited'
          && trialEngine.pressSucceeds(witness.presses.find(pr => pr.id === p.id), points));
        view = press ? run('press', { id: press.id }) : run('endCross');
        continue;
      }
      const options = [
        ...view.actions.approaches.filter((a) => a.available).map((a) => ({ action: 'approach', id: a.id })),
        ...view.actions.presses.filter((p) => p.available).map((p) => ({ action: 'press', id: p.id })),
        { action: 'endCross' }
      ];
      const choice = pickRandom(options, rng);
      view = run(choice.action, choice.id ? { id: choice.id } : undefined);
      continue;
    }
    if (['intro', 'direct', 'redirect'].includes(part)) { view = run('continue'); continue; }
    if (part === 'closed') { view = run('verdict'); continue; }
    throw new Error(`playThroughRandom: 알 수 없는 진행 상태 — part=${part}`);
  }

  return { outcome: view.verdict.outcome, view };
}

function playThroughRandom(caseDef, rng) { return playRandomPolicy(caseDef, rng, false); }
function playThroughSensible(caseDef, rng) { return playRandomPolicy(caseDef, rng, true); }

// balance.js (b)(d) — "탐색 기준 최선 경로". 전지적 시점(실제 플레이어는 모를 정보까지 안다는 전제)으로
// targetIssueId 하나를 doubt band로 밀어붙이는 데 전념한다. adjudicate()가 필수 쟁점 중 하나라도 doubt면
// not_guilty이므로(engine/trial.js adjudicate), 쟁점 하나만 제대로 밀어도 무죄가 나올 수 있다 — 모든
// 조사·접근법 조합을 전수 탐색하지는 않지만(과도한 조합 폭발을 피함), "이 쟁점에 전념한다"는 자연스러운
// 전략 공간을 대표한다: 그 쟁점의 조사를 예산 안에서 우선 구매(그 쟁점 자체 증거 → 그 쟁점을 겨냥한 twist
// 조사 순), 그 쟁점에 집중하는 focus를 고르고(F_${issueId}), 안전한 stance(S_CONTEST — 충돌 없음)를 쓰고,
// 이의는 유리한 쪽으로(proper면 이의, improper면 통과), 그 쟁점 증인에게는 가능한 접근법·press를 전부,
// 다른 증인은 즉시 endCross(시간 낭비 방지), 재반대는 항상 사용한다.
// investigationOrder는 (d)의 조사 대조군이다. 개회사·신문 정책은 그대로 둔다.
function playBestPathForIssue(caseDef, issueId, { investigationOrder } = {}) {
  const { service, run } = driver(caseDef);

  const targetWitness = caseDef.witnesses.find((w) => w.issue === issueId);
  const targetCardIds = new Set([
    ...targetWitness.approaches.map((a) => (a.requiresAny || [])[0]).filter(Boolean)
  ]);
  const priority = investigationOrder || caseDef.investigations
    .filter((inv) => (inv.grants || []).some((cardId) => targetCardIds.has(cardId)))
    .map((inv) => inv.id);
  for (const id of priority) {
    const affordable = service.projection().investigations.find((i) => i.id === id).affordable;
    if (affordable) run('investigate', { id });
  }
  // 남는 예산은 등장 순서대로 나머지에 쓴다(다른 쟁점의 재반대 기회를 막을 이유는 없다 — 목표 쟁점에만
  // 영향 없으면 무해하다).
  for (const inv of caseDef.investigations) {
    if (priority.includes(inv.id)) continue;
    const affordable = service.projection().investigations.find((i) => i.id === inv.id).affordable;
    if (affordable) run('investigate', { id: inv.id });
  }
  run('finishPrep');
  const focus = caseDef.opening.focus.find((f) => f.id === `F_${issueId}`) || caseDef.opening.focus[0];
  const stance = caseDef.opening.stance.find((s) => s.id === 'S_CONTEST') || caseDef.opening.stance[0];
  run('open', { focusId: focus.id, stanceId: stance.id });

  let view = service.projection();
  let steps = 0;
  while (view.state.phase !== 'verdict') {
    if (++steps > MAX_STEPS) throw new Error(`playBestPathForIssue: ${MAX_STEPS}스텝 안에 끝나지 않았다 — phase=${view.state.phase} part=${view.state.cursor && view.state.cursor.part}`);

    if (view.state.pending) {
      if (view.state.pending.type === 'objection') {
        const w = caseDef.witnesses[view.state.cursor.w];
        const step = w && w.direct.find((s) => s.type === 'objection');
        view = run('objection', { object: !!(step && step.proper) });
        continue;
      }
      if (view.state.pending.type === 'rebuttal') { view = run('rebut', { use: true }); continue; }
      throw new Error(`playBestPathForIssue: 알 수 없는 pending 타입 — ${view.state.pending.type}`);
    }

    const part = view.state.cursor && view.state.cursor.part;
    if (part === 'cross') {
      const onTarget = view.witness && view.witness.id === targetWitness.id;
      if (onTarget) {
        const approach = view.actions.approaches.find((a) => a.available && a.cards.length > 0 && !a.id.includes('_STANCE_'));
        if (approach) { view = run('approach', { id: approach.id }); continue; }
        const points = view.projection.witnesses.find(w => w.id === targetWitness.id).points;
        const press = view.actions.presses.find(p => p.available && p.kind === 'limited'
          && trialEngine.pressSucceeds(targetWitness.presses.find(pr => pr.id === p.id), points));
        if (press) { view = run('press', { id: press.id }); continue; }
      }
      view = run('endCross');
      continue;
    }
    if (['intro', 'direct', 'redirect'].includes(part)) { view = run('continue'); continue; }
    if (part === 'closed') { view = run('verdict'); continue; }
    throw new Error(`playBestPathForIssue: 알 수 없는 진행 상태 — part=${part}`);
  }

  return { outcome: view.verdict.outcome, view };
}

const playthroughModule = { playThrough, playThroughRandom, playThroughSensible, playBestPathForIssue, shuffle, pickRandom };
if (typeof module !== 'undefined' && module.exports) module.exports = playthroughModule; else root.FirmGeneratorPlaythrough = playthroughModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
