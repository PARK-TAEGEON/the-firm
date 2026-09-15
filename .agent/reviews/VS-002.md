# VS-002 implementation review packet

## 작업 결과

VS-002 — Task Execution and Issue/Theory Selection을 VS-001 runtime 위에 구현했다. 플레이어는 기존 `VS-CASE-001` session에서 자료를 읽은 뒤 review Task를 별도로 배정하고, 명시적 work block으로 수행하고, 별도 완료 action으로 `ReviewWorkProduct`를 만든다. 그 WorkProduct를 근거로 Issue를 선택하고 `CaseTheory`를 생성·개정할 수 있다.

GUI와 headless suite는 모두 `ContentLoader → SliceService → WorkService → SliceState` 경로를 사용한다. UI가 authoritative state를 직접 변경하거나 테스트용 snapshot을 호출하지 않는다.

## 실제 변경 파일

신규:

- `vertical_slice/services/work_service.gd`
- `vertical_slice/tests/run_vs002_regressions.gd`
- `vertical_slice/vs002-test-results.log`

수정:

- `vertical_slice/content/slice_case.json`
- `vertical_slice/data/slice_state.gd`
- `vertical_slice/services/slice_service.gd`
- `vertical_slice/presentation/slice_presenter.gd`
- `vertical_slice/ui/main.tscn`
- `vertical_slice/ui/main.gd`
- `vertical_slice/tests/run_slice_regressions.gd`
- `vertical_slice/test-results.log`
- `README.md`
- `REVIEW_PACKET.md`
- `test-results.log` (legacy suite 재실행 결과)

기존 `data/litigation_state.gd`, `services/litigation_service.gd`, fixture, legacy test runner는 수정하지 않았다. 새 DEC/TEST/AUDIT 문서를 만들거나 수정하지 않았고, repository에 이미 있던 untracked architecture 문서는 이 작업 범위에서 제외했다.

## 구현된 사용자 동작

1. `사건 시작`으로 content version `1.1.0`의 기존 Matter/trial/player/team session을 연다.
2. `Case Review`에서 VS-001의 authorized 5개 source scope를 그대로 열람한다. 열람은 Task 상태를 바꾸지 않는다.
3. `Work & Theory`에서 `Task 배정`을 실행해 Assignment를 만든다.
4. `Review 수행`으로 2 work blocks와 exact reviewed scopes를 Execution에 기록한다.
5. 별도 `명시적 완료` action으로 Completion과 `VS-WP-REVIEW-001`을 만든다.
6. completed WorkProduct에 근거한 Issue를 선택한다.
7. CaseTheory v1을 만들고 이후 저장은 v2, v3처럼 새 version과 parent lineage를 만든다.

## 회귀 결과

Godot 4.7.2 stable / Windows에서 저장소 루트 기준으로 실행했다.

| 실행 | checks | failures | exit code |
|---|---:|---:|---:|
| legacy `res://tests/run_regressions.gd` | 214 | 0 | 0 |
| VS-001 `res://vertical_slice/tests/run_slice_regressions.gd` | 73 | 0 | 0 |
| VS-002 `res://vertical_slice/tests/run_vs002_regressions.gd` | 72 | 0 | 0 |
| main scene headless load (`--quit-after 2`) | 해당 없음 | script/scene error 없음 | 0 |

각 regression runner는 failure가 있으면 nonzero로 종료한다.

## 실제 GUI 확인

Godot GUI에서 다음을 직접 확인했다.

- main scene이 열리고 VS-001 Case Review 탭과 새 Work & Theory 탭이 함께 표시된다.
- `사건 시작` 후 기존 사건명, 의뢰 목표, trial stage와 authorized 5개 scope가 표시된다.
- 자료 하나를 선택하면 source/version/origin/exact scope와 SourceAssertion/CourtFactFinding 구분 문구가 표시된다.
- Work & Theory 탭에서 Task 상태와 required `2 work_block`이 표시된다.
- 배정과 수행을 거쳐 명시적 완료 후 `Completion: VS-COMPLETE-UI-001` 및 `ReviewWorkProduct: VS-WP-REVIEW-001`이 표시된다.
- Issue 선택과 Theory 입력 control이 completed WorkProduct 전에는 비활성이고 이후 활성화되는 화면 상태를 확인했다.

Issue 선택 후 Theory v1/v2의 interactive click-through는 desktop-control 채널 오류로 자동 검증하지 못했다. 동일 UI callback이 호출하는 service 경로의 Issue 선택, v1 생성, v2 개정은 VS-002 headless suite에서 통과했다. 검증하지 않은 GUI 동작을 확인한 것으로 확대 기록하지 않는다.

## 새로 강제한 경계

- `TaskDefinition ≠ TaskInstance ≠ Assignment ≠ Execution ≠ Completion ≠ ReviewWorkProduct`.
- assigned 상태에는 Execution/Completion이 없고, 수행 후에도 명시적 completion 전에는 WorkProduct가 없다.
- work unit 0/빈 slot과 동일 actor/time-slot 중복은 기존 상태를 바꾸지 않고 거절된다.
- dependency Task가 completed가 아니면 dependent execution을 거절한다.
- review scope는 TaskDefinition에 지정되고 해당 팀이 acquisition한 exact source/version/scope여야 한다.
- 완료에는 required work units와 전체 declared review scope가 모두 필요하다.
- ReviewWorkProduct는 definition/version, assignment, executions, completion, performer/team/matter/stage, source scopes, assertion/gap, analysis와 content version provenance를 보존한다.
- authored professional analysis는 틀릴 수 있으며 SourceAssertion이나 truth/finding을 변경하지 않는다.
- Issue 선택은 completed ReviewWorkProduct와 실제 검토된 assertion/gap basis를 요구한다.
- CaseTheory는 Issue/WorkProduct/support/challenge/assumption/gap provenance를 가지며 `case_theory` analysis로 남는다.
- Theory update는 이전 version을 덮어쓰지 않고 새 version identity와 parent/current lineage를 만든다. stale base update는 거절된다.
- WorkProduct 및 Work/Strategy projection의 중첩 반환값을 변경해도 authoritative state는 변하지 않는다.
- 같은 authored content와 command sequence는 같은 identities, state, journal order를 재현한다.
- VS-002 종료 후 CourtRecord, CourtFactFinding, Judgment는 존재하지 않는다.

## Authored 콘텐츠와 미구현 기능

`slice_case.json` v1.1.0에 evidence-review TaskDefinition/TaskInstance, 두 Issue, 두 professional-analysis 선택지를 추가했다. 이는 게임용 authored 분석 선택지이며 객관적 정답·한국법 판단·승자·확률·score가 아니다.

아직 구현하지 않은 기능:

- Investigation과 신규 acquisition
- Precedent/Legal Research
- Strategy Finalization
- Submission 및 courtroom procedure
- CourtRecord / snapshot
- adjudication / finding / judgment
- save/load 및 범용 scheduler/graph/rule DSL
- appeal/remand UI, 대규모 NPC simulation, jurisdiction pack, organization/business/world

## Service API와 state reference

VS-001 API는 그대로 유지한다.

- `start_session(content, player_actor_id, player_team_id)`
- `case_file_projection(viewer_actor_id, viewer_team_id)`
- `read_source(viewer_actor_id, viewer_team_id, source_id, source_version, requested_scope_ids)`

VS-002 public API:

- `assign_task(task_id, assignment_id, assigner_actor_id, assignee_actor_id, team_id)`
- `execute_task(task_id, execution_id, actor_id, team_id, time_slot_id, work_units, reviewed_scope_refs)`
- `complete_review_task(task_id, completion_id, work_product_id, actor_id, team_id, analysis_option_id)`
- `select_issue(issue_id, selection_id, actor_id, team_id, review_work_product_id)`
- `create_case_theory(theory_id, version_id, issue_id, review_work_product_id, actor_id, team_id, statement, support_refs, challenge_refs, assumption_refs, known_gap_refs)`
- `update_case_theory(theory_id, version_id, base_version_id, actor_id, team_id, statement)`
- `work_strategy_projection(viewer_actor_id, viewer_team_id)`
- `get_review_work_product(viewer_actor_id, viewer_team_id, work_product_id)`

`debug_snapshot_for_tests()`는 테스트 전용이며 UI에 연결하지 않았다.

## VS-003 handoff

VS-003는 이 상태를 재사용해 Investigation 및 새 SourceMaterial acquisition을 연결해야 한다. 시작 dependency는 completed review Task, `VS-WP-REVIEW-001`, 선택된 Issue, current CaseTheory version이다. 조사 action은 DEC-026 Task/Assignment/Execution/Completion 경계를 재사용하고, 결과 source는 새 acquisition event와 exact source/version/scope provenance를 통해서만 CaseFile에 들어와야 한다. 조사 결과가 기존 SourceAssertion, CaseTheory, CourtRecord 또는 finding을 직접 변경해서는 안 된다.

이 packet은 VS-003을 구현하지 않는다.

## 범위 감사

- VS-001 behavior와 regressions를 유지했다.
- VS-002에 필요한 vertical-slice content/state/service/presentation/UI/test와 handoff 문서만 변경했다.
- 기존 skeleton service/state/fixtures/tests와 architecture 문서는 변경하지 않았다.
- Investigation, Research, Submission, CourtRecord, adjudication, judgment, save/load, appeal/remand 및 다른 vertical을 구현하지 않았다.
- hidden truth query, universal CaseStrength/EvidenceScore/WinChance, player/NPC dual ontology, provenance 삭제, reload reroll을 추가하지 않았다.
