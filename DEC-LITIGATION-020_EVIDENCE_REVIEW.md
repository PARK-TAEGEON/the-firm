# THE FIRM — Evidence Review

문서 ID: DEC-LITIGATION-020  
버전: v0.2 — Accepted  
상태: **Accepted**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 기준: `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `TEST-018_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `TEST-017_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`, `DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md`, `DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md`, `DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md`  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose / boundary

Evidence Review는 이미 legitimately acquired, authorized, available한 SourceMaterial을 명시된 Task scope에서 읽고 structured `EvidenceReviewWorkProduct`를 만드는 공통 Task family다.

```text
Authorized SourceMaterial + EvidenceReviewTaskDefinition + TaskAssignment
+ PerformerRole/LawyerRoleProfileVersion + CaseFileState snapshot
+ time/resources/capacity + direction + dependencies + materialized events
→ Evidence Review execution
→ EvidenceReviewWorkProduct
→ provenance-bearing Case File update
```

```text
Evidence Review ≠ Investigation
ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding
Source says X ≠ X is true
Reviewer identifies Y ≠ Y is objectively true
```

이 문서는 Investigation, evidence acquisition, exact extraction/accuracy algorithm, legal doctrine, UI, schema/API/save 또는 Godot 구현을 확정하지 않는다.

## 2. Core principles

- Review는 acquired material을 소비한다. World에만 존재하는 source, witness 또는 hidden clue를 발견하지 않는다.
- Review scope는 source/issue/person/chronology/contradiction 등으로 명시적으로 bounded된다.
- `assigned ≠ reviewed ≠ correctly understood`를 보존한다.
- Extraction은 source가 명시한 내용을 기록하고, analysis는 reviewer가 의미를 해석한 결과다.
- Analysis, inferred relation, contradiction/corroboration candidate와 chronology reconstruction은 틀릴 수 있다.
- WorkProduct는 Case File knowledge를 provenance-bearing 방식으로 update할 수 있으나 truth, ActualStateRecord, CourtRecord가 아니다.
- Capability는 component에 기여할 수 있지만 universal score, weighted sum, JII/finding/outcome modifier가 아니다.
- Clear semantics는 deterministic을 지향한다. genuinely borderline component의 bounded variation은 explicit materialized event로만 허용된다.

## 3. Evidence Review vs Investigation

| Dimension | Evidence Review | Investigation |
|---|---|---|
| Input | 이미 acquired/authorized documents, media, data, statements, Case File refs | 아직 없는 source/witness의 탐색·획득 가능성 |
| Output | extracted assertions/dates/entities, relevance/contradiction/corroboration candidates, gaps, analysis, coverage | new source acquisition, witness discovery, external collection |
| Unknown unknown | 발견 전 구체화하지 않음 | 별도 discovery semantics 필요 |
| DEC-020 boundary | **in scope** | **separate / TBD** |

Hard boundary: Evidence Review Task가 authorized scope 밖의 E99를 읽거나 “hidden bank account”를 world state에서 찾아내면 invalid다.

## 4. EvidenceReviewTaskDefinition minimum semantics

Semantic candidate는 다음을 선언할 수 있어야 한다.

```text
review purpose
authorized/acquired source scope
eligible performer roles
review depth/direction
issue/question focus
time/resources/capacity
dependencies
capability contribution refs
required/optional output components
completion semantics
```

Canonical schema, task catalog와 depth vocabulary는 **TBD**다. Universal `EvidenceReviewDifficulty` 또는 `ReviewQuality`를 만들지 않는다.

## 5. Review scope and coverage

Scope examples:

```text
E01–E20
E01–E20 for Issue I03
communications between A and B
E04 for timeline references
```

Coverage는 percentage가 아니라 다음과 같은 structured boundary로 표현할 수 있다.

```text
reviewed_scope
partially_reviewed_scope
unreviewed_scope
excluded_scope
inaccessible_scope
needs_revisit
```

UI local percentage는 향후 explicit known denominator가 있을 때만 projection으로 고려할 수 있으며 canonical authority가 아니다.

## 6. EvidenceReviewWorkProduct components

Review 결과는 필요에 따라 다음을 포함한다.

- actually reviewed source refs and source versions
- recorded extractions (reviewer/system-recorded representations of source content)
- extracted SourceAssertions
- person/entity/account/location references
- temporal references and chronology candidates
- issue relevance/support candidates
- contradiction candidates
- corroboration candidates
- known gaps and unresolved questions
- limitations/risks (OCR, context, time, specialist access 등)
- follow-up Task candidates
- analyst, performer/profile, Task, direction, time/context, dependency and version provenance

각 component의 정확한 vocabulary와 resolution은 task-specific/TBD다. 모든 output은 objective truth로 자동 승격되지 않는다.

## 7. Extraction vs analysis

```text
Extraction: E12 contains “Payment was approved on May 4.”
Analysis: This appears inconsistent with S03 saying approval occurred May 7.
```

`SourceMaterial/source-contained content ≠ RecordedExtraction ≠ ProfessionalAnalysis`이다. `RecordedExtraction`은 특정 source에서 reviewer/system이 읽었다고 기록한 provenance-bearing representation이며 underlying source를 mutate하지 않는다. RecordedExtraction은 틀릴 수 있다: `RecordedExtraction says X ≠ SourceMaterial actually contains X ≠ X is objectively true`. ProfessionalAnalysis는 SourceMaterial, RecordedExtraction 또는 다른 Case File context를 해석한 별도 conclusion이며 역시 truth가 아니다. Mechanical extraction/error correction의 정확한 mechanics는 source/task별 TBD다.

## 8. Capability and review error boundary

DEC-017/018의 component semantics를 상속한다. document analysis, contradiction tracking, issue analysis, specialization, attention/detail은 관련 components에 기여할 수 있으나 average/highest/weakest/weighted total을 기본 규칙으로 만들지 않는다.

Reviewer는 subtle assertion, cross-reference, contradiction, relevance, risk 또는 ambiguity를 놓치거나 잘못 해석할 수 있다. Miss/error probability, source reliability formula와 hidden `skill → discovery chance`는 이 DEC에서 정의하지 않는다.

## 9. Review modes

### 9.1 Single-source review

One source 내부 assertions, dates, entities, ambiguity와 referenced missing material을 검토한다.

### 9.2 Comparative review

복수의 authorized sources를 비교하여 contradiction/corroboration/chronology conflict/link candidates를 만든다.

모든 review가 모든 source를 비교할 필요는 없다.

### 9.3 Triage and deep review

Triage는 많은 acquired sources에서 priority/relevance/gap을 빠르게 표시하고 deeper Review Task를 제안할 수 있다. Triage가 full extraction/deep review 또는 hidden decisive clue detection을 보장하지 않는다. Deep review는 explicit scope/time/direction을 가진 별도 Task로 표현할 수 있다. Vocabulary와 효과는 TBD다.

## 10. Review, source versions and history

WorkProduct는 Task, assignment, performer/profile version, reviewed scope, source versions, direction, time/context, outputs, limitations/gaps와 later review/revision lineage를 보존한다. E10 v1을 검토한 결과는 이후 E10 v2에 자동 적용되지 않는다. Source update는 새 Review Task가 필요할 수 있으며 invalidation/update policy는 TBD다.

Duplicate/forwarded/near-duplicate sources는 separate provenance를 보존하고 possible-duplicate relation을 제안할 수 있다. Deduplication algorithm은 TBD다.

## 11. Design decisions

각 결정은 Problem, Alternatives, Failure modes, Recommendation, Status, Reason을 포함한다.

### ER1 — Evidence Review as explicit Task family
**Problem:** Case 전체를 한 번에 스캔할 것인가?  
**Alternatives:** monolithic scan(범위/책임 불명확); explicit Task(추적 가능).  
**Failure modes:** monolith는 coverage와 provenance를 숨긴다.  
**Recommendation:** Evidence Review를 TaskDefinition/Assignment/WorkProduct family로 둔다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018의 work-unit semantics를 concrete하게 적용한다.

### ER2 — Acquired and authorized material only
**Problem:** 어떤 source를 읽는가?  
**Alternatives:** world 전체; acquired only; acquired+authorized+available+scope.  
**Failure modes:** world read는 hidden-state leakage다.  
**Recommendation:** 마지막 옵션만 허용한다.  
**Status:** **Core Accepted candidate**  
**Reason:** Case File/ActualStateRecord 경계를 유지한다.

### ER3 — Review is not Investigation
**Problem:** Review가 missing material도 찾아야 하는가?  
**Alternatives:** 합치기; Review는 known sources, Investigation은 acquisition/discovery.  
**Failure modes:** 합치면 unknown unknown과 acquisition authority가 섞인다.  
**Recommendation:** 분리한다.  
**Status:** **Core Accepted candidate**  
**Reason:** 서로 다른 input/unknown semantics다.

### ER4 — Explicit bounded review scope
**Problem:** Reviewer가 모든 Case File을 읽는가?  
**Alternatives:** whole case implicit; explicit source/issue/person/time scope.  
**Failure modes:** implicit scope는 assigned/reviewed를 혼동한다.  
**Recommendation:** Task가 authorized source scope와 focus를 선언한다.  
**Status:** **Core Accepted candidate**  
**Reason:** accountability와 repeatability를 보장한다.

### ER5 — Structured coverage
**Problem:** coverage를 무엇으로 표시하는가?  
**Alternatives:** one percentage; reviewed/partial/unreviewed/excluded/inaccessible/needs-revisit.  
**Failure modes:** percentage는 hidden denominator/answer leak다.  
**Recommendation:** structured coverage를 source of truth로 한다.  
**Status:** **Core Accepted candidate**  
**Reason:** incomplete review와 known gap을 보존한다.

### ER6 — No universal review score
**Problem:** ReviewQuality 73을 canonical output으로 둘 것인가?  
**Alternatives:** score; pass/fail; structured result.  
**Failure modes:** score는 scope/gap/reason을 잃는다.  
**Recommendation:** universal score를 금지하고 structure를 authoritative하게 한다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018 structured WorkProduct와 정합된다.

### ER7 — Extraction and analysis separation
**Problem:** source text와 reviewer meaning을 합칠 것인가?  
**Alternatives:** merge; separate assertion and analysis.  
**Failure modes:** reviewer interpretation이 source truth가 된다.  
**Recommendation:** 별도 objects/refs와 provenance.  
**Status:** **Core Accepted candidate**  
**Reason:** source-visible content, reviewer-recorded reading과 interpretation을 분리하고 mistaken extraction의 lineage를 보존한다.

### ER31 — Source content vs RecordedExtraction boundary
**Problem:** reviewer-recorded extraction이 source content 자체인가?  
**Alternatives:** A) extraction이 source를 overwrite/동일시; B) extraction이 analysis와 동일; C) 별도 provenance-bearing RecordedExtraction.  
**Failure modes:** A는 source history corruption, B는 literal reading과 interpretation collapse 및 mistaken extraction correction/history 표현 불가를 만든다.  
**Recommendation:** `RecordedExtraction`을 SourceMaterial/source-contained content와 ProfessionalAnalysis 사이의 별도 semantic layer로 둔다. It records what the review process recorded, may be mistaken, and never rewrites its source.  
**Status:** **Core Accepted candidate**  
**Reason:** review error propagation과 immutable source provenance, downstream explainability를 함께 보존한다.

### ER8 — SourceAssertion creation
**Problem:** 명시적 source claim을 어떻게 기록하는가?  
**Alternatives:** note only; SourceAssertion with source/author/context/time.  
**Failure modes:** quote origin과 scope를 잃는다.  
**Recommendation:** SourceAssertion candidate를 생성한다.  
**Status:** **Accepted candidate**  
**Reason:** DEC-019 source/assertion family를 채운다.

### ER9 — Temporal/entity extraction
**Problem:** date/person mention이 무엇을 의미하는가?  
**Alternatives:** objective event/role; extracted reference candidate.  
**Failure modes:** mention이 fact/date/role로 laundering된다.  
**Recommendation:** temporal/entity reference candidate로만 기록한다.  
**Status:** **Core Accepted candidate**  
**Reason:** chronology/witness boundaries를 보존한다.

### ER10 — Issue relevance candidate
**Problem:** source가 issue와 연결되면 proof인가?  
**Alternatives:** proof; contextual relevance/support candidate.  
**Failure modes:** issue finding이 조기 생성된다.  
**Recommendation:** provenance-bearing candidate link만 생성한다.  
**Status:** **Core Accepted candidate**  
**Reason:** relation은 adjudication이 아니다.

### ER11 — Contradiction candidate
**Problem:** 두 source가 다르면 확정 contradiction인가?  
**Alternatives:** confirmed contradiction; candidate analysis.  
**Failure modes:** later context와 compatible한 경우 history를 잃는다.  
**Recommendation:** “appears inconsistent” candidate로 기록한다.  
**Status:** **Core Accepted candidate**  
**Reason:** fallible analysis를 허용한다.

### ER12 — Corroboration candidate
**Problem:** 일치하는 sources가 truth를 만드는가?  
**Alternatives:** vote/truth; corroboration candidate.  
**Failure modes:** majority truth laundering.  
**Recommendation:** mutually-consistent/corroboration candidate만 허용한다.  
**Status:** **Core Accepted candidate**  
**Reason:** count는 finding rule이 아니다.

### ER13 — Gaps and unresolved questions
**Problem:** missing attachment/date/identity를 어떻게 기록하는가?  
**Alternatives:** omit; invent content; KnownGap/unresolved question.  
**Failure modes:** omit은 planning을 잃고 invent는 hidden truth다.  
**Recommendation:** bounded gap과 provenance를 기록한다.  
**Status:** **Core Accepted candidate**  
**Reason:** ignorance를 actionable하게 표현한다.

### ER14 — No hidden-content discovery
**Problem:** reviewer가 referenced missing content를 알 수 있는가?  
**Alternatives:** hidden content reveal; gap only.  
**Failure modes:** unknown unknown leak.  
**Recommendation:** missing source/content를 만들거나 추측하지 않는다.  
**Status:** **Core Accepted candidate**  
**Reason:** Review/Investigation separation.

### ER15 — Component-based capability contribution
**Problem:** capability가 review result에 어떻게 기여하는가?  
**Alternatives:** total score; component-specific contribution.  
**Failure modes:** weighted/average result가 provenance와 gaps를 압축한다.  
**Recommendation:** relevant WorkProduct components에 연결한다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-017/018 상속.

### ER16 — Reviewer may miss content
**Problem:** Review가 omniscient인가?  
**Alternatives:** always complete; miss 가능성.  
**Failure modes:** always complete는 task/attention/time을 무의미하게 한다.  
**Recommendation:** miss/incomplete output을 허용하되 probability는 TBD.  
**Status:** **Accepted candidate**  
**Reason:** capability ≠ omniscience.

### ER17 — Reviewer may misinterpret
**Problem:** extracted/linked meaning은 항상 correct인가?  
**Alternatives:** oracle; fallible analysis.  
**Failure modes:** later review와 player error가 불가능해진다.  
**Recommendation:** analysis/linkage가 mistaken/overread/underread될 수 있게 한다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-019 wrong-analysis state.

### ER18 — No hidden weighted sum
**Problem:** review capability를 하나로 합칠 것인가?  
**Alternatives:** weighted sum; highest/weakest shortcut; components.  
**Failure modes:** universal review score와 hidden formula.  
**Recommendation:** default weighted sum을 만들지 않는다.  
**Status:** **Core Accepted candidate**  
**Reason:** exact mapping은 task-specific/TBD로 남긴다.

### ER19 — Single vs comparative review
**Problem:** 모든 review가 cross-source인가?  
**Alternatives:** always compare; single/comparative modes.  
**Failure modes:** 불필요한 scope 확대와 false conflict.  
**Recommendation:** 명시된 source set에 따라 두 mode를 지원한다.  
**Status:** **Accepted candidate**  
**Reason:** scope와 purpose를 존중한다.

### ER20 — Review depth as direction
**Problem:** triage/standard/deep을 어떻게 표현하는가?  
**Alternatives:** numeric accuracy level; structured direction/scope/time.  
**Failure modes:** depth bonus formula.  
**Recommendation:** direction, expected components와 allocated context로 표현하고 vocabulary/effect는 TBD.  
**Status:** **Accepted candidate**  
**Reason:** review effort를 설명하되 hidden bonus를 피한다.

### ER21 — Triage review
**Problem:** large source set의 initial pass가 필요한가?  
**Alternatives:** no triage; triage as bounded review Task.  
**Failure modes:** triage가 deep review로 오인된다.  
**Recommendation:** priority/relevance/gap candidates와 follow-up Tasks만 산출할 수 있게 한다.  
**Status:** **Accepted candidate**  
**Reason:** solo→firm scaling을 지원한다.

### ER22 — WorkProduct provenance/version
**Problem:** review output을 어떻게 설명/replay하는가?  
**Alternatives:** latest note; immutable task/source/profile/time lineage.  
**Failure modes:** source와 reviewer context를 잃는다.  
**Recommendation:** complete provenance/version refs를 보존한다.  
**Status:** **Core Accepted candidate**  
**Reason:** Case File history와 replay.

### ER23 — Source-version sensitivity
**Problem:** source v1 review가 v2에도 유효한가?  
**Alternatives:** auto-apply; version-sensitive new review.  
**Failure modes:** changed content가 old conclusion에 섞인다.  
**Recommendation:** old WP는 v1에 묶고 v2는 new/review Task candidate로 둔다.  
**Status:** **Core Accepted candidate**  
**Reason:** historical accuracy.

### ER24 — Duplicate/provenance preservation
**Problem:** copied/forwarded source를 합칠 것인가?  
**Alternatives:** erase duplicates; possible-duplicate relation with separate origins.  
**Failure modes:** independent provenance가 소실된다.  
**Recommendation:** relation은 제안하되 source history를 지우지 않는다.  
**Status:** **Accepted candidate**  
**Reason:** deduplication ≠ truth merge.

### ER25 — Contextual relevance
**Problem:** source relevance가 case-wide인가?  
**Alternatives:** global relevant/irrelevant; purpose/issue-scoped relevance.  
**Failure modes:** later Issue relevance가 차단된다.  
**Recommendation:** review purpose/context에 한정한다.  
**Status:** **Core Accepted candidate**  
**Reason:** same source can matter to different issues.

### ER26 — Direct/delegated same ontology
**Problem:** NPC review를 별도 percentage engine으로 둘 것인가?  
**Alternatives:** separate hidden engine; same Task/WorkProduct ontology.  
**Failure modes:** delegation cheating/semantic divergence.  
**Recommendation:** execution source만 다르고 ontology는 동일하다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018 direct/delegated boundary.

### ER27 — Support-role eligibility
**Problem:** support staff가 어떤 review를 할 수 있는가?  
**Alternatives:** all/no support; TaskDefinition role eligibility.  
**Failure modes:** support staff=weak lawyer 또는 role waiver.  
**Recommendation:** indexing/metadata 등은 허용 가능하되 interpretive task는 explicit role requirement를 따른다.  
**Status:** **Accepted candidate**  
**Reason:** actual Korean role scope는 TBD.

### ER28 — Review dependencies
**Problem:** preprocessing/acquisition/translation/specialist dependency를 어떻게 처리하는가?  
**Alternatives:** silently assume; required/optional dependency refs.  
**Failure modes:** absent input이 fabricated된다.  
**Recommendation:** dependency를 Task semantics에 기록하고 exact handling은 TBD.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-018 dependency boundary.

### ER29 — Parallel review
**Problem:** large set을 분할 review할 수 있는가?  
**Alternatives:** forced serial; parallel WorkProducts then explicit cross-review/synthesis.  
**Failure modes:** auto-perfect merge.  
**Recommendation:** parallel branches와 later synthesis Task를 허용한다.  
**Status:** **Accepted candidate**  
**Reason:** coordination과 provenance를 보존한다.

### ER30 — Case File update boundary
**Problem:** Review WP가 무엇을 Case File에 쓸 수 있는가?  
**Alternatives:** no write; write truth/CourtRecord; provenance-bearing assertions/analysis/relations/gaps/tasks.  
**Failure modes:** no write는 work persistence를 잃고 truth write는 laundering이다.  
**Recommendation:** 마지막 옵션만 허용하며 CourtRecord materialization은 별도다.  
**Status:** **Core Accepted candidate**  
**Reason:** DEC-019/018 causal chain을 안전하게 연결한다.

## 12. EvidenceReviewWorkProduct reference model

Illustrative semantic reference only; canonical schema가 아니다.

```text
EvidenceReviewWorkProduct
├─ task / assignment / performer / profile refs
├─ authorized source scope and source versions
├─ reviewed / partially reviewed / unreviewed / excluded scope
├─ extracted assertions
├─ recorded extractions
├─ extracted entities and temporal references
├─ issue relevance candidates
├─ contradiction candidates
├─ corroboration candidates
├─ chronology candidates
├─ gaps / unresolved questions
├─ limitations / risks
├─ follow-up Task candidates
├─ analysis / inference refs
└─ provenance / version / history
```

No universal `quality` field is semantic authority.

## 13. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | Evidence Review is an explicit Task family | **Core Accepted candidate** |
| 2 | Review consumes acquired/authorized material only | **Core Accepted candidate** |
| 3 | Review does not discover unavailable sources | **Core Accepted candidate** |
| 4 | Evidence Review ≠ Investigation | **Core Accepted candidate** |
| 5 | Review scope is explicit | **Core Accepted candidate** |
| 6 | Assigned scope ≠ reviewed scope | **Core Accepted candidate** |
| 7 | Reviewed scope ≠ correctly understood scope | **Core Accepted candidate** |
| 8 | Coverage is structured | **Core Accepted candidate** |
| 9 | No universal review-quality score | **Core Accepted candidate** |
| 10 | Extraction and analysis are separate | **Core Accepted candidate** |
| 10a | SourceMaterial/source-contained content ≠ RecordedExtraction | **Core Accepted candidate** |
| 10b | RecordedExtraction ≠ ProfessionalAnalysis | **Core Accepted candidate** |
| 10c | RecordedExtraction may be mistaken | **Core Accepted candidate** |
| 10d | Mistaken RecordedExtraction never rewrites SourceMaterial | **Core Accepted candidate** |
| 10e | RecordedExtraction is not objective truth | **Core Accepted candidate** |
| 10f | Correction/re-review preserves historical extraction provenance | **Core Accepted candidate** |
| 11 | SourceAssertion ≠ truth | **Core Accepted** inherited |
| 12 | Extracted date ≠ objective event date | **Core Accepted candidate** |
| 13 | Entity mention ≠ verified role/fact | **Core Accepted candidate** |
| 14 | Issue link ≠ proof | **Core Accepted candidate** |
| 15 | Contradiction candidate ≠ objective contradiction | **Core Accepted candidate** |
| 16 | Corroboration candidate ≠ truth | **Core Accepted candidate** |
| 17 | Known gap may be created | **Core Accepted candidate** |
| 18 | Hidden content cannot be inferred from gap alone | **Core Accepted candidate** |
| 19 | Reviewer may miss content | **Accepted candidate** |
| 20 | Reviewer may misinterpret content | **Core Accepted candidate** |
| 21 | Capability does not guarantee complete/correct review | **Core Accepted candidate** |
| 22 | No hidden weighted capability sum | **Core Accepted candidate** |
| 23 | Direct/delegated review use same ontology | **Core Accepted candidate** |
| 24 | Support staff are role-distinct, not weak lawyers | **Core Accepted** inherited |
| 25 | WorkProduct preserves source versions/provenance | **Core Accepted candidate** |
| 26 | New source version does not rewrite old review | **Core Accepted candidate** |
| 27 | Duplicate sources preserve provenance | **Accepted candidate** |
| 28 | Relevance is contextual | **Core Accepted candidate** |
| 29 | Parallel review does not auto-merge into truth | **Accepted candidate** |
| 30 | WorkProduct updates Case File knowledge, not ActualStateRecord | **Core Accepted** inherited |
| 31 | WorkProduct does not automatically enter CourtRecord | **Core Accepted** inherited |
| 32 | Review result does not directly change JII/finding | **Core Accepted** inherited |
| 33 | Unknown unknowns are not exposed | **Core Accepted** inherited |
| 34 | Investigation/acquisition mechanics remain separate/TBD | **Core Accepted candidate** |

### 13.1 Mistaken extraction semantic pressure fixture

```text
SourceMaterial E10 (immutable source-contained content):
“Payment was approved May 14.”

RecordedExtraction RX-01:
“Payment was approved May 4.”
origin: EvidenceReviewWorkProduct WP-31
source: E10

ProfessionalAnalysis PA-04:
“If May 4 is correct, approval preceded committee review.”
basis: RX-01
```

Required semantics:

- E10 remains May 14; reviewer output cannot mutate or rewrite SourceMaterial.
- RX-01 is a provenance-bearing record of what the review process recorded, and may be mistaken.
- PA-04 is an interpretation of RX-01, not objective truth.
- Downstream strategy/Task may historically reference RX-01/PA-04.
- Later review may challenge/correct them, but must preserve old extraction, analysis and strategy lineage.
- No OCR accuracy, hallucination probability, skill percentage or automatic correction algorithm is introduced here; those remain TBD.

## 14. Pressure-test examples

All examples are synthetic semantic fixtures; they do not assert Korean law or implementation behavior.

### Case 1 — Basic document review
**Input:** Five authorized documents; reviewer inspects all five.  
**May evaluate:** reviewed scope, extracted assertions, gaps and provenance.  
**Must not happen:** one hidden quality roll or truth promotion.  
**Expected:** structured EvidenceReviewWorkProduct.

### Case 2 — Assigned ≠ reviewed
**Input:** Five authorized sources; only three opened.  
**May evaluate:** 3 reviewed, 2 unreviewed.  
**Must not happen:** unreviewed sources marked understood.  
**Expected:** coverage preserves the distinction; completion semantics remain Task-specific/TBD.

### Case 3 — Unauthorized source
**Input:** World contains E99; Task authorizes E01–E05.  
**May evaluate:** E01–E05 only.  
**Must not happen:** E99 appears in output.  
**Expected:** E99 unavailable to Review.

### Case 4 — Missing attachment
**Input:** E20 says “see attached spreadsheet”; attachment not acquired.  
**May evaluate:** KnownGap: referenced attachment unavailable.  
**Must not happen:** hidden spreadsheet contents.  
**Expected:** gap only.

### Case 5 — Source assertion extraction
**Input:** Email states X.  
**May evaluate:** SourceAssertion “email states X”.  
**Must not happen:** X true.  
**Expected:** assertion with source/author/context.

### Case 6 — Temporal extraction
**Input:** Source mentions March 14.  
**May evaluate:** temporal reference candidate.  
**Must not happen:** objective event date.  
**Expected:** chronology candidate with provenance.

### Case 7 — Entity extraction
**Input:** Document mentions Person P.  
**May evaluate:** entity/person reference candidate.  
**Must not happen:** verified role or fact assignment.  
**Expected:** reference only.

### Case 8 — Issue relevance
**Input:** Reviewer links E1 to Issue I1.  
**May evaluate:** contextual relevance/support relation.  
**Must not happen:** I1 proven.  
**Expected:** provenance-bearing candidate.

### Case 9 — Correct-looking contradiction candidate
**Input:** E1 and S1 appear inconsistent.  
**May evaluate:** contradiction candidate.  
**Must not happen:** confirmed contradiction/finding.  
**Expected:** “appears inconsistent” analysis.

### Case 10 — False contradiction
**Input:** Later context makes E1 and S1 compatible.  
**May evaluate:** challenge/refinement of original analysis.  
**Must not happen:** original deletion.  
**Expected:** history preserved.

### Case 11 — Corroboration
**Input:** Two authorized sources appear mutually consistent.  
**May evaluate:** corroboration candidate.  
**Must not happen:** proposition truth promotion.  
**Expected:** separate assertions plus candidate relation.

### Case 12 — Majority corroboration attack
**Input:** Five sources repeat X.  
**May evaluate:** five provenance-bearing assertions.  
**Must not happen:** 5 votes→X true.  
**Expected:** no automatic truth.

### Case 13 — Reviewer misses subtle content
**Input:** Task-specific fixture permits a subtle reference to be missed.  
**May evaluate:** incomplete coverage/output.  
**Must not happen:** invented miss probability.  
**Expected:** incomplete review is semantically possible.

### Case 14 — Exceptional reviewer / missing source
**Input:** Exceptional reviewer lacks critical source.  
**May evaluate:** gap and limitation.  
**Must not happen:** source/content creation.  
**Expected:** missing remains missing.

### Case 15 — Exceptional reviewer / limited time
**Input:** Exceptional reviewer has severe time limit.  
**May evaluate:** constrained reviewed scope/gaps.  
**Must not happen:** profile downgrade or percentage penalty.  
**Expected:** capability remains exceptional; output may be partial.

### Case 16 — Extraction vs interpretation
**Input:** Source says “approved May 4”; reviewer infers approval preceded committee review.  
**May evaluate:** literal assertion and separate analysis.  
**Must not happen:** inference replaces assertion.  
**Expected:** two provenance-linked layers.

### Case 17 — Wrong interpretation
**Input:** Later information undermines reviewer interpretation.  
**May evaluate:** challenge/supersede/refine lineage.  
**Must not happen:** old analysis erased.  
**Expected:** fallible historical analysis.

### Case 18 — Broad vs focused review
**Input:** Same sources; Task A broad, Task B focused on I3.  
**May evaluate:** different output scopes/components.  
**Must not happen:** hidden source universe difference.  
**Expected:** direction/scope explains difference.

### Case 19 — Triage review
**Input:** 100 sources; quick triage Task.  
**May evaluate:** priority/relevance candidates and deeper-review Tasks.  
**Must not happen:** full deep extraction/hidden decisive clue.  
**Expected:** triage remains bounded.

### Case 20 — Deep review
**Input:** Small subset with explicit deep scope/time.  
**May evaluate:** additional requested components.  
**Must not happen:** universal depth accuracy bonus.  
**Expected:** different WorkProduct request, effect TBD.

### Case 21 — Direct player review
**Input:** Player flags contradiction candidate.  
**May evaluate:** player-authored analysis ontology.  
**Must not happen:** direct mode truth shortcut.  
**Expected:** same Case File analysis type.

### Case 22 — Delegated associate review
**Input:** Associate performs equivalent Review Task.  
**May evaluate:** same WorkProduct/provenance ontology.  
**Must not happen:** hidden success percentage engine.  
**Expected:** execution source differs, semantics do not.

### Case 23 — Support-role allowed task
**Input:** Document indexing/basic metadata Task permits support role.  
**May evaluate:** role-valid extraction/organization.  
**Must not happen:** support role treated as lawyer or truth oracle.  
**Expected:** valid if TaskDefinition allows.

### Case 24 — Support-role invalid interpretive task
**Input:** Lawyer-required legal evidence analysis assigned to support role.  
**May evaluate:** role mismatch.  
**Must not happen:** experience magnitude waives role requirement.  
**Expected:** invalid assignment.

### Case 25 — Source version update
**Input:** E10 v1 reviewed; E10 v2 later acquired.  
**May evaluate:** new source version and new Review Task.  
**Must not happen:** v1 WorkProduct silently applies to v2.  
**Expected:** old review tied to v1.

### Case 26 — Duplicate sources
**Input:** E1/E2 appear forwarded copies.  
**May evaluate:** possible-duplicate relation.  
**Must not happen:** one provenance erased.  
**Expected:** separate source history.

### Case 27 — Contextual relevance
**Input:** E1 irrelevant to I1 but potentially relevant to I3.  
**May evaluate:** purpose-scoped relevance.  
**Must not happen:** global irrelevant flag.  
**Expected:** context-dependent links.

### Case 28 — Parallel review
**Input:** A reviews E1–E50; B reviews E51–E100.  
**May evaluate:** separate WorkProducts and later CrossReview/Synthesis Task.  
**Must not happen:** auto-perfect merge/truth.  
**Expected:** parallel branches preserved.

### Case 29 — Case File update
**Input:** Review WP creates SourceAssertion, contradiction candidate and KnownGap.  
**May evaluate:** provenance-bearing Case File updates.  
**Must not happen:** ActualState/CourtRecord mutation.  
**Expected:** knowledge update only.

### Case 30 — CourtRecord attack
**Input:** Internal EvidenceReviewWorkProduct exists; judge consumes it directly.  
**May evaluate:** explicit materialization refs.  
**Must not happen:** direct CourtRecord/JII/finding input.  
**Expected:** forbidden without valid procedure.

### Case 31 — Investigation leakage
**Input:** Review Task says “find all hidden bank accounts” and reads world state.  
**May evaluate:** invalid scope/Investigation boundary.  
**Must not happen:** hidden acquisition/discovery.  
**Expected:** invalid; separate Investigation required.

### Case 32 — Hidden clue counter
**Input:** UI says “1 critical clue remains somewhere in unreviewed documents.”  
**May evaluate:** explicit known source coverage only.  
**Must not happen:** hidden answer counter.  
**Expected:** forbidden unless legitimately source-derived without hidden truth.

## 15. False-PASS audit

Every proposed PASS must be supported by DEC-020 semantics, not by invented hidden source access, Investigation mechanics, extraction accuracy, review probabilities, relevance thresholds, contradiction algorithms, source reliability, procedural effects or UI assumptions. Exact mechanism NOT TESTED / TBD is not evidence of review correctness.

## 16. Explicit TBD / not closed

- canonical Evidence Review Task catalog and TaskDefinition schema
- source-type, extraction, OCR/text, entity/date/assertion vocabularies
- capability→component mappings and miss/error mechanics
- review-depth and triage vocabulary/effects
- contradiction/corroboration/relevance algorithms
- source reliability and duplicate detection
- synthesis/integration and completion semantics
- workload/time/capacity, NPC AI, player UI/minigame
- Investigation, source acquisition/discovery and witness discovery
- legal research, drafting, filing and CourtRecord admission details
- actual Korean legal doctrine/practice
- save/schema/API/Godot implementation
- performance/balancing

## 17. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Review becomes Investigation | Review spawns/acquires E99 | Unknown boundary collapses | Separate acquisition Task/DEC |
| Hidden truth scanner | Reviewer reports world-only clue | Player knowledge bypass | Authorized inputs only |
| Extraction always correct | Every parse is oracle | Errors/review lose meaning | Separate extraction/analysis; task-specific rules |
| Analysis stored as fact | “Likely”→confirmed on save | Truth laundering | Typed epistemic status/provenance |
| Contradiction becomes fact | Candidate edge proves conflict | Later context impossible | Candidate + challenge history |
| Corroboration vote | Repetition→truth | Count replaces evaluation | Preserve assertions separately |
| Hidden clue counter | UI counts undiscovered answers | Omniscient leak | Known gaps only |
| Quality score | `ReviewQuality=73` authority | Scope/gaps disappear | Structured WorkProduct |
| Hidden completion denominator | 68% of unknown truth | False precision | Explicit local coverage |
| Exceptional auto-detection | Elite reviewer finds all | Capability=omniscience | Missing/error allowed |
| Support staff as weak lawyer | Numeric level waives role | Role semantics collapse | Explicit eligibility |
| Delegated percentage engine | NPC uses hidden success % | Direct/delegated divergence | Same ontology |
| Source version ignored | v1 output applied to v2 | Replay corruption | Version-bound WorkProduct |
| Duplicate provenance deleted | Copies merged silently | Evidence origin lost | Possible-duplicate relation |
| Global relevance label | Irrelevant forever | Context lost | Scope-specific relevance |
| Parallel auto-synthesis | Branches merge to truth | Conflict hidden | Explicit synthesis Task |
| Excessive highlighting | Every sentence becomes required node | Clerical overload | Task-specific granularity |
| Node explosion | All OCR fragments become entities | Graph/UI cost | Bounded authoring rules TBD |
| Document-volume-only difficulty | More pages always harder | Ignores conflict/context | Structured demands |
| Clerical bottleneck | Player must manually maintain all links | Unplayable labor | Projections/assistance, mechanics TBD |

## 18. Player-facing design direction

Player는 다음을 볼 수 있어야 한다.

- 무엇이 reviewed/partially reviewed/unreviewed인지
- reviewer가 extracted한 assertions/entities/dates
- reviewer가 inferred한 links/contradiction/corroboration candidates
- limitations, risks, unresolved questions와 follow-up Tasks

Player에게 다음을 보여주지 않는다.

- hidden clue count 또는 undiscovered source list
- objective truth/correct interpretation badge
- guaranteed judge impact
- internal hidden state 또는 unsubmitted CourtRecord input

## 19. Solo → firm progression hook

```text
Solo
→ player directly reviews small source sets
Support staff
→ indexing/organization/permitted metadata work
Associates
→ delegated substantive review
Larger firm
→ parallel + specialist review + synthesis/review layers
Partner/player
→ prioritization, key-source review, synthesis and strategy
```

이는 supported architecture이며 mandatory progression tree가 아니다.

## 20. Proposed TEST-019 plan

실제 TEST 문서는 작성하지 않는다. 추천 파일: `TEST-019_EVIDENCE_REVIEW.md`. Manual/synthetic fixture-level verification으로 다음을 포함한다: basic review; assigned≠reviewed; unauthorized source; missing attachment; assertion/date/entity extraction; issue link; contradiction/corroboration non-truth; reviewer miss/misinterpretation; exceptional reviewer with missing source/time; extraction vs analysis; broad/deep/triage; direct/delegated; support role; source version; duplicate provenance; contextual relevance; parallel review; Case File update; CourtRecord/Investigation/hidden-clue attacks. 최소 32 core fixtures를 유지한다.

## 21. DEC-021 candidates

| Candidate | Rationale | Risk / dependency |
|---|---|---|
| Investigation & Evidence Acquisition | Review가 닫은 acquired-material boundary 다음 unresolved discovery/acquisition을 다룸 | Unknown unknown, authorization과 source provenance를 별도 설계해야 함 |
| Legal Research & Issue Analysis | Analysis/Issue graph를 구체화 | substantive legal content 필요 |
| Witness / Statement Interview & Preparation | Statement versions/conflicts를 구체화 | credibility/procedure와 경계 필요 |
| Evidence Review Synthesis / Case Theory | parallel WorkProducts 통합 | conflict resolution을 조기 확정할 위험 |
| Task Assignment / Workload / Team Coordination | firm-scale operations | concrete task data 의존 |

기본 추천은 **DEC-021 — Investigation & Evidence Acquisition**이다. DEC-020이 이미 acquired/authorized source review를 닫았으므로, 다음 unresolved boundary는 Case File을 합법적으로 확장하면서 ActualStateRecord와 unknown unknown을 누설하지 않는 acquisition/discovery다. 단 investigation을 Evidence Review와 결합할지, 별도 문서로 분리할지는 후속 review에서 결정한다.

## 22. Decision summary

### Inherited Accepted

| Boundary | Status |
|---|---|
| ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding | **Core Accepted** |
| Allowed CourtRecord only for fact evaluation | **Core Accepted** |
| WorkProduct/Case File does not directly change JII, ChoicePoint or finding | **Core Accepted** |
| Internal WorkProduct requires explicit procedural materialization | **Core Accepted** |

### Core Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| ER1–ER7, ER9, ER10–ER15, ER18, ER22–ER23, ER25–ER26, ER28, ER30–ER31 | Explicit bounded review, provenance, structured coverage, no hidden score, source/extraction/analysis separation, no truth/JII/CourtRecord bypass | **Core Accepted candidate** |

### Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| ER8, ER16–ER17, ER19–ER21, ER24, ER27, ER29 | Source extraction/review modes, fallible review, triage, duplicate/parallel/support-role interfaces | **Accepted candidate** |

### TBD

Canonical task/source/output taxonomy, extraction/OCR mechanics, capability mapping, error/reliability/confidence, correction workflow/status vocabulary, depth/triage/completion, duplicate/synthesis, investigation/acquisition, procedure, UI/schema/API/save/Godot and performance remain **TBD**. The semantic RecordedExtraction layer is accepted as a boundary; its frequency and correction mechanics remain TBD.

### Forbidden

- Review reads ActualStateRecord, world-only source, hidden clue or unallowed material.
- Evidence Review silently performs Investigation or creates unavailable evidence.
- SourceAssertion, extraction, analysis, contradiction/corroboration/relevance candidate or chronology becomes truth by storage/count/confidence/seniority.
- Universal review quality/completeness score, hidden weighted capability formula, global relevance flag or random review roll.
- Internal WorkProduct/Case File automatically enters CourtRecord or modifies JII/CourtFactFinding/outcome.
- Source version/provenance/history is erased or delegated review uses a separate hidden ontology.

## 23. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | ER1–ER30 define acquired-material Evidence Review boundary, structured coverage/output, extraction-analysis separation, fallible review, triage/deep/single/comparative modes, source-version/provenance/history, Case File update and explicit CourtRecord gate. Proposed 32-case TEST-019 plan; Investigation and task-specific mechanics remain TBD. |
| v0.2 | Accepted | Clarified three-layer separation: immutable SourceMaterial/source-contained content ≠ fallible provenance-bearing RecordedExtraction ≠ ProfessionalAnalysis. Mistaken extraction may propagate to analysis/strategy, cannot rewrite source, and correction/re-review preserves historical lineage. No other Evidence Review architecture changed. |
