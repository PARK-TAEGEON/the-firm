# Litigation Godot skeleton and vertical slice

이 프로젝트는 두 개의 분리된 실행 경로를 가진다.

- 기존 `data/`, `services/`, `fixtures/`, `tests/`는 TEST-008/009에서 추린 고정 입력으로 상태·이력·정보 경계를 검사하는 회귀 골격이다.
- `vertical_slice/`는 VS-001 Case Review부터 VS-005 Submission → CourtRecord까지의 playable 경로다.

어느 경로도 자연어 법률 판단 엔진이 아니다. `LegalSource → RecordedLegalExtraction → RuleStatement → InterpretationCandidate → IssueAnalysis → Argument`는 서로 다른 authored 기록이며 정답 법률이나 법원 판단이 아니다. Argument 선택은 immutable event history이고 canonical Strategy가 아니다.
VS-005의 `CourtRecordEntry`도 당사자 assertion을 보존하는 기록일 뿐 CourtFactFinding, 판사의 고려·신뢰·채택 또는 Judgment가 아니다.

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

& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./vertical_slice/vs005-test-results.log `
  --script res://vertical_slice/tests/run_vs005_regressions.gd

& 'Godot 실행 파일의 절대 경로' --headless --path litigation-skeleton `
  --log-file ./vertical_slice/vs006-test-results.log `
  --script res://vertical_slice/tests/run_vs006_regressions.gd
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
| `vertical_slice/services/slice_service.gd` | 전체 콘텐츠 선검증과 public façade |
| `vertical_slice/services/work_service.gd` | Assignment, Execution, Completion과 WorkProduct mutation; generic Task lifecycle 소유 |
| `vertical_slice/services/investigation_service.gd` | 조사 prerequisite, deterministic authored InvestigationResult, explicit AcquisitionEvent와 공개 projection |
| `vertical_slice/services/legal_research_service.gd` | research prerequisite, discovery/review/extraction/rule/interpretation/analysis/Argument materialization과 projection |
| `vertical_slice/services/submission_service.gd` | FinalizedDocument, SubmissionAttempt, ProceduralResult, RecordMaterializationEvent, CourtRecordEntry mutation과 projection |
| `vertical_slice/services/adjudication_service.gd` | VS-006의 명시적 CourtRecordSnapshot 캡처, 고정 EvidenceUse 도출, sufficiency trace와 CourtFactFinding atomic append |
| `vertical_slice/presentation/slice_presenter.gd` | authorized projection을 UI 문자열/목록으로 변환 |
| `vertical_slice/ui/main.tscn`, `main.gd` | Case Review부터 Submission & Record까지의 화면; service API만 호출 |
| `vertical_slice/tests/run_slice_regressions.gd` | VS-001 접근·scope·provenance·불변성 회귀 |
| `vertical_slice/tests/run_vs002_regressions.gd` | VS-002 task 상태·work/time·dependency·WorkProduct·Theory history 회귀 |
| `vertical_slice/tests/run_vs003_regressions.gd` | VS-003 조사 outcome·atomicity·identity·provenance·exact-scope visibility·replay 회귀 |
| `vertical_slice/tests/run_vs004_regressions.gd` | VS-004 단계 분리·atomicity·법률 source provenance·Argument 선택 이력·replay 회귀 |
| `vertical_slice/tests/run_vs005_regressions.gd` | VS-005 finalization/submission/result/record 분리, defect, atomicity, provenance, deep-copy, replay 회귀 |
| `vertical_slice/tests/run_vs006_regressions.gd` | VS-006 snapshot, 고정 criterion, provenance isolation, atomicity, history, replay와 범위 제외 회귀 |

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
- Drafting은 기존 Task lifecycle을 사용하며 completed DraftWorkProduct와 FinalizedDocument는 별도 immutable 기록이다.
- FinalizedDocument의 `document_id`는 lineage ID이고 `(document_id, document_version)`이 immutable version identity다. 같은 lineage의 후속 version은 별도 completed DraftWorkProduct에서 생성되며 이전 version도 계속 읽고 제출할 수 있다.
- FinalizedDocument는 자동 submit되지 않고 SubmissionAttempt는 자동 result를 만들지 않는다.
- ProceduralResult는 `accepted_for_record` 또는 `rejected_defective`만 materialize한다. 미해결 상태는 result record 부재다.
- known required package member 누락은 valid attempt를 보존한 뒤 `missing_required_package_member` defect로 materialize한다.
- Submission & Record UI는 complete package와 authored exhibit-omission 두 선택만 제공하며, omission 결과인 `rejected_defective`를 확인할 수 있지만 CourtRecord에는 넣을 수 없다.
- accepted result도 matching `RecordInclusionRule`을 적용하는 별도 atomic command 전에는 CourtRecord에 들어가지 않는다.
- CourtRecord materialization은 정확히 하나의 RecordMaterializationEvent와 CourtRecordEntry를 함께 만들며 source provenance와 immutable history를 보존한다.
- 새 CourtRecordEntry는 resolved FinalizedDocument version의 complete ordered `factual_basis_refs`를 nested deep copy한다. 기존 entry는 backfill하지 않는다.
- VS-006은 `VS-FACT-APPROVAL-001/1`과 `VS-CRITERION-APPROVAL-001/1`만 평가한다. exact approval source/scope가 있으면 `recognized`, 없으면 `not_established_on_record`이며 반대 사실을 만들지 않는다.
- snapshot은 명시적 command 시점의 eligible CourtRecordEntry ID/event order를 고정한다. 이후 record materialization은 기존 snapshot을 변경하지 않는다.
- evaluation은 snapshot entry 안의 보존된 basis만 읽고 private SourceMaterial, DraftWorkProduct 또는 FinalizedDocument로 누락 provenance를 복구하지 않는다.
- VS-006에는 admissibility, generic criterion DSL, `recognized_limited`, ChoicePoint, JudgeProfile/JII, claim outcome, Judgment, appeal 또는 remedy가 없다.

## 범위

현재 구현은 Case Review → explicit review task → ReviewWorkProduct → Issue 선택 → versioned CaseTheory → Investigation → bounded Legal Research → IssueAnalysis → Argument 선택 → Drafting Task/WorkProduct → FinalizedDocument → SubmissionAttempt → ProceduralResult → explicit CourtRecord materialization → explicit immutable snapshot → 하나의 synthetic proposition에 대한 bounded CourtFactFinding까지다. 제출·사실인정 규칙은 이 synthetic case의 authored fixture이며 실제 한국 form/deadline/jurisdiction/service/admission/proof 규칙이 아니다. generic legal search, substantive truth model, generic adjudication, Judgment, save/load, appeal/remand, 대규모 NPC simulation, organization/business/world는 구현하지 않는다.
