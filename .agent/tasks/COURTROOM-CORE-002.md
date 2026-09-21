# Courtroom Core v0.2 — isolated web experiment

Status: ACTIVE, authorized by user on 2026-09-21: “그렇게 해줘.”

This is not VS-007 and does not change the Godot litigation-skeleton or its Accepted designs. The user authorized a separate HTML prototype and case-specific demonstration response/finding rules, subject to later formal design review.

## Scope and allowlist
- This contract only: `.agent/tasks/COURTROOM-CORE-002.md`.
- `courtroom-prototype/**`: source, original reference, authored experiment rules, tests, README, REVIEW_PACKET.md, test-results.log, portable release ZIP.
- No other edits, no plugin generation, no publishing or push, no next VS work.

## Deliverable
Preserve original three-column Korean courtroom UI and portable browser use. Separate DATA → pure SIMULATION → mutation SERVICES → presentation/UI. Implement one witness, four freely ordered fact goals, recorded-only 2–4 premise arguments, Stop/Press/Frame, deterministic Admit/Resist/Explain, counter records, theory strategy versus public commitments, profile-driven labels, evidence/advocacy/procedural record separation, and record-based bounded demonstration resolution. No generic legal reasoning or actual guilt determination.

## Authored experiment rules
See `courtroom-prototype/EXPERIMENT_RULES.md`; these are experimental content, not Accepted litigation DEC amendments. Rules are deterministic with no RNG. No score or question-count judgment.

## Verification and handoff
Run standalone Node regressions including failure atomicity, defensive copies, identity uniqueness, all fact orders, all response types, record-only resolution and noncriminal profile smoke. Execute browser play paths and mobile layout checks. Run existing Godot regression runners if the local runtime is available; report actual evidence. Review diff, update scoped test log and review packet. Commit only this allowlist after passing checks. No claim of independent Reviewer PASS unless independently reviewed; no next-stage work.
