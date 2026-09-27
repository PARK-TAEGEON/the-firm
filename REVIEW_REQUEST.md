# v0.10.0 Independent Review Request — Adversarial Trial experiment

Status: implementation and automated checks complete; independent review and human playtest pending. Base HEAD 37d5b69 (v0.9.1 polish; courtroom-core-v0.9 lineage). The v0.9.1 review request is preserved in git history.

## Purpose
User product decision (2026-09-27): make the courtroom a contest of prepared material against an opponent, like a Football Manager match — mostly flowing, with a few decisive interventions. Built as a separate entry `courtroom-prototype/trial.html` so the existing v0.9.1 courtroom stays byte-identical and both can be playtested side by side. Contract: `.agent/tasks/COURTROOM-CORE-100.md`.

## What changed
- New: `trial.html`, `data/trial-case.js`, `engine/trial.js`, `services/trial.js`, `ui/trial-app.js`, `ui/trial.css`, `tests/trial.test.js`, `tests/browser-trial.test.js`.
- Modified: `package.json` (0.10.0, scripts), `README.md`, `EXPERIMENT_RULES.md` (v0.10 section appended), `REVIEW_PACKET.md` (v0.10 section prepended), `test-results.log`, `docs/CURRENT.md`.
- Unchanged: index.html and all existing engine/service/data/UI files, Godot, constitution/DEC documents.

Flow: prep (4 half-days, 6 irreversible investigations → evidence cards; prosecution exhibits sealed until records are inspected) → opening (focus sets cross-exam time per witness; knife stance is a public commitment) → per witness: auto-played direct with one objection window → cross (approaches gated by cards, limited/overreach conclusions, time budget) → conditional prosecutor redirect → rebuttal if the right card was prepared → verdict (all_required) → record-based review (effective / backfired / missed prep). Judge's notebook shows lean as sentences only; no numbers.

## Verification
- `npm test`: 247 (228 existing + 19 trial), 0 fail.
- `node tests/browser-trial.test.js`: 217 checks, 0 fail (3 viewports × acquit/convict, localhost + file://, no overflow, no numeric odds, focus, review, reset, keyboard).
- Legacy browser suites under bundled Chromium (Edge unavailable here; sources unmodified, temp copy only): 591 checks, 0 fail. `browser-full-flow` has one focus assertion that fails identically on untouched HEAD under Chromium — pre-existing environment difference; please rerun the full legacy suite on Edge. `ui-budget.js` 14 pass; `ui-flow-budget.js` depends on full-flow.

## Review focus
1. Records are the only input to lean/verdict/review; `replay(records)` equals the service projection.
2. Failed commands leave state and ID serial untouched; records are append-only; reset never reuses IDs.
3. Engine/service/UI contain no case-specific IDs (enforced by test); case logic lives in data conditions.
4. No RNG; acquit and convict are both reachable, and depend on preparation and choices.
5. Constitution §8 check: no single answer puzzle (identity, knife, or mixed routes), no numeric odds, courtroom reversals come from unprepared ground rather than overriding preparation.

## Human playtest questions (please answer after playing)
1. 준비 단계에서 "무엇을 포기할지" 고민했는가? 4회 예산이 적당한가?
2. 검찰 수사기록 열람 후 현장 사진(간판 불빛)을 보고 조도 측정을 하고 싶어졌는가?
3. 검사 주신문이 흐르는 동안 지루했는가, 긴장됐는가? "계속" 클릭 수는 적당한가?
4. 이의 창에서 판단할 근거가 있었는가, 아니면 찍기였는가?
5. 접근법을 고를 때 카드가 무기로 느껴졌는가? 결론 요구를 누를 타이밍을 스스로 판단했는가?
6. 재판장 메모만 보고 판세를 읽을 수 있었는가? 숫자가 없어서 답답했는가?
7. 검사가 개회사 모순을 공격하거나 간판 불빛으로 수습할 때 "당했다"와 "내 준비 탓이다" 중 어느 쪽으로 느꼈는가?
8. 복기를 읽고 한 판 더 하고 싶어졌는가? 두 번째 판에서 다른 경로를 시도했는가?
9. 기존 v0.9.1 법정(index.html)과 비교해 어느 쪽이 더 재밌었는가?

## Limits
One case, one prosecutor style, placeholder portraits, no sound/art, no closing argument, no save/load, no management loop. Numbers are authored playtest values, not Accepted design. Unrelated pre-existing uncommitted changes remain untouched; no push.
