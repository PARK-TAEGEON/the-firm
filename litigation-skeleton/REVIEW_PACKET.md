# VS-005 implementation review packet

## Result

VS-005 implements only the accepted Submission → CourtRecord boundary in DEC-LITIGATION-025 v0.3 / TEST-024 v0.3, including the finalized-document lineage clarification in commit `2b62636`:

```text
selected ArgumentSelectionEvent
→ Drafting Task / immutable DraftWorkProduct
→ immutable FinalizedDocument version
→ SubmissionAttempt
→ ProceduralResult
→ RecordMaterializationEvent + CourtRecordEntry
→ CourtRecordProjection
```

`document_id` is a stable lineage ID. `(document_id, document_version)` identifies an immutable finalized version. A later version uses the same `document_id`, a new `document_version`, and a distinct completed DraftWorkProduct ID/version pair with the same matter, stage, team and document type. Earlier versions remain readable and submission-eligible. An unknown lineage or a version absent from that lineage is stale; later versions do not invalidate earlier ones.

No VS-006 Contribution/Criterion/Adjudication or Judgment semantics were added. No amendment, supersession, cure or withdrawal mechanics were inferred.

## Changed files

- `README.md` — VS-005 boundary, composite document version identity, defective route and test command.
- `REVIEW_PACKET.md` — this factual implementation and verification handoff.
- `vertical_slice/content/slice_case.json` — bounded drafting, package, deadline, submission and inclusion fixtures plus negative-only mismatch fixtures.
- `vertical_slice/content/locale_ko.json` — VS-005 fixture/UI strings, including the bounded omission choice.
- `vertical_slice/data/slice_state.gd` — authored-definition and immutable VS-005 runtime collections/orders.
- `vertical_slice/services/work_service.gd` — generic Task lifecycle support for drafting and DraftWorkProduct creation.
- `vertical_slice/services/submission_service.gd` — VS-005 finalization, submission, deterministic result, materialization and projection service.
- `vertical_slice/services/slice_service.gd` — content validation, service wiring and public façade APIs.
- `vertical_slice/presentation/slice_presenter.gd` — player-safe submission/CourtRecord projection text.
- `vertical_slice/ui/main.gd` — service-only Submission & Record interactions and bounded package selection.
- `vertical_slice/ui/main.tscn` — minimum Submission & Record tab and package option control.
- `vertical_slice/tests/run_vs005_regressions.gd` — VS-005 flow, attack, atomicity, presentation and replay regressions.
- `vertical_slice/vs005-test-results.log` — latest 351-check VS-005 run.

The required prior-suite logs were refreshed by their final commands; their contents have no semantic Git diff except where noted by the final scope audit. The pre-existing untracked `.agent/prompts/planner-vs.md` was not read, edited or included.

## Public APIs

```text
create_drafting_task(task_definition_id, task_id, creation_event_id, actor_id, team_id)
execute_drafting_task(task_id, execution_id, actor_id, team_id, time_slot_id, work_units)
complete_drafting_task(task_id, completion_id, work_product_id, argument_id, selection_event_id, actor_id, team_id)
finalize_document(document_id, document_version, draft_work_product_id, actor_id, team_id)
create_submission_attempt(attempt_id, document_id, document_version, rule_id, target_id, route_id, package_member_ids, deadline_context_id, actor_id, team_id)
materialize_procedural_result(result_id, attempt_id, actor_id, team_id)
materialize_court_record(materialization_event_id, entry_id, document_id, document_version, attempt_id, result_id, inclusion_rule_id, actor_id, team_id)
submission_projection(viewer_actor_id, viewer_team_id)
```

`SliceService` is the public façade. `WorkService` owns generic Task/Assignment/Execution/Completion mutation. `SubmissionService` owns only the VS-005 document finalization through CourtRecord boundary.

## Canonical state and event shapes

Authored collections are `submission_rules`, `record_inclusion_rules`, `package_members`, and `deadline_contexts`, each with its corresponding order array. Runtime collections are `draft_work_products`, `finalized_documents`, `submission_attempts`, `procedural_results`, `record_materialization_events`, and `court_record_entries`, each with its corresponding order array.

`finalized_documents` is a nested composite-key store:

```text
finalized_documents[document_id][document_version] = FinalizedDocument
finalized_document_order[] = { document_id, document_version }
```

The exact runtime record fields are:

```text
DraftWorkProduct = {
  id, version, work_product_type, task_id, task_definition_id,
  task_definition_version, assignment_id, execution_refs, completion_id,
  performer_actor_id, team_id, matter_id, stage_id, document_type,
  argument_id, argument_selection_event_id, issue_id, issue_analysis_id,
  case_theory_id, case_theory_version_id, factual_basis_refs,
  rule_statement_ids, interpretation_candidate_ids,
  recorded_legal_extraction_ids, legal_source_review_event_ids,
  package_member_ids, assertion_payload, performed_work_units,
  work_unit_kind, content_version, created_event_order
}

FinalizedDocument = {
  document_id, document_version,
  id, version,                         # compatibility aliases of the two fields above
  draft_work_product_id, draft_work_product_version, drafting_task_id,
  drafting_completion_id, document_type, matter_id, stage_id,
  finalized_by_actor_id, team_id, case_theory_id, case_theory_version_id,
  issue_id, issue_analysis_id, argument_id, argument_selection_event_id,
  factual_basis_refs, rule_statement_ids, interpretation_candidate_ids,
  recorded_legal_extraction_ids, legal_source_review_event_ids,
  package_member_ids, assertion_payload, content_version, event_order
}

SubmissionAttempt = {
  id, document_id, document_version, submitter_actor_id, actor_id, team_id,
  matter_id, stage_id, document_type, target_id, route_id,
  package_member_ids, submission_rule_id, deadline_context_id,
  content_version, event_order
}

ProceduralResult = {
  id, submission_attempt_id, submission_rule_id, document_id,
  document_version, kind, reason, missing_package_member_ids,
  evaluated_package_member_ids, actor_id, team_id, matter_id, stage_id,
  content_version, event_order
}

RecordMaterializationEvent = {
  id, court_record_entry_id, document_id, document_version,
  submission_attempt_id, procedural_result_id, record_inclusion_rule_id,
  actor_id, team_id, matter_id, stage_id, content_version, event_order
}

CourtRecordEntry = {
  id, record_materialization_event_id, document_id, document_version,
  submission_attempt_id, procedural_result_id, record_inclusion_rule_id,
  actor_id, team_id, matter_id, stage_id, content_version, event_order,
  document_type, assertion_payload, case_theory_id, case_theory_version_id,
  issue_analysis_id, argument_id, argument_selection_event_id
}
```

The `draft_work_product_created` journal event has `{id, event_order, kind, task_id, completion_id, matter_id, stage_id, team_id}`. `document_finalized` is a FinalizedDocument snapshot plus `kind`. Its persistent deterministic ID uses injective length-prefix encoding: `FinalizedDocument|<document_id.length>:<document_id>|<document_version.length>:<document_version>`. Component delimiters remain valid; for example, `(A|B, C)` becomes `FinalizedDocument|3:A|B|1:C`, while `(A, B|C)` becomes `FinalizedDocument|1:A|3:B|C`. Before any finalized-document state mutation, this generated ID is checked against all existing persistent identities and an occupied ID returns `duplicate_identity` atomically. `submission_attempted` and `procedural_result_materialized` are their record snapshots plus `kind`. `court_record_materialized` is the RecordMaterializationEvent plus `kind`; `court_record_entry_created` is the CourtRecordEntry plus `kind`.

`CourtRecordProjection` contains ordered deep-copy arrays named `draft_work_products`, `finalized_documents`, `submission_attempts`, `procedural_results`, `record_materialization_events`, `court_record_entries`, plus authored `submission_contexts`. Reads and redraws create no events.

## Fixture semantics and player path

The synthetic authored fixture has one canonical `synthetic_response_brief` drafting definition, document and exhibit package members, a provenance-only deadline context, one canonical SubmissionRule and one canonical RecordInclusionRule. Foreign-matter, alternate-document-type and inclusion mismatch definitions exist only to drive negative regressions.

The only result vocabulary is:

- complete required package → `accepted_for_record`, reason `package_complete`;
- omitted known required member → `rejected_defective`, reason `missing_required_package_member`, with exact missing-member IDs.

No result record means unresolved; `pending` is not a result kind. Deadline context is preserved, not evaluated. `accepted_for_record` is only record eligibility and does not mean filed, served, admitted, substantively correct or judicially accepted.

The `Submission & Record` tab exposes the eight explicit service-backed lifecycle actions. Before creating an attempt, its single bounded option control permits either the complete authored package or the authored omission case (document only, exhibit omitted). Choosing the omission produces an inspectable `rejected_defective` SubmissionAttempt/ProceduralResult through services; the UI displays the result/reason/missing member, and record materialization remains disabled/ineligible. This is not generic filing customization and creates no cure, amendment, withdrawal or supersession path.

## Enforced invariants and regression coverage

The 351-check VS-005 suite covers the positive accepted path, defective path, historical-version Case 73 and the mandatory attack matrix. In particular it verifies:

- real v1 and v2 in one document lineage from distinct DraftWorkProducts; both retained; v1 usable after v2; absent v3 rejected atomically;
- delimiter-bearing composite identities `(A|B, C)` and `(A, B|C)` coexist with distinct canonical finalized-event IDs; a pre-existing persistent journal ID collision is rejected atomically before finalization mutation;
- unknown document lineage, duplicate composite version, reused DraftWorkProduct pair and same-lineage scope mismatch rejection;
- distinct document IDs remain distinct lineages;
- wrong team, target and route; unknown, known foreign-matter and duplicate package members;
- authored-content initialization rejects wrong submission matter/stage and inclusion-rule matter/stage/result-kind mismatches atomically;
- materialization rejects document/attempt/result mismatches and inclusion-rule document type, target, route, matter, stage and result-kind mismatches;
- reused materialization-event ID and reused CourtRecordEntry ID independently;
- authored illegal result vocabulary `pending`, `filed`, `served`, `admitted`, `withdrawn`, `superseded` and an arbitrary kind;
- defective history remains immutable and outside CourtRecord; a later complete attempt does not rewrite it;
- exact provenance, source immutability, nested deep-copy projections, read purity, deterministic replay and strictly monotonic event order;
- absence of Contribution, Criterion, JII, ChoicePoint, CourtFactFinding, adjudication, Judgment and appeal state;
- bounded defective UI route and player-visible result details without UI-owned gameplay logic.

Where matter/stage/result-kind mismatches cannot be supplied through structurally scoped runtime APIs, regressions mutate authored content and assert that `start_session` fails without changing state.

## Verification

Working directory for every command:

`C:\Users\Admin\orca\workspaces\The Firm\VS-005\litigation-skeleton`

Executable:

`C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe`

| Suite | Exact command arguments | Checks | Failures | Exit |
| --- | --- | ---: | ---: | ---: |
| Legacy | `--headless --path . --log-file ./test-results.log --script res://tests/run_regressions.gd` | 214 | 0 | 0 |
| VS-001 | `--headless --path . --log-file ./vertical_slice/test-results.log --script res://vertical_slice/tests/run_slice_regressions.gd` | 73 | 0 | 0 |
| VS-002 | `--headless --path . --log-file ./vertical_slice/vs002-test-results.log --script res://vertical_slice/tests/run_vs002_regressions.gd` | 72 | 0 | 0 |
| VS-003 | `--headless --path . --log-file ./vertical_slice/vs003-test-results.log --script res://vertical_slice/tests/run_vs003_regressions.gd` | 260 | 0 | 0 |
| VS-004 | `--headless --path . --log-file ./vertical_slice/vs004-test-results.log --script res://vertical_slice/tests/run_vs004_regressions.gd` | 256 | 0 | 0 |
| VS-005 | `--headless --path . --log-file ./vertical_slice/vs005-test-results.log --script res://vertical_slice/tests/run_vs005_regressions.gd` | 351 | 0 | 0 |

Total: **1,226 checks, 0 failures**. Every regression command exited `0`.

Main-scene smoke arguments: `--headless --path . --quit-after 2`. Result: exit `0`; `SCRIPT ERROR|Parse Error|ERROR:` matched `0` output lines. No visible desktop GUI click-through is claimed; scene/script loading is smoke-tested and the UI wiring/presentation/service flows are regression-tested.

## Known limitations

- Document type, assertion payload, package, target, route, deadline context and rules are bounded synthetic authored content.
- Result mapping is deterministic fixture validation, not a generic filing or legal-procedure engine.
- There is no document editor/generator, amendment, correction, cure, withdrawal, supersession, service, reception, deadline, jurisdiction or admissibility mechanic.
- There is no automatic Judgment, legal reasoning engine, judge/opponent AI, merits score, hidden procedural oracle, save/load, Career/Business/World integration or gameplay RNG in this slice.
- Content retains the existing `1.3.0` compatibility identifier; changing the version policy is outside this contract.

## Scope audit and status

- Implementation is confined to the VS-005 Task Contract allowlist.
- `.agent/prompts/` was untouched; its pre-existing untracked file remains unrelated.
- Existing VS-001 through VS-004 behavior is preserved by the required suites.
- No Contribution/Criterion/Adjudication, Judgment or next-slice work was added.
- No commit or push was performed.
- Final `git diff --check` exited `0`. The tracked diff-name audit contains only allowlisted VS-005 files. The only untracked files are the three allowlisted VS-005 additions and pre-existing `.agent/prompts/planner-vs.md`; the latter was untouched. No generated/out-of-scope file was added by this pass.

The implementation is **READY FOR RE-REVIEW**.
