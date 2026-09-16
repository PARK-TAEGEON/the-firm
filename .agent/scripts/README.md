# VS Orchestrator v0.2 (Windows PowerShell 5.1+)

Run from the repository root:

```powershell
& .\.agent\scripts\start-vs.ps1 -VS 006 -DryRun
& .\.agent\scripts\start-vs.ps1 -VS 006 -Smoke
& .\.agent\scripts\start-vs.ps1 -VS 006 -Godot 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe'
# Explicit authorization to push and create a PR after PASS:
& .\.agent\scripts\start-vs.ps1 -VS 006 -Godot 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' -Publish
```

`-DryRun` reads local main and predecessor evidence, validates PASS and Git ancestry, and prints resolved values without fetching or changing the repository. `-Smoke` makes one
read-only Codex structured-output call in the source repository, writes handoff
files, and does not create a worktree, run gameplay tests, commit or publish.

Normal mode fetches origin/main without moving local main. For VS-N, omitted
`-PreviousReview` defaults to `.agent/reviews/VS-(N-1).md`. The archive must name
the predecessor and contain exactly one explicit Reviewer PASS. An omitted
`-PreviousFinalCommit` resolves from `Implementation commit:` metadata, or from
the Git commit that last saved the tracked archive (successful orchestrator
runs commit their approved archive atomically with the implementation).
The commit must identify the predecessor implementation and be an ancestor of
latest origin/main. Git first-parent ancestry identifies its integration commit;
merge messages alone never authorize progression. Explicit parameters remain
supported, but cannot contradict the approved implementation metadata.

Historical bootstrap: VS-005 archive restores the project owner's completed
review facts for implementation `6d08726`, design `7d40e8c` / `2b62636`, integrated
through `4652a20`. If an archive is absent from latest main, local historical
PASS evidence requires explicit implementation and `Merged to main via:` metadata
verified against that history. Normal mode prefers evidence tracked on main;
DryRun checks a local edited archive and blocks invalid evidence. New PASS runs
persist their archives in the implementation commit, requiring no bootstrap.
The resolved evidence is also saved in the run and supplied to the planner,
including for a historical archive not yet tracked on main. Missing/invalid PASS,
unmerged/wrong implementation, conflicting metadata or incorrect historical
integration stops before agent execution. DryRun uses local main, so its result
is a preview; normal mode revalidates against freshly fetched origin/main.
Planner independently validates evidence, required tests and Accepted design gates.
Missing VS-006 accepted design/contract decisions cause Planner BLOCKED with
machine-readable `blocker_kind=design_closure`. Only that classification invokes
the reusable `../prompts/design-closure-vs.md` role in workspace-write mode.
Other BLOCKED reasons stop immediately; failed predecessor PASS/merge gates remain
outside this loop. Planner READY must use `blocker_kind=none`.

The host permits at most two design-closure cycles per invocation. Each cycle
saves the blocking Planner verdict, invokes closure, audits all tracked/untracked
files (including ignored files) against a Markdown-only document policy, runs
`git diff --check`, records closure-result.json and reruns the read-only Planner
even if closure itself returned BLOCKED. Only Planner READY proceeds. Document
scope covers root named governance/numbered architecture/DEC/TEST Markdown,
Markdown under docs/, .agent/tasks/ and .agent/plans/. Production, executable
tests/fixtures, scripts/prompts, review archives, configuration, assets and links
are prohibited. Scope violations stop without rollback; preserve evidence and
inspect the worktree manually. Design decisions requiring owner approval remain
BLOCKED; the role cannot fabricate acceptance or predecessor evidence.
Runtime regressions are deferred until the READY contract provides the required
runners and canonical-log allowlist. Closed documents are included in the final
reviewed change set and frozen during implementation (the host may replace the
active contract with Planner's READY text).

New branches are `task/vs-XXX`, with worktrees in sibling `THE-FIRM-VS/VS-XXX`.
Override with `-Branch PARK-TAEGEON/vs-006` or `-WorktreeRoot <directory>`.
An already registered matching branch reuses its existing worktree. Reuse requires
a clean worktree. A clean HEAD behind latest origin/main is fast-forwarded with
--ff-only before Planner/design closure; ancestry exit 1 is boolean false.
Dirty worktrees (staged/unstaged/untracked), ahead or diverged HEADs stop with
a BLOCKED diagnostic and preserve HEAD/index/files;
there is no reset/rebase or resume of partial implementation across invocations.
Reviewer FIX REQUIRED invokes a focused Implementer fix within the frozen
contract, then all required tests/smoke and a fresh read-only Reviewer. At most
two fix cycles follow the initial review. Reviewer BLOCKED, Implementer BLOCKED,
failed tests/scope validation and unresolved third review stop immediately.
Reviewer PASS remains the sole transition to archive/commit/publication.
On unresolved FIX REQUIRED/BLOCKED, inspect saved files, resolve the issue and
arrange a new clean reviewed run manually. After commit/push/PR failures, finish the remaining
Git/gh action manually; do not rerun implementation on a committed task branch.

Handoffs live in each target worktree at `.agent/runs/VS-XXX/<timestamp-id>/`:
invocation, input prompts, schemas, final JSON verdicts, JSONL events, stderr,
frozen contract, suite logs, tests.json, completion.json or stopped.json. A lock
prevents overlapping phase execution. Runs are locally excluded via Git
info/exclude (shared by worktrees), never staged. Every invocation has a new run
directory so old PASS/test outputs cannot authorize a new run. Design cycles use
design-closure-1/ and design-closure-2/ with scope.json, closure-result.json and
fresh Planner outputs; fix cycles use review-fix-1/ and review-fix-2/ with preceding
reviewer-feedback.json, fresh Implementer/Reviewer outputs and tests.json/logs.
All machine JSON/schema/event files remain BOM-free.

Planner remains read-only, returning full contract text and an exact file
allowlist as structured JSON. The host writes the contract only on READY; the
existing reusable planner prompt is preserved. Implementer runs workspace-write,
cannot change the contract or Git history/index. Reviewer runs read-only, with
file snapshots checked around both read-only roles. The host checks changed
files against Planner's exact allowlist (plus the contract), checks all legacy,
VS-001 through current VS runners and main-scene smoke, and stops on nonzero exit,
Godot errors, absent/zero-check regression summaries or nonzero failures.
Canonical test logs must be authorized explicitly in the contract's allowlist;
the orchestrator never silently extends implementation scope. GUI interactions
are not automated; Reviewer must assess any GUI acceptance criteria truthfully.

PASS archives the review packet plus verdict under `.agent/reviews/VS-XXX.md`,
then commits only audited task files, contract and archive. `-Publish` additionally
pushes and creates a PR using a body file. No auto-merge or next-task activation.
Agents themselves are instructed never to stage, commit, push or create PRs.
`-Publish` is the explicit operator instruction governing host publication; it
does not authorize an agent to ignore a contract's scope/design rules.

Setup: authenticated `codex` and `gh`, Git with origin/main, configured Git author,
Godot 4.7.2 CLI (matching repository CI), executable access and write access to
the repository/worktree parent. Godot is not currently on PATH; use `-Godot`.
No model override: Codex uses the operator's existing configuration. No bypass
of sandbox, hook trust or approval protections. Configure execution policy per
your Windows environment if scripts are blocked. Native tools run synchronously;
interrupt a stalled process manually. Automation installation remains uncommitted
and is read from the invoking script location, so prompts/scripts need not be
copied into each new worktree.

Structured Codex invocation follows the installed CLI help and
[official noninteractive documentation](https://developers.openai.com/codex/noninteractive/).

Offline gate checks: run .\.agent\scripts\self-test.ps1. It uses disposable local Git repositories and fake Codex/Godot; no authentication or publication. Fixture repositories are retained in the temporary directory for inspection.

Additional fixtures: DESIGN_SUCCESS (closure then Planner READY and final PASS),
DESIGN_REPEAT (two closure calls, three Planner calls, no implementation/commit),
DESIGN_SCOPE / DESIGN_IGNORED_SCOPE / DESIGN_DELETE_SCOPE (changed production,
ignored production or deleted executable test rejected before implementation),
FIX_SUCCESS (focused fix then PASS) and FIX REQUIRED (two fixes then stop without
commit). Existing predecessor, BOM, failed-test, scope and publication gates remain
covered. Fixture-only commits never touch the real project. Do not launch a full
VS run just to test orchestration: normal PASS automatically commits, even without
-Publish.

