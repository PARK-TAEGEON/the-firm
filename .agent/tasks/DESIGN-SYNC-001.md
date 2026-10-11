# DESIGN-SYNC-001 · 재판 경험 설계 현황 정리

Lane: experiment
Role: Planner / documentation only
Branch: task/design-sync-001
Baseline: main 30dc3b25fa7cef6a600a689cd0b1a1cac49cd1d8
상태: 문서 검토용. 다음 게임 구현 작업의 착수 계약이 아니다.

## Goal / Read only

최근 대화의 합의·가설·미결정, 기존 사건 재사용 기준과 다음 질문을 한 현황판에 모은다. AGENTS.md, WORKFLOW.md, CURRENT.md, CHANGELOG 최근 항목, PR #9 계획·PR #10 비용 노트, 통합 데모 288e1e7의 사건 데이터 첫 주석·common, DEC-024 §1~3와 DEC-031 §2를 참조한다.

## Owns / Allowed Changes

- docs/TRIAL-DESIGN.md
- docs/CURRENT.md (재개 지점 7줄만 추가)
- .agent/tasks/DESIGN-SYNC-001.md
- docs/reviews/DESIGN-SYNC-001/REVIEW_PACKET.md
- docs/reviews/DESIGN-SYNC-001/REPORT.md
- docs/reviews/DESIGN-SYNC-001/test-results.log

## Forbidden Scope

게임 코드·사건 데이터·아트·기존 테스트·Accepted DEC 변경, 다른 PR 수정/병합, 새 법률·양형 확정, 다음 구현 착수, main 직접 수정·force push 금지. CHANGELOG에는 병합 전 완료 이력을 만들지 않는다.

## Acceptance Criteria

상단에서 전체 흐름과 다음 질문을 찾는다. 합의·부분 동의·제안을 구분한다. 기존 사건의 숨은 진실을 다시 미정으로 만들지 않는다. 법률 검토와 변론 계획, 병행 가능한 방어, 공통 보드, 피드백 후보, 개입의 미해결점을 기록한다. 문서 작성과 구현·플레이 검증·병합을 구분한다.

## Required Tests / Handoff

문서 초안의 구조·링크·원문 보존 검사에 이어 최종 인계 문서의 allowlist·UTF-8·Markdown·상대 링크·diff whitespace를 점검한다. 연결 도구의 blob SHA로 현황판과 CURRENT가 검증한 내용과 일치하는지 확인하고, 원격 커밋의 변경 목록을 다시 확인한다. 로컬 검증 사본은 전체 게임 clone이 아니며 사용자 PC의 미커밋 작업을 건드리지 않는다.

REPORT와 REVIEW_PACKET에 충족 여부·검증·미실행·TBD를 남긴다. 실행 코드·게임 invariant 변경이 없으므로 게임 엔진/브라우저/Godot 회귀와 사람 테스트는 미실행으로 명시한다. 이번 문서 검사로 전체 회귀 PASS를 주장하지 않는다. 사용자 요청에 따라 원격 별도 브랜치에 한 커밋과 Draft PR을 만들되 병합은 하지 않는다. 병합 시 담당자가 CHANGELOG에 실제 병합일·작업·위치·작성자·미결정을 남긴다.
