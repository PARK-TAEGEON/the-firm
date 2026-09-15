# VS-004 Design Closure Review

Date: 2026-09-15  
Role: Architect  
Verdict: **DESIGN READY**

## Purpose and scope

Resolve only the design/governance blockers reported by the VS-004 Planner. No production code, Submission, CourtRecord, Adjudication, Judgment or VS-005 semantics are included.

## Formal status changes

| DEC / TEST | Prior evidence | Required change | Final status |
|---|---|---|---|
| DEC-018 / TEST-017 | TEST text contained 3 PARTIAL verdicts but summary said 27 PASS / 2 PARTIAL | Close optional variation/no-reroll and partial-scope gates; correct the inconsistent verdict arithmetic | v0.2 Accepted / 29 PASS, 0 PARTIAL, 0 FAIL |
| DEC-019 / TEST-018 | 29 PASS, 0 PARTIAL, 0 FAIL; no semantic blocker | Status/history promotion only | v0.2 Accepted |
| DEC-021 / TEST-020 | 40 PASS, 0 PARTIAL, 0 FAIL; no semantic blocker | Status/history promotion only | v0.2 Accepted |
| DEC-023 / TEST-022 | 48 PASS but VS-004 materialization and Argument identity/selection remained TBD | Add LAW36–LAW41 and 8 closure fixtures | v0.2 Accepted / 56 PASS, 0 PARTIAL, 0 FAIL |
| DEC-024 / TEST-023 | 56 PASS, 0 PARTIAL, 0 FAIL; `strategy` wording could be read as a new object | State that VS-004 uses ArgumentSelectionEvent and no canonical Strategy; add one attack fixture | v0.2 Accepted / 57 PASS, 0 PARTIAL, 0 FAIL |
| DEC-026 / TEST-025 | 72 PASS, 0 PARTIAL, 0 FAIL; no VS-004 semantic blocker | Status/history promotion only | v0.2 Accepted |

DEC-019, DEC-021 and DEC-026 were eligible for promotion on their existing all-PASS results. DEC-024 was eligible on existing results, then received the minimum no-Strategy clarification and one matching fixture before promotion. DEC-018 was not eligible as written because its test verdicts and arithmetic conflicted. DEC-023 was not implementation-ready despite its existing all-PASS summary because its own TBD list left the required Argument model open. Both were revised and re-verified at manual fixture level before promotion.

## Accepted VS-004 semantic closure

The required artifact boundary is:

```text
LegalSource
≠ RecordedLegalExtraction
≠ RuleStatement
≠ InterpretationCandidate
≠ IssueAnalysis
≠ Argument
≠ CaseTheory
```

Operational materialization also keeps `LegalSourceDiscoveryEvent`, `LegalSourceReviewEvent` and `ArgumentSelectionEvent` distinct from those artifacts.

1. A LegalSource may exist privately in authored content. Completed valid research may materialize discovery; discovery grants visibility but no reviewed scope.
2. Review is separate declared work and materializes an exact-source/version/scope review event. Merely opening or querying a source is a pure read.
3. RecordedLegalExtraction binds exactly one reviewed source version and non-empty exact scope. It may be incomplete or mistaken without changing the source.
4. RuleStatement requires one or more extraction refs. InterpretationCandidate explicitly derives from RuleStatement refs and remains a possible reading.
5. IssueAnalysis is explicitly materialized only after completed research and requires Issue, reviewed source/extraction, rule and interpretation provenance plus typed factual provenance where used.
6. Argument is an immutable, never-reused identity grounded in an authored recipe, current CaseTheory version, IssueAnalysis, interpretation/rule/extraction/source chain and all factual Review/Investigation provenance actually used.
7. Argument creation and selection are separate atomic commands. Selection appends an immutable event; the latest valid event derives the current choice. Re-selection preserves history.
8. No canonical Strategy or StrategicNarrative is created. Selection does not create Submission, CourtRecord or adjudicative state.

## Remaining semantic gaps that are intentionally not blockers

- substantive Korean law, authority hierarchy and precedent effect
- generic search/index algorithms, miss probability and source-access infrastructure
- extraction/error probability and automatic legal reasoning
- broad Argument/IRAC catalogs beyond the authored VS-004 fixtures
- workload formula, scheduler, AI, save/load and schema/API details not required by the Task Contract
- witness, drafting/filing and later procedural materialization semantics

These remain TBD and must not be invented during VS-004.

## Inherited dependency disposition

- DEC-018 is now Accepted after the TEST-017 inconsistency and semantic gates were closed.
- DEC-019 is now Accepted on its existing 29/0/0 evidence.
- DEC-021 is now Accepted on its existing 40/0/0 evidence.
- DEC-020 was already Accepted and supplies the fallible exact-scope review boundary.
- DEC-022 and DEC-025 are not required semantic inputs for the narrowed VS-004 contract. Their repository headers remain Proposed despite forward references elsewhere; they were not promoted without a full scoped review. VS-004 must not consume their witness or drafting/filing semantics.

## Minimum Task Contract corrections

- Rename the slice from Strategy Finalization to Legal Research, Issue Analysis and Argument Selection.
- Add RecordedLegalExtraction and explicit discovery/review events to the implementation chain.
- Require exact source/version/scope and lifecycle provenance at each materialized layer.
- Require explicit IssueAnalysis creation after completed research.
- Replace create/update/version Strategy acceptance criteria with authored Argument creation and immutable Argument selection criteria.
- Replace Strategy ID/version provenance with ArgumentSelectionEvent ID and optional parent Argument lineage.
- Require two authored Argument paths with observably different provenance.
- Explicitly forbid canonical Strategy/StrategicNarrative and all later procedural/adjudicative objects.

## Scope audit

- Production code changed: No.
- VS-004 implementation started: No.
- New DEC created: No.
- Submission/CourtRecord/Adjudication/Judgment/VS-005 designed: No.
- Out-of-scope semantic invention: No.

## Regression verification

Godot 4.7.2 stable, 2026-09-15:

| Suite | Checks | Failures | Exit code |
|---|---:|---:|---:|
| legacy | 214 | 0 | 0 |
| VS-001 | 73 | 0 | 0 |
| VS-002 | 72 | 0 | 0 |
| VS-003 | 137 | 0 | 0 |
| main scene headless smoke | n/a | 0 script/scene errors | 0 |

No VS-004 runtime suite was run or claimed because implementation has not started. The corresponding DEC tests are manual fixture-level verification documents, updated as recorded in the status table.

## Final verdict

**DESIGN READY** — VS-004 may proceed only under the corrected Task Contract and the Accepted v0.2 documents above.
