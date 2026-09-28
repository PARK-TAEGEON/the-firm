# THE FIRM — TEST-029 Hearing, Oral Advocacy, and Trial Presentation

Test ID: TEST-LITIGATION-029  
Version: v0.1 — Proposed / manual fixture-level verification  
Status: **Proposed / manual fixture-level verification**  
Project: THE FIRM  
Test type: Manual semantic verification

Primary source of truth: `DEC-LITIGATION-030_HEARING_ORAL_ADVOCACY_AND_TRIAL_PRESENTATION.md` v0.1 Proposed / design review required.  
Inherited sources: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `02_ARCHITECTURE_RULES.md`, `SYS-001_LITIGATION.md`, and the accepted litigation DEC/TEST chain through DEC-029 / TEST-028.

This test verifies DEC-030's semantic architecture at fixture level. It is not an implementation, UI, Korean courtroom-law, admissibility-law, AI-behavior, or balancing test.

## 1. Purpose and verdict rules

TEST-029 verifies whether DEC-030 can orchestrate hearing lifecycle, participant actions, oral advocacy, judicial questions, evidence presentation, supplied procedural rulings, DEC-029 examination, interruption/resumption, CourtRecord materialization, workload, visibility, and player/NPC symmetry without collapsing inherited boundaries.

The primary boundary is:

```text
ActualStateRecord
≠ CaseFileState
≠ LawyerWorkProduct
≠ ProceedingEvent
≠ CourtRecordEntry
≠ CourtFactFinding
≠ JudgeInterpretationInput
```

Additional boundaries under test are:

```text
Argument
≠ Evidence
≠ Testimony
≠ CourtRecordEntry
≠ CourtFactFinding

ProceedingEvent
≠ RecordMaterializationEvent
≠ CourtRecordEntry

ObjectionEvent
≠ ProceduralRuling
≠ CourtFactFinding

PlannedQuestion
≠ QuestionAttempt
≠ QuestionProceduralResult
≠ WitnessAnswer
≠ TestimonyEvent
≠ CourtRecordEntry
≠ CourtFactFinding
```

Only these verdicts are used:

- **PASS** — the fixture produces a clear result without contradiction or inherited DEC violation.
- **PARTIAL** — DEC-030 itself leaves a material semantic ambiguity or conflict that prevents deterministic verification.
- **FAIL** — DEC-030 permits or implies an invalid shortcut such as hidden oracle access, truth laundering, history rewrite, actor/role collapse, automatic admission/finding, JII mutation, hidden score, NPC bypass, or CourtRecord-gate bypass.

Doctrine, UI, implementation, Korean procedure, testimony AI, and exact storage/schema gaps are not PARTIAL by themselves. Where doctrine would be required, the fixture supplies a procedural rule or leaves that doctrine outside the tested transition.

## 2. Test fixture conventions

Fixture identifiers are concrete and case-local. They are not semantic objects created by the architecture.

Common objects used below include:

```text
M-029-01       Matter
ST-029-01      Court stage
PC-029-01      ProceedingContext
H-029-01       Hearing occurrence
PH-029-01      ProceedingPhaseContext
PE-029-01      ProceedingEvent envelope
OA-029-01      OralAdvocacyEvent
EP-029-01      EvidencePresentationEvent
OE-029-01      ObjectionEvent
PR-029-01      ProceduralRuling or supplied procedural result
RM-029-01      RecordMaterializationEvent
CR-029-01      CourtRecordEntry
```

Fixture-supplied procedural rules are named explicitly, for example `Rule-FIX-Partial-Scope-01`. They do not assert general legal doctrine.

## 3. Detailed critical fixtures

### Case C01 — Need-based hearing opens inside an active Matter

**Purpose**

Verify that a hearing is an identified procedural occurrence inside an active Matter rather than a fixed Case round.

**Fixture**

`M-C01` is active at `ST-C01`. An observable procedural need is supplied as `Need-C01`. No hearing exists before the transition. The fixture authorizes opening `H-C01` with `PC-C01`.

**Manual verification**

Inspect Matter, stage, hearing, ProceedingContext, and first lifecycle event. Confirm that `Need-C01` is the supplied cause and that no fixed hearing-count rule was introduced.

**Expected**

`H-C01` and `PC-C01` exist inside `M-C01/ST-C01`. `HearingOpened-C01` is ordered and linked to `Need-C01`. Matter remains active; no CaseClosed, JudgmentReady, JudgmentIssued, CourtFactFinding, or JII is created.

**Observed**

The fixture creates one stable hearing occurrence `H-C01` hosted by `PC-C01`, with `HearingOpened-C01` causally linked to `Need-C01`. The Matter remains active and no downstream closure, readiness, judgment, finding, or JII object appears.

**Verdict**

PASS

**Boundary note**

This verifies hearing activation semantics, not any jurisdiction-specific reason that would create a hearing.

### Case C02 — Written procedure without a hearing

**Purpose**

Verify that a Matter may progress through written procedure without opening a hearing.

**Fixture**

`M-C02` has `Submission-C02`, `Receipt-C02`, and `Review-C02` supplied as written procedural events. No hearing activation rule is supplied.

**Manual verification**

Inspect the Matter event history for hearing identity, ProceedingContext, and hearing lifecycle events. Inspect whether written events remain independently typed.

**Expected**

Written events remain recorded and ordered. No `H-C02`, `PC-C02`, or implicit courtroom event is created. The Matter may advance according to supplied written procedure.

**Observed**

`Submission-C02`, `Receipt-C02`, and `Review-C02` remain separate written events under `M-C02`; no hearing or ProceedingContext is materialized. The written path advances without a courtroom occurrence.

**Verdict**

PASS

**Boundary note**

This does not determine what a jurisdiction permits a written procedure to accomplish.

### Case C03 — Multiple hearings in one Matter and stage

**Purpose**

Verify that multiple hearings remain distinct occurrences in one Matter/stage.

**Fixture**

`M-C03/ST-C03` contains hearing `H-C03-A` with `PC-C03-A`, followed by written `Receipt-C03`, then hearing `H-C03-B` with `PC-C03-B`. Each hearing has a distinct supplied opening reason.

**Manual verification**

Compare hearing IDs, ProceedingContext IDs, event order, participants, and any testimony or advocacy references across both hearings.

**Expected**

Both hearings exist with separate histories and stable order. The second hearing does not overwrite, reset, or merge the first hearing.

**Observed**

`H-C03-A` and `H-C03-B` retain different identities and ProceedingContexts, with `Receipt-C03` between them. Their event streams remain separately addressable; no first-hearing events are moved into or deleted by the second hearing.

**Verdict**

PASS

**Boundary note**

The fixture does not test any doctrine governing whether a later hearing should be scheduled.

### Case C04 — Optional phase omitted

**Purpose**

Verify that an omitted phase does not violate DEC-030's extensible phase model.

**Fixture**

`H-C04` supplies `PH-C04-Witness` and `PH-C04-Closing`, but no opening phase. A supplied phase rule explicitly permits the opening context to be omitted.

**Manual verification**

Inspect phase contexts, phase-transition events, and the first courtroom event. Confirm that omission is represented by absence or an explicit supplied omission state, not by fabricated speech.

**Expected**

The hearing proceeds through the supplied phases. No `OralAdvocacyEvent` is fabricated for the missing opening phase and no fixed universal sequence is inferred.

**Observed**

`PH-C04-Witness` starts the event sequence under supplied rule `Rule-FIX-Optional-Opening-04`; `PH-C04-Closing` follows. No opening argument or placeholder advocacy event exists, and no phase-order error is produced.

**Verdict**

PASS

**Boundary note**

The fixture verifies extensibility, not a legal rule about when an opening is available.

### Case C05 — Supplied phase ordering differs between proceedings

**Purpose**

Verify that phase order is supplied per proceeding and is not a universal doctrine.

**Fixture**

`H-C05-A` receives supplied order `opening → evidence`; `H-C05-B` receives supplied order `evidence → opening`. Both use the same Matter type but separate proceeding contexts and explicit fixture rules.

**Manual verification**

Compare phase-transition events and action eligibility under each ProceedingContext. Inspect for any global reorder or rejected second proceeding.

**Expected**

Each hearing preserves its supplied order. The different order does not mutate the other hearing or create an architecture contradiction.

**Observed**

`H-C05-A` orders `PH-C05-Opening-A` before `PH-C05-Evidence-A`; `H-C05-B` orders `PH-C05-Evidence-B` before `PH-C05-Opening-B`, exactly as supplied. No cross-hearing phase mutation occurs.

**Verdict**

PASS

**Boundary note**

No general legal availability or ordering rule is established.

### Case C06 — Interruption and resumption preserve event order

**Purpose**

Verify continuity when a proceeding is interrupted and later resumed.

**Fixture**

`PC-C06` contains `OA-C06-1`, `EP-C06-1`, and `Interruption-C06`. The supplied continuation reopens the same proceeding with `Resumption-C06`, then creates `OA-C06-2`.

**Manual verification**

Order `OA-C06-1`, `EP-C06-1`, interruption, resumption, and `OA-C06-2`. Compare event identities and consumed WorkProduct versions before and after resumption.

**Expected**

Earlier events remain queryable and ordered before the interruption. Resumption continues the existing ProceedingContext or an explicitly linked continuation without reroll, reset, deletion, or hidden duplicate action.

**Observed**

`OA-C06-1` and `EP-C06-1` retain their original payloads and sequence positions; `Interruption-C06` precedes `Resumption-C06`, and `OA-C06-2` follows them. No old argument, source selection, or event is rerolled or removed.

**Verdict**

PASS

**Boundary note**

The fixture does not choose a universal implementation for interruption storage.

### Case C07 — Hearing completion does not create CaseClosed

**Purpose**

Verify that completing a hearing does not close the Matter or Case.

**Fixture**

`H-C07` contains its final supplied phase and `HearingCompleted-C07`. `M-C07` has an outstanding written follow-up task `Task-C07`.

**Manual verification**

Inspect terminal hearing event, Matter status, outstanding task, and Case closure fields.

**Expected**

`HearingCompleted-C07` exists. `M-C07` remains active with `Task-C07`; no `CaseClosed-C07` is generated.

**Observed**

The terminal event is `HearingCompleted-C07`. `Task-C07` remains open and `M-C07` remains active; the fixture contains no `CaseClosed-C07` or equivalent implicit closure.

**Verdict**

PASS

**Boundary note**

Case closure rules remain outside DEC-030.

### Case C08 — Hearing completion does not create readiness or judgment

**Purpose**

Verify that hearing completion is independent from judgment readiness and judgment.

**Fixture**

`H-C08` completes after an evidence presentation. No supplied readiness or judgment event exists. A required post-hearing submission remains pending.

**Manual verification**

Inspect `HearingCompleted-C08`, pending submission, readiness state, judgment state, JII, and CourtFactFinding.

**Expected**

Only hearing completion is materialized. `JudgmentReady`, `JudgmentIssued`, JII, and CourtFactFinding remain absent.

**Observed**

`HearingCompleted-C08` is present while `Submission-C08-Post` remains pending. No `JudgmentReady-C08`, `JudgmentIssued-C08`, JII, or CourtFactFinding is produced by the completion event.

**Verdict**

PASS

**Boundary note**

The fixture does not test what later supplied rules require for judgment readiness.

### Case C09 — One specialized occurrence and one ProceedingEvent envelope

**Purpose**

Verify that a common envelope does not double-count one courtroom occurrence.

**Fixture**

One actual answer occurs in `PC-C09`. It creates specialized `TestimonyEvent TE-C09-1` and envelope `ProceedingEvent PE-C09-1`, whose payload reference points to `TE-C09-1`.

**Manual verification**

Count semantic occurrences, inspect envelope/payload references, and inspect testimony/event counts. Search for any second independent answer or testimony object.

**Expected**

`PE-C09-1` is an ordering/provenance envelope for `TE-C09-1`. The pair represents one courtroom occurrence and does not create a second testimony or answer.

**Observed**

The event stream has one occurrence at the sequence position of `PE-C09-1`; `TE-C09-1` supplies the testimony semantics and is referenced by the envelope. No second `WitnessAnswer`, `TestimonyEvent`, or independent occurrence is present.

**Verdict**

PASS

**Boundary note**

The fixture does not fix the storage representation of envelope/payload references.

### Case C10 — Specialized examination events survive under the envelope

**Purpose**

Verify that QuestionAttempt and TestimonyEvent remain specialized when ordered through ProceedingEvent.

**Fixture**

`EP-C10` contains planned `PQ-C10-1`; the courtroom creates `QA-C10-1`, supplied `QPR-C10-1=allowed`, `WA-C10-1=partial`, and `TE-C10-1`. `PE-C10-Q` and `PE-C10-T` reference the relevant specialized objects.

**Manual verification**

Inspect planned/asked/allowed/answered fields, answer type/content, testimony provenance, and envelope references.

**Expected**

The specialized lifecycle remains intact under the common ordering layer. Partial answer remains partial; no plan-to-answer or answer-to-truth collapse occurs.

**Observed**

`QA-C10-1` records the actual examiner and order, `QPR-C10-1` records supplied allowance, `WA-C10-1` records partial scope, and `TE-C10-1` points to those objects. The envelopes add ordering only; no full answer or finding is generated.

**Verdict**

PASS

**Boundary note**

The fixture does not establish the legal effect of the supplied procedural result.

### Case C11 — Stable event identity and order survive reload

**Purpose**

Verify that materialized proceeding events and supplied results do not reroll on reload.

**Fixture**

`H-C11` contains `QA-C11`, `WA-C11`, `PR-C11=limited`, and `RM-C11`. A reload is applied after materialization.

**Manual verification**

Compare event IDs, order keys, payloads, procedural result, materialization scope, and CourtRecord identity before and after reload.

**Expected**

All materialized identities, content, order, supplied result, and record scope are reused exactly at semantic level.

**Observed**

After reload, `QA-C11`, `WA-C11`, `PR-C11`, `RM-C11`, and resulting `CR-C11` retain their original IDs, sequence relationships, limited status, and permitted scope. No alternate answer, ruling, order, or record entry is generated.

**Verdict**

PASS

**Boundary note**

Byte-identical serialization is not tested; semantic identity and replay stability are tested.

### Case C12 — Matter owner differs from actual courtroom speaker

**Purpose**

Verify that Matter ownership does not relabel an actual speaker.

**Fixture**

`M-C12` owner is lawyer `L-C12-Owner`. Lawyer `L-C12-Speaker` performs `OA-C12`. The owner reviews the preparation but does not speak.

**Manual verification**

Compare Matter owner, WorkProduct reviewer, OralAdvocacyEvent actor, and proceeding role.

**Expected**

`OA-C12.actor` remains `L-C12-Speaker`; owner/reviewer fields remain separate.

**Observed**

`OA-C12` names `L-C12-Speaker` as actual actor and `ProceedingRole=advocate`. `L-C12-Owner` appears only in Matter ownership/review metadata; no relabeling occurs.

**Verdict**

PASS

**Boundary note**

This does not test firm-title or employment-title rules.

### Case C13 — Reviewer differs from examiner

**Purpose**

Verify that review of an ExaminationPlan does not transfer examination authorship.

**Fixture**

`EP-C13` is authored by `L-C13-Examiner` and reviewed by `L-C13-Reviewer`. `QA-C13` is asked by the examiner.

**Manual verification**

Inspect ExaminationPlan author/reviewer lineage, QuestionAttempt examiner, and ProceedingEvent actor.

**Expected**

Reviewer remains review metadata; examiner remains actual question actor.

**Observed**

`EP-C13.reviewer=L-C13-Reviewer`, while `QA-C13.examiner=L-C13-Examiner` and its envelope actor are unchanged. Review creates no second question and no examiner relabeling.

**Verdict**

PASS

**Boundary note**

The fixture does not measure review quality or any favorable-answer effect.

### Case C14 — Eligible participant takes no action

**Purpose**

Verify that presence or eligibility does not fabricate a courtroom action.

**Fixture**

`P-C14` is listed and eligible in `PC-C14` for a response opportunity. The participant takes no action and no response event is supplied.

**Manual verification**

Inspect participant relation, opportunity, action stream, and response objects.

**Expected**

Eligibility remains a relation/opportunity only. No ParticipantAction, OralAdvocacyEvent, WitnessAnswer, or response is created.

**Observed**

`P-C14` is present with `ParticipationOpportunity-C14`, but the event stream contains no action by `P-C14` and no generated response. The opportunity does not become speech or testimony.

**Verdict**

PASS

**Boundary note**

The fixture does not determine whether a future supplied rule treats nonparticipation as a procedural default.

### Case C15 — Actual action preserves actor and proceeding role

**Purpose**

Verify that an actual participant action retains identity and context.

**Fixture**

`L-C15` is a player lawyer assigned proceeding role `Examiner`. `W-C15` is current witness. `QA-C15` is actually asked by `L-C15` during `PH-C15-Cross`.

**Manual verification**

Inspect actor, examiner, witness, proceeding role, phase, order, and source plan references.

**Expected**

`QA-C15` preserves `L-C15` as examiner, `W-C15` as witness, `PH-C15-Cross` as context, and its actual order.

**Observed**

`QA-C15` records `examiner=L-C15`, `witness=W-C15`, `proceeding_role=Examiner`, and `phase=PH-C15-Cross`. The Matter owner and plan reviewer do not replace either actor.

**Verdict**

PASS

**Boundary note**

The cross label is contextual and does not establish a legal cross-examination doctrine.

### Case C16 — Preparation becomes advocacy only through an actual courtroom action

**Purpose**

Verify that AdvocacyPreparationWorkProduct does not itself become courtroom speech.

**Fixture**

`AWP-C16` contains a prepared proposition, source links, and intended sequence. Before the hearing no OralAdvocacyEvent exists. During `H-C16`, lawyer `L-C16` performs `Action-C16-Argument`.

**Manual verification**

Inspect WorkProduct before action, action event, OralAdvocacyEvent, actor, source links, and order.

**Expected**

Before action, only `AWP-C16` exists. The actual action may create `OA-C16` with provenance to `AWP-C16`; preparation alone does not create speech.

**Observed**

Before `Action-C16-Argument`, `AWP-C16` has no courtroom event child. The action creates one `OA-C16` by `L-C16`, linked to the WorkProduct version and hearing order. No pre-hearing argument exists.

**Verdict**

PASS

**Boundary note**

This does not define the UI action used to initiate the presentation.

### Case C17 — Oral advocacy does not create truth, JII, or finding

**Purpose**

Verify that an oral argument asserting X remains an argument.

**Fixture**

`L-C17` presents `OA-C17` asserting proposition `X-C17`, citing authorized `CR-C17-Source`. No adjudicative event is supplied.

**Manual verification**

Trace `OA-C17` into CaseFile, JII, CourtFactFinding, and truth state. Inspect source and actor provenance.

**Expected**

`OA-C17` remains an advocacy assertion linked to its source. No X truth state, JII mutation, CourtFactFinding, or victory state is created.

**Observed**

`OA-C17` records `actor=L-C17`, proposition `X-C17`, and source `CR-C17-Source`. The CaseFile source is unchanged, JII has no new value, and no `CourtFactFinding(X-C17)` or outcome modifier is emitted.

**Verdict**

PASS

**Boundary note**

The fixture does not test whether later adjudication may consider the authorized record source.

### Case C18 — Better preparation improves observable components only

**Purpose**

Verify capability effects without a universal courtroom score or outcome bonus.

**Fixture**

`L-C18-A` and `L-C18-B` receive the same authorized sources. `AWP-C18-A` has a clearer issue sequence and source linkage because of an accepted capability component. Both perform arguments under equivalent supplied conditions.

**Manual verification**

Compare WorkProduct components, OralAdvocacyEvents, hidden score fields, ruling, witness answer, JII, and findings.

**Expected**

The clearer sequence/linkage may appear in `AWP-C18-A` and `OA-C18-A`. No CourtroomSkill, Persuasion, admission bonus, judge-favor value, witness-answer forcing, JII mutation, or finding is created.

**Observed**

`AWP-C18-A` contains the clearer sequence and source links; `OA-C18-A` references those components. Neither side receives a universal skill/score field, and no difference in witness answer, procedural ruling, JII, finding, or victory state is inferred from the component improvement.

**Verdict**

PASS

**Boundary note**

This verifies semantic effect boundaries, not balance or comparative lawyer quality.

### Case C19 — Response and rebuttal are separate events

**Purpose**

Verify that later oral advocacy does not rewrite earlier advocacy.

**Fixture**

`OA-C19-Opening` asserts proposition X. Later `OA-C19-Response` addresses it and `OA-C19-Rebuttal` responds to the response. Each action has its own actor and supplied phase.

**Manual verification**

Compare three event IDs, payloads, actors, phase contexts, order, and source/version links.

**Expected**

Three ordered OralAdvocacyEvents coexist. Later response/rebuttal may reference earlier events but cannot mutate their historical content.

**Observed**

The stream contains `OA-C19-Opening`, `OA-C19-Response`, and `OA-C19-Rebuttal` in that order with distinct actors and payloads. The opening assertion remains unchanged after response and rebuttal.

**Verdict**

PASS

**Boundary note**

The fixture does not decide the legal availability of rebuttal.

### Case C20 — Judicial question and separate participant response

**Purpose**

Verify that a judicial question and response are explicit separate events without hidden judge cognition.

**Fixture**

`J-C20` asks `JQ-C20` to `L-C20` about source linkage. `L-C20` creates `Resp-C20`. No judge belief or future ruling is supplied.

**Manual verification**

Inspect question actor, addressed participant, response actor, order, source references, JII, and hidden judge state.

**Expected**

`JudicialQuestionEvent JQ-C20` and `Response-C20` exist separately. No judge-belief, JII, finding, or future-ruling object is inferred.

**Observed**

`JQ-C20` records `actor=J-C20`, `addressed=L-C20`; `Resp-C20` records `actor=L-C20` and follows it in order. No hidden belief, JII mutation, CourtFactFinding, or future ruling appears.

**Verdict**

PASS

**Boundary note**

This does not test any doctrine governing the authority or effect of judicial questions.

### Case C21 — Selection is not presentation

**Purpose**

Verify that choosing source material for possible courtroom use does not create a presentation event.

**Fixture**

`SM-C21` is authorized SourceMaterial. `PS-C21` selects it in an advocacy WorkProduct. No courtroom action occurs.

**Manual verification**

Inspect selection, proceeding events, EvidencePresentationEvent, procedural result, and CourtRecord.

**Expected**

`PS-C21` exists as selection metadata only. No presentation, admission, materialization, CourtRecordEntry, or finding is created.

**Observed**

`PS-C21` points to `SM-C21`, but the proceeding event stream has no `EvidencePresentationEvent`, `MarkedItem`, `PR-C21`, `RM-C21`, or CourtRecordEntry. The source remains authorized CaseFile material only.

**Verdict**

PASS

**Boundary note**

The fixture does not decide whether a later supplied rule permits presentation.

### Case C22 — Presented material is not automatically admitted

**Purpose**

Verify that actual presentation remains distinct from admission and record materialization.

**Fixture**

`SM-C22` is presented by `L-C22` as `EP-C22` during `H-C22`. No admission or materialization rule is supplied.

**Manual verification**

Inspect source identity, presenter, order, procedural status, admission state, `RM-C22`, and CourtRecord.

**Expected**

`EP-C22` exists with provenance. No admitted status, CourtRecordEntry, truth state, JII, or finding is created.

**Observed**

`EP-C22` records `source=SM-C22`, `presenter=L-C22`, and the hearing order. Admission state, `RM-C22`, CourtRecordEntry, truth, JII, and CourtFactFinding remain absent.

**Verdict**

PASS

**Boundary note**

Admission doctrine is not tested because no supplied admission rule exists.

### Case C23 — Fixture-supplied partial materialization

**Purpose**

Verify exact scope preservation when a supplied rule permits only part of presented material.

**Fixture**

`EP-C23` presents artifact `FA-C23` containing pages 1–10. `Rule-FIX-Partial-Scope-23` permits only pages 2–3 and supplies `RM-C23`.

**Manual verification**

Inspect presentation source/version, rule, materialization scope, CourtRecord identity, and excluded pages.

**Expected**

`CR-C23` contains only pages 2–3, links to `EP-C23`, `FA-C23`, `RM-C23`, and the supplied rule. Pages 1 and 4–10 are not silently included.

**Observed**

`RM-C23` creates `CR-C23` with scope `FA-C23[p2–p3]`, rule reference `Rule-FIX-Partial-Scope-23`, and source/event provenance to `EP-C23`. No entry for pages 1 or 4–10 is created.

**Verdict**

PASS

**Boundary note**

The fixture tests scope mechanics only; it does not establish what real evidence rules would permit.

### Case C24 — Admitted/materialized content is not truth or finding

**Purpose**

Verify that a supplied admitted/materialized object remains a CourtRecordEntry rather than automatic truth or adjudication.

**Fixture**

`RM-C24` validly materializes `FA-C24` under `Rule-FIX-Admit-24` into `CR-C24`. The material contains a statement asserting X. No later adjudication is supplied.

**Manual verification**

Trace `CR-C24` into truth state, credibility state, JII, CourtFactFinding, and CaseFile.

**Expected**

`CR-C24` exists with admission/materialization provenance. No automatic X truth, credibility, JII, or CourtFactFinding exists.

**Observed**

`CR-C24` records the permitted material and `Rule-FIX-Admit-24`; the statement remains record content. No `Truth(X)`, `Credibility(X)`, JII, or `CourtFactFinding(X)` is generated.

**Verdict**

PASS

**Boundary note**

Later adjudication may consume the allowed record under inherited rules; this fixture does not execute it.

## 4. Focused boundary and attack fixtures

The following cases are intentionally shorter. Each uses concrete source and target objects and isolates one architecture attack.

### Case A01 — Opening argument becomes CourtFact

**Purpose**

Reject truth laundering from argument.

**Fixture**

`OA-A01` by `L-A01` asserts proposition `X-A01`.

**Manual verification**

Trace `OA-A01` to `CourtFactFinding(X-A01)` and truth state.

Attempted transition: `OA-A01 → CourtFactFinding(X-A01)`.

Permitted state: `OA-A01` remains an ordered advocacy assertion with its actor and source references; no truth or finding is created.

**Expected**

Argument remains distinct from fact-finding.

**Observed**

`OA-A01` exists with `actor=L-A01` and proposition `X-A01`; no `CourtFactFinding(X-A01)` or truth write follows.

**Verdict**

PASS

**Boundary note**

No later adjudication is tested.

### Case A02 — Partner reputation creates favorable ruling

**Purpose**

Reject reputation/aura mutation of procedural outcomes.

**Fixture**

`L-A02` has high career reputation and presents `OA-A02`. No supplied procedural ruling exists.

Attempted transition: `CareerReputation(L-A02) → ProceduralRuling(PR-A02=favorable)`.

Permitted state: `OA-A02` remains a presentation event; no `PR-A02` exists.

**Expected**

Reputation may remain career context but cannot create a ruling.

**Observed**

`OA-A02` retains `actor=L-A02`; no `PR-A02` or favorable procedural status is created because no supplied ruling event exists.

**Verdict**

PASS

**Boundary note**

Career effects remain governed by inherited Career semantics, not this fixture.

### Case A03 — Three persuasive moments create a win modifier

**Purpose**

Reject count-based persuasion or victory state.

**Fixture**

`OA-A03-1`, `OA-A03-2`, and `OA-A03-3` are three separate arguments by `L-A03`.

Attempted transition: `OA-A03-1 + OA-A03-2 + OA-A03-3 → WinModifier(+3)`.

Permitted state: three ordered advocacy events with independent provenance and no universal count score.

**Expected**

No win modifier, persuasion meter, JII mutation, or finding is created from event count.

**Observed**

All three events remain separately ordered; no `WinModifier`, `PersuasionScore`, JII update, or CourtFactFinding is emitted.

**Verdict**

PASS

**Boundary note**

The fixture does not evaluate the substantive quality of any argument.

### Case A04 — Presented document becomes admitted automatically

**Purpose**

Reject presentation-to-admission collapse.

**Fixture**

`EP-A04` presents `FA-A04` in `H-A04`. No admission rule or `PR-A04` exists.

Attempted transition: `EP-A04 → AdmittedMaterial(FA-A04)`.

Permitted state: `EP-A04` records presenter, source, proceeding, order, and supplied status absent.

**Expected**

Presentation exists without admission or record materialization.

**Observed**

`EP-A04` is present and linked to `FA-A04`; no `AdmittedMaterial(FA-A04)`, `RM-A04`, or CourtRecordEntry is created.

**Verdict**

PASS

**Boundary note**

No admission doctrine is inferred.

### Case A05 — Admitted exhibit becomes objective truth

**Purpose**

Reject admission-to-truth collapse.

**Fixture**

Fixture rule `Rule-FIX-Admit-A05` creates `AdmittedMaterial AM-A05` from `FA-A05` and `CR-A05` through explicit materialization. `FA-A05` asserts `X-A05`.

Attempted transition: `AM-A05 → Truth(X-A05)`.

Permitted state: `AM-A05` and `CR-A05` retain content and provenance; no truth or finding exists.

**Expected**

Admission/record status does not establish objective truth.

**Observed**

`AM-A05` and `CR-A05` exist under `Rule-FIX-Admit-A05`; no `Truth(X-A05)`, JII, or `CourtFactFinding(X-A05)` is generated.

**Verdict**

PASS

**Boundary note**

The fixture does not run later recognition or adjudication.

### Case A06 — Demonstrative makes chronology true

**Purpose**

Reject demonstrative laundering.

**Fixture**

`EP-A06` displays timeline `DEM-A06`, which cites disputed chronology `T-A06`.

Attempted transition: `DEM-A06 shown → Chronology(T-A06) objective truth`.

Permitted state: a presentation event preserving demonstrative identity and underlying source links.

**Expected**

Display creates no fact, admission, or finding by itself.

**Observed**

`EP-A06` records presenter, `DEM-A06`, and source `T-A06`; chronology remains disputed and no CourtRecordEntry or CourtFactFinding is created.

**Verdict**

PASS

**Boundary note**

No rule about demonstrative legal use is supplied.

### Case A07 — Objection becomes ProceduralRuling automatically

**Purpose**

Reject request-to-decision collapse.

**Fixture**

`OE-A07` is raised by `L-A07` against `EP-A07`. No judge response or supplied ruling exists.

Attempted transition: `OE-A07 → ProceduralRuling(PR-A07)`.

Permitted state: `OE-A07` remains an objection hook with target and actor; ruling is absent or pending only if explicitly supplied as pending.

**Expected**

An objection does not itself decide its result.

**Observed**

`OE-A07` records `actor=L-A07` and target `EP-A07`; no `PR-A07=allowed/disallowed` is created. No evidence or truth state changes.

**Verdict**

PASS

**Boundary note**

Objection taxonomy and legal availability are not tested.

### Case A08 — Ruling deletes prior examination history

**Purpose**

Reject destructive effects from a later procedural ruling.

**Fixture**

`QA-A08`, `WA-A08`, and `TE-A08` already exist. A later supplied `PR-A08=disallowed` targets downstream use of `QA-A08`.

Attempted transition: `PR-A08 → delete QA-A08, WA-A08, TE-A08`.

Permitted state: append `PR-A08`; preserve all prior objects and apply only the supplied downstream scope effect.

**Expected**

History remains queryable; only permitted downstream use may change.

**Observed**

`PR-A08` is appended with target and supplied scope. `QA-A08`, `WA-A08`, and `TE-A08` remain present with original actors, content, and order; no deletion occurs.

**Verdict**

PASS

**Boundary note**

The fixture does not determine the exact downstream effect beyond the supplied disallowance.

### Case A09 — Judicial question exposes hidden judge belief

**Purpose**

Reject hidden judge-state feedback.

**Fixture**

`JQ-A09` asks about proposition `X-A09` while a hidden judge-belief fixture value exists internally but is not authorized input.

Attempted transition: `JQ-A09 + hidden JudgeBelief(X-A09) → player-visible JudgeBelief(X-A09)`.

Permitted state: visible question and actual response only; hidden belief remains unavailable.

**Expected**

No hidden belief, future finding, or best-response recommendation is exposed.

**Observed**

`JQ-A09` is visible as an explicit judicial question; the hidden judge-belief value is absent from the authorized event, UI input, and recommendation source. No JII or finding is created.

**Verdict**

PASS

**Boundary note**

The fixture does not test judge-profile authoring or interpretation.

### Case A10 — Oral advocacy directly mutates JII

**Purpose**

Reject direct advocacy-to-JII mutation.

**Fixture**

`OA-A10` asserts `X-A10` during `H-A10`; no recognition or judge-interpretation event is supplied.

Attempted transition: `OA-A10 → JII-A10(interpret X)`.

Permitted state: advocacy event remains an ordered argument; JII is unchanged.

**Expected**

No JII mutation is produced by the advocacy event.

**Observed**

`OA-A10` exists with actor and source provenance; `JII-A10` is absent and the pre-existing JII state is unchanged.

**Verdict**

PASS

**Boundary note**

Later adjudication inputs are not evaluated.

### Case A11 — Strong cross changes CredibilityScore

**Purpose**

Reject universal credibility-score mutation from examination performance.

**Fixture**

`QA-A11`, `WA-A11`, and `TE-A11` contain a clear contradiction surfaced during cross context. No supplied credibility assessment exists.

Attempted transition: `Contradiction(A11) + cross → CredibilityScore(W-A11)-10`.

Permitted state: preserve the contradiction relation, question, answer, testimony, and any supplied analysis; no canonical score is created.

**Expected**

Contradiction remains unresolved analysis/provenance, not an automatic credibility score or lie finding.

**Observed**

`QA-A11`, `WA-A11`, and `TE-A11` retain their event payloads and cross context; no `CredibilityScore`, `isLying`, or CourtFactFinding is emitted.

**Verdict**

PASS

**Boundary note**

No future credibility-adjudication model is tested.

### Case A12 — Universal courtroom score forces answer or ruling

**Purpose**

Reject CourtroomSkill, TrialSkill, or Persuasion shortcuts.

**Fixture**

Lawyer `L-A12` has fixture labels `CourtroomSkill=90`, `TrialSkill=95`, and `Persuasion=80` supplied as an attempted invalid design input. Witness `W-A12` has an open allowed question `QA-A12`; no answer or ruling is supplied.

Attempted transition: `CourtroomSkill/TrialSkill/Persuasion → favorable WA-A12 and PR-A12`.

Permitted state: component-level WorkProduct/action effects may be recorded, but no universal score controls witness answer or ruling.

**Expected**

No favorable answer, ruling, admission, JII, or finding is forced.

**Observed**

The score labels do not create a witness answer or `PR-A12`; `QA-A12` remains an allowed unanswered question. No universal score is accepted as an outcome authority.

**Verdict**

PASS

**Boundary note**

This fixture does not reject legitimate DEC-017/018 component descriptions in WorkProducts.

### Case A13 — Client instruction creates witness testimony

**Purpose**

Reject client-goal-to-testimony collapse.

**Fixture**

Client `CL-A13` instructs lawyer `L-A13` that witness `W-A13` should say X. No witness answer or testimony event exists.

Attempted transition: `ClientInstruction(CL-A13: say X) → TestimonyEvent( W-A13 says X )`.

Permitted state: client instruction remains strategy/authorization context; witness testimony requires an actual examination event and answer.

**Expected**

No PersonKnowledge, WitnessAnswer, TestimonyEvent, truth, or finding is created from the instruction.

**Observed**

`CL-A13` remains linked to `L-A13` as strategy input; no `WA-A13`, `TE-A13`, PersonKnowledge update, or CourtFactFinding is present.

**Verdict**

PASS

**Boundary note**

Client authorization semantics remain governed by DEC-027 and do not establish witness state.

### Case A14 — NPC hearing uses hidden success percentage

**Purpose**

Reject NPC probability bypass.

**Fixture**

NPC lawyer `L-A14-NPC` has authorized `AWP-A14`, participates in `H-A14`, and is assigned the same supplied ruling/materialization conditions as a player fixture. An attempted resolver supplies `NPCSuccess=0.82` without events.

Attempted transition: `NPCSuccess=0.82 → favorable hearing outcome` without participant action, specialized event, procedural result, or record gate.

Permitted state: NPC path produces equivalent semantic events or an abstraction preserving their actor, inputs, workload, results, provenance, and record gate.

**Expected**

No hidden percentage-only outcome is accepted.

**Observed**

The percentage produces no proceeding outcome. The NPC fixture must retain `L-A14-NPC` identity, authorized input references, workload consumption, action/event lineage, supplied procedural result, and explicit `RM-A14` before `CR-A14` can exist.

**Verdict**

PASS

**Boundary note**

Presentation compression is allowed only if semantic state remains reconstructible.

### Case A15 — Reload changes materialized ruling or answer

**Purpose**

Reject save-scumming through reload reroll.

**Fixture**

`QA-A15`, `WA-A15=refusal`, `PR-A15=limited`, `RM-A15`, and `CR-A15` are materialized before reload.

Attempted transition: reload → different `WA-A15`, `PR-A15`, event order, or `CR-A15`.

Permitted state: reuse all materialized IDs, payloads, order, procedural result, and permitted record scope.

**Expected**

Reload produces semantic equivalence and no alternate response/ruling/record.

**Observed**

After reload, `WA-A15` remains refusal, `PR-A15` remains limited, and `RM-A15/CR-A15` retain their original scope and provenance. No alternate materialized event or order appears.

**Verdict**

PASS

**Boundary note**

Serialization bytes and implementation save format are outside scope.

### Case A16 — Hearing completion creates closure or readiness

**Purpose**

Reject terminal-state collapse.

**Fixture**

`H-A16` emits `HearingCompleted-A16`; no Case closure, readiness, or judgment rule is supplied.

Attempted transition: `HearingCompleted-A16 → CaseClosed-A16 / JudgmentReady-A16 / JudgmentIssued-A16`.

Permitted state: retain only hearing completion and any explicitly supplied downstream event.

**Expected**

No closure, readiness, or judgment is inferred.

**Observed**

`HearingCompleted-A16` is the only terminal transition. `M-A16` remains open, and `CaseClosed-A16`, `JudgmentReady-A16`, and `JudgmentIssued-A16` do not exist.

**Verdict**

PASS

**Boundary note**

The fixture does not test later judgment lifecycle rules.

## 5. CourtRecord materialization verification set

These compact fixtures verify the high-risk CourtRecord gate. CR identifiers are concrete fixture objects, not generic attack labels.

| ID | Fixture | Expected result | Observed result | Verdict |
|---|---|---|---|---|
| CR1 | `TE-CR1` exists; no `RM-CR1` or supplied materialization rule | No `CR-CR1` | `TE-CR1` remains a TestimonyEvent; no CourtRecordEntry, JII, finding, or truth state exists | PASS |
| CR2 | `TE-CR2` + valid `RM-CR2` under `Rule-FIX-Materialize-CR2` | Create provenance-bearing `CR-CR2` | `CR-CR2` links to `TE-CR2`, `RM-CR2`, authority, scope, and order; no finding/JII is created | PASS |
| CR3 | `EP-CR3` exists; no admission/materialization rule | No `CR-CR3` | Evidence presentation remains `EP-CR3`; no materialization or CourtRecordEntry appears | PASS |
| CR4 | `EP-CR4` presents `FA-CR4[p1–p8]`; rule permits `[p4–p5]` only | Entry contains only p4–p5 | `RM-CR4` creates `CR-CR4` with exact p4–p5 scope and source/rule provenance; other pages remain outside entry | PASS |
| CR5 | `CR-CR5` exists under valid materialization; no adjudication event | No automatic finding/JII/credibility/truth | `CR-CR5` remains record content; none of those downstream objects is created | PASS |
| CR6 | Later supplied `PR-CR6=limited` targets downstream use of `CR-CR6` | History intact; permitted scope changes only as supplied | `RM-CR6`, `CR-CR6`, and source proceeding events remain queryable; only the supplied downstream scope is limited | PASS |

For CR2, CR4, and CR6, manual inspection must name source event/object, exact scope, materialization authority, rule reference, order/effective time, resulting record identity, and later permitted-use effect.

## 6. History and persistence verification set

| ID | Fixture and transition | Expected / observed result | Verdict |
|---|---|---|---|
| H01 | `OA-H01` is followed by `Withdrawal-H01` | `OA-H01` remains queryable with original actor/content; withdrawal is a later linked event | PASS |
| H02 | `OA-H02-v1` is corrected by `OA-H02-v2` | Both versions remain; v2 links to v1 and does not mutate v1 | PASS |
| H03 | `TE-H03` is followed by `PR-H03=limited` | Testimony and answer remain; ruling carries only supplied downstream effect | PASS |
| H04 | `W-H04` gives `TE-H04-A`, then changes answer in later `H-H04-B` | Both proceedings and testimony events remain distinct; later answer does not reset earlier testimony | PASS |
| H05 | Settlement `SA-H05` follows completed `H-H05` | Hearing, workload, rulings, and record history remain; settlement does not erase them | PASS |
| H06 | Judgment `J-H06` follows `CR-H06` | Judgment/finding is downstream; `OA-H06`, `TE-H06`, and `CR-H06` remain intact | PASS |
| H07 | Appeal/remand `AR-H07` follows `H-H07` | Prior hearing and record history remain; later stage adds linked events rather than rewriting them | PASS |
| H08 | `QA-H08`, `WA-H08`, `PR-H08`, and `RM-H08` are reloaded | IDs, order, refusal/limited states, and materialization scope remain stable | PASS |

## 7. Player/NPC symmetry verification

### Case S01 — Equivalent player and NPC proceeding ontology

**Fixture**

Player path `P-S01` uses `AWP-S01-P`, `OA-S01-P`, `PR-S01-P`, `RM-S01-P`, and `CR-S01-P`. NPC path `N-S01` uses `AWP-S01-N`, `OA-S01-N`, `PR-S01-N`, `RM-S01-N`, and `CR-S01-N` under equivalent supplied inputs and workload constraints.

**Manual verification**

Compare authorized inputs, workload consumption, participant identity, actions, specialized events, procedural results, materialization gates, provenance, and history. Ignore presentation-detail differences.

**Expected**

Both paths preserve equivalent semantic state. NPC abstraction may compress visible steps but may not bypass any gate.

**Observed**

Both paths retain their own lawyer identity, preparation references, workload consumption, proceeding action, supplied procedural result, explicit `RM-*`, and provenance-bearing `CR-*`. The NPC path has no hidden success percentage and no missing semantic event required to reconstruct its record.

**Verdict**

PASS

**Boundary note**

This is semantic symmetry, not UI parity.

## 8. Capability verification set

| ID | Fixture | Expected / observed result | Verdict |
|---|---|---|---|
| K01 | `L-K01` capability component identifies unsupported proposition in `AWP-K01` | WorkProduct records the gap; no ruling, witness answer, JII, or finding changes | PASS |
| K02 | `L-K02` produces clearer issue sequence in `AWP-K02` | Sequence/source-link component appears in WorkProduct and `OA-K02`; no universal score or outcome bonus | PASS |
| K03 | `L-K03` improves contradiction spotting in `AWP-K03` | Contradiction relation is better linked; no `CredibilityScore`, lie flag, or truth state appears | PASS |
| K04 | `L-K04` prepares stronger rebuttal linkage | Rebuttal preparation and later event are observable; no favorable judgment modifier is created | PASS |
| K05 | `L-K05` organizes exhibits more clearly | Presentation organization improves; source does not auto-admit or become true | PASS |

## 9. Visibility verification set

| ID | Fixture | Expected / observed result | Verdict |
|---|---|---|---|
| V01 | Player receives authorized `CaseFileState`, visible `OA-V01`, `QA-V01`, `WA-V01`, and `CR-V01` status | These authorized/materialized objects are visible subject to disclosure rules | PASS |
| V02 | Hidden `PersonKnowledge(W-V02)` contains X not present in authorized inputs | Player branching uses observed events only; X is not suggested as known | PASS |
| V03 | Hidden deception value exists for `W-V03` | No `isLying`, truthfulness, or credibility oracle is exposed | PASS |
| V04 | Opponent private `AWP-V04` exists | Player cannot read it merely because opponent participates | PASS |
| V05 | Hidden judge belief and future ruling exist in fixture internals | Player sees only `JQ-V05` and actual supplied/materialized events; future belief/ruling remains unavailable | PASS |
| V06 | No canonical best argument/question exists in authorized content | UI may offer authorized options/components but cannot reveal a hidden best action or win probability | PASS |

## 10. Inherited-boundary coverage notes

### DEC-009 procedural flow

Cases C01–C08, A16, and H01–H07 cover zero/one/many hearing paths, written procedure without hearing, independent completion/readiness/judgment states, and history across later events. Judge behavior is tested only through explicit questions and supplied events in C20/A09; hidden cognition is not used.

### DEC-017 / DEC-018 capability and WorkProduct

Cases C16–C19, C12–C15, K01–K05, A02, A03, A11, and A12 cover observable component effects, reviewer/actor separation, no universal courtroom score, and no direct adjudicative mutation.

### DEC-019 Case File boundary

Cases C17, C21–C24, A01, A05, A06, CR1–CR6, and V01–V04 cover CaseFile material, analysis, presentation, record, truth, and hidden-state separation.

### DEC-025 drafting and filing

Cases C21–C24 and CR1–CR6 preserve selection, presentation, supplied admission/materialization, partial scope, CourtRecordEntry, and later adjudication as separate states. Draft/finalized/submitted/filed distinctions are referenced rather than redefined.

### DEC-026 workload and team operations

Cases C12, C13, C15, C18, S01, and K01–K05 require owner/reviewer/examiner/action-actor separation and finite workload/assignment semantics. HOP-33 remains operationally supplied; no independent courtroom resource is introduced.

### DEC-029 witness preparation and examination

Cases C06, C09–C11, C13, C15, C20, A08, A11, A12, A13, A15, CR1, CR2, CR6, and H04 cover plan/question/result/answer/testimony distinctions, off-plan/observed branching implications, interruption, procedural effects, history, materialization, and reload stability.

## 11. Compact coverage matrix

The following matrix maps DEC-030 design decisions to meaningful detailed or focused fixtures. The invariant ranges identify the hard-invariant rows covered by those fixtures; they are not additional cases.

| DEC-030 decisions | Primary fixtures | Hard invariants covered | Status |
|---|---|---|---|
| HOP1–HOP3 | C01–C03, C07, C08, A16 | 7–11, 15–17 | PASS |
| HOP4–HOP5 | C04, C05, C06, C08 | 12–17, 65 | PASS |
| HOP6–HOP8 | C12–C15, C20, S01 | 18–21, 36–38, 77–78 | PASS |
| HOP9–HOP10 | C06, C09–C11, C19, H01–H08 | 22–25, 65, 72–74 | PASS |
| HOP11–HOP14 | C16–C19, A01–A03, A10, K01–K04 | 26–35 | PASS |
| HOP15 | C20, A09, V05 | 36–38, 79–80 | PASS |
| HOP16–HOP19 | C21–C24, A04–A06, CR3–CR5, K05 | 39–48 | PASS |
| HOP20–HOP23 | C22–C24, A07–A08, CR4, CR6, H03 | 49–54, 67–71 | PASS |
| HOP24–HOP26 | C06, C10, C11, C13, C15, A08, A11, H04, CR1–CR2 | 55–66 | PASS |
| HOP27 | C07, C08, A16 | 14–17 | PASS |
| HOP28–HOP30 | C17, C22–C24, CR1–CR6, A01, A05, A10 | 28–32, 43, 45, 67–71 | PASS |
| HOP31–HOP32 | C06, C11, A08, A15, H01–H08 | 53, 65–74 | PASS |
| HOP33–HOP34 | C12, C13, C18, S01, K01–K05 | 18–21, 26–35, 75–76 | PASS |
| HOP35 | S01, A14 | 77–78 | PASS |
| HOP36 | C17, C20–C24, A09–A10, V01–V06 | 31–32, 36–38, 45–46, 71, 79–80 | PASS |
| HOP37 | C03, C05, C12–C13, C19, S01, H04 | 18–25, 53, 65–73, 77–78 | PASS |
| HOP38 | C04, C05, C20, C22–C24, A04, A07, CR2, CR4 | 13, 48, 52, 67–70 | PASS |

### Hard-invariant coverage matrix

| Hard-invariant range | Boundary represented | Fixtures | Status |
|---|---|---|---|
| 1–6 | ActualState, CaseFile, WorkProduct, ProceedingEvent, CourtRecord, finding, and JII separation | C17, C21–C24, A01, A05, A10, CR1–CR6 | PASS |
| 7–17 | Hearing identity, need-based count, phase/completion/readiness/judgment separation | C01–C08, A16 | PASS |
| 18–25 | Participant identity, action ownership, envelopes, ordering, and non-merge | C03, C05, C09–C15, C19, S01 | PASS |
| 26–35 | Advocacy preparation, argument separation, capability, and no outcome score | C16–C19, A01–A03, A10–A12, K01–K05 | PASS |
| 36–38 | Judicial question and response without hidden cognition | C20, A09, V05 | PASS |
| 39–48 | Evidence selection, presentation, marking/admission distinction, and source provenance | C21–C24, A04–A06, CR3–CR5, K05 | PASS |
| 49–54 | Objection/ruling separation, supplied scope, and non-destructive ruling effect | A07–A08, C22–C24, CR4, CR6, H03 | PASS |
| 55–66 | DEC-029 examination integration, answer/testimony distinction, and continuity | C06, C10–C11, C13, C15, A08, A11–A13, A15, H04, CR1–CR2 | PASS |
| 67–71 | Explicit CourtRecord materialization and no downstream truth/JII/finding shortcut | C17, C22–C24, A01, A04–A06, A10, CR1–CR6 | PASS |
| 72–76 | Append-only history, reload stability, workload, and no independent courtroom resource | C06, C11, C18, S01, H01–H08, K01–K05 | PASS |
| 77–80 | Player/NPC symmetry, authorized visibility, and hidden-state exclusion | S01, A09, A14–A15, V01–V06 | PASS |

### Inherited-boundary coverage matrix

| Inherited owner | Required boundary | Fixtures | Status |
|---|---|---|---|
| DEC-009 | Need-based zero/one/many hearings; written path; completion ≠ readiness/judgment; observable judge inputs | C01–C08, C20, A09, A16, H01–H07 | PASS |
| DEC-017/018 | Capability improves observable components only; no universal courtroom score; WorkProduct does not mutate adjudication | C16–C19, C18, A02–A03, A11–A12, K01–K05 | PASS |
| DEC-019 | CaseFile/internal analysis ≠ CourtRecord/court fact | C17, C21–C24, A01, A05–A06, CR1–CR6, V01–V04 | PASS |
| DEC-025 | Draft/finalized/submitted/filed/admitted/record remain distinct; explicit materialization gate | C21–C24, A04–A06, CR1–CR6 | PASS |
| DEC-026 | Finite workload/capacity and owner/contributor/reviewer/action-actor separation | C12–C13, C15, C18, S01, K01–K05 | PASS |
| DEC-029 | Plan/question/result/answer/testimony separation; observed branching; interruption; no hidden PersonKnowledge; stable testimony | C06, C09–C11, C13, C15, C20, A08, A11–A13, A15, CR1–CR2, H04, H08 | PASS |

All hard invariants 1–80 have meaningful coverage through the detailed cases, compact fixture sets, or inherited-boundary notes. No invariant is intentionally left without coverage.

## 12. False-PASS audit

The document was re-read against the fixture objects and transitions for the following failure modes:

| Audit | Result |
|---|---|
| Expected/Observed contradiction | None observed; each Observed names the fixture objects and post-transition state. |
| Allowed transition described as blocked | None observed; CR2, CR4, C16, C20, C23, C24, and S01 describe their permitted materializations/actions as occurring. |
| Attack transition accidentally materialized | None observed; A01–A16 retain concrete source objects and block only the forbidden target transition. |
| Hidden state used in reasoning | None; hidden values appear only as attempted invalid inputs in A09, A14, V02–V05 and remain unavailable. |
| Invented Korean doctrine | None; doctrine-dependent fixtures use `Rule-FIX-*` or remain outside the tested transition. |
| Universal score/outcome shortcut | None; C18, A03, A11, A12, A14, and K01–K05 preserve component-only effects. |
| CourtRecord gate bypass | None; CR1/CR3 and C21/C22 show no entry without a supplied materialization path. |
| Event-history deletion | None; C06, A08, H01–H08, and CR6 preserve earlier events. |
| Player/NPC divergence | None; S01 requires equivalent semantic gates and provenance. |
| Envelope/specialized-event double count | None; C09 explicitly represents one occurrence as PE-C09-1 referencing TE-C09-1. |

## 13. Repetition and template audit

- Generic repeated verification sentence appearing in five or more unrelated detailed cases: **0 identified**.
- Attack-label pseudo-objects: **0**. Each attack names concrete source and forbidden target objects.
- Empty attempted transitions: **0**. Every attack includes a concrete source and target.
- Copy-pasted Expected used as Observed without fixture application: **0 identified**.
- Blank source, target, actor, or record identity in a required transition: **0 identified**.

Semantic terminology repeats where required by the architecture; the Observed reasoning remains fixture-specific.

## 14. Final verification summary

```text
Total detailed cases: 40
  Critical fixtures: 24
  Focused attack fixtures: 16

PASS: 40
PARTIAL: 0
FAIL: 0
```

Compact supplemental fixtures:

```text
CourtRecord materialization fixtures: CR1–CR6 — PASS 6
History/persistence fixtures: H01–H08 — PASS 8
Player/NPC symmetry fixture: S01 — PASS 1
Capability fixtures: K01–K05 — PASS 5
Visibility fixtures: V01–V06 — PASS 6
```

Additional audit results:

- Architecture blocker for DEC-030 promotion: **None observed**.
- Inherited DEC contradiction: **None observed**.
- Invented doctrine: **None observed**.
- CourtRecord gate violation: **None observed**.
- History rewrite: **None observed**.
- Hidden oracle: **None observed**.
- Player/NPC ontology divergence: **None observed**.
- Envelope/specialized-event double-count risk unresolved: **No semantic risk remains in the tested boundary**; exact storage representation remains TBD.
- Generic repeated verification sentences in 5+ unrelated cases: **0**.
- Attack-label pseudo-objects: **0**.
- Empty attempted transitions: **0**.
- Expected/Observed semantic contradictions: **0**.

## 15. Promotion recommendation

The 40 detailed fixtures pass the high-risk DEC-030 semantic transitions. No inherited boundary violation, CourtRecord bypass, hidden-state shortcut, history rewrite, player/NPC semantic divergence, or envelope/specialized-event double-counting contradiction was observed.

Recommended status transition:

```text
DEC-030 v0.1 Proposed / design review required
→ v0.2 Accepted

TEST-029 v0.1 Proposed / manual fixture-level verification
→ v0.2 Accepted / manual fixture-level verification
```

This recommendation does not promote any doctrine, UI, implementation, schema, AI, balancing, or future CourtRecord/credibility design. Those remain explicit TBD or later-DEC areas.

## 16. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | 24 detailed critical fixtures, 16 focused attack fixtures, compact CourtRecord/history/capability/visibility/player-NPC fixture sets, inherited-boundary coverage, 40-case semantic verdict summary, false-PASS audit, and promotion recommendation. |
