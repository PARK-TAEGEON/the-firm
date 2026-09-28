# DEC-LITIGATION-032 — Evidence, Exhibit Procedure, and Objections

**Status:** v0.1 — Proposed / design review required  
**System:** Litigation  
**Decision type:** Procedural evidence orchestration  
**Depends on:** Constitution; System Map; Architecture Rules; SYS-001; accepted litigation DEC/TEST chain through DEC-031 / TEST-030  
**Repository authority:** Repository files only

---

## 1. Decision purpose

This decision defines how an authorized material source is proposed for a particular courtroom use, challenged, answered or narrowed, ruled on, actually presented, and—only through the inherited materialization gate—made eligible for canonical CourtRecord treatment.

DEC-032 owns procedural evidence orchestration. It does not own legal doctrine, objective truth, credibility, evidentiary weight, factual recognition, sufficiency, JudgeInterpretationInput, CourtFactFinding, or judgment.

The governing question is:

> How can an attempted courtroom use of exact source content receive an explicit, provenance-preserving procedural result and effect without turning permission into truth or bypassing CourtRecord materialization?

---

## 2. Foundational boundaries

```text
SourceMaterial
≠ CaseFile material
≠ PresentationSelection
≠ EvidenceUseAttempt
≠ EvidencePresentationEvent
≠ ObjectionEvent
≠ ProceduralRuling
≠ ProcedurallyPermittedMaterial
≠ RecordMaterializationEvent
≠ CourtRecordEntry
≠ CourtRecordSnapshot
≠ CourtFactFinding
```

Likewise:

```text
presented
≠ marked
≠ challenged
≠ permitted
≠ limited
≠ admitted
≠ recorded
≠ considered
≠ believed
≠ true
≠ found
```

Procedural permission says only that an authorized ruling or supplied rule permits an exact use, scope, purpose, stage, or downstream operation. It does not establish truth, source credibility, judicial belief, evidentiary weight, criterion satisfaction, JII, a finding, or an issue outcome.

---

## 3. Inherited ownership

### 3.1 DEC-030 remains authoritative for

- `ProceedingContext` and hearing lifecycle;
- the `ProceedingEvent` ordering/provenance envelope;
- `EvidencePresentationEvent`, `ObjectionEvent`, and `ProceduralRuling` integration hooks;
- participant action placement, oral advocacy placement, and courtroom ordering;
- witness-examination placement; and
- orchestration and creation of `RecordMaterializationEvent`.

DEC-032 specializes the procedural evidence semantics carried by those hooks; it does not replace their proceeding identity or ordering semantics.

### 3.2 DEC-031 remains authoritative for

- `CourtRecord`, `CourtRecordEntry`, and stable entry identity;
- exact materialized scope and materialization lineage;
- entry status, use, access, correction, and supersession history;
- `CourtRecordSnapshot`, cutoff, selection, and immutability; and
- the prohibition on truth, JII, finding, and judgment shortcuts.

DEC-032 can provide procedural eligibility and exact allowed-use constraints to a later RM. It cannot create or mutate a `CourtRecordEntry` directly.

### 3.3 Other inherited ownership

- DEC-029 owns `QuestionAttempt`, `QuestionProceduralResult`, `WitnessAnswer`, and `TestimonyEvent`.
- DEC-017/018 own component capability and observable WorkProduct effects.
- DEC-019 and Case File architecture own authorized CaseFile state and access.
- DEC-025 preserves draft/finalized/submitted/filed/admitted/record distinctions.
- DEC-026 owns TaskAssignment, time, workload, capacity, owner, contributor, reviewer, and action actor distinctions.

---

## 4. Canonical procedural chain

The general chain is:

```text
authorized source/material
→ PresentationSelection
→ EvidenceUseAttempt
→ optional ObjectionEvent
→ optional ResponseOrCureAction
→ authorized ProceduralRuling
→ exact ProceduralUseEffect
→ possible EvidencePresentationEvent
→ possible RecordMaterializationEvent
→ possible CourtRecordEntry
→ later CourtRecordSnapshot
→ later adjudication
```

The chain is conditional, not mandatory choreography. An uncontested attempt may require no objection; an attempt may be withdrawn; a ruling may be pending or deferred; permission may cover only part of the proposed scope; actual presentation may never occur; and presentation may produce no RM or CourtRecord entry.

---

## 5. Semantic model

### 5.1 PresentationSelection

`PresentationSelection` is an internal WorkProduct-side choice identifying material considered for possible courtroom use. It retains source/version/scope and selecting actor provenance where authorized.

Selection does not create a courtroom action, mark an exhibit, offer material, request permission, trigger a ruling, or enter CourtRecord.

### 5.2 EvidenceUseAttempt

`EvidenceUseAttempt` is the canonical procedural request/action by which an actor attempts to use exact material in an identified proceeding context for an identified supplied purpose.

Its semantic requirements are:

- stable attempt identity;
- actor identity and action ownership;
- Matter, stage, proceeding, phase, and order;
- source object identity and immutable source version/snapshot;
- exact proposed source scope;
- intended purpose/use and any target witness, argument, question, issue, or event;
- supplied procedural-rule context;
- parent selection/action references where available;
- current derived procedural state; and
- append-only links to objections, responses, revisions, rulings, withdrawal, presentation, and later materialization eligibility.

An attempt is neither permission nor successful presentation. Its state is derived from historical events; it is not a destructive mutable summary.

### 5.3 Source and exact scope

Every attempt resolves against an immutable source version or snapshot. Scope is a typed source-relative selector, such as identified pages, paragraphs, statements, images, media intervals, answer portions, or another supplied immutable sub-scope.

```text
source object
≠ proposed use scope
≠ permitted use scope
≠ presented scope
≠ materialized scope
```

If the proposed scope is pages 4–5, no event silently reaches pages 1–3 or 6–20. A broader target requires an explicit new or amended attempt under a supplied rule, with lineage to the earlier attempt.

### 5.4 Purpose and context

Purpose is a typed supplied reference, not free-floating flavor text. It may distinguish use with a witness, use for a proposition, use during a phase, use in advocacy, presentation-only use, or record-eligibility use. DEC-032 defines how purpose is carried and constrained, not which purposes the law permits.

Permission for purpose P1 does not imply permission for P2, another witness, another phase, another scope, another proceeding, materialization, or adjudicative use.

### 5.5 Designation and marking hooks

Generic designation/marking events may identify or organize material under a supplied procedure. Each preserves actor/authority, source/version/scope, proceeding, order, supplied rule, and resulting designation state.

Names such as `identified`, `designated`, `marked`, `offered`, `presented`, `permitted`, `limited`, `excluded`, and `withdrawn` are interoperable status hooks only. No label supplies jurisdiction-specific doctrine, and none collapses into another state.

```text
marked ≠ offered ≠ presented ≠ admitted ≠ recorded ≠ true
```

### 5.6 Supplied ProceduralRule interface

A `ProceduralRuleRef` identifies authored rule content supplied outside this architecture. A rule definition may expose:

- stable rule/version identity;
- applicable Matter, stage, proceeding, phase, actor, action, source, and purpose contexts;
- exact evaluation target and scope;
- typed requirement hooks;
- actor eligibility and ruling authority;
- permitted response/cure opportunities;
- possible result vocabulary;
- exact effect-construction rules;
- temporal/effective conditions;
- presentation and materialization-eligibility consequences; and
- visibility/explanation policy references.

Architecture defines the interface and provenance. Authored legal content defines the condition. A rule evaluator may use only authorized observable inputs identified by the supplied rule; it may not inspect objective truth, hidden judge belief, hidden credibility, or outcome preference.

### 5.7 Requirement hooks

Typed requirement families may include identity/source, foundation, authentication, relevance/purpose, privilege restriction, hearsay-related restriction, competency, timing/form, or another authored family. These family names are routing hooks, not legal tests.

A `RequirementEvaluation` records the rule/version, target attempt/scope/purpose, authorized inputs, evaluator/authority where applicable, result, explanation visibility, and time/order. It does not itself become a ruling unless a supplied rule expressly designates the same authorized event as both, with both semantic roles preserved.

### 5.8 ObjectionEvent

An `ObjectionEvent` is an actor's procedural challenge or request. It requires:

- stable objection identity;
- objecting actor and proceeding role;
- Matter/stage/proceeding/phase/order;
- exact target event/action and target scope;
- one or more supplied ground/rule references where stated;
- stated objection content;
- visibility and explanation metadata; and
- parent/source references.

Valid targets may include an `EvidenceUseAttempt`, `QuestionAttempt`, `EvidencePresentationEvent`, oral-advocacy use, or another supplied procedural action. A target must be explicit; an objection cannot float over an entire source or hearing by implication.

```text
ObjectionEvent ≠ ProceduralRuling
```

An objection cannot exclude material, sustain itself, modify CourtRecord, or establish truth, falsity, credibility, JII, or a finding.

### 5.9 Multiple objections and grounds

One objection may cite multiple supplied grounds. Multiple objections, including objections by different eligible actors, may target one attempt or distinct scopes of it. Ground identity and scope remain separately traceable.

Count is not force. More objections or grounds produce neither a strength score nor an automatic procedural outcome. Only an authorized ruling supplies an effect.

### 5.10 Response, cure, and revised attempts

Where a supplied rule permits, an actor may respond, clarify, identify a source, narrow scope, change purpose, modify a question, replace a source, withdraw, or undertake another typed cure action.

`ResponseOrCureAction` retains actor, target objection/attempt, supplied rule, content, source/version/scope, purpose, order, and visibility. A cure attempt is not a successful cure or permission.

A material scope or purpose change creates a new `EvidenceUseAttempt` or explicit revision event with lineage to the original. The original proposed scope and challenge remain historical.

### 5.11 ProceduralRuling

`ProceduralRuling` is an authorized procedural decision concerning an exact target. It requires:

- stable ruling identity;
- authorized decision-maker and proceeding role;
- target objection, attempt, question, presentation, or supplied action;
- exact target source/version/scope and purpose;
- supplied rule/version reference;
- result label;
- explicit `ProceduralUseEffect`;
- stage/proceeding/purpose scope;
- event order and effective point;
- parent objections, responses, cures, and attempts;
- downstream presentation/materialization-eligibility consequences; and
- visibility/explanation references.

Generic result labels may include `permitted`, `disallowed`, `limited`, `sustained`, `overruled`, `withdrawn`, `deferred`, `pending`, `cured/modified`, `no-ruling-needed`, or another supplied result. This is not a complete procedural taxonomy.

### 5.12 Result and exact effect

A label such as `sustained` is insufficient by itself. `ProceduralUseEffect` identifies:

- affected attempt/action;
- source/version;
- exact permitted, prohibited, or unresolved scope;
- permitted/prohibited purpose, witness, phase, stage, or proceeding;
- whether presentation may proceed;
- whether the use is a candidate for later materialization;
- any temporal condition or pending dependency; and
- the supplied authority/rule that created the effect.

Result is descriptive; exact effect controls downstream eligibility.

### 5.13 Partial outcomes

Partial permission is first-class:

```text
Artifact A v1 [p1–p20]
→ EUA-1 proposes [p1–p20]
→ PR-1 permits [p4–p5] for purpose P1
→ permitted scope [p4–p5]
→ prohibited/limited scope [p1–p3, p6–p20] for that use
```

The source remains unchanged. `EUA-1` remains historical. A presentation or RM may use no broader scope than `[p4–p5]` under PR-1; it may use a narrower scope.

### 5.14 Withdrawal

Withdrawal is target-specific:

- objection withdrawal does not withdraw the use attempt;
- use-attempt withdrawal does not erase an objection;
- either withdrawal remains historical;
- neither directly withdraws a CourtRecord entry; and
- record-side withdrawal or limitation after materialization uses DEC-031 status/use lineage.

### 5.15 Pending and deferred state

Pending/deferred rulings preserve uncertainty and temporal order. Supplied rules determine whether the affected use pauses, continues conditionally, is temporarily limited, or awaits another event. No default binary outcome is inferred.

A later ruling appends a new event. It does not rewrite the attempt, objection, interim conduct, or earlier event order.

### 5.16 ProcedurallyPermittedMaterial

`ProcedurallyPermittedMaterial` is a derived, provenance-bearing view of exact source/version/scope/purpose permitted by explicit rule/ruling effects at an effective point. It is not a new source object and does not copy content into truth.

Its validity is contextual and temporal. It references the attempt, ruling/effect, rule/version, source/version/scope, purpose, stage/proceeding, and effective interval or order.

### 5.17 EvidencePresentationEvent integration

An `EvidencePresentationEvent` occurs only when material is actually shown, played, quoted, used, or otherwise presented. DEC-030 owns its proceeding placement and event envelope. DEC-032 requires its source/version/scope/purpose to be consistent with the then-effective procedural state.

A failed, disallowed, or withdrawn attempt may produce no presentation. A partially permitted attempt may produce only an exact permitted or narrower presentation scope. Presentation remains distinct from marking, admission, record materialization, truth, and finding.

### 5.18 Witness-examination integration

DEC-029's chain remains unchanged:

```text
QuestionAttempt
→ QuestionProceduralResult
→ possible WitnessAnswer
→ TestimonyEvent
```

An objection may target a `QuestionAttempt` or a material-use attempt associated with examination. An authorized ruling supplies the input from which the inherited `QuestionProceduralResult` is formed. A disallowed question produces no substantive answer unless a separate permitted attempt occurs. A narrowed question is a new linked attempt, not an overwrite.

Showing material to a witness does not cause recognition, agreement, memory, a favorable answer, truth, or credibility change. Any actual answer remains a `WitnessAnswer` under DEC-029.

### 5.19 Oral-advocacy integration

An exact use of material within oral advocacy may be targeted and ruled on under supplied rules. The procedural object identifies the precise advocacy event/action, material scope, and purpose. A lawyer's reference does not make the material evidence, permit every use, turn argument into evidence, or establish truth.

### 5.20 CourtRecord materialization gate

```text
ProcedurallyPermittedMaterial
≠ RecordMaterializationEvent
≠ CourtRecordEntry
```

Permission may establish eligibility consumed by a later materialization rule. It never creates a record entry itself. DEC-030 owns RM orchestration; DEC-031 owns entry creation and record state. A valid RM must reference an authorized exact scope no broader than the effective procedural permission and must independently satisfy its supplied materialization rule.

Presentation-only, witness-confrontation-only, record-eligible, purpose-limited, and future-use-prohibited states are distinct supplied procedural effects.

### 5.21 Append-only history and reconsideration

Attempts, objections, grounds, responses, cure actions, withdrawals, rulings, limitations, presentations, and materialization events are append-only at the semantic level. Later reconsideration or modification affects future procedural use only to its explicit scope and effective point.

If a CourtRecord entry already exists, any record-side future-use, access, exclusion, correction, or snapshot effect is represented through DEC-031. No DEC-032 event mutates an old `CourtRecordSnapshot`.

### 5.22 Visibility

Authorized projections may expose intended source/scope, purpose, objections, stated grounds, responses, rulings, exact effects, explanations, current known eligibility, and event history.

They do not automatically expose objective truth, hidden judge belief, hidden credibility/weight, future objections/rulings, a canonical best action, hidden opponent work, success percentages, or unavailable rule explanations. A sealed or restricted reason may still have canonical identity and effect; visibility is not procedural existence.

### 5.23 Capability and workload

DEC-017/018 component semantics may improve observable work: identifying a supplied requirement, organizing sources, narrowing scope, linking material to purpose, preparing a response, or detecting a procedural defect. No universal evidence, objection, trial, courtroom, admissibility, or persuasion score is permitted, and capability cannot force a ruling, answer, admission, exclusion, RM, finding, or victory.

DEC-026 applies to preparation, review, research, handling, attendance, revision, and record follow-up. These consume time/capacity through TaskAssignment. Matter owner, task owner, contributor, reviewer, and courtroom actor remain distinct. No EvidenceActionPoint or ObjectionEnergy system is introduced.

### 5.24 Player/NPC symmetry

Player and NPC matters use the same source, scope, attempt, objection, supplied rule, ruling, effect, presentation, RM-gate, and history ontology. NPC presentation may be compressed, but no hidden `AdmissibilitySuccess`, evidence total, or percentage may replace equivalent semantic state.

---

## 6. Design decisions

Each decision is proposed pending design review.

| ID | Problem | Alternatives | Failure mode | Recommendation | Status |
|---|---|---|---|---|---|
| EOP1 | Evidence-use attempt identity | Infer from presentation; mutable attempt; stable object | Failed/withdrawn attempts disappear | Use stable `EvidenceUseAttempt` before any successful presentation | Proposed |
| EOP2 | Selection versus attempt | Treat selection as courtroom act; keep separate | Internal planning becomes admission/use | `PresentationSelection` remains WorkProduct-side; attempt requires actor action | Proposed |
| EOP3 | Source version | Latest source; immutable referenced version | Later edits rewrite the attempted content | Bind every attempt to source identity plus immutable version/snapshot | Proposed |
| EOP4 | Proposed scope | Whole source; free text; typed exact selector | Silent scope expansion | Require typed exact proposed scope | Proposed |
| EOP5 | Purpose-specific use | One universal permission; purpose reference | Permission leaks across uses | Carry supplied purpose on attempt, ruling, effect, and presentation | Proposed |
| EOP6 | Context | Matter only; full proceeding coordinates | Actor/use ambiguity | Preserve Matter, stage, proceeding, phase, order, and relevant target | Proposed |
| EOP7 | Marking/designation | Equate with admission; generic hooks | Organizational labels become legal conclusions | Model typed procedural events/status hooks without doctrinal implication | Proposed |
| EOP8 | Rule ownership | Hardcode doctrine; supplied versioned rules | Invented or untraceable law | Use versioned `ProceduralRuleRef`; content remains supplied | Proposed |
| EOP9 | Rule evaluation inputs | Any simulation state; authorized observables only | Hidden truth or judge state decides procedure | Rule interface declares authorized inputs and evaluation target | Proposed |
| EOP10 | Requirement families | Define legal tests; typed hooks; untyped strings | Doctrine invention or unusable extension | Provide typed routing families with supplied content | Proposed |
| EOP11 | Requirement evaluation | Fold into ruling; separate traceable evaluation | Requirement provenance is lost | Record target, inputs, rule/version, result, and authority | Proposed |
| EOP12 | Objection identity | Dialogue text; stable event | No reliable target/history | Use stable `ObjectionEvent` | Proposed |
| EOP13 | Objection target | Entire hearing/source; exact action and scope | Challenge affects unrelated material | Require explicit target identity and exact scope | Proposed |
| EOP14 | Objection grounds | Built-in taxonomy; supplied references | Invented jurisdictional doctrine | Preserve one or more supplied rule/ground references | Proposed |
| EOP15 | Multiple grounds | Collapse to one; preserve independently | Ground provenance and partial rulings vanish | Preserve typed grounds and their target scopes separately | Proposed |
| EOP16 | Multiple objections | Merge; preserve events | Actor/order and different scopes disappear | Preserve each objection identity and relationships | Proposed |
| EOP17 | Objection effect | Self-executing; challenge only | Objection automatically excludes material | Objection has no procedural effect absent supplied rule/ruling | Proposed |
| EOP18 | Response/cure | No hook; generic action family | Architecture forces one choreography | Support supplied response/cure actions without assuming availability | Proposed |
| EOP19 | Cure success | Cure action equals success; ruling decides | Attempt bypasses authority | Cure remains an attempt until authorized result/effect | Proposed |
| EOP20 | Narrowed/revised attempt | Mutate original; new linked attempt/revision | Original scope/history is lost | Append a linked new attempt or explicit revision event | Proposed |
| EOP21 | Ruling identity | Status flag; stable event | Authority and chronology disappear | Use stable `ProceduralRuling` | Proposed |
| EOP22 | Ruling authority | Any actor/system; supplied eligible decision-maker | Unauthorized procedural mutation | Require supplied authority and proceeding role | Proposed |
| EOP23 | Ruling result | Binary only; extensible labels | Pending/partial cases are forced false | Permit extensible generic result labels | Proposed |
| EOP24 | Result versus effect | Label alone; exact effect object | “Sustained” cannot govern scope/use | Require explicit `ProceduralUseEffect` | Proposed |
| EOP25 | Partial permission | Whole-item boolean; scope algebra | Whole source is promoted | Record exact permitted, prohibited, and unresolved scopes | Proposed |
| EOP26 | Exclusion/limitation | Delete action; future scoped effect | History rewrite | Affect use only from stated effective point/scope | Proposed |
| EOP27 | Withdrawal targets | One generic withdrawal; target-specific events | Objection, attempt, and record are collapsed | Identify exactly what was withdrawn; retain history | Proposed |
| EOP28 | Pending/deferred decisions | Force pass/fail; explicit unresolved state | Premature permission/exclusion | Preserve unresolved state and supplied interim effect | Proposed |
| EOP29 | Uncontested use | Always invent objection/ruling; supplied no-objection path | Mandatory choreography | Allow supplied no-objection/no-ruling-needed path with traceable authority | Proposed |
| EOP30 | Presentation integration | Attempt equals presentation; actual event | Failed attempts appear as evidence shown | Create `EvidencePresentationEvent` only for actual presentation | Proposed |
| EOP31 | Presentation scope | Proposed scope; effective permitted or narrower scope | Disallowed content is shown | Validate presentation against effective exact effect | Proposed |
| EOP32 | Witness integration | Redefine DEC-029; procedural linkage | Witness semantics collapse | Link objection/ruling to inherited question result; retain DEC-029 objects | Proposed |
| EOP33 | Witness response to material | Auto-recognition/agreement; independent answer | Material launders hidden witness state | Preserve independent `WitnessAnswer` generation boundary | Proposed |
| EOP34 | Advocacy integration | Argument bypass; exact-use attempt | Advocacy turns material into evidence | Target exact advocacy use under supplied rule | Proposed |
| EOP35 | Materialization eligibility | Permission equals record; separate eligibility | RM gate bypass | Effect may confer only candidate eligibility | Proposed |
| EOP36 | CourtRecord gate | DEC-032 creates entry; require inherited RM | Record provenance is bypassed | RM remains mandatory; DEC-031 owns entry state | Proposed |
| EOP37 | Procedural history | Latest state only; append-only events/projection | Objections and failed attempts vanish | Retain every materialized event and derive current state | Proposed |
| EOP38 | Reconsideration | Rewrite ruling; later event | Audit and old snapshots break | Append later authorized event with future effect | Proposed |
| EOP39 | Visibility | Visibility equals existence/effect; separate projection | Sealed reasons cease to govern or leak | Separate canonical event/effect, access, and explanation visibility | Proposed |
| EOP40 | Capability | Universal skill/percentage; component effects | Hidden outcome shortcut | Use DEC-017/018 observable components only | Proposed |
| EOP41 | Workload | Free courtroom action; DEC-026 tasks/capacity | Operational systems are bypassed | Route preparation and participation through TaskAssignment/workload | Proposed |
| EOP42 | Player/NPC resolution | Explicit player chain; NPC percentage | Two ontologies and unauditable outcomes | Require equivalent semantic chain for both | Proposed |
| EOP43 | Doctrine ownership | Architecture embeds legal rules; supplied content | Generic/Korean law is invented | Architecture owns interfaces; authored rules own doctrine | Proposed |

---

## 7. Hard invariants

1. `PresentationSelection` is not a courtroom use attempt.
2. `EvidenceUseAttempt` requires stable identity.
3. Every attempt identifies the acting person/entity and proceeding role.
4. Matter ownership does not imply action ownership.
5. Every attempt identifies Matter, stage, proceeding, and order.
6. Every attempt references an immutable source identity and version/snapshot.
7. Every attempt carries an exact proposed source scope where scope is divisible.
8. Textual equality does not merge source, attempt, or event identities.
9. A later source edit cannot alter an earlier attempt's referenced content.
10. Proposed scope cannot expand without an explicit event and authority.
11. Purpose is separate from source and scope.
12. Permission for one purpose does not permit another purpose.
13. Permission for one witness does not permit use with another witness.
14. Permission in one phase, proceeding, or stage does not automatically transfer to another.
15. Marking or designation is not admission.
16. Offering is not presentation or admission.
17. Presentation is not procedural permission.
18. Presentation is not CourtRecord materialization.
19. Presentation is not truth or finding.
20. Rule content must be supplied and version-referenced.
21. Architecture-defined requirement families do not define legal doctrine.
22. A rule evaluator may use only inputs authorized by the supplied rule and architecture.
23. Objective truth cannot be an implicit procedural-rule input.
24. Hidden judge belief cannot be a procedural-rule input.
25. Hidden credibility or evidentiary weight cannot determine a procedural result.
26. `RequirementEvaluation` retains target, scope, rule/version, inputs, result, and provenance.
27. Requirement satisfaction is not permission unless an authorized rule/ruling creates that effect.
28. `ObjectionEvent` requires stable identity.
29. Every objection identifies its actor, role, proceeding, and order.
30. Every objection identifies an exact target action/event.
31. Every objection identifies exact target scope where relevant.
32. An objection may reference only stated/supplied grounds; unstated doctrine is not inferred.
33. Multiple grounds remain separately traceable.
34. Multiple objections remain separately traceable.
35. More grounds do not create an objection-strength value.
36. More objections do not create a favorable result.
37. An objection is not a ruling.
38. An objection cannot exclude material by itself.
39. An objection cannot alter CourtRecord by itself.
40. An objection cannot create truth, falsity, credibility, JII, or finding.
41. A response or cure action requires stable actor, target, rule, and order provenance.
42. A cure attempt is not successful cure or permission.
43. A narrowed or changed attempt cannot overwrite the original attempt.
44. A revised attempt preserves lineage to its predecessor and triggering challenge/cure.
45. A replacement source retains both old and new source histories.
46. `ProceduralRuling` requires stable identity.
47. A ruling requires a supplied authorized decision-maker.
48. A ruling identifies its exact target action, source/version/scope, and purpose.
49. A ruling retains supplied rule/version provenance.
50. A ruling result label is not a sufficient downstream effect.
51. Every operative ruling has an explicit exact `ProceduralUseEffect`.
52. Ruling effect identifies permitted, prohibited, and unresolved scope as applicable.
53. Ruling effect identifies purpose, stage, proceeding, and effective point as applicable.
54. `pending` or `deferred` does not imply permission or disallowance.
55. No binary result may be inferred where the supplied state is unresolved.
56. Partial permission does not mutate the source object.
57. Partial permission cannot silently promote the full source.
58. Presented scope under a ruling must be equal to or narrower than the effective permitted scope.
59. Materialization scope under a ruling must be equal to or narrower than effective record-eligible scope.
60. Permission is not truth, credibility, weight, JII, finding, or victory.
61. Disallowance is not falsity or lack of credibility.
62. Withdrawing an objection does not withdraw the use attempt.
63. Withdrawing an attempt does not erase related objections or responses.
64. Withdrawal never deletes its target's history.
65. DEC-032 cannot directly withdraw, delete, correct, or supersede a `CourtRecordEntry`.
66. Failed or withdrawn attempts need not create an `EvidencePresentationEvent`.
67. An `EvidencePresentationEvent` represents actual presentation, not intent.
68. One courtroom occurrence is not duplicated by its `ProceedingEvent` envelope.
69. Presentation must retain presenter, proceeding, order, source/version/scope, and purpose.
70. A question objection does not redefine `QuestionAttempt` or `QuestionProceduralResult`.
71. A disallowed question does not generate a substantive answer through that attempt.
72. A narrowed question is a new linked attempt, not a rewritten question.
73. Showing material to a witness does not cause recognition, agreement, memory, or a favorable answer.
74. `WitnessAnswer` remains independent of procedural permission and is not truth.
75. Argument referencing material is not evidence or universal permission.
76. `ProcedurallyPermittedMaterial` is a contextual derived view, not a new truth-bearing source.
77. Procedural permission may confer candidate eligibility but never creates RM.
78. `RecordMaterializationEvent` remains mandatory for CourtRecord entry creation.
79. DEC-031 alone owns canonical `CourtRecordEntry` and record-side status/use history.
80. No permitted courtroom use is assumed record-materializable without a supplied rule.
81. Every materialized procedural event remains historically queryable with stable identity.
82. Later rulings append; they do not rewrite earlier attempts, objections, rulings, or presentations.
83. Reconsideration changes only explicit future scope/effect from its effective point.
84. No DEC-032 event mutates an immutable prior `CourtRecordSnapshot`.
85. Reload cannot reroll a materialized attempt, objection, ruling, effect, presentation, or order.
86. Event history survives settlement, judgment, closure, appeal, and remand under inherited persistence rules.
87. Visibility is separate from canonical existence and procedural effect.
88. A hidden or sealed explanation does not erase the rule, ruling, or effect.
89. Visible material is not universally usable or materializable.
90. Player access cannot expose hidden truth, judge belief, credibility, future action, or best-action oracle.
91. No universal EvidenceSkill, ObjectionSkill, TrialTechnique, CourtroomSkill, AdmissibilitySkill, or PersuasionScore exists.
92. Capability can affect only observable WorkProduct/action components under DEC-017/018.
93. Capability cannot force ruling, admission, exclusion, answer, RM, finding, or outcome.
94. Evidence preparation and courtroom handling use DEC-026 workload and TaskAssignment semantics.
95. No independent EvidenceActionPoint, ObjectionEnergy, or equivalent resource exists.
96. Owner, contributor, reviewer, and actual courtroom actor remain distinct.
97. Player and NPC proceedings use the same procedural ontology.
98. NPC abstraction cannot replace events and provenance with a hidden success percentage.
99. Architecture cannot invent Korean or generic evidence doctrine through defaults.
100. Any unresolved doctrinal condition remains a supplied-rule hook or TBD.

---

## 8. Required chain evaluations

### 8.1 Uncontested permitted use

```text
SourceMaterial SM-1 v1
→ PresentationSelection PS-1 [p4–p5]
→ EvidenceUseAttempt EUA-1 [p4–p5, purpose P1]
→ supplied no-objection/no-ruling-needed authority
→ ProceduralUseEffect permits [p4–p5, P1]
→ EvidencePresentationEvent EP-1 [p4–p5, P1]
→ optional RM-1
→ optional CourtRecordEntry CR-1 under DEC-031
```

No step establishes truth or finding, and `CR-1` exists only if `RM-1` is valid.

### 8.2 Disallowed attempt

```text
EUA-2
→ ObjectionEvent OE-2
→ ProceduralRuling PR-2
→ effect disallows exact use
→ no EvidencePresentationEvent from EUA-2
```

`EUA-2`, `OE-2`, and `PR-2` remain historical.

### 8.3 Cure and partial permission

```text
EUA-3 [p1–p20, P1]
→ OE-3
→ ResponseOrCureAction RC-3 narrows scope
→ EUA-4 [p4–p5, P1], derived from EUA-3
→ PR-4 permits [p4–p5, P1]
→ EP-4 [p4–p5, P1]
```

The original attempt is not overwritten and no other pages are presented under PR-4.

### 8.4 Question objection

```text
QuestionAttempt QA-5
→ OE-5 targets QA-5
→ PR-5 with exact effect
→ inherited QuestionProceduralResult QPR-5
→ possible WitnessAnswer WA-5
→ possible TestimonyEvent TE-5
```

Only the inherited DEC-029 chain determines whether an answer/testimony event exists; the ruling does not create or dictate answer content.

### 8.5 Limited record-eligible scope

```text
EP-6 presents permitted A-6 v1 [p4–p5]
→ PR-6/effect makes [p4–p5] record-eligible
→ RM-6 materializes [p5] under supplied rule
→ CR-6 scope [p5]
```

RM scope may be narrower, never broader, than eligibility. DEC-031 owns `CR-6`.

### 8.6 Later ruling after materialization

```text
EUA-7 → PR-7 → EP-7 → RM-7 → CR-7
→ later PR-8 changes future procedural use
→ DEC-031 status/use event affects future record use if supplied
```

Earlier procedural history, `CR-7`, and prior snapshots remain intact.

---

## 9. Rejected shortcuts and permitted states

| # | Exact source and attempted forbidden target | Rejection | Permitted state and preserved history |
|---:|---|---|---|
| 1 | `PresentationSelection PS-1` → `AdmittedMaterial AM-1` | Selection is internal preparation, not procedural permission | `PS-1` remains a WorkProduct selection linked to source/version/scope; no attempt, ruling, presentation, or entry is inferred |
| 2 | `EvidenceUseAttempt EUA-2` → `EvidencePresentationEvent EP-2` where supplied `Rule R-2` requires permission | Attempt is not permission | `EUA-2` remains pending/challenged until an authorized effect permits exact use |
| 3 | `ObjectionEvent OE-3` → `ProceduralRuling PR-3` automatically | Challenge and ruling are distinct authorized acts | `OE-3` remains unresolved until a decision-maker creates a separate ruling |
| 4 | Grounds `G-4A/G-4B/G-4C` on `OE-4` → `ObjectionStrength=3` | Ground count is not force | Three ground references remain independently traceable; no score or outcome exists |
| 5 | Partner identity/reputation on actor `P-5` → favorable effect in `PR-5` | Role/reputation cannot force procedure | `P-5` remains objection actor; `PR-5` must derive from supplied rule inputs and authority |
| 6 | `EvidenceSkill=95` for lawyer `L-6` → favorable `PR-6` | Universal capability/outcome shortcut is prohibited | Observable preparation components may improve `WP-6`; ruling remains independent |
| 7 | `PR-7` permits `A-7 v1[p4–p5]` → presentation or RM of `A-7[p1–p20]` | Effect scope cannot expand | `EP-7`/`RM-7` may cover `[p4–p5]` or narrower; all scope and ruling provenance remains |
| 8 | Marking event `ME-8` for exhibit `A-8` → admitted status | Marking is organizational | `ME-8` remains a marking event; permission requires supplied rule/ruling |
| 9 | Procedurally admitted/permitted `A-9[p2]` → `Truth(X)` | Permission is not truth | The exact permitted-use view remains contextual; objective state is unchanged |
| 10 | Permitted material `PPM-10` → `CourtFactFinding CFF-10` | Procedure cannot bypass adjudication | `PPM-10` may support later eligible steps only; no finding exists |
| 11 | `PPM-11` → `CourtRecordEntry CR-11` without RM | Permission is not materialization | `PPM-11` remains eligible only; no `CR-11` exists until valid RM under DEC-030/031 |
| 12 | `EP-12` shows document `A-12` to witness `W-12` → recognition/agreement answer | Presentation cannot force witness state | `EP-12` exists; any `WitnessAnswer` is separately produced under DEC-029 |
| 13 | Later exclusion `PR-13B` → deletion of `EUA-13`, `OE-13`, or `EP-13` | Later effect cannot rewrite history | All earlier identities/order remain; `PR-13B` changes only explicit future use and invokes DEC-031 for record-side effects |
| 14 | Narrowed retry `EUA-14B[p4–p5]` → overwrite `EUA-14A[p1–p20]` | Revision is append-only | Both attempts remain linked with cure/ruling provenance |
| 15 | Later `PR-15B` → mutation of immutable `CourtRecordSnapshot CRS-15A` | DEC-031 snapshots are immutable | `CRS-15A` remains unchanged; a later snapshot may apply later record-side effects |
| 16 | Withdrawal `OW-16` → disappearance of `OE-16` | Withdrawal does not delete its target | `OE-16` and `OW-16` remain ordered; attempt state follows supplied rules |
| 17 | Player-visible material `A-17[p1]` → universal use permission | Visibility and procedural use are separate | Visibility remains authorized; each use still needs applicable supplied authority/effect |
| 18 | Restricted explanation for `PR-18` → rule/effect ignored | Access does not determine canonical existence | `PR-18`, its rule reference, and effect remain canonical; projection redacts only unauthorized explanation |
| 19 | NPC contest `EUA-N19` → `AdmissibilitySuccess=0.73` | NPCs cannot use hidden percentage resolution | NPC chain retains source/scope, objection if any, rule, ruling/effect, presentation, and RM gate |
| 20 | Reload of proceeding containing `PR-20` → different ruling/result/order | Materialized history is stable | `PR-20` reloads with the same identity, effect, provenance, and order |
| 21 | `EvidencePresentationEvent EP-21` → admitted material automatically | Actual showing does not supply permission/admission | `EP-21` records exact presentation; separate rule/ruling and RM are still required as applicable |
| 22 | Three objections `OE-22A/B/C` → stronger exclusion | Event multiplicity is not evidentiary force | Each objection remains separately targeted and ordered; authorized ruling determines effects |
| 23 | `PR-23` permits `A-23[p3]` for purpose `P1` → use for purpose `P2` | Purpose does not transfer silently | `P1` use is permitted; `P2` requires separate authority/attempt/effect |
| 24 | `ProceduralRuling PR-24` marked `permitted` → direct `JudgeInterpretationInput JII-24` | Ruling is not hidden cognition or adjudication | `PR-24` controls only its explicit procedural effect; JII remains unchanged |

---

## 10. Explicit non-goals and TBD hooks

DEC-032 does not define:

- Korean evidence law or any jurisdiction's evidence law;
- hearsay doctrine or exceptions;
- privilege, authentication, foundation, relevance, or competency doctrine;
- subpoena/compulsory process, oath, or perjury;
- exact exhibit numbering, marking, offering, admission, or objection terminology;
- exact objection grounds, timing, waiver, burdens, or standards;
- evidentiary weight, credibility, source independence, corroboration, duplicate contribution, or sufficiency;
- factual recognition, JII, CourtFactFinding, judgment, or appellate review doctrine;
- testimony/dialogue generation;
- UI/minigame behavior;
- save, database, serialization, API, Godot, or networking architecture; or
- performance and balancing.

These remain supplied rule/content hooks or later decisions. Absence of doctrine is not permission to infer generic or Korean procedure.

---

## 11. Interaction with future decisions

The following should remain separate DEC areas:

- authored jurisdiction-specific procedural evidence-rule content and authoring/validation;
- credibility and testimony adjudication inputs;
- evidence contribution, source independence, duplication, and corroboration semantics;
- factual recognition and sufficiency integration;
- judgment and conclusion lifecycle;
- appeal/remand procedure and standards of review; and
- courtroom/evidence UI and presentation projections.

Those systems may consume DEC-032 identities, scopes, rule references, effects, and histories. They may not retroactively redefine them.

---

## 12. Verification plan for later TEST-031

TEST-031 should use approximately 25–30 detailed critical fixtures, 15–20 focused attacks, and a compact invariant/decision coverage matrix. Full `Fixture → Manual verification → Expected → Observed → Verdict` treatment should be reserved for high-risk transitions.

Critical fixtures should cover:

- selection versus use attempt;
- use requiring permission but lacking it;
- supplied uncontested/no-ruling-needed use;
- objection without ruling;
- ruling without truth/JII/finding mutation;
- exact partial-scope permission;
- multiple objections and multiple supplied grounds without scores;
- response/cure and narrowed linked attempt;
- withdrawn objection and withdrawn attempt as distinct history;
- pending/deferred ruling and supplied interim effect;
- question-objection integration with DEC-029;
- permitted document use with witness disagreement;
- presentation without RM;
- exact-scope RM eligibility and materialization;
- later exclusion without procedural-history deletion;
- already-recorded material affected only through DEC-031 status/use lineage;
- stable reload and interruption/resumption order;
- capability component improvement without outcome forcing;
- visibility/restricted-reason separation; and
- player/NPC semantic equivalence without hidden percentages.

The test must not invent doctrine. Where a result needs legal content, the fixture must supply a versioned procedural rule and exact effect conditions.

---

## 13. Decision-quality checklist

For each future extension or fixture, verify:

1. What exact source, immutable version, and scope is used?
2. Who attempts the use, in which proceeding role and order?
3. What supplied purpose and context apply?
4. Which explicit supplied rule/version applies, and what inputs may it inspect?
5. Was an objection actually made?
6. What exact action and scope does it target?
7. Which authorized ruling authority acted?
8. What exact result and separate effect were created?
9. Which prior attempts, objections, responses, and rulings remain historical?
10. Can the result be explained without hidden truth, credibility, weight, or outcome preference?
11. Does permission accidentally imply truth, JII, finding, or victory?
12. Does permission accidentally bypass `RecordMaterializationEvent`?
13. Is the proposed rule architecture, or jurisdiction-specific doctrine that must remain supplied/TBD?
14. Which inherited DEC owns the adjacent object or state?

If any answer requires unresolved doctrine, the architecture must preserve a typed hook and leave the content TBD.

---

## 14. Decision summary

DEC-032 adopts a source-version-and-scope-specific procedural chain in which an actor makes an `EvidenceUseAttempt`, optional objections and cures remain distinct events, an authorized `ProceduralRuling` supplies a separate exact `ProceduralUseEffect`, and actual presentation occurs only within the effective permission. All history is append-only. Procedural permission neither establishes truth nor creates CourtRecord content. The inherited `RecordMaterializationEvent` gate remains mandatory, DEC-031 owns canonical record state, and player/NPC matters share one ontology.
