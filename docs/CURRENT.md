# THE FIRM — Current State

## Current Version

v0.9 (`courtroom-prototype/package.json`: `0.9.0`) — Independent Reviewer PASS (사용자 전달, 2026-09-25)

기존 저장소 `The Firm`의 웹 프로토타입을 사용한다. Godot `litigation-skeleton/`은 별도 프로젝트다.

- 구현 기준 commit: `df648a1e7a73a5d63bed0308a1441ebde1666abd`
- 기준 ZIP: `courtroom-prototype/THE-FIRM-Courtroom-Core-v0.65.zip`
- SHA-256: `AA38FDE794B752636F21FEEF39B870B00A796087B5B3BE0424ACD9CA8D03E455`
- 참조 대화 「시스템 설계 정리」의 독립 리뷰 대상 ZIP과 해시 일치.
- 위 commit/ZIP과 `courtroom-core-v0.65` tag는 변경하지 않은 과거 기준점이다. v0.7은 Opening과 Strategy 흐름만 추가했다.

---

## Current Goal

첫 형사 Vertical Slice의 Courtroom Core를 단계적으로 완성한다.

현재 Witness Examination Core의 주요 구조는 자동 회귀와 참조 대화의 독립 리뷰에서 검증됐다(P0/P1 없음). 사용자 플레이 감각과 미해결 P2까지 해결됐다는 뜻은 아니다. 기존 `courtroom-prototype/REVIEW_PACKET.md`의 독립 리뷰 미확보 문구는 구현 당시 기록이며, 이후 대화에 ZIP 독립 리뷰가 제공됐다.

이번 버전의 구현 범위는:

> CourtRecord → CourtFactFinding → Verdict (Judge factfinder)

이다.

---

## Implemented

### CourtFactFinding / Verdict

- engine/adjudication.js가 고정 CaseDefinition과 세 CourtRecord 층을 읽고 issue별 사실판단을 만든다. 증언 참조, 양측 기록, admission, active/qualified counter, witness relation, support state, unresolved witness contradiction, Frame/Closing 맥락과 절차 참조를 분리한다.
- authored proof/doubt premise 조합만 사용한다. 질문 수·선택 UI·논증 strength·점수 합산을 판정에 쓰지 않는다. 절차상 성공이나 Opening/Closing 문장은 사실이 아니다.
- CaseDefinition.adjudication에 requiredIssues, 각 burden party/standard, decisionRule, factFinder와 결과 문구를 선언한다. 현재 지원은 judge, beyond_reasonable_doubt, all_required뿐이다. 부분/알 수 없는 선언과 타 issue 전제는 construction에서 거부한다.
- 각 필수 쟁점에서 완전한 증거 경로가 성립하고 해당 부담에 반하는 기록된 의문 및 미해결 증언 모순이 없어야 입증된다. 필수 쟁점 하나라도 미입증이면 notSatisfied 결과다. 결과 코드와 형사 문구는 데이터에만 존재한다.
- 두 증인 종료와 Closing 확정 후 판결을 듣는다. Closing 없는 profile은 두 증인 종료 뒤 resolved를 유지하고 바로 판결을 요청할 수 있다. 판정 설정 자체가 없는 profile은 종전 종료를 유지한다.
- 판결 명령은 Evidence/Advocacy와 기존 Procedural을 보존하고 Procedural에 verdict_delivered 하나를 추가한다. 입력 layer별 record refs와 definitionVersion을 보관하며 replay는 참조 당시 입력만 읽는다. 후속 기록은 과거 판결을 바꾸지 않으며 참조 누락/버전 불일치는 오류다. UI/history/session 상태는 사용하지 않는다.
- 중앙 화면에 필수 쟁점의 짧은 판단과 결과를 표시하고 증거 상세는 disclosure로 접는다. 기존 기록 패널에 판결 항목을 추가한다. 새로운 상시 패널·점수·게이지는 없다.

### Closing / Case-wide Argument Synthesis

- 두 증인의 신문 종료 후 beginClosing으로 기존 중앙 화면을 재사용한다. closing_started를 Advocacy에 남기고 준비 단계를 기록으로 재생한다.
- 플레이어가 중심 Issue, 사용할 논증, 인용 Evidence/Admission, 직접 다룰 Counter, Opening 입장 유지/수정을 선택한다. 미리보기 후 submitClosing으로 확정한다. 자동 논증 선택이나 슬롯/점수 제한은 없다.
- engine/closing.js는 모든 witness plan의 CourtRecord와 기존 evaluateRecord를 읽는다. 확보된 전제의 authored inference만 후보가 되고, 기존 Frame 참조와 Core/Peripheral priority가 보존된다. 신문 중 Frame을 만들지 않았어도 기록이 충족하는 authored inference는 Closing에서 구성 가능하다.
- 선택한 논증의 모든 전제를 실제 Evidence 참조로 연결해야 한다. 선택하지 않은 논증은 발언에 들어가지 않는다. Argument가 없는 기록은 쟁점과 공개 입장만 말할 수 있고, 미확보 사실을 생성하지 않는다.
- 선택한 쟁점의 Counter는 다루지 않아도 synthesis에 남는다. 다루는 Counter는 실제 Qualification이 있을 때 그 내용을 인용하며, 없으면 한계가 남음을 발언한다. Witness relation의 후속 설명도 연결하고 중복 문장은 제거한다.
- Closing은 Evidence/Procedural을 변경하지 않는다. 선택과 생성 문장을 closing_position 하나에 기록하며, 유지/수정된 공개 입장, closing_revision, 실제 명시적 position 충돌의 commitment_conflict는 원 Commitment/Closing을 참조한다. 기존 Strategy Revision/Conflict는 그대로 보존한다.
- Closing replay는 기록된 selection/theoryId와 CourtRecord만 읽는다. priorConflictRefs는 Closing 이전 기록으로 제한한다. UI draft, 질문 횟수, 신문 선택 상태를 읽지 않는다.
- Client Objective 전체 구조를 읽기 결과에 포함하고, 실제 문장에는 primary 요청을 사용한다. Closing 자체는 목표 달성이나 유무죄를 판단하지 않는다. v0.9의 별도 판정 층이 사건 기록을 읽는다.
- 공개 입장 수정은 기존 authored option 중 같은 issue 또는 같은 position key에 연결되는 조각으로 제한한다. Opening용 미래형 조각에는 별도 closingText를 사용한다.
- Closing 준비와 확정 후 증인 이동/신문/전략 변경은 잠긴다. 확정 전에는 선택과 미리보기를 수정할 수 있다. 전체 세션 저장/불러오기는 여전히 범위 밖이다.


### Core Record Model

- Evidence Record
- Advocacy Record
- Procedural Record
- Record-only evaluation

### Proposition / Argument

- Proposition
- authored Inference Variant
- Argument Lane
- Frame
- CaseTheory priority evaluation

### Witness Examination

- Multiple witnesses
- Witness-specific plans
- Question Threads
- Follow-up question
- Witness Commitment
- Claim Scope
- Press
- Reinforced Press
- Counter Proposition
- Contestable Counter
- Hard Counter
- Qualification
- Overreach
- Stop
- Witness close / Thread close distinction

### Witness Patterns

#### Sight Witness

핵심 논증:

- distance
- observation duration
- lighting
- initial uncertainty

→ identification reliability

#### Forensic Witness

핵심 논증:

- fingerprint present
- print timing unknown
- shared object
- prior use possibility

→ contact does not establish crime-time use

### Procedure

- Objection
- Foundation
- Form
- Repetition
- Basis selection
- Narrow question
- Withdraw
- Judge ruling
- Court Address
- Procedural Record transaction display

### Case Theory

Current theories:

#### Theory A

현장에 있었지만 범인은 아니다.

Priority:
- Identity / Commission

#### Theory B

접촉은 있었지만 고의는 없다.

Priority:
- Intent

Arguments can be Core / Peripheral depending on current Theory.

`data/case.js`의 theories에는 claims / concessions / contestedIssues / preferredPlans / workingStrategy가 있으며, `strategy` 명령으로 현재 Theory를 변경할 수 있다. `clientObjectives`도 데이터로 존재한다.

개회사는 인정 / 다툼 / 강조 / 소개할 논증의 authored 조각을 조합한다. strategy 선택 후 opening 단계에서 공개하며, 공개 전에는 신문 명령이 차단된다.

- 서비스는 사건 범위의 opening_position과 major_commitment를 Advocacy에만 추가한다. Frame과 Evidence는 생성하지 않는다.
- Major Commitment의 저장 원본은 records.advocacy 하나다. caseRecord는 복사된 읽기 전용 projection이다.
- Working Strategy 변경은 기존 strategy 명령을 사용한다. 공개 이후 strategy_revision을 누적하며, authored workingPositions와 충돌하면 원 commitment와 revision을 참조하는 commitment_conflict를 추가한다.
- 단순 우선 쟁점 변경은 사실적 충돌로 간주하지 않는다. 기존 접촉 부인에서 접촉 인정 전략으로 바꾸면 충돌이 남는다. 원래 전략으로 돌아가도 과거 충돌은 삭제되지 않는다.
- engine/opening.js의 replay는 CourtRecord만으로 Opening, 공개 입장, 최신 전략과 충돌을 재생한다. 공개 입장 → Issue → Frame → 실제 Evidence 참조를 제공한다. links의 relationKind는 issue_progression이며, 공개 입장의 증거상 입증을 뜻하지 않는다.
- Client Objectives와 현재 Theory priority를 projection에서 읽으며, 점수나 자동 패널티는 없다.
- 준비 단계의 미공개 선택은 UI draft다. 공개 후 재작성 명령은 허용하지 않는다.

### v0.7.1 correction

- commitmentReviewRefs는 현재 evaluation scope와 같은 issue의 Major Commitment만 포함하며, 해당 plan의 active counter가 있을 때만 검토 대상으로 삼는다.
- Core / Peripheral 및 unresolvedIssues 평가는 종전 그대로다. priority 변경과 authored strategy conflict는 evidentiary challenge와 별도로 남는다.
- 모든 Theory는 Opening 및 workingPositions에서 사용하는 position key에 값 또는 명시적 unspecified를 선언해야 한다. 누락·빈 값은 validation 오류이며, unspecified는 충돌을 만들지 않는다.
- IDENTITY → INTENT 및 INTENT → IDENTITY 차단, 같은 쟁점의 정상 검토, priority 분리, 기록 보존·replay 회귀를 추가했다. INTENT counter는 테스트 전용 scope fixture이며 실제 사건에 고의 증거나 새 신문을 추가하지 않았다.

### UI

- 3-column desktop layout
- responsive mobile layout
- CourtRecord sheet
- Progressive Disclosure
- UI text reduction
- Pretendard-based UI typography
- selected Serif usage for courtroom dialogue
- Record and action visual distinction
- focus / scroll / details preservation

---

## Frozen or Stable

다음 구조는 특별한 문제가 발견되지 않는 한 대규모 재설계하지 않는다.

- Proposition
- Evidence / Advocacy / Procedural separation
- CourtRecord as source of truth
- authored Inference Variant
- Frame
- Press
- Reinforced Press
- Counter Proposition
- Witness Commitment
- Claim Scope
- Overreach
- Basis
- Objection / Ruling pipeline
- CaseTheory Core / Peripheral evaluation
- Record-only evaluation

---

## Known Technical Debt

### Relation Records

- `services/courtroom.js`의 `recordResponse`는 한 Response의 relation/support metadata를 생성되는 각 Evidence에 복제한다. 여러 Proposition을 추가하면 relation이 중복될 수 있다.
- relation 대상은 `.find(...)`로 찾은 첫 일치 commitment다. 최신 active commitment를 선택하도록 후속 정리 필요.
- v0.7에서도 위 코드는 수정하지 않았다.

### Procedure Engine

`engine/procedure.js`는 정확히 3개의 서로 다른 procedural rule kind를 요구하며 사건 고유 문구도 일부 남아 있다.

다른 실제 Proceeding에서 다른 rule subset이 필요할 때 data-driven 방식으로 완화한다.

선제적 범용화 금지.

### Thread UX

단일 질문 Thread의 직접 진입은 이미 구현됐다. Thread 구조 전체의 탐색 부담은 남은 사용자 테스트 대상이며, 다시 미구현 기능으로 취급하지 않는다.

---

## Known Product Questions

아직 확정하지 않은 부분:

- Claim selection UI가 실제 플레이어에게 “질문 범위 선택”으로 읽히는가
- Thread grouping이 몰입을 돕는가
- 얼마나 많은 CourtRecord를 기본 화면에서 보여줘야 하는가
- Redirect Examination을 언제 구현할 것인가
- Closing에서 Frame 남발을 어떻게 다룰 것인가

이 항목들은 현재 코어를 수정하기 전에 실제 플레이 테스트를 우선한다.

---

## Current Scope and Deferred Work

v0.9 Independent Reviewer PASS (사용자 전달, 2026-09-25). v0.8.1은 사용자 전달 Independent Reviewer PASS 기준점이다. 이전 기준점 v0.7.1은 Independent Review PASS (2026-09-25 사용자 전달).

Focus:

- CourtRecord 기반 issue별 CourtFactFinding
- required issue / burden / standard 기반 Verdict
- Opening → Examination → Closing → 판결 연결
- 기존 Major Commitment / Strategy Revision / v0.65 신문 회귀 유지

Do not implement yet:
- Jury
- Settlement
- Appeal
- Full Redirect Examination
- Civil Vertical Slice
- Staff system

---

## Development Loop

Implementer:
Astra Medium

Reviewer:
Sol Medium

Flow:

IMPLEMENT.md
→ implementation
→ automated tests
→ browser verification
→ REVIEW_REQUEST
→ independent review
→ human playtest
→ accept / defer / reject
→ next IMPLEMENT.md

Review suggestions are not automatically implemented.
Product direction remains a human decision.

---

## Implementation Map and Verification

| 경로 (저장소 루트 기준) | 역할 |
| --- | --- |
| `courtroom-prototype/data/case.js` | 사건, 두 증인, Theory, authored 질문·응답·추론 데이터 |
| `courtroom-prototype/engine/adjudication.js` | 판정 설정 검증, issue별 사실판단, Verdict 및 입력 참조 replay |
| `courtroom-prototype/engine/closing.js` | 사건 전체 후보, 선택 검증, Closing 문장 종합 및 기록 재생 |
| `courtroom-prototype/engine/opening.js` | Opening 검증, 명시적 전략 충돌, 사건 기록 재생과 연결 |
| `courtroom-prototype/engine/core.js` | 검증, 추론, commitment routing, 기록 기반 평가 |
| `courtroom-prototype/engine/procedure.js` | 이의·근거·재판장 결정 |
| `courtroom-prototype/services/courtroom.js` | 원자적 명령과 누적 CourtRecord |
| `courtroom-prototype/ui/app.js`, `ui/courtroom.css` | 화면, 접근성, 반응형 스타일 |
| `courtroom-prototype/tests/` | 엔진·브라우저·UI budget 회귀 |

`courtroom-prototype/`에서 `npm test`, `npm run test:browser`, `npm run test:budget`를 실행한다. 브라우저 검사는 Playwright/Edge 및 필요한 경우 번들 NODE_PATH를 사용한다. 기본·흐름 브라우저 검사는 claimVariants를 제거한 호환 fixture이며, 전술 브라우저 검사는 실제 v0.7 데이터로 v0.65 신문 경로를 검증한다.

v0.7 검증 (2026-09-23): Node 168, Browser 221 (87 + 47 + 35 + 52), UI budget 14, 모두 통과. 기존 Node 160개는 opening 설정을 제외한 examination fixture로 동일한 불변식을 검증한다. 실제 배포 데이터의 전술 브라우저 35개는 Opening을 거쳐 실행하고, 새 Node 검사는 Opening 유무의 동일 신문 결과도 비교한다. 기존 기본·흐름 브라우저는 종전처럼 claimVariants를 제거한 fixture이며 opening도 제외한다.

새 브라우저 경로 A/B/C는 1440×1080, 1280×720, 390×844에서 실행했다. localhost 및 direct-file 경로를 포함한다. opening/revision 화면 PNG를 직접 확인했고 모바일 가로 넘침이 없다. UI budget은 기존 v0.65 한도를 그대로 적용했다.

실행은 index.html 직접 열기 또는 npm start 후 http://127.0.0.1:4173/이다. 테스트 상세는 courtroom-prototype/test-results.log와 REVIEW_PACKET.md, 리뷰 요청은 루트 REVIEW_REQUEST.md에 있다.

법정 응답·충돌 의미는 authored 데이터이며 범용 법률 추론, 실제 재주신문·유무죄 판정은 없다. Intent 논증을 위한 새 증거/증인은 추가하지 않았다. 전체 신문 상태의 저장/불러오기는 범위 밖이며, 기록 재생은 Opening/전략과 논증의 읽기 projection이다. Godot 테스트는 변경 범위 밖이므로 재실행하지 않았다. 이 문단은 v0.7 당시 검증 이력이다. v0.7.1 PASS는 아래 Accepted baseline에 기록하며, v0.8의 독립 리뷰/사용자 재미 평가는 별도다.

## v0.7.1 verification — 2026-09-25

Node 175, Browser 258 (87 + 47 + 35 + 52 + 37), UI budget 14, 총 447 모두 통과. 신규 오염/priority 회귀 5개는 수정 전 실패하고 수정 후 통과했다. 추가 validation/progression 검사 2개도 통과했다. 기존 Opening A/B/C와 v0.65 examination 회귀를 모두 재실행했다. 교차 쟁점 브라우저는 데스크톱·모바일에서 Opening → 전략 변경 → 실제 counter → record-only replay → Stop을 검증했다. 반대 방향은 INTENT plan scope fixture임을 구분한다. UI 레이아웃 변경은 없으며 버전만 0.7.1로 갱신했다. 독립 리뷰 결과: PASS (2026-09-25 사용자 전달). 이 작업에서 새로 독립 리뷰를 수행한 것은 아니다.

## Accepted baseline

v0.7.1 Independent Review PASS (사용자 전달, 2026-09-25). 구현 commit: 2b499e1. Git tag courtroom-core-v0.7.1은 이 PASS 기록을 포함하는 기준점 commit을 가리킨다. v0.8은 별도 후속 구현이다.

## v0.8 verification — 2026-09-25

Node 188 (기존 175 + Closing 13), Browser 316 (87 + 47 + 35 + 52 + 37 + Closing 58), UI budget 14. 총 518, 실패 0, 각 명령 exit 0. 기존 v0.65/v0.7.1 회귀 전체 유지. Closing 브라우저는 1440×1080, 1280×720, 390×844에서 Opening → 두 Witness → 전략 변경/Counter → Closing 선택·미리보기·수정·확정 → replay를 검증했다. 모바일 direct-file 경로 포함. 화면 PNG를 직접 확인했다.

기존 신문 UI budget은 desktop 195/218 chars, mobile 183/213 chars로 유지했다. Closing 준비는 접힌 선택 영역 100자 미만, 새 상시 패널 없음, 가로 넘침 없음. 낮은 화면에서 누적 기록으로 늘어난 높이는 Closing 단계의 기존 기록 패널 스크롤로 해결했다.

v0.8 제한: authored inference와 public position 조각의 종합이며 범용 법률 추론이 아니다. Counter 대응은 recorded qualification 인용 또는 한계 인정이며 새로운 반박/증거를 만들지 않는다. 아직 모든 공개 입장의 의미상 모순을 해석하지 않으며, 명시적 position key/value 충돌과 선택한 수정 흔적을 보존한다. 판결/CFF/Jury/Settlement/Appeal/Redirect/Civil/Staff와 다중 에이전트·Orca는 구현하지 않았다. 기존 relation metadata 부채는 그대로다.

구현 범위는 사용자 v0.8 요청과 .agent/tasks/COURTROOM-CORE-080.md를 따른다. docs/IMPLEMENT.md는 기존 v0.7 원문으로 보존했다. 상세 리뷰 요청은 루트 REVIEW_REQUEST.md, 검증 로그는 courtroom-prototype/test-results.log에 있다.

## v0.8.1 correction — 2026-09-25

Closing은 optional profile lifecycle이다. closing/closed phase와 beginClosing/submitClosing action을 모두 선언하거나 모두 생략한다. 일부만 선언한 profile은 service construction에서 거부한다. availability는 해당 phase/action 선언과 기존 진행 조건을 함께 확인한다. Closing 없는 fixture는 두 증인 종료 후 resolved를 유지하며 Closing 진입 버튼이 없고 submit 버튼도 노출되지 않는다.

최종 공개 입장 문장은 동일 text당 한 번 출력한다. 유지와 수정이 같은 문장으로 합쳐지면 수정 표현을 사용한다. 모든 positions, closing_revision, commitment_conflict와 원 Commitment는 그대로 보존한다. evidence/procedural 및 record-only replay 계약도 유지한다. 법정 중앙 section 접근성 이름은 법정 진행으로 변경했다. 마지막 증인 context와 레이아웃은 그대로다.

검증: Node 198, Browser 383 (기존 316 + profile/dedupe 67), UI budget 14, 총 595, 실패 0. 신규 Node 10개: 정상 profile, absent profile, phase/action partial 및 lifecycle 요소별 누락, revision-only 및 maintain/revise 혼합 중복. 수정 전 8개가 버그를 재현했으며 수정 후 전체 통과. Browser는 large/short/mobile에서 full/none profile, 두 증인 종료, Closing preview/publication 중복 제거, 2 revision/2 conflict 보존, Evidence/Procedural 불변과 replay를 확인한다. 기존 형사사건, v0.65/v0.7.1/v0.8 회귀와 direct-file 경로도 재실행했다.

v0.8.1 Independent Reviewer PASS는 사용자 전달 결과다(2026-09-25). 이 작업에서 별도 독립 리뷰를 수행한 것은 아니다. No-Closing/partial은 테스트 fixture이며 새 사건이 아니다. 문자열이 정확히 같은 최종 입장만 중복 제거하며 의미상 유사한 다른 문장을 합치지 않는다. 기존 authored inference/relation 부채와 범위 제외 항목은 유지한다. 사용자 최신 요청과 .agent/tasks/COURTROOM-CORE-081.md를 적용하며 docs/IMPLEMENT.md의 과거 v0.7 원문은 보존한다.

최종 UI 측정: desktop normal/argument 197/220자(0.8.1 버전 표기로 각 2자 증가), mobile 183/213자. 기존 한도 14개 모두 통과. 새 profile resolved/closed 화면은 large/short/mobile에서 확인했으며 모바일 resolved PNG도 직접 검토했다.

## v0.8.1 accepted baseline

v0.8.1 구현 commit d54006d. 사용자 전달 Independent Reviewer PASS를 이 문서에 반영하고 courtroom-core-v0.8.1 tag로 고정한다. v0.9는 후속 별도 구현이다.

## v0.9 implementation and verification — 2026-09-25

기준 태그 courtroom-core-v0.8.1 → 529371f3679318154d8508daf11d6f2785113508. 사용자 전달 Independent Reviewer PASS를 CURRENT에 기록한 commit이며 구현 기준은 d54006d다. 태그는 변경하지 않는다.

검증 결과는 루트 REVIEW_REQUEST.md와 courtroom-prototype/test-results.log를 따른다. 기존 v0.65/v0.7.1/v0.8/v0.8.1 회귀와 신규 판정 검사를 모두 실행한다. 역방향 INTENT 오염 회귀 fixture에서만 판정 설정을 제거했다. 해당 fixture는 원래 식별 plan의 issue를 INTENT로 바꾸므로 원 사건의 판정 전제와 맞지 않으며, 원래 Opening/전략/신문 검사 assertion은 유지했다.

주요 제한: 현재 출시 데이터는 공격자 동일성과 범행 시각 사용에 대한 완전한 입증 경로가 없다. 배경 설명·Opening admission을 Evidence로 승격하지 않으므로 현재 실제 경로의 최종 결과는 입증 실패이며 판단 근거/의문/반박 맥락이 경로에 따라 달라진다. 유죄를 억지로 만들기 위해 증거를 추가하지 않았다. 입증 성공 및 다른 부담/필수 쟁점에 따른 결과 전환은 synthetic proof fixture에서만 검증한다. 고의는 판단 자료가 없고 이번 slice의 필수 쟁점에서 제외되며 전체 형사법 요소를 재현하지 않는다.

이는 authored 판정 규칙이며 범용 법률 엔진이나 실제 법적 판단을 표방하지 않는다. 다른 증명 기준은 자동 추측하지 않고 거부한다. 저장된 CourtRecord replay에는 같은 버전 CaseDefinition도 필요하며 UI 전체 저장/불러오기는 범위 밖이다. 기존 relation metadata 중복/최초 참조 부채는 그대로다. Jury/Sentencing/Appeal/Settlement/Civil/Redirect/상대 Closing AI/Staff/다중 에이전트·Orca는 구현하지 않았다.

사용자 v0.9 요청과 .agent/tasks/COURTROOM-CORE-090.md가 이번 범위다. docs/IMPLEMENT.md의 과거 v0.7 원문과 위 과거 검증 이력의 미구현 목록은 역사적 기록이며 현재 v0.9 기능을 부정하지 않는다.

## 최종 검증 결과 (2026-09-25)

Node 228 (기존 198 + 판정 30), Browser 591 (기존 383 + 판정 208), UI budget 14: 총 833, 실패 0, 각 명령 exit 0. 기존 v0.65/v0.7.1/v0.8/v0.8.1 회귀 유지. 판정 browser는 recorded/sparse/no-Closing 3경로 × large/short/mobile 3화면이며 mobile direct-file 포함. 쟁점별 Evidence/Counter/Qualification과 Closing context, 절차 판결 표식, JSON replay, 제목 focus/가림 방지, 기존 record sheet, 무패널 추가/가로 넘침 없음, 중앙 본문 280자 미만을 확인했다.

신문 budget: desktop normal/argument 195/218자, mobile 183/213자. 법정 영역은 기존 판결 전환 때만 바뀐다. 검토 중 양측의 완전한 상충 입증 경로가 동시에 성립하면 둘 다 미해결로 남기도록 보완했고, 양측 Evidence 분류도 case mapping에서 읽도록 했다. 해당 positive/negative 회귀 포함 전체 재실행.

판정은 필수 쟁점의 부담을 읽으며 같은 CourtRecord/definition이면 같은 결과다. supporting/opposingEvidence는 claimant/respondent에 대응하고 Counter는 별도 목록으로 보존한다. v0.9 Independent Reviewer PASS는 사용자 전달 결과다. 이 작업에서 별도 독립 리뷰를 수행한 것은 아니다.

## v0.9 accepted baseline

구현 commit f143986. 사용자 전달 Independent Reviewer PASS를 CURRENT에 반영한 기준점을 courtroom-core-v0.9 tag로 고정한다. v0.9.1은 UI/UX 후속 교정이다.
