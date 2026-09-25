# v0.9 Independent Review Request

Status: implementation verified, independent review pending. Baseline tag courtroom-core-v0.8.1 → 529371f3679318154d8508daf11d6f2785113508 (user-reported Independent Reviewer PASS, implementation d54006d).

## What changed
CourtRecord now feeds a separate Judge finding/decision layer. It reads local Evidence, admissions, active/qualified counters, witness relations and support states, retaining Frame/Opening/Closing and procedural references as separate context. Proof uses authored exact premise sets and explicit doubts/conflicts, without point totals or argument-strength conversion.

CaseDefinition.adjudication declares finding rules, required issues, burden party, standard, all_required decision rule and outcome labels. Currently only judge and beyond_reasonable_doubt are supported; invalid/partial configurations fail construction. No general legal rule language or additional proceeding is introduced.

The service adds profile-aware deliverVerdict availability/command. It is enabled after both witnesses and published Closing, or after both examinations when Closing is absent. It appends one verdict_delivered judicial Procedural record with fixed input refs/version; all Evidence/Advocacy and prior Procedural remain identical. Replay reads those referenced records and the fixed definition, not UI/history/session or later records. Missing refs/version mismatch fail explicitly.

The center displays the outcome and two short required-issue findings, with expandable evidence. The existing record panel contains the judicial decision. No new permanent panel, gauge, score or recommendation. Verdict heading gains focus and is scrolled clear of the mobile sticky header.

## Files
- courtroom-prototype/engine/adjudication.js: validation, availability, issue findings, decision rule, referenced-input replay.
- courtroom-prototype/data/case.js: minimal authored adjudication definition, verdict phase/action.
- courtroom-prototype/services/courtroom.js: additive decision command and projection; original response/Opening/Closing mutation code unchanged.
- courtroom-prototype/ui/app.js, ui/courtroom.css, index.html: phase-local result/disclosure, procedural record presentation, focus and module load.
- courtroom-prototype/package.json: 0.9.0, new test scripts.
- courtroom-prototype/tests/adjudication.test.js, browser-adjudication.test.js: new invariants and browser journeys.
- courtroom-prototype/tests/opening.test.js, browser-commitment-scope.test.js: reverse INTENT fixture opts out of adjudication because its remapped issue cannot use original IDENTITY rules; original assertions retained.
- docs/CURRENT.md, root DESIGN.md, .agent/tasks/COURTROOM-CORE-090.md, REVIEW_REQUEST.md and prototype review/log/text audit: implementation and handoff.

## Reviewer priorities
1. Evidence vs Advocacy vs Procedure: a public admission is never witness evidence; winning an objection cannot prove a fact. Decision only adds a judicial marker.
2. Exact recorded premise routes, explicit doubts, qualification provenance and unresolved contradictions; scope cannot leak in either direction.
3. Closing changes argument context, never evidence or the proof finding. Sparse Closing cannot invent absent identity/intent testimony.
4. Required issues/burden and all_required outcome; synthetic positive paths clearly separated from shipped content.
5. Record-only replay using frozen input references, no silent mutation and atomic invalid commands.
6. no-Closing and no-adjudication profiles, partial config rejection, existing examination and Closing regression.

## Verification
Commands from courtroom-prototype: npm test; npm run test:browser; npm run test:budget. Browser: Playwright with installed Edge, bundled NODE_PATH where needed. Detailed totals are recorded in test-results.log and CURRENT.md.
Browser paths: recorded facts + admission/counter + selected Closing argument; sparse Closing; no-Closing direct decision. Each at 1440×1080, 1280×720, 390×844; mobile direct-file mode. Existing all-version browser paths retained. Checks include unchanged Evidence/Advocacy, one judicial marker, reference replay, issue isolation, context, heading focus/visibility, record sheet, no overflow/new panel, and verdict center under 280 characters. Desktop/mobile PNGs visually inspected.

## Limits requiring attention
The shipped record contains no complete proof path for attacker identity or offense-time use. Its required issues therefore fail proof on all current real journeys; only reasons, limitations and advocacy context differ. This is deliberate preservation of existing evidence, not a claim that guilt/innocence has been fully authored. Positive proof, opposing proof and burden/required-issue variation are synthetic fixtures only. Identity background statements, exhibits available in the sidebar and Opening admissions are not silently entered as evidence.

INTENT has no evidence and is outside required issues for this narrow slice. This is not a complete criminal law model. Only one proof standard is supported; unsupported standards fail validation. Same-version CaseDefinition is needed with saved CourtRecord; full UI/session save/load remains out of scope. Explicit authored doubts and linked contradictions are handled; semantic contradiction discovery is not implemented. Existing relation metadata debt remains.

No Jury/Sentencing/Appeal/Settlement/Civil/Redirect/Opponent Closing AI/long-form judgment/Staff/multi-agent/Orca. No push. Unrelated user changes preserved. Historical docs/IMPLEMENT.md v0.7 exclusions are superseded only by the explicit v0.9 request and current task contract.

Final verification: Node 228 (198 prior + 30 new), Browser 591 (383 prior + 208 new), UI budget 14; total 833 checks, 0 failures, exit 0 for all commands. Original examination budget: desktop 195/218, mobile 183/213 characters. Opposing complete proof routes are retained as unresolved conflicts; party evidence side mappings live in case data. Full regressions rerun after final changes. Independent review pending.
