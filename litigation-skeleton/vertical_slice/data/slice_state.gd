extends RefCounted

# Authoritative vertical-slice runtime state. Only services mutate this object.
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
var investigation_actions: Dictionary = {}
var investigation_action_order: Array = []
var investigation_results: Dictionary = {}
var investigation_result_order: Array = []
var task_definitions: Dictionary = {}
var task_definition_order: Array = []
var tasks: Dictionary = {}
var task_order: Array = []
var assignments: Dictionary = {}
var assignment_order: Array = []
var executions: Dictionary = {}
var execution_order: Array = []
var completions: Dictionary = {}
var completion_order: Array = []
var review_work_products: Dictionary = {}
var review_work_product_order: Array = []
var issues: Dictionary = {}
var issue_order: Array = []
var review_analysis_options: Dictionary = {}
var issue_selections: Dictionary = {}
var issue_selection_order: Array = []
var case_theories: Dictionary = {}
var case_theory_order: Array = []
var theory_lineages: Dictionary = {}
var time_allocations: Dictionary = {}
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
		"investigation_actions": investigation_actions.duplicate(true),
		"investigation_action_order": investigation_action_order.duplicate(true),
		"investigation_results": investigation_results.duplicate(true),
		"investigation_result_order": investigation_result_order.duplicate(true),
		"task_definitions": task_definitions.duplicate(true),
		"task_definition_order": task_definition_order.duplicate(true),
		"tasks": tasks.duplicate(true),
		"task_order": task_order.duplicate(true),
		"assignments": assignments.duplicate(true),
		"assignment_order": assignment_order.duplicate(true),
		"executions": executions.duplicate(true),
		"execution_order": execution_order.duplicate(true),
		"completions": completions.duplicate(true),
		"completion_order": completion_order.duplicate(true),
		"review_work_products": review_work_products.duplicate(true),
		"review_work_product_order": review_work_product_order.duplicate(true),
		"issues": issues.duplicate(true),
		"issue_order": issue_order.duplicate(true),
		"review_analysis_options": review_analysis_options.duplicate(true),
		"issue_selections": issue_selections.duplicate(true),
		"issue_selection_order": issue_selection_order.duplicate(true),
		"case_theories": case_theories.duplicate(true),
		"case_theory_order": case_theory_order.duplicate(true),
		"theory_lineages": theory_lineages.duplicate(true),
		"time_allocations": time_allocations.duplicate(true),
		"journal": journal.duplicate(true),
	}
