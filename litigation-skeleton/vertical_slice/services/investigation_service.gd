extends RefCounted

# Investigation-specific resolution. Generic Task lifecycle stays in WorkService.
var _state
var _work_service


func bind_services(state, work_service) -> void:
	_state = state
	_work_service = work_service


func create_investigation_task(action_id: String, task_id: String, creation_event_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty():
		return _failure(context_error)
	if not _state.investigation_actions.has(action_id):
		return _failure("investigation_action_not_found")
	return _work_service.create_investigation_task(
		_state.investigation_actions[action_id], task_id, creation_event_id, actor_id, team_id)


func execute_investigation_task(task_id: String, execution_id: String, actor_id: String,
		team_id: String, time_slot_id: String, work_units: int) -> Dictionary:
	var prerequisite: Dictionary = _validate_investigation_prerequisites(task_id, actor_id, team_id, false)
	if not prerequisite["ok"]:
		return prerequisite
	return _work_service.execute_investigation_task(
		task_id, execution_id, actor_id, team_id, time_slot_id, work_units)


func complete_investigation_task(task_id: String, completion_id: String,
		investigation_result_id: String, acquisition_id: String, actor_id: String,
		team_id: String) -> Dictionary:
	# Full validation is intentionally completed before WorkService performs the first write.
	var prerequisite: Dictionary = _validate_investigation_prerequisites(task_id, actor_id, team_id, true)
	if not prerequisite["ok"]:
		return prerequisite
	var lifecycle: Dictionary = _work_service.preflight_investigation_completion(
		task_id, completion_id, investigation_result_id, actor_id, team_id)
	if not lifecycle["ok"]:
		return lifecycle
	var task: Dictionary = prerequisite["task"]
	var action: Dictionary = prerequisite["action"]
	if task["investigation_action_id"] != action["id"]:
		return _failure("investigation_action_mismatch")
	# Acquisition identity validation is deliberately outcome-independent. The supplied
	# identity is consumed only if resolution materializes an AcquisitionEvent.
	if acquisition_id.is_empty():
		return _failure("acquisition_identity_required")
	if _work_service.investigation_identity_exists(acquisition_id):
		return _failure("duplicate_identity")
	var outcome: Dictionary = action["authored_outcome"]
	var acquires_source: bool = outcome["outcome"] in ["success", "partial_success"]
	if acquires_source:
		var source_validation: String = _validate_authored_acquisition(outcome)
		if not source_validation.is_empty():
			return _failure("invalid_investigation_configuration")

	var completion: Dictionary = _work_service.record_investigation_completion(
		task_id, completion_id, investigation_result_id, actor_id, team_id)
	var result := {
		"id": investigation_result_id,
		"outcome": outcome["outcome"],
		"task_id": task_id,
		"task_definition_id": lifecycle["definition"]["id"],
		"task_definition_version": lifecycle["definition"]["version"],
		"assignment_id": lifecycle["assignment"]["id"],
		"execution_refs": task["execution_ids"].duplicate(),
		"investigation_action_id": action["id"],
		"starting_basis_refs": action["known_gap_refs"].duplicate(),
		"bounded_domain": action["bounded_domain"],
		"actor_id": actor_id,
		"team_id": team_id,
		"matter_id": task["matter_id"],
		"stage_id": task["stage_id"],
		"summary": outcome["summary"],
		"acquisition_refs": [acquisition_id] if acquires_source else [],
		"limitations": outcome["limitations"].duplicate(),
		"performed_work_units": lifecycle["performed_work_units"],
		"work_unit_kind": lifecycle["definition"]["work_unit_kind"],
		"content_version": _state.content_meta["content_version"],
		"event_order": _next_event_order(),
	}
	_state.investigation_results[investigation_result_id] = result.duplicate(true)
	_state.investigation_result_order.append(investigation_result_id)
	_append_event(result, "investigation_resolved")

	var acquisition: Dictionary = {}
	if acquires_source:
		acquisition = {
			"id": acquisition_id,
			"source_id": outcome["source_id"],
			"source_version": outcome["source_version"],
			"scopes": outcome["scopes"].duplicate(),
			"actor_id": actor_id,
			"team_id": team_id,
			"matter_id": task["matter_id"],
			"stage_id": task["stage_id"],
			"investigation_action_id": action["id"],
			"investigation_task_id": task_id,
			"investigation_result_id": investigation_result_id,
			"route": outcome["route"],
			"provider_ref": outcome["provider_ref"],
			"event_order": _next_event_order(),
			"content_version": _state.content_meta["content_version"],
		}
		_state.acquisitions.append(acquisition.duplicate(true))
		_append_event(acquisition, "source_acquired")
	return {
		"ok": true,
		"completion": completion.duplicate(true),
		"investigation_result": result.duplicate(true),
		"acquisition": acquisition.duplicate(true),
	}


func investigation_projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	var context_error := _validate_actor_context(viewer_actor_id, viewer_team_id)
	if not context_error.is_empty():
		return _failure(context_error)
	var opportunities: Array = []
	for action_id in _state.investigation_action_order:
		var action: Dictionary = _state.investigation_actions[action_id]
		var task_id: String = _task_id_for_action(action_id, viewer_team_id)
		opportunities.append({
			"id": action["id"],
			"label": action["label"],
			"purpose": action["purpose"],
			"bounded_domain": action["bounded_domain"],
			"known_gap_refs": action["known_gap_refs"].duplicate(),
			"action_description": action["action_description"],
			"task_id": task_id,
			"created": not task_id.is_empty(),
		})
	var tasks: Array = []
	for task_id in _state.task_order:
		var task: Dictionary = _state.tasks[task_id]
		var definition: Dictionary = _state.task_definitions[task["task_definition_id"]]
		if task["team_id"] == viewer_team_id and definition["task_family"] == "investigation":
			tasks.append(task.duplicate(true))
	var results: Array = []
	for result_id in _state.investigation_result_order:
		var result: Dictionary = _state.investigation_results[result_id]
		if result["team_id"] == viewer_team_id:
			results.append(result.duplicate(true))
	var acquisitions: Array = []
	for acquisition in _state.acquisitions:
		if acquisition["team_id"] == viewer_team_id and acquisition.has("investigation_result_id"):
			acquisitions.append(acquisition.duplicate(true))
	return {"ok": true, "projection": {
		"opportunities": opportunities,
		"tasks": tasks,
		"results": results,
		"acquisitions": acquisitions,
	}}


func _validate_investigation_prerequisites(task_id: String, actor_id: String, team_id: String,
		require_execution: bool) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty():
		return _failure(context_error)
	if not _state.tasks.has(task_id):
		return _failure("task_not_found")
	var task: Dictionary = _state.tasks[task_id]
	if task["team_id"] != team_id:
		return _failure("task_team_mismatch")
	var definition: Dictionary = _state.task_definitions[task["task_definition_id"]]
	if definition["task_family"] != "investigation":
		return _failure("task_family_mismatch")
	if require_execution and task["state"] == "completed":
		return _failure("task_already_completed")
	if require_execution and task["state"] != "in_progress":
		return _failure("task_not_executed")
	if not _state.investigation_actions.has(task.get("investigation_action_id", "")):
		return _failure("investigation_action_not_found")
	var action: Dictionary = _state.investigation_actions[task["investigation_action_id"]]
	for dependency_task_id in task["dependency_task_ids"]:
		if not _state.tasks.has(dependency_task_id) or _state.tasks[dependency_task_id]["state"] != "completed":
			return _failure("incomplete_dependency")
	if not _state.review_work_products.has(action["required_review_work_product_id"]):
		return _failure("review_work_product_required")
	var work_product: Dictionary = _state.review_work_products[action["required_review_work_product_id"]]
	if work_product["team_id"] != team_id or work_product["task_id"] not in task["dependency_task_ids"]:
		return _failure("review_work_product_not_authorized")
	var issue_selected := false
	for selection_id in _state.issue_selection_order:
		var selection: Dictionary = _state.issue_selections[selection_id]
		if selection["issue_id"] == action["required_issue_id"] and selection["team_id"] == team_id:
			issue_selected = true
			break
	if not issue_selected:
		return _failure("selected_issue_required")
	var current_theory: Dictionary = {}
	for theory_id in _state.theory_lineages:
		var lineage: Dictionary = _state.theory_lineages[theory_id]
		var candidate: Dictionary = _state.case_theories[lineage["current_version_id"]]
		if candidate["team_id"] == team_id and candidate["matter_id"] == task["matter_id"] \
				and candidate["issue_id"] == action["required_issue_id"]:
			current_theory = candidate
			break
	if current_theory.is_empty():
		return _failure("current_case_theory_required")
	for gap_ref in action["known_gap_refs"]:
		if gap_ref not in current_theory["known_gap_refs"]:
			return _failure("case_theory_gap_basis_required")
	return {"ok": true, "task": task, "action": action}


func _validate_authored_acquisition(outcome: Dictionary) -> String:
	if not _state.sources.has(outcome["source_id"]):
		return "authored_source_not_found"
	var source: Dictionary = _state.sources[outcome["source_id"]]
	if source["version"] != outcome["source_version"]:
		return "authored_source_version_invalid"
	var valid_scopes: Dictionary = {}
	for scope in source["scopes"]:
		valid_scopes[scope["id"]] = true
	for scope_id in outcome["scopes"]:
		if not valid_scopes.has(scope_id):
			return "authored_source_scope_invalid"
	return ""


func _task_id_for_action(action_id: String, team_id: String) -> String:
	for task_id in _state.task_order:
		var task: Dictionary = _state.tasks[task_id]
		if task["team_id"] == team_id and task.get("investigation_action_id", "") == action_id:
			return task_id
	return ""


func _validate_actor_context(actor_id: String, team_id: String) -> String:
	if _state == null or not _state.initialized:
		return "session_not_started"
	if actor_id != _state.session["player_actor_id"] or team_id != _state.session["player_team_id"]:
		return "viewer_not_authorized"
	return ""


func _next_event_order() -> int:
	var highest := 0
	for event in _state.journal:
		highest = maxi(highest, int(event["event_order"]))
	return highest + 1


func _append_event(source: Dictionary, kind: String) -> void:
	var event: Dictionary = source.duplicate(true)
	event["kind"] = kind
	_state.journal.append(event)


func _failure(error: String) -> Dictionary:
	return {"ok": false, "error": error}
