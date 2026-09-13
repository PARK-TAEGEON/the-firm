# THE FIRM — 사실인정 기준과 증거 충분성의 최소 구조

문서 ID: DEC-LITIGATION-012  
버전: v0.3 — R1~R13 final acceptance  
상태: **Accepted / 상세 기준·알고리즘·구현 미정**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
상위 기준: [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) v0.2, [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) v0.2  
시스템 기준: [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) v0.2  
직접 결정 기준: [DEC-LITIGATION-007_JUDGE_ACCEPTANCE.md](DEC-LITIGATION-007_JUDGE_ACCEPTANCE.md), [DEC-LITIGATION-008_FINAL_ADJUDICATION.md](DEC-LITIGATION-008_FINAL_ADJUDICATION.md), [DEC-LITIGATION-009_PROCEDURAL_FLOW.md](DEC-LITIGATION-009_PROCEDURAL_FLOW.md), [DEC-LITIGATION-010_APPEAL_AND_COURT_LEVELS.md](DEC-LITIGATION-010_APPEAL_AND_COURT_LEVELS.md), [DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md](DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md) — 각 repository v0.2 Accepted 범위  
검증 근거: [TEST-010_MINIMUM_FACT_RECOGNITION.md](TEST-010_MINIMUM_FACT_RECOGNITION.md) v0.2 — manual / fixture-level verification, 8 core cases, **6 PASS / 2 PARTIAL**. 이 결과는 경계 불변식의 수동 trace이며 automatic fact-recognition engine, 실제 법률상 충분성 또는 구현 완료의 검증이 아니다.

## 1. 목적 / 경계

이 문서는 다음 질문에 답하는 최소 의미 구조를 제안한다.

> 법원이 하나의 `FactProposition`을 평가할 때 무엇이 충족되어야 하며, 여러 `EvidenceUse`가 그 명제를 어떻게 함께 지지하고, 모순시키고, 한정하거나, 끝내 성립시키지 못하는가?

DEC-011은 actual truth와 court finding, `EvidenceItem`과 `EvidenceUse`, credibility와 sufficiency, 동일 출처 반복과 독립 corroboration, 내부 trace와 공개 explanation을 분리했다. DEC-012는 그 경계 안에서 `RecognitionCriterionRef`가 가리키는 최소 기준 내용과 proposition-level sufficiency evaluation의 결합 방식을 제안한다.

핵심 추천은 **명시적 criterion + 명시적 proposition scope + 범위별 evidence contribution + lineage-aware support/conflict topology + 정성적 requirement satisfaction**을 결합한 hybrid structural model이다. 이 모델에는 evidence strength point, 확률, 개수 임계값, 변호사·로펌·판사 보너스, 마지막 RNG가 없다.

이 문서는 다음을 하지 않는다.

- 실제 대한민국 법률의 증명도, 증거법, 추정, 자백, 무응답 효과를 선언하지 않는다.
- 어떤 자료가 절차적으로 허용되는지 판정하지 않는다.
- 자연어 증거에서 명제·범위·충돌·lineage를 자동 추론하는 엔진을 설계하지 않는다.
- `JudgeProfile` 전체, 최종 청구 판단, 손해액, 항소·환송 법적 효과를 설계하지 않는다.
- Godot class, JSON, save schema, API 또는 구현 알고리즘을 확정하지 않는다.

이 문서의 **Accepted**와 **Core Accepted** 표시는 R1~R13의 채택 결정을 뜻한다. 명시된 **TBD**와 범위 밖 항목은 이번 채택으로 확정되지 않는다.

## 2. DEC-007~011에서 상속하는 Accepted 제약

| 출처 | 상속하는 제약 | DEC-012의 영향 |
|---|---|---|
| DEC-007 J0~J3 | 제출 입력, 내용, credibility, 사실 충분성, 법률 적용은 분리한다 | criterion은 사실 충분성까지만 다루며 법적 효과를 산출하지 않는다 |
| DEC-007 J1·J7 | 실제 제출·전달되고 사용할 수 있는 자료만 판단 입력이다 | 내부 AP·미제출 WorkProduct·ActualStateRecord는 입력 금지 |
| DEC-007 J8 | 판사 차이는 제한적 해석 차이일 수 있으나 숨은 승률 보너스가 아니다 | 미래 judge interpretation은 criterion이 연 명시적 choice point만 사용한다 |
| DEC-007 J9 | 실제 사용한 입력·범위·이유를 기록한다 | 사후 설명 생성이 아니라 evaluation trace를 보존한다 |
| DEC-008 A1~A4 | 사실 부족과 기준 부재를 구별하고, 사실인정 뒤 별도 burden/legal-effect 연결로 청구를 닫는다 | `not_established_on_record`를 곧바로 패소로 변환하지 않는다 |
| DEC-008 A6~A7 | 공통 사실은 여러 청구가 참조할 수 있고 실제 원인 연결을 보존한다 | evidence는 여러 명제에 사용돼도 소비되거나 복제 강화되지 않는다 |
| DEC-009 P4·P6 | 기록은 누적되고 관련 범위만 재검토한다. 종결과 judgment-ready는 다르다 | evaluation은 stage/snapshot에 고정되고 과거 결과를 덮어쓰지 않는다 |
| DEC-010 A4·A6·A11 | 보존과 사용 허용을 구별하고 허용된 review/remand 범위만 재검토한다 | criterion과 evaluation도 stage identity 및 lineage를 보존한다 |
| DEC-011 F1·F2 | actual truth와 finding을 분리하고 canonical fact status는 네 개뿐이다 | 출력은 `recognized`, `recognized_limited`, `not_established_on_record`, `undetermined`만 사용한다 |
| DEC-011 F3~F5 | lineage 중복 방지, credibility/sufficiency 분리, conflict 양측 보존 | 개수 합산 대신 topology와 requirement별 이유를 사용한다 |
| DEC-011 F6~F10 | allowed snapshot만 사용하고 trace/public explanation을 분리하며 기준 부재에서 중단한다 | criterion missing은 substantive result가 아니라 `undetermined` + 명시적 blocker다 |

### 상태 표식

| 표식 | 이 문서에서의 의미 |
|---|---|
| **Accepted** | 이번 문서에서 채택한 구체 결정 |
| **Core Accepted** | 구현 형태가 달라도 지켜야 할 채택된 핵심 의미 경계 |
| **TBD** | 기준 부재를 콘텐츠 실패나 당사자 입증 실패로 바꾸지 않고 후속 결정이 필요한 항목 |
| **Forbidden** | 기존 Accepted 결정 또는 본 설계의 핵심 목적과 양립하지 않는 구조 |

### 2.1 TEST-010 actual results 재검증

현재 worktree의 TEST-010 v0.2를 직접 읽고 DEC-012의 R1~R13과 대조했다. TEST-010은 DEC-011의 8개 core fixture를 수동 trace로 실행해 6 PASS / 2 PARTIAL을 보고한다. 새 규칙을 생성한 테스트가 아니므로, PASS는 경계 보존을 지지하지만 DEC-012의 새 criterion composition이나 evidence combination 모델을 Accepted 또는 구현 완료로 승격하지 않는다.

| TEST-010 검증점 | 실제 결과 | DEC-012 재평가 |
|---|---|---|
| truth non-interference | PASS | R10·R12의 allowed-input/trace 경계와 일치. ActualStateRecord 비간섭 유지 |
| not-established vs contrary recognized | PASS | R9와 일치. 반대명제는 자기 record/criterion으로만 평가 |
| criterion missing vs insufficient record | PASS | R1·R9와 일치. 전자는 `undetermined/TBD`, 후자는 criterion 적용 뒤 `not_established_on_record` |
| same-source duplicate/copy attack | PARTIAL | R5의 duplicate non-strengthening은 지지. exact lineage identity와 corroboration의 실제 충분성 효과는 계속 TBD |
| credibility vs sufficiency | PARTIAL | R4의 분리는 지지. E3 같은 독립 full-scope support의 결합 결과는 TEST-010이 `undetermined`로 남겼으므로 R6 hybrid의 채택은 구조적 결정이며 실제 criterion content·결합 결과 검증은 아님 |
| submitted/received/allowed boundary | PASS | R3·R10의 allowed snapshot 소비와 일치. admissibility 생성은 범위 밖 |
| prior-stage preservation/partial review | PASS | R1 versioning·R10 trace·R13 downstream lineage와 일치. 실제 appellate effect는 계속 TBD |
| deterministic replay/no new fact-finding RNG | PASS | R12의 semantic determinism 방향과 일치. 실제 엔진 RNG 감시와 byte serialization은 미검증 |

추가로 TEST-010은 네 canonical 상태의 의미를 명시했지만, 8개 core case에서 `recognized_limited`의 생성 조건을 독립 실행하지 않았다. DEC-011의 범위 한정 후보 case 19도 TEST-010 v0.2의 실행 결과가 아니다. R7의 구조적 경계는 **Accepted**지만 실제 partial-recognition criterion은 TEST-011 검증 대상이다.

**재검증 결론:** TEST-010과의 충돌은 발견되지 않았다. R1~R13은 이번 v0.3에서 아래 추천안대로 Accepted/Core Accepted로 채택한다. 다만 R5의 exact lineage identity, R6의 실제 criterion content와 evidence-combination 결과, R7의 콘텐츠별 partial-recognition criterion은 TEST-010으로 검증 완료됐다고 표현해서는 안 된다.

## 3. R1 — RecognitionCriterion ownership와 identity

### 구조 대안

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. 명제 안에 criterion 전체 내장 | 각 `FactProposition`이 자기 기준 내용을 복제 보유 | 읽기 쉽고 단일 객체로 완결 | 같은 기준의 복제·불일치, stage 변경 추적 곤란 | 보조 authoring에는 가능하나 핵심 모델로 미추천 |
| B. stage에 하나의 전역 criterion | 모든 명제가 한 기준을 공유 | 단순 | 사실별 필요한 scope·corroboration·충돌 처리 차이를 표현 못함 | **Forbidden** — 하나의 global threshold로 붕괴 |
| C. 명제 평가가 versioned `RecognitionCriterionRef`를 참조하고 여러 명제가 정의를 공유 | identity와 재사용을 분리하고 사실별 binding을 명시 | 콘텐츠 authoring과 재현에 유리. 공유 기준의 변경도 추적 가능 | ref만 있고 binding scope가 모호하면 잘못된 기준 적용 | **Accepted** |

### 추천 결정

**R1-C — Accepted.** 각 proposition evaluation은 정확히 하나의 적용 가능한 `RecognitionCriterionRef`를 가져야 한다. 여러 `FactProposition`은 같은 criterion definition을 공유할 수 있지만, 각 평가에는 `fact_id + evaluated_scope + criterion_ref + stage applicability` binding이 명시돼야 한다.

`RecognitionCriterion`은 적어도 다음 의미를 제공한다.

- stable criterion identity와 immutable version identity.
- authority/content source reference. 이는 실제 한국법을 이 문서가 선언한다는 뜻이 아니다.
- 적용 가능한 Case 유형·Stage·proposition/scope 범위.
- 평가해야 할 `CriterionRequirement`와 각 requirement가 겨냥하는 `PropositionScope`.
- required, alternative, conditional, severable scope 관계처럼 criterion 만족을 구성하는 명시적 구조.
- relevance, credibility, lineage/corroboration, conflict가 해당 requirement에 어떻게 사용될 수 있는지에 대한 content-defined rule reference.
- judge interpretation이 허용되는 명시적 choice point와 허용 범위. 없으면 해석 입력을 사용하지 않는다.
- criterion 자체가 완전한지와 어떤 외부 rule reference가 필수인지.

Criterion의 stage identity는 “최신 criterion을 과거 판단에 재적용”하지 않도록 보존한다. 최소 재현 identity는 `criterion_id + immutable version + applicable stage/version context`다. exact identifier format은 **TBD**다. 기존 criterion을 변경해야 하면 새 version을 만들고 과거 evaluation은 기존 ref를 유지하는 방향이다.

Criterion이 필요한데 없거나, ref가 깨졌거나, 적용 stage/scope가 맞지 않거나, 필수 rule reference가 해석 불가능하면:

- `recognized` 또는 `not_established_on_record`를 추측하지 않는다.
- evaluation attempt를 `undetermined`로 기록하고 `criterion_missing`, `criterion_not_applicable`, `criterion_incomplete` 같은 내부 reason을 구별한다.
- `[상세 사실인정 기준 미정]`으로 중단한다.
- 이 상태는 당사자의 evidence failure가 아니다.

“모든 사건에 적용하는 기본 상식 threshold”를 숨겨 두고 missing criterion을 보완하는 것은 **Forbidden**이다.

## 4. R2 — Proposition decomposition

### 구조 대안

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. 명제 하나 = 거대한 boolean 문장 | 자유로운 서술 | authoring이 빠름 | 부분 근거·공백·한정 인정 위치를 설명할 수 없음 | 핵심 모델로 **Forbidden** |
| B. 모든 명제를 원자 명제로 강제 분해 | 각 작은 문장을 별도 `FactProposition`으로 만듦 | 개별 판단은 명확 | 관계 폭증, 한 명제 내부의 범위 한정을 잃고 체크리스트화 | 일부 콘텐츠에 유용하나 단독 모델로 미추천 |
| C. 명제는 명시 문장을 유지하되 named `PropositionScope`와 criterion-bound requirement를 가짐 | 큰 의미와 세부 범위를 함께 보존 | 부분 support·conflict·recognition을 추적 가능 | 범위를 과분할하면 정답 칸 채우기 UI가 될 수 있음 | **Core Accepted** |

### 추천 결정

**R2-C — Core Accepted.** `FactProposition`은 하나 이상의 명시적으로 이름 붙은 `PropositionScope`를 가질 수 있다. criterion은 그중 어떤 scope가 필수인지, 대안인지, 조건부인지, 서로 분리 가능한지를 선언한다.

예시 `P = “유효한 계약이 존재했다”`에 `party_identity`, `manifestation`, `relevant_terms`, `timing` 같은 semantic scope를 둘 수 있다. 이 목록은 구조 예시일 뿐 실제 계약법 요건이 아니다.

범위 설계 원칙은 다음과 같다.

- scope는 “25% 완료”가 아니라 이름과 의미 경계를 가진다.
- evidence contribution과 credibility는 정확한 scope 또는 scope 일부에 연결된다.
- criterion requirement는 하나 또는 여러 scope를 참조할 수 있다.
- scope의 support가 일부뿐이면 supported content boundary와 missing boundary를 명시한다.
- 한 scope의 충족이 다른 scope를 자동 충족하지 않는다.
- 같은 의미를 지나치게 쪼개 evidence 개수나 작업량을 늘리는 것은 금지한다.
- 완전한 원자 분해가 불가능한 평가적 명제는 criterion이 허용하는 qualitative choice point를 가질 수 있으나, 그 이유와 허용 대안을 명시해야 한다.

Scope granularity authoring guideline과 reusable taxonomy는 **TBD**다. 자연어 명제에서 scope를 자동 생성하는 NLP는 **TBD**이며 본 DEC가 요구하지 않는다.

## 5. R3 — EvidenceUse contribution

### 구조 대안

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. EvidenceItem에 전역 `supports=true/false` | 단순 | 같은 자료의 서로 다른 문구·명제·역할을 혼합 | **Forbidden** |
| B. EvidenceUse마다 numeric strength와 부호 | 합산 쉬움 | credibility·relevance·sufficiency가 한 수치로 붕괴 | **Forbidden** |
| C. EvidenceItem 원본과 proposition/scope별 정성적 EvidenceUse를 분리 | 다중 사용·범위·역할·lineage 보존 | authoring과 validation 필요 | **Accepted** |

### 추천 결정

**R3-C — Accepted.** 관계는 다음처럼 유지한다.

```text
EvidenceItem
  → allowed RecordEntry in CourtRecordSnapshot
    → EvidenceUse for one FactProposition and named scope
      → EvidenceContribution role and content boundary
```

`EvidenceItem`은 원자료와 계보를 보존한다. `EvidenceUse`는 그 자료의 허용된 어느 내용이 어느 `FactProposition`의 어느 scope에 무슨 역할로 사용되는지를 기록한다. `EvidenceContribution`은 별도 객체여도 `EvidenceUse` 안의 의미 정보여도 되며 구현 구조는 **TBD**다.

최소 contribution role vocabulary 후보는 다음과 같다.

| 역할 | 의미 | 자동 효과가 아닌 것 |
|---|---|---|
| `supports` | 명제/scope의 내용을 긍정적으로 뒷받침 | requirement 충족 또는 proposition 인정 |
| `contradicts` | 같은 scope에 양립하기 어려운 내용을 제시 | 반대명제 자동 인정 또는 support 삭제 |
| `undermines_basis` | 다른 contribution의 출처·전제·연결을 흔듦 | 독립적인 반대 사실 입증 |
| `limits_scope` | support가 성립하더라도 적용 가능한 기간·대상·양을 한정 | 자동 `recognized_limited` |
| `contextualizes` | 의미 해석에 필요한 맥락을 제공 | 독자적인 fact support |
| `irrelevant_for_scope` | 검토했으나 지정 proposition/scope에 연결되지 않음 | credibility가 낮다는 뜻 |

이 vocabulary는 **Accepted**인 최소 semantic distinction이다. exact enum, 복합 역할 허용, role 이름은 **TBD**다. 하나의 허용 content scope가 여러 역할을 가지면 각 역할의 target과 이유를 분리한다.

모든 contribution은 최소한 `evidence_use_id`, `record_entry_id`, `fact_id`, `target_scope`, `allowed_content_scope`, `role`, `relevance_reason_ref`, `lineage reference`로 역추적 가능해야 한다. relevance가 판정되지 않았거나 role을 정할 규칙이 없으면 자동 support로 넣지 않는다.

## 6. R4 — Credibility / relevance / sufficiency 분리

**R4 — Core Accepted.** 세 차원은 서로 다른 대상과 질문을 가진다.

| 차원 | 붙는 대상 | 질문 | 다른 차원으로 자동 전환 금지 |
|---|---|---|---|
| relevance | EvidenceUse의 content scope ↔ proposition scope 관계 | 이 내용이 이 명제 범위 판단에 실제로 연결되는가? | relevant이므로 credible 또는 sufficient |
| credibility | evidence content scope와 stage별 평가 | 그 내용에 이 범위에서 의존할 수 있는가? 어떤 다툼·한계가 있는가? | credible이므로 명제 전체 sufficient |
| sufficiency | proposition + criterion + snapshot 전체 | 허용된 relevant contribution들을 함께 보아 criterion requirements가 충족되는가? | evidence 개수·평균 credibility로 자동 결정 |

다음은 모두 명시적으로 유지한다.

- 하나의 credible item도 필요한 scope를 말하지 않으면 insufficient할 수 있다.
- 여러 credible item도 같은 공백만 반복하거나 같은 lineage이면 insufficient할 수 있다.
- relevant하지만 credibility-contested일 수 있다.
- credible하지만 proposition에 irrelevant할 수 있다.
- 하나의 item은 서로 다른 content scope를 통해 여러 propositions를 지원할 수 있고 소비되지 않는다.
- 같은 item의 다중 사용은 다른 proposition에 strength를 복제하지 않는다.
- credibility 상태는 DEC-011의 정성 상태와 reason을 참조하며 새 숫자로 변환하지 않는다.

변호사의 전문성·준비·framing은 더 정확한 proposition, 더 적절한 allowed submission, 더 명확한 scope link, 실제 반박과 설명을 만들어 간접적으로 기록을 바꿀 수 있다. evaluator에 lawyer ability를 직접 더하는 것은 **Forbidden**이다.

## 7. R5 — Lineage / corroboration

### 구조 대안

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. EvidenceItem ID가 다르면 독립 | 쉬움 | 사본·발췌·재인용 farming | **Forbidden** |
| B. 동일 사건에서 같은 문서 유형이면 모두 같은 근원 | 중복 차단 | 실제 독립 출처를 잘못 합침 | 미추천 |
| C. source lineage와 derived-from graph를 보존하고 contribution-level independence를 명시 | 복제와 독립 corroboration 구별 | exact identity 판별 규칙 필요 | **Core Accepted** |

### 추천 결정

**R5-C — Core Accepted.** sufficiency evaluator가 필요한 최소 lineage 정보는 다음과 같다.

- stable `source_lineage_id` 또는 그에 해당하는 근원 identity reference.
- `derived_from` 관계와 변환 종류: copy, excerpt, translation, requote, summary 등 semantic provenance.
- 해당 proposition/scope에서 같은 실질 content contribution을 묶는 `lineage_contribution_key` 또는 동등한 grouping.
- `same_lineage / independent_lineage / independence_unknown`의 명시된 상태와 그 판단 source.
- 독립 분석이 원자료 반복인지 별도 관찰·근거인지 구별하는 content-provided reason.

네 개의 EvidenceItem이 있어도 같은 lineage와 같은 실질 contribution이면 하나의 독립 근거군이다. 그렇다고 네 presentation을 기록에서 합치거나 삭제하지 않는다. presentation trace는 네 개를 보존하되 corroboration topology는 하나의 source group으로 본다.

두 자료가 independent lineage라는 사실만으로 proposition이 충분해지지는 않는다. criterion이 독립 corroboration을 요구하거나 허용할 때 그 구조적 조건을 충족할 후보가 될 뿐이며, 각 자료의 relevance·credibility·scope coverage는 별도다.

Exact automatic lineage identity algorithm, hearsay chain, 전문가의 독립 분석 여부, 복합 출처 문서의 분할은 **TBD**다. independence가 중요하고 `independence_unknown`인데 이를 처리할 criterion/rule이 없으면 `undetermined` + `[상세 사실인정 기준 미정]`으로 중단한다. unknown을 자동 independent로 세는 것은 **Forbidden**이다.

**TEST-010 재검증:** Case 4는 fixture가 같은 lineage라고 명시한 사본 네 개를 하나의 source contribution으로 취급해 copy-count 강화 금지를 확인했다. 그러나 결과는 PARTIAL이며 automatic lineage identity와 proposition-level corroboration effect를 검증하지 않았다. 따라서 본 절은 그 공백을 새 규칙으로 소급해 채우지 않는다.

## 8. R6 — Evidence combination / proposition sufficiency

### 구조 대안

| 대안 | 결합 방식 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. strength 합산과 threshold | 빠르고 조정 쉬움 | 숫자가 법적 이유를 대체하고 중복·irrelevance·명세 공백을 상쇄 | **Forbidden** |
| B. required-element coverage만 확인 | 공백이 보임 | 모든 support를 동등하게 취급하고 conflict·credibility·lineage를 못 다룸 | 단독 모델로 부족 |
| C. support/conflict graph만 비교 | 양측 record 보존 | criterion의 필수 범위와 종결 규칙이 약함 | 단독 모델로 부족 |
| D. qualitative overall state를 저자가 직접 지정 | 유연 | 결과 먼저 고르고 이유를 사후 작성할 위험 | 주입 테스트 외 핵심 모델로 미추천 |
| E. criterion-bound requirement coverage + contribution topology + 정성 resolution | scope, lineage, credibility, conflict, rule gap을 함께 추적 | authoring·validation 부담 | **Core Accepted** |

### 추천 결합 모델

**R6-E — Core Accepted.** 평가 순서는 계산 공식이 아니라 dependency order다.

```text
1. FactProposition + evaluated scope 확인
2. 적용 가능한 versioned RecognitionCriterion 확인
3. criterion requirements와 scope binding 전개
4. CourtRecordSnapshot에서 allowed EvidenceUse만 선택
5. EvidenceUse별 relevance, role, credibility, lineage group 확인
6. requirement별 support / contradiction / limitation / gap topology 구성
7. criterion이 명시한 satisfaction rule 및 허용된 interpretation choice 적용
8. requirement outcomes와 전체/한정 scope resolution 기록
9. DEC-011 canonical CourtFactFinding 상태로 전이
```

`CriterionRequirement`의 내부 정성 outcome 후보는 다음과 같다. 이는 새로운 `CourtFactFinding` status가 아니다.

| requirement outcome | 의미 |
|---|---|
| `satisfied_for_scope` | criterion이 요구한 구조가 명시 범위에서 충족됨 |
| `partially_supported` | 일부 support는 있으나 requirement 전체 또는 허용된 severable scope의 충족 결론은 아직 아님 |
| `not_satisfied_on_record` | criterion은 완전하고 현재 closed snapshot의 record가 요구 구조를 충족하지 못함 |
| `unresolved_conflict` | 중요한 충돌이 남아 있고 현재 criterion에 따른 disposition이 완료되지 않음 |
| `rule_or_input_missing` | criterion 내용, lineage/credibility/conflict 처리 rule 같은 필수 설계 입력이 없음 |
| `not_applicable` | criterion 자체가 이 requirement를 해당 scope에서 명시적으로 비적용 처리 |

정확한 naming과 저장 구조는 **TBD**다. `partially_supported`를 0.4 같은 숫자로 변환하는 것은 **Forbidden**이다.

### proposition-level 판별

- **Clearly sufficient record:** criterion이 정한 모든 mandatory requirement가 평가 범위 전체에서 `satisfied_for_scope`이고, blocking conflict가 criterion에 따라 해소되었으며, 필요한 lineage/credibility 조건과 모든 condition/alternative 관계가 처리됐다. 결과 후보는 `recognized`다.
- **Clearly insufficient record:** 적용 criterion과 필요한 판단 rule은 완전하고 절차적으로 평가할 fixed snapshot이 있으며, 하나 이상의 mandatory requirement가 `not_satisfied_on_record`이고 criterion상 다른 허용 경로 또는 severable recognized scope가 없다. 결과 후보는 `not_established_on_record`다.
- **Incomplete / partial support:** support가 있으나 mandatory coverage가 빠졌다면 그 자체로 fractional recognition이 아니다. criterion이 named severable scope의 독립 인정을 허용하고 그 scope requirements가 충족될 때만 `recognized_limited`; 아니면 closed record에서는 `not_established_on_record`, 절차가 아직 열렸거나 rule이 없으면 `undetermined`다.
- **Unresolved contradiction:** criterion이 그 충돌을 어떻게 다룰지 명시하면 그 rule에 따라 outcome을 닫을 수 있다. criterion이 permissible interpretation choice를 열면 명시적 judge interpretation input을 사용할 수 있다. 둘 다 없고 충돌이 material하면 `undetermined`다.
- **Criterion missing/incomplete:** `undetermined`, blocker 기록, substantive sufficiency conclusion 금지.

Criterion은 “direct evidence 1개” 또는 “independent source 2개” 같은 content-defined 구조를 가질 수 있지만, 본 DEC는 이를 일반 규칙으로 채택하지 않는다. 특히 evidence 개수만으로 만족하는 criterion은 lineage, relevance, credibility, scope를 무시하면 invalid content로 검증 실패해야 한다.

**TEST-010 재검증:** Case 5는 credibility와 sufficiency의 분리만 확인하고, 독립 full-scope E3가 proposition을 최종 성립시키는 결합 기준은 없으므로 `undetermined`로 남겼다. 따라서 R6-E는 TEST-010에서 관찰된 규칙이 아니라 그 테스트가 명시적으로 남긴 design gap에 대해 이번 문서가 채택한 구조적 경계다. 실제 criterion content 없이 E3를 `recognized`로 승격하지 않는다.

## 9. R7 — Partial recognition

### 구조 대안

| 대안 | 처리 | 위험 | 판단 |
|---|---|---|---|
| A. 일부 support가 있으면 자동 `recognized_limited` | 결과를 쉽게 냄 | hidden fractional score와 동일 | **Forbidden** |
| B. 부분 인정 금지, 언제나 전체 인정/미인정 | 단순 | 기간·대상·수량의 실제 한정 판단 소실 | 미추천 |
| C. criterion이 허용한 named severable scope만 한정 인정 | 이유와 범위를 설명 가능 | authoring 시 scope severability 필요 | **Accepted** |

### 추천 결정

**R7-C — Accepted.** `recognized_limited`는 다음 조건을 모두 만족할 때만 적절하다.

1. recognized scope가 이름, 경계 또는 predicate로 명시된다.
2. 그 scope가 전체 proposition에서 분리 가능한 범위라고 criterion 또는 Accepted relation이 허용한다.
3. 그 scope에 적용되는 mandatory requirements가 모두 충족된다.
4. 인정되지 않은 나머지 범위와 이유가 trace에 남는다.
5. 한정 범위의 downstream legal effect는 DEC-008 또는 별도 content가 판단하며 본 evaluation이 만들지 않는다.

예를 들어 “기간 T1~T2에 한함”, “대상 X에 한함”, “문구 존재만 인정하며 가치 크기는 제외”처럼 named scope가 필요하다. “대략 60% 인정”은 **Forbidden**이다.

일부 element가 support되었더라도 proposition 전체 또는 severable sub-proposition을 독립적으로 말할 수 없다면 `recognized_limited`가 아니다. criterion과 절차가 완전하고 record가 닫혔다면 `not_established_on_record`; 추가 절차가 열렸거나 partial effect rule이 없으면 `undetermined`다.

**TEST-010 재검증:** TEST-010은 `recognized_limited`의 canonical 의미를 보존했지만 그 생성 조건을 core fixture에서 실행하지 않았다. R7-C의 named/severable/criterion-authorized 구조적 경계는 **Accepted**이며 TEST-011에서 최초로 직접 압력 테스트한다.

## 10. R8 — Conflicting evidence

### 구조 대안

| 대안 | 처리 | 실패 모드 | 판단 |
|---|---|---|---|
| A. support와 contradiction 점수를 상쇄 | 간단 | 같은 숫자가 다른 이유를 지움 | **Forbidden** |
| B. 더 credible한 한쪽만 남김 | 결론 명확 | losing evidence와 남은 conflict 삭제 | **Forbidden** |
| C. 양측 contribution과 conflict edge를 보존하고 criterion별 disposition 기록 | 원인·한계 추적 가능 | conflict rule이 없으면 결과를 닫지 못함 | **Core Accepted** |

### 추천 결정

**R8-C — Core Accepted.** supporting and contradicting `EvidenceUse`는 같은 evaluation trace에 공존한다. `EvidenceConflict`는 target scope, 양측 use IDs, 각 credibility state, lineage dependency, materiality, resolution state와 reason을 보존한다.

충돌 해결 결과도 losing evidence를 삭제하지 않는다. 가능한 처리 예시는 `resolved_for_scope`, `remains_nonblocking_under_criterion`, `remains_blocking`, `partially_resolved`이며 canonical enum은 **TBD**다.

Unresolved conflict의 canonical outcome은 고정 하나가 아니다.

- criterion이 “이 종류의 unresolved conflict는 requirement 미충족”이라고 명시하고 필요한 rule이 완전하면 `not_established_on_record`가 가능하다.
- criterion이 명시적 permissible interpretation을 허용하고 supplied judge interpretation이 한 해석을 선택하면, 선택 이유와 제한 범위 안에서 `recognized`, `recognized_limited`, 또는 `not_established_on_record`가 가능하다.
- criterion이 conflict disposition을 요구하지만 rule이 없으면 `undetermined`다.
- 충돌이 criterion상 해당 scope에 immaterial이라고 명시되면 다른 충족 판단을 막지 않을 수 있다.

어떤 evidence가 실제로 충돌하는지 자연어에서 자동 분류하는 NLP와 실제 conflict resolution standard는 **TBD**다. “반대 evidence가 하나라도 있으면 항상 미인정”과 “support가 더 많으면 인정”은 모두 **Forbidden**이다.

## 11. R9 — Canonical CourtFactFinding transition

**R9 — Accepted.**

내부 requirement outcome과 blocker는 설명용 중간 상태다. `CourtFactFinding.status`는 DEC-011의 네 상태만 사용한다.

| 구조적 평가 결과 | canonical status | 필수 reason distinction |
|---|---|---|
| 전체 evaluated scope의 criterion requirements 충족 | `recognized` | satisfied requirements, 사용 contribution, conflict disposition |
| 명시적·severable scope만 충족하고 criterion이 한정 인정을 허용 | `recognized_limited` | 정확한 `recognized_scope`, 나머지 gap/conflict |
| criterion과 rule이 완전하고 closed record가 mandatory requirement를 충족하지 못함 | `not_established_on_record` | 부족한 requirement/scope. 반대 사실 아님 |
| criterion missing/inapplicable/incomplete | `undetermined` | `criterion_missing` 등 + `[상세 사실인정 기준 미정]` |
| material conflict를 해결할 필수 rule이 없음 | `undetermined` | `conflict_resolution_rule_missing` |
| 절차 기회가 남아 evaluation을 닫지 못함 | `undetermined` | `procedure_open` 또는 기존 절차 reason |
| 필요한 lineage/credibility/relevance 판단 rule 또는 명시 입력이 없음 | `undetermined` | 해당 missing input reason |

`not_established_on_record`는 evidence가 “약해 보인다”는 인상으로 쓰지 않는다. criterion이 완전하고 current record와 그 criterion을 실제 비교해 requirement가 충족되지 않았을 때만 쓴다.

TEST-010 Case 3은 이 전이를 직접 지지한다. criterion이 없는 trace는 `undetermined/TBD`로 중단했고, criterion이 존재하면서 record가 그 요구 범위를 충족하지 못한 trace만 `not_established_on_record`로 기록했다. 이 수동 fixture 결과를 실제 criterion 내용이나 자동 판단 엔진의 검증으로 확대하지 않는다.

독립적인 contrary proposition은 자기 criterion과 evidence로 별도 평가한다. `P = not_established_on_record`가 `not-P = recognized`를 만들지 않는다. contrary recognition은 DEC-011 F2의 명시된 relation을 통해 설명에서만 도출한다.

## 12. R10 — Evaluation trace / explanation

### 구조 대안

| 대안 | 방식 | 실패 모드 | 판단 |
|---|---|---|---|
| A. status만 저장하고 이유를 나중에 생성 | 저장 단순 | 사후 합리화·정보 누출 | **Forbidden** |
| B. 모든 내부 데이터를 그대로 플레이어에게 표시 | 투명 | ActualStateRecord·AP·비공개 기록 누출 | **Forbidden** |
| C. 실제 evaluation trace를 보존하고 별도 disclosure-aware projection 생성 | 재현성과 안전한 설명 양립 | disclosure rule 필요 | **Core Accepted** |

**R10-C — Core Accepted.**

### 최소 내부 `SufficiencyEvaluationTrace`

1. Case, Stage, command/order identity, evaluation ID와 timestamp/cutoff reference.
2. 평가한 `FactProposition`, statement version, evaluated scope.
3. 사용한 `RecognitionCriterionRef`, immutable version, authority/content ref, stage binding.
4. 고려한 `PropositionScope`와 `CriterionRequirement`, 관계(required/alternative/conditional/severable).
5. 실제 allowed `EvidenceUse`, `RecordEntry`, content scope, contribution role, relevance reason.
6. source lineage, derived-from, contribution grouping, independence state와 사용 이유.
7. 실제 사용한 credibility assessment와 assessed scope; 사용하지 않은 assessment는 결과 이유로 가장하지 않음.
8. support/conflict/limitation topology, `EvidenceConflict` 양측, resolution 또는 unresolved reason.
9. requirement별 outcome, missing coverage, criterion choice point.
10. 사용했다면 explicit `JudgeInterpretationInput`, 허용 choice point, 선택과 이유; 사용하지 않았다면 없음.
11. canonical status, recognized scope, transition reason codes, blocker/TBD marker.
12. prior finding/review/remand lineage가 적용되는 경우 그 허용 범위.
13. deterministic semantic digest 또는 동등한 replay comparison reference. exact mechanism은 **TBD**.

### Player-facing explanation

공개 explanation은 내부 trace와 다른 산출물이며 disclosure policy를 적용한 projection이다. 최소 목표는 다음 질문에 답하는 것이다.

- 어떤 명제를 어떤 범위에서 판단했는가?
- 어떤 공개 가능한 기준·scope가 중요했는가?
- 어떤 허용 evidence가 어느 범위를 support, contradict, limit했는가?
- 같은 lineage의 반복이 왜 독립 corroboration이 아니었는가?
- 어떤 credibility/relevance 한계와 conflict/gap이 실제 결과에 영향을 줬는가?
- 왜 네 canonical status 중 이 상태가 나왔는가?

다음은 공개 explanation에 들어가면 안 된다.

- `ActualStateRecord` 또는 사후 truth.
- hidden AP, 내부 자기평가, 미제출 전략.
- 비공개 WorkProduct와 상대의 숨은 준비.
- hidden probability, evidence strength score, debug-only digest/IDs/reasoning detail.
- 허용되지 않은 전문·기록·상급심 자료.

공개 문구와 disclosure tier의 상세는 **TBD**다. 공개 제한 때문에 모든 내부 근거를 보이지 못하더라도 status를 다른 이유로 꾸미면 안 된다.

## 13. R11 — Judge interpretation boundary

### 압력 검토

Hard boundary와 soft interpretation layer의 분리는 **조건부로 workable**하다. 조건은 ambiguity가 사전에 criterion의 명시적 choice point로 드러나고, 선택 가능한 해석 범위와 금지 효과가 구조적으로 제한되는 것이다. “판사 성향을 입력했으니 결과가 다를 수 있다”만으로는 workable하지 않으며 숨은 modifier가 된다.

```text
Hard boundaries
  allowed record + proposition + criterion + explicit requirements/scopes
  + Accepted system/legal constraints
        ↓ only if criterion exposes a permissible ambiguity
Soft interpretation layer
  explicit, versioned JudgeInterpretationInput for that choice point
        ↓
requirement resolution → CourtFactFinding
```

### 영향 방식 대안

| 대안 | 방식 | 위험 | 판단 |
|---|---|---|---|
| A. judge stat를 sufficiency에 +/- 적용 | 구현 쉬움 | 숨은 승률 보너스 | **Forbidden** |
| B. judge profile이 evidence/requirement를 자유롭게 재작성 | 차이 큼 | hard boundary 소멸 | **Forbidden** |
| C. criterion이 허용한 명시적 ambiguity choice에만 resolved interpretation input 제공 | 차이를 설명하고 replay 가능 | choice point authoring 필요 | **Accepted** |

**R11-C — Accepted.** DEC-012는 full `JudgeProfile`을 설계하지 않고 다음 interface만 예약한다.

`JudgeInterpretationInput`은 최소한 `input_id/version`, `judge_profile_ref/version`, `criterion_choice_point_ref`, `permitted_option`, `affected_scope`, `interpretation_reason_ref`를 의미상 제공한다. 실제 필드와 profile trait 목록은 DEC-LITIGATION-013의 범위다.

Future input이 영향을 줄 수 있는 후보는 오직 criterion이 허용한 borderline 영역이다.

- borderline credibility interpretation에서 어느 명시적 permissible assessment를 채택하는가.
- 같은 evidence가 허용하는 둘 이상의 reasonable content interpretation 중 어느 범위를 채택하는가.
- criterion이 허용한 circumstantial link category를 해당 scope에서 받아들이는가.
- unresolved evidentiary ambiguity를 criterion이 제공한 복수 처리 중 어떻게 다루는가.
- clarity, directness, corroboration을 criterion-defined choice에서 어떤 이유로 요구하거나 선호하는가.

이 목록은 full profile design도 실제 법적 기준도 아니다. “선호”는 requirement를 추가·삭제하거나 가중치를 더하는 것이 아니라 criterion이 이미 허용한 대안 중 하나를 선택하는 interface다.

### Hard prohibitions

Judge interpretation은:

- evidence, statement, corroborating source 또는 fact scope를 생성할 수 없다.
- `ActualStateRecord`를 읽을 수 없다.
- unsubmitted, unreceived, unallowed material을 사용할 수 없다.
- criterion requirement를 삭제하거나 새 대체 경로를 만들 수 없다.
- clearly insufficient record를 personality만으로 `recognized` 또는 `recognized_limited`로 바꿀 수 없다.
- clearly sufficient hard-boundary result를 이유 없이 뒤집을 수 없다.
- flat +/- percentage, hidden weight, prestige preference로 작동할 수 없다.
- final RNG를 호출해 close case를 결정할 수 없다.
- 선택 이유를 사후 생성하거나 다른 choice point에 전파할 수 없다.

어떤 ambiguity가 “genuinely permissible”인지 표시하는 authoring rule과 profile-to-input derivation은 **TBD / DEC-LITIGATION-013**이다. 이 경계가 없다면 judge difference를 활성화하지 않고 같은 hard-boundary evaluation을 유지해야 한다.

**DEC-013 guardrail — Accepted:** judge interpretation choice point는 고정된 allowed record와 적용 criterion이 실제로 둘 이상의 허용 가능한 해석을 남기는 **genuine record/criterion ambiguity**에 대응해야 한다. 원하는 canonical outcome을 고르는 disguised outcome switch로 authoring해서는 안 된다. 이를 판별하는 상세 authoring/validation mechanism은 이 문서에서 설계하지 않으며 **TBD / DEC-LITIGATION-013**이다.

## 14. R12 — Determinism

**R12 — Core Accepted.** 다음 입력이 동일하면 evaluation은 의미상 동일해야 한다.

- Case identity와 relevant immutable history.
- Stage와 `CourtRecordSnapshot`.
- `FactProposition`과 evaluated scope/version.
- `RecognitionCriterion` identity/version/stage binding.
- allowed `EvidenceUse`, relevance, credibility, lineage와 conflict inputs.
- 적용된다면 explicit `JudgeInterpretationInput` identity/version.
- command sequence와 ordering rules.

동일 입력의 requirement outcomes, canonical status, recognized scope, contribution/conflict references, reason semantics는 같아야 한다. 저장 순서나 비의미 metadata가 달라도 semantic equivalence는 같아야 하며, byte equivalence 요구 여부는 **TBD**다.

사실인정 전용 RNG, 마지막 tie-break RNG, 현재 시간·hash iteration order·UI 순서에 따른 변화는 **Forbidden**이다. 다른 시스템에서 이미 생성된 사건 사실이나 evidence가 allowed record에 고정 입력으로 들어오는 것은 새 fact-finding RNG가 아니다.

Criterion 또는 judge interpretation version이 바뀌면 다른 입력이므로 새 stage evaluation이 달라질 수 있다. 과거 evaluation을 덮어쓰지 않고 새 결과와 reason lineage를 추가한다.

**TEST-010 재검증:** Case 8은 동일 fixed semantic input의 두 수동 replay에서 같은 snapshot membership, criterion reference, evidence use, finding status와 explanation을 관찰했고 새 fact-finding RNG를 사용하지 않았다. 이는 R12의 방향을 지지하지만 실제 구현의 RNG call 감시, save/restore, byte-identical serialization은 검증하지 않았다.

## 15. R13 — downstream compatibility with DEC-008

**R13 — Core Accepted.**

권장 chain은 다음과 같다.

```text
EvidenceItem
  → allowed EvidenceUse
  → relevance / credibility / lineage / conflict
  → RecognitionCriterion + proposition requirements/scopes
  → SufficiencyEvaluation
  → CourtFactFinding (DEC-011 canonical status)
  → claim path가 참조하는 fact requirement
  → burden / legal relation / limiting effect
  → Final Adjudication (DEC-008)
```

DEC-012 출력은 “이 사실명제가 어떤 범위에서 어떤 상태인가”와 그 이유다. 다음을 산출하지 않는다.

- 어느 당사자가 최종적으로 이기거나 지는가.
- 입증 부족을 누구에게 귀속할 것인가.
- 한 사실의 인정이 어떤 법적 효과를 발생시키는가.
- 청구 인용·기각, 손해액, 감액, remedy.
- alternative claim path 선택과 중복 회복 방지.

DEC-008은 명시된 claim path, burden, legal effect를 통해 `CourtFactFinding`을 소비한다. `not_established_on_record`는 burden rule이 있을 때만 해당 effect의 불성립으로 연결될 수 있으며, `undetermined`는 설계/절차 공백을 당사자 패소로 닫는 신호가 아니다. `recognized_limited`의 legal effect도 recognized scope를 참조하는 별도 rule이 필요하다.

## 16. Semantic reference model

아래 구조는 의미 경계를 설명하기 위한 reference다. **canonical Godot classes, canonical JSON, save schema, API schema가 아니다.** 구현 시 합치거나 나눌 수 있지만 의미 분리는 유지해야 한다.

| semantic structure | 최소 의미 정보 | 경계 |
|---|---|---|
| `RecognitionCriterion` | criterion identity/version, authority/content ref, applicability, requirements, composition rules, conflict/lineage/credibility rule refs, judge choice points | 실제 한국법 기준을 이 DEC가 채우지 않음 |
| `RecognitionCriterionRef` | criterion/version ref, fact/scope binding, stage applicability | 이름만 있고 내용 없는 ref는 valid criterion 아님 |
| `CriterionRequirement` | requirement ID, target scopes, mandatory/alternative/conditional/severable relation, satisfaction rule ref, blocking conditions | 완료 점수나 UI checklist가 아님 |
| `PropositionScope` | scope ID/name, semantic boundary, parent/overlap relation, severability ref | 0~1 fraction 아님 |
| `EvidenceContribution` | EvidenceUse ref, target scope, allowed content scope, qualitative role, relevance reason, lineage group | strength number 없음 |
| `CredibilityAssessment` | evidence use/content/stage scope, DEC-011 qualitative state, reason refs | sufficiency 결과와 분리 |
| `LineageAssessment` | source lineage, derived-from, contribution group, independence state, reason/source | exact automatic identity algorithm 아님 |
| `EvidenceConflict` | target scope, all involved uses, conflict boundary, materiality ref, resolution state/reason | 한쪽 자료를 삭제하지 않음 |
| `RequirementEvaluation` | criterion requirement, evaluated scope, relevant contributions, credibility/lineage/conflict refs, qualitative outcome, gaps/reasons | canonical finding status가 아님 |
| `SufficiencyEvaluation` | evaluation identity, fact/scope, snapshot, criterion, requirement results, judge input ref, canonical transition, blockers | final adjudication가 아님 |
| `JudgeInterpretationInput` | versioned profile ref, criterion choice point, permitted option, affected scope, reason | full JudgeProfile이나 bonus가 아님 |
| `CourtFactFinding` | DEC-011 fields/status, recognized scope, evaluation trace ref | 네 canonical status만 사용 |
| `FactFindingExplanation` | disclosure-filtered fact/scope, public evidence/reasons, status explanation | internal trace와 별도 |

### 최소 validation candidate

- criterion ref는 immutable version을 resolve하고 stage/scope에 적용 가능해야 한다.
- 모든 requirement target scope는 해당 proposition에 존재해야 한다.
- 모든 contribution은 snapshot에 allowed된 content scope 안에 있어야 한다.
- contribution의 target fact/scope와 credibility assessed scope가 호환되어야 한다.
- corroboration에 사용된 independence는 `independent_lineage`로 명시되거나 criterion이 unknown 처리 rule을 가져야 한다.
- `recognized_limited`에는 non-empty explicit recognized scope와 severability basis가 있어야 한다.
- judge input은 criterion의 declared choice point와 permitted option에 정확히 일치해야 한다.
- trace가 canonical status와 reason을 역추적할 수 있어야 한다.

## 17. Core invariants

1. **Criterion required:** 필요한 criterion이 없거나 불완전하면 substantive finding을 추측하지 않고 `undetermined`로 중단한다.
2. **Proposition-level reasoning:** case-wide strength score가 아니라 fact/scope/requirement별로 평가한다.
3. **Allowed record only:** snapshot 밖 자료, ActualStateRecord, hidden AP, 내부 WorkProduct는 입력이 아니다.
4. **No numeric collapse:** relevance, credibility, lineage, conflict, sufficiency를 하나의 점수·확률로 합치지 않는다.
5. **No count rule:** evidence item 수가 많다는 이유만으로 requirement가 충족되지 않는다.
6. **Lineage-aware corroboration:** 사본·발췌·재인용은 독립 corroboration이 아니다.
7. **Non-consumption:** 하나의 evidence는 여러 proposition에서 사용할 수 있고 첫 사용 뒤 소진되지 않는다.
8. **Scope precision:** support와 recognition은 실제 content/scope를 넘지 않는다.
9. **Partial is explicit:** `recognized_limited`는 named, criterion-authorized severable scope가 필요하다.
10. **Conflict preservation:** supporting·contradicting contribution과 unresolved portion을 모두 보존한다.
11. **No inverse fact:** P의 미성립은 not-P의 인정이 아니다.
12. **Judge boundedness:** judge interpretation은 criterion이 연 ambiguity만 다루고 hard requirements를 바꾸지 않는다.
13. **No fact-finding RNG:** 동일 semantic input은 동일 semantic output을 낸다.
14. **Trace before explanation:** 결과 이유는 실제 trace에서 나오며 사후 합리화하지 않는다.
15. **Fact/legal separation:** finding은 claim outcome, burden, legal effect를 스스로 결정하지 않는다.
16. **Append-only history:** stage/criterion/snapshot 변경은 새 evaluation을 만들며 과거 finding을 덮어쓰지 않는다.

## 18. Pressure-test examples

모든 예시는 실제 법률이 아닌 synthetic structural fixture다. `C-*` criterion은 해당 예시에 명시된 가상 rule만 가진다. 절차가 닫혔다고 적은 경우에만 현 record insufficiency를 종결할 수 있다.

### 18.1 Single credible but partial evidence

- **Input structure:** P는 required scopes S1·S2를 가지며 C-1은 둘 모두를 요구한다. E1은 allowed, S1에 relevant/support, `accepted_for_scope`; S2는 말하지 않는다. 절차는 닫힘.
- **May evaluate:** S1 support와 S2 missing coverage, C-1의 all-required composition.
- **Must not happen:** credible E1을 P 전체 support로 확대하거나 50% recognition으로 변환.
- **Expected status:** C-1이 severable partial recognition을 허용하지 않으므로 `not_established_on_record`.

### 18.2 Four copies from the same source lineage

- **Input structure:** E1 원본과 E1a/E1b/E1c 사본이 같은 lineage·contribution group. C-2는 independent corroboration을 요구하는 synthetic fixture.
- **May evaluate:** 네 presentation과 하나의 독립 source group, 각 allowed scope.
- **Must not happen:** “4 pieces”로 corroboration 충족, credibility 상승, duplicate farming.
- **Expected status:** 다른 independent support가 없고 rule이 완전하며 절차가 닫혔으므로 `not_established_on_record`.

### 18.3 Two genuinely independent corroborating sources

- **Input structure:** E1과 E2는 explicit independent lineages, 동일 required scope를 각각 relevant하게 support하고 각 credibility가 accepted. C-3은 이 scope에서 두 independent corroborating contributions를 충분 구조로 명시한다.
- **May evaluate:** independence, scope alignment, credibility, conflict absence를 함께 확인.
- **Must not happen:** 단지 ID가 둘이라는 이유로 독립성을 추정하거나 다른 scope까지 확대.
- **Expected status:** 다른 mandatory requirement가 없고 C-3 조건이 모두 명시적으로 충족되면 `recognized`.

### 18.4 Credible but irrelevant evidence

- **Input structure:** E1은 신뢰 가능한 다른 사건 시점 자료지만 P/S1과 relevance가 `irrelevant_for_scope`. P를 지지하는 다른 자료 없음. C-4와 절차는 완전/closed.
- **May evaluate:** credibility와 relevance가 별도라는 점, S1 gap.
- **Must not happen:** 높은 credibility를 sufficiency로 복사.
- **Expected status:** `not_established_on_record`.

### 18.5 Relevant but credibility-contested evidence

- **Input structure:** E1은 P/S1에 relevant/support지만 credibility `disputed`. C-5가 disputed credibility의 처리 rule을 제공하지 않고 이 다툼이 material함.
- **May evaluate:** relevance와 contested state, 필요한 rule gap.
- **Must not happen:** relevant이므로 자동 인정, disputed이므로 자동 삭제, 숨은 credibility 점수 사용.
- **Expected status:** `undetermined` + `[상세 사실인정 기준 미정]`. C-5가 명시적 처리 rule 또는 judge-permitted choice point를 제공하는 다른 fixture에서는 그 rule에 따라 달라질 수 있음.

### 18.6 Full coverage with one unresolved contradiction

- **Input structure:** E1·E2가 모든 required scopes를 support하나 E3가 S2를 contradict. 모두 allowed이고 lineage·credibility가 명시됨. C-6은 conflict가 material하다고 하지만 disposition rule이 없음.
- **May evaluate:** full support topology와 E3 conflict를 동시에 보존.
- **Must not happen:** E3 삭제, 2 대 1 다수결, 자동 절반 인정.
- **Expected status:** `undetermined` + conflict-resolution rule missing. C-6이 conflict 처리 rule을 명시했다면 그 rule에 따른 결과는 별도 fixture로 결정 가능.

### 18.7 One required proposition element completely unsupported

- **Input structure:** P scopes S1·S2·S3, C-7은 세 scope 모두 mandatory. S1·S2는 충족, S3 contribution 없음. 절차 closed, rule complete.
- **May evaluate:** S3의 explicit missing coverage.
- **Must not happen:** S1·S2의 많은 evidence로 S3를 상쇄.
- **Expected status:** `not_established_on_record`.

### 18.8 Criterion missing

- **Input structure:** P와 allowed EvidenceUse는 있으나 criterion ref가 없음.
- **May evaluate:** record inventory와 missing criterion blocker까지만 확인.
- **Must not happen:** default threshold 추측, evidence 개수로 status 선택, 당사자 입증 실패 처리.
- **Expected status:** `undetermined` + `criterion_missing` + `[상세 사실인정 기준 미정]`.

### 18.9 Partial recognition with explicit scope

- **Input structure:** P는 기간 S-early와 S-late로 severable. C-9는 각 기간의 독립 판단과 한정 인정을 허용한다. S-early requirements는 모두 충족, S-late의 mandatory coverage는 부족. 절차 closed.
- **May evaluate:** 각 named period scope와 shared evidence의 실제 범위.
- **Must not happen:** “절반 인정” 숫자, S-early evidence를 S-late로 확대, downstream 감액 자동 산출.
- **Expected status:** `recognized_limited`, `recognized_scope = S-early`. S-late gap은 trace에 보존.

### 18.10 Same fixed record under two permissible future judge interpretations

- **Input structure:** P/S1, C-10, snapshot, contributions, credibility, lineage가 동일. C-10은 특정 circumstantial link에 `accept_link_for_scope`와 `require_more_direct_link` 두 permissible options를 명시하고 둘 다 같은 hard requirements를 유지한다. J-A와 J-B input은 이 choice point에서만 다름.
- **May evaluate:** J-A는 허용된 circumstantial link를 받아 requirement를 충족할 수 있고, J-B는 그 link만으로 requirement가 충족되지 않는다고 판단할 수 있다.
- **Must not happen:** 새 evidence 생성, criterion requirement 삭제, 다른 scope 영향, profile 점수 가산.
- **Expected status:** fixture가 closed이고 나머지 requirement가 충족됐다는 전제에서 J-A는 `recognized`, J-B는 `not_established_on_record`가 가능하다. 두 trace는 같은 choice point의 서로 다른 permitted option과 이유를 명시해야 한다.

### 18.11 Clearly insufficient record under two judge profiles

- **Input structure:** C-11 mandatory scope S2에 어떤 EvidenceUse도 없다. J-A와 J-B는 다른 interpretation profile이나 C-11은 S2 부재를 해석 choice point로 열지 않는다.
- **May evaluate:** 두 input 모두 hard missing coverage.
- **Must not happen:** 호의적 profile이 S2를 생성·면제하거나 hidden bonus로 채움.
- **Expected status:** 두 경우 모두 `not_established_on_record`, 의미상 동일 missing-scope reason.

### 18.12 Exact replay

- **Input structure:** Case, Stage, snapshot, P/scope, C/version, contributions, credibility, lineage, conflict, judge input, command sequence를 완전히 고정해 두 번 실행.
- **May evaluate:** semantic digest와 reason graph equivalence.
- **Must not happen:** final RNG, iteration order, current time, UI ordering으로 결과 변화.
- **Expected status:** 첫 실행이 어떤 canonical status이든 두 실행의 status, recognized scope, requirement outcomes와 reasons는 의미상 동일.

## 19. Explicit TBD list

1. 실제 한국법상 recognition/proof standards와 사건 유형별 criterion content.
2. criterion authority, authoring, validation, 배포·폐기·version identifier의 exact format.
3. criterion composition language: mandatory, alternative, conditional, severable 관계의 canonical 표현.
4. proposition scope granularity, overlap, normalization, reusable taxonomy.
5. 자연어에서 proposition/scope/contribution/relevance/conflict를 생성하는 방법.
6. EvidenceContribution role의 exact enum과 복합 역할 표현.
7. credibility assessment 생성 기준, 자료 유형별 규칙, contested credibility disposition.
8. exact source-lineage/contribution identity algorithm과 independence 판별.
9. 실제 corroboration이 어떤 criterion에서 무엇을 충족하는지.
10. conflict classification generation, materiality, resolution standards.
11. partial recognition이 허용되는 법적·semantic severability 기준.
12. procedure-open과 closed evaluation의 정확한 연계 및 재평가 trigger.
13. player-facing disclosure levels, 문구, UI, explanation detail.
14. `JudgeProfile` 내용, permissible choice point taxonomy, profile-to-input derivation — DEC-LITIGATION-013.
15. judge ambiguity interface가 실제 콘텐츠 규모에서 충분히 expressive한지에 대한 prototype pressure test.
16. semantic equivalence/digest와 byte determinism 요구 수준.
17. appellate/remand에서 criterion version과 prior finding을 사용할 실제 법적 효과.
18. admissibility, burden, final adjudication, remedy, damages, precedent effect.
19. canonical Godot/JSON/save/API implementation structure.
20. TEST-010의 두 PARTIAL 경계에 남은 automatic lineage identity와 proposition-level evidence combination의 실제 검증.

## 20. Risks / anti-patterns

| anti-pattern | 명시적 판단 | 이유 |
|---|---|---|
| evidence strength points | **Forbidden** | 서로 다른 scope·lineage·conflict를 대체 가능한 숫자로 만듦 |
| hidden percentages | **Forbidden** | 설명 불가능한 threshold와 사실인정 RNG를 숨김 |
| “3 pieces of evidence = recognized” | **Forbidden** | relevance·credibility·lineage·coverage를 무시 |
| lawyer ability가 fact sufficiency에 직접 가산 | **Forbidden** | 실제 준비·제출 대신 stat가 사실을 만듦 |
| law firm prestige가 factual truth recognition에 영향 | **Forbidden** | 조직 명성이 court record를 대체 |
| judge personality as +/- modifier | **Forbidden** | DEC-007 J8과 hard/soft boundary 위반 |
| duplicate evidence farming | **Forbidden** | 같은 source의 presentation 수를 corroboration으로 위장 |
| failure of proof에서 opposite fact 자동 인정 | **Forbidden** | DEC-011 F2 위반 |
| ActualStateRecord가 judicial reasoning에 누출 | **Forbidden** | truth/court boundary 위반 |
| final RNG deciding close cases | **Forbidden** | 동일 input 재현성과 준비 설명을 파괴 |
| one global case-strength score | **Forbidden** | proposition-level reasoning과 DEC-008 claim paths를 소거 |
| criterion missing을 default common-sense rule로 보완 | **Forbidden** | 설계 공백을 숨기고 당사자 결과로 바꿈 |
| partial support를 percentage recognition으로 표시 | **Forbidden** | `recognized_limited`의 named scope를 fractional score로 대체 |
| unresolved conflict에서 evidence 수 다수결 | **Forbidden** | conflict reason과 credibility/lineage를 지움 |
| 결과를 먼저 선택한 뒤 trace 생성 | **Forbidden** | DEC-007 J9·DEC-011 F8/F9 위반 |

### 주요 설계 위험

- **Authoring burden:** criterion과 scope를 너무 세밀하게 쓰면 콘텐츠 비용이 커진다. 해결 방향은 reusable criterion definition과 validation이며 global score로 후퇴하지 않는다.
- **Checklist gameplay:** 내부 requirements를 UI 완료율로 그대로 노출하면 정답 퍼즐이 된다. player explanation은 gaps와 reasons를 전달하되 exact hidden authoring graph 공개 여부는 별도다.
- **Semantic ambiguity:** 평가적 사실은 단순 scope coverage로 완결되지 않을 수 있다. 이때 criterion-defined choice point가 필요하며, 없으면 억지 결과 대신 TBD로 중단한다.
- **Judge layer leakage:** profile trait가 직접 outcome을 바꾸기 시작하면 modifier가 된다. criterion choice point reference 없는 judge input은 invalid다.
- **False independence:** lineage metadata가 빈약하면 사본을 독립 자료로 오인할 수 있다. 중요 independence가 unknown이면 자동 corroboration 금지.
- **Overuse of undetermined:** 모든 어려운 사례를 rule missing으로 남기면 게임이 끝나지 않는다. 지원 콘텐츠는 필요한 criterion을 제공해야 하지만, 문서가 없는 rule을 즉석에서 만들지는 않는다.

## 21. Proposed first-pass TEST-011 cases

`TEST-011_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md`는 아직 만들지 않는다. 첫 pass는 fixed/injected semantic input에 대한 구조·경계 검증으로 **10 core cases**를 추천한다. 자연어 법률 reasoning, 실제 한국법, admissibility 또는 final judgment engine 검증으로 보고하지 않는다.

TEST-010과 중복되는 case는 회귀 경계이면서 DEC-012가 추가한 criterion requirement/topology를 함께 검증한다. 특히 TEST-010에서 PARTIAL이었던 duplicate lineage와 credibility/sufficiency 결합은 TEST-011에서도 explicit fixture를 사용하고, automatic identity나 실제 법률 기준의 성공으로 과장하지 않는다. TEST-010 core에서 실행하지 않은 partial recognition과 conflict disposition, future judge boundary는 DEC-012의 신규 핵심 검증이다.

| # | core case | 핵심 고정/변경 입력 | 반드시 확인할 결과 |
|---|---|---|---|
| 1 | criterion present vs missing | 같은 P/record, valid C와 no C | valid C만 substantive evaluation; missing은 `undetermined`/TBD |
| 2 | required-scope coverage | all scopes covered vs one mandatory scope absent | 전자는 criterion 충족 가능, 후자는 closed record에서 `not_established_on_record` |
| 3 | duplicate lineage attack | 같은 source의 copy/excerpt/requote 수 증가 | corroboration·sufficiency 불변, trace에는 presentation 보존 |
| 4 | independent corroboration | same-lineage pair vs explicit independent pair | independence를 구별; criterion rule 있을 때만 satisfaction에 사용 |
| 5 | credibility/relevance/sufficiency separation | credible-irrelevant, relevant-disputed, credible-partial | 세 차원을 같은 값으로 복사하지 않음 |
| 6 | explicit partial recognition | named severable scope 충족, 나머지 gap | `recognized_limited`와 exact scope; percentage 금지 |
| 7 | unresolved conflict | full support + material contradiction, resolution rule 없음 | 양측 보존, `undetermined`; 다수결/삭제 없음 |
| 8 | judge interpretation hard boundary | 같은 criterion-declared borderline record를 explicit permitted `JudgeInterpretationInput` fixture JI-A/JI-B로 평가하고, 별도 clearly-missing-scope 변형에도 같은 두 fixture를 적용 | borderline genuine ambiguity에서만 허용 범위의 차이 가능; missing scope는 두 fixture 모두 동일 insufficiency. `JudgeProfile → JudgeInterpretationInput` derivation은 검증하지 않음 |
| 9 | deterministic replay / no hidden score or RNG | 모든 semantic input/command 동일; numeric strength·probability input 없음 | status, scope, outcomes, reasons 의미상 동일; hidden score·fact-finding RNG 없음 |
| 10 | trace and downstream boundary | finding에서 criterion/requirements/evidence/lineage/conflict까지 역추적 | hidden input 없음, claim outcome·burden·remedy를 생성하지 않음 |

추가 확장 후보는 criterion version/stage mismatch, independence unknown, alternative requirement path, partial conflict resolution, one evidence/multiple propositions non-consumption, prior-stage criterion preservation이다.

## 22. Decision summary

| ID | 추천 결정 | 상태 |
|---|---|---|
| R1 | proposition evaluation이 versioned shared `RecognitionCriterionRef`를 명시적으로 binding; missing/incomplete이면 `undetermined` | **Accepted** |
| R2 | named `PropositionScope`와 criterion-bound requirements로 proposition을 구조화 | **Core Accepted** |
| R3 | EvidenceItem과 proposition/scope별 qualitative EvidenceUse contribution 분리 | **Accepted** |
| R4 | relevance, credibility, sufficiency를 대상·질문·기록 면에서 분리 | **Core Accepted** |
| R5 | source lineage/derived-from/contribution group으로 duplication과 corroboration 구별 | **Core Accepted**, exact algorithm **TBD** |
| R6 | criterion requirement coverage + contribution/conflict topology + qualitative resolution hybrid | **Core Accepted** |
| R7 | criterion-authorized named severable scope에만 `recognized_limited` | **Accepted** |
| R8 | conflict 양측과 unresolved scope를 보존하고 criterion에 따라 disposition | **Core Accepted**, generation/resolution details **TBD** |
| R9 | DEC-011의 네 canonical status만 사용하고 missing rule과 insufficient record를 reason으로 구별 | **Accepted** |
| R10 | 실제 internal trace와 disclosure-filtered player explanation 분리 | **Core Accepted** |
| R11 | criterion-declared genuine ambiguity에만 explicit judge interpretation input 허용; disguised outcome switch 금지 | **Accepted**, full design은 DEC-013 **TBD** |
| R12 | 동일 semantic input과 command sequence의 semantic determinism, 새 RNG 금지 | **Core Accepted** |
| R13 | fact finding을 DEC-008의 burden/legal effect/final adjudication과 분리 | **Core Accepted** |

위 R1~R13의 추천 결정을 v0.3에서 채택한다. TEST-010의 6 PASS는 상속 경계를 지지하고, 2 PARTIAL은 R5의 exact algorithm과 R6의 실제 criterion content·결합 결과를 계속 TBD/미검증으로 남겨야 하는 이유다. R7의 구조적 경계는 Accepted지만 canonical vocabulary와 양립한다는 사실 외에 아직 직접 실행 검증되지 않았다.

### 검토 요청 결론

이 초안은 hybrid structural model을 채택 후보로 추천한다. 가장 중요한 승인 질문은 다음 세 가지다.

1. `RecognitionCriterion`이 named scope requirements와 그 composition을 외부 content로 제공하는가.
2. `recognized_limited`를 criterion이 명시적으로 허용한 severable scope에만 제한하는가.
3. future judge interpretation을 criterion-declared choice point interface에만 제한하는가.

세 질문을 채택하면 evidence collection, preparation, contradiction, corroboration, gap 발견과 framing은 실제 record 구조를 바꾸는 전략으로 남고, 숨은 승률 계산 없이 proposition 결과의 이유를 설명할 수 있다.

## 결정 이력

| 버전 | 상태 | 내용 |
|---|---|---|
| v0.1 | Proposed draft for review | versioned criterion binding, named proposition scope, qualitative EvidenceUse roles, credibility/relevance/sufficiency separation, lineage-aware corroboration, hybrid requirement/topology sufficiency, explicit partial recognition, conflict preservation, four-status transition, trace/public explanation separation, bounded judge interpretation, deterministic replay, DEC-008 downstream boundary와 TEST-011 10-case 계획 제안. 실제 한국법·구현·JudgeProfile·최종 판결은 미정 유지 |
| v0.2 | Proposed draft for review / TEST-010 revalidated | current worktree의 TEST-010 v0.2 actual result 6 PASS / 2 PARTIAL을 직접 대조하고 검증 근거로 반영. duplicate non-strengthening·criterion missing/insufficient distinction·canonical states·deterministic replay 일치를 기록. lineage identity와 evidence combination은 PARTIAL/TBD, partial recognition은 core 미실행임을 명시. R1~R13 status와 TEST-011 10-case 추천은 변경하지 않음 |
| v0.3 | Accepted / 상세 기준·알고리즘·구현 미정 | R1~R13의 추천 구조를 Accepted/Core Accepted로 채택. 모든 기존 explicit TBD 경계를 유지. TEST-011 case 8을 두 explicit permitted JudgeInterpretationInput fixture로 수정하고 profile-to-input derivation은 DEC-013 TBD로 유지. choice point는 genuine record/criterion ambiguity에만 대응해야 하며 disguised outcome switch authoring은 금지; 상세 authoring/validation mechanism은 DEC-013 TBD |
