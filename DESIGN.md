# THE FIRM — Courtroom prototype design

Status: v0.6 implementation baseline, authorized web experiment. Applies only to `courtroom-prototype/`. Read with the active `.agent/tasks/COURTROOM-CORE-006.md`. The repository's Accepted Godot documents retain authority over litigation-skeleton. This file does not introduce a next VS.

## Stable intent

The player establishes facts, connects recorded facts into an authored argument, chooses whether to preserve it or seek a witness concession, and decides when to stop. No free-text legal quiz, automatic legal reasoning, or actual verdict. UI shows legal intentions, not engine vocabulary. Optional art is not needed.

DATA → SIMULATION → SERVICES → PRESENTATION/UI. Mutations through atomic service commands; persistent IDs, no gameplay randomness in this slice. Record-only evaluation uses evidence and advocacy, never question counts, lane selection or procedural success as proof.

Evidence contains witness statements/propositions/concessions and adverse facts. Advocacy contains arguments and major commitments; major commitments have only one storage source. Procedural records describe objection/response/instruction/ruling/limited or withdrawn questions, grouped by question transaction only in presentation.

Authored Inference Variants match exact premise sets, not a count score. Stop preserves the record; Frame records an argument without inventing testimony; Press asks the witness to concede a conclusion. Repetition and reinforcement depend on plan, witness and selected recorded premises. Hard counters need unavailable preparation; contestable counters retain the original record and link a qualification.

## v0.6 scope

Same warehouse case, two witnesses: eyewitness Seo Jihoon and forensic investigator Han Seoyun. The second pattern separates fingerprint contact from use at the offense time. Authored direct testimony initially records defendant fingerprints and victim blood on the knife. Neither is deleted by a timing argument. Each plan evaluates its own record scope; a concession about identification cannot become a concession about the knife. No global guilt/intent finding.

Topic threads organize intention and maintain a current line of questioning; order is optional. End-thread returns to topic choice without resolving the examination. The lighting answer offers a skippable light-source follow-up whose mixed answer can worsen the record. Witness changes preserve accumulated records and pressure history. Closed examinations are reviewable, not reopened by navigation.

Argument mode is explicit. Outside it, propositions are testimony summaries; inside it, recorded compatible facts can be selected. The latest actual question and witness answer are paired. Procedural actions temporarily reuse the same center. Procedure records are collapsed per-question transactions.

One forensic form objection permits 1–2 selected bases. Analysis report or recorded timing limitation can justify asking about limits; access evidence alone supports opportunity, not the analysis limit, and yields a narrower question. These are case-authored rules, not general admissibility doctrine. Missing/unrecorded/duplicate/foreign bases fail atomically. A stricter fixed judge profile can narrow an otherwise linked conclusion, without overriding hard procedural constraints. No judge-selection UI.

## Boundaries and future work

No third witness, new case, Opening/Closing/Verdict, player objection system, relationships, jury, civil case, negotiation, appeal, staff, generic natural-language generation or expert battle. Witness answers and inferences are authored fixtures, not scientific measurement or legal advice. Exact mappings live in `courtroom-prototype/data/case.js`; demo-specific policy lives in `EXPERIMENT_RULES.md`.

Before implementing a later request: read this file, the current Task Contract and relevant repository rules; inspect the current code and prior review. Reuse stable grammar, implement only requested deltas, test new invariants and prior regressions, update this design and REVIEW_PACKET. Unresolved formal game design stays TBD. Do not interpret this file as authorization to start v0.7.
