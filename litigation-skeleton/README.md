# Litigation Godot skeleton and vertical slice

이 프로젝트는 두 개의 분리된 실행 경로를 가진다.

- 기존 `data/`, `services/`, `fixtures/`, `tests/`는 TEST-008/009에서 추린 고정 입력으로 상태·이력·정보 경계를 검사하는 회귀 골격이다.
- `vertical_slice/`는 VS-001 Case Review와 VS-002 Task Execution / Issue / CaseTheory의 playable 경로다.

어느 경로도 자연어 법률 판단 엔진이 아니다. 특히 SourceAssertion과 lawyer analysis는 객관적 진실이나 CourtFactFinding이 아니다. ReviewWorkProduct와 CaseTheory도 CourtRecord, finding 또는 judgment를 생성하지 않는다.

## 실행

저장소 루트에서 Godot 4 콘솔 실행 파일로 각 suite를 실행한다.

```powershell
& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./test-results.log `
  --script res://tests/run_regressions.gd

& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./vertical_slice/test-results.log `
  --script res://vertical_slice/tests/run_slice_regressions.gd

& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./vertical_slice/vs002-test-results.log `
  --script res://vertical_slice/tests/run_vs002_regressions.gd
```

playable 화면은 다음처럼 실행한다.

```powershell
& 'Godot 실행 파일의 절대 경로' --path litigation-skeleton
```

검증 환경은 Godot 4.7.2 stable / Windows다. 최근 실행 결과는 legacy **214/214**, VS-001 **73/73**, VS-002 **72/72**이며 각 suite의 종료 코드는 0이다.

## Vertical slice 구성

| 파일 | 책임 |
|---|---|
| `vertical_slice/content/slice_case.json` | 사건/source/acquisition과 versioned TaskDefinition, TaskInstance, Issue, review-analysis 선택지의 authored 입력 |
| `vertical_slice/data/slice_state.gd` | authoritative state, append-only order/history, 테스트용 deep-copy snapshot |
| `vertical_slice/services/content_loader.gd` | JSON 파일/문자열 파싱과 명시적 구조 오류 |
| `vertical_slice/services/slice_service.gd` | 전체 콘텐츠 선검증, session/CaseFile API, work service 진입점 |
| `vertical_slice/services/work_service.gd` | Assignment, Execution, Completion, ReviewWorkProduct, IssueSelection, versioned CaseTheory mutation |
| `vertical_slice/presentation/slice_presenter.gd` | authorized projection을 UI 문자열/목록으로 변환 |
| `vertical_slice/ui/main.tscn`, `main.gd` | Case Review 및 Work & Theory 화면 |
| `vertical_slice/tests/run_slice_regressions.gd` | VS-001 접근·scope·provenance·불변성 회귀 |
| `vertical_slice/tests/run_vs002_regressions.gd` | VS-002 task 상태·work/time·dependency·WorkProduct·Theory history 회귀 |

## 강제하는 경계

- 모든 authoritative mutation은 service를 통한다. presentation/UI는 projection과 command result만 소비한다.
- player actor/team은 session에 결속되며 public court/admin viewer bypass가 없다.
- projection은 acquisition으로 허용된 source/version/scope만 제공한다.
- TaskDefinition, TaskInstance, Assignment, Execution, Completion, ReviewWorkProduct는 각각 별도 identity/state를 가진다.
- 배정은 작업 수행이 아니고, 수행은 완료가 아니다. 명시적 work block과 exact reviewed scope가 충족된 후 별도 completion만 WorkProduct를 만든다.
- actor/time-slot 중복 allocation, 미완료 dependency, 미획득·미허용 scope를 거절한다.
- SourceAssertion과 professional analysis를 분리하며 분석에는 `analysis_may_be_wrong` / `not_a_fact_finding` 제한을 보존한다.
- IssueSelection은 completed ReviewWorkProduct를 요구한다.
- CaseTheory 개정은 새 version/event를 만들고 이전 version과 parent lineage를 보존한다.
- public 조회는 nested Dictionary/Array를 deep copy하며 조회 자체는 event/state를 늘리지 않는다.
- 동일 입력과 command 순서는 동일 semantic state와 event order를 재현한다. 현재 경로에는 RNG가 없다.
- ActualState, winner, CaseStrength, EvidenceScore, WinChance, CourtRecord, finding, judgment는 authored content와 VS-002 결과에 없다.

## 범위

현재 구현은 Case Review → explicit review task → ReviewWorkProduct → Issue 선택 → versioned CaseTheory까지다. Investigation, Legal Research, Strategy Finalization, Submission, CourtRecord, adjudication, judgment, save/load, appeal/remand UI, 대규모 NPC simulation, jurisdiction pack, organization/business/world는 아직 구현하지 않는다.
