# THE FIRM Development Workflow

## Purpose

THE FIRM 개발은 작은 검증 가능한 작업 단위로 진행한다.

기본 흐름:

PLAN
→ TASK CONTRACT
→ IMPLEMENT
→ TEST
→ REVIEW
→ COMMIT
→ NEXT TASK

각 단계를 건너뛰지 않는다.

---

## 1. Plan

현재 구현 상태와 다음 playable increment를 확인한다.

Architecture가 이미 Accepted 상태라면 새 설계를 만들지 않는다.

새로운 설계 결정이 정말 필요한 경우에만 DEC 단계로 돌아간다.

---

## 2. Task Contract

각 구현 작업은 `.agent/tasks/` 아래 하나의 Task Contract를 가진다.

예:

.agent/tasks/VS-003.md

Task Contract에는 최소한 다음이 있어야 한다.

- Goal
- Read First
- Current Baseline
- Implementation Scope
- Allowed Changes
- Forbidden Scope
- Acceptance Criteria
- Required Tests
- Completion Handoff

---

## 3. Implementation

Implementer는 Task Contract에 명시된 범위만 수정한다.

작업 시작 시:

git status

를 확인한다.

기존 unrelated modification은 건드리지 않는다.

---

## 4. Test

작업 완료 전:

1. legacy regression
2. 이전 VS regression
3. 현재 VS regression
4. 필요한 smoke/headless test

를 실행한다.

실패가 있으면 완료로 간주하지 않는다.

---

## 5. Review Packet

Implementer는 작업 후 `litigation-skeleton/REVIEW_PACKET.md`를 갱신한다.

반드시 기록:

- 작업 결과
- 실제 변경 파일
- 구현된 사용자 동작
- regression 결과
- GUI 확인
- 새 invariant
- public API
- 미구현 기능
- 다음 작업 handoff
- 범위 감사

---

## 6. Review

Reviewer는 다음을 읽는다.

- active Task Contract
- REVIEW_PACKET.md
- git diff
- test output

Reviewer는 다음 중 하나를 반환한다.

PASS

FIX REQUIRED

BLOCKED

Reviewer는 review 과정에서 production code를 수정하지 않는다.

---

## 7. Commit

PASS 이후에만 task 단위 commit을 만든다.

예:

feat(vs-003): add investigation workflow

하나의 VS task는 가능한 하나의 명확한 commit으로 유지한다.

push는 사용자가 명시적으로 요청했을 때만 수행한다.

---

## 8. Archive

Task가 PASS 되면 현재 REVIEW_PACKET을 다음 위치에 보관한다.

.agent/reviews/VS-003.md

그 후 다음 Task Contract를 활성화한다.

---

## Current Vertical Slice Roadmap

VS-001 — Case Review — COMPLETE
VS-002 — Task Execution + Issue/Theory — COMPLETE
VS-003 — Investigation
VS-004 — Legal Research + Strategy
VS-005 — Submission + CourtRecord
VS-006 — Adjudication
VS-007 — Judgment
VS-008 — Save/Load + Integrated Slice

---

## Branch / Worktree Policy

Each implementation task must run on its own short-lived branch or worktree.

Example:

task/vs-004

Rules:

- Do not implement directly on main.
- One active implementation task per branch.
- Do not mix unrelated fixes into the VS branch.
- Reviewer compares the task branch against main.
- Merge only after required tests pass and Reviewer returns PASS.
- Delete or retire the task branch after successful merge.

---

## Task Transition Rule

A new VS branch/worktree must be created only after the previous VS task:

1. passes required tests,
2. receives Reviewer PASS,
3. is committed,
4. is merged into main.

Before creating the next task branch/worktree, verify that main contains the previous task's final commit.

Never start VS-N+1 from a stale main or from an older task branch.

---

## Weekly Rhythm and Tooling (2026-09-28)

- 월: 이번 주 작업 계약서 확정, `ROADMAP.md` 갱신, Orca에서 에이전트 착수
- 화~수: 구현. 사람은 diff 검토만
- 목: 통합, 교차 리뷰(Claude ↔ Codex)
- 금: 외부 플레이테스트, `docs/CURRENT.md`와 `ROADMAP.md` 갱신, 다음 주 결정

`ROADMAP.md`는 markmap으로 보는 진행 지도다. 체크 표시와 날짜만 갱신하고 설명은 작업 계약서에 둔다.

실험 lane 작업은 위 1~8단계 중 독립 Review(6)를 생략할 수 있다. 상세는 `AGENTS.md`의 Work Lanes 절.

