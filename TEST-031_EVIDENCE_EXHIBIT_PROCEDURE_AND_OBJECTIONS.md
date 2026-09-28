# TEST-031 — Evidence, Exhibit Procedure, and Objections

**Status:** v0.1 — Proposed / manual fixture-level verification  
**Primary source:** `DEC-LITIGATION-032_EVIDENCE_EXHIBIT_PROCEDURE_AND_OBJECTIONS.md` v0.1 Proposed / design review required  
**Inherited sources:** Constitution; System Map; Architecture Rules; SYS-001; accepted litigation DEC/TEST chain through DEC-031 / TEST-030  
**Test type:** Semantic architecture verification; not implementation, UI, legal-doctrine, credibility, weight, or balancing testing

---

## 1. Purpose and verdict rules

This document manually verifies whether DEC-032 orchestrates exact evidence-use attempts, supplied procedural rules, objections, grounds, responses/cures, revised attempts, procedural rulings/effects, presentation, witness and advocacy integration, RM eligibility, history, visibility, workload, and player/NPC symmetry without collapsing procedure into truth, weight, findings, or CourtRecord creation.

Use only `PASS`, `PARTIAL`, or `FAIL`.

- `PASS` means the fixture produces a clear result consistent with DEC-032 and inherited architecture.
- `PARTIAL` is reserved for a material ambiguity or contradiction in DEC-032 that prevents deterministic verification.
- `FAIL` means DEC-032 permits or implies an invalid shortcut.

Do not use `PARTIAL` merely because doctrine, Korean procedure, exact terminology, timing, UI, storage, or implementation is TBD. Where legal content is necessary, the fixture supplies a versioned `ProceduralRuleRef` and exact effect.

---

## 2. Core boundaries under test

```text
SourceMaterial
≠ CaseFile material
≠ PresentationSelection
≠ EvidenceUseAttempt
≠ EvidencePresentationEvent
≠ ObjectionEvent
≠ ProceduralRuling
≠ ProceduralUseEffect
≠ ProcedurallyPermittedMaterial
≠ RecordMaterializationEvent
≠ CourtRecordEntry
≠ CourtRecordSnapshot
≠ CourtFactFinding
```

```text
presented ≠ marked ≠ challenged ≠ permitted ≠ limited ≠ admitted
≠ recorded ≠ considered ≠ believed ≠ true ≠ found
```

```text
source object
≠ proposed use scope
≠ permitted use scope
≠ presented scope
≠ materialized scope
```

`ObjectionEvent` is not `ProceduralRuling`; a ruling result label is not its `ProceduralUseEffect`; and `ProcedurallyPermittedMaterial` is not `RecordMaterializationEvent` or `CourtRecordEntry`.

---

## 3. Detailed critical fixtures

### Case C01 — Selection without a courtroom action

**Purpose**

Verify that internal selection does not become courtroom use.

**Fixture**

`SourceMaterial SM-C01 v1[p1–p3]` is authorized in Case File. `PresentationSelection PS-C01` is created by lawyer `L-C01` for possible purpose `P-C01`. No courtroom participant performs a use action.

**Manual verification**

Inspect whether `EvidenceUseAttempt`, `ObjectionEvent`, `ProceduralRuling`, `EvidencePresentationEvent`, and `RecordMaterializationEvent` are created from `PS-C01` alone.

**Expected**

`PS-C01` remains a WorkProduct-side selection linked to `SM-C01 v1[p1–p3]`. No downstream courtroom or record object is created.

**Observed**

Before the fixture action, only `SM-C01 v1[p1–p3]` and `PS-C01` exist. Because no courtroom actor attempts a purpose-specific use, no `EUA-C01`, `OE-C01`, `PR-C01`, `EP-C01`, or `RM-C01` exists afterward. `SM-C01` and `PS-C01` retain their original provenance; `PS-C01` does not become admitted material or a CourtRecord entry.

**Verdict**

PASS

**Boundary note**

This does not establish whether a later supplied rule permits any actual use of `SM-C01`.

### Case C02 — Exact authorized use attempt

**Purpose**

Verify stable attempt identity, actor, proceeding, version, scope, purpose, and rule context.

**Fixture**

`SM-C02 v3[p4–p5]` is authorized. Actor `A-C02` in proceeding `Prc-C02`, phase `Phase-C02`, creates `EUA-C02` from selection `PS-C02` for purpose `P-C02` under `Rule-C02 v1`.

**Manual verification**

Inspect `EUA-C02` and confirm no permission or presentation is inferred merely from creation.

**Expected**

`EUA-C02` exists with exact source version/scope, actor, proceeding coordinates, purpose, order, and rule reference. It is not permission.

**Observed**

`EUA-C02` identifies `SM-C02 v3[p4–p5]`, actor `A-C02`, `Prc-C02`, `Phase-C02`, purpose `P-C02`, and `Rule-C02 v1`. No `ProceduralUseEffect`, `EP-C02`, or `RM-C02` exists because no ruling or supplied no-ruling-needed authority has been recorded. The proposed scope remains `[p4–p5]` and does not expand.

**Verdict**

PASS

**Boundary note**

This does not decide the supplied rule’s legal requirements.

### Case C03 — Attempt requiring permission but lacking a ruling

**Purpose**

Verify that an attempt cannot become presentation when the supplied rule requires permission and no effect exists.

**Fixture**

`SM-C03 v1[p1]`; `EUA-C03` proposes use for `P-C03` under `Rule-C03 v1`, which requires an authorized permission effect. No objection, response, ruling, or no-ruling-needed authority exists.

**Manual verification**

Inspect the attempted transition `EUA-C03 → EP-C03`.

**Expected**

No `EvidencePresentationEvent` or RM is validly created from `EUA-C03`.

**Observed**

`EUA-C03` remains the only courtroom-use object for `SM-C03 v1[p1]`. Since `Rule-C03 v1` has no `PR-C03` and no explicit no-ruling-needed effect, `EUA-C03` has no effective permission; `EP-C03` and `RM-C03` do not exist. The source and attempt remain queryable.

**Verdict**

PASS

**Boundary note**

This does not mean every supplied rule requires a ruling; C04 tests the explicit exception.

### Case C04 — Explicit uncontested no-ruling-needed authority

**Purpose**

Verify that a supplied no-ruling-needed rule may create permission, while silence alone cannot.

**Fixture**

`SM-C04 v2[p2]`; `EUA-C04` proposes purpose `P-C04`. `Rule-FIX-Uncontested-C04 v1` explicitly states that this context creates a `ProceduralUseEffect` without an objection or separate ruling.

**Manual verification**

Inspect the authority creating `PUE-C04`; confirm no invented objection is added and that the rule is explicit.

**Expected**

`PUE-C04` permits only `SM-C04 v2[p2]` for `P-C04`. No objection is required by this supplied rule.

**Observed**

No `OE-C04` exists. The explicit `Rule-FIX-Uncontested-C04 v1` creates `PUE-C04` for `EUA-C04`, source `SM-C04 v2[p2]`, and purpose `P-C04`; that effect can authorize a later `EP-C04`. No `PR-C04` is fabricated, no scope broadens, and no truth or record entry is created by the rule alone.

**Verdict**

PASS

**Boundary note**

This does not make the absence of an objection generally equivalent to permission.

### Case C05 — Requirement evaluation is not a ruling

**Purpose**

Verify separate requirement-evaluation provenance.

**Fixture**

`EUA-C05` proposes `SM-C05 v1[p1]` under `Rule-C05 v1`. `RequirementEvaluation RE-C05` records that supplied requirement `Req-C05` is satisfied. No authorized ruling event is supplied.

**Manual verification**

Inspect whether `RE-C05` has become `PR-C05` or created a `ProceduralUseEffect` without supplied authority.

**Expected**

`RE-C05` exists with target, scope, rule/version, authorized inputs, and result. No permission follows unless the supplied rule makes that consequence explicit.

**Observed**

`RE-C05` records satisfaction of `Req-C05` for `EUA-C05` and `SM-C05 v1[p1]`. There is no `PR-C05`, `PUE-C05`, or `EP-C05`; the satisfied requirement did not silently become a ruling. `EUA-C05` remains historical and unpermitted.

**Verdict**

PASS

**Boundary note**

This does not test a supplied combined event; C06 does.

### Case C06 — One supplied event with two preserved semantic roles

**Purpose**

Verify that a supplied authorized event may fulfill both requirement-evaluation and ruling roles without collapsing their meanings.

**Fixture**

`EUA-C06` targets `SM-C06 v1[p4–p5]`. `Rule-C06 v1` explicitly declares `Event CE-C06` to perform both `RequirementEvaluation` for `Req-C06` and `ProceduralRuling` by authority `Auth-C06`, with effect permitting `[p4–p5]` for `P-C06`.

**Manual verification**

Inspect both semantic roles, their common event identity, target, inputs, authority, rule, and effect.

**Expected**

Both roles remain independently inspectable even though one supplied event carries them.

**Observed**

`CE-C06` evaluates `Req-C06` and records a satisfied result, while its separate ruling role records authority `Auth-C06` and creates `PUE-C06` for `SM-C06 v1[p4–p5]`, purpose `P-C06`. The shared event identity is explicit; requirement satisfaction was not mistaken for permission, and the effect is traceable to the ruling role.

**Verdict**

PASS

**Boundary note**

This does not authorize combining arbitrary untyped evaluation and ruling records.

### Case C07 — Requirement satisfied without supplied permission consequence

**Purpose**

Verify that even a satisfied requirement does not create permission absent a supplied consequence.

**Fixture**

`RE-C07` marks `Req-C07` satisfied for `EUA-C07` and `SM-C07 v1[p1]`. `Rule-C07 v1` supplies no permission consequence and no ruling authority.

**Manual verification**

Inspect whether `PUE-C07`, `EP-C07`, or RM exists.

**Expected**

No permission, presentation, or materialization is fabricated.

**Observed**

`RE-C07` is the only result for `EUA-C07`; it names `Rule-C07 v1`, `Req-C07`, and `[p1]`. No `PUE-C07`, `PR-C07`, `EP-C07`, or `RM-C07` exists. The satisfied condition remains a procedural input rather than an outcome shortcut.

**Verdict**

PASS

**Boundary note**

This does not determine what a different supplied rule may make the requirement do.

### Case C08 — Exact objection target and scope

**Purpose**

Verify that an objection targets an exact attempt/scope and does not itself rule.

**Fixture**

`SM-C08 v1[p1–p8]`; `EUA-C08` proposes `[p4–p5]` for `P-C08`. Actor `A-C08` creates `OE-C08` targeting `EUA-C08[p4–p5]`, citing `Ground-C08` under `Rule-C08 v1`. No ruling exists.

**Manual verification**

Inspect target identity, target scope, actor, ground, order, and absence of a ruling/effect.

**Expected**

`OE-C08` exists; no disallowance, permission, presentation, or entry follows automatically.

**Observed**

`OE-C08` points to `EUA-C08` and exact scope `[p4–p5]`, actor `A-C08`, `Ground-C08`, and `Rule-C08 v1`. `PR-C08`, `PUE-C08`, and `EP-C08` are absent. Pages `[p1–p3]` and `[p6–p8]` are not silently targeted, and the objection remains unresolved.

**Verdict**

PASS

**Boundary note**

This does not test the eventual supplied ruling.

### Case C09 — Multiple grounds remain independent

**Purpose**

Verify that one objection with multiple grounds does not create a strength score or automatic result.

**Fixture**

`EUA-C09` proposes `SM-C09 v1[p2]`. `OE-C09` cites `Ground-C09A`, `Ground-C09B`, and `Ground-C09C`, each supplied under `Rule-C09 v1`, against the same `[p2]` purpose `P-C09`.

**Manual verification**

Inspect ground identities, target scope, and whether any `ObjectionStrength` or ruling appears.

**Expected**

Three ground references remain separately traceable; no score or result is inferred.

**Observed**

`OE-C09` retains all three ground references against `EUA-C09[SM-C09 v1[p2], P-C09]`. No `ObjectionStrength`, `PR-C09`, or `PUE-C09` exists. The ground count has not altered the attempt’s state.

**Verdict**

PASS

**Boundary note**

This does not test different objections by different actors; C10 does.

### Case C10 — Two actors and distinct objection scopes

**Purpose**

Verify separate objection identity, actor, order, and scope.

**Fixture**

`EUA-C10` proposes `SM-C10 v1[p1–p10]`. `OE-C10A` by `A-C10A` targets `[p1–p2]`; `OE-C10B` by `A-C10B` later targets `[p7–p8]`. Both cite supplied `Rule-C10 v1`.

**Manual verification**

Inspect whether the events merge, overwrite the attempt, or affect each other’s target scopes.

**Expected**

Both objections remain distinct and independently targetable.

**Observed**

`OE-C10A` and `OE-C10B` preserve their different actors, orders, grounds, and scopes `[p1–p2]` and `[p7–p8]` against the same `EUA-C10`. No combined strength value, merged target, or automatic ruling exists.

**Verdict**

PASS

**Boundary note**

This does not prescribe how a supplied authority resolves overlapping objections.

### Case C11 — Withdrawn objection before ruling

**Purpose**

Verify objection withdrawal is distinct from withdrawing the use attempt.

**Fixture**

`EUA-C11` proposes `SM-C11 v1[p3]`; `OE-C11` challenges it. Actor `A-C11` creates `OW-C11` withdrawing only `OE-C11` before any ruling. No use-attempt withdrawal exists.

**Manual verification**

Inspect the ordered objection and withdrawal events, and whether `EUA-C11` was deleted or automatically permitted.

**Expected**

`OE-C11` and `OW-C11` remain history; the attempt state follows supplied rules and is not automatically withdrawn.

**Observed**

`OE-C11` remains queryable with target `EUA-C11[SM-C11 v1[p3]]`; `OW-C11` records its withdrawal and order. `EUA-C11` still exists, but no permission or presentation is inferred because `OW-C11` is not a supplied no-ruling-needed authority. No event was deleted.

**Verdict**

PASS

**Boundary note**

This does not determine whether a supplied rule gives withdrawal a future procedural effect.

### Case C12 — Cure attempt without automatic success

**Purpose**

Verify a response/cure action is not permission.

**Fixture**

`EUA-C12` proposes `SM-C12 v1[p1]`; `OE-C12` identifies a supplied missing requirement. Actor `A-C12` creates `ResponseOrCureAction RC-C12` containing a clarification, but no ruling follows.

**Manual verification**

Inspect `RC-C12` target, content, rule, and absence of `PUE-C12`.

**Expected**

The response/cure exists as an action; permission still requires a supplied result/effect.

**Observed**

`RC-C12` links `A-C12` to `OE-C12`/`EUA-C12`, identifies `SM-C12 v1[p1]`, and records the clarification under `Rule-C12 v1`. No `PR-C12`, `PUE-C12`, or `EP-C12` exists. The response is not treated as successful cure.

**Verdict**

PASS

**Boundary note**

This does not test a cure that a supplied rule later accepts.

### Case C13 — Narrowed linked attempt

**Purpose**

Verify a scope-narrowing cure creates new lineage rather than overwriting the original attempt.

**Fixture**

`EUA-C13` proposes `SM-C13 v1[p1–p20]`; `OE-C13` challenges it. `RC-C13` narrows the request, creating `EUA-C13B` for `[p4–p5]`, purpose `P-C13`.

**Manual verification**

Compare both attempt identities, source versions/scopes, parent links, and orders.

**Expected**

`EUA-C13` remains `[p1–p20]`; `EUA-C13B` is a new linked attempt `[p4–p5]`.

**Observed**

`EUA-C13` retains its original proposed `[p1–p20]` scope and objection link. `EUA-C13B` records `RC-C13` as its parent/revision, uses the same `SM-C13 v1`, and proposes only `[p4–p5]`. No data in `EUA-C13` was overwritten and no permission is inferred for either attempt.

**Verdict**

PASS

**Boundary note**

This does not decide whether `EUA-C13B` is later permitted.

### Case C14 — Replacement source preserves both histories

**Purpose**

Verify source replacement does not erase the challenged source lineage.

**Fixture**

`EUA-C14` proposes `SM-C14A v1[p2]`; `OE-C14` identifies a supplied source problem. `RC-C14` replaces it with `SM-C14B v1[p2]`, creating `EUA-C14B`.

**Manual verification**

Inspect source/version links on both attempts and the cure/replacement relation.

**Expected**

Both source histories remain traceable; the replacement is a new linked attempt.

**Observed**

`EUA-C14` still points to `SM-C14A v1[p2]` and `OE-C14`; `RC-C14` records the replacement; `EUA-C14B` points to `SM-C14B v1[p2]` with a new attempt identity. Neither source was merged and no presentation follows without a separate effect.

**Verdict**

PASS

**Boundary note**

This does not establish that source B satisfies the supplied requirement.

### Case C15 — Authorized disallowance

**Purpose**

Verify a ruling creates exact disallowance and blocks presentation from that attempt.

**Fixture**

`EUA-C15` proposes `SM-C15 v1[p1]`; `OE-C15` targets it. Authorized `PR-C15` by `Auth-C15` under `Rule-C15 v1` creates `PUE-C15` disallowing `[p1]` for `P-C15`.

**Manual verification**

Inspect ruling authority, target, exact effect, and absence of `EP-C15`.

**Expected**

The ruling and effect exist; no presentation or RM may derive from that disallowed attempt/scope.

**Observed**

`PR-C15` targets `OE-C15/EUA-C15`, records `Auth-C15`, `Rule-C15 v1`, and creates `PUE-C15` disallowing `SM-C15 v1[p1]` for `P-C15`. `EUA-C15`, `OE-C15`, and `PR-C15` remain historical; no `EP-C15` or `RM-C15` exists.

**Verdict**

PASS

**Boundary note**

Disallowance here is procedural and does not establish that `SM-C15` is false.

### Case C16 — Result label separated from exact effect

**Purpose**

Verify a `limited` result cannot govern without explicit scope/effect.

**Fixture**

`EUA-C16` proposes `SM-C16 v1[p1–p20]`. `PR-C16` has result label `limited` under `Rule-C16 v1` and creates `PUE-C16` permitting `[p4–p5]`, prohibiting `[p1–p3,p6–p20]` for `P-C16`.

**Manual verification**

Inspect the label and all exact effect dimensions.

**Expected**

The label is descriptive; the exact permitted/prohibited scope controls downstream use.

**Observed**

`PR-C16` records `limited`, while `PUE-C16` separately names `SM-C16 v1`, purpose `P-C16`, permitted `[p4–p5]`, and prohibited `[p1–p3,p6–p20]`. Any later `EP-C16` is constrained by `PUE-C16`; the label did not silently authorize all pages.

**Verdict**

PASS

**Boundary note**

This does not define what “limited” means outside the supplied fixture effect.

### Case C17 — Partial permission does not expand

**Purpose**

Verify the central partial-scope boundary.

**Fixture**

`SM-C17 v1[p1–p20]`; `EUA-C17` proposes all pages. `PR-C17` under `Rule-C17 v1` permits only `[p4–p5]` for `P-C17`.

**Manual verification**

Compare proposed, permitted, prohibited, presented, and eligible scopes.

**Expected**

Permitted scope is exactly `[p4–p5]`; the source remains `[p1–p20]` and is not promoted.

**Observed**

`EUA-C17` retains proposed `[p1–p20]`, while `PUE-C17` permits only `SM-C17 v1[p4–p5]` and identifies the remaining pages as outside this use. No `EP-C17` or `RM-C17` may validly contain pages beyond `[p4–p5]` under this effect.

**Verdict**

PASS

**Boundary note**

This does not determine a later separately supplied permission for another scope.

### Case C18 — Permission is purpose-specific

**Purpose**

Verify P1 permission does not transfer to P2.

**Fixture**

`PR-C18` permits `SM-C18 v1[p2]` for purpose `P1-C18` only. `EUA-C18B` requests the same scope for `P2-C18` without another rule/effect.

**Manual verification**

Inspect purpose on the permission, second attempt, presentation, and any materialization eligibility.

**Expected**

P1 is permitted; P2 remains unpermitted.

**Observed**

`PUE-C18` names only `P1-C18`. `EUA-C18B` has purpose `P2-C18` but no applicable effect; no `EP-C18B` or `RM-C18B` is valid. The shared source/scope did not erase purpose identity.

**Verdict**

PASS

**Boundary note**

This does not test a supplied rule that expressly permits both purposes.

### Case C19 — Permission is witness-specific

**Purpose**

Verify permission for one witness does not transfer to another.

**Fixture**

`PR-C19` permits `SM-C19 v1[p3]` for witness `W1-C19` and purpose `P-C19`. `EUA-C19B` requests use with `W2-C19` without a new effect.

**Manual verification**

Inspect witness target on `PUE-C19`, `EUA-C19B`, and any presentation.

**Expected**

Only W1 is covered by the effect.

**Observed**

`PUE-C19` scopes permission to `W1-C19`; `EUA-C19B` names `W2-C19` and is not covered. No `EP-C19B` is valid, and no witness answer is fabricated for either witness.

**Verdict**

PASS

**Boundary note**

This does not define witness-examination doctrine.

### Case C20 — Pending ruling with no implicit result

**Purpose**

Verify pending state remains unresolved.

**Fixture**

`EUA-C20` and `OE-C20` exist. `PR-C20` has supplied state `pending` under `Rule-C20 v1`; the rule provides no interim permission or disallowance.

**Manual verification**

Inspect ruling state, effect, presentation, and RM eligibility.

**Expected**

No allow/deny is inferred; no presentation proceeds absent a supplied interim effect.

**Observed**

`PR-C20` remains pending against `EUA-C20[SM-C20 v1[p1],P-C20]`. There is no permitted or prohibited `PUE-C20`, no `EP-C20`, and no `RM-C20`. The pending event and order remain queryable.

**Verdict**

PASS

**Boundary note**

This does not decide how another supplied pending rule handles interim use.

### Case C21 — Deferred ruling with supplied conditional effect

**Purpose**

Verify a deferred ruling can preserve a supplied interim state and later append a resolution.

**Fixture**

`PR-C21A` is deferred under `Rule-C21 v1`, which permits only conditional display of `SM-C21 v1[p2]` to `W-C21` pending source confirmation. Later `PR-C21B` resolves the condition and permits `[p2]` for `P-C21`.

**Manual verification**

Inspect both ruling identities, interim effect, effective points, and presentation history.

**Expected**

Conditional interim use is limited to the supplied effect; later resolution appends and does not rewrite `PR-C21A`.

**Observed**

`PR-C21A` remains deferred and its `PUE-C21A` permits only the specified conditional display. `PR-C21B` later records the supplied resolution and creates its own effective permission. The two rulings remain ordered and distinct; no earlier event was rewritten.

**Verdict**

PASS

**Boundary note**

This does not establish a universal rule for deferred proceedings.

### Case C22 — Permitted use actually presented

**Purpose**

Verify actual presentation carries exact source, scope, purpose, and actor.

**Fixture**

`PUE-C22` permits `SM-C22 v2[p4–p5]` for `P-C22`. Actor `A-C22` performs the permitted use in `Prc-C22`, producing `EP-C22`.

**Manual verification**

Inspect `EP-C22` against the effect and source version.

**Expected**

`EP-C22` exists and is no broader than the effective permission.

**Observed**

`EP-C22` records actor `A-C22`, proceeding `Prc-C22`, source `SM-C22 v2`, scope `[p4–p5]`, and purpose `P-C22`, linked to `PUE-C22`. No truth, finding, or CourtRecord entry was created merely by the presentation.

**Verdict**

PASS

**Boundary note**

This does not establish that `EP-C22` is record-materializable.

### Case C23 — Disallowed attempt produces no presentation

**Purpose**

Verify a disallowed attempt is not represented as shown material.

**Fixture**

`PR-C23` creates `PUE-C23` disallowing `EUA-C23` for `SM-C23 v1[p1]` and `P-C23`. No revised attempt exists.

**Manual verification**

Inspect the attempted transition `EUA-C23 → EP-C23` and history of the disallowance.

**Expected**

No `EP-C23` or RM exists for the disallowed attempt.

**Observed**

`EUA-C23` and `PR-C23/PUE-C23` remain in history, but `EP-C23` is absent because the exact `[p1]` use was disallowed. The source was not deleted or marked false, and no CourtRecord side effect occurred.

**Verdict**

PASS

**Boundary note**

This does not prevent a later authorized revised attempt.

### Case C24 — Presentation narrower than permission

**Purpose**

Verify actual presentation may be narrower than the permitted scope but not broader.

**Fixture**

`PUE-C24` permits `SM-C24 v1[p4–p5]` for `P-C24`. Actor presents only `[p4]` as `EP-C24`.

**Manual verification**

Compare `EP-C24` scope to `PUE-C24` permitted scope.

**Expected**

`EP-C24[p4]` is valid because it is narrower; page `[p5]` is not silently included.

**Observed**

`EP-C24` references `SM-C24 v1[p4]`, purpose `P-C24`, and parent effect `PUE-C24[p4–p5]`. No `[p5]` or broader page range appears in the presentation, and no materialization is inferred.

**Verdict**

PASS

**Boundary note**

This does not establish that a narrower presentation must be materialized.

### Case C25 — Disallowed question integration

**Purpose**

Verify objection/ruling integration with DEC-029 without redefining witness objects.

**Fixture**

`QuestionAttempt QA-C25` is linked to `EUA-C25` and targeted by `OE-C25`. `PR-C25` disallows `QA-C25` under supplied `Rule-C25 v1`. No independent re-attempt occurs.

**Manual verification**

Inspect `QuestionProceduralResult`, answer/testimony objects, and preserved question/ruling history.

**Expected**

The inherited result reflects disallowance; no substantive `WitnessAnswer` arises from `QA-C25`.

**Observed**

`QPR-C25` references `QA-C25`, `OE-C25`, `PR-C25`, and disallowed effect. No `WA-C25` or `TE-C25` is generated from that question attempt. `QA-C25`, `OE-C25`, and `PR-C25` remain distinct historical objects.

**Verdict**

PASS

**Boundary note**

This does not redefine the inherited answer-generation boundary.

### Case C26 — Narrowed question re-attempt

**Purpose**

Verify a narrowed question is a new linked attempt.

**Fixture**

`QA-C26A` asks the original supplied question; `OE-C26` targets it. Cure `RC-C26` narrows the wording, creating `QA-C26B` under the supplied examination path.

**Manual verification**

Compare question identities, original content, revised content, parent link, and later result.

**Expected**

`QA-C26A` remains historical; `QA-C26B` is separately identifiable.

**Observed**

`QA-C26A` retains its original question and `OE-C26` target. `RC-C26` links to new `QA-C26B`; the revised question has its own order and can receive its own `QuestionProceduralResult`. No field on `QA-C26A` was overwritten and no answer was forced.

**Verdict**

PASS

**Boundary note**

This does not establish whether the narrowed question is permitted.

### Case C27 — Permitted document use does not force witness agreement

**Purpose**

Verify independent witness response after permitted presentation.

**Fixture**

`PUE-C27` permits `SM-C27 v1[p2]` for confrontation with `W-C27`; `EP-C27` presents it. The inherited witness path produces `WA-C27` stating “I do not recognize this.”

**Manual verification**

Inspect presentation scope, witness answer identity/content, and any automatic recognition/agreement or credibility score.

**Expected**

The witness answer may disagree or fail recognition; no favorable answer, truth, or credibility score is forced.

**Observed**

`EP-C27` presents exactly `SM-C27 v1[p2]` under `PUE-C27`. `WA-C27` is a separate inherited answer by `W-C27` stating non-recognition. No agreement, `Truth(X)`, `CredibilityScore`, `CFF-C27`, or JII is created by the permitted presentation.

**Verdict**

PASS

**Boundary note**

This does not evaluate the truth or credibility of the answer.

### Case C28 — Presentation and permission without RM

**Purpose**

Verify the CourtRecord materialization gate.

**Fixture**

`PUE-C28` permits `SM-C28 v1[p4–p5]` for `P-C28`; `EP-C28` presents `[p4–p5]`. No `RecordMaterializationEvent` is supplied.

**Manual verification**

Inspect `PUE-C28`, `EP-C28`, RM existence, and `CourtRecordEntry` existence.

**Expected**

Presentation may exist, but no `CourtRecordEntry` exists without valid RM.

**Observed**

`PUE-C28` and `EP-C28` both identify `SM-C28 v1[p4–p5]` and `P-C28`. There is no `RM-C28` and no `CR-C28`; permission and presentation remain historical procedural state, not canonical CourtRecord content.

**Verdict**

PASS

**Boundary note**

This does not test DEC-031’s own RM-to-entry scope validation.

---

## 4. Focused architecture attacks

### Case A01 — Selection promoted to admitted material

**Purpose**

Reject `PresentationSelection PS-A01 → AdmittedMaterial AM-A01`.

**Fixture**

`SM-A01 v1[p1]` and `PS-A01` exist; no actor creates an attempt.

**Manual verification**

Attempted transition: `PS-A01 → AM-A01`.

Permitted state: `PS-A01` remains selection only; later use requires an actor and supplied procedural path.

**Expected**

No `AM-A01`, attempt, ruling, presentation, or RM is created.

**Observed**

`PS-A01` still points to `SM-A01 v1[p1]` as internal preparation. The forbidden `AM-A01` object does not exist; no courtroom or record history was created.

**Verdict**

PASS

**Boundary note**

No legal status of the source is tested.

### Case A02 — Attempt automatically presented

**Purpose**

Reject `EUA-A02 → EP-A02` where permission is required.

**Fixture**

`EUA-A02` proposes `SM-A02 v1[p1]` under `Rule-A02 v1`, which requires permission. No effect exists.

**Manual verification**

Attempted transition: `EUA-A02 → EP-A02`.

Permitted state: `EUA-A02` remains unpresented/pending until an explicit effect.

**Expected**

No `EP-A02`, RM, or entry exists.

**Observed**

`EUA-A02` remains the only action referencing `SM-A02 v1[p1]`; `EP-A02` is absent because `Rule-A02 v1` has no permission effect. The exact attempt history remains inspectable.

**Verdict**

PASS

**Boundary note**

This does not test a rule that explicitly permits uncontested use.

### Case A03 — Objection automatically becomes ruling

**Purpose**

Reject `OE-A03 → PR-A03`.

**Fixture**

`EUA-A03` proposes `SM-A03 v1[p2]`; `OE-A03` cites `Ground-A03`. No decision-maker event exists.

**Manual verification**

Attempted transition: `OE-A03 → PR-A03`.

Permitted state: `OE-A03` remains a challenge awaiting supplied authority/action.

**Expected**

No `PR-A03` or `PUE-A03` exists.

**Observed**

`OE-A03` remains linked to `EUA-A03[SM-A03 v1[p2]]`; no `PR-A03`, effect, exclusion, or presentation appears. The objection did not decide itself.

**Verdict**

PASS

**Boundary note**

No ruling taxonomy is tested.

### Case A04 — Ground count becomes strength

**Purpose**

Reject `OE-A04[Ground-A/B/C] → ObjectionStrength=3`.

**Fixture**

`OE-A04` targets `EUA-A04` and carries three supplied ground references.

**Manual verification**

Attempted transition: `Ground-A04A/Ground-A04B/Ground-A04C → ObjectionStrength-A04`.

Permitted state: each ground remains a separate reference; only an authorized ruling may create effect.

**Expected**

No score or automatic exclusion exists.

**Observed**

The three ground IDs remain on `OE-A04` with their target scope and rule references. `ObjectionStrength-A04` is absent; no ruling or scope change was generated from count.

**Verdict**

PASS

**Boundary note**

This does not assess the supplied grounds’ legal content.

### Case A05 — Three objections become stronger exclusion

**Purpose**

Reject objection multiplicity as an exclusion algorithm.

**Fixture**

`EUA-A05` is targeted separately by `OE-A05A`, `OE-A05B`, and `OE-A05C`; no authorized ruling exists.

**Manual verification**

Attempted transition: `OE-A05A/B/C → stronger exclusion of SM-A05`.

Permitted state: three ordered objections remain separate and unresolved.

**Expected**

No exclusion effect or score exists.

**Observed**

All three objections retain distinct actor/order/ground links to `EUA-A05`; no `PUE-A05` disallowing scope exists. The count did not change presentation or record eligibility.

**Verdict**

PASS

**Boundary note**

This does not prevent an authorized ruling considering multiple objections under a supplied rule.

### Case A06 — Partner reputation forces a ruling

**Purpose**

Reject actor reputation as a procedural outcome input.

**Fixture**

Senior partner `L-A06` creates `OE-A06` against `EUA-A06`; no supplied rule authorizes reputation as an input and no ruling is supplied.

**Manual verification**

Attempted transition: `professional reputation(L-A06) → favorable PR-A06`.

Permitted state: `OE-A06` remains a procedural challenge; any ruling requires authorized supplied inputs.

**Expected**

No favorable ruling or effect is created.

**Observed**

`OE-A06` records `L-A06` as actor and its exact target. No `PR-A06` or favorable `PUE-A06` exists; partner status did not mutate the attempted-use state.

**Verdict**

PASS

**Boundary note**

This does not prohibit a supplied rule from recording actor eligibility where explicitly authored.

### Case A07 — Skill score forces favorable procedure

**Purpose**

Reject `EvidenceSkill=95` or `CourtroomSkill=95` as a ruling shortcut.

**Fixture**

Lawyer `L-A07` has fixture metadata `EvidenceSkill=95` and `CourtroomSkill=95`; `EUA-A07` and `OE-A07` exist without an outcome rule.

**Manual verification**

Attempted transition: `EvidenceSkill/CourtroomSkill → favorable PR-A07`.

Permitted state: observable work components may improve; procedural result remains supplied-event dependent.

**Expected**

No favorable ruling, permission, or exclusion is forced.

**Observed**

`EUA-A07` and `OE-A07` retain their original target/scope. No `PR-A07` or `PUE-A07` appears from either score; no hidden probability was consulted.

**Verdict**

PASS

**Boundary note**

This does not test a DEC-017/018 component change in preparation quality.

### Case A08 — Partial permission expands to whole source

**Purpose**

Reject `p4–p5 permission → p1–p20 presentation/materialization`.

**Fixture**

`PR-A08/PUE-A08` permits `SM-A08 v1[p4–p5]` only. A later action requests `EP-A08` and `RM-A08` over `[p1–p20]`.

**Manual verification**

Attempted transition: `PUE-A08[p4–p5] → EP-A08/RM-A08[p1–p20]`.

Permitted state: presentation and RM may use `[p4–p5]` or a narrower scope only.

**Expected**

The broad presentation/RM is invalid; no silent scope expansion occurs.

**Observed**

`PUE-A08` remains limited to `SM-A08 v1[p4–p5]`. The proposed `[p1–p20]` operation is not covered; no valid `EP-A08` or `RM-A08` with that scope exists, and the original effect/history remains intact.

**Verdict**

PASS

**Boundary note**

This does not preclude a later explicit rule for pages outside `[p4–p5]`.

### Case A09 — Marked exhibit becomes admitted automatically

**Purpose**

Reject `MarkedMaterial A-A09 → AdmittedMaterial A-A09`.

**Fixture**

`MarkingEvent ME-A09` identifies `SM-A09 v1[p1]`; no permission or ruling exists.

**Manual verification**

Attempted transition: `ME-A09 → admitted material`.

Permitted state: the marking event remains an organizational/procedural hook.

**Expected**

No admission, presentation, RM, or truth state follows automatically.

**Observed**

`ME-A09` records the source/version/scope and marking actor. No permission effect or entry is created; the label `marked` did not become `admitted`.

**Verdict**

PASS

**Boundary note**

This does not define exhibit terminology.

### Case A10 — Permitted material becomes truth

**Purpose**

Reject `ProcedurallyPermittedMaterial PPM-A10 → Truth(X)`.

**Fixture**

`PUE-A10` permits `SM-A10 v1[p2]` for `P-A10`; derived `PPM-A10` exists.

**Manual verification**

Attempted transition: `PPM-A10 → Truth(X-A10)`.

Permitted state: exact permission remains procedural and contextual.

**Expected**

No objective truth state is created.

**Observed**

`PPM-A10` contains source/version/scope/purpose and its parent effect. `Truth(X-A10)` is absent; permission did not alter ActualStateRecord, JII, or finding state.

**Verdict**

PASS

**Boundary note**

This does not evaluate any later adjudicative use.

### Case A11 — Permitted material becomes a finding

**Purpose**

Reject direct `PPM-A11 → CourtFactFinding CFF-A11`.

**Fixture**

`PPM-A11` permits `SM-A11 v1[p3]` for `P-A11`; no adjudicative event exists.

**Manual verification**

Attempted transition: `PPM-A11 → CFF-A11`.

Permitted state: later adjudication may consume authorized snapshot content under its own DEC, but no finding is created here.

**Expected**

No CFF, JII, or judgment exists.

**Observed**

`PPM-A11` remains a derived procedural view. `CFF-A11`, JII, and judgment objects are absent, with source/ruling provenance intact.

**Verdict**

PASS

**Boundary note**

This does not test adjudication semantics.

### Case A12 — Permission bypasses RM

**Purpose**

Reject `PPM-A12 → CourtRecordEntry CR-A12` without RM.

**Fixture**

`PUE-A12` permits `SM-A12 v1[p1]`; `PPM-A12` exists; no `RM-A12` exists.

**Manual verification**

Attempted transition: `PPM-A12 → CR-A12`.

Permitted state: `PPM-A12` may be a candidate input to a later valid RM only.

**Expected**

No `CR-A12` exists.

**Observed**

`PPM-A12` retains its effect/source lineage, but `CR-A12` is absent because no `RM-A12` was supplied. DEC-032 did not bypass DEC-030/031.

**Verdict**

PASS

**Boundary note**

This does not repeat DEC-031’s full entry schema verification.

### Case A13 — Presentation forces witness agreement

**Purpose**

Reject `EP-A13 → WitnessAnswer agreeing with material`.

**Fixture**

`PUE-A13` permits `SM-A13 v1[p4]` to be shown to witness `W-A13`; `EP-A13` occurs. The inherited answer fixture supplies disagreement.

**Manual verification**

Attempted transition: `EP-A13 → WA-A13 agrees`; inspect actual `WA-A13` and hidden witness state.

**Expected**

Presentation exists, but answer content remains independently determined by inherited witness semantics.

**Observed**

`EP-A13` contains only `SM-A13 v1[p4]`; `WA-A13` records the supplied disagreement. No forced agreement, hidden memory read, credibility score, or finding exists.

**Verdict**

PASS

**Boundary note**

This does not test truth of either source or answer.

### Case A14 — Later exclusion deletes earlier history

**Purpose**

Reject history deletion after a later procedural change.

**Fixture**

`EUA-A14 → OE-A14 → PR-A14/PUE-A14 → EP-A14` is complete. Later `PR-A14B` limits future use.

**Manual verification**

Attempted transition: `PR-A14B → delete EUA-A14/OE-A14/PR-A14/EP-A14`.

Permitted state: later effect changes future use only; records use DEC-031 if already materialized.

**Expected**

All earlier events remain queryable.

**Observed**

`EUA-A14`, `OE-A14`, `PR-A14`, `PUE-A14`, and `EP-A14` retain stable identities and original order after `PR-A14B`. No deletion occurred; any canonical record-side limitation is outside DEC-032 and belongs to DEC-031.

**Verdict**

PASS

**Boundary note**

This does not decide the supplied downstream status of an existing entry.

### Case A15 — Narrowed retry overwrites original

**Purpose**

Reject `EUA-A15B[p4–p5] → overwrite EUA-A15A[p1–p20]`.

**Fixture**

`EUA-A15A` is challenged; cure creates `EUA-A15B` with narrowed scope `[p4–p5]`.

**Manual verification**

Attempted transition: `EUA-A15B → replace/delete EUA-A15A`.

Permitted state: both attempts remain linked and independently inspectable.

**Expected**

No overwrite or deletion occurs.

**Observed**

`EUA-A15A` still contains proposed `[p1–p20]` and its objection; `EUA-A15B` contains `[p4–p5]`, its cure lineage, and new order. The retry did not rewrite the original attempt.

**Verdict**

PASS

**Boundary note**

This does not grant permission to either attempt.

### Case A16 — Pending/deferred collapses into allow or deny

**Purpose**

Reject implicit binary resolution of a pending/deferred state.

**Fixture**

`PR-A16` is `pending` under `Rule-A16 v1`; the supplied rule provides no interim effect.

**Manual verification**

Attempted transitions: `PR-A16[pending] → permitted` and `PR-A16[pending] → disallowed` without a later event.

Permitted state: pending identity/order/effect remain unchanged until supplied resolution.

**Expected**

Neither binary state is inferred.

**Observed**

`PR-A16` remains pending with no permission or prohibition effect, and no `EP-A16` or RM is valid. There is no later ruling to resolve it; reload preserves the pending state.

**Verdict**

PASS

**Boundary note**

This does not test a rule that supplies an interim limited effect.

---

## 5. Supplemental fixture matrices

The following fixtures are compact because their risks are lower than the 44 detailed cases above. Each still requires manual inspection of the named objects and exact transition.

### 5.1 Uncontested and no-ruling-needed fixtures

| ID | Fixture and inspection | Expected | Status |
|---|---|---|---|
| U01 | `EUA-U01` has no objection and no no-ruling-needed authority | Silence creates no `PUE-U01`, presentation, or RM | PASS |
| U02 | `Rule-FIX-Uncontested-U02 v1` explicitly creates effect for `EUA-U02` | `PUE-U02` exists under that authority; no objection is fabricated | PASS |
| U03 | Opponent takes no action against `EUA-U03` | No general permission, truth, or CourtRecord status follows | PASS |
| U04 | `EUA-U04 → PUE-U04 → EP-U04`; later `OE-U04B/PR-U04B` challenges future use | Earlier events remain; later effect is prospective/scope-specific | PASS |

### 5.2 Requirement/ruling fixtures

| ID | Fixture and inspection | Expected | Status |
|---|---|---|---|
| R01 | `RE-R01` says requirement satisfied; no ruling | No `PR-R01` or permission | PASS |
| R02 | `RE-R02` says requirement not satisfied; no supplied authority creates ruling | No ruling is inferred from evaluation result alone | PASS |
| R03 | Supplied `CE-R03` explicitly has both roles | Both evaluation and ruling role, target, inputs, rule, authority, and effect are inspectable | PASS |
| R04 | `RE-R04` attempts to inspect hidden ActualStateRecord/judge belief | Invalid rule evaluation; hidden state is not an authorized input | PASS |

### 5.3 Multiple objections and grounds

| ID | Fixture | Expected | Status |
|---|---|---|---|
| O01 | `OE-O01` with one ground | One traceable ground; no strength score | PASS |
| O02 | `OE-O02` with three grounds | Three distinct grounds; no count bonus | PASS |
| O03 | `OE-O03A/B` from two actors against one attempt | Separate actor/order histories | PASS |
| O04 | `OE-O04A/B` target different scopes | Effects, if later supplied, remain scope-specific | PASS |
| O05 | `OW-O05` withdraws one ground while another remains | Ground history preserved; remaining ground not deleted | PASS |
| O06 | `PR-O06A` resolves one objection while another remains pending | One effect does not resolve unrelated objection | PASS |

### 5.4 Response, cure, and revision

| ID | Fixture | Expected | Status |
|---|---|---|---|
| RC01 | `RC-RC01` merely argues against `OE-RC01` | No permission without supplied effect | PASS |
| RC02 | `RC-RC02` supplies missing source reference | Cure event exists; permission still requires result/effect | PASS |
| RC03 | `RC-RC03` narrows scope | Original and linked new attempt both remain | PASS |
| RC04 | `RC-RC04` changes purpose P1 to P2 | New purpose-specific attempt; P1 effect does not transfer | PASS |
| RC05 | `RC-RC05` replaces source A with B | A and B source/version lineages remain distinct | PASS |
| RC06 | `Rule-RC06` rejects cure | No permission or presentation fabricated | PASS |

### 5.5 Partial-scope fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| PS01 | `SM-PS01[p1–p20]`; `PUE-PS01[p4–p5]` | Permitted scope exactly `[p4–p5]` | PASS |
| PS02 | `EP-PS02[p4]` under permission `[p4–p5]` | Narrower presentation valid | PASS |
| PS03 | `EP-PS03[p4–p6]` under permission `[p4–p5]` | Page p6 cannot pass silently | PASS |
| PS04 | `RM-PS04[p5]` under permission `[p4–p5]` | Potentially valid if other RM rules hold | PASS |
| PS05 | `RM-PS05[p4–p8]` under permission `[p4–p5]` | Broader RM is invalid | PASS |
| PS06 | Later `PR-PS06` separately permits p6 | New effect; prior p4–p5 history is unchanged | PASS |

### 5.6 Pending/deferred fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| PD01 | `PR-PD01=pending` with no interim effect | No allow/deny | PASS |
| PD02 | Supplied pause effect for `PR-PD02` | Only pause is applied | PASS |
| PD03 | Supplied limited interim use for `PR-PD03` | Only named interim scope/purpose proceeds | PASS |
| PD04 | Later `PR-PD04B` resolves `PR-PD04A` | New ruling appends; pending history remains | PASS |
| PD05 | Reload pending `PR-PD05` | Same pending identity/effect/order | PASS |

### 5.7 Witness integration

| ID | Fixture | Expected | Status |
|---|---|---|---|
| W01 | `QA-W01 → OE-W01 → PR-W01 disallowed` | `QPR-W01` reflects result; no substantive `WA-W01` | PASS |
| W02 | Narrowed `QA-W02B` follows `QA-W02A` | Original question remains; new linked question exists | PASS |
| W03 | Permitted material shown to `W03` | `EP-W03` may occur; answer remains independent | PASS |
| W04 | `WA-W04` says “I do not recognize this” | No forced recognition or credibility score | PASS |
| W05 | `WA-W05` contradicts shown material | Inherited contradiction may exist; no Truth/CredibilityScore | PASS |
| W06 | Material shown and witness gives no substantive answer | No fabricated testimony | PASS |

### 5.8 Presentation/RM fixtures

| ID | Fixture | Expected | Status |
|---|---|---|---|
| M01 | `PUE-M01` exists; actor never presents | No `EP-M01` | PASS |
| M02 | `EP-M02` exists; no RM | No `CR-M02` | PASS |
| M03 | Permission p4–p5; RM p5 | Exact narrower scope can be valid under DEC-031 | PASS |
| M04 | Permission p4–p5; RM p1–p20 | RM cannot rely on permission | PASS |
| M05 | Supplied presentation-only effect | Presentation may occur; no eligibility inferred | PASS |
| M06 | Supplied record-eligible effect; no RM | No CourtRecord entry | PASS |

### 5.9 Already-recorded material

| ID | Fixture | Expected | Status |
|---|---|---|---|
| AR01 | `EUA-AR01 → PR-AR01/PUE-AR01 → EP-AR01 → RM-AR01 → CR-AR01`; later `PR-AR02` changes future use | Earlier DEC-032 history and `CR-AR01` remain; record-side effect is DEC-031; old snapshot is immutable | PASS |

### 5.10 Withdrawal

| ID | Fixture | Expected | Status |
|---|---|---|---|
| WD01 | `OW-WD01` withdraws objection | Objection history remains; attempt is not auto-withdrawn | PASS |
| WD02 | `EUA-WD02` withdrawn | Attempt history and objections remain | PASS |
| WD03 | Attempt withdrawn before presentation | No presentation unless another valid attempt occurs | PASS |
| WD04 | Withdrawal after response/cure | All events remain ordered | PASS |
| WD05 | Existing `CR-WD05` later sought to be withdrawn | DEC-032 cannot delete; DEC-031 owns record effect | PASS |

### 5.11 Visibility

| ID | Fixture | Expected | Status |
|---|---|---|---|
| V01 | Player sees source/scope/ruling but reason is restricted | Canonical ruling/effect remains; projection is limited | PASS |
| V02 | Material is visible in UI | Visibility does not create universal use permission | PASS |
| V03 | Rule exists but full text is not player-visible | Rule/effect still governs supplied state | PASS |
| V04 | Hidden judge belief exists | Not exposed and not used as rule input | PASS |
| V05 | Future ruling exists beyond current state | Current projection cannot expose it | PASS |
| V06 | No canonical best objection | No oracle or success percentage | PASS |

### 5.12 Capability/workload

| ID | Fixture | Expected | Status |
|---|---|---|---|
| K01 | Lawyer identifies missing supplied requirement | Observable WorkProduct/action improves only | PASS |
| K02 | Lawyer narrows scope | New exact attempt/revision; no forced ruling | PASS |
| K03 | Lawyer prepares clearer cure response | Response quality observable; no success bonus | PASS |
| K04 | Senior partner objects | Seniority alone does not affect result | PASS |
| K05 | Evidence task assigned under DEC-026 | Time/capacity consumed; no free action pool | PASS |
| K06 | Owner/reviewer differs from actor | Actual courtroom actor remains exact actor | PASS |

### 5.13 Player/NPC symmetry

| ID | Fixture | Expected | Status |
|---|---|---|---|
| PN01 | Player and NPC receive equivalent source/scope/rule conditions; both proceed through attempt, objection, response, ruling/effect, presentation, and RM eligibility | NPC may compress presentation but preserves all equivalent identities, history, provenance, and RM gate; no `AdmissibilitySuccess` or hidden result percentage | PASS |

### 5.14 Reload and terminal history

| ID | Fixture | Expected | Status |
|---|---|---|---|
| H01 | Reload `EUA-H01 + OE-H01 + PR-H01` | Same identities, order, and effects | PASS |
| H02 | Reload pending `PR-H02` | Still pending absent later event | PASS |
| H03 | Reload original and narrowed attempts | Both remain queryable | PASS |
| H04 | Settlement/judgment/closure after procedural history | History is not erased | PASS |
| H05 | Appeal/remand after evidence contest | Prior procedural events remain queryable | PASS |

---

## 6. Inherited-boundary coverage

| Inherited boundary | Meaningful fixtures | Status |
|---|---|---|
| DEC-017/018 | A07, K01–K03, K04 | PASS: component/work-product effects do not force outcomes or create universal skill scores |
| DEC-019 / Case File | C01, C02, A01, A10, V02–V04 | PASS: authorized source access is distinct from courtroom permission and hidden state |
| DEC-025 | A09, C22–C24, M01–M06 | PASS: marking, presentation, permission, admission hooks, and record remain distinct |
| DEC-026 | K05–K06, C02, C22 | PASS: workload and owner/reviewer/actor roles remain separate |
| DEC-029 | C25–C27, W01–W06, A13 | PASS: question, result, answer, and testimony remain inherited specialized objects |
| DEC-030 | C08, C15, C22–C24, C28, M01–M06, AR01 | PASS: event ordering/hooks and explicit RM boundary remain intact |
| DEC-031 | C28, A12, M02–M06, AR01, WD05, H04–H05 | PASS: entry creation and record-side history remain DEC-031-owned |

---

## 7. Coverage matrix

### 7.1 Design decisions EOP1–EOP43

| DEC-032 decision | Fixture coverage | Status |
|---|---|---|
| EOP1–EOP2 attempt identity/selection | C01–C04, A01–A02 | PASS |
| EOP3–EOP4 version/exact scope | C02, C13–C17, A08, PS01–PS06 | PASS |
| EOP5–EOP6 purpose/context | C02, C18–C19, C22, A08, U04 | PASS |
| EOP7 marking/designation | A09, M01 | PASS |
| EOP8–EOP11 rule and requirement interface | C05–C07, R01–R04, C15–C16 | PASS |
| EOP12–EOP17 objection identity/target/grounds/effect | C08–C11, A03–A06, O01–O06 | PASS |
| EOP18–EOP20 response/cure/revision | C12–C14, A15, RC01–RC06, C26 | PASS |
| EOP21–EOP24 ruling/result/effect | C15–C16, C20–C21, A03, A16, PD01–PD05 | PASS |
| EOP25–EOP26 partial/excluded scope | C16–C17, C23–C24, A08, PS01–PS06 | PASS |
| EOP27 withdrawal | C11, A14, WD01–WD05 | PASS |
| EOP28–EOP29 pending/uncontested | C04, C20–C21, A16, U01–U04, PD01–PD05 | PASS |
| EOP30–EOP31 presentation integration | C22–C24, A02, A08, M01–M06 | PASS |
| EOP32–EOP33 witness integration | C25–C27, A13, W01–W06 | PASS |
| EOP34 advocacy integration | C02, C18, V02, M05 | PASS |
| EOP35–EOP36 materialization eligibility/RM gate | C28, A12, M02–M06, AR01 | PASS |
| EOP37–EOP38 append-only/reconsideration | C11, C13–C14, C21, A14–A16, AR01, H01–H05 | PASS |
| EOP39 visibility | V01–V06, A10, A11 | PASS |
| EOP40 capability | A06–A07, K01–K04 | PASS |
| EOP41 workload | K05–K06 | PASS |
| EOP42 player/NPC symmetry | PN01, V01–V06, H01–H05 | PASS |
| EOP43 doctrine ownership | C05–C07, R01–R04, A03–A05, all supplied-rule fixtures | PASS |

### 7.2 Hard invariants 1–100

| Invariants | Primary coverage | Status |
|---|---|---|
| 1–10 | C01–C03, C13–C14, A01–A02, A15 | PASS |
| 11–19 | C02, C17–C19, C22–C24, A08–A09 | PASS |
| 20–27 | C05–C07, R01–R04, A06–A07 | PASS |
| 28–40 | C08–C11, A03–A06, O01–O06 | PASS |
| 41–45 | C12–C14, C26, RC01–RC06, A15 | PASS |
| 46–55 | C15–C16, C20–C21, A03, A16, PD01–PD05 | PASS |
| 56–61 | C17–C19, C22–C24, A08, A10–A11, PS01–PS06 | PASS |
| 62–69 | C11, C22–C24, A14, WD01–WD05, M01–M06 | PASS |
| 70–75 | C25–C27, A13, W01–W06 | PASS |
| 76–80 | C28, A10–A12, M02–M06 | PASS |
| 81–86 | C11, C13–C14, C21, A14–A16, AR01, H01–H05 | PASS |
| 87–90 | V01–V06, A10–A11 | PASS |
| 91–96 | A06–A07, K01–K06 | PASS |
| 97–100 | PN01, A07, R04, H01–H05 | PASS |

No hard-invariant range is unassigned. The matrix is compact; the detailed fixtures above supply the object-level evidence.

---

## 8. False-PASS audit

The completed review specifically checked:

- no-objection silence is not treated as permission; only U02 has supplied no-ruling-needed authority;
- `RequirementEvaluation` is not treated as a ruling except in C06/R03, where one supplied event explicitly preserves both roles;
- `ObjectionEvent` does not become `ProceduralRuling` without authorized action;
- every operative ruling used in detailed cases has an exact scope/effect, not merely a label;
- no partial permission expands to the whole source;
- purpose and witness permissions do not transfer;
- pending/deferred states remain unresolved unless supplied interim or later effects exist;
- permitted presentation does not force a witness answer;
- no detailed case creates a CourtRecord entry without RM;
- later procedural changes do not delete history or mutate prior snapshots;
- no hidden judge, truth, credibility, or weight state is used;
- no capability, partner status, or NPC percentage forces a result;
- reload cases preserve identity/order/effect; and
- no expected/observed contradiction was identified.

### Repetition/template audit

- Generic repeated verification sentences in 5+ unrelated detailed cases: 0 identified.
- Attack-label pseudo-objects: 0; every attack names a concrete fixture object or explicit forbidden target.
- Empty attempted transitions: 0.
- Expected/Observed semantic contradictions: 0.
- Generic “objection succeeded” without a ruling/effect: 0.
- Vague “admitted” state used as a result without source/scope/rule context: 0.

---

## 9. Final summary

**Total detailed cases:** 44 (C01–C28 and A01–A16)  
**PASS:** 44  
**PARTIAL:** 0  
**FAIL:** 0

**Architecture blocker for DEC-032 promotion?** No.  
**Inherited DEC contradiction?** No.  
**No-objection permission leak?** No; U01/U02/U03 distinguish silence from explicit authority.  
**RequirementEvaluation/ruling collapse?** No; C05–C07 and R01–R04 preserve the distinction.  
**Objection/ruling collapse?** No; C08–C11 and A03–A05 preserve separate events.  
**Scope expansion?** No; C16–C17, A08, and PS01–PS06 reject it.  
**Purpose leakage?** No; C18–C19 and RC04 reject it.  
**Pending/deferred collapse?** No; C20–C21, A16, and PD01–PD05 preserve unresolved/interim state.  
**Witness-answer forcing?** No; C25–C27, A13, and W01–W06 preserve DEC-029 boundaries.  
**RM gate violation?** No; C28, A12, M02–M06, and AR01 preserve the gate.  
**CourtRecord ownership violation?** No; AR01 and WD05 route record-side effects to DEC-031.  
**History rewrite?** No; C11/C13/C14/C21, A14–A16, and H01–H05 preserve append-only history.  
**Hidden-state use?** No; R04, A06–A07, A10–A11, V01–V06 reject it.  
**Capability/reputation shortcut?** No; A06–A07 and K01–K04 reject it.  
**Player/NPC divergence?** No; PN01 preserves equivalent ontology.  
**Reload instability?** No; PD05 and H01–H03 preserve state.  
**Truth/JII/finding shortcut?** No; A10–A12, C27–C28, and M02–M06 reject it.

### Promotion recommendation

Based on the fixture results, recommend:

```text
DEC-032 v0.1
→ v0.2 Accepted

TEST-031 v0.1
→ v0.2 Accepted / manual fixture-level verification
```

No genuine semantic ambiguity requires reopening DEC-032. Any later change to authored procedural doctrine, exact terminology, or implementation should be reviewed as a supplied-rule or later-DEC change and must preserve the boundaries verified here.
