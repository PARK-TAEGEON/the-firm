# PLAN-DEMO-001 · first consultation integration review

2026-10-13 · experiment lane / user playtest pending

## Purpose and changed scope

Integrate the **existing** DEMO-001 first client consultation scene into the PLAN-DEMO-001 flow:
첫 상담(8개 원본 대사) → 기본 변론 계획 → 기존 엔진의 자동 공판 → 간결한 법정 기록.

Changed files: plan-demo.html, ui/plan-demo-app.js, ui/plan-demo.css, tests/plan-demo-ui.test.js, tests/plan-demo.test.js, plus plan-demo README/RULES/REPORT/test-results and Task Contract. New REVIEW_PACKET. The original dialogue module, data, portraits, locations, demo.html and actual courtroom engine/services are unchanged.

## What the implementation does

- Reuses `FirmDemoConsultation.open`, `FirmDemoCase.presentation.consultation.lines`, original location/portrait presentation assets. No new witness or conversation facts.
- Original `tasks` shown under "이제 할 일" are replaced **only in a transient presentation copy** to avoid obsolete four half-day actions / settlement guidance; original dialogue lines and source data are untouched.
- On finishing the dialog, plan becomes available. A replay option returns to the authored opening dialog without discarding selected plan changes.
- Plan approval still delegates to `FirmPlanDemo.play` and uses actual append-only courtroom records. No new outcome computation, claim scoring or implicit exposure of internal plan to the court.

## Review and tests

Expected CI: `node --test tests/demo.test.js tests/plan-demo.test.js tests/plan-demo-ui.test.js` followed by `npm test`; existing Godot workflow separately triggered. Dialogue test checks authored text visibility, step-by-step progression, full-transcript path, finishing, replay, plan edit persistence. Original case/engine deterministic tests continue.

Status at first commit: CI not yet run for this new change. Final count and results recorded in `test-results.log` and REPORT after GitHub Actions completes. Local browser rendering at desktop/mobile and a human playtest are **not yet claimed**.

## Unresolved / limitations

The first consultation reveals the **initial denial**. Existing prepped snapshot after it includes a **reinterview admission** and four completed investigations; the intervening activities are summarized, not separately playable in this slice. Settlement is mentioned in the original authored dialogue but remains outside this experiment. Original DEMO-001 procedural/timing gate remains unmodified and is not validated as realistic. Original experimental sentencing is not legal audit.

Review question: Does the first client conversation make the transition into the plan feel natural, and is the plan→court→record flow still concise enough?
