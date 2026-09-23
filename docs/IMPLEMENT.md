# THE FIRM — Implementation Target

## Target Version

v0.7 — 다음 구현 목표. 이번 문서·v0.65 기준점 고정 작업에서는 실행하지 않는다.

적용 위치는 `courtroom-prototype/`이다. 기존 `data/case.js`, `engine/core.js`, `engine/procedure.js`, `services/courtroom.js`, `ui/app.js` 구조를 재사용한다. v0.65 계약 `.agent/tasks/COURTROOM-CORE-065.md`는 기준 자료이며, 이 문서 추가만으로 다음 구현 작업이 시작되는 것은 아니다.

---

## Primary Goal

사건 전체 전략이 처음으로 법정에 공개되도록 한다.

현재까지 플레이어는 주로 증인 단위의 전술을 수행했다.

v0.7에서는:

> Case Theory → Opening → Major Commitment → Witness Examination

을 연결한다.

---

## 1. Opening

Opening은 완성된 대사 중 하나를 고르는 시스템으로 만들지 않는다.

플레이어는 다음을 결정한다.

- 무엇을 인정할 것인가
- 무엇을 다툴 것인가
- 어떤 Issue를 강조할 것인가
- 어떤 Argument를 법정에 소개할 것인가

예:

### Admit

- 피고인은 B동에 있었다.

### Contest

- 피고인이 공격자였다는 점.

### Emphasize

- 목격 식별의 한계
- 지문의 시간적 한계

게임은 이 선택을 바탕으로 자연스러운 Opening 문장을 출력한다.

---

## 2. Major Commitment

Opening에서 공개적으로 약속한 큰 입장은 Advocacy Record에 Major Commitment로 저장한다.

예:

- 피고인은 피해자를 만나지 않았다.
- 피고인이 B동에 있었던 사실은 다투지 않는다.
- 이 사건의 핵심은 공격자 동일성이다.

Major Commitment는 단순 Frame과 구분한다.

Argument Frame 하나를 만들었다고 Major Commitment가 생성되면 안 된다.

---

## 3. Working Strategy

Working Strategy는 플레이어 내부 계획이다.

v0.65에는 Theory의 `workingStrategy` 데이터와 `strategy` 전환 명령이 이미 있다. 이를 재사용하고, Opening에서 공개한 Major Commitment 및 기록되는 충돌과 구분한다.

재판 중 비교적 자유롭게 변경 가능하다.

Working Strategy를 바꾸는 것 자체에 자동 패널티를 주지 않는다.

---

## 4. Strategy Revision

재판 중 새로운 Evidence나 Witness Testimony가 나오면 Strategy를 변경할 수 있다.

예:

기존:

> 접촉 자체 부인

새 전략:

> 접촉 인정 / 고의 부인

이 변경은 허용한다.

단, 기존 Opening에서:

> 피고인은 피해자를 만나지 않았다.

라는 Major Commitment가 존재한다면 충돌을 Advocacy Record에 남긴다.

단순 수치 패널티 금지.

---

## 5. Commitment Conflict

Major Commitment와 Current Strategy가 충돌하면:

- 기존 Commitment 삭제 금지
- 새로운 Strategy가 기존 기록을 덮어쓰지 않음
- Conflict가 CourtRecord에 남음

향후 Closing에서 상대방이 활용 가능해야 한다.

v0.7에서 상대방 Closing까지 구현할 필요는 없다.

---

## 6. Case-wide Record

현재 witness plan 단위의 기록 구조를 유지하되
Opening과 Major Commitment는 사건 전체 범위에서 읽을 수 있어야 한다.

Case Record는 최소한 다음 관계를 표현할 수 있어야 한다.

Opening Commitment
→ Issue
→ Witness Argument
→ Evidence

아직 전체 Court Fact Finding은 구현하지 않는다.

---

## 7. Client Objective

현재 Client Objective 구조를 Opening과 Strategy evaluation에서 읽을 수 있게 연결한다.

예:

Primary:
- 무죄

Theory A:
- Identity가 Core

Theory B:
- Intent가 Core

v0.7에서 점수 게이지는 만들지 않는다.

---

## 8. UI

Opening UI는 새로운 대형 패널 시스템으로 만들지 않는다.

화면 예:

개회사 준비

인정
- B동에 있었다

다툼
- 공격자 동일성

강조
- 목격 식별
- 지문 시점

[이 입장으로 시작]

정도로 압축한다.

---

## 9. UI Principles

금지:

- 체크리스트 완료 표시
- 점수 게이지
- 전략 점수
- Confidence %
- 추천 Opening
- 긴 설명 카드
- Major Commitment badge 남발

플레이어에게는 법정에서 실제로 취할 입장이 보여야 한다.

---

## 10. Existing Examination Core

Witness Examination v0.65 코어는 특별한 회귀가 없는 한 수정하지 않는다.

특히 다음을 유지한다.

- Commitment
- Claim Scope
- Overreach
- Press
- Reinforced Press
- Counter
- Stop
- Basis
- Procedure
- Record-only evaluation

Opening 구현을 위해 Witness Core를 재설계하지 않는다.

---

## 11. Small Cleanup

v0.7 구현 전 또는 함께 처리 가능:

- duplicate relation metadata 정리
- relation target을 latest active commitment로 통일

새 이벤트 프레임워크 금지.

---

## 12. Do Not Implement

이번 버전 범위 아님:

- Closing
- Verdict
- CourtFactFinding
- Jury
- Redirect Examination 전체
- Settlement
- Appeal
- Civil case
- Staff system
- Judge relationship
- Reputation system
- randomized witness AI

---

## 13. Core Tests

### Opening Record

Opening selection이 Advocacy Record에 저장되는지.

### Major Commitment

Major Commitment가 Frame과 구분되는지.

### Working Strategy Revision

Working Strategy 변경 자체가 기존 Record를 삭제하지 않는지.

### Commitment Conflict

기존 Major Commitment와 충돌하는 Strategy Revision이 Conflict를 남기는지.

### No Silent Rewrite

Opening Position이 새로운 Strategy로 자동 덮어써지지 않는지.

### Examination Regression

v0.65 Witness Core 전체 회귀 없음.

### CaseTheory Priority

Opening과 Witness Arguments가 현재 Theory의 Core / Peripheral Issue 관계를 유지하는지.

### Record-only Replay

저장된 Record만으로 Opening / Commitment state를 재생할 수 있는지.

---

## 14. Browser Verification

실제로 다음을 플레이한다.

Path A:
- Theory A
- Opening에서 Identity 중심
- 두 Witness Examination
- Strategy 유지

Path B:
- Theory A
- Opening에서 접촉 부인
- Witness Evidence 이후 Strategy를 Intent 중심으로 변경
- Commitment conflict 확인

Path C:
- Theory B
- Opening에서 접촉 인정
- Identity 관련 Witness Argument가 Peripheral로 유지되는지 확인

---

## 15. Completion Criteria

v0.7 완료 조건:

1. Opening이 선택지 대사 퀴즈가 아니다.
2. 플레이어가 인정 / 다툼 / 강조를 결정한다.
3. Major Commitment가 Advocacy Record에 저장된다.
4. Frame과 Major Commitment가 구분된다.
5. Working Strategy는 변경 가능하다.
6. Strategy 변경이 기존 Commitment를 삭제하지 않는다.
7. 충돌은 CourtRecord에 남는다.
8. Opening과 Witness Examination이 같은 CaseTheory를 공유한다.
9. 기존 Examination Core가 회귀하지 않는다.
10. UI가 불필요하게 복잡해지지 않는다.
11. 전체 자동 테스트 통과.
12. 실제 브라우저 경로 검증 완료.

---

## 16. Final Report

구현 후 다음을 보고한다.

- Opening 구조
- Major Commitment 저장 방식
- Strategy Revision 방식
- Commitment Conflict 방식
- Case-wide Record 연결
- 기존 Witness Core 수정 여부
- 새 테스트
- 남은 기술 부채
- 다음 단계 제안

그리고 `CURRENT.md`를 실제 구현 상태에 맞게 업데이트한다.

`REVIEW_REQUEST.md`도 생성한다.
