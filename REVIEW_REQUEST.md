# v0.9.1 Independent Review Request

Status: polish implementation verified; independent review pending. Baseline courtroom-core-v0.9 → 839628409b3563cbe13473b5cc855cd1db173ba8, implementation f143986. PASS was reported by the user.

## Purpose and changes
Full-play UI/UX polish only. All engine modules, services/courtroom.js and shipped data/case.js are byte-identical to v0.9. The case still has no complete guilty proof path; no mechanic/rule/content was added.

- Central next-witness action reuses witness command after examination ends.
- Opening/Closing/Verdict hide last-witness tabs/exhibits and unavailable strategy control. Same three columns, no new panel.
- Compact Opening/Closing title area; after Opening, first witness name replaces repeated Opening speech as current headline. Original speech remains in dialogue/record.
- Closing citation/counter selection opens existing record sheet directly: one fewer click, no duplicate selected-title list, no automatic choice.
- Remove strength labels, repeated issue grading and long developer scope disclaimer from witness-result details. Scoped substantive result remains; regression verifies actual issue scope and absence of verdict.
- Keep concise issue findings and final verdict sentence on one screen; no artificial FactFinding intermediate phase.
- Phase/witness changes focus and scroll to current heading below sticky header. Same-phase selection retains focus/details/scroll. Dialog close restores focus to a rebuilt opener.
- Reset clears presentation disclosures, scroll, hidden Closing preview and opener references, alongside unchanged engine reset. Duplicate reset control hidden; clearer 다시 시작 label.
- Neutral budget artifact names and full-flow comparisons against v0.9.

## Files
Production: ui/app.js, ui/courtroom.css, index.html, package.json.
Tests: browser-full-flow.test.js, alternate-verdict-fixture.js, ui-flow-budget.js, ui-flow-baseline.json, ui-budget.js; existing browser scripts updated only for new visible reset/citation path, removed disclaimer semantics or neutral screenshot naming. Existing gameplay assertions retained.
Documentation: docs/CURRENT.md, root DESIGN.md, .agent/tasks/COURTROOM-CORE-091.md, REVIEW_REQUEST.md, prototype REVIEW_PACKET.md/UI_TEXT_AUDIT.md/test-results.log.

## Verification
Node 228; Browser 1189 (591 existing + 598 full-flow); UI budget 75 (14 historical examination + 61 full-flow). Total 1492 unique checks, 0 failures; npm test, npm run test:browser and npm run test:budget exit 0. Budget command additionally reruns 187 A-path assertions already covered above; not counted twice. Baseline v0.9 run: 424 checks, separate comparison evidence.

A/B/C/D all run at 1440×1080, 1280×720, 390×844. A plays through reset and a second Theory B run; B uses Peripheral argument; C keeps Strategy and Closing conflicts; D injects test-only direct testimony and proof routes, then uses normal UI/service/engine to render guilty. Shipped A/B/C render not_guilty. Existing localhost/direct-file, keyboard selection, procedure, no-Closing and record-only replay tests remain. No-adjudication compatibility remains in the existing Node suite.

Reset checks empty record layers, witness history, public commitments, Closing/adjudication projections and draft choices, exactly one new Opening/Closing/verdict marker, new runtime IDs, no prior conflicts or hidden preview. Phase checks verify current heading focus/visibility, no stale witness controls, one or zero open modals and no overflow. Closing sheet returns focus and preserves disclosure. Desktop/mobile PNGs inspected.

## Budget comparison
Neutral generated files: tests/artifacts/ui-budget-examination-current.json and ui-budget-flow-current.json. Historical ui-budget-baseline.json remains intact. New ui-flow-baseline.json was captured using the same A path on v0.9. All sampled phase text <= v0.9, height <= prior +10%, no overflow, exactly two existing aside panels. Historical artifacts are not deleted or reinterpreted.

Representative A mobile: Opening 161→148 chars / 1210→903px; Closing 213→190 / 1345→931px; Verdict 270→241 / 1300→1043px; examination 187 chars unchanged. Desktop A: Opening 173→156, Closing 225→198, Verdict 282→249 chars. Original examination budget is desktop 191/214 and mobile 183/213 chars. Mobile touch targets add only 4–6px to examination height and stay within the unchanged baseline limit.

## Direct answers to the eight requested questions
1. Does it play continuously like one game? On tested A/B/C/D paths, yes; setup through verdict, reset and a fresh theory run complete without a dead end. This is observed functional flow, not a substitute for human enjoyment testing.
2. Most awkward transition? End of examination sent the player to the sidebar to find the next witness. An in-place action now exposes that next step; Closing citations also lose one nested navigation click.
3. Remaining click-heavy part? Choosing multiple premises for Closing and opening repeated CourtRecord summaries. Automatic citation or record merging would change decisions/trace behavior, so they remain P2.
4. Removed text/elements? Stale witness/exhibit controls, disabled strategy button, duplicated Opening headline, citation disclosure and repeated selection titles, result strength/grading/scope boilerplate, duplicate reset, visible version. Preview return label shortened.
5. Is Verdict concise? Yes: outcome title, two short issue findings, final result sentence; evidence remains collapsed and no extra phase or panel is added.
6. Biggest mobile friction? Old witness information and empty title space pushed current choices down; compact phase views and explicit focus/scroll reduce it. Record sheets remain the main interaction cost.
7. Must-fix UI/UX before v1.0? No blocker found in tested paths. Repeated citation/record navigation needs human playtest feedback, and multi-browser/native mobile testing is not claimed.
8. Can it be fixed as a v1.0 polish candidate? Yes, as a candidate for independent review and human playtest; not final v1.0 approval or a claim of varied shipped verdict outcomes.

## Review focus / limits
Confirm same-phase focus and scroll remain stable, phase focus is not hidden by sticky header, reset leaks nothing, direct citation shortcut never auto-selects evidence, and no engine/data diff exists. Review full text audit for deletions vs preserved substantive record text. D is a clearly labelled synthetic fixture only. No Save/Load, new case, proof route, witness mechanic or excluded system. Unrelated user changes remain untouched; no push.
