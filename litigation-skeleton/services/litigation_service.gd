extends RefCounted

const State = preload("res://data/litigation_state.gd")
var _state = State.new()


func _init(fixture_seed: int = 0) -> void:
	_state.seed_value = fixture_seed


func debug_snapshot() -> Dictionary:
	return _state.snapshot()


func official_record(stage_id: String, recipient: String) -> Dictionary:
	var result: Dictionary = {}
	for id in _state.records:
		var record: Dictionary = _state.records[id]
		var stages = record.get("stages", [])
		var recipients = record.get("recipients", [])
		if record.get("kind", "") != "work_product" and stages is Array and recipients is Array \
				and stage_id in stages and (stage_id + ":" + recipient) in recipients:
			result[id] = {"id": id, "kind": record.get("kind", ""),
				"payload": record.get("payload", {}).duplicate(true)}
	return result


func internal_record(case_id: String, team: String) -> Dictionary:
	var result: Dictionary = {}
	for id in _state.records:
		var record: Dictionary = _state.records[id]
		if record.get("kind", "") == "work_product" and record.get("case_id", "") == case_id \
				and record.get("team", "") == team:
			result[id] = record.duplicate(true)
	return result


func apply(command: Dictionary) -> Dictionary:
	var c: Dictionary = command.duplicate(true)
	var error := _validate(c)
	if not error.is_empty():
		return {"ok": false, "error": error}
	var op: String = c["op"]
	if op == "case":
		_state.cases[c.id] = {"id": c.id, "facts": c.payload.duplicate(true), "stages": []}
	elif op == "deliver":
		var delivered: Dictionary = _state.records[c.record]
		var grant: String = c.stage + ":" + c.recipient
		if grant not in delivered.recipients:
			delivered.recipients.append(grant)
	elif op == "import":
		_state.records[c.record].stages.append(c.stage)
	elif op == "complete":
		var commitment: Dictionary = _state.commitments[c.commitment]
		commitment.active = false
		_state.used_time.append({"id": c.id, "commitment": c.commitment,
			"lawyer": commitment.lawyer, "slot": commitment.slot,
			"case_id": c.case_id, "stage": commitment.stage, "work": commitment.work})
	else:
		c["kind"] = op
		c["recipients"] = []
		c["stages"] = [c.stage] if c.has("stage") else []
		_state.records[c.id] = c
		if op == "stage":
			_state.cases[c.case_id].stages.append(c.id)
		elif op == "commitment":
			_state.commitments[c.id] = c.duplicate(true)
			_state.commitments[c.id]["active"] = true
	_state.journal.append(command.duplicate(true))
	return {"ok": true}


func _nonempty_string(value: Variant) -> bool:
	return value is String and not value.is_empty()


func _string_list(value: Variant) -> bool:
	if not value is Array or value.is_empty():
		return false
	for item in value:
		if not _nonempty_string(item):
			return false
	return true


func _same_case(id: Variant, case_id: String, kind: String = "") -> bool:
	if not id is String or not _state.records.has(id):
		return false
	var record: Dictionary = _state.records[id]
	return record.get("case_id", "") == case_id \
		and (kind.is_empty() or record.get("kind", "") == kind)


func _stage_level(stage_id: Variant) -> String:
	if not stage_id is String or not _state.records.has(stage_id):
		return ""
	var stage: Dictionary = _state.records[stage_id]
	return stage.get("level", "") if stage.get("kind", "") == "stage" else ""


func _scope_for_stage(stage_id: String) -> Array:
	var allowed: Array = []
	var stage: Dictionary = _state.records[stage_id]
	if stage.get("level", "") == "remand":
		var remand_scope: Dictionary = _state.records[stage.remand_scope]
		return remand_scope.scope.duplicate()
	for record in _state.records.values():
		if record.get("kind", "") == "appeal_target" and record.get("stage", "") == stage_id:
			for item in record.scope:
				if item not in allowed:
					allowed.append(item)
	return allowed


func _target_reasons_for_stage(stage_id: String) -> Array:
	var allowed: Array = []
	for record in _state.records.values():
		if record.get("kind", "") == "appeal_target" and record.get("stage", "") == stage_id:
			for reason_id in record.reasons:
				if reason_id not in allowed:
					allowed.append(reason_id)
	return allowed


func _validate_stage(c: Dictionary) -> String:
	var level = c.get("level", "")
	if not level is String or level not in ["trial", "appeal", "supreme", "remand"]:
		return "invalid_level"
	if level == "trial":
		return "" if _state.cases[c.case_id].stages.is_empty() and not c.has("prior_judgment") else "invalid_genealogy"
	var prior_id = c.get("prior_judgment", "")
	if not _same_case(prior_id, c.case_id, "judgment"):
		return "invalid_prior_judgment"
	var prior: Dictionary = _state.records[prior_id]
	var prior_stage_id = prior.get("stage", "")
	if not _same_case(prior_stage_id, c.case_id, "stage"):
		return "invalid_prior_stage"
	var case_stages: Array = _state.cases[c.case_id].stages
	if case_stages.is_empty() or case_stages[-1] != prior_stage_id:
		return "prior_stage_not_current"
	var allowed_predecessors := {"appeal": ["trial"], "supreme": ["appeal"], "remand": ["supreme"]}
	if _stage_level(prior_stage_id) not in allowed_predecessors[level]:
		return "invalid_genealogy"
	if level != "remand":
		return ""
	var scope_id = c.get("remand_scope", "")
	if not _same_case(scope_id, c.case_id, "remand_scope"):
		return "invalid_remand_scope"
	var scope_record: Dictionary = _state.records[scope_id]
	if scope_record.get("stage", "") != prior_stage_id:
		return "remand_scope_wrong_stage"
	for ref in scope_record.reasons:
		if ref not in prior.reasons:
			return "remand_not_from_prior_judgment"
	return ""


func _validate_official_transfer(c: Dictionary) -> String:
	if not _same_case(c.get("record", ""), c.case_id):
		return "invalid_record"
	var record: Dictionary = _state.records[c.record]
	if record.get("kind", "") not in ["submission", "reason", "judgment"]:
		return "not_official"
	if c.op == "deliver":
		if not _nonempty_string(c.get("stage", "")) or c.stage not in record.get("stages", []):
			return "record_not_in_stage"
		var recipient = c.get("recipient", "")
		return "" if recipient is String and recipient in ["opponent", "trial_court", "appeal_court", "supreme_court", "remand_court"] else "invalid_recipient"
	if not _same_case(c.get("stage", ""), c.case_id, "stage") or c.stage in record.get("stages", []):
		return "invalid_import"
	return ""


func _validate_reason(c: Dictionary) -> String:
	if not _string_list(c.get("sources")):
		return "missing_references"
	var level := _stage_level(c.stage)
	var target_reasons := _target_reasons_for_stage(c.stage)
	var remand_reasons: Array = []
	if level == "remand":
		remand_reasons = _state.records[_state.records[c.stage].remand_scope].reasons
	for ref in c.sources:
		if not _same_case(ref, c.case_id):
			return "invalid_reference"
		var source: Dictionary = _state.records[ref]
		if source.get("kind", "") not in ["submission", "reason"]:
			return "source_not_official"
		if source.get("kind", "") == "submission":
			if c.stage not in source.get("stages", []):
				return "source_not_in_official_stage"
		elif source.get("stage", "") != c.stage:
			if level in ["appeal", "supreme"] and ref not in target_reasons:
				return "reason_outside_appeal_target"
			if level == "remand" and ref not in remand_reasons:
				return "reason_outside_remand_return"
	if level != "trial":
		if not _string_list(c.get("scope")):
			return "missing_scope"
		var allowed := _scope_for_stage(c.stage)
		for item in c.scope:
			if item not in allowed:
				return "scope_not_open"
	return ""


func _validate_judgment(c: Dictionary) -> String:
	if not _string_list(c.get("reasons")):
		return "missing_references"
	for ref in c.reasons:
		if not _same_case(ref, c.case_id, "reason"):
			return "not_reason"
		if _state.records[ref].get("stage", "") != c.stage:
			return "reason_wrong_stage"
	if _stage_level(c.stage) != "trial":
		if not _string_list(c.get("scope")):
			return "missing_scope"
		var allowed := _scope_for_stage(c.stage)
		for item in c.scope:
			if item not in allowed:
				return "scope_not_open"
		for ref in c.reasons:
			for item in _state.records[ref].get("scope", []):
				if item not in c.scope:
					return "judgment_omits_reason_scope"
	return ""


func _validate_injected_record(c: Dictionary) -> String:
	if c.get("injected", false) != true or not c.get("payload") is Dictionary:
		return "requires_injected_payload"
	if c.op == "reason":
		return _validate_reason(c)
	if c.op == "judgment":
		return _validate_judgment(c)
	if not _string_list(c.get("reasons")):
		return "missing_references"
	for ref in c.reasons:
		if not _same_case(ref, c.case_id, "reason"):
			return "not_reason"
	if not _string_list(c.get("scope")):
		return "missing_scope"
	if c.op == "appeal_target":
		if _stage_level(c.stage) not in ["appeal", "supreme"]:
			return "invalid_target_stage"
		var prior_id = _state.records[c.stage].get("prior_judgment", "")
		if not _same_case(prior_id, c.case_id, "judgment"):
			return "no_prior_judgment"
		for ref in c.reasons:
			if ref not in _state.records[prior_id].reasons:
				return "not_prior_reason"
		return ""
	if _stage_level(c.stage) != "supreme":
		return "invalid_upper_stage"
	for ref in c.reasons:
		if _state.records[ref].get("stage", "") != c.stage:
			return "invalid_upper_reason"
	return ""


func _validate_work(c: Dictionary) -> String:
	if not _nonempty_string(c.get("lawyer", "")):
		return "missing_lawyer"
	if c.op == "assignment":
		return ""
	if c.op == "commitment":
		if not _nonempty_string(c.get("slot", "")) or not _nonempty_string(c.get("work", "")):
			return "missing_work"
		var assigned := false
		for record in _state.records.values():
			if record.get("kind", "") == "assignment" and record.get("stage", "") == c.stage \
					and record.get("lawyer", "") == c.lawyer:
				assigned = true
		if not assigned:
			return "requires_assignment"
		for record in _state.commitments.values():
			if record.get("lawyer", "") == c.lawyer and record.get("slot", "") == c.slot:
				return "overlapping_work"
		return ""
	if not _string_list(c.get("scope")):
		return "review_requires_actual_work"
	var actual_time: Dictionary = {}
	for time in _state.used_time:
		if time.get("id", "") == c.get("time_id", ""):
			actual_time = time
			break
	if actual_time.is_empty() or actual_time.get("case_id", "") != c.case_id \
			or actual_time.get("stage", "") != c.stage or actual_time.get("lawyer", "") != c.lawyer:
		return "review_requires_actual_work"
	var commitment_id = actual_time.get("commitment", "")
	if not _state.commitments.has(commitment_id) or _state.commitments[commitment_id].get("active", true):
		return "review_requires_completed_commitment"
	for ref in c.scope:
		if not _same_case(ref, c.case_id, "appeal_target") or _state.records[ref].get("stage", "") != c.stage:
			return "invalid_review_scope"
	return ""


func _validate(c: Dictionary) -> String:
	for key in ["id", "op", "case_id", "cause"]:
		if not _nonempty_string(c.get(key, "")):
			return "missing_" + key
	for entry in _state.journal:
		if entry.get("id", "") == c.id:
			return "duplicate_id"
	if c.op == "case":
		return "" if c.id == c.case_id and c.get("payload") is Dictionary and not _state.cases.has(c.id) else "invalid_case"
	if not _state.cases.has(c.case_id):
		return "unknown_case"
	if c.op == "stage":
		return _validate_stage(c)
	if c.op in ["deliver", "import"]:
		return _validate_official_transfer(c)
	if c.op == "complete":
		var commitment_id = c.get("commitment", "")
		if not commitment_id is String or not _state.commitments.has(commitment_id):
			return "invalid_completion"
		var commitment: Dictionary = _state.commitments[commitment_id]
		return "" if commitment.get("case_id", "") == c.case_id and commitment.get("active", false) else "invalid_completion"
	if not _same_case(c.get("stage", ""), c.case_id, "stage"):
		return "invalid_stage"
	if c.op == "work_product":
		return "" if _nonempty_string(c.get("team", "")) and c.get("payload") is Dictionary else "invalid_internal"
	if c.op == "submission":
		return "" if c.get("payload") is Dictionary else "invalid_submission"
	if c.op in ["reason", "judgment", "appeal_target", "remand_scope"]:
		return _validate_injected_record(c)
	if c.op in ["assignment", "commitment", "review"]:
		return _validate_work(c)
	return "unsupported_operation"
