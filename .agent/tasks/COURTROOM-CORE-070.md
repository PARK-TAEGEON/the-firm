# Courtroom Core v0.7 — Opening and public strategy

Status: ACTIVE implementation scope, authorized by the user's v0.7 request. Supersedes COURTROOM-CORE-065 only for this web prototype task. Source of truth: docs/DESIGN.md, CURRENT.md, IMPLEMENT.md, REVIEW.md. Historical v0.65 tag and frozen examination remain the baseline.

Allowed: courtroom-prototype/** except reference/original.html, previous release ZIPs and unrelated files; docs/CURRENT.md; root DESIGN.md; this contract; REVIEW_REQUEST.md. Preserve existing .agent automation changes. No Godot work, push or publishing.

Implement composed Opening (admit/contest/emphasize/introduce), case-wide Advocacy major commitments, mutable private Working Strategy and append-only referenced conflicts. Reuse CaseTheory and Client Objectives. No scores or new persistent panels. Keep witness examination behavior and procedures unchanged except phase gating. No Closing, Verdict, CFF, AI, civil, staff, settlement, or next-stage implementation.

Verify entire prototype Node, browser and UI budget suites, plus paths A/B/C at large, short and mobile viewports. Record-only replay, atomic failures, evidence separation, priority and explicit conflict references are required. Update scoped test-results.log, REVIEW_PACKET.md, UI_TEXT_AUDIT.md, CURRENT.md and REVIEW_REQUEST.md. Review diff and create one scoped commit after tests pass. Independent review and human playtest remain pending; no Reviewer PASS claim.
