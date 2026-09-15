# THE FIRM — Judge Interpretation & Judicial Profile 최소 모델

문서 ID: DEC-LITIGATION-013  
버전: v0.2 — Final acceptance  
상태: **Accepted**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
상위 기준: [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) v0.2, [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) v0.2  
시스템 기준: [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) v0.2  
직접 결정 기준: [DEC-LITIGATION-007_JUDGE_ACCEPTANCE.md](DEC-LITIGATION-007_JUDGE_ACCEPTANCE.md), [DEC-LITIGATION-008_FINAL_ADJUDICATION.md](DEC-LITIGATION-008_FINAL_ADJUDICATION.md), [DEC-LITIGATION-009_PROCEDURAL_FLOW.md](DEC-LITIGATION-009_PROCEDURAL_FLOW.md), [DEC-LITIGATION-010_APPEAL_AND_COURT_LEVELS.md](DEC-LITIGATION-010_APPEAL_AND_COURT_LEVELS.md), [DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md](DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md), [DEC-LITIGATION-012_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md](DEC-LITIGATION-012_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md) v0.3 Accepted  
검증 참고: [TEST-010_MINIMUM_FACT_RECOGNITION.md](TEST-010_MINIMUM_FACT_RECOGNITION.md) v0.2, [TEST-011_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md](TEST-011_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md) v0.1

## 1. Purpose / non-goals

이 문서는 판사별 해석 차이를 표현하는 최소 `JudgeProfile` 구조와, 그 profile이 criterion-declared genuine ambiguity에서 explicit `JudgeInterpretationInput`을 도출하는 의미 경계를 정의한다.

핵심 목적은 판사가 같은 이름의 무작위 보너스가 아니라 지속적이고 설명 가능한 해석 성향을 가진 인물로 남도록 하는 것이다. 그러나 성향은 record와 criterion보다 앞설 수 없다. 판사별 차이는 동일 record에서 실제로 둘 이상의 허용 가능한 해석이 남는 경우에만 작동한다.

필수 chain은 다음과 같다.

```text
JudgeProfileVersion
  → criterion-declared genuine ambiguity
    → applicable rule-linked JudgeTrait
      → explicit JudgeInterpretationInput
        → permitted requirement resolution
          → CourtFactFinding
```

`JudgeProfile` 자체는 `CourtFactFinding`을 직접 바꾸지 않는다.

이 문서는 다음을 하지 않는다.

- 실제 대한민국 법률의 증거평가 기준, 법관 재량, 입증도 또는 사법제도를 선언하지 않는다.
- judge AI, opponent AI, natural-language interpretation, automatic ambiguity detection을 구현하지 않는다.
- criterion authoring tool, full validation algorithm, canonical trait catalog를 완성하지 않는다.
- 판사 오류, 편견, 부패, 위법한 재판 또는 징계 시스템을 도입하지 않는다.
- evidence admissibility, 절차상 하자 효과, 최종 adjudication, damages/remedy를 결정하지 않는다.
- Godot class, GDScript, JSON, save schema 또는 API를 확정하지 않는다.
- TEST-012를 작성하거나 실행하지 않는다.

이 문서의 결정 표식은 다음과 같다.

| 표식 | 의미 |
|---|---|
| **Accepted** | 이 문서에서 채택한 구체 결정 |
| **Core Accepted** | 구현 형태와 무관하게 유지해야 할 핵심 경계 |
| **TBD** | 실제 법리, 콘텐츠, validation 또는 구현 근거가 더 필요한 사항 |
| **Forbidden** | 기존 Accepted 경계 또는 본 설계 목적과 양립하지 않는 방식 |

## 2. Inherited Accepted constraints

다음은 DEC-013에서 다시 선택할 사항이 아니라 기존 Accepted 결정이다.

| 출처 | 상속하는 경계 | DEC-013의 결과 |
|---|---|---|
| GAME CONSTITUTION | 판결은 설명 가능해야 하고 준비·선택을 무작위 뒤집기로 무력화하지 않는다 | judge personality는 마지막 결과 추첨이 될 수 없음 |
| SYSTEM MAP / SYS-001 | World가 판사 조건을 공급하고 Litigation이 실제 record와 전략을 평가한다 | World의 judge identity와 Litigation의 finding 책임을 분리 |
| DEC-007 J1·J3 | 실제 제출·전달된 자료만 사용하고 credibility와 sufficiency를 분리 | profile은 hidden AP·ActualStateRecord·미제출 자료를 읽지 않음 |
| DEC-007 J8 | 동일 제출에서 제한적 판단 초점·해석 차이를 허용하되 win-rate bonus와 hidden preference puzzle 금지 | qualitative, explainable, bounded difference만 허용 |
| DEC-007 J9 | 실제 판단 단계의 입력·범위·이유를 기록 | profile/trait/choice point/option의 실제 derivation trace 필요 |
| DEC-008 | fact finding과 burden/legal effect/final claim result를 분리 | profile은 claim win/loss를 선택하지 않음 |
| DEC-009 | 절차 기록은 누적하며 allowed input과 내부 준비를 분리 | profile은 procedure를 우회하거나 evidence를 허용하지 않음 |
| DEC-010 | stage별 history와 permitted review 범위를 보존 | 평가 당시 profile version을 보존하며 과거 finding을 재작성하지 않음 |
| DEC-011 | 네 canonical fact states, truth non-interference, no inverse fact, no fact-finding RNG | profile은 fifth status, truth lookup, contrary inference 또는 RNG를 만들지 않음 |
| DEC-012 R1~R10 | hard criterion/scope/evidence/lineage/conflict/trace boundary | judge layer는 hard evaluation 뒤의 declared ambiguity에만 진입 |
| DEC-012 R11 | explicit, versioned `JudgeInterpretationInput`만 requirement resolution에 전달 | `JudgeProfile` direct effect 금지 |
| DEC-012 R12~R13 | semantic determinism과 final adjudication 분리 | 동일 input은 동일 interpretation semantics; downstream effect는 별도 |
| TEST-011 Case 8 | explicit JI-A/JI-B만으로 genuine ambiguity와 hard insufficiency를 수동 검증 | profile-to-input derivation이 이번 DEC의 미검증 설계 대상 |

### 2.1 Hard evaluation precedes profile influence

다음 세 gate를 순서대로 통과하지 않으면 profile influence는 없다.

1. **Hard-input gate:** allowed record, proposition/scope, applicable criterion/version, required credibility/lineage/conflict inputs가 존재한다.
2. **Hard-result gate:** record가 criterion상 clearly sufficient 또는 clearly insufficient이면 그 결과를 그대로 사용한다.
3. **Genuine-ambiguity gate:** hard boundary만으로 결과가 닫히지 않고 criterion이 해당 record condition에 대해 둘 이상의 permitted semantic option을 명시한다.

Gate 3을 통과한 뒤에만 `JudgeProfileVersion`을 조회하고 `JudgeInterpretationInput`을 도출할 수 있다. profile을 먼저 읽고 choice point를 나중에 만드는 순서는 **Forbidden**이다.

### 2.2 DEC-007~012 compatibility review

**직접 contradiction은 발견되지 않았다.** 본 결정은 DEC-007 J8이 후속 결정으로 남긴 제한적 판사 차이를 DEC-012 R11의 accepted interface 안에서 구체화한다.

- DEC-007의 판사 차이를 승률 보너스·숨은 선호 퍼즐로 만들지 않는다.
- DEC-008의 burden/legal effect/final adjudication을 profile output으로 끌어오지 않는다.
- DEC-009의 submitted/received/allowed 경계와 절차 소유권을 profile이 재결정하지 않는다.
- DEC-010의 stage/history 보존을 profile version history로 지원하되 appellate effect를 만들지 않는다.
- DEC-011의 truth non-interference, 네 canonical status와 no fact-finding RNG를 유지한다.
- DEC-012의 hard-first boundary, genuine ambiguity guardrail과 explicit JII chain을 그대로 사용한다.

DEC-007이 미정으로 두었던 judge error/uncertainty RNG를 이 문서에서 도입하지 않는다. 이후 오류 모델을 검토하더라도 DEC-012가 금지한 final fact-finding RNG와 hidden outcome switch를 침범할 수 없다.

## 3. J1 — JudgeProfile semantic ownership

### 선택지

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. 사건별 judge result table | case type/party별 예상 결과 저장 | 빠른 결과 생성 | 성향이 outcome lookup table이 되고 record가 무의미 | **Forbidden** |
| B. Litigation evaluation 안의 일회성 mood | 매 사건마다 임의 성향 생성 | 변화 연출 쉬움 | identity·재현성 소멸, mood RNG | **Forbidden** |
| C. World의 지속 Judge identity가 versioned interpretive profile을 소유하고 Litigation은 평가 시점 version을 참조 | 장기 세계와 재현성, 시스템 책임 분리 | version·history 관리 필요 | **Accepted** |

### 채택

**J1-C — Accepted.** `JudgeProfile`은 특정 판사의 안정적 또는 느리게 변하는 **해석 경향 묶음**이다. party, law firm, 원하는 outcome, 개별 사건 승패표를 저장하지 않는다.

- World는 stable `judge_id`, profile history와 public judicial history의 소유자다.
- Litigation evaluation은 해당 Case/Stage에 배정된 judge의 immutable `JudgeProfileVersion`을 참조한다.
- profile은 “무엇을 참으로 고른다”가 아니라 criterion-declared choice point에서 어떤 qualitative option과 연결되는지 표현한다.
- 판결 결과 history는 profile의 직접 input table이 아니다.
- 한 사건용 override 또는 결과 지향 patch는 금지한다. 실제 profile 변화가 필요하면 새 version과 이유가 필요하다.

Judge assignment, recusal, multi-judge panel, 합의부 내부 의사결정은 **TBD**다.

## 4. J2 — Trait domains

### 후보 묶음 비교

| 후보 | 포함 영역 | 장점 | 위험 | 판단 |
|---|---|---|---|---|
| A. 자료 유형 선호 중심 | 문서 선호, 증언 불신, 전문가 신뢰 | 이해 쉬움 | “문서 +1, 증언 -1”의 secret weighting으로 붕괴 | 미추천 |
| B. 광범위한 판사 personality catalog | 엄격함, 공감, 권위, 기분, 효율, 성향 등 | 캐릭터 다양성 | fact finding과 무관한 성격이 outcome modifier가 됨 | **Forbidden** as core fact model |
| C. criterion choice와 직접 연결되는 최소 해석 domain | credibility qualification, inference linkage, scope precision, conflict/corroboration treatment | explanation과 hard boundary 연결 가능 | domain authoring이 느슨하면 outcome switch | **Accepted** |

### 최소 viable set

**J2-C — Accepted.** 아래 네 domain은 **minimum v1 domain set**으로 채택한다. 이는 exhaustive하거나 permanently canonical한 taxonomy가 아니다. Future domain은 이 문서가 채택한 hard boundaries를 모두 보존하는 경우에만 추가할 수 있다.

| domain | 다루는 질문 | 허용 예 | 금지할 도약 |
|---|---|---|---|
| `credibility_qualification` | criterion이 명시한 contested/qualified credibility를 어느 permitted 방식으로 처리하는가? | 명시된 inconsistency를 제한 범위 신뢰 또는 unresolved로 취급 | 증언 유형 전체 감점, witness truth 자동 판정 |
| `inference_linkage` | criterion이 연 둘 이상의 circumstantial linkage 중 어느 것을 허용하는가? | 연결을 해당 scope에서 허용하거나 direct link를 요구 | 누락 evidence 생성, causation/legal effect 생성 |
| `scope_precision` | ambiguous wording/content scope를 어느 permitted boundary로 읽는가? | 좁은 문구 범위 또는 criterion이 허용한 넓은 범위 | 미제출 전문 복원, 사실 scope 생성 |
| `conflict_corroboration_treatment` | criterion이 허용한 conflict/corroboration 처리 중 어느 option을 택하는가? | conflict를 blocking으로 유지하거나 명시된 제한 범위에서 처리 | evidence-count 다수결, hidden weight, duplicate 강화 |

다음 후보는 첫 pass trait domain으로 채택하지 않는다.

- **Documentary evidence preference:** 자료 유형 자체의 보너스로 오용되기 쉽다. 특정 문서/증언 차이가 중요하면 criterion choice point와 실제 content reason으로 표현한다.
- **Sensitivity to procedural defects:** admissibility 또는 procedural effect 소유권과 충돌할 수 있다. 외부 절차가 allowed scope를 정한 뒤 profile이 이를 뒤집을 수 없다. 별도 procedural design 없이는 **TBD**다.
- **Treatment of expert explanation:** 전문가 직함 선호는 금지한다. criterion이 expert explanation의 특정 전제·명확성에 genuine ambiguity를 열 때 `credibility_qualification` 또는 `scope_precision`에서만 다룬다.
- **General strictness/leniency:** requirement 삭제·scope 생성으로 이어질 수 있어 domain으로 채택하지 않는다.

Domain naming, subtype, 실제 콘텐츠 coverage는 **TBD**다. 이 네 domain은 실제 한국법의 판사 성향 분류가 아니다.

## 5. J3 — Trait representation

### 선택지

| 대안 | 표현 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. numeric sliders | directness 0~100, tolerance -10~+10 | tuning 쉬움 | hidden arithmetic와 threshold가 사실상 win bonus | **Forbidden** |
| B. ordinal qualitative states | low / medium / high | readable | 내부에서 1/2/3 점수로 쉽게 환원, choice mapping 불명확 | 단독 모델로 미추천 |
| C. loose tagged tendencies | `document_favoring`, `strict` | authoring 간단 | tag가 결과를 직접 고르는 hidden condition | 단독 모델로 부족 |
| D. rule-linked qualitative tendency | domain + tendency key + applicability + criterion policy mapping | 어떤 trait가 어떤 option을 택했는지 추적 | mapping validation 필요 | **Accepted / Core Accepted** |

### 채택

**J3-D — Accepted / Core Accepted.** 각 `JudgeTrait`은 다음 의미를 가진다.

- one qualitative `trait_domain`.
- stable `tendency_key`; 예: `requires_explicit_link` 또는 `accepts_bounded_circumstantial_link`. 이는 숫자 서열이 아니다.
- 적용 가능한 scope/category reference. 모든 evidence에 전역 적용하지 않는다.
- 허용된 `JudgeInterpretationPolicy` mapping reference.
- origin/version/reason reference. public disclosure 여부와는 별도다.

Trait는 option을 직접 생성하지 않는다. criterion choice point가 제공한 permitted options 가운데 policy mapping과 정확히 일치하는 option만 선택할 수 있다.

여러 trait가 하나의 choice point에 동시에 매칭되고 서로 다른 option을 요구하면:

- 숫자 priority나 임의 tie-break를 사용하지 않는다.
- authoring이 explicit non-overlap 또는 explicit deterministic precedence relation을 제공해야 한다.
- 그 relation이 없으면 derivation은 invalid/`undetermined`이고 `[JudgeInterpretation derivation 기준 미정]`으로 중단한다.

Exact precedence vocabulary와 validator는 **TBD**다.

## 6. J4 — JudgeProfile → JudgeInterpretationInput derivation

### 대안

| 대안 | 방식 | 위험 | 판단 |
|---|---|---|---|
| A. profile에서 finding status 직접 출력 | 단순 | free outcome switch | **Forbidden** |
| B. profile trait를 sufficiency score에 합산 | 조정 쉬움 | hidden win-rate modifier | **Forbidden** |
| C. criterion choice point activation 뒤 applicable rule-linked trait가 permitted option을 선택하고 explicit input 생성 | hard boundary와 설명 가능성 유지 | choice point/trait mapping 필요 | **Accepted / Core Accepted** |

### 채택한 derivation contract

**J4-C — Accepted / Core Accepted.** 다음은 semantic dependency order이며 API나 implementation algorithm이 아니다.

```text
1. Fixed evaluation inputs resolve
   Case + Stage + CourtRecordSnapshot + FactProposition/scope
   + RecognitionCriterion/version + EvidenceUse/credibility/lineage/conflict

2. Hard evaluation runs
   clearly sufficient / clearly insufficient / missing rule-input 확인

3. CriterionChoicePoint activation validates
   criterion-declared + genuine ambiguity + affected requirement/scope

4. JudgeProfileVersion resolves
   JudgeArchetypeVersion baseline + explicit individual overrides

5. Applicable JudgeTrait matches
   trait domain/scope + choice point policy link

6. Permitted option resolves deterministically
   exactly one allowed option or valid declared fallback

7. JudgeInterpretationInput records
   profile version + trait + choice point + permitted option + affected scope + reason

8. Requirement resolution consumes the explicit input
   only within the choice point boundary

9. CourtFactFinding uses DEC-012 canonical transition
```

Hard outcomes bypass steps 4~8. Profile lookup이 수행되더라도 hard result를 바꾸는 effect를 생성하면 실패다.

Choice point에 applicable trait가 없거나 mapping이 없을 때:

- profile이 임의 option을 고르지 않는다.
- criterion이 명시한 profile-independent permitted fallback이 있으면 그 rule만 사용할 수 있다.
- fallback도 없고 choice가 결과에 필요하면 `JudgeInterpretationInput`을 만들지 않고 evaluation은 `undetermined` + 명시 reason으로 중단한다.

Derivation이 완료되지 못한 경우에는 적어도 다음 semantic reason 구별을 보존한다.

- `judge_interpretation_mapping_missing`: active choice point에 적용 가능한 trait/policy mapping이 없다.
- `judge_interpretation_mapping_conflict`: 둘 이상의 applicable mapping이 서로 양립할 수 없는 permitted option을 요구하고 명시적 deterministic precedence가 없다.
- `judge_interpretation_fallback_missing`: 필요한 mapping을 얻지 못했고 criterion에도 사용할 수 있는 declared fallback이 없다.

이들은 중단 원인을 설명하는 **reason categories**이지 새로운 `CourtFactFinding` status가 아니다. 최종 상태는 DEC-011의 네 canonical states만 사용한다.

Fallback의 실제 legal/content policy는 **TBD**다. “중간값”이나 random choice를 기본값으로 만들지 않는다.

## 7. J5 — Genuine ambiguity validation

### 구별해야 할 두 구조

| A. genuine record/criterion ambiguity | B. disguised outcome switch |
|---|---|
| 같은 allowed record가 criterion상 둘 이상의 semantic reading/resolution을 허용 | profile tag에 따라 `recognized`/`not_established`를 직접 선택 |
| choice point가 특정 requirement/scope와 연결 | case/party/outcome 전체를 target |
| 각 option이 evidence content/credibility/inference/conflict의 다른 permitted treatment를 설명 | option 이름만 다르고 semantic 처리 없이 결과만 다름 |
| option 모두 requirement를 삭제·증거를 생성하지 않음 | lenient option이 missing scope를 채우거나 strict option이 requirement를 삭제 |
| activation condition이 profile을 보기 전에 record/criterion에서 확인됨 | 원하는 결과/profile을 본 뒤 choice point를 생성 |

### 최소 semantic validation constraints

**J5 — Core Accepted.** `CriterionChoicePoint`는 적어도 다음을 만족해야 한다.

1. immutable criterion/version과 stable choice-point identity에 속한다.
2. target `CriterionRequirement`와 `PropositionScope`를 명시한다.
3. activation condition은 allowed record와 이미 존재하는 evaluation trace만 참조한다.
4. profile/party/law firm/outcome을 보지 않고 먼저 activation 가능해야 한다.
5. 둘 이상의 permitted option 각각이 semantic treatment와 reason boundary를 가진다.
6. option은 evidence, fact scope, requirement, alternative path를 생성·삭제하지 않는다.
7. option은 target scope 밖 판단에 effect를 전파하지 않는다.
8. hard-sufficient/hard-insufficient result에서는 activation하지 않는다.
9. direct canonical status 또는 claim outcome을 option payload로 삼지 않는다.
10. 왜 options가 같은 criterion 아래 permissible한지 authority/content reason reference가 있다.

다음이면 invalid authoring candidate다.

- profile 이름만 바꾸면 choice point가 생기거나 사라진다.
- option 차이가 “원고 승/피고 승”, “인정/미인정”뿐이고 evidence treatment 차이가 없다.
- choice point가 missing EvidenceUse를 채우거나 criterion requirement를 면제한다.
- record가 바뀌지 않았는데 원하는 서사를 위해 activation condition을 사후 변경한다.

Invalid choice point는 finding option으로 사용하지 않는다. content validation 단계에서 reject한다. runtime까지 도달했으나 validation 기준이 불완전하면 `undetermined`와 명시 error/TBD로 중단한다.

정적 validation algorithm, authoring UI, authority 검토 책임, semantic equivalence 판별은 **TBD**다. 본 절은 상세 tooling을 설계하지 않는다.

## 8. J6 — Hard-boundary invariants

**J6 — Core Accepted.** JudgeProfile, JudgeTrait, JudgeInterpretationPolicy와 JudgeInterpretationInput은 다음을 절대 할 수 없다.

1. evidence, statement, corroborating source 또는 supporting `EvidenceUse` 생성.
2. missing `PropositionScope` 또는 missing coverage 생성.
3. `ActualStateRecord` 접근 또는 truth comparison 사용.
4. unsubmitted, unreceived, unallowed material 사용.
5. criterion requirement 삭제, 완화, 교체.
6. criterion이 선언하지 않은 alternative path 생성.
7. clearly insufficient record를 `recognized`/`recognized_limited`로 변경.
8. permitted ambiguity 없는 clearly sufficient hard result를 뒤집기.
9. flat +/- percentage, numeric strength, hidden weight 사용.
10. lawyer reputation, firm prestige 또는 party identity bonus 사용.
11. final RNG, personality RNG, mood RNG 또는 random tie-break 사용.
12. contrary fact를 failure of proof만으로 인정.
13. fifth `CourtFactFinding` status 생성.
14. 결과를 먼저 고르고 profile explanation을 사후 생성.

이 중 하나라도 가능한 profile schema나 policy mapping은 invalid다.

## 9. J7 — Borderline-only influence

### 허용 후보

**J7 — Accepted.** 다음 영역은 criterion이 둘 이상의 option과 activation condition을 명시한 경우에만 permissible하다.

| borderline area | choice point가 명시해야 할 것 | 금지할 해석 |
|---|---|---|
| disputed credibility | 정확한 statement/scope, 두 permitted credibility treatments, materiality | witness 전체 truth/lie 판정 |
| ambiguous wording scope | 허용된 좁은/넓은 content boundary와 근거 | 미제출 전문 또는 새 문구 생성 |
| circumstantial linkage | existing links, target requirement, permitted link treatments | missing link/evidence 생성 |
| unresolved conflict disposition | 양측 evidence, conflict scope, 둘 이상의 criterion-permitted treatments | evidence count majority, losing evidence 삭제 |
| corroboration clarity | existing independent lineage inputs와 permitted treatment | duplicate를 independent로 승격 |

다음은 borderline influence가 아니다.

- mandatory scope에 supporting EvidenceUse가 전혀 없음.
- criterion이 하나의 처리만 허용함.
- criterion이나 conflict rule 자체가 missing임.
- record가 clearly sufficient/insufficient임.
- admissibility/allowed scope를 profile이 다시 판단하려 함.
- party identity, firm prestige, lawyer fame 또는 desired drama만 다름.

실제 한국법에서 어떤 ambiguity가 허용되는지와 choice option 내용은 **TBD**이며 criterion/content가 외부에서 제공해야 한다.

## 10. J8 — Determinism

### 대안

| 대안 | 방식 | 위험 | 판단 |
|---|---|---|---|
| A. 매 evaluation random mood | 다양성 | replay 불가, 준비 의미 훼손 | **Forbidden** |
| B. fixed profile score + random tie-break | 편리 | hidden arithmetic와 마지막 추첨 | **Forbidden** |
| C. immutable versions와 explicit mapping의 deterministic derivation | 재현·감사 가능 | version discipline 필요 | **Core Accepted** |

**J8-C — Core Accepted.** 다음 semantic inputs가 같으면 derived `JudgeInterpretationInput`의 의미도 같아야 한다.

- `judge_id`와 `JudgeProfileVersion`.
- `JudgeArchetypeVersion` 및 resolved overrides.
- criterion/version과 `CriterionChoicePoint`.
- Case/Stage, `CourtRecordSnapshot`, proposition/scope.
- EvidenceUse, credibility, lineage, conflict와 activation inputs.
- applicable policy mapping/version과 command order.

같아야 할 output semantics는 selected permitted option, affected requirement/scope, relevant trait/policy reason과 no-effect reason이다. execution ID, timestamp 같은 비의미 metadata는 다를 수 있다. byte-identical serialization 여부는 **TBD**다.

Judge-personality RNG, random mood, time-of-day roll, hash iteration tie-break는 **Forbidden**이다.

## 11. J9 — Explainability

### 내부 derivation trace

**J9 — Core Accepted.** 최소 internal trace는 다음을 포함한다.

1. Case, Stage, CourtRecordSnapshot와 FactProposition/scope.
2. criterion/version과 activated `CriterionChoicePoint`.
3. hard-result gate가 ambiguity influence를 허용한 이유.
4. `judge_id`, `JudgeProfileVersion`, resolved `JudgeArchetypeVersion`.
5. applicable `JudgeTrait` domain/tendency와 individual override 여부.
6. trait-to-choice `JudgeInterpretationPolicy` mapping/version.
7. permitted options와 실제 선택 option.
8. affected requirement/scope와 no-effect boundaries.
9. derived `JudgeInterpretationInput` identity/version/reason.
10. requirement resolution과 resulting canonical CourtFactFinding reference.
11. mapping 없음, conflict 또는 invalid choice point로 중단한 reason.

Trace는 결과 뒤에 꾸민 narrative가 아니라 실제 derivation dependency를 보존해야 한다.

### Player-facing explanation

Public explanation은 접근 가능한 record와 공개 가능한 판사 정보만으로 구성한 projection이다. 다음 수준의 문장은 가능하다.

- “이 판단에서는 간접 연결을 해당 범위에서 충분한 설명으로 받아들였다.”
- “해당 진술의 불일치는 그 부분의 신빙성 판단을 유보하게 했다.”
- “이 판사는 공개된 과거 판단에서도 명시적 연결 설명을 중시하는 경향을 보였다.” — 실제 공개 history가 있을 때만 가능.

다음은 공개하면 안 된다.

- hidden numeric score, internal weighting 또는 secret probability.
- 접근할 수 없는 private profile details, hidden history, unsubmitted evidence.
- ActualStateRecord 또는 debug truth.
- outcome을 먼저 선택했다는 흔적을 감추는 사후 이유.

Profile/trait의 player disclosure level과 관찰·추론 UI는 **TBD**다.

## 12. J10 — Profile evolution

### 대안

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. profile 영구 고정 | 재현 단순 | 장기 세계 변화와 경력 반영 제한 | baseline으로 가능하나 전체 방향으로 부족 |
| B. 사건마다 mood/profile 갱신 | 다양성 | outcome-driven drift, RNG, 과거 재현 소멸 | **Forbidden** |
| C. immutable version history와 explicit slow-change events | identity와 변화·재현 양립 | trigger authoring 필요 | **Accepted** |

**J10-C — Accepted.** JudgeProfile은 시간이 지나며 바뀔 수 있으나 immutable version으로 보존한다.

- 과거 evaluation은 당시 `JudgeProfileVersion`을 영구 참조한다.
- 이후 경력·역할과 연결된 **explicit world-level evolution rule/event**가 변화를 정당화할 때만 새 immutable `JudgeProfileVersion`을 만든다.
- 새 version은 이후 evaluation에만 적용하고 과거 finding·reason을 재작성하지 않는다.
- 단일 case outcome, win/loss result, 특정 litigant와의 interaction 또는 one-off player encounter는 `JudgeProfile` trait를 직접 또는 자동으로 바꾸지 않는다.
- daily mood, fatigue roll, random phase는 도입하지 않는다.

정확한 evolution trigger, 변화 속도, 누가 authoring/validation하는지는 **TBD**다. “slowly changing”은 수치 기간을 확정하지 않는다.

## 13. J11 — Reputation / lawyer skill / firm prestige interaction

### 선택지

| 대안 | 방식 | 위험 | 판단 |
|---|---|---|---|
| A. 유명 변호사/로펌이면 favorable option 확률 상승 | progression 체감 | prestige bias modifier, record 무력화 | **Forbidden** |
| B. skill이 profile trait를 일시 변경 | 변호사 영향 표현 | judge identity와 sufficiency boundary 혼합 | **Forbidden** |
| C. skill/reputation/prestige는 기존 시스템 경로로 실제 record content와 preparation을 바꾸고, fixed record에서는 interpretation input에 영향 없음 | preparation 의미 유지 | 간접 경로 추적 필요 | **Accepted / Core Accepted** |

**J11-C — Accepted / Core Accepted.** Lawyer skill, reputation과 firm prestige는:

- 질문 발견, 조사, evidence 확보, submission의 명확성, argument framing, response preparation, negotiation 등에 실제 차이를 만들 수 있다.
- 그 결과 allowed record content, EvidenceUse mapping 또는 설명의 명확성이 실제로 달라지면 evaluation input이 달라질 수 있다.
- 동일 record, criterion, profile, choice point가 고정된 상태에서는 `JudgeInterpretationInput`을 직접 바꾸지 않는다.
- 판사에게 접근 불가능한 내부 expertise/AP/WorkProduct는 effect가 없다.

Party identity나 prestige를 choice-point activation condition, trait mapping 또는 permitted option selector에 넣는 것은 **Forbidden**이다.

## 14. J12 — Judge individuality vs archetype

### 대안

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A. 모든 judge 완전 unique profile | 개성 최대 | large-world authoring/validation 비용, 일관성 약화 | 주요 판사에는 가능하나 기본 모델로 과함 |
| B. pure archetype | 규모 확장 쉬움 | 같은 archetype이 clone, 개인 history 무의미 | 미추천 |
| C. versioned archetype baseline + explicit individual overrides + resolved immutable profile version | 확장성과 개성 균형 | override conflict/precedence validation 필요 | **Accepted** |

**J12-C — Accepted.** 채택 구조는 다음과 같다.

```text
JudgeArchetypeVersion
  + Judge-specific qualitative overrides
  + explicit profile history metadata
  → resolved immutable JudgeProfileVersion
```

- Archetype은 full outcome style이 아니라 default rule-linked trait set이다.
- Individual override는 명시된 trait domain/tendency만 교체·추가한다.
- Override는 party/case/outcome 조건을 가질 수 없다.
- Evaluation은 archetype과 override를 매번 동적으로 합산하지 않고 resolved profile version을 참조한다.
- 두 judge가 같은 archetype이어도 explicit overrides가 다르면 genuine ambiguity에서 bounded difference가 가능하다.
- override가 없으면 같은 archetype/version은 같은 applicable input에서 같은 interpretation semantics를 낸다.

Archetype catalog, override count, automatic judge generation과 conflict precedence는 **TBD**다.

## 15. J13 — Compatibility with world simulation

**J13 — Accepted / Core Accepted.** Judge identity는 cases 사이에서 stable해야 한다.

- World는 judge identity, assignment-eligible existence, profile version history와 public judicial history를 보존한다.
- Litigation은 실제 배정된 judge/profile version과 allowed case record만 사용한다.
- 과거 decisions는 `JudicialHistorySummary`의 근거가 되어 플레이어가 관찰 가능한 경향을 형성할 수 있다.
- public history는 profile disclosure의 evidence일 수 있지만 future finding에 직접 더하는 modifier가 아니다.
- win/loss rate, plaintiff success rate, reversal rate 같은 outcome statistics는 future `JudgeInterpretationInput`을 직접 바꾸지 않는다.
- profile evolution은 명시적 event/rule로 새 version을 만들 때만 가능하고 history statistic 자체가 자동 input은 아니다.
- NPC 축약 simulation도 judge identity/profile version/주요 public decision reason을 보존해야 하며 결과 횟수만으로 trait를 소급 생성하지 않는다.

Judge assignment policy, regional/court hierarchy, panel composition, public reputation aggregation, NPC resolution detail은 **TBD**다.

## 16. Alternatives considered — consolidated

| rejected model | rejection reason | status |
|---|---|---|
| judge favorability score | party/case별 outcome expectation을 record 밖 bonus로 만듦 | **Forbidden** |
| plaintiff-friendly +10% | flat percentage가 criterion requirement를 우회 | **Forbidden** |
| defense-friendly -5% | party identity와 hidden probability 결합 | **Forbidden** |
| prestige bias modifier | firm/lawyer reputation이 fact recognition을 직접 변경 | **Forbidden** |
| random mood | identical input determinism 위반 | **Forbidden** |
| secret evidence weighting | relevance/credibility/sufficiency를 hidden arithmetic으로 붕괴 | **Forbidden** |
| auto-win archetype | archetype이 record와 criterion을 대체 | **Forbidden** |
| “strict judge” deletes requirements | strictness가 criterion path를 재작성 | **Forbidden** |
| “lenient judge” fills missing scope | personality가 evidence/fact를 생성 | **Forbidden** |
| outcome lookup table by personality | result-first model, proposition reasoning 소멸 | **Forbidden** |
| retrospective explanation after outcome selection | DEC-007 J9와 DEC-012 trace boundary 위반 | **Forbidden** |
| broad document/expert preference bonus | source type/title을 credibility 또는 sufficiency 보너스로 사용 | **Forbidden** unless a criterion-declared content ambiguity is actually evaluated |
| random tie-break between traits | same profile/input replay가 달라짐 | **Forbidden** |

## 17. Recommended minimum model

다음 조합을 최소 모델로 채택한다.

1. **Persistent identity:** World-owned stable `judge_id`와 append-only `JudgeProfileVersion` history.
2. **Scalable individuality:** versioned `JudgeArchetype` baseline + explicit qualitative individual overrides → resolved immutable profile.
3. **Four minimum trait domains:** credibility qualification, inference linkage, scope precision, conflict/corroboration treatment.
4. **Rule-linked traits:** numeric slider가 아니라 criterion choice option과 연결되는 qualitative tendency/policy.
5. **Hard-first gate:** clearly sufficient/insufficient와 missing-rule states를 먼저 처리하고 genuine ambiguity에서만 profile 사용.
6. **Explicit derivation artifact:** profile은 직접 finding을 바꾸지 않고 `JudgeInterpretationInput`을 생성.
7. **Choice-point validation:** record/criterion-based activation, semantic options, affected requirement/scope, no result payload.
8. **Deterministic conflict handling:** exactly one applicable mapping; multiple incompatible mappings이면 random 선택 없이 invalid/undetermined.
9. **Trace/public separation:** profile version, trait, choice, reason을 internal trace에 남기고 disclosure-filtered explanation만 공개.
10. **No direct prestige/history bonus:** actual record 변화만 downstream effect를 가질 수 있음.

### Minimal operational boundary

```text
Hard evaluation result?
├─ clearly sufficient → finding; profile has no effect
├─ clearly insufficient → finding; profile has no effect
├─ required rule/input missing → undetermined; profile cannot fill gap
└─ criterion-declared genuine ambiguity active
   ├─ exactly one valid trait-policy mapping → explicit JII → bounded resolution
   ├─ criterion-declared fallback → fallback rule, not personality guess
   └─ no/ambiguous mapping and no fallback → undetermined + derivation reason
```

## 18. Semantic reference model

아래 구조는 semantic reference일 뿐 canonical Godot class, JSON, save schema 또는 API가 아니다. 구현 시 합치거나 나눌 수 있으나 의미 경계는 보존해야 한다.

| semantic structure | 최소 의미 정보 | 경계 |
|---|---|---|
| `JudgeProfile` | stable judge ref, current version ref, version history refs | case result table이 아님 |
| `JudgeProfileVersion` | immutable version, effective context/time ref, archetype version, resolved traits, override refs, change reason | 과거 decision을 재작성하지 않음 |
| `JudgeTrait` | domain, qualitative tendency key, applicability scope, policy ref, origin/reason | numeric stat/weight 아님 |
| `JudgeArchetype` | archetype identity와 version history | auto-win personality class가 아님 |
| `JudgeArchetypeVersion` | immutable default rule-linked traits | individual judge identity를 대체하지 않음 |
| `JudgeTraitOverride` | judge-specific domain/tendency replacement/addition, reason, effective profile version | party/case/outcome override 금지 |
| `JudgeInterpretationPolicy` | trait-domain/tendency와 compatible choice-point category/permitted option의 deterministic mapping | option 또는 requirement 생성 금지 |
| `CriterionChoicePoint` | criterion/version owner, target requirement/scope, activation condition, permitted semantic options, reason/authority ref | direct finding/claim outcome payload 금지 |
| `JudgeInterpretationInput` | input identity/version, judge/profile version, choice-point ref, trait/policy ref, permitted option, affected scope, reason | CourtFactFinding을 직접 소유하지 않음 |
| `JudgeInterpretationTrace` | hard gates, profile resolution, applicable mapping, option, no-effect/invalid reasons, resulting requirement ref | public explanation과 별도 |
| `JudicialHistorySummary` | judge identity, public prior decision refs, observable reason patterns, disclosure basis | future outcome modifier가 아님 |

### Semantic validation boundaries

- evaluation이 참조한 profile version은 immutable하고 judge identity와 연결된다.
- choice point는 criterion/version, target requirement/scope와 연결된다.
- choice point activation은 profile을 읽기 전에 allowed record에서 판별된다.
- selected option은 choice point의 permitted option 집합 안에 있다.
- policy mapping은 applicable domain/scope에 exact match하고 deterministic하다.
- individual override는 party/case/outcome을 조건으로 삼지 않는다.
- JII는 evidence/requirement/scope/path를 생성·삭제하지 않는다.
- hard-sufficient/insufficient evaluation에는 effective JII가 없다.
- trace에서 profile → trait/policy → choice point → option → requirement resolution까지 역추적된다.
- public history/statistics는 direct interpretation input이 아니다.

Exact fields, IDs, normalization과 validator implementation은 **TBD**다.

## 19. Core invariants

1. **No direct profile effect:** JudgeProfile은 CourtFactFinding을 직접 변경하지 않는다.
2. **Criterion owns choices:** permitted options와 activation boundary는 versioned criterion이 소유한다.
3. **Genuine ambiguity only:** choice point는 record/criterion이 실제로 둘 이상의 permissible interpretation을 남길 때만 활성화된다.
4. **No disguised outcome switch:** option은 canonical finding이나 party outcome을 직접 선택하지 않는다.
5. **Hard results invariant:** clearly sufficient/insufficient record는 profile 차이로 바뀌지 않는다.
6. **Allowed record only:** ActualStateRecord, hidden AP, 미제출/미수신/미허용 자료는 입력이 아니다.
7. **No evidence/scope creation:** personality는 record gap을 채우지 않는다.
8. **No requirement/path mutation:** profile은 criterion structure를 삭제·추가하지 않는다.
9. **Qualitative, rule-linked traits:** numeric sliders, hidden weights, percentages를 사용하지 않는다.
10. **No prestige/reputation shortcut:** lawyer/firm identity는 fixed record의 JII를 바꾸지 않는다.
11. **Deterministic derivation:** 동일 versions/record/choice inputs는 동일 JII semantics를 낸다.
12. **No judge RNG:** mood, tie-break, final result RNG가 없다.
13. **Version preservation:** 과거 evaluation은 당시 profile/archetype/policy versions를 보존한다.
14. **Actual trace:** explanation은 실제 derivation trace에서 나오며 사후 합리화하지 않는다.
15. **Fact/adjudication separation:** JII는 requirement resolution input이며 claim result가 아니다.
16. **Stable world identity:** judge history는 cases 사이에서 이어지지만 outcome statistic은 direct modifier가 아니다.

## 20. Pressure-test examples

모든 예시는 synthetic semantic fixture이며 실제 한국법·판사 행동의 진술이 아니다. `C-*`, `CP-*`, `JP-*`, `JI-*`는 명시적 주입 참조다.

### 20.1 Same hard-sufficient record under two judge profiles

- **Input:** 동일 record/proposition/C-1. Hard evaluation이 모든 mandatory requirements를 충족. JP-A와 JP-B는 다른 traits.
- **May evaluate:** hard-result gate까지만.
- **Must not happen:** choice point 생성, profile modifier, finding reversal.
- **Expected:** 두 evaluation 모두 `recognized`; effective JII 없음 또는 no-effect trace.

### 20.2 Same hard-insufficient record under two judge profiles

- **Input:** mandatory S2에 EvidenceUse 없음. Criterion complete. JP-A/JP-B 다름.
- **May evaluate:** missing coverage와 hard insufficiency.
- **Must not happen:** lenient trait가 S2 생성/면제.
- **Expected:** 둘 다 `not_established_on_record`.

### 20.3 Genuine circumstantial-link ambiguity

- **Input:** C-3/CP-3이 same existing links에 `accept_bounded_link`와 `require_direct_link`를 permitted options로 선언. JP-A/JP-B가 각각 rule-linked trait에 매칭.
- **May evaluate:** CP-3 target requirement/scope만.
- **Must not happen:** 새 link/evidence/path 생성, scope 밖 전파.
- **Expected:** derived JI-A/JI-B가 서로 다른 permitted options를 기록하고 bounded requirement outcome이 달라질 수 있음.

### 20.4 Ambiguous witness inconsistency handling

- **Input:** allowed witness statement의 특정 부분에 명시된 inconsistency. C-4/CP-4는 `limited_for_scope`와 `remain_disputed`를 허용. 두 profiles가 각 mapping을 가짐.
- **May evaluate:** 지정 statement/scope의 credibility qualification.
- **Must not happen:** witness 전체 truth/lie 판정, opposite fact 생성.
- **Expected:** 차이는 CP-4 범위의 credibility treatment에만 남음.

### 20.5 No declared choice point

- **Input:** same record와 different profiles, criterion에는 choice point 없음.
- **May evaluate:** hard criterion rules만.
- **Must not happen:** profile이 ambiguity나 option을 생성.
- **Expected:** effective JII 없음; 동일 hard evaluation result 또는 rule missing이면 동일 `undetermined`.

### 20.6 Profile trait irrelevant to current choice point

- **Input:** active CP-6 domain은 `scope_precision`; profile trait는 오직 `credibility_qualification`.
- **May evaluate:** applicability mismatch와 fallback 존재 여부.
- **Must not happen:** unrelated trait를 broad “strictness”로 재해석.
- **Expected:** trait has no effect. criterion fallback이 없고 choice가 필요하면 `undetermined` + no applicable mapping reason.

### 20.7 Same profile + same inputs replay

- **Input:** same profile/archetype/policy/criterion versions, record, proposition, CP, command order.
- **May evaluate:** JII semantic equivalence.
- **Must not happen:** mood/random tie-break/current-time variation.
- **Expected:** same choice point, option, affected scope와 reason.

### 20.8 Profile version changes between later stages/cases

- **Input:** earlier evaluation uses JP-v1; explicit world event produces JP-v2 before later evaluation. Record/criterion references are independently fixed per evaluation.
- **May evaluate:** version selection and history preservation.
- **Must not happen:** earlier finding/trace rewritten with v2.
- **Expected:** old decision retains v1. Later evaluation may derive different JII only from v2 plus a genuine active choice point.

### 20.9 Prestige/lawyer reputation changes but record fixed

- **Input:** same judge/profile, criterion, record and CP; only lawyer reputation/firm prestige metadata changes.
- **May evaluate:** forbidden-input non-interference.
- **Must not happen:** option/probability/favorability change.
- **Expected:** same JII semantics and finding.

### 20.10 Presentation/content changes while judge profile fixed

- **Input:** same profile/criterion. Variant B has an actually allowed, clearer submission/content link than A.
- **May evaluate:** new record content, changed activation condition 또는 hard coverage.
- **Must not happen:** 변화 이유를 profile bonus로 설명.
- **Expected:** evaluation/JII/finding may change because record changed; trace points to changed content.

### 20.11 Disguised outcome-switch authoring attempt

- **Input:** CP-11 options are `plaintiff_wins` and `defendant_wins`, or `recognized` and `not_established`, without semantic evidence treatment.
- **May evaluate:** minimum choice-point validation only.
- **Must not happen:** profile이 option을 선택하고 결과 생성.
- **Expected:** invalid/rejected. Runtime까지 도달하고 detailed validator가 없으면 `undetermined` + authoring/validation TBD; 절대 genuine ambiguity로 수용하지 않음.

### 20.12 Same archetype with distinct overrides

- **Input:** Judge A/B share Archetype AR-v1. A overrides `inference_linkage`; B inherits baseline. Same genuine CP-12 is active.
- **May evaluate:** resolved profile versions and explicit domain override.
- **Must not happen:** override가 unrelated requirements 또는 hard result에 영향.
- **Expected:** bounded JII difference is possible at CP-12; outside it behavior remains same.

## 21. Explicit TBD list

1. 실제 한국법상 judicial discretion, evidentiary interpretation과 criterion option content.
2. canonical trait domain/tendency catalog와 content coverage.
3. trait applicability, specificity와 multiple-match precedence vocabulary.
4. `RecognitionCriterion` choice-point authoring language와 activation predicate format.
5. genuine ambiguity의 static/dynamic validation algorithm과 semantic equivalence 판별.
6. authority/content review 책임과 invalid content handling workflow.
7. JudgeProfile-to-JudgeInterpretationInput derivation의 canonical implementation/API.
8. criterion-declared fallback의 실제 content/legal policy.
9. JudgeArchetype catalog, individual override limits와 automatic judge generation.
10. profile evolution triggers, rate, source events와 validation.
11. multi-judge panel, 합의부, recusal, reassignment와 judge substitution.
12. procedural-defect sensitivity, admissibility interaction과 court-level constraints.
13. profile/trait/public history disclosure, observation, uncertainty와 UI.
14. JudicialHistorySummary aggregation과 public reason extraction.
15. appellate/remand에서 judge/profile 변경이 prior finding에 미치는 실제 법적 효과.
16. byte determinism, serialization, save/load와 migration.
17. judge AI, opponent AI, NLP, performance와 Godot implementation.
18. 판사 error/bias/corruption/discipline를 게임에 도입할지 여부와 별도 경계.

## 22. Risks / anti-patterns

| risk | failure condition | mitigation direction |
|---|---|---|
| trait가 hidden score가 됨 | ordinal/tag를 내부 숫자로 합산 | permitted option과 exact rule link만 허용 |
| choice point 남발 | 모든 close result에 personality switch 삽입 | hard-first gate와 target requirement/scope 요구 |
| disguised outcome switch | semantic treatment 없이 result만 다른 options | direct status/outcome payload 금지, invalid/reject |
| archetype clone | 같은 archetype judge가 모두 동일 캐릭터 | explicit overrides + public history; hard boundary는 공통 |
| override chaos | 많은 overlapping overrides가 충돌 | resolved immutable profile, conflict 시 중단 |
| profile drift | 승패 통계로 매 사건 trait 변경 | explicit versioned event/rule만 허용 |
| false explainability | outcome 뒤 trait reason 생성 | actual derivation trace 보존 |
| prestige leakage | 유명 변호사 metadata가 option selector에 포함 | fixed-record non-interference test |
| type favoritism | document/expert title이 evidence bonus | actual content/criterion ambiguity만 사용 |
| procedural leakage | profile이 allowed/admissibility를 재결정 | external allowed snapshot을 hard boundary로 소비 |
| random individuality | mood/RNG로 judge 차이 생성 | deterministic profile/choice mapping |
| world-stat modifier | prior plaintiff win rate가 다음 finding에 영향 | history는 관찰/설명 자료, direct input 금지 |

## 23. Proposed first-pass TEST-012 plan

`TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md`는 아직 만들지 않는다. 첫 pass는 **10 core cases**의 manual / fixture-level verification을 추천한다.

| # | core case | 핵심 입력 | 반드시 확인할 결과 |
|---|---|---|---|
| 1 | hard-result profile non-interference | hard-sufficient와 hard-insufficient record 각각에 two profiles | sufficient/insufficient result 불변, effective JII 없음 |
| 2 | genuine circumstantial ambiguity derivation | criterion CP + two profiles/traits | explicit permitted JI options만 도출, bounded difference |
| 3 | credibility qualification boundary | scoped disputed statement + declared options | witness 전체/contrary fact로 확대 금지 |
| 4 | no choice / irrelevant trait | no CP variant와 domain mismatch variant | profile effect 없음; fallback 없으면 명시적 undetermined |
| 5 | disguised outcome-switch attack | direct status/party-outcome options | invalid/rejected/TBD, finding option으로 사용 금지 |
| 6 | deterministic replay | same profile/criterion/policy/record/commands | semantically identical JII, no RNG/hidden score |
| 7 | profile version preservation | v1 past evaluation, v2 later evaluation | old trace immutable, later version만 새 evaluation 사용 |
| 8 | prestige/reputation non-interference | fixed record, changed prestige metadata | same JII/finding |
| 9 | record-content sensitivity | fixed profile, actual allowed presentation changes | change는 record reason으로만 추적 |
| 10 | archetype + override + explanation trace | shared archetype, bounded override, genuine CP | bounded individuality와 full derivation trace, public projection 안전 |

TEST-012는 actual Korean law, criterion correctness, automatic ambiguity detection, JudgeProfile generation AI, final adjudication, Godot/save/UI를 검증 완료로 보고해서는 안 된다.

## 24. Decision summary

| ID | 추천 결정 | 상태 |
|---|---|---|
| J1 | World-owned stable judge identity + immutable profile version history | **Accepted** |
| J2 | four minimum-v1 choice-linked domains: credibility qualification, inference linkage, scope precision, conflict/corroboration treatment | **Accepted** |
| J3 | rule-linked qualitative traits; numeric/ordinal arithmetic 금지 | **Core Accepted** |
| J4 | hard gate → genuine choice point → trait/policy match → explicit JII → requirement resolution | **Core Accepted** |
| J5 | profile-independent activation, semantic options, target scope, no outcome payload의 minimum validation | **Core Accepted**; detailed validator **TBD** |
| J6 | evidence/scope/path/requirement creation·deletion, hidden inputs, scores, prestige, RNG 금지 | **Core Accepted** |
| J7 | only criterion-declared borderline credibility/scope/inference/conflict/corroboration choices | **Accepted** |
| J8 | same versioned semantic inputs → same JII semantics; no mood/personality RNG | **Core Accepted** |
| J9 | actual internal derivation trace + disclosure-filtered player explanation | **Core Accepted** |
| J10 | explicit world-level evolution rule/event creates a new immutable version; no one-off mutation or retroactive rewrite | **Accepted**; mechanics **TBD** |
| J11 | skill/reputation/prestige는 actual record path로만 영향; fixed record에서 direct effect 없음 | **Core Accepted** |
| J12 | versioned archetype baseline + explicit individual overrides → resolved profile version | **Accepted** |
| J13 | stable world identity/history; outcome statistics는 future modifier가 아님 | **Core Accepted** |

### Accepted disposition

1. 네 domain을 minimum v1 set으로 채택하되 exhaustive하거나 permanently canonical한 taxonomy로 고정하지 않는다.
2. rule-linked qualitative trait와 exact permitted-option mapping 경계를 채택한다.
3. no applicable mapping에서 criterion-declared fallback만 허용하며, 필요한 fallback도 없으면 canonical `undetermined`와 명시적 reason을 사용한다.
4. archetype baseline + explicit individual override 구조를 채택한다.
5. genuine ambiguity minimum semantic validation을 Core Accepted boundary로 채택하되 detailed tooling은 **TBD**로 둔다.

## 25. Decision history

| 버전 | 상태 | 내용 |
|---|---|---|
| v0.2 | Accepted | J1~J13 추천 architecture를 Accepted/Core Accepted로 채택. J2의 네 domain을 비배타적 minimum v1 set으로 명시하고 future domain의 hard-boundary 준수를 요구. J4 derivation 실패 reason category 세 가지를 명시하되 canonical finding status와 분리. J10 evolution은 explicit world-level rule/event와 새 immutable profile version만 허용하고 단일 outcome·litigant interaction·one-off player encounter의 직접 trait mutation을 금지. 기존 detailed legal/content/validation/schema/evolution/implementation TBD를 유지. |
| v0.1 | Proposed / design review required | World-owned versioned JudgeProfile, four minimum trait domains, rule-linked qualitative tendency, hard-first deterministic JII derivation, genuine ambiguity minimum validation, hard-boundary invariants, versioned evolution, prestige/reputation non-interference, archetype + individual overrides, stable world identity를 제안. actual Korean law, detailed validator, canonical schema, panel/procedure, evolution triggers, disclosure, judge AI/Godot/save는 TBD. TEST-012 10-case plan만 제안하고 생성·실행하지 않음 |
