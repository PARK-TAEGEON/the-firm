# THE FIRM — Witness Interview and Statement Model

문서 ID: DEC-LITIGATION-022  
버전: v0.1 — Proposed / design review required  
상태: **Proposed / design review required**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 기준: `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `TEST-020_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `TEST-019_EVIDENCE_REVIEW.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `TEST-018_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`, `DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md`, `DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md`, `DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md`  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose / non-goals

이 문서는 discovered Person/contact가 explicit Interview Task로 이어지고, Interview에서 발생한 utterance, RecordedStatement, SourceAssertion 및 ProfessionalAnalysis가 provenance-bearing Case File knowledge로 들어가는 최소 semantic model을 제안한다.

```text
Discovered Person / Lead
→ Contact Attempt
→ Contact Result
→ Interview Task
→ Interview Event
→ Utterance / interview-source content
→ RecordedStatement
→ SourceAssertion
→ optional ProfessionalAnalysis
→ provenance-bearing Case File update
```

핵심 separation은 다음과 같다.

```text
person discovered
≠ witness role confirmed
≠ contacted
≠ interviewed
≠ statement obtained
≠ statement is true
```

이 문서는 exact psychology, memory, deception, cooperation, dialogue generation, credibility algorithm, Korean witness procedure, testimony/admission, UI, AI, schema 또는 Godot implementation을 확정하지 않는다.

## 2. Inherited hard boundaries

- `ActualStateRecord ≠ PersonKnowledge/Memory/Belief ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`.
- Investigation은 Person/Lead/contact/source-existence를 발견할 수 있지만 Interview나 Statement를 자동 생성하지 않는다.
- Interview가 새 Person/source를 언급하면 DEC-021의 Lead/acquisition chain으로 돌아간다.
- Acquired SourceMaterial은 DEC-020 Evidence Review 없이는 자동으로 extracted/analyzed되지 않는다.
- Utterance, RecordedStatement, SourceAssertion, ProfessionalAnalysis는 서로 분리되며 어느 것도 저장만으로 objective truth가 되지 않는다.
- Internal Interview Statement는 explicit valid procedural materialization 없이 CourtRecord/JII/ChoicePoint/finding/outcome을 변경하지 않는다.
- Direct/delegated Tasks는 같은 Task/WorkProduct ontology, materialized-event, no-reload-reroll, provenance/history rules를 사용한다.

## 3. Core epistemic model

Hidden world에는 Event X가 실제로 일어났을 수 있다. Person은 X를 정확히 알거나, 일부만 알거나, 잘못 기억하거나, 추론하거나, 다른 사람에게 들었거나, 의도적으로 다르게 말하거나, 답변을 거부할 수 있다. 따라서 다음은 hard boundary다.

```text
Witness says X ≠ Witness knows X ≠ X is true
RecordedStatement says X ≠ Person uttered X perfectly ≠ X is true
```

Interview system은 `ask witness → scan ActualStateRecord → reveal relevant truth`로 동작하지 않는다. Exact mental state를 canonical object로 확정하지 않더라도, future world-facing person semantics는 objective world truth 및 player-visible knowledge와 분리되어야 한다.

## 4. Required semantic layers

| Layer | Minimum meaning | Does not imply |
|---|---|---|
| Person | World/social entity known through valid discovery | Witness relevance, knowledge, truth |
| WitnessRole candidate | Case-relative potential source/contact relation | Usefulness, credibility, truthfulness |
| ContactAttempt/Result | Communication attempt and bounded result | Interview completion |
| Interview Task/Event | Explicit scoped interaction work | Statement or disclosure of all knowledge |
| Utterance/interview-source content | What was said or otherwise expressed in interaction | Objective truth |
| RecordedStatement | Provenance-bearing record/paraphrase/transcription of content | Perfect reproduction, truth |
| SourceAssertion | Statement-derived claim stored in Case File | Fact |
| ProfessionalAnalysis | Professional interpretation of statements/context | Objective credibility or truth |
| Court testimony/record | Separately materialized procedural content | CourtFactFinding |

No folder, UI card, seniority, capability, cooperation state or confidence label collapses these layers.

## 5. Person, witness role and contact

A Person may become potentially relevant because a source mentions them, another person identifies them, they may possess records, they may have participated in an event, or a player-authored hypothesis suggests they know something. This creates a case-relative potential witness/contact relation, not a verified witness truth state.

Possible Contact Results include no response, refusal, agreed to speak, requested later contact, unavailable, wrong person, or successful contact without an Interview. `contact success ≠ interview completed`.

## 6. Interview TaskDefinition and scope

Illustrative `InterviewTaskDefinition` semantics:

```text
InterviewTaskDefinition
├─ purpose and target Person
├─ contact / Lead basis
├─ eligible performer roles
├─ authorized Case File snapshot
├─ topics / questions / issue focus
├─ time, location/channel and resources
├─ dependencies and direction
├─ capability contribution refs
└─ expected WorkProduct types / completion semantics
```

An Interview may be broad, but its purpose/context remains bounded. It does not automatically download everything a Person might know. `Ask W3 about the March 14 meeting`, `clarify authorship of E17`, and `explore the payment-approval process` are valid illustrative scopes. Canonical schema and catalog remain TBD; there is no universal `InterviewDifficulty`.

## 7. PersonKnowledge / Memory / Belief interface boundary

Future content may need a world-facing interface that constrains what a Person can communicate. If introduced, it must satisfy:

```text
PersonKnowledgeState ≠ ActualStateRecord
Person belief/memory ≠ objective truth
PersonKnowledgeState ≠ player-visible Case File
```

The interface may distinguish learned/observed/believed/remembered/inferred information, but DEC-022 does not canonicalize a psychology model. It exists only as a boundary candidate preventing omniscient witness queries. A Person cannot communicate hidden documents never seen, events never observed or learned, unknown actors merely because the world contains them, judge outcomes, or hidden clue counts.

## 8. Questions, answers and incomplete disclosure

Question actions may later include open questions, focused factual questions, clarification, contradiction challenge, document confrontation and follow-up. Exact taxonomy/UI is TBD.

```text
question asked ≠ answer obtained
Person knows X ≠ Interview reveals X
Person does not know X → interviewer cannot conjure X
```

Valid structured outcomes include refusal, no recollection, declined topic, ambiguity, partial answer and terminated Interview. No answer does not establish a negative fact. An Interview may miss known information because the question was not asked, scope/time was insufficient, the Person refused/forgot/withheld, follow-up was missed, or context/dependency was missing.

## 9. Utterance, RecordedStatement and analysis

DEC-020's SourceMaterial/RecordedExtraction lesson is inherited as a three-layer boundary:

```text
Utterance / interview-source content
≠ RecordedStatement
≠ ProfessionalAnalysis
```

Example:

```text
Utterance:
"I arrived around four."

RecordedStatement RS-1:
"Witness arrived at 4:00 PM."

ProfessionalAnalysis PA-1:
"Witness places himself at the scene before the meeting."
```

RS-1 may be an incomplete or context-limited paraphrase. It does not rewrite the utterance or become objective truth.

### 9.1 Mistaken RecordedStatement

```text
Utterance:
"I arrived around four."

RecordedStatement RS-2:
"I arrived at three."
```

RS-2 is a provenance-bearing fallible record. The original interview-source content remains unchanged. Later correction/re-review may challenge or supersede the current projection while RS-2 and analyses/strategy that relied on it remain historical. Exact transcription-error frequency and correction workflow are TBD.

## 10. Statement and SourceAssertion

A statement may generate a Case File SourceAssertion such as `W3 states that W3 saw P7 leave the office`. It must not become `P7 objectively left the office`. Person, Statement, SourceAssertion and world fact remain separate.

One Person may provide S1 at T1, S2 at T2 and S3 at T3. Each preserves Interview source, time, interviewer, context, topics, qualifications, version and provenance. Later clarification, correction, retraction, contradiction, expansion or qualification never silently rewrites an earlier Statement.

## 11. Contradiction, falsity and deception

If S1 says arrival at 3 and S2 says arrival at 4, an inconsistency candidate may be created. This does not establish which statement is false or whether either was deliberately deceptive.

```text
contradiction ≠ deception
false statement ≠ deliberate lie
interviewer suspicion ≠ confirmed deception
objective falsity ≠ player-known falsity ≠ deliberate deception
```

Exact deception intent, memory accuracy and lie-detection systems remain TBD. ActualStateRecord must not silently reveal falsity or intent to the player/firm.

## 12. Uncertainty, refusal and cooperation

Expressions such as `I think`, `I do not remember`, `maybe`, and `around four` retain uncertainty/qualification where relevant. They are not normalized into exact facts. Refusal/non-answer/partial response/termination are valid outcomes, not negative factual propositions.

Cooperation may be full, partial, delayed, selective or refused. Cooperation is an interaction condition, not truthfulness or credibility.

### 12.1 Witness relationship and bias boundary

A Person may have provenance-bearing relations to a party, organization, event or another witness. Depending on origin, such a relation may be source content, assertion, observable status or ProfessionalAnalysis. Relationship existence does not automatically establish bias, motive, falsity or credibility. A possible bias link remains a contextual analysis candidate unless a separate valid source/rule establishes a narrower status. Exact witness-relationship and bias taxonomy remains TBD and does not reuse LegalProfessional relationships as an automatic witness modifier.

## 13. Interview preparation and document confrontation

Interview may use authorized Case File material, for example an E12/S3 inconsistency from Evidence Review. The interviewer may show acquired/authorized E12 and ask about the discrepancy. Recognition, denial, clarification, uncertainty, a new Lead or new Statement may result, but showing a document does not force truth or disclosure. Hidden Case File/world context is unavailable.

## 14. Capability contribution

Illustrative components include:

```text
interview preparation → topic/question coverage
factual analysis → follow-up recognition
contradiction tracking → inconsistency questioning
communication/interview skill → interaction component
domain knowledge → specialist clarification
```

These are not a universal `InterviewSkill`, `InterviewScore`, weighted sum, highest-stat shortcut, weakest-link shortcut or truth-extraction percentage. Aggressive style does not grant a truth bonus. Exact mappings and response mechanics remain task-specific/TBD.

## 15. Interview-generated Lead and source existence

If W3 says `Ask P8`, the Statement may produce a provenance-bearing P8 Lead that returns to DEC-021. P8 is not automatically contacted/interviewed. If W3 says a spreadsheet existed, this may generate a source-existence Lead/KnownGap, not the spreadsheet or its contents. Acquisition follows DEC-021, and subsequent source analysis follows DEC-020.

```text
Interview Statement
→ Lead / source-existence candidate
→ Investigation Task candidate
→ acquisition, if separately resolved
→ Evidence Review Task
```

## 16. Interview record, WorkProduct and provenance

An InterviewRecord may represent the broader interaction history while Statements represent provenance-bearing recorded assertions/components. Exact object split is TBD, but `interview occurred → one timeless Statement blob` is forbidden.

Illustrative reference model:

```text
InterviewWorkProduct
├─ Task / assignment / performer/profile refs
├─ Person / target and purpose/topic/question refs
├─ authorized context and shown-source refs
├─ Contact / InterviewEvent refs
├─ utterance / interview-source refs
├─ RecordedStatements
├─ refusals / non-answers / uncertainty
├─ new Leads / source-existence refs
├─ contradiction / clarification candidates
├─ limitations and follow-up Task candidates
└─ provenance / version / history
```

No universal `InterviewQuality` owns semantics.

## 17. Direct/delegated execution and materialized events

Player-direct and delegated Interview use the same TaskDefinition, authorized context, questions/actions, interaction events and WorkProduct ontology. Delegation is not `83% truth extracted`.

Where future mechanics allow consequential borderline interaction outcomes, the result materializes once as an immutable event such as `ContactResponseEvent`, `InterviewResponseEvent` or `CooperationEvent`. Same resolved inputs/event history produce the same semantic result; reload does not reroll. A later attempt is a new Task/event. Exact event taxonomy/probability remains TBD.

## 18. Court boundary

```text
Internal Interview Statement
≠ filed statement
≠ testimony
≠ allowed CourtRecord
≠ CourtFactFinding
```

Interview content may inform later preparation, drafting or procedural Tasks, but it does not directly modify JII, ChoicePoint, credibility, finding, judge favorability or outcome. Actual Korean testimony/admission rules are TBD.

## 19. Design decisions

### WIT1 — Explicit Person/Witness/Interview/Statement stages

**Problem:** Person discovery부터 Statement까지 one state로 처리할 것인가?  
**Alternatives:** collapsed witness object; explicit stages.  
**Failure modes:** collapsed state creates testimony on discovery.  
**Recommendation:** Person, role candidate, contact, Interview, content and Statement를 separate refs/states로 둔다.  
**Status:** **Core Accepted candidate**  
**Reason:** provenance와 authorization을 보존한다.

### WIT2 — Person ≠ WitnessRole

**Problem:** discovered Person이 자동 witness인가?  
**Alternatives:** automatic role; case-relative potential relation.  
**Failure modes:** relevance/usefulness/truthfulness가 사전 확정된다.  
**Recommendation:** WitnessRole/potential relevance를 separate relation으로 둔다.  
**Status:** **Core Accepted candidate**  
**Reason:** persons may be irrelevant, wrong, unavailable or record holders only.

### WIT3 — Contact ≠ Interview

**Problem:** communication success가 Interview completion인가?  
**Alternatives:** collapse; separate contact and Interview.  
**Failure modes:** consent, timing, refusal and scope disappear.  
**Recommendation:** ContactAttempt/Result and Interview Task/Event를 separate한다.  
**Status:** **Core Accepted candidate**  
**Reason:** meaningful interaction stages.

### WIT4 — Interview as explicit Task/Event

**Problem:** Interview를 free implicit query로 둘 것인가?  
**Alternatives:** implicit query; explicit Task/Event.  
**Failure modes:** performer, context, scope, time and history vanish.  
**Recommendation:** explicit Interview Task/Event and WorkProduct를 require한다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018 semantics reuse.

### WIT5 — No ActualStateRecord truth query

**Problem:** witness answer를 hidden truth lookup으로 만들 것인가?  
**Alternatives:** world truth query; bounded person-facing semantics.  
**Failure modes:** witness becomes truth oracle.  
**Recommendation:** Interview execution의 ActualStateRecord query를 금지한다.  
**Status:** **Core Accepted candidate**  
**Reason:** world truth, person knowledge and firm knowledge must differ.

### WIT6 — PersonKnowledge/Memory ≠ ActualStateRecord

**Problem:** future PersonKnowledge interface가 world truth와 같은가?  
**Alternatives:** identical; separate fallible epistemic state; no canonical object yet.  
**Failure modes:** memory/belief becomes omniscience or tests invent psychology.  
**Recommendation:** if introduced, it is separate and fallible; exact representation remains TBD.  
**Status:** **Core Accepted candidate**  
**Reason:** minimal boundary without over-design.

### WIT7 — Person knows X ≠ Interview reveals X

**Problem:** known information이 자동 utterance인가?  
**Alternatives:** automatic dump; question/context/cooperation-gated disclosure.  
**Failure modes:** scope and choices become cosmetic.  
**Recommendation:** knowledge never guarantees disclosure.  
**Status:** **Core Accepted candidate**  
**Reason:** Interviews may miss known content.

### WIT8 — No person-unknown revelation

**Problem:** high capability가 uninformed Person에서 truth를 추출할 수 있는가?  
**Alternatives:** truth conjuring; no.  
**Failure modes:** Interview bypasses Investigation/world knowledge.  
**Recommendation:** Person's legitimate epistemic boundary 밖의 fact를 generate하지 않는다.  
**Status:** **Core Accepted candidate**  
**Reason:** no hidden-state creation.

### WIT9 — Utterance/source content ≠ RecordedStatement

**Problem:** recorded text가 actual utterance 자체인가?  
**Alternatives:** identity/overwrite; separate record layer.  
**Failure modes:** paraphrase/error/history cannot be represented.  
**Recommendation:** RecordedStatement를 separate provenance-bearing layer로 둔다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-020 extraction lesson applies.

### WIT10 — RecordedStatement ≠ ProfessionalAnalysis

**Problem:** recording과 interpretation을 합칠 것인가?  
**Alternatives:** one object; separate statement and analysis.  
**Failure modes:** literal content and lawyer meaning collapse.  
**Recommendation:** keep separate refs and provenance.  
**Status:** **Core Accepted candidate**  
**Reason:** explainable downstream reasoning.

### WIT11 — RecordedStatement may be mistaken

**Problem:** transcription/paraphrase가 infallible한가?  
**Alternatives:** infallible identity; fallible record.  
**Failure modes:** mistaken recording cannot exist without rewriting source content.  
**Recommendation:** allow fallible RecordedStatement without altering utterance.  
**Status:** **Core Accepted candidate**  
**Reason:** normal error/history state.

### WIT12 — Statement/SourceAssertion ≠ truth

**Problem:** witness claim이 objective fact인가?  
**Alternatives:** truth promotion; provenance-bearing assertion.  
**Failure modes:** witness becomes oracle.  
**Recommendation:** Statement generates assertion, never automatic truth.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-019 epistemic boundary.

### WIT13 — Multiple Statements distinct

**Problem:** one Person's accounts를 timeless blob으로 합칠 것인가?  
**Alternatives:** merge; separate statements.  
**Failure modes:** context/change/contradiction disappear.  
**Recommendation:** each Statement preserves its Interview/time/context.  
**Status:** **Core Accepted candidate**  
**Reason:** historical comparability.

### WIT14 — Changed Statements preserve history

**Problem:** later correction이 earlier Statement를 overwrite하는가?  
**Alternatives:** overwrite; lineage.  
**Failure modes:** past strategy becomes inexplicable.  
**Recommendation:** correction/retraction/qualification creates linked later state.  
**Status:** **Core Accepted candidate**  
**Reason:** immutable provenance.

### WIT15 — Contradiction ≠ deception

**Problem:** inconsistent statements가 lie를 확정하는가?  
**Alternatives:** automatic lie; inconsistency candidate only.  
**Failure modes:** memory/error/context are erased.  
**Recommendation:** contradiction is separate analysis/relation.  
**Status:** **Core Accepted candidate**  
**Reason:** intent is not observable from inconsistency alone.

### WIT16 — False Statement ≠ deliberate lie

**Problem:** objective falsity가 intent를 확정하는가?  
**Alternatives:** yes; separate falsity/known falsity/deception.  
**Failure modes:** ActualStateRecord leaks psychology.  
**Recommendation:** keep three concepts separate.  
**Status:** **Core Accepted candidate**  
**Reason:** deception requires distinct future semantics.

### WIT17 — Preserve uncertainty/qualification

**Problem:** approximate/qualified answer를 exact fact로 normalize할 것인가?  
**Alternatives:** normalize; preserve expression/status.  
**Failure modes:** false precision and truth laundering.  
**Recommendation:** relevant uncertainty and qualification remain attached.  
**Status:** **Core Accepted candidate**  
**Reason:** statement meaning depends on qualification.

### WIT18 — Structured refusal/non-answer

**Problem:** unanswered question을 empty failure 또는 negative fact로 볼 것인가?  
**Alternatives:** discard/infer no; structured outcome.  
**Failure modes:** silence gains factual meaning.  
**Recommendation:** refusal/no recollection/partial/termination are explicit outcomes.  
**Status:** **Core Accepted candidate**  
**Reason:** action/result trace.

### WIT19 — Asked ≠ answered

**Problem:** question action이 answer를 guarantee하는가?  
**Alternatives:** yes; separate asked/result.  
**Failure modes:** interaction choice has no risk or cooperation boundary.  
**Recommendation:** question and response are separate event components.  
**Status:** **Core Accepted candidate**  
**Reason:** refusal/ambiguity remain possible.

### WIT20 — Interview may miss known information

**Problem:** Interview가 all relevant person knowledge를 extracts하는가?  
**Alternatives:** exhaustive dump; partial elicitation.  
**Failure modes:** scope/time/questions become cosmetic.  
**Recommendation:** missing/unevoked known content is valid.  
**Status:** **Accepted candidate**  
**Reason:** exact miss mechanics can remain TBD.

### WIT21 — Capability ≠ truth extraction

**Problem:** skill이 truthful disclosure bonus인가?  
**Alternatives:** direct bonus; component contribution only.  
**Failure modes:** elite interviewer becomes truth scanner.  
**Recommendation:** capability affects explicit components/actions only.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-017/018 boundary.

### WIT22 — No universal InterviewScore

**Problem:** Interview result를 one number로 표현할 것인가?  
**Alternatives:** score; structured WorkProduct.  
**Failure modes:** scope/refusal/statements/gaps disappear.  
**Recommendation:** no canonical universal score.  
**Status:** **Core Accepted candidate**  
**Reason:** components are semantically distinct.

### WIT23 — No hidden weighted sum

**Problem:** capability weights가 disclosure/truth probability를 만드는가?  
**Alternatives:** weighted sum; task-specific components.  
**Failure modes:** qualitative profiles collapse into hidden power.  
**Recommendation:** reject default weighted formula.  
**Status:** **Core Accepted candidate**  
**Reason:** preserves capability scope/context.

### WIT24 — Authorized Case File context only

**Problem:** Interview preparation이 hidden world data를 읽을 수 있는가?  
**Alternatives:** omniscient context; authorized snapshot only.  
**Failure modes:** questions leak answer key.  
**Recommendation:** restrict to authorized known sources/analyses.  
**Status:** **Core Accepted candidate**  
**Reason:** firm epistemic boundary.

### WIT25 — Document confrontation does not force truth

**Problem:** source를 제시하면 truthful answer가 guaranteed인가?  
**Alternatives:** forced truth; explicit response semantics.  
**Failure modes:** cooperation/memory/interpretation collapse.  
**Recommendation:** confrontation permits responses, not truth guarantee.  
**Status:** **Core Accepted candidate**  
**Reason:** document and statement remain claims.

### WIT26 — Interview may generate Lead

**Problem:** newly mentioned person/ref가 어떻게 이어지는가?  
**Alternatives:** auto-acquire/interview; provenance-bearing Lead.  
**Failure modes:** Investigation boundary bypass.  
**Recommendation:** create Lead/follow-up Task candidate.  
**Status:** **Accepted candidate**  
**Reason:** returns to DEC-021 chain.

### WIT27 — Mentioned source ≠ acquired source

**Problem:** source mention이 possession인가?  
**Alternatives:** auto-create SourceMaterial; source-existence Lead/Gap.  
**Failure modes:** unavailable content appears.  
**Recommendation:** acquisition requires DEC-021 action/result.  
**Status:** **Core Accepted candidate**  
**Reason:** discovery ≠ acquisition.

### WIT28 — Statement provenance/history

**Problem:** Statement가 context-free text인가?  
**Alternatives:** blob; Person/Interview/interviewer/time/topic/source/version refs.  
**Failure modes:** source and changes cannot be audited.  
**Recommendation:** provenance/history are required semantic capabilities.  
**Status:** **Core Accepted candidate**  
**Reason:** Case File traceability.

### WIT29 — RecordedStatement correction preserves history

**Problem:** mistaken recording을 in-place fix할 것인가?  
**Alternatives:** overwrite; linked correction/re-review.  
**Failure modes:** prior analysis/strategy provenance breaks.  
**Recommendation:** preserve old record and correction lineage.  
**Status:** **Core Accepted candidate**  
**Reason:** immutable historical explanation.

### WIT30 — Credibility analysis ≠ objective credibility

**Problem:** reviewer assessment가 witness truth score인가?  
**Alternatives:** canonical credibility; structured ProfessionalAnalysis.  
**Failure modes:** analysis becomes truth and judge assessment leaks upstream.  
**Recommendation:** credibility-related observations remain analysis with provenance.  
**Status:** **Core Accepted candidate**  
**Reason:** Court evaluation remains downstream.

### WIT31 — Cooperation ≠ truth/credibility

**Problem:** cooperative behavior가 reliability를 prove하는가?  
**Alternatives:** direct implication; separate interaction state.  
**Failure modes:** demeanor shortcut replaces evidence.  
**Recommendation:** cooperation is neither truth nor credibility authority.  
**Status:** **Core Accepted candidate**  
**Reason:** behavior and content are distinct.

### WIT32 — Direct/delegated same ontology

**Problem:** NPC Interview가 hidden success percentage를 쓰는가?  
**Alternatives:** separate engine; shared Task/WorkProduct semantics.  
**Failure modes:** delegated path gains omniscience.  
**Recommendation:** use one ontology with different explicit execution inputs.  
**Status:** **Core Accepted candidate**  
**Reason:** solo-to-firm continuity.

### WIT33 — Materialized uncertainty/no reroll

**Problem:** borderline response가 reload마다 바뀌는가?  
**Alternatives:** reroll; materialized event.  
**Failure modes:** save-scumming and unstable history.  
**Recommendation:** consequential variation materializes once; retries are new Tasks/events.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018 determinism boundary.

### WIT34 — Internal Statement ≠ CourtRecord/testimony

**Problem:** Interview record가 자동 judicial input인가?  
**Alternatives:** auto-entry; explicit procedural path.  
**Failure modes:** internal work bypasses filing/testimony/admission.  
**Recommendation:** keep internal statement, filed statement, testimony and CourtRecord separate.  
**Status:** **Core Accepted candidate**  
**Reason:** litigation non-interference.

### WIT35 — No direct JII/finding effect

**Problem:** Interview result가 judge/finding을 직접 수정하는가?  
**Alternatives:** direct bonus; WorkProduct/procedural chain only.  
**Failure modes:** capability/statement becomes outcome modifier.  
**Recommendation:** prohibit direct JII, CP, credibility, finding or outcome mutation.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-013/014 inherited boundary.

## 20. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | Person discovered ≠ witness confirmed | **Core Accepted candidate** |
| 2 | Witness/contact relation ≠ relevance, usefulness or truth | **Core Accepted candidate** |
| 3 | Contact ≠ Interview | **Core Accepted candidate** |
| 4 | Interview requires explicit Task/Event | **Core Accepted candidate** |
| 5 | Interview cannot query ActualStateRecord as truth API | **Core Accepted candidate** |
| 6 | PersonKnowledge/Memory/Belief ≠ objective world truth | **Core Accepted candidate** |
| 7 | Person epistemic state is not automatically player-visible | **Core Accepted candidate** |
| 8 | Person knows X ≠ Interview reveals X | **Core Accepted candidate** |
| 9 | Uninformed Person cannot yield hidden X through capability | **Core Accepted candidate** |
| 10 | Interview scope/context is bounded | **Core Accepted candidate** |
| 11 | Asked ≠ answered | **Core Accepted candidate** |
| 12 | Refusal is a valid structured result | **Core Accepted candidate** |
| 13 | Non-answer/no recollection is valid and not a negative fact | **Core Accepted candidate** |
| 14 | Uncertainty/qualification is preserved | **Core Accepted candidate** |
| 15 | Utterance/interview-source content ≠ RecordedStatement | **Core Accepted candidate** |
| 16 | RecordedStatement may be mistaken | **Core Accepted candidate** |
| 17 | Mistaken record never rewrites utterance/source content | **Core Accepted candidate** |
| 18 | RecordedStatement ≠ ProfessionalAnalysis | **Core Accepted candidate** |
| 19 | Statement ≠ truth | **Core Accepted candidate** |
| 20 | SourceAssertion ≠ truth | **Core Accepted candidate** |
| 21 | Multiple Statements remain distinct | **Core Accepted candidate** |
| 22 | Later Statement/correction does not rewrite earlier history | **Core Accepted candidate** |
| 23 | Contradiction ≠ deception | **Core Accepted candidate** |
| 24 | False statement ≠ deliberate lie | **Core Accepted candidate** |
| 25 | Interviewer suspicion ≠ confirmed deception | **Core Accepted candidate** |
| 26 | Interview may miss information known by Person | **Accepted candidate** |
| 27 | Capability does not guarantee disclosure or truth | **Core Accepted candidate** |
| 28 | No universal InterviewScore/InterviewQuality | **Core Accepted candidate** |
| 29 | No hidden weighted capability formula | **Core Accepted candidate** |
| 30 | Interview uses authorized known context only | **Core Accepted candidate** |
| 31 | Document confrontation does not force truthful response | **Core Accepted candidate** |
| 32 | Interview-generated Lead ≠ truth/source/Statement | **Core Accepted candidate** |
| 33 | Mentioned source ≠ acquired SourceMaterial | **Core Accepted candidate** |
| 34 | New source acquisition returns to DEC-021 | **Core Accepted candidate** |
| 35 | Acquired source review returns to DEC-020 | **Core Accepted candidate** |
| 36 | Credibility analysis ≠ objective credibility | **Core Accepted candidate** |
| 37 | Cooperation ≠ credibility/truth | **Core Accepted candidate** |
| 38 | Direct/delegated Interviews use the same ontology | **Core Accepted candidate** |
| 39 | Materialized interaction outcome does not reroll | **Core Accepted candidate** |
| 40 | Statement/provenance/version history is preserved | **Core Accepted candidate** |
| 41 | Internal Interview Statement ≠ CourtRecord/testimony | **Core Accepted candidate** |
| 42 | Interview does not directly modify JII/finding | **Core Accepted candidate** |
| 43 | Witness cannot expose hidden clue count/ranking | **Core Accepted candidate** |
| 44 | Witness cannot expose unrelated unknown unknowns | **Core Accepted candidate** |

## 21. Pressure-test examples

All examples are synthetic semantic fixtures. They test boundaries, not implementation, psychology or Korean law.

### Case 1 — Person discovered

**Fixture:** P7 discovered through DEC-021 Investigation.  
**Allowed:** Person/Lead/provenance.  
**Forbidden:** Witness confirmation, Interview or Statement.  
**Expected:** discovery stage only.

### Case 2 — Potential witness designation

**Fixture:** Player marks P7 potentially relevant.  
**Allowed:** case-relative role/relevance candidate.  
**Forbidden:** useful/credible/truthful witness status.  
**Expected:** candidate only.

### Case 3 — Contact failure

**Fixture:** ContactAttempt receives no response.  
**Allowed:** bounded no-response result/time/history.  
**Forbidden:** Interview or negative factual inference.  
**Expected:** structured failure.

### Case 4 — Contact success

**Fixture:** P7 agrees to speak later.  
**Allowed:** successful contact result.  
**Forbidden:** completed Interview/Statement.  
**Expected:** contact only.

### Case 5 — Interview begins

**Fixture:** Explicit Interview Task/Event with target, purpose, authorized context and scope.  
**Allowed:** questions/actions under supplied context.  
**Forbidden:** unbounded knowledge dump.  
**Expected:** valid Interview execution basis.

### Case 6 — Person knows X and says X

**Fixture:** Person's legitimate epistemic state includes X and an Interview utterance asserts X.  
**Allowed:** Utterance, RecordedStatement and SourceAssertion with provenance.  
**Forbidden:** X becomes objective truth.  
**Expected:** Statement/Assertion X only.

### Case 7 — Person knows X but does not mention X

**Fixture:** X is within Person knowledge but no utterance reveals it.  
**Allowed:** no Case File addition for X.  
**Forbidden:** automatic extraction of all knowledge.  
**Expected:** X remains unrevealed.

### Case 8 — Question not asked about X

**Fixture:** Interview scope/questions never address known X.  
**Allowed:** completed covered topics and unasked gap if known from plan.  
**Forbidden:** X auto-disclosure.  
**Expected:** X remains unrevealed.

### Case 9 — Person does not know X

**Fixture:** Exceptional interviewer asks an uninformed Person about X.  
**Allowed:** refusal, uncertainty or no-knowledge response under future rules.  
**Forbidden:** hidden truth X generated.  
**Expected:** no conjured information.

### Case 10 — Mistaken memory

**Fixture:** Person remembers and states the wrong date.  
**Allowed:** fallible Statement with uncertainty/context.  
**Forbidden:** statement corrected from ActualStateRecord or truth-promoted.  
**Expected:** mistaken account is a valid epistemic state.

### Case 11 — Person uncertain

**Fixture:** `Around four, I think.`  
**Allowed:** qualified Statement.  
**Forbidden:** exact 4:00 fact.  
**Expected:** uncertainty preserved.

### Case 12 — RecordedStatement paraphrase

**Fixture:** Utterance `around four`; RS says `approximately 4 PM`.  
**Allowed:** provenance-bearing paraphrase if distinction/context retained.  
**Forbidden:** RS treated as identical objective source/truth.  
**Expected:** potentially valid separate representation.

### Case 13 — Mistaken RecordedStatement

**Fixture:** Utterance says 4; RS records 3.  
**Allowed:** fallible RS and later correction lineage.  
**Forbidden:** rewrite utterance or erase old RS.  
**Expected:** distinct historical layers.

### Case 14 — ProfessionalAnalysis

**Fixture:** Lawyer infers that timing places P7 before meeting.  
**Allowed:** PA based on Statement/source refs.  
**Forbidden:** analysis becomes fact/credibility.  
**Expected:** analysis separate.

### Case 15 — Statement truth laundering

**Fixture:** Witness says X; system marks X true.  
**Allowed:** SourceAssertion X.  
**Forbidden:** objective fact promotion.  
**Expected:** attack rejected.

### Case 16 — Multiple Statements

**Fixture:** S1 at T1 and S2 at T2.  
**Allowed:** distinct Statement objects/refs.  
**Forbidden:** timeless merged testimony blob.  
**Expected:** contexts preserved.

### Case 17 — Statement correction

**Fixture:** S2 corrects S1.  
**Allowed:** correction/supersession relation and current projection.  
**Forbidden:** delete/rewrite S1.  
**Expected:** lineage preserved.

### Case 18 — Statement contradiction

**Fixture:** S1 says 3; S2 says 4.  
**Allowed:** inconsistency candidate with provenance.  
**Forbidden:** lie or objective winner.  
**Expected:** contradiction only.

### Case 19 — Lie inference attack

**Fixture:** System converts inconsistency into `Witness lied`.  
**Allowed:** ProfessionalAnalysis may suspect deception.  
**Forbidden:** confirmed intent without separate semantics/evidence.  
**Expected:** attack rejected.

### Case 20 — False Statement without intent

**Fixture:** Person is honestly mistaken and says false X.  
**Allowed:** false content as hidden world relation and Statement X; firm need not know falsity.  
**Forbidden:** automatic deliberate-lie flag.  
**Expected:** falsity and intent separate.

### Case 21 — Refusal

**Fixture:** Person refuses a question.  
**Allowed:** refused-question result.  
**Forbidden:** infer requested proposition false.  
**Expected:** structured refusal.

### Case 22 — No recollection

**Fixture:** Person says `I do not remember`.  
**Allowed:** no-recollection response.  
**Forbidden:** negative world fact.  
**Expected:** epistemic limitation only.

### Case 23 — Partial answer

**Fixture:** Person answers only one part of a multipart topic.  
**Allowed:** partial coverage and unanswered scope.  
**Forbidden:** full completion.  
**Expected:** structured partial result.

### Case 24 — Interview terminated

**Fixture:** Interview ends before remaining topics.  
**Allowed:** stop reason, covered/uncovered scope, history.  
**Forbidden:** unasked topics treated as answered.  
**Expected:** bounded incomplete output.

### Case 25 — Document confrontation

**Fixture:** Authorized E12 shown to W3 with discrepancy question.  
**Allowed:** recognition, denial, clarification, uncertainty, Lead or Statement.  
**Forbidden:** forced truth/confession.  
**Expected:** response remains fallible and task-specific.

### Case 26 — New Person Lead

**Fixture:** W3 says `Ask P8`.  
**Allowed:** P8 Lead with Statement provenance.  
**Forbidden:** P8 auto-contact/interview/testimony.  
**Expected:** return to Investigation.

### Case 27 — New document Lead

**Fixture:** W3 mentions spreadsheet D9.  
**Allowed:** source-existence Lead/KnownGap.  
**Forbidden:** D9 content/acquisition.  
**Expected:** discovery candidate only.

### Case 28 — Auto-acquisition attack

**Fixture:** D9 mention makes D9 appear acquired.  
**Allowed:** DEC-021 acquisition Task candidate.  
**Forbidden:** source creation/possession.  
**Expected:** attack rejected.

### Case 29 — Auto-review attack

**Fixture:** D9 is later acquired; witness system instantly interprets it.  
**Allowed:** D9 acquired/unreviewed.  
**Forbidden:** RecordedExtraction/analysis without DEC-020 Review.  
**Expected:** attack rejected.

### Case 30 — Witness omniscience attack

**Fixture:** W3 reveals unrelated hidden W99 without personal knowledge path.  
**Allowed:** only legitimate Person epistemic content.  
**Forbidden:** ActualStateRecord/unknown-unknown query.  
**Expected:** W99 remains hidden.

### Case 31 — Exceptional interviewer

**Fixture:** High-capability interviewer questions uninformed Person.  
**Allowed:** component-based execution.  
**Forbidden:** truth conjuring or disclosure guarantee.  
**Expected:** no hidden X.

### Case 32 — Limited time

**Fixture:** Interview ends before all topics/questions are covered.  
**Allowed:** covered/uncovered scope and limitations.  
**Forbidden:** capability downgrade or full completion.  
**Expected:** incomplete WorkProduct possible.

### Case 33 — Direct player Interview

**Fixture:** Player selects questions, order, shown documents and stop point.  
**Allowed:** explicit Task/actions in common ontology.  
**Forbidden:** player truth shortcut.  
**Expected:** same semantic families as delegated work.

### Case 34 — Delegated Interview

**Fixture:** Associate receives same TaskDefinition/context/direction.  
**Allowed:** common InterviewWorkProduct ontology.  
**Forbidden:** hidden truth-extraction percentage.  
**Expected:** semantic equivalence.

### Case 35 — Credibility score attack

**Fixture:** `WitnessCredibility = 82` is proposed as canonical truth authority.  
**Allowed:** structured observations/ProfessionalAnalysis.  
**Forbidden:** score determines truth or judge belief.  
**Expected:** invalid abstraction.

### Case 36 — Cooperation equals truth attack

**Fixture:** Highly cooperative witness is assumed truthful.  
**Allowed:** cooperation state and separate content analysis.  
**Forbidden:** credibility/truth promotion.  
**Expected:** attack rejected.

### Case 37 — Statement to CourtRecord attack

**Fixture:** Internal RS/S directly feeds judge.  
**Allowed:** future explicit procedural Task/materialization.  
**Forbidden:** automatic CourtRecord/JII/finding.  
**Expected:** attack rejected.

### Case 38 — Reload reroll

**Fixture:** Materialized response changes after reload.  
**Allowed:** reuse existing event; later new Task/event.  
**Forbidden:** same-state reroll.  
**Expected:** stable result.

### Case 39 — Hidden clue count through witness

**Fixture:** UI says witness has three unrevealed facts.  
**Allowed:** known unanswered topics/gaps only.  
**Forbidden:** hidden knowledge count/list.  
**Expected:** attack rejected.

### Case 40 — Question not asked / hidden answer

**Fixture:** Person knows relevant Y but Interview never reaches Y.  
**Allowed:** Y remains in non-player-visible Person state if modeled.  
**Forbidden:** automatic utterance/Case File update.  
**Expected:** Y remains unrevealed.

## 22. Additional attacks

| Attack | Required result |
|---|---|
| Person = truthful witness; potential witness = useful witness | **Forbidden** |
| Contacted = interviewed; Interview = timeless Statement blob | **Forbidden** |
| Statement/assertion = truth | **Forbidden** |
| Contradiction = lie; falsity = deception | **Forbidden** |
| Uncertainty normalized to exact fact | **Forbidden** |
| Refusal/non-answer = negative fact | **Forbidden** |
| Cooperation = credibility/truth | **Forbidden** |
| Capability/aggressive style = omniscience/truth bonus | **Forbidden** |
| Hidden PersonKnowledge or witness clue count exposed | **Forbidden** |
| Mention = acquisition; acquisition = review | **Forbidden** |
| Internal Statement = CourtRecord/finding | **Forbidden** |
| Correction deletes old Statement/record | **Forbidden** |
| Delegation uses hidden success percentage | **Forbidden** |

## 23. PersonKnowledge ambiguity audit

DEC-022 does not require a canonical PersonKnowledge object. If one is later introduced, `PersonKnowledge/Memory/Belief ≠ ActualStateRecord`, it is fallible, and it is not automatically player-visible. This boundary is sufficient to prevent witness truth-query behavior without inventing memory, deception or response-generation rules.

## 24. Utterance / RecordedStatement pressure test

For `Utterance: I arrived around four` and mistaken `RS: I arrived at 3:00 PM`, the utterance is unchanged, RS remains provenance-bearing and fallible, later correction may challenge/supersede its current projection, and old RS plus dependent analysis/strategy remain historical. Exact transcription probability/correction workflow is TBD.

## 25. Truth / deception pressure test

If S1 says X while hidden ActualStateRecord is not-X, the firm receives Statement X but does not automatically learn falsity. S2 conflicting with S1 permits an inconsistency candidate, not confirmed lie. `objective falsity ≠ player-known falsity ≠ deliberate deception`.

## 26. Interview-generated Investigation pressure test

`W3 says P8 has the spreadsheet → Statement → P8/source-existence Lead → Investigation Task candidate`. It does not automatically contact P8, acquire the spreadsheet or review its contents.

## 27. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Person ≠ WitnessRole | 1–2 | PASS candidate | Case-relative role only |
| Contact ≠ Interview | 3–5 | PASS candidate | Explicit Task/Event |
| No ActualStateRecord truth query | 6–10, 20, 30–31 | PASS candidate | Person-facing boundary |
| PersonKnowledge ≠ truth/player knowledge | 7–10, 30, 39–40, §23 | PASS candidate | Exact object TBD |
| Person knows X ≠ Interview reveals X | 7–9, 40 | PASS candidate | Questions/context matter |
| Uninformed Person cannot reveal X | 9, 31 | PASS candidate | No truth conjuring |
| Asked ≠ answered | 8, 21–24 | PASS candidate | Refusal/partial valid |
| Uncertainty preserved | 11–12, 22 | PASS candidate | No false precision |
| Utterance ≠ RecordedStatement | 12–13, §24 | PASS candidate | Fallible record layer |
| RecordedStatement ≠ ProfessionalAnalysis | 13–14 | PASS candidate | Meaning separated |
| RecordedStatement may be mistaken | 13, §24 | PASS candidate | Source not rewritten |
| Statement/Assertion ≠ truth | 6, 10, 15, 20 | PASS candidate | Epistemic object only |
| Multiple/later Statements preserve history | 16–18 | PASS candidate | No overwrite |
| Contradiction/falsity ≠ deception | 18–20, §25 | PASS candidate | Intent TBD |
| Refusal/non-answer ≠ negative fact | 21–24 | PASS candidate | Structured outcomes |
| Interview may miss known content | 7–8, 32, 40 | PASS candidate | Exact mechanics TBD |
| Capability ≠ truth extraction | 9, 31, 35 | PASS candidate | No score/weighted sum |
| Authorized context only | 5, 25, 30 | PASS candidate | No hidden prep |
| Confrontation does not force truth | 25 | PASS candidate | Response fallible |
| Interview Lead returns to Investigation | 26–28, §26 | PASS candidate | No auto-acquisition |
| Acquired source returns to Review | 29 | PASS candidate | No auto-analysis |
| Credibility/cooperation ≠ truth | 35–36 | PASS candidate | Analysis only |
| Direct/delegated same ontology | 33–34 | PASS candidate | No NPC percentage |
| Materialized outcome/no reroll | 38 | PASS candidate | New attempt = new Task |
| Internal Statement ≠ CourtRecord | 37 | PASS candidate | Procedure gate |
| No direct JII/finding | 37 | PASS candidate | Litigation non-interference |
| No hidden clue count | 30, 39–40 | PASS candidate | Unknowns not exposed |

## 28. False-PASS / False-PARTIAL audit

A PASS may rely only on WIT semantic separations, explicit fixture inputs and inherited Task/Case File/Investigation/Review boundaries. It must not invent witness knowledge, memory accuracy, deception state, cooperation, response probability, question effectiveness, transcription correctness, credibility formula, testimony law or admissibility. Exact psychology, dialogue, recording, credibility and Korean procedure being TBD is not PARTIAL by itself; PARTIAL is reserved for a genuine semantic ambiguity.

## 29. Explicit TBD

- PersonKnowledge/Memory/Belief representation and implementation.
- Witness relevance/role model and contact/cooperation behavior.
- Interview Task/question taxonomy, response generation, memory accuracy and deception intent.
- Recording/transcription/paraphrase mechanics and correction workflow.
- Capability contribution mapping, Interview depth/completion and materialized-event probabilities.
- Credibility, demeanor, bias and relationship semantics.
- Client/witness social system, NPC AI and player dialogue/UI/minigames.
- Investigation acquisition, Evidence Review, formal Statement/testimony and CourtRecord admission details.
- Actual Korean witness/procedural rules and role restrictions.
- Save/schema/API/Godot implementation, performance and balancing.

## 30. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Witness truth dispenser | Answers mirror ActualStateRecord | Epistemic gameplay collapses | Person-facing fallible state boundary |
| Interviewer truth scanner | Skill extracts any hidden fact | Capability becomes omniscience | Knowledge/scope/action gates |
| Every Person useful | All contacts know clues | Investigation choice becomes fake | Irrelevant/uninformed Persons valid |
| Every Interview progresses | No refusal/miss/dead end | No uncertainty or strategy | Structured incomplete outcomes |
| Contradiction means lying | Inconsistency fixes intent | Memory/context erased | Separate contradiction/falsity/deception |
| Credibility score authority | One number selects truth | Evidence structure disappears | Provenance-bearing observations/analysis |
| Cooperation means truth | Helpful behavior proves claims | Bias shortcut | Separate cooperation/content |
| Cosmetic questions | All knowledge dumps regardless | Player choice meaningless | Question/topic coverage as explicit input |
| Hidden clue counters | UI lists unrevealed facts | Unknown unknown leak | Known topics/gaps only |
| Dialogue explosion | Every utterance manually traversed | Unusable scale | Scoped Tasks/projections/delegation TBD |
| Repeated Interview farming | Same interaction rerolls content | Exploit/history instability | Materialized events/new Task cost |
| Reload reroll | Response changes on load | Save-scumming | Persist events |
| RecordedStatement overwrites utterance | Error changes source content | Provenance corruption | Separate fallible record layer |
| Statement auto-enters CourtRecord | Internal note becomes evidence | Procedure bypass | Explicit materialization |
| Witness system duplicates Investigation | Mention auto-finds/acquires source | Scope collapse | Lead returns to DEC-021 |
| Interview duplicates Evidence Review | Mentioned/acquired document auto-analyzed | DEC-020 bypass | Separate Review Task |

## 31. Player-facing principle

Player should see why a Person matters, contact/Interview status, asked questions, recorded content, uncertainty/refusal, Statement versions, contradiction/corroboration candidates and follow-up Leads. Player should not see what the Person secretly knows but has not revealed, hidden truthfulness/lie flags, remaining-fact count, objective credibility or future judge belief.

## 32. Solo → firm progression hook

```text
Solo → player conducts key Interviews
Associates → delegated routine/factual Interviews
Specialists/investigators → role-permitted factual interviewing
Larger firm → preparation, Interview, review and follow-up Tasks split among staff
Partner/player → critical witnesses and strategy
```

This is supported architecture, not mandatory progression. Exact Korean role restrictions are not asserted.

## 33. Suggested TEST-021 plan

Do not create the TEST here. Recommended file: `TEST-021_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md`, using at least the 40 pressure fixtures above with special focus on PersonKnowledge, mistaken RecordedStatement, falsity/deception, Investigation handoff and CourtRecord separation.

## 34. DEC-023 candidates

| Candidate | Prerequisite fit | Risk |
|---|---|---|
| Legal Research & Issue Analysis | Uses acquired/reviewed/asserted Case File knowledge and closes professional legal reasoning | Doctrine/content authoring boundary required |
| Case Theory / Evidence Synthesis | Integrates statements, evidence and analyses | May auto-resolve truth prematurely |
| Client Interaction / Information Provision | Extends Person/Statement/source-provision semantics | Broader relationship/social model dependency |
| Task Assignment / Workload / Team Coordination | Supports delegated Interview/review/investigation at scale | Better after more Task families exist |
| Witness Preparation / Court Examination | Continues witness lifecycle toward court | Depends on formal testimony/procedure details |

**Preferred next candidate:** `DEC-023 — Legal Research & Issue Analysis`. It consumes the now-separated Case File assertions, statements and analyses without requiring immediate commitment to courtroom testimony procedure. Final order remains a proposal if DEC-022 review reveals a stronger prerequisite.

## 35. Decision summary

### Inherited Accepted

| Boundary | Status |
|---|---|
| ActualStateRecord, CaseFileState, CourtRecord and CourtFactFinding separation | **Inherited Accepted** |
| Investigation discovery/contact/acquisition stage and Lead provenance | **Inherited Accepted** |
| Evidence Review, RecordedExtraction and source-analysis boundary | **Inherited Accepted** |
| Explicit Task/WorkProduct, capability, materialized-event and version history | **Inherited Accepted** |
| No direct JII/ChoicePoint/finding effect | **Inherited Accepted** |

### Core Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| WIT1–WIT19 | Person/contact/Interview/content/Statement/truth, history, uncertainty and response separation | **Core Accepted candidate** |
| WIT21–WIT25 | Capability/context/document-confrontation boundaries | **Core Accepted candidate** |
| WIT27–WIT35 | Acquisition, provenance, credibility, delegation, event and court boundaries | **Core Accepted candidate** |

### Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| WIT20, WIT26 | Interview may miss known information; Interview may generate Leads | **Accepted candidate** |

### TBD

Person psychology/knowledge/memory, relevance, contact/cooperation, question/response generation, transcription, deception, capability mappings, credibility/demeanor/bias, social behavior, Interview UI/AI, testimony/admission/Korean procedure and implementation remain **TBD**.

### Forbidden

- ActualStateRecord/person hidden state used as player-visible truth query or clue counter.
- Person/witness/contact/Interview/Statement layers collapsed.
- Utterance overwritten by RecordedStatement or record collapsed into ProfessionalAnalysis.
- Statement/assertion/contradiction/cooperation/credibility analysis promoted to truth or deception.
- Capability/style/score/weighted sum used as truth-extraction authority.
- Interview mention auto-contacts a Person, acquires a source or reviews its contents.
- Correction/review deletes historical Statement/record/provenance.
- Internal Statement automatically enters CourtRecord or modifies JII/finding.

## 36. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | WIT1–WIT35 define explicit Person/contact/Interview/utterance/RecordedStatement/analysis stages, fallible person and recording semantics, statement history, contradiction/falsity/deception separation, Investigation/Review handoffs, no score/omniscience, court boundary and 40-case TEST-021 plan. |
