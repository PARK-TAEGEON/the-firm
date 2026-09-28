# THE FIRM — Canonical Court Record Model

Document ID: DEC-LITIGATION-031  
Version: v0.1 — Proposed / design review required  
Status: **Proposed / design review required**  
Project: THE FIRM  
Document type: Design Decision

Primary basis: `DEC-LITIGATION-030_HEARING_ORAL_ADVOCACY_AND_TRIAL_PRESENTATION.md`, `TEST-029_HEARING_ORAL_ADVOCACY_AND_TRIAL_PRESENTATION.md`.  
Inherited basis: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `02_ARCHITECTURE_RULES.md`, `SYS-001_LITIGATION.md`, and the accepted litigation DEC/TEST chain through DEC-030 / TEST-029.

This document extends the accepted architecture by defining CourtRecord semantics after a valid materialization event. It does not replace or reinterpret courtroom procedure, evidence doctrine, witness examination, legal truth, credibility, or adjudication.

## 1. Purpose

DEC-031 defines how THE FIRM represents authoritative procedural record content so that every record entry has stable identity, exact scope, provenance, historical status, and permitted downstream use without becoming objective truth or bypassing adjudication.

It defines semantic requirements for:

- CourtRecord identity and Matter/stage context;
- CourtRecordEntry identity and source provenance;
- exact materialized content scope;
- source-oriented entry families;
- materialization lineage;
- inclusion, limitation, exclusion, withdrawal, correction, and supersession history;
- duplicate, repeated, derived, copied, and imported material relations;
- sealing, restriction, disclosure, and redacted-projection hooks;
- CourtRecordSnapshot identity, cutoff, construction, membership, and immutability;
- downstream-use boundaries and fact-evaluation access;
- historical stability across hearing, settlement, judgment, closure, appeal, and remand;
- player/NPC semantic symmetry.

DEC-031 is primarily a record-semantics DEC. It answers what canonically exists after a valid materialization event and how later systems may reference that state. It does not decide whether doctrine should authorize a materialization or what weight adjudication should give any entry.

## 2. Foundational boundary

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

The following meanings also remain separate:

```text
recorded
≠ admitted
≠ considered
≠ believed
≠ true
≠ found
```

A CourtRecordEntry means only that an explicitly authorized procedural path placed a defined content scope into a defined CourtRecord under a defined authority/rule/event.

It does not mean that:

- its proposition is objectively true;
- a judge believes or adopted it;
- its source is credible;
- it satisfies a recognition or sufficiency criterion;
- it wins an Issue;
- it becomes JudgeInterpretationInput;
- it becomes CourtFactFinding;
- it is permitted for every stage, purpose, participant, or snapshot.

## 3. Inherited materialization boundary

DEC-030 remains authoritative for courtroom orchestration and creation of `RecordMaterializationEvent`:

```text
ProceedingEvent
≠ RecordMaterializationEvent
≠ CourtRecordEntry
```

DEC-031 begins at the record-side response to a valid materialization event:

```text
source event/object
→ valid RecordMaterializationEvent
→ CourtRecordEntry or explicit no-entry result
→ later CourtRecordSnapshot
→ later, separate adjudication
```

DEC-031 does not redefine `OralAdvocacyEvent`, `EvidencePresentationEvent`, `TestimonyEvent`, `JudicialQuestionEvent`, `ObjectionEvent`, `ProceduralRuling`, participant actions, hearing lifecycle, or witness examination semantics. It references those source objects by stable identity and exact version/scope.

No source object or event bypasses `RecordMaterializationEvent` merely because it occurred in court, was visible, was persuasive, was filed, was marked, was admitted under a supplied rule, or appears important.

## 4. Canonical semantic objects

The recommended record model uses the following semantic objects or equivalent structures:

```text
CourtRecord
├─ CourtRecordEntry
│  ├─ ContentScopeRef
│  ├─ MaterializationLineage
│  ├─ RecordStatusEvent history
│  ├─ RecordUseConstraint history
│  ├─ RecordAccessRuleRef history
│  └─ correction/supersession/derivation relations
└─ CourtRecordSnapshot
   └─ SnapshotMembership
      ├─ entry/version/scope
      ├─ use context
      └─ inclusion/exclusion reason lineage
```

These names describe semantic responsibilities. They do not require separate database tables, classes, resources, or files.

### 4.1 CourtRecord

A `CourtRecord` is the stable semantic aggregate of procedurally materialized record content and its history for a defined Matter/stage/aggregation scope.

Minimum semantic identity includes or references:

- stable CourtRecord identity;
- Matter identity;
- procedural stage/court-level identity;
- proceeding or aggregation scope;
- supplied jurisdiction/content-rule context where available;
- current lineage/version projection reference;
- entry collection/reference;
- materialization and status-transition history;
- visibility/disclosure context;
- provenance metadata.

A CourtRecord need not be one physical document. It may aggregate entries originating from multiple hearings, filings, rulings, testimony events, admitted materials, or other supplied sources while preserving each entry's provenance.

```text
CourtRecord
≠ transcript
≠ CaseFile
≠ evidence folder
≠ judgment
≠ CourtFactFinding collection
```

The exact storage schema and physical packaging remain TBD.

### 4.2 CourtRecordEntry

A `CourtRecordEntry` is a stable record identity for one explicitly materialized source scope. It is not just copied text.

Each entry semantically retains:

- stable entry identity;
- containing CourtRecord identity;
- source object/event identity;
- source object version or consumed snapshot where relevant;
- originating Matter, stage, and proceeding;
- originating actor where relevant;
- `RecordMaterializationEvent` identity;
- materialization authority;
- supplied rule reference;
- exact `ContentScopeRef` materialized;
- proceeding/event/materialization order;
- effective time or cutoff context;
- entry family/source category;
- historical status-event lineage;
- current-use projection derived from that history;
- access/visibility metadata and rule references;
- correction, supersession, withdrawal, derivation, copy, and import relations where applicable.

These are semantic requirements, not mandatory database fields.

### 4.3 ContentScopeRef

`ContentScopeRef` or an equivalent scope descriptor identifies the exact immutable source content selected by a materialization event. It must be sufficient to distinguish the materialized subset from the larger source.

Possible scope forms include:

- an entire TestimonyEvent payload;
- one identified answer or answer portion;
- specified pages of an artifact;
- a section, paragraph, range, field, or media interval;
- an identified proposition or submission portion;
- a defined part of a ProceduralRuling;
- another explicitly supplied immutable subset.

The exact scope vocabulary and locator mechanism are TBD. A locator must resolve against a stable source version and may not silently follow later source edits.

### 4.4 MaterializationLineage

`MaterializationLineage` is the required trace:

```text
source identity
→ source version/snapshot
→ selected source scope
→ RecordMaterializationEvent
→ authority and supplied rule
→ CourtRecordEntry
```

An entry without this lineage is invalid as canonical CourtRecord content.

### 4.5 RecordStatusEvent

A `RecordStatusEvent` or equivalent append-only event records a later status/effect applied to an entry or defined entry scope. It identifies:

- target entry/version/scope;
- event identity and order/effective time;
- acting authority;
- supplied rule/reason reference;
- semantic effect and its purpose/stage scope;
- parent or superseded status relation;
- visibility of the status event itself.

Possible generic effects include `active`, `limited`, `excluded_from_supplied_use`, `withdrawn`, `superseded`, `corrected`, `sealed`, `restricted`, `unsealed`, `restored`, `disputed`, or `historical_only` when a supplied rule gives those terms meaning.

These are interoperability hooks, not jurisdiction-specific doctrine or a mandatory enum.

### 4.6 RecordUseConstraint

A `RecordUseConstraint` or equivalent scoped relation describes whether an entry/version/scope may be used for a supplied downstream context. It may reference:

- stage or proceeding context;
- Issue/proposition/purpose scope;
- consumer type;
- effective event/cutoff interval;
- supplied rule/authority;
- permitted, limited, excluded, or unresolved treatment.

Use constraints do not mutate truth, credibility, weight, or historical existence.

### 4.7 RecordAccessRuleRef

An access-rule reference describes who may inspect which entry content or projection under supplied visibility rules. It is separate from downstream adjudicative use.

```text
entry exists
≠ participant may see it
≠ player may see it
≠ adjudication may consume it
```

### 4.8 CourtRecordSnapshot

A `CourtRecordSnapshot` is an immutable, authorized record view derived from one CourtRecord at a defined stage, cutoff, and supplied use context. It is not a mutable alias for “all entries currently stored.”

Minimum semantics include:

- stable snapshot identity;
- source CourtRecord identity;
- stage/court-level identity;
- cutoff event/order/time;
- supplied permitted-use/rule context;
- construction authority/event;
- included entry identities and versions;
- exact included content scopes;
- treatment of limited, excluded, corrected, superseded, withdrawn, sealed, or restricted entries;
- source/materialization/status provenance references;
- immutable construction result and replay reference.

### 4.9 SnapshotMembership

`SnapshotMembership` or equivalent metadata records that a particular entry version and exact scope is included in a particular snapshot for a supplied context. It retains the applicable rule/status references and inclusion rationale.

A membership relation does not duplicate the entry or promote it to evidence weight, truth, JII, or finding.

## 5. CourtRecord identity and aggregation

CourtRecord identity is stable across changes to its contents. New entries and status events extend record history; they do not create a new record identity unless a supplied stage/aggregation rule explicitly creates a distinct CourtRecord.

At minimum, separate CourtRecords may exist for distinct procedural stages or court levels. The architecture must not assume that all stages share one mutable record container.

```text
TrialCourtRecord
≠ AppellateCourtRecord
≠ RemandCourtRecord
```

Explicit lineage, reference, or import relations may connect them. The exact court-level and aggregation policy remains supplied/TBD.

CourtRecord aggregation must preserve entry-level identities. A generated transcript view, exhibit list, docket-like view, or UI folder is a projection and does not become the canonical owner of record semantics.

## 6. Exact content scope

The scope chain is:

```text
source object
≠ selected source scope
≠ materialized scope
≠ CourtRecordEntry
```

A source object may contain more content than a supplied rule permits into CourtRecord.

Example:

```text
Artifact A pages 1–20
→ RecordMaterializationEvent RM-A permits A[p4–p5]
→ CourtRecordEntry CR-A scope = A[p4–p5]
```

The entry must not silently include pages 1–3 or 6–20. It must not expand from an answer portion to the entire TestimonyEvent, from one ruling scope to the entire ruling, or from one filing section to the whole filing.

A later rule may materialize another scope through a new event and entry or an explicitly related extension event. Convenience, textual adjacency, common source identity, or UI selection is insufficient authority for scope expansion.

## 7. Entry families and source categories

Entry families organize provenance and source semantics. They do not establish legal status or value.

Recommended open families are:

- testimony-derived entry;
- exhibit/material-derived entry;
- filing/submission-derived entry;
- procedural-ruling-derived entry;
- oral-statement/advocacy-derived entry where a supplied rule permits;
- court-generated procedural entry;
- imported/referenced prior-stage entry;
- future supplied typed source.

Family assignment identifies what kind of source produced the entry and which inherited system owns the source semantics.

```text
entry family
≠ admissibility
≠ truth
≠ credibility
≠ weight
≠ legal superiority
≠ finding status
```

Canonical family names and subtype catalogs remain TBD.

## 8. Materialization and no-entry results

A valid `RecordMaterializationEvent` may produce:

- one scoped CourtRecordEntry;
- multiple explicitly scoped entries if the supplied rule/event separately identifies them;
- an explicit no-entry result with reason/rule provenance;
- a later status event affecting an existing entry, when the event is defined as such by the supplying procedure.

One materialization event does not implicitly sweep all related source content into the record. Multiple entries from one source must each have explicit scope and lineage.

An invalid, denied, withdrawn-before-effect, or otherwise non-materializing event may remain historical without creating a CourtRecordEntry. DEC-031 records the record-side result; DEC-030 or another procedural owner determines whether the event is valid.

## 9. Multidimensional status and use model

CourtRecord semantics use separate dimensions rather than one destructive current-status flag:

| Dimension | Question answered | Must not imply |
|---|---|---|
| Historical existence | Was the entry validly materialized at that point? | Current use, truth, visibility |
| Procedural-use status | What supplied downstream uses are currently permitted? | Weight, credibility, finding |
| Version preference | Which related version/scope should a supplied future consumer use? | Erasure of prior version |
| Access/visibility | Which participant or UI projection may inspect content? | Adjudicative eligibility |
| Dispute/annotation | Is status/content disputed or annotated? | Falsity or truth |

The “current” projection is derived from append-only events at a specified cutoff. It is never the sole canonical history.

`active`, `limited`, `excluded`, `withdrawn`, `corrected`, `superseded`, `sealed`, `restricted`, `disputed`, or `historical-only` states remain semantic effects only to the extent supplied. No state is a truth or weight label.

## 10. Append-only historical preservation

CourtRecord history is append-only at semantic level.

Later events may:

- limit or exclude a scope from a supplied use;
- withdraw an entry for a supplied future context;
- correct or supersede an entry;
- seal, restrict, unseal, or restore access;
- change preferred versions for later snapshots;
- add an imported or derived relation;
- change future snapshot eligibility.

They must not rewrite the fact that an earlier materialization or status event occurred.

```text
original entry
→ later status/correction/access event
→ later snapshot behavior
```

Not:

```text
original entry deleted
→ latest state replaces history
```

Later exclusion does not erase original materialization. Withdrawal leaves the historical entry addressable. Judgment, settlement, closure, appeal, and remand preserve prior record identity and provenance.

## 11. Correction and supersession

Correction uses explicit lineage:

```text
CourtRecordEntry CR-v1
→ CorrectionEvent or SupersessionEvent
→ CourtRecordEntry CR-v2 or corrected derivative
→ explicit relation to CR-v1
```

The correcting event records target scope, authority, supplied reason/rule, effective point, and replacement relation. The corrected entry retains source lineage to both the underlying source/correction source and the prior entry where applicable.

```text
correction
≠ deletion
≠ fabrication
≠ retroactive replacement of historical identity
```

A supplied rule may make CR-v2 preferred or CR-v1 unavailable for a later purpose. CR-v1 remains historically queryable and remains present in earlier snapshots that included it.

Supersession means that a later entry/version is designated for a supplied future context. It does not assert that the earlier entry was false, inadmissible, fabricated, or erased.

Exact correction and supersession procedure remains supplied/TBD.

## 12. Withdrawal, limitation, and exclusion

A withdrawal, limitation, or exclusion is an append-only status/use event targeting an exact entry/version/scope and supplied downstream context.

It must answer:

- which entry and content scope is affected;
- which event/authority created the effect;
- which supplied rule or reason applies;
- when the effect becomes effective;
- which stage, purpose, or consumer is affected;
- whether any scope remains permitted;
- how later snapshots should evaluate the event under supplied rules.

The effect does not delete source events, materialization events, entries, prior statuses, or earlier snapshots. It does not create truth, falsity, credibility, or a finding.

## 13. Duplicate and repeated content

CourtRecord identity follows provenance and occurrence, not text equality.

```text
same proposition
≠ same source
≠ same source scope
≠ same event
≠ same materialization
≠ same CourtRecordEntry
```

The record may preserve explicit relations such as:

- same immutable source/scope re-materialized;
- repeated presentation or testimony event;
- textual match with different provenance;
- derived copy of an identified source;
- filing text derived from testimony or another filing;
- imported or referenced prior-stage entry;
- independently sourced content where provenance establishes independence;
- independence unknown.

The exact relation vocabulary and identity algorithm remain TBD. The minimum rule is that semantically distinct events and sources are not merged because their text matches, while repeated copies are not automatically treated as independent proof.

Examples:

- one witness saying X in two hearings creates distinct TestimonyEvents and may create distinct entries if separately materialized;
- two witnesses saying X remain distinct sources and entries;
- the same document presented twice remains one source with two presentation events and whatever explicit materializations occurred;
- the same source page materialized twice remains two materialization histories or a supplied reference relation, not automatic double weight;
- appeal-stage reference to a trial entry preserves the trial identity and import/reference lineage;
- filing text repeating testimony remains filing-derived content with a derived-from relation, not an independent truth source by default.

DEC-031 defines no duplicate-weight, corroboration, contribution, independence, or sufficiency algorithm.

## 14. Entry existence and downstream-use scope

```text
CourtRecordEntry exists
≠ currently permitted use
≠ snapshot membership
≠ adjudicative contribution
≠ CourtFactFinding
```

A valid entry may be permitted for one Issue, proposition, purpose, stage, consumer, or time interval while limited or unavailable for another. It may be historical-only, sealed/restricted, superseded for a supplied context, or excluded by a later supplied rule.

Downstream-use scope is represented by explicit constraints and status events with rule/authority provenance. The architecture does not invent the legal reasons for those constraints.

If a required use rule is absent or unresolved, the snapshot builder must not invent permission. It returns an explicit unresolved/no-snapshot/no-membership result appropriate to the supplied interface rather than silently including or excluding based on desired outcome.

## 15. Snapshot identity and construction

### 15.1 Snapshot purpose

A CourtRecordSnapshot fixes the record input available to a later consumer at a defined adjudicative or procedural point.

```text
CourtRecord history
+ cutoff
+ supplied allowed-use context/rules
+ entry versions, statuses, scopes, and access/use constraints
→ immutable CourtRecordSnapshot
```

### 15.2 Snapshot cutoff

The cutoff identifies the latest permitted event/order/time considered during construction. It must be stable and sufficient to exclude later materializations and status changes.

The exact cutoff representation is TBD. It may use an event ID, sequence key, time plus deterministic tie-breaker, immutable record version, or another replayable reference.

No entry or status event effective after the cutoff may affect the snapshot unless a supplied rule explicitly defines a different effective-time semantics and that rule is recorded in construction provenance.

### 15.3 Snapshot inputs

Snapshot construction may read only:

- the identified CourtRecord and its history through cutoff;
- entry identities, versions, scopes, and materialization lineage;
- status/use/access events effective under supplied rules at cutoff;
- the explicit stage, purpose, consumer, and supplied permitted-use context;
- supplied construction authority/rule references.

It must not read:

- ActualStateRecord;
- private or unmaterialized CaseFileState;
- LawyerWorkProduct not materialized into the record;
- hidden PersonKnowledge or credibility;
- hidden judge belief or future JII;
- future entries/status events past cutoff;
- desired outcome, party preference, or hidden win state.

### 15.4 Deterministic membership

Given the same CourtRecord history, cutoff, supplied rules, purpose/stage scope, and authorized construction inputs, snapshot membership and included scopes must be semantically equivalent.

The builder must not:

- choose entries because they support a preferred outcome;
- omit unfavorable entries without a supplied rule;
- prefer “better” evidence using hidden weight;
- include future entries;
- expand an entry beyond its permitted scope;
- use a UI visibility filter as an adjudicative-use rule;
- treat current storage presence as automatic inclusion.

Each included or explicitly excluded/limited treatment must be explainable by record state, cutoff, and supplied rule/scope.

### 15.5 Snapshot membership

Every included membership identifies:

- entry and version;
- exact included scope;
- relevant materialization and status lineage;
- supplied use/purpose context;
- inclusion authority/rule;
- treatment of correction, supersession, limitation, withdrawal, sealing, or restriction where applicable.

An implementation may store only positive membership plus a construction trace, or explicit treatment records for omitted entries. The storage form is TBD; explainability and replay are required.

## 16. Snapshot immutability and later changes

Once created, a snapshot is immutable.

```text
CourtRecordSnapshot CRS-1 at cutoff C1
→ later entry/status event
→ CRS-1 unchanged
→ optional CourtRecordSnapshot CRS-2 at cutoff C2
```

`CRS-1 ≠ CRS-2`. A later snapshot may include a corrected version, exclude a newly limited scope, include later entries, or use a different supplied purpose. It must record the changed cutoff/context and must not rewrite CRS-1.

Snapshot immutability is required for judgment history, appeal, remand, explanation, replay, and auditability.

## 17. Snapshot and adjudication boundary

A CourtRecordSnapshot is authorized input to later adjudication. It is not adjudication.

```text
CourtRecordSnapshot
→ may be consumed by recognition / criterion / finding systems
```

But:

```text
CourtRecordSnapshot
≠ CourtFactFinding
≠ JudgeInterpretationInput
≠ Judgment
≠ objective truth
```

DEC-031 does not redefine recognition criteria, evidence sufficiency, JudgeInterpretationInput, CourtFactFinding, final adjudication, or judgment lifecycle. Those systems retain ownership of whether and how allowed snapshot content contributes to a result.

A snapshot containing entry CR-X does not mean CR-X was considered, believed, credited, given weight, or adopted. Any such later state requires its own authorized semantic object/event.

## 18. Fact-evaluation access boundary

Later fact evaluation may inspect only the content and scope permitted by its supplied CourtRecordSnapshot.

It may not reach around the snapshot to consume:

- CaseFileState;
- hidden ActualStateRecord;
- unmaterialized SourceMaterial;
- withdrawn, excluded, or limited scope absent from that snapshot;
- private LawyerWorkProduct;
- hidden PersonKnowledge or deception state;
- hidden credibility or weight;
- future record entries;
- hidden judge cognition.

If necessary record content is absent, the evaluator handles insufficiency or unresolved input under its own accepted criterion semantics. It must not repair the record by accessing hidden or unmaterialized material.

## 19. Stable references and derived relations

Later systems may reference entries and snapshots by stable identity without mutating them.

Examples:

- a criterion evaluation references `CR-17` and exact allowed scope;
- a finding explanation cites `CR-17` and `CR-21`;
- an appeal references prior snapshot `CRS-4`;
- a ruling limits future use of `CR-31`;
- correction event `CE-44` supersedes `CR-44` with `CR-45`;
- an imported prior-stage relation points from appellate context to trial entry `CR-T-12`.

A reference does not duplicate, promote, edit, admit, exclude, weigh, or adjudicate the entry. Derived relations preserve their own provenance and do not change the referenced object's identity.

## 20. Sealing, restriction, and redacted projections

DEC-031 provides generic hooks for:

- sealed content;
- restricted content;
- participant-specific visibility;
- stage-specific disclosure;
- future unsealing/restoration;
- redacted or summarized projections.

It does not define sealing doctrine or who qualifies for access.

Visibility and adjudicative use are separate dimensions:

```text
entry exists in CourtRecord
≠ player may see full content
≠ every participant may access it
≠ adjudication may consume it
```

A sealed entry is not necessarily invisible to every authorized consumer. A visible entry is not necessarily usable for every downstream purpose. Those outcomes require separate supplied rules.

A redacted UI projection references the canonical entry and its access rule. It does not mutate canonical content, create a new truth object, change materialized scope, or alter snapshot membership by itself.

## 21. Player-visible CourtRecord information

Where authorized, a CourtRecord presentation may show:

- entry identity and source-oriented family;
- source object/event and version;
- exact materialized content scope;
- originating proceeding, actor, and order;
- materialization event, authority, and supplied rule;
- current-use projection and status history;
- correction/supersession/withdrawal lineage;
- visible limitations and access restrictions;
- snapshot membership and cutoff context;
- visible ruling/provenance links.

The player does not automatically see:

- sealed/restricted content outside authorized access;
- hidden source content beyond materialized scope;
- hidden judge interpretation or belief;
- hidden credibility, truth, or weight;
- future finding or judgment;
- future snapshot membership;
- canonical evidentiary importance or best-use score;
- hidden RecordStrength or win probability.

Presentation/UI may filter, sort, redact, summarize, or group authorized content. Those projections do not own or mutate canonical record semantics.

## 22. Player/NPC symmetry

Player and NPC matters use the same CourtRecord ontology:

- stable record and entry identities;
- explicit materialization event lineage;
- exact source/version/scope;
- append-only status/use/access history;
- correction, supersession, and duplicate relations;
- snapshot identity, cutoff, membership, and immutability;
- downstream-use and adjudication boundaries.

NPC presentation may be compressed, but semantic state must remain equivalent and reconstructible. An NPC record cannot be represented only as `RecordStrength=0.82`, “good record,” a hidden proof total, or a probability outcome.

## 23. Multi-stage, appeal, and remand lineage

DEC-031 supports, without defining appellate doctrine:

```text
TrialCourtRecord CR-T
→ immutable TrialCourtRecordSnapshot CRS-T
→ explicit appellate reference/import relation
→ AppellateCourtRecord CR-A and/or snapshot CRS-A
```

Prior-stage and later-stage records remain distinct. An imported or referenced entry retains:

- original entry identity;
- original CourtRecord/stage;
- original source/materialization lineage;
- exact imported/referenced scope;
- import/reference event and supplied authority/rule;
- later-stage status/use context.

An implementation may reference the original entry or create an explicitly derived/imported entry. It may not copy text into a provenance-less new canonical object or rewrite trial identity to make it appellate.

Remand adds a new stage/record context or an explicitly supplied continuation relation. It does not mutate historical trial or appellate snapshots.

## 24. Settlement, judgment, and closure persistence

Settlement, judgment, or Case closure does not erase CourtRecord history.

```text
CourtRecord before settlement
→ SettlementEvent
→ prior record/history remains

CourtRecord before judgment
→ JudgmentEvent
→ prior record/history remains

CourtRecord before closure
→ CaseClosureEvent
→ prior record/history remains
```

Judgment may reference a snapshot and findings under other decisions. It does not retroactively rewrite the entries, materialization events, status histories, or snapshot membership that preceded it.

Whether a later stage may add entries, reopen use, or construct a new snapshot remains governed by supplied/future procedural rules.

## 25. No universal record quality or weight score

DEC-031 prohibits canonical universal:

- `EvidenceWeight`;
- `RecordStrength`;
- `RecordQuality`;
- `RecordScore`;
- `ProofScore`;
- `CredibilityScore`;
- `CorroborationScore`;
- `CourtRecordCompletenessScore`;
- record-derived `WinProbability`.

CourtRecord stores authorized content, exact scope, provenance, status/use/access history, and snapshot membership. Later adjudication may evaluate permitted content under explicit criteria. The record itself does not rank truth or outcome value.

## 26. Design decisions

| ID | Problem | Alternatives | Failure mode | Recommendation | Status |
|---|---|---|---|---|---|
| CRM1 | CourtRecord identity | Physical document / Case folder / semantic aggregate | Packaging becomes canonical and stages collapse | Use stable Matter/stage/aggregation-scoped CourtRecord identity | **Core Accepted candidate** |
| CRM2 | Record ownership | Global Case record / stage-scoped records with lineage | Appeal/remand rewrites one mutable container | Permit distinct stage records with explicit lineage | **Core Accepted candidate** |
| CRM3 | Entry identity | Text hash / source pointer / stable materialized-scope identity | Equal text merges distinct occurrences or source edits drift | Give each valid materialized scope a stable entry identity | **Core Accepted candidate** |
| CRM4 | Entry/source relationship | Copy text only / immutable source-version/scope reference | Provenance and exact meaning are lost | Retain source identity, version, and exact scope | **Core Accepted candidate** |
| CRM5 | Materialization gate | Storage/presentation implies entry / explicit RM | CaseFile and proceeding content bypass procedure | Require valid RecordMaterializationEvent | **Core Accepted candidate** |
| CRM6 | Materialization provenance | Entry only / source→RM→authority/rule→entry | Record content becomes provenance-less canonical text | Require complete MaterializationLineage | **Core Accepted candidate** |
| CRM7 | No-entry result | Ignore failed event / explicit result | Audits cannot distinguish no attempt from denied/no-entry | Permit explicit provenance-bearing no-entry result | **Accepted candidate** |
| CRM8 | Content scope | Whole source / exact immutable subset | Partial permission silently expands | Require exact ContentScopeRef | **Core Accepted candidate** |
| CRM9 | Scope extension | Mutate existing scope / new explicit event/relation | Convenience broadens record without authority | Require new explicit materialization/extension lineage | **Core Accepted candidate** |
| CRM10 | Entry families | No types / legal-status categories / source families | Categories imply doctrine or sources become opaque | Use open source-oriented families only | **Accepted candidate** |
| CRM11 | Family meaning | Weight/admissibility flag / provenance tag | Type becomes outcome authority | Family conveys source semantics only | **Core Accepted candidate** |
| CRM12 | Status model | One mutable current status / append-only multidimensional events | History, visibility, and use collapse | Use RecordStatusEvent plus separate projections | **Core Accepted candidate** |
| CRM13 | Historical existence | Delete excluded/withdrawn entries / preserve event history | Audit and replay fail | Materialized historical existence is immutable | **Core Accepted candidate** |
| CRM14 | Current-use status | Existence equals use / scoped use constraints | Every entry becomes universally usable | Separate entry existence from permitted use | **Core Accepted candidate** |
| CRM15 | Correction | In-place edit / append correction lineage | Earlier snapshots and explanations change | Append correction and preserve prior entry/version | **Core Accepted candidate** |
| CRM16 | Supersession | Replace/delete / preferred-later relation | Prior identity disappears or later text becomes retroactive | Preserve both and record supplied future preference | **Core Accepted candidate** |
| CRM17 | Withdrawal | Delete entry / append scoped withdrawal | Historical speech/materialization vanishes | Preserve entry and append use/status effect | **Core Accepted candidate** |
| CRM18 | Limitation/exclusion | Global destructive flag / scoped status event | Unrelated uses and history are erased | Target exact scope/context/effective point | **Core Accepted candidate** |
| CRM19 | Status semantics | Truth/weight labels / procedural effects only | “Active” or “admitted” becomes true | Status never implies truth, credibility, weight, or finding | **Core Accepted candidate** |
| CRM20 | Same text | Merge by text / preserve provenance identities | Distinct witnesses/hearings collapse | Text equality does not determine entry identity | **Core Accepted candidate** |
| CRM21 | Same source re-use | One invisible count / explicit occurrence/materialization relations | Re-use either disappears or double-counts proof | Preserve each event and relate shared source/scope | **Core Accepted candidate** |
| CRM22 | Duplicate effect | Always count once / always count multiple / defer to adjudication | Record layer decides evidentiary contribution | Define no duplicate-weight rule | **Core Accepted candidate** |
| CRM23 | Derived/copied content | Independent source / provenance relation | Copies masquerade as corroboration | Record derived-from/copy lineage where known | **Core Accepted candidate** |
| CRM24 | Imported prior-stage entry | Clone text / reference or explicit imported derivative | Appellate record loses original provenance | Preserve original identity and import/reference lineage | **Core Accepted candidate** |
| CRM25 | Sealing/restriction | Delete content / generic access hook | Canonical record mutates or doctrine is invented | Preserve entry and attach supplied access-rule history | **Core Accepted candidate** |
| CRM26 | Visibility vs use | Same dimension / separate constraints | Hidden means unusable or visible means admissible | Separate access from adjudicative-use scope | **Core Accepted candidate** |
| CRM27 | Redacted projection | Mutate canonical entry / derived UI view | UI changes legal record content | Redaction is a reference-bearing projection | **Core Accepted candidate** |
| CRM28 | Player visibility | Full record oracle / authorized projection | Sealed content, truth, or weight leaks | Expose only authorized record/provenance/status information | **Core Accepted candidate** |
| CRM29 | Snapshot identity | Live query alias / immutable derived object | Past adjudication inputs drift | Use stable CourtRecordSnapshot identity | **Core Accepted candidate** |
| CRM30 | Snapshot cutoff | Current time / replayable cutoff reference | Future entries leak into past evaluation | Require explicit deterministic cutoff | **Core Accepted candidate** |
| CRM31 | Snapshot construction | All stored entries / outcome-selected subset / supplied-rule derivation | Record presence or desired result controls membership | Derive from record history, cutoff, and supplied use rules | **Core Accepted candidate** |
| CRM32 | Snapshot membership | Entry ID only / entry-version-exact-scope membership | Corrections and partial limits are lost | Record entry version, exact scope, and rule/status lineage | **Core Accepted candidate** |
| CRM33 | Snapshot exclusion | Silent omission / explainable rule trace | Unfavorable material disappears without authority | Require explainable supplied-rule treatment | **Core Accepted candidate** |
| CRM34 | Snapshot immutability | Refresh old snapshot / create new snapshot | Judgment and appeal history changes retroactively | Never mutate snapshot; create a later one | **Core Accepted candidate** |
| CRM35 | Snapshot inputs | Record plus hidden state / authorized record only | Truth, CaseFile, or judge cognition leaks | Restrict builder to authorized record-side inputs | **Core Accepted candidate** |
| CRM36 | Snapshot downstream meaning | Finding/judgment / adjudication input only | Snapshot bypasses criteria and JII boundaries | Snapshot is input, never finding, JII, judgment, or truth | **Core Accepted candidate** |
| CRM37 | Entry references | Copy/mutate / stable non-mutating refs | Explanation or appeal changes source record | References preserve identity without promotion/mutation | **Core Accepted candidate** |
| CRM38 | Player/NPC record | Explicit player model / NPC RecordStrength | NPC bypasses provenance and snapshot gates | Require equivalent record ontology | **Core Accepted candidate** |
| CRM39 | Settlement/judgment/closure | Delete/freeze/rewrite / preserve history | Terminal events destroy provenance | Preserve record and snapshot history | **Core Accepted candidate** |
| CRM40 | Record scoring | Universal strength/completeness score / no canonical score | Record becomes hidden win calculator | Prohibit universal record/evidence quality and outcome scores | **Core Accepted candidate** |

## 27. Hard invariants

| # | Invariant |
|---:|---|
| 1 | `ActualStateRecord ≠ CaseFileState`. |
| 2 | `CaseFileState ≠ LawyerWorkProduct`. |
| 3 | `LawyerWorkProduct ≠ ProceedingEvent`. |
| 4 | `ProceedingEvent ≠ RecordMaterializationEvent`. |
| 5 | `RecordMaterializationEvent ≠ CourtRecordEntry`. |
| 6 | `CourtRecord ≠ CourtRecordEntry`. |
| 7 | `CourtRecordEntry ≠ CourtRecordSnapshot`. |
| 8 | `CourtRecordSnapshot ≠ CourtFactFinding`. |
| 9 | `CourtRecordSnapshot ≠ JudgeInterpretationInput`. |
| 10 | Recorded, admitted, considered, believed, true, and found are separate meanings. |
| 11 | CourtRecord has stable identity and defined Matter/stage/aggregation context. |
| 12 | CourtRecord need not be one physical document. |
| 13 | CourtRecord is not a transcript, CaseFile, evidence folder, judgment, or finding collection. |
| 14 | Distinct procedural stages may have distinct CourtRecords. |
| 15 | Aggregated projections do not replace entry-level canonical identities. |
| 16 | Every CourtRecordEntry has stable identity. |
| 17 | Entry identity is not determined by text equality alone. |
| 18 | Every entry identifies its containing CourtRecord. |
| 19 | Every entry identifies its source object/event. |
| 20 | Every entry identifies the applicable immutable source version or snapshot where relevant. |
| 21 | Every entry identifies exact materialized content scope. |
| 22 | Every entry identifies its RecordMaterializationEvent. |
| 23 | Every entry retains materialization authority and supplied rule reference. |
| 24 | Every entry retains origin stage/proceeding and actor where relevant. |
| 25 | Every entry retains materialization order/effective context. |
| 26 | No canonical CourtRecordEntry exists without valid materialization lineage. |
| 27 | A no-entry result creates no CourtRecordEntry. |
| 28 | Source object, selected scope, materialized scope, and entry remain distinct. |
| 29 | Materialized scope never silently expands to the whole source. |
| 30 | Later source edits do not alter the scope of an existing entry. |
| 31 | Scope extension requires a new explicit event/relation. |
| 32 | Entry family identifies source semantics only. |
| 33 | Entry family does not imply admissibility, truth, credibility, weight, superiority, or finding. |
| 34 | Historical entry existence is immutable after valid materialization. |
| 35 | Status history is append-only. |
| 36 | Current-use projection is not the canonical history. |
| 37 | Entry existence is distinct from current permitted use. |
| 38 | Current permitted use is distinct from snapshot membership. |
| 39 | Snapshot membership is distinct from adjudicative contribution. |
| 40 | Status never implies truth, credibility, weight, or finding. |
| 41 | Later limitation/exclusion does not delete the entry or source event. |
| 42 | Withdrawal preserves prior entry and materialization history. |
| 43 | Correction creates explicit lineage and does not overwrite prior identity. |
| 44 | Supersession preserves both prior and later entries/versions. |
| 45 | A corrected/superseding version may be preferred only under a supplied future-use rule. |
| 46 | Earlier snapshots retain the versions/scopes they originally included. |
| 47 | Same proposition does not imply same source or entry. |
| 48 | Same text in distinct hearings does not merge distinct events or entries. |
| 49 | Two witnesses with matching text remain distinct sources. |
| 50 | Same source presented twice preserves two presentation events. |
| 51 | Same source/scope materialized twice preserves explicit materialization lineage. |
| 52 | Repeated or duplicate content does not automatically add evidentiary weight. |
| 53 | Repeated or duplicate content is not automatically collapsed for adjudicative contribution. |
| 54 | Derived/copied/imported content retains known source lineage. |
| 55 | Textual match does not establish source independence or corroboration. |
| 56 | DEC-031 defines no duplicate, contribution, corroboration, or sufficiency algorithm. |
| 57 | RecordUseConstraint targets an exact entry/version/scope and supplied context. |
| 58 | Use limitation for one context does not silently apply to every context. |
| 59 | Missing use authority is not silently converted to permission. |
| 60 | CourtRecordSnapshot has stable identity. |
| 61 | Every snapshot identifies one CourtRecord and stage/court-level context. |
| 62 | Every snapshot has an explicit replayable cutoff. |
| 63 | Every snapshot identifies supplied permitted-use/rule context and construction authority. |
| 64 | Every snapshot membership identifies entry version and exact included scope. |
| 65 | Snapshot construction uses record history only through its cutoff. |
| 66 | Future entries and status events do not enter an earlier snapshot. |
| 67 | Snapshot membership is deterministic from supplied semantic inputs. |
| 68 | Snapshot selection does not depend on desired outcome or party preference. |
| 69 | Snapshot construction does not use hidden evidence weight, credibility, or truth. |
| 70 | Snapshot construction does not read ActualStateRecord. |
| 71 | Snapshot construction does not read private/unmaterialized CaseFileState or LawyerWorkProduct. |
| 72 | Snapshot construction does not read hidden PersonKnowledge, judge belief, or future JII. |
| 73 | Unfavorable entries are not omitted without an explicit supplied rule. |
| 74 | UI visibility is not an adjudicative-use rule. |
| 75 | A created snapshot is immutable. |
| 76 | Later record changes require a new snapshot for later consumption. |
| 77 | `CourtRecordSnapshot-1 ≠ CourtRecordSnapshot-2`. |
| 78 | Snapshot does not itself create truth, JII, finding, or judgment. |
| 79 | Fact evaluation may consume only the scope permitted by its snapshot. |
| 80 | Fact evaluation may not reach around the snapshot to hidden or unmaterialized content. |
| 81 | Stable references do not duplicate, promote, or mutate entries. |
| 82 | Access/visibility is distinct from historical existence and adjudicative use. |
| 83 | Sealed does not automatically mean invisible to every authorized consumer. |
| 84 | Visible does not automatically mean usable for every downstream purpose. |
| 85 | Redacted UI projections do not mutate canonical entry content or scope. |
| 86 | Player visibility exposes only authorized entry content, status, and provenance. |
| 87 | No universal EvidenceWeight, RecordStrength, RecordQuality, ProofScore, completeness score, or record-derived win probability exists. |
| 88 | Player and NPC matters use the same CourtRecord and snapshot ontology. |
| 89 | Prior-stage, appellate, and remand records preserve distinct identities and explicit lineage. |
| 90 | Settlement, judgment, closure, appeal, and remand do not erase or rewrite CourtRecord history. |

## 28. Required semantic chains

### 28.1 Testimony-derived record

```text
TestimonyEvent
→ RecordMaterializationEvent
→ scoped CourtRecordEntry
→ CourtRecordSnapshot membership if permitted at cutoff
→ later fact evaluation
```

Each arrow requires its own semantic event or supplied rule. Testimony does not directly create record content, truth, credibility, JII, or finding.

### 28.2 Material-derived record

```text
EvidencePresentationEvent
→ supplied procedural result
→ RecordMaterializationEvent
→ exact-scope CourtRecordEntry
→ snapshot membership if permitted
```

Presentation, procedural status, materialization, entry existence, snapshot membership, and adjudicative contribution remain distinct.

### 28.3 Correction and supersession

```text
CourtRecordEntry CR-v1
→ CorrectionEvent / SupersessionEvent
→ CourtRecordEntry CR-v2 or corrected derivative
→ later snapshot applies supplied version/use rule
```

CR-v1 remains historical and remains in earlier snapshots.

### 28.4 Later limitation or exclusion

```text
CourtRecordEntry CR-1
→ later RecordStatusEvent limits/excludes supplied use
→ CR-1 remains historical
→ later snapshot membership/use changes only as supplied
```

### 28.5 Multi-stage lineage

```text
TrialCourtRecord
→ immutable trial snapshot
→ explicit appellate reference/import event
→ distinct appellate record/snapshot
```

The later stage preserves original identity/provenance and does not rewrite the trial record.

## 29. Architecture attacks

| # | Source and attempted invalid target | Permitted state |
|---:|---|---|
| 1 | `TestimonyEvent TE-1 → CourtRecordEntry CR-1` without `RecordMaterializationEvent` | `TE-1` remains testimony only; no `CR-1` exists. |
| 2 | `EvidencePresentationEvent EP-2` presents `Artifact A-2[p1–p20]`; supplied `RM-2` permits p4–p5 → `CR-2` silently contains p1–p20 | `CR-2.scope=A-2[p4–p5]`; all other pages remain outside that entry. |
| 3 | `CourtRecordEntry CR-3` asserts X → `Truth(X)` | `CR-3` remains record content with provenance; objective truth is unchanged. |
| 4 | `CourtRecordEntry CR-4` asserts X → `CourtFactFinding FF-4(X)` | No finding exists without later adjudication using an authorized snapshot and criterion. |
| 5 | `CourtRecordEntry CR-5 → JudgeInterpretationInput JII-5` | `CR-5` may later be referenced by an allowed snapshot; it does not directly create JII. |
| 6 | Later `RecordStatusEvent RSE-6=excluded` → delete `CR-6` | Preserve `CR-6`, its materialization lineage, and `RSE-6`; only supplied future use changes. |
| 7 | `CorrectionEvent CE-7` for `CR-7-v1` → overwrite v1 | Preserve `CR-7-v1`; create/link corrected `CR-7-v2` and explicit correction lineage. |
| 8 | `TE-8-A` and `TE-8-B` contain the same text in two hearings → merge into one entry/event | Preserve both TestimonyEvents and each explicit materialization/entry identity. |
| 9 | `Artifact A-9[p2]` materialized by `RM-9-A` and `RM-9-B` → automatic double proof | Preserve both materialization histories and shared-source relation; create no weight or proof multiplier. |
| 10 | Matching entries `CR-10-A`, `CR-10-B`, `CR-10-C` → `CorroborationScore=3` | Preserve three provenance-bearing entries and known relations; no canonical corroboration score exists. |
| 11 | Later `CR-11-Late` is added after cutoff C1 → mutate `CRS-11-C1` to include it | `CRS-11-C1` remains unchanged; a later `CRS-11-C2` may include it under supplied rules. |
| 12 | `CR-12-Unfavorable` is active and permitted at cutoff → omit it from `CRS-12` because it harms a desired outcome | Include/treat it according to supplied rules; outcome preference is not a construction input. |
| 13 | Hidden `CaseFileMaterial CFM-13` supports X → insert it into `CRS-13` | Snapshot reads only CourtRecord history; no entry or membership arises from hidden CaseFile content. |
| 14 | `CR-14` is sealed for the player → make it invisible to every consumer and unusable for all purposes | Preserve `CR-14`; apply distinct supplied access and downstream-use rules per consumer/context. |
| 15 | `CR-15` is visible in UI → treat it as admitted/usable for every purpose | Visibility remains a projection permission; use requires separate supplied constraints/snapshot rules. |
| 16 | Trial entry `CR-T-16` text copied into appeal → provenance-less appellate truth object | Reference `CR-T-16` or create an explicitly imported derivative retaining original and import lineage. |
| 17 | Appeal event `AP-17` → rewrite trial entry `CR-T-17` as appellate entry | Preserve `CR-T-17`; create distinct later-stage identity/reference under supplied appellate context. |
| 18 | Judgment `J-18` → erase `CourtRecord CR-18` and snapshots | Preserve record, entries, status history, and immutable snapshots; judgment remains downstream. |
| 19 | NPC Matter `M-19-NPC → RecordStrength=0.82` without entries/snapshot | Require semantically equivalent CourtRecordEntry, lineage, status, scope, snapshot, and use boundaries. |
| 20 | `CourtRecordSnapshot CRS-20 → CourtFactFinding FF-20` directly | `CRS-20` remains authorized input only; recognition/criterion/finding systems must perform later adjudication. |
| 21 | Entry status `active` on `CR-21` → `Truth(content(CR-21))` | Active describes supplied procedural use projection only; no truth, credibility, weight, or finding follows. |
| 22 | Same text in `CR-22-A` and `CR-22-B` → assume one semantic entry | Retain separate identities unless provenance proves the same entry reference; text equality alone is insufficient. |
| 23 | Duplicate source scopes `CR-23-A/B` → automatically count once in sufficiency | Record duplicate/source relations only; adjudication owns contribution treatment under explicit criteria. |
| 24 | `CourtRecordSnapshot CRS-24 → Judgment J-24` | Snapshot remains input; findings, disposition, and judgment require separate downstream events. |

## 30. Explicit non-goals and TBD

DEC-031 does not decide:

- Korean evidence or admissibility doctrine;
- hearsay, privilege, authentication, foundation, relevance, or competency;
- objection taxonomy or procedural grounds;
- exact exhibit rules;
- exact sealing, restriction, disclosure, or transcript law;
- evidentiary weight or credibility adjudication;
- corroboration, independence, duplicate contribution, or sufficiency algorithms;
- factual recognition criteria or result computation;
- JudgeInterpretationInput derivation or judge cognition;
- final adjudication or judgment lifecycle;
- appellate/remand procedure or legal effects;
- canonical database/storage schema;
- serialization, digest, or cutoff implementation;
- API or Godot architecture;
- UI implementation, record browser, or redaction rendering;
- performance, balancing, or content-authoring tooling.

Where these concerns touch CourtRecord, DEC-031 supplies typed identity, scope, provenance, status, access, use, snapshot, and lineage interfaces only. Missing doctrine is not filled with generic legal knowledge.

## 31. Risks and anti-patterns

| Risk | Consequence | Boundary |
|---|---|---|
| CourtRecord as folder or transcript blob | Entry identity and provenance disappear | Semantic aggregate with typed entries |
| Whole-source materialization | Partial permission expands silently | Exact immutable ContentScopeRef |
| One mutable status | Existence, access, use, and truth collapse | Append-only multidimensional events |
| Correction by overwrite | Earlier snapshot and audit change | New version/entry with explicit lineage |
| Text-based deduplication | Distinct witnesses/hearings merge | Provenance-based identity |
| Duplicate count as proof | Record layer becomes adjudicator | Relation only; contribution deferred |
| Live snapshot query | Historical judgment inputs drift | Immutable snapshot identity and cutoff |
| Outcome-selected snapshot | Unfavorable record disappears | Deterministic supplied-rule construction |
| UI visibility as use rule | Sealed/visible semantics distort adjudication | Separate access and use dimensions |
| Hidden CaseFile supplementation | CourtRecord gate is bypassed | Snapshot reads record-side inputs only |
| Appellate copy without lineage | Trial provenance is lost | Explicit reference/import relation |
| NPC RecordStrength | NPC bypasses record ontology | Equivalent entries, snapshots, and history |
| Record quality score | Hidden win calculator appears | No universal record/evidence score |
| Terminal-event cleanup | Settlement/judgment erases history | Persistent append-only record |

## 32. Player-facing principle

The player should be able to inspect why authorized content is in the record, which exact source scope it represents, which materialization event/rule placed it there, how later events affected its use or visibility, and which immutable snapshots included it.

The player should not receive a truth badge, hidden evidentiary weight, credibility oracle, record completeness percentage, best-evidence ranking, future snapshot preview, or record-derived win probability.

## 33. Future DEC candidates

The following areas should remain separate decisions rather than being absorbed into DEC-031:

| Candidate area | Why separate |
|---|---|
| Detailed evidence/exhibit procedure | Owns marking, authentication, foundation, admission, limitation, exclusion, and use doctrine before materialization. |
| Objections and procedural admissibility | Owns grounds, timing, decision authority, remedies, and jurisdiction-specific effects. |
| Credibility and testimony adjudication | Owns how allowed testimony is assessed without creating an oracle. |
| Evidence contribution, independence, and corroboration | Owns duplicate/source-lineage contribution under explicit criteria. |
| Factual recognition and sufficiency integration | Owns criterion application to permitted snapshot content. |
| Judgment and conclusion lifecycle | Owns findings, disposition, readiness, issuance, correction, and post-judgment state. |
| Appeal/remand procedure | Owns stage transitions, import/use authority, review scope, and legal effect. |
| CourtRecord UI/presentation | Owns record browsing, filtering, redaction, comparison, and snapshot explanation without semantic mutation. |

No final DEC number is assigned here.

## 34. Verification plan for later TEST-030

Do not optimize for fixture count. TEST-030 should use approximately 20–30 detailed high-risk fixtures, approximately 15 focused architecture attacks, and compact matrices for lower-risk invariants.

Critical detailed fixtures should include:

1. TestimonyEvent with no RM produces no CourtRecordEntry.
2. Valid RM creates one exact-scope entry with complete lineage.
3. Partial artifact scope does not expand.
4. Multiple scoped entries from one source remain explicit.
5. Explicit no-entry result remains historical without entry creation.
6. Correction preserves old identity and creates linked corrected state.
7. Supersession changes supplied future preference without deletion.
8. Exclusion/limitation changes future use without history deletion.
9. Same text with different witness/hearing provenance remains distinct.
10. Same source reused in multiple proceedings preserves shared-source and occurrence lineage.
11. Derived copy/import retains original provenance.
12. Duplicate entries create no proof/corroboration score.
13. Snapshot at cutoff C1 excludes later entry.
14. Later snapshot C2 includes later entry under supplied rules while C1 is unchanged.
15. Snapshot uses exact entry versions and partial scopes.
16. Unfavorable permitted entry is not silently omitted.
17. Hidden CaseFile/ActualState/PersonKnowledge cannot enter snapshot.
18. Future status event cannot alter prior snapshot.
19. Sealing and adjudicative-use constraints remain separate.
20. Redacted UI projection leaves canonical content unchanged.
21. Player/NPC record and snapshot ontology is equivalent.
22. Trial/appellate reference preserves distinct record identities and original lineage.
23. Settlement/judgment/closure preserves record history.
24. CourtRecordEntry does not create truth, credibility, JII, or finding.
25. CourtRecordSnapshot does not create finding or judgment.

High-risk fixtures should use full `Fixture → Manual verification → Expected → Observed → Verdict` treatment. Lower-risk identity, source-family, access-projection, and reference invariants may use compact matrices. Doctrine-dependent fixtures must use explicit supplied rules and must not claim to verify Korean procedure.

TEST-030 is not created in this task.

## 35. Decision quality checklist

Every future refinement must answer:

1. What is the canonical object?
2. What explicit event created it?
3. Which exact immutable source/version/scope does it contain?
4. Which provenance must remain queryable?
5. Which later event may affect use, version preference, or access?
6. Does that event preserve history and affect only supplied future semantics?
7. Which snapshot includes which entry version and scope?
8. Which cutoff, authority, and supplied rule justify membership?
9. Which hidden information remains inaccessible?
10. Does the design accidentally imply truth, credibility, weight, contribution, or outcome?
11. Is the change CourtRecord semantics, or doctrine/adjudication owned elsewhere?

If the answer requires unresolved doctrine or implementation, the interface remains supplied/TBD.

## 36. Decision summary

### Inherited Accepted

- ActualState, CaseFile, WorkProduct, ProceedingEvent, CourtRecord, snapshot, JII, and finding boundaries.
- DEC-030 `ProceedingEvent ≠ RecordMaterializationEvent ≠ CourtRecordEntry` gate.
- Exact source/provenance and append-only event history.
- Allowed CourtRecordSnapshot as the sole record-side fact-evaluation input.
- No hidden-state access, truth laundering, direct JII/finding mutation, score oracle, or reload rewrite.
- Player/NPC semantic symmetry and stage/history preservation.

### Core Accepted candidates

- CRM1–CRM6, CRM8–CRM9, CRM11–CRM40 except those listed as Accepted candidates below.
- Stable CourtRecord and CourtRecordEntry identities with exact source/version/scope and materialization lineage.
- Append-only multidimensional status/use/access history.
- Non-destructive correction, supersession, withdrawal, limitation, exclusion, and sealing hooks.
- Provenance-preserving duplicate/repeated/derived/imported relations without weight calculation.
- Immutable deterministic snapshots with explicit cutoff, membership scope, and supplied-rule provenance.
- Strict snapshot-to-adjudication and visibility-to-use separation.

### Accepted candidates

- CRM7: explicit no-entry result.
- CRM10: open source-oriented entry families.

### TBD

- All doctrine, exact taxonomies, identity/scope/cutoff algorithms, storage/serialization/API, UI, AI, contribution/weight, adjudication, appellate effects, implementation, and performance listed in §30.

### Forbidden

- Source/ProceedingEvent → CourtRecordEntry without RecordMaterializationEvent.
- Scope expansion, provenance-less canonical text, destructive status mutation, or historical deletion.
- Text-equality merge, automatic duplicate count, or record-layer corroboration/weight calculation.
- Old-snapshot mutation, future-entry leakage, hidden CaseFile/ActualState/judge access, or outcome-selected membership.
- CourtRecordEntry/Snapshot → truth, credibility, JII, finding, judgment, or win probability.
- Visibility → universal use, sealing → universal invisibility, or player/NPC ontology divergence.
- Settlement, judgment, closure, appeal, or remand rewriting record history.
- Invented Korean procedure or universal record/evidence strength score.

## 37. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | Initial canonical CourtRecord model defining CourtRecord, CourtRecordEntry, ContentScopeRef, MaterializationLineage, append-only status/use/access history, correction/supersession, repeated/derived/imported relations, immutable CourtRecordSnapshot and membership, stage lineage, visibility, player/NPC symmetry, CRM1–CRM40, 90 hard invariants, architecture attacks, future DEC boundaries, and later TEST-030 strategy. |
