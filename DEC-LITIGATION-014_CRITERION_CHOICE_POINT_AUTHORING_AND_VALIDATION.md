# THE FIRM — Criterion Choice Point Authoring & Validation 최소 모델

문서 ID: DEC-LITIGATION-014  
버전: v0.1 — 2026-09-30 Accepted (DEC-031)  
상태: **Accepted — 원칙만 / 절차는 DEC-031로 대체**  
결정 기록: 2026-09-30 사용자 결정 — 판사 성향은 경계 근처에서만 작용한다는 원칙만 채택. CriterionChoicePoint 작성·검증 절차는 적용하지 않음. 상세는 [DEC-LITIGATION-031](DEC-LITIGATION-031_NUMERIC_ADJUDICATION_AND_PROPOSED_DEC_RESOLUTION.md). 구현 시 Hard invariants는 구속, semantic 층 분리는 참고.  
프로젝트: THE FIRM  
문서 유형: Design Decision  
상위 기준: [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) v0.2, [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) v0.2  
시스템 기준: [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) v0.2  
직접 결정 기준: [DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md](DEC-LITIGATION-011_MINIMUM_FACT_RECOGNITION_MODEL.md) v0.2 Accepted, [DEC-LITIGATION-012_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md](DEC-LITIGATION-012_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md) v0.3 Accepted, [DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) v0.2 Accepted  
검증 기준: [TEST-011_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md](TEST-011_RECOGNITION_CRITERION_AND_EVIDENCE_SUFFICIENCY.md) v0.1, [TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) v0.1

## 1. Purpose / boundary

이 문서는 versioned `RecognitionCriterion`이 소유하는 `CriterionChoicePoint`의 authoring boundary와 minimum semantic validation rule을 제안한다. 목적은 genuine ambiguity를 명시적이고 재현 가능한 범위로 제한하고, 판사 personality를 위한 임의 outcome switch로 남용하지 못하게 하는 것이다.

핵심 질문은 다음과 같다.

```text
어떤 record/criterion condition이
실제로 둘 이상의 permissible semantic treatment를 남기는가?

그 ambiguity를
어떤 CriterionChoicePoint 구조로 선언할 수 있는가?

어떤 choice point는 invalid authoring인가?

runtime까지 invalid candidate가 도달했을 때
어떻게 안전하게 중단하는가?
```

DEC-013의 chain은 변경하지 않는다.

```text
fixed litigation inputs
  → hard evaluation
    → criterion-declared genuine ambiguity
      → CriterionChoicePoint
        → JudgeProfileVersion
          → applicable JudgeTrait / JudgeInterpretationPolicy
            → explicit JudgeInterpretationInput
              → bounded requirement resolution
                → CourtFactFinding
```

`CriterionChoicePoint`는 판사 차이를 만들어내는 장치가 아니다. Criterion이 같은 allowed record에 대해 이미 허용한 둘 이상의 semantic treatment가 있는 경우, 판사 layer가 들어갈 수 있는 문과 그 effect boundary를 사전에 선언하는 구조다.

### 1.1 Non-goals

이 문서는 다음을 하지 않는다.

- `JudgeProfile`, `JudgeTrait` 또는 `JudgeInterpretationPolicy`를 다시 설계하지 않는다.
- 실제 대한민국 법률의 ambiguity category, 증거평가 기준 또는 사법 재량을 선언하지 않는다.
- automatic ambiguity detection, NLP 또는 authoring AI를 설계하지 않는다.
- validator tooling 전체나 semantic equivalence algorithm을 완성하지 않는다.
- canonical Godot class, GDScript, JSON, save schema, API 또는 authoring DSL을 확정하지 않는다.
- evidence admissibility, final adjudication, burden, damages/remedy 또는 appellate/remand legal effect를 결정하지 않는다.
- TEST-013을 작성하거나 실행하지 않는다.

### 1.2 Decision markers

본 문서는 Proposed 상태다. 표식은 다음과 같다.

| 표식 | 의미 |
|---|---|
| **Accepted** | 상위 문서에서 이미 채택되어 이번 문서가 변경하지 않는 경계 |
| **Core Accepted** | 상위 문서에서 이미 채택된 핵심 불변식 |
| **Accepted candidate** | DEC-014 review에서 채택을 추천하는 구체 semantic decision |
| **Core Accepted candidate** | 구현 형태와 무관하게 채택해야 할 핵심 semantic boundary 후보 |
| **TBD** | 법리·콘텐츠·검증·구현 근거가 더 필요한 영역 |
| **Forbidden** | Accepted 경계 또는 본 설계 목적과 양립하지 않는 구조 |

## 2. Inherited Accepted constraints

아래 내용은 DEC-014에서 새로 선택하지 않는다. 이번 문서의 신규 결정은 choice-point ownership, authoring validity, target/options, interaction, failure와 trace boundary에 한정된다.

### 2.1 From DEC-011

- `CourtFactFinding`은 `recognized`, `recognized_limited`, `not_established_on_record`, `undetermined` 네 상태만 사용한다.
- `ActualStateRecord`와 court-recognized fact는 분리한다. Choice-point evaluation은 actual truth를 읽지 않는다.
- 한 명제의 미인정만으로 반대명제를 인정하지 않는다.
- Fact finding에 새 RNG를 도입하지 않는다.
- EvidenceUse, credibility, lineage/conflict와 fact-finding reason을 추적하고 player explanation과 internal trace를 분리한다.

### 2.2 From DEC-012

- Evaluation은 해당 Stage의 allowed `CourtRecordSnapshot`만 사용한다.
- `FactProposition`과 named `PropositionScope` boundary를 보존한다.
- `RecognitionCriterionRef`와 criterion/version identity가 evaluation 기준을 소유한다.
- Relevance, credibility, lineage/corroboration, conflict와 sufficiency를 한 score로 합치지 않는다.
- Complete criterion 아래 clearly sufficient와 clearly insufficient를 구별하고, required rule/input missing은 `undetermined` reason으로 남긴다.
- Judge influence는 explicit/versioned `JudgeInterpretationInput`으로만 requirement resolution에 전달한다.
- Fact recognition output과 burden/legal effect/final adjudication을 분리한다.

### 2.3 From DEC-013

- Hard evaluation이 profile influence보다 먼저다.
- Judge influence는 criterion-declared genuine ambiguity에만 허용된다.
- Choice-point activation은 profile resolution보다 먼저 결정 가능해야 한다.
- `JudgeProfile`은 finding을 직접 바꾸지 않는다.
- Permitted options는 criterion이 소유하며 JudgeTrait/Policy는 이미 존재하는 option만 선택한다.
- Judge layer는 evidence, scope, requirement 또는 alternative path를 생성·삭제하지 않는다.
- Prestige/reputation/lawyer identity는 direct interpretation shortcut이 아니다.
- Judge RNG, numeric trait score, hidden weighting과 random tie-break는 금지된다.
- 동일 versioned semantic input은 동일 JII semantics를 낸다.
- Invalid/no mapping 상황에서 arbitrary choice를 하지 않는다.
- Fallback은 criterion-declared, profile-independent, deterministic semantic treatment여야 한다.

### 2.4 From TEST-011 / TEST-012

- Direct finding/party outcome payload는 invalid다.
- Choice point가 없거나 relevant trait mapping이 없으면 profile guess를 하지 않는다.
- Invalid authoring을 genuine ambiguity로 수용하지 않는다.
- Same-lineage duplication, missing evidence, missing scope 또는 missing conflict rule을 personality로 보완하지 않는다.
- Detailed validator, automatic ambiguity detection과 semantic equivalence algorithm은 아직 검증되지 않았다.

### 2.5 Compatibility finding

현재 source documents 사이에서 DEC-014의 authoring/validation boundary를 제안하지 못하게 하는 직접 contradiction은 발견되지 않았다. DEC-013은 minimum genuine-ambiguity constraint를 Accepted로 두고 detailed authoring/validation을 TBD로 남겼다. DEC-014는 그 TBD의 semantic boundary만 좁히며 실제 법리와 canonical implementation은 계속 미정으로 둔다.

## 3. C1 — CriterionChoicePoint semantic ownership

**문제:** Choice point를 누가 소유하며 runtime에서 임의 생성할 수 있는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Runtime이 case별로 ad-hoc choice point 생성 | 상황 대응이 쉬움 | 원하는 outcome에 맞춘 retrospective switch | **Forbidden** |
| B | Standalone mutable registry가 criterion 밖에서 CP를 주입 | 중앙 관리 가능 | criterion/version trace와 replay 단절 | **Forbidden** |
| C | Immutable `RecognitionCriterionVersion`이 stable-ID choice points를 소유 | 사전 authoring, audit와 replay 가능 | version 관리 필요 | **Core Accepted candidate** |

**추천안 — C1-C:** Choice point는 반드시 immutable `RecognitionCriterionVersion`의 구성으로 소유된다. Runtime은 해당 criterion version에 존재하지 않는 CP를 생성·삽입·변경할 수 없다. 동일 criterion version 안의 choice-point identity는 stable해야 하고 evaluation trace가 이를 직접 참조한다.

Criterion content patch가 필요하면 새 `RecognitionCriterionVersion`을 만든다. 과거 evaluation에 retrospective/ad-hoc insertion하는 것은 **Forbidden**이다.

**상태:** **Core Accepted candidate.** Exact ID format과 storage schema는 **TBD**다.

**이유:** Criterion/version ownership이 없으면 activation과 option의 사전 존재를 입증할 수 없고 과거 replay도 고정할 수 없다.

## 4. C2 — Genuine ambiguity definition

**문제:** 단순 불확실성, 기록 공백 또는 close-call 느낌과 genuine ambiguity를 어떻게 구별하는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | 결과가 불확실해 보이면 CP 허용 | 저작 간단 | 모든 close case가 personality switch로 변함 | **Forbidden** |
| B | Conflict 또는 vague wording이 있으면 자동 CP | 규칙 단순 | missing rule과 단순 모호성을 법리 없이 해석 선택으로 세탁 | **Forbidden** |
| C | Hard rules로 결과가 닫히지 않고 criterion이 target requirement/scope에 둘 이상의 permissible treatment를 사전 선언한 경우만 허용 | 경계와 설명 가능성 유지 | actual option content authoring 필요 | **Core Accepted candidate** |

**추천안 — C2-C:** Genuine ambiguity의 minimum semantic definition은 다음과 같다.

```text
동일 allowed record와 동일 RecognitionCriterionVersion에서
hard rules만으로 결과가 닫히지 않고,
그 criterion version이 특정 requirement/scope에 대해
둘 이상의 semantically distinct permissible treatment를
사전에 명시적으로 허용한 상태
```

다음은 그 자체로 ambiguity가 아니다.

- Missing `EvidenceUse`, supporting source 또는 coverage.
- Missing `PropositionScope`.
- Missing criterion, criterion requirement, conflict rule 또는 required evaluation input.
- Clearly sufficient 또는 clearly insufficient record.
- Inadmissible/unreceived/unallowed material만 존재하는 상황.
- Conflict가 존재한다는 사실만 있는 상황.
- Wording이 vague하다는 label만 있는 상황.
- Party outcome이 불확실하거나 dramatic variance가 필요하다는 이유.

Conflicting evidence나 ambiguous wording은 criterion이 actual record condition, target과 distinct treatments를 선언한 경우에만 CP candidate가 될 수 있다. Missing rule/input은 existing `undetermined` 경계로 남고 personality가 채우지 않는다.

**상태:** **Core Accepted candidate.** Actual Korean-law ambiguity categories와 permissible content는 **TBD**다.

**이유:** 기록 공백이나 결과 불확실성을 ambiguity로 취급하면 JudgeProfile이 hard sufficiency boundary를 우회한다.

## 5. C3 — Activation predicate inputs

**문제:** CP activation condition이 무엇을 참조할 수 있어야 profile-independent gate가 되는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Profile/party/outcome metadata까지 자유 참조 | 캐릭터별 연출 쉬움 | outcome-first activation | **Forbidden** |
| B | Raw world state 전체 참조 | 정보 풍부 | ActualStateRecord와 hidden input 누출 | **Forbidden** |
| C | Allowed record와 already-computed hard trace의 target-related facts만 참조 | 검증·재현 가능 | predicate authoring discipline 필요 | **Core Accepted candidate** |

**추천안 — C3-C:** Activation은 profile resolution 전에 같은 입력으로 결정 가능해야 한다.

허용되는 semantic input 후보:

- `CourtRecordSnapshot` identity, Stage와 allowed content boundary.
- `FactProposition`과 explicit `PropositionScope`.
- Target `CriterionRequirement` state.
- Allowed `EvidenceUse`와 scoped relevance/contribution.
- Explicit credibility, lineage, conflict/corroboration state.
- Already-computed hard evaluation trace와 target-related reason references.

금지되는 input:

- `JudgeProfile`, `JudgeProfileVersion`, `JudgeTrait`, judge name 또는 judge outcome history. Judge assignment identity는 activation 밖의 case context로만 존재할 수 있다.
- Party/lawyer identity, law firm, reputation, prestige, desired outcome 또는 win/loss history.
- `ActualStateRecord`, hidden AP, private/internal `WorkProduct`.
- Unsubmitted, unreceived, inadmissible 또는 otherwise unallowed material.
- RNG, current mood, wall-clock time 또는 non-semantic execution metadata.

**상태:** **Core Accepted candidate.** Canonical predicate syntax와 safe-reference validator는 **TBD**다.

**이유:** Profile-independent activation만이 choice point가 judge preference를 보고 사후 생성되지 않았음을 보장한다.

## 6. C4 — Target boundary

**문제:** CP effect가 어디까지 도달할 수 있는지 최소 v1 target을 어떻게 제한하는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Proposition 또는 case 전체를 포괄 target | 저작 편리 | scope leakage와 direct outcome switch | **Forbidden** for minimum v1 |
| B | 여러 requirements/scopes를 한 CP가 자유롭게 변경 | 복합 상황 표현 | effect boundary와 ordering 불명확 | **TBD** |
| C | One explicit target requirement + one explicit affected scope | audit와 boundedness 명확 | 복합 ambiguity는 여러 CP/dependency 필요 | **Accepted candidate** |

**추천안 — C4-C:** Minimum v1 effective CP는 다음 target을 명시한다.

- Owning `RecognitionCriterionVersion`.
- Stable choice-point identity.
- One explicit target `CriterionRequirement`.
- One explicit affected `PropositionScope`.
- Activation을 뒷받침하는 relevant record/evaluation condition reference.

Proposition 전체를 target으로 쓴다는 이유로 explicit requirement/scope를 생략할 수 없다. 여러 independent scopes가 필요하면 각 target별 CP를 우선 사용한다. Multi-scope 또는 multi-requirement CP가 안전하게 필요한지는 **TBD**이며, 허용되기 전까지 minimum v1 validation을 통과한 것으로 보지 않는다.

**상태:** **Accepted candidate** for minimum v1; multi-target semantics **TBD**.

**이유:** One-requirement/one-scope target은 새 법리를 정하지 않으면서 effect leakage와 implicit ordering을 가장 작게 제한한다.

## 7. C5 — Permitted option structure

**문제:** Option이 단순 label이나 outcome alias가 되지 않으려면 어떤 의미 정보를 가져야 하는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | String label만 저장 | 단순 | semantic effect와 boundary 검증 불가 | **Forbidden** |
| B | Direct score/status payload | 구현 쉬움 | hidden modifier/outcome switch | **Forbidden** |
| C | Stable identity + semantic treatment + target/basis/no-effect boundary | trace와 validation 가능 | content review 필요 | **Core Accepted candidate** |

**추천안 — C5-C:** 각 `CriterionChoiceOption`은 최소 다음 의미를 보존한다.

- Stable option identity within the owning criterion version.
- Existing record를 어떻게 취급하는지 설명하는 semantic treatment.
- Parent CP와 동일한 target requirement/scope boundary.
- 왜 같은 criterion에서 permissible한지에 대한 reason/content/authority reference.
- Effect가 미치지 않는 scope, evidence, requirements와 paths를 명시하는 no-effect boundary.
- JudgeInterpretationPolicy가 exact permitted option에 연결될 수 있는 semantic mapping reference.

예시 label은 `accept_bounded_link` / `require_direct_link`, `limited_for_scope` / `remain_disputed`, `retain_narrow_scope` / `permit_declared_broader_scope`다. 이는 synthetic structural examples일 뿐 한국법상 타당성 선언이 아니다.

**상태:** **Core Accepted candidate.** Canonical field schema와 authority format은 **TBD**다.

**이유:** Option의 실제 treatment와 no-effect boundary가 없으면 policy selection을 outcome alias와 구별할 수 없다.

## 8. C6 — Forbidden option payload

**문제:** 어떤 option 표현은 semantic treatment가 아니라 결과나 hidden modifier를 직접 선택하는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Finding/claim/party outcome payload 허용 | 빠른 결과 | fact/adjudication 분리 파괴 | **Forbidden** |
| B | Strict/lenient 또는 numeric modifier만 저장 | authoring 쉬움 | 의미 없는 personality switch와 hidden arithmetic | **Forbidden** |
| C | Target-bounded semantic treatment만 허용 | explanation 가능 | content authoring 비용 | **Core Accepted candidate** |

**추천안 — C6-C:** 다음 option payload는 invalid다.

```text
recognized
recognized_limited
not_established_on_record
undetermined
plaintiff_wins
defendant_wins
claim_succeeds
claim_fails
+10 credibility
-20% sufficiency
strict
lenient
favorable
unfavorable
```

위 label이 실제 evidence/credibility/inference/conflict treatment와 target/no-effect boundary 없이 사용되면 finding, outcome 또는 hidden modifier를 직접 표현한다. 단순 이름 변경으로 유효해지지 않는다.

**상태:** Direct result/modifier payload **Forbidden**; semantic-only option boundary **Core Accepted candidate**.

**이유:** Status·party outcome·수치 modifier는 requirement treatment를 생략하고 fact finding 또는 adjudication 결과를 직접 고른다.

## 9. C7 — No creation / deletion invariant

**문제:** Choice option이 interpretation을 넘어 record나 criterion 구조를 바꾸는 것을 어떻게 막는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Option이 missing inputs를 보정 | lenient/strict 표현 쉬움 | evidence/scope laundering | **Forbidden** |
| B | Option이 requirement/path를 재작성 | flexible | criterion ownership과 hard gate 붕괴 | **Forbidden** |
| C | Existing inputs의 declared bounded treatment만 선택 | hard boundary 유지 | authoring 검증 필요 | **Core Accepted candidate** |

**추천안 — C7-C:** CP와 option은 다음을 생성·삭제·변환할 수 없다.

- Evidence, `EvidenceUse`, statement 또는 supporting/corroborating source.
- `PropositionScope`, missing coverage 또는 fact content.
- `CriterionRequirement`, requirement의 mandatory nature 또는 새 satisfaction route.
- New alternative path.
- Losing/contradicting evidence 또는 conflict trace.
- Duplicate lineage를 independent corroboration으로 승격하는 identity.
- Opposite fact 또는 contrary proposition recognition.
- `ActualStateRecord` lookup이나 hidden truth reference.

Option은 기존 allowed input을 criterion이 선언한 방식으로만 처리한다. Requirement를 “완화”해 missing input을 필요 없게 만드는 것도 requirement deletion과 같은 실패다.

**상태:** **Core Accepted candidate.** Exact mutation-detection implementation은 **TBD**다.

**이유:** Judge interpretation은 existing record의 permitted treatment일 뿐 record와 criterion을 작성하는 권한이 아니다.

## 10. C8 — Semantic distinctness between options

**문제:** 이름만 다른 동일 treatment가 fake ambiguity를 만들 수 있다.

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Label이 다르면 distinct | 검사 간단 | `accept_link`/`allow_link` 복제 |
| B | 완전 자동 semantic equivalence 판정 필수 | 강한 검사 목표 | NLP/legal oracle를 전제 | **TBD / not required for v1 tooling** |
| C | Authoring semantics에서 실제 rule effect가 달라야 하고 review/fixture로 검증 | 최소 경계 명확 | 자동 검사는 미완성 | **Core Accepted candidate** |

**추천안 — C8-C:** Valid CP는 target requirement/scope의 existing input treatment에서 실제로 다른 둘 이상의 permissible rule effects를 가져야 한다. Label, 문구 순서 또는 explanation tone만 다르고 requirement resolution semantics가 같으면 genuine ambiguity가 아니며 invalid다.

예를 들어 `accept_link`와 `allow_link`가 동일 link를 동일 범위에서 동일하게 취급한다면 distinct options가 아니다. 반면 기존 link를 target scope에서 허용하는 treatment와 direct link를 요구해 현 link를 사용하지 않는 treatment는 semantic effect가 다를 수 있다. 그 두 treatment가 실제로 permissible한지는 criterion content가 공급해야 한다.

**상태:** Semantic-distinctness constraint **Core Accepted candidate**; automatic equivalence algorithm과 proof format **TBD**.

**이유:** 실제 effect 차이가 없으면 둘 이상의 permissible interpretation이 존재하지 않으므로 genuine ambiguity가 아니다.

## 11. C9 — ChoicePoint independence from outcome

**문제:** 원하는 결과를 먼저 정한 뒤 CP를 역산하거나 특정 사건만 patch하는 authoring을 어떻게 막는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Case/party-specific CP override 허용 | 서사 연출 쉬움 | result-first rigging | **Forbidden** |
| B | Runtime hot patch 후 explanation 생성 | 빠른 수정 | replay와 실제 이유 파괴 | **Forbidden** |
| C | Criterion version content로만 사전 authoring하고 변경은 새 version | provenance/replay 유지 | content lifecycle 필요 | **Core Accepted candidate** |

**추천안 — C9-C:** 다음 authoring은 invalid다.

```text
Judge A에게 승소시키고 싶음
→ CP 추가
→ favorable option 연결
```

```text
특정 사건만 패소시켜야 함
→ case-specific CP patch
```

CP activation/option은 party, specific case identity, judge, desired outcome 또는 post-result data를 조건으로 할 수 없다. 기존 criterion content를 수정해야 한다면 새 immutable `RecognitionCriterionVersion`과 content reason이 필요하다. 새 version도 진행 중/과거 evaluation을 소급 변경하지 않는다.

**상태:** **Core Accepted candidate.** Content governance와 authority review workflow는 **TBD**다.

**이유:** 사전 criterion content와 immutable version만이 result-first 또는 case-specific rigging을 감사 가능하게 차단한다.

## 12. C10 — Hard-result interaction

**문제:** Hard result 또는 missing input 상태에서 declared CP가 존재하면 어떻게 처리하는가?

| hard state | 허용 처리 | 금지 처리 |
|---|---|---|
| Clearly sufficient | No effective CP activation; optional no-effect trace | Profile로 결과를 낮추거나 ambiguity 강제 |
| Clearly insufficient | No effective CP activation; optional no-effect trace | Lenient option으로 evidence/scope/coverage 생성 |
| Required rule/input missing | Existing `undetermined` + missing reason | Personality/fallback으로 missing rule/input 보완 |
| Hard result not closed + valid declared condition | CP validation/activation 진행 가능 | Profile을 먼저 읽어 condition 생성 |

**추천안 — C10:** Hard-sufficient와 hard-insufficient에서는 effective activation과 JII derivation이 없다. Authoring된 CP가 criterion에 존재하더라도 해당 evaluation에서 hard-result gate가 닫히면 no-effect다. Required rule/input missing은 genuine ambiguity가 아니며 DEC-011/012의 `undetermined` 처리를 유지한다.

Criterion-declared fallback도 hard-input gap을 채우는 용도로 사용할 수 없다. Fallback은 valid active CP의 interpretation mapping/fallback boundary에만 속한다.

**상태:** **Core Accepted candidate.** No-effect trace의 exact representation은 **TBD**다.

**이유:** Hard result와 missing-input 처리가 personality layer보다 우선해야 DEC-012/013의 sufficiency와 interpretation 책임이 분리된다.

## 13. C11 — Multiple ChoicePoints

**문제:** 한 evaluation에 여러 CP가 있을 때 overlap, dependency와 ordering이 outcome switch가 되지 않도록 해야 한다.

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | 모든 CP를 authoring order로 순차 적용 | 단순 | 파일 순서가 hidden priority가 됨 | **Forbidden** |
| B | CP를 random/score priority로 정렬 | 다양성/튜닝 | RNG와 hidden weighting | **Forbidden** |
| C | Non-overlapping target CP는 독립 허용; dependency는 criterion에 explicit; unresolved overlap은 invalid | bounded composition | precedence language 필요 | **Accepted candidate** |

**추천안 — C11-C:** 서로 다른 explicit requirement/scope를 target하고 effect가 서로의 activation/input을 변경하지 않는 CP들은 한 evaluation에서 독립적으로 존재할 수 있다.

다음은 minimum v1에서 안전하지 않다.

- 동일 requirement/scope에 둘 이상의 CP가 겹침.
- 한 CP의 selected option이 다른 CP의 activation condition을 암묵적으로 변경함.
- File order, ID order 또는 실행 순서가 의미 결과를 바꿈.
- Dependency/precedence가 criterion version에 선언되지 않음.

Dependency가 실제로 필요하다면 criterion이 explicit deterministic relation을 소유해야 한다. 그 relation이 없거나 incompatible options가 충돌하면 authoring candidate는 invalid다. Runtime까지 도달하면 arbitrary order 없이 `undetermined` + explicit reason으로 중단한다.

**상태:** Independent non-overlap **Accepted candidate**; overlapping/dependent CP의 canonical precedence syntax와 validator는 **TBD**. Numeric/random ordering은 **Forbidden**.

**이유:** 독립 target은 조합할 수 있지만 암묵적 overlap/order는 동일 input의 의미 결과와 설명 가능성을 깨뜨린다.

## 14. C12 — Criterion-owned fallback

**문제:** Applicable mapping이 없을 때 fallback을 어디에 두며 어떻게 personality guess를 막는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | JudgeProfile이 default option 선택 | 간단 | arbitrary personality fallback | **Forbidden** |
| B | Runtime midpoint/random/favorable default | 항상 종료 | hidden tie-break/outcome bias | **Forbidden** |
| C | Owning criterion version이 explicit semantic fallback 선언 | deterministic/replay 가능 | actual policy authoring 필요 | **Core Accepted candidate** |

**추천안 — C12-C:** Fallback은 반드시 owning `RecognitionCriterionVersion`의 declared content다. CP가 직접 보유하든 criterion-level policy가 stable CP reference로 연결하든 semantic owner는 criterion version이어야 한다. Exact placement는 canonical schema 결정까지 **TBD**다.

Fallback은 다음을 모두 만족한다.

- Profile-independent activation and selection.
- Deterministic semantic treatment.
- Parent CP의 target/options/no-effect boundary를 벗어나지 않음.
- Evidence/scope/requirement/path를 생성·삭제하지 않음.
- Hidden midpoint, random option, favorable default 또는 judge guess가 아님.

Fallback이 없고 valid active CP의 resolution이 필요하면 JII를 만들지 않고 `undetermined`와 `judge_interpretation_mapping_missing` / `judge_interpretation_fallback_missing` reason distinctions를 보존할 수 있다. 실제 fallback legal/content policy는 **TBD**다.

**상태:** Criterion ownership and invariants **Core Accepted candidate**; placement/content **TBD**.

**이유:** Fallback도 interpretation policy이므로 profile guess가 아니라 criterion의 사전 선언과 version history에 속해야 한다.

## 15. C13 — Invalid authoring detection

**문제:** Minimum semantic validator가 어떤 candidate를 finding path 전에 거부해야 하는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Runtime에서 profile이 알아서 해석 | tooling 적음 | invalid content가 outcome에 영향 | **Forbidden** |
| B | 형식 필드 존재만 검사 | 저렴 | semantic duplicate/outcome alias 통과 | 불충분 |
| C | Minimum structural + semantic invariant 검사 | 핵심 공격 차단 | equivalence/legal validity 일부 수동 review 필요 | **Core Accepted candidate** |

**추천안 — C13-C:** Minimum validation은 적어도 다음 invalid candidates를 탐지·거부해야 한다.

1. Owning criterion/version 또는 stable CP identity 없음.
2. Target `CriterionRequirement` 없음.
3. Target `PropositionScope` 없음.
4. 둘 미만의 meaningful permitted options.
5. Semantically duplicate options.
6. Direct finding-status payload.
7. Direct party/claim outcome payload.
8. Evidence/scope/coverage/requirement/path 생성·삭제 effect.
9. Activation이 profile, judge trait/name/history 또는 desired outcome에 의존.
10. Activation이 party/lawyer/firm/prestige/reputation에 의존.
11. Activation/effect가 ActualStateRecord, hidden AP, internal WorkProduct 또는 unallowed material에 의존.
12. Option effect가 target boundary 밖으로 전파.
13. Result-first retrospective 또는 case-specific authoring.
14. Option semantic mapping contract가 정의되지 않아 policy가 exact option을 참조할 수 없음.
15. Hard-result gate를 우회하려는 activation/effect.
16. Unresolved overlapping CP 또는 implicit ordering.

여기서 particular JudgeProfile에 applicable policy mapping이 없다는 사실 자체는 CP authoring invalidity가 아닐 수 있다. Valid CP의 profile-specific no mapping은 DEC-013의 mapping/fallback failure path다. 반면 option 자체에 stable identity/semantic mapping reference가 없어 어떤 valid policy도 exact option을 가리킬 수 없다면 authoring invalid다.

**상태:** Minimum invalid set **Core Accepted candidate**; full validator implementation과 automatic semantic equivalence 판정 **TBD**.

**이유:** 형식 존재만 검사하면 direct outcome, hidden input, duplicate semantics와 boundary escape가 finding path에 들어갈 수 있다.

## 16. C14 — Authoring-time vs runtime failure

**문제:** Invalid content를 언제 차단하고, validation gap으로 runtime까지 온 경우 어떻게 안전하게 멈추는가?

| layer | 기본 처리 | 금지 처리 |
|---|---|---|
| Authoring/content validation | Invalid candidate reject; published criterion version에 포함하지 않음 | Warning만 남기고 usable로 승인 |
| Runtime defense | CP/finding option으로 사용하지 않고 canonical `undetermined` + explicit reason | Profile 호출, arbitrary fallback, fifth status, silent default |

**추천안 — C14:** Authoring-time rejection이 기본이다. 그러나 incomplete tooling, legacy/migration 또는 corrupted content 때문에 invalid candidate가 runtime까지 도달했다고 가정하면:

1. Effective activation을 중단한다.
2. `JudgeProfile`/Policy로 해결하지 않는다.
3. Candidate option이나 fallback을 사용하지 않는다.
4. Existing canonical `undetermined`를 사용한다.
5. Validation failure, affected criterion/CP/target과 중단 reason을 trace에 남긴다.

DEC-013의 `judge_interpretation_mapping_missing`, `judge_interpretation_mapping_conflict`, `judge_interpretation_fallback_missing`은 valid CP derivation failure reasons다. Invalid authoring/validation failure의 exact error vocabulary는 별도이며 **TBD**다. 어느 reason도 새 `CourtFactFinding` status가 아니다.

**상태:** Safe two-layer failure boundary **Core Accepted candidate**; exact error taxonomy/workflow **TBD**.

**이유:** Authoring validation이 기본 방어선이지만 runtime도 invalid content를 결과 선택에 사용하지 않는 fail-closed 경계가 필요하다.

## 17. C15 — Versioning and immutability

**문제:** CP 변경이 과거 evaluation과 replay를 훼손하지 않도록 어떤 version rule이 필요한가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Existing criterion version 내부 CP mutation | 배포 간단 | past trace/replay 의미 변경 | **Forbidden** |
| B | CP만 floating latest version 참조 | 수정 쉬움 | criterion-version binding 붕괴 | **Forbidden** |
| C | Predicate/target/options/fallback 변경 시 새 criterion version | history/replay 보존 | migration 관리 필요 | **Core Accepted candidate** |

**추천안 — C15-C:** Published immutable `RecognitionCriterionVersion` 안의 CP는 mutation하지 않는다. 다음 semantic change는 새 criterion version을 요구한다.

- CP 추가/삭제.
- Activation condition 변경.
- Target requirement/scope 변경.
- Permitted option identity, treatment, basis 또는 no-effect boundary 변경.
- Fallback 추가/삭제/변경.
- Multiple-CP dependency relation 변경.

과거 evaluation은 당시 criterion version, CP identity/options와 fallback/policy references를 보존한다. Later criterion version은 subsequent applicable evaluation에만 사용하며 prior finding/trace를 rewrite하지 않는다. Replay는 당시 semantic inputs를 사용한다.

**상태:** **Core Accepted candidate.** Applicability transition, migration tooling과 persistence schema는 **TBD**다.

**이유:** In-place mutation은 같은 stored input이 나중에 다른 의미 결과를 내게 하므로 replay와 과거 이유를 파괴한다.

## 18. C16 — Explainability / trace

**문제:** Genuine ambiguity가 실제 record/criterion에서 시작됐고 결과를 역산하지 않았음을 어떻게 감사하는가?

| 대안 | 구조 | 장점 | 실패 모드 | 판단 |
|---|---|---|---|---|
| A | Final explanation text만 저장 | compact | result-first narrative 구별 불가 | **Forbidden** |
| B | Debug dump 전체를 player에게 노출 | audit 쉬움 | private/hidden data leakage | **Forbidden** |
| C | Actual internal trace와 disclosure-filtered explanation 분리 | audit와 안전한 설명 양립 | reference discipline 필요 | **Core Accepted candidate** |

**추천안 — C16-C:** Minimum internal `ChoicePointTrace`는 다음 의미를 보존한다.

```text
Case
Stage
CourtRecordSnapshot
FactProposition
PropositionScope
RecognitionCriterionVersion
CriterionRequirement
hard evaluation result/reasons
ChoicePoint identity/version
activation condition
activation evidence/evaluation trace refs
permitted options
validation result/reasons
selected option or no-selection reason
fallback use and criterion-owned fallback ref
JudgeInterpretationInput ref, if any
affected requirement/scope
resulting requirement resolution
CourtFactFinding ref
invalid/rejection/runtime-stop reason
```

Internal trace는 실제 dependency를 보존해야 하며 결과 뒤에 설명을 조립한 narrative가 아니다. Public explanation은 accessible allowed record, 공개 가능한 criterion reason과 실제 derivation trace의 disclosure-filtered projection이다. ActualStateRecord, hidden AP, private WorkProduct, unsubmitted evidence, secret profile details, debug-only validator data와 hidden score/probability를 노출하지 않는다.

**상태:** Trace separation and minimum semantics **Core Accepted candidate**; disclosure policy, wording/UI와 exact schema **TBD**.

**이유:** 실제 activation/validation/selection dependency를 보존해야 genuine ambiguity와 사후 outcome explanation을 구별할 수 있다.

## 19. Semantic reference model

다음은 semantic reference structures이며 canonical Godot class, JSON, save schema 또는 API가 아니다.

| structure | 최소 의미 정보 | ownership | forbidden responsibility |
|---|---|---|---|
| `RecognitionCriterion` | Stable criterion identity와 version history refs | Legal/content criterion domain | Runtime finding이나 judge-specific outcome 저장 |
| `RecognitionCriterionVersion` | Immutable version, applicability/stage refs, requirements, CP refs, content/reason provenance | `RecognitionCriterion` | Published content mutation, case-specific patch |
| `CriterionRequirement` | Stable requirement identity, target proposition/scope, mandatory/declared composition semantics | Criterion version | Judge profile에 따른 생성·삭제 |
| `CriterionChoicePoint` | Stable ID, owner version, target requirement/scope, activation condition, option refs, fallback ref, reason basis | Criterion version | Runtime ad-hoc generation, finding/claim result 선택 |
| `CriterionChoiceOption` | Stable option ID, semantic treatment, target/no-effect boundary, reason/content basis, policy mapping ref | Parent CP / criterion version | Evidence/scope/requirement/path 생성·삭제, direct status/outcome payload |
| `CriterionChoiceActivationCondition` | Allowed input refs와 target-related hard-trace predicate semantics | Parent CP / criterion version | Profile/party/prestige/ActualStateRecord/RNG 참조 |
| `CriterionChoiceFallback` | Deterministic profile-independent semantic treatment와 CP target reference | Criterion version; exact structural placement TBD | Hidden midpoint, random/favorable default, hard-input gap 보완 |
| `ChoicePointValidationResult` | Candidate/version ref, validity, checked invariants, reasons, unresolved manual-review refs | Authoring/validation boundary | Legal truth oracle 또는 CourtFactFinding status 생성 |
| `JudgeInterpretationInput` | Profile/trait/policy/CP versions, selected permitted option, affected target, derivation reason | DEC-013 judge derivation layer | CP/option 생성, direct finding/adjudication 소유 |
| `ChoicePointTrace` | Hard gate, activation, validation, options, selection/fallback/no-selection, target resolution와 finding refs | Litigation evaluation audit boundary | ActualStateRecord/debug truth 공개, post-result reason fabrication |

Exact fields, IDs, normalization, predicate representation, validation result schema와 persistence는 **TBD**다.

## 20. Minimum validation invariants

| # | invariant | proposed status | boundary |
|---:|---|---|---|
| 1 | Criterion owns choice points | **Core Accepted candidate** | Runtime/standalone injection 금지 |
| 2 | Stable versioned identity | **Core Accepted candidate** | Criterion/CP/option identity와 history 보존 |
| 3 | Profile-independent activation | **Core Accepted candidate** | Profile resolution 전에 판정 가능 |
| 4 | Hard-first | **Core Accepted candidate** | Hard result/input gate 우선 |
| 5 | Genuine ambiguity only | **Core Accepted candidate** | Predeclared distinct semantic treatments 필요 |
| 6 | Explicit target requirement/scope | **Accepted candidate** | Minimum v1 one requirement + one scope |
| 7 | At least two semantically distinct permitted options | **Core Accepted candidate** | Label difference만으로 부족 |
| 8 | No direct finding status payload | **Core Accepted candidate** | Four states를 option으로 선택 금지 |
| 9 | No party/claim outcome payload | **Core Accepted candidate** | Win/loss/success/failure option 금지 |
| 10 | No evidence creation | **Core Accepted candidate** | Evidence/EvidenceUse/source 생성 금지 |
| 11 | No scope creation | **Core Accepted candidate** | Missing coverage laundering 금지 |
| 12 | No requirement deletion | **Core Accepted candidate** | Waiver/relaxation으로 gap 제거 금지 |
| 13 | No alternative path creation | **Core Accepted candidate** | Criterion에 없는 satisfaction route 금지 |
| 14 | No hidden/unallowed input | **Core Accepted candidate** | ActualStateRecord/AP/WorkProduct/unallowed material 금지 |
| 15 | No prestige/reputation activation | **Core Accepted candidate** | Party/lawyer/firm metadata 비간섭 |
| 16 | No RNG | **Core Accepted candidate** | Mood/random/current-time selection 금지 |
| 17 | No numeric hidden weighting | **Core Accepted candidate** | Score/percentage/priority 금지 |
| 18 | Option effect remains bounded | **Core Accepted candidate** | Target/no-effect boundary 준수 |
| 19 | Invalid candidate cannot be used for finding | **Core Accepted candidate** | Authoring reject/runtime safe stop |
| 20 | Fallback must be criterion-declared | **Core Accepted candidate** | Profile-independent deterministic treatment |
| 21 | Version history preserved | **Core Accepted candidate** | No mutation/retroactive rewrite |
| 22 | Actual derivation/validation trace preserved | **Core Accepted candidate** | Result-first explanation 금지 |

Automatic semantic equivalence, full legal/content validity, exact predicate safety, multi-CP precedence, error vocabulary와 validator implementation은 위 Core boundary를 operationalize하는 방법으로서 **TBD**다.

## 21. Recommended minimum model

```text
RecognitionCriterionVersion
  owns stable CriterionChoicePoint

Hard evaluation
  → hard result or required input/rule missing?
      yes → no effective CP
            preserve hard result or existing undetermined reason
      no
        → declared activation condition satisfied?
            no → no CP effect
            yes
              → validate ownership + target + options + boundedness
                  invalid → authoring reject
                            or runtime undetermined + explicit reason
                  valid → genuine ambiguity active
                      → JudgeProfile derivation may begin
```

Minimum operational rules:

1. Criterion version과 CP/option identity를 먼저 고정한다.
2. Allowed record와 hard trace만으로 hard-result gate와 activation을 판단한다.
3. Minimum v1 target은 one explicit requirement + one explicit affected scope다.
4. 둘 이상의 semantically distinct permitted treatments와 no-effect boundary를 검증한다.
5. Direct status/outcome, creation/deletion, hidden input, prestige, numeric weight와 RNG가 있으면 invalid다.
6. Valid active CP만 DEC-013 profile derivation에 전달한다.
7. Invalid candidate는 finding에 사용하지 않으며 runtime에서는 `undetermined`와 trace reason으로 안전하게 중단한다.
8. Criterion-owned declared fallback 외에는 어떤 default도 사용하지 않는다.
9. Published content 수정은 새 immutable criterion version을 요구한다.

Choice point는 판사 차이를 만드는 장치가 아니라 criterion이 이미 허용한 ambiguity를 명시적으로 경계 짓는 장치다.

## 22. Pressure-test examples

모든 예시는 synthetic semantic fixture이며 실제 대한민국 법률의 진술이 아니다.

### Example 1 — Clearly sufficient record에 CP 삽입 시도

**Input:** `C-E1/v1` hard requirements가 모두 명확히 충족됐지만 author가 `CP-E1`을 effective하게 만들려 한다.  
**May evaluate:** Hard-result gate와 no-effect handling.  
**Must not happen:** Profile/option이 recognized hard result를 뒤집음.  
**Expected:** 해당 evaluation에서 no effective activation. Hard bypass를 요구하는 CP effect는 invalid.

### Example 2 — Clearly insufficient record를 lenient option으로 구제

**Input:** Mandatory scope에 support가 없고 option label은 `lenient`.  
**May evaluate:** Hard insufficiency와 forbidden payload/creation 검사.  
**Must not happen:** Scope/coverage 생성, requirement waiver, JII 생성.  
**Expected:** Invalid. Existing `not_established_on_record` hard result 유지.

### Example 3 — Missing EvidenceUse laundering

**Input:** Target requirement에 EvidenceUse가 없으며 author가 이를 ambiguity condition으로 선언.  
**May evaluate:** Required coverage 존재 여부.  
**Must not happen:** “accept missing evidence” option이나 supporting source 생성.  
**Expected:** Not genuine ambiguity; invalid CP candidate. Complete criterion 아래 hard insufficiency면 `not_established_on_record`.

### Example 4 — Valid circumstantial-link semantic ambiguity

**Input:** Existing allowed links가 있고 hard result는 닫히지 않는다. `CP-E4`가 one requirement/scope와 `accept_bounded_link` / `require_direct_link`를 distinct treatments로 선언한다.  
**May evaluate:** Ownership, activation, target, distinct options와 boundedness.  
**Must not happen:** 새 link/evidence/path 생성 또는 direct finding payload.  
**Expected:** Potential valid CP candidate. 실제 legal permissibility는 content review/TBD.

### Example 5 — Valid scoped credibility ambiguity

**Input:** Allowed statement의 특정 scope에 explicit inconsistency가 있고 criterion이 `limited_for_scope` / `remain_disputed`를 선언한다.  
**May evaluate:** 해당 statement/requirement/scope treatment만.  
**Must not happen:** Witness 전체 truthful/liar 판정, opposite fact 생성, scope leakage.  
**Expected:** Potential valid CP candidate when both treatments have content basis and distinct bounded effects.

### Example 6 — Direct finding-status options

**Input:** Options are `recognized` / `not_established_on_record`.  
**May evaluate:** Forbidden payload 검사.  
**Must not happen:** Judge policy가 status를 선택.  
**Expected:** Invalid direct status switch.

### Example 7 — Direct party-outcome options

**Input:** Options are `plaintiff_wins` / `defendant_wins`.  
**May evaluate:** Fact/adjudication boundary 검사.  
**Must not happen:** CP가 claim outcome을 소유.  
**Expected:** Invalid outcome switch.

### Example 8 — Semantically duplicate options

**Input:** `accept_link` / `allow_link`가 같은 record를 같은 requirement/scope에서 동일하게 처리한다.  
**May evaluate:** Author-supplied semantics와 manual equivalence review.  
**Must not happen:** Label difference만으로 genuine ambiguity 승인.  
**Expected:** Not genuine ambiguity; invalid. Automatic equivalence detection remains TBD.

### Example 9 — Profile-dependent activation

**Input:** Predicate is “judge has `accepts_bounded_circumstantial_link` trait.”  
**May evaluate:** Predicate dependency 검사.  
**Must not happen:** Profile을 먼저 읽어 CP activation.  
**Expected:** Invalid.

### Example 10 — Prestige-dependent activation

**Input:** Predicate is “representing firm prestige is high.”  
**May evaluate:** Forbidden-input 검사.  
**Must not happen:** Prestige가 CP 또는 option selector로 작동.  
**Expected:** Invalid.

### Example 11 — Overlapping ChoicePoints

**Input:** `CP-E11A/B`가 같은 requirement/scope를 target하고 서로 incompatible treatments를 요구하며 dependency/precedence가 없다.  
**May evaluate:** Target overlap과 explicit dependency 존재 여부.  
**Must not happen:** File order, numeric priority 또는 RNG로 선택.  
**Expected:** Invalid unresolved overlap; runtime 도달 시 `undetermined` + explicit reason. Exact precedence syntax TBD.

### Example 12 — Mapping과 fallback 모두 없음

**Input:** CP 자체는 valid/active지만 current profile에 applicable mapping이 없고 criterion-declared fallback도 없다.  
**May evaluate:** DEC-013 derivation failure only.  
**Must not happen:** CP를 invalid라고 자동 단정하거나 judge guess 사용.  
**Expected:** No JII; `undetermined` with `judge_interpretation_mapping_missing` and `judge_interpretation_fallback_missing` reasons.

### Example 13 — Runtime invalid candidate

**Input:** Legacy content의 CP option이 target boundary를 벗어나지만 authoring validation을 통과해 runtime에 도달.  
**May evaluate:** Defensive validation과 safe-stop trace.  
**Must not happen:** Profile 호출, invalid option 사용, fifth status 또는 arbitrary fallback.  
**Expected:** `undetermined` + explicit validation reason/TBD; exact error key TBD.

### Example 14 — Criterion version update

**Input:** `C-E14/v1`의 CP option treatment를 바꾸려 하며 과거 evaluation은 v1을 참조한다.  
**May evaluate:** Immutability와 new-version requirement.  
**Must not happen:** v1 mutation과 과거 trace rewrite.  
**Expected:** `C-E14/v2` 생성; prior evaluation stays on v1; later applicable evaluation may use v2.

### Example 15 — Public explanation projection

**Input:** Valid CP trace에 allowed record refs, criterion reason, selected treatment와 private validator/debug details가 함께 존재.  
**May evaluate:** Internal/public separation.  
**Must not happen:** ActualStateRecord, hidden AP, private WorkProduct, secret profile data 또는 debug-only reason 노출.  
**Expected:** Public explanation은 accessible record와 disclosed criterion/derivation reason만 사용하며 result-first narrative를 만들지 않음.

## 23. Explicit TBD list

1. Actual Korean-law ambiguity categories와 judicial discretion boundaries.
2. Actual `RecognitionCriterion` requirements, choice points, options와 content/authority basis.
3. Canonical authoring DSL.
4. Activation predicate syntax와 safe-reference expression language.
5. Automatic ambiguity detection.
6. Semantic equivalence algorithm과 proof/normalization format.
7. Static/runtime validator implementation과 validation coverage.
8. Authoring UI.
9. Authority/content review workflow와 approval ownership.
10. Exact authoring/runtime error vocabulary.
11. Multiple-choice-point dependency/precedence syntax와 multi-target semantics.
12. Criterion-declared fallback의 actual legal/content policy와 exact structural placement.
13. Serialization, API, JSON/save schema와 semantic digest.
14. Godot/GDScript implementation.
15. NLP/AI authoring assistant.
16. Performance.
17. Migration tooling과 legacy invalid-content handling.
18. Player-facing disclosure policy, wording과 UI.

이 TBD들은 minimum semantic boundary를 operationalize하는 상세 사항이다. 테스트나 구현 편의를 위해 임의로 닫지 않는다.

## 24. Risks / anti-patterns

| risk / anti-pattern | failure condition | mitigation direction |
|---|---|---|
| Every close case becomes a choice point | 결과가 애매해 보인다는 이유만으로 CP 생성 | C2 hard-first definition, predeclared distinct treatments 요구 |
| Strict/lenient personality switch | Option이 `strict`/`lenient` label만 가지고 status를 바꿈 | C5/C6 semantic treatment와 target/no-effect boundary 검증 |
| Outcome-first authoring | Desired winner/result 뒤 CP와 explanation 추가 | C1/C9 criterion-owned immutable version, retrospective patch 금지 |
| Party-specific patching | 특정 case/party/law firm에서만 activation | C3/C9 forbidden predicate dependencies |
| Evidence gap laundering | Missing EvidenceUse를 ambiguity나 lenient treatment로 채움 | C2/C7/C10 hard insufficiency와 no-creation invariant |
| Scope laundering | Vague option이 없는 PropositionScope를 생성 | C4 explicit target, C7 no-scope-creation |
| Semantic duplicate options | 이름만 다른 같은 effect를 choices로 제공 | C8 meaningful distinctness; equivalence tooling TBD |
| Overlapping CP conflict | 같은 target에 incompatible CP가 implicit order로 적용 | C11 explicit non-overlap/dependency, unresolved overlap reject |
| Hidden fallback | Midpoint/favorable/random default를 criterion 밖에서 사용 | C12 criterion-owned deterministic fallback only |
| Validator becomes legal oracle | Validator가 실제 Korean-law permissibility를 자동 선언 | Structural/semantic checks와 authority/content review 분리 |
| Invalid authoring leaks into runtime | Invalid CP가 profile을 호출해 finding에 영향 | C14 authoring reject + runtime `undetermined` safe stop |
| Old criterion mutation breaks replay | Existing predicate/options를 in-place 수정 | C15 new immutable criterion version과 past reference preservation |
| Hidden priority | File/ID order나 numeric weight로 CP/mapping 충돌 해결 | Deterministic declared dependency 외 ordering 금지 |
| Result-first explanation | Outcome 선택 후 plausible reason 생성 | C16 actual derivation trace에서만 public projection |

## 25. Proposed first-pass TEST-013 plan

`TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md`는 이 문서에서 만들지 않는다. 첫 pass는 **10 core cases**의 manual / fixture-level verification으로 제안한다.

| # | core case | 검증할 boundary |
|---:|---|---|
| 1 | Hard-sufficient CP rejection | Hard result에서 no effective CP/JII, finding 불변 |
| 2 | Hard-insufficient CP rejection | Missing coverage를 lenient option으로 구제하지 않음 |
| 3 | Missing-input laundering rejection | Missing evidence/scope/rule을 ambiguity로 전환하지 않음 |
| 4 | Valid inference-link ambiguity | Criterion ownership, pre-profile activation, distinct bounded treatments |
| 5 | Valid scoped credibility ambiguity | One requirement/scope target과 no-effect boundary |
| 6 | Direct finding/outcome payload rejection | Canonical status 및 party/claim outcome option 금지 |
| 7 | Semantic duplicate-option rejection | Label 차이가 아닌 actual semantic effect 차이 요구 |
| 8 | Profile/prestige-dependent activation rejection | Forbidden predicate inputs와 profile-independent gate |
| 9 | Multiple/overlapping CP handling | Independent non-overlap 허용, implicit/random ordering 금지, unresolved overlap safe stop |
| 10 | Version preservation + runtime invalid-candidate safety | New criterion version, old trace preservation, runtime `undetermined` + explicit reason |

TEST-013은 actual Korean law, automatic ambiguity detection/equivalence, full validator tooling, canonical schema/API, Godot/save/UI, performance 또는 final adjudication을 검증 완료로 주장해서는 안 된다.

## 26. Decision summary

### 26.1 Inherited Accepted / Core Accepted

| ID | Decision | Status |
|---|---|---|
| I-1 | Four canonical CourtFactFinding states, truth non-interference, no inverse fact, no fact-finding RNG | **Core Accepted** |
| I-2 | Allowed record, proposition/scope, criterion/version, credibility/lineage/conflict/sufficiency separation | **Core Accepted** |
| I-3 | Hard-first, genuine ambiguity only, profile-independent activation, explicit JII, bounded judge influence | **Core Accepted** |
| I-4 | Criterion-owned options/fallback; no creation/deletion, prestige shortcut, hidden score or RNG | **Core Accepted** |

### 26.2 Recommended DEC-014 decisions

| ID | Decision | Status |
|---|---|---|
| C1 | Immutable RecognitionCriterionVersion owns stable-ID choice points; no runtime insertion | **Core Accepted candidate** |
| C2 | Genuine ambiguity requires unresolved hard evaluation plus predeclared distinct permissible treatments | **Core Accepted candidate** |
| C3 | Activation uses allowed record/hard trace only and is profile-independent | **Core Accepted candidate** |
| C4 | Minimum v1 target is one explicit requirement + one explicit affected scope | **Accepted candidate**; multi-target **TBD** |
| C5 | Options require stable identity, semantic treatment, target, basis and no-effect boundary | **Core Accepted candidate** |
| C6 | Direct status/outcome/modifier payload is invalid | **Core Accepted candidate / Forbidden payload** |
| C7 | Options cannot create/delete evidence, scope, coverage, requirement or path | **Core Accepted candidate** |
| C8 | Options must be semantically distinct, not merely differently labeled | **Core Accepted candidate**; automatic equivalence **TBD** |
| C9 | No outcome-first, case/party-specific or retrospective CP patching | **Core Accepted candidate** |
| C10 | Hard results have no effective CP; missing rule/input remains `undetermined` | **Core Accepted candidate** |
| C11 | Independent non-overlapping CPs may coexist; dependencies must be explicit | **Accepted candidate**; precedence syntax **TBD** |
| C12 | Fallback is criterion-declared, profile-independent, deterministic and bounded | **Core Accepted candidate**; content/placement **TBD** |
| C13 | Minimum validator rejects specified structural/semantic attacks | **Core Accepted candidate**; implementation **TBD** |
| C14 | Authoring rejects invalid candidates; runtime leakage safe-stops as canonical `undetermined` | **Core Accepted candidate**; exact errors **TBD** |
| C15 | CP semantic changes create a new immutable criterion version; past refs persist | **Core Accepted candidate** |
| C16 | Preserve actual validation/derivation trace separately from public explanation | **Core Accepted candidate**; disclosure/schema **TBD** |

### 26.3 Explicit Forbidden summary

- Runtime/ad-hoc/retrospective choice-point insertion.
- Profile-, judge-, party-, lawyer-, law-firm-, reputation-, prestige- or outcome-dependent activation.
- ActualStateRecord, hidden AP, WorkProduct or unallowed-material access.
- Direct finding, party/claim outcome, strict/lenient, favorable/unfavorable or numeric modifier payload.
- Evidence, EvidenceUse, source, scope, coverage, requirement or alternative-path creation/deletion.
- Duplicate lineage promotion, losing-evidence deletion 또는 opposite-fact creation.
- Hidden/default midpoint, random fallback, random ordering, numeric priority와 judge RNG.
- Published criterion/CP mutation과 past evaluation rewrite.
- Invalid candidate를 finding option으로 사용하거나 result-first explanation을 생성하는 것.

### 26.4 Preserved TBD summary

Actual legal/content standards, canonical DSL/predicate/schema/API, automatic ambiguity/equivalence detection, detailed validator/tooling/UI, multi-CP precedence, fallback policy, authority review, errors, migration, AI/NLP, Godot/save/performance는 **TBD**다.

## 27. Decision history

| 버전 | 상태 | 내용 |
|---|---|---|
| v0.1 | Proposed / design review required | Criterion-owned immutable ChoicePoint, hard-first genuine-ambiguity definition, allowed activation inputs, minimum-v1 target, semantic option/boundedness, direct outcome 및 creation/deletion 금지, option distinctness, outcome independence, hard-result interaction, multiple-CP/fallback, two-layer validation failure, version preservation과 trace를 C1~C16 후보로 제안. Actual Korean law, canonical authoring/validator/schema/API, equivalence/precedence/fallback content와 implementation은 TBD. TEST-013 10-case plan만 제안하고 생성·실행하지 않음. |
| 2026-09-30 | Accepted — 원칙만 / 절차는 DEC-031로 대체 | 판사 성향은 경계 근처에서만 작용한다는 원칙만 채택. CriterionChoicePoint 작성·검증 절차는 적용하지 않음. ([DEC-LITIGATION-031](DEC-LITIGATION-031_NUMERIC_ADJUDICATION_AND_PROPOSED_DEC_RESOLUTION.md)) |
