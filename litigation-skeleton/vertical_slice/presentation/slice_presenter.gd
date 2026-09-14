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
