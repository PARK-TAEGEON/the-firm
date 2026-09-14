extends SceneTree

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")

const CONTENT_PATH := "res://vertical_slice/content/slice_case.json"
const ACTOR := "VS-LAWYER-001"
const TEAM := "VS-TEAM-001"
const TASK := "VS-TASK-REVIEW-001"
const WORK_PRODUCT := "VS-WP-REVIEW-001"

var checks := 0
var failures := 0


func check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
	print(("PASS " if condition else "FAIL ") + label)


func reject_unchanged(service, before: Dictionary, result: Dictionary,
		expected_error: String, label: String) -> void:
	check(not result.get("ok", false), label + "_rejected")
	check(result.get("error", "") == expected_error, label + "_explicit_error")
	check(service.debug_snapshot_for_tests() == before, label + "_state_unchanged")


func load_content() -> Dictionary:
	var loaded: Dictionary = ContentLoader.new().load_json_file(CONTENT_PATH)
	check(loaded.get("ok", false), "vs002_content_loads")
	return loaded.get("content", {})


func start_service(content: Dictionary):
	var service = SliceService.new()
	var result: Dictionary = service.start_session(content.duplicate(true), ACTOR, TEAM)
	check(result.get("ok", false), "vs002_session_starts")
	return service


func run_happy_path(service) -> Dictionary:
	var initial: Dictionary = service.debug_snapshot_for_tests()
	check(initial["tasks"][TASK]["state"] == "unassigned", "task_instance_starts_unassigned")
	check(initial["assignments"].is_empty(), "no_assignment_at_session_start")
	check(initial["executions"].is_empty(), "no_execution_at_session_start")
	check(initial["completions"].is_empty(), "no_completion_at_session_start")

	var read_result: Dictionary = service.read_source(
		ACTOR, TEAM, "VS-SOURCE-CONTRACT-001", "1", ["schedule"])
	check(read_result.get("ok", false), "source_can_be_read_before_review")
	check(service.debug_snapshot_for_tests()["tasks"][TASK]["state"] == "unassigned",
		"reading_source_does_not_assign_or_complete_review")

	var before_early_issue: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_early_issue, service.select_issue(
		"VS-ISSUE-001", "VS-ISSUE-SELECT-TOO-EARLY", ACTOR, TEAM, WORK_PRODUCT),
		"review_work_product_required", "issue_dependency")

	var assigned: Dictionary = service.assign_task(
		TASK, "VS-ASSIGN-001", ACTOR, ACTOR, TEAM)
	check(assigned.get("ok", false), "review_task_assigned")
	var assigned_state: Dictionary = service.debug_snapshot_for_tests()
	check(assigned_state["tasks"][TASK]["state"] == "assigned", "assigned_state_is_explicit")
	check(assigned_state["executions"].is_empty() and assigned_state["completions"].is_empty(),
		"assignment_is_not_execution_or_completion")

	var definition: Dictionary = assigned_state["task_definitions"]["VS-TASKDEF-REVIEW-001"]
	var scopes: Array = definition["authorized_source_scopes"].duplicate(true)
	var before_bad_time: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_bad_time, service.execute_task(
		TASK, "VS-EXEC-BAD-TIME", ACTOR, TEAM, "", 0, [scopes[0]]),
		"invalid_work_time_allocation", "invalid_work_time")

	var unauthorized_scope: Array = [{
		"source_id": "VS-SOURCE-MEETING-001", "source_version": "1",
		"scope_id": "private_appendix",
	}]
	var before_bad_scope: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_bad_scope, service.execute_task(
		TASK, "VS-EXEC-BAD-SCOPE", ACTOR, TEAM, "VS-WORK-BLOCK-BAD", 1,
		unauthorized_scope), "review_scope_not_authorized", "unauthorized_review_scope")

	var execution_one: Dictionary = service.execute_task(
		TASK, "VS-EXEC-001", ACTOR, TEAM, "VS-WORK-BLOCK-001", 1,
		[scopes[0], scopes[1]])
	check(execution_one.get("ok", false), "first_review_execution_records_work")
	var in_progress: Dictionary = service.debug_snapshot_for_tests()
	check(in_progress["tasks"][TASK]["state"] == "in_progress", "execution_sets_in_progress")
	check(in_progress["completions"].is_empty(), "execution_does_not_complete_task")

	var before_early_completion: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_early_completion, service.complete_review_task(
		TASK, "VS-COMPLETE-EARLY", "VS-WP-EARLY", ACTOR, TEAM,
		"VS-ANALYSIS-OPTION-001"), "insufficient_performed_work", "early_completion")

	var before_overlap: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_overlap, service.execute_task(
		TASK, "VS-EXEC-OVERLAP", ACTOR, TEAM, "VS-WORK-BLOCK-001", 1,
		[scopes[2]]), "overlapping_work_time", "overlapping_work")

	var execution_two: Dictionary = service.execute_task(
		TASK, "VS-EXEC-002", ACTOR, TEAM, "VS-WORK-BLOCK-002", 1,
		[scopes[2], scopes[3], scopes[4]])
	check(execution_two.get("ok", false), "second_review_execution_records_remaining_scope")
	var completed: Dictionary = service.complete_review_task(
		TASK, "VS-COMPLETE-001", WORK_PRODUCT, ACTOR, TEAM,
		"VS-ANALYSIS-OPTION-001")
	check(completed.get("ok", false), "explicit_review_completion_succeeds")
	var completed_state: Dictionary = service.debug_snapshot_for_tests()
	check(completed_state["tasks"][TASK]["state"] == "completed", "completed_state_is_explicit")
	check(completed_state["executions"].size() == 2 and completed_state["completions"].size() == 1,
		"assignment_execution_completion_remain_distinct")

	var wp: Dictionary = completed["work_product"]
	check(wp["reviewed_source_scopes"].size() == 5, "work_product_has_exact_reviewed_scope")
	check(wp["performed_work_units"] == 2 and wp["work_unit_kind"] == "work_block",
		"work_product_retains_performed_work")
	check(wp["assignment_id"] == "VS-ASSIGN-001" and wp["execution_refs"].size() == 2,
		"work_product_retains_task_provenance")
	check(wp["professional_analyses"][0]["epistemic_type"] == "professional_analysis",
		"wrong_analysis_remains_professional_analysis")
	check("analysis_may_be_wrong" in wp["limitations"], "analysis_records_fallibility")

	var before_double: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_double, service.complete_review_task(
		TASK, "VS-COMPLETE-002", "VS-WP-REVIEW-002", ACTOR, TEAM,
		"VS-ANALYSIS-OPTION-002"), "task_already_completed", "double_completion")

	var returned_wp: Dictionary = service.get_review_work_product(ACTOR, TEAM, WORK_PRODUCT)["work_product"]
	returned_wp["reviewed_source_scopes"][0]["scope_id"] = "MUTATED"
	returned_wp["professional_analyses"][0]["statement"] = "MUTATED"
	var fresh_wp: Dictionary = service.get_review_work_product(ACTOR, TEAM, WORK_PRODUCT)["work_product"]
	check(fresh_wp["reviewed_source_scopes"][0]["scope_id"] != "MUTATED",
		"work_product_scope_query_is_deep_copy")
	check(fresh_wp["professional_analyses"][0]["statement"] != "MUTATED",
		"work_product_analysis_query_is_deep_copy")

	var selection: Dictionary = service.select_issue(
		"VS-ISSUE-001", "VS-ISSUE-SELECT-001", ACTOR, TEAM, WORK_PRODUCT)
	check(selection.get("ok", false), "reviewed_issue_can_be_selected")
	check(selection["selection"]["review_work_product_id"] == WORK_PRODUCT,
		"issue_selection_retains_review_dependency")

	var theory_one: Dictionary = service.create_case_theory(
		"VS-THEORY-001", "VS-THEORY-001-V1", "VS-ISSUE-001", WORK_PRODUCT,
		ACTOR, TEAM, "일정 변경 합의가 있었다는 분석을 우선 검토한다.",
		["VS-ASSERTION-002", "VS-ASSERTION-003"], ["VS-GAP-001"],
		["VS-WP-REVIEW-001-ANALYSIS-001"], ["VS-GAP-001"])
	check(theory_one.get("ok", false), "case_theory_v1_created")
	check(theory_one["case_theory"]["version_number"] == 1 and
			theory_one["case_theory"]["epistemic_type"] == "case_theory",
		"theory_v1_is_versioned_analysis")

	var theory_two: Dictionary = service.update_case_theory(
		"VS-THEORY-001", "VS-THEORY-001-V2", "VS-THEORY-001-V1", ACTOR, TEAM,
		"최종 승인 공백을 전제로 일정 변경 합의 주장을 제한적으로 검토한다.")
	check(theory_two.get("ok", false), "case_theory_v2_created")
	var theory_state: Dictionary = service.debug_snapshot_for_tests()
	check(theory_state["case_theories"]["VS-THEORY-001-V1"]["statement"] ==
			"일정 변경 합의가 있었다는 분석을 우선 검토한다.",
		"theory_v1_not_overwritten")
	check(theory_state["case_theories"]["VS-THEORY-001-V2"]["parent_version_id"] ==
			"VS-THEORY-001-V1", "theory_v2_links_parent")
	check(theory_state["theory_lineages"]["VS-THEORY-001"]["version_ids"].size() == 2,
		"theory_lineage_preserves_both_versions")

	var before_stale: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_stale, service.update_case_theory(
		"VS-THEORY-001", "VS-THEORY-001-V3", "VS-THEORY-001-V1", ACTOR, TEAM,
		"stale edit"), "stale_theory_version", "stale_theory_update")

	var projection: Dictionary = service.work_strategy_projection(ACTOR, TEAM)["projection"]
	projection["tasks"][0]["state"] = "MUTATED"
	projection["case_theories"][0]["support_refs"].clear()
	var fresh_projection: Dictionary = service.work_strategy_projection(ACTOR, TEAM)["projection"]
	check(fresh_projection["tasks"][0]["state"] == "completed",
		"work_projection_task_is_deep_copy")
	check(not fresh_projection["case_theories"][0]["support_refs"].is_empty(),
		"work_projection_theory_is_deep_copy")
	check(fresh_projection["review_analysis_options"].size() == 2,
		"authored_analysis_choices_are_projected")

	var final_state: Dictionary = service.debug_snapshot_for_tests()
	check(final_state["assertions"]["VS-ASSERTION-002"]["epistemic_type"] == "source_assertion",
		"analysis_does_not_mutate_source_assertion")
	check(not final_state.has("actual_state") and not final_state.has("truth"),
		"review_and_theory_create_no_truth_oracle")
	check(not final_state.has("court_record") and not final_state.has("court_record_entry"),
		"vs002_creates_no_court_record")
	check(not final_state.has("court_fact_finding") and not final_state.has("finding"),
		"vs002_creates_no_finding")
	check(not final_state.has("judgment"), "vs002_creates_no_judgment")
	return final_state


func run_dependency_case(content: Dictionary) -> void:
	var dependent_content: Dictionary = content.duplicate(true)
	dependent_content["task_instances"].append({
		"id": "VS-TASK-REVIEW-DEPENDENT",
		"task_definition_id": "VS-TASKDEF-REVIEW-001",
		"matter_id": "VS-CASE-001",
		"stage_id": "VS-STAGE-001",
		"team_id": TEAM,
		"dependency_task_ids": [TASK],
		"initial_state": "unassigned",
		"creation_event_id": "VS-EVENT-TASK-CREATED-DEPENDENT",
		"event_order": 8,
		"created_by_ref": "VS-CONTENT-001",
	})
	var service = start_service(dependent_content)
	check(service.assign_task("VS-TASK-REVIEW-DEPENDENT", "VS-ASSIGN-DEPENDENT",
		ACTOR, ACTOR, TEAM).get("ok", false), "dependent_task_can_be_assigned")
	var before: Dictionary = service.debug_snapshot_for_tests()
	var scopes: Array = before["task_definitions"]["VS-TASKDEF-REVIEW-001"]["authorized_source_scopes"]
	reject_unchanged(service, before, service.execute_task(
		"VS-TASK-REVIEW-DEPENDENT", "VS-EXEC-DEPENDENT", ACTOR, TEAM,
		"VS-WORK-BLOCK-DEPENDENT", 2, scopes), "incomplete_dependency",
		"incomplete_task_dependency")


func replay_happy_path(content: Dictionary, expected: Dictionary) -> void:
	var service = SliceService.new()
	service.start_session(content.duplicate(true), ACTOR, TEAM)
	var scopes: Array = service.debug_snapshot_for_tests()["task_definitions"]["VS-TASKDEF-REVIEW-001"]["authorized_source_scopes"]
	service.assign_task(TASK, "VS-ASSIGN-001", ACTOR, ACTOR, TEAM)
	service.execute_task(TASK, "VS-EXEC-001", ACTOR, TEAM, "VS-WORK-BLOCK-001", 1,
		[scopes[0], scopes[1]])
	service.execute_task(TASK, "VS-EXEC-002", ACTOR, TEAM, "VS-WORK-BLOCK-002", 1,
		[scopes[2], scopes[3], scopes[4]])
	service.complete_review_task(TASK, "VS-COMPLETE-001", WORK_PRODUCT, ACTOR, TEAM,
		"VS-ANALYSIS-OPTION-001")
	service.select_issue("VS-ISSUE-001", "VS-ISSUE-SELECT-001", ACTOR, TEAM, WORK_PRODUCT)
	service.create_case_theory("VS-THEORY-001", "VS-THEORY-001-V1", "VS-ISSUE-001",
		WORK_PRODUCT, ACTOR, TEAM, "일정 변경 합의가 있었다는 분석을 우선 검토한다.",
		["VS-ASSERTION-002", "VS-ASSERTION-003"], ["VS-GAP-001"],
		["VS-WP-REVIEW-001-ANALYSIS-001"], ["VS-GAP-001"])
	service.update_case_theory("VS-THEORY-001", "VS-THEORY-001-V2",
		"VS-THEORY-001-V1", ACTOR, TEAM,
		"최종 승인 공백을 전제로 일정 변경 합의 주장을 제한적으로 검토한다.")
	check(service.debug_snapshot_for_tests() == expected,
		"same_actions_reproduce_semantic_state_and_event_order")


func run_content_validation(content: Dictionary) -> void:
	var duplicate_task: Dictionary = content.duplicate(true)
	duplicate_task["task_instances"][0]["id"] = duplicate_task["task_definitions"][0]["id"]
	var service = SliceService.new()
	var result: Dictionary = service.start_session(duplicate_task, ACTOR, TEAM)
	check(not result.get("ok", false) and result.get("error", "") == "duplicate_task_id",
		"duplicate_task_identity_rejected")
	check(not service.debug_snapshot_for_tests()["initialized"],
		"invalid_vs002_content_does_not_partially_initialize")
	var outside_scope: Dictionary = content.duplicate(true)
	outside_scope["task_definitions"][0]["authorized_source_scopes"].remove_at(3)
	var outside_service = SliceService.new()
	var outside_result: Dictionary = outside_service.start_session(outside_scope, ACTOR, TEAM)
	check(not outside_result.get("ok", false) and outside_result.get("error", "") ==
			"task_definition_assertion_outside_scope",
		"review_assertion_must_be_inside_declared_task_scope")
	check(not outside_service.debug_snapshot_for_tests()["initialized"],
		"out_of_scope_assertion_content_is_atomic")


func _initialize() -> void:
	var content: Dictionary = load_content()
	if content.is_empty():
		quit(1)
		return
	var service = start_service(content)
	var final_state: Dictionary = run_happy_path(service)
	run_dependency_case(content)
	run_content_validation(content)
	replay_happy_path(content, final_state)
	print("SUMMARY %d checks, %d failures; VS-002 task execution and issue/theory selection" % [checks, failures])
	quit(0 if failures == 0 else 1)
