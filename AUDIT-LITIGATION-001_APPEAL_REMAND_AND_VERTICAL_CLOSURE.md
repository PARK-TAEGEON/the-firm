# THE FIRM — Appeal, Remand, and Litigation Vertical Closure Audit

**Document ID:** AUDIT-LITIGATION-001  
**Status:** v0.1 — Architecture closure audit / decision required  
**Document type:** Architecture audit; not a DEC or TEST  
**System:** Litigation  
**Repository authority:** Repository files only

---

## 1. Audit purpose and decision

This audit determines whether the repository already contains a complete semantic route for:

```text
trial judgment
→ appeal eligibility/initiation
→ distinct appellate stage
→ appellate record and immutable snapshot
→ appellate adjudication and judgment
→ supplied later effect or remand
→ remand stage with constrained scope
→ new proceeding / record / snapshot / adjudication / judgment
→ stage conclusion and eventual Matter closure
```

The audit does not test Korean appellate doctrine, implementation, UI, storage, AI behavior, or balancing. It asks only whether accepted or promotion-ready architecture provides stable owners, typed semantic hooks, exact stage/scope lineage, and non-destructive history.

### Decision summary

The architecture is semantically complete enough to support the full chain. No category-D architecture gap remains, and a new DEC-LITIGATION-035 is not justified.

The decisive repository evidence is:

1. DEC-010 already owns one-Case/multiple-stage identity, appeal states, party- and scope-specific grounds, transferred/allowed prior-record boundaries, abstract appellate result shapes, and a scoped remand input that identifies the challenged connection, higher-court reason, target stage, reopened scope, and preserved determinations.
2. DEC-031 supplies distinct stage-specific CourtRecords, explicit prior-stage import/reference lineage, immutable stage snapshots, exact imported scope, and append-only status/use history.
3. DEC-011/012/013/014/033 are stage- and snapshot-parametric. They can be used in appellate and remand stages without an appellate-only fact, credibility, sufficiency, or JII ontology.
4. DEC-034 supplies judgment identity/versioning, exact adjudicative basis, issuance, scoped operative dispositions, later effect/replacement hooks, appeal initiation and stage-creation hooks, remand/reopening hooks, stage conclusion, Matter-level closure eligibility, and explicit closure events.
5. The accepted and proposed verification documents exercise the key preservation paths. Their untested or partial areas are doctrine, content generation, implementation, or exact procedural effect—not missing semantic owners.

The result is architectural closure, not a claim that all repository status headers have been promoted or that jurisdiction-specific content and implementation are complete.

---

## 2. Sources reviewed and authority status

### 2.1 Foundation

| Source | Relevant inherited rule |
|---|---|
| [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) | Living Legal World state follows actual history and outcomes; organization size, reputation, or NPC identity cannot become a direct win modifier. |
| [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) | Cases owns case/progress state; Litigation owns legal process and result semantics; Career, Organization, Business, and World consume results without duplicating legal-state ownership. |
| [02_ARCHITECTURE_RULES.md](02_ARCHITECTURE_RULES.md) | Each state has one owner; cross-system effects are explicit; access does not authorize mutation; Case conclusion is applied by the owning system from Litigation results. |
| [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) | Litigation preserves stable IDs, actual work and reasons, uncertainty boundaries, and result provenance; hidden state, prestige, and undeclared formulas cannot decide outcomes. |

### 2.2 Primary cross-audit sources

| Source | Repository status | Audit use |
|---|---|---|
| [DEC-LITIGATION-010_APPEAL_AND_COURT_LEVELS.md](DEC-LITIGATION-010_APPEAL_AND_COURT_LEVELS.md) | v0.2, Accepted / TEST-009 verification required | Court-stage lineage, appeal initiation states, review scope, appellate result shapes, remand target/scope, preservation, NPC symmetry. |
| [TEST-009_APPEAL_AND_REMAND.md](TEST-009_APPEAL_AND_REMAND.md) | v0.1, manual comparison complete; doctrine/automation unverified | Confirms one-Case stage history, scoped appeal review, remand reason/scope transfer, and no reset. Partial results concern supplied legal criteria and engines. |
| [DEC-LITIGATION-031_CANONICAL_COURT_RECORD_MODEL.md](DEC-LITIGATION-031_CANONICAL_COURT_RECORD_MODEL.md) | v0.1, Proposed / design review required | Canonical stage record, import/reference provenance, immutable snapshots, cross-stage use constraints, append-only history. |
| [TEST-030_CANONICAL_COURT_RECORD_MODEL.md](TEST-030_CANONICAL_COURT_RECORD_MODEL.md) | v0.1, Proposed / manual fixture-level verification | PASS coverage for trial/appellate record identity, prior-stage import, remand context, snapshots, persistence, and NPC symmetry; recommends promotion. |
| [DEC-LITIGATION-034_JUDGMENT_DISPOSITION_AND_CASE_CONCLUSION_LIFECYCLE.md](DEC-LITIGATION-034_JUDGMENT_DISPOSITION_AND_CASE_CONCLUSION_LIFECYCLE.md) | v0.1, Proposed / design review required | Judgment versions, issuance, dispositions/effects, post-judgment state, appeal/remand hooks, stage conclusion, reopening, Matter closure. |
| [TEST-033_JUDGMENT_DISPOSITION_AND_CASE_CONCLUSION_LIFECYCLE.md](TEST-033_JUDGMENT_DISPOSITION_AND_CASE_CONCLUSION_LIFECYCLE.md) | v0.1, Proposed / manual fixture-level verification | 44 PASS / 0 PARTIAL / 0 FAIL; verifies appeal/remand history, stage/Matter separation, reopening, exact judgment identity, and replay stability; recommends promotion. |

### 2.3 Adjacent ownership sources inspected

| Source | Boundary used by this audit |
|---|---|
| [DEC-LITIGATION-008_FINAL_ADJUDICATION.md](DEC-LITIGATION-008_FINAL_ADJUDICATION.md) | Scope-specific final adjudication and explanation lineage; no hidden-input or score-based result. |
| [DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md](DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md) | Stage/snapshot-bound CourtFactFinding and append-only FindingLineage for later-stage review/remand. |
| [DEC-LITIGATION-012_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md](DEC-LITIGATION-012_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md) | Versioned criterion and sufficiency evaluation; no outcome-selected or hidden-state input. |
| [DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) | Stage/snapshot/criterion-scoped JII only after genuine ambiguity; no general evidence or appellate multiplier. |
| [DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md) | Authored, validated choice-point boundaries; no desired-outcome or missing-evidence repair. |
| [DEC-LITIGATION-030_HEARING_ORAL_ADVOCACY_AND_TRIAL_PRESENTATION.md](DEC-LITIGATION-030_HEARING_ORAL_ADVOCACY_AND_TRIAL_PRESENTATION.md) | ProceedingContext carries stable Matter/stage identity; hearing orchestration and RM gates are reusable in any supplied stage. |
| [DEC-LITIGATION-033_CREDIBILITY_EVIDENCE_CONTRIBUTION_AND_CORROBORATION.md](DEC-LITIGATION-033_CREDIBILITY_EVIDENCE_CONTRIBUTION_AND_CORROBORATION.md) | Snapshot-bound contribution/credibility ontology is reusable by later stages; prior-stage assessments remain immutable. |

### 2.4 Status precision

DEC-010 is marked Accepted, while DEC-031 and DEC-034 remain marked Proposed even though TEST-030 and TEST-033 recommend promotion. Therefore:

- this audit can conclude that no additional semantic DEC is required;
- it cannot silently rewrite those source statuses;
- “architecturally closed” below means that the semantic responsibility map is closed, subject to the repository's existing design-review/promotion process for already-authored documents;
- the status mismatch is a documentation/governance issue, not evidence for DEC-035.

---

## 3. Inherited boundaries preserved

The audited chain must preserve all of the following:

```text
ActualStateRecord
≠ CaseFileState
≠ CourtRecord
≠ CourtRecordSnapshot
≠ CourtFactFinding
≠ JudgeInterpretationInput
≠ AdjudicationResult
≠ Judgment
≠ OperativeDisposition
≠ CaseClosed
```

```text
TrialStage ≠ AppellateStage ≠ SupremeStage ≠ RemandStage
CourtLevel ≠ Stage ≠ Proceeding ≠ CourtRecord ≠ Judgment
TrialCourtRecord ≠ AppellateCourtRecord ≠ RemandCourtRecord
TrialJudgment ≠ AppellateJudgment ≠ RemandJudgment
historical state ≠ current operative projection
```

Additional inherited rules:

- appeal initiation does not mutate the appealed judgment;
- prior-stage record existence does not authorize later-stage use;
- an import/reference does not duplicate truth, weight, or source independence;
- later-stage adjudication uses its authorized immutable snapshot, not hidden CaseFile or ActualState data;
- later-stage findings and judgments receive new identities and do not overwrite trial objects;
- a later disposition/effect may change current operative treatment without deleting historical judgments or dispositions;
- remand opens only the supplied scope and preserves the remainder identified by the remand input;
- stage conclusion is not Matter closure;
- reopening or remand is an explicit event, not a Boolean rollback;
- player and NPC matters use the same ontology;
- no appeal, reversal, remand, finality, or closure score is canonical.

---

## 4. Gap-classification method

Every apparent omission is classified as:

| Class | Meaning | DEC-035 consequence |
|---|---|---|
| A | Already owned by accepted or promotion-ready architecture | None |
| B | Sufficient typed hook exists; jurisdiction/content rule remains supplied/TBD | None |
| C | Documentation, terminology, status, or cross-reference precision only | Clarify existing documents or governance record; no new semantic DEC |
| D | A required object/relation/state cannot be represented by the current DEC combination | Only this class may justify DEC-035 |

A supplied legal rule is not category D merely because its Korean-law content, deadline, standard, taxonomy, or effect is not authored.

---

## 5. End-to-end appeal lifecycle audit

### 5.1 Transition ownership matrix

| ID | Transition | Owning DEC(s) | Source object/state | Target object/state | Identity and provenance requirement | Supplied-rule hook | Audit result |
|---|---|---|---|---|---|---|---|
| AL-01 | Issued trial judgment → appeal eligibility/window state | DEC-010 A2; DEC-034 §§14, 16, 21 | `TrialJudgment` + `JudgmentIssuanceEvent` | party/scope-specific appeal eligibility/window state | Matter, trial stage, judgment/version, party, contested scope, time/order | Appealability, deadline, finality content | **B — supported hook; no gap** |
| AL-02 | Eligibility/review → actual appeal initiation | DEC-010 A2, A5, A12; DEC-034 §21 | eligibility state + party decision/work | `AppealInitiationEvent` / actual filed challenge | actor/party, appealed object, target scope, reason, basis, requested effect, filing/transmission provenance | Filing validity and opportunity rules | **A/B — usable semantic interface** |
| AL-03 | Initiation → allowed appellate progression | DEC-010 A2, A6 | initiation event | allowed appellate process scope | filing is distinct from permission; accepted review scope and dependent scope remain explicit | Jurisdiction, admissibility of appeal, allowed review scope | **B — supplied doctrine only** |
| AL-04 | Allowed progression → distinct appellate stage | DEC-010 A1; DEC-034 §§20–21 | allowed appeal progression | new `AppellateStage` | stable stage ID, predecessor stage/judgment, CourtLevel, opened scope, creation event/order | Stage-creation authority | **A — owned** |
| AL-05 | Appellate stage → stage proceeding | DEC-030 §4; DEC-010 A1/A6 | appellate stage | stage-bound `ProceedingContext` and zero/one/many proceedings | stable Matter/stage/proceeding identity and ordered events | Appellate procedure/briefing/oral-hearing content | **B — generic proceeding hook is sufficient** |
| AL-06 | Appellate stage → stage CourtRecord | DEC-031 §§4–5, 23 | appellate stage | `AppellateCourtRecord` | distinct record ID and stage/aggregation context | Record-creation/aggregation rule | **A/B — record semantics owned; aggregation policy supplied** |
| AL-07 | Trial material → appellate reference/import | DEC-010 A4/A7; DEC-031 §§12, 19, 23 | exact trial entry/version/scope or trial snapshot | explicit import/reference relation and permitted appellate context | original ID, source/RM lineage, exact imported scope, import event, authority, later-stage status/use | Transmission, inclusion, use, supplementation rules | **A/B — complete interface** |
| AL-08 | Appellate record history → immutable appellate snapshot | DEC-031 §§15–18 | stage record + cutoff + allowed-use rules | `AppellateCourtRecordSnapshot` | snapshot ID, record/stage, cutoff, exact versions/scopes, construction trace | Stage-specific allowed-use rules | **A — owned; content supplied** |
| AL-09 | Snapshot → contribution/credibility/criterion input | DEC-033 §§4–17 | exact appellate snapshot | stage-bound SRA/CON/COR/CA/ECA/`CriterionInput` objects as needed | snapshot, entry scope, proposition, criterion/version, evaluator and rule lineage | Stage-specific criterion/content | **A — reusable ontology** |
| AL-10 | Criterion input → finding | DEC-011/012; DEC-013/014 where genuine ambiguity exists | authorized snapshot and criterion inputs | appellate-stage `CourtFactFinding` or unresolved result | new finding ID, appellate stage, exact snapshot, criterion/version, prior-finding treatment relation | Recognition/sufficiency content and any valid ambiguity rule | **A/B — same engine, new context** |
| AL-11 | Findings/criteria → appellate adjudication result | DEC-008 with DEC-010 A6/A8 scope | stage-specific accepted findings/results | appellate `AdjudicationResult` | exact attacked scope, affected claims, maintained/changed/review-needed relations, explanation lineage | Substantive and appellate effect rules | **A/B — result structure exists** |
| AL-12 | Adjudication result → readiness/judgment | DEC-034 §§4–13 | fixed later-stage adjudicative outputs | readiness, draft/finalized version, issuance, appellate judgment | separate stage judgment ID/version, immutable basis, finalization and issuance event IDs | Judgment prerequisites and issuance rules | **A — lifecycle owned** |
| AL-13 | Appellate judgment → disposition/effect | DEC-010 A8; DEC-034 §§10–16 | issued appellate judgment/version | one or more scoped `OperativeDisposition` and effect states | parent judgment/version, exact claim/issue/party/prior-effect scope, effective event, authority | Appellate remedy/effect doctrine | **B — typed effect hook sufficient** |
| AL-14 | Appellate effect → prior-judgment operative projection | DEC-034 §§14–16 | scoped later judgment/disposition/effect event | changed current effect projection for exact prior disposition scope | historical prior judgment/disposition retained; later limit/replace/stay/preserve relation and effective point retained | Exact consequence of appellate outcome | **B — no history mutation required** |
| AL-15 | Appellate result → remand instruction/effect | DEC-010 A8/A11; DEC-034 §§15, 20–21 | appellate judgment/reason/disposition | `RemandEvent` or equivalent scoped transition | target stage, challenged connection, higher-court reason, remanded scope, preserved scope, authority, order | Binding force, exact open/closed issues, legal remedy terminology | **A/B — semantic scope exists; doctrine supplied** |
| AL-16 | Remand event → remand stage | DEC-010 A1/A11; DEC-034 §§20–21 | remand event/effect | distinct `RemandStage` or supplied continuation relation | new stable stage ID, predecessor judgment/stage, target court level, reopened/preserved scope | Stage routing and remand procedure | **A/B — sufficient transition** |
| AL-17 | Remand stage → new proceeding/record/snapshot/adjudication/judgment | DEC-030/031/033/011/012/013/014/008/034 | remand stage and scoped instruction | new stage-specific semantic chain | all new identities; explicit references to permitted prior objects; no copied truth or overwritten history | Permitted claims/evidence/proceedings and binding-scope content | **A/B — existing ontology repeats** |
| AL-18 | Stage result → stage conclusion | DEC-034 §§18–20 | stage dispositions/post-state | stage-scoped closure eligibility and conclusion/closure event | exact stage scope, terminal prerequisites, authority and event history | Stage terminal rules | **A/B — explicit scope required** |
| AL-19 | All relevant stages → Matter closure | DEC-034 §§18–20 | cross-stage terminal state | Matter-level `ClosureEligibilityAssessment`, `CaseClosureEvent`, `CaseClosed` | overall Matter scope, referenced judgments/dispositions/appeal/remand/performance states, rule/version | Matter terminal prerequisites | **A/B — no automatic closure** |

No row requires a second appellate-specific evidence, fact, credibility, JII, adjudication, judgment, or closure ontology.

### 5.2 Appeal initiation finding

The repository distinguishes:

```text
trial judgment exists
≠ appeal eligibility checked
≠ party review/work
≠ appeal filed
≠ allowed appellate progression
≠ appellate stage
≠ appellate judgment
```

DEC-010 A2 defines each state and explicitly says filing does not prove procedural validity, allowed review, or success. A5 requires an actual appealed target, reason, supporting basis, and requested scope/effect. A12 keeps party-specific and partial appeals separate. DEC-034 names the transition event and requires a distinct later stage.

An exact database-style field schema for `AppealInitiationEvent` is absent, but the semantic event is usable: its actor, target judgment/scope, reason/basis, requested effect, submission/transmission, stage relationship, and non-success meaning are supplied by DEC-010, while stable lifecycle-event provenance follows DEC-034 and general architecture rules. This is class B/C, not class D.

**Appeal initiation result: PASS.**

---

## 6. Appellate stage identity audit

DEC-010 A1 adopts one Case with accumulating Court Stage history rather than separate Cases or reset-based retry. Its model supports Trial, Appeal, Supreme, and Remand contexts without making all four mandatory.

The following distinctions are representable:

| Semantic object | Identity rule |
|---|---|
| CourtLevel | Supplied institutional/court-level context; not the proceeding or judgment itself |
| CourtStage | Stable occurrence in one Case, with predecessor and opened/affected scope |
| ProceedingContext | One stage-bound procedural context with its own event ordering |
| CourtRecord | One stage/aggregation-scoped canonical record with cross-stage lineage |
| CourtRecordSnapshot | Immutable allowed record view at one stage/cutoff/use context |
| CourtFactFinding | Stage- and snapshot-bound proposition finding |
| Judgment | Stage-specific versioned output with its own basis and issuance |

DEC-010 does not impose one appeal or one remand. Its append-only Case/stage model and requirement to identify each stage's predecessor judgment and scope naturally permit:

```text
Trial-1
→ Appeal-1
→ Remand-1
→ RemandJudgment-1
→ Appeal-2
→ later stage
```

Each stage requires a new identity and links; no existing object needs to be overwritten. Exact court hierarchy and jurisdiction remain supplied/TBD.

**Appellate stage identity result: PASS.**

---

## 7. Appellate record construction audit — high risk

### 7.1 Required chain

DEC-031 explicitly provides:

```text
TrialCourtRecord CR-T
→ immutable TrialCourtRecordSnapshot CRS-T
→ explicit appellate import/reference relation IR-A
→ AppellateCourtRecord CR-A
→ immutable AppellateCourtRecordSnapshot CRS-A
```

An imported or referenced prior-stage scope must retain:

- original entry identity;
- original CourtRecord and stage;
- original source, immutable source version, exact source scope, and RM lineage;
- exact imported or referenced scope;
- import/reference event identity;
- supplied authority/rule;
- appellate status/use context;
- snapshot cutoff and membership treatment.

The later stage may reference the original entry or create an explicitly derived/imported entry. It may not create provenance-less canonical text. DEC-033 then recognizes `imported_prior_stage`, same-source, derived, common-origin, and independence-unknown relations, preventing a later-stage copy from becoming new independent proof.

TEST-030 C02, C20, M01, and M02 apply these semantics to distinct trial/appellate records, imported trial entries, immutable trial snapshots, and remand record context. All are PASS.

### 7.2 Appellate record result

The architecture does not specify which trial materials appellate law permits, how the record is transmitted, or what supplementation is available. That is class B supplied content. The canonical identity, provenance, scope, status/use, and snapshot places needed to express the answer already exist.

**Appellate record construction result: PASS. No category-D gap.**

---

## 8. Appellate adjudication input audit

The accepted semantic chain is stage-parametric:

```text
AppellateCourtRecordSnapshot
→ exact permitted entry/version/scope
→ stage-specific source/contradiction/corroboration/credibility/contribution analysis
→ CriterionInput
→ versioned recognition/sufficiency evaluation
→ possible appellate-stage CourtFactFinding
→ final adjudication result for the allowed appellate scope
```

The later-stage evaluation cannot reach around its snapshot to use:

- hidden `ActualStateRecord`;
- private or unimported `CaseFileState`;
- unmaterialized source material;
- a trial entry outside the allowed import/use relation;
- future remand content;
- hidden judge belief;
- desired outcome;
- player or NPC success percentages.

DEC-011 already binds `CourtFactFinding` to a Court Stage and Record Snapshot and provides `FindingLineage` with prior finding, later stage, review/remand scope, treatment, later finding, and reason. DEC-012 consumes versioned criteria. DEC-013/014 require a stage/snapshot/criterion-declared genuine ambiguity before any JII. DEC-033 creates new stage-bound assessments rather than mutating trial assessments.

No parallel appellate fact engine is required. Different appellate standards or review constraints are supplied rules over the same objects.

**Appellate adjudication-input result: PASS.**

---

## 9. Appellate findings and judgment audit

The architecture supports:

```text
Trial CourtFactFinding CFF-T
≠ Appellate CourtFactFinding CFF-A

Trial Judgment JT/V1
≠ Appellate Judgment JA/V1

Trial OperativeDisposition OD-T
≠ Appellate OperativeDisposition OD-A
```

DEC-011 preserves earlier findings through `FindingLineage`; DEC-034 requires every later judgment to have its own stage, identity, version, immutable adjudicative basis, finalization, issuance event, reasoning, and disposition. A later stage may reference or treat a prior object but cannot rewrite it.

The architecture does not say whether an appellate tribunal may make any particular finding. That question is doctrine. If a supplied rule allows a later-stage finding, the object and lineage exist; if it does not, the same architecture can produce a judgment based on other authorized adjudicative outputs.

TEST-033 C28 and AP01–AP06 verify separate trial, appellate, and remand judgments and preservation when outcomes differ.

**Appellate finding/judgment result: PASS.**

---

## 10. Appellate outcome and prior operative-state audit

### 10.1 Outcome expression

DEC-010 A8 provides doctrine-neutral semantic result shapes: review not accepted, prior result maintained, specified part changed, specified conclusion changed, or additional lower-stage adjudication required. It explicitly allows different scopes in one appellate result and requires the prior target, allowed review scope, actual basis, reason, affected claim, and downstream need.

DEC-034 converts supplied adjudicative output into one or more typed, scoped `OperativeDisposition` objects. Each disposition carries parent judgment/version, target claim/issue/party/obligation/stage/Matter scope, exact effect, dependencies, effective timing, downstream consequences, appeal/remand hooks, and provenance.

Therefore a supplied rule can express, without a universal `Affirmed/Reversed` enum:

- leave an exact prior effect operative;
- replace or limit an exact prior effect;
- create a new later-stage effect;
- suspend or condition an exact effect;
- require a remand for identified scope;
- preserve unaffected scopes.

### 10.2 Historical judgment versus current effect

DEC-034 distinguishes:

```text
historical JudgmentVersion
≠ historical OperativeDisposition
≠ later effect event
≠ current derived operative projection
```

Its `DispositionEffectivenessEvent`, correction/amendment/limitation/replacement lineage, vacatur/reversal hooks, and multidimensional `PostJudgmentState` allow a later event to change future/current treatment while the prior judgment, issuance, disposition, and earlier effect state remain queryable.

Exact appellate legal effect remains supplied/TBD. The architecture does not need DEC-035 merely to define outcome labels or Korean effect doctrine.

**Outcome/effect result: PASS.**

---

## 11. Remand and scope-of-remand audit — high risk

### 11.1 Existing scope contract

DEC-010 A11 does not define remand as merely “start a new stage.” It requires a remand input to distinguish:

- which prior determination or connection was found problematic;
- the higher-court judgment and reason;
- what must be adjudicated again;
- the target stage/court context;
- the exact returned/reopened scope;
- which record and unchanged determinations are preserved;
- the relation between the explicit remand scope and actual dependencies.

Its accepted chain is:

```text
prior record
+ higher-court judgment
+ challenged connection and reason
+ remand target/scope
→ Remand Proceeding
→ required new work, submission, proceeding, and adjudication
```

DEC-034 adds an explicit `RemandEvent`/reopening transition and requires new proceeding, record, snapshot, adjudication, and judgment identities while preserving all trial/appellate objects. DEC-030 provides stage-bound proceeding orchestration, and DEC-031 provides the distinct remand record and immutable snapshots.

### 11.2 What remains supplied

The architecture intentionally does not decide:

- legal binding force of a higher-court reason;
- which new claims, arguments, or evidence are allowed;
- whether remand scope may expand;
- exact remand instructions or remedy labels;
- follow-on appeal availability.

These are content rules applied to the already-required scope fields and event relations.

### 11.3 Gap decision

The key category-D candidate is absent: the repository can identify what is reopened and what is preserved. Although DEC-034 says it does not define remand scope, DEC-010 already owns the architecture-level scope contract. DEC-034 is correctly limited to the judgment/lifecycle side.

The lack of a single consolidated English-named `RemandInstruction` schema is a documentation precision issue. It does not prevent the accepted concepts from expressing the transition.

**Scope-of-remand result: PASS. No category-D gap.**

---

## 12. Remand lifecycle and repeated-cycle audit

The combined architecture supports:

```text
Appellate Judgment JA/V1
→ scoped RemandEvent RE-1
→ RemandStage RS-1
→ ProceedingContext PC-R1
→ RemandCourtRecord CR-R1
→ immutable Snapshot CRS-R1
→ stage-bound assessments / CriterionInput
→ new CourtFactFinding(s), if supplied rules require
→ new AdjudicationResult AR-R1
→ new Judgment JR-R1/V1
```

Every prior object remains immutable and queryable. New remand content must use normal source, presentation, procedural permission, RM, CourtRecord, snapshot, and adjudication gates. The remand event does not import hidden truth or authorize all historical content.

Because stage identity and predecessor/scope links are not limited to one occurrence, the same pattern supports:

```text
Trial-1
→ Appeal-1
→ Remand-1
→ RemandJudgment-1
→ Appeal-2
→ Supreme-2 or another supplied stage
→ Remand-2
```

No special “second appeal” object or recursion-specific DEC is needed. Each occurrence uses new stable IDs and explicit lineage.

**Remand/repetition result: PASS.**

---

## 13. Stage conclusion, reopening, and Matter closure audit

DEC-034 provides separate stage- and Matter-scoped closure semantics:

```text
StageConclusion
≠ MatterClosureEligibility
≠ CaseClosureEvent
≠ CaseClosed
```

A trial or appellate stage can conclude while an appeal window, appeal, remand, correction, performance, enforcement, or unresolved scope remains. A later appellate stage or remand uses an explicit stage-creation/reopening/remand event. It does not unset a prior conclusion by mutation.

`ClosureEligibilityAssessment` can inspect supplied terminal prerequisites across relevant judgments, dispositions, settlement, performance, appeal/remand, and procedural state. `CaseClosureEvent` is still required after eligibility. Its scope and provenance are explicit, and closure never deletes records, snapshots, findings, judgments, or stage histories.

If a supplied rule later reopens a closed Matter, `CaseReopeningEvent` creates a new current projection while preserving the prior closure event. No `CaseClosed=false` rollback is allowed.

TEST-033 SC01–SC06, RO01–RO06, CL01–CL07, and C28 verify these boundaries.

**Vertical closure result: PASS.**

---

## 14. Cross-stage architecture attacks

### 14.1 CourtRecord attacks

| ID | Attempted invalid transition | Why invalid | Permitted state |
|---|---|---|---|
| CRA-01 | Appellate stage copies text of trial entry `CR-T-1` into new canonical `CR-A-1` with no import provenance | Violates DEC-031 materialization/import lineage and stable source identity | `IR-A-1` references `CR-T-1` and exact scope, or an explicit derived/imported entry retains original source/RM and import authority. |
| CRA-02 | `CRS-A-2` reads `TrialCourtRecord CR-T-2` entry outside any allowed reference/import/use rule | Snapshot may consume only its stage record state and supplied allowed-use context | The trial entry remains historical but absent from `CRS-A-2`; missing permission remains unresolved or excluded by trace. |
| CRA-03 | `RemandEvent RE-3` mutates `CRS-T-3` | DEC-031 snapshots are immutable | Create `RemandCourtRecord CR-R-3` and later `CRS-R-3`; `CRS-T-3` remains unchanged. |
| CRA-04 | Appellate exclusion event deletes trial entry `CR-T-4` | Later-stage use effect cannot erase original materialization | Preserve `CR-T-4`; append stage-specific use/status effect and construct later snapshots accordingly. |
| CRA-05 | `AppellateCourtRecord CR-A-5` replaces identity of `TrialCourtRecord CR-T-5` | Distinct stages cannot share one mutable canonical record identity | Retain both record IDs and explicit lineage between them. |
| CRA-06 | Two imports of `CR-T-6[p4]` become two independent sources | Entry/materialization count does not prove source independence | Preserve two import/materialization histories and same-source/common-origin relation; no proof multiplier follows. |

All six attacks are rejected by DEC-031/033 without appellate doctrine.

### 14.2 Judgment and finding attacks

| ID | Attempted invalid transition | Why invalid | Permitted state |
|---|---|---|---|
| JXA-01 | `AppealInitiationEvent AI-1` edits `TrialJudgment JT-1/V1` | Appeal creates later-stage history; it is not a correction event on the trial object | Preserve `JT-1/V1`; create appellate stage and later independent judgment. |
| JXA-02 | `AppellateJudgment JA-2/V1` overwrites `JT-2/V1` | Stage-specific judgments have distinct identity and basis | Retain both judgments; later operative projection follows explicit scoped effect events. |
| JXA-03 | Appellate finding `CFF-A-3` overwrites `CFF-T-3` | DEC-011 uses append-only FindingLineage | Preserve both findings and a later-stage treatment/review relation. |
| JXA-04 | `RemandEvent RE-4` deletes `JA-4/V1` | Remand is append-only and depends on the higher-court reason | Preserve appellate judgment/reason/disposition and open `RemandStage RS-4`. |
| JXA-05 | Remand judgment `JR-5/V1` silently becomes version V2 of trial judgment `JT-5` | A different stage requires a different judgment identity | Create a new remand-stage judgment with references to prior-stage objects; use versioning only within the identity/rule relationship actually supplied. |
| JXA-06 | Later effect event deletes historical disposition `OD-T-6` | Current operative treatment is not historical existence | Preserve `OD-T-6`; append a later scoped limit/replace/stay/preserve effect and derive the current projection. |
| JXA-07 | `CaseClosureEvent CCE-7` deletes appellate/remand records and judgments | Closure is an event, not destructive cleanup | Keep all stages, records, snapshots, findings, judgments, dispositions, and closure lineage queryable. |

All seven attacks are rejected by DEC-010/011/031/034.

---

## 15. Hidden-state, score, capability, and symmetry audit

The combined architecture rejects all of the following canonical shortcuts:

- `AppealSuccessChance`;
- `ReversalChance`;
- `RemandChance`;
- `AppellateWinProbability`;
- `AppealStrength`;
- `RecordStrength`;
- `JudgeAppealModifier`;
- `NPCAppealResultPercentage`;
- reputation, partner status, court level, or lawyer seniority as a direct result modifier;
- hidden `ActualStateRecord`, hidden CaseFile content, hidden judge belief, or desired outcome as later-stage input.

DEC-010 A15 permits NPC presentation compression only if stage, appealed scope, judgments/reasons, principal maintained/changed/remanded effects, work/time, and history remain semantically available. DEC-031 requires equivalent record entries/snapshots; DEC-033 requires equivalent assessment/input objects; DEC-034 requires equivalent readiness, judgment, disposition, effect, and closure objects.

Lawyer capability may improve observable work such as review, issue identification, source tracing, brief preparation, or scope organization. It cannot directly force appeal eligibility, review scope, appellate findings, judgment, remand, finality, or closure.

**Hidden-state/score/symmetry result: PASS.**

---

## 16. Responsibility matrix

`Status` uses only the audit categories requested: `OWNED`, `SUPPORTED BY HOOK`, `SUPPLIED/TBD CONTENT`, `AMBIGUOUS`, or `MISSING`.

| Semantic responsibility | DEC-010 | DEC-031 | DEC-034 | Other inherited DEC | Status | Gap? |
|---|---|---|---|---|---|---|
| Court level identity | Owns court-level/stage differentiation without fixed universal hierarchy | Record may carry court-level context | Judgment carries stage/court level | System ownership rules | **OWNED** | No |
| Stage identity | One Case with stable accumulated Trial/Appeal/Supreme/Remand stages | Stage-scoped record identity | Stage-scoped lifecycle/closure/reopening | DEC-030 stage-bound proceeding | **OWNED** | No |
| Appeal eligibility/window | Separates judgment, opportunity, review, filing, progression, and finality | — | Explicit PostJudgmentState hook | Authored law/content | **SUPPORTED BY HOOK** | No |
| Appeal initiation | Party/scope-specific actual filing state and ground contract | — | Names `AppealInitiationEvent` | DEC-026 work; Cases state | **OWNED** | No |
| Appeal-stage creation | Later allowed progression in same Case | Distinct later record supported | Explicit later-stage creation hook | DEC-030 ProceedingContext | **SUPPORTED BY HOOK** | No |
| Prior-stage references | Requires actual transmitted/allowed prior record and attacked judgment reasons | Stable entry/snapshot/judgment references | Judgment basis may reference prior judgment | DEC-011 FindingLineage | **OWNED** | No |
| Appellate CourtRecord | Defines transmitted/allowed content boundary at appeal level | Canonical distinct `AppellateCourtRecord` | Preserves across lifecycle | DEC-030/032 RM/procedure | **OWNED** | No |
| Appellate snapshot | Supplies stage/use scope inputs | Immutable cutoff-bound snapshot | Judgment preserves inherited lineage | DEC-011/033 consume snapshot | **OWNED** | No |
| Appellate adjudication input | Defines attacked/review scope | Supplies exact allowed record input | Consumes result only | DEC-011/012/013/014/033 | **OWNED** | No |
| Appellate findings | Preserves/reviews prior findings by allowed scope | Snapshot source | Judgment references without mutation | DEC-011/012 FindingLineage | **OWNED** | No |
| Appellate adjudication result | A8 result layers and exact affected scope | — | Fixed input to judgment lifecycle | DEC-008 final adjudication | **OWNED** | No |
| Appellate judgment | Prior judgment is attacked but preserved | Preserves basis record lineage | New stage-specific identity/version/basis/issuance | DEC-008/011–014/033 provide basis | **OWNED** | No |
| Appellate disposition | Abstract maintained/changed/remand-needed shapes | Record unaffected by result alone | Typed scoped OperativeDisposition | Supplied remedy/effect law | **SUPPORTED BY HOOK** | No |
| Prior judgment operative effect after appeal | Requires changed/unchanged scope | Historical record retained | Scoped effect, limitation, replacement, stay, current projection | Supplied appellate effect law | **SUPPORTED BY HOOK** | No |
| Remand event | A8/A11 require reason, target, and returned scope | Preserves record lineage | Explicit remand/reopening transition hook | Cases stage state | **OWNED** | No |
| Remand scope | Requires challenged connection, reason, target stage, reopened scope, preserved determinations | Exact imported scope/use supported | Carries remand event but does not redefine scope | Supplied binding/open-scope doctrine | **OWNED** at architecture level | No |
| Remand-stage creation | Same-Case follow-on stage | Distinct remand record | Explicit new proceeding/lifecycle hook | DEC-030 ProceedingContext | **SUPPORTED BY HOOK** | No |
| Remand record | Prior history/allowed use remains scoped | `RemandCourtRecord`, imports, immutable snapshot | Preserved through new judgment path | DEC-030/032 RM gates | **OWNED** | No |
| Remand adjudication/judgment | Calls for actual new work and adjudication | Supplies stage snapshot | New stage judgment identity/version/issuance | DEC-008/011–014/033 reused | **OWNED** | No |
| Multiple appeal/remand cycles | No one-cycle limit; stage predecessor/scope must be identified | Repeatable distinct records/snapshots | Repeatable explicit stage/reopening/remand events | Stable IDs and append-only history | **SUPPORTED BY HOOK** | No |
| Stage conclusion | Distinct historical stage remains | Records persist | Stage-scoped terminal assessment/event | Cases consumes exact state | **OWNED** | No |
| Matter closure | Does not follow merely from no appeal/result | Record persists after closure | Matter-level CEA + CCE required | Cases owns resulting Case status | **OWNED** | No |
| Reopening | Later stage does not reset Case | Prior records/snapshots stay immutable | Explicit Stage/CaseReopeningEvent | Supplied reopening authority | **OWNED** | No |
| History persistence | Core A1/A4/A6/A11/A15 rule | Append-only entries/status/snapshots | Append-only judgments/effects/closure | DEC-011/033 preserve assessments/findings | **OWNED** | No |
| Player/NPC symmetry | A15 same semantic boundary | Same record ontology | Same lifecycle ontology | DEC-030/033 same event/input ontology | **OWNED** | No |
| Deadlines, standards, review limits, exact effects | Explicitly left TBD | Consumes supplied use rules | Consumes supplied transition/effect rules | Authored jurisdiction content | **SUPPLIED/TBD CONTENT** | No |

No responsibility is `AMBIGUOUS` or `MISSING` at the semantic-architecture level after cross-reading the owning documents.

---

## 17. Apparent-gap classification

### 17.1 Category A — already owned

| ID | Apparent gap | Resolution |
|---|---|---|
| A-01 | Stable appellate/remand stage identity | DEC-010 A1 owns one-Case append-only stage lineage. |
| A-02 | Appeal scope and reason | DEC-010 A5/A6/A12 own party-, target-, reason-, basis-, and requested-effect-specific review scope. |
| A-03 | Cross-stage record and snapshot | DEC-031 owns distinct records, imports/references, exact scope, cutoff, and immutability. |
| A-04 | Later-stage findings | DEC-011 owns stage/snapshot findings and `FindingLineage`; DEC-012 owns criterion evaluation. |
| A-05 | Appellate adjudication input | DEC-033 and DEC-011–014 reuse the same stage/snapshot ontology. |
| A-06 | Later-stage judgment and disposition | DEC-034 owns separate judgment identity/version/basis/issuance and scoped operative dispositions. |
| A-07 | Remand target and reopened/preserved scope | DEC-010 A11 explicitly requires these semantics. |
| A-08 | Stage conclusion, reopening, and Matter closure | DEC-034 owns scoped terminal assessments/events and non-destructive reopening. |

### 17.2 Category B — sufficient hook; content supplied/TBD

| ID | Supplied area | Existing hook |
|---|---|---|
| B-01 | Appeal eligibility, window, and procedural validity | DEC-010 A2 states + DEC-034 PostJudgmentState/AppealInitiationEvent. |
| B-02 | Appellate jurisdiction and allowed review scope | DEC-010 A6 target/dependency/authority separation. |
| B-03 | Appellate record transmission, supplementation, and use | DEC-010 A4/A7 + DEC-031 import/use/snapshot rules. |
| B-04 | Standard of review and permissible appellate findings | Versioned stage-specific criteria and supplied adjudication rules. |
| B-05 | Exact appellate remedy/effect | DEC-010 A8 + DEC-034 scoped disposition/effect/replacement hooks. |
| B-06 | Binding force and open/closed remand issues | DEC-010 A11 scoped remand input + supplied rule/version. |
| B-07 | Appealability/finality/stay/performance/enforcement | DEC-034 multidimensional post-judgment/effect hooks. |
| B-08 | Overall terminal prerequisites | DEC-034 supplied `ClosureEligibilityAssessment` rule. |

### 17.3 Category C — documentation precision only

| ID | Issue | Why it is not a semantic gap | Recommended handling |
|---|---|---|---|
| C-01 | DEC-031 and DEC-034 still display Proposed status although TEST-030 and TEST-033 recommend acceptance | Objects and transition contracts exist and passed their manual fixtures; status metadata is governance, not missing ontology | Apply normal design-review/promotion bookkeeping to existing documents; do not create DEC-035. |
| C-02 | `AppealInitiationEvent` is named in DEC-034 while most of its payload semantics are described in DEC-010 as appeal-filing/ground states | Cross-reading yields actor, target, scope, reason, basis, requested effect, filing/transmission, and non-success semantics | Add a cross-reference or terminology map in a future non-semantic documentation pass. |
| C-03 | DEC-034 says it does not define remand scope, while DEC-010 A11 already owns the architecture-level remand-scope contract | Ownership is complementary: DEC-010 owns stage/review/remand scope; DEC-034 owns judgment/lifecycle transition | Clarify the cross-reference; do not duplicate the scope model. |
| C-04 | DEC-031 lists appeal/remand procedure among possible future DEC areas | DEC-010 already owns core appeal/remand semantics, and DEC-034 later supplies lifecycle hooks | Treat the note as superseded sequencing guidance, not evidence of an unowned responsibility. |

### 17.4 Category D — genuine semantic architecture gaps

None.

No missing object, relation, or state prevents representation of appeal initiation, later-stage identity, appellate record/snapshot construction, later-stage adjudication, appellate judgment/effect, scoped remand, repeated cycles, or eventual Matter closure.

---

## 18. DEC-035 threshold analysis

A DEC-LITIGATION-035 would be warranted only if the current architecture could not represent one of the following:

- the exact prior object being appealed;
- an actual party/scope-specific initiation distinct from eligibility and success;
- a distinct later stage;
- provenance-preserving prior-stage record import and use;
- an immutable later-stage snapshot;
- stage-specific findings and judgment;
- a scoped later operative effect distinct from historical judgment identity;
- the remand target, reopened scope, and preserved scope;
- a new remand-stage chain;
- stage conclusion distinct from Matter closure.

Every item is already owned or has a sufficient typed hook. What remains missing is authored legal content, exact implementation, or cross-document precision. Creating DEC-035 would therefore duplicate DEC-010, DEC-031, and DEC-034 or tempt doctrine invention.

**Recommendation: do not create DEC-LITIGATION-035.**

---

## 19. Litigation core vertical closure chain

At a high semantic level, the repository now supports:

```text
Matter intake and goals
→ authorized CaseFile access and legal work
→ Issue / CaseTheory / WorkProduct preparation
→ filing, written procedure, negotiation, or need-based hearing
→ witness examination, oral advocacy, and evidence-use procedure
→ explicit RecordMaterializationEvent
→ canonical CourtRecordEntry history
→ immutable CourtRecordSnapshot
→ criterion-specific source / contradiction / corroboration / credibility / contribution input
→ RecognitionCriterion and sufficiency evaluation
→ CourtFactFinding and FinalAdjudicationResult
→ JudgmentReadinessAssessment
→ finalized and issued JudgmentVersion
→ scoped OperativeDisposition and effect state
→ optional settlement, correction, appeal, remand, performance, or reopening
→ stage conclusion
→ Matter-level ClosureEligibilityAssessment
→ CaseClosureEvent
→ CaseClosed
```

At any appeal/remand point, the stage-bound record, snapshot, assessment, finding, adjudication, and judgment chain repeats with new identities and explicit lineage rather than a second ontology.

Accordingly:

```text
LITIGATION CORE VERTICAL
→ ARCHITECTURALLY CLOSED
```

This means only:

- the core litigation semantic responsibilities have owners and usable interfaces;
- jurisdiction-specific procedural and legal content remains supplied/TBD;
- database, save, API, Godot, AI, UI, and performance designs remain uncreated or incomplete;
- later features must preserve the accepted identity, provenance, record, finding, JII, judgment, and history boundaries;
- appeal/remand content may expand through authored rules without creating an appellate-only ontology.

It does not mean the entire game architecture is closed.

---

## 20. Regression check

| Regression boundary | Result |
|---|---|
| `ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding ≠ JII` | Preserved: later stages consume only authorized snapshots and valid criterion/JII paths. |
| `TrialStage ≠ AppellateStage ≠ RemandStage` | Preserved by DEC-010 stage identities and DEC-034 transition events. |
| `TrialCourtRecord ≠ AppellateCourtRecord ≠ RemandCourtRecord` | Preserved by DEC-031 distinct records and explicit import/reference lineage. |
| `TrialJudgment ≠ AppellateJudgment ≠ RemandJudgment` | Preserved by DEC-034 stage-specific judgment identity/version/basis/issuance. |
| Historical state ≠ current operative projection | Preserved by append-only judgments/dispositions/effect events and derived current state. |
| No overwrite-based lifecycle | Preserved across records, snapshots, findings, assessments, judgments, dispositions, closure, and reopening. |
| No provenance-less cross-stage copy | Preserved by DEC-031 exact source/RM/import lineage and DEC-033 dependency relations. |
| No hidden score or automatic appellate outcome | Preserved by DEC-010, DEC-033, and DEC-034 score prohibitions and supplied-rule gates. |
| No player/NPC dual ontology | Preserved by explicit symmetry requirements across stage, record, adjudication input, judgment, and closure. |
| No truth shortcut | Preserved: record, contribution, finding, adjudication, judgment, and operative effect remain separate. |

No proposed clarification in this audit changes these boundaries.

---

## VERDICT A — NO DEC-035 REQUIRED

Architecture gaps:
- 0; no category-D IDs.

Documentation-only issues:
- 4: C-01, C-02, C-03, C-04.

Supplied/TBD doctrine areas:
- appeal deadlines and eligibility; appellate jurisdiction; allowed review scope; standards of review; preservation-of-error rules; briefing and oral-argument procedure; record transmission/supplementation rules; exact appellate outcome and remedy effects; remand binding force and open/closed scope; stays; performance/enforcement; finality/res judicata; costs and fees.

Litigation vertical status:
- CLOSED

Confidence:
- High — DEC-010 expressly owns scoped appeal/remand stage semantics, DEC-031 supplies provenance-preserving cross-stage records and immutable snapshots, DEC-011–014/033 are stage-parametric, and DEC-034 supplies non-destructive judgment/effect/closure lifecycle hooks. The primary cross-stage fixtures in TEST-009, TEST-030, and TEST-033 preserve identity and history; their remaining limitations concern supplied doctrine, implementation, or repository promotion metadata rather than absent semantic responsibility.
