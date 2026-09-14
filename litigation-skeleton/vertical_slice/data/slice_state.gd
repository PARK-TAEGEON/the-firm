extends RefCounted

# Authoritative VS-001 runtime state. Only SliceService mutates this object.
var initialized: bool = false
var content_meta: Dictionary = {}
var session: Dictionary = {}
var matter: Dictionary = {}
var stage: Dictionary = {}
var actors: Dictionary = {}
var teams: Dictionary = {}
var sources: Dictionary = {}
var source_order: Array = []
var assertions: Dictionary = {}
var assertion_order: Array = []
var known_gaps: Dictionary = {}
var gap_order: Array = []
var procedural_statuses: Dictionary = {}
var status_order: Array = []
var acquisitions: Array = []
var journal: Array = []


func snapshot() -> Dictionary:
	return {
		"schema_version": 1,
		"initialized": initialized,
		"content_meta": content_meta.duplicate(true),
		"session": session.duplicate(true),
		"matter": matter.duplicate(true),
		"stage": stage.duplicate(true),
		"actors": actors.duplicate(true),
		"teams": teams.duplicate(true),
		"sources": sources.duplicate(true),
		"source_order": source_order.duplicate(true),
		"assertions": assertions.duplicate(true),
		"assertion_order": assertion_order.duplicate(true),
		"known_gaps": known_gaps.duplicate(true),
		"gap_order": gap_order.duplicate(true),
		"procedural_statuses": procedural_statuses.duplicate(true),
		"status_order": status_order.duplicate(true),
		"acquisitions": acquisitions.duplicate(true),
		"journal": journal.duplicate(true),
	}
