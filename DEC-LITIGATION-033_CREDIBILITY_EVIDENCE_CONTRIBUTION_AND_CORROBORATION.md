# DEC-LITIGATION-033 — Credibility, Evidence Contribution, and Corroboration

**Status:** v0.1 — Proposed / design review required  
**System:** Litigation  
**Decision type:** Adjudicative input / contribution semantics  
**Depends on:** Constitution; System Map; Architecture Rules; SYS-001; accepted litigation DEC/TEST chain through DEC-032 / TEST-031  
**Repository authority:** Repository files only

---

## 1. Purpose

This decision defines how exact content in an authorized `CourtRecordSnapshot` may be analyzed for source dependence, contradiction, corroboration, content-scoped credibility, and criterion-specific contribution before inherited recognition and sufficiency logic acts.

DEC-033 answers:

> How can permitted record content become structured, explainable adjudicative input without consulting hidden truth or introducing universal evidence, credibility, corroboration, confidence, or outcome scores?

DEC-033 is not a truth, finding, judgment, evidence-procedure, or hidden-judge-cognition model. It does not decide whether a criterion is satisfied.

---

## 2. Foundational boundaries

```text
CourtRecordEntry
≠ CourtRecordSnapshot
≠ SourceRelationAssessment
≠ EvidenceContributionAssessment
≠ CredibilityAssessment
≠ CorroborationRelation
≠ ContradictionRelation
≠ CriterionInput
≠ CourtFactFinding
≠ JudgeInterpretationInput
≠ objective truth
```

```text
source exists
≠ source is independent
≠ source is credible
≠ source corroborates
≠ proposition is proven
≠ criterion is satisfied
≠ fact is found
```

```text
record inclusion
≠ contribution
≠ weight
≠ sufficiency
≠ finding
```

An assessment records a criterion-local relationship supported by authorized record content and supplied rules. It does not reveal what actually happened, label a person globally, or resolve the criterion that consumes it.

---

## 3. Inherited ownership

### 3.1 DEC-031 owns record semantics

DEC-031 remains authoritative for `CourtRecordEntry`, `CourtRecordSnapshot`, exact source/version/scope, duplicate/derived/imported lineage, snapshot membership and cutoff, permitted-use scope, historical status, access, and hidden-state exclusion.

DEC-033 consumes one immutable authorized snapshot. It cannot add entries, broaden entry scope, alter access/use eligibility, repair provenance, or reach around the snapshot to CaseFile or world state.

### 3.2 DEC-032 owns procedural evidence use

DEC-032 remains authoritative for courtroom evidence-use attempts, objections, procedural rulings/effects, exact permitted use, presentation, and materialization eligibility. Procedural permission or admission is not contribution, credibility, corroboration, truth, or finding.

### 3.3 DEC-011 and DEC-012 own recognition and sufficiency

DEC-011 owns canonical fact-recognition states and the truth-non-interference boundary. DEC-012 owns versioned `RecognitionCriterion`, requirement evaluation, evidence sufficiency, conflict/lineage treatment within criterion logic, and the transition toward `CourtFactFinding`.

DEC-033 supplies structured input. It does not return a criterion result, sufficiency result, or finding.

### 3.4 DEC-013 and DEC-014 own genuine ambiguity and JII

JudgeProfile influence remains behind the inherited hard-input, hard-result, and criterion-declared genuine-ambiguity gates. Only a valid, explicit `JudgeInterpretationInput` may affect the criterion-declared scope. DEC-033 cannot create a profile-based evidence multiplier, credibility modifier, or backdoor JII.

### 3.5 Work and information ownership

DEC-017/018 own capability effects on observable lawyer WorkProducts. DEC-019 owns authorized CaseFile knowledge. DEC-026 owns TaskAssignment, workload, time, capacity, and actor-role distinctions. Lawyer analysis remains WorkProduct unless accepted procedural and record paths make relevant content available to court-side assessment.

---

## 4. Core semantic chain

```text
CourtRecordSnapshot
→ exact included CourtRecordEntry versions/scopes
→ SourceRelationAssessment
→ ContradictionRelation / CorroborationRelation
→ optional CredibilityAssessment
→ EvidenceContributionAssessment
→ CriterionInput
→ inherited RecognitionCriterion / sufficiency evaluation
→ possible later CourtFactFinding
```

Every arrow means “may provide an authorized input to,” not “automatically causes success.” Optional objects are created only where the supplied criterion/rule requires and supports them.

---

## 5. No universal evidence or credibility score

The canonical model prohibits:

- `EvidenceWeight`;
- `EvidenceStrength`;
- `CredibilityScore`;
- `ReliabilityScore`;
- `WitnessScore`;
- `CorroborationScore`;
- `ProofScore`;
- `SourceTrustScore`;
- `CombinedEvidenceScore`;
- `ConfidencePercent`;
- `FactProbability`; and
- record-derived `WinProbability`.

Renaming a 0–1, percentage, point, star, rank, hidden tier, or aggregate meter does not make it valid. Qualitative labels are permitted only when their meaning is local to a versioned criterion/rule and their source, scope, conditions, and downstream interpretation are explicit. They may not form a universal ordinal ladder.

---

## 6. Canonical semantic objects

### 6.1 SourceRelationAssessment

`SourceRelationAssessment` describes the known provenance relationship among exact snapshot entry scopes. It has:

- stable relation identity;
- `CourtRecordSnapshot` identity;
- participating `CourtRecordEntry` identities, versions, and exact scopes;
- underlying source/version references inherited from DEC-031;
- target proposition and criterion/requirement where relevant;
- relation kind and bounded scope;
- authorized provenance facts used;
- unknown or contested aspects;
- supplied evaluator/rule/version;
- explanation lineage; and
- assessment context and order/version.

Open relation kinds may include `independent`, `dependent`, `derived`, `common_origin`, `same_source_rematerialized`, `imported_prior_stage`, and `independence_unknown`. These labels describe provenance under supplied semantics. They do not assign truth, credibility, or evidentiary value.

Different entries are not presumed independent. Equal text is not presumed duplicate, derived, or independent. If provenance cannot establish the relationship, the result remains `independence_unknown`.

### 6.2 ContradictionRelation

`ContradictionRelation` identifies a scoped conflict between assertions or content available in the same authorized snapshot and criterion context. It has:

- stable relation identity;
- snapshot identity;
- entry/version/scope A and B;
- target proposition, aspect, criterion, and requirement;
- supplied conflict kind, such as direct, partial, apparent, contextual, or unresolved;
- timing and context differences;
- source-relation references;
- explanation and rule/evaluator provenance; and
- unresolved qualifications.

Contradiction is a relation, not a conclusion about which content is false. It creates no deception flag, lie label, credibility penalty, or truth preference.

### 6.3 CorroborationRelation

`CorroborationRelation` records that two or more exact permitted record scopes provide reinforcing information about a particular proposition and criterion under an explicit source/provenance analysis. It has:

- stable relation identity;
- snapshot identity;
- target criterion/requirement and proposition;
- participating entry identities, versions, and scopes;
- overlapping and distinct reinforcing content;
- source independence/dependence/unknown references;
- contradiction references where relevant;
- limitations and unresolved provenance;
- supplied criterion/rule/evaluator identity; and
- explanation lineage.

A relation may describe independent reinforcement, partial reinforcement, redundant repetition, common-origin repetition, or uncertain independence only when supplied semantics define the category. No category has universal numeric or ordinal force.

Corroboration is not inferred from entry count or textual equality. It is not truth, a score, criterion satisfaction, or a finding.

### 6.4 CredibilityAssessment

`CredibilityAssessment` is an explicit, court-side, content-scoped adjudicative assessment made from authorized snapshot content under a supplied rule. It has:

- stable assessment identity;
- `CourtRecordSnapshot` identity;
- exact testimony/source entry identities, versions, and scopes;
- target proposition, criterion, and requirement where applicable;
- supplied credibility rule/factor references;
- authorized observable inputs;
- related contradiction, correction, provenance, and source relations;
- a criterion-local qualitative assessment or `unresolved` state;
- limitations and applicability scope;
- evaluator/rule/version identity; and
- explanation lineage.

The assessment attaches to exact content and context, not the person globally:

```text
Person
≠ WitnessRole
≠ TestimonyEvent
≠ CourtRecordEntry scope
≠ CredibilityAssessment
```

The same person may have different assessments for different statements, subjects, hearings, snapshots, and criteria. No `WitnessCredibility=82`, global `Reliable/Unreliable`, `isTruthful`, `isLying`, honesty stat, or trustworthiness score exists.

### 6.5 Credibility factor hooks

Potential hook families include internal consistency, cross-statement consistency, consistency with other record content, opportunity/ability to observe, memory/context limitations, source provenance, contradiction history, bias/interest context, correction history, and uncertainty/no-recollection content.

These are routing families only. DEC-033 does not define their legal meaning, priority, weight, or Korean-law treatment. A supplied criterion/rule determines applicability and interpretation. An unavailable factor stays unavailable; the assessment does not consult hidden simulation state to fill the gap.

### 6.6 EvidenceContributionAssessment

`EvidenceContributionAssessment` records how exact snapshot content relates to one proposition and criterion/requirement. It has:

- stable assessment identity;
- snapshot identity;
- target `RecognitionCriterion` and immutable version;
- target requirement and proposition/scope;
- referenced entry identities, versions, and exact scopes;
- criterion-local contribution role;
- source/dependency relations;
- contradiction and corroboration references;
- credibility references where the supplied criterion permits;
- procedural/use limitations inherited from the snapshot;
- unresolved issues and missing authorized inputs;
- evaluator and supplied rule/version identity; and
- explanation lineage.

Open contribution-role vocabulary may include `supports`, `opposes`, `contextualizes`, `undermines`, `duplicates`, `derives_from`, `corroborates`, `contradicts`, `partially_supports`, `ambiguous`, `unresolved`, and `irrelevant_to_this_criterion`. These are relations, not universal ranks. A criterion must define any operational meaning it consumes.

The same entry may support identity, be irrelevant to timing, and remain ambiguous for intent. It therefore has no global evidentiary value.

### 6.7 CriterionInput

`CriterionInput` is the explicit adapter from DEC-033 outputs into inherited DEC-011/012 evaluation. It has:

- stable input identity;
- `CourtRecordSnapshot` identity and cutoff;
- target `RecognitionCriterion` identity/version;
- target requirement and proposition/scope;
- exact included entry/version/scope references;
- contribution assessments;
- source/dependence relations;
- contradiction and corroboration relations;
- credibility assessments where permitted;
- unresolved inputs, limitations, and conflicts;
- supplied rule provenance; and
- deterministic construction trace.

`CriterionInput` is not a criterion result, sufficiency result, JII, finding, judgment, or truth state. DEC-012 decides how a versioned criterion consumes it.

---

## 7. Criterion and proposition specificity

Every contribution, credibility, contradiction, and corroboration assessment identifies its criterion/proposition context where the relation can affect criterion evaluation. An entry cannot carry a universal “value.”

Example:

| Record scope | Criterion | Permitted local role |
|---|---|---|
| `CR-1 v1[p2]` | Identity criterion A | `supports` under `Rule-A` |
| `CR-1 v1[p2]` | Timing criterion B | `irrelevant_to_this_criterion` under `Rule-B` |
| `CR-1 v1[p2]` | Intent criterion C | `unresolved` under `Rule-C` |

The rows are distinct assessments. They cannot be collapsed to `CR-1 EvidenceStrength`.

---

## 8. Source independence, duplicate, and derived content

DEC-031 provenance is the starting point. DEC-033 may assess what that provenance means for one criterion, but it cannot invent missing lineage.

The architecture distinguishes:

- same source/scope re-materialized in separate record events;
- the same person making a later separate statement;
- different people repeating one originating statement;
- a filing copied or derived from testimony;
- documents generated from a shared database or report;
- imported prior-stage entries retaining original provenance;
- distinct observations with known separate origins; and
- relationship unknown on the authorized record.

Textual equality alone proves none of these. Semantically distinct events remain distinct even where their text matches. Conversely, five entries derived from one source do not become five independent sources.

No duplicate-contribution algorithm is defined. A criterion may consume explicit dependency/derivation relations under its own supplied rules.

---

## 9. Corroboration and repetition

```text
repetition ≠ corroboration
corroboration ≠ score
corroboration ≠ truth
corroboration ≠ criterion satisfaction
corroboration ≠ finding
```

Corroboration requires a proposition-specific reinforcing relation and explicit source-awareness. Known common-origin repetition can be represented as repetition without independent reinforcement. Known independent observations may participate in a corroboration relation, but even that relation only becomes structured input to the criterion.

If source independence is unknown, DEC-033 records `independence_unknown`; it does not assume independence or dependence to reach a desired result.

---

## 10. Contradiction, changed statements, and conflicts

A contradiction identifies incompatible or tension-bearing content at an exact scope. It does not choose the true side.

Comparisons may include document/document, document/testimony, testimony/testimony, filing/testimony, and one record entry against another. Preparation, interview, or prior statements may participate only if their exact content is validly included and permitted in the consumed snapshot.

A changed account may create a `ChangedStatementRelation`, a `ContradictionRelation`, a context/scope difference, or an unresolved explanation under supplied rules. Changed account does not mean lie. A later correction does not rewrite the earlier statement or prior assessment.

One entry may support a criterion while also conflicting with another entry and deriving from a common source. Contradiction does not universally zero contribution; corroboration does not universally override contradiction. The owning criterion decides how declared relations matter.

---

## 11. Credibility boundaries

Credibility evaluation may use only the exact authorized snapshot content and inherited observable context declared by the supplied rule. It may not inspect:

- `ActualStateRecord`;
- hidden `PersonKnowledge`;
- hidden memory truth;
- `isLying` or hidden deception state;
- hidden relationship truth;
- hidden judge belief;
- future events;
- excluded or unavailable content outside the snapshot;
- private LawyerWorkProduct; or
- a desired outcome.

When the record lacks an authorized basis, credibility remains `unresolved`. The architecture does not repair uncertainty with an oracle.

Profession, rank, age, gender, wealth, fame, partner status, NPC importance, relationship score, charisma, courtroom skill, and narrative importance do not supply credibility. A future authored rule may define a lawful observable factor only through explicit scope and provenance; DEC-033 supplies no default or hidden archetype shortcut.

---

## 12. Credibility and contribution remain separate

```text
CredibilityAssessment ≠ EvidenceContributionAssessment
```

Testimony may be relevant while credibility remains unresolved. Documentary content may contribute without a witness credibility assessment. A credibility assessment may affect contribution only when the versioned criterion explicitly declares that relationship and exact scope.

Credibility concern does not procedurally exclude testimony, alter a CourtRecord entry, or delete snapshot membership. Those are different inherited systems.

---

## 13. Criterion-local aggregation

DEC-033 supplies topology, not a universal aggregator. It prohibits default use of:

- sum or point accumulation;
- arithmetic or weighted average;
- Bayesian probability;
- majority count or vote;
- highest-evidence-wins;
- weakest-evidence-wins;
- source-count thresholds; and
- implicit corroboration multipliers.

If several assessments must be combined, the immutable criterion/rule version defines the method, required inputs, treatment of dependence/conflict/credibility, unresolved result, and explanation. DEC-012 remains authoritative for the resulting requirement and sufficiency semantics.

Thus, three supporting entries do not beat one opposing entry by count. Ten copies of one source are not ten independent supports. One independent source does not automatically defeat several dependent sources. Count is provenance, not proof.

---

## 14. Lawyer analysis versus court assessment

Lawyer predictions such as “the witness is vulnerable,” “the document is strong,” or “the contradiction matters” remain `LawyerWorkProduct`/CaseTheory analysis. They may guide authorized work, but do not mutate court-side `CredibilityAssessment`, `EvidenceContributionAssessment`, `CriterionInput`, JII, or finding.

A court-side assessment requires authorized snapshot content, a supplied rule/criterion, an evaluator/authority context, and explicit lineage. Player predictions may be wrong.

---

## 15. JudgeProfile boundary

`JudgeProfile` and `JudgeTrait` are not evidence, credibility, corroboration, or contribution modifiers. They cannot multiply, discount, rank, or add weight to record content.

Only after DEC-012 hard evaluation reaches a valid criterion-declared genuine ambiguity may DEC-013/014 derive an explicit `JudgeInterpretationInput` from an applicable, rule-linked trait. That input affects only the declared requirement/scope and remains downstream of DEC-033.

```text
JudgeProfile
≠ CredibilityScore modifier
≠ evidence multiplier
≠ corroboration multiplier
```

---

## 16. Determinism, versions, and persistence

Given the same snapshot, rule versions, authorized inputs, and criterion context, DEC-033 assessments and relations are replay-stable. No hidden courtroom RNG or reload reroll exists. A future accepted rule may define bounded uncertainty, but it must be explicit, provenance-bearing, replayable under its accepted semantics, and cannot read hidden truth.

Every assessment binds to the exact immutable snapshot it consumed. If the CourtRecord changes, a new snapshot may produce new relations, assessments, and `CriterionInput`. Old objects remain tied to the old snapshot and are not retroactively mutated.

```text
Snapshot S1 → CredibilityAssessment CA-1
later Snapshot S2 → CredibilityAssessment CA-2
CA-1 remains bound to S1
```

Corrections, supersession, exclusion, and changed permissions are reflected only through the entry versions/scopes included in the later DEC-031 snapshot.

---

## 17. Multi-stage and appellate lineage

Trial-stage and later-stage snapshots remain distinct. A later appellate or remand context may construct new DEC-033 assessments under supplied rules, while preserving references to original entry provenance and prior assessments.

A later assessment does not rewrite trial credibility, contribution, relations, `CriterionInput`, or findings. DEC-033 does not define standards of review, appellate procedure, or which material a later stage may consume.

---

## 18. Visibility and explanation

Authorized player projections may show entry scopes, known provenance, known derived/common-origin relations, identified contradictions, visible changed statements, visible credibility factors, criterion-linked contribution, unresolved conflicts, and materialized court reasoning.

They do not automatically expose truth labels, lie detection, hidden credibility, hidden source independence, hidden confidence/probability, future JII/finding, canonical best interpretation, or hidden evidence weight.

Every canonical relation or assessment has explanation lineage sufficient to identify snapshot, entries/scopes, criterion/rule, authorized inputs, evaluator, limitations, and unresolved matters. Restricted explanation visibility does not alter canonical existence or effect.

---

## 19. Capability, workload, and player/NPC symmetry

Under DEC-017/018, lawyer capability may improve observable WorkProducts by identifying contradiction, tracing dependency, spotting derived copies, organizing criterion-linked material, or identifying unresolved provenance. No universal `EvidenceAnalysisSkill`, `CredibilitySkill`, `WitnessReadingSkill`, or `FactFindingSkill` exists. Capability cannot alter a court assessment, satisfy a criterion, create truth, or force a finding.

Under DEC-026, source tracing, consistency review, contradiction analysis, and criterion preparation consume Task/workload capacity. There are no free `EvidenceAnalysisPoints`. Lawyer labor becomes court-side input only through accepted submission, procedure, record, snapshot, and assessment paths.

Player and NPC cases use the same snapshot, source relations, contradiction/corroboration relations, credibility assessments, contribution assessments, and `CriterionInput` ontology. NPC presentation may be compressed, but `NPCEvidenceStrength`, `NPCWitnessCredibility`, `NPCProofChance`, or any hidden percentage cannot replace semantic state.

---

## 20. Design decisions

Each decision is proposed pending design review.

| ID | Problem | Alternatives | Failure mode | Recommendation | Status |
|---|---|---|---|---|---|
| ECA1 | Contribution assessment identity | Inline criterion note; mutable flag; stable object | No audit/version lineage | Use stable `EvidenceContributionAssessment` | Proposed |
| ECA2 | Snapshot binding | Current record; immutable snapshot | Future/hidden content leaks | Bind every assessment to one `CourtRecordSnapshot` | Proposed |
| ECA3 | Entry scope | Whole entry; exact version/scope | Analysis silently broadens content | Require exact entry/version/scope references | Proposed |
| ECA4 | Criterion specificity | Global evidence value; criterion-local relation | One value leaks across issues | Require criterion/requirement/proposition identity | Proposed |
| ECA5 | Contribution roles | Numeric strength; fixed ranking; open local roles | Hidden universal weight | Use non-ranked roles interpreted only by supplied criterion | Proposed |
| ECA6 | Source independence | Assume by entry/person count; explicit assessment | Duplicate proof inflation | Use provenance-bearing `SourceRelationAssessment` | Proposed |
| ECA7 | Unknown independence | Treat independent; dependent; explicit unknown | Desired result fills lineage gaps | Preserve `independence_unknown` | Proposed |
| ECA8 | Duplicate text | Merge; treat corroboration; provenance first | Identity collapse or false reinforcement | Text equality creates no semantic conclusion | Proposed |
| ECA9 | Derived/common-origin content | Count separately; collapse entries; preserve relation | History loss or multiplier | Preserve identities and explicit dependency relation | Proposed |
| ECA10 | Contradiction identity | Free-text note; stable scoped relation | Conflict cannot be audited | Use stable `ContradictionRelation` | Proposed |
| ECA11 | Contradiction semantics | Lie/falsity inference; scoped conflict only | Hidden truth laundering | Record conflict without choosing truth | Proposed |
| ECA12 | Changed statements | Overwrite earlier; lie flag; linked relation | History rewrite or deception oracle | Preserve statements and explicit changed/conflict relation | Proposed |
| ECA13 | Documentary/testimonial conflict | Prefer document/witness globally; criterion-local relation | Source-type bias | Preserve both scopes and supplied conflict treatment | Proposed |
| ECA14 | Corroboration identity | Entry count; stable relation | No proposition/source provenance | Use stable `CorroborationRelation` | Proposed |
| ECA15 | Corroboration prerequisites | Matching text/count; explicit reinforcement + source analysis | Repetition becomes proof | Require proposition, criterion, scope, and source relation | Proposed |
| ECA16 | Corroboration meaning | Universal tier/score; local supplied semantics | Automatic truth/sufficiency | No universal ranking or numeric effect | Proposed |
| ECA17 | Credibility identity | Person stat; event-scoped assessment | Global witness labeling | Use stable `CredibilityAssessment` | Proposed |
| ECA18 | Credibility scope | Whole person; exact content/context | One statement contaminates all testimony | Bind to exact snapshot entry scope and criterion | Proposed |
| ECA19 | Credibility factors | Hardcoded doctrine; typed supplied hooks | Invented Korean/general law | Define hook families only; rule owns content | Proposed |
| ECA20 | Credibility inputs | Hidden state; authorized snapshot inputs | Lie detector/oracle | Prohibit ActualState, PersonKnowledge, deception, future data | Proposed |
| ECA21 | Unresolved credibility | Guess; global default; unresolved | Missing data becomes outcome | Preserve `unresolved` | Proposed |
| ECA22 | Credibility versus contribution | One object; explicit linked objects | Relevance and credibility collapse | Keep separate; criterion declares any interaction | Proposed |
| ECA23 | Criterion adapter | Direct finding; explicit `CriterionInput` | Assessment bypasses sufficiency | Construct provenance-bearing non-result adapter | Proposed |
| ECA24 | Aggregation | Sum/average/Bayesian/count; criterion-owned method | Universal proof formula | Leave combination to immutable supplied criterion | Proposed |
| ECA25 | Count as proof | Majority rule; provenance-aware topology | Copies manufacture sufficiency | Counts never decide absent explicit criterion semantics | Proposed |
| ECA26 | JudgeProfile | Evidence multiplier; inherited ambiguity gate only | Backdoor outcome preference | No DEC-033 profile effect; preserve DEC-013/014 gate | Proposed |
| ECA27 | Lawyer versus court analysis | WorkProduct mutates assessment; separate paths | Player prediction becomes court state | Require court-side assessment event and record basis | Proposed |
| ECA28 | Corrections and later snapshots | Mutate old assessment; create new bound assessment | Replay/history corruption | Preserve old object; assess later snapshot separately | Proposed |
| ECA29 | Multi-stage persistence | Rewrite trial assessment; stage-specific lineage | Appellate state erases history | Preserve stage/snapshot identities and explicit references | Proposed |
| ECA30 | Visibility | Expose hidden state; authorized projection | Oracle leakage | Show only authorized assessment/provenance/explanation | Proposed |
| ECA31 | Capability | Universal analysis skill; component WorkProducts | Skill forces finding | Use DEC-017/018 component effects only | Proposed |
| ECA32 | Workload | Free analysis points; DEC-026 tasks | Operational bypass | Use TaskAssignment/time/capacity | Proposed |
| ECA33 | Player/NPC model | Explicit player state; NPC percentage | Dual ontology | Require equivalent semantic objects | Proposed |
| ECA34 | Doctrine ownership | Architecture-defined credibility law; supplied rules | Invented doctrine | Architecture defines interfaces; authored criteria own meaning | Proposed |

---

## 21. Hard invariants

1. Every DEC-033 assessment consumes one identified immutable `CourtRecordSnapshot`.
2. No assessment may read entries absent from its snapshot.
3. No assessment may read entry scope outside the snapshot's permitted scope.
4. No assessment may read entries added after the snapshot cutoff.
5. No assessment may reach around the snapshot to CaseFileState.
6. No assessment may read unmaterialized SourceMaterial.
7. Every referenced entry retains stable identity and exact version.
8. Every referenced content portion retains exact scope.
9. Assessment scope cannot silently expand to the whole entry or source.
10. DEC-033 cannot alter CourtRecord membership, use status, or access state.
11. `ActualStateRecord` is never an assessment input.
12. Hidden `PersonKnowledge` is never an assessment input.
13. Hidden memory truth is never an assessment input.
14. Hidden deception or `isLying` state is never an assessment input.
15. Hidden relationship truth is never an assessment input.
16. Hidden judge belief is never an assessment input.
17. Future events are never an assessment input.
18. Desired outcome is never an assessment input.
19. Record inclusion does not automatically create contribution.
20. Procedural permission does not automatically create contribution.
21. `EvidenceContributionAssessment` has stable identity.
22. Every contribution assessment identifies snapshot, criterion/version, requirement, and proposition.
23. Every contribution assessment references exact entry versions/scopes.
24. Every contribution assessment preserves evaluator and rule/version provenance.
25. Contribution roles are criterion-local relations, not universal ranks.
26. `supports` does not automatically mean criterion satisfied.
27. `opposes` does not automatically mean criterion failed.
28. `irrelevant_to_this_criterion` is not a global property of an entry.
29. The same entry may have different roles for different criteria.
30. No entry has a canonical universal evidentiary value.
31. `SourceRelationAssessment` has stable identity and snapshot binding.
32. Different CourtRecord entries are not presumed to be different sources.
33. Different people are not presumed to have independent originating information.
34. Equal text does not prove common origin.
35. Equal text does not prove independence.
36. Equal text does not prove corroboration.
37. Same-source rematerialization retains distinct event/entry history.
38. Derived content retains both derivative and origin references where known.
39. Imported prior-stage content retains original provenance.
40. Unknown source independence remains `independence_unknown`.
41. Entry count cannot convert unknown independence to independence.
42. `CorroborationRelation` has stable identity and snapshot binding.
43. Every corroboration relation identifies proposition, criterion, entries, versions, and scopes.
44. Corroboration requires explicit reinforcing content under a supplied rule.
45. Corroboration records known dependency/independence context.
46. Repetition is not corroboration.
47. Common-origin repetition is not independent reinforcement.
48. Corroboration is not a score, percentage, or multiplier.
49. Corroboration does not create objective truth.
50. Corroboration does not satisfy a criterion automatically.
51. Corroboration does not create a `CourtFactFinding`.
52. `ContradictionRelation` has stable identity and snapshot binding.
53. Every contradiction identifies exact content scopes and aspect in conflict.
54. Contradiction does not determine which side is false.
55. Contradiction does not prove deception or lying.
56. Contradiction does not create a credibility penalty.
57. Apparent or contextual conflict may remain unresolved.
58. Changed statement does not imply lie.
59. Later statement does not overwrite earlier statement.
60. Documentary content does not receive automatic preference over testimony.
61. Testimony does not receive automatic preference over documentary content.
62. Contradiction does not universally erase contribution.
63. Corroboration does not universally override contradiction.
64. `CredibilityAssessment` has stable identity and snapshot binding.
65. Credibility attaches to exact content/context, not globally to a person.
66. One witness may have different assessments across statements and criteria.
67. No global witness credibility, reliability, honesty, or trustworthiness stat exists.
68. Credibility factors are supplied-rule hooks, not doctrine defined by DEC-033.
69. Credibility factors have no universal numeric weights.
70. Credibility factors have no universal priority order.
71. Profession, rank, age, gender, wealth, fame, or status creates no credibility bonus.
72. Partner status, NPC importance, relationship score, charisma, or skill creates no credibility bonus.
73. Missing credibility inputs produce unresolved state where the rule requires them.
74. Unresolved credibility cannot be repaired through hidden simulation state.
75. Credibility concern does not procedurally exclude testimony.
76. Credibility assessment does not mutate testimony, CourtRecord entry, or snapshot.
77. `CredibilityAssessment` is not `EvidenceContributionAssessment`.
78. A contribution may exist while credibility is unresolved if the supplied criterion allows it.
79. A document may contribute without a witness credibility assessment.
80. Credibility affects contribution only through explicit criterion/rule semantics.
81. `CriterionInput` has stable identity and deterministic construction lineage.
82. `CriterionInput` identifies exact snapshot, criterion/version, requirement, and proposition.
83. `CriterionInput` references exact assessments and relation identities.
84. `CriterionInput` is not a criterion result.
85. `CriterionInput` is not a sufficiency result.
86. `CriterionInput` is not JII.
87. `CriterionInput` is not a finding, judgment, or truth state.
88. DEC-033 defines no universal sum, average, weighted average, probability, vote, or threshold.
89. Three supporting entries do not beat one opposing entry by count alone.
90. Ten copies of one source do not become ten independent supports.
91. A criterion-specific combination method must be versioned and supplied by the criterion/rule.
92. Missing required rule or input remains unresolved/undetermined under inherited semantics.
93. Lawyer analysis is not court credibility or contribution assessment.
94. Lawyer WorkProduct cannot directly mutate court-side assessment or criterion input.
95. JudgeProfile is not an evidence, credibility, or corroboration multiplier.
96. JudgeProfile is consulted only through inherited criterion-declared genuine ambiguity gates.
97. DEC-033 cannot directly create `JudgeInterpretationInput`.
98. DEC-033 cannot directly create `CourtFactFinding`.
99. Same snapshot, rule versions, inputs, and context produce replay-stable semantics.
100. Reload cannot reroll credibility, contribution, contradiction, or corroboration.
101. A later snapshot creates new assessments rather than mutating old ones.
102. Old assessments retain original snapshot and rule-version bindings.
103. Later correction does not rewrite an old assessment.
104. Later-stage assessment does not rewrite trial-stage assessment.
105. Visibility is separate from canonical assessment existence.
106. Player visibility cannot expose hidden truth, lie state, weight, probability, future finding, or best interpretation.
107. Lawyer capability affects observable WorkProducts only and cannot force a court assessment or result.
108. DEC-026 Task/workload semantics govern lawyer-side analysis work; no EvidenceAnalysisPoints exist.
109. Player and NPC cases use the same assessment and criterion-input ontology.
110. NPC abstraction cannot replace semantic state with an evidence, credibility, proof, or win percentage.

---

## 22. Required chain evaluations

### 22.1 Source-aware corroboration input

```text
CourtRecordSnapshot CRS-1
→ CR-A v1[s1] + CR-B v2[s3]
→ SourceRelationAssessment SRA-1: independent under supplied provenance
→ CorroborationRelation COR-1 for proposition X / Criterion K1
→ EvidenceContributionAssessment ECA-1
→ CriterionInput CI-1
→ later DEC-012 evaluation
```

`COR-1` creates no score, truth, criterion result, or finding.

### 22.2 Prior statement and testimony conflict

```text
CRS-2
+ testimony-derived CR-T1[answer-2]
+ prior-statement-derived CR-P1[statement-4]
→ ContradictionRelation CON-2
→ optional CredibilityAssessment CA-2 under supplied rule
→ criterion-specific ECA-2
→ no automatic finding
```

The contradiction does not determine lying or which account is true.

### 22.3 Derived filing is not independent corroboration

```text
CRS-3
→ CR-T3[statement-X]
→ CR-D3 filing scope derived from CR-T3
→ SourceRelationAssessment SRA-3: derived/common-origin
→ repetition relation
→ no independent CorroborationRelation inferred
```

Both entries retain identity and may receive criterion-local assessments; they do not multiply proof.

### 22.4 Independence unknown

```text
CRS-4
→ CR-W4A from witness A
+ CR-W4B from witness B
→ provenance does not establish origin relation
→ SRA-4: independence_unknown
→ no automatic corroboration score or source-count inference
```

Unknown remains explicit rather than being resolved to favor either side.

### 22.5 One entry, different criteria

```text
CRS-5 / CR-5[p2]
→ ECA-5A supports identity criterion K-A
→ ECA-5B irrelevant_to_this_criterion for timing criterion K-B
→ ECA-5C unresolved for intent criterion K-C
```

The three assessments do not combine into a global entry value.

### 22.6 Later corrected snapshot

```text
CRS-S1 → CA-S1 + ECA-S1 + CI-S1
later correction enters CourtRecord under DEC-031
→ CRS-S2 → CA-S2 + ECA-S2 + CI-S2
```

Objects tied to `CRS-S1` remain unchanged. `CRS-S2` may support different assessments under the supplied rules.

---

## 23. Architecture attacks and permitted states

| # | Exact attempted transition | Why rejected | Permitted state and preserved provenance |
|---:|---|---|---|
| 1 | In `CRS-A1`, `CR-A1/CR-A2/CR-A3` support X for criterion `K-A1` → `ProofScore(X)=3` | Count is not criterion semantics or independence | Three exact entries/scopes remain; source relations and K-A1-local ECAs may be created, with no score |
| 2 | Equal text in `CR-A2 v1[s1]` and `CR-B2 v1[s1]` within `CRS-A2`, criterion `K-A2` → independent corroboration | Text equality establishes neither origin nor independence | `SRA-A2=independence_unknown` unless provenance supplies another relation; both identities remain |
| 3 | In `CRS-A3`, filing entry `CR-F3` derived from testimony `CR-T3`, criterion `K-A3` → two independent sources | Derived copy shares known origin | `SRA-A3=derived/common_origin`; both entries remain traceable without proof multiplication |
| 4 | In `CRS-A4` / criterion `K-A4`, `CON-A4` between `CR-W4A` and `CR-W4B` → `isLying(W4A)` | Contradiction cannot expose deception | `CON-A4` records exact scopes/aspect/context; truth and hidden witness state remain unchanged |
| 5 | In `CRS-A5` / criterion `K-A5`, `CON-A5` → `CredibilityScore(W5)=-20` | No global or numeric credibility penalty | A supplied rule may create scoped `CA-A5`; contradiction and explanation remain separate |
| 6 | In `CRS-A6` / criterion `K-A6`, witness `W-A6` is doctor/partner/police → credibility bonus in `CA-A6` | Profession/status is no default factor | Profession remains identity/context data; assessment uses only supplied lawful observable factors for exact content |
| 7 | Lawyer WorkProduct `WP-A7` labels `CR-A7` weak → court `ECA-A7=undermines` in `CRS-A7` / criterion `K-A7` | Lawyer analysis is not court assessment | `WP-A7` remains WorkProduct; court ECA requires snapshot, criterion, rule, evaluator, and trace |
| 8 | `CourtRecordEntry CR-A8` exists in `CRS-A8` → automatic contribution to criterion `K-A8` | Inclusion is not criterion linkage | `CR-A8` remains available record scope; an explicit K-A8-specific ECA is required |
| 9 | In `CRS-A9`, `ECA-A9` role `supports` X → criterion `K-A9` satisfied | Contribution is an input, not result | `CI-A9` may reference `ECA-A9`; DEC-012 evaluates K-A9 under its versioned rules |
| 10 | `COR-A10` reinforces X for criterion `K-A10` in `CRS-A10` → `Truth(X)` | Corroboration is not objective truth | `COR-A10` remains criterion-local relation with source/provenance and limitations |
| 11 | `COR-A11` in `CRS-A11` / criterion `K-A11` → `CourtFactFinding CFF-A11` | Relation cannot bypass criterion/sufficiency | `CI-A11` may carry the relation to inherited evaluation; no CFF exists from DEC-033 |
| 12 | `CA-A12=unresolved` for `CR-T12` in `CRS-A12` / criterion `K-A12` → testimony excluded | Credibility state is not procedural admissibility or record membership | Entry remains in `CRS-A12`; contribution follows supplied criterion semantics, and DEC-032/031 ownership is preserved |
| 13 | Hidden `PersonKnowledge PK-A13` → resolve `CA-A13` for `CR-T13` in `CRS-A13` / criterion `K-A13` | Hidden knowledge is an oracle | `CA-A13` remains unresolved if authorized `CRS-A13` content is insufficient |
| 14 | `ActualStateRecord ASR-A14` → source reliability for `CR-A14` in `CRS-A14` / criterion `K-A14` | Actual truth cannot enter assessment | ECA/SRA use only `CRS-A14` and supplied authorized inputs; ASR remains inaccessible |
| 15 | `JudgeProfile JP-A15` → evidence multiplier on `ECA-A15` in `CRS-A15` / criterion `K-A15` | Profile cannot bypass DEC-013/014 | ECA remains unchanged; only valid later genuine-ambiguity JII may affect its declared criterion scope |
| 16 | Five supporting entries vs two opposing entries in `CRS-A16` / criterion `K-A16` → majority wins | Count does not replace source relation or criterion | Seven scoped ECAs and relations may enter `CI-A16`; K-A16 alone owns supplied combination semantics |
| 17 | In `CRS-A17` / criterion `K-A17`, `CR-A17-1` is copied into four derived entries → five independent supports | Copies retain common origin | Five entry identities remain, with dependency/derived relations and no multiplier |
| 18 | Correction creates `CRS-A18-S2` for criterion `K-A18` → mutate `CA-A18-S1` bound to `CRS-A18-S1` | Assessments are immutable and snapshot-bound | `CA-A18-S1` remains tied to S1; a new `CA-A18-S2` may be created with correction lineage |
| 19 | Reload `CRS-A19 + CA-A19 + ECA-A19` for criterion `K-A19` → different credibility/contribution | Materialized semantics are replay-stable | Same identities, rule versions, inputs, roles, and explanations reload unchanged |
| 20 | NPC snapshot `CRS-N20`, criterion `K-N20` → `NPCEvidenceStrength=0.81` | NPC percentage is a second ontology | NPC path creates equivalent SRA/CON/COR/CA/ECA/CI objects with exact scopes and provenance |

---

## 24. Explicit non-goals and TBD hooks

DEC-033 does not define:

- objective truth, hidden witness knowledge, hidden deception, lie detection, or psychology simulation;
- Korean credibility doctrine or general evidentiary-weight doctrine;
- universal source reliability, Bayesian proof, numerical confidence, or probability;
- procedural admissibility, evidence use, objections, or CourtRecord construction;
- the factual-recognition result, sufficiency result, JII result, CourtFactFinding, or judgment;
- appellate standard of review, sentencing, or remedy;
- testimony/dialogue generation;
- UI, explanation presentation, database, save, API, Godot, or networking implementation; or
- balancing.

Exact factor content, contribution interpretation, source-independence treatment, conflict/corroboration consequences, and criterion combination remain supplied and versioned under inherited ownership. Missing doctrine remains TBD rather than inferred from generic or Korean legal knowledge.

---

## 25. Interaction with future decisions

The following should remain separate:

- any further factual-recognition/sufficiency integration beyond DEC-011/012;
- authored jurisdiction-specific credibility and evidence-contribution criteria;
- judgment and conclusion lifecycle;
- appeal/remand procedure and standards of review;
- courtroom reasoning and explanation UI; and
- player-facing analysis/explanation projections.

Future systems may reference DEC-033 stable identities and explanations. They may not rewrite assessments, add hidden inputs, or reinterpret relation labels as universal scores.

---

## 26. Verification strategy for later TEST-032

TEST-032 should use approximately 25–30 detailed high-risk fixtures, 15–20 focused attacks, and compact decision/invariant matrices. It should emphasize semantic boundary detection rather than case count.

Critical fixtures should cover:

- same text from the same source, a derived source, an unknown source, and a known independent source;
- filing content derived from testimony;
- independence unknown without favorable default;
- contradiction without lie/falsity inference;
- changed testimony across snapshots/hearings;
- unresolved credibility;
- one entry with different roles under different criteria;
- corroboration relations without score, truth, or automatic satisfaction;
- repeated/derived material without proof multiplication;
- hidden-state exclusion;
- lawyer analysis versus court assessment;
- JudgeProfile genuine-ambiguity boundary;
- old/new snapshot assessments after correction;
- trial/later-stage persistence; and
- player/NPC semantic equivalence.

High-risk cases should use full `Fixture → Manual verification → Expected → Observed → Verdict`. Lower-risk invariants should use compact matrices. No TEST-032 is created by this task.

---

## 27. Decision-quality checklist

For every extension or assessment, ask:

1. Which immutable `CourtRecordSnapshot` is the sole record input?
2. Which exact entry identity, version, and scope is analyzed?
3. Which proposition, criterion/version, and requirement are targeted?
4. What source/provenance relationship is actually known?
5. Is independence known, dependent, derived, common-origin, or unresolved?
6. Is this a contradiction relation, or is the design improperly inferring falsity?
7. Is credibility scoped to exact content/context, or incorrectly attached to the person?
8. Is alleged corroboration reinforcement under a supplied rule, or mere repetition?
9. Does contribution accidentally become a scalar, rank, multiplier, or universal value?
10. Does entry/source count influence outcome without criterion authority?
11. Is any hidden truth, knowledge, deception, judge belief, or future state being read?
12. Is JudgeProfile being used outside inherited genuine-ambiguity gates?
13. Is a later record change mutating an old snapshot-bound assessment?
14. Is DEC-033 supplying structured input, or secretly deciding sufficiency/finding?

If a required answer depends on unresolved doctrine, the content remains supplied/TBD.

---

## 28. Decision summary

DEC-033 adopts immutable, snapshot-bound, criterion- and proposition-specific semantic objects for provenance relationships, contradiction, corroboration, scoped credibility, evidence contribution, and criterion input. Repetition is not corroboration; contradiction is not lying; credibility is not a global witness trait; contribution is not weight; and no relation or assessment creates truth, sufficiency, JII, finding, or judgment. Inherited criterion logic alone interprets these structured inputs, and player/NPC matters share the same ontology.
