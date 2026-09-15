# THE FIRM — RecognitionCriterion 및 Evidence Sufficiency 구조 검증

Document ID: `TEST-011`  
문서 ID: `TEST-011`  
버전: `v0.1`  
상태: **Proposed / manual fixture-level verification**  
유형: Manual / fixture-level verification  
Source DEC: [DEC-LITIGATION-012_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md](DEC-LITIGATION-012_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md) v0.3 Accepted  
기준: [DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md](DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md) v0.2 Accepted 및 TEST-010 v0.2  
프로젝트: THE FIRM

이 테스트는 DEC-012가 채택한 구조를 **명시적으로 주입한 semantic input**으로 수동 대조한다. 아래의 `actual observed manual result`는 구현 엔진 실행 결과가 아니라 고정 입력을 DEC-012의 경계에 따라 추적한 audit trace다. 이 문서는 Godot/GDScript, 저장 파일, 실행 fixture 또는 API를 만들지 않는다.

## 1. Verification boundary

### 1.1 이 테스트가 검증하는 것

- proposition evaluation이 versioned, applicable `RecognitionCriterionRef`를 요구하고 criterion missing을 record insufficiency와 구별하는가.
- named `PropositionScope`와 `CriterionRequirement`가 mandatory coverage를 표현하는가.
- `EvidenceItem`과 proposition/scope별 `EvidenceUse` 및 qualitative `EvidenceContribution`가 분리되는가.
- relevance, credibility, lineage/corroboration, conflict, proposition sufficiency가 서로 다른 차원으로 남는가.
- 같은 source lineage의 copy/excerpt/requote가 duplicate corroboration이 되지 않는가.
- explicit independent lineage는 구별되지만, criterion이 명시하지 않는 한 universal sufficiency rule이 되지 않는가.
- `recognized_limited`가 named, severable, criterion-authorized scope에만 쓰이는가.
- unresolved material conflict가 양측 trace를 보존하고 필요한 rule 부재를 `undetermined`로 남기는가.
- `JudgeInterpretationInput`이 criterion-declared genuine ambiguity에만 제한되는가.
- 동일 semantic input이 동일 canonical result를 내고 hidden score·fact-finding RNG가 없는가.
- `CourtFactFinding`에서 criterion, requirements, evidence, allowed record, lineage/credibility/conflict까지 역추적되며 DEC-008의 legal effect와 분리되는가.

### 1.2 이 테스트가 검증하지 않는 것

이 문서는 다음을 검증 완료로 주장하지 않는다.

- 실제 한국 증거법, 실제 입증 기준·증명도 또는 실제 threshold.
- automatic lineage detection, automatic corroboration identity 또는 자연어 lineage 판별.
- NLP extraction/classification, 자연어 proposition/scope/contribution/conflict 생성.
- admissibility generation 또는 `allowed_for_fact_finding` 결정 생성.
- judge AI, JudgeProfile generation, 또는 `JudgeProfile → JudgeInterpretationInput` derivation.
- legal reasoning engine, final adjudication engine, burden assignment, damages, remedy.
- appellate/remand legal effects 또는 prior finding의 실제 법적 효력.
- Godot implementation, save/load correctness, UI, serialization completeness, performance.

TEST-010의 검증 방식도 manual / fixture-level verification이다. TEST-010은 8개 core case에서 6 PASS / 2 PARTIAL을 보고했다. TEST-010 Case 4의 duplicate non-strengthening과 Case 5의 credibility/sufficiency separation은 이 테스트의 회귀 입력으로 사용하되, 각 PARTIAL의 미검증 영역을 새 규칙으로 바꾸지 않는다.

### 1.3 Explicit prohibitions

이 테스트는 다음 anti-pattern을 통과로 인정하지 않는다.

- numeric evidence strength points, hidden percentages 또는 evidence-count majority.
- duplicate evidence farming 또는 같은 lineage presentation을 독립 corroboration으로 세기.
- failure of proof에서 contrary fact를 자동 인정하기.
- `ActualStateRecord`를 judicial evaluation에 전달하기.
- `JudgeInterpretationInput`을 free outcome selector 또는 disguised outcome switch로 사용하기.
- final RNG 또는 hidden probability로 close case를 결정하기.
- 하나의 global case-strength score로 proposition-level reasoning을 대체하기.

## 2. Fixed semantic vocabulary

아래는 DEC-012의 semantic reference vocabulary를 그대로 사용한 것이다. canonical Godot class, JSON, save schema 또는 API schema가 아니다.

| 용어 | 이 테스트에서의 의미 | 경계 |
|---|---|---|
| `FactProposition` | 법원이 평가할 명시 문장과 범위 | `ActualStateRecord`의 truth를 보유하지 않음 |
| `PropositionScope` | 명제 안의 named semantic boundary | percentage 또는 완료율이 아님 |
| `RecognitionCriterion` | requirements, scope 관계, sufficiency/conflict/lineage rule과 허용 interpretation choice를 제공하는 content-defined 기준 | 실제 한국법 기준을 이 문서가 선언하지 않음 |
| `RecognitionCriterionRef` | proposition evaluation에 binding된 criterion identity/version/applicability 참조 | ref가 없으면 default rule을 만들지 않음 |
| `CriterionRequirement` | required/alternative/conditional/severable 관계와 satisfaction rule을 가진 기준 항목 | 숫자 점수나 UI checklist가 아님 |
| `EvidenceItem` | 원자료 및 source lineage/derived-from 정보 | evidence strength 숫자 없음 |
| `EvidenceUse` | 특정 `FactProposition`/scope에서 허용된 content를 어떤 역할로 사용하는 관계 | 다른 proposition 사용으로 evidence가 소비되지 않음 |
| `EvidenceContribution` | `supports`, `contradicts`, `undermines_basis`, `limits_scope`, `contextualizes`, `irrelevant_for_scope` 같은 qualitative role | role 자체가 sufficiency 결과가 아님 |
| `CourtRecordSnapshot` | 해당 stage/cutoff에서 실제 allowed record만 고정한 입력 | 사건 전체 자료 목록이 아님 |
| `CredibilityAssessment` | evidence content/scope/stage에 대한 정성 신빙성 상태와 이유 | credibility가 sufficiency가 아님 |
| `LineageAssessment` | source lineage, derived-from, contribution group, independence 상태 | 자동 identity algorithm이 아님 |
| `EvidenceConflict` | 양측 EvidenceUse와 충돌 범위·materiality·resolution 상태를 보존 | 한쪽 삭제나 숫자 상쇄가 아님 |
| `RequirementEvaluation` | requirement별 relevant contributions, credibility/lineage/conflict 참조, qualitative outcome | canonical finding status가 아님 |
| `SufficiencyEvaluation` | criterion과 record를 proposition/scope 수준에서 결합한 구조적 평가 | claim outcome이 아님 |
| `JudgeInterpretationInput` | criterion이 연 genuine ambiguity choice point에서 명시된 permitted option | 자유 outcome selector나 JudgeProfile 생성 결과가 아님 |
| `CourtFactFinding` | DEC-011 canonical 사실인정 결과 | 아래 네 status만 사용 |
| `FactFindingExplanation` | internal trace의 disclosure-filtered public projection | hidden truth/AP/비공개 자료를 포함하지 않음 |

### 2.1 Canonical status contract

이 테스트에서 `CourtFactFinding.status`는 다음 네 값만 허용한다.

- `recognized`
- `recognized_limited`
- `not_established_on_record`
- `undetermined`

`criterion_missing`, `conflict_resolution_rule_missing`, `procedure_open` 같은 표현은 reason/blocker일 뿐 다섯 번째 status가 아니다. `PASS`, `PARTIAL`, `FAIL`은 테스트 verdict이며 CourtFactFinding status가 아니다.

## 3. Ten core cases

각 case의 “actual observed manual result”는 semantic inputs를 읽고 DEC-012의 processing boundary를 적용한 수동 trace다. 실제 법률 결론이 아니다.

### Case 1 — Criterion present vs missing

**DEC-012 basis:** R1, R9, Core invariant 1·Criterion required; TEST-010 Case 3.

**Fixed input**

- 동일 `Case`, `Stage`, `FactProposition P`, evaluated scope S1.
- 동일 `CourtRecordSnapshot`과 동일 allowed `EvidenceUse`.
- 동일 command sequence `FIND_FACT(P)`.

**Injected semantic assumptions**

- Variant A: valid and applicable `RecognitionCriterionRef = C-1/v1`가 P/S1에 binding.
- Variant B: `RecognitionCriterionRef`가 missing.
- A와 B 어느 쪽에도 default/common-sense threshold를 주입하지 않는다.

**Processing boundary**

- A는 C-1의 requirements를 전개해 substantive evaluation을 계속할 수 있다.
- B는 record를 보고도 criterion을 추측하지 않고 `criterion_missing` blocker와 `[상세 사실인정 기준 미정]`을 기록한다.
- B의 missing criterion은 evidence insufficiency로 재분류하지 않는다.

**Expected result**

- A: substantive evaluation may proceed; 최종 status는 C-1의 명시된 requirements와 record에 따른다.
- B: `undetermined`.
- B는 `not_established_on_record`가 아니다.

**Actual observed manual result**

- A trace에는 C-1/v1, P/S1 binding과 requirement evaluation 시작이 남았다.
- B trace는 criterion lookup에서 중단되고 `undetermined`/`criterion_missing`를 남겼다.
- 두 variant 모두 hidden/default threshold나 evidence-count fallback을 만들지 않았다.

**Verdict: PASS**

**Remains unverified:** criterion의 실제 법률 내용, criterion registry/validation, 자동 applicability resolution, 구현 오류 처리.

### Case 2 — Required-scope coverage

**DEC-012 basis:** R2, R6, R9; TEST-010 Case 3·5의 criterion/record distinction.

**Fixed input**

- 하나의 P가 named scopes S1, S2, S3를 가진다.
- complete criterion C-2는 세 scope를 모두 mandatory로 선언한다.
- 동일 closed `CourtRecordSnapshot`, 동일 allowed evidence role vocabulary, 동일 command sequence.

**Injected semantic assumptions**

- Variant A: S1/S2/S3의 requirements가 각각 structural satisfaction으로 주입된다.
- Variant B: S1/S2는 satisfied, S3에는 supporting `EvidenceUse`가 전혀 없다.
- C-2는 alternative path나 severable partial recognition을 제공하지 않는다.

**Processing boundary**

- requirement coverage를 scope별로 평가한다.
- S1/S2의 support가 S3의 mandatory gap을 상쇄하지 않는다.
- completion percentage, strength point, evidence count를 생성하지 않는다.

**Expected result**

- A: 다른 조건도 충족한다는 fixture 전제에서 `recognized` 가능.
- B: `not_established_on_record`.

**Actual observed manual result**

- A는 세 requirement 모두 `satisfied_for_scope`로 연결되어 `recognized` transition을 허용했다.
- B는 S3를 `not_satisfied_on_record`로 남기고 P 전체를 `not_established_on_record`로 전이했다.
- S1/S2의 support를 S3로 복사하거나 숫자 완료율로 표시하지 않았다.

**Verdict: PASS**

**Remains unverified:** 실제 scope authoring, requirement normalization, 실제 proof threshold, 대안 경로의 법적 효과.

### Case 3 — Duplicate lineage attack

**DEC-012 basis:** R3, R5, Core invariant Lineage-aware corroboration; TEST-010 Case 4 PARTIAL.

**Fixed input**

- 동일 P/S1에 대한 baseline `EvidenceItem E1`과 하나의 allowed contribution.
- baseline과 attack 모두 같은 Case/Stage/CourtRecordSnapshot boundary를 사용한다.

**Injected semantic assumptions**

- Attack variant에 `E1-copy`, `E1-excerpt`, `E1-requote`를 추가한다.
- 네 item은 fixture가 `source_lineage_id = L-3`, 같은 `derived_from` 관계와 같은 `lineage_contribution_group`이라고 명시한다.
- lineage identity는 자동 검출하지 않고 이 fixture의 injected input으로만 읽는다.

**Processing boundary**

- 네 presentation과 각 EvidenceUse는 trace에 별도로 남긴다.
- sufficiency topology는 같은 lineage/contribution group을 독립 corroboration으로 세지 않는다.
- duplicate count로 credibility·sufficiency를 강화하지 않는다.

**Expected result**

- presentation trace에는 네 item 모두 있을 수 있다.
- duplicate count만으로 corroboration topology나 sufficiency가 강해지지 않는다.
- automatic lineage identity detection을 주장하지 않는다.

**Actual observed manual result**

- baseline과 attack의 independent source group 수는 모두 하나로 남았다.
- attack은 네 개의 presentation reference를 보존했지만, 같은 lineage contribution을 반복 가산하지 않았다.
- exact identity algorithm이나 universal sufficiency threshold가 없으므로 최종 인정 여부는 이 case에서 새로 결정하지 않았다.

**Verdict: PASS** *(duplicate non-strengthening boundary only)*

**Remains unverified:** automatic lineage identity, 복합 source 분할, independent analysis 여부, corroboration의 actual criterion effect, evidence combination engine. TEST-010의 PARTIAL을 PASS로 재분류한 것이 아니다.

### Case 4 — Independent corroboration

**DEC-012 basis:** R5, R6, R3; TEST-010 Case 7.

**Fixed input**

- P/S1에 같은 role과 content boundary를 가진 두 EvidenceUse.
- criterion C-4와 closed snapshot은 두 variant에서 동일하다.

**Injected semantic assumptions**

- Variant A: U1/U2는 같은 source lineage L-4로 명시.
- Variant B: U1은 L-4A, U2는 L-4B로 명시된 independent lineages.
- C-4만 “이 requirement에서 independent corroboration이 필요하면 해당 condition을 충족 후보로 본다”고 명시한다. 다른 사건에 universalize하지 않는다.

**Processing boundary**

- independence state는 EvidenceItem ID 개수가 아니라 injected lineage assessment에서 읽는다.
- C-4가 허용한 requirement에만 independent state를 전달한다.
- two IDs alone은 independence가 아니다.

**Expected result**

- A와 B의 lineage topology는 다르게 기록된다.
- A는 independent-corroboration requirement를 충족하지 않는다.
- B는 다른 mandatory requirements도 충족한다는 fixture 전제에서 그 requirement를 충족할 수 있다.
- “two sources = enough”라는 전역 규칙은 생성하지 않는다.

**Actual observed manual result**

- A는 두 use를 한 lineage contribution group으로 묶었다.
- B는 두 independent lineage reference를 분리해 C-4의 명시된 requirement에만 연결했다.
- 두 EvidenceItem ID만으로 B가 된 것으로 처리하지 않았다.

**Verdict: PASS** *(injected independence distinction only)*

**Remains unverified:** independent lineage 자동 판별, 실제 corroboration 의미론, C-4 외 criterion의 요구, 실제 법률상 corroboration 효과.

### Case 5 — Credibility / relevance / sufficiency separation

**DEC-012 basis:** R4, R6, R3; TEST-010 Case 5 PARTIAL.

**Fixed input**

- 동일 P와 named scope S1, 동일 complete/explicit fixture criterion C-5.
- 각 variant는 allowed record와 `EvidenceUse`를 별도로 주입한다.

**Injected semantic assumptions**

- Variant A: E1은 `credible_for_scope`지만 P/S1에는 `irrelevant_for_scope`.
- Variant B: E2는 P/S1에 relevant/support지만 credibility가 `disputed`; C-5에는 그 disputed 상태를 닫는 rule이 없다.
- Variant C: E3는 P/S1에 credible/relevant지만 partial-scope만 support한다.

**Processing boundary**

- relevance는 EvidenceUse link에, credibility는 assessed content scope에, sufficiency는 P + C-5 + snapshot 전체에 기록한다.
- 한 차원의 상태를 다른 차원의 값으로 복사하지 않는다.
- C-5가 disputed credibility의 resolution을 제공하지 않으면 결과를 억지로 accepted/rejected로 닫지 않는다.
- partial support를 fractional recognition으로 표시하지 않는다.

**Expected result**

- A: credible하지만 irrelevant인 E1은 P sufficiency를 높이지 않는다.
- B: material disputed credibility와 resolution rule 부재는 `undetermined`로 남는다.
- C: partial-scope support는 전체 P의 자동 recognition이 아니다.

**Actual observed manual result**

- A의 credibility 상태는 유지됐지만 S1 coverage contribution은 생성되지 않았다.
- B는 relevance를 유지하면서 `credibility_resolution_rule_missing` blocker와 `undetermined`를 남겼다.
- C는 support boundary와 missing boundary를 분리했으며 hidden fraction이나 자동 `recognized_limited`를 만들지 않았다.

**Verdict: PASS** *(separation boundary only)*

**Remains unverified:** credibility assessment generation, evidence combination/weighting, actual threshold, judge resolution. TEST-010의 PARTIAL 결합 공백은 그대로 남는다.

### Case 6 — Explicit partial recognition

**DEC-012 basis:** R2, R7, R9; DEC-011 F2; TEST-010 vocabulary case and DEC-012 pressure test.

**Fixed input**

- P에 named severable scopes `S-early`와 `S-late`가 있다.
- complete criterion C-6은 두 scope를 separate recognition할 수 있다고 명시한다.
- C-6은 각 scope의 own requirements와 unrecognized remainder 기록을 요구한다.
- closed snapshot에서 S-early는 own requirements를 모두 충족하고 S-late는 mandatory coverage가 부족하다.

**Injected semantic assumptions**

- S-early와 S-late의 boundary와 severability는 fixture가 명시한다.
- S-early의 EvidenceUse는 S-late를 말하지 않는다.
- downstream legal effect는 주입하지 않는다.

**Processing boundary**

- recognized scope를 exact named scope로 기록한다.
- S-late gap과 이유를 같은 trace에 남긴다.
- 60%, 0.5, 절반 인정 같은 numeric representation을 만들지 않는다.

**Expected result**

- `CourtFactFinding.status = recognized_limited`.
- `recognized_scope = S-early`.
- S-late는 unrecognized scope와 reason으로 남는다.

**Actual observed manual result**

- C-6은 S-early를 severable recognized scope로 전이시켰다.
- S-late의 missing mandatory coverage가 trace에 보존됐다.
- legal effect, 감액, remedy는 생성되지 않았다.

**Verdict: PASS** *(explicit semantic fixture; not a legal rule)*

**Remains unverified:** 콘텐츠별 severability authoring, 실제 partial legal effect, UI 표현, 자동 scope decomposition. TEST-010 8개 core에서 이 생성 조건이 직접 실행되지는 않았다.

### Case 7 — Unresolved conflict

**DEC-012 basis:** R6, R8, R9, Core invariant Conflict preservation.

**Fixed input**

- P의 mandatory scopes가 support contribution E1/E2로 coverage된다.
- material contradicting contribution E3가 같은 target scope에 연결된다.
- E1/E2/E3 모두 allowed이고 양측 EvidenceUse가 snapshot에 포함된다.
- C-7은 material conflict가 있을 때 disposition rule을 요구하지만 conflict resolution rule 자체는 제공하지 않는다.

**Injected semantic assumptions**

- E1/E2의 credibility와 E3의 credibility 상태는 각자 주입한다.
- conflict boundary와 materiality는 fixture가 명시한다.
- evidence count, hidden weight, majority rule은 주입하지 않는다.

**Processing boundary**

- supporting and contradicting uses를 같은 trace에 남긴다.
- E3를 삭제하거나 E1/E2 개수와 상쇄하지 않는다.
- rule 부재는 conflict를 당사자 failure 또는 opposite fact로 바꾸지 않는다.

**Expected result**

- `undetermined` with `conflict_resolution_rule_missing`.
- 양측 evidence와 unresolved scope가 보존된다.

**Actual observed manual result**

- E1/E2/E3와 conflict edge가 모두 trace에 남았다.
- C-7이 disposition을 닫을 수 없어서 `undetermined`로 중단했다.
- 어느 쪽도 삭제하지 않았고, evidence-count majority나 hidden weighting을 사용하지 않았다.

**Verdict: PASS**

**Remains unverified:** conflict classification generation, materiality inference, resolution standards, criterion-specific handling of a resolved conflict.

### Case 8 — Judge interpretation hard boundary

**DEC-012 basis:** R11, R12, Core invariant Judge boundedness; DEC-013 guardrail.

**JudgeProfile generation is out of scope.** 이 case는 explicit injected `JudgeInterpretationInput` fixtures JI-A와 JI-B만 사용한다. `JudgeProfile → JudgeInterpretationInput` derivation은 설계·검증하지 않으며 DEC-LITIGATION-013 TBD다.

#### Part A — genuine ambiguity

**Fixed input**

- 동일 Case/Stage, P/S1, C-8, snapshot, EvidenceUse, credibility, lineage와 command sequence.
- C-8은 하나의 실제 record/criterion ambiguity choice point `CP-8`을 명시한다.

**Injected semantic assumptions**

- JI-A: CP-8에서 permitted option `accept_link_for_scope`를 선택.
- JI-B: CP-8에서 permitted option `require_more_direct_link`를 선택.
- 두 input은 같은 CP-8에만 영향을 주며 evidence·requirement를 생성하거나 삭제하지 않는다.

**Processing boundary**

- 두 trace는 동일 CP-8과 각 permitted option을 기록한다.
- 결과 차이는 C-8이 선언한 ambiguity 범위 안에서만 허용된다.
- personality score, profile trait, +/- modifier를 추출하지 않는다.

**Expected result**

- C-8의 다른 requirements가 충족된 fixture라면 JI-A는 `recognized`, JI-B는 `not_established_on_record`가 될 수 있다.
- 두 trace는 같은 choice point, 사용한 option, 영향을 받은 scope를 표시해야 한다.

#### Part B — clearly insufficient record

**Fixed input**

- 동일 C-8과 두 explicit JI fixtures를 사용하되, mandatory scope S2에 supporting EvidenceUse가 전혀 없다.
- C-8은 S2의 부재를 interpretation choice point로 열지 않는다.

**Expected result**

- JI-A와 JI-B 모두 `not_established_on_record`.
- JudgeInterpretationInput은 evidence를 만들거나 requirement를 면제하거나 S2를 공급할 수 없다.

**Actual observed manual result**

- Part A에서 차이는 CP-8 option에 한정되어 trace에 남았다.
- Part B에서 두 input은 S2의 hard missing coverage를 바꾸지 못했고 두 결과가 모두 `not_established_on_record`였다.
- 어떤 JudgeProfile도 생성·추론하지 않았고 input을 free outcome selector로 사용하지 않았다.

**Guardrail result:** choice point는 genuine record/criterion ambiguity에 대응해야 하며 disguised outcome switch로 authoring해서는 안 된다. 상세 authoring/validation mechanism은 DEC-LITIGATION-013 TBD다.

**Verdict: PASS**

**Remains unverified:** JudgeProfile design/derivation, ambiguity authoring validation, judge AI, actual judicial interpretation.

### Case 9 — Deterministic replay / no hidden score or RNG

**DEC-012 basis:** R12, R10, Core invariant No fact-finding RNG; TEST-010 Case 8 PASS.

**Fixed input**

- 동일 Case/Stage와 `CourtRecordSnapshot`.
- 동일 P/scope, criterion ID/version, allowed EvidenceUse.
- 동일 credibility, lineage, conflict inputs.
- 동일 explicit `JudgeInterpretationInput` if applicable.
- 동일 command ordering.

**Injected semantic assumptions**

- Replay R1/R2에는 numeric strength, hidden percentage, probability input을 넣지 않는다.
- seed가 존재하더라도 fact finding choice 값이 아닌 replay metadata로만 취급한다.
- execution ID/current timestamp는 semantic comparison에서 제외 가능한 metadata로 둔다.

**Processing boundary**

- snapshot membership, criterion binding, requirement outcomes, recognized scope, canonical status, semantic reasons를 비교한다.
- byte-identical serialization이나 실제 RNG call instrumentation을 주장하지 않는다.

**Expected result**

- 두 replay가 의미상 같은 status, recognized scope, requirement outcomes와 reasons를 낸다.
- 새 fact-finding RNG나 hidden score/probability input이 없다.

**Actual observed manual result**

- 두 replay의 semantic snapshot membership와 criterion/evidence references가 동일했다.
- requirement outcomes, status, recognized scope와 public explanation의 의미가 동일했다.
- final RNG, hidden numeric score, profile randomizer를 추가하지 않았다.

**Verdict: PASS**

**Remains unverified:** actual engine RNG instrumentation, byte-identical serialization, save/load, other systems’ central RNG reproducibility.

### Case 10 — Trace and downstream boundary

**DEC-012 basis:** R10, R13, DEC-011 F8/F9; TEST-010 trace boundary.

**Fixed input**

- 하나의 completed fact evaluation with `CourtFactFinding`.
- 동일 evaluation ID에 연결된 `SufficiencyEvaluation`, requirement outcomes, allowed EvidenceUse, RecordEntry, lineage/credibility/conflict references.
- public explanation projection과 internal trace를 별도 산출물로 둔다.

**Injected semantic assumptions**

- 모든 referenced RecordEntry는 snapshot의 allowed content scope 안에 있다.
- ActualStateRecord, hidden AP, internal WorkProduct, unsubmitted/unallowed material은 evaluation input이 아니다.
- DEC-008 claim/burden/legal-effect input은 이 case에 주입하지 않는다.

**Processing boundary**

```text
CourtFactFinding
  → SufficiencyEvaluation
    → CriterionRequirement outcomes
      → EvidenceUse / EvidenceContribution
        → RecordEntry / allowed content
          → lineage / credibility / conflict references
```

역추적은 실제 trace를 따라야 하며, explanation은 disclosure-filtered projection이어야 한다. finding이 직접 claim win/loss, burden, damages, remedy, final adjudication을 생성하지 않는다.

**Expected result**

- 위 chain이 양방향 audit reference로 확인된다.
- ActualStateRecord/AP/비공개·미허용 자료 누출이 없다.
- DEC-012 output은 fact finding에 머물고 DEC-008 downstream 단계로만 전달된다.

**Actual observed manual result**

- finding에서 criterion, requirement outcomes, EvidenceUse, RecordEntry/allowed content, lineage/credibility/conflict까지 역추적했다.
- public explanation에는 hidden truth/AP/unallowed material이 나타나지 않았다.
- claim result, burden, damages, remedy, final adjudication은 생성되지 않았다.

**Verdict: PASS**

**Remains unverified:** actual access control, explanation UI, downstream DEC-008 implementation, final adjudication engine, appellate/remand effects.

## 4. Cross-case invariant summary

| invariant | 확인 case | manual result |
|---|---:|---|
| criterion missing은 `undetermined`이며 default rule을 만들지 않음 | 1 | PASS |
| criterion 존재 + closed record의 mandatory gap은 `not_established_on_record` | 1, 2 | PASS |
| named scopes와 mandatory coverage는 숫자 완료율이 아님 | 2, 6 | PASS |
| same-lineage copies는 presentation은 늘려도 corroboration을 늘리지 않음 | 3 | PASS — automatic identity 미검증 |
| independent lineage와 same lineage가 구별됨 | 4 | PASS — injected distinction만 |
| relevance, credibility, sufficiency가 별도임 | 5 | PASS — combination effect 미검증 |
| partial support는 fractional recognition이 아님 | 5, 6 | PASS |
| `recognized_limited`에는 exact named severable scope가 필요함 | 6 | PASS — semantic fixture |
| conflict 양측과 unresolved 범위가 보존됨 | 7 | PASS |
| missing conflict rule은 `undetermined`이며 majority vote가 아님 | 7 | PASS |
| JudgeInterpretationInput은 genuine ambiguity에만 제한됨 | 8 | PASS |
| hard missing scope는 judge input으로 바뀌지 않음 | 8 | PASS |
| 동일 semantic input replay는 의미상 동일함 | 9 | PASS |
| hidden score/probability/fact-finding RNG가 없음 | 2, 7, 8, 9 | PASS |
| trace와 public explanation, fact finding과 final adjudication이 분리됨 | 10 | PASS |

## 5. Contradictions with DEC-012

**None found.**

TEST-010의 6 PASS / 2 PARTIAL 결과와 DEC-012는 모순되지 않는다.

- TEST-010 Case 4 PARTIAL은 duplicate non-strengthening boundary를 확인했지만 automatic lineage identity와 actual corroboration effect를 검증하지 않았다. Case 3은 그 한계를 그대로 보존한다.
- TEST-010 Case 5 PARTIAL은 credibility/sufficiency separation을 확인했지만 evidence combination을 닫지 않았다. Case 5는 disputed/partial 결과를 그 한계에 맞게 남긴다.
- TEST-010이 core에서 직접 실행하지 않은 partial recognition과 judge boundary는 Case 6·8에서 explicit semantic fixtures로 계획/수동 대조했으며, 이것을 실제 엔진 또는 실제 법률 검증으로 확대하지 않는다.

Accepted DEC-012 결정을 재작성하거나 조용히 수리한 부분은 없다. DEC-012의 R1~R13 Accepted/Core Accepted 경계와 명시적 TBD를 이 테스트가 대체하지 않는다.

## 6. Remaining TBDs exposed by testing

이 테스트에서 새 규칙으로 채우지 않은 항목은 다음과 같다.

1. 실제 사건 유형별 `RecognitionCriterion` content, authority, proof standard와 version lifecycle.
2. criterion applicability/validation과 mandatory/alternative/conditional/severable composition의 canonical authoring.
3. proposition scope granularity, overlap, normalization과 자연어 scope extraction.
4. exact source-lineage/contribution identity algorithm과 independent corroboration 판별.
5. evidence credibility assessment 생성, disputed credibility resolution과 evidence combination rule.
6. conflict classification generation, materiality inference, conflict resolution/disposition.
7. partial recognition의 콘텐츠별 severability와 downstream legal effect.
8. procedure-open/closed evaluation 및 재평가 trigger.
9. `JudgeProfile` 내용, JudgeProfile-to-JudgeInterpretationInput derivation, genuine-ambiguity authoring/validation mechanism — DEC-LITIGATION-013 TBD.
10. semantic digest, byte determinism, persistence와 save/load correctness.
11. disclosure tiers, player explanation wording, UI와 공개 시점.
12. DEC-008 burden/legal-effect/final adjudication, damages/remedy, appellate/remand effects.
13. automatic engine, NLP, admissibility generation, judge AI, performance와 Godot implementation.

Case 3·5의 PASS는 위 TBD를 해결했다는 뜻이 아니다. Case 6·8의 PASS도 explicit semantic inputs가 제시된 경계에서만의 수동 검증이다.

## 7. Final summary

| verdict | count | meaning |
|---|---:|---|
| PASS | 10 | requested structural boundary held under explicit manual semantic input |
| PARTIAL | 0 | no case required a partial verdict at the structural boundary level |
| FAIL | 0 | no contradiction or boundary violation observed |

`TEST-011`은 DEC-012의 accepted structural model과 내부적으로 coherent하다. TEST-010의 PARTIAL design gaps는 계속 TBD로 남아 있으며, 이를 이유로 DEC-012 Accepted 결정을 reopen할 필요는 없다.

이 결과는 manual / fixture-level verification이다. actual Korean evidence law, real proof threshold, automatic lineage/NLP/admissibility/judge/legal/final-adjudication engine, appellate/remand effect, Godot, save/load, UI 또는 performance의 검증 결과가 아니다.

## 8. Decision history

| version | status | 내용 |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-012 v0.3 Accepted의 R1~R13 경계를 대상으로 exactly 10 core cases를 명시하고, criterion/coverage/lineage/corroboration/credibility/relevance/sufficiency/partial/conflict/judge boundary/determinism/trace를 explicit semantic input으로 수동 검증. 10 PASS / 0 PARTIAL / 0 FAIL은 structural boundary trace 결과이며 자동 엔진·실제 법률 검증이 아님 |
