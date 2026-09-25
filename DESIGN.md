# THE FIRM — Courtroom prototype design

Status: v0.65 implementation baseline, authorized web experiment. Applies only to `courtroom-prototype/`. Read with the active `.agent/tasks/COURTROOM-CORE-065.md`. The repository's Accepted Godot documents retain authority over litigation-skeleton. This file does not introduce a next VS.

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


## v0.65 tactical grammar

Explicit admissions are evidence-record commitments scoped to the speaking witness. Later qualification/clarification/contradiction/retreat links the original record; testimony is never silently overwritten. Authored question routes inspect recorded commitments, not question index or a bonus. Supports and rehabilitation opportunities are record metadata, without UI meters or Redirect implementation.

Press may name an authored claim variant independently of an exact inference. This permits a premature conclusion question with no established premises. Frame still requires an exact authored inference. Claim variants show actual question sentences. Narrow confirmation, prior-contact possibility, offense-time use and an excessive non-use conclusion have different authored routes. Existing basis signatures remain intact; explicit claim repetition is scoped to that claim. Legacy no-claim commands remain available to regression fixtures.

No generic legal conclusion generator is implied. Claim routes and their conflicts are case-authored content. All adverse effects remain in the record and can be replayed without transient question state. Stop adds no reward. The favorable concession survives overreach alongside its recorded limitation.

## v0.7 authorized delta

The active web contract is `.agent/tasks/COURTROOM-CORE-070.md`, following `/docs/IMPLEMENT.md` and the user's explicit v0.7 request. Its Opening and Strategy scope supersedes the historical v0.65 exclusion of Opening above; all other frozen-core boundaries remain.

Opening composes authored admission, contest, emphasis and argument-introduction fragments. It records an opening_position and separate major_commitment entries in case-scoped Advocacy only. A Frame never creates a major commitment. Working Strategy uses the existing theory command. Explicit authored position conflicts append commitment_conflict records referencing the original commitment and strategy revision; a mere change of issue priority is not a factual contradiction. Case-wide read projection joins commitments through issues to recorded arguments and evidence, and reads current theory priority and client objectives. No numerical penalties, verdict or generic legal inference.

## v0.7.1 correction

Active contract: `.agent/tasks/COURTROOM-CORE-071.md`, authorized by the user’s correction request. commitmentReviewRefs requires the same issue as the current evaluation scope and an active counter in that plan. Theory priority is not an evidentiary challenge. Authored strategy conflict remains separate and append-only. Every theory explicitly declares each position key, using unspecified when uncommitted. Case-wide links are marked issue_progression, not proof of a commitment. No UI redesign or new gameplay scope.

## v0.8 authorized Closing delta

Active contract: `.agent/tasks/COURTROOM-CORE-080.md`; the explicit v0.8 request supersedes the historical Closing exclusion. v0.7.1 Independent Review PASS was reported by the user and fixed at tag courtroom-core-v0.7.1 (839b201).

After both examinations end, Closing composes selected issues, recorded-premise authored inferences, cited evidence/admissions, chosen counter treatment and kept/revised public positions. Unselected arguments never enter speech. Existing per-plan assessments supply priority/counter/qualification and Frame references. Closing adds Advocacy only, with record-only replay and explicit references for revisions/conflicts; no evidence, fact finding or verdict. Current theory/objectives inform the read model without scores. Existing center/record UI is reused with disclosures and a speech preview. Other frozen grammar and excluded systems remain unchanged.

## v0.8.1 correction

Optional Closing requires the complete closing/closed phases and beginClosing/submitClosing actions, or none. Partial declarations fail construction. Availability respects the profile and existing lifecycle prerequisites. Generated public-position speech deduplicates identical final text; all original positions, revisions and conflicts remain append-only. Main courtroom accessible name is phase-neutral. No gameplay redesign or additional panels.

## v0.9 authorized adjudication delta

Active contract: .agent/tasks/COURTROOM-CORE-090.md. User authorized CourtFactFinding and Verdict supersede historical exclusions above. v0.8.1 Independent Reviewer PASS is fixed at tag courtroom-core-v0.8.1 (529371f), reported by user.

Judge findings derive issue-local evidence and validated counter/qualification/relationship metadata, with separate advocacy and procedural context. Authored exact evidence premise routes and doubt routes replace scores. Each required issue specifies a burden party and beyond_reasonable_doubt standard; all_required is the only decision rule. A complete proof route without recorded opposing doubt or unresolved witness contradiction satisfies that burden. Outcome labels live in case data. Closing selections, speaking strength and procedural success cannot supply facts.

Current authored record contains no complete proof of attacker identity or offense-time use: production outcomes remain failure of proof. Do not promote unrecorded background or Opening admissions into evidence. Positive proof and burden variations are synthetic tests only, not new case content. This narrow slice does not adjudicate intent.

After completed Closing, or both examinations where Closing is absent, deliverVerdict appends only a judicial Procedural marker referencing frozen input records and definition version. Evidence/Advocacy and original Procedural remain unchanged. Record replay needs the fixed definition, never UI/history. Optional verdict config, phase and action must be coherent. Central result UI and existing record disclosures are reused. All deferred systems stay excluded.

## v0.9.1 authorized polish

Active contract .agent/tasks/COURTROOM-CORE-091.md. v0.9 PASS baseline is tag courtroom-core-v0.9 (8396284), user-reported. Only presentation, tests and documentation change. Engines, service and shipped data remain byte-identical. Current-phase UI replaces stale witness controls; central next-witness action reuses the existing command. Closing citations open the existing sheet directly; source selection stays manual. Findings and Verdict remain a single concise result. Phase focus/scroll, dialog return focus and reset presentation isolation are tested end-to-end. Neutral artifact names preserve historical examination budgets and add full-flow comparisons against v0.9. Alternate guilty evidence/proof exists only in tests.
