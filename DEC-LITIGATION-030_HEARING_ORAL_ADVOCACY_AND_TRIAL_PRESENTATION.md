# THE FIRM — Hearing, Oral Advocacy, and Trial Presentation

Document ID: DEC-LITIGATION-030  
Version: v0.1 — Proposed / design review required  
Status: **Proposed / design review required**  
Project: THE FIRM  
Document type: Design Decision

Direct basis: `DEC-LITIGATION-029_WITNESS_PREPARATION_AND_COURT_EXAMINATION.md`, `TEST-028_WITNESS_PREPARATION_AND_COURT_EXAMINATION.md`, and the accepted litigation chain they inherit through DEC-001–029 / TEST-001–028.  
Superior basis: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `02_ARCHITECTURE_RULES.md`, `SYS-001_LITIGATION.md`.

This document extends the accepted architecture by orchestration only. It does not replace or reinterpret an inherited object, legal boundary, or decision owner.

## 1. Purpose

DEC-030 defines the minimum semantic architecture by which a court proceeding turns authorized legal work, arguments, evidence presentation, witness examination, and supplied procedural rulings into an ordered, provenance-preserving proceeding history and, where an explicit valid rule permits, CourtRecord material.

It covers:

- hearing and courtroom proceeding orchestration;
- extensible proceeding phases;
- participant roles, turns, and action ownership;
- oral advocacy and judicial-question events;
- evidence-presentation events;
- integration of supplied procedural results and rulings;
- embedding of the accepted DEC-029 witness-examination chain;
- explicit CourtRecord materialization orchestration;
- interruption, resumption, completion, and historical persistence;
- workload, visibility, and player/NPC symmetry.

The central pipeline is:

```text
authorized inputs + assigned courtroom work + ProceedingContext
→ ordered participant actions and specialized proceeding events
→ supplied procedural results/rulings
→ explicit RecordMaterializationEvent where a valid rule permits
→ provenance-bearing CourtRecordEntry
→ later, separate adjudication
```

DEC-030 is primarily an orchestration DEC. It defines how accepted systems meet in a proceeding, not the jurisdiction-specific doctrine that decides admissibility, objections, witness competency, or the merits.

## 2. Foundational boundary

```text
ActualStateRecord
≠ CaseFileState
≠ LawyerWorkProduct
≠ ProceedingEvent
≠ CourtRecord
≠ CourtFactFinding
≠ JudgeInterpretationInput
```

Courtroom presentation does not create truth. Persuasive delivery does not create a favorable finding. A dramatic event does not directly mutate judge belief, JII, credibility, or outcome state.

Each transition must answer:

1. Which semantic object changes?
2. Which explicit event caused the change?
3. Which authorized information was available?
4. Which provenance and history must survive?
5. Which adjacent objects must not change?
6. Which inherited DEC owns those adjacent semantics?
7. Is the transition orchestration, supplied doctrine, or an unresolved TBD?

If a transition needs doctrine or implementation not already accepted, DEC-030 provides a typed hook and leaves the rule supplied/TBD.

## 3. Inherited architecture

### 3.1 Procedural flow

DEC-009 remains authoritative:

- hearings are need-based procedural events, not fixed slots;
- a Matter may have zero, one, or multiple hearings;
- written procedure may progress without a hearing;
- a hearing may be continued, interrupted, resumed, or adjourned;
- hearing completion is not Case closure;
- hearing completion is not judgment readiness;
- judgment readiness is not judgment;
- submitted, received, permitted, considered, and decided states remain distinct;
- the judge may respond to observed procedural needs but cannot expose hidden facts or strategy.

### 3.2 Knowledge, evidence, drafting, and filing

The following inherited separations remain unchanged:

```text
SourceMaterial ≠ SourceAssertion ≠ ProfessionalAnalysis ≠ CaseTheory
Draft ≠ FinalizedArtifact ≠ SubmissionAttempt ≠ ProceduralReceipt
FiledArtifact ≠ AdmittedMaterial ≠ CourtRecordEntry ≠ CourtFactFinding
```

Case File and WorkProduct content may guide preparation and action selection. They do not enter CourtRecord or adjudication merely because a lawyer knows, selects, cites, or presents them.

### 3.3 Witness chain

DEC-030 consumes without redefining:

```text
WitnessPreparationTask
→ WitnessPreparationWorkProduct
→ ExaminationPlan
→ ProceedingContext
→ QuestionAttempt
→ QuestionProceduralResult
→ WitnessAnswer
→ TestimonyEvent
→ explicit CourtRecord materialization
→ CourtRecordEntry
→ later adjudication
```

`Person`, `WitnessRole`, preparation, `ExaminationPlan`, `QuestionAttempt`, `QuestionProceduralResult`, `WitnessAnswer`, and `TestimonyEvent` remain owned by their inherited decisions. DEC-030 places those objects in an ordered hearing lifecycle and connects them to other proceeding events.

### 3.4 Workload and capability

Courtroom preparation and participation use DEC-017, DEC-018, and DEC-026 semantics. Assigned work consumes time, capacity, dependencies, and scheduling commitments. Capability may improve explicit components of a WorkProduct or action; it does not directly determine truth, admission, a witness answer, judge agreement, or victory.

## 4. Proceeding identity and hearing lifecycle

### 4.1 ProceedingContext

The DEC-029 `ProceedingContext` remains the required hosting interface. DEC-030 expects it to expose or reference, at minimum:

- stable proceeding identity and Matter/stage identity;
- proceeding kind or supplied context tag;
- participants and their proceeding roles;
- current phase context, if any;
- ordered event stream or ordering reference;
- current witness when examination is active;
- supplied procedural-rule and ruling hooks;
- CourtRecord target or materialization destination context;
- interruption/resumption and completion state;
- authorized input snapshot references;
- version and provenance metadata.

These are semantic requirements, not a mandatory storage schema.

### 4.2 Hearing occurrence and lifecycle events

A hearing is an identified procedural occurrence within a Matter/stage. It is not the entire Case, not the CourtRecord, and not a fixed round.

Minimum lifecycle events may include:

```text
HearingScheduled or other supplied activation
→ HearingOpened
→ zero or more PhaseTransition / ParticipantAction / specialized events
→ optional InterruptionEvent
→ optional ResumptionEvent
→ HearingCompleted or HearingAdjourned
```

The exact trigger for scheduling, opening, continuing, or completing a hearing is supplied by procedural content or remains TBD. A hearing may end while the Matter remains active and while additional written or hearing events remain possible.

### 4.3 Proceeding phases

`ProceedingPhaseContext` is an extensible context object or equivalent semantic tag. It may identify an authored context such as opening presentation, legal argument, factual argument, witness examination, evidence presentation, response, rebuttal, closing presentation, or another supplied phase.

A phase context:

- provides purpose, authorized action categories, participant eligibility, and ordering context;
- may reference supplied procedural constraints;
- does not itself create an action, argument, testimony, ruling, or record entry;
- does not imply that every proceeding has that phase;
- does not fix a universal sequence;
- does not encode jurisdiction-specific availability unless supplied.

Phase start, transition, suspension, resumption, and completion are explicit events where they matter to history.

### 4.4 Completion states

The following remain independent:

```text
PhaseCompleted
≠ HearingCompleted
≠ HearingAdjourned
≠ ProceedingClosed
≠ JudgmentReady
≠ JudgmentIssued
≠ CaseClosed
```

Only the responsible inherited or future procedural system may create the downstream states.

## 5. Participant and turn model

### 5.1 Identity and roles

Courtroom participation preserves:

```text
ProfessionalIdentity
≠ EmploymentRole
≠ MatterRole
≠ ProceedingRole
≠ ActionOwnership
```

A `ProceedingParticipant` or equivalent relation binds a stable person/entity reference to a proceeding-specific role and applicable time/scope. Potential participants include adjudicators, player lawyers, NPC lawyers, witnesses, clients, parties, support personnel, interpreters, experts, and future supplied roles.

Role membership does not transfer action authorship. A Matter owner does not become the speaker of another lawyer's argument; a supervising partner does not become the examiner of questions asked by an associate; a client does not become the source of witness testimony.

### 5.2 Participation eligibility and turns

`ParticipationOpportunity` or an equivalent hook may express that a participant is permitted, invited, or required to act in a supplied context. It is not itself an action and does not guarantee that an action occurs.

```text
eligible to participate ≠ took a turn ≠ completed a requested response
```

A `ParticipantAction` records the actual actor, proceeding, phase/context, action kind, source references, order, and resulting specialized event references. A turn model may coordinate who may act next, but it must not replace the underlying event types or create a universal alternating-turn doctrine.

## 6. Courtroom action and event model

### 6.1 ProceedingEvent envelope

A general `ProceedingEvent` is useful as an ordering and provenance envelope. It provides a common event identity and references an event payload or specialized object.

Suggested semantic fields are:

- `proceeding_event_id`;
- `proceeding_id` and Matter/stage reference;
- event kind;
- actual actor or responsible authority;
- phase/context reference;
- temporal/order key;
- source and parent event references;
- specialized payload reference;
- supplied procedural status/result references;
- visibility/disclosure classification;
- version or supersession lineage where applicable.

The envelope does not flatten every event into text. `QuestionAttempt`, `WitnessAnswer`, `TestimonyEvent`, `EvidencePresentationEvent`, `OralAdvocacyEvent`, `JudicialQuestionEvent`, `ObjectionEvent`, `ProceduralRuling`, `InterruptionEvent`, and `RecordMaterializationEvent` retain specialized semantics.

```text
ProceedingEvent envelope references specialized event
ProceedingEvent envelope does not replace specialized event
```

### 6.2 Ordering

Materialized proceeding events have stable identity and stable order. Ordering may use sequence keys, causal parents, timestamps, or another deterministic mechanism; the exact mechanism is TBD. The semantics must support:

- total ordering within a linear segment where required;
- explicit causal or parent relations;
- parallel preparation without silent courtroom merge;
- interruption and later continuation;
- replay without reroll;
- append-only correction, withdrawal, limitation, or later ruling events.

## 7. Oral advocacy

### 7.1 Advocacy preparation

`AdvocacyPreparationTask` and `AdvocacyPreparationWorkProduct`, or a task-specific specialization of accepted Task/WorkProduct semantics, may organize:

- authorized CaseTheory and IssueAnalysis references;
- authorized record and filing references;
- intended propositions and requested procedural or substantive action;
- source links and known limitations;
- sequencing and time constraints;
- anticipated responses and rebuttal paths;
- unresolved gaps, risks, and dependencies;
- author, contributor, reviewer, version, and consumed snapshot.

Advocacy preparation is not courtroom speech and is not CourtRecord material.

### 7.2 OralAdvocacyEvent

An `OralAdvocacyEvent` records an actual lawyer or authorized participant presentation in a proceeding. It may represent an opening presentation, legal argument, factual argument, response, rebuttal, closing presentation, answer to a judicial question, or another supplied form.

Minimum semantics include:

- proceeding, phase/context, actor, and order;
- purpose or requested action where applicable;
- proposition/Issue/Argument references;
- authorized source, filing, and record references actually invoked;
- relation to an AdvocacyPreparation version, if used;
- supplied procedural status or limitation;
- provenance and visibility.

The event records what was presented, not whether it was correct, persuasive, accepted, or outcome-determinative.

```text
Argument ≠ Evidence ≠ Testimony ≠ CourtRecord fact ≠ CourtFactFinding
```

There is no universal `PersuasionScore`, `AdvocacyPower`, `JudgeFavor`, `ArgumentStrength`, hidden weighted victory formula, canonical best argument, or automatic favorable-judgment modifier.

### 7.3 Capability effects

Existing component capabilities may improve observable work and actions, for example:

- clearer issue sequencing;
- stronger source linkage;
- identification of missing support or procedural gaps;
- more coherent rebuttal preparation;
- better contradiction spotting;
- more usable exhibit organization;
- clearer statement of requested action.

Those effects must appear through WorkProduct components, preparation history, or actual proceeding events. They cannot directly force judge agreement, admission, credibility, a finding, or case victory.

## 8. Judicial questioning

A `JudicialQuestionEvent` records an explicit question by an adjudicator to an identified participant in an identified proceeding context. A linked `ParticipantResponseEvent`, `OralAdvocacyEvent`, or existing specialized answer object records the actual response according to its semantic type.

Minimum judicial-question semantics include:

- adjudicator identity;
- addressed participant;
- proceeding and phase/context;
- question content or structured issue/request reference;
- order and parent/source references;
- supplied response deadline or procedural status where applicable;
- linked response event, if one occurs.

```text
Judge asks question
≠ judge believes proposition
≠ judge has decided issue
≠ JudgeInterpretationInput
≠ CourtFactFinding
```

The event may make the question and response observable proceeding content. It must not expose hidden judge cognition, future rulings, or future findings.

## 9. Evidence presentation

### 9.1 Semantic separation

```text
CaseFile material
≠ PresentationSelection
≠ EvidencePresentationEvent
≠ MarkedItem
≠ ProcedurallyAcceptedOrAdmittedMaterial
≠ CourtRecordEntry
≠ CourtFactFinding
```

`PresentationSelection` is an internal, versioned choice or WorkProduct component identifying material a team may seek to use. It is not a courtroom event.

`EvidencePresentationEvent` records that an identified participant presented, offered, displayed, referred to, or otherwise used identified material in a proceeding. The exact action vocabulary is supplied/TBD.

Minimum semantics include:

- source or artifact identity and immutable version/scope;
- presenter and actual action owner;
- proceeding and phase/context;
- event order;
- stated purpose/context where applicable;
- relation to a witness, question, argument, or filing where applicable;
- supplied procedural status/result references;
- provenance and visibility.

### 9.2 Marking, acceptance, and admission hooks

`MarkedItem`, `ProcedurallyAcceptedMaterial`, or `AdmittedMaterial` may be represented only when an explicit supplied procedural rule/event creates that status. DEC-030 does not define what marking, acceptance, or admission legally requires or permits.

Showing, citing, marking, accepting, or admitting material does not establish truth. Showing material to a witness does not force recognition or agreement and does not predetermine a `WitnessAnswer`.

Authentication, foundation, hearsay, privilege, relevance, and Korean exhibit rules remain outside this DEC.

### 9.3 Demonstratives and presentation aids

Demonstratives, summaries, timelines, and presentation aids remain source-typed objects. Their display may create an `EvidencePresentationEvent` or another supplied presentation event, but display alone does not make the aid evidence, admitted material, CourtRecord content, or truth. Any downstream use requires an explicit supplied rule and provenance to underlying sources.

## 10. Procedural ruling and objection integration

### 10.1 ObjectionEvent

An `ObjectionEvent` is a specialized proceeding event recording the objector, target event or proposed action, proceeding context, order, and supplied category/reason if one exists. It does not itself decide the objection or determine substantive truth.

### 10.2 ProceduralRuling

A `ProceduralRuling` or equivalent supplied result records an authorized decision-maker, target event/object/scope, supplied rule reference, result, effective scope/time, downstream-use effect, order, and provenance.

Generic result states may include `pending`, `allowed`, `disallowed`, `limited`, `withdrawn`, or `deferred` where the supplied rule supports those meanings. These are minimum interoperability terms, not claims about a jurisdiction's complete procedural vocabulary.

```text
ObjectionEvent ≠ ProceduralRuling ≠ CourtFactFinding
```

A later ruling appends a new event. It does not delete the objection, presentation, question, answer, testimony, or argument that historically occurred. A supplied rule may change later eligibility, record scope, or permitted use without rewriting prior history.

### 10.3 Rule ownership

DEC-030 owns orchestration of a supplied result. It does not own:

- objection grounds or availability;
- authentication or foundation requirements;
- hearsay or privilege doctrine;
- leading-question restrictions;
- competency, oath, or perjury doctrine;
- exhibit-admission requirements;
- jurisdiction-specific reasons or remedies.

## 11. Witness examination integration

An examination occurs inside a `ProceedingContext` and, where useful, an extensible examination phase context such as direct, cross, redirect, recross, or another supplied type. Those labels are contextual; they are not truth, success, or doctrine statuses.

DEC-030 orders and relates the inherited objects:

```text
ExaminationPlan version
→ QuestionAttempt
→ QuestionProceduralResult
→ WitnessAnswer
→ TestimonyEvent
→ optional explicit RecordMaterializationEvent
→ CourtRecordEntry
```

It preserves:

- planned question ≠ asked question;
- asked ≠ allowed;
- allowed ≠ answered;
- answered ≠ true;
- testimony ≠ CourtRecord;
- CourtRecord ≠ finding;
- skipped questions create no answer or testimony;
- off-plan questioning may occur;
- observed answers may guide later questions;
- hidden PersonKnowledge may not guide UI or branching;
- interruption/resumption preserves existing event order;
- re-call or later examination creates new events;
- procedural exclusion does not delete historical questions or answers.

Exact direct/cross/redirect/recross availability and restrictions remain supplied/TBD.

## 12. CourtRecord construction orchestration

### 12.1 Materialization boundary

```text
ProceedingEvent
≠ RecordMaterializationEvent
≠ CourtRecordEntry
```

A `RecordMaterializationEvent` is an explicit procedural event or result that identifies:

- source proceeding event/object and exact content scope;
- materialization authority and supplied rule reference;
- destination CourtRecord/stage context;
- allowed, limited, excluded, withdrawn, or other supplied scope;
- order/effective time;
- parent and provenance links;
- resulting `CourtRecordEntry` identity or explicit no-entry result.

The exact canonical CourtRecord schema is TBD. The semantic requirement is that no entry appears without an explicit valid materialization path and that every entry retains a trace to its originating event/object and the rule/event that permitted it.

### 12.2 Potential courtroom sources

Supplied rules may permit materialization from:

- `TestimonyEvent` content or a defined portion;
- permitted or admitted exhibit material;
- an `OralAdvocacyEvent` or participant statement where the supplied rule treats it as record material;
- a `ProceduralRuling`;
- filings/submissions already governed by prior decisions;
- future typed categories.

This list does not presume that all courtroom speech is evidentiary material or that all listed sources are admissible in every proceeding.

### 12.3 Downstream boundary

A `CourtRecordEntry` is an authorized record object, not a fact, credibility determination, JII, or finding.

```text
CourtRecordEntry
≠ CourtFactFinding
≠ JudgeInterpretationInput
≠ objective truth
≠ credibility state
```

Later adjudication may consume an allowed `CourtRecordSnapshot` under inherited criterion and judge-interpretation rules. DEC-030 does not invoke that adjudication merely because record material exists.

## 13. Event history, persistence, and correction

All materialized proceeding events preserve:

- stable event identity;
- actor/action ownership;
- proceeding, stage, and phase context;
- event order and causal/parent references;
- source and consumed-snapshot references;
- specialized object references;
- supplied procedural status/result;
- version, correction, withdrawal, or supersession lineage;
- authorized visibility classification.

Corrections, withdrawals, limitations, later rulings, and changed statements are new events or versions. They do not rewrite prior payloads. Settlement, judgment, appeal, remand, or Case closure does not erase hearing history.

Reload reuses materialized events and supplied results. It does not reroll answers, rulings, event order, or record materialization.

## 14. Workload and operational integration

Courtroom work is represented through accepted Task, TaskAssignment, WorkProduct, workload, dependency, and scheduling semantics. Relevant work may include:

- advocacy preparation and review;
- evidence selection, organization, and presentation preparation;
- examination preparation and plan review;
- hearing attendance and participation;
- support, interpretation, logistics, and follow-up work;
- post-hearing record review or correction tasks where supplied.

The actual assigned lawyer or worker consumes capacity. Matter ownership or senior review does not transfer action authorship. Parallel preparation remains separate until an explicit review, selection, or merge event combines authorized components.

DEC-030 creates no independent `CourtroomEnergy`, `TrialActionPoint`, or similar resource system.

## 15. Player/NPC symmetry and resolution detail

Player and NPC lawyers use the same:

- Task and WorkProduct families;
- participant and action-ownership relations;
- proceeding lifecycle and event envelope;
- advocacy, evidence-presentation, examination, objection, and ruling hooks;
- CourtRecord materialization gates;
- history, visibility, and no-reroll boundaries.

Future presentation or simulation may abbreviate low-salience events, but it must preserve equivalent semantic state. NPC proceedings may not collapse into a hidden success percentage that bypasses events, authorized inputs, procedural results, workload, or provenance.

## 16. Information visibility

Player-visible information may include, subject to existing disclosure rules:

- authorized Case File material;
- assigned and reviewed WorkProducts and plans;
- visible participants and proceeding roles;
- materialized proceeding events and their observable sequence;
- actual questions, responses, answers, and testimony;
- presented materials and known supplied procedural rulings;
- known CourtRecord materialization status;
- historical versions and events the player is authorized to inspect.

The player does not automatically observe:

- `ActualStateRecord`;
- hidden `PersonKnowledge` or deception state;
- `TruthfulnessScore`, `CredibilityScore`, or equivalent oracle;
- hidden opponent strategy or private WorkProduct;
- hidden judge belief or future JII;
- future ruling, future answer, or future finding;
- canonical best argument or question;
- a probability of victory derived from hidden state.

Presentation/UI may explain authorized events and consequences. It may not disclose hidden information, calculate a separate legal result, or mutate proceeding state.

## 17. Capability boundary

DEC-030 defines no universal:

- `CourtroomSkill`;
- `TrialSkill`;
- `AdvocacySkill`;
- `Persuasion` or `Presence` score;
- `CrossSuccess`;
- `HearingPerformanceScore`.

DEC-017/018 component semantics may influence observable preparation and action components. No capability, seniority, reputation, relationship, or review status directly forces:

- a favorable witness answer;
- procedural permission or admission;
- judge agreement;
- credibility change;
- `CourtFactFinding`;
- case victory.

## 18. Design decisions

| ID | Problem | Alternatives | Failure mode | Recommendation | Status |
|---|---|---|---|---|---|
| HOP1 | Hearing identity | Case-wide state / fixed round / identified occurrence | Multiple hearings and written procedure collapse | Use stable hearing/proceeding occurrence identity within Matter/stage | **Core Accepted candidate** |
| HOP2 | Hearing lifecycle | Rigid universal sequence / event lifecycle | Jurisdiction-specific order is invented | Use extensible lifecycle events with supplied transition rules | **Core Accepted candidate** |
| HOP3 | Hearing count | Fixed count / need-based occurrences | Cases are forced into artificial slots | Preserve DEC-009 need-based zero/one/many hearings | **Core Accepted candidate** |
| HOP4 | Proceeding phases | Hardcoded doctrine / extensible contexts | Phase labels become universal legal rules | Use optional `ProceedingPhaseContext` with supplied availability/order | **Accepted candidate** |
| HOP5 | Phase transitions | Implicit UI change / explicit event | History and timing disappear | Materialize meaningful start/transition/completion events | **Core Accepted candidate** |
| HOP6 | Participant representation | One courtroom role / layered role relations | Identity, employment, Matter role, and action ownership collapse | Preserve separate identities and proceeding-role bindings | **Core Accepted candidate** |
| HOP7 | Participation | Role automatically acts / opportunity plus action | Presence fabricates speech | Separate eligibility/opportunity from actual `ParticipantAction` | **Core Accepted candidate** |
| HOP8 | Turn model | Universal alternating turns / supplied orchestration | A game turn order becomes doctrine | Allow turn coordination only through supplied context/rules | **Accepted candidate** |
| HOP9 | Event ordering | Narrative text / stable ordered events | Provenance, interruption, and replay fail | Use stable identities, order, and causal references | **Core Accepted candidate** |
| HOP10 | General event model | Generic text blob / envelope replacing types / typed envelope | Specialized semantics are flattened | Use `ProceedingEvent` as envelope referencing specialized events | **Core Accepted candidate** |
| HOP11 | Oral advocacy | Dialogue outcome / explicit event | Speech becomes persuasion roll or truth | Create provenance-bearing `OralAdvocacyEvent` | **Core Accepted candidate** |
| HOP12 | Advocacy preparation | Invisible bonus / Task/WorkProduct | Workload and source lineage disappear | Use accepted Task/WorkProduct semantics | **Core Accepted candidate** |
| HOP13 | Argument status | Evidence/fact / separate assertion | Advocacy launders truth | Keep Argument distinct from evidence, testimony, record fact, and finding | **Core Accepted candidate** |
| HOP14 | Advocacy quality | Universal score / observable components | Hidden weighted victory formula emerges | Permit only component effects through WorkProducts/actions | **Core Accepted candidate** |
| HOP15 | Judicial questioning | Hidden-belief signal / explicit event | Judge cognition leaks | Record question and response without belief inference | **Core Accepted candidate** |
| HOP16 | Evidence selection | Selection equals presentation / separate internal selection | Internal plan becomes courtroom event | Keep `PresentationSelection` separate | **Core Accepted candidate** |
| HOP17 | Evidence presentation | Source mutation / explicit event | Display loses actor, purpose, and order | Create `EvidencePresentationEvent` with source provenance | **Core Accepted candidate** |
| HOP18 | Marking/admission | Presentation auto-promotes / supplied status event | Doctrine and record gates collapse | Require explicit supplied procedural result | **Core Accepted candidate** |
| HOP19 | Demonstratives | Automatic evidence / typed presentation aid | Lawyer-created visualization becomes fact | Preserve source type and require explicit downstream rule | **Accepted candidate** |
| HOP20 | Procedural ruling | Hardcoded doctrine / generic integration object | Architecture invents legal rules | Orchestrate supplied `ProceduralRuling` only | **Core Accepted candidate** |
| HOP21 | Ruling states | Free text only / minimal interoperable states | Downstream use cannot be traced | Allow minimal abstract states when supplied, with scoped effects | **Accepted candidate** |
| HOP22 | Objection integration | Objection equals ruling / separate events | Request and decision collapse | Keep `ObjectionEvent ≠ ProceduralRuling` | **Core Accepted candidate** |
| HOP23 | Ruling effect | Delete history / append scoped effect | Historical actions disappear | Append ruling and alter downstream eligibility only if supplied | **Core Accepted candidate** |
| HOP24 | Examination integration | Redefine witness chain / embed accepted objects | DEC-029 semantics drift | Reference DEC-029 objects inside ordered proceeding events | **Core Accepted candidate** |
| HOP25 | Examination contexts | Universal doctrine / extensible context tags | Direct/cross restrictions are invented | Support contextual types; leave availability/rules supplied/TBD | **Accepted candidate** |
| HOP26 | Interruption/resumption | Reset / continuity events | Earlier order and active context vanish | Append interruption/resumption events and preserve history | **Core Accepted candidate** |
| HOP27 | Hearing completion | Auto-close/auto-ready / independent state | Procedure jumps to judgment | Keep completion, closure, readiness, and judgment separate | **Core Accepted candidate** |
| HOP28 | Record materialization | All speech recorded / explicit materialization | Proceeding bypasses court epistemic boundary | Require `RecordMaterializationEvent` and valid supplied rule | **Core Accepted candidate** |
| HOP29 | Record provenance | Copy text only / source and rule lineage | Origin and permitted scope cannot be reconstructed | Link every entry to source event/object and materialization authority | **Core Accepted candidate** |
| HOP30 | Record downstream effect | Automatic JII/finding / later adjudication | Record assertions become truth | CourtRecordEntry creates no direct JII, credibility, truth, or finding | **Core Accepted candidate** |
| HOP31 | History correction | In-place edit / append-only lineage | Past advocacy, rulings, and evidence use are rewritten | Use new correction/withdrawal/limitation events | **Core Accepted candidate** |
| HOP32 | Persistence | Reload reroll / materialized identity | Players fish for rulings and answers | Reuse all materialized events/results on reload | **Core Accepted candidate** |
| HOP33 | Workload | Free courtroom actions / accepted workload | Operations are bypassed | Use TaskAssignment, capacity, dependency, and scheduling semantics | **Core Accepted candidate** |
| HOP34 | Capability | Courtroom score / component contribution | Seniority directly decides outcomes | Use DEC-017/018 observable components only | **Core Accepted candidate** |
| HOP35 | Player/NPC resolution | Explicit player chain / NPC probability | NPCs use a different legal ontology | Require equivalent semantic state and gates | **Core Accepted candidate** |
| HOP36 | Information visibility | Omniscient tactical UI / authorized observations | Hidden truth and judge cognition leak | Expose only authorized inputs and materialized observable events | **Core Accepted candidate** |
| HOP37 | Parallel work/events | Silent merge / explicit selection/relation | Ownership and contradictory content disappear | Preserve separate provenance until explicit combination | **Core Accepted candidate** |
| HOP38 | Rule ownership | DEC-030 defines doctrine / hook boundary | Orchestration becomes inaccurate law | Leave doctrine to supplied rules/future DECs | **Core Accepted candidate** |

## 19. Hard invariants

| # | Invariant |
|---:|---|
| 1 | `ActualStateRecord ≠ CaseFileState`. |
| 2 | `CaseFileState ≠ LawyerWorkProduct`. |
| 3 | `LawyerWorkProduct ≠ ProceedingEvent`. |
| 4 | `ProceedingEvent ≠ CourtRecordEntry`. |
| 5 | `CourtRecordEntry ≠ CourtFactFinding`. |
| 6 | `CourtRecordEntry ≠ JudgeInterpretationInput`. |
| 7 | A hearing has stable identity within a Matter/stage. |
| 8 | A hearing is not the Case or entire procedural stage. |
| 9 | A Case may progress without a hearing. |
| 10 | A Matter may have multiple hearings. |
| 11 | Hearing sequence and count are not globally fixed. |
| 12 | A phase context is not a phase action. |
| 13 | Phase availability/order requires supplied content or remains TBD. |
| 14 | `PhaseCompleted ≠ HearingCompleted`. |
| 15 | `HearingCompleted ≠ CaseClosed`. |
| 16 | `HearingCompleted ≠ JudgmentReady`. |
| 17 | `JudgmentReady ≠ JudgmentIssued`. |
| 18 | Professional identity, employment role, Matter role, proceeding role, and action ownership remain distinct. |
| 19 | Presence or eligibility does not create a participant action. |
| 20 | Every participant action retains its actual actor. |
| 21 | Matter ownership does not relabel courtroom speakers or examiners. |
| 22 | A general `ProceedingEvent` does not replace specialized event semantics. |
| 23 | Materialized proceeding events retain stable identity and order. |
| 24 | Event ordering does not depend on UI rendering order. |
| 25 | Parallel preparation does not silently merge courtroom actions. |
| 26 | Advocacy preparation is an explicit Task/WorkProduct where modeled. |
| 27 | Advocacy preparation is not courtroom speech. |
| 28 | `OralAdvocacyEvent ≠ Evidence`. |
| 29 | `OralAdvocacyEvent ≠ TestimonyEvent`. |
| 30 | Argument assertion is not objective truth. |
| 31 | Oral advocacy does not directly mutate JII. |
| 32 | Oral advocacy does not directly create a CourtFactFinding. |
| 33 | No universal persuasion, advocacy, presence, or hearing-performance score exists. |
| 34 | Lawyer capability acts through observable WorkProducts/actions only. |
| 35 | Seniority or reputation does not force a favorable ruling. |
| 36 | A judicial question is an explicit event, not hidden cognition. |
| 37 | A judicial question does not establish judge belief or decision. |
| 38 | A judicial response link records an actual response, not a predicted response. |
| 39 | `CaseFileMaterial ≠ PresentationSelection`. |
| 40 | `PresentationSelection ≠ EvidencePresentationEvent`. |
| 41 | `EvidencePresentationEvent ≠ MarkedItem`. |
| 42 | `MarkedItem ≠ AdmittedMaterial`. |
| 43 | `AdmittedMaterial ≠ objective truth`. |
| 44 | Showing a document does not force witness agreement. |
| 45 | Showing or citing material does not automatically create CourtRecord content. |
| 46 | Demonstrative display does not automatically make the demonstrative evidence. |
| 47 | Every evidence-presentation event retains source identity, presenter, proceeding, order, and supplied status. |
| 48 | DEC-030 invents no authentication, foundation, relevance, hearsay, privilege, or exhibit doctrine. |
| 49 | `ObjectionEvent ≠ ProceduralRuling`. |
| 50 | `ProceduralRuling ≠ CourtFactFinding`. |
| 51 | A procedural ruling does not establish substantive truth. |
| 52 | Procedural reasons and effects require supplied rules. |
| 53 | A later ruling does not delete an earlier action or event. |
| 54 | A supplied ruling may change downstream eligibility only within its explicit scope. |
| 55 | DEC-029 witness objects are referenced, not redefined. |
| 56 | `PlannedQuestion ≠ QuestionAttempt`. |
| 57 | `QuestionAttempt ≠ QuestionProceduralResult`. |
| 58 | Question asked does not mean allowed. |
| 59 | Question allowed does not mean answered. |
| 60 | `WitnessAnswer ≠ truth`. |
| 61 | `TestimonyEvent ≠ CourtRecordEntry`. |
| 62 | Observed answers may guide later questions; hidden PersonKnowledge may not. |
| 63 | Off-plan questions may exist as explicit attempts. |
| 64 | Direct/cross/redirect/recross labels are contexts, not success or truth states. |
| 65 | Interruption and resumption preserve prior events and order. |
| 66 | Re-call or later examination creates new events rather than replacing prior testimony. |
| 67 | `RecordMaterializationEvent` is required for courtroom content to enter CourtRecord. |
| 68 | Every CourtRecordEntry retains source-event/object and materialization provenance. |
| 69 | Materialization preserves exact permitted content scope, including partial scope. |
| 70 | Not all courtroom speech is presumed to be evidentiary record material. |
| 71 | CourtRecord materialization does not create truth, credibility, JII, or a finding. |
| 72 | Corrections, withdrawals, limitations, and later rulings append history rather than rewriting it. |
| 73 | Settlement, judgment, appeal, remand, and Case closure do not erase proceeding history. |
| 74 | Materialized events and results do not reroll on reload. |
| 75 | Courtroom work consumes accepted Task/workload capacity. |
| 76 | DEC-030 creates no independent courtroom energy/action-point system. |
| 77 | Player and NPC lawyers use the same proceeding ontology and materialization gates. |
| 78 | NPC abstraction may omit presentation detail but not semantic state or provenance. |
| 79 | Player visibility is limited to authorized inputs and observable/materialized events. |
| 80 | Hidden truth, witness knowledge, deception, opponent strategy, judge belief, future answers, future rulings, and future findings remain unavailable. |

## 20. Required semantic-chain evaluation

### 20.1 Oral advocacy

```text
CaseTheory / IssueAnalysis / authorized record
→ AdvocacyPreparationTask and WorkProduct
→ OralAdvocacyEvent
→ optional explicit RecordMaterializationEvent if a supplied rule permits
→ CourtRecordEntry
→ later adjudication
```

No arrow in this chain implies truth, persuasion, JII mutation, or a favorable result.

### 20.2 Evidence presentation

```text
SourceMaterial / FiledArtifact / supplied permitted material
→ PresentationSelection
→ EvidencePresentationEvent
→ supplied ProceduralResult or ProceduralRuling
→ optional RecordMaterializationEvent
→ CourtRecordEntry
```

Selection, display, marking, procedural acceptance/admission, record entry, and fact-finding remain distinct.

### 20.3 Witness examination

```text
ExaminationPlan
→ QuestionAttempt
→ QuestionProceduralResult
→ WitnessAnswer
→ TestimonyEvent
→ explicit RecordMaterializationEvent
→ CourtRecordEntry
```

DEC-029 owns the specialized witness objects; DEC-030 supplies proceeding placement, ordering, interruption continuity, and links to other courtroom events.

### 20.4 Proceeding lifecycle

```text
ProceedingContext
→ HearingOpened
→ ordered ProceedingEvents and phase contexts
→ optional InterruptionEvent
→ optional ResumptionEvent
→ HearingCompleted or HearingAdjourned
```

The terminal hearing event does not automatically create Case closure, judgment readiness, or judgment.

## 21. Architecture attacks

| Attack | Attempted invalid transition | Permitted state |
|---|---|---|
| Opening argument truth laundering | OpeningArgument says X → X becomes CourtFact | Preserve an `OralAdvocacyEvent` asserting X with source links; create no truth or finding. |
| Partner reputation aura | Partner reputation → favorable ruling | Preserve actual speaker and work components; no ruling exists without an authorized supplied ruling event. |
| Presentation-to-admission collapse | Presented document → admitted exhibit | Preserve `EvidencePresentationEvent`; admission remains absent until a supplied rule/event creates it. |
| Admission-to-truth collapse | Admitted exhibit → X is true | Preserve admitted status and content provenance; truth remains for later adjudication. |
| Sustained-objection deletion | Objection sustained → prior question/answer/event deleted | Append objection and ruling; retain all historical events and alter only explicitly scoped downstream eligibility. |
| Judicial-question mind reading | Judge asks about X → judge believes X | Record the question and any actual response; hidden cognition and future decision remain unavailable. |
| Strong-cross credibility score | Effective cross → CredibilityScore decreases | Preserve questions, answers, contradictions, and procedural results; create no canonical credibility score. |
| CourtroomSkill answer control | CourtroomSkill=95 → favorable witness answer | No such universal skill exists; actual answer remains a separate witness event. |
| Client-to-testimony shortcut | Client goal says X → courtroom testimony X | Preserve client instruction as strategy input only; no witness memory, answer, or testimony is created. |
| CaseTheory memory injection | CaseTheory X → witness remembers X | Theory may guide authorized preparation/questions only; PersonKnowledge remains unchanged. |
| Argument-to-JII mutation | Oral advocacy X → JII favors X | Preserve advocacy history; JII may arise only under inherited adjudication rules from authorized inputs. |
| Completion-to-closure collapse | Hearing completed → Case closed | Record hearing completion only; Case closure requires its own authorized transition. |
| Completion-to-ready collapse | Hearing completed → JudgmentReady | Preserve independent states; later procedural rules determine readiness. |
| Persuasive-event counting | Three favorable moments → win modifier | Preserve three separate events; create no count-based persuasion or victory state. |
| NPC percentage shortcut | NPC hearing → hidden success percentage | Require equivalent participant, action, ruling, materialization, workload, and history semantics. |
| Reload reroll | Reload → different ruling, answer, or order | Reuse the materialized event/result identities and order. |
| Generic-text flattening | Question, testimony, ruling, and argument → one transcript string | Preserve specialized objects and use a common envelope only for order/provenance. |
| Phase hardcoding | Every hearing must run opening→witness→closing | Use only supplied phase contexts and transitions; allow zero, repeated, omitted, or future phases. |
| Presence-to-action fabrication | Listed participant → participant made submission | Preserve participation relation; create an action only when an actual event occurs. |
| Owner-to-speaker relabeling | Matter partner owns case → partner authored all oral events | Retain actual actors; ownership/review remains separate metadata. |
| Demonstrative laundering | Lawyer timeline displayed → underlying chronology true | Preserve presentation aid and source lineage; create no evidence, record, or truth promotion without explicit rules. |
| Partial-scope expansion | Ruling permits page 2 → entire exhibit enters CourtRecord | Materialize only the explicitly permitted scope and retain limitation provenance. |
| Withdrawal rewrite | Lawyer withdraws argument → original event disappears | Append a withdrawal event linked to the original; retain both in history. |
| Settlement erasure | Settlement reached → hearing history deleted | Preserve all proceeding, workload, ruling, and record history; settlement effects remain separately governed. |

## 22. Explicit non-goals and TBD

DEC-030 does not decide:

- Korean objection or evidence doctrine;
- hearsay, privilege, relevance, authentication, or foundation law;
- competency, subpoena, compulsory process, or witness availability doctrine;
- leading-question rules;
- exact exhibit marking, acceptance, admission, limitation, or exclusion rules;
- oath or perjury doctrine;
- testimony-generation AI;
- witness credibility or testimony-adjudication model;
- hidden judge cognition;
- exact CourtRecord storage schema or canonical entry taxonomy;
- exact event-order serialization or concurrency algorithm;
- exact phase catalog, phase availability, or jurisdiction-specific sequence;
- exact participant-role catalog or turn-allocation rules;
- UI, dialogue system, courtroom minigame, or presentation implementation;
- Godot architecture, save format, API, or database schema;
- balancing, performance, or content-production tooling;
- appellate/remand doctrine beyond inherited history and permitted-scope boundaries.

The corresponding interfaces remain supplied-rule hooks or future DEC candidates. General legal knowledge must not fill these gaps.

## 23. Risks and anti-patterns

| Risk | Consequence | Boundary |
|---|---|---|
| Transcript blob | Event types and provenance disappear | Typed events plus ordering envelope |
| Courtroom score | Preparation becomes hidden outcome arithmetic | Observable component effects only |
| Universal phase script | Architecture invents doctrine | Extensible supplied phase contexts |
| Every utterance enters record | CourtRecord boundary collapses | Explicit scoped materialization |
| Procedural ruling becomes truth | Procedure/substance collapse | Ruling and finding separation |
| UI reveals judge state | Strategy becomes answer-key play | Observable events only |
| Dramatic presentation bonus | Presentation bypasses adjudication | No JII/finding direct mutation |
| Event cleanup after exclusion | History and replay fail | Append-only scoped effects |
| NPC probability resolution | Player/NPC ontology diverges | Equivalent semantic state |
| Courtroom micromanagement | Strategy is buried in repetitive input | UI abstraction TBD; semantics retained |
| Doctrine hidden in enum names | Generic hooks become legal claims | Minimal interoperability states only |
| Parallel team auto-merge | Ownership and conflict disappear | Explicit review/selection/merge provenance |

## 24. Later DEC candidates

The following areas should remain separate decisions rather than being absorbed into DEC-030:

| Candidate area | Why separate |
|---|---|
| Detailed evidence and exhibit procedure | Requires authored rules for marking, foundation, authentication, acceptance/admission, limitation, exclusion, and permitted use. |
| Objections and courtroom procedural rules | Requires taxonomy, availability, authority, reasons, timing, remedies, and jurisdiction-specific content. |
| Canonical CourtRecord model | Requires entry families, scope representation, snapshot construction, correction, sealing/disclosure, and storage-independent identity rules. |
| Credibility and testimony adjudication inputs | Must integrate allowed record, contradictions, criteria, judge interpretation, and explanation without creating a truth oracle. |
| Judgment and conclusion lifecycle | Must distinguish hearing completion, procedural closure, judgment readiness, findings, disposition, judgment, and post-judgment effects. |
| Courtroom interaction and presentation UX | Must choose abstraction, pacing, accessibility, and visibility while preserving headless semantic equivalence. |

No final DEC number is assigned here.

## 25. Verification plan for later TEST-029

Do not repeat the prior 100-case long-form pattern. TEST-029 should optimize for semantic failure detection:

- approximately 20–30 detailed critical fixtures for high-risk transitions;
- approximately 15–20 focused boundary/attack fixtures;
- explicit inherited-boundary coverage for DEC-009, DEC-017/018, DEC-019–026, and DEC-029;
- a compact coverage matrix for lower-risk invariants;
- full `Fixture → Expected → Observed → Verdict` only for high-risk semantic transitions;
- no PASS based on invented doctrine, assumed implementation, or generic prose.

High-risk detailed fixtures should include:

1. multiple need-based hearings with written procedure between them;
2. optional and reordered supplied phase contexts;
3. specialized events preserved under a common ordering envelope;
4. advocacy event without truth/JII/finding mutation;
5. judicial question without hidden-belief disclosure;
6. evidence presentation without admission or record entry;
7. supplied limited admission and partial-scope materialization;
8. objection, later ruling, and historical-event preservation;
9. DEC-029 examination embedded across interruption/resumption;
10. testimony materialization with complete provenance;
11. courtroom speech that is not eligible for evidentiary record materialization;
12. hearing completion without closure/readiness/judgment;
13. correction/withdrawal as append-only events;
14. settlement and later judgment without history rewrite;
15. reload stability for events, answers, rulings, and materialization;
16. player/NPC semantic equivalence without probability shortcut;
17. team ownership/reviewer/speaker separation;
18. authorized visibility without hidden witness, opponent, or judge state;
19. workload consumption and scheduling continuity;
20. attacks involving score, seniority, dramatic-event count, and canonical-best-action leakage.

TEST-029 should mark doctrine-dependent outcomes `TBD` or use explicit fixture-supplied rules. It must not claim to verify Korean courtroom procedure, admissibility law, credibility adjudication, UI, AI, or implementation.

## 26. Decision summary

### Inherited Accepted

- DEC-009 need-based procedural flow and independent completion/readiness/judgment states.
- ActualState, Case File, WorkProduct, CourtRecord, JII, and finding separation.
- Explicit filing/submission/reception/allowance and CourtRecord materialization gates.
- Typed evidence, statement, analysis, theory, drafting, Task, workload, and team provenance.
- DEC-029 preparation, plan, question, procedural result, answer, testimony, record, and finding chain.
- Append-only history, consumed snapshots, no hidden-state access, no truth laundering, and no reload reroll.

### Core Accepted candidates

- HOP1–HOP3, HOP5–HOP7, HOP9–HOP18, HOP20, HOP22–HOP24, HOP26–HOP38.
- Typed `ProceedingEvent` envelope with specialized event preservation.
- Explicit advocacy, judicial-question, evidence-presentation, ruling, interruption, and record-materialization events.
- CourtRecord materialization with source, scope, authority, and rule provenance.
- Player/NPC symmetry, workload integration, authorized visibility, and no universal courtroom score.

### Accepted candidates

- HOP4, HOP8, HOP19, HOP21, and HOP25.
- Extensible phase, turn, demonstrative, minimal ruling-state, and examination-context hooks whose exact legal content remains supplied/TBD.

### TBD

- All doctrine, canonical taxonomies/schemas, exact phase/turn rules, CourtRecord storage, credibility/adjudication, UI/AI, implementation, and balancing listed in §22.

### Forbidden

- Proceeding action → truth, JII, credibility, finding, or victory shortcut.
- Argument → evidence/fact and presentation → admission/record collapse.
- Objection → ruling and procedural ruling → substantive truth collapse.
- Rewriting/deleting history after exclusion, withdrawal, settlement, judgment, appeal, or remand.
- Hidden score, aura, best-action oracle, hidden-state feedback, or NPC probability bypass.
- Redefinition of DEC-029 witness objects or invention of Korean procedure.

## 27. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | Initial orchestration model for hearing lifecycle, participants, typed proceeding events, oral advocacy, judicial questioning, evidence presentation, procedural-ruling hooks, DEC-029 examination integration, explicit CourtRecord materialization, persistence, workload, visibility, and player/NPC symmetry. Defines HOP1–HOP38, 80 hard invariants, architecture attacks, future DEC boundaries, and a compact later TEST-029 strategy. |
