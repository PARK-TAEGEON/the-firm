# THE FIRM — Case Theory and Evidence Synthesis

문서 ID: DEC-LITIGATION-024  
버전: v0.2 — Accepted  
상태: **Accepted**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 Accepted 기준: `DEC-LITIGATION-023_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.2 Accepted, `TEST-022_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.2 Accepted, `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md` v0.2 Accepted, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md` v0.2 Accepted  
검증된 boundary 참고: `DEC-LITIGATION-022_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.1 Proposed, `TEST-021_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.1 Proposed / 44 PASS. VS-004 closure는 witness semantics를 소비하지 않는다.  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose / non-goals

이 문서는 지금까지 생성된 provenance-bearing Case File knowledge를 하나 이상의 사건 설명·전략 구조로 조직하는 최소 semantic model을 제안한다.

Inputs may include:

```text
SourceAssertions / Statements / RecordedExtractions
ProfessionalAnalysis / InferredRelations / KnownGaps / Issues
RuleStatements / InterpretationCandidates / IssueAnalysis
Investigation / Interview / Evidence Review results
```

These may support:

```text
EvidenceSynthesis / CaseTheory / CompetingTheory
StrategicNarrative / IssuePosition / ArgumentSelection
Gap and Risk Identification / Follow-up Task candidates
```

```text
CaseTheory ≠ objective truth ≠ accepted fact set
CaseTheory ≠ CourtFactFinding ≠ guaranteed winning strategy
```

이 문서는 source reliability, witness credibility, corroboration independence, exact synthesis/ranking, drafting/filing, court strategy, UI, AI, schema 또는 Godot implementation을 확정하지 않는다.

## 2. Inherited hard boundaries

- `ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`.
- Hidden legal model, if any, is neither firm knowledge nor lawyer analysis nor judge interpretation.
- Assertions, Statements, RecordedExtractions, ProfessionalAnalysis, RuleStatements and IssueAnalysis retain their epistemic types.
- Investigation, Evidence Review, Interview and Legal Research outputs reach synthesis only through authorized Case File refs.
- Direct/delegated Tasks, component capabilities, structured WorkProducts, materialized events, no reload reroll and immutable history are inherited.
- CaseTheory/EvidenceSynthesis/strategy cannot create or activate ChoicePoints, resolve requirements, or directly alter JII/finding/outcome.

## 3. Core semantic separation

```text
Evidence / Statement / Assertion
≠ ProfessionalAnalysis
≠ EvidenceSynthesis
≠ CaseTheory
≠ StrategicNarrative
≠ Argument
≠ CourtRecord
≠ CourtFactFinding
```

```text
CaseTheory selected ≠ CaseTheory true
Strategic priority ≠ epistemic certainty
```

Synthesis is an authored organization of typed, fallible, sometimes conflicting Case File knowledge. It is not a fact-resolution or adjudication engine.

## 4. CaseTheory semantic object

`CaseTheory` is a provenance-bearing, lawyer-authored structured explanation of what may have happened, why it may matter to Issues, what supports/challenges it, which legal interpretations relate to it, which assumptions it uses and what remains unresolved.

```text
CaseTheory CT-1

Theory:
Termination decision was made before formal review.

Supports:
A1 / E12 analysis / S4

Challenges:
S7 / E19

Legal relevance:
Issue I3 under Interpretation R2

Assumptions:
S4 accepted; E12 date interpretation accepted

KnownGaps:
approval email missing; decision-maker Interview incomplete
```

CT-1 is analysis/strategy, not truth. Conceptual provenance includes author/team, time, profile/version, source and Issue refs, RuleStatement/Interpretation refs, assumptions, support/challenge relations, KnownGaps and theory version/history. Exact schema is TBD.

## 5. Multiple, incomplete and wrong theories

Multiple theories may coexist, including uncertainty-oriented alternatives:

```text
CT-1: decision predetermined
CT-2: decision made after legitimate review
CT-3: record too incomplete to determine timing
```

A theory may be incomplete, provisional, contested, fragmented, assumption-heavy, under-researched or awaiting evidence/interview. It need not cover the whole case. `No sufficiently developed theory yet` is valid.

A CaseTheory may be wrong relative to hidden world state. A wrong theory may look strong because sources are incomplete/misleading; a hidden-correct theory may look weak because support is missing. Hidden truth must not correct, boost, weaken or rank either.

## 6. Authorized input boundary

Synthesis may read only an authorized Case File snapshot and explicitly included WorkProducts/source families. It cannot read ActualStateRecord or hidden legal model.

```text
ActualStateRecord ≠ CaseTheory generation authority
hidden legal model ≠ CaseTheory legal-branch oracle
```

Each source object retains assertion/statement/analysis/status/version. Inclusion in a theory does not upgrade its epistemic authority.

## 7. EvidenceSynthesis

`EvidenceSynthesis` is structured organization across multiple inputs. It may identify convergence, apparent inconsistency, chronology patterns, missing links, competing explanations, source dependencies, duplicated assertions, unresolved conflicts and Issue relevance.

It does not decide objective truth. Candidate relations may include `may_support`, `may_undermine`, `is_consistent_with`, `appears_inconsistent_with`, `depends_on`, `assumes` and `leaves_unresolved`. Exact vocabulary is TBD. Generic `proves`, `disproves` or `confirms truth` relations are not default synthesis semantics.

## 8. Count, corroboration and contradiction boundaries

```text
3 witnesses say X + 1 says Y ≠ X true
5 documents support X ≠ X confirmed
corroboration ≠ truth
contradiction ≠ one side false ≠ deception
```

Count can be descriptive metadata only. Sources may share common origin, copied information or the same mistaken assumption; source independence mechanics are TBD. Contradiction can support a concern or competing explanations but does not identify falsity/intent.

## 9. Chronology synthesis

CaseTheory may organize TimelineEntries into a narrative chronology, preserving source-reported, observable/procedural, reconstructed, inferred, disputed and unknown status as applicable.

```text
reconstructed chronology ≠ ActualState chronology
```

Selection of one timeline branch for strategy is not fact acceptance.

## 10. Factual and legal branch integration

CaseTheory may reuse DEC-023 conditional factual scenarios and competing legal interpretations.

```text
Scenario A: if S1 accepted → Interpretation X
Scenario B: if E3 analysis accepted → Interpretation Y
```

The player/team may prioritize a branch, but `selected factual branch ≠ accepted fact`, and `selected legal branch ≠ governing law/judge interpretation`.

## 11. CaseTheory, StrategicNarrative and Argument

CaseTheory is a broad explanatory/strategic model. StrategicNarrative is a selected presentation-oriented organization. Argument is a specific advocacy formulation for later drafting/oral/procedural use.

```text
CaseTheory ≠ StrategicNarrative ≠ Argument
Argument selection ≠ legal correctness
```

One CaseTheory may support multiple Arguments; multiple theories may support one Argument. Exact Argument/drafting handoff is TBD.

### 11.1 VS-004 strategic-state closure

VS-004에는 canonical `Strategy` object를 도입하지 않는다. 이 slice에서 "strategy finalization"은 current `CaseTheory` version을 바꾸거나 복제하는 행위가 아니라, DEC-023의 provenance-bearing `Argument` 중 하나를 explicit selection event로 current choice로 지정하는 UI/workflow 표현이다. 선택 이력은 보존되며 다음 선택은 이전 Argument나 selection event를 overwrite하지 않는다.

```text
CaseTheory ≠ Argument ≠ ArgumentSelectionEvent
current argument selection ≠ Strategy object ≠ legal correctness
```

`StrategicNarrative`도 VS-004의 필수 materialized object가 아니다. Submission, CourtRecord 또는 adjudication으로 이어지는 handoff는 이 문서와 VS-004 범위 밖이다.

## 12. Comparison and strategic selection

Theories may be compared through structured dimensions such as supporting/challenging inputs, assumption load, unresolved gaps, legal support, factual vulnerability, procedural usability and resource needs. There is no hidden aggregate winner.

PrimaryTheory, SecondaryTheory, AlternativeTheory and AbandonedTheory are possible strategic-status concepts, not canonical vocabulary. `PrimaryTheory ≠ true theory`. Organizational authority to choose strategy does not create epistemic authority.

No canonical `TheoryConfidence=83`, `TheoryScore=91`, `CaseStrength=79` or hidden weighted formula owns semantics. Qualitative descriptors such as well-supported, contested, assumption-heavy, gap-heavy, internally inconsistent or legally uncertain may be projections/analysis only.

## 13. Theory revision, abandonment, merge and split

New evidence, Statements or legal research may challenge, refine, supersede, split, merge or cause abandonment. Exact status vocabulary is TBD. No in-place rewrite.

```text
CT-1 + CT-2 → CT-3
```

CT-1/CT-2 remain parent histories. A split retains the original and creates linked alternatives. Abandoned theory, past Tasks and Arguments remain traceable; later renewed relevance creates another historical transition rather than retroactive correction.

## 14. Synthesis Task and WorkProduct

Illustrative `CaseTheorySynthesisTaskDefinition`:

```text
CaseTheorySynthesisTaskDefinition
├─ target Case / Issues
├─ authorized Case File snapshot
├─ included WorkProducts / source families
├─ selected factual scenarios / legal interpretations
├─ purpose / scope / eligible roles
├─ time/resources/direction/dependencies
├─ capability refs
└─ expected outputs / completion semantics
```

Illustrative WorkProduct:

```text
CaseTheorySynthesisWorkProduct
├─ Task / performer/profile refs
├─ Case / Issue / authorized snapshot refs
├─ source / Statement / analysis refs
├─ factual scenarios / legal interpretations
├─ EvidenceSynthesis relations / CaseTheory candidates
├─ strategic selections
├─ supporting/challenging inputs / assumptions
├─ KnownGaps / risks / vulnerabilities
├─ follow-up Task candidates
└─ provenance / version / history
```

There is no universal `SynthesisDifficulty` or `SynthesisQuality`.

## 15. Capability contribution and execution

Illustrative component contributions:

```text
factual synthesis → cross-source integration
issue spotting → Issue/theory linkage
legal analysis → theory/interpretation alignment
strategic judgment → selection/prioritization
attention/detail → contradiction/gap/assumption identification
```

No weighted sum or `CaseTheorySkill`. Exceptional capability can improve explicit WorkProduct components within authorized inputs but cannot reveal hidden facts/law or guarantee correctness.

Player-direct synthesis may select Issues, links, chronology, assumptions, theory branches, primary theory, weaknesses and follow-up Tasks. Delegated synthesis uses the same ontology, not `89% correct strategy`. UI/NPC AI are TBD.

## 16. Parallel synthesis, seniority and consensus

Lawyer A and B may independently create CT-A and CT-B. They remain separate WorkProducts until explicit comparison/review/synthesis Task. No auto-merge.

Partner selection may be organizationally authoritative for strategy, but `Partner chooses CT-A ≠ CT-A true`. Likewise `five lawyers agree ≠ theory true`. Consensus is organizational state. Client-preferred narrative may inform strategy/hypothesis but `client insists X ≠ X true`.

## 17. Downstream hooks and court boundary

CaseTheory may feed later drafting, pleading, evidence selection, witness preparation, examination strategy and argument sequencing. DEC-024 does not define these systems.

```text
CaseTheory ≠ CourtRecord ≠ JudgeInterpretationInput ≠ CourtFactFinding
EvidenceSynthesis ≠ judge fact synthesis
```

CaseTheory does not create/activate ChoicePoints, select judge interpretation, resolve requirements or change findings. Later Arguments must traverse explicit valid procedural paths.

## 18. Player-facing feedback

Player feedback should show theory statement, supporting/challenging inputs, assumptions, legal basis, competing theories, unresolved gaps, history, strategic status and reasons for revision. It must not show correct-theory badge, hidden truth alignment, hidden reliability, hidden TheoryScore/CaseStrength, win probability, decisive-evidence remaining count or future judge acceptance.

## 19. Design decisions

### SYN1 — CaseTheory as provenance-bearing object

**Problem:** theory를 transient UI label로 둘 것인가?  
**Alternatives:** label; structured versioned analysis object.  
**Failure modes:** inputs/assumptions/history cannot be audited.  
**Recommendation:** explicit provenance-bearing CaseTheory.  
**Status:** **Core Accepted candidate**  
**Reason:** strategy must be explainable.

### SYN2 — CaseTheory ≠ truth

**Problem:** authored theory가 objective event model인가?  
**Alternatives:** truth object; fallible analysis.  
**Failure modes:** firm knowledge becomes answer key.  
**Recommendation:** never promote theory to truth by creation/selection.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-019 epistemic boundary.

### SYN3 — Authorized Case File inputs only

**Problem:** synthesis may use hidden world/legal state인가?  
**Alternatives:** hidden access; authorized snapshot.  
**Failure modes:** evidence/legal research bypass.  
**Recommendation:** consume authorized Case File refs only.  
**Status:** **Core Accepted candidate**  
**Reason:** provenance and player knowledge preserved.

### SYN4 — No ActualStateRecord query

**Problem:** true event chain may rank theories인가?  
**Alternatives:** hidden comparison; no query.  
**Failure modes:** wrong theories auto-correct.  
**Recommendation:** prohibit ActualStateRecord access/ranking.  
**Status:** **Core Accepted candidate**  
**Reason:** world truth is not firm knowledge.

### SYN5 — No hidden legal-model query

**Problem:** correct law may select theory branch인가?  
**Alternatives:** hidden legal oracle; candidate legal inputs only.  
**Failure modes:** DEC-023 separation collapses.  
**Recommendation:** hidden legal model is inaccessible.  
**Status:** **Core Accepted candidate**  
**Reason:** strategic law selection ≠ governing law.

### SYN6 — EvidenceSynthesis ≠ fact resolution

**Problem:** combining inputs decides truth인가?  
**Alternatives:** resolution engine; structured organization.  
**Failure modes:** synthesis becomes adjudication.  
**Recommendation:** synthesis preserves typed branches/conflicts.  
**Status:** **Core Accepted candidate**  
**Reason:** fact finding remains downstream.

### SYN7 — Support relation ≠ proof

**Problem:** `supports` edge proves theory인가?  
**Alternatives:** proof edge; contextual candidate relation.  
**Failure modes:** one analyst link creates truth.  
**Recommendation:** support remains provenance-bearing analysis.  
**Status:** **Core Accepted candidate**  
**Reason:** inputs may be wrong/conditional.

### SYN8 — Challenge relation ≠ disproof

**Problem:** challenge edge falsifies theory인가?  
**Alternatives:** disproof; vulnerability relation.  
**Failure modes:** contradiction chooses winner.  
**Recommendation:** challenge identifies pressure, not objective falsity.  
**Status:** **Core Accepted candidate**  
**Reason:** competing explanations remain possible.

### SYN9 — Evidence count ≠ truth

**Problem:** sources vote on facts인가?  
**Alternatives:** majority; descriptive count only.  
**Failure modes:** duplicates/dependencies distort truth.  
**Recommendation:** no count-based truth authority.  
**Status:** **Core Accepted candidate**  
**Reason:** provenance matters more than tally.

### SYN10 — Corroboration ≠ truth

**Problem:** corroborating candidates confirm objective fact인가?  
**Alternatives:** auto-confirm; contextual relation.  
**Failure modes:** common-source errors disappear.  
**Recommendation:** corroboration remains candidate analysis.  
**Status:** **Core Accepted candidate**  
**Reason:** independence/reliability TBD.

### SYN11 — Contradiction ≠ falsity/deception

**Problem:** inconsistent inputs identify false/liar side인가?  
**Alternatives:** auto-resolution; unresolved conflict.  
**Failure modes:** memory/context/error are erased.  
**Recommendation:** preserve contradiction and explanations separately.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-022 boundary.

### SYN12 — Reconstructed chronology ≠ actual chronology

**Problem:** narrative timeline is world history인가?  
**Alternatives:** truth timeline; typed reconstruction.  
**Failure modes:** disputed dates are laundered.  
**Recommendation:** preserve status/source/branch.  
**Status:** **Core Accepted candidate**  
**Reason:** timeline is analysis.

### SYN13 — Competing CaseTheories coexist

**Problem:** one case permits one theory인가?  
**Alternatives:** single winner; multiple candidates.  
**Failure modes:** uncertainty prematurely resolves.  
**Recommendation:** allow multiple and uncertainty theories.  
**Status:** **Core Accepted candidate**  
**Reason:** strategy needs alternatives.

### SYN14 — No-theory/incomplete theory valid

**Problem:** every case must have coherent narrative인가?  
**Alternatives:** forced generation; incomplete/no-theory state.  
**Failure modes:** insufficient data becomes fabricated coherence.  
**Recommendation:** permit partial and no-theory states.  
**Status:** **Core Accepted candidate**  
**Reason:** gaps remain meaningful.

### SYN15 — Wrong theory valid

**Problem:** theories must match hidden truth인가?  
**Alternatives:** auto-correct; fallible theory.  
**Failure modes:** strategy becomes truth oracle.  
**Recommendation:** allow wrong theories without hidden warning.  
**Status:** **Core Accepted candidate**  
**Reason:** incomplete/misleading knowledge matters.

### SYN16 — Hidden truth does not boost theory

**Problem:** hidden alignment modifies theory quality/rank인가?  
**Alternatives:** hidden bonus; input-grounded evaluation only.  
**Failure modes:** weak hidden-correct branch leaks.  
**Recommendation:** no truth-alignment effect.  
**Status:** **Core Accepted candidate**  
**Reason:** firm cannot see answer key.

### SYN17 — Factual branch selection ≠ fact acceptance

**Problem:** strategic scenario selection mutates Case File facts인가?  
**Alternatives:** accept fact; selection status only.  
**Failure modes:** assumptions become truth.  
**Recommendation:** preserve typed/conditional inputs.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-023 branching boundary.

### SYN18 — Legal branch selection ≠ correct law

**Problem:** selected interpretation becomes governing law인가?  
**Alternatives:** truth promotion; strategic position.  
**Failure modes:** hidden legal model/court bypass.  
**Recommendation:** selection is strategy only.  
**Status:** **Core Accepted candidate**  
**Reason:** judge interpretation remains downstream.

### SYN19 — CaseTheory ≠ Argument

**Problem:** explanatory model and advocacy claim are identical인가?  
**Alternatives:** collapse; separate linked objects.  
**Failure modes:** selection masquerades as analysis.  
**Recommendation:** distinguish CaseTheory and Argument.  
**Status:** **Core Accepted candidate**  
**Reason:** one-to-many relationships are possible.

### SYN20 — Strategic selection ≠ correctness

**Problem:** PrimaryTheory status proves theory인가?  
**Alternatives:** truth flag; organizational state.  
**Failure modes:** strategy mutates epistemology.  
**Recommendation:** selection affects planning, not truth.  
**Status:** **Core Accepted candidate**  
**Reason:** player choice must remain strategic.

### SYN21 — No universal TheoryScore/CaseStrength

**Problem:** theory/case quality를 one number로 정렬하는가?  
**Alternatives:** aggregate score; structured comparison.  
**Failure modes:** support, gaps and assumptions disappear.  
**Recommendation:** prohibit canonical universal score.  
**Status:** **Core Accepted candidate**  
**Reason:** no hidden winner.

### SYN22 — Structured comparison without aggregate winner

**Problem:** theories를 어떻게 비교하는가?  
**Alternatives:** total score; explicit dimensions.  
**Failure modes:** weighted formula silently returns.  
**Recommendation:** compare support/challenge/assumption/gap/legal/resource dimensions.  
**Status:** **Accepted candidate**  
**Reason:** exact vocabulary can remain TBD.

### SYN23 — Revision preserves history

**Problem:** new inputs mutate theory in place인가?  
**Alternatives:** overwrite; version lineage.  
**Failure modes:** past decisions become inexplicable.  
**Recommendation:** revision creates linked version/state.  
**Status:** **Core Accepted candidate**  
**Reason:** immutable provenance.

### SYN24 — Abandoned theory preserved

**Problem:** abandoned strategy is deleted인가?  
**Alternatives:** delete; historical status.  
**Failure modes:** prior Tasks/Arguments lose basis.  
**Recommendation:** preserve theory and abandonment reason/time.  
**Status:** **Core Accepted candidate**  
**Reason:** traceable strategy history.

### SYN25 — Merge preserves parents

**Problem:** merging CT-1/CT-2 replaces them인가?  
**Alternatives:** destructive merge; new CT-3 with parent refs.  
**Failure modes:** source theories disappear.  
**Recommendation:** preserve both parents and merge provenance.  
**Status:** **Core Accepted candidate**  
**Reason:** no retrospective rewrite.

### SYN26 — Split preserves lineage

**Problem:** split alternatives erase original인가?  
**Alternatives:** replace; linked child theories.  
**Failure modes:** uncertainty/history hidden.  
**Recommendation:** preserve original and child refs.  
**Status:** **Core Accepted candidate**  
**Reason:** revision path remains visible.

### SYN27 — Explicit Synthesis Task/WorkProduct

**Problem:** synthesis is free automatic Case File operation인가?  
**Alternatives:** auto-summary; explicit Task/WorkProduct.  
**Failure modes:** actor, scope, inputs and cost vanish.  
**Recommendation:** use explicit CaseTheorySynthesis Task.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018 semantics.

### SYN28 — Capability component contribution only

**Problem:** skill score chooses correct theory인가?  
**Alternatives:** correctness roll; component contribution.  
**Failure modes:** lawyer becomes oracle.  
**Recommendation:** capabilities affect explicit WorkProduct components only.  
**Status:** **Core Accepted candidate**  
**Reason:** no weighted sum/truth access.

### SYN29 — Exceptional lawyer ≠ theory oracle

**Problem:** elite lawyer gets hidden-truth alignment인가?  
**Alternatives:** oracle bonus; authorized inputs only.  
**Failure modes:** profile bypasses evidence/research.  
**Recommendation:** no hidden correctness benefit.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-017 boundary.

### SYN30 — Direct/delegated same ontology

**Problem:** NPC synthesis uses correctness percentage인가?  
**Alternatives:** separate engine; common Task/WorkProduct.  
**Failure modes:** delegated work gains hidden knowledge.  
**Recommendation:** same ontology, different explicit inputs.  
**Status:** **Core Accepted candidate**  
**Reason:** solo-to-firm continuity.

### SYN31 — Parallel theories do not auto-merge

**Problem:** team outputs automatically become one theory인가?  
**Alternatives:** automatic final; explicit comparison/synthesis Task.  
**Failure modes:** conflicts/provenance disappear.  
**Recommendation:** preserve independent WorkProducts until explicit work.  
**Status:** **Core Accepted candidate**  
**Reason:** coordination is not truth resolution.

### SYN32 — Seniority ≠ epistemic authority

**Problem:** partner choice makes theory true인가?  
**Alternatives:** seniority truth; organizational selection only.  
**Failure modes:** hierarchy replaces evidence.  
**Recommendation:** separate decision authority from epistemic status.  
**Status:** **Core Accepted candidate**  
**Reason:** reputation/role is not finding modifier.

### SYN33 — Consensus ≠ truth

**Problem:** team vote determines theory correctness인가?  
**Alternatives:** majority truth; organizational consensus.  
**Failure modes:** shared mistake becomes fact.  
**Recommendation:** consensus never changes truth status.  
**Status:** **Core Accepted candidate**  
**Reason:** count has no epistemic authority.

### SYN34 — CaseTheory ≠ CourtRecord/JII/finding

**Problem:** selected theory directly affects court인가?  
**Alternatives:** direct feed; later procedural artifacts.  
**Failure modes:** drafting/filing/judge boundaries collapse.  
**Recommendation:** prohibit direct CourtRecord/JII/finding effects.  
**Status:** **Core Accepted candidate**  
**Reason:** litigation non-interference.

### SYN35 — No hidden correct-theory marker/ranking

**Problem:** UI/system reveals theory alignment or decisive gaps인가?  
**Alternatives:** correctness badge; input-grounded feedback.  
**Failure modes:** hidden answer/count leaks.  
**Recommendation:** expose support/challenge/assumptions/history only.  
**Status:** **Core Accepted candidate**  
**Reason:** player sees firm knowledge, not answer key.

## 20. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | CaseTheory is provenance-bearing | **Core Accepted candidate** |
| 2 | CaseTheory ≠ truth | **Core Accepted candidate** |
| 3 | CaseTheory uses authorized Case File only | **Core Accepted candidate** |
| 4 | ActualStateRecord is unavailable to synthesis | **Core Accepted candidate** |
| 5 | Hidden legal model is unavailable to synthesis | **Core Accepted candidate** |
| 6 | EvidenceSynthesis ≠ fact resolution | **Core Accepted candidate** |
| 7 | Support relation ≠ proof | **Core Accepted candidate** |
| 8 | Challenge relation ≠ disproof | **Core Accepted candidate** |
| 9 | Evidence count ≠ truth | **Core Accepted candidate** |
| 10 | Witness count ≠ truth | **Core Accepted candidate** |
| 11 | Document count ≠ truth | **Core Accepted candidate** |
| 12 | Corroboration ≠ truth | **Core Accepted candidate** |
| 13 | Contradiction ≠ falsity | **Core Accepted candidate** |
| 14 | Contradiction ≠ deception | **Core Accepted candidate** |
| 15 | Reconstructed chronology ≠ actual chronology | **Core Accepted candidate** |
| 16 | Multiple CaseTheories may coexist | **Core Accepted candidate** |
| 17 | Theory need not cover the whole Case | **Core Accepted candidate** |
| 18 | No-theory state is valid | **Core Accepted candidate** |
| 19 | Wrong theory is valid | **Core Accepted candidate** |
| 20 | Strong-looking wrong theory is valid | **Core Accepted candidate** |
| 21 | Weak-looking hidden-correct theory is valid | **Core Accepted candidate** |
| 22 | Hidden truth does not boost/weaken/rank a theory | **Core Accepted candidate** |
| 23 | Factual scenario selection ≠ fact acceptance | **Core Accepted candidate** |
| 24 | Legal interpretation selection ≠ governing law | **Core Accepted candidate** |
| 25 | PrimaryTheory ≠ true theory | **Core Accepted candidate** |
| 26 | Abandoned theory history is preserved | **Core Accepted candidate** |
| 27 | Theory revision preserves lineage | **Core Accepted candidate** |
| 28 | Theory merge preserves parents | **Core Accepted candidate** |
| 29 | Theory split preserves original history | **Core Accepted candidate** |
| 30 | CaseTheory ≠ Argument | **Core Accepted candidate** |
| 31 | Argument selection ≠ legal correctness | **Core Accepted candidate** |
| 32 | No universal TheoryScore | **Core Accepted candidate** |
| 33 | No universal CaseStrength | **Core Accepted candidate** |
| 34 | No hidden weighted formula | **Core Accepted candidate** |
| 35 | Comparison dimensions remain structured | **Accepted candidate** |
| 36 | Capability does not guarantee correct theory | **Core Accepted candidate** |
| 37 | Exceptional lawyer ≠ truth oracle | **Core Accepted candidate** |
| 38 | Direct/delegated synthesis use same ontology | **Core Accepted candidate** |
| 39 | Parallel theories do not auto-merge | **Core Accepted candidate** |
| 40 | Partner selection ≠ truth | **Core Accepted candidate** |
| 41 | Team consensus ≠ truth | **Core Accepted candidate** |
| 42 | Client narrative ≠ truth | **Core Accepted candidate** |
| 43 | CaseTheory ≠ CourtRecord | **Core Accepted candidate** |
| 44 | CaseTheory does not directly modify JII | **Core Accepted candidate** |
| 45 | CaseTheory does not directly modify CourtFactFinding | **Core Accepted candidate** |
| 46 | EvidenceSynthesis ≠ judge synthesis | **Core Accepted candidate** |
| 47 | No hidden correct-theory marker/ranking | **Core Accepted candidate** |
| 48 | No hidden decisive-evidence count | **Core Accepted candidate** |

## 21. Pressure-test examples

All fixtures are synthetic semantic examples, not implementation tests or claims about Korean law.

### Case 1 — Basic CaseTheory creation

**Fixture:** Authorized A1, E12 analysis, S4, I3, R2, assumptions and gaps.  
**May produce:** CT-1 with support/challenge/legal refs and provenance.  
**Must not happen:** CT-1 becomes fact.  
**Expected:** valid CaseTheory.

### Case 2 — Insufficient information / no theory

**Fixture:** Sources and Issues are too sparse for coherent theory.  
**May produce:** KnownGaps/follow-up Tasks/no-theory status.  
**Must not happen:** fabricated narrative.  
**Expected:** no sufficiently developed theory is valid.

### Case 3 — Theory based on SourceAssertions

**Fixture:** CT-A references A1/A7 assertions.  
**May produce:** conditional support relations.  
**Must not happen:** assertions become accepted facts.  
**Expected:** typed inputs preserved.

### Case 4 — Theory based on Statements

**Fixture:** CT-A references S1/S4.  
**May produce:** support/challenge candidates.  
**Must not happen:** Statements become truth.  
**Expected:** provenance retained.

### Case 5 — Theory based on ProfessionalAnalysis

**Fixture:** CT-A uses PA2/PA7.  
**May produce:** analysis-based relation with refs.  
**Must not happen:** PA becomes fact.  
**Expected:** analysis layers remain.

### Case 6 — Theory based on RuleStatements

**Fixture:** CT-A links R2/Interpretation X to I3.  
**May produce:** legal support candidate.  
**Must not happen:** R2 becomes governing law.  
**Expected:** legal branch remains candidate.

### Case 7 — Hidden ActualStateRecord injection

**Fixture:** Hidden event B is absent from Case File but added to CT.  
**May produce:** none.  
**Must not happen:** ActualStateRecord read.  
**Expected:** forbidden.

### Case 8 — Hidden legal-model injection

**Fixture:** Hidden canonical Rule X is inserted into CT.  
**May produce:** only researched RuleStatements/interpretations.  
**Must not happen:** legal oracle.  
**Expected:** forbidden.

### Case 9 — Support relation

**Fixture:** A1 may support CT-A under assumption S.  
**May produce:** provenance-bearing `may_support`.  
**Must not happen:** proof/truth flag.  
**Expected:** valid relation.

### Case 10 — Support equals proof attack

**Fixture:** System converts support edge to `CT-A proven`.  
**May produce:** support metadata only.  
**Must not happen:** proof promotion.  
**Expected:** forbidden.

### Case 11 — Challenge relation

**Fixture:** S7 may undermine CT-A.  
**May produce:** vulnerability/challenge relation.  
**Must not happen:** CT-A false.  
**Expected:** valid.

### Case 12 — Challenge equals disproof attack

**Fixture:** Challenge edge sets `CT-A disproven`.  
**May produce:** competing explanation/gap.  
**Must not happen:** objective falsity.  
**Expected:** forbidden.

### Case 13 — Three witnesses versus one

**Fixture:** Three Statements support X; one supports Y.  
**May produce:** descriptive counts and conflicting branches.  
**Must not happen:** X true by vote.  
**Expected:** no count authority.

### Case 14 — Five documents versus one

**Fixture:** Five SourceAssertions support X; one challenges.  
**May produce:** structured support/challenge.  
**Must not happen:** X confirmed by count.  
**Expected:** no truth vote.

### Case 15 — Corroboration candidate

**Fixture:** E1/E2 appear mutually consistent.  
**May produce:** corroboration candidate and dependency question.  
**Must not happen:** X truth.  
**Expected:** valid analysis relation.

### Case 16 — Corroboration equals truth attack

**Fixture:** Candidate is converted to confirmed fact.  
**May produce:** descriptive relation only.  
**Must not happen:** truth promotion.  
**Expected:** forbidden.

### Case 17 — Contradictory Statements

**Fixture:** S1 says 3 PM; S2 says 4 PM.  
**May produce:** conflict and alternative explanations.  
**Must not happen:** automatic false side.  
**Expected:** unresolved contradiction.

### Case 18 — Contradiction equals lie attack

**Fixture:** Conflict marks Person deceptive.  
**May produce:** deception suspicion analysis.  
**Must not happen:** confirmed intent.  
**Expected:** forbidden.

### Case 19 — Reconstructed chronology

**Fixture:** CT-A arranges disputed dates into one strategic sequence.  
**May produce:** reconstructed timeline branch.  
**Must not happen:** actual chronology.  
**Expected:** valid analysis.

### Case 20 — Chronology equals actual history attack

**Fixture:** Reconstructed timeline overwrites world/case statuses.  
**May produce:** narrative chronology only.  
**Must not happen:** truth laundering.  
**Expected:** forbidden.

### Case 21 — Two competing theories

**Fixture:** CT-A predetermined; CT-B legitimate later decision.  
**May produce:** two theories with distinct refs.  
**Must not happen:** auto-winner.  
**Expected:** coexistence.

### Case 22 — Three theories including uncertainty

**Fixture:** CT-A, CT-B and CT-C `insufficient record`.  
**May produce:** three candidates.  
**Must not happen:** forced binary theory.  
**Expected:** valid.

### Case 23 — Primary theory selection

**Fixture:** Player selects CT-A as PrimaryTheory.  
**May produce:** strategic status/tasks.  
**Must not happen:** truth flag.  
**Expected:** organizational choice.

### Case 24 — Primary equals true attack

**Fixture:** PrimaryTheory status sets CT-A true.  
**May produce:** no epistemic mutation.  
**Must not happen:** truth promotion.  
**Expected:** forbidden.

### Case 25 — Factual branch selection

**Fixture:** Strategy selects Scenario A `if S1 accepted`.  
**May produce:** selected conditional branch.  
**Must not happen:** S1 accepted fact.  
**Expected:** valid strategy.

### Case 26 — Selected fact branch equals accepted fact attack

**Fixture:** Scenario selection mutates S1 to true.  
**May produce:** branch status only.  
**Must not happen:** Case File truth change.  
**Expected:** forbidden.

### Case 27 — Legal interpretation selection

**Fixture:** Team prioritizes Interpretation X.  
**May produce:** strategic legal position.  
**Must not happen:** X governing law.  
**Expected:** valid strategy.

### Case 28 — Selected interpretation equals correct law attack

**Fixture:** X selection marks X canonical.  
**May produce:** Argument/Task candidates.  
**Must not happen:** correctness/judge adoption.  
**Expected:** forbidden.

### Case 29 — CaseTheory to Argument

**Fixture:** CT-A supports Arguments ARG-1/ARG-2.  
**May produce:** linked advocacy candidates.  
**Must not happen:** CT/Argument identity.  
**Expected:** one-to-many valid.

### Case 30 — Argument equals Theory collapse attack

**Fixture:** ARG-1 replaces CT-A structure/history.  
**May produce:** link only.  
**Must not happen:** object collapse.  
**Expected:** forbidden.

### Case 31 — Theory comparison

**Fixture:** CT-A/B compared on supports, challenges, assumptions, gaps and law.  
**May produce:** structured comparison.  
**Must not happen:** hidden aggregate winner.  
**Expected:** valid.

### Case 32 — TheoryScore=88 attack

**Fixture:** Score replaces theory semantics.  
**May produce:** qualitative/structured descriptors.  
**Must not happen:** universal authority number.  
**Expected:** invalid.

### Case 33 — CaseStrength=79 attack

**Fixture:** Whole case reduced to one number.  
**May produce:** theory/Issue/gap structures.  
**Must not happen:** canonical win strength.  
**Expected:** invalid.

### Case 34 — Exceptional lawyer wrong theory

**Fixture:** Elite lawyer authors CT-A inconsistent with hidden world.  
**May produce:** coherent input-grounded wrong theory.  
**Must not happen:** auto-correction.  
**Expected:** valid wrong theory.

### Case 35 — Weak lawyer correct-looking theory

**Fixture:** Less capable lawyer authors a theory that appears supported.  
**May produce:** WorkProduct within inputs.  
**Must not happen:** profile determines hidden correctness.  
**Expected:** valid.

### Case 36 — Strong-looking wrong theory

**Fixture:** Misleading firm evidence strongly supports CT-A; hidden truth is B.  
**May produce:** well-supported-looking CT-A.  
**Must not happen:** hidden warning/penalty.  
**Expected:** valid.

### Case 37 — Weak-looking hidden-correct theory

**Fixture:** CT-B matches hidden truth but available support is sparse.  
**May produce:** weak/provisional-looking CT-B.  
**Must not happen:** hidden boost/ranking.  
**Expected:** valid.

### Case 38 — Theory revised by new evidence

**Fixture:** New Statement challenges CT-A-v1; review creates v2.  
**May produce:** linked revision/reasons.  
**Must not happen:** v1 overwrite.  
**Expected:** lineage preserved.

### Case 39 — Abandoned theory

**Fixture:** Team abandons CT-A due to missing support.  
**May produce:** abandoned status/reason/time.  
**Must not happen:** deletion.  
**Expected:** history retained.

### Case 40 — Theory merge

**Fixture:** CT-1/CT-2 combine into CT-3.  
**May produce:** new theory with two parent refs.  
**Must not happen:** parents erased/truth implied.  
**Expected:** valid lineage.

### Case 41 — Theory split

**Fixture:** CT-A splits into A1/A2 after uncertainty.  
**May produce:** linked alternatives.  
**Must not happen:** original history deletion.  
**Expected:** valid.

### Case 42 — Parallel lawyer theories

**Fixture:** Lawyer A authors CT-A; Lawyer B independently authors CT-B.  
**May produce:** two WorkProducts/provenances.  
**Must not happen:** automatic integration.  
**Expected:** coexistence.

### Case 43 — Auto-merge attack

**Fixture:** System creates CT-Final from CT-A/B without explicit Task.  
**May produce:** comparison/synthesis Task candidate.  
**Must not happen:** silent merge/winner.  
**Expected:** forbidden.

### Case 44 — Partner chooses theory

**Fixture:** Partner selects CT-A.  
**May produce:** organizational PrimaryTheory.  
**Must not happen:** epistemic truth.  
**Expected:** valid strategic authority only.

### Case 45 — Team consensus

**Fixture:** Five lawyers agree on CT-A.  
**May produce:** consensus state.  
**Must not happen:** CT-A true by vote.  
**Expected:** no epistemic authority.

### Case 46 — Client insists on theory

**Fixture:** Client insists X happened.  
**May produce:** Statement/hypothesis/theory input and strategy concern.  
**Must not happen:** X truth.  
**Expected:** client narrative remains fallible.

### Case 47 — CaseTheory to CourtRecord/JII attack

**Fixture:** CT-A directly enters CourtRecord or modifies JII/CP.  
**May produce:** drafting/argument Task candidate.  
**Must not happen:** court bypass.  
**Expected:** forbidden.

### Case 48 — CaseTheory to CourtFactFinding attack

**Fixture:** CT-A selection changes finding/outcome.  
**May produce:** internal strategy only.  
**Must not happen:** direct finding modifier.  
**Expected:** forbidden.

### Case 49 — Hidden correct-theory oracle attack

**Fixture:** ActualStateRecord matches CT-B; system marks/ranks CT-B correct.  
**May produce:** nothing player-facing from hidden alignment.  
**Must not happen:** correct badge/boost/warning.  
**Expected:** forbidden.

### Case 50 — Evidence majority laundering attack

**Fixture:** Five sources support CT-A; two challenge.  
**May produce:** descriptive counts and dependency questions.  
**Must not happen:** `CT-A factual truth confirmed`.  
**Expected:** forbidden.

### Case 51 — Seniority epistemic laundering attack

**Fixture:** Partner chooses CT-A over CT-B; system marks CT-A authoritative truth.  
**May produce:** organizational selection.  
**Must not happen:** epistemic promotion.  
**Expected:** forbidden.

### Case 52 — Synthesis auto-resolution attack

**Fixture:** Fact A/Legal X, Fact B/Legal Y, CT-A/CT-B enter synthesis; engine outputs CT-A as Final Case Answer.  
**May produce:** branches, comparison and strategy selection.  
**Must not happen:** adjudication/final truth.  
**Expected:** forbidden.

## 22. Special pressure tests

### Hidden-truth pressure

ActualStateRecord sequence is B while firm evidence supports A. CT-A may appear stronger and be selected. Hidden B cannot weaken A, boost B, show warning, expose mismatch or rank theories. `objective truth ≠ firm-visible theory correctness`.

### Evidence-count pressure

Five dependent sources may repeat one assertion while two apparently independent sources conflict. This DEC does not decide dependency/reliability. It establishes only `source count ≠ truth authority` and preserves dependency uncertainty.

### Theory-history pressure

`T1 CT-A created → T2 Statement challenge → T3 CT-A-v2 → T4 abandoned → T5 later relevant`. Every state/reason/input remains traceable; renewed relevance does not rewrite earlier abandonment.

### Parallel synthesis pressure

CT-A and CT-B from separate lawyers remain two WorkProducts. A new explicit review/comparison/synthesis Task is needed; no automatic CT-Final.

### Strategic-selection pressure

PrimaryTheory CT-A is an organizational/strategic state only. It cannot mutate evidence truth, legal correctness, CourtRecord, JII or findings.

## 23. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| CaseTheory provenance | 1, 3–6 | PASS candidate | Inputs/author/time retained |
| CaseTheory ≠ truth | 1, 9–12, 49–52 | PASS candidate | Analysis only |
| Authorized Case File only | 1, 3–8 | PASS candidate | No hidden input |
| No ActualStateRecord access | 7, 34, 36–37, 49 | PASS candidate | No alignment/rank |
| No hidden legal-model access | 6, 8, 27–28 | PASS candidate | Candidate law only |
| EvidenceSynthesis ≠ fact resolution | 9–18, 50, 52 | PASS candidate | Branches preserved |
| Support/challenge ≠ proof/disproof | 9–12 | PASS candidate | Contextual relations |
| Evidence/witness/document count ≠ truth | 13–14, 45, 50 | PASS candidate | No voting |
| Corroboration ≠ truth | 15–16 | PASS candidate | Dependency TBD |
| Contradiction ≠ falsity/deception | 17–18 | PASS candidate | Intent unresolved |
| Chronology reconstruction ≠ actual | 19–20 | PASS candidate | Typed timeline |
| Multiple theories coexist | 21–22, 42 | PASS candidate | Includes uncertainty theory |
| Incomplete/no-theory valid | 2, 22 | PASS candidate | No forced narrative |
| Wrong/strong-looking wrong theory valid | 34, 36 | PASS candidate | No correction |
| Weak-looking hidden-correct theory valid | 37 | PASS candidate | No boost |
| Hidden truth does not rank | 34, 36–37, 49 | PASS candidate | No badge/warning |
| Factual selection ≠ fact acceptance | 25–26 | PASS candidate | Conditional scenario |
| Legal selection ≠ governing law | 27–28 | PASS candidate | Strategy only |
| PrimaryTheory ≠ truth | 23–24, 44, 51 | PASS candidate | Organizational state |
| CaseTheory ≠ Argument | 29–30 | PASS candidate | Linked distinct objects |
| Argument selection ≠ correctness | 27–30 | PASS candidate | Advocacy only |
| No TheoryScore/CaseStrength | 31–33 | PASS candidate | Structured comparison |
| No hidden weighted formula | 31–33 | PASS candidate | No aggregate winner |
| Capability ≠ correct theory | 34–37 | PASS candidate | Authorized inputs only |
| Direct/delegated same ontology | 1, 42–43 | PASS candidate | Explicit synthesis Task |
| Parallel theories do not auto-merge | 42–43 | PASS candidate | New Task needed |
| Seniority/consensus ≠ truth | 44–45, 51 | PASS candidate | Organization only |
| Client narrative ≠ truth | 46 | PASS candidate | Fallible input |
| Revision/abandonment history | 38–39 | PASS candidate | No overwrite |
| Merge/split lineage | 40–41 | PASS candidate | Parents/original retained |
| CaseTheory ≠ CourtRecord/JII | 47 | PASS candidate | Procedure boundary |
| No direct CourtFactFinding | 48 | PASS candidate | No outcome modifier |
| EvidenceSynthesis ≠ judge synthesis | 47–48, 52 | PASS candidate | Firm-side only |
| No correct-theory marker/count | 49–50 | PASS candidate | No answer key |

## 24. Contradiction audit

| Check | Result | Note |
|---|---|---|
| CaseTheory/truth collapse | Rejected | Cases 1, 9–12, 49–52 |
| ActualStateRecord leakage | Rejected | Cases 7, 34, 36–37, 49 |
| Hidden legal-model leakage | Rejected | Cases 6, 8, 27–28 |
| Support/proof and challenge/disproof | Rejected | Cases 9–12 |
| Evidence count/truth | Rejected | Cases 13–14, 50 |
| Corroboration/truth | Rejected | Cases 15–16 |
| Contradiction/falsity/deception | Rejected | Cases 17–18 |
| Chronology/actual history | Rejected | Cases 19–20 |
| Factual selection/fact acceptance | Rejected | Cases 25–26 |
| Legal selection/governing law | Rejected | Cases 27–28 |
| CaseTheory/Argument collapse | Rejected | Cases 29–30 |
| Strategic selection/correctness | Rejected | Cases 23–24, 44, 51 |
| TheoryScore/CaseStrength/weighted formula | Rejected | Cases 31–33 |
| Exceptional lawyer/oracle | Rejected | Cases 34–37 |
| Parallel auto-merge | Rejected | Cases 42–43, 52 |
| Seniority/consensus truth | Rejected | Cases 44–45, 51 |
| History overwrite | Rejected | Cases 38–41 |
| CourtRecord/JII/finding bypass | Rejected | Cases 47–48 |
| Hidden correct marker/decisive count | Rejected | Cases 49–50 |

## 25. False-PASS / False-PARTIAL boundary

Fixtures may use only declared authorized Case File inputs and explicit task results. They must not invent hidden factual truth access, hidden legal correctness, evidence reliability, witness credibility, source independence, theory correctness, strategy success, court acceptance or outcome to force a PASS.

Exact weighting, reliability, independence, credibility, comparison UI, synthesis algorithm, strategy AI and court procedure being TBD is not a PARTIAL reason. PARTIAL is reserved for genuine ambiguity in the semantic boundary.

## 26. Explicit TBD

- Exact CaseTheory/Synthesis Task/WorkProduct schemas.
- Support/challenge/corroboration/dependency/revision status taxonomies.
- Reliability, credibility, source independence and evidence-weight mechanics.
- Chronology, factual/legal branch and synthesis algorithms.
- Theory comparison/ranking display and strategic selection rules.
- CaseTheory UI, client interaction and court strategy.
- Capability mappings, workload/parallel coordination and NPC AI.
- Argument/drafting/pleading/filing handoff and court procedure.
- Save/schema/API/Godot implementation, performance and balancing.

## 27. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Theory becomes truth | Selected CT mutates facts | Epistemic model collapses | Analysis/strategy type only |
| Majority synthesis | Count chooses winner | Dependency/reliability erased | Descriptive counts only |
| Hidden correct theory | World alignment badge/rank | Answer-key leak | Authorized-input feedback |
| Source count decides facts | More documents confirm X | Duplicates dominate | Preserve provenance/dependency |
| Corroboration becomes proof | Consistency confirms truth | Shared errors ignored | Candidate relation only |
| Contradiction becomes lie | Conflict fixes falsity/intent | Context erased | Preserve alternatives |
| Chronology becomes history | Narrative overwrites timeline | Truth laundering | Typed reconstruction |
| Best lawyer oracle | Capability reveals correct CT | Profile bypasses knowledge | Component contribution only |
| Partner choice truth | Hierarchy decides facts | Organizational/epistemic collapse | Separate selection status |
| Consensus truth | Team vote confirms CT | Shared mistake becomes fact | Consensus metadata only |
| TheoryScore/CaseStrength | One number owns semantics | Gaps/assumptions disappear | Structured comparison |
| Automatic case answer | Synthesis adjudicates | Court boundary bypass | Branches/strategy only |
| Forced narrative | Sparse case gets coherent CT | Fabricated certainty | No-theory valid |
| History overwrite | Revision deletes old CT | Past decisions unexplained | Version lineage |
| Parallel auto-merge | Team outputs become CT-Final | Conflict/provenance lost | Explicit synthesis Task |
| Theory explosion | Infinite near-duplicates | Case File unusable | Scope/projection/dedup TBD |
| Synthesis busywork | Manual links dominate play | Poor usability | Assisted authoring/projections TBD |
| Direct judge effect | CT changes JII/finding | Litigation bypass | Procedural path only |

## 28. Player-facing principle

Player should see theory statement, supporting/challenging inputs, assumptions, legal basis, conflicting theories, unresolved gaps, theory history, strategic status and revision reasons. Player should not see correct-theory badge, hidden truth alignment/reliability, CaseStrength/TheoryScore, win chance, decisive evidence remaining count or future judge acceptance.

## 29. Solo → firm progression hook

```text
Solo → player builds one or two theories manually
Associates → Issue-specific synthesis and alternative theories
Senior lawyers → review and revise theories
Larger firm → parallel theory teams / Issue ownership
Partner/player → selects strategic primary/secondary theories
```

Supported architecture only, not mandatory progression.

## 30. Suggested TEST-023 plan

Do not create the TEST here. Recommended file: `TEST-023_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md`, using at least the 52 pressure fixtures above and special hidden-truth/count/history/parallel/selection tests.

## 31. DEC-025 candidates

| Candidate | Prerequisite fit | Risk |
|---|---|---|
| Drafting / Pleading / Filing | Converts selected theory/Arguments to procedural artifacts | Must preserve internal/court boundary |
| Task Assignment / Workload / Team Coordination | Scales parallel work and review | Could precede more content families |
| Client Interaction / Advice | Uses theory to explain risk/options | Social/ethics scope |
| Witness Preparation / Court Examination | Applies theory to witnesses | Procedure/testimony dependency |
| Settlement / Negotiation | Uses theory/risk assessments strategically | Outcome/score shortcut risk |

**Default recommendation:** `DEC-025 — Drafting / Pleading / Filing`, if TEST-023 confirms that theory/strategy remains separate from truth and adjudication. It is the next explicit materialization path from selected Arguments toward procedure without making internal theory a CourtRecord.

## 32. Decision summary

### Inherited Accepted

| Boundary | Status |
|---|---|
| ActualStateRecord / CaseFileState / CourtRecord / CourtFactFinding separation | **Inherited Accepted** |
| Investigation, Evidence Review, Interview and Legal Research epistemic handoffs | **Inherited Accepted** |
| Explicit Task/WorkProduct, capability and immutable history semantics | **Inherited Accepted** |
| No direct JII/ChoicePoint/finding effect | **Inherited Accepted** |

### Core Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| SYN1–SYN21 | Provenance, truth/access, synthesis relations, branches, wrong/no-theory, strategy and score boundaries | **Core Accepted candidate** |
| SYN23–SYN35 | Version lineage, explicit Tasks, capability, delegation, organizational and court boundaries | **Core Accepted candidate** |

### Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| SYN22 | Structured theory comparison without aggregate winner | **Accepted candidate** |

### TBD

Exact CaseTheory/Synthesis schemas, relation/status taxonomies, reliability/credibility/independence, chronology and synthesis algorithms, theory comparison/selection UI, capability mappings, client/court strategy, team AI, Argument/drafting/procedure handoff, save/schema/API/Godot and balancing remain **TBD**.

### Forbidden

- ActualStateRecord or hidden legal model used to create, correct, boost, weaken or rank a theory.
- CaseTheory/EvidenceSynthesis/support/challenge/corroboration/chronology promoted to objective truth or fact resolution.
- Evidence/witness/document count, seniority, consensus, capability, TheoryScore, CaseStrength or weighted formula used as epistemic authority.
- Factual/legal branch selection or PrimaryTheory status mutating facts/law.
- CaseTheory, StrategicNarrative and Argument collapsed.
- Theory revision, abandonment, merge, split or parallel work deleting provenance/history.
- Hidden correct-theory badge, truth alignment, decisive-evidence count or win probability.
- CaseTheory/EvidenceSynthesis automatically entering CourtRecord or modifying JII/ChoicePoint/finding/outcome.

## 33. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | SYN1–SYN35 define provenance-bearing CaseTheory/EvidenceSynthesis, authorized typed inputs, no hidden truth/law access, support/challenge/count/chronology boundaries, competing/no/wrong theory states, factual/legal and strategy separation, version/merge/split lineage, capability/team boundaries, court non-interference and 52-case TEST-023 plan. |
| v0.2 | Accepted | TEST-023의 existing PASS 결과와 VS-004 closure review에 따라 Accepted로 승격했다. VS-004 strategic state는 immutable Argument selection history이며 canonical Strategy/StrategicNarrative materialization이 아님을 명시했다. |
