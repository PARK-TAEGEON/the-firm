# THE FIRM — Task Assignment, Workload and Team Coordination

문서 ID: DEC-LITIGATION-026  
버전: v0.1 — Proposed / design review required  
상태: **Proposed / design review required**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 기준: `DEC-LITIGATION-025_DRAFTING_PLEADING_AND_FILING.md` v0.2 Accepted, `TEST-024_DRAFTING_PLEADING_AND_FILING.md` v0.2 Accepted / manual semantic verification, `DEC-LITIGATION-024_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted, `TEST-023_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-023_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.2 Accepted, `DEC-LITIGATION-022_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.2 Accepted, `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose

Investigation, Evidence Review, Interview, Legal Research, Issue Analysis, Case Theory Synthesis, Drafting, Review/Revision와 filing follow-up Task를 firm-wide workload graph로 연결한다.

```text
Task exists ≠ assigned ≠ started ≠ progressing ≠ completed ≠ reviewed ≠ accepted
worker available ≠ eligible ≠ suitable ≠ guaranteed success
```

## 2. Core operational model

```text
many TaskInstances + many Professionals + deadlines + dependencies
+ finite cross-Matter capacities + priorities + review relationships
→ assignments / reservations / executions / WorkProducts / reviews / handoffs
→ provenance-bearing operational history
```

Ten lawyers do not imply tenfold throughput. Assignment does not resolve work, priority does not bypass dependencies, and growth introduces review and coordination bottlenecks.

## 3. Semantic separation and reference objects

```text
TaskDefinition ≠ TaskInstance ≠ TaskAssignment ≠ WorkReservation
≠ TaskExecution ≠ WorkProduct ≠ ReviewTask ≠ Completion/Acceptance
```

TaskInstance conceptually references its definition, Matter, scope, authorized inputs, dependencies, deadlines/targets, priority, eligible roles, assignment/execution state, review requirements and history. TaskAssignment records task, assignee, assigner, time, role, scope and reassignment lineage; it is responsibility, not execution.

## 4. Eligibility, suitability, workload and capacity

Availability, role eligibility and suitability are separate. Suitability may compare specialization, experience, familiarity, continuity, workload and review needs, but no WorkerFitScore owns semantics. Workload is the underlying set of active, queued, review, blocked and administrative commitments across every Matter. Capacity is finite operational time/resources, not competence; overload effects remain task-specific.

## 5. Task demand, states and dependencies

Task demand remains structured by volume, ambiguity, specialization, coordination, procedural sensitivity, time pressure and dependencies—not DifficultyScore. Candidate states include unassigned, assigned, queued, ready, in progress, blocked, paused, completed, awaiting review, needs revision, closed and cancelled. No universal linear workflow is required. Blocked dependencies cannot be silently bypassed.

## 6. Parallelism, priority, scheduling and history

Independent Tasks may run in parallel within capacity; outputs never auto-merge. Shared dependency consumers preserve exact WorkProduct versions. Priority is organizational routing, not epistemic importance or legal decisiveness. Urgency and importance remain separate. Deadline source—procedural fixture, client commitment, internal target or dependency—must be preserved. Scheduled/reserved work is not started or completed.

## 7. Reassignment, handoff and collaboration

Reassignment preserves old assignment history. Handoff transfers only explicit prior WorkProducts, notes, completed scope, gaps and authorized snapshot context; it does not teleport hidden understanding. TaskOwner, contributor and reviewer are typed relationships. One Task may have contributors while an owner remains accountable.

## 8. Review chains and bottlenecks

Review chains are Task-specific. Production capacity may exceed review capacity, producing awaiting-review queues. Partner strategy, review, approval, client and filing obligations consume finite capacity. More associates can therefore increase first-pass output while worsening a partner/reviewer bottleneck.

## 9. Roles, MatterTeams and cross-Matter operations

Support staff perform explicitly eligible administrative/organizational Tasks and are not weak lawyers. Associates use individual professional profiles, not partner×scalar. MatterTeam is optional and may hold responsible partner, professionals, support roles and responsibilities, but ownership does not auto-assign every Task. A professional's capacity is person-wide and never resets per Matter.

## 10. Queues, failures and coordination

Overcommitment, capacity/dependency/review queues, starvation, escalation, cancellation, duplicate work, conflicting versions, stale dependency use and missed handoffs are valid states. Cancellation is not completion; duplicate WorkProducts remain until explicit reconciliation. No CoordinationScore or management aura replaces concrete defects/actions.

## 11. Automation, forecasts and hidden-state boundary

Assignment recommendations and auto-assignment use only visible eligibility, profile, workload, deadline, continuity and Task demand. They do not query ActualStateRecord, hidden legal models, future WorkProduct correctness, CourtFactFinding or client/judge outcome. Forecasts may identify risk from known schedules and blockers but are not guarantees. Materialized operational events do not reroll.

## 12. Progress and time

Work consumes finite capacity. Exact time units may be hours, blocks, days or event abstractions and remain TBD. Partial progress should use completed/unresolved scope, milestones and dependencies when possible. A percentage is only a derived projection with a known denominator, not canonical truth. Interruptions preserve state and prior work.

## 13. Firm growth principle

```text
more people → more parallelism / specialization / delegation
more people → more coordination / review / prioritization / bottlenecks
firm growth ≠ linear productivity multiplier
```

Solo direct work may evolve into support routing, associate first-pass work, senior review, MatterTeams and partner-level selection while preserving direct/delegated Task ontology.

## 14. Design decisions

| ID | Problem | Alternatives | Failure modes | Recommendation | Status | Reason |
|---|---|---|---|---|---|---|
| OPS1 | TaskDefinition만으로 concrete work를 표현할 수 없음 | definition-only / concrete instance | TaskDefinition만으로 concrete work를 표현할 수 없음을 잘못 collapse하면 Explicit TaskInstance 경계가 사라짐 | scope·Matter·history를 가진 TaskInstance | **Core Accepted candidate** | Explicit TaskInstance을 firm-wide graph에서 보존 |
| OPS2 | 책임 배정이 work start로 오인됨 | collapse / separate | 책임 배정이 work start로 오인됨을 잘못 collapse하면 Assignment ≠ execution 경계가 사라짐 | TaskAssignment을 execution과 분리 | **Core Accepted candidate** | Assignment ≠ execution을 firm-wide graph에서 보존 |
| OPS3 | assignment가 instant result를 만듦 | instant / explicit states | assignment가 instant result를 만듦을 잘못 collapse하면 Assigned ≠ completed 경계가 사라짐 | completion은 execution result로만 | **Core Accepted candidate** | Assigned ≠ completed을 firm-wide graph에서 보존 |
| OPS4 | idle worker가 모든 Task를 수행함 | availability-only / role gate | idle worker가 모든 Task를 수행함을 잘못 collapse하면 Availability ≠ eligibility 경계가 사라짐 | eligible roles를 별도 검사 | **Core Accepted candidate** | Availability ≠ eligibility을 firm-wide graph에서 보존 |
| OPS5 | legal eligibility가 optimal fit로 오인됨 | same / structured comparison | legal eligibility가 optimal fit로 오인됨을 잘못 collapse하면 Eligibility ≠ suitability 경계가 사라짐 | specialization·continuity·workload를 별도 비교 | **Core Accepted candidate** | Eligibility ≠ suitability을 firm-wide graph에서 보존 |
| OPS6 | heterogeneous fit이 한 수치로 collapse | score / dimensions | heterogeneous fit이 한 수치로 collapse을 잘못 collapse하면 No universal WorkerFitScore 경계가 사라짐 | canonical WorkerFitScore 금지 | **Core Accepted candidate** | No universal WorkerFitScore을 firm-wide graph에서 보존 |
| OPS7 | workload가 cosmetic percentage가 됨 | single percent / commitments | workload가 cosmetic percentage가 됨을 잘못 collapse하면 Structured workload commitments 경계가 사라짐 | active·queued·review·blocked refs 보존 | **Core Accepted candidate** | Structured workload commitments을 firm-wide graph에서 보존 |
| OPS8 | high skill이 infinite time이 됨 | collapse / separate | high skill이 infinite time이 됨을 잘못 collapse하면 Capacity ≠ capability 경계가 사라짐 | finite capacity와 competence 분리 | **Core Accepted candidate** | Capacity ≠ capability을 firm-wide graph에서 보존 |
| OPS9 | overload가 일괄 품질 감점이 됨 | global penalty / task effects | overload가 일괄 품질 감점이 됨을 잘못 collapse하면 No universal workload-quality penalty 경계가 사라짐 | delay·scope·handoff 등 task-specific consequence | **Core Accepted candidate** | No universal workload-quality penalty을 firm-wide graph에서 보존 |
| OPS10 | TaskDifficulty 한 값이 scheduling을 지배 | score / components | TaskDifficulty 한 값이 scheduling을 지배을 잘못 collapse하면 Structured Task demand 경계가 사라짐 | volume·ambiguity·specialist·coordination 구조화 | **Core Accepted candidate** | Structured Task demand을 firm-wide graph에서 보존 |
| OPS11 | 모든 Task가 같은 선형 lifecycle을 강제 | universal / task-specific graph | 모든 Task가 같은 선형 lifecycle을 강제을 잘못 collapse하면 Non-linear Task states 경계가 사라짐 | state vocabulary는 candidate, transitions는 Task별 | **Accepted candidate** | Non-linear Task states을 firm-wide graph에서 보존 |
| OPS12 | assigned Task가 missing input을 우회 | implicit / explicit graph | assigned Task가 missing input을 우회을 잘못 collapse하면 Explicit dependencies/blocking 경계가 사라짐 | dependency ref와 blocked state 보존 | **Core Accepted candidate** | Explicit dependencies/blocking을 firm-wide graph에서 보존 |
| OPS13 | firm work가 불필요하게 직렬화 | serial / independent parallel | firm work가 불필요하게 직렬화을 잘못 collapse하면 Parallel work allowed 경계가 사라짐 | resource와 dependency가 허용하면 병렬 | **Core Accepted candidate** | Parallel work allowed을 firm-wide graph에서 보존 |
| OPS14 | upstream revision이 과거 execution을 바꿈 | latest-only / version ref | upstream revision이 과거 execution을 바꿈을 잘못 collapse하면 Shared dependency versions preserved 경계가 사라짐 | 소비한 WorkProduct version 고정 | **Core Accepted candidate** | Shared dependency versions preserved을 firm-wide graph에서 보존 |
| OPS15 | high priority가 decisive truth가 됨 | epistemic / organizational | high priority가 decisive truth가 됨을 잘못 collapse하면 Priority ≠ truth/importance 경계가 사라짐 | priority를 routing preference로만 | **Core Accepted candidate** | Priority ≠ truth/importance을 firm-wide graph에서 보존 |
| OPS16 | deadline urgency와 case importance collapse | same / separate descriptors | deadline urgency와 case importance collapse을 잘못 collapse하면 Urgency ≠ strategic importance 경계가 사라짐 | 두 dimension 분리 | **Core Accepted candidate** | Urgency ≠ strategic importance을 firm-wide graph에서 보존 |
| OPS17 | 모든 deadline이 동일 법적 효력으로 보임 | untyped / typed origin | 모든 deadline이 동일 법적 효력으로 보임을 잘못 collapse하면 Deadline source/context preserved 경계가 사라짐 | procedural/client/internal/dependency source 보존 | **Core Accepted candidate** | Deadline source/context preserved을 firm-wide graph에서 보존 |
| OPS18 | calendar allocation이 work result가 됨 | collapse / separate | calendar allocation이 work result가 됨을 잘못 collapse하면 Scheduled ≠ started/completed 경계가 사라짐 | reservation, execution, completion 분리 | **Core Accepted candidate** | Scheduled ≠ started/completed을 firm-wide graph에서 보존 |
| OPS19 | 새 assignee가 old assignment를 삭제 | overwrite / lineage | 새 assignee가 old assignment를 삭제을 잘못 collapse하면 Reassignment preserves history 경계가 사라짐 | assigner·assignee·time·reason history 보존 | **Core Accepted candidate** | Reassignment preserves history을 firm-wide graph에서 보존 |
| OPS20 | reassignment이 perfect knowledge teleport 또는 work loss | teleport/reset / explicit handoff | reassignment이 perfect knowledge teleport 또는 work loss을 잘못 collapse하면 Handoff preserves prior work/context 경계가 사라짐 | notes·scope·WorkProducts·snapshot refs 보존 | **Core Accepted candidate** | Handoff preserves prior work/context을 firm-wide graph에서 보존 |
| OPS21 | 모든 참여 관계가 assignment로 collapse | one relation / typed roles | 모든 참여 관계가 assignment로 collapse을 잘못 collapse하면 Owner/contributor/reviewer separation 경계가 사라짐 | owner, contributor, reviewer를 구분 | **Core Accepted candidate** | Owner/contributor/reviewer separation을 firm-wide graph에서 보존 |
| OPS22 | 모든 output에 동일 hierarchy 강제 | universal / TaskDefinition-specific | 모든 output에 동일 hierarchy 강제을 잘못 collapse하면 Review chain Task-specific 경계가 사라짐 | review requirement를 Task별 정의 | **Core Accepted candidate** | Review chain Task-specific을 firm-wide graph에서 보존 |
| OPS23 | production capacity가 review capacity를 무시 | auto-review / queue | production capacity가 review capacity를 무시을 잘못 collapse하면 Review bottleneck valid 경계가 사라짐 | awaiting-review queue를 유효 상태로 | **Core Accepted candidate** | Review bottleneck valid을 firm-wide graph에서 보존 |
| OPS24 | partner가 infinite approvals 수행 | infinite / finite commitments | partner가 infinite approvals 수행을 잘못 collapse하면 Partner bottleneck valid 경계가 사라짐 | partner reviews도 capacity 소비 | **Core Accepted candidate** | Partner bottleneck valid을 firm-wide graph에서 보존 |
| OPS25 | support role이 scaled-down lawyer가 됨 | power ladder / role-distinct | support role이 scaled-down lawyer가 됨을 잘못 collapse하면 Support staff ≠ weak lawyers 경계가 사라짐 | TaskDefinition eligibility로 routing | **Core Accepted candidate** | Support staff ≠ weak lawyers을 firm-wide graph에서 보존 |
| OPS26 | associate가 partner×0.7로 모델링 | scalar / profile | associate가 partner×0.7로 모델링을 잘못 collapse하면 Associates use professional profiles 경계가 사라짐 | 개별 role/profile/capability 사용 | **Core Accepted candidate** | Associates use professional profiles을 firm-wide graph에서 보존 |
| OPS27 | 모든 Matter에 fixed team을 강제 | mandatory / optional | 모든 Matter에 fixed team을 강제을 잘못 collapse하면 MatterTeam optional 경계가 사라짐 | solo와 flexible team 모두 허용 | **Accepted candidate** | MatterTeam optional을 firm-wide graph에서 보존 |
| OPS28 | Case마다 capacity가 reset | per-Case / person-wide | Case마다 capacity가 reset을 잘못 collapse하면 Cross-Matter workload shared 경계가 사라짐 | professional commitments를 firm-wide aggregate | **Core Accepted candidate** | Cross-Matter workload shared을 firm-wide graph에서 보존 |
| OPS29 | 동시 Matters가 독립 simulation처럼 동작 | isolated / shared operations | 동시 Matters가 독립 simulation처럼 동작을 잘못 collapse하면 Multi-Matter concurrency 경계가 사라짐 | deadlines·workers·reviews를 한 graph에서 | **Core Accepted candidate** | Multi-Matter concurrency을 firm-wide graph에서 보존 |
| OPS30 | capacity 초과 assignment가 금지되어 전략 선택 소멸 | hard ban / valid risk state | capacity 초과 assignment가 금지되어 전략 선택 소멸을 잘못 collapse하면 Overcommitment representable 경계가 사라짐 | overcommitment 허용, effects TBD | **Core Accepted candidate** | Overcommitment representable을 firm-wide graph에서 보존 |
| OPS31 | queued Task가 자동 해결 | auto / persistent states | queued Task가 자동 해결을 잘못 collapse하면 Queue/block/starvation valid 경계가 사라짐 | capacity·dependency·priority queue 보존 | **Core Accepted candidate** | Queue/block/starvation valid을 firm-wide graph에서 보존 |
| OPS32 | blocker가 hidden auto-solve | implicit / explicit need | blocker가 hidden auto-solve을 잘못 collapse하면 Escalation explicit 경계가 사라짐 | decision/input/follow-up Task로 materialize | **Core Accepted candidate** | Escalation explicit을 firm-wide graph에서 보존 |
| OPS33 | cancelled Task가 done으로 집계 | same / separate | cancelled Task가 done으로 집계을 잘못 collapse하면 Cancellation ≠ completion 경계가 사라짐 | cancel reason/history와 incomplete status 보존 | **Core Accepted candidate** | Cancellation ≠ completion을 firm-wide graph에서 보존 |
| OPS34 | 겹친 WorkProduct가 자동 삭제 | dedup / preserve | 겹친 WorkProduct가 자동 삭제을 잘못 collapse하면 Duplicate work may exist 경계가 사라짐 | 명시적 reconciliation 전 모두 보존 | **Core Accepted candidate** | Duplicate work may exist을 firm-wide graph에서 보존 |
| OPS35 | 조정 실패가 CoordinationScore 하나가 됨 | score / defects | 조정 실패가 CoordinationScore 하나가 됨을 잘못 collapse하면 Coordination failure structured 경계가 사라짐 | duplicate, stale version, missed handoff 등으로 표현 | **Core Accepted candidate** | Coordination failure structured을 firm-wide graph에서 보존 |
| OPS36 | 조직 상태가 한 숫자 authority가 됨 | score / graph | 조직 상태가 한 숫자 authority가 됨을 잘못 collapse하면 No universal CoordinationScore 경계가 사라짐 | canonical CoordinationScore 금지 | **Core Accepted candidate** | No universal CoordinationScore을 firm-wide graph에서 보존 |
| OPS37 | manager stat이 전 직원 효율을 전역 변경 | aura / explicit management Tasks | manager stat이 전 직원 효율을 전역 변경을 잘못 collapse하면 No management aura bonus 경계가 사라짐 | 관리 역량은 component/action으로만 | **Core Accepted candidate** | No management aura bonus을 firm-wide graph에서 보존 |
| OPS38 | 추천이 hidden best worker를 뜻함 | oracle / visible basis | 추천이 hidden best worker를 뜻함을 잘못 collapse하면 Assignment suggestion ≠ correctness 경계가 사라짐 | eligibility·profile·workload·deadline 근거 표시 | **Core Accepted candidate** | Assignment suggestion ≠ correctness을 firm-wide graph에서 보존 |
| OPS39 | automation이 future result를 조회 | hidden optimizer / same inputs | automation이 future result를 조회을 잘못 collapse하면 Auto-assignment same ontology/no oracle 경계가 사라짐 | player assignment과 같은 visible semantics | **Core Accepted candidate** | Auto-assignment same ontology/no oracle을 firm-wide graph에서 보존 |
| OPS40 | player 조정 action을 표현할 경계 필요 | none / explicit actions | player 조정 action을 표현할 경계 필요을 잘못 collapse하면 Player assignment authority 경계가 사라짐 | assign·reassign·reprioritize·defer·cancel 허용 | **Core Accepted candidate** | Player assignment authority을 firm-wide graph에서 보존 |
| OPS41 | manager NPC가 optimal future를 앎 | oracle / bounded management | manager NPC가 optimal future를 앎을 잘못 collapse하면 Delegated management no hidden oracle 경계가 사라짐 | authorized operational inputs만 사용 | **Core Accepted candidate** | Delegated management no hidden oracle을 firm-wide graph에서 보존 |
| OPS42 | Task가 시간 없이 resolve | free / finite | Task가 시간 없이 resolve을 잘못 collapse하면 Work consumes finite capacity 경계가 사라짐 | execution은 operational capacity 소비 | **Core Accepted candidate** | Work consumes finite capacity을 firm-wide graph에서 보존 |
| OPS43 | 모든 progress가 임의 percentage | percent / scope/milestones | 모든 progress가 임의 percentage을 잘못 collapse하면 Partial progress structured 경계가 사라짐 | measurable coverage와 dependencies 보존 | **Core Accepted candidate** | Partial progress structured을 firm-wide graph에서 보존 |
| OPS44 | urgent Task가 old work를 삭제 | reset / paused history | urgent Task가 old work를 삭제을 잘못 collapse하면 Interruptions preserve state 경계가 사라짐 | interrupted state와 completed scope 보존 | **Core Accepted candidate** | Interruptions preserve state을 firm-wide graph에서 보존 |
| OPS45 | worker departure가 Tasks를 제거 | delete / reassign | worker departure가 Tasks를 제거을 잘못 collapse하면 Absence/departure requires handoff 경계가 사라짐 | assignment remains until explicit handoff | **Core Accepted candidate** | Absence/departure requires handoff을 firm-wide graph에서 보존 |
| OPS46 | new hire가 모든 context를 즉시 앎 | teleport / explicit inputs | new hire가 모든 context를 즉시 앎을 잘못 collapse하면 Hiring ≠ instant Matter knowledge 경계가 사라짐 | Case File/WorkProduct/handoff만 접근 | **Core Accepted candidate** | Hiring ≠ instant Matter knowledge을 firm-wide graph에서 보존 |
| OPS47 | growth가 단순 speed multiplier | linear / operational graph | growth가 단순 speed multiplier을 잘못 collapse하면 Solo→firm progression 경계가 사라짐 | parallelism·specialization과 coordination 동시 증가 | **Core Accepted candidate** | Solo→firm progression을 firm-wide graph에서 보존 |
| OPS48 | 자동 indexing이 Evidence Review를 대체 | collapse / typed automation | 자동 indexing이 Evidence Review를 대체을 잘못 collapse하면 Automation ≠ substantive collapse 경계가 사라짐 | substantive Task boundary 유지 | **Core Accepted candidate** | Automation ≠ substantive collapse을 firm-wide graph에서 보존 |
| OPS49 | UI가 hidden lateness를 예언 | oracle / forecast | UI가 hidden lateness를 예언을 잘못 collapse하면 Deadline warnings known-input only 경계가 사라짐 | known deadline·queue·blocker에 근거 | **Core Accepted candidate** | Deadline warnings known-input only을 firm-wide graph에서 보존 |
| OPS50 | risk projection이 guaranteed future가 됨 | certainty / bounded projection | risk projection이 guaranteed future가 됨을 잘못 collapse하면 Forecast ≠ certainty 경계가 사라짐 | assumptions와 basis를 보존 | **Core Accepted candidate** | Forecast ≠ certainty을 firm-wide graph에서 보존 |
| OPS51 | scheduling이 truth/court outcome을 최적화 | outcome oracle / operations only | scheduling이 truth/court outcome을 최적화을 잘못 collapse하면 No hidden task-result oracle 경계가 사라짐 | ActualStateRecord·hidden law·future finding 접근 금지 | **Core Accepted candidate** | No hidden task-result oracle을 firm-wide graph에서 보존 |

## 15. Recommended reference model

```text
FirmWorkloadGraph
├─ TaskInstances / definitions / Matters / scopes
├─ assignments / owners / contributors / reviewers
├─ reservations / executions / partial progress
├─ dependencies with WorkProduct versions
├─ deadlines / priorities / queues / blockers
├─ MatterTeams / cross-Matter worker commitments
├─ review chains / escalations / cancellations
└─ reassignment / handoff / event / history provenance
```

Canonical schema, directionality, cardinality and storage remain TBD.

## 16. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | TaskDefinition ≠ TaskInstance | **Core Accepted candidate** |
| 2 | TaskInstance ≠ TaskAssignment | **Core Accepted candidate** |
| 3 | Assignment ≠ start | **Core Accepted candidate** |
| 4 | Start ≠ completion | **Core Accepted candidate** |
| 5 | Completion ≠ review | **Core Accepted candidate** |
| 6 | Review ≠ acceptance | **Core Accepted candidate** |
| 7 | Available ≠ eligible | **Core Accepted candidate** |
| 8 | Eligible ≠ suitable | **Core Accepted candidate** |
| 9 | Suitable ≠ guaranteed success | **Core Accepted candidate** |
| 10 | Capacity ≠ capability | **Core Accepted candidate** |
| 11 | Capability ≠ capacity | **Core Accepted candidate** |
| 12 | Workload is cross-Matter | **Core Accepted candidate** |
| 13 | No fresh capacity per Case | **Core Accepted candidate** |
| 14 | Task demand is structured | **Core Accepted candidate** |
| 15 | No universal DifficultyScore | **Core Accepted candidate** |
| 16 | No universal WorkerFitScore | **Core Accepted candidate** |
| 17 | No universal WorkloadPenalty | **Core Accepted candidate** |
| 18 | No universal CoordinationScore | **Core Accepted candidate** |
| 19 | Dependencies cannot be silently bypassed | **Core Accepted candidate** |
| 20 | Blocked Task may remain assigned | **Core Accepted candidate** |
| 21 | Independent Tasks may proceed in parallel | **Core Accepted candidate** |
| 22 | Parallel Tasks do not auto-merge | **Core Accepted candidate** |
| 23 | Shared dependency version preserved | **Core Accepted candidate** |
| 24 | Priority ≠ truth | **Core Accepted candidate** |
| 25 | Priority ≠ legal decisiveness | **Core Accepted candidate** |
| 26 | Urgency ≠ importance | **Core Accepted candidate** |
| 27 | Deadline provenance preserved | **Core Accepted candidate** |
| 28 | Scheduled ≠ executed | **Core Accepted candidate** |
| 29 | Reassignment preserves old assignment | **Core Accepted candidate** |
| 30 | Handoff preserves prior work | **Core Accepted candidate** |
| 31 | Task owner ≠ sole contributor | **Core Accepted candidate** |
| 32 | Contributor ≠ reviewer | **Core Accepted candidate** |
| 33 | Reviewer ≠ owner automatically | **Core Accepted candidate** |
| 34 | Review bottleneck valid | **Core Accepted candidate** |
| 35 | Partner bottleneck valid | **Core Accepted candidate** |
| 36 | Support staff ≠ weaker lawyer | **Core Accepted candidate** |
| 37 | Matter ownership ≠ auto-assignment | **Core Accepted candidate** |
| 38 | MatterTeam optional | **Core Accepted candidate** |
| 39 | Multi-Matter workload shares capacity | **Core Accepted candidate** |
| 40 | Overcommitment valid | **Core Accepted candidate** |
| 41 | Queue valid | **Core Accepted candidate** |
| 42 | Starvation valid | **Core Accepted candidate** |
| 43 | Cancellation ≠ completion | **Core Accepted candidate** |
| 44 | Duplicate work valid | **Core Accepted candidate** |
| 45 | Coordination defect ≠ hidden outcome | **Core Accepted candidate** |
| 46 | Recommendation ≠ correct assignment | **Core Accepted candidate** |
| 47 | Auto-assignment has no result oracle | **Core Accepted candidate** |
| 48 | Work consumes finite capacity | **Core Accepted candidate** |
| 49 | Partial progress valid | **Core Accepted candidate** |
| 50 | Interruptions preserve history | **Core Accepted candidate** |
| 51 | Departure does not delete Tasks | **Core Accepted candidate** |
| 52 | Hiring does not grant instant Case knowledge | **Core Accepted candidate** |
| 53 | Automation does not collapse substantive Tasks | **Core Accepted candidate** |
| 54 | Forecast ≠ guarantee | **Core Accepted candidate** |
| 55 | Assignment does not query ActualStateRecord | **Core Accepted candidate** |
| 56 | Assignment does not query hidden legal model | **Core Accepted candidate** |
| 57 | Assignment does not know future CourtFactFinding | **Core Accepted candidate** |
| 58 | Direct/delegated execution preserves DEC-018 ontology | **Core Accepted candidate** |
| 59 | All operational changes provenance-bearing | **Core Accepted candidate** |
| 60 | Reload does not reroll materialized events | **Core Accepted candidate** |

## 17. Pressure tests (Cases 1–66)

| Case | Fixture | Manual semantic result |
|---:|---|---|
| 1 — Create TaskInstance | Matter A에 ER-1을 definition, scope, authorized inputs, dependencies와 history로 생성한다. | concrete TaskInstance exists; 아직 assignment/execution 없음 |
| 2 — Unassigned Task | ER-1은 생성됐지만 assignee가 없다. | unassigned queue state가 유효 |
| 3 — Assign eligible lawyer | LR-1 lawyer-only; Lawyer A가 eligible하며 assignment event 생성. | responsibility만 생기고 start/result 없음 |
| 4 — Assigned but not started | A가 DR-1 assignee지만 scheduled window 전이다. | assigned state와 not-started state 공존 |
| 5 — Started but incomplete | A가 E1–E10 중 E1–E4만 review했다. | partial execution; completion 없음 |
| 6 — Completed awaiting review | Associate Draft D1 완료, senior review required. | completed output와 awaiting-review 구분 |
| 7 — Reviewed needing revision | Senior가 D1 defect를 찾아 revision 요청. | reviewed state가 acceptance/completion closure 아님 |
| 8 — Completed/accepted distinction | WorkProduct 완료 후 owner가 acceptance하지 않았다. | completion과 organizational acceptance 분리 |
| 9 — Idle support ineligible | Support S idle; lawyer-required IssueAnalysis IA-1. | availability가 role gate를 우회하지 않음 |
| 10 — Eligible poorly matched | Generalist A eligible, specialist context 없음; specialist B도 eligible. | eligibility는 suitability winner가 아님 |
| 11 — High-skill overloaded | Expert A가 8 active deadlines를 보유. | capability가 capacity를 생성하지 않음 |
| 12 — Lower-skill available | B는 free capacity지만 specialization 적음. | tradeoff 표현; hidden best answer 없음 |
| 13 — Capacity/capability collapse attack | A skill exceptional이므로 infinite assignments를 부여. | 금지; finite commitments 적용 |
| 14 — WorkerFitScore attack | WorkerFitScore=86으로 자동 배정. | canonical authority 금지; structured dimensions 사용 |
| 15 — DifficultyScore scheduling attack | TaskDifficulty=78 하나로 duration/assignee 결정. | 금지; demand components 보존 |
| 16 — One lawyer two Matters | A가 Matter 1 LR-1과 Matter 2 D-2를 담당. | 둘 다 같은 person-wide workload에 합산 |
| 17 — Per-case reset attack | 각 Matter가 A를 100% available로 표시. | 금지; cross-Matter commitments 반영 |
| 18 — Explicit dependency blocked | DR-1 depends on unfinished LR-1. | assigned 가능하나 executable/complete 불가 |
| 19 — Dependency completes | LR-1 WP-v1 materialized. | DR-1 ready candidate가 될 수 있음 |
| 20 — Specific dependency version | DR-1 starts with LR-WP-v1. | execution provenance에 v1 고정 |
| 21 — Upstream later revised | LR-WP-v2가 후에 생성. | v2는 follow-up/restart input이지 v1 execution rewrite 아님 |
| 22 — Retroactive mutation attack | v2 생성 후 old DR-1이 v2를 소비한 것으로 변경. | 금지; historical input refs 고정 |
| 23 — Three independent Tasks parallel | ER-1, INT-2, LR-3가 dependency 없이 각 eligible worker에 배정. | capacity 범위에서 병렬 가능 |
| 24 — Parallel auto-merge attack | 세 WorkProduct를 자동 final synthesis로 합침. | 금지; explicit synthesis/review Task 필요 |
| 25 — High-priority blocked Task | DR-1 critical이나 LR-1 미완료. | priority가 blocker를 제거하지 않음 |
| 26 — Low-priority ready Task | ER-2 low priority지만 ready, capacity 있음. | 조직 선택에 따라 실행 가능 |
| 27 — Priority bypass dependency attack | critical flag로 nonexistent LR output 생성. | 금지; prerequisite work를 reprioritize할 수만 있음 |
| 28 — Urgent low-strategy Task | internal filing package deadline 임박, 전략 중요도 낮음. | urgent와 strategic importance 별도 |
| 29 — Important nonurgent research | case-shaping Issue research, deadline 여유. | importance가 urgency를 자동 생성하지 않음 |
| 30 — Deadline explicit source | fixture procedural deadline T와 origin ref. | deadline provenance 보존; Korean 기간 발명 없음 |
| 31 — Scheduled not started | A가 내일 09:00 block 예약. | reservation은 execution/progress 아님 |
| 32 — Reassignment | A unavailable; ER-1을 B에게 재배정. | old/new assignment와 reason/time 보존 |
| 33 — Reassignment history deletion attack | B assignment가 A history를 삭제. | 금지 |
| 34 — Handoff partial work | A가 E1–E4 review 후 B에게 notes/WP/scope 전달. | explicit context만 B가 사용; remaining scope 보존 |
| 35 — Owner plus contributor | A owner, B specialist contributor. | ownership이 sole performance를 뜻하지 않음 |
| 36 — Contributor ≠ reviewer | B가 draft section 기여; C가 reviewer. | typed relations 분리 |
| 37 — Associate draft to senior review | Associate completes D1, Senior receives ReviewTask. | Task-specific chain; universal hierarchy 아님 |
| 38 — Review queue bottleneck | 5 drafts awaiting one senior reviewer. | valid queue; production≠review capacity |
| 39 — Five associates / one reviewer | associates each create one first-pass Draft. | queue grows; throughput ×5 conclusion 금지 |
| 40 — Partner bottleneck | P가 strategy, review, submission approvals 12개 보유. | partner finite capacity로 queue 가능 |
| 41 — Support eligible admin Task | package indexing Task allows support_staff. | valid assignment; weak-lawyer 모델 아님 |
| 42 — Support substantive attack | lawyer-required LegalResearch를 idle support에게 배정. | invalid role gate; Korean law 주장 아님 |
| 43 — MatterTeam | Matter A에 P/A/B/S role relationships 설정. | routing context; all Tasks auto-assigned 아님 |
| 44 — Solo Matter no team | solo player가 Task를 직접 소유. | MatterTeam 없어도 valid |
| 45 — Two concurrent Matters | A와 B Matters가 same professionals/deadlines 공유. | firm-wide capacity/priority graph |
| 46 — Overcommitment | A capacity보다 많은 Tasks를 의도적으로 assign. | representable risk; 자동 금지/감점 공식 없음 |
| 47 — Queue no capacity | eligible lawyers 모두 active. | Task queued; 자동 완료 없음 |
| 48 — Blocked queue | source acquisition dependency pending. | capacity가 생겨도 dependency 전 실행 불가 |
| 49 — Low-priority starvation | ready Task가 반복적으로 higher-priority work에 밀림. | starvation history가 valid |
| 50 — Escalation | Draft blocker가 client decision을 요구. | explicit escalation/decision need 생성 |
| 51 — Cancellation | strategy change로 LR-4 cancel. | completion 아님; reason/history 보존 |
| 52 — Duplicate research | A/B가 같은 Issue를 독립 research. | 두 WorkProduct 공존 |
| 53 — Duplicate auto-delete attack | system이 later result만 남김. | 금지; explicit dedup/synthesis 전 provenance 보존 |
| 54 — Conflicting draft versions | D-A와 D-B가 다른 arguments 포함. | 별도 versions; automatic winner 없음 |
| 55 — CoordinationScore attack | CoordinationScore=72가 모든 result를 감점. | canonical aura 금지; concrete defects 사용 |
| 56 — ManagementSkill aura attack | manager 90이 firm efficiency +20%. | 금지; explicit management action/component만 |
| 57 — Auto-assignment outcome oracle | hidden future says B wins, AI assigns B. | 금지; visible eligibility/profile/workload만 |
| 58 — Employee departure | A leaves with active ER-1/DR-2. | Tasks remain; reassignment/handoff 필요 |
| 59 — New hire instant knowledge attack | C hired and knows every Matter detail. | 금지; authorized Case File/handoff only |
| 60 — Deadline forecast | known deadline, queue, blocker로 risk warning. | bounded forecast 가능; certainty 아님 |
| 61 — Review bottleneck scaling attack | 5 associates 추가, reviewer capacity unchanged. | first-pass queue may grow; total throughput ×5 금지 |
| 62 — Cross-Matter overload attack | A commitments M1 20h, M2 20h, M3 15h. | per-Matter availability 금지; aggregate workload |
| 63 — Dependency/priority conflict attack | critical Draft depends on unfinished Legal Research. | priority cannot fabricate output; prerequisite may be reprioritized |
| 64 — Handoff knowledge teleportation attack | new associate gets Task without notes/refs. | perfect understanding 금지; explicit context only |
| 65 — Auto-assignment hidden-correct-worker attack | B would yield future better outcome hidden. | future outcome cannot select B |
| 66 — Firm-growth linear multiplier attack | solo 1 + nine hires → throughput 10. | invalid canonical multiplier; roles, dependencies, review/coordination matter |

## 18. Workload graph pressure test

Matter A의 ER-1/LR-1과 이 둘에 의존하는 DR-1, Matter B의 INT-2/SYN-2를 P/A/B/S에 routing한다. Role eligibility, person-wide capacity, dependency versions, permitted parallelism, review queue와 partner bottleneck을 표현할 수 있다. hidden outcome 최적화와 exact duration formula는 사용하지 않는다.

## 19. Solo → small firm and scaling pressure tests

Solo player가 review/research/drafting/strategy를 수행하다 support와 associate를 고용하면 explicitly eligible routine/substantive work를 나눌 수 있다. 그러나 hiring은 work completion이나 instant knowledge가 아니다. 1 partner/5 associates firm은 1 partner/1 associate보다 first-pass queue를 크게 만들 수 있으나 partner-required review가 supplied fixture에 있으면 review throughput은 병목될 수 있다.

## 20. Assignment and coordination pressure tests

Specialist A는 relevant specialization과 heavy workload, generalist B는 free capacity를 가진다. 자동 정답은 없으며 visible tradeoff만 제시한다. 별도 lawyers가 같은 Issue를 중복 연구하면 두 WorkProduct가 남고 이후 explicit synthesis/review가 reconciliation한다.

## 21. Progress and forecast pressure tests

30-document Evidence Review에서 18 reviewed/12 unreviewed는 coverage로 보존하고 UI가 60%를 파생할 수 있다. Unbounded Legal Research에는 임의 60%를 만들지 않는다. Known deadline, blocked research, occupied worker와 review queue로 deadline risk를 경고할 수 있으나 deterministic supplied rule 없이는 definitely late라고 단정하지 않는다.

## 22. Cross-case invariant matrix

| Boundary family | Cases | Result | Note |
|---|---|---|---|
| Instance/assignment/execution/review | 1–8 | PASS candidate | states separate |
| Eligibility/suitability/capacity | 9–17, 62, 65–66 | PASS candidate | no scores/oracles |
| Dependencies/version/priority | 18–29, 63 | PASS candidate | no bypass |
| Scheduling/reassignment/handoff | 30–36, 64 | PASS candidate | history/context explicit |
| Review/partner bottleneck | 37–40, 61 | PASS candidate | finite capacity |
| Roles/teams/cross-Matter | 41–46, 62 | PASS candidate | firm-wide commitments |
| Queues/escalation/cancellation | 47–51 | PASS candidate | valid operational states |
| Duplicate/coordination/management | 52–57, 64–66 | PASS candidate | no aura/linear multiplier |
| Absence/hiring/forecast | 58–60 | PASS candidate | no knowledge teleport/certainty |

## 23. Contradiction audit

Assignment/execution, capacity/capability, eligibility/suitability, per-Matter reset, universal penalty/score, dependency/priority bypass, auto-merge, reassignment history loss, handoff teleportation, ignored review bottleneck, infinite partner, support power ladder, scaled associate, impossible overcommitment, auto-completed queues, duplicate deletion, manager aura, hidden auto-assignment oracle, instant new-hire knowledge, linear firm multiplier, forecast certainty, hidden factual/legal/court access와 reroll을 모두 금지한다. 실제 Korean employment/professional rules는 주장하지 않는다.

## 24. False-PASS / False-PARTIAL audit

PASS를 위해 exact work hours, Korean role restrictions, Task durations, throughput formula, coordination penalty, review ratio, hiring productivity 또는 outcome probability를 발명하지 않는다. Time system, capacity unit, UI, management AI와 economics가 TBD인 것만으로 PARTIAL을 주지 않는다. semantic boundary ambiguity만 PARTIAL 사유다.

## 25. Explicit TBD

- operational time unit and Task duration
- workload/capacity measurement and scheduling
- priority vocabulary and queue policy
- collaboration/review-chain/MatterTeam schemas
- support role and Korean staffing rules
- availability/HR and management capabilities
- auto-assignment/recommendation and forecast algorithms
- UI/dashboard and NPC management AI
- firm economics/billing
- save/schema/API/Godot
- balancing/performance

## 26. Risks / anti-patterns

| Failure condition | Why harmful | Mitigation direction |
|---|---|---|
| Every hire gives linear throughput | bottlenecks/dependencies vanish | derive from graph |
| One superstar handles everything | capacity erased | finite commitments |
| Partner infinite review capacity | firm scale trivialized | partner queue |
| Queues invisible | player cannot plan | visible blockers/status |
| Deadlines meaningless | priority tradeoff disappears | typed deadline refs |
| Workload cosmetic | assignment has no consequence | structured commitments |
| Wrong assignee no tradeoff | profiles irrelevant | visible suitability dimensions |
| Support staff as weak lawyers | role identity lost | eligibility-specific tasks |
| Spreadsheet drudgery | operations overwhelms play | dashboard/projections, UI TBD |
| Automation removes decisions | player agency lost | bounded configurable authority |
| Micromanagement explosion | scale becomes tedious | team ownership/delegated management |
| AI manager optimal oracle | hidden outcome leakage | visible inputs only |
| Cross-Matter overload ignored | capacity duplication | person-wide workload |
| Duplicate work erased | history/inefficiency hidden | preserve WorkProducts |
| Context teleportation | handoff meaningless | explicit refs/orientation |
| Large firm loses intimacy | core fantasy diluted | selective direct work and key decisions |

## 27. Player-facing principle

Player should see Tasks, owners/assignees, eligible roles, relevant profile context, workload commitments, dependencies, blockers, typed deadlines, review queues, Matter distribution, handoff/reassignment history와 known risks. Player should not see guaranteed outcomes, hidden best assignee, future judge result, hidden WorkProduct correctness 또는 invisible optimal staffing answer.

## 28. Suggested TEST-025

`TEST-025_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md`에서 Case 1–66을 case-specific fixture와 reasoning으로 검증한다. unrelated cases에 generic boilerplate를 반복해 PASS를 만들지 않는다. 이 DEC는 TEST-025를 생성하지 않는다.

## 29. DEC-027 candidates

Client Interaction / Advice, Witness Preparation / Court Examination, Settlement / Negotiation, Hearing / Oral Advocacy, Firm Economics / Billing을 비교한다. TEST-025가 blocker를 발견하지 않으면 **DEC-027 — Client Interaction / Advice**를 기본 후보로 둔다. CaseTheory/risk/strategy → advice → client decision → authorized strategic action의 bridge가 다음 유용한 경계다.

## 30. Decision summary

### Inherited Accepted

Typed Task/WorkProduct, role/profile/capability, provenance/history, no hidden truth/law/court oracle, direct/delegated equivalence와 materialized event determinism.

### Core Accepted candidates

OPS1–OPS10, OPS12–OPS26, OPS28–OPS51: concrete instances, states, eligibility/capacity, dependency/version, priority/deadline, handoff/collaboration, bottleneck, cross-Matter, coordination, automation/forecast boundaries.

### Accepted candidates

OPS11 non-linear candidate state vocabulary와 OPS27 optional MatterTeam architecture.

### TBD

§25의 time, capacity, scheduling, staffing, schemas, UI/AI, economics와 implementation.

### Forbidden

- Assignment/completion, availability/eligibility/suitability, capacity/capability collapse.
- per-Matter capacity reset, universal Difficulty/Fit/Workload/Coordination score 또는 management aura.
- dependency/priority bypass, auto-merge, history loss, handoff knowledge teleportation.
- hidden result oracle, instant-hire knowledge, linear throughput multiplier, forecast certainty, reload reroll.

## 31. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | OPS1–OPS51 define firm-wide workload graph, cross-Matter finite capacity, structured assignment/state/dependency/review/team semantics, 60 invariants and 66 case-specific pressure fixtures. |

