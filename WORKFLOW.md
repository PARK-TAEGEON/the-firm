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

Implementer는 작업 후 **해당 작업 계약이 소유하는 경로**의 `REVIEW_PACKET.md`를 갱신한다. 예전 Godot VS에서는 `litigation-skeleton/REVIEW_PACKET.md`를 사용했다.

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

## Vertical Slice의 과거 기준선 (현재 작업 지도 아님)

- Godot VS-001~VS-006은 각 시점의 한정된 조사·분석·제출·사실인정 **실험 기준**이다. 현재 Court System v1.0 전체가 구현되었다는 뜻은 아니다.
- 과거 VS-007 Judgment, VS-008 Save/Load + Integrated Slice 표기는 **옛 순차 로드맵의 미착수 후보**다. 이를 현재 실행 순서로 자동 승격하지 않는다.
- **현재 업무·분야별 진행 상태와 다음 게이트:** [ROADMAP.md (Markmap)](ROADMAP.md).
- **검증된 main 기준과 실험/설계 경계:** [docs/CURRENT.md](docs/CURRENT.md).

완성 여부·검수 결과·시행 순서를 분야별 현황판에서 확인하고, 낡은 로드맵을 새 작업 계약으로 오해하지 않는다.

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

## 현황판 운영 원칙 (2026-10-14 개정)

9월 28일에 작성한 요일별 업무 일정과 `ROADMAP.md`의 과거 주간 체크리스트 운영 방침은 폐기한다. **계약/검수/브랜치 정책은 그대로 유지**하되, 실제 상태는 다음 두 문서에서 관리한다.

- [ROADMAP.md](ROADMAP.md): **Markmap용 분야별 진행 현황판**. 재판, UI, 사건 생성, World, Organization/HR, Business, QA, 출시 등.
- [docs/CURRENT.md](docs/CURRENT.md): 핵심 목표, 기준 버전, 진행 상태의 확인 범위, 열린 PR/미확인 항목.
- [docs/CHANGELOG.md](docs/CHANGELOG.md): 종료된 결정과 구현·검증 이력. 이전 실험·보고서를 지우지 않는다.

### 상태 구분

- **main 확인**: GitHub 기본 브랜치에 실제 반영된 구현 또는 Accepted 결정.
- **별도 브랜치/PR**: 실험과 문서가 있지만 main 미병합. 구현 범위와 테스트 출처를 함께 적는다.
- **사용자 진행 보고**: 로컬/외부 AI 작업 진행이 확인됐지만 해당 GitHub 기준선의 diff·테스트는 아직 미확인.
- **설계/Proposed**: 앞으로 구현할 규칙 또는 제안값. 코드 완료·밸런스 통과로 표시하지 않는다.
- **보류/미정**: 실제 재개 조건 또는 선행 검수 게이트를 적는다.

현황 갱신 시 **증거 링크(작업 계약, 소스 ref, 리뷰, 테스트 결과)**를 붙인다. 마감일만 지나도 완료 처리하지 않고, 자동 회귀 통과와 인간 플레이테스트를 분리한다. 다른 모델의 미푸시 로컬 변경은 GitHub 상태에 포함되지 않는다.

### 변경/검수 경계

- `AGENTS.md`의 experiment/production lane, reviewer·merge 권한이 이 문서의 요약보다 우선한다.
- 같은 production VS의 순차 작업에는 위의 *Task Transition Rule*을 적용한다. 여러 독립 experiment/docs 작업은 각자의 브랜치와 계약을 사용한다.
- 구현 범위나 Accepted DEC를 현황판 갱신만으로 수정하지 않는다. 새로운 설계는 Proposed로 남겨 사람이 채택 여부를 판단한다.
