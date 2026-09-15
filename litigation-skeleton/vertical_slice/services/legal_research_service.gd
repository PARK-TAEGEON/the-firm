extends RefCounted

# Owns only Legal Research-specific prerequisites, materialization and projections.
# Generic Task lifecycle mutation remains in WorkService.
var _state
var _work_service


func bind_services(state, work_service) -> void:
	_state = state
	_work_service = work_service


func create_research_task(question_id: String, task_id: String, creation_event_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return _failure(error)
	if not _state.legal_research_questions.has(question_id): return _failure("research_question_not_found")
	var question: Dictionary = _state.legal_research_questions[question_id]
	return _work_service.create_legal_research_task(
		question, task_id, creation_event_id, actor_id, team_id)


func execute_research(task_id: String, execution_id: String, actor_id: String,
		team_id: String, time_slot_id: String, work_units: int) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty(): return _failure(context_error)
	if not _state.tasks.has(task_id): return _failure("task_not_found")
	var task: Dictionary = _state.tasks[task_id]
	for dependency_id in task["dependency_task_ids"]:
		if not _state.tasks.has(dependency_id) or _state.tasks[dependency_id]["state"] != "completed":
			return _failure("incomplete_dependency")
	var prerequisite := _validate_research_context(task_id, actor_id, team_id)
	if not prerequisite.is_empty():
		return _failure(prerequisite)
	return _work_service.execute_legal_research_task(
		task_id, execution_id, actor_id, team_id, time_slot_id, work_units)


func complete_research(task_id: String, completion_id: String, discovery_event_ids: Array,
		actor_id: String, team_id: String) -> Dictionary:
	var prerequisite := _validate_research_context(task_id, actor_id, team_id)
	if not prerequisite.is_empty():
		return _failure(prerequisite)
	var preflight: Dictionary = _work_service.preflight_legal_research_completion(
		task_id, completion_id, actor_id, team_id)
	if not preflight["ok"]:
		return preflight
	if preflight["task"].get("legal_research_work_kind", "") != "discovery":
		return _failure("discovery_task_required")
	var definition: Dictionary = preflight["definition"]
	var question: Dictionary = _state.legal_research_questions[definition["legal_research_question_id"]]
	var source_refs: Array = question["discoverable_legal_source_refs"]
	if discovery_event_ids.size() != source_refs.size():
		return _failure("discovery_identity_count_mismatch")
	var seen: Dictionary = {}
	for identity in discovery_event_ids:
		if not identity is String or identity.is_empty() or identity == completion_id \
				or seen.has(identity) or _id_exists(identity):
			return _failure("duplicate_identity")
		seen[identity] = true
	# All validation is complete before the first authoritative mutation.
	var completion: Dictionary = _work_service.record_legal_research_completion(
		task_id, completion_id, actor_id, team_id)
	var discoveries: Array = []
	for index in source_refs.size():
		var source_ref: Dictionary = source_refs[index]
		var discovery := {
			"id": discovery_event_ids[index], "task_id": task_id,
			"task_definition_id": definition["id"],
			"task_definition_version": definition["version"],
			"assignment_id": preflight["assignment"]["id"],
			"execution_ids": preflight["task"]["execution_ids"].duplicate(),
			"completion_id": completion_id,
			"legal_research_question_id": question["id"],
			"authored_path_id": source_ref["authored_path_id"],
			"legal_source_id": source_ref["legal_source_id"],
			"legal_source_version": source_ref["legal_source_version"],
			"actor_id": actor_id, "team_id": team_id,
			"matter_id": _state.matter["id"], "stage_id": _state.stage["id"],
			"content_version": _state.content_meta["content_version"],
			"event_order": _next_event_order(),
		}
		_state.legal_source_discoveries[discovery["id"]] = discovery.duplicate(true)
		_state.legal_source_discovery_order.append(discovery["id"])
		_append_event(discovery, "legal_source_discovered")
		discoveries.append(discovery.duplicate(true))
	return {"ok": true, "completion": completion, "discoveries": discoveries}


func create_source_review_task(legal_source_id: String, legal_source_version: String,
		scope_id: String, task_id: String, creation_event_id: String, actor_id: String,
		team_id: String) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty(): return _failure(context_error)
	if not _state.legal_sources.has(legal_source_id): return _failure("legal_source_not_available")
	var source: Dictionary = _state.legal_sources[legal_source_id]
	if source["version"] != legal_source_version: return _failure("legal_source_version_mismatch")
	if not _source_has_scope(source, scope_id): return _failure("legal_source_scope_not_authorized")
	var discovery_event_id := _discovery_event_id("", legal_source_id, legal_source_version, team_id)
	if discovery_event_id.is_empty(): return _failure("legal_source_not_discovered")
	var discovery: Dictionary = _state.legal_source_discoveries[discovery_event_id]
	var question: Dictionary = _state.legal_research_questions[discovery["legal_research_question_id"]]
	return _work_service.create_legal_source_review_task(question, task_id, creation_event_id,
		discovery, legal_source_id, legal_source_version, scope_id, actor_id, team_id)


func review_source(review_event_id: String, completion_id: String, task_id: String,
		legal_source_id: String,
		legal_source_version: String, scope_id: String, actor_id: String,
		team_id: String) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty(): return _failure(context_error)
	if _id_exists(review_event_id) or _id_exists(completion_id): return _failure("duplicate_identity")
	if not _state.tasks.has(task_id): return _failure("task_not_found")
	var task: Dictionary = _state.tasks[task_id]
	if task.get("legal_research_work_kind", "") != "source_review":
		return _failure("source_review_task_required")
	if task.get("target_legal_source_id", "") != legal_source_id \
			or task.get("target_legal_source_version", "") != legal_source_version \
			or task.get("target_scope_id", "") != scope_id:
		return _failure("source_review_task_scope_mismatch")
	var discovery_event_id: String = task.get("target_discovery_event_id", "")
	if not _state.legal_source_discoveries.has(discovery_event_id):
		return _failure("legal_source_not_discovered")
	var discovery: Dictionary = _state.legal_source_discoveries[discovery_event_id]
	if int(task.get("created_event_order", 0)) <= int(discovery["event_order"]):
		return _failure("post_discovery_work_required")
	if not _state.legal_sources.has(legal_source_id): return _failure("legal_source_not_available")
	var source: Dictionary = _state.legal_sources[legal_source_id]
	if source["version"] != legal_source_version: return _failure("legal_source_version_mismatch")
	if not _source_has_scope(source, scope_id): return _failure("legal_source_scope_not_authorized")
	var preflight: Dictionary = _work_service.preflight_legal_research_completion(
		task_id, completion_id, actor_id, team_id)
	if not preflight["ok"]: return preflight
	for execution_id in task["execution_ids"]:
		var execution: Dictionary = _state.executions[execution_id]
		if int(execution["event_order"]) <= int(discovery["event_order"]):
			return _failure("post_discovery_work_required")
	# Completion and review materialize only after every provenance check succeeds.
	_work_service.record_legal_research_completion(task_id, completion_id, actor_id, team_id)
	var definition: Dictionary = _state.task_definitions[task["task_definition_id"]]
	var review := {
		"id": review_event_id, "task_id": task_id,
		"task_definition_id": definition["id"],
		"task_definition_version": definition["version"],
		"assignment_id": task["current_assignment_id"],
		"execution_ids": task["execution_ids"].duplicate(),
		"completion_id": completion_id,
		"discovery_event_id": discovery_event_id,
		"legal_research_question_id": discovery["legal_research_question_id"],
		"authored_path_id": discovery["authored_path_id"],
		"legal_source_id": legal_source_id, "legal_source_version": legal_source_version,
		"scope_id": scope_id, "actor_id": actor_id, "team_id": team_id,
		"matter_id": _state.matter["id"], "stage_id": _state.stage["id"],
		"content_version": _state.content_meta["content_version"],
		"event_order": _next_event_order(),
	}
	_state.legal_source_reviews[review_event_id] = review.duplicate(true)
	_state.legal_source_review_order.append(review_event_id)
	_append_event(review, "legal_source_reviewed")
	return {"ok": true, "review": review.duplicate(true)}


func record_extraction(extraction_id: String, recipe_id: String, review_event_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	var common := _validate_recipe_command(extraction_id, recipe_id, "extraction", actor_id, team_id)
	if not common.is_empty(): return _failure(common)
	if not _state.legal_source_reviews.has(review_event_id): return _failure("source_review_required")
	var review: Dictionary = _state.legal_source_reviews[review_event_id]
	if review["team_id"] != team_id: return _failure("source_review_not_authorized")
	var recipe: Dictionary = _state.legal_research_recipes[recipe_id]
	if review["legal_source_id"] != recipe["legal_source_id"] \
			or review["legal_source_version"] != recipe["legal_source_version"] \
			or review["scope_id"] != recipe["scope_id"]:
		return _failure("extraction_review_provenance_mismatch")
	var extraction := _base_record(extraction_id, actor_id, team_id)
	extraction.merge({
		"recipe_id": recipe_id, "recorded_text": recipe["recorded_text"],
		"review_event_id": review_event_id, "task_id": review["task_id"],
		"assignment_id": review["assignment_id"], "execution_ids": review["execution_ids"].duplicate(),
		"completion_id": review["completion_id"],
		"legal_source_id": review["legal_source_id"],
		"legal_source_version": review["legal_source_version"], "scope_id": review["scope_id"],
		"limitations": recipe["limitations"].duplicate(), "epistemic_type": "recorded_legal_extraction",
	})
	_store_record(_state.recorded_legal_extractions, _state.recorded_legal_extraction_order,
		extraction, "legal_extraction_recorded")
	return {"ok": true, "extraction": extraction.duplicate(true)}


func create_rule_statement(rule_id: String, recipe_id: String, extraction_ids: Array,
		actor_id: String, team_id: String) -> Dictionary:
	var common := _validate_recipe_command(rule_id, recipe_id, "rule", actor_id, team_id)
	if not common.is_empty(): return _failure(common)
	var recipe: Dictionary = _state.legal_research_recipes[recipe_id]
	var records := _validate_runtime_recipe_refs(extraction_ids, recipe["extraction_recipe_ids"],
		_state.recorded_legal_extractions, team_id)
	if not records["ok"]: return _failure(records["error"])
	var rule := _base_record(rule_id, actor_id, team_id)
	rule.merge({"recipe_id": recipe_id, "statement": recipe["statement"],
		"recorded_legal_extraction_ids": extraction_ids.duplicate(),
		"legal_source_scope_refs": _source_scope_refs(records["records"]),
		"limitations": recipe["limitations"].duplicate(), "epistemic_type": "rule_statement"})
	_store_record(_state.rule_statements, _state.rule_statement_order, rule, "rule_statement_created")
	return {"ok": true, "rule_statement": rule.duplicate(true)}


func consider_interpretation(interpretation_id: String, recipe_id: String, rule_ids: Array,
		actor_id: String, team_id: String) -> Dictionary:
	var common := _validate_recipe_command(interpretation_id, recipe_id, "interpretation", actor_id, team_id)
	if not common.is_empty(): return _failure(common)
	var recipe: Dictionary = _state.legal_research_recipes[recipe_id]
	var records := _validate_runtime_recipe_refs(rule_ids, recipe["rule_recipe_ids"],
		_state.rule_statements, team_id)
	if not records["ok"]: return _failure(records["error"])
	var interpretation := _base_record(interpretation_id, actor_id, team_id)
	interpretation.merge({"recipe_id": recipe_id, "statement": recipe["statement"],
		"rule_statement_ids": rule_ids.duplicate(), "limitations": recipe["limitations"].duplicate(),
		"epistemic_type": "interpretation_candidate"})
	_store_record(_state.interpretation_candidates, _state.interpretation_candidate_order,
		interpretation, "interpretation_considered")
	return {"ok": true, "interpretation": interpretation.duplicate(true)}


func create_issue_analysis(issue_analysis_id: String, recipe_id: String, task_id: String,
		rule_ids: Array, interpretation_ids: Array, factual_basis_refs: Array,
		actor_id: String, team_id: String) -> Dictionary:
	var common := _validate_recipe_command(issue_analysis_id, recipe_id, "issue_analysis", actor_id, team_id)
	if not common.is_empty(): return _failure(common)
	if not _completed_research_task(task_id, team_id): return _failure("completed_research_required")
	var recipe: Dictionary = _state.legal_research_recipes[recipe_id]
	if not _issue_selected(recipe["issue_id"], team_id): return _failure("selected_issue_required")
	var rules := _validate_runtime_recipe_refs(rule_ids, recipe["rule_recipe_ids"],
		_state.rule_statements, team_id)
	if not rules["ok"]: return _failure(rules["error"])
	var interpretations := _validate_runtime_recipe_refs(interpretation_ids,
		recipe["interpretation_recipe_ids"], _state.interpretation_candidates, team_id)
	if not interpretations["ok"]: return _failure(interpretations["error"])
	for interpretation in interpretations["records"]:
		for derived_rule_id in interpretation["rule_statement_ids"]:
			if derived_rule_id not in rule_ids:
				return _failure("interpretation_rule_provenance_mismatch")
	var factual := _validate_factual_basis(
		factual_basis_refs, recipe.get("factual_basis_requirements", []), team_id)
	if not factual["ok"]: return _failure(factual["error"])
	var task: Dictionary = _state.tasks[task_id]
	if task.get("legal_research_work_kind", "") != "discovery":
		return _failure("completed_research_required")
	var theory := _current_theory(recipe["issue_id"], team_id)
	if theory.is_empty(): return _failure("current_case_theory_required")
	var analysis := _base_record(issue_analysis_id, actor_id, team_id)
	var extraction_ids: Array = []
	var review_event_ids: Array = []
	for rule in rules["records"]:
		for extraction_id in rule["recorded_legal_extraction_ids"]:
			if extraction_id not in extraction_ids: extraction_ids.append(extraction_id)
			var extraction: Dictionary = _state.recorded_legal_extractions[extraction_id]
			var review_id: String = extraction["review_event_id"]
			if not _state.legal_source_reviews.has(review_id):
				return _failure("stale_legal_provenance")
			var review: Dictionary = _state.legal_source_reviews[review_id]
			if not _state.legal_source_discoveries.has(review["discovery_event_id"]) \
					or _state.legal_source_discoveries[review["discovery_event_id"]]["task_id"] != task_id \
					or review["legal_source_id"] != extraction["legal_source_id"] \
					or review["legal_source_version"] != extraction["legal_source_version"] \
					or review["scope_id"] != extraction["scope_id"]:
				return _failure("stale_legal_provenance")
			if review_id not in review_event_ids: review_event_ids.append(review_id)
	analysis.merge({"recipe_id": recipe_id, "issue_id": recipe["issue_id"], "task_id": task_id,
		"assignment_id": task["current_assignment_id"], "execution_ids": task["execution_ids"].duplicate(),
		"completion_id": task["completion_id"], "rule_statement_ids": rule_ids.duplicate(),
		"interpretation_candidate_ids": interpretation_ids.duplicate(),
		"recorded_legal_extraction_ids": extraction_ids, "legal_source_review_event_ids": review_event_ids,
		"legal_source_scope_refs": _source_scope_refs(rules["records"]),
		"factual_basis_refs": factual["records"].duplicate(true),
		"case_theory_id": theory["theory_id"], "case_theory_version_id": theory["version_id"],
		"application": recipe["application"], "assumptions": recipe["assumptions"].duplicate(),
		"challenges": recipe["challenges"].duplicate(), "epistemic_type": "issue_analysis"})
	_store_record(_state.issue_analyses, _state.issue_analysis_order, analysis, "issue_analysis_created")
	return {"ok": true, "issue_analysis": analysis.duplicate(true)}


func create_argument(argument_id: String, recipe_id: String, issue_analysis_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	var common := _validate_recipe_command(argument_id, recipe_id, "argument", actor_id, team_id)
	if not common.is_empty(): return _failure(common)
	if not _state.issue_analyses.has(issue_analysis_id): return _failure("issue_analysis_required")
	var analysis: Dictionary = _state.issue_analyses[issue_analysis_id]
	if analysis["team_id"] != team_id: return _failure("issue_analysis_not_authorized")
	var recipe: Dictionary = _state.legal_research_recipes[recipe_id]
	if analysis["recipe_id"] != recipe["issue_analysis_recipe_id"]:
		return _failure("argument_analysis_provenance_mismatch")
	var theory := _current_theory(recipe["issue_id"], team_id)
	if theory.is_empty(): return _failure("current_case_theory_required")
	if theory["version_id"] != analysis.get("case_theory_version_id", ""):
		return _failure("stale_argument_basis")
	var analysis_recipe: Dictionary = _state.legal_research_recipes[analysis["recipe_id"]]
	var factual := _validate_factual_basis(analysis.get("factual_basis_refs", []),
		analysis_recipe.get("factual_basis_requirements", []), team_id)
	if not factual["ok"]: return _failure("invalid_argument_provenance")
	var factual_review_ids: Array = []
	for basis in factual["records"]:
		if basis["basis_type"] == "ReviewWorkProduct": factual_review_ids.append(basis["id"])
	var expected_review_ids: Array = recipe["review_work_product_ids"].duplicate()
	factual_review_ids.sort(); expected_review_ids.sort()
	if factual_review_ids != expected_review_ids:
		return _failure("invalid_argument_provenance")
	var investigation_result_refs: Array = []
	var acquired_source_refs: Array = []
	for basis in factual["records"]:
		if basis["basis_type"] == "InvestigationResult": investigation_result_refs.append(basis["id"])
		elif basis["basis_type"] == "SourceMaterial": acquired_source_refs.append(basis["id"])
	var argument := _base_record(argument_id, actor_id, team_id)
	argument.merge({"recipe_id": recipe_id, "label": recipe["label"], "position": recipe["position"],
		"issue_id": recipe["issue_id"], "case_theory_id": theory["theory_id"],
		"case_theory_version_id": theory["version_id"], "issue_analysis_id": issue_analysis_id,
		"rule_statement_ids": analysis["rule_statement_ids"].duplicate(),
		"interpretation_candidate_ids": analysis["interpretation_candidate_ids"].duplicate(),
		"recorded_legal_extraction_ids": analysis["recorded_legal_extraction_ids"].duplicate(),
		"legal_source_review_event_ids": analysis["legal_source_review_event_ids"].duplicate(),
		"legal_source_scope_refs": analysis["legal_source_scope_refs"].duplicate(true),
		"review_work_product_ids": recipe["review_work_product_ids"].duplicate(),
		"factual_basis_refs": factual["records"].duplicate(true),
		"investigation_result_ids": investigation_result_refs,
		"acquisition_ids": acquired_source_refs,
		"known_gap_refs": recipe["known_gap_refs"].duplicate(),
		"assumptions": recipe["assumptions"].duplicate(), "challenges": recipe["challenges"].duplicate(),
		"epistemic_type": "argument", "limitations": ["may_be_wrong", "not_a_finding"]})
	_store_record(_state.arguments, _state.argument_order, argument, "argument_created")
	return {"ok": true, "argument": argument.duplicate(true)}


func select_argument(selection_event_id: String, argument_id: String, actor_id: String,
		team_id: String) -> Dictionary:
	var context_error := _validate_actor_context(actor_id, team_id)
	if not context_error.is_empty(): return _failure(context_error)
	if _id_exists(selection_event_id): return _failure("duplicate_identity")
	if not _state.arguments.has(argument_id): return _failure("argument_not_found")
	var argument: Dictionary = _state.arguments[argument_id]
	if argument["team_id"] != team_id: return _failure("argument_not_authorized")
	var current := _current_theory(argument["issue_id"], team_id)
	if current.is_empty() or current["version_id"] != argument["case_theory_version_id"]:
		return _failure("stale_argument_theory_version")
	var selection := _base_record(selection_event_id, actor_id, team_id)
	selection.merge({"argument_id": argument_id, "issue_id": argument["issue_id"],
		"case_theory_id": argument["case_theory_id"],
		"case_theory_version_id": argument["case_theory_version_id"]})
	_store_record(_state.argument_selection_events, _state.argument_selection_order,
		selection, "argument_selected")
	return {"ok": true, "selection_event": selection.duplicate(true)}


func projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	var error := _validate_actor_context(viewer_actor_id, viewer_team_id)
	if not error.is_empty(): return _failure(error)
	var sources: Array = []
	for source_id in _state.legal_source_order:
		var source: Dictionary = _state.legal_sources[source_id]
		if _source_discovered("", source_id, source["version"], viewer_team_id):
			var row := source.duplicate(true)
			row.erase("scopes")
			row["scope_labels"] = []
			for scope in source["scopes"]: row["scope_labels"].append({"id": scope["id"], "label": scope["label"]})
			sources.append(row)
	var current_arguments: Dictionary = {}
	for selection_id in _state.argument_selection_order:
		var selection: Dictionary = _state.argument_selection_events[selection_id]
		if selection["team_id"] == viewer_team_id: current_arguments[selection["issue_id"]] = selection.duplicate(true)
	return {"ok": true, "projection": {
		"questions": _question_rows(),
		"legal_sources": sources,
		"discovery_events": _authorized_records(_state.legal_source_discovery_order, _state.legal_source_discoveries, viewer_team_id),
		"review_events": _authorized_records(_state.legal_source_review_order, _state.legal_source_reviews, viewer_team_id),
		"recorded_legal_extractions": _authorized_records(_state.recorded_legal_extraction_order, _state.recorded_legal_extractions, viewer_team_id),
		"rule_statements": _authorized_records(_state.rule_statement_order, _state.rule_statements, viewer_team_id),
		"interpretation_candidates": _authorized_records(_state.interpretation_candidate_order, _state.interpretation_candidates, viewer_team_id),
		"issue_analyses": _authorized_records(_state.issue_analysis_order, _state.issue_analyses, viewer_team_id),
		"arguments": _authorized_records(_state.argument_order, _state.arguments, viewer_team_id),
		"argument_paths": _argument_path_rows(viewer_team_id),
		"argument_selection_history": _authorized_records(_state.argument_selection_order, _state.argument_selection_events, viewer_team_id),
		"current_argument_selections": current_arguments.duplicate(true),
	}}


func read_source(viewer_actor_id: String, viewer_team_id: String, legal_source_id: String,
		legal_source_version: String, scope_ids: Array) -> Dictionary:
	var error := _validate_actor_context(viewer_actor_id, viewer_team_id)
	if not error.is_empty(): return _failure(error)
	if not _state.legal_sources.has(legal_source_id): return _failure("legal_source_not_available")
	var source: Dictionary = _state.legal_sources[legal_source_id]
	if not _source_discovered("", legal_source_id, legal_source_version, viewer_team_id):
		return _failure("legal_source_not_discovered")
	if source["version"] != legal_source_version: return _failure("legal_source_version_mismatch")
	if scope_ids.is_empty(): return _failure("legal_source_scope_required")
	var rows: Array = []
	var seen: Dictionary = {}
	for scope_id in scope_ids:
		if not scope_id is String or scope_id.is_empty() or seen.has(scope_id): return _failure("invalid_legal_source_scope")
		if not _source_has_scope(source, scope_id): return _failure("legal_source_scope_not_authorized")
		seen[scope_id] = true
		for scope in source["scopes"]:
			if scope["id"] == scope_id: rows.append(scope.duplicate(true))
	return {"ok": true, "legal_source": {"id": source["id"], "version": source["version"],
		"title": source["title"], "citation": source["citation"], "scopes": rows}}


func _validate_research_context(task_id: String, actor_id: String, team_id: String) -> String:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return error
	if not _state.tasks.has(task_id): return "task_not_found"
	var task: Dictionary = _state.tasks[task_id]
	var definition: Dictionary = _state.task_definitions[task["task_definition_id"]]
	if definition["task_family"] != "legal_research": return "task_family_mismatch"
	var question: Dictionary = _state.legal_research_questions[definition["legal_research_question_id"]]
	if not _issue_selected(question["issue_id"], team_id): return "selected_issue_required"
	if _current_theory(question["issue_id"], team_id).is_empty(): return "current_case_theory_required"
	if not _state.review_work_products.has(question["review_work_product_id"]): return "review_work_product_required"
	return ""


func _validate_recipe_command(identity: String, recipe_id: String, recipe_kind: String,
		actor_id: String, team_id: String) -> String:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return error
	if _id_exists(identity): return "duplicate_identity"
	if not _state.legal_research_recipes.has(recipe_id): return "authored_recipe_not_found"
	if _state.legal_research_recipes[recipe_id]["kind"] != recipe_kind: return "authored_recipe_kind_mismatch"
	return ""


func _validate_runtime_recipe_refs(ids: Array, expected_recipe_ids: Array,
		collection: Dictionary, team_id: String) -> Dictionary:
	if ids.size() != expected_recipe_ids.size() or ids.is_empty(): return _failure("required_provenance_mismatch")
	var records: Array = []
	var seen: Dictionary = {}
	var observed_recipes: Array = []
	for identity in ids:
		if not identity is String or identity.is_empty() or seen.has(identity) or not collection.has(identity):
			return _failure("required_provenance_mismatch")
		var record: Dictionary = collection[identity]
		if record["team_id"] != team_id: return _failure("provenance_not_authorized")
		seen[identity] = true
		observed_recipes.append(record["recipe_id"])
		records.append(record)
	var expected := expected_recipe_ids.duplicate(); expected.sort(); observed_recipes.sort()
	if observed_recipes != expected: return _failure("required_provenance_mismatch")
	return {"ok": true, "records": records}


func _completed_research_task(task_id: String, team_id: String) -> bool:
	if not _state.tasks.has(task_id): return false
	var task: Dictionary = _state.tasks[task_id]
	return task["team_id"] == team_id and task["state"] == "completed" \
		and _state.task_definitions[task["task_definition_id"]]["task_family"] == "legal_research"


func _source_discovered(task_id: String, source_id: String, version: String, team_id: String) -> bool:
	for identity in _state.legal_source_discovery_order:
		var event: Dictionary = _state.legal_source_discoveries[identity]
		if event["team_id"] == team_id and event["legal_source_id"] == source_id \
				and event["legal_source_version"] == version and (task_id.is_empty() or event["task_id"] == task_id):
			return true
	return false


func _discovery_event_id(task_id: String, source_id: String, version: String, team_id: String) -> String:
	for identity in _state.legal_source_discovery_order:
		var event: Dictionary = _state.legal_source_discoveries[identity]
		if (task_id.is_empty() or event["task_id"] == task_id) and event["team_id"] == team_id \
				and event["legal_source_id"] == source_id and event["legal_source_version"] == version:
			return identity
	return ""


func _validate_factual_basis(refs: Array, requirements: Array, team_id: String) -> Dictionary:
	if refs.size() != requirements.size():
		return {"ok": false, "error": "factual_basis_mismatch"}
	var resolved: Array = []
	var seen: Dictionary = {}
	for requirement in requirements:
		if not requirement is Dictionary or not requirement.has("basis_type"):
			return {"ok": false, "error": "invalid_factual_basis_requirement"}
		var matched_ref: Dictionary = {}
		for ref_value in refs:
			if not ref_value is Dictionary: continue
			var ref: Dictionary = ref_value
			if ref.get("basis_type", "") == requirement["basis_type"] and matched_ref.is_empty():
				matched_ref = ref
		if matched_ref.is_empty() or not matched_ref.get("id", "") is String or matched_ref["id"].is_empty() \
				or seen.has(matched_ref["basis_type"] + "|" + matched_ref["id"]):
			return {"ok": false, "error": "factual_basis_mismatch"}
		seen[matched_ref["basis_type"] + "|" + matched_ref["id"]] = true
		var record := _resolve_factual_basis(matched_ref, requirement, team_id)
		if not record["ok"]: return record
		resolved.append(record["record"])
	var investigation_ids: Array = []
	for basis in resolved:
		if basis["basis_type"] == "InvestigationResult": investigation_ids.append(basis["id"])
	for basis in resolved:
		if basis["basis_type"] == "SourceMaterial" \
				and basis["investigation_result_id"] not in investigation_ids:
			return {"ok": false, "error": "factual_basis_chain_mismatch"}
	return {"ok": true, "records": resolved}


func _resolve_factual_basis(ref: Dictionary, requirement: Dictionary, team_id: String) -> Dictionary:
	var basis_type: String = ref["basis_type"]
	var record: Dictionary = {}
	if basis_type == "ReviewWorkProduct":
		if not _state.review_work_products.has(ref["id"]):
			return {"ok": false, "error": "review_work_product_basis_required"}
		var work_product: Dictionary = _state.review_work_products[ref["id"]]
		if requirement.get("id", "") != ref["id"]: return {"ok": false, "error": "factual_basis_mismatch"}
		if work_product["team_id"] != team_id \
				or work_product["matter_id"] != _state.matter["id"] \
				or work_product["stage_id"] != _state.stage["id"]:
			return {"ok": false, "error": "factual_basis_not_authorized"}
		record = {"basis_type": basis_type, "id": ref["id"], "task_id": work_product["task_id"],
			"matter_id": work_product["matter_id"], "stage_id": work_product["stage_id"]}
	elif basis_type == "InvestigationResult":
		if not _state.investigation_results.has(ref["id"]):
			return {"ok": false, "error": "investigation_result_basis_required"}
		var result: Dictionary = _state.investigation_results[ref["id"]]
		if result["team_id"] != team_id or result["matter_id"] != _state.matter["id"] \
				or result["stage_id"] != _state.stage["id"] \
				or result["investigation_action_id"] != requirement.get("investigation_action_id", ""):
			return {"ok": false, "error": "factual_basis_mismatch"}
		record = {"basis_type": basis_type, "id": ref["id"], "task_id": result["task_id"],
			"investigation_action_id": result["investigation_action_id"], "outcome": result["outcome"],
			"matter_id": result["matter_id"], "stage_id": result["stage_id"]}
	elif basis_type == "SourceMaterial":
		var acquisition: Dictionary = {}
		for candidate in _state.acquisitions:
			if candidate["id"] == ref["id"]: acquisition = candidate; break
		if acquisition.is_empty(): return {"ok": false, "error": "source_material_basis_required"}
		if acquisition["team_id"] != team_id \
				or acquisition["matter_id"] != _state.matter["id"] \
				or acquisition["stage_id"] != _state.stage["id"] \
				or acquisition["source_id"] != requirement.get("source_id", "") \
				or acquisition["source_version"] != requirement.get("source_version", "") \
				or acquisition["scopes"] != requirement.get("scope_ids", []):
			return {"ok": false, "error": "factual_basis_mismatch"}
		record = {"basis_type": basis_type, "id": ref["id"],
			"source_id": acquisition["source_id"], "source_version": acquisition["source_version"],
			"scope_ids": acquisition["scopes"].duplicate(),
			"investigation_result_id": acquisition["investigation_result_id"],
			"matter_id": acquisition["matter_id"], "stage_id": acquisition["stage_id"]}
	else:
		return {"ok": false, "error": "unsupported_factual_basis_type"}
	return {"ok": true, "record": record}


func _issue_selected(issue_id: String, team_id: String) -> bool:
	for identity in _state.issue_selection_order:
		var event: Dictionary = _state.issue_selections[identity]
		if event["issue_id"] == issue_id and event["team_id"] == team_id: return true
	return false


func _current_theory(issue_id: String, team_id: String) -> Dictionary:
	for theory_id in _state.theory_lineages:
		var lineage: Dictionary = _state.theory_lineages[theory_id]
		var theory: Dictionary = _state.case_theories[lineage["current_version_id"]]
		if theory["team_id"] == team_id and theory["issue_id"] == issue_id: return theory
	return {}


func _source_has_scope(source: Dictionary, scope_id: String) -> bool:
	for scope in source["scopes"]:
		if scope["id"] == scope_id: return true
	return false


func _base_record(identity: String, actor_id: String, team_id: String) -> Dictionary:
	return {"id": identity, "actor_id": actor_id, "team_id": team_id,
		"matter_id": _state.matter["id"], "stage_id": _state.stage["id"],
		"content_version": _state.content_meta["content_version"], "event_order": _next_event_order()}


func _store_record(collection: Dictionary, order: Array, record: Dictionary, kind: String) -> void:
	collection[record["id"]] = record.duplicate(true)
	order.append(record["id"])
	_append_event(record, kind)


func _source_scope_refs(records: Array) -> Array:
	var result: Array = []
	var seen: Dictionary = {}
	for record in records:
		if record.has("legal_source_scope_refs"):
			for ref in record["legal_source_scope_refs"]:
				var key := "%s|%s|%s" % [ref["legal_source_id"], ref["legal_source_version"], ref["scope_id"]]
				if not seen.has(key): seen[key] = true; result.append(ref.duplicate(true))
		elif record.has("legal_source_id"):
			var ref := {"legal_source_id": record["legal_source_id"],
				"legal_source_version": record["legal_source_version"], "scope_id": record["scope_id"]}
			var key := "%s|%s|%s" % [ref["legal_source_id"], ref["legal_source_version"], ref["scope_id"]]
			if not seen.has(key): seen[key] = true; result.append(ref)
	return result


func _ordered_authored(order: Array, collection: Dictionary) -> Array:
	var result: Array = []
	for identity in order: result.append(collection[identity].duplicate(true))
	return result


func _question_rows() -> Array:
	var result: Array = []
	for identity in _state.legal_research_question_order:
		var question: Dictionary = _state.legal_research_questions[identity]
		result.append({"id": question["id"], "label": question["label"],
			"question": question["question"], "bounded_domain": question["bounded_domain"],
			"issue_id": question["issue_id"], "task_definition_id": question["task_definition_id"]})
	return result


func _argument_path_rows(team_id: String) -> Array:
	var result: Array = []
	for recipe_id in _state.legal_research_recipes:
		var argument: Dictionary = _state.legal_research_recipes[recipe_id]
		if argument["kind"] != "argument": continue
		var analysis: Dictionary = _state.legal_research_recipes[argument["issue_analysis_recipe_id"]]
		var interpretation: Dictionary = _state.legal_research_recipes[analysis["interpretation_recipe_ids"][0]]
		var rule: Dictionary = _state.legal_research_recipes[analysis["rule_recipe_ids"][0]]
		var extraction: Dictionary = _state.legal_research_recipes[rule["extraction_recipe_ids"][0]]
		if not _source_discovered("", extraction["legal_source_id"], extraction["legal_source_version"], team_id):
			continue
		result.append({"id": argument["id"], "label": argument["label"],
			"extraction_recipe_id": extraction["id"], "rule_recipe_id": rule["id"],
			"interpretation_recipe_id": interpretation["id"], "issue_analysis_recipe_id": analysis["id"],
			"argument_recipe_id": argument["id"], "legal_source_id": extraction["legal_source_id"],
			"legal_source_version": extraction["legal_source_version"], "scope_id": extraction["scope_id"]})
	result.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a["id"] < b["id"])
	return result


func _authorized_records(order: Array, collection: Dictionary, team_id: String) -> Array:
	var result: Array = []
	for identity in order:
		if collection[identity]["team_id"] == team_id: result.append(collection[identity].duplicate(true))
	return result


func _validate_actor_context(actor_id: String, team_id: String) -> String:
	if _state == null or not _state.initialized: return "session_not_started"
	if actor_id != _state.session["player_actor_id"] or team_id != _state.session["player_team_id"]:
		return "viewer_not_authorized"
	return ""


func _id_exists(identity: String) -> bool:
	if identity.is_empty(): return true
	for collection in [_state.actors, _state.teams, _state.sources, _state.assertions,
		_state.known_gaps, _state.procedural_statuses, _state.task_definitions, _state.tasks,
		_state.assignments, _state.executions, _state.completions, _state.review_work_products,
		_state.issues, _state.review_analysis_options, _state.issue_selections, _state.case_theories,
		_state.theory_lineages, _state.investigation_actions, _state.investigation_results,
		_state.legal_sources, _state.legal_research_questions, _state.legal_research_recipes,
		_state.legal_source_discoveries, _state.legal_source_reviews,
		_state.recorded_legal_extractions, _state.rule_statements,
		_state.interpretation_candidates, _state.issue_analyses, _state.arguments,
		_state.argument_selection_events]:
		if collection.has(identity): return true
	for event in _state.journal:
		if event["id"] == identity: return true
	for acquisition in _state.acquisitions:
		if acquisition["id"] == identity: return true
	return identity in [_state.content_meta.get("content_id", ""), _state.session.get("id", ""),
		_state.matter.get("id", ""), _state.stage.get("id", "")]


func _next_event_order() -> int:
	var highest := 0
	for event in _state.journal: highest = maxi(highest, int(event["event_order"]))
	return highest + 1


func _append_event(source: Dictionary, kind: String) -> void:
	var event := source.duplicate(true); event["kind"] = kind; _state.journal.append(event)


func _failure(error: String) -> Dictionary:
	return {"ok": false, "error": error}
