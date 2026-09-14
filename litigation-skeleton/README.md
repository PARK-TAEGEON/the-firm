# Litigation Godot skeleton and VS-001

이 프로젝트는 두 개의 분리된 실행 경로를 가진다.

- 기존 `data/`, `services/`, `fixtures/`, `tests/`는 TEST-008/009에서 추린 고정 입력으로 상태·이력·정보 경계를 검사하는 회귀 골격이다.
- `vertical_slice/`는 VS-001의 Authorized Case Review 실행 경로다. 단일 가상 Matter를 시작하고 플레이어 팀이 실제로 제공받은 SourceMaterial scope만 CaseFile projection과 첫 화면에 노출한다.

어느 경로도 자연어 법률 판단 엔진이 아니다. 특히 source assertion은 객관적 진실이나 CourtFactFinding이 아니며, 자료 열람은 EvidenceReviewWorkProduct, CaseTheory, CourtRecord 또는 Judgment를 생성하지 않는다.

## 실행

저장소 루트에서 Godot 4 콘솔 실행 파일로 기존 회귀를 실행한다.

```powershell
& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./test-results.log `
  --script res://tests/run_regressions.gd
```

VS-001 회귀는 같은 프로젝트와 service/state 경로를 사용한다.

```powershell
& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./vertical_slice/test-results.log `
  --script res://vertical_slice/tests/run_slice_regressions.gd
```

첫 playable 화면은 다음처럼 실행한다.

```powershell
& 'Godot 실행 파일의 절대 경로' --path litigation-skeleton
```

검증 환경은 Godot 4.7.2 stable / Windows다. 최근 실행 결과는 기존 회귀 **214 checks, 0 failures**, VS-001 회귀 **72 checks, 0 failures**이며 두 headless suite 모두 종료 코드 0이다.

## VS-001 구성

| 파일 | 책임 |
|---|---|
| `vertical_slice/content/slice_case.json` | 가상 사건, source/version/named scope, acquisition, assertion, known gap, procedural status의 authored 입력 |
| `vertical_slice/data/slice_state.gd` | VS-001 authoritative state와 테스트용 deep-copy snapshot |
| `vertical_slice/services/content_loader.gd` | JSON 파일/문자열 파싱과 명시적 구조 오류 |
| `vertical_slice/services/slice_service.gd` | 전체 입력 선검증, session 생성, viewer 결속, CaseFile projection, exact-scope source read |
| `vertical_slice/presentation/slice_presenter.gd` | service 조회 결과를 UI 문자열/목록으로 변환 |
| `vertical_slice/ui/main.tscn`, `main.gd` | 사건 시작, 허용 scope 목록, 내용·출처·버전·공백 표시 |
| `vertical_slice/tests/run_slice_regressions.gd` | 접근·scope·provenance·불변성·재현성 회귀 |

## 강제하는 경계

- 상태 변경은 `SliceService.start_session()`만 수행한다. 조회는 journal이나 authoritative state를 변경하지 않는다.
- player actor/team은 session에 결속된다. UI에는 역할을 court/admin으로 바꾸는 경로나 테스트 snapshot이 없다.
- projection은 acquisition으로 허용된 source/scope만 구성한다. 전체 원문을 전달한 뒤 UI에서 숨기지 않는다.
- source ID, source version, named scope, acquisition event/order/provider route를 보존한다.
- validation이 모두 끝난 candidate state만 교체하므로 실패 입력은 기존 session을 부분 변경하지 않는다.
- 모든 public 조회는 nested Dictionary/Array까지 복사한다.
- duplicate identity/order, dangling source reference, 잘못된 viewer/version/scope를 명시적으로 거절한다.
- 동일 콘텐츠와 player 입력은 같은 semantic state와 event order를 만든다. 현재 경로에는 RNG가 없다.
- authored content에 ActualState, winner, CaseStrength, EvidenceScore, WinChance, CourtRecord, finding 또는 judgment를 넣을 수 없다.

## 기존 골격

기존 `litigation_service.gd`는 주입된 TEST-008/009 명령을 검증·누적하며 appeal/remand 단계, 공식 전달, workload 이력을 회귀 검사한다. VS-001은 이 파일들과 fixture를 수정하지 않고 별도 vertical-slice 경로로 추가되었다.

기존 골격의 판결·이유·허용 결과는 fixture 입력이며 실제 판결 생성이 아니다. VS-001 역시 investigation, issue/theory 선택, research, strategy, adjudication, judgment, save system, scheduler, 범용 graph/rule DSL을 구현하지 않는다.
