extends Control

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")
const SlicePresenter = preload("res://vertical_slice/presentation/slice_presenter.gd")

const CONTENT_PATH := "res://vertical_slice/content/slice_case.json"
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


func _ready() -> void:
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
	_set_work_controls_disabled(true)
	_set_investigation_controls_disabled(true)
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
		_show_error("Investigation 조회", result)
		return
	_investigation_projection = result["projection"]
	investigation_options.disabled = false
	investigation_options.clear()
	for opportunity in _investigation_projection["opportunities"]:
		investigation_options.add_item(opportunity["label"])
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
	_apply_investigation_action("Investigation Task 생성", _service.create_investigation_task(
		action_id, "VS-TASK-INV-UI-" + suffix, "VS-EVENT-INV-CREATE-UI-" + suffix,
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_assign_investigation_pressed() -> void:
	var task := _selected_investigation_task()
	if task.is_empty():
		status_label.text = "먼저 Investigation Task를 생성하십시오."
		return
	_apply_investigation_action("Investigation Task 배정", _service.assign_task(
		task["id"], "VS-ASSIGN-INV-UI-%03d" % (_investigation_projection["tasks"].size()),
		PLAYER_ACTOR_ID, PLAYER_ACTOR_ID, PLAYER_TEAM_ID))


func _on_execute_investigation_pressed() -> void:
	var task := _selected_investigation_task()
	if task.is_empty():
		status_label.text = "먼저 Investigation Task를 생성하십시오."
		return
	var suffix := "%03d" % (_investigation_projection["tasks"].find(task) + 1)
	_apply_investigation_action("Investigation 수행", _service.execute_investigation_task(
		task["id"], "VS-EXEC-INV-UI-" + suffix, PLAYER_ACTOR_ID, PLAYER_TEAM_ID,
		"VS-WORK-INV-UI-" + suffix, 1))


func _on_complete_investigation_pressed() -> void:
	var task := _selected_investigation_task()
	if task.is_empty():
		status_label.text = "먼저 Investigation Task를 생성하십시오."
		return
	var suffix := "%03d" % (_investigation_projection["results"].size() + 1)
	_apply_investigation_action("Investigation 완료", _service.complete_investigation_task(
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


func _apply_investigation_action(label: String, result: Dictionary) -> void:
	if not result.get("ok", false):
		_show_error(label, result)
		return
	status_label.text = "%s 완료 — 명시적 domain event가 기록되었습니다." % label
	_refresh_work()
	_refresh_investigation()
	_refresh_case_file()


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
