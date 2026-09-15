# THE FIRM — TEST-026 Client Interaction and Advice

문서 ID: TEST-026  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
대상: `DEC-LITIGATION-027_CLIENT_INTERACTION_AND_ADVICE.md` v0.1 Proposed / design review required

## 1. Purpose

DEC-027 semantics를 synthetic fixture에 수동 적용한다. implementation test나 실제 한국 변호사윤리·위임·기업 의사결정 법제 검증이 아니며 Observed는 manual fixture application이다.

```text
FirmKnowledge ≠ DisclosableClientInformation ≠ AdviceContent ≠ PresentedContent
≠ CommunicationAttempt ≠ ClientReceivedInformation ≠ ClientUnderstanding
≠ ClientAgreement ≠ ClientDecision ≠ Authorization ≠ Instruction ≠ TaskExecution
Advice ≠ truth ≠ guaranteed prediction ≠ ClientDecision
agreement ≠ authorization ≠ execution
```

## 2. Verdict rules

PASS는 DEC-027 boundary만으로 outcome이 결정되고 inherited DEC와 모순 없음, PARTIAL은 semantic ambiguity, FAIL은 knowledge/communication/decision/authorization/execution/history/hidden-oracle collapse가 실제 발생한 경우다. Psychology, trust, authority taxonomy, Korean doctrine, UI, AI, billing과 timing이 TBD인 것만으로 PARTIAL을 주지 않는다.

## 3. Manual application convention

각 case에서 firm/client knowledge, presented/received/understood, preference/decision/authorization/instruction, consumed advice version, downstream Task와 hidden future state를 구분한다.

## 4. Core cases (1–84)

### Case 1 — Basic client consultation
**Purpose**  Basic client consultation의 고유 semantic boundary를 검증한다.  
**Fixture**  Client C meets Lawyer L for Matter M1; status, options and risks are on agenda.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  AdviceWorkProduct and interaction event are created; no decision/authorization is inferred.  
**Observed**  AdviceWorkProduct and interaction event are created; no decision/authorization is inferred. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 2 — Lawyer info not communicated
**Purpose**  Lawyer info not communicated의 고유 semantic boundary를 검증한다.  
**Fixture**  Firm has A1 and A2, but consultation content lists only A1.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Client does not know A2 merely because firm knows it.  
**Observed**  Client does not know A2 merely because firm knows it. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 3 — Advice sends selected information
**Purpose**  Advice sends selected information의 고유 semantic boundary를 검증한다.  
**Fixture**  Advice A1 explicitly presents A1, CT1 and KG3.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Only explicitly presented content enters client path.  
**Observed**  Only explicitly presented content enters client path. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 4 — Communicated not received
**Purpose**  Communicated not received의 고유 semantic boundary를 검증한다.  
**Fixture**  CA1 sends email; delivery result is failed.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Attempt exists without receipt or understanding.  
**Observed**  Attempt exists without receipt or understanding. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 5 — Received but misunderstood
**Purpose**  Received but misunderstood의 고유 semantic boundary를 검증한다.  
**Fixture**  CA2 delivered; client interprets procedural risk as impossibility.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Misunderstanding is representable; firm analysis unchanged.  
**Observed**  Misunderstanding is representable; firm analysis unchanged. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 6 — Understood but disagrees
**Purpose**  Understood but disagrees의 고유 semantic boundary를 검증한다.  
**Fixture**  Client demonstrates understanding of Option A but chooses B.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Disagreement is valid and does not mutate strategy truth.  
**Observed**  Disagreement is valid and does not mutate strategy truth. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 7 — Agrees but no authorization
**Purpose**  Agrees but no authorization의 고유 semantic boundary를 검증한다.  
**Fixture**  Client says recommendation makes sense but gives no permission.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Agreement/assent is not authorization.  
**Observed**  Agreement/assent is not authorization. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 8 — Explicit authorization
**Purpose**  Explicit authorization의 고유 semantic boundary를 검증한다.  
**Fixture**  Client AU1 authorizes filing Draft D7 before stated deadline T.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Scoped Authorization AU1 is recorded.  
**Observed**  Scoped Authorization AU1 is recorded. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 9 — Authorized but not executed
**Purpose**  Authorized but not executed의 고유 semantic boundary를 검증한다.  
**Fixture**  AU1 exists; no Drafting or Submission Task is run.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Authorization enables a possible Task; it does not execute it.  
**Observed**  Authorization enables a possible Task; it does not execute it. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 10 — Advice based on IssueAnalysis
**Purpose**  Advice based on IssueAnalysis의 고유 semantic boundary를 검증한다.  
**Fixture**  Advice cites IssueAnalysis IA3 and its assumptions.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  IA3 remains typed analysis input.  
**Observed**  IA3 remains typed analysis input. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 11 — Advice based on CaseTheory
**Purpose**  Advice based on CaseTheory의 고유 semantic boundary를 검증한다.  
**Fixture**  Advice explains CT-A as contested strategy.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  CT-A remains strategy, not truth.  
**Observed**  CT-A remains strategy, not truth. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 12 — Advice based on disputed Statement
**Purpose**  Advice based on disputed Statement의 고유 semantic boundary를 검증한다.  
**Fixture**  Advice depends on disputed Statement S4.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Conditional/disputed input remains disputed.  
**Observed**  Conditional/disputed input remains disputed. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 13 — Advice=truth attack
**Purpose**  Advice=truth attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Lawyer calls A objectively best; no supporting certainty.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Advice is not objective truth.  
**Observed**  Advice is not objective truth. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 14 — Prediction=outcome attack
**Purpose**  Prediction=outcome attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Advice forecasts possible success; hidden outcome would differ.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Forecast is not outcome.  
**Observed**  Forecast is not outcome. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 15 — Hidden win probability attack
**Purpose**  Hidden win probability attack의 고유 semantic boundary를 검증한다.  
**Fixture**  System proposes WinChance 78 from hidden state.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Hidden probability is forbidden.  
**Observed**  Hidden probability is forbidden. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 16 — Goal maximize recovery
**Purpose**  Goal maximize recovery의 고유 semantic boundary를 검증한다.  
**Fixture**  C1 goal is maximize recovery.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Goal informs tradeoffs, not legal merit.  
**Observed**  Goal informs tradeoffs, not legal merit. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 17 — Goal minimize publicity
**Purpose**  Goal minimize publicity의 고유 semantic boundary를 검증한다.  
**Fixture**  C2 goal is minimize publicity.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Confidentiality goal changes framing, not law.  
**Observed**  Confidentiality goal changes framing, not law. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 18 — Goal/legal-merit collapse attack
**Purpose**  Goal/legal-merit collapse attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Privacy preference is incorrectly used to lower legal merit.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Goal/merit collapse is forbidden.  
**Observed**  Goal/merit collapse is forbidden. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 19 — Risk-averse rejects safe option
**Purpose**  Risk-averse rejects safe option의 고유 semantic boundary를 검증한다.  
**Fixture**  Risk-averse client rejects safe-looking Option A for cost.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Preference does not force the choice.  
**Observed**  Preference does not force the choice. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 20 — Preference/decision collapse attack
**Purpose**  Preference/decision collapse attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Settlement-open preference exists; Offer O1 arrives.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Preference does not accept O1 automatically.  
**Observed**  Preference does not accept O1 automatically. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 21 — ClientPersonalityScore attack
**Purpose**  ClientPersonalityScore attack의 고유 semantic boundary를 검증한다.  
**Fixture**  PersonalityScore 82 drives every response.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Canonical personality score is invalid.  
**Observed**  Canonical personality score is invalid. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 22 — UnderstandingScore attack
**Purpose**  UnderstandingScore attack의 고유 semantic boundary를 검증한다.  
**Fixture**  UnderstandingScore 90 is displayed after delivery.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Receipt is not certified understanding.  
**Observed**  Receipt is not certified understanding. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 23 — Excellent communicator / disagreement
**Purpose**  Excellent communicator / disagreement의 고유 semantic boundary를 검증한다.  
**Fixture**  Clear explanation is followed by client disagreement.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Clarity cannot force agreement.  
**Observed**  Clarity cannot force agreement. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 24 — Poor communicator / understanding
**Purpose**  Poor communicator / understanding의 고유 semantic boundary를 검증한다.  
**Fixture**  Clumsy explanation is followed by accurate client paraphrase.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Poor clarity does not make understanding impossible.  
**Observed**  Poor clarity does not make understanding impossible. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 25 — Client belief conflicts firm
**Purpose**  Client belief conflicts firm의 고유 semantic boundary를 검증한다.  
**Fixture**  Client believes W lied; FirmAnalysis says unresolved.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Belief and firm analysis coexist.  
**Observed**  Belief and firm analysis coexist. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 26 — Client belief→truth attack
**Purpose**  Client belief→truth attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Client belief is written as factual deception.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Belief cannot certify deception or truth.  
**Observed**  Belief cannot certify deception or truth. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 27 — Client factual assertion
**Purpose**  Client factual assertion의 고유 semantic boundary를 검증한다.  
**Fixture**  Client says payment approved May 4.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Assertion retains epistemic type.  
**Observed**  Assertion retains epistemic type. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 28 — Client source lead
**Purpose**  Client source lead의 고유 semantic boundary를 검증한다.  
**Fixture**  Client mentions possible spreadsheet D9.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Lead/KnownGap may be created.  
**Observed**  Lead/KnownGap may be created. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 29 — Lead→evidence auto-acquisition attack
**Purpose**  Lead→evidence auto-acquisition attack의 고유 semantic boundary를 검증한다.  
**Fixture**  D9 mention immediately creates acquired SourceMaterial.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Acquisition requires DEC-021 path.  
**Observed**  Acquisition requires DEC-021 path. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 30 — Client corrects statement
**Purpose**  Client corrects statement의 고유 semantic boundary를 검증한다.  
**Fixture**  T1 client says signed; T2 says employee signed.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Both statements and correction lineage remain.  
**Observed**  Both statements and correction lineage remain. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 31 — Old statement overwrite attack
**Purpose**  Old statement overwrite attack의 고유 semantic boundary를 검증한다.  
**Fixture**  System deletes T1 after T2.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  History overwrite is forbidden.  
**Observed**  History overwrite is forbidden. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 32 — Three options presented
**Purpose**  Three options presented의 고유 semantic boundary를 검증한다.  
**Fixture**  Advice presents A, B and C.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Options coexist without hidden best marker.  
**Observed**  Options coexist without hidden best marker. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 33 — Lawyer recommends B
**Purpose**  Lawyer recommends B의 고유 semantic boundary를 검증한다.  
**Fixture**  Lawyer recommends B under known risks.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Recommendation is separate from ClientDecision.  
**Observed**  Recommendation is separate from ClientDecision. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 34 — Recommendation→decision attack
**Purpose**  Recommendation→decision attack의 고유 semantic boundary를 검증한다.  
**Fixture**  System auto-records B as decision.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Client choice must be explicit.  
**Observed**  Client choice must be explicit. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 35 — Hidden optimal choice attack
**Purpose**  Hidden optimal choice attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Hidden judge result highlights C as best.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Future outcome cannot rank options.  
**Observed**  Future outcome cannot rank options. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 36 — Explicit ClientDecision
**Purpose**  Explicit ClientDecision의 고유 semantic boundary를 검증한다.  
**Fixture**  Client explicitly chooses B among presented options.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Decision stores options, snapshot and time.  
**Observed**  Decision stores options, snapshot and time. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 37 — Decision with rationale
**Purpose**  Decision with rationale의 고유 semantic boundary를 검증한다.  
**Fixture**  Client explains choice limits publicity.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Rationale is provenance-bearing but not fact.  
**Observed**  Rationale is provenance-bearing but not fact. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 38 — Decision without rationale
**Purpose**  Decision without rationale의 고유 semantic boundary를 검증한다.  
**Fixture**  Client chooses A without giving rationale.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Decision without rationale is valid.  
**Observed**  Decision without rationale is valid. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 39 — Decision≠authorization
**Purpose**  Decision≠authorization의 고유 semantic boundary를 검증한다.  
**Fixture**  Client prefers settlement, no authority wording.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Preference/decision does not authorize action.  
**Observed**  Preference/decision does not authorize action. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 40 — Scoped authorization
**Purpose**  Scoped authorization의 고유 semantic boundary를 검증한다.  
**Fixture**  AU7 permits negotiation within range R until T.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Scope and condition are enforced conceptually.  
**Observed**  Scope and condition are enforced conceptually. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 41 — Infinite authorization attack
**Purpose**  Infinite authorization attack의 고유 semantic boundary를 검증한다.  
**Fixture**  General representation is treated as unlimited authority.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  No unlimited adjacent authority.  
**Observed**  No unlimited adjacent authority. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 42 — Client instruction
**Purpose**  Client instruction의 고유 semantic boundary를 검증한다.  
**Fixture**  Client instructs investigate known Lead L7.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Instruction may create/evaluate a Task.  
**Observed**  Instruction may create/evaluate a Task. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 43 — Ambiguous instruction
**Purpose**  Ambiguous instruction의 고유 semantic boundary를 검증한다.  
**Fixture**  Client says do whatever it takes.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Clarification may be required; no infinite authority.  
**Observed**  Clarification may be required; no infinite authority. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 44 — Impossible/procedurally blocked instruction
**Purpose**  Impossible/procedurally blocked instruction의 고유 semantic boundary를 검증한다.  
**Fixture**  Client demands unavailable procedural action.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Instruction can remain blocked/impossible.  
**Observed**  Instruction can remain blocked/impossible. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 45 — Changed instruction
**Purpose**  Changed instruction의 고유 semantic boundary를 검증한다.  
**Fixture**  T1 no settlement; T2 consider offers under condition C.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Changed instruction preserves temporal history.  
**Observed**  Changed instruction preserves temporal history. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 46 — Instruction history deletion attack
**Purpose**  Instruction history deletion attack의 고유 semantic boundary를 검증한다.  
**Fixture**  T2 removes T1 instruction.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Old instruction remains traceable.  
**Observed**  Old instruction remains traceable. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 47 — Organizational client contact
**Purpose**  Organizational client contact의 고유 semantic boundary를 검증한다.  
**Fixture**  Employee C attends Company K call.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Contact and client authority roles are distinct.  
**Observed**  Contact and client authority roles are distinct. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 48 — Contact auto-authority attack
**Purpose**  Contact auto-authority attack의 고유 semantic boundary를 검증한다.  
**Fixture**  C attendance is treated as settlement authority.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  No authority without explicit state.  
**Observed**  No authority without explicit state. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 49 — Lawyer recommends settlement/client refuses
**Purpose**  Lawyer recommends settlement/client refuses의 고유 semantic boundary를 검증한다.  
**Fixture**  Lawyer recommends settlement; client instructs litigation.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Disagreement is valid.  
**Observed**  Disagreement is valid. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 50 — Good relationship/client refuses
**Purpose**  Good relationship/client refuses의 고유 semantic boundary를 검증한다.  
**Fixture**  High-trust relationship still receives refusal.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Relationship is contextual, not deterministic.  
**Observed**  Relationship is contextual, not deterministic. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 51 — Bad relationship/client agrees
**Purpose**  Bad relationship/client agrees의 고유 semantic boundary를 검증한다.  
**Fixture**  Low-trust context still receives agreement.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Agreement can occur despite low trust.  
**Observed**  Agreement can occur despite low trust. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 52 — TrustScore obedience attack
**Purpose**  TrustScore obedience attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Trust=87 becomes 87% compliance.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Trust formula is not canonical.  
**Observed**  Trust formula is not canonical. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 53 — Persuasion mind-control attack
**Purpose**  Persuasion mind-control attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Persuasive presentation overwrites client goals.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Persuasion preserves agency.  
**Observed**  Persuasion preserves agency. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 54 — Advice v1
**Purpose**  Advice v1의 고유 semantic boundary를 검증한다.  
**Fixture**  A1 at T1 uses CF-v1.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  A1 version and snapshot are preserved.  
**Observed**  A1 version and snapshot are preserved. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 55 — New evidence→Advice v2
**Purpose**  New evidence→Advice v2의 고유 semantic boundary를 검증한다.  
**Fixture**  E8 arrives; A2 at T2 updates advice.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  A2 may challenge/revise A1.  
**Observed**  A2 may challenge/revise A1. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 56 — Retroactive advice rewrite attack
**Purpose**  Retroactive advice rewrite attack의 고유 semantic boundary를 검증한다.  
**Fixture**  A2 replaces A1 history.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  A1 history cannot be erased.  
**Observed**  A1 history cannot be erased. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 57 — Client decision under v1
**Purpose**  Client decision under v1의 고유 semantic boundary를 검증한다.  
**Fixture**  D1 at T2 follows A1.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  D1 links to A1.  
**Observed**  D1 links to A1. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 58 — v2 does not rewrite D1
**Purpose**  v2 does not rewrite D1의 고유 semantic boundary를 검증한다.  
**Fixture**  A2 later exists; D1 is inspected.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  D1 does not consume A2 retroactively.  
**Observed**  D1 does not consume A2 retroactively. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 59 — Client revises decision
**Purpose**  Client revises decision의 고유 semantic boundary를 검증한다.  
**Fixture**  D2 later reverses D1.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  D2 is a new decision with lineage.  
**Observed**  D2 is a new decision with lineage. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 60 — Advice Task consumes capacity
**Purpose**  Advice Task consumes capacity의 고유 semantic boundary를 검증한다.  
**Fixture**  Consultation prep/call competes with hearing Tasks.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Interaction consumes DEC-026 capacity.  
**Observed**  Interaction consumes DEC-026 capacity. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 61 — Client unavailable
**Purpose**  Client unavailable의 고유 semantic boundary를 검증한다.  
**Fixture**  Scheduled decision meeting gets no response.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Pending/unavailable state is valid; no consent.  
**Observed**  Pending/unavailable state is valid; no consent. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 62 — Pending decision blocks Draft
**Purpose**  Pending decision blocks Draft의 고유 semantic boundary를 검증한다.  
**Fixture**  Draft D4 depends on missing ClientDecision CD9.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Draft may be blocked awaiting CD9.  
**Observed**  Draft may be blocked awaiting CD9. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 63 — High priority cannot fabricate consent
**Purpose**  High priority cannot fabricate consent의 고유 semantic boundary를 검증한다.  
**Fixture**  Critical filing lacks consent.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Priority cannot fabricate consent.  
**Observed**  Priority cannot fabricate consent. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 64 — Deadline/client undecided
**Purpose**  Deadline/client undecided의 고유 semantic boundary를 검증한다.  
**Fixture**  Deadline approaches while client undecided.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  No consent is inferred from deadline.  
**Observed**  No consent is inferred from deadline. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 65 — Settlement advice≠settlement
**Purpose**  Settlement advice≠settlement의 고유 semantic boundary를 검증한다.  
**Fixture**  Advice says explore settlement only.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  No settlement offer/agreement is created.  
**Observed**  No settlement offer/agreement is created. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 66 — Authorization to file≠success
**Purpose**  Authorization to file≠success의 고유 semantic boundary를 검증한다.  
**Fixture**  Client authorizes appeal filing.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Filing chain remains under DEC-025.  
**Observed**  Filing chain remains under DEC-025. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 67 — Delegated associate advice
**Purpose**  Delegated associate advice의 고유 semantic boundary를 검증한다.  
**Fixture**  Associate completes eligible AdviceTask.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Delegated output uses same ontology.  
**Observed**  Delegated output uses same ontology. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 68 — Hidden future-outcome oracle attack
**Purpose**  Hidden future-outcome oracle attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Engine uses future judge/settlement satisfaction.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Future outcome access is forbidden.  
**Observed**  Future outcome access is forbidden. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 69 — Lawyer knowledge auto-sync attack
**Purpose**  Lawyer knowledge auto-sync attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Firm discovers E9 with no client interaction.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  ClientKnowledge is not auto-synced.  
**Observed**  ClientKnowledge is not auto-synced. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 70 — Advice authority laundering attack
**Purpose**  Advice authority laundering attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Partner signs A7; system marks truth.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Seniority is not truth certification.  
**Observed**  Seniority is not truth certification. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 71 — Agreement auto-authorization attack
**Purpose**  Agreement auto-authorization attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Client agrees settlement makes sense.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Agreement is not scoped Authorization.  
**Observed**  Agreement is not scoped Authorization. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 72 — Deadline-consent fabrication attack
**Purpose**  Deadline-consent fabrication attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Client unreachable near deadline.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Silence does not fabricate consent.  
**Observed**  Silence does not fabricate consent. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 73 — Hidden preference oracle attack
**Purpose**  Hidden preference oracle attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Future data says client later regrets A.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Future satisfaction cannot steer choice.  
**Observed**  Future satisfaction cannot steer choice. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 74 — Contact authority laundering attack
**Purpose**  Contact authority laundering attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Employee C participates but authority state absent.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Contact participation is not authority.  
**Observed**  Contact participation is not authority. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 75 — Misunderstanding truth mutation attack
**Purpose**  Misunderstanding truth mutation attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Client believes E4 proves X.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Client belief does not mutate Case File truth.  
**Observed**  Client belief does not mutate Case File truth. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 76 — Advice-to-task autoexecution attack
**Purpose**  Advice-to-task autoexecution attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Client authorizes INV-9 after Advice; no Investigation run.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Authorization may create Task; execution remains separate.  
**Observed**  Authorization may create Task; execution remains separate. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 77 — Client understanding auto-certification attack
**Purpose**  Client understanding auto-certification attack의 고유 semantic boundary를 검증한다.  
**Fixture**  CA1 receipt succeeds; no follow-up questions.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Receipt/no questions does not certify complete understanding.  
**Observed**  Receipt/no questions does not certify complete understanding. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 78 — Authorization scope expansion attack
**Purpose**  Authorization scope expansion attack의 고유 semantic boundary를 검증한다.  
**Fixture**  AU1 only prepares proposal ≤C before T.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  AU1 cannot accept, withdraw, disclose or appeal outside scope.  
**Observed**  AU1 cannot accept, withdraw, disclose or appeal outside scope. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 79 — Advice omission/client knowledge inference attack
**Purpose**  Advice omission/client knowledge inference attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Firm has A1/A2/KG3; presents A1/KG3.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Unpresented A2 remains unknown to client.  
**Observed**  Unpresented A2 remains unknown to client. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 80 — Client silence=agreement attack
**Purpose**  Client silence=agreement attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Advice B delivered; client sends no response.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  No response is pending/undecided, not agreement.  
**Observed**  No response is pending/undecided, not agreement. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 81 — Multiple decision-maker conflict attack
**Purpose**  Multiple decision-maker conflict attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Company K has C1, D1, D2 with conflicting instructions.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Conflicting decision-makers require clarification/authority rule.  
**Observed**  Conflicting decision-makers require clarification/authority rule. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 82 — Advice version/authorization mismatch attack
**Purpose**  Advice version/authorization mismatch attack의 고유 semantic boundary를 검증한다.  
**Fixture**  AU1 is based on A1; A2 is issued later.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  AU1 remains tied to A1/D1; new AU may be needed.  
**Observed**  AU1 remains tied to A1/D1; new AU may be needed. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 83 — Delegated lawyer hidden authority escalation attack
**Purpose**  Delegated lawyer hidden authority escalation attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Associate A hears 'probably settle' during assigned Task.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Assigned associate has no unlimited settlement authority.  
**Observed**  Assigned associate has no unlimited settlement authority. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

### Case 84 — Client instruction truth-laundering attack
**Purpose**  Client instruction truth-laundering attack의 고유 semantic boundary를 검증한다.  
**Fixture**  Client instruction says use May 4 while only S1 supports it.  
**Manual verification**  Advice/interaction event, provenance, visible inputs와 다음 단계 자동 승격 여부를 확인한다.  
**Expected**  Instruction remains assertion-driven; May 4 is not fact.  
**Observed**  Instruction remains assertion-driven; May 4 is not fact. DEC-027 semantics로 수동 도출; hidden state, universal score와 history overwrite는 관찰되지 않는다.  
**Verdict**  PASS  
**Boundary note**  exact psychology, authority, ethics, timing, UI, AI, schema와 mechanics는 NOT TESTED / TBD.

## 5. Communication-chain pressure test

FA1 → Advice A1 → PresentedContent PC1 → CommunicationAttempt CA1 → receipt → ClientUnderstanding CU1 → ClientDecision CD1 → scoped Authorization AU1 → TaskInstance TI1 → TaskExecution을 각각 별도 상태로 검증한다. CA1은 자동 receipt를 만들지 않고, receipt는 understanding을, understanding은 decision을, decision은 authorization을, authorization은 execution을 자동 생성하지 않는다. PASS.

## 6. Information asymmetry pressure test

Firm가 SA1/PA2/CT3/KG4/LR5를 알고 SA1/CT3/KG4만 전달하면 ClientKnowledge에는 선택된 내용만 들어간다. A2/PA2/LR5는 자동 동기화되지 않으며 Case File은 변경되지 않는다. PASS.

## 7. Communication attempt / receipt pressure test

sent/failed, delivered/unacknowledged, client-confirmed receipt를 구별한다. 매체별 법적 효과나 receipt 확률은 발명하지 않는다. PASS.

## 8. Understanding and belief pressure test

received advice를 client가 오해할 수 있고 ClientBelief가 FirmAnalysis와 충돌할 수 있다. 명시적 clarification 전에는 firm truth나 client understanding을 자동 수정하지 않는다. PASS.

## 9. Goals, preferences and options pressure test

recovery, speed, confidentiality 등 목표와 settlement openness는 legal merit나 deterministic decision이 아니다. A/B/C options와 recommendation은 client choice 및 hidden best marker와 분리된다. PASS.

## 10. Decision / authorization / instruction pressure test

ClientDecision은 presented options와 known snapshot을 소비한 기록이다. Authorization은 action/category, scope, condition, limit, time을 가져야 하며 instruction은 평가 후 explicit Task/strategy update로만 이어진다. PASS.

## 11. Organizational authority and disagreement pressure test

ContactPerson, DecisionMaker, ClientIdentity와 multiple decision-makers를 분리한다. lawyer-client disagreement, high-trust refusal, low-trust agreement 모두 유효하며 corporate doctrine은 TBD다. PASS.

## 12. Advice-version / workload pressure test

A1→D1→AU1과 E8→A2→D2 lineage를 보존하고 consultations가 DEC-026 capacity를 소비한다. D1은 A1 snapshot에 고정되며 A2가 과거를 rewrite하지 않는다. PASS.

## 13. Settlement / filing / hidden-state pressure test

settlement advice는 offer/agreement가 아니고 filing authorization은 DEC-025 chain의 execution/success가 아니다. ActualStateRecord, hidden legal model, future judge/settlement/satisfaction/strategy는 접근하지 않는다. PASS.

## 14. Direct/delegated pressure test

Player와 delegated associate는 동일 AdviceWorkProduct, interaction event, decision, authorization 및 follow-up Task ontology를 사용한다. ClientHandlingSkill percentage나 delegated authority escalation은 금지한다. PASS.

## 15. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---|---|---|
| 1 | ClientInteraction is explicit | PASS | targeted case/attack fixture |
| 2 | Advice is WorkProduct/event-based | PASS | targeted case/attack fixture |
| 3 | FirmKnowledge ≠ ClientKnowledge | PASS | targeted case/attack fixture |
| 4 | Available ≠ communicated | PASS | targeted case/attack fixture |
| 5 | Communicated ≠ received | PASS | targeted case/attack fixture |
| 6 | Received ≠ understood | PASS | targeted case/attack fixture |
| 7 | Understood ≠ agreed | PASS | targeted case/attack fixture |
| 8 | Agreed ≠ authorized | PASS | targeted case/attack fixture |
| 9 | Authorized ≠ executed | PASS | targeted case/attack fixture |
| 10 | Advice ≠ truth | PASS | targeted case/attack fixture |
| 11 | Advice ≠ governing law | PASS | targeted case/attack fixture |
| 12 | Advice ≠ CourtFactFinding | PASS | targeted case/attack fixture |
| 13 | Prediction ≠ future outcome | PASS | targeted case/attack fixture |
| 14 | No hidden win probability authority | PASS | targeted case/attack fixture |
| 15 | Client goal ≠ legal merit | PASS | targeted case/attack fixture |
| 16 | Preference ≠ decision | PASS | targeted case/attack fixture |
| 17 | Risk tolerance ≠ deterministic behavior | PASS | targeted case/attack fixture |
| 18 | No ClientPersonalityScore authority | PASS | targeted case/attack fixture |
| 19 | No UnderstandingScore authority | PASS | targeted case/attack fixture |
| 20 | Communication capability ≠ guaranteed understanding | PASS | targeted case/attack fixture |
| 21 | Communication capability ≠ agreement | PASS | targeted case/attack fixture |
| 22 | Client belief ≠ FirmAnalysis | PASS | targeted case/attack fixture |
| 23 | Client belief ≠ ActualStateRecord | PASS | targeted case/attack fixture |
| 24 | Client assertion ≠ truth | PASS | targeted case/attack fixture |
| 25 | Client source lead ≠ acquired evidence | PASS | targeted case/attack fixture |
| 26 | Client correction preserves prior statement | PASS | targeted case/attack fixture |
| 27 | Multiple options may coexist | PASS | targeted case/attack fixture |
| 28 | Presented option ≠ correct option | PASS | targeted case/attack fixture |
| 29 | Recommended option ≠ correct option | PASS | targeted case/attack fixture |
| 30 | Recommended option ≠ chosen option | PASS | targeted case/attack fixture |
| 31 | No hidden best-choice marker | PASS | targeted case/attack fixture |
| 32 | ClientDecision provenance preserved | PASS | targeted case/attack fixture |
| 33 | Decision uses known information snapshot | PASS | targeted case/attack fixture |
| 34 | Decision ≠ authorization | PASS | targeted case/attack fixture |
| 35 | Authorization has scope | PASS | targeted case/attack fixture |
| 36 | Broad representation ≠ infinite authorization | PASS | targeted case/attack fixture |
| 37 | Instruction ≠ execution | PASS | targeted case/attack fixture |
| 38 | Ambiguous instruction may require clarification | PASS | targeted case/attack fixture |
| 39 | Changed instruction preserves history | PASS | targeted case/attack fixture |
| 40 | ContactPerson ≠ Client automatically | PASS | targeted case/attack fixture |
| 41 | ContactPerson ≠ DecisionMaker automatically | PASS | targeted case/attack fixture |
| 42 | Lawyer-client disagreement valid | PASS | targeted case/attack fixture |
| 43 | Good relationship ≠ agreement | PASS | targeted case/attack fixture |
| 44 | Poor relationship ≠ refusal | PASS | targeted case/attack fixture |
| 45 | Trust ≠ obedience percentage | PASS | targeted case/attack fixture |
| 46 | Persuasion ≠ coercion | PASS | targeted case/attack fixture |
| 47 | Advice revision preserves old advice | PASS | targeted case/attack fixture |
| 48 | Old decision remains linked to old advice | PASS | targeted case/attack fixture |
| 49 | Client may revise decision | PASS | targeted case/attack fixture |
| 50 | Interaction consumes capacity | PASS | targeted case/attack fixture |
| 51 | Client unavailability can block work | PASS | targeted case/attack fixture |
| 52 | Pending decision can block Task | PASS | targeted case/attack fixture |
| 53 | Priority cannot fabricate consent | PASS | targeted case/attack fixture |
| 54 | Deadline cannot fabricate consent | PASS | targeted case/attack fixture |
| 55 | Settlement advice ≠ settlement agreement | PASS | targeted case/attack fixture |
| 56 | Authorization ≠ filing | PASS | targeted case/attack fixture |
| 57 | Authorization ≠ success | PASS | targeted case/attack fixture |
| 58 | Exceptional lawyer ≠ future oracle | PASS | targeted case/attack fixture |
| 59 | Direct/delegated same ontology | PASS | targeted case/attack fixture |
| 60 | Attempted communication ≠ received | PASS | targeted case/attack fixture |
| 61 | Internal information not auto-client-visible | PASS | targeted case/attack fixture |
| 62 | ActualStateRecord unavailable | PASS | targeted case/attack fixture |
| 63 | Hidden legal model unavailable | PASS | targeted case/attack fixture |
| 64 | Future judge reaction unavailable | PASS | targeted case/attack fixture |
| 65 | Future settlement result unavailable | PASS | targeted case/attack fixture |
| 66 | Non-optimal client decision valid | PASS | targeted case/attack fixture |
| 67 | No universal rationality optimizer | PASS | targeted case/attack fixture |
| 68 | All advice/decisions/authorizations preserve history | PASS | targeted case/attack fixture |

## 16. Contradiction audit

DEC-027 내부 및 DEC-026/025/024/023/022/021/019/017/016 inherited boundary와 모순 없음. knowledge/communication/understanding/agreement/authorization/execution collapse, advice/prediction oracle, goal/merit, preference/decision, score, belief/truth, lead/acquisition, history/version, authority, deadline consent, settlement/filing, hidden future outcome과 auto-task execution을 모두 거부한다.

## 17. False-PASS audit

PASS를 위해 psychology, trust, satisfaction, Korean authorization/ethics/privilege/corporate doctrine, emergency consent, communication probabilities 또는 future legal/court outcome을 발명하지 않았다.

## 18. False-PARTIAL audit

Core case에 semantic ambiguity가 없다. exact mechanics가 TBD인 것은 PARTIAL 근거가 아니며 separation boundary가 불명확할 때만 PARTIAL이다.

## 19. Remaining TBD / NOT TESTED

- client/contact/decision-maker schema
- goals/preferences/understanding mechanics
- communication medium/delivery
- trust/relationship
- authorization taxonomy
- professional responsibility/privilege/confidentiality
- client responsiveness and advice generation
- NPC decision AI and satisfaction/reputation
- billing/cost
- UI/dialogue
- save/schema/API/Godot
- balancing/performance

## 20. Risks / anti-patterns

| Failure condition | Why harmful | Mitigation direction |
|---|---|---|
| Client becomes passive yes-button | agency disappears | separate understanding/decision/authorization |
| Charisma mind control | communication overrides goals | component clarity only |
| Advice is hidden correct answer | truth oracle | authorized fallible workproduct |
| Client always chooses optimal | uncertainty removed | non-optimal choices valid |
| Personality scalar | context lost | structured preferences |
| Goals irrelevant | client fantasy weakened | goal-aware tradeoffs |
| Decision has no consequence | interaction cosmetic | explicit Task updates |
| Dialogue busywork | player fatigue | bounded interactions |
| Knowledge leaks through advice | epistemic boundary breach | no hidden inputs |
| Authorization meaningless | procedure collapses | scoped permission |
| Deadline creates consent | autonomy violation | pending/blocker state |
| Contact becomes authority | organizational ambiguity | typed roles |
| Relationship obedience meter | social oracle | no deterministic formula |
| Firm scale creates calls overload | operations collapse | delegation and escalation |
| Hidden satisfaction steering | future-state leak | known context only |

## 21. Player-facing and gameplay principle

Player should see firm assumptions, communicated content, apparent understanding/questions, known goals/preferences, options, recommendation, decision, authorization scope, pending decisions, interaction history와 blocked Tasks. Hidden correct advice/choice, future satisfaction/judge reaction, guaranteed outcome과 unknown client thoughts는 보이지 않는다.

```text
best legal strategy for firm ≠ best outcome under client goals
lawyer recommendation ≠ client command
client autonomy → real strategic constraints
```

## 22. Solo → firm progression

Solo는 핵심 consultation을 직접 처리하고, associates는 routine explanation/update를 준비하며, seniors/partners는 complex advice와 key decisions를 맡는다. Larger firm은 relationship ownership과 escalation chain을 사용할 수 있다. Exact title/role system은 TBD다.

## 23. Suggested TEST-026 plan

이 문서 자체가 TEST-026이다. 모든 84개 case는 case-specific fixture, expected, observed reasoning으로 수동 검증되며 generic title-only PASS가 아니다.

## 24. DEC-028 candidates

Settlement / Negotiation, Witness Preparation / Court Examination, Hearing / Oral Advocacy, Firm Organization, Firm Economics를 비교한다. DEC-027이 Advice→ClientDecision→scoped Authorization bridge를 닫고 blocker가 없으면 `DEC-028 — Settlement / Negotiation`을 기본 후보로 둔다.

## 25. Decision summary

### Inherited Accepted

Case File epistemic boundary, Task/WorkProduct, workload, CaseTheory, Drafting/Filing, provenance/history와 no hidden-state oracle를 상속한다.

### Core Accepted candidates

CLI1–CLI52: information asymmetry, communication chain, advice/option/decision/authorization, autonomy, workload, version/history, downstream Task와 no-oracle boundaries.

### Accepted candidates

없음. 모든 제안은 manual verification 후 Accepted 후보다.

### TBD

§19의 identity/psychology/authority/ethics/medium/AI/UI/economics와 exact interaction mechanics.

### Forbidden

- firm/client knowledge auto-sync, communication-stage collapse, advice/truth/future oracle, score-based obedience/understanding.
- preference/recommendation/decision/agreement/authorization/execution collapse, contact authority laundering, deadline consent fabrication.
- lead auto-acquisition, history overwrite, settlement/filing autoexecution, hidden future-state access.

## 26. Final verification summary

```text
Total core cases: 84
PASS: 84
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none  
FAIL cases: none  
Arithmetic: 84 + 0 + 0 = 84.

- DEC-027 reopen required: No.
- Internal contradiction: None found.
- Inherited boundary violation: None.
- Firm/client knowledge, communication-stage, understanding/agreement, agreement/authorization and authorization/execution collapse: None.
- Advice/truth, prediction/outcome, goals/merit, preference/decision and relationship/trust laundering: None.
- Lead/acquisition, correction/history, option/recommendation, decision scope and silence/consent collapse: None.
- Client blocker bypass, settlement/filing autoexecution, delegated authority escalation and hidden future-state access: None.
- Issue blocking DEC-027 promotion: None.
- Issue blocking DEC-028: None.

## 27. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-027의 84개 case-specific fixture, 68개 invariant와 communication/authorization/history/hidden-state audit를 수동 적용. 모든 case PASS; PARTIAL/FAIL 없음. |
