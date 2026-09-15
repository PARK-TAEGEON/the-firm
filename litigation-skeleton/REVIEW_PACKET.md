# VS-004 review-fix implementation packet

## Result

VS-004 now implements the accepted Legal Research → IssueAnalysis → Argument flow, including the focused Reviewer fixes. Discovery and exact-scope review use separate generic Task lifecycle instances. IssueAnalysis preserves validated typed factual provenance. The playable presentation exposes the selected Argument formulation/basis and its current IssueAnalysis application, assumptions, and challenges.

No Task Contract or Accepted DEC/TEST conflict was encountered. VS-005 was not started.

## Exact changed files

The complete VS-004 branch diff contains:

- `README.md`
- `REVIEW_PACKET.md`
- `vertical_slice/content/locale_ko.json`
- `vertical_slice/content/slice_case.json`
- `vertical_slice/data/slice_state.gd`
- `vertical_slice/presentation/slice_presenter.gd`
- `vertical_slice/services/legal_research_service.gd` (new)
- `vertical_slice/services/slice_service.gd`
- `vertical_slice/services/work_service.gd`
- `vertical_slice/tests/run_slice_regressions.gd` (content-version compatibility only)
- `vertical_slice/tests/run_vs004_regressions.gd` (new)
- `vertical_slice/ui/main.gd`
- `vertical_slice/ui/main.tscn`
- `vertical_slice/vs004-test-results.log` (new/latest output)

The focused review-fix pass changed:

- `vertical_slice/content/slice_case.json`
- `vertical_slice/content/locale_ko.json`
- `vertical_slice/presentation/slice_presenter.gd`
- `vertical_slice/services/legal_research_service.gd`
- `vertical_slice/services/slice_service.gd`
- `vertical_slice/services/work_service.gd`
- `vertical_slice/tests/run_vs004_regressions.gd`
- `vertical_slice/ui/main.gd`
- `vertical_slice/vs004-test-results.log`
- `REVIEW_PACKET.md`

Required prior-suite log files were refreshed by earlier required executions but have no content diff from HEAD.

## Reviewer defects fixed

### 1. Post-discovery review work

- Discovery tasks carry `legal_research_work_kind = discovery`.
- Exact-source review work is separately declared after discovery as another ordinary TaskInstance with `legal_research_work_kind = source_review`.
- It uses the existing `TaskDefinition → Assignment → Execution → Completion` lifecycle in `WorkService`; no second task ontology exists.
- The review task binds the discovery event, LegalSource ID/version, and exact scope at declaration.
- `review_legal_source` preflights actor/team, task kind, target scope, discovery ordering, assignment, executed work, dependencies, work units, completion identity, and execution event ordering before the first mutation.
- A successful review atomically records task completion followed by immutable `LegalSourceReviewEvent` materialization.
- Discovery work, pre-discovery work, unexecuted work, and wrong task/scope provenance cannot satisfy review.

### 2. Complete IssueAnalysis factual/legal provenance

Authored IssueAnalysis recipes declare typed `factual_basis_requirements`. Runtime commands submit typed `factual_basis_refs`, resolved against authoritative state:

- `ReviewWorkProduct`
- `InvestigationResult`
- acquired `SourceMaterial` (the exact acquisition event, source ID/version/scopes, and InvestigationResult link)

The service validates team/matter/stage, required authored identity/action/source/scope, and InvestigationResult ↔ SourceMaterial linkage before mutation. It also proves every supplied InterpretationCandidate derives from the supplied RuleStatement instance, and proves each extraction/review/discovery chain belongs to the completed research basis. IssueAnalysis records the current CaseTheory version so later Argument creation rejects a stale analysis basis.

### 3. Playable inspection

`legal_research_status_text()` now derives and displays through service projections only:

- current IssueAnalysis application;
- assumptions;
- challenges/limitations;
- selected Argument label and formulation;
- selected Argument IssueAnalysis, RuleStatement, LegalSourceReviewEvent, and typed factual basis provenance.

No UI domain mutation was added.

### 4. Missing attacks and handoff accuracy

The VS-004 suite now covers pre-completion IssueAnalysis, pre-investigation factual application, stale/invalid factual provenance, actual InterpretationCandidate→RuleStatement instance mismatch, invalid/stale Argument bases, hidden `correct_argument`, and the post-discovery executed-review-work boundary.

## Exact SliceService APIs

```text
create_legal_research_task(question_id, task_id, creation_event_id, actor_id, team_id)
create_legal_source_review_task(legal_source_id, legal_source_version, scope_id, task_id, creation_event_id, actor_id, team_id)
assign_task(task_id, assignment_id, assigner_actor_id, assignee_actor_id, team_id)
execute_legal_research_task(task_id, execution_id, actor_id, team_id, time_slot_id, work_units)
complete_legal_research_task(task_id, completion_id, discovery_event_ids, actor_id, team_id)
review_legal_source(review_event_id, completion_id, task_id, legal_source_id, legal_source_version, scope_id, actor_id, team_id)
record_legal_extraction(extraction_id, recipe_id, review_event_id, actor_id, team_id)
create_rule_statement(rule_id, recipe_id, extraction_ids, actor_id, team_id)
consider_legal_interpretation(interpretation_id, recipe_id, rule_ids, actor_id, team_id)
create_issue_analysis(issue_analysis_id, recipe_id, task_id, rule_ids, interpretation_ids, factual_basis_refs, actor_id, team_id)
create_argument(argument_id, recipe_id, issue_analysis_id, actor_id, team_id)
select_argument(selection_event_id, argument_id, actor_id, team_id)
legal_research_projection(viewer_actor_id, viewer_team_id)
read_legal_source(viewer_actor_id, viewer_team_id, legal_source_id, legal_source_version, scope_ids)
```

`SliceService` remains the facade. `WorkService` owns generic lifecycle mutation. `LegalResearchService` owns Legal Research prerequisites/materialization. Returned projections are deep copies and reads create no domain events.

## Exact state collection and event names

Authoritative authored/runtime collections:

- `legal_sources`, `legal_source_order`
- `legal_research_questions`, `legal_research_question_order`
- `legal_research_recipes`
- `legal_source_discoveries`, `legal_source_discovery_order`
- `legal_source_reviews`, `legal_source_review_order`
- `recorded_legal_extractions`, `recorded_legal_extraction_order`
- `rule_statements`, `rule_statement_order`
- `interpretation_candidates`, `interpretation_candidate_order`
- `issue_analyses`, `issue_analysis_order`
- `arguments`, `argument_order`
- `argument_selection_events`, `argument_selection_order`

The journal event kinds are `legal_source_discovered`, `legal_source_reviewed`, `legal_extraction_recorded`, `rule_statement_created`, `interpretation_considered`, `issue_analysis_created`, `argument_created`, and `argument_selected`. Selection history is immutable; current choice derives from the latest valid `argument_selection_events` entry for the Issue.

## Semantic boundaries and authored choices

The implementation preserves:

`LegalSource ≠ RecordedLegalExtraction ≠ RuleStatement ≠ InterpretationCandidate ≠ IssueAnalysis ≠ Argument ≠ CaseTheory`

Discovery, opening/read, review work, extraction, synthesis, interpretation, application, Argument creation, and Argument selection remain distinct operations.

Exact authored Argument recipe identifiers in `slice_case.json`:

- `VS-RECIPE-ARG-001`: explicit-approval formulation, based on `VS-RECIPE-ANALYSIS-001`, the ReviewWorkProduct, `VS-INV-ACTION-001` InvestigationResult, and acquired `VS-SOURCE-APPROVAL-001` SourceMaterial.
- `VS-RECIPE-ARG-002`: post-conduct formulation, based on `VS-RECIPE-ANALYSIS-002` and the ReviewWorkProduct without claiming the first path's Investigation/acquisition basis.

Legal discovery path identifiers are separately `VS-LEGAL-PATH-TEXT-001` and `VS-LEGAL-PATH-CONDUCT-001`.

Neither Argument is marked correct, winning, or canonical. No Strategy object exists.

## Regression results

All commands below were run with working directory:

`C:\Users\Admin\orca\workspaces\The Firm\VS-004\litigation-skeleton`

Executable:

`C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe`

| Suite | Exact command arguments | Checks | Failures | Exit |
| --- | --- | ---: | ---: | ---: |
| Legacy | `--headless --path . --script res://tests/run_regressions.gd` | 214 | 0 | 0 |
| VS-001 | `--headless --path . --script res://vertical_slice/tests/run_slice_regressions.gd` | 73 | 0 | 0 |
| VS-002 | `--headless --path . --script res://vertical_slice/tests/run_vs002_regressions.gd` | 72 | 0 | 0 |
| VS-003 | `--headless --path . --script res://vertical_slice/tests/run_vs003_regressions.gd` | 260 | 0 | 0 |
| VS-004 | `--headless --path . --script res://vertical_slice/tests/run_vs004_regressions.gd` | 256 | 0 | 0 |

The VS-004 log contains the latest 256-check run.

## Main-scene smoke

Exact command arguments, from the same working directory:

```text
--headless --path . --quit-after 2
```

Result: `SMOKE_ERRORS=0`, `MAIN_SCENE_SMOKE_EXIT=0`.

## Actual GUI verification

The Godot DEBUG main scene was launched visibly during this review-fix pass. The following were actually observed and read back from screenshots/accessibility state:

- the main scene rendered;
- clicking `사건 시작` produced session `VS-SESSION-001` and rendered matter/stage data;
- existing Case Review content rendered;
- `Case Review`, `Work & Theory`, `Investigation`, and `Legal Research` tab labels were present.

Desktop automation did not produce a verifiable Legal Research tab transition during this pass. Therefore no claim is made that the full selected-Argument detail was visually exercised by clicks. Its rendered text construction is covered by VS-004 presenter regressions asserting application, assumption, challenge, formulation, IssueAnalysis ID, and typed factual basis text; main-scene loading is covered by smoke.

## Known limitations / TBD

- LegalSource, question, recipe, factual requirements, and Argument alternatives are authored fixture content.
- This is not a generic search engine or NLP/LLM legal-reasoning runtime.
- It provides no hidden correct law/interpretation/Argument, winning authority, CaseStrength, EvidenceScore, or WinChance.
- Substantive law, authority hierarchy, precedent effect, broad IRAC catalogs, workload formula, AI, and persistence remain TBD.
- Submission, Filing, CourtRecord, adjudication, CourtFactFinding, Judgment, appeal/remand, organization/business/world systems, and all VS-005-or-later mechanics are absent.

## Scope audit and VS-005 handoff

- All content-changing files are within the VS-004 Allowed Changes allowlist.
- Layer ownership remains DATA → SIMULATION/STATE → SERVICES → PRESENTATION → UI.
- Rejected review, analysis, Argument, and selection commands are tested for unchanged authoritative snapshots.
- No canonical Strategy or forbidden oracle/state was added.
- VS-005 was not started.
- No commit and no push were performed.

Any later procedural/adjudicative/persistence work requires a separately accepted VS-005 Task Contract. VS-004 ends at immutable Argument creation and selection history.
