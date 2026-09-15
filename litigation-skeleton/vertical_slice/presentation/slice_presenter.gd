extends RefCounted

const SliceLocalizer = preload("res://vertical_slice/presentation/slice_localizer.gd")

var _localizer = SliceLocalizer.new()


func bind_localization(catalog: Dictionary) -> void:
	_localizer.bind_catalog(catalog)


func localized_text(key_or_literal: String, parameters: Array = []) -> String:
	return _localizer.text(key_or_literal, parameters)


func case_header(projection: Dictionary) -> String:
	return "%s\n의뢰 목표: %s\n절차 단계: %s" % [
		projection["matter"]["title"],
		projection["matter"]["client_goal"],
		projection["stage"]["label"],
	]


func source_scope_rows(projection: Dictionary) -> Array:
	var rows: Array = []
	for source in projection["sources"]:
		for scope in source["acquired_scopes"]:
			rows.append({
				"label": "%s — %s" % [localized_text(source["title"]), localized_text(scope["label"])],
				"source_id": source["id"],
				"source_version": source["version"],
				"scope_id": scope["id"],
			})
	return rows


func source_detail(source: Dictionary) -> String:
	var lines: Array[String] = []
	lines.append(localized_text(source["title"]))
	lines.append("Source ID / version: %s / %s" % [source["id"], source["version"]])
	lines.append("출처: %s" % localized_text(source["origin"]["description"]))
	lines.append("자료에 기록된 내용이며 법원 인정 사실이 아닙니다.")
	lines.append("")
	for scope in source["scopes"]:
		lines.append("[%s]" % localized_text(scope["label"]))
		lines.append(localized_text(scope["content"]))
		lines.append("")
	return "\n".join(lines)


func known_gaps_text(projection: Dictionary) -> String:
	var lines: Array[String] = ["알려진 공백"]
	for gap in projection["known_gaps"]:
		lines.append("• %s (%s)" % [gap["description"], gap["status"]])
	if projection["known_gaps"].is_empty():
		lines.append("• 현재 기록된 공백 없음")
	return "\n".join(lines)


func assertion_text(projection: Dictionary) -> String:
	var lines: Array[String] = ["자료 진술"]
	for assertion in projection["source_assertions"]:
		lines.append("• %s" % assertion["statement"])
	if projection["source_assertions"].is_empty():
		lines.append("• 현재 기록된 진술 없음")
	lines.append("자료 진술은 객관적 진실이나 CourtFactFinding이 아닙니다.")
	return "\n".join(lines)


func review_status_text(projection: Dictionary) -> String:
	var task: Dictionary = {}
	for candidate in projection["tasks"]:
		if candidate["definition"]["task_family"] == "evidence_review":
			task = candidate
			break
	if task.is_empty():
		return "검토 Task 없음"
	var definition: Dictionary = task["definition"]
	var lines: Array[String] = [
		"Task: %s" % definition["purpose"],
		"상태: %s" % task["state"],
		"필요 작업: %d %s" % [definition["required_work_units"], definition["work_unit_kind"]],
	]
	if not task["current_assignment_id"].is_empty():
		lines.append("Assignment: %s" % task["current_assignment_id"])
	if not task["execution_ids"].is_empty():
		lines.append("Execution: %s" % ", ".join(task["execution_ids"]))
	if not task["completion_id"].is_empty():
		lines.append("Completion: %s" % task["completion_id"])
	return "\n".join(lines)


func investigation_opportunity_rows(projection: Dictionary) -> Array:
	var rows: Array = []
	for opportunity in projection["opportunities"]:
		rows.append({
			"label": localized_text(opportunity["label"]),
			"action_id": opportunity["id"],
			"task_id": opportunity["task_id"],
			"created": opportunity["created"],
		})
	return rows


func investigation_opportunity_text(opportunity: Dictionary) -> String:
	return localized_text("ui.vs003.opportunity", [
		localized_text(opportunity["label"]), localized_text(opportunity["purpose"]),
		localized_text(opportunity["bounded_domain"]), ", ".join(opportunity["known_gap_refs"]),
		localized_text(opportunity["action_description"]),
	])


func investigation_status_text(projection: Dictionary, action_id: String) -> String:
	var lines: Array[String] = []
	var selected_task: Dictionary = {}
	for opportunity in projection["opportunities"]:
		if opportunity["id"] == action_id and not opportunity["task_id"].is_empty():
			for task in projection["tasks"]:
				if task["id"] == opportunity["task_id"]:
					selected_task = task
					break
	if selected_task.is_empty():
		lines.append(localized_text("ui.vs003.task_missing"))
	else:
		lines.append(localized_text("ui.vs003.task", [selected_task["id"]]))
		var state := localized_text("ui.vs003.task_state." + selected_task["state"])
		lines.append(localized_text("ui.vs003.state", [state]))
		if not selected_task["current_assignment_id"].is_empty():
			lines.append(localized_text("ui.vs003.assignment", [selected_task["current_assignment_id"]]))
		if not selected_task["execution_ids"].is_empty():
			lines.append(localized_text("ui.vs003.execution", [", ".join(selected_task["execution_ids"])]))
		if not selected_task["completion_id"].is_empty():
			lines.append(localized_text("ui.vs003.completion", [selected_task["completion_id"]]))
	for result in projection["results"]:
		if result["investigation_action_id"] == action_id:
			var outcome := localized_text("ui.vs003.outcome." + result["outcome"])
			lines.append(localized_text("ui.vs003.result", [outcome, localized_text(result["summary"])]))
			var limitations: Array[String] = []
			for limitation in result["limitations"]:
				limitations.append(localized_text("vs003.limitation." + limitation))
			lines.append(localized_text("ui.vs003.limitations", [", ".join(limitations)]))
			if not result["acquisition_refs"].is_empty():
				lines.append(localized_text("ui.vs003.acquisition", [", ".join(result["acquisition_refs"])]))
	return "\n".join(lines)


func strategy_status_text(projection: Dictionary) -> String:
	var lines: Array[String] = []
	if projection["review_work_products"].is_empty():
		lines.append("ReviewWorkProduct: 아직 없음")
	else:
		var work_product: Dictionary = projection["review_work_products"][-1]
		lines.append("ReviewWorkProduct: %s" % work_product["id"])
		lines.append("분석은 사실인정이 아니며 틀릴 수 있습니다.")
	if projection["issue_selections"].is_empty():
		lines.append("선택 Issue: 아직 없음")
	else:
		lines.append("선택 Issue: %s" % projection["issue_selections"][-1]["issue_id"])
	if projection["case_theories"].is_empty():
		lines.append("CaseTheory: 아직 없음")
	else:
		var theory: Dictionary = projection["case_theories"][-1]
		lines.append("CaseTheory: %s v%d" % [theory["theory_id"], theory["version_number"]])
		lines.append(theory["statement"])
		lines.append("CaseTheory는 CourtFactFinding이 아닙니다.")
	return "\n".join(lines)
