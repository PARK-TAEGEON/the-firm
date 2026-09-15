# THE FIRM — Investigation and Evidence Acquisition

문서 ID: DEC-LITIGATION-021  
버전: v0.2 — Accepted  
상태: **Accepted**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 기준: `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `TEST-019_EVIDENCE_REVIEW.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `TEST-018_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `TEST-017_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `TEST-016_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`, `DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md`, `DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md`, `DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md`  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose / non-goals

이 문서는 아직 Case File에 없는 source, witness, document, record 또는 information을 legitimate, bounded, provenance-bearing Investigation Tasks를 통해 탐색·요청·획득하는 최소 semantic model을 제안한다.

```text
KnownGap / Hypothesis / Issue / Existing Source / Player Direction
+ InvestigationTaskDefinition + TaskAssignment
+ Investigator/RoleProfileVersion + authorized CaseFileState snapshot
+ available Leads + time/resources/capacity + dependencies/direction
+ materialized TaskExecutionEvents
→ Investigation execution
→ InvestigationWorkProduct
→ Lead / failed lead / attempt / acquired SourceMaterial
→ provenance-bearing Case File update
```

```text
Investigation ≠ Evidence Review
exists in world ≠ discoverable ≠ discovered ≠ accessible ≠ acquired ≠ reviewed
acquired source ≠ truth ≠ admissible/CourtRecord
```

이 문서는 exact search/discovery/acquisition algorithms, probabilities, Korean compulsory-process powers, witness interview semantics, UI, AI, schema/API/save 또는 Godot implementation을 확정하지 않는다.

## 2. Inherited hard boundaries

- `ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`.
- ActualStateRecord는 hidden world authority일 수 있으나 Investigation Task가 사용하는 omniscient query API가 아니다.
- Unknown unknown은 legitimate discovery chain 전 player-facing node/count로 나타나지 않는다.
- DEC-020 Evidence Review는 acquired/authorized SourceMaterial만 분석한다. Investigation이 source를 얻어도 contents는 자동으로 reviewed/understood되지 않는다.
- Source/statement/Lead/analysis는 truth가 아니며 `RecordedExtraction`/ProfessionalAnalysis는 별도 Evidence Review output이다.
- InvestigationWorkProduct는 Case File knowledge를 update할 수 있지만 CourtRecord/JII/ChoicePoint/finding/outcome을 직접 변경하지 않는다.
- Direct/delegated Tasks, component capabilities, deterministic clear cases, materialized bounded variability, no reload reroll과 immutable history를 상속한다.

## 3. Core discovery distinctions

| Stage | Minimum meaning | Does not imply |
|---|---|---|
| World existence | Hidden world contains source/person/item | Discoverability |
| Discoverable | Current world-facing rule could expose it from valid basis/domain | Actually discovered |
| Discovered | Firm learns existence/reference | Access |
| Accessible | A valid route permits request/retrieval attempt | Acquisition |
| Acquired | Firm receives all/part of SourceMaterial | Review, truth, admissibility |
| Reviewed | Evidence Review inspected acquired input | Correct understanding/finding |

이 단계는 hidden completion ladder나 player-visible world index가 아니다. Player는 legitimate history가 도달한 단계만 본다.

## 4. Starting basis and bounded search domain

Investigation Task는 하나 이상의 explicit starting basis를 가진다: KnownGap, Hypothesis, Issue, Source/Assertion ref, Person/Organization, location/account/identifier, existing Lead 또는 player direction. Direction만으로 hidden answer를 이름 붙이는 것은 valid basis가 아니다.

TaskDefinition은 public registry, client-accessible records, known contact W3, referenced account using acquired identifier 등 bounded domain/action을 선언해야 한다. `Search everything everywhere` 또는 `find the best hidden clue`는 invalid다.

## 5. Lead semantic model

`Lead`는 further investigation을 어디로 향하게 할 수 있는지를 나타내는 provenance-bearing indication이다.

```text
Lead
├─ origin/source/assertion/interaction ref
├─ subject/identifier/location/domain
├─ suggested action or follow-up scope
├─ learned time / status / limitations
└─ history / related Task refs
```

Lead는 SourceMaterial, evidence, witness statement, truth 또는 correct-path marker가 아니다. Person name, organization, email, number, address, referenced attachment/meeting, intermediary, registry category 또는 “P7 may know” 같은 assertion에서 생길 수 있다.

## 6. Unknown unknown discovery

```text
Unknown unknown
→ legitimate bounded action/interaction
→ materialized result
→ discovered Lead/source-existence ref
→ known candidate
```

예를 들어 W3 interaction이 P7을 언급하면 그 시점부터 P7 Lead가 생성될 수 있다. 그 전에는 `Unknown Witness ???` 또는 remaining-witness count가 없다. 이 chain은 unrelated hidden sources를 동시에 reveal하지 않는다.

## 7. Actions, results and acquisition states

ActionAttempt와 Result를 분리한다.

```text
contact W3 → no response
request D4 → refused / pending / partial / acquired
search Registry R with identifier X → no match / Lead R7
```

Conceptual result/status candidates에는 discovered, requestable, requested, pending, refused, unavailable, destroyed, acquired, partially acquired, wrong target, dead end가 있다. Exact vocabulary는 TBD다.

새 SourceMaterial은 discovery chain, requester/acquirer, provider/location, learned/acquired time, source version, acquisition route/category, Task/Lead refs와 limitations를 보존해야 한다. Provenance는 admissibility가 아니다.

## 8. Failure, false leads and bounded negatives

No useful result, wrong/false lead, dead end, refusal, unavailable/destroyed source, insufficient identifier, unsuccessful contact, pending/partial acquisition은 정상 structured outputs다. Later success가 earlier failure를 지우지 않는다.

```text
No match in Registry R using query Q at T
≠ target does not exist anywhere
```

Search domain이 proposition에 exhaustive하다는 별도 authoritative rule이 없는 한 global absence를 추론하지 않는다. 이 DEC는 그런 rule을 발명하지 않는다.

## 9. Capability, uncertainty and materialized events

Document tracing, interviewing, factual analysis, specialization과 procedural knowledge는 source-location, lead elicitation/prioritization, specialist-path recognition, acquisition-route selection 같은 components에 기여할 수 있다. Exact mappings are TBD.

No universal `InvestigationScore`, weighted sum, highest/weakest shortcut 또는 `skill 82 → 82% discovery`가 없다. Clear results are deterministic. Explicit Task rule이 genuinely borderline variation을 허용할 때만 event를 한 번 materialize하고 same save/replay에서 재사용한다. Reload는 reroll이 아니다.

## 10. Integration boundaries

```text
Investigation
→ SourceMaterial acquired with provenance
→ Case File source node: unreviewed
→ separate Evidence Review Task
→ RecordedExtraction / SourceAssertion / ProfessionalAnalysis
```

Witness discovery, contact, interview, Statement도 분리한다. Client가 source 존재를 말하는 것, 제공하는 것, source가 X를 말하는 것과 X가 true인 것은 모두 별개다. Publicly accessible data도 correct domain/identifier/action 없이 자동으로 알려지지 않는다.

### 10.1 Investigation target families

Illustrative target families include document/source tracing, witness/contact discovery, public-record search, client-provided or organization-held record requests, timeline lead search, financial or digital-reference tracing, location/entity search, and follow-up on an Evidence Review `KnownGap`. This is not a canonical catalog. A target family does not determine discoverability, authority, access, relevance or outcome by itself.

### 10.2 Acquisition-route boundary

Possible generic route categories may include voluntary request, internal/client-authorized access, public-information access, third-party request, formal legal/procedural request and court-backed process. They are interface candidates only. Each route must be explicitly available under later content/rules; DEC-021 does not infer a power from a desired source or invent subpoena-like or other Korean compulsory-process authority.

### 10.3 Direct and delegated execution

Player-direct and delegated Investigation use the same `InvestigationTaskDefinition`, bounded basis/domain, ActionAttempt/Result semantics and `InvestigationWorkProduct` ontology. Direct play may provide explicit choices of Lead, contact, query identifier, request, stopping point and resources. Delegated work substitutes explicit NPC direction/execution inputs, not a hidden success percentage or random-clue engine. Exact UI, minigame and NPC AI remain TBD.

### 10.4 Stop conditions

An Investigation Task may stop because its declared objective was reached, a source was acquired, no viable Lead remains, time or budget was exhausted, access was refused, the player stopped it, assigned scope was exhausted, a dependency is required, or a material follow-up Task was created. These are semantic candidates rather than a canonical completion vocabulary. Stopping does not imply exhaustive search, target nonexistence or failure, and exact completion rules remain TBD.

## 11. InvestigationWorkProduct reference model

Illustrative semantic reference only:

```text
InvestigationWorkProduct
├─ Task / assignment / performer/profile refs
├─ purpose and starting basis / Lead refs
├─ authorized search domain
├─ actions attempted
├─ materialized investigation events
├─ discovered Leads / source-existence refs
├─ acquisition attempts and acquired SourceMaterial refs
├─ failed / blocked / pending / partial attempts
├─ false / weak / unresolved Leads
├─ KnownGaps and follow-up Task candidates
├─ limitations / risks
└─ provenance / version / history
```

No universal `InvestigationQuality` owns semantics.

## 12. Design decisions

### INV1 — Investigation as explicit Task family
**Problem:** world search를 implicit case action으로 둘 것인가?  
**Alternatives:** global search; explicit InvestigationTask/WorkProduct.  
**Failure modes:** global search는 scope, cost, actor와 provenance를 숨긴다.  
**Recommendation:** Investigation을 explicit Task family로 둔다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018의 work-unit semantics를 확장한다.

### INV2 — Investigation ≠ Evidence Review
**Problem:** acquisition과 acquired-source analysis를 합칠 것인가?  
**Alternatives:** one task; separate Investigation and Review.  
**Failure modes:** acquisition이 auto-understanding/truth가 된다.  
**Recommendation:** separate Tasks/WorkProducts.  
**Status:** **Core Accepted candidate**  
**Reason:** input authority와 epistemic outputs가 다르다.

### INV3 — No direct ActualStateRecord query
**Problem:** hidden world index에서 clue를 고를 수 있는가?  
**Alternatives:** omniscient query; world-facing bounded mechanisms.  
**Failure modes:** unknown unknown과 player knowledge가 붕괴한다.  
**Recommendation:** Task execution의 ActualStateRecord query를 금지한다.  
**Status:** **Core Accepted candidate**  
**Reason:** world authority와 agent knowledge를 분리한다.

### INV4 — Explicit starting basis
**Problem:** 아무 근거 없이 secret target을 지정할 수 있는가?  
**Alternatives:** arbitrary hidden target; KnownGap/Hypothesis/Issue/source/person/identifier/Lead/direction basis.  
**Failure modes:** answer-key prompt가 discovery를 대체한다.  
**Recommendation:** at least one explicit known basis is required.  
**Status:** **Core Accepted candidate**  
**Reason:** every search has provenance.

### INV5 — Bounded search domain
**Problem:** Task가 whole world를 검색하는가?  
**Alternatives:** unlimited; explicit domain/action/scope.  
**Failure modes:** unlimited search is omniscience.  
**Recommendation:** TaskDefinition declares bounded domain.  
**Status:** **Core Accepted candidate**  
**Reason:** authorization and failure meaning become traceable.

### INV6 — Lead as provenance-bearing direction
**Problem:** investigation direction을 어떻게 표현하는가?  
**Alternatives:** hidden correct-path flag; provenance-bearing Lead.  
**Failure modes:** correct-path flag leaks answer.  
**Recommendation:** Lead stores origin, subject/identifier, potential action, time/status.  
**Status:** **Core Accepted candidate**  
**Reason:** follow-up chain without truth promotion.

### INV7 — Lead ≠ truth/source
**Problem:** Lead가 evidence 또는 verified relevance인가?  
**Alternatives:** yes; no, direction only.  
**Failure modes:** false leads become impossible.  
**Recommendation:** Lead is neither SourceMaterial nor truth.  
**Status:** **Core Accepted candidate**  
**Reason:** fallible investigation.

### INV8 — Unknown unknown via legitimate interaction only
**Problem:** hidden entity가 언제 known이 되는가?  
**Alternatives:** pre-created placeholder; legitimate action/event discovery.  
**Failure modes:** placeholder leaks existence/count.  
**Recommendation:** materialized discovery creates the first known ref.  
**Status:** **Core Accepted candidate**  
**Reason:** gradual epistemic expansion.

### INV9 — Discovery ≠ accessibility
**Problem:** existence knowledge가 access를 보장하는가?  
**Alternatives:** auto-access; separate accessibility state/route.  
**Failure modes:** refusal/legal/operational barriers vanish.  
**Recommendation:** keep separate.  
**Status:** **Core Accepted candidate**  
**Reason:** meaningful request/acquisition phase.

### INV10 — Accessibility ≠ acquisition
**Problem:** possible route가 possession을 뜻하는가?  
**Alternatives:** auto-acquire; explicit attempt/result.  
**Failure modes:** cooperation/refusal/pending states disappear.  
**Recommendation:** acquisition requires action and result.  
**Status:** **Core Accepted candidate**  
**Reason:** outcome provenance.

### INV11 — Acquisition ≠ review
**Problem:** newly received source contents가 자동 이해되는가?  
**Alternatives:** auto-review; unreviewed SourceMaterial then Evidence Review.  
**Failure modes:** Investigation leaks Review semantics.  
**Recommendation:** acquired source enters unreviewed.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-020 boundary.

### INV12 — Acquisition provenance
**Problem:** source가 Case File에 이유 없이 나타날 수 있는가?  
**Alternatives:** bare node; discovery/acquisition chain.  
**Failure modes:** authenticity/history/explainability lost.  
**Recommendation:** who/how/from where/when/version/Task/Lead/limits refs.  
**Status:** **Core Accepted candidate**  
**Reason:** auditable knowledge growth.

### INV13 — Structured failed investigation
**Problem:** failure를 boolean/no-output로 둘 것인가?  
**Alternatives:** fail; structured no-result/refusal/pending/partial etc.  
**Failure modes:** useful operational knowledge disappears.  
**Recommendation:** preserve bounded result and cause.  
**Status:** **Core Accepted candidate**  
**Reason:** failures inform future choices.

### INV14 — False Leads allowed
**Problem:** every Lead is useful/correct인가?  
**Alternatives:** guaranteed relevance; false/weak/dead Leads.  
**Failure modes:** investigation becomes guided answer path.  
**Recommendation:** false leads are normal state.  
**Status:** **Core Accepted candidate**  
**Reason:** Lead ≠ truth.

### INV15 — No result ≠ world absence
**Problem:** search failure가 global nonexistence인가?  
**Alternatives:** yes; domain/query/time-bounded negative result.  
**Failure modes:** incomplete search becomes world oracle.  
**Recommendation:** record bounded negative only.  
**Status:** **Core Accepted candidate**  
**Reason:** search scope matters.

### INV16 — Bounded negative information
**Problem:** negative result를 어떻게 저장하는가?  
**Alternatives:** global assertion; exact searched domain/query/time/result.  
**Failure modes:** overclaiming absence.  
**Recommendation:** latter only.  
**Status:** **Core Accepted candidate**  
**Reason:** provenance-bearing uncertainty.

### INV17 — Investigator may miss discoverable info
**Problem:** bounded search가 exhaustive인가?  
**Alternatives:** always finds; may miss due to scope/context/constraints.  
**Failure modes:** investigation becomes deterministic omniscience.  
**Recommendation:** misses are valid; exact mechanics TBD.  
**Status:** **Accepted candidate**  
**Reason:** capability/action does not guarantee result.

### INV18 — No universal InvestigationScore
**Problem:** one score owns success인가?  
**Alternatives:** score; structured Task/WorkProduct.  
**Failure modes:** scope/leads/actions/results vanish.  
**Recommendation:** no canonical total score.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-017/018.

### INV19 — Component capability contribution
**Problem:** capabilities contribute how?  
**Alternatives:** total skill; task-declared components.  
**Failure modes:** universal success roll.  
**Recommendation:** map to source tracing/interview/priority/path components.  
**Status:** **Core Accepted candidate**  
**Reason:** explainable strengths/gaps.

### INV20 — No hidden weighted sum
**Problem:** multiple capabilities를 합산하는가?  
**Alternatives:** weighted/highest/weakest shortcuts; structured components.  
**Failure modes:** opaque result formula.  
**Recommendation:** default weighted sum forbidden.  
**Status:** **Core Accepted candidate**  
**Reason:** exact resolution remains task-specific.

### INV21 — ActionAttempt ≠ Result
**Problem:** action이 success를 보장하는가?  
**Alternatives:** yes; attempt plus separate result.  
**Failure modes:** refusal/no response/dead end impossible.  
**Recommendation:** separate semantic layers.  
**Status:** **Core Accepted candidate**  
**Reason:** causal trace.

### INV22 — Materialized uncertainty events
**Problem:** borderline result가 언제 정해지는가?  
**Alternatives:** reroll anytime; one explicit event.  
**Failure modes:** save-scum and unexplained randomness.  
**Recommendation:** bounded event materializes once.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018 determinism.

### INV23 — No reload reroll
**Problem:** reload가 event를 바꾸는가?  
**Alternatives:** reroll; reuse stored event.  
**Failure modes:** state instability.  
**Recommendation:** same event/history yields same result.  
**Status:** **Core Accepted candidate**  
**Reason:** replayability.

### INV24 — Lead-chain provenance
**Problem:** discovered knowledge가 teleport할 수 있는가?  
**Alternatives:** anonymous clue; source→Lead→Task→event→result chain.  
**Failure modes:** hidden-world leakage.  
**Recommendation:** preserve full chain.  
**Status:** **Core Accepted candidate**  
**Reason:** why/how known remains visible.

### INV25 — Lead branching
**Problem:** one Task가 multiple Leads를 만들 수 있는가?  
**Alternatives:** single correct Lead; multiple optional branches.  
**Failure modes:** correct-path railroading.  
**Recommendation:** multiple Leads with independent status/provenance.  
**Status:** **Accepted candidate**  
**Reason:** player prioritization.

### INV26 — Explicit follow-up scope expansion
**Problem:** new Lead가 current Task를 무한 확장하는가?  
**Alternatives:** recursive whole-world search; follow-up Task candidate.  
**Failure modes:** scope/cost boundaries vanish.  
**Recommendation:** material expansion creates explicit follow-up Task.  
**Status:** **Core Accepted candidate**  
**Reason:** bounded execution.

### INV27 — Witness stages separate
**Problem:** discovered person이 곧 testimony인가?  
**Alternatives:** collapse; discovery/contact/interview/Statement stages.  
**Failure modes:** witness content fabricated.  
**Recommendation:** stages remain distinct.  
**Status:** **Core Accepted candidate**  
**Reason:** future witness model compatibility.

### INV28 — Investigation→acquisition→review chain
**Problem:** acquisition이 contents를 분석하는가?  
**Alternatives:** auto-understand; separate Review Task.  
**Failure modes:** source assertion/analysis fabricated.  
**Recommendation:** acquired source begins unreviewed.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-020 Accepted boundary.

### INV29 — Direct/delegated same ontology
**Problem:** NPC uses hidden discovery percentage인가?  
**Alternatives:** separate engine; shared Task/WorkProduct/events.  
**Failure modes:** opaque cheating.  
**Recommendation:** same ontology and authorization.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018.

### INV30 — Public ≠ automatically discovered
**Problem:** public database content가 자동 knowledge인가?  
**Alternatives:** global public omniscience; correct domain/identifier/action.  
**Failure modes:** search gameplay/provenance disappear.  
**Recommendation:** explicit search required.  
**Status:** **Core Accepted candidate**  
**Reason:** accessibility differs from discovery.

### INV31 — Time/resources constrain execution
**Problem:** infinite Leads를 free로 pursue하는가?  
**Alternatives:** unlimited; explicit allocation and unpursued Leads.  
**Failure modes:** prioritization meaningless.  
**Recommendation:** constraints affect breadth/attempts, formulas TBD.  
**Status:** **Accepted candidate**  
**Reason:** scalable gameplay.

### INV32 — Duplicate discovery preserves provenance
**Problem:** same person/source via two paths가 하나를 지우는가?  
**Alternatives:** overwrite; relate while preserving origins.  
**Failure modes:** discovery history lost.  
**Recommendation:** keep both chains; entity resolution TBD.  
**Status:** **Core Accepted candidate**  
**Reason:** auditability.

### INV33 — Investigation history preserved
**Problem:** later success가 prior failures를 지우는가?  
**Alternatives:** latest-only; immutable attempt history.  
**Failure modes:** past choices/replay corrupted.  
**Recommendation:** all attempts/responses/retries/source versions retained.  
**Status:** **Core Accepted candidate**  
**Reason:** world chronology and causality.

### INV34 — Acquired ≠ admissible/CourtRecord
**Problem:** possession이 court input인가?  
**Alternatives:** auto-admit; separate procedural materialization.  
**Failure modes:** procedure bypass.  
**Recommendation:** acquisition only adds firm-held SourceMaterial.  
**Status:** **Core Accepted** (inherited)  
**Reason:** CourtRecord boundary.

### INV35 — Acquired source ≠ truth
**Problem:** obtained source/content가 objective fact인가?  
**Alternatives:** yes; source node/assertions reviewed later.  
**Failure modes:** source/truth collapse.  
**Recommendation:** no truth promotion.  
**Status:** **Core Accepted** (inherited)  
**Reason:** DEC-019 epistemic model.

## 13. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | Investigation is explicit Task family | **Core Accepted candidate** |
| 2 | Investigation ≠ Evidence Review | **Core Accepted candidate** |
| 3 | No ActualStateRecord omniscient query | **Core Accepted candidate** |
| 4 | Explicit known starting basis/direction | **Core Accepted candidate** |
| 5 | Search domain is bounded | **Core Accepted candidate** |
| 6 | World existence ≠ discoverability | **Core Accepted candidate** |
| 7 | Discoverability ≠ discovery | **Core Accepted candidate** |
| 8 | Discovery ≠ accessibility | **Core Accepted candidate** |
| 9 | Accessibility ≠ acquisition | **Core Accepted candidate** |
| 10 | Acquisition ≠ review | **Core Accepted candidate** |
| 11 | Lead ≠ SourceMaterial | **Core Accepted candidate** |
| 12 | Lead ≠ truth | **Core Accepted candidate** |
| 13 | Unknown unknowns are not pre-created in Case File | **Core Accepted** inherited |
| 14 | Unknown unknown becomes known only via legitimate discovery | **Core Accepted candidate** |
| 15 | Acquisition requires provenance | **Core Accepted candidate** |
| 16 | Failed attempts remain structured history | **Core Accepted candidate** |
| 17 | False Leads are valid | **Core Accepted candidate** |
| 18 | Dead ends are valid | **Core Accepted candidate** |
| 19 | Search found nothing ≠ target absent from world | **Core Accepted candidate** |
| 20 | Negative information is search-domain bounded | **Core Accepted candidate** |
| 21 | Investigator may miss information | **Accepted candidate** |
| 22 | Capability does not guarantee discovery | **Core Accepted candidate** |
| 23 | No universal InvestigationScore | **Core Accepted candidate** |
| 24 | No hidden weighted capability sum | **Core Accepted candidate** |
| 25 | ActionAttempt ≠ successful Result | **Core Accepted candidate** |
| 26 | Borderline uncertainty materializes once | **Core Accepted candidate** |
| 27 | Reload does not reroll | **Core Accepted candidate** |
| 28 | Lead chains preserve provenance | **Core Accepted candidate** |
| 29 | Material scope expansion requires explicit follow-up Task | **Core Accepted candidate** |
| 30 | Witness discovery ≠ contact ≠ interview ≠ Statement | **Core Accepted candidate** |
| 31 | Publicly accessible ≠ automatically discovered | **Core Accepted candidate** |
| 32 | Direct/delegated use same ontology | **Core Accepted candidate** |
| 33 | Investigation history is not overwritten | **Core Accepted candidate** |
| 34 | Duplicate discovery preserves all provenance | **Core Accepted candidate** |
| 35 | Acquired source enters Case File as SourceMaterial, not truth | **Core Accepted** inherited |
| 36 | Acquired source is not automatically reviewed | **Core Accepted candidate** |
| 37 | Acquired source does not automatically enter CourtRecord | **Core Accepted** inherited |
| 38 | Investigation does not directly modify JII/finding | **Core Accepted** inherited |
| 39 | Investigation does not reveal hidden clue count/ranking | **Core Accepted candidate** |
| 40 | No assumed Korean compulsory-process power | **Core Accepted candidate** |

## 14. Pressure-test examples

All examples are synthetic semantic fixtures, not implementation tests or statements of Korean law.

### Case 1 — Known missing attachment
**Input:** E4 references absent attachment A1.  
**May evaluate:** KnownGap→request/trace Task.  
**Must not happen:** hidden content appears.  
**Expected:** valid starting basis.

### Case 2 — No starting basis
**Input:** “Find the secret offshore account” with no Lead/domain.  
**May evaluate:** broader but bounded search Task only if explicit basis/domain exists.  
**Must not happen:** target hidden B4 directly.  
**Expected:** invalid omniscient request.

### Case 3 — Hidden world source
**Input:** E99 exists; no Lead points to it.  
**May evaluate:** none.  
**Must not happen:** auto-discovery.  
**Expected:** E99 remains unknown.

### Case 4 — Lead from source
**Input:** E4 mentions P7.  
**May evaluate:** P7 Lead with E4 provenance.  
**Must not happen:** P7 becomes evidence/truth/Statement.  
**Expected:** direction candidate only.

### Case 5 — Lead from witness
**Input:** Known W3 says P7 may know something.  
**May evaluate:** P7 Lead with W3 assertion provenance.  
**Must not happen:** relevance guaranteed.  
**Expected:** Lead valid.

### Case 6 — False Lead
**Input:** P7 contacted, knows nothing relevant.  
**May evaluate:** attempt and dead/false Lead result.  
**Must not happen:** fabricate useful evidence.  
**Expected:** valid dead end.

### Case 7 — Source existence discovered
**Input:** Investigator learns CCTV exists.  
**May evaluate:** source-existence ref/access route.  
**Must not happen:** footage auto-acquired/reviewed.  
**Expected:** discovery only.

### Case 8 — Acquisition succeeds
**Input:** CCTV legitimately requested/obtained.  
**May evaluate:** acquisition event and SourceMaterial provenance.  
**Must not happen:** contents understood/admissible.  
**Expected:** unreviewed acquired source.

### Case 9 — Acquisition refused
**Input:** source request refused.  
**May evaluate:** refusal result/provider/time.  
**Must not happen:** contents revealed.  
**Expected:** structured failure.

### Case 10 — Unavailable/destroyed source
**Input:** target reported unavailable/destroyed through valid interaction.  
**May evaluate:** bounded status/gap.  
**Must not happen:** hidden contents.  
**Expected:** result with provenance.

### Case 11 — Request pending
**Input:** request sent, response outstanding.  
**May evaluate:** pending state.  
**Must not happen:** assume success/refusal.  
**Expected:** pending retained.

### Case 12 — Partial acquisition
**Input:** only part of requested records received.  
**May evaluate:** acquired subset plus KnownGap.  
**Must not happen:** mark whole request complete.  
**Expected:** structured partial result.

### Case 13 — Search finds nothing
**Input:** Registry R query Q returns no match.  
**May evaluate:** no match in R/Q/T.  
**Must not happen:** target absent everywhere.  
**Expected:** bounded negative.

### Case 14 — Public record, wrong search
**Input:** R8 exists publicly; wrong identifier/domain used.  
**May evaluate:** failed attempt.  
**Must not happen:** public-data omniscience.  
**Expected:** not found.

### Case 15 — Correct public search
**Input:** valid identifier/domain and fixture discovery rule.  
**May evaluate:** R8 Lead/acquisition result.  
**Must not happen:** unrelated public data reveal.  
**Expected:** R8 may be discovered/acquired per rule.

### Case 16 — Exceptional investigator / no Lead
**Input:** exceptional profile; no starting basis/domain.  
**May evaluate:** none.  
**Must not happen:** arbitrary source discovery.  
**Expected:** capability does not create Lead.

### Case 17 — Exceptional investigator / false Lead
**Input:** exceptional profile pursues false Lead.  
**May evaluate:** attempt/dead end.  
**Must not happen:** false becomes evidence.  
**Expected:** Lead remains false/irrelevant.

### Case 18 — Limited time
**Input:** many Leads, limited time.  
**May evaluate:** pursued/unpursued branches.  
**Must not happen:** percentage penalty/profile downgrade.  
**Expected:** some Leads may remain unpursued.

### Case 19 — Multiple Leads
**Input:** action yields P7, C2, D9.  
**May evaluate:** separate Leads/provenance/priorities.  
**Must not happen:** correct-Lead badge.  
**Expected:** branching options.

### Case 20 — Follow-up scope expansion
**Input:** IT-1 discovers L7.  
**May evaluate:** IT-2 candidate.  
**Must not happen:** IT-1 searches branch/world indefinitely.  
**Expected:** explicit follow-up.

### Case 21 — Dead end then later useful
**Input:** Lead dead at T1; new source makes it relevant at T2.  
**May evaluate:** updated relation/current status.  
**Must not happen:** T1 deletion.  
**Expected:** full history.

### Case 22 — Witness discovered
**Input:** P7 identified as potential contact/witness.  
**May evaluate:** discovered person/Lead.  
**Must not happen:** Statement/testimony.  
**Expected:** discovery stage only.

### Case 23 — Witness contact failure
**Input:** P7 does not respond.  
**May evaluate:** ContactAttempt/result.  
**Must not happen:** infer testimony.  
**Expected:** failure history.

### Case 24 — Witness contacted
**Input:** P7 responds.  
**May evaluate:** contact success.  
**Must not happen:** auto-interview/Statement.  
**Expected:** contact stage only.

### Case 25 — Auto-interview attack
**Input:** discovered witness triggers full testimony.  
**May evaluate:** future Interview Task candidate.  
**Must not happen:** automatic Statement.  
**Expected:** forbidden without interview rules.

### Case 26 — Client reveals source
**Input:** client says D4 exists.  
**May evaluate:** source-existence Lead/assertion.  
**Must not happen:** content/truth/acquisition.  
**Expected:** discovered candidate.

### Case 27 — Client provides source
**Input:** client gives D4.  
**May evaluate:** acquired SourceMaterial/provenance.  
**Must not happen:** auto-review/truth.  
**Expected:** D4 unreviewed.

### Case 28 — Client statement truth attack
**Input:** client says X.  
**May evaluate:** SourceAssertion.  
**Must not happen:** objective X.  
**Expected:** assertion only.

### Case 29 — Acquisition auto-review attack
**Input:** Investigation obtains D4 and reports its useful meaning.  
**May evaluate:** acquisition metadata only.  
**Must not happen:** RecordedExtraction/analysis without Review.  
**Expected:** forbidden; separate Evidence Review.

### Case 30 — Investigation→CourtRecord attack
**Input:** acquired D4 directly feeds judge.  
**May evaluate:** future procedure materialization.  
**Must not happen:** direct CourtRecord/JII/finding.  
**Expected:** forbidden.

### Case 31 — Duplicate discovery
**Input:** L4 and L9 reach same P7/source.  
**May evaluate:** entity-resolution candidate preserving both chains.  
**Must not happen:** one origin erased.  
**Expected:** duplicate provenance retained.

### Case 32 — Later success after failed search
**Input:** T1 fails; T2 retry succeeds.  
**May evaluate:** two attempts/current result.  
**Must not happen:** T1 overwrite.  
**Expected:** history preserved.

### Case 33 — Save/load reroll
**Input:** borderline event materialized; reload requests new result.  
**May evaluate:** existing event.  
**Must not happen:** reroll.  
**Expected:** same materialized result.

### Case 34 — Hidden clue counter
**Input:** UI says three undiscovered witnesses remain.  
**May evaluate:** known Leads only.  
**Must not happen:** hidden count/list.  
**Expected:** forbidden.

### Case 35 — Investigation success score
**Input:** `InvestigationSuccess=78%` as authority.  
**May evaluate:** structured actions/results.  
**Must not happen:** score substitutes semantics.  
**Expected:** invalid.

### Case 36 — NPC hidden discovery engine
**Input:** delegated NPC receives unrelated random hidden clue.  
**May evaluate:** authorized Leads/domain only.  
**Must not happen:** hidden percentage/random clue.  
**Expected:** forbidden.

## 15. Additional attacks

| Attack | Required result |
|---|---|
| ActualStateRecord/global hidden-source query | **Forbidden** |
| Unlimited/search-everything/public-data omniscience | **Forbidden** |
| Capability omniscience/false-Lead auto-correction | **Forbidden** |
| Hidden clue ranking/count | **Forbidden** |
| Discovery=acquisition; acquisition=review/truth/CourtRecord | **Forbidden** |
| Witness discovery=Statement | **Forbidden** |
| Negative search=global absence | **Forbidden** |
| Later success deletes failure; duplicate deletes provenance | **Forbidden** |
| NPC hidden percentage or player answer highlight | **Forbidden** |
| Reload reroll/universal InvestigationScore | **Forbidden** |
| Invented Korean compulsory power | **Forbidden/TBD**, never assumed |

## 16. Unknown-unknown pressure test

World-only W9/D20/B4 are absent from Case File; unrelated L1 does not reveal them. If L1→S4 and S4 legitimately mentions W9, W9 may become a discovered Lead while D20/B4 remain unknown. This verifies `unknown unknown → discovered Lead → known candidate` without unrelated leakage.

## 17. Search-negative pressure test

Registry A queried for Company X returning no match records only `No match in Registry A using Q at T`. It does not establish `Company X does not exist` unless a separate authoritative exhaustiveness rule exists; none is invented here.

## 18. Acquisition-review pressure test

Investigation obtains D4 as `SourceMaterial acquired; status unreviewed`. `D4 proves fraud` or `contains contradiction X` is invalid until Evidence Review produces provenance-bearing RecordedExtraction/Assertion/Analysis. `acquired ≠ reviewed ≠ understood`.

## 19. Witness-chain pressure test

`person discovered ≠ witness role confirmed ≠ contacted ≠ interviewed ≠ Statement obtained`. Exact witness-role/interview semantics remain future/TBD; no automatic testimony is generated.

## 20. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| No ActualStateRecord query | 2,3,16,36 | PASS candidate | Hidden API forbidden |
| World existence ≠ discovery | 3,14,16 | PASS candidate | Basis/domain required |
| Lead ≠ truth/source | 4–6,19 | PASS candidate | False Lead valid |
| Discovery ≠ accessibility/acquisition | 7–12 | PASS candidate | Stages separate |
| Acquisition ≠ review/truth/CourtRecord | 8,27–30 | PASS candidate | DEC-020/procedure gate |
| Failed/negative search bounded | 6,9–13,17 | PASS candidate | No global absence |
| Unknown unknown non-disclosure | 2,3,34, §16 | PASS candidate | No hidden count |
| Acquisition/source provenance | 8,12,15,26,27,31 | PASS candidate | History refs |
| False/dead Leads valid | 6,17,21 | PASS candidate | Not all Tasks succeed |
| Direct/delegated equivalence | 36 and architecture | PASS candidate | Same ontology |
| No hidden score/weighted sum | 16–18,35 | PASS candidate | Components only |
| Materialized event/no reroll | 33 | PASS candidate | Exact probability TBD |
| Witness stages separate | 22–25, §19 | PASS candidate | No Statement creation |
| Publicly accessible ≠ known | 14,15 | PASS candidate | Search action required |
| Scope expansion explicit | 19,20 | PASS candidate | Follow-up Task |
| Duplicate/history preservation | 21,31,32 | PASS candidate | No overwrite |
| No direct JII/finding | 30 | PASS candidate | CourtRecord gate |

## 21. False-PASS / False-PARTIAL boundary

Fixture conclusions may use only declared starting basis, domain, Task inputs, world-facing rules and materialized events. Tester must not invent world-search APIs, hidden clue maps, discovery probability, source accessibility, registry completeness, witness cooperation, compulsory powers, relevance/reliability algorithms, InvestigationScore or automatic review. Exact search algorithms, probabilities, routes, databases, witness behavior, UI, Korean procedure and NPC AI being TBD is not by itself a PARTIAL reason; PARTIAL is reserved for genuine semantic ambiguity.

## 22. Explicit TBD

- Investigation Task/Lead/search-domain/target taxonomies and schemas
- discovery/search algorithms and probability
- source accessibility and acquisition-route vocabulary
- cooperation/refusal/witness contact/interview mechanics
- capability mappings, legal authority, Korean compulsory process
- public databases and client interaction
- specialist investigator roles, source reliability, entity/duplicate resolution
- time/resource/cost/workload formulas
- NPC AI and player UI/minigames
- Evidence Review algorithms, witness interview system and CourtRecord admission
- save/API/schema/Godot implementation and balancing/performance

## 23. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Omniscient world search | Task scans ActualStateRecord | Knowledge boundary collapses | Basis/domain/actions only |
| Every Task finds something | No-result impossible | Investigation becomes loot roll | Structured failures/dead ends |
| Success-only history | Failed attempts disappear | Strategy/cost unreadable | Preserve attempts/results |
| Hidden clue counters | UI lists remaining answers | Unknown unknown leak | Known Leads/gaps only |
| Skill guarantees discovery | Elite finds all | Capability=omniscience | Misses/constraints valid |
| Public data magically known | All registries preloaded | Search provenance lost | Explicit query/action |
| False/dead Leads impossible | Every Lead correct | Answer-path railroading | Lead ≠ truth |
| Acquisition auto-review | Received source understood | DEC-020 bypass | Separate Review Task |
| Acquisition auto-truth | Source possession proves content | Epistemic collapse | SourceMaterial only |
| Witness auto-testimony | Discovered person yields Statement | Content fabrication | Stage separation |
| Negative search=absence | Local no-result becomes world fact | Hidden oracle | Domain/query/time-bounded negative |
| History overwrite | Later success erases fail | Replay corruption | Immutable attempt lineage |
| Save-scum reroll | Reload changes event | State instability | Materialize once |
| NPC hidden percentage | Delegation gives random clue | Semantic divergence | Shared ontology |
| Unlimited scope | Task recursively searches world | Cost/authorization vanish | Follow-up Task expansion |
| Busywork explosion | Every lead manually clicked | Poor gameplay | Priority/projection aids TBD |
| Random clicking | Actions lack basis | No reasoning | Lead/basis requirement |
| Too many useless Leads | Noise overwhelms decisions | Case File unusable | Bounded generation/filtering TBD |
| Document-count grind | Volume alone drives difficulty | Ignores search structure | Structured demands |
| Fabricated legal powers | Generic request compels source | False doctrine | Generic route interface/TBD |

## 24. Player-facing design principle

Player should see what Lead is being pursued, why it exists, the attempted action, discovered/failed/pending/blocked result, provenance and new follow-up paths. Player should not see hidden-world clue counts, correct-Lead highlights, guaranteed evidence markers, undiscovered witness lists, hidden source importance or future judge effect.

## 25. Solo → firm progression hook

```text
Solo → player pursues Leads and requests sources
Support/assistants → permitted tracing/request tracking/searches
Associates/investigators → delegated Investigation Tasks
Larger firm → parallel branches
Partner/player → resource and strategic Lead prioritization
```

Supported architecture only; not a mandatory progression.

## 26. Proposed TEST-020 plan

File: `TEST-020_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md`. Manual/synthetic verification should use at least the 36 core fixtures in §14 plus unknown-unknown, search-negative, acquisition-review and witness-chain pressure tests. The TEST is not created here.

## 27. DEC-022 candidates

| Candidate | Prerequisite fit | Risk |
|---|---|---|
| Witness / Interview / Statement Model | INV27 leaves discovery/contact/interview/Statement boundary open; directly pressure-tests new witnesses | Must preserve assertion/credibility/procedure separation |
| Legal Research & Issue Analysis | Case File issues and WorkProducts exist | Needs legal-content model |
| Investigation Follow-up / Case Theory Synthesis | Lead branches and analyses need integration | May create truth oracle prematurely |
| Task Assignment / Workload / Team Coordination | Parallel investigation/Review needs scaling | Better after more concrete task families |
| Client Interaction / Information Provision | Client sources/statements are acquisition inputs | Broader social/dialogue dependency |

**Default recommendation:** `Witness / Interview / Statement Model` is the strongest DEC-022 candidate because Investigation can now discover and contact persons but explicitly cannot create interviews or Statements. Legal Research & Issue Analysis is a close alternative if substantive issue authoring becomes the stronger implementation prerequisite. Final title/order is not fixed automatically.

## 28. Decision summary

### Inherited Accepted

| Boundary | Status |
|---|---|
| CaseFileState/ActualStateRecord/CourtRecord/CourtFactFinding separation | **Core Accepted** |
| Evidence Review acquired-material boundary and RecordedExtraction model | **Core Accepted** |
| No direct JII/ChoicePoint/finding effect; explicit procedural materialization | **Core Accepted** |

### Core Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| INV1–INV16 | Explicit bounded Investigation, no hidden query, Lead/discovery/access/acquisition separation, structured failures | **Core Accepted candidate** |
| INV18–INV24 | No score/weighted sum, action-result separation, materialized uncertainty and provenance | **Core Accepted candidate** |
| INV26–INV30 | Explicit expansion, witness/review/direct-delegated/public-search boundaries | **Core Accepted candidate** |
| INV32–INV33 | Duplicate and history preservation | **Core Accepted candidate** |

### Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| INV17, INV25, INV31 | Misses, Lead branching and resource constraints | **Accepted candidate** |

### TBD

All task/Lead/search/acquisition taxonomies, algorithms, probabilities, accessibility/cooperation, witness interviews, capability mappings, Korean procedure/powers, databases/client mechanics, roles, reliability/entity resolution, costs, UI/AI/schema/Godot and performance remain **TBD**.

### Forbidden

- ActualStateRecord/global hidden-clue query, unlimited world/public-data omniscience.
- Lead/source/world existence collapsed into discovery/access/acquisition/review/truth.
- Hidden clue count/ranking, universal InvestigationScore, weighted capability formula or reload reroll.
- False/failed/dead history or duplicate provenance overwritten.
- Witness discovery creating interview/Statement.
- Acquired source automatically reviewed, admitted, entered into CourtRecord or used to modify JII/finding.
- Invented Korean compulsory or coercive legal powers.

## 29. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | INV1–INV35 define explicit Investigation Tasks, starting basis/search domain, Lead chains, unknown-unknown discovery, discovery/access/acquisition/review separation, structured failures/false Leads/negative results, materialized events, witness stages, provenance/history, Evidence Review/CourtRecord gates and 36-case TEST-020 plan. |
| v0.2 | Accepted | TEST-020의 40 PASS / 0 PARTIAL / 0 FAIL과 design review에 따라 Investigation/acquisition boundary를 Accepted로 승격했다. Exact algorithms, probabilities, routes, cooperation과 implementation은 기존 TBD로 유지한다. |
