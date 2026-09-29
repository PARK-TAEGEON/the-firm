# GEN-001 2단계 — 자체 점검

Lane: experiment. 범위: `courtroom-prototype/generator/` 안에서만 작업했다(`engine/trial.js`는 읽기·require만
했고 수정하지 않았다). 읽은 문서: `.agent/tasks/GEN-001.md`, 1.5단계 REPORT.md의 TBD, 이번 리뷰 3항목.

## 한 일

### 1) 버그 수정 — activation이 false인 twist를 붙이지 않는다

- `contested.js`에 `selectActivatedTwists(archetype, truth, availableTwists)` 추가. `archetype.twists_allowed`
  에 있고 `appliesTo`가 이 원형에 맞는 후보만 추려서, 그중 `evaluateActivation(twist.activation, truth)`가
  true인 것만 반환한다. 형식이 깨진 후보는 (activation 평가 전에) `validateTwist`로 즉시 예외를 던진다.
  하나도 만족하지 않으면 빈 배열 — "반전 없는 사건"이 된다.
- `buildContestedCase(archetype, seed, availableTwists)`로 시그니처를 바꿨다(이전: `(archetype, twist, seed)`,
  twist를 무조건 붙였던 게 버그였다). 활성화된 twist만큼만 `investigations`/`cards`/해당 witness의
  `redirect`에 반영한다.
- 회귀: `generator/core/tests/contested.test.js` 8개. `ARCH_LEASE_DEPOSIT` + `TWIST_CLIENT_HIDES_DAMAGE`로
  activation true/false 양쪽, appliesTo 불일치, 후보 없음, "twistsApplied는 비었는데 카드는 남아있음" 같은
  회귀를 직접 테스트한다.
- 버그를 하나 더 잡았다: 처음 짠 테스트가 `resolveTruth(archetype, createRng(seed))`로 truth를 따로
  계산했는데, `buildContestedCase` 내부는 `claimAmount`·`retainer`를 먼저 뽑은 **뒤**에 truth를 뽑는다.
  같은 seed라도 rng 소비 순서가 다르면 다른 truth가 나와 테스트가 두 개 다 거꾸로 실패했다. `resolveContestedInputs(archetype, seed)`
  를 추출해 `buildContestedCase`와 테스트가 같은 함수를 쓰게 고쳤다 — "같은 seed로 truth를 두 번 다른 경로로
  계산하지 않는다"를 이후 불변식으로 남긴다.

### 2) 시작 강도 — doubt 구간에서 시작하지 않게

- `evidence_strength_rules[].strengthRange`를 `[1,7]` → `[3,7]`로 바꿨다(`archetype.example.js`,
  `archetype.criminal.example.js` 둘 다). `deriveIssueStrengths`가 이미 `clamp(base+noise, min, max)`를
  쓰고 있어서 데이터만 바꾸면 됐다 — `bands.doubt=2`이므로 최솟값 3이면 항상 `shaken` 이상에서 시작한다.
- **500시드 분포 (ARCH_CRIMINAL_ASSAULT, `buildContestedCase(archetype, seed, [])`, seed 1~500)**:

  | issue | min | max | mean | 히스토그램(3/4/5/6/7) |
  |---|---|---|---|---|
  | ISSUE_IDENTITY | 3 | 7 | 5.05 | 52 / 125 / 131 / 129 / 63 |
  | ISSUE_CAUSATION | 3 | 7 | 5.00 | 64 / 118 / 139 / 113 / 66 |
  | 합계(1000개) | 3 | 7 | — | 116 / 243 / 270 / 242 / 129 |

  `doubt(≤2)` 개수: **0/1000**, 목표 달성. 다만 `proven(≥5)`에서 시작하는 비율이 64.1%(641/1000)로 높다 —
  이건 이번 항목이 요구한 "doubt에서 시작 안 함"과는 다른 문제이고, 실제 밸런스(준비 없이 이기는 사건 0개)는
  재반대·접근법까지 시뮬레이션해야 판단할 수 있어 손대지 않았다. TBD로 아래에 남긴다.
- 회귀: `criminal-template.test.js`의 "issue baseline이 항상 bands.doubt보다 크다" — seed 1~500 전수 확인.

### 3) 사람 결정 반영 — 승부 사건은 형사 원형만, ARCH_CRIMINAL_ASSAULT + 기계적 템플릿

- `archetype.example.js`(ARCH_LEASE_DEPOSIT)는 daily-only로 명시하는 주석을 추가했다. `buildContestedCase`를
  이 원형으로 호출하는 코드는 남겨뒀지만(제네릭 함수 자체를 막지는 않음 — 범용 로직 재사용성 유지), 실제
  사용은 `contested.test.js`의 activation 게이팅 회귀뿐이고 그 외에는 호출하지 않는다.
- `generator/core/archetype.criminal.example.js`: `ARCH_CRIMINAL_ASSAULT`(폭행치상). v0.10 trial-case.js의
  IDENTITY/KNIFE 두 쟁점 구조를 따라 `ISSUE_IDENTITY`/`ISSUE_CAUSATION` 2개, `evidence_strength_rules` 2개
  (하나는 `direction: 'inverse'`로 — 1.5단계엔 없던 방향도 테스트했다). `claim_amount`는 이 원형에 청구금액
  개념이 없어 "합의금 참고 구간"으로 재해석했다(주석에 명시, 판결 로직에는 안 쓴다).
- `contested.js`에 기계적 템플릿을 추가했다: `buildEvidenceTemplate(issueId, evidenceType, index)`가
  evidence 문자열 하나를 investigation 1개 + card 1개 + approach 1개로, `buildWitnessTemplate(issue)`가
  issue 하나를 witness 1개(direct/approaches/presses/redirect 포함)로 기계적으로 만든다. 대사·제목은 전부
  `(PLACEHOLDER ...)` 문자열이다 — content 단계(Codex)가 이 자리만 authored 문구로 바꾸면 된다.
- **engine validate() 통과 확인**: `criminal-template.test.js`가 `require('../../../engine/trial.js')`로
  실제 엔진 파일을 읽어(수정 아님) `FirmTrial.validate(buildContestedCase(archetype, seed, []))`가
  seed `[1,2,3,42,777,123456]` 전부 `true`임을 확인한다. `engine/trial.js`의 `validate()`는 모든 id
  (issue/witness/card/investigation/direct/approach/press/redirect/focus/stance)가 **문서 전체에서 유일**해야
  한다는 걸 코드로 확인했다(`unique()`가 카테고리별이 아니라 전역 `ids` Set 하나를 공유) — id 접두 규칙
  (`ISSUE_`, `W_`, `INV_`, `CARD_`, `A_`, `P_`, `D_`, `F_`, `S_`, `RH_` + issue id 포함)으로 이를 만족시켰고
  "전역 id가 모두 유일하다" 테스트로 고정했다.
- 실제 출력을 `generator/core/contested.criminal.example.output.json`에 저장했다(seed 1, twist 없음,
  `engine/trial.js`의 `validate()` 통과 확인됨). 1.5단계에서 만든 lease 기반
  `contested.example.output.json`은 이번 결정으로 더는 대표 출력이 아니라서 지웠다(이번 세션에 내가
  만든 파일이라 정리했다 — REVIEW_PACKET류 삭제가 아니라 스크래치 산출물 정리).

## 검증

```
node --test generator/core/tests/*.test.js
```
→ **27 pass, 0 fail** (1.5단계 18개 + `contested.test.js` 8개 + `criminal-template.test.js`에서 이전
`generate.test.js`의 buildContestedCase 7개를 이관·재작성).

`node --test`(인자 없음, 자동 탐색)도 함께 실행해 실패가 늘지 않음을 확인했다(같은 10개 `Cannot find
module 'playwright'` 사전 존재 실패만 남고, generator 쪽은 전부 통과 — 이번 세션에 다른 작업 디렉터리
(`courtroom-prototype/world/` 등)의 파일이 같은 작업 트리에 나타나 있어 전체 개수는 달라 보이지만
generator/ 관련 테스트는 모두 초록이다).

## 아직 안 된 것 / TBD

- **proven(≥5)에서 시작하는 비율이 64%로 높다.** doubt 회피는 됐지만 "준비 없이 이기는 사건 0개" 전체
  밸런스는 재반대/접근법 delta까지 시뮬레이션해야 판단 가능 — 별도 밸런스 점검 스크립트가 필요하다(GEN-001
  범위 항목, 아직 시작 안 함).
- **witnesses[].direct/approaches/presses/opening/lines/briefing/memo가 전부 placeholder다.** 구조는
  engine validate를 통과하지만 실제로 읽을 수 있는 사건은 아니다 — content 단계(Codex) 필요. 이 리뷰
  요청의 마지막 문장("그 뒤에 Codex가 대사와 나머지 반전을 채운다")대로 다음 순서다.
- **ARCH_CRIMINAL_ASSAULT의 twists_allowed 3개는 아직 TwistModule로 구현되지 않았다.** id만 있고
  `selectActivatedTwists`가 항상 걸러낸다(candidates가 비어서). 사람 결정에 따라 이번 2단계에서는 만들지
  않았다.
- **`credibility`/`opening.close`/`lines`/`missedPrep`/`briefing`/`client` 등은 engine validate()가 검사하지
  않는 필드라 최소 placeholder로만 채웠다.** `project()`/`review()` 같은 다른 엔진 함수까지 실제로 도는지는
  확인하지 않았다 — 이번 항목이 요구한 건 `validate()` 통과였다.
- 1.5단계 TBD 중 "ARCH_LEASE_DEPOSIT에 civil 필드명(`claimType`/`roles.prosecutor`)을 형사 template에서
  재사용한 문제"는 이번 사람 결정(승부 사건은 형사만)으로 **해소됐다** — lease는 이제 daily-only라
  `roles`/`charge` 문제 자체가 발생하지 않는다.

## 범위 확인

- `courtroom-prototype/generator/` 밖은 `engine/trial.js`를 require해서 읽기만 했다(테스트에서 `validate()`
  호출). 수정하지 않았다.
- 반전 5개 중 여전히 1개(TWIST_CLIENT_HIDES_DAMAGE, lease용)만 있다. 형사 원형용 반전은 이번 항목 범위가
  아니라 만들지 않았다. 밸런스 점검 스크립트, 나머지 원형(음주운전), 대형 사건 3개 설계 문서는 시작하지
  않았다.
- 여기서 멈춘다. 다음은 Codex가 대사와 나머지 반전을 채우는 단계다.

---

# GEN-001 1.5단계 — 자체 점검

Lane: experiment. 범위: `courtroom-prototype/generator/` 안에서만 작업했다.
읽은 문서: `.agent/tasks/GEN-001.md`, `docs/DESIGN-NOTES-2026-09.md` §1.3·§1.4, `courtroom-prototype/data/trial-case.js`(참고).

## 한 일

1. **TwistModule 기계적 필드** (`generator/core/format.js`)
   - `targetIssue`, `activation`(`TwistActivation`: param/op/value), `investigationCard.investigationId`/`cardId`,
     `opponentRecovery.effect`/`playerCounter.effect`(각 `{issue, delta}`)를 추가했다.
   - `evaluateActivation(activation, truth)` 순수 함수 추가 — truth 값이 조건을 만족하는지 결정적으로 판정.
   - 부호 규약을 문서화했다: strength/delta가 높을수록 원형의 `side` 반대편(opponent)에게 유리하다.
     `trial-case.js`의 redirect(양수=검찰/상대에게 유리)·rebuttal(음수=변호인/player에게 유리) 부호와 동일하다.

2. **진실→증거 강도 규칙** (`generator/core/format.js` + `archetype.example.js`)
   - `EvidenceStrengthRule` 형식: `{issueId, truthParam, direction, strengthRange, noise}`.
   - `computeBaseStrength(rule, truthValue)` 순수 함수(RNG 없음) + `generate.js`의
     `deriveIssueStrengths(archetype, truth, rng)`(seed 기반 잡음 ±noise 추가)로 분리했다.
   - 예시 원형에 `evidence_strength_rules` 2개를 채워 두 issue(CONTRACT_END, DEDUCTION) 모두 truth_param
     근거를 갖게 했다.

3. **claim_amount 추가 + 보증금/착수금 버그 수정**
   - `Archetype.claim_amount`(만원, 청구금액=보증금 원금) 추가. `fee.retainer`(착수금)와 분리.
   - `generate.js`의 `outcomeSummary`가 `retainer`(착수금 482만원)를 "보증금"이라 표기하던 버그를
     `claimAmount`로 고쳤다. 회귀 테스트(`outcomeSummary는 claim_amount를 쓰고...`)로 고정했다.

4. **예시 반전 1개 + 승부 사건 실제 출력 + 검증기 + 결정성 테스트**
   - `generator/core/twist.example.js`: `TWIST_CLIENT_HIDES_DAMAGE` 완전한 형태로 작성.
     진실(damage_by_tenant≥0.6일 때만 발동) → 조사 카드(의뢰인 재면담) → 상대 수습(전체 재시공 주장,
     delta +2) → 재반대(카드 필요, 파손 범위 한정 주장, delta −3)로 모순 없이 이어지게 구성했다.
   - `generator/core/contested.js`: `buildContestedCase(archetype, twist, seed)` — 원형+반전+시드를
     `trial-case.js` 형식 객체로 변환한다. 실제 출력을 `generator/core/contested.example.output.json`에
     저장했다(seed 6, 5000개 안에서 첫 activation-true 시드를 찾아 사용).
   - `generator/core/validate.js`: `validateArchetype`, `validateTwist` — 형식 위반을 문자열 배열로
     보고한다(예외 아님). `buildContestedCase`는 내부에서 `validateTwist`를 호출해 실패 시 예외를 던진다.
   - `generator/core/tests/generate.test.js`: `node:test` 18개. 결정성(같은 시드→같은 daily/contested
     출력, dict 비교), 범위 검증, activation 연산자, direction 부호, validate 양성/음성 케이스,
     redirect/rebuttal 변환 정확성, baseline 범위, activation 가능 시드 존재를 확인한다.

## 검증

```
node --test generator/core/tests/generate.test.js
```
→ 18 pass, 0 fail.

`node --test`(인자 없음, 자동 탐색)도 이 파일을 함께 실행함을 확인했다. 같은 실행에서
`tests/browser-*.test.js` 10개가 `Cannot find module 'playwright'`로 실패하지만, 이는 Playwright
미설치라는 기존 환경 문제이며 이번 변경과 무관하다(이 브랜치에서 새로 만들지 않았고, generator/ 밖 파일도
손대지 않았다).

## 아직 안 된 것 / TBD

- **witnesses[].direct/approaches/presses가 비어 있다.** TwistModule의 기계적 필드(이번 1.5단계 범위)만으로는
  주신문 스크립트·반대신문 접근법을 만들 수 없다. authored 대사이므로 content 단계(Codex) 필요.
- **`claimType`/`roles.prosecutor` 필드명이 민사 사건에 형사 template(trial-case.js)의 키를 그대로 재사용한다.**
  `engine/trial.js`가 `roles.prosecutor`를 문자열로 하드코딩하지 않는 것은 확인했지만(grep 결과 없음),
  `ui/trial-app.js`나 라벨 문구가 civil 사건을 실제로 지원하는지는 확인하지 않았다. `charge` 대신
  `claimType`, `guilty/notGuilty` 대신 `granted/denied`를 썼는데 이 이름이 맞는 관례인지는 설계 판단이 필요해
  추측하지 않고 TBD로 남긴다.
- **`truth_params.notice_defective`를 DESIGN-NOTES §1.7 원문 예시에 없던 값으로 새로 추가했다.** 두 issue 모두
  truth_param 근거를 갖게 하려는 이번 요구(항목 2) 때문이며, `landlord_solvent`는 여전히 강도 계산에 쓰지
  않는다(회수 가능성 등 후속 로직용으로 주석에 남김).
- **issues[].memo 텍스트는 구조 검증용 placeholder다.** "상대측 주장 쪽으로 정리됨" 같은 템플릿 문장이며
  최종 authored 문구가 아니다(주석에 명시).
- 반전 모듈 5개 중 1개만 만들었다. 원형 3개 중 1개만 만들었다. 밸런스 점검 스크립트는 아직 시작하지 않았다.

## 범위 확인

- `courtroom-prototype/generator/` 밖 파일은 읽기만 했고 수정하지 않았다(`engine/trial.js`를 grep으로
  확인만 함).
- 다음 단계(반전 4개 추가, 원형 2개 추가, 밸런스 점검, witnesses 대사 authoring)는 시작하지 않고 여기서 멈춘다.
