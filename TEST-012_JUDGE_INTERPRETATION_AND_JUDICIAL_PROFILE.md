# THE FIRM — Judge Interpretation & Judicial Profile 수동 검증

문서 ID: TEST-012  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: [DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) v0.2 Accepted  
범위: DEC-013의 Accepted/Core Accepted 구조를 explicit synthetic semantic fixture에 수동 대입하여 내부 일관성과 경계 보존을 검증한다.

## 1. Purpose and verification boundary

이 문서는 다음 dependency가 서로 모순 없이 작동하는지 manual / fixture level에서 검증한다.

```text
fixed litigation inputs
  → hard evaluation
    → criterion-declared genuine ambiguity
      → CriterionChoicePoint activation
        → JudgeProfileVersion
          → applicable rule-linked JudgeTrait
            → JudgeInterpretationPolicy
              → explicit JudgeInterpretationInput
                → bounded requirement resolution
                  → CourtFactFinding
```

검증의 핵심은 `JudgeProfile`이 `CourtFactFinding`을 직접 변경하지 않는다는 점이다. Profile 차이는 hard evaluation 뒤에도 criterion이 둘 이상의 permitted semantic option을 명시적으로 남긴 genuine ambiguity에서만 작동한다.

이 문서가 검증하는 것은 다음과 같다.

- hard-first gate와 genuine-ambiguity-only 순서.
- criterion-declared choice point, rule-linked qualitative trait/policy와 explicit JII의 bounded derivation.
- evidence, scope, requirement와 alternative path의 생성·삭제 금지.
- hidden outcome modifier, prestige shortcut와 judge RNG 금지.
- semantic determinism과 immutable profile-version preservation.
- internal trace, public explanation과 downstream adjudication의 분리.

이 문서는 설계 문서나 구현 시험이 아니다. 각 `Observed result`는 코드 실행 결과가 아니라 fixture를 DEC-013 Accepted/Core Accepted semantics에 수동 대입한 관찰 결과다. 실제 법률, 자동 판별, canonical schema 또는 실행 엔진이 필요한 검증은 수행하지 않는다.

## 2. Fixed semantic vocabulary and method

### 2.1 Vocabulary

| term | 이 테스트에서의 고정 의미 |
|---|---|
| `JudgeProfile` | stable judge identity에 속하는 version history의 의미적 소유자; outcome table이 아님 |
| `JudgeProfileVersion` | 평가 당시 사용되는 immutable resolved profile version |
| `JudgeArchetypeVersion` | rule-linked trait baseline의 immutable version |
| `JudgeTrait` | qualitative domain/tendency/applicability/policy reference; numeric stat이 아님 |
| `JudgeInterpretationPolicy` | applicable trait와 criterion의 permitted option을 deterministic하게 연결하는 의미 mapping |
| `CriterionChoicePoint` | criterion/version이 소유하며 target requirement/scope, activation condition과 permitted semantic options를 명시하는 genuine ambiguity 지점 |
| `JudgeInterpretationInput` (`JII`) | 실제 선택 option, 관련 profile/trait/policy/choice-point version과 affected scope를 보존하는 explicit derivation artifact |
| hard evaluation | allowed record, proposition/scope, criterion과 evidence inputs만으로 clearly sufficient, clearly insufficient 또는 required rule/input missing 여부를 먼저 판별하는 단계 |
| bounded requirement resolution | JII를 declared choice point의 target requirement/scope 안에서만 사용하는 처리 |
| `CourtFactFinding` | `recognized`, `recognized_limited`, `not_established_on_record`, `undetermined` 중 하나만 사용하는 proposition-level finding |

Fixture에서 사용하는 minimum-v1 trait domain은 다음 네 가지뿐이다.

```text
credibility_qualification
inference_linkage
scope_precision
conflict_corroboration_treatment
```

이는 exhaustive하거나 permanently canonical한 taxonomy라는 뜻이 아니다. TEST-012는 새 domain을 추가하지 않는다. `requires_explicit_link`, `accepts_bounded_circumstantial_link` 같은 tendency key도 숫자 서열이나 강도 점수가 아니다.

### 2.2 Fixed verification rules

1. Choice-point activation은 profile, party, law firm, desired outcome, lawyer reputation 또는 prestige를 보기 전에 record/criterion에서 판정한다.
2. Hard result 또는 required rule/input missing이 확인되면 profile layer는 결과를 변경하지 않는다.
3. Profile, trait와 policy는 canonical finding status나 party/claim outcome을 직접 선택하지 않는다.
4. JII는 criterion이 이미 선언한 option과 target boundary만 기록한다.
5. Numeric score, probability, evidence-count vote, hidden weight와 RNG를 fixture에 넣지 않는다.
6. Derivation 중단 reason은 finding status가 아니다. 사용할 수 있는 Accepted reason category는 다음과 같다.

```text
judge_interpretation_mapping_missing
judge_interpretation_mapping_conflict
judge_interpretation_fallback_missing
```

7. 구체 legal threshold, automatic ambiguity detection, exact validation algorithm과 schema는 주입하지 않는다.

## 3. Core verification cases

### Case 1 — Hard-result profile non-interference

**Purpose**

Clearly sufficient 또는 clearly insufficient인 hard result가 서로 다른 profile 때문에 변하지 않는지 검증한다.

**Fixture**

- 공통: Case `K-1`, Stage `ST-1`, proposition `P-1`, criterion `C-1/v1`, closed snapshot `CRS-1`.
- Judge A: `judge_id=J-A`, `JP-A/v1`; Judge B: `judge_id=J-B`, `JP-B/v1`.
- 두 profile은 서로 다른 qualitative `inference_linkage` traits를 가지지만, hard evaluation input에는 차이가 없다.
- 1A: `C-1/v1`의 모든 mandatory requirement가 allowed EvidenceUse로 명확히 충족된다.
- 1B: mandatory scope `S-1B`에 supporting EvidenceUse가 없다. Criterion과 다른 inputs는 complete하다.

**Allowed evaluation path**

- 1A와 1B 모두 fixed litigation inputs에서 hard evaluation까지만 진행한다.
- 1A는 criterion의 hard transition을 통해 fixture상 `recognized`로 닫힌다.
- 1B는 mandatory coverage gap 때문에 `not_established_on_record`로 닫힌다.

**Forbidden behavior**

- Profile을 먼저 읽어 choice point를 만드는 것.
- 1A의 hard finding을 profile 성향으로 뒤집는 것.
- 1B에서 lenient trait가 evidence, scope, coverage 또는 requirement waiver를 만드는 것.
- Effective JII를 생성하는 것.

**Manual verification steps**

1. 두 judge variant의 record, criterion과 requirement outcomes가 동일한지 대조했다.
2. Hard-result gate에서 1A와 1B가 각각 닫히는지 확인했다.
3. Profile lookup 이후 effect 또는 JII reference가 trace에 없는지 확인했다.
4. 두 judge의 canonical status를 variant별로 비교했다.

**Expected result**

- 1A: Judge A/B 모두 `recognized`; effective JII 없음.
- 1B: Judge A/B 모두 `not_established_on_record`; effective JII 없음.

**Observed result**

수동 대입에서 두 variant 모두 hard-result gate에서 종료됐다. Profile 차이는 어느 requirement에도 전달되지 않았고, 1A는 양쪽 모두 `recognized`, 1B는 양쪽 모두 `not_established_on_record`로 동일했다.

**Verdict: PASS**

**Notes / unresolved TBD:** 실제 hard-sufficiency content와 법적 threshold는 검증하지 않았다. Fixture가 complete criterion과 explicit requirement outcomes를 공급했다.

### Case 2 — Genuine circumstantial ambiguity derivation

**Purpose**

Genuine ambiguity에서만 서로 다른 rule-linked traits가 서로 다른 permitted JII option을 도출하며 그 effect가 target boundary에 한정되는지 검증한다.

**Fixture**

- Case `K-2`, proposition `P-2`, scope `S-link`, criterion `C-2/v1`, snapshot `CRS-2`와 기존 circumstantial links는 두 judge에게 동일하다.
- `CP-2`는 `S-link`의 requirement `R-link`에 대해 record condition으로 먼저 active가 된다.
- `CP-2`의 permitted options는 `accept_bounded_link`, `require_direct_link` 두 개뿐이다.
- `JP-A/v1`의 `JT-A`는 `inference_linkage=accepts_bounded_circumstantial_link`, policy `JIP-A/v1`을 통해 첫 option에 연결된다.
- `JP-B/v1`의 `JT-B`는 `inference_linkage=requires_explicit_link`, policy `JIP-B/v1`을 통해 둘째 option에 연결된다.

**Allowed evaluation path**

- Hard evaluation이 결과를 닫지 못한 뒤 `CP-2` activation을 profile 독립적으로 확인한다.
- 각 valid trait/policy mapping은 `CP-2`가 이미 가진 option 하나를 선택해 `JI-A`, `JI-B`를 만든다.
- JII는 `R-link`/`S-link`의 bounded resolution에만 사용되고, 이후 canonical transition은 criterion에 따른다.

**Forbidden behavior**

- Profile을 보고 `CP-2`를 생성하거나 activation하는 것.
- 새 evidence, link, path 또는 scope를 생성하는 것.
- Policy payload가 `recognized` 또는 `not_established_on_record`를 직접 선택하는 것.
- Choice-point target 밖으로 effect를 전파하는 것.

**Manual verification steps**

1. `CP-2` activation trace가 profile resolution보다 앞서는지 확인했다.
2. `JT-A/JIP-A`와 `JT-B/JIP-B`가 각 permitted option에 exact match하는지 대조했다.
3. `JI-A/JI-B`의 choice point, option, affected requirement/scope와 reason을 비교했다.
4. Record membership와 criterion path가 derivation 전후 동일한지 확인했다.

**Expected result**

- `JI-A.selected_option=accept_bounded_link`.
- `JI-B.selected_option=require_direct_link`.
- 차이는 `R-link`/`S-link`에만 남으며 final status를 policy가 직접 소유하지 않는다.

**Observed result**

수동 대입에서 하나의 profile-independent active choice point로부터 두 permitted JII가 각각 도출됐다. 기존 link의 permitted treatment만 달랐으며 evidence, scope, path 또는 status payload는 생성되지 않았다.

**Verdict: PASS**

**Notes / unresolved TBD:** 어떤 circumstantial reading이 실제 법률상 허용되는지, choice point를 자동 탐지하는 방법과 actual criterion content는 검증하지 않았다.

### Case 3 — Credibility qualification boundary

**Purpose**

특정 allowed statement/scope의 credibility ambiguity가 해당 boundary 밖의 witness 또는 proposition으로 확장되지 않는지 검증한다.

**Fixture**

- Case `K-3`, allowed statement `E-3`, EvidenceUse `EU-3`, target scope `S-phrase`.
- `C-3/v1`의 `CP-3`은 `E-3`의 특정 inconsistency가 있는 `S-phrase`에만 active다.
- Permitted treatments: `limited_for_scope`, `remain_disputed`.
- Judge A/B의 `credibility_qualification` traits와 `JIP-A3/v1`, `JIP-B3/v1`은 각각 위 option 하나에 valid하게 연결된다.

**Allowed evaluation path**

- Existing inconsistency와 declared option을 `S-phrase`의 credibility qualification에만 적용한다.
- 각 JII는 treatment와 unresolved 여부를 target requirement trace에 기록한다.
- Canonical finding은 bounded requirement resolution 뒤 criterion transition으로만 정한다.

**Forbidden behavior**

- Witness 전체를 truthful 또는 liar로 판정하는 것.
- Failure/dispute로 opposite fact를 생성하는 것.
- `S-phrase` 밖 EvidenceUse 또는 scope의 credibility를 함께 변경하는 것.
- Credibility treatment를 numeric evidence strength로 환산하는 것.

**Manual verification steps**

1. `CP-3` target이 `E-3/S-phrase`로 제한되는지 확인했다.
2. 두 policy가 declared treatment 외의 payload를 갖지 않는지 확인했다.
3. JII 전후 비대상 scope의 credibility/evidence references를 비교했다.
4. Trace에 witness 전체 또는 contrary proposition 판정이 없는지 확인했다.

**Expected result**

- Judge A/B의 차이는 각각 `limited_for_scope`, `remain_disputed` treatment에만 존재한다.
- 비대상 scope와 witness 전체 상태는 변하지 않는다.
- Finding이 필요한 경우 기존 four-state model만 사용하며, status를 trait/policy가 직접 고르지 않는다.

**Observed result**

수동 대입 결과 두 JII는 `E-3/S-phrase`만 참조했고, witness 전체 진실성·opposite fact·scope 외 propagation을 만들지 않았다. 최종 legal sufficiency는 fixture 밖에서 발명하지 않고 criterion-bound requirement resolution에 남겼다.

**Verdict: PASS**

**Notes / unresolved TBD:** 실제 credibility standard, inconsistency classification과 treatment별 법적 효과는 NOT TESTED다.

### Case 4 — No choice / irrelevant trait

**Purpose**

Criterion choice point가 없거나 profile trait domain이 active choice point와 맞지 않으면 profile effect가 발생하지 않는지 검증한다.

**Fixture**

- 4A: Case `K-4A`, complete `C-4A/v1`, record와 profiles는 존재하지만 criterion에 `CriterionChoicePoint`가 없다.
- 4B: Case `K-4B`, `CP-4B.domain=scope_precision`; `JP-4B/v1`에는 `credibility_qualification` trait만 있다.
- 4B-1에는 criterion-declared profile-independent fallback `retain_narrow_scope`가 있다.
- 4B-2에는 fallback이 없고 choice resolution이 requirement 결과에 필요하다.

**Allowed evaluation path**

- 4A는 hard criterion rules만 사용한다.
- 4B는 domain applicability mismatch를 기록한다.
- 4B-1은 오직 criterion-declared fallback을 사용한다.
- 4B-2는 JII 없이 `undetermined`로 중단하고 reason distinctions를 보존한다.

**Forbidden behavior**

- Choice point가 없는데 profile이 ambiguity를 만드는 것.
- `credibility_qualification`을 broad strictness로 재해석해 `scope_precision`에 적용하는 것.
- Default midpoint, random option 또는 임의 favorable option을 사용하는 것.

**Manual verification steps**

1. 4A trace에 choice-point activation과 effective JII가 없는지 확인했다.
2. 4B에서 trait domain과 choice-point domain mismatch를 확인했다.
3. 4B-1 fallback이 criterion 소유인지 확인했다.
4. 4B-2가 `judge_interpretation_mapping_missing`과 `judge_interpretation_fallback_missing`을 status가 아닌 reasons로 보존하는지 확인했다.

**Expected result**

- 4A: profile effect/JII 없음; hard rule 결과 유지.
- 4B-1: declared fallback만 적용; profile guess 없음.
- 4B-2: `undetermined`; no JII; 두 failure reason category 보존.

**Observed result**

수동 대입에서 4A는 profile layer에 진입하지 않았다. 4B-1은 criterion fallback만 사용했고, 4B-2는 unrelated trait를 재해석하지 않은 채 `undetermined`로 끝났으며 mapping/fallback 결여가 별도 reason으로 남았다.

**Verdict: PASS**

**Notes / unresolved TBD:** Canonical fallback content, exact reason aggregation/serialization과 validator implementation은 NOT TESTED다.

### Case 5 — Disguised outcome-switch attack

**Purpose**

Semantic treatment가 없이 결과만 다른 invalid choice point가 genuine ambiguity 또는 judge individuality로 사용되지 않는지 검증한다.

**Fixture**

- Invalid `CP-5A` options: `plaintiff_wins`, `defendant_wins`.
- Invalid `CP-5B` options: `recognized`, `not_established`.
- 두 fixture 모두 target evidence treatment/reason boundary가 없고 party/finding outcome을 직접 payload로 가진다.
- Runtime까지 도달한 것으로 가정하되 detailed static validator는 제공하지 않는다.

**Allowed evaluation path**

- Accepted minimum semantic constraints와 대조해 invalid/rejected candidate로 표시한다.
- Runtime 경계에서는 finding option으로 사용하지 않고 `undetermined`와 explicit validation/TBD reason으로 중단한다.

**Forbidden behavior**

- Profile/trait/policy가 outcome option을 선택하는 것.
- Outcome 이름을 semantic treatment인 것처럼 포장하는 것.
- 결과를 먼저 고른 뒤 trait explanation을 생성하는 것.

**Manual verification steps**

1. Choice point의 target requirement/scope와 semantic treatment 부재를 확인했다.
2. Direct party/finding outcome payload가 Core Accepted constraint를 위반하는지 대조했다.
3. Profile derivation을 실행하지 않고 candidate를 격리했다.
4. Runtime 가정에서 canonical status와 reason/TBD를 분리했다.

**Expected result**

- Genuine ambiguity로 수용하지 않는다.
- Profile은 어떤 option도 선택하지 않는다.
- Invalid/rejected candidate로 남는다.
- Runtime에 도달했다면 `undetermined` + explicit validation/TBD reason이며 fifth status를 만들지 않는다.

**Observed result**

수동 대조에서 두 authoring fixture 모두 direct outcome payload 때문에 invalid였다. JII와 finding option으로 사용하지 않았고, detailed validator를 발명하지 않은 runtime boundary에서는 `undetermined`와 validation/TBD reason만 기록했다.

**Verdict: PASS** *(minimum semantic rejection boundary only)*

**Notes / unresolved TBD:** Detailed static validator, authoring workflow, invalid-content handling pipeline과 exact error vocabulary는 NOT TESTED다.

### Case 6 — Deterministic replay

**Purpose**

동일 semantic inputs가 동일한 JII semantics를 내며 mood, time, hash 또는 random tie-break가 개입하지 않는지 검증한다.

**Fixture**

- Replay `R-6A`, `R-6B`는 동일한 `judge_id`, `JP-6/v3`, `AR-6/v2`, resolved overrides를 사용한다.
- 동일 `C-6/v4`, `CP-6`, `JIP-6/v2`, snapshot `CRS-6`, proposition/scope, EvidenceUse, credibility/lineage/conflict와 command order를 사용한다.
- Execution ID와 observation timestamp만 non-semantic metadata로 다르다.
- Mapping은 정확히 하나의 permitted option을 deterministic하게 선택한다.

**Allowed evaluation path**

- 두 replay의 choice point, selected option, affected scope, trait/policy reason과 JII semantic fields를 비교한다.
- Non-semantic metadata는 semantic equality 판정에서 제외한다.

**Forbidden behavior**

- Mood/personality RNG, current-time branch, hash tie-break 또는 random tie-break.
- Hidden numeric trait score나 probability input.
- Byte-identical serialization을 검증했다고 주장하는 것.

**Manual verification steps**

1. Semantic input 목록을 field-by-field 대조했다.
2. Applicable mapping과 selected permitted option을 두 replay에서 추적했다.
3. Affected scope와 derivation reasons를 비교했다.
4. Random/score/time input이 fixture에 없는지 확인했다.

**Expected result**

- Selected option, affected scope, trait/policy reason과 JII semantics가 동일하다.
- Resulting bounded requirement resolution과 canonical finding semantics도 동일하다.

**Observed result**

두 수동 replay는 동일 mapping, option, scope, reason과 JII semantics를 냈다. Timestamp와 execution ID 차이는 의미 결과에 영향을 주지 않았고 RNG나 hidden score는 사용되지 않았다.

**Verdict: PASS**

**Notes / unresolved TBD:** Byte-identical determinism, serialization, actual runtime RNG instrumentation, save/load와 semantic digest algorithm은 NOT TESTED다.

### Case 7 — Profile version preservation

**Purpose**

Profile evolution이 새 immutable version으로만 표현되고 과거 evaluation을 소급 변경하지 않는지 검증한다.

**Fixture**

- Earlier evaluation `EV-7A`는 `judge_id=J-7`, `JudgeProfileVersion=JP-7/v1`을 참조한다.
- 이후 explicit world-level evolution event `WE-7`가 발생해 `JP-7/v2`를 생성한다.
- Later evaluation `EV-7B`는 `JP-7/v2`를 참조한다.
- 두 evaluation의 record/criterion은 각자 고정하며, profile version 외 결과 조건을 섞지 않는다.

**Allowed evaluation path**

- `EV-7A` trace와 JII가 계속 v1을 참조한다.
- `EV-7B`만 v2를 참조한다.
- v2 차이는 later evaluation에 genuine active choice point가 있을 때만 다른 JII로 이어질 수 있다.

**Forbidden behavior**

- Earlier trace/finding을 v2로 rewrite하는 것.
- 단일 case outcome, win/loss, 특정 litigant interaction 또는 one-off player encounter가 trait를 직접 변경하는 것.
- Profile version change 자체가 hard result를 뒤집는 것.

**Manual verification steps**

1. `EV-7A`의 immutable profile reference를 evolution 전후 비교했다.
2. `WE-7`가 새 version을 만들고 기존 version을 mutate하지 않는지 확인했다.
3. `EV-7B`에서만 v2가 선택되는지 확인했다.
4. Genuine choice point가 없는 hard result fixture에서는 v1/v2가 모두 no-effect인지 확인했다.

**Expected result**

- Earlier evaluation은 v1과 기존 trace/finding을 보존한다.
- Later evaluation만 v2를 사용한다.
- Profile evolution은 hard boundary를 우회하지 않는다.

**Observed result**

수동 version graph에서 `EV-7A→JP-7/v1`, `WE-7→JP-7/v2`, `EV-7B→JP-7/v2` 참조가 분리됐다. 소급 rewrite가 없었고, choice point가 없는 hard result에는 version 차이가 영향을 주지 않았다.

**Verdict: PASS**

**Notes / unresolved TBD:** 실제 evolution trigger/rate, event authoring/validation과 persistence mechanics는 NOT TESTED다. `WE-7`은 explicit injected semantic event다.

### Case 8 — Prestige / reputation non-interference

**Purpose**

Fixed record에서 lawyer reputation 또는 law firm prestige metadata가 JII나 finding을 직접 변경하지 않는지 검증한다.

**Fixture**

- Variant A/B는 judge/profile/archetype/overrides, criterion/choice point/policy, record, proposition/scope, evidence inputs와 command order가 동일하다.
- A/B 사이에는 lawyer reputation과 law firm prestige metadata 값만 다르다.
- Record content나 presentation quality가 달라졌다는 가정은 하지 않는다.

**Allowed evaluation path**

- Evaluation dependency 목록에서 reputation/prestige metadata를 제외한다.
- 동일한 actual record와 applicable mapping으로 동일 JII를 도출한다.

**Forbidden behavior**

- Prestige/reputation을 choice-point activation, trait selector, option selector 또는 probability modifier로 사용하는 것.
- 변경되지 않은 record를 더 명확하거나 더 credible하다고 간주하는 것.

**Manual verification steps**

1. A/B의 accepted semantic evaluation inputs가 동일한지 확인했다.
2. Metadata 차이가 activation/mapping dependency에 들어가지 않는지 확인했다.
3. JII와 canonical finding semantics를 비교했다.

**Expected result**

- A/B의 JII semantics와 finding이 동일하다.
- Prestige/reputation direct effect가 없다.

**Observed result**

수동 대입에서 reputation/prestige metadata는 dependency chain에 진입하지 않았다. 두 variant는 같은 option, JII reason과 finding semantics를 보존했다.

**Verdict: PASS**

**Notes / unresolved TBD:** Reputation UI, public history aggregation과 실제 preparation이 record를 바꾸는 별도 경로는 NOT TESTED다.

### Case 9 — Record-content sensitivity

**Purpose**

Profile이 고정돼도 actual allowed record가 달라지면 evaluation이 달라질 수 있으며 그 원인이 record change로 추적되는지 검증한다.

**Fixture**

- Variant A/B는 동일 judge, `JP-9/v1`, criterion `C-9/v1`과 proposition을 사용한다.
- A는 allowed EvidenceUse `EU-9A`의 existing linkage explanation이 모호하다.
- B는 실제 submitted/received/allowed content로 더 명확한 explanation `EU-9B`가 snapshot에 추가되어 있다.
- Lawyer skill, reputation 또는 prestige는 evaluation modifier로 주입하지 않는다.

**Allowed evaluation path**

- A/B 각각의 snapshot membership과 content linkage를 hard evaluation 및 choice-point activation에서 평가한다.
- B의 결과가 달라지면 `EU-9B`와 changed record condition으로 추적한다.
- Record change 때문에 hard result가 닫히거나 choice point activation/JII가 달라질 수 있다.

**Forbidden behavior**

- 변화를 profile bonus 또는 lawyer-skill bonus로 설명하는 것.
- Unsubmitted/internal WorkProduct를 B의 record content로 간주하는 것.
- Record가 실제로 변하지 않았는데 evaluation input이 변했다고 처리하는 것.

**Manual verification steps**

1. A/B의 유일한 semantic 차이가 allowed record content인지 확인했다.
2. Changed RecordEntry/EvidenceUse에서 requirement와 choice-point activation까지 trace했다.
3. Profile version과 mapping은 고정된 채 record-dependent path만 달라지는지 확인했다.

**Expected result**

- Evaluation, activation, JII 또는 finding은 달라질 수 있다.
- 모든 차이는 allowed record change에서 유래한다.
- Skill/prestige direct effect는 없다.

**Observed result**

수동 대입에서 A/B 차이는 `EU-9B`가 포함된 snapshot과 해당 linkage trace에서만 시작됐다. Profile에는 변화가 없었고, downstream 의미 차이는 record-derived reason으로만 설명됐다.

**Verdict: PASS**

**Notes / unresolved TBD:** 실제 submission quality 생성, admissibility/receipt 처리와 content classification은 NOT TESTED다.

### Case 10 — Archetype + override + explanation trace

**Purpose**

같은 archetype의 두 judge가 explicit bounded override로 genuine ambiguity 안에서만 달라질 수 있고, 실제 derivation trace와 safe public explanation을 보존하는지 검증한다.

**Fixture**

- Judge A/B는 `JudgeArchetypeVersion=AR-10/v1`을 공유한다.
- Judge B는 baseline `inference_linkage=requires_explicit_link`를 상속한다.
- Judge A의 resolved `JP-A10/v2`에는 `inference_linkage=accepts_bounded_circumstantial_link` individual override가 있다.
- Override는 party/case/outcome 조건이 없고 `CP-10/R-link/S-link` applicability만 가진다.
- 동일 record/criterion의 genuine `CP-10`은 `accept_bounded_link`, `require_direct_link`를 permitted options로 선언한다.

**Allowed evaluation path**

- Archetype baseline과 explicit override를 resolved immutable profile versions에서 읽는다.
- Profile-independent `CP-10` activation 후 exact policy mapping으로 bounded JII를 도출한다.
- Internal trace는 다음 dependency를 실제 reference로 보존한다.

```text
Case / Stage
  → CourtRecordSnapshot
    → proposition/scope
      → criterion/version
        → hard-result gate
          → activated CriterionChoicePoint
            → judge_id
              → JudgeProfileVersion
                → JudgeArchetypeVersion
                  → JudgeTrait / override
                    → JudgeInterpretationPolicy/version
                      → permitted options
                        → selected option
                          → JudgeInterpretationInput
                            → affected requirement/scope
                              → requirement resolution
                                → canonical CourtFactFinding
```

**Forbidden behavior**

- Override가 target domain/choice point 밖으로 전파되는 것.
- Archetype 또는 override가 hard result를 변경하는 것.
- Override가 party/case/outcome 조건을 갖는 것.
- Public explanation에 private profile detail, hidden score, ActualStateRecord, unsubmitted evidence 또는 secret probability를 노출하는 것.
- Outcome을 먼저 고른 뒤 explanation을 만드는 것.

**Manual verification steps**

1. 두 resolved profile version이 같은 `AR-10/v1`과 각 baseline/override origin을 보존하는지 확인했다.
2. Hard gate와 `CP-10` activation이 profile resolution보다 앞서는지 확인했다.
3. JII difference가 `R-link/S-link`에만 적용되는지 확인했다.
4. Finding에서 위 dependency를 역추적했다.
5. Internal trace에서 disclosure-safe public explanation을 projection했다.

**Expected result**

- Genuine ambiguity에서 bounded JII difference가 가능하다.
- Target 밖과 hard result는 불변이다.
- Internal trace는 전체 dependency를 보존한다.
- Public explanation은 accessible record, 공개 가능한 judicial history와 실제 derivation reason만 사용한다.

**Observed result**

수동 대입에서 Judge A의 explicit override와 Judge B의 baseline은 같은 `CP-10`의 서로 다른 permitted options에 연결됐고 difference는 `R-link/S-link`에 한정됐다. Hard result와 다른 scopes에는 effect가 없었다. 모든 trace reference를 역추적할 수 있었다.

Player-facing explanation fixture:

> 제출된 자료 사이의 간접 연결은 이 범위에서 허용 가능한 설명으로 받아들였습니다. 이 판단은 해당 범위와 공개된 판단 이유에 한정됩니다.

이 explanation은 accessible record와 actual derivation reason만 사용한다. Private trait key, hidden score, ActualStateRecord, unsubmitted evidence, secret probability 또는 result-first narrative는 포함하지 않는다.

**Verdict: PASS**

**Notes / unresolved TBD:** Archetype catalog, override limits/precedence, disclosure tiers, public-history aggregation과 explanation UI는 NOT TESTED다.

## 4. Cross-case invariant matrix

| invariant | tested in | result | note |
|---|---:|---|---|
| No direct profile effect | 1, 2, 5, 10 | PASS | profile/policy가 status 또는 party outcome을 직접 선택하지 않음 |
| Hard-first gate | 1, 2, 7, 10 | PASS | hard result 뒤에만 ambiguity/profile layer 진입 가능 |
| Genuine ambiguity only | 2, 4, 5, 10 | PASS | criterion-declared active choice point만 사용 |
| No evidence creation | 1, 2, 3 | PASS | JII가 missing EvidenceUse나 link를 생성하지 않음 |
| No scope creation | 1, 2, 3, 10 | PASS | affected scope는 criterion의 existing target으로 제한 |
| No requirement deletion | 1, 2, 5, 7 | PASS | profile/option이 mandatory requirement를 면제하지 않음 |
| No alternative path creation | 2, 5, 10 | PASS | permitted option 집합 밖 path를 만들지 않음 |
| No ActualStateRecord access | 3, 9, 10 | PASS | allowed record와 trace만 fixture input으로 사용 |
| Allowed record only | 1, 2, 3, 9, 10 | PASS | unsubmitted/internal content 제외 |
| No prestige/reputation direct effect | 8, 9 | PASS | fixed record metadata variation은 무효 |
| No hidden numeric weighting | 1, 2, 3, 5, 6, 8 | PASS | qualitative exact mapping만 사용 |
| No judge RNG | 1, 4, 6, 7 | PASS | mood/personality RNG 없음 |
| No random tie-break | 4, 6 | PASS | mapping/fallback 결여는 reason + `undetermined` |
| Deterministic JII | 2, 6, 10 | PASS | 동일 semantic inputs는 동일 JII semantics |
| Profile version preservation | 7, 10 | PASS | past reference immutable, later evaluation만 새 version 사용 |
| Archetype + override boundedness | 10 | PASS | explicit override가 target domain/choice point에 한정 |
| Actual derivation trace | 2, 6, 7, 9, 10 | PASS | result-first explanation이 아닌 실제 dependency 보존 |
| Public/internal explanation separation | 10 | PASS | disclosure-safe projection만 public fixture로 사용 |
| Fact/adjudication separation | 2, 5, 10 | PASS | JII는 requirement input이며 claim outcome을 소유하지 않음 |
| Four canonical CourtFactFinding states preserved | 1, 3, 4, 5, 6, 10 | PASS | fifth status 없음; failure categories는 reasons임 |

## 5. Cross-case findings and contradictions

### 5.1 Preserved invariants

- Hard-sufficient, hard-insufficient와 required rule/input missing은 profile influence보다 먼저 처리됐다.
- Choice-point activation은 profile/party/firm/outcome/prestige와 독립적이었다.
- Trait/policy는 criterion이 선언한 option만 골랐고 JII를 건너뛰어 finding을 직접 변경하지 않았다.
- Evidence, scope, requirement, alternative path 또는 contrary fact를 생성하지 않았다.
- Profile difference는 numeric score, percentage, evidence-type bonus 또는 RNG로 표현되지 않았다.
- Versioned input과 actual trace가 semantic replay 및 explanation의 근거로 남았다.
- JII output은 fact finding chain 안에 머물렀고 claim outcome/final adjudication으로 확대되지 않았다.

### 5.2 Contradictions with DEC-013

**None found.**

10개 fixture는 DEC-013 v0.2의 Accepted/Core Accepted boundary 안에서 수동으로 해석할 수 있었다. Case 5의 PASS는 detailed validator가 완성됐다는 뜻이 아니라 direct outcome payload를 genuine ambiguity로 사용하지 않는 minimum rejection boundary가 유지됐다는 뜻이다. Case 4의 fallback과 Case 7의 evolution event도 구체 정책을 새로 정하지 않고 explicit semantic input으로만 주입했다.

Accepted decision을 reopen해야 할 결과는 발견되지 않았다.

## 6. Remaining TBDs exposed by verification

1. 실제 대한민국 법률상 judicial discretion, evidentiary interpretation과 criterion option content.
2. Canonical trait domain/tendency catalog의 completeness와 향후 domain 확장 content.
3. Trait applicability/specificity와 multiple-match deterministic precedence vocabulary.
4. RecognitionCriterion choice-point authoring language와 activation predicate format.
5. Genuine ambiguity의 detailed static/dynamic validator와 semantic equivalence 판정.
6. Invalid content의 authoring review, rejection 및 runtime handling workflow.
7. JudgeProfile-to-JII derivation의 canonical implementation/API와 exact error representation.
8. Criterion-declared fallback의 actual legal/content policy.
9. JudgeArchetype catalog, individual override limits와 automatic judge generation.
10. Profile evolution trigger/rate/source-event authoring과 validation mechanics.
11. Multi-judge panel, recusal, reassignment와 judge substitution.
12. Disclosure tiers, public history aggregation, observation uncertainty와 explanation UI.
13. Appellate/remand context에서 profile change가 prior finding에 미치는 실제 legal effect.
14. Serialization, save/load, migration, semantic digest와 byte determinism.
15. Judge AI, opponent AI, NLP, performance와 Godot implementation.
16. Judge error, bias, corruption 또는 discipline을 게임에 도입할지 여부.

위 항목은 이 테스트를 통과시키기 위해 확정하지 않았다.

## 7. Decision history

| version | status | 내용 |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-013 v0.2 Accepted의 hard-first, genuine ambiguity, rule-linked trait/policy, explicit JII, bounded resolution, determinism, immutable version, trace/explanation과 adjudication separation을 exactly 10 synthetic cases로 수동 검증. 10 PASS / 0 PARTIAL / 0 FAIL은 structural semantics에 한정되며 implementation 또는 실제 법률 검증이 아님. |

## 8. Not verified by TEST-012

다음 항목은 **NOT TESTED / OUT OF SCOPE**이며 PASS로 표현하지 않는다.

- actual Korean law correctness.
- 실제 judicial discretion 모델의 법적 정확성.
- canonical trait catalog completeness.
- automatic genuine ambiguity detection.
- detailed static validator.
- semantic equivalence algorithm.
- canonical implementation/API.
- Godot/GDScript.
- JSON/save schema.
- UI.
- JudgeProfile generation AI.
- judge AI / opponent AI / NLP.
- multi-judge panel.
- recusal/reassignment.
- appellate/remand legal effects.
- detailed evolution triggers/rates.
- byte-identical determinism.
- performance.
- corruption/bias/error system.
- final adjudication.
- damages/remedy.

## 9. Final verification summary

```text
Total core cases: 10
PASS: 10
PARTIAL: 0
FAIL: 0
```

**Final result: 10 PASS / 0 PARTIAL / 0 FAIL.**

DEC-013 v0.2 Accepted의 J1~J13 architecture는 supplied synthetic semantic fixtures에서 내부적으로 coherent했다. Accepted/Core Accepted decision을 reopen할 필요는 없다. 이 결론은 manual / fixture-level semantic verification에만 해당하며, 위 `Not verified by TEST-012` 범위의 완료를 의미하지 않는다.
