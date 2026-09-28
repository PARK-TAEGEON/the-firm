# TEST-032 — Credibility, Evidence Contribution, and Corroboration

**Status:** v0.1 — Proposed / manual fixture-level verification  
**Primary source:** `DEC-LITIGATION-033_CREDIBILITY_EVIDENCE_CONTRIBUTION_AND_CORROBORATION.md` v0.1 Proposed / design review required  
**Inherited sources:** Constitution; System Map; Architecture Rules; SYS-001; accepted litigation DEC/TEST chain through DEC-032 / TEST-031  
**Test type:** Semantic architecture verification; not implementation, UI, doctrine, credibility-law, evidentiary-weight, Bayesian, psychology, or judgment testing

---

## 1. Purpose and verdict rules

This document manually verifies whether DEC-033 converts only permitted, exact, snapshot-bound record content into provenance-preserving source relations, contradiction/corroboration relations, scoped credibility assessments, criterion-local contribution assessments, and `CriterionInput` without creating truth, global scores, hidden-state oracles, or direct findings.

Use only `PASS`, `PARTIAL`, or `FAIL`.

- `PASS`: the fixture produces a clear result consistent with DEC-033 and inherited architecture.
- `PARTIAL`: DEC-033 itself contains a material ambiguity or contradiction preventing deterministic verification.
- `FAIL`: DEC-033 permits an invalid shortcut such as hidden-state use, count-based proof, global credibility, automatic truth/finding, snapshot leakage, or old-assessment mutation.

Do not use `PARTIAL` merely because doctrine, criterion combination logic, source independence, UI, implementation, or appellate standards are supplied/TBD. Use explicit immutable fixture-supplied criterion/rule content where needed.

---

## 2. Core semantic boundaries

```text
CourtRecordEntry
≠ CourtRecordSnapshot
≠ SourceRelationAssessment
≠ EvidenceContributionAssessment
≠ CredibilityAssessment
≠ CorroborationRelation
≠ ContradictionRelation
≠ CriterionInput
≠ CourtFactFinding
≠ JudgeInterpretationInput
≠ objective truth
```

```text
source exists
≠ source is independent
≠ source is credible
≠ source corroborates
≠ proposition is proven
≠ criterion is satisfied
≠ fact is found
```

```text
record inclusion ≠ contribution ≠ weight ≠ sufficiency ≠ finding
repetition ≠ corroboration
contradiction ≠ falsity ≠ deception ≠ lie ≠ credibility failure
CredibilityAssessment ≠ EvidenceContributionAssessment
```

---

## 3. Detailed critical fixtures

### Case C01 — Snapshot contains one exact scope

**Purpose**

Verify that assessment input is limited to the exact included snapshot scope.

**Fixture**

`CourtRecordSnapshot CRS-C01` includes only `CR-C01-A v1[p2]` for criterion `K-C01`. `CR-C01-A` has other source content outside `[p2]`.

**Manual verification**

Inspect every input of `SRA-C01`, `ECA-C01`, and any `CI-C01`; verify snapshot identity and scope.

**Expected**

Only `CR-C01-A v1[p2]` is readable.

**Observed**

`SRA-C01` and `ECA-C01` reference `CRS-C01`, criterion `K-C01`, and scope `[p2]`. No assessment references the other portions of `CR-C01-A`; `CI-C01`, if created, carries only `[p2]` and its provenance.

**Verdict**

PASS

**Boundary note**

This does not test whether `[p2]` supports any criterion result.

### Case C02 — Entry outside snapshot is inaccessible

**Purpose**

Verify that CourtRecord inclusion outside the snapshot does not become adjudicative input.

**Fixture**

`CR-C02-B v1[p1]` exists in the canonical CourtRecord but is absent from `CourtRecordSnapshot CRS-C02`. `CR-C02-A v1[p3]` is included for `K-C02`.

**Manual verification**

Attempt to construct `ECA-C02` or `CI-C02` using `CR-C02-B`.

**Expected**

Only `CR-C02-A[p3]` may be analyzed; `CR-C02-B` is unavailable.

**Observed**

`CRS-C02` exposes `CR-C02-A v1[p3]` but no `CR-C02-B`. No SRA, contradiction, credibility, contribution, or `CI-C02` references `CR-C02-B`; its CourtRecord existence does not bypass snapshot membership.

**Verdict**

PASS

**Boundary note**

This does not decide whether `CR-C02-B` may enter a later snapshot.

### Case C03 — Snapshot partial entry scope

**Purpose**

Reject silent expansion from a snapshot sub-scope to the whole entry.

**Fixture**

`CR-C03-A v1[p1–p10]` exists, while `CRS-C03` includes only `[p4–p5]` for `K-C03`.

**Manual verification**

Inspect scopes on `SRA-C03`, `CON-C03`, `ECA-C03`, and `CI-C03`.

**Expected**

No assessment may use `[p1–p3]` or `[p6–p10]`.

**Observed**

All `CRS-C03`-derived objects reference `CR-C03-A v1[p4–p5]`. No assessment or criterion input expands to `[p1–p10]`; the excluded pages remain outside the DEC-033 input boundary.

**Verdict**

PASS

**Boundary note**

This does not test DEC-031’s construction of `CRS-C03`.

### Case C04 — Same source rematerialized twice

**Purpose**

Verify distinct entry histories do not imply independent sources.

**Fixture**

`CR-C04-A` and `CR-C04-B` are separately materialized entries for the same immutable source `SM-C04 v1[p2]` in `CRS-C04`, criterion `K-C04`.

**Manual verification**

Inspect both entry identities, materialization lineage, and `SRA-C04`.

**Expected**

Entries remain distinct; source relation records same-source/rematerialized provenance and not independent origin.

**Observed**

`SRA-C04` links `CR-C04-A` and `CR-C04-B` to the same `SM-C04 v1[p2]` and labels the relation `same_source_rematerialized`. Both entries remain queryable, but no independent corroboration relation or count multiplier is created.

**Verdict**

PASS

**Boundary note**

This does not prohibit a criterion from using the duplicate entries as procedural history.

### Case C05 — Filing derived from testimony

**Purpose**

Verify known derived content does not become independent corroboration.

**Fixture**

`CR-C05-T v1[answer-3]` derives from testimony; `CR-C05-F v1[paragraph-2]` is a filing explicitly derived from that testimony. Both are in `CRS-C05`, criterion `K-C05`.

**Manual verification**

Inspect `SRA-C05`, entry/source lineage, and any `COR-C05`.

**Expected**

The filing has derived/common-origin relation; no independent-source conclusion follows.

**Observed**

`SRA-C05` preserves `CR-C05-T` as the origin and `CR-C05-F` as the derived scope. `COR-C05` is not inferred merely because both entries repeat the proposition; no source-count or independent-support score exists.

**Verdict**

PASS

**Boundary note**

This does not decide whether either entry has criterion-local contribution.

### Case C06 — Matching witness statements with unknown origin

**Purpose**

Verify that different witnesses with matching statements do not automatically establish independence.

**Fixture**

`CR-C06-WA` and `CR-C06-WB` contain matching proposition X in `CRS-C06`, criterion `K-C06`, but the authorized record does not establish whether one copied the other.

**Manual verification**

Inspect source relation and corroboration construction.

**Expected**

`SRA-C06=independence_unknown`; no automatic corroboration score.

**Observed**

`SRA-C06` identifies both exact witness scopes and records `independence_unknown`. `COR-C06` is not generated solely from matching text or witness count, and neither statement becomes truth or criterion satisfaction.

**Verdict**

PASS

**Boundary note**

This does not prevent a later supplied provenance event from resolving the relation.

### Case C07 — Known independent observations

**Purpose**

Verify that supplied separate origins may be represented as independent without creating truth.

**Fixture**

`CR-C07-A` and `CR-C07-B` describe X. Supplied provenance in `CRS-C07` establishes separate observation origins for criterion `K-C07`.

**Manual verification**

Inspect `SRA-C07`, any `COR-C07`, and absence of truth/finding mutation.

**Expected**

An independent relation may be recorded; no automatic result follows.

**Observed**

`SRA-C07` records `independent` from the supplied origin references. A criterion-local `COR-C07` may reference both exact scopes, but no score, `Truth(X)`, `CFF-C07`, or satisfied criterion is created.

**Verdict**

PASS

**Boundary note**

This does not define how `K-C07` combines the relation.

### Case C08 — Equal text without provenance

**Purpose**

Verify equal text alone creates no duplicate, independence, or corroboration conclusion.

**Fixture**

`CR-C08-A v1[p1]` and `CR-C08-B v1[p1]` have equal text in `CRS-C08`, criterion `K-C08`, with no provenance relation.

**Manual verification**

Inspect all source and corroboration relations.

**Expected**

No relation is inferred solely from textual equality.

**Observed**

No `SRA-C08` labels the entries as same-origin, independent, or derived; `COR-C08` is absent unless a supplied rule provides another basis. Entry identities and scopes remain separate.

**Verdict**

PASS

**Boundary note**

This does not prevent an explicit later source assessment.

### Case C09 — Direct contradiction

**Purpose**

Verify X versus not-X produces a contradiction relation, not a truth or lie conclusion.

**Fixture**

`CR-C09-A v1[s1]` asserts X and `CR-C09-B v1[s2]` asserts not-X in `CRS-C09`, criterion `K-C09`.

**Manual verification**

Inspect `CON-C09` scope/aspect/context and any credibility object.

**Expected**

Only a direct contradiction relation is created.

**Observed**

`CON-C09` identifies both exact scopes, proposition X, direct conflict type, and `K-C09`. No side is labeled false, `isLying`, or globally less credible; both entries remain available for criterion-local handling.

**Verdict**

PASS

**Boundary note**

This does not determine which statement a later criterion accepts.

### Case C10 — Changed account by one witness

**Purpose**

Verify changed testimony preserves both statements without an automatic lie label.

**Fixture**

Witness `W-C10` has `CR-C10-A v1[statement-1]` and later `CR-C10-B v1[statement-2]` with changed account in `CRS-C10`, criterion `K-C10`.

**Manual verification**

Inspect statement identities, changed-statement/contradiction relation, and `CA-C10`.

**Expected**

A supplied rule may create changed-statement or contradiction relation; no `isLying` is inferred.

**Observed**

`CON-C10` links the two exact scopes and records the account change with timing context. `CA-C10`, if supplied, remains scoped and rule-derived; neither statement is overwritten and no deception state appears.

**Verdict**

PASS

**Boundary note**

This does not establish a legal credibility consequence.

### Case C11 — Documentary/testimonial conflict

**Purpose**

Verify conflict does not create automatic document preference or witness penalty.

**Fixture**

`CR-C11-D v1[p3]` says X and testimony-derived `CR-C11-T v1[answer-4]` says not-X in `CRS-C11`, criterion `K-C11`.

**Manual verification**

Inspect `CON-C11`, any `CA-C11`, and contribution roles.

**Expected**

Both sources remain; preference requires supplied criterion semantics.

**Observed**

`CON-C11` records the exact documentary/testimonial conflict. No document-priority flag, witness penalty, truth state, or automatic contribution winner is created. `ECA-C11` objects, if supplied, remain criterion-local.

**Verdict**

PASS

**Boundary note**

This does not evaluate either source’s credibility.

### Case C12 — Partial/contextual conflict

**Purpose**

Verify a conflict limited by time or context is not forced into binary contradiction.

**Fixture**

`CR-C12-A v1[s1]` describes X at time T1; `CR-C12-B v1[s2]` describes not-X at T2 in `CRS-C12`, criterion `K-C12`. Supplied rule marks the apparent conflict contextual.

**Manual verification**

Inspect conflict scope, context, and unresolved treatment.

**Expected**

Relation remains partial, apparent, contextual, or unresolved as supplied.

**Observed**

`CON-C12` identifies only the relevant aspect and time/context distinction. It does not mark the entire entries as mutually false, and no lie/credibility penalty or automatic criterion result is created.

**Verdict**

PASS

**Boundary note**

This does not define when a criterion treats contextual difference as contradiction.

### Case C13 — Scoped credibility assessment from authorized factors

**Purpose**

Verify content-scoped credibility assessment with visible record factors.

**Fixture**

`CR-C13-T v1[answer-2]` in `CRS-C13` has visible internal-inconsistency relation `CON-C13` and visible correction history. Criterion `K-C13` supplies `Rule-C13 v1` authorizing those factors.

**Manual verification**

Inspect `CA-C13` snapshot, entry/scope, criterion, factors, evaluator, and explanation.

**Expected**

`CA-C13` is scoped to the exact testimony content and rule context.

**Observed**

`CA-C13` references `CRS-C13`, `CR-C13-T v1[answer-2]`, `K-C13`, `Rule-C13 v1`, `CON-C13`, and the visible correction relation. It does not label witness `W-C13` globally or use hidden truth.

**Verdict**

PASS

**Boundary note**

This does not establish the legal weight of the factors.

### Case C14 — Required credibility factor unavailable

**Purpose**

Verify missing authorized information produces unresolved state rather than hidden-state repair.

**Fixture**

`CR-C14-T v1[answer-1]` is in `CRS-C14`, but `Rule-C14 v1` requires an observation factor not present in the snapshot. Hidden `PersonKnowledge` contains that fact but is unavailable.

**Manual verification**

Inspect `CA-C14` inputs and whether hidden knowledge was read.

**Expected**

`CA-C14` is unresolved or absent as specified by the supplied rule; hidden state is not used.

**Observed**

`CA-C14` records the missing authorized factor and unresolved result under `Rule-C14 v1`. No `PersonKnowledge` value appears in its lineage, and no credibility score, truth label, or criterion result is fabricated.

**Verdict**

PASS

**Boundary note**

This does not decide how a future supplied rule handles missing factors.

### Case C15 — Same witness, separate scoped assessments

**Purpose**

Verify no global witness credibility label.

**Fixture**

Witness `W-C15` has `CR-C15-A[subject-A]` under criterion `K-C15A` and `CR-C15-B[subject-B]` under criterion `K-C15B`. Supplied rules permit different factor sets.

**Manual verification**

Inspect assessment identities, scopes, criteria, and factor references.

**Expected**

Separate assessments may differ; no global witness property exists.

**Observed**

`CA-C15A` and `CA-C15B` bind to different exact scopes, criteria, and supplied rules. Their local results differ without creating `WitnessCredibility`, `ReliabilityScore`, `isTruthful`, or a cross-criterion ranking.

**Verdict**

PASS

**Boundary note**

This does not define a universal witness model.

### Case C16 — Credibility concern does not exclude testimony

**Purpose**

Verify credibility assessment remains distinct from procedural admissibility and record membership.

**Fixture**

`CA-C16` identifies a credibility concern for `CR-C16-T v1[answer-5]` in `CRS-C16`; the entry remains included and procedurally permitted under inherited DEC-031/032 state.

**Manual verification**

Inspect CourtRecord membership, procedural status, `CA-C16`, and any deletion/exclusion.

**Expected**

The assessment does not delete, exclude, or mutate the entry.

**Observed**

`CR-C16-T v1[answer-5]` remains in `CRS-C16`; `CA-C16` records only its scoped assessment. No procedural exclusion, CourtRecord mutation, snapshot change, or testimony deletion occurred.

**Verdict**

PASS

**Boundary note**

This does not prevent a separate DEC-032 procedural event.

### Case C17 — Status metadata is not a default credibility factor

**Purpose**

Reject profession/status credibility bonuses.

**Fixture**

`CR-C17-A` is testimony by a doctor; `CR-C17-B` is testimony by a non-doctor in `CRS-C17`, criterion `K-C17`. No supplied rule authorizes status as a factor.

**Manual verification**

Compare `CA-C17A/B` inputs and results.

**Expected**

No credibility difference follows from status alone.

**Observed**

No `CA-C17` includes a profession/status bonus. Any assessment references exact content and authorized factors only; the two witnesses’ role metadata did not create a global or hidden credibility distinction.

**Verdict**

PASS

**Boundary note**

This does not prohibit a future explicit authored observable factor.

### Case C18 — Independent corroboration relation without score

**Purpose**

Verify known independent observations may form a criterion-local corroboration relation without automatic outcome.

**Fixture**

`CR-C18-A` and `CR-C18-B` independently observe X under supplied provenance in `CRS-C18`, criterion `K-C18`.

**Manual verification**

Inspect `SRA-C18`, `COR-C18`, ECA references, and absence of score/truth/finding.

**Expected**

`COR-C18` may exist with exact source/scope/proposition lineage.

**Observed**

`SRA-C18` records independent origins and `COR-C18` references both exact scopes for X/K-C18. No `CorroborationScore`, `Truth(X)`, satisfied criterion, or `CFF-C18` exists; `COR-C18` is structured input only.

**Verdict**

PASS

**Boundary note**

This does not specify K-C18’s combination rule.

### Case C19 — Common-origin repetition

**Purpose**

Verify multiple entries derived from one source do not become independent corroboration.

**Fixture**

`CR-C19-1`, `CR-C19-2`, and `CR-C19-3` in `CRS-C19` all derive from upstream source `SM-C19`, criterion `K-C19`.

**Manual verification**

Inspect all `SRA-C19` relations and any corroboration object.

**Expected**

Common-origin repetition is retained; no independent corroboration score exists.

**Observed**

Each entry retains identity and derivation link to `SM-C19`; `SRA-C19` records common origin. The three entries do not become three independent supports and no automatic `COR-C19` or criterion result is generated.

**Verdict**

PASS

**Boundary note**

This does not prevent a criterion from treating the repetition as contextual input.

### Case C20 — Mixed independent, derived, and unknown sources

**Purpose**

Verify source relations are preserved separately.

**Fixture**

In `CRS-C20`, `CR-C20-A` is independently sourced, `CR-C20-B` derives from A’s upstream source, and `CR-C20-C` has unknown origin. Criterion `K-C20` supplies no universal aggregation.

**Manual verification**

Inspect each pairwise relation and corroboration references.

**Expected**

Independent, derived, and unknown states remain distinct.

**Observed**

`SRA-C20` separately records the known independent relation, the derived/common-origin relation, and `independence_unknown` for C. No relation collapse or `CorroborationScore` appears; any `COR-C20` names only the supported exact participants.

**Verdict**

PASS

**Boundary note**

This does not establish which combination K-C20 permits.

### Case C21 — Corroboration and contradiction coexist

**Purpose**

Verify neither relation universally erases or overrides the other.

**Fixture**

`COR-C21` links independent entries reinforcing X in `CRS-C21`; `CON-C21` links another exact entry asserting not-X. Criterion `K-C21` supplies no forced priority.

**Manual verification**

Inspect both relation objects, participants, scopes, and `CI-C21`.

**Expected**

Both relations remain in the criterion input with explanations and limitations.

**Observed**

`COR-C21` and `CON-C21` coexist in `CRS-C21`/`K-C21`; neither is deleted or converted into a winner. `CI-C21` carries both references and remains an input, not a finding.

**Verdict**

PASS

**Boundary note**

This does not define K-C21’s conflict treatment.

### Case C22 — One entry, different criterion roles

**Purpose**

Verify contribution is criterion-local.

**Fixture**

`CR-C22-A v1[p2]` is in `CRS-C22`. Supplied `Rule-K22A` treats it as supporting identity criterion `K22A`; `Rule-K22B` treats it as irrelevant to timing criterion `K22B`.

**Manual verification**

Compare `ECA-C22A` and `ECA-C22B` identities, targets, roles, and rules.

**Expected**

Separate ECAs exist with local roles; no global entry value exists.

**Observed**

`ECA-C22A` references `CR-C22-A[p2]`, `K22A`, and `supports`; `ECA-C22B` references the same scope, `K22B`, and `irrelevant_to_this_criterion`. No `EvidenceStrength(CR-C22-A)` is created.

**Verdict**

PASS

**Boundary note**

This does not evaluate either criterion.

### Case C23 — Supports is not satisfied

**Purpose**

Reject direct `supports → criterion satisfied`.

**Fixture**

`ECA-C23` assigns `supports` to `CR-C23-A v1[p1]` for proposition X and criterion `K-C23` under `Rule-C23 v1`.

**Manual verification**

Inspect `ECA-C23`, `CI-C23`, and absence of criterion result/finding.

**Expected**

Support is an input role only.

**Observed**

`ECA-C23` records the exact entry/scope and `supports` role; `CI-C23` may reference it. No satisfied result, `CFF-C23`, truth state, or JII is created by the role.

**Verdict**

PASS

**Boundary note**

DEC-012 owns the criterion evaluation.

### Case C24 — Unresolved credibility with limited permitted contribution

**Purpose**

Verify a supplied criterion may allow limited contribution while credibility remains unresolved.

**Fixture**

`CA-C24=unresolved` for `CR-C24-T v1[p3]` in `CRS-C24`; `Rule-C24 v1` explicitly permits a limited contribution role for K-C24.

**Manual verification**

Inspect `CA-C24`, `ECA-C24`, rule provenance, and absence of hidden default.

**Expected**

`ECA-C24` may exist with the supplied limited role; no credibility guess or automatic exclusion occurs.

**Observed**

`CA-C24` remains unresolved because its declared factor is unavailable. `ECA-C24` references `Rule-C24 v1` and the exact scope with the permitted local role; no hidden factor, global score, or exclusion was used.

**Verdict**

PASS

**Boundary note**

This does not generalize limited contribution to other criteria.

### Case C25 — Record entry without criterion assessment

**Purpose**

Reject automatic contribution from snapshot membership.

**Fixture**

`CR-C25-A v1[p1]` is included in `CRS-C25`, but no criterion-specific rule creates an ECA for `K-C25`.

**Manual verification**

Inspect all DEC-033 descendants of the entry for K-C25.

**Expected**

No automatic ECA or criterion input contribution exists.

**Observed**

`CR-C25-A` is present in `CRS-C25`, but no `ECA-C25` or contribution-bearing `CI-C25` was constructed for `K-C25`. Record inclusion alone did not become criterion contribution.

**Verdict**

PASS

**Boundary note**

The entry could be assessed later under an explicit criterion rule.

### Case C26 — Complete CriterionInput construction

**Purpose**

Verify provenance-bearing adapter construction without result mutation.

**Fixture**

`CRS-C26` contains exact scopes `CR-C26-A/B`. `SRA-C26`, `CON-C26`, `COR-C26`, `CA-C26`, and `ECA-C26` are all created under `RecognitionCriterion K-C26 v2`.

**Manual verification**

Inspect `CI-C26` identity, snapshot, criterion/version, requirement, proposition, references, unresolved fields, and rule provenance.

**Expected**

`CI-C26` is a complete input adapter, not a result, JII, or finding.

**Observed**

`CI-C26` references `CRS-C26`, `K-C26 v2`, exact entry scopes, all named relation/assessment IDs, evaluator/rule provenance, and unresolved limitations. No criterion result, JII, or `CFF-C26` was created by adapter construction.

**Verdict**

PASS

**Boundary note**

This does not test DEC-012’s combination logic.

### Case C27 — New snapshot after correction

**Purpose**

Verify later record correction produces new assessments without mutating old ones.

**Fixture**

`CRS-C27-S1` contains `CR-C27 v1[p2]`, producing `CA-C27-S1` and `ECA-C27-S1`. DEC-031 later creates corrected `CR-C27 v2[p2]` and `CRS-C27-S2`.

**Manual verification**

Compare old/new snapshot bindings, entry versions, assessment identities, and explanations.

**Expected**

S1-bound objects remain unchanged; S2 may create new objects.

**Observed**

`CA-C27-S1` and `ECA-C27-S1` still reference `CRS-C27-S1`/`CR-C27 v1[p2]`. New `CA-C27-S2`, `ECA-C27-S2`, or `CI-C27-S2` reference `CRS-C27-S2`/`v2[p2]`; no old assessment was rewritten.

**Verdict**

PASS

**Boundary note**

This does not test appellate standards or correction doctrine.

### Case C28 — Replay stability

**Purpose**

Verify same inputs do not reroll semantic assessments.

**Fixture**

`CRS-C28`, rule versions, source relations, `CON-C28`, `COR-C28`, `CA-C28`, `ECA-C28`, and `CI-C28` are replayed with identical authorized inputs.

**Manual verification**

Compare identities, roles, relation states, unresolved states, explanations, and snapshot binding across reload.

**Expected**

Replay produces equivalent semantic state.

**Observed**

The reloaded `CRS-C28` yields the same SRA/CON/COR/CA/ECA/CI identities and role/unknown states under the same rule versions. No credibility, independence, contradiction, corroboration, or contribution rerolled.

**Verdict**

PASS

**Boundary note**

This does not authorize future bounded uncertainty unless an accepted rule defines replayable semantics.

---

## 4. Focused architecture attacks

### Case A01 — Entry count becomes ProofScore

**Purpose**

Reject `CRS-A01` entries becoming a universal proof score.

**Fixture**

`CR-A01-1`, `CR-A01-2`, and `CR-A01-3` support X for criterion `K-A01` in `CRS-A01`.

**Manual verification**

Attempted transition: `CR-A01-1/2/3 → ProofScore(X-A01)=3`.

Permitted state: exact ECAs and source relations may exist; count remains non-decisive.

**Expected**

No ProofScore, truth, or criterion result exists.

**Observed**

`CRS-A01` retains three entry identities and `K-A01`-specific scopes. No `ProofScore(X-A01)` appears; any ECA remains structured input with source-dependence context.

**Verdict**

PASS

**Boundary note**

This does not test an authored criterion that explicitly consumes a count.

### Case A02 — Equal text becomes independent corroboration

**Purpose**

Reject text equality as an independence relation.

**Fixture**

`CR-A02-A v1[s1]` and `CR-A02-B v1[s1]` have equal text in `CRS-A02`, criterion `K-A02`, with no source provenance.

**Manual verification**

Attempted transition: `equal text in CR-A02-A/B → independent CorroborationRelation COR-A02`.

Permitted state: `SRA-A02=independence_unknown`.

**Expected**

No independent corroboration is inferred.

**Observed**

`SRA-A02` remains unknown and no independent `COR-A02` exists. Both exact entries remain available to `K-A02` only through explicit local assessments.

**Verdict**

PASS

**Boundary note**

This does not prohibit supplied provenance from later resolving origin.

### Case A03 — Derived filing becomes independent source

**Purpose**

Reject derived testimony copies as independent support.

**Fixture**

In `CRS-A03`, `CR-A03-F` is a filing copied from testimony `CR-A03-T`; criterion `K-A03` is the target.

**Manual verification**

Attempted transition: `CR-A03-F + CR-A03-T → two independent sources`.

Permitted state: derived/common-origin relation with both identities preserved.

**Expected**

No independent-source promotion or proof multiplier exists.

**Observed**

`SRA-A03` retains the filing-to-testimony lineage and labels the relation derived/common-origin. `ECA-A03` may reference both exact scopes, but no independent `COR-A03` or count multiplier is created.

**Verdict**

PASS

**Boundary note**

This does not decide either entry’s criterion-local role.

### Case A04 — Contradiction becomes lie

**Purpose**

Reject direct contradiction-to-lie inference.

**Fixture**

`CR-A04-A` and `CR-A04-B` conflict in `CRS-A04` for criterion `K-A04`; `CON-A04` exists.

**Manual verification**

Attempted transition: `CON-A04 → isLying(W-A04)`.

Permitted state: scoped contradiction and optional supplied credibility assessment.

**Expected**

No lie, deception, or falsity state exists.

**Observed**

`CON-A04` records exact conflicting scopes and proposition context. `isLying(W-A04)` is absent; any `CA-A04` remains rule-scoped and does not expose hidden deception.

**Verdict**

PASS

**Boundary note**

This does not decide whether K-A04 later evaluates the conflict.

### Case A05 — Contradiction becomes numeric credibility penalty

**Purpose**

Reject `CON-A05 → CredibilityScore=-20`.

**Fixture**

`CON-A05` links exact scopes in `CRS-A05` for criterion `K-A05`; no numeric credibility rule is supplied.

**Manual verification**

Attempted transition: `CON-A05 → CredibilityScore(W-A05)=-20`.

Permitted state: scoped `CA-A05` only if an explicit supplied rule creates one.

**Expected**

No numeric/global credibility object exists.

**Observed**

`CON-A05` remains a relation between the named scopes. No `CredibilityScore` is created; `CA-A05`, if supplied, contains criterion/rule/scope provenance and no universal number.

**Verdict**

PASS

**Boundary note**

This does not define qualitative credibility labels for K-A05.

### Case A06 — Profession/status creates credibility

**Purpose**

Reject profession or social status as a default credibility bonus.

**Fixture**

Witness `W-A06` has profession/status metadata and `CR-A06-T v1[s1]` in `CRS-A06`, criterion `K-A06`; no rule authorizes status as a factor.

**Manual verification**

Attempted transition: `profession/status(W-A06) → credibility bonus in CA-A06`.

Permitted state: status remains metadata; only supplied observable factors may be used.

**Expected**

No default credibility difference is created.

**Observed**

No `CA-A06` factor references profession/status. `CR-A06-T` remains snapshot-bound; no global witness property or bonus was created.

**Verdict**

PASS

**Boundary note**

This does not prohibit an explicitly authored future factor.

### Case A07 — Lawyer analysis mutates contribution

**Purpose**

Reject WorkProduct opinion as court assessment.

**Fixture**

`LawyerWorkProduct WP-A07` calls `CR-A07` weak. `CR-A07 v1[s2]` is in `CRS-A07`, criterion `K-A07`, without a court-side assessment event.

**Manual verification**

Attempted transition: `WP-A07 → ECA-A07=weak/undermines`.

Permitted state: WP remains analysis; court ECA requires authorized snapshot/rule/evaluator lineage.

**Expected**

No court contribution role is mutated by the lawyer label.

**Observed**

`WP-A07` retains its author and analysis. No `ECA-A07` is created from that statement alone; any later court assessment must reference `CRS-A07`, `K-A07`, and supplied rule provenance.

**Verdict**

PASS

**Boundary note**

This does not prevent later authorized submission or assessment.

### Case A08 — Entry existence becomes contribution

**Purpose**

Reject automatic contribution from snapshot membership.

**Fixture**

`CR-A08 v1[p1]` is included in `CRS-A08`, criterion `K-A08`, with no contribution rule or assessment.

**Manual verification**

Attempted transition: `CR-A08 ∈ CRS-A08 → ECA-A08`.

Permitted state: entry exists; criterion-local assessment remains absent.

**Expected**

No automatic ECA or CriterionInput contribution exists.

**Observed**

`CR-A08` is visible to the snapshot but no `ECA-A08` was constructed. No global value, support role, truth, or criterion result followed membership.

**Verdict**

PASS

**Boundary note**

This does not prevent a supplied rule from assessing the entry later.

### Case A09 — Supports becomes criterion result

**Purpose**

Reject contribution role as automatic criterion satisfaction.

**Fixture**

`ECA-A09` marks `CR-A09 v1[p2]` as `supports` for X/K-A09 in `CRS-A09`.

**Manual verification**

Attempted transition: `ECA-A09[supports] → K-A09 satisfied`.

Permitted state: `CI-A09` may carry ECA; DEC-012 evaluates K-A09.

**Expected**

No criterion result or finding follows.

**Observed**

`ECA-A09` contains exact scope, role, criterion, and rule lineage; `CI-A09` is optional input. No satisfied result, `CFF-A09`, JII, or truth state exists.

**Verdict**

PASS

**Boundary note**

DEC-012 owns criterion resolution.

### Case A10 — Corroboration becomes truth

**Purpose**

Reject `COR-A10 → Truth(X)`.

**Fixture**

`COR-A10` relates exact independent scopes in `CRS-A10` for X/K-A10.

**Manual verification**

Attempted transition: `COR-A10 → Truth(X-A10)`.

Permitted state: criterion-local corroboration relation only.

**Expected**

No objective truth state is created.

**Observed**

`COR-A10` preserves both source scopes and provenance. `Truth(X-A10)` does not exist; no hidden world state changed.

**Verdict**

PASS

**Boundary note**

This does not test later criterion evaluation.

### Case A11 — Corroboration becomes finding

**Purpose**

Reject direct `COR-A11 → CourtFactFinding`.

**Fixture**

`COR-A11` exists in `CRS-A11` for X/K-A11; no DEC-012 result event exists.

**Manual verification**

Attempted transition: `COR-A11 → CFF-A11`.

Permitted state: `CI-A11` may reference COR; inherited evaluation owns any later finding.

**Expected**

No CFF, JII, or judgment is created.

**Observed**

`COR-A11` remains a relation, and any `CI-A11` remains an input adapter. `CFF-A11` is absent and no relation provenance was promoted to finding.

**Verdict**

PASS

**Boundary note**

This does not test DEC-012 finding transition.

### Case A12 — Unresolved credibility excludes testimony

**Purpose**

Reject credibility uncertainty as automatic procedural exclusion.

**Fixture**

`CA-A12=unresolved` for `CR-A12-T v1[answer-2]` in `CRS-A12`; entry remains permitted and included.

**Manual verification**

Attempted transition: `CA-A12=unresolved → delete/exclude CR-A12-T`.

Permitted state: entry and snapshot remain; contribution follows supplied criterion.

**Expected**

No deletion, exclusion, or snapshot mutation occurs.

**Observed**

`CA-A12` preserves unresolved factor state while `CR-A12-T` remains in `CRS-A12`. No DEC-032 procedural exclusion or DEC-031 record mutation was generated.

**Verdict**

PASS

**Boundary note**

This does not determine K-A12’s contribution treatment.

### Case A13 — Hidden PersonKnowledge resolves credibility

**Purpose**

Reject hidden witness knowledge as an assessment input.

**Fixture**

`CR-A13-T v1[s1]` is in `CRS-A13`, criterion `K-A13`; hidden `PersonKnowledge PK-A13` would reveal the witness’s knowledge.

**Manual verification**

Attempted transition: `PK-A13 → resolved CA-A13`.

Permitted state: assessment remains unresolved or follows authorized snapshot factors only.

**Expected**

Hidden knowledge is not inspected.

**Observed**

`CA-A13` either remains unresolved or is built only from declared `CRS-A13` content; its lineage contains no `PK-A13`. No hidden fact was exposed to the player or criterion input.

**Verdict**

PASS

**Boundary note**

This does not test a visible observation factor.

### Case A14 — ActualState determines source reliability

**Purpose**

Reject ActualStateRecord as source-reliability input.

**Fixture**

`CR-A14 v1[p1]` is in `CRS-A14`, criterion `K-A14`; hidden `ActualStateRecord ASR-A14` would reveal whether the source is objectively accurate.

**Manual verification**

Attempted transition: `ASR-A14 → SRA-A14/CA-A14 reliability result`.

Permitted state: use only snapshot/provenance/rule inputs.

**Expected**

ASR is inaccessible and no reliability oracle exists.

**Observed**

Any `SRA-A14`, `CA-A14`, or `ECA-A14` references only `CRS-A14`, exact scope, and supplied rule inputs. `ASR-A14` is absent from explanation and assessment lineage.

**Verdict**

PASS

**Boundary note**

This does not establish objective accuracy.

### Case A15 — JudgeProfile evidence multiplier

**Purpose**

Reject JudgeProfile as a direct contribution/credibility multiplier.

**Fixture**

`JudgeProfile JP-A15` favors one evidence type generally. `ECA-A15` and `CR-A15` exist in `CRS-A15`, criterion `K-A15`, without valid genuine ambiguity.

**Manual verification**

Attempted transition: `JP-A15 → EvidenceWeight/modified ECA-A15`.

Permitted state: DEC-033 assessment remains unchanged; DEC-013/014 gates are closed.

**Expected**

No multiplier or direct JII exists.

**Observed**

`ECA-A15` retains its supplied criterion-local role and provenance. `JP-A15` does not modify it, and no JII is created because `K-A15` has no valid genuine-ambiguity doorway.

**Verdict**

PASS

**Boundary note**

This does not test a valid inherited ambiguity path; J04 covers that matrix.

### Case A16 — Majority count wins

**Purpose**

Reject five-versus-two source count as universal majority proof.

**Fixture**

In `CRS-A16`, five entries support X and two oppose X for criterion `K-A16`; no count rule is supplied.

**Manual verification**

Attempted transition: `5 supports vs 2 opposes → K-A16 wins`.

Permitted state: all exact ECAs, source relations, and conflicts remain available to K-A16.

**Expected**

No majority result or hidden count aggregation occurs.

**Observed**

`CI-A16` may contain seven scoped contribution relations and their dependency/conflict context, but no majority result, truth, or finding exists. K-A16 must supply any combination semantics.

**Verdict**

PASS

**Boundary note**

This does not prohibit an explicit criterion-owned count rule from being tested separately.

---

## 5. Supplemental verification matrices

The following lower-risk fixtures are compact. Each still requires manual inspection of the named snapshot, exact scopes, relations, assessments, and criterion/rule provenance.

### 5.1 Source-independence fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| S01 | `CR-S01-A/B` are different entries from the same `SM-S01 v1[p2]` in `CRS-S01` | Same-source relation; distinct entry history; no independence | PASS |
| S02 | Witnesses A/B repeat a shared upstream statement in `CRS-S02` | Different people do not imply independent origin | PASS |
| S03 | Witnesses A/B match but origin is unknown in `CRS-S03` | `independence_unknown` | PASS |
| S04 | Supplied provenance establishes separate observations in `CRS-S04` | `independent` may be recorded; no result follows | PASS |
| S05 | Same text, no provenance in `CRS-S05` | No automatic duplicate/independence/corroboration conclusion | PASS |
| S06 | Different text from one upstream source in `CRS-S06` | Text difference does not imply independence | PASS |

### 5.2 Duplicate/derived/common-origin fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| D01 | Same source rematerialized twice | Two entry/materialization histories plus same-source relation | PASS |
| D02 | Filing copied from testimony | Derived/common-origin relation | PASS |
| D03 | Database report and summary generated from that report | Upstream dependency retained | PASS |
| D04 | Appellate copy imports trial entry | Imported prior-stage provenance; no independent support | PASS |
| D05 | Five copies of one source | Five identities possible; no five-fold contribution | PASS |
| D06 | Derived relation unknown | No fabricated common origin or independence | PASS |

### 5.3 Contradiction fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| CON01 | Exact X versus not-X in `CRS-CON01` | Direct contradiction relation only | PASS |
| CON02 | Only one aspect/scope conflicts | Exact partial conflict only | PASS |
| CON03 | Different time/context explains apparent conflict | Contextual/apparent/unresolved relation as supplied | PASS |
| CON04 | Same witness changes account | Changed-statement relation; no lie flag | PASS |
| CON05 | Document versus testimony conflict | No automatic source preference | PASS |
| CON06 | Both contradictory entries relate to criterion K-CON06 | Both may remain in CI; no universal zero-out | PASS |

### 5.4 Credibility fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| CA01 | Visible internal inconsistency in `CRS-CA01` | Scoped factor may be used by supplied rule | PASS |
| CA02 | Visible correction history | Exact content assessment only under supplied rule | PASS |
| CA03 | Required factor unavailable | `unresolved` or no assessment as supplied; no hidden fill-in | PASS |
| CA04 | Same witness, statement A/B | Separate assessments | PASS |
| CA05 | Same statement, criteria K1/K2 | Separate criterion-scoped assessments | PASS |
| CA06 | Witness role/profession differs | No default bonus | PASS |
| CA07 | Lawyer WorkProduct says witness weak | Court CA unchanged without independent assessment | PASS |
| CA08 | Credibility concern exists | No exclusion, deletion, or snapshot mutation | PASS |

### 5.5 Corroboration fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| COR01 | Independent A/B reinforce X | Criterion-local COR may exist; no score | PASS |
| COR02 | A/B share common origin | Repetition/common-origin; no independent COR | PASS |
| COR03 | Independence unknown | No automatic corroboration strength | PASS |
| COR04 | Only partial content reinforces | Exact reinforcing scope identified | PASS |
| COR05 | COR and CON both exist | Both retained | PASS |
| COR06 | Three independent observations | Relation set may exist; no +3/rank/confidence/result | PASS |

### 5.6 Qualitative-label anti-score fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| Q01 | K1 local labels `usable`, `limited`, `unresolved` | Meaning confined to K1 | PASS |
| Q02 | K2 uses different local vocabulary | No shared cross-criterion rank | PASS |
| Q03 | Attempt to read labels as Low < Medium < High globally | Rejected absent criterion-local ordering | PASS |
| Q04 | Attempt to convert labels into hidden numbers | Rejected | PASS |
| Q05 | Compare “high credibility” in K1 with “moderate contribution” in K2 | No universal comparison | PASS |

### 5.7 Contribution fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| E01 | Same entry supports K1 | One K1-specific ECA | PASS |
| E02 | Same entry irrelevant to K2 | Separate K2 ECA role | PASS |
| E03 | Same entry unresolved for K3 | Separate unresolved K3 ECA | PASS |
| E04 | Role is supports | No automatic K result | PASS |
| E05 | Role is opposes | No automatic K failure | PASS |
| E06 | Contribution has source dependence | Dependence remains explicit | PASS |
| E07 | Contribution has unresolved credibility | Allowed only under supplied rule | PASS |
| E08 | Entry present, no criterion relation | No ECA automatically | PASS |

### 5.8 CriterionInput fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| CI01 | CI references snapshot, criterion/version, requirement, proposition, entries/scopes, SRA/CON/COR/CA/ECA | Complete provenance-bearing input | PASS |
| CI02 | CI contains unknown independence | Unknown preserved | PASS |
| CI03 | CI contains contradictory contributions | Both preserved; no hidden winner | PASS |
| CI04 | CI contains COR | Still not result | PASS |
| CI05 | `CriterionInput CI05 → CourtFactFinding` | Rejected | PASS |
| CI06 | `CriterionInput CI06 → JudgeInterpretationInput` | Rejected | PASS |
| CI07 | `CriterionInput CI07 → criterion satisfied` | Rejected; DEC-012 owns evaluation | PASS |

### 5.9 Count-not-proof fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| N01 | 3 supports, 1 oppose | No majority result | PASS |
| N02 | 10 copies of one source | No ten-fold support | PASS |
| N03 | 2 independent supports, 4 dependent copies oppose | No hardcoded winner | PASS |
| N04 | 1 independent support, 1 independent oppose | No forced tie logic | PASS |
| N05 | Many entries with unknown independence | Count cannot resolve independence | PASS |
| N06 | Fixture criterion explicitly supplies count-based logic | Only that criterion may consume it; DEC-033 creates no universal rule | PASS |

### 5.10 Hidden-state fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| HID01 | ActualState supports one side | Not read | PASS |
| HID02 | PersonKnowledge reveals witness knowledge | Not read | PASS |
| HID03 | Hidden `isLying=true` | Not read | PASS |
| HID04 | Hidden memory accuracy | Not read | PASS |
| HID05 | Hidden judge belief | Not read | PASS |
| HID06 | Future event reveals later truth | Cannot affect current assessment | PASS |
| HID07 | Desired outcome selected by game | Cannot affect assessment | PASS |

### 5.11 Lawyer-analysis fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| L01 | Lawyer WP says witness weak | Court CA unchanged | PASS |
| L02 | Lawyer accurately identifies contradiction | Court CON requires authorized snapshot/rule/evaluator | PASS |
| L03 | Lawyer falsely identifies contradiction | Player analysis may be wrong | PASS |
| L04 | Lawyer traces common source | May guide later path; no direct SRA | PASS |
| L05 | High-capability lawyer organizes criterion evidence | WP improvement only | PASS |
| L06 | Capability attempts to alter court contribution/finding | Rejected | PASS |

### 5.12 JudgeProfile fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| J01 | General witness-favoring JudgeTrait | No credibility multiplier | PASS |
| J02 | Documentary-favoring JudgeTrait | No evidence multiplier | PASS |
| J03 | DEC-012 hard result has no genuine ambiguity | JudgeProfile not consulted | PASS |
| J04 | Valid criterion-declared genuine ambiguity | Only DEC-013/014 may derive explicit JII | PASS |
| J05 | DEC-033 CA reads JudgeProfile directly | Rejected | PASS |
| J06 | JudgeProfile modifies COR | Rejected | PASS |

### 5.13 Snapshot evolution and correction

| ID | Fixture | Expected | Status |
|---|---|---|---|
| SN01 | S1 creates SRA/CA/ECA/CI | Objects bind to S1 | PASS |
| SN02 | Correction creates S2 | S1 objects unchanged | PASS |
| SN03 | S2 differs | New identities and lineage | PASS |
| SN04 | Later exclusion changes S2 | S1 unchanged | PASS |
| SN05 | Reload S1 | Same semantics | PASS |
| SN06 | Mutate S1 to reflect S2 | Rejected | PASS |

### 5.14 Multi-stage fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| MS01 | Trial snapshot and assessments | Stable trial bindings | PASS |
| MS02 | Appeal snapshot references trial material under supplied rule | Separate appellate assessments | PASS |
| MS03 | Appellate assessment disagrees | Trial assessment unchanged | PASS |
| MS04 | Remand creates new stage/snapshot | Prior lineage remains | PASS |

### 5.15 Player/NPC symmetry

| ID | Fixture | Expected | Status |
|---|---|---|---|
| PN01 | Player and NPC receive equivalent snapshot/provenance/criterion conditions | Both preserve SRA/CON/COR/CA/ECA/CI; no scores | PASS |

### 5.16 Reload/determinism fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| RLD01 | Same snapshot/rules/inputs reloaded | Same relations/assessments | PASS |
| RLD02 | Hidden RNG changes credibility | Rejected | PASS |
| RLD03 | Reload changes source independence | Rejected | PASS |
| RLD04 | Reload changes contribution role | Rejected | PASS |
| RLD05 | Reload changes conflict/corroboration relation | Rejected | PASS |

---

## 6. Inherited-boundary coverage

| Inherited source | Meaningful fixtures | Status |
|---|---|---|
| DEC-031 | C01–C05, C27–C28, A01–A03, S01–S06, D01–D06, SN01–SN06, MS01–MS04 | PASS: snapshot-only, exact scope, provenance, and old-object immutability are exercised |
| DEC-032 | C16, A12, E01–E08, CA08, CI01, and all snapshot-entry fixtures | PASS: procedural permission/record inclusion is not contribution or credibility |
| DEC-011/012 | C22–C26, A08–A11, A16, E01–E08, CI01–CI07, N01–N06 | PASS: DEC-033 objects remain inputs; criterion owns combination/result |
| DEC-013/014 | A15, J01–J06 | PASS: JudgeProfile is blocked except through inherited valid ambiguity/JII path |
| DEC-017/018 | A07, L01–L06 | PASS: lawyer analysis/capability affects WorkProduct only |
| DEC-019 | C02, C14, A13–A14, HID01–HID07 | PASS: hidden CaseFile/ActualState/PersonKnowledge are inaccessible |
| DEC-026 | L05–L06 and source-analysis work fixtures | PASS: lawyer-side analysis remains Task/workload governed |

---

## 7. Coverage matrix

### 7.1 Design decisions ECA1–ECA34

| DEC-033 decisions | Fixture coverage | Status |
|---|---|---|
| ECA1–ECA5 identity/snapshot/scope/criterion/roles | C01–C03, C22–C23, A08–A09, CI01 | PASS |
| ECA6–ECA9 independence/duplicates/derived content | C04–C08, C19–C20, A01–A03, S01–S06, D01–D06 | PASS |
| ECA10–ECA13 contradiction/changed/documentary conflict | C09–C12, C21, A04–A05, CON01–CON06 | PASS |
| ECA14–ECA16 corroboration | C18–C21, A02–A03, A10–A11, COR01–COR06 | PASS |
| ECA17–ECA21 credibility identity/scope/factors/hidden/unresolved | C13–C17, A04–A06, A12–A14, CA01–CA08, HID01–HID07 | PASS |
| ECA22–ECA25 separation/adapter/aggregation/count | C22–C26, A08–A11/A16, E01–E08, CI01–CI07, N01–N06 | PASS |
| ECA26 JudgeProfile boundary | A15, J01–J06 | PASS |
| ECA27 lawyer versus court assessment | A07, L01–L06 | PASS |
| ECA28–ECA29 corrections and multi-stage | C27–C28, SN01–SN06, MS01–MS04 | PASS |
| ECA30 visibility | HID01–HID07, L01, PN01 | PASS |
| ECA31–ECA32 capability/workload | A07, L04–L06 | PASS |
| ECA33–ECA34 NPC/doctrine ownership | PN01, RLD01–RLD05, all supplied-rule fixtures | PASS |

### 7.2 Hard invariants 1–110

| Invariants | Primary coverage | Status |
|---|---|---|
| 1–10 | C01–C03, C27–C28, SN01–SN06 | PASS |
| 11–18 | C14, A13–A14, HID01–HID07 | PASS |
| 19–30 | C22–C26, A08–A09, E01–E08 | PASS |
| 31–41 | C04–C08, C19–C20, A01–A03, S01–S06, D01–D06 | PASS |
| 42–51 | C18–C21, A02–A03/A10–A11, COR01–COR06 | PASS |
| 52–63 | C09–C12, C21, A04–A05, CON01–CON06 | PASS |
| 64–80 | C13–C17, C24, A04–A06/A12–A14, CA01–CA08 | PASS |
| 81–92 | C23–C26, A01/A08–A11/A16, CI01–CI07, N01–N06 | PASS |
| 93–98 | A07/A15, L01–L06, J01–J06 | PASS |
| 99–104 | C27–C28, SN01–SN06, MS01–MS04, RLD01–RLD05 | PASS |
| 105–110 | HID01–HID07, PN01, L05–L06, RLD01–RLD05 | PASS |

No invariant range is unassigned. The matrix is compact; detailed and supplemental fixtures provide object-level coverage.

---

## 8. False-PASS audit

The completed review checked:

- equal text was never treated as independence;
- different witnesses were not treated as independent without provenance;
- derived content did not become independent support;
- contradiction was not treated as lie, falsity, or automatic penalty;
- profession/status did not create a credibility bonus;
- hidden PersonKnowledge, ActualState, deception, judge belief, and future events were excluded;
- no global witness credibility label or numeric evidence score was created;
- qualitative labels remained criterion-local;
- contribution roles did not become criterion results;
- corroboration did not become truth/finding;
- entry count and majority did not become proof;
- JudgeProfile did not become a multiplier;
- old assessments remained snapshot-bound;
- lawyer WorkProduct did not mutate court assessment;
- NPC cases did not resolve through a score; and
- replay did not reroll relations or assessments.

### Repetition/template audit

- Generic repeated verification sentences in 5+ unrelated detailed cases: 0 identified.
- Attack-label pseudo-objects: 0; each attack names concrete source objects, snapshot, criterion, and target.
- Empty attempted transitions: 0.
- Expected/Observed semantic contradictions: 0.
- Generic “credible” or “strong” labels without criterion/scope/rule context: 0.
- Vague “independent source” claims without provenance basis: 0.

---

## 9. Final summary

**Total detailed cases:** 44 (C01–C28 and A01–A16)  
**PASS:** 44  
**PARTIAL:** 0  
**FAIL:** 0

**Architecture blocker for DEC-033 promotion?** No.  
**Inherited DEC contradiction?** No.  
**Snapshot-boundary violation?** No.  
**Source-independence inference leak?** No.  
**Derived-content double-count?** No.  
**Contradiction→lie shortcut?** No.  
**Global credibility leak?** No.  
**Hidden-state access?** No.  
**Corroboration→score/truth/finding shortcut?** No.  
**Contribution→criterion-result shortcut?** No.  
**Count-based proof?** No.  
**Qualitative-label global ranking?** No.  
**JudgeProfile multiplier leak?** No.  
**Lawyer-analysis/court-assessment collapse?** No.  
**Old-assessment mutation?** No.  
**Player/NPC divergence?** No.  
**Reload instability?** No.

### Promotion recommendation

Based on the fixture results, recommend:

```text
DEC-033 v0.1
→ v0.2 Accepted

TEST-032 v0.1
→ v0.2 Accepted / manual fixture-level verification
```

No genuine semantic ambiguity requires reopening DEC-033. Any later authored doctrine, criterion combination logic, UI, or implementation must preserve the snapshot-only input boundary, exact provenance, criterion-local semantics, hidden-state exclusion, and non-score architecture verified here.

