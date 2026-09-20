extends SceneTree

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")
const SlicePresenter = preload("res://vertical_slice/presentation/slice_presenter.gd")
const ACTOR := "VS-LAWYER-001"
const TEAM := "VS-TEAM-001"
const DOC_MEMBER := "VS-PACKAGE-MEMBER-DOCUMENT-001"
const EXHIBIT_MEMBER := "VS-PACKAGE-MEMBER-EXHIBIT-001"
var checks := 0
var failures := 0


func check(condition: bool, label: String) -> void:
	checks += 1
	if not condition: failures += 1
	print(("PASS " if condition else "FAIL ") + label)


func reject_unchanged(service, result: Dictionary, label: String, before: Dictionary) -> void:
	check(not result.get("ok", false), label + "_rejected")
	check(not result.get("error", "").is_empty(), label + "_explicit_error")
	check(service.debug_snapshot_for_tests() == before, label + "_atomic")


func new_service(content: Dictionary):
	var service = SliceService.new()
	check(service.start_session(content.duplicate(true), ACTOR, TEAM).get("ok", false), "session_starts")
	return service


func bootstrap_review_theory(service) -> void:
	var scopes: Array = service.debug_snapshot_for_tests()["task_definitions"]["VS-TASKDEF-REVIEW-001"]["authorized_source_scopes"]
	check(service.assign_task("VS-TASK-REVIEW-001", "V6-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "review_assigned")
	check(service.execute_task("VS-TASK-REVIEW-001", "V6-EXEC", ACTOR, TEAM, "V6-WORK", 2, scopes).get("ok", false), "review_executed")
	check(service.complete_review_task("VS-TASK-REVIEW-001", "V6-COMP", "VS-WP-REVIEW-001", ACTOR, TEAM,
		"VS-ANALYSIS-OPTION-002").get("ok", false), "review_completed")
	check(service.select_issue("VS-ISSUE-001", "V6-ISSUE-SEL", ACTOR, TEAM, "VS-WP-REVIEW-001").get("ok", false), "issue_selected")
	check(service.create_case_theory("V6-THEORY", "V6-THEORY-V1", "VS-ISSUE-001", "VS-WP-REVIEW-001",
		ACTOR, TEAM, "합성 사건 이론", ["VS-ASSERTION-002"], ["VS-GAP-001"],
		["VS-WP-REVIEW-001-ANALYSIS-001"], ["VS-GAP-001"]).get("ok", false), "theory_created")


func bootstrap_argument(service, positive: bool) -> void:
	bootstrap_review_theory(service)
	if positive:
		check(service.create_investigation_task("VS-INV-ACTION-001", "V6-INV-TASK", "V6-INV-EVENT", ACTOR, TEAM).get("ok", false), "investigation_created")
		check(service.assign_task("V6-INV-TASK", "V6-INV-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "investigation_assigned")
		check(service.execute_investigation_task("V6-INV-TASK", "V6-INV-EXEC", ACTOR, TEAM, "V6-INV-WORK", 1).get("ok", false), "investigation_executed")
		check(service.complete_investigation_task("V6-INV-TASK", "V6-INV-COMP", "V6-INV-RESULT",
			"V6-INV-ACQ", ACTOR, TEAM).get("ok", false), "investigation_completed")
	check(service.create_legal_research_task("VS-LRQ-001", "V6-LEGAL", "V6-LEGAL-EVENT", ACTOR, TEAM).get("ok", false), "research_created")
	check(service.assign_task("V6-LEGAL", "V6-LEGAL-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "research_assigned")
	check(service.execute_legal_research_task("V6-LEGAL", "V6-LEGAL-EXEC", ACTOR, TEAM, "V6-LEGAL-WORK", 2).get("ok", false), "research_executed")
	check(service.complete_legal_research_task("V6-LEGAL", "V6-LEGAL-COMP", ["V6-DISC-1", "V6-DISC-2"], ACTOR, TEAM).get("ok", false), "research_completed")
	var source_id := "VS-LEGAL-SOURCE-001" if positive else "VS-LEGAL-SOURCE-002"
	var scope_id := "formation" if positive else "conduct"
	check(service.create_legal_source_review_task(source_id, "1", scope_id, "V6-SOURCE-TASK", "V6-SOURCE-EVENT", ACTOR, TEAM).get("ok", false), "source_review_created")
	check(service.assign_task("V6-SOURCE-TASK", "V6-SOURCE-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "source_review_assigned")
	check(service.execute_legal_research_task("V6-SOURCE-TASK", "V6-SOURCE-EXEC", ACTOR, TEAM, "V6-SOURCE-WORK", 2).get("ok", false), "source_review_executed")
	check(service.review_legal_source("V6-SOURCE-RESULT", "V6-SOURCE-COMP", "V6-SOURCE-TASK", source_id,
		"1", scope_id, ACTOR, TEAM).get("ok", false), "source_review_completed")
	var recipe_suffix := "001" if positive else "002"
	check(service.record_legal_extraction("V6-EXT", "VS-RECIPE-EXT-" + recipe_suffix, "V6-SOURCE-RESULT", ACTOR, TEAM).get("ok", false), "extraction_created")
	check(service.create_rule_statement("V6-RULE", "VS-RECIPE-RULE-" + recipe_suffix, ["V6-EXT"], ACTOR, TEAM).get("ok", false), "rule_created")
	check(service.consider_legal_interpretation("V6-INT", "VS-RECIPE-INT-" + recipe_suffix, ["V6-RULE"], ACTOR, TEAM).get("ok", false), "interpretation_created")
	var basis: Array = [{"basis_type": "ReviewWorkProduct", "id": "VS-WP-REVIEW-001"}]
	if positive:
		basis.append({"basis_type": "InvestigationResult", "id": "V6-INV-RESULT"})
		basis.append({"basis_type": "SourceMaterial", "id": "V6-INV-ACQ"})
	check(service.create_issue_analysis("V6-IA", "VS-RECIPE-ANALYSIS-" + recipe_suffix, "V6-LEGAL",
		["V6-RULE"], ["V6-INT"], basis, ACTOR, TEAM).get("ok", false), "analysis_created")
	check(service.create_argument("V6-ARG", "VS-RECIPE-ARG-" + recipe_suffix, "V6-IA", ACTOR, TEAM).get("ok", false), "argument_created")
	check(service.select_argument("V6-ARG-SEL", "V6-ARG", ACTOR, TEAM).get("ok", false), "argument_selected")


func materialize_path(service, suffix: String) -> Dictionary:
	check(service.create_drafting_task("VS-TASKDEF-DRAFTING-001", "V6-DRAFT-" + suffix,
		"V6-DRAFT-EVENT-" + suffix, ACTOR, TEAM).get("ok", false), "draft_created_" + suffix)
	check(service.assign_task("V6-DRAFT-" + suffix, "V6-DRAFT-ASSIGN-" + suffix, ACTOR, ACTOR, TEAM).get("ok", false), "draft_assigned_" + suffix)
	check(service.execute_drafting_task("V6-DRAFT-" + suffix, "V6-DRAFT-EXEC-" + suffix, ACTOR,
		TEAM, "V6-DRAFT-WORK-" + suffix, 1).get("ok", false), "draft_executed_" + suffix)
	check(service.complete_drafting_task("V6-DRAFT-" + suffix, "V6-DRAFT-COMP-" + suffix,
		"V6-DRAFT-WP-" + suffix, "V6-ARG", "V6-ARG-SEL", ACTOR, TEAM).get("ok", false), "draft_completed_" + suffix)
	check(service.finalize_document("V6-DOC-" + suffix, "1", "V6-DRAFT-WP-" + suffix,
		ACTOR, TEAM).get("ok", false), "document_finalized_" + suffix)
	check(service.create_submission_attempt("V6-ATTEMPT-" + suffix, "V6-DOC-" + suffix, "1",
		"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
		[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM).get("ok", false), "attempt_created_" + suffix)
	check(service.materialize_procedural_result("V6-RESULT-" + suffix, "V6-ATTEMPT-" + suffix,
		ACTOR, TEAM).get("ok", false), "result_created_" + suffix)
	var result: Dictionary = service.materialize_court_record("V6-MAT-" + suffix, "V6-ENTRY-" + suffix,
		"V6-DOC-" + suffix, "1", "V6-ATTEMPT-" + suffix, "V6-RESULT-" + suffix,
		"VS-RECORD-RULE-001", ACTOR, TEAM)
	check(result.get("ok", false), "record_materialized_" + suffix)
	return result


func evaluate(service, suffix: String, snapshot_id: String) -> Dictionary:
	return service.evaluate_fact_proposition("V6-EVAL-" + suffix, "V6-FIND-" + suffix,
		snapshot_id, "VS-FACT-APPROVAL-001", "1", "VS-CRITERION-APPROVAL-001", "1", ACTOR, TEAM)


func run_positive(content: Dictionary) -> void:
	var service = new_service(content)
	var empty := service.capture_court_record_snapshot("V6-SNAPSHOT-EMPTY", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	check(empty.get("ok", false) and empty["court_record_snapshot"]["court_record_entry_refs"].is_empty(), "empty_snapshot_captured")
	var before_duplicate_snapshot := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.capture_court_record_snapshot("V6-SNAPSHOT-EMPTY",
		"VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM), "duplicate_snapshot_id",
		before_duplicate_snapshot)
	var empty_eval := evaluate(service, "EMPTY", "V6-SNAPSHOT-EMPTY")
	check(empty_eval.get("ok", false), "empty_snapshot_evaluated")
	check(empty_eval["court_fact_finding"]["status"] == "not_established_on_record", "empty_snapshot_not_established")
	check(empty_eval["court_fact_finding"]["recognized_scope_ids"].is_empty(), "empty_snapshot_no_inverse_scope")
	bootstrap_argument(service, true)
	var materialized := materialize_path(service, "POS")
	var entry: Dictionary = materialized["court_record_entry"]
	check(entry["factual_basis_refs"].size() == 3, "complete_ordered_basis_preserved")
	check(entry["factual_basis_refs"][2]["source_id"] == "VS-SOURCE-APPROVAL-001", "approval_source_preserved")
	check("approval_text" in entry["factual_basis_refs"][2]["scope_ids"], "approval_scope_preserved")
	var journal: Array = service.debug_snapshot_for_tests()["journal"]
	var entry_journal_index: int = service._state.journal.size() - 1
	check(journal[-2]["kind"] == "court_record_materialized" and journal[-1]["kind"] == "court_record_entry_created", "materialization_keeps_two_event_sequence")
	check(journal[-1]["factual_basis_refs"] == entry["factual_basis_refs"], "entry_journal_preserves_complete_basis")
	var original_basis: Array = entry["factual_basis_refs"].duplicate(true)
	service._state.court_record_entries["V6-ENTRY-POS"]["factual_basis_refs"][2]["scope_ids"].clear()
	check("approval_text" in service._state.journal[-1]["factual_basis_refs"][2]["scope_ids"]
		and "approval_text" in service._state.finalized_documents["V6-DOC-POS"]["1"]["factual_basis_refs"][2]["scope_ids"],
		"authoritative_entry_nested_basis_isolated_from_journal_and_document")
	service._state.court_record_entries["V6-ENTRY-POS"]["factual_basis_refs"] = original_basis.duplicate(true)
	service._state.journal[-1]["factual_basis_refs"][2]["scope_ids"].clear()
	check("approval_text" in service._state.court_record_entries["V6-ENTRY-POS"]["factual_basis_refs"][2]["scope_ids"]
		and "approval_text" in service._state.finalized_documents["V6-DOC-POS"]["1"]["factual_basis_refs"][2]["scope_ids"],
		"journal_nested_basis_isolated_from_entry_and_document")
	service._state.journal[-1]["factual_basis_refs"] = original_basis.duplicate(true)
	check(service.adjudication_projection(ACTOR, TEAM)["projection"]["court_record_snapshots"][0]["court_record_entry_refs"].is_empty(), "prior_snapshot_immutable_after_record")
	var capture := service.capture_court_record_snapshot("V6-SNAPSHOT-POS", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	check(capture.get("ok", false), "positive_snapshot_captured")
	check(capture["court_record_snapshot"]["court_record_entry_refs"].size() == 1, "eligible_entry_included_once")
	var result := evaluate(service, "POS", "V6-SNAPSHOT-POS")
	check(result.get("ok", false), "positive_evaluation_succeeds")
	check(result["court_fact_finding"]["status"] == "recognized", "exact_basis_recognized")
	check(result["court_fact_finding"]["recognized_scope_ids"] == ["approval_act"], "recognized_scope_exact")
	check(result["court_fact_finding"]["reason_refs"] == ["approval_source_requirement_satisfied"], "recognized_reason_exact")
	check(result["sufficiency_evaluation_trace"]["evidence_uses"].size() == 1, "one_evidence_use_per_lineage")
	check(result["sufficiency_evaluation_trace"]["evidence_uses"][0]["role"] == "supports", "evidence_role_exact")
	check(result["sufficiency_evaluation_trace"]["evidence_uses"][0]["credibility_state"] == "accepted_for_scope", "evidence_credibility_exact")
	service._state.finalized_documents["V6-DOC-POS"]["1"]["factual_basis_refs"][2]["scope_ids"].clear()
	check("approval_text" in service.submission_projection(ACTOR, TEAM)["projection"]["court_record_entries"][0]["factual_basis_refs"][2]["scope_ids"]
		and "approval_text" in service._state.journal[entry_journal_index]["factual_basis_refs"][2]["scope_ids"],
		"finalized_document_nested_basis_isolated_from_entry_and_journal")
	var private_mutation_recheck := evaluate(service, "PRIVATE-MUTATION", "V6-SNAPSHOT-POS")
	check(private_mutation_recheck["court_fact_finding"]["status"] == "recognized", "evaluation_never_repairs_or_reads_private_prior")
	var projection_before := service.adjudication_projection(ACTOR, TEAM)
	var journal_count: int = service.debug_snapshot_for_tests()["journal"].size()
	var projection_mutated := projection_before.duplicate(true)
	projection_mutated["projection"]["court_fact_findings"][-1]["recognized_scope_ids"].clear()
	check(service.adjudication_projection(ACTOR, TEAM)["projection"]["court_fact_findings"][-1]["recognized_scope_ids"] == ["approval_act"], "projection_nested_deep_copy")
	service.adjudication_projection(ACTOR, TEAM); service.adjudication_projection(ACTOR, TEAM)
	check(service.debug_snapshot_for_tests()["journal"].size() == journal_count, "projection_reads_are_pure")
	var before_duplicate := service.debug_snapshot_for_tests()
	reject_unchanged(service, evaluate(service, "POS", "V6-SNAPSHOT-POS"), "duplicate_evaluation_and_finding_ids", before_duplicate)
	var before_duplicate_evaluation := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.evaluate_fact_proposition("V6-EVAL-POS", "V6-FIND-FRESH",
		"V6-SNAPSHOT-POS", "VS-FACT-APPROVAL-001", "1", "VS-CRITERION-APPROVAL-001",
		"1", ACTOR, TEAM), "duplicate_evaluation_id_independent", before_duplicate_evaluation)
	var before_duplicate_finding := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.evaluate_fact_proposition("V6-EVAL-FRESH", "V6-FIND-POS",
		"V6-SNAPSHOT-POS", "VS-FACT-APPROVAL-001", "1", "VS-CRITERION-APPROVAL-001",
		"1", ACTOR, TEAM), "duplicate_finding_id_independent", before_duplicate_finding)
	var prior_snapshot_bytes := JSON.stringify(service._state.court_record_snapshots["V6-SNAPSHOT-POS"])
	var prior_trace_bytes := JSON.stringify(service._state.sufficiency_evaluation_traces["V6-EVAL-POS"])
	var prior_finding_bytes := JSON.stringify(service._state.court_fact_findings["V6-FIND-POS"])
	var prior_entry_bytes := JSON.stringify(service._state.court_record_entries["V6-ENTRY-POS"])
	var prior_materialization_bytes := JSON.stringify(service._state.record_materialization_events["V6-MAT-POS"])
	var reevaluation := evaluate(service, "POS-2", "V6-SNAPSHOT-POS")
	check(reevaluation.get("ok", false), "fresh_ids_allow_reevaluation")
	check(service.adjudication_projection(ACTOR, TEAM)["projection"]["court_fact_findings"].size() == 4, "reevaluation_appends_history")
	check(JSON.stringify(service._state.court_record_snapshots["V6-SNAPSHOT-POS"]) == prior_snapshot_bytes,
		"later_evaluation_preserves_prior_snapshot_bytes")
	check(JSON.stringify(service._state.sufficiency_evaluation_traces["V6-EVAL-POS"]) == prior_trace_bytes,
		"later_evaluation_preserves_prior_trace_bytes")
	check(JSON.stringify(service._state.court_fact_findings["V6-FIND-POS"]) == prior_finding_bytes,
		"later_evaluation_preserves_prior_finding_bytes")
	check(JSON.stringify(service._state.court_record_entries["V6-ENTRY-POS"]) == prior_entry_bytes,
		"later_evaluation_preserves_prior_entry_bytes")
	check(JSON.stringify(service._state.record_materialization_events["V6-MAT-POS"]) == prior_materialization_bytes,
		"later_evaluation_preserves_prior_materialization_bytes")
	var materialized_return := materialized.duplicate(true)
	materialized_return["court_record_entry"]["factual_basis_refs"][2]["scope_ids"].clear()
	check("approval_text" in service.submission_projection(ACTOR, TEAM)["projection"]["court_record_entries"][0]["factual_basis_refs"][2]["scope_ids"], "materialization_return_basis_isolated")
	var projected_record := service.submission_projection(ACTOR, TEAM)
	projected_record["projection"]["court_record_entries"][0]["factual_basis_refs"][2]["scope_ids"].clear()
	check("approval_text" in service.submission_projection(ACTOR, TEAM)["projection"]["court_record_entries"][0]["factual_basis_refs"][2]["scope_ids"], "record_projection_basis_isolated")


func run_negative(content: Dictionary) -> void:
	var service = new_service(content)
	bootstrap_argument(service, false)
	var materialized := materialize_path(service, "NEG")
	check(materialized["court_record_entry"]["factual_basis_refs"].size() == 1, "negative_actual_basis_preserved_without_injection")
	check(service._state.court_fact_findings.is_empty(), "materialization_creates_no_finding")
	var capture := service.capture_court_record_snapshot("V6-SNAPSHOT-NEG", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	check(capture.get("ok", false) and capture["court_record_snapshot"]["court_record_entry_refs"].size() == 1, "negative_snapshot_closed")
	check(service._state.court_fact_findings.is_empty(), "snapshot_capture_creates_no_finding")
	var before_reused_evaluation := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.evaluate_fact_proposition("V6-ENTRY-NEG", "V6-FIND-REUSE-FRESH",
		"V6-SNAPSHOT-NEG", "VS-FACT-APPROVAL-001", "1", "VS-CRITERION-APPROVAL-001", "1",
		ACTOR, TEAM), "global_cross_entity_evaluation_id_reuse", before_reused_evaluation)
	var before_reused_finding := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.evaluate_fact_proposition("V6-EVAL-REUSE-FRESH", "V6-ENTRY-NEG",
		"V6-SNAPSHOT-NEG", "VS-FACT-APPROVAL-001", "1", "VS-CRITERION-APPROVAL-001", "1",
		ACTOR, TEAM), "global_cross_entity_finding_id_reuse", before_reused_finding)
	var result := evaluate(service, "NEG", "V6-SNAPSHOT-NEG")
	check(result.get("ok", false), "negative_evaluation_succeeds")
	check(result["court_fact_finding"]["status"] == "not_established_on_record", "independent_path_not_established")
	check(result["court_fact_finding"]["recognized_scope_ids"].is_empty(), "negative_has_no_recognized_scope")
	check(result["sufficiency_evaluation_trace"]["evidence_uses"].is_empty(), "negative_has_no_evidence_use")
	check(result["court_fact_finding"]["reason_refs"] == ["approval_source_required_scope_missing"], "negative_reason_exact")
	var before_wrong_fact := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.evaluate_fact_proposition("V6-EVAL-WRONG", "V6-FIND-WRONG",
		"V6-SNAPSHOT-NEG", "VS-FACT-APPROVAL-001", "2", "VS-CRITERION-APPROVAL-001", "1",
		ACTOR, TEAM), "wrong_fact_version", before_wrong_fact)
	var before_wrong_criterion := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.evaluate_fact_proposition("V6-EVAL-WRONG-C", "V6-FIND-WRONG-C",
		"V6-SNAPSHOT-NEG", "VS-FACT-APPROVAL-001", "1", "VS-CRITERION-APPROVAL-001", "2",
		ACTOR, TEAM), "wrong_criterion_version", before_wrong_criterion)
	var before_reused := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.capture_court_record_snapshot("V6-ENTRY-NEG", "VS-CASE-001",
		"VS-STAGE-001", ACTOR, TEAM), "global_identity_reuse", before_reused)
	var before_context := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.capture_court_record_snapshot("V6-SNAPSHOT-BAD", "OTHER",
		"VS-STAGE-001", ACTOR, TEAM), "wrong_snapshot_context", before_context)
	var before_materialization := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.materialize_court_record("V6-MAT-NEG-2", "V6-ENTRY-NEG-2",
		"V6-DOC-NEG", "1", "V6-ATTEMPT-NEG", "V6-RESULT-NEG", "VS-RECORD-RULE-001",
		ACTOR, TEAM), "duplicate_materialization_atomic", before_materialization)


func run_snapshot_exclusions(content: Dictionary) -> void:
	var service = new_service(content)
	bootstrap_argument(service, true)
	check(service.create_drafting_task("VS-TASKDEF-DRAFTING-001", "V6-EX-DRAFT",
		"V6-EX-DRAFT-EVENT", ACTOR, TEAM).get("ok", false), "exclusion_draft_created")
	check(service.assign_task("V6-EX-DRAFT", "V6-EX-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false),
		"exclusion_draft_assigned")
	check(service.execute_drafting_task("V6-EX-DRAFT", "V6-EX-EXEC", ACTOR, TEAM,
		"V6-EX-WORK", 1).get("ok", false), "exclusion_draft_executed")
	check(service.complete_drafting_task("V6-EX-DRAFT", "V6-EX-COMP", "V6-EX-WP", "V6-ARG",
		"V6-ARG-SEL", ACTOR, TEAM).get("ok", false), "exclusion_draft_completed")
	var draft_only := service.capture_court_record_snapshot("V6-EX-SNAPSHOT-DRAFT", "VS-CASE-001",
		"VS-STAGE-001", ACTOR, TEAM)
	check(draft_only["court_record_snapshot"]["court_record_entry_refs"].is_empty(),
		"draft_work_product_excluded_from_snapshot")
	check(service.finalize_document("V6-EX-DOC", "1", "V6-EX-WP", ACTOR, TEAM).get("ok", false),
		"exclusion_document_finalized")
	var finalized_only := service.capture_court_record_snapshot("V6-EX-SNAPSHOT-FINAL", "VS-CASE-001",
		"VS-STAGE-001", ACTOR, TEAM)
	check(finalized_only["court_record_snapshot"]["court_record_entry_refs"].is_empty(),
		"finalized_document_excluded_from_snapshot")
	check(service.create_submission_attempt("V6-EX-ATTEMPT", "V6-EX-DOC", "1",
		"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
		[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM).get("ok", false),
		"exclusion_unresolved_attempt_created")
	var unresolved_only := service.capture_court_record_snapshot("V6-EX-SNAPSHOT-UNRESOLVED",
		"VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	check(unresolved_only["court_record_snapshot"]["court_record_entry_refs"].is_empty(),
		"unresolved_submission_attempt_excluded_from_snapshot")
	check(service.materialize_procedural_result("V6-EX-RESULT", "V6-EX-ATTEMPT", ACTOR, TEAM).get("ok", false),
		"exclusion_bare_accepted_result_created")
	var bare_result := service.capture_court_record_snapshot("V6-EX-SNAPSHOT-BARE-RESULT",
		"VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	check(bare_result["court_record_snapshot"]["court_record_entry_refs"].is_empty(),
		"bare_accepted_result_without_entry_event_excluded")

	var defective = new_service(content)
	bootstrap_argument(defective, false)
	check(defective.create_drafting_task("VS-TASKDEF-DRAFTING-001", "V6-DEF-DRAFT",
		"V6-DEF-DRAFT-EVENT", ACTOR, TEAM).get("ok", false), "defective_draft_created")
	check(defective.assign_task("V6-DEF-DRAFT", "V6-DEF-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false),
		"defective_draft_assigned")
	check(defective.execute_drafting_task("V6-DEF-DRAFT", "V6-DEF-EXEC", ACTOR, TEAM,
		"V6-DEF-WORK", 1).get("ok", false), "defective_draft_executed")
	check(defective.complete_drafting_task("V6-DEF-DRAFT", "V6-DEF-COMP", "V6-DEF-WP", "V6-ARG",
		"V6-ARG-SEL", ACTOR, TEAM).get("ok", false), "defective_draft_completed")
	check(defective.finalize_document("V6-DEF-DOC", "1", "V6-DEF-WP", ACTOR, TEAM).get("ok", false),
		"defective_document_finalized")
	check(defective.create_submission_attempt("V6-DEF-ATTEMPT", "V6-DEF-DOC", "1",
		"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
		[DOC_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM).get("ok", false),
		"defective_attempt_created")
	var defective_result := defective.materialize_procedural_result("V6-DEF-RESULT",
		"V6-DEF-ATTEMPT", ACTOR, TEAM)
	check(defective_result.get("ok", false) and defective_result["procedural_result"]["kind"] ==
		"rejected_defective", "defective_result_materialized")
	var before_rejected_materialization := defective.debug_snapshot_for_tests()
	reject_unchanged(defective, defective.materialize_court_record("V6-DEF-MAT", "V6-DEF-ENTRY",
		"V6-DEF-DOC", "1", "V6-DEF-ATTEMPT", "V6-DEF-RESULT", "VS-RECORD-RULE-001",
		ACTOR, TEAM), "rejected_result_materialization", before_rejected_materialization)
	var defective_snapshot := defective.capture_court_record_snapshot("V6-DEF-SNAPSHOT", "VS-CASE-001",
		"VS-STAGE-001", ACTOR, TEAM)
	check(defective_snapshot["court_record_snapshot"]["court_record_entry_refs"].is_empty(),
		"rejected_defective_result_excluded_from_snapshot")


func run_attacks(content: Dictionary) -> void:
	var invalid_content := content.duplicate(true)
	invalid_content["recognition_criteria"][0]["scope_ids"] = ["other"]
	var invalid_service = SliceService.new()
	var before_invalid := invalid_service.debug_snapshot_for_tests()
	reject_unchanged(invalid_service, invalid_service.start_session(invalid_content, ACTOR, TEAM),
		"invalid_authored_binding", before_invalid)
	var service = new_service(content)
	var before_unauthorized := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.capture_court_record_snapshot("V6-SNAPSHOT-X", "VS-CASE-001",
		"VS-STAGE-001", "OTHER", TEAM), "unauthorized_capture", before_unauthorized)
	var before_missing := service.debug_snapshot_for_tests()
	reject_unchanged(service, evaluate(service, "MISSING", "MISSING-SNAPSHOT"), "missing_snapshot", before_missing)
	var empty_binding := service.capture_court_record_snapshot("V6-SNAPSHOT-BINDING", "VS-CASE-001",
		"VS-STAGE-001", ACTOR, TEAM)
	check(empty_binding.get("ok", false), "binding_attack_snapshot_created")
	var before_unknown_fact := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.evaluate_fact_proposition("V6-EVAL-UNKNOWN-FACT",
		"V6-FIND-UNKNOWN-FACT", "V6-SNAPSHOT-BINDING", "UNKNOWN", "1",
		"VS-CRITERION-APPROVAL-001", "1", ACTOR, TEAM), "unknown_fact", before_unknown_fact)
	var before_unknown_criterion := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.evaluate_fact_proposition("V6-EVAL-UNKNOWN-CRITERION",
		"V6-FIND-UNKNOWN-CRITERION", "V6-SNAPSHOT-BINDING", "VS-FACT-APPROVAL-001", "1",
		"UNKNOWN", "1", ACTOR, TEAM), "unknown_criterion", before_unknown_criterion)
	var empty := service.capture_court_record_snapshot("V6-SNAPSHOT-CORRUPT", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	check(empty.get("ok", false), "corruption_fixture_snapshot_created")
	service._state.court_record_snapshots["V6-SNAPSHOT-CORRUPT"]["court_record_entry_refs"] = [{"id": "UNKNOWN", "event_order": 9}]
	var before_corrupt := service.debug_snapshot_for_tests()
	reject_unchanged(service, evaluate(service, "CORRUPT", "V6-SNAPSHOT-CORRUPT"), "corrupt_snapshot_reference", before_corrupt)
	var state := service.debug_snapshot_for_tests()
	for forbidden in ["actual_state_record", "judge_profiles", "judge_interpretation_inputs", "choice_points",
		"judgments", "appeals", "remedies", "damages"]:
		check(not state.has(forbidden), "forbidden_state_absent_" + forbidden)
	var statuses: Array = []
	for finding in state.get("court_fact_findings", {}).values(): statuses.append(finding["status"])
	check("recognized_limited" not in statuses, "recognized_limited_unreachable")
	var api_text := FileAccess.get_file_as_string("res://vertical_slice/services/adjudication_service.gd")
	check(not api_text.contains("func create_finding") and not api_text.contains("func append_evidence_use"), "no_lower_level_public_mutation_api")
	var facade_text := FileAccess.get_file_as_string("res://vertical_slice/services/slice_service.gd")
	check(facade_text.contains("func capture_court_record_snapshot(snapshot_id: String, matter_id: String, stage_id: String,")
		and not facade_text.contains("capture_court_record_snapshot(snapshot_id: String, entry"),
		"snapshot_api_accepts_no_caller_membership_or_order")
	check(not api_text.contains("rand") and not api_text.contains("Time.")
		and not api_text.contains("capability") and not api_text.contains("prestige"),
		"evaluation_has_no_rng_time_capability_or_prestige_input")
	var ui_text := FileAccess.get_file_as_string("res://vertical_slice/ui/main.gd")
	check(ui_text.contains("capture_court_record_snapshot") and ui_text.contains("evaluate_fact_proposition")
		and not ui_text.contains("_state."), "ui_uses_service_only")
	var locale := ContentLoader.new().load_json_file("res://vertical_slice/content/locale_ko.json")
	var locale_strings: Dictionary = locale["content"]["strings"]
	check(locale_strings.get("ui.vs006.action_completed", "") == "%s 완료",
		"vs006_completion_message_is_localized")
	check(locale_strings.get("ui.vs006.query", "") == "Adjudication 조회",
		"vs006_query_label_is_localized")
	check(locale_strings.get("ui.vs006.before_start", "") == "사건 시작 전",
		"vs006_before_start_status_is_localized")
	var adjudication_ui_text := ui_text.get_slice("func _on_capture_snapshot_pressed()", 1).get_slice(
		"func _apply_submission_action", 0)
	check(not adjudication_ui_text.contains("완료")
		and adjudication_ui_text.contains('localized_text("ui.vs006.action_completed")'),
		"vs006_completion_message_has_no_ui_localization_bypass")
	check(not adjudication_ui_text.contains("Adjudication 조회")
		and adjudication_ui_text.contains('localized_text("ui.vs006.query")'),
		"vs006_query_label_has_no_ui_localization_bypass")
	var scene_text := FileAccess.get_file_as_string("res://vertical_slice/ui/main.tscn")
	var adjudication_scene_text := scene_text.get_slice('[node name="Adjudication"', 1)
	check(not adjudication_scene_text.contains('text = "사건 시작 전"')
		and ui_text.contains('adjudication_status_label.text = _presenter.localized_text("ui.vs006.before_start")'),
		"vs006_before_start_status_has_no_scene_localization_bypass")
	var presenter = SlicePresenter.new(); presenter.bind_localization(locale_strings)
	var presentation := presenter.adjudication_status_text(service.adjudication_projection(ACTOR, TEAM)["projection"])
	check(presentation.contains("실제 세계의 진실이나 Judgment가 아닙니다"), "presentation_disclaims_actual_truth")
	check(not presentation.contains("반대 사실이 참"), "presentation_makes_no_inverse_fact_claim")
	var redraw_journal_count: int = service.debug_snapshot_for_tests()["journal"].size()
	presenter.adjudication_status_text(service.adjudication_projection(ACTOR, TEAM)["projection"])
	presenter.adjudication_status_text(service.adjudication_projection(ACTOR, TEAM)["projection"])
	check(service.debug_snapshot_for_tests()["journal"].size() == redraw_journal_count,
		"tab_redraw_and_repeated_formatting_append_no_events")


func run_binding_attacks(content: Dictionary) -> void:
	var fact_mutations: Array = [
		{"key": "matter_id", "value": "OTHER", "label": "fact_matter_binding"},
		{"key": "stage_id", "value": "OTHER", "label": "fact_stage_binding"},
		{"key": "statement", "value": "다른 명제", "label": "fact_exact_statement_binding"},
		{"key": "scope_ids", "value": ["other"], "label": "fact_scope_binding"},
	]
	for mutation_value in fact_mutations:
		var mutation: Dictionary = mutation_value
		var service = new_service(content)
		service.capture_court_record_snapshot("V6-BIND-SNAPSHOT", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
		service._state.fact_propositions["VS-FACT-APPROVAL-001"]["1"][mutation["key"]] = mutation["value"]
		var before := service.debug_snapshot_for_tests()
		reject_unchanged(service, evaluate(service, mutation["label"], "V6-BIND-SNAPSHOT"),
			mutation["label"], before)
	var criterion_mutations: Array = [
		{"key": "matter_id", "value": "OTHER", "label": "criterion_matter_binding"},
		{"key": "stage_id", "value": "OTHER", "label": "criterion_stage_binding"},
		{"key": "fact_id", "value": "OTHER", "label": "criterion_proposition_binding"},
		{"key": "fact_version", "value": "2", "label": "criterion_proposition_version_binding"},
		{"key": "scope_ids", "value": ["other"], "label": "criterion_scope_binding"},
	]
	for mutation_value in criterion_mutations:
		var mutation: Dictionary = mutation_value
		var service = new_service(content)
		service.capture_court_record_snapshot("V6-BIND-SNAPSHOT", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
		service._state.recognition_criteria["VS-CRITERION-APPROVAL-001"]["1"][mutation["key"]] = mutation["value"]
		var before := service.debug_snapshot_for_tests()
		reject_unchanged(service, evaluate(service, mutation["label"], "V6-BIND-SNAPSHOT"),
			mutation["label"], before)


func run_authored_definition_attacks(content: Dictionary) -> void:
	var wrong_statement_content: Dictionary = content.duplicate(true)
	wrong_statement_content["fact_propositions"][0]["statement"] = "다른 명제"
	var service = SliceService.new()
	var before: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, service.start_session(wrong_statement_content, ACTOR, TEAM),
		"authored_fact_exact_statement", before)


func run_provenance_corruption_attacks(content: Dictionary) -> void:
	var missing_rule = variant_service(content, "CORRUPT-RULE-MISSING")
	missing_rule._state.record_inclusion_rules.erase("VS-RECORD-RULE-001")
	var before_missing_rule: Dictionary = missing_rule.debug_snapshot_for_tests()
	reject_unchanged(missing_rule, missing_rule.capture_court_record_snapshot(
		"V6-SNAPSHOT-CORRUPT-RULE-MISSING", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
		"missing_canonical_inclusion_rule", before_missing_rule)
	var rule_mutations: Array = [
		{"key": "id", "value": "OTHER", "label": "inclusion_rule_identity_binding"},
		{"key": "matter_id", "value": "OTHER", "label": "inclusion_rule_matter_binding"},
		{"key": "stage_id", "value": "OTHER", "label": "inclusion_rule_stage_binding"},
		{"key": "eligible_result_kind", "value": "rejected_defective", "label": "inclusion_rule_result_kind_binding"},
	]
	for mutation_value in rule_mutations:
		var mutation: Dictionary = mutation_value
		var corrupt_rule = variant_service(content, "CORRUPT-RULE-" + mutation["key"])
		corrupt_rule._state.record_inclusion_rules["VS-RECORD-RULE-001"][mutation["key"]] = mutation["value"]
		var before_corrupt_rule: Dictionary = corrupt_rule.debug_snapshot_for_tests()
		reject_unchanged(corrupt_rule, corrupt_rule.capture_court_record_snapshot(
			"V6-SNAPSHOT-CORRUPT-RULE-" + mutation["key"], "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
			mutation["label"], before_corrupt_rule)
	var wrong_entry_order = variant_service(content, "CORRUPT-ENTRY-ORDER")
	wrong_entry_order._state.court_record_entries["V6-ENTRY-CORRUPT-ENTRY-ORDER"]["event_order"] += 1
	var before_wrong_entry_order: Dictionary = wrong_entry_order.debug_snapshot_for_tests()
	reject_unchanged(wrong_entry_order, wrong_entry_order.capture_court_record_snapshot(
		"V6-SNAPSHOT-CORRUPT-ENTRY-ORDER", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
		"entry_materialization_event_order_mismatch", before_wrong_entry_order)
	var missing_document = variant_service(content, "CORRUPT-DOC")
	missing_document._state.finalized_documents.erase("V6-DOC-CORRUPT-DOC")
	var before_missing_document: Dictionary = missing_document.debug_snapshot_for_tests()
	reject_unchanged(missing_document, missing_document.capture_court_record_snapshot(
		"V6-SNAPSHOT-CORRUPT-DOC", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
		"missing_finalized_document_provenance", before_missing_document)
	var wrong_document_version = variant_service(content, "CORRUPT-DOC-VERSION")
	wrong_document_version._state.finalized_documents["V6-DOC-CORRUPT-DOC-VERSION"].erase("1")
	var before_wrong_document_version: Dictionary = wrong_document_version.debug_snapshot_for_tests()
	reject_unchanged(wrong_document_version, wrong_document_version.capture_court_record_snapshot(
		"V6-SNAPSHOT-CORRUPT-DOC-VERSION", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
		"missing_finalized_document_version_provenance", before_wrong_document_version)
	var wrong_entry_result = variant_service(content, "CORRUPT-ENTRY-RESULT")
	wrong_entry_result._state.court_record_entries["V6-ENTRY-CORRUPT-ENTRY-RESULT"]["procedural_result_id"] = "OTHER"
	var before_wrong_entry_result: Dictionary = wrong_entry_result.debug_snapshot_for_tests()
	reject_unchanged(wrong_entry_result, wrong_entry_result.capture_court_record_snapshot(
		"V6-SNAPSHOT-CORRUPT-ENTRY-RESULT", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
		"entry_result_event_provenance_mismatch", before_wrong_entry_result)
	var wrong_entry_attempt = variant_service(content, "CORRUPT-ENTRY-ATTEMPT")
	wrong_entry_attempt._state.court_record_entries["V6-ENTRY-CORRUPT-ENTRY-ATTEMPT"]["submission_attempt_id"] = "OTHER"
	var before_wrong_entry_attempt: Dictionary = wrong_entry_attempt.debug_snapshot_for_tests()
	reject_unchanged(wrong_entry_attempt, wrong_entry_attempt.capture_court_record_snapshot(
		"V6-SNAPSHOT-CORRUPT-ENTRY-ATTEMPT", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
		"entry_attempt_event_provenance_mismatch", before_wrong_entry_attempt)
	var wrong_event_context = variant_service(content, "CORRUPT-EVENT-CONTEXT")
	wrong_event_context._state.record_materialization_events["V6-MAT-CORRUPT-EVENT-CONTEXT"]["matter_id"] = "OTHER"
	var before_wrong_event_context: Dictionary = wrong_event_context.debug_snapshot_for_tests()
	reject_unchanged(wrong_event_context, wrong_event_context.capture_court_record_snapshot(
		"V6-SNAPSHOT-CORRUPT-EVENT-CONTEXT", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
		"event_context_mismatch_not_silently_skipped", before_wrong_event_context)
	wrong_event_context._state.record_materialization_events["V6-MAT-CORRUPT-EVENT-CONTEXT"]["matter_id"] = "VS-CASE-001"
	wrong_event_context._state.record_materialization_events["V6-MAT-CORRUPT-EVENT-CONTEXT"]["stage_id"] = "OTHER"
	var before_wrong_event_stage: Dictionary = wrong_event_context.debug_snapshot_for_tests()
	reject_unchanged(wrong_event_context, wrong_event_context.capture_court_record_snapshot(
		"V6-SNAPSHOT-CORRUPT-EVENT-STAGE", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM),
		"event_stage_mismatch_not_silently_skipped", before_wrong_event_stage)


func run_failed_materialization_atomicity(content: Dictionary) -> void:
	var mismatch = variant_service(content, "MAT-DOC-MISMATCH")
	var version_two: Dictionary = mismatch._state.finalized_documents["V6-DOC-MAT-DOC-MISMATCH"]["1"].duplicate(true)
	version_two["version"] = "2"
	version_two["document_version"] = "2"
	mismatch._state.finalized_documents["V6-DOC-MAT-DOC-MISMATCH"]["2"] = version_two
	var before_mismatch: Dictionary = mismatch.debug_snapshot_for_tests()
	reject_unchanged(mismatch, mismatch.materialize_court_record("V6-MAT-MISMATCH-FRESH",
		"V6-ENTRY-MISMATCH-FRESH", "V6-DOC-MAT-DOC-MISMATCH", "2",
		"V6-ATTEMPT-MAT-DOC-MISMATCH", "V6-RESULT-MAT-DOC-MISMATCH",
		"VS-RECORD-RULE-001", ACTOR, TEAM), "document_version_materialization_mismatch", before_mismatch)
	var wrong_rule = variant_service(content, "MAT-WRONG-RULE")
	wrong_rule._state.record_inclusion_rules["VS-RECORD-RULE-001"]["target_id"] = "OTHER"
	var before_wrong_rule: Dictionary = wrong_rule.debug_snapshot_for_tests()
	reject_unchanged(wrong_rule, wrong_rule.materialize_court_record("V6-MAT-WRONG-RULE-FRESH",
		"V6-ENTRY-WRONG-RULE-FRESH", "V6-DOC-MAT-WRONG-RULE", "1",
		"V6-ATTEMPT-MAT-WRONG-RULE", "V6-RESULT-MAT-WRONG-RULE",
		"VS-RECORD-RULE-001", ACTOR, TEAM), "wrong_inclusion_rule_materialization", before_wrong_rule)
	var duplicate_pair = variant_service(content, "MAT-PAIR")
	var before_duplicate_pair: Dictionary = duplicate_pair.debug_snapshot_for_tests()
	reject_unchanged(duplicate_pair, duplicate_pair.materialize_court_record("V6-MAT-PAIR-FRESH",
		"V6-ENTRY-PAIR-FRESH", "V6-DOC-MAT-PAIR", "1", "V6-ATTEMPT-MAT-PAIR",
		"V6-RESULT-MAT-PAIR", "VS-RECORD-RULE-001", ACTOR, TEAM),
		"result_rule_pair_materialization", before_duplicate_pair)


func variant_service(content: Dictionary, suffix: String):
	var service = new_service(content)
	bootstrap_argument(service, true)
	materialize_path(service, suffix)
	return service


func run_basis_variants(content: Dictionary) -> void:
	var duplicate_service = variant_service(content, "DUP")
	var duplicate_basis: Dictionary = duplicate_service._state.court_record_entries["V6-ENTRY-DUP"]["factual_basis_refs"][2].duplicate(true)
	duplicate_service._state.court_record_entries["V6-ENTRY-DUP"]["factual_basis_refs"].append(duplicate_basis)
	duplicate_service._state.journal[-1]["factual_basis_refs"].append(duplicate_basis.duplicate(true))
	duplicate_service.capture_court_record_snapshot("V6-SNAPSHOT-DUP", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	var duplicate_result := evaluate(duplicate_service, "DUP", "V6-SNAPSHOT-DUP")
	check(duplicate_result["sufficiency_evaluation_trace"]["evidence_uses"].size() == 1, "same_lineage_duplicates_deduplicated")
	var wrong_version_service = variant_service(content, "WRONG-VERSION")
	wrong_version_service._state.court_record_entries["V6-ENTRY-WRONG-VERSION"]["factual_basis_refs"][2]["source_version"] = "2"
	wrong_version_service._state.journal[-1]["factual_basis_refs"][2]["source_version"] = "2"
	wrong_version_service.capture_court_record_snapshot("V6-SNAPSHOT-WRONG-VERSION", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	check(evaluate(wrong_version_service, "WRONG-VERSION", "V6-SNAPSHOT-WRONG-VERSION")["court_fact_finding"]["status"] == "not_established_on_record", "wrong_source_version_does_not_satisfy")
	var wrong_scope_service = variant_service(content, "WRONG-SCOPE")
	wrong_scope_service._state.court_record_entries["V6-ENTRY-WRONG-SCOPE"]["factual_basis_refs"][2]["scope_ids"] = ["header"]
	wrong_scope_service._state.journal[-1]["factual_basis_refs"][2]["scope_ids"] = ["header"]
	wrong_scope_service.capture_court_record_snapshot("V6-SNAPSHOT-WRONG-SCOPE", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	check(evaluate(wrong_scope_service, "WRONG-SCOPE", "V6-SNAPSHOT-WRONG-SCOPE")["court_fact_finding"]["status"] == "not_established_on_record", "missing_required_scope_does_not_satisfy")
	var historical_service = variant_service(content, "HISTORICAL")
	historical_service._state.court_record_entries["V6-ENTRY-HISTORICAL"].erase("factual_basis_refs")
	historical_service._state.journal[-1].erase("factual_basis_refs")
	historical_service.capture_court_record_snapshot("V6-SNAPSHOT-HISTORICAL", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	var historical := evaluate(historical_service, "HISTORICAL", "V6-SNAPSHOT-HISTORICAL")
	check(historical["court_fact_finding"]["status"] == "not_established_on_record", "historical_entry_without_basis_supplies_no_support")
	check(not historical_service._state.court_record_entries["V6-ENTRY-HISTORICAL"].has("factual_basis_refs"), "historical_entry_is_never_backfilled")


func run_real_version_fidelity(content: Dictionary) -> void:
	var service = new_service(content)
	bootstrap_argument(service, true)
	check(service.create_drafting_task("VS-TASKDEF-DRAFTING-001", "V6-V1-DRAFT", "V6-V1-DRAFT-EVENT", ACTOR, TEAM).get("ok", false), "versioned_v1_draft_created")
	check(service.assign_task("V6-V1-DRAFT", "V6-V1-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "versioned_v1_draft_assigned")
	check(service.execute_drafting_task("V6-V1-DRAFT", "V6-V1-EXEC", ACTOR, TEAM, "V6-V1-WORK", 1).get("ok", false), "versioned_v1_draft_executed")
	check(service.complete_drafting_task("V6-V1-DRAFT", "V6-V1-COMP", "V6-V1-WP", "V6-ARG", "V6-ARG-SEL", ACTOR, TEAM).get("ok", false), "versioned_v1_draft_completed")
	check(service.finalize_document("V6-VERSIONED-DOC", "1", "V6-V1-WP", ACTOR, TEAM).get("ok", false), "versioned_document_v1_finalized")
	check(service.create_legal_source_review_task("VS-LEGAL-SOURCE-002", "1", "conduct", "V6-V2-SOURCE-TASK", "V6-V2-SOURCE-EVENT", ACTOR, TEAM).get("ok", false), "versioned_negative_source_review_created")
	check(service.assign_task("V6-V2-SOURCE-TASK", "V6-V2-SOURCE-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "versioned_negative_source_review_assigned")
	check(service.execute_legal_research_task("V6-V2-SOURCE-TASK", "V6-V2-SOURCE-EXEC", ACTOR, TEAM, "V6-V2-SOURCE-WORK", 2).get("ok", false), "versioned_negative_source_review_executed")
	check(service.review_legal_source("V6-V2-SOURCE-RESULT", "V6-V2-SOURCE-COMP", "V6-V2-SOURCE-TASK", "VS-LEGAL-SOURCE-002", "1", "conduct", ACTOR, TEAM).get("ok", false), "versioned_negative_source_review_completed")
	check(service.record_legal_extraction("V6-V2-EXT", "VS-RECIPE-EXT-002", "V6-V2-SOURCE-RESULT", ACTOR, TEAM).get("ok", false), "versioned_negative_extraction")
	check(service.create_rule_statement("V6-V2-RULE", "VS-RECIPE-RULE-002", ["V6-V2-EXT"], ACTOR, TEAM).get("ok", false), "versioned_negative_rule")
	check(service.consider_legal_interpretation("V6-V2-INT", "VS-RECIPE-INT-002", ["V6-V2-RULE"], ACTOR, TEAM).get("ok", false), "versioned_negative_interpretation")
	check(service.create_issue_analysis("V6-V2-IA", "VS-RECIPE-ANALYSIS-002", "V6-LEGAL", ["V6-V2-RULE"], ["V6-V2-INT"], [{"basis_type": "ReviewWorkProduct", "id": "VS-WP-REVIEW-001"}], ACTOR, TEAM).get("ok", false), "versioned_negative_analysis")
	check(service.create_argument("V6-V2-ARG", "VS-RECIPE-ARG-002", "V6-V2-IA", ACTOR, TEAM).get("ok", false), "versioned_negative_argument")
	check(service.select_argument("V6-V2-ARG-SEL", "V6-V2-ARG", ACTOR, TEAM).get("ok", false), "versioned_negative_selected")
	check(service.create_drafting_task("VS-TASKDEF-DRAFTING-001", "V6-V2-DRAFT", "V6-V2-DRAFT-EVENT", ACTOR, TEAM).get("ok", false), "versioned_v2_draft_created")
	check(service.assign_task("V6-V2-DRAFT", "V6-V2-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "versioned_v2_draft_assigned")
	check(service.execute_drafting_task("V6-V2-DRAFT", "V6-V2-EXEC", ACTOR, TEAM, "V6-V2-WORK", 1).get("ok", false), "versioned_v2_draft_executed")
	check(service.complete_drafting_task("V6-V2-DRAFT", "V6-V2-COMP", "V6-V2-WP", "V6-V2-ARG", "V6-V2-ARG-SEL", ACTOR, TEAM).get("ok", false), "versioned_v2_draft_completed")
	check(service.finalize_document("V6-VERSIONED-DOC", "2", "V6-V2-WP", ACTOR, TEAM).get("ok", false), "versioned_document_v2_finalized")
	var first_entry_before_later := ""
	var first_event_before_later := ""
	var first_snapshot_before_later := ""
	for version in ["1", "2"]:
		check(service.create_submission_attempt("V6-VERSIONED-ATTEMPT-" + version, "V6-VERSIONED-DOC", version,
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM).get("ok", false), "versioned_attempt_" + version)
		check(service.materialize_procedural_result("V6-VERSIONED-RESULT-" + version, "V6-VERSIONED-ATTEMPT-" + version, ACTOR, TEAM).get("ok", false), "versioned_result_" + version)
		check(service.materialize_court_record("V6-VERSIONED-MAT-" + version, "V6-VERSIONED-ENTRY-" + version,
			"V6-VERSIONED-DOC", version, "V6-VERSIONED-ATTEMPT-" + version, "V6-VERSIONED-RESULT-" + version,
			"VS-RECORD-RULE-001", ACTOR, TEAM).get("ok", false), "versioned_entry_" + version)
		if version == "1":
			first_entry_before_later = JSON.stringify(service._state.court_record_entries["V6-VERSIONED-ENTRY-1"])
			first_event_before_later = JSON.stringify(service._state.record_materialization_events["V6-VERSIONED-MAT-1"])
			var first_capture := service.capture_court_record_snapshot("V6-VERSIONED-SNAPSHOT-1",
				"VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
			first_snapshot_before_later = JSON.stringify(first_capture["court_record_snapshot"])
	var entries: Array = service.submission_projection(ACTOR, TEAM)["projection"]["court_record_entries"]
	check(entries[0]["factual_basis_refs"].size() == 3 and entries[1]["factual_basis_refs"].size() == 1, "two_real_versions_preserve_distinct_exact_bases")
	check(entries[0]["document_version"] == "1" and entries[1]["document_version"] == "2", "two_real_versions_preserve_lineage_order")
	check("approval_text" in entries[0]["factual_basis_refs"][2]["scope_ids"], "later_version_does_not_rewrite_v1_basis")
	check(JSON.stringify(service._state.court_record_entries["V6-VERSIONED-ENTRY-1"]) == first_entry_before_later,
		"later_materialization_preserves_prior_entry_bytes")
	check(JSON.stringify(service._state.record_materialization_events["V6-VERSIONED-MAT-1"]) == first_event_before_later,
		"later_materialization_preserves_prior_event_bytes")
	check(JSON.stringify(service._state.court_record_snapshots["V6-VERSIONED-SNAPSHOT-1"]) == first_snapshot_before_later,
		"later_materialization_preserves_prior_snapshot_bytes")
	var latest_capture := service.capture_court_record_snapshot("V6-VERSIONED-SNAPSHOT-2",
		"VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	var refs: Array = latest_capture["court_record_snapshot"]["court_record_entry_refs"]
	check(refs.map(func(ref): return ref["id"]) == ["V6-VERSIONED-ENTRY-1", "V6-VERSIONED-ENTRY-2"],
		"multi_entry_snapshot_includes_all_entries_in_materialization_order")
	check(refs[0]["event_order"] < refs[1]["event_order"],
		"multi_entry_snapshot_preserves_court_record_event_order")
	check(JSON.parse_string(first_snapshot_before_later)["court_record_entry_refs"].size() == 1,
		"caller_cannot_retroactively_omit_reorder_or_inject_snapshot_membership")
	service._state.court_record_snapshots["V6-VERSIONED-SNAPSHOT-1"]["court_record_entry_refs"].append(
		refs[1].duplicate(true))
	var corrupted_retroactive := service.debug_snapshot_for_tests()
	reject_unchanged(service, evaluate(service, "RETROACTIVE", "V6-VERSIONED-SNAPSHOT-1"),
		"retroactively_injected_snapshot_ref", corrupted_retroactive)
	var duplicate_ref = variant_service(content, "SNAPSHOT-DUP-REF")
	duplicate_ref.capture_court_record_snapshot("V6-SNAPSHOT-DUP-REF", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	duplicate_ref._state.court_record_snapshots["V6-SNAPSHOT-DUP-REF"]["court_record_entry_refs"].append(
		duplicate_ref._state.court_record_snapshots["V6-SNAPSHOT-DUP-REF"]["court_record_entry_refs"][0].duplicate(true))
	var before_duplicate_ref: Dictionary = duplicate_ref.debug_snapshot_for_tests()
	reject_unchanged(duplicate_ref, evaluate(duplicate_ref, "DUP-REF", "V6-SNAPSHOT-DUP-REF"),
		"duplicated_snapshot_ref", before_duplicate_ref)
	var reordered = new_service(content)
	bootstrap_argument(reordered, true)
	materialize_path(reordered, "REORDER-A")
	# Reuse the same authored argument through a second real document path.
	materialize_path(reordered, "REORDER-B")
	reordered.capture_court_record_snapshot("V6-SNAPSHOT-REORDER", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	reordered._state.court_record_snapshots["V6-SNAPSHOT-REORDER"]["court_record_entry_refs"].reverse()
	var before_reordered: Dictionary = reordered.debug_snapshot_for_tests()
	reject_unchanged(reordered, evaluate(reordered, "REORDER", "V6-SNAPSHOT-REORDER"),
		"reordered_snapshot_refs", before_reordered)


func replay(content: Dictionary) -> Dictionary:
	var service = new_service(content)
	service.capture_court_record_snapshot("V6-REPLAY-SNAPSHOT", "VS-CASE-001", "VS-STAGE-001", ACTOR, TEAM)
	evaluate(service, "REPLAY", "V6-REPLAY-SNAPSHOT")
	return service.debug_snapshot_for_tests()


func _initialize() -> void:
	var loaded := ContentLoader.new().load_json_file("res://vertical_slice/content/slice_case.json")
	check(loaded.get("ok", false), "content_loads")
	var content: Dictionary = loaded.get("content", {})
	run_positive(content)
	run_negative(content)
	run_snapshot_exclusions(content)
	run_attacks(content)
	run_binding_attacks(content)
	run_authored_definition_attacks(content)
	run_basis_variants(content)
	run_provenance_corruption_attacks(content)
	run_failed_materialization_atomicity(content)
	run_real_version_fidelity(content)
	var replay_a := replay(content)
	var replay_b := replay(content)
	check(replay_a == replay_b, "same_commands_replay_semantically_deterministic")
	print("SUMMARY %d checks, %d failures; VS-006 Bounded Court Fact Finding" % [checks, failures])
	quit(0 if failures == 0 else 1)
