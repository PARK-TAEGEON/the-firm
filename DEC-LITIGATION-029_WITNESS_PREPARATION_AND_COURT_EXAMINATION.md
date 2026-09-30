# THE FIRM — Witness Preparation and Court Examination

문서 ID: DEC-LITIGATION-029  
버전: v0.1 — 2026-09-30 Accepted (DEC-031)  
상태: **Accepted**  
결정 기록: 2026-09-30 사용자 결정 — 제안대로 채택. 상세는 [DEC-LITIGATION-031](DEC-LITIGATION-031_NUMERIC_ADJUDICATION_AND_PROPOSED_DEC_RESOLUTION.md). 구현 시 Hard invariants는 구속, semantic 층 분리는 참고.  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 기준: `DEC-LITIGATION-028_SETTLEMENT_AND_NEGOTIATION.md` v0.2 Accepted, `TEST-027_SETTLEMENT_AND_NEGOTIATION.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-027_CLIENT_INTERACTION_AND_ADVICE.md` v0.2 Accepted, `TEST-026_CLIENT_INTERACTION_AND_ADVICE.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-026_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md` v0.2 Accepted, `TEST-025_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-025_DRAFTING_PLEADING_AND_FILING.md` v0.2 Accepted, `DEC-LITIGATION-024_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted, `DEC-LITIGATION-023_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.2 Accepted, `DEC-LITIGATION-022_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.2 Accepted, `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`, `DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md`, `DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md`  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose

발견·접촉·인터뷰된 person이 witness role로 준비되고, lawyer가 ExaminationPlan을 만들며, ProceedingContext에서 실제 Question/Answer/Testimony events가 발생하고, explicit procedural pathway를 통해 CourtRecord에 materialize될 수 있는 최소 semantic model을 정의한다.

```text
Witness / RecordedStatement / SourceAssertion + authorized CaseFileState
+ CaseTheory / IssueAnalysis + WitnessPreparationTask
→ WitnessPreparationWorkProduct → ExaminationPlan → ProceedingContext
→ QuestionAttempt → procedural result → WitnessAnswer → TestimonyEvent
→ explicit CourtRecord materialization → CourtRecord testimony entry
→ later adjudication
```

```text
Interview ≠ WitnessPreparation ≠ ExaminationPlan ≠ Question
Question ≠ Answer ≠ Testimony ≠ CourtRecordEntry ≠ CourtFactFinding
prepared witness ≠ truthful/reliable/favorable witness ≠ accepted fact
```

## 2. Core problem

DEC-022의 private/interview semantics와 courtroom testimony 사이의 bridge를 제공하되 lawyer knowledge, preparation, CaseTheory 또는 seniority가 witness answer를 작성하거나 truth를 노출하지 못하게 한다. Testimony entered ≠ testimony believed이며 court adjudication은 downstream이다.

## 3. Core semantic separation

```text
Person ≠ WitnessRole ≠ InterviewStatement ≠ PreparationStatement
≠ WitnessPreparationWorkProduct ≠ ExaminationPlan ≠ PlannedQuestion
≠ QuestionAttempt ≠ QuestionProceduralResult ≠ WitnessAnswer
≠ TestimonyEvent ≠ CourtRecordEntry ≠ CredibilityAssessment ≠ CourtFactFinding
```

## 4. Witness role, availability and preparation task

Interviewed, designated, available, called and testifying are separate states. `WitnessPreparationTaskDefinition` may reference witness/person, interviews, RecordedStatements, SourceAssertions, evidence, contradictions, CaseTheory, Issues, anticipated role, known constraints, profile, capacity, dependencies and authorized snapshot. Exact designation/subpoena/competency rules and `WitnessPrepDifficulty` are not defined.

## 5. Preparation WorkProduct and anti-scripting boundary

WitnessPreparationWorkProduct records topics, prior statements, issues, known evidence, uncertainty, anticipated questions, risks, gaps and preparation events with versions. Preparation may explain process, review prior statements and rehearse communication form, but cannot author testimony, insert CaseTheory into memory or create facts. Changed accounts are new events; old interviews remain.

## 6. ExaminationPlan and question lifecycle

ExaminationPlan is a versioned tactical WorkProduct containing purpose, context/type, issue/topics, evidence refs, planned groups, sequence, expected/possible branches, contradictions, follow-ups, risks and time constraints. Plan ≠ courtroom event. PlannedQuestion ≠ QuestionAttempt; skipped questions create nothing and off-plan questions may occur.

## 7. ProceedingContext and procedural hooks

Minimal `ProceedingContext` exposes Matter/proceeding ref, participants, phase, current witness, procedural hooks, CourtRecord target and event order. QuestionAttempt may receive permitted/disallowed/withdrawn/pending results. ObjectionEvent is only an integration hook. DEC-029 does not invent objections, hearsay, leading-question, privilege, competency, oath or exhibit doctrine; full hearing orchestration remains DEC-030.

## 8. Witness answers, branching and surprise

Answers may be substantive, partial, uncertain, no recollection, refusal, misunderstanding or clarification request. Expected answer ≠ actual answer. Follow-ups use observed answers, never hidden PersonKnowledge. Surprise testimony is valid. Materialized Answer/TestimonyEvent is historical and reload-stable.

## 9. Capability, cooperation, relationship and credibility

Preparation/examination capabilities may improve organization, clarity, sequencing, issue targeting and adaptive follow-up. No WitnessPrepSkill, CourtroomSkill, CrossSuccess, CredibilityScore, Truthfulness, LieChance or favorable-testimony meter. Cooperation and relationship affect context only; they do not determine truth, favorability or agreement.

## 10. Prior statements, evidence and exhibits

InterviewStatement, PreparationStatement and TestimonyEvent remain separate even with identical text. Prior statements and SourceMaterial require explicit future procedural pathways for courtroom use/admission. Showing a document does not force witness agreement, make it true or predetermine an answer.

## 11. Testimony, CourtRecord and adjudication

TestimonyEvent records proceeding, witness, examiner, QuestionAttempt, answer type/content, prior statement/exhibit refs, procedural status, order and provenance. It does not automatically create CourtRecordEntry. A supplied valid procedural materialization may create a record entry; record testimony remains distinct from CourtFactFinding and cannot directly mutate JII.

## 12. Changes, conflicts, repeated testimony and history

Conflicting accounts/witnesses and corroborative relations coexist without lie, falsity or vote-truth. Each proceeding creates separate testimony. Preparation/Plan revisions preserve parents and consumed snapshots. Interruption/resume, unavailability, settlement and later judgment never erase earlier preparation, questions or testimony.

## 13. Workload, teams and direct/delegated paths

Preparation, plan review and appearance consume DEC-026 capacity. Owner, contributor and reviewer remain distinct; parallel/team outputs do not auto-merge. Player and NPC lawyers share identical Task, Plan, Question, Answer, Testimony and CourtRecord gates. Client instruction influences strategy only, not witness knowledge.

## 14. Design decisions

| ID | Problem | Alternatives | Failure mode | Recommendation | Status |
|---|---|---|---|---|---|
| WEX1 | Witness preparation tracking | Implicit activity / explicit Task | Preparation provenance and workload disappear | Use explicit WitnessPreparationTaskDefinition/Instance | **Core Accepted candidate** |
| WEX2 | Interview and preparation | Collapse / separate events | Private statement becomes courtroom preparation automatically | Keep Interview ≠ WitnessPreparation | **Core Accepted candidate** |
| WEX3 | Preparation and scripting | Scripted answer / process-and-topic preparation | Lawyer authors testimony | Preparation must not script testimony | **Core Accepted candidate** |
| WEX4 | Knowledge creation | Inject facts / preserve person knowledge | CaseTheory becomes witness memory | Preparation cannot create witness knowledge | **Core Accepted candidate** |
| WEX5 | Preparation revision | Overwrite / version lineage | Earlier account and inputs disappear | Preserve every preparation version/event | **Core Accepted candidate** |
| WEX6 | Inconsistency meaning | Lie flag / unresolved relation | Difference becomes deception oracle | Inconsistency ≠ lie | **Core Accepted candidate** |
| WEX7 | Examination planning | Implicit prompt list / explicit plan | Purpose, branches and source refs vanish | Create explicit ExaminationPlan | **Core Accepted candidate** |
| WEX8 | Plan and event | Executable script / tactical WorkProduct | Planned content materializes in court | Plan ≠ courtroom event | **Core Accepted candidate** |
| WEX9 | Planned and asked | Automatic execution / explicit attempt | Skipped question creates evidence | PlannedQuestion ≠ QuestionAttempt | **Core Accepted candidate** |
| WEX10 | Court question | Narrative shortcut / explicit event | Examiner, witness and order provenance vanish | Create explicit QuestionAttempt | **Core Accepted candidate** |
| WEX11 | Asked and allowed | Same state / procedural result hook | Disallowed questions produce ordinary evidence | QuestionAttempt ≠ QuestionAllowed | **Core Accepted candidate** |
| WEX12 | Allowed and answered | Automatic answer / structured outcome | Witness agency disappears | Allowed question ≠ answer obtained | **Core Accepted candidate** |
| WEX13 | Objection doctrine | Invent rules / semantic hook only | Architecture asserts Korean law | No invented objection/evidence doctrine | **Core Accepted candidate** |
| WEX14 | Answer outcomes | Binary success / structured answer | Refusal, uncertainty and partial answers vanish | Represent substantive/partial/refusal/no-knowledge outcomes | **Core Accepted candidate** |
| WEX15 | Answer truth status | Truth promotion / statement event | Court speech launders facts | WitnessAnswer ≠ truth | **Core Accepted candidate** |
| WEX16 | Testimony and finding | Automatic finding / adjudication boundary | Witness becomes truth oracle | Court testimony ≠ CourtFactFinding | **Core Accepted candidate** |
| WEX17 | Direct and cross | One type / contextual types | Tactical differences disappear or doctrine is overfit | Distinguish context; leave doctrine TBD | **Core Accepted candidate** |
| WEX18 | Cross result | Win/falsity score / structured events | Successful cross proves lie or wins case | Cross success ≠ falsity/case win | **Core Accepted candidate** |
| WEX19 | Question branching | Hidden knowledge / observed answer | UI previews secret answer | Follow-up branches use observed answers only | **Core Accepted candidate** |
| WEX20 | Expected answer | Actual answer / planning hypothesis | Plan pre-generates testimony | Expected ≠ actual answer | **Core Accepted candidate** |
| WEX21 | Witness knowledge access | Hidden tooltip / authorized inputs | Examination reveals private state | No hidden witness-knowledge oracle | **Core Accepted candidate** |
| WEX22 | Surprise testimony | Correct to plan / permit divergence | Human uncertainty is removed | Surprise testimony is valid | **Core Accepted candidate** |
| WEX23 | Event persistence | Reload reroll / materialized event | Save-scumming answers becomes possible | Materialized testimony does not reroll | **Core Accepted candidate** |
| WEX24 | Preparation capability | Universal skill / components | Score controls witness truth | No universal WitnessPrepSkill | **Core Accepted candidate** |
| WEX25 | Examination capability | CourtroomScore / components | Outcome is percentage shortcut | No universal CourtroomSkill | **Core Accepted candidate** |
| WEX26 | Exceptional examiner | Answer oracle / better questions | Seniority predicts hidden response | Exceptional examiner ≠ answer oracle | **Core Accepted candidate** |
| WEX27 | Cooperation | Truthfulness scalar / interaction context | Helpful witness becomes true | Cooperation ≠ truth | **Core Accepted candidate** |
| WEX28 | Relationship | Favorable-answer aura / context | Relationship controls testimony | Relationship ≠ favorable testimony | **Core Accepted candidate** |
| WEX29 | Credibility | Universal score / later structured assessment | One number becomes truth authority | No canonical CredibilityScore | **Core Accepted candidate** |
| WEX30 | Prior statement courtroom use | Auto-admit / procedural gate | Interview enters record automatically | Prior statement ≠ automatically admissible | **Core Accepted candidate** |
| WEX31 | Evidence confrontation | Forced agreement / open response | Document dictates answer | Showing evidence ≠ agreement/truth | **Core Accepted candidate** |
| WEX32 | Source and exhibit | Same object / procedural distinction | Case File material becomes admitted | SourceMaterial ≠ admitted exhibit | **Core Accepted candidate** |
| WEX33 | Testimony representation | Raw answer only / explicit event | Proceeding context and provenance vanish | Create explicit TestimonyEvent | **Core Accepted candidate** |
| WEX34 | Testimony and record | Automatic entry / materialization gate | All utterances bypass procedure | TestimonyEvent ≠ CourtRecordEntry | **Core Accepted candidate** |
| WEX35 | Record materialization | Implicit / explicit rule/event | Court epistemic boundary is bypassed | Require explicit procedural materialization | **Core Accepted candidate** |
| WEX36 | Record and finding | Same fact / separate adjudication | Record assertions become true | CourtRecord testimony ≠ FactFinding | **Core Accepted candidate** |
| WEX37 | Judge input | Direct mutation / downstream rule | Dramatic testimony grants hidden bonus | No direct JII mutation | **Core Accepted candidate** |
| WEX38 | CaseTheory and memory | Theory injection / questioning guide | Strategy authors witness knowledge | CaseTheory ≠ witness memory | **Core Accepted candidate** |
| WEX39 | Non-answer | Failure only / valid outcomes | Refusal/no recollection cannot exist | Refusal/no recollection are valid | **Core Accepted candidate** |
| WEX40 | Witness unavailability | Auto-substitute / blocked task | Prepared testimony materializes without person | Unavailability may block examination | **Core Accepted candidate** |
| WEX41 | Changed testimony | Rewrite / event history | Prior accounts disappear | Changes preserve prior statements/events | **Core Accepted candidate** |
| WEX42 | Contradiction | Falsity / relation | One side is automatically false | Contradiction ≠ falsity | **Core Accepted candidate** |
| WEX43 | Firm recording | Fact promotion / provenance knowledge | Firm notes become truth | Record testimony without truth promotion | **Core Accepted candidate** |
| WEX44 | Multiple witnesses | Merged witness truth / separate objects | Individual provenance disappears | Keep witnesses/plans/testimony separate | **Core Accepted candidate** |
| WEX45 | Conflicting testimony | Vote/auto-resolution / coexist | Engine adjudicates facts early | Do not auto-resolve conflict | **Core Accepted candidate** |
| WEX46 | Corroboration | Truth confirmation / relation | Source count decides truth | Corroboration ≠ truth | **Core Accepted candidate** |
| WEX47 | Repeated testimony | Latest-only / per-event history | Earlier proceeding is rewritten | Preserve every TestimonyEvent | **Core Accepted candidate** |
| WEX48 | Preparation versioning | In-place update / versions | Consumed inputs cannot be reconstructed | Preserve preparation versions | **Core Accepted candidate** |
| WEX49 | Plan versioning | Replace / versions | Asked-question provenance is lost | Preserve ExaminationPlan versions | **Core Accepted candidate** |
| WEX50 | Off-plan questions | Forbidden / explicit attempt | Plan becomes deterministic script | Allow off-plan QuestionAttempt | **Core Accepted candidate** |
| WEX51 | Skipped questions | Implicit answer / no event | Unasked content enters testimony | Skipped question creates no testimony | **Core Accepted candidate** |
| WEX52 | Workload | Free dialogue / finite capacity | Court work bypasses operations | Consume DEC-026 capacity | **Core Accepted candidate** |
| WEX53 | Direct/delegated | Different shortcut / same ontology | NPC gets probability outcome | Use same preparation/examination ontology | **Core Accepted candidate** |
| WEX54 | Team contribution | Auto-merge / explicit ownership/review | Parallel plans silently blend | Team outputs do not auto-merge | **Core Accepted candidate** |
| WEX55 | Plan review | Guarantee / fallible review | Senior approval ensures answers | Review ≠ favorable-result guarantee | **Core Accepted candidate** |
| WEX56 | Client input | Truth authority / strategy input | Client command changes witness mind | Client instruction ≠ witness truth | **Core Accepted candidate** |
| WEX57 | Settlement overlap | Erase prep / preserve history | Resolved case rewrites past work | Settlement does not erase prep history | **Core Accepted candidate** |
| WEX58 | Proceeding dependency | Free-floating testimony / context | Court event occurs nowhere | Examination requires ProceedingContext | **Core Accepted candidate** |
| WEX59 | Procedural ruling | Hardcode doctrine / generic hook | Witness DEC owns hearing law | Provide ruling hook only | **Core Accepted candidate** |
| WEX60 | Objection integration | Full taxonomy / future hook | Korean doctrine is invented | ObjectionEvent hook without taxonomy | **Core Accepted candidate** |
| WEX61 | Interruption | Reset / event continuity | Questions and answers vanish on resume | Interruption preserves history | **Core Accepted candidate** |
| WEX62 | Statement types | Collapse / typed provenance | Interview/prep/court accounts overwrite | Keep InterviewStatement ≠ PreparationStatement ≠ TestimonyEvent | **Core Accepted candidate** |
| WEX63 | Oath/formality | Truth flag / procedural metadata | Formality launders truth | Oath/formality ≠ objective truth | **Core Accepted candidate** |
| WEX64 | Favorable testimony metric | Meter / structured outcomes | Preparation becomes result bonus | No favorable-testimony meter | **Core Accepted candidate** |
| WEX65 | Hidden credibility | Expose score / observable inputs only | Player sees isLying/truthfulness | No hidden credibility/truthfulness oracle | **Core Accepted candidate** |
| WEX66 | Deception state | Auto-reveal / legitimate discovery | Lawyer knows hidden lie flag | Hidden deception is not automatically visible | **Core Accepted candidate** |
| WEX67 | Reload behavior | Reroll / stable event identity | Player fishes for better testimony | Materialized courtroom events do not reroll | **Core Accepted candidate** |

## 15. Recommended reference model

```text
WitnessPreparationTask / WorkProduct
├─ witness/person, Matter, authorized snapshot
├─ prior statements, evidence, Issues, contradictions
├─ preparation interactions and changed accounts
└─ versions / provenance

ExaminationPlan
├─ context/type, topics, questions, branches, risks
├─ evidence/prior-statement refs, time constraints
└─ author/reviewer/version lineage

ProceedingContext → QuestionAttempt → QuestionProceduralResult
→ WitnessAnswer → TestimonyEvent
→ explicit procedural materialization → CourtRecordEntry
→ later adjudication / possible CourtFactFinding
```

## 16. Hard invariants

| # | Invariant |
|---:|---|
| 1 | Person ≠ WitnessRole. |
| 2 | Interviewed person ≠ designated witness. |
| 3 | Designated witness ≠ available witness. |
| 4 | Available witness ≠ called witness. |
| 5 | Called witness ≠ testifying witness. |
| 6 | Interview ≠ WitnessPreparation. |
| 7 | InterviewStatement ≠ PreparationStatement. |
| 8 | PreparationStatement ≠ TestimonyEvent. |
| 9 | WitnessPreparation is an explicit Task. |
| 10 | Preparation uses an authorized Case File snapshot. |
| 11 | Preparation ≠ scripting. |
| 12 | Lawyer-authored text does not become witness testimony. |
| 13 | Preparation cannot create witness knowledge. |
| 14 | Preparation cannot create facts or true memory. |
| 15 | Document exposure does not make memory true. |
| 16 | Preparation clarification is a new provenance event. |
| 17 | Changed accounts preserve all earlier accounts. |
| 18 | Inconsistency ≠ lie. |
| 19 | Inconsistency ≠ falsity. |
| 20 | ExaminationPlan is explicit and versioned. |
| 21 | ExaminationPlan ≠ courtroom event. |
| 22 | PlannedQuestion ≠ QuestionAttempt. |
| 23 | Planned question skipped creates no answer. |
| 24 | Off-plan QuestionAttempt may exist. |
| 25 | QuestionAttempt records proceeding, examiner, witness and order. |
| 26 | Question asked ≠ question allowed. |
| 27 | Question allowed ≠ answer obtained. |
| 28 | Disallowed question does not automatically produce testimony. |
| 29 | Procedural result requires supplied rule/hook. |
| 30 | No Korean objection doctrine is invented. |
| 31 | WitnessAnswer has structured outcomes. |
| 32 | Refusal is a valid outcome. |
| 33 | No recollection is a valid outcome. |
| 34 | Partial answer is a valid outcome. |
| 35 | Misunderstanding/clarification may be represented. |
| 36 | WitnessAnswer ≠ truth. |
| 37 | Under-oath answer ≠ objective truth. |
| 38 | WitnessAnswer ≠ prior statement even when text matches. |
| 39 | Direct and cross are contexts, not truth statuses. |
| 40 | Cross success ≠ witness falsity. |
| 41 | Cross success ≠ case victory. |
| 42 | Follow-up branching uses observed answer only. |
| 43 | Expected answer ≠ actual answer. |
| 44 | No hidden-answer preview. |
| 45 | No hidden PersonKnowledge access. |
| 46 | Surprise testimony is valid. |
| 47 | Materialized Answer/Testimony does not reroll. |
| 48 | No universal WitnessPrepSkill. |
| 49 | No universal CourtroomSkill. |
| 50 | No hidden weighted examination formula. |
| 51 | Exceptional examiner ≠ answer oracle. |
| 52 | Exceptional examiner cannot force favorable answer. |
| 53 | Cooperation ≠ truthfulness. |
| 54 | Hostility ≠ falsity. |
| 55 | Relationship ≠ favorable testimony. |
| 56 | No obedience aura. |
| 57 | No canonical CredibilityScore. |
| 58 | No hidden TruthfulnessScore/LieChance. |
| 59 | Prior statement existence ≠ admissibility. |
| 60 | Prior statement existence ≠ CourtRecord. |
| 61 | Evidence confrontation ≠ witness agreement. |
| 62 | Document shown ≠ document true. |
| 63 | SourceMaterial ≠ filed attachment. |
| 64 | Filed attachment ≠ admitted exhibit. |
| 65 | Admitted exhibit ≠ truth. |
| 66 | TestimonyEvent is explicit. |
| 67 | TestimonyEvent ≠ CourtRecordEntry. |
| 68 | CourtRecord materialization requires explicit rule/event. |
| 69 | CourtRecord testimony ≠ CourtFactFinding. |
| 70 | Testimony does not directly mutate JII. |
| 71 | Dramatic testimony creates no generic judge bonus. |
| 72 | CaseTheory ≠ witness memory. |
| 73 | CaseTheory may guide questions only. |
| 74 | Witness unavailability may block/cancel/replan examination. |
| 75 | Preparation history survives witness unavailability. |
| 76 | Changed hearing answer does not rewrite plan. |
| 77 | Contradiction discovery creates analysis, not falsity. |
| 78 | Firm may record testimony without truth promotion. |
| 79 | Multiple witnesses remain distinct. |
| 80 | Conflicting testimony may coexist. |
| 81 | Witness count ≠ truth. |
| 82 | Corroboration ≠ truth. |
| 83 | Repeated testimony preserves every proceeding event. |
| 84 | Preparation versions preserve consumed snapshots. |
| 85 | Plan versions preserve authors/reviewers. |
| 86 | Asked questions reference applicable plan version where relevant. |
| 87 | Time constraints do not fabricate unasked testimony. |
| 88 | Preparation and appearance consume finite capacity. |
| 89 | Direct/delegated paths use the same ontology. |
| 90 | Team owner/contributor/reviewer remain distinct. |
| 91 | Team plans do not auto-merge. |
| 92 | Senior review ≠ correct-question guarantee. |
| 93 | Senior review ≠ favorable-answer guarantee. |
| 94 | Client instruction ≠ witness truth. |
| 95 | Client goal ≠ witness memory. |
| 96 | Settlement does not erase preparation/examination history. |
| 97 | Examination requires a ProceedingContext. |
| 98 | ProceedingContext remains a minimal interface here. |
| 99 | Objection is an integration hook, not doctrine. |
| 100 | Interruption/resume preserves event order. |
| 101 | Re-call creates new events if future rules permit. |
| 102 | CourtFactFinding never rewrites historical testimony. |
| 103 | Reload reuses materialized procedural results. |
| 104 | ActualStateRecord is unavailable. |
| 105 | Hidden legal model is unavailable. |
| 106 | Hidden deception flag is unavailable. |
| 107 | Future judge belief is unavailable. |
| 108 | No favorable-testimony percentage. |
| 109 | No fabricated Korean witness/evidence procedure. |

Count: **109 hard invariants**.

## 17. Pressure tests (Cases 1–92)

| Case | Fixture | Expected semantic result |
|---:|---|---|
| 1 — Basic WitnessPreparationTask | W-1 has RS-1, E-2, Issue I-3 and snapshot CF-4; WP-1 is assigned to Lawyer A. | Create provenance-bearing WP-1 and later WPP-1; no testimony or truth state is produced. |
| 2 — Interviewed person not designated witness | Person P completed Interview I-2 but no witness designation/call state exists. | P remains an interviewed person; no courtroom witness role is inferred. |
| 3 — Designated but unavailable witness | W-3 is designated but fixture marks unavailable before PC-1. | Examination task may block/replan; designation does not materialize testimony. |
| 4 — Preparation using prior statement | WPP-4 reviews RS-4='blue car' and flags date uncertainty. | The prior statement is a cited input; review does not make it true or courtroom evidence. |
| 5 — Preparation scripting attack | Lawyer writes 'say the light was red' into WPP-5 as the required answer. | Forbidden: the work product may plan topics but cannot author future testimony. |
| 6 — Lawyer theory injected into witness memory attack | CT-A says payment was approved; preparation copies CT-A into PersonKnowledge. | Forbidden: CaseTheory can guide questions, not create witness memory. |
| 7 — Preparation clarification | Witness says during prep that 'evening' meant after 7 PM. | Record a new PreparationStatement linked to the earlier account; no truth promotion. |
| 8 — Changed preparation statement | RS-8 says car was blue; PS-8 says witness now recalls gray. | Both accounts coexist with time/provenance and may trigger plan revision. |
| 9 — Old interview overwrite attack | PS-9 differs from RS-9 and engine replaces RS-9 text. | Forbidden: preparation change cannot rewrite the interview event. |
| 10 — Inconsistency ≠ lie | RS-10 says 3 PM; PS-10 says 4 PM; no deception evidence exists. | Represent inconsistency and alternatives; do not set isLying or choose truth. |
| 11 — Basic ExaminationPlan | EP-11 targets Issue I-2 with topic groups, exhibits, branches and risks. | EP-11 is a tactical versioned WorkProduct, not a proceeding event. |
| 12 — Plan auto-testimony attack | EP-12 includes goal 'establish F' and five questions. | Forbidden: creating or completing a plan produces no answer/testimony. |
| 13 — Planned question | EP-13 contains PQ-1 asking where W stood. | PQ-1 remains planned until an explicit QuestionAttempt occurs. |
| 14 — Planned question skipped | Time ends before PQ-14 is asked. | No QuestionAttempt, WitnessAnswer or TestimonyEvent exists for PQ-14. |
| 15 — Off-plan question | Answer to Q-1 reveals a new date; examiner asks Q-X not in EP-15. | An explicit off-plan QuestionAttempt is valid; plan is not an executable script. |
| 16 — QuestionAttempt | At order 12, Lawyer L asks W-16 Q-16 in PC-1. | Create QA-16 with examiner/witness/content/order/refs; answer remains separate. |
| 17 — Question disallowed by supplied fixture | Fixture rule marks QA-17 disallowed. | Record QuestionProceduralResult=disallowed without inventing objection doctrine. |
| 18 — Disallowed question still answered attack | QA-18 is disallowed but engine auto-generates substantive testimony. | Forbidden absent a separately observed answer/event allowed by supplied semantics. |
| 19 — Allowed question | Fixture result permits QA-19. | Allowed status enables opportunity to answer but does not generate one. |
| 20 — Allowed but witness refuses | QA-20 permitted; W states refusal. | Record refusal outcome; do not treat it as answer truth or automatic failure. |
| 21 — No recollection | W-21 replies 'I do not remember.' | Record no_recollection as a valid WitnessAnswer type. |
| 22 — Partial answer | Asked who attended and when; W names attendees but not time. | Preserve answered and unresolved portions rather than binary success. |
| 23 — Misunderstood question | W-23 answers about a different contract and asks what period is meant. | Record misunderstanding; original question remains unchanged. |
| 24 — Clarification | Examiner reformulates QA-23 as QA-24 and W answers the clarified scope. | New QuestionAttempt/Answer events preserve the earlier misunderstanding. |
| 25 — Answer X | W-25 says 'the light was red.' | Create WA-25/TestimonyEvent candidate as a statement, not a fact finding. |
| 26 — Answer X→truth attack | WA-26 says X and engine sets CaseFileFact/ActualState=X. | Forbidden: courtroom answer does not carry truth authority. |
| 27 — Direct examination context | Party calling W asks observation/chronology questions in direct context. | Tag examination context; do not hardcode jurisdiction-specific restrictions. |
| 28 — Cross examination context | Opposing lawyer confronts W with RS-28 and E-7. | Tag cross context and explicit events; outcome is not automatic impeachment. |
| 29 — CrossSuccess meter attack | Three contradictions yield CrossSuccess=91 and case-win modifier. | Forbidden: no universal score, falsity flag or direct outcome modifier. |
| 30 — Expected answer | EP-30 records expected answers A/B for PQ-30. | Expected values are planning branches, not previewed witness state. |
| 31 — Expected answer auto-materialized attack | At hearing, engine copies EP expected A into WA-31. | Forbidden: actual answer requires a materialized witness event. |
| 32 — Branch A answer → Q2A | Observed WA-32=A activates contextually relevant follow-up Q2A. | Branching may use the observed answer after it occurs. |
| 33 — Branch B answer → Q2B | Observed WA-33=B makes Q2B relevant instead of Q2A. | No pre-hearing hidden branch is exposed; branch follows WA-33. |
| 34 — Hidden witness knowledge preview attack | W secretly knows X; UI highlights 'Ask X—known answer.' | Forbidden: only interview/statements/evidence may ground question suggestions. |
| 35 — Surprise testimony | RS-35 indicated X, but W spontaneously testifies Y. | Y is a valid materialized surprise event; X and plan remain historical. |
| 36 — Reload reroll testimony attack | TE-36=Y is saved; reload produces X from same event id. | Forbidden: reuse TE-36; new answer needs a new cause/event. |
| 37 — Exceptional preparation lawyer | Senior spots unresolved chronology and exhibit mismatch in WPP-37. | Component-level improvement is allowed; witness truth/favorability is unchanged. |
| 38 — WitnessPrepSkill attack | PrepSkill=88 applies +20% truthful/favorable testimony. | Forbidden: preparation skill cannot modify truth or guarantee answers. |
| 39 — Exceptional examiner | Lawyer creates clear sequence and adaptive follow-ups from known material. | Better questions are possible; hidden answers and judge findings remain inaccessible. |
| 40 — CourtroomSkill attack | CourtroomSkill=94 directly sets WA-40=favorable. | Forbidden: universal capability cannot control witness response. |
| 41 — Cooperative witness gives unfavorable answer | Cooperative W truthfully or mistakenly gives an answer harmful to caller. | Cooperation and favorability are independent; unfavorable testimony is valid. |
| 42 — Hostile witness gives useful answer | Reluctant W nonetheless provides a useful date. | Hostility does not prevent useful content or determine truth. |
| 43 — Cooperation/truth collapse attack | Cooperation=high causes all answers to be marked true. | Forbidden: cooperation describes interaction, not epistemic authority. |
| 44 — Good relationship/favorable testimony attack | W has strong relationship with lawyer; engine forces favorable branch. | Forbidden: relationship is context, not obedience aura. |
| 45 — Prior InterviewStatement used as reference | QA-45 references RS-45 to ask about changed time. | Reference is allowed if fixture permits; RS-45 is not thereby admitted. |
| 46 — Prior statement auto-admitted attack | Merely citing RS-46 creates CourtRecord exhibit. | Forbidden without explicit procedural admission/materialization. |
| 47 — Evidence confrontation | Examiner shows admitted-or-permitted E-47 and asks if W recognizes it. | Question and response remain open; showing does not compel agreement. |
| 48 — Document shown→agreement attack | E-48 says March 3; engine forces W to agree. | Forbidden: document content does not predetermine WitnessAnswer. |
| 49 — SourceMaterial→exhibit auto-admission attack | Case File SourceMaterial S-49 is selected in EP. | Selection does not file/admit it; explicit exhibit procedure is required. |
| 50 — TestimonyEvent | Allowed QA-50 receives substantive WA-50 in PC-2. | Create TE-50 linking proceeding/witness/question/answer/order/provenance. |
| 51 — Testimony→CourtRecord auto-materialization attack | TE-51 exists but no record rule/event is supplied. | Forbidden: TE-51 alone does not create CR-51. |
| 52 — Explicit CourtRecord materialization | Fixture provides valid PR-52 mapping TE-52 to CR-52. | Create provenance-bearing CR-52 preserving question, answer and context. |
| 53 — CourtRecord testimony→FactFinding attack | CR-53 contains W saying X; engine sets FF=X. | Forbidden: record content remains input to later adjudication. |
| 54 — Testimony→JII direct mutation attack | Dramatic TE-54 adds judge sympathy/JII weight. | Forbidden absent an explicit downstream adjudicative rule. |
| 55 — CaseTheory guides question | CT-A motivates questions about decision timing. | Question targeting may reference CT-A; CT-A does not enter witness memory. |
| 56 — CaseTheory writes witness answer attack | Because CT-A selected, W automatically answers consistently with it. | Forbidden: strategic selection cannot control testimony. |
| 57 — Witness unavailable before hearing | Prepared W-57 becomes unavailable one day before PC-3. | Examination Task may block/cancel/replan; do not fabricate presence. |
| 58 — Preparation remains after unavailability | WPP-58 exists when W becomes unavailable. | Preserve WPP-58 and costs/history even if no examination occurs. |
| 59 — Witness changes account before hearing | During prep W-59 changes who signed the document. | Create new statement, contradiction relation and possible follow-up Tasks. |
| 60 — Plan revised | New PS-60 causes EP-60-v2 to add alternate branch. | Create v2 with source refs; do not edit v1 in place. |
| 61 — Old plan preserved | EP-61-v2 is current but QA history references v1. | Keep v1, authors, reviewers and consumed snapshot traceable. |
| 62 — Witness changes answer during hearing | W first says 3 PM then clarifies 4 PM after follow-up. | Create separate ordered answer/testimony events; no retroactive rewrite. |
| 63 — Contradiction discovered | TE-63 conflicts with document E-9. | Add a provenance-bearing inconsistency/analysis relation. |
| 64 — Contradiction→lie attack | TE-64 differs from RS-64 and engine sets isLying=true. | Forbidden without legitimate evidence/adjudication of deception. |
| 65 — Testimony updates firm Case File knowledge | Firm records TE-65 and CR status after hearing. | Case File gains provenance-bearing testimony knowledge, not fact truth. |
| 66 — Case File update→truth attack | Recording TE-66 turns its content into accepted CaseFileFact. | Forbidden: epistemic type remains testimony/assertion. |
| 67 — Two conflicting witnesses | W-A says X; W-B says not-X in separate TEs. | Both remain in Case File/CourtRecord if materialized; no auto-resolution. |
| 68 — Conflict auto-resolution attack | Higher-seniority W-A wins the contradiction automatically. | Forbidden: role/status/count cannot adjudicate truth. |
| 69 — Two corroborating witnesses | W-A and W-B both say X with distinct provenance. | May record corroborative relation; independence and truth remain unresolved. |
| 70 — Corroboration vote-truth attack | Two matching TEs set Truth=X. | Forbidden: witness count is descriptive, not truth authority. |
| 71 — Same witness second proceeding | W-71 testifies at PC-1 and later PC-4. | Create separate TestimonyEvents linked to each proceeding. |
| 72 — Later testimony overwrite attack | TE-72-b changes answer and replaces TE-72-a. | Forbidden: later account adds history, never rewrites earlier testimony. |
| 73 — Team preparation | Associate drafts topics, support organizes permitted bundle, senior owns review. | Preserve owner/contributor roles and separate WorkProducts. |
| 74 — Contributor/reviewer collapse attack | Senior contribution is silently counted as completed review. | Forbidden: contribution event ≠ ReviewTask completion. |
| 75 — Senior plan review | Partner reviews EP-75 for issue coverage and marks comments. | Review event may request revision; it does not certify future answers. |
| 76 — Review guarantees favorable testimony attack | Approved EP-76 applies favorable-answer modifier. | Forbidden: review is fallible organizational work. |
| 77 — Client tells witness strategy | Client suggests emphasizing topic X to firm. | Treat as client instruction/strategy input, not witness knowledge. |
| 78 — Client instruction→truth attack | Client says witness should say X; engine sets X in memory. | Forbidden under DEC-027 and WEX56. |
| 79 — Settlement during preparation | SA settles while WP-79 is in progress. | Tasks may pause/cancel per explicit action; existing prep history remains. |
| 80 — Settlement erases prep history attack | Case settlement deletes WPP-80 and interview refs. | Forbidden: settlement/case status does not erase provenance. |
| 81 — ProceedingContext | PC-81 records Matter, participants, phase, current witness, order and hooks. | This minimal interface hosts examination without defining full hearing lifecycle. |
| 82 — Objection hook | Opponent creates OE-82; future procedural resolver returns pending. | Store hook/event only; do not invent objection type or Korean rule. |
| 83 — Interruption/resume | PC-83 pauses after QA-3 and resumes with QA-4. | Preserve ordered questions/answers and do not reset witness or plan. |
| 84 — Oath/formality→truth attack | TE-84 is marked under oath and engine sets content=true. | Forbidden: formality may be metadata but is not objective truth. |
| 85 — Preparation-induced testimony cloning attack | RS1='I saw the blue car'; WPP-85 labels it strategically useful. | Forbidden to pre-generate identical hearing testimony; only actual answer event may produce it. |
| 86 — Hidden answer oracle attack | Witness secretly knows X; player never discovered X; UI suggests X as known. | Forbidden: hidden PersonKnowledge cannot drive player-visible question choice. |
| 87 — Examination-plan truth laundering attack | EP-87 goal is 'establish F'; every planned question is asked. | Completing questions does not establish F; answers/record/adjudication remain separate. |
| 88 — Courtroom answer / interview rewrite attack | RS-88=X; W later testifies Y. | Keep RS-88 and TE-88 distinct; never edit the interview to Y. |
| 89 — Testimony count credibility attack | Three witnesses say X; engine proposes Credibility(X)=3 and Truth=X. | Forbidden: count cannot create credibility authority or fact truth. |
| 90 — Senior examiner aura attack | Partner P conducts examination; reputation is high. | No automatic favorable-answer modifier; only explicit questions/events apply. |
| 91 — Witness preparation / client authorization collapse attack | Client wants W to emphasize X and authorizes strategy. | Authorization may affect firm Tasks, not witness knowledge or testimony. |
| 92 — Testimony history deletion after judgment attack | Court later finds F and conflicting TE-92 was not adopted. | Preserve TE-92 and CourtRecord history; FactFinding never rewrites evidence history. |

Count: **92 case-specific fixtures**.

## 18. Witness chain pressure test

```text
InterviewEvent I1 → RecordedStatement RS1
→ WitnessPreparationTask WP1 → WitnessPreparationWorkProduct WPP1
→ ExaminationPlan EP1 → ProceedingContext PC1
→ QuestionAttempt Q1 → procedural result → WitnessAnswer WA1
→ TestimonyEvent TE1 → explicit CourtRecord materialization
→ CourtRecordEntry CR1 → later CourtFactFinding FF1
```

모든 transition은 별도 object/event/rule을 요구하며 앞 단계가 다음 단계를 자동 생성하지 않는다.

## 19. Truth-boundary and question-branching pressure tests

Witness previously said X, prepares around X, testifies Y while hidden ActualStateRecord is Z: X/Y/Z 모두 다를 수 있고 Z가 correction/tooltip/rank에 사용되지 않는다. Q1의 observed A 뒤에만 Q2A가 relevant하고, observed B 뒤에만 Q2B가 relevant하다. Hidden answer로 branch를 미리 강조하지 않는다.

## 20. CourtRecord and credibility pressure tests

TE1만 있고 materialization rule/event가 없으면 CR1은 없다. 유효 fixture rule이 있으면 CR1이 생성될 수 있으나 CR1 ≠ FactFinding이다. Inconsistency, hesitation observation, document conflict와 corroboration은 future structured analysis/adjudication inputs가 될 수 있을 뿐 `CredibilityScore=62`를 생성하지 않는다.

## 21. Direct/delegated and no-reroll pressure tests

같은 definitions에서 player와 NPC는 동일 preparation, plan, attempt, answer, testimony, record gates를 사용한다. Delegation은 success probability가 아니다. Consequential answer/procedural result가 event id로 materialized되면 reload는 이를 재사용하고 새 결과에는 새 원인/event가 필요하다.

## 22. Cross-case invariant matrix

| Boundary | Decisions | Tested in | Result | Note |
|---|---|---|---|---|
| Interview/preparation/knowledge | WEX1–WEX6 | 1–10, 85, 91 | PASS candidate | Preparation cannot script or create memory; changes preserve history |
| Plan/question lifecycle | WEX7–WEX14 | 11–24, 87 | PASS candidate | Planned, asked, allowed and answered are distinct |
| Truth/direct/cross/branching | WEX15–WEX23 | 25–36, 84, 86 | PASS candidate | Answer is not truth; observed branches and no reroll |
| Capability/relationship/credibility | WEX24–WEX29 | 37–44, 78, 89–90 | PASS candidate | No score, aura, hidden-answer or credibility oracle |
| Prior statement/evidence/exhibit | WEX30–WEX32 | 45–49 | PASS candidate | Reference/showing is not admission, agreement or truth |
| Testimony/record/adjudication | WEX33–WEX37 | 50–54, 88, 92 | PASS candidate | Explicit materialization; record is not finding/JII |
| CaseTheory/unavailability/change | WEX38–WEX43 | 55–66 | PASS candidate | Theory does not write memory; changes do not rewrite |
| Multiple/repeated witnesses | WEX44–WEX47 | 67–72, 89, 92 | PASS candidate | Conflict/corroboration/count do not resolve truth |
| Version/team/review/client | WEX48–WEX57 | 59–80, 91 | PASS candidate | Versions and roles remain distinct; settlement preserves history |
| Proceeding/objection/interruption | WEX58–WEX63 | 81–84 | PASS candidate | Minimal hooks without invented doctrine |
| Meters/oracles/no-reroll | WEX64–WEX67 | 36, 38, 40, 78, 80, 84–90 | PASS candidate | No favorable/credibility oracle; stable events |

## 23. Contradiction audit

| Audit target | Finding | Boundary |
|---|---|---|
| Interview/preparation and preparation/scripting | No contradiction | WEX2–WEX4 |
| Theory/witness memory and expected/actual answer | No collapse | WEX20–WEX21, WEX38 |
| Plan/event/planned/asked/allowed/answered | No collapse | WEX8–WEX14 |
| Answer/truth, testimony/record, record/finding | No collapse | WEX15–16, WEX33–37 |
| Prior statement/testimony and inconsistency/lie | No collapse | WEX5–6, WEX30, WEX41–42, WEX62 |
| Cooperation/relationship/favorability | No aura | WEX27–29 |
| PrepSkill/CourtroomSkill/CredibilityScore | Forbidden | WEX24–26, WEX29, WEX64–65 |
| Evidence confrontation/SourceMaterial/exhibit | No collapse | WEX31–32 |
| Multi-witness vote truth | Forbidden | WEX44–46 |
| Version/review/team history | Preserved | WEX47–55 |
| Client instruction and settlement deletion | Forbidden | WEX56–57 |
| Proceeding overreach/objection doctrine | Avoided | WEX58–60 |
| Reload reroll | Forbidden | WEX23, WEX67 |
| Korean witness/evidence procedure | Not invented | All doctrine-specific mechanics remain TBD |

## 24. False-PASS / False-PARTIAL audit

PASS를 만들기 위해 Korean competency/subpoena/oath/perjury/leading/hearsay/objection/privilege/exhibit rules, psychology probabilities, truthfulness or credibility formula를 발명하지 않는다. Exact psychology, examination UI, question/testimony AI, admissibility와 proceeding lifecycle이 TBD라는 이유만으로 PARTIAL로 두지 않는다; semantic separation이 모호할 때만 PARTIAL이다.

## 25. Explicit TBD

- witness designation, availability, subpoena and compulsory process
- preparation ethics and memory/psychology
- direct/cross, leading, hearsay, objections and privilege doctrine
- oath/perjury and exhibit admission
- testimony generation AI and credibility/adjudication inputs
- full proceeding/hearing lifecycle
- courtroom UI/minigame
- save/schema/API/Godot
- balancing/performance

## 26. Risks / anti-patterns

| Risk | Consequence | Mitigation |
|---|---|---|
| Preparation becomes scripting | Witness agency and epistemic boundaries disappear | Separate topics/review from actual answer events |
| Lawyer knows hidden answers | Courtroom becomes oracle UI | Use only authorized statements/evidence |
| Correct dialogue branch | Questioning degenerates into puzzle key | Branch on observed testimony, allow surprise |
| Prep skill percentage | Capability controls truth/favorability | Component-based WorkProducts only |
| Hidden credibility stat | Player receives truth oracle | Structured observed inputs; adjudication later |
| Cross detects lies automatically | Contradiction becomes deception | Preserve unresolved relation |
| Document forces admission | Evidence controls witness mind | Open WitnessAnswer event |
| Testimony becomes truth | Court speech launders facts | Answer/Testimony/Record/Finding separation |
| Record becomes finding | Adjudication disappears | Explicit later adjudicative rule |
| Contradiction always deception | Uncertainty and error vanish | Inconsistency ≠ lie |
| Question micromanagement | Courtroom becomes tedious | UI abstraction remains TBD |
| Delegated probability roll | NPC bypasses ontology | Same Task/Plan/Event model |
| Premature hearing hardcode | Witness DEC owns all procedure | Minimal ProceedingContext/hooks only |
| Invented real doctrine | Architecture asserts incorrect law | Fixture/future DEC supplies rules |
| Reload fishing | Consequential events lose identity | Materialize once and reuse |

## 27. Player-facing principle

Player sees known statements, contradictions, known evidence, preparation/plan versions, questions actually asked, answers actually given, procedural result, CourtRecord status and legitimate follow-ups. Player does not see hidden witness knowledge, isLying/truthfulness, guaranteed answer, hidden credibility, future judge belief or canonical best question.

## 28. Gameplay principle

```text
known information + preparation + questioning strategy
+ procedural constraints + uncertain human response
→ courtroom testimony
```

Not `pick correct dialogue option → witness reveals truth`. Lawyer controls preparation and questioning, not reality or the witness's mind.

## 29. Solo → firm progression

| Stage | Supported architecture |
|---|---|
| Solo | Player prepares and examines key witnesses personally |
| Small firm | Associates prepare witness files and draft plans |
| Senior practice | Senior lawyers review plans and conduct important examinations |
| Partner-led | Partner handles critical witnesses and strategy |
| Larger firm | Preparation teams, exhibit coordination, review chains and parallel proceedings |

Exact titles remain a future Firm Organization decision.

## 30. Suggested TEST-028

Recommend `TEST-028_WITNESS_PREPARATION_AND_COURT_EXAMINATION.md` with at least 92 case-specific fixtures. Every Observed must name actual fixture objects/states and the concrete transition produced or blocked; generic hidden-state boilerplate is insufficient.

## 31. DEC-030 candidates

| Candidate | Assessment |
|---|---|
| **Hearing / Oral Advocacy / Trial Presentation** | Default if TEST-028 passes; orchestrates phases, rulings, evidence, witness examination, argument and CourtRecord materialization |
| Firm Organization / Titles / Teams | Strong scaling candidate but not a blocker to courtroom vertical slice |
| Firm Economics / Billing / Revenue | Later operational layer |
| Judgment / Post-Judgment consequences | Requires hearing/adjudication path first |
| Settlement Performance / Enforcement | Separate agreement-performance extension |

## 32. Decision summary

### Inherited Accepted

- DEC-013/014 court/JII boundaries; DEC-016–028 profile, Task, Case File, evidence, interview, theory, drafting, operations, client and settlement semantics.

### Core Accepted candidates

- WEX1–WEX67.
- Explicit preparation, plan, question, procedural result, answer, testimony and CourtRecord gates.
- No scripting, hidden answer/credibility oracle, truth laundering or reroll.

### Accepted candidates

- Surprise/refusal/no-recollection/partial/off-plan/conflicting testimony as valid states.
- Minimal ProceedingContext and future objection/ruling hooks.
- Direct/delegated/team/workload integration with full history.

### TBD

- §25 witness/procedure/psychology/admissibility/hearing/UI/implementation details.

### Forbidden

- Preparation→script/memory, plan→testimony, planned→asked, asked→allowed, allowed→answered automatic collapse.
- Answer→truth, Testimony→CourtRecord, Record→FactFinding/JII, oath→truth.
- WitnessPrepSkill/CourtroomSkill/CredibilityScore/favorability meter, hidden answer/isLying oracle.
- Relationship/seniority/client instruction aura, source→exhibit, witness-count truth, history deletion or reload reroll.
- Invented Korean witness/evidence procedure.

## 33. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | Initial witness preparation/examination model; WEX1–WEX67, 109 invariants and 92 pressure fixtures |
| 2026-09-30 | Accepted | 제안대로 채택. ([DEC-LITIGATION-031](DEC-LITIGATION-031_NUMERIC_ADJUDICATION_AND_PROPOSED_DEC_RESOLUTION.md)) |
