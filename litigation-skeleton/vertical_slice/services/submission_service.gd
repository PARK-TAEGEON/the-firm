extends RefCounted

# Owns only the accepted VS-005 FinalizedDocument -> CourtRecordEntry boundary.
var _state


func bind_state(state) -> void:
	_state = state


func finalize_document(document_id: String, document_version: String,
		draft_work_product_id: String, actor_id: String, team_id: String) -> Dictionary:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return _failure(error)
	if document_id.is_empty(): return _failure("invalid_document_id")
	if document_version.is_empty(): return _failure("invalid_document_version")
	if not _state.draft_work_products.has(draft_work_product_id):
		return _failure("completed_draft_work_product_required")
	var draft: Dictionary = _state.draft_work_products[draft_work_product_id]
	if draft["team_id"] != team_id or draft["matter_id"] != _state.matter["id"] \
			or draft["stage_id"] != _state.stage["id"]:
		return _failure("draft_work_product_not_authorized")
	if not _state.tasks.has(draft["task_id"]) or _state.tasks[draft["task_id"]]["state"] != "completed":
		return _failure("drafting_task_not_completed")
	var lineage_exists: bool = _state.finalized_documents.has(document_id)
	if lineage_exists:
		var versions: Dictionary = _state.finalized_documents[document_id]
		if versions.has(document_version): return _failure("duplicate_finalized_document_version")
		var first: Dictionary = versions[versions.keys()[0]]
		if first["matter_id"] != draft["matter_id"] or first["stage_id"] != draft["stage_id"] \
				or first["team_id"] != draft["team_id"] or first["document_type"] != draft["document_type"]:
			return _failure("finalized_document_lineage_scope_mismatch")
		for existing: Dictionary in versions.values():
			if existing["draft_work_product_id"] == draft_work_product_id \
					and existing["draft_work_product_version"] == draft["version"]:
				return _failure("draft_work_product_version_already_finalized")
	elif _id_exists(document_id):
		return _failure("duplicate_identity")
	var finalized_event_id := _finalized_event_id(document_id, document_version)
	if _id_exists(finalized_event_id): return _failure("duplicate_identity")
	var document := {
		"document_id": document_id, "document_version": document_version,
		"id": document_id, "version": document_version,
		"draft_work_product_id": draft_work_product_id,
		"draft_work_product_version": draft["version"], "drafting_task_id": draft["task_id"],
		"drafting_completion_id": draft["completion_id"], "document_type": draft["document_type"],
		"matter_id": draft["matter_id"], "stage_id": draft["stage_id"],
		"finalized_by_actor_id": actor_id, "team_id": team_id,
		"case_theory_id": draft["case_theory_id"],
		"case_theory_version_id": draft["case_theory_version_id"],
		"issue_id": draft["issue_id"], "issue_analysis_id": draft["issue_analysis_id"],
		"argument_id": draft["argument_id"],
		"argument_selection_event_id": draft["argument_selection_event_id"],
		"factual_basis_refs": draft["factual_basis_refs"].duplicate(true),
		"rule_statement_ids": draft["rule_statement_ids"].duplicate(),
		"interpretation_candidate_ids": draft["interpretation_candidate_ids"].duplicate(),
		"recorded_legal_extraction_ids": draft["recorded_legal_extraction_ids"].duplicate(),
		"legal_source_review_event_ids": draft["legal_source_review_event_ids"].duplicate(),
		"package_member_ids": draft["package_member_ids"].duplicate(),
		"assertion_payload": draft["assertion_payload"].duplicate(true),
		"content_version": _state.content_meta["content_version"],
		"event_order": _next_event_order(),
	}
	if not lineage_exists: _state.finalized_documents[document_id] = {}
	_state.finalized_documents[document_id][document_version] = document.duplicate(true)
	_state.finalized_document_order.append({"document_id": document_id,
		"document_version": document_version})
	var event: Dictionary = document.duplicate(true)
	event["id"] = finalized_event_id
	_append_event(event, "document_finalized")
	return {"ok": true, "finalized_document": document.duplicate(true)}


func create_submission_attempt(attempt_id: String, document_id: String, document_version: String,
		rule_id: String, target_id: String, route_id: String, package_member_ids: Array,
		deadline_context_id: String, actor_id: String, team_id: String) -> Dictionary:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return _failure(error)
	if _id_exists(attempt_id): return _failure("duplicate_identity")
	var resolved := _resolve_finalized_document(document_id, document_version)
	if not resolved["ok"]: return resolved
	var document: Dictionary = resolved["document"]
	if document["team_id"] != team_id or document["matter_id"] != _state.matter["id"] \
			or document["stage_id"] != _state.stage["id"]:
		return _failure("document_not_authorized")
	if not _state.submission_rules.has(rule_id): return _failure("submission_rule_not_found")
	var rule: Dictionary = _state.submission_rules[rule_id]
	if rule["matter_id"] != document["matter_id"] or rule["stage_id"] != document["stage_id"] \
			or rule["document_type"] != document["document_type"]:
		return _failure("submission_rule_scope_mismatch")
	if rule["target_id"] != target_id: return _failure("unauthorized_submission_target")
	if rule["route_id"] != route_id: return _failure("unauthorized_submission_route")
	if not _state.deadline_contexts.has(deadline_context_id): return _failure("deadline_context_not_found")
	var deadline: Dictionary = _state.deadline_contexts[deadline_context_id]
	if deadline["matter_id"] != document["matter_id"] or deadline["stage_id"] != document["stage_id"]:
		return _failure("deadline_context_scope_mismatch")
	var package_error := _validate_package(package_member_ids, document["matter_id"])
	if not package_error.is_empty(): return _failure(package_error)
	var attempt := {
		"id": attempt_id, "document_id": document_id, "document_version": document_version,
		"submitter_actor_id": actor_id, "actor_id": actor_id, "team_id": team_id,
		"matter_id": document["matter_id"], "stage_id": document["stage_id"],
		"document_type": document["document_type"], "target_id": target_id,
		"route_id": route_id, "package_member_ids": package_member_ids.duplicate(),
		"submission_rule_id": rule_id, "deadline_context_id": deadline_context_id,
		"content_version": _state.content_meta["content_version"],
		"event_order": _next_event_order(),
	}
	_state.submission_attempts[attempt_id] = attempt.duplicate(true)
	_state.submission_attempt_order.append(attempt_id)
	_append_event(attempt, "submission_attempted")
	return {"ok": true, "submission_attempt": attempt.duplicate(true)}


func materialize_procedural_result(result_id: String, attempt_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return _failure(error)
	if _id_exists(result_id): return _failure("duplicate_identity")
	if not _state.submission_attempts.has(attempt_id): return _failure("submission_attempt_not_found")
	var attempt: Dictionary = _state.submission_attempts[attempt_id]
	if attempt["team_id"] != team_id or attempt["actor_id"] != actor_id:
		return _failure("attempt_not_authorized")
	for existing_id in _state.procedural_result_order:
		if _state.procedural_results[existing_id]["submission_attempt_id"] == attempt_id:
			return _failure("attempt_already_resolved")
	var rule: Dictionary = _state.submission_rules[attempt["submission_rule_id"]]
	var missing: Array = []
	for required_id in rule["required_package_member_ids"]:
		if required_id not in attempt["package_member_ids"]: missing.append(required_id)
	var kind := "accepted_for_record" if missing.is_empty() else "rejected_defective"
	var reason := "package_complete" if missing.is_empty() else "missing_required_package_member"
	var result := {
		"id": result_id, "submission_attempt_id": attempt_id,
		"submission_rule_id": attempt["submission_rule_id"], "document_id": attempt["document_id"],
		"document_version": attempt["document_version"], "kind": kind, "reason": reason,
		"missing_package_member_ids": missing, "evaluated_package_member_ids": attempt["package_member_ids"].duplicate(),
		"actor_id": actor_id, "team_id": team_id, "matter_id": attempt["matter_id"],
		"stage_id": attempt["stage_id"], "content_version": attempt["content_version"],
		"event_order": _next_event_order(),
	}
	_state.procedural_results[result_id] = result.duplicate(true)
	_state.procedural_result_order.append(result_id)
	_append_event(result, "procedural_result_materialized")
	return {"ok": true, "procedural_result": result.duplicate(true)}


func materialize_court_record(materialization_event_id: String, entry_id: String,
		document_id: String, document_version: String, attempt_id: String, result_id: String,
		inclusion_rule_id: String, actor_id: String, team_id: String) -> Dictionary:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return _failure(error)
	if _id_exists(materialization_event_id) or _id_exists(entry_id): return _failure("duplicate_identity")
	var resolved := _resolve_finalized_document(document_id, document_version)
	if not resolved["ok"]: return resolved
	if not _state.submission_attempts.has(attempt_id): return _failure("submission_attempt_not_found")
	if not _state.procedural_results.has(result_id): return _failure("procedural_result_not_found")
	if not _state.record_inclusion_rules.has(inclusion_rule_id): return _failure("record_inclusion_rule_not_found")
	var document: Dictionary = resolved["document"]
	var attempt: Dictionary = _state.submission_attempts[attempt_id]
	var result: Dictionary = _state.procedural_results[result_id]
	var rule: Dictionary = _state.record_inclusion_rules[inclusion_rule_id]
	if document["version"] != document_version or attempt["document_id"] != document_id \
			or attempt["document_version"] != document_version or result["submission_attempt_id"] != attempt_id \
			or result["document_id"] != document_id or result["document_version"] != document_version:
		return _failure("materialization_provenance_mismatch")
	if document["team_id"] != team_id or attempt["team_id"] != team_id or result["team_id"] != team_id:
		return _failure("materialization_not_authorized")
	if result["kind"] != "accepted_for_record": return _failure("procedural_result_ineligible")
	if rule["eligible_result_kind"] != result["kind"] or rule["matter_id"] != attempt["matter_id"] \
			or rule["stage_id"] != attempt["stage_id"] or rule["document_type"] != attempt["document_type"] \
			or rule["target_id"] != attempt["target_id"] or rule["route_id"] != attempt["route_id"]:
		return _failure("record_inclusion_rule_mismatch")
	for existing_id in _state.record_materialization_order:
		var existing: Dictionary = _state.record_materialization_events[existing_id]
		if existing["procedural_result_id"] == result_id and existing["record_inclusion_rule_id"] == inclusion_rule_id:
			return _failure("result_rule_already_materialized")
	var event_order := _next_event_order()
	var event := {
		"id": materialization_event_id, "court_record_entry_id": entry_id,
		"document_id": document_id, "document_version": document_version,
		"submission_attempt_id": attempt_id, "procedural_result_id": result_id,
		"record_inclusion_rule_id": inclusion_rule_id, "actor_id": actor_id, "team_id": team_id,
		"matter_id": attempt["matter_id"], "stage_id": attempt["stage_id"],
		"content_version": attempt["content_version"], "event_order": event_order,
	}
	var entry := event.duplicate(true)
	entry["id"] = entry_id
	entry["event_order"] = event_order + 1
	entry["record_materialization_event_id"] = materialization_event_id
	entry.erase("court_record_entry_id")
	entry["document_type"] = document["document_type"]
	entry["assertion_payload"] = document["assertion_payload"].duplicate(true)
	entry["case_theory_id"] = document["case_theory_id"]
	entry["case_theory_version_id"] = document["case_theory_version_id"]
	entry["issue_analysis_id"] = document["issue_analysis_id"]
	entry["argument_id"] = document["argument_id"]
	entry["argument_selection_event_id"] = document["argument_selection_event_id"]
	_state.record_materialization_events[materialization_event_id] = event.duplicate(true)
	_state.record_materialization_order.append(materialization_event_id)
	_state.court_record_entries[entry_id] = entry.duplicate(true)
	_state.court_record_entry_order.append(entry_id)
	_append_event(event, "court_record_materialized")
	_append_event(entry, "court_record_entry_created")
	return {"ok": true, "record_materialization_event": event.duplicate(true),
		"court_record_entry": entry.duplicate(true)}


func projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	var error := _validate_actor_context(viewer_actor_id, viewer_team_id)
	if not error.is_empty(): return _failure(error)
	return {"ok": true, "projection": {
		"draft_work_products": _authorized(_state.draft_work_product_order, _state.draft_work_products, viewer_team_id),
		"finalized_documents": _authorized_finalized_documents(viewer_team_id),
		"submission_attempts": _authorized(_state.submission_attempt_order, _state.submission_attempts, viewer_team_id),
		"procedural_results": _authorized(_state.procedural_result_order, _state.procedural_results, viewer_team_id),
		"record_materialization_events": _authorized(_state.record_materialization_order, _state.record_materialization_events, viewer_team_id),
		"court_record_entries": _authorized(_state.court_record_entry_order, _state.court_record_entries, viewer_team_id),
		"submission_contexts": _submission_contexts(),
	}}


func _submission_contexts() -> Array:
	var rows: Array = []
	for rule_id in _state.submission_rule_order:
		var rule: Dictionary = _state.submission_rules[rule_id]
		rows.append({"submission_rule_id": rule_id, "matter_id": rule["matter_id"],
			"stage_id": rule["stage_id"], "document_type": rule["document_type"],
			"target_id": rule["target_id"], "route_id": rule["route_id"],
			"required_package_member_ids": rule["required_package_member_ids"].duplicate(),
			"deadline_context_id": rule["deadline_context_id"],
			"record_inclusion_rule_id": rule["record_inclusion_rule_id"]})
	return rows


func _authorized(order: Array, collection: Dictionary, team_id: String) -> Array:
	var rows: Array = []
	for identity in order:
		if collection[identity]["team_id"] == team_id: rows.append(collection[identity].duplicate(true))
	return rows


func _authorized_finalized_documents(team_id: String) -> Array:
	var rows: Array = []
	for ref_value in _state.finalized_document_order:
		var ref: Dictionary = ref_value
		var document: Dictionary = _state.finalized_documents[ref["document_id"]][ref["document_version"]]
		if document["team_id"] == team_id: rows.append(document.duplicate(true))
	return rows


func _resolve_finalized_document(document_id: String, document_version: String) -> Dictionary:
	if not _state.finalized_documents.has(document_id): return _failure("finalized_document_required")
	var versions: Dictionary = _state.finalized_documents[document_id]
	if not versions.has(document_version): return _failure("document_version_mismatch")
	return {"ok": true, "document": versions[document_version].duplicate(true)}


func _finalized_event_id(document_id: String, document_version: String) -> String:
	return "FinalizedDocument|%d:%s|%d:%s" % [document_id.length(), document_id,
		document_version.length(), document_version]


func _validate_package(member_ids: Array, matter_id: String) -> String:
	if not member_ids is Array: return "invalid_submission_package"
	var seen: Dictionary = {}
	for member_id in member_ids:
		if not member_id is String or member_id.is_empty() or seen.has(member_id):
			return "invalid_submission_package"
		if not _state.package_members.has(member_id): return "unknown_package_member"
		if _state.package_members[member_id]["matter_id"] != matter_id: return "foreign_matter_package_member"
		seen[member_id] = true
	return ""


func _validate_actor_context(actor_id: String, team_id: String) -> String:
	if not _state.initialized: return "session_not_started"
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
		_state.recorded_legal_extractions, _state.rule_statements, _state.interpretation_candidates,
		_state.issue_analyses, _state.arguments, _state.argument_selection_events,
		_state.submission_rules, _state.record_inclusion_rules, _state.package_members,
		_state.deadline_contexts, _state.draft_work_products, _state.finalized_documents,
		_state.submission_attempts, _state.procedural_results, _state.record_materialization_events,
		_state.court_record_entries]:
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
	var event: Dictionary = source.duplicate(true)
	event["kind"] = kind
	_state.journal.append(event)


func _failure(error: String) -> Dictionary:
	return {"ok": false, "error": error}
