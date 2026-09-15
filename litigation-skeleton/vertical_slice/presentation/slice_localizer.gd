extends RefCounted


var _catalog: Dictionary = {}


func bind_catalog(catalog: Dictionary) -> void:
	_catalog = catalog.duplicate(true)


func text(key_or_literal: String, parameters: Array = []) -> String:
	var rendered: String = str(_catalog.get(key_or_literal, key_or_literal))
	if parameters.is_empty():
		return rendered
	return rendered % parameters
