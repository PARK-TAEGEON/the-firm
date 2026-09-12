# Litigation invariant review packet

## 변경 파일 목록

- `services/litigation_service.gd`
- `fixtures/test009.json`
- `tests/run_regressions.gd`
- `README.md`
- `REVIEW_PACKET.md`

`data/litigation_state.gd`는 변경하지 않았다. 기존 state 구조로 검증할 수 있었고, 완료된 time entry에 stage/work를 기록하는 변경은 service의 기존 `used_time` Dictionary 항목에만 한정했다.

## 파일별 변경 요약

- `services/litigation_service.gd`: stage genealogy, appeal/remand scope, 실제 완료 time 기반 review, official/internal 경계를 command 반영 전에 검증한다. malformed 필드 타입도 예외 없이 거절한다.
- `fixtures/test009.json`: 기존 JA-LS, JA, JS-R-REASON, JS-R에 fixture가 이미 의도한 review scope를 명시했다. 새 판단 내용은 추가하지 않았다.
- `tests/run_regressions.gd`: 요청된 negative regression과 보조 genealogy/malformed-input 검사를 추가했다. 모든 실패 command에서 거절과 snapshot 불변을 각각 검사한다.
- `README.md`: service가 강제하는 범위, 실행 결과, injected/비자동화 경계를 현재 동작에 맞게 갱신했다.
- `REVIEW_PACKET.md`: 변경 및 검증 handoff 문서다.

## 새로 service가 강제하는 invariant

### Proceeding / CourtStage genealogy

- Trial은 Case의 첫 root stage이며 prior judgment를 가질 수 없다.
- Fixture가 사용하는 `trial → appeal → supreme → remand` 순서에서 후속 stage의 prior judgment는 같은 Case, 실제 존재하는 Judgment, 현재 직전 stage 소속이어야 한다.
- Supreme이 Trial Judgment를 직접 참조하는 단계 건너뛰기를 거절한다.
- Remand는 직전 Supreme Judgment와 같은 Supreme stage에서 작성된 RemandScope를 모두 요구한다.
- RemandScope의 upper Reason은 prior Supreme Judgment에 실제 포함되어야 한다.
- 존재하지 않는 future/self 참조와 append-only 순서를 역행하는 참조는 반영 전에 거절되므로 cycle을 만들 수 없다.

### AppealTarget → review scope → Reason/Judgment

- AppealTarget은 해당 stage의 실제 prior Judgment에 포함된 Reason만 참조한다.
- Appeal/Supreme Reason의 이전-stage Reason source는 그 stage AppealTarget이 공격한 Reason이어야 한다.
- Appeal/Supreme Reason과 Judgment는 fixture에 명시된 AppealTarget scope 합집합의 부분집합을 직접 선언해야 한다.
- Judgment는 같은 stage의 Reason만 연결하며 그 Reason이 선언한 scope를 누락할 수 없다.
- 빈 범위나 명시되지 않은 whole-case 범위는 허용되지 않는다.

### Review actual stage/time

- 완료 command가 만든 time entry에 Case, stage, lawyer, commitment, slot, work를 보존한다.
- Review의 time_id는 같은 Case, 같은 stage, 같은 lawyer의 실제 완료 entry여야 한다.
- 연결된 commitment가 완료 상태여야 한다.
- Review scope는 같은 stage의 AppealTarget만 참조할 수 있다.
- Assignment나 active commitment 자체는 완료 time이나 Review를 만들지 않는다.

### RemandScope

- Remand Reason/Judgment의 선언 scope는 RemandScope의 returned scope 부분집합이어야 한다.
- Preserved scope 또는 return scope 밖을 선언한 변경은 거절한다.
- Remand Reason이 상급심 Reason을 source로 연결할 때 RemandScope에 반환된 upper Reason만 허용한다.
- RemandScope의 upper Reason은 같은 Case의 실제 Supreme stage Reason이어야 한다.

### Official / Internal transfer

- WorkProduct는 import, deliver, Reason source로 사용할 수 없다.
- Import는 record의 stage membership만 추가하고 recipient grant를 만들지 않는다.
- Official query는 명시적으로 해당 stage/recipient에 deliver된 submission/reason/judgment의 제한된 복사본만 반환한다.
- WorkProduct 전체와 debug/internal 필드는 official query에 노출되지 않는다.

모든 command 검증은 state mutation 전에 끝난다. Negative test는 각 거절 뒤 전체 `debug_snapshot()` deep equality를 확인한다.

## 추가한 negative tests

- appeal prior judgment from another Case
- Supreme incorrectly skipping to Trial judgment / invalid genealogy
- remand without RemandScope
- circular/self stage reference
- nonexistent future judgment reference
- second Trial breaking the fixture genealogy
- AppealTarget attacks Reason not in prior Judgment
- Reason source outside the attacked prior Reasons
- Reason outside AppealTarget scope
- Judgment mutates unrelated/unappealed claim
- review using different stage time_id
- review using different lawyer time_id
- review on incomplete commitment
- assignment → instant review
- remand mutation outside returned scope
- overwrite preserved scope
- Remand Judgment outside returned scope
- RemandScope using other Case Reason
- import WorkProduct
- deliver WorkProduct
- WorkProduct as Reason source
- imported-only record absent from recipient query
- malformed operation type

조회-only인 imported-only recipient 검사를 제외한 모든 실패 command는 별도의 snapshot unchanged check를 가진다.

## 테스트 실행 명령

프로젝트 root에서:

```powershell
& 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' --headless --path . --log-file ./test-results.log --script res://tests/run_regressions.gd
```

## 실행 결과

- Godot: 4.7.2 stable
- 전체 check 수: **185**
- failure 수: **0**
- 종료 코드: **0**
- 기존 TEST-008 정상 fixture: pass
- 기존 TEST-009 정상 fixture: pass
- 동일 seed/input replay snapshot: pass

## 여전히 fixture/injected 상태인 부분

- Judgment와 Reason의 내용 및 결과
- AppealTarget의 attacked Reason과 allowed scope
- RemandScope의 returned/preserved scope와 upper Reason
- Submission의 내용 및 공식 편입 허용 입력
- Commitment의 work 설명과 완료 command
- JS-R 환송 경로

## 자동화되지 않은 부분

- payload 문구의 법률적 의미와 선언 scope가 의미상 일치하는지 판독
- 판단 생성, 승패 또는 remedy 계산
- 증거 허용, 심리 종결, judgment-ready 판별
- appellate admissibility 및 dependency expansion
- binding doctrine과 precedent effect
- workload 수치, AI, UI, save/migration
- JS-K 등 fixture에 없는 대안 경로

## 설계 판단이 필요해 작업하지 않은 부분

- Appeal 또는 Supreme 이후 허용되는 추가 stage 조합
- 항소 대상 사이의 dependency로 scope를 자동 확장하는 규칙
- RemandScope의 `binding_rules`를 실행 규칙으로 해석하는 방식
- Opaque judgment payload의 필드와 claim/scope를 연결하는 정규 schema
- 명시적 Submission 외 다른 official-input 승격 절차

이 항목들은 현재 fixture에서 결정할 수 없고 법리 또는 새 게임 규칙을 요구하므로 구현하지 않았다.

## 임의 규칙 추가 여부

임의의 법률 판단, dependency expansion, binding doctrine, admissibility, evidence/workload/precedent 규칙은 추가하지 않았다. Stage predecessor는 TEST-009의 명시적 정상 계보만 고정했고, Reason/Judgment 허용 범위는 fixture에 이미 있는 AppealTarget/RemandScope의 명시적 scope만 사용한다. Fixture 보강도 그 기존 범위를 새 필드로 드러낸 네 곳에 한정했다.
