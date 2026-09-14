extends RefCounted

# VS-002 operational service. It owns Task/WorkProduct/Issue/Theory mutations only.
var _state


func bind_state(state) -> void:
	_state = state


func assign_task(task_id: String, assignment_id: String, assigner_actor_id: String,
		assignee_actor_id: String, team_id: String) -> Dictionary:
	var context_error := _validate_actor_context(assigner_actor_id, team_id)
	if not context_error.is_empty():
		return _failure(context_error)
	if not _state.tasks.has(task_id):
		return _failure("task_not_found")
	var task: Dictionary = _state.tasks[task_id]
	if task["team_id"] != team_id:
		return _failure("task_team_mismatch")
	if not _team_has_actor(team_id, assignee_actor_id):
		return _failure("assignee_not_on_team")
	var definition: Dictionary = _state.task_definitions[task["task_definition_id"]]
	var actor: Dictionary = _state.actors[assignee_actor_id]
	if actor["actor_kind"] not in definition["eligible_actor_kinds"]:
		return _failure("assignee_role_ineligible")
	if task["state"] != "unassigned":
		return _failure("task_not_unassigned")
	if _id_exists(assignment_id):
		return _failure("duplicate_identity")

	var assignment := {
		"id": assignment_id,
		"task_id": task_id,
		"assigner_actor_id": assigner_actor_id,
		"assignee_actor_id": assignee_actor_id,
		"team_id": team_id,
		"matter_id": task["matter_id"],
		"stage_id": task["stage_id"],
		"role": "owner",
		"event_order": _next_event_order(),
	}
	_state.assignments[assignment_id] = assignment.duplicate(true)
	_state.assignment_order.append(assignment_id)
	task["current_assignment_id"] = assignment_id
	task["state"] = "assigned"
	_append_event(assignment, "task_assigned")
	return {"ok": true, "assignment": assignment.duplicate(true)}


func execute_task(task_id: String, execution_id: String, actor_id: String, team_id: String,
		time_slot_id: String, work_units: int, reviewed_scope_refs: Array) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty():
		return _failure(context_error)
	if not _state.tasks.has(task_id):
		return _failure("task_not_found")
	var task: Dictionary = _state.tasks[task_id]
	if task["team_id"] != team_id:
		return _failure("task_team_mismatch")
	if task["state"] == "completed":
		return _failure("task_already_completed")
	if task["state"] not in ["assigned", "in_progress"]:
		return _failure("task_not_assigned")
	var assignment: Dictionary = _state.assignments[task["current_assignment_id"]]
	if assignment["assignee_actor_id"] != actor_id:
		return _failure("actor_not_assignee")
	if not _dependencies_complete(task):
		return _failure("incomplete_dependency")
	if _id_exists(execution_id):
		return _failure("duplicate_identity")
	if time_slot_id.is_empty() or work_units <= 0:
		return _failure("invalid_work_time_allocation")
	var allocation_key := actor_id + "|" + time_slot_id
	if _state.time_allocations.has(allocation_key):
		return _failure("overlapping_work_time")

	var definition: Dictionary = _state.task_definitions[task["task_definition_id"]]
	var scope_validation := _validate_reviewed_scopes(
		reviewed_scope_refs, definition["authorized_source_scopes"], team_id)
	if not scope_validation["ok"]:
		return _failure(scope_validation["error"])
	var normalized_scopes: Array = scope_validation["scopes"]
	var execution := {
		"id": execution_id,
		"task_id": task_id,
		"task_definition_id": definition["id"],
		"task_definition_version": definition["version"],
		"assignment_id": assignment["id"],
		"actor_id": actor_id,
		"team_id": team_id,
		"matter_id": task["matter_id"],
		"stage_id": task["stage_id"],
		"time_slot_id": time_slot_id,
		"work_unit_kind": definition["work_unit_kind"],
		"work_units": work_units,
		"reviewed_source_scopes": normalized_scopes,
		"event_order": _next_event_order(),
	}
	_state.executions[execution_id] = execution.duplicate(true)
	_state.execution_order.append(execution_id)
	_state.time_allocations[allocation_key] = {
		"actor_id": actor_id,
		"time_slot_id": time_slot_id,
		"execution_id": execution_id,
		"work_units": work_units,
	}
	task["execution_ids"].append(execution_id)
	task["state"] = "in_progress"
	_append_event(execution, "task_executed")
	return {"ok": true, "execution": execution.duplicate(true)}


func complete_review_task(task_id: String, completion_id: String, work_product_id: String,
		actor_id: String, team_id: String, analysis_option_id: String) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty():
		return _failure(context_error)
	if not _state.tasks.has(task_id):
		return _failure("task_not_found")
	var task: Dictionary = _state.tasks[task_id]
	if task["team_id"] != team_id:
		return _failure("task_team_mismatch")
	if task["state"] == "completed":
		return _failure("task_already_completed")
	if task["state"] != "in_progress":
		return _failure("task_not_executed")
	var assignment: Dictionary = _state.assignments[task["current_assignment_id"]]
	if assignment["assignee_actor_id"] != actor_id:
		return _failure("actor_not_assignee")
	if not _dependencies_complete(task):
		return _failure("incomplete_dependency")
	if _id_exists(completion_id) or _id_exists(work_product_id):
		return _failure("duplicate_identity")
	if not _state.review_analysis_options.has(analysis_option_id):
		return _failure("analysis_option_not_found")

	var definition: Dictionary = _state.task_definitions[task["task_definition_id"]]
	var performed_units := 0
	var reviewed_scopes: Array = []
	var reviewed_scope_keys: Dictionary = {}
	for execution_id in task["execution_ids"]:
		var execution: Dictionary = _state.executions[execution_id]
		performed_units += int(execution["work_units"])
		for scope_ref in execution["reviewed_source_scopes"]:
			var key := _scope_ref_key(scope_ref)
			if not reviewed_scope_keys.has(key):
				reviewed_scope_keys[key] = true
				reviewed_scopes.append(scope_ref.duplicate(true))
	if performed_units < int(definition["required_work_units"]):
		return _failure("insufficient_performed_work")
	for required_scope in definition["authorized_source_scopes"]:
		if not reviewed_scope_keys.has(_scope_ref_key(required_scope)):
			return _failure("incomplete_review_scope")

	var option: Dictionary = _state.review_analysis_options[analysis_option_id]
	var analysis_id := work_product_id + "-ANALYSIS-001"
	var completion := {
		"id": completion_id,
		"task_id": task_id,
		"actor_id": actor_id,
		"team_id": team_id,
		"work_product_id": work_product_id,
		"event_order": _next_event_order(),
	}
	var work_product := {
		"id": work_product_id,
		"version": "1",
		"work_product_type": "evidence_review_work_product",
		"task_id": task_id,
		"task_definition_id": definition["id"],
		"task_definition_version": definition["version"],
		"assignment_id": assignment["id"],
		"execution_refs": task["execution_ids"].duplicate(),
		"completion_id": completion_id,
		"performer_actor_id": actor_id,
		"team_id": team_id,
		"matter_id": task["matter_id"],
		"stage_id": task["stage_id"],
		"reviewed_source_scopes": reviewed_scopes,
		"source_assertion_refs": definition["source_assertion_refs"].duplicate(),
		"known_gap_refs": definition["known_gap_refs"].duplicate(),
		"professional_analyses": [{
			"id": analysis_id,
			"origin_option_ref": option["id"],
			"statement": option["statement"],
			"basis_refs": option["basis_refs"].duplicate(),
			"epistemic_type": "professional_analysis",
		}],
		"coverage_state": "reviewed_declared_scope",
		"limitations": ["analysis_may_be_wrong", "not_a_fact_finding"],
		"performed_work_units": performed_units,
		"work_unit_kind": definition["work_unit_kind"],
		"content_version": _state.content_meta["content_version"],
		"created_event_order": completion["event_order"],
	}
	_state.completions[completion_id] = completion.duplicate(true)
	_state.completion_order.append(completion_id)
	_state.review_work_products[work_product_id] = work_product.duplicate(true)
	_state.review_work_product_order.append(work_product_id)
	task["completion_id"] = completion_id
	task["output_work_product_ids"].append(work_product_id)
	task["state"] = "completed"
	_append_event(completion, "task_completed")
	return {
		"ok": true,
		"completion": completion.duplicate(true),
		"work_product": work_product.duplicate(true),
	}


func select_issue(issue_id: String, selection_id: String, actor_id: String, team_id: String,
		review_work_product_id: String) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty():
		return _failure(context_error)
	if not _state.issues.has(issue_id):
		return _failure("issue_not_found")
	if not _state.review_work_products.has(review_work_product_id):
		return _failure("review_work_product_required")
	var work_product: Dictionary = _state.review_work_products[review_work_product_id]
	if work_product["team_id"] != team_id:
		return _failure("work_product_not_authorized")
	if _issue_is_selected(issue_id, team_id):
		return _failure("issue_already_selected")
	if _id_exists(selection_id):
		return _failure("duplicate_identity")
	var issue: Dictionary = _state.issues[issue_id]
	for assertion_ref in issue["basis_assertion_refs"]:
		if assertion_ref not in work_product["source_assertion_refs"]:
			return _failure("issue_basis_not_reviewed")
	for gap_ref in issue["known_gap_refs"]:
		if gap_ref not in work_product["known_gap_refs"]:
			return _failure("issue_basis_not_reviewed")

	var selection := {
		"id": selection_id,
		"issue_id": issue_id,
		"actor_id": actor_id,
		"team_id": team_id,
		"matter_id": _state.matter["id"],
		"stage_id": _state.stage["id"],
		"review_work_product_id": review_work_product_id,
		"strategic_status": "selected_for_theory",
		"event_order": _next_event_order(),
	}
	_state.issue_selections[selection_id] = selection.duplicate(true)
	_state.issue_selection_order.append(selection_id)
	_append_event(selection, "issue_selected")
	return {"ok": true, "selection": selection.duplicate(true)}


func create_case_theory(theory_id: String, version_id: String, issue_id: String,
		review_work_product_id: String, actor_id: String, team_id: String, statement: String,
		support_refs: Array, challenge_refs: Array, assumption_refs: Array,
		known_gap_refs: Array) -> Dictionary:
	var common := _validate_theory_inputs(
		issue_id, review_work_product_id, actor_id, team_id, statement,
		support_refs, challenge_refs, assumption_refs, known_gap_refs)
	if not common["ok"]:
		return _failure(common["error"])
	if _id_exists(theory_id) or _id_exists(version_id):
		return _failure("duplicate_identity")
	var theory := _build_theory_version(
		theory_id, version_id, 1, "", "created", issue_id, review_work_product_id,
		actor_id, team_id, statement, support_refs, challenge_refs, assumption_refs,
		known_gap_refs)
	_state.case_theories[version_id] = theory.duplicate(true)
	_state.case_theory_order.append(version_id)
	_state.theory_lineages[theory_id] = {
		"theory_id": theory_id,
		"version_ids": [version_id],
		"current_version_id": version_id,
	}
	_append_event(theory, "case_theory_created")
	return {"ok": true, "case_theory": theory.duplicate(true)}


func update_case_theory(theory_id: String, version_id: String, base_version_id: String,
		actor_id: String, team_id: String, statement: String) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty():
		return _failure(context_error)
	if not _state.theory_lineages.has(theory_id):
		return _failure("case_theory_not_found")
	var lineage: Dictionary = _state.theory_lineages[theory_id]
	if lineage["current_version_id"] != base_version_id:
		return _failure("stale_theory_version")
	if not _state.case_theories.has(base_version_id):
		return _failure("case_theory_version_not_found")
	if _id_exists(version_id):
		return _failure("duplicate_identity")
	if statement.strip_edges().is_empty():
		return _failure("invalid_theory_statement")
	var prior: Dictionary = _state.case_theories[base_version_id]
	if prior["team_id"] != team_id:
		return _failure("case_theory_not_authorized")
	var theory := _build_theory_version(
		theory_id, version_id, int(prior["version_number"]) + 1, base_version_id,
		"revised", prior["issue_id"], prior["review_work_product_id"], actor_id,
		team_id, statement, prior["support_refs"], prior["challenge_refs"],
		prior["assumption_refs"], prior["known_gap_refs"])
	_state.case_theories[version_id] = theory.duplicate(true)
	_state.case_theory_order.append(version_id)
	lineage["version_ids"].append(version_id)
	lineage["current_version_id"] = version_id
	_append_event(theory, "case_theory_revised")
	return {"ok": true, "case_theory": theory.duplicate(true)}


func work_strategy_projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	var viewer_error := _validate_actor_context(viewer_actor_id, viewer_team_id)
	if not viewer_error.is_empty():
		return _failure(viewer_error)
	var task_rows: Array = []
	for task_id in _state.task_order:
		var task: Dictionary = _state.tasks[task_id]
		if task["team_id"] == viewer_team_id:
			var row: Dictionary = task.duplicate(true)
			row["definition"] = _state.task_definitions[task["task_definition_id"]].duplicate(true)
			task_rows.append(row)
	var work_products: Array = []
	for work_product_id in _state.review_work_product_order:
		var work_product: Dictionary = _state.review_work_products[work_product_id]
		if work_product["team_id"] == viewer_team_id:
			work_products.append(work_product.duplicate(true))
	var issues: Array = []
	for issue_id in _state.issue_order:
		issues.append(_state.issues[issue_id].duplicate(true))
	var selections: Array = []
	for selection_id in _state.issue_selection_order:
		var selection: Dictionary = _state.issue_selections[selection_id]
		if selection["team_id"] == viewer_team_id:
			selections.append(selection.duplicate(true))
	var theories: Array = []
	for version_id in _state.case_theory_order:
		var theory: Dictionary = _state.case_theories[version_id]
		if theory["team_id"] == viewer_team_id:
			theories.append(theory.duplicate(true))
	return {"ok": true, "projection": {
		"tasks": task_rows,
		"review_work_products": work_products,
		"issues": issues,
		"review_analysis_options": _ordered_analysis_options(),
		"issue_selections": selections,
		"case_theories": theories,
		"theory_lineages": _authorized_lineages(viewer_team_id),
	}}


func _ordered_analysis_options() -> Array:
	var result: Array = []
	var option_ids: Array = _state.review_analysis_options.keys()
	option_ids.sort()
	for option_id in option_ids:
		result.append(_state.review_analysis_options[option_id].duplicate(true))
	return result


func get_review_work_product(viewer_actor_id: String, viewer_team_id: String,
		work_product_id: String) -> Dictionary:
	var viewer_error := _validate_actor_context(viewer_actor_id, viewer_team_id)
	if not viewer_error.is_empty():
		return _failure(viewer_error)
	if not _state.review_work_products.has(work_product_id):
		return _failure("review_work_product_not_found")
	var work_product: Dictionary = _state.review_work_products[work_product_id]
	if work_product["team_id"] != viewer_team_id:
		return _failure("work_product_not_authorized")
	return {"ok": true, "work_product": work_product.duplicate(true)}


func _validate_actor_context(actor_id: String, team_id: String) -> String:
	if _state == null or not _state.initialized:
		return "session_not_started"
	if actor_id != _state.session["player_actor_id"] or team_id != _state.session["player_team_id"]:
		return "viewer_not_authorized"
	return ""


func _team_has_actor(team_id: String, actor_id: String) -> bool:
	return _state.teams.has(team_id) and actor_id in _state.teams[team_id]["member_actor_ids"]


func _dependencies_complete(task: Dictionary) -> bool:
	for dependency_task_id in task["dependency_task_ids"]:
		if not _state.tasks.has(dependency_task_id) or _state.tasks[dependency_task_id]["state"] != "completed":
			return false
	return true


func _validate_reviewed_scopes(requested: Array, authorized: Array, team_id: String) -> Dictionary:
	if requested.is_empty():
		return {"ok": false, "error": "review_scope_required"}
	var authorized_keys: Dictionary = {}
	for scope_ref in authorized:
		authorized_keys[_scope_ref_key(scope_ref)] = true
	var seen: Dictionary = {}
	var normalized: Array = []
	for value in requested:
		if not value is Dictionary:
			return {"ok": false, "error": "invalid_review_scope"}
		var scope_ref: Dictionary = value
		for key in ["source_id", "source_version", "scope_id"]:
			if not scope_ref.get(key, "") is String or scope_ref.get(key, "").is_empty():
				return {"ok": false, "error": "invalid_review_scope"}
		var scope_key := _scope_ref_key(scope_ref)
		if seen.has(scope_key):
			return {"ok": false, "error": "duplicate_review_scope"}
		if not authorized_keys.has(scope_key):
			return {"ok": false, "error": "review_scope_not_authorized"}
		if not _team_has_source_scope(team_id, scope_ref):
			return {"ok": false, "error": "review_scope_not_acquired"}
		seen[scope_key] = true
		normalized.append({
			"source_id": scope_ref["source_id"],
			"source_version": scope_ref["source_version"],
			"scope_id": scope_ref["scope_id"],
		})
	return {"ok": true, "scopes": normalized}


func _team_has_source_scope(team_id: String, scope_ref: Dictionary) -> bool:
	for acquisition in _state.acquisitions:
		if acquisition["team_id"] == team_id and acquisition["source_id"] == scope_ref["source_id"] \
				and acquisition["source_version"] == scope_ref["source_version"] \
				and scope_ref["scope_id"] in acquisition["scopes"]:
			return true
	return false


func _validate_theory_inputs(issue_id: String, review_work_product_id: String,
		actor_id: String, team_id: String, statement: String, support_refs: Array,
		challenge_refs: Array, assumption_refs: Array, known_gap_refs: Array) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty():
		return {"ok": false, "error": context_error}
	if not _state.issues.has(issue_id) or not _issue_is_selected(issue_id, team_id):
		return {"ok": false, "error": "selected_issue_required"}
	if not _state.review_work_products.has(review_work_product_id):
		return {"ok": false, "error": "review_work_product_required"}
	var work_product: Dictionary = _state.review_work_products[review_work_product_id]
	if work_product["team_id"] != team_id:
		return {"ok": false, "error": "work_product_not_authorized"}
	if statement.strip_edges().is_empty():
		return {"ok": false, "error": "invalid_theory_statement"}
	var allowed_refs: Dictionary = {review_work_product_id: true}
	for ref in work_product["source_assertion_refs"] + work_product["known_gap_refs"]:
		allowed_refs[ref] = true
	for analysis in work_product["professional_analyses"]:
		allowed_refs[analysis["id"]] = true
	for refs in [support_refs, challenge_refs, assumption_refs, known_gap_refs]:
		var list_error := _validate_reference_list(refs, allowed_refs)
		if not list_error.is_empty():
			return {"ok": false, "error": list_error}
	return {"ok": true}


func _validate_reference_list(refs: Array, allowed_refs: Dictionary) -> String:
	var seen: Dictionary = {}
	for ref in refs:
		if not ref is String or ref.is_empty():
			return "invalid_theory_reference"
		if seen.has(ref):
			return "duplicate_theory_reference"
		if not allowed_refs.has(ref):
			return "theory_reference_not_authorized"
		seen[ref] = true
	return ""


func _build_theory_version(theory_id: String, version_id: String, version_number: int,
		parent_version_id: String, transition: String, issue_id: String,
		review_work_product_id: String, actor_id: String, team_id: String, statement: String,
		support_refs: Array, challenge_refs: Array, assumption_refs: Array,
		known_gap_refs: Array) -> Dictionary:
	return {
		"id": version_id,
		"theory_id": theory_id,
		"version_id": version_id,
		"version_number": version_number,
		"parent_version_id": parent_version_id,
		"transition": transition,
		"matter_id": _state.matter["id"],
		"stage_id": _state.stage["id"],
		"issue_id": issue_id,
		"review_work_product_id": review_work_product_id,
		"author_actor_id": actor_id,
		"team_id": team_id,
		"statement": statement,
		"support_refs": support_refs.duplicate(),
		"challenge_refs": challenge_refs.duplicate(),
		"assumption_refs": assumption_refs.duplicate(),
		"known_gap_refs": known_gap_refs.duplicate(),
		"epistemic_type": "case_theory",
		"limitations": ["may_be_wrong", "not_a_fact_finding"],
		"event_order": _next_event_order(),
	}


func _issue_is_selected(issue_id: String, team_id: String) -> bool:
	for selection_id in _state.issue_selection_order:
		var selection: Dictionary = _state.issue_selections[selection_id]
		if selection["issue_id"] == issue_id and selection["team_id"] == team_id:
			return true
	return false


func _authorized_lineages(team_id: String) -> Dictionary:
	var result: Dictionary = {}
	for theory_id in _state.theory_lineages:
		var lineage: Dictionary = _state.theory_lineages[theory_id]
		var current: Dictionary = _state.case_theories[lineage["current_version_id"]]
		if current["team_id"] == team_id:
			result[theory_id] = lineage.duplicate(true)
	return result


func _id_exists(identity: String) -> bool:
	if identity.is_empty():
		return true
	for collection in [
		_state.actors, _state.teams, _state.sources, _state.assertions, _state.known_gaps,
		_state.procedural_statuses, _state.task_definitions, _state.tasks, _state.assignments,
		_state.executions, _state.completions, _state.review_work_products, _state.issues,
		_state.review_analysis_options, _state.issue_selections, _state.case_theories,
		_state.theory_lineages,
	]:
		if collection.has(identity):
			return true
	for event in _state.journal:
		if event["id"] == identity:
			return true
	return identity in [
		_state.content_meta.get("content_id", ""), _state.session.get("id", ""),
		_state.matter.get("id", ""), _state.stage.get("id", ""),
	]


func _next_event_order() -> int:
	var highest := 0
	for event in _state.journal:
		highest = maxi(highest, int(event["event_order"]))
	return highest + 1


func _append_event(source: Dictionary, kind: String) -> void:
	var event: Dictionary = source.duplicate(true)
	event["kind"] = kind
	_state.journal.append(event)


func _scope_ref_key(scope_ref: Dictionary) -> String:
	return "%s|%s|%s" % [scope_ref["source_id"], scope_ref["source_version"], scope_ref["scope_id"]]


func _failure(error: String) -> Dictionary:
	return {"ok": false, "error": error}
