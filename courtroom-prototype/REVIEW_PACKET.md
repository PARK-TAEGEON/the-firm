# Courtroom Core v0.3 review packet

## Purpose / authority
User-authorized v0.3 strengthens choices inside the existing isolated witness examination. Active contract: `.agent/tasks/COURTROOM-CORE-003.md`; experimental rules: `EXPERIMENT_RULES.md`. No Accepted Godot design change, no VS-007.

## Changed files and responsibilities
- `.agent/tasks/COURTROOM-CORE-003.md`: scope, authored balancing limits, test/completion contract.
- `courtroom-prototype/data/case.js`: signature-based response conditions; one familiarity rebuttal/qualification; theory conflict tags; separate raw-fact, framed and admission results.
- `engine/core.js`: canonical pressure signature/classification, counter availability and provenance evaluation; `evaluateRecord(definition, records, theoryId)` with no UI/history inputs; strategy/issue links; final-rule validation rejects selection/repetition conditions even when nested.
- `services/courtroom.js`: immutable pressure basis/history and linked rebuttal records; pure projected result prepared before mutation commit to retain failure atomicity.
- `ui/app.js`: in-place premise selection, focus/details/scroll preservation; distinct outcome/strategy feedback, counter buttons, mobile record sheet reusing original DOM (no duplicate IDs).
- `index.html`, `ui/courtroom.css`: version label, fixed mobile navigation and record dialog; accessible mobile issues/client objective.
- `tests/core.test.js`: existing 52 cases retained; only B's facts-only Stop expected code changes from WEAKENED to DOUBT_RECORDED, explicitly required by v0.3. Intent still unresolved.
- `tests/strategy.test.js`: 17 new strategic comparison, signature, counter, theory, provenance, content validation and record-only evaluation cases.
- `tests/browser.test.js`: previous 20 assertions retained plus 24 UI assertions; mobile counter flow, reinforced attack, all three styles, exact DOM identity/focus/disclosure/scroll checks and record sheet.
- `package.json`, `README.md`, `EXPERIMENT_RULES.md`, `test-results.log`, `REVIEW_PACKET.md`: version, test commands, authored rules, player instructions and evidence.
- Local ignored `THE-FIRM-Courtroom-Core-v0.3.zip`: portable source bundle. Prior v0.2 ZIP and original reference are unchanged.

## Enforced invariants
- Stop never creates admission, counter, Frame or an additional public position.
- Frame preserves validated 2–4 recorded premises in advocacy; no evidence conversion. Press-only advocacy cannot count as Frame.
- Pressure identity depends on plan + witness + canonical premise set. Reordering/removing/restoring previously-used premises cannot fake reinforcement. New unselected records are not reinforcement.
- The one counter route needs both original familiarity record and initial-uncertainty record. Original counter is never changed/deleted; a new qualification links both record IDs. Missing/duplicate routes fail atomically.
- Qualifying familiarity never qualifies sign light, and is not itself a full identification admission.
- Final evaluation reads records and theory only; lane selection, current plan and asked/press history are irrelevant. Selection-dependent authored final rules fail validation.
- Evidence finding remains the same across theory switches; strategic value is core/relevant/peripheral through Argument → Issue → Theory, with unresolved priority issues retained. Public positions outside those issues or facing active counters are explicitly marked review_required with commitmentReviewRefs; facts-only B retains flexible status.
- Selection preserves existing chip and record nodes, keyboard focus, open disclosures and scroll. Mobile sheet moves the record panel instead of cloning it.
- Existing monotonic IDs, copies, no duplicate propositions, deterministic replay and terminal-state protection retained.

## Verification
Final run: 69 Node tests + 44 browser assertions + 2280 existing Godot checks = 2393 tests/checks, zero failures, all exit 0. Godot main-scene smoke exits 0 with no engine errors. Exact counts/commands are in `test-results.log`.

Commands:
- `node --test courtroom-prototype/tests/core.test.js courtroom-prototype/tests/strategy.test.js`
- `NODE_PATH=<bundled packages> node courtroom-prototype/tests/browser.test.js`
- Godot 4.7.2 headless: legacy runner plus VS-001 through VS-006, with log output under local scoped `tests/artifacts/`.
- Godot main scene: `--headless --path litigation-skeleton --quit-after 3`.
- Scoped `git diff --check` and staged allowlist/diff review.

Actual Edge browser tests exercise desktop/mobile HTTP and direct file launch, all three response types, safe/framed/admission outcomes, familiarity rebuttal and reinforced admission, strategy changes, public commitments, reset, missing-basis affordance, dialogs, no horizontal overflow and UI-state preservation. Updated desktop and mobile-sheet captures were visually inspected.

During development the old B facts-only expectation correctly failed after removing Stop's automatic strong result; that one superseded assertion was updated with an explicit unresolved-intent check. Final tests pass. No Godot code/test expectation was changed.

## Fixture / unresolved design / scope
All response and outcome rules remain deterministic authored data for this one scene. There is no legal reasoning or witness AI. The civil fixture remains a test-only ID/role replacement, not civil gameplay. Qualified counters remain original testimony plus a scoped qualification, not admissibility determinations.

Public-position commitment is retained and affects strategy reporting, but no invented numerical penalty is charged. Safe play preserves flexibility, Frame produces reusable advocacy, Press has response risk and admission reward. Long-term balance after learning deterministic responses and the costs of inconsistent public positions still need player testing/design; no claim of proven global optimality. Closing is only a reusable record flag, not an implemented system.

Single witness/argument plan/issue finding retained. No new evidence submission system, objections, judge intervention, case, procedure framework, negotiation, appeal, save or Godot integration. Generic multi-issue weighting remains out of scope.

## Review disposition
Local self-review: PASS for the isolated v0.3 contract after code/diff review, final regressions and browser inspection. Not an independent Reviewer PASS; no subsequent VS work authorized.

Pre-existing `.agent/scripts/` changes and untracked `.agent/context/` are excluded. Original reference and v0.2 ZIP preserved. No out-of-scope source edits, push or publication.
