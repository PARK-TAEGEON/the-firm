extends SceneTree

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")
const SlicePresenter = preload("res://vertical_slice/presentation/slice_presenter.gd")

const CONTENT_PATH := "res://vertical_slice/content/slice_case.json"
const LOCALE_PATH := "res://vertical_slice/content/locale_ko.json"
const ACTOR := "VS-LAWYER-001"
const TEAM := "VS-TEAM-001"
const REVIEW_TASK := "VS-TASK-REVIEW-001"
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
	check(service.debug_snapshot_for_tests() == before, label + "_state_and_journal_unchanged")


func load_content() -> Dictionary:
	var loaded: Dictionary = ContentLoader.new().load_json_file(CONTENT_PATH)
	check(loaded.get("ok", false), "vs003_content_loads")
	return loaded.get("content", {})


func start_service(content: Dictionary):
	var service = SliceService.new()
	var result: Dictionary = service.start_session(content.duplicate(true), ACTOR, TEAM)
	check(result.get("ok", false), "vs003_session_starts")
	return service


func bootstrap_vs002(service) -> void:
	var scopes: Array = service.debug_snapshot_for_tests()["task_definitions"]["VS-TASKDEF-REVIEW-001"]["authorized_source_scopes"]
	check(service.assign_task(REVIEW_TASK, "VS-ASSIGN-001", ACTOR, ACTOR, TEAM).get("ok", false),
		"bootstrap_review_assigned")
	check(service.execute_task(REVIEW_TASK, "VS-EXEC-001", ACTOR, TEAM,
		"VS-WORK-BLOCK-001", 2, scopes).get("ok", false), "bootstrap_review_executed")
	check(service.complete_review_task(REVIEW_TASK, "VS-COMPLETE-001", WORK_PRODUCT,
		ACTOR, TEAM, "VS-ANALYSIS-OPTION-002").get("ok", false), "bootstrap_review_completed")
	check(service.select_issue("VS-ISSUE-001", "VS-ISSUE-SELECT-001", ACTOR, TEAM,
		WORK_PRODUCT).get("ok", false), "bootstrap_issue_selected")
	check(service.create_case_theory(
		"VS-THEORY-001", "VS-THEORY-001-V1", "VS-ISSUE-001", WORK_PRODUCT,
		ACTOR, TEAM, "최종 승인 공백을 전제로 추가 조사가 필요하다.",
		["VS-ASSERTION-002", "VS-ASSERTION-003"], ["VS-GAP-001"],
		["VS-WP-REVIEW-001-ANALYSIS-001"], ["VS-GAP-001"]).get("ok", false),
		"bootstrap_theory_created")


func create_assign_execute(service, action_id: String, suffix: String) -> Dictionary:
	var task_id := "VS-TASK-INV-" + suffix
	check(service.create_investigation_task(action_id, task_id,
		"VS-EVENT-INV-CREATE-" + suffix, ACTOR, TEAM).get("ok", false),
		"investigation_" + suffix + "_created")
	check(service.assign_task(task_id, "VS-ASSIGN-INV-" + suffix, ACTOR, ACTOR, TEAM).get("ok", false),
		"investigation_" + suffix + "_assigned")
	var executed: Dictionary = service.execute_investigation_task(task_id,
		"VS-EXEC-INV-" + suffix, ACTOR, TEAM, "VS-WORK-INV-" + suffix, 1)
	check(executed.get("ok", false), "investigation_" + suffix + "_executed")
	return {"task_id": task_id, "execution": executed}


func run_success_and_atomicity(content: Dictionary) -> Dictionary:
	var service = start_service(content)
	var initial: Dictionary = service.debug_snapshot_for_tests()
	check(initial["journal"].size() == 7, "no_initial_investigation_task_changes_baseline")
	check(initial["investigation_results"].is_empty(), "no_initial_investigation_result")
	var public_projection: Dictionary = service.investigation_projection(ACTOR, TEAM)["projection"]
	check(public_projection["opportunities"].size() == 3, "three_public_investigation_opportunities")
	for opportunity in public_projection["opportunities"]:
		var public_id: String = opportunity["id"].to_lower()
		check(not public_id.contains("success") and not public_id.contains("partial") \
			and not public_id.contains("failure"), "public_action_id_does_not_encode_authored_outcome")
	var serialized := JSON.stringify(public_projection)
	check(not serialized.contains("authored_outcome"), "private_authored_outcome_not_projected")
	check(not serialized.contains("VS-SOURCE-APPROVAL-001"), "target_source_identity_not_projected")
	check(not serialized.contains("approval_text"), "hidden_scope_identity_not_projected")
	check(not serialized.contains("관련 회신 사본 전체가 제공"), "future_result_not_projected")
	check(not serialized.contains("vs003.result."), "future_result_localization_key_not_projected")
	var hidden_read: Dictionary = service.read_source(
		ACTOR, TEAM, "VS-SOURCE-APPROVAL-001", "1", ["header"])
	check(not hidden_read.get("ok", false) and hidden_read.get("error", "") == "source_not_acquired",
		"unauthorized_investigation_source_remains_inaccessible")
	var case_file_before := JSON.stringify(service.case_file_projection(ACTOR, TEAM)["projection"])
	check(not case_file_before.contains("상대방 내부 승인 회신") \
		and not case_file_before.contains("vs003.source.approval.title"),
		"hidden_source_title_not_in_case_file")
	var before_queries: Dictionary = service.debug_snapshot_for_tests()
	service.investigation_projection(ACTOR, TEAM)
	service.investigation_projection(ACTOR, TEAM)
	service.case_file_projection(ACTOR, TEAM)
	check(service.debug_snapshot_for_tests() == before_queries, "repeated_queries_create_no_domain_event")

	var before_invalid: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_invalid, service.create_investigation_task(
		"VS-INV-ACTION-001", "VS-TASK-BAD", "VS-EVENT-BAD",
		"VS-OPPONENT-LAWYER-001", TEAM), "viewer_not_authorized", "invalid_actor")
	reject_unchanged(service, before_invalid, service.create_investigation_task(
		"VS-INV-ACTION-001", "VS-TASK-BAD-TEAM", "VS-EVENT-BAD-TEAM",
		ACTOR, "VS-TEAM-OPPONENT-001"), "viewer_not_authorized", "invalid_team")
	var created: Dictionary = service.create_investigation_task(
		"VS-INV-ACTION-001", "VS-TASK-INV-SUCCESS", "VS-EVENT-INV-CREATE-SUCCESS",
		ACTOR, TEAM)
	check(created.get("ok", false), "success_investigation_task_created_explicitly")
	var after_create: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, after_create, service.create_investigation_task(
		"VS-INV-ACTION-001", "VS-TASK-INV-SUCCESS-2", "VS-EVENT-INV-CREATE-SUCCESS-2",
		ACTOR, TEAM), "investigation_action_already_created", "duplicate_investigation_action")
	reject_unchanged(service, after_create, service.create_investigation_task(
		"VS-INV-ACTION-002", "VS-TASK-INV-SUCCESS", "VS-EVENT-INV-CREATE-DUP",
		ACTOR, TEAM), "duplicate_identity", "duplicate_investigation_task_identity")
	reject_unchanged(service, after_create, service.create_investigation_task(
		"VS-INV-ACTION-002", "VS-TASK-INV-NEW", "VS-EVENT-INV-CREATE-SUCCESS",
		ACTOR, TEAM), "duplicate_identity", "duplicate_creation_event_identity")
	check(service.assign_task("VS-TASK-INV-SUCCESS", "VS-ASSIGN-INV-SUCCESS", ACTOR, ACTOR, TEAM).get("ok", false),
		"blocked_investigation_can_be_assigned")
	var before_wrong_family: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_wrong_family, service.execute_task(
		"VS-TASK-INV-SUCCESS", "VS-EXEC-WRONG-FAMILY", ACTOR, TEAM,
		"VS-WORK-WRONG-FAMILY", 1, []), "task_family_mismatch", "review_api_rejects_investigation_task")
	var before_dependency: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_dependency, service.execute_investigation_task(
		"VS-TASK-INV-SUCCESS", "VS-EXEC-INV-EARLY", ACTOR, TEAM,
		"VS-WORK-INV-EARLY", 1), "incomplete_dependency", "dependency_incomplete_execution")

	bootstrap_vs002(service)
	var baseline: Dictionary = service.debug_snapshot_for_tests()
	var assertions_before: Dictionary = baseline["assertions"].duplicate(true)
	var theories_before: Dictionary = baseline["case_theories"].duplicate(true)
	var work_products_before: Dictionary = baseline["review_work_products"].duplicate(true)
	check(service.execute_investigation_task("VS-TASK-INV-SUCCESS", "VS-EXEC-INV-SUCCESS",
		ACTOR, TEAM, "VS-WORK-INV-SUCCESS", 1).get("ok", false), "success_investigation_executes")
	var before_bad_completion: Dictionary = service.debug_snapshot_for_tests()
	reject_unchanged(service, before_bad_completion, service.complete_investigation_task(
		"VS-TASK-INV-SUCCESS", "VS-COMPLETE-INV-SUCCESS", "VS-RESULT-SUCCESS", "",
		ACTOR, TEAM), "acquisition_identity_required", "missing_acquisition_identity")
	reject_unchanged(service, before_bad_completion, service.complete_investigation_task(
		"VS-TASK-INV-SUCCESS", "VS-COMPLETE-INV-SUCCESS", "VS-RESULT-SUCCESS", "VS-ACQ-001",
		ACTOR, TEAM), "duplicate_identity", "duplicate_acquisition_identity")
	var completed: Dictionary = service.complete_investigation_task(
		"VS-TASK-INV-SUCCESS", "VS-COMPLETE-INV-SUCCESS", "VS-RESULT-SUCCESS",
		"VS-ACQ-INV-SUCCESS", ACTOR, TEAM)
	check(completed.get("ok", false), "valid_investigation_success")
	check(completed["investigation_result"]["outcome"] == "success", "authored_success_result")
	var acquisition: Dictionary = completed["acquisition"]
	for key in ["id", "source_id", "source_version", "scopes", "actor_id", "team_id",
		"matter_id", "stage_id", "investigation_action_id", "investigation_task_id",
		"investigation_result_id", "route", "event_order", "content_version"]:
		check(acquisition.has(key), "success_acquisition_provenance_" + key)
	check(acquisition["scopes"] == ["header", "approval_text"], "success_acquires_exact_authored_scope")
	var state: Dictionary = service.debug_snapshot_for_tests()
	check(state["tasks"]["VS-TASK-INV-SUCCESS"]["state"] == "completed", "success_task_completed")
	check(state["tasks"]["VS-TASK-INV-SUCCESS"]["output_work_product_ids"].is_empty(),
		"investigation_result_is_not_work_product")
	check(state["tasks"]["VS-TASK-INV-SUCCESS"]["output_result_ids"] == ["VS-RESULT-SUCCESS"],
		"task_references_distinct_investigation_result")
	check(state["assertions"] == assertions_before, "existing_source_assertions_unchanged")
	check(state["case_theories"] == theories_before, "existing_case_theory_unchanged")
	check(state["review_work_products"] == work_products_before, "acquisition_creates_no_review_work_product")
	check(not state.has("court_record") and not state.has("court_record_entry"), "investigation_creates_no_court_record")
	check(not state.has("court_fact_finding") and not state.has("finding"), "investigation_creates_no_court_fact_finding")
	check(not state.has("judgment"), "investigation_creates_no_judgment")
	var kinds: Array = []
	for event in state["journal"].slice(-6):
		kinds.append(event["kind"])
	check(kinds == ["issue_selected", "case_theory_created", "task_executed", "task_completed",
		"investigation_resolved", "source_acquired"], "success_command_event_order")
	# Creation and assignment occurred before bootstrap; the resolution tail must remain monotonic.
	var tail: Array = state["journal"].slice(-4)
	check(tail[0]["kind"] == "task_executed" and tail[1]["kind"] == "task_completed" \
		and tail[2]["kind"] == "investigation_resolved" and tail[3]["kind"] == "source_acquired",
		"deterministic_resolution_event_order")
	check(int(tail[0]["event_order"]) + 1 == int(tail[1]["event_order"]) \
		and int(tail[1]["event_order"]) + 1 == int(tail[2]["event_order"]) \
		and int(tail[2]["event_order"]) + 1 == int(tail[3]["event_order"]),
		"event_order_is_monotonic")
	var case_file: Dictionary = service.case_file_projection(ACTOR, TEAM)["projection"]
	var acquired_found := false
	for source in case_file["sources"]:
		if source["id"] == "VS-SOURCE-APPROVAL-001":
			acquired_found = source["acquired_scopes"].size() == 2
	check(acquired_found, "acquired_exact_scope_visible_through_case_file")
	check(service.read_source(ACTOR, TEAM, "VS-SOURCE-APPROVAL-001", "1",
		["header", "approval_text"]).get("ok", false), "acquired_source_readable_through_existing_path")

	var investigation_projection: Dictionary = service.investigation_projection(ACTOR, TEAM)["projection"]
	investigation_projection["results"][0]["limitations"].clear()
	investigation_projection["acquisitions"][0]["scopes"].clear()
	var fresh: Dictionary = service.investigation_projection(ACTOR, TEAM)["projection"]
	check(not fresh["results"][0]["limitations"].is_empty(), "investigation_result_projection_is_deep_copy")
	check(not fresh["acquisitions"][0]["scopes"].is_empty(), "acquisition_projection_is_deep_copy")
	return state


func run_outcome(content: Dictionary, action_id: String, suffix: String, acquisition_id: String):
	var service = start_service(content)
	bootstrap_vs002(service)
	var chain: Dictionary = create_assign_execute(service, action_id, suffix)
	var result: Dictionary = service.complete_investigation_task(chain["task_id"],
		"VS-COMPLETE-INV-" + suffix, "VS-RESULT-" + suffix, acquisition_id, ACTOR, TEAM)
	check(result.get("ok", false), "investigation_" + suffix + "_completed")
	return service


func run_partial_and_failure(content: Dictionary) -> void:
	var partial = run_outcome(content, "VS-INV-ACTION-002", "PARTIAL", "VS-ACQ-INV-PARTIAL")
	var partial_projection: Dictionary = partial.investigation_projection(ACTOR, TEAM)["projection"]
	check(partial_projection["results"][0]["outcome"] == "partial_success", "partial_investigation_result")
	check(partial_projection["acquisitions"][0]["scopes"] == ["change_entry"], "partial_exact_subset_acquired")
	check(partial.read_source(ACTOR, TEAM, "VS-SOURCE-LOG-001", "1", ["change_entry"]).get("ok", false),
		"partial_acquired_scope_visible")
	var hidden: Dictionary = partial.read_source(ACTOR, TEAM, "VS-SOURCE-LOG-001", "1", ["approval_audit"])
	check(not hidden.get("ok", false) and hidden.get("error", "") == "scope_not_acquired",
		"partial_unacquired_scope_remains_hidden")
	var before_duplicate_result: Dictionary = partial.debug_snapshot_for_tests()
	reject_unchanged(partial, before_duplicate_result, partial.complete_investigation_task(
		"VS-TASK-INV-PARTIAL", "VS-COMPLETE-DUP", "VS-RESULT-PARTIAL", "VS-ACQ-DUP",
		ACTOR, TEAM), "task_already_completed", "completed_task_rejects_duplicate_result_attempt")

	var failure = start_service(content)
	bootstrap_vs002(failure)
	var failure_chain: Dictionary = create_assign_execute(
		failure, "VS-INV-ACTION-003", "FAILURE")
	check(failure.complete_investigation_task(failure_chain["task_id"],
		"VS-COMPLETE-INV-FAILURE", "VS-RESULT-FAILURE", "VS-ACQ-CANDIDATE-FAILURE",
		ACTOR, TEAM).get("ok", false),
		"investigation_FAILURE_completed")
	var failure_projection: Dictionary = failure.investigation_projection(ACTOR, TEAM)["projection"]
	check(failure_projection["results"][0]["outcome"] == "failure", "authored_failure_is_valid_result")
	check(failure_projection["acquisitions"].is_empty(), "authored_failure_creates_no_acquisition")
	var failure_state: Dictionary = failure.debug_snapshot_for_tests()
	check(failure_state["tasks"]["VS-TASK-INV-FAILURE"]["state"] == "completed", "authored_failure_completes_task")
	check(failure_state["investigation_results"].has("VS-RESULT-FAILURE"), "authored_failure_history_remains")
	check(failure_state["acquisitions"].size() == content["acquisitions"].size(), "authored_failure_changes_no_authorization")
	var before_bad_failure: Dictionary = failure.debug_snapshot_for_tests()
	reject_unchanged(failure, before_bad_failure, failure.complete_investigation_task(
		"VS-TASK-INV-FAILURE", "VS-COMPLETE-FAILURE-2", "VS-RESULT-FAILURE-2", "VS-ACQ-NOT-ALLOWED",
		ACTOR, TEAM), "task_already_completed", "completed_failure_rejected_atomically")

	var duplicate_service = start_service(content)
	bootstrap_vs002(duplicate_service)
	create_assign_execute(duplicate_service, "VS-INV-ACTION-001", "DUP-A")
	check(duplicate_service.complete_investigation_task("VS-TASK-INV-DUP-A", "VS-COMPLETE-DUP-A",
		"VS-RESULT-SHARED", "VS-ACQ-DUP-A", ACTOR, TEAM).get("ok", false), "first_shared_result_identity_used")
	create_assign_execute(duplicate_service, "VS-INV-ACTION-002", "DUP-B")
	var before_shared: Dictionary = duplicate_service.debug_snapshot_for_tests()
	reject_unchanged(duplicate_service, before_shared, duplicate_service.complete_investigation_task(
		"VS-TASK-INV-DUP-B", "VS-COMPLETE-DUP-B", "VS-RESULT-SHARED", "VS-ACQ-DUP-B",
		ACTOR, TEAM), "duplicate_identity", "duplicate_investigation_result_identity")


func deterministic_sequence(content: Dictionary) -> Dictionary:
	var service = SliceService.new()
	service.start_session(content.duplicate(true), ACTOR, TEAM)
	var scopes: Array = service.debug_snapshot_for_tests()["task_definitions"]["VS-TASKDEF-REVIEW-001"]["authorized_source_scopes"]
	service.assign_task(REVIEW_TASK, "VS-ASSIGN-001", ACTOR, ACTOR, TEAM)
	service.execute_task(REVIEW_TASK, "VS-EXEC-001", ACTOR, TEAM, "VS-WORK-BLOCK-001", 2, scopes)
	service.complete_review_task(REVIEW_TASK, "VS-COMPLETE-001", WORK_PRODUCT, ACTOR, TEAM, "VS-ANALYSIS-OPTION-002")
	service.select_issue("VS-ISSUE-001", "VS-ISSUE-SELECT-001", ACTOR, TEAM, WORK_PRODUCT)
	service.create_case_theory("VS-THEORY-001", "VS-THEORY-001-V1", "VS-ISSUE-001", WORK_PRODUCT,
		ACTOR, TEAM, "최종 승인 공백을 전제로 추가 조사가 필요하다.",
		["VS-ASSERTION-002", "VS-ASSERTION-003"], ["VS-GAP-001"],
		["VS-WP-REVIEW-001-ANALYSIS-001"], ["VS-GAP-001"])
	for entry in [
		["VS-INV-ACTION-001", "SUCCESS", "VS-ACQ-INV-SUCCESS"],
		["VS-INV-ACTION-002", "PARTIAL", "VS-ACQ-INV-PARTIAL"],
		["VS-INV-ACTION-003", "FAILURE", "VS-ACQ-CANDIDATE-FAILURE"],
	]:
		var action_id: String = entry[0]
		var suffix: String = entry[1]
		var task_id := "VS-TASK-INV-" + suffix
		service.create_investigation_task(action_id, task_id, "VS-EVENT-INV-CREATE-" + suffix, ACTOR, TEAM)
		service.assign_task(task_id, "VS-ASSIGN-INV-" + suffix, ACTOR, ACTOR, TEAM)
		service.execute_investigation_task(task_id, "VS-EXEC-INV-" + suffix, ACTOR, TEAM,
			"VS-WORK-INV-" + suffix, 1)
		service.complete_investigation_task(task_id, "VS-COMPLETE-INV-" + suffix,
			"VS-RESULT-" + suffix, entry[2], ACTOR, TEAM)
	return service.debug_snapshot_for_tests()


func run_content_validation(content: Dictionary) -> void:
	var duplicate_action: Dictionary = content.duplicate(true)
	duplicate_action["investigation_actions"][1]["id"] = duplicate_action["investigation_actions"][0]["id"]
	var service = SliceService.new()
	var result: Dictionary = service.start_session(duplicate_action, ACTOR, TEAM)
	check(not result.get("ok", false) and result.get("error", "") == "duplicate_investigation_action_id",
		"duplicate_authored_investigation_identity_rejected")
	check(not service.debug_snapshot_for_tests()["initialized"], "invalid_action_content_initialization_atomic")


func run_pre_resolution_oracle_checks(content: Dictionary) -> void:
	var missing_errors: Array[String] = []
	var duplicate_errors: Array[String] = []
	var action_ids := ["VS-INV-ACTION-001", "VS-INV-ACTION-002", "VS-INV-ACTION-003"]
	for index in action_ids.size():
		var service = start_service(content)
		bootstrap_vs002(service)
		var suffix := "ORACLE-%03d" % (index + 1)
		var chain: Dictionary = create_assign_execute(service, action_ids[index], suffix)
		var before: Dictionary = service.debug_snapshot_for_tests()
		var missing: Dictionary = service.complete_investigation_task(
			chain["task_id"], "VS-COMPLETE-" + suffix, "VS-RESULT-" + suffix, "", ACTOR, TEAM)
		missing_errors.append(missing.get("error", ""))
		check(not missing.get("ok", false), "pre_resolution_missing_candidate_rejected_" + suffix)
		check(service.debug_snapshot_for_tests() == before, "pre_resolution_missing_candidate_atomic_" + suffix)
		var duplicate: Dictionary = service.complete_investigation_task(
			chain["task_id"], "VS-COMPLETE-" + suffix, "VS-RESULT-" + suffix,
			"VS-ACQ-001", ACTOR, TEAM)
		duplicate_errors.append(duplicate.get("error", ""))
		check(not duplicate.get("ok", false), "pre_resolution_duplicate_candidate_rejected_" + suffix)
		check(service.debug_snapshot_for_tests() == before, "pre_resolution_duplicate_candidate_atomic_" + suffix)
	check(missing_errors == ["acquisition_identity_required", "acquisition_identity_required",
		"acquisition_identity_required"], "pre_resolution_missing_validation_is_outcome_independent")
	check(duplicate_errors == ["duplicate_identity", "duplicate_identity", "duplicate_identity"],
		"pre_resolution_duplicate_validation_is_outcome_independent")


func run_localization_checks(content: Dictionary) -> void:
	var loaded: Dictionary = ContentLoader.new().load_json_file(LOCALE_PATH)
	check(loaded.get("ok", false), "vs003_localization_catalog_loads")
	var catalog: Dictionary = loaded.get("content", {}).get("strings", {})
	check(not catalog.is_empty(), "vs003_localization_catalog_has_strings")
	var authored_keys: Array[String] = [content["task_definitions"][1]["purpose"]]
	for source_index in [4, 5]:
		var source: Dictionary = content["sources"][source_index]
		authored_keys.append(source["title"])
		authored_keys.append(source["origin"]["description"])
		for scope in source["scopes"]:
			authored_keys.append(scope["label"])
			authored_keys.append(scope["content"])
	for action in content["investigation_actions"]:
		for field in ["label", "purpose", "bounded_domain", "action_description"]:
			authored_keys.append(action[field])
		authored_keys.append(action["authored_outcome"]["summary"])
	for key in authored_keys:
		check(key.begins_with("vs003."), "vs003_authored_player_text_uses_localization_key")
		check(catalog.has(key), "vs003_authored_localization_key_resolves")

	var scene := load("res://vertical_slice/ui/main.tscn") as PackedScene
	var root := scene.instantiate()
	var ui_key_nodes := [
		root.get_node("Margin/Root/Boundary"),
		root.get_node("Margin/Root/Tabs/Investigation/Workflow/Heading"),
		root.get_node("Margin/Root/Tabs/Investigation/Workflow/InvestigationOpportunityLabel"),
		root.get_node("Margin/Root/Tabs/Investigation/Workflow/ActionButtons/CreateInvestigationButton"),
		root.get_node("Margin/Root/Tabs/Investigation/Workflow/ActionButtons/AssignInvestigationButton"),
		root.get_node("Margin/Root/Tabs/Investigation/Workflow/ActionButtons/ExecuteInvestigationButton"),
		root.get_node("Margin/Root/Tabs/Investigation/Workflow/ActionButtons/CompleteInvestigationButton"),
		root.get_node("Margin/Root/Tabs/Investigation/Workflow/AcquisitionHelp"),
		root.get_node("Margin/Root/Tabs/Investigation/Workflow/InvestigationStatusLabel"),
	]
	for node in ui_key_nodes:
		check(node.text.begins_with("ui.vs003."), "vs003_scene_player_text_uses_localization_key")
		check(catalog.has(node.text), "vs003_scene_localization_key_resolves")
	var acquisition_input: LineEdit = root.get_node(
		"Margin/Root/Tabs/Investigation/Workflow/AcquisitionIdInput")
	check(acquisition_input.placeholder_text.begins_with("ui.vs003."),
		"vs003_placeholder_uses_localization_key")
	check(catalog.has(acquisition_input.placeholder_text), "vs003_placeholder_localization_key_resolves")
	root.free()

	var presenter = SlicePresenter.new()
	presenter.bind_localization(catalog)
	var service = start_service(content)
	var opportunity: Dictionary = service.investigation_projection(ACTOR, TEAM)["projection"]["opportunities"][0]
	var rendered: String = presenter.investigation_opportunity_text(opportunity)
	check(rendered.contains("승인 담당 부서에 회신 사본 요청"), "vs003_presenter_resolves_localized_action")
	check(not rendered.contains("vs003.action."), "vs003_presenter_does_not_show_localization_key")


func _initialize() -> void:
	var content: Dictionary = load_content()
	if content.is_empty():
		quit(1)
		return
	run_success_and_atomicity(content)
	run_partial_and_failure(content)
	run_content_validation(content)
	run_pre_resolution_oracle_checks(content)
	run_localization_checks(content)
	var replay_a := deterministic_sequence(content)
	var replay_b := deterministic_sequence(content)
	check(replay_a == replay_b, "deterministic_command_sequence_reproduces_state_and_event_order")
	print("SUMMARY %d checks, %d failures; VS-003 investigation and exact-scope acquisition" % [checks, failures])
	quit(0 if failures == 0 else 1)
