# VS-001 implementation review packet

## 작업 결과

VS-001 — Authorized Case Review Runtime and First Playable Screen을 구현했다. Godot의 Run Project는 `vertical_slice/ui/main.tscn`을 열며, 사용자는 가상 사건 `VS-CASE-001`을 시작한 뒤 플레이어 팀에 제공된 자료 scope를 선택해 원문, 출처, source ID/version을 읽을 수 있다.

GUI와 headless 회귀는 모두 `ContentLoader → SliceService → SliceState` 경로를 사용한다. presentation/UI는 service의 player projection과 exact-scope read 결과만 소비한다.

## 실제 변경 파일

신규:

- `vertical_slice/data/slice_state.gd`
- `vertical_slice/services/content_loader.gd`
- `vertical_slice/services/slice_service.gd`
- `vertical_slice/presentation/slice_presenter.gd`
- `vertical_slice/ui/main.tscn`
- `vertical_slice/ui/main.gd`
- `vertical_slice/content/slice_case.json`
- `vertical_slice/tests/run_slice_regressions.gd`
- `vertical_slice/test-results.log`

수정:

- `project.godot`
- `README.md`
- `REVIEW_PACKET.md`

`test-results.log`는 기존 suite로 다시 생성했지만 정규화된 내용이 이전과 같아 Git content diff는 없다. 신규 `vertical_slice/test-results.log`는 이번 suite 결과로 추가되었다.

기존 `data/litigation_state.gd`, `services/litigation_service.gd`, fixture와 기존 test runner는 수정하지 않았다. 새 DEC/TEST/AUDIT 문서도 만들거나 수정하지 않았다.

## 구현한 사용자 동작

1. `사건 시작`으로 content version `1.0.0`의 단일 Matter/trial session을 생성한다.
2. Case Review 화면에서 acquisition이 있는 3개 자료의 5개 named scope만 본다.
3. 하나의 scope를 선택하고 `선택 범위 열람`으로 그 범위만 조회한다.
4. 화면에서 출처, source ID/version, scope 내용, source assertion, known gap을 분리해 확인한다.
5. “자료에 기록된 내용이며 법원 인정 사실이 아님”을 명시한다.

## 회귀 결과

Godot 4.7.2 stable / Windows에서 저장소 루트 기준으로 실행했다.

| 실행 | checks | failures | exit code |
|---|---:|---:|---:|
| 기존 `res://tests/run_regressions.gd` | 214 | 0 | 0 |
| 신규 `res://vertical_slice/tests/run_slice_regressions.gd` | 72 | 0 | 0 |
| main scene headless load (`--quit-after 2`) | 해당 없음 | script/scene error 없음 | 0 |

신규 suite는 실패가 있으면 `quit(1)`로 nonzero 종료한다.

## 실제 GUI 확인

Godot GUI로 프로젝트를 실행해 다음을 직접 확인했다.

- main scene과 Authorized Case Review 초기 화면이 열린다.
- `사건 시작` 후 `VS-SESSION-001`, 사건명, 의뢰 목표, trial stage가 표시된다.
- 목록에는 획득된 다섯 scope만 표시되고 테스트용 미획득 source 및 `private_appendix` scope는 표시되지 않는다.
- `일정 변경 협의 이메일 — 발신 정보`를 선택·열람했을 때 source `VS-SOURCE-EMAIL-001`, version `1`, 출처와 `header` 내용만 표시된다.
- source assertion, known gap과 CourtFactFinding 부정 문구가 함께 표시된다.

GUI 실행은 상호작용 확인 후 테스트 환경에서 종료했으며, pass/fail 판정은 위 두 headless suite의 종료 코드로 기록했다.

## 새로 강제한 접근·scope·provenance 경계

- session에 결속된 `VS-LAWYER-001` / `VS-TEAM-001` 외 viewer는 projection과 직접 source read 모두 거절된다.
- 미획득 source는 제목·본문·scope·개수 힌트 없이 projection에서 제외되고 직접 조회도 `source_not_acquired`로 거절된다.
- 부분 획득 자료는 획득 scope만 projection에 나타난다. 허용 scope와 미허용 scope를 섞은 전체-source 요청은 원자적으로 거절된다.
- source ID/version/scope와 acquisition ID/order/actor/team/route/provider provenance가 유지된다.
- malformed structure, duplicate source ID, duplicate event order, dangling source reference, invalid version/scope/viewer를 명시적으로 거절한다.
- 모든 콘텐츠를 검증한 뒤 candidate state를 교체한다. 실패 초기화 전후 authoritative snapshot이 동일하다.
- 조회 반환값의 중첩 값을 변경해도 authoritative state가 변하지 않는다.
- 조회를 반복해도 domain event와 state가 증가하지 않는다.
- 동일 콘텐츠로 시작한 별도 service는 동일한 semantic snapshot과 event order를 만든다.
- 자료 열람 뒤에도 EvidenceReviewWorkProduct, CaseTheory, CourtRecord, CourtFactFinding, Judgment가 없다.

## Authored 콘텐츠와 미구현 후속 기능

`slice_case.json`은 실제 한국 사건이나 Q2 정답 판결이 아닌 가상 납품 일정 분쟁이다. 사건/단계/플레이어/팀 stable ID, 의뢰 목표, 초기 문서, named scope, acquisition, source assertion, known gap, procedural status만 authored했다. 테스트를 위해 한 source와 한 scope는 다른 팀에만 제공되어 플레이어에게는 미획득 상태이며 player projection에는 노출되지 않는다.

아직 구현하지 않은 기능:

- Task execution과 workload 소비
- Issue/Theory 선택 및 Strategy finalization
- Investigation과 신규 acquisition
- Precedent/Legal Research
- EvidenceReviewWorkProduct 생성
- Litigation/adjudication/CourtRecord/finding/judgment 런타임
- save/load, scheduler, 범용 graph/rule DSL
- appeal/remand UI, 대규모 NPC simulation, jurisdiction pack, business/world systems

## VS-002가 사용할 API와 state reference

`SliceService`의 현재 public 경계:

- `start_session(content, player_actor_id, player_team_id) -> {ok, session_id} | {ok:false, error}`
- `case_file_projection(viewer_actor_id, viewer_team_id) -> {ok, projection} | error`
- `read_source(viewer_actor_id, viewer_team_id, source_id, source_version, requested_scope_ids) -> {ok, source} | error`

`debug_snapshot_for_tests()`는 테스트 전용이며 UI에 연결하지 않았다.

VS-002는 service mutation 원칙을 유지하면서 현재 session/matter/stage/player 결속과 source/acquisition stable identity를 참조해야 한다. Issue/Theory 또는 Task 상태를 추가하더라도 source assertion, analysis/work product, CourtRecord, finding을 합치면 안 된다.

## 범위 감사

- Task Contract의 허용 파일만 변경했다.
- 기존 litigation skeleton의 상태/service/fixture/test 코드는 변경하지 않았다.
- VS-002를 시작하지 않았다.
- architecture 문서를 재설계하거나 새 DEC를 만들지 않았다.
- hidden truth query, CaseStrength/EvidenceScore/WinChance, player/NPC 이중 ontology, provenance 삭제, reload reroll을 추가하지 않았다.
