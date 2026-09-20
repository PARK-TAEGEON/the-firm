# THE FIRM — VS-006 Bounded CourtFactFinding Regression Specification

Document ID: `TEST-029`

Version: `v0.1`

Status: **Accepted — implementation regression specification; not yet executed**

Source: `DEC-LITIGATION-030 v0.1 Accepted`

## 1. Verification boundary

This specification verifies only the fixed VS-006 synthetic proposition, hard criterion, snapshot, trace, and CourtFactFinding boundary. It does not treat the Proposed TEST-011, TEST-012, or TEST-013 documents as accepted evidence and does not verify generic legal reasoning, evidence admissibility, judge interpretation, or Judgment.

Every case is an executable regression expectation for the VS-006 runner. “Expected” below is design authorization, not a claim that the test has already run.

## 2. Required positive and negative cases

### A. Snapshot boundary

1. Capture before record materialization: snapshot succeeds with zero entry refs; later materialization does not alter it.
2. Capture after canonical eligible materialization: snapshot contains the entry exactly once in immutable CourtRecord event order.
3. New later snapshot: includes all then-eligible entries without mutating the earlier snapshot.
4. DraftWorkProduct, FinalizedDocument, SubmissionAttempt, unresolved attempt, and `rejected_defective` result are excluded.
5. A bare `accepted_for_record` result without RecordMaterializationEvent/CourtRecordEntry is excluded.
6. Caller cannot provide an entry list, omit an eligible entry, reorder entries, or inject an unknown entry.
7. Wrong matter/stage, invalid actor/team, duplicate snapshot ID, or inconsistent entry/event/result provenance fails with no state or journal change.

### B. Hard criterion outcomes

8. The canonical investigation-backed Argument path is drafted, finalized, accepted for record, and materialized. Its CourtRecordEntry preserves the exact `VS-SOURCE-APPROVAL-001/1` `approval_text` basis. A fresh snapshot and valid evaluation produce exactly one trace and one `recognized` finding with scope `approval_act` and reason `approval_source_requirement_satisfied`.
9. The non-investigation Argument path is independently drafted, finalized, accepted for record, and materialized without the exact approval basis. A fresh snapshot containing only that path produces `not_established_on_record`, empty recognized scopes, and reason `approval_source_required_scope_missing`.
10. An empty valid snapshot produces the same `not_established_on_record` result and missing-scope reason.
11. Extra same-lineage copies or later document versions preserving the same exact approval source derive at most one EvidenceUse for that lineage and do not change the recognized outcome or create numeric strengthening.
12. Unrelated source refs, approval source with wrong version, or approval source without `approval_text` do not satisfy the requirement.

### C. Binding, atomicity, and identity attacks

13. Unknown or wrong-version fact, criterion, or snapshot references fail atomically.
14. Fact/criterion matter, stage, proposition, or scope binding mismatch fails atomically.
15. Duplicate evaluation ID and duplicate finding ID each fail independently and atomically.
16. A persistent ID already used by any existing slice entity cannot be reused for snapshot, evaluation, or finding identity.
17. Corrupt snapshot entry refs or cross-object provenance are rejected without partial trace/finding/event creation.
18. An evaluation cannot be invoked through a lower-level public mutation API; only the SliceService façade is public.

### D. History, purity, and replay

19. Prior snapshots, traces, findings, and CourtRecord records remain byte-for-byte equivalent after later valid commands except for collections that append new immutable records.
20. Re-evaluation uses new IDs and appends a new trace/finding; it does not overwrite an old result.
21. Returned adjudication projections are nested deep copies; caller mutation cannot change authoritative state.
22. Repeated projections, tab changes, redraws, and reads append no journal events.
23. Same authored content and command sequence reproduce snapshot membership, EvidenceUse ordering, requirement outcomes, status, reasons, and event order.
24. RNG, current time, dictionary iteration order, player/lawyer capability, law-firm prestige, and UI ordering cannot affect the outcome.

### E. Scope-exclusion attacks

25. Evaluation creates no ActualStateRecord query, contrary proposition, `recognized_limited`, JudgeProfile, JII, CriterionChoicePoint, claim result, Judgment, appeal, remedy, or damages state.
26. `not_established_on_record` is never presented as the opposite proposition being true or recognized.
27. `recognized` is presented as a court finding for the named snapshot/scope, not actual truth.
28. CourtRecord materialization still creates no finding automatically; snapshot capture still creates no finding automatically.

## 3. Required suites and commands

### Provenance dependency amendment — Accepted specification; not executed

Source: DEC-LITIGATION-030's Accepted provenance dependency revision under operator correction cycle 1/2, 2026-09-16. These additional cases belong in the new VS-006 runner; predecessor executable tests and historical PASS evidence remain unchanged.

29. Through existing drafting/finalization/submission/result/materialization commands, each new entry's complete ordered `factual_basis_refs` equals the exact resolved FinalizedDocument version's array, including nested typed/version/scope/provenance fields. The investigation-backed positive path preserves approval support; the independent negative path preserves its actual nonqualifying or empty basis without injecting approval support.
30. Verify nested-copy isolation among finalized document, entry, entry-created journal payload, command return and existing record projection. Caller mutations of returned refs/scopes leave authoritative state/journal unchanged. In an isolated injected alias/noninterference test, changing a private prior object's nested basis cannot mutate the copied entry or alter EvidenceUse through a private-object lookup.
31. Materialize two real versions of one document lineage from distinct completed drafts with distinct factual bases. Each entry preserves only its exact version's basis; later creation leaves earlier documents, entries, events and snapshots unchanged.
32. Invalid materialization (duplicate IDs/result-rule pair, document/version mismatch, rejected result or wrong inclusion rule) leaves complete state/journal unchanged: no copied basis, entry or event is partially committed. Success retains the existing two journal-event types/order and creates no adjudication state.
33. An otherwise valid injected pre-revision entry lacking `factual_basis_refs` remains immutable and eligible under the unchanged snapshot rule, supplies zero EvidenceUse, and yields `not_established_on_record` when it is the snapshot's only entry. Reads/evaluation never backfill it or consult private objects to recover support.

All original Cases 1–28 and the required suites/acceptance gates below remain cumulative. No execution evidence is claimed by this amendment.

The Implementer must run and record exact commands, checks, failures, and exit codes for:

- legacy regression;
- VS-001 through VS-005 regression suites;
- new VS-006 regression suite;
- main-scene headless smoke;
- `git diff --check`.

The VS-006 runner must exit nonzero on any failed check. Existing canonical logs are updated only by the implementation/test role under the active Task Contract; this design-closure pass does not run or rewrite them.

## 4. Acceptance condition

TEST-029 is satisfied only when all applicable cases above execute with zero failures, all predecessor suites remain passing, the smoke test exits zero without script/scene-load errors, the REVIEW_PACKET accurately records fixture-injected portions and TBDs, and scope audit confirms no VS-007 Judgment work.

## 5. Status history

| Version | Status | Evidence |
| --- | --- | --- |
| v0.1 | Accepted specification; not executed | Operator-authorized VS-006 design closure. No runtime PASS is claimed. |
| v0.1 provenance amendment | Accepted specification; not executed | Operator correction cycle 1/2: Cases 29–33 require exact basis preservation, nesting isolation, version fidelity, atomicity and no historical/private repair; prior cases and gates retained. |
