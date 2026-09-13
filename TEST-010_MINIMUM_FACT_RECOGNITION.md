# THE FIRM — TEST-010 최소 사실인정 경계 압력 테스트

문서 ID: `TEST-010`  
버전: `v0.2`  
검증 방식: **manual / fixture-level verification**  
기준: `DEC-LITIGATION-011 v0.2 — Minimum Fact Recognition Model`의 작업 요청상 Accepted 경계  
범위: 8개 core case, fixed input / injected semantic input / state / history / information boundary  
상태: 수동 trace 완료, 자동 사실인정 엔진 및 Godot 구현 미실행

## 1. 목적과 비목적

이 테스트는 새 게임 규칙을 만들지 않고, DEC-011에서 Accepted된 사실인정 경계를 고정 입력과 의미론적 주입값으로 압력 테스트한다. 테스트가 말하는 `observed result`는 엔진 실행 결과가 아니라, fixture를 경계 규칙에 따라 수동으로 처리한 관찰 trace다.

검증하지 않는 것:

- automatic fact-recognition engine, legal reasoning engine, judge AI, opponent AI
- evidence admissibility와 실제 대한민국 증거법·입증 표준
- natural-language evidence interpretation, automatic conflict classification, automatic lineage identity
- judgment generation, damages / remedy, precedent effect, appellate admissibility 또는 remand binding doctrine
- workload / Career / Business / World / UI / save 규칙

따라서 `PASS`는 “이 경계 불변식이 고정·주입 입력에서 유지되었다”는 뜻이지, 사실인정·증거법·판결 생성 엔진의 구현 완료를 뜻하지 않는다.

## 2. 공통 실행 계약

### 2.1 레코드와 정보 경계

| 구분 | 이번 테스트에서의 의미 | `CourtFactFinding` 입력 여부 |
|---|---|---|
| `ActualStateRecord` | 게임 세계의 실제 상태. case별로 바꿀 수 있는 injected semantic input | **아니오** |
| `FactProposition` | 법원이 판단할 명제 `P`, `Q`, `F1`, `F2`와 명시된 범위 | 예 |
| `EvidenceItem` / `EvidenceUse` | 증거 항목 및 특정 명제·범위에 대한 사용 관계 | 예, 단 `allowed` 범위만 |
| `CourtRecordSnapshot` | 해당 stage/cutoff에서 실제로 allowed된 record의 고정 snapshot | 필수 |
| `RecognitionCriterionRef` | 해당 명제에 적용할 판단 기준의 참조. fixture 밖의 법률 기준을 추론하지 않음 | 필수. 없으면 결과 생성 중단 |
| `CourtFactFinding` | 명제 수준의 결과와 그 근거·범위·criterion 참조 | 산출 |
| `FactFindingExplanation` | 공개 가능한 record와 이유만의 player-facing projection | 산출. hidden 정보 제외 |
| `ActualStateRecord`, hidden AP, internal WorkProduct | 내부/디버그 전용 | 공개 설명 및 finding에서 제외 |

`CourtRecordSnapshot`은 사건에 존재하는 모든 자료의 목록이 아니다. 이 테스트에서는 제출·수신·허용 범위를 외부에서 주입하고, snapshot에는 실제 allowed 범위만 넣는다. admissibility 자체를 테스트가 판단하지 않는다.

### 2.2 결과 상태의 의미

- `recognized`: 적용 criterion과 현재 snapshot의 범위 안에서 명제를 인정한 주입/관찰 결과.
- `recognized_limited`: 전체가 아닌 명시된 부분 범위만 인정하는 경우. 이번 8개 case에서는 전체 결과와 혼동하지 않는다.
- `not_established_on_record`: criterion은 존재하지만 현재 record가 그 criterion의 요구 범위를 충족하지 못함. 명제의 부정이나 반대명제 인정이 아니다.
- `undetermined`: criterion·명제 관계·후속 심급 허용 범위 등 필요한 기준이 없어 결과를 만들지 않음. `TBD`는 이 테스트의 미정 보고 표지일 뿐, 새 `CourtFactFinding` 상태가 아니다.

### 2.3 판정 규칙

- `PASS`: 요청된 경계 불변식이 수동 trace에서 그대로 유지됨.
- `PARTIAL`: 경계 일부는 유지되지만 DEC-011이 정하지 않은 결합/법적 기준 때문에 최종 fact finding은 TBD임.
- `FAIL`: 고정 입력 경계와 모순되는 관찰 결과가 발생함.
- `TBD`: 필요한 Accepted 기준이 없어 결과를 생성하지 않는 것이 올바른 관찰임.

## 3. Core case 결과 요약

| # | Core case | 핵심 관찰 | 상태 |
|---:|---|---|---|
| 1 | Truth non-interference | actual truth만 변경해도 finding·player explanation 불변 | **PASS** |
| 2 | Not-established vs contrary recognized | P의 부족과 Q의 독립 인정 분리 | **PASS** |
| 3 | Missing criterion vs insufficient record | criterion 없음은 undetermined/TBD, record 부족은 not established | **PASS** |
| 4 | Same-source duplicate / copy attack | 동일 lineage 개수는 독립 근거나 strength가 아님. exact identity는 TBD | **PARTIAL** |
| 5 | Credibility vs sufficiency | evidence credibility와 proposition-level result를 분리. 결합 결과는 TBD | **PARTIAL** |
| 6 | Submitted / received / allowed | snapshot은 allowed 범위만 소비 | **PASS** |
| 7 | Prior-stage preservation / partial review | trial 이력 append-only, review scope 안에서만 later finding 추가 | **PASS** |
| 8 | Deterministic replay | 동일 입력 재생의 의미상 동일 결과, fact-finding 전용 RNG 없음 | **PASS** |

## 4. 8개 core case 상세 trace

### 4.1 Case 1 — Truth non-interference

**DEC-011 근거**: F1-C Accepted, Core invariant 1, Section 17 첫 실행 case 1.

**Fixed input**

- Case/Stage: `CASE-010-1` / `TRIAL-1`
- `CourtRecordSnapshot`: `SNAP-1 = [E1]`; `E1`은 `P`의 full 범위를 support하는 allowed record entry
- `RecognitionCriterionRef`: `CRIT-1`; fixture가 `E1`의 주입된 범위가 `P` 판단에 충분하다고 표시
- Command: `FIND_FACT(P)`
- 두 변형의 snapshot, criterion, command, 공개 record, history는 동일

**Injected semantic assumption**

- `ACTUAL-1-A`: `ActualStateRecord.P_actual = true`
- `ACTUAL-1-B`: `ActualStateRecord.P_actual = false`
- actual state는 finding 함수에 전달하지 않는 별도 입력이다.

**Processing boundary**

`CourtFactFinding`은 `SNAP-1 + P + CRIT-1 + command`만 소비한다. actual truth는 debug-only comparison에서만 읽을 수 있고, `FactFindingExplanation`에 투영하지 않는다.

**Expected result**

- A/B 모두 `Finding(P) = recognized`.
- A/B의 player-facing explanation은 의미상 동일.
- debug-only truth comparison만 A/B에서 다를 수 있음.

**Actual observed result**

- 수동 trace에서 A와 B의 finding 입력 집합이 동일함을 확인했다.
- 두 trace 모두 `recognized`와 동일한 공개 설명을 기록했다.
- `ActualStateRecord`는 finding 입력 및 공개 설명에서 제외했다.

**판정: PASS**

**검증하지 않은 것**: E1의 진실성·위조 여부 탐지, 실제 엔진의 접근 제어, 실제 UI 렌더링.

### 4.2 Case 2 — Not-established vs contrary recognized

**DEC-011 근거**: F2 Accepted, Core invariant 2, Section 17 첫 실행 case 2.

**Fixed input**

- Case/Stage: `CASE-010-2-A/B` / `TRIAL-2`
- 명제 `P`와 `Q`는 fixture가 해당 범위에서 양립 불가능하다고 명시한 별도 `FactProposition`이다.
- `P`용 `CRIT-2-P`, `Q`용 `CRIT-2-Q`는 별도 criterion reference다.
- 두 변형 모두 `P`를 지지하는 allowed record는 부족하다.

**Injected semantic assumption**

- A: `Q`를 지지하는 독립 record 없음.
- B: `E-Q`가 `Q`의 full 범위를 독립적으로 support하고 `CRIT-2-Q`를 충족한다는 의미론적 input.
- `P not established`는 `Q recognized`를 뜻하지 않는다는 경계를 고정한다.

**Processing boundary**

P와 Q를 별도 command/별도 finding으로 처리한다. `not_established_on_record(P)`에서 `not-P` 또는 `recognized(Q)`를 자동 생성하지 않는다. Q의 결과는 Q의 own record와 criterion으로만 정한다.

**Expected result**

- A: `Finding(P) = not_established_on_record`; `Finding(Q) = not_established_on_record`.
- B: `Finding(P) = not_established_on_record`; `Finding(Q) = recognized`.

**Actual observed result**

- A에서는 P의 부족이 Q의 finding으로 전파되지 않았다.
- B에서는 `E-Q`와 `CRIT-2-Q`를 추가한 Q만 `recognized`가 되고 P는 그대로였다.

**판정: PASS**

**검증하지 않은 것**: P/Q 관계를 자연어로 자동 발견하는 기능, 법률상 반증·추정 효과, conflict resolution.

### 4.3 Case 3 — Missing criterion vs insufficient record

**DEC-011 근거**: F2의 canonical 상태 구분, F10 Accepted, Core invariant 3, Section 17 첫 실행 case 3·4.

**Fixed input**

- Case/Stage: `CASE-010-3-A/B` / `TRIAL-3`
- 두 변형의 명제 `P`, submitted/received/allowed record, command는 동일하다.
- record는 `P` 전체 범위를 확정하기에 부족한 내용으로 주입한다.

**Injected semantic assumption**

- A: `RecognitionCriterionRef`가 없음.
- B: `CRIT-3-B`가 존재하지만 현재 snapshot의 record가 criterion 요구 범위를 충족하지 않음.

**Processing boundary**

criterion lookup 실패와 criterion 적용 후 record 부족을 별도 상태로 보존한다. criterion이 없으면 먼저 결과를 선택한 뒤 설명을 만들지 않는다.

**Expected result**

- A: `Finding(P) = undetermined` 및 `[상세 사실인정 기준 미정]`.
- B: `Finding(P) = not_established_on_record`.
- A를 B로, B를 A로 병합하지 않음.

**Actual observed result**

- A trace는 `CourtFactFinding`을 확정하지 않고 `undetermined/TBD`로 중단했다.
- B trace는 criterion reference를 보존한 채 `not_established_on_record`로 기록했다.

**판정: PASS**

**검증하지 않은 것**: criterion의 법률적 내용, 입증 threshold의 일반화, 절차 미완료와 fact insufficiency의 실제 법적 효과.

### 4.4 Case 4 — Same-source duplicate / copy attack

**DEC-011 근거**: F3-C Core Accepted 및 Section 17 첫 실행 case 4·7. exact lineage-contribution identity algorithm은 DEC-011의 TBD 경계다.

**Fixed input**

- Case/Stage: `CASE-010-4` / `TRIAL-4`
- `E1-original`, `E1-copy`, `E1-excerpt`, `E1-citation`은 fixture에서 모두 `source_lineage_id = LINEAGE-4`로 명시한다.
- 네 항목의 제출·수신·allowed 범위와 각 `EvidenceUse`를 별도로 기록한다.
- baseline은 원본 1개, attack은 같은 lineage 항목 4개다.

**Injected semantic assumption**

- 동일 lineage는 fixture가 선언한 하나의 source lineage다.
- 사본·발췌·재인용의 수는 독립 source count 또는 strength score로 변환하지 않는다.
- DEC-011에 exact identity algorithm이나 sufficiency 결합식은 없으므로 별도 algorithm/threshold를 만들지 않는다.

**Processing boundary**

`EvidenceItem`의 ID 개수와 `source_lineage_id`를 구별해 보존한다. finding 단계는 copy count를 입력 점수로 사용하지 않는다. lineage 동일성은 fixture 선언을 읽을 뿐 자동 판정하지 않는다.

**Expected result**

- baseline과 attack 사이에 “복사 개수만으로 강화된 credibility/sufficiency”가 없어야 한다.
- 동일 lineage를 독립 corroboration으로 보고 최종 인정으로 승격하지 않는다.
- 어떤 lineage가 criterion을 충족시키는지는 기준이 없으므로 `undetermined`와 `TBD` 사유 표지로 남긴다.

**Actual observed result**

- 네 항목은 같은 lineage contribution으로 trace에 묶였고, copy count 기반 score/가산은 생성되지 않았다.
- exact identity algorithm과 proposition-level sufficiency 결합 규칙은 실행하지 않았다.
- 따라서 duplicate non-strengthening 불변식은 확인했지만 최종 fact-finding은 `undetermined`로 보류했다.

**판정: PARTIAL**

**검증하지 않은 것**: 자동 lineage identity, 독립 corroboration의 법적·의미론적 판별, evidence 결합 공식, threshold.

### 4.5 Case 5 — Credibility vs sufficiency separation

**DEC-011 근거**: F4 Accepted 및 Section 17 첫 실행 case 5·8. evidence combination/weighting은 DEC-011이 확정하지 않은 TBD 경계다.

**Fixed input**

- Case/Stage: `CASE-010-5` / `TRIAL-5`
- `CRIT-5`와 `P`의 required scope는 fixture input으로 주입하며, 실제 법률 기준으로 해석하지 않는다.
- `E1`: credible이나 `P`의 partial scope만 support.
- `E2`: contested/disputed이나 full scope를 주장.
- `E3`: independent lineage의 credible full-scope support.
- `E4`: credible이나 `P`와 irrelevant.

**Injected semantic assumption**

- 각 evidence의 `CredibilityAssessment` 상태와 scope/relevance는 주입값이다.
- `E2` 외에 `E3`가 존재하는 변형을 별도 trace로 둔다.
- credibility 값을 proposition-level sufficiency 값으로 복사하지 않는다.

**Processing boundary**

먼저 evidence-use 범위별 credibility/relevance를 기록하고, 별도의 proposition-level sufficiency 질문으로 넘긴다. evidence의 credibility 상태만으로 finding을 자동 복사하지 않는다.

**Expected result**

- E1만: credible이지만 partial이므로 `P` 전체 finding은 `undetermined` 또는 주입 criterion상 `not_established_on_record`.
- E2만: contested 상태가 곧 opposite recognized가 아니며, 최종 sufficiency는 `undetermined`.
- E3가 독립 full-scope 근거로 주입된 경우에도, 별도 결합 기준이 없으면 `P`의 finding은 `undetermined`로 둔다.
- E4만: credible이어도 irrelevant이므로 `P` sufficiency를 높이지 않는다.
- credibility state와 CourtFactFinding 결과가 같은 값으로 복사되지 않는다.

**Actual observed result**

- E1/E2/E3/E4는 각자 credibility, scope, relevance, lineage를 별도 필드로 보존했다.
- E1과 E4의 high credibility가 full proposition finding으로 복사되지 않았다.
- E2의 contested 상태가 Q 또는 not-P로 전환되지 않았다.
- E3가 충분성에 미치는 최종 효과를 정하는 결합 규칙은 없으므로 `undetermined`로 남겼다.

**판정: PARTIAL**

**검증하지 않은 것**: credibility 평가 방법, 증거 결합·상쇄·가중치, 실제 입증 threshold, 판사의 판단.

### 4.6 Case 6 — Submitted / received / allowed boundary

**DEC-011 근거**: F6 Accepted 및 Section 17 첫 실행 case 6·10.

**Fixed input**

- Case/Stage: `CASE-010-6` / `TRIAL-6`
- `E1`: case DB에는 존재하지만 미제출.
- `E2`: submitted but not received.
- `E3`: received but not allowed for fact finding.
- `E4`: partially allowed; `P`에 partial 범위만 허용.
- `E5`: fully allowed; `P`에 full 범위 허용.
- admissibility/allowed 상태는 fixture 주입값이다.

**Injected semantic assumption**

- `CourtRecordSnapshot` 생성 시 실제 allowed scope만 편입한다.
- E1/E2/E3의 credibility가 높아도 snapshot 편입 권한을 만들지 않는다.

**Processing boundary**

`case existence → submitted → received → allowed_for_fact_finding`를 각각 확인한다. 사실인정은 snapshot의 `allowed_record_entry_ids`만 소비한다.

**Expected result**

- snapshot 포함: `E4(P: partial)`, `E5(P: full)`.
- snapshot 제외: `E1`, `E2`, `E3`.
- 미허용 자료를 근거로 한 finding은 생성하지 않는다.

**Actual observed result**

- 수동 snapshot은 E4의 partial과 E5의 full만 포함했다.
- E1/E2/E3는 case history에는 남지만 `CourtFactFinding` 입력에는 나타나지 않았다.
- E5가 P에 충분한지는 별도 criterion/결합 규칙 문제이므로 이 case의 fact finding은 `undetermined`로 두고 snapshot 경계만 관찰했다.

**판정: PASS**

**검증하지 않은 것**: admissibility의 정당성, 허용 결정 생성, E5의 법률상 증명력, 허용 범위의 자동 산정.

### 4.7 Case 7 — Prior-stage finding preservation / partial review

**DEC-011 근거**: F7 Accepted 및 Section 17 첫 실행 case 7·13·14. appellate/remand legal effect는 DEC-011의 TBD 경계다.

**Fixed input**

- Case: `CASE-010-7`; Trial stage `TRIAL-7`, Appeal stage `APPEAL-7`.
- Trial snapshot `SNAP-7-T`와 Trial findings:
  - `F1 = recognized`
  - `F2 = not_established_on_record`
- Trial finding과 snapshot은 append-only history로 저장한다.

**Injected semantic assumption**

- Appeal `review_scope = [F1]`.
- `F1`에 대한 later-stage 유지 finding은 명시적으로 주입한다.
- `F2`는 review scope 밖이며 별도의 Appeal finding을 추가하지 않는다.
- appellate legal effect, binding, remand doctrine은 주입하지 않는다.

**Processing boundary**

`prior_finding_ref → review_scope → later-stage finding` 연결만 추가한다. 범위 밖 fact를 재계산·삭제·덮어쓰지 않는다. Trial 기록은 Appeal의 조회 또는 결과로 승격하지 않는다.

**Expected result**

- Trial `F1`, `F2`, `SNAP-7-T` 원본이 그대로 보존.
- Appeal에서는 F1만 later-stage finding 추가 가능.
- F2에는 Appeal finding이 없고 Trial finding이 unchanged로 남음.
- 관련 없는 fact를 재계산하지 않음.

**Actual observed result**

- `F1`에 대해서만 Appeal review trace와 later-stage finding을 추가했다.
- `F2` 대상 later-stage command는 scope 밖으로 기록하고 새 finding은 만들지 않았다.
- Trial findings와 `SNAP-7-T`는 삭제·수정되지 않았다.

**판정: PASS**

**검증하지 않은 것**: 항소의 실제 적법성·허용, 원심 finding의 법적 효력, appellate judgment와 remand binding.

### 4.8 Case 8 — Deterministic replay / no new fact-finding RNG

**DEC-011 근거**: F8·F9 Accepted, Section 16 Core invariant 1·2·3 및 Section 17 첫 실행 case 8·18.

**Fixed input**

- Case/Stage: `CASE-010-8` / `TRIAL-8`.
- `SNAP-8`, `P`, `CRIT-8`, command sequence `FIND_FACT(P)`가 두 replay run에서 동일하다.
- record order, IDs, stage, cutoff, criterion version, command order도 동일하다.

**Injected semantic assumption**

- replay 1과 replay 2는 동일한 fixed input을 독립적으로 재생한다.
- fact recognition용 새 RNG, hidden probability, final RNG, judge personality는 주입하지 않는다.
- `seed`가 있으면 replay metadata일 뿐 fact finding 선택값이 아니다.

**Processing boundary**

snapshot과 finding의 의미 필드를 비교한다. 생성 시각·trace execution id 같은 실행 메타데이터는 의미 비교에서 제외할 수 있으나 proposition, scope, sources, criterion, status, explanation은 동일해야 한다.

**Expected result**

- 두 replay의 `CourtRecordSnapshot`이 의미상 동일.
- 두 replay의 `CourtFactFinding`과 public explanation이 의미상 동일.
- fact-recognition 전용 RNG 호출이 없음.

**Actual observed result**

- fixture trace의 두 run은 동일한 snapshot membership, criterion reference, evidence use, finding status, explanation을 기록했다.
- 별도 fact-finding RNG나 판사 성향값은 trace에 존재하지 않는다.

**판정: PASS**

**검증하지 않은 것**: 실제 엔진의 RNG 호출 감시, byte-identical serialization, 다른 시스템의 중앙 RNG 재현성, 저장/복원.

## 5. DEC-011과의 contradiction 검토

현재 worktree의 `DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md`를 직접 읽고 TEST-010 전체와 대조했다. 문서 헤더는 `v0.2 — 기획 결정 반영`, 상태는 `Accepted`다. F1·F2·F4·F6·F7·F8·F9·F10은 Accepted, F3·F5는 Core Accepted이며 exact lineage-contribution identity algorithm과 conflict classification generation은 TBD다.

| DEC-011 경계 | TEST-010 확인 |
|---|---|
| ActualStateRecord와 CourtFactFinding 분리 | Case 1에서 actual truth만 변경하고 finding/explanation 불변 |
| not established는 opposite recognized가 아님 | Case 2에서 P/Q를 별도 command와 근거로 처리 |
| criterion 부재와 record 부족 분리 | Case 3에서 각각 undetermined와 not_established_on_record |
| 동일 source의 복제는 독립 근거가 아님 | Case 4에서 fixture lineage만 소비하고 copy count 가산 금지 |
| credibility와 sufficiency 분리 | Case 5에서 별도 필드와 별도 판단 경계 유지 |
| allowed record만 snapshot에 편입 | Case 6에서 E4/E5의 allowed scope만 포함 |
| prior finding append-only, 부분 review | Case 7에서 F1만 later finding 추가, F2/Trial 보존 |
| 결정성 및 새 fact-finding RNG 금지 | Case 8에서 동일 입력의 의미상 동일 replay |

대조 결과, TEST-010은 위 Accepted/Core Accepted 경계 및 canonical vocabulary와 모순되지 않는다. Case 4는 duplicate non-strengthening 경계를 확인했지만 exact lineage-contribution identity가 TBD이므로 PARTIAL, Case 5는 credibility/sufficiency 분리를 확인했지만 evidence combination이 TBD이므로 PARTIAL이다. 나머지 6개 case는 각 case가 요청한 경계 불변식을 확인하므로 PASS다. DEC-011 파일은 수정하지 않았다.

## 6. 구현 전에 남은 design gap

이번 테스트에서 새 규칙으로 채우지 않고 남긴 항목이다.

1. `RecognitionCriterionRef`의 실제 내용, 버전, 권위와 적용 범위.
2. `not_established_on_record`와 `undetermined`의 절차·최종 판정 연결.
3. evidence의 credibility 평가 방법과 범위별 변경 이력.
4. proposition-level sufficiency의 결합 방식, threshold, 부분 인정 조건.
5. 동일 lineage와 독립 corroboration의 의미론적 판별. exact identity algorithm은 만들지 않음.
6. 충돌 evidence의 분류·해결·미해결 범위 처리.
7. `allowed` 판정의 외부 소유자와 snapshot 생성 계약.
8. 심급별 prior finding의 법적 효력, appellate review 허용, remand 범위·binding.
9. public explanation의 공개 시점·문구·상세 수준.
10. persistent save/restore와 의미상 동일 replay의 serialization 기준.

위 gap은 당사자의 패소, 반대사실 인정, 증거 배척 또는 자동 결과로 채우지 않는다. 구현 전에 Accepted 결정으로 확정되지 않으면 해당 경계의 결과는 계속 `TBD`다.

## 7. 금지 사항 점검

| 점검 항목 | 결과 |
|---|---|
| ActualStateRecord를 CourtFactFinding 입력으로 전달 | 하지 않음 |
| P not-established를 Q 또는 not-P recognized로 변환 | 하지 않음 |
| criterion이 없는데 finding 생성 | 하지 않음 |
| duplicate count를 strength score로 환산 | 하지 않음 |
| credibility와 sufficiency를 같은 값으로 복사 | 하지 않음 |
| CourtRecordSnapshot에 미제출·미수신·미허용 record 포함 | 하지 않음 |
| review scope 밖 fact의 later-stage finding 추가 | 하지 않음 |
| hidden AP / WorkProduct / actual truth를 player explanation에 포함 | 하지 않음 |
| hidden probability / final RNG / judge personality 사용 | 하지 않음 |
| actual Korean evidentiary law 또는 proof threshold 발명 | 하지 않음 |
| Godot 구현 또는 기존 DEC/SYS/TEST 문서 수정 | 하지 않음 |

## 8. 결론

8개 core case를 DEC-011 v0.2 원문과 직접 대조한 최종 판정은 6 PASS / 2 PARTIAL이다. Case 4·5의 PARTIAL은 DEC-011이 명시적으로 TBD로 남긴 exact lineage identity와 evidence combination 경계 때문이며, 이를 새 규칙으로 채우지 않았다. 사용된 fact-finding 상태명은 `recognized`, `recognized_limited`, `not_established_on_record`, `undetermined`뿐이다.

이 결과는 DEC-011의 Accepted 경계를 압력 테스트한 것이며, automatic fact-recognition, legal reasoning, admissibility, 실제 한국 입증 표준, judgment generation의 검증 결과가 아니다. 새 게임 규칙은 추가하지 않았다.
