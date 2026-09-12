extends SceneTree

const Service = preload("res://services/litigation_service.gd")
var failures: int = 0
var checks: int = 0

func check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
	print(("PASS " if condition else "FAIL ") + label)

func fixture(name: String) -> Dictionary:
	var parsed = JSON.parse_string(FileAccess.get_file_as_string("res://fixtures/" + name + ".json"))
	if not parsed is Dictionary:
		check(false, "fixture_parse_" + name)
		return {}
	return parsed

func replay(service, events: Array) -> bool:
	for command in events:
		var result: Dictionary = service.apply(command)
		check(result.ok, "apply_" + command.id + (" " + result.get("error", "")))
		if not result.ok:
			return false
	return true

func reject_unchanged(service, command: Dictionary, expected_error: String, label: String) -> void:
	var before: Dictionary = service.debug_snapshot()
	var result: Dictionary = service.apply(command)
	check(not result.ok, label + "_rejected")
	check(result.get("error", "") == expected_error, label + "_error_" + expected_error)
	check(before == service.debug_snapshot(), label + "_state_unchanged")

func replay_silent(service, events: Array) -> bool:
	for command in events:
		if not service.apply(command).ok:
			return false
	return true

func cmd(op: String, id: String, extra: Dictionary = {}) -> Dictionary:
	var c := {"op": op, "id": id, "case_id": "Q2-AP", "cause": "negative regression"}
	c.merge(extra)
	return c

func _initialize() -> void:
	var f8 := fixture("test008")
	var f9 := fixture("test009")
	if f8.is_empty() or f9.is_empty():
		quit(1)
		return
	var service = Service.new(int(f8.seed))
	if not replay(service, f8.events):
		quit(1)
		return
	var trial: Dictionary = service.debug_snapshot()
	check(trial.records.J1.payload.value == "deferred" and trial.records.J2.payload.changed_scope == "U wording only", "TEST008_partial_review_history")
	check(service.internal_record("Q2-AP", "firm").size() == 3, "work_products_internal")
	check(not service.official_record("TRIAL", "opponent").has("W1"), "no_internal_auto_disclosure")
	if not replay(service, f9.events):
		quit(1)
		return
	var final: Dictionary = service.debug_snapshot()
	check(final.cases.size() == 1 and final.cases["Q2-AP"].stages == ["TRIAL", "APPEAL", "SUPREME", "RM-r1"], "one_case_stage_history")
	check(final.cases["Q2-AP"].facts == trial.cases["Q2-AP"].facts, "facts_not_rerolled")
	for id in ["W1", "W2", "Wbeta", "J1", "J2"]:
		check(final.records[id] == trial.records[id], "preserve_" + id)
	check(final.used_time.slice(0, trial.used_time.size()) == trial.used_time and final.used_time.size() == 21, "used_time_append_only")
	check(final.records["AP-D-A"].reasons == ["J0-RF", "J0-RL"] and final.records["AP-P-C"].scope == ["c2"], "appeal_targets_reference_prior_reasons")
	check(final.records["RM-r1"].remand_scope == "RM-SCOPE" and final.records["RM-SCOPE"].reasons == ["JS-R-REASON"] and final.records["RM-SCOPE"].scope == ["r1"], "remand_scope_and_reason_preserved")
	check(final.records["REVIEW-beta"].scope == ["AP-D-A"], "review_is_scoped")
	check(service.official_record("APPEAL", "opponent").is_empty(), "import_does_not_deliver_to_new_stage")
	check(not service.official_record("APPEAL", "opponent").has("S0") and not service.official_record("APPEAL", "opponent").has("J0"), "imported_only_record_absent_from_recipient_query")
	check(service.apply(cmd("deliver", "APP-DELIVERY", {"stage": "APPEAL", "record": "S1", "recipient": "appeal_court"})).ok, "explicit_stage_delivery")
	check(service.official_record("APPEAL", "appeal_court").has("S1") and not service.official_record("APPEAL", "appeal_court").has("W1"), "court_view_allowlist")
	var supreme_only = Service.new(int(f8.seed))
	var supreme_setup := replay_silent(supreme_only, f8.events)
	var supreme_events: Array = []
	for event in f9.events:
		supreme_events.append(event)
		if event.id == "JS-R":
			break
	check(supreme_setup and replay_silent(supreme_only, supreme_events), "supreme_only_fixture_setup")
	reject_unchanged(supreme_only, cmd("stage", "BAD-RM", {"level": "remand", "prior_judgment": "JS-R", "remand_scope": "missing"}), "invalid_remand_scope", "reject_missing_remand_scope")
	reject_unchanged(service, cmd("import", "LEAK", {"record": "W1", "stage": "APPEAL"}), "not_official", "import_work_product")
	reject_unchanged(service, cmd("deliver", "LEAK2", {"record": "Wbeta", "recipient": "appeal_court"}), "not_official", "deliver_work_product")
	reject_unchanged(service, cmd("reason", "LEAK3", {"stage": "APPEAL", "sources": ["W1"], "injected": true, "payload": {}}), "source_not_official", "reject_internal_judgment_source")
	reject_unchanged(service, cmd("appeal_target", "BAD-AP", {"stage": "APPEAL", "reasons": ["JA-LS"], "scope": ["x"], "payload": {}, "injected": true}), "not_prior_reason", "reject_non_prior_reason")
	reject_unchanged(service, cmd("reason", "BAD-AP-SOURCE", {"stage": "APPEAL", "sources": ["J1"], "scope": ["a1"], "payload": {}, "injected": true}), "reason_outside_appeal_target", "reason_source_outside_appeal_target")
	reject_unchanged(service, cmd("reason", "BAD-AP-SCOPE", {"stage": "APPEAL", "sources": ["J0-RL"], "scope": ["outside"], "payload": {}, "injected": true}), "scope_not_open", "reason_outside_appeal_target_scope")
	reject_unchanged(service, cmd("judgment", "BAD-UNAPPEALED", {"stage": "APPEAL", "reasons": ["JA-LS"], "scope": ["unappealed-claim"], "payload": {"mutates": "unrelated claim"}, "injected": true}), "scope_not_open", "mutate_unrelated_unappealed_claim")
	reject_unchanged(service, cmd("stage", "SELF-STAGE", {"level": "appeal", "prior_judgment": "SELF-STAGE"}), "invalid_prior_judgment", "reject_nonexistent_self_reference")
	reject_unchanged(service, cmd("stage", "FUTURE-STAGE", {"level": "appeal", "prior_judgment": "FUTURE-JUDGMENT"}), "invalid_prior_judgment", "reject_nonexistent_future_reference")
	reject_unchanged(service, cmd("reason", "BAD-RM-OUTSIDE", {"stage": "RM-r1", "sources": ["JS-R-REASON"], "scope": ["outside-r1"], "payload": {}, "injected": true}), "scope_not_open", "remand_mutation_outside_return_scope")
	reject_unchanged(service, cmd("reason", "BAD-RM-PRESERVED", {"stage": "RM-r1", "sources": ["JS-R-REASON"], "scope": ["A"], "payload": {"mutates": "A"}, "injected": true}), "scope_not_open", "overwrite_preserved_scope")
	check(service.apply(cmd("reason", "RM-R1", {"stage": "RM-r1", "sources": ["JS-R-REASON"], "scope": ["r1"], "payload": {}, "injected": true})).ok, "remand_reason_inside_return_scope")
	reject_unchanged(service, cmd("judgment", "BAD-RM-JUDGMENT", {"stage": "RM-r1", "reasons": ["RM-R1"], "scope": ["A"], "payload": {}, "injected": true}), "scope_not_open", "remand_judgment_overwrites_preserved_scope")
	reject_unchanged(service, cmd("case", "Q2-AP", {"payload": {}}), "duplicate_id", "reject_case_recreation")
	reject_unchanged(service, cmd("reset", "RESET"), "invalid_stage", "no_reset_api")
	reject_unchanged(service, cmd("judgment", "BAD-J", {"stage": "TRIAL", "reasons": ["J0-RF"], "payload": {}}), "requires_injected_payload", "requires_injected_judgment")
	reject_unchanged(service, {"op": 7, "id": "BAD-TYPE", "case_id": "Q2-AP", "cause": "malformed input"}, "missing_op", "malformed_operation_type")
	reject_unchanged(service, cmd("complete", "DOUBLE", {"commitment": "C0"}), "invalid_completion", "no_double_completion")
	check(service.apply(cmd("assignment", "NEW-LAWYER", {"stage": "APPEAL", "lawyer": "new"})).ok, "new_assignment")
	check(service.debug_snapshot().used_time == final.used_time, "assignment_does_not_perform_work")
	reject_unchanged(service, cmd("review", "REVIEW-WRONG-STAGE", {"stage": "APPEAL", "lawyer": "N", "time_id": "T18", "scope": ["AP-D-A"]}), "review_requires_actual_work", "review_using_different_stage_time_id")
	reject_unchanged(service, cmd("review", "REVIEW-WRONG-LAWYER", {"stage": "APPEAL", "lawyer": "N", "time_id": "T14", "scope": ["AP-D-A"]}), "review_requires_actual_work", "review_using_different_lawyer_time_id")
	reject_unchanged(service, cmd("review", "REVIEW-ASSIGNMENT", {"stage": "APPEAL", "lawyer": "new", "time_id": "NEW-LAWYER", "scope": ["AP-D-A"]}), "review_requires_actual_work", "assignment_instant_review")
	check(service.apply(cmd("commitment", "ACTIVE", {"stage": "APPEAL", "lawyer": "new", "slot": "future", "work": "review"})).ok, "actual_commitment")
	var incomplete_service = Service.new(int(f8.seed))
	check(replay_silent(incomplete_service, f8.events + f9.events), "incomplete_review_fixture_setup")
	incomplete_service._state.commitments["C14"].active = true
	reject_unchanged(incomplete_service, cmd("review", "REVIEW-INCOMPLETE", {"stage": "APPEAL", "lawyer": "beta", "time_id": "T14", "scope": ["AP-D-A"]}), "review_requires_completed_commitment", "review_on_incomplete_commitment")
	check(service.apply({"op": "case", "id": "Z", "case_id": "Z", "cause": "collision fixture", "payload": {}}).ok, "case_Z")
	check(service.apply({"op": "stage", "id": "Z-TRIAL", "case_id": "Z", "cause": "fixture", "level": "trial"}).ok, "case_Z_stage")
	check(service.apply({"op": "assignment", "id": "Z-AS", "case_id": "Z", "cause": "fixture", "stage": "Z-TRIAL", "lawyer": "new"}).ok, "case_Z_assignment")
	check(service.apply({"op": "submission", "id": "Z-S", "case_id": "Z", "cause": "fixture", "stage": "Z-TRIAL", "payload": {}}).ok, "case_Z_submission")
	check(service.apply({"op": "reason", "id": "Z-R", "case_id": "Z", "cause": "fixture", "stage": "Z-TRIAL", "sources": ["Z-S"], "injected": true, "payload": {}}).ok, "case_Z_reason")
	check(service.apply({"op": "judgment", "id": "Z-J", "case_id": "Z", "cause": "fixture", "stage": "Z-TRIAL", "reasons": ["Z-R"], "injected": true, "payload": {}}).ok, "case_Z_judgment")
	reject_unchanged(service, cmd("stage", "BAD-CROSS-CASE-APPEAL", {"level": "appeal", "prior_judgment": "Z-J"}), "invalid_prior_judgment", "appeal_prior_judgment_from_another_case")
	reject_unchanged(service, {"op": "stage", "id": "Z-BAD-SUPREME", "case_id": "Z", "cause": "negative regression", "level": "supreme", "prior_judgment": "Z-J"}, "invalid_genealogy", "supreme_skips_trial_invalid_genealogy")
	reject_unchanged(service, {"op": "stage", "id": "Z-SECOND-TRIAL", "case_id": "Z", "cause": "negative regression", "level": "trial"}, "invalid_genealogy", "second_trial_breaks_genealogy")
	reject_unchanged(service, cmd("remand_scope", "BAD-RM-OTHER-CASE", {"stage": "SUPREME", "reasons": ["Z-R"], "scope": ["r1"], "payload": {}, "injected": true}), "not_reason", "remand_scope_using_other_case_reason")
	var collision := {"op": "commitment", "id": "Z-CONFLICT", "case_id": "Z", "cause": "same actual time", "stage": "Z-TRIAL", "lawyer": "new", "slot": "future", "work": "attendance"}
	reject_unchanged(service, collision, "overlapping_work", "same_lawyer_cross_case_conflict")
	var copy: Dictionary = service.debug_snapshot()
	copy.records.clear()
	check(not service.debug_snapshot().records.is_empty(), "snapshot_cannot_mutate_store")
	var view: Dictionary = service.official_record("TRIAL", "opponent")
	view.S1.payload.clear()
	check(not service.official_record("TRIAL", "opponent").S1.payload.is_empty(), "public_copy_isolation")
	var replayed = Service.new(int(f8.seed))
	for c in f8.events + f9.events:
		if not replayed.apply(c).ok:
			check(false, "replay_failed")
	check(replayed.debug_snapshot() == final, "same_seed_inputs_replay_exactly_no_rng_draws")
	print("SUMMARY %d checks, %d failures; injected state regression only" % [checks, failures])
	quit(0 if failures == 0 else 1)
