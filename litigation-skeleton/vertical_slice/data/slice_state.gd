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
var legal_sources: Dictionary = {}
var legal_source_order: Array = []
var legal_research_questions: Dictionary = {}
var legal_research_question_order: Array = []
var legal_research_recipes: Dictionary = {}
var legal_source_discoveries: Dictionary = {}
var legal_source_discovery_order: Array = []
var legal_source_reviews: Dictionary = {}
var legal_source_review_order: Array = []
var recorded_legal_extractions: Dictionary = {}
var recorded_legal_extraction_order: Array = []
var rule_statements: Dictionary = {}
var rule_statement_order: Array = []
var interpretation_candidates: Dictionary = {}
var interpretation_candidate_order: Array = []
var issue_analyses: Dictionary = {}
var issue_analysis_order: Array = []
var arguments: Dictionary = {}
var argument_order: Array = []
var argument_selection_events: Dictionary = {}
var argument_selection_order: Array = []
var submission_rules: Dictionary = {}
var submission_rule_order: Array = []
var record_inclusion_rules: Dictionary = {}
var record_inclusion_rule_order: Array = []
var package_members: Dictionary = {}
var package_member_order: Array = []
var deadline_contexts: Dictionary = {}
var deadline_context_order: Array = []
var draft_work_products: Dictionary = {}
var draft_work_product_order: Array = []
var finalized_documents: Dictionary = {}
var finalized_document_order: Array = []
var submission_attempts: Dictionary = {}
var submission_attempt_order: Array = []
var procedural_results: Dictionary = {}
var procedural_result_order: Array = []
var record_materialization_events: Dictionary = {}
var record_materialization_order: Array = []
var court_record_entries: Dictionary = {}
var court_record_entry_order: Array = []
var fact_propositions: Dictionary = {}
var fact_proposition_order: Array = []
var recognition_criteria: Dictionary = {}
var recognition_criterion_order: Array = []
var court_record_snapshots: Dictionary = {}
var court_record_snapshot_order: Array = []
var sufficiency_evaluation_traces: Dictionary = {}
var sufficiency_evaluation_trace_order: Array = []
var court_fact_findings: Dictionary = {}
var court_fact_finding_order: Array = []
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
	var result := {
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
		"legal_sources": legal_sources.duplicate(true),
		"legal_source_order": legal_source_order.duplicate(true),
		"legal_research_questions": legal_research_questions.duplicate(true),
		"legal_research_question_order": legal_research_question_order.duplicate(true),
		"legal_research_recipes": legal_research_recipes.duplicate(true),
		"legal_source_discoveries": legal_source_discoveries.duplicate(true),
		"legal_source_discovery_order": legal_source_discovery_order.duplicate(true),
		"legal_source_reviews": legal_source_reviews.duplicate(true),
		"legal_source_review_order": legal_source_review_order.duplicate(true),
		"recorded_legal_extractions": recorded_legal_extractions.duplicate(true),
		"recorded_legal_extraction_order": recorded_legal_extraction_order.duplicate(true),
		"rule_statements": rule_statements.duplicate(true),
		"rule_statement_order": rule_statement_order.duplicate(true),
		"interpretation_candidates": interpretation_candidates.duplicate(true),
		"interpretation_candidate_order": interpretation_candidate_order.duplicate(true),
		"issue_analyses": issue_analyses.duplicate(true),
		"issue_analysis_order": issue_analysis_order.duplicate(true),
		"arguments": arguments.duplicate(true),
		"argument_order": argument_order.duplicate(true),
		"argument_selection_events": argument_selection_events.duplicate(true),
		"argument_selection_order": argument_selection_order.duplicate(true),
		"submission_rules": submission_rules.duplicate(true),
		"submission_rule_order": submission_rule_order.duplicate(true),
		"record_inclusion_rules": record_inclusion_rules.duplicate(true),
		"record_inclusion_rule_order": record_inclusion_rule_order.duplicate(true),
		"package_members": package_members.duplicate(true),
		"package_member_order": package_member_order.duplicate(true),
		"deadline_contexts": deadline_contexts.duplicate(true),
		"deadline_context_order": deadline_context_order.duplicate(true),
		"draft_work_products": draft_work_products.duplicate(true),
		"draft_work_product_order": draft_work_product_order.duplicate(true),
		"finalized_documents": finalized_documents.duplicate(true),
		"finalized_document_order": finalized_document_order.duplicate(true),
		"submission_attempts": submission_attempts.duplicate(true),
		"submission_attempt_order": submission_attempt_order.duplicate(true),
		"procedural_results": procedural_results.duplicate(true),
		"procedural_result_order": procedural_result_order.duplicate(true),
		"record_materialization_events": record_materialization_events.duplicate(true),
		"record_materialization_order": record_materialization_order.duplicate(true),
		"court_record_entries": court_record_entries.duplicate(true),
		"court_record_entry_order": court_record_entry_order.duplicate(true),
		"fact_propositions": fact_propositions.duplicate(true),
		"fact_proposition_order": fact_proposition_order.duplicate(true),
		"recognition_criteria": recognition_criteria.duplicate(true),
		"recognition_criterion_order": recognition_criterion_order.duplicate(true),
		"court_record_snapshots": court_record_snapshots.duplicate(true),
		"court_record_snapshot_order": court_record_snapshot_order.duplicate(true),
		"sufficiency_evaluation_traces": sufficiency_evaluation_traces.duplicate(true),
		"sufficiency_evaluation_trace_order": sufficiency_evaluation_trace_order.duplicate(true),
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
	# Preserve the predecessor debug-snapshot absence invariant until VS-006 creates a finding.
	if not court_fact_findings.is_empty():
		result["court_fact_findings"] = court_fact_findings.duplicate(true)
		result["court_fact_finding_order"] = court_fact_finding_order.duplicate(true)
	return result
