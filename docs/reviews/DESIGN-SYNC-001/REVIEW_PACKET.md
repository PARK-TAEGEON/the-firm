# DESIGN-SYNC-001 · 일반 직접 사건 기준 재설정 인계

2026-10-11 · 문서 전용 · 기준 ef0be1c03d3ca039e1bfb6c5bf2dc8445242cb5b
상태: 사용자 범위 변경의 반영. 독립 리뷰·게임성 검증 완료가 아니다.

## 변경과 경계

현황판 v0.4는 정민호 사건의 일반 직접 담당 역할, 기존 구성 기준선, 기본 경험 초안, 대표 사건을 통한 확장 순서를 담는다. INT-01과 사진 이동/후속 A/B 공방은 철회 상태로 보존하고 더 이상 다음 구현 대상으로 안내하지 않는다. 기존 사진·영상·현장 동선과 숨은 사건 진실은 그대로다.

변경 파일은 계약의 6개다: TRIAL-DESIGN, CURRENT 상단 2줄, Task Contract, REPORT, 이 문서, test-results.log. 과거의 긴 현황판·계약·검토 내용은 고정 커밋 링크로 보존하고 현행 문서를 짧게 바꿨다. 삭제되는 실험 논의를 구현 완료나 재미 검증 완료로 표시하지 않는다.

기존 엔진의 prepared 차단·특정 질문/points 의존성은 미해결로 남긴다. 수임료·외부 비용 시스템이나 기본 보드를 새로 설계하지 않는다. 대표 사건 소재·구체 조작·실행 정책·법률 적용·양형은 미정이다. runtime invariant/API/fixture 변경 없음.

## 실제 검증 범위

로컬 검사 사본에는 정확한 CURRENT 기준 파일과 새 문서들이 있다. CURRENT 원문은 connector blob SHA 35099ec347d1b40884806a76b252ee4a7342f921과 일치시킨 뒤 상단 2줄만 변경했다. 나머지 기존 문서는 전체 clone으로 검증했다고 주장하지 않는다. 새 문서의 범위·구조·상대 링크와 고정 이력 링크, CURRENT 본문 보존, git diff --cached --check를 검사한다. 실제 결과와 명령은 test-results.log에 기록한다. 원격 compare 및 6개 blob SHA는 브랜치 갱신 전에 별도로 확인한다.

게임 엔진/브라우저/Godot 회귀·사람 플레이테스트·법률 검수는 미실행이다. 코드 변경 없는 문서 계약이며 과거 테스트 수를 이번 결과로 재사용하지 않는다. 사용자 PC와 미커밋 작업은 접근하지 않았다. 런타임 코드·사건·Accepted DEC·기존 테스트·다른 PR은 변경하지 않는다.

## 인계

기존 Draft PR #11에 후속 커밋을 추가하고 자동 병합하지 않는다. CHANGELOG는 실제 병합 때 담당자가 갱신한다. 다음 작업은 현황판 BASE-OPEN-01이며 새 사진 대사나 추가 증인을 집필하는 일이 아니다.

이전 검토 이력: [v0.3 REVIEW_PACKET](https://github.com/PARK-TAEGEON/the-firm/blob/ef0be1c03d3ca039e1bfb6c5bf2dc8445242cb5b/docs/reviews/DESIGN-SYNC-001/REVIEW_PACKET.md), [이전 로그](https://github.com/PARK-TAEGEON/the-firm/blob/ef0be1c03d3ca039e1bfb6c5bf2dc8445242cb5b/docs/reviews/DESIGN-SYNC-001/test-results.log).
