# THE FIRM — TEST-030 Canonical Court Record Model

Test ID: TEST-LITIGATION-030  
Version: v0.1 — Proposed / manual fixture-level verification  
Status: **Proposed / manual fixture-level verification**  
Project: THE FIRM  
Test type: Manual semantic verification

Primary source of truth: `DEC-LITIGATION-031_CANONICAL_COURT_RECORD_MODEL.md` v0.1 Proposed / design review required.  
Inherited sources: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `02_ARCHITECTURE_RULES.md`, `SYS-001_LITIGATION.md`, and the accepted litigation DEC/TEST chain through DEC-030 / TEST-029.

This test verifies DEC-031's semantic architecture at fixture level. It is not an implementation, UI, Korean evidence-law, admissibility-law, appellate-law, credibility, evidentiary-weight, or balancing test.

## 1. Purpose and verdict rules

TEST-030 verifies whether DEC-031 represents canonical CourtRecord semantics while preserving stable record and entry identity, exact source/version/scope, explicit materialization lineage, append-only status/use/access history, correction and supersession, duplicate/repeated/derived/imported relations, immutable snapshots, cutoff correctness, deterministic membership, hidden-state exclusion, multi-stage lineage, player/NPC symmetry, and no truth/JII/finding/judgment shortcut.

The primary boundary is:

```text
ActualStateRecord
≠ CaseFileState
≠ LawyerWorkProduct
≠ ProceedingEvent
≠ RecordMaterializationEvent
≠ CourtRecord
≠ CourtRecordEntry
≠ CourtRecordSnapshot
≠ CourtFactFinding
≠ JudgeInterpretationInput
```

Additional boundaries under test are:

```text
recorded ≠ admitted ≠ considered ≠ believed ≠ true ≠ found

source object
≠ selected source scope
≠ materialized scope
≠ CourtRecordEntry

CourtRecordEntry exists
≠ currently permitted use
≠ snapshot membership
≠ adjudicative contribution
≠ CourtFactFinding

entry exists
≠ participant may see it
≠ player may see it
≠ adjudication may consume it
```

Only these verdicts are used:

- **PASS** — the fixture produces a clear result consistent with DEC-031 and inherited architecture.
- **PARTIAL** — DEC-031 itself leaves a material semantic ambiguity or contradiction that prevents deterministic verification.
- **FAIL** — DEC-031 permits or implies an invalid shortcut such as a materialization bypass, silent scope expansion, provenance loss, destructive rewrite, old-snapshot mutation, future-entry leakage, hidden-state access, visibility/use collapse, stage-lineage corruption, player/NPC divergence, or direct truth/JII/finding/judgment promotion.

Doctrine, UI, storage/schema, exact cutoff algorithm, sealing law, appellate law, and contribution/weight algorithms are not PARTIAL merely because they are TBD. When a transition needs doctrine, the fixture supplies an explicit rule.

## 2. Fixture conventions

Fixture identifiers are concrete case-local objects. They are not canonical types created by the architecture.

```text
M-*       Matter
ST-*      procedural stage
CR-*      CourtRecordEntry
RM-*      RecordMaterializationEvent
RSE-*     RecordStatusEvent
CE-*      CorrectionEvent
SE-*      SupersessionEvent
CRS-*     CourtRecordSnapshot
SM-*      SnapshotMembership
```

Every detailed case names the relevant source identity, source version, selected/materialized scope, materialization event, entry, status event, snapshot, cutoff, or access/use relation where applicable.

## 3. Detailed critical fixtures

### Case C01 — Stable CourtRecord identity within one Matter and stage

**Purpose**

Verify that one CourtRecord has stable identity while entries and status history change.

**Fixture**

Matter `M-C01` at stage `ST-C01` receives materializations `RM-C01-A` and `RM-C01-B`, producing entries `CR-C01-A` and `CR-C01-B`.

**Manual verification**

Compare CourtRecord identity before and after both materializations, and inspect Matter/stage/aggregation references.

**Expected**

One stable `CourtRecord CR-C01` owns both entries. Entry creation does not create a new record identity or convert the record into a transcript, CaseFile, or finding collection.

**Observed**

`CR-C01-A` and `CR-C01-B` point to the same stable CourtRecord identity for `M-C01/ST-C01`; only the entry collection and history grow. No second CourtRecord, CaseFile, judgment, or CourtFactFinding collection is created.

**Verdict**

PASS

**Boundary note**

This does not decide whether a different procedural stage should use the same or a distinct CourtRecord.

### Case C02 — Distinct trial and appellate CourtRecords with explicit lineage

**Purpose**

Verify stage identity separation and explicit cross-stage reference.

**Fixture**

Trial record `CR-C02-T` contains entry `CR-C02-T-1` and snapshot `CRS-C02-T`. Appellate record `CR-C02-A` is created with supplied reference event `IR-C02` pointing to `CR-C02-T-1`.

**Manual verification**

Inspect record identities, stage references, original entry identity, import/reference event, and appellate entry/snapshot relations.

**Expected**

Trial and appellate CourtRecords remain distinct. `IR-C02` preserves the original trial identity and provenance; it does not copy text into a provenance-less truth object.

**Observed**

`CR-C02-T` belongs to `ST-C02-Trial`, while `CR-C02-A` belongs to `ST-C02-Appeal`. `IR-C02` references `CR-C02-T-1` and records its own authority/context; the trial entry and `CRS-C02-T` remain unchanged.

**Verdict**

PASS

**Boundary note**

No appellate review doctrine or legal effect is tested.

### Case C03 — Testimony without materialization creates no CourtRecordEntry

**Purpose**

Verify the inherited DEC-030 materialization gate.

**Fixture**

`TestimonyEvent TE-C03` exists for witness `W-C03` in proceeding `PC-C03`. No `RecordMaterializationEvent` exists.

**Manual verification**

Inspect `TE-C03`, CourtRecord entry collection, source lineage, and downstream snapshot candidates.

**Expected**

`TE-C03` remains testimony. No CourtRecordEntry, snapshot membership, truth, JII, or finding is created.

**Observed**

`TE-C03` is queryable with its proceeding and witness provenance, but `CourtRecord CR-C03` has no entry corresponding to it and no `CRS-C03` membership exists.

**Verdict**

PASS

**Boundary note**

This does not decide whether a future supplied rule would authorize materialization.

### Case C04 — Valid materialization creates one exact-scope entry

**Purpose**

Verify complete materialization lineage and one scoped entry.

**Fixture**

`TestimonyEvent TE-C04` contains answer portion `answer[1]`. `RM-C04` cites `TE-C04[v1]`, scope `answer[1]`, authority `Authority-C04`, and rule `Rule-FIX-Materialize-C04`.

**Manual verification**

Inspect source identity/version/scope, RM identity, authority/rule, entry identity, order, and downstream states.

**Expected**

One `CourtRecordEntry CR-C04` is created with source `TE-C04[v1]`, exact scope `answer[1]`, RM/rule/authority lineage, and no truth/JII/finding.

**Observed**

`RM-C04` creates exactly `CR-C04` for `TE-C04[v1].answer[1]`; the entry points to `Authority-C04` and `Rule-FIX-Materialize-C04` and preserves event order. No second entry, expanded testimony scope, truth state, JII, or finding is produced.

**Verdict**

PASS

**Boundary note**

The fixture verifies record materialization semantics, not testimony admissibility doctrine.

### Case C05 — Explicit no-entry result remains historical

**Purpose**

Verify that a procedural no-entry result is inspectable without creating a CourtRecordEntry.

**Fixture**

`TE-C05` is presented to `RM-C05`; supplied rule `Rule-FIX-NoEntry-C05` produces `NoEntryResult NER-C05` with reason `not-materialized`. No CourtRecordEntry is created.

**Manual verification**

Inspect source event, RM, NER, CourtRecord collection, and later audit references.

**Expected**

`NER-C05` remains historical and linked to `TE-C05/RM-C05`; no entry or snapshot membership exists.

**Observed**

`NER-C05` records the source, RM, supplied rule, and no-entry result. CourtRecord `CR-C05` contains no corresponding entry, while later inspection can distinguish the no-entry outcome from absence of an attempted materialization.

**Verdict**

PASS

**Boundary note**

The fixture does not establish the legal reason represented by `not-materialized` outside the supplied rule.

### Case C06 — Partial artifact scope is preserved

**Purpose**

Verify exact page scope and no silent sweep of the source.

**Fixture**

Artifact `A-C06[v1]` contains pages 1–20. `RM-C06` under `Rule-FIX-Page-4-5-C06` permits only `A-C06[v1][p4–p5]`.

**Manual verification**

Inspect source version, selected scope, materialized scope, entry content locator, and excluded pages.

**Expected**

`CR-C06.scope=A-C06[v1][p4–p5]`; pages 1–3 and 6–20 are not silently included.

**Observed**

`RM-C06` creates `CR-C06` with exact scope `A-C06[v1][p4–p5]` and rule/source lineage. The entry does not resolve to pages 1–3 or 6–20, and no whole-artifact entry is present.

**Verdict**

PASS

**Boundary note**

The page rule is fixture-supplied and is not an evidence-law claim.

### Case C07 — One answer portion from a larger TestimonyEvent

**Purpose**

Verify answer-level scope inside a larger testimony source.

**Fixture**

`TE-C07[v1]` contains answers `A`, `B`, and `C`. `RM-C07` permits only `TE-C07[v1].answer[B]`.

**Manual verification**

Compare testimony payload, scope locator, entry content, and snapshot candidate.

**Expected**

Only answer B is materialized. Answers A and C remain source content outside `CR-C07`.

**Observed**

`CR-C07` resolves to `TE-C07[v1].answer[B]` through `RM-C07`; its lineage excludes A and C. No full testimony entry or finding is produced from the partial scope.

**Verdict**

PASS

**Boundary note**

This tests scope representation, not the legal effect of a partial answer.

### Case C08 — Later source edit does not change existing entry scope

**Purpose**

Verify that entry scope resolves against the original immutable source version.

**Fixture**

`A-C08[v1]` has page 4 text `X`. `RM-C08` creates `CR-C08` for page 4. Later source version `A-C08[v2]` changes page 4 to `Y`.

**Manual verification**

Resolve `CR-C08` before and after v2, inspect source version references, and check for automatic correction/supersession.

**Expected**

`CR-C08` continues to reference `A-C08[v1][p4]`. v2 has no effect without a new explicit correction/materialization event.

**Observed**

After `A-C08[v2]` is available, `CR-C08` still resolves to v1 page 4 text `X` and retains `RM-C08` lineage. No automatic change to Y, correction, or supersession occurs.

**Verdict**

PASS

**Boundary note**

This does not decide whether a future correction rule should create a v2 entry.

### Case C09 — Explicit scope extension creates new lineage

**Purpose**

Verify that later additional scope does not silently expand an existing entry.

**Fixture**

`RM-C09-A` materializes `A-C09[v1][p4–p5]` into `CR-C09-A`. Later `RM-C09-B` explicitly materializes `A-C09[v1][p6]` under `Rule-FIX-Extension-C09`.

**Manual verification**

Inspect both RMs, entries, scopes, relations, and source versions.

**Expected**

`CR-C09-A` remains p4–p5. The later scope is represented by `CR-C09-B` or an explicit extension relation with its own RM lineage; no hidden sweep occurs.

**Observed**

`CR-C09-A` retains scope p4–p5 and original RM. `RM-C09-B` creates separate scoped content `A-C09[v1][p6]` in `CR-C09-B`, linked by an explicit source/extension relation. No entry silently expands to p4–p6.

**Verdict**

PASS

**Boundary note**

The fixture does not require one particular physical representation for the extension relation.

### Case C10 — Limitation changes future use, not history

**Purpose**

Verify append-only limitation semantics.

**Fixture**

`CR-C10` was created by `RM-C10` for scope `A-C10[p2]`. Later supplied `RSE-C10=limited` applies only to `Purpose-C10-2` from effective event `E-C10-Limit`.

**Manual verification**

Inspect original entry/RM, status event, purpose scope, earlier snapshot, and later snapshot eligibility.

**Expected**

`CR-C10` and `RM-C10` remain queryable. Only future use for `Purpose-C10-2` changes under the supplied rule.

**Observed**

`RSE-C10` is appended with target scope, purpose, effective event, and supplied rule. `CR-C10` and `RM-C10` retain original identities and content; the later purpose projection changes while an earlier snapshot remains intact.

**Verdict**

PASS

**Boundary note**

The fixture does not define a general legal meaning of limitation.

### Case C11 — Exclusion affects supplied use without deleting entry

**Purpose**

Verify that exclusion is a scoped status/use event.

**Fixture**

`CR-C11` was validly materialized. `RSE-C11=excluded_from_supplied_use` targets `Purpose-C11-FactReview` after `E-C11-Exclude`.

**Manual verification**

Inspect entry history, exclusion target/scope, later snapshot treatment, and prior record references.

**Expected**

The entry, source, RM, and earlier snapshots remain. A later supplied snapshot may exclude the targeted use only.

**Observed**

`RSE-C11` records the affected purpose and effective event; `CR-C11` remains in CourtRecord history and is still addressable by its identity. The later fact-review snapshot omits its targeted scope under the supplied rule, while the historical entry and earlier snapshot remain.

**Verdict**

PASS

**Boundary note**

No general exclusion doctrine is inferred.

### Case C12 — Withdrawal preserves historical entry

**Purpose**

Verify non-destructive withdrawal.

**Fixture**

`CR-C12` was created from `RM-C12`. Later `RSE-C12=withdrawn` is supplied for future use.

**Manual verification**

Compare entry identity, materialization lineage, withdrawal event, and earlier/later snapshot membership.

**Expected**

Withdrawal changes future permitted use under its rule but does not erase `CR-C12`, `RM-C12`, or snapshots created before withdrawal.

**Observed**

`RSE-C12` points to `CR-C12` and its future-use context. `CR-C12` and `RM-C12` remain queryable, `CRS-C12-Old` still contains its original membership, and only later supplied membership changes.

**Verdict**

PASS

**Boundary note**

The fixture does not decide whether withdrawal permits any particular later re-use.

### Case C13 — Correction creates linked corrected version

**Purpose**

Verify correction without destructive overwrite.

**Fixture**

`CR-C13-v1` contains source scope `A-C13[v1][p7]`. `CE-C13` identifies a supplied correction to that scope and creates `CR-C13-v2`.

**Manual verification**

Inspect v1/v2 identities, source versions, correction authority, scope, lineage, and earlier snapshot.

**Expected**

v1 remains queryable. v2 is explicit and linked by correction lineage. No old snapshot or old entry is rewritten.

**Observed**

`CE-C13` links `CR-C13-v1` to `CR-C13-v2` with supplied authority and affected scope. v1's original content and identity remain; v2 is a separate corrected object, and `CRS-C13-Old` still references v1.

**Verdict**

PASS

**Boundary note**

The correction rule is supplied and does not establish transcript doctrine.

### Case C14 — Supersession is context-specific

**Purpose**

Verify that supersession changes later preference without universal deletion.

**Fixture**

`CR-C14-v1` and `CR-C14-v2` are linked by `SE-C14`. The supplied rule prefers v2 only for `Stage-C14-Review`.

**Manual verification**

Inspect both entries, supersession relation, stage-specific use projection, and an unrelated purpose projection.

**Expected**

v2 is preferred only for the supplied context. v1 remains historical and may remain preferred/available elsewhere under supplied rules.

**Observed**

`SE-C14` records v1→v2 and context `Stage-C14-Review`; the review projection selects v2, while `Purpose-C14-History` still resolves v1 as historical content. No universal deletion occurs.

**Verdict**

PASS

**Boundary note**

No general rule is inferred for how every consumer chooses a superseded version.

### Case C15 — Earlier snapshot retains old version

**Purpose**

Verify snapshot stability across correction/supersession.

**Fixture**

`CRS-C15-S1` includes `CR-C15-v1` at cutoff `C15-1`. Later `CE-C15` creates `CR-C15-v2`, and later snapshot `CRS-C15-S2` is built under a rule preferring v2.

**Manual verification**

Compare both snapshot memberships, cutoff references, entry versions, and correction lineage.

**Expected**

S1 retains v1. S2 may include v2 under supplied rules. Neither snapshot mutates the other.

**Observed**

`SM-C15-S1` still points to v1 at cutoff `C15-1`; `SM-C15-S2` points to v2 at the later cutoff and cites `CE-C15`/the supplied preference rule. S1 is unchanged.

**Verdict**

PASS

**Boundary note**

The fixture tests version and snapshot lineage, not adjudicative preference merits.

### Case C16 — Same witness, identical text, two hearings

**Purpose**

Verify distinct occurrences and materialization histories despite identical text.

**Fixture**

Witness `W-C16` says identical text X in `TE-C16-A` at `H-C16-A` and `TE-C16-B` at `H-C16-B`. `RM-C16-A` and `RM-C16-B` separately materialize them.

**Manual verification**

Compare testimony IDs, proceeding IDs, event order, RMs, entries, and any shared-source relation.

**Expected**

Two TestimonyEvents and two materialization lineages remain distinct. Text equality does not merge them or create automatic weight.

**Observed**

`TE-C16-A` and `TE-C16-B` retain different hearing/proceeding identities; `RM-C16-A/B` lead to distinct entry identities `CR-C16-A/B`. A textual-match relation may be recorded, but no merge or weight score appears.

**Verdict**

PASS

**Boundary note**

No corroboration or contribution algorithm is tested.

### Case C17 — Two witnesses, identical text

**Purpose**

Verify independent source identity for matching statements.

**Fixture**

`W-C17-1` creates `TE-C17-1`; `W-C17-2` creates `TE-C17-2`. Both contain X and are separately materialized as `CR-C17-1` and `CR-C17-2`.

**Manual verification**

Inspect witness/source IDs, testimony IDs, RMs, entry IDs, and duplicate relations.

**Expected**

Entries remain distinct because provenance differs. No canonical corroboration score or truth state is created.

**Observed**

`CR-C17-1` traces to `W-C17-1/TE-C17-1/RM-C17-1`, while `CR-C17-2` traces to `W-C17-2/TE-C17-2/RM-C17-2`. Matching text creates no identity merge or `CorroborationScore`.

**Verdict**

PASS

**Boundary note**

The fixture does not evaluate source independence or evidentiary contribution.

### Case C18 — Same source page materialized twice

**Purpose**

Verify explicit repeated-materialization history without automatic double proof.

**Fixture**

Source `A-C18[v1][p2]` is presented in two proceedings. `RM-C18-A` and `RM-C18-B` separately materialize the same scope.

**Manual verification**

Inspect source identity, two presentation/materialization events, entry/relation structure, and score fields.

**Expected**

The record preserves both event histories or an explicit shared-source/materialization relation. It creates no automatic multiplier, proof score, or corroboration score.

**Observed**

`RM-C18-A` and `RM-C18-B` remain separate event identities pointing to the same immutable source scope; entries `CR-C18-A/B` retain both histories or an explicit relation. No weight, proof, or corroboration score is emitted.

**Verdict**

PASS

**Boundary note**

The fixture does not choose whether a future adjudicator treats repeated use as redundant.

### Case C19 — Filing repeats testimony

**Purpose**

Verify derived-copy provenance and no automatic source independence.

**Fixture**

`CR-C19-TE` derives from `TE-C19`. Filing source `F-C19` repeats the same text and is separately materialized as `CR-C19-F` with `DerivedFrom-C19` relation.

**Manual verification**

Inspect source families, derived-from relation, materialization lineage, and independence/contribution fields.

**Expected**

The filing entry remains filing-derived and linked to testimony. It is not automatically an independent corroborating source or weight increment.

**Observed**

`CR-C19-F` identifies `F-C19` as its source and `DerivedFrom-C19` to `CR-C19-TE`; the original testimony entry remains distinct. No independent-source flag, weight score, or corroboration score is created automatically.

**Verdict**

PASS

**Boundary note**

The fixture does not decide how later criteria classify derived material.

### Case C20 — Imported prior-stage entry retains provenance

**Purpose**

Verify imported/reference lineage without provenance-less cloning.

**Fixture**

Trial entry `CR-C20-T` at `ST-C20-Trial` is referenced by `IR-C20` in appellate record `CR-C20-A`.

**Manual verification**

Inspect original identity, import/reference event, appellate relation, source scope, and any derived entry.

**Expected**

The original trial identity and source/RM lineage remain traceable. Any appellate derivative has explicit import/reference lineage and does not become an ungrounded new truth object.

**Observed**

`IR-C20` links `CR-C20-A` to original `CR-C20-T`, preserving trial stage, original source scope, original RM, and import authority. No provenance-less copied entry replaces the trial object.

**Verdict**

PASS

**Boundary note**

No appellate legal-effect rule is tested.

### Case C21 — Snapshot cutoff excludes later entry

**Purpose**

Verify cutoff correctness.

**Fixture**

`CR-C21-A` materializes before cutoff event `Cut-C21-1`. `CR-C21-B` materializes after that cutoff. Snapshot `CRS-C21-1` is constructed for the same CourtRecord and purpose at `Cut-C21-1`.

**Manual verification**

Inspect both RM order/effective events, cutoff identity, snapshot memberships, and source history.

**Expected**

S1 may include CR-A under supplied use rules and cannot include CR-B.

**Observed**

`SM-C21-1` references `CR-C21-A` and cutoff `Cut-C21-1`; `CR-C21-B` is absent because its RM occurs after the cutoff. The later entry remains in CourtRecord history outside S1.

**Verdict**

PASS

**Boundary note**

The exact physical cutoff serialization is not tested.

### Case C22 — Later snapshot includes later entry while old snapshot remains unchanged

**Purpose**

Verify creation of a new snapshot rather than mutation of an old one.

**Fixture**

S1 from `C22-1` includes `CR-C22-A`. Later `RM-C22-B` creates `CR-C22-B`; S2 is built at `C22-2` under the same supplied use rules.

**Manual verification**

Compare snapshot IDs, cutoffs, memberships, and immutable construction traces.

**Expected**

S1 remains A-only. S2 may include A and B. S1 is never refreshed in place.

**Observed**

`CRS-C22-S1` retains cutoff `C22-1` and membership only for A; `CRS-C22-S2` has cutoff `C22-2` and memberships A/B. The later RM does not alter S1.

**Verdict**

PASS

**Boundary note**

Membership still depends on supplied permitted-use rules.

### Case C23 — Snapshot includes exact version and partial scope

**Purpose**

Verify snapshot membership precision.

**Fixture**

`CR-C23` has two source versions related by correction; supplied snapshot rule permits only `A-C23[v2][p4–p5]` at cutoff `C23-2`.

**Manual verification**

Inspect `SnapshotMembership SM-C23`, entry version, scope locator, correction lineage, and construction rule.

**Expected**

S23 records v2 and pages 4–5 exactly, with rule/status lineage. It does not include v1 or the rest of v2.

**Observed**

`SM-C23` points to `CR-C23-v2` and scope `A-C23[v2][p4–p5]`, citing the supplied preference and scope rules. v1 and pages outside 4–5 are absent from this membership.

**Verdict**

PASS

**Boundary note**

The fixture tests membership representation, not the legal reason for preferring v2.

### Case C24 — Unfavorable permitted entry is not omitted

**Purpose**

Verify outcome-neutral snapshot construction.

**Fixture**

`CR-C24-A` supports party A and `CR-C24-B` supports party B. Both are active and permitted for purpose `Purpose-C24` at cutoff `Cut-C24`; no exclusion rule exists.

**Manual verification**

Inspect snapshot builder inputs, both entry memberships, supplied rules, and any hidden outcome/selection input.

**Expected**

Both permitted entries are included or treated according to the supplied rule. Desired outcome cannot justify omission.

**Observed**

`CRS-C24` includes memberships for both `CR-C24-A` and `CR-C24-B` with their exact scopes and lineage. No party-preference field or hidden outcome selector is read, and neither entry is silently omitted.

**Verdict**

PASS

**Boundary note**

This does not evaluate which proposition a later adjudicator accepts.

### Case C25 — Hidden state and future content cannot enter snapshot

**Purpose**

Verify the snapshot input boundary.

**Fixture**

Before cutoff `Cut-C25`, CourtRecord contains `CR-C25-A`. Hidden `CaseFileState CFS-C25`, hidden `ActualStateRecord AS-C25`, hidden `PersonKnowledge PK-C25`, hidden judge belief `JB-C25`, and future record entry `CR-C25-Future` all support proposition X but are not authorized snapshot inputs.

**Manual verification**

Trace snapshot builder reads, membership sources, cutoff, and construction provenance.

**Expected**

Snapshot may include only authorized record content through cutoff. Hidden state and future entry cannot create membership.

**Observed**

`CRS-C25` contains only authorized `CR-C25-A` membership at `Cut-C25`; no membership references `CFS-C25`, `AS-C25`, `PK-C25`, `JB-C25`, or `CR-C25-Future`. Construction provenance lists record-side inputs and cutoff only.

**Verdict**

PASS

**Boundary note**

This does not test the substantive fact-finding algorithm that later consumes the snapshot.

## 4. Focused architecture attacks

### Case A01 — Testimony bypasses materialization

**Purpose**

Reject direct testimony-to-entry creation.

**Fixture**

`TestimonyEvent TE-A01` exists; no `RM-A01` exists.

Attempted transition: `TE-A01 → CourtRecordEntry CR-A01`.

Permitted state: `TE-A01` remains a testimony event with provenance; `CR-A01` is absent.

**Expected**

No CourtRecordEntry exists without valid materialization.

**Observed**

`TE-A01` is present with proceeding and witness references, while CourtRecord has no `CR-A01` and no snapshot membership for it. No truth/JII/finding is emitted.

**Verdict**

PASS

**Boundary note**

No admission or testimony doctrine is tested.

### Case A02 — ProceedingEvent becomes record because it occurred in court

**Purpose**

Reject ProceedingEvent-to-entry bypass.

**Fixture**

`ProceedingEvent PE-A02` references `OralAdvocacyEvent OA-A02`; no `RM-A02` exists.

Attempted transition: `PE-A02 → CourtRecordEntry CR-A02`.

Permitted state: PE/OA retain their courtroom history; no record entry appears.

**Expected**

Court occurrence and record materialization remain distinct.

**Observed**

`PE-A02` orders `OA-A02` but does not create `CR-A02`; the CourtRecord entry collection and snapshots remain unchanged.

**Verdict**

PASS

**Boundary note**

An explicit future RM could authorize an entry under a supplied rule.

### Case A03 — Partial materialization silently includes full source

**Purpose**

Reject scope expansion.

**Fixture**

Artifact `A-A03[v1][p1–p20]`; `RM-A03` explicitly permits p4–p5.

Attempted transition: `RM-A03 → CR-A03.scope=A-A03[v1][p1–p20]`.

Permitted state: `CR-A03.scope=A-A03[v1][p4–p5]` with exact lineage.

**Expected**

Only p4–p5 enter the entry.

**Observed**

`CR-A03` resolves to p4–p5 and cites `RM-A03`; p1–p3 and p6–p20 have no membership in that entry. No whole-source scope is created.

**Verdict**

PASS

**Boundary note**

The supplied scope rule is not general admissibility law.

### Case A04 — Entry assertion becomes truth

**Purpose**

Reject record-to-truth laundering.

**Fixture**

`CR-A04` contains permitted scope asserting X.

Attempted transition: `CourtRecordEntry CR-A04 → Truth(X)`.

Permitted state: CR-A04 remains record content with source/RM/rule lineage.

**Expected**

No truth state is created.

**Observed**

`CR-A04` remains in CourtRecord with its exact scope and lineage; no `Truth(X)`, credibility state, or finding is written.

**Verdict**

PASS

**Boundary note**

Later adjudication is outside this attack.

### Case A05 — Entry directly creates CourtFactFinding

**Purpose**

Reject entry-to-finding shortcut.

**Fixture**

`CR-A05` is validly materialized; no recognition criterion or fact-evaluation event exists.

Attempted transition: `CR-A05 → CourtFactFinding FF-A05`.

Permitted state: CR-A05 remains an entry available only for later authorized snapshot use.

**Expected**

No CourtFactFinding exists.

**Observed**

`CR-A05` is present with materialization lineage, but `FF-A05` and any finding status are absent. No direct adjudicative mutation occurs.

**Verdict**

PASS

**Boundary note**

The fixture does not evaluate criteria or sufficiency.

### Case A06 — Entry directly creates JII

**Purpose**

Reject entry-to-JII shortcut.

**Fixture**

`CR-A06` exists; no judge-interpretation event is supplied.

Attempted transition: `CR-A06 → JudgeInterpretationInput JII-A06`.

Permitted state: CR-A06 may be referenced by a later authorized snapshot; JII remains unchanged.

**Expected**

No JII is directly created.

**Observed**

`CR-A06` remains a record entry and `JII-A06` does not appear. Its existence changes neither hidden judge belief nor future finding.

**Verdict**

PASS

**Boundary note**

Judge-interpretation design remains owned by inherited/future decisions.

### Case A07 — Later exclusion deletes original entry

**Purpose**

Reject destructive status history.

**Fixture**

`CR-A07` and `RM-A07` exist. Later `RSE-A07=excluded_from_supplied_use` targets purpose P.

Attempted transition: `RSE-A07 → delete CR-A07 and RM-A07`.

Permitted state: append RSE-A07 and change only future supplied use for P.

**Expected**

Entry and materialization history remain.

**Observed**

`RSE-A07` remains linked to `CR-A07`; `CR-A07` and `RM-A07` retain original identity/content. A future P snapshot may exclude it, but prior history remains queryable.

**Verdict**

PASS

**Boundary note**

No general exclusion doctrine is asserted.

### Case A08 — Correction overwrites prior entry

**Purpose**

Reject correction by destructive mutation.

**Fixture**

`CR-A08-v1` is included in `CRS-A08-S1`. `CE-A08` supplies corrected content v2.

Attempted transition: `CE-A08 → replace payload/identity of CR-A08-v1`.

Permitted state: create/link `CR-A08-v2`; preserve v1 and S1.

**Expected**

Correction is append-only and versioned.

**Observed**

`CE-A08` creates explicit `CR-A08-v2` linked to v1; v1 still resolves in its original form and `CRS-A08-S1` retains v1 membership. No in-place payload replacement occurs.

**Verdict**

PASS

**Boundary note**

The supplied correction rule does not establish transcript law.

### Case A09 — Same text in different hearings merges

**Purpose**

Reject text-only semantic identity collapse.

**Fixture**

`TE-A09-1` and `TE-A09-2` contain identical text but have different proceeding IDs and materialization events.

Attempted transition: `text(TE-A09-1)=text(TE-A09-2) → one CourtRecordEntry`.

Permitted state: distinct source/event/RM/entry identities with optional textual-match relation.

**Expected**

Matching text alone does not merge entries.

**Observed**

`CR-A09-1` and `CR-A09-2` preserve different testimony, hearing, and RM lineage. A textual-match annotation may exist, but one entry does not replace the other.

**Verdict**

PASS

**Boundary note**

No contribution or corroboration effect is evaluated.

### Case A10 — Same source materialized twice doubles proof

**Purpose**

Reject automatic duplicate weight.

**Fixture**

Immutable source `A-A10[v1][p2]` is materialized by `RM-A10-1` and `RM-A10-2` in separate events.

Attempted transition: `two materializations of A-A10[v1][p2] → ProofScore=2`.

Permitted state: two explicit materialization histories or shared-source relation; no score.

**Expected**

Record semantics preserve identity and provenance without counting proof.

**Observed**

`RM-A10-1/2` remain distinct and point to the same immutable source scope; `CR-A10-1/2` preserve both lineages or an explicit relation. No ProofScore, EvidenceWeight, or automatic contribution is created.

**Verdict**

PASS

**Boundary note**

Adjudication contribution remains future work.

### Case A11 — Three matching entries create CorroborationScore

**Purpose**

Reject record-layer corroboration calculation.

**Fixture**

`CR-A11-1`, `CR-A11-2`, and `CR-A11-3` contain matching proposition text with distinct known sources.

Attempted transition: `CR-A11-1 + CR-A11-2 + CR-A11-3 → CorroborationScore=3`.

Permitted state: entries and source relations remain available for later criteria; no canonical score exists.

**Expected**

No CorroborationScore or truth state is created.

**Observed**

All three entries remain separately addressable with their source/RM lineage. No `CorroborationScore`, truth, finding, or outcome modifier is stored by CourtRecord.

**Verdict**

PASS

**Boundary note**

The fixture does not classify source independence.

### Case A12 — Later event mutates old snapshot

**Purpose**

Reject live-snapshot mutation.

**Fixture**

`CRS-A12-S1` is built at cutoff `Cut-A12-1`. Later `RM-A12-Late` and `RSE-A12-Late` occur.

Attempted transition: `RM-A12-Late/RSE-A12-Late → mutate CRS-A12-S1`.

Permitted state: preserve S1 and create later snapshot S2 if needed.

**Expected**

Old snapshot content and membership remain unchanged.

**Observed**

`CRS-A12-S1` retains its original cutoff and membership after the later RM/status event. Any later S2 has its own identity/cutoff; no old membership is changed.

**Verdict**

PASS

**Boundary note**

The fixture does not mandate a specific snapshot serialization format.

### Case A13 — Snapshot omits unfavorable permitted entry

**Purpose**

Reject outcome-selected snapshot construction.

**Fixture**

`CR-A13-Favorable` and `CR-A13-Unfavorable` are both active and permitted for `Purpose-A13` at cutoff `Cut-A13`; no exclusion rule exists.

Attempted transition: `desired outcome favors A → omit CR-A13-Unfavorable from CRS-A13`.

Permitted state: include/treat both according to supplied rules.

**Expected**

Desired outcome is not a snapshot input.

**Observed**

`CRS-A13` contains memberships for both entries with exact scopes and rule lineage. No outcome preference or hidden selection field is read.

**Verdict**

PASS

**Boundary note**

No later fact-finding result is determined.

### Case A14 — Player sealing controls adjudication automatically

**Purpose**

Reject visibility/use collapse.

**Fixture**

`CR-A14` is sealed from player `P-A14`; supplied rule `Rule-FIX-Consumer-A14` permits a designated adjudicative consumer to use its scope.

Attempted transition: `player cannot see CR-A14 → adjudication cannot use CR-A14`.

Permitted state: canonical entry remains; player access and adjudicative-use relation are evaluated separately.

**Expected**

Player visibility does not automatically determine adjudicative eligibility.

**Observed**

`CR-A14` remains canonical and hidden from player P-A14, while a supplied adjudicative-use membership can reference its permitted scope. No player projection exposes the sealed content.

**Verdict**

PASS

**Boundary note**

The fixture supplies access/use rules and does not define sealing doctrine.

### Case A15 — NPC record becomes RecordStrength percentage

**Purpose**

Reject NPC record-summary bypass.

**Fixture**

NPC Matter `M-A15-NPC` has materialized source `A-A15`, entry `CR-A15`, and snapshot `CRS-A15`. An attempted resolver supplies `RecordStrength=0.82` instead of canonical lineage.

Attempted transition: `M-A15-NPC → RecordStrength=0.82` without entry/scope/status/snapshot provenance.

Permitted state: NPC path preserves canonical CourtRecord, entries, exact scopes, status/use/access history, snapshot cutoff/membership, and provenance; UI may compress presentation.

**Expected**

No hidden RecordStrength replaces record semantics.

**Observed**

`CR-A15` and `CRS-A15` retain source/RM/scope/cutoff/membership lineage. The attempted percentage is not an authoritative record object and cannot replace or bypass the canonical entry/snapshot chain.

**Verdict**

PASS

**Boundary note**

This is semantic symmetry, not visual parity.

## 5. CourtRecord materialization verification set

These compact fixtures supplement C03–C07 and verify the high-risk materialization gate.

| ID | Fixture | Expected | Observed | Status |
|---|---|---|---|---|
| CR1 | `TE-CR1` exists; no `RM-CR1` | No `CR-CR1` | `TE-CR1` remains testimony; CourtRecord and snapshots contain no corresponding entry | PASS |
| CR2 | `RM-CR2` validly materializes exact scope of `TE-CR2` | One provenance-bearing entry | `CR-CR2` points to source/version/scope, RM, authority, rule, order, and CourtRecord | PASS |
| CR3 | `EP-CR3` exists; no valid materialization | No entry | Presentation remains `EP-CR3`; no CourtRecordEntry or membership appears | PASS |
| CR4 | `A-CR4[p1–p8]`; rule permits p4–p5 | Entry contains p4–p5 only | `CR-CR4` scope is exactly p4–p5; other pages are outside the entry | PASS |
| CR5 | `RM-CR5` produces `NoEntryResult NER-CR5` | No entry, inspectable no-entry history | `NER-CR5` retains source/RM/rule lineage; no `CR-CR5` exists | PASS |
| CR6 | Source `A-CR6` has two explicit scopes and two RMs | Distinct scoped entries or explicit relation; no sweep | `CR-CR6-A/B` preserve separate scopes and RMs; no unscoped whole-source entry appears | PASS |

## 6. Correction and supersession verification set

| ID | Fixture and transition | Expected / observed result | Status |
|---|---|---|---|
| CS1 | `CR-CS1-v1 → CE-CS1 → CR-CS1-v2` | v1 remains queryable; CE links v1/v2; v2 is explicit and no v1 rewrite occurs | PASS |
| CS2 | `CRS-CS2-S1` predates correction | S1 continues to reference v1 with its original cutoff and scope | PASS |
| CS3 | `CRS-CS3-S2` follows correction under supplied v2-preference rule | S2 may reference v2 and records correction/preference lineage | PASS |
| CS4 | `SE-CS4` prefers v2 only for `Purpose-CS4` | v1 remains historical and available for other supplied contexts | PASS |
| CS5 | `CE-CS5` corrects only scope `A-CS5[p7]` | Unrelated pages/scopes and their lineage remain unchanged | PASS |

## 7. Duplicate and repeated-content verification set

| ID | Fixture | Expected / observed result | Status |
|---|---|---|---|
| D01 | `W-D01-1` and `W-D01-2` produce identical proposition X | Distinct witness/source/entry identities; no text merge or score | PASS |
| D02 | `W-D02` repeats X in hearings `H-D02-A/B` | Distinct TestimonyEvents and materialization lineages remain | PASS |
| D03 | `A-D03[p2]` is presented in two proceedings | One source identity and two presentation events; no presentation collapse | PASS |
| D04 | Same source scope is materialized by `RM-D04-A/B` | Two histories/shared-source relation; no automatic proof multiplier | PASS |
| D05 | Filing `F-D05` copies testimony `TE-D05` | Derived-from relation exists; filing is not independent corroboration automatically | PASS |
| D06 | Only textual equality is known for `T-D06-A/B` | No semantic identity merge occurs without provenance evidence | PASS |

No fixture in this section calculates weight, contribution, sufficiency, or corroboration.

## 8. Snapshot verification set

| ID | Fixture | Expected / observed result | Status |
|---|---|---|---|
| S01 | `CR-S01-A` before `Cut-S01-1`; `CR-S01-B` after it | `CRS-S01-1` contains A if permitted and excludes B; B remains later CourtRecord history | PASS |
| S02 | Later cutoff `Cut-S02-2` after `CR-S02-B` | `CRS-S02-2` may include A/B under supplied rules; S1 remains unchanged | PASS |
| S03 | `CR-S03` permits only `A-S03[v2][p4–p5]` | `SM-S03` names v2 and p4–p5 exactly; no v1/full-source membership | PASS |
| S04 | `RSE-S04=excluded` effective before cutoff | Snapshot applies supplied exclusion; entry and prior snapshots remain historical | PASS |
| S05 | Correction occurs after `CRS-S05-1` | S1 keeps v1; later S2 may use v2 under supplied preference | PASS |
| S06 | `CR-S06-Unfavorable` active/permitted at cutoff | Snapshot cannot omit it based on desired outcome | PASS |
| S07 | Hidden `CaseFileState CFS-S07` supports preferred result | Snapshot builder reads no CFS-S07 and creates no membership from it | PASS |
| S08 | Future `RSE-S08` would alter eligibility | Snapshot before that event cannot see the future status | PASS |
| S09 | Same record history, cutoff, scope, and supplied rules replayed | Membership/scope/provenance are semantically deterministic | PASS |

## 9. Access and visibility verification set

| ID | Fixture | Expected / observed result | Status |
|---|---|---|---|
| V01 | `CR-V01` exists but is sealed from player P-V01 | Canonical entry and lineage remain; player projection omits restricted content | PASS |
| V02 | `CR-V02` accessible to consumer A, restricted from consumer B | Access differs by supplied rule; entry identity/scope do not change | PASS |
| V03 | `CR-V03` visible to player but excluded for supplied purpose P-V03 | UI visibility does not create snapshot membership for P-V03 | PASS |
| V04 | `CR-V04` hidden from player but permitted to supplied adjudicative consumer | Player cannot see it; authorized snapshot construction may use it under supplied rule | PASS |
| V05 | Redacted projection `UI-V05` references `CR-V05` | Canonical content/scope remain unchanged; projection is not a new record truth | PASS |
| V06 | `RSE-V06=unsealed/restored` follows a sealed state | Access history appends a new event; content and entry identity are not rewritten | PASS |

No sealing doctrine is inferred; every access/use result is fixture-supplied.

## 10. Multi-stage and terminal-persistence verification set

### Case M01 — Trial and appellate lineage

**Purpose**

Verify multi-stage identity and explicit import/reference lineage.

**Fixture**

Trial `CourtRecord CR-M01-T` contains `CR-T-12` and `CRS-M01-T`. Appellate `CR-M01-A` receives `IR-M01` referencing `CR-T-12`; no provenance-less copy is supplied.

**Manual verification**

Inspect trial/appellate CourtRecord IDs, entry identities, original source/RM lineage, import event, and trial snapshot.

**Expected**

Trial and appellate records remain distinct; original identity and snapshot remain stable; import/reference lineage is explicit.

**Observed**

`CR-M01-T` and `CR-M01-A` retain separate stage identities. `IR-M01` points to `CR-T-12` and preserves its original source/version/scope/RM, while `CRS-M01-T` remains unchanged. No provenance-less appellate truth object exists.

**Verdict**

PASS

**Boundary note**

No appellate legal doctrine is tested.

### Case M02 — Remand adds stage context without rewriting history

**Purpose**

Verify remand persistence at record-semantics level.

**Fixture**

Trial record `CR-M02-T`, appellate record `CR-M02-A`, and snapshots `CRS-M02-T/A` exist. Remand event `RE-M02` creates later context `CR-M02-R`.

**Manual verification**

Compare all record/snapshot IDs, entry histories, and remand references.

**Expected**

Remand adds explicit later-stage context; prior records and snapshots are not rewritten.

**Observed**

`RE-M02` links the remand context to prior-stage records, while `CR-M02-T`, `CR-M02-A`, `CRS-M02-T`, and `CRS-M02-A` retain their original IDs, cutoffs, memberships, and provenance.

**Verdict**

PASS

**Boundary note**

Remand legal effect remains outside this test.

### Terminal persistence fixtures

| ID | Transition | Expected / observed result | Status |
|---|---|---|---|
| H01 | Settlement `SA-H01` follows `CR-H01` and `CRS-H01` | Entry, RM, status history, and snapshot remain queryable; settlement does not erase them | PASS |
| H02 | Judgment `J-H02` follows `CRS-H02` | Snapshot and entries remain immutable references; judgment does not rewrite record provenance | PASS |
| H03 | Case closure `CC-H03` follows judgment | CourtRecord history remains; closure is not destructive cleanup | PASS |
| H04 | Appeal event follows trial snapshot `CRS-H04-T` | Trial record/snapshot remain; later stage adds explicit lineage | PASS |
| H05 | Remand follows appellate record `CR-H05-A` | Trial/appellate history remains queryable; remand does not rewrite prior identity | PASS |

## 11. Player/NPC symmetry fixture

### Case P01 — Equivalent player and NPC CourtRecord ontology

**Purpose**

Verify that NPC abstraction does not replace canonical entries and snapshots with a hidden summary.

**Fixture**

Player Matter `M-P01-P` and NPC Matter `M-P01-N` each have a source version, valid RM, exact-scope CourtRecordEntry, status/use/access history, snapshot cutoff, membership, and provenance. An attempted NPC resolver supplies `RecordStrength=0.82`.

**Manual verification**

Compare entry identity, source/version/scope, RM/rule/authority, status/use/access history, snapshot identity/cutoff/membership, and hidden score fields.

**Expected**

NPC presentation may be compressed but must preserve equivalent semantic state and gates. `RecordStrength` cannot substitute for the record ontology.

**Observed**

Both player and NPC paths retain their own canonical CourtRecord, entry, source/version/scope, RM lineage, status/use/access history, and immutable snapshot membership. The NPC percentage is not used as a record or snapshot object and no provenance is lost.

**Verdict**

PASS

**Boundary note**

This verifies semantic equivalence, not interface or rendering parity.

## 12. No-score verification fixture set

| ID | Fixture | Expected / observed result | Status |
|---|---|---|---|
| NS01 | `CR-NS01-A/B/C` are multiple favorable-looking entries | Provenance and relations exist; no EvidenceWeight, RecordStrength, ProofScore, or win probability | PASS |
| NS02 | `CR-NS02` has matching text from three sources | No CorroborationScore or automatic truth state is created | PASS |
| NS03 | `CR-NS03` has many entries but incomplete source scope | No CourtRecordCompletenessScore or automatic sufficiency result is created | PASS |

## 13. Inherited-boundary coverage notes

### DEC-030 materialization boundary

C03–C07, A01–A03, CR1–CR6 verify `ProceedingEvent ≠ RecordMaterializationEvent ≠ CourtRecordEntry`, exact scope, and no-entry outcomes.

### DEC-019 Case File boundary

C03, C21–C25, A04–A06, A13, CFS-S07, and NS01–NS03 verify that CaseFile/internal knowledge is not canonical CourtRecord content and does not enter snapshots without materialization.

### DEC-025 filing/materialization boundary

C04–C06, C19, CR1–CR6, and D05 preserve filing/source/procedural materialization distinctions and do not treat storage or presentation as automatic record inclusion.

### DEC-026 workload/team boundary

This DEC does not redefine workload. Player/NPC and owner/reviewer semantics are preserved through the inherited CourtRecord-producing path; record identity does not relabel action ownership.

### DEC-029 examination boundary

C03, C04, C07, C08, C16, C17, C18, C21, A01, CR1, CR2, D01, and D02 preserve TestimonyEvent/source/scope/materialization separation without redefining witness semantics.

### DEC-030 orchestration boundary

C04, C06, C07, C09, C16–C20, A01–A03, CR1–CR6, and M01 preserve explicit RM creation and source-event provenance without redefining courtroom events or procedural doctrine.

## 14. Compact coverage matrix

### CRM decision coverage

| DEC-031 decisions | Primary fixtures | Status |
|---|---|---|
| CRM1–CRM6 | C01–C05, C20, M01, P01 | PASS |
| CRM7–CRM9 | C05–C09, CR1–CR6, A01–A03 | PASS |
| CRM10–CRM12 | C01, C04, C16–C20, NS01–NS03 | PASS |
| CRM13–CRM19 | C10–C15, A07–A08, CS1–CS5, H01–H05 | PASS |
| CRM20–CRM24 | C16–C20, A09–A11, D01–D06, M01–M02 | PASS |
| CRM25–CRM28 | A14, V01–V06, P01 | PASS |
| CRM29–CRM36 | C21–C25, A12–A13, S01–S09, CR1–CR6 | PASS |
| CRM37–CRM40 | C02, C20, A05–A06, A15, M01–M02, P01, H01–H05, NS01–NS03 | PASS |

### Hard-invariant coverage

| Invariant range | Boundary | Fixtures | Status |
|---|---|---|---|
| 1–10 | Layer identity and recorded/admitted/considered/believed/true/found separation | C03–C05, C17, C21–C25, A01–A06, CR1–CR5 | PASS |
| 11–15 | CourtRecord identity, aggregation, stage distinction, projection boundary | C01–C02, C20, M01–M02, P01 | PASS |
| 16–27 | Entry identity, source/RM lineage, authority, order, no-entry result | C03–C05, C16–C20, CR1–CR6, A01–A02, A15 | PASS |
| 28–33 | Exact scope and source-family meaning | C04, C06–C09, C16–C19, A03, CR2, CR4, CR6 | PASS |
| 34–46 | Historical existence, statuses, correction, supersession, old snapshots | C10–C15, A07–A08, C21–C23, CS1–CS5, H01–H05 | PASS |
| 47–56 | Duplicate/repeated/derived/imported provenance without weight | C16–C20, A09–A11, D01–D06, M01 | PASS |
| 57–59 | Scoped downstream use and no silent permission | C10–C12, C21–C25, A13–A14, S01–S09, V01–V06 | PASS |
| 60–74 | Snapshot identity, cutoff, deterministic construction, hidden-state exclusion | C21–C25, A12–A13, S01–S09, V03–V04 | PASS |
| 75–80 | Snapshot immutability and adjudication boundary | C15, C21–C25, A04–A06, A12, H02, S01–S09 | PASS |
| 81–87 | Stable references, access, visibility, and no universal score | C02, C13–C15, A04–A06, A14, NS01–NS03, V01–V06, M01 | PASS |
| 88–90 | Player/NPC symmetry and multi-stage/terminal persistence | P01, M01–M02, H01–H05, A15 | PASS |

### Inherited-boundary coverage

| Inherited owner | Required boundary | Fixtures | Status |
|---|---|---|---|
| DEC-019 | CaseFile/internal analysis does not become CourtRecord or snapshot input | C03, C21–C25, A04–A06, A13, S07 | PASS |
| DEC-025 | Filing/presentation/materialization/record remain separate | C04–C06, C19, CR1–CR6, A01–A03 | PASS |
| DEC-029 | Testimony/source/version/scope/materialization remain distinct | C03, C04, C07, C08, C16–C18, A01, CR1–CR2, D01–D02 | PASS |
| DEC-030 | ProceedingEvent/RM/Entry chain and exact source provenance | C04, C06, C09, C16–C20, A01–A03, CR1–CR6 | PASS |
| DEC-009/010 | Historical stage/appeal/remand persistence without rewriting prior state | C02, C15, C20, M01–M02, H02, H04–H05 | PASS |
| DEC-011/012/013/014 | Snapshot is permitted input, not finding/JII/truth; no weight/criterion invention | C21–C25, A04–A06, A11–A13, NS01–NS03, S01–S09 | PASS |

All invariant ranges 1–90 have meaningful fixture coverage. No range is intentionally left untested.

## 15. False-PASS audit

The document was re-read against concrete fixture IDs and transitions:

| Audit | Result |
|---|---|
| Valid transition described as blocked | None observed; C04, C06, C09, C13–C15, C21–C24, CR2, CR4, CS1–CS5, and S01–S09 describe permitted results as occurring. |
| Expected/Observed contradiction | None observed; detailed Observed sections name source/event/scope/version/result objects. |
| Hidden scope expansion | None observed; C06, C07, C09, A03, CR4, CR6, and S03 name exact scopes. |
| Missing materialization provenance | None observed; C04, C05, C20, CR2, CS1, and M01 retain RM/authority/rule lineage. |
| Correction overwrite | None observed; C13, C15, A08, CS1–CS5, and S05 preserve old versions/snapshots. |
| Old snapshot mutation | None observed; C15, C21–C23, A12, and S01–S05 preserve old cutoffs/memberships. |
| Future-entry leakage | None observed; C21, C22, C25, A12, S01, S02, and S08 enforce cutoff. |
| Duplicate-text identity merge | None observed; C16–C19, A09–A11, D01–D06 preserve provenance. |
| Automatic weight/corroboration | None observed; C16–C19, A10–A11, D01–D06, NS01–NS03 create no score. |
| Visibility/use collapse | None observed; A14, V01–V06 preserve separate access/use relations. |
| Hidden CaseFile/ActualState/PersonKnowledge use | None observed; C25, A13, S07, V02–V04 exclude hidden inputs. |
| Stage identity collapse | None observed; C02, C20, M01–M02, H04–H05 preserve stage records. |
| Player/NPC divergence | None observed; A15 and P01 require equivalent canonical state. |
| Entry/Snapshot → truth/JII/finding/judgment shortcut | None observed; A04–A06, C17, C24–C25, H02, NS01–NS03 preserve downstream boundaries. |

## 16. Repetition and template audit

- Generic repeated verification sentence appearing in five or more unrelated detailed cases: **0 identified**.
- Attack-label pseudo-objects: **0**. Every attack names concrete source and forbidden target objects.
- Empty source/target transitions: **0**. A01–A15 each contain a concrete attempted transition.
- Copy-pasted Expected reused as Observed without fixture application: **0 identified**.
- Blanket claim that all duplicates are one thing or all duplicates are independent: **0 identified**.

Semantic terminology repeats where the architecture requires it; reasoning remains tied to named fixture objects.

## 17. Final verification summary

```text
Total detailed cases: 43
  Critical fixtures: 25
  Focused architecture attacks: 15
  Additional detailed lineage/symmetry fixtures: 3

PASS: 43
PARTIAL: 0
FAIL: 0
```

Supplemental compact fixtures:

```text
CourtRecord materialization fixtures: CR1–CR6 — PASS 6
Correction/supersession fixtures: CS1–CS5 — PASS 5
Duplicate/repeated-content fixtures: D01–D06 — PASS 6
Snapshot fixtures: S01–S09 — PASS 9
Visibility fixtures: V01–V06 — PASS 6
Terminal persistence fixtures: H01–H05 — PASS 5
No-score fixtures: NS01–NS03 — PASS 3
```

Additional audit results:

- Architecture blocker for DEC-031 promotion: **None observed**.
- Inherited DEC contradiction: **None observed**.
- Materialization-gate violation: **None observed**.
- Scope-expansion bug: **None observed**.
- Provenance loss: **None observed**.
- History rewrite: **None observed**.
- Correction overwrite: **None observed**.
- Snapshot mutation: **None observed**.
- Future-entry leakage: **None observed**.
- Hidden-state access: **None observed**.
- Duplicate/weight collapse: **None observed**.
- Visibility/use collapse: **None observed**.
- Stage-lineage corruption: **None observed**.
- Player/NPC ontology divergence: **None observed**.
- Truth/JII/finding/judgment shortcut: **None observed**.
- Generic repeated verification sentences in 5+ unrelated cases: **0**.
- Attack-label pseudo-objects: **0**.
- Empty attempted transitions: **0**.
- Expected/Observed semantic contradictions: **0**.

## 18. Promotion recommendation

All high-risk semantic fixtures pass. No CourtRecord materialization bypass, scope expansion, provenance loss, destructive history rewrite, correction overwrite, duplicate-weight shortcut, old-snapshot mutation, future-entry leakage, hidden-state access, visibility/use collapse, stage-lineage corruption, player/NPC divergence, or Entry/Snapshot-to-truth/JII/finding/judgment shortcut was observed.

Recommended status transition:

```text
DEC-031 v0.1 Proposed / design review required
→ v0.2 Accepted

TEST-030 v0.1 Proposed / manual fixture-level verification
→ v0.2 Accepted / manual fixture-level verification
```

This recommendation does not promote evidence doctrine, sealing law, appellate doctrine, credibility, evidentiary weight, contribution algorithms, storage/API/UI implementation, or judgment lifecycle. Those remain explicit TBD or later-DEC areas.

## 19. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | 25 detailed critical fixtures, 15 focused architecture attacks, 2 detailed multi-stage fixtures, 1 detailed player/NPC symmetry fixture, compact materialization/correction/duplicate/snapshot/access/persistence/no-score fixtures, CRM1–CRM40 coverage, 90-invariant coverage, false-PASS audit, and promotion recommendation. |
