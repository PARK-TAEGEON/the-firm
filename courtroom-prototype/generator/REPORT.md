# GEN-001 3단계 — 자체 점검

Lane: experiment. 이번 수정은 `generator/balance.js` 하나뿐이다. `generator/core/`, `generator/content/`는
건드리지 않았다(둘 다 require해서 읽기만 했다).

## 한 일

`generator/balance.js`를 `core.buildContestedCase` 직접 호출에서 `generator/content` 진입점
(`content.buildContestedCase(archetypeId, seed)`)으로 바꿨다. `content.archetypes`의 키를 순회해서
**등록된 모든 원형**(현재 `ARCH_CRIMINAL_ASSAULT`, `ARCH_DUI`)을 자동으로 점검한다 — 원형이 추가돼도
`balance.js`를 다시 고칠 필요가 없다.

원형별로 seed 1~300을 `core/playthrough.js`의 `playThrough`로 끝까지 플레이하고 네 가지를 낸다:

- (a) 준비 없이 진행 시 무죄 건수 (0이어야 PASS)
- (b) 모든 준비 후 무죄율 — 기준을 이번 요청대로 **40~65%**로 좁혔다(2.5단계는 30~70%였다)
- (c) `caseDef.twistsApplied.length >= 1`인 시드 비율 — content가 만든 사건에 반전이 실제로 붙는 빈도
- (d) 재반대(rebuttal) 발생 수 — 모든 준비 시나리오에서 `records`에 `kind:'rebuttal'`로 남은 기록 합계
  (카드가 있어야만 `rebut({use:true})`가 실제 rebuttal 기록을 남긴다 — `rebutPass`는 세지 않는다)

## 주의: 작업 중 `generator/content/`가 다른 에이전트에 의해 동시에 수정되고 있었다

`balance.js`를 다 고친 뒤 검증차 여러 번 실행했는데, 그때마다 숫자가 달랐다. 원인은 코드 버그가 아니라
**다른 에이전트(Codex)가 같은 작업 트리의 `generator/content/`를 이번 작업 도중 계속 고치고 있었기
때문**이다. 관찰한 3번의 실행:

1. 1차: ARCH_CRIMINAL_ASSAULT 무죄율 77.0%(231/300, `content/REPORT.md`에 Codex가 남긴 수기 값과 일치),
   ARCH_DUI는 `twists_allowed: []`라 (c)(d)가 0.
2. 2차(직후 재확인차 재실행): DUI만 172→170으로 살짝 바뀜. `git diff`로 확인하니 그 사이
   `archetypes.js`의 `ARCH_DUI.twists_allowed`에 `TWIST_DUI_*` 3개 id가 추가되고 `truth_params`도 3개
   늘어 있었다 — 다만 `twists.js`엔 아직 그 모듈 실체가 없어 `selectActivatedTwists`가 조용히
   무시했고(2단계 설계), `truth_params`가 늘어난 만큼 `resolveTruth`의 rng 소비 순서가 바뀌어 DUI의
   baseline만 살짝 움직였다.
3. 3차(같은 명령 재실행): `twists.js`에 `TWIST_DUI_*` 3개가 마저 채워져 있었다. 이번엔 ARCH_DUI의
   (c)(d)가 실제 값(77.0%/231, 344회)으로 뛰었고, **ARCH_CRIMINAL_ASSAULT의 무죄율도 77.0%→57.7%로
   바뀌었다** — 같은 커밋 묶음에서 Codex가 assault의 twist delta도 함께 조정한 것으로 보인다(콘텐츠
   파일 자체는 내가 건드리지 않았다. `content/twists.js`의 diff는 이 세션의 내 변경분이 아니다).
4. 그 뒤 두 번 더 실행해 **완전히 같은 결과**를 확인했다(해시로도 `twists.js`/`archetypes.js`가 더는
   바뀌지 않음을 확인) — 아래를 최종값으로 쓴다.

## 최종 실행 결과 (`node generator/balance.js`, seed 1~300 × 2원형, 안정화 확인 후)

```
GEN-001 밸런스 점검 — 300시드, ARCH_CRIMINAL_ASSAULT
  준비 없이: 유죄 300 / 무죄 0
  모든 준비: 유죄 127 / 무죄 173 (무죄율 57.7%)
  (c) 반전 1개 이상 붙는 시드 비율: 257/300 (85.7%)
  (d) 재반대(rebuttal) 발생 수(모든 준비 시나리오 합계): 452
  PASS (a) 준비 없이 진행 시 무죄 0건 — 무죄 0건 / 300건
  PASS (b) 모든 준비 후 무죄 40~65% — 무죄 173/300건 = 57.7%

GEN-001 밸런스 점검 — 300시드, ARCH_DUI
  준비 없이: 유죄 300 / 무죄 0
  모든 준비: 유죄 130 / 무죄 170 (무죄율 56.7%)
  (c) 반전 1개 이상 붙는 시드 비율: 231/300 (77.0%)
  (d) 재반대(rebuttal) 발생 수(모든 준비 시나리오 합계): 344
  PASS (a) 준비 없이 진행 시 무죄 0건 — 무죄 0건 / 300건
  PASS (b) 모든 준비 후 무죄 40~65% — 무죄 170/300건 = 56.7%
```

**exit 0. 두 원형 모두 (a)(b) 전부 PASS.**

| 원형 | (a) 준비없이 무죄 | (b) 모든준비 무죄율 | (c) 반전≥1 비율 | (d) 재반대 수 | 판정 |
| --- | --- | --- | --- | --- | --- |
| ARCH_CRIMINAL_ASSAULT | 0/300 | 173/300 = 57.7% | 257/300 = 85.7% | 452 | PASS / PASS |
| ARCH_DUI | 0/300 | 170/300 = 56.7% | 231/300 = 77.0% | 344 | PASS / PASS |

두 원형 다 (c)가 77~86%로 높다 — 두 원형 모두 반전이 대부분의 시드에 최소 1개는 붙게 설계돼 있다는
뜻이다. (d) 재반대 수(452/344)는 (c)와 비슷한 비율로, 카드를 확보하면 재반대가 거의 매번 발동한다는
뜻이다(카드 없이는 애초에 재반대 옵션 자체가 뜨지 않는다).

## 튜닝 여부

**하지 않았다.** 이번 요청은 "core는 이 수정 외에 건드리지 말고"였다 — (b)를 맞추려면 twist의
`opponentRecovery`/`playerCounter` delta(`generator/content/twists.js`)나 approach/press 수치
(`generator/core/contested.js`)를 건드려야 하는데 둘 다 이번 범위 밖이라 `balance.js`만 바꿨다. 위
"주의" 절에서 보듯 assault의 (b)가 77.0%→57.7%로 바뀐 것은 이 세션 중 Codex가 `content/twists.js`를
고친 결과이지, 내가 튜닝한 것이 아니다.

## 아직 안 된 것 / TBD

- **이번 세션 동안 콘텐츠가 두 번 더 바뀔 수 있었다.** 위 표는 "3번 연속 동일 결과"로 안정화를 확인한
  뒤의 값이지만, 이 보고서를 읽는 시점에 `generator/content/`가 또 바뀌었다면 다시 `node
  generator/balance.js`를 실행해서 확인해야 한다 — 이 보고서의 숫자를 코드보다 신뢰하지 않는다.
- (c)(d)는 처음 정의한 지표라 "정상 범위"에 대한 기준 자체가 없다 — 이번 실행값(85.7%/452,
  77.0%/344)을 베이스라인으로 남긴다. 두 원형 다 (c)가 77~86%로 상당히 높다는 점은 "반전이 거의 항상
  붙는" 현재 진실 파라미터 임계값(대부분 `>= 0.6`, 균등분포에서 40% 확률)과 반전 개수(원형당 3~4개)의
  조합에서 나온 결과다 — 의도한 빈도인지는 사람 판단이 필요하다.
- `generator/balance.js`는 여전히 정책 하나(접근법 우선 → 압박 → endCross, 재반대는 카드 있으면 항상
  사용)만 실행한다. "절대 못 이기는 사건 0개"를 모든 전략에 대해 증명한 것은 아니다(기존 TBD 유지).
- (b)가 이번엔 두 원형 다 PASS로 나왔지만, 이건 Codex가 이번 세션 중 assault twist delta를 조정한
  결과로 보인다(내가 조정한 게 아니다). 그 조정이 의도된 것인지, 어떤 값에서 어떤 값으로 왜 바뀌었는지는
  `generator/content/`쪽 커밋 로그·REPORT를 봐야 한다 — 이 파일은 그 변경의 저자가 아니다.

## 범위 확인

- 바꾼 파일은 `generator/balance.js` 하나뿐이다. `generator/core/*`, `generator/content/*`는 require로
  읽기만 했다 — 그쪽이 이 세션 중 바뀐 것은 다른 에이전트(Codex)의 동시 작업 때문이며 내가 수정한 것이
  아니다(위 "주의" 절 참고).
- 여기서 멈춘다.

---

# GEN-001 2.5단계 — 자체 점검

Lane: experiment. 범위: `courtroom-prototype/generator/` 안에서만 작업했다(`services/trial.js`,
`engine/trial.js`는 읽기·require만 했고 수정하지 않았다).

## 한 일

### buildContestedCase 출력을 services/trial.js로 끝까지 플레이

- `contested.js`의 `buildContestedCase` 반환값에 `services/trial.js`(`createTrialService`)가 무조건
  읽는 필드를 채웠다:
  - `lines`: `trialOpen`/`crossStart`/`crossWarn`/`crossTimeUp`/`crossStop`/`noRedirect`/`rebutPass`/
    `witnessDone`/`verdictLead` 9개 전부. `(placeholder)` 문구지만 `services/trial.js`가 `.map(([s,t])=>...)`
    로 바로 소비할 수 있는 `[speaker, text]` 배열 형식이다. 이전엔 `lines: {}`였고, `open`/`crossStart` 등에서
    `d.lines.trialOpen.map(...)` 호출 시 `undefined.map`으로 즉시 터졌다.
  - `clientStatements`(1개 placeholder), `prosecutionExhibits`(issue당 1개, `PX_ISSUE_...`).
  - 이전에 비어 있던 `prosecutionExhibits: []`, `missedPrep: []`는 유지(서비스가 `missedPrep`을 직접
    읽지 않는다 — `engine/trial.js`의 `review()`가 읽지만 이번 2.5단계 acceptance bar는 verdict까지지
    review는 아니다).

### generator/core/playthrough.js — 공용 플레이 드라이버

- `playThrough(caseDef, { fullPrep })`: `createTrialService`로 실제 서비스를 만들어 `reset → (fullPrep이면
  모든 investigation) → finishPrep → open → (반복: pending 처리 / cross에서 approach·press·endCross /
  intro·direct·redirect에서 continue / closed에서 verdict) → verdict`까지 몬다. 각 command가 `ok:false`를
  반환하면 즉시 예외를 던진다 — "정상적으로 플레이했는데 막혔다"를 조용히 넘기지 않기 위해서다.
- `fullPrep=false`(준비 없이): investigate를 하나도 안 해서 카드가 없다 → cross의 모든 approach가
  `requiresAny` 카드 부족으로 막힘 → press도 `approaches.length>0` 조건에 걸려 막힘 → 매 witness마다
  `endCross`만 호출. baseline은 2단계에서 이미 `strengthRange:[3,7]`로 고쳐서 doubt(≤2)에서 시작하지
  않으므로, 아무 delta도 안 붙으면 doubt에 못 들어간다 — 무죄가 구조적으로 나올 수 없다.
- `fullPrep=true`(모든 준비 후): 모든 investigation → cross마다 "쓸 수 있는 approach 우선, 없으면 press,
  둘 다 없으면 endCross" → `rebut`이 pending이면 `use:true`. 실제로 해보니 신문 시간(`opening.focus.time`,
  witness당 2)이 evidence 개수(witness당 2)와 정확히 같아서 approach 2개를 쓰고 나면 시간이 다 돼
  `afterCrossAction`이 자동으로 cross를 끝낸다 — press는 실제로 못 쓴다(시간 제약, 버그 아님). 결과적으로
  witness당 `-1 + -1 = -2` delta만 적용된다.

### generator/balance.js — 300시드 밸런스 점검 스크립트

- `node generator/balance.js`로 실행하는 plain 스크립트(repo의 `tests/ui-budget.js`와 같은 관례 —
  `node:test`가 아니다). `ARCH_CRIMINAL_ASSAULT` × seed 1~300으로 두 시나리오를 각각 `playThrough`하고:
  - **(a) 준비 없이 진행 시 무죄 0건**: 300/300 무죄 0건. **PASS**.
  - **(b) 모든 준비 후 무죄 30~70%**: 무죄 173/300 = **57.7%**. **PASS**.
  - 두 체크 모두 통과하면 exit 0, 실패하면 exit 1과 함께 실패한 seed 목록(최대 10개)을 stdout에 남긴다.
  - 재실행해서 완전히 같은 숫자(유죄/무죄 카운트 전부 동일)가 나오는 것도 확인했다 — 결정성.
  - **튜닝은 하지 않았다.** 2단계에서 정한 `strengthRange:[3,7]`, 기계적 템플릿의 approach `delta:-1`,
    witness당 evidence 2개·cross 시간 2를 그대로 실행했더니 첫 실행부터 (a)(b) 둘 다 통과했다(우연히도
    "approach 2개 쓰면 시간이 딱 떨어져 press를 못 씀"이라는 제약이 delta 합계를 -2로 묶어놔서 범위 안에
    들어왔다). 손으로 미리 계산해본 값(약 58.9%)과 실제 실행 결과(57.7%)가 비슷해 계산도 맞았다는 걸
    확인했다.

### 테스트 기준 변경 (validate → 끝까지 진행)

- `generator/core/tests/criminal-template.test.js`에 acceptance bar를 추가했다: `playThrough`로 seed
  6개(`fullPrep` true/false 각각)를 판결까지 몰아 `outcome`이 `'guilty'`/`'not_guilty'` 중 하나인지
  확인한다. 기존 `engine/trial.js validate()` 테스트는 "빠른 구조 점검"으로 이름만 바꿔 남겨뒀다(삭제하지
  않음 — 구조가 깨지면 playThrough보다 먼저, 더 싼 값에 잡아준다).
  준비 없이 진행하면 항상 `guilty`이고 어떤 issue도 `doubt` band에 들어가지 않는다는 단위 회귀도 추가했다.
- `generator/core/contested.criminal.example.output.json`을 새 필드(lines 등) 포함해서 다시 저장했다
  (seed 1). `validate() === true`, `playThrough({fullPrep:false}).outcome === 'guilty'`,
  `playThrough({fullPrep:true}).outcome === 'not_guilty'` 모두 확인.

## 검증

```
node --test generator/core/tests/*.test.js
```
→ **30 pass, 0 fail** (2단계 27개 + playThrough 기반 신규 3개).

```
node generator/balance.js
```
→ (a) PASS 무죄 0/300, (b) PASS 무죄 173/300 (57.7%). exit 0.

`node --test`(인자 없음) 재확인: 전체 319개 중 309 pass / 10 fail, 실패 10개는 여전히 기존
`Cannot find module 'playwright'` 사전 존재 문제뿐이다(신규 실패 없음).

## 아직 안 된 것 / TBD

- **재반대(rebuttal) 경로는 이번 밸런스 점검에서 실제로 타지 않았다.** `ARCH_CRIMINAL_ASSAULT`엔 아직
  붙는 TwistModule이 없어서(`twists_allowed` id만 있고 콘텐츠 없음, 2단계 TBD) `redirect` 배열이 항상
  비어 있다 — `playThrough`의 `pending.type==='rebuttal'` 분기는 코드는 있지만 이 아키타입으로는 실행되지
  않는다. 형사 원형용 twist가 생기면(Codex 또는 후속 작업) 이 분기도 실제로 exercise된다.
- **밸런스 수치는 "approach 우선, 그다음 press" 정책 + 현재 template 수치(delta -1, evidence 2개, cross
  시간 2)에서 나온 결과다.** Codex가 대사를 채우면서 evidence 개수나 접근법 수를 늘리면(예: evidence 3개)
  이 숫자가 바뀐다 — `node generator/balance.js`를 그때 다시 돌려야 한다.
- **`review()`(복기)와 `missedPrep`은 이번 acceptance bar에 없다.** verdict까지만 확인했고, 복기 화면이
  실제로 의미 있게 뜨는지는 확인하지 않았다.
- 원형 2개(음주운전 등), 나머지 반전 4개, 대형 사건 3개 설계 문서, 승부 사건이 아닌 일상 사건 10개×3분야
  사람 검수는 여전히 시작 안 함.

## 범위 확인

- `courtroom-prototype/generator/` 밖은 `services/trial.js`, `engine/trial.js`를 require해서 읽기만 했다.
  수정하지 않았다.
- 여기서 멈춘다. 다음은 Codex가 대사와 나머지 반전을 채우는 단계(이전 리뷰에서 이미 예고됨).

---

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
