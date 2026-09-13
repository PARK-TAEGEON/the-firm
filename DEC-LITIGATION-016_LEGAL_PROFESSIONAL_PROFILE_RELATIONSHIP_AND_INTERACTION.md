# THE FIRM — Legal Professional Profile, Relationship & Interaction 최소 모델

문서 ID: DEC-LITIGATION-016  
버전: v0.1 — Proposed / design review required  
상태: **Proposed / design review required**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
상위 기준: [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) v0.2, [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) v0.2  
시스템 기준: [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) v0.2  
직접 Accepted 기준: [DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) v0.2 Accepted  
직접 proposed/verified 기준: [DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md) v0.1 Proposed, [DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md](DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md) v0.1 Proposed  
검증 참고: [TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md), [TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md), [TEST-014_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md](TEST-014_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md)

## 1. Purpose / boundary

이 문서는 THE FIRM 세계의 판사, 변호사, 검사, 퇴임 법관과 future legal roles를 하나의 지속적인 인물 세계 안에서 표현하기 위한 minimum semantic model을 제안한다.

```text
LegalProfessionalIdentity
  → separate RoleProfile histories
  → Career / OrganizationAffiliation history
  → typed ProfessionalRelationship graph
  → Interaction history
  → provenance-bearing ProfessionalInformation
  → disclosure-filtered PlayerObservedProfessionalProfile
```

목표는 다음과 같다.

1. Role transition 뒤에도 stable person identity를 유지한다.
2. Judge, lawyer, prosecutor와 future role semantics를 한 universal stat block으로 합치지 않는다.
3. Career, public activity, affiliations, relationships와 interactions를 persistent history로 보존한다.
4. Internal state와 player-visible knowledge를 분리한다.
5. Public facts, observations와 explicit sources를 통해 player knowledge가 갱신되게 한다.
6. Relationship을 single friendship number가 아닌 typed, possibly directional, historical structure로 표현한다.
7. Major/ordinary professionals 모두 stable identity와 history를 가진다.
8. Relationship, familiarity, reputation와 prestige를 fixed-record adjudication bonus로 사용하지 않는다.
9. Future networking, recruitment, mentorship, ethics, conflict-of-interest와 recusal systems가 사용할 safe interface를 남긴다.

### 1.1 Non-goals

이 문서는 다음을 확정하지 않는다.

- 실제 대한민국 법조계의 비공개 관행이나 관계 효과.
- Canonical role catalog, LawyerProfile, ProsecutorProfile 또는 post-career role profile semantics.
- Canonical relationship taxonomy, strength scale, formation/decay algorithm.
- Inference/confidence calculation, misinformation/deception 또는 reputation propagation algorithm.
- Actual conflict-of-interest, ethics, recusal, lobbying 또는 corruption rules.
- Dialogue AI, networking minigame, recruitment negotiation 또는 social-skill formula.
- Canonical class, JSON, API, save schema, Godot implementation, UI 또는 performance model.
- TEST-015의 작성 또는 실행.

### 1.2 Decision markers

| Marker | Meaning |
|---|---|
| **Accepted / Core Accepted** | Prior DEC에서 이미 채택되어 이 문서가 변경하지 않는 boundary |
| **Accepted candidate** | DEC-016 review에서 채택을 추천하는 semantic structure |
| **Core Accepted candidate** | 구현 방식과 무관하게 지켜야 할 identity, information 또는 non-interference boundary |
| **TBD** | Content, doctrine, algorithm, taxonomy, validation 또는 implementation 근거가 더 필요한 항목 |
| **Forbidden** | Inherited boundary나 이 문서의 목적과 양립할 수 없는 구조 |

## 2. Inherited Accepted and verified guardrails

### 2.1 From DEC-013 — Accepted

- `JudgeProfile`은 fixed record에서 `CourtFactFinding`을 직접 변경하지 않는다.
- Judge interpretation은 hard evaluation과 criterion-declared genuine ambiguity 뒤에 explicit `JudgeInterpretationInput`을 통해서만 작동한다.
- Lawyer/firm reputation, prestige, party identity 또는 relationship metadata는 JII/finding direct modifier가 아니다.
- Stable judge identity와 immutable profile-version history를 보존한다.
- Win/loss statistics와 prior outcome counts는 future interpretation modifier가 아니다.
- Internal derivation trace와 disclosure-filtered player explanation을 분리한다.

### 2.2 From DEC-014 — Proposed and TEST-013 fixture-verified boundary

DEC-014는 아직 Proposed다. 이 문서는 그 status를 승격하지 않으며 다음 verified boundary를 침범하지 않는다.

- ChoicePoint activation은 JudgeProfile, party, firm, prestige와 relationship보다 먼저 allowed record/criterion만으로 판정한다.
- Relationship은 `CriterionChoicePoint`를 생성하거나 permitted option을 추가하지 않는다.
- ChoicePoint는 evidence, scope, requirement 또는 alternative path를 생성·삭제하지 않는다.
- Direct finding/outcome switch, hidden numeric weight와 arbitrary fallback은 금지된다.

### 2.3 From DEC-015 — Proposed and TEST-014 fixture-verified boundary

- Stable person/judge identity는 career, retirement, post-career와 prominence changes 이후에도 유지된다.
- Major/ordinary 차이는 simulation resolution과 authored detail이지 legal authority가 아니다.
- Post-retirement role transition은 same person identity를 유지한다.
- Judge interpretive traits를 lawyer, prosecutor 또는 advisor capability로 자동 복사하지 않는다.
- Relationship/familiarity/reputation은 fixed-record JII/finding을 직접 변경하지 않는다.
- Ordinary procedural NPC도 identity/history를 유지한 채 prominent가 될 수 있다.
- TEST-014는 위 구조를 15 synthetic fixtures에서 일관되게 적용했으나 DEC-015를 자동 Accepted로 만들지 않았다.

### 2.4 New decisions in DEC-016

이번 문서는 위 boundaries를 전제로 다음을 새로 제안한다.

- `LegalProfessionalIdentity` ownership과 cross-role continuity.
- Role-specific profile separation과 minimum shared professional information.
- Public/observed/inferred/hidden information layers, provenance와 uncertainty.
- Typed, directional, multi-edge, historical professional relationships.
- Minimum interaction record와 event-driven information update.
- Reputation/affiliation의 semantic boundary.
- Internal state와 player-facing projection의 분리.

## 3. Core design philosophy

### 3.1 Shared identity, separate role profiles

```text
LegalProfessionalIdentity
├─ JudgeRoleProfile history
├─ LawyerRoleProfile history
├─ ProsecutorRoleProfile history
├─ Advisor / Arbitrator / Academic RoleProfile history
└─ future RoleProfile histories
```

Shared identity는 stable person reference, public identity, career timeline, education/background refs, organization affiliations, public professional history, relationship refs, interaction refs와 prominence/visibility refs를 연결한다.

Role-specific interpretive, capability, authority 또는 confidential state는 공유하지 않는다. Identity는 join point이지 universal ability sheet가 아니다.

### 3.2 Layered information

Minimum visibility vocabulary는 다음을 구분한다.

```text
public
observed
inferred
hidden
```

- `public`: 공식 career, current role, public cases/decisions와 public affiliations처럼 공개 source가 있는 정보.
- `observed`: player가 직접 접한 사건·interaction 또는 accessible event로 확인한 내용.
- `inferred`: 공개/관찰 evidence에서 도출된 tentative tendency나 relationship interpretation.
- `hidden`: player가 접근 가능한 source를 아직 갖지 못한 internal/private state.

Visibility는 truth value나 certainty와 동일하지 않다. `inferred`는 internal profile의 복사본이 아니며 provenance와 uncertainty를 유지한다.

### 3.3 Typed relationships

`knows`, `worked_with`, `former_colleague`, `mentor`, `mentee`, `studied_with`, `professional_rival`, `organizational_connection`, `former_supervisor`, `former_subordinate`, `recruited_by`, `represented_by`, `opposed_in_case`, `repeated_professional_contact`는 structural examples다.

이 목록은 actual Korean practice나 canonical taxonomy가 아니다. Relationship meaning은 type, direction, provenance, effective period와 history가 우선하며 single affinity number로 대체하지 않는다.

### 3.4 Strength is secondary to type

Optional qualitative or numeric strength/trust/familiarity representation은 **TBD**다. 도입하더라도 relationship type/history/provenance가 primary semantics이며 strength는 universal social score, JII selector, credibility/sufficiency bonus 또는 finding modifier가 될 수 없다.

## 4. Design decisions

## 4.1 P1 — LegalProfessionalIdentity semantic ownership

**문제:** Stable person/professional identity와 role profiles를 어느 system이 소유하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Each role system creates its own person | Simple local model | Cross-role identity/history fragmentation | **Forbidden** |
| B. Litigation owns every legal professional | Easy case lookup | Litigation mutates World identity; excessive coupling | Rejected |
| C. World owns identity; role systems own versioned role profiles | Persistent person with bounded role semantics | Reference/version discipline required | **Recommended** |

**추천안 — P1-C:** World is the authoritative owner of `LegalProfessionalIdentity`. Judge, lawyer, prosecutor and future role systems own their role-specific profile histories and publish references under that identity. Litigation consumes only the assigned role/profile references it needs.

**상태:** **Core Accepted candidate.** Canonical service/module/API ownership은 **TBD**다.

**이유:** Identity continuity를 유지하면서 Litigation과 role systems의 responsibility를 분리한다.

## 4.2 P2 — Stable cross-role identity

**문제:** Judge가 retire하거나 다른 profession으로 이동할 때 identity를 어떻게 보존하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Role change마다 새 NPC | Local state simple | History/relationship/past-case continuity loss | **Forbidden** |
| B. Old entity overwritten by current role | One record | Historical semantics erased | Rejected |
| C. Same person identity + historical role refs | Full continuity | Temporal querying needed | **Recommended** |

**추천안 — P2-C:** Role entry, exit, retirement, affiliation change와 post-career transition은 same stable person identity에 time-bounded role/history refs를 추가한다. Past judge identity와 profile references를 삭제하지 않는다.

**상태:** **Core Accepted candidate.** DEC-015 continuity boundary를 구체화한다.

**이유:** 같은 사람의 multi-role timeline, relationships와 prior litigation trace를 보존한다.

## 4.3 P3 — Role profile separation

**문제:** Judge, lawyer와 prosecutor의 traits/capabilities를 하나의 universal profile로 합칠 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Universal professional stats | Reuse easy | Role semantics collapse; hidden power score | **Forbidden** |
| B. Full duplication per role | Strong separation | Identity/history duplication | Rejected |
| C. Shared identity + separate versioned role profiles | Bounded reuse and meaning | Mapping/authorship work | **Recommended** |

**추천안 — P3-C:** `JudgeRoleProfile`, future `LawyerRoleProfile`, `ProsecutorRoleProfile`와 other role profiles remain semantically separate. Cross-role transition does not automatically translate traits.

```text
judge inference trait
≠ lawyer persuasion skill
≠ prosecutor authority/capability
```

**상태:** **Core Accepted candidate.** Actual non-judge profile semantics는 **TBD**다.

**이유:** Shared personhood를 유지하면서 role-specific legal meaning의 오염을 막는다.

## 4.4 P4 — Minimum shared professional profile

**문제:** Role profiles 바깥에서 identity가 공통으로 연결해야 할 minimum information은 무엇인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. ID only | Minimal | No usable persistent world history | Insufficient |
| B. Universal full dossier | Rich | Privacy creep; role/profile collapse | Rejected |
| C. Bounded shared identity index | Useful continuity | Disclosure/version rules needed | **Recommended** |

**추천안 — P4-C:** Minimum shared semantics는 stable person id, display/public identity ref, current and past role refs, career timeline refs, education/background refs, organization affiliation refs, public professional-history refs, relationship refs, interaction refs, prominence/public-visibility ref와 disclosure refs다.

**상태:** **Accepted candidate.** Exact required fields, personal-life scope와 canonical schema는 **TBD**다.

**이유:** Cross-role continuity와 browsing에 필요한 join points만 보존하고 sensitive-life simulator로 확장하지 않는다.

## 4.5 P5 — Public / observed / inferred / hidden information

**문제:** Player가 접근할 수 있는 information과 internal state를 어떻게 구분하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Everything public | Simple UI | Exact internal profile leak;攻略 table | **Forbidden** |
| B. Public vs secret only | Simple | Observation and inference collapse | Insufficient |
| C. Four-layer visibility with provenance/time | Explainable uncertainty | More records | **Recommended** |

**추천안 — P5-C:** Minimum semantic layers are `public`, `observed`, `inferred`, and `hidden`. Every disclosed/known item preserves source/provenance and relevant observation/as-of time. Information can become outdated without silently changing its historical source.

**상태:** **Core Accepted candidate** for separation/provenance; exact visibility transitions and field taxonomy are **TBD**.

**이유:** Player learning, incomplete knowledge와 auditability를 동시에 지원한다.

## 4.6 P6 — PlayerObservedProfessionalProfile

**문제:** Player-facing understanding을 internal profile과 동일 객체로 둘 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Direct internal-profile view | Accurate | Hidden trait leak; strategy becomes lookup | **Forbidden** |
| B. Flavor text unrelated to sources | Cheap | Untrustworthy and retrospective | Rejected |
| C. Separate evidence-backed observation projection | Learnable/explainable | Projection maintenance | **Recommended** |

**추천안 — P6-C:** `PlayerObservedProfessionalProfile` is a projection composed of public, observed and inferred `ProfessionalInformationItem` refs. It does not own or copy internal role-profile truth. An observed tendency includes human-readable statement, supporting sources and qualitative uncertainty when relevant.

**상태:** **Core Accepted candidate.** Exact inference/display generation은 **TBD**다.

**이유:** Player가 실제 history로 인물을 학습하게 하면서 inaccessible internal keys를 보호한다.

## 4.7 P7 — Information provenance

**문제:** Player가 어떤 정보를 왜 아는지 어떻게 추적하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. UI magically shows known data | Easy | No source, no explainability | **Forbidden** |
| B. Source only for inferred items | Less data | Public/observed updates unauditable | Insufficient |
| C. Provenance-bearing information items | Traceable | Provenance catalog required | **Recommended** |

**추천안 — P7-C:** Public record, prior case, court decision, direct interaction, colleague disclosure, organization history, media/public source, professional network와 authored event are possible source categories, not an exhaustive taxonomy. Known information must reference an accessible source/event and as-of context.

**상태:** **Core Accepted candidate.** Canonical source taxonomy and trust rules are **TBD**.

**이유:** Magical disclosure와 result-first biography를 막는다.

## 4.8 P8 — Information uncertainty

**문제:** Observed/inferred information을 objective internal truth로 취급할 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. All known information exact | Simple | One observation reveals trait truth | **Forbidden** |
| B. Random correctness | Variety | False-fact generator/RNG | Rejected |
| C. Source-bounded qualitative uncertainty | Honest/player-readable | Confidence authoring needed | **Recommended** |

**추천안 — P8-C:** Public factual records may be presented with their source status; observed and inferred claims can carry qualitative uncertainty such as `uncertain`, `moderate`, or `strong`. These labels are not hidden probabilities or universal numeric confidence.

**상태:** **Accepted candidate.** Confidence calculation, correction, misinformation and deception are **TBD**.

**이유:** Inference fallibility를 표현하되 arbitrary misinformation system을 만들지 않는다.

## 4.9 P9 — Relationship graph ownership

**문제:** Professional relationships를 transient profile flags로 둘 것인가, durable World records로 둘 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Per-case relationship flag | Simple | No persistence/history | Rejected |
| B. Single affinity table | Compact | Semantics collapse | Rejected |
| C. World-owned durable typed edges | Persistent and extensible | Graph maintenance | **Recommended** |

**추천안 — P9-C:** World owns durable `ProfessionalRelationship` records linking stable person identities. Role systems and future interaction/ethics systems consume authorized projections; Litigation cannot treat the graph as a direct finding modifier.

**상태:** **Core Accepted candidate.** Storage topology and graph API are **TBD**.

**이유:** Relationships survive role and organization transitions without entering fact-finding authority.

## 4.10 P10 — Directed vs symmetric relationships

**문제:** 모든 relation을 symmetric pair로 표현할 수 있는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. All symmetric | Simple | Mentor/supervisor/asymmetric knowledge lost | Rejected |
| B. All duplicated directed edges | Flexible | Symmetric consistency burden | Viable |
| C. Relationship declares direction semantics | Accurate/bounded | Type validation needed | **Recommended** |

**추천안 — P10-C:** Relationship model must be able to represent symmetric, directional and potentially asymmetric relations. `mentor → mentee` and `supervisor → subordinate` require direction; `colleague` may be symmetric; `knows` or `rival` may be asymmetric depending on authored semantics.

**상태:** **Accepted candidate.** Per-type canonical direction rules are **TBD**.

**이유:** Real semantic differences를 single symmetric friendship edge로 잃지 않는다.

## 4.11 P11 — Multi-relationship support

**문제:** 두 사람 사이에 하나의 relationship label만 허용할 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Last label overwrites prior label | Simple | History/compound meaning loss | **Forbidden** |
| B. One composite label | Compact | Taxonomy explosion | Rejected |
| C. Multiple typed edges/events coexist | Expressive/historical | Conflict/display handling | **Recommended** |

**추천안 — P11-C:** Same pair can have multiple typed relationship records or historical phases, such as `former_colleague + mentor + professional_rival`. One relation must not silently erase another.

**상태:** **Accepted candidate.** Conflict consolidation and display ordering are **TBD**.

**이유:** Professional networks are multi-dimensional and time-dependent.

## 4.12 P12 — Relationship history / evolution

**문제:** Relationship change가 previous state를 overwrite할 수 있는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Mutable current label only | Cheap | No origin or historical replay | Rejected |
| B. Recompute from current affiliations | Compact | False automatic relation | Rejected |
| C. Event/version history with effective periods | Traceable | More history records | **Recommended** |

**추천안 — P12-C:** Relationship formation, transition, suspension and end are explicit history/events with provenance and effective periods. Current projection may summarize active relations but cannot delete prior states.

**상태:** **Core Accepted candidate.** Formation/decay/change rules are **TBD**.

**이유:** Career changes와 repeated encounters 뒤에도 provenance와 temporal meaning을 보존한다.

## 4.13 P13 — InteractionRecord

**문제:** 의미 있는 professional interaction을 어떤 최소 단위로 보존하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. No persistent interaction | Cheap | No learning/history | Insufficient |
| B. Full transcript required | Rich | Cost/privacy/content explosion | Rejected |
| C. Bounded semantic interaction record | Persistent/extensible | Category rules needed | **Recommended** |

**추천안 — P13-C:** Minimum `InteractionRecord` references interaction identity, participants, time/context, category, visibility, information gained, optional relationship-event refs and career/opportunity refs. Full transcript is not required.

**상태:** **Accepted candidate.** Exact payload, retention and content system are **TBD**.

**이유:** Relevant consequences와 knowledge provenance만 보존하면서 dialogue storage를 강제하지 않는다.

## 4.14 P14 — Interaction categories

**문제:** Interaction을 one generic event로 둘 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Generic interaction only | Simple | No semantic routing | Insufficient |
| B. Large exhaustive taxonomy now | Detailed | Premature canon | Rejected |
| C. Extensible typed category reference | Flexible | Catalog TBD | **Recommended** |

**추천안 — P14-C:** Professional meeting, courtroom encounter, networking event, mentorship, recruitment discussion, colleague interaction, negotiation, conference/seminar, post-retirement contact와 social-professional introduction are example categories only. Interaction records use a typed/extensible category ref.

**상태:** **Accepted candidate** for typed category support; canonical catalog and conversation system are **TBD**.

**이유:** Future systems가 interaction context를 구분할 수 있게 하되 taxonomy를 조기 확정하지 않는다.

## 4.15 P15 — Relationship effect boundary

**문제:** Relationship이 future gameplay에 의미를 가지면서 adjudicative favoritism으로 새지 않게 하는 방법은 무엇인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Direct legal bonus | Immediate payoff | Favoritism/hidden outcome modifier | **Forbidden** |
| B. Pure flavor only | Safe | World network has no hooks | Insufficient |
| C. Explicit world opportunity/input hooks; no direct finding effect | Strategic and bounded | Follow-up systems required | **Recommended** |

**추천안 — P15-C:** Future Accepted systems may use relationships for information access, introductions/referrals, recruitment eligibility, event availability, mentorship/training opportunities, willingness to interact, network access or an explicit recusal/conflict review hook.

Relationships must not directly modify:

- fixed-record `JudgeInterpretationInput`;
- `CourtFactFinding`;
- evidence credibility or proposition sufficiency;
- `CriterionChoicePoint` activation or options;
- favorable interpretation selection;
- plaintiff/defendant outcome weights.

**상태:** **Core Accepted candidate.** Each allowed gameplay effect requires its own explicit system/rule; none is implemented or automatically accepted here.

**이유:** Network strategy를 actual information/events에 연결하면서 hidden win bonus를 차단한다.

## 4.16 P16 — Favoritism vs lawful interaction boundary

**문제:** Lawful information/network effects와 adjudicative shortcut을 어떻게 구별하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Any relationship effect allowed | Dramatic | Corruption-by-default | **Forbidden** |
| B. No relationship effects anywhere | Safe | Blocks legitimate world interactions | Rejected |
| C. Changed explicit world/record/procedure input required | Auditable | More system boundaries | **Recommended** |

**추천안 — P16-C:** A relationship may affect a later process only through a separately Accepted system that creates an explicit lawful event, access, disclosure, assignment/recusal input or actual allowed record change. The relationship edge itself never changes a fixed-record finding.

```text
former colleague
→ faster access to public career information       potentially allowed later

former colleague
→ favorable interpretation on fixed record         Forbidden
```

**상태:** **Core Accepted candidate.** Actual procedure, ethics and recusal rules remain **TBD**.

**이유:** Causal trace를 요구해 ordinary professional contact가 secret favoritism이 되는 것을 막는다.

## 4.17 P17 — Conflict-of-interest / recusal hook

**문제:** Relationship graph가 future ethics/recusal system과 어떻게 연결되는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Any relationship auto-recuses | Simple | Invented legal rule; over-triggering | **Forbidden** |
| B. Ethics ignores graph | Simple | Cannot surface relevant facts | Insufficient |
| C. Explicit relationship/affiliation refs as review inputs | Extensible | Rule system still needed | **Recommended** |

**추천안 — P17-C:** Relationship and affiliation records may be surfaced to future conflict-disclosure, ethics or recusal evaluation. Existence of an edge does not itself decide recusal, disqualification or misconduct.

**상태:** **Accepted candidate** for the hook; actual legal rules, triggers, procedure and outcomes are **TBD**.

**이유:** Evidence-bearing input interface를 제공하되 actual Korean doctrine를 발명하지 않는다.

## 4.18 P18 — Professional reputation

**문제:** Reputation을 하나의 global score로 표현할 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Universal reputation number | Easy comparison | Social/legal power score | **Forbidden** |
| B. Outcome statistics as reputation | Available data | Circular win-rate modifier | **Forbidden** |
| C. Provenance-bearing dimensioned summaries | Explainable | Taxonomy/content work | **Recommended** |

**추천안 — P18-C:** Reputation may later be represented through observable professional dimensions or summaries such as trial reputation, specialization reputation, public visibility, perceived reliability/professionalism and institutional standing. These are examples, not canonical taxonomy.

No reputation value may directly modify fixed-record JII/finding or produce a favorability percentage.

**상태:** **Accepted candidate** for dimensioned summaries and **Core Accepted candidate** for adjudicative non-interference. Taxonomy/aggregation are **TBD**.

**이유:** Public perception can exist without becoming a universal legal-power stat.

## 4.19 P19 — Reputation provenance

**문제:** Reputation을 arbitrary author stat으로 주입할 수 있는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Unexplained score | Easy | No audit or world grounding | Rejected |
| B. Win/loss aggregate | Automatic | Outcome feedback loop | **Forbidden** as direct meaning |
| C. History/event-backed summary | Traceable | Aggregation TBD | **Recommended** |

**추천안 — P19-C:** `ReputationSummary` references public career events, cases, professional achievements, organization/network history or other explicit observable sources. Summary presentation does not convert these sources into a fact-finding modifier.

**상태:** **Accepted candidate.** Reputation propagation, dispute, decay and aggregation are **TBD**.

**이유:** Player-visible standing에 causal basis를 제공하고 arbitrary power inflation을 막는다.

## 4.20 P20 — Organization affiliations

**문제:** Court, prosecution service, law firm, school, association 또는 institution history를 어떻게 연결하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Current organization string only | Simple | Loses timeline/overlap | Insufficient |
| B. Organization implies relationship | Convenient | False social inference | Rejected |
| C. Time-bounded affiliation history refs | Persistent/queryable | Organization catalog needed | **Recommended** |

**추천안 — P20-C:** `OrganizationAffiliationHistory` connects a stable person to current/former organization, role/tenure and effective period refs. Overlap and alumni/team history can be queried without automatically creating a personal relationship.

**상태:** **Accepted candidate.** Organization catalog and membership rules are **TBD**.

**이유:** Career continuity와 potential connection evidence를 보존한다.

## 4.21 P21 — Affiliation-derived relationship

**문제:** Same school/organization overlap이 automatic friendship인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Auto-close relationship | Easy network generation | Unsupported intimacy/favoritism | **Forbidden** |
| B. Ignore affiliations | Safe | Loses discoverable connection | Insufficient |
| C. Affiliation is separate potential-connection evidence | Honest | Formation rule needed | **Recommended** |

**추천안 — P21-C:** Shared affiliation and actual `ProfessionalRelationship` are distinct records. Affiliation overlap may support a future discovery or relationship-formation rule, but does not itself prove familiarity, trust, friendship or bias.

**상태:** **Core Accepted candidate.** Actual formation/evidentiary rules are **TBD**.

**이유:** Network richness를 유지하면서 same-school auto-friendship을 막는다.

## 4.22 P22 — Major vs ordinary legal professionals

**문제:** Ordinary professional을 disposable/simplified identity로 취급할 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Major only persistent | Cheap | Emergent history destroyed | **Forbidden** |
| B. Same simulation detail for all | Uniform | Excessive cost | Rejected |
| C. Same semantics/history; different resolution/detail | Scalable/persistent | Expansion consistency needed | **Recommended** |

**추천안 — P22-C:** Major professionals may have richer authored profiles, networks and interactions. Ordinary professionals may use procedural/minimal content and compressed simulation. Both keep stable identity, persistent history and separate role-profile semantics; ordinary persons can become prominent without replacement.

**상태:** **Core Accepted candidate.** Exact prominence and compression mechanics are **TBD**.

**이유:** World scale와 emergent continuity를 legal-power tiers 없이 양립시킨다.

## 4.23 P23 — Profile browsing

**문제:** Player-facing professional lookup이 어떤 information groups를 지원해야 하는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Exact internal sheet | Complete | Hidden state leak | **Forbidden** |
| B. Name/current role only | Safe | No strategic learning | Insufficient |
| C. Disclosure-filtered grouped profile | Useful/transparent | UI/content TBD | **Recommended** |

**추천안 — P23-C:** Player-facing projection may group accessible information as Identity, Current Role, Career History, Affiliations, Public Cases/Decisions, Known Expertise, Observed Tendencies, Known Relationships, Interaction History, Public Reputation and Unknown/Uncertain sections.

**상태:** **Accepted candidate** for information grouping; layout, search/filter and UI are **TBD**.

**이유:** What is known and unknown을 모두 visible하게 하면서 internal keys를 숨긴다.

## 4.24 P24 — Internal vs player-facing profile separation

**문제:** Internal simulation state와 player-facing profile을 같은 object로 저장/노출할 것인가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Same object | Simple | Accidental secret disclosure | **Forbidden** |
| B. Handwritten unrelated UI bio | Flexible | Stale/contradictory | Rejected |
| C. Explicit disclosure/observation projection | Safe/traceable | Projection invalidation needed | **Recommended** |

**추천안 — P24-C:**

```text
Internal Professional State
  → source / visibility / authorization filter
  → PlayerObservedProfessionalProfile
  → UI projection
```

Save/content systems must preserve enough provenance and temporal references to reconstruct the semantic player view, but this DEC does not define their schema.

**상태:** **Core Accepted candidate.** Projection implementation and cache strategy are **TBD**.

**이유:** Private/internal data leakage를 구조적으로 방지하고 player knowledge를 auditable state로 만든다.

## 4.25 P25 — Information updates

**문제:** Internal state change가 player-facing profile에 언제 반영되는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Internal change auto-reveals | Current | Magical disclosure | **Forbidden** |
| B. Never update | Stable | Player cannot learn | Rejected |
| C. Explicit source/event-driven update | Causal/auditable | Update routing required | **Recommended** |

**추천안 — P25-C:** New public decision, career move, direct interaction, disclosed relationship or accessible source creates/refines/supersedes a player-known information item. Internal profile change alone does not update the player view without an accessible observation/disclosure source.

**상태:** **Core Accepted candidate.** Notification timing, discovery mechanics and inference algorithm are **TBD**.

**이유:** Player knowledge를 world events와 information gathering에 연결한다.

## 4.26 P26 — Historical information preservation

**문제:** Current role/profile projection이 prior roles, relationships와 information states를 지워도 되는가?

| Alternative | Advantage | Failure mode | Assessment |
|---|---|---|---|
| A. Current-only overwrite | Compact | Timeline/provenance loss | Rejected |
| B. Reconstruct from current state | Less storage | Impossible historical replay | Rejected |
| C. Immutable/event history + current projections | Full continuity | Storage/migration complexity | **Recommended** |

**추천안 — P26-C:** Role, career, affiliation, relationship, interaction and professional-information histories preserve effective periods and provenance. Current projections do not delete the timeline.

```text
2028: prosecutor
2035: judge
2048: retired from judicial assignment
2050: law-firm advisor
```

This remains one person timeline with separate role-profile histories.

**상태:** **Core Accepted candidate.** Retention, archival and migration mechanics are **TBD**.

**이유:** Cross-role world identity, player memory와 historical audit를 보존한다.

## 5. Recommended minimum model

```text
World-owned LegalProfessionalIdentity
  ├─ stable person/public identity refs
  ├─ CareerTimeline
  ├─ OrganizationAffiliationHistory
  ├─ RoleProfileHistory refs
  │    ├─ JudgeRoleProfileVersion
  │    ├─ LawyerRoleProfileVersion          TBD semantics
  │    ├─ ProsecutorRoleProfileVersion      TBD semantics
  │    └─ other RoleProfileVersion          TBD semantics
  ├─ ProfessionalRelationship refs
  ├─ InteractionRecord refs
  └─ ProfessionalInformationItem refs
         → visibility + provenance + as-of time + uncertainty
         → disclosure/observation projection
         → PlayerObservedProfessionalProfile
```

The shared identity joins history. It does not translate role traits, grant legal power or expose internal state.

```text
Relationship / reputation / affiliation
  → possible future explicit information, opportunity or ethics input
  → only through separately Accepted rules

Relationship / reputation / affiliation
  ⇏ CriterionChoicePoint activation
  ⇏ JudgeInterpretationInput modifier
  ⇏ credibility/sufficiency bonus
  ⇏ CourtFactFinding or final outcome
```

## 6. Semantic reference structures

These are semantic reference structures only. They are not canonical Godot classes, JSON, API or save schema.

| Structure | Minimum semantic information | Ownership | Forbidden responsibility |
|---|---|---|---|
| `LegalProfessionalIdentity` | Stable person id, public identity ref, current/past role refs, history indexes | World | Universal role abilities; direct litigation modifier |
| `RoleProfileRef` | Role type, immutable profile/version ref, effective period | Role system + World linkage | Cross-role automatic trait conversion |
| `CareerTimeline` | Ordered role/career event refs and effective periods | World/career systems | Rewriting past identity or profiles |
| `OrganizationAffiliationHistory` | Organization ref, role/tenure, effective dates, source/visibility | World/organization systems | Automatic friendship, bias or JII effect |
| `ProfessionalRelationship` | Stable relation id, persons, type, direction, provenance, period, status, visibility, history refs | World relationship graph | Favorability/finding modifier |
| `RelationshipEvent` | Formation/change/end event, cause/source, time, affected relation refs | World/interaction systems | Silent historical overwrite |
| `InteractionRecord` | Id, participants, time/context, category, visibility, information and consequence refs | World/interaction system | Full transcript requirement; direct adjudication bonus |
| `ProfessionalInformationItem` | Subject, type/content ref, source, observed/effective time, visibility, uncertainty, supersession refs | World information/knowledge boundary | Claiming internal truth without source |
| `PlayerObservedProfessionalProfile` | Player/context owner, accessible information refs, grouped projections, as-of state | Player knowledge/projection system | Owning exact internal profile |
| `ReputationSummary` | Dimension/summary, supporting public/history sources, as-of context, visibility | World/public-information boundary | Universal favorability score |
| `ProfessionalProminenceState` | Simulation/detail/public-visibility resolution ref | World | Professional or adjudicative power |
| `ConflictReviewInputRef` | Explicit relationship/affiliation refs eligible for future review | Future ethics/recusal system | Deciding recusal or misconduct by itself |

## 7. Suggested relationship semantic model

```text
ProfessionalRelationship
- stable relationship identity
- person_a
- person_b
- relationship type
- direction semantics
- origin / provenance
- effective_from
- effective_to, if ended
- current status
- visibility / disclosure refs
- optional qualitative strength/trust/familiarity representation (TBD)
- history / RelationshipEvent refs
```

Minimum principles:

- Type, direction, history and provenance are primary.
- Numeric-only relationship models are insufficient.
- Multiple relationship types or historical phases may coexist.
- Current summaries do not delete historical edges.
- Optional strength cannot select JII, activate ChoicePoints or modify findings.
- Canonical type taxonomy, edge storage and strength representation remain **TBD**.

## 8. Suggested information model

```text
ProfessionalInformationItem
- subject LegalProfessionalIdentity ref
- information type
- content or target ref
- source / provenance
- observed_at
- effective_as_of
- visibility state
- qualitative uncertainty, when applicable
- supersedes / refines refs
- disclosure authorization/context
```

This model distinguishes when the player learned something from when it was true or effective. An old inference may remain in history after later evidence refines it. Exact schema, confidence computation, misinformation and source-reliability rules are **TBD**.

## 9. Example player-facing profile

The following is a synthetic presentation example only. Names, courts, dates and tendencies do not assert actual Korean facts or law.

```text
김OO

현재
- 서울고등법원 판사

공개 경력
- 2028–2032: ○○지방법원
- 2032–2037: ○○법원
- 2037–현재: 서울고등법원

공개 전문 경력
- 기업 / 계약 사건 다수
- Source: 공개 career record 및 accessible case index

관찰된 판단 경향
- 특정 범위에서 명시적 연결을 중요하게 보는 경향이 있어 보임
- Basis: 공개 판결 A, B, C
- Confidence: moderate
- Effective as of: last observed decision

알려진 관계
- 박OO: former_colleague
  Source: 공개 affiliation overlap + disclosed professional history
- 이OO: mentor 관계로 알려짐
  Source: accessible public interview

우리와의 상호작용
- 2건의 사건에서 courtroom encounter

비공개 / 미확인
- 일부 profile 및 relationship information은 미확인
```

The UI does not display an internal trait key such as `inference_linkage = X`, hidden mapping, probability or favorability score. “Observed tendency” is a source-bounded player inference, not guaranteed internal truth.

## 10. Hard invariants

| # | Invariant | Status | Note |
|---:|---|---|---|
| 1 | Stable person identity across role changes | **Core Accepted candidate** | Retirement/post-career included |
| 2 | Shared identity does not merge role-specific profiles | **Core Accepted candidate** | Identity is a join point |
| 3 | Judge traits are not lawyer/prosecutor skills | **Core Accepted candidate** | Automatic copying forbidden |
| 4 | Disclosed profile information has visibility and provenance | **Core Accepted candidate** | Exact metadata schema TBD |
| 5 | Internal profile is not the player-facing profile | **Core Accepted candidate** | Explicit projection boundary |
| 6 | Inferred information may carry qualitative uncertainty | **Accepted candidate** | Calculation and labels TBD |
| 7 | Relationship has typed semantics | **Core Accepted candidate** | Taxonomy TBD |
| 8 | Relationship may be directional | **Accepted candidate** | Per-type direction TBD |
| 9 | Multiple relationships may coexist | **Accepted candidate** | Display/consolidation TBD |
| 10 | Relationship history is preserved | **Core Accepted candidate** | No overwrite |
| 11 | Affiliation does not automatically create friendship | **Core Accepted candidate** | Formation rules TBD |
| 12 | Interaction history may update known information through explicit refs | **Accepted candidate** | Mechanics TBD |
| 13 | Relationship does not directly modify fixed-record JII | **Core Accepted** inherited / **Core Accepted candidate** reaffirmed | No option selector |
| 14 | Relationship does not directly modify CourtFactFinding | **Core Accepted** inherited / **Core Accepted candidate** reaffirmed | No favorability bonus |
| 15 | Reputation does not directly modify fixed-record JII/finding | **Core Accepted** inherited / **Core Accepted candidate** reaffirmed | No prestige shortcut |
| 16 | No universal favorability score | **Forbidden** | Plaintiff/defendant friendliness included |
| 17 | No hidden friendship bonus | **Forbidden** | Numeric or qualitative shortcut included |
| 18 | Major/ordinary changes detail, not authority | **Core Accepted candidate** | DEC-015 verified boundary |
| 19 | Ordinary professionals can become prominent without replacement | **Core Accepted candidate** | Stable identity/history |
| 20 | Role/career/relationship history remains temporal and preserved | **Core Accepted candidate** | Exact retention TBD |
| 21 | Player learns information through explicit sources/events | **Core Accepted candidate** | No magical disclosure |
| 22 | Internal state changes are not automatically disclosed | **Core Accepted candidate** | Observation/update required |
| 23 | Post-retirement transitions preserve identity/history | **Core Accepted candidate** | Role semantics separate |
| 24 | Future ethics/recusal consumes explicit refs, not hidden scores | **Accepted candidate** boundary | Actual rule is TBD |

## 11. Pressure-test examples

All examples are synthetic structural fixtures, not statements of Korean law or implemented results.

### Case 1 — Judge retires and becomes advisor

**Input:** Stable person `LP-1` has JudgeRoleProfile history, retires, then receives an advisor role ref.  
**May evaluate:** Identity, role timeline and separate profile refs.  
**Must not happen:** New unrelated NPC; old judicial history deletion; JudgeTrait copying.  
**Expected:** Same person identity, preserved judge history and a separate future advisor profile interface.

### Case 2 — JudgeTrait copied to lawyer profile attack

**Input:** Transition script attempts `JudgeProfile.inference_linkage → LawyerProfile.persuasion`.  
**May evaluate:** Role transition and profile-boundary validation.  
**Must not happen:** Automatic trait/capability translation.  
**Expected:** Invalid; actual LawyerProfile semantics remain TBD.

### Case 3 — Public career lookup

**Input:** Accessible official career and current-role sources exist; internal profile remains hidden.  
**May evaluate:** Public information projection and provenance.  
**Must not happen:** Internal trait or confidential relationship disclosure.  
**Expected:** Career/current role shown with sources; hidden profile remains hidden.

### Case 4 — Inferred judge tendency

**Input:** Three accessible public decisions contain an observable recurring explanation pattern.  
**May evaluate:** Source-bounded player inference with as-of time and qualitative uncertainty.  
**Must not happen:** Exact internal trait assertion or future-outcome guarantee.  
**Expected:** Observed tendency may be recorded as an inference with cited bases and non-numeric confidence.

### Case 5 — Wrong certainty attack

**Input:** One ambiguous case is used to claim the exact internal JudgeTrait and mapping.  
**May evaluate:** Source sufficiency for player knowledge only.  
**Must not happen:** Internal truth copied into player profile; one case becomes certain trait proof.  
**Expected:** Exact disclosure is invalid; at most a bounded uncertain observation if content rules permit, otherwise no inference.

### Case 6 — Former colleague relationship

**Input:** Judge and lawyer share an explicit `former_colleague` relationship; fixed record/criterion/profile/CP inputs are unchanged.  
**May evaluate:** Relationship display or future lawful interaction hooks.  
**Must not happen:** CP activation, favorable JII or finding change.  
**Expected:** Relationship is preserved; fixed-record JII/finding semantics remain identical.

### Case 7 — Mentor / mentee directional relation

**Input:** `LP-A` mentored `LP-B`.  
**May evaluate:** Direction and provenance.  
**Must not happen:** Symmetric “both mentor each other” collapse unless separately authored.  
**Expected:** Directional `mentor → mentee` meaning is preserved.

### Case 8 — Multiple relationship types

**Input:** Same pair has `former_colleague`, `mentor` and later `professional_rival` records.  
**May evaluate:** Multiple edges/phases and temporal history.  
**Must not happen:** Latest label overwrites all prior relations.  
**Expected:** Coexisting/current and historical meanings remain distinguishable.

### Case 9 — Shared university

**Input:** Two professionals attended the same university during overlapping years; no relationship event exists.  
**May evaluate:** Affiliation overlap as a potential connection source.  
**Must not happen:** Automatic friendship, trust, familiarity or bias.  
**Expected:** Shared affiliation is shown if public; actual relationship remains unknown/unestablished.

### Case 10 — Interaction reveals information

**Input:** An accessible networking interaction explicitly discloses a public career event and a professional connection.  
**May evaluate:** `InteractionRecord` and new information/provenance refs.  
**Must not happen:** Hidden legal-power stat or unrelated private data revelation.  
**Expected:** Player profile gains only the disclosed career/relationship information with interaction provenance.

### Case 11 — Reputation favoritism attack

**Input:** High professional reputation attempts to add `+10% judge favorability`.  
**May evaluate:** Reputation summary provenance and effect validation.  
**Must not happen:** Percentage modifier, favorable option selection or finding bonus.  
**Expected:** Forbidden.

### Case 12 — Ordinary professional becomes prominent

**Input:** Procedural ordinary lawyer accumulates notable public history and receives a prominence-resolution event.  
**May evaluate:** Simulation/detail increase and history consistency.  
**Must not happen:** Replacement major NPC, retroactive biography or legal-power upgrade.  
**Expected:** Same identity/profile histories with richer future content.

### Case 13 — Organization transition

**Input:** Lawyer moves from firm `ORG-A` to `ORG-B`.  
**May evaluate:** Time-bounded affiliation history and current organization projection.  
**Must not happen:** `ORG-A` history deletion or automatic friendship with every `ORG-B` member.  
**Expected:** Both affiliations remain in timeline; only `ORG-B` is current.

### Case 14 — Historical role lookup

**Input:** One person timeline is prosecutor → judge → retired → advisor.  
**May evaluate:** Stable identity, effective role periods and separate role-profile refs.  
**Must not happen:** Current role overwrites prior roles or merges their profiles.  
**Expected:** One person timeline with preserved historical role semantics.

### Case 15 — Relationship-based recusal hook

**Input:** An explicit relationship is relevant to a future conflict review.  
**May evaluate:** Passing relationship/affiliation refs to a future review boundary.  
**Must not happen:** DEC-016 automatically orders recusal or invents Korean legal criteria.  
**Expected:** Review input hook is available; actual recusal result is **TBD**.

### Case 16 — Internal state not magically visible

**Input:** Internal role profile changes through a valid versioned event, but the player has no accessible observation/disclosure source.  
**May evaluate:** Internal version history only.  
**Must not happen:** Player-facing profile auto-updates with the new internal state.  
**Expected:** Player view remains unchanged until an explicit accessible source/event exists.

### Case 17 — Outdated inferred information

**Input:** Player inference at time T1 exists; later public evidence at T2 may refine it.  
**May evaluate:** As-of time, provenance and supersession/refinement links.  
**Must not happen:** T1 record silently rewritten as if player always knew T2 information.  
**Expected:** Historical inference remains; current projection may be refined when T2 becomes accessible. Exact update algorithm is **TBD**.

### Case 18 — Relationship strength attack

**Input:** Optional relationship strength is “high” and attempts to select a favorable interpretation.  
**May evaluate:** Effect-boundary validation.  
**Must not happen:** JII selection, credibility/sufficiency modifier or finding change.  
**Expected:** Forbidden regardless of strength representation.

## 12. Explicit TBD list

1. Exact `LegalProfessional` role catalog.
2. `LawyerProfile` semantics.
3. `ProsecutorProfile` semantics.
4. Advisor, arbitrator, mediator, academic and other role-profile semantics.
5. Canonical relationship taxonomy.
6. Numeric versus qualitative strength/trust/familiarity representation.
7. Relationship formation, validation, decay, transition and termination rules.
8. Interaction dialogue and conversation systems.
9. Networking event generation and availability rules.
10. Recruitment mechanics and negotiation.
11. Mentorship/training benefits.
12. Reputation taxonomy, aggregation, propagation, dispute and decay.
13. Confidence labels and calculation.
14. Observation/inference algorithm.
15. Misinformation, deception, correction and source-reliability systems.
16. Media/public-source system.
17. Actual conflict-of-interest, disclosure and recusal rules.
18. Ethics violations and discipline.
19. Lobbying, gifts/favors, corruption and bias systems.
20. Privacy/confidentiality and authorization rules.
21. Player-facing profile UI, search and filtering.
22. NPC, dialogue and relationship AI.
23. Prominence thresholds and simulation compression.
24. Canonical schema, API, serialization, save and migration.
25. Godot/GDScript implementation.
26. Performance and graph scaling.

## 13. Risks / anti-patterns

| Risk | Failure condition | Mitigation direction |
|---|---|---|
| Universal social score | Every relationship/reputation collapses to one number | Typed relations, dimensioned summaries, provenance |
| Relationship = favoritism bonus | Friendly edge changes JII/finding | P15/P16 direct-effect prohibition |
| Reputation = judge modifier | Prestige adds percentage or favorable option | No direct JII/finding effect; source-backed summaries only |
| Exact internal trait UI leak | Player sees internal keys/mappings | Separate observed projection and disclosure filter |
| Same-school auto-friendship | Shared affiliation creates trust/bias | P21 affiliation/relationship separation |
| Role-profile collapse | Judge traits become lawyer/prosecutor stats | P3 separate versioned role profiles |
| Relationship overwrite | New label deletes origin/history | Multi-edge and event/effective-period history |
| NPC replacement on role transition | Retired judge becomes unrelated advisor NPC | Stable cross-role identity |
| Ordinary NPC disposable profile | Only major professionals keep history | Same identity/history semantics at different resolution |
| Excessive network simulation cost | Full graph updated at maximum detail | Compressed resolution; exact strategy TBD |
| Every interaction changes relationship | Incidental contact creates arbitrary mutation | Explicit effect/event refs; formation rules TBD |
| Hidden information magically appears | Internal change instantly updates UI | Source/event-driven projection updates |
| Inference treated as objective truth | Observed pattern becomes exact trait | Provenance, uncertainty and internal/player separation |
| Retired judge loses old history | Current role overwrites judge career | Temporal role/profile history |
| Networking stat grind | Mandatory affinity farming replaces legal preparation | Opportunity/information hooks; no legal outcome bonus |
| Ordinary relationships imply corruption | Normal colleague ties create favorable rulings | Favoritism prohibited; ethics/corruption separate TBD systems |

## 14. Scope boundary for interaction mechanics

DEC-016 accepts only semantic interfaces of the following shape.

```text
InteractionRecord
  → explicit information gain
  → optional RelationshipEvent ref
  → affiliation/career opportunity ref
  → future event eligibility ref
```

Each arrow requires an explicit source/event and a separately defined rule. Interaction existence alone does not guarantee information, relationship change or opportunity.

The following remain implementation or follow-up design work:

- Actual dialogue tree and dialogue AI.
- Event scripting engine.
- Networking minigame.
- Persuasion/social skill formula.
- Recruitment negotiation.
- Gifts/favors.
- Lobbying.
- Illicit influence, corruption or bias.

No future interaction design may bypass the inherited hard-first/ChoicePoint/JII boundaries through a hidden relationship effect.

## 15. Proposed first-pass TEST-015 plan

Proposed file: `TEST-015_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`

Scope: manual / fixture-level semantic verification only. This DEC does not create or run TEST-015.

| # | Core case | Verification focus |
|---:|---|---|
| 1 | Cross-role identity continuity | Judge retirement/post-role preserves same person and history |
| 2 | Role-profile separation | JudgeTrait cannot become lawyer/prosecutor ability |
| 3 | Public profile disclosure | Public career shown; hidden state remains hidden |
| 4 | Inferred profile uncertainty | Multiple public sources yield bounded inference, not truth copy |
| 5 | Exact-trait leak rejection | One observation cannot expose internal trait key |
| 6 | Former-colleague non-interference | Fixed-record JII/finding unchanged |
| 7 | Directional mentorship | Mentor→mentee direction preserved |
| 8 | Multi-relationship coexistence | Multiple types/history do not overwrite |
| 9 | Shared affiliation ≠ friendship | School/organization overlap remains separate |
| 10 | Interaction-driven information discovery | Explicit source updates known information only |
| 11 | Reputation favoritism rejection | No percentage/favorable outcome modifier |
| 12 | Ordinary→prominent continuity | Same identity/history, richer resolution only |
| 13 | Affiliation-history preservation | Organization transition preserves past tenure |
| 14 | Multi-role career timeline | Prosecutor→judge→retired→advisor remains one person |
| 15 | Recusal hook without rule invention | Explicit refs passed; result remains TBD |
| 16 | Internal-state nondisclosure | No source means no player-view update |

Optional extensions are relationship-strength attack and outdated-inference history, producing 18 cases. TEST-015 must not claim to verify actual Korean professional practice, inference accuracy, ethics/recusal law, implementation, UI or performance.

## 16. DEC-017 candidate comparison

| Candidate | Why it follows | Risk if next | Assessment |
|---|---|---|---|
| Lawyer / Attorney Capability & Practice Profile | P3 leaves lawyer-specific semantics explicitly open; central to player firm gameplay | Could become flat power stats without care | **Recommended next** |
| Professional Networking / Interaction Mechanics | P13–P16 define safe interfaces | Premature without lawyer/player capabilities and opportunity boundaries | Strong later candidate |
| Conflict of Interest / Recusal / Ethics | P17 supplies explicit refs | Requires careful doctrine/content boundaries; high-stakes | Separate focused DEC after relationship fixtures |
| Legal Organization / Law Firm Membership & Recruitment | P20 and post-career hooks support it | Broad management scope could overtake identity model | Strong later candidate |

**Recommendation only:** `Lawyer / Attorney Capability & Practice Profile` is the most natural DEC-017 candidate because role-profile separation needs a concrete non-judge counterpart before networking benefits or recruitment can be safely designed. This document does not assign or fix the DEC-017 title, order or scope.

## 17. Decision summary

### 17.1 Inherited Accepted

| ID | Decision | Status |
|---|---|---|
| I1 | JudgeProfile never directly changes fixed-record finding | **Core Accepted** |
| I2 | Judge interpretation requires hard-first, genuine criterion ambiguity and explicit JII | **Core Accepted** |
| I3 | Prestige/reputation/relationship metadata is not a JII/finding modifier | **Core Accepted** |
| I4 | Stable/versioned judge identity/profile history and trace/public separation | **Accepted / Core Accepted** |
| I5 | ChoicePoint cannot be relationship-activated or outcome-authored | **Proposed DEC-014 boundary; fixture-verified** |
| I6 | Retirement/post-role identity continuity and major/ordinary semantic equality | **Proposed DEC-015 boundary; fixture-verified** |

### 17.2 Core Accepted candidates

| ID | Decision | Status |
|---|---|---|
| P1 | World owns shared identity; role systems own separate role profiles | **Core Accepted candidate** |
| P2 | Stable identity survives every role transition | **Core Accepted candidate** |
| P3 | Role-profile semantics never auto-merge or translate | **Core Accepted candidate** |
| P5 | Public/observed/inferred/hidden separation with provenance | **Core Accepted candidate** |
| P6 | Player-observed profile is distinct from internal profile | **Core Accepted candidate** |
| P7 | Known information requires explicit provenance | **Core Accepted candidate** |
| P9 | World owns durable typed relationship records | **Core Accepted candidate** |
| P12 | Relationship history is event/period-preserving | **Core Accepted candidate** |
| P15 | Relationship/reputation cannot directly change JII/finding/credibility/sufficiency/CP | **Core Accepted candidate** |
| P16 | Any lawful downstream effect requires a separate Accepted system and explicit changed input/event | **Core Accepted candidate** |
| P18-H | Reputation is never an adjudicative favorability modifier | **Core Accepted candidate** |
| P21 | Affiliation is not automatic relationship | **Core Accepted candidate** |
| P22 | Major/ordinary changes resolution, not authority | **Core Accepted candidate** |
| P24 | Internal state and player-facing projection are separate | **Core Accepted candidate** |
| P25 | Player knowledge updates only through explicit sources/events | **Core Accepted candidate** |
| P26 | Temporal role/career/relationship/information history is preserved | **Core Accepted candidate** |

### 17.3 Accepted candidates

| ID | Decision | Status |
|---|---|---|
| P4 | Bounded minimum shared professional identity information | **Accepted candidate** |
| P8 | Inferred information may carry qualitative uncertainty | **Accepted candidate** |
| P10 | Relationship supports directionality | **Accepted candidate** |
| P11 | Multiple relationship types may coexist | **Accepted candidate** |
| P13 | Minimum semantic InteractionRecord | **Accepted candidate** |
| P14 | Extensible typed interaction category refs | **Accepted candidate** |
| P17 | Relationship/affiliation refs may feed future ethics/recusal review | **Accepted candidate** |
| P18 | Dimensioned, observable reputation summaries | **Accepted candidate** |
| P19 | Reputation summary carries event/history provenance | **Accepted candidate** |
| P20 | Time-bounded organization affiliation history | **Accepted candidate** |
| P23 | Disclosure-filtered grouped profile browsing | **Accepted candidate** |

### 17.4 TBD summary

Exact role profiles/catalog, relationship and interaction taxonomies, direction rules, strength representation, formation/decay, confidence/inference, misinformation, reputation propagation, organizations, networking/recruitment/mentorship, privacy, ethics/recusal/lobbying/corruption, prominence, UI/search, AI, schema/API/save/migration, Godot and performance remain **TBD**.

### 17.5 Forbidden summary

- Role change마다 identity replacement 또는 history reset.
- Universal professional ability/profile or social/favorability score.
- JudgeTrait↔lawyer/prosecutor capability automatic mapping.
- Exact internal profile/hidden relation leakage to player UI.
- Source 없는 magical information disclosure.
- Inferred information을 objective internal truth로 표시.
- Same-school/organization overlap을 automatic friendship/bias로 변환.
- Relationship label overwrite that deletes history.
- Relationship, familiarity, prestige, reputation or strength as fixed-record JII/finding modifier.
- Relationship-based CP activation, favorable option selection, credibility/sufficiency bonus or party outcome weight.
- Hidden percentage, friendship bonus, random favorability or result-first explanation.
- DEC-016 relationship hook만으로 automatic recusal, misconduct, corruption or lawful influence를 선언.

## 18. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | World-owned stable `LegalProfessionalIdentity`, separate role-profile histories, layered/provenance-bearing information, player-observed projection, typed directional multi-relationship history, bounded InteractionRecord, reputation/affiliation boundaries, non-interference guardrails와 historical preservation을 P1~P26 후보로 제안. Eighteen synthetic pressure tests와 16-case TEST-015 plan을 포함. Actual role/relationship/reputation/inference/interaction/ethics content, canonical schema/API/UI/Godot/save와 implementation은 TBD. |
