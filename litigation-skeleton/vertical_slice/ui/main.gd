extends Control

const ContentLoader = preload("res://vertical_slice/services/content_loader.gd")
const SliceService = preload("res://vertical_slice/services/slice_service.gd")
const SlicePresenter = preload("res://vertical_slice/presentation/slice_presenter.gd")

const CONTENT_PATH := "res://vertical_slice/content/slice_case.json"
const PLAYER_ACTOR_ID := "VS-LAWYER-001"
const PLAYER_TEAM_ID := "VS-TEAM-001"

var _service = SliceService.new()
var _presenter = SlicePresenter.new()
var _scope_rows: Array = []

@onready var start_button: Button = %StartButton
@onready var status_label: Label = %StatusLabel
@onready var case_header_label: Label = %CaseHeaderLabel
@onready var source_list: ItemList = %SourceList
@onready var open_button: Button = %OpenButton
@onready var source_detail: TextEdit = %SourceDetail
@onready var assertions_label: Label = %AssertionsLabel
@onready var gaps_label: Label = %GapsLabel


func _ready() -> void:
	start_button.pressed.connect(_on_start_pressed)
	open_button.pressed.connect(_on_open_pressed)
	source_list.item_selected.connect(_on_item_selected)
	open_button.disabled = true
	status_label.text = "사건을 시작하면 authorized 초기 자료를 불러옵니다."


func _on_start_pressed() -> void:
	var loaded: Dictionary = ContentLoader.new().load_json_file(CONTENT_PATH)
	if not loaded.get("ok", false):
		status_label.text = "콘텐츠 로딩 실패: %s" % loaded.get("error", "unknown")
		return
	var started: Dictionary = _service.start_session(loaded["content"], PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not started.get("ok", false):
		status_label.text = "세션 시작 실패: %s" % started.get("error", "unknown")
		return
	start_button.disabled = true
	status_label.text = "사건 검토 세션 %s 시작" % started["session_id"]
	_refresh_case_file()


func _refresh_case_file() -> void:
	var result: Dictionary = _service.case_file_projection(PLAYER_ACTOR_ID, PLAYER_TEAM_ID)
	if not result.get("ok", false):
		status_label.text = "Case File 조회 실패: %s" % result.get("error", "unknown")
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


func _on_item_selected(_index: int) -> void:
	open_button.disabled = false


func _on_open_pressed() -> void:
	var selected := source_list.get_selected_items()
	if selected.is_empty():
		status_label.text = "열람할 자료 범위를 선택하십시오."
		return
	var row: Dictionary = source_list.get_item_metadata(selected[0])
	var result: Dictionary = _service.read_source(
		PLAYER_ACTOR_ID, PLAYER_TEAM_ID, row["source_id"], row["source_version"], [row["scope_id"]])
	if not result.get("ok", false):
		status_label.text = "자료 열람 실패: %s" % result.get("error", "unknown")
		return
	source_detail.text = _presenter.source_detail(result["source"])
	status_label.text = "%s 범위를 열람했습니다. Review 완료 상태는 생성되지 않습니다." % row["scope_id"]
