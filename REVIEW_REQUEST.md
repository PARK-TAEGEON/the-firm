# THE FIRM v0.8 — Review Request

## Baseline and purpose

v0.7.1 tag courtroom-core-v0.7.1 points to 839b201, which records Independent Review PASS reported by the user on 2026-09-25. v0.8 adds Closing + Case-wide Argument Synthesis. Review against docs/DESIGN.md, CURRENT.md, REVIEW.md and the explicit v0.8 task contract COURTROOM-CORE-080; historical IMPLEMENT.md v0.7 is preserved. No v0.8 independent PASS is claimed.

## Implementation

- engine/closing.js: case-wide record catalog and deterministic synthesis/replay. Reads every plan through existing evaluateRecord, tracks recorded-premise inference candidates, Frame references, evidence/admissions, counters/qualifications, current theory priority and client objectives. Requires actual citations for all selected argument premises. Unselected arguments do not enter the speech.
- services/courtroom.js: beginClosing after both examinations end; submitClosing appends closing_position, selected closing_revision and explicit commitment_conflict references. Evidence and Procedural arrays are unchanged. Prior Opening and Strategy history remains intact. Final Closing is immutable until reset.
- engine/core.js: only phase availability wiring, including locking strategy during Closing. No examination evaluation/routing changes; v0.7.1 scope filter unchanged.
- data/case.js: phase/actions and Closing tense fragments on existing Opening options. No new evidence, witness or inference.
- ui/app.js / ui/courtroom.css / index.html: reused center, compact disclosures, existing CourtRecord citation/counter buttons, public position selection and composed speech preview. All choices start empty. No recommendation, gauge, checkmark or new permanent panel. Record scrolling is bounded only during Closing; actual speech may require reading/scrolling.
- package.json and closing tests: 0.8.0 and regression integration. docs/CURRENT.md, DESIGN.md, task contract, scoped logs/review/text audit updated.

## Records and semantics

closing_started persists preparation phase. closing_position stores explicit issueIds/argumentIds/evidenceRefs/counterRefs/position decisions, theoryId and generated text. Replay derives synthesis from CourtRecord only; it excludes later Advocacy when reading prior conflicts. Major Commitments continue to have Advocacy as their sole source.

Available inferences need actual recorded premises; they can be used even without an earlier Frame. Their frameRefs preserve prior courtroom framing. All selected premises must be cited; foreign/missing/duplicate references fail atomically. Opening admission remains Advocacy, never Evidence. A deliberately sparse Closing may select an issue with no argument rather than fabricate proof.

Counter treatment is explicit: selected counter text and actual recorded qualification are included. Unaddressed selected-issue counters remain in structured synthesis, with addressed=false; they are not erased or neutralized. Existing witness relation explanations are retained and duplicated prose is suppressed. Case-wide links remain issue_progression, not proof of Opening commitments.

Opening keep/revise selections retain original IDs. Revisions append their trace even when no modeled factual contradiction exists. Opposed explicit position values append conflict records with commitmentRef/closingRef. Older strategy conflicts are preserved as priorConflictRefs. Semantic contradiction beyond authored positions is not invented.

## Verification

npm test: 188 passed (175 existing + 13 Closing); npm run test:browser: 316 checks (87 basic, 47 flow, 35 tactics, 52 Opening, 37 cross-issue, 58 Closing); npm run test:budget: 14. Total 518, zero failures, exit 0 for all. Existing compatibility fixtures remain explicitly documented; no old assertion was removed to allow Closing.

New Node cases cover lifecycle gating, no Evidence/Procedural mutation, two witnesses/Frames, different selection yielding different published Advocacy from identical pre-Closing records, record-only prepare/final replay, Core/Peripheral, Opening conflict with preserved Strategy history, maintain/omit behavior, invalid/missing/foreign/duplicate/incomplete citations, active/unaddressed counters and recorded qualifications. No new judge or verdict test expectations.

Closing browser plays actual UI on 1440×1080, 1280×720 and 390×844 (mobile direct file), including preview cancellation, citations from CourtRecord, counter treatment, revision conflict and replay. Screenshots reviewed. A short-height record overflow was corrected through scoped record scrolling. Existing examination text/height budget remains unchanged; Closing collapsed choices under 100 characters, no horizontal overflow or new permanent panel. Actual test artifacts remain in ignored tests/artifacts.

## Remaining limits / review priorities

1. Review record integrity and Closing references first; check any possibility of Advocacy becoming Evidence.
2. Assess whether optional issue/argument/citation/counter/public-position choices feel like advocacy rather than menu exhaustion. No automatic optimal choice.
3. Counter handling currently cites qualifications or acknowledges limitations; it cannot manufacture rebuttals. Client objectives are context/request, not resolution scoring.
4. Generic legal reasoning, automatic semantic contradictions, whole-session save/load, opponent Closing, CFF/Verdict/Jury/Settlement/Appeal/Redirect/Civil/Staff are absent. Existing relation metadata debt remains deferred.
5. Godot and user automation files untouched. No multi-agent/Orca pipeline. Independent v0.8 review and human playtest remain pending.
