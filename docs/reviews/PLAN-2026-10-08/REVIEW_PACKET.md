# PLAN-2026-10-08 — 문서 리뷰 인계·검증 기록

작성: 2026-10-08 · 브랜치: `task/trial-vertical-slice-plan`
기준: main `30dc3b25fa7cef6a600a689cd0b1a1cac49cd1d8`
판정: 문서 범위 자체 점검 완료. **전체 게임 회귀 PASS 아님.** 생산 구현·독립 Reviewer 승인·사람 재미 검증을 주장하지 않는다.

## 목적과 변경 파일

사용자가 합의한 개발 계획 개편을 비교 근거와 실제 구현 차이에 연결한다. 사용자 요청을 문서 작업 계약으로 삼으며, 게임 구현 계약이나 새 DEC의 불변 조건을 만들지 않는다.

| 파일 | 변경 |
| --- | --- |
| `docs/PLAN-2026-10-08_TRIAL_VERTICAL_SLICE.md` | 비교 기준 SHA, 구현/리뷰 구분, 결정 방향, 기존 DEC와 세계·경영 경계, 플레이 루프·화면, 전략→공방→결과 연결, 제외 범위, 단계별 구현·성공/실패 기준 |
| `docs/CURRENT.md` | 날짜가 있는 방향 업데이트와 계획 링크, 과거 main 구현과 별도 실험 구분, 그래픽 제외/본류 선택의 오래된 방향 갱신 |
| `ROADMAP.md` | 현재 slice 우선순위와 계획 링크, 과거 주간 계획 표시 |
| `docs/reviews/PLAN-2026-10-08/REVIEW_PACKET.md` | 문서 변경의 범위 감사와 검증·미정 기록 |
| `docs/reviews/PLAN-2026-10-08/test-results.log` | 이번 실행 결과 요약. 기존 구현 작업의 테스트 로그는 덮어쓰지 않음 |

## 확인 근거와 범위

- v0.10의 실제 엔진·서비스·규칙, DEMO-001의 세션/판정 서비스·규칙, 독립 core-loop-lab의 데이터·엔진·UI·REPORT를 읽었다. 주장 축소 opt-in 실험과도 구분했다.
- 헌법/시스템 맵/아키텍처, DEC-006/024/027/028/031/032, 기존 설계 메모와 WORLD/SYS-004 자료를 대조했다. SYS-004의 Proposed 상태를 유지한다. 일부 DEC의 과거 Proposed 참조는 DEC-031의 채택/개정 상태로 읽는다.
- 새 사람 플레이테스트를 수행하지 않았다. 주관적 피로·재미 평가는 사용자가 전달한 리뷰로 귀속하고, 코드를 읽어 확인한 조건과 분리했다.
- 기능의 구현 여부는 문서에 고정한 브랜치/커밋 범위다. 외부 작업의 이후 변경을 포함하지 않는다. 다른 브랜치를 이 브랜치에 병합하지 않았다.

## 검증

상세 명령과 합계는 [test-results.log](test-results.log). 변경 코드가 없는 main 기준의 웹 회귀를 실행했다.

- `npm test`: 247 tests, 0 failures, exit 0.
- `npm run test:browser`: 앞 8개 suite 591 checks 통과. full-flow의 `Record sheet returns focus to rebuilt opener` assertion에서 중단, exit 1. 뒤 trial suite는 이 명령에서 실행되지 않았다.
- `npm run test:budget`: UI budget 14, full-flow 187, full-flow budget 61 checks, 0 failures, exit 0. 같은 full-flow가 다른 실행에서는 실패했으므로 안정적 PASS로 일반화하지 않는다.
- `node tests/browser-full-flow.test.js`: 단독 재확인에서도 위 포커스 assertion 실패, exit 1.
- `node tests/browser-trial.test.js`: `desktop/acquit: no page errors`에서 리소스 404 감지, exit 1.
- 두 실패는 변경하지 않은 게임 코드에서 발생했고, 독립 실험 `61666f7`의 REPORT에도 같은 항목이 보고되어 있다. 원인 수정은 문서 전용 범위 밖이다. 전체 checks 수를 출력하지 않고 중단한 suite의 합계를 추정하지 않는다.
- Godot 회귀는 실행하지 못했다(현재 PATH에 실행 파일 없음). 다른 브랜치의 통합 데모·독립 실험 회귀는 이번 변경의 실행 결과로 주장하지 않는다.
- 문서 상대 링크/고정 GitHub 파일 참조 55건과 UTF-8 문서 4개를 확인했다. `git diff --check` 통과. 허용 파일 목록과 최종 diff를 검토했다. 게임 코드·사건 데이터·테스트·기존 실험은 변경하지 않았다.

## 미구현·후속 검토

새 slice 전체가 구현 전이다. 기존 데모/독립 실험의 자료·조건부 대응은 authored/fixture이며 범용 재판 추론이나 세계·경영 통합 완료가 아니다. 사건 선택·보드 배치·자동 진행 정책·시간 단위·수치·경영 접점은 계획의 미정 목록에 남겼다.

새 런타임 invariant/API/테스트 추가 없음. 기존 DEC의 불변 조건을 유지한다. 다음 단계 구현·아트 제작·기존 회귀 결함 수정·자동 병합은 수행하지 않는다. 이 문서 PR은 사용자가 요청한 계획 검토용이며, 기존 게임의 회귀 실패를 숨기거나 다음 생산 작업의 완료 게이트를 통과한 것으로 취급하지 않는다.
