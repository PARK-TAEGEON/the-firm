# DESIGN-SYNC-001 · 재판 경험 설계 현황 정리

Lane: experiment
Role: Planner / documentation only
Branch: task/design-sync-001
Current baseline: PR #11 head ef0be1c03d3ca039e1bfb6c5bf2dc8445242cb5b
상태: 사용자 범위 재설정의 문서 반영. 게임 구현 착수 계약이 아니다.

## Goal / Read only

정민호를 일반적인 직접 담당 사건으로 삼고, 사진 공방을 제외하며, 사건 구성 고정 → 경험 정의/기본 시스템 → 대표 사건을 통한 확장으로 작업 순서를 바꾼다. 기본 보드·날짜 루프·기존 데이터는 보존한다.

AGENTS.md, CURRENT.md, CHANGELOG 최근 항목, 기존 현황판 및 본 계약, 기존 인계 문서와 통합 DEMO 288e1e7의 사건 데이터(common·인물·합의·결과)를 읽는다. Accepted DEC는 선행 현황판의 경계를 유지하며 새 법리·판정 규칙을 발명하지 않는다.

## Owns / Allowed Changes

- docs/TRIAL-DESIGN.md
- docs/CURRENT.md (상단 설계 재개 지점만 갱신)
- .agent/tasks/DESIGN-SYNC-001.md
- docs/reviews/DESIGN-SYNC-001/REVIEW_PACKET.md
- docs/reviews/DESIGN-SYNC-001/REPORT.md
- docs/reviews/DESIGN-SYNC-001/test-results.log

## Forbidden Scope

게임 코드·원본 사건·기존 테스트·아트·Accepted DEC·다른 PR 변경 또는 병합, main 직접 수정, 새 사진 공방 구현, 판정/형량 확정, 이력 재작성 금지. CHANGELOG는 실제 병합 전 완료 이력을 만들지 않는다.

## Acceptance / Handoff

일반 직접 사건이라는 역할과 구성 기준선이 명확함. INT-01/FLOW-03/옛 OPEN-01이 현행 과제에서 제외됨. 사진 공방 제거와 기존 사진·현장 자료 보존을 구분함. 기본 경험 초안·후속 확장·미정을 나눔. CURRENT 본문은 기존 구현 요약을 그대로 보존함.

현황판과 검토 문서는 현재 상태로 간결하게 재정리하고 과거 내용은 고정 커밋 링크로 보존한다. [이전 계약과 범위](https://github.com/PARK-TAEGEON/the-firm/blob/ef0be1c03d3ca039e1bfb6c5bf2dc8445242cb5b/.agent/tasks/DESIGN-SYNC-001.md)는 이력이다.

로컬은 새 문서 검사 사본이며 전체 게임 checkout이 아니다. CURRENT 기준 사본의 Git blob SHA를 확인하고, UTF-8·범위·링크·Markdown·원문 보존·git diff --check를 검사한다. 원격 커밋의 6개 문서 범위와 blob SHA를 확인한 뒤 기존 브랜치에 fast-forward한다. 게임 회귀·사람 테스트·법률 검수는 미실행으로 기록한다. 사용자와 합의한 지속 문서 반영 방식에 따라 기존 Draft PR #11에 후속 커밋만 추가하고 병합은 하지 않는다.
