# PLAN-DEMO-001 · 내부 계획 → 자동 법정 → 실행 기록

Lane: experiment
Owner: GPT-6 (implementation + self-review; human playtest pending)
Branch: task/plan-demo-001
Base: task/demo-001 at 288e1e7276a56887f42f7b5f02146c74b583d50d

## Goal
정민호 사건에서 변호사가 작성한 기본 변론 계획을 그대로 승인하거나 현장 동선 재반대신문만 제외하고, 기존 DEMO-001 재판 엔진이 실제로 수행한 사건 기록을 짧게 확인한다. 새 스토리/판정 규칙/전술 퍼즐을 만들지 않는다. 법정에서 플레이어를 질문마다 중단하지 않는다.

## Read only
AGENTS.md, root DESIGN.md, .agent/tasks/DEMO-001.md, courtroom-prototype/demo/RULES.md, data/demo-separated-moments.js, services/demo-session.js and demo-trial.js, tests/demo.test.js. Design reference: docs/TRIAL-DESIGN.md at PR #11 head 6888997ed3c49c8e11cd419389cb6f0982712598 (not merged into this branch). Accepted DEC-017/031 guardrails apply.

## Owns
- courtroom-prototype/plan-demo.html
- courtroom-prototype/ui/plan-demo.css
- courtroom-prototype/ui/plan-demo-app.js
- courtroom-prototype/services/plan-demo.js
- courtroom-prototype/tests/plan-demo.test.js
- courtroom-prototype/plan-demo/README.md
- courtroom-prototype/plan-demo/RULES.md
- courtroom-prototype/plan-demo/REPORT.md
- .github/workflows/plan-demo-tests.yml
- this contract

## Forbidden
Existing engine, DEMO-001 data, DEMO-001 services/UI/tests, accepted DEC, main, user worktrees, PR #11 modifications. No automatic merge or new hidden legal rules.

## Acceptance
1. Same baseline known evidence, two cases differ only in whether on-plan field-layout re-cross-examination is used. Both preserve core video/medical examination.
2. Approving plan executes actual case service without manual repeated cross-examination clicks; approved plan stays internal to defense. Raw courtroom record and summarized view are distinct.
3. Court record foregrounds *신문 수행* and actual witness statements. Prosecutor rebuttal and separate experimental judgment visible. Absent/planned-but-not-executed not mislabeled successful.
4. Same plan deterministic; old case definition unchanged; no random courtroom verdict effects.
5. 390 and 1440px browser review, keyboard access, Node service regression. Report tests honestly; CI success is not human fun verification.

## Handoff
PLAN-DEMO experiment can be discarded. Branch PR against task/demo-001 stays Draft. Existing early-filing preparedAgainst gate is an inherited demo limitation, NOT a preferred mechanic; document before playtest. No change to original DEMO-001.
