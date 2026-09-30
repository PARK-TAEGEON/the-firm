(function (root) {
'use strict';
// GEN-001 2.5단계 — buildContestedCase 출력을 services/trial.js의 createTrialService로 끝까지 플레이한다.
// services/trial.js, engine/trial.js는 courtroom-prototype 소유 파일이다. 이 모듈은 그 API를 '읽기'로만
// 쓴다(require) — 수정하지 않았다.
//
// fullPrep=false: 준비 단계에서 아무 조사도 하지 않고 바로 finishPrep → 카드가 없어 cross에서 approach를
//   쓸 수 없다(missing card) → 매 witness endCross만 반복. 밸런스 점검 (a) "준비 없이 진행" 시나리오.
// fullPrep=true: 모든 investigation을 한 뒤, cross마다 "사용 가능한 접근법을 먼저 쓰고, 다음으로 사용 가능한
//   질문(press)을 쓰고, 더 없으면 endCross"를 반복한다. redirect의 재반대(pending.type==='rebuttal')는
//   카드가 있으면 항상 사용한다(준비를 실제로 썼다는 뜻이므로). 밸런스 점검 (b) "모든 준비 후" 시나리오.
// 신문 시간(focus.time)이 다 되면 서비스가 자동으로 cross를 끝내므로(afterCrossAction), 준비한 접근법을
// 전부 쓰지 못하고 시간이 먼저 끝날 수 있다 — 이는 버그가 아니라 실제 플레이의 제약이다.

const serviceModule = (typeof module !== 'undefined' && module.exports) ? require('../../services/trial.js') : root.FirmTrialService;
const { createTrialService } = serviceModule;

const MAX_STEPS = 5000;

// caseDef를 끝까지 플레이해 판결까지 도달시킨다. 실패(예상 못한 command 오류)는 예외로 던진다 — 밸런스
// 점검은 "정상적으로 플레이했을 때"만 의미 있고, 조용히 넘기면 버그를 숨긴다.
function playThrough(caseDef, { fullPrep }) {
  const service = createTrialService(caseDef);
  const run = (action, payload) => {
    const r = service.command(action, payload);
    if (!r.ok) throw new Error(`playThrough: ${action} 실패 — ${r.error}`);
    return r.view;
  };

  if (fullPrep) {
    for (const inv of caseDef.investigations) run('investigate', { id: inv.id });
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
      const press = fullPrep && view.actions.presses.find((p) => p.available);
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

const playthroughModule = { playThrough };
if (typeof module !== 'undefined' && module.exports) module.exports = playthroughModule; else root.FirmGeneratorPlaythrough = playthroughModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
