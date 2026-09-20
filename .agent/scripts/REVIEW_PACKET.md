# VS Orchestrator Git scope audit repair

Changed: start-vs.ps1, self-test.ps1, git-scope-self-test.ps1, README.md,
REVIEW_PACKET.md, test-results.log, all under .agent/scripts.

All production Git entrypoints in start-vs.ps1 were inspected. Related resume,
legacy-blocker and role-artifacts helpers use Invoke-FirmGit; test-vs.ps1 has no
Git wrapper. Successful stdout alone reaches path/hash/porcelain consumers;
stderr is retained as warning diagnostics, nonzero exits as failure diagnostics.
Ancestor and show-ref retain expected 0/1 semantics; unexpected exits fail closed.
No global/local user Git config changes or safecrlf suppression are needed.

New test extracts the actual final scope guard and actual wrappers from AST.
Real native Git emits CRLF stderr, clean scope passes, unauthorized untracked
path fails, missing revision fails with code/diagnostics, ancestor checks pass.
Disposable fixture commits/remotes only; no target commit/push or gameplay edits.

Existing self-test expected stale 'BLOCKED: fixture' text; baseline fails too.
Assertions now accept current '[other]' route prefix. AST function extraction
includes new dependency. No production role/resume/closure logic changed.

Regression results and checkpoint inspection: see accompanying output logs.
Checkpoint has completed implementation-design-1/implementer; NEXT Tests cycle 0.
Seal/evidence/identity/predecessor validation passes, but seven gameplay test logs
changed since checkpoint. Current resume fails closed on these state hashes.
Checkpoint is deliberately not resealed, logs not restored, design not replayed.
Remote freshness was not fetched during inspection. Closure/reviewer loops,
partial JSONL, BOM-safe JSON, PASS-only archive/commit/publish remain unchanged.

Final validation: PowerShell 5.1 and 7 each pass 75 existing fixture groups and
5 new scope/Git groups, failure 0, exit 0. PS5.1 scope suite ran separately;
PS7 invokes it through self-test. Diff whitespace and installation hashes pass.
