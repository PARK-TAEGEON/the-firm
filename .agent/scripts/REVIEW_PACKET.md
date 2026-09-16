# VS Orchestrator stale-worktree fix

Purpose: safely resume VS-006 created at b91d2de before main advanced to 71f0718.

Changed files:
- start-vs.ps1: shared boolean ancestry helper (0=true, 1=false, unexpected exit throws); clean behind worktree fast-forward with --ff-only before Planner. Dirty/ahead/diverged worktrees stop with BLOCKED and preserve HEAD/index/files.
- self-test.ps1: real Git ancestry true/false/error fixtures; clean stale/current worktree fixtures; staged, unstaged, untracked, ahead and diverged refusal fixtures checking no agent calls and unchanged state.
- README.md: documents safe synchronization and refusal behavior.
- REVIEW_PACKET.md and test-results.log: current handoff and validation.

Validation: offline self-test on PowerShell 7 and Windows PowerShell 5.1; each 35 PASS fixture groups, 199 BOM-free parseable JSON/schema/event files, zero failures, exit 0. git diff --check passed.

Commands: pwsh -NoProfile -File .agent/scripts/self-test.ps1; powershell.exe -NoProfile -ExecutionPolicy Bypass -File .agent/scripts/self-test.ps1; git diff --check.

Preserved: predecessor PASS/integration detection, read-only/HEAD/index/scope/test hard gates, BOM-safe JSON, bounded design closure and reviewer fixes, archive/commit/optional publication behavior. Dirty worktrees remain refused even when at current main; detached unregistered task branches still require manual review.

Fixture-only: fake Codex/Godot and disposable local Git repositories/commits. No real gameplay tests required for this scripts-only change. No gameplay, design, production logs or prompts changed. No actual VS task run, real commit or push performed. Actual VS-006 inspected clean at b91d2de; synchronization is deferred until operator resumes.

Resume:
```powershell
& 'C:\Users\Admin\Documents\ChatGPT\The Firm\.agent\scripts\start-vs.ps1' -VS 006 -Repository 'C:\Users\Admin\Documents\ChatGPT\The Firm' -WorktreeRoot 'C:\Users\Admin\Documents\ChatGPT\THE-FIRM-VS' -Godot 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe'
```
Normal resumed PASS retains the existing automatic task commit behavior; publishing requires -Publish.
