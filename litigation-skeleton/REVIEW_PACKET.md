# VS-003 implementation review packet

## FIX REQUIRED 대응 — hidden outcome leakage / localization boundary

Historical VS-003 review의 두 지적만 수정했다.

- 공개 investigation action identity를 outcome-neutral `VS-INV-ACTION-001` ~ `003`으로 교체했다. 공개 opportunity projection에는 여전히 private `authored_outcome`, 미래 result, target source/version/scope/content가 포함되지 않는다.
- `complete_investigation_task()`의 acquisition candidate identity preflight를 authored outcome 판독 전에 공통 적용한다. 세 action 모두 빈 identity에는 `acquisition_identity_required`, 이미 사용된 identity에는 `duplicate_identity`를 동일하게 반환하고 rejected command는 state/journal을 변경하지 않는다. 유효한 candidate는 resolution 결과가 success/partial success일 때만 `AcquisitionEvent.id`로 소비된다. authored failure는 candidate를 저장하거나 점유하지 않고 completed `InvestigationResult`만 남긴다.
- 새 VS-003 authored/player-visible 문구를 `locale_ko.json` key로 교체하고, presentation 전용 `SliceLocalizer`를 통해 표시한다. key가 없으면 key 자체가 보이므로 누락 번역을 탐지할 수 있다. 기존 VS-001/VS-002 literal presentation은 호환성을 위해 변경하지 않았다.
- UI의 acquisition 안내도 outcome별 입력 방식을 암시하지 않고 모든 조사 완료 명령에 candidate ID가 필요하다고 표시한다.

### 이번 fix의 실제 변경 파일

수정:

- `vertical_slice/content/slice_case.json`
- `vertical_slice/services/investigation_service.gd`
- `vertical_slice/presentation/slice_presenter.gd`
- `vertical_slice/ui/main.gd`
- `vertical_slice/ui/main.tscn`
- `vertical_slice/tests/run_vs003_regressions.gd`
- `vertical_slice/vs003-test-results.log`
- `REVIEW_PACKET.md`

신규:

- `vertical_slice/content/locale_ko.json`
- `vertical_slice/presentation/slice_localizer.gd`

### Public API 변화

새 API나 signature 변경은 없다. 기존
`complete_investigation_task(task_id, completion_id, investigation_result_id, acquisition_id, actor_id, team_id)`의 `acquisition_id` 입력 의미만 outcome-neutral candidate identity로 바로잡았다. unresolved action은 outcome과 무관하게 non-empty/unique candidate를 요구한다. resolution 뒤 success/partial success만 그 ID로 explicit `AcquisitionEvent`를 만들며 failure는 acquisition을 만들지 않는다.

### Fix regression 및 smoke 결과

Godot 4.7.2 stable / Windows, repository root 기준 최종 실행 결과다.

| suite | command script | checks | failures | exit code |
|---|---|---:|---:|---:|
| legacy | `res://tests/run_regressions.gd` | 214 | 0 | 0 |
| VS-001 | `res://vertical_slice/tests/run_slice_regressions.gd` | 73 | 0 | 0 |
| VS-002 | `res://vertical_slice/tests/run_vs002_regressions.gd` | 72 | 0 | 0 |
| VS-003 | `res://vertical_slice/tests/run_vs003_regressions.gd` | 260 | 0 | 0 |
| main scene headless smoke | `--headless --path litigation-skeleton --quit-after 2` | 해당 없음 | script/scene error 0 | 0 |

추가 regression은 공개 action ID의 outcome token 부재, 세 authored outcome에 대한 동일한 empty/duplicate candidate error와 atomicity, VS-003 authored content/scene text의 localization key 사용과 catalog resolution, presenter의 translated rendering을 검사한다. 기존 success/partial/failure, exact-scope authorization, provenance, deep-copy, deterministic replay와 semantic non-mutation 검사도 모두 유지된다. 실패나 nonzero exit는 없었다.

이번 fix에서 interactive GUI는 다시 실행하지 않았다. 대신 headless main scene smoke로 script/scene `_ready()` 및 localization binding을 확인했고, VS-003 regression에서 scene의 player-visible VS-003 controls가 localization key를 사용하며 모든 key가 catalog에서 해석되는지 검사했다. 이전 구현 handoff에 기록된 interactive GUI 확인은 historical evidence로 아래에 남겨 둔다.

Task Contract semantic deviation은 없다. Approved VS-003 plan에는 localization data/localizer 파일이 명시되지 않았으나, accepted `02_ARCHITECTURE_RULES.md`와 Reviewer의 localization fix를 충족하기 위한 presentation-only additive detail로 추가했다. architecture blocker는 없었고 accepted DEC/TEST boundary를 수정·우회·재해석하지 않았다. WorkService, Submission, CourtRecord, CourtFactFinding, Adjudication, Judgment 및 VS-004 production 영역은 변경하지 않았다. VS-004 starting baseline의 domain state/semantics에는 영향이 없으며 presentation text representation과 unresolved completion validation만 바로잡았다. repository root의 기존 untracked later-stage design/TEST 문서는 수정하거나 포함하지 않았다.

## 작업 목적과 결과

VS-002 완료 상태 위에 VS-003 — Investigation and Source Acquisition을 구현했다. 플레이어는 공개된 known gap 기반 조사 기회를 선택하고 Investigation Task를 런타임에서 명시적으로 생성·배정·수행·완료할 수 있다. 완료는 private authored outcome을 deterministic하게 materialize하여 별도 `InvestigationResult`를 만들고, success/partial success에만 explicit `AcquisitionEvent`를 추가한다. 새 SourceMaterial은 기존 CaseFile의 acquisition-derived authorization 경로에서 exact source/version/scope 단위로만 보인다.

Generic Task / Assignment / Execution / Completion lifecycle은 계속 `WorkService`가 소유한다. 새 `InvestigationService`는 investigation prerequisite, authored resolution, InvestigationResult, AcquisitionEvent와 조사 projection만 담당한다.

## 실제 변경 파일

수정:

- `vertical_slice/content/slice_case.json`
- `vertical_slice/data/slice_state.gd`
- `vertical_slice/services/slice_service.gd`
- `vertical_slice/services/work_service.gd`
- `vertical_slice/presentation/slice_presenter.gd`
- `vertical_slice/ui/main.gd`
- `vertical_slice/ui/main.tscn`
- `vertical_slice/tests/run_slice_regressions.gd`
- `README.md`
- `REVIEW_PACKET.md`

신규:

- `vertical_slice/services/investigation_service.gd`
- `vertical_slice/tests/run_vs003_regressions.gd`
- `vertical_slice/vs003-test-results.log`

최종 명령으로 `test-results.log`, `vertical_slice/test-results.log`, `vertical_slice/vs002-test-results.log`도 갱신했으나 결과가 기존과 동일해 현재 diff는 없다. 작업 시작 전부터 존재한 repository-root untracked 설계 문서들과 삭제 상태의 `litigation-skeleton/AGENTS.md`는 수정·복원·삭제하지 않았다.

## 구현된 사용자 동작과 변경 요약

1. 알려진 공백에 기반한 조사 기회와 bounded domain을 본다.
2. 선택한 기회에서 Investigation Task를 명시적으로 생성한다.
3. 기존 `assign_task()`로 담당자를 배정한다.
4. 기존 dependency가 완료된 뒤 explicit work block으로 조사를 수행한다.
5. 별도 completion command로 success, partial_success 또는 failure `InvestigationResult`를 받는다.
6. success/partial success에서 explicit acquisition provenance를 확인한다.
7. Case Review에서 새로 authorized된 exact SourceMaterial scope만 열람한다.

Authored content를 `1.2.0`으로 올리고 investigation TaskDefinition 1개, 공개 조사 기회 3개, private deterministic outcomes, 초기 acquisition이 없는 SourceMaterial 2개를 추가했다. 초기 Investigation TaskInstance는 추가하지 않아 VS-001의 7-event baseline을 유지했다.

`SliceState`에는 action/result collection과 stable order를 추가하고 Task의 `output_result_ids`를 `output_work_product_ids`와 분리했다. `WorkService`에는 조사 Task 생성·execution·completion preflight/recording의 좁은 additive entry point와 family guard만 추가했다. `InvestigationService`는 completed ReviewWorkProduct, selected Issue, current CaseTheory, retained KnownGap basis를 검사하고 WorkService lifecycle을 소비한다. `SliceService`는 content validation, façade API와 acquisition projection을 확장하며 기존 CaseFile scope authorization을 그대로 사용한다. Presenter/UI에는 service-only Investigation 탭을 추가했다.

## Public API 변경

신규 `SliceService` API:

- `create_investigation_task(action_id, task_id, creation_event_id, actor_id, team_id)`
- `execute_investigation_task(task_id, execution_id, actor_id, team_id, time_slot_id, work_units)`
- `complete_investigation_task(task_id, completion_id, investigation_result_id, acquisition_id, actor_id, team_id)`
- `investigation_projection(viewer_actor_id, viewer_team_id)`

Additive projection 변경:

- `work_strategy_projection().tasks`는 런타임 생성 Investigation Task도 기존 shape으로 포함할 수 있다.
- CaseFile acquisition reference에는 기존 key를 유지하면서 source/version, team/matter/stage, investigation action/task/result, content version provenance key를 추가했다. 초기 acquisition에는 적용되지 않는 optional 값이 빈 문자열이다.

기존 VS-001/VS-002 API signature와 error behavior는 변경하지 않았다.

## 새로 강제되는 invariant와 경계

- `InvestigationResult ≠ SourceMaterial ≠ SourceAssertion ≠ ReviewWorkProduct ≠ CaseTheory ≠ CourtRecord ≠ CourtFactFinding ≠ Judgment`.
- 공개 opportunity projection은 target source identity, hidden scope, source contents, future result와 private authored outcome을 노출하지 않는다.
- Investigation Task는 explicit runtime command로만 생성된다.
- Assignment는 blocked Task에도 가능하지만 incomplete dependency execution은 mutation 없이 거절된다.
- completion은 actor/team, lifecycle, dependency, performed work, action binding, ReviewWorkProduct/Issue/Theory/Gap basis, result/acquisition identity, source/version/exact scopes, route를 첫 mutation 전에 모두 검증한다.
- rejected command는 full snapshot과 journal을 바꾸지 않는다.
- authored failure는 valid completed result/history이며 acquisition과 authorization을 만들지 않는다.
- success/partial acquisition은 acquisition ID, source/version/exact scopes, actor/team/matter/stage, action/task/result refs, route/provider, event order, content version을 보존한다.
- partial success는 `change_entry`만 허용하고 같은 source의 `approval_audit`는 계속 `scope_not_acquired`다.
- 새 source visibility는 기존 `_allowed_scopes()`와 CaseFile/read path에서만 발생한다.
- Investigation은 기존 SourceAssertion/CaseTheory를 변경하지 않고 ReviewWorkProduct, CourtRecord, CourtFactFinding, Judgment를 자동 생성하지 않는다.
- projection/snapshot은 nested deep copy이고 반복 query는 event를 만들지 않는다.
- 동일 content와 command sequence는 동일 state와 monotonic event order를 재현한다.

## Authored content

- success: 승인 담당 부서 회신 요청. `VS-SOURCE-APPROVAL-001` v1의 `header`, `approval_text` 전체 획득.
- partial success: 시스템 승인 로그 요청. `VS-SOURCE-LOG-001` v1의 `change_entry`만 획득하고 `approval_audit`는 숨김.
- failure: 회의 참석자 보관 자료 문의. completed failure result만 남기고 acquisition 없음.

Outcome/source/scope binding은 resolution 전 public projection에 포함되지 않는다. 새 source 내용은 획득 뒤에도 SourceMaterial이며 SourceAssertion이나 사실인정으로 자동 승격되지 않는다.

## Regression 결과

Godot 4.7.2 stable / Windows에서 repository root 기준으로 실행했다.

| suite | command script | checks | failures | exit code |
|---|---|---:|---:|---:|
| legacy | `res://tests/run_regressions.gd` | 214 | 0 | 0 |
| VS-001 | `res://vertical_slice/tests/run_slice_regressions.gd` | 73 | 0 | 0 |
| VS-002 | `res://vertical_slice/tests/run_vs002_regressions.gd` | 72 | 0 | 0 |
| VS-003 | `res://vertical_slice/tests/run_vs003_regressions.gd` | 260 | 0 | 0 |
| main scene headless smoke | `--headless --path litigation-skeleton --quit-after 2` | 해당 없음 | script/scene error 0 | 0 |

실행 명령:

```powershell
& 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' --headless --path litigation-skeleton --log-file ./test-results.log --script res://tests/run_regressions.gd
& 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' --headless --path litigation-skeleton --log-file ./vertical_slice/test-results.log --script res://vertical_slice/tests/run_slice_regressions.gd
& 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' --headless --path litigation-skeleton --log-file ./vertical_slice/vs002-test-results.log --script res://vertical_slice/tests/run_vs002_regressions.gd
& 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' --headless --path litigation-skeleton --log-file ./vertical_slice/vs003-test-results.log --script res://vertical_slice/tests/run_vs003_regressions.gd
& 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' --headless --path litigation-skeleton --quit-after 2
```

실패를 숨기지 않았다. 최종 실행에는 failure와 nonzero exit가 없다.

## GUI verification

실제 Godot DEBUG 창에서 다음을 확인했다.

- Case Review, Work & Theory, Investigation 세 탭이 정상 표시된다.
- Review Task assign/execute/complete, Issue 선택, CaseTheory 생성/개정 뒤 Investigation prerequisite가 충족된다.
- dependency 완료 전 Investigation execute는 `incomplete_dependency`를 표시하고 Task는 assigned 상태를 유지한다.
- failure action은 completed Task와 `InvestigationResult: failure` summary를 표시하며 acquisition이 생기지 않는다.
- success 완료 뒤 Case Review가 즉시 refresh되어 `상대방 내부 승인 회신`의 정확한 2개 scope가 표시된다.
- partial 완료 뒤 Case Review에는 `프로젝트 승인 로그 — 변경 기록` 1개 scope만 추가되고 미획득 `승인 감사 기록`은 표시되지 않는다.

Headless main-scene smoke도 exit code 0으로 종료되어 script/scene load error가 없음을 확인했다.

## 테스트가 exercise한 조사/획득 경계

VS-003 suite는 success, partial success, authored failure, invalid actor/team, incomplete dependency, duplicate action/task/creation event/result/acquisition identity, pre-acquisition invisibility, exact-scope visibility/read, remaining-scope denial, rejected-command full-snapshot atomicity, family guard, deep-copy result/acquisition projection, query purity, deterministic replay/event order, unchanged SourceAssertions/CaseTheory, no ReviewWorkProduct/CourtRecord/CourtFactFinding/Judgment를 검사한다.

## Known limitations / fixture-injected / intentionally unimplemented / TBD

- 세 outcome은 authored deterministic fixture이며 조사 성공 확률, RNG, investigator stat, 비용, provider AI 또는 hidden-world simulation이 아니다.
- action prerequisite는 이 slice의 authored `VS-WP-REVIEW-001`, `VS-ISSUE-001`, `VS-GAP-001`와 current theory에 결속된다.
- UI는 hidden outcome mapping 없이 모든 completion command에 outcome-neutral acquisition candidate ID를 입력한다. success/partial success만 이를 acquisition identity로 소비하고 failure는 저장·점유하지 않는다.
- newly acquired SourceMaterial은 의도적으로 unreviewed다. 자동 SourceAssertion/ReviewWorkProduct/CaseTheory revision은 없다.
- retries, Leads, witness interview, Legal Research, precedent search, Strategy Finalization, Submission, courtroom procedure, CourtRecord, adjudication, finding, Judgment, save/load, appeal/remand, Organization/Business/World integration, jurisdiction pack, scheduler/rule DSL은 구현하지 않았다.
- 실제 조사 권한·증거능력·법률 판단·workload formula는 TBD이며 발명하지 않았다.

## Contract / plan deviation과 architecture audit

- `.agent/tasks/VS-003.md` deviation: 없음.
- `.agent/plans/VS-003.md` deviation: 최소 acquisition candidate ID 입력 field와 review-fix localization catalog/localizer를 presentation-only additive detail로 추가했다. outcome별 empty/non-empty validation은 hidden oracle이었으므로 제거했고 모든 unresolved action에 동일한 candidate preflight를 적용한다. result/acquisition domain semantics는 유지된다.
- architecture blocker: 없음.
- accepted DEC/TEST semantic boundary를 수정, 우회 또는 재해석하지 않았다. accepted DEC/TEST 문서는 수정하지 않았다.
- `WorkService`를 payload/rule framework로 refactor하지 않았고 InvestigationService가 assignment/execution/completion/time allocation을 직접 소유하지 않는다.
- legacy litigation production files는 수정하지 않았다.
- out-of-scope production change: 없음. 작업 전부터 존재한 unrelated worktree 변경은 그대로 보존했다.

## VS-004 starting baseline

VS-004 시작 시 기존 completed ReviewWorkProduct, selected Issue, current CaseTheory와 함께 provenance-bearing acquired SourceMaterial이 존재할 수 있다. 이 자료는 아직 reviewed/asserted/researched/synthesized되지 않았으며 별도 accepted contract 없이 자동 분석·판례 검색·전략 갱신으로 취급해서는 안 된다. VS-004 작업은 시작하지 않았다.

## VS-004 Architect design-closure addendum — 2026-09-15

VS-004 implementation은 아직 시작하지 않았고 이 packet의 runtime baseline은 계속 VS-003이다. Architect review에서 required DEC/TEST promotion과 Legal Research materialization/Argument selection semantics를 닫고 `.agent/tasks/VS-004.md`를 수정했다. Canonical Strategy object는 도입하지 않는다. Exact status matrix, semantic closure, remaining TBD와 regression evidence는 `.agent/reviews/VS-004-DESIGN-CLOSURE.md`를 따른다.
