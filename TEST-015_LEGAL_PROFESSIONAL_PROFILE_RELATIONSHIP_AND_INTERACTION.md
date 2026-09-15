# THE FIRM — Legal Professional Profile, Relationship & Interaction 수동 검증

문서 ID: TEST-015  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: [DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md](DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md) v0.1 Proposed / design review required  
상위 기준: DEC-LITIGATION-015 v0.1 Proposed / TEST-014 fixture-level verified, DEC-LITIGATION-013 v0.2 Accepted, DEC-LITIGATION-014 v0.1 Proposed / TEST-013 fixture-level verified

## 1. Purpose / verification boundary

본 테스트는 DEC-LITIGATION-016이 제안한 다음 구조를 explicit synthetic semantic fixtures에 수동 대입하여 내부 일관성을 검증한다.

```text
World-owned LegalProfessionalIdentity
→ separate role-profile histories
→ career / affiliation histories
→ typed ProfessionalRelationship graph
→ InteractionRecord
→ provenance-bearing ProfessionalInformation
→ PlayerObservedProfessionalProfile
```

`Observed`는 코드 실행 결과가 아니다. Source DEC의 Proposed semantics와 inherited boundaries를 fixture에 수동 적용한 결과다.

### 1.1 Verified boundary

- Cross-role stable identity와 role-profile separation.
- `public / observed / inferred / hidden` information separation.
- Player-known information의 explicit provenance와 temporal context.
- Internal profile과 player-facing projection의 separation.
- Typed, directional, multiple, historical relationship semantics.
- Affiliation과 actual personal relationship의 separation.
- Explicit interaction/source에 의한 bounded information update.
- Relationship, reputation, affiliation와 optional strength의 adjudicative non-interference.
- Historical role, affiliation, relationship와 inference preservation.

### 1.2 Not established by this test

본 테스트는 구현, UI, actual Korean law/practice, relationship taxonomy, LawyerProfile/ProsecutorProfile content, inference/confidence algorithm, relationship formation/decay, dialogue/networking, reputation propagation, conflict-of-interest/recusal doctrine, ethics, schema/save 또는 performance를 검증하지 않는다.

DEC-016에서 **TBD**인 항목은 이 테스트에서도 **TBD / NOT TESTED**다. Fixture에 명시된 source, relationship, interaction 또는 role transition은 test input이며, 그 생성 algorithm이나 실제 법적 타당성을 TEST-015가 정하지 않는다.

## 2. Fixed semantic vocabulary and method

| Term | TEST-015 meaning |
|---|---|
| `LegalProfessionalIdentity` | Role transitions 전후에 유지되는 World-owned stable person identity |
| `RoleProfileRef` | Judge, lawyer, prosecutor 또는 future role의 separate versioned profile reference |
| `OrganizationAffiliationHistory` | Organization과 role/tenure/effective-period를 보존하는 history |
| `ProfessionalRelationship` | Persons, typed meaning, direction, provenance, period, visibility와 history를 갖는 durable relation |
| `RelationshipEvent` | Relationship formation/change/end를 가리키는 explicit history event |
| `InteractionRecord` | Participants, context, category, visibility, information/consequence refs를 갖는 bounded record |
| `ProfessionalInformationItem` | Subject, content/ref, source, learned/effective time, visibility, uncertainty와 refinement refs를 갖는 information unit |
| `PlayerObservedProfessionalProfile` | Accessible public/observed/inferred items에서 만든 player-facing projection |
| `ReputationSummary` | Explicit public/history sources가 있는 dimensioned observation summary; legal-power stat가 아님 |

### 2.1 Information states

```text
public
observed
inferred
hidden
```

- Visibility는 truth나 certainty와 같은 축이 아니다.
- Inferred information은 internal profile truth의 복사본이 아니다.
- Qualitative confidence가 있더라도 probability나 adjudicative weight가 아니다.
- `effective_as_of`와 `player_learned_at`은 별도 의미다.

### 2.2 Litigation non-interference

Relationship, familiarity, reputation, affiliation 또는 optional strength는 직접 다음을 변경하지 않는다.

- `CriterionChoicePoint` activation/permitted options.
- `JudgeInterpretationInput`.
- Credibility or sufficiency.
- `CourtFactFinding`.
- Party/claim outcome weight.

Future lawful effects require a separately Accepted system and explicit changed input/event. TEST-015는 그러한 future rules를 발명하지 않는다.

## 3. Core verification cases

### Case 1 — Cross-role identity continuity

#### Purpose

Judge retirement와 advisor transition 뒤에도 stable person identity와 historical JudgeRoleProfile이 보존되는지 검증한다.

#### Fixture

```text
LP-15-01
  role history: judge → retired_from_judicial_assignment → advisor
  historical JudgeRoleProfile: JP-15-01/v1, JP-15-01/v2
  current advisor role ref: ARL-15-01
```

Advisor profile semantics는 supplied하지 않는다.

#### Manual verification

1. 모든 role/history refs가 `LP-15-01`을 참조하는지 확인한다.
2. Retirement가 judge assignment eligibility만 끝내고 identity를 삭제하지 않는지 확인한다.
3. Advisor role이 historical JudgeRoleProfile을 overwrite하지 않는 별도 role ref인지 확인한다.

#### Expected

- Same person id가 유지된다.
- Judge identity/profile/history가 보존된다.
- Advisor role은 separate role-profile interface를 사용한다.
- New unrelated NPC나 current-role overwrite가 없다.

#### Observed

DEC-016 P1~P3/P26과 DEC-015의 post-retirement continuity를 적용하면 한 person timeline 아래 historical judge refs와 current advisor ref가 공존한다.

#### Verdict

**PASS**

#### Boundary note

AdvisorProfile content와 canonical cross-role schema는 **TBD / NOT TESTED**다.

### Case 2 — Role-profile separation

#### Purpose

Judge interpretive trait를 lawyer capability로 자동 변환하거나 universal professional stat로 합치는 공격을 거부하는지 검증한다.

#### Fixture

```text
JudgeProfile.inference_linkage
→ LawyerProfile.persuasion
```

위 automatic transition mapping만 supplied된다.

#### Manual verification

1. Source와 target이 다른 role-specific semantic domains인지 확인한다.
2. Explicit LawyerProfile rule이 존재하는지 확인한다.
3. Shared identity가 trait conversion authority를 갖는지 검사한다.

#### Expected

- Mapping은 invalid다.
- JudgeTrait가 lawyer capability로 자동 변환되지 않는다.
- Universal professional stat로 merge되지 않는다.

#### Observed

P3은 shared identity를 join point로만 정의하고 role capability mapping을 금지한다. LawyerProfile semantics를 보충하지 않고도 attack을 거부할 수 있었다.

#### Verdict

**PASS**

#### Boundary note

Actual LawyerProfile semantics와 lawful cross-role experience effects는 **TBD / NOT TESTED**다.

### Case 3 — Public profile disclosure

#### Purpose

Accessible public career/current-role/case information만 player-facing profile에 나타나고 internal/hidden data는 보호되는지 검증한다.

#### Fixture

- Accessible sources: `SRC-CAREER-03`, `SRC-ROLE-03`, `SRC-CASE-03`.
- Hidden internal JudgeProfile: `JP-15-03/v2`.
- Private relationship: `REL-PRIVATE-03`.
- No disclosure source for the internal profile or private relationship.

#### Manual verification

1. Accessible sources와 projected information items를 역추적한다.
2. Public items에 provenance가 있는지 확인한다.
3. Hidden trait, private relation, internal key/mapping이 projection에 포함되는지 검사한다.

#### Expected

- Public career, current role와 accessible case refs만 source와 함께 표시된다.
- Hidden JudgeProfile, private relationship와 internal mapping/key는 노출되지 않는다.

#### Observed

P5/P7/P24의 disclosure projection은 accessible source가 있는 items만 통과시켰고 hidden inputs를 player-facing object에 복사하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Privacy authorization, public-record catalog와 UI rendering은 **TBD / NOT TESTED**다.

### Case 4 — Inferred profile uncertainty

#### Purpose

세 public decisions의 observable pattern이 exact trait disclosure가 아닌 bounded player inference로 표현 가능한지 검증한다.

#### Fixture

- Accessible decisions: `PD-04-A`, `PD-04-B`, `PD-04-C`.
- Each contains the same kind of observable reasoning pattern in the fixture.
- Observation time and effective/as-of refs are supplied.
- No internal JudgeTrait access.

#### Manual verification

1. Inference가 세 accessible sources를 모두 참조하는지 확인한다.
2. Internal trait key 대신 human-readable observed statement를 사용하는지 확인한다.
3. As-of time과 qualitative uncertainty가 보존되는지 확인한다.
4. Future result guarantee, hidden probability 또는 exact mapping을 포함하는지 검사한다.

#### Expected

다음과 같은 bounded inference가 가능하다.

```text
“명시적 연결을 중시하는 경향이 있어 보임”
basis: PD-04-A, PD-04-B, PD-04-C
confidence: moderate
as_of: supplied observation context
```

Exact trait assertion이나 future-outcome guarantee는 없다.

#### Observed

DEC-016 P6/P8은 source-backed qualitative inference를 명시적으로 허용한다. Fixture는 confidence calculation을 발명하지 않고 `moderate`를 supplied semantic label로 사용했으며 internal truth를 주장하지 않았다.

#### Verdict

**PASS**

#### Boundary note

세 sources가 실제로 충분한지, confidence 산출과 inference algorithm은 **TBD / NOT TESTED**다. PASS는 supplied inference representation의 boundary에 한정된다.

### Case 5 — Exact-trait leak rejection

#### Purpose

한 ambiguous case에서 exact internal JudgeTrait과 absolute confidence를 공개하는 false certainty를 거부하는지 검증한다.

#### Fixture

- One accessible but ambiguous case `PD-05-A`.
- Attempted projection:

```text
internal trait = inference_linkage:X
confidence = 100%
```

- No direct disclosure authorization or internal-profile source exists.

#### Manual verification

1. Source가 internal key를 실제 공개하는지 확인한다.
2. Observation과 internal truth를 구분한다.
3. Numeric certainty와 hidden-profile copy 여부를 검사한다.
4. Bounded observation 가능성을 automatic entitlement로 바꾸지 않는다.

#### Expected

- Exact-trait disclosure는 invalid다.
- Source DEC가 허용하는 content rule이 별도로 있다면 bounded uncertain observation 후보만 가능하다.
- 그런 rule이 supplied되지 않았으므로 이 fixture에서는 inference를 새로 생성하지 않는다.

#### Observed

P5/P6/P8/P24의 separation으로 exact key와 100% claim을 거부했다. Tester가 missing inference rule을 추가하지 않아 player-facing profile은 unchanged로 남았다.

#### Verdict

**PASS**

#### Boundary note

어떤 single observation이 bounded inference를 허용하는지는 **TBD / NOT TESTED**다.

### Case 6 — Former-colleague non-interference

#### Purpose

Explicit former-colleague relation의 유무만으로 fixed-record JII/finding semantics가 변하지 않는지 검증한다.

#### Fixture

- Judge `LP-J-06` and player lawyer `LP-L-06`.
- Variant A: explicit `former_colleague` relation.
- Variant B: no such relation.
- Both variants fix the same CourtRecordSnapshot, proposition/scope, criterion/version, ChoicePoint, JudgeProfileVersion, policy and command order.

#### Manual verification

1. ChoicePoint activation inputs에 relationship이 포함되는지 검사한다.
2. JII mapping/option inputs를 A/B에서 비교한다.
3. Credibility, sufficiency와 CourtFactFinding semantics를 비교한다.

#### Expected

- A/B의 JII와 finding semantics는 동일하다.
- Relationship은 CP activation, favorable option, credibility bonus 또는 finding change를 만들지 않는다.

#### Observed

P15/P16과 DEC-013/014의 inherited non-interference를 적용하면 relationship edge는 evaluation chain의 input이 아니다. A/B 결과 semantics가 동일했다.

#### Verdict

**PASS**

#### Boundary note

Future recusal, disclosure 또는 lawful information effects는 **TBD / NOT TESTED**다.

### Case 7 — Directional mentorship

#### Purpose

Mentor/mentee 관계의 directionality를 symmetric friendship으로 붕괴시키지 않는지 검증한다.

#### Fixture

```text
LP-A mentors LP-B
origin: EVT-MENTOR-07
```

Reverse relation is not supplied.

#### Manual verification

1. Relation endpoints와 direction을 확인한다.
2. Reverse mentor edge가 별도 evidence/event 없이 생성되는지 검사한다.
3. Relationship effect가 adjudication input으로 사용되는지 검사한다.

#### Expected

- `mentor: LP-A → LP-B`와 corresponding mentee perspective를 directionally represent할 수 있다.
- `LP-B mentors LP-A`라는 symmetric fact를 자동 생성하지 않는다.

#### Observed

P10의 direction-support boundary가 supplied edge를 보존했다. Per-type canonical rules 없이 reverse mentor assertion을 만들지 않았다.

#### Verdict

**PASS**

#### Boundary note

Canonical mentorship representation과 reciprocal projection rules는 **TBD / NOT TESTED**다.

### Case 8 — Multi-relationship coexistence

#### Purpose

같은 두 person 사이의 multiple relation types와 temporal history가 last-label overwrite 없이 공존 가능한지 검증한다.

#### Fixture

- `REL-08-A`: former_colleague, earlier effective period.
- `REL-08-B`: mentor, supplied directional period.
- `REL-08-C`: professional_rival, later or overlapping period.
- All link the same stable persons.

#### Manual verification

1. 각 relation identity/type/provenance/period를 비교한다.
2. Current projection과 historical edges를 구분한다.
3. Newest relation이 earlier records를 삭제하는지 검사한다.

#### Expected

- 각 relation/history를 별도로 보존할 수 있다.
- Simultaneous 또는 sequential meaning이 구분된다.
- Latest relation은 prior relation을 overwrite하지 않는다.

#### Observed

P11/P12의 multi-edge와 history model에 세 records를 대입하자 모두 보존됐으며 current summary가 history owner를 대체하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Conflicting relation display ordering과 canonical taxonomy는 **TBD / NOT TESTED**다.

### Case 9 — Shared affiliation ≠ friendship

#### Purpose

Same university/organization overlap이 actual personal relationship, trust 또는 bias를 자동 생성하지 않는지 검증한다.

#### Fixture

- `LP-A` and `LP-B` share `ORG-09` during overlapping effective periods.
- No `RelationshipEvent` or `ProfessionalRelationship` exists.

#### Manual verification

1. Affiliation history와 relationship graph를 별도로 조회한다.
2. Overlap이 potential connection information인지 actual edge인지 구분한다.
3. Friendship, trust, familiarity, bias 또는 favorable relation이 생성되는지 검사한다.

#### Expected

- Public이라면 affiliation overlap은 표시할 수 있다.
- Actual personal relationship은 `unknown` 또는 `unestablished`로 남는다.
- Automatic friendship/trust/familiarity/bias는 없다.

#### Observed

P20/P21에 따라 affiliation은 separate history record로 유지됐고 relationship event 부재 상태에서 personal edge를 만들지 않았다.

#### Verdict

**PASS**

#### Boundary note

Future relationship formation/discovery rules는 **TBD / NOT TESTED**다.

### Case 10 — Interaction-driven information discovery

#### Purpose

Accessible networking interaction이 explicitly disclosed한 information에 한해 player knowledge source가 될 수 있는지 검증한다.

#### Fixture

- Interaction: `INT-15-10`, accessible to player.
- Participants and context are explicit.
- Disclosed items: public career ref `INFO-CAREER-10`, professional connection ref `INFO-CONN-10`.
- No disclosure of internal traits, confidential data or relationship mutation.

#### Manual verification

1. InteractionRecord가 disclosed items의 provenance로 연결되는지 확인한다.
2. Projection update가 두 supplied items로 bounded되는지 확인한다.
3. Interaction occurrence만으로 other information/relationship effect가 생기는지 검사한다.

#### Expected

- Player profile에 disclosed career/connection information만 interaction provenance와 함께 추가된다.
- Unrelated hidden data, hidden legal-power stat와 arbitrary relationship mutation은 없다.

#### Observed

P13/P25는 explicit information refs가 있는 interaction만 knowledge update를 만들게 한다. Fixture에 effect ref가 없는 relationship change는 발생하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Dialogue, disclosure authorization, source reliability와 relationship-effect rules는 **TBD / NOT TESTED**다.

### Case 11 — Reputation favoritism rejection

#### Purpose

Professional reputation을 judge favorability percentage나 evidence/finding modifier로 사용하는 공격을 거부하는지 검증한다.

#### Fixture

```text
high reputation
→ +10% judge favorability
```

#### Manual verification

1. Proposed effect가 observable summary인지 adjudicative modifier인지 구분한다.
2. JII, credibility, sufficiency와 finding inputs를 변경하는지 확인한다.
3. Hidden numeric weight를 검사한다.

#### Expected

- Attack은 **Forbidden**이다.
- Percentage, favorable JII option, credibility/sufficiency bonus와 outcome weight가 없다.

#### Observed

P18/P19과 inherited DEC-013 boundary는 reputation을 source-backed observable summary로만 허용하며 direct modifier를 금지한다. Attack은 적용되지 않았다.

#### Verdict

**PASS**

#### Boundary note

Reputation taxonomy, aggregation와 propagation은 **TBD / NOT TESTED**다.

### Case 12 — Ordinary → prominent continuity

#### Purpose

Procedural ordinary legal professional이 prominence 상승 뒤에도 same identity/history를 유지하고 legal-power tier로 변하지 않는지 검증한다.

#### Fixture

- Ordinary professional: `LP-15-12`.
- Existing role, affiliation, relationship, interaction and public-history refs.
- Explicit prominence-resolution event `PROM-15-12`.
- No role capability or adjudicative authority change.

#### Manual verification

1. Event 전후 person id/history refs를 비교한다.
2. Future authored/simulation detail 증가와 semantic authority를 구분한다.
3. Replacement NPC, retroactive biography 또는 power upgrade를 검사한다.

#### Expected

- Same identity와 histories가 유지된다.
- Richer future detail/simulation resolution은 가능하다.
- Replacement, history rewrite와 professional/legal-power upgrade는 없다.

#### Observed

P22와 DEC-015 L19 boundary에 따라 prominence는 resolution metadata로만 작동했고 stable person graph를 변경하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Prominence threshold와 content-expansion workflow는 **TBD / NOT TESTED**다.

### Case 13 — Affiliation-history preservation

#### Purpose

Lawyer의 organization transition이 former/current affiliations와 effective periods를 보존하는지 검증한다.

#### Fixture

```text
LP-15-13
  ORG-A: former, T1–T2
  ORG-B: current, T2–
```

No relationships with ORG-B members are supplied.

#### Manual verification

1. ORG-A and ORG-B records의 effective periods/status를 확인한다.
2. Current projection이 ORG-B를 표시하면서 ORG-A history를 유지하는지 확인한다.
3. ORG-B member relationships가 자동 생성되는지 검사한다.

#### Expected

- ORG-A former history와 ORG-B current affiliation이 공존한다.
- Effective periods가 구분된다.
- ORG-A history deletion과 ORG-B auto-relationships가 없다.

#### Observed

P20/P26의 temporal history structure에서 both affiliations가 유지됐고 current view만 ORG-B를 current로 projection했다.

#### Verdict

**PASS**

#### Boundary note

Organization hierarchy, membership validation과 team relationship rules는 **TBD / NOT TESTED**다.

### Case 14 — Multi-role career timeline

#### Purpose

Prosecutor→judge→retired judge→advisor transition이 one person timeline과 separate role-profile histories로 유지되는지 검증한다.

#### Fixture

```text
LP-15-14
  T1: prosecutor role/profile ref
  T2: judge role/profile ref
  T3: retired from judicial assignment
  T4: advisor role/profile interface
```

#### Manual verification

1. 모든 periods가 same person identity를 참조하는지 확인한다.
2. 각 role profile ref가 separate history인지 확인한다.
3. Current advisor role이 prior prosecutor/judge history를 overwrite하는지 검사한다.
4. Role transition마다 new person이 생성되는지 검사한다.

#### Expected

- One stable person timeline이 유지된다.
- Role-specific histories는 분리된다.
- Current role overwrite, profile merge와 replacement identity가 없다.

#### Observed

P2/P3/P26의 identity join model은 role histories를 연결하되 semantic profiles를 합치지 않았다.

#### Verdict

**PASS**

#### Boundary note

ProsecutorProfile와 AdvisorProfile semantics는 **TBD / NOT TESTED**다.

### Case 15 — Relationship-based recusal hook

#### Purpose

Explicit relationship/affiliation refs를 future conflict-review boundary로 넘길 수 있으면서 TEST가 actual recusal rule을 결정하지 않는지 검증한다.

#### Fixture

- Relationship `REL-15-15` exists with explicit persons, provenance and visibility.
- Future review request accepts a `ConflictReviewInputRef`.
- No applicable recusal doctrine, threshold or outcome rule is supplied.

#### Manual verification

1. Relationship ref가 review input으로 전달 가능한지 확인한다.
2. Relationship record 자체가 recusal outcome을 소유하는지 검사한다.
3. Missing legal rule을 tester가 보충하는지 검사한다.

#### Expected

- Explicit relation/affiliation ref를 future review boundary로 전달할 수 있다.
- `relationship X → mandatory recusal`을 결정하지 않는다.
- Actual conflict/recusal result는 **TBD**다.

#### Observed

P17은 input hook만 제안하고 decision authority를 부여하지 않는다. Fixture는 ref 전달에서 종료됐으며 recusal result는 생성하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Actual Korean conflict-of-interest/recusal doctrine, procedure와 result는 **TBD / NOT TESTED**다. PASS는 hook separation만 뜻한다.

### Case 16 — Internal-state nondisclosure

#### Purpose

Internal role profile이 valid versioned event로 바뀌어도 accessible source가 없으면 player-facing profile이 자동 갱신되지 않는지 검증한다.

#### Fixture

- Internal role profile changes from `RP-16/v1` to `RP-16/v2` through a valid internal event.
- Player has no public source, observation or disclosure event for the change.
- Existing player projection is as of T1.

#### Manual verification

1. Internal version history와 player information refs를 분리한다.
2. New accessible `ProfessionalInformationItem`이 존재하는지 확인한다.
3. Internal update가 projection cache/view를 자동 rewrite하는지 검사한다.

#### Expected

- Internal v2는 internal history에 존재할 수 있다.
- Player-facing profile은 accessible source가 생길 때까지 unchanged다.
- Magical knowledge update가 없다.

#### Observed

P24/P25의 explicit projection boundary에서 internal change alone은 player-known item을 만들지 못했다. Existing player view가 유지됐다.

#### Verdict

**PASS**

#### Boundary note

Future observation/disclosure timing과 UI invalidation은 **TBD / NOT TESTED**다.

### Case 17 — Outdated inferred information

#### Purpose

T1 inference history를 소급 수정하지 않으면서 T2 accessible evidence로 current projection을 refine할 수 있는지 검증한다.

#### Fixture

- T1 information item `INF-17-v1`: limited sources, qualitative uncertainty.
- T2 public source `SRC-17-T2`: later accessible evidence.
- Proposed current item `INF-17-v2` references/refines v1 rather than overwriting it.

#### Manual verification

1. T1 item의 source, learned time와 effective/as-of time을 보존한다.
2. T2 source access time을 별도로 확인한다.
3. v2가 v1을 refine/supersede하는 ref를 가질 수 있는지 확인한다.
4. Historical view가 T2 knowledge를 T1에 소급 대입하는지 검사한다.

#### Expected

- T1 historical inference는 삭제/수정되지 않는다.
- T2가 accessible해진 뒤 current projection은 explicit refinement ref를 통해 갱신될 수 있다.
- Player가 T1부터 T2 information을 알았던 것처럼 rewrite하지 않는다.

#### Observed

P5/P25/P26의 temporal/provenance structure에서 T1과 T2를 별도 records로 유지하고 current projection만 v2를 사용할 수 있었다. Exact update algorithm은 사용하지 않았다.

#### Verdict

**PASS**

#### Boundary note

Automatic inference update, contradiction handling와 confidence recalculation은 **TBD / NOT TESTED**다.

### Case 18 — Relationship-strength attack

#### Purpose

Optional strength/familiarity가 high여도 favorable interpretation이나 fact-finding modifier가 되지 않는지 검증한다.

#### Fixture

- Relationship `REL-18` has optional semantic label `strength: high` as an injected placeholder.
- Attack attempts to use it for CP activation, JII option selection or litigation bonuses.
- All fixed litigation inputs remain unchanged.

#### Manual verification

1. Strength representation이 relationship description인지 litigation rule인지 구분한다.
2. CP/JII/credibility/sufficiency/finding dependencies를 검사한다.
3. Party outcome modifier 또는 hidden weight로 변환되는지 검사한다.

#### Expected

- Attack은 **Forbidden**이다.
- CP activation, JII selection, credibility/sufficiency bonus, finding change와 party outcome modifier가 없다.
- Strength representation 자체는 **TBD**다.

#### Observed

P15/P16과 strength-secondary boundary는 어떤 representation이든 direct adjudicative effect를 금지한다. `high`는 evaluation input으로 진입하지 못했다.

#### Verdict

**PASS**

#### Boundary note

Strength taxonomy, scale, update와 lawful non-litigation effects는 **TBD / NOT TESTED**다.

## 4. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Stable cross-role identity | 1, 12, 14 | PASS | Role transition/prominence가 person identity를 교체하지 않음 |
| Role-profile separation | 1, 2, 14 | PASS | Shared identity는 profile converter가 아님 |
| Public/observed/inferred/hidden separation | 3, 4, 5, 16, 17 | PASS | Visibility와 truth/certainty를 구분 |
| Provenance-bearing knowledge | 3, 4, 10, 17 | PASS | Known items have explicit source/event refs |
| Uncertainty does not equal internal truth | 4, 5, 17 | PASS | Qualitative inference only; no exact key |
| Internal/player-facing separation | 3, 4, 5, 16 | PASS | Disclosure projection remains distinct |
| Typed relationships | 6, 7, 8 | PASS | Type is primary semantic meaning |
| Directionality support | 7 | PASS | Mentor→mentee direction preserved |
| Multi-relation coexistence | 8 | PASS | Multiple edges/phases retained |
| Relationship history preservation | 8, 17 | PASS | Current projection does not overwrite history |
| Affiliation ≠ friendship | 9, 13 | PASS | Overlap does not create personal edge |
| Interaction-driven information updates | 10 | PASS | Only explicit disclosed items update knowledge |
| Relationship non-interference | 6, 15, 18 | PASS | No direct CP/JII/finding effect |
| Reputation non-interference | 11 | PASS | No legal/adjudicative modifier |
| No universal favorability score | 6, 11, 18 | PASS | Percentage/strength laundering rejected |
| Ordinary→prominent continuity | 12 | PASS | Detail resolution changes, not identity/power |
| Affiliation history preservation | 9, 13 | PASS | Former/current periods distinguishable |
| Multi-role history preservation | 1, 14 | PASS | One person, separate role histories |
| Recusal hook without rule invention | 15 | PASS | Explicit ref only; actual result TBD |
| No magical disclosure | 3, 5, 10, 16 | PASS | Accessible source required |
| Historical inference preservation | 17 | PASS | Learned time and refinement history retained |
| Relationship strength non-interference | 18 | PASS | Optional strength cannot enter adjudication |

## 5. Contradiction review

### 5.1 DEC-016 internal contradiction

**None found in the supplied fixtures.** Shared identity coexists with separate role profiles because identity is a temporal join point, not a universal ability sheet. Typed relationships, layered information and player-facing projection also coexist without granting adjudicative effects.

### 5.2 DEC-015 identity/lifecycle compatibility

**No contradiction found.** Retirement/post-career, prominence and historical preservation retain the same person identity and prior JudgeProfile refs. DEC-016 does not rewrite DEC-015 career events or profile evolution.

### 5.3 DEC-013 JII/finding boundary

**No intrusion found.** Relationship, reputation, affiliation and strength never entered fixed-record JII derivation or `CourtFactFinding`. Internal/player-facing information also did not become court evidence by mere visibility.

### 5.4 DEC-014 ChoicePoint boundary

**No intrusion found.** Social/professional metadata did not activate `CriterionChoicePoint`, create options or select favorable treatments.

### 5.5 Stable identity and profile separation

**Both preserved.** Cases 1, 2 and 14 link multiple roles to one person while maintaining distinct profile histories.

### 5.6 Universal-social-score collapse

**No collapse found.** Relationships retain type, direction, provenance, periods and history. Optional strength remains secondary and has no adjudicative authority.

### 5.7 Confidence as hidden probability

**No hidden probability introduced.** `moderate` is an injected qualitative disclosure label, not a calculated percentage or outcome weight. Calculation remains TBD.

### 5.8 Player profile as internal truth copy

**No copy found.** Public/observed/inferred information is source-bound. Hidden role-profile keys remain outside player-facing projection.

### 5.9 Affiliation auto-relationship

**No automatic relationship found.** Shared affiliation remains potential connection information only.

### 5.10 Favoritism modifier

**None found.** Direct and laundered relationship/reputation/strength modifiers are rejected.

### 5.11 Arbitrary interaction effects

**None found.** Case 10 updates only explicitly disclosed information refs. Mere interaction existence creates no trust, relation or confidential-information change.

### 5.12 Historical overwrite

**None found.** Current role, current affiliation and current inference projections preserve earlier role/affiliation/inference records.

### 5.13 Ethics/recusal rule invention

**None.** Case 15 terminates at the explicit review-input hook; actual doctrine/result remains TBD.

### 5.14 LawyerProfile/ProsecutorProfile invention

**None.** Tests use role-profile references only. Their stats, capabilities and mappings remain TBD.

### 5.15 TBD closure

**No TBD was promoted by testing.** Supplied semantic inputs were used only to test ownership, separation, trace and prohibited-effect boundaries.

## 6. False-PASS audit

For every PASS, the test asked:

```text
이 PASS는 DEC-016이 실제로 제안한 semantic boundary 때문에 가능한가?

아니면 tester가 빠진 relationship/inference/profile rule을
임의로 추가했기 때문에 가능한가?
```

| Case | False-PASS attack | Result |
|---:|---|---|
| 1 | AdvisorProfile schema가 있어야 continuity가 성립하는가? | No. Same-person + separate role ref만 검증했다. |
| 2 | Lawyer capability rule을 tester가 정의했는가? | No. Undefined mapping을 거부하고 semantics를 TBD로 유지했다. |
| 3 | Public/private rule catalog를 발명했는가? | No. Fixture가 explicit accessibility를 공급했다. |
| 4 | Three decisions 또는 `moderate`를 universal threshold로 만들었는가? | No. Supplied bounded inference representation만 검증했다. |
| 5 | One-case inference rule을 임의 허용했는가? | No. Exact leak을 거부하고 no inference로 닫았다. |
| 6 | Relationship의 lawful effect 전체를 금지했는가? | No. Fixed-record direct effect만 금지했다. |
| 7 | Canonical direction taxonomy를 확정했는가? | No. Direction support만 검증했다. |
| 8 | Conflict/display ordering을 설계했는가? | No. Coexistence/history만 검증했다. |
| 9 | Affiliation이 절대 relation evidence가 될 수 없다고 정했는가? | No. Automatic relationship만 거부했다. |
| 10 | Mere interaction이 disclosure를 만든다고 가정했는가? | No. Explicit disclosed-item refs가 fixture에 supplied됐다. |
| 11 | Reputation system 전체를 설계했는가? | No. Direct favorability attack만 거부했다. |
| 12 | Prominence threshold/power를 만들었는가? | No. Explicit resolution event와 identity continuity만 검증했다. |
| 13 | Organization membership rules를 정했는가? | No. Supplied affiliations의 temporal preservation만 확인했다. |
| 14 | Non-judge profile content를 발명했는가? | No. Separate refs/history only. |
| 15 | Relationship X의 recusal effect를 정했는가? | No. Review hook에서 중단하고 result를 TBD로 유지했다. |
| 16 | Internal update notification rule을 만들었는가? | No. Source 없음 → disclosure 없음이라는 P25 boundary만 적용했다. |
| 17 | Automatic inference-update algorithm을 만들었는가? | No. Supplied refinement ref와 temporal history만 검증했다. |
| 18 | Strength scale/effect를 설계했는가? | No. Whatever the representation, adjudicative use is forbidden. |

False-PASS audit 후에도 각 verdict는 DEC-016이 실제로 제안한 semantic boundary만으로 유지된다.

## 7. Specific attack checklist

### Attack A — Social-score collapse

**Attack:** Multiple typed relationships를 `Affinity = 82` 하나로 압축하여 모든 interaction과 effects를 결정한다.  
**Result:** **Rejected / PASS.** Numeric summary가 P7~P12의 type, direction, provenance, effective period와 history를 대체하므로 DEC-016 minimum model과 양립하지 않는다. Optional strength가 존재해도 graph semantics를 대체하지 못한다.

### Attack B — Trait leak

**Attack:** Player-facing profile generator가 internal JudgeProfile key를 직접 복사한다.  
**Result:** **Forbidden / PASS.** P5/P6/P24의 disclosure projection을 우회한다. Accessible source와 authorized public representation 없이는 internal key를 공개할 수 없다.

### Attack C — Favorability laundering

**Attack:**

```text
relationship
→ hidden reputation
→ favorable option
```

**Result:** **Forbidden / PASS.** Intermediate label을 추가해도 origin dependency가 relationship metadata이며 endpoint가 JII option이므로 P15/P16과 DEC-013/014 non-interference를 위반한다.

### Attack D — Affiliation laundering

**Attack:** Same law school/firm background만으로 friendship, trust와 bias를 생성한다.  
**Result:** **Invalid / PASS.** P20/P21에 따라 affiliation overlap은 relationship과 별개다. Explicit formation rule/event가 없으므로 edge가 생성되지 않는다.

### Attack E — Interaction laundering

**Attack:** Interaction existence alone produces `relationship +1`, `trust +1` and new confidential information.  
**Result:** **Not permitted by DEC-016 / PASS.** P13/P25는 explicit information/consequence refs와 separately defined rule을 요구한다. Missing rules를 tester가 보충하지 않는다.

### Attack F — Current-state rewrite

**Attack:** Current advisor lookup이 prior judge/prosecutor history를 삭제한다.  
**Result:** **Invalid / PASS.** P2/P26과 DEC-015 historical preservation을 위반한다. Current projection과 historical timeline must coexist.

## 8. Information-specific verification

TEST-015는 다음 dimensions를 하나의 timestamp/status로 합치지 않았다.

| Dimension | Meaning | Verified in |
|---|---|---:|
| Information effective time | Subject information이 적용되거나 참조되는 시점 | 3, 13, 17 |
| Player learned time | Player가 source에 접근하여 알게 된 시점 | 10, 16, 17 |
| Source/provenance | 왜 player-known item이 존재하는지 | 3, 4, 10, 17 |
| Current visibility | 현재 player projection에 표시 가능한지 | 3, 16, 17 |
| Current inference | Current accessible sources로 만든 bounded projection | 4, 17 |
| Historical inference | Earlier knowledge state, source와 as-of context | 17 |

Core temporal distinction:

```text
when information is true/effective
≠ when the player learned it
```

Case 17에서 T2 source는 T1 inference의 historical existence를 rewrite하지 않았다. Case 16에서 internal truth가 바뀌었어도 learned source가 없으므로 player knowledge는 변하지 않았다.

본 verification은 canonical timestamp fields, clock precision, source reliability 또는 update algorithm을 확정하지 않는다.

## 9. Relationship-specific verification

| Relationship dimension | Manual finding | Cases |
|---|---|---:|
| Type | Generic affinity 대신 explicit semantic type를 보존 가능 | 6, 7, 8 |
| Direction | Directional mentorship를 표현 가능 | 7 |
| Provenance | Explicit relationship/event source를 참조 가능 | 6, 7, 15 |
| Effective period | Former/current/overlapping relation history 구분 가능 | 8 |
| Current vs historical state | Current summary가 historical edge를 삭제하지 않음 | 8 |
| Multi-edge coexistence | Same pair의 multiple relationship types 보존 | 8 |
| Optional strength independence | Strength는 CP/JII/finding input이 아님 | 18 |
| Visibility/disclosure | Private relation은 source 없이 public projection에 나타나지 않음 | 3, 15 |

이는 semantic capability verification이다. Canonical fields, relation taxonomy, storage, strength scale, formation/decay와 visibility algorithm은 확정하지 않는다.

## 10. Remaining TBD / NOT TESTED

다음은 TEST-015에서 검증하지 않았으며 PASS count에 포함하지 않는다.

- Exact `LegalProfessional` role catalog.
- `LawyerProfile` semantics.
- `ProsecutorProfile` semantics.
- Advisor/arbitrator/mediator/academic profile semantics.
- Canonical relationship taxonomy.
- Relationship strength representation.
- Relationship formation/decay/change/end rules.
- Interaction dialogue system.
- Networking events and generation.
- Recruitment negotiation/mechanics.
- Mentorship benefits.
- Reputation taxonomy.
- Reputation aggregation, propagation and decay.
- Confidence calculation.
- Inference algorithm and sufficiency for inference.
- Misinformation/deception and correction.
- Source reliability.
- Media/public-source system.
- Actual conflict-of-interest rules.
- Actual Korean recusal doctrine and procedure.
- Ethics violations and discipline.
- Lobbying.
- Gifts/favors.
- Corruption/bias systems.
- Confidentiality/privacy/authorization rules.
- Player-facing UI.
- Search/filter.
- NPC/social/dialogue AI.
- Canonical schema/API/save/migration.
- Godot/GDScript implementation.
- Runtime integration correctness.
- Performance/graph scaling.

## 11. Final verification summary

```text
Total core cases: 18
PASS: 18
PARTIAL: 0
FAIL: 0
```

**Final result: 18 PASS / 0 PARTIAL / 0 FAIL.**

- DEC-016 v0.1을 reopen해야 하는 contradiction: **없음**.
- 문제가 확인된 P decision: **없음**.
- DEC-013 JII/finding boundary 침범: **없음**.
- DEC-014 ChoicePoint activation boundary 침범: **없음**.
- DEC-015 identity/lifecycle boundary 침범: **없음**.
- Fixture-level verification 기준으로 DEC-016의 향후 Accepted 승격을 막는 문제: **없음**.

이 결과는 DEC-016을 자동으로 Accepted로 변경하지 않는다. Actual Korean law/practice, unresolved TBD, canonical implementation, UI 또는 runtime correctness를 검증 완료했다는 뜻도 아니다.
