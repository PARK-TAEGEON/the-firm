# v0.8.1 Independent Review Request

Status: PASS candidate; independent review pending. Base: e581aaa (v0.8).

## Corrections
- engine/core.js: reject partial optional Closing lifecycle; profile-aware beginClosing/submitClosing availability. closing/closed phases and both actions form a complete bundle. No-Closing remains resolved after both witnesses.
- engine/closing.js: deduplicate spoken final position text only, with revision wording when any source revises. All revision/conflict records and selection references retained; service record writer unchanged.
- index.html: phase-neutral 법정 진행 accessible name; version 0.8.1. No last-witness UI redesign.
- package.json: version and new tests. tests/closing-profile-fixture.js, closing-profile.test.js, browser-closing-profile.test.js: full/absent/partial profile, atomic rejection, speech/replay/record preservation.
- docs/CURRENT.md, root DESIGN.md, .agent/tasks/COURTROOM-CORE-081.md, REVIEW_REQUEST.md, prototype REVIEW_PACKET.md/UI_TEXT_AUDIT.md/test-results.log: status and handoff.

## Verification
Run in courtroom-prototype: npm test; npm run test:browser; npm run test:budget. Playwright uses installed Edge and bundled NODE_PATH.
Node 198 / Browser 383 / UI budget 14 = 595 checks, 0 failures, all exit 0. Existing Node 188 and Browser 316 retained. Added Node 10 and browser 67. Eight valid new regressions failed before correction. Mixed-mode fixture was corrected to use legal same-issue revisions before final testing.
Browser sizes: 1440×1080, 1280×720, 390×844. Existing localhost/direct-file paths retained. New full/none profiles play Opening → two witnesses → resolved; full proceeds through Closing preview and publication. Confirmed 2 revision and 2 conflict records while one final sentence is spoken, Evidence/Procedural unchanged, JSON record-only replay equivalent. Partial declarations fail construction in Node. UI budget unchanged, no new panel or horizontal overflow; neutral accessible name verified in resolved and closed phases.

## Reviewer focus
1. Profile availability and command rejection agree; each partial lifecycle fails construction.
2. No-Closing UI terminates normally and offers reset without Closing.
3. Dedup affects speech only, including mixed maintain/revise; trace multiplicity and historical advocacy survive.
4. Existing examination, opening, strategy, cross-issue and synthesis regressions remain unchanged.

## Limits / scope
Full profile is shipped criminal data. Absent/partial profiles are fixtures, not civil implementation. Speech dedupe uses exact final text, not semantic paraphrase matching. Existing relation metadata debt remains. No CFF/Verdict/Jury/Settlement/civil, core mechanics changes, panels or Closing redesign. Unrelated user modifications remain untouched. No push.
