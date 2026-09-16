extends SceneTree

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")
const SlicePresenter = preload("res://vertical_slice/presentation/slice_presenter.gd")
const CONTENT_PATH := "res://vertical_slice/content/slice_case.json"
const ACTOR := "VS-LAWYER-001"
const TEAM := "VS-TEAM-001"
const DOC_MEMBER := "VS-PACKAGE-MEMBER-DOCUMENT-001"
const EXHIBIT_MEMBER := "VS-PACKAGE-MEMBER-EXHIBIT-001"
const FOREIGN_MEMBER := "VS-PACKAGE-MEMBER-FOREIGN-001"
var checks := 0
var failures := 0


func check(condition: bool, label: String) -> void:
	checks += 1
	if not condition: failures += 1
	print(("PASS " if condition else "FAIL ") + label)


func reject_unchanged(service, result: Dictionary, error: String, label: String,
		before: Dictionary) -> void:
	check(not result.get("ok", false), label + "_rejected")
	check(result.get("error", "") == error, label + "_explicit_error")
	check(service.debug_snapshot_for_tests() == before, label + "_atomic")


func load_content() -> Dictionary:
	var loaded: Dictionary = ContentLoader.new().load_json_file(CONTENT_PATH)
	check(loaded.get("ok", false), "content_loads")
	return loaded.get("content", {})


func new_service(authored: Dictionary):
	var service = SliceService.new()
	check(service.start_session(authored.duplicate(true), ACTOR, TEAM).get("ok", false), "session_starts")
	return service


func bootstrap_selected_argument(service) -> void:
	var scopes: Array = service.debug_snapshot_for_tests()["task_definitions"]["VS-TASKDEF-REVIEW-001"]["authorized_source_scopes"]
	check(service.assign_task("VS-TASK-REVIEW-001", "B-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "bootstrap_review_assigned")
	check(service.execute_task("VS-TASK-REVIEW-001", "B-EXEC", ACTOR, TEAM, "B-WORK", 2, scopes).get("ok", false), "bootstrap_review_executed")
	check(service.complete_review_task("VS-TASK-REVIEW-001", "B-COMP", "VS-WP-REVIEW-001", ACTOR, TEAM,
		"VS-ANALYSIS-OPTION-002").get("ok", false), "bootstrap_review_completed")
	check(service.select_issue("VS-ISSUE-001", "B-ISSUE-SEL", ACTOR, TEAM,
		"VS-WP-REVIEW-001").get("ok", false), "bootstrap_issue_selected")
	check(service.create_case_theory("B-THEORY", "B-THEORY-V1", "VS-ISSUE-001", "VS-WP-REVIEW-001",
		ACTOR, TEAM, "합성 사건 이론", ["VS-ASSERTION-002"], ["VS-GAP-001"],
		["VS-WP-REVIEW-001-ANALYSIS-001"], ["VS-GAP-001"]).get("ok", false), "bootstrap_theory_created")
	check(service.create_legal_research_task("VS-LRQ-001", "B-LEGAL", "B-LEGAL-EVENT", ACTOR, TEAM).get("ok", false), "bootstrap_research_created")
	check(service.assign_task("B-LEGAL", "B-LEGAL-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "bootstrap_research_assigned")
	check(service.execute_legal_research_task("B-LEGAL", "B-LEGAL-EXEC", ACTOR, TEAM,
		"B-LEGAL-WORK", 2).get("ok", false), "bootstrap_research_executed")
	check(service.complete_legal_research_task("B-LEGAL", "B-LEGAL-COMP", ["B-DISC-1", "B-DISC-2"],
		ACTOR, TEAM).get("ok", false), "bootstrap_research_completed")
	check(service.create_legal_source_review_task("VS-LEGAL-SOURCE-002", "1", "conduct", "B-SOURCE-REVIEW",
		"B-SOURCE-REVIEW-EVENT", ACTOR, TEAM).get("ok", false), "bootstrap_source_review_created")
	check(service.assign_task("B-SOURCE-REVIEW", "B-SOURCE-ASSIGN", ACTOR, ACTOR, TEAM).get("ok", false), "bootstrap_source_review_assigned")
	check(service.execute_legal_research_task("B-SOURCE-REVIEW", "B-SOURCE-EXEC", ACTOR, TEAM,
		"B-SOURCE-WORK", 2).get("ok", false), "bootstrap_source_review_executed")
	check(service.review_legal_source("B-SOURCE-REVIEW-RESULT", "B-SOURCE-COMP", "B-SOURCE-REVIEW",
		"VS-LEGAL-SOURCE-002", "1", "conduct", ACTOR, TEAM).get("ok", false), "bootstrap_source_review_completed")
	check(service.record_legal_extraction("B-EXT", "VS-RECIPE-EXT-002", "B-SOURCE-REVIEW-RESULT", ACTOR, TEAM).get("ok", false), "bootstrap_extraction")
	check(service.create_rule_statement("B-RULE", "VS-RECIPE-RULE-002", ["B-EXT"], ACTOR, TEAM).get("ok", false), "bootstrap_rule")
	check(service.consider_legal_interpretation("B-INT", "VS-RECIPE-INT-002", ["B-RULE"], ACTOR, TEAM).get("ok", false), "bootstrap_interpretation")
	check(service.create_issue_analysis("B-IA", "VS-RECIPE-ANALYSIS-002", "B-LEGAL", ["B-RULE"],
		["B-INT"], [{"basis_type": "ReviewWorkProduct", "id": "VS-WP-REVIEW-001"}], ACTOR, TEAM).get("ok", false), "bootstrap_issue_analysis")
	check(service.create_argument("B-ARG", "VS-RECIPE-ARG-002", "B-IA", ACTOR, TEAM).get("ok", false), "bootstrap_argument")
	check(service.select_argument("B-ARG-SEL", "B-ARG", ACTOR, TEAM).get("ok", false), "bootstrap_argument_selected")


func create_finalized(service, suffix: String) -> void:
	create_draft(service, suffix)
	check(service.finalize_document("FINAL-DOC-" + suffix, "1", "DRAFT-WP-" + suffix,
		ACTOR, TEAM).get("ok", false), "document_finalized_" + suffix)


func create_draft(service, suffix: String) -> void:
	create_draft_from_definition(service, suffix, "VS-TASKDEF-DRAFTING-001")


func create_draft_from_definition(service, suffix: String, definition_id: String,
		creation_event_id: String = "") -> void:
	var task := "DRAFT-TASK-" + suffix
	var event_id := creation_event_id if not creation_event_id.is_empty() else "DRAFT-EVENT-" + suffix
	check(service.create_drafting_task(definition_id, task, event_id,
		ACTOR, TEAM).get("ok", false), "draft_task_created_" + suffix)
	check(service.assign_task(task, "DRAFT-ASSIGN-" + suffix, ACTOR, ACTOR, TEAM).get("ok", false), "draft_assigned_" + suffix)
	check(service.execute_drafting_task(task, "DRAFT-EXEC-" + suffix, ACTOR, TEAM,
		"DRAFT-WORK-" + suffix, 1).get("ok", false), "draft_executed_" + suffix)
	check(service.complete_drafting_task(task, "DRAFT-COMP-" + suffix, "DRAFT-WP-" + suffix,
		"B-ARG", "B-ARG-SEL", ACTOR, TEAM).get("ok", false), "draft_completed_" + suffix)


func reject_content_initialization(authored: Dictionary, expected_error: String, label: String) -> void:
	var service = SliceService.new()
	var before: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, service.start_session(authored, ACTOR, TEAM), expected_error, label, before)


func accepted_flow(authored: Dictionary, detailed: bool = true):
	var service = new_service(authored)
	if detailed:
		var initial: Dictionary = service.submission_projection(ACTOR, TEAM)["projection"]
		check(initial["finalized_documents"].is_empty(), "selected_argument_absent_has_no_document")
		check(initial["submission_attempts"].is_empty() and initial["procedural_results"].is_empty(), "session_start_has_no_attempt_or_result")
		check(initial["court_record_entries"].is_empty(), "session_start_has_no_court_record")
		var before_no_selection := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_drafting_task("VS-TASKDEF-DRAFTING-001", "EARLY-DRAFT",
			"EARLY-DRAFT-EVENT", ACTOR, TEAM), "selected_argument_required",
			"drafting_requires_selected_argument", before_no_selection)
	bootstrap_selected_argument(service)
	if detailed:
		var after_argument: Dictionary = service.submission_projection(ACTOR, TEAM)["projection"]
		check(after_argument["finalized_documents"].is_empty() and after_argument["submission_attempts"].is_empty(), "selected_argument_does_not_create_document_or_attempt")
		var before_early := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.finalize_document("EARLY-DOC", "1", "MISSING-WP", ACTOR, TEAM),
			"completed_draft_work_product_required", "finalization_requires_completed_draft", before_early)
	create_finalized(service, "A")
	create_draft(service, "A2")
	check(service.finalize_document("FINAL-DOC-A", "2", "DRAFT-WP-A2", ACTOR, TEAM).get("ok", false),
		"same_lineage_v2_finalized_from_distinct_work_product")
	if detailed:
		var before_reused_work_product := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.finalize_document("FINAL-DOC-A", "3", "DRAFT-WP-A2", ACTOR, TEAM),
			"draft_work_product_version_already_finalized", "later_version_requires_distinct_work_product_pair",
			before_reused_work_product)
	create_draft(service, "SEPARATE")
	check(service.finalize_document("FINAL-DOC-SEPARATE", "1", "DRAFT-WP-SEPARATE", ACTOR, TEAM).get("ok", false),
		"distinct_document_id_creates_separate_lineage")
	if detailed:
		create_draft(service, "DELIMITED-ONE")
		check(service.finalize_document("A|B", "C", "DRAFT-WP-DELIMITED-ONE", ACTOR, TEAM).get("ok", false),
			"delimiter_document_identity_one_finalized")
		create_draft(service, "DELIMITED-TWO")
		check(service.finalize_document("A", "B|C", "DRAFT-WP-DELIMITED-TWO", ACTOR, TEAM).get("ok", false),
			"delimiter_document_identity_two_finalized")
		var finalized: Dictionary = service.submission_projection(ACTOR, TEAM)["projection"]
		check(finalized["submission_attempts"].is_empty() and finalized["procedural_results"].is_empty(), "finalization_does_not_submit")
		check(finalized["finalized_documents"].size() == 5, "same_lineage_versions_and_distinct_lineages_are_retained")
		check(finalized["finalized_documents"][0]["document_id"] == "FINAL-DOC-A"
			and finalized["finalized_documents"][0]["document_version"] == "1"
			and finalized["finalized_documents"][1]["document_id"] == "FINAL-DOC-A"
			and finalized["finalized_documents"][1]["document_version"] == "2",
			"finalized_versions_use_composite_identity")
		check(finalized["finalized_documents"][2]["document_id"] == "FINAL-DOC-SEPARATE",
			"distinct_document_id_is_not_same_lineage_revision")
		check(finalized["finalized_documents"][3]["document_id"] == "A|B"
			and finalized["finalized_documents"][3]["document_version"] == "C"
			and finalized["finalized_documents"][4]["document_id"] == "A"
			and finalized["finalized_documents"][4]["document_version"] == "B|C",
			"delimiter_component_composites_coexist")
		var delimiter_event_one := ""
		var delimiter_event_two := ""
		for event_value in service.debug_snapshot_for_tests()["journal"]:
			var event: Dictionary = event_value
			if event.get("kind", "") != "document_finalized": continue
			if event.get("document_id", "") == "A|B" and event.get("document_version", "") == "C":
				delimiter_event_one = event["id"]
			if event.get("document_id", "") == "A" and event.get("document_version", "") == "B|C":
				delimiter_event_two = event["id"]
		check(not delimiter_event_one.is_empty() and not delimiter_event_two.is_empty(),
			"delimiter_component_events_persisted")
		check(delimiter_event_one != delimiter_event_two, "canonical_event_identity_is_injective")
		check(delimiter_event_one == "FinalizedDocument|3:A|B|1:C"
			and delimiter_event_two == "FinalizedDocument|1:A|3:B|C",
			"canonical_event_identity_uses_length_prefixes")
		var colliding_event_id := "FinalizedDocument|7:COLLIDE|1:1"
		create_draft_from_definition(service, "EVENT-COLLISION", "VS-TASKDEF-DRAFTING-001",
			colliding_event_id)
		check(service.debug_snapshot_for_tests()["journal"].any(func(event): return event["id"] == colliding_event_id),
			"preexisting_persistent_journal_identity_confirmed")
		var before_event_collision := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.finalize_document("COLLIDE", "1",
			"DRAFT-WP-EVENT-COLLISION", ACTOR, TEAM), "duplicate_identity",
			"finalized_event_identity_collision", before_event_collision)
		var document: Dictionary = finalized["finalized_documents"][0]
		check(document["argument_id"] == "B-ARG" and document["argument_selection_event_id"] == "B-ARG-SEL", "finalized_document_preserves_argument_selection")
		check(document["issue_analysis_id"] == "B-IA" and document["case_theory_version_id"] == "B-THEORY-V1", "finalized_document_preserves_analysis_theory")
		check(document["factual_basis_refs"].size() == 1 and document["rule_statement_ids"] == ["B-RULE"], "finalized_document_preserves_typed_provenance")
		var before_version := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("BAD-VERSION-ATTEMPT", "FINAL-DOC-A", "3",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM),
			"document_version_mismatch", "absent_same_lineage_v3", before_version)
		var before_unknown_document := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("UNKNOWN-DOCUMENT-ATTEMPT", "UNKNOWN-DOC", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM),
			"finalized_document_required", "unknown_document_lineage", before_unknown_document)
		create_draft_from_definition(service, "SCOPE-MISMATCH", "VS-TASKDEF-DRAFTING-MISMATCH-001")
		var before_scope_mismatch := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.finalize_document("FINAL-DOC-A", "3", "DRAFT-WP-SCOPE-MISMATCH", ACTOR, TEAM),
			"finalized_document_lineage_scope_mismatch", "same_lineage_revision_scope_mismatch", before_scope_mismatch)
		var before_duplicate_version := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.finalize_document("FINAL-DOC-A", "2", "DRAFT-WP-A2", ACTOR, TEAM),
			"duplicate_finalized_document_version", "duplicate_composite_version", before_duplicate_version)
		var before_target := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("BAD-TARGET-ATTEMPT", "FINAL-DOC-A", "1",
			"VS-SUBMISSION-RULE-001", "WRONG-TARGET", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM),
			"unauthorized_submission_target", "wrong_target", before_target)
		var before_route := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("BAD-ROUTE-ATTEMPT", "FINAL-DOC-A", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "WRONG-ROUTE",
			[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM),
			"unauthorized_submission_route", "wrong_route", before_route)
		var before_package := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("BAD-PACKAGE-ATTEMPT", "FINAL-DOC-A", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			["UNKNOWN-MEMBER"], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM),
			"unknown_package_member", "unknown_package_member", before_package)
		var before_foreign := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("FOREIGN-PACKAGE-ATTEMPT", "FINAL-DOC-A", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, FOREIGN_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM),
			"foreign_matter_package_member", "known_foreign_matter_package_member", before_foreign)
		var before_duplicate_package := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("DUPLICATE-PACKAGE-ATTEMPT", "FINAL-DOC-A", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, DOC_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM),
			"invalid_submission_package", "duplicate_package_members", before_duplicate_package)
		var before_team := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("WRONG-TEAM-ATTEMPT", "FINAL-DOC-A", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, "VS-TEAM-OPPONENT-001"),
			"viewer_not_authorized", "wrong_team", before_team)
	var attempt := service.create_submission_attempt("ATTEMPT-A", "FINAL-DOC-A", "1",
		"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
		[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM)
	check(attempt.get("ok", false), "historical_v1_remains_submission_eligible_after_v2")
	if detailed:
		check(attempt["submission_attempt"]["document_version"] == "1" and attempt["submission_attempt"]["package_member_ids"] == [DOC_MEMBER, EXHIBIT_MEMBER], "attempt_freezes_document_and_package")
		check(attempt["submission_attempt"]["deadline_context_id"] == "VS-DEADLINE-CONTEXT-001", "attempt_preserves_deadline_context_without_evaluation")
		check(service.submission_projection(ACTOR, TEAM)["projection"]["procedural_results"].is_empty(), "attempt_does_not_auto_create_result")
		var before_duplicate_attempt := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("ATTEMPT-A", "FINAL-DOC-A", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM),
			"duplicate_identity", "duplicate_attempt_identity", before_duplicate_attempt)
		var before_actor := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_submission_attempt("ATTEMPT-WRONG-ACTOR", "FINAL-DOC-A", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", "VS-OPPONENT-LAWYER-001", TEAM),
			"viewer_not_authorized", "unauthorized_submitter", before_actor)
	var result := service.materialize_procedural_result("RESULT-A", "ATTEMPT-A", ACTOR, TEAM)
	check(result.get("ok", false), "accepted_result_materialized")
	check(result["procedural_result"]["kind"] == "accepted_for_record", "complete_package_maps_to_exact_accepted_kind")
	check(service.create_submission_attempt("ATTEMPT-A2", "FINAL-DOC-A", "2",
		"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
		[DOC_MEMBER, EXHIBIT_MEMBER], "VS-DEADLINE-CONTEXT-001", ACTOR, TEAM).get("ok", false),
		"same_lineage_v2_submission_attempt")
	check(service.materialize_procedural_result("RESULT-A2", "ATTEMPT-A2", ACTOR, TEAM).get("ok", false),
		"same_lineage_v2_result")
	if detailed:
		check(service.submission_projection(ACTOR, TEAM)["projection"]["court_record_entries"].is_empty(), "accepted_result_does_not_auto_enter_record")
		var before_second_result := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_procedural_result("RESULT-A-SECOND", "ATTEMPT-A", ACTOR, TEAM),
			"attempt_already_resolved", "one_result_per_attempt", before_second_result)
		var before_bad_rule := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-BAD-RULE", "ENTRY-BAD-RULE",
			"FINAL-DOC-A", "1", "ATTEMPT-A", "RESULT-A", "MISSING-RULE", ACTOR, TEAM),
			"record_inclusion_rule_not_found", "explicit_inclusion_rule_required", before_bad_rule)
		var before_mismatch_rule := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-MISMATCH", "ENTRY-MISMATCH",
			"FINAL-DOC-A", "1", "ATTEMPT-A", "RESULT-A", "VS-RECORD-RULE-MISMATCH-001", ACTOR, TEAM),
			"record_inclusion_rule_mismatch", "inclusion_rule_route_mismatch", before_mismatch_rule)
		var before_document_rule := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-DOC-RULE", "ENTRY-DOC-RULE",
			"FINAL-DOC-A", "1", "ATTEMPT-A", "RESULT-A", "VS-RECORD-RULE-DOCUMENT-MISMATCH-001", ACTOR, TEAM),
			"record_inclusion_rule_mismatch", "inclusion_rule_document_type_mismatch", before_document_rule)
		var before_target_rule := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-TARGET-RULE", "ENTRY-TARGET-RULE",
			"FINAL-DOC-A", "1", "ATTEMPT-A", "RESULT-A", "VS-RECORD-RULE-TARGET-MISMATCH-001", ACTOR, TEAM),
			"record_inclusion_rule_mismatch", "inclusion_rule_target_mismatch", before_target_rule)
		var before_document_attempt_mismatch := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-DOC-ATTEMPT-MISMATCH",
			"ENTRY-DOC-ATTEMPT-MISMATCH", "FINAL-DOC-A", "1", "ATTEMPT-A2", "RESULT-A2",
			"VS-RECORD-RULE-001", ACTOR, TEAM), "materialization_provenance_mismatch",
			"document_attempt_result_version_mismatch", before_document_attempt_mismatch)
		var before_attempt_result_mismatch := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-ATTEMPT-RESULT-MISMATCH",
			"ENTRY-ATTEMPT-RESULT-MISMATCH", "FINAL-DOC-A", "1", "ATTEMPT-A", "RESULT-A2",
			"VS-RECORD-RULE-001", ACTOR, TEAM), "materialization_provenance_mismatch",
			"attempt_result_combination_mismatch", before_attempt_result_mismatch)
		var before_bare_attempt := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-BARE", "ENTRY-BARE",
			"FINAL-DOC-A", "1", "ATTEMPT-A", "MISSING-RESULT", "VS-RECORD-RULE-001", ACTOR, TEAM),
			"procedural_result_not_found", "bare_attempt_cannot_enter_record", before_bare_attempt)
	var source_state_before: Dictionary = service.debug_snapshot_for_tests()
	var materialized := service.materialize_court_record("MAT-A", "ENTRY-A", "FINAL-DOC-A", "1",
		"ATTEMPT-A", "RESULT-A", "VS-RECORD-RULE-001", ACTOR, TEAM)
	check(materialized.get("ok", false), "matching_rule_materializes_court_record")
	if detailed:
		var event: Dictionary = materialized["record_materialization_event"]
		var entry: Dictionary = materialized["court_record_entry"]
		check(event["court_record_entry_id"] == "ENTRY-A" and entry["record_materialization_event_id"] == "MAT-A", "event_and_entry_cross_reference")
		check(entry["document_id"] == "FINAL-DOC-A" and entry["document_version"] == "1" and entry["submission_attempt_id"] == "ATTEMPT-A" and entry["procedural_result_id"] == "RESULT-A", "entry_preserves_exact_source_chain")
		check(entry["argument_id"] == "B-ARG" and entry["issue_analysis_id"] == "B-IA", "entry_preserves_argument_analysis_provenance")
		check(entry["assertion_payload"]["record_character"] == "party_assertion_not_fact_finding", "entry_payload_is_assertion_not_finding")
		var source_state_after: Dictionary = service.debug_snapshot_for_tests()
		check(source_state_after["assertions"] == source_state_before["assertions"], "materialization_does_not_mutate_source_assertions")
		check(source_state_after["case_theories"] == source_state_before["case_theories"], "materialization_does_not_mutate_case_theory")
		check(source_state_after["issue_analyses"] == source_state_before["issue_analyses"], "materialization_does_not_mutate_issue_analysis")
		check(source_state_after["arguments"] == source_state_before["arguments"], "materialization_does_not_mutate_argument")
		var before_duplicate := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-A-SECOND", "ENTRY-A-SECOND",
			"FINAL-DOC-A", "1", "ATTEMPT-A", "RESULT-A", "VS-RECORD-RULE-001", ACTOR, TEAM),
			"result_rule_already_materialized", "one_materialization_per_result_rule", before_duplicate)
		var before_reused_event := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-A", "ENTRY-A2-FRESH",
			"FINAL-DOC-A", "2", "ATTEMPT-A2", "RESULT-A2", "VS-RECORD-RULE-001", ACTOR, TEAM),
			"duplicate_identity", "reused_materialization_event_id_independent", before_reused_event)
		var before_reused_entry := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.materialize_court_record("MAT-A2-FRESH", "ENTRY-A",
			"FINAL-DOC-A", "2", "ATTEMPT-A2", "RESULT-A2", "VS-RECORD-RULE-001", ACTOR, TEAM),
			"duplicate_identity", "reused_court_record_entry_id_independent", before_reused_entry)
		var projection: Dictionary = service.submission_projection(ACTOR, TEAM)["projection"]
		var original_entry: Dictionary = projection["court_record_entries"][0].duplicate(true)
		projection["court_record_entries"][0]["assertion_payload"]["summary"] = "MUTATED"
		projection["submission_attempts"][0]["package_member_ids"].clear()
		var reread: Dictionary = service.submission_projection(ACTOR, TEAM)["projection"]
		check(reread["court_record_entries"][0] == original_entry, "court_record_projection_is_nested_deep_copy")
		check(reread["submission_attempts"][0]["package_member_ids"] == [DOC_MEMBER, EXHIBIT_MEMBER], "attempt_projection_is_nested_deep_copy")
		var before_reads := service.debug_snapshot_for_tests()
		service.submission_projection(ACTOR, TEAM); service.submission_projection(ACTOR, TEAM)
		check(service.debug_snapshot_for_tests() == before_reads, "reads_and_redraws_create_no_events")
		var snapshot := service.debug_snapshot_for_tests()
		for forbidden in ["contributions", "criteria", "jii", "choice_points", "court_fact_findings", "adjudications", "judgments", "appeals"]:
			check(not snapshot.has(forbidden), "no_vs006_or_judgment_state_" + forbidden)
	return service


func defective_flow(authored: Dictionary) -> void:
	var service = new_service(authored)
	bootstrap_selected_argument(service)
	create_finalized(service, "D")
	check(service.create_submission_attempt("ATTEMPT-D", "FINAL-DOC-D", "1", "VS-SUBMISSION-RULE-001",
		"VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001", [DOC_MEMBER],
		"VS-DEADLINE-CONTEXT-001", ACTOR, TEAM).get("ok", false), "defective_attempt_is_valid_and_preserved")
	var result := service.materialize_procedural_result("RESULT-D", "ATTEMPT-D", ACTOR, TEAM)
	check(result.get("ok", false), "defective_result_materialized_separately")
	check(result["procedural_result"]["kind"] == "rejected_defective", "missing_member_maps_to_exact_rejected_kind")
	check(result["procedural_result"]["reason"] == "missing_required_package_member", "defect_reason_is_exact")
	check(result["procedural_result"]["missing_package_member_ids"] == [EXHIBIT_MEMBER], "missing_member_ids_are_exact")
	var before_record := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.materialize_court_record("MAT-D", "ENTRY-D", "FINAL-DOC-D", "1",
		"ATTEMPT-D", "RESULT-D", "VS-RECORD-RULE-001", ACTOR, TEAM),
		"procedural_result_ineligible", "defective_result_cannot_enter_record", before_record)
	var projection: Dictionary = service.submission_projection(ACTOR, TEAM)["projection"]
	check(projection["submission_attempts"].size() == 1 and projection["procedural_results"].size() == 1,
		"defective_attempt_and_result_remain_in_history")
	check(projection["court_record_entries"].is_empty(), "defective_artifact_absent_from_record")
	var locale := ContentLoader.new().load_json_file("res://vertical_slice/content/locale_ko.json")
	var presenter = SlicePresenter.new(); presenter.bind_localization(locale["content"]["strings"])
	var defective_status: String = presenter.submission_status_text(projection)
	check(defective_status.contains("rejected_defective")
		and defective_status.contains("missing_required_package_member")
		and defective_status.contains(EXHIBIT_MEMBER), "defective_result_and_missing_member_are_player_inspectable")
	create_finalized(service, "D2")
	check(service.create_submission_attempt("ATTEMPT-D2", "FINAL-DOC-D2", "1", "VS-SUBMISSION-RULE-001",
		"VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001", [DOC_MEMBER, EXHIBIT_MEMBER],
		"VS-DEADLINE-CONTEXT-001", ACTOR, TEAM).get("ok", false), "later_complete_attempt_created")
	check(service.materialize_procedural_result("RESULT-D2", "ATTEMPT-D2", ACTOR, TEAM).get("ok", false), "later_accepted_result_created")
	var later: Dictionary = service.submission_projection(ACTOR, TEAM)["projection"]
	check(later["submission_attempts"][0]["package_member_ids"] == [DOC_MEMBER], "later_attempt_does_not_rewrite_prior_package")
	check(later["procedural_results"][0]["kind"] == "rejected_defective", "later_result_does_not_rewrite_prior_failure")


func authored_validation_attacks(authored: Dictionary) -> void:
	var wrong_submission_matter := authored.duplicate(true)
	wrong_submission_matter["submission_rules"][0]["matter_id"] = "WRONG-MATTER"
	reject_content_initialization(wrong_submission_matter, "invalid_submission_rule",
		"wrong_submission_matter_content")
	var wrong_submission_stage := authored.duplicate(true)
	wrong_submission_stage["submission_rules"][0]["stage_id"] = "WRONG-STAGE"
	reject_content_initialization(wrong_submission_stage, "invalid_submission_rule",
		"wrong_submission_stage_content")
	var wrong_inclusion_matter := authored.duplicate(true)
	wrong_inclusion_matter["record_inclusion_rules"][0]["matter_id"] = "WRONG-MATTER"
	reject_content_initialization(wrong_inclusion_matter, "invalid_record_inclusion_rule",
		"inclusion_rule_matter_mismatch_content")
	var wrong_inclusion_stage := authored.duplicate(true)
	wrong_inclusion_stage["record_inclusion_rules"][0]["stage_id"] = "WRONG-STAGE"
	reject_content_initialization(wrong_inclusion_stage, "invalid_record_inclusion_rule",
		"inclusion_rule_stage_mismatch_content")
	var wrong_inclusion_result := authored.duplicate(true)
	wrong_inclusion_result["record_inclusion_rules"][0]["eligible_result_kind"] = "rejected_defective"
	reject_content_initialization(wrong_inclusion_result, "invalid_record_inclusion_rule",
		"inclusion_rule_result_kind_mismatch_content")
	for illegal_kind in ["pending", "filed", "served", "admitted", "withdrawn", "superseded", "arbitrary_result"]:
		var illegal_result_content := authored.duplicate(true)
		illegal_result_content["submission_rules"][0]["supported_result_kinds"] = [illegal_kind]
		reject_content_initialization(illegal_result_content, "invalid_submission_rule",
			"illegal_result_vocabulary_" + illegal_kind)


func presenter_checks(service) -> void:
	var locale := ContentLoader.new().load_json_file("res://vertical_slice/content/locale_ko.json")
	var presenter = SlicePresenter.new(); presenter.bind_localization(locale["content"]["strings"])
	var text: String = presenter.submission_status_text(service.submission_projection(ACTOR, TEAM)["projection"])
	check(text.contains("B-ARG") and text.contains("B-ARG-SEL"), "ui_inspects_selected_argument_provenance")
	check(text.contains("VS-TARGET-TRIAL-RECORD-001") and text.contains("VS-ROUTE-ELECTRONIC-001"), "ui_inspects_target_route_context")
	check(text.contains("accepted_for_record") and text.contains("ENTRY-A"), "ui_inspects_known_result_and_record_history")
	check(text.contains("판사가 고려·신뢰·채택했거나 사실을 인정했다는 뜻이 아닙니다"), "ui_states_non_adjudicative_boundary")
	var defective_text: String = FileAccess.get_file_as_string("res://vertical_slice/ui/main.gd")
	var scene_text: String = FileAccess.get_file_as_string("res://vertical_slice/ui/main.tscn")
	check(scene_text.contains("SubmissionPackageOptions") and defective_text.contains("ui.vs005.package.omit_exhibit"),
		"ui_exposes_bounded_defective_package_choice")
	check(defective_text.contains("get_item_metadata") and defective_text.contains("create_submission_attempt"),
		"ui_passes_package_intent_to_service_without_result_logic")


func _initialize() -> void:
	var authored := load_content()
	var service = accepted_flow(authored, true)
	defective_flow(authored)
	authored_validation_attacks(authored)
	presenter_checks(service)
	var replay_a = accepted_flow(authored, false)
	var replay_b = accepted_flow(authored, false)
	check(replay_a.debug_snapshot_for_tests() == replay_b.debug_snapshot_for_tests(), "same_commands_reproduce_state_and_event_order")
	var last_order := 0
	var monotonic := true
	for event in service.debug_snapshot_for_tests()["journal"]:
		if int(event["event_order"]) <= last_order: monotonic = false
		last_order = int(event["event_order"])
	check(monotonic, "event_order_is_strictly_monotonic")
	print("SUMMARY %d checks, %d failures; VS-005 Submission to CourtRecord" % [checks, failures])
	quit(1 if failures > 0 else 0)
