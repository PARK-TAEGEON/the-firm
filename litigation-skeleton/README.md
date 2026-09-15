# Litigation Godot skeleton and vertical slice

이 프로젝트는 두 개의 분리된 실행 경로를 가진다.

- 기존 `data/`, `services/`, `fixtures/`, `tests/`는 TEST-008/009에서 추린 고정 입력으로 상태·이력·정보 경계를 검사하는 회귀 골격이다.
- `vertical_slice/`는 VS-001 Case Review부터 VS-004 Legal Research / IssueAnalysis / Argument 선택까지의 playable 경로다.

어느 경로도 자연어 법률 판단 엔진이 아니다. `LegalSource → RecordedLegalExtraction → RuleStatement → InterpretationCandidate → IssueAnalysis → Argument`는 서로 다른 authored 기록이며 정답 법률이나 법원 판단이 아니다. Argument 선택은 immutable event history이고 canonical Strategy가 아니다.

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

& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./vertical_slice/vs003-test-results.log `
  --script res://vertical_slice/tests/run_vs003_regressions.gd

& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./vertical_slice/vs004-test-results.log `
  --script res://vertical_slice/tests/run_vs004_regressions.gd
```

playable 화면은 다음처럼 실행한다.

```powershell
& 'Godot 실행 파일의 절대 경로' --path litigation-skeleton
```

검증 환경은 Godot 4.7.2 stable / Windows다. 최신 실행 수치는 `REVIEW_PACKET.md`와 각 test-results log에 기록한다.

## Vertical slice 구성

| 파일 | 책임 |
|---|---|
| `vertical_slice/content/slice_case.json` | 사건/source/acquisition, versioned TaskDefinition, Issue, review-analysis 선택지, 공개 조사 기회와 비공개 authored outcome 입력 |
| `vertical_slice/data/slice_state.gd` | authoritative state, append-only order/history, 테스트용 deep-copy snapshot |
| `vertical_slice/services/content_loader.gd` | JSON 파일/문자열 파싱과 명시적 구조 오류 |
| `vertical_slice/services/slice_service.gd` | 전체 콘텐츠 선검증, session/CaseFile API, work/investigation façade |
| `vertical_slice/services/work_service.gd` | Assignment, Execution, Completion과 기존 ReviewWorkProduct/IssueSelection/CaseTheory mutation; generic Task lifecycle 소유 |
| `vertical_slice/services/investigation_service.gd` | 조사 prerequisite, deterministic authored InvestigationResult, explicit AcquisitionEvent와 공개 projection |
| `vertical_slice/services/legal_research_service.gd` | research prerequisite, discovery/review/extraction/rule/interpretation/analysis/Argument materialization과 projection |
| `vertical_slice/presentation/slice_presenter.gd` | authorized projection을 UI 문자열/목록으로 변환 |
| `vertical_slice/ui/main.tscn`, `main.gd` | Case Review, Work & Theory, Investigation 화면; service API만 호출 |
| `vertical_slice/tests/run_slice_regressions.gd` | VS-001 접근·scope·provenance·불변성 회귀 |
| `vertical_slice/tests/run_vs002_regressions.gd` | VS-002 task 상태·work/time·dependency·WorkProduct·Theory history 회귀 |
| `vertical_slice/tests/run_vs003_regressions.gd` | VS-003 조사 outcome·atomicity·identity·provenance·exact-scope visibility·replay 회귀 |
| `vertical_slice/tests/run_vs004_regressions.gd` | VS-004 단계 분리·atomicity·법률 source provenance·Argument 선택 이력·replay 회귀 |

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
- Investigation Task는 런타임에서 명시적으로 생성되며 초기 7-event baseline을 바꾸지 않는다.
- success/partial success만 explicit AcquisitionEvent를 만들고, failure는 완료된 InvestigationResult 이력만 남긴다.
- 새 자료는 기존 CaseFile acquisition authorization을 통해서만 source/version/exact scope 단위로 보인다.
- 조사는 기존 SourceAssertion, ReviewWorkProduct, CaseTheory를 바꾸거나 새 review/adjudicative 객체를 자동 생성하지 않는다.
- ActualState, winner, CaseStrength, EvidenceScore, WinChance, CourtRecord, finding, judgment는 authored content와 VS-003 결과에 없다.
- LegalSource의 존재·발견·열람·review·extraction은 서로 다른 상태이며 read/query는 event를 만들지 않는다.
- Argument 생성과 선택은 별도 atomic command이고, 재선택은 이전 이력을 변경하지 않고 새 `ArgumentSelectionEvent`를 append한다.
- VS-004에는 canonical Strategy, Submission, CourtRecord, adjudication, finding 또는 Judgment가 없다.

## 범위

현재 구현은 Case Review → explicit review task → ReviewWorkProduct → Issue 선택 → versioned CaseTheory → Investigation → bounded Legal Research → exact-scope review → extraction/rule/interpretation → IssueAnalysis → Argument 생성/선택까지다. generic legal search, substantive Korean-law truth model, canonical Strategy, Submission, CourtRecord, adjudication, judgment, save/load, appeal/remand, 대규모 NPC simulation, jurisdiction pack, organization/business/world는 구현하지 않는다.
