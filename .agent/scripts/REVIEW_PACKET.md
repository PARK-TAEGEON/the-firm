# VS Orchestrator bounded closure and review fix handoff

Purpose: automatically close eligible design-document blockers and re-review
focused implementation fixes without manual prompt copying. No gameplay code,
project design decisions or production regression logs changed by this upgrade.
Preserves the existing uncommitted BOM-safe/predecessor/test-runner changes.

Changed files for this upgrade:
- ../prompts/design-closure-vs.md: reusable minimum document closure role with
  READY/BLOCKED JSON, source/status checks, prohibited implementation and approval fabrication.
- start-vs.ps1: explicit Planner blocker_kind, at most two workspace-write design
  cycles with all-file scope audit and diff validation, automatic Planner reruns;
  at most two focused Reviewer fixes with full tests and independent re-review.
- self-test.ps1: six additional fixture modes, cycle/call/commit gates, changed,
  deleted and ignored executable-file rejection, retesting every review fix.
- README.md: bounded loops, document policy, evidence layout and fixture details.
- test-results.log and this packet: current validation and handoff.

Invariants: implementation requires Planner READY; only Reviewer PASS authorizes
host archive/commit/publish. Other blockers and failed scope/tests stop. Closure
documents are audited and frozen after READY, except the host's active contract
replacement. HEAD/index and read-only snapshot gates remain. Predecessor discovery,
BOM-free JSON and publication logic remain. No next VS work.

Validation: staged scripts ran offline self-test on PowerShell 7 and Windows
PowerShell 5.1. Both: 27 fixture groups, 189 generated JSON/schema/event files
strictly parsed and BOM-free, zero failures, exit code 0. Windows 5.1 additionally
asserts the specific scope-violation reason and tests.json for each fix cycle.
Whitespace checks of staged changes passed (diff --no-index returns 1 for differences).

Codex/Godot are mocks; Git fixture worktrees/history/commits are disposable local
repositories. No real Codex or gameplay regression invocation, real VS implementation,
commit or push. Design closure uses git diff --check; runtime regressions are deferred
to the READY contract's runner/log authorization. Owner-dependent unresolved
decisions remain BLOCKED. Stopped runs preserve partial changes for inspection and
require a clean reviewed worktree before another invocation; no automatic rollback.

Resume VS-006 with explicit Repository and the README's verified Godot console
path; normal successful runs retain the original automatic commit behavior.
