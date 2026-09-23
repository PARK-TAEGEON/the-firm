# THE FIRM — Design Principles

적용 범위: `courtroom-prototype/`의 설계 원칙과 향후 방향. 구현 완료 여부는 `CURRENT.md`를 따른다. 기존 루트 `DESIGN.md`의 v0.65 세부 기준과 함께 읽으며, `litigation-skeleton/`의 Accepted DEC/VS 설계를 대체하지 않는다.

## 1. Project Goal

THE FIRM은 객관식 법률 퀴즈나 정답 찾기 게임이 아니다.

플레이어는 변호사로서:

- 사건을 분석하고
- Case Theory를 세우고
- 사실과 증거를 준비하고
- 법정에서 필요한 사실을 기록에 올리고
- 기록을 연결해 논증을 만들고
- 상대방의 반박과 절차적 개입에 대응하고
- 언제 더 밀어붙이고 언제 멈출지 판단하며
- Client의 목표를 위해 싸운다.

자유 입력은 핵심 시스템으로 사용하지 않는다.

대신 제한된 입력 안에서도 플레이어가
“정답을 고르는 사람”이 아니라
“입장을 만들고 논증을 구성하는 사람”이라고 느끼게 한다.

---

## 2. Core Design Principle

THE FIRM의 핵심 질문은:

> 어떤 선택지가 정답인가?

가 아니라:

> 현재 Court Record와 전략을 기준으로 무엇을 더 확립하고, 무엇을 주장하며, 어디까지 위험을 감수할 것인가?

이다.

---

## 3. Court Record First

게임의 중요한 결과는 UI 상태, 버튼 클릭 횟수, 특정 질문 ID가 아니라 실제 Court Record를 기준으로 판정한다.

Court Record는 세 층으로 구분한다.

### Evidence Record

법원이 사실 판단에 사용할 수 있는 기록.

예:

- Witness Testimony
- Proposition
- Admission
- Counter Proposition
- Exhibit

### Advocacy Record

변호사가 법정에 형성한 주장과 입장.

예:

- Argument
- Frame
- Major Commitment
- Opening Position
- Closing Position

### Procedural Record

재판 진행 과정의 절차적 기록.

예:

- Objection
- Response
- Court Address
- Ruling
- Question Limited
- Question Withdrawn

Advocacy는 Evidence가 아니다.
Procedural success도 Evidence가 아니다.

---

## 4. Proposition and Argument

질문 자체는 게임의 최종 단위가 아니다.

질문은 Proposition을 Court Record에 올리기 위한 수단이다.

예:

- 증인은 약 27m 떨어져 있었다.
- 관찰 시간은 약 1~2초였다.
- 지문 생성 시점은 특정할 수 없다.
- 문제의 칼은 공용 비품이었다.

플레이어는 Proposition을 연결해 Inference와 Argument를 만든다.

강한 Argument는 버튼 자체에서 나오는 것이 아니라
실제 사실 조합과 논리적 연결에서 나와야 한다.

---

## 5. Witness Examination

Witness Examination의 핵심 재미는:

> 좋은 질문을 찾는 것

보다:

> 증인을 자신의 말에 묶고, 결론의 범위를 조절하며, 어디까지 밀어붙일지 결정하는 것

이다.

신문은 다음 요소를 사용할 수 있다.

- Proposition
- Witness Commitment
- Press
- Claim Scope
- Counter Proposition
- Qualification
- Reinforced Press
- Overreach
- Stop

질문 순서는 단순 보너스 점수로 처리하지 않는다.

이전 질문과 답변이 다음 질문의 가능한 Response Route를 바꾸게 한다.

---

## 6. Witness Commitment

증인이 명시적으로 인정한 사실은 이후 신문에서 의미를 가진다.

기존 Commitment와 충돌하는 답변은 조용히 덮어쓰지 않는다.

필요하면 다음 형태로 기록한다.

- clarification
- qualification
- contradiction
- retreat

과거 기록은 누적된다.

잘못된 질문 이후 나중에 유리한 답을 얻더라도 이전의 불리한 기록은 자동 삭제되지 않는다.

---

## 7. Overreach

THE FIRM의 좋은 실패는:

> 틀린 선택지를 골랐다

가 아니라:

> 확보한 기록보다 더 큰 결론을 요구하다가 상대에게 설명 또는 회복 기회를 줬다

여야 한다.

Overreach를 숫자 패널티나 실패 토스트로 표현하지 않는다.

증언, Counter Proposition, Qualification, Rehabilitation Opportunity 등 실제 법정 상태 변화로 표현한다.

---

## 8. Stop

Stop은 단순 종료 버튼이 아니다.

좋은 기록을 확보한 뒤 더 질문하지 않는 것은 적극적인 전략 선택이다.

Stop의 가치는 보너스 점수에서 나오지 않는다.

다음 위험을 피하는 데서 나온다.

- Counter Proposition
- Witness Explanation
- Overreach
- Rehabilitation Opportunity
- 불필요한 공개 입장

모든 상황에서 Stop / Frame / Press가 동일한 기대값을 가질 필요는 없다.

사건의 사실관계가 선택의 가치를 결정해야 한다.

---

## 9. Case Theory

Case Theory는 단순 설명 텍스트가 아니다.

Case Theory는 최소한 다음을 가진다.

- Claims
- Concessions
- Contested Issues
- Priority Issues
- Preferred Arguments
- Working Strategy
- Major Commitments

같은 Argument라도 Case Theory에 따라:

- Core
- Peripheral
- Neutral

등 다른 전략적 중요도를 가질 수 있다.

질문 자체를 임의로 잠그는 방식보다
현재 Theory와 Issue의 관계를 통해 가치를 다르게 만든다.

---

## 10. Strategy Revision

Working Strategy는 비교적 자유롭게 변경할 수 있다.

그러나 이미 법정에 공개한 Major Commitment는 Court Record에 남는다.

전략을 변경했다고 단순 수치 패널티를 주지 않는다.

대신:

> 기존 공개 입장과 새로운 전략의 충돌

을 기록하고 상대방이 활용할 수 있게 한다.

---

## 11. Client Objective

게임의 성공은 단순 WIN / LOSE만으로 판단하지 않는다.

사건은 다음을 가질 수 있다.

- Primary Objective
- Secondary Objectives
- Constraints

예:

- 무죄 판결
- 손해배상 최소화
- 거래 관계 유지
- 영업비밀 공개 방지
- 특정 형태의 합의 거부

향후 Resolution 시스템은 Client Objective와 연결한다.

---

## 12. Proceeding Core

형사, 민사, 기업 분쟁 등은 별개의 게임으로 만들지 않는다.

공통 코어를 유지하고 다음을 데이터와 Profile로 변경한다.

- Parties
- Roles
- Issues
- Burden
- Available Phases
- Available Actions
- Fact Finder
- Resolution Types

새 사건을 추가할 때 엔진에 사건별 조건문을 계속 추가하는 구조는 피한다.

---

## 13. UI/UX Principles

THE FIRM은 내부 시스템이 복잡하므로 화면은 최대한 조용해야 한다.

원칙:

> 시스템의 복잡성은 내부에 두고, 현재 판단에 필요한 정보만 화면에 보여준다.

가능하면 Progressive Disclosure를 사용한다.

평소에는:

- 현재 발언
- 현재 가능한 행동
- 필요한 사건 정보
- 최소한의 Court Record

만 보여준다.

이의가 생길 때만 절차 UI를 보여준다.
Basis가 여러 개일 때만 Basis 선택 UI를 보여준다.

---

## 14. UI Language

플레이어에게 엔진 용어를 그대로 보여주지 않는다.

피할 표현:

- Proposition
- Frame
- Press
- Counter
- Commitment Locked
- Strong
- Compelling
- Risk %
- Reward %

플레이어 표현:

- 시점을 확인한다
- 설명을 더 묻는다
- 확답을 요구한다
- 이 논점을 남긴다
- 이 기록을 근거로 든다
- 여기까지 묻는다
- 신문을 마친다

버튼의 의미가 게임 기능보다 변호사의 의도로 읽혀야 한다.

---

## 15. UI Budget

기능 하나가 추가될 때마다 새 패널을 만들지 않는다.

가능하면 기존 UI가 상황에 따라 역할을 바꾸게 한다.

명시적으로 필요하지 않은 이상 다음을 추가하지 않는다.

- 체크 표시
- 완료 배지
- 강도 배지
- 추천 행동
- 상태 설명용 긴 문장
- 상시 튜토리얼
- Progress Bar
- RPG식 수치
- 중복 정보

항상 다음 질문을 한다.

> 이 문장을 삭제해도 플레이 가능한가?

Yes라면 삭제를 우선한다.

---

## 16. Typography

UI 기본 폰트는 Pretendard 계열을 사용한다.

법정의 실제 발언은 필요할 경우 제한적으로 Serif 계열을 사용할 수 있다.

폰트 종류는 과도하게 늘리지 않는다.

Court Record는 평소 정보처럼 보여야 하며
논증 구성 시에만 선택 가능한 재료로 보이게 한다.

---

## 17. Content Complexity

모든 사건이 복잡할 필요는 없다.

사건마다 다음 성격이 다를 수 있다.

- Factual Complexity
- Legal Complexity
- Procedural Complexity
- Adversarial Intensity

간단한 사건은 간단하게 끝날 수 있다.

모든 질문, 모든 증인, 모든 사건에 억지로 반전과 trade-off를 만들지 않는다.

게임의 깊이는:

> 모든 사건이 복잡해서

가 아니라:

> 사건마다 복잡성의 형태와 밀도가 달라서

나와야 한다.

---

## 18. Anti-Patterns

피한다.

- 질문 4개 중 정답 찾기
- 질문을 전부 소진하는 체크리스트
- 숫자 합산형 Court Fact Finding
- 모든 선택을 억지로 균형화
- 무작위 Witness 회피율
- hidden affinity meter
- 사건별 엔진 하드코딩
- UI 상태를 판정에 사용
- 모든 Counter에 정답 버튼 제공
- 모든 사건에 동일한 긴 플레이 요구
- 미래 확장을 위한 과잉 추상화

---

## 19. Development Principle

새 기능을 추가할 때:

1. 기존 코어로 표현 가능한지 먼저 확인한다.
2. 데이터 추가로 해결할 수 있는지 본다.
3. 실제 두 번째 사례가 필요해질 때만 추상화를 확장한다.
4. 기능 구현 후 실제 브라우저에서 직접 플레이한다.
5. 자동 테스트 통과와 재미는 별개의 문제로 취급한다.

프로토타입에서 최종 판단은:

> 테스트가 통과했는가?

뿐 아니라:

> 실제로 플레이했을 때 법정 전략처럼 느껴지는가?

이다.
