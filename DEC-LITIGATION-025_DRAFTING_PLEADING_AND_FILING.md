# THE FIRM — Drafting, Pleading and Filing

문서 ID: DEC-LITIGATION-025  
버전: v0.1 — Proposed / design review required  
상태: **Proposed / design review required**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 기준: `DEC-LITIGATION-024_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted, `TEST-023_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-023_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.2 Accepted, `TEST-022_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-022_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.2 Accepted, `TEST-021_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `TEST-020_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `TEST-019_EVIDENCE_REVIEW.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `TEST-018_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`, `DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md`, `DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md`, `DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md`  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose

내부 CaseTheory, Arguments, IssueAnalysis와 Case File knowledge가 Draft로 작성·검토·수정·finalize되고, 명시적 SubmissionAttempt와 procedural reception을 거쳐 허용된 경우에만 CourtRecord로 materialize되는 최소 semantic model을 정의한다.

```text
CaseTheory / StrategicNarrative / Argument + authorized typed inputs
→ DraftingTask → DraftWorkProduct → Review / Revision → FinalizedDocument
→ SubmissionAttempt → procedural result
→ only explicit valid rule → CourtRecordEntry
```

`Drafted ≠ finalized ≠ submitted ≠ filed ≠ served ≠ accepted ≠ CourtRecord ≠ judge considered`.

## 2. Inherited hard boundaries

- `ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`.
- CaseTheory는 strategy, Argument는 advocacy, RuleStatement는 governing law가 아니다.
- typed source/assertion/analysis provenance와 immutable history를 보존한다.
- direct/delegated Task는 동일 ontology를 사용하고 materialized events는 reload로 reroll하지 않는다.
- Draft/filing은 JII, ChoicePoint, CourtFactFinding을 직접 바꾸지 않는다.

## 3. Semantic layers

```text
InternalAnalysis ≠ Argument ≠ Draft ≠ FinalizedDocument ≠ SubmissionAttempt
≠ FiledArtifact ≠ ServedArtifact ≠ ProcedurallyAcceptedArtifact
≠ CourtRecordEntry ≠ CourtFactFinding
```

## 4. Drafting Task, Draft and provenance

DraftingTaskDefinition은 document purpose/type, target stage, authorized snapshot, selected CaseTheory/Arguments, Issue/Rule/factual refs, sections, attachments, form requirements, deadline, eligible roles, resources, dependencies, review requirement와 output type을 개념적으로 포함한다. canonical schema와 Korean form catalog는 TBD다.

Draft는 factual/legal/advocacy claims, requested relief, references, attachments, metadata, assumptions와 placeholders를 포함할 수 있으나 filed artifact도 truth도 아니다. 모든 meaningful claim은 SourceAssertion, Statement, ProfessionalAnalysis, RuleStatement, IssueAnalysis, Argument, CaseTheory 또는 user choice에 추적 가능해야 한다.

## 5. Content, omission and error

Drafting은 Case File dump가 아니다. 전략 또는 오류로 material을 omit할 수 있지만 Case File을 삭제하지 않는다. date/citation/name/qualification/source-version/attachment/procedural error가 가능하다. Source E10이 May 14이고 Draft가 May 4라 해도 source는 변하지 않는다.

## 6. Review, revision and finalization

factual, citation, procedural/form, strategic, senior, exhibit review는 explicit scoped Task다. review는 fallible하고 completion은 error-free를 뜻하지 않는다. Revision은 새 version과 lineage를 만들며 FinalizedDocument는 firm이 next action 준비 버전을 선택한 organizational state일 뿐이다.

## 7. Submission and procedural results

SubmissionAttempt는 document/version, submitter, target, time, route, package, deadline context와 result를 보존한다. pending, received, filed, accepted, rejected, defective, returned, withdrawn, superseded, partially accepted 등 generic states는 candidate이며 exact vocabulary/effects는 TBD다. strong merits는 supplied defect를 무시하지 않고 weak merits는 hidden rejection 근거가 아니다.

## 8. Attachments, service and CourtRecord

document reference, package inclusion, admission/reception, truth를 분리한다. Filing과 service도 별도 action/result다. `ProcedurallyAcceptedArtifact + explicit inclusion rule → CourtRecordEntry`만 허용한다. CourtRecord의 party assertion은 CourtFactFinding이 아니다.

## 9. Amendment, withdrawal and collaboration

amendment, withdrawal, supersession은 current projection을 바꿀 수 있으나 old artifacts/events를 삭제하지 않는다. Parallel drafts는 별도이며 explicit merge가 child draft를 만들고 parents를 보존한다. Partner/client approval은 workflow authorization이지 truth, legal correctness 또는 filing acceptance가 아니다.

## 10. Capability and player-facing direction

legal writing, analysis, detail, procedure knowledge, case knowledge, strategy가 task-specific components에 기여할 수 있으나 DraftingScore나 hidden weighted sum은 없다. exceptional drafter도 error-free, acceptance, persuasion을 보장하지 않는다. Player는 versions, basis, placeholders, review defects, status, package, deadlines와 history를 볼 수 있으나 hidden result/judge reaction/finding은 볼 수 없다.

Generic document families may include initiating-document-like filings, answers/responses, motions/applications, briefs, evidence/exhibit submissions, notices, internal memoranda, letters and procedural requests. 이는 architecture examples일 뿐 실제 한국 문서 명칭·요건·효과를 확정하지 않는다.

## 11. Design decisions

### DFT1 — Drafting as explicit Task family

**Problem:** drafting을 implicit text mutation으로 처리할 것인가?  
**Alternatives:** A implicit mutation; B explicit DraftingTask/WorkProduct  
**Failure modes:** A는 inputs, performer, time과 history를 숨긴다.  
**Recommendation:** Drafting을 explicit Task family로 둔다.  
**Status:** Core Accepted candidate  
**Reason:** DEC-018 causal chain과 provenance를 유지한다.

### DFT2 — Draft ≠ FinalizedDocument

**Problem:** draft와 firm-selected ready version이 같은가?  
**Alternatives:** A same state; B separate states  
**Failure modes:** A는 readiness와 authorship iteration을 collapse한다.  
**Recommendation:** Draft와 FinalizedDocument를 분리한다.  
**Status:** Core Accepted candidate  
**Reason:** organizational readiness를 명시한다.

### DFT3 — Finalized ≠ Submitted

**Problem:** finalization이 외부 전송인가?  
**Alternatives:** A auto-submit; B explicit next action  
**Failure modes:** A는 player authority와 deadline choice를 제거한다.  
**Recommendation:** SubmissionAttempt를 별도 요구한다.  
**Status:** Core Accepted candidate  
**Reason:** internal selection과 external action을 분리한다.

### DFT4 — Submitted ≠ Filed/Accepted

**Problem:** 전송 시 filing/acceptance가 자동인가?  
**Alternatives:** A collapse; B structured procedural result  
**Failure modes:** A는 rejection/pending/defect를 표현 못 한다.  
**Recommendation:** submission 뒤 별도 result state를 둔다.  
**Status:** Core Accepted candidate  
**Reason:** 절차적 불확실성과 실패를 보존한다.

### DFT5 — Filed/Accepted ≠ CourtFactFinding

**Problem:** 절차적 수리가 fact finding인가?  
**Alternatives:** A yes; B no  
**Failure modes:** A는 party assertion을 truth로 세탁한다.  
**Recommendation:** CourtFactFinding을 downstream으로 유지한다.  
**Status:** Core Accepted candidate  
**Reason:** DEC-013/014 경계를 지킨다.

### DFT6 — Draft assertions ≠ truth

**Problem:** draft claim이 Case File fact인가?  
**Alternatives:** A truth mutation; B advocacy content  
**Failure modes:** A는 CaseTheory 오류를 객관 truth로 만든다.  
**Recommendation:** draft assertion을 provenance-bearing advocacy로 둔다.  
**Status:** Core Accepted candidate  
**Reason:** draft는 주장이지 world state가 아니다.

### DFT7 — Authorized inputs only

**Problem:** draft가 어떤 정보를 읽는가?  
**Alternatives:** A hidden/full world; B authorized snapshot  
**Failure modes:** A는 hidden-state leakage다.  
**Recommendation:** authorized Case File/legal refs만 소비한다.  
**Status:** Core Accepted candidate  
**Reason:** epistemic access를 보존한다.

### DFT8 — No ActualStateRecord correction

**Problem:** hidden truth가 draft를 고칠 수 있는가?  
**Alternatives:** A auto-correct; B unavailable  
**Failure modes:** A는 wrong theory play를 제거한다.  
**Recommendation:** ActualStateRecord를 drafting input에서 제외한다.  
**Status:** Core Accepted candidate  
**Reason:** firm knowledge와 world truth를 분리한다.

### DFT9 — No hidden legal-model correction

**Problem:** canonical hidden law가 citation을 고치는가?  
**Alternatives:** A oracle; B research-only input  
**Failure modes:** A는 legal research boundary를 우회한다.  
**Recommendation:** authorized RuleStatement/IssueAnalysis만 사용한다.  
**Status:** Core Accepted candidate  
**Reason:** DEC-023을 보존한다.

### DFT10 — Draft content provenance

**Problem:** draft claims의 origin을 남길 것인가?  
**Alternatives:** A flattened text; B typed refs  
**Failure modes:** A는 explainability와 correction을 파괴한다.  
**Recommendation:** meaningful claims에 source/analysis/argument refs를 둔다.  
**Status:** Core Accepted candidate  
**Reason:** review와 history 추적에 필요하다.

### DFT11 — Draft may be wrong/incomplete

**Problem:** draft가 항상 완전한가?  
**Alternatives:** A guaranteed correct; B fallible  
**Failure modes:** A는 capability oracle이 된다.  
**Recommendation:** misstatement, omission, stale citation, placeholder를 허용한다.  
**Status:** Core Accepted candidate  
**Reason:** lawyer work의 fallibility를 표현한다.

### DFT12 — Review explicit and fallible

**Problem:** review가 자동 단계인가?  
**Alternatives:** A implicit perfect pass; B Task  
**Failure modes:** A는 reviewer와 scope를 숨긴다.  
**Recommendation:** review를 explicit Task family/subtype으로 둔다.  
**Status:** Core Accepted candidate  
**Reason:** 다양한 review purpose를 지원한다.

### DFT13 — Review ≠ error-free guarantee

**Problem:** completed review가 무결성 보증인가?  
**Alternatives:** A guarantee; B may miss  
**Failure modes:** A는 100% proofreading oracle이다.  
**Recommendation:** review completion과 correctness를 분리한다.  
**Status:** Core Accepted candidate  
**Reason:** capability는 보증이 아니다.

### DFT14 — Version/revision history preserved

**Problem:** revision이 old draft를 덮는가?  
**Alternatives:** A overwrite; B lineage  
**Failure modes:** A는 당시 결정과 오류를 삭제한다.  
**Recommendation:** 모든 draft version과 change refs를 보존한다.  
**Status:** Core Accepted candidate  
**Reason:** audit와 downstream dependency에 필요하다.

### DFT15 — Parallel drafts do not auto-merge

**Problem:** 동시 drafts를 자동 통합할 것인가?  
**Alternatives:** A auto-final; B separate until explicit merge  
**Failure modes:** A는 conflict/choice를 숨긴다.  
**Recommendation:** explicit merge/review/selection 전 별도 유지한다.  
**Status:** Core Accepted candidate  
**Reason:** direct/delegated ontology를 지킨다.

### DFT16 — Finalization organizational state

**Problem:** finalization이 법적 효력인가?  
**Alternatives:** A legal effect; B firm state  
**Failure modes:** A는 submission boundary를 우회한다.  
**Recommendation:** ready-for-next-action 상태로만 정의한다.  
**Status:** Core Accepted candidate  
**Reason:** partner/client approval과 procedure를 분리한다.

### DFT17 — SubmissionAttempt explicit

**Problem:** 외부 제출을 어떻게 기록하는가?  
**Alternatives:** A inferred; B explicit attempt/event  
**Failure modes:** A는 target/version/time을 잃는다.  
**Recommendation:** document/version, actor, target, route, time을 보존한다.  
**Status:** Core Accepted candidate  
**Reason:** 결과와 action을 구분한다.

### DFT18 — Procedural result structured

**Problem:** 결과를 boolean으로 압축할 것인가?  
**Alternatives:** A success/fail; B typed states  
**Failure modes:** A는 pending/defect/withdrawal을 잃는다.  
**Recommendation:** fixture rule에 따른 structured result를 사용한다.  
**Status:** Core Accepted candidate  
**Reason:** 실패 원인과 후속 Task를 설명한다.

### DFT19 — Procedural validity ≠ substantive strength

**Problem:** merits와 procedure가 같은 축인가?  
**Alternatives:** A one quality; B independent dimensions  
**Failure modes:** A는 strong merits bypass와 weak merits rejection을 만든다.  
**Recommendation:** 두 semantics를 분리한다.  
**Status:** Core Accepted candidate  
**Reason:** 절차 수리와 설득력은 다르다.

### DFT20 — Acceptance ≠ argument correctness

**Problem:** accepted filing이 correct law인가?  
**Alternatives:** A yes; B no  
**Failure modes:** A는 reception을 adjudication으로 만든다.  
**Recommendation:** acceptance는 supplied procedural rule의 result만 뜻한다.  
**Status:** Core Accepted candidate  
**Reason:** judge acceptance는 downstream이다.

### DFT21 — Attachment reference ≠ inclusion

**Problem:** 문서 언급이 package inclusion인가?  
**Alternatives:** A implicit attach; B explicit relation  
**Failure modes:** A는 없는 exhibit를 생성한다.  
**Recommendation:** submission package에 explicit attachment refs를 요구한다.  
**Status:** Core Accepted candidate  
**Reason:** gap/defect 표현을 가능하게 한다.

### DFT22 — Attachment inclusion ≠ admission

**Problem:** package 포함이 court admission인가?  
**Alternatives:** A same; B separate  
**Failure modes:** A는 admissibility path를 우회한다.  
**Recommendation:** inclusion과 reception/admission을 분리한다.  
**Status:** Core Accepted candidate  
**Reason:** procedure-specific rule을 남긴다.

### DFT23 — Admission/reception ≠ truth

**Problem:** admitted content가 fact인가?  
**Alternatives:** A truth; B CourtRecord assertion  
**Failure modes:** A는 evidence truth laundering이다.  
**Recommendation:** truth/finding을 직접 변경하지 않는다.  
**Status:** Core Accepted candidate  
**Reason:** CourtFactFinding은 downstream이다.

### DFT24 — Filed ≠ served

**Problem:** filing과 service가 같은가?  
**Alternatives:** A same; B separate action/result  
**Failure modes:** A는 recipient state를 날린다.  
**Recommendation:** service가 필요할 경우 별도 procedural action으로 둔다.  
**Status:** Accepted candidate  
**Reason:** exact Korean service는 TBD다.

### DFT25 — Explicit CourtRecord materialization

**Problem:** 어떤 artifact가 CourtRecord에 들어가는가?  
**Alternatives:** A Draft/submit auto; B accepted artifact + rule  
**Failure modes:** A는 court bypass다.  
**Recommendation:** ProcedurallyAcceptedArtifact와 explicit inclusion rule을 요구한다.  
**Status:** Core Accepted candidate  
**Reason:** firm/court 경계를 닫는다.

### DFT26 — CourtRecord assertion ≠ finding

**Problem:** recorded pleading X가 fact X인가?  
**Alternatives:** A yes; B assertion only  
**Failure modes:** A는 adversarial claim을 truth로 만든다.  
**Recommendation:** CourtRecordEntry와 CourtFactFinding을 분리한다.  
**Status:** Core Accepted candidate  
**Reason:** DEC-013/014를 보존한다.

### DFT27 — Amendment preserves history

**Problem:** amendment가 과거를 삭제하는가?  
**Alternatives:** A replace history; B current projection + lineage  
**Failure modes:** A는 procedural timeline을 왜곡한다.  
**Recommendation:** old filing과 amendment relation을 보존한다.  
**Status:** Core Accepted candidate  
**Reason:** auditability에 필요하다.

### DFT28 — Withdrawal preserves history

**Problem:** withdrawal이 never existed인가?  
**Alternatives:** A delete; B status/event  
**Failure modes:** A는 제출 이력을 지운다.  
**Recommendation:** withdrawal event와 artifact history를 보존한다.  
**Status:** Core Accepted candidate  
**Reason:** 법적 효과는 TBD다.

### DFT29 — Supersession preserves lineage

**Problem:** later filing이 old filing을 rewrite하는가?  
**Alternatives:** A overwrite; B supersedes relation  
**Failure modes:** A는 version causality를 없앤다.  
**Recommendation:** superseded artifact를 역사에 남긴다.  
**Status:** Core Accepted candidate  
**Reason:** current와 history를 구분한다.

### DFT30 — Partner approval ≠ correctness

**Problem:** senior approval이 truth/acceptance인가?  
**Alternatives:** A epistemic authority; B organizational authorization  
**Failure modes:** A는 seniority laundering이다.  
**Recommendation:** approval을 workflow authority로만 둔다.  
**Status:** Core Accepted candidate  
**Reason:** truth/law/procedure와 분리한다.

### DFT31 — Client approval ≠ correctness

**Problem:** client approval이 legal/factual validation인가?  
**Alternatives:** A yes; B workflow input  
**Failure modes:** A는 client narrative를 truth로 만든다.  
**Recommendation:** approval을 별도 organizational state로 둔다.  
**Status:** Core Accepted candidate  
**Reason:** client system은 TBD다.

### DFT32 — Direct/delegated same ontology

**Problem:** NPC drafting을 percent engine으로 둘 것인가?  
**Alternatives:** A hidden score; B same Task/WorkProduct  
**Failure modes:** A는 explainability를 잃는다.  
**Recommendation:** 두 경로에 동일 ontology를 사용한다.  
**Status:** Core Accepted candidate  
**Reason:** solo-to-firm scaling을 지원한다.

### DFT33 — No universal DraftingScore

**Problem:** one score가 문서를 지배하는가?  
**Alternatives:** A DraftingScore; B components/defects  
**Failure modes:** A는 heterogeneous quality를 숨긴다.  
**Recommendation:** universal score를 semantic authority로 금지한다.  
**Status:** Core Accepted candidate  
**Reason:** structured outputs을 유지한다.

### DFT34 — Exceptional lawyer ≠ procedural oracle

**Problem:** 최고 능력이 모든 오류/거절을 막는가?  
**Alternatives:** A guarantee; B bounded contribution  
**Failure modes:** A는 rule와 uncertainty를 무시한다.  
**Recommendation:** capability를 task component에만 기여시킨다.  
**Status:** Core Accepted candidate  
**Reason:** acceptance/판단 보증이 아니다.

### DFT35 — Materialized result / no reroll

**Problem:** borderline result를 reload마다 바꿀 것인가?  
**Alternatives:** A reroll; B one event  
**Failure modes:** A는 save-scumming과 history inconsistency다.  
**Recommendation:** SubmissionResultEvent를 한 번 materialize한다.  
**Status:** Core Accepted candidate  
**Reason:** DEC-018 determinism을 상속한다.

### DFT36 — Cure/resubmission new attempt

**Problem:** 거절 후 reload/overwrite로 고칠 것인가?  
**Alternatives:** A mutate attempt; B new draft/attempt  
**Failure modes:** A는 failure history를 삭제한다.  
**Recommendation:** Correction Task와 새 SubmissionAttempt를 만든다.  
**Status:** Core Accepted candidate  
**Reason:** causal lineage를 보존한다.

### DFT37 — No future procedural outcome leak

**Problem:** attempt 전 결과를 보여줄 것인가?  
**Alternatives:** A hidden preview; B only known/materialized status  
**Failure modes:** A는 hidden outcome oracle이다.  
**Recommendation:** legitimately known warning 외 future result를 숨긴다.  
**Status:** Core Accepted candidate  
**Reason:** player-facing epistemic boundary다.

## 12. Recommended reference models

```text
DraftWorkProduct
├─ Task / assignment / performer refs
├─ authorized Case File snapshot / selected theory / arguments
├─ typed factual and legal claim refs
├─ sections / relief / citations / placeholders
├─ attachment package refs
├─ review comments / defects / unresolved gaps
└─ version / provenance / history

SubmissionAttempt
├─ document/version / submitter / target / route / time
├─ attachments / metadata / deadline context
├─ materialized result / known reason
└─ amendment / withdrawal / supersession lineage
```

## 13. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | Drafting is explicit Task family | **Core Accepted candidate** |
| 2 | Draft ≠ FinalizedDocument | **Core Accepted candidate** |
| 3 | Finalized ≠ Submitted | **Core Accepted candidate** |
| 4 | Submitted ≠ Filed | **Core Accepted candidate** |
| 5 | Filed ≠ Accepted where distinguished | **Core Accepted candidate** |
| 6 | Accepted ≠ CourtFactFinding | **Core Accepted candidate** |
| 7 | Draft assertion ≠ truth | **Core Accepted candidate** |
| 8 | Draft uses authorized Case File only | **Core Accepted candidate** |
| 9 | ActualStateRecord unavailable | **Core Accepted candidate** |
| 10 | Hidden legal model unavailable | **Core Accepted candidate** |
| 11 | Draft preserves claim/source provenance | **Core Accepted candidate** |
| 12 | Draft may be wrong | **Core Accepted candidate** |
| 13 | Draft may omit known material | **Core Accepted candidate** |
| 14 | Draft does not mutate Case File truth | **Core Accepted candidate** |
| 15 | Draft does not rewrite source | **Core Accepted candidate** |
| 16 | Review is explicit | **Core Accepted candidate** |
| 17 | Review may miss defect | **Core Accepted candidate** |
| 18 | Review completed ≠ error-free | **Core Accepted candidate** |
| 19 | Revision preserves prior draft | **Core Accepted candidate** |
| 20 | Finalization is organizational state | **Core Accepted candidate** |
| 21 | SubmissionAttempt explicit | **Core Accepted candidate** |
| 22 | Submission preserves document version | **Core Accepted candidate** |
| 23 | Strong argument ≠ accepted filing | **Core Accepted candidate** |
| 24 | Weak argument ≠ rejected filing | **Core Accepted candidate** |
| 25 | Procedural validity ≠ substantive strength | **Core Accepted candidate** |
| 26 | Deadline status requires explicit rule/context | **Core Accepted candidate** |
| 27 | Attachment reference ≠ inclusion | **Core Accepted candidate** |
| 28 | Attachment inclusion ≠ admission | **Core Accepted candidate** |
| 29 | Admission/reception ≠ truth | **Core Accepted candidate** |
| 30 | Filing ≠ service | **Core Accepted candidate** |
| 31 | Service ≠ agreement | **Core Accepted candidate** |
| 32 | CourtRecord requires explicit materialization | **Core Accepted candidate** |
| 33 | Draft cannot directly enter CourtRecord | **Core Accepted candidate** |
| 34 | Submission cannot auto-enter CourtRecord | **Core Accepted candidate** |
| 35 | CourtRecord assertion ≠ fact finding | **Core Accepted candidate** |
| 36 | Amendment preserves history | **Core Accepted candidate** |
| 37 | Withdrawal preserves history | **Core Accepted candidate** |
| 38 | Supersession preserves lineage | **Core Accepted candidate** |
| 39 | Parallel drafts remain separate | **Core Accepted candidate** |
| 40 | Merge requires explicit work | **Core Accepted candidate** |
| 41 | Partner approval ≠ truth | **Core Accepted candidate** |
| 42 | Partner approval ≠ filing acceptance | **Core Accepted candidate** |
| 43 | Client approval ≠ truth/correctness | **Core Accepted candidate** |
| 44 | Direct/delegated same ontology | **Core Accepted candidate** |
| 45 | No universal DraftingScore | **Core Accepted candidate** |
| 46 | No hidden weighted formula | **Core Accepted candidate** |
| 47 | Exceptional lawyer ≠ error-free oracle | **Core Accepted candidate** |
| 48 | Clear procedural results deterministic | **Core Accepted candidate** |
| 49 | Borderline result materialized once | **Core Accepted candidate** |
| 50 | Reload does not reroll | **Core Accepted candidate** |
| 51 | Cure/resubmission creates new attempt | **Core Accepted candidate** |
| 52 | Old rejected attempt remains historical | **Core Accepted candidate** |
| 53 | Hidden future result not player-visible | **Core Accepted candidate** |
| 54 | Filing does not directly modify JII | **Core Accepted candidate** |
| 55 | Filing does not directly modify CourtFactFinding | **Core Accepted candidate** |

## 14. Pressure tests

| Case | Fixture | Expected semantic result |
|---:|---|---|
| 1 | Basic Draft creation | authorized refs로 Draft D1 생성; filing 아님; no truth/court/history collapse |
| 2 | Draft from CaseTheory | CT-A ref와 assumptions 보존; no truth/court/history collapse |
| 3 | Draft from Argument | ARG-A selected ≠ correct/filed; no truth/court/history collapse |
| 4 | Draft assertion from Statement | S1 lineage 보존; fact 아님; no truth/court/history collapse |
| 5 | Draft assertion truth-laundering attack | draft claim을 truth로 승격 금지; no truth/court/history collapse |
| 6 | Draft uses ProfessionalAnalysis | PA type 유지; no truth/court/history collapse |
| 7 | Hidden ActualStateRecord correction attack | hidden fact로 자동 수정 금지; no truth/court/history collapse |
| 8 | Hidden legal-model correction attack | hidden law로 자동 citation 수정 금지; no truth/court/history collapse |
| 9 | Source March 14 / Draft March 4 | source unchanged; mistaken draft 가능; no truth/court/history collapse |
| 10 | Draft omits weak source | omission 허용; Case File unchanged; no truth/court/history collapse |
| 11 | Draft omits contradiction | 전략/오류 가능; knowledge 삭제 아님; no truth/court/history collapse |
| 12 | Strategic omission ≠ Case File deletion | omitted refs remain; no truth/court/history collapse |
| 13 | Draft v1/v2 | versions separate; no truth/court/history collapse |
| 14 | Revision overwrite attack | v1 삭제 금지; no truth/court/history collapse |
| 15 | Factual review | explicit review Task/comments; no truth/court/history collapse |
| 16 | Legal citation review | fallible citation review; no truth/court/history collapse |
| 17 | Procedural review | fixture rule scope; no truth/court/history collapse |
| 18 | Reviewer misses defect | valid fallible outcome; no truth/court/history collapse |
| 19 | Exceptional reviewer misses defect | capability no guarantee; no truth/court/history collapse |
| 20 | Review complete=error-free attack | forbidden; no truth/court/history collapse |
| 21 | Finalization | ready state only; no truth/court/history collapse |
| 22 | Finalized=Submitted attack | forbidden; no truth/court/history collapse |
| 23 | SubmissionAttempt | version/actor/target/time preserved; no truth/court/history collapse |
| 24 | Submitted=Accepted attack | forbidden; no truth/court/history collapse |
| 25 | Strong argument / procedural defect | merits do not cure supplied defect; no truth/court/history collapse |
| 26 | Weak argument / procedurally valid | weakness does not cause hidden rejection; no truth/court/history collapse |
| 27 | Missing required attachment fixture | only supplied requirement yields defect; no truth/court/history collapse |
| 28 | Attachment referenced not included | reference does not materialize file; no truth/court/history collapse |
| 29 | Attachment included | package relation only; no truth/court/history collapse |
| 30 | Included=admitted attack | forbidden; no truth/court/history collapse |
| 31 | Admitted=truth attack | forbidden; no truth/court/history collapse |
| 32 | Deadline miss fixture | only supplied deadline rule applied; no truth/court/history collapse |
| 33 | Pending submission | pending is valid state; no truth/court/history collapse |
| 34 | Rejected submission | structured reason/history; no truth/court/history collapse |
| 35 | Defective submission | requirement/version refs preserved; no truth/court/history collapse |
| 36 | Wrong target fixture | supplied target rule may reject; no truth/court/history collapse |
| 37 | Filed but not served | states separate; no truth/court/history collapse |
| 38 | Served but disputed | service ≠ agreement; no truth/court/history collapse |
| 39 | Procedurally accepted artifact | acceptance ≠ correctness; no truth/court/history collapse |
| 40 | Accepted artifact to CourtRecord | explicit materialization rule required; no truth/court/history collapse |
| 41 | Draft to CourtRecord attack | forbidden; no truth/court/history collapse |
| 42 | Submission to CourtRecord attack | forbidden absent rule; no truth/court/history collapse |
| 43 | CourtRecord assertion to FactFinding attack | forbidden; no truth/court/history collapse |
| 44 | Filing amendment | old filing retained; no truth/court/history collapse |
| 45 | Withdrawal | historical existence retained; no truth/court/history collapse |
| 46 | Superseded filing | lineage retained; no truth/court/history collapse |
| 47 | Parallel drafts | separate WorkProducts; no truth/court/history collapse |
| 48 | Auto-merge attack | forbidden; no truth/court/history collapse |
| 49 | Explicit draft merge | new child with parents; no truth/court/history collapse |
| 50 | Partner approval | organizational only; no truth/court/history collapse |
| 51 | Client approval | truth/correctness 아님; no truth/court/history collapse |
| 52 | Direct player drafting | shared ontology; no truth/court/history collapse |
| 53 | Delegated drafting | same ontology, no percent engine; no truth/court/history collapse |
| 54 | Hidden DraftingScore engine | invalid semantic authority; no truth/court/history collapse |
| 55 | Reload reroll of SubmissionResult | materialized result reused; no truth/court/history collapse |
| 56 | Procedural/substantive laundering attack | acceptance does not validate argument/facts; no truth/court/history collapse |
| 57 | Strong merits bypass procedure attack | supplied defect remains unless cure rule; no truth/court/history collapse |
| 58 | Weak merits rejection laundering attack | hidden merits rejection forbidden; no truth/court/history collapse |
| 59 | Finalized-document auto-filing attack | explicit SubmissionAttempt required; no truth/court/history collapse |
| 60 | Filing-history erasure attack | rejected v1 retained after accepted v2; no truth/court/history collapse |

### Special Case 56 — Procedural/substantive laundering attack

Procedurally accepted document의 Argument와 asserted facts를 true로 설정하는 것은 금지한다. Acceptance는 supplied procedural condition의 결과이며 legal correctness, factual truth 또는 judge persuasion이 아니다.

### Special Case 57 — Strong merits bypass procedure attack

Strong-looking Argument가 fixture-declared required field를 누락했다. Explicit cure rule이 없다면 merits는 defect를 제거하지 않는다. 이 DEC는 실제 required field를 발명하지 않는다.

### Special Case 58 — Weak merits rejection laundering attack

Weak-looking Argument가 fixture-declared procedural requirements를 충족했다. Explicit content-based reception rule 없이 hidden merits evaluation으로 reject할 수 없다.

### Special Case 59 — Finalized-document auto-filing attack

Partner가 D7을 finalization해도 FiledArtifact는 생성되지 않는다. 별도 SubmissionAttempt와 procedural result가 필요하다.

### Special Case 60 — Filing-history erasure attack

Draft v1 submission/rejection 후 v2 correction/acceptance가 발생해도 v1, rejection reason, first attempt와 downstream correction lineage는 보존된다.

## 15. Draft/source pressure test

E10 says May 14 while D1 says May 4. E10 stays unchanged; D1 may be mistaken; review may challenge it; D2 may correct it; D1 and analyses/actions depending on it remain historical. Exact error frequency/correction workflow is TBD.

## 16. Argument/procedure pressure test

ARG-A may look persuasive while a fixture-declared field is missing; supplied procedure governs the result. ARG-B may look weak but satisfy procedure. Neither result decides substantive truth or judge acceptance.

## 17. Attachment pressure test

Text `See Exhibit 4` does not include Exhibit 4. Only explicit package membership does. A fixture-declared requirement may yield defect; this DEC does not invent the requirement.

## 18. CourtRecord pressure test

```text
Draft → Finalized → SubmissionAttempt → ProceduralAcceptance
→ explicit CourtRecord materialization rule → CourtRecordEntry
CourtRecordEntry says X ≠ CourtFactFinding X
```

## 19. Amendment/history pressure test

D1 filed → D2 amends → D3 supersedes → D3 withdrawn. 모든 artifact, attempt, acceptance/rejection, relation과 time을 보존한다. current procedural projection과 history를 구분한다.

## 20. Direct/delegated pressure test

동일 DraftingTaskDefinition에서 direct/delegated paths는 inputs, arguments, Draft, versions, review, finalization, SubmissionAttempt, result와 history ontology를 공유한다. `NPC DraftQuality=91 → auto accepted`는 금지한다.

## 21. Cross-case invariant matrix

| Boundary family | Tested in | Result | Note |
|---|---|---|---|
| Draft/finalized/submitted/filed/accepted separation | 1–6, 21–24, 39–43, 56–59 | PASS candidate | explicit stages |
| Authorized input / no hidden correction | 2–9 | PASS candidate | no truth/law oracle |
| Provenance/error/omission/version | 3–20, 44–49, 60 | PASS candidate | immutable history |
| Procedure ≠ substance | 24–26, 32–40, 56–58 | PASS candidate | supplied rules only |
| Attachment/admission/truth | 27–31, 39–43 | PASS candidate | no materialization shortcut |
| Filing/service | 37–38 | PASS candidate | distinct actions |
| Collaboration/approval/capability | 47–54 | PASS candidate | no scores/oracles |
| Event/no reroll/cure | 34–36, 55, 60 | PASS candidate | materialized results |
| CourtRecord/JII/finding | 39–46, 56 | PASS candidate | downstream only |

## 22. Contradiction audit

Draft/truth, Draft/Case File, state-stage, procedural/substantive, merits/procedure, attachment/inclusion/admission/truth, filing/service, source mutation, hidden correction, perfect review, overwrite, auto-merge, approval/correctness, CourtRecord/finding, amendment/withdrawal loss, reroll, future outcome, DraftingScore와 fabricated Korean procedure를 모두 금지한다. inherited decisions와 내부 모순은 발견되지 않았다.

## 23. False-PASS / False-PARTIAL audit

PASS를 위해 Korean forms, deadlines, jurisdiction, mandatory attachments, service/admission/acceptance rules, substantive correctness 또는 judge reaction을 발명하지 않는다. 정확한 catalog/API/UI/capability가 TBD인 것만으로 PARTIAL을 주지 않는다. semantic separation이 불명확할 때만 PARTIAL이다.

## 24. Explicit TBD

- exact document taxonomy
- Korean pleading/form requirements and deadlines
- filing/service/procedural defect rules
- admission/reception and exhibit rules
- signature/authorization and client approval requirements
- Drafting/Review capability mapping
- document text generation
- UI/editor and NPC AI
- CourtRecord materialization specifics
- save/schema/API/Godot
- balancing/performance

## 25. Risks / anti-patterns

| Failure condition | Why harmful | Mitigation direction |
|---|---|---|
| Draft instantly becomes filing | player agency와 procedural chain 삭제 | explicit states/actions |
| Filing instantly becomes CourtRecord | court boundary bypass | accepted artifact + rule gate |
| Filed assertion becomes fact | truth laundering | CourtRecord assertion/finding separation |
| Merits determine procedural acceptance | procedure/substance collapse | supplied procedural rules only |
| Procedural defect determines substantive truth | false epistemic inference | independent dimensions |
| Source rewritten by draft | provenance corruption | immutable source + draft assertion |
| Perfect reviewers | capability oracle | fallible scoped review |
| Strongest lawyer auto-valid filing | rule bypass | component contribution only |
| Attachment references auto-materialize | unavailable artifact creation | explicit package membership |
| Client/partner approval becomes correctness | authority laundering | organizational status only |
| Amendment overwrites history | audit loss | version lineage |
| Rejected attempts disappear | causal history loss | attempt events preserved |
| Filing save-scumming | determinism break | materialized result |
| Procedural simulation overload | player burden | bounded task/detail projections |
| Document text busywork | strategy obscured | structured claims/templates, exact UI TBD |
| Fabricated Korean procedure | false legal claim | generic interface + content TBD |
| Hidden judge reaction leak | future-state oracle | court feedback only through valid events |

## 25.1 Player-facing principle

Player should see Draft status/version, source and Argument basis, unresolved placeholders, review comments/defects, finalization, SubmissionAttempt, known procedural result, attachment package, deadline/dependency and amendment/withdrawal history.

Player should not see an unmaterialized future filing result, hidden judge reaction, guaranteed persuasion, factual truth badge, future CourtFactFinding or fabricated legal requirement.

## 26. Solo → firm progression

```text
Solo → player drafts/reviews
Associate → delegated first drafts
Senior → review/revision
Support staff → permitted package/admin preparation
Larger firm → parallel pipelines
Partner/player → strategy approval and submission authority
```

이는 supported architecture이며 실제 한국 role restriction을 주장하지 않는다.

## 27. Suggested TEST-024 plan

`TEST-024_DRAFTING_PLEADING_AND_FILING.md`에서 위 Case 1–60을 manual semantic fixtures로 검증한다. TEST-024는 이 DEC에서 생성하지 않는다.

## 28. DEC-026 candidates

Task Assignment / Workload / Team Coordination, Client Interaction / Advice, Witness Preparation / Court Examination, Settlement / Negotiation, Hearing / Oral Advocacy를 비교한다. 다수 Task family가 축적되었으므로 default는 **DEC-026 — Task Assignment / Workload / Team Coordination**이다. courtroom content보다 operational/team scaling prerequisite가 현재 더 강하다.

## 29. Decision summary

### Inherited Accepted

ActualStateRecord/Case File/CourtRecord/Finding separation, typed provenance, Task/WorkProduct resolution, version history, CaseTheory/Argument truth boundaries와 no-reroll을 상속한다.

### Core Accepted candidates

DFT1–DFT23 및 DFT25–DFT37: explicit drafting/review/submission states, truth/access/provenance, procedural/substantive, CourtRecord, history, capability/event boundaries.

### Accepted candidates

DFT24: generic filing/service separation, exact service doctrine는 TBD.

### TBD

§24의 taxonomy, Korean procedure, algorithms, UI, AI, schema와 balancing.

### Forbidden

- Draft/finalized/submitted/filed/accepted/CourtRecord/finding collapse.
- hidden truth/law correction, procedural/substantive laundering, attachment auto-materialization.
- perfect review, DraftingScore, capability/seniority/client oracle, history deletion, reload reroll.
- explicit procedural rule 없는 CourtRecord/JII/finding mutation 또는 future outcome leak.

## 30. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | DFT1–DFT37, 55 invariants and 60 pressure fixtures establish drafting, review, finalization, submission, procedural reception and explicit CourtRecord materialization boundaries without Korean procedural claims. |
