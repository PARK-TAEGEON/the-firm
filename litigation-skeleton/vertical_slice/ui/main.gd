extends Control

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")
const SlicePresenter = preload("res://vertical_slice/presentation/slice_presenter.gd")

const CONTENT_PATH := "res://vertical_slice/content/slice_case.json"
const LOCALE_PATH := "res://vertical_slice/content/locale_ko.json"
const PLAYER_ACTOR_ID := "VS-LAWYER-001"
const PLAYER_TEAM_ID := "VS-TEAM-001"
const REVIEW_TASK_ID := "VS-TASK-REVIEW-001"
const REVIEW_WORK_PRODUCT_ID := "VS-WP-REVIEW-001"
const THEORY_ID := "VS-THEORY-001"

var _service = SliceService.new()
var _presenter = SlicePresenter.new()
var _scope_rows: Array = []
var _work_projection: Dictionary = {}
var _investigation_projection: Dictionary = {}
var _legal_projection: Dictionary = {}
var _submission_projection: Dictionary = {}

@onready var start_button: Button = %StartButton
@onready var status_label: Label = %StatusLabel
@onready var case_header_label: Label = %CaseHeaderLabel
@onready var source_list: ItemList = %SourceList
@onready var open_button: Button = %OpenButton
@onready var source_detail: TextEdit = %SourceDetail
@onready var assertions_label: Label = %AssertionsLabel
@onready var gaps_label: Label = %GapsLabel
@onready var review_status_label: Label = %ReviewStatusLabel
@onready var strategy_status_label: Label = %StrategyStatusLabel
@onready var assign_button: Button = %AssignButton
@onready var execute_button: Button = %ExecuteButton
@onready var complete_button: Button = %CompleteButton
@onready var analysis_options: OptionButton = %AnalysisOptions
@onready var issue_options: OptionButton = %IssueOptions
@onready var select_issue_button: Button = %SelectIssueButton
@onready var theory_input: TextEdit = %TheoryInput
@onready var save_theory_button: Button = %SaveTheoryButton
@onready var investigation_options: OptionButton = %InvestigationOptions
@onready var investigation_opportunity_label: Label = %InvestigationOpportunityLabel
@onready var investigation_status_label: Label = %InvestigationStatusLabel
@onready var create_investigation_button: Button = %CreateInvestigationButton
@onready var assign_investigation_button: Button = %AssignInvestigationButton
@onready var execute_investigation_button: Button = %ExecuteInvestigationButton
@onready var complete_investigation_button: Button = %CompleteInvestigationButton
@onready var acquisition_id_input: LineEdit = %AcquisitionIdInput
@onready var boundary_label: Label = %Boundary
@onready var tabs: TabContainer = %Tabs
@onready var investigation_tab: ScrollContainer = %Investigation
@onready var investigation_heading: Label = %Heading
@onready var acquisition_help: Label = %AcquisitionHelp
@onready var legal_heading: Label = %LegalHeading
@onready var legal_tab: ScrollContainer = get_node("%Legal Research")
@onready var legal_question_options: OptionButton = %LegalQuestionOptions
@onready var create_legal_task_button: Button = %CreateLegalTaskButton
@onready var assign_legal_task_button: Button = %AssignLegalTaskButton
@onready var execute_legal_task_button: Button = %ExecuteLegalTaskButton
@onready var complete_legal_task_button: Button = %CompleteLegalTaskButton
@onready var legal_source_options: OptionButton = %LegalSourceOptions
@onready var open_legal_source_button: Button = %OpenLegalSourceButton
@onready var review_legal_source_button: Button = %ReviewLegalSourceButton
@onready var legal_source_detail: TextEdit = %LegalSourceDetail
@onready var argument_path_options: OptionButton = %ArgumentPathOptions
@onready var extract_button: Button = %ExtractButton
@onready var rule_button: Button = %RuleButton
@onready var interpret_button: Button = %InterpretButton
@onready var analyze_button: Button = %AnalyzeButton
@onready var create_argument_button: Button = %CreateArgumentButton
@onready var select_argument_button: Button = %SelectArgumentButton
@onready var legal_status_label: Label = %LegalStatusLabel
@onready var submission_tab: ScrollContainer = get_node("%Submission & Record")
@onready var submission_heading: Label = %SubmissionHeading
@onready var submission_status_label: Label = %SubmissionStatusLabel
@onready var create_drafting_task_button: Button = %CreateDraftingTaskButton
@onready var assign_drafting_button: Button = %AssignDraftingButton
@onready var execute_drafting_button: Button = %ExecuteDraftingButton
@onready var complete_drafting_button: Button = %CompleteDraftingButton
@onready var finalize_document_button: Button = %FinalizeDocumentButton
@onready var submission_package_options: OptionButton = %SubmissionPackageOptions
@onready var submit_document_button: Button = %SubmitDocumentButton
@onready var materialize_result_button: Button = %MaterializeResultButton
@onready var materialize_record_button: Button = %MaterializeRecordButton


func _ready() -> void:
	var locale: Dictionary = ContentLoader.new().load_json_file(LOCALE_PATH)
	if locale.get("ok", false) and locale["content"].get("strings") is Dictionary:
		_presenter.bind_localization(locale["content"]["strings"])
	_localize_vs003_controls()
	_localize_vs004_controls()
	_localize_vs005_controls()
	start_button.pressed.connect(_on_start_pressed)
	open_button.pressed.connect(_on_open_pressed)
	source_list.item_selected.connect(func(_index: int) -> void: open_button.disabled = false)
	assign_button.pressed.connect(_on_assign_pressed)
	execute_button.pressed.connect(_on_execute_pressed)
	complete_button.pressed.connect(_on_complete_pressed)
	select_issue_button.pressed.connect(_on_select_issue_pressed)
	save_theory_button.pressed.connect(_on_save_theory_pressed)
	investigation_options.item_selected.connect(_on_investigation_selected)
	create_investigation_button.pressed.connect(_on_create_investigation_pressed)
	assign_investigation_button.pressed.connect(_on_assign_investigation_pressed)
	execute_investigation_button.pressed.connect(_on_execute_investigation_pressed)
	complete_investigation_button.pressed.connect(_on_complete_investigation_pressed)
	create_legal_task_button.pressed.connect(_on_create_legal_task_pressed)
	assign_legal_task_button.pressed.connect(_on_assign_legal_task_pressed)
	execute_legal_task_button.pressed.connect(_on_execute_legal_task_pressed)
	complete_legal_task_button.pressed.connect(_on_complete_legal_task_pressed)
	open_legal_source_button.pressed.connect(_on_open_legal_source_pressed)
	review_legal_source_button.pressed.connect(_on_review_legal_source_pressed)
	extract_button.pressed.connect(_on_extract_pressed)
	rule_button.pressed.connect(_on_rule_pressed)
	interpret_button.pressed.connect(_on_interpret_pressed)
	analyze_button.pressed.connect(_on_analyze_pressed)
	create_argument_button.pressed.connect(_on_create_argument_pressed)
	select_argument_button.pressed.connect(_on_select_argument_pressed)
	create_drafting_task_button.pressed.connect(_on_create_drafting_task_pressed)
	assign_drafting_button.pressed.connect(_on_assign_drafting_pressed)
	execute_drafting_button.pressed.connect(_on_execute_drafting_pressed)
	complete_drafting_button.pressed.connect(_on_complete_drafting_pressed)
	finalize_document_button.pressed.connect(_on_finalize_document_pressed)
	submit_document_button.pressed.connect(_on_submit_document_pressed)
	materialize_result_button.pressed.connect(_on_materialize_result_pressed)
	materialize_record_button.pressed.connect(_on_materialize_record_pressed)
	_set_work_controls_disabled(true)
	_set_investigation_controls_disabled(true)
	_set_legal_controls_disabled(true)
	_set_submission_controls_disabled(true)
	open_button.disabled = true
	status_label.text = "사건을 시작하면 authorized 초기 자료와 review Task를 불러옵니다."


func _on_start_pressed() -> void:
	var loaded: Dictionary = ContentLoader.new().load_json_file(CONTENT_PATH)
	if not loaded.get("ok", false):
		_show_error("콘텐츠 로딩", loaded)
		return
	var started: Dictionary = _service.start_session(
		loaded["content"], PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not started.get("ok", false):
		_show_error("세션 시작", started)
		return
	start_button.disabled = true
	status_label.text = "사건 검토 세션 %s 시작" % started["session_id"]
	_refresh_case_file()
	_refresh_work()
	_refresh_investigation()
	_refresh_legal_research()
	_refresh_submission()


func _refresh_case_file() -> void:
	var result: Dictionary = _service.case_file_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not result.get("ok", false):
		_show_error("Case File 조회", result)
		return
	var projection: Dictionary = result["projection"]
	case_header_label.text = _presenter.case_header(projection)
	assertions_label.text = _presenter.assertion_text(projection)
	gaps_label.text = _presenter.known_gaps_text(projection)
	_scope_rows = _presenter.source_scope_rows(projection)
	source_list.clear()
	for row in _scope_rows:
		var index := source_list.add_item(row["label"])
		source_list.set_item_metadata(index, row.duplicate(true))
	source_detail.text = "왼쪽에서 허용된 자료 범위를 선택하십시오."
	open_button.disabled = true


func _refresh_work() -> void:
	var result: Dictionary = _service.work_strategy_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not result.get("ok", false):
		_show_error("Work/Strategy 조회", result)
		return
	_work_projection = result["projection"]
	review_status_label.text = _presenter.review_status_text(_work_projection)
	strategy_status_label.text = _presenter.strategy_status_text(_work_projection)
	analysis_options.clear()
	for option in _work_projection["review_analysis_options"]:
		analysis_options.add_item(option["label"])
		analysis_options.set_item_metadata(analysis_options.item_count - 1, option["id"])
	issue_options.clear()
	for issue in _work_projection["issues"]:
		issue_options.add_item("%s — %s" % [issue["label"], issue["question"]])
		issue_options.set_item_metadata(issue_options.item_count - 1, issue["id"])
	var task: Dictionary = _work_projection["tasks"][0]
	assign_button.disabled = task["state"] != "unassigned"
	execute_button.disabled = task["state"] not in ["assigned", "in_progress"]
	complete_button.disabled = task["state"] != "in_progress"
	analysis_options.disabled = task["state"] == "completed"
	var has_work_product: bool = not _work_projection["review_work_products"].is_empty()
	issue_options.disabled = not has_work_product
	select_issue_button.disabled = not has_work_product
	var has_selection: bool = not _work_projection["issue_selections"].is_empty()
	theory_input.editable = has_selection
	save_theory_button.disabled = not has_selection
	save_theory_button.text = "Theory 새 버전 저장" if not _work_projection["case_theories"].is_empty() else "CaseTheory 생성"


func _refresh_investigation() -> void:
	var selected_action_id := _selected_investigation_action_id()
	var result: Dictionary = _service.investigation_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not result.get("ok", false):
		_show_error(_presenter.localized_text("ui.vs003.query_label"), result)
		return
	_investigation_projection = result["projection"]
	investigation_options.disabled = false
	investigation_options.clear()
	for opportunity in _investigation_projection["opportunities"]:
		investigation_options.add_item(_presenter.localized_text(opportunity["label"]))
		investigation_options.set_item_metadata(investigation_options.item_count - 1, opportunity["id"])
		if opportunity["id"] == selected_action_id:
			investigation_options.select(investigation_options.item_count - 1)
	if investigation_options.selected < 0 and investigation_options.item_count > 0:
		investigation_options.select(0)
	_update_investigation_selection()


func _on_open_pressed() -> void:
	var selected := source_list.get_selected_items()
	if selected.is_empty():
		status_label.text = "열람할 자료 범위를 선택하십시오."
		return
	var row: Dictionary = source_list.get_item_metadata(selected[0])
	var result: Dictionary = _service.read_source(
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, row["source_id"], row["source_version"],
		[row["scope_id"]])
	if not result.get("ok", false):
		_show_error("자료 열람", result)
		return
	source_detail.text = _presenter.source_detail(result["source"])
	status_label.text = "%s 범위를 열람했습니다. 열람만으로 review가 완료되지는 않습니다." % row["scope_id"]


func _on_assign_pressed() -> void:
	_apply_action("Task 배정", _service.assign_task(
		REVIEW_TASK_ID, "VS-ASSIGN-UI-001", PLAYER_ACTOR_ID, PLAYER_ACTOR_ID,
		PLAYER_TEAM_ID))


func _on_execute_pressed() -> void:
	var scopes: Array = _work_projection["tasks"][0]["definition"]["authorized_source_scopes"].duplicate(true)
	_apply_action("Review 수행", _service.execute_task(
		REVIEW_TASK_ID, "VS-EXEC-UI-001", PLAYER_ACTOR_ID, PLAYER_TEAM_ID,
		"VS-WORK-BLOCK-UI-001", 2, scopes))


func _on_complete_pressed() -> void:
	var option_id: String = analysis_options.get_item_metadata(analysis_options.selected)
	_apply_action("Review 완료", _service.complete_review_task(
		REVIEW_TASK_ID, "VS-COMPLETE-UI-001", REVIEW_WORK_PRODUCT_ID,
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, option_id))


func _on_select_issue_pressed() -> void:
	if issue_options.selected < 0:
		status_label.text = "Issue를 선택하십시오."
		return
	var issue_id: String = issue_options.get_item_metadata(issue_options.selected)
	var selection_id := "VS-ISSUE-SELECT-UI-%03d" % (_work_projection["issue_selections"].size() + 1)
	_apply_action("Issue 선택", _service.select_issue(
		issue_id, selection_id, PLAYER_ACTOR_ID, PLAYER_TEAM_ID,
		REVIEW_WORK_PRODUCT_ID))


func _on_save_theory_pressed() -> void:
	var statement := theory_input.text.strip_edges()
	if statement.is_empty():
		status_label.text = "Theory 분석 문장을 입력하십시오."
		return
	if _work_projection["case_theories"].is_empty():
		var selection: Dictionary = _work_projection["issue_selections"][-1]
		var issue: Dictionary = _issue_by_id(selection["issue_id"])
		var work_product: Dictionary = _work_projection["review_work_products"][-1]
		var analysis_id: String = work_product["professional_analyses"][0]["id"]
		_apply_action("CaseTheory 생성", _service.create_case_theory(
			THEORY_ID, "VS-THEORY-001-V1", issue["id"], REVIEW_WORK_PRODUCT_ID,
			PLAYER_ACTOR_ID, PLAYER_TEAM_ID, statement,
			issue["basis_assertion_refs"], issue["known_gap_refs"], [analysis_id],
			issue["known_gap_refs"]))
	else:
		var lineage: Dictionary = _work_projection["theory_lineages"][THEORY_ID]
		var next_number: int = lineage["version_ids"].size() + 1
		_apply_action("CaseTheory 개정", _service.update_case_theory(
			THEORY_ID, "VS-THEORY-001-V%d" % next_number,
			lineage["current_version_id"], PLAYER_ACTOR_ID, PLAYER_TEAM_ID,
			statement))


func _on_investigation_selected(_index: int) -> void:
	_update_investigation_selection()


func _on_create_investigation_pressed() -> void:
	var action_id := _selected_investigation_action_id()
	var suffix := "%03d" % (_investigation_projection["tasks"].size() + 1)
	_apply_investigation_action(_presenter.localized_text("ui.vs003.create_action"), _service.create_investigation_task(
		action_id, "VS-TASK-INV-UI-" + suffix, "VS-EVENT-INV-CREATE-UI-" + suffix,
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_assign_investigation_pressed() -> void:
	var task := _selected_investigation_task()
	if task.is_empty():
		status_label.text = _presenter.localized_text("ui.vs003.create_first")
		return
	_apply_investigation_action(_presenter.localized_text("ui.vs003.assign_action"), _service.assign_task(
		task["id"], "VS-ASSIGN-INV-UI-%03d" % (_investigation_projection["tasks"].size()),
		PLAYER_ACTOR_ID, PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_execute_investigation_pressed() -> void:
	var task := _selected_investigation_task()
	if task.is_empty():
		status_label.text = _presenter.localized_text("ui.vs003.create_first")
		return
	var suffix := "%03d" % (_investigation_projection["tasks"].find(task) + 1)
	_apply_investigation_action(_presenter.localized_text("ui.vs003.execute_action"), _service.execute_investigation_task(
		task["id"], "VS-EXEC-INV-UI-" + suffix, PLAYER_ACTOR_ID, PLAYER_TEAM_ID,
		"VS-WORK-INV-UI-" + suffix, 1))


func _on_complete_investigation_pressed() -> void:
	var task := _selected_investigation_task()
	if task.is_empty():
		status_label.text = _presenter.localized_text("ui.vs003.create_first")
		return
	var suffix := "%03d" % (_investigation_projection["results"].size() + 1)
	_apply_investigation_action(_presenter.localized_text("ui.vs003.complete_action"), _service.complete_investigation_task(
		task["id"], "VS-COMPLETE-INV-UI-" + suffix, "VS-RESULT-INV-UI-" + suffix,
		acquisition_id_input.text.strip_edges(), PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _selected_investigation_action_id() -> String:
	if investigation_options == null or investigation_options.selected < 0:
		return ""
	return investigation_options.get_item_metadata(investigation_options.selected)


func _selected_investigation_task() -> Dictionary:
	var action_id := _selected_investigation_action_id()
	for opportunity in _investigation_projection.get("opportunities", []):
		if opportunity["id"] == action_id and not opportunity["task_id"].is_empty():
			for task in _investigation_projection["tasks"]:
				if task["id"] == opportunity["task_id"]:
					return task
	return {}


func _update_investigation_selection() -> void:
	var action_id := _selected_investigation_action_id()
	var opportunity: Dictionary = {}
	for candidate in _investigation_projection.get("opportunities", []):
		if candidate["id"] == action_id:
			opportunity = candidate
			break
	if opportunity.is_empty():
		_set_investigation_controls_disabled(true)
		return
	investigation_opportunity_label.text = _presenter.investigation_opportunity_text(opportunity)
	investigation_status_label.text = _presenter.investigation_status_text(
		_investigation_projection, action_id)
	var task := _selected_investigation_task()
	create_investigation_button.disabled = opportunity["created"]
	assign_investigation_button.disabled = task.is_empty() or task["state"] != "unassigned"
	execute_investigation_button.disabled = task.is_empty() or task["state"] not in ["assigned", "in_progress"]
	complete_investigation_button.disabled = task.is_empty() or task["state"] != "in_progress"
	acquisition_id_input.editable = not complete_investigation_button.disabled


func _issue_by_id(issue_id: String) -> Dictionary:
	for issue in _work_projection["issues"]:
		if issue["id"] == issue_id:
			return issue
	return {}


func _apply_action(label: String, result: Dictionary) -> void:
	if not result.get("ok", false):
		_show_error(label, result)
		return
	status_label.text = "%s 완료 — 명시적 domain event가 기록되었습니다." % label
	_refresh_work()
	_refresh_investigation()
	_refresh_legal_research()


func _apply_investigation_action(label: String, result: Dictionary) -> void:
	if not result.get("ok", false):
		_show_error(label, result)
		return
	status_label.text = _presenter.localized_text("ui.vs003.action_recorded", [label])
	_refresh_work()
	_refresh_investigation()
	_refresh_case_file()
	_refresh_legal_research()


func _show_error(label: String, result: Dictionary) -> void:
	status_label.text = "%s 실패: %s" % [label, result.get("error", "unknown")]


func _set_work_controls_disabled(disabled: bool) -> void:
	assign_button.disabled = disabled
	execute_button.disabled = disabled
	complete_button.disabled = disabled
	analysis_options.disabled = disabled
	issue_options.disabled = disabled
	select_issue_button.disabled = disabled
	theory_input.editable = not disabled
	save_theory_button.disabled = disabled


func _set_investigation_controls_disabled(disabled: bool) -> void:
	investigation_options.disabled = disabled
	create_investigation_button.disabled = disabled
	assign_investigation_button.disabled = disabled
	execute_investigation_button.disabled = disabled
	complete_investigation_button.disabled = disabled
	acquisition_id_input.editable = not disabled


func _localize_vs003_controls() -> void:
	boundary_label.text = _presenter.localized_text("ui.vs003.boundary")
	investigation_heading.text = _presenter.localized_text("ui.vs003.heading")
	create_investigation_button.text = _presenter.localized_text("ui.vs003.create_button")
	assign_investigation_button.text = _presenter.localized_text("ui.vs003.assign_button")
	execute_investigation_button.text = _presenter.localized_text("ui.vs003.execute_button")
	complete_investigation_button.text = _presenter.localized_text("ui.vs003.complete_button")
	acquisition_help.text = _presenter.localized_text("ui.vs003.acquisition_help")
	acquisition_id_input.placeholder_text = _presenter.localized_text("ui.vs003.acquisition_placeholder")
	investigation_opportunity_label.text = _presenter.localized_text("ui.vs003.before_start")
	investigation_status_label.text = _presenter.localized_text("ui.vs003.empty_status")
	var tab_index := tabs.get_tab_idx_from_control(investigation_tab)
	if tab_index >= 0:
		tabs.set_tab_title(tab_index, _presenter.localized_text("ui.vs003.tab"))


func _refresh_legal_research() -> void:
	var result: Dictionary = _service.legal_research_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not result.get("ok", false):
		_show_error(_presenter.localized_text("ui.vs004.query"), result)
		return
	_legal_projection = result["projection"]
	legal_status_label.text = _presenter.legal_research_status_text(_legal_projection)
	legal_question_options.clear()
	for question in _legal_projection["questions"]:
		legal_question_options.add_item("%s — %s" % [_presenter.localized_text(question["label"]),
			_presenter.localized_text(question["question"])])
		legal_question_options.set_item_metadata(legal_question_options.item_count - 1, question["id"])
	legal_source_options.clear()
	for source in _legal_projection["legal_sources"]:
		for scope in source["scope_labels"]:
			legal_source_options.add_item("%s — %s" % [_presenter.localized_text(source["title"]),
				_presenter.localized_text(scope["label"])])
			legal_source_options.set_item_metadata(legal_source_options.item_count - 1, {
				"legal_source_id": source["id"], "legal_source_version": source["version"],
				"scope_id": scope["id"]})
	argument_path_options.clear()
	for path in _legal_projection["argument_paths"]:
		argument_path_options.add_item(_presenter.localized_text(path["label"]))
		argument_path_options.set_item_metadata(argument_path_options.item_count - 1, path.duplicate(true))
	var task := _legal_task()
	create_legal_task_button.disabled = not task.is_empty() or _work_projection.get("case_theories", []).is_empty()
	assign_legal_task_button.disabled = task.is_empty() or task["state"] != "unassigned"
	execute_legal_task_button.disabled = task.is_empty() or task["state"] not in ["assigned", "in_progress"]
	complete_legal_task_button.disabled = task.is_empty() or task["state"] != "in_progress"
	var no_source := legal_source_options.item_count == 0
	open_legal_source_button.disabled = no_source
	review_legal_source_button.disabled = no_source
	var no_path := argument_path_options.item_count == 0
	for button in [extract_button, rule_button, interpret_button, analyze_button,
		create_argument_button, select_argument_button]:
		button.disabled = no_path


func _legal_task() -> Dictionary:
	for task in _work_projection.get("tasks", []):
		if task["id"] == "VS-TASK-LEGAL-UI-001": return task
	return {}


func _selected_legal_scope() -> Dictionary:
	if legal_source_options.selected < 0: return {}
	return legal_source_options.get_item_metadata(legal_source_options.selected)


func _selected_argument_path() -> Dictionary:
	if argument_path_options.selected < 0: return {}
	return argument_path_options.get_item_metadata(argument_path_options.selected)


func _path_suffix(path: Dictionary) -> String:
	return "001" if path.get("argument_recipe_id", "").ends_with("001") else "002"


func _record_id_by_recipe(collection_name: String, recipe_id: String) -> String:
	for record in _legal_projection.get(collection_name, []):
		if record.get("recipe_id", "") == recipe_id: return record["id"]
	return ""


func _review_id_for_path(path: Dictionary) -> String:
	for review in _legal_projection.get("review_events", []):
		if review["legal_source_id"] == path["legal_source_id"] \
				and review["legal_source_version"] == path["legal_source_version"] \
				and review["scope_id"] == path["scope_id"]:
			return review["id"]
	return ""


func _factual_basis_for_path(path: Dictionary) -> Array:
	var refs: Array = [{"basis_type": "ReviewWorkProduct", "id": "VS-WP-REVIEW-001"}]
	if not path.get("argument_recipe_id", "").ends_with("001"): return refs
	for result in _investigation_projection.get("results", []):
		if result.get("investigation_action_id", "") == "VS-INV-ACTION-001":
			refs.append({"basis_type": "InvestigationResult", "id": result["id"]})
			for acquisition in _investigation_projection.get("acquisitions", []):
				if acquisition.get("investigation_result_id", "") == result["id"]:
					refs.append({"basis_type": "SourceMaterial", "id": acquisition["id"]})
					return refs
	return refs


func _on_create_legal_task_pressed() -> void:
	var question_id: String = legal_question_options.get_item_metadata(legal_question_options.selected)
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.create_task"), _service.create_legal_research_task(question_id,
		"VS-TASK-LEGAL-UI-001", "VS-EVENT-LEGAL-UI-001", PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_assign_legal_task_pressed() -> void:
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.assign"), _service.assign_task("VS-TASK-LEGAL-UI-001",
		"VS-ASSIGN-LEGAL-UI-001", PLAYER_ACTOR_ID, PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_execute_legal_task_pressed() -> void:
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.execute"), _service.execute_legal_research_task(
		"VS-TASK-LEGAL-UI-001", "VS-EXEC-LEGAL-UI-001", PLAYER_ACTOR_ID, PLAYER_TEAM_ID,
		"VS-WORK-LEGAL-UI-001", 2))


func _on_complete_legal_task_pressed() -> void:
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.complete"), _service.complete_legal_research_task(
		"VS-TASK-LEGAL-UI-001", "VS-COMP-LEGAL-UI-001",
		["VS-DISC-LEGAL-UI-001", "VS-DISC-LEGAL-UI-002"], PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_open_legal_source_pressed() -> void:
	var scope := _selected_legal_scope()
	if scope.is_empty(): return
	var result: Dictionary = _service.read_legal_source(PLAYER_ACTOR_ID, PLAYER_TEAM_ID,
		scope["legal_source_id"], scope["legal_source_version"], [scope["scope_id"]])
	if not result.get("ok", false): _show_error(_presenter.localized_text("ui.vs004.action.open"), result); return
	legal_source_detail.text = _presenter.legal_source_detail(result["legal_source"])
	status_label.text = _presenter.localized_text("ui.vs004.source_opened")


func _on_review_legal_source_pressed() -> void:
	var scope := _selected_legal_scope()
	if scope.is_empty(): return
	var sequence := 1
	for task in _work_projection.get("tasks", []):
		if task.get("legal_research_work_kind", "") == "source_review": sequence += 1
	var suffix := "%03d" % sequence
	var task_id := "VS-TASK-LEGAL-REVIEW-UI-" + suffix
	var steps: Array = [
		_service.create_legal_source_review_task(scope["legal_source_id"], scope["legal_source_version"],
			scope["scope_id"], task_id, "VS-EVENT-LEGAL-REVIEW-UI-" + suffix,
			PLAYER_ACTOR_ID, PLAYER_TEAM_ID),
	]
	if not steps[0].get("ok", false): _show_error(_presenter.localized_text("ui.vs004.action.review"), steps[0]); return
	var assigned: Dictionary = _service.assign_task(task_id, "VS-ASSIGN-LEGAL-REVIEW-UI-" + suffix,
		PLAYER_ACTOR_ID, PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not assigned.get("ok", false): _show_error(_presenter.localized_text("ui.vs004.action.review"), assigned); _refresh_work(); return
	var executed: Dictionary = _service.execute_legal_research_task(task_id,
		"VS-EXEC-LEGAL-REVIEW-UI-" + suffix, PLAYER_ACTOR_ID, PLAYER_TEAM_ID,
		"VS-WORK-LEGAL-REVIEW-UI-" + suffix, 2)
	if not executed.get("ok", false): _show_error(_presenter.localized_text("ui.vs004.action.review"), executed); _refresh_work(); return
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.review"), _service.review_legal_source(
		"VS-REVIEW-LEGAL-UI-" + suffix, "VS-COMP-LEGAL-REVIEW-UI-" + suffix, task_id,
		scope["legal_source_id"], scope["legal_source_version"], scope["scope_id"],
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_extract_pressed() -> void:
	var path := _selected_argument_path(); if path.is_empty(): return
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.extract"), _service.record_legal_extraction(
		"VS-EXT-UI-" + _path_suffix(path), path["extraction_recipe_id"], _review_id_for_path(path),
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_rule_pressed() -> void:
	var path := _selected_argument_path(); if path.is_empty(): return
	var extraction_id := _record_id_by_recipe("recorded_legal_extractions", path["extraction_recipe_id"])
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.rule"), _service.create_rule_statement("VS-RULE-UI-" + _path_suffix(path),
		path["rule_recipe_id"], [extraction_id], PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_interpret_pressed() -> void:
	var path := _selected_argument_path(); if path.is_empty(): return
	var rule_id := _record_id_by_recipe("rule_statements", path["rule_recipe_id"])
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.interpret"), _service.consider_legal_interpretation(
		"VS-INT-UI-" + _path_suffix(path), path["interpretation_recipe_id"], [rule_id],
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_analyze_pressed() -> void:
	var path := _selected_argument_path(); if path.is_empty(): return
	var rule_id := _record_id_by_recipe("rule_statements", path["rule_recipe_id"])
	var interpretation_id := _record_id_by_recipe("interpretation_candidates", path["interpretation_recipe_id"])
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.analyze"), _service.create_issue_analysis("VS-IA-UI-" + _path_suffix(path),
		path["issue_analysis_recipe_id"], "VS-TASK-LEGAL-UI-001", [rule_id], [interpretation_id],
		_factual_basis_for_path(path), PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_create_argument_pressed() -> void:
	var path := _selected_argument_path(); if path.is_empty(): return
	var analysis_id := _record_id_by_recipe("issue_analyses", path["issue_analysis_recipe_id"])
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.argument"), _service.create_argument("VS-ARG-UI-" + _path_suffix(path),
		path["argument_recipe_id"], analysis_id, PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_select_argument_pressed() -> void:
	var path := _selected_argument_path(); if path.is_empty(): return
	var argument_id := _record_id_by_recipe("arguments", path["argument_recipe_id"])
	var selection_id := "VS-ARG-SEL-UI-%03d" % (_legal_projection["argument_selection_history"].size() + 1)
	_apply_legal_action(_presenter.localized_text("ui.vs004.action.select"), _service.select_argument(selection_id, argument_id,
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _apply_legal_action(label: String, result: Dictionary) -> void:
	if not result.get("ok", false): _show_error(label, result); return
	status_label.text = _presenter.localized_text("ui.vs004.action_recorded", [label])
	_refresh_work()
	_refresh_investigation()
	_refresh_case_file()
	_refresh_legal_research()
	_refresh_submission()


func _set_legal_controls_disabled(disabled: bool) -> void:
	for control in [legal_question_options, create_legal_task_button, assign_legal_task_button,
		execute_legal_task_button, complete_legal_task_button, legal_source_options,
		open_legal_source_button, review_legal_source_button, argument_path_options,
		extract_button, rule_button, interpret_button, analyze_button, create_argument_button,
		select_argument_button]:
		control.disabled = disabled


func _localize_vs004_controls() -> void:
	legal_heading.text = _presenter.localized_text("ui.vs004.heading")
	for pair in [[create_legal_task_button, "ui.vs004.create"], [assign_legal_task_button, "ui.vs004.assign"],
		[execute_legal_task_button, "ui.vs004.execute"], [complete_legal_task_button, "ui.vs004.complete"],
		[open_legal_source_button, "ui.vs004.open"], [review_legal_source_button, "ui.vs004.review"],
		[extract_button, "ui.vs004.extract"], [rule_button, "ui.vs004.rule"],
		[interpret_button, "ui.vs004.interpret"], [analyze_button, "ui.vs004.analyze"],
		[create_argument_button, "ui.vs004.argument"], [select_argument_button, "ui.vs004.select"]]:
		pair[0].text = _presenter.localized_text(pair[1])
	legal_status_label.text = _presenter.localized_text("ui.vs004.before_start")
	var tab_index := tabs.get_tab_idx_from_control(legal_tab)
	if tab_index >= 0: tabs.set_tab_title(tab_index, _presenter.localized_text("ui.vs004.tab"))


func _drafting_task() -> Dictionary:
	for task in _work_projection.get("tasks", []):
		if task["id"] == "VS-TASK-DRAFTING-UI-001": return task
	return {}


func _refresh_submission() -> void:
	var result: Dictionary = _service.submission_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not result.get("ok", false):
		_show_error("Submission 조회", result)
		return
	_submission_projection = result["projection"]
	submission_status_label.text = _presenter.submission_status_text(_submission_projection)
	var task: Dictionary = _drafting_task()
	var has_selection: bool = not _legal_projection.get("argument_selection_history", []).is_empty()
	create_drafting_task_button.disabled = not task.is_empty() or not has_selection
	assign_drafting_button.disabled = task.is_empty() or task["state"] != "unassigned"
	execute_drafting_button.disabled = task.is_empty() or task["state"] not in ["assigned", "in_progress"]
	complete_drafting_button.disabled = task.is_empty() or task["state"] != "in_progress"
	finalize_document_button.disabled = _submission_projection["draft_work_products"].is_empty() \
		or not _submission_projection["finalized_documents"].is_empty()
	submit_document_button.disabled = _submission_projection["finalized_documents"].is_empty() \
		or not _submission_projection["submission_attempts"].is_empty()
	submission_package_options.disabled = submit_document_button.disabled
	materialize_result_button.disabled = _submission_projection["submission_attempts"].is_empty() \
		or not _submission_projection["procedural_results"].is_empty()
	materialize_record_button.disabled = _submission_projection["procedural_results"].is_empty() \
		or _submission_projection["procedural_results"][-1]["kind"] != "accepted_for_record" \
		or not _submission_projection["court_record_entries"].is_empty()


func _on_create_drafting_task_pressed() -> void:
	_apply_submission_action(_presenter.localized_text("ui.vs005.create_draft"),
		_service.create_drafting_task("VS-TASKDEF-DRAFTING-001", "VS-TASK-DRAFTING-UI-001",
			"VS-EVENT-DRAFTING-UI-001", PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_assign_drafting_pressed() -> void:
	_apply_submission_action(_presenter.localized_text("ui.vs005.assign"),
		_service.assign_task("VS-TASK-DRAFTING-UI-001", "VS-ASSIGN-DRAFTING-UI-001",
			PLAYER_ACTOR_ID, PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_execute_drafting_pressed() -> void:
	_apply_submission_action(_presenter.localized_text("ui.vs005.execute"),
		_service.execute_drafting_task("VS-TASK-DRAFTING-UI-001", "VS-EXEC-DRAFTING-UI-001",
			PLAYER_ACTOR_ID, PLAYER_TEAM_ID, "VS-WORK-DRAFTING-UI-001", 1))


func _on_complete_drafting_pressed() -> void:
	if _legal_projection.get("argument_selection_history", []).is_empty(): return
	var selection: Dictionary = _legal_projection["argument_selection_history"][-1]
	_apply_submission_action(_presenter.localized_text("ui.vs005.complete"),
		_service.complete_drafting_task("VS-TASK-DRAFTING-UI-001", "VS-COMP-DRAFTING-UI-001",
			"VS-DRAFT-WP-UI-001", selection["argument_id"], selection["id"],
			PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_finalize_document_pressed() -> void:
	_apply_submission_action(_presenter.localized_text("ui.vs005.finalize"),
		_service.finalize_document("VS-FINAL-DOC-UI-001", "1", "VS-DRAFT-WP-UI-001",
			PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_submit_document_pressed() -> void:
	if submission_package_options.selected < 0: return
	var package_member_ids: Array = submission_package_options.get_item_metadata(
		submission_package_options.selected).duplicate()
	_apply_submission_action(_presenter.localized_text("ui.vs005.submit"),
		_service.create_submission_attempt("VS-ATTEMPT-UI-001", "VS-FINAL-DOC-UI-001", "1",
			"VS-SUBMISSION-RULE-001", "VS-TARGET-TRIAL-RECORD-001", "VS-ROUTE-ELECTRONIC-001",
			package_member_ids,
			"VS-DEADLINE-CONTEXT-001", PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_materialize_result_pressed() -> void:
	_apply_submission_action(_presenter.localized_text("ui.vs005.result_action"),
		_service.materialize_procedural_result("VS-RESULT-UI-001", "VS-ATTEMPT-UI-001",
			PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_materialize_record_pressed() -> void:
	_apply_submission_action(_presenter.localized_text("ui.vs005.record_action"),
		_service.materialize_court_record("VS-MATERIALIZATION-UI-001", "VS-COURT-ENTRY-UI-001",
			"VS-FINAL-DOC-UI-001", "1", "VS-ATTEMPT-UI-001", "VS-RESULT-UI-001",
			"VS-RECORD-RULE-001", PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _apply_submission_action(label: String, result: Dictionary) -> void:
	if not result.get("ok", false): _show_error(label, result); return
	status_label.text = "%s 완료" % label
	_refresh_work()
	_refresh_legal_research()
	_refresh_submission()


func _set_submission_controls_disabled(disabled: bool) -> void:
	for control in [create_drafting_task_button, assign_drafting_button, execute_drafting_button,
		complete_drafting_button, finalize_document_button, submit_document_button,
		materialize_result_button, materialize_record_button, submission_package_options]:
		control.disabled = disabled


func _localize_vs005_controls() -> void:
	submission_heading.text = _presenter.localized_text("ui.vs005.heading")
	submission_package_options.clear()
	submission_package_options.add_item(_presenter.localized_text("ui.vs005.package.complete"))
	submission_package_options.set_item_metadata(0,
		["VS-PACKAGE-MEMBER-DOCUMENT-001", "VS-PACKAGE-MEMBER-EXHIBIT-001"])
	submission_package_options.add_item(_presenter.localized_text("ui.vs005.package.omit_exhibit"))
	submission_package_options.set_item_metadata(1, ["VS-PACKAGE-MEMBER-DOCUMENT-001"])
	for pair in [[create_drafting_task_button, "ui.vs005.create_draft"],
		[assign_drafting_button, "ui.vs005.assign"], [execute_drafting_button, "ui.vs005.execute"],
		[complete_drafting_button, "ui.vs005.complete"], [finalize_document_button, "ui.vs005.finalize"],
		[submit_document_button, "ui.vs005.submit"], [materialize_result_button, "ui.vs005.result_action"],
		[materialize_record_button, "ui.vs005.record_action"]]:
		pair[0].text = _presenter.localized_text(pair[1])
	var tab_index := tabs.get_tab_idx_from_control(submission_tab)
	if tab_index >= 0: tabs.set_tab_title(tab_index, _presenter.localized_text("ui.vs005.tab"))
