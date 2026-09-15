extends RefCounted


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
				"label": "%s — %s" % [source["title"], scope["label"]],
				"source_id": source["id"],
				"source_version": source["version"],
				"scope_id": scope["id"],
			})
	return rows


func source_detail(source: Dictionary) -> String:
	var lines: Array[String] = []
	lines.append(source["title"])
	lines.append("Source ID / version: %s / %s" % [source["id"], source["version"]])
	lines.append("출처: %s" % source["origin"]["description"])
	lines.append("자료에 기록된 내용이며 법원 인정 사실이 아닙니다.")
	lines.append("")
	for scope in source["scopes"]:
		lines.append("[%s]" % scope["label"])
		lines.append(scope["content"])
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
			"label": opportunity["label"],
			"action_id": opportunity["id"],
			"task_id": opportunity["task_id"],
			"created": opportunity["created"],
		})
	return rows


func investigation_opportunity_text(opportunity: Dictionary) -> String:
	return "%s\n목적: %s\n조사 범위: %s\n근거 공백: %s\n%s" % [
		opportunity["label"], opportunity["purpose"], opportunity["bounded_domain"],
		", ".join(opportunity["known_gap_refs"]), opportunity["action_description"],
	]


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
		lines.append("Investigation Task: 아직 생성되지 않음")
	else:
		lines.append("Investigation Task: %s" % selected_task["id"])
		lines.append("상태: %s" % selected_task["state"])
		if not selected_task["current_assignment_id"].is_empty():
			lines.append("Assignment: %s" % selected_task["current_assignment_id"])
		if not selected_task["execution_ids"].is_empty():
			lines.append("Execution: %s" % ", ".join(selected_task["execution_ids"]))
		if not selected_task["completion_id"].is_empty():
			lines.append("Completion: %s" % selected_task["completion_id"])
	for result in projection["results"]:
		if result["investigation_action_id"] == action_id:
			lines.append("InvestigationResult: %s — %s" % [result["outcome"], result["summary"]])
			lines.append("제한: %s" % ", ".join(result["limitations"]))
			if not result["acquisition_refs"].is_empty():
				lines.append("AcquisitionEvent: %s" % ", ".join(result["acquisition_refs"]))
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
