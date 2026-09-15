# THE FIRM — Legal Research and Issue Analysis

문서 ID: DEC-LITIGATION-023  
버전: v0.2 — Accepted  
상태: **Accepted**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 Accepted 기준: `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `TEST-020_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `TEST-019_EVIDENCE_REVIEW.md` v0.2 Accepted, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md` v0.2 Accepted, `TEST-018_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md` v0.2 Accepted, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md` v0.2 Accepted, `TEST-017_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md` v0.2 Accepted  
검증된 boundary 참고: `DEC-LITIGATION-022_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.1 Proposed, `TEST-021_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.1 Proposed / 44 PASS. VS-004는 witness semantics를 소비하지 않는다. 그 밖의 inherited profile/JII references는 기존 상태를 유지한다.  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose / non-goals

이 문서는 lawyer가 authorized Case File의 facts, assertions, statements, analyses 및 Issues에서 explicit legal question을 만들고, bounded legal-source domain을 연구하며, authority/rule/interpretation candidates와 case-specific IssueAnalysis를 생성하는 최소 semantic model을 제안한다.

```text
Case File Issue / KnownGap / ProfessionalAnalysis / Statement / SourceAssertion
+ LegalResearchTaskDefinition + TaskAssignment + LawyerRoleProfileVersion
+ authorized CaseFileState snapshot + available legal-source universe/access
+ time/resources/direction/dependencies + materialized TaskExecutionEvents
→ Legal Research
→ LegalResearchWorkProduct
→ authority / RuleStatement / interpretation candidates
→ IssueAnalysis Task
→ ProfessionalAnalysis / Issue links / argument candidates
→ provenance-bearing Case File update
```

```text
Legal Research ≠ Evidence Review ≠ Investigation ≠ adjudication
```

이 문서는 substantive Korean law, authority hierarchy, precedent effect, jurisdiction rules, citation format, search engine, research probability, drafting/filing, judge legal interpretation mechanics, UI, AI, schema 또는 Godot implementation을 확정하지 않는다.

## 2. Inherited hard boundaries

- `ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`.
- Legal Research는 acquired factual SourceMaterial을 Review하는 DEC-020이나 새 factual source를 찾는 DEC-021 Investigation이 아니다.
- Statement, SourceAssertion, RecordedExtraction과 ProfessionalAnalysis는 authorized epistemic inputs이며 fact/truth로 승격되지 않는다.
- Research/IssueAnalysis는 hidden correct law, ActualStateRecord, hidden winning authority 또는 future judge acceptance를 query하지 않는다.
- Direct/delegated Tasks, component capabilities, structured WorkProducts, materialized bounded variation, no reload reroll 및 immutable provenance/history를 상속한다.
- LegalResearchWorkProduct/IssueAnalysis/Argument는 explicit later procedural path 없이 CourtRecord/JII/ChoicePoint/finding/outcome을 변경하지 않는다.

## 3. Critical semantic layers

| Layer | Minimum meaning | Does not imply |
|---|---|---|
| LegalSource | Statute/decision/administrative/secondary/internal material candidate | Applicable or governing authority |
| LegalAuthorityCitation | Provenance-bearing reference to a LegalSource | Accurate reading or controlling force |
| RecordedLegalExtraction | What researcher recorded as source content/proposition | Source actually says it perfectly or rule governs |
| RuleStatement | Lawyer-authored synthesis/representation of a candidate rule | Objective governing law |
| InterpretationCandidate | A possible reading of source/rule | Correct or court-adopted interpretation |
| IssueApplicationAnalysis | Conditional application to typed Case File inputs | Objective case outcome |
| Argument | Advocacy-oriented formulation chosen for later use | Correct interpretation or success |
| Court-adopted interpretation | Downstream adjudicative result, if procedurally reached | CourtFactFinding |

```text
legal source says R ≠ R necessarily governs this case
lawyer concludes R applies ≠ R objectively applies ≠ judge will accept R
```

## 4. LegalSource and authority status

A `LegalSource` may represent statute/regulation text, judicial decision, precedent/case, administrative material, commentary/treatise, secondary source or internal research reference. This list is illustrative. Exact Korean source hierarchy/content is TBD.

Found or cited sources may differ in formal authority, jurisdiction, time, version and relevance, but:

```text
found source ≠ controlling authority
cited source ≠ applicable source
higher formal authority ≠ automatic interpretation winner
```

No canonical `AuthorityPower = 92` exists. Binding, persuasive, superseded, distinguished, overruled, amended, jurisdiction-mismatch and temporal-mismatch relationships are future content/rule candidates, not doctrines fixed here.

## 5. LegalResearchTaskDefinition

Illustrative semantics:

```text
LegalResearchTaskDefinition
├─ purpose and target Issue / legal question
├─ authorized factual context
├─ jurisdiction/context refs
├─ bounded search domain / source types
├─ known terms, citations and authorities
├─ eligible performer roles
├─ time/resources/depth/direction
├─ dependencies and capability refs
└─ expected outputs / completion semantics
```

Canonical schema is TBD. There is no universal `LegalResearchDifficulty`.

## 6. Explicit legal question and bounded domain

Valid illustrative questions include `What rule governs termination-notice timing?`, `What authorities address apparent authority under these supplied facts?`, and `Is there authority supporting interpretation A over B?`. `Find the law that wins` and `return the correct answer` are not sufficient until translated into explicit bounded questions.

Search domains may be defined by jurisdiction/source collection, topic statutes, Issue/query-matched decisions, a citation chain or a defined secondary-source field. `Search all law everywhere` or `query hidden correct law` is invalid. Exact infrastructure is TBD.

## 7. Research discovery chain

```text
source exists
≠ source found
≠ source reviewed
≠ source understood
≠ source interpreted correctly
≠ source correctly applied
```

Research may discover citations, related/conflicting authorities, terminology, doctrinal branches, jurisdiction issues, unresolved questions and follow-up research paths. None imply correctness.

A lightweight `ResearchLead` may identify a cited case, statutory section, doctrinal term, conflicting authority line or jurisdiction branch. It preserves query/path provenance but is neither controlling authority nor correct rule. Exact object/taxonomy is TBD.

## 8. Authority and research provenance

Every material research result should be able to preserve source/citation, where and how found, query/path, researcher/profile, time/version, jurisdiction/context, source type, recorded or paraphrased proposition, Issue relation and limitations. Exact citation format is TBD.

Different source copies/citations may refer to one authority; possible duplicate relations must preserve discovery and research provenance. Deduplication never deletes distinct research history.

## 9. Source content, legal extraction and RuleStatement

DEC-020's fallible extraction boundary generalizes as:

```text
LegalSource content
≠ RecordedLegalExtraction
≠ RuleStatement
≠ ProfessionalAnalysis
```

`RecordedLegalExtraction` is the default descriptive term for what a researcher/system recorded from a LegalSource. A generalized `RecordedExtraction` implementation may later represent it, but the semantic layer remains distinct.

Example:

```text
RuleStatement RS-LAW-4:
"Under Authority A, requirement R may apply when condition C is satisfied."
```

RS-LAW-4 is a provenance-bearing legal synthesis, not source text itself or objective governing law. A researcher may misquote, miss limiting language, overstate a holding, confuse dicta/holding, misread jurisdiction/terminology, overlook exceptions or miss conflicting/later authority. Exact error mechanics are TBD; no hidden legal model automatically corrects the memo.

## 10. Conflicting authority, hierarchy and version

Authority A may support X while Authority B supports Y. Both coexist. `2 authorities for X + 1 for Y → X is law` is forbidden. Count, seniority of researcher, confidence or UI order does not resolve legal truth.

The architecture permits later content-specific relationships such as binding/persuasive, superseded/distinguished/overruled/amended and jurisdiction/time mismatch, but does not invent their legal effect. Source version, effective period/context, research time and case-relevant time are preserved. New law/source versions do not rewrite old WorkProducts.

## 11. Issue integration and IssueAnalysis

Case File `Issue` connects provenance-bearing factual and legal inputs without becoming a hidden solved/unsolved answer node. Illustrative IssueAnalysis:

```text
Issue I4: Did apparent authority exist?

Rule candidate: R3
Factual inputs: SourceAssertions A1/A7; Statement S4
Application: A1/A7 may support condition C1; S4 conflicts on notice
Conclusion candidate: supportable but contested
```

`IssueAnalysis` is a ProfessionalAnalysis subtype or equivalent. It may use relevant SourceAssertions, Statements, Evidence Review analyses, procedural/observable statuses, RuleStatements, authority candidates, KnownGaps and competing interpretations, while preserving every epistemic type.

An IRAC-like Issue/Rule/Application/Conclusion projection may aid authoring/UI, but exact schema is not mandatory. Its conclusion is not an objective legal outcome.

## 12. Fact input, assumptions and competing scenarios

IssueAnalysis uses only authorized Case File knowledge. It does not read ActualStateRecord.

```text
If A1 is accepted, Rule R may support Conclusion C.
```

This is valid conditional analysis; it does not set A1 true. Competing factual scenarios and competing legal interpretations may coexist:

```text
Scenario A: if S1 is accepted → Interpretation X application
Scenario B: if E3 analysis is accepted → Interpretation Y application
```

No skill score, source count or hidden model automatically picks the winner.

## 13. IssueAnalysis and Argument

IssueAnalysis assesses reasoning, assumptions, strengths, weaknesses and uncertainty. `Argument` is an advocacy-oriented formulation intended for later drafting, filing or oral use. A lawyer may recognize uncertainty yet choose to advance one Argument.

```text
IssueAnalysis ≠ Argument
Argument ≠ correct interpretation
Conclusion candidate ≠ judgment
```

Drafting and procedural use remain TBD. The minimum canonical Argument identity and creation/selection semantics required by VS-004 are closed in §14.1.

## 14. WorkProduct reference models

Illustrative only:

```text
LegalResearchWorkProduct
├─ Task / assignment / performer/profile refs
├─ Issue / legal question refs
├─ authorized Case File context
├─ search domain / query / research path
├─ found and reviewed LegalSource refs
├─ RecordedLegalExtraction refs
├─ RuleStatement / interpretation candidates
├─ conflicting authority refs
├─ limitations / unresolved questions
├─ ResearchLeads / follow-up Tasks
└─ provenance / source version / history
```

```text
IssueAnalysisWorkProduct
├─ Issue ref
├─ typed factual inputs / assumptions
├─ RuleStatement / authority refs
├─ interpretation candidates
├─ application reasoning / competing scenarios
├─ strengths / weaknesses / uncertainties
├─ conclusion / Argument candidates
├─ KnownGaps / research gaps / follow-up Tasks
└─ provenance / version / history
```

There is no universal `ResearchQuality`, `IssueStrength` or `CaseStrength = 78`.

### 14.1 VS-004 minimum materialization and Argument closure

The following is the minimum canonical semantic contract for VS-004. Field/storage names may vary, but these identities, references and gates may not be omitted or collapsed.

#### Discovery and review materialization

- A `LegalSource` exists as authored content independently of player knowledge.
- Discovery materializes one immutable `LegalSourceDiscoveryEvent` referencing the research Task/assignment/execution/completion, query or authored path, source ID/version, actor/team/matter/stage, content version and event order. Discovery changes authorized visibility only; it does not mark any source scope reviewed.
- Review occurs only through declared executed research work over an already discovered source and exact authorized source scope. Completion materializes an immutable `LegalSourceReviewEvent` with the same operational provenance plus exact reviewed scope. Opening or projecting a source is a read and creates neither event nor review state.
- One valid completion may materialize zero or more discovery/review events according to its authored path. An authored bounded negative research result may still complete its Task and preserve a result/WorkProduct without inventing a source. An invalid or insufficient-work command is rejected before mutation and materializes none of the downstream artifacts described below.

#### RecordedLegalExtraction, RuleStatement and InterpretationCandidate

- `RecordedLegalExtraction` is an immutable researcher record produced from exactly one reviewed `LegalSource` ID/version and a non-empty exact reviewed scope. It also preserves its own ID, text/proposition, review event, research Task lifecycle, actor/team/matter/stage, content version and event order. One reviewed scope may yield zero or more extractions; an extraction may be incomplete or mistaken without changing the source.
- `RuleStatement` is a distinct lawyer-authored synthesis. It requires its own persistent ID and one or more `RecordedLegalExtraction` references. It preserves the transitive LegalSource/version/scope provenance and any authored limitations. A direct LegalSource reference without an extraction is not sufficient to materialize a RuleStatement.
- `InterpretationCandidate` is an immutable possible reading materialized explicitly from one or more RuleStatements. It preserves its own persistent ID, rule refs, supporting/challenging extraction/source refs, assumptions/limits, research lifecycle and actor/team/matter/stage/content/event provenance. It is neither a hidden truth value nor a selection.

#### IssueAnalysis materialization

`IssueAnalysis` materializes only through an explicit service command after the referenced Legal Research Task is completed. It requires a persistent ID, valid selected Issue, completed research Task lifecycle, at least one reviewed LegalSource/RecordedLegalExtraction chain, at least one RuleStatement and at least one InterpretationCandidate. It preserves typed factual inputs and their ReviewWorkProduct/Investigation/SourceMaterial provenance where used, assumptions, application reasoning, gaps/challenges, actor/team/matter/stage, content version and event order. Creating it does not mutate Issue, CaseTheory, source assertions, court or adjudicative state. A revision creates a new ID with `parent_issue_analysis_id`; it never overwrites the prior artifact.

#### Minimum canonical Argument identity and provenance

An `Argument` is an immutable advocacy artifact with at least:

```text
argument_id
authored_argument_key / formulation
issue_id
issue_analysis_id
interpretation_candidate_ids
rule_statement_ids
recorded_legal_extraction_ids
legal_source_id/version/exact-scope refs
case_theory_id/version
relevant ReviewWorkProduct refs
relevant InvestigationResult/AcquisitionEvent/SourceMaterial refs
assumptions / known gaps / challenges
creator actor_id / team_id / matter_id / stage_id
research task/assignment/execution/completion refs
content_version / creation_event_id / event_order
optional parent_argument_id
```

"Relevant" provenance means every basis actually used by the authored Argument path must be preserved; it does not require inventing an Investigation reference for a path that did not use one. An Argument cannot exist from IssueAnalysis text alone while dropping the source/rule/extraction chain. Revision creates a new `argument_id` linked by `parent_argument_id`; persistent IDs are never reused.

Argument creation is an explicit command selecting one authored argument recipe whose required IssueAnalysis, interpretation, rule, theory version and factual provenance are all present and authorized. Candidate interpretation or IssueAnalysis creation does not auto-create an Argument. Duplicate IDs, stale/non-current CaseTheory bases, mismatched Issue/matter/stage/team, missing required provenance and un-authored combinations are rejected atomically.

Argument selection is a separate explicit command. It materializes an immutable `ArgumentSelectionEvent` referencing the selected existing Argument, its Issue and CaseTheory version, selector actor/team/matter/stage, content version and event order. For VS-004, current strategic state is derived from the latest valid selection event for the Issue; re-selection appends history and does not mutate either Argument. Selection does not assert correctness and does not create a canonical `Strategy`, `StrategicNarrative`, Submission, CourtRecord or adjudicative object.

```text
LegalSource
≠ LegalSourceDiscoveryEvent
≠ LegalSourceReviewEvent
≠ RecordedLegalExtraction
≠ RuleStatement
≠ InterpretationCandidate
≠ IssueAnalysis
≠ Argument
≠ ArgumentSelectionEvent
≠ CaseTheory
```

Required artifact boundary는 다음과 같이 그대로 유지된다.

```text
LegalSource ≠ RecordedLegalExtraction ≠ RuleStatement ≠ InterpretationCandidate
≠ IssueAnalysis ≠ Argument ≠ CaseTheory
```

## 15. Incomplete research and negative results

Initial scan, targeted research, deeper research, unresolved conflicts, follow-up needed, time exhausted, no relevant result, unavailable source and unresolved jurisdiction are valid structured states. Exact vocabulary is TBD.

```text
research found no authority
≠ no authority exists
```

Unless a later rule explicitly establishes an exhaustive domain for a narrow proposition, no global negative conclusion is allowed. DEC-023 invents no such rule.

## 16. Fallibility and capability

A researcher may miss a relevant authority or limitation. Capability does not guarantee exhaustive or correct research.

Illustrative contributions:

```text
legal research → query/source discovery component
doctrinal analysis → RuleStatement/interpretation component
issue spotting → question/Issue linkage
domain specialization → terminology/jurisdiction context
attention/detail → exception/version/conflict component
```

There is no `ResearchSkill 90 → finds 90%`, universal ResearchScore, weighted sum, highest-stat shortcut or specialist oracle. Exact mappings/probabilities are TBD.

## 17. Direct/delegated research and follow-up

Player-direct and delegated research use the same TaskDefinition, authorized inputs, source/query/path, WorkProduct and provenance ontology. Direct play may choose question, terms, sources/citations, depth, time and stop point. Delegation changes explicit performer/direction inputs, not `87% correct answer`.

ResearchLead, conflict, gap or limitation may create an explicit follow-up Research Task. Material scope expansion is not silently absorbed into an endless query. Exact UI, AI and scheduler are TBD.

## 18. Version/history and materialized events

LegalSource updates, later authorities and new research may challenge/supersede a RuleStatement, memo or IssueAnalysis, but old versions and their dependent decisions remain traceable. Same resolved inputs/materialized event history normally yield the same semantic result. If future task rules permit bounded borderline variation, it materializes once; reload does not reroll.

## 19. Hidden legal model boundary

Case/content may eventually define hidden applicable legal-rule structures for simulation. If such a model exists:

```text
hidden legal model
≠ firm knowledge
≠ lawyer RuleStatement / IssueAnalysis
≠ judge interpretation
```

It is not a player/NPC query API, correct-authority marker or memo auto-correction service. DEC-023 does not define a substantive law engine.

## 20. Court and judge boundary

```text
LegalResearchWorkProduct ≠ CourtRecord
IssueAnalysis ≠ JudgeInterpretationInput ≠ CourtFactFinding
```

Research may inform Argument/drafting/submission Tasks. Only later valid procedural/argument pathways may expose material to court. Research, specialist reputation or Argument never gives a direct judge acceptance bonus, activates/deletes a ChoicePoint, resolves a requirement or changes a finding.

## 21. Design decisions

### LAW1 — Legal Research as explicit Task family

**Problem:** legal research를 implicit answer action으로 둘 것인가?  
**Alternatives:** hidden answer lookup; explicit Task/WorkProduct.  
**Failure modes:** question, scope, actor, cost and provenance vanish.  
**Recommendation:** Legal Research is an explicit Task family.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018 work-unit semantics apply.

### LAW2 — Legal Research ≠ Evidence Review/Investigation

**Problem:** factual source review/acquisition과 legal research를 합칠 것인가?  
**Alternatives:** one search engine; separate task families.  
**Failure modes:** hidden facts/law and source authority collapse.  
**Recommendation:** keep all three distinct with explicit handoffs.  
**Status:** **Core Accepted candidate**  
**Reason:** inputs and epistemic outputs differ.

### LAW3 — Explicit legal question / Issue basis

**Problem:** research가 `find winning law`로 시작할 수 있는가?  
**Alternatives:** unbounded goal; explicit Issue/question.  
**Failure modes:** correct-answer oracle.  
**Recommendation:** require bounded legal question or Issue basis.  
**Status:** **Core Accepted candidate**  
**Reason:** research path becomes explainable.

### LAW4 — Bounded legal-source domain

**Problem:** all law everywhere를 검색하는가?  
**Alternatives:** global query; explicit jurisdiction/source/topic domain.  
**Failure modes:** access and miss semantics disappear.  
**Recommendation:** Task declares bounded domain.  
**Status:** **Core Accepted candidate**  
**Reason:** scope and negative results remain meaningful.

### LAW5 — No hidden correct-law query

**Problem:** hidden legal model에서 정답을 반환하는가?  
**Alternatives:** canonical lookup; source/query/research path.  
**Failure modes:** research becomes answer key.  
**Recommendation:** prohibit hidden correct-law query.  
**Status:** **Core Accepted candidate**  
**Reason:** firm knowledge and simulation authority must differ.

### LAW6 — Source exists ≠ found

**Problem:** available universe의 source가 자동 known인가?  
**Alternatives:** preload; explicit discovery.  
**Failure modes:** research action and provenance vanish.  
**Recommendation:** preserve existence/discovery separation.  
**Status:** **Core Accepted candidate**  
**Reason:** research may miss authority.

### LAW7 — Found ≠ reviewed/understood

**Problem:** citation discovery가 understanding인가?  
**Alternatives:** collapse; explicit reviewed/understood layers.  
**Failure modes:** title/search hit becomes rule.  
**Recommendation:** found, reviewed and interpreted remain distinct.  
**Status:** **Core Accepted candidate**  
**Reason:** fallible research.

### LAW8 — LegalSource ≠ RuleStatement

**Problem:** source와 lawyer synthesis를 합칠 것인가?  
**Alternatives:** one rule object; separate source/extraction/rule.  
**Failure modes:** misquotation/overstatement cannot be represented.  
**Recommendation:** RuleStatement is provenance-bearing representation.  
**Status:** **Core Accepted candidate**  
**Reason:** immutable source and explainability.

### LAW9 — Legal extraction/summary may be mistaken

**Problem:** recorded legal extraction이 infallible한가?  
**Alternatives:** source identity; fallible extraction.  
**Failure modes:** errors rewrite legal source.  
**Recommendation:** allow mistaken extraction without source mutation.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-020 lesson generalizes.

### LAW10 — RuleStatement ≠ governing law

**Problem:** researcher-authored rule가 canonical law인가?  
**Alternatives:** truth promotion; candidate synthesis.  
**Failure modes:** professional analysis becomes adjudication.  
**Recommendation:** RuleStatement remains candidate with provenance/limits.  
**Status:** **Core Accepted candidate**  
**Reason:** interpretation and applicability remain open.

### LAW11 — Found authority ≠ controlling authority

**Problem:** retrieved source가 자동 controlling인가?  
**Alternatives:** yes; context-specific authority candidate.  
**Failure modes:** jurisdiction/version/hierarchy vanish.  
**Recommendation:** authority status requires separate content/rules.  
**Status:** **Core Accepted candidate**  
**Reason:** no unsupported doctrine.

### LAW12 — Authority count ≠ legal truth

**Problem:** citations vote on law인가?  
**Alternatives:** majority rule; coexistence/contextual analysis.  
**Failure modes:** duplicate/secondary sources distort law.  
**Recommendation:** reject count-based truth.  
**Status:** **Core Accepted candidate**  
**Reason:** authority is not popularity.

### LAW13 — Conflicting authorities coexist

**Problem:** system이 conflict를 auto-resolve하는가?  
**Alternatives:** winner selection; preserve branches.  
**Failure modes:** legal uncertainty disappears.  
**Recommendation:** preserve competing sources/interpretations.  
**Status:** **Core Accepted candidate**  
**Reason:** later analysis/court remains meaningful.

### LAW14 — Authority version/jurisdiction/context preserved

**Problem:** source identity alone으로 applicability를 판단하는가?  
**Alternatives:** flatten; preserve context/version/time.  
**Failure modes:** obsolete/wrong-jurisdiction material appears current.  
**Recommendation:** retain these refs/statuses.  
**Status:** **Core Accepted candidate**  
**Reason:** traceable limitations.

### LAW15 — No-result ≠ no authority exists

**Problem:** failed search가 global legal absence인가?  
**Alternatives:** global conclusion; domain/query/time-bounded result.  
**Failure modes:** negative oracle.  
**Recommendation:** preserve bounded no-result semantics.  
**Status:** **Core Accepted candidate**  
**Reason:** research is non-exhaustive by default.

### LAW16 — Research may miss authority

**Problem:** valid search가 all relevant sources를 guarantees하는가?  
**Alternatives:** exhaustive; fallible/incomplete result.  
**Failure modes:** researcher becomes oracle.  
**Recommendation:** allow missed authority.  
**Status:** **Accepted candidate**  
**Reason:** exact miss mechanics remain TBD.

### LAW17 — No universal ResearchScore

**Problem:** research output을 one score로 축소하는가?  
**Alternatives:** universal score; structured WorkProduct.  
**Failure modes:** sources/rules/gaps/conflicts disappear.  
**Recommendation:** no canonical ResearchScore.  
**Status:** **Core Accepted candidate**  
**Reason:** components have different meanings.

### LAW18 — No hidden weighted sum

**Problem:** capabilities weights로 correctness를 정하는가?  
**Alternatives:** weighted formula; component contribution.  
**Failure modes:** qualitative profiles become hidden power.  
**Recommendation:** reject default weighted sum.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-017/018 boundary.

### LAW19 — Authorized Case File only

**Problem:** IssueAnalysis가 hidden facts를 읽는가?  
**Alternatives:** ActualStateRecord input; authorized epistemic snapshot.  
**Failure modes:** analysis becomes truth oracle.  
**Recommendation:** use authorized Case File only.  
**Status:** **Core Accepted candidate**  
**Reason:** firm-side knowledge boundary.

### LAW20 — Factual inputs preserve epistemic type

**Problem:** Assertions/Statements/Analysis를 fact로 flatten하는가?  
**Alternatives:** flatten; retain types/provenance.  
**Failure modes:** legal application launders disputed facts.  
**Recommendation:** preserve input type and status.  
**Status:** **Core Accepted candidate**  
**Reason:** conditional reasoning remains honest.

### LAW21 — Conditional/hypothetical application

**Problem:** uncertain facts를 분석할 수 있는가?  
**Alternatives:** require truth; explicit if/assumption branches.  
**Failure modes:** either analysis blocked or assumption promoted.  
**Recommendation:** allow conditional application without truth mutation.  
**Status:** **Core Accepted candidate**  
**Reason:** litigation depends on disputed scenarios.

### LAW22 — Competing factual scenarios

**Problem:** one fact branch만 허용하는가?  
**Alternatives:** single scenario; multiple typed scenarios.  
**Failure modes:** uncertainty prematurely resolves.  
**Recommendation:** allow coexisting factual branches.  
**Status:** **Core Accepted candidate**  
**Reason:** preserves Case File conflicts.

### LAW23 — Competing legal interpretations

**Problem:** research must pick one legal reading인가?  
**Alternatives:** auto-winner; multiple candidates.  
**Failure modes:** hidden legal model leaks.  
**Recommendation:** preserve competing interpretations.  
**Status:** **Core Accepted candidate**  
**Reason:** argument/judge stages remain downstream.

### LAW24 — IssueAnalysis ≠ objective outcome

**Problem:** analysis conclusion이 case result인가?  
**Alternatives:** outcome authority; ProfessionalAnalysis.  
**Failure modes:** adjudication bypass.  
**Recommendation:** IssueAnalysis remains fallible analysis.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-013 boundary.

### LAW25 — Conclusion candidate ≠ case result

**Problem:** conclusion label이 judgment인가?  
**Alternatives:** direct result; candidate with assumptions.  
**Failure modes:** conditional inputs disappear.  
**Recommendation:** retain assumptions/uncertainty and no outcome mutation.  
**Status:** **Core Accepted candidate**  
**Reason:** conclusion is work product.

### LAW26 — Argument ≠ IssueAnalysis

**Problem:** assessment와 advocacy를 같은 object로 둘 것인가?  
**Alternatives:** collapse; separate analysis and chosen formulation.  
**Failure modes:** strategic choice masquerades as correctness.  
**Recommendation:** distinguish Argument candidates.  
**Status:** **Core Accepted candidate**  
**Reason:** uncertain interpretation may still be argued.

### LAW27 — Direct/delegated same ontology

**Problem:** NPC research가 hidden correct-answer engine을 쓰는가?  
**Alternatives:** separate percentage; shared Task/WorkProduct.  
**Failure modes:** delegated path gains omniscience.  
**Recommendation:** use same source/query/result ontology.  
**Status:** **Core Accepted candidate**  
**Reason:** solo-to-firm continuity.

### LAW28 — Research history/version preserved

**Problem:** updated memo가 old research를 overwrite하는가?  
**Alternatives:** overwrite; version lineage.  
**Failure modes:** prior decisions become inexplicable.  
**Recommendation:** preserve old sources, extractions, rules and analyses.  
**Status:** **Core Accepted candidate**  
**Reason:** historical provenance.

### LAW29 — Source updates do not rewrite prior research

**Problem:** later amendment/authority silently changes old memo인가?  
**Alternatives:** retroactive update; new review/research version.  
**Failure modes:** time-specific reasoning is lost.  
**Recommendation:** old memo remains tied to reviewed source version.  
**Status:** **Core Accepted candidate**  
**Reason:** temporal validity.

### LAW30 — Research/Analysis ≠ CourtRecord/JII/finding

**Problem:** internal law work directly controls court인가?  
**Alternatives:** direct feed; later procedural/argument path.  
**Failure modes:** filing, judge and ChoicePoint boundaries collapse.  
**Recommendation:** prohibit direct CourtRecord/JII/finding effects.  
**Status:** **Core Accepted candidate**  
**Reason:** litigation non-interference.

### LAW31 — Specialist ≠ correct-law oracle

**Problem:** specialization guarantees right rule인가?  
**Alternatives:** oracle; terminology/path component only.  
**Failure modes:** scope/context/error disappear.  
**Recommendation:** specialist helps task components, not correctness guarantee.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-017 specialization boundary.

### LAW32 — Explicit follow-up research

**Problem:** one Task가 citation branches를 indefinitely follows하는가?  
**Alternatives:** silent expansion; ResearchLead/follow-up Task.  
**Failure modes:** scope/time become meaningless.  
**Recommendation:** material expansion is explicit Task candidate.  
**Status:** **Accepted candidate**  
**Reason:** bounded workflow.

### LAW33 — No universal CaseStrength

**Problem:** issue/research outputs를 one case number로 합치는가?  
**Alternatives:** aggregate score; structured Issues/scenarios.  
**Failure modes:** truth, law and strategy collapse.  
**Recommendation:** reject canonical CaseStrength.  
**Status:** **Core Accepted candidate**  
**Reason:** downstream systems need typed inputs.

### LAW34 — Hidden legal model is not query API

**Problem:** simulation law model이 player research result를 직접 주는가?  
**Alternatives:** expose correct answer; separate authority.  
**Failure modes:** research becomes deterministic spoiler.  
**Recommendation:** hidden model, if any, remains inaccessible to firm research.  
**Status:** **Core Accepted candidate**  
**Reason:** mirrors ActualStateRecord boundary.

### LAW35 — Research gaps/Leads, not hidden answers

**Problem:** unresolved question이 hidden answer marker인가?  
**Alternatives:** winning-source hint; provenance-bearing gap/Lead.  
**Failure modes:** undiscovered law count/importance leaks.  
**Recommendation:** create bounded ResearchLead/gap/follow-up candidate only.  
**Status:** **Core Accepted candidate**  
**Reason:** uncertainty without oracle UI.

### LAW36 — Discovery and review materialize separately

**Recommendation:** discovery and exact-scope review use distinct immutable events; reads create neither.  
**Status:** **Core Accepted**  
**Reason:** source visibility cannot stand in for performed review work.

### LAW37 — Extraction and rule provenance chain

**Recommendation:** each RecordedLegalExtraction binds one reviewed source version/scope; each RuleStatement requires one or more extraction refs.  
**Status:** **Core Accepted**  
**Reason:** mistaken recording and later synthesis must remain distinguishable from source content.

### LAW38 — InterpretationCandidate and IssueAnalysis materialization

**Recommendation:** interpretations materialize explicitly from rules; IssueAnalysis materializes explicitly after completed research and retains typed factual/legal provenance.  
**Status:** **Core Accepted**  
**Reason:** review, interpretation and application are different work states.

### LAW39 — Minimum immutable Argument identity

**Recommendation:** use the identity and provenance contract in §14.1; revision creates a new linked Argument ID.  
**Status:** **Core Accepted**  
**Reason:** later choices must be traceable without collapsing Argument into analysis or theory.

### LAW40 — Argument creation and selection are separate

**Recommendation:** explicit authored creation validates all bases; a separate immutable selection event establishes the current choice and preserves history.  
**Status:** **Core Accepted**  
**Reason:** candidate existence, advocacy materialization and player selection are distinct.

### LAW41 — No canonical Strategy object in VS-004

**Recommendation:** derive VS-004 current strategic state from Argument selection; do not materialize Strategy or downstream procedural/adjudicative objects.  
**Status:** **Core Accepted**  
**Reason:** no separate decision currently justifies a Strategy ontology.

## 22. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | Legal Research is an explicit Task family | **Core Accepted candidate** |
| 2 | Legal Research ≠ Evidence Review | **Core Accepted candidate** |
| 3 | Legal Research ≠ Investigation | **Core Accepted candidate** |
| 4 | Research begins from explicit Issue/question | **Core Accepted candidate** |
| 5 | Legal-source search domain is bounded | **Core Accepted candidate** |
| 6 | No hidden correct-law query | **Core Accepted candidate** |
| 7 | LegalSource existence ≠ discovery | **Core Accepted candidate** |
| 8 | Found source ≠ reviewed/understood source | **Core Accepted candidate** |
| 9 | Found authority ≠ applicable authority | **Core Accepted candidate** |
| 10 | LegalSource ≠ RecordedLegalExtraction ≠ RuleStatement | **Core Accepted candidate** |
| 11 | Legal extraction/summary may be mistaken | **Core Accepted candidate** |
| 12 | Mistaken extraction never rewrites LegalSource | **Core Accepted candidate** |
| 13 | RuleStatement ≠ governing law | **Core Accepted candidate** |
| 14 | Authority citation ≠ controlling authority | **Core Accepted candidate** |
| 15 | Authority count ≠ legal truth | **Core Accepted candidate** |
| 16 | Conflicting authorities may coexist | **Core Accepted candidate** |
| 17 | Jurisdiction, version, effective period and research time are preserved | **Core Accepted candidate** |
| 18 | Search found nothing ≠ authority absent | **Core Accepted candidate** |
| 19 | Research may miss relevant authority | **Accepted candidate** |
| 20 | Capability does not guarantee exhaustive/correct research | **Core Accepted candidate** |
| 21 | No universal ResearchScore/ResearchQuality | **Core Accepted candidate** |
| 22 | No hidden weighted capability formula | **Core Accepted candidate** |
| 23 | IssueAnalysis uses authorized Case File only | **Core Accepted candidate** |
| 24 | ActualStateRecord is not legal-analysis input | **Core Accepted candidate** |
| 25 | SourceAssertion remains assertion | **Core Accepted candidate** |
| 26 | Witness Statement remains Statement | **Core Accepted candidate** |
| 27 | ProfessionalAnalysis remains analysis | **Core Accepted candidate** |
| 28 | Assumed fact ≠ accepted fact | **Core Accepted candidate** |
| 29 | Conditional analysis does not promote its assumption | **Core Accepted candidate** |
| 30 | Competing factual scenarios may coexist | **Core Accepted candidate** |
| 31 | Competing legal interpretations may coexist | **Core Accepted candidate** |
| 32 | IssueAnalysis ≠ objective legal result | **Core Accepted candidate** |
| 33 | Conclusion candidate ≠ judgment | **Core Accepted candidate** |
| 34 | Argument ≠ correct interpretation | **Core Accepted candidate** |
| 35 | Specialist ≠ legal oracle | **Core Accepted candidate** |
| 36 | Direct/delegated research use the same ontology | **Core Accepted candidate** |
| 37 | Research update/version preserves history | **Core Accepted candidate** |
| 38 | New authority/source version does not rewrite old memo | **Core Accepted candidate** |
| 39 | LegalResearchWorkProduct ≠ CourtRecord | **Core Accepted candidate** |
| 40 | IssueAnalysis does not directly modify JII | **Core Accepted candidate** |
| 41 | IssueAnalysis does not directly modify CourtFactFinding | **Core Accepted candidate** |
| 42 | No hidden winning-authority marker/count | **Core Accepted candidate** |
| 43 | No universal CaseStrength score | **Core Accepted candidate** |
| 44 | Legal research gaps/Leads and follow-up Tasks are explicit | **Accepted candidate** |

## 23. Pressure-test examples

All fixtures are synthetic semantic examples, not implementation tests or statements of Korean law.

### Case 1 — Basic legal research Task

**Fixture:** Explicit Issue/question, authorized context, bounded domain, lawyer assignment and time.  
**May produce:** sources, extractions, RuleStatements, gaps and provenance.  
**Must not happen:** correct-answer lookup.  
**Expected:** valid Legal Research Task.

### Case 2 — No explicit legal question

**Fixture:** `Find useful law` with no Issue/question/domain.  
**May produce:** request for scoped Task definition.  
**Must not happen:** hidden winning authority.  
**Expected:** insufficient/invalid Task basis.

### Case 3 — Hidden correct-law query

**Fixture:** Issue I3 asks engine for canonical correct interpretation.  
**May produce:** none without explicit source research.  
**Must not happen:** hidden legal model returns answer.  
**Expected:** forbidden.

### Case 4 — Bounded statute search

**Fixture:** Defined topic/jurisdiction statute collection and explicit question.  
**May produce:** source/citation candidates and gaps.  
**Must not happen:** all-law omniscience or automatic applicability.  
**Expected:** valid bounded research.

### Case 5 — Bounded case-law search

**Fixture:** Issue/query and defined decision collection.  
**May produce:** candidate cases and ResearchLeads.  
**Must not happen:** every relevant case guaranteed.  
**Expected:** valid bounded research.

### Case 6 — Search all law everywhere attack

**Fixture:** `Search everything and return what wins`.  
**May produce:** explicit narrower question/domain candidate.  
**Must not happen:** global oracle query.  
**Expected:** invalid.

### Case 7 — Authority exists but not found

**Fixture:** Source universe contains A9; supplied search path does not reach it.  
**May produce:** incomplete results/gap.  
**Must not happen:** existence becomes discovery.  
**Expected:** A9 remains unfound.

### Case 8 — Authority found but not read

**Fixture:** Citation A4 discovered; source content not reviewed.  
**May produce:** citation/ResearchLead.  
**Must not happen:** RuleStatement/understanding.  
**Expected:** found-only state.

### Case 9 — Authority read but misinterpreted

**Fixture:** Researcher reviews A4 but misses limitation.  
**May produce:** fallible extraction/RuleStatement/analysis.  
**Must not happen:** hidden model auto-corrects or source rewrites.  
**Expected:** mistaken research is valid state.

### Case 10 — RuleStatement extracted

**Fixture:** A4 reviewed and researcher records candidate rule R4 with citation/context.  
**May produce:** provenance-bearing RuleStatement.  
**Must not happen:** R4 becomes governing law.  
**Expected:** valid candidate.

### Case 11 — RuleStatement overstates source

**Fixture:** Source contains exception C; R4 omits it.  
**May produce:** mistaken/limited RuleStatement and later correction.  
**Must not happen:** LegalSource altered or R4 truth-promoted.  
**Expected:** fallible state with history.

### Case 12 — Authority found ≠ applicable

**Fixture:** A4 discusses similar doctrine but applicability to I3 is unresolved.  
**May produce:** relevance/application candidate.  
**Must not happen:** controlling/applicable flag by discovery alone.  
**Expected:** status remains contextual.

### Case 13 — Wrong jurisdiction authority

**Fixture:** A7 is from a different jurisdiction/context.  
**May produce:** candidate with mismatch warning/analysis.  
**Must not happen:** automatic governing authority.  
**Expected:** provenance/context preserved.

### Case 14 — Old or superseded source

**Fixture:** Research finds historical version A1-v1.  
**May produce:** version/time-limited candidate.  
**Must not happen:** treat as current without rule.  
**Expected:** limitation retained.

### Case 15 — Conflicting authorities

**Fixture:** A supports X; B supports Y.  
**May produce:** two sources/interpretation branches.  
**Must not happen:** auto-winner.  
**Expected:** both coexist.

### Case 16 — Majority-authority attack

**Fixture:** Three citations support X; one supports Y.  
**May produce:** grouped authority candidates.  
**Must not happen:** `3 votes → X is law`.  
**Expected:** count has no truth authority.

### Case 17 — Search finds nothing

**Fixture:** Domain D/query Q/time T yields no relevant authority.  
**May produce:** bounded no-result and research gap.  
**Must not happen:** `no authority exists`.  
**Expected:** incomplete/negative result.

### Case 18 — Exceptional researcher misses authority

**Fixture:** Exceptional profile; supplied task-specific result omits A9.  
**May produce:** incomplete research.  
**Must not happen:** capability guarantees exhaustive search.  
**Expected:** miss is semantically valid.

### Case 19 — Specialist with wrong Issue scope

**Fixture:** Specialist researches an overly narrow/wrong question.  
**May produce:** results bounded to scope.  
**Must not happen:** scan entire case/law or auto-correct direction.  
**Expected:** specialization is not oracle.

### Case 20 — Legal source version update

**Fixture:** A-v1 reviewed at T1; A-v2 appears at T2.  
**May produce:** new review/research Task/version.  
**Must not happen:** old memo silently mutates.  
**Expected:** v1 history preserved.

### Case 21 — Duplicate citation/provenance

**Fixture:** Two search paths reach the same authority.  
**May produce:** identity/dedup relation preserving both paths.  
**Must not happen:** one provenance erased.  
**Expected:** traceable duplicate discovery.

### Case 22 — ResearchLead from citation chain

**Fixture:** A4 cites A8.  
**May produce:** A8 ResearchLead with A4 provenance.  
**Must not happen:** A8 controlling/correct flag.  
**Expected:** follow-up direction only.

### Case 23 — Follow-up Research Task

**Fixture:** A8 Lead expands beyond original scope.  
**May produce:** explicit Task candidate.  
**Must not happen:** original Task searches indefinitely.  
**Expected:** scope expansion explicit.

### Case 24 — IssueAnalysis with SourceAssertions

**Fixture:** I3 analysis uses A1/A7 assertions and R3.  
**May produce:** typed conditional application.  
**Must not happen:** assertions become facts.  
**Expected:** valid ProfessionalAnalysis.

### Case 25 — IssueAnalysis with Witness Statement

**Fixture:** I3 uses S4 and R3.  
**May produce:** `if S4 accepted` branch.  
**Must not happen:** S4 becomes true.  
**Expected:** Statement type preserved.

### Case 26 — IssueAnalysis with ProfessionalAnalysis

**Fixture:** I3 uses PA2 from Evidence Review.  
**May produce:** analysis-on-analysis with basis refs.  
**Must not happen:** PA2 becomes objective fact.  
**Expected:** provenance/status retained.

### Case 27 — Hidden ActualStateRecord fact injected

**Fixture:** Hidden F9 is absent from Case File but added to IssueAnalysis.  
**May produce:** none.  
**Must not happen:** ActualStateRecord read.  
**Expected:** forbidden.

### Case 28 — Conditional application

**Fixture:** `If A1 is accepted, R supports C`.  
**May produce:** conditional conclusion candidate.  
**Must not happen:** A1 truth promotion.  
**Expected:** valid.

### Case 29 — Two factual scenarios

**Fixture:** Scenario A accepts S1; Scenario B accepts E3 analysis.  
**May produce:** separate application branches.  
**Must not happen:** automatic factual winner.  
**Expected:** both coexist.

### Case 30 — Two legal interpretations

**Fixture:** Interpretation X and Y use overlapping authorities.  
**May produce:** competing legal branches.  
**Must not happen:** researcher skill/count selects law.  
**Expected:** both coexist.

### Case 31 — Conclusion candidate

**Fixture:** Analysis says argument is supportable but contested.  
**May produce:** qualified conclusion candidate.  
**Must not happen:** judgment/outcome.  
**Expected:** ProfessionalAnalysis only.

### Case 32 — Conclusion truth attack

**Fixture:** Lawyer concludes C and system sets C as legal outcome.  
**May produce:** conclusion candidate with assumptions.  
**Must not happen:** objective/judicial result.  
**Expected:** forbidden.

### Case 33 — Argument candidate

**Fixture:** Lawyer chooses Interpretation X for later advocacy despite uncertainty.  
**May produce:** Argument candidate linked to analysis.  
**Must not happen:** X becomes correct.  
**Expected:** valid strategic formulation.

### Case 34 — Argument equals correct law attack

**Fixture:** Selected Argument is marked canonical interpretation.  
**May produce:** advocacy WorkProduct candidate.  
**Must not happen:** correctness/judge acceptance.  
**Expected:** forbidden.

### Case 35 — CaseStrength=82 attack

**Fixture:** Sources, facts and analysis collapse into `CaseStrength=82`.  
**May produce:** structured Issues/scenarios/strengths/gaps.  
**Must not happen:** universal authority score.  
**Expected:** invalid.

### Case 36 — Direct player research

**Fixture:** Player chooses question, terms, source, depth and stop point.  
**May produce:** common LegalResearchWorkProduct.  
**Must not happen:** player answer-key access.  
**Expected:** valid direct execution.

### Case 37 — Delegated research

**Fixture:** Associate gets same TaskDefinition/context/direction.  
**May produce:** same source/query/rule/analysis ontology.  
**Must not happen:** separate simplified engine.  
**Expected:** semantic equivalence.

### Case 38 — Hidden success-percentage delegation

**Fixture:** NPC receives `87% correct answer` result.  
**May produce:** explicit WorkProduct under common semantics.  
**Must not happen:** hidden correctness percentage.  
**Expected:** forbidden.

### Case 39 — Research memo update

**Fixture:** Review Task revises memo v1 into v2.  
**May produce:** linked v2 and current projection.  
**Must not happen:** v1 deletion.  
**Expected:** lineage preserved.

### Case 40 — Later authority challenges old memo

**Fixture:** A-new conflicts with v1 assumptions.  
**May produce:** challenge/supersession analysis and follow-up.  
**Must not happen:** retroactive v1 rewrite.  
**Expected:** history remains.

### Case 41 — ResearchWorkProduct to CourtRecord attack

**Fixture:** Internal research memo directly enters CourtRecord.  
**May produce:** later draft/submission Task candidate.  
**Must not happen:** automatic procedural materialization.  
**Expected:** forbidden.

### Case 42 — IssueAnalysis to JII attack

**Fixture:** Strong analysis directly changes JudgeInterpretationInput.  
**May produce:** Argument/drafting inputs.  
**Must not happen:** JII/ChoicePoint modifier.  
**Expected:** forbidden.

### Case 43 — IssueAnalysis to CourtFactFinding attack

**Fixture:** Lawyer conclusion directly changes finding.  
**May produce:** internal analysis only.  
**Must not happen:** CourtFactFinding/outcome modifier.  
**Expected:** forbidden.

### Case 44 — Hidden winning authority marker

**Fixture:** UI marks one undiscovered/located case as `winning authority`.  
**May produce:** known relevance/interpretation candidate only after research.  
**Must not happen:** hidden correctness/importance disclosure.  
**Expected:** forbidden.

## 24. Special pressure fixtures

### A. Hidden legal oracle

If a game-side legal model treats Interpretation B as canonical, Issue I3 research still cannot return B merely because of that hidden state. The researcher must traverse authorized source/query/research semantics. Hidden legal model is not firm knowledge or an answer API.

### B. Misleading authority

Authority A appears favorable but contains limiting language the researcher misses. A fallible RecordedLegalExtraction, RuleStatement and IssueAnalysis may exist; the source remains unchanged and the hidden legal model does not auto-correct them. Exact error probability is TBD.

### C. Conditional factual application

`If Statement S4 is accepted, Rule R may support Conclusion C` is valid. S4 remains a Statement and is not set true.

### D. Conflicting legal and factual branches

`Fact Scenario A + Interpretation X` and `Fact Scenario B + Interpretation Y` may coexist with distinct assumptions, sources and reasoning. No single `case answer` is automatically generated.

## 25. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Explicit Legal Research Task | 1–3 | PASS candidate | Question/domain required |
| Research ≠ Evidence Review/Investigation | 1, 24–27 | PASS candidate | Different inputs/outputs |
| Explicit Issue/question basis | 1–3, 6 | PASS candidate | No winning-law prompt |
| Bounded source domain | 4–6, 17 | PASS candidate | No all-law query |
| No hidden correct-law query | 3, 44, §24A | PASS candidate | Hidden model inaccessible |
| Source exists ≠ found | 7 | PASS candidate | Miss valid |
| Found ≠ reviewed/understood | 8–9 | PASS candidate | Citation not rule |
| Found authority ≠ applicable/controlling | 12–14 | PASS candidate | Context preserved |
| LegalSource ≠ extraction/RuleStatement | 9–11, §24B | PASS candidate | Fallible layers |
| Legal extraction may be mistaken | 9, 11, §24B | PASS candidate | Source not rewritten |
| RuleStatement ≠ governing law | 10–12 | PASS candidate | Candidate only |
| Count ≠ legal truth | 15–16 | PASS candidate | No vote |
| Conflicting authorities coexist | 15–16, 30 | PASS candidate | No auto-resolution |
| Jurisdiction/version/time preserved | 13–14, 20 | PASS candidate | Context limitations |
| Search no result ≠ absence | 17 | PASS candidate | Domain/query/time bounded |
| Research may miss | 7, 18–19 | PASS candidate | Capability not exhaustive |
| No ResearchScore/weighted sum | 18–19, 35, 38 | PASS candidate | Structured outputs |
| Authorized Case File only | 24–27 | PASS candidate | No ActualStateRecord |
| Assertions/Statements/Analysis retain types | 24–26 | PASS candidate | No fact laundering |
| Conditional assumption ≠ truth | 28, §24C | PASS candidate | Explicit if-branch |
| Competing factual scenarios coexist | 29, §24D | PASS candidate | No factual winner |
| Competing interpretations coexist | 15, 30, §24D | PASS candidate | No legal winner |
| IssueAnalysis ≠ outcome | 31–32, 42–43 | PASS candidate | ProfessionalAnalysis |
| Conclusion ≠ judgment | 31–32 | PASS candidate | Qualified candidate |
| Argument ≠ correct law | 33–34 | PASS candidate | Advocacy choice |
| Specialist ≠ oracle | 18–19 | PASS candidate | Scope/errors valid |
| Direct/delegated same ontology | 36–38 | PASS candidate | No percentage engine |
| History/version preserved | 20–21, 39–40 | PASS candidate | No overwrite |
| WorkProduct ≠ CourtRecord | 41 | PASS candidate | Procedure gate |
| No direct JII/finding | 42–43 | PASS candidate | Litigation boundary |
| No hidden winning marker/count | 3, 44 | PASS candidate | No answer-key UI |
| No CaseStrength authority | 35 | PASS candidate | Structured Issues |
| Research gaps/follow-up explicit | 17, 22–23 | PASS candidate | Bounded expansion |

## 26. Contradiction audit

| Check | Result | Note |
|---|---|---|
| Hidden correct-law query | Rejected | Cases 3, 44; §24A |
| LegalSource/RuleStatement collapse | Rejected | Cases 9–11 |
| RuleStatement/governing-law collapse | Rejected | Cases 10–12 |
| Authority/applicability collapse | Rejected | Cases 12–14 |
| Count/legal-truth collapse | Rejected | Cases 15–16 |
| Jurisdiction/version ignored | Rejected | Cases 13–14, 20 |
| Search-no-result/global-absence collapse | Rejected | Case 17 |
| Research skill/oracle collapse | Rejected | Cases 18–19 |
| IssueAnalysis/ActualStateRecord leakage | Rejected | Case 27 |
| Assertion/fact collapse | Rejected | Cases 24–26 |
| Conditional assumption/truth collapse | Rejected | Case 28; §24C |
| Competing scenarios auto-resolve | Rejected | Cases 29–30; §24D |
| Conclusion/judgment collapse | Rejected | Cases 31–32 |
| Argument/correct-law collapse | Rejected | Cases 33–34 |
| CaseStrength authority | Rejected | Case 35 |
| Direct/delegated divergence | Rejected | Cases 36–38 |
| History overwrite | Rejected | Cases 20, 39–40 |
| CourtRecord/JII/finding bypass | Rejected | Cases 41–43 |
| Substantive Korean law invented | None | All doctrine/hierarchy remains TBD |

## 27. False-PASS / False-PARTIAL boundary

A fixture may use only supplied sources, jurisdiction/context, queries, Issue inputs and task-specific outcomes. It must not invent Korean substantive law, hierarchy, binding/persuasive status, precedent effect, jurisdiction rules, search algorithm, hidden correct interpretation, source reliability, case outcome or judge acceptance to force PASS.

Exact legal content, search engine, hierarchy, jurisdiction taxonomy, Korean doctrine, citations, probability, UI and AI being TBD is not a PARTIAL reason. PARTIAL is reserved for a genuine semantic ambiguity.

## 28. Explicit TBD

- Substantive legal content, Korean statutes/cases/doctrine and legal-source taxonomy.
- Authority hierarchy, jurisdiction, precedent/binding/persuasive and temporal applicability rules.
- Source database/access, query/search algorithms and miss/error mechanics.
- RecordedLegalExtraction implementation, citation format and source updating.
- Capability mappings, Issue taxonomy, IRAC projection and Argument model.
- Research completion/depth, ResearchLead/follow-up and parallel coordination.
- Drafting, pleading, filing and judge legal-interpretation inputs.
- Player UI/minigames, NPC AI, save/schema/API/Godot implementation.
- Performance and balancing.

## 29. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Correct-answer search | Query returns hidden legal solution | Research gameplay collapses | Explicit source/query path |
| Hidden winning authority | UI marks decisive source | Answer-key leak | Candidate relevance only |
| Every query useful | No misses/dead ends | Scope/skill choices are fake | Incomplete/no-result valid |
| Skill guarantees correct law | Elite researcher is oracle | Capability boundary collapses | Component contribution/fallibility |
| Majority decides law | Citation count selects rule | Hierarchy/context ignored | Preserve conflicts |
| Old source ignored | Latest state rewrites history | Time-specific reasoning lost | Version/effective context |
| Jurisdiction ignored | Any case controls | Fabricated doctrine | Context refs/TBD rules |
| RuleStatement treated as law | Memo synthesis becomes authority | Error cannot exist | Separate source/extraction/rule |
| IssueAnalysis treated as outcome | Lawyer conclusion decides case | Adjudication bypass | ProfessionalAnalysis only |
| CaseStrength score | One number replaces structure | Facts/law/uncertainty collapse | Structured Issues/scenarios |
| Conditional assumption becomes fact | `if A` sets A true | Truth laundering | Typed assumptions |
| Duplicate research busywork | Same source paths repeatedly processed | Poor gameplay | Identity/provenance projection TBD |
| Authority overload | Too many citations shown equally | Player cannot reason | Scope/filter/synthesis aids TBD |
| Legal realism overload | Doctrine detail dominates game | Playability collapses | Layered abstraction/content curation |
| Fabricated Korean doctrine | Generic mechanics assert real rules | Inaccuracy | Content/jurisdiction TBD |
| Delegation percentage engine | NPC returns correctness % | Semantic divergence | Same Task/WorkProduct ontology |
| Auto-winning Argument | Research writes guaranteed filing | Strategy/adjudication collapse | Argument remains candidate |
| Direct judge effect | Analysis changes JII/finding | Litigation boundary bypass | Procedural path only |

## 30. Player-facing design principle

Player should see the legal question, found/reviewed sources, recorded propositions, RuleStatements, conflicting authority, jurisdiction/version warnings, factual assumptions, application reasoning, alternative interpretations, research gaps and follow-up Tasks. Player should not see a hidden correct interpretation, hidden winning authority, guaranteed judge acceptance, objective CaseStrength, undiscovered decisive-case count or future outcome.

## 31. Solo → firm progression hook

```text
Solo → player researches core questions
Associate → delegated first-pass research
Specialist → domain-specific deeper research
Larger firm → parallel research branches and Issue ownership
Partner/player → selects strategic Issues, interpretations and Arguments
```

This is supported architecture, not mandatory progression or a claim about Korean practice.

## 32. Suggested TEST-022 plan

Do not create the TEST here. Recommended file: `TEST-022_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md`, using at least the 44 core fixtures above and the four special pressure fixtures.

## 33. DEC-024 candidates

| Candidate | Prerequisite fit | Risk |
|---|---|---|
| Case Theory & Evidence Synthesis | Integrates factual scenarios, legal interpretations, Statements and evidence | May collapse branches into truth/CaseStrength |
| Drafting / Pleading / Filing | Converts selected Arguments to procedural artifacts | Depends on synthesis/strategy boundary |
| Client Interaction | Extends source/assertion/advice feedback | Social/ethics scope |
| Task Assignment / Workload / Team Coordination | Scales parallel research ownership | Benefits from more Task families |
| Witness Preparation / Court Examination | Advances witness lifecycle | Depends on procedure/testimony rules |

**Default recommendation:** `DEC-024 — Case Theory & Evidence Synthesis`, provided DEC-023/TEST-022 preserve factual/legal branch separation. It is the natural next boundary for combining, without truth laundering, the outputs now produced by Investigation, Evidence Review, Interview and Legal Research.

## 34. Decision summary

### Inherited Accepted

| Boundary | Status |
|---|---|
| ActualStateRecord / CaseFileState / CourtRecord / CourtFactFinding separation | **Inherited Accepted** |
| Investigation, Evidence Review and Interview epistemic handoffs | **Inherited Accepted** |
| Explicit Task/WorkProduct, capability and immutable history semantics | **Inherited Accepted** |
| No direct JII/ChoicePoint/finding effect | **Inherited Accepted** |

### Core Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| LAW1–LAW15 | Explicit bounded research, source/rule/authority/conflict/version boundaries | **Core Accepted candidate** |
| LAW17–LAW31 | Capability, typed Case File inputs, scenarios, analysis/Argument, history and court boundaries | **Core Accepted candidate** |
| LAW33–LAW35 | No CaseStrength, hidden-model separation and research gaps | **Core Accepted candidate** |
| LAW36–LAW41 | Discovery/review events, extraction/rule/interpretation/analysis materialization, Argument identity/selection and no canonical Strategy | **Core Accepted** |

### Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| LAW16, LAW32 | Research may miss authority; material follow-up is explicit | **Accepted candidate** |

### TBD

Substantive legal content, Korean doctrine, authority hierarchy, jurisdiction/precedent rules, general source/search/citation systems, errors/probabilities, capability mapping, broader Issue/IRAC/Argument catalogs, drafting/procedure, UI/AI/schema/Godot and balancing remain **TBD**. VS-004's minimum materialization gates and Argument identity/selection contract are closed by §14.1 and LAW36–LAW41.

### Forbidden

- Hidden correct-law/winning-authority query, marker or undiscovered decisive-source count.
- LegalSource, extraction, RuleStatement, governing law, interpretation, IssueAnalysis and judgment collapsed.
- Authority count, specialist status, confidence or ResearchScore used as legal truth.
- ActualStateRecord or flattened assertion/Statement/Analysis used as accepted fact.
- Conditional assumptions or competing branches auto-resolved into truth/outcome.
- Universal CaseStrength or delegated correctness percentage.
- Research/version history overwritten.
- Research/IssueAnalysis/Argument automatically enters CourtRecord or modifies JII/finding.
- Invented Korean substantive law, hierarchy or procedural effect.

## 35. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | LAW1–LAW35 define explicit bounded Legal Research, LegalSource/extraction/RuleStatement/IssueAnalysis/Argument layers, fallible/conflicting/versioned authority semantics, typed conditional scenarios, hidden legal-model separation, no score/oracle, court boundary and 44-case TEST-022 plan. |
| v0.2 | Accepted | TEST-022 existing 48 PASS와 VS-004 closure fixtures를 바탕으로 Accepted. LAW36–LAW41 add separate discovery/review events, exact extraction→rule→interpretation→analysis materialization, canonical immutable Argument identity/provenance, explicit creation/selection history and prohibition on a canonical Strategy object. |
