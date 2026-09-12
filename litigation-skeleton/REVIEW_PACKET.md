# DEC-LITIGATION-011 draft review packet

## 작업 목적

실제 제출·수신되고 해당 판단에 사용 가능하다고 주어진 evidence / record만으로 법원이 사실을 인정하는 최소 구조를 설계한다. actual truth와 court-recognized fact, 현 기록상 인정 불충분과 반대사실 인정, credibility와 sufficiency를 분리하고, 동일 evidence의 중복 가산 방지·충돌 기록·심급별 보존·공개 설명 경계를 제안한다.

이번 작업은 설계 문서 초안 작성이다. DEC-LITIGATION-011 v0.1은 **Proposed / 기획자 채택 필요** 상태이며 코드 구현이나 새 법률 규칙의 확정을 포함하지 않는다.

## 변경 파일 목록

- `DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md`
  - F1~F10 채택 후보, 기존 Accepted 제약, 최소 데이터 의미 구조, TBD, DEC-007~010 충돌 검토, failure conditions, TEST-010 검증 후보를 작성했다.
- `litigation-skeleton/REVIEW_PACKET.md`
  - 이번 문서 설계 작업의 범위·검증·미정 사항으로 handoff를 갱신했다.

`litigation-skeleton/test-results.log`는 최신 headless regression 실행으로 다시 생성했으나 결과가 기존 파일과 동일해 Git diff가 없다.

## 각 변경 요약

### DEC-LITIGATION-011

- 사건 세계의 `ActualStateRecord`를 법원이 판단하는 `FactProposition`·`CourtFactFinding`과 별도 저장·입력 경계로 분리하는 후보를 제안했다.
- 사실명제의 `recognized / recognized_limited / not_established_on_record / undetermined`를 DEC-007의 네 상태 안에서 구체화했다.
- 반대사실 인정은 별도 반대명제, 명시된 양립 불가능 관계, 그 반대명제 자체의 인정이 모두 있을 때만 파생 설명으로 표시하도록 제안했다.
- `EvidenceItem`의 source lineage와 fact별 `EvidenceUse`를 분리해 사본·재인용의 중복 가산을 막으면서 하나의 evidence가 여러 사실에 관련되는 것을 허용했다.
- 범위별 `CredibilityAssessment`와 proposition-level sufficiency 결과를 분리했다.
- conflicting evidence를 `EvidenceConflict`로 보존하고, unresolved conflict를 자동 상쇄·절충·배척하지 않도록 했다.
- 사실인정 입력을 stage/cutoff별 `CourtRecordSnapshot`으로 제한했다. admissibility는 외부 결정·주입 입력으로만 소비한다.
- 원심 finding을 덮어쓰지 않고 `FindingLineage`로 appeal / supreme / remand의 허용 범위별 유지·변경·환송 관계를 제안했다.
- 내부 `FactFindingTrace`와 공개 `FactFindingExplanation`을 분리하고, 확률·숨은 점수 대신 record 기반 원인 연결을 사용하도록 제안했다.

### Review packet

- 이번 작업의 문서 전용 범위와 최신 regression 결과를 기록했다.
- Proposed 후보와 이미 강제되는 Accepted invariant를 구별했다.

## 새로 강제되는 invariant

없음. DEC-LITIGATION-011은 아직 Proposed이므로 F1~F10은 구현 invariant가 아니다.

채택 시 강제할 후보는 다음과 같다.

- actual truth는 court fact-finding 입력이나 공개 판결 이유가 아니다.
- 명제 미인정만으로 반대명제를 인정하지 않는다.
- 동일 source lineage의 동일 기여를 사본·재인용 개수로 반복 가산하지 않는다.
- credibility는 evidence 진술 범위, sufficiency는 FactProposition 전체 판단에 기록한다.
- court finding은 당시 allowed Record Snapshot과 실제 이유를 참조하며 stage 이력을 덮어쓰지 않는다.
- 기준 부재를 입증 실패·패소·임의 결과로 바꾸지 않는다.

## 추가·변경한 테스트

없음. 사용자가 이번 작업에서 코드 수정을 금지했고 TEST-010은 DEC-011 채택 후의 후속 검증 후보이므로 테스트 코드·fixture를 추가하지 않았다.

기존 regression만 실행해 문서 변경이 skeleton 동작을 오염시키지 않았음을 확인했다.

## 실행 명령

```powershell
& 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' --headless --path . --log-file ./test-results.log --script res://tests/run_regressions.gd
```

## 검증 결과

- 총 checks: **214**
- Failures: **0**
- Exit code: **0**
- Result: **PASS**
- `git diff --check`: **PASS**

## 여전히 fixture / injected인 부분

- 기존 Judgment, Reason, AppealTarget, RemandScope와 사실·법적 결과는 기존 fixture의 주입 입력이다.
- DEC-011의 TEST-010 계획에서 FactProposition, allowed Record Snapshot, credibility 판단, recognition criterion, 상급심 review / remand scope를 고정하면 이는 입력 처리 검사다.
- 위 고정값으로 상태·이력·정보 경계를 검증해도 자연어 evidence 해석, evidence admissibility, 사실인정·판결·상급심 결과 생성 성능으로 보고할 수 없다.

## 미구현 / TBD

- DEC-LITIGATION-011 F1~F10의 기획자 채택 여부.
- 실제 대한민국 법률의 증명도·입증 기준·사실 추정·자백·무응답 효과.
- evidence admissibility 및 appeal admissibility.
- 자료 유형별 credibility 기준과 fact별 sufficiency criterion.
- 범용 독립 corroboration 판별과 자연어 proposition / contradiction 추출.
- judgment engine, damages / remedy, judge personality, precedent effect.
- 상급심 사실인정의 법적 효력, 신규 증거·심리 범위, 환송 구속력.
- 상대·판사 AI, workload, Career / Business / World 통합, UI, save / migration.
- TEST-010 문서·fixture·구현 및 실행.

## 설계 판단이 필요해 건드리지 않은 부분

- `not_established_on_record`를 최종 청구 효과로 연결하는 입증 부담은 DEC-008의 명시적 관계 없이는 정하지 않았다.
- `allowed_scope`의 생성·판정은 admissibility 영역이므로 사실인정 구조가 자체 결정하지 않는다.
- 원심 finding의 보존을 자동 구속력으로 바꾸지 않았다.
- 정확한 신빙성·충분성 등급, 점수, 임계값, 확률을 만들지 않았다.
- 반대명제·배타 관계를 자연어에서 자동 추론하는 규칙을 만들지 않았다.
- player explanation의 구체 UI·공개 시점·문구는 분리 원칙만 두고 미정으로 유지했다.

## 범위 외 변경 여부

없음.

- GDScript, fixture, project 설정, 기존 DEC / SYS / TEST 문서는 수정하지 않았다.
- judgment engine, evidence admissibility, appeal admissibility, damages / remedy, judge personality, precedent effect를 구현하거나 확정하지 않았다.
- 기존 미추적 파일 `how 24a00cc -- REVIEW_PACKET.md`는 사용자 소유 변경으로 간주해 읽거나 수정하거나 commit 대상에 포함하지 않았다.
