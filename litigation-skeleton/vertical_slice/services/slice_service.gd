extends RefCounted

const SliceState = preload("res://vertical_slice/data/slice_state.gd")
const WorkService = preload("res://vertical_slice/services/work_service.gd")
const InvestigationService = preload("res://vertical_slice/services/investigation_service.gd")
const LegalResearchService = preload("res://vertical_slice/services/legal_research_service.gd")

const SUPPORTED_SCHEMA_VERSION := 1
const FORBIDDEN_CONTENT_KEYS := [
	"actual_state", "actual_state_record", "court_record", "court_record_entry",
	"court_fact_finding", "finding", "findings", "judgment", "winner",
	"case_strength", "evidence_score", "win_chance", "win_probability",
	"correct_law", "correct_argument", "correct_interpretation", "winning_authority",
	"best_precedent_score", "legal_strength_score",
]

var _state = SliceState.new()
var _work_service = WorkService.new()
var _investigation_service = InvestigationService.new()
var _legal_research_service = LegalResearchService.new()


func start_session(content: Dictionary, player_actor_id: String, player_team_id: String) -> Dictionary:
	var validation_error := _validate_content(content, player_actor_id, player_team_id)
	if not validation_error.is_empty():
		return {"ok": false, "error": validation_error}
	if _state.initialized:
		return {"ok": false, "error": "session_already_started"}

	var candidate = SliceState.new()
	candidate.initialized = true
	candidate.content_meta = {
		"schema_version": content["schema_version"],
		"content_version": content["content_version"],
		"content_id": content["content_id"],
	}
	candidate.session = {
		"id": content["session_event"]["session_id"],
		"player_actor_id": player_actor_id,
		"player_team_id": player_team_id,
		"matter_id": content["matter"]["id"],
		"stage_id": content["stage"]["id"],
	}
	candidate.matter = content["matter"].duplicate(true)
	candidate.stage = content["stage"].duplicate(true)

	for actor in content["actors"]:
		candidate.actors[actor["id"]] = actor.duplicate(true)
	for team in content["teams"]:
		candidate.teams[team["id"]] = team.duplicate(true)
	for source in content["sources"]:
		candidate.sources[source["id"]] = source.duplicate(true)
		candidate.source_order.append(source["id"])
	for assertion in content["assertions"]:
		candidate.assertions[assertion["id"]] = assertion.duplicate(true)
		candidate.assertion_order.append(assertion["id"])
	for gap in content["known_gaps"]:
		candidate.known_gaps[gap["id"]] = gap.duplicate(true)
		candidate.gap_order.append(gap["id"])
	for status in content["procedural_statuses"]:
		candidate.procedural_statuses[status["id"]] = status.duplicate(true)
		candidate.status_order.append(status["id"])
	for acquisition in content["acquisitions"]:
		candidate.acquisitions.append(acquisition.duplicate(true))
	for action in content["investigation_actions"]:
		candidate.investigation_actions[action["id"]] = action.duplicate(true)
		candidate.investigation_action_order.append(action["id"])
	for source in content["legal_sources"]:
		candidate.legal_sources[source["id"]] = source.duplicate(true)
		candidate.legal_source_order.append(source["id"])
	for question in content["legal_research_questions"]:
		candidate.legal_research_questions[question["id"]] = question.duplicate(true)
		candidate.legal_research_question_order.append(question["id"])
	for recipe in content["legal_research_recipes"]:
		candidate.legal_research_recipes[recipe["id"]] = recipe.duplicate(true)
	for definition in content["task_definitions"]:
		candidate.task_definitions[definition["id"]] = definition.duplicate(true)
		candidate.task_definition_order.append(definition["id"])
	for authored_task in content["task_instances"]:
		candidate.tasks[authored_task["id"]] = {
			"id": authored_task["id"],
			"task_definition_id": authored_task["task_definition_id"],
			"matter_id": authored_task["matter_id"],
			"stage_id": authored_task["stage_id"],
			"team_id": authored_task["team_id"],
			"dependency_task_ids": authored_task["dependency_task_ids"].duplicate(),
			"state": authored_task["initial_state"],
			"creation_event_id": authored_task["creation_event_id"],
			"created_by_ref": authored_task["created_by_ref"],
			"current_assignment_id": "",
			"execution_ids": [],
			"completion_id": "",
			"output_work_product_ids": [],
			"output_result_ids": [],
		}
		candidate.task_order.append(authored_task["id"])
	for issue in content["issues"]:
		candidate.issues[issue["id"]] = issue.duplicate(true)
		candidate.issue_order.append(issue["id"])
	for option in content["review_analysis_options"]:
		candidate.review_analysis_options[option["id"]] = option.duplicate(true)

	candidate.journal.append({
		"id": content["session_event"]["id"],
		"event_order": content["session_event"]["event_order"],
		"kind": "session_started",
		"session_id": content["session_event"]["session_id"],
		"matter_id": content["matter"]["id"],
		"stage_id": content["stage"]["id"],
		"content_version": content["content_version"],
	})
	for acquisition in candidate.acquisitions:
		var event: Dictionary = acquisition.duplicate(true)
		event["kind"] = "source_acquired"
		candidate.journal.append(event)
	for status_id in candidate.status_order:
		var event: Dictionary = candidate.procedural_statuses[status_id].duplicate(true)
		event["kind"] = "procedural_status_observed"
		candidate.journal.append(event)
	for authored_task in content["task_instances"]:
		candidate.journal.append({
			"id": authored_task["creation_event_id"],
			"event_order": authored_task["event_order"],
			"kind": "task_created",
			"task_id": authored_task["id"],
			"task_definition_id": authored_task["task_definition_id"],
			"matter_id": authored_task["matter_id"],
			"stage_id": authored_task["stage_id"],
			"team_id": authored_task["team_id"],
			"created_by_ref": authored_task["created_by_ref"],
		})
	candidate.journal.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		return int(a["event_order"]) < int(b["event_order"])
	)

	_state = candidate
	_work_service.bind_state(_state)
	_investigation_service.bind_services(_state, _work_service)
	_legal_research_service.bind_services(_state, _work_service)
	return {"ok": true, "session_id": candidate.session["id"]}


func assign_task(task_id: String, assignment_id: String, assigner_actor_id: String,
		assignee_actor_id: String, team_id: String) -> Dictionary:
	return _work_service.assign_task(
		task_id, assignment_id, assigner_actor_id, assignee_actor_id, team_id)


func execute_task(task_id: String, execution_id: String, actor_id: String, team_id: String,
		time_slot_id: String, work_units: int, reviewed_scope_refs: Array) -> Dictionary:
	return _work_service.execute_task(
		task_id, execution_id, actor_id, team_id, time_slot_id, work_units,
		reviewed_scope_refs)


func complete_review_task(task_id: String, completion_id: String, work_product_id: String,
		actor_id: String, team_id: String, analysis_option_id: String) -> Dictionary:
	return _work_service.complete_review_task(
		task_id, completion_id, work_product_id, actor_id, team_id, analysis_option_id)


func select_issue(issue_id: String, selection_id: String, actor_id: String, team_id: String,
		review_work_product_id: String) -> Dictionary:
	return _work_service.select_issue(
		issue_id, selection_id, actor_id, team_id, review_work_product_id)


func create_case_theory(theory_id: String, version_id: String, issue_id: String,
		review_work_product_id: String, actor_id: String, team_id: String, statement: String,
		support_refs: Array, challenge_refs: Array, assumption_refs: Array,
		known_gap_refs: Array) -> Dictionary:
	return _work_service.create_case_theory(
		theory_id, version_id, issue_id, review_work_product_id, actor_id, team_id,
		statement, support_refs, challenge_refs, assumption_refs, known_gap_refs)


func update_case_theory(theory_id: String, version_id: String, base_version_id: String,
		actor_id: String, team_id: String, statement: String) -> Dictionary:
	return _work_service.update_case_theory(
		theory_id, version_id, base_version_id, actor_id, team_id, statement)


func work_strategy_projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	return _work_service.work_strategy_projection(viewer_actor_id, viewer_team_id)


func get_review_work_product(viewer_actor_id: String, viewer_team_id: String,
		work_product_id: String) -> Dictionary:
	return _work_service.get_review_work_product(
		viewer_actor_id, viewer_team_id, work_product_id)


func create_investigation_task(action_id: String, task_id: String, creation_event_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	return _investigation_service.create_investigation_task(
		action_id, task_id, creation_event_id, actor_id, team_id)


func execute_investigation_task(task_id: String, execution_id: String, actor_id: String,
		team_id: String, time_slot_id: String, work_units: int) -> Dictionary:
	return _investigation_service.execute_investigation_task(
		task_id, execution_id, actor_id, team_id, time_slot_id, work_units)


func complete_investigation_task(task_id: String, completion_id: String,
		investigation_result_id: String, acquisition_id: String, actor_id: String,
		team_id: String) -> Dictionary:
	return _investigation_service.complete_investigation_task(
		task_id, completion_id, investigation_result_id, acquisition_id, actor_id, team_id)


func investigation_projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	return _investigation_service.investigation_projection(viewer_actor_id, viewer_team_id)


func create_legal_research_task(question_id: String, task_id: String, creation_event_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	return _legal_research_service.create_research_task(
		question_id, task_id, creation_event_id, actor_id, team_id)


func execute_legal_research_task(task_id: String, execution_id: String, actor_id: String,
		team_id: String, time_slot_id: String, work_units: int) -> Dictionary:
	return _legal_research_service.execute_research(
		task_id, execution_id, actor_id, team_id, time_slot_id, work_units)


func complete_legal_research_task(task_id: String, completion_id: String,
		discovery_event_ids: Array, actor_id: String, team_id: String) -> Dictionary:
	return _legal_research_service.complete_research(
		task_id, completion_id, discovery_event_ids, actor_id, team_id)


func create_legal_source_review_task(legal_source_id: String, legal_source_version: String,
		scope_id: String, task_id: String, creation_event_id: String, actor_id: String,
		team_id: String) -> Dictionary:
	return _legal_research_service.create_source_review_task(legal_source_id, legal_source_version,
		scope_id, task_id, creation_event_id, actor_id, team_id)


func review_legal_source(review_event_id: String, completion_id: String, task_id: String,
		legal_source_id: String,
		legal_source_version: String, scope_id: String, actor_id: String, team_id: String) -> Dictionary:
	return _legal_research_service.review_source(review_event_id, completion_id, task_id, legal_source_id,
		legal_source_version, scope_id, actor_id, team_id)


func record_legal_extraction(extraction_id: String, recipe_id: String, review_event_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	return _legal_research_service.record_extraction(
		extraction_id, recipe_id, review_event_id, actor_id, team_id)


func create_rule_statement(rule_id: String, recipe_id: String, extraction_ids: Array,
		actor_id: String, team_id: String) -> Dictionary:
	return _legal_research_service.create_rule_statement(
		rule_id, recipe_id, extraction_ids, actor_id, team_id)


func consider_legal_interpretation(interpretation_id: String, recipe_id: String,
		rule_ids: Array, actor_id: String, team_id: String) -> Dictionary:
	return _legal_research_service.consider_interpretation(
		interpretation_id, recipe_id, rule_ids, actor_id, team_id)


func create_issue_analysis(issue_analysis_id: String, recipe_id: String, task_id: String,
		rule_ids: Array, interpretation_ids: Array, factual_basis_refs: Array,
		actor_id: String, team_id: String) -> Dictionary:
	return _legal_research_service.create_issue_analysis(issue_analysis_id, recipe_id, task_id,
		rule_ids, interpretation_ids, factual_basis_refs, actor_id, team_id)


func create_argument(argument_id: String, recipe_id: String, issue_analysis_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	return _legal_research_service.create_argument(
		argument_id, recipe_id, issue_analysis_id, actor_id, team_id)


func select_argument(selection_event_id: String, argument_id: String, actor_id: String,
		team_id: String) -> Dictionary:
	return _legal_research_service.select_argument(selection_event_id, argument_id, actor_id, team_id)


func legal_research_projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	return _legal_research_service.projection(viewer_actor_id, viewer_team_id)


func read_legal_source(viewer_actor_id: String, viewer_team_id: String, legal_source_id: String,
		legal_source_version: String, scope_ids: Array) -> Dictionary:
	return _legal_research_service.read_source(
		viewer_actor_id, viewer_team_id, legal_source_id, legal_source_version, scope_ids)


func case_file_projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	var viewer_error := _validate_viewer(viewer_actor_id, viewer_team_id)
	if not viewer_error.is_empty():
		return {"ok": false, "error": viewer_error}

	var source_rows: Array = []
	for source_id in _state.source_order:
		var source: Dictionary = _state.sources[source_id]
		var allowed_scopes := _allowed_scopes(viewer_team_id, source_id, source["version"])
		if allowed_scopes.is_empty():
			continue
		var scope_rows: Array = []
		for scope in source["scopes"]:
			if scope["id"] in allowed_scopes:
				scope_rows.append({"id": scope["id"], "label": scope["label"]})
		source_rows.append({
			"id": source_id,
			"version": source["version"],
			"title": source["title"],
			"source_kind": source["source_kind"],
			"origin": source["origin"].duplicate(true),
			"acquired_scopes": scope_rows,
			"acquisition_refs": _acquisition_refs(viewer_team_id, source_id, source["version"]),
		})

	var assertion_rows: Array = []
	for assertion_id in _state.assertion_order:
		var assertion: Dictionary = _state.assertions[assertion_id]
		if assertion["team_id"] == viewer_team_id and assertion["source_scope_id"] in _allowed_scopes(
				viewer_team_id, assertion["source_id"], assertion["source_version"]):
			assertion_rows.append(assertion.duplicate(true))

	var gap_rows: Array = []
	for gap_id in _state.gap_order:
		var gap: Dictionary = _state.known_gaps[gap_id]
		if gap["team_id"] == viewer_team_id:
			gap_rows.append(gap.duplicate(true))

	var status_rows: Array = []
	for status_id in _state.status_order:
		var status: Dictionary = _state.procedural_statuses[status_id]
		if status["team_id"] == viewer_team_id:
			status_rows.append(status.duplicate(true))

	var acquisition_rows: Array = []
	for acquisition in _state.acquisitions:
		if acquisition["team_id"] == viewer_team_id:
			acquisition_rows.append(acquisition.duplicate(true))

	return {"ok": true, "projection": {
		"content_meta": _state.content_meta.duplicate(true),
		"session": _state.session.duplicate(true),
		"matter": _state.matter.duplicate(true),
		"stage": _state.stage.duplicate(true),
		"viewer": {"actor_id": viewer_actor_id, "team_id": viewer_team_id},
		"sources": source_rows,
		"source_assertions": assertion_rows,
		"known_gaps": gap_rows,
		"procedural_statuses": status_rows,
		"acquisition_history": acquisition_rows,
	}}


func read_source(viewer_actor_id: String, viewer_team_id: String, source_id: String,
		source_version: String, requested_scope_ids: Array) -> Dictionary:
	var viewer_error := _validate_viewer(viewer_actor_id, viewer_team_id)
	if not viewer_error.is_empty():
		return {"ok": false, "error": viewer_error}
	if not _state.sources.has(source_id):
		return {"ok": false, "error": "source_not_available"}
	var source: Dictionary = _state.sources[source_id]
	var allowed_scopes := _allowed_scopes(viewer_team_id, source_id, source["version"])
	if allowed_scopes.is_empty():
		return {"ok": false, "error": "source_not_acquired"}
	if source_version != source["version"]:
		return {"ok": false, "error": "source_version_mismatch"}
	if not _nonempty_unique_string_list(requested_scope_ids):
		return {"ok": false, "error": "invalid_scope_request"}
	for scope_id in requested_scope_ids:
		if scope_id not in allowed_scopes:
			return {"ok": false, "error": "scope_not_acquired"}

	var scope_rows: Array = []
	for requested_id in requested_scope_ids:
		for scope in source["scopes"]:
			if scope["id"] == requested_id:
				scope_rows.append(scope.duplicate(true))
				break

	return {"ok": true, "source": {
		"id": source_id,
		"version": source["version"],
		"title": source["title"],
		"source_kind": source["source_kind"],
		"origin": source["origin"].duplicate(true),
		"scopes": scope_rows,
		"acquisition_refs": _acquisition_refs(viewer_team_id, source_id, source["version"]),
	}}


func debug_snapshot_for_tests() -> Dictionary:
	return _state.snapshot()


func _validate_viewer(viewer_actor_id: String, viewer_team_id: String) -> String:
	if not _state.initialized:
		return "session_not_started"
	if viewer_actor_id != _state.session["player_actor_id"] or viewer_team_id != _state.session["player_team_id"]:
		return "viewer_not_authorized"
	return ""


func _allowed_scopes(team_id: String, source_id: String, source_version: String) -> Array:
	var result: Array = []
	for acquisition in _state.acquisitions:
		if acquisition["team_id"] == team_id and acquisition["source_id"] == source_id \
				and acquisition["source_version"] == source_version:
			for scope_id in acquisition["scopes"]:
				if scope_id not in result:
					result.append(scope_id)
	return result


func _acquisition_refs(team_id: String, source_id: String, source_version: String) -> Array:
	var result: Array = []
	for acquisition in _state.acquisitions:
		if acquisition["team_id"] == team_id and acquisition["source_id"] == source_id \
				and acquisition["source_version"] == source_version:
			result.append({
				"id": acquisition["id"],
				"source_id": acquisition["source_id"],
				"source_version": acquisition["source_version"],
				"event_order": acquisition["event_order"],
				"actor_id": acquisition["actor_id"],
				"team_id": acquisition["team_id"],
				"matter_id": acquisition.get("matter_id", ""),
				"stage_id": acquisition.get("stage_id", ""),
				"investigation_action_id": acquisition.get("investigation_action_id", ""),
				"investigation_task_id": acquisition.get("investigation_task_id", ""),
				"investigation_result_id": acquisition.get("investigation_result_id", ""),
				"route": acquisition["route"],
				"provider_ref": acquisition["provider_ref"],
				"scopes": acquisition["scopes"].duplicate(),
				"content_version": acquisition.get("content_version", ""),
			})
	return result


func _validate_content(content: Dictionary, player_actor_id: String, player_team_id: String) -> String:
	if content.is_empty():
		return "empty_content"
	if _contains_forbidden_key(content):
		return "forbidden_content_state"
	if content.get("schema_version") != SUPPORTED_SCHEMA_VERSION:
		return "unsupported_schema_version"
	for key in ["content_id", "content_version"]:
		if not _nonempty_string(content.get(key, "")):
			return "missing_" + key
	for key in ["matter", "stage", "session_event"]:
		if not content.get(key) is Dictionary:
			return "invalid_" + key
	for key in [
		"actors", "teams", "sources", "acquisitions", "assertions", "known_gaps",
		"procedural_statuses", "task_definitions", "task_instances", "issues",
		"review_analysis_options", "investigation_actions", "legal_sources",
		"legal_research_questions", "legal_research_recipes",
	]:
		if not content.get(key) is Array:
			return "invalid_" + key

	var matter: Dictionary = content["matter"]
	var stage: Dictionary = content["stage"]
	var session_event: Dictionary = content["session_event"]
	if not _required_strings(matter, ["id", "title", "client_goal"]):
		return "invalid_matter"
	if not _required_strings(stage, ["id", "matter_id", "level", "label"]) or stage["matter_id"] != matter["id"] \
			or stage["level"] != "trial":
		return "invalid_stage"
	if not _required_strings(session_event, ["id", "session_id"]) or not _positive_int(session_event.get("event_order")):
		return "invalid_session_event"

	var seen_ids: Dictionary = {}
	for identity in [content["content_id"], matter["id"], stage["id"], session_event["id"], session_event["session_id"]]:
		if not _claim_id(seen_ids, identity):
			return "duplicate_identity"
	var event_orders: Dictionary = {}
	event_orders[session_event["event_order"]] = true

	var actor_ids: Dictionary = {}
	for actor_value in content["actors"]:
		if not actor_value is Dictionary:
			return "invalid_actor"
		var actor: Dictionary = actor_value
		if not _required_strings(actor, ["id", "display_name", "actor_kind"]):
			return "invalid_actor"
		if not _claim_id(seen_ids, actor["id"]):
			return "duplicate_actor_id"
		actor_ids[actor["id"]] = true
	if not actor_ids.has(player_actor_id):
		return "unknown_player_actor"

	var team_ids: Dictionary = {}
	var team_members: Dictionary = {}
	for team_value in content["teams"]:
		if not team_value is Dictionary:
			return "invalid_team"
		var team: Dictionary = team_value
		if not _required_strings(team, ["id", "matter_id", "label"]) or team["matter_id"] != matter["id"] \
				or not _nonempty_unique_string_list(team.get("member_actor_ids", [])):
			return "invalid_team"
		if not _claim_id(seen_ids, team["id"]):
			return "duplicate_team_id"
		for member_id in team["member_actor_ids"]:
			if not actor_ids.has(member_id):
				return "team_member_unknown"
		team_ids[team["id"]] = true
		team_members[team["id"]] = team["member_actor_ids"].duplicate()
	if not team_ids.has(player_team_id) or player_actor_id not in team_members[player_team_id]:
		return "player_not_on_team"

	var source_map: Dictionary = {}
	var scope_map: Dictionary = {}
	for source_value in content["sources"]:
		if not source_value is Dictionary:
			return "invalid_source"
		var source: Dictionary = source_value
		if not _required_strings(source, ["id", "version", "title", "source_kind"]) or not source.get("origin") is Dictionary \
				or not _required_strings(source["origin"], ["kind", "provider_ref", "description"]):
			return "invalid_source"
		if not _claim_id(seen_ids, source["id"]):
			return "duplicate_source_id"
		if not source.get("scopes") is Array or source["scopes"].is_empty():
			return "source_requires_scopes"
		var local_scopes: Dictionary = {}
		for scope_value in source["scopes"]:
			if not scope_value is Dictionary or not _required_strings(scope_value, ["id", "label", "content"]):
				return "invalid_source_scope"
			if local_scopes.has(scope_value["id"]):
				return "duplicate_source_scope"
			local_scopes[scope_value["id"]] = true
		source_map[source["id"]] = source
		scope_map[source["id"]] = local_scopes
	if source_map.is_empty():
		return "sources_required"

	var acquired_scope_keys: Dictionary = {}
	for acquisition_value in content["acquisitions"]:
		if not acquisition_value is Dictionary:
			return "invalid_acquisition"
		var acquisition: Dictionary = acquisition_value
		if not _required_strings(acquisition, ["id", "source_id", "source_version", "actor_id", "team_id", "route", "provider_ref"]) \
				or not _positive_int(acquisition.get("event_order")) or not _nonempty_unique_string_list(acquisition.get("scopes", [])):
			return "invalid_acquisition"
		if not _claim_id(seen_ids, acquisition["id"]):
			return "duplicate_acquisition_id"
		if event_orders.has(acquisition["event_order"]):
			return "duplicate_event_order"
		event_orders[acquisition["event_order"]] = true
		if not source_map.has(acquisition["source_id"]) or source_map[acquisition["source_id"]]["version"] != acquisition["source_version"]:
			return "acquisition_source_reference_invalid"
		if not actor_ids.has(acquisition["actor_id"]) or not team_ids.has(acquisition["team_id"]):
			return "acquisition_actor_or_team_invalid"
		for scope_id in acquisition["scopes"]:
			if not scope_map[acquisition["source_id"]].has(scope_id):
				return "acquisition_scope_invalid"
			acquired_scope_keys[_scope_key(acquisition["team_id"], acquisition["source_id"], acquisition["source_version"], scope_id)] = true

	var assertion_ids: Dictionary = {}
	var assertion_map: Dictionary = {}
	for assertion_value in content["assertions"]:
		if not assertion_value is Dictionary:
			return "invalid_assertion"
		var assertion: Dictionary = assertion_value
		if not _required_strings(assertion, ["id", "team_id", "source_id", "source_version", "source_scope_id", "asserted_by_ref", "statement", "epistemic_type"]) \
				or assertion["epistemic_type"] != "source_assertion":
			return "invalid_assertion"
		if not _claim_id(seen_ids, assertion["id"]):
			return "duplicate_assertion_id"
		if not team_ids.has(assertion["team_id"]) or not source_map.has(assertion["source_id"]) \
				or source_map[assertion["source_id"]]["version"] != assertion["source_version"] \
				or not scope_map[assertion["source_id"]].has(assertion["source_scope_id"]):
			return "assertion_source_reference_invalid"
		if not acquired_scope_keys.has(_scope_key(assertion["team_id"], assertion["source_id"], assertion["source_version"], assertion["source_scope_id"])):
			return "assertion_scope_not_acquired"
		assertion_ids[assertion["id"]] = true
		assertion_map[assertion["id"]] = assertion

	var gap_ids: Dictionary = {}
	for gap_value in content["known_gaps"]:
		if not gap_value is Dictionary:
			return "invalid_known_gap"
		var gap: Dictionary = gap_value
		if not _required_strings(gap, ["id", "team_id", "description", "status"]) or not team_ids.has(gap["team_id"]) \
				or not _nonempty_unique_string_list(gap.get("basis_refs", [])):
			return "invalid_known_gap"
		if not _claim_id(seen_ids, gap["id"]):
			return "duplicate_gap_id"
		for basis_ref in gap["basis_refs"]:
			if not assertion_ids.has(basis_ref) and not source_map.has(basis_ref):
				return "known_gap_basis_invalid"
		gap_ids[gap["id"]] = true

	for status_value in content["procedural_statuses"]:
		if not status_value is Dictionary:
			return "invalid_procedural_status"
		var status: Dictionary = status_value
		if not _required_strings(status, ["id", "team_id", "subject_type", "subject_id", "state", "provenance_ref"]) \
				or not team_ids.has(status["team_id"]) or not _positive_int(status.get("event_order")):
			return "invalid_procedural_status"
		if not _claim_id(seen_ids, status["id"]):
			return "duplicate_status_id"
		if event_orders.has(status["event_order"]):
			return "duplicate_event_order"
		event_orders[status["event_order"]] = true
		if status["subject_id"] != matter["id"] and status["subject_id"] != stage["id"] and not source_map.has(status["subject_id"]):
			return "status_subject_invalid"

	var definition_map: Dictionary = {}
	for definition_value in content["task_definitions"]:
		if not definition_value is Dictionary:
			return "invalid_task_definition"
		var definition: Dictionary = definition_value
		if not _required_strings(definition, [
			"id", "version", "task_family", "purpose", "work_unit_kind",
			"output_type", "completion_semantics",
		]) or definition["task_family"] not in ["evidence_review", "investigation", "legal_research"] \
				or not _positive_int(definition.get("required_work_units")) \
				or not _nonempty_unique_string_list(definition.get("eligible_actor_kinds", [])) \
				or not definition.get("authorized_source_scopes") is Array \
				or not _unique_string_list(definition.get("source_assertion_refs", []), true) \
				or not _unique_string_list(definition.get("known_gap_refs", []), true):
			return "invalid_task_definition"
		if definition["task_family"] == "evidence_review" and (definition["output_type"] != "evidence_review_work_product" \
				or definition["authorized_source_scopes"].is_empty() \
				or definition["source_assertion_refs"].is_empty()):
			return "invalid_task_definition"
		if definition["task_family"] == "investigation" and (definition["output_type"] != "investigation_result" \
				or not definition["authorized_source_scopes"].is_empty() \
				or not definition["source_assertion_refs"].is_empty() \
				or definition["known_gap_refs"].is_empty()):
			return "invalid_task_definition"
		if definition["task_family"] == "legal_research" and (definition["output_type"] != "legal_source_discovery_events" \
				or not definition["authorized_source_scopes"].is_empty() \
				or not definition["source_assertion_refs"].is_empty() \
				or not _nonempty_string(definition.get("legal_research_question_id", ""))):
			return "invalid_task_definition"
		if not _claim_id(seen_ids, definition["id"]):
			return "duplicate_task_definition_id"
		var definition_scope_keys: Dictionary = {}
		for scope_value in definition["authorized_source_scopes"]:
			if not scope_value is Dictionary or not _required_strings(
					scope_value, ["source_id", "source_version", "scope_id"]):
				return "invalid_task_definition_scope"
			var source_id: String = scope_value["source_id"]
			if not source_map.has(source_id) or source_map[source_id]["version"] != scope_value["source_version"] \
					or not scope_map[source_id].has(scope_value["scope_id"]):
				return "task_definition_scope_reference_invalid"
			var definition_scope_key := _source_scope_key(
				source_id, scope_value["source_version"], scope_value["scope_id"])
			if definition_scope_keys.has(definition_scope_key):
				return "duplicate_task_definition_scope"
			definition_scope_keys[definition_scope_key] = true
		for assertion_ref in definition["source_assertion_refs"]:
			if not assertion_ids.has(assertion_ref):
				return "task_definition_assertion_reference_invalid"
			var referenced_assertion: Dictionary = assertion_map[assertion_ref]
			if not definition_scope_keys.has(_source_scope_key(
					referenced_assertion["source_id"], referenced_assertion["source_version"],
					referenced_assertion["source_scope_id"])):
				return "task_definition_assertion_outside_scope"
		for gap_ref in definition["known_gap_refs"]:
			if not gap_ids.has(gap_ref):
				return "task_definition_gap_reference_invalid"
		definition_map[definition["id"]] = definition
	if definition_map.is_empty():
		return "task_definitions_required"

	var task_map: Dictionary = {}
	for task_value in content["task_instances"]:
		if not task_value is Dictionary:
			return "invalid_task_instance"
		var task: Dictionary = task_value
		if not _required_strings(task, [
			"id", "task_definition_id", "matter_id", "stage_id", "team_id",
			"initial_state", "creation_event_id", "created_by_ref",
		]) or task["matter_id"] != matter["id"] or task["stage_id"] != stage["id"] \
				or task["initial_state"] != "unassigned" \
				or not _positive_int(task.get("event_order")) \
				or not _unique_string_list(task.get("dependency_task_ids", []), true):
			return "invalid_task_instance"
		if not _claim_id(seen_ids, task["id"]):
			return "duplicate_task_id"
		if not _claim_id(seen_ids, task["creation_event_id"]):
			return "duplicate_task_event_id"
		if event_orders.has(task["event_order"]):
			return "duplicate_event_order"
		event_orders[task["event_order"]] = true
		if not definition_map.has(task["task_definition_id"]) or not team_ids.has(task["team_id"]):
			return "task_definition_or_team_reference_invalid"
		task_map[task["id"]] = task
	if task_map.is_empty():
		return "task_instances_required"
	for task_id in task_map:
		var task: Dictionary = task_map[task_id]
		for dependency_task_id in task["dependency_task_ids"]:
			if dependency_task_id == task_id or not task_map.has(dependency_task_id):
				return "task_dependency_reference_invalid"
		var definition: Dictionary = definition_map[task["task_definition_id"]]
		if definition["task_family"] == "evidence_review":
			for scope_ref in definition["authorized_source_scopes"]:
				if not acquired_scope_keys.has(_scope_key(
						task["team_id"], scope_ref["source_id"], scope_ref["source_version"],
						scope_ref["scope_id"])):
					return "task_scope_not_acquired"

	var issue_ids: Dictionary = {}
	for issue_value in content["issues"]:
		if not issue_value is Dictionary:
			return "invalid_issue"
		var issue: Dictionary = issue_value
		if not _required_strings(issue, ["id", "matter_id", "label", "question", "epistemic_type"]) \
				or issue["matter_id"] != matter["id"] or issue["epistemic_type"] != "issue" \
				or not _nonempty_unique_string_list(issue.get("basis_assertion_refs", [])) \
				or not _unique_string_list(issue.get("known_gap_refs", []), true):
			return "invalid_issue"
		if not _claim_id(seen_ids, issue["id"]):
			return "duplicate_issue_id"
		for assertion_ref in issue["basis_assertion_refs"]:
			if not assertion_ids.has(assertion_ref):
				return "issue_assertion_reference_invalid"
		for gap_ref in issue["known_gap_refs"]:
			if not gap_ids.has(gap_ref):
				return "issue_gap_reference_invalid"
		issue_ids[issue["id"]] = true
	if issue_ids.is_empty():
		return "issues_required"

	for option_value in content["review_analysis_options"]:
		if not option_value is Dictionary:
			return "invalid_review_analysis_option"
		var option: Dictionary = option_value
		if not _required_strings(option, ["id", "label", "statement", "epistemic_type"]) \
				or option["epistemic_type"] != "professional_analysis" \
				or not _nonempty_unique_string_list(option.get("basis_refs", [])):
			return "invalid_review_analysis_option"
		if not _claim_id(seen_ids, option["id"]):
			return "duplicate_review_analysis_option_id"
		for basis_ref in option["basis_refs"]:
			if not assertion_ids.has(basis_ref) and not gap_ids.has(basis_ref):
				return "review_analysis_basis_invalid"

	var action_ids: Dictionary = {}
	for action_value in content["investigation_actions"]:
		if not action_value is Dictionary:
			return "invalid_investigation_action"
		var action: Dictionary = action_value
		if not _required_strings(action, [
			"id", "label", "purpose", "bounded_domain", "task_definition_id",
			"required_review_work_product_id", "required_issue_id", "action_description",
		]) or not _nonempty_unique_string_list(action.get("dependency_task_ids", [])) \
				or not _nonempty_unique_string_list(action.get("known_gap_refs", [])) \
				or not action.get("authored_outcome") is Dictionary:
			return "invalid_investigation_action"
		if not _claim_id(seen_ids, action["id"]):
			return "duplicate_investigation_action_id"
		if not definition_map.has(action["task_definition_id"]) \
				or definition_map[action["task_definition_id"]]["task_family"] != "investigation":
			return "investigation_task_definition_invalid"
		if not issue_ids.has(action["required_issue_id"]):
			return "investigation_issue_reference_invalid"
		for dependency_task_id in action["dependency_task_ids"]:
			if not task_map.has(dependency_task_id):
				return "investigation_dependency_reference_invalid"
		for gap_ref in action["known_gap_refs"]:
			if not gap_ids.has(gap_ref) or gap_ref not in definition_map[action["task_definition_id"]]["known_gap_refs"]:
				return "investigation_gap_reference_invalid"
		var outcome: Dictionary = action["authored_outcome"]
		if not _required_strings(outcome, ["outcome", "summary"]) \
				or outcome["outcome"] not in ["success", "partial_success", "failure"] \
				or not _nonempty_unique_string_list(outcome.get("limitations", [])) \
				or not outcome.get("scopes") is Array:
			return "invalid_investigation_outcome"
		if outcome["outcome"] in ["success", "partial_success"]:
			if not _required_strings(outcome, ["source_id", "source_version", "route", "provider_ref"]) \
					or not _nonempty_unique_string_list(outcome["scopes"]):
				return "invalid_investigation_outcome"
			if not source_map.has(outcome["source_id"]) \
					or source_map[outcome["source_id"]]["version"] != outcome["source_version"]:
				return "investigation_source_reference_invalid"
			for scope_id in outcome["scopes"]:
				if not scope_map[outcome["source_id"]].has(scope_id):
					return "investigation_scope_reference_invalid"
		else:
			if not outcome.get("source_id", "").is_empty() \
					or not outcome.get("source_version", "").is_empty() \
					or not outcome["scopes"].is_empty() or not outcome.get("route", "").is_empty() \
					or not outcome.get("provider_ref", "").is_empty():
				return "invalid_investigation_failure_outcome"
		action_ids[action["id"]] = true
	if action_ids.is_empty():
		return "investigation_actions_required"

	var legal_source_map: Dictionary = {}
	var legal_scope_map: Dictionary = {}
	for source_value in content["legal_sources"]:
		if not source_value is Dictionary: return "invalid_legal_source"
		var legal_source: Dictionary = source_value
		if not _required_strings(legal_source, ["id", "version", "title", "citation", "source_kind"]) \
				or not legal_source.get("scopes") is Array or legal_source["scopes"].is_empty():
			return "invalid_legal_source"
		if not _claim_id(seen_ids, legal_source["id"]): return "duplicate_legal_source_id"
		var legal_scopes: Dictionary = {}
		for scope_value in legal_source["scopes"]:
			if not scope_value is Dictionary or not _required_strings(scope_value, ["id", "label", "content"]):
				return "invalid_legal_source_scope"
			if legal_scopes.has(scope_value["id"]): return "duplicate_legal_source_scope"
			legal_scopes[scope_value["id"]] = true
		legal_source_map[legal_source["id"]] = legal_source
		legal_scope_map[legal_source["id"]] = legal_scopes
	if legal_source_map.size() < 2: return "multiple_legal_sources_required"

	var question_ids: Dictionary = {}
	for question_value in content["legal_research_questions"]:
		if not question_value is Dictionary: return "invalid_legal_research_question"
		var question: Dictionary = question_value
		if not _required_strings(question, ["id", "label", "question", "bounded_domain", "issue_id",
				"review_work_product_id", "task_definition_id"]) \
				or not _nonempty_unique_string_list(question.get("dependency_task_ids", [])) \
				or not question.get("discoverable_legal_source_refs") is Array \
				or question["discoverable_legal_source_refs"].size() < 2:
			return "invalid_legal_research_question"
		if not _claim_id(seen_ids, question["id"]): return "duplicate_legal_research_question_id"
		if not issue_ids.has(question["issue_id"]) or not definition_map.has(question["task_definition_id"]) \
				or definition_map[question["task_definition_id"]]["task_family"] != "legal_research" \
				or definition_map[question["task_definition_id"]]["legal_research_question_id"] != question["id"]:
			return "legal_research_question_reference_invalid"
		for dependency_id in question["dependency_task_ids"]:
			if not task_map.has(dependency_id): return "legal_research_dependency_invalid"
		var path_ids: Dictionary = {}
		for ref_value in question["discoverable_legal_source_refs"]:
			if not ref_value is Dictionary or not _required_strings(ref_value,
					["authored_path_id", "legal_source_id", "legal_source_version"]):
				return "invalid_legal_source_path"
			if path_ids.has(ref_value["authored_path_id"]): return "duplicate_legal_source_path"
			path_ids[ref_value["authored_path_id"]] = true
			if not legal_source_map.has(ref_value["legal_source_id"]) \
					or legal_source_map[ref_value["legal_source_id"]]["version"] != ref_value["legal_source_version"]:
				return "legal_source_path_reference_invalid"
		question_ids[question["id"]] = true
	if question_ids.is_empty(): return "legal_research_question_required"

	var recipe_ids: Dictionary = {}
	var argument_recipe_count := 0
	for recipe_value in content["legal_research_recipes"]:
		if not recipe_value is Dictionary: return "invalid_legal_research_recipe"
		var recipe: Dictionary = recipe_value
		if not _required_strings(recipe, ["id", "kind"]) \
				or recipe["kind"] not in ["extraction", "rule", "interpretation", "issue_analysis", "argument"]:
			return "invalid_legal_research_recipe"
		if not _claim_id(seen_ids, recipe["id"]): return "duplicate_legal_research_recipe_id"
		if recipe["kind"] == "extraction":
			if not _required_strings(recipe, ["legal_source_id", "legal_source_version", "scope_id", "recorded_text"]) \
					or not legal_source_map.has(recipe["legal_source_id"]) \
					or legal_source_map[recipe["legal_source_id"]]["version"] != recipe["legal_source_version"] \
					or not legal_scope_map[recipe["legal_source_id"]].has(recipe["scope_id"]):
				return "invalid_extraction_recipe"
		elif recipe["kind"] == "argument":
			argument_recipe_count += 1
			if not _required_strings(recipe, ["label", "position", "issue_id", "issue_analysis_recipe_id"]) \
					or not issue_ids.has(recipe["issue_id"]) \
					or not _nonempty_unique_string_list(recipe.get("review_work_product_ids", [])):
				return "invalid_argument_recipe"
		recipe_ids[recipe["id"]] = recipe["kind"]
	if argument_recipe_count < 2: return "multiple_argument_paths_required"
	for recipe_value in content["legal_research_recipes"]:
		var recipe: Dictionary = recipe_value
		var expected_key := ""
		var expected_kind := ""
		if recipe["kind"] == "rule": expected_key = "extraction_recipe_ids"; expected_kind = "extraction"
		elif recipe["kind"] == "interpretation": expected_key = "rule_recipe_ids"; expected_kind = "rule"
		elif recipe["kind"] == "issue_analysis": expected_key = "interpretation_recipe_ids"; expected_kind = "interpretation"
		if not expected_key.is_empty():
			if not _nonempty_unique_string_list(recipe.get(expected_key, [])): return "invalid_recipe_provenance"
			for ref in recipe[expected_key]:
				if recipe_ids.get(ref, "") != expected_kind: return "invalid_recipe_provenance"
		if recipe["kind"] == "issue_analysis":
			if not _nonempty_unique_string_list(recipe.get("rule_recipe_ids", [])) \
					or not _required_strings(recipe, ["issue_id", "application"]) \
					or not recipe.get("factual_basis_requirements") is Array \
					or recipe["factual_basis_requirements"].is_empty(): return "invalid_issue_analysis_recipe"
			for ref in recipe["rule_recipe_ids"]:
				if recipe_ids.get(ref, "") != "rule": return "invalid_recipe_provenance"
			var factual_types: Dictionary = {}
			for requirement_value in recipe["factual_basis_requirements"]:
				if not requirement_value is Dictionary: return "invalid_factual_basis_requirement"
				var requirement: Dictionary = requirement_value
				var basis_type: String = requirement.get("basis_type", "")
				if basis_type not in ["ReviewWorkProduct", "InvestigationResult", "SourceMaterial"] \
						or factual_types.has(basis_type): return "invalid_factual_basis_requirement"
				factual_types[basis_type] = true
				if basis_type == "ReviewWorkProduct" and not _nonempty_string(requirement.get("id", "")):
					return "invalid_factual_basis_requirement"
				if basis_type == "InvestigationResult" and not _nonempty_string(requirement.get("investigation_action_id", "")):
					return "invalid_factual_basis_requirement"
				if basis_type == "SourceMaterial" and (not _required_strings(requirement,
						["source_id", "source_version"]) or not _nonempty_unique_string_list(requirement.get("scope_ids", []))):
					return "invalid_factual_basis_requirement"
		if recipe["kind"] == "argument" and recipe_ids.get(recipe["issue_analysis_recipe_id"], "") != "issue_analysis":
			return "invalid_argument_recipe"

	return ""


func _contains_forbidden_key(value: Variant) -> bool:
	if value is Dictionary:
		for key in value:
			if str(key).to_snake_case().to_lower() in FORBIDDEN_CONTENT_KEYS:
				return true
			if _contains_forbidden_key(value[key]):
				return true
	elif value is Array:
		for item in value:
			if _contains_forbidden_key(item):
				return true
	return false


func _claim_id(seen_ids: Dictionary, identity: Variant) -> bool:
	if not _nonempty_string(identity) or seen_ids.has(identity):
		return false
	seen_ids[identity] = true
	return true


func _required_strings(value: Dictionary, keys: Array) -> bool:
	for key in keys:
		if not _nonempty_string(value.get(key, "")):
			return false
	return true


func _nonempty_string(value: Variant) -> bool:
	return value is String and not value.is_empty()


func _positive_int(value: Variant) -> bool:
	return (value is int or value is float) and float(value) > 0.0 \
			and float(value) == floor(float(value))


func _nonempty_unique_string_list(value: Variant) -> bool:
	if not value is Array or value.is_empty():
		return false
	var seen: Dictionary = {}
	for item in value:
		if not _nonempty_string(item) or seen.has(item):
			return false
		seen[item] = true
	return true


func _unique_string_list(value: Variant, allow_empty: bool) -> bool:
	if not value is Array or (value.is_empty() and not allow_empty):
		return false
	var seen: Dictionary = {}
	for item in value:
		if not _nonempty_string(item) or seen.has(item):
			return false
		seen[item] = true
	return true


func _scope_key(team_id: String, source_id: String, version: String, scope_id: String) -> String:
	return team_id + "|" + source_id + "|" + version + "|" + scope_id


func _source_scope_key(source_id: String, version: String, scope_id: String) -> String:
	return source_id + "|" + version + "|" + scope_id
