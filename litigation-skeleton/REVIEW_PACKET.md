# Litigation hardening v0.2 review packet

## Purpose

Strengthen the test oracle and refresh the regression log while preserving the existing litigation service implementation and domain behavior.

## Changed files

- `tests/run_regressions.gd`
  - Extended `reject_unchanged()` with an expected error code.
  - Every rejection assertion now checks rejection, exact `result.error`, and deep snapshot equality after the command.
  - Moved the missing-remand-scope case to a separate state containing the case through Supreme and no remand stage. It now specifically asserts `invalid_remand_scope`.
  - Renamed self/future reference cases to describe rejection of nonexistent self/future references. They assert `invalid_prior_judgment`; they do not claim cycle detection.
  - Built the incomplete-review case from an actual completed `T14` time entry, then used setup-only state injection to mark its commitment active. The review uses `time_id: T14` and reaches `review_requires_completed_commitment`.
- `test-results.log`
  - Replaced the stale result with the latest full regression run.
- `REVIEW_PACKET.md`
  - Updated this handoff packet for the current test-only hardening work.

## Oracle changes

`reject_unchanged(service, command, expected_error, label)` captures a deep snapshot before applying the command, checks that the command is rejected, checks exact equality of `result.error` and `expected_error`, and checks that the snapshot is unchanged afterward.

The current run verifies the service's actual validation codes, including `invalid_remand_scope`, `invalid_prior_judgment`, `review_requires_actual_work`, `review_requires_completed_commitment`, and all other rejection cases in the regression script.

## Fixture and injected state boundaries

- Judgment, Reason, AppealTarget, and RemandScope outcomes remain injected fixed inputs from the existing fixtures.
- The Supreme-only remand test replays the existing fixtures only through `JS-R`; it does not invent a new domain rule or remand outcome.
- The incomplete-review test uses the existing `T14` completed time entry and performs a test-only setup mutation of `C14.active` so the service's completed-commitment branch can be exercised. This is explicitly fixture/injected test state, not a public gameplay operation.
- Self/circular/future tests cover nonexistent or append-order-invalid references only. Public append-only commands cannot construct a cycle, and no cycle-detection behavior is claimed.

## Verification

Command:

```powershell
& 'C:\Users\Admin\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe' --headless --path . --log-file ./test-results.log --script res://tests/run_regressions.gd
```

- Total checks: **214**
- Failures: **0**
- Exit code: **0**
- Result: **PASS**

## Service implementation status

`services/litigation_service.gd` was not modified. No new game rule or feature was added. Judgment generation, AI, precedent, admissibility, workload, UI, save, and integration behavior remain outside this skeleton's implemented scope.

## TBD / not implemented

- Automatic judgment generation or legal reasoning
- Cycle construction/detection beyond public append-only reference validation
- Appellate admissibility, evidence admissibility, precedent effect, and dependency expansion
- Workload formula, judge/opponent AI, and Career/Business/World integration
- UI and save/migration system
