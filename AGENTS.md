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