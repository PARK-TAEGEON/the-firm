# THE FIRM — TEST-025 Task Assignment, Workload and Team Coordination

문서 ID: TEST-025  
버전: v0.2 — Accepted / manual fixture-level verification  
상태: **Accepted / manual fixture-level verification**  
대상: `DEC-LITIGATION-026_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md` v0.2 Accepted

## 1. Purpose

DEC-026의 Task Assignment/Workload/Team Coordination semantics를 synthetic fixture에 수동 적용한다. implementation test나 실제 한국 employment/professional regulation 검증이 아니며 Observed는 DEC semantics의 manual fixture application이다.

```text
TaskDefinition ≠ TaskInstance ≠ TaskAssignment ≠ WorkReservation ≠ TaskExecution
≠ WorkProduct ≠ ReviewTask ≠ Completion ≠ Acceptance
worker available ≠ eligible ≠ suitable ≠ guaranteed success
capacity ≠ capability; firm growth ≠ linear productivity multiplier
```

## 2. Verdict rules

PASS는 DEC-026 semantic boundary가 fixture 결과를 결정하고 inherited DEC와 모순 없음, PARTIAL은 semantic ambiguity, FAIL은 assignment/execution·capacity/capability·dependency·history·hidden-oracle collapse가 실제 발생한 경우다. 시간 단위, scheduling, queue policy, UI, AI, economics와 staffing law가 TBD인 것만으로 PARTIAL을 주지 않는다.

## 3. Manual application convention

각 case는 Matter, TaskDefinition/Instance, assignment와 execution, dependencies, capacity, review, provenance/history를 구분한다. ActualStateRecord, hidden legal model, 미래 WorkProduct/CourtFactFinding은 operational input이 아니다.

## 4. Core cases (1–72)

### Case 1 — Create TaskInstance
**Purpose**  Create TaskInstance의 고유 경계를 확인한다.  
**Fixture**  Matter A creates ER-1 from EvidenceReviewDefinition with E1–E5 scope.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  TI-1 exists with definition/Matter/scope; no assignment or execution.  
**Observed**  TI-1 exists with definition/Matter/scope; no assignment or execution. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 2 — Unassigned Task
**Purpose**  Unassigned Task의 고유 경계를 확인한다.  
**Fixture**  ER-1 exists with no assignee.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  unassigned is distinct from queued/started/completed.  
**Observed**  unassigned is distinct from queued/started/completed. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 3 — Assign eligible lawyer
**Purpose**  Assign eligible lawyer의 고유 경계를 확인한다.  
**Fixture**  LR-1 is lawyer-only; eligible Lawyer A receives A1 assignment.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  assignment records actor/time and does not start work.  
**Observed**  assignment records actor/time and does not start work. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 4 — Assigned but not started
**Purpose**  Assigned but not started의 고유 경계를 확인한다.  
**Fixture**  A is assigned DR-1 but its scheduled window is tomorrow.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  assigned and not-started coexist.  
**Observed**  assigned and not-started coexist. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 5 — Started but incomplete
**Purpose**  Started but incomplete의 고유 경계를 확인한다.  
**Fixture**  A opens only E1–E4 of ten authorized documents.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  partial execution; no completion.  
**Observed**  partial execution; no completion. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 6 — Completed awaiting review
**Purpose**  Completed awaiting review의 고유 경계를 확인한다.  
**Fixture**  Associate completes D1; required Senior ReviewTask is pending.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  completion and awaiting review stay separate.  
**Observed**  completion and awaiting review stay separate. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 7 — Reviewed needing revision
**Purpose**  Reviewed needing revision의 고유 경계를 확인한다.  
**Fixture**  Senior review of D1 identifies citation defect and requests revision.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  review result is not acceptance; needs-revision state.  
**Observed**  review result is not acceptance; needs-revision state. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 8 — Completed/accepted distinction
**Purpose**  Completed/accepted distinction의 고유 경계를 확인한다.  
**Fixture**  WP-1 marked complete while owner acceptance event is absent.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  completion does not imply acceptance.  
**Observed**  completion does not imply acceptance. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 9 — Idle support ineligible
**Purpose**  Idle support ineligible의 고유 경계를 확인한다.  
**Fixture**  Idle support S receives lawyer-required IssueAnalysis.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  assignment is invalid despite availability.  
**Observed**  assignment is invalid despite availability. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 10 — Eligible poorly matched
**Purpose**  Eligible poorly matched의 고유 경계를 확인한다.  
**Fixture**  Specialist A is busy; generalist B free; both eligible.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  visible tradeoff, no canonical best worker.  
**Observed**  visible tradeoff, no canonical best worker. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 11 — High-skill overloaded
**Purpose**  High-skill overloaded의 고유 경계를 확인한다.  
**Fixture**  Expert A has several active deadlines across Matters.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  skill does not add time/capacity.  
**Observed**  skill does not add time/capacity. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 12 — Lower-skill available
**Purpose**  Lower-skill available의 고유 경계를 확인한다.  
**Fixture**  Generalist B has free capacity but less subject familiarity.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  availability does not prove suitability or outcome.  
**Observed**  availability does not prove suitability or outcome. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 13 — Capacity/capability collapse attack
**Purpose**  Capacity/capability collapse attack의 고유 경계를 확인한다.  
**Fixture**  Exceptional skill is used to assign unlimited concurrent Tasks.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  capacity/capability collapse is forbidden.  
**Observed**  capacity/capability collapse is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 14 — WorkerFitScore attack
**Purpose**  WorkerFitScore attack의 고유 경계를 확인한다.  
**Fixture**  System displays WorkerFitScore 86 and auto-routes Task.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  score cannot own assignment semantics.  
**Observed**  score cannot own assignment semantics. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 15 — DifficultyScore scheduling attack
**Purpose**  DifficultyScore scheduling attack의 고유 경계를 확인한다.  
**Fixture**  DifficultyScore 78 alone determines duration and worker.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  structured demand is required.  
**Observed**  structured demand is required. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 16 — One lawyer two Matters
**Purpose**  One lawyer two Matters의 고유 경계를 확인한다.  
**Fixture**  A owns M1 LR-1 and M2 D2 simultaneously.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  commitments aggregate person-wide.  
**Observed**  commitments aggregate person-wide. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 17 — Per-case reset attack
**Purpose**  Per-case reset attack의 고유 경계를 확인한다.  
**Fixture**  Each Matter reports A as 100% free despite M1/M2 work.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  per-Matter reset is forbidden.  
**Observed**  per-Matter reset is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 18 — Explicit dependency blocked
**Purpose**  Explicit dependency blocked의 고유 경계를 확인한다.  
**Fixture**  DR-1 depends on unfinished LR-1/WP-1.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  DR-1 may be assigned/blocked, not completed.  
**Observed**  DR-1 may be assigned/blocked, not completed. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 19 — Dependency completes
**Purpose**  Dependency completes의 고유 경계를 확인한다.  
**Fixture**  LR-1 materializes WP-1.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  dependent DR-1 may become ready through explicit transition.  
**Observed**  dependent DR-1 may become ready through explicit transition. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 20 — Specific dependency version
**Purpose**  Specific dependency version의 고유 경계를 확인한다.  
**Fixture**  DR-1 starts consuming LR-WP-v1.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  execution records exact consumed version.  
**Observed**  execution records exact consumed version. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 21 — Upstream later revised
**Purpose**  Upstream later revised의 고유 경계를 확인한다.  
**Fixture**  LR-WP-v2 is produced after DR-1 started.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  v2 may trigger follow-up; old execution remains v1.  
**Observed**  v2 may trigger follow-up; old execution remains v1. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 22 — Retroactive mutation attack
**Purpose**  Retroactive mutation attack의 고유 경계를 확인한다.  
**Fixture**  System rewrites old DR-1 input from v1 to v2.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  retroactive dependency mutation is forbidden.  
**Observed**  retroactive dependency mutation is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 23 — Three independent Tasks parallel
**Purpose**  Three independent Tasks parallel의 고유 경계를 확인한다.  
**Fixture**  ER-1, INT-1 and LR-1 have distinct eligible workers and no dependency.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  parallel execution is permitted within capacity.  
**Observed**  parallel execution is permitted within capacity. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 24 — Parallel auto-merge attack
**Purpose**  Parallel auto-merge attack의 고유 경계를 확인한다.  
**Fixture**  System combines three completed WorkProducts without synthesis Task.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  automatic merge is forbidden.  
**Observed**  automatic merge is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 25 — High-priority blocked Task
**Purpose**  High-priority blocked Task의 고유 경계를 확인한다.  
**Fixture**  Critical DR-1 waits for missing LR-1.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  priority cannot fabricate prerequisite.  
**Observed**  priority cannot fabricate prerequisite. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 26 — Low-priority ready Task
**Purpose**  Low-priority ready Task의 고유 경계를 확인한다.  
**Fixture**  Low-priority ER-2 is ready and capacity exists.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  it may run; priority is organizational.  
**Observed**  it may run; priority is organizational. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 27 — Priority bypass dependency attack
**Purpose**  Priority bypass dependency attack의 고유 경계를 확인한다.  
**Fixture**  Critical flag causes nonexistent LR output to appear.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  dependency bypass is forbidden.  
**Observed**  dependency bypass is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 28 — Urgent low-strategy Task
**Purpose**  Urgent low-strategy Task의 고유 경계를 확인한다.  
**Fixture**  Filing package is urgent but not strategic case issue.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  urgency and importance remain distinct.  
**Observed**  urgency and importance remain distinct. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 29 — Important nonurgent research
**Purpose**  Important nonurgent research의 고유 경계를 확인한다.  
**Fixture**  Issue research is strategically important but deadline is distant.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  importance does not create urgency automatically.  
**Observed**  importance does not create urgency automatically. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 30 — Deadline explicit source
**Purpose**  Deadline explicit source의 고유 경계를 확인한다.  
**Fixture**  Procedural fixture supplies deadline T and origin.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  deadline warning/result uses that provenance.  
**Observed**  deadline warning/result uses that provenance. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 31 — Scheduled not started
**Purpose**  Scheduled not started의 고유 경계를 확인한다.  
**Fixture**  A reserves tomorrow morning for LR-2 but has not opened it.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  scheduled/reserved is not started.  
**Observed**  scheduled/reserved is not started. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 32 — Reassignment
**Purpose**  Reassignment의 고유 경계를 확인한다.  
**Fixture**  A unavailable; ER-1 is reassigned to B.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  new assignment plus old history are retained.  
**Observed**  new assignment plus old history are retained. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 33 — Reassignment history deletion attack
**Purpose**  Reassignment history deletion attack의 고유 경계를 확인한다.  
**Fixture**  B assignment deletes A's prior assignment row/history.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  history deletion is forbidden.  
**Observed**  history deletion is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 34 — Handoff partial work
**Purpose**  Handoff partial work의 고유 경계를 확인한다.  
**Fixture**  A completed docs 1–8 and sends N1/WP-partial to B.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  handoff transfers explicit scope/context only.  
**Observed**  handoff transfers explicit scope/context only. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 35 — Owner plus contributor
**Purpose**  Owner plus contributor의 고유 경계를 확인한다.  
**Fixture**  A owns D1; B contributes specialist section.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  owner is not sole contributor.  
**Observed**  owner is not sole contributor. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 36 — Contributor ≠ reviewer
**Purpose**  Contributor ≠ reviewer의 고유 경계를 확인한다.  
**Fixture**  B contributes text; C has separate ReviewTask.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  contributor is not reviewer.  
**Observed**  contributor is not reviewer. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 37 — Associate draft to senior review
**Purpose**  Associate draft to senior review의 고유 경계를 확인한다.  
**Fixture**  Associate D1 creates explicit Senior ReviewTask.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  review chain is task-specific.  
**Observed**  review chain is task-specific. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 38 — Review queue bottleneck
**Purpose**  Review queue bottleneck의 고유 경계를 확인한다.  
**Fixture**  Five completed drafts await one reviewer.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  awaiting-review queue is valid.  
**Observed**  awaiting-review queue is valid. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 39 — Five associates / one reviewer
**Purpose**  Five associates / one reviewer의 고유 경계를 확인한다.  
**Fixture**  Five associates produce drafts requiring one partner.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  first-pass output can exceed review throughput.  
**Observed**  first-pass output can exceed review throughput. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 40 — Partner bottleneck
**Purpose**  Partner bottleneck의 고유 경계를 확인한다.  
**Fixture**  Partner already has strategy/review/client commitments.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  partner capacity is finite; new review can queue.  
**Observed**  partner capacity is finite; new review can queue. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 41 — Support eligible admin Task
**Purpose**  Support eligible admin Task의 고유 경계를 확인한다.  
**Fixture**  Indexing Task explicitly allows support_staff.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  valid role assignment.  
**Observed**  valid role assignment. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 42 — Support substantive attack
**Purpose**  Support substantive attack의 고유 경계를 확인한다.  
**Fixture**  Lawyer-only LegalResearch assigned to idle support S.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  invalid role gate.  
**Observed**  invalid role gate. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 43 — MatterTeam
**Purpose**  MatterTeam의 고유 경계를 확인한다.  
**Fixture**  M1 has P/A/B/S MatterTeam; M2 has no team.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  both team and solo Matter are valid.  
**Observed**  both team and solo Matter are valid. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 44 — Solo Matter no team
**Purpose**  Solo Matter no team의 고유 경계를 확인한다.  
**Fixture**  Player directly owns solo Matter Task.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  fixed team is not mandatory.  
**Observed**  fixed team is not mandatory. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 45 — Two concurrent Matters
**Purpose**  Two concurrent Matters의 고유 경계를 확인한다.  
**Fixture**  A has active commitments in M1 and M2.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  concurrency shares capacity.  
**Observed**  concurrency shares capacity. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 46 — Overcommitment
**Purpose**  Overcommitment의 고유 경계를 확인한다.  
**Fixture**  Player intentionally assigns beyond A's comfortable capacity.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  overcommitment is representable.  
**Observed**  overcommitment is representable. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 47 — Queue no capacity
**Purpose**  Queue no capacity의 고유 경계를 확인한다.  
**Fixture**  No eligible worker is free for LR-4.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  queued/no-capacity state persists.  
**Observed**  queued/no-capacity state persists. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 48 — Blocked queue
**Purpose**  Blocked queue의 고유 경계를 확인한다.  
**Fixture**  Task waits on pending acquisition dependency.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  blocked queue differs from no-capacity queue.  
**Observed**  blocked queue differs from no-capacity queue. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 49 — Low-priority starvation
**Purpose**  Low-priority starvation의 고유 경계를 확인한다.  
**Fixture**  Low-priority L is repeatedly deferred.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  starvation may persist; no auto-complete.  
**Observed**  starvation may persist; no auto-complete. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 50 — Escalation
**Purpose**  Escalation의 고유 경계를 확인한다.  
**Fixture**  Draft blocker requires client decision.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  explicit escalation/follow-up need is created.  
**Observed**  explicit escalation/follow-up need is created. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 51 — Cancellation
**Purpose**  Cancellation의 고유 경계를 확인한다.  
**Fixture**  Strategy changes; LR-4 is cancelled.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  cancellation is not completion and retains reason.  
**Observed**  cancellation is not completion and retains reason. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 52 — Duplicate research
**Purpose**  Duplicate research의 고유 경계를 확인한다.  
**Fixture**  A/B independently research same Issue.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  duplicate WorkProducts with provenance coexist.  
**Observed**  duplicate WorkProducts with provenance coexist. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 53 — Duplicate auto-delete attack
**Purpose**  Duplicate auto-delete attack의 고유 경계를 확인한다.  
**Fixture**  Later result deletes earlier duplicate.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  automatic deletion is forbidden.  
**Observed**  automatic deletion is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 54 — Conflicting draft versions
**Purpose**  Conflicting draft versions의 고유 경계를 확인한다.  
**Fixture**  D-A and D-B contain conflicting arguments.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  parallel versions remain separate.  
**Observed**  parallel versions remain separate. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 55 — CoordinationScore attack
**Purpose**  CoordinationScore attack의 고유 경계를 확인한다.  
**Fixture**  CoordinationScore 72 globally downgrades outputs.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  universal score is invalid.  
**Observed**  universal score is invalid. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 56 — ManagementSkill aura attack
**Purpose**  ManagementSkill aura attack의 고유 경계를 확인한다.  
**Fixture**  ManagerSkill 90 applies +20% firm efficiency without action.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  management aura is invalid.  
**Observed**  management aura is invalid. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 57 — Auto-assignment outcome oracle
**Purpose**  Auto-assignment outcome oracle의 고유 경계를 확인한다.  
**Fixture**  Hidden future says B yields better outcome; auto-router chooses B.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  future result oracle is forbidden.  
**Observed**  future result oracle is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 58 — Employee departure
**Purpose**  Employee departure의 고유 경계를 확인한다.  
**Fixture**  A leaves while ER-1 active.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  Task remains; handoff/reassignment required.  
**Observed**  Task remains; handoff/reassignment required. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 59 — New hire instant knowledge attack
**Purpose**  New hire instant knowledge attack의 고유 경계를 확인한다.  
**Fixture**  New hire N is shown every Matter detail automatically.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  instant context teleportation is forbidden.  
**Observed**  instant context teleportation is forbidden. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 60 — Deadline forecast
**Purpose**  Deadline forecast의 고유 경계를 확인한다.  
**Fixture**  Known deadline, queue, blocker support a risk warning.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  forecast is bounded and non-certain.  
**Observed**  forecast is bounded and non-certain. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 61 — Review bottleneck scaling attack
**Purpose**  Review bottleneck scaling attack의 고유 경계를 확인한다.  
**Fixture**  Five associates added, reviewer count unchanged.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  first-pass queue can grow; not linear total throughput.  
**Observed**  first-pass queue can grow; not linear total throughput. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 62 — Cross-Matter overload attack
**Purpose**  Cross-Matter overload attack의 고유 경계를 확인한다.  
**Fixture**  A has M1=20, M2=20, M3=15 declared commitments.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  person-wide aggregation prevents local availability fiction.  
**Observed**  person-wide aggregation prevents local availability fiction. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 63 — Dependency/priority conflict attack
**Purpose**  Dependency/priority conflict attack의 고유 경계를 확인한다.  
**Fixture**  Critical DR depends on unfinished LR.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  priority can reprioritize LR, not invent WP.  
**Observed**  priority can reprioritize LR, not invent WP. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 64 — Handoff knowledge teleportation attack
**Purpose**  Handoff knowledge teleportation attack의 고유 경계를 확인한다.  
**Fixture**  New associate receives reassigned Task without notes/refs.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  only explicit handoff context is usable.  
**Observed**  only explicit handoff context is usable. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 65 — Auto-assignment hidden-correct-worker attack
**Purpose**  Auto-assignment hidden-correct-worker attack의 고유 경계를 확인한다.  
**Fixture**  Two eligible lawyers; hidden outcome favors B.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  auto-assignment cannot use hidden correctness.  
**Observed**  auto-assignment cannot use hidden correctness. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 66 — Firm-growth linear multiplier attack
**Purpose**  Firm-growth linear multiplier attack의 고유 경계를 확인한다.  
**Fixture**  Solo throughput 1; nine hires added.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  growth yields possible parallelism plus coordination/review bottlenecks, not ×10.  
**Observed**  growth yields possible parallelism plus coordination/review bottlenecks, not ×10. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 67 — Cross-Matter simultaneous deadline collision
**Purpose**  Cross-Matter simultaneous deadline collision의 고유 경계를 확인한다.  
**Fixture**  A has D1 in M1, ER2 in M2, interview prep IP3 in M3 all due T1.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  one worker's commitments collide across Matters.  
**Observed**  one worker's commitments collide across Matters. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 68 — Reviewer-as-contributor conflict collapse attack
**Purpose**  Reviewer-as-contributor conflict collapse attack의 고유 경계를 확인한다.  
**Fixture**  Senior B contributed to D1 and is eligible reviewer.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  contribution event does not complete ReviewTask.  
**Observed**  contribution event does not complete ReviewTask. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 69 — Queue auto-resolution attack
**Purpose**  Queue auto-resolution attack의 고유 경계를 확인한다.  
**Fixture**  LR-4 queued because no eligible worker; unrelated Matter advances.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  time passage alone cannot complete queued Task.  
**Observed**  time passage alone cannot complete queued Task. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 70 — Overcommitment universal penalty attack
**Purpose**  Overcommitment universal penalty attack의 고유 경계를 확인한다.  
**Fixture**  A overcommitted; system applies quality −25% to every WP.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  no universal penalty; effects require task rule.  
**Observed**  no universal penalty; effects require task rule. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 71 — Matter ownership auto-assignment attack
**Purpose**  Matter ownership auto-assignment attack의 고유 경계를 확인한다.  
**Fixture**  Responsible Partner P owns M1; ER/LR/INT/DR are created.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  ownership does not auto-assign all Tasks.  
**Observed**  ownership does not auto-assign all Tasks. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

### Case 72 — Manager hidden-global-efficiency attack
**Purpose**  Manager hidden-global-efficiency attack의 고유 경계를 확인한다.  
**Fixture**  Manager M has strong profile but no ManagementTask/action.  
**Manual verification**  해당 Task/Matter/worker 상태, dependency·review·capacity·history와 금지된 자동 승격을 확인한다.  
**Expected**  no global ×0.8 duration or ×1.2 quality.  
**Observed**  no global ×0.8 duration or ×1.2 quality. DEC-026 semantics로 수동 도출; hidden outcome, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact time/capacity units, algorithms, role law, UI, AI, schema와 economic balancing은 NOT TESTED / TBD.

## 5. Task lifecycle pressure test

TD-1 → TI-1 → Assignment A1 → reservation → execution → WP-1 → ReviewTask RV-1 → completion/acceptance를 단계별로 적용한다. assigned ≠ started, started ≠ completed, completed ≠ reviewed, reviewed ≠ accepted를 모두 PASS로 확인한다.

## 6. Eligibility / suitability / capacity pressure test

Specialist A가 loaded, generalist B가 free, support S가 idle인 lawyer-only Task를 비교한다. S는 role gate에서 제외되고 A/B 선택은 visible tradeoff이며 capability가 capacity를 만들지 않는다. PASS.

## 7. Cross-Matter workload pressure test

A의 M1/M2/M3 commitments를 한 person-wide workload로 집계한다. per-Matter reset과 simultaneous deadline 충돌은 금지되며 exact units/probability는 발명하지 않는다. PASS.

## 8. Dependency/version pressure test

DR-1이 LR-WP-v1에 의존하고 v2가 나중에 생긴다. DR-1의 historical consumption은 v1에 고정되고 priority는 missing output을 만들지 않는다. PASS.

## 9. Parallel/review bottleneck pressure test

독립 ER/INT/LR는 병렬 수행할 수 있지만 WorkProducts는 auto-merge하지 않는다. 다수 associate와 제한된 reviewer/partner는 awaiting-review queue를 만들 수 있다. PASS.

## 10. Handoff/reassignment/history pressure test

partial scope, notes, WorkProduct, authorized snapshot만 handoff한다. old assignment, duplicate work, cancellation, departure와 failed history는 보존된다. PASS.

## 11. Queue/overcommitment/forecast pressure test

no-capacity, dependency-blocked, starvation, overcommitment, escalation과 bounded deadline forecast를 구분한다. 시간 경과만으로 queue를 완료하지 않으며 forecast는 certainty가 아니다. PASS.

## 12. Direct/delegated/automation pressure test

player와 delegated worker는 DEC-018 ontology를 공유한다. auto-assignment/management는 visible eligibility, profile, workload, deadlines와 explicit actions만 사용하고 hidden future outcomes를 읽지 않는다. PASS.

## 13. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---|---|---|
| 1 | TaskDefinition ≠ TaskInstance | PASS | targeted lifecycle, scaling or attack fixture |
| 2 | TaskInstance ≠ TaskAssignment | PASS | targeted lifecycle, scaling or attack fixture |
| 3 | Assignment ≠ start | PASS | targeted lifecycle, scaling or attack fixture |
| 4 | Start ≠ completion | PASS | targeted lifecycle, scaling or attack fixture |
| 5 | Completion ≠ review | PASS | targeted lifecycle, scaling or attack fixture |
| 6 | Review ≠ acceptance | PASS | targeted lifecycle, scaling or attack fixture |
| 7 | Available ≠ eligible | PASS | targeted lifecycle, scaling or attack fixture |
| 8 | Eligible ≠ suitable | PASS | targeted lifecycle, scaling or attack fixture |
| 9 | Suitable ≠ guaranteed success | PASS | targeted lifecycle, scaling or attack fixture |
| 10 | Capacity ≠ capability | PASS | targeted lifecycle, scaling or attack fixture |
| 11 | Capability ≠ capacity | PASS | targeted lifecycle, scaling or attack fixture |
| 12 | Workload is cross-Matter | PASS | targeted lifecycle, scaling or attack fixture |
| 13 | No fresh capacity per Case | PASS | targeted lifecycle, scaling or attack fixture |
| 14 | Task demand is structured | PASS | targeted lifecycle, scaling or attack fixture |
| 15 | No universal DifficultyScore | PASS | targeted lifecycle, scaling or attack fixture |
| 16 | No universal WorkerFitScore | PASS | targeted lifecycle, scaling or attack fixture |
| 17 | No universal WorkloadPenalty | PASS | targeted lifecycle, scaling or attack fixture |
| 18 | No universal CoordinationScore | PASS | targeted lifecycle, scaling or attack fixture |
| 19 | Dependencies cannot be silently bypassed | PASS | targeted lifecycle, scaling or attack fixture |
| 20 | Blocked Task may remain assigned | PASS | targeted lifecycle, scaling or attack fixture |
| 21 | Independent Tasks may proceed in parallel | PASS | targeted lifecycle, scaling or attack fixture |
| 22 | Parallel Tasks do not auto-merge | PASS | targeted lifecycle, scaling or attack fixture |
| 23 | Shared dependency version preserved | PASS | targeted lifecycle, scaling or attack fixture |
| 24 | Priority ≠ truth | PASS | targeted lifecycle, scaling or attack fixture |
| 25 | Priority ≠ legal decisiveness | PASS | targeted lifecycle, scaling or attack fixture |
| 26 | Urgency ≠ importance | PASS | targeted lifecycle, scaling or attack fixture |
| 27 | Deadline provenance preserved | PASS | targeted lifecycle, scaling or attack fixture |
| 28 | Scheduled ≠ executed | PASS | targeted lifecycle, scaling or attack fixture |
| 29 | Reassignment preserves old assignment | PASS | targeted lifecycle, scaling or attack fixture |
| 30 | Handoff preserves prior work | PASS | targeted lifecycle, scaling or attack fixture |
| 31 | Task owner ≠ sole contributor | PASS | targeted lifecycle, scaling or attack fixture |
| 32 | Contributor ≠ reviewer | PASS | targeted lifecycle, scaling or attack fixture |
| 33 | Reviewer ≠ owner automatically | PASS | targeted lifecycle, scaling or attack fixture |
| 34 | Review bottleneck valid | PASS | targeted lifecycle, scaling or attack fixture |
| 35 | Partner bottleneck valid | PASS | targeted lifecycle, scaling or attack fixture |
| 36 | Support staff ≠ weaker lawyer | PASS | targeted lifecycle, scaling or attack fixture |
| 37 | Matter ownership ≠ auto-assignment | PASS | targeted lifecycle, scaling or attack fixture |
| 38 | MatterTeam optional | PASS | targeted lifecycle, scaling or attack fixture |
| 39 | Multi-Matter workload shares capacity | PASS | targeted lifecycle, scaling or attack fixture |
| 40 | Overcommitment valid | PASS | targeted lifecycle, scaling or attack fixture |
| 41 | Queue valid | PASS | targeted lifecycle, scaling or attack fixture |
| 42 | Starvation valid | PASS | targeted lifecycle, scaling or attack fixture |
| 43 | Cancellation ≠ completion | PASS | targeted lifecycle, scaling or attack fixture |
| 44 | Duplicate work valid | PASS | targeted lifecycle, scaling or attack fixture |
| 45 | Coordination defect ≠ hidden outcome | PASS | targeted lifecycle, scaling or attack fixture |
| 46 | Recommendation ≠ correct assignment | PASS | targeted lifecycle, scaling or attack fixture |
| 47 | Auto-assignment has no result oracle | PASS | targeted lifecycle, scaling or attack fixture |
| 48 | Work consumes finite capacity | PASS | targeted lifecycle, scaling or attack fixture |
| 49 | Partial progress valid | PASS | targeted lifecycle, scaling or attack fixture |
| 50 | Interruptions preserve history | PASS | targeted lifecycle, scaling or attack fixture |
| 51 | Departure does not delete Tasks | PASS | targeted lifecycle, scaling or attack fixture |
| 52 | Hiring does not grant instant Case knowledge | PASS | targeted lifecycle, scaling or attack fixture |
| 53 | Automation does not collapse substantive Tasks | PASS | targeted lifecycle, scaling or attack fixture |
| 54 | Forecast ≠ guarantee | PASS | targeted lifecycle, scaling or attack fixture |
| 55 | Assignment does not query ActualStateRecord | PASS | targeted lifecycle, scaling or attack fixture |
| 56 | Assignment does not query hidden legal model | PASS | targeted lifecycle, scaling or attack fixture |
| 57 | Assignment does not know future CourtFactFinding | PASS | targeted lifecycle, scaling or attack fixture |
| 58 | Direct/delegated execution preserves DEC-018 ontology | PASS | targeted lifecycle, scaling or attack fixture |
| 59 | All operational changes provenance-bearing | PASS | targeted lifecycle, scaling or attack fixture |
| 60 | Reload does not reroll materialized events | PASS | targeted lifecycle, scaling or attack fixture |

## 14. Contradiction audit

DEC-026 내부 및 DEC-025/024/023/022/021/020/019/018/017/016 inherited boundary와 모순 없음. Assignment/execution, capacity/capability, eligibility/suitability, per-Matter reset, scores, dependency/priority bypass, version mutation, auto-merge, reassignment/handoff, review bottleneck, role collapse, ownership auto-assignment, queue resolution, duplicate deletion, hidden oracle, linear growth, forecast certainty, ActualStateRecord/legal/court access와 reload reroll을 모두 거부한다.

## 15. False-PASS audit

PASS는 DEC-026 semantic boundary와 fixture-declared operational facts에만 근거한다. exact hours, durations, throughput, worker probability, review ratio, Korean staffing restriction, management bonus 또는 future legal outcome을 발명하지 않았다.

## 16. False-PARTIAL audit

Core case에는 semantic ambiguity가 없다. time unit, capacity formula, scheduling/queue algorithm, role law, UI, AI, economics가 TBD인 것만으로 PARTIAL을 부여하지 않는다.

## 17. Special ambiguity audit

Cross-Matter capacity는 person-wide로, review bottleneck은 valid queue로, high priority는 dependency를 우회하지 않는 것으로, handoff는 explicit context로, auto-assignment는 visible operational inputs로, firm growth는 non-linear graph로 결정된다. 모두 PASS.

## 18. Remaining TBD / NOT TESTED

- operational time unit and Task duration
- capacity/workload measurement and scheduling
- priority vocabulary and queue policy
- collaboration/review-chain/MatterTeam schema
- support-role and Korean staffing rules
- availability/HR and management actions
- recommendation/auto-assignment/forecast algorithms
- UI/dashboard and NPC management AI
- firm economics/billing
- save/schema/API/Godot
- balancing/performance

## 19. Final verification summary

```text
Total core cases: 72
PASS: 72
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none  
FAIL cases: none  
Arithmetic: 72 + 0 + 0 = 72.

- DEC-026 reopen required: No.
- Internal contradiction: None found.
- Inherited boundary violation: None.
- Assignment/execution, capacity/capability and availability/eligibility/suitability collapse: None.
- Per-Matter reset, dependency/priority bypass, version mutation: None.
- Review/partner bottleneck, handoff teleportation, queue auto-resolution, overcommitment penalty, ownership auto-assignment: None.
- Duplicate work loss, support-role collapse, auto-assignment/management oracle, linear multiplier: None.
- Forecast certainty, hidden factual/legal/court access, reload reroll: None.
- Issue blocking DEC-026 promotion: None.
- Issue blocking DEC-027: None.

## 20. Promotion recommendation

```text
DEC-026 v0.2 — Accepted
TEST-025 v0.2 — Accepted / manual fixture-level verification
```

TEST-025은 DEC status를 자동 변경하지 않는다.

## 21. Next DEC recommendation

`DEC-027 — Client Interaction / Advice`를 다음 후보로 평가한다. Task/workload/team graph가 clean하면 CaseTheory·risk·strategy에서 advice, client decision, authorization과 strategic Task로 이어지는 bridge가 다음 경계다.

## 22. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-026의 72개 case-specific fixture와 60개 invariant를 수동 적용; 모든 case PASS, PARTIAL/FAIL 없음. |
| v0.2 | Accepted / manual fixture-level verification | Existing 72 PASS / 0 PARTIAL / 0 FAIL result를 design review에서 승인하고 DEC-026 v0.2 Accepted와 정렬했다. |

