# Independent review — management audit, 2026-10-25

Reviewer: independent agent, read-only for implementation. Review target: the standalone `THE_FIRM_Management_Play_v0.3_Source.zip`, not the older main Git repository. This file is the reviewer's only authored project file.

## Scope and evidence

- `TASK.md`, `RULES.md`, actual `src/engine.js`, `src/ui.js`, original tests, new audit regressions, and before/after diffs were inspected.
- The current product is one authored five-workday scenario. It has two committed cases and one accept/decline offer, seven preparation tasks when accepted, four staff, deterministic scheduling, invoices/receipts, daily reports, browser persistence and JSON import/export.
- `ready` means preparation tasks completed, not legal success or case closure. Capabilities, hiring, repeat intake, changing market demand, payroll, default/credit, bankruptcy, and long campaigns are not implemented. Staff specialty text has no productivity bonus. This is consistent with RULES; evaluation must not invent those systems.
- Godot is a separate read-only snapshot UI. This reviewer did not run or change Godot.

## Reproduced findings

1. **Completion history could be falsified on import.** Decline intake, advance all five days, move `jung-organize` from `reports[2].completed` to `reports[0].completed`, set its `completedDay=0`: original validator accepted it although day 0 had only 3/8 hours. Actual completion was day 2, after its day 1 deadline. This changes displayed history and on-time results. Sent to engine owner; fixed by checking the day recorded cumulative work first reaches required hours.
2. **Upfront invoice did not have to match the contract.** Immediately after acceptance, changing the upfront invoice amount to 999,999,999 passed the original validator and forecast a 1,019,883,999 cash balance. The contract was still 2,400,000 upfront. Sent to owner; contract/invoice consistency is now enforced.
3. **An imported valid event ID could block the next command.** An initial event named `event-0002` passed validation; acceptance generated the same ID from array length and failed. The generator now selects an unused ID and preserves prior events.
4. **Temporary cash shortages were hidden by the UI.** In a separate valid fixture with opening cash 100,000, accept intake and leave assignments at defaults: day 0 cash is -274,000, but week-end cash is +4,184,000. `forecast.warnings` already contained `cash_shortfall`; the original UI never read it. Sent to UI owner for a shared visible warning. This was directly verified in engine execution; initial UI omission was verified in code.
5. **Event-count limit could softlock a legal play sequence (P2), now resolved.** Decline, then toggle `go-memo` priority between 1 and 2 exactly 998 times. In the original engine, day 0 has 1,000 events and `validateState` succeeds; advancing fails because the next event exceeds the validator's count bound. The corrected bound reserves room for intake decisions, day-close events and task completions while limiting additional assignment/priority edits atomically. Prior events remain intact. The independent final rerun verified acceptance and rejection paths at the boundary, both before and after an intake decision.

## Engine patch review

At 15:41 KST, independently reviewed the engine diff and ran:

```sh
node --test tests/engine.test.cjs tests/audit-regressions.cjs
```

Result: **24 tests, 24 passed, 0 failed, exit 0** (16 original plus 8 audit regressions). The audit suite covers more cases than this reviewer's direct repro list: wrong invoice case/timing, renamed balance-trigger task, already-due invoices restored as unpaid, exact snapshot continuation, and configurable initial balance fixtures.

Current patch is **PASS for the reviewed engine corrections**, including the subsequent event-count correction described below. Default economic numbers are unchanged. Canonical IDs and exact payment dates are appropriate for this fixed authored scenario; they are not a general-purpose campaign save format. Numeric starting fixtures for hourly costs, capacity, preparation hours, and fees remain permitted.

## Economic and UI decisions that need human judgment

- Five-day closing cash alone can reward slow or neglected work: ongoing work costs money, accepted intake pays an upfront amount, and missed deadlines have no refund or later reputation/customer consequence. This is a known model boundary, not evidence of a duplicate-payment bug. Compare cash together with preparation completion and overdue hours.
- A last-day preparation completion earns a receivable payable outside the playable horizon; cash-only comparisons understate that plan's earned receipts. Report cash and outstanding receivables separately.
- Transferring work has no transition cost by design. It is valid to exploit different remaining capacities within the experiment. Whether this creates satisfying scheduling or excessively mechanical handoffs requires play testing.
- Completed late tasks are shown as completed in several task/case summaries; the weekly report retains deadline history. Showing actual completion dates and missed deadlines alongside completion would improve scanning, but requires a presentation judgment.
- This review does not establish an always-optimal strategy, commercial balance, UI aesthetics, or enjoyable play.

## UI/build review

At 15:45 KST, independently reviewed `src/ui.js`, `tools/build.py`, and `tests/audit-ui.test.cjs`, then ran:

```sh
node --test tests/audit-ui.test.cjs
```

Result: **4 tests, 4 passed, 0 failed, exit 0**. These tests run the actual UI source in a minimal DOM, not a duplicated renderer. They check forecast shortfall with positive final cash across A/B/C and menu pages, current negative cash, changed imported capacity totals, and unchanged default totals/no false warning. They do not establish real layout or browser behavior.

The shared warning and dynamic capacity totals are appropriate narrow corrections. Explicit UTF-8 reads in the Python build remove dependence on Windows locale; no build algorithm changed. The warning title was corrected to “업무일 중 현금 부족 예상”, because the engine warning refers to any future negative closing balance, including one after the last receipt. Browser integration is left to the owner; no fresh browser run was performed by this reviewer.

## Final independent verification

After the event-count fix and warning wording correction, independently reran:

```sh
node --test tests/audit-regressions.cjs tests/audit-ui.test.cjs
```

Result: **14 tests, 14 passed, 0 failed, exit 0** (10 engine audit regressions plus 4 UI source-rendering tests). The two later engine checks confirm bounded edit-history exhaustion cannot prevent week closure, and initial state plus five representative normal command paths remain deeply equal to the preserved original engine's outputs. This final result supersedes the earlier 8-test engine-audit subset; the earlier independent original 16-test regression pass is recorded above. No blocking review findings remain for the reviewed corrections. Real-browser integration, layout evidence and final artifact packaging are the root owner's responsibility.
