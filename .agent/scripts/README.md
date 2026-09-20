# VS Orchestrator v0.3 (Windows PowerShell 5.1+)

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
there is no reset/rebase. Use -Resume for a hash-validated prior checkpoint.
Reviewer FIX REQUIRED invokes a focused Implementer fix within the frozen
contract, then all required tests/smoke and a fresh read-only Reviewer. At most
two fix cycles follow the initial review. Reviewer BLOCKED, Implementer BLOCKED,
failed tests/scope validation and unresolved third review stop immediately.
Reviewer PASS remains the sole transition to archive/commit/publication.
On unresolved FIX REQUIRED/BLOCKED, inspect saved files, resolve the issue and
arrange a new clean reviewed run manually. After commit/push/PR failures, finish the remaining
Git/gh action with -Resume; commit intent reconciles an already-created commit and gh checks existing PRs before creation.

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



## Crash resume
Use the same VS, branch, repository and Godot parameters with -Resume. The latest
run is selected under the VS lock; older runs are never silently substituted.
-InspectResume validates and prints the resume phase without invoking agents,
tests, commits or publication (it fetches main and imports pinned legacy metadata).
All predecessor PASS/history gates are rechecked against fetched origin/main.
A changed base blocks rather than rebasing an in-progress task.
Durable checkpoints record completed Planner, design closure, Planner recheck,
contract, each Implementer/tests/Reviewer cycle, PASS commit intent, completion
and publication. Replay skips completed phases and keeps the original max-two
closure/fix counters. SHA256 protects run evidence and the complete worktree
snapshot; unknown files, changed content, index, HEAD or checkpoint seal block.
No file is restored/deleted. Partial uncheckpointed code edits require manual
review; a filename allowlist alone does not authorize changed bytes.
Checkpoint replacement flushes to disk and is atomic; an interrupted seal write
fails closed. checkpoint.json.bak is retained for manual inspection. The SHA256
seal detects accidental/individual-file tampering; it is not a signature against
an attacker able to rewrite both checkpoint and seal.
The one legacy import is pinned to VS-006 run 20260916-203832-b1650e99, base
947154c01f8cac5a2d034605643235fe3d63e791 and the exact inspected SHA256 values
of the three owned files plus completed closure/READY/contract evidence.
It preserves all prior artifacts. A valid recovered role result determines the next phase.
Normal execution retains PASS-only automatic commit behavior; this development
task does not run that command, commit or push the real repository.

An interrupted agent's original input/schema/event/stderr files are retained;
a new resumed-ROLE-id folder receives retry diagnostics. Its newly validated
result is saved at the canonical result path for checkpoint replay.


## Implementation BLOCKED correction
Implementer now returns blocker_kind: none, design_closure, or other. Only an
explicit design_closure BLOCKED can reopen document closure; missing/invalid
classification fails closed. A valid environmental BLOCKED remains BLOCKED and cannot open design closure. Process/log diagnostics cannot override a valid authoritative result. Missing or invalid results stop as INFRASTRUCTURE.

The implementation correction budget is two per run, independent of the existing
two initial Planner closure cycles. Each correction is retained under
implementation-design-1/ or implementation-design-2/, with the original blocking
verdict, closure result/scope, Planner revalidation and revised contract snapshot.
Unresolved closure/Planner design BLOCKED consumes the same budget; closure and
Planner must BOTH be READY before implementation restarts. A non-design Planner
hard blocker stops immediately. Each revised contract retains the bounded
Reviewer fix loop and all regression, predecessor and PASS-only commit gates.

Correction may change only the active VS Task Contract and VS-identified Markdown
design/test documents (VS-XXX or VSXXX in the path). Existing broad Markdown and
symlink scope audits still apply. Production code, executable tests, predecessor
documents, unrelated governance and review archives remain forbidden to closure.
For VS-006, closure can explicitly authorize the minimum factual_basis_refs
preservation change in SubmissionService, or another allowed CourtRecord source;
only the subsequent Implementer may make the authorized production change.

Checkpoints seal design BLOCKED verdicts and each correction phase. Replay keeps
the consumed budget and skips historical implementation once a later closure is
sealed, so revised Accepted document bytes are checked against their new frozen
contract rather than an obsolete snapshot. Interrupted retries retain prior
inputs, schemas, events, stderr and result JSON in separate retry diagnostics.
Uncheckpointed edits still stop for manual inspection; no reset/rebase/rollback.

VS-006's existing checkpoint and worktree hashes validate against local origin/main 947154c. Its unsealed Implementer result parses and matches the checkpoint-bound legacy schema. It is BLOCKED, not READY, and has no blocker_kind. Recovery preserves that verdict without inferring a new classification: next phase is BLOCKED, with no Implementer retry, tests or Reviewer. Resolve the explicit contract/design contradiction separately before a newly authorized implementation.

Resume from any directory:
```powershell
& 'C:\Users\Admin\Documents\ChatGPT\The Firm\.agent\scripts\start-vs.ps1' `
  -VS 006 `
  -Resume `
  -Godot 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe'
```
The normal orchestrator commits only after Reviewer PASS. This upgrade itself
does not commit, push, invoke gameplay agents or change gameplay files.

## Authoritative role results and damaged JSONL
Every planner, design-closure, implementer and reviewer call (including nested
correction/fix cycles) validates its result against the exact saved schema:
required fields, property types, string arrays, enums, unexpected properties,
expected verdict, nonempty reason and blocker consistency. UTF-8 BOM input is
accepted. Valid result JSON is authoritative even with nonzero CLI exit or log
error text; a valid BLOCKED remains BLOCKED. Missing/invalid results alone cause
INFRASTRUCTURE. Scope, read-only, HEAD/index and test gates remain independent.

JSONL is parsed line by line. Only valid JSON lines are accepted. A malformed
last nonempty line flags event_stream_partial=true; malformed interior lines
flag event_stream_corrupt=true. Neither destroys a valid role result.
ROLE.diagnostics.json records counts, raw stream SHA256, result validity and exit
code (null when recovering an older run). ROLE.events.quarantine.json retains
invalid line numbers, raw content and parse errors. Original JSONL/stderr/result
bytes are preserved for inspection; no global raw-log string scan authorizes a
failure or design transition.

Before each process launch the host seals the exact input/schema and pre-role
worktree state. On resume it first verifies the checkpoint seal, all existing
evidence hashes, base/predecessor, complete file state, HEAD and index. A result
left after that checkpoint can be validated against its sealed schema and
registered without rerunning the role. Uncheckpointed code/document changes
still require manual inspection; a result cannot authorize changed bytes.
InspectResume computes recovery in memory without rewriting run artifacts.
Recovery seals new result/diagnostic hashes on actual Resume; repeated Resume
skips already completed work and keeps the design/fix budgets intact.
A legacy BLOCKED lacking blocker_kind is retained as a hard BLOCKED, never
retrospectively relabelled as design_closure. READY proceeds to tests; PASS is
still the only commit/publish gate. This repair does not run a real VS task.

Self-tests additionally cover authoritative BOM result plus final truncation,
missing result plus truncation, complete JSONL, corrupt middle line, schema
negative cases, valid result plus nonzero exit, recovery before role completion
checkpoint and repeated resume without duplicate agents/commits. Intentionally
damaged raw fixtures are retained outside the ordinary parseability audit or
explicitly audited through the defensive parser instead.
## Legacy BLOCKED migration (2026-09-16)

A saved-schema-valid BLOCKED Planner/Implementer result without blocker_kind is
never classified from reason keywords. The host invokes blocker-classifier with
read-only sandbox and a strict two-field schema: verdict is exactly one of
 design_contract, infrastructure, implementation, unknown; reason gives concise
cited evidence. Inputs include the immutable result/schema, saved active contract,
Accepted DEC status headers with complete file hashes, and invocation/run metadata.
The separate legacy-<role>/binding.json and classifier schema/result/diagnostics
are hashed in checkpoint evidence. The original BLOCKED result is unchanged.
Repeated resume reuses the sealed classification; tampered evidence blocks replay.
A crash before classification is sealed preserves prior I/O in a resumed directory.

Only design_contract enters the existing bounded correction loop. Infrastructure
stops as INFRASTRUCTURE, implementation stops for focused implementation handling,
and unknown stops safely. Modern explicit blocker_kind routing and environmental
vetoes remain unchanged. Initial Planner closure, implementation correction and
Reviewer fixes retain their existing limit of two per loop. Predecessor/hash gates,
partial JSONL handling, BOM-safe JSON and PASS-only completion remain in force.

-Resume -PrepareLegacyResume performs migration and document correction/revalidation
but stops before any pending Implementer, regression execution, archive/commit or
publish. It requires Resume and rejects Publish. Use this to preserve gameplay
while preparing the revised contract. Ordinary Resume restarts Implementer under
that contract and retains the existing PASS-only automatic commit behavior.

New fixtures cover all four outcomes (same contradiction text, different classifier
verdict), tampered classifier bytes, repeated resume idempotence, and the exact
current VS-006 legacy result pinned by SHA256. Codex/Godot remain injected in
self-tests; the current VS-006 classifier/design-closure/Planner migration is real.

Git scope audit: Invoke-FirmGitResult separates stdout, stderr and exit status.
Invoke-FirmGit returns only stdout and emits successful stderr as warnings. No
warning-text filtering or user Git configuration changes are used. Actual Git
failures remain fatal; ancestor/show-ref use their documented 0/1 semantics.
Run git-scope-self-test.ps1 for real CRLF-warning, clean/outside-scope and Git
failure coverage; self-test.ps1 also invokes it. Tests use disposable local repos.
