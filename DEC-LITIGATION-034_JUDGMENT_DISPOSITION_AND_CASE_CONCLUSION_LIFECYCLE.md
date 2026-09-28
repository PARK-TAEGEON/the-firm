# DEC-LITIGATION-034 — Judgment, Disposition, and Case Conclusion Lifecycle

**Status:** v0.1 — Proposed / design review required  
**System:** Litigation  
**Decision type:** Judgment / disposition / conclusion lifecycle  
**Depends on:** Constitution; System Map; Architecture Rules; SYS-001; accepted litigation DEC/TEST chain through DEC-033 / TEST-032  
**Repository authority:** Repository files only

---

## 1. Purpose

This decision defines the semantic lifecycle from accepted adjudicative outputs to judgment readiness, prepared and finalized judgment content, issuance, operative disposition, post-judgment state, and explicit case conclusion.

DEC-034 answers:

> How does a Matter become ready for judgment, preserve the exact adjudicative basis of an immutable judgment version, issue that judgment through an authorized event, apply scoped disposition effects, and become eligible for closure without collapsing hearing completion, findings, issuance, effectiveness, performance, appeal, or closure?

DEC-034 owns lifecycle orchestration. It does not recalculate evidence, credibility, findings, criteria, JII, substantive adjudication, remedies, enforcement, or appellate doctrine.

---

## 2. Foundational semantic boundaries

```text
HearingCompleted
≠ RecordState
≠ AdjudicationInputComplete
≠ CourtFactFinding
≠ AdjudicationResult
≠ JudgmentReadinessAssessment
≠ JudgmentDraft
≠ FinalizedJudgment
≠ JudgmentIssuanceEvent
≠ JudgmentIssued
≠ OperativeDisposition
≠ DispositionEffective
≠ JudgmentSatisfiedOrPerformed
≠ CaseClosed
```

```text
fact found
≠ judgment ready
≠ judgment content finalized
≠ judgment issued
≠ disposition effective
≠ case closed
```

```text
judgment issued
≠ appeal unavailable
≠ appellate/legal finality
≠ obligations performed
≠ Matter archived
```

No state in these chains implies the next state without an explicit supplied rule and event.

---

## 3. Inherited ownership

### 3.1 DEC-008 owns substantive final adjudication

DEC-008 remains authoritative for claim-scoped substantive conclusions, result derivation, burdens/required relations, partial result semantics, unresolved adjudication, and explanation lineage. DEC-034 uses stable references to those accepted outputs. `FinalAdjudicationResult` in this document is an interface label for the relevant DEC-008 output; it does not redefine that output.

Readiness and judgment preparation cannot choose a winner, repair an unresolved claim result, or recalculate the adjudication.

### 3.2 DEC-011 and DEC-012 own facts, criteria, and sufficiency

DEC-034 may reference `CourtFactFinding`, `RecognitionCriterion` versions, and accepted criterion results already used in adjudication. It cannot re-run sufficiency, create a new fact, invert an unresolved fact, or mutate any finding.

### 3.3 DEC-013 and DEC-014 own JII

Only valid JII already created and consumed through criterion-declared genuine ambiguity may appear in judgment-basis lineage. Judgment preparation and reasoning cannot create new hidden interpretation, infer JudgeBelief, or broaden an existing JII beyond its original scope.

### 3.4 DEC-031 owns CourtRecord

Judgment basis may preserve inherited references to immutable `CourtRecordSnapshot` and stable record entries. DEC-034 cannot inspect hidden CaseFile content, add or alter record entries, broaden snapshot scope, or mutate an old snapshot.

### 3.5 DEC-033 owns contribution and credibility input

Judgment lineage may reference the DEC-033 objects consumed by inherited adjudication. DEC-034 cannot re-score or reinterpret source dependence, contradiction, corroboration, credibility, contribution, or `CriterionInput`.

### 3.6 DEC-028 owns settlement formation

`SettlementAgreement` remains distinct from judgment, performance, procedural disposition, and closure. DEC-034 consumes a valid agreement only when a supplied procedural or closure rule references it; it does not redefine negotiation, acceptance, agreement formation, authority, or terms.

### 3.7 DEC-010 owns court stages and appeal/remand boundaries

One Case preserves accumulated trial, appeal, supreme, and remand stage histories. DEC-034 supplies stable judgment/disposition/conclusion hooks within that structure and does not define appealability, deadlines, standards of review, or appellate remedies.

---

## 4. Core lifecycle

```text
required inherited adjudicative outputs
+ required procedural state
+ supplied judgment prerequisites
→ JudgmentReadinessAssessment
→ optional JudgmentPreparationTask
→ optional JudgmentDraft
→ FinalizedJudgment version
→ JudgmentIssuanceEvent
→ JudgmentIssued state
→ one or more OperativeDispositions / DispositionEffects
→ post-judgment procedural state
→ optional appeal / correction / performance / remand events
→ ClosureEligibilityAssessment
→ CaseClosureEvent
→ CaseClosed state
```

This is a conditional semantic dependency chain, not universal courtroom choreography. Supplied rules decide whether preparation tasks, drafts, notice, delayed effectiveness, performance, or another step is required.

---

## 5. Hearing completion and written-only proceedings

`HearingCompleted` is evidence that one hearing ended. It does not establish record cutoff, complete adjudicative inputs, completed findings, completed claim results, or judgment readiness.

A completed hearing may coexist with:

- another required hearing;
- a pending supplied filing or input;
- a record cutoff not yet reached;
- incomplete or unresolved findings;
- unresolved claim-level adjudication;
- unresolved disposition scope; or
- another supplied prerequisite.

Conversely, a written-only proceeding may become ready without any hearing where its supplied readiness rule permits. DEC-034 does not impose a hearing prerequisite.

---

## 6. JudgmentReadinessAssessment

`JudgmentReadinessAssessment` is a stable, provenance-bearing evaluation of whether one Matter/stage/adjudicative context satisfies a supplied rule’s prerequisites for judgment production.

It identifies:

- stable assessment identity;
- Matter, Case, court stage/level, and adjudicative scope;
- supplied readiness rule and immutable version;
- required prerequisite identities and scopes;
- satisfied, unresolved, missing, and blocked prerequisites;
- referenced DEC-008 adjudicative output identities/versions;
- referenced `CourtFactFinding` identities;
- inherited `CourtRecordSnapshot` references where those outputs used them;
- evaluation time/order and cutoff context;
- evaluator/authority; and
- explanation lineage.

Open results may include `ready`, `not_ready`, `blocked`, and `unresolved`. These are architecture hooks, not universal doctrine.

`ready` means only that the supplied production prerequisites are satisfied. It does not select a party, alter a result, choose a remedy, strengthen evidence, resolve ambiguity, finalize text, issue judgment, or close the Matter.

Readiness is replay-stable for the same inputs and rule version. A later prerequisite event creates a new readiness assessment or explicit later assessment version; it does not rewrite the earlier assessment.

---

## 7. Judgment preparation and draft

Where supplied procedure requires preparation work, `JudgmentPreparationTask` uses DEC-026 workload semantics. It may gather existing basis references, organize reasons, prepare proposed operative text, identify unresolved drafting issues, and route review.

`JudgmentDraft` is a versioned preparation object with:

- stable draft and version identity;
- Matter/stage and target judgment identity where assigned;
- exact adjudicative-result and finding references;
- governing rule and valid JII references;
- reasoning structure and proposed disposition components;
- unresolved drafting issues;
- author/reviewer/authority roles;
- source draft lineage; and
- creation/revision order.

Drafting cannot modify the inherited adjudication. Draft quality, lawyer rank, or reviewer status does not alter the result. No `DraftQualityScore` exists.

```text
JudgmentDraft ≠ FinalizedJudgment ≠ JudgmentIssued
```

Draft revisions append versions or revision events. They do not erase earlier drafts or silently replace basis references.

---

## 8. Canonical Judgment and JudgmentVersion

`Judgment` is the stable identity for a judgment lineage within one Matter/stage/adjudicative scope. `JudgmentVersion` is an immutable content version in that lineage. A content-finalized version may also be referenced as `FinalizedJudgment`; this term means finalized content, not appellate/legal finality.

A judgment version preserves:

- stable judgment identity and stable version identity;
- Matter, Case, stage, court level, and adjudicative scope;
- exact DEC-008 adjudicative basis identities/versions;
- exact `CourtFactFinding` references;
- relevant `RecognitionCriterion`/rule versions;
- valid JII identities already used, if any;
- inherited record/snapshot lineage through the adjudication;
- canonical `JudgmentReasoning` references;
- proposed or attached `OperativeDisposition` references;
- content-finalization event/state;
- issuance-event reference if issued;
- correction/amendment/supplement/replacement lineage;
- visibility/access metadata; and
- provenance.

These are semantic requirements, not mandatory database fields.

---

## 9. AdjudicativeBasis

`AdjudicativeBasis` is an immutable reference bundle identifying the exact inherited outputs used for one judgment version. It does not copy those outputs into mutable judgment-owned facts.

Preferred lineage:

```text
JudgmentVersion
→ exact FinalAdjudicationResult/claim-result identities and versions
→ exact CourtFactFinding identities
→ exact criterion/rule versions
→ exact valid JII identities where applicable
→ inherited CourtRecordSnapshot lineage
```

The architecture must answer which outputs supported each judgment component and which scopes remained unresolved or outside the judgment. Later record, assessment, or finding changes cannot silently alter an issued judgment version. A supplied later process must create an explicit correction, amendment, replacement, appellate, or remand event/version.

---

## 10. JudgmentReasoning and OperativeDisposition

`JudgmentReasoning` is explicit canonical explanation. It identifies relied-on findings/results, applied rules, valid JII already used, relevant criterion/result lineage, unresolved matters outside scope, and the path from adjudication to proposed operative result.

```text
JudgmentReasoning ≠ OperativeDisposition
JudgmentReasoning ≠ hidden JudgeBelief
JudgmentReasoning ≠ JudgeProfile
```

Reasoning has no independent operative effect unless a supplied rule explicitly creates one through a typed disposition component. It cannot reveal private cognition or invent a post hoc basis.

`OperativeDisposition` is a stable, typed, scoped component defining the operative result under supplied doctrine. It identifies:

- stable disposition identity;
- parent judgment/version;
- target claim, issue, party, obligation, stage, or Matter scope;
- supplied disposition type;
- exact operative effect definition;
- dependencies and conditions;
- effective timing/rule;
- current derived effect status;
- downstream procedural consequences;
- performance/enforcement hooks;
- appeal/remand hooks; and
- authority/provenance.

DEC-034 supplies no jurisdiction-specific disposition taxonomy or remedy content.

---

## 11. Multiple and partial dispositions

One judgment may contain zero, one, or multiple disposition components as supplied. Separate claims, issues, parties, and scopes may receive different results. A partial disposition leaves all non-resolved scopes explicit.

```text
one Matter ≠ one mandatory disposition
partial disposition ≠ full stage conclusion
partial disposition ≠ CaseClosed
```

Later disposition of remaining scope is a separate component, judgment version, or later judgment as supplied. No “resolved percentage” or completion meter replaces exact scope.

---

## 12. Content finalization

`JudgmentFinalizationEvent` authoritatively fixes one exact `JudgmentVersion` for issuance under a supplied rule. The resulting `FinalizedJudgment` binds to its exact content and adjudicative basis.

Finalization does not mean issued, noticed, effective, non-appealable, performed, satisfied, or closed. A later textual or operative change requires explicit version lineage; finalized content is not edited in place.

---

## 13. Judgment issuance

`JudgmentIssuanceEvent` is the only event that creates the canonical `JudgmentIssued` state. It records:

- stable issuance-event identity;
- exact judgment/version;
- authorized issuing court/actor and role;
- Matter and stage;
- issuance time/order;
- supplied issuance rule/version;
- recipient/notice hooks where applicable;
- resulting issued-state reference; and
- provenance.

Finalized content does not issue itself. Notice/delivery/receipt may remain distinct supplied events; DEC-034 does not infer their legal effect.

---

## 14. Issuance, effectiveness, and finality

`DispositionEffectivenessEvent` or equivalent supplied event/rule changes the effective state of an exact disposition scope. A disposition may be immediately effective, effective later, conditional, stayed, partially effective, or not yet effective.

```text
JudgmentIssued ≠ DispositionEffective
JudgmentIssued ≠ non_appealable
JudgmentIssued ≠ appellate/legal finality
JudgmentIssued ≠ CaseClosed
```

Avoid an overloaded `final` field. Use explicit dimensions such as `content_finalized`, `issued`, `appeal_window_state`, `review_pending`, `operative_effective`, and `stage_concluded` only as generic hooks backed by supplied rules.

DEC-034 does not define appeal windows, finality, stays, or appealability doctrine.

---

## 15. Correction, amendment, supplementation, and replacement

Later authorized changes are append-only:

```text
Judgment J-1 / Version V1
→ CorrectionOrAmendmentEvent CA-1
→ Judgment J-1 / Version V2
→ explicit relation to V1
```

Each event/version identifies:

- parent judgment and prior version;
- change kind: supplied correction, amendment, supplement, limitation, or replacement;
- exact changed reasoning/disposition/content scope;
- authority and supplied rule/version;
- reason and effective point;
- whether the new version corrects, supplements, limits, or replaces specified content/effect; and
- downstream issuance/effect requirements.

V1 remains historically queryable. A correction is not deletion or retroactive fabrication. “Latest version” is a projection, not canonical history.

Vacatur, reversal, reconsideration output, and remand-related replacement are generic future hooks only. Their doctrine and operative consequences must be supplied.

---

## 16. PostJudgmentState

After issuance, `PostJudgmentState` is a derived, multidimensional projection over explicit events, not one terminal flag. It may reference:

- appeal eligibility/window status supplied elsewhere;
- appeal or review pending;
- correction/reconsideration pending;
- disposition effectiveness/stay state;
- unresolved claims or disposition components;
- performance/satisfaction state;
- enforcement or implementation task state;
- fees/costs or other supplied follow-up; and
- remand/reopened-stage state.

Issued judgment does not imply that any of these dimensions are complete.

---

## 17. Performance and satisfaction hooks

Where a disposition or settlement creates obligations, explicit `PerformanceEvent` and `SatisfactionEvent` hooks preserve obligation identity, scope, actor, amount/item where supplied, time/order, status, dispute, and authority/provenance.

Open states may include `performance_pending`, `partially_performed`, `performed`, `satisfaction_recorded`, `performance_disputed`, and `enforcement_required`. These are generic hooks, not enforcement or remedy doctrine.

```text
DispositionEffect ≠ obligation performed
obligation performed ≠ judgment satisfied
judgment satisfied ≠ CaseClosed
```

Performance against one obligation does not complete another obligation or unresolved claim by implication.

---

## 18. ClosureEligibilityAssessment

`ClosureEligibilityAssessment` is a stable, rule-based evaluation of whether a stage or Matter satisfies explicit terminal prerequisites. It identifies:

- stable assessment identity;
- Matter/Case and stage or overall closure scope;
- supplied closure rule/version;
- required judgment, disposition, settlement, performance, appeal/remand, and procedural prerequisite identities as applicable;
- satisfied, missing, unresolved, and blocked terminal requirements;
- referenced judgment/version, disposition, agreement, and event identities;
- evaluation time/order;
- evaluator/authority; and
- explanation lineage.

Potential requirements include all required dispositions issued, no current-stage unresolved claim, required follow-up complete, supplied settlement implementation complete, supplied performance/satisfaction complete, or no active remand requirement. None is universal unless the supplied closure rule declares it.

No `ClosureProgress`, `JudgmentCompleteness`, percentage, or universal checklist score exists.

---

## 19. CaseClosureEvent and CaseClosed

`CaseClosureEvent` is the explicit authorized event that creates a `CaseClosed` state for its exact scope. It records:

- stable closure-event identity;
- Matter/Case and stage/overall scope;
- closure authority and rule/version;
- closure basis;
- referenced readiness, judgment, disposition, settlement, performance, and prior-stage objects;
- unresolved items where the supplied closure rule permits them;
- time/order; and
- provenance.

Closure is not deletion, archive destruction, or history erasure. CourtRecord, snapshots, findings, adjudication outputs, judgments, dispositions, negotiations, and procedural histories remain queryable.

---

## 20. Stage conclusion, Matter closure, and reopening

The architecture distinguishes hearing completion, record closure, trial-stage conclusion, appellate-stage conclusion, and Matter-level closure. A stage may conclude while the Case remains open for appeal, remand, enforcement, or another supplied path.

If a supplied rule permits later activity after a concluded or closed state, it creates a `StageReopeningEvent`, `CaseReopeningEvent`, appeal-stage creation event, remand event, or equivalent explicit transition. It does not erase the closure event or silently set `CaseClosed=false`.

The current-state projection may become reopened/active while preserving the prior closure and reopening lineage.

---

## 21. Appeal and remand integration

DEC-034 exposes stable hooks:

```text
JudgmentIssuanceEvent
→ supplied appeal eligibility/window state
→ AppealInitiationEvent or no initiation event
→ distinct later court stage
```

An appeal cannot mutate the trial judgment. A later appellate judgment has its own stage, identity, version, basis, issuance, and disposition. It may reference the trial judgment under DEC-010 lineage.

A remand may create a new proceeding, CourtRecord, snapshot, adjudication, and judgment. Trial and appellate judgments, dispositions, findings, snapshots, assessments, and histories remain intact. DEC-034 defines no remand scope or appellate remedy.

---

## 22. Settlement interaction

```text
Acceptance
≠ SettlementAgreement
≠ performance
≠ ProceduralDisposition
≠ CaseClosure
```

A pre-judgment agreement may, through an explicit supplied implementation/disposition event, prevent or remove the need for a merits judgment in an exact scope. Agreement alone does not do so.

A partial judgment and later settlement may coexist. One claim may be resolved by judgment, another by settlement, and another remain pending. Closure depends on supplied terminal conditions across exact scopes.

Settlement performance uses DEC-028 agreement/obligation lineage and DEC-034’s generic performance/closure hooks without redefining the agreement.

---

## 23. Finding and JII immutability

Judgments reference inherited `CourtFactFinding` and valid JII identities; they do not own or mutate them. Later-stage different findings are new stage-specific objects. Trial findings remain historical.

JudgmentReasoning may explain a valid JII already used by inherited adjudication, but cannot create retroactive JII, infer broad JudgeProfile preference, or expose hidden JudgeBelief.

---

## 24. Visibility and player prediction

Authorized projections may show readiness state, known unmet prerequisites, finalized/issued judgment status, public or authorized reasoning, operative dispositions, effectiveness, post-judgment state, appeal/remand/closure events, performance/satisfaction, and version history.

They do not automatically show future judgment, hidden ruling, JudgeBelief, secret outcome before issuance, future appeal result, hidden closure date, predicted remedy, `JudgmentWinChance`, or `FinalityScore`.

Lawyer predictions about victory, timing, appeal, or remedy remain WorkProduct analysis and may be wrong. They are not readiness, judgment content, issuance, disposition, effectiveness, or closure state.

---

## 25. Capability, workload, and player/NPC symmetry

No universal `JudgmentSkill`, `JudgeDraftingSkill`, `ClosingSkill`, `AppealChanceSkill`, `OutcomeControl`, or `JudgmentPredictionScore` exists. Lawyer capability may improve observable tasks such as identifying missing submissions, organizing proposed findings, reviewing issued text, preparing filings, or monitoring performance. It cannot force readiness, judgment content, disposition, issuance, finality, closure, or appeal result.

Post-hearing and post-judgment work uses DEC-026 TaskAssignment/time/capacity semantics. Proposed findings, judgment review, correction requests, appeal preparation, enforcement preparation, performance monitoring, and closure checklists are finite work. No `JudgmentActionPoint` or `AppealEnergy` exists.

Player and NPC Matters use the same readiness, judgment/version, finalization, issuance, disposition, effect, post-judgment, correction, closure-eligibility, closure, and history ontology. Presentation may be compressed, but no `NPCJudgmentChance`, `NPCWinResult`, `NPCClosureProgress`, or `NPCFinalityScore` may replace semantic state.

---

## 26. Persistence and replay

For the same inherited adjudicative outputs, supplied rule versions, procedural state, and judgment events, readiness, content, issuance, disposition, effectiveness, and closure are replay-stable.

Reload does not reroll the winner, judgment, disposition, appeal state, effective state, or closure. Later state changes require later explicit events. Settlement, judgment, appeal, remand, closure, or reopening never deletes prior record or lifecycle history.

---

## 27. Design decisions

Each decision is proposed pending design review.

| ID | Problem | Alternatives | Failure mode | Recommendation | Status |
|---|---|---|---|---|---|
| JCL1 | Readiness identity | Boolean on Matter; stable assessment | Prerequisites and provenance disappear | Use stable `JudgmentReadinessAssessment` | Proposed |
| JCL2 | Readiness prerequisites | Universal list; supplied versioned rule | Invented doctrine | Rule/version owns exact required identities/scopes | Proposed |
| JCL3 | Hearing/readiness | Hearing completion implies ready; distinct | Missing inputs are skipped | Preserve `HearingCompleted ≠ ready` | Proposed |
| JCL4 | Written-only readiness | Hearing mandatory; supplied path | Written cases can never conclude | Permit ready without hearing when rule allows | Proposed |
| JCL5 | Adjudication/readiness | Ready chooses result; consumes fixed result | Lifecycle recalculates winner | Reference DEC-008 outputs without mutation | Proposed |
| JCL6 | Preparation work | Free implicit work; DEC-026 task | Workload bypass | Optional `JudgmentPreparationTask` | Proposed |
| JCL7 | Draft identity | Mutable text; versioned draft | Review rewrites history | Stable draft/version lineage | Proposed |
| JCL8 | Draft effect | Draft issues judgment; no operative effect | Preparation becomes state transition | Draft remains non-final/non-issued | Proposed |
| JCL9 | Judgment identity | One mutable blob; stable lineage identity | Corrections erase history | Stable `Judgment` plus immutable versions | Proposed |
| JCL10 | Judgment version | Latest-only; explicit version | Basis/content drift | Preserve exact immutable version and parent relation | Proposed |
| JCL11 | Adjudicative basis | Copy/recalculate; stable references | Findings/results diverge | Use immutable `AdjudicativeBasis` bundle | Proposed |
| JCL12 | Basis after later record change | Refresh issued judgment; preserve | Retroactive judgment mutation | Later change requires new explicit lifecycle object | Proposed |
| JCL13 | Reasoning/disposition | One text field; distinct objects | Explanation accidentally becomes operative | Separate canonical reasoning and typed disposition | Proposed |
| JCL14 | Reasoning visibility | Hidden cognition; explicit canonical output | JudgeBelief leaks | Reasoning cites actual basis only | Proposed |
| JCL15 | Disposition identity | Judgment label; stable component | Scope/effect cannot be traced | Stable `OperativeDisposition` | Proposed |
| JCL16 | Multiple/partial dispositions | One result; scoped components | Partial resolution closes Matter | Permit multiple exact disposition scopes | Proposed |
| JCL17 | Content finalization | Same as issuance; explicit event/state | Draft is treated as issued | Use `JudgmentFinalizationEvent` | Proposed |
| JCL18 | Issuance | Finalized implies issued; explicit event | No authority/time provenance | Require `JudgmentIssuanceEvent` | Proposed |
| JCL19 | Effectiveness | Issuance implies effective; supplied event/rule | Stay/condition cannot exist | Track exact disposition effectiveness separately | Proposed |
| JCL20 | “Final” terminology | One overloaded flag; explicit dimensions | Appellate finality collapses into drafting | Use content-finalized/issued/effective/review states | Proposed |
| JCL21 | Correction | Overwrite; new version/event | Issued history changes | Append exact-scope correction lineage | Proposed |
| JCL22 | Amendment/supplement | Edit latest; explicit version | Operative scope drifts | Append authorized version with change kind/scope | Proposed |
| JCL23 | Replacement/vacatur hook | Delete prior; preserved later event | Appeal/remand erases judgment | Retain prior version and supplied future-effect relation | Proposed |
| JCL24 | Post-judgment state | Closed flag; multidimensional projection | Pending work is hidden | Derive `PostJudgmentState` from explicit events | Proposed |
| JCL25 | Performance/satisfaction | Effect equals performance; separate events | Unperformed obligations disappear | Use typed performance/satisfaction hooks | Proposed |
| JCL26 | Closure eligibility | Automatic after judgment; rule assessment | Unresolved scopes are closed | Stable `ClosureEligibilityAssessment` | Proposed |
| JCL27 | Case closure | Status assignment; explicit event | Authority/basis absent | Require `CaseClosureEvent` | Proposed |
| JCL28 | Stage vs Matter closure | One closure; scoped closure | Appeal history and pending claims collapse | Preserve stage and Matter scope separately | Proposed |
| JCL29 | Reopening | Toggle closed false; explicit event | Closure history disappears | Require reopening/appeal/remand event | Proposed |
| JCL30 | Appeal integration | Mutate trial judgment; new stage lineage | Trial history rewritten | Reference DEC-010 and preserve stage judgments | Proposed |
| JCL31 | Remand integration | Reset Case; new stage/proceeding chain | Findings/records vanish | Append remand and new lifecycle objects | Proposed |
| JCL32 | Settlement interaction | Agreement closes case; supplied implementation | DEC-028 boundary bypass | Require explicit disposition/closure path | Proposed |
| JCL33 | Finding immutability | Judgment owns edits; stable refs | Findings change post hoc | Judgment only references inherited findings | Proposed |
| JCL34 | JII boundary | Reasoning invents interpretation; stable refs | Hidden preference bypass | Reference only valid inherited JII | Proposed |
| JCL35 | Readiness/completeness display | Percentage; requirement state | Score becomes doctrine | No universal readiness/completeness score | Proposed |
| JCL36 | Visibility | Expose future/hidden state; authorized projection | Outcome oracle | Show only materialized authorized lifecycle state | Proposed |
| JCL37 | Capability | Skill modifier; observable WorkProduct effects | Lawyer forces judgment | Preserve DEC-017/018 boundary | Proposed |
| JCL38 | Workload | Free action points; DEC-026 | Operational bypass | Use TaskAssignment and finite capacity | Proposed |
| JCL39 | Player/NPC | Explicit player chain; NPC percentage | Dual ontology | Same lifecycle semantics for both | Proposed |
| JCL40 | Persistence | Recompute latest; append-only events | Reload/history instability | Stable identities and replay from events | Proposed |
| JCL41 | Doctrine ownership | Hardcoded judgment/finality/remedy law; supplied rules | Generic/Korean doctrine invented | Architecture defines hooks; content remains supplied | Proposed |

---

## 28. Hard invariants

1. `HearingCompleted` is not `JudgmentReady`.
2. Hearing completion does not imply record cutoff.
3. Hearing completion does not imply adjudicative input completion.
4. Hearing completion does not imply all findings exist.
5. Hearing completion does not imply another hearing is unnecessary.
6. A written-only proceeding may become ready under an explicit supplied rule.
7. Readiness never requires a hearing unless the supplied rule requires one.
8. `JudgmentReadinessAssessment` has stable identity.
9. Every readiness assessment identifies Matter, stage, scope, rule/version, evaluator, and order.
10. Every readiness prerequisite has explicit identity and scope.
11. Readiness preserves satisfied, missing, unresolved, and blocked prerequisites distinctly.
12. `ready` means prerequisites satisfied, not winner selected.
13. Readiness cannot alter a DEC-008 adjudication result.
14. Readiness cannot create or modify `CourtFactFinding`.
15. Readiness cannot create JII or resolve ambiguity.
16. Readiness cannot select remedy or disposition content.
17. A later prerequisite event does not rewrite an old readiness assessment.
18. Same readiness inputs and rule version produce replay-stable semantics.
19. `CourtFactFinding` is not a judgment.
20. Existence of a finding does not create readiness or issuance.
21. DEC-034 cannot re-run recognition criteria or sufficiency.
22. DEC-034 cannot re-score DEC-033 credibility or contribution.
23. DEC-034 cannot read hidden CaseFile or ActualStateRecord.
24. A judgment basis references only authorized inherited outputs.
25. `JudgmentPreparationTask` uses DEC-026 workload semantics.
26. `JudgmentDraft` has stable identity and version lineage.
27. A draft cannot mutate adjudicative results or findings.
28. A draft is not content-finalized.
29. A draft is not issued.
30. A draft has no disposition effectiveness by itself.
31. Draft review or revision never overwrites prior draft history.
32. No `DraftQualityScore` or judgment-drafting outcome score exists.
33. `Judgment` has stable identity within its Matter/stage/scope.
34. Every `JudgmentVersion` has stable identity.
35. Every version binds to exact adjudicative-result identities/versions.
36. Every version binds to exact finding identities.
37. Every version retains relevant criterion/rule versions.
38. Every referenced JII must already be validly created and used under DEC-013/014.
39. Judgment preparation cannot create retroactive JII.
40. Judgment basis preserves inherited record/snapshot lineage.
41. Later record changes cannot mutate an issued judgment version.
42. Later findings cannot silently alter an existing judgment version.
43. Judgment issuance never rewrites historical findings.
44. Later-stage findings do not overwrite trial-stage findings.
45. `JudgmentReasoning` is not `OperativeDisposition`.
46. Reasoning has no hidden operative effect.
47. Reasoning cannot expose or infer hidden JudgeBelief.
48. Reasoning cannot invent an adjudicative basis absent from inherited output.
49. Every disposition has stable identity and parent judgment/version.
50. Every disposition identifies exact claim/issue/party/obligation/stage scope.
51. Disposition type and effect content remain supplied doctrine.
52. One Matter does not require exactly one disposition.
53. Multiple disposition components remain separately identifiable.
54. Partial disposition does not resolve omitted scope.
55. Partial disposition is not full stage conclusion.
56. Partial disposition is not Matter closure.
57. Unresolved claims remain explicit after partial disposition.
58. `JudgmentFinalizationEvent` fixes one exact content version.
59. Finalized judgment content is not issued judgment state.
60. Content finalization is not appellate/legal finality.
61. Content finalization is not disposition effectiveness.
62. Content finalization is not CaseClosed.
63. `JudgmentIssuanceEvent` has stable identity and authorized issuer.
64. Issuance references one exact finalized judgment version.
65. Finalized content cannot become issued without issuance event.
66. Judgment issuance is not notice, receipt, or performance unless supplied events say so.
67. Judgment issuance is not disposition effectiveness.
68. Judgment issuance is not non-appealability.
69. Judgment issuance is not appellate/legal finality.
70. Judgment issuance is not CaseClosed.
71. Disposition effectiveness requires its supplied rule/event.
72. Effectiveness may be scoped, delayed, conditional, partial, or stayed.
73. A vague `final` flag cannot replace explicit lifecycle dimensions.
74. Every correction/amendment/replacement event identifies authority, rule, changed scope, and prior version.
75. Correction creates new version/event lineage; it does not overwrite old content.
76. Amendment or supplement cannot erase the prior judgment version.
77. Replacement, reversal, or vacatur hooks preserve historical judgment identity.
78. “Latest version” is a projection, not canonical history.
79. Old issuance and effect events remain queryable after a later version.
80. `PostJudgmentState` is multidimensional and event-derived.
81. Issued judgment may coexist with pending appeal, correction, performance, or unresolved claims.
82. Disposition effect is not obligation performance.
83. Performance of one obligation does not perform another.
84. Performance is not judgment satisfaction unless an explicit event/rule says so.
85. Satisfaction is not CaseClosed.
86. Enforcement/performance doctrine is not defined by lifecycle labels.
87. `ClosureEligibilityAssessment` has stable identity and supplied rule/version.
88. Closure eligibility identifies exact terminal prerequisites and scopes.
89. Closure eligibility is not a percentage or progress score.
90. Eligible for closure is not CaseClosed.
91. `CaseClosureEvent` is required for canonical `CaseClosed` state.
92. Every closure event identifies authority, rule, basis, scope, and order.
93. Closure does not delete CourtRecord, snapshots, findings, judgments, or procedural history.
94. Stage conclusion is not necessarily Matter closure.
95. Trial-stage conclusion does not prevent a later appeal stage.
96. Reopening requires an explicit event and does not erase prior closure.
97. Appeal does not mutate the trial judgment.
98. Appellate judgment does not overwrite trial judgment or trial findings.
99. Remand does not delete prior judgments, dispositions, findings, snapshots, or assessments.
100. A remand-related judgment is a new stage-specific judgment/version lineage.
101. `SettlementAgreement` is not judgment, performance, disposition, or closure.
102. Settlement affects lifecycle only through explicit supplied implementation/disposition/closure events.
103. Judgment and settlement histories may coexist across distinct scopes.
104. Performance of settlement obligations does not itself close the Matter without a closure rule/event.
105. Player predictions are not canonical readiness, judgment, disposition, or closure state.
106. Lawyer capability cannot force readiness, content, issuance, disposition, finality, closure, or appeal result.
107. No universal judgment, finality, closure, or outcome score exists.
108. Player and NPC Matters use the same lifecycle ontology.
109. Reload cannot reroll materialized readiness, judgment, issuance, disposition, effectiveness, or closure.
110. All unresolved jurisdiction-specific judgment, remedy, enforcement, finality, and appeal content remains supplied/TBD.

---

## 29. Required chain evaluations

### 29.1 Ordinary judgment path

```text
CourtFactFinding refs
+ DEC-008 claim-level adjudication outputs
+ supplied procedural prerequisites
→ JRA-1: ready
→ optional JPT-1 / JD-1
→ Judgment J-1 / content-finalized V1
→ JIE-1
→ issued state for J-1/V1
→ OD-1 and supplied effect state
→ post-judgment state
```

No step recalculates findings or implies closure.

### 29.2 Completed hearing but not ready

```text
HearingCompleted HC-2
+ unresolved DEC-008 claim result AR-2B
→ JRA-2: not_ready
```

The hearing remains completed; no judgment draft/finalization/issuance follows from it alone.

### 29.3 Written-only ready path

```text
no hearing
+ completed supplied written procedure
+ fixed adjudicative outputs
→ JRA-3: ready under Rule-3
```

Readiness does not choose or alter the result.

### 29.4 Correction after issuance

```text
J-4/V1 content-finalized
→ JIE-4A issued
→ CorrectionEvent CE-4
→ J-4/V2
→ optional new finalization/issuance/effect events as supplied
```

V1 and its issuance remain historical.

### 29.5 Partial disposition

```text
OD-5A resolves claim A
+ claim B unresolved
→ stage closure eligibility: not_ready/unresolved
→ no full Matter closure
```

### 29.6 Effectiveness and performance

```text
JIE-6
→ issued judgment
→ supplied event makes OD-6 effective
→ performance_pending
→ no CaseClosed without closure eligibility + closure event
```

### 29.7 Settlement-driven conclusion path

```text
SettlementAgreement SA-7
→ supplied implementation/disposition event PDE-7
→ supplied performance state
→ CEA-7 under closure rule
→ optional CaseClosureEvent CCE-7
```

Agreement alone neither disposes nor closes the Matter.

### 29.8 Appeal and remand path

```text
trial Judgment JT-8/V1 + JIE-T8
→ AppealInitiationEvent AI-8
→ separate appellate stage and Judgment JA-8/V1
→ RemandEvent RE-8
→ new remand proceeding/adjudication
→ new Judgment JR-8/V1
```

Trial and appellate judgments, findings, records, and histories remain unchanged and referenceable.

---

## 30. Architecture attacks and permitted states

| # | Exact attempted transition | Why rejected | Permitted state and preserved history |
|---:|---|---|---|
| 1 | Trial Matter `M-A1`, `HearingCompleted HC-1` → `JudgmentReady` | Hearing completion proves only that hearing ended | `HC-1` remains; `JRA-A1` evaluates supplied prerequisites and may be `not_ready` |
| 2 | `CourtFactFinding CFF-2` in stage `S-A2` → `JudgmentIssued JI-2` | A finding is neither complete adjudication nor issuance | `CFF-2` remains immutable; readiness, judgment version, finalization, and issuance are still required as supplied |
| 3 | `JRA-A3=ready` for `M-A3/S-A3` → favorable winner | Readiness cannot select outcome | JRA references fixed DEC-008 outputs; no result or disposition changes |
| 4 | `JudgmentDraft JD-4 v3` → issued state | Draft is preparation only | Draft/version history remains; finalization and `JIE-4` are separately required |
| 5 | `FinalizedJudgment J-5/V1` → `JudgmentIssued` without issuance event | Content fixation is not issuance | J-5/V1 remains content-finalized; no issued state exists until authorized `JIE-5` |
| 6 | `JudgmentIssued JI-6` for `M-A6` → `CaseClosed` | Issuance does not prove terminal prerequisites | Issued state and OD history remain; CEA and CCE are separately required |
| 7 | `JudgmentIssued JI-7` → non-appealable/appellate-final | Issuance does not define appellate finality | Appeal/finality hooks remain unresolved under supplied DEC-010 rules |
| 8 | Issued `J-8/V1` → `OD-8 effective` without supplied rule/event | Issuance and effectiveness are distinct | OD-8 remains not-yet-effective or unresolved until explicit authority acts |
| 9 | `OD-9 effective` obligation O-9 → `performed(O-9)` | Operative obligation is not performance | O-9 remains performance-pending until a `PerformanceEvent` |
| 10 | `PerformanceEvent PE-10` completes O-10 → `CaseClosed` without closure rule | Performance is one possible terminal input, not closure | PE-10 remains; CEA-10 and CCE-10 are still required |
| 11 | Partial `OD-11A` for claim A → full closure of `M-A11` while claim B unresolved | Partial scope cannot close omitted scope | OD-11A remains effective for A; B remains unresolved and closure ineligible |
| 12 | `SettlementAgreement SA-12` → `CaseClosed` | Agreement is not implementation/disposition/closure | SA-12 and negotiation history remain; explicit downstream events are required |
| 13 | `CorrectionEvent CE-13` → overwrite `J-13/V1` | Correction is append-only | V1 remains; V2 records exact change, authority, relation, and effect timing |
| 14 | `AppealInitiationEvent AI-14` → mutate trial `JT-14/V1` | Appeal creates later-stage history | Trial judgment/basis/issuance remain; appellate stage uses separate objects |
| 15 | `RemandEvent RE-15` → erase trial judgment `JT-15` | Remand cannot rewrite history | Trial/appellate judgments and findings remain; remand creates a new proceeding chain |
| 16 | `JudgmentReasoning JR-16` → hidden `JudgeBelief JB-16` | Explicit reasons are not private cognition | JR-16 cites inherited basis/JII only; no hidden belief object is exposed or created |
| 17 | `JudgeProfile JP-17` → judgment/disposition multiplier for `J-17` | Profile cannot control outcome | Fixed adjudication basis remains; only inherited valid JII may be referenced |
| 18 | Lawyer `JudgmentSkill=95` → favorable `OD-18` | Capability cannot force canonical judgment | Lawyer WorkProduct may improve; J-18/OD-18 remain determined by inherited output and supplied rules |
| 19 | Reload issued `J-19/V1 + JIE-19 + OD-19` → different result | Materialized lifecycle is replay-stable | Same version, basis, issuance, disposition, and order reload unchanged |
| 20 | NPC Matter `M-N20` → `WinChance=0.82` / `FinalityScore=90` | NPC percentage is a second ontology | NPC path preserves JRA, judgment/version, JIE, OD, CEA, CCE, and provenance |
| 21 | `CaseClosureEvent CCE-21` → delete `CourtRecord CR-21` and judgment history | Closure is not destruction | CR-21, snapshots, findings, judgments, dispositions, and CCE-21 remain queryable |
| 22 | Appellate judgment `JA-22/V1` → overwrite trial findings `CFF-T22` | Later-stage judgment cannot mutate prior findings | CFF-T22 and trial judgment remain; appellate/remand findings use separate stage identities |

---

## 31. Explicit non-goals and TBD hooks

DEC-034 does not define:

- Korean judgment doctrine or any jurisdiction-specific judgment form;
- remedy doctrine, damages calculation, costs/fees, interest, or sentencing;
- enforcement, satisfaction, stay, bankruptcy, or res judicata doctrine;
- appeal deadlines, appealability, standards of review, or appellate remedies;
- settlement formation or negotiation rules;
- evidence, credibility, CourtRecord, fact finding, sufficiency, or JII;
- judgment-writing AI or natural-language generation;
- UI, database, save, API, Godot, or networking implementation; or
- balancing and economic/reputation consequences.

All such content remains inherited, supplied, or TBD. No gap may be filled from generic or Korean legal knowledge.

---

## 32. Interaction with future decisions

Likely separate areas are:

- detailed appeal/remand procedure only if DEC-010 plus these hooks prove insufficient;
- authored jurisdiction-specific judgment and remedy rules;
- enforcement, performance, and satisfaction systems;
- litigation-result and explanation UI;
- firm-economic consequences of judgments; and
- reputation/business consequences.

No later DEC is required merely for numbering symmetry.

---

## 33. Verification strategy for later TEST-033

TEST-033 should use approximately 25–30 detailed critical fixtures, 15–20 focused attacks, and compact decision/invariant matrices. It should emphasize:

- completed hearing but not ready;
- written-only readiness;
- ready without outcome mutation;
- exact missing/blocked/unresolved prerequisites;
- draft, content-finalized, and issued distinctions;
- exact judgment basis and valid JII references;
- reasoning/disposition separation;
- multiple and partial dispositions;
- issuance without closure;
- delayed, conditional, partial, or stayed effectiveness;
- performance pending and satisfaction distinction;
- closure eligibility and explicit closure event;
- settlement-driven procedural conclusion path;
- correction/version persistence;
- appeal/remand stage persistence;
- old findings and snapshots unchanged;
- player/NPC equivalence; and
- reload determinism.

High-risk transitions should receive full `Fixture → Manual verification → Expected → Observed → Verdict`. Lower-risk requirements should use compact matrices. No TEST-033 is created by this task.

---

## 34. Decision-quality checklist

For every lifecycle extension, ask:

1. Which Matter, Case, stage, and exact scope owns the object?
2. Which immutable inherited adjudicative outputs does it consume?
3. Is the operation checking readiness or secretly choosing outcome?
4. Is the state draft, content-finalized, issued, effective, performed, satisfied, stage-concluded, or Matter-closed?
5. Which supplied rule/version and authorized event creates the transition?
6. Does a later event rewrite a historical judgment, finding, snapshot, or disposition?
7. Is a partial disposition being mistaken for full stage or Matter closure?
8. Is “final” being used ambiguously?
9. Is issuance being mistaken for appellate finality or non-appealability?
10. Is disposition effect being mistaken for performance or satisfaction?
11. Is closure inferred without explicit terminal prerequisites and `CaseClosureEvent`?
12. Is JudgeProfile, lawyer skill, or NPC abstraction directly controlling outcome?
13. Are CourtRecord, findings, adjudication basis, and prior-stage history preserved?
14. Is this lifecycle architecture or unresolved jurisdiction-specific doctrine?

If doctrine is missing, the content remains supplied/TBD.

---

## 35. Decision summary

DEC-034 adopts an append-only, scope-aware lifecycle in which explicit readiness assesses supplied prerequisites without choosing outcome; immutable judgment versions bind to exact inherited adjudicative outputs; content finalization remains distinct from issuance; dispositions remain distinct from effectiveness, performance, satisfaction, and closure; and `CaseClosed` exists only through an authorized closure event. Corrections, appeal, remand, settlement, reopening, and later stages preserve all prior judgment, finding, record, and event history. Player and NPC Matters use one semantic ontology and no judgment, finality, closure, or outcome score.

