extends SceneTree

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")
const SlicePresenter = preload("res://vertical_slice/presentation/slice_presenter.gd")
const CONTENT_PATH := "res://vertical_slice/content/slice_case.json"
const ACTOR := "VS-LAWYER-001"
const TEAM := "VS-TEAM-001"
const LEGAL_TASK := "VS-TASK-LEGAL-001"
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


func content() -> Dictionary:
	var loaded: Dictionary = ContentLoader.new().load_json_file(CONTENT_PATH)
	check(loaded.get("ok", false), "content_loads")
	return loaded.get("content", {})


func service_for(authored: Dictionary):
	var service = SliceService.new()
	check(service.start_session(authored.duplicate(true), ACTOR, TEAM).get("ok", false), "session_starts")
	return service


func bootstrap_review_theory(service) -> void:
	var scopes: Array = service.debug_snapshot_for_tests()["task_definitions"]["VS-TASKDEF-REVIEW-001"]["authorized_source_scopes"]
	check(service.assign_task("VS-TASK-REVIEW-001", "VS-ASSIGN-001", ACTOR, ACTOR, TEAM).get("ok", false), "review_assigned")
	check(service.execute_task("VS-TASK-REVIEW-001", "VS-EXEC-001", ACTOR, TEAM,
		"VS-WORK-001", 2, scopes).get("ok", false), "review_executed")
	check(service.complete_review_task("VS-TASK-REVIEW-001", "VS-COMP-001", "VS-WP-REVIEW-001",
		ACTOR, TEAM, "VS-ANALYSIS-OPTION-002").get("ok", false), "review_completed")
	check(service.select_issue("VS-ISSUE-001", "VS-ISSUE-SEL-001", ACTOR, TEAM,
		"VS-WP-REVIEW-001").get("ok", false), "issue_selected")
	check(service.create_case_theory("VS-THEORY-001", "VS-THEORY-001-V1", "VS-ISSUE-001",
		"VS-WP-REVIEW-001", ACTOR, TEAM, "승인 공백을 조건으로 두 경로를 검토한다.",
		["VS-ASSERTION-002"], ["VS-GAP-001"], ["VS-WP-REVIEW-001-ANALYSIS-001"],
		["VS-GAP-001"]).get("ok", false), "theory_created")


func add_investigation(service) -> void:
	check(service.create_investigation_task("VS-INV-ACTION-001", "VS-TASK-INV-004",
		"VS-EVENT-INV-004", ACTOR, TEAM).get("ok", false), "investigation_created")
	check(service.assign_task("VS-TASK-INV-004", "VS-ASSIGN-INV-004", ACTOR, ACTOR, TEAM).get("ok", false), "investigation_assigned")
	check(service.execute_investigation_task("VS-TASK-INV-004", "VS-EXEC-INV-004", ACTOR,
		TEAM, "VS-WORK-INV-004", 1).get("ok", false), "investigation_executed")
	check(service.complete_investigation_task("VS-TASK-INV-004", "VS-COMP-INV-004",
		"VS-RESULT-INV-004", "VS-ACQ-INV-004", ACTOR, TEAM).get("ok", false), "investigation_completed")


func review_source_with_work(service, suffix: String, source_id: String, scope_id: String) -> void:
	var task_id := "VS-TASK-LEGAL-REVIEW-" + suffix
	check(service.create_legal_source_review_task(source_id, "1", scope_id, task_id,
		"VS-EVENT-LEGAL-REVIEW-" + suffix, ACTOR, TEAM).get("ok", false),
		"post_discovery_review_task_created_" + suffix)
	var before_unexecuted: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, service.review_legal_source("VS-REVIEW-EARLY-" + suffix,
		"VS-COMP-REVIEW-EARLY-" + suffix, task_id, source_id, "1", scope_id, ACTOR, TEAM),
		"task_not_executed", "review_requires_executed_work_" + suffix, before_unexecuted)
	check(service.assign_task(task_id, "VS-ASSIGN-LEGAL-REVIEW-" + suffix, ACTOR, ACTOR,
		TEAM).get("ok", false), "review_task_assigned_" + suffix)
	check(service.execute_legal_research_task(task_id, "VS-EXEC-LEGAL-REVIEW-" + suffix,
		ACTOR, TEAM, "VS-WORK-LEGAL-REVIEW-" + suffix, 2).get("ok", false),
		"post_discovery_review_work_executed_" + suffix)
	var wrong_scope := "limits" if source_id.ends_with("001") else "reservation"
	var before_wrong_scope: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, service.review_legal_source("VS-REVIEW-WRONG-SCOPE-" + suffix,
		"VS-COMP-WRONG-SCOPE-" + suffix, task_id, source_id, "1", wrong_scope, ACTOR, TEAM),
		"source_review_task_scope_mismatch", "wrong_review_scope_provenance_" + suffix,
		before_wrong_scope)
	check(service.review_legal_source("VS-REVIEW-LEGAL-" + suffix,
		"VS-COMP-LEGAL-REVIEW-" + suffix, task_id, source_id, "1", scope_id,
		ACTOR, TEAM).get("ok", false), "source_review_completed_" + suffix)


func factual_basis_one() -> Array:
	return [{"basis_type": "ReviewWorkProduct", "id": "VS-WP-REVIEW-001"},
		{"basis_type": "InvestigationResult", "id": "VS-RESULT-INV-004"},
		{"basis_type": "SourceMaterial", "id": "VS-ACQ-INV-004"}]


func factual_basis_two() -> Array:
	return [{"basis_type": "ReviewWorkProduct", "id": "VS-WP-REVIEW-001"}]


func run_flow(authored: Dictionary, assert_details: bool = true):
	var service = service_for(authored)
	var initial: Dictionary = service.debug_snapshot_for_tests()
	if assert_details:
		check(initial["journal"].size() == 7, "vs001_initial_event_baseline_preserved")
		check(initial["legal_source_discoveries"].is_empty(), "source_existence_not_discovery")
		var initial_projection: Dictionary = service.legal_research_projection(ACTOR, TEAM)["projection"]
		check(initial_projection["questions"].size() == 1, "research_question_visible")
		check(initial_projection["legal_sources"].is_empty(), "undiscovered_sources_hidden")
		check(not JSON.stringify(initial_projection).contains("VS-LEGAL-SOURCE"), "question_does_not_leak_source_identity")
		var hidden_read: Dictionary = service.read_legal_source(ACTOR, TEAM, "VS-LEGAL-SOURCE-001", "1", ["formation"])
		check(not hidden_read.get("ok", false) and hidden_read.get("error", "") == "legal_source_not_discovered", "undiscovered_source_read_blocked")

	check(service.create_legal_research_task("VS-LRQ-001", LEGAL_TASK, "VS-EVENT-LEGAL-CREATE-001",
		ACTOR, TEAM).get("ok", false), "legal_task_created")
	if assert_details:
		var before_duplicate_task := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_legal_research_task("VS-LRQ-001", LEGAL_TASK,
			"VS-EVENT-LEGAL-DUP", ACTOR, TEAM), "duplicate_identity", "duplicate_task_identity",
			before_duplicate_task)
	check(service.assign_task(LEGAL_TASK, "VS-ASSIGN-LEGAL-001", ACTOR, ACTOR, TEAM).get("ok", false), "legal_task_assigned")
	if assert_details:
		var assigned: Dictionary = service.debug_snapshot_for_tests()
		check(assigned["tasks"][LEGAL_TASK]["state"] == "assigned", "assigned_state_explicit")
		check(assigned["tasks"][LEGAL_TASK]["execution_ids"].is_empty() and assigned["tasks"][LEGAL_TASK]["completion_id"].is_empty(), "assignment_not_execution_or_completion")
		var before_dependency := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.execute_legal_research_task(LEGAL_TASK, "VS-EXEC-EARLY", ACTOR,
			TEAM, "VS-WORK-EARLY", 1), "incomplete_dependency", "incomplete_dependency", before_dependency)
	bootstrap_review_theory(service)
	if assert_details:
		var before_pre_discovery_review := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_legal_source_review_task("VS-LEGAL-SOURCE-001", "1",
			"formation", "VS-TASK-REVIEW-PRE-DISC", "VS-EVENT-REVIEW-PRE-DISC", ACTOR, TEAM),
			"legal_source_not_discovered", "pre_discovery_work_cannot_satisfy_review",
			before_pre_discovery_review)
	check(service.execute_legal_research_task(LEGAL_TASK, "VS-EXEC-LEGAL-001", ACTOR, TEAM,
		"VS-WORK-LEGAL-001", 1).get("ok", false), "research_execution_one")
	if assert_details:
		check(service.legal_research_projection(ACTOR, TEAM)["projection"]["legal_sources"].is_empty(), "execution_requires_explicit_completion_for_discovery")
		var before_duplicate_execution := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.execute_legal_research_task(LEGAL_TASK, "VS-EXEC-LEGAL-001",
			ACTOR, TEAM, "VS-WORK-LEGAL-DUP", 1), "duplicate_identity", "duplicate_execution_identity",
			before_duplicate_execution)
		var before_early := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.complete_legal_research_task(LEGAL_TASK, "VS-COMP-LEGAL-EARLY",
			["VS-DISC-EARLY-1", "VS-DISC-EARLY-2"], ACTOR, TEAM), "insufficient_performed_work",
			"insufficient_work", before_early)
	check(service.execute_legal_research_task(LEGAL_TASK, "VS-EXEC-LEGAL-002", ACTOR, TEAM,
		"VS-WORK-LEGAL-002", 1).get("ok", false), "research_execution_two")
	var completed: Dictionary = service.complete_legal_research_task(LEGAL_TASK, "VS-COMP-LEGAL-001",
		["VS-DISC-LEGAL-001", "VS-DISC-LEGAL-002"], ACTOR, TEAM)
	check(completed.get("ok", false), "explicit_research_completion")
	if assert_details:
		check(completed["discoveries"].size() == 2, "completion_materializes_authored_discovery_only")
		var after_discovery: Dictionary = service.legal_research_projection(ACTOR, TEAM)["projection"]
		check(after_discovery["legal_sources"].size() == 2, "discovered_sources_visible")
		check(after_discovery["review_events"].is_empty() and after_discovery["recorded_legal_extractions"].is_empty()
			and after_discovery["rule_statements"].is_empty(), "discovery_not_review_extraction_or_rule")
		check(not JSON.stringify(after_discovery).to_lower().contains("correct_law"), "no_hidden_correct_law_query")
		check(not JSON.stringify(after_discovery).to_lower().contains("correct_argument"),
			"no_hidden_correct_argument_query")
		var query_before := service.debug_snapshot_for_tests()
		check(service.read_legal_source(ACTOR, TEAM, "VS-LEGAL-SOURCE-001", "1", ["formation"]).get("ok", false), "discovered_source_can_be_opened")
		service.legal_research_projection(ACTOR, TEAM)
		check(service.debug_snapshot_for_tests() == query_before, "reads_and_queries_are_pure")
		var before_scope := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.review_legal_source("VS-REVIEW-BAD", "VS-COMP-BAD",
			LEGAL_TASK, "VS-LEGAL-SOURCE-001", "1", "formation", ACTOR, TEAM),
			"source_review_task_required", "discovery_work_cannot_satisfy_review", before_scope)
	review_source_with_work(service, "001", "VS-LEGAL-SOURCE-001", "formation")
	review_source_with_work(service, "002", "VS-LEGAL-SOURCE-002", "conduct")
	if assert_details:
		var reviewed_projection: Dictionary = service.legal_research_projection(ACTOR, TEAM)["projection"]
		check(reviewed_projection["recorded_legal_extractions"].is_empty() and reviewed_projection["issue_analyses"].is_empty(), "review_not_extraction_or_application")
		check(reviewed_projection["review_events"][0]["discovery_event_id"] == "VS-DISC-LEGAL-001", "review_preserves_discovery_provenance")
		check(reviewed_projection["review_events"][0]["task_id"] == "VS-TASK-LEGAL-REVIEW-001"
			and reviewed_projection["review_events"][0]["execution_ids"] == ["VS-EXEC-LEGAL-REVIEW-001"],
			"review_uses_exact_post_discovery_task_execution")
	check(service.record_legal_extraction("VS-EXT-001", "VS-RECIPE-EXT-001", "VS-REVIEW-LEGAL-001",
		ACTOR, TEAM).get("ok", false), "extraction_one_recorded")
	check(service.record_legal_extraction("VS-EXT-002", "VS-RECIPE-EXT-002", "VS-REVIEW-LEGAL-002",
		ACTOR, TEAM).get("ok", false), "extraction_two_recorded")
	check(service.create_rule_statement("VS-RULE-001", "VS-RECIPE-RULE-001", ["VS-EXT-001"],
		ACTOR, TEAM).get("ok", false), "rule_one_synthesized")
	check(service.create_rule_statement("VS-RULE-002", "VS-RECIPE-RULE-002", ["VS-EXT-002"],
		ACTOR, TEAM).get("ok", false), "rule_two_synthesized")
	check(service.consider_legal_interpretation("VS-INT-001", "VS-RECIPE-INT-001", ["VS-RULE-001"],
		ACTOR, TEAM).get("ok", false), "interpretation_one_considered")
	check(service.consider_legal_interpretation("VS-INT-002", "VS-RECIPE-INT-002", ["VS-RULE-002"],
		ACTOR, TEAM).get("ok", false), "interpretation_two_considered")
	check(service.create_rule_statement("VS-RULE-001-ALT", "VS-RECIPE-RULE-001", ["VS-EXT-001"],
		ACTOR, TEAM).get("ok", false), "alternate_rule_instance_created")
	if assert_details:
		var interpretations: Array = service.legal_research_projection(ACTOR, TEAM)["projection"]["interpretation_candidates"]
		check(not interpretations[0].has("is_correct") and not interpretations[0].has("correct_interpretation")
			and not interpretations[1].has("is_correct") and not interpretations[1].has("correct_interpretation"),
			"interpretations_remain_candidates_not_truth")
		var before_bad_analysis := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_issue_analysis("VS-IA-BAD", "VS-RECIPE-ANALYSIS-001",
			LEGAL_TASK, ["VS-RULE-002"], ["VS-INT-002"], [], ACTOR, TEAM),
			"required_provenance_mismatch", "issue_analysis_requires_valid_provenance", before_bad_analysis)
		var before_rule_mismatch := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_issue_analysis("VS-IA-RULE-MISMATCH", "VS-RECIPE-ANALYSIS-001",
			LEGAL_TASK, ["VS-RULE-001-ALT"], ["VS-INT-001"], factual_basis_one(), ACTOR, TEAM),
			"interpretation_rule_provenance_mismatch", "interpretation_must_derive_from_supplied_rule",
			before_rule_mismatch)
		var before_investigation := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_issue_analysis("VS-IA-PREMATURE-FACT", "VS-RECIPE-ANALYSIS-001",
			LEGAL_TASK, ["VS-RULE-001"], ["VS-INT-001"], factual_basis_one(), ACTOR, TEAM),
			"investigation_result_basis_required", "factual_application_requires_investigation",
			before_investigation)
	check(service.create_issue_analysis("VS-IA-002", "VS-RECIPE-ANALYSIS-002", LEGAL_TASK,
		["VS-RULE-002"], ["VS-INT-002"], factual_basis_two(), ACTOR, TEAM).get("ok", false), "analysis_two_created")
	add_investigation(service)
	if assert_details:
		var stale_factual := factual_basis_one(); stale_factual[2] = {"basis_type": "SourceMaterial", "id": "VS-ACQ-MISSING"}
		var before_stale_factual := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_issue_analysis("VS-IA-STALE-FACT", "VS-RECIPE-ANALYSIS-001",
			LEGAL_TASK, ["VS-RULE-001"], ["VS-INT-001"], stale_factual, ACTOR, TEAM),
			"source_material_basis_required", "stale_factual_provenance_rejected",
			before_stale_factual)
	check(service.create_issue_analysis("VS-IA-001", "VS-RECIPE-ANALYSIS-001", LEGAL_TASK,
		["VS-RULE-001"], ["VS-INT-001"], factual_basis_one(), ACTOR, TEAM).get("ok", false), "analysis_one_created")
	var source_assertions_before_arguments: Dictionary = service.debug_snapshot_for_tests()["assertions"].duplicate(true)
	if assert_details:
		var before_invalid_argument := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_argument("VS-ARG-BAD-PROVENANCE",
			"VS-RECIPE-ARG-001", "VS-IA-002", ACTOR, TEAM),
			"argument_analysis_provenance_mismatch", "invalid_argument_provenance_rejected",
			before_invalid_argument)
	check(service.create_argument("VS-ARG-001", "VS-RECIPE-ARG-001", "VS-IA-001", ACTOR, TEAM).get("ok", false), "argument_one_created")
	check(service.create_argument("VS-ARG-002", "VS-RECIPE-ARG-002", "VS-IA-002", ACTOR, TEAM).get("ok", false), "argument_two_created")
	if assert_details:
		var args: Array = service.legal_research_projection(ACTOR, TEAM)["projection"]["arguments"]
		check(args.size() == 2 and args[0]["legal_source_scope_refs"] != args[1]["legal_source_scope_refs"], "argument_paths_have_distinct_provenance")
		check(not args[0]["investigation_result_ids"].is_empty() and args[1]["investigation_result_ids"].is_empty(), "argument_paths_use_different_factual_provenance")
		check(args[0]["case_theory_version_id"] == "VS-THEORY-001-V1" and args[0]["review_work_product_ids"] == ["VS-WP-REVIEW-001"], "argument_preserves_theory_and_review_provenance")
		check(args[0]["content_version"] == "1.3.0" and not args[0]["recorded_legal_extraction_ids"].is_empty(), "argument_preserves_content_and_extraction_provenance")
		check(args[0]["factual_basis_refs"].size() == 3 and args[1]["factual_basis_refs"].size() == 1,
			"arguments_preserve_complete_typed_factual_basis")
		check(service.debug_snapshot_for_tests()["assertions"] == source_assertions_before_arguments, "argument_does_not_mutate_source_assertions")
		check(service.legal_research_projection(ACTOR, TEAM)["projection"]["argument_selection_history"].is_empty(), "argument_creation_is_separate_from_selection")
	check(service.select_argument("VS-ARG-SEL-001", "VS-ARG-001", ACTOR, TEAM).get("ok", false), "argument_one_selected")
	check(service.select_argument("VS-ARG-SEL-002", "VS-ARG-002", ACTOR, TEAM).get("ok", false), "argument_two_reselected")
	if assert_details:
		var projection: Dictionary = service.legal_research_projection(ACTOR, TEAM)["projection"]
		check(projection["argument_selection_history"].size() == 2, "immutable_selection_history_appended")
		check(projection["current_argument_selections"]["VS-ISSUE-001"]["argument_id"] == "VS-ARG-002", "latest_selection_derives_current_choice")
		var locale := ContentLoader.new().load_json_file("res://vertical_slice/content/locale_ko.json")
		var presenter = SlicePresenter.new(); presenter.bind_localization(locale["content"]["strings"])
		var status_text: String = presenter.legal_research_status_text(projection)
		check(status_text.contains(presenter.localized_text("vs004.analysis.002.application")),
			"ui_inspects_current_issue_analysis_application")
		check(status_text.contains(presenter.localized_text("vs004.analysis.002.assumption"))
			and status_text.contains(presenter.localized_text("vs004.analysis.002.challenge")),
			"ui_inspects_analysis_assumptions_and_challenges")
		check(status_text.contains(presenter.localized_text("vs004.argument.002.position"))
			and status_text.contains("ReviewWorkProduct:VS-WP-REVIEW-001")
			and status_text.contains("VS-IA-002"),
			"ui_inspects_selected_argument_formulation_and_provenance")
		var first_event: Dictionary = projection["argument_selection_history"][0].duplicate(true)
		projection["argument_selection_history"][0]["argument_id"] = "MUTATED"
		check(service.legal_research_projection(ACTOR, TEAM)["projection"]["argument_selection_history"][0] == first_event, "projection_is_nested_deep_copy")
		var snapshot: Dictionary = service.debug_snapshot_for_tests()
		check(not snapshot.has("strategies") and not snapshot.has("strategy"), "no_canonical_strategy_collection")
		check(not snapshot.has("court_records") and not snapshot.has("court_fact_findings") and not snapshot.has("judgments"), "no_later_stage_state_created")
		var before_duplicate := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.select_argument("VS-ARG-SEL-002", "VS-ARG-001", ACTOR, TEAM),
			"duplicate_identity", "duplicate_selection_identity", before_duplicate)
		var before_actor := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.select_argument("VS-ARG-SEL-BAD", "VS-ARG-001",
			"VS-OPPONENT-LAWYER-001", TEAM), "viewer_not_authorized", "invalid_actor", before_actor)
		var before_team := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.select_argument("VS-ARG-SEL-BAD-TEAM", "VS-ARG-001",
			ACTOR, "VS-TEAM-OPPONENT-001"), "viewer_not_authorized", "invalid_team", before_team)
		check(service.update_case_theory("VS-THEORY-001", "VS-THEORY-001-V2", "VS-THEORY-001-V1",
			ACTOR, TEAM, "Revised theory for stale-basis attack").get("ok", false),
			"case_theory_revised_for_stale_argument_attack")
		var before_stale_argument := service.debug_snapshot_for_tests()
		reject_unchanged(service, service.create_argument("VS-ARG-STALE", "VS-RECIPE-ARG-002",
			"VS-IA-002", ACTOR, TEAM), "stale_argument_basis",
			"stale_argument_basis_rejected", before_stale_argument)
	return service


func run_identity_and_oracle_attacks(authored: Dictionary) -> void:
	var service = service_for(authored)
	bootstrap_review_theory(service)
	check(service.create_legal_research_task("VS-LRQ-001", "VS-TASK-LEGAL-A", "VS-EVENT-LEGAL-A",
		ACTOR, TEAM).get("ok", false), "identity_task_a_created")
	check(service.assign_task("VS-TASK-LEGAL-A", "VS-ASSIGN-LEGAL-A", ACTOR, ACTOR, TEAM).get("ok", false), "identity_task_a_assigned")
	check(service.execute_legal_research_task("VS-TASK-LEGAL-A", "VS-EXEC-LEGAL-A", ACTOR, TEAM,
		"VS-WORK-LEGAL-A", 2).get("ok", false), "identity_task_a_executed")
	check(service.complete_legal_research_task("VS-TASK-LEGAL-A", "VS-COMP-LEGAL-A",
		["VS-DISC-A1", "VS-DISC-A2"], ACTOR, TEAM).get("ok", false), "identity_task_a_completed")
	check(service.create_legal_research_task("VS-LRQ-001", "VS-TASK-LEGAL-B", "VS-EVENT-LEGAL-B",
		ACTOR, TEAM).get("ok", false), "identity_task_b_created")
	var before_assignment := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.assign_task("VS-TASK-LEGAL-B", "VS-ASSIGN-LEGAL-A", ACTOR,
		ACTOR, TEAM), "duplicate_identity", "duplicate_assignment_identity", before_assignment)
	check(service.assign_task("VS-TASK-LEGAL-B", "VS-ASSIGN-LEGAL-B", ACTOR, ACTOR, TEAM).get("ok", false), "identity_task_b_assigned")
	check(service.execute_legal_research_task("VS-TASK-LEGAL-B", "VS-EXEC-LEGAL-B", ACTOR, TEAM,
		"VS-WORK-LEGAL-B", 2).get("ok", false), "identity_task_b_executed")
	var before_completion := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.complete_legal_research_task("VS-TASK-LEGAL-B", "VS-COMP-LEGAL-A",
		["VS-DISC-B1", "VS-DISC-B2"], ACTOR, TEAM), "duplicate_identity",
		"duplicate_completion_identity", before_completion)
	var before_premature_analysis := service.debug_snapshot_for_tests()
	reject_unchanged(service, service.create_issue_analysis("VS-IA-PRE-COMPLETE",
		"VS-RECIPE-ANALYSIS-002", "VS-TASK-LEGAL-B", ["missing-rule"], ["missing-interpretation"],
		factual_basis_two(), ACTOR, TEAM), "completed_research_required",
		"premature_issue_analysis_before_research_completion", before_premature_analysis)
	var oracle_content := authored.duplicate(true)
	oracle_content["legal_research_recipes"][0]["correct_law"] = true
	var fresh = SliceService.new()
	var oracle_before: Dictionary = fresh.debug_snapshot_for_tests()
	reject_unchanged(fresh, fresh.start_session(oracle_content, ACTOR, TEAM), "forbidden_content_state",
		"hidden_correct_law_content", oracle_before)
	var argument_oracle_content := authored.duplicate(true)
	argument_oracle_content["legal_research_recipes"][-1]["correct_argument"] = true
	var argument_fresh = SliceService.new()
	var argument_oracle_before: Dictionary = argument_fresh.debug_snapshot_for_tests()
	reject_unchanged(argument_fresh, argument_fresh.start_session(argument_oracle_content, ACTOR, TEAM),
		"forbidden_content_state", "hidden_correct_argument_content", argument_oracle_before)


func _initialize() -> void:
	var authored := content()
	var service = run_flow(authored, true)
	run_identity_and_oracle_attacks(authored)
	var final_snapshot: Dictionary = service.debug_snapshot_for_tests()
	var replay_a = run_flow(authored, false)
	var replay_b = run_flow(authored, false)
	check(replay_a.debug_snapshot_for_tests() == replay_b.debug_snapshot_for_tests(), "deterministic_commands_reproduce_state_and_event_order")
	var last_order := 0
	var monotonic := true
	for event in final_snapshot["journal"]:
		if int(event["event_order"]) <= last_order: monotonic = false
		last_order = int(event["event_order"])
	check(monotonic, "event_order_strictly_monotonic")
	print("SUMMARY %d checks, %d failures; VS-004 legal research and Argument selection" % [checks, failures])
	quit(1 if failures > 0 else 0)
