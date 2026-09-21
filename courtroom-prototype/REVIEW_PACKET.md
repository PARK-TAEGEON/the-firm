# Courtroom Core v0.2 review packet

## Purpose and authority
Implement the user-authorized independent HTML experiment from the supplied ZIP. Contract: `.agent/tasks/COURTROOM-CORE-002.md`. Case-specific response and finding rules are authored experiment data, not Accepted Godot design amendments. This is not VS-007.

## Changed files
- `.agent/tasks/COURTROOM-CORE-002.md`: frozen isolated task scope and acceptance checks.
- `courtroom-prototype/EXPERIMENT_RULES.md`: deterministic authored response/finding rules and exclusions.
- `data/case.js`: CaseDefinition, profile, parties, objectives, theories, fact goals, propositions, separate responses, argument plan, ordered rule data.
- `engine/core.js`: content references/reachability validation, pure availability/argument/response/record resolution.
- `services/courtroom.js`: atomic mutation façade, session-local monotonic IDs across resets, evidence/advocacy separation, retained commitments, copied projections.
- `index.html`, `ui/app.js`, `ui/courtroom.css`: three-column courtroom, fact buttons, selected-premise lane, Stop/Press/Frame, bounded finding, responsive records and dialogs.
- `ui/original.css`, `reference/original.html`: original supplied design and source preserved for reference.
- `tests/core.test.js`: 52 automated regression tests, including 24 fact orders and noncriminal profile smoke.
- `tests/browser.test.js`: 20 browser assertions, gameplay paths, mobile and file URL operation; screenshots.
- `serve.js`, `package.json`: optional dependency-free loopback preview and test commands.
- `.gitignore`: excludes generated captures/log artifacts and dependencies.
- `README.md`, `test-results.log`, `REVIEW_PACKET.md`: run instructions, evidence and handoff.
- Local `THE-FIRM-Courtroom-Core-v0.2.zip`: portable source distribution; repository-wide ZIP ignore remains intact, not committed.

## Invariants
- Only service commands change authoritative state; UI consumes copied projections.
- Failed commands do not change state or consume IDs. Duplicate fact questions are rejected.
- Arguments require 2–4 distinct recorded compatible premises; counter propositions cannot be smuggled into the authored plan.
- Each proposition appears in Evidence Record at most once. Unfavorable records survive later questions and strategy changes.
- Frame creates advocacy, never evidence. Equivalent duplicate Frame for the same theory/plan is rejected regardless of premise ordering.
- Only actual Press/Frame creates public commitments; working strategy changes preserve them.
- Finding uses record proposition tags; no question ID/count, score, or current theory automatically proves intent.
- Stop available from every examination state, including no evidence; ended sessions reject gameplay commands.
- IDs are unique within a running service including resets; persistence across page reload is outside the no-save slice.

## Tests and commands
See `test-results.log` for counts. New core 52 + browser 20 + existing Godot 2280 = 2352 tests/checks, zero failures, exit 0. Godot main-scene smoke also exits 0 with no engine errors after approved non-sandbox rerun.

Commands:
```text
node --test courtroom-prototype/tests/core.test.js
NODE_PATH=<bundled packages> node courtroom-prototype/tests/browser.test.js
<Godot 4.7.2 console> --headless --path litigation-skeleton --log-file <scoped artifact log> --script res://<runner>
<Godot 4.7.2 console> --headless --path litigation-skeleton --log-file <scoped smoke log> --quit-after 3
git diff --cached --check
```
Runners: legacy `tests/run_regressions.gd`, and `vertical_slice/tests/run_slice_regressions.gd`, `run_vs002_regressions.gd` through `run_vs006_regressions.gd`.

Browser evidence: actual Edge clicks through all three response branches, record-derived results, public commitment preservation on strategy change, inability to use unrecorded premises, duplicate frame disablement, mobile evidence dialog and records, no horizontal overflow, direct file opening and early stop. Desktop/mobile full-page screenshots inspected; final screen avoids repeated record fade animations.

## Fixture/injected and TBD
- Witness reactions, counter facts, strategic relevance and finding criteria are authored specifically for this demo, deterministic with no RNG or AI.
- Civil fixture replaces IDs and labels in a test only; it does not establish civil legal sufficiency and is not exposed as playable content.
- `adjudicated` resolution is scoped to the identification issue. Guilt, intent, sentencing and whole-case judgment remain unimplemented.
- Single witness and first argument plan only. Multiple-plan UI and additional cases require authored content and review.
- Procedural record is an empty extension point; no admissibility, objections, judge discretion, legal reasoning, negotiation, appeal, full Closing, save, or Godot integration.
- Strategy conflict is an observable advisory, not a consistency/penalty engine. EVADE/CONTRADICT and negotiated resolution are reserved, not generated.

## Review and scope
Local implementation self-review: PASS for this isolated experimental contract, based on code inspection, adversarial tests, actual browser paths, screenshots and final scoped diff. This is not an independent Reviewer PASS and authorizes no subsequent VS.

Godot source and existing accepted design files are untouched. Pre-existing modifications in `.agent/scripts/` and untracked `.agent/context/` are excluded from this commit. No next-stage work, push or publication.
