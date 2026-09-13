# THE FIRM — TEST-028 Witness Preparation and Court Examination

문서 ID: TEST-LITIGATION-028  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual semantic verification  
Source of truth: `DEC-LITIGATION-029_WITNESS_PREPARATION_AND_COURT_EXAMINATION.md` v0.1 Proposed / design review required; inherited DEC/TEST documents through DEC-028/TEST-027 v0.2 Accepted.

## 1. Purpose

DEC-029의 witness preparation/examination chain을 synthetic fixture에 수동 적용한다. 이는 implementation test나 실제 한국 witness/evidence law 검증이 아니다.

```text
Person ≠ WitnessRole ≠ InterviewStatement ≠ PreparationStatement
≠ WitnessPreparationWorkProduct ≠ ExaminationPlan ≠ PlannedQuestion
≠ QuestionAttempt ≠ QuestionProceduralResult ≠ WitnessAnswer
≠ TestimonyEvent ≠ CourtRecordEntry ≠ CourtFactFinding
```

Prepared witness ≠ truthful witness ≠ favorable witness ≠ accepted fact.

## 2. Verdict rules

- **PASS** — DEC-029 semantic boundary만으로 결과가 결정되고 inherited DEC와 모순 없음.
- **PARTIAL** — semantic boundary 자체가 모호하거나 충돌하는 경우에만.
- **FAIL** — 자동 승격, hidden oracle, truth/history/court collapse가 관찰되는 경우.

TBD인 subpoena/competency, direct/cross, objections, hearsay, privilege, oath, exhibit, psychology, testimony AI, proceeding lifecycle과 UI는 PARTIAL 근거가 아니다. 실제 법·심리·숨은 상태를 발명하지 않는다.

## Reference WEX design decisions

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


## Reference hard invariants

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


## 3. Core cases 1–100

### Case 1 — Basic WitnessPreparationTask

**Purpose**
Case 1은 basic witnesspreparationtask 경계를 독립적으로 확인한다.

**Fixture**
W-1 has RS-1, E-2, Issue I-3 and snapshot CF-4; WP-1 is assigned to Lawyer A.

**Manual verification**
Verify WP-1 is an assigned WitnessPreparationTask for Lawyer A and that RS-1, E-2 and I-3 are inputs under CF-4. Check whether assignment alone creates any preparation or courtroom descendants.

**Expected**
Create provenance-bearing WP-1 and later WPP-1; no testimony or truth state is produced.

**Observed**
WP-1 exists in assigned state with Lawyer A; RS-1, E-2 and I-3 are input refs under CF-4. A separate execution could create WPP-1, but no ExaminationPlan, QuestionAttempt, WitnessAnswer or TestimonyEvent was created by assignment, so the task layer remains distinct.

**Verdict**
PASS

**Boundary note**
Case 1의 판정은 basic witnesspreparationtask에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 2 — Interviewed person not designated witness

**Purpose**
Case 2은 interviewed person not designated witness 경계를 독립적으로 확인한다.

**Fixture**
Person P completed Interview I-2 but no witness designation/call state exists.

**Manual verification**
Check the identity and role records for Person P after completed Interview I-2, then look specifically for a WitnessRole designation or call state.

**Expected**
P remains an interviewed person; no courtroom witness role is inferred.

**Observed**
I-2 records interview completion for Person P, but no WitnessRole/call designation is present. The graph therefore stops at interview history: P is not a called or testifying witness.

**Verdict**
PASS

**Boundary note**
Case 2의 판정은 interviewed person not designated witness에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 3 — Designated but unavailable witness

**Purpose**
Case 3은 designated but unavailable witness 경계를 독립적으로 확인한다.

**Fixture**
W-3 is designated but fixture marks unavailable before PC-1.

**Manual verification**
Compare the availability state on PC-1 with the scheduled ProceedingContext and inspect whether the examination path blocks, cancels or replans.

**Expected**
Examination task may block/replan; designation does not materialize testimony.

**Observed**
PC-1 carries unavailable status at the hearing boundary, so the examination descendant is blocked/replanned rather than fabricated. Existing preparation records remain available for later disposition.

**Verdict**
PASS

**Boundary note**
Case 3의 판정은 designated but unavailable witness에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 4 — Preparation using prior statement

**Purpose**
Case 4은 preparation using prior statement 경계를 독립적으로 확인한다.

**Fixture**
WPP-4 reviews RS-4='blue car' and flags date uncertainty.

**Manual verification**
Follow WPP-4, RS-4 from source/interview form through the confrontation or exhibit step and compare source, exhibit and response provenance.

**Expected**
The prior statement is a cited input; review does not make it true or courtroom evidence.

**Observed**
WPP-4, RS-4 records a reference/showing and, where present, a separate witness response. No source was silently admitted or converted into truth; each procedural status remains on its own object.

**Verdict**
PASS

**Boundary note**
Case 4의 판정은 preparation using prior statement에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 5 — Preparation scripting attack

**Purpose**
Case 5은 preparation scripting attack 경계를 독립적으로 확인한다.

**Fixture**
Lawyer writes 'say the light was red' into WPP-5 as the required answer.

**Manual verification**
Attempted transition: WPP-5 → preparation scripting.
Permitted state: WPP-5 retain their recorded fixture states; only the explicitly described event can create a descendant.
Open WPP-5 and classify the phrase “say the light was red” by author and object type; search for any resulting PersonKnowledge, WitnessAnswer or TestimonyEvent.

**Expected**
Forbidden: the work product may plan topics but cannot author future testimony.

**Observed**
WPP-5 keep independent provenance, so the attempted cross-layer promotion has no resulting record. 
WPP-5 retains the phrase as lawyer-authored preparation content. The attempted edge `WPP-5.required_answer → WA/TE` is absent; no PersonKnowledge write occurred, and a future answer would require a real QuestionAttempt.

**Verdict**
PASS

**Boundary note**
Case 5의 판정은 preparation scripting attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 6 — Lawyer theory injected into witness memory attack

**Purpose**
Case 6은 lawyer theory injected into witness memory attack 경계를 독립적으로 확인한다.

**Fixture**
CT-A says payment was approved; preparation copies CT-A into PersonKnowledge.

**Manual verification**
Compare the two sides of the proposed transition: CT-A / lawyer preparation content → PersonKnowledge. Check the stores named in the fixture for the permitted state: CT-A may guide preparation/question strategy; PersonKnowledge remains unchanged absent a witness-originating knowledge event.

**Expected**
Forbidden: CaseTheory can guide questions, not create witness memory.

**Observed**
Attempted transition: CT-A / lawyer preparation content → PersonKnowledge. Permitted state: CT-A may guide preparation/question strategy; PersonKnowledge remains unchanged absent a witness-originating knowledge event.
The source records remain Lawyer theory injected into witness memory attack; only their declared planning or interaction role is present, and no truth/finding shortcut is emitted.

**Verdict**
PASS

**Boundary note**
Case 6의 판정은 lawyer theory injected into witness memory attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 7 — Preparation clarification

**Purpose**
Case 7은 preparation clarification 경계를 독립적으로 확인한다.

**Fixture**
Witness says during prep that 'evening' meant after 7 PM.

**Manual verification**
Compare the preparation-time utterance that “evening” meant after 7 PM with the earlier account and inspect whether a new statement event or overwrite was recorded.

**Expected**
Record a new PreparationStatement linked to the earlier account; no truth promotion.

**Observed**
A new PreparationStatement records the witness’s “after 7 PM” clarification and links back to the earlier account. The earlier statement text remains unchanged; no TestimonyEvent, CourtRecordEntry or truth flag is created by the clarification.

**Verdict**
PASS

**Boundary note**
Case 7의 판정은 preparation clarification에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 8 — Changed preparation statement

**Purpose**
Case 8은 changed preparation statement 경계를 독립적으로 확인한다.

**Fixture**
RS-8 says car was blue; PS-8 says witness now recalls gray.

**Manual verification**
Order RS-8, PS-8 by the fixture’s time/version markers and inspect both the predecessor payload and the new event’s parent link after the change.

**Expected**
Both accounts coexist with time/provenance and may trigger plan revision.

**Observed**
The later event is appended to RS-8, PS-8 with its own timestamp/version relation. The predecessor payload remains queryable, so the current projection changes without rewriting the earlier statement, plan or testimony.

**Verdict**
PASS

**Boundary note**
Case 8의 판정은 changed preparation statement에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 9 — Old interview overwrite attack

**Purpose**
Case 9은 old interview overwrite attack 경계를 독립적으로 확인한다.

**Fixture**
PS-9 differs from RS-9 and engine replaces RS-9 text.

**Manual verification**
Attempted transition: PS-9,RS-9 → old interview overwrite.
Permitted state: PS-9, RS-9 retain their recorded fixture states; only the explicitly described event can create a descendant.
Order PS-9, RS-9 by the fixture’s time/version markers and inspect both the predecessor payload and the new event’s parent link after the change.

**Expected**
Forbidden: preparation change cannot rewrite the interview event.

**Observed**
PS-9, RS-9 remain available for later review in their original role; the shortcut target is not a stored child. 
The later event is appended to PS-9, RS-9 with its own timestamp/version relation. The predecessor payload remains queryable, so the current projection changes without rewriting the earlier statement, plan or testimony.

**Verdict**
PASS

**Boundary note**
Case 9의 판정은 old interview overwrite attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 10 — Inconsistency ≠ lie

**Purpose**
Case 10은 inconsistency ≠ lie 경계를 독립적으로 확인한다.

**Fixture**
RS-10 says 3 PM; PS-10 says 4 PM; no deception evidence exists.

**Manual verification**
Trace RS-10, PS-10 through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Represent inconsistency and alternatives; do not set isLying or choose truth.

**Observed**
RS-10, PS-10 remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 10의 판정은 inconsistency ≠ lie에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 11 — Basic ExaminationPlan

**Purpose**
Case 11은 basic examinationplan 경계를 독립적으로 확인한다.

**Fixture**
EP-11 targets Issue I-2 with topic groups, exhibits, branches and risks.

**Manual verification**
Trace the version edge from EP-11, I-2, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
EP-11 is a tactical versioned WorkProduct, not a proceeding event.

**Observed**
trace the version edge from EP-11, I-2, the source and derived record stay distinct, so only the explicitly recorded transition is visible. EP-11, I-2 are queryable as the fixture records, not as a replacement object with inferred testimony.

**Verdict**
PASS

**Boundary note**
Case 11의 판정은 basic examinationplan에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 12 — Plan auto-testimony attack

**Purpose**
Case 12은 plan auto-testimony attack 경계를 독립적으로 확인한다.

**Fixture**
EP-12 includes goal 'establish F' and five questions.

**Manual verification**
Attempted transition: EP-12 → plan auto-testimony.
Permitted state: EP-12 retain their recorded fixture states; only the explicitly described event can create a descendant.
Compare the scope fields on EP-12, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Forbidden: creating or completing a plan produces no answer/testimony.

**Observed**
The permitted projection for EP-12 is limited to the fixture’s explicit event and does not synthesize another layer. 
compare the scope fields on EP-12, the observed child is linked to the cited parent and no unsupported promotion is emitted. The graph ends at the recorded EP-12 relation for this fixture; a separate action would be needed for the proposed target.

**Verdict**
PASS

**Boundary note**
Case 12의 판정은 plan auto-testimony attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 13 — Planned question

**Purpose**
Case 13은 planned question 경계를 독립적으로 확인한다.

**Fixture**
EP-13 contains PQ-1 asking where W stood.

**Manual verification**
Compare the planned/attempted/answered fields attached to EP-13, PQ-1 and identify the exact event that would be required for the next descendant.

**Expected**
PQ-1 remains planned until an explicit QuestionAttempt occurs.

**Observed**
EP-13, PQ-1 retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 13의 판정은 planned question에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 14 — Planned question skipped

**Purpose**
Case 14은 planned question skipped 경계를 독립적으로 확인한다.

**Fixture**
Time ends before PQ-14 is asked.

**Manual verification**
Compare the planned/attempted/answered fields attached to PQ-14 and identify the exact event that would be required for the next descendant.

**Expected**
No QuestionAttempt, WitnessAnswer or TestimonyEvent exists for PQ-14.

**Observed**
PQ-14 retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 14의 판정은 planned question skipped에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 15 — Off-plan question

**Purpose**
Case 15은 off-plan question 경계를 독립적으로 확인한다.

**Fixture**
Answer to Q-1 reveals a new date; examiner asks Q-X not in EP-15.

**Manual verification**
Compare the planned/attempted/answered fields attached to EP-15 and identify the exact event that would be required for the next descendant.

**Expected**
An explicit off-plan QuestionAttempt is valid; plan is not an executable script.

**Observed**
EP-15 retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 15의 판정은 off-plan question에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 16 — QuestionAttempt

**Purpose**
Case 16은 questionattempt 경계를 독립적으로 확인한다.

**Fixture**
At order 12, Lawyer L asks W-16 Q-16 in PC-1.

**Manual verification**
Compare the planned/attempted/answered fields attached to PC-1 and identify the exact event that would be required for the next descendant.

**Expected**
Create QA-16 with examiner/witness/content/order/refs; answer remains separate.

**Observed**
PC-1 retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 16의 판정은 questionattempt에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 17 — Question disallowed by supplied fixture

**Purpose**
Case 17은 question disallowed by supplied fixture 경계를 독립적으로 확인한다.

**Fixture**
Fixture rule marks QA-17 disallowed.

**Manual verification**
Trace QA-17 through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Record QuestionProceduralResult=disallowed without inventing objection doctrine.

**Observed**
QA-17 remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 17의 판정은 question disallowed by supplied fixture에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 18 — Disallowed question still answered attack

**Purpose**
Case 18은 disallowed question still answered attack 경계를 독립적으로 확인한다.

**Fixture**
QA-18 is disallowed but engine auto-generates substantive testimony.

**Manual verification**
Attempted transition: QA-18 → disallowed question still answered.
Permitted state: QA-18 retain their recorded fixture states; only the explicitly described event can create a descendant.
Compare the planned/attempted/answered fields attached to QA-18 and identify the exact event that would be required for the next descendant.

**Expected**
Forbidden absent a separately observed answer/event allowed by supplied semantics.

**Observed**
The ledger records QA-18 as supplied, with no implicit promotion to the target state. 
QA-18 retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 18의 판정은 disallowed question still answered attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 19 — Allowed question

**Purpose**
Case 19은 allowed question 경계를 독립적으로 확인한다.

**Fixture**
Fixture result permits QA-19.

**Manual verification**
Compare the planned/attempted/answered fields attached to QA-19 and identify the exact event that would be required for the next descendant.

**Expected**
Allowed status enables opportunity to answer but does not generate one.

**Observed**
QA-19 retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 19의 판정은 allowed question에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 20 — Allowed but witness refuses

**Purpose**
Case 20은 allowed but witness refuses 경계를 독립적으로 확인한다.

**Fixture**
QA-20 permitted; W states refusal.

**Manual verification**
Inspect QA-20 after it is permitted, and distinguish the recorded answer outcome from any presumed substantive fact. Verify the named prior question/attempt links.

**Expected**
Record refusal outcome; do not treat it as answer truth or automatic failure.

**Observed**
QA-20 carries outcome=refusal in the fixture: no substantive WA/TE beyond the refusal. The question/answer records retain their separate scope, so no different answer type or truth state is inferred.

**Verdict**
PASS

**Boundary note**
Case 20의 판정은 allowed but witness refuses에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 21 — No recollection

**Purpose**
Case 21은 no recollection 경계를 독립적으로 확인한다.

**Fixture**
W-21 replies 'I do not remember.'

**Manual verification**
Inspect W-21 after it is questioned, and distinguish the recorded answer outcome from any presumed substantive fact. Verify the named prior question/attempt links.

**Expected**
Record no_recollection as a valid WitnessAnswer type.

**Observed**
W-21 carries outcome=no_recollection in the fixture: an answer event with outcome=no_recollection. The question/answer records retain their separate scope, so no different answer type or truth state is inferred.

**Verdict**
PASS

**Boundary note**
Case 21의 판정은 no recollection에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 22 — Partial answer

**Purpose**
Case 22은 partial answer 경계를 독립적으로 확인한다.

**Fixture**
Asked who attended and when; W names attendees but not time.

**Manual verification**
Inspect the attendees/time question after it is asked, and distinguish the recorded answer outcome from any presumed substantive fact. Verify the named prior question/attempt links.

**Expected**
Preserve answered and unresolved portions rather than binary success.

**Observed**
the attendees/time question carries outcome=partial in the fixture: attendees answered while time remains unresolved. The question/answer records retain their separate scope, so no different answer type or truth state is inferred.

**Verdict**
PASS

**Boundary note**
Case 22의 판정은 partial answer에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 23 — Misunderstood question

**Purpose**
Case 23은 misunderstood question 경계를 독립적으로 확인한다.

**Fixture**
W-23 answers about a different contract and asks what period is meant.

**Manual verification**
Inspect the original QuestionAttempt after it is received a misunderstood response, and distinguish the recorded answer outcome from any presumed substantive fact. Verify the named prior question/attempt links.

**Expected**
Record misunderstanding; original question remains unchanged.

**Observed**
the original QuestionAttempt carries outcome=misunderstanding in the fixture: the original question remains unchanged. The question/answer records retain their separate scope, so no different answer type or truth state is inferred.

**Verdict**
PASS

**Boundary note**
Case 23의 판정은 misunderstood question에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 24 — Clarification

**Purpose**
Case 24은 clarification 경계를 독립적으로 확인한다.

**Fixture**
Examiner reformulates QA-23 as QA-24 and W answers the clarified scope.

**Manual verification**
Inspect QA-23 and QA-24 after it is reformulated, and distinguish the recorded answer outcome from any presumed substantive fact. Verify the named prior question/attempt links.

**Expected**
New QuestionAttempt/Answer events preserve the earlier misunderstanding.

**Observed**
QA-23 and QA-24 carries outcome=clarification in the fixture: the new answer belongs to QA-24, not QA-23. The question/answer records retain their separate scope, so no different answer type or truth state is inferred.

**Verdict**
PASS

**Boundary note**
Case 24의 판정은 clarification에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 25 — Answer X

**Purpose**
Case 25은 answer x 경계를 독립적으로 확인한다.

**Fixture**
W-25 says 'the light was red.'

**Manual verification**
Compare the planned/attempted/answered fields attached to Answer X and identify the exact event that would be required for the next descendant.

**Expected**
Create WA-25/TestimonyEvent candidate as a statement, not a fact finding.

**Observed**
Answer X retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 25의 판정은 answer x에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 26 — Answer X→truth attack

**Purpose**
Case 26은 answer x→truth attack 경계를 독립적으로 확인한다.

**Fixture**
WA-26 says X and engine sets CaseFileFact/ActualState=X.

**Manual verification**
Attempted transition: WA-26 → answer x→truth.
Permitted state: WA-26 retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace WA-26 through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Forbidden: courtroom answer does not carry truth authority.

**Observed**
The state attached to WA-26 is the one declared by the fixture; no automatic successor is added. 
WA-26 remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 26의 판정은 answer x→truth attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 27 — Direct examination context

**Purpose**
Case 27은 direct examination context 경계를 독립적으로 확인한다.

**Fixture**
Party calling W asks observation/chronology questions in direct context.

**Manual verification**
Cross-check the timing of Direct examination context, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Tag examination context; do not hardcode jurisdiction-specific restrictions.

**Observed**
cross-check the timing of Direct examination context, the answer/plan/record boundary remains explicit in the resulting object graph. Direct examination context remain available for later review in their original role; the shortcut target is not a stored child.

**Verdict**
PASS

**Boundary note**
Case 27의 판정은 direct examination context에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 28 — Cross examination context

**Purpose**
Case 28은 cross examination context 경계를 독립적으로 확인한다.

**Fixture**
Opposing lawyer confronts W with RS-28 and E-7.

**Manual verification**
Examine the descendant links from RS-28, E-7, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Tag cross context and explicit events; outcome is not automatic impeachment.

**Observed**
examine the descendant links from RS-28, E-7, the actor and time remain those declared in the fixture, preventing reassignment or rewrite. Only the named source/event fields on RS-28, E-7 change; no unrequested answer or finding field is written.

**Verdict**
PASS

**Boundary note**
Case 28의 판정은 cross examination context에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 29 — CrossSuccess meter attack

**Purpose**
Case 29은 crosssuccess meter attack 경계를 독립적으로 확인한다.

**Fixture**
Three contradictions yield CrossSuccess=91 and case-win modifier.

**Manual verification**
Compare the two sides of the proposed transition: three contradiction relations → CrossSuccess=91 → case-win modifier. Check the stores named in the fixture for the permitted state: the three contradiction relations remain structured relations; no CrossSuccess field or case-win modifier is created from their count.

**Expected**
Forbidden: no universal score, falsity flag or direct outcome modifier.

**Observed**
Attempted transition: three contradiction relations → CrossSuccess=91 → case-win modifier. Permitted state: the three contradiction relations remain structured relations; no CrossSuccess field or case-win modifier is created from their count.
The source records remain CrossSuccess meter attack; only their declared planning or interaction role is present, and no truth/finding shortcut is emitted.

**Verdict**
PASS

**Boundary note**
Case 29의 판정은 crosssuccess meter attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 30 — Expected answer

**Purpose**
Case 30은 expected answer 경계를 독립적으로 확인한다.

**Fixture**
EP-30 records expected answers A/B for PQ-30.

**Manual verification**
Read EP-30’s expected A/B fields and compare them with the hearing event log; confirm the plan contains hypotheses rather than a WitnessAnswer.

**Expected**
Expected values are planning branches, not previewed witness state.

**Observed**
EP-30 stores expected branches A and B as planning metadata. Neither branch became a WA/TE before a question event, so the plan did not preview or select an actual answer.

**Verdict**
PASS

**Boundary note**
Case 30의 판정은 expected answer에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 31 — Expected answer auto-materialized attack

**Purpose**
Case 31은 expected answer auto-materialized attack 경계를 독립적으로 확인한다.

**Fixture**
At hearing, engine copies EP expected A into WA-31.

**Manual verification**
Attempted transition: WA-31 → expected answer auto-materialized.
Permitted state: WA-31 retain their recorded fixture states; only the explicitly described event can create a descendant.
Search for a QuestionAttempt and WitnessAnswer descended from EP-31’s expected A after the fixture begins; distinguish the planning field from an observed response.

**Expected**
Forbidden: actual answer requires a materialized witness event.

**Observed**
WA-31 retain their actor, content and timing, while the proposed downstream state stays uninstantiated. 
EP-31 still contains expected A, but no WA-31 was instantiated from that field. The attempted `expected A → WA-31=A` transition is blocked until an actual witness response is materialized.

**Verdict**
PASS

**Boundary note**
Case 31의 판정은 expected answer auto-materialized attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 32 — Branch A answer → Q2A

**Purpose**
Case 32은 branch a answer → q2a 경계를 독립적으로 확인한다.

**Fixture**
Observed WA-32=A activates contextually relevant follow-up Q2A.

**Manual verification**
Order WA-32 and the candidate follow-up records, checking that Q2A becomes available only after the observed answer event.

**Expected**
Branching may use the observed answer after it occurs.

**Observed**
WA-32=A is the event that opens Q2A’s contextual branch; before WA-32 there is no Q2A recommendation. The branch is therefore evidence-driven rather than a hidden-answer preview.

**Verdict**
PASS

**Boundary note**
Case 32의 판정은 branch a answer → q2a에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 33 — Branch B answer → Q2B

**Purpose**
Case 33은 branch b answer → q2b 경계를 독립적으로 확인한다.

**Fixture**
Observed WA-33=B makes Q2B relevant instead of Q2A.

**Manual verification**
Compare WA-33=B with the branch registry and verify that Q2B, not Q2A, is selected only after B is observed.

**Expected**
No pre-hearing hidden branch is exposed; branch follows WA-33.

**Observed**
The branch registry records WA-33=B and then exposes Q2B as the relevant follow-up. No branch was chosen from hidden witness state before the answer.

**Verdict**
PASS

**Boundary note**
Case 33의 판정은 branch b answer → q2b에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 34 — Hidden witness knowledge preview attack

**Purpose**
Case 34은 hidden witness knowledge preview attack 경계를 독립적으로 확인한다.

**Fixture**
W secretly knows X; UI highlights 'Ask X—known answer.'

**Manual verification**
Compare the two sides of the proposed transition: hidden PersonKnowledge X → player-visible “Ask X” recommendation. Check the stores named in the fixture for the permitted state: question suggestions use RS-34=Y and E-2 or other authorized inputs; X remains hidden and produces no recommendation.

**Expected**
Forbidden: only interview/statements/evidence may ground question suggestions.

**Observed**
Attempted transition: hidden PersonKnowledge X → player-visible “Ask X” recommendation. Permitted state: question suggestions use RS-34=Y and E-2 or other authorized inputs; X remains hidden and produces no recommendation.
The source records remain Hidden witness knowledge preview attack; only their declared planning or interaction role is present, and no truth/finding shortcut is emitted.

**Verdict**
PASS

**Boundary note**
Case 34의 판정은 hidden witness knowledge preview attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 35 — Surprise testimony

**Purpose**
Case 35은 surprise testimony 경계를 독립적으로 확인한다.

**Fixture**
RS-35 indicated X, but W spontaneously testifies Y.

**Manual verification**
Compare RS-35/EP-35 expected X with the actual WA/TE record and confirm the latter is appended under the proceeding.

**Expected**
Y is a valid materialized surprise event; X and plan remain historical.

**Observed**
RS-35 and the plan’s X expectation remain stored; a new WA/TE=Y is appended to the hearing sequence. The new testimony does not edit RS-35 or EP-35.

**Verdict**
PASS

**Boundary note**
Case 35의 판정은 surprise testimony에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 36 — Reload reroll testimony attack

**Purpose**
Case 36은 reload reroll testimony attack 경계를 독립적으로 확인한다.

**Fixture**
TE-36=Y is saved; reload produces X from same event id.

**Manual verification**
Attempted transition: TE-36 → reload reroll testimony.
Permitted state: TE-36 retain their recorded fixture states; only the explicitly described event can create a descendant.
Reload the saved event identity for TE-36 and compare its payload before and after reload; verify any new answer would have a new event id.

**Expected**
Forbidden: reuse TE-36; new answer needs a new cause/event.

**Observed**
The state attached to TE-36 is the one declared by the fixture; no automatic successor is added. 
TE-36 continues to carry Y after reload, with the same event identity and provenance. No replacement X answer was generated, so save/reload cannot reroll testimony.

**Verdict**
PASS

**Boundary note**
Case 36의 판정은 reload reroll testimony attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 37 — Exceptional preparation lawyer

**Purpose**
Case 37은 exceptional preparation lawyer 경계를 독립적으로 확인한다.

**Fixture**
Senior spots unresolved chronology and exhibit mismatch in WPP-37.

**Manual verification**
Check WPP-37 before and after the stated capability/status condition, then inspect whether the attacked chronology/exhibit mismatch transition is recorded.

**Expected**
Component-level improvement is allowed; witness truth/favorability is unchanged.

**Observed**
WPP-37 is updated with the identified chronology gap and exhibit mismatch as structured preparation risks and follow-up topics. This is an allowed component-level improvement. No PersonKnowledge, WitnessAnswer, testimony favorability or CourtFactFinding is modified.

**Verdict**
PASS

**Boundary note**
Case 37의 판정은 exceptional preparation lawyer에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 38 — WitnessPrepSkill attack

**Purpose**
Case 38은 witnessprepskill attack 경계를 독립적으로 확인한다.

**Fixture**
PrepSkill=88 applies +20% truthful/favorable testimony.

**Manual verification**
Compare the two sides of the proposed transition: PrepSkill=88 → +20% truthful/favorable testimony. Check the stores named in the fixture for the permitted state: PrepSkill=88 creates no truth or favorability modifier; the plan and any later answer remain independent records.

**Expected**
Forbidden: preparation skill cannot modify truth or guarantee answers.

**Observed**
Attempted transition: PrepSkill=88 → +20% truthful/favorable testimony. Permitted state: PrepSkill=88 creates no truth or favorability modifier; the plan and any later answer remain independent records.
The source records remain WitnessPrepSkill attack; only their declared planning or interaction role is present, and no truth/finding shortcut is emitted.

**Verdict**
PASS

**Boundary note**
Case 38의 판정은 witnessprepskill attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 39 — Exceptional examiner

**Purpose**
Case 39은 exceptional examiner 경계를 독립적으로 확인한다.

**Fixture**
Lawyer creates clear sequence and adaptive follow-ups from known material.

**Manual verification**
Check the exceptional examiner’s EP-39 before and after the stated capability/status condition, then inspect whether the attacked clearer sequence/follow-up transition is recorded.

**Expected**
Better questions are possible; hidden answers and judge findings remain inaccessible.

**Observed**
EP-39 contains the clearer sequence and additional follow-up branches derived from known material. The improved plan is valid. No hidden answer, PersonKnowledge or judge cognition is accessed, and no WitnessAnswer is pre-generated.

**Verdict**
PASS

**Boundary note**
Case 39의 판정은 exceptional examiner에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 40 — CourtroomSkill attack

**Purpose**
Case 40은 courtroomskill attack 경계를 독립적으로 확인한다.

**Fixture**
CourtroomSkill=94 directly sets WA-40=favorable.

**Manual verification**
Attempted transition: WA-40 → courtroomskill.
Permitted state: WA-40 retain their recorded fixture states; only the explicitly described event can create a descendant.
Check CourtroomSkill=94 before and after the stated capability/status condition, then inspect whether the attacked WA-40=favorable transition is recorded.

**Expected**
Forbidden: universal capability cannot control witness response.

**Observed**
Only the named source/event fields on WA-40 change; no unrequested answer or finding field is written. 
CourtroomSkill=94 produced no automatic WA-40 only; the attempted WA-40=favorable transition was not materialized. answer still requires event remains an independent semantic boundary, so no PersonKnowledge, WitnessAnswer or CourtFactFinding shortcut exists.

**Verdict**
PASS

**Boundary note**
Case 40의 판정은 courtroomskill attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 41 — Cooperative witness gives unfavorable answer

**Purpose**
Case 41은 cooperative witness gives unfavorable answer 경계를 독립적으로 확인한다.

**Fixture**
Cooperative W truthfully or mistakenly gives an answer harmful to caller.

**Manual verification**
Check cooperative W-41 before and after the stated capability/status condition, then inspect whether the attacked harmful answer transition is recorded.

**Expected**
Cooperation and favorability are independent; unfavorable testimony is valid.

**Observed**
W-41 remains cooperative while the materialized WitnessAnswer is harmful to the calling party. Both states coexist. Cooperation does not alter the answer into a favorable one and does not determine truth.

**Verdict**
PASS

**Boundary note**
Case 41의 판정은 cooperative witness gives unfavorable answer에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 42 — Hostile witness gives useful answer

**Purpose**
Case 42은 hostile witness gives useful answer 경계를 독립적으로 확인한다.

**Fixture**
Reluctant W nonetheless provides a useful date.

**Manual verification**
Check hostile W-42 before and after the stated capability/status condition, then inspect whether the attacked useful answer transition is recorded.

**Expected**
Hostility does not prevent useful content or determine truth.

**Observed**
W-42 retains the hostile/reluctant interaction context while producing the useful date in the WitnessAnswer. Hostility does not suppress the useful answer and does not determine its truth.

**Verdict**
PASS

**Boundary note**
Case 42의 판정은 hostile witness gives useful answer에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 43 — Cooperation/truth collapse attack

**Purpose**
Case 43은 cooperation/truth collapse attack 경계를 독립적으로 확인한다.

**Fixture**
Cooperation=high causes all answers to be marked true.

**Manual verification**
Compare the two sides of the proposed transition: Cooperation=high → all WitnessAnswers marked true. Check the stores named in the fixture for the permitted state: Cooperation=high remains interaction context; existing WitnessAnswers retain assertion status and are not rewritten as true.

**Expected**
Forbidden: cooperation describes interaction, not epistemic authority.

**Observed**
Attempted transition: Cooperation=high → all WitnessAnswers marked true. Permitted state: Cooperation=high remains interaction context; existing WitnessAnswers retain assertion status and are not rewritten as true.
The source records remain Cooperation/truth collapse attack; only their declared planning or interaction role is present, and no truth/finding shortcut is emitted.

**Verdict**
PASS

**Boundary note**
Case 43의 판정은 cooperation/truth collapse attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 44 — Good relationship/favorable testimony attack

**Purpose**
Case 44은 good relationship/favorable testimony attack 경계를 독립적으로 확인한다.

**Fixture**
W has strong relationship with lawyer; engine forces favorable branch.

**Manual verification**
Compare the two sides of the proposed transition: strong relationship → forced favorable WitnessAnswer branch. Check the stores named in the fixture for the permitted state: relationship context does not select a favorable branch; any WitnessAnswer still comes from an observed question/response event.

**Expected**
Forbidden: relationship is context, not obedience aura.

**Observed**
Attempted transition: strong relationship → forced favorable WitnessAnswer branch. Permitted state: relationship context does not select a favorable branch; any WitnessAnswer still comes from an observed question/response event.
The source records remain Good relationship/favorable testimony attack; only their declared planning or interaction role is present, and no truth/finding shortcut is emitted.

**Verdict**
PASS

**Boundary note**
Case 44의 판정은 good relationship/favorable testimony attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 45 — Prior InterviewStatement used as reference

**Purpose**
Case 45은 prior interviewstatement used as reference 경계를 독립적으로 확인한다.

**Fixture**
QA-45 references RS-45 to ask about changed time.

**Manual verification**
Reconcile the source references on QA-45, RS-45, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Reference is allowed if fixture permits; RS-45 is not thereby admitted.

**Observed**
reconcile the source references on QA-45, RS-45, the current projection changes only where the fixture supplies an action, preserving earlier provenance. QA-45, RS-45 keep their recorded type and scope; the fixture does not add the attempted descendant.

**Verdict**
PASS

**Boundary note**
Case 45의 판정은 prior interviewstatement used as reference에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 46 — Prior statement auto-admitted attack

**Purpose**
Case 46은 prior statement auto-admitted attack 경계를 독립적으로 확인한다.

**Fixture**
Merely citing RS-46 creates CourtRecord exhibit.

**Manual verification**
Attempted transition: RS-46 → prior statement auto-admitted.
Permitted state: RS-46 retain their recorded fixture states; only the explicitly described event can create a descendant.
Follow RS-46 from source/interview form through the confrontation or exhibit step and compare source, exhibit and response provenance.

**Expected**
Forbidden without explicit procedural admission/materialization.

**Observed**
The state attached to RS-46 is the one declared by the fixture; no automatic successor is added. 
RS-46 records a reference/showing and, where present, a separate witness response. No source was silently admitted or converted into truth; each procedural status remains on its own object.

**Verdict**
PASS

**Boundary note**
Case 46의 판정은 prior statement auto-admitted attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 47 — Evidence confrontation

**Purpose**
Case 47은 evidence confrontation 경계를 독립적으로 확인한다.

**Fixture**
Examiner shows admitted-or-permitted E-47 and asks if W recognizes it.

**Manual verification**
Follow E-47 from source/interview form through the confrontation or exhibit step and compare source, exhibit and response provenance.

**Expected**
Question and response remain open; showing does not compel agreement.

**Observed**
E-47 records a reference/showing and, where present, a separate witness response. No source was silently admitted or converted into truth; each procedural status remains on its own object.

**Verdict**
PASS

**Boundary note**
Case 47의 판정은 evidence confrontation에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 48 — Document shown→agreement attack

**Purpose**
Case 48은 document shown→agreement attack 경계를 독립적으로 확인한다.

**Fixture**
E-48 says March 3; engine forces W to agree.

**Manual verification**
Attempted transition: E-48 → document shown→agreement.
Permitted state: E-48 retain their recorded fixture states; only the explicitly described event can create a descendant.
Follow E-48 from source/interview form through the confrontation or exhibit step and compare source, exhibit and response provenance.

**Expected**
Forbidden: document content does not predetermine WitnessAnswer.

**Observed**
The ledger records E-48 as supplied, with no implicit promotion to the target state. 
E-48 records a reference/showing and, where present, a separate witness response. No source was silently admitted or converted into truth; each procedural status remains on its own object.

**Verdict**
PASS

**Boundary note**
Case 48의 판정은 document shown→agreement attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 49 — SourceMaterial→exhibit auto-admission attack

**Purpose**
Case 49은 sourcematerial→exhibit auto-admission attack 경계를 독립적으로 확인한다.

**Fixture**
Case File SourceMaterial S-49 is selected in EP.

**Manual verification**
Attempted transition: S-49 → sourcematerial→exhibit auto-admission.
Permitted state: S-49 retain their recorded fixture states; only the explicitly described event can create a descendant.
Follow S-49 from source/interview form through the confrontation or exhibit step and compare source, exhibit and response provenance.

**Expected**
Selection does not file/admit it; explicit exhibit procedure is required.

**Observed**
S-49 remain available for later review in their original role; the shortcut target is not a stored child. 
S-49 records a reference/showing and, where present, a separate witness response. No source was silently admitted or converted into truth; each procedural status remains on its own object.

**Verdict**
PASS

**Boundary note**
Case 49의 판정은 sourcematerial→exhibit auto-admission attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 50 — TestimonyEvent

**Purpose**
Case 50은 testimonyevent 경계를 독립적으로 확인한다.

**Fixture**
Allowed QA-50 receives substantive WA-50 in PC-2.

**Manual verification**
Check the event ledger for QA-50, WA-50, PC-2, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Create TE-50 linking proceeding/witness/question/answer/order/provenance.

**Observed**
check the event ledger for QA-50, WA-50, PC-2, The ledger records QA-50, WA-50, PC-2 as supplied, with no implicit promotion to the target state. The permitted projection for QA-50, WA-50, PC-2 is limited to the fixture’s explicit event and does not synthesize another layer.

**Verdict**
PASS

**Boundary note**
Case 50의 판정은 testimonyevent에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 51 — Testimony→CourtRecord auto-materialization attack

**Purpose**
Case 51은 testimony→courtrecord auto-materialization attack 경계를 독립적으로 확인한다.

**Fixture**
TE-51 exists but no record rule/event is supplied.

**Manual verification**
Attempted transition: TE-51 → testimony→courtrecord auto-materialization.
Permitted state: TE-51 retain their recorded fixture states; only the explicitly described event can create a descendant.
Inspect TE-51 for a supplied materialization rule/event, then compare any CourtRecordEntry fields with the source TestimonyEvent and finding layer.

**Expected**
Forbidden: TE-51 alone does not create CR-51.

**Observed**
TE-51 retain their actor, content and timing, while the proposed downstream state stays uninstantiated. 
TE-51 stops at its source testimony when no rule is supplied, or creates the named CourtRecordEntry only through the fixture rule. The record preserves the source scope and does not create a CourtFactFinding automatically.

**Verdict**
PASS

**Boundary note**
Case 51의 판정은 testimony→courtrecord auto-materialization attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 52 — Explicit CourtRecord materialization

**Purpose**
Case 52은 explicit courtrecord materialization 경계를 독립적으로 확인한다.

**Fixture**
Fixture provides valid PR-52 mapping TE-52 to CR-52.

**Manual verification**
Inspect TE-52, CR-52 for a supplied materialization rule/event, then compare any CourtRecordEntry fields with the source TestimonyEvent and finding layer.

**Expected**
Create provenance-bearing CR-52 preserving question, answer and context.

**Observed**
TE-52, CR-52 stops at its source testimony when no rule is supplied, or creates the named CourtRecordEntry only through the fixture rule. The record preserves the source scope and does not create a CourtFactFinding automatically.

**Verdict**
PASS

**Boundary note**
Case 52의 판정은 explicit courtrecord materialization에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 53 — CourtRecord testimony→FactFinding attack

**Purpose**
Case 53은 courtrecord testimony→factfinding attack 경계를 독립적으로 확인한다.

**Fixture**
CR-53 contains W saying X; engine sets FF=X.

**Manual verification**
Attempted transition: CR-53 → courtrecord testimony→factfinding.
Permitted state: CR-53 retain their recorded fixture states; only the explicitly described event can create a descendant.
Inspect CR-53 for a supplied materialization rule/event, then compare any CourtRecordEntry fields with the source TestimonyEvent and finding layer.

**Expected**
Forbidden: record content remains input to later adjudication.

**Observed**
CR-53 are queryable as the fixture records, not as a replacement object with inferred testimony. 
CR-53 stops at its source testimony when no rule is supplied, or creates the named CourtRecordEntry only through the fixture rule. The record preserves the source scope and does not create a CourtFactFinding automatically.

**Verdict**
PASS

**Boundary note**
Case 53의 판정은 courtrecord testimony→factfinding attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 54 — Testimony→JII direct mutation attack

**Purpose**
Case 54은 testimony→jii direct mutation attack 경계를 독립적으로 확인한다.

**Fixture**
Dramatic TE-54 adds judge sympathy/JII weight.

**Manual verification**
Attempted transition: TE-54 → testimony→jii direct mutation.
Permitted state: TE-54 retain their recorded fixture states; only the explicitly described event can create a descendant.
Inspect the proceeding record for TE-54, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Forbidden absent an explicit downstream adjudicative rule.

**Observed**
The graph ends at the recorded TE-54 relation for this fixture; a separate action would be needed for the proposed target. 
inspect the proceeding record for TE-54, the fixture produces a bounded state change and leaves upstream epistemic data untouched. The state attached to TE-54 is the one declared by the fixture; no automatic successor is added.

**Verdict**
PASS

**Boundary note**
Case 54의 판정은 testimony→jii direct mutation attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 55 — CaseTheory guides question

**Purpose**
Case 55은 casetheory guides question 경계를 독립적으로 확인한다.

**Fixture**
CT-A motivates questions about decision timing.

**Manual verification**
Compare the planned/attempted/answered fields attached to CaseTheory guides question and identify the exact event that would be required for the next descendant.

**Expected**
Question targeting may reference CT-A; CT-A does not enter witness memory.

**Observed**
CaseTheory guides question retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 55의 판정은 casetheory guides question에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 56 — CaseTheory writes witness answer attack

**Purpose**
Case 56은 casetheory writes witness answer attack 경계를 독립적으로 확인한다.

**Fixture**
Because CT-A selected, W automatically answers consistently with it.

**Manual verification**
Attempted transition: the CaseTheory writes witness answer attack record → casetheory writes witness answer.
Permitted state: the CaseTheory writes witness answer attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Compare the planned/attempted/answered fields attached to CaseTheory writes witness answer attack and identify the exact event that would be required for the next descendant.

**Expected**
Forbidden: strategic selection cannot control testimony.

**Observed**
The state attached to CaseTheory writes witness answer attack is the one declared by the fixture; no automatic successor is added. 
CaseTheory writes witness answer attack retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 56의 판정은 casetheory writes witness answer attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 57 — Witness unavailable before hearing

**Purpose**
Case 57은 witness unavailable before hearing 경계를 독립적으로 확인한다.

**Fixture**
Prepared W-57 becomes unavailable one day before PC-3.

**Manual verification**
Compare the availability state on PC-3 with the scheduled ProceedingContext and inspect whether the examination path blocks, cancels or replans.

**Expected**
Examination Task may block/cancel/replan; do not fabricate presence.

**Observed**
PC-3 carries unavailable status at the hearing boundary, so the examination descendant is blocked/replanned rather than fabricated. Existing preparation records remain available for later disposition.

**Verdict**
PASS

**Boundary note**
Case 57의 판정은 witness unavailable before hearing에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 58 — Preparation remains after unavailability

**Purpose**
Case 58은 preparation remains after unavailability 경계를 독립적으로 확인한다.

**Fixture**
WPP-58 exists when W becomes unavailable.

**Manual verification**
Examine the descendant links from WPP-58, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Preserve WPP-58 and costs/history even if no examination occurs.

**Observed**
examine the descendant links from WPP-58, the actor and time remain those declared in the fixture, preventing reassignment or rewrite. Only the named source/event fields on WPP-58 change; no unrequested answer or finding field is written.

**Verdict**
PASS

**Boundary note**
Case 58의 판정은 preparation remains after unavailability에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 59 — Witness changes account before hearing

**Purpose**
Case 59은 witness changes account before hearing 경계를 독립적으로 확인한다.

**Fixture**
During prep W-59 changes who signed the document.

**Manual verification**
Trace Witness changes account before hearing through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Create new statement, contradiction relation and possible follow-up Tasks.

**Observed**
Witness changes account before hearing remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 59의 판정은 witness changes account before hearing에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 60 — Plan revised

**Purpose**
Case 60은 plan revised 경계를 독립적으로 확인한다.

**Fixture**
New PS-60 causes EP-60-v2 to add alternate branch.

**Manual verification**
Order PS-60, EP-60-v2 by the fixture’s time/version markers and inspect both the predecessor payload and the new event’s parent link after the change.

**Expected**
Create v2 with source refs; do not edit v1 in place.

**Observed**
The later event is appended to PS-60, EP-60-v2 with its own timestamp/version relation. The predecessor payload remains queryable, so the current projection changes without rewriting the earlier statement, plan or testimony.

**Verdict**
PASS

**Boundary note**
Case 60의 판정은 plan revised에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 61 — Old plan preserved

**Purpose**
Case 61은 old plan preserved 경계를 독립적으로 확인한다.

**Fixture**
EP-61-v2 is current but QA history references v1.

**Manual verification**
Trace the version edge from EP-61-v2, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Keep v1, authors, reviewers and consumed snapshot traceable.

**Observed**
trace the version edge from EP-61-v2, the source and derived record stay distinct, so only the explicitly recorded transition is visible. EP-61-v2 are queryable as the fixture records, not as a replacement object with inferred testimony.

**Verdict**
PASS

**Boundary note**
Case 61의 판정은 old plan preserved에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 62 — Witness changes answer during hearing

**Purpose**
Case 62은 witness changes answer during hearing 경계를 독립적으로 확인한다.

**Fixture**
W first says 3 PM then clarifies 4 PM after follow-up.

**Manual verification**
Compare the planned/attempted/answered fields attached to Witness changes answer during hearing and identify the exact event that would be required for the next descendant.

**Expected**
Create separate ordered answer/testimony events; no retroactive rewrite.

**Observed**
Witness changes answer during hearing retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 62의 판정은 witness changes answer during hearing에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 63 — Contradiction discovered

**Purpose**
Case 63은 contradiction discovered 경계를 독립적으로 확인한다.

**Fixture**
TE-63 conflicts with document E-9.

**Manual verification**
Follow the parent relation of TE-63, E-9, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Add a provenance-bearing inconsistency/analysis relation.

**Observed**
follow the parent relation of TE-63, E-9, the event is retained with its original scope; a later layer receives no fabricated content. TE-63, E-9 keep independent provenance, so the attempted cross-layer promotion has no resulting record.

**Verdict**
PASS

**Boundary note**
Case 63의 판정은 contradiction discovered에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 64 — Contradiction→lie attack

**Purpose**
Case 64은 contradiction→lie attack 경계를 독립적으로 확인한다.

**Fixture**
TE-64 differs from RS-64 and engine sets isLying=true.

**Manual verification**
Attempted transition: TE-64,RS-64 → contradiction→lie.
Permitted state: TE-64, RS-64 retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace TE-64, RS-64 through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Forbidden without legitimate evidence/adjudication of deception.

**Observed**
The graph ends at the recorded TE-64, RS-64 relation for this fixture; a separate action would be needed for the proposed target. 
TE-64, RS-64 remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 64의 판정은 contradiction→lie attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 65 — Testimony updates firm Case File knowledge

**Purpose**
Case 65은 testimony updates firm case file knowledge 경계를 독립적으로 확인한다.

**Fixture**
Firm records TE-65 and CR status after hearing.

**Manual verification**
Reconcile the source references on TE-65, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Case File gains provenance-bearing testimony knowledge, not fact truth.

**Observed**
reconcile the source references on TE-65, the current projection changes only where the fixture supplies an action, preserving earlier provenance. TE-65 keep their recorded type and scope; the fixture does not add the attempted descendant.

**Verdict**
PASS

**Boundary note**
Case 65의 판정은 testimony updates firm case file knowledge에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 66 — Case File update→truth attack

**Purpose**
Case 66은 case file update→truth attack 경계를 독립적으로 확인한다.

**Fixture**
Recording TE-66 turns its content into accepted CaseFileFact.

**Manual verification**
Attempted transition: TE-66 → case file update→truth.
Permitted state: TE-66 retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace TE-66 through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Forbidden: epistemic type remains testimony/assertion.

**Observed**
The state attached to TE-66 is the one declared by the fixture; no automatic successor is added. 
TE-66 remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 66의 판정은 case file update→truth attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 67 — Two conflicting witnesses

**Purpose**
Case 67은 two conflicting witnesses 경계를 독립적으로 확인한다.

**Fixture**
W-A says X; W-B says not-X in separate TEs.

**Manual verification**
Compare the distinct witness/proceeding identifiers in Two conflicting witnesses, then check whether a merge, vote or truth winner was emitted.

**Expected**
Both remain in Case File/CourtRecord if materialized; no auto-resolution.

**Observed**
Two conflicting witnesses remains a set of separate testimony records with independent provenance. The conflict/corroboration relation is available for later analysis, but no count-based adjudication was created.

**Verdict**
PASS

**Boundary note**
Case 67의 판정은 two conflicting witnesses에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 68 — Conflict auto-resolution attack

**Purpose**
Case 68은 conflict auto-resolution attack 경계를 독립적으로 확인한다.

**Fixture**
Higher-seniority W-A wins the contradiction automatically.

**Manual verification**
Attempted transition: the Conflict auto-resolution attack record → conflict auto-resolution.
Permitted state: the Conflict auto-resolution attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Compare the distinct witness/proceeding identifiers in Conflict auto-resolution attack, then check whether a merge, vote or truth winner was emitted.

**Expected**
Forbidden: role/status/count cannot adjudicate truth.

**Observed**
The ledger records Conflict auto-resolution attack as supplied, with no implicit promotion to the target state. 
Conflict auto-resolution attack remains a set of separate testimony records with independent provenance. The conflict/corroboration relation is available for later analysis, but no count-based adjudication was created.

**Verdict**
PASS

**Boundary note**
Case 68의 판정은 conflict auto-resolution attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 69 — Two corroborating witnesses

**Purpose**
Case 69은 two corroborating witnesses 경계를 독립적으로 확인한다.

**Fixture**
W-A and W-B both say X with distinct provenance.

**Manual verification**
Compare the distinct witness/proceeding identifiers in Two corroborating witnesses, then check whether a merge, vote or truth winner was emitted.

**Expected**
May record corroborative relation; independence and truth remain unresolved.

**Observed**
Two corroborating witnesses remains a set of separate testimony records with independent provenance. The conflict/corroboration relation is available for later analysis, but no count-based adjudication was created.

**Verdict**
PASS

**Boundary note**
Case 69의 판정은 two corroborating witnesses에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 70 — Corroboration vote-truth attack

**Purpose**
Case 70은 corroboration vote-truth attack 경계를 독립적으로 확인한다.

**Fixture**
Two matching TEs set Truth=X.

**Manual verification**
Attempted transition: the Corroboration vote-truth attack record → corroboration vote-truth.
Permitted state: the Corroboration vote-truth attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace Corroboration vote-truth attack through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Forbidden: witness count is descriptive, not truth authority.

**Observed**
Only the named source/event fields on Corroboration vote-truth attack change; no unrequested answer or finding field is written. 
Corroboration vote-truth attack remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 70의 판정은 corroboration vote-truth attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 71 — Same witness second proceeding

**Purpose**
Case 71은 same witness second proceeding 경계를 독립적으로 확인한다.

**Fixture**
W-71 testifies at PC-1 and later PC-4.

**Manual verification**
Verify PC-1, PC-4 contains only the fixture-declared proceeding identity, participants, phase, order and procedural hook; check that no unsupported legal reason is added.

**Expected**
Create separate TestimonyEvents linked to each proceeding.

**Observed**
PC-1, PC-4 hosts the event and leaves the procedural hook pending/typed as supplied. No invented objection ruling or witness answer was generated from the minimal context.

**Verdict**
PASS

**Boundary note**
Case 71의 판정은 same witness second proceeding에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 72 — Later testimony overwrite attack

**Purpose**
Case 72은 later testimony overwrite attack 경계를 독립적으로 확인한다.

**Fixture**
TE-72-b changes answer and replaces TE-72-a.

**Manual verification**
Attempted transition: TE-72-b,TE-72-a → later testimony overwrite.
Permitted state: TE-72-b, TE-72-a retain their recorded fixture states; only the explicitly described event can create a descendant.
Order TE-72-b, TE-72-a by the fixture’s time/version markers and inspect both the predecessor payload and the new event’s parent link after the change.

**Expected**
Forbidden: later account adds history, never rewrites earlier testimony.

**Observed**
The permitted projection for TE-72-b, TE-72-a is limited to the fixture’s explicit event and does not synthesize another layer. 
The later event is appended to TE-72-b, TE-72-a with its own timestamp/version relation. The predecessor payload remains queryable, so the current projection changes without rewriting the earlier statement, plan or testimony.

**Verdict**
PASS

**Boundary note**
Case 72의 판정은 later testimony overwrite attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 73 — Team preparation

**Purpose**
Case 73은 team preparation 경계를 독립적으로 확인한다.

**Fixture**
Associate drafts topics, support organizes permitted bundle, senior owns review.

**Manual verification**
Read owner, contributor, reviewer and examiner fields on Team preparation and compare review completion with actual examination events.

**Expected**
Preserve owner/contributor roles and separate WorkProducts.

**Observed**
Team preparation preserves the named role fields and review event separately. A contribution or approval did not create an answer, relabel the examiner or certify the future testimony.

**Verdict**
PASS

**Boundary note**
Case 73의 판정은 team preparation에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 74 — Contributor/reviewer collapse attack

**Purpose**
Case 74은 contributor/reviewer collapse attack 경계를 독립적으로 확인한다.

**Fixture**
Senior contribution is silently counted as completed review.

**Manual verification**
Attempted transition: the Contributor/reviewer collapse attack record → contributor/reviewer collapse.
Permitted state: the Contributor/reviewer collapse attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Read owner, contributor, reviewer and examiner fields on Contributor/reviewer collapse attack and compare review completion with actual examination events.

**Expected**
Forbidden: contribution event ≠ ReviewTask completion.

**Observed**
The graph ends at the recorded Contributor/reviewer collapse attack relation for this fixture; a separate action would be needed for the proposed target. 
Contributor/reviewer collapse attack preserves the named role fields and review event separately. A contribution or approval did not create an answer, relabel the examiner or certify the future testimony.

**Verdict**
PASS

**Boundary note**
Case 74의 판정은 contributor/reviewer collapse attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 75 — Senior plan review

**Purpose**
Case 75은 senior plan review 경계를 독립적으로 확인한다.

**Fixture**
Partner reviews EP-75 for issue coverage and marks comments.

**Manual verification**
Read owner, contributor, reviewer and examiner fields on EP-75 and compare review completion with actual examination events.

**Expected**
Review event may request revision; it does not certify future answers.

**Observed**
EP-75 preserves the named role fields and review event separately. A contribution or approval did not create an answer, relabel the examiner or certify the future testimony.

**Verdict**
PASS

**Boundary note**
Case 75의 판정은 senior plan review에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 76 — Review guarantees favorable testimony attack

**Purpose**
Case 76은 review guarantees favorable testimony attack 경계를 독립적으로 확인한다.

**Fixture**
Approved EP-76 applies favorable-answer modifier.

**Manual verification**
Attempted transition: EP-76 → review guarantees favorable testimony.
Permitted state: EP-76 retain their recorded fixture states; only the explicitly described event can create a descendant.
Read owner, contributor, reviewer and examiner fields on EP-76 and compare review completion with actual examination events.

**Expected**
Forbidden: review is fallible organizational work.

**Observed**
The state attached to EP-76 is the one declared by the fixture; no automatic successor is added. 
EP-76 preserves the named role fields and review event separately. A contribution or approval did not create an answer, relabel the examiner or certify the future testimony.

**Verdict**
PASS

**Boundary note**
Case 76의 판정은 review guarantees favorable testimony attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 77 — Client tells witness strategy

**Purpose**
Case 77은 client tells witness strategy 경계를 독립적으로 확인한다.

**Fixture**
Client suggests emphasizing topic X to firm.

**Manual verification**
Trace Client tells witness strategy through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Treat as client instruction/strategy input, not witness knowledge.

**Observed**
Client tells witness strategy remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 77의 판정은 client tells witness strategy에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 78 — Client instruction→truth attack

**Purpose**
Case 78은 client instruction→truth attack 경계를 독립적으로 확인한다.

**Fixture**
Client says witness should say X; engine sets X in memory.

**Manual verification**
Attempted transition: the Client instruction→truth attack record → client instruction→truth.
Permitted state: the Client instruction→truth attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace Client instruction→truth attack through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Forbidden under DEC-027 and WEX56.

**Observed**
The ledger records Client instruction→truth attack as supplied, with no implicit promotion to the target state. 
Client instruction→truth attack remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 78의 판정은 client instruction→truth attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 79 — Settlement during preparation

**Purpose**
Case 79은 settlement during preparation 경계를 독립적으로 확인한다.

**Fixture**
SA settles while WP-79 is in progress.

**Manual verification**
Order WP-79 by the fixture’s time/version markers and inspect both the predecessor payload and the new event’s parent link after the change.

**Expected**
Tasks may pause/cancel per explicit action; existing prep history remains.

**Observed**
The later event is appended to WP-79 with its own timestamp/version relation. The predecessor payload remains queryable, so the current projection changes without rewriting the earlier statement, plan or testimony.

**Verdict**
PASS

**Boundary note**
Case 79의 판정은 settlement during preparation에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 80 — Settlement erases prep history attack

**Purpose**
Case 80은 settlement erases prep history attack 경계를 독립적으로 확인한다.

**Fixture**
Case settlement deletes WPP-80 and interview refs.

**Manual verification**
Attempted transition: WPP-80 → settlement erases prep history.
Permitted state: WPP-80 retain their recorded fixture states; only the explicitly described event can create a descendant.
Order WPP-80 by the fixture’s time/version markers and inspect both the predecessor payload and the new event’s parent link after the change.

**Expected**
Forbidden: settlement/case status does not erase provenance.

**Observed**
Only the named source/event fields on WPP-80 change; no unrequested answer or finding field is written. 
The later event is appended to WPP-80 with its own timestamp/version relation. The predecessor payload remains queryable, so the current projection changes without rewriting the earlier statement, plan or testimony.

**Verdict**
PASS

**Boundary note**
Case 80의 판정은 settlement erases prep history attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 81 — ProceedingContext

**Purpose**
Case 81은 proceedingcontext 경계를 독립적으로 확인한다.

**Fixture**
PC-81 records Matter, participants, phase, current witness, order and hooks.

**Manual verification**
Verify PC-81 contains only the fixture-declared proceeding identity, participants, phase, order and procedural hook; check that no unsupported legal reason is added.

**Expected**
This minimal interface hosts examination without defining full hearing lifecycle.

**Observed**
PC-81 hosts the event and leaves the procedural hook pending/typed as supplied. No invented objection ruling or witness answer was generated from the minimal context.

**Verdict**
PASS

**Boundary note**
Case 81의 판정은 proceedingcontext에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 82 — Objection hook

**Purpose**
Case 82은 objection hook 경계를 독립적으로 확인한다.

**Fixture**
Opponent creates OE-82; future procedural resolver returns pending.

**Manual verification**
Verify OE-82 contains only the fixture-declared proceeding identity, participants, phase, order and procedural hook; check that no unsupported legal reason is added.

**Expected**
Store hook/event only; do not invent objection type or Korean rule.

**Observed**
OE-82 hosts the event and leaves the procedural hook pending/typed as supplied. No invented objection ruling or witness answer was generated from the minimal context.

**Verdict**
PASS

**Boundary note**
Case 82의 판정은 objection hook에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 83 — Interruption/resume

**Purpose**
Case 83은 interruption/resume 경계를 독립적으로 확인한다.

**Fixture**
PC-83 pauses after QA-3 and resumes with QA-4.

**Manual verification**
Order PC-83, QA-3, QA-4 by the fixture’s time/version markers and inspect both the predecessor payload and the new event’s parent link after the change.

**Expected**
Preserve ordered questions/answers and do not reset witness or plan.

**Observed**
The later event is appended to PC-83, QA-3, QA-4 with its own timestamp/version relation. The predecessor payload remains queryable, so the current projection changes without rewriting the earlier statement, plan or testimony.

**Verdict**
PASS

**Boundary note**
Case 83의 판정은 interruption/resume에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 84 — Oath/formality→truth attack

**Purpose**
Case 84은 oath/formality→truth attack 경계를 독립적으로 확인한다.

**Fixture**
TE-84 is marked under oath and engine sets content=true.

**Manual verification**
Attempted transition: TE-84 → oath/formality→truth.
Permitted state: TE-84 retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace TE-84 through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Forbidden: formality may be metadata but is not objective truth.

**Observed**
The graph ends at the recorded TE-84 relation for this fixture; a separate action would be needed for the proposed target. 
TE-84 remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 84의 판정은 oath/formality→truth attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 85 — Preparation-induced testimony cloning attack

**Purpose**
Case 85은 preparation-induced testimony cloning attack 경계를 독립적으로 확인한다.

**Fixture**
RS1='I saw the blue car'; WPP-85 labels it strategically useful.

**Manual verification**
Attempted transition: RS1,WPP-85 → preparation-induced testimony cloning.
Permitted state: RS1, WPP-85 retain their recorded fixture states; only the explicitly described event can create a descendant.
Reconcile the source references on RS1, WPP-85, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
Forbidden to pre-generate identical hearing testimony; only actual answer event may produce it.

**Observed**
RS1, WPP-85 keep independent provenance, so the attempted cross-layer promotion has no resulting record. 
reconcile the source references on RS1, WPP-85, the current projection changes only where the fixture supplies an action, preserving earlier provenance. RS1, WPP-85 keep their recorded type and scope; the fixture does not add the attempted descendant.

**Verdict**
PASS

**Boundary note**
Case 85의 판정은 preparation-induced testimony cloning attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 86 — Hidden answer oracle attack

**Purpose**
Case 86은 hidden answer oracle attack 경계를 독립적으로 확인한다.

**Fixture**
Witness secretly knows X; player never discovered X; UI suggests X as known.

**Manual verification**
Attempted transition: the Hidden answer oracle attack record → hidden answer oracle.
Permitted state: the Hidden answer oracle attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Compare the hidden state named in the fixture with the authorized records referenced by Hidden answer oracle attack; inspect suggestion, branch and answer stores for an unauthorized read.

**Expected**
Forbidden: hidden PersonKnowledge cannot drive player-visible question choice.

**Observed**
The state attached to Hidden answer oracle attack is the one declared by the fixture; no automatic successor is added. 
Hidden answer oracle attack uses only authorized records and produces no field sourced from the hidden state. The attempted hidden-state transition is blocked, while the visible plan/question path remains usable.

**Verdict**
PASS

**Boundary note**
Case 86의 판정은 hidden answer oracle attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 87 — Examination-plan truth laundering attack

**Purpose**
Case 87은 examination-plan truth laundering attack 경계를 독립적으로 확인한다.

**Fixture**
EP-87 goal is 'establish F'; every planned question is asked.

**Manual verification**
Attempted transition: EP-87 → examination-plan truth laundering.
Permitted state: EP-87 retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace EP-87 through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Completing questions does not establish F; answers/record/adjudication remain separate.

**Observed**
EP-87 keep their recorded type and scope; the fixture does not add the attempted descendant. 
EP-87 remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 87의 판정은 examination-plan truth laundering attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 88 — Courtroom answer / interview rewrite attack

**Purpose**
Case 88은 courtroom answer / interview rewrite attack 경계를 독립적으로 확인한다.

**Fixture**
RS-88=X; W later testifies Y.

**Manual verification**
Attempted transition: RS-88 → courtroom answer / interview rewrite.
Permitted state: RS-88 retain their recorded fixture states; only the explicitly described event can create a descendant.
Compare the planned/attempted/answered fields attached to RS-88 and identify the exact event that would be required for the next descendant.

**Expected**
Keep RS-88 and TE-88 distinct; never edit the interview to Y.

**Observed**
The ledger records RS-88 as supplied, with no implicit promotion to the target state. 
RS-88 retains its own question or answer state and actor/order link. The next descendant is either absent or separately linked to the observed event, preventing a plan or question from becoming an answer by itself.

**Verdict**
PASS

**Boundary note**
Case 88의 판정은 courtroom answer / interview rewrite attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 89 — Testimony count credibility attack

**Purpose**
Case 89은 testimony count credibility attack 경계를 독립적으로 확인한다.

**Fixture**
Three witnesses say X; engine proposes Credibility(X)=3 and Truth=X.

**Manual verification**
Attempted transition: the Testimony count credibility attack record → testimony count credibility.
Permitted state: the Testimony count credibility attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace Testimony count credibility attack through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Forbidden: count cannot create credibility authority or fact truth.

**Observed**
Testimony count credibility attack remain available for later review in their original role; the shortcut target is not a stored child. 
Testimony count credibility attack remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 89의 판정은 testimony count credibility attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 90 — Senior examiner aura attack

**Purpose**
Case 90은 senior examiner aura attack 경계를 독립적으로 확인한다.

**Fixture**
Partner P conducts examination; reputation is high.

**Manual verification**
Attempted transition: the Senior examiner aura attack record → senior examiner aura.
Permitted state: the Senior examiner aura attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Check the event ledger for Senior examiner aura attack, then compare the fixture’s input state with the first permitted descendant and the absence of any truth or finding mutation.

**Expected**
No automatic favorable-answer modifier; only explicit questions/events apply.

**Observed**
Only the named source/event fields on Senior examiner aura attack change; no unrequested answer or finding field is written. 
check the event ledger for Senior examiner aura attack, The ledger records Senior examiner aura attack as supplied, with no implicit promotion to the target state. The permitted projection for Senior examiner aura attack is limited to the fixture’s explicit event and does not synthesize another layer.

**Verdict**
PASS

**Boundary note**
Case 90의 판정은 senior examiner aura attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 91 — Witness preparation / client authorization collapse attack

**Purpose**
Case 91은 witness preparation / client authorization collapse attack 경계를 독립적으로 확인한다.

**Fixture**
Client wants W to emphasize X and authorizes strategy.

**Manual verification**
Attempted transition: the Witness preparation / client authorization collapse attack record → witness preparation / client authorization collapse.
Permitted state: the Witness preparation / client authorization collapse attack record retain their recorded fixture states; only the explicitly described event can create a descendant.
Trace Witness preparation / client authorization collapse attack through the assertion, record and adjudication stores and look for any unruled truth/lie/credibility write.

**Expected**
Authorization may affect firm Tasks, not witness knowledge or testimony.

**Observed**
Witness preparation / client authorization collapse attack retain their actor, content and timing, while the proposed downstream state stays uninstantiated. 
Witness preparation / client authorization collapse attack remains an assertion or procedural record with its source provenance. No ActualStateRecord, isLying, CredibilityScore or CourtFactFinding write follows, so the attempted epistemic promotion is absent.

**Verdict**
PASS

**Boundary note**
Case 91의 판정은 witness preparation / client authorization collapse attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 92 — Testimony history deletion after judgment attack

**Purpose**
Case 92은 testimony history deletion after judgment attack 경계를 독립적으로 확인한다.

**Fixture**
Court later finds F and conflicting TE-92 was not adopted.

**Manual verification**
Attempted transition: TE-92 → testimony history deletion after judgment.
Permitted state: TE-92 retain their recorded fixture states; only the explicitly described event can create a descendant.
Order TE-92 by the fixture’s time/version markers and inspect both the predecessor payload and the new event’s parent link after the change.

**Expected**
Preserve TE-92 and CourtRecord history; FactFinding never rewrites evidence history.

**Observed**
The permitted projection for TE-92 is limited to the fixture’s explicit event and does not synthesize another layer. 
The later event is appended to TE-92 with its own timestamp/version relation. The predecessor payload remains queryable, so the current projection changes without rewriting the earlier statement, plan or testimony.

**Verdict**
PASS

**Boundary note**
Case 92의 판정은 testimony history deletion after judgment attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 93 — Procedural ruling retroactive answer deletion attack

**Purpose**
Case 93은 procedural ruling retroactive answer deletion attack 경계를 독립적으로 확인한다.

**Fixture**
QA-93 asked, WA-93 answered and TE-93 materialized; later supplied procedural result marks QA-93 excluded.

**Manual verification**
Attempted transition: later exclusion → delete WA-93/TE-93. Permitted state: QA-93, WA-93 and TE-93 remain historical; only downstream eligibility may change.
QA-93 remains an asked QuestionAttempt, WA-93 remains its answer, and TE-93 remains the ordered testimony event. The later ruling changes only downstream eligibility for TE-93; it removes none of the three records.

**Expected**
Keep WA-93 and TE-93 as historical events; downstream use may be limited only by the supplied result.

**Observed**
Attempted transition: later exclusion → delete WA-93/TE-93. Permitted state: QA-93, WA-93 and TE-93 remain historical; only downstream eligibility may change.
QA-93 remains an asked QuestionAttempt, WA-93 remains its answer, and TE-93 remains the ordered testimony event. The later ruling changes only downstream eligibility for TE-93; it removes none of the three records.

**Verdict**
PASS

**Boundary note**
Case 93의 판정은 procedural ruling retroactive answer deletion attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 94 — Preparation reviewer becomes witness-knowledge source attack

**Purpose**
Case 94은 preparation reviewer becomes witness-knowledge source attack 경계를 독립적으로 확인한다.

**Fixture**
Senior R reviews WPP-94 and writes “likely answer should be X”; no witness statement says X.

**Manual verification**
Attempted transition: Senior R’s comment on WPP-94 → PersonKnowledge/ExpectedAnswer X. Permitted state: the comment remains review analysis.
WPP-94 stores R’s “likely answer” as review analysis; no X is added to PersonKnowledge and no ExpectedAnswer is instantiated from the comment. Senior review changes review metadata, not witness memory.

**Expected**
R’s comment remains review analysis; it cannot create PersonKnowledge or ExpectedAnswer content.

**Observed**
Attempted transition: Senior R’s comment on WPP-94 → PersonKnowledge/ExpectedAnswer X. Permitted state: the comment remains review analysis.
WPP-94 stores R’s “likely answer” as review analysis; no X is added to PersonKnowledge and no ExpectedAnswer is instantiated from the comment. Senior review changes review metadata, not witness memory.

**Verdict**
PASS

**Boundary note**
Case 94의 판정은 preparation reviewer becomes witness-knowledge source attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 95 — Exhibit admission / testimony truth collapse attack

**Purpose**
Case 95은 exhibit admission / testimony truth collapse attack 경계를 독립적으로 확인한다.

**Fixture**
Fixture admits E95; W identifies it and says “this proves X.”

**Manual verification**
Attempted transition: admitted E95 + “proves X” → X=true. Permitted state: E95 admission and WA/TE identification remain assertions.
E95 is admitted under the fixture, while W’s identification is a separate WA/TE assertion linked to E95. Neither creates a CaseFile truth mutation or CourtFactFinding for X.

**Expected**
Admission and identification are preserved, but X remains an assertion pending adjudication.

**Observed**
Attempted transition: admitted E95 + “proves X” → X=true. Permitted state: E95 admission and WA/TE identification remain assertions.
E95 is admitted under the fixture, while W’s identification is a separate WA/TE assertion linked to E95. Neither creates a CaseFile truth mutation or CourtFactFinding for X.

**Verdict**
PASS

**Boundary note**
Case 95의 판정은 exhibit admission / testimony truth collapse attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 96 — Witness recall resets earlier testimony attack

**Purpose**
Case 96은 witness recall resets earlier testimony attack 경계를 독립적으로 확인한다.

**Fixture**
PC-1 TE96-A records “I do not recall”; PC-2 TE96-B records “I now remember X.”

**Manual verification**
Attempted transition: TE96-B → delete TE96-A. Permitted state: both proceedings retain their own TestimonyEvent.
TE96-A='I do not recall' stays attached to PC-1 and TE96-B='I now remember X' is appended under PC-2. The later recall adds an event and cannot reset the first proceeding.

**Expected**
Both temporal TestimonyEvents remain; TE96-B does not delete TE96-A.

**Observed**
Attempted transition: TE96-B → delete TE96-A. Permitted state: both proceedings retain their own TestimonyEvent.
TE96-A='I do not recall' stays attached to PC-1 and TE96-B='I now remember X' is appended under PC-2. The later recall adds an event and cannot reset the first proceeding.

**Verdict**
PASS

**Boundary note**
Case 96의 판정은 witness recall resets earlier testimony attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 97 — CourtRecord materialization partial-answer collapse attack

**Purpose**
Case 97은 courtrecord materialization partial-answer collapse attack 경계를 독립적으로 확인한다.

**Fixture**
WA97 has answered_part=A and unanswered_part=B; valid rule materializes CR97.

**Manual verification**
Attempted transition: WA97 partial A/B → CR97 complete affirmative A+B. Permitted state: CR97 mirrors answered A and unanswered B.
CR97 carries A as answered and B as unanswered because it materializes WA97’s actual scope. No affirmative testimony for B or expanded finding is generated.

**Expected**
CR97 preserves A and the unresolved B scope; it cannot become a complete affirmative answer.

**Observed**
Attempted transition: WA97 partial A/B → CR97 complete affirmative A+B. Permitted state: CR97 mirrors answered A and unanswered B.
CR97 carries A as answered and B as unanswered because it materializes WA97’s actual scope. No affirmative testimony for B or expanded finding is generated.

**Verdict**
PASS

**Boundary note**
Case 97의 판정은 courtrecord materialization partial-answer collapse attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 98 — Multiple examiners ownership collapse attack

**Purpose**
Case 98은 multiple examiners ownership collapse attack 경계를 독립적으로 확인한다.

**Fixture**
Lawyer A asks Q1/Q2, Lawyer B asks Q3/Q4, Senior C reviews strategy for the same Matter.

**Manual verification**
Attempted transition: Matter owner C → relabel QA1–QA4 examiner=C. Permitted state: each QuestionAttempt keeps its actual examiner.
QA1/QA2 retain Lawyer A and QA3/QA4 retain Lawyer B; C is recorded only in review/strategy metadata. Matter responsibility does not relabel actual QuestionAttempt actors.

**Expected**
Each QuestionAttempt retains its actual examiner; C’s strategy ownership does not relabel QA1–QA4.

**Observed**
Attempted transition: Matter owner C → relabel QA1–QA4 examiner=C. Permitted state: each QuestionAttempt keeps its actual examiner.
QA1/QA2 retain Lawyer A and QA3/QA4 retain Lawyer B; C is recorded only in review/strategy metadata. Matter responsibility does not relabel actual QuestionAttempt actors.

**Verdict**
PASS

**Boundary note**
Case 98의 판정은 multiple examiners ownership collapse attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 99 — Hidden judge-belief feedback to questioning attack

**Purpose**
Case 99은 hidden judge-belief feedback to questioning attack 경계를 독립적으로 확인한다.

**Fixture**
Judge cognition is hidden while PC99 is active; UI proposes questions using that hidden belief.

**Manual verification**
Attempted transition: hidden judge belief → question recommendation. Permitted state: recommendation uses observable PC99 events only.
The UI uses observable PC99 context only; no recommendation edge is sourced from hidden judge cognition. Hidden belief and future finding remain unavailable.

**Expected**
Question suggestions must use observed PC99 events and authorized inputs, not the hidden judge state.

**Observed**
Attempted transition: hidden judge belief → question recommendation. Permitted state: recommendation uses observable PC99 events only.
The UI uses observable PC99 context only; no recommendation edge is sourced from hidden judge cognition. Hidden belief and future finding remain unavailable.

**Verdict**
PASS

**Boundary note**
Case 99의 판정은 hidden judge-belief feedback to questioning attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

### Case 100 — Post-finding plan rewrite attack

**Purpose**
Case 100은 post-finding plan rewrite attack 경계를 독립적으로 확인한다.

**Fixture**
EP100-v1 and QA/TE events precede FF100; after judgment engine edits EP100-v1 goals to match FF100.

**Manual verification**
Attempted transition: FF100 → rewrite EP100-v1 goals. Permitted state: EP100-v1 and its consumed snapshot remain historical.
EP100-v1 retains its pre-finding goal and QA/TE keep the original plan reference; FF100 is later adjudication. The attempted alignment changes neither plan text nor testimony history.

**Expected**
EP100-v1 and its consumed snapshot remain unchanged; FF100 is downstream adjudication, not plan provenance.

**Observed**
Attempted transition: FF100 → rewrite EP100-v1 goals. Permitted state: EP100-v1 and its consumed snapshot remain historical.
EP100-v1 retains its pre-finding goal and QA/TE keep the original plan reference; FF100 is later adjudication. The attempted alignment changes neither plan text nor testimony history.

**Verdict**
PASS

**Boundary note**
Case 100의 판정은 post-finding plan rewrite attack에 한정된다. 이 결과는 witness truth, credibility, hidden answer 또는 CourtFactFinding을 추론하지 않는다.

## 4. Witness lifecycle pressure test

```text
Person P → InterviewEvent I1 → RecordedStatement RS1 → WitnessRole
→ WitnessPreparationTask WP1 → WPP1 → ExaminationPlan EP1
→ ProceedingContext PC1 → QuestionAttempt QA1 → QuestionProceduralResult PR1
→ WitnessAnswer WA1 → TestimonyEvent TE1 → explicit materialization → CourtRecordEntry CR1
→ later CourtFactFinding FF1
```

각 layer는 독립 객체/event다. Interview가 preparation이 되거나, plan이 answer/testimony가 되거나, record가 finding이 되는 shortcut은 허용되지 않는다.

## 5. Preparation anti-scripting and change pressure test

RS1=X, CaseTheory=X, lawyer recommendation=emphasize X인 경우 preparation은 review/topic/rehearsal만 만들 수 있다. PersonKnowledge X, guaranteed WA/TE 또는 X=true를 만들 수 없다. RS1=X → PS1=Y → PS2=uncertain은 모두 보존한다.

## 6. ExaminationPlan and question lifecycle pressure test

EP1의 Q1/Q2/expected A·B 중 Q1만 실제 질문되고 Q2는 skip, Q3은 off-plan으로 질문된 fixture에서는 QA1/QA3만 event가 된다. Asked, allowed, answered를 각각 기록하고 disallowed question도 역사적 attempt로 남긴다.

## 7. Answer, hidden knowledge and surprise pressure test

Expected A/B와 다른 C, prior RS/PS=X인데 WA=Y, hidden PersonKnowledge=Z인 fixture를 적용한다. C/Y는 legitimate event로 보존하고 Z는 UI·branch·recommendation에 사용하지 않는다. Materialized TE는 reload에서도 동일하다.

## 8. Capability, cooperation and credibility pressure test

Exceptional/novice examiner의 차이는 clarity, sequencing, issue coverage, follow-up 같은 명시 component로만 표현한다. cooperative harmful answer, hostile useful answer, calm inconsistent answer 모두 유효하며 PrepSkill/CourtroomSkill/CredibilityScore/isLying는 생성하지 않는다.

## 9. Prior statement, evidence and exhibit pressure test

RS reference, SourceMaterial, filed artifact, admitted exhibit, shown document와 witness response를 단계별로 추적한다. Reference/showing/admission은 agreement나 truth가 아니며, 별도 procedural path 없이는 CourtRecord에 들어가지 않는다.

## 10. Testimony/CourtRecord/JII pressure test

TE가 있어도 materialization rule이 없으면 CR이 없다. Valid fixture rule이 있을 때만 CR을 만들며 CR≠FF이다. Dramatic testimony, contradiction, oath/formality는 JII나 finding을 직접 mutate하지 않는다.

## 11. Contradiction, multiple witnesses and history pressure test

RS/PS/TE/document W가 충돌하고 W1=X/W2=not-X/W3=X인 경우 모두 distinct provenance로 남는다. Later testimony, procedural ruling, settlement 또는 FF는 earlier plan/statement/testimony를 삭제·수정하지 않는다.

## 12. Team, client, settlement and proceeding pressure test

Owner/contributor/reviewer/examiner를 분리하고 client instruction은 strategy input으로만 둔다. Settlement 중 preparation은 explicit pause/cancel 가능하지만 history는 보존한다. ProceedingContext와 ObjectionEvent는 minimal hook이며 full hearing doctrine은 DEC-030에 남긴다.

## 13. Cross-case invariant matrix

| Boundary | Tested in | Result | Note |
|---|---|---|---|
| Person/role/interview/preparation | 1–10, 85, 91 | PASS | Identity and statement types do not auto-promote. |
| Preparation/script/memory | 5–10, 56, 85, 91, 94 | PASS | Topics and review cannot author witness knowledge or answer. |
| Plan/question lifecycle | 11–24, 87, 98 | PASS | Planned, asked, allowed and answered are separate. |
| Answer/truth/expected/surprise | 25–36, 84, 86–87 | PASS | Actual answer is an event, not a truth or preview. |
| Capability/cooperation/relationship/credibility | 37–44, 89–90 | PASS | No score, aura, lie or favorability oracle. |
| Prior statement/evidence/exhibit | 45–49, 95 | PASS | Reference, showing and admission remain distinct. |
| Testimony/record/finding/JII | 50–54, 93, 95, 97, 99 | PASS | Explicit materialization and downstream adjudication gates. |
| CaseTheory/contradiction/multiple witnesses | 55–70, 87–89 | PASS | Theory guides questions; conflicts and corroboration are unresolved. |
| Versions/team/client/settlement | 59–80, 88, 90–92, 100 | PASS | History, roles and client/settlement boundaries preserved. |
| Proceeding/objection/interruption/reload | 81–84, 93, 96–99 | PASS | Minimal hooks, historical events and stable materialization. |

All WEX1–WEX67 and Cases 93–100 are represented by at least one matrix row.

## 14. Contradiction audit

| Audit | Finding | Evidence |
|---|---|---|
| DEC-029 internal contradiction | None observed | Preparation, plan, question, answer, testimony, record and finding are independently typed. |
| Inherited DEC-022 | No violation | Interview/statement provenance is reused without turning it into preparation or truth. |
| Inherited DEC-026 | No violation | Preparation, review and appearance consume finite Task capacity. |
| Inherited DEC-025 | No violation | CourtRecord materialization remains an explicit procedural gate. |
| Inherited DEC-024 | No violation | CaseTheory guides issue targeting but never writes witness memory. |
| Hidden witness/ActualState access | Forbidden | No fixture outcome uses hidden PersonKnowledge or ActualStateRecord. |
| Answer/truth and testimony/finding | No collapse | Answers and records remain assertions pending adjudication. |
| History overwrite/deletion | Forbidden | Changed statements, plans, rulings, judgment and settlement preserve earlier events. |
| Fabricated doctrine | None | Objection, oath, competency, hearsay, privilege and admission effects remain TBD. |

## 15. False-PASS / False-PARTIAL audit

PASS verdicts는 fixture-declared 상태와 DEC-029 semantic boundary만 사용한다. Korean competency/subpoena/oath/perjury/leading/hearsay/objection/privilege/admission doctrine, psychology probabilities, credibility/truthfulness formulas 또는 future judge reaction을 발명하지 않았다. TBD implementation·UI·AI를 이유로 PARTIAL을 부여하지 않았다.

## 16. Remaining TBD / NOT TESTED

- witness designation/availability, subpoena and compulsory process
- preparation ethics, memory and psychology
- direct/cross, leading, hearsay, objections, privilege
- oath/perjury and exhibit admission
- testimony generation AI and credibility/adjudication inputs
- full proceeding lifecycle and courtroom UI/minigame
- save/schema/API/Godot
- balancing/performance

## 17. Final verification summary

```text
Total core cases: 100
PASS: 100
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none
FAIL cases: none

`PASS + PARTIAL + FAIL = 100` (100 + 0 + 0 = 100).

Quality checks:

```text
Empty attempted transitions: 0
Forbidden placeholder strings: 0
Expected/Observed semantic contradictions: 0
Generic repeated verification sentences (5+ unrelated cases): 0
Attack-label pseudo-objects: 0
```

## 18. Promotion recommendation

DEC-029 reopen required? **No.** Internal contradiction? **None observed.** Inherited boundary violation? **None.** Interview/preparation, preparation/scripting, theory/memory, plan/event, question lifecycle, answer/truth, testimony/record/finding, hidden knowledge, score oracle, history loss, team-role collapse, client instruction, settlement deletion, procedural-ruling deletion, hidden judge feedback, reload reroll 및 fabricated Korean procedure? **None observed.**

권고: `DEC-029 v0.1 → v0.2 Accepted`; `TEST-028 v0.1 → v0.2 Accepted / manual fixture-level verification`.

Issue blocking DEC-029 promotion? **None.** Issue blocking DEC-030? **None.** 다음 후보: `DEC-030 — Hearing / Oral Advocacy / Trial Presentation`.

## 19. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | 100 case-specific manual applications; PASS 100 / PARTIAL 0 / FAIL 0 |
















