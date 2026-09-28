# THE FIRM Repository Rules

## Source of Truth
- `/docs` 또는 repository root의 Accepted design documents가 게임 설계의 source of truth다.
- DEC 문서에서 결정되지 않은 규칙을 임의로 구현하지 않는다.
- 구현 중 설계 공백을 발견하면 추측하지 말고 TBD로 보고한다.

## Architecture
- DATA → SIMULATION → SERVICES → PRESENTATION → UI
- UI에 simulation/domain logic을 넣지 않는다.
- State mutation은 service를 통해 수행한다.
- Persistent IDs를 사용하고 재사용하지 않는다.
- gameplay RNG는 중앙화되고 재현 가능해야 한다.
- optional presentation/art가 없어도 simulation은 동작해야 한다.
- headless regression test 가능성을 유지한다.

## Scope Discipline
- 작업 요청에 명시된 allowed files와 scope만 수정한다.
- adjacent refactor를 하지 않는다.
- 요청되지 않은 새 feature를 추가하지 않는다.
- "개선할 수 있어서"라는 이유로 unrelated code를 수정하지 않는다.
- 설계 변경이 필요하면 구현을 멈추고 보고한다.

## Testing
작업 완료 전 반드시:
1. 관련 regression test 실행
2. 기존 테스트가 모두 통과하는지 확인
3. 새 invariant가 있으면 positive/negative test 추가
4. failed command가 state를 오염시키지 않는지 필요한 경우 검증
5. `test-results.log`를 최신 실행 결과로 갱신

## Review Handoff
작업 완료 후 `REVIEW_PACKET.md`를 갱신한다.

포함:
- 작업 목적
- 변경 파일 목록
- 각 변경 요약
- 새로 강제되는 invariant
- 추가/변경한 테스트
- 실행 명령
- 총 checks / failures / exit code
- 여전히 fixture/injected인 부분
- 미구현/TBD
- 설계 판단이 필요해 건드리지 않은 부분
- 범위 외 변경 여부

## Git
- 작업 시작 시 git status를 확인한다.
- 작업 종료 시 git diff를 검토한다.
- unrelated modification을 commit하지 않는다.
- test가 통과한 뒤 하나의 명확한 commit을 만든다.
- commit message는 변경 목적을 설명한다.
- git push는 사용자가 명시적으로 요청하지 않는 한 하지 않는다.
- force push, history rewrite, destructive reset 금지.

## Litigation-specific rule
현재 litigation-skeleton은 injected-input validation skeleton이다.
다음 항목을 구현된 것으로 간주하지 않는다:
- automatic judgment generation
- legal reasoning engine
- appellate admissibility
- evidence admissibility
- precedent effect
- workload formula
- judge/opponent AI
- Career/Business/World integration
- UI/save system

테스트 통과를 위해 위 규칙을 임의로 발명하지 않는다.

## Agent Roles

### Planner
- repository와 accepted design 문서를 읽고 Task Contract를 작성한다.
- production code를 수정하지 않는다.
- 이미 닫힌 architecture를 임의로 다시 설계하지 않는다.

### Implementer
- active Task Contract에 명시된 범위만 구현한다.
- 허용되지 않은 파일이나 다음 VS scope를 건드리지 않는다.
- 구현 후 required regression을 실행하고 REVIEW_PACKET.md를 갱신한다.

### Reviewer
- Task Contract, git diff, test result, REVIEW_PACKET을 검토한다.
- review 중 production code를 몰래 수정하지 않는다.
- 판정은 다음 중 하나로 한다:
  - PASS
  - FIX REQUIRED
  - BLOCKED

## Active Task Contract

구현 작업을 시작하기 전에 `.agent/tasks/` 아래의 active task contract를 읽는다.

Task Contract와 Accepted design document가 충돌하면 구현을 멈추고 충돌을 보고한다.

## Completion Gate

작업 완료를 선언하기 전에 반드시 다음을 확인한다.

- requested scope implemented
- forbidden scope untouched
- existing regressions pass
- new regressions pass
- git diff reviewed
- REVIEW_PACKET updated
- no next-stage work started

Reviewer PASS 전에는 다음 VS task로 진행하지 않는다.

## Courtroom web prototype

- `courtroom-prototype/` 작업 전 repository root의 `DESIGN.md`와 해당 active Task Contract를 읽는다.
- `DESIGN.md`는 별도 웹 프로토타입의 기준이며 Godot Accepted litigation design을 대체하지 않는다. 새 요청의 변경점만 적용하고 문서도 함께 갱신한다.

## Work Lanes and Context Budget (2026-09-28, 사용자 결정)

이 절은 아래 기존 규칙보다 우선한다. 작업 계약서의 `Lane:` 값으로 적용 범위를 정한다.

### 실험 lane (`Lane: experiment`)
- 목적은 재미 검증이다. 1페이지 작업 계약서면 충분하다.
- 독립 Reviewer PASS 없이 병합할 수 있다. 통과 기준은 계약서의 완료 기준과 **사람 플레이테스트**다.
- 테스트는 엔진 핵심(결정성, 원자성, 기록 기반)만 요구한다. UI 글자 수 예산 같은 고정 테스트는 추가하지 않는다.
- 결과가 재미없으면 브랜치째 폐기할 수 있다. 폐기도 결과로 `docs/CURRENT.md`에 한 줄 남긴다.
- **규칙 결정 권한:** 계약서 범위 안에서 필요한 수치·규칙·데이터 형식은 에이전트가 정하고 구현한다. 위 Source of Truth의 "DEC에 없는 규칙 임의 구현 금지"는 실험 lane에 적용하지 않는다. 대신 정한 규칙을 Owns 폴더의 `RULES.md`에 "실험용 authored 규칙, DEC 아님"으로 표시해 모두 적는다. Accepted DEC와 정면으로 모순될 때만 멈추고 묻는다.
- **완료 전 자체 점검 (필수):** Owns 폴더의 `REPORT.md`에 다음을 적는다.
  1. 테스트 실행 명령과 결과 요약(합계, 실패)
  2. 계약서 완료 기준 각각의 충족/미충족과 근거
  3. 이번에 새로 정한 규칙 목록(`RULES.md` 참조)
  4. 알려진 한계와, 사람이 판단할 질문 3개 이내
- **교차 리뷰:** 목요일에 다른 모델이 `REPORT.md`와 diff를 읽고 문제 목록만 남긴다. 수정은 원 작업자가 한다. 병합 결정은 사람이 한다.

### 생산 lane (`Lane: production`)
- 재미가 확인된 것만 들어온다. 기존 WORKFLOW(Task Contract → 구현 → 회귀 → Review Packet → 독립 리뷰 → 커밋)를 그대로 따른다.

### Context budget
- 에이전트가 기본으로 읽는 문서는 `AGENTS.md`, `docs/CURRENT.md`, `docs/CHANGELOG.md`의 최근 항목, 배정된 작업 계약서뿐이다.
- 작업을 병합하면 `docs/CHANGELOG.md` 맨 위에 한 항목을 추가한다(날짜, 무엇을, 어디에, 누가, 결정/미결정).
- DEC/TEST 문서는 계약서의 `Read only:` 항목에 지정된 경우에만, 지정된 절만 읽는다.
- 테스트 출력은 요약(합계, 실패 항목)만 보고한다.

### Parallel agents (Orca)
- 에이전트마다 별도 worktree/브랜치를 쓴다. 브랜치 이름: `task/<계약서 ID 소문자>`.
- 계약서의 `Owns:` 폴더 밖 파일은 수정하지 않는다. 필요하면 멈추고 보고한다.
- 사람의 결정(병합, 폐기, 방향)은 에이전트가 대신하지 않는다.
