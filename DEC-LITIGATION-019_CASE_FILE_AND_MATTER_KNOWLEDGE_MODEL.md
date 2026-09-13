# THE FIRM — Case File and Matter Knowledge Model

문서 ID: DEC-LITIGATION-019  
버전: v0.1 — Proposed / design review required  
상태: **Proposed / design review required**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`  
직접 기준: `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `TEST-017_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `TEST-016_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`, `TEST-015_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`, `DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md`, `DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md`, `DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md`

## 1. Purpose / non-goals

이 문서는 `CaseFileState`를 문서 보관함이나 사건 정답지가 아니라 특정 firm/team이 현재 확보·기록·분석한 사건 지식의 provenance-bearing organized model로 정의한다.

```text
ActualStateRecord
≠ CaseFileState
≠ CourtRecord
≠ CourtFactFinding
```

```text
CaseFileState
= acquired material and source assertions
+ observable/procedural status
+ professional analysis and inference
+ working hypotheses
+ known gaps and unresolved questions
+ Tasks and WorkProducts
+ provenance, uncertainty and history
```

Case File에 저장됐다는 사실은 content를 objective truth, hidden world truth, judicial truth, allowed record 또는 recognized fact로 바꾸지 않는다.

### 1.1 Goals

1. Case File을 graph-like semantic knowledge space로 정의한다.
2. UI projection과 semantic authority를 분리한다.
3. source, assertion, status, analysis, inference, hypothesis와 unknown을 구분한다.
4. player/NPC professional analysis가 틀릴 수 있게 한다.
5. known unknown과 unknown unknown을 구분한다.
6. Evidence, Witness, Issue, Chronology, WorkProduct와 Task를 provenance-bearing relations로 연결한다.
7. acquisition, revision, conflict, challenge와 history를 추적한다.
8. Case File→CourtRecord의 explicit procedural boundary를 보존한다.
9. 후속 evidence, investigation, research, witness와 drafting systems가 공유할 epistemic interface를 제공한다.

### 1.2 Non-goals

이 문서는 actual Korean doctrine/practice, canonical database/schema/API, graph technology, exact node/relation taxonomy, confidence formula, analysis-correctness algorithm, investigation/discovery rules, CourtRecord admission rules, UI, NPC reasoning, minigame, save/migration 또는 Godot implementation을 확정하지 않는다.

### 1.3 Decision markers

| Marker | Meaning |
|---|---|
| **Core Accepted** | 이전 Accepted DEC에서 상속한 hard boundary |
| **Core Accepted candidate** | 모든 Case File 소비자가 보존해야 할 핵심 semantic boundary |
| **Accepted candidate** | v1 minimum model에 채택을 제안하는 구조 |
| **TBD** | content, taxonomy, algorithm, implementation 또는 법적 기준 미정 |
| **Forbidden** | truth laundering, hidden-state access 또는 boundary bypass |

## 2. Inherited hard boundaries

DEC-013/014에서 상속한다.

- Fact evaluation은 allowed `CourtRecordSnapshot`만 사용하고 `ActualStateRecord`, private WorkProduct 또는 hidden input을 읽지 않는다.
- Judge interpretation은 hard-first, criterion-declared ambiguity, explicit JII 경로만 따른다.
- Case File content는 ChoicePoint를 생성·활성화하거나 JII/finding을 직접 바꾸지 않는다.

DEC-015/016/017에서 상속한다.

- Stable professional identity와 role/profile version history를 보존한다.
- Player-facing knowledge는 internal state와 분리되고 provenance/disclosure를 가진다.
- Professional capability, reputation, relationship과 prestige는 truth 또는 adjudicative bonus가 아니다.
- 높은 capability는 correct analysis나 omniscient access를 보장하지 않는다.

DEC-018/TEST-017에서 상속한다.

- WorkProduct는 Case File을 provenance-bearing 방식으로 update할 수 있다.
- WorkProduct/Case File은 자동 CourtRecord가 아니다.
- Task는 authorized Case File snapshot/available information을 읽고 hidden world truth를 읽지 않는다.
- Partial, challenged, defective and revised work는 history와 causal trace를 보존할 수 있다.
- TEST-017 Case 29는 professional analysis를 canonical fact로 승격하는 것을 invalid로 확인했다.

이번 DEC는 위 경계를 reopen하지 않고 Case File의 epistemic semantics만 구체화한다.

## 3. Core design direction

### 3.1 Graph semantics with UI projections

```text
Issue I-03 ↔ Evidence E-014 ↔ Witness W-02
            ↕                  ↕
       WorkProduct WP-11 ↔ Statement S-07 ↔ Timeline T-04
```

Case File의 semantic meaning은 typed nodes, relations, provenance, status와 history에서 온다. Folder, tab, card, timeline 또는 graph view는 동일 state의 projection이다. UI 위치 변경만으로 epistemic/legal meaning이 바뀌지 않는다.

### 3.2 Minimum epistemic distinctions

Minimum v1은 다음 semantic distinctions를 지원해야 한다.

- `source_material`: 확보한 자료 자체.
- `source_assertion`: source/person이 말하거나 기록한 내용.
- `observable_or_procedural_status`: team이 확인한 receipt, review, filing, deadline 등 상태.
- `professional_analysis`: professional/player가 sources/assertions를 해석한 결과.
- `inferred_relation`: 분석으로 제안한 node 간 relation.
- `hypothesis`: 아직 확인되지 않은 working theory.
- `unknown_or_unresolved`: team이 인지한 gap/question/status.

정확한 canonical names와 subtypes는 **TBD**다. 핵심 구분은 다음과 같다.

```text
“Source says X” ≠ “X is true”
“Professional concludes Y” ≠ “Y is true”
```

### 3.3 Wrong analysis is a valid state

분석, contradiction candidate, issue link, inference, hypothesis와 reconstructed chronology는 mistaken, incomplete, outdated, challenged 또는 superseded될 수 있다. 잘못된 분석이 strategy와 downstream Tasks에 영향을 주는 것은 정상적인 world/game state다. 시스템이 이를 사후적으로 없었던 분석으로 바꾸지 않는다.

### 3.4 Known unknown and unknown unknown

- **Known unknown:** team이 gap의 존재와 경계를 안다. 예: unreviewed 9 documents, unanswered interview question.
- **Unknown unknown:** team이 존재·중요성을 아직 알지 못한다. 구체 node나 hidden-answer counter로 player-facing Case File에 표시하지 않는다.

Case File은 “아직 발견하지 못한 결정적 증거 1개”처럼 hidden truth를 누설하지 않는다.

## 4. Semantic object families

| Family | Minimum meaning | Required boundary | Forbidden responsibility |
|---|---|---|---|
| `SourceMaterial` | Acquired document/media/data/object ref and acquisition provenance | Content/assertions separate | Contents presumed true |
| `SourceAssertion` | What a speaker/author/source asserted, with context/time | Source and author refs | Objective fact or finding |
| `ObservableOrProceduralStatus` | Receipt/review/filing/deadline/allowed-state observed through legitimate source | Observation/procedure provenance | Hidden world truth |
| `ProfessionalAnalysis` | Interpretation made by identified professional/player through Task/WorkProduct | Sources, analyst, version, time, uncertainty | Canonical truth |
| `InferredRelation` | Proposed semantic relation between nodes | Origin/status/history | Objective edge merely because stored |
| `Hypothesis` | Working theory usable for priorities/tasks | Basis and unresolved status | Evidence/fact |
| `KnownGap` | Explicitly known missing/unreviewed/unresolved boundary | How gap became known | Hidden answer reveal |
| `Issue` | Case question/topic linked to materials/analysis | Link provenance | Automatic proof |
| `TimelineEntry` | Reported, observed or reconstructed temporal item | Epistemic type/status | Necessarily actual event/date |
| `Witness` | Stable person/entity ref relevant to case | Statements separate | One merged testimony/truth state |
| `Statement` | Versioned/contextual assertion by witness/source | Speaker/time/source/history | Witness-wide truth status |
| `Task` / `WorkProduct` | DEC-018 work unit and structured result refs | Read/write provenance | Direct truth or CourtRecord |

## 5. Design decisions

### 5.1 CFK1 — Case File as epistemic model

**문제:** Case File은 자료 창고, objective case state, 또는 firm-side knowledge 중 무엇인가?  
**Alternatives:** A) folder only—relations/uncertainty 소실; B) objective truth store—hidden answer leakage; C) firm-side epistemic state.  
**Failure modes:** A는 meaningful analysis를 못 담고 B는 investigation과 player error를 무력화한다.  
**추천안:** Case File을 firm/team이 현재 확보·기록·분석한 epistemic state로 정의한다.  
**상태:** **Core Accepted candidate**  
**이유:** Wrong, incomplete and conflicting knowledge를 truth와 분리해 표현한다.

### 5.2 CFK2 — Graph semantics

**문제:** Cross-linked matter knowledge를 어떤 semantic shape로 표현할 것인가?  
**Alternatives:** A) directory tree; B) flat tags; C) typed nodes/relations graph with projections.  
**Failure modes:** A/B는 one-to-many provenance와 conflict/history를 잃는다.  
**추천안:** Semantic refs와 typed relations를 canonical direction으로 삼는다.  
**상태:** **Core Accepted candidate**  
**이유:** Issue/source/assertion/witness/timeline/task/workproduct 간 다중 연결을 보존한다.

### 5.3 CFK3 — Folder/UI is not canonical

**문제:** UI folder placement가 semantic type/authority를 소유하는가?  
**Alternatives:** A) folder=type; B) folder changes meaning; C) folders/lists/tabs are projections.  
**Failure modes:** Drag-and-drop이 truth/legal meaning을 바꿀 수 있다.  
**추천안:** UI organization은 graph state의 view/filter일 뿐이다.  
**상태:** **Core Accepted candidate**  
**이유:** UI refactor가 simulation meaning을 변조하지 않는다.

### 5.4 CFK4 — Source Material vs Source Assertion

**문제:** Document existence와 document-contained claim을 합칠 것인가?  
**Alternatives:** A) merge; B) separate source and assertions.  
**Failure modes:** `email exists`가 `email claim is true`로 laundering된다.  
**추천안:** Material과 one-or-more Assertions를 별도 objects/refs로 표현한다.  
**상태:** **Core Accepted candidate**  
**이유:** Provenance와 truth non-interference를 유지한다.

### 5.5 CFK5 — Assertion is not truth

**문제:** Source assertion을 fact로 취급할 수 있는가?  
**Alternatives:** A) assertion=fact; B) majority assertions=fact; C) assertions remain claims.  
**Failure modes:** Lying, error, conflict와 limited perception을 표현하지 못한다.  
**추천안:** 하나 또는 다수 assertions는 truth로 자동 승격되지 않는다.  
**상태:** **Core Accepted candidate**  
**이유:** Source count는 finding rule이 아니다.

### 5.6 CFK6 — Separate ProfessionalAnalysis

**문제:** Lawyer interpretation을 source metadata에 덮어쓸 것인가?  
**Alternatives:** A) mutate source; B) store untyped note; C) separate provenance-bearing analysis.  
**Failure modes:** Author/source claim과 professional view가 섞이고 책임·history를 잃는다.  
**추천안:** analyst, Task/WorkProduct, sources, time/version, status/uncertainty refs를 가진 별도 semantic object로 둔다.  
**상태:** **Core Accepted candidate**  
**이유:** Analysis origin과 revision을 추적한다.

### 5.7 CFK7 — Analysis can be wrong

**문제:** Professional analysis가 항상 정확한가?  
**Alternatives:** A) system oracle; B) capability guarantees correctness; C) mistaken/incomplete/outdated analysis allowed.  
**Failure modes:** A/B는 gameplay judgment와 review를 제거한다.  
**추천안:** Incorrect analysis를 normal valid state로 허용한다.  
**상태:** **Core Accepted candidate**  
**이유:** Player/NPC reasoning의 consequence와 correction history가 생긴다.

### 5.8 CFK8 — Inference relation provenance

**문제:** `supports/contradicts/relates` edge가 objective relation인가?  
**Alternatives:** A) canonical edge; B) anonymous tag; C) provenance/status/version-bearing inference.  
**Failure modes:** Stored edge가 truth가 되고 challenge가 불가능해진다.  
**추천안:** Relation origin, source, analyst/workproduct, uncertainty and history를 연결 가능하게 한다.  
**상태:** **Core Accepted candidate**  
**이유:** Same nodes에 competing interpretations가 coexist할 수 있다.

### 5.9 CFK9 — No truth laundering

**문제:** Analysis/inference/hypothesis가 저장되면 fact가 되는가?  
**Alternatives:** A) promote on storage; B) promote by confidence/seniority; C) never auto-promote.  
**Failure modes:** Case File이 hidden answer key가 되고 CourtRecord boundary가 붕괴한다.  
**추천안:** Storage, repetition, confidence, capability 또는 seniority로 truth promotion하지 않는다.  
**상태:** **Core Accepted candidate / Forbidden inverse**  
**이유:** Epistemic category와 judicial/world truth를 보존한다.

### 5.10 CFK10 — Hypothesis as working model

**문제:** Hypothesis가 어떤 effect를 가질 수 있는가?  
**Alternatives:** A) no function; B) treated as evidence; C) drives priorities/tasks while remaining unresolved.  
**Failure modes:** A는 strategy를 막고 B는 evidence fabrication이다.  
**추천안:** Task candidate, investigation direction, review priority와 strategy consideration에 연결할 수 있다.  
**상태:** **Accepted candidate**  
**이유:** Actionable belief와 truth를 분리한다.

### 5.11 CFK11 — Known unknown

**문제:** Team이 인지한 gap을 어떻게 표현할 것인가?  
**Alternatives:** A) omit; B) omniscient hidden answer; C) explicit bounded KnownGap.  
**Failure modes:** A는 planning을 막고 B는 hidden state를 누설한다.  
**추천안:** unreviewed/unavailable/unanswered/unresolved boundary와 provenance를 보존한다.  
**상태:** **Core Accepted candidate**  
**이유:** Task planning에 필요한 ignorance를 명시한다.

### 5.12 CFK12 — Unknown unknown

**문제:** 아직 존재/중요성을 모르는 정보도 node로 표시하는가?  
**Alternatives:** A) hidden clue silhouettes/counters; B) concrete unknown nodes; C) no player-facing concrete representation until legitimately discovered.  
**Failure modes:** A/B는 answer-key leak다.  
**추천안:** Unknown unknown은 explicit discovery/source/event 전까지 구체 node나 count로 노출하지 않는다.  
**상태:** **Core Accepted candidate**  
**이유:** Player knowledge와 world truth를 분리한다.

### 5.13 CFK13 — Knowledge acquisition provenance

**문제:** 새 knowledge가 이유 없이 나타날 수 있는가?  
**Alternatives:** A) magical update; B) source/task/workproduct/event/observation origin.  
**Failure modes:** Hidden information leakage와 untraceable strategy change.  
**추천안:** 가능한 경우 acquisition origin, learned time and effective/source time을 보존한다.  
**상태:** **Core Accepted candidate**  
**이유:** 무엇을 언제 왜 알았는지 replay 가능하다.

### 5.14 CFK14 — Version and history

**문제:** New analysis가 old analysis를 overwrite하는가?  
**Alternatives:** A) in-place latest-only; B) immutable/history-linked revisions.  
**Failure modes:** Past decisions의 당시 knowledge를 재구성할 수 없다.  
**추천안:** Current projection과 historical analyses/relations를 분리하고 challenge/supersede/refine lineage를 보존한다.  
**상태:** **Core Accepted candidate**  
**이유:** Replayability와 accountability를 유지한다.

### 5.15 CFK15 — Contradictory knowledge coexistence

**문제:** Conflicting claims/analyses 중 하나를 즉시 선택하는가?  
**Alternatives:** A) overwrite; B) majority/highest confidence chooses; C) coexist pending explicit resolution process.  
**Failure modes:** Conflict 자체가 사라지고 false truth resolution이 발생한다.  
**추천안:** Assertions, analyses and hypotheses can coexist with conflict refs/status.  
**상태:** **Core Accepted candidate**  
**이유:** Legal matter knowledge is often contested.

### 5.16 CFK16 — Confidence is not universal truth probability

**문제:** Uncertainty를 `TruthProbability=72%`로 표준화할 것인가?  
**Alternatives:** A) one probability; B) qualitative/structured uncertainty; C) no uncertainty.  
**Failure modes:** A는 fabricated precision/hidden formula, C는 overclaiming.  
**추천안:** Qualitative or structured uncertainty를 허용하되 vocabulary/calculation은 TBD로 둔다.  
**상태:** **Accepted candidate**  
**이유:** Confidence는 belief quality이지 truth authority가 아니다.

### 5.17 CFK17 — Issue linkage

**문제:** Source/analysis가 Issue에 연결되면 issue가 proven인가?  
**Alternatives:** A) link=proof; B) typed provenance-bearing relevance/support relation.  
**Failure modes:** Internal issue map이 finding을 대체한다.  
**추천안:** `may support/undermine/relate` 관계만 표현하고 proof/finding을 소유하지 않는다.  
**상태:** **Core Accepted candidate**  
**이유:** Preparation map과 adjudication을 분리한다.

### 5.18 CFK18 — Timeline/chronology separation

**문제:** Chronology entry가 actual event/date인가?  
**Alternatives:** A) one canonical timeline; B) source-reported, observable procedural, reconstructed, disputed and unknown timing distinctions.  
**Failure modes:** Conflicting dates를 임의로 하나의 truth로 만든다.  
**추천안:** Timeline items preserve epistemic type, source and dispute status.  
**상태:** **Accepted candidate**  
**이유:** Chronology is often reconstructed from claims/materials.

### 5.19 CFK19 — Witness and statements separation

**문제:** Witness와 testimony를 하나로 합칠 것인가?  
**Alternatives:** A) one witness truth blob; B) person/entity plus multiple contextual/versioned Statements.  
**Failure modes:** Corrections, inconsistency and context history가 사라진다.  
**추천안:** `Witness ≠ Statement ≠ analysis of witness`; multiple statements and corrections를 보존한다.  
**상태:** **Core Accepted candidate**  
**이유:** Scope-specific credibility/provenance boundary와 정합된다.

### 5.20 CFK20 — WorkProduct updates knowledge, not truth

**문제:** WorkProduct가 무엇을 update하는가?  
**Alternatives:** A) nothing; B) ActualState/CourtRecord; C) Case File nodes/relations/gaps/analysis with provenance.  
**Failure modes:** A는 work persistence를 없애고 B는 truth/record laundering이다.  
**추천안:** Internal knowledge만 add/refine/challenge하고 legal materialization은 별도 둔다.  
**상태:** **Core Accepted candidate**  
**이유:** DEC-018 causal chain을 안전하게 완성한다.

### 5.21 CFK21 — Player-created analysis

**문제:** Player가 knowledge relations/hypotheses를 만들 수 있는가?  
**Alternatives:** A) system-only; B) player edits truth; C) player authors bounded professional analysis.  
**Failure modes:** A는 agency를 제한하고 B는 cheat/authority collapse다.  
**추천안:** Issue links, contradiction candidates, hypotheses, priorities와 chronology interpretations를 player analysis로 기록 가능하게 한다.  
**상태:** **Accepted candidate**  
**이유:** Direct work도 NPC work와 같은 fallible ontology를 쓴다.

### 5.22 CFK22 — NPC-created analysis

**문제:** Delegated work가 별도 hidden ontology나 omniscient input을 쓰는가?  
**Alternatives:** A) hidden truth AI; B) simplified success notes; C) same Case File objects and authorization.  
**Failure modes:** Delegation becomes cheating or opaque percentage engine.  
**추천안:** NPC WorkProduct도 player work와 같은 analysis/inference/hypothesis/gap types를 생성한다.  
**상태:** **Core Accepted candidate**  
**이유:** DEC-018 direct/delegated equivalence를 보존한다.

### 5.23 CFK23 — Conflict/refinement states

**문제:** New WorkProduct가 기존 analysis와 충돌하면 어떻게 표현하는가?  
**Alternatives:** A) delete old; B) automatically choose winner; C) history-bearing challenge/supersede/refine/unresolved relation.  
**Failure modes:** History loss 또는 truth oracle.  
**추천안:** Conflict/refinement semantics를 지원하되 exact vocabulary and resolution workflow는 TBD.  
**상태:** **Accepted candidate**  
**이유:** Current projection과 historical reasoning을 함께 보존한다.

### 5.24 CFK24 — No automatic completeness meter

**문제:** `Case Understanding=78%`가 canonical coverage인가?  
**Alternatives:** A) omniscient percentage; B) source-derived local summaries; C) structured known coverage/gaps.  
**Failure modes:** Hidden denominator가 undiscovered truth를 누설한다.  
**추천안:** Canonical omniscient percentage를 금지하고 explicit reviewed/unreviewed/known gaps를 사용한다.  
**상태:** **Core Accepted candidate / Forbidden inverse**  
**이유:** Unknown unknown을 count하지 않는다.

### 5.25 CFK25 — Read/write boundary

**문제:** Future Tasks가 무엇을 읽고 쓸 수 있는가?  
**Alternatives:** A) ActualStateRecord; B) all internal/private data; C) authorized Case File nodes and available sources, writing provenance-bearing updates.  
**Failure modes:** Hidden truth access와 magical knowledge.  
**추천안:** Task input snapshot과 authorization을 explicit하게 하고 writes는 WorkProduct-derived updates로 제한한다.  
**상태:** **Core Accepted candidate**  
**이유:** Execution is reproducible and epistemically bounded.

### 5.26 CFK26 — Procedural materialization boundary

**문제:** Case File content가 언제 CourtRecord가 되는가?  
**Alternatives:** A) on storage; B) on confidence; C) separate explicit filing/submission/reception/allowance path.  
**Failure modes:** Private memo/analysis가 judge input이 된다.  
**추천안:** Existing procedure system의 valid materialization만 CourtRecord를 변경한다.  
**상태:** **Core Accepted** (inherited)  
**이유:** Firm knowledge와 adjudicative record를 분리한다.

## 6. Recommended minimum model

```text
World / ActualStateRecord
    (not readable by Case File merely because it exists)

Legitimate source / event / observation
→ SourceMaterial and/or SourceAssertion
→ authorized CaseFileState snapshot
→ Task + WorkProduct
→ ProfessionalAnalysis / InferredRelation / Hypothesis / KnownGap
→ challenge / refine / supersede history
→ current firm-side projection

Only when explicitly materialized through valid procedure:
Case File / WorkProduct
→ filing/submission/reception/allowance
→ CourtRecordSnapshot
→ existing Litigation evaluation
```

ChoicePoint, JII와 CourtFactFinding은 Case File graph가 직접 소유하지 않는다.

## 7. Suggested semantic graph

Illustrative reference only:

```text
Case
├─ SourceMaterial
├─ Person / Organization
├─ Witness
├─ Statement / SourceAssertion
├─ TimelineEntry
├─ Issue
├─ ProfessionalAnalysis
├─ InferredRelation
├─ Hypothesis
├─ KnownGap / UnknownOrUnresolved
├─ Task
├─ WorkProduct
├─ Filing / Pleading
└─ ObservableOrProceduralStatus
```

Illustrative relation candidates:

```text
source_contains_assertion
assertion_by_person
assertion_concerns_issue
material_relates_to_issue
analysis_based_on_source
analysis_interprets_assertion
analysis_identifies_relation
relation_may_support_issue
relation_may_undermine_issue
statement_conflicts_with_statement
hypothesis_based_on_analysis
task_created_to_resolve_gap
workproduct_updates_analysis
workproduct_refines_hypothesis
```

Canonical node schema, relation vocabulary, directionality/cardinality and storage are **TBD**.

## 8. Example Case File

Synthetic only; no Korean-law conclusion:

```text
Issue I-01
“Was the stated termination reason formulated retrospectively?”

SourceMaterial
E-01 Employment Contract
E-02 Email dated 03/10
E-03 Meeting Minutes dated 03/14

SourceAssertions
A-01 Employee: “No warning was given.”
A-02 Manager: “Several warnings were given.”

ProfessionalAnalysis PA-01
content: E-02 appears inconsistent with A-02
basis: E-02, A-02
origin: Evidence Review WP-11
status: unresolved analysis

InferredRelation IR-01
content: warnings may have been documented after the decision
basis: PA-01

Hypothesis H-01
content: termination justification may have been constructed retrospectively
basis: IR-01

KnownGaps
U-01 Internal HR chat logs not obtained
U-02 Second manager not interviewed
```

`H-01 ≠ truth`, `IR-01 ≠ CourtFactFinding`, `PA-01 ≠ allowed CourtRecord content merely because stored`.

## 9. Wrong-analysis example

```text
T1 Player Analysis PA-20:
“E12 contradicts W03.”

T2 New source and Review WorkProduct:
“E12 and W03 can both be true under different timing assumptions.”
```

Required behavior:

- PA-20 keeps its author, sources, as-of time and original status.
- New analysis may challenge/refine/supersede PA-20 in current projection.
- Historical strategy can continue to show it relied on PA-20.
- PA-20 is not rewritten as if never made.
- Neither analysis becomes objective truth through seniority, recency or storage.

This permits genuine player/NPC strategic mistakes while retaining explainability.

## 10. Known-unknown example

```text
Documents received: 40
Reviewed: 31
Unreviewed: 9
```

Valid: `9 acquired source items remain unreviewed.`  
Invalid: `One decisive clue remains hidden in those 9 documents.`

The second statement requires a legitimate discovery/source; otherwise it leaks an unknown unknown and hidden answer.

## 11. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | Case File represents firm-side epistemic state | **Core Accepted candidate** |
| 2 | Case File is not ActualStateRecord | **Core Accepted** |
| 3 | Case File is not CourtRecord | **Core Accepted** |
| 4 | Case File is not CourtFactFinding | **Core Accepted** |
| 5 | Semantic graph is canonical direction; folder/list UI is projection | **Core Accepted candidate** |
| 6 | SourceMaterial and SourceAssertion are separate | **Core Accepted candidate** |
| 7 | Assertion is not truth | **Core Accepted candidate** |
| 8 | ProfessionalAnalysis is separate from source/assertion | **Core Accepted candidate** |
| 9 | ProfessionalAnalysis may be wrong | **Core Accepted candidate** |
| 10 | InferredRelation requires provenance | **Core Accepted candidate** |
| 11 | Inference is not truth | **Core Accepted candidate** |
| 12 | Hypothesis is not evidence/fact | **Core Accepted candidate** |
| 13 | Known unknowns may be represented | **Core Accepted candidate** |
| 14 | Unknown unknowns are not omnisciently exposed | **Core Accepted candidate** |
| 15 | New knowledge should have provenance | **Core Accepted candidate** |
| 16 | Historical analysis is not overwritten | **Core Accepted candidate** |
| 17 | Conflicting assertions/analyses may coexist | **Core Accepted candidate** |
| 18 | No automatic truth resolution | **Core Accepted candidate** |
| 19 | No universal truth probability required | **Accepted candidate**; exact uncertainty TBD |
| 20 | Issue linkage does not prove an issue | **Core Accepted candidate** |
| 21 | Reconstructed chronology is not necessarily objective fact | **Accepted candidate** |
| 22 | Witness and Statements are distinct | **Core Accepted candidate** |
| 23 | WorkProduct updates Case File knowledge, not world truth | **Core Accepted candidate** |
| 24 | Direct/delegated work use the same knowledge ontology | **Core Accepted candidate** |
| 25 | Player-created analysis may be wrong | **Core Accepted candidate** |
| 26 | NPC-created analysis may be wrong | **Core Accepted candidate** |
| 27 | No omniscient canonical completeness/understanding percentage | **Core Accepted candidate** |
| 28 | Tasks read authorized known information, not hidden world state | **Core Accepted candidate** |
| 29 | Case File→CourtRecord requires explicit procedural materialization | **Core Accepted** |
| 30 | Case File content never directly changes JII/finding | **Core Accepted** |

## 12. Pressure-test examples

All fixtures are synthetic semantic examples, not executed tests or legal conclusions.

### Case 1 — Source exists, claim uncertain

**Input:** Email E1 exists and contains claim X.  
**May evaluate:** E1 acquisition/provenance and `E1 contains assertion X`.  
**Must not happen:** X promoted to truth.  
**Expected:** SourceMaterial and SourceAssertion remain separate.

### Case 2 — Witness assertion

**Input:** Witness W1 says A in Statement S1.  
**May evaluate:** speaker, context, time and source.  
**Must not happen:** A becomes objective fact or W1 globally truthful.  
**Expected:** Assertion object only.

### Case 3 — Two witnesses agree

**Input:** W1 and W2 separately say A.  
**May evaluate:** Two assertions and a provenance-bearing corroboration candidate.  
**Must not happen:** Majority/count promotes A to truth.  
**Expected:** Both assertions remain distinct.

### Case 4 — Conflicting assertions

**Input:** W1 says A; W2 says not-A.  
**May evaluate:** Conflict relation/status.  
**Must not happen:** File order, seniority or count selects truth.  
**Expected:** Both coexist unresolved.

### Case 5 — Lawyer analysis

**Input:** Lawyer L1's WP-5 says E12 appears inconsistent with W03/S1.  
**May evaluate:** ProfessionalAnalysis and InferredRelation with source/analyst/task refs.  
**Must not happen:** Confirmed contradiction/finding.  
**Expected:** Provenance-bearing analysis.

### Case 6 — Wrong analysis

**Input:** Later information shows E12 and W03 may be compatible.  
**May evaluate:** New review challenges old analysis.  
**Must not happen:** Delete/rewrite T1 reasoning.  
**Expected:** Old analysis historical; current projection may mark challenged/superseded.

### Case 7 — Player wrong hypothesis

**Input:** Player hypothesizes fraud; later sources undermine it.  
**May evaluate:** Hypothesis history and contrary analysis.  
**Must not happen:** Hypothesis treated as evidence or retroactively erased.  
**Expected:** Genuine strategic mistake remains traceable.

### Case 8 — WorkProduct truth laundering

**Input:** WP says `likely contradiction`; writer tries `confirmed contradiction`.  
**May evaluate:** Analysis update with uncertainty.  
**Must not happen:** Epistemic category escalation on storage.  
**Expected:** Invalid candidate.

### Case 9 — Case File→CourtRecord laundering

**Input:** Internal inference exists; judge is asked to consume it directly.  
**May evaluate:** Whether procedural materialization exists.  
**Must not happen:** Hidden/internal content enters CourtRecord/JII.  
**Expected:** Forbidden without valid procedural path.

### Case 10 — Known unknown

**Input:** 10 acquired documents are explicitly unreviewed.  
**May evaluate:** KnownGap and review Task candidate.  
**Must not happen:** Guess their hidden contents.  
**Expected:** Valid bounded known gap.

### Case 11 — Unknown unknown

**Input:** Undiscovered witness exists only in world state.  
**May evaluate:** Nothing until legitimate source/event discovers it.  
**Must not happen:** Concrete hidden Witness/Gap node.  
**Expected:** Absent from player-facing Case File.

### Case 12 — Omniscient clue-counter attack

**Input:** UI shows `2 important clues remain undiscovered`.  
**May evaluate:** Source-derived local reviewed/unreviewed counts only.  
**Must not happen:** Hidden answer denominator/count.  
**Expected:** Invalid unless legitimately source-derived and non-omniscient.

### Case 13 — Issue relation

**Input:** E14 appears relevant to Issue I-2.  
**May evaluate:** Provenance-bearing relevance/support candidate.  
**Must not happen:** I-2 marked proven.  
**Expected:** Link valid, proof absent.

### Case 14 — Chronology disputed

**Input:** W1 says March 3; document assertion suggests March 5.  
**May evaluate:** Two temporal assertions and disputed-timing relation.  
**Must not happen:** Silent date selection.  
**Expected:** Dispute preserved.

### Case 15 — Chronology laundering

**Input:** Professional reconstruction selects March 4.  
**May evaluate:** Reconstructed chronology analysis with basis.  
**Must not happen:** March 4 becomes objective date.  
**Expected:** Analysis, not fact.

### Case 16 — Multiple statements by one witness

**Input:** W3 gives S1 then S2.  
**May evaluate:** Both contextual/versioned Statements.  
**Must not happen:** Merge into one timeless testimony or global truth score.  
**Expected:** Both preserved.

### Case 17 — Statement correction

**Input:** W3 later corrects S1 through S2.  
**May evaluate:** Correction/supersession relation.  
**Must not happen:** S1 deletion.  
**Expected:** New statement linked; history retained.

### Case 18 — Professional analysis versions

**Input:** PA-v1 revised after explicit Review Task into PA-v2.  
**May evaluate:** Review lineage and current projection.  
**Must not happen:** In-place overwrite.  
**Expected:** Both versions and reason trace retained.

### Case 19 — Conflicting lawyers

**Input:** Lawyer A sees E1 supporting I-X; Lawyer B sees E1 as neutral.  
**May evaluate:** Two analyses with distinct bases/profiles/workproducts.  
**Must not happen:** Capability/seniority automatically chooses truth.  
**Expected:** Coexistence permitted.

### Case 20 — Senior review

**Input:** Partner challenges junior analysis.  
**May evaluate:** Review relation and new analysis.  
**Must not happen:** Seniority itself makes new analysis true or deletes old.  
**Expected:** Challenge/refinement history.

### Case 21 — Delegated analysis

**Input:** Associate Task generates issue link.  
**May evaluate:** Same ProfessionalAnalysis/InferredRelation objects as direct player work.  
**Must not happen:** Omniscient NPC ontology or hidden success note.  
**Expected:** Same semantic model.

### Case 22 — Source acquisition

**Input:** Previously unavailable record D7 is legitimately obtained.  
**May evaluate:** Acquisition event, source node and learned time.  
**Must not happen:** Retroactively known at earlier time.  
**Expected:** Explicit provenance expands Case File.

### Case 23 — Unauthorized hidden-state attack

**Input:** Task tries reading ActualStateRecord to locate clue.  
**May evaluate:** Authorized sources/CaseFile snapshot only.  
**Must not happen:** Hidden truth access.  
**Expected:** Forbidden.

### Case 24 — Hypothesis creates Task

**Input:** H1 suggests interviewing W3.  
**May evaluate:** H1 as Task origin/priority.  
**Must not happen:** H1 becomes truth/evidence.  
**Expected:** Task candidate allowed, outcome unresolved.

### Case 25 — Gap creates Task

**Input:** Known missing record U1.  
**May evaluate:** Document-request/acquisition Task candidate.  
**Must not happen:** Record appears merely because task exists.  
**Expected:** Valid planning link.

### Case 26 — Summary percentage attack

**Input:** `Case Understanding = 82%`.  
**May evaluate:** Explicit local coverage/gaps.  
**Must not happen:** Hidden denominator or canonical epistemic authority.  
**Expected:** Insufficient/invalid as canonical model.

### Case 27 — Folder relocation

**Input:** Player moves E12 between UI folders/tabs.  
**May evaluate:** View/group membership.  
**Must not happen:** Source type, truth, issue support or CourtRecord changes.  
**Expected:** No semantic truth/legal change.

### Case 28 — Court materialization

**Input:** Internal analysis informs draft; draft is filed, received and allowed through existing procedure.  
**May evaluate:** Explicit materialization refs and resulting allowed artifact.  
**Must not happen:** Internal analysis itself enters CourtRecord or guaranteed finding.  
**Expected:** Only properly materialized/allowed content may enter CourtRecord under existing rules.

## 13. Additional attack review

| Attack | Failure condition | Required result |
|---|---|---|
| Source = truth | Source existence proves contents | **Forbidden** |
| Assertion = truth | Claim becomes fact | **Forbidden** |
| Majority assertion = truth | Count resolves conflict | **Forbidden** |
| Senior analysis = truth | Rank becomes epistemic authority | **Forbidden** |
| High capability = correct | Capability grants omniscience | **Forbidden** |
| High confidence = truth | Belief certainty becomes world fact | **Forbidden** |
| Stored relation = objective relation | Graph write promotes inference | **Forbidden** |
| UI folder = authority | Placement changes semantic type | **Forbidden** |
| Timeline = actual event | Reconstruction treated as world history | **Forbidden** |
| Case File = ActualStateRecord | Hidden truth imported | **Forbidden** |
| Case File = CourtRecord | Internal material reaches judge | **Forbidden** |
| Hypothesis = evidence | Working theory supplies proof | **Forbidden** |
| Unknown/clue counter | UI leaks hidden state | **Forbidden** |
| Review overwrites history | Previous reasoning disappears | **Forbidden** |
| New WP deletes prior analysis | Revision loses provenance | **Forbidden** |
| NPC omniscience | Delegated task reads hidden truth | **Forbidden** |
| Player omniscience | Direct path reads hidden truth | **Forbidden** |
| Auto conflict resolution | Graph chooses one claim without rule/process | **Forbidden** |
| Overall case strength | One number substitutes epistemic structure | **Forbidden** |

## 14. False-PASS boundary

Every fixture must ask:

```text
Is this result supported by CFK semantics?
Or did authoring secretly use ActualStateRecord, hidden truth,
omniscient UI knowledge, invented evidence/procedure rules,
confidence thresholds, majority-vote truth or task algorithms?
```

If the latter is necessary, the example is invalid, PARTIAL or TBD—not PASS evidence. DEC-019 validates semantic separation only; it does not decide whether an analysis is legally or factually correct.

## 15. Explicit TBD list

- exact canonical epistemic taxonomy and node/entity schema
- exact relation vocabulary, directionality and cardinality
- confidence/uncertainty and contradiction-status vocabulary
- graph storage/database implementation
- UI folders/tabs/toggles, timeline/graph views, search/filter and summaries
- task auto-generation rules
- investigation and evidence acquisition/discovery mechanics
- witness interview and legal research mechanics
- issue-analysis and analysis-correctness rules
- confidence calculation, source reliability and NPC reasoning AI
- player task/minigame mechanics
- CourtRecord filing/admission/materialization details
- actual legal doctrine and Korean practice
- document generation
- save/API/schema/migration/Godot implementation
- performance, balancing and graph-scaling rules

## 16. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Truth laundering | Analysis becomes fact on save | Removes uncertainty and legal boundary | Typed epistemic category + provenance |
| Source/assertion collapse | Document and claim merge | Source existence proves content | Separate objects/refs |
| Analysis/truth collapse | Lawyer conclusion is objective | Strategy becomes answer key | Fallible analysis state |
| Omniscient Case File | Hidden world facts appear | Investigation/player knowledge bypass | Authorized acquisition only |
| Wrong analysis impossible | Every link is correct | No meaningful review/judgment | Allow challenge/error/history |
| Canonical relation edges | All graph edges are true | Inference laundering | Edge status/provenance |
| Hidden clue counters | Undiscovered answers counted | Leaks unknown unknowns | Known-gap metrics only |
| Percentage knowledge | Global completeness has hidden denominator | False precision/answer leak | Structured coverage/gaps |
| Folder semantic law | UI placement changes meaning | Fragile data and exploits | Projection-only UI |
| Overwrite history | Latest view deletes old | Replay impossible | Revision/conflict lineage |
| Conflict auto-resolution | System chooses truth silently | Conceals uncertainty | Coexist pending explicit process |
| Majority-vote truth | More assertions prove fact | Count replaces evaluation | Assertions remain claims |
| Seniority-based truth | Partner view auto-wins | Rank becomes oracle | Review relation, no automatic truth |
| Skill omniscience | Exceptional lawyer always correct | Capability bypasses information | Capability ≠ truth access |
| Auto judge feed | Case File reaches court | CourtRecord boundary collapses | Explicit materialization |
| Excessive graph complexity | Every item has dense edges | Performance/comprehension cost | Progressive detail and projections |
| Node explosion | Trivial fragments become nodes | Unusable model | Authoring granularity TBD/validation |
| Manual relation labor | Player must curate every edge | Busywork | Task-generated proposals and filters, mechanics TBD |
| Spreadsheet labor | UI exposes raw graph maintenance | Poor playability | Case-focused views/summaries |
| Excessive epistemic detail | Every uncertainty shown equally | Important signals buried | Disclosure/prioritization projections |

## 17. Player-facing design principle

> The player should see what the firm currently knows, believes, suspects, disputes and has not yet resolved. The player should not see the game's hidden answer key.

```text
simple case
→ small Case File, few issues/sources/relations

complex case
→ larger relation network, competing assertions,
   ambiguity, gaps and multiple WorkProducts
```

Difficulty need not come only from document volume. Conflict density, cross-links, ambiguity, missing information and competing interpretations may create complexity. Exact gameplay balancing and UI projections remain TBD.

## 18. DEC-020 candidates

| Candidate | Why next | Risk / dependency | Recommendation |
|---|---|---|---|
| Evidence Review & Investigation | Converts source acquisition/review into concrete Task/WorkProduct/knowledge updates | Combining may conflate review of known material with acquisition of unknown material | **Recommended direction; consider scoped separation** |
| Legal Research & Issue Analysis | Exercises Issue/Analysis graph | Requires substantive legal-content model | Strong later candidate |
| Witness / Statement Model | Deepens statement/provenance/conflict | Could prematurely decide credibility/procedure | Strong focused follow-up |
| Task Assignment / Workload / Team Coordination | Supports firm scale | Needs concrete task-family demand data | Later operational DEC |
| Legal Drafting / Filing | Closes materialization route | Depends on CourtRecord/procedure details | Later after evidence/knowledge tasks |

**Recommendation only:** DEC-020 should most naturally address Evidence Review & Investigation because DEC-019 now bounds the knowledge objects those Tasks may create. However, Evidence Review (known acquired material) and Investigation (search/acquisition beyond current Case File) have different authorization and unknown-unknown risks. A combined DEC should keep them as separate sub-pipelines; alternatively Evidence Review may precede a dedicated Investigation DEC. Final scope/order is not fixed here.

## 19. Proposed TEST-018 plan

File: `TEST-018_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`  
Method: manual / synthetic fixture-level verification only.

| # | Core fixture | Verification focus |
|---:|---|---|
| 1 | source ≠ truth | Material/assertion separation |
| 2 | assertion ≠ truth | No claim promotion |
| 3 | conflicting assertions | Coexistence |
| 4 | corroboration without truth promotion | Count non-authority |
| 5 | professional analysis | Analyst/source provenance |
| 6 | wrong analysis | Fallible state |
| 7 | superseded analysis | Historical lineage |
| 8 | inference provenance | Edge status/history |
| 9 | hypothesis separation | No evidence/fact promotion |
| 10 | known unknown | Explicit bounded gap |
| 11 | unknown unknown | No concrete hidden node |
| 12 | hidden clue leak | Omniscient counter rejection |
| 13 | issue linkage | Link ≠ proof |
| 14 | disputed chronology | Multiple temporal claims |
| 15 | witness multi-statement | Witness/statement separation |
| 16 | delegated same ontology | No NPC omniscience |
| 17 | WorkProduct update | Knowledge, not truth |
| 18 | truth-laundering attack | Storage non-authority |
| 19 | Case File→CourtRecord attack | Materialization boundary |
| 20 | ActualStateRecord access attack | Hidden-state prohibition |
| 21 | review history | No overwrite |
| 22 | conflict coexistence | No auto-resolution |
| 23 | majority-truth attack | Count non-authority |
| 24 | confidence-truth attack | Confidence ≠ truth |
| 25 | UI folder non-authority | Projection only |
| 26 | percentage-completeness attack | No hidden denominator |
| 27 | task from gap/hypothesis | Planning without truth promotion |
| 28 | procedural materialization | Explicit allowed path only |

## 20. Decision summary

### 20.1 Inherited Accepted

| Decision | Status |
|---|---|
| ActualStateRecord, CaseFileState, CourtRecord and CourtFactFinding remain distinct | **Core Accepted** |
| Only allowed CourtRecord enters fact evaluation | **Core Accepted** |
| Internal WorkProduct/Case File content requires explicit procedural materialization | **Core Accepted** |
| No direct Case File effect on ChoicePoint/JII/finding | **Core Accepted** |

### 20.2 Core Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| CFK1–CFK9 | Firm-side graph epistemic state; source/assertion/analysis/inference separation; no truth laundering | **Core Accepted candidate** |
| CFK11–CFK15 | Known-gap boundary, no unknown-unknown leak, provenance/history/conflict coexistence | **Core Accepted candidate** |
| CFK17, CFK19–CFK20, CFK22 | Issue/witness/workproduct/direct-delegated boundaries | **Core Accepted candidate** |
| CFK24–CFK25 | No omniscient completeness; authorized read/write | **Core Accepted candidate** |

### 20.3 Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| CFK10 | Hypothesis may drive planning/tasks without truth status | **Accepted candidate** |
| CFK16 | Qualitative/structured uncertainty, no mandatory universal probability | **Accepted candidate** |
| CFK18 | Epistemically typed chronology | **Accepted candidate** |
| CFK21, CFK23 | Player analysis and conflict/refinement interface | **Accepted candidate** |

### 20.4 TBD

All exact taxonomies, schemas, relation/status vocabularies, correctness/confidence rules, content-specific workflows, procedural doctrine, UI/storage/AI/save/Godot and performance remain **TBD** as listed in §15.

### 20.5 Forbidden

- Source/assertion/analysis/inference/hypothesis promoted to truth by storage, count, confidence, capability, seniority or UI placement.
- ActualStateRecord or hidden world state read by Task/Case File.
- Unknown-unknown/clue counters or omniscient completeness percentages.
- Automatic conflict resolution, history overwrite or NPC omniscience.
- Case File/Internal WorkProduct automatically entering CourtRecord.
- Case File content directly changing ChoicePoint, JII, finding or outcome.

## 21. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | CFK1–CFK26 define firm-side graph epistemic state, source/assertion/analysis/inference/hypothesis/gap separation, fallible analysis, known/unknown boundary, provenance/history/conflict, authorized task reads, WorkProduct knowledge updates and explicit CourtRecord materialization. Includes 28 pressure fixtures and TEST-018 proposal. |
