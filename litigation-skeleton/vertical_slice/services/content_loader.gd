extends RefCounted


func load_json_file(path: String) -> Dictionary:
	if path.is_empty() or not FileAccess.file_exists(path):
		return {"ok": false, "error": "content_file_not_found"}
	return parse_json_text(FileAccess.get_file_as_string(path))


func parse_json_text(raw_text: String) -> Dictionary:
	var parser := JSON.new()
	var parse_error := parser.parse(raw_text)
	if parse_error != OK:
		return {
			"ok": false,
			"error": "malformed_json",
			"line": parser.get_error_line(),
			"message": parser.get_error_message(),
		}
	var parsed: Variant = parser.data
	if not parsed is Dictionary:
		return {"ok": false, "error": "content_root_not_dictionary"}
	return {"ok": true, "content": parsed.duplicate(true)}
