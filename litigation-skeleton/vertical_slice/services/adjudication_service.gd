extends RefCounted

# Owns only the Accepted VS-006 fixture-bounded snapshot and fact-finding mutations.
const FACT_ID := "VS-FACT-APPROVAL-001"
const FACT_VERSION := "1"
const CRITERION_ID := "VS-CRITERION-APPROVAL-001"
const CRITERION_VERSION := "1"
const MATTER_ID := "VS-CASE-001"
const STAGE_ID := "VS-STAGE-001"
const SCOPE_ID := "approval_act"
const FACT_STATEMENT := "상대방 담당자가 목표 납품일 변경안을 승인했다."
const INCLUSION_RULE_ID := "VS-RECORD-RULE-001"
const SOURCE_ID := "VS-SOURCE-APPROVAL-001"
const SOURCE_VERSION := "1"
const SOURCE_SCOPE_ID := "approval_text"

var _state


func bind_state(state) -> void:
	_state = state


func capture_court_record_snapshot(snapshot_id: String, matter_id: String, stage_id: String,
		actor_id: String, team_id: String) -> Dictionary:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return _failure(error)
	if matter_id != MATTER_ID or matter_id != _state.matter.get("id", ""):
		return _failure("snapshot_matter_mismatch")
	if stage_id != STAGE_ID or stage_id != _state.stage.get("id", ""):
		return _failure("snapshot_stage_mismatch")
	if _id_exists(snapshot_id): return _failure("duplicate_identity")

	var refs: Array = []
	for event_id_value in _state.record_materialization_order:
		var event_id: String = event_id_value
		if not _state.record_materialization_events.has(event_id):
			return _failure("corrupt_record_materialization_reference")
		var validated := _validate_eligible_event(event_id)
		if not validated["ok"]: return validated
		if validated["eligible"]:
			var entry: Dictionary = validated["entry"]
			refs.append({"id": entry["id"], "event_order": entry["event_order"]})

	var event_order := _next_event_order()
	var snapshot := {
		"id": snapshot_id, "matter_id": matter_id, "stage_id": stage_id,
		"eligibility_rule_ref": INCLUSION_RULE_ID,
		"court_record_entry_refs": refs.duplicate(true),
		"captured_by_actor_id": actor_id, "team_id": team_id,
		"content_version": _state.content_meta["content_version"],
		"event_order": event_order,
	}
	_state.court_record_snapshots[snapshot_id] = snapshot.duplicate(true)
	_state.court_record_snapshot_order.append(snapshot_id)
	_append_event(snapshot, "court_record_snapshot_created")
	return {"ok": true, "court_record_snapshot": snapshot.duplicate(true)}


func evaluate_fact_proposition(evaluation_id: String, finding_id: String, snapshot_id: String,
		fact_id: String, fact_version: String, criterion_id: String, criterion_version: String,
		actor_id: String, team_id: String) -> Dictionary:
	var error := _validate_actor_context(actor_id, team_id)
	if not error.is_empty(): return _failure(error)
	if _id_exists(evaluation_id) or _id_exists(finding_id) or evaluation_id == finding_id:
		return _failure("duplicate_identity")
	if not _state.court_record_snapshots.has(snapshot_id): return _failure("snapshot_not_found")
	if not _state.fact_propositions.has(fact_id): return _failure("fact_not_found")
	if not _state.fact_propositions[fact_id].has(fact_version): return _failure("fact_version_mismatch")
	if not _state.recognition_criteria.has(criterion_id): return _failure("criterion_not_found")
	if not _state.recognition_criteria[criterion_id].has(criterion_version):
		return _failure("criterion_version_mismatch")
	if fact_id != FACT_ID or fact_version != FACT_VERSION:
		return _failure("fact_binding_mismatch")
	if criterion_id != CRITERION_ID or criterion_version != CRITERION_VERSION:
		return _failure("criterion_binding_mismatch")

	var snapshot: Dictionary = _state.court_record_snapshots[snapshot_id]
	var fact: Dictionary = _state.fact_propositions[fact_id][fact_version]
	var criterion: Dictionary = _state.recognition_criteria[criterion_id][criterion_version]
	if not _valid_fixture_definition(fact, criterion): return _failure("invalid_fixture_definition")
	if snapshot.get("matter_id", "") != fact["matter_id"] \
			or snapshot.get("stage_id", "") != fact["stage_id"] \
			or snapshot.get("eligibility_rule_ref", "") != INCLUSION_RULE_ID \
			or snapshot.get("team_id", "") != team_id:
		return _failure("snapshot_binding_mismatch")
	var canonical_refs := _canonical_snapshot_refs(snapshot)
	if not canonical_refs["ok"]: return canonical_refs
	if snapshot.get("court_record_entry_refs") != canonical_refs["refs"]:
		return _failure("corrupt_snapshot_entry_reference")

	var evidence_uses: Array = []
	var lineage_seen := false
	for ref_value in snapshot.get("court_record_entry_refs", []):
		if not ref_value is Dictionary: return _failure("corrupt_snapshot_entry_reference")
		var ref: Dictionary = ref_value
		var entry_id: String = ref.get("id", "")
		if not _state.court_record_entries.has(entry_id):
			return _failure("corrupt_snapshot_entry_reference")
		var entry: Dictionary = _state.court_record_entries[entry_id]
		if entry.get("event_order", -1) != ref.get("event_order", -2):
			return _failure("corrupt_snapshot_entry_reference")
		var event_id: String = entry.get("record_materialization_event_id", "")
		var validated := _validate_eligible_event(event_id)
		if not validated["ok"] or not validated.get("eligible", false) \
				or validated["entry"].get("id", "") != entry_id:
			return _failure("corrupt_snapshot_entry_reference")
		if lineage_seen: continue
		for basis_value in entry.get("factual_basis_refs", []):
			if not basis_value is Dictionary: continue
			var basis: Dictionary = basis_value
			if basis.get("basis_type", "") == "SourceMaterial" \
					and basis.get("source_id", "") == SOURCE_ID \
					and str(basis.get("source_version", "")) == SOURCE_VERSION \
					and SOURCE_SCOPE_ID in basis.get("scope_ids", []):
				lineage_seen = true
				evidence_uses.append({
					"source_lineage": SOURCE_ID + "/" + SOURCE_VERSION,
					"court_record_entry_id": entry_id,
					"target_scope_id": SCOPE_ID, "role": "supports",
					"relevance_reason": "authored_exact_approval_scope_match",
					"credibility_state": "accepted_for_scope",
				})
				break

	var satisfied := not evidence_uses.is_empty()
	var status := "recognized" if satisfied else "not_established_on_record"
	var reason := "approval_source_requirement_satisfied" if satisfied \
			else "approval_source_required_scope_missing"
	var recognized_scopes: Array = [SCOPE_ID] if satisfied else []
	var trace_order := _next_event_order()
	var trace := {
		"id": evaluation_id, "matter_id": MATTER_ID, "stage_id": STAGE_ID,
		"snapshot_id": snapshot_id, "fact_id": FACT_ID, "fact_version": FACT_VERSION,
		"evaluated_scope_ids": [SCOPE_ID], "criterion_id": CRITERION_ID,
		"criterion_version": CRITERION_VERSION, "evidence_uses": evidence_uses.duplicate(true),
		"requirement_outcomes": [{"requirement_id": "approval_source_in_allowed_record",
			"target_scope_id": SCOPE_ID, "satisfied": satisfied}],
		"finding_status": status, "reason_refs": [reason],
		"evaluated_by_actor_id": actor_id, "team_id": team_id,
		"content_version": _state.content_meta["content_version"], "event_order": trace_order,
	}
	var finding := {
		"id": finding_id, "evaluation_id": evaluation_id, "matter_id": MATTER_ID,
		"stage_id": STAGE_ID, "snapshot_id": snapshot_id, "fact_id": FACT_ID,
		"fact_version": FACT_VERSION, "evaluated_scope_ids": [SCOPE_ID],
		"criterion_id": CRITERION_ID, "criterion_version": CRITERION_VERSION,
		"status": status, "recognized_scope_ids": recognized_scopes.duplicate(),
		"reason_refs": [reason], "found_by_actor_id": actor_id, "team_id": team_id,
		"content_version": _state.content_meta["content_version"],
		"event_order": trace_order + 1,
	}
	_state.sufficiency_evaluation_traces[evaluation_id] = trace.duplicate(true)
	_state.sufficiency_evaluation_trace_order.append(evaluation_id)
	_state.court_fact_findings[finding_id] = finding.duplicate(true)
	_state.court_fact_finding_order.append(finding_id)
	_append_event(trace, "sufficiency_evaluation_created")
	_append_event(finding, "court_fact_finding_created")
	return {"ok": true, "sufficiency_evaluation_trace": trace.duplicate(true),
		"court_fact_finding": finding.duplicate(true)}


func _canonical_snapshot_refs(snapshot: Dictionary) -> Dictionary:
	var snapshot_event_order := int(snapshot.get("event_order", -1))
	if snapshot_event_order < 0:
		return _failure("corrupt_snapshot_entry_reference")
	var refs: Array = []
	for event_id_value in _state.record_materialization_order:
		var event_id: String = event_id_value
		if not _state.record_materialization_events.has(event_id):
			return _failure("corrupt_record_materialization_reference")
		var event: Dictionary = _state.record_materialization_events[event_id]
		if int(event.get("event_order", -1)) >= snapshot_event_order:
			continue
		var validated := _validate_eligible_event(event_id)
		if not validated["ok"]: return validated
		if validated["eligible"]:
			var entry: Dictionary = validated["entry"]
			if int(entry.get("event_order", -1)) >= snapshot_event_order:
				return _failure("corrupt_snapshot_entry_reference")
			refs.append({"id": entry["id"], "event_order": entry["event_order"]})
	return {"ok": true, "refs": refs}


func projection(viewer_actor_id: String, viewer_team_id: String) -> Dictionary:
	var error := _validate_actor_context(viewer_actor_id, viewer_team_id)
	if not error.is_empty(): return _failure(error)
	return {"ok": true, "projection": {
		"fact_propositions": _authorized_versions(_state.fact_proposition_order,
			_state.fact_propositions),
		"recognition_criteria": _authorized_versions(_state.recognition_criterion_order,
			_state.recognition_criteria),
		"court_record_snapshots": _authorized(_state.court_record_snapshot_order,
			_state.court_record_snapshots, viewer_team_id),
		"sufficiency_evaluation_traces": _authorized(
			_state.sufficiency_evaluation_trace_order, _state.sufficiency_evaluation_traces,
			viewer_team_id),
		"court_fact_findings": _authorized(_state.court_fact_finding_order,
			_state.court_fact_findings, viewer_team_id),
	}}


func _validate_eligible_event(event_id: String) -> Dictionary:
	if not _state.record_materialization_events.has(event_id):
		return _failure("corrupt_record_materialization_reference")
	if not _state.record_inclusion_rules.has(INCLUSION_RULE_ID):
		return _failure("corrupt_record_inclusion_rule_reference")
	var event: Dictionary = _state.record_materialization_events[event_id]
	var inclusion_rule: Dictionary = _state.record_inclusion_rules[INCLUSION_RULE_ID]
	if inclusion_rule.get("id", "") != INCLUSION_RULE_ID \
			or inclusion_rule.get("matter_id", "") != MATTER_ID \
			or inclusion_rule.get("stage_id", "") != STAGE_ID \
			or inclusion_rule.get("eligible_result_kind", "") != "accepted_for_record":
		return _failure("corrupt_record_inclusion_rule_reference")
	var entry_id: String = event.get("court_record_entry_id", "")
	var result_id: String = event.get("procedural_result_id", "")
	var attempt_id: String = event.get("submission_attempt_id", "")
	var document_id: String = event.get("document_id", "")
	var document_version: String = str(event.get("document_version", ""))
	if not _state.court_record_entries.has(entry_id) \
			or not _state.procedural_results.has(result_id) \
			or not _state.submission_attempts.has(attempt_id) \
			or not _state.finalized_documents.has(document_id) \
			or not _state.finalized_documents[document_id].has(document_version):
		return _failure("corrupt_record_materialization_reference")
	var entry: Dictionary = _state.court_record_entries[entry_id]
	var result: Dictionary = _state.procedural_results[result_id]
	var attempt: Dictionary = _state.submission_attempts[attempt_id]
	var document: Dictionary = _state.finalized_documents[document_id][document_version]
	for key in ["document_id", "document_version", "matter_id", "stage_id", "team_id"]:
		if event.get(key) != entry.get(key) or event.get(key) != result.get(key) \
				or event.get(key) != attempt.get(key) or event.get(key) != document.get(key):
			return _failure("corrupt_record_materialization_reference")
	if entry.get("record_materialization_event_id", "") != event_id \
			or int(entry.get("event_order", -1)) != int(event.get("event_order", -3)) + 1 \
			or entry.get("procedural_result_id", "") != result_id \
			or entry.get("submission_attempt_id", "") != attempt_id \
			or result.get("submission_attempt_id", "") != attempt_id \
			or event.get("record_inclusion_rule_id", "") != entry.get("record_inclusion_rule_id", ""):
		return _failure("corrupt_record_materialization_reference")
	var eligible: bool = result.get("kind", "") == "accepted_for_record" \
			and event.get("record_inclusion_rule_id", "") == INCLUSION_RULE_ID \
			and event.get("matter_id", "") == MATTER_ID and event.get("stage_id", "") == STAGE_ID
	return {"ok": true, "eligible": eligible, "entry": entry}


func _valid_fixture_definition(fact: Dictionary, criterion: Dictionary) -> bool:
	if fact.get("id", "") != FACT_ID or str(fact.get("version", "")) != FACT_VERSION \
			or fact.get("matter_id", "") != MATTER_ID or fact.get("stage_id", "") != STAGE_ID \
			or fact.get("statement", "") != FACT_STATEMENT \
			or fact.get("scope_ids", []) != [SCOPE_ID]: return false
	if criterion.get("id", "") != CRITERION_ID \
			or str(criterion.get("version", "")) != CRITERION_VERSION \
			or criterion.get("fact_id", "") != FACT_ID \
			or str(criterion.get("fact_version", "")) != FACT_VERSION \
			or criterion.get("matter_id", "") != MATTER_ID \
			or criterion.get("stage_id", "") != STAGE_ID \
			or criterion.get("scope_ids", []) != [SCOPE_ID] \
			or criterion.get("authority", "") != "synthetic_vs006_fixture" \
			or criterion.get("recognized_limited_permitted", true) \
			or criterion.get("judge_interpretation_permitted", true) \
			or not criterion.get("choice_points", []).is_empty(): return false
	var requirements: Array = criterion.get("requirements", [])
	if requirements.size() != 1 or not requirements[0] is Dictionary: return false
	var requirement: Dictionary = requirements[0]
	return requirement.get("id", "") == "approval_source_in_allowed_record" \
			and requirement.get("target_scope_id", "") == SCOPE_ID \
			and requirement.get("mandatory", false) and not requirement.get("severable", true) \
			and requirement.get("basis_type", "") == "SourceMaterial" \
			and requirement.get("source_id", "") == SOURCE_ID \
			and str(requirement.get("source_version", "")) == SOURCE_VERSION \
			and requirement.get("required_scope_id", "") == SOURCE_SCOPE_ID


func _authorized(order: Array, collection: Dictionary, team_id: String) -> Array:
	var rows: Array = []
	for identity in order:
		if collection.has(identity) and collection[identity].get("team_id", "") == team_id:
			rows.append(collection[identity].duplicate(true))
	return rows


func _authorized_versions(order: Array, collection: Dictionary) -> Array:
	var rows: Array = []
	for ref_value in order:
		var ref: Dictionary = ref_value
		rows.append(collection[ref["id"]][ref["version"]].duplicate(true))
	return rows


func _validate_actor_context(actor_id: String, team_id: String) -> String:
	if _state == null or not _state.initialized: return "session_not_started"
	if actor_id != _state.session.get("player_actor_id", "") \
			or team_id != _state.session.get("player_team_id", ""):
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
		_state.court_record_entries, _state.fact_propositions, _state.recognition_criteria,
		_state.court_record_snapshots, _state.sufficiency_evaluation_traces,
		_state.court_fact_findings]:
		if collection.has(identity): return true
	for event in _state.journal:
		if event.get("id", "") == identity: return true
	for acquisition in _state.acquisitions:
		if acquisition.get("id", "") == identity: return true
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
