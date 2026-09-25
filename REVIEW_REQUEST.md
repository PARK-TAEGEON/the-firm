# THE FIRM v0.7.1 — Review Request

## Correction

Review the patch against docs/DESIGN.md, CURRENT.md, IMPLEMENT.md, REVIEW.md and the user's v0.7.1 correction request. Base: v0.7 commit 6a76c57. No next-stage features.

The prior commitmentReviewRefs filter used an OR between non-priority issue and any scoped active counter. Consequently, an IDENTITY counter could request review of an INTENT public commitment and a priority change alone could request evidentiary review. The filter now requires commitment.issue === evaluation scope AND an active counter in the evaluated plan. All case-wide Major Commitment references remain available; only evidentiary review references are narrowed. Core/Peripheral, unresolvedIssues, record storage and authored Strategy Revision conflicts are unchanged.

## Changed files

- courtroom-prototype/engine/core.js: scoped evidentiary review filter only.
- courtroom-prototype/engine/opening.js: every Theory declares every used position key with a nonempty value or explicit unspecified; unspecified does not conflict. links carry relationKind: issue_progression to distinguish issue navigation from evidentiary proof.
- courtroom-prototype/data/case.js: Theory A explicitly declares contact: unspecified.
- courtroom-prototype/tests/opening.test.js: 7 tests for both counter directions, same-issue positive control, priority independence, preserved public records/strategy conflicts/replay, validation and link semantics.
- courtroom-prototype/tests/browser-commitment-scope.test.js: desktop/mobile Opening → Strategy Revision → counter → replay → Stop in both directions.
- courtroom-prototype/package.json, index.html: 0.7.1 and new browser suite.
- docs/CURRENT.md, root DESIGN.md, .agent/tasks/COURTROOM-CORE-071.md, courtroom-prototype/REVIEW_PACKET.md, test-results.log, this request: current status and review evidence.

## Verification

Five regression tests reproduced the bug before the fix and pass afterward. Full npm test: 175 pass, 0 fail. npm run test:browser: 258 checks (87 basic + 47 flow + 35 tactics + 52 opening + 37 cross-issue), 0 fail. npm run test:budget: 14 checks, 0 fail. All exit 0; total 447 checks/tests.

Existing Opening A/B/C, Strategy Revision, record-only replay and v0.65 examination tests rerun. Core/Peripheral stays core/peripheral for the same Frame across Theory A/B; that priority change alone leaves commitmentReviewRefs empty. Active counter reviews same-issue commitments under either Theory and never the other issue. Existing public positions and explicit strategy conflict remain unchanged.

Browser uses actual UI actions and observes production projections. Existing Opening tests cover large/short/mobile and direct file mode. New counter suite covers desktop/mobile and both directions. Reverse INTENT counter uses the existing examination with a test-only INTENT plan scope; it is not an authored Intent gameplay addition. Existing basic/flow and Node examination fixtures retain their documented compatibility behavior.

## Boundaries and review questions

- No UI layout redesign, choice limit, new Commitment slot, Closing, Verdict or FactFinding.
- Review remains issue-level, not semantic proof that a particular counter contradicts every same-issue public statement. No generic legal reasoning introduced.
- links are issue progression; nested evidenceRefs are argument premises, not automatic proof of the public commitment.
- Existing relation metadata duplication/first-target debt remains deferred.
- No Godot change or Godot test run. Existing user automation edits preserved and excluded from commit.
- Independent re-review and human playtest remain pending. Verify cross-issue isolation and priority separation first.
