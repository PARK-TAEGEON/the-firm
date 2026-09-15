extends SceneTree

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")
const SlicePresenter = preload("res://vertical_slice/presentation/slice_presenter.gd")

const CONTENT_PATH := "res://vertical_slice/content/slice_case.json"
const PLAYER_ACTOR_ID := "VS-LAWYER-001"
const PLAYER_TEAM_ID := "VS-TEAM-001"

var checks: int = 0
var failures: int = 0


func check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
	print(("PASS " if condition else "FAIL ") + label)


func load_content() -> Dictionary:
	var result: Dictionary = ContentLoader.new().load_json_file(CONTENT_PATH)
	check(result.get("ok", false), "authored_content_parses")
	return result.get("content", {})


func start_service(content: Dictionary):
	var service = SliceService.new()
	var started: Dictionary = service.start_session(content, PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	check(started.get("ok", false), "session_starts")
	check(started.get("session_id", "") == "VS-SESSION-001", "stable_session_identity")
	return service


func reject_initialization_unchanged(service, content: Dictionary, expected_error: String, label: String) -> void:
	var before: Dictionary = service.debug_snapshot_for_tests()
	var result: Dictionary = service.start_session(content, PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	check(not result.get("ok", false), label + "_rejected")
	check(result.get("error", "") == expected_error, label + "_error_" + expected_error)
	check(service.debug_snapshot_for_tests() == before, label + "_state_unchanged")


func _initialize() -> void:
	var malformed: Dictionary = ContentLoader.new().parse_json_text("{invalid")
	check(not malformed.get("ok", false), "malformed_json_rejected")
	check(malformed.get("error", "") == "malformed_json", "malformed_json_explicit_error")
	var wrong_root: Dictionary = ContentLoader.new().parse_json_text("[]")
	check(not wrong_root.get("ok", false), "non_dictionary_json_structure_rejected")
	check(wrong_root.get("error", "") == "content_root_not_dictionary", "non_dictionary_json_explicit_error")

	var content := load_content()
	if content.is_empty():
		quit(1)
		return
	var service = start_service(content)
	var snapshot: Dictionary = service.debug_snapshot_for_tests()
	check(snapshot["matter"]["id"] == "VS-CASE-001", "single_matter_identity")
	check(snapshot["stage"]["id"] == "VS-STAGE-001" and snapshot["stage"]["level"] == "trial", "trial_stage_identity")
	check(snapshot["session"]["player_actor_id"] == PLAYER_ACTOR_ID, "player_actor_bound")
	check(snapshot["session"]["player_team_id"] == PLAYER_TEAM_ID, "player_team_bound")
	check(snapshot["content_meta"]["content_version"] == "1.3.0", "content_version_preserved")
	check(snapshot["journal"].size() == 7, "initial_history_has_expected_events")
	for index in snapshot["journal"].size():
		check(int(snapshot["journal"][index]["event_order"]) == index + 1, "stable_event_order_%d" % (index + 1))

	var projection_result: Dictionary = service.case_file_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	check(projection_result.get("ok", false), "player_case_file_projection")
	var projection: Dictionary = projection_result.get("projection", {})
	check(projection["sources"].size() == 3, "only_acquired_sources_projected")
	check(projection["source_assertions"].size() == 3, "authorized_assertions_projected")
	check(projection["known_gaps"].size() == 1, "known_gap_projected")
	check(projection["procedural_statuses"].size() == 1, "procedural_status_projected_separately")
	check(projection["acquisition_history"].size() == 3, "acquisition_provenance_projected")
	var projection_text := JSON.stringify(projection)
	check(not projection_text.contains("VS-SOURCE-UNACQUIRED-TEST"), "unacquired_source_identity_not_projected")
	check(not projection_text.contains("미획득 검증 전용 자료"), "unacquired_source_title_not_projected")
	check(not projection_text.contains("hidden_scope"), "unacquired_scope_not_projected")
	check(not projection_text.contains("private_appendix"), "unacquired_partial_scope_not_projected")
	check(not projection.has("court_record") and not projection.has("court_fact_finding") and not projection.has("judgment"), "projection_has_no_adjudicative_objects")

	var read_contract: Dictionary = service.read_source(
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-SOURCE-CONTRACT-001", "1", ["schedule"])
	check(read_contract.get("ok", false), "authorized_source_scope_read")
	var contract_source: Dictionary = read_contract.get("source", {})
	check(contract_source["id"] == "VS-SOURCE-CONTRACT-001" and contract_source["version"] == "1", "read_preserves_source_version")
	check(contract_source["scopes"].size() == 1 and contract_source["scopes"][0]["id"] == "schedule", "read_returns_exact_requested_scope")
	check(contract_source["acquisition_refs"].size() == 1 and contract_source["acquisition_refs"][0]["id"] == "VS-ACQ-001", "read_preserves_acquisition_provenance")

	var unacquired: Dictionary = service.read_source(
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-SOURCE-UNACQUIRED-TEST", "1", ["hidden_scope"])
	check(not unacquired.get("ok", false) and unacquired.get("error", "") == "source_not_acquired", "direct_unacquired_source_read_blocked")
	var other_team: Dictionary = service.read_source(
		"VS-OPPONENT-LAWYER-001", "VS-TEAM-OPPONENT-001", "VS-SOURCE-UNACQUIRED-TEST", "1", ["hidden_scope"])
	check(not other_team.get("ok", false) and other_team.get("error", "") == "viewer_not_authorized", "other_team_read_blocked")
	var other_actor: Dictionary = service.case_file_projection("VS-LAWYER-OTHER", PLAYER_TEAM_ID)
	check(not other_actor.get("ok", false) and other_actor.get("error", "") == "viewer_not_authorized", "other_actor_projection_blocked")
	var whole_meeting: Dictionary = service.read_source(
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-SOURCE-MEETING-001", "1", ["summary", "private_appendix"])
	check(not whole_meeting.get("ok", false) and whole_meeting.get("error", "") == "scope_not_acquired", "whole_source_read_blocked_after_partial_acquisition")
	var wrong_version: Dictionary = service.read_source(
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-SOURCE-CONTRACT-001", "2", ["schedule"])
	check(not wrong_version.get("ok", false) and wrong_version.get("error", "") == "source_version_mismatch", "wrong_source_version_rejected")
	var duplicate_scope: Dictionary = service.read_source(
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-SOURCE-CONTRACT-001", "1", ["schedule", "schedule"])
	check(not duplicate_scope.get("ok", false) and duplicate_scope.get("error", "") == "invalid_scope_request", "duplicate_scope_request_rejected")

	projection["sources"][0]["origin"]["description"] = "MUTATED"
	projection["sources"][0]["acquired_scopes"][0]["label"] = "MUTATED"
	projection["acquisition_history"][0]["scopes"].clear()
	var fresh_projection: Dictionary = service.case_file_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)["projection"]
	check(fresh_projection["sources"][0]["origin"]["description"] != "MUTATED", "projection_nested_origin_is_deep_copy")
	check(fresh_projection["sources"][0]["acquired_scopes"][0]["label"] != "MUTATED", "projection_nested_scope_is_deep_copy")
	check(not fresh_projection["acquisition_history"][0]["scopes"].is_empty(), "projection_acquisition_scope_is_deep_copy")
	contract_source["scopes"][0]["content"] = "MUTATED"
	var reread: Dictionary = service.read_source(
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-SOURCE-CONTRACT-001", "1", ["schedule"])
	check(reread["source"]["scopes"][0]["content"] != "MUTATED", "source_read_is_deep_copy")

	var before_reads: Dictionary = service.debug_snapshot_for_tests()
	service.case_file_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	service.case_file_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	service.read_source(PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-SOURCE-EMAIL-001", "1", ["body"])
	service.read_source(PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-SOURCE-EMAIL-001", "1", ["body"])
	check(service.debug_snapshot_for_tests() == before_reads, "queries_do_not_add_events_or_mutate_state")

	var duplicate_source: Dictionary = content.duplicate(true)
	duplicate_source["sources"][1]["id"] = duplicate_source["sources"][0]["id"]
	reject_initialization_unchanged(service, duplicate_source, "duplicate_source_id", "duplicate_source_identity")
	var duplicate_event: Dictionary = content.duplicate(true)
	duplicate_event["acquisitions"][1]["event_order"] = duplicate_event["acquisitions"][0]["event_order"]
	reject_initialization_unchanged(service, duplicate_event, "duplicate_event_order", "duplicate_event_identity")
	var duplicate_event_id: Dictionary = content.duplicate(true)
	duplicate_event_id["acquisitions"][1]["id"] = duplicate_event_id["acquisitions"][0]["id"]
	reject_initialization_unchanged(service, duplicate_event_id, "duplicate_acquisition_id", "duplicate_event_id")
	var dangling: Dictionary = content.duplicate(true)
	dangling["assertions"][0]["source_id"] = "VS-SOURCE-MISSING"
	reject_initialization_unchanged(service, dangling, "assertion_source_reference_invalid", "dangling_source_reference")
	var forbidden: Dictionary = content.duplicate(true)
	forbidden["matter"]["winner"] = PLAYER_TEAM_ID
	reject_initialization_unchanged(service, forbidden, "forbidden_content_state", "authored_winner_oracle")
	var duplicate_start_before: Dictionary = service.debug_snapshot_for_tests()
	var duplicate_start: Dictionary = service.start_session(content, PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	check(not duplicate_start.get("ok", false) and duplicate_start.get("error", "") == "session_already_started", "duplicate_session_start_rejected")
	check(service.debug_snapshot_for_tests() == duplicate_start_before, "duplicate_session_start_leaves_state_unchanged")

	var replayed = SliceService.new()
	var replay_result: Dictionary = replayed.start_session(content.duplicate(true), PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	check(replay_result.get("ok", false), "same_content_replay_starts")
	check(replayed.debug_snapshot_for_tests() == before_reads, "same_content_reproduces_semantic_state_and_order")

	var final_snapshot: Dictionary = service.debug_snapshot_for_tests()
	check(not final_snapshot.has("evidence_review_work_product"), "reading_does_not_create_review_work_product")
	check(not final_snapshot.has("case_theory"), "reading_does_not_create_case_theory")
	check(not final_snapshot.has("court_record") and not final_snapshot.has("court_record_entry"), "reading_does_not_create_court_record")
	check(not final_snapshot.has("court_fact_finding") and not final_snapshot.has("finding"), "reading_does_not_create_finding")
	check(not final_snapshot.has("judgment"), "reading_does_not_create_judgment")

	var presenter = SlicePresenter.new()
	var rows: Array = presenter.source_scope_rows(fresh_projection)
	check(rows.size() == 5, "presenter_lists_only_five_acquired_scopes")
	check(presenter.source_detail(reread["source"]).contains("법원 인정 사실이 아닙니다"), "presenter_states_source_assertion_boundary")
	check(presenter.known_gaps_text(fresh_projection).contains("알려진 공백"), "presenter_exposes_known_gap")

	print("SUMMARY %d checks, %d failures; VS-001 authorized Case Review runtime" % [checks, failures])
	quit(0 if failures == 0 else 1)
