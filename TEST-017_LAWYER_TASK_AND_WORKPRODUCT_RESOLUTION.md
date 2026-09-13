# THE FIRM — Lawyer Task and WorkProduct Resolution

문서 ID: TEST-017  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md` v0.1 Proposed / design review required

## 1. Purpose / verification boundary

이 문서는 DEC-018의 공통 Task/WorkProduct semantics를 synthetic fixture에 수동 적용하여 내부 일관성과 inherited boundary를 검증한다. 구현, 실제 코드 실행, 실제 대한민국 법률·법조 관행의 정확성을 주장하지 않는다.

검증 causal chain:

```text
CaseFileState + TaskDefinition + TaskAssignment
+ PerformerRole/ProfileVersion + Information + Time/Resources/Capacity
+ Direction + Prior WorkProducts/Dependencies + materialized events
→ Task Resolution → structured WorkProduct
→ Case File update and/or explicit procedural materialization
→ existing Litigation systems
```

`Observed`는 코드 결과가 아니라 DEC semantics를 fixture에 수동 대입한 결과다.

## 2. Verification scope and inherited boundaries

검증하는 것: explicit Task, role eligibility, direct/delegated equivalence, structured demands, component contribution, structured WorkProduct, deterministic clear results, bounded/materialized variation, reload safety, review lineage, dependencies/parallelism, Case File and CourtRecord separation, partial outputs, causal defects, support/lawyer distinction.

검증하지 않는 것: actual Korean role rules, task catalog, capability-to-component mapping, task algorithms, workload formula, variation probability, NPC AI, player minigames, UI, schema/API/save, Godot implementation.

상속된 hard boundary:

- Task/Capability/WorkProduct는 `JudgeInterpretationInput`, `CriterionChoicePoint`, credibility, sufficiency, `CourtFactFinding`, judge favorability 또는 final outcome을 직접 변경하지 않는다.
- 허용 경로는 `Task → WorkProduct → explicit valid procedural materialization → allowed record/procedure state → existing Litigation evaluation`이다.
- capability와 task가 unavailable evidence, hidden truth, `ActualStateRecord`, unsubmitted material 또는 undeclared scope를 만들지 않는다.
- 내부 WorkProduct는 submission/admission/procedure-facing materialization 없이는 CourtRecord가 아니다.
- DEC-014의 choice-point activation과 DEC-013의 hard-first/JII boundary를 reopen하지 않는다.

## 3. Core test cases

### Case 1 — Simple solo task

**Purpose**  직접 수행도 explicit Task와 구조화된 결과를 사용함을 확인한다.

**Fixture**  Player가 접근 가능한 문서 5개를 충분한 시간에 Evidence Review Task로 검토한다. valid role, missing dependency 없음, borderline component 없음.

**Manual verification**  TaskDefinition·assignment·입력·시간을 확인하고 execution 뒤 WorkProduct의 scope, links, gaps와 provenance를 적는다. one-roll skill 판정을 추가하지 않는다.

**Expected**  유효한 직접 실행과 structured WorkProduct가 가능하다. 실제 review algorithm은 TBD다.

**Observed**  Task와 execution context가 존재하며 결과를 score 하나가 아닌 검토 범위와 발견/미검토 항목으로 기록할 수 있었다.

**Verdict**  **PASS**

**Boundary note**  Evidence Review의 효과·정확도는 NOT TESTED / TBD.

### Case 2 — Delegated equivalent task

**Purpose**  위임 실행이 별도 단순화 엔진이 아님을 확인한다.

**Fixture**  동일 유형 TaskDefinition을 associate lawyer에게 assignment한다. valid LawyerProfileVersion, 유사한 정보·시간·자원, delegated direction을 제공한다.

**Manual verification**  직접 실행과 위임 실행이 같은 Task/WorkProduct ontology와 입력 차이를 쓰는지 비교한다.

**Expected**  semantics는 동일하고 execution source만 다르다. passive delegation bonus나 별도 NPC output type은 없다.

**Observed**  performer와 direction이 달라질 수 있지만 Task scope, WorkProduct 구조, procedural gate는 동일하게 유지됐다.

**Verdict**  **PASS**

**Boundary note**  두 결과가 내용상 동일해야 한다는 규칙은 정의하지 않았으므로 exact equality는 NOT TESTED.

### Case 3 — Support-role eligibility

**Purpose**  허용된 support role이 독립적인 performer category임을 확인한다.

**Fixture**  `document_indexing` TaskDefinition이 support_staff를 eligible role로 선언하고 support staff를 배정한다.

**Manual verification**  role eligibility와 output type을 확인하고 변호사 능력으로 환산하지 않는다.

**Expected**  구조적으로 valid. support staff는 낮은 능력의 lawyer가 아니다.

**Observed**  별도 role requirement로 유효하며 lawyer capability ladder를 호출하지 않아도 된다.

**Verdict**  **PASS**

**Boundary note**  실제 직역 범위는 NOT TESTED / TBD.

### Case 4 — Invalid performer role

**Purpose**  role requirement를 능력 크기로 우회할 수 없는지 확인한다.

**Fixture**  `legal_issue_analysis`가 lawyer_required인데 support_staff가 배정된다.

**Manual verification**  assignment와 eligible-role requirement를 비교한다.

**Expected**  invalid assignment; supplied role로 실행하지 못한다. 높은 support 경험으로 waiver하지 않는다.

**Observed**  role mismatch가 capability보다 먼저 발견되었고 execution을 유효한 결과로 진행할 수 없었다.

**Verdict**  **PASS**

**Boundary note**  정확한 오류 상태/메시지는 TBD.

### Case 5 — Universal difficulty score attack

**Purpose**  one-score skill-vs-difficulty 모델을 거부한다.

**Fixture**  `TaskDifficulty = 82`, `LawyerSkill = 86`만 존재한다.

**Manual verification**  structured demand, scope, inputs, outputs가 없는지 확인한다.

**Expected**  canonical resolution으로 불충분/invalid. `86 - 82 = success`를 사용하지 않는다.

**Observed**  score만으로 요구 범위·결함·WorkProduct를 설명할 수 없었다.

**Verdict**  **PASS**

**Boundary note**  내부 tuning 숫자의 존재 여부는 NOT TESTED.

### Case 6 — Structured task demands

**Purpose**  task demand를 독립된 semantic dimensions로 보존한다.

**Fixture**  volume high, information complexity moderate, cross-reference density high, time pressure severe, information completeness partial.

**Manual verification**  각 demand를 별도로 기록하고 aggregate difficulty를 만들지 않는다.

**Expected**  dimensions가 분리되어 유지된다. resolution은 TBD.

**Observed**  volume과 time pressure가 같은 의미로 덮어쓰이지 않았고 개별 constraints로 남았다.

**Verdict**  **PASS**

**Boundary note**  taxonomy와 effect formula는 NOT TESTED / TBD.

### Case 7 — Weighted capability attack

**Purpose**  hidden weighted-sum을 canonical semantics로 만들지 않는지 확인한다.

**Fixture**  `analysis × .4 + research × .3 + oral_advocacy × .3 = TaskQuality`.

**Manual verification**  weights가 source DEC에 있는지와 component boundary가 보존되는지 확인한다.

**Expected**  default canonical resolution으로 reject. 다른 임의 formula도 만들지 않는다.

**Observed**  DEC-018은 capability-to-component mapping은 허용하지만 weights/total을 정의하지 않으므로 이 fixture는 score 결과를 산출하지 않았다.

**Verdict**  **PASS**

**Boundary note**  향후 task-specific rule이 수치 내부표현을 쓸지는 TBD.

### Case 8 — Component-based contribution

**Purpose**  여러 capability가 서로 다른 WorkProduct component에 기여할 수 있음을 확인한다.

**Fixture**  Cross-examination preparation에서 witness analysis→witness model, contradiction tracking→coverage, procedural knowledge→usable boundaries, oral advocacy→question sequencing.

**Manual verification**  각 contribution의 target component를 분리하고 average/highest/weakest/overall score를 시도한다.

**Expected**  component references는 valid; exact component resolution은 TBD.

**Observed**  서로 다른 strengths와 gaps를 보존하는 구조는 가능했으나 최종 task quality는 결정하지 않았다.

**Verdict**  **PASS**

**Boundary note**  `exact component resolution NOT TESTED / TBD`.

### Case 9 — Missing-information non-creation

**Purpose**  exceptional capability가 없는 정보를 만들지 못함을 확인한다.

**Fixture**  exceptional lawyer에게 critical source document가 없는 Task를 준다.

**Manual verification**  available information과 WorkProduct source refs를 대조한다.

**Expected**  missing source는 missing으로 남고 fabricated coverage/hidden truth가 없다.

**Observed**  capability는 task treatment를 설명할 수 있을 뿐 문서나 canonical fact를 생성하지 않았다.

**Verdict**  **PASS**

**Boundary note**  investigation/evidence-discovery mechanics는 NOT TESTED.

### Case 10 — Time constraint

**Purpose**  capacity constraint와 capability profile을 분리한다.

**Fixture**  exceptional lawyer에게 scope가 capacity보다 큰 Task와 severe time constraint를 준다.

**Manual verification**  profile version은 그대로 두고 output scope/gaps/defects를 별도로 기록한다.

**Expected**  output이 constrained될 수 있으나 capability downgrade나 자동 percentage penalty는 없다.

**Observed**  exceptional capability를 유지한 채 incomplete/limited WorkProduct 가능성을 표현할 수 있었다.

**Verdict**  **PASS**

**Boundary note**  workload formula와 정확한 constraint 결과는 NOT TESTED / TBD.

### Case 11 — Direct legal-outcome attack

**Purpose**  WorkProduct가 법적 결과를 직접 보정하지 못함을 확인한다.

**Fixture**  strong drafting WorkProduct가 `judge acceptance +10%`를 요청한다.

**Manual verification**  JII/CP/finding/favorability reference가 생기는지 검사한다.

**Expected**  forbidden; direct legal modifier 없음.

**Observed**  drafting output은 제출·절차 materialization을 거쳐 allowed record로 가는 경우만 downstream에 연결될 수 있었다.

**Verdict**  **PASS**

**Boundary note**  filing/admission rules는 NOT TESTED.

### Case 12 — Structured WorkProduct

**Purpose**  결과가 structured artifact임을 확인한다.

**Fixture**  EvidenceReviewWorkProduct가 completed E01/E02, uncompleted E03, E01→Issue A link, accounting gap, unsupported inference risk, task/performer/source provenance를 가진다.

**Manual verification**  scope, links, gaps, risks, refs를 별도로 보존하고 quality number를 추가하지 않는다.

**Expected**  valid structured WorkProduct.

**Observed**  각 항목이 독립적으로 추적되며 하나의 78로 환원되지 않았다.

**Verdict**  **PASS**

**Boundary note**  component vocabulary는 TBD.

### Case 13 — Quality-score collapse

**Purpose**  quality number만으로는 complete semantic result가 아님을 확인한다.

**Fixture**  `WorkProductQuality = 78`만 제공한다.

**Manual verification**  scope, gaps, sources, defects, provenance 부재를 확인한다.

**Expected**  insufficient. 78이 downstream authority가 되지 않는다.

**Observed**  structured semantics가 없어 다음 task와 litigation gate에 안전하게 전달할 수 없었다.

**Verdict**  **PASS**

**Boundary note**  internal numeric tuning은 NOT TESTED.

### Case 14 — Summary-band non-authority

**Purpose**  UI summary가 source of truth가 아님을 확인한다.

**Fixture**  structured WorkProduct와 player-facing `Summary: Strong`이 함께 존재한다.

**Manual verification**  downstream이 summary만 소비하는지 검사한다.

**Expected**  summary는 projection일 수 있으나 structured result가 authoritative하다.

**Observed**  `Strong`만으로 filing/finding을 결정하지 않고 underlying scope/gaps를 참조해야 했다.

**Verdict**  **PASS**

**Boundary note**  summary vocabulary/derivation은 TBD.

### Case 15 — Deterministic clear result

**Purpose**  동일 resolved inputs의 clear task result가 결정적인지 확인한다.

**Fixture**  같은 TaskDefinition, assignment, profile, information, time, resources, direction, dependencies, materialized events를 두 번 평가하고 borderline 없음.

**Manual verification**  결과를 비교하고 fresh quality roll/time/mood randomness를 찾는다.

**Expected**  같은 semantic WorkProduct; hidden roll 없음.

**Observed**  동일 inputs에서는 동일 scope/gaps/provenance semantics를 유지하는 경계가 적용됐다.

**Verdict**  **PASS**

**Boundary note**  byte-identical serialization과 implementation determinism은 NOT TESTED.

### Case 16 — Materialized borderline variation

**Purpose**  borderline variation이 선언된 component에만 bounded하게 materialize되는지 확인한다.

**Fixture**  future task-specific rule이 subtle accounting clue를 genuinely borderline로 표시하고 `TaskExecutionEvent TE-16`을 materialize한다.

**Manual verification**  event ref가 context에 들어가고 영향이 해당 component를 넘어가지 않는지 검사한다.

**Expected**  event가 persistent input이 된다. whole-task roll, judicial RNG, evidence creation은 없다.

**Observed**  event를 명시적으로 저장하면 동일 execution trace에서 재사용할 수 있었고 global quality roll은 필요하지 않았다.

**Verdict**  **PARTIAL**

**Boundary note**  borderline classification, event generation과 probability가 TBD라서 persistence/범위만 확인했다.

### Case 17 — Reload no-reroll

**Purpose**  materialized event가 reload로 재추첨되지 않음을 확인한다.

**Fixture**  Case 16의 TE-16이 저장된 동일 save를 reload한다.

**Manual verification**  event identity와 WorkProduct trace를 비교하고 새로운 event 생성을 시도하지 않는다.

**Expected**  같은 TE-16 재사용; reload는 rework가 아니다.

**Observed**  기존 event를 input으로 보존하는 semantics는 일관되었으나 실제 save/reload implementation은 존재하지 않는다.

**Verdict**  **PARTIAL**

**Boundary note**  semantic boundary는 PASS 방향이나 persistence implementation NOT TESTED.

### Case 18 — Explicit rework

**Purpose**  재수행과 reload를 구분한다.

**Fixture**  original WorkProduct 후 새 time/resources와 새 Review/Rework Task를 만든다.

**Manual verification**  새 task/event/WorkProduct가 생기고 원본이 보존되는지 확인한다.

**Expected**  revised output 가능; reload reroll이나 원본 삭제는 없다.

**Observed**  새 assignment/context를 가진 별도 task로만 revision path를 표현할 수 있었다.

**Verdict**  **PASS**

**Boundary note**  revision merge rules는 TBD.

### Case 19 — Review lineage

**Purpose**  Review가 free magic가 아닌 Task이며 lineage를 보존함을 확인한다.

**Fixture**  Draft Brief v1 → Review Task → Revised Draft v2. reviewer profile, scope, time/resources가 explicit.

**Manual verification**  v1, reviewer, Review Task, changes, unresolved issues와 v2 link를 기록한다.

**Expected**  traceable lineage; source version과 defect history 유지.

**Observed**  v2를 v1의 revision으로 연결할 수 있었고 reviewer context를 별도로 보존했다.

**Verdict**  **PASS**

**Boundary note**  review effectiveness algorithm은 TBD.

### Case 20 — Imperfect review

**Purpose**  review가 모든 defect를 자동 제거하지 않음을 확인한다.

**Fixture**  reviewer가 narrow scope와 limited time을 가지며 원본에 여러 defect가 있다.

**Manual verification**  검토 scope 밖/시간 부족 defect가 남을 수 있는지 기록한다.

**Expected**  partial review valid; perfect correction 보장 없음.

**Observed**  unresolved defect를 v2에 남길 수 있었고 reviewer 존재만으로 삭제되지 않았다.

**Verdict**  **PASS**

**Boundary note**  정확히 어떤 defect가 남는지는 NOT TESTED / TBD.

### Case 21 — Dependency enforcement

**Purpose**  required prerequisite를 조용히 만족시키지 않음을 확인한다.

**Fixture**  Drafting Task가 IssueAnalysisWorkProduct를 required dependency로 선언하지만 해당 product가 없다.

**Manual verification**  dependency refs와 completion semantics를 확인한다.

**Expected**  fully satisfied로 진행하지 않음; fabricated prerequisite 없음.

**Observed**  missing dependency가 독립적인 unresolved condition으로 남았으며 대체 처리 rule을 발명하지 않았다.

**Verdict**  **PASS**

**Boundary note**  중단/부분 실행의 exact status는 TBD.

### Case 22 — Parallel dependencies

**Purpose**  독립 Task의 parallel graph를 허용한다.

**Fixture**  Evidence Review와 Witness Interview가 병렬로 실행되고 둘 다 Issue Analysis로 연결된다.

**Manual verification**  두 predecessor가 서로의 input을 바꾸지 않는 graph를 확인한다.

**Expected**  valid parallel graph; universal linear workflow 강제 없음.

**Observed**  두 branch를 별도 task/workproduct로 보존한 뒤 dependent task가 둘을 참조할 수 있었다.

**Verdict**  **PASS**

**Boundary note**  scheduler와 timing semantics는 TBD.

### Case 23 — Case File update

**Purpose**  WorkProduct가 organized Case File을 갱신할 수 있으나 CourtRecord를 자동 변경하지 않음을 확인한다.

**Fixture**  Evidence Review가 `E12 appears inconsistent with W03 statement`를 보고하고 Case File에 WP-23 provenance link 후보를 남긴다.

**Manual verification**  source/status/provenance를 보존하고 judicial truth promotion을 시도한다.

**Expected**  provenance-bearing internal relation은 가능; automatic CourtRecord/finding mutation 없음.

**Observed**  Case File update와 record materialization을 분리하면 분석·가설 상태를 보존할 수 있었다.

**Verdict**  **PASS**

**Boundary note**  Case File epistemic taxonomy는 DEC-019 후보에서 TBD.

### Case 24 — Internal WorkProduct / CourtRecord separation

**Purpose**  internal memo가 절차 없이 법원 입력이 되지 않음을 확인한다.

**Fixture**  internal Research Memo가 존재하지만 submission/materialization이 없다. 공격은 judge가 memo를 직접 읽도록 한다.

**Manual verification**  CourtRecord source와 procedural gate를 확인한다.

**Expected**  forbidden; memo는 직접 litigation input이 아니다.

**Observed**  explicit valid procedural path 없이는 judge/JII에 도달하지 못했다.

**Verdict**  **PASS**

**Boundary note**  실제 admission/filing rule은 NOT TESTED.

### Case 25 — Partial useful WorkProduct

**Purpose**  불완전한 결과도 후속 task input으로 유용할 수 있음을 확인한다.

**Fixture**  Evidence Review가 A–C를 covered, D–F를 uncompleted로 남긴다.

**Manual verification**  completed portion과 gaps를 보존한 채 Review/Rework Task가 이를 참조하는지 확인한다.

**Expected**  partial WorkProduct valid; “nothing” 또는 false completion 아님.

**Observed**  A–C의 provenance를 유지하면서 D–F를 후속 scope로 넘길 수 있었다.

**Verdict**  **PASS**

**Boundary note**  후속 task가 반드시 성공한다는 의미는 아니다.

### Case 26 — Coordination defect

**Purpose**  팀 규모가 coordination defect를 숨기지 않음을 확인한다.

**Fixture**  두 lawyer가 A–C를 중복 검토하고 D는 unassigned로 남긴다.

**Manual verification**  overlap, duplicate effort, uncovered scope를 task history에 남긴다.

**Expected**  coordination defect trace 가능; team-size bonus 없음.

**Observed**  중복과 미배정 범위를 별도 gap으로 보존할 수 있었다.

**Verdict**  **PASS**

**Boundary note**  coordination resolution algorithm은 TBD.

### Case 27 — Direction-constrained execution

**Purpose**  explicit direction이 task scope를 제한할 수 있음을 확인하되 결과를 임의 확정하지 않는다.

**Fixture**  good lawyer에게 pricing clauses만 보라는 direction을 주고 별도 delivery issue가 out-of-scope로 존재한다.

**Manual verification**  direction이 assignment scope에 기록되는지, out-of-scope item이 자동 처리되지 않는지 확인한다.

**Expected**  out-of-scope issue가 남을 수 있다. task-specific rule 없이는 반드시 놓쳤다고 주장하지 않는다.

**Observed**  direction boundary는 보존됐고 capability가 전체 사건을 자동 탐색하지 않았다.

**Verdict**  **PASS**

**Boundary note**  direction과 omission의 정확한 인과는 NOT TESTED / TBD.

### Case 28 — Large-case capacity pressure

**Purpose**  simultaneous tasks와 capacity를 별도 constraint로 표현한다.

**Fixture**  한 lawyer에게 large scope의 여러 Task, limited time, high capability를 동시에 배정한다.

**Manual verification**  capability profile을 바꾸지 않고 task-level capacity/gaps를 기록한다.

**Expected**  operational constraint 가능; permanent downgrade, random court penalty, global stress debuff 없음.

**Observed**  profile immutable 상태에서 task outputs가 constrained될 수 있는 구조를 확인했다.

**Verdict**  **PARTIAL**

**Boundary note**  workload/capacity formula와 staffing optimization이 TBD라 semantic possibility만 검증했다.

### Case 29 — Case File truth-laundering attack

**Purpose**  internal analysis가 저장만으로 objective/judicial truth가 되지 않음을 강하게 검증한다.

**Fixture**  WorkProduct가 `E12 appears inconsistent with W03`라고 보고한다. 공격은 이를 provenance/status 없이 Case File의 `canonical fact: E12 contradicts W03`로 승격한다.

**Manual verification**  source, analysis status, uncertainty와 Case File/CourtRecord 경계를 확인한다.

**Expected**  invalid/boundary violation. Case File은 `ActualStateRecord`, judicial truth 또는 CourtRecord가 아니다. exact epistemic taxonomy는 TBD.

**Observed**  단순 저장만으로 canonical fact를 만들 수 없으며 provenance-bearing analysis로 남겨야 한다는 DEC-018 경계가 일관됐다.

**Verdict**  **PASS**

**Boundary note**  Case File taxonomy와 conflict/refinement rules는 NOT TESTED / TBD.

## 4. Additional attack tests

### Attack A — Whole-case roll

**Input:** `CaseStrength = 81`, `OpponentStrength = 74`.  
**May evaluate:** 없음.  
**Must not happen:** case score가 Task Resolution을 대체하거나 성공을 결정.  
**Expected:** Forbidden.

### Attack B — Highest-stat shortcut

**Input:** task result를 highest applicable capability로 지정.  
**May evaluate:** future task rule이 명시할 때만 검토 가능.  
**Must not happen:** DEC-018 default로 채택.  
**Expected:** Invalid/TBD, rule 발명 금지.

### Attack C — Weakest-link shortcut

**Input:** lowest capability가 전체 task result를 결정.  
**May evaluate:** 없음.  
**Must not happen:** default weakest-link rule.  
**Expected:** Invalid as canonical default.

### Attack D — Global random task quality

**Input:** `roll 1–100 → WorkProduct quality`.  
**May evaluate:** 없음.  
**Must not happen:** global random quality.  
**Expected:** Forbidden.

### Attack E — Exceptional auto-success

**Input:** exceptional lawyer.  
**May evaluate:** capability가 해당 component에 기여하는지.  
**Must not happen:** perfect WorkProduct/automatic success.  
**Expected:** Forbidden.

### Attack F — Support staff power-ladder attack

**Input:** `support_staff_level_90`로 lawyer-required Task 배정.  
**May evaluate:** 없음.  
**Must not happen:** numeric magnitude로 role waiver.  
**Expected:** Invalid.

### Attack G — Review cleansing

**Input:** partner review가 모든 defect를 삭제.  
**May evaluate:** review task가 발견·수정 범위를 기록하는 것.  
**Must not happen:** perfect correction guarantee.  
**Expected:** Forbidden.

### Attack H — Missing dependency laundering

**Input:** required WorkProduct absent.  
**May evaluate:** missing dependency trace.  
**Must not happen:** adequate prerequisite를 가정.  
**Expected:** Invalid/blocked boundary; exact handling TBD.

### Attack I — Reload reroll

**Input:** reload 뒤 새 TaskExecutionEvent 생성.  
**May evaluate:** 기존 event 재사용.  
**Must not happen:** reroll.  
**Expected:** Forbidden.

### Attack J — Case File → CourtRecord laundering

**Input:** internal Case File inference를 judge가 자동 읽음.  
**May evaluate:** explicit procedural materialization 여부.  
**Must not happen:** automatic judicial input.  
**Expected:** Forbidden.

### Attack K — Summary-label authority

**Input:** `Summary = Strong → filing accepted`.  
**May evaluate:** summary projection.  
**Must not happen:** label-only authority.  
**Expected:** Invalid.

### Attack L — Direct/delegated semantic divergence

**Input:** player path는 structured WorkProduct, delegated path는 hidden success percentage.  
**May evaluate:** same ontology와 causal gate.  
**Must not happen:** divergent engines.  
**Expected:** Invalid.

## 5. Multi-capability pressure test

**Fixture:** CrossExaminationPreparation에 witness analysis exceptional, contradiction tracking strong, procedural knowledge competent, oral advocacy developing.

**Manual checks:** average, weighted sum, highest, weakest, overall score 생성 여부와 separate components 보존 여부를 점검한다.

**Expected:** component contribution structure만 확인 가능하다. DEC-018만으로 최종 task quality나 combination algorithm을 계산하지 않는다. `exact component resolution NOT TESTED / TBD`.

## 6. WorkProduct pressure test

**Fixture:** CrossExaminationPlan에 well-developed witness model, A/B covered·C unresolved contradiction coverage, one procedural attack requiring verification, coherent question sequence, unsupported confrontation risk를 둔다.

**Expected:** characteristics/gaps/risks가 `quality = 82` 없이 이해 가능하다. `WorkProduct effectiveness NOT TESTED / TBD`; downstream effectiveness를 발명하지 않는다.

## 7. Variation pressure test

Subtle accounting clue가 future rule에 의해 borderline로 선언되고 event가 materialize된 fixture를 점검한다. 영향이 해당 component에만 한정되고 event가 한 번 저장되며 reload가 재추첨하지 않는지, 새 Review/Rework는 새 Task인지, event가 CourtFactFinding을 직접 바꾸지 않는지를 확인한다. 확률·생성 메커니즘은 발명하지 않는다.

**Result:** 구조적 boundary는 일관되지만 classification, probability, event-generation implementation은 NOT TESTED / TBD.

## 8. Review/revision pressure test

`Draft v1 → Review Task → Review Findings → Revised Draft v2`의 lineage를 확인한다. v1, reviewer, scope/time, unresolved defects, v1→v2 link를 보존하고 in-place overwrite나 perfect correction을 허용하지 않는다.

**Result:** traceable lineage boundary PASS; review effectiveness와 merge semantics는 NOT TESTED / TBD.

## 9. Case File epistemic-boundary review

Future Case File/Matter Knowledge Model에서 source material, source-reported assertion, professional analysis, inferred relation, unresolved hypothesis, contradiction candidate, verified procedural status, unknown/unresolved를 구별할 필요가 있음을 확인한다. 이 목록은 canonical taxonomy로 확정하지 않는다.

단일 검증 결론은 다음과 같다.

> DEC-018만으로는 Case File에 저장된 internal analysis가 objective/world/judicial truth가 될 수 없다.

분석은 provenance/status/uncertainty를 보존해야 하며, CourtRecord 승격에는 별도 explicit procedure가 필요하다. **PASS** (taxonomy itself NOT TESTED / TBD).

## 10. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Task is explicit work unit | 1,2,18 | PASS | Case 내부 업무 단위 |
| Task declares role/input/output boundary | 2,3,4,21 | PASS | exact schema TBD |
| Support staff ≠ weak lawyer | 3,4, Attack F | PASS | distinct role |
| Resolution consumes full context | 1,2,6,10,15 | PASS | context list preserved |
| Structured task demands | 5,6 | PASS | no universal number |
| No universal skill-vs-difficulty roll | 5,7, Attack A | PASS | score attack rejected |
| Component-based capability contributions | 8, Multi-capability | PASS | resolution TBD |
| No default weighted sum | 7,8, Attack B,C | PASS | no formula invented |
| Structured WorkProduct | 1,12,25 | PASS | component vocabulary TBD |
| Summary label non-authority | 14, Attack K | PASS | projection only |
| Capability does not guarantee output | 9,10, Attack E | PASS | constraints retained |
| Deterministic default | 15 | PASS | implementation not tested |
| Borderline bounded variation | 16, Variation | PARTIAL | classification/probability TBD |
| Variation materialized once | 16,17, Variation | PARTIAL | save implementation TBD |
| Reload no-reroll | 17, Attack I | PARTIAL | semantic rule, no runtime test |
| Direct/delegated semantic equivalence | 2, Attack L | PASS | exact content equality TBD |
| Explicit direction input | 27 | PASS | effect algorithm TBD |
| Review is Task | 18,19,20 | PASS | review rules TBD |
| Review not omniscient | 20, Attack G | PASS | no perfect correction |
| Dependency enforcement | 21, Attack H | PASS | exact handling TBD |
| Parallel task graph supported | 22 | PASS | scheduler TBD |
| Case File update provenance | 23,25,29 | PASS | taxonomy TBD |
| Case File ≠ truth | 23,29, Attack J | PASS | no laundering |
| Internal WorkProduct ≠ CourtRecord | 11,24, Attack J | PASS | procedure gate |
| WorkProduct version lineage | 18,19 | PASS | granularity TBD |
| Partial WorkProduct validity | 20,25,26 | PASS | useful gaps preserved |
| Defect cause trace | 10,19,20,26 | PASS | exact taxonomy TBD |
| No evidence/knowledge creation | 9,23,24, Attack D,E | PASS | unavailable input stays absent |
| No direct JII/finding effect | 11,23,24,29 | PASS | inherited hard boundary |

## 11. Contradiction review

1. **DEC-018 내부:** TWR16–18의 variation/persistence boundary와 TWR15 determinism은 clear result와 borderline event를 구분하므로 모순 없음. Exact implementation은 TBD다.
2. **DEC-017:** capability는 task/workproduct를 통해서만 작동하며 direct JII/finding, evidence creation을 하지 않는다. 침범 없음.
3. **DEC-016:** role/profile separation과 provenance boundary가 유지된다.
4. **DEC-015:** version/history preservation과 identity boundary를 변경하지 않는다.
5. **DEC-013/014:** JII/finding 및 ChoicePoint activation에 직접 연결하지 않는다.
6. Task difficulty는 universal score로 만들지 않았다.
7. Capability contribution은 hidden weighted sum으로 만들지 않았다.
8. WorkProduct는 global quality score로 축소되지 않았다.
9. Direct/delegated paths는 하나의 semantics를 공유한다.
10. Support role은 power ladder가 아니다.
11. Borderline variation은 global litigation RNG가 아니다.
12. Reload는 reroll이 아니다.
13. Review는 magic correction이 아니다.
14. Missing dependency는 silently satisfied되지 않는다.
15. Case File는 ActualStateRecord/truth store가 아니며 CourtRecord로 자동 승격되지 않는다.
16. Partial work와 causal defects가 보존된다.
17. Tester가 task-specific algorithm, Case File taxonomy, workload rule, variation probability를 확정하지 않았다.

**결론:** 발견된 DEC-018/상속 DEC contradiction 없음. 다만 PARTIAL 결과는 구현·세부 알고리즘이 아직 TBD임을 반영한다.

## 12. False-PASS audit

각 PASS는 DEC-018의 실제 boundary(명시적 Task, 구조화된 context/result, role gate, no direct legal effect, no hidden score, provenance, version/reload boundary)만 적용해 도출했다. 누락된 task-resolution, review, workload, Case File authority 또는 variation rule을 보충하여 PASS를 만들지 않았다.

특히 Case 8, 10, 15, 16, 18, 20, 23, 25, 27, 28, 29에서는 최종 효과 대신 구조·범위·provenance만 확인했다. Case 16, 17, 28은 해당 TBD 때문에 PARTIAL로 제한했다.

## 13. Remaining TBD / NOT TESTED

- canonical Task catalog/TaskDefinition schema
- exact performer-role catalog and Korean support-staff boundaries
- structured demand taxonomy
- capability→component mapping and task-specific resolution algorithms
- WorkProduct component taxonomy and adequacy/effectiveness
- internal numeric representation and summary-band derivation
- borderline classification, variation probability/distribution, TaskExecutionEvent generation
- player task interactions/minigames and NPC execution AI
- review effectiveness, revision merge semantics
- dependency scheduler, parallel coordination
- workload/capacity formulas, time units, staffing optimization
- Case File epistemic taxonomy, conflict/refinement rules and UI
- investigation, evidence discovery/development, legal research, issue analysis, witness work, drafting, filing, settlement/negotiation
- staff hiring/compensation
- save/schema/API/migration and Godot/GDScript
- balancing/performance
- actual Korean legal practice and role doctrine

## 14. Final verification summary

```text
Total core cases: 29
PASS: 27
PARTIAL: 2
FAIL: 0
```

### Promotion assessment

- DEC-018 v0.1을 reopen해야 하는 contradiction: **없음**.
- 문제로 남은 decision: TWR16–18(variation materialization/reload)와 TWR22/TWR30 관련 세부 persistence·capacity·partial-result mechanics는 TBD이며, Case 16·17·28을 PARTIAL로 제한했다. 이는 boundary contradiction이 아니라 미정 implementation/content 범위다.
- DEC-013/014/015/016/017 침범: **없음**.
- Case File truth-laundering 문제: **발견하지 않음**. Case 29에서 invalid로 차단했다.
- DEC-019로 넘기기 전 반드시 고칠 문제: **없음**. 다만 Case File epistemic taxonomy와 task-specific resolution은 후속 DEC에서 닫아야 한다.
- Fixture-level verification 기준의 DEC-018 Accepted 승격 저해 요소: **semantic contradiction은 없음**. 승격 여부는 design review와 미정 세부사항의 후속 결정을 조건으로 한다.

TEST-017의 결론은 manual/fixture-level semantics에 한정되며 구현·실제 법률·실제 task effectiveness를 통과시켰다는 의미가 아니다.

## 15. Proposed next design direction

DEC-018이 design review를 통과할 경우 다음 우선 후보를 비교한다.

1. `Case File / Matter Knowledge Model` — source, assertion, analysis, inference, hypothesis, uncertainty, provenance, conflict와 history를 먼저 닫아 WorkProduct가 truth로 laundering되지 않게 한다.
2. `Evidence Review & Investigation` — 실제 record-facing work를 구체화하는 대안이다.

현재 추천은 **Case File / Matter Knowledge Model**이나, 이는 제안일 뿐 최종 순서를 확정하지 않는다.

## Decision history

| Version | Date | Change |
|---|---|---|
| v0.1 | 2026-09-14 | DEC-018 v0.1을 기준으로 29개 synthetic manual core case, attack tests, invariant matrix, contradiction/false-PASS audit 및 promotion assessment 작성 |
