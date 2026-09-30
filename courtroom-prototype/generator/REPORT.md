# GEN-001 core 수정 (2026-09-30) — 자체 점검

Lane: experiment. 브랜치 task/gen-001. 소유 범위: `generator/core/`, `generator/balance.js`,
`generator/content/index.js`의 연결 부분. `generator/content/`의 나머지(archetypes.js, twists.js,
copy.js, hearing-copy.js, SIGNATURE.md, content.test.js)는 읽기만 했다 — Codex 소유, 문구 수정 안 함.
기준 문서: `docs/DESIGN-NOTES-2026-09.md` §1.9~1.11, `DEC-LITIGATION-031`(N1~N7),
`DEC-LITIGATION-032`. 커밋은 하지 않았다 — 사람이 한다.

## 변경 요약

### 1) 준비 예산 < 조사 총비용
`contested.js`: `budget = max(2, round(총비용 × 0.6))`. 이전엔 `budget = 총비용`(전부 조사 가능)이었다.
`playthrough.js`의 `fullPrep` 정책도 "전부 산다"에서 "예산이 허락하는 만큼, 등장 순서대로 산다"로
고쳤다 — 안 고쳤으면 예산 초과로 `investigate` 커맨드가 실패해 playThrough 자체가 깨졌을 것이다.

### 2) 개회사 focus 2~3개·stance 3개, "잘못된 조합의 비용"
`buildOpening()`이 균형 focus 1개 + 쟁점별 focus(그 쟁점 증인 시간 +1, 다른 증인 -1, 최소 1) N개를
만든다(N=archetype.issues.length, 현재 2 → 총 3개). stance는 고정 3개 `S_CONTEST`/`S_ADMIT`/`S_DENY`.
`hearing-copy.js`가 이미 정확히 이 슬롯 이름(`focus.balanced`/`focus[쟁점id]`,
`stance.contest`/`admit`/`deny`)으로 문구를 갖고 있었다 — `index.js`가 이제 그 문구를 실제로 연결한다
(이전엔 balanced/contest 1개씩만 연결됐다).

활성화된 twist가 있는 쟁점에는 `buildStanceConflictApproach()`가 접근법을 추가한다: 그 twist의 카드가
있어야만 쓸 수 있고(`requiresAny`), 쟁점 점수는 바꾸지 않지만(`byStance` 전부 0) stance가 `S_DENY`면
`stanceConflict`로 credibility -1이 난다. **새 엔진 로직은 만들지 않았다** — `engine/trial.js`의
`crossStart`가 이미 credibility ≤ `warnAtOrBelow`면 다음 신문 시간을 자동으로 줄인다. v0.10의
`D_HAN_DENY`, `SIGNATURE.md` §1의 `A_SIG_OBS_CONTACT`와 같은 패턴을 재사용했다.

### 3) 증인별 이의 창 1개, proper/improper 교대
`buildObjectionStep()`이 쟁점 인덱스 짝/홀로 proper(인용될 유도신문)/improper(기각될 이의)를 교대한다.
`index.js`가 `hearing.witnesses[쟁점id].proper` 또는 `.improper`를 그 플래그에 맞춰 채운다 — content가
어느 쪽을 쓸지 결정하지 않는다.

### 4) 결론 요구(press) 2종, 경계선 사건에서 실제로 영향을 주는 경로
`limited`의 `minPoints`를 1 → 그 쟁점의 증거 개수(2)로 올렸다(접근법을 전부 써야 성공 가능). 새로
`overreach`를 추가했다 — `engine/trial.js`의 `pressSucceeds`가 이 kind는 항상 실패시키므로 always
+2·credibility -1이다. 균형 focus는 증거 접근법 2개로 신문 시간이 정확히 소진돼 press를 못 쓴다 —
**쟁점별 focus를 골라야 그 증인에게 press 쓸 시간이 남는다.** `core-revision.test.js`의 "결론 요구
성공이 경계선 사건을 doubt로 뒤집는 실제 경로가 존재한다" 테스트로 실제로 그런 시드가 있음을 확인했다.

### 5) 원형별 RNG 스트림 분리
`rng.js`에 `seedFor(seed, tag)`(FNV류 문자열 해시 + seed 결합) 추가. `resolveContestedInputs`,
`generateDailyCase`가 `createRng(seed)` 대신 `createRng(seedFor(seed, archetype.id))`를 쓴다. **이
때문에 이전 버전과 같은 seed라도 폭행·DUI 둘 다 truth/baseline이 달라진다** — 결정성은 유지되지만
(같은 seed → 같은 결과) 과거 스냅샷 값과는 다르다.

### 6) DEC-LITIGATION-032 — 한국 고유 명칭을 KO_PACK 하나로
`contested.js` 상단에 `KO_PACK = { roles: {judge,prosecutor,defense}, outcomeLabels: {guilty,notGuilty} }`.
D4(과잉 설계 금지)를 따라 별도 팩 파일·로더는 만들지 않았다 — "코드 여기저기 흩어 두지 않고 한 자리에
모으기"만 했다. 준비 예산 비율(0.6) 같은 게임 밸런스 상수는 한국 고유 규칙이 아니므로 그대로 코드
상수로 뒀다(D3는 "한국 고유 규칙"만 데이터로 요구한다).

### 7) content 슬롯 연결 (index.js)
`hearing-copy.js`의 focus/stance/이의(proper·improper)/overreach를 전부 연결했다. stance 충돌
접근법은 hearing-copy에 전용 문구가 없어 이미 작성된 twist의 `truthEffect`/`opponentRecovery` 문구를
재구성하고, 판사·검사의 절차적 반응 두 줄만 `d.lines`(기존에도 index.js가 직접 채우던 보일러플레이트)와
같은 성격으로 새로 뒀다 — 사건마다 달라지는 대사는 짓지 않았다. **content 문구(copy.js, hearing-copy.js,
archetypes.js, twists.js) 자체는 한 글자도 고치지 않았다.** 60개 샘플 사건(2원형 × 30시드)에서
PLACEHOLDER 잔존 0건을 확인했다.

### balance.js — content 진입점으로 모든 원형 검사, 기준 교체
`content.buildContestedCase`로 `content.archetypes`(현재 `ARCH_CRIMINAL_ASSAULT`, `ARCH_DUI`)를
자동 순회한다(이전엔 `core/archetype.criminal.example.js` 하나만). `playthrough.js`에 새 정책 둘을
추가했다:
- `playThroughRandom(caseDef, rng)` — 예산 안에서 무작위 순서로 조사를 사고, focus/stance/이의/재반대/
  cross 행동을 전부 무작위로 고른다. (c) 측정에 쓴다.
- `playBestPathForIssue(caseDef, issueId)` — 전지적 시점으로 그 쟁점 하나를 doubt로 미는 데 전념한다
  (그 쟁점 증거·twist 투자 우선구매 → 쟁점별 focus → 안전한 S_CONTEST → 유리한 이의 선택 → 접근법·
  press 전부 → 재반대 항상 사용). (b)(d) 측정에 쓴다 — `adjudicate()`는 필수 쟁점 중 하나라도 doubt면
  무죄이므로, 쟁점 하나만 제대로 밀어도 이길 수 있다.

## balance.js 출력 전체 (`node generator/balance.js`, seed 1~300 × 2원형)

```
GEN-001 밸런스 점검 — 300시드, ARCH_CRIMINAL_ASSAULT
  (a) 준비 없이: 유죄 300 / 무죄 0
  (b) 최선 경로 무죄 가능: 189/300 (63.0%)
      재판으로 못 이기는 사건(111건): 1, 3, 4, 5, 7, 8, 9, 12, 17, 19, 24, 27, 28, 30, 31, 35, 36, 40, 41, 43, 44, 45, 46, 47, 49, 50, 55, 59, 66, 68 ...
  (c) 무작위 준비·무작위 선택 무죄: 9/300 (3.0%)
  (d) 조사 선택에 따라 결과가 달라지는 사건: 145/300 (48.3%)
  PASS (a) 준비 없이 진행 시 무죄 0% — 무죄 0건 / 300건
  FAIL (b) 최선 경로 기준 무죄 가능 사건 ≥ 90% — 189/300건 = 63.0%, 못 이기는 사건 111건
  FAIL (c) 무작위 준비·무작위 선택 무죄 40~65% — 9/300건 = 3.0%
  FAIL (d, 참고) 조사 선택에 따라 결과가 달라지는 사건 비율 ≥ 50% — 145/300건 = 48.3%

GEN-001 밸런스 점검 — 300시드, ARCH_DUI
  (a) 준비 없이: 유죄 300 / 무죄 0
  (b) 최선 경로 무죄 가능: 184/300 (61.3%)
      재판으로 못 이기는 사건(116건): 2, 9, 17, 18, 21, 26, 27, 30, 34, 36, 37, 38, 40, 44, 45, 47, 49, 55, 56, 57, 63, 64, 68, 70, 72, 80, 88, 91, 94, 95 ...
  (c) 무작위 준비·무작위 선택 무죄: 6/300 (2.0%)
  (d) 조사 선택에 따라 결과가 달라지는 사건: 147/300 (49.0%)
  PASS (a) 준비 없이 진행 시 무죄 0% — 무죄 0건 / 300건
  FAIL (b) 최선 경로 기준 무죄 가능 사건 ≥ 90% — 184/300건 = 61.3%, 못 이기는 사건 116건
  FAIL (c) 무작위 준비·무작위 선택 무죄 40~65% — 6/300건 = 2.0%
  FAIL (d, 참고) 조사 선택에 따라 결과가 달라지는 사건 비율 ≥ 50% — 147/300건 = 49.0%
```

**exit 1** (두 원형 다 (a)만 PASS, (b)(c)(d)는 FAIL). **항목 8 지시대로 튜닝하지 않았다** — (b)(c)(d)는
이번엔 측정·출력만 한다. 숫자를 맞추려고 twist delta, 접근법 delta, 활성 임계값, budget 비율을 손대지
않았다.

**FAIL을 그대로 둔 이유와 다음 조정 후보 (Codex 몫):**
- (c) 3.0%/2.0%가 특히 낮다. 예산이 총비용의 60%뿐이라 무작위 구매가 그 쟁점에 필요한 카드 조합(2개
  다)을 못 살 확률이 높고, cross 행동을 매 순간 균등 무작위로 고르는 정책 자체가 "대충이라도 합리적인
  플레이어"보다 훨씬 약하다. (c)의 목표(40~65%)가 애초에 "완전 무작위"가 아니라 "무작위 준비 + 그래도
  뭘 좀 쓰는 플레이"를 가정한 것이라면 정책(playThroughRandom) 쪽을 조정해야 할 수도 있고, budget 비율을
  올리는 선택지도 있다 — 둘 다 사람 판단이 필요해 손대지 않았다.
- (b) 61~63%는 "쟁점 하나에 올인해도 못 이기는" 시드가 37~39%라는 뜻이다. baseline 분포(evidence_
  strength_rules의 strengthRange [3,7])나 접근법/press delta 크기를 키우면 오를 것이다.
- (d) 48~49%는 목표(50%)에 근접했다 — 미세 조정 범위.
- 폭행과 DUI가 거의 같은 패턴(63.0/61.3, 3.0/2.0, 48.3/49.0)을 보인다 — 원형별 문제라기보다 이번에
  새로 만든 지표·정책 자체의 특성일 가능성이 높다.

## 테스트 결과

```
node --test generator/core/tests/*.test.js
```
→ **43 pass, 0 fail** (기존 30개 전부 유지 + 신규 `core-revision.test.js` 13개: 항목 1~6 전용 회귀).

```
node --test generator/core/tests/*.test.js generator/content/content.test.js
```
→ **37 pass, 7 fail.** 실패 7개는 전부 `generator/content/content.test.js`(Codex 소유, 이번에 수정
안 함)다 — 원인은 그 테스트가 **이전 core 계약**을 가정한다는 것:
- "500시드 결정성·엔진 검증·문구 완결" / "콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다":
  `w.presses[0]`/`w.approaches[0]`만 있다고 가정한 인덱싱이 새 구조(presses 2개, stance 충돌 접근법
  추가)와 안 맞는다.
- "준비 유무 양쪽에서 실제 서비스 완주": `d.investigations.forEach(i => ok('investigate', {id: i.id}))`로
  **전부** 사는데, 이제 예산이 총비용보다 작아서 일부 `investigate` 커맨드가 정상적으로 거부된다
  (`ok('investigate', ...)`가 `result.ok===true`를 요구하므로 실패). 이건 버그가 아니라 항목 1이 의도한
  동작이다.
- "모든 접근법은 카드 없음·다른 카드·해당 카드의 기록과 근거 점수를 구분한다": 비슷하게 옛 접근법 개수
  가정.
**이 테스트 파일은 내 소유가 아니라 고치지 않았다.** Codex가 core 계약 변경(예산, press 2종, stance
충돌 접근법)에 맞춰 자기 테스트를 갱신해야 한다 — 다음 라운드로 넘긴다.

```
node --test
```
(전수 탐색) → 기존 `Cannot find module 'playwright'` 10건 외에 신규 실패는 위 7건(content.test.js)뿐이다.

## TBD / 다음 라운드로 넘기는 것

- **content.test.js 갱신** — 위에서 설명한 7개 실패. Codex 몫.
- **balance.js (b)(c)(d) 미달** — 튜닝은 다음 라운드. 후보는 위 "다음 조정 후보" 참고.
- **stance 충돌 접근법의 index.js 문구가 완전히 authored는 아니다** — twist의 기존 문구를 재구성 +
  판사·검사의 절차적 반응 2줄(새로 지음, 사건마다 안 바뀌는 보일러플레이트)이다. 사람이 읽었을 때
  자연스러운지는 확인 안 됨.
- **SIGNATURE.md §1의 이의 창 2개(유효+무효 둘 다), `_UNSUPPORTED` 접근법의 byStance 버전(`A_SIG_
  OBS_CONTACT`처럼 credibility 충돌이 있는 일반 접근법), 합의 분기**는 이번 core 템플릿에 반영하지
  않았다 — SIGNATURE.md는 DEMO-001용 literal 사건이지 생성기 템플릿 사양이 아니라서, "구조 참고"로만
  썼다(이의 창 1개로 줄인 것, stanceConflict 패턴 재사용 등). 전면 반영은 요청 범위를 넘는다고 판단했다.
- **`generator/content/CATALOG.md`, `check-balance.js`** 등 이번 세션 중 Codex가 새로 만든 파일은
  읽지 않았다(내 스코프 밖).

## 범위 확인

- 수정한 파일: `generator/core/contested.js`, `generator/core/playthrough.js`, `generator/core/rng.js`,
  `generator/core/generate.js`, `generator/core/format.js`(문서만), `generator/core/tests/core-revision.test.js`(신규),
  `generator/balance.js`, `generator/content/index.js`, `generator/content/RULES.md`(위 "이번 변경" 절만 추가).
- `generator/content/archetypes.js`, `twists.js`, `copy.js`, `hearing-copy.js`, `SIGNATURE.md`,
  `content.test.js`는 읽기만 했다 — 한 글자도 고치지 않았다.
- `engine/trial.js`, `services/trial.js`는 require로 읽기만 했다.
- 커밋하지 않았다. 사람이 한다.

---

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
