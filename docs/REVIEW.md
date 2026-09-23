# THE FIRM — Review Standard

## Purpose

이 문서는 각 버전의 독립 리뷰 기준을 정의한다.

Reviewer의 역할은:

- 구현이 명세를 충족하는지 확인
- 회귀와 구조적 문제 탐지
- UI/UX 마찰 탐지
- 과잉 추상화 탐지
- 테스트의 실제 의미 검증

이다.

Reviewer는 제품 방향을 최종 결정하지 않는다.

모든 제안은 이후:

- Accept
- Defer
- Reject

판단을 거친다.

---

## 1. Review Priority

항상 다음 순서로 본다.

1. 게임 상태와 CourtRecord 무결성
2. 핵심 플레이 목표 성립 여부
3. 회귀
4. 데이터/엔진 경계
5. UI/UX
6. 접근성
7. 미래 확장성
8. 코드 정리

---

## 2. P0

출시 또는 정상 플레이를 막는 문제.

예:

- 진행 불가
- 상태 손상
- CourtRecord 불일치
- 잘못된 판정
- 다른 증인 데이터 오염
- Evidence 누출
- 정상 경로 crash
- 저장된 Record로 결과 재생 불가

없으면:

P0 없음

이라고 명시한다.

---

## 3. P1

다음 버전 전에 해결해야 할 핵심 게임플레이 또는 아키텍처 문제.

예:

- 선택이 실제 결과를 바꾸지 않음
- CaseTheory가 장식
- Advocacy가 Evidence처럼 사용
- Stop / Press / Frame 의미 붕괴
- Major Commitment가 덮어써짐
- 절차 대응이 단순 정답 버튼
- 사건별 엔진 하드코딩
- 새 기능이 기존 Core를 깨뜨림

---

## 4. P2

코어는 정상이나 개선 가치가 있는 문제.

예:

- 중복 클릭
- 모바일 마찰
- 접근성
- 데이터 선언 방식
- 불필요한 텍스트
- 아직 검증되지 않은 확장성
- minor code debt

---

## 5. CourtRecord Integrity

반드시 확인한다.

- Evidence / Advocacy / Procedural이 구분되는가
- 기존 기록이 조용히 삭제되지 않는가
- 불리한 기록도 보존되는가
- Qualification이 원 기록을 덮어쓰지 않는가
- Major Commitment가 단일 Source of Truth를 가지는가
- 판정은 실제 Record를 읽는가

---

## 6. Record-only Evaluation

최종 평가가 다음을 직접 읽지 않아야 한다.

- UI selected state
- 특정 Question ID
- 질문 횟수
- 렌더링 상태
- 단순 Press 횟수

플레이 경로가 달라도 최종 CourtRecord가 동일하면 평가가 동일해야 한다.

질문 순서가 다른 Record를 생성했다면 다른 평가가 나오는 것은 정상이다.

---

## 7. Data-driven Architecture

확인:

- 새 Witness 추가 시 엔진 하드코딩 여부
- 특정 Proposition ID 분기 여부
- 특정 사건 이름 분기 여부
- 데이터만으로 Argument / Response를 추가할 수 있는지
- CaseTheory / Proceeding 데이터와 Engine이 분리돼 있는지

두 번째 실제 사례가 나오기 전까지 선제적 범용화를 요구하지 않는다.

---

## 8. Over-abstraction Check

다음을 경계한다.

- 사용되지 않는 interface
- 과도한 builder
- 범용 Rule DSL
- event bus 남발
- 미래 민사를 위해 현재 형사를 복잡하게 만드는 구조
- 실제 사례 없는 추상 계층

현재 필요한 가장 작은 구조를 우선한다.

---

## 9. Gameplay Review

자동 테스트 외에 실제 브라우저 플레이를 수행한다.

질문:

- 지금 무엇을 결정하는지 이해되는가
- 버튼 소진 게임처럼 느껴지는가
- 같은 행동을 반복하는 것이 항상 최선인가
- 위험과 보상이 실제 CourtRecord에서 발생하는가
- Stop이 상황에 따라 의미 있는가
- 실패가 “오답”보다 실제 법정 후과로 나타나는가

---

## 10. UI Budget

기능 추가 후 상시 UI가 비대해지지 않는지 본다.

특히:

- 화면 문자량
- 문서 높이
- 새 패널 수
- 상시 노출 상태
- 모바일 overflow
- 중복 정보

를 확인한다.

새 기능은 가능하면 기존 UI가 상황적으로 역할을 바꾸는 방식으로 구현한다.

---

## 11. UI Text Audit

새로 추가된 모든 주요 문자열을 확인한다.

질문:

- 행동에 필요한가
- 새로운 정보인가
- 다른 곳에서 이미 보여주고 있지 않은가
- 더 짧게 쓸 수 있는가
- 시스템 용어를 플레이어에게 노출하고 있지 않은가

삭제해도 플레이 가능하면 삭제를 우선한다.

---

## 12. UI Anti-patterns

불필요하게 추가됐는지 확인한다.

- 체크 표시
- 완료 배지
- 강도 badge
- 추천 행동
- risk %
- reward %
- RPG gauge
- 긴 tutorial card
- 상시 설명문
- duplicate status labels

---

## 13. Accessibility

확인:

- keyboard focus
- scroll preservation
- details state
- mobile sheet
- aria-live
- disclosure control과 선택 control의 역할 분리
- 중복 ID 없음

전체 scene을 live region으로 만들지 않는다.

---

## 14. Browser Verification

최소:

- Desktop large
- Desktop short height
- Mobile

에서 확인한다.

가능하면:

- localhost
- direct file mode

둘 다 확인한다.

---

## 15. Test Review

테스트 수만 보고 통과 판정하지 않는다.

테스트가 실제 의미 차이를 검증하는지 본다.

좋은 테스트 예:

- Stop vs Press 결과 차이
- Commitment conflict
- blocked question creates no Evidence
- reinforced Press
- Counter qualification
- Opening commitment replay
- Theory A vs B importance

나쁜 테스트 예:

- 함수가 호출됐는가
- 버튼이 존재하는가
- 문자열이 렌더링됐는가

만 확인.

---

## 16. Review Report Format

### Conclusion

이번 버전 목표가 달성됐는지 2–5문장.

### Core Play Observations

실제 대표 경로.

### P0

없으면 명시.

### P1

각 항목:

- 문제
- 재현
- 영향
- 권장 방향

### P2

동일 형식.

### What Worked Well

구체적 개선점.

### Test Results

- Node
- Browser
- UI budget
- additional path comparisons

### Next Priorities

최대 5개.

불필요한 기능 확대를 권하지 않는다.

### Final Sentence

다음 버전에서 가장 중요한 한 가지.

---

## 17. Product Direction Rule

Reviewer가 제안한 시스템을 자동 채택하지 않는다.

특히 다음은 리뷰만으로 바로 추가하지 않는다.

- 새로운 자원
- 새로운 점수
- 새로운 HUD
- 새로운 AI system
- Frame slot
- random witness behavior
- time limit
- affinity
- reputation
- additional complexity

실제 게임 철학과 맞는지 별도 판단한다.

---

## 18. Core Question

모든 리뷰의 마지막 질문:

> 이 변경이 플레이어를 더 변호사처럼 생각하게 만드는가, 아니면 버튼을 더 많이 누르게 만드는가?
