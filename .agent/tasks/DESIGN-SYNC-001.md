# DESIGN-SYNC-001 · 주인공 역량·참여 방식 결정 기록

Lane: experiment
Role: Planner / documentation only
Branch: task/design-sync-001
Current baseline: PR #11 head 049926065f9d3a24a7767b14fd2e407d057ba32e
상태: 사용자의 “추천대로 할게”를 문서에 반영. 게임 구현 착수 계약이 아니다.

## Goal / Read only

주인공도 역량을 갖고 기본 업무를 자동 수행하며 플레이어 판단이 보완하는 방향, 단순 사건은 핵심 참여 기능을 검증한다는 범위를 같은 현황판에 기록한다. 상세 성장·능력 표시·실행 공식은 보류한다.

읽을 기준: AGENTS, CURRENT 상단, CHANGELOG 최근 항목, 기존 본 계약과 현황판, DEC-017 §1 및 상태 머리말, DEC-031 §2. 기존 v0.4 사건 범위와 기록 기반 원칙을 유지한다. 첨부 v0.5는 검토 초안이며 일괄 승인하지 않는다.

## Owns / Allowed Changes

- docs/TRIAL-DESIGN.md
- .agent/tasks/DESIGN-SYNC-001.md
- docs/reviews/DESIGN-SYNC-001/REVIEW_PACKET.md
- docs/reviews/DESIGN-SYNC-001/REPORT.md
- docs/reviews/DESIGN-SYNC-001/test-results.log

## Forbidden Scope

게임 코드·사건·기존 테스트·아트·Accepted DEC·CURRENT·CHANGELOG·다른 PR 변경, main 직접 수정, 새 사진 공방, 상세 스탯/성장/판정 구현, force push·이력 재작성·자동 병합 금지.

## Acceptance / Handoff

사용자 합의와 미정 구분, 단순 사건의 전략성 의무 제거, 주인공/직원 역량과 플레이어 지시 관계, 기본 편의 비잠금·권한·기록 경계, 고정 역량 데모 범위, 다음 기본 계획 화면 검토를 기록한다. 새 실행 invariant/API는 만들지 않는다.

로컬은 문서 검증 사본이다. 첨부 v0.5 패치를 역적용해 복원한 v0.4는 원격에서 확인한 blob SHA와 대조한다. 새 문서의 UTF-8·범위·Markdown·링크·사건 범위 보존·git diff --check를 검증한다. 원격 compare로 5개 문서만 달라졌는지 확인한 뒤 예상 head를 재확인하고 fast-forward한다. 게임 회귀·사람 테스트·법률 검수는 미실행으로 기록한다. 기존 Draft PR #11에 한 후속 커밋을 남기며 새 구현을 시작하지 않는다.

[이전 계약](https://github.com/PARK-TAEGEON/the-firm/blob/049926065f9d3a24a7767b14fd2e407d057ba32e/.agent/tasks/DESIGN-SYNC-001.md)은 이력으로 보존한다.
