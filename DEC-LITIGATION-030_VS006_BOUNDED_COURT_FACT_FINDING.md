# THE FIRM — VS-006 Bounded CourtRecord-to-CourtFactFinding Closure

Document ID: `DEC-LITIGATION-030`

Version: `v0.1`

Status: **Accepted — VS-006 fixture-bounded implementation closure**

Authorization: operator invocation for VS-006 design closure, 2026-09-16

Applies only to: `task/vs-006`, based on main `947154c01f8cac5a2d034605643235fe3d63e791`

## 1. Purpose and authority

This document closes only the design dependencies required to implement one deterministic CourtRecord-to-CourtFactFinding vertical slice. It applies the already Accepted boundaries in DEC-LITIGATION-007 through DEC-LITIGATION-013, especially DEC-LITIGATION-011 v0.2 and DEC-LITIGATION-012 v0.3, to an explicit synthetic fixture and runtime ownership boundary.

This is not acceptance of DEC-LITIGATION-014 or of TEST-011, TEST-012, or TEST-013. Their repository headers remain Proposed. VS-006 does not consume CriterionChoicePoint, JudgeProfile, or JudgeInterpretationInput behavior. It does not declare a rule of Korean law.

The predecessor gate is satisfied by the operator-supplied, host-validated evidence: VS-005 Reviewer PASS, implementation `6d08726`, design commits `7d40e8c` and `2b62636`, and integration `4652a20`. This document does not claim that predecessor tests were rerun.

## 2. Sources and rationale

| Source | Accepted boundary used here |
| --- | --- |
| `02_ARCHITECTURE_RULES.md` | DATA → SIMULATION/STATE → SERVICES → PRESENTATION → UI; mutation through services; replayable state |
| DEC-LITIGATION-007 | the court uses only delivered/allowed material; input, credibility, sufficiency, and legal effect remain separate |
| DEC-LITIGATION-008 | a fact finding is not a claim outcome, burden allocation, remedy, or Judgment |
| DEC-LITIGATION-009 | stage history is append-only; a later evaluation does not rewrite prior record or findings |
| DEC-LITIGATION-010 | record preservation and permission to use a record are distinct |
| DEC-LITIGATION-011 | actual truth is separate; four canonical finding statuses; allowed snapshot; no inverse fact; deterministic trace |
| DEC-LITIGATION-012 | versioned criterion binding, named proposition scope, EvidenceUse, qualitative requirements, allowed-record-only evaluation, no numeric collapse |
| DEC-LITIGATION-013 | profile influence is optional and only through declared ambiguity; with no choice point, no profile input is read |
| VS-005 accepted design and implementation handoff | CourtRecordEntry is append-only record materialization, not judge belief or a fact finding |

The narrow hard criterion below is chosen because DEC-LITIGATION-012 expressly permits synthetic structural fixtures with explicit criterion content. Excluding all ambiguity and judge/profile behavior avoids relying on the Proposed DEC-LITIGATION-014 and Proposed TEST-011 through TEST-013 documents.

## 3. VS-006 fixture proposition

The only substantive proposition implemented in VS-006 is:

```text
FactProposition id: VS-FACT-APPROVAL-001
version: 1
matter: VS-CASE-001
stage: VS-STAGE-001
statement: "상대방 담당자가 목표 납품일 변경안을 승인했다."
named scope: approval_act
```

This sentence is synthetic authored content. It is not actual-world truth, a hidden correct answer, or a general legal proposition. VS-006 must not add a contrary proposition. Failure to establish this proposition never creates or recognizes its negation.

## 4. Exact RecognitionCriterion fixture

The only criterion is immutable `VS-CRITERION-APPROVAL-001`, version `1`, bound exactly to `VS-FACT-APPROVAL-001/1`, `approval_act`, `VS-CASE-001`, and `VS-STAGE-001`.

Its authority/content source is `synthetic_vs006_fixture`; it claims no external legal authority. It is complete for this one fixture and has one mandatory, non-severable requirement:

```text
requirement id: approval_source_in_allowed_record
target scope: approval_act
composition: one mandatory qualitative requirement
recognized_limited permitted: false
choice points: none
judge interpretation permitted: false
```

The requirement is satisfied only when the immutable snapshot contains an eligible CourtRecordEntry whose preserved `factual_basis_refs` includes the exact typed source reference:

```text
basis_type: SourceMaterial
source_id: VS-SOURCE-APPROVAL-001
source_version: 1
scope_ids includes: approval_text
```

For this fixture only, the criterion authors one EvidenceUse from that exact allowed record content to `approval_act` with:

- role `supports`;
- relevance reason `authored_exact_approval_scope_match`;
- credibility state `accepted_for_scope`;
- lineage `VS-SOURCE-APPROVAL-001/1`;
- no independent-corroboration requirement;
- no authored conflict and no conflict-resolution rule;
- no numeric strength, probability, count threshold, prestige modifier, lawyer modifier, or RNG.

The EvidenceUse is created only from the exact reference as preserved inside an eligible CourtRecordEntry. The service must not inspect a private SourceMaterial collection, ReviewWorkProduct, InvestigationResult, Argument, DraftWorkProduct, ActualStateRecord, or hidden content to repair a missing record reference. Those prior objects may be named by immutable provenance already copied into CourtRecordEntry, but they are not independently queried as adjudication input.

Evaluation semantics are exhaustive for the valid fixture:

| Condition | CourtFactFinding status | Required reason |
| --- | --- | --- |
| exact allowed reference is present and the requirement is satisfied | `recognized` | `approval_source_requirement_satisfied` |
| snapshot is valid and closed but no eligible entry contains the exact reference | `not_established_on_record` | `approval_source_required_scope_missing` |

`recognized_limited` is unreachable because the sole scope is non-severable. `undetermined` is not a fallback for ordinary missing support. A missing, broken, incomplete, wrong-version, or inapplicable criterion is a design/input failure: no evaluation mutation is committed and the command returns an explicit error. VS-006 does not implement a generic missing-criterion evaluation record.

## 5. Allowed CourtRecord snapshot

`AdjudicationService` owns explicit snapshot capture. A snapshot is created by a command, never by a read or UI redraw. The capture command takes a snapshot ID plus matter/stage and includes every CourtRecordEntry that already exists at command start and satisfies all of these fixture eligibility conditions:

1. exact `matter_id = VS-CASE-001` and `stage_id = VS-STAGE-001`;
2. a valid existing `RecordMaterializationEvent` points to the entry;
3. the referenced `ProceduralResult.kind` is `accepted_for_record`;
4. the entry uses the canonical accepted VS-005 `RecordInclusionRule` for that matter/stage;
5. all cross-references between entry, materialization event, result, attempt, document ID/version, matter, and stage agree.

The rule is a bounded fixture eligibility rule, not an evidence-admissibility engine. `accepted_for_record` alone remains non-adjudicative; only explicit snapshot capture makes an existing entry available to this fixture evaluation.

The service derives entry order from immutable CourtRecord event order. Callers cannot omit, reorder, or inject entries. Later CourtRecord materialization does not change an existing snapshot. A new snapshot with a new persistent ID is required. Snapshot capture does not create a finding.

Minimum immutable record:

```text
CourtRecordSnapshot = {
  id, matter_id, stage_id, eligibility_rule_ref,
  court_record_entry_refs: [{id, event_order}],
  captured_by_actor_id, team_id, content_version, event_order
}
```

The snapshot stores entry identities and event orders. Evaluation resolves only those entries and revalidates their preserved cross-references. Returned projections are nested deep copies.

## 6. Runtime ownership and APIs

`AdjudicationService` is the single new VS-006 domain service. It owns snapshot capture, EvidenceUse derivation for the fixed criterion, sufficiency evaluation, evaluation trace, and CourtFactFinding materialization. It must not mutate SubmissionService records.

`SliceService` remains the public façade and exposes only:

```text
capture_court_record_snapshot(snapshot_id, matter_id, stage_id, actor_id, team_id)
evaluate_fact_proposition(evaluation_id, finding_id, snapshot_id,
                          fact_id, fact_version,
                          criterion_id, criterion_version,
                          actor_id, team_id)
adjudication_projection(viewer_actor_id, viewer_team_id)
```

The evaluation command atomically validates all identities and bindings, derives zero or one fixture EvidenceUse per eligible source lineage, evaluates the one requirement, and appends one trace and one finding. It does not expose lower-level mutation calls.

Minimum immutable outputs are:

```text
SufficiencyEvaluationTrace = {
  id, matter_id, stage_id, snapshot_id,
  fact_id, fact_version, evaluated_scope_ids,
  criterion_id, criterion_version,
  evidence_uses, requirement_outcomes,
  finding_status, reason_refs,
  content_version, event_order
}

CourtFactFinding = {
  id, evaluation_id, matter_id, stage_id, snapshot_id,
  fact_id, fact_version, evaluated_scope_ids,
  criterion_id, criterion_version,
  status, recognized_scope_ids, reason_refs,
  content_version, event_order
}
```

`recognized_scope_ids` is `['approval_act']` only for `recognized` and is empty for `not_established_on_record`. Trace and finding are append-only. Re-evaluation requires new evaluation and finding IDs and does not replace an earlier result.

The authoritative state collections are authored fact propositions and criteria plus runtime snapshots, evaluation traces, and findings, each with deterministic order. Persistent IDs are globally non-reused under the existing slice identity policy.

## 7. Atomicity, determinism, and information boundaries

### Provenance dependency revision — Accepted bounded closure, 2026-09-16

Authority: operator correction cycle 1/2 expressly authorizes minimum provenance preservation. Sources: DEC-LITIGATION-025 v0.3 Accepted §12.1 source/version preservation, this document's §4 allowed-record-only EvidenceUse, and saved blocker `.agent/runs/VS-006/20260916-203832-b1650e99/implementation-design-1/implementer-blocker.json`. Existing ownership confirms that FinalizedDocument already copies DraftWorkProduct factual basis, while SubmissionService CourtRecord materialization omits it. This revision closes that dependency without changing any fixture adjudication rule.

SubmissionService alone must deep-copy the complete ordered `factual_basis_refs` array from the exact FinalizedDocument version already resolved by a successful materialization into the new CourtRecordEntry. Preserve all nested typed/version/scope/provenance fields, including an empty array. No caller-supplied basis, filtering, inference, private-source lookup or approval-source injection is authorized. This is copied record provenance, not admission, credibility inference or a finding.

This additive entry-payload change stays inside the existing atomic command. Preserve its API, eligibility gates, procedural result mapping, identities, event count/order and ownership. The authoritative entry, entry-created journal payload, command return and existing deep-copy record projection must preserve the same content. The materialization event continues to link the exact document/version; no new event type or source registry is needed. Materialization still creates no snapshot, trace or finding.

Existing immutable entries and events are never backfilled. A pre-revision entry lacking the field supplies no EvidenceUse and is missing support if otherwise eligible; snapshot eligibility is unchanged. Fresh command-driven fixtures supply the recognized path. Adjudication must not fetch FinalizedDocument, DraftWorkProduct or other private prior objects to recover missing basis. That alternative would violate §4. Generic old-record migration/save compatibility remains TBD and excluded.

Historical VS-005 PASS/review/merge evidence remains unchanged. This document closure requires independent Planner reassessment of the revised contract before implementation. All regression, review, commit, merge and publication gates remain cumulative; no runtime or review PASS is claimed.

- Snapshot capture is atomic. Invalid identity, actor/team context, matter/stage, or corrupted cross-reference leaves all authoritative state and journal data unchanged.
- Evaluation is atomic across trace, finding, and their journal events. Any invalid or duplicate identity, binding mismatch, missing snapshot, or corrupted reference leaves state unchanged.
- Same authored content and same command sequence produce the same snapshot membership, EvidenceUse, requirement outcome, status, reason order, and event order.
- Dictionary iteration, caller entry order, current time, reload, UI redraw, and RNG must not affect results.
- Reads and projections append no events and return nested deep copies.
- Public presentation may show the proposition, snapshot entry refs, criterion fixture label, status, and reasons derived from the trace. It must not reveal hidden material or describe `recognized` as actual truth.

## 8. Explicit exclusions

VS-006 does not implement or imply:

- DEC-LITIGATION-014 ChoicePoint authoring or validation;
- JudgeProfile, JudgeInterpretationInput, judge generation, judge AI, discretion, mood, or bias;
- generic RecognitionCriterion DSL, natural-language reasoning, automatic proposition extraction, automatic credibility, lineage, relevance, or conflict inference;
- evidence admissibility, Korean-law proof standards, presumptions, burdens, waiver, or party default;
- `recognized_limited`, contrary proposition recognition, multiple propositions, multi-stage reconsideration, appeal, or remand;
- claim outcome, FinalAdjudication, Judgment, remedy, damages, precedent, settlement, or negotiation;
- save/load, Career/Business/World integration, or generic courtroom UI.

These remain TBD or later-slice work. VS-007 Judgment must not begin before VS-006 Reviewer PASS, commit, and merge gates are complete.

## 9. Required test expectations

TEST-029 is the normative VS-006 implementation test specification. At minimum it must verify:

1. a snapshot captured before any CourtRecord entry is empty and remains immutable after later entries;
2. a new snapshot includes every eligible existing entry in CourtRecord event order;
3. defective or merely submitted/finalized material never enters the snapshot;
4. the investigation-backed Argument path whose CourtRecordEntry preserves the exact approval source/scope produces `recognized`;
5. the non-investigation path without that exact reference produces `not_established_on_record` on a fresh closed snapshot;
6. same-lineage duplicate presentations derive at most one EvidenceUse and cannot change sufficiency;
7. no inverse fact, `recognized_limited`, JII, ChoicePoint, Judgment, or claim outcome is created;
8. invalid/duplicate IDs, wrong binding/version/scope, and corrupted refs fail atomically;
9. reads, redraws, and projections are pure deep copies;
10. replay is semantically deterministic and prior snapshots/findings remain immutable.

## 10. Remaining TBDs

All generic criterion authoring, legal authority, admissibility, credibility generation, lineage algorithms, conflict rules, partial recognition, judge interpretation, final adjudication, appeal effects, save schema, and content beyond this exact synthetic fixture remain TBD. This closure must not be generalized by implementation convenience.

## 11. Decision history

| Version | Status | Change |
| --- | --- | --- |
| v0.1 | Accepted — fixture-bounded | Operator-authorized VS-006 closure: exact proposition and hard criterion, immutable allowed-record snapshot, AdjudicationService/API ownership, atomic trace/finding outputs, required regressions, and explicit exclusion of Proposed choice-point/judge test dependencies. |
| v0.1 provenance amendment | Accepted — bounded dependency closure | Operator correction cycle 1/2 authorizes exact finalized-version factual-basis preservation in new entries by SubmissionService; ownership, gates, history, criterion and exclusions retained. Independent Planner reassessment required; no runtime PASS claimed. |
