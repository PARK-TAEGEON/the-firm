extends RefCounted

const SliceState = preload("res://vertical_slice/data/slice_state.gd")

const SUPPORTED_SCHEMA_VERSION := 1
const FORBIDDEN_CONTENT_KEYS := [
	"actual_state", "actual_state_record", "court_record", "court_record_entry",
	"court_fact_finding", "finding", "findings", "judgment", "winner",
	"case_strength", "evidence_score", "win_chance", "win_probability",
]

var _state = SliceState.new()


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
	candidate.journal.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		return int(a["event_order"]) < int(b["event_order"])
	)

	_state = candidate
	return {"ok": true, "session_id": candidate.session["id"]}


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
				"event_order": acquisition["event_order"],
				"actor_id": acquisition["actor_id"],
				"route": acquisition["route"],
				"provider_ref": acquisition["provider_ref"],
				"scopes": acquisition["scopes"].duplicate(),
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
	for key in ["actors", "teams", "sources", "acquisitions", "assertions", "known_gaps", "procedural_statuses"]:
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


func _scope_key(team_id: String, source_id: String, version: String, scope_id: String) -> String:
	return team_id + "|" + source_id + "|" + version + "|" + scope_id
