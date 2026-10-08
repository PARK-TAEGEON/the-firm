# ARGUMENT-NARROWING-001

Lane: experiment
Owner: Codex
Branch: task/argument-narrowing-001
Base: task/demo-001 @ 288e1e7276a56887f42f7b5f02146c74b583d50d

## Authorization and scope
2026-10-08 user request: implement a small causal-denial → proof-sufficiency revision experiment, validate, publish a separate branch/PR, never merge. This contract supersedes DEMO-001 only for this delta.

Owns: courtroom-prototype/experiments/argument-narrowing/, courtroom-prototype/services/demo-trial.js, services/demo-session.js, ui/trial-demo-app.js, demo.html (paths relative to courtroom-prototype after first); DESIGN.md, this contract, courtroom-prototype/REVIEW_PACKET.md and test-results.log.
Read only: AGENTS.md, DESIGN.md, docs/CURRENT.md, recent CHANGELOG, DEMO-001 contract, demo/RULES.md, DEC-031 §2, DEC-032 §1–2; demo code/tests.
Forbidden: engine/, services/trial.js, existing case definitions, outcome formulas, existing test expectations, main and task/demo-001 refs.

## Completion criteria
1. Default-off flag; original tests and result paths preserved.
2. Append-only claim/revision/response/closing references; selected actual record bases, adverse facts and unresolved counters stay visible. No testimony invented by advocacy.
3. Determinism, failed-command atomicity, missing/foreign/duplicate basis rejection, reset isolation, unchanged adjudication tested.
4. Run existing headless/browser regressions and experiment through verdict at 1440/390 widths; report actual totals, limitations and ≤3 human questions.
5. RULES.md, REPORT.md and review packet updated. Draft PR only; human playtest/merge remains pending.
