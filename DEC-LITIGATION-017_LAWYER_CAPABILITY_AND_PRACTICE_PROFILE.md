# THE FIRM — Lawyer Capability & Practice Profile 최소 모델

문서 ID: DEC-LITIGATION-017  
버전: v0.1 — 2026-09-30 Accepted (DEC-031)  
상태: **Accepted — DEC-031로 개정**  
결정 기록: 2026-09-30 사용자 결정 — LWP2 개정: 내부 수치 허용, 플레이어 표시는 언어. 단일 종합 점수 금지·능력 비가산 등 나머지 유지. 상세는 [DEC-LITIGATION-031](DEC-LITIGATION-031_NUMERIC_ADJUDICATION_AND_PROPOSED_DEC_RESOLUTION.md). 구현 시 Hard invariants는 구속, semantic 층 분리는 참고.  
프로젝트: THE FIRM  
문서 유형: Design Decision  
상위 기준: [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) v0.2, [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) v0.2  
시스템 기준: [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) v0.2  
직접 Accepted 기준: [DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) v0.2 Accepted  
직접 proposed/verified 기준: [DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md) v0.1 Proposed, [DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md](DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md) v0.1 Proposed, [DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md](DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md) v0.1 Proposed  
검증 참고: [TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md), [TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md), [TEST-014_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md](TEST-014_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md), [TEST-015_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md](TEST-015_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md)

## 1. Purpose / boundary

이 문서는 THE FIRM에서 lawyer가 flat stat card나 outcome bonus가 아니라 다음 causal chain을 가진 persistent legal professional이 되기 위한 minimum semantic model을 제안한다.

```text
stable LegalProfessionalIdentity
→ role-specific LawyerRoleProfileVersion
→ qualitative CapabilityEntry structure
→ practice specialization + experience history
→ TaskAssignment and execution context
→ LawyerWorkProduct
→ explicit allowed record / procedural changes
→ existing Litigation evaluation
```

목표는 다음과 같다.

1. Lawyers have distinct combinations of competence, style, scope and experience.
2. Capability를 boolean 또는 universal 0~100 stat로 환원하지 않는다.
3. Capability-specific qualitative vocabulary와 application scope를 허용한다.
4. Strengths, limitations, history와 provenance를 함께 표현한다.
5. 동일하게 우수한 lawyers도 서로 다른 task profiles를 가질 수 있다.
6. LawyerProfile은 judge acceptance, JII 또는 finding에 direct bonus를 주지 않는다.
7. Capability effect는 assigned task와 actual work execution을 요구한다.
8. WorkProduct가 allowed record/procedure input으로 명시적으로 materialize된 경우에만 existing Litigation이 이를 평가한다.
9. Specialization은 medium-level area와 detailed case-history tags를 분리한다.
10. Experience/training/mentorship/work history에 근거한 immutable profile evolution을 지원한다.

### 1.1 Non-goals

이 문서는 다음을 확정하지 않는다.

- Actual Korean attorney qualification, practice, ethics 또는 procedure.
- Canonical capability, task, specialization, experience-tag 또는 WorkProduct taxonomy.
- WorkProduct quality-resolution formula, thresholds or numeric weights.
- Investigation, research, examination, drafting, negotiation 또는 client systems의 complete mechanics.
- Lawyer AI, player progression, hiring, compensation 또는 employment mechanics.
- Workload/fatigue/burnout, team coordination 또는 assignment algorithm.
- Canonical Godot classes, JSON, API, save schema, UI or performance implementation.
- TEST-016의 작성 또는 실행.

### 1.2 Decision markers

| Marker | Meaning |
|---|---|
| **Accepted / Core Accepted** | Prior DEC에서 이미 채택되어 DEC-017이 reopen하지 않는 boundary |
| **Accepted candidate** | Review에서 채택을 추천하는 LawyerProfile semantic structure |
| **Core Accepted candidate** | Implementation과 무관하게 보존해야 할 causal/non-interference/version boundary |
| **TBD** | Vocabulary, content, algorithm, validation or implementation evidence가 필요한 항목 |
| **Forbidden** | Inherited boundary나 capability philosophy와 양립하지 않는 구조 |

## 2. Inherited hard guardrails

### 2.1 From DEC-013 — Accepted

- Lawyer skill, identity, firm prestige와 reputation은 fixed record의 JII 또는 `CourtFactFinding`을 직접 수정하지 않는다.
- Judge interpretation은 hard evaluation 이후 criterion-declared genuine ambiguity와 explicit JII를 통해서만 작동한다.
- Lawyer capability는 JudgeProfile/trait 또는 permitted option selector가 아니다.
- ActualStateRecord, hidden AP와 unsubmitted/unallowed material은 judicial evaluation inputs가 아니다.

```text
lawyer capability
→ actual questioning / investigation / drafting / submission / framing work
→ changed allowed record or procedure-facing input
→ Litigation evaluation
```

다음은 **Forbidden**이다.

```text
elite lawyer
→ judge favorability or acceptance bonus
→ finding modifier
```

### 2.2 From DEC-014 — Proposed and TEST-013 fixture-verified boundary

DEC-014는 Proposed status를 유지한다. DEC-017은 다음 verified boundary를 침범하지 않는다.

- Lawyer capability는 `CriterionChoicePoint`를 생성하거나 activation을 직접 변경하지 않는다.
- Capability는 permitted option을 추가하거나 favorable option을 선택하지 않는다.
- Missing evidence, scope, requirement 또는 alternative path를 만들어내지 않는다.
- Direct finding/outcome switch, hidden numeric weight와 arbitrary RNG를 사용하지 않는다.
- Internal `LawyerWorkProduct`는 제출·수신·허용 절차 없이 judicial record input이 아니다.

### 2.3 From DEC-015 — Proposed and TEST-014 fixture-verified boundary

- Stable identity와 version histories는 career changes 뒤에도 유지된다.
- Profile evolution은 explicit eligible event/rule과 new immutable version을 요구한다.
- Single outcome와 win/loss statistics는 direct profile-mutation trigger가 아니다.
- Major/ordinary difference는 simulation resolution이지 legal authority가 아니다.

### 2.4 From DEC-016 — Proposed and TEST-015 fixture-verified boundary

- `LegalProfessionalIdentity`와 role-specific profiles는 분리된다.
- Judge traits를 lawyer capabilities로 자동 복사하지 않는다.
- Reputation/relationship/affiliation은 capability 또는 finding의 hidden modifier가 아니다.
- Player-facing LawyerProfile은 public/observed/inferred/hidden separation과 provenance를 따라야 한다.
- Ordinary professional도 stable identity/history를 가지며 prominence change가 legal power를 만들지 않는다.

TEST-014/015의 fixture-level PASS는 DEC-015/016을 자동 Accepted로 만들지 않는다. DEC-017은 verified semantics를 dependency로 사용하되 그 status를 변경하지 않는다.

## 3. Capability philosophy

### 3.1 Neither O/X nor universal 0–100

A capability may use semantic vocabulary appropriate to its nature.

```text
proficiency:
limited → developing → competent → strong → exceptional

approach:
cautious ↔ balanced ↔ aggressive

scope/precision:
broad / moderate / narrow

practice familiarity:
novice / experienced / deep-specialist
```

These terms are illustrative, not a canonical shared scale. `exceptional` in legal research is not arithmetically interchangeable with `aggressive` in negotiation style.

### 3.2 Capability semantic bundle

```text
CapabilityEntry
├─ capability domain
├─ qualitative level or tendency
├─ applicability / scope
├─ known strengths
├─ known limitations
├─ experience/history basis
├─ training/mentorship basis
└─ immutable profile version / provenance
```

A label without domain, scope or applicable task is insufficient to define gameplay effect.

### 3.3 No universal total lawyer score

The following are **Forbidden as canonical semantics**:

```text
Lawyer Power = 87
```

```text
litigation 80 + negotiation 72 + research 91
→ overall 83
```

Implementation may later use numbers for non-authoritative indexing, tuning or storage if separately validated. Such numbers must not become the canonical player meaning, hidden weighted outcome formula, cross-domain ordering or adjudicative modifier. Whether any internal numeric representation is necessary remains **TBD**.

## 4. Design decisions

## 4.1 LWP1 — LawyerProfile ownership

**문제:** Lawyer capability/profile history를 어느 identity/system이 소유하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Case owns disposable lawyer stats | Simple | Cross-case identity/history loss | **Forbidden** |
| B. Shared identity owns universal abilities | One object | Role-profile collapse | Rejected |
| C. World identity links versioned LawyerRoleProfile owned by practice system | Persistent and bounded | Reference/version discipline | **Recommended** |

**추천안 — LWP1-C:** World owns stable `LegalProfessionalIdentity`; lawyer/practice system owns `LawyerRoleProfileVersion` semantics and immutable history beneath that identity. Litigation consumes task outputs and contemporaneous refs, not the whole internal profile.

**상태:** **Core Accepted candidate.** Canonical module/API ownership is **TBD**.

**이유:** DEC-016 identity continuity와 role-profile separation을 lawyer domain에 적용한다.

## 4.2 LWP2 — Qualitative capability representation

**문제:** Capability의 canonical semantic representation은 무엇인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Boolean | Simple | No depth, scope or limitation | Insufficient |
| B. Universal 0–100 | Easy sorting/tuning | False precision and hidden arithmetic | **Forbidden as canonical model** |
| C. Qualitative spectrum/band + scope/history | Explainable and distinct | Vocabulary authoring needed | **Recommended** |

**추천안 — LWP2-C:** Capability is represented by capability-specific qualitative meaning plus applicability, strengths, limitations and provenance/history.

**상태:** **Core Accepted candidate.** Any internal numeric representation is **TBD** and cannot own semantic/outcome meaning.

**이유:** Meaningful difference를 유지하면서 universal power number를 피한다.

## 4.3 LWP3 — Capability-specific scales

**문제:** 모든 capability가 같은 ordered scale을 사용해야 하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. One 1–5 scale | Uniform | Style/proficiency/scope collapse | Rejected |
| B. Free prose only | Expressive | No reliable task matching | Insufficient |
| C. Domain-appropriate qualitative vocabularies | Semantic fit | Catalog/validation needed | **Recommended** |

**추천안 — LWP3-C:** Proficiency, style, risk posture, precision and familiarity may use distinct qualitative vocabularies. Task definitions declare which semantic dimension they consume.

**상태:** **Accepted candidate.** Canonical vocabularies and ordering rules are **TBD**.

**이유:** Heterogeneous capability meanings를 one numeric ladder에 억지로 맞추지 않는다.

## 4.4 LWP4 — Capability domains

**문제:** Minimum capability taxonomy를 어느 granularity로 둘 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. One “litigation skill” | Simple | All distinctions lost | Rejected |
| B. Hundreds of micro-skills | Precise | Unusable UI/content explosion | Rejected |
| C. Medium-grain domains grouped by work phase | Usable/extensible | Catalog remains needed | **Recommended** |

**추천안 — LWP4-C:** Candidate higher-level groups are analysis/research, fact/evidence development, witness work, written/oral advocacy, procedure/case operations, negotiation/client work and specialist comprehension.

Possible domain examples include issue spotting/legal analysis, legal research, evidence review, investigation planning, witness preparation, direct/cross-examination, drafting/written advocacy, oral advocacy, procedural planning, negotiation, settlement evaluation, client communication, case organization, deadline/workload management and technical comprehension.

**상태:** **Accepted candidate** for medium-grain/extensible structure; the list is non-exhaustive and canonical catalog is **TBD**.

**이유:** One stat와 micro-skill explosion 사이에서 task-addressable structure를 제공한다.

## 4.5 LWP5 — Capability is not a direct outcome modifier

**문제:** Strong capability가 litigation output에 어떻게 영향을 주는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Add to judge/finding score | Easy | Violates accepted boundaries | **Forbidden** |
| B. Automatic success when profile exists | Simple | No task/record causality | **Forbidden** |
| C. Capability affects executed work; actual outputs affect record/procedure | Traceable gameplay | WorkProduct system needed | **Recommended** |

**추천안 — LWP5-C:**

```text
capability
→ assigned action/task
→ actual LawyerWorkProduct characteristics
→ explicit submitted/allowed record or procedural change
→ existing Litigation evaluation
```

**상태:** **Core Accepted candidate.** Direct JII/finding/outcome modifiers are **Forbidden**.

**이유:** Player-visible preparation and record-building, not hidden win percentage, becomes the causal strategy.

## 4.6 LWP6 — WorkProduct-mediated effect

**문제:** Capability application의 minimum causal artifact는 무엇인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Profile directly changes system state | Short | Invisible causality | Rejected |
| B. Narrative result only | Flexible | No trace/record interface | Insufficient |
| C. Explicit `LawyerWorkProduct` semantic artifact | Auditable | Resolution semantics TBD | **Recommended** |

**추천안 — LWP6-C:**

```text
LawyerCapability
+ TaskAssignment
+ available information/resources
+ time/workload
+ player/NPC decisions
→ LawyerWorkProduct
→ record/procedure-facing result, if validly materialized
```

WorkProduct may represent an investigation plan, review result, witness preparation, examination plan, written submission, research memo, settlement recommendation, filing or argument framing.

**상태:** **Core Accepted candidate** for mediation; categories/quality resolution are **TBD**.

**이유:** Capability effect의 actual reason과 downstream boundary를 추적할 수 있다.

## 4.7 LWP7 — Application requires task/context

**문제:** LawyerProfile이 roster에 존재하기만 해도 모든 case tasks에 benefit을 주는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Passive firm-wide aura | Easy team effect | Hidden global bonus | **Forbidden** |
| B. Best lawyer auto-applies | Convenient | Assignment irrelevant | Rejected |
| C. Explicit task assignment and execution | Strategic/traceable | Scheduling needed | **Recommended** |

**추천안 — LWP7-C:** Capability applies only through a matching `TaskAssignment`, applicable scope/context and executed work. Unassigned lawyers provide no automatic task effect.

**상태:** **Core Accepted candidate.** Assignment mechanics are **TBD**.

**이유:** Team composition and player decisions matter without passive numerical aura.

## 4.8 LWP8 — Preparation vs courtroom skill separation

**문제:** “소송을 잘한다”라는 한 capability가 충분한가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. One litigation rating | Simple | Distinct work phases collapse | Rejected |
| B. Separate task-relevant domains | Meaningful team composition | More authoring | **Recommended** |
| C. Overall rating plus hidden subskills | Easy presentation | Overall score dominates | Rejected |

**추천안 — LWP8-B:** Analysis, evidence review, witness work, drafting, oral advocacy, procedure and negotiation remain distinguishable. No canonical total ordering follows from their combination.

**상태:** **Core Accepted candidate.** Exact domain boundary is **TBD**.

**이유:** Different lawyers can be excellent in different ways.

## 4.9 LWP9 — Strengths and limitations

**문제:** Profile에 positive level만 저장하면 충분한가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Strength-only badges | Positive/readable | No scope tradeoffs | Insufficient |
| B. Penalty numbers | Easy resolution | Hidden subtraction formula | Rejected |
| C. Qualitative strengths and limitations with scope | Explainable tradeoffs | Content burden | **Recommended** |

**추천안 — LWP9-C:** Capability entries may state bounded strengths and limitations such as contradiction tracking strength with limited technical-expert experience. Limitations constrain applicability or WorkProduct characteristics; they are not universal penalty points.

**상태:** **Accepted candidate.** Canonical limitation taxonomy/effects are **TBD**.

**이유:** Profiles remain differentiated without positive-only power escalation.

## 4.10 LWP10 — Practice specialization model

**문제:** Practice taxonomy를 broad label, exhaustive micro-fields 또는 layered model 중 무엇으로 둘 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. “Civil/criminal” only | Simple | Too broad for staffing | Insufficient |
| B. Every case topic is specialization | Precise | Taxonomy explosion | Rejected |
| C. Medium-level specialization + detailed history tags | Usable and expressive | Catalog/tag governance | **Recommended** |

**추천안 — LWP10-C:** Medium-level examples may include corporate disputes, contracts, labor, criminal defense, tax, intellectual property, real estate, administrative, finance/regulatory and family/inheritance. Detailed case histories use tags such as M&A dispute, shareholder action, director liability or trade-secret dispute.

**상태:** **Accepted candidate** for two-layer structure; actual lists and Korean practice mapping are **TBD**.

**이유:** Searchable practice identity와 emergent detailed history를 함께 유지한다.

## 4.11 LWP11 — Specialization is not automatic mastery

**문제:** Specialization label이 related capabilities를 자동 maximize하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Specialist means max all related skills | Easy | Unrealistic all-purpose mastery | **Forbidden** |
| B. Specialization is flavor only | Safe | No task relevance | Insufficient |
| C. Separate specialization familiarity and capability entries | Flexible | Matching rules needed | **Recommended** |

**추천안 — LWP11-C:** A corporate-disputes specialist may have strong document review but competent or developing cross-examination. Specialization informs applicability/history; it does not overwrite capability domains.

**상태:** **Core Accepted candidate.** Specialization-task mapping is **TBD**.

**이유:** Practice knowledge and task execution are related but non-identical dimensions.

## 4.12 LWP12 — Experience history

**문제:** `cases_handled = 128`만으로 useful experience를 표현할 수 있는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Case count only | Easy | No task/context meaning | Insufficient |
| B. Win count | Familiar | Outcome/capability collapse | **Forbidden** as capability basis |
| C. Dimensioned work-history refs | Traceable | Taxonomy and summarization | **Recommended** |

**추천안 — LWP12-C:** Experience history may reference practice area, task type, case complexity, stage/procedure, role performed, repetition/depth, recency when relevant and result-independent work history.

**상태:** **Accepted candidate.** Exact dimensions, depth vocabulary and recency effects are **TBD**.

**이유:** What the lawyer actually did matters more than a case total.

## 4.13 LWP13 — Outcome-independent experience

**문제:** Wins/losses가 capability growth를 직접 결정하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Win→XP, loss→none | Game-readable | Outcome grind and circular strength | **Forbidden** |
| B. Every case grants equal growth | Simple | Ignores work/context | Rejected |
| C. Performed tasks/history create development candidates | Causal | Evaluation rules needed | **Recommended** |

**추천안 — LWP13-C:** Wins/losses may remain career/public reputation events under other systems but are not automatic capability-mutation causes. Development candidates derive from actual work, training and exposure.

**상태:** **Core Accepted candidate.** Experience evaluation rules are **TBD**.

**이유:** Capability grows from practice rather than farming outcome counters.

## 4.14 LWP14 — LawyerProfile evolution

**문제:** Capability changes를 mutable current stats로 둘 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. In-place mutation | Simple | Past-case replay breaks | Rejected |
| B. Outcome-triggered increments | Familiar | Win-based XP | **Forbidden** |
| C. Explicit event/rule → immutable new version | Auditable | Evolution content needed | **Recommended** |

**추천안 — LWP14-C:**

```text
experience / training / mentorship / role exposure
→ eligible development event
→ explicit validated profile-evolution rule
→ new immutable LawyerRoleProfileVersion
```

Past tasks/cases retain their contemporaneous profile version.

**상태:** **Core Accepted candidate.** Eligibility and evolution content are **TBD**.

**이유:** Development and historical replay coexist without retrospective rewriting.

## 4.15 LWP15 — Growth sources

**문제:** 어떤 histories/events가 development review를 열 수 있는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Outcome only | Easy | Result-driven mutation | **Forbidden** |
| B. Any event auto-levels | Fast | Unbounded generic growth | Rejected |
| C. Eligible sourced event + explicit rule | Explainable | Content authoring | **Recommended** |

**추천안 — LWP15-C:** Repeated practical experience, formal training, mentorship with actual supervised practice, specialist assignment, major task exposure, feedback/review and explicit career-development events may be candidate sources. Event existence alone does not cause a level change.

**상태:** **Accepted candidate** for eligible-source categories; actual mapping/rules are **TBD**.

**이유:** Growth provenance를 보존하고 passive buffs를 막는다.

## 4.16 LWP16 — Growth limits

**문제:** Lawyer development가 every-case linear upward progression인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Every task increases all skills | Reward frequency | Infinite generic escalation | **Forbidden** |
| B. Fixed profiles forever | Simple | No career development | Rejected |
| C. Sparse explicit change; unchanged is valid | Controlled/credible | Tuning/content TBD | **Recommended** |

**추천안 — LWP16-C:** No change is a valid result. Every-case growth, all-capability growth, permanent linear increase, infinite progression and outcome-driven XP farming are prohibited. Plateau, specialization shift and decline/atrophy are future-compatible but not designed here.

**상태:** **Core Accepted candidate** for anti-escalation boundary; plateau/decline rules are **TBD**.

**이유:** Persistent careers need development without RPG treadmill inflation.

## 4.17 LWP17 — Mentorship hook

**문제:** DEC-016 mentorship relation이 capability를 자동 변경하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Relation exists→passive stat gain | Simple | Hidden social buff | **Forbidden** |
| B. Mentorship is flavor only | Safe | No future development hook | Insufficient |
| C. Relation + actual practice/training event + rule | Causal | Mechanics TBD | **Recommended** |

**추천안 — LWP17-C:** Mentorship may be an explicit input to future development evaluation only with supervised practice/training event and applicable rule. Relationship alone grants no capability.

**상태:** **Core Accepted candidate** for no-auto-gain; actual mentorship mechanics are **TBD**.

**이유:** Relationship history can matter without becoming passive numerical advantage.

## 4.18 LWP18 — Lawyer style / approach

**문제:** Skill proficiency and approach/style을 같은 scale로 표현할 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Style is skill bonus | Easy | “Aggressive = stronger” hidden bias | **Forbidden** |
| B. No style distinction | Simple | Lawyers feel interchangeable | Insufficient |
| C. Separate qualitative style refs affecting choices/outputs | Expressive | Behavior system TBD | **Recommended** |

**추천안 — LWP18-C:** Risk approach, preparation style and communication style are separate from proficiency. They may influence action preference, task selection, resource use and WorkProduct characteristics through explicit task rules, not direct success bonuses.

**상태:** **Accepted candidate.** Canonical style vocabulary and behavior effects are **TBD**.

**이유:** Individual work approaches become meaningful without ranking one as universally best.

## 4.19 LWP19 — Capability interaction

**문제:** Multiple capabilities가 one task에 관여할 때 어떻게 결합하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Hidden weighted sum | Tunable | Unexplainable overall score | **Forbidden as default semantic model** |
| B. Use highest capability only | Simple | Missing prerequisites ignored | Rejected |
| C. Task-declared qualitative contribution requirements | Explainable | Task model needed | **Recommended** |

**추천안 — LWP19-C:** Task definitions declare relevant capability domains, scopes and roles. Evaluation preserves which capability informed which part of WorkProduct; it does not default to a hidden weighted sum.

**상태:** **Core Accepted candidate.** Exact combination/resolution rules are **TBD**.

**이유:** Cross-examination can depend on witness analysis, contradiction tracking, procedure and oral advocacy without becoming arithmetic soup.

## 4.20 LWP20 — Team composition

**문제:** Multiple lawyers의 capability를 합산해 team score를 만들 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. A80+B70=Team150 | Easy | Double-counting and no role meaning | **Forbidden** |
| B. Best member represents team | Simple | Support work disappears | Rejected |
| C. Assigned lead/support contributions create actual WorkProducts | Strategic | Coordination model needed | **Recommended** |

**추천안 — LWP20-C:** Team effects arise through task assignment, lead/support roles, coordination, workload and specialist contributions. Each contribution is traced to a work result; profiles are not numerically added.

**상태:** **Core Accepted candidate.** Coordination/conflict resolution is **TBD**.

**이유:** Complementary teams matter without producing giant team power numbers.

## 4.21 LWP21 — Lead / support roles

**문제:** Same case의 team participation을 one generic “assigned” flag로 충분히 표현할 수 있는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. All assigned lawyers affect all tasks | Simple | Passive aura and double-counting | Rejected |
| B. One lawyer only | Simple | No specialist teamwork | Insufficient |
| C. Explicit task roles | Traceable | Role catalog TBD | **Recommended** |

**추천안 — LWP21-C:** Candidate roles include lead counsel, research support, evidence review, witness specialist, negotiation lead and procedural support. A task identifies who owns execution and who provides bounded support.

**상태:** **Accepted candidate** for explicit roles; canonical catalog and responsibility rules are **TBD**.

**이유:** Whose capability applies and where becomes explainable.

## 4.22 LWP22 — Workload and capacity

**문제:** Capability와 current capacity를 같은 profile trait로 합칠 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Ignore workload | Simple | Elite lawyer handles infinite work | Rejected |
| B. Fatigue random penalty | Dynamic | Random legal outcome modifier | **Forbidden** |
| C. Separate workload/time state constrains task execution | Causal | Scheduling model TBD | **Recommended** |

**추천안 — LWP22-C:** Capability remains a profile property; workload/available capacity is separate current operational state. Capacity may constrain task completeness, delay or WorkProduct characteristics through explicit task rules.

**상태:** **Core Accepted candidate** for separation; workload formula, fatigue and burnout are **TBD**.

**이유:** Stable capability와 situational ability to deliver를 구분한다.

## 4.23 LWP23 — Time/resource dependency

**문제:** Strong capability alone이 sufficient WorkProduct를 보장하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Capability guarantees output | Simple | Auto-win expert | **Forbidden** |
| B. Random resource penalty | Variable | Untraceable failure | Rejected |
| C. Explicit time/information/resource/team constraints | Strategic | Resource model TBD | **Recommended** |

**추천안 — LWP23-C:** Task result depends on applicable profile plus actual information, time, workload, investigative resources, team assignment and decisions. Missing inputs cannot be filled by prestige or capability label.

**상태:** **Core Accepted candidate.** Exact resource-resolution rules are **TBD**.

**이유:** A top lawyer cannot magically create evidence or perform unlimited preparation.

## 4.24 LWP24 — Failure / imperfect work

**문제:** Task result가 perfect/fail boolean인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Binary success/failure | Simple | Partial work/gaps invisible | Insufficient |
| B. Numeric quality score | Fine-grained | Hidden threshold arithmetic | Risky/TBD |
| C. Qualitative result state with explicit characteristics/gaps | Explainable | Vocabulary per task | **Recommended** |

**추천안 — LWP24-C:** WorkProduct may be incomplete, adequate, strong or unusually precise, but canonical result vocabulary can differ by task. Trace preserves completed scope, gaps, clarity and relevant reasons instead of one universal quality number.

**상태:** **Accepted candidate** for non-binary qualitative result; scales and resolution are **TBD**.

**이유:** Partial preparation and specific defects remain visible without percentage completion.

## 4.25 LWP25 — Lawyer reputation separation

**문제:** Public reputation이 actual capability인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Reputation equals capability | Easy hiring rank | Fame becomes power | **Forbidden** |
| B. Capability creates automatic reputation | Consistent | No provenance/disclosure | Rejected |
| C. Separate internal capability and provenance-based reputation | Credible | Two projections to maintain | **Recommended** |

**추천안 — LWP25-C:** Actual capability and public reputation are distinct. Reputation follows DEC-016 information/provenance rules and cannot directly modify work resolution, JII or finding.

**상태:** **Core Accepted candidate.** Reputation taxonomy/propagation are **TBD**.

**이유:** Unknown talent and famous-but-task-mismatched lawyers are both valid.

## 4.26 LWP26 — Player-observed LawyerProfile

**문제:** Player가 exact internal capability profile을 처음부터 보는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Exact internal sheet | Easy comparison | Hidden state leak/metagame table | **Forbidden** |
| B. No observable capability | Mystery | No informed staffing | Insufficient |
| C. Provenance-bearing observed/inferred projection | Learnable | Discovery/inference TBD | **Recommended** |

**추천안 — LWP26-C:** Public history, observed work, interview, prior employment, recommendation and direct collaboration may provide accessible sources. Player-facing profile shows bounded observations/inferences and unknowns, not exact internal semantics automatically.

**상태:** **Core Accepted candidate.** Disclosure, inference and UI mechanics are **TBD**.

**이유:** Recruitment and team strategy can use imperfect knowledge without leaking the simulation.

## 4.27 LWP27 — Hiring relevance

**문제:** Future recruitment가 LawyerProfile을 어떻게 참조할 수 있는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Hire by overall score | Easy | Universal ranking returns | Rejected |
| B. Ignore profiles | Simple | No team strategy | Insufficient |
| C. Query accessible role/specialization/capability projections | Meaningful | Recruitment system needed | **Recommended** |

**추천안 — LWP27-C:** Future recruitment may consume player-known profile, practice history, task fit, availability and separately designed employment inputs. DEC-017 defines only the hook.

**상태:** **Accepted candidate** for a bounded hook; salary, market, negotiation, employment law/contracts and recruitment AI are **TBD**.

**이유:** Hiring can later be profile-relevant without prematurely designing the labor market.

## 4.28 LWP28 — Major vs ordinary lawyers

**문제:** Ordinary lawyers에게 simplified legal semantics 또는 disposable history를 허용할 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Major only gets full profile | Cheap | Power tier and disposable NPCs | **Forbidden** |
| B. Full authored detail for all | Uniform | Simulation/content cost | Rejected |
| C. Same semantics, different authored/simulation resolution | Scalable | Expansion consistency | **Recommended** |

**추천안 — LWP28-C:** Major lawyers may have richer authored profiles, strengths/limitations and career content. Ordinary lawyers may be procedural/compressed, but retain the same profile/version/task/WorkProduct semantics and persistent identity/history.

**상태:** **Core Accepted candidate.** Prominence/compression mechanics are **TBD**.

**이유:** Large-world simulation과 emergent professionals를 legal-power tiers 없이 지원한다.

## 5. Recommended minimum profile model

```text
LegalProfessionalIdentity
  → LawyerRoleProfileVersion history
       ├─ CapabilityEntry refs
       │    ├─ domain
       │    ├─ qualitative level / tendency vocabulary
       │    ├─ applicability / scope
       │    ├─ strengths
       │    ├─ limitations
       │    └─ provenance / experience / training refs
       ├─ PracticeSpecialization refs
       ├─ detailed ExperienceHistory refs
       ├─ LawyerStyle / Approach refs
       ├─ Training / Mentorship refs
       └─ immutable version provenance

Current operational state, referenced but not owned as capability:
  ├─ workload / available time
  ├─ assigned tasks and team roles
  ├─ available information/resources
  └─ current case context
```

This is a semantic reference model only. It is not a canonical class, schema, API or save format.

### 5.1 Semantic reference structures

| Structure | Minimum meaning | Ownership | Forbidden responsibility |
|---|---|---|---|
| `LawyerRoleProfileVersion` | Immutable lawyer-profile identity/version, capability/specialization/style/history refs | Lawyer/practice system under World identity | Direct JII/finding or universal score |
| `CapabilityEntry` | Domain, qualitative meaning, scope, strengths/limitations, provenance refs | Lawyer profile | Automatic success or cross-role trait copying |
| `PracticeSpecializationRef` | Medium-level practice area and evidence/history basis | Lawyer profile/career history | Maxing all related capabilities |
| `ExperienceHistoryRef` | Task, role, stage, complexity, area, depth/recency refs | World/career/practice history | Win-count XP |
| `DevelopmentEvent` | Explicit experience/training/mentorship/work event eligible for review | World/practice development | Automatic level-up |
| `LawyerProfileEvolutionRuleRef` | Validated mapping boundary from eligible event to new version | Practice content/rule system | In-place mutation or outcome-driven points |
| `LawyerStyleRef` | Qualitative action/preparation/communication tendency and scope | Lawyer profile | Direct success bonus |
| `TaskAssignment` | Task/context, assigned lawyer, role, scope, timing/resources refs | Case/practice operations | Firm-wide passive profile effect |
| `LawyerWorkProduct` | Task result, completed scope, gaps/characteristics, source/profile/context refs | Practice/work system | Automatically becoming allowed court record |
| `WorkloadCapacityStateRef` | Current commitments, available time/capacity context | Firm/practice operations | Mutating stable capability or random court penalty |
| `PlayerObservedLawyerProfile` | Accessible source-backed public/observed/inferred capability projection | Player knowledge system | Exact internal-profile ownership |

## 6. Capability example

The following is a synthetic semantic illustration, not a canonical UI, schema, scale or actual Korean practice taxonomy.

```text
Attorney A

Practice
- corporate disputes
- contracts

Issue analysis
- qualitative level: exceptional
- strength: complex multi-claim structure
- limitation: limited criminal procedure exposure
- scope/basis: documented civil dispute work history

Evidence review
- qualitative level: strong
- strength: large documentary record organization

Cross-examination
- qualitative level: developing
- limitation: limited technical expert-witness experience

Written advocacy
- qualitative level: strong

Oral advocacy
- qualitative level: competent

Work style
- preparation: systematic
- risk posture: cautious

Experience
- corporate disputes: deep
- M&A-related disputes: repeated
- witness-heavy trials: limited
```

No overall score follows from these entries. “Exceptional analysis” does not offset unassigned work, missing evidence, limited time or a separate cross-examination limitation by arithmetic.

## 7. Lawyer capability → gameplay causal model

```text
LawyerRoleProfileVersion
+ TaskAssignment
+ CourtRecord / available information
+ time / workload / resources
+ player or NPC decisions
→ task execution
→ LawyerWorkProduct
→ explicit submission / admission / procedure-facing materialization
→ changed allowed record or procedural state
→ existing Litigation engine
```

### 7.1 Required gates

1. **Applicability:** Capability domain/scope matches the task.
2. **Assignment:** The lawyer has an explicit lead/support responsibility.
3. **Execution:** Task actually occurs using available information, time and resources.
4. **WorkProduct:** Result preserves completed scope, gaps, clarity/precision and source context.
5. **Materialization:** A private/internal WorkProduct is not court input until an existing submission/reception/allowance/procedure system makes an explicit record-facing change.
6. **Litigation:** Existing admissibility, EvidenceUse, criterion, hard-first and JII boundaries evaluate the changed inputs normally.

### 7.2 Hard prohibitions

```text
LawyerProfile
⇏ direct CourtFactFinding modifier

LawyerProfile
⇏ JudgeInterpretationInput modifier

LawyerProfile
⇏ CriterionChoicePoint activation or option

LawyerProfile
⇏ hidden win probability

LawyerProfile
⇏ evidence, scope or requirement creation by declaration
```

Preparation may discover or develop material only through a separately defined investigation/evidence system. Capability itself cannot conjure evidence or make unsubmitted content judicially visible.

## 8. Suggested WorkProduct categories

The following are candidate semantic categories, not a canonical catalog:

- Factual issue map.
- Legal issue map.
- Investigation plan.
- Evidence review result.
- Witness interview/preparation output.
- Direct-examination plan.
- Cross-examination plan.
- Legal research memo.
- Written submission.
- Procedural filing.
- Settlement analysis.
- Negotiation position.
- Client advisory output.
- Hearing preparation package.

Each WorkProduct category may require different capabilities, information, resources, stages and quality characteristics. A WorkProduct does not automatically become a `RecordEntry`, `EvidenceUse`, accepted proposition, filed document or successful negotiation. Exact resolution/materialization rules are **TBD**.

## 9. Hard invariants

| # | Invariant | Status | Note |
|---:|---|---|---|
| 1 | LawyerProfile is role-specific and versioned | **Core Accepted candidate** | Under stable identity |
| 2 | Capability is not boolean-only | **Core Accepted candidate** | Boolean may express eligibility, not depth |
| 3 | Capability is not canonically defined by universal 0–100 | **Core Accepted candidate** | Internal implementation TBD |
| 4 | Different capability types may use different qualitative spectra | **Accepted candidate** | Vocabulary TBD |
| 5 | Capability carries scope/context/history | **Core Accepted candidate** | Bundle semantics |
| 6 | No universal overall lawyer score | **Forbidden** | No canonical total ordering |
| 7 | Capability never directly modifies fixed-record JII | **Core Accepted** inherited / **Core Accepted candidate** reaffirmed | No judge bonus |
| 8 | Capability never directly modifies CourtFactFinding | **Core Accepted** inherited / **Core Accepted candidate** reaffirmed | No outcome shortcut |
| 9 | Capability effect requires assigned task/action execution | **Core Accepted candidate** | No roster aura |
| 10 | Gameplay effect is mediated through actual WorkProduct/record/procedure | **Core Accepted candidate** | Explicit materialization |
| 11 | Specialization does not equal mastery of every related capability | **Core Accepted candidate** | Separate dimensions |
| 12 | Experience is task/history-based, not win-count based | **Core Accepted candidate** | Dimensioned history |
| 13 | Wins/losses do not directly grant skill points | **Forbidden** | Outcome-driven XP |
| 14 | Profile evolution requires explicit development event/rule | **Core Accepted candidate** | Event alone insufficient |
| 15 | Old LawyerProfileVersions remain immutable | **Core Accepted candidate** | Past refs preserved |
| 16 | Mentorship relationship alone does not grant skill | **Core Accepted candidate** | Actual event/rule needed |
| 17 | Style is not a direct success bonus | **Core Accepted candidate** | Choice/output semantics only |
| 18 | Team capability is not numeric summation | **Core Accepted candidate** | Assignment/contribution model |
| 19 | Assignment/role determines whose capability applies | **Core Accepted candidate** | Lead/support scope |
| 20 | Workload/time/resources can constrain output | **Accepted candidate** | Exact model TBD |
| 21 | Reputation and capability are separate | **Core Accepted candidate** | DEC-016 provenance boundary |
| 22 | Player-observed profile is separate from internal profile | **Core Accepted candidate** | No exact leak |
| 23 | Ordinary lawyers use same semantics as major lawyers | **Core Accepted candidate** | Resolution differs, not authority |
| 24 | Historical tasks/profile versions remain traceable | **Core Accepted candidate** | No retrospective rewrite |

## 10. Pressure-test examples

All examples are synthetic semantic pressure tests, not implementation results or actual Korean practice rules.

### Case 1 — Same overall quality, different strengths

**Input:** Lawyer A has exceptional analysis/competent oral advocacy; Lawyer B has competent analysis/exceptional oral advocacy.  
**May evaluate:** Fit for explicit analysis or oral tasks.  
**Must not happen:** Canonical “A is better” or “B is better” overall conclusion.  
**Expected:** Profiles are non-total-ordered; task context determines relevant differences.

### Case 2 — 0–100 stat attack

**Input:** `lawyer_skill = 87` as the complete profile.  
**May evaluate:** Semantic completeness.  
**Must not happen:** Treat 87 as canonical capability or outcome power.  
**Expected:** Insufficient/invalid as the canonical model; it lacks domain, scope, strengths, limitations and history.

### Case 3 — Boolean capability attack

**Input:** `can_cross_examine = true` as the complete cross-examination profile.  
**May evaluate:** Eligibility-like meaning only.  
**Must not happen:** Infer depth, style, scope or WorkProduct quality.  
**Expected:** Insufficient to represent meaningful capability.

### Case 4 — Direct judge bonus attack

**Input:** Exceptional oral advocate attempts `+15% judge acceptance`.  
**May evaluate:** Effect-path validity.  
**Must not happen:** JII/finding/CP/acceptance modifier.  
**Expected:** Forbidden.

### Case 5 — Record-mediated effect

**Input:** Assigned evidence-review lawyer uses allowed information, identifies a concrete record issue and produces a review WorkProduct that is validly submitted/materialized by existing procedure.  
**May evaluate:** WorkProduct scope, trace and resulting explicit record/EvidenceUse change.  
**Must not happen:** Profile directly changes finding or bypasses admissibility.  
**Expected:** Changed allowed record may affect downstream litigation through existing rules.

### Case 6 — Unassigned specialist

**Input:** Exceptional cross-exam lawyer exists in firm but is not assigned to the witness task.  
**May evaluate:** Assignment/task ownership.  
**Must not happen:** Passive firm-wide benefit.  
**Expected:** No automatic effect on that examination WorkProduct.

### Case 7 — Specialization ≠ mastery

**Input:** Corporate-disputes specialist with strong document review and limited witness-examination experience.  
**May evaluate:** Specialization and capability entries separately.  
**Must not happen:** Specialization auto-maxes cross-examination.  
**Expected:** Valid differentiated profile.

### Case 8 — Detailed case-history tags

**Input:** Corporate-disputes specialization plus M&A and shareholder-dispute history tags.  
**May evaluate:** Medium-level specialization and detailed experience history.  
**Must not happen:** Every tag becomes a new top-level specialization.  
**Expected:** Valid two-layer representation.

### Case 9 — Win-based XP attack

**Input:** Three wins attempt `oral_advocacy +1`.  
**May evaluate:** Development-source validity.  
**Must not happen:** Outcome directly mutates capability.  
**Expected:** Invalid.

### Case 10 — Experience-based development

**Input:** Repeated assigned examination work, formal training and an explicit eligible development event/rule.  
**May evaluate:** Old/new profile refs and event/rule provenance.  
**Must not happen:** In-place mutation or automatic growth from case count alone.  
**Expected:** New immutable LawyerRoleProfileVersion candidate; exact change remains content-defined.

### Case 11 — Mentorship auto-gain attack

**Input:** Mentor relationship exists with no supervised-practice or training event.  
**May evaluate:** Development prerequisites.  
**Must not happen:** Passive capability increase.  
**Expected:** Invalid/no evolution.

### Case 12 — Mentorship-supported development

**Input:** Mentorship relation plus explicit supervised practice, training/development event and applicable evolution rule.  
**May evaluate:** Development chain and immutable versioning.  
**Must not happen:** Relationship alone owns the result.  
**Expected:** Profile-evolution candidate; exact trait change is TBD/content-defined.

### Case 13 — Team-stat addition attack

**Input:** `Lawyer A 80 + Lawyer B 70 = Team 150`.  
**May evaluate:** Team composition abstraction.  
**Must not happen:** Numeric sum becomes WorkProduct or case strength.  
**Expected:** Forbidden/invalid abstraction.

### Case 14 — Complementary team

**Input:** One lawyer is assigned document review; another is assigned witness examination, with explicit lead/support scopes.  
**May evaluate:** Distinct task outputs and contributor trace.  
**Must not happen:** Profiles merge into one team score.  
**Expected:** Each task consumes the applicable profile and produces separate/composable WorkProducts according to future task rules.

### Case 15 — Overloaded elite lawyer

**Input:** Exceptional applicable capability but insufficient available time for the assigned task.  
**May evaluate:** Capability separately from workload/capacity constraints.  
**Must not happen:** Capability downgrades permanently or guarantees complete output.  
**Expected:** Capability remains exceptional; WorkProduct may be constrained under future explicit task rules.

### Case 16 — Reputation/capability mismatch

**Input:** Famous lawyer has only moderate observed/internal capability for a specific assigned task.  
**May evaluate:** Reputation and capability separately, respecting disclosure.  
**Must not happen:** Fame upgrades task capability or finding.  
**Expected:** Valid profile mismatch.

### Case 17 — Internal-profile nondisclosure

**Input:** New hire has an internal LawyerProfile but player sources reveal only partial career and observed work.  
**May evaluate:** PlayerObservedLawyerProfile projection.  
**Must not happen:** Exact internal capability automatically shown.  
**Expected:** Only source-backed observations/inferences and unknowns appear.

### Case 18 — Historical version preservation

**Input:** Lawyer evolves from v1 to v2 after explicit development events; a past case used v1.  
**May evaluate:** Contemporary refs and history.  
**Must not happen:** Past task/case recalculated with v2.  
**Expected:** Past case retains v1; future applicable work may use v2.

### Case 19 — Style is not bonus

**Input:** Aggressive communication/risk style is present.  
**May evaluate:** Action preference or WorkProduct characteristic under explicit task rules.  
**Must not happen:** Automatic success, intimidation or judge bonus.  
**Expected:** Style may shape choices; no direct outcome effect.

### Case 20 — Resource constraint

**Input:** Strong investigator has no sufficient budget/time and no accessible evidence source.  
**May evaluate:** Task feasibility and missing inputs.  
**Must not happen:** Capability magically creates evidence or coverage.  
**Expected:** WorkProduct may remain incomplete or task may not proceed; exact resolution is TBD.

## 11. Explicit TBD list

1. Canonical LawyerProfile capability catalog.
2. Capability-specific qualitative scale vocabularies and ordering.
3. Internal numeric representation, if any, and safeguards.
4. Task taxonomy and applicability requirements.
5. Canonical WorkProduct taxonomy.
6. WorkProduct quality characteristics, evaluation and combination.
7. Investigation mechanics and evidence-development authority.
8. Legal research mechanics.
9. Witness preparation/direct/cross-examination mechanics.
10. Drafting/written advocacy and filing mechanics.
11. Oral advocacy and hearing mechanics.
12. Negotiation and settlement mechanics.
13. Client communication/advisory mechanics.
14. Practice specialization taxonomy.
15. Case-history tag taxonomy.
16. Experience dimensions, depth and recency rules.
17. Development eligibility/evolution rules and content.
18. Training mechanics.
19. Mentorship/supervision mechanics.
20. Workload/capacity model.
21. Fatigue/burnout.
22. Plateau, decline/atrophy and specialization shift.
23. Team coordination and WorkProduct integration.
24. Lead/support role catalog and assignment algorithm.
25. Compensation, hiring market, recruitment and employment rules.
26. Reputation taxonomy and propagation.
27. Public/observed capability disclosure and inference.
28. NPC lawyer AI.
29. Player lawyer progression.
30. Canonical schema, API, serialization, save and migration.
31. Godot/GDScript implementation.
32. Balancing and performance.
33. Actual Korean attorney qualification/practice/procedure rules.

## 12. Risks / anti-patterns

| Risk | Failure condition | Mitigation direction |
|---|---|---|
| Lawyer RPG stat sheet | Profile is a grid of upgrade numbers | Qualitative bundle with scope/history |
| Universal overall rating | One number ranks every lawyer | No total score; task-fit comparison |
| Hidden weighted-sum formula | Domains secretly add to success threshold | Task-declared qualitative contributions and trace |
| Elite lawyer = auto win | Profile bypasses preparation/record | Assignment→WorkProduct→record causal gates |
| Specialization = all-purpose mastery | Practice label maxes all related tasks | Separate specialization/capabilities |
| Win-based XP grind | Outcomes directly award skill | Work/event-based development candidates |
| Mentorship = passive stat buff | Relationship alone raises capability | Supervised event + explicit rule required |
| Team stat addition | Profiles numerically aggregate | Explicit task roles and outputs |
| Workload ignored | One expert handles unlimited work | Separate capacity/time constraints |
| Same scale everywhere | Style, skill and scope use one ladder | Capability-specific vocabularies |
| Capability/reputation collapse | Fame becomes task skill | Separate provenance-bearing reputation |
| Style becomes hidden bonus | Aggressive/cautious adds success | Choice/output characteristics only |
| Ordinary lawyers disposable | Compressed NPCs lack persistence | Same identity/profile/history semantics |
| Historical profile rewrite | v2 replaces v1 in old cases | Immutable profile versions and refs |
| Internal capability leaked | UI shows exact hidden entries | DEC-016 disclosure projection |
| Practice taxonomy explosion | Every case tag becomes field | Medium-level specialization + history tags |
| Hundreds of micro-skills | Profile/UI becomes unusable | Medium-grain domain groups; catalog TBD |

## 13. Proposed TEST-016 plan

Proposed file: `TEST-016_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`

Scope: manual / fixture-level semantic verification only. DEC-017 does not create or execute TEST-016.

| # | Core case | Verification focus |
|---:|---|---|
| 1 | Qualitative spectrum representation | Level/tendency plus scope/history, no flat number |
| 2 | Non-universal capability scales | Skill/style/familiarity vocabularies remain distinct |
| 3 | Different-strength attorney comparison | No overall canonical ordering |
| 4 | 0–100 universal-score rejection | Universal semantic power score invalid |
| 5 | Boolean-only rejection | Eligibility does not equal capability depth |
| 6 | Direct judge bonus rejection | No JII/finding/acceptance modifier |
| 7 | WorkProduct-mediated effect | Explicit task output and record/procedure gate |
| 8 | Unassigned capability non-effect | No passive roster aura |
| 9 | Specialization/capability separation | Specialist may have bounded weaknesses |
| 10 | Detailed experience tags | Tags enrich history without taxonomy explosion |
| 11 | Win-based XP rejection | Outcomes do not grant skill points |
| 12 | Explicit profile evolution | Event/rule creates immutable new version |
| 13 | Mentorship auto-gain rejection | Relationship alone has no capability effect |
| 14 | Mentorship-supported development | Actual supervised event/rule may create candidate |
| 15 | Team-sum rejection | Profiles do not numerically add |
| 16 | Complementary task assignment | Different profiles contribute through distinct roles/tasks |
| 17 | Workload constraint | Capacity constrains output, not stable capability |
| 18 | Reputation/capability separation | Fame does not equal task competence |
| 19 | Observed/internal profile separation | Player view uses accessible provenance only |
| 20 | Historical profile-version preservation | Past task/case retains contemporaneous version |

TEST-016 must not claim to verify actual Korean legal practice, task-quality algorithms, WorkProduct implementation, AI, UI, save or balancing.

## 14. DEC-018 candidate comparison

| Candidate | Why it follows | Main risk | Assessment |
|---|---|---|---|
| Lawyer Task / WorkProduct Resolution | DEC-017 defines who can contribute; next closes how actual work is produced | Hidden quality arithmetic if poorly bounded | **Recommended next** |
| Investigation & Evidence Development | Directly supports record-mediated strategy | Could invent evidence or bypass admissibility | Strong later candidate after WorkProduct core |
| Professional Networking / Recruitment | Uses DEC-016 relationships and observed profiles | May become social-stat grind | Useful later candidate |
| Law Firm Team Assignment & Workload | LWP20~23 open clear interfaces | Needs task semantics first | Natural follow-up after WorkProduct resolution |
| Conflict / Recusal / Ethics | Relationship graph provides refs | High legal/doctrinal risk and separate concern | Separate focused DEC |

**Recommendation only:** `Lawyer Task / WorkProduct Resolution` is the most natural DEC-018 candidate. DEC-017 defines what a lawyer may be capable of; the next design should define how an assigned capability, context and resources produce an explicit, explainable WorkProduct without hidden weighted sums. Final document order/title is not fixed here.

## 15. Decision summary

### 15.1 Inherited Accepted

| ID | Decision | Status |
|---|---|---|
| I1 | Lawyer skill/prestige/reputation never directly modifies fixed-record JII/finding | **Core Accepted** |
| I2 | Judge interpretation remains hard-first, criterion-declared and explicit-JII bounded | **Core Accepted** |
| I3 | ActualStateRecord/unsubmitted/unallowed inputs remain outside judicial evaluation | **Core Accepted** |
| I4 | Lawyer capability cannot create CP, options, evidence, scope, requirement or direct result | **Proposed DEC-014 boundary; fixture-verified** |
| I5 | Identity/profile versions remain historical and major/ordinary is not legal authority | **Proposed DEC-015 boundary; fixture-verified** |
| I6 | Shared identity keeps role profiles separate; reputation/relationship is not hidden power | **Proposed DEC-016 boundary; fixture-verified** |

### 15.2 Core Accepted candidates

| ID | Decision | Status |
|---|---|---|
| LWP1 | LawyerProfile is role-specific, immutable/versioned under stable identity | **Core Accepted candidate** |
| LWP2 | Capability uses qualitative scoped/history-bearing semantics, not canonical universal number | **Core Accepted candidate** |
| LWP5 | Capability has no direct JII/finding/outcome effect | **Core Accepted candidate** |
| LWP6 | Gameplay effect is mediated through actual WorkProduct and explicit record/procedure materialization | **Core Accepted candidate** |
| LWP7 | Capability application requires matching assignment/task/execution | **Core Accepted candidate** |
| LWP8 | Preparation/courtroom domains remain distinguishable; no overall ordering | **Core Accepted candidate** |
| LWP11 | Specialization does not auto-master capabilities | **Core Accepted candidate** |
| LWP13 | Experience/development is work-based, not win-count based | **Core Accepted candidate** |
| LWP14 | Evolution requires explicit event/rule and new immutable version | **Core Accepted candidate** |
| LWP16 | No automatic all-skill/infinite/outcome-driven progression | **Core Accepted candidate** |
| LWP17 | Mentorship alone grants no capability | **Core Accepted candidate** |
| LWP19 | Multi-capability tasks do not default to hidden weighted sums | **Core Accepted candidate** |
| LWP20 | Team capability is task contribution, not numeric addition | **Core Accepted candidate** |
| LWP22 | Stable capability and current workload/capacity are separate | **Core Accepted candidate** |
| LWP23 | Time/resources/information constrain output; capability cannot conjure inputs | **Core Accepted candidate** |
| LWP25 | Reputation and capability are separate | **Core Accepted candidate** |
| LWP26 | Player-observed and internal LawyerProfiles are separate | **Core Accepted candidate** |
| LWP28 | Major/ordinary lawyers share identical semantics and persistence | **Core Accepted candidate** |

### 15.3 Accepted candidates

| ID | Decision | Status |
|---|---|---|
| LWP3 | Capability-specific qualitative vocabularies | **Accepted candidate** |
| LWP4 | Medium-grain grouped capability domains | **Accepted candidate** |
| LWP9 | Scoped strengths and limitations | **Accepted candidate** |
| LWP10 | Medium-level specialization + detailed history tags | **Accepted candidate** |
| LWP12 | Dimensioned experience-history refs | **Accepted candidate** |
| LWP15 | Sourced work/training/mentorship events may open development review | **Accepted candidate** |
| LWP18 | Style is separate and shapes choices/outputs, not direct success | **Accepted candidate** |
| LWP21 | Explicit lead/support task roles | **Accepted candidate** |
| LWP24 | Non-binary qualitative WorkProduct results with explicit gaps | **Accepted candidate** |
| LWP27 | Future hiring consumes bounded accessible profile/task-fit refs | **Accepted candidate** |

### 15.4 TBD summary

Capability/task/WorkProduct/specialization/experience vocabularies; internal numeric representation; quality and combination rules; investigation/research/examination/drafting/negotiation/client mechanics; development/training/mentorship/workload/fatigue/decline/team/assignment systems; hiring/compensation/reputation/disclosure/AI/player progression; schema/API/save/Godot/UI/balancing/performance; and actual Korean attorney rules remain **TBD**.

### 15.5 Forbidden summary

- Boolean-only or universal 0–100 capability as the complete canonical model.
- Universal overall lawyer/team/case-strength score.
- Hidden weighted-sum task or outcome formula.
- Direct lawyer-skill, prestige, reputation or style modifier to JII/finding/judge acceptance.
- Capability-created evidence, scope, criterion requirement or ChoicePoint.
- Unassigned specialist passive benefit or firm-wide lawyer aura.
- Specialization auto-maxing every related capability.
- Win/loss-driven skill points or every-case automatic growth.
- Mentorship relation as passive stat buff.
- Numeric team addition.
- Capability guaranteeing output despite missing time, information or resources.
- Reputation/capability collapse.
- Major/ordinary legal-power tiers or disposable ordinary histories.
- In-place profile mutation, retrospective past-case rewrite or exact internal-profile UI leak.

## 16. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | Role-specific immutable LawyerProfile, qualitative capability bundles and capability-specific spectra, medium-grain domains/specialization plus detailed history, task/WorkProduct/record-mediated causal effects, assignment/team/workload/resource boundaries, outcome-independent experience and explicit evolution, mentorship/style/reputation/disclosure separation을 LWP1~LWP28 후보로 제안. Twenty synthetic pressure tests와 20-case TEST-016 plan을 포함. Actual capability/task/WorkProduct/evolution/team/hiring systems, canonical schema/API/UI/Godot/save와 Korean practice rules are TBD. |
| 2026-09-30 | Accepted — DEC-031로 개정 | LWP2 개정: 내부 수치 허용, 플레이어 표시는 언어. 단일 종합 점수 금지·능력 비가산 등 나머지 유지. ([DEC-LITIGATION-031](DEC-LITIGATION-031_NUMERIC_ADJUDICATION_AND_PROPOSED_DEC_RESOLUTION.md)) |
