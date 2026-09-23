# THE FIRM — Current State

## Current Version

v0.65 (`courtroom-prototype/package.json`: `0.65.0`)

기존 저장소 `The Firm`의 웹 프로토타입을 사용한다. Godot `litigation-skeleton/`은 별도 프로젝트다.

- 구현 기준 commit: `df648a1e7a73a5d63bed0308a1441ebde1666abd`
- 기준 ZIP: `courtroom-prototype/THE-FIRM-Courtroom-Core-v0.65.zip`
- SHA-256: `AA38FDE794B752636F21FEEF39B870B00A796087B5B3BE0424ACD9CA8D03E455`
- 참조 대화 「시스템 설계 정리」의 독립 리뷰 대상 ZIP과 해시 일치.
- 이번 작업은 문서와 기준점 고정만 수행하며 v0.65.1 정리 및 v0.7 구현을 시작하지 않는다.

---

## Current Goal

첫 형사 Vertical Slice의 Courtroom Core를 단계적으로 완성한다.

현재 Witness Examination Core의 주요 구조는 자동 회귀와 참조 대화의 독립 리뷰에서 검증됐다(P0/P1 없음). 사용자 플레이 감각과 미해결 P2까지 해결됐다는 뜻은 아니다. 기존 `courtroom-prototype/REVIEW_PACKET.md`의 독립 리뷰 미확보 문구는 구현 당시 기록이며, 이후 대화에 ZIP 독립 리뷰가 제공됐다.

다음 큰 목표는:

> Opening / Major Commitment / Strategy Revision

이다.

---

## Implemented

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

`engine/core.js`는 외부에서 주어진 `major_commitment`의 참조·검토 필요 상태를 읽지만, 현재 서비스는 Opening이나 Major Commitment를 생성하지 않는다. 공개 입장과 전략 변경의 충돌을 CourtRecord에 누적하는 v0.7 흐름은 아직 없다. UI의 내부 `opening` 대사 kind는 Opening 기능 구현을 뜻하지 않는다.

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
- 이번 문서 작업에서는 위 코드를 수정하지 않는다.

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

## Next Major Version

v0.7

Focus:

- Opening
- Major Commitment
- Working Strategy
- Strategy Revision
- Opening → Examination 연결

Do not implement yet:

- Closing
- Verdict
- Court Fact Finding
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
| `courtroom-prototype/engine/core.js` | 검증, 추론, commitment routing, 기록 기반 평가 |
| `courtroom-prototype/engine/procedure.js` | 이의·근거·재판장 결정 |
| `courtroom-prototype/services/courtroom.js` | 원자적 명령과 누적 CourtRecord |
| `courtroom-prototype/ui/app.js`, `ui/courtroom.css` | 화면, 접근성, 반응형 스타일 |
| `courtroom-prototype/tests/` | 엔진·브라우저·UI budget 회귀 |

`courtroom-prototype/`에서 `npm test`, `npm run test:browser`, `npm run test:budget`를 실행한다. 브라우저 검사는 Playwright/Edge 및 필요한 경우 번들 NODE_PATH를 사용한다. 기본·흐름 브라우저 검사는 claimVariants를 제거한 호환 fixture이며, 전술 브라우저 검사가 실제 v0.65 배포 데이터를 검증한다.

구현 당시 및 참조 독립 리뷰 결과: Node 160, Browser 169 (87 + 47 + 35), UI budget 14, 모두 통과. 이번 기준점 작업의 재실행 결과는 `courtroom-prototype/test-results.log`와 `REVIEW_PACKET.md`의 2026-09-23 항목에 남긴다. Godot 검증 2280건은 이전 구현 당시 결과이며 이번 문서 작업에서 재실행했다고 간주하지 않는다.

`index.html` 직접 열기 또는 `npm start` 후 `http://127.0.0.1:4173/?v=0.65`로 실행한다. 법정 응답·충돌 의미는 authored 데이터이며 범용 법률 추론이나 실제 재주신문·유무죄 판정은 구현되지 않았다.
