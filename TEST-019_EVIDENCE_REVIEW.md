# THE FIRM — Evidence Review

문서 ID: TEST-019  
버전: v0.2 — Accepted / manual fixture-level verification  
상태: **Accepted / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted

## 1. Purpose / verification boundary

DEC-020의 Evidence Review semantics를 synthetic fixtures에 수동 적용한다.

```text
acquired/authorized SourceMaterial
→ bounded EvidenceReviewTask
→ structured EvidenceReviewWorkProduct
→ provenance-bearing Case File update
```

```text
assigned ≠ reviewed ≠ correctly understood
Extraction ≠ Analysis
Evidence Review ≠ Investigation
candidate ≠ objective truth
```

`Observed`는 코드 실행 결과가 아니라 DEC semantics의 manual fixture application이다. 실제 한국 법률·법조 관행, 구현, UI, schema/database, NPC AI, Investigation 또는 save/Godot를 검증하지 않는다.

## 2. Verdict rules

**PASS**는 DEC-020 semantic boundary가 fixture 결과를 결정하는 경우, **PARTIAL**은 semantic boundary 자체가 불충분하거나 inherited boundary와 해석이 충돌하는 경우, **FAIL**은 실제 hidden-state access, Investigation leakage, truth laundering, CourtRecord bypass, provenance/history overwrite 또는 semantic contradiction이 발생하는 경우다. 구현·taxonomy·알고리즘이 TBD라는 이유만으로 PARTIAL을 부여하지 않는다.

Inherited hard boundaries: `ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`; SourceAssertion/analysis/candidate는 truth가 아니며; Review는 unavailable source를 만들지 않고; WorkProduct/Case File은 explicit valid procedure 없이 CourtRecord/JII/finding을 변경하지 않는다.

## 3. Core test cases

각 case는 synthetic fixture이며 `Observed`는 수동 적용 결과다.

### Case 1 — Basic document review
**Purpose** authorized material review의 기본 단위를 확인한다.  
**Fixture** Five authorized documents; reviewer inspects all five.  
**Manual verification** reviewed scope, extracted outputs, provenance를 별도로 기록한다.  
**Expected** structured WorkProduct; hidden score/truth promotion 없음.  
**Observed** 다섯 source와 review outputs가 provenance와 함께 분리됐다.  
**Verdict** **PASS**  
**Boundary note** review 정확도/알고리즘은 NOT TESTED / TBD.

### Case 2 — Assigned ≠ reviewed
**Purpose** assignment와 실제 review를 분리한다.  
**Fixture** Authorized E01–E05; actually reviewed E01–E03.  
**Manual verification** assigned 5, reviewed 3, unreviewed 2를 기록한다.  
**Expected** E04/E05 understood/completed로 표시하지 않는다.  
**Observed** 세 범위가 분리됐다.  
**Verdict** **PASS**  
**Boundary note** completion vocabulary는 TBD.

### Case 3 — Unauthorized source
**Purpose** acquired/authorized gate를 확인한다.  
**Fixture** World contains E99; Task authorizes E01–E05.  
**Manual verification** output에 E99 ref가 있는지 검사한다.  
**Expected** E99 inaccessible/absent.  
**Observed** authorized inputs만 review되었다.  
**Verdict** **PASS**  
**Boundary note** authorization implementation TBD.

### Case 4 — Missing attachment
**Purpose** gap과 hidden content를 분리한다.  
**Fixture** E20 says “See attached spreadsheet”; attachment not acquired.  
**Manual verification** KnownGap와 source provenance를 기록한다.  
**Expected** unavailable attachment gap; content/fraud inference 없음.  
**Observed** gap만 생성됐다.  
**Verdict** **PASS**  
**Boundary note** acquisition mechanics TBD.

### Case 5 — Source assertion extraction
**Purpose** extraction이 truth가 아님을 확인한다.  
**Fixture** Email states X.  
**Manual verification** “email states X” SourceAssertion을 만든다.  
**Expected** X is true로 승격하지 않는다.  
**Observed** assertion과 source가 분리됐다.  
**Verdict** **PASS**  
**Boundary note** source reliability TBD.

### Case 6 — Temporal extraction
**Purpose** date mention과 objective event를 분리한다.  
**Fixture** Source mentions March 14.  
**Manual verification** temporal reference/chronology candidate로 기록한다.  
**Expected** objective event date 아님.  
**Observed** source-reported temporal reference로 남았다.  
**Verdict** **PASS**  
**Boundary note** chronology taxonomy TBD.

### Case 7 — Entity extraction
**Purpose** entity mention의 범위를 확인한다.  
**Fixture** Document mentions Person P.  
**Manual verification** person/entity reference candidate를 별도 기록한다.  
**Expected** verified role, involvement, liability, truth 자동 생성 없음.  
**Observed** mention만 보존됐다.  
**Verdict** **PASS**  
**Boundary note** entity resolution TBD.

### Case 8 — Issue relevance
**Purpose** relevance link와 proof를 분리한다.  
**Fixture** Reviewer links E1 to Issue I1.  
**Manual verification** analyst/source/task provenance를 연결한다.  
**Expected** I1 proven 아님.  
**Observed** support/relevance candidate만 생성됐다.  
**Verdict** **PASS**  
**Boundary note** relevance algorithm TBD.

### Case 9 — Contradiction candidate
**Purpose** apparent inconsistency가 objective contradiction이 아님을 확인한다.  
**Fixture** E1 and S1 appear inconsistent.  
**Manual verification** ProfessionalAnalysis/InferredRelation으로 기록한다.  
**Expected** “appears inconsistent”; confirmed contradiction 아님.  
**Observed** candidate status가 유지됐다.  
**Verdict** **PASS**  
**Boundary note** contradiction algorithm TBD.

### Case 10 — False contradiction
**Purpose** later context가 old analysis를 삭제하지 않음을 확인한다.  
**Fixture** Later authorized context makes E1/S1 compatible.  
**Manual verification** old candidate와 challenge/refinement lineage를 확인한다.  
**Expected** old historical retained; no rewrite.  
**Observed** current projection과 history를 분리했다.  
**Verdict** **PASS**  
**Boundary note** status vocabulary TBD.

### Case 11 — Corroboration candidate
**Purpose** consistency와 truth를 분리한다.  
**Fixture** Two authorized sources appear consistent on P.  
**Manual verification** corroboration candidate와 두 assertions를 보존한다.  
**Expected** P truth promotion 없음.  
**Observed** candidate relation만 생성됐다.  
**Verdict** **PASS**  
**Boundary note** corroboration rule TBD.

### Case 12 — Majority corroboration attack
**Purpose** count가 truth rule이 아님을 확인한다.  
**Fixture** Five independent sources state X.  
**Manual verification** five provenance-bearing assertions를 비교한다.  
**Expected** 5 votes→X true 금지.  
**Observed** count가 objective truth를 만들지 않았다.  
**Verdict** **PASS**  
**Boundary note** adjudication은 범위 밖.

### Case 13 — Reviewer misses subtle content
**Purpose** review가 omniscient하지 않음을 확인한다.  
**Fixture** Task-specific fixture permits one subtle reference to go unidentified.  
**Manual verification** incomplete output을 허용하되 probability를 만들지 않는다.  
**Expected** miss/incomplete review 가능.  
**Observed** missed component를 기록할 수 있었다.  
**Verdict** **PASS**  
**Boundary note** miss probability NOT TESTED / TBD.

### Case 14 — Exceptional reviewer / missing source
**Purpose** capability가 source를 만들지 않음을 확인한다.  
**Fixture** Exceptional reviewer lacks E20.  
**Manual verification** available source 목록과 output refs를 비교한다.  
**Expected** E20 unavailable; no fabricated content.  
**Observed** gap/limitation만 남았다.  
**Verdict** **PASS**  
**Boundary note** Investigation은 별도.

### Case 15 — Exceptional reviewer / limited time
**Purpose** capability와 time을 분리한다.  
**Fixture** Exceptional reviewer, 50-source scope, severe time constraint.  
**Manual verification** profile은 유지하고 reviewed/unreviewed scope를 기록한다.  
**Expected** constrained coverage 가능; profile downgrade/percentage penalty 없음.  
**Observed** capability와 output limitation이 분리됐다.  
**Verdict** **PASS**  
**Boundary note** workload formula TBD.

### Case 16 — Extraction vs interpretation
**Purpose** literal assertion과 interpretation을 분리한다.  
**Fixture** Source: “Payment was approved May 4.” Reviewer: “Approval preceded committee review.”  
**Manual verification** source assertion과 professional analysis를 별도 object로 둔다.  
**Expected** two layers remain separate.  
**Observed** inference가 assertion을 덮어쓰지 않았다.  
**Verdict** **PASS**  
**Boundary note** extraction/analysis exact boundary per task는 TBD.

### Case 17 — Wrong interpretation
**Purpose** later evidence가 old interpretation을 지우지 않음을 확인한다.  
**Fixture** Later source undermines Case 16 interpretation.  
**Manual verification** challenge/refine/supersede lineage를 기록한다.  
**Expected** original historical retained.  
**Observed** current view가 바뀌어도 old provenance는 남았다.  
**Verdict** **PASS**  
**Boundary note** correction workflow TBD.

### Case 18 — Broad vs focused review
**Purpose** direction이 scope/components를 제한함을 확인한다.  
**Fixture** Same authorized source set; Task A broad, Task B focused on I3.  
**Manual verification** source universe와 output scope를 비교한다.  
**Expected** differences are explicit direction, not hidden access.  
**Observed** 두 WorkProduct의 focus가 구분됐다.  
**Verdict** **PASS**  
**Boundary note** depth vocabulary TBD.

### Case 19 — Triage review
**Purpose** triage가 bounded review임을 확인한다.  
**Fixture** 100 acquired sources; quick triage.  
**Manual verification** priority/relevance/gap/deeper-review candidates를 기록한다.  
**Expected** no full extraction/exhaustive review/hidden decisive clue.  
**Observed** triage output은 candidates와 follow-up에 한정됐다.  
**Verdict** **PASS**  
**Boundary note** triage algorithm TBD.

### Case 20 — Deep review
**Purpose** deep review가 universal accuracy bonus가 아님을 확인한다.  
**Fixture** Small subset with explicit deeper time/scope/direction.  
**Manual verification** requested components를 scope/time과 함께 기록한다.  
**Expected** `deep = +20% accuracy` 없음.  
**Observed** depth가 task direction으로만 작동했다.  
**Verdict** **PASS**  
**Boundary note** exact effect TBD.

### Case 21 — Direct player review
**Purpose** player path의 ontology를 확인한다.  
**Fixture** Player flags E1↔S1 contradiction candidate.  
**Manual verification** player analysis provenance를 Case File에 기록한다.  
**Expected** delegated work와 같은 analysis/relation types.  
**Observed** truth shortcut 없이 동일 ontology를 사용했다.  
**Verdict** **PASS**  
**Boundary note** player UI TBD.

### Case 22 — Delegated associate review
**Purpose** delegated path의 semantics를 확인한다.  
**Fixture** Associate performs equivalent Evidence Review Task.  
**Manual verification** coverage/assertions/analysis/gaps/provenance shape를 비교한다.  
**Expected** hidden percentage engine 없음.  
**Observed** execution source만 다르고 ontology는 같았다.  
**Verdict** **PASS**  
**Boundary note** NPC AI TBD.

### Case 23 — Support-role allowed Task
**Purpose** permitted support role을 확인한다.  
**Fixture** Indexing/metadata/source organization Task permits support staff.  
**Manual verification** TaskDefinition role gate를 확인한다.  
**Expected** valid if declared; support staff ≠ weak lawyer.  
**Observed** role-distinct assignment가 유효했다.  
**Verdict** **PASS**  
**Boundary note** real-world role law NOT TESTED.

### Case 24 — Support-role invalid interpretive Task
**Purpose** role requirement waiver를 막는다.  
**Fixture** Lawyer-required legal evidence analysis assigned to support staff.  
**Manual verification** role mismatch를 capability와 독립적으로 확인한다.  
**Expected** invalid assignment.  
**Observed** experience magnitude가 requirement를 완화하지 않았다.  
**Verdict** **PASS**  
**Boundary note** exact error state TBD.

### Case 25 — Source version update
**Purpose** source-version history를 보존한다.  
**Fixture** E10 v1 reviewed at T1; E10 v2 acquired at T2.  
**Manual verification** old WP source refs와 new review candidate를 비교한다.  
**Expected** v1 output/status가 v2에 자동 적용되지 않는다.  
**Observed** old WorkProduct가 v1에 묶였다.  
**Verdict** **PASS**  
**Boundary note** delta-review policy TBD.

### Case 26 — Duplicate sources
**Purpose** duplicate detection과 provenance를 분리한다.  
**Fixture** E1/E2 appear forwarded/duplicate copies.  
**Manual verification** possible-duplicate relation을 제안하되 두 origins를 보존한다.  
**Expected** provenance deletion 없음.  
**Observed** 두 source history가 유지됐다.  
**Verdict** **PASS**  
**Boundary note** dedup algorithm TBD.

### Case 27 — Contextual relevance
**Purpose** relevance가 issue/context-bound임을 확인한다.  
**Fixture** E1 irrelevant to I1 but potentially relevant to I3.  
**Manual verification** scope-specific relations를 비교한다.  
**Expected** global irrelevant label 없음.  
**Observed** I1/I3 context가 분리됐다.  
**Verdict** **PASS**  
**Boundary note** relevance taxonomy TBD.

### Case 28 — Parallel review
**Purpose** parallel WorkProducts의 독립성을 확인한다.  
**Fixture** A reviews E01–E50; B reviews E51–E100.  
**Manual verification** separate outputs와 future CrossReview/Synthesis Task ref를 기록한다.  
**Expected** auto-perfect merge/authoritative interpretation 없음.  
**Observed** branches가 별도 보존됐다.  
**Verdict** **PASS**  
**Boundary note** synthesis algorithm TBD.

### Case 29 — Case File update
**Purpose** review output의 허용 write boundary를 확인한다.  
**Fixture** WP creates SourceAssertion A1, contradiction candidate CR1, KnownGap U1.  
**Manual verification** provenance/status와 ActualState/CourtRecord refs를 비교한다.  
**Expected** Case File knowledge update only.  
**Observed** three updates가 truth/CourtRecord로 승격되지 않았다.  
**Verdict** **PASS**  
**Boundary note** Case File taxonomy TBD.

### Case 30 — CourtRecord attack
**Purpose** internal WP의 direct judicial consumption을 차단한다.  
**Fixture** Internal EvidenceReviewWorkProduct exists; judge consumes it directly.  
**Manual verification** explicit valid materialization 여부를 확인한다.  
**Expected** forbidden without procedure.  
**Observed** direct CourtRecord/JII/finding path가 없었다.  
**Verdict** **PASS**  
**Boundary note** admission details NOT TESTED.

### Case 31 — Investigation leakage
**Purpose** Review/Investigation separation을 확인한다.  
**Fixture** Review asks “Find all hidden bank accounts” and reads world state.  
**Manual verification** task scope와 attempted hidden source를 비교한다.  
**Expected** invalid Evidence Review scope.  
**Observed** acquisition/discovery는 separate Investigation boundary로 차단됐다.  
**Verdict** **PASS**  
**Boundary note** Investigation mechanics TBD.

### Case 32 — Hidden clue counter
**Purpose** hidden answer leakage를 검사한다.  
**Fixture** UI says one critical clue remains in unreviewed documents.  
**Manual verification** known bounded source count와 hidden content assertion을 구분한다.  
**Expected** hidden clue counter forbidden.  
**Observed** “10 documents unreviewed”만 허용되고 decisive clue는 노출되지 않았다.  
**Verdict** **PASS**  
**Boundary note** UI projection TBD.

### Case 33 — Mistaken extraction
**Purpose** reviewer-recorded extraction과 source-visible content의 semantic boundary를 공격한다.  
**Fixture** SourceMaterial E10: “Payment was approved on May 14.” RecordedExtraction RX-01: “Payment was approved on May 4.” `origin: WP-31`, `source: E10`. Optional PA-04: “If May 4 is correct, approval preceded committee review.” `basis: RX-01`.  
**Manual verification** SourceMaterial/source-contained content, RecordedExtraction, ProfessionalAnalysis를 분리하고 RX-01의 fallibility, non-rewrite, provenance와 later correction lineage를 확인한다.  
**Expected** E10 remains May 14; RX-01 may remain historically mistaken; PA-04 may depend on RX-01; later review may challenge/correct without deleting history; no truth promotion.  
**Observed** DEC-020 v0.2의 three-layer boundary에 따라 source, recorded reading과 analysis가 분리되고 old provenance가 보존됐다.  
**Verdict** **PASS**  
**Boundary note** Exact extraction error frequency, OCR mechanics and correction workflow remain NOT TESTED / TBD.

### Case 34 — Triage relevance oracle attack
**Purpose** triage priority와 global case importance를 분리한다.  
**Fixture** 100 authorized sources; triage says `E47 = critical to winning the case` without supporting analysis/provenance.  
**Manual verification** current issue-scoped priority/deeper-review rationale만 허용한다.  
**Expected** global objective importance invalid; “high-priority for I3” may be valid with context.  
**Observed** triage was bounded to priority/relevance candidates and did not become hidden-answer ranking.  
**Verdict** **PASS**  
**Boundary note** triage relevance algorithm TBD.

### Case 35 — Parallel synthesis truth-collapse attack
**Purpose** parallel outputs가 자동 truth가 아님을 확인한다.  
**Fixture** A says E1 supports Theory X; B says E70 undermines X.  
**Manual verification** both WorkProducts/provenance를 보존하고 synthesis Task 여부를 확인한다.  
**Expected** `Final Evidence Truth: X false` auto-merge forbidden.  
**Observed** competing analyses가 coexist하며 future synthesis만 별도 Task로 남았다.  
**Verdict** **PASS**  
**Boundary note** synthesis algorithm TBD.

## 4. Assigned / reviewed / understood pressure test

```text
authorized: E01–E20
opened: E01–E12
fully reviewed: E01–E08
partially reviewed: E09–E12
unopened: E13–E20
```

E05의 mistaken interpretation 하나를 추가한다. Authorized/opened/fully/partial/unreviewed/interpretive error를 별도 provenance로 표현하고 `80% complete` 또는 `reviewed = understood`로 축소하지 않는다. **Result: PASS.** Exact field names/completion rules는 TBD.

## 5. Extraction pressure test

Source literal: “The board meeting occurred on March 14.”

- SourceAssertion “document states March 14”는 가능하다.
- Chronology candidate는 source/provenance/status를 유지해야 한다.
- Objective world event “definitely occurred March 14”는 금지된다.
- Recorded extraction `March 14 → March 4`는 source를 rewrite하지 않아야 한다.

RecordedExtraction “review process recorded March 14”도 가능하며, mistaken RecordedExtraction “review process recorded March 4”도 source를 바꾸지 않고 기록될 수 있다. `RecordedExtraction ≠ SourceMaterial actually says ≠ ProfessionalAnalysis ≠ objective truth`. **Result: PASS.** Exact correction mechanics remain NOT TESTED / TBD.

## 6. Contradiction/corroboration pressure test

`E1 says X`, `E2 says not-X`, `E3/E4 say X`를 둔다. Contradiction candidate와 corroboration candidate는 함께 존재할 수 있으나 `3 vs 1 → X true`, 또는 candidate→one source false가 허용되지 않는다. **Result: PASS.**

## 7. Triage pressure test

100 authorized sources를 metadata/first-pass contents로 triage한다. Output은 likely priority, current-scope relevance, obvious gap, needs deeper review, grouping에 한정한다. Objective importance, hidden clue, exhaustive extraction, guaranteed contradiction 또는 winning-evidence marker는 만들지 않는다.

> Triage is a bounded review mode, not a hidden relevance oracle.

**Result: PASS.**

## 8. Source-version pressure test

E10 v1→Review WP1, 이후 E10 v2 acquired, v2 미검토 상태를 둔다. WP1은 v1의 historical input에만 유효하며 assertions, issue links, contradiction candidates와 completion status를 v2로 silent transfer하지 않는다. **Result: PASS.** Delta-review mechanics는 TBD.

## 9. Parallel-review pressure test

Reviewer A/B의 WorkProducts가 충돌해도 두 output, source/performer provenance와 unresolved conflict를 보존한다. weighted merge, seniority merge, majority truth와 automatic integration을 하지 않는다. Future CrossReview/Synthesis Task만 허용한다. **Result: PASS.**

## 10. Direct vs delegated pressure test

같은 EvidenceReviewTaskDefinition에서 player direct path와 associate delegated path를 비교한다. 두 경로 모두 coverage, assertions, references, analysis, relations, gaps, limitations, provenance를 사용해야 하며 `Player → structured`, `NPC → hidden 76%` divergence는 invalid다. **Result: PASS.**

## 11. Support-role pressure test

Indexing/metadata Task는 support_staff 허용, lawyer-required interpretive Task는 support_staff 배정 invalid로 fixture를 나눈다. 이는 TaskDefinition role gate만 검증하며 실제 Korean role law를 결정하지 않는다. **Result: PASS.**

## 12. Investigation-boundary pressure test

Authorized E01–E10만 review하고 world-only E99/W20을 숨긴다. E4가 “See account statement”라고 말하면 referenced statement unavailable KnownGap는 허용되지만 E99 content/offshore transfers는 금지된다. **Result: PASS.**

## 13. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Evidence Review is explicit Task family | 1,18–22 | PASS | Task boundary |
| Acquired/authorized material only | 1–4,14,23,31 | PASS | No E99 |
| Review ≠ Investigation | 3,4,31,32 | PASS | Separate boundary |
| Explicit bounded scope | 2,18–20 | PASS | Direction/focus |
| Assigned ≠ reviewed | 2,4,15, pressure §4 | PASS | Coverage split |
| Reviewed ≠ correctly understood | 9,16,17,33, §4 | PASS | Error possible |
| Structured coverage | 1,2,15,19 | PASS | No hidden percent |
| No universal review score | 1,12,15,20 | PASS | Structure authoritative |
| Extraction ≠ analysis | 5,16,33, §5 | PASS | Three-layer separation |
| SourceMaterial ≠ RecordedExtraction | 33, §5 | PASS | Source immutable |
| RecordedExtraction ≠ ProfessionalAnalysis | 16,33, §5 | PASS | Separate provenance |
| RecordedExtraction may be mistaken | 33 | PASS | Error frequency TBD |
| Mistaken RecordedExtraction cannot rewrite source | 33, §5 | PASS | Non-rewrite |
| Correction/re-review preserves extraction history | 33, 10,17, §5 | PASS | Workflow TBD |
| SourceAssertion ≠ truth | 5,11,12 | PASS | No vote |
| Extracted date ≠ objective date | 6,14,15, §5 | PASS | Candidate only |
| Entity mention ≠ verified fact | 7 | PASS | Reference only |
| Issue link ≠ proof | 8,27 | PASS | Contextual |
| Contradiction candidate ≠ truth | 9,10,35 | PASS | No confirmation |
| Corroboration candidate ≠ truth | 11,12, §6 | PASS | No majority |
| KnownGap may exist | 4,10,14,25,32 | PASS | Bounded gap |
| Gap does not reveal hidden content | 4,11,31,32 | PASS | No answer leak |
| Reviewer may miss content | 13,15,19 | PASS | Probability TBD |
| Reviewer may misinterpret | 10,16,17,33 | PASS | Fallible review |
| Capability ≠ completeness/correctness | 13–15 | PASS | No omniscience |
| No weighted capability sum | 12,15,20 | PASS | No formula |
| Direct/delegated same ontology | 21,22, §10 | PASS | No NPC percentage |
| Support staff role-distinct | 23,24, §11 | PASS | Legal scope TBD |
| Source version preserved | 25, §8 | PASS | v1/v2 split |
| Duplicate provenance preserved | 26 | PASS | No erase |
| Relevance contextual | 8,27,34 | PASS | No global label |
| Triage ≠ deep review | 19,20,34, §7 | PASS | Bounded triage |
| Triage priority ≠ global importance | 19,34 | PASS | No oracle |
| Parallel review ≠ truth synthesis | 28,35, §9 | PASS | Explicit future Task |
| Case File update ≠ ActualStateRecord | 29,31,32 | PASS | Knowledge only |
| WorkProduct ≠ CourtRecord | 29,30,35 | PASS | Procedure gate |
| No direct JII/finding effect | 8,29,30,35 | PASS | Inherited |
| Unknown unknown not exposed | 3,11,31,32 | PASS | Hidden state blocked |

## 14. Contradiction review

DEC-020의 acquired/authorized gate, Review/Investigation separation, assigned/reviewed/understood distinction, extraction/analysis separation, fallible review와 Case File/CourtRecord boundary는 서로 모순되지 않는다. DEC-019 epistemic graph, DEC-018 Task/WorkProduct, DEC-017 capability, DEC-016 provenance, DEC-015 history/version, DEC-013/014 JII/ChoicePoint/finding 경계를 침범하지 않았다.

DEC-020 v0.2 introduced a separate provenance-bearing RecordedExtraction layer. Therefore mistaken extraction is semantically representable without rewriting SourceMaterial or collapsing into ProfessionalAnalysis. Exact OCR/error probability/correction mechanics remain TBD and are not needed for this fixture-level boundary test. Case 34 triage priority and Case 35 parallel synthesis did not become global importance or truth promotion. No other truth laundering, hidden-state leakage, source-version loss, duplicate deletion or CourtRecord bypass was found.

## 15. False-PASS audit

각 PASS는 DEC-020 v0.2의 명시적 boundary만 적용했다. Case 33 PASS는 SourceMaterial ≠ RecordedExtraction ≠ ProfessionalAnalysis와 provenance/history/non-rewrite만으로 도출되며 OCR accuracy, extraction probability, reviewer error rate, automatic correction 또는 source-reliability formula를 발명하지 않았다.

## 16. False-PARTIAL audit

No core case remains PARTIAL. DEC-020 v0.2 resolved the only semantic ambiguity identified in v0.1 by defining RecordedExtraction as a separate fallible provenance-bearing layer. Exact OCR/error/correction mechanics remain TBD, but are intentionally outside this semantic verification scope and are not PARTIAL grounds.

## 17. Remaining TBD / NOT TESTED

- canonical Evidence Review Task/source taxonomy and TaskDefinition schema
- parser/OCR/text handling, exact extraction/entity/date/assertion semantics
- mistaken-extraction correction/error object and miss probabilities
- capability→component mappings, review-depth/triage vocabulary and algorithms
- contradiction/corroboration/relevance/source-reliability rules
- duplicate detection, synthesis/integration and completion semantics
- workload/time/capacity, NPC AI, player UI/minigames
- Investigation, evidence acquisition/discovery and witness discovery
- legal research, drafting/filing and CourtRecord admission details
- actual Korean legal doctrine/practice
- save/schema/API/Godot implementation, performance/balancing

## 18. Final verification summary

```text
Total core cases: 35
PASS: 35
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: **none**.  
FAIL cases: **none**.

- DEC-020 reopen required: **No**.
- Inherited boundary violation: **None**.
- Review→Investigation leakage: **None**.
- Hidden-state access: **None accepted**.
- Extraction/analysis collapse: **None**; SourceMaterial, RecordedExtraction and ProfessionalAnalysis remain separate.
- Mistaken-extraction ambiguity: **Resolved by DEC-020 v0.2**.
- Triage relevance oracle: **Rejected in Case 34**.
- Parallel synthesis truth-collapse: **Rejected in Case 35**.
- Source-version/history loss: **None**.
- Case File→CourtRecord bypass: **None**.
- Issue blocking DEC-020 Accepted promotion: **None**; DEC-020 is already v0.2 Accepted.
- Issue blocking DEC-021: **No**, though DEC-021 should define acquisition/discovery separately from review.

## 19. Promotion recommendation

All 35 core cases pass against DEC-020 v0.2 Accepted semantics:

```text
DEC-020 v0.2 — Accepted
TEST-019 v0.2 — Accepted / manual fixture-level verification
```

Do not auto-promote status from this TEST.

## 20. Next DEC recommendation

Recommend `DEC-021 — Investigation & Evidence Acquisition`. It should define legitimate source discovery, document requests, external searches, witness discovery, failed searches, false leads, known-gap pursuit and provenance without reading hidden ActualStateRecord or exposing unknown unknowns. Do not design DEC-021 inside TEST-019.

## Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-020 v0.1 기준 35 core cases, assigned/reviewed/understood, extraction, triage, source-version, parallel-review, direct/delegated, support-role, Investigation-boundary pressure tests와 invariant/contradiction/false-PASS/PARTIAL audits 작성 |
| v0.2 | Accepted / manual fixture-level verification | Updated against DEC-020 v0.2. Case 33 now PASS because SourceMaterial, RecordedExtraction and ProfessionalAnalysis are explicitly separated; mistaken extraction is fallible, cannot rewrite source, and preserves correction/history lineage. Final result is 35 PASS / 0 PARTIAL / 0 FAIL. No other core fixture outcome changed. |
