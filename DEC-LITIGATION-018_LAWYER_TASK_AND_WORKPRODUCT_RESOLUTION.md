# THE FIRM — Lawyer Task & WorkProduct Resolution 최소 모델

문서 ID: DEC-LITIGATION-018  
버전: v0.2 — Accepted  
상태: **Accepted**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
상위 기준: [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) v0.2, [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) v0.2  
시스템 기준: [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) v0.2  
직접 Accepted 기준: [DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](DEC-LITIGATION-013_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md) v0.2 Accepted  
직접 proposed/verified 기준: [DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](DEC-LITIGATION-014_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md) v0.1 Proposed, [DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md](DEC-LITIGATION-015_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md) v0.1 Proposed, [DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md](DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md) v0.1 Proposed, [DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md](DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md) v0.1 Proposed  
검증 참고: [TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md](TEST-012_JUDGE_INTERPRETATION_AND_JUDICIAL_PROFILE.md), [TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md](TEST-013_CRITERION_CHOICE_POINT_AUTHORING_AND_VALIDATION.md), [TEST-014_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md](TEST-014_JUDGE_GENERATION_CAREER_AND_LIFECYCLE.md), [TEST-015_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md](TEST-015_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md), [TEST-016_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md](TEST-016_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md)

## 1. Purpose / boundary

이 문서는 lawyer 또는 legal support staff가 assigned Task를 수행할 때 capability, available information, time, resources, instructions와 operational context가 explicit structured WorkProduct로 materialize되는 minimum semantic framework를 제안한다.

```text
CaseFileState
+ TaskDefinition
+ TaskAssignment
+ PerformerRole / ProfileVersion
+ AvailableInformation
+ Time / Resources / Capacity
+ Player or NPC Direction
+ Prior WorkProducts / Dependencies
+ Materialized TaskExecutionEvents
→ Task Resolution
→ structured WorkProduct
→ Case File update and/or explicit procedural materialization
→ existing Litigation systems
```

Goals:

1. Case 안의 actual work를 explicit Tasks로 표현한다.
2. Task가 inputs, eligible role, capability contributions, scope, demands, dependencies와 output type을 선언하게 한다.
3. Difficulty와 quality를 universal numbers로 축소하지 않는다.
4. Multiple capabilities를 separate WorkProduct components에 연결한다.
5. Direct player work와 delegated staff work가 같은 semantics를 사용한다.
6. Solo practice부터 firm delegation/parallel work/review까지 한 framework로 연결한다.
7. Lawyers와 support staff를 one power ladder가 아닌 distinct performer roles로 취급한다.
8. Review/revision, dependencies와 partial outputs를 explicit work history로 만든다.
9. Clear results are deterministic; permitted borderline variation is bounded and materialized once.
10. Case File, WorkProduct와 CourtRecord를 분리한다.

### 1.1 Non-goals

이 문서는 every task-specific algorithm, actual Korean legal-role boundary, investigation/evidence discovery, legal research, witness examination, drafting, filing, negotiation, dialogue/minigame, AI, Case File UI, scheduler, schema/API/save 또는 Godot implementation을 확정하지 않는다.

### 1.2 Decision markers

| Marker | Meaning |
|---|---|
| **Accepted / Core Accepted** | Prior DEC의 accepted boundary |
| **Accepted candidate** | Review에서 채택을 추천하는 common task/work semantic |
| **Core Accepted candidate** | 모든 task type이 보존해야 할 causal/deterministic boundary |
| **TBD** | Task-specific content, algorithm, vocabulary or implementation |
| **Forbidden** | Hidden score, reroll, direct legal effect 또는 boundary collapse |

## 2. Inherited hard guardrails

DEC-017/TEST-016에서 다음을 상속한다.

- Capability never directly changes JII, ChoicePoint, credibility, sufficiency, finding, favorability or final outcome.
- Capability cannot create evidence, missing scope, requirements or unavailable information.
- Required path is capability → assigned task → execution → WorkProduct → explicit valid materialization → existing Litigation.
- Internal WorkProduct is not judicial input merely because it exists.
- Capability, specialization, reputation, workload and player-observed profile remain separate dimensions.
- Profile evolution and past versions remain immutable/historical.
- TEST-016 deliberately left exact task resolution, multi-capability combination, WorkProduct quality, workload and coordination **TBD**.

DEC-013/014 remain authoritative for hard-first fact finding, allowed record, CriterionChoicePoint and explicit JII. DEC-015/016 remain the identity/history/role/profile boundary. DEC-014~017 are still Proposed despite fixture verification; this document does not promote them.

## 3. Case / Case File / Task / WorkProduct distinction

| Concept | Minimum meaning | Must not own |
|---|---|---|
| `Case` | 전체 matter/litigation identity and lifecycle | One task result or one global strength |
| `CaseFileState` | Source docs, evidence/witness/chronology/issues, pleadings, research, tasks and WorkProduct refs의 organized knowledge snapshot | Judicial truth or automatic CourtRecord |
| `Task` | Assigned performer가 defined scope/context에서 수행하는 explicit work unit | Entire case outcome |
| `WorkProduct` | Task execution에서 나온 structured artifact with coverage, gaps, links, defects, risks and provenance | Automatic CourtRecord/finding |
| `CourtRecord` | Existing litigation/procedure rules가 received/allowed한 stage-bound record | Internal notes or all Case File knowledge |

Illustrative Tasks include document organization, chronology assembly, evidence review, legal research, issue analysis, witness/examination preparation, drafting, review, filing preparation and settlement analysis. The list is not canonical.

## 4. Design decisions

## 4.1 TWR1 — Task as explicit work unit

**문제:** Case를 one resolution unit으로 처리할 것인가?  
**Alternatives:** A) whole-case roll—simple but erases work causality; B) implicit UI actions—flexible but untraceable; C) multiple explicit Tasks—structured and delegable.  
**추천안:** Case owns/references multiple Tasks, each with performer, scope, inputs, outputs and dependencies.  
**상태:** **Core Accepted candidate.**  
**이유:** Solo work, delegation, review and parallelism need the same auditable unit.

## 4.2 TWR2 — TaskDefinition minimum semantics

**문제:** A Task type must declare what?  
**Alternatives:** A) name only—insufficient; B) universal difficulty number—semantic collapse; C) purpose, inputs, roles, contributions, scope, demands, dependencies, completion and outputs.  
**추천안:** Use C as the semantic minimum; fields may vary by task family.  
**상태:** **Core Accepted candidate** for dimensions; canonical schema **TBD**.  
**이유:** Resolution cannot be explained without its declared requirements and output boundary.

## 4.3 TWR3 — Performer-role eligibility

**문제:** Are support staff merely low-stat lawyers?  
**Alternatives:** A) one power ladder—role authority collapse; B) lawyer-only everything—blocks delegation; C) distinct eligible role categories per Task.  
**추천안:** TaskDefinition declares eligible performer roles. Support staff may handle permitted organization/support tasks; lawyer-required tasks reject incompatible assignment.  
**상태:** **Core Accepted candidate.** Actual Korean role boundaries/catalog **TBD**.  
**이유:** Role eligibility is semantic authority, not skill magnitude.

## 4.4 TWR4 — Direct and delegated execution share one system

**문제:** Should player work and NPC delegation have separate engines?  
**Alternatives:** A) separate engines—divergent rules/exploits; B) delegated work as instant bonus—no trace; C) same Task/WorkProduct model with different direction/execution inputs.  
**추천안:** Direct and delegated execution resolve the same TaskDefinition and output structure.  
**상태:** **Core Accepted candidate.** UI/AI mechanics **TBD**.  
**이유:** Firm growth changes control source, not semantic reality.

## 4.5 TWR5 — Execution input model

**문제:** Is performer capability sufficient input?  
**Alternatives:** A) profile only—auto-success; B) profile+difficulty roll—overcompression; C) explicit context bundle.  
**추천안:** Resolution consumes TaskDefinition/Assignment, role/profile version, available information, Case File snapshot, prior WorkProducts, time/resources/capacity, direction, dependencies and materialized events.  
**상태:** **Core Accepted candidate.** Exact required subsets are task-specific **TBD**.  
**이유:** Output must reflect actual operational circumstances.

## 4.6 TWR6 — Structured task demands

**문제:** Can `Task Difficulty = 82` be canonical meaning?  
**Alternatives:** A) one number—false comparability; B) prose only—hard to route; C) task-relevant structured demand dimensions.  
**추천안:** Possible dimensions include volume, information complexity, cross-reference density, specialist knowledge, ambiguity, time pressure, completeness, coordination burden and procedural sensitivity.  
**상태:** **Core Accepted candidate** for structured demands; taxonomy **TBD**.  
**이유:** Different difficulty causes produce different WorkProduct gaps.

## 4.7 TWR7 — No universal skill-vs-difficulty roll

**문제:** Should `skill 84 − difficulty 78 = success` resolve all tasks?  
**Alternatives:** A) universal roll—easy but hidden/flat; B) task-specific structured resolution—explainable; C) pure authored result—limited simulation.  
**추천안:** Reject A as canonical semantics; task-specific component rules use declared inputs.  
**상태:** **Core Accepted candidate**; universal roll **Forbidden**.  
**이유:** Scope, resources, defects and partial results must survive resolution.

## 4.8 TWR8 — Component-based multi-capability contribution

**문제:** How do several capabilities affect one task?  
**Alternatives:** A) weighted sum—hidden total; B) highest/lowest shortcut—loses components; C) each capability contributes to declared WorkProduct components.  
**추천안:** Task rules map applicable capability/scope to components such as witness model, contradiction coverage, usable attack and sequence planning.  
**상태:** **Core Accepted candidate.** Exact mappings **TBD**.  
**이유:** Strengths and gaps remain traceable without overall arithmetic.

## 4.9 TWR9 — Task-specific resolution rules

**문제:** Can one universal algorithm cover all legal work?  
**Alternatives:** A) universal formula—semantic flattening; B) bespoke code without common contract—fragmentation; C) common framework plus versioned task-specific rules.  
**추천안:** Each task family declares capability/component, input/resource and possible-gap semantics within this framework.  
**상태:** **Accepted candidate.** All concrete algorithms **TBD**.  
**이유:** Research, indexing and examination do not share identical resolution needs.

## 4.10 TWR10 — Structured WorkProduct

**문제:** Is output a single quality score?  
**Alternatives:** A) score—compact but opaque; B) pass/fail—loses partial utility; C) structured result with scope, links, gaps, defects, risks and provenance.  
**추천안:** Structured content is authoritative; fields vary by WorkProduct type.  
**상태:** **Core Accepted candidate.** Vocabularies **TBD**.  
**이유:** Later tasks and players need to understand what is actually present or missing.

## 4.11 TWR11 — Optional summary quality band

**문제:** May UI summarize a complex WorkProduct?  
**Alternatives:** A) no summary—high reading cost; B) summary as authority—information loss; C) non-authoritative summary derived from structure.  
**추천안:** Labels such as incomplete/adequate/strong/precise may be projections but downstream logic cannot consume the label alone.  
**상태:** **Accepted candidate.** Vocabulary/derivation **TBD**.  
**이유:** Readability must not replace semantics.

## 4.12 TWR12 — No hidden overall WorkProduct number

**문제:** Can `WorkProductQuality = 78` own downstream meaning?  
**Alternatives:** A) canonical number—opaque threshold; B) structured result only; C) internal non-authoritative numeric aid plus structure.  
**추천안:** Structure remains source of truth. Any internal number is **TBD** and cannot replace it or directly affect litigation.  
**상태:** **Core Accepted candidate**; score-as-authority **Forbidden**.  
**이유:** Prevents quality-score collapse while leaving implementation freedom.

## 4.13 TWR13 — Structured defect causes

**문제:** Should gaps appear without reasons?  
**Alternatives:** A) unexplained bad roll—opaque; B) one generic failure—weak; C) causal reason refs.  
**추천안:** Preserve applicable causes such as capability/specialization mismatch, information/time/resource gap, overload, prioritization/direction, coordination/dependency failure or bounded uncertainty.  
**상태:** **Accepted candidate.** Canonical cause taxonomy **TBD**.  
**이유:** Defects become actionable rather than arbitrary punishment.

## 4.14 TWR14 — Capability does not guarantee output

**문제:** Does exceptional capability guarantee complete WorkProduct?  
**Alternatives:** A) yes—elite auto-success; B) random failure—arbitrary; C) explicit context constraints remain effective.  
**추천안:** Missing information/time/resources, wrong scope/direction, dependencies and coordination can bound output without mutating capability.  
**상태:** **Core Accepted candidate.**  
**이유:** Stable competence and situational deliverability are separate.

## 4.15 TWR15 — Deterministic default

**문제:** Do identical resolved task inputs reproduce semantic output?  
**Alternatives:** A) fresh roll every resolution—save-scumming; B) fully authored only; C) deterministic default using versioned/materialized inputs.  
**추천안:** Same TaskDefinition/Assignment/ProfileVersion/information/time/resources/direction/dependencies/materialized events yields the same semantic WorkProduct.  
**상태:** **Core Accepted candidate.** Semantic rather than byte identity.  
**이유:** Auditability and meaningful planning require reproducibility.

## 4.16 TWR16 — Borderline bounded variability

**문제:** Can execution variation exist without arbitrary task RNG?  
**Alternatives:** A) none ever—predictable but rigid; B) global random quality—opaque; C) only genuinely borderline declared component permits bounded variation.  
**추천안:** Clear component results remain deterministic. A task-specific rule may declare a bounded borderline choice/event; exact mechanism and probability are **TBD**.  
**상태:** **Accepted candidate.** Global quality roll or judicial/fact RNG **Forbidden**.  
**이유:** Limited execution uncertainty can exist without erasing hard inputs.

## 4.17 TWR17 — Variation must materialize

**문제:** How is a permitted borderline result preserved?  
**Alternatives:** A) recompute random each read—reroll; B) store final score only—reason loss; C) immutable `TaskExecutionEvent` with target/reason/result refs.  
**추천안:** Variation is resolved once and materialized before WorkProduct resolution; the event becomes an explicit input.  
**상태:** **Core Accepted candidate.** Event-generation mechanics **TBD**.  
**이유:** Replay uses the same world fact rather than consuming new randomness.

## 4.18 TWR18 — No save-scum reroll

**문제:** May reload change a materialized task outcome?  
**Alternatives:** A) reroll—save-scumming; B) lock forever including new work—too rigid; C) same event persists; rework is a new Task/event.  
**추천안:** Reload/read does not reroll. Re-execution requires explicit rework/review with new authorized inputs.  
**상태:** **Core Accepted candidate.**  
**이유:** Persistence distinguishes meaningful new work from retrying the dice.

## 4.19 TWR19 — Player direct execution

**문제:** What enters resolution when player works directly?  
**Alternatives:** A) player avatar stat only—flat; B) unrelated minigame score—semantic split; C) explicit choices/direction encoded as task inputs.  
**추천안:** Document selection, priorities, issue links, theory, questioning direction, resources and review depth may become explicit inputs.  
**상태:** **Accepted candidate.** UI/minigame details **TBD**.  
**이유:** Player agency changes work causally, not through a separate cheat engine.

## 4.20 TWR20 — Delegated execution

**문제:** How is staff work resolved?  
**Alternatives:** A) instant passive bonus; B) separate simplified engine; C) same Task inputs with assigned profile and player/NPC direction.  
**추천안:** Delegated execution creates the same WorkProduct structure and trace.  
**상태:** **Core Accepted candidate.** NPC AI **TBD**.  
**이유:** Delegation changes who supplies direction/execution, not rules.

## 4.21 TWR21 — Firm-growth delegation depth

**문제:** Can one task model support solo and large firm play?  
**Alternatives:** A) hard phase replacement—breaks continuity; B) player always does all work—no scale; C) increasing delegation/parallel/review depth.  
**추천안:** Solo manual work, support delegation, associate preparation and partner review are supported architectures, not forced progression.  
**상태:** **Accepted candidate.** Staffing/progression rules **TBD**.  
**이유:** Same semantics scale with firm growth.

## 4.22 TWR22 — Review is a Task

**문제:** Is review a free perfect action?  
**Alternatives:** A) instant fix—no cost/trace; B) overwrite original—history loss; C) explicit Review Task consuming prior WorkProduct.  
**추천안:** Review has reviewer profile, scope, time/resources and produces ReviewWorkProduct or revised version.  
**상태:** **Core Accepted candidate.**  
**이유:** Quality improvement remains causal and schedulable.

## 4.23 TWR23 — Review does not guarantee correction

**문제:** Does reviewer presence remove every defect?  
**Alternatives:** A) yes—omniscient review; B) random fix count; C) review is constrained like any Task.  
**추천안:** Scope, time, capability, information and direction bound what review identifies/corrects.  
**상태:** **Core Accepted candidate.** Effectiveness algorithm **TBD**.  
**이유:** Review is meaningful work, not magic cleansing.

## 4.24 TWR24 — Task dependencies

**문제:** Can tasks depend on prior or parallel work?  
**Alternatives:** A) isolated tasks—ignores prerequisites; B) universal linear chain—rigid; C) explicit required/optional dependency graph.  
**추천안:** TaskDefinition/Assignment references required or optional Tasks/WorkProducts; independent branches may execute in parallel.  
**상태:** **Core Accepted candidate.** Scheduler/merge semantics **TBD**.  
**이유:** Legal work is a graph, not one roll or fixed checklist.

## 4.25 TWR25 — No universal fixed workflow

**문제:** Should every case use one Step 1→N pipeline?  
**Alternatives:** A) fixed workflow—easy but ignores matter shape; B) no dependency structure—chaotic; C) content-defined graph under common semantics.  
**추천안:** Cases instantiate only relevant Tasks/dependencies.  
**상태:** **Core Accepted candidate.** Workflow authoring **TBD**.  
**이유:** Different cases demand different investigation, analysis and preparation.

## 4.26 TWR26 — Case File update

**문제:** How can WorkProduct change organized case knowledge?  
**Alternatives:** A) never—work has no persistent effect; B) mutate CourtRecord directly—boundary violation; C) explicit Case File update with provenance.  
**추천안:** WorkProduct may add/refine links, issues, chronology, task refs or internal knowledge in Case File; CourtRecord materialization remains separate.  
**상태:** **Core Accepted candidate.** Update/conflict rules **TBD**.  
**이유:** Case preparation accumulates without becoming judicial truth.

## 4.27 TWR27 — Internal WorkProduct ≠ CourtRecord

**문제:** Does an internal memo/plan automatically enter judicial evaluation?  
**Alternatives:** A) yes—hidden/unsubmitted leakage; B) never materializes—blocks filings; C) explicit existing procedure-facing gate.  
**추천안:** Research memo, plans and drafts remain internal unless submission/reception/allowance rules create a record-facing artifact.  
**상태:** **Core Accepted** inherited / **Core Accepted candidate** reaffirmed.  
**이유:** Preserves allowed-record-only fact finding.

## 4.28 TWR28 — WorkProduct revision/history

**문제:** Does revision overwrite prior artifact?  
**Alternatives:** A) in-place overwrite—no audit; B) keep unrelated copies—lineage unclear; C) version/derivation history refs.  
**추천안:** Review/revision records source version, task, performer, changes and new version reference.  
**상태:** **Core Accepted candidate.** Granularity/storage **TBD**.  
**이유:** Defects, corrections and historical case state remain traceable.

## 4.29 TWR29 — Partial and imperfect output

**문제:** Is Task result only success/failure?  
**Alternatives:** A) binary—loses usable fragments; B) universal percentage—hidden fraction; C) task-specific structured partial states.  
**추천안:** Complete-but-limited, partially complete, usable-with-gaps, incomplete, mislinked, requires-verification and unresolved-risk are examples only.  
**상태:** **Core Accepted candidate.** Canonical vocabulary **TBD**.  
**이유:** Partial work can support review and player decisions.

## 4.30 TWR30 — Failure may still produce useful WorkProduct

**문제:** Does imperfect execution always generate nothing?  
**Alternatives:** A) nothing—wastes history; B) hidden failure score; C) preserve bounded output/gaps as later input when semantically useful.  
**추천안:** Incomplete review may feed partner/specialist review; unusable outputs may still retain diagnostic trace.  
**상태:** **Accepted candidate.** Per-task minimum artifact rules **TBD**.  
**이유:** Failure becomes recoverable work history rather than opaque void.

## 5. Suggested semantic structures

These structures are semantic references only, not canonical Godot classes, schemas, APIs or save formats.

| Structure | Minimum semantic information | Forbidden responsibility |
|---|---|---|
| `TaskDefinition` | Type/version, purpose, eligible roles, input/capability/demand/dependency/output refs | Universal difficulty or direct case outcome |
| `TaskAssignment` | Case/task, performer/role, responsibility scope, time/resources/direction/dependencies | Passive roster benefit |
| `TaskExecutionContext` | Profile version, available info, Case File snapshot, prior WorkProducts, capacity, choices, materialized events | ActualStateRecord or unowned secret input |
| `TaskExecutionEvent` | Stable event/version, target component, triggering boundary, materialized result/reason | Reload reroll or CourtFactFinding RNG |
| `WorkProduct` | Type/version, completed/uncompleted scope, links/findings, gaps/defects/risks, characteristics, sources and task/profile/dependency provenance | Automatic CourtRecord/finding |
| `WorkProductRevisionRef` | Source/new version, Review/Rework Task, changes and unresolved defects | Historical overwrite |
| `CaseFileUpdate` | Source WorkProduct, affected internal nodes/links, before/after refs, provenance | Automatic submission/admission |
| `ProceduralMaterializationRef` | WorkProduct/source, submitted artifact, procedure/stage/allowance refs | Bypassing existing procedural rules |

Reference shapes:

```text
TaskDefinition
├─ task_type / purpose
├─ eligible_role_requirements
├─ input_requirements
├─ capability_contribution_refs
├─ scope / structured demands
├─ dependency requirements
├─ completion semantics
└─ output type refs
```

```text
TaskExecutionContext
├─ performer/profile version
├─ available information and CaseFileState
├─ prior WorkProducts/dependencies
├─ time/resources/capacity
├─ player/NPC direction
└─ materialized TaskExecutionEvents
```

```text
WorkProduct
├─ completed and uncompleted scope
├─ identified links/findings
├─ gaps/defects/risks/characteristics
├─ source and dependency refs
├─ task/performer/profile refs
└─ provenance/version refs
```

## 6. Case File design hook

DEC-018 does not design the full Case File system or UI. It requires a future-compatible organized knowledge space that may link:

```text
Case Overview
Chronology
Issues
Pleadings / Filings
Evidence
Witnesses
Legal Research
Tasks / Deadlines
Correspondence / Interviews
WorkProducts
Trial Preparation
```

Case File is not one WorkProduct and not the CourtRecord. It organizes what the firm knows, has produced and plans to do, with source and history refs. UI toggles, folders, graph views, filters, conflict/refinement and knowledge-authority rules are **TBD**.

## 7. Solo → Firm progression hook

```text
Solo practice
→ player performs most Tasks directly

First support staff
→ eligible routine organization/support Tasks delegated

Associate lawyers
→ legal analysis/preparation Tasks delegated

Larger firm
→ parallel Tasks + review layers + specialist assignment

Partner/player
→ strategy, high-level review and selected key Tasks
```

This is supported architecture, not a mandatory progression tree. Direct and delegated work use identical Task/WorkProduct semantics; only assignments, roles, directions and execution context differ.

## 8. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | Task is an explicit work unit inside a Case | **Core Accepted candidate** |
| 2 | Task declares required inputs and eligible roles | **Core Accepted candidate** |
| 3 | Support staff and lawyers are distinct roles, not one skill ladder | **Core Accepted candidate** |
| 4 | Resolution consumes more than performer capability | **Core Accepted candidate** |
| 5 | Task demand is structured, not one universal score | **Core Accepted candidate** |
| 6 | No universal skill-vs-difficulty roll | **Forbidden** |
| 7 | Capabilities contribute to distinct WorkProduct components | **Core Accepted candidate** |
| 8 | No default hidden weighted-sum formula | **Forbidden** |
| 9 | WorkProduct is structured, not a universal quality number | **Core Accepted candidate** |
| 10 | Summary band cannot replace structured semantics | **Core Accepted candidate** |
| 11 | Gaps/defects preserve causal reasons where available | **Accepted candidate** |
| 12 | Exceptional capability does not guarantee output | **Core Accepted candidate** |
| 13 | Same resolved inputs normally yield same semantic result | **Core Accepted candidate** |
| 14 | Borderline variation is declared and bounded | **Accepted candidate**; mechanism **TBD** |
| 15 | Variation materializes once as explicit execution event | **Core Accepted candidate** |
| 16 | Reload does not reroll materialized outcome | **Core Accepted candidate** |
| 17 | Direct/delegated execution share semantics | **Core Accepted candidate** |
| 18 | Player/NPC direction affects work only through explicit inputs | **Core Accepted candidate** |
| 19 | Review/revision is a Task | **Core Accepted candidate** |
| 20 | Review does not guarantee correction | **Core Accepted candidate** |
| 21 | Tasks may depend on Tasks/WorkProducts | **Core Accepted candidate** |
| 22 | No universal fixed workflow | **Core Accepted candidate** |
| 23 | WorkProduct may update Case File with provenance | **Core Accepted candidate** |
| 24 | Internal WorkProduct is not automatically CourtRecord | **Core Accepted** inherited |
| 25 | Revisions preserve provenance/history | **Core Accepted candidate** |
| 26 | Partial/defective WorkProducts are valid semantic results | **Core Accepted candidate** |
| 27 | Incomplete work may remain later-task input | **Accepted candidate** |
| 28 | WorkProduct cannot create unavailable evidence/knowledge | **Core Accepted candidate** |
| 29 | No Task result changes JII/finding except through existing record/procedure systems | **Core Accepted** inherited / reaffirmed |
| 30 | Exact task-specific mechanics remain focused downstream work | **Accepted candidate** |

## 9. Pressure-test examples

All examples are synthetic structural fixtures, not implementation results or Korean practice statements.

### Case 1 — Simple solo task
**Input:** Player reviews five accessible documents with sufficient supplied time.  
**May evaluate:** Direct execution inputs and structured coverage/gaps.  
**Must not happen:** One player-skill roll.  
**Expected:** Valid Task and structured WorkProduct candidate; exact review result is task-rule TBD.

### Case 2 — Delegated equivalent task
**Input:** Associate receives the same TaskDefinition with explicit assignment.  
**May evaluate:** Same resolution inputs with different performer/profile/direction.  
**Must not happen:** Separate simplified delegation engine.  
**Expected:** Same Task/WorkProduct semantics.

### Case 3 — Support-role eligibility
**Input:** Document-indexing Task explicitly permits support staff.  
**May evaluate:** Role eligibility and assigned scope.  
**Must not happen:** Treat support role as low lawyer stat.  
**Expected:** Structurally valid assignment.

### Case 4 — Invalid role assignment
**Input:** TaskDefinition declares lawyer-required legal issue analysis; performer is support role.  
**May evaluate:** Eligibility only.  
**Must not happen:** Skill score waives role requirement.  
**Expected:** Invalid/cannot execute under supplied definition; actual Korean role rule not asserted.

### Case 5 — Universal difficulty score attack
**Input:** `difficulty 82`, `skill 86`.  
**May evaluate:** Semantic completeness.  
**Must not happen:** Subtraction decides output.  
**Expected:** Insufficient/invalid canonical abstraction.

### Case 6 — Structured demand
**Input:** High volume, moderate complexity, severe time pressure.  
**May evaluate:** Separate demand dimensions.  
**Must not happen:** Collapse to difficulty number.  
**Expected:** Demands remain distinct; exact resolution TBD.

### Case 7 — Weighted capability attack
**Input:** `analysis .4 + research .3 + oral .3`.  
**May evaluate:** Mapping validity.  
**Must not happen:** Hidden total task score.  
**Expected:** Rejected as default canonical semantics.

### Case 8 — Component contribution
**Input:** Declared task links analysis to issue component and review capability to source-link component.  
**May evaluate:** Bounded component mapping.  
**Must not happen:** Average capabilities.  
**Expected:** Valid structural mapping; actual component resolution TBD.

### Case 9 — Exceptional lawyer / missing information
**Input:** Exceptional applicable profile lacks key source material.  
**May evaluate:** Information requirement/gap.  
**Must not happen:** Create missing information/evidence.  
**Expected:** Gap remains and may constrain output under task rule.

### Case 10 — Exceptional lawyer / insufficient time
**Input:** Exceptional profile, explicit severe time constraint.  
**May evaluate:** Separate profile/capacity state.  
**Must not happen:** Profile downgrade or guaranteed completion.  
**Expected:** Capability stays exceptional; output constraint exactness TBD.

### Case 11 — Direct judge bonus attack
**Input:** Strong author attempts judge-acceptance bonus.  
**May evaluate:** Effect path.  
**Must not happen:** JII/CP/finding modifier.  
**Expected:** Forbidden.

### Case 12 — Structured WorkProduct
**Input:** Artifact includes covered scope, missing scope, links, defects and risks.  
**May evaluate:** Preservation of components/provenance.  
**Must not happen:** Force one score.  
**Expected:** Valid structured result.

### Case 13 — Quality-score collapse
**Input:** `WorkProductQuality = 78` only.  
**May evaluate:** Completeness.  
**Must not happen:** 78 owns downstream meaning.  
**Expected:** Insufficient.

### Case 14 — Optional summary label
**Input:** Structured WorkProduct plus UI summary `Strong`.  
**May evaluate:** Projection/source relationship.  
**Must not happen:** Downstream consumes label alone.  
**Expected:** Summary may exist; structure remains authoritative.

### Case 15 — Deterministic clear result
**Input:** Same complete resolved inputs and no borderline event, evaluated twice.  
**May evaluate:** Semantic equivalence.  
**Must not happen:** Fresh random quality roll.  
**Expected:** Same semantic WorkProduct.

### Case 16 — Borderline materialized variation
**Input:** Task-specific rule explicitly marks subtle clue component borderline; one permitted event result materializes.  
**May evaluate:** Event boundary and persistence.  
**Must not happen:** Global quality/finding roll or new evidence creation.  
**Expected:** Bounded `TaskExecutionEvent` persists; exact generation/probability TBD.

### Case 17 — Reload attack
**Input:** Reload after Case 16 event materialized.  
**May evaluate:** Stored event reuse.  
**Must not happen:** Reroll.  
**Expected:** Same event and semantic output.

### Case 18 — Explicit rework
**Input:** New Review/Rework Task with new authorized time/resources.  
**May evaluate:** New assignment/context and output lineage.  
**Must not happen:** Treat reload as rework or erase original.  
**Expected:** May create revised output under future rule; this is a new Task.

### Case 19 — Review task
**Input:** Associate draft v1 → partner Review Task → revised draft v2.  
**May evaluate:** Task/performer/profile and version lineage.  
**Must not happen:** Free overwrite.  
**Expected:** Traceable WorkProduct lineage.

### Case 20 — Review not omniscient
**Input:** Reviewer has limited scope/time.  
**May evaluate:** Explicit review constraints.  
**Must not happen:** Guaranteed full correction.  
**Expected:** Defects may remain; exact result TBD.

### Case 21 — Required dependency missing
**Input:** Drafting requires IssueAnalysis WorkProduct; it is absent.  
**May evaluate:** Dependency gate.  
**Must not happen:** Silently assume prerequisite.  
**Expected:** Task cannot proceed as complete under supplied definition; alternative handling TBD.

### Case 22 — Parallel dependencies
**Input:** Evidence Review and Witness Interview run independently, then both feed Issue Analysis.  
**May evaluate:** Dependency graph.  
**Must not happen:** Force universal linear workflow.  
**Expected:** Valid graph candidate.

### Case 23 — Case File update
**Input:** Evidence Review WorkProduct identifies `E12 ↔ W03` contradiction.  
**May evaluate:** Provenance-bearing internal link update.  
**Must not happen:** Automatic CourtRecord/finding change.  
**Expected:** Case File link may update under future rule; judicial record remains separate.

### Case 24 — Internal WorkProduct court-record attack
**Input:** Internal research memo exists; judge attempts direct consumption.  
**May evaluate:** Materialization refs.  
**Must not happen:** Hidden/unsubmitted memo enters CourtRecord.  
**Expected:** Forbidden without procedure-facing materialization.

### Case 25 — Partial useful result
**Input:** Evidence Review covers documents A–C but leaves D–F unreviewed.  
**May evaluate:** Covered/gap scopes and later Review dependency.  
**Must not happen:** Convert to nothing or pretend complete.  
**Expected:** Partial WorkProduct may feed Review Task; adequacy TBD.

### Case 26 — Coordination defect
**Input:** Two teams overlap A–C while scope D is unassigned.  
**May evaluate:** Assignment coverage/overlap and defect reason.  
**Must not happen:** Team-size bonus hides gap.  
**Expected:** Overlap and missing scope remain explicit; exact coordination resolution TBD.

### Case 27 — Wrong player direction
**Input:** Good lawyer receives explicit overly narrow priority; out-of-scope issue is missed.  
**May evaluate:** Direction and task scope as inputs.  
**Must not happen:** Capability magically ignores direction or creates knowledge.  
**Expected:** WorkProduct may preserve direction-caused gap under future rule.

### Case 28 — Large-case staffing
**Input:** One lawyer receives excessive simultaneous scope and limited capacity.  
**May evaluate:** Capacity, time and scope overload.  
**Must not happen:** Hidden permanent profile downgrade or random court penalty.  
**Expected:** Operational constraint/defect candidate; formula TBD.

## 10. False-PASS audit

Every pressure case must ask:

```text
Is this result implied by DEC-018's semantic boundary,
or did the author invent a missing task-specific resolution algorithm?
```

- Cases 1/2 prove shared structure, not a document-review algorithm.
- Cases 3/4 use explicit fixture role requirements; actual Korean role law remains TBD.
- Cases 6/8/9/10/20/25~28 stop before computing output magnitude.
- Case 16 accepts only a declared/materialized event boundary, not a probability or RNG algorithm.
- Cases 18/19 prove new-task/version lineage, not guaranteed improvement.
- Case 23 accepts a Case File update hook, not automatic truth or CourtRecord mutation.
- Case 24 enforces the inherited materialization boundary.

No pressure-test conclusion requires a weighted sum, weakest-link rule, quality threshold, hidden difficulty, random retry or invented legal doctrine.

## 11. Explicit TBD list

- Canonical Task catalog and TaskDefinition schema.
- Exact performer-role catalog and actual Korean support-staff legal scope.
- Task-demand taxonomy.
- Capability→component mappings and task-specific resolution algorithms.
- WorkProduct component vocabulary and adequacy standards.
- Internal numeric representations and summary vocabularies.
- Borderline classification, variation probability/distribution and TaskExecutionEvent generation.
- Player task interactions/minigames and NPC execution AI.
- Review effectiveness and revision merging.
- Dependency scheduler and parallel coordination.
- Workload/capacity formulas, time units and staffing optimization.
- Case File authority, conflicts, UI, toggle/folder/graph/filter UX.
- Document generation.
- Investigation/evidence discovery/development.
- Legal research/issue analysis.
- Witness preparation/examination.
- Drafting/filing.
- Settlement/negotiation.
- Staff hiring/compensation.
- Canonical schema/API/save/migration and Godot/GDScript.
- Balancing/performance.

## 12. Risks / anti-patterns

| Risk | Failure condition | Mitigation direction |
|---|---|---|
| One-roll task resolution | One roll erases component causality | Structured inputs/components/output |
| Universal difficulty | All demands become one number | Task-specific demand dimensions |
| Hidden weighted sum | Capabilities secretly add to score | Declared component contributions |
| Exceptional auto-success | Profile guarantees output | Context/resource/dependency gates |
| Support staff as weak lawyer | Role authority becomes skill magnitude | Explicit eligible role categories |
| Separate direct/delegated engines | Same work follows different rules | Shared Task/WorkProduct semantics |
| Quality-number collapse | WorkProduct becomes 78 | Structure authoritative |
| Summary becomes authority | UI label drives downstream | Projection only |
| Reload reroll | Repeated load changes output | Materialized persistent event |
| Perfect free review | Reviewer removes all defects | Review Task with constraints |
| Missing dependency ignored | Downstream assumes absent work | Explicit dependency enforcement |
| Fixed workflow | Every Case forced through same list | Content-defined dependency graph |
| Case File = CourtRecord | Internal knowledge reaches judge | Explicit materialization gate |
| Memo becomes evidence | Private product consumed judicially | Allowed-record separation |
| Unexplained defect | Bad result has no cause | Causal reason refs |
| Failure yields nothing | Partial knowledge/history lost | Structured partial outputs |
| Automation removes agency | Large firm resolves everything passively | Direction/review/key-task inputs |
| Micro-task explosion | UI/simulation becomes clerical overload | Medium-grain Tasks; catalog TBD |
| Volume-only difficulty | More documents is only challenge | Multi-dimensional demands |

## 13. Proposed TEST-017 plan

Proposed file: `TEST-017_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`  
Method: manual / fixture-level verification only. DEC-018 does not create or run TEST-017.

| # | Core case | Focus |
|---:|---|---|
| 1 | Simple solo task | Direct execution and structured output |
| 2 | Delegated equivalent | Same semantics, different execution source |
| 3 | Support-role eligibility | Explicit role permission |
| 4 | Invalid performer role | Eligibility gate |
| 5 | Universal difficulty rejection | No skill-vs-difficulty number |
| 6 | Structured task demands | Dimensions preserved |
| 7 | Weighted-sum rejection | No hidden total |
| 8 | Component contribution | Capability→component trace |
| 9 | Missing-information non-creation | No magical input/evidence |
| 10 | Time constraint | Capability stays stable; output bounded |
| 11 | Direct legal-outcome rejection | No JII/finding modifier |
| 12 | Structured WorkProduct | Scope/gaps/risks/provenance |
| 13 | Quality-score rejection | Score alone insufficient |
| 14 | Summary-band non-authority | Structure remains source |
| 15 | Deterministic clear result | Same inputs, same semantics |
| 16 | Materialized borderline variation | Bounded persistent event |
| 17 | Reload no-reroll | Stored event reused |
| 18 | Explicit rework | New Task/context, not reload |
| 19 | Review lineage | v1→Review→v2 trace |
| 20 | Imperfect review | No omniscient correction |
| 21 | Dependency enforcement | Missing required input not assumed |
| 22 | Parallel dependency | Valid non-linear graph |
| 23 | Case File update | Internal provenance-bearing link |
| 24 | WorkProduct/CourtRecord separation | No unsubmitted judicial input |
| 25 | Partial useful WorkProduct | Incomplete artifact may feed review |
| 26 | Coordination defect | Overlap and uncovered scope preserved |
| 27 | Direction-constrained execution | Explicit direction can bound scope |
| 28 | Large-case capacity pressure | Operational constraint, no profile downgrade |

## 14. DEC-019 candidate comparison

| Candidate | Why it follows | Risk | Assessment |
|---|---|---|---|
| Case File / Matter Knowledge Model | Tasks and WorkProducts need authoritative organized read/write space | Scope could expand into UI/database prematurely | **Recommended next** |
| Evidence Review & Investigation | First concrete high-value Task family; links to litigation evidence | May invent evidence or bypass allowed-record rules | Strong alternative after/with Case File boundary |
| Legal Research & Issue Analysis | Clarifies research/issue WorkProducts | Requires legal-content model not yet closed | Later focused candidate |
| Witness Preparation & Examination | Tests capability/component model deeply | Procedure and courtroom scope broad | Later focused candidate |
| Legal Drafting / Filing | Closes materialization path | Needs Case File and procedural interfaces | Later candidate |
| Task Assignment / Workload / Team Coordination | Required for scaling firms | Needs concrete task data first | Follow after common Task/Case File model |
| Legal Support Staff Role & Delegation | Clarifies performer eligibility | Actual legal-role boundaries sensitive | Separate focused candidate |

**Recommendation only:** `Case File / Matter Knowledge Model` is the strongest DEC-019 candidate because DEC-018 now defines common work units and outputs but only a hook for the knowledge space they read/write. `Evidence Review & Investigation` is a strong alternative because it would pressure-test the framework against real evidence-facing work, but it risks prematurely deciding Case File authority and discovery semantics. Final order/title is not fixed here.

## 15. Decision summary

### 15.1 Inherited Accepted

| ID | Decision | Status |
|---|---|---|
| I1 | Capability/profile never directly modifies JII/finding/favorability | **Core Accepted** |
| I2 | Allowed record only; internal/unsubmitted work is not judicial input | **Core Accepted** |
| I3 | Judge interpretation remains hard-first and criterion/JII bounded | **Core Accepted** |
| I4 | Capability cannot create evidence/scope/requirements/ChoicePoints | **Proposed DEC-014/017 boundary; fixture-verified** |
| I5 | Stable identity/profile/work history is immutable and role-specific | **Proposed DEC-015~017 boundary; fixture-verified** |

### 15.2 Core Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| TWR1~TWR5 | Explicit Task, declared semantics/roles and full execution-context inputs | **Core Accepted candidate** |
| TWR6~TWR8 | Structured demands/components; no universal roll or weighted sum | **Core Accepted candidate** |
| TWR10/TWR12~14 | Structured authoritative WorkProduct and causal defects/constraints | **Core Accepted candidate** |
| TWR15/TWR17/TWR18 | Deterministic default, materialized event and no reload reroll | **Core Accepted candidate** |
| TWR20 | Delegation uses same Task/WorkProduct semantics | **Core Accepted candidate** |
| TWR22~TWR29 | Explicit review/dependencies/Case File gate/history/partial output boundaries | **Core Accepted candidate** |

### 15.3 Accepted candidates

| IDs | Decision | Status |
|---|---|---|
| TWR9 | Common framework plus task-specific rules | **Accepted candidate** |
| TWR11 | Non-authoritative summary quality band | **Accepted candidate** |
| TWR13 | Structured defect causes | **Accepted candidate** |
| TWR16 | Declared bounded borderline variability | **Accepted candidate**; mechanism **TBD** |
| TWR19/TWR21 | Direct-player inputs and scalable delegation depth | **Accepted candidate** |
| TWR30 | Incomplete work may remain useful later-task input | **Accepted candidate** |

### 15.4 TBD summary

All task catalogs/schemas, role laws, demand/component/WorkProduct vocabularies, task-specific algorithms, borderline probability/event generation, player/NPC execution, review/merge/scheduling/coordination, workload/time/staffing, Case File UI/authority, substantive investigation/research/examination/drafting/filing/negotiation, hiring, save/API/Godot and balancing remain **TBD**.

### 15.5 Forbidden summary

- Whole-case or universal skill-vs-difficulty roll.
- One TaskDifficulty, LawyerPower or WorkProductQuality score as semantic authority.
- Hidden weighted capability sum, highest-stat or weakest-link default.
- Exceptional lawyer automatic success or capability-created evidence/information.
- Support staff as merely weak lawyers.
- Separate easier delegation engine or passive firm automation bonus.
- UI summary label replacing structured WorkProduct.
- Global/random task quality, judicial/fact RNG or reload reroll.
- Free perfect review, silent dependency satisfaction or universal fixed workflow.
- Case File/Internal WorkProduct treated as CourtRecord without materialization.
- In-place WorkProduct/history overwrite or direct JII/finding effect.

## 16. Acceptance closure

TWR16–TWR18은 모든 Task family가 variability를 구현해야 한다는 요구가 아니다. Task-specific rule이 bounded borderline variation과 그 materializer를 명시하지 않은 경우 resolution은 declared inputs에 대해 deterministic해야 한다. Variation을 명시한 경우에는 immutable `TaskExecutionEvent` identity, 대상 component, 입력 version, 결과와 event order를 최초 resolution에서 한 번 materialize하고 이후 read/reload에서 재추첨하지 않는다. Exact probability와 분포는 해당 Task family가 별도로 결정하기 전까지 사용할 수 없다.

TWR30의 partial output은 completed scope, unresolved scope, causal gaps와 provenance가 명시된 경우에만 later Task input 후보가 된다. Partial이라는 이유만으로 Task completion, adequacy, review acceptance 또는 downstream legal effect를 의미하지 않는다. Capacity/workload의 exact formula가 없는 경우에도 finite declared work와 unresolved scope의 separation은 유효하지만, 시스템이 임의 penalty나 completion forecast를 만들 수는 없다.

이 closure는 optional variability, save implementation 또는 workload formula를 발명하지 않고 공통 semantic gate만 확정한다.

## 17. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | Explicit Task units, structured demands, role eligibility, shared direct/delegated resolution, component-based capability contribution, structured WorkProducts, deterministic core with bounded materialized variation, no reload reroll, review/rework/dependency graphs, Case File updates, CourtRecord separation, version history and partial useful outputs를 TWR1~TWR30으로 제안. 28-case TEST-017 plan included; task-specific algorithms, Case File system, substantive work mechanics and implementation remain TBD. |
| v0.2 | Accepted | TEST-017 audit에서 드러난 optional variation/reload와 partial-capacity 판정 공백을 semantic gate로 닫았다. Undeclared variation은 사용할 수 없고, declared variation은 한 번 materialize되어야 하며, partial output은 explicit completed/unresolved scope와 provenance가 있을 때만 later input 후보가 된다. Exact probability, save implementation과 workload formula는 계속 TBD다. |
