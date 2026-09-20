# VS-006 implementation review packet

## Result and boundary

VS-006 implements the Accepted DEC-LITIGATION-030 / TEST-029 fixture-bounded path:

```text
eligible immutable CourtRecordEntry history
→ explicit immutable CourtRecordSnapshot
→ fixed approval-source EvidenceUse derivation
→ SufficiencyEvaluationTrace
→ CourtFactFinding
```

The only proposition is `VS-FACT-APPROVAL-001/1`, scope `approval_act`. The only criterion is `VS-CRITERION-APPROVAL-001/1`, authority `synthetic_vs006_fixture`, with the mandatory non-severable `approval_source_in_allowed_record` requirement. An exact preserved `VS-SOURCE-APPROVAL-001/1` reference containing `approval_text` produces `recognized` and `approval_source_requirement_satisfied`; a valid closed snapshot without it produces `not_established_on_record` and `approval_source_required_scope_missing`. No inverse fact or partial finding is produced.

This packet reports implementation readiness for independent review, not Reviewer PASS.

## Changed files

- `README.md` — bounded VS-006 flow, exclusions and test command.
- `REVIEW_PACKET.md` — this handoff.
- `vertical_slice/content/slice_case.json` — one fact and one exact criterion fixture.
- `vertical_slice/content/locale_ko.json` — VS-006 snapshot, status, reason, action and boundary labels, including completion, query and pre-start text previously bypassing localization.
- `vertical_slice/data/slice_state.gd` — fact/criterion and immutable snapshot/trace/finding collections and deterministic orders.
- `vertical_slice/services/slice_service.gd` — authored-definition validation, service wiring and three façade APIs.
- `vertical_slice/services/adjudication_service.gd` — new sole owner of snapshot capture, complete finalized-document/entry/event/result/attempt provenance validation, EvidenceUse derivation, evaluation and atomic trace/finding append.
- `vertical_slice/services/submission_service.gd` — exact resolved FinalizedDocument version's complete ordered `factual_basis_refs` nested-copy preservation in new entries.
- `vertical_slice/presentation/slice_presenter.gd` — player-safe snapshot, finding and provenance formatting.
- `vertical_slice/ui/main.gd`, `vertical_slice/ui/main.tscn` — service-only capture/evaluate/refresh actions and minimum inspection tab; VS-006 player text is resolved through the existing presenter localization path.
- `vertical_slice/tests/run_vs006_regressions.gd` — executable TEST-029 coverage plus focused source/scene checks that reject VS-006 completion, query and pre-start localization bypasses.
- `test-results.log`, `vertical_slice/test-results.log`, `vertical_slice/vs002-test-results.log`, `vertical_slice/vs003-test-results.log`, `vertical_slice/vs004-test-results.log`, `vertical_slice/vs005-test-results.log`, `vertical_slice/vs006-test-results.log` — latest canonical runs.

The untracked governance handoff files `.agent/tasks/VS-006.md`, `DEC-LITIGATION-030_VS006_BOUNDED_COURT_FACT_FINDING.md`, and `TEST-029_VS006_BOUNDED_COURT_FACT_FINDING.md` were read but not edited, deleted or staged. Run-directory files were not edited.

## APIs and ownership

```text
capture_court_record_snapshot(snapshot_id, matter_id, stage_id, actor_id, team_id)
evaluate_fact_proposition(evaluation_id, finding_id, snapshot_id,
                          fact_id, fact_version, criterion_id, criterion_version,
                          actor_id, team_id)
adjudication_projection(viewer_actor_id, viewer_team_id)
```

`SliceState` stores definitions and immutable history. `SubmissionService` retains finalization/materialization ownership. `AdjudicationService` is the only VS-006 mutation owner. Presenter and UI consume deep-copy service projections; the UI contains no eligibility or sufficiency logic.

## Records, events and invariants

- `CourtRecordSnapshot` stores ID, matter/stage, canonical inclusion-rule ref, ordered `{id,event_order}` entry refs, actor/team, content version and event order.
- `SufficiencyEvaluationTrace` stores snapshot/fact/criterion versions, evaluated scope, zero-or-one deduplicated EvidenceUse, requirement outcome, finding status, reason, actor/team, content version and event order.
- `CourtFactFinding` stores evaluation/snapshot/fact/criterion links, evaluated and recognized scopes, status, reasons, actor/team, content version and event order.
- New append-only events are `court_record_snapshot_created`, `sufficiency_evaluation_created`, and `court_fact_finding_created`.
- Successful evaluation appends exactly one trace/finding pair and two ordered events. Capture creates only its snapshot/event. Submission materialization retains its prior two-event sequence and creates no adjudication state.
- Snapshot membership comes from immutable materialization order; callers cannot supply membership or ordering.
- Capture validates every ordered materialization event before deciding eligibility, so a corrupted event matter/stage cannot be silently skipped. Evaluation reconstructs the exact canonical pre-snapshot refs and rejects omissions, reordering, duplicates, injected refs and entries whose event order does not predate the snapshot.
- Eligibility requires the canonical inclusion-rule record to exist with its exact identity, matter, stage and `accepted_for_record` result-kind binding; an existing exact FinalizedDocument version; and agreeing document/entry/event/result/attempt IDs, document/version and context provenance. Entry result/attempt IDs must agree with the materialization event, and the entry event order must immediately follow its materialization event order.
- The authored fact statement must exactly equal the DEC-030 Korean fixture text at content load and again at evaluation; a merely nonempty replacement is rejected.
- Existing snapshots remain unchanged after later materialization; fresh IDs are required for reevaluation and history is never overwritten.
- Evaluation reads only snapshot-listed entry basis. Historical entries lacking `factual_basis_refs` remain eligible, supply no EvidenceUse and are never backfilled.
- Complete ordered basis is isolated among FinalizedDocument, authoritative entry, entry-created journal payload, return and projection; nested mutation of each authoritative document/entry/journal copy is checked independently against the other two.
- Two real finalized versions from distinct completed drafts preserve distinct exact bases; version 2 does not rewrite version 1.
- Same-lineage copies yield at most one EvidenceUse. Wrong source version or missing `approval_text` cannot satisfy.
- Duplicate/global reused IDs, invalid bindings/context/versions, corrupted refs and invalid materialization fail without state/journal mutation.
- Projections are nested deep copies; repeated reads/redraws append no events; replay is semantically deterministic.
- VS-006 completion, query and pre-start text is read through the existing presenter localization path; executable source/scene checks reject reintroduced hardcoded bypasses for those strings.
- No `recognized_limited`, contrary proposition, ActualState query, JudgeProfile/JII/ChoicePoint, claim outcome, Judgment, appeal, remedy or damages state is created.

The runner covers TEST-029 Cases 1–33 through command-driven investigation-backed positive and independent non-investigation negative paths; direct no-finding checks after materialization and capture; empty/earlier/later snapshots; draft/finalized/unresolved-attempt/defective/bare-result exclusions; caller-membership API exclusion; multi-entry record-event ordering; independent snapshot/evaluation/finding duplicate and cross-entity identity attacks; complete fact/criterion matter-stage-proposition-version-scope attacks; load-time and evaluation-time exact authored-statement attacks; missing and corrupt canonical inclusion-rule identity/matter/stage/result-kind attacks; materialization-event context and entry event-order corruption; finalized-document and entry/event/result/attempt corruption; reordered, duplicated and retroactively injected snapshot refs; prior-record byte-equivalence; private-prior noninterference; historical pre-revision no-basis injection; three-way authoritative entry/journal/finalized-document nested-copy attacks; two-version fidelity; document/version mismatch, rejected-result, wrong-inclusion-rule and duplicate result/rule-pair materialization atomicity; repeated read/redraw purity; RNG/time/capability/prestige exclusion; presentation boundaries; VS-006 locale-key values and source/scene localization-bypass detection; and semantic replay. Every new corruption or failed-materialization rejection verifies complete state and journal equality.

## Commands and results

Executable: `C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe`

Run from `litigation-skeleton`:

```text
--headless --path . --log-file ./test-results.log --script res://tests/run_regressions.gd
--headless --path . --log-file ./vertical_slice/test-results.log --script res://vertical_slice/tests/run_slice_regressions.gd
--headless --path . --log-file ./vertical_slice/vs002-test-results.log --script res://vertical_slice/tests/run_vs002_regressions.gd
--headless --path . --log-file ./vertical_slice/vs003-test-results.log --script res://vertical_slice/tests/run_vs003_regressions.gd
--headless --path . --log-file ./vertical_slice/vs004-test-results.log --script res://vertical_slice/tests/run_vs004_regressions.gd
--headless --path . --log-file ./vertical_slice/vs005-test-results.log --script res://vertical_slice/tests/run_vs005_regressions.gd
--headless --path . --log-file ./vertical_slice/vs006-test-results.log --script res://vertical_slice/tests/run_vs006_regressions.gd
--headless --path . --log-file %TEMP%/the-firm-vs006-smoke.log --quit-after 2
git diff --check
```

| Suite | Checks | Failures | Exit |
| --- | ---: | ---: | ---: |
| Legacy | 214 | 0 | 0 |
| VS-001 | 73 | 0 | 0 |
| VS-002 | 72 | 0 | 0 |
| VS-003 | 260 | 0 | 0 |
| VS-004 | 256 | 0 | 0 |
| VS-005 | 351 | 0 | 0 |
| VS-006 | 1,054 | 0 | 0 |
| **Total** | **2,280** | **0** | **0** |

Main-scene headless smoke exited 0. The smoke log had zero script, parse, resource-load or scene-load matches. Windows emitted a non-fatal root-certificate-store diagnostic. No visible desktop GUI click-through was performed; UI wiring and player-safe text were checked by executable regression plus headless scene load only.

## Synthetic/injected portions and TBD

The proposition, criterion, authority, hard requirement, source/scope match, EvidenceUse relevance/credibility labels and both result reasons are synthetic authored fixtures. Corruption, duplicate-lineage, wrong-version/scope, historical missing-field and private-prior alias scenarios use deliberate test-only state injection after a real command-driven record path; production APIs expose no such mutation.

Still unimplemented/TBD: generic criterion authoring/DSL; actual legal standards; admissibility; generic relevance, credibility, lineage, corroboration and conflict generation; partial recognition; choice points and judge interpretation; judge/opponent AI; claim outcomes, FinalAdjudication and Judgment; remedies/damages/precedent; appeal/remand; save/load/migration; Career/Business/World integration; generic courtroom UI.

## Scope audit

No predecessor executable test, `work_service.gd`, `content_loader.gd`, infrastructure, dependency, governance, `.agent/runs` artifact or VS-007 file was changed. Only the allowlisted canonical result logs were refreshed. `git diff --check` exited 0 (line-ending conversion warnings only). Tracked and untracked paths were audited against the exact allowlist; the three pre-existing untracked governance files were separately identified and untouched. No commit, stage, push, PR, merge or next task was performed.

## Status

**READY FOR FINAL REVIEW**
