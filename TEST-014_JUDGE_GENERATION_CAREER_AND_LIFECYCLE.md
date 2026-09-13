# THE FIRM — Judge Generation, Career & Lifecycle 수동 검증

문서 ID: TEST-014  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: [DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md](DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md) v0.1 Proposed  
상위 기준: DEC-LITIGATION-013 v0.2 Accepted, DEC-LITIGATION-014 v0.1 Proposed, TEST-012, TEST-013

## 1. Purpose / verification boundary

본 테스트는 DEC-LITIGATION-015가 제안한 Judge Generation / Career / Lifecycle 구조를 명시적인 synthetic semantic fixtures에 수동 대입하여 내부 일관성을 검증한다.

검증 대상 chain은 다음과 같다.

```text
World-owned identity and lifecycle
→ judge generation / judicial entry
→ assignment eligibility and stored career state
→ resolved immutable JudgeProfileVersion
→ Litigation consumes contemporaneous resolved state
→ career movement / optional explicit profile evolution
→ retirement / optional post-judicial role
→ persistent identity and historical references
```

본 문서의 `Observed`는 코드 실행 결과가 아니다. 각 fixture를 DEC-015의 Proposed semantics와 DEC-013의 Accepted boundaries, DEC-014의 ChoicePoint boundaries에 수동 대입한 관찰 결과다.

### 1.1 What this test verifies

- 모든 판사의 stable identity와 World-owned lifecycle/history.
- Major/ordinary 차이가 simulation resolution이지 adjudicative authority가 아님.
- Procedural generation 결과가 Litigation 전에 stored world state로 materialize됨.
- Career event와 JudgeProfile evolution의 분리.
- Explicit eligible event와 validated rule을 통한 immutable profile evolution.
- Retirement와 post-retirement transition에서 identity/history 보존.
- Ordinary judge의 prominence 상승 시 continuity.
- Capacity/vacancy replenishment와 litigation result의 분리.
- World procedural variety와 prohibited Litigation RNG의 경계.
- Past evaluation의 contemporaneous references 보존.
- Relationship/reputation metadata의 fixed-record JII/finding non-interference.

### 1.2 What this test does not verify

본 테스트는 실제 대한민국 법관 인사제도, 법원 계층, 임명·전보·승진·퇴임 규칙, staffing 수치, assignment algorithm, generator 품질, RNG 구현, relationship mechanics, canonical schema/API/save, Godot implementation, UI, performance 또는 실제 litigation engine을 검증하지 않는다.

DEC-015에서 **TBD**인 content나 mechanics는 이 테스트에서도 **TBD / NOT TESTED**다. Synthetic fixture가 특정 event, eligibility, vacancy 또는 validated rule의 존재를 명시하는 경우, 본 테스트는 그 입력을 생성하는 방법이 아니라 그 입력이 주어진 뒤의 boundary만 검증한다.

## 2. Fixed semantic vocabulary and verification assumptions

| Term | Meaning used in TEST-014 |
|---|---|
| `JudgeIdentity` | 생성부터 retirement/post-career 이후까지 유지되는 stable judge identity |
| `JudgeGenerationRecord` | authored/procedural provenance와 생성 시 materialized inputs를 가리키는 World record |
| `JudgeCareerState` | 현재 judicial lifecycle 상태의 semantic representation |
| `JudgeCareerEvent` | rotation, transfer, role change, leave, appointment, retirement 등 명시적 World event |
| `JudgeCareerHistory` | immutable ordered career-event references |
| `JudgeAssignmentEligibility` | identity 존재와 별개인 현재 judicial assignment 가능성 |
| `JudgeArchetypeVersion` | DEC-013의 versioned qualitative trait baseline |
| `JudgeProfileVersion` | archetype와 validated individual overrides에서 resolve된 immutable profile version |
| `JudgeProfileEvolutionEvent` | eligible World event와 validated rule을 참조하여 새 profile version을 정당화하는 record |
| `JudgeProminenceState` | authored detail/simulation resolution 수준이며 legal power가 아님 |
| `JudgeRetirementRecord` | ordinary judicial assignment eligibility 종료와 history preservation을 기록하는 World record |
| `PostJudicialCareerRef` | 동일 person identity에 연결되는 post-retirement role reference |
| `JudgeInterpretationInput` (`JII`) | DEC-013 chain 안에서 criterion-declared ambiguity에만 쓰이는 explicit input |

다음은 신규 규칙이 아니라 source DEC의 inherited/proposed boundaries를 fixture에 적용하기 위한 고정 조건이다.

- World가 judge identity, lifecycle, career history와 profile-version history를 소유한다.
- Litigation은 evaluation 시점의 resolved assignment/profile state만 소비한다.
- Major/ordinary 판사는 동일한 DEC-013/014 litigation semantics를 따른다.
- Career event는 그 자체로 trait mutation이 아니다.
- Profile evolution은 explicit eligible World event, applicable validated rule과 새 immutable version을 요구한다.
- Procedural randomness는 World transition에서 결과를 materialize하고 저장한 뒤 종료된다.
- Litigation evaluation은 judge-generation/career RNG를 새로 소비하지 않는다.
- Relationship, familiarity, prestige 또는 reputation은 fixed record에서 JII나 finding을 직접 변경하지 않는다.
- Canonical Korean rules, exact algorithms, counts, probabilities, thresholds와 schemas는 주입하거나 확정하지 않는다.

## 3. Core verification cases

### Case 1 — Ordinary procedural judge generation

#### Purpose

Procedural ordinary judge가 disposable placeholder가 아니라 stable identity, eligible archetype과 resolved initial profile을 가진 persistent World entity로 생성되는지 검증한다.

#### Fixture

- Generation request: `JG-14-01`.
- Provenance: `ordinary_procedural`.
- Stable judge identity: `J-14-01`.
- Entry context: synthetic World event `JE-14-01`.
- Eligible archetype/version: `AR-14-01/v1`.
- Overrides: zero 또는 명시적으로 validated된 bounded override set `OV-14-01`.
- Resolved profile: `JP-14-01/v1`.
- Assignment eligibility: 별도 state `AE-14-01`, initial value는 fixture에서 explicit하게 supplied.
- Current party, desired outcome, case difficulty는 generation inputs에 없음.

#### Manual verification

1. `J-14-01`이 generation result와 career/history references의 stable owner인지 확인한다.
2. Archetype이 eligible pool과 World/content context에서 선택된 materialized reference인지 확인한다.
3. Override가 없거나 DEC-013 domain 안의 bounded validated override인지 확인한다.
4. Archetype과 overrides가 immutable `JP-14-01/v1`로 resolve됐는지 확인한다.
5. Identity existence와 assignment eligibility가 별도 의미인지 확인한다.
6. Party/outcome preference, current-case counter condition 또는 hidden legal-power roll이 없는지 검사한다.

#### Expected

- `J-14-01`, `AR-14-01/v1`, `JP-14-01/v1`과 generation provenance가 보존된다.
- Assignment eligibility는 identity 생성만으로 암묵 결정되지 않는다.
- Procedural origin은 history 축소나 random finding 권한을 의미하지 않는다.
- Party/outcome preference, player-counter generation과 hidden legal-power roll은 없다.

#### Observed

수동 대입 결과, DEC-015 L2/L4/L5/L6/L7 구조는 stable identity, versioned archetype/profile과 별도 eligibility를 함께 표현한다. Current case나 desired outcome을 참조하지 않고도 fixture가 닫혔다.

#### Verdict

**PASS**

#### Boundary note

Name/background generator, archetype catalog, override distribution, seed strategy와 assignment algorithm은 검증하지 않았다.

### Case 2 — Major authored judge generation

#### Purpose

Authored major judge가 richer content와 constrained career tendency를 가질 수 있으면서 ordinary judge와 동일한 litigation semantics를 유지하는지 검증한다.

#### Fixture

- Authored identity: `J-14-02`.
- Authored background seed: `BG-14-02`.
- Curated archetype/version: `AR-14-02/v1`.
- Validated curated override: `OV-14-02`.
- Resolved profile: `JP-14-02/v1`.
- Preferred trajectory: `TR-14-02`, special/specialist direction을 선호하되 eligibility와 vacancy에 종속.
- 동일 hard record/criterion을 사용하는 ordinary judge comparison fixture가 존재.

#### Manual verification

1. Authored identity/background/trajectory가 World content depth를 높이는지 확인한다.
2. Curated archetype/override도 DEC-013의 qualitative rule-linked profile boundary를 따르는지 확인한다.
3. Major flag가 hard evaluation, ChoicePoint activation 또는 permitted option을 변경하지 않는지 확인한다.
4. Preferred trajectory가 guaranteed appointment인지 검사한다.

#### Expected

- Authored detail과 strong/constrained trajectory는 허용된다.
- 동일 litigation inputs에서는 major/ordinary가 동일 hard boundaries를 따른다.
- Major judge에게 hard-rule bypass, stronger fact-finding authority 또는 guaranteed special appointment가 없다.

#### Observed

Major status는 authored detail과 simulation resolution에만 남았다. Litigation chain에 major-only input이나 authority가 없고 trajectory도 World conditions에 종속되어 power tier 또는 destiny lock이 되지 않았다.

#### Verdict

**PASS**

### Case 3 — Major trajectory blocked / alternate career

#### Purpose

Major judge의 preferred rare path가 eligibility 또는 vacancy 부재 시 강제되지 않고 identity를 유지한 채 다른 valid branch를 사용할 수 있는지 검증한다.

#### Fixture

- Judge: `J-14-03`, major authored identity.
- Preferred path: `TR-14-03-SPECIAL`.
- Current eligibility result: explicitly `not_eligible` 또는 relevant vacancy absent.
- Existing current role은 계속 valid.
- 별도의 alternate branch candidate `TR-14-03-ALT`가 World rules상 eligible하다고 fixture에 명시됨.
- Later reconsideration 가능성은 history상 열려 있으나 retry timing/rule은 supplied하지 않음.

#### Manual verification

1. Preferred tendency와 appointment entitlement를 분리한다.
2. Eligibility/vacancy가 false일 때 special transition이 발생하지 않는지 확인한다.
3. Existing role 유지 또는 fixture가 명시한 alternate eligible branch만 가능한지 확인한다.
4. `judge_id`, career history와 profile history가 유지되는지 확인한다.
5. Future retry 가능성을 guaranteed future success로 오해하지 않는지 확인한다.

#### Expected

- Preferred special path는 발생하지 않는다.
- 기존 role 유지 또는 explicit valid alternate branch가 가능하다.
- Identity/history는 유지된다.
- Later reconsideration은 가능성만 남고 자동 retry나 성공을 보장하지 않는다.
- Destiny lock과 eligibility bypass는 없다.

#### Observed

DEC-015 L12/L13에 따라 tendency는 eligibility/vacancy/world event를 우회하지 못했다. Alternate branch는 tester가 새 career rule을 만든 것이 아니라 fixture에 이미 eligible하다고 주입된 candidate만 사용했다.

#### Verdict

**PASS**

#### Boundary note

실제 eligibility, vacancy, retry timing과 alternate-branch selection algorithm은 **TBD / NOT TESTED**다.

### Case 4 — Ordinary → prominent continuity

#### Purpose

Procedural ordinary judge가 notable history를 축적한 뒤 prominence가 높아져도 replacement NPC가 되지 않고 기존 identity/history를 유지하는지 검증한다.

#### Fixture

- Judge: `J-14-04`, ordinary procedural origin.
- Existing career history: `CH-14-04`.
- Existing profile versions: `JP-14-04/v1`, `JP-14-04/v2`.
- Judicial/public history와 relationship refs 존재.
- Explicit prominence-change World event: `PE-14-04`.
- New prominence state는 richer authored/simulation detail만 요청한다.

#### Manual verification

1. Prominence change 전후 `judge_id`를 비교한다.
2. Career/profile/judicial/relationship histories가 같은 identity에 연속되는지 확인한다.
3. 기존 history가 새 authored backstory로 소급 교체되지 않는지 확인한다.
4. Prominence가 legal power, trait bonus 또는 hard-rule bypass를 추가하는지 검사한다.

#### Expected

- Same `judge_id`와 histories가 유지된다.
- Old `JudgeProfileVersion` references가 보존된다.
- Future simulation resolution과 authored detail만 높아질 수 있다.
- Replacement major NPC, retroactive history와 legal-power upgrade가 없다.

#### Observed

L19의 prominence state는 identity와 role/profile history에서 분리되어 있다. Existing judge를 그대로 확장할 수 있었고 litigation semantics는 변하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Prominence threshold와 richer-content authoring workflow는 **TBD / NOT TESTED**다.

### Case 5 — Transfer without profile mutation

#### Purpose

Routine transfer가 career history와 eligibility를 변경할 수 있지만 interpretive profile을 자동 mutate하지 않는지 검증한다.

#### Fixture

- Judge: `J-14-05`.
- Before transfer: assignment `AS-OLD`, profile `JP-14-05/v1`.
- Career event: `CE-14-05-TRANSFER`.
- After transfer: assignment `AS-NEW`와 eligibility update가 supplied됨.
- Applicable profile-evolution rule/event는 없음.

#### Manual verification

1. Transfer event와 new assignment가 career history에 추가되는지 확인한다.
2. Eligibility update가 career/assignment domain에 머무르는지 확인한다.
3. Profile evolution prerequisites가 존재하지 않음을 확인한다.
4. Transfer만으로 trait 변경이나 새 profile version이 생성되는지 검사한다.

#### Expected

- Career event/history와 assignment/eligibility는 갱신될 수 있다.
- `JP-14-05/v1`을 그대로 유지할 수 있다.
- Transfer 자체에 의한 automatic trait mutation은 없다.

#### Observed

L9의 career/profile separation을 적용하면 transfer는 career transition으로 닫히며 profile evolution chain은 열리지 않는다. 동일 profile version 유지가 일관된다.

#### Verdict

**PASS**

### Case 6 — Valid explicit profile evolution

#### Purpose

Long-term specialist/role event가 존재하더라도 explicit validated evolution rule이 함께 있을 때만 새 immutable profile version이 만들어지는지 검증한다.

#### Fixture

- Judge: `J-14-06`.
- Old profile: `JP-14-06/v1`.
- Explicit eligible World event: `PEE-14-06`.
- Explicit applicable validated evolution rule: `PER-14-06/v1`.
- Rule output은 DEC-013의 기존 trait domain과 valid rule-linked tendency 안에 bounded됨.
- Proposed new profile: `JP-14-06/v2`.
- Past evaluation `EV-14-06-OLD`는 v1을 참조.

#### Manual verification

1. Event가 단순 경력 연수 label이 아니라 explicit eligible World event인지 확인한다.
2. 별도의 applicable validated evolution rule이 존재하는지 확인한다.
3. Old/new profile versions, event, rule과 reason trace를 연결한다.
4. v1 in-place mutation 여부를 검사한다.
5. Career label에서 stereotype trait를 자동 추론했는지 검사한다.

#### Expected

- `JP-14-06/v2`가 새 immutable version으로 생성될 수 있다.
- v1과 이를 참조한 past evaluation은 보존된다.
- Evolution event/rule/reason trace가 존재한다.
- In-place mutation과 automatic experience-to-trait mapping은 없다.

#### Observed

수동 fixture에는 eligible event와 validated rule이 명시적으로 주입되어 있어 L10/L11과 DEC-013 J10의 versioned evolution chain이 성립했다. Event만으로 trait를 추론하지 않았고 v1을 변경하지 않았다.

#### Verdict

**PASS**

#### Boundary note

어떤 실제 event가 eligible한지, rule content, trait change 내용과 validator implementation은 **TBD / NOT TESTED**다. 이 PASS는 fixture가 명시한 rule의 boundary 적용만 뜻한다.

### Case 7 — Outcome/stat-driven mutation rejection

#### Purpose

Case outcomes, aggregate statistics 또는 one-off/repeated litigant encounters가 direct profile-evolution trigger가 되지 않는지 검증한다.

#### Fixture

동일 judge `J-14-07`과 profile `JP-14-07/v1`에 다음 variants를 각각 입력한다.

- A: player가 해당 judge 사건에서 3회 연속 승리.
- B: plaintiff success rate 상승.
- C: reversal rate 상승.
- D: 특정 litigant와 반복 조우.
- 별도 eligible World evolution event와 validated rule은 없음.

#### Manual verification

1. 각 variant가 outcome/statistic/interaction인지 분류한다.
2. DEC-013 J10과 DEC-015 L10의 direct-trigger prohibition을 적용한다.
3. 새 profile version 또는 trait change가 생성되는지 검사한다.

#### Expected

- A~D 모두 direct profile evolution trigger로 사용할 수 없다.
- `JP-14-07/v1`은 유지된다.
- “최근 패소가 많아 stricter” 또는 “원고 승률이 높아 defense-oriented” 같은 result-first mutation이 없다.

#### Observed

모든 variant는 명시적으로 forbidden trigger 범주에 속했다. 별도 eligible event/rule이 없으므로 profile evolution은 시작되지 않았다.

#### Verdict

**PASS**

### Case 8 — Retirement + historical preservation

#### Purpose

Retirement가 ordinary judicial assignment eligibility를 종료하되 identity와 모든 historical references를 삭제하지 않는지 검증한다.

#### Fixture

- Active judge: `J-14-08`.
- Existing archetype/profile histories, career history, public decisions, JII/trace와 relationship refs 존재.
- Explicit retirement event: `RE-14-08`.

#### Manual verification

1. Retirement 전후 identity reference를 비교한다.
2. Ordinary assignment pool eligibility가 종료되는지 확인한다.
3. Profile/archetype history, prior decisions, JII/trace와 relationships가 유지되는지 확인한다.
4. Past findings가 current retired state나 newest profile로 재작성되는지 검사한다.

#### Expected

- Ordinary judicial assignment pool에서 제외된다.
- `J-14-08`과 history/profile/archetype/decision/JII/relationship refs는 유지된다.
- Entity/history deletion과 past decision rewrite가 없다.

#### Observed

L14의 retirement semantics는 assignment eligibility 종료와 identity persistence를 분리한다. Retirement record를 추가하면서 historical graph를 그대로 유지할 수 있었다.

#### Verdict

**PASS**

#### Boundary note

Retirement age, term, triggering law와 exceptional return-to-service mechanics는 검증하지 않았다.

### Case 9 — Post-retirement role continuity

#### Purpose

Retired judge가 advisor 등 다른 World/legal role로 이동할 때 same person identity와 과거 judicial history를 유지하고 role-specific semantics를 분리하는지 검증한다.

#### Fixture

- Retired judge identity: `J-14-09`, person linkage `P-14-09`.
- Retirement record와 prior `JudgeProfileVersion` history 존재.
- Post-career reference: `PCR-14-09`, synthetic law-firm advisor role.
- Future advisor/lawyer profile content는 supplied하지 않음.

#### Manual verification

1. New role ref가 same person identity에 연결되는지 확인한다.
2. Historical `JudgeIdentity`와 judge profile versions가 보존되는지 확인한다.
3. New role-specific profile/interface가 judge interpretive traits와 분리되는지 확인한다.
4. JudgeTrait를 advisor/lawyer skill로 복사하는지 검사한다.

#### Expected

- Same person identity에 post-judicial role ref를 추가할 수 있다.
- Historical JudgeIdentity/profile/decisions는 untouched 상태로 남는다.
- New role-specific profile semantics는 별도 future interface를 사용한다.
- New unrelated NPC 생성과 JudgeTrait 직복사가 없다.

#### Observed

L15/L16의 future interface는 identity-preserving role transition과 role-profile separation만 요구한다. Full advisor mechanics 없이도 continuity와 prohibited trait copying을 검증할 수 있었다.

#### Verdict

**PASS**

#### Boundary note

`LegalProfessionalIdentity`, advisor/lawyer profile과 post-retirement occupation mechanics는 DEC-016 **TBD / NOT TESTED**다.

### Case 10 — Population replenishment non-interference

#### Purpose

Lifecycle exits로 생긴 institutional vacancy에 대한 replenishment가 case difficulty, party 또는 desired result와 독립적인지 검증한다.

#### Fixture

- Several explicit retirement events로 institutional vacancy signal `VAC-14-10`이 발생.
- World capacity rule이 new-entry generation request `GR-14-10`을 허용한다고 fixture에 명시됨.
- Current litigation metadata, parties, win rate와 case difficulty는 replenishment inputs에서 제외됨.
- Generated identity는 Case 1의 generation/entry/eligibility pipeline을 따라야 함.

#### Manual verification

1. Replenishment trigger가 observed vacancy/capacity state에서 유래하는지 확인한다.
2. Current case, party, desired outcome 또는 win-rate input이 없는지 확인한다.
3. Generation request와 actual assignment eligibility를 구분한다.
4. 특정 archetype composition을 litigation balancing 목적으로 강제하는지 검사한다.

#### Expected

- Capacity/vacancy 기반 generation/entry pipeline은 시작할 수 있다.
- Replenishment는 current litigation result와 독립적이다.
- Current case difficulty, party, desired win-rate 또는 result-balancing profile composition을 사용하지 않는다.

#### Observed

L20은 capacity/vacancy signal과 litigation outcomes를 분리하는 충분한 semantic boundary를 제공한다. Fixture는 staffing 수치나 생성 알고리즘을 보충하지 않고, supplied capacity rule이 case metadata를 읽지 않는지만 확인했다.

#### Verdict

**PASS**

#### Boundary note

Expected capacity, staffing numbers, demographics, generation timing과 assignment algorithm은 **TBD / NOT TESTED**다. 이 PASS는 replenishment non-interference에만 한정된다.

### Case 11 — Player-counter spawn rejection

#### Purpose

중요 사건 직전에 player에게 불리한 judge를 생성하거나 전보시키는 result-balancing 요청이 금지되는지 검증한다.

#### Fixture

- Request `ATTACK-14-11`: “current player case가 중요하므로 unfavorable archetype judge를 생성 또는 transfer한다.”
- Trigger는 player identity, current case difficulty와 desired unfavorable outcome을 참조.

#### Manual verification

1. Generation/transfer predicate의 dependencies를 추적한다.
2. World capacity, career eligibility 또는 independent assignment condition이 아니라 player/case outcome을 참조하는지 확인한다.
3. Archetype/profile이 direct party/outcome preference를 encode하는지 검사한다.

#### Expected

- Request는 **Forbidden / invalid**다.
- Unfavorable archetype spawn, player-specific transfer와 assignment manipulation이 발생하지 않는다.

#### Observed

Attack은 L4/L5/L20의 generation boundary와 DEC-013의 no-outcome-table 원칙을 직접 위반했다. World transition으로 materialize하기 전 단계에서 허용될 수 없다.

#### Verdict

**PASS**

### Case 12 — World RNG vs Litigation RNG boundary

#### Purpose

Stored World procedural variety와 prohibited courtroom interpretation/finding RNG를 구별한다.

#### Fixture

- Variant A: eligible career branches 중 하나가 seeded World transition에서 선택되어 `CE-14-12-A`로 materialize되고 저장됨.
- Variant B: 동일 stored judge/profile/case inputs의 litigation evaluation 도중 random roll로 interpretation option 또는 finding을 바꾸려 함.

#### Manual verification

1. Variant A의 random consumption 시점과 materialized output ownership을 확인한다.
2. Litigation이 A의 stored state만 소비하는지 확인한다.
3. Variant B가 evaluation-time RNG, random tie-break 또는 trait reroll인지 확인한다.
4. 동일 stored semantic inputs 재평가에서 새 RNG가 필요한지 검사한다.

#### Expected

```text
World procedural variety
→ materialized persistent state
→ potentially permissible candidate

Litigation evaluation RNG
→ forbidden
```

- A는 DEC-015의 boundary 안에서 potentially permissible하다.
- B는 DEC-011~015에 따라 forbidden이다.
- 같은 stored world/profile/case semantics에서 evaluation result를 재추첨하지 않는다.

#### Observed

A는 Litigation 전에 World-owned career event로 닫히고 persistent state가 됐다. B는 fact-finding/JII derivation 중 새 randomness를 소비하므로 금지됐다. 두 RNG 영역은 semantic ownership과 consumption time으로 분리됐다.

#### Verdict

**PASS**

#### Boundary note

Exact seed strategy, save/replay implementation, probability와 distribution quality는 **TBD / NOT TESTED**다. A를 허용한다는 것은 특정 RNG 구현을 승인한다는 뜻이 아니다.

### Case 13 — Rare appointment path

#### Purpose

Rare/special career transition이 linear RPG promotion이나 major-only destiny가 아니라 explicit eligibility와 World appointment event에 의존하는 branching path인지 검증한다.

#### Fixture

- Judge: `J-14-13`; origin은 ordinary 또는 major 어느 쪽도 가능.
- Explicit supplied eligibility result: `eligible`.
- Explicit vacancy/appointment World event: `SAE-14-13`.
- Career transition candidate는 current role에서 rare role로의 branch.
- Profile strength/level input은 없음.

#### Manual verification

1. Eligibility와 appointment event가 모두 explicit input인지 확인한다.
2. Major/ordinary status가 exclusive permission인지 확인한다.
3. District→appellate→supreme→constitutional 같은 자동 level chain을 요구하는지 검사한다.
4. Transition을 profile strength 증가로 설명하는지 검사한다.

#### Expected

- Supplied eligibility와 explicit appointment/world event가 있을 때 branching transition candidate가 성립할 수 있다.
- Automatic RPG ladder, major-only destination, guaranteed destiny와 profile-strength explanation은 없다.
- 실제 대한민국 제도 correctness는 결론 내리지 않는다.

#### Observed

L13의 최소 boundary는 explicit eligibility/event에 의한 non-linear branch를 허용한다. Fixture가 eligibility와 event를 공급했으므로 별도 appointment law를 발명하지 않고 transition의 structural coherence만 확인했다.

#### Verdict

**PASS**

#### Boundary note

실제 최고법원급·헌법재판·특수 역할의 hierarchy, eligibility와 appointment process는 **TBD / NOT TESTED**다.

### Case 14 — Historical replay after retirement

#### Purpose

Transfer, profile evolution, retirement와 post-career 이후에도 과거 evaluation이 당시 career/profile/criterion/JII references를 유지하는지 검증한다.

#### Fixture

- Past evaluation: `EV-14-14`.
- Contemporaneous references: judge `J-14-14`, career/assignment `CS-OLD`/`AS-OLD`, `JP-14-14/v2`, archetype version, criterion/version, ChoicePoint/JII와 derivation trace.
- Later history: transfer, `JP-14-14/v3`, retirement, post-career role.

#### Manual verification

1. Past evaluation trace의 stored references를 later state와 비교한다.
2. 조회/replay가 `CS-OLD`, `AS-OLD`, `JP-14-14/v2`와 contemporaneous criterion/JII를 사용하는지 확인한다.
3. Current retired state나 v3가 past evaluation에 대입되는지 검사한다.
4. Past output을 latest profile로 다시 작성하는지 검사한다.

#### Expected

- Past evaluation은 당시 career state, assignment, profile/archetype, criterion, JII와 trace references를 유지한다.
- Current retirement/post-career state와 latest profile은 old evaluation을 rewrite하지 않는다.

#### Observed

L22와 DEC-013 version preservation을 적용하면 past evaluation reference graph는 later lifecycle events와 분리되어 유지된다. Historical inspection은 old inputs를 참조하고 current state를 소급 대입하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Byte-identical replay, serialization과 migration implementation은 검증하지 않았다.

### Case 15 — Relationship favoritism attack

#### Purpose

Friendly/former-colleague/mentor 관계가 fixed-record JII 또는 fact finding을 직접 바꾸는 favoritism modifier가 되지 않는지 검증한다.

#### Fixture

- Judge: `J-14-15`.
- Player lawyer와 relationship metadata: `friendly`, `former_colleague` 또는 `mentor` candidate labels.
- Variant A/B에서 CourtRecordSnapshot, proposition/scope, criterion/version, ChoicePoint, `JudgeProfileVersion`, applicable policy와 command order는 동일.
- 유일한 variation은 relationship metadata의 존재/값.

#### Manual verification

1. DEC-013 JII derivation inputs와 ChoicePoint activation inputs를 고정한다.
2. Relationship metadata가 CP activation, trait/policy mapping 또는 option selection에 들어가는지 검사한다.
3. Credibility/sufficiency나 finding에 bonus가 추가되는지 검사한다.
4. Future recusal/information/interaction 가능성과 direct finding effect를 분리한다.

#### Expected

- A/B의 JII semantics와 finding semantics는 동일하다.
- Favorable option selection, relationship score bonus, CP activation과 credibility/sufficiency modifier가 없다.
- Recusal, information, interaction 또는 ethics effects의 가능성은 DEC-016 **TBD**로 남는다.

#### Observed

L17과 DEC-013 J11의 fixed-record non-interference를 적용하면 relationship metadata는 JII derivation chain에 들어갈 수 없다. 같은 evaluation inputs에서 same JII/finding semantics가 유지됐다.

#### Verdict

**PASS**

#### Boundary note

Relationship graph, recusal/reassignment, ethics/conflict-of-interest와 information effects는 **TBD / NOT TESTED**다. 이 PASS는 오직 direct favoritism modifier 금지에 한정된다.

## 4. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Stable identity | 1, 3, 4, 8, 9, 14 | PASS | Transfer, prominence, retirement와 post-role 이후에도 continuity 유지 |
| World lifecycle ownership | 1, 5, 6, 8, 10, 12 | PASS | Litigation은 materialized resolved state만 소비 |
| Major/ordinary semantic equality | 2, 3, 4, 13 | PASS | Content/resolution 차이만 허용; legal authority 동일 |
| Materialized procedural generation | 1, 10, 12 | PASS | Random/world choice는 evaluation 전에 stored state가 됨 |
| Career/profile separation | 5, 6, 13 | PASS | Career event가 자동 trait change가 아님 |
| Explicit profile evolution | 6, 7 | PASS | Eligible event + validated rule + immutable new version |
| No outcome-driven mutation | 7 | PASS | Outcomes, statistics, litigant interaction은 direct trigger 아님 |
| Retirement persistence | 8, 14 | PASS | Assignment eligibility 종료, identity/history 보존 |
| Post-role identity continuity | 9, 14 | PASS | Same person identity; role-specific semantics 분리 |
| Ordinary→prominent continuity | 4 | PASS | Replacement 없이 detail/resolution만 상승 가능 |
| Replenishment non-interference | 10, 11 | PASS | Capacity/vacancy와 current litigation result 분리 |
| No player-counter generation | 1, 10, 11 | PASS | Party/case/difficulty-driven spawn/transfer 금지 |
| World RNG / Litigation RNG separation | 1, 12 | PASS | World variety는 materialize; evaluation RNG 금지 |
| Rare-path eligibility | 3, 13 | PASS | Tendency가 아니라 explicit eligibility/event 요구 |
| Historical preservation | 4, 6, 8, 9, 14 | PASS | Contemporaneous immutable refs 유지 |
| Relationship non-interference | 15 | PASS | Fixed-record JII/finding direct effect 없음 |

## 5. Contradiction review

### 5.1 DEC-015 internal contradiction

**None found in the supplied fixtures.**

Hybrid generation, persistent identity, branching career, career/profile separation, retirement continuity와 historical preservation은 동시에 적용 가능했다. Population replenishment와 procedural variety도 각각 litigation-independent World transition으로 한정하면 다른 invariants와 충돌하지 않았다.

### 5.2 DEC-013 compatibility

**No contradiction found.**

- Every active evaluation uses a resolved immutable `JudgeProfileVersion`.
- Career event가 profile을 직접 변경하지 않는다.
- Single outcome/statistic/interaction은 direct evolution trigger가 아니다.
- Major status, prestige, relationship과 generation provenance는 JII/finding modifier가 아니다.
- Past evaluations preserve contemporaneous profile versions.

### 5.3 DEC-014 ChoicePoint boundary

**No intrusion found.**

Career event, generation rule, assignment, relationship 또는 prominence가 `CriterionChoicePoint`를 생성·활성화하거나 permitted options을 추가하지 않았다. JII가 필요한 evaluation은 여전히 hard-first 및 criterion-declared genuine ambiguity boundary를 먼저 통과해야 한다.

### 5.4 TEST-012 / TEST-013 boundaries

**Not reopened.**

TEST-014는 JudgeProfile→JII derivation, genuine ambiguity validator 또는 CP option semantics를 재설계하지 않았다. 해당 문서에서 검증한 hard-first, no direct profile effect, deterministic JII, profile-independent activation과 invalid outcome-switch prohibition을 inherited boundaries로만 사용했다.

### 5.5 Major/ordinary legal-power tier review

**No leak found.** Major/ordinary distinction은 authored detail, prominence와 simulation resolution에만 관여했다. Hard rules, criterion, CP, JII와 CourtFactFinding authority는 동일했다.

### 5.6 World RNG leakage review

**No leak found.** World procedural selection은 stored event/state로 materialize된 뒤 Litigation에 입력됐다. Evaluation-time reroll, mood roll, random option selection 또는 fact-finding RNG는 허용하지 않았다.

### 5.7 Retirement/post-career identity review

**No replacement found.** Retirement는 assignment eligibility를 종료했으며 post-career role은 same person identity에 새 role ref를 더했다. Judge history/profile references는 유지됐다.

### 5.8 Relationship favoritism review

**No modifier found.** Fixed evaluation inputs에서 relationship metadata만 바꾸어도 CP activation, JII와 finding semantics는 변하지 않았다. Future recusal/information/interaction mechanics는 결론 내리지 않았다.

### 5.9 Automatic profile mutation review

**No automatic mutation found.** Routine transfer는 same profile version을 유지했고 valid evolution fixture는 explicit eligible event와 validated rule을 모두 요구했다.

### 5.10 TBD closure review

**No TBD was promoted by testing.** Eligibility, vacancy, evolution rule, capacity rule 등은 필요한 case에서 explicit synthetic assumptions로 주입했다. 테스트는 그 생성 방법이나 실제 법적 타당성을 검증하지 않았다.

## 6. False-PASS audit

각 PASS에 다음 질문을 적용했다.

```text
이 PASS는 DEC-015가 실제로 정의한 boundary 때문에 PASS인가?
아니면 tester가 빠진 규칙을 임의로 보충해서 PASS인가?
```

| Case | False-PASS attack | Result |
|---:|---|---|
| 1 | Archetype catalog/seed/assignment algorithm을 발명해야 하는가? | No. Explicit materialized refs만 주입하고 generation boundary만 검증했다. |
| 2 | “Major”가 stronger authority 또는 guaranteed appointment를 암묵 부여하는가? | No. 두 항목을 명시적으로 배제했다. |
| 3 | Alternate path나 retry rule을 tester가 생성했는가? | No. Alternate eligibility는 fixture input이며 actual selection/retry mechanics는 TBD로 남겼다. |
| 4 | Prominence threshold를 임의 확정했는가? | No. Explicit change event 이후 identity continuity만 검증했다. |
| 5 | Transfer가 profile-neutral이라는 universal content rule을 만들었는가? | No. 해당 fixture에 evolution rule이 없다는 조건에서 same version이 가능함만 검증했다. |
| 6 | Career experience에서 trait를 임의 추론했는가? | No. Eligible event와 validated rule을 explicit inputs로 요구했고 actual mapping은 NOT TESTED다. |
| 7 | Outcome/statistics가 indirect long-term evidence가 될 가능성까지 새로 금지했는가? | No. Source가 금지한 direct mutation만 검증했다. |
| 8 | Exact retirement law나 age를 정했는가? | No. Explicit retirement event 이후 persistence만 검증했다. |
| 9 | Advisor/lawyer profile을 설계했는가? | No. Same-person, separate-role interface만 검증했다. |
| 10 | Staffing 수치나 replenishment algorithm을 발명했는가? | No. Supplied capacity/vacancy request의 litigation non-interference만 검증했다. |
| 11 | Assignment/transfer system 전체를 결정했는가? | No. Player/outcome-conditioned request의 prohibition만 검증했다. |
| 12 | Seed strategy나 implementation determinism을 확정했는가? | No. Materialization boundary와 evaluation RNG 금지만 검증했다. |
| 13 | 실제 rare appointment law를 만들었는가? | No. Supplied eligibility/event 이후 non-linear transition boundary만 검증했다. |
| 14 | Byte-identical replay/save implementation을 주장했는가? | No. Semantic historical references만 검증했다. |
| 15 | Recusal/ethics/relationship mechanics를 부정하거나 확정했는가? | No. Fixed-record direct favoritism만 금지하고 나머지는 DEC-016 TBD로 유지했다. |

False-PASS 공격 후에도 15개 verdict는 DEC-015가 실제 제안한 semantic boundary만으로 유지된다. 이는 미정 mechanics가 구현되었거나 실제 법제에 맞다는 뜻이 아니다.

## 7. Remaining TBD / NOT TESTED

다음은 TEST-014에서 검증하지 않았으며 PASS로 계산하지 않는다.

- Actual Korean judicial appointment system.
- Actual court hierarchy.
- Actual Supreme/Constitutional/special appointment rules.
- Staffing numbers와 expected institutional capacity 수치.
- Retirement ages/terms와 actual retirement triggers.
- Demographic generation.
- Name/background generator quality.
- Canonical archetype catalog.
- Override limits와 distributions.
- Career event probability/timing.
- Exact procedural RNG seed strategy.
- Assignment algorithm.
- Recusal/reassignment.
- Panel composition.
- Exact prominence thresholds.
- Post-retirement occupation mechanics.
- `LegalProfessionalProfile` 및 role-profile content.
- Relationship graph semantics/mechanics/provenance.
- Interaction/networking/recruitment/lobbying systems.
- Ethics/conflict-of-interest, corruption, bias와 discipline systems.
- Public/private information disclosure와 UI.
- Canonical schema/API/save/migration.
- Godot/GDScript implementation.
- Runtime generator, lifecycle engine 또는 litigation engine correctness.
- Byte-identical replay/determinism.
- Performance.
- Final adjudication, damages/remedy와 appellate/remand effects.

## 8. Final verification summary

```text
Total core cases: 15
PASS: 15
PARTIAL: 0
FAIL: 0
```

**Final result: 15 PASS / 0 PARTIAL / 0 FAIL.**

DEC-LITIGATION-015 v0.1의 proposed Judge Generation / Career / Lifecycle architecture는 supplied manual synthetic fixtures에서 internally coherent하다.

- DEC-015 v0.1을 reopen해야 하는 contradiction: **없음**.
- 문제가 확인된 decision: **없음**.
- DEC-013과의 contradiction: **없음**.
- DEC-014 ChoicePoint boundary 침범: **없음**.
- Fixture-level verification 기준으로 향후 Accepted 승격을 막는 문제: **없음**.

이 결과는 DEC-015를 자동으로 Accepted로 변경하지 않는다. 또한 실제 대한민국 법관 인사제도, unresolved TBD, implementation 또는 runtime correctness를 검증 완료했다는 뜻이 아니다.
