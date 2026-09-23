# THE FIRM v0.7 — Review Request

## Scope and implementation

Review against docs/DESIGN.md, IMPLEMENT.md and REVIEW.md. v0.65 baseline tag remains unchanged. Opening now composes admission, contest, emphasis and argument-introduction fragments, then enters existing examination. Review whether those choices feel like constructing a legal position.

- data/case.js: authored opening options and Theory workingPositions.
- engine/opening.js: validates options, detects explicit factual contradictions, replays case-wide public state and joins commitments → issues → framed arguments → evidence references. Client Objectives and current issue priority are read here.
- services/courtroom.js: case-scoped opening_position / major_commitment / strategy_revision / commitment_conflict records. Major Commitment source of truth is records.advocacy. Revisions preserve every earlier public position and evidence item. Conflicts link commitmentRef and revisionRef (or openingRef for an initially inconsistent private plan).
- engine/core.js: Opening phase availability and witness navigation gate only; examination evaluation/routing/pressure unchanged. engine/procedure.js unchanged.
- ui/app.js, ui/courtroom.css, index.html: existing scene/action space becomes Opening composition, existing record details show public positions and conflicts. Focus preservation and live announcements, no gauge/badge/new panel.
- package.json, tests/*: version and regression harness, new opening suites, explicit examination-only compatibility fixture.
- docs/CURRENT.md, root DESIGN.md, .agent/tasks/COURTROOM-CORE-070.md, scoped REVIEW_PACKET.md / UI_TEXT_AUDIT.md / test-results.log: actual state and handoff.

## Verification

All three package scripts exit 0: Node 168 tests, Browser 221 checks (87 + 47 + 35 + 52), UI budget 14 checks. Total 403 checks/tests, zero failures. Original v0.65 Node invariants run through an Opening-disabled fixture; original browser basic/flow retains compatibility fixtures. Actual shipped tactical browser runs through Opening. A new semantic equivalence test compares examination evidence and outcome with/without Opening.

Browser A/B/C each run at 1440×1080, 1280×720 and 390×844:
- A: Identity Opening → eyewitness argument → both examinations closed, strategy retained, public position linked to three evidence records.
- B: no-contact Opening → testimony → Intent strategy revision, original records unchanged and conflict visible in CourtRecord.
- C: Intent Opening with contact admission → identity Frame remains peripheral; direct file mode.

Screenshots inspected for Opening and revision layouts. Existing budget thresholds retained; no horizontal overflow. Node tests cover atomic invalid/contradictory choices, duplicate submission, historical conflicts across strategy changes, record-only replay, referenced links, definition validation, evidence isolation and Frame distinction.

## Review priorities / remaining limits

1. Validate Advocacy single source of truth, append-only conflicts and replay without transient state.
2. Check priority changes versus actual factual contradictions; only authored workingPositions determine the latter.
3. Assess composition and record density through human playtest. A selected introduced argument is a public promise, not established testimony or a Frame.
4. Existing relation duplication/first-target selection and procedure fixed rule set are deferred unchanged.
5. No new Intent evidence/witness, generic contradiction engine, whole-session save/load, Closing, Verdict or next-stage features.

Independent Reviewer PASS and human playtest are pending. No product decisions inferred from this request. Existing user automation changes were excluded. Godot remains untouched and its tests were not rerun.
