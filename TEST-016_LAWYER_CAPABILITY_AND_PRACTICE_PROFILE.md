# THE FIRM — Lawyer Capability & Practice Profile 수동 검증

문서 ID: TEST-016  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: [DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md](DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md) v0.1 Proposed / design review required  
상위 기준: DEC-LITIGATION-016 v0.1 Proposed / TEST-015 fixture-level verified, DEC-LITIGATION-015 v0.1 Proposed / TEST-014 fixture-level verified, DEC-LITIGATION-013 v0.2 Accepted, DEC-LITIGATION-014 v0.1 Proposed / TEST-013 fixture-level verified

## 1. Purpose / verification boundary

본 테스트는 DEC-LITIGATION-017이 제안한 Lawyer Capability & Practice Profile 구조를 explicit synthetic semantic fixtures에 수동 적용하여 내부 일관성을 검증한다.

검증 대상 causal chain은 다음과 같다.

```text
LegalProfessionalIdentity
→ LawyerRoleProfileVersion
→ CapabilityEntry / Specialization / Experience
→ TaskAssignment
→ execution context
→ LawyerWorkProduct
→ explicit record/procedure-facing materialization
→ existing Litigation evaluation
```

본 테스트는 구현 테스트가 아니다. `Observed`는 실제 코드 실행 결과가 아니라 DEC-017 semantics와 inherited boundaries를 fixture에 적용한 manual / fixture-level verification 결과다.

### 1.1 What this test verifies

- Role-specific immutable/versioned LawyerProfile boundary.
- Qualitative capability bundle and capability-specific semantic dimensions.
- Universal score, boolean-only model and hidden weighted-sum rejection.
- Task assignment, context and actual execution requirements.
- WorkProduct-mediated effect and explicit record/procedure materialization gate.
- Specialization/capability and experience/outcome separation.
- Explicit profile evolution and mentorship no-auto-gain boundary.
- Team contributions without numeric profile summation.
- Capability/workload and capability/reputation separation.
- Internal/player-observed profile separation and historical version preservation.

### 1.2 What this test does not verify

This test does not verify actual Korean attorney practice, capability balance, task-resolution algorithms, WorkProduct quality calculation, investigation/evidence-development rules, litigation implementation, AI, UI, save/load, schema/API or performance.

DEC-017에서 **TBD**인 task combination, WorkProduct resolution, evolution mapping와 workload effects는 이 테스트에서도 **TBD / NOT TESTED**다. Fixture가 task, materialization 또는 evolution rule의 존재를 명시할 때 TEST-016은 그 input을 만드는 algorithm이 아니라 accepted-candidate boundary 안에서의 structural consequence만 검증한다.

## 2. Fixed semantic vocabulary and verification method

| Term | TEST-016 meaning |
|---|---|
| `LawyerRoleProfileVersion` | Stable identity 아래의 role-specific immutable lawyer profile version |
| `CapabilityEntry` | Domain, qualitative meaning, scope, strengths/limitations and provenance/history refs를 갖는 semantic bundle |
| `PracticeSpecializationRef` | Medium-level practice area ref; capability mastery와 별도 |
| `ExperienceHistoryRef` | Performed task, role, stage, area, complexity/depth 등을 가리키는 result-independent history ref |
| `TaskAssignment` | Task/context, assigned lawyer, responsibility scope와 execution inputs를 명시하는 semantic assignment |
| `LawyerWorkProduct` | Actual task output의 completed scope, gaps, characteristics and provenance를 보존하는 semantic artifact |
| `DevelopmentEvent` | Profile evolution review를 열 수 있는 explicit experience/training/mentorship/work event |
| `WorkloadCapacityStateRef` | Stable capability와 별도인 current operational constraint ref |
| `PlayerObservedLawyerProfile` | Accessible provenance에서 projected된 player-known lawyer profile |

### 2.1 Capability is not O/X

```text
can_cross_examine = true
```

Boolean may represent eligibility or availability, but it cannot replace capability depth, scope, strength, limitation and history.

### 2.2 Capability is not a universal 0–100 stat

```text
lawyer_skill = 87
```

```text
analysis = 80
oral = 75
research = 91
overall = 84
```

These cannot be canonical player meaning, universal ranking, hidden weighted outcome formula, judge/finding modifier or success probability. Possible internal implementation numbers remain outside this test.

### 2.3 Capability is a qualitative semantic bundle

```text
domain
qualitative level or tendency
scope / applicability
strengths
limitations
experience / training / mentorship basis
profile version / provenance
```

Proficiency, risk approach and practice familiarity are different semantic dimensions. TEST-016 does not normalize them onto one scale.

### 2.4 Absolute inherited boundary

LawyerProfile/Capability does not directly modify:

- `CriterionChoicePoint` activation or options.
- `JudgeInterpretationInput`.
- Credibility or sufficiency.
- `CourtFactFinding` or final outcome.
- Judge favorability.

Capability does not create evidence, fill missing scope, delete requirements, reveal unavailable information or make private/unsubmitted WorkProduct part of the court record.

## 3. Core verification cases

### Case 1 — Qualitative spectrum representation

#### Purpose

Capability가 number가 아닌 domain-specific qualitative meaning, scope, strength and limitation을 보존할 수 있는지 검증한다.

#### Fixture

```text
capability: cross_examination
level: strong
scope: ordinary fact witness
strength:
- contradiction tracking
limitation:
- limited technical expert-witness experience
basis:
- supplied examination-history refs
```

#### Manual verification

1. Capability domain과 qualitative level을 구분한다.
2. Applicability scope, strength, limitation and history basis가 함께 보존되는지 확인한다.
3. `strong`을 number 또는 outcome multiplier로 변환하는지 검사한다.

#### Expected

- Valid qualitative capability bundle이다.
- Ordinary fact-witness scope와 expert-witness limitation이 함께 남는다.
- `strong = 4`라는 arithmetic meaning은 정의되지 않는다.

#### Observed

DEC-017 LWP2/LWP9의 bundle에 fixture를 수동 대입하면 capability depth와 boundary를 numeric conversion 없이 표현할 수 있었다.

#### Verdict

**PASS**

#### Boundary note

Canonical proficiency vocabulary, ordering and task effect are **TBD / NOT TESTED**다.

### Case 2 — Non-universal capability scales

#### Purpose

Proficiency, style and familiarity가 서로 다른 semantic dimensions로 유지되는지 검증한다.

#### Fixture

```text
legal research: strong
risk style: aggressive
practice familiarity: experienced
```

#### Manual verification

1. 각 label이 proficiency, approach and familiarity 중 어느 dimension인지 확인한다.
2. 서로 산술 비교하거나 one 1–5 scale로 normalize하는지 검사한다.
3. `aggressive`를 higher skill로 해석하는지 검사한다.

#### Expected

- Three values retain distinct semantic dimensions.
- No shared 1–5 conversion, averaging or total score occurs.
- Aggressive is a style, not a proficiency advantage.

#### Observed

LWP3/LWP18의 capability-specific vocabularies를 적용하자 labels를 cross-domain ordering 없이 보존할 수 있었다.

#### Verdict

**PASS**

#### Boundary note

Per-domain canonical vocabularies and validation remain **TBD / NOT TESTED**.

### Case 3 — Different-strength attorney comparison

#### Purpose

Complementary strength profiles에서 context-free overall ranking이 생성되지 않는지 검증한다.

#### Fixture

Lawyer A:

```text
issue analysis: exceptional
oral advocacy: competent
```

Lawyer B:

```text
issue analysis: competent
oral advocacy: exceptional
```

No task is assigned.

#### Manual verification

1. A/B capabilities를 domain별로만 비교한다.
2. Overall score 또는 hidden weighted sum이 있는지 확인한다.
3. Task가 없는데 canonical winner를 선택하는지 검사한다.

#### Expected

- Context 없이 `A > B` 또는 `B > A`라는 canonical overall ordering을 만들 수 없다.
- Explicit analysis or oral task가 supplied되면 task fit만 비교할 수 있다.

#### Observed

LWP8과 no-total-score boundary는 cross-domain ordering을 제공하지 않는다. Missing task-resolution rule을 보충하지 않고 comparison을 non-total-ordered로 유지했다.

#### Verdict

**PASS**

#### Boundary note

Task-fit resolution and tie handling are **TBD / NOT TESTED**.

### Case 4 — Universal 0–100 score rejection

#### Purpose

Single numeric value가 canonical LawyerProfile을 대체할 수 없는지 검증한다.

#### Fixture

```text
lawyer_skill = 87
```

No domain, scope, strengths, limitations or history exist.

#### Manual verification

1. Required semantic bundle information이 있는지 확인한다.
2. `87`이 universal ranking, win strength or judge modifier로 쓰이는지 검사한다.

#### Expected

- Canonical capability profile로 불충분하다.
- 87 cannot act as hidden power stat, probability or outcome strength.

#### Observed

LWP2 and no-universal-score boundary에 따라 fixture는 semantic completeness에 실패했다.

#### Verdict

**PASS**

#### Boundary note

Non-authoritative internal numeric representation의 가능성은 **TBD / NOT TESTED**다.

### Case 5 — Boolean-only rejection

#### Purpose

Eligibility-like boolean이 capability depth를 대체하지 않는지 검증한다.

#### Fixture

```text
can_cross_examine = true
```

#### Manual verification

1. Boolean이 무엇을 표현할 수 있는지 제한한다.
2. Proficiency, scope, style, strengths and limitations을 추론할 수 있는지 검사한다.

#### Expected

- Capability depth representation으로 불충분하다.
- Boolean은 future task eligibility/availability-like state로 사용될 가능성만 있으며 proficiency를 의미하지 않는다.

#### Observed

LWP2의 minimum bundle과 대조하면 `true`만으로 meaningful task contribution을 판정할 수 없다.

#### Verdict

**PASS**

#### Boundary note

Eligibility semantics and task assignment rules are **TBD / NOT TESTED**.

### Case 6 — Direct judge bonus rejection

#### Purpose

Exceptional oral advocacy를 judge acceptance/JII/finding modifier로 사용하는 공격을 거부하는지 검증한다.

#### Fixture

```text
oral_advocacy = exceptional
→ judge acceptance +15%
```

#### Manual verification

1. Capability-to-effect path가 TaskAssignment/WorkProduct를 거치는지 확인한다.
2. CP option, JII, finding and favorability inputs를 변경하는지 검사한다.
3. Hidden percentage를 확인한다.

#### Expected

- Attack is **Forbidden**.
- No JII change, CP option change, finding bonus, judge favorability or hidden success weight.

#### Observed

LWP5와 DEC-013/014 non-interference boundary는 direct percentage path를 허용하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Oral-advocacy task/WorkProduct effects are **TBD / NOT TESTED**.

### Case 7 — WorkProduct-mediated effect

#### Purpose

Lawyer capability effect가 assigned work와 explicit record/procedure materialization을 거쳐서만 litigation에 도달하는지 검증한다.

#### Fixture

- Matching evidence-review capability exists.
- Allowed information exists.
- Evidence-review task is explicitly assigned and executed.
- Lawyer produces `WP-16-07` with an identified actual record issue.
- An existing valid procedure explicitly materializes the relevant change into allowed record/EvidenceUse.

#### Manual verification

1. Profile, assignment, execution and WorkProduct refs를 순서대로 추적한다.
2. WorkProduct가 private state에서 record-facing state로 넘어가는 explicit gate를 확인한다.
3. Downstream evaluation이 changed allowed record를 사용하고 profile을 direct input으로 쓰지 않는지 확인한다.
4. Admissibility/acceptance를 capability가 bypass하는지 검사한다.

#### Expected

- Changed allowed record may affect downstream litigation through existing rules.
- LawyerProfile itself does not change finding.
- WorkProduct does not skip submission/reception/allowance procedures.

#### Observed

Fixture가 valid materialization gate를 explicit input으로 제공했으므로 LWP5/LWP6 causal chain이 완성됐다. Downstream은 changed record만 소비하며 profile bonus는 없다.

#### Verdict

**PASS**

#### Boundary note

What issue is found, WorkProduct quality, admissibility and materialization mechanics are **TBD / NOT TESTED**. This PASS verifies the gate, not its implementation.

### Case 8 — Unassigned capability non-effect

#### Purpose

Firm roster의 exceptional specialist가 task에 배정되지 않았을 때 passive benefit을 주지 않는지 검증한다.

#### Fixture

- Firm roster contains `LP-08`, exceptional cross-examination specialist.
- Witness task `TASK-08` is assigned to another lawyer.
- No support role for `LP-08` exists.

#### Manual verification

1. TaskAssignment owner/support refs를 확인한다.
2. `LP-08` profile이 WorkProduct trace에 들어가는지 검사한다.
3. Firm-wide best-lawyer aura를 검사한다.

#### Expected

- `LP-08` capability has no automatic effect on `TASK-08`.
- No passive case bonus or best-roster substitution.

#### Observed

LWP7/LWP21은 explicit assignment/role을 요구하므로 unassigned profile은 execution chain에 진입하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Delegation, reassignment and informal consultation mechanics are **TBD / NOT TESTED**.

### Case 9 — Specialization / capability separation

#### Purpose

Practice specialization이 related task capabilities를 자동 maximize하지 않는지 검증한다.

#### Fixture

```text
specialization: corporate disputes
document review: strong
cross-examination: developing
```

#### Manual verification

1. Specialization ref와 capability entries를 separate dimensions로 읽는다.
2. Specialization이 cross-examination을 overwrite하는지 검사한다.
3. Differentiated strengths/limitations이 보존되는지 확인한다.

#### Expected

- Valid differentiated profile이다.
- Corporate-disputes label does not make every related capability exceptional.

#### Observed

LWP10/LWP11 structure에서 specialization familiarity와 task capability가 공존하며 neither overwrites the other.

#### Verdict

**PASS**

#### Boundary note

Specialization-task applicability mapping is **TBD / NOT TESTED**.

### Case 10 — Detailed experience tags

#### Purpose

Detailed case histories가 top-level specialization taxonomy를 무한 확장하지 않고 experience를 enrich할 수 있는지 검증한다.

#### Fixture

```text
specialization: corporate disputes
history tags:
- M&A dispute
- shareholder action
- director liability
```

#### Manual verification

1. Medium-level specialization과 detailed tags를 구분한다.
2. Each tag가 automatic specialization/capability가 되는지 검사한다.
3. Tags가 experience provenance/history로 남는지 확인한다.

#### Expected

- Detailed history enriches experience beneath one medium-level specialization.
- Three tags do not create three mandatory top-level specializations or automatic mastery.

#### Observed

LWP10/LWP12 two-layer model은 detailed history를 separate refs로 보존했다.

#### Verdict

**PASS**

#### Boundary note

Canonical specialization and tag taxonomies are **TBD / NOT TESTED**.

### Case 11 — Win-based XP rejection

#### Purpose

Win count가 capability를 직접 mutate하는 XP source가 되지 않는지 검증한다.

#### Fixture

```text
three wins
→ oral_advocacy +1
```

No work-specific DevelopmentEvent or evolution rule is supplied.

#### Manual verification

1. Source가 outcome count인지 actual work/training event인지 분류한다.
2. New profile version prerequisites를 확인한다.
3. Direct capability mutation을 검사한다.

#### Expected

- Attack is invalid.
- Win count does not mutate capability.
- Wins may remain career/reputation history under separate systems.

#### Observed

LWP13/LWP14 forbids outcome-driven skill points, and missing development inputs mean no evolution occurs.

#### Verdict

**PASS**

#### Boundary note

How performed work becomes experience is **TBD / NOT TESTED**.

### Case 12 — Explicit profile evolution

#### Purpose

Explicit work/training event and validated rule이 new immutable LawyerRoleProfileVersion을 만들 수 있는지 검증한다.

#### Fixture

- Repeated actual examination work refs.
- Formal training ref.
- Explicit eligible `DevelopmentEvent DE-12`.
- Applicable validated evolution rule `ER-12/v1`.
- Current profile `LP-12/v1`; proposed new version `LP-12/v2`.
- Exact changed capability content is not supplied.

#### Manual verification

1. Work/training refs, event and rule가 모두 explicit한지 확인한다.
2. v1 in-place mutation 여부를 검사한다.
3. Evolution trace가 old/new refs와 reason을 보존하는지 확인한다.
4. Tester가 exact changed capability를 invent하는지 검사한다.

#### Expected

- New immutable v2 candidate may be created.
- v1 remains preserved.
- Exact profile change remains content-defined/TBD.
- Case count alone does not cause growth.

#### Observed

LWP14 chain의 structural prerequisites가 fixture에 모두 존재해 version transition candidate가 성립했다. Exact capability change는 생성하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Development eligibility, rule validation and changed content are **TBD / NOT TESTED**. PASS는 versioned transition boundary만 검증한다.

### Case 13 — Mentorship auto-gain rejection

#### Purpose

Mentor/mentee relationship alone이 passive capability increase를 만들지 않는지 검증한다.

#### Fixture

- Mentor relationship exists.
- No supervised practice, training, DevelopmentEvent or evolution rule exists.
- Attack attempts `mentor relation → capability increase`.

#### Manual verification

1. Relationship edge와 development inputs를 구분한다.
2. Required event/rule가 missing인지 확인한다.
3. Profile mutation을 검사한다.

#### Expected

- Attack is invalid.
- No capability change or new profile version occurs.

#### Observed

LWP17 requires actual practice/training event and applicable rule. Relationship edge alone did not enter profile evolution.

#### Verdict

**PASS**

#### Boundary note

Mentorship benefits and training mechanics are **TBD / NOT TESTED**.

### Case 14 — Mentorship-supported development

#### Purpose

Mentorship가 actual supervised practice와 explicit development inputs를 동반할 때 bounded evolution candidate의 provenance가 될 수 있는지 검증한다.

#### Fixture

- Explicit mentorship relation.
- Supervised-practice history.
- Explicit training/development event.
- Applicable validated profile-evolution rule.
- Old profile version remains available.

#### Manual verification

1. Relationship 외 required events/rule가 모두 있는지 확인한다.
2. Mentorship edge alone이 result를 소유하는지 검사한다.
3. New immutable version candidate and old-version preservation을 확인한다.
4. Exact skill gain을 tester가 결정하는지 검사한다.

#### Expected

- New profile-version candidate may be structurally valid.
- Relationship alone is not skill source.
- Exact changed capability remains content-defined/TBD.

#### Observed

LWP14/LWP17 chain을 explicit inputs로 만족시켰다. Result는 evolution candidate에서 멈췄고 magnitude/content를 만들지 않았다.

#### Verdict

**PASS**

#### Boundary note

Mentorship causality, effectiveness and evolution mapping are **TBD / NOT TESTED**.

### Case 15 — Team numeric-sum rejection

#### Purpose

Multiple lawyers를 one numeric team power로 더하는 abstraction을 거부하는지 검증한다.

#### Fixture

```text
Lawyer A = 80
Lawyer B = 70
Team = 150
```

No task assignments or WorkProducts exist.

#### Manual verification

1. Individual numbers가 canonical semantic profiles인지 확인한다.
2. Team result가 assignments/contributions를 trace하는지 검사한다.
3. Double-counting and global case-strength behavior를 확인한다.

#### Expected

- Forbidden/invalid as canonical team semantics.
- Team score cannot substitute for task assignment and actual contributions.

#### Observed

LWP20 explicitly rejects profile summation. Fixture lacks every required task/WorkProduct gate.

#### Verdict

**PASS**

#### Boundary note

Team coordination and contribution integration are **TBD / NOT TESTED**.

### Case 16 — Complementary task assignment

#### Purpose

Different lawyers가 distinct assigned tasks와 WorkProducts를 통해 complementary contribution을 표현할 수 있는지 검증한다.

#### Fixture

- Lawyer A is assigned document review.
- Lawyer B is assigned witness examination.
- Each has an applicable separate profile/capability bundle.
- No universal team score is supplied.

#### Manual verification

1. A/B TaskAssignment scopes를 분리한다.
2. Each task가 only its applicable profile refs를 consume하는지 확인한다.
3. WorkProduct outputs가 distinct trace refs를 가질 수 있는지 확인한다.
4. Exact result combination을 tester가 invent하는지 검사한다.

#### Expected

- Each profile contributes only through its assigned task and WorkProduct.
- Profiles do not merge into a team power number.
- How outputs combine downstream remains **TBD**.

#### Observed

LWP20/LWP21의 task-role structure는 two contributions를 distinguish한다. Resolution/combination은 실행하지 않고 future rule boundary에 남겼다.

#### Verdict

**PASS**

#### Boundary note

Task execution and WorkProduct combination are **TBD / NOT TESTED**. PASS는 assignment isolation만 뜻한다.

### Case 17 — Workload constraint

#### Purpose

Stable exceptional capability와 insufficient current workload/capacity를 분리할 수 있는지 검증한다.

#### Fixture

- Applicable capability: exceptional.
- Severe time limitation, other assignments and insufficient capacity are explicit.
- No workload penalty formula or task-resolution rule is supplied.

#### Manual verification

1. Profile capability and current capacity state를 separate refs로 확인한다.
2. Workload가 capability version을 mutate하는지 검사한다.
3. Exceptional label이 complete work를 guarantee하는지 검사한다.
4. Exact penalty percentage를 산출하는지 검사한다.

#### Expected

- Capability remains exceptional.
- Task output may be constrained under future explicit task/WorkProduct rules.
- No permanent downgrade, guaranteed completion or invented percentage.

#### Observed

LWP22/LWP23은 profile and operations state를 분리한다. Missing resolution rule 때문에 output magnitude를 정하지 않았지만 capability guarantee도 허용하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Whether/how much output is constrained is **TBD / NOT TESTED**. PASS는 separation and no-auto-completion boundary만 검증한다.

### Case 18 — Reputation / capability separation

#### Purpose

Public fame와 task-specific actual/observed capability가 서로 다른 상태로 공존 가능한지 검증한다.

#### Fixture

- Public reputation: famous/high visibility.
- Specific task capability: moderate or limited as supplied by authorized internal/observed fixture.
- No adjudicative modifier.

#### Manual verification

1. Reputation and capability provenance/ownership을 분리한다.
2. Fame가 capability entry, WorkProduct result or court evaluation을 upgrade하는지 검사한다.

#### Expected

- Valid mismatch이다.
- Fame does not upgrade capability, JII, finding or outcome.

#### Observed

LWP25와 DEC-016 reputation boundary는 two dimensions를 별도로 유지했다.

#### Verdict

**PASS**

#### Boundary note

Reputation taxonomy, propagation and task-market effects are **TBD / NOT TESTED**.

### Case 19 — Player-observed / internal profile separation

#### Purpose

Player가 accessible sources만으로 bounded LawyerProfile projection을 보고 exact internal capability는 자동으로 알지 못하는지 검증한다.

#### Fixture

- New hire has an internal `LawyerRoleProfileVersion`.
- Player sources: public career history, prior employment, limited observed work and one recommendation source.
- No exact internal-profile disclosure source.

#### Manual verification

1. Each player-facing item의 source/provenance를 확인한다.
2. Observed/inferred and hidden information을 구분한다.
3. Exact internal capability entries가 projection에 copied되는지 검사한다.

#### Expected

- Player profile exposes accessible observations/inferences and unknowns only.
- Exact hidden internal capability entries remain undisclosed.

#### Observed

LWP26 and DEC-016 P5~P8/P24 projection boundary를 적용하면 known items만 표시되고 hidden profile is retained internally.

#### Verdict

**PASS**

#### Boundary note

Inference, recommendation reliability and UI mechanics are **TBD / NOT TESTED**.

### Case 20 — Historical profile-version preservation

#### Purpose

Later profile evolution이 past tasks, WorkProducts and case references를 newest profile로 rewrite하지 않는지 검증한다.

#### Fixture

- Past case/task references `LawyerRoleProfileVersion v1`.
- Later explicit valid development creates v2.
- Historical WorkProduct retains its original provenance.

#### Manual verification

1. Past task/WorkProduct profile ref를 확인한다.
2. New v2가 separate immutable version인지 확인한다.
3. Historical lookup/replay가 v2를 past context에 대입하는지 검사한다.

#### Expected

- Past case/task retains v1 reference.
- Future applicable tasks may use v2.
- No retrospective WorkProduct or case-result rewrite.

#### Observed

LWP14과 DEC-015/016 history boundaries를 적용하면 v1/v2 references가 시간적으로 분리됐다.

#### Verdict

**PASS**

#### Boundary note

Serialization, migration and byte-identical replay are **TBD / NOT TESTED**.

## 4. Additional attack tests

These attacks do not alter the 20-core-case PASS count.

### Attack A — Hidden weighted sum

```text
analysis × 0.4
+ research × 0.2
+ oral × 0.4
= task quality
```

**Result:** **Forbidden / rejected.** DEC-017 does not define numeric operands or weights, and the formula collapses scoped qualitative contributions into hidden arithmetic. TEST-016 does not substitute another formula.

### Attack B — Highest-stat shortcut

```text
task result = highest applicable capability
```

**Result:** **Invalid under DEC-017 alone.** Such semantics would require an explicit future task rule. It cannot be assumed by the test.

### Attack C — Elite lawyer auto-win

```text
exceptional lawyer
→ automatically successful filing/examination
```

**Result:** **Forbidden.** Task, context, information, time/resources, execution, WorkProduct and procedural materialization gates remain required.

### Attack D — Capability creates evidence

```text
excellent investigator
→ missing evidence appears
```

**Result:** **Forbidden.** Investigation may discover/develop material only through a separately defined system. Capability alone cannot create an EvidenceItem, EvidenceUse, source or missing scope.

### Attack E — Style laundering

```text
aggressive style
→ +10% negotiation success
```

```text
aggressive style
→ judge intimidated
```

**Result:** **Forbidden.** Style may influence choices or WorkProduct characteristics only through future explicit rules; it is not a success/JII/finding modifier.

### Attack F — Specialization laundering

```text
IP specialist
→ all IP-related tasks exceptional
```

**Result:** **Invalid.** Specialization and task capabilities are separate dimensions.

### Attack G — Workload as hidden RNG penalty

```text
overloaded
→ random -20% court performance
```

**Result:** **Forbidden.** Workload must constrain actual task execution/output through explicit rules, not evaluation RNG or court-performance percentages.

### Attack H — Reputation laundering

```text
high reputation
→ client confidence
→ judge confidence
→ favorable finding
```

**Result:** **Forbidden.** Intermediate labels do not cure a causal path whose endpoint is an adjudicative reputation modifier.

## 5. Multi-capability resolution pressure test

### Fixture

```text
CrossExaminationTask

witness analysis: exceptional
contradiction tracking: strong
oral advocacy: developing
procedural knowledge: strong
```

### Manual checks

1. Does TEST-016 calculate an average? **No.**
2. Does it create a hidden weakest-link rule? **No.**
3. Does it select the highest capability? **No.**
4. Does it create an overall quality score? **No.**
5. Can it preserve distinct potential strengths/gaps? **Yes, structurally.**

### Expected and observed

DEC-017 LWP19 allows a future task definition to identify relevant capability contributions but does not define how they resolve. The fixture can preserve exceptional witness analysis, strong contradiction tracking/procedure and developing oral advocacy as distinct inputs. No final task result follows from DEC-017 alone.

### Boundary verdict

**PASS — structural separation only.**

`resolution algorithm NOT TESTED / TBD`

This verdict is outside the 20-core-case count and does not accept averaging, weakest-link, highest-skill or weighted-sum semantics.

## 6. WorkProduct semantic pressure test

### Fixture

```text
CrossExaminationPlan

coverage:
- witness statement A: covered
- contradiction B: covered
- technical issue C: missing

sequence:
- coherent

technical preparation:
- incomplete

risk:
- unsupported confrontation remains
```

### Manual checks

1. Covered and missing scopes remain explicit.
2. Sequence and technical preparation remain separate characteristics.
3. Risk is preserved rather than subtracted from a score.
4. TEST-016 does not calculate `quality = 78`.
5. The plan does not become court record without an explicit materialization gate.

### Expected and observed

DEC-017 LWP24 permits a structured qualitative WorkProduct with explicit coverage, gaps, characteristics and risks. The fixture remains intelligible without a global quality score. Exact adequacy, downstream effect and record materialization are not determined.

### Boundary verdict

**PASS — structural representation only.**

`WorkProduct resolution NOT TESTED / TBD`

This verdict is outside the 20-core-case count.

## 7. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Role-specific LawyerProfile | 2, 19, 20 | PASS | No universal cross-role profile |
| Immutable/versioned profile | 12, 20 | PASS | v1 preserved; v2 separate |
| Qualitative capability semantics | 1, 2, 4, 5 | PASS | Bundle rather than total number |
| Non-universal scales | 1, 2, 3 | PASS | Proficiency/style/familiarity remain distinct |
| Capability scope/context/history | 1, 7, 9, 10 | PASS | Applicability and basis preserved |
| No universal lawyer score | 3, 4, 15 | PASS | No overall ordering or team power |
| No direct JII effect | 6, 7, 18 | PASS | Capability/reputation never enters JII |
| No direct finding effect | 6, 7, 18 | PASS | Changed record only after gate |
| Task assignment required | 7, 8, 16 | PASS | Unassigned capability has no effect |
| WorkProduct mediation | 7, 16, 17 | PASS | Actual task output required |
| Explicit record/procedure materialization | 7, 20 | PASS | Private WorkProduct is not court input |
| Specialization/capability separation | 9, 10 | PASS | Practice label does not overwrite skills |
| Experience ≠ outcome count | 10, 11, 12 | PASS | History and wins remain separate |
| No win-based XP | 11, 12 | PASS | Outcome attack rejected |
| Explicit profile evolution | 12, 14, 20 | PASS | Event/rule and immutable new version |
| Mentorship no-auto-gain | 13, 14 | PASS | Relationship alone is insufficient |
| No team numeric sum | 15, 16 | PASS | Team contributions remain task-specific |
| Task-specific team contributions | 8, 16 | PASS | Assigned profiles remain separate |
| Workload/capability separation | 17 | PASS | Operational constraint does not mutate profile |
| Resource/time constraints | 7, 17 | PASS | Capability does not guarantee execution |
| Reputation/capability separation | 18 | PASS | Fame does not upgrade task skill |
| Internal/player-observed separation | 19 | PASS | Source-backed projection only |
| Major/ordinary semantic equality | 1–20 boundary | PASS | No test uses origin as power; inherited structure preserved |
| Historical version preservation | 12, 20 | PASS | No retrospective rewrite |

## 8. Contradiction review

### 8.1 DEC-017 internal contradiction

**None found in the supplied fixtures.** Capability-specific qualitative profiles, task assignment, WorkProduct mediation and immutable evolution coexist without a total score. Task resolution remains intentionally open rather than being silently inferred.

### 8.2 DEC-016 role-profile/information boundary

**No intrusion found.** LawyerProfile remains role-specific under stable identity, reputation is separate, and player-observed information exposes only source-backed projection.

### 8.3 DEC-015 evolution/version boundary

**No intrusion found.** Development uses explicit event/rule and new immutable version; past versions and tasks remain preserved.

### 8.4 DEC-013 JII/finding boundary

**No intrusion found.** Capability, style and reputation never directly affect JII, judge acceptance or finding.

### 8.5 DEC-014 ChoicePoint boundary

**No intrusion found.** No capability creates/activates a ChoicePoint, changes options, creates evidence/scope/requirement or bypasses allowed-record gates.

### 8.6 Hidden numeric-score review

**No hidden score introduced.** `strong`, `exceptional` and other labels remain semantic vocabulary. They were not mapped to numbers, averaged or weighted.

### 8.7 Capability-specific scale normalization

**No normalization found.** Proficiency, style and familiarity retain separate dimensions.

### 8.8 Specialization overwrite

**No overwrite found.** Cases 9/10 preserve specialization, capability and detailed history as separate refs.

### 8.9 Experience as win/loss XP

**No conversion found.** Win-based attack is rejected; development requires actual work/training event and rule.

### 8.10 Mentorship as passive buff

**No passive buff found.** Relationship alone has no effect; supported development requires additional explicit inputs.

### 8.11 Aggregate team power

**No aggregate power found.** Numeric sum is rejected; complementary team remains task-scoped.

### 8.12 Workload mutating capability

**No mutation found.** Workload/capacity is separate current operational state.

### 8.13 WorkProduct bypassing procedure

**No bypass found.** Only Case 7 reaches the allowed record, because valid materialization is supplied explicitly. Other WorkProducts remain internal/task artifacts.

### 8.14 Capability creating evidence/information

**No creation found.** Capability cannot conjure evidence, missing scope or inaccessible information.

### 8.15 Exact internal-profile disclosure

**No leak found.** Case 19 uses only accessible sources and unknowns.

### 8.16 Historical version rewrite

**No rewrite found.** Past tasks retain v1 after v2 exists.

### 8.17 DEC-018 resolution leakage

**No resolution algorithm was fixed.** Multi-capability combination and WorkProduct adequacy explicitly remain `NOT TESTED / TBD`.

### 8.18 TBD closure

**No TBD was promoted by testing.** Explicit fixture inputs establish only boundary conditions; missing rules were not supplied by the tester.

## 9. False-PASS audit

Every PASS was challenged with:

```text
이 PASS는 DEC-017이 실제로 정의한 semantic boundary 때문에 가능한가?

아니면 tester가 missing task/WorkProduct/evolution rule을
임의로 보충했기 때문에 가능한가?
```

| Case | False-PASS attack | Result |
|---:|---|---|
| 1 | Does `strong` secretly mean 4? | No. No numeric mapping used. |
| 2 | Did tester normalize all vocabularies? | No. Dimensions remain distinct. |
| 3 | Did tester invent task weights to rank A/B? | No. No overall ranking issued. |
| 4 | Did rejection ban all implementation numbers? | No. Only canonical/outcome use rejected; implementation remains TBD. |
| 5 | Did tester define boolean eligibility rules? | No. Only insufficiency for depth verified. |
| 6 | Did tester replace +15% with another hidden bonus? | No. Direct path rejected entirely. |
| 7 | Did tester invent the materialization procedure? | No. Valid existing procedure is an explicit fixture input; its mechanics are untested. |
| 8 | Did tester infer informal support? | No. No assignment means no effect. |
| 9 | Did tester define specialization-task mapping? | No. Separation only. |
| 10 | Did tags create automatic capability? | No. History only. |
| 11 | Did tester invent alternative XP? | No. Attack rejected; development remains TBD. |
| 12 | Did tester choose the capability change? | No. Only immutable version candidate accepted. |
| 13 | Did tester deny all future mentorship effects? | No. Only relationship-alone effect rejected. |
| 14 | Did tester calculate mentorship benefit? | No. Explicit event/rule allows candidate only; content TBD. |
| 15 | Did tester substitute another team formula? | No. Numeric sum rejected without replacement. |
| 16 | Did tester resolve/merge WorkProducts? | No. Assignment isolation only; combination TBD. |
| 17 | Did tester invent workload penalty? | No. Capability/capacity separation only; output magnitude TBD. |
| 18 | Did tester define reputation effects? | No. Separation and no adjudicative upgrade only. |
| 19 | Did tester infer exact hidden capability? | No. Projection is source-bounded. |
| 20 | Did tester recompute past work with v2? | No. Contemporaneous v1 preserved. |

The multi-capability and WorkProduct pressure tests also avoid false PASS: both verdicts are explicitly structural, excluded from core counts and paired with `resolution NOT TESTED / TBD`.

## 10. Remaining TBD / NOT TESTED

The following are not verified and are not included as PASS claims:

- Canonical LawyerProfile capability catalog.
- Capability-specific vocabulary and ordering.
- Internal numeric representation, if any.
- Task taxonomy.
- Task-resolution rules.
- Multi-capability combination algorithm.
- WorkProduct taxonomy.
- WorkProduct quality/resolution and combination.
- Investigation mechanics.
- Evidence-development mechanics.
- Legal-research mechanics.
- Direct/cross-examination mechanics.
- Drafting/written-advocacy mechanics.
- Oral-advocacy/hearing mechanics.
- Negotiation/settlement mechanics.
- Client-communication mechanics.
- Specialization taxonomy.
- Experience-tag taxonomy.
- Development/evolution mapping and validation.
- Training mechanics.
- Mentorship/supervision mechanics.
- Workload/capacity model.
- Fatigue/burnout.
- Decline/atrophy and plateau.
- Team coordination and WorkProduct integration.
- Lead/support role catalog and assignment.
- Hiring/compensation/employment mechanics.
- Reputation propagation.
- Capability disclosure/inference and source reliability.
- NPC lawyer AI.
- Player progression.
- Canonical schema/API/save/migration.
- Godot/GDScript implementation.
- Balancing/performance.
- Actual Korean attorney practice/procedure.

## 11. Final verification summary

```text
Total core cases: 20
PASS: 20
PARTIAL: 0
FAIL: 0
```

**Final result: 20 PASS / 0 PARTIAL / 0 FAIL.**

- DEC-017 v0.1을 reopen해야 하는 contradiction: **없음**.
- 문제가 확인된 LWP decision: **없음**.
- DEC-013 JII/finding boundary 침범: **없음**.
- DEC-014 ChoicePoint boundary 침범: **없음**.
- DEC-015 identity/evolution/version-history boundary 침범: **없음**.
- DEC-016 role-profile/information/reputation boundary 침범: **없음**.
- DEC-018로 넘기기 전에 반드시 고쳐야 할 fixture-level 문제: **없음**.
- Fixture-level verification 기준으로 DEC-017의 향후 Accepted 승격을 막는 문제: **없음**.

The 20 PASS result does not accept a task-resolution algorithm. Multi-capability combination, WorkProduct quality, evolution content and operational mechanics remain explicitly **TBD / NOT TESTED**. It also does not automatically change DEC-017 status or claim implementation/actual Korean-practice correctness.
