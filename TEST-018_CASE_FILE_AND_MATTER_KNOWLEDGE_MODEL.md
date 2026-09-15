# THE FIRM — Case File and Matter Knowledge Model

문서 ID: TEST-018  
버전: v0.2 — Accepted / manual fixture-level verification  
상태: **Accepted / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md` v0.2 Accepted

## 1. Purpose / verification boundary

DEC-019의 `CaseFileState` epistemic model을 synthetic semantic fixtures에 수동 적용한다. 구현, 코드 실행, 실제 대한민국 법률·법조 관행의 정확성을 검증하지 않는다.

```text
ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding
source says X ≠ X is true
professional concludes Y ≠ Y is true
```

`Observed`는 코드 결과가 아니라 DEC semantics의 manual fixture application이다.

## 2. Verdict rules and inherited boundaries

PASS는 DEC-019 boundary가 fixture를 결정할 때, PARTIAL은 semantic boundary 자체가 불충분하거나 inherited DEC와 충돌할 때, FAIL은 실제 laundering/leak/bypass/history overwrite일 때 사용한다. UI, schema, database, vocabulary, confidence formula, investigation mechanics, NPC AI, save/Godot 구현이 TBD라는 이유만으로 PARTIAL을 주지 않는다.

- Case File은 firm-side epistemic state이며 ActualStateRecord, CourtRecord 또는 CourtFactFinding이 아니다.
- SourceMaterial, SourceAssertion, ObservableOrProceduralStatus, ProfessionalAnalysis, InferredRelation, Hypothesis, KnownGap은 서로 다른 semantic families다.
- Analysis/inference/hypothesis는 틀릴 수 있고 저장만으로 truth가 되지 않는다.
- Unknown unknown은 발견 전 구체 node/count로 노출하지 않는다.
- WorkProduct/Case File→CourtRecord에는 explicit valid procedural materialization이 필요하다.
- Task는 authorized Case File snapshot/available sources만 읽는다.
- Case File content는 ChoicePoint, JII, finding 또는 final outcome을 직접 변경하지 않는다.

## 3. Core test cases

각 case는 synthetic manual fixture이며, `Observed`는 수동 적용 결과다.

### Case 1 — Source ≠ truth
**Purpose** Source와 claim을 분리한다.  
**Fixture** Email E1 exists and contains claim X.  
**Manual verification** E1을 SourceMaterial, “E1 claims X”를 SourceAssertion으로 기록한다.  
**Expected** X는 objective truth가 아니다.  
**Observed** 두 provenance가 분리됐다.  
**Verdict** **PASS**  
**Boundary note** 내용의 진실성은 NOT TESTED.

### Case 2 — Witness assertion ≠ truth
**Purpose** Witness와 statement를 분리한다.  
**Fixture** W1 says A in S1.  
**Manual verification** W1, S1, speaker/context/time을 별도 기록한다.  
**Expected** A 및 W1의 global truth status 자동 생성 없음.  
**Observed** assertion만 생성됐다.  
**Verdict** **PASS**  
**Boundary note** credibility rule은 TBD.

### Case 3 — Corroborating assertions
**Purpose** 반복 주장이 truth가 아님을 확인한다.  
**Fixture** W1과 W2가 독립적으로 A를 말한다.  
**Manual verification** 두 assertion과 corroboration candidate를 연결하되 vote를 적용하지 않는다.  
**Expected** 2 votes→A true 금지.  
**Observed** 두 assertion이 공존했다.  
**Verdict** **PASS**  
**Boundary note** corroboration 평가 자체는 TBD.

### Case 4 — Conflicting assertions
**Purpose** 충돌 지식의 공존을 확인한다.  
**Fixture** W1 says A; W2 says not-A.  
**Manual verification** conflict relation/status를 남기고 winner 선택을 시도한다.  
**Expected** 자동 winner 없음.  
**Observed** both coexist unresolved.  
**Verdict** **PASS**  
**Boundary note** future conflict workflow는 TBD.

### Case 5 — Professional analysis
**Purpose** Lawyer analysis의 provenance를 확인한다.  
**Fixture** L1: E12 appears inconsistent with W03/S1.  
**Manual verification** analyst, source, Task/WorkProduct, time/version, uncertainty를 연결한다.  
**Expected** analysis/inference이지 confirmed contradiction이 아니다.  
**Observed** 별도 분석 object로 기록됐다.  
**Verdict** **PASS**  
**Boundary note** 정확성은 NOT TESTED.

### Case 6 — Wrong analysis
**Purpose** 이후 반증에도 원래 분석을 보존한다.  
**Fixture** Later source shows E12 and W03 may both be true.  
**Manual verification** old/new analysis lineage를 기록한다.  
**Expected** old retained; challenge/refine/supersede 가능; 삭제 없음.  
**Observed** history와 current projection을 분리했다.  
**Verdict** **PASS**  
**Boundary note** exact status vocabulary TBD.

### Case 7 — Player wrong hypothesis
**Purpose** Player mistake가 정상 state인지 확인한다.  
**Fixture** Player hypothesizes fraud; later source undermines it.  
**Manual verification** hypothesis와 contrary source의 provenance/history를 보존한다.  
**Expected** hypothesis는 evidence/truth가 아니다.  
**Observed** working theory로 남았다.  
**Verdict** **PASS**  
**Boundary note** hypothesis-driven task rule TBD.

### Case 8 — WorkProduct truth laundering
**Purpose** WorkProduct status escalation을 차단한다.  
**Fixture** WP says “likely contradiction”; attack stores “confirmed contradiction”.  
**Manual verification** source/status/uncertainty 없이 escalation되는지 검사한다.  
**Expected** invalid/forbidden.  
**Observed** storage만으로 confirmed fact가 될 수 없었다.  
**Verdict** **PASS**  
**Boundary note** canonical statuses TBD.

### Case 9 — Case File → CourtRecord laundering
**Purpose** Internal inference의 직접 judicial input을 차단한다.  
**Fixture** Internal inference exists; judge consumes it directly.  
**Manual verification** explicit filing/submission/reception/allowance ref를 찾는다.  
**Expected** materialization 없이는 forbidden.  
**Observed** CourtRecord/JII에 도달하지 않았다.  
**Verdict** **PASS**  
**Boundary note** procedure details NOT TESTED.

### Case 10 — Known unknown
**Purpose** Known gap을 bounded하게 표현한다.  
**Fixture** 10 acquired documents are unreviewed.  
**Manual verification** KnownGap와 acquired-source boundary를 기록한다.  
**Expected** gap valid; contents leak 없음.  
**Observed** “10 unreviewed”만 표시됐다.  
**Verdict** **PASS**  
**Boundary note** priority rule TBD.

### Case 11 — Unknown unknown
**Purpose** undiscovered world entity leakage를 검사한다.  
**Fixture** Undiscovered witness exists only in world state.  
**Manual verification** legitimate discovery 전 node/UI를 확인한다.  
**Expected** concrete Case File node 없음.  
**Observed** hidden witness가 노출되지 않았다.  
**Verdict** **PASS**  
**Boundary note** discovery mechanics TBD.

### Case 12 — Hidden clue counter
**Purpose** omniscient clue count를 거부한다.  
**Fixture** UI displays “2 important clues remain undiscovered”.  
**Manual verification** known bounded source에서 유도됐는지 확인한다.  
**Expected** hidden denominator count는 invalid.  
**Observed** DEC-019만으로 정당화되지 않았다.  
**Verdict** **PASS**  
**Boundary note** UI projection TBD.

### Case 13 — Issue linkage
**Purpose** relation과 proof를 분리한다.  
**Fixture** E14 appears relevant to Issue I2.  
**Manual verification** provenance-bearing support/relevance relation을 만든다.  
**Expected** I2 proven 아님.  
**Observed** issue link만 갱신됐다.  
**Verdict** **PASS**  
**Boundary note** issue resolution TBD.

### Case 14 — Disputed chronology
**Purpose** temporal claims conflict를 보존한다.  
**Fixture** W1 says March 3; document suggests March 5.  
**Manual verification** 두 claims와 dispute status를 기록한다.  
**Expected** silent single date 없음.  
**Observed** both claims retained.  
**Verdict** **PASS**  
**Boundary note** chronology taxonomy TBD.

### Case 15 — Reconstructed chronology
**Purpose** reconstruction과 objective event를 분리한다.  
**Fixture** Lawyer reconstruction chooses March 4.  
**Manual verification** basis/analyst/time을 연결한다.  
**Expected** professional reconstruction only.  
**Observed** March 4가 analysis로 남았다.  
**Verdict** **PASS**  
**Boundary note** temporal resolution TBD.

### Case 16 — Multiple statements by one witness
**Purpose** witness/statement versions를 분리한다.  
**Fixture** W3 gives S1 then S2.  
**Manual verification** W3→S1/S2와 각 context를 기록한다.  
**Expected** timeless blob merge 없음.  
**Observed** 두 statement가 보존됐다.  
**Verdict** **PASS**  
**Boundary note** comparison rules TBD.

### Case 17 — Statement correction
**Purpose** correction이 history를 지우지 않음을 확인한다.  
**Fixture** W3 corrects S1 through S2.  
**Manual verification** correction/supersession relation을 기록한다.  
**Expected** S1 historical 유지.  
**Observed** S1과 S2가 함께 남았다.  
**Verdict** **PASS**  
**Boundary note** exact correction semantics TBD.

### Case 18 — Professional analysis revision
**Purpose** review lineage를 확인한다.  
**Fixture** PA-v1 reviewed into PA-v2.  
**Manual verification** Review Task, reviewer, source, v1→v2를 연결한다.  
**Expected** v1 retained; no overwrite.  
**Observed** lineage가 추적됐다.  
**Verdict** **PASS**  
**Boundary note** revision granularity TBD.

### Case 19 — Conflicting lawyers
**Purpose** competing analyses 공존을 확인한다.  
**Fixture** A: E1 supports X; B: E1 neutral.  
**Manual verification** analyst/task/source refs를 비교한다.  
**Expected** seniority/capability/recency/confidence alone으로 resolve하지 않는다.  
**Observed** 두 분석이 공존했다.  
**Verdict** **PASS**  
**Boundary note** review authority TBD.

### Case 20 — Senior review
**Purpose** seniority가 truth authority가 아님을 확인한다.  
**Fixture** Partner challenges junior analysis.  
**Manual verification** review/challenge relation과 junior history를 남긴다.  
**Expected** “partner said it→true” 금지.  
**Observed** challenge만 추가됐다.  
**Verdict** **PASS**  
**Boundary note** review effectiveness TBD.

### Case 21 — Delegated analysis
**Purpose** delegated/player ontology 동일성을 확인한다.  
**Fixture** Associate Task generates issue link.  
**Manual verification** same analysis/relation shape와 authorized inputs를 확인한다.  
**Expected** omniscient NPC data 없음.  
**Observed** 같은 provenance-bearing type으로 기록됐다.  
**Verdict** **PASS**  
**Boundary note** NPC algorithm TBD.

### Case 22 — Source acquisition
**Purpose** acquisition provenance와 temporal knowledge를 확인한다.  
**Fixture** Previously unavailable D7 legitimately obtained.  
**Manual verification** acquisition source, learned time, effective time과 earlier snapshot을 비교한다.  
**Expected** T2에 확장; T1에 소급 출현 없음.  
**Observed** snapshot history가 유지됐다.  
**Verdict** **PASS**  
**Boundary note** acquisition mechanics TBD.

### Case 23 — ActualStateRecord access attack
**Purpose** hidden-state read를 차단한다.  
**Fixture** Task reads ActualStateRecord to locate clue.  
**Manual verification** authorized snapshot과 attempted hidden ref를 비교한다.  
**Expected** forbidden.  
**Observed** hidden ref는 허용되지 않았다.  
**Verdict** **PASS**  
**Boundary note** authorization implementation TBD.

### Case 24 — Hypothesis creates Task
**Purpose** hypothesis가 planning input일 수 있음을 확인한다.  
**Fixture** H1 suggests interviewing W3.  
**Manual verification** H1→Task origin/priority를 기록한다.  
**Expected** Task candidate valid; H1 remains hypothesis.  
**Observed** task link만 생성됐다.  
**Verdict** **PASS**  
**Boundary note** auto-generation TBD.

### Case 25 — Known gap creates Task
**Purpose** known gap과 acquisition task를 연결한다.  
**Fixture** U1 requested record not obtained.  
**Manual verification** U1→document-request Task provenance를 기록한다.  
**Expected** Task가 record를 생성하지 않는다.  
**Observed** 실제 acquisition 전 source node는 없었다.  
**Verdict** **PASS**  
**Boundary note** request workflow TBD.

### Case 26 — Case understanding percentage attack
**Purpose** canonical completeness percentage를 거부한다.  
**Fixture** `Case Understanding = 82%`.  
**Manual verification** local reviewed/unreviewed data와 hidden denominator를 구분한다.  
**Expected** canonical authority로 invalid.  
**Observed** structured gaps 없이 82%를 해석할 수 없었다.  
**Verdict** **PASS**  
**Boundary note** optional UI summary TBD.

### Case 27 — UI folder relocation
**Purpose** folder가 projection임을 확인한다.  
**Fixture** E12 moves from Evidence tab to Important tab.  
**Manual verification** type/status/relations/provenance before/after를 비교한다.  
**Expected** semantic/legal change 없음.  
**Observed** grouping만 변했다.  
**Verdict** **PASS**  
**Boundary note** UI implementation TBD.

### Case 28 — Procedural materialization
**Purpose** explicit procedure gate를 확인한다.  
**Fixture** PA-1 informs D-1; D-1 filed→received→allowed.  
**Manual verification** PA-1, draft, materialization ref와 allowed artifact를 분리한다.  
**Expected** allowed content만 CourtRecord에 진입.  
**Observed** PA-1 자체는 자동 진입하지 않았다.  
**Verdict** **PASS**  
**Boundary note** filing/admission details TBD.

### Case 29 — ObservableOrProceduralStatus truth-laundering attack
**Purpose** recorded status가 world-truth oracle가 아님을 확인한다.  
**Fixture** E-90 records access at 09:00; attack rewrites it as employee physically arrived at 09:00.  
**Manual verification** recording event와 physical-arrival proposition 및 independent equivalence rule을 분리한다.  
**Expected** invalid/truth laundering; `recorded X ≠ X perfectly reflects reality`.  
**Observed** observation/provenance만 남고 objective arrival은 자동 생성되지 않았다.  
**Verdict** **PASS**  
**Boundary note** observable-status taxonomy/equivalence rules TBD.

## 4. Additional attack tests

| Attack | Expected |
|---|---|
| Source/assertion/majority/seniority/capability/confidence → truth | **Forbidden** |
| Stored graph edge → objective relation | **Forbidden** |
| Reconstructed date → ActualState date | **Forbidden** |
| Hypothesis → evidence | **Forbidden** |
| Hidden Witness/clue counter before discovery | **Forbidden** |
| Review/new WorkProduct deletes history | **Forbidden** |
| Player/NPC reads hidden world state | **Forbidden** |
| Automatic conflict resolution | **Forbidden** |
| CaseStrength/overall knowledge score replaces structure | **Invalid** |
| Case File directly feeds judge | **Forbidden** |

## 5. Semantic-family pressure test

하나의 synthetic matter에 SourceMaterial, SourceAssertion, ObservableOrProceduralStatus, ProfessionalAnalysis, InferredRelation, Hypothesis, KnownGap, Issue, TimelineEntry, Witness, Statement, Task, WorkProduct를 함께 둔다. 각 family의 origin/status/source/author/time/version/history를 분리한다.

**Expected / Observed:** material≠assertion, assertion≠analysis, analysis≠relation, relation≠objective relation, hypothesis≠evidence, gap≠hidden node, witness≠statement, timeline≠objective event, WorkProduct≠CourtRecord, ObservableStatus≠truth oracle가 모두 유지된다. **Verdict: PASS.** Exact taxonomy/schema는 NOT TESTED / TBD.

## 6. Wrong-analysis pressure test

```text
T1 PA-10: E12 contradicts W03
T2 Review WP-20: E12 and W03 may be compatible
T3 Senior PA-11: earlier theory is weak
```

PA-10은 historical로 남고 PA-11은 seniority 때문에 true가 되지 않으며 current projection은 PA-10을 challenged/superseded로 표시할 수 있다. T1 strategy는 PA-10을 참조한다. **Verdict: PASS.**

## 7. Known/unknown pressure test

Acquired 50, reviewed 35, unreviewed 15; world-only W9/R4가 존재한다. Case File은 15개 known gap을 표시할 수 있지만 W9/R4/decisive clue는 discovery 전 표시하지 않는다. **Verdict: PASS.**

## 8. Conflict pressure test

A1:X, A2:not-X, PA1:A1 stronger, PA2:A2 stronger, H1:X, H2:not-X를 함께 둔다. Count, confidence alone, seniority, capability, latest timestamp 또는 UI order로 winner를 고르지 않는다. **Verdict: PASS.** Exact workflow는 TBD.

## 9. Observable status pressure test

`filing received at 14:03`은 procedural observation, `access system recorded swipe at 09:00`은 recording event, `investigator reports seeing vehicle`은 source/assertion/observation으로 남는다. 어느 것도 independent rule 없이 world truth가 아니다. **Verdict: PASS.**

## 10. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Case File = firm-side epistemic state | 1–8,19,21 | PASS | Not truth |
| Case File ≠ ActualStateRecord | 11,23,29 | PASS | Hidden state blocked |
| Case File ≠ CourtRecord | 9,28 | PASS | Procedure gate |
| Case File ≠ CourtFactFinding | 8,13,29 | PASS | No direct finding |
| Graph semantics / UI projection | 13,27 | PASS | Folder non-authority |
| SourceMaterial ≠ SourceAssertion | 1,2, semantic-family | PASS | Provenance split |
| Assertion ≠ truth | 1–4,14 | PASS | No vote |
| ProfessionalAnalysis separate | 5,18–20 | PASS | Distinct object |
| Analysis may be wrong | 6,7,19, wrong-analysis | PASS | Fallible history |
| InferredRelation requires provenance | 5,8,13 | PASS | Source/analyst refs |
| Inference ≠ truth | 5,8,9,13 | PASS | Edge not fact |
| Hypothesis ≠ evidence | 7,24 | PASS | Planning only |
| KnownGap permitted | 10,25 | PASS | Bounded gap |
| Unknown unknown not exposed | 11,12 | PASS | No answer leak |
| New knowledge has provenance | 1,5,17,18,22 | PASS | Origin/time refs |
| Historical state preserved | 6,17,18,22 | PASS | No overwrite |
| Conflicts coexist | 4,19,20, conflict | PASS | No auto winner |
| No automatic truth resolution | 3,4,8,19, attacks | PASS | No vote/seniority |
| Confidence ≠ truth | 12,26, attacks | PASS | No hidden denominator |
| Issue link ≠ proof | 13,24 | PASS | Relation only |
| Chronology ≠ objective event | 14,15, attacks | PASS | Reconstruction marked |
| Witness ≠ Statement | 2,16,17 | PASS | Multiple versions |
| WorkProduct updates knowledge, not truth | 5,8,23,28,29 | PASS | Case File only |
| Direct/delegated same ontology | 21, semantic-family | PASS | No NPC omniscience |
| Player-created analysis may be wrong | 7,21 | PASS | Fallibility |
| NPC-created analysis may be wrong | 6,21 | PASS | Same ontology |
| Authorized Task read | 11,23 | PASS | No ActualStateRecord |
| Explicit CourtRecord materialization | 9,28 | PASS | Existing procedure |
| No direct JII/finding effect | 9,13,24,28,29 | PASS | Inherited |
| ObservableStatus ≠ world-truth oracle | 29,9 | PASS | Recording ≠ reality |

## 11. Contradiction review

DEC-019 내부 contradiction 없음. DEC-018 WorkProduct/Case File update는 truth promotion이 아니며, DEC-017 capability는 correctness/omniscience를 보장하지 않는다. DEC-016 provenance/disclosure, DEC-015 history/version, DEC-014 ChoicePoint, DEC-013 JII/finding boundaries를 침범하지 않았다. Source/assertion, analysis/truth, inference/objective relation, hypothesis/evidence, KnownGap/unknown unknown, ObservableStatus/world truth collapse가 없다. UI folder, majority, seniority, confidence, hidden clue counter, NPC/player omniscience, CourtRecord bypass도 없다. Tester가 evidence/investigation/confidence/procedural rule을 발명하지 않았다.

## 12. False-PASS audit

각 PASS는 DEC-019의 category separation, provenance, history, authorization과 inherited CourtRecord/JII boundary만 적용했다. Hidden ActualStateRecord, invented reliability threshold, majority vote, seniority authority, task algorithm, UI assumption으로 결과를 강제하지 않았다.

## 13. False-PARTIAL audit

29개 core case에서 semantic ambiguity 때문에 결과를 확정할 수 없는 사례는 없다. Exact taxonomy/schema/UI/save/database/confidence formula/conflict workflow/NPC AI가 TBD인 것은 범위 밖이며 PARTIAL 사유가 아니다. 따라서 semantic boundary가 명확한 모든 case를 PASS로 판정했다.

## 14. Remaining TBD / NOT TESTED

- exact epistemic/node/relation/status taxonomy, directionality/cardinality
- confidence/uncertainty vocabulary and calculation
- graph/database/storage and all UI projections
- task auto-generation, investigation/evidence discovery/acquisition
- witness interview, legal research, issue-analysis correctness and source reliability
- NPC reasoning and player mechanics
- CourtRecord filing/admission details and actual Korean doctrine
- document generation, save/API/schema/migration, Godot implementation
- performance, balancing and graph scaling

## 15. Final verification summary

```text
Total core cases: 29
PASS: 29
PARTIAL: 0
FAIL: 0
```

- DEC-019 reopen required: **No**; no internal contradiction.
- Inherited boundary violation: **None**.
- Truth laundering / hidden-state leakage: **None accepted**; attacks were rejected.
- ObservableStatus truth-laundering: **Rejected in Case 29**.
- History overwrite: **None**.
- Case File→CourtRecord bypass: **None**.
- Issue blocking DEC-019 Accepted promotion: **No semantic issue**; design review remains required and TEST does not change status.
- Issue blocking next DEC: **None**; Evidence Review is a suitable next focused DEC.

## 16. Promotion recommendation

```text
DEC-019 v0.2 — Accepted
TEST-018 v0.2 — Accepted / manual fixture-level verification
```

Recommendation is conditional on design review; TEST does not automatically change status.

## 17. Next DEC recommendation

1. `DEC-020 — Evidence Review`: acquired/authorized material → review Task → assertions/analysis/relations/gaps/WorkProduct.
2. `Investigation`: separate unknown-unknown acquisition/discovery boundary.
3. Combined model: possible but risks mixing review and discovery authorization.

Default recommendation is **Evidence Review first**, with Investigation following as a separate DEC unless later review establishes a safe combined scope.

## Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | 29 core fixtures, additional attacks, semantic-family/wrong-analysis/known-unknown/conflict/observable-status pressure tests, invariant matrix, contradiction and false-PASS/PARTIAL audits 작성 |
| v0.2 | Accepted / manual fixture-level verification | Existing 29 PASS / 0 PARTIAL / 0 FAIL result를 design review에서 승인하고 DEC-019 v0.2 Accepted와 정렬했다. |
