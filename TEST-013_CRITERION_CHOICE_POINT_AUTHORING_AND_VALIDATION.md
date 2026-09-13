# THE FIRM — Criterion Choice Point Authoring & Validation 수동 검증

문서 ID: TEST-013  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: `DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md` v0.1 Proposed

## 1. Purpose / verification boundary

본 테스트는 DEC-LITIGATION-014의 proposed semantic boundary를 synthetic fixture에 수동 대입하여 다음 구조가 내부적으로 일관되는지 검증한다.

```text
RecognitionCriterionVersion
  → hard evaluation
    → declared CriterionChoicePoint activation
      → ownership / target / option / boundedness validation
        → genuine ambiguity
          → JudgeProfile derivation permitted
```

검증 범위는 manual / fixture-level semantics다.

본 테스트는 actual Korean law, automatic ambiguity detection, semantic-equivalence algorithm, full validator implementation, canonical schema/API, Godot/save/UI 또는 final adjudication을 검증하지 않는다.

---

## 2. Verification assumptions

다음은 테스트 편의를 위한 신규 규칙이 아니라 DEC-014의 proposed boundaries를 그대로 사용한다.

- ChoicePoint는 immutable `RecognitionCriterionVersion`이 소유한다.
- Hard evaluation이 ChoicePoint보다 먼저다.
- Genuine ambiguity는 predeclared semantically distinct treatments가 있을 때만 존재한다.
- Minimum v1 CP는 one explicit requirement + one explicit affected scope를 target한다.
- Activation은 profile-independent하다.
- Options은 evidence/scope/requirement/path를 생성하거나 삭제하지 않는다.
- Direct finding/outcome payload는 invalid다.
- Invalid content는 authoring에서 reject하고, runtime leakage 시 fail-closed `undetermined`를 사용한다.
- Criterion-owned explicit fallback 외 임의 default는 없다.
- Published criterion content의 semantic change는 새 version을 요구한다.

---

# 3. Core verification cases

## Case 1 — Hard-sufficient CP rejection

### Purpose

Clearly sufficient hard result에서 ChoicePoint가 effective하게 작동하지 않는지 검증한다.

### Fixture

- Criterion: `C-13-1/v1`
- ChoicePoint: `CP-13-1`
- Target: `R-1 / S-1`
- 모든 mandatory requirement가 allowed record에서 clearly satisfied.
- `CP-13-1` 자체는 criterion content에 존재한다.

### Manual verification

1. Allowed record와 criterion만으로 hard evaluation을 수행한다.
2. 결과가 clearly sufficient에서 닫힌다.
3. CP activation 및 JudgeProfile derivation으로 진입하지 않는다.
4. CP가 존재한다는 이유만으로 genuine ambiguity를 생성하지 않는다.

### Expected

- Existing hard finding 유지.
- Effective CP 없음.
- JII 없음.
- Profile effect 없음.

### Observed

Hard-result gate에서 evaluation이 닫혔다. CP 존재는 semantic effect를 만들지 않았고 downstream judge layer가 호출될 이유도 발생하지 않았다.

### Verdict

**PASS**

### Boundary note

No-effect trace의 canonical representation은 검증하지 않았다.

---

## Case 2 — Hard-insufficient CP rejection

### Purpose

Missing mandatory coverage를 interpretation으로 구제할 수 없는지 검증한다.

### Fixture

- Criterion: `C-13-2/v1`
- Mandatory requirement `R-2`.
- Required scope `S-2`.
- Supporting `EvidenceUse` 없음.
- Invalid attempted option: `lenient`.

### Manual verification

1. Mandatory scope coverage를 확인한다.
2. Supporting EvidenceUse 부재로 hard insufficiency가 성립한다.
3. `lenient` option이 semantic treatment가 아닌 personality/result modifier인지 검사한다.
4. Evidence/scope/requirement waiver 생성 여부를 검사한다.

### Expected

- CP effective activation 없음.
- Missing coverage 생성 금지.
- Requirement waiver 금지.
- Existing `not_established_on_record` 유지.
- JII 없음.

### Observed

Interpretive choice 이전에 hard insufficiency가 확정됐다. `lenient`는 valid option이 아니며 gap을 메울 수 없었다.

### Verdict

**PASS**

---

## Case 3 — Missing-input laundering rejection

### Purpose

Missing evidence, scope 또는 rule/input을 genuine ambiguity로 위장할 수 없는지 검증한다.

### Fixture

세 variants:

- A: target EvidenceUse missing.
- B: PropositionScope missing.
- C: required conflict/rule input missing.

Authoring candidate는 각각 missing input을 ambiguity condition으로 사용한다.

### Manual verification

1. 각 missing input을 hard-input boundary에서 식별한다.
2. 둘 이상의 actual semantic treatments가 존재하는지 검사한다.
3. Candidate가 missing resource를 option으로 생성하려 하는지 확인한다.

### Expected

- A/B는 missing evidence/scope를 CP가 생성하지 못함.
- C는 missing rule/input을 personality가 보완하지 못함.
- Genuine ambiguity로 인정하지 않음.
- Existing hard-insufficient 또는 `undetermined` boundary 유지.

### Observed

세 variant 모두 “판단이 어렵다”는 사실과 genuine ambiguity가 분리됐다. Missing input은 semantic choice가 아니며 CP authoring으로 세탁할 수 없었다.

### Verdict

**PASS**

---

## Case 4 — Valid inference-link ambiguity

### Purpose

실제 allowed record가 존재하고 criterion이 distinct bounded treatments를 사전 선언한 경우 valid CP candidate가 성립 가능한지 검증한다.

### Fixture

- Criterion: `C-13-4/v1`
- CP: `CP-13-4`
- Target: `R-link / S-link`
- Existing allowed circumstantial links 존재.
- Hard result는 아직 닫히지 않음.
- Options:
  - `accept_bounded_link`
  - `require_direct_link`

두 option 모두 target/no-effect boundary와 content basis를 가진다.

### Manual verification

1. Criterion version이 CP를 소유하는지 확인한다.
2. Activation condition을 profile 없이 판정한다.
3. One requirement + one scope target을 확인한다.
4. 두 options의 semantic effects가 실제로 다른지 확인한다.
5. 새 evidence/link/path 생성 여부를 확인한다.

### Expected

- Potential valid genuine ambiguity.
- JudgeProfile derivation 진입 가능.
- Difference는 `R-link / S-link`에 한정.
- Actual legal permissibility 자체는 NOT TESTED.

### Observed

두 options는 label만 다른 것이 아니라 existing linkage에 서로 다른 treatment를 적용했다. Effect boundary도 target에 한정되어 minimum semantic validity를 만족했다.

### Verdict

**PASS**

### Boundary note

두 treatments가 실제 한국법상 permissible한지는 검증하지 않았다.

---

## Case 5 — Valid scoped credibility ambiguity

### Purpose

특정 statement/scope의 credibility ambiguity가 bounded CP로 표현 가능한지 검증한다.

### Fixture

- Allowed statement `E-5`.
- Explicit inconsistency 존재.
- Target: `R-cred / S-phrase`.
- Options:
  - `limited_for_scope`
  - `remain_disputed`

### Manual verification

1. CP target을 `R-cred / S-phrase`로 고정한다.
2. 두 treatment가 실제 semantic distinction을 가지는지 확인한다.
3. Witness 전체 truth/lie 판정을 생성하는지 확인한다.
4. Scope 밖 credibility propagation 여부를 확인한다.

### Expected

- Potential valid CP candidate.
- Statement의 지정 scope에만 effect.
- Witness 전체 status 생성 없음.
- Opposite fact 생성 없음.

### Observed

두 option은 특정 scope의 treatment에서만 차이가 발생했다. Witness 전체 또는 다른 scope로 effect가 전파되지 않았다.

### Verdict

**PASS**

---

## Case 6 — Direct finding / outcome payload rejection

### Purpose

ChoicePoint가 fact finding이나 claim outcome을 직접 선택하지 못하는지 검증한다.

### Fixture A

```text
recognized
not_established_on_record
```

### Fixture B

```text
plaintiff_wins
defendant_wins
```

### Fixture C

```text
strict
lenient
+10 credibility
-20% sufficiency
```

### Manual verification

각 candidate가:

- semantic treatment를 포함하는가?
- explicit target/no-effect boundary를 가지는가?
- canonical status/outcome/modifier 자체를 payload로 사용하는가?

를 검사한다.

### Expected

A/B/C 전부 invalid.

### Observed

A는 CourtFactFinding을 직접 선택하고, B는 adjudication outcome을 직접 선택하며, C는 semantic treatment 대신 personality/numeric modifier를 사용한다.

모두 CP option으로 사용할 수 없다.

### Verdict

**PASS**

---

## Case 7 — Semantic duplicate-option rejection

### Purpose

서로 다른 label만으로 fake ambiguity를 만들 수 없는지 검증한다.

### Fixture

Options:

```text
accept_link
allow_link
```

두 option 모두:

- 동일 record를 사용.
- 동일 target을 사용.
- 동일 existing link를 허용.
- 동일 requirement-resolution effect.
- 동일 no-effect boundary.

### Manual verification

1. Labels를 제외한 treatment semantics를 비교한다.
2. Requirement resolution effect가 달라지는지 확인한다.
3. 서로 다른 permissible interpretation이 실제 존재하는지 판단한다.

### Expected

- Genuine ambiguity 아님.
- Invalid CP candidate.
- Automatic semantic equivalence algorithm을 검증했다고 주장하지 않음.

### Observed

두 option은 이름만 다르고 의미 effect는 동일했다. Minimum semantic-distinctness constraint에 실패했다.

### Verdict

**PASS**

### Boundary note

판정은 explicit synthetic fixture의 manual equivalence에 한정된다.

---

## Case 8 — Profile / prestige-dependent activation rejection

### Purpose

Activation이 judge/player-side metadata와 독립적이어야 하는지 검증한다.

### Fixture A

```text
activate if judge trait =
accepts_bounded_circumstantial_link
```

### Fixture B

```text
activate if law firm prestige = high
```

### Fixture C

```text
activate if party = plaintiff
```

### Manual verification

1. Predicate dependency를 추적한다.
2. Allowed record/hard trace만으로 activation 판정 가능한지 확인한다.
3. Profile resolution보다 먼저 activation할 수 있는지 확인한다.

### Expected

A/B/C 모두 invalid.

### Observed

A는 profile을 먼저 읽어야 하고, B/C는 record 밖 party/prestige metadata에 의존한다. 모두 profile-independent activation invariant를 위반한다.

### Verdict

**PASS**

---

## Case 9 — Multiple / overlapping ChoicePoints

### Purpose

여러 CP가 coexist할 때 hidden ordering이나 random tie-break 없이 bounded composition이 유지되는지 검증한다.

### Fixture A — Independent

- `CP-9A`: `R-A / S-A`
- `CP-9B`: `R-B / S-B`
- Targets non-overlapping.
- 서로의 activation/input을 변경하지 않음.

### Fixture B — Overlap conflict

- `CP-9C`
- `CP-9D`
- 동일 `R-X / S-X`.
- Incompatible treatments.
- Explicit dependency/precedence 없음.

### Manual verification

Variant A:

- CP들을 독립적으로 평가한다.
- File/ID order에 의미 dependency가 없는지 확인한다.

Variant B:

- Target overlap을 확인한다.
- Explicit deterministic dependency가 없는지 확인한다.
- File order, numeric priority, RNG 사용 여부를 검사한다.

### Expected

- A: independent coexistence 가능.
- B: invalid unresolved overlap.
- Runtime까지 B가 도달하면 `undetermined` + explicit reason.
- 임의 tie-break 없음.

### Observed

A에서는 두 CP가 서로의 semantic inputs를 변경하지 않아 독립 composition이 가능했다.

B에서는 어떤 CP를 먼저 적용하느냐가 결과에 영향을 줄 수 있으므로 authoring validity를 얻지 못했다. DEC-014의 exact precedence language가 TBD이므로 새로운 precedence를 발명하지 않고 safe-stop 경계를 유지했다.

### Verdict

**PASS**

### Boundary note

Dependent/overlapping CP의 canonical precedence syntax는 NOT TESTED다.

---

## Case 10 — Version preservation + runtime invalid-candidate safety

### Purpose

Published CP semantic modification이 새 criterion version을 요구하며, invalid legacy content가 runtime까지 유출되어도 finding에 사용되지 않는지 검증한다.

### Fixture A — Version preservation

Earlier evaluation:

```text
RecognitionCriterionVersion = C-10/v1
ChoicePoint = CP-10/v1 semantics
```

Option treatment 변경 요청 발생.

Later criterion:

```text
RecognitionCriterionVersion = C-10/v2
```

### Fixture B — Runtime invalid candidate

Legacy CP가:

- valid stable ID를 가지지만
- option effect가 target scope 밖으로 전파됨.
- Authoring validation에서 누락되어 runtime까지 도달.

### Manual verification

Fixture A:

1. v1의 CP semantics를 mutate하지 않는다.
2. v2를 새 version으로 생성한다.
3. Earlier trace가 계속 v1을 참조하는지 확인한다.

Fixture B:

1. Runtime defensive validation에서 boundary escape를 확인한다.
2. Profile/JII derivation으로 전달하지 않는다.
3. Arbitrary fallback을 사용하지 않는다.
4. Existing canonical status 체계를 유지한다.

### Expected

Fixture A:

- Past evaluation stays on v1.
- Later applicable evaluation may use v2.
- Retroactive rewrite 없음.

Fixture B:

- Invalid CP 사용 금지.
- No JudgeProfile resolution.
- No JII.
- Canonical `undetermined`.
- Explicit validation-stop reason.
- Fifth status 없음.

### Observed

Version graph는 v1/v2를 분리해 past replay를 보존했다.

Runtime invalid candidate는 finding path에 진입하지 못했으며 safe-stop `undetermined`로 종료할 수 있었다. Exact validation error key는 발명하지 않았다.

### Verdict

**PASS**

---

# 4. Cross-case invariant matrix

| invariant | cases | result |
|---|---:|---|
| Criterion owns choice points | 4, 5, 10 | PASS |
| Stable versioned identity | 4, 10 | PASS |
| Profile-independent activation | 4, 5, 8 | PASS |
| Hard-first | 1, 2, 3 | PASS |
| Genuine ambiguity only | 3, 4, 5, 7 | PASS |
| Explicit target requirement/scope | 4, 5, 9 | PASS |
| Semantically distinct options | 4, 5, 7 | PASS |
| No direct finding payload | 6 | PASS |
| No party/claim outcome payload | 6 | PASS |
| No evidence creation | 2, 3, 4 | PASS |
| No scope creation | 2, 3, 5 | PASS |
| No requirement deletion | 2, 3 | PASS |
| No alternative path creation | 2, 4 | PASS |
| No hidden/unallowed input | 8 | PASS |
| No prestige/reputation activation | 8 | PASS |
| No RNG | 9 | PASS |
| No numeric hidden weighting | 6, 9 | PASS |
| Option effect remains bounded | 4, 5, 9, 10 | PASS |
| Invalid candidate cannot affect finding | 6, 7, 8, 9, 10 | PASS |
| Criterion-declared fallback only | 9, 10 | PASS |
| Version history preserved | 10 | PASS |
| Actual validation/derivation trace preserved | 4, 9, 10 | PASS |

---

# 5. Verification findings

## 5.1 Contradictions

**None found.**

The proposed C1–C16 boundaries can be applied consistently across all 10 synthetic fixtures.

No case required:

- new CourtFactFinding status,
- hidden numeric priority,
- random tie-break,
- judge/profile-first activation,
- evidence or scope creation,
- requirement deletion,
- direct outcome selection,
- retrospective criterion mutation.

## 5.2 Important qualification

PASS means only that the proposed semantic boundary behaves coherently under the supplied manual fixtures.

It does **not** establish that:

- a proposed ambiguity is legally valid under Korean law,
- semantic equivalence can be automatically detected,
- every possible overlapping-CP configuration is resolved,
- validator implementation is complete,
- runtime code behaves correctly.

---

# 6. Remaining TBD / NOT TESTED

The following remain outside TEST-013:

- actual Korean-law ambiguity categories,
- actual criterion/option content,
- authoring DSL,
- predicate syntax,
- automatic ambiguity detection,
- automatic semantic equivalence,
- complete validator implementation,
- authority/content review workflow,
- exact error vocabulary,
- dependent/overlapping CP precedence syntax,
- multi-target CP semantics,
- actual fallback legal/content policy,
- serialization/API/schema,
- save/load/migration,
- Godot/GDScript,
- authoring UI,
- AI/NLP authoring,
- performance,
- final adjudication,
- appellate/remand legal effect.

---

# 7. Final verification summary

```text
Total core cases: 10
PASS: 10
PARTIAL: 0
FAIL: 0
```

**Final result: 10 PASS / 0 PARTIAL / 0 FAIL.**

DEC-LITIGATION-014 v0.1의 C1–C16 proposed semantic architecture는 supplied manual synthetic fixtures에서 internally coherent하다.

특히 다음 boundaries는 서로 충돌 없이 유지됐다.

- hard-first,
- genuine ambiguity only,
- criterion-owned immutable ChoicePoint,
- profile-independent activation,
- explicit bounded target,
- semantically distinct options,
- no direct outcome switch,
- no evidence/scope/requirement laundering,
- no hidden priority/RNG,
- fail-closed runtime defense,
- immutable version history.

TEST-013 결과만 놓고 보면 DEC-014의 proposed decisions를 reopen해야 할 contradiction은 발견되지 않았다.

`Core Accepted candidate → Core Accepted`,
`Accepted candidate → Accepted`로 승격하는 것을 막는 fixture-level 결과는 없다.
