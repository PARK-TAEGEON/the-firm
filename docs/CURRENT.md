# THE FIRM — Current State

현재 상태와 미결정 사항의 짧은 source of truth다. 과거 구현·검증은 [CHANGELOG](CHANGELOG.md), 실험 설계는 [9월 설계 메모](DESIGN-NOTES-2026-09.md)를 본다.

## Playable Slice · 2026-11-16

[`game/`](../game/README.md): 사무소의 한 주 → 변론 계획서 → 자동 공판 → 결산을 잇는 한 판(PORTFOLIO-001 → 002, 실험 lane). 기존 두 엔진의 사본을 연결했으며 `courtroom-prototype/`와 Accepted DEC는 바꾸지 않았다. 사람 플레이테스트 전이다. 규칙 `game/RULES.md`, 점검 `game/REPORT.md`.

## Current Version

- **v0.10.0** (`courtroom-prototype/package.json`) — Adversarial Trial 실험 구현, 독립 리뷰·사람 플레이테스트 대기.
- 실험 진입점: `courtroom-prototype/trial.html`. 기존 `index.html` 법정(v0.9.1)은 byte-identical로 보존하며 나란히 비교 플레이한다.
- v0.10 적용 commit: `7e63bbe`; 실험의 기반은 v0.9.1 polish `37d5b69`다(현재 HEAD를 뜻하지 않음).
- 웹 프로토타입과 Godot `litigation-skeleton/`은 별도다. Godot은 현재 보관 상태다.

## Current Goal

**재미 검증 우선**(2026-09-27 사용자 결정). 준비한 것을 들고 상대와 다투는 법정 공방을 사람 플레이테스트로 확인한다. 자동 회귀 통과는 재미의 증거가 아니다.

- 목표 일정은 2027년 2월 Steam Next Fest, 얼리 액세스는 그 이후다. 10월 말 외부 3~5명의 “한 판 더” 반응으로 2월/6월을 판단한다.
- 법정 연출은 텍스트 중심이며 그래픽 연출은 당분간 범위 밖이다.
- 진행 지도: [ROADMAP](../ROADMAP.md). 플레이테스트 질문: [REVIEW_REQUEST](../REVIEW_REQUEST.md).

## Active Lanes

- **experiment:** v0.10 비교 플레이와 GEN-001/WORLD-001/DEMO-001/PLAYTEST-001. 1페이지 계약, 핵심 엔진 검증과 사람 플레이테스트가 기준이다. 독립 Reviewer PASS 없이 병합 가능하다.
- **production:** 재미가 확인된 것에 기존 계약 → 구현 → 회귀 → Review Packet → 독립 리뷰 절차를 적용한다. 기존 법정은 비교 기준으로 보존한다.
- v0.10 리뷰 요청은 대기 상태로 유지한다. 실험 lane의 병합 기준과 독립 리뷰 요청 상태는 구분한다.
- 병합·폐기·제품 방향은 사람이 결정한다. 리뷰 제안을 자동 구현하지 않는다. 상세 규칙은 [AGENTS](../AGENTS.md), [WORKFLOW](../WORKFLOW.md).

## Implemented Summary

### v0.10 대립 공판 — `trial.html`

- 준비(반나절 4회, 조사 6종 → 카드) → 개회사(주력 쟁점·칼 접촉 입장) → 증인별 공방 → 판결 → 기록 기반 복기.
- 검사 주신문과 이의 창, 카드 기반 반대신문·결론 요구·시간 제한, 조건부 재주신문과 준비한 카드에 따른 재반대가 있다.
- 재판장 메모 문장으로 판세를 보여준다. 신뢰가 1 이하면 다음 신문 시간이 1 감소한다. 숫자 판세·무작위는 없다.
- `data/trial-case.js` → 순수 `engine/trial.js` → 원자적·append-only `services/trial.js` → `ui/trial-app.js`. 사건 ID를 코드에서 검사하지 않는다.
- 최후변론, 다른 검사/판사 성향, 아트·사운드, 저장, 여러 사건은 미구현이다. 기존 신문 엔진과의 통합 여부는 미결정이다.

### 기존 신문 법정 — `index.html` (v0.9.1)

- CaseTheory → Opening → 두 Witness → Closing → FactFinding/Verdict → reset 전체 흐름과 단계별 focus/scroll, 모바일 UI, CourtRecord sheet가 구현됐다.
- Theory A(현장에 있었지만 범인은 아님: Identity/Commission), B(접촉은 있었지만 고의는 없음: Intent), Core/Peripheral priority와 공개 입장·전략 변경·명시적 충돌 기록을 지원한다.
- 증인별 plan·Thread·follow-up, Commitment/Claim Scope, Press/Reinforced Press, Counter/Qualification/Overreach, Frame, 이의·근거 선택·재판장 결정을 지원한다.
- Closing은 확보된 authored inference와 실제 기록 인용을 수동 선택해 종합한다. Evidence를 만들지 않으며 원 Commitment·Revision·Conflict를 보존한다. Closing 없는 profile도 지원한다.
- 판정은 authored proof/doubt와 세 CourtRecord 층을 읽는다. 지원 선언은 `judge`, `beyond_reasonable_doubt`, `all_required`이며 발언·절차 성공·점수는 증거가 아니다.
- 현재 배포 사건은 완전한 입증 경로가 없어 `not_guilty`다. `guilty`는 synthetic fixture로 검증했다. 고의는 필수 쟁점에서 제외되며 전체 형사법 요소를 재현하지 않는다.
- Closing/판결 replay는 기록과 같은 버전 CaseDefinition을 사용한다. 전체 세션 Save/Load와 범용 법률 추론은 지원하지 않는다.

## Frozen / Stable Core

특별한 문제가 발견되지 않는 한 다음 기존 코어를 대규모 재설계하지 않는다.

- Evidence / Advocacy / Procedural 분리, CourtRecord source of truth, record-only evaluation.
- Proposition, authored Inference Variant, Frame, CaseTheory Core/Peripheral evaluation.
- Press, Reinforced Press, Counter Proposition, Witness Commitment, Claim Scope, Overreach.
- Basis와 Objection / Ruling pipeline.
- v0.9.1의 `engine/*`, `services/courtroom.js`, `data/case.js`는 v0.9 기준과 byte-identical이다.

## Known Technical Debt

- `services/courtroom.js`의 `recordResponse`는 relation/support metadata를 각 Evidence에 복제해 relation이 중복될 수 있다.
- relation 대상은 첫 일치 commitment(`.find(...)`)다. 최신 active commitment 선택은 후속 정리 대상이다.
- `engine/procedure.js`는 서로 다른 rule kind를 정확히 3개 요구하고 사건 고유 문구가 일부 남아 있다. 실제 다른 Proceeding이 필요할 때 완화하며 선제적 범용화는 하지 않는다.
- 단일 질문 Thread 직접 진입은 구현됐다. 전체 Thread 탐색 부담과 Closing의 반복 인용·CourtRecord disclosure 탐색은 남은 P2/플레이테스트 대상이다.

## Known Product Questions

- Claim selection이 “질문 범위 선택”으로 읽히는가? Thread grouping이 몰입을 돕는가?
- CourtRecord를 기본 화면에 얼마나 보여줄 것인가? Closing의 Frame 남발과 반복 선택을 어떻게 다룰 것인가?
- 기존 법정의 Redirect Examination을 언제 구현할 것인가? v0.10의 조건부 재주신문과 구분한다.
- 위 질문은 코어 변경에 앞서 사람 플레이테스트로 확인한다. 자동 인용·기록 병합은 도입하지 않았다.

## Active Tasks

이번 주 계약 목록이며, 계약 존재를 구현 완료나 병합으로 간주하지 않는다.

| 계약 | 담당 / 상태·의존성 |
| --- | --- |
| [GEN-001](../.agent/tasks/GEN-001.md) 사건 생성기 | Claude 코어·검증기 + Codex 원형·반전 문구 초안 |
| [WORLD-001](../.agent/tasks/WORLD-001.md) 세계 시뮬레이터 | Codex; 화면 없이 10년 로그를 사람이 검토 |
| [DEMO-001](../.agent/tasks/DEMO-001.md) 데모 | Claude; GEN-001 병합 후 시작 |
| [PLAYTEST-001](../.agent/tasks/PLAYTEST-001.md) 외부 플레이테스트 | 사람; DEMO-001, 없으면 trial.html. 에이전트는 기록 정리만 |

실험 설계 상세는 [DESIGN-NOTES-2026-09](DESIGN-NOTES-2026-09.md)의 계약 지정 절을 읽는다. Accepted DEC가 아니며 CURRENT에 복사하지 않는다.

## Recent Decisions

- **2026-10-08 후속:** [사건 중심 판단·법률 안내·준비 시간·수임/실비 v0.1](DESIGN-NOTES-2026-10-08_CASE_FIRST_AND_FEES.md). [PR #9 날짜 기반 slice 계획](https://github.com/PARK-TAEGEON/the-firm/pull/9)의 단계 0을 보강한다. 단일 사건의 인위적 조사 행동력은 보류하고 실제 행동·상대 대응·회복에서 재미를 검증한다. 비용 협의와 가격 민감도는 최소 구현 후보이며 수치 미정. 기존 데모/코어루프의 구현 상태나 Accepted DEC 전체를 바꾸지 않는다.

- **2026-09-30 [DEC-031](../DEC-LITIGATION-031_NUMERIC_ADJUDICATION_AND_PROPOSED_DEC_RESOLUTION.md):** 판정은 내부 수치·겉은 언어(같은 출처 비중첩, 능력 비가산, 기록 설명 가능, 법정 RNG 금지). DEC-012 부분 대체. Proposed였던 014~017·022·027~029 전부 처리(Proposed DEC 없음). DEC는 불변 조건만 구속, 층 분리는 참고.

- **2026-09-30 [DEC-032](../DEC-LITIGATION-032_LEGAL_SYSTEM_PACK.md):** 한국 법 근간, “한국을 닮은 가상의 법 세계” 표현, 엔진은 법체계 중립 + 한국 규칙은 `ko` 팩 데이터(새 코드부터), 두 번째 팩은 필요할 때.

## Decision Pending / Deferred

- **본류:** v0.10 대립 공판과 v0.9.1 신문 법정 중 선택, 기존 엔진 통합 여부 → 비교 플레이테스트 후 사람 결정.
- **최종 엔진:** 웹/Electron은 권장만 됐으며 확정되지 않았다.
- **출시 목표:** 10월 말 재미 검증 결과로 2월/6월 일정 판단. v1.0 최종 승인은 별도이며 자동 검사 통과로 승인하지 않는다.
- 기존 법정의 Jury, Sentencing, Settlement, Appeal, Full Redirect, Civil Vertical Slice, 상대 Closing AI, Staff와 전체 Save/Load는 미구현·유보다.
- DEMO-001의 합의·결과 분기 등은 실험 계약 범위다. 기존 법정에 구현된 기능으로 읽지 않는다.

## Key Links / Baselines

- 설계 권위: [Constitution](../00_GAME_CONSTITUTION.md), [System Map](../01_SYSTEM_MAP.md), [Architecture Rules](../02_ARCHITECTURE_RULES.md), 기존 Accepted DEC. 내용과 결정 상태는 원문을 따른다.
- 웹 프로토타입 기준: [DESIGN](../DESIGN.md), [v0.10 계약](../.agent/tasks/COURTROOM-CORE-100.md), [EXPERIMENT_RULES](../courtroom-prototype/EXPERIMENT_RULES.md). Godot Accepted design을 대체하지 않는다.
- 검증·리뷰: [REVIEW_PACKET](../courtroom-prototype/REVIEW_PACKET.md), [test-results.log](../courtroom-prototype/test-results.log), [REVIEW_REQUEST](../REVIEW_REQUEST.md). 검증 이력과 과거 리뷰 상태는 [CHANGELOG](CHANGELOG.md).
- 고정 기준: `courtroom-core-v0.7.1`, `courtroom-core-v0.8.1`, `courtroom-core-v0.9`(사용자 전달 PASS); v0.9 tag `8396284`, 구현 `f143986`. v0.9.1 polish는 `37d5b69`.
- 실행: `courtroom-prototype/`에서 `npm start` → `http://127.0.0.1:4173/` 또는 `/trial.html`; 직접 HTML 열기도 지원한다.
- 검증 명령: 같은 폴더에서 `npm test`, `npm run test:browser`, `npm run test:budget`, 실험은 `npm run test:trial`. 환경별 제한은 리뷰 요청을 확인한다.
