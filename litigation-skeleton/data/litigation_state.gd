extends RefCounted

# Internal storage. Only the service writes; clients receive deep copies.
var cases: Dictionary = {}
var records: Dictionary = {}
var commitments: Dictionary = {}
var used_time: Array = []
var journal: Array = []
var seed_value: int = 0

func snapshot() -> Dictionary:
	return {"schema_version": 1, "seed": seed_value, "cases": cases.duplicate(true),
		"records": records.duplicate(true), "commitments": commitments.duplicate(true),
		"used_time": used_time.duplicate(true), "journal": journal.duplicate(true)}
