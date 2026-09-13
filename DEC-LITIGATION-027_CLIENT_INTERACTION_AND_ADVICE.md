# THE FIRM — Client Interaction and Advice

문서 ID: DEC-LITIGATION-027  
버전: v0.1 — Proposed / design review required  
상태: **Proposed / design review required**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 기준: `DEC-LITIGATION-026_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md` v0.2 Accepted, `TEST-025_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-025_DRAFTING_PLEADING_AND_FILING.md` v0.2 Accepted, `TEST-024_DRAFTING_PLEADING_AND_FILING.md` v0.2 Accepted / manual semantic verification, `DEC-LITIGATION-024_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted, `TEST-023_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-023_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.2 Accepted, `DEC-LITIGATION-022_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.2 Accepted, `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose

Authorized Case File, IssueAnalysis, CaseTheory, Arguments, procedural status와 known risks를 client에게 설명·조언하고, client questions/reactions/preferences/decisions가 scoped Authorization/Instruction과 explicit downstream Task changes로 이어지는 최소 semantic model을 정의한다.

```text
lawyer knows X ≠ client knows X ≠ client understands X ≠ client agrees with X
client agrees ≠ authorizes X ≠ TaskExecution X
Advice ≠ objective truth ≠ guaranteed prediction ≠ ClientDecision
```

## 2. Core communication chain

```text
Authorized firm knowledge + ClientAdviceTask + disclosable/presented content
→ AdviceWorkProduct + communication attempt/result
→ received information / understanding / questions / reaction
→ ClientDecision → scoped Authorization/Instruction
→ explicit Task/strategy update
```

## 3. Client, contact and information boundary

ClientIdentity는 individual 또는 organization일 수 있다. Client, ContactPerson과 DecisionMaker는 organizational support가 도입되면 분리한다. firm-internal knowledge와 client-visible/disclosable information은 자동 동기화되지 않는다. Privilege, confidentiality와 Korean corporate authority doctrine은 TBD다.

## 4. Advice Task and WorkProduct

ClientAdviceTaskDefinition은 purpose, target client/contact, authorized snapshot, IssueAnalysis/CaseTheory/procedural refs, options, deadlines, risks, known goals/preferences, medium/context, eligible roles, resources, dependencies와 expected output을 개념적으로 가진다. AdviceWorkProduct는 presented facts/assertions, legal/procedural explanation, options, assumptions, tradeoffs, uncertainty, recommendation, questions와 version/history를 보존한다. No AdviceQuality.

## 5. Advice, prediction, goals and preferences

Advice is fallible Professional WorkProduct, not truth or governing law. Bounded forecast may be based on known inputs but is not outcome. Client goals such as recovery, cost, publicity, speed, relationship or vindication are not legal merits. Preferences and risk tolerance inform context but do not determine decisions. No ClientPersonalityScore or hidden win probability.

## 6. Communication, receipt and understanding

Available information, presented content, communication attempt, receipt, understanding, agreement and authorization are separate. Understanding may be partial or mistaken, and questions may create clarification/research/cost/strategy Tasks. Communication capability may improve clarity/structure but cannot guarantee understanding or agreement.

## 7. Client beliefs and new information

ClientBelief/Assertion remains distinct from FirmAnalysis and ActualStateRecord. New factual recollection, source/person lead, preference, constraint or instruction uses DEC-019/021/022 epistemic paths. A client-mentioned document is a Lead/KnownGap, not acquired evidence. Corrections preserve prior statements and no automatic truth winner.

## 8. Options, recommendation and decision

Multiple options may coexist, including deferral pending research. A lawyer recommendation is neither correct option nor client decision. ClientDecision records decision-maker, Matter/question, presented options, choice, expressed rationale, time, consumed advice/snapshot, conditions and history. No hidden best-choice marker.

## 9. Authorization, instruction and downstream action

Decision and Authorization are distinct. Authorization must have explicit action/category, scope, conditions, limits, time and provenance where modeled. Broad representation does not authorize everything forever. Instruction may be ambiguous, conflicting, impossible or blocked and must be evaluated before explicit Task/strategy updates. Authorization never executes Investigation, filing or settlement by itself.

## 10. Disagreement, relationship and client autonomy

Lawyer-client disagreement, refusal, delay, expensive/nonmonetary choice and later reversal are valid states. Good relationship does not force agreement; poor relationship does not force refusal. Trust is not an obedience percentage and persuasion is not coercion. A client is an agent under bounded information, not an optimizer or approval button.

## 11. Versioning, workload and blockers

Advice A1 and A2 remain separate. Decision D1 preserves A1 and its snapshot even after A2. Client decisions/instructions may be revised with history. Consultations, preparation and follow-up consume DEC-026 capacity. Unavailable/undecided clients and pending consent may block Tasks; priority/deadline cannot fabricate consent.

## 12. Settlement, procedure and hidden-state boundary

Advice to consider settlement ≠ offer ≠ agreement. Authorization to file ≠ finalized document ≠ SubmissionAttempt ≠ acceptance. Client interaction cannot read ActualStateRecord, hidden legal model, witness truthfulness, future judge/CourtFactFinding, future settlement outcome, satisfaction or correct strategy.

## 13. Direct/delegated and event provenance

Player and delegated professionals use the same Task/AdviceWorkProduct/ClientInteractionEvent ontology. No client-skill compliance percentage. Events preserve Matter/client/contact, participants, time/context/medium, advice version, presented/received content, response/questions, decision/authorization and follow-up refs. Attempted communication may fail or remain unacknowledged.

## 14. Design decisions

| ID | Problem | Alternatives | Failure modes | Recommendation | Status | Reason |
|---|---|---|---|---|---|---|
| CLI1 | Explicit ClientInteraction/Advice Task | implicit conversation / explicit Task | Collapse creates an oracle, agency loss or provenance loss | Create ClientAdviceTask and interaction event | **Core Accepted candidate** | Preserve Explicit ClientInteraction/Advice Task boundary |
| CLI2 | Firm knowledge ≠ client knowledge | auto-sync / separate epistemic states | Collapse creates an oracle, agency loss or provenance loss | Track only communicated/received client information | **Core Accepted candidate** | Preserve Firm knowledge ≠ client knowledge boundary |
| CLI3 | Available info ≠ communicated info | all available disclosed / selected content | Collapse creates an oracle, agency loss or provenance loss | Record presented content explicitly | **Core Accepted candidate** | Preserve Available info ≠ communicated info boundary |
| CLI4 | Communicated ≠ received | send=receive / delivery result | Collapse creates an oracle, agency loss or provenance loss | Separate communication attempt and receipt | **Core Accepted candidate** | Preserve Communicated ≠ received boundary |
| CLI5 | Received ≠ understood | receipt=understanding / understanding state | Collapse creates an oracle, agency loss or provenance loss | Permit partial/misunderstanding and questions | **Core Accepted candidate** | Preserve Received ≠ understood boundary |
| CLI6 | Understanding ≠ agreement | understanding forces assent / client agency | Collapse creates an oracle, agency loss or provenance loss | Record agreement/disagreement separately | **Core Accepted candidate** | Preserve Understanding ≠ agreement boundary |
| CLI7 | Agreement ≠ authorization | assent=permission / scoped authorization | Collapse creates an oracle, agency loss or provenance loss | Require explicit Authorization | **Core Accepted candidate** | Preserve Agreement ≠ authorization boundary |
| CLI8 | Advice ≠ truth | advice as answer key / professional WorkProduct | Collapse creates an oracle, agency loss or provenance loss | Keep provenance-bearing fallible advice | **Core Accepted candidate** | Preserve Advice ≠ truth boundary |
| CLI9 | Advice ≠ guaranteed prediction | forecast=outcome / bounded projection | Collapse creates an oracle, agency loss or provenance loss | Preserve assumptions and uncertainty | **Core Accepted candidate** | Preserve Advice ≠ guaranteed prediction boundary |
| CLI10 | Advice may be wrong/revised | immutable correct advice / versions | Collapse creates an oracle, agency loss or provenance loss | Allow challenge and version lineage | **Core Accepted candidate** | Preserve Advice may be wrong/revised boundary |
| CLI11 | Client goals ≠ legal merit | goal determines law / separate objective | Collapse creates an oracle, agency loss or provenance loss | Use goals only in tradeoff framing | **Core Accepted candidate** | Preserve Client goals ≠ legal merit boundary |
| CLI12 | Preferences ≠ decisions | preference auto-choice / explicit decision | Collapse creates an oracle, agency loss or provenance loss | Keep preference contextual | **Core Accepted candidate** | Preserve Preferences ≠ decisions boundary |
| CLI13 | No ClientPersonalityScore | one scalar / structured traits | Collapse creates an oracle, agency loss or provenance loss | Reject canonical personality authority | **Core Accepted candidate** | Preserve No ClientPersonalityScore boundary |
| CLI14 | No UnderstandingScore | one scalar / explicit understanding/questions | Collapse creates an oracle, agency loss or provenance loss | Reject canonical understanding score | **Core Accepted candidate** | Preserve No UnderstandingScore boundary |
| CLI15 | Communication ability ≠ mind control | charisma roll / scoped components | Collapse creates an oracle, agency loss or provenance loss | Capability affects clarity, not agency | **Core Accepted candidate** | Preserve Communication ability ≠ mind control boundary |
| CLI16 | Client belief ≠ FirmAnalysis/world truth | collapse / typed belief | Collapse creates an oracle, agency loss or provenance loss | Store belief/assertion with provenance | **Core Accepted candidate** | Preserve Client belief ≠ FirmAnalysis/world truth boundary |
| CLI17 | Client assertion ≠ truth | source says=true / assertion | Collapse creates an oracle, agency loss or provenance loss | Apply DEC-019 epistemic boundary | **Core Accepted candidate** | Preserve Client assertion ≠ truth boundary |
| CLI18 | New client information uses existing model | special truth channel / existing paths | Collapse creates an oracle, agency loss or provenance loss | Route assertions/leads to Case File/Investigation | **Core Accepted candidate** | Preserve New client information uses existing model boundary |
| CLI19 | Client correction preserves history | overwrite / temporal statements | Collapse creates an oracle, agency loss or provenance loss | Keep old and corrected versions | **Core Accepted candidate** | Preserve Client correction preserves history boundary |
| CLI20 | Options are candidates | hidden best branch / alternatives | Collapse creates an oracle, agency loss or provenance loss | Present options without oracle marker | **Core Accepted candidate** | Preserve Options are candidates boundary |
| CLI21 | Recommendation ≠ decision | auto-choice / distinct objects | Collapse creates an oracle, agency loss or provenance loss | Client may accept or reject | **Core Accepted candidate** | Preserve Recommendation ≠ decision boundary |
| CLI22 | No hidden optimal-option oracle | future optimizer / known inputs | Collapse creates an oracle, agency loss or provenance loss | No ActualState/future outcome ranking | **Core Accepted candidate** | Preserve No hidden optimal-option oracle boundary |
| CLI23 | Explicit ClientDecision | implicit preference / decision object | Collapse creates an oracle, agency loss or provenance loss | Record question, options, choice, snapshot, rationale | **Core Accepted candidate** | Preserve Explicit ClientDecision boundary |
| CLI24 | Decision ≠ authorization | same / separate | Collapse creates an oracle, agency loss or provenance loss | Permit provisional choice without permission | **Core Accepted candidate** | Preserve Decision ≠ authorization boundary |
| CLI25 | Authorization scope explicit | blanket forever / bounded scope | Collapse creates an oracle, agency loss or provenance loss | Record action/category/conditions/limits/time | **Core Accepted candidate** | Preserve Authorization scope explicit boundary |
| CLI26 | Instruction ≠ automatic execution | command mutates world / evaluated instruction | Collapse creates an oracle, agency loss or provenance loss | Create explicit Task/strategy change only | **Core Accepted candidate** | Preserve Instruction ≠ automatic execution boundary |
| CLI27 | Conflicting instructions preserve history | latest overwrite / lineage | Collapse creates an oracle, agency loss or provenance loss | Keep temporal supersession/clarification refs | **Core Accepted candidate** | Preserve Conflicting instructions preserve history boundary |
| CLI28 | Client/contact/decision-maker separable | speaker=authority / role relations | Collapse creates an oracle, agency loss or provenance loss | Support organizational authority state without doctrine | **Core Accepted candidate** | Preserve Client/contact/decision-maker separable boundary |
| CLI29 | Lawyer-client disagreement valid | auto-resolve / coexist | Collapse creates an oracle, agency loss or provenance loss | Permit further advice/escalation/strategy tension | **Core Accepted candidate** | Preserve Lawyer-client disagreement valid boundary |
| CLI30 | Relationship ≠ agreement oracle | trust forces choice / context only | Collapse creates an oracle, agency loss or provenance loss | No deterministic relationship decision | **Core Accepted candidate** | Preserve Relationship ≠ agreement oracle boundary |
| CLI31 | No trust obedience formula | Trust 87→87% comply / structured context | Collapse creates an oracle, agency loss or provenance loss | Reject universal formula | **Core Accepted candidate** | Preserve No trust obedience formula boundary |
| CLI32 | Persuasion ≠ guaranteed agreement | mind control / communication action | Collapse creates an oracle, agency loss or provenance loss | Preserve client agency | **Core Accepted candidate** | Preserve Persuasion ≠ guaranteed agreement boundary |
| CLI33 | Advice versions preserve history | in-place rewrite / version lineage | Collapse creates an oracle, agency loss or provenance loss | Keep A1/A2 and change reasons | **Core Accepted candidate** | Preserve Advice versions preserve history boundary |
| CLI34 | Decision preserves consumed advice/version | latest advice retroactive / exact refs | Collapse creates an oracle, agency loss or provenance loss | Link D1 to A1 snapshot | **Core Accepted candidate** | Preserve Decision preserves consumed advice/version boundary |
| CLI35 | Decision revisions preserve history | replace / new decision | Collapse creates an oracle, agency loss or provenance loss | Keep D1/D2 lineage | **Core Accepted candidate** | Preserve Decision revisions preserve history boundary |
| CLI36 | Interaction consumes operational capacity | free infinite calls / Task workload | Collapse creates an oracle, agency loss or provenance loss | Use DEC-026 commitments | **Core Accepted candidate** | Preserve Interaction consumes operational capacity boundary |
| CLI37 | Responsiveness can block work | auto-response / pending states | Collapse creates an oracle, agency loss or provenance loss | Permit delayed/unavailable/undecided | **Core Accepted candidate** | Preserve Responsiveness can block work boundary |
| CLI38 | Pending decision may block Task | bypass / dependency | Collapse creates an oracle, agency loss or provenance loss | Model ClientDecision as explicit dependency | **Core Accepted candidate** | Preserve Pending decision may block Task boundary |
| CLI39 | Deadline cannot fabricate consent | emergency auto-choice / no consent | Collapse creates an oracle, agency loss or provenance loss | Only future explicit rule could differ | **Core Accepted candidate** | Preserve Deadline cannot fabricate consent boundary |
| CLI40 | Settlement advice ≠ settlement | advice creates deal / separate negotiation | Collapse creates an oracle, agency loss or provenance loss | Leave negotiation mechanics future | **Core Accepted candidate** | Preserve Settlement advice ≠ settlement boundary |
| CLI41 | Authorization ≠ successful procedure | permission=filing/result / downstream chain | Collapse creates an oracle, agency loss or provenance loss | Use DEC-025 Draft/Submission semantics | **Core Accepted candidate** | Preserve Authorization ≠ successful procedure boundary |
| CLI42 | No universal satisfaction score here | hidden score / observable history | Collapse creates an oracle, agency loss or provenance loss | Defer reputation/business derivation | **Core Accepted candidate** | Preserve No universal satisfaction score here boundary |
| CLI43 | Component-wise advice capability only | AdviceSkill / components | Collapse creates an oracle, agency loss or provenance loss | Legal analysis, case knowledge, clarity, strategy separately | **Core Accepted candidate** | Preserve Component-wise advice capability only boundary |
| CLI44 | Exceptional lawyer ≠ advice oracle | best lawyer=correct/agreement / fallible | Collapse creates an oracle, agency loss or provenance loss | No truth/future/client-control guarantee | **Core Accepted candidate** | Preserve Exceptional lawyer ≠ advice oracle boundary |
| CLI45 | Direct/delegated same ontology | NPC percent / shared Task/events | Collapse creates an oracle, agency loss or provenance loss | Use same WorkProduct and interaction chain | **Core Accepted candidate** | Preserve Direct/delegated same ontology boundary |
| CLI46 | Interaction event provenance | transient dialogue / event history | Collapse creates an oracle, agency loss or provenance loss | Record participants/time/context/content/responses | **Core Accepted candidate** | Preserve Interaction event provenance boundary |
| CLI47 | Attempted communication ≠ received | send=delivery / result state | Collapse creates an oracle, agency loss or provenance loss | Preserve failed/delayed delivery | **Core Accepted candidate** | Preserve Attempted communication ≠ received boundary |
| CLI48 | Internal info ≠ automatically client-visible | Case File auto-copy / classification boundary | Collapse creates an oracle, agency loss or provenance loss | Client knowledge changes only through valid communication | **Core Accepted candidate** | Preserve Internal info ≠ automatically client-visible boundary |
| CLI49 | No hidden factual/legal/court/settlement oracle | hidden state advice / authorized inputs | Collapse creates an oracle, agency loss or provenance loss | Exclude hidden current/future outcome sources | **Core Accepted candidate** | Preserve No hidden factual/legal/court/settlement oracle boundary |
| CLI50 | Client autonomy/non-optimal choice valid | optimal-only / bounded agency | Collapse creates an oracle, agency loss or provenance loss | Allow rejection, delay, costly/nonmonetary choice | **Core Accepted candidate** | Preserve Client autonomy/non-optimal choice valid boundary |
| CLI51 | No universal rationality optimizer | utility maximizer / contextual decision | Collapse creates an oracle, agency loss or provenance loss | Do not canonize mathematically optimal client | **Core Accepted candidate** | Preserve No universal rationality optimizer boundary |
| CLI52 | Strategic consequences require explicit updates | decision mutates world / Task/action chain | Collapse creates an oracle, agency loss or provenance loss | Create/cancel/reprioritize through explicit operational events | **Core Accepted candidate** | Preserve Strategic consequences require explicit updates boundary |

## 15. Recommended reference models

```text
AdviceWorkProduct
├─ Task / performer / client / Matter refs
├─ authorized snapshot / presented typed content
├─ explanation / options / assumptions / tradeoffs / uncertainty
├─ recommendation / client questions
└─ provenance / version / history

ClientInteractionEvent
├─ participants / time / context / medium
├─ advice version / attempted / received content
├─ understanding / questions / reactions
├─ ClientDecision / Authorization / Instruction refs
└─ follow-up Tasks / history
```

## 16. Hard invariants

| # | Invariant | Status |
|---:|---|---|
| 1 | ClientInteraction is explicit | **Core Accepted candidate** |
| 2 | Advice is WorkProduct/event-based | **Core Accepted candidate** |
| 3 | FirmKnowledge ≠ ClientKnowledge | **Core Accepted candidate** |
| 4 | Available ≠ communicated | **Core Accepted candidate** |
| 5 | Communicated ≠ received | **Core Accepted candidate** |
| 6 | Received ≠ understood | **Core Accepted candidate** |
| 7 | Understood ≠ agreed | **Core Accepted candidate** |
| 8 | Agreed ≠ authorized | **Core Accepted candidate** |
| 9 | Authorized ≠ executed | **Core Accepted candidate** |
| 10 | Advice ≠ truth | **Core Accepted candidate** |
| 11 | Advice ≠ governing law | **Core Accepted candidate** |
| 12 | Advice ≠ CourtFactFinding | **Core Accepted candidate** |
| 13 | Prediction ≠ future outcome | **Core Accepted candidate** |
| 14 | No hidden win probability authority | **Core Accepted candidate** |
| 15 | Client goal ≠ legal merit | **Core Accepted candidate** |
| 16 | Preference ≠ decision | **Core Accepted candidate** |
| 17 | Risk tolerance ≠ deterministic behavior | **Core Accepted candidate** |
| 18 | No ClientPersonalityScore authority | **Core Accepted candidate** |
| 19 | No UnderstandingScore authority | **Core Accepted candidate** |
| 20 | Communication capability ≠ guaranteed understanding | **Core Accepted candidate** |
| 21 | Communication capability ≠ agreement | **Core Accepted candidate** |
| 22 | Client belief ≠ FirmAnalysis | **Core Accepted candidate** |
| 23 | Client belief ≠ ActualStateRecord | **Core Accepted candidate** |
| 24 | Client assertion ≠ truth | **Core Accepted candidate** |
| 25 | Client source lead ≠ acquired evidence | **Core Accepted candidate** |
| 26 | Client correction preserves prior statement | **Core Accepted candidate** |
| 27 | Multiple options may coexist | **Core Accepted candidate** |
| 28 | Presented option ≠ correct option | **Core Accepted candidate** |
| 29 | Recommended option ≠ correct option | **Core Accepted candidate** |
| 30 | Recommended option ≠ chosen option | **Core Accepted candidate** |
| 31 | No hidden best-choice marker | **Core Accepted candidate** |
| 32 | ClientDecision provenance preserved | **Core Accepted candidate** |
| 33 | Decision uses known information snapshot | **Core Accepted candidate** |
| 34 | Decision ≠ authorization | **Core Accepted candidate** |
| 35 | Authorization has scope | **Core Accepted candidate** |
| 36 | Broad representation ≠ infinite authorization | **Core Accepted candidate** |
| 37 | Instruction ≠ execution | **Core Accepted candidate** |
| 38 | Ambiguous instruction may require clarification | **Core Accepted candidate** |
| 39 | Changed instruction preserves history | **Core Accepted candidate** |
| 40 | ContactPerson ≠ Client automatically | **Core Accepted candidate** |
| 41 | ContactPerson ≠ DecisionMaker automatically | **Core Accepted candidate** |
| 42 | Lawyer-client disagreement valid | **Core Accepted candidate** |
| 43 | Good relationship ≠ agreement | **Core Accepted candidate** |
| 44 | Poor relationship ≠ refusal | **Core Accepted candidate** |
| 45 | Trust ≠ obedience percentage | **Core Accepted candidate** |
| 46 | Persuasion ≠ coercion | **Core Accepted candidate** |
| 47 | Advice revision preserves old advice | **Core Accepted candidate** |
| 48 | Old decision remains linked to old advice | **Core Accepted candidate** |
| 49 | Client may revise decision | **Core Accepted candidate** |
| 50 | Interaction consumes capacity | **Core Accepted candidate** |
| 51 | Client unavailability can block work | **Core Accepted candidate** |
| 52 | Pending decision can block Task | **Core Accepted candidate** |
| 53 | Priority cannot fabricate consent | **Core Accepted candidate** |
| 54 | Deadline cannot fabricate consent | **Core Accepted candidate** |
| 55 | Settlement advice ≠ settlement agreement | **Core Accepted candidate** |
| 56 | Authorization ≠ filing | **Core Accepted candidate** |
| 57 | Authorization ≠ success | **Core Accepted candidate** |
| 58 | Exceptional lawyer ≠ future oracle | **Core Accepted candidate** |
| 59 | Direct/delegated same ontology | **Core Accepted candidate** |
| 60 | Attempted communication ≠ received | **Core Accepted candidate** |
| 61 | Internal information not auto-client-visible | **Core Accepted candidate** |
| 62 | ActualStateRecord unavailable | **Core Accepted candidate** |
| 63 | Hidden legal model unavailable | **Core Accepted candidate** |
| 64 | Future judge reaction unavailable | **Core Accepted candidate** |
| 65 | Future settlement result unavailable | **Core Accepted candidate** |
| 66 | Non-optimal client decision valid | **Core Accepted candidate** |
| 67 | No universal rationality optimizer | **Core Accepted candidate** |
| 68 | All advice/decisions/authorizations preserve history | **Core Accepted candidate** |

## 17. Pressure tests (Cases 1–76)

| Case | Fixture | Expected semantic result |
|---:|---|---|
| 1 — Basic client consultation | Matter M1 AdviceTask A1 presents status, options and risks to Client C. | AdviceWorkProduct and interaction event with provenance. |
| 2 — Lawyer info not communicated | Firm knows A1/A2; consultation omits A2. | Client does not gain A2. |
| 3 — Advice sends selected information | A1, CT1 and KG4 are explicitly presented. | Only selected content enters received-information path. |
| 4 — Communicated not received | Email advice sent but delivery result failed. | Attempt exists; ClientReceivedInformation absent. |
| 5 — Received but misunderstood | Client receives risk explanation and records 'certain loss'. | Misunderstanding state possible; firm analysis unchanged. |
| 6 — Understood but disagrees | Client accurately understands settlement tradeoff and rejects it. | Understanding and disagreement coexist. |
| 7 — Agrees but no authorization | Client says recommendation makes sense. | No permission to act is inferred. |
| 8 — Explicit authorization | Client authorizes filing Draft D7 before T. | Scoped Authorization recorded. |
| 9 — Authorized but not executed | AU1 exists; no Drafting/Submission Task executed. | Authorization does not create procedural result. |
| 10 — Advice based on IssueAnalysis | Advice A2 cites IA-3 and assumptions. | Typed analysis provenance preserved. |
| 11 — Advice based on CaseTheory | A3 explains CT-A as contested strategy. | Theory not promoted to truth. |
| 12 — Advice based on disputed Statement | A4 explains option if S2 is accepted. | Statement remains disputed/conditional. |
| 13 — Advice=truth attack | Lawyer says Option A preferable; system marks objectively best. | Truth promotion forbidden. |
| 14 — Prediction=outcome attack | Advice predicts possible success; system guarantees win. | Forecast does not become outcome. |
| 15 — Hidden win probability attack | UI exposes canonical 78% from hidden model. | No hidden probability authority. |
| 16 — Goal maximize recovery | Client C1 states recovery priority. | Goal informs tradeoffs, not merits. |
| 17 — Goal minimize publicity | Client C2 prioritizes confidentiality. | Different strategy relevance without changing law. |
| 18 — Goal/legal-merit collapse | Privacy goal lowers legal merits score. | Forbidden semantic collapse. |
| 19 — Risk-averse rejects safe option | Risk-averse client rejects seemingly safe A for nonmonetary reason. | Preference does not determine choice. |
| 20 — Preference/decision collapse | Settlement openness automatically accepts offer. | Explicit decision still required. |
| 21 — ClientPersonalityScore attack | PersonalityScore 82 selects every response. | Canonical scalar rejected. |
| 22 — UnderstandingScore attack | UnderstandingScore 90 means full comprehension. | Explicit received/understanding state required. |
| 23 — Excellent communicator disagreement | Clear lawyer explanation; client still chooses B. | Capability does not force agreement. |
| 24 — Poor communicator client understands | Clumsy explanation but client asks clarifying questions and understands. | Low capability does not guarantee failure. |
| 25 — Client belief conflicts firm | Client believes W lied; FirmAnalysis says uncertain. | Belief and analysis coexist. |
| 26 — Client belief→truth attack | Client conviction marks W deceptive. | Truth mutation forbidden. |
| 27 — Client factual assertion | Client says payment approved May 4. | SourceAssertion/client statement, not fact. |
| 28 — Client source lead | Client mentions spreadsheet D9. | Lead/KnownGap may be created. |
| 29 — Lead→evidence attack | D9 mention auto-creates acquired spreadsheet. | Acquisition requires DEC-021 path. |
| 30 — Client corrects statement | T1 approved payment; T2 only saw email. | Both statements and relation preserved. |
| 31 — Old statement overwrite attack | T2 deletes T1. | History deletion forbidden. |
| 32 — Three options presented | A motion, B investigate, C defer research. | Candidates coexist; no hidden best marker. |
| 33 — Lawyer recommends B | Advice selects B under current assumptions. | Recommendation recorded separately. |
| 34 — Recommendation→decision attack | B recommendation auto-sets ClientDecision B. | Client choice required. |
| 35 — Hidden optimal choice attack | Future judge result highlights C as Best. | Hidden outcome cannot rank options. |
| 36 — Explicit ClientDecision | Client chooses B among presented options. | Decision records snapshot/options/time. |
| 37 — Decision with rationale | Client chooses B to limit publicity. | Known rationale stored without merit mutation. |
| 38 — Decision without rationale | Client chooses A and gives no reason. | Decision valid; rationale not fabricated. |
| 39 — Decision≠authorization | Client prefers settlement discussion. | No authority to accept an offer. |
| 40 — Scoped authorization | Authorize offer up to stated condition/time. | Scope/condition preserved. |
| 41 — Infinite authorization attack | General representation authorizes all future acts. | Forbidden absent explicit scope rules. |
| 42 — Client instruction | Client asks firm to pursue known lead L7. | Instruction may create evaluated Task candidate. |
| 43 — Ambiguous instruction | Client says 'do whatever it takes'. | Clarification may be required; no infinite authority. |
| 44 — Blocked instruction | Client demands impossible/unavailable filing action. | Instruction exists but execution may be blocked. |
| 45 — Changed instruction | T1 no settlement; T2 consider specified offers. | Temporal history/supersession preserved. |
| 46 — Instruction deletion attack | T2 erases T1. | Forbidden. |
| 47 — Organizational client contact | Employee C joins call for Company K. | Contact relation only. |
| 48 — Contact auto-authority attack | C's attendance grants settlement power. | Decision-maker status requires explicit authority. |
| 49 — Lawyer settlement/client refuses | Advice recommends settlement; client continues litigation. | Disagreement valid. |
| 50 — Good relationship/client refuses | High-trust context, client rejects recommendation. | Relationship not agreement oracle. |
| 51 — Bad relationship/client agrees | Strained context, client accepts reasoning. | Poor relationship not automatic refusal. |
| 52 — TrustScore obedience attack | Trust=87 yields 87% compliance. | Formula rejected. |
| 53 — Persuasion mind-control attack | Persuasive presentation overwrites client goals. | Client agency preserved. |
| 54 — Advice v1 | A1 at T1 based on CF-v1. | Version/provenance stored. |
| 55 — New evidence→Advice v2 | E8 creates A2 at T2. | A2 challenges/revises A1; both remain. |
| 56 — Retroactive advice rewrite | A2 replaces A1 content/history. | Forbidden. |
| 57 — Decision under v1 | D1 at T2 references A1. | Consumed advice version fixed. |
| 58 — v2 does not rewrite D1 | A2 later exists. | D1 remains linked to A1 snapshot. |
| 59 — Client revises decision | D2 after A2 differs from D1. | Both decisions/history preserved. |
| 60 — Advice Task consumes capacity | Lawyer has consultation prep/call/follow-up commitments. | DEC-026 workload includes interaction. |
| 61 — Client unavailable | Scheduled decision meeting has no response. | Pending/unavailable state; no consent. |
| 62 — Pending decision blocks Draft | Draft finalization depends on CD-4. | Task blocked/awaiting client. |
| 63 — High priority cannot consent | Critical filing Task lacks authorization. | Priority cannot fabricate client decision. |
| 64 — Deadline/client undecided | Deadline approaches while client is unresolved. | Risk state valid; no auto-choice. |
| 65 — Settlement advice ≠ settlement | Lawyer suggests exploring settlement. | No offer/agreement materialized. |
| 66 — Authorization to file ≠ success | Client authorizes appeal filing. | Draft/Submission/acceptance still separate. |
| 67 — Delegated associate advice | Associate performs eligible AdviceTask. | Same WorkProduct/event ontology. |
| 68 — Hidden outcome oracle attack | Advice engine reads future judge/settlement/satisfaction. | Forbidden hidden input. |
| 69 — Lawyer knowledge auto-sync attack | Firm discovers E9 without client interaction. | ClientKnowledge unchanged. |
| 70 — Advice authority laundering attack | Partner writes A7; system marks authoritative truth. | Seniority cannot certify advice. |
| 71 — Agreement auto-authorization attack | Client agrees settlement makes sense. | No authority to accept next offer. |
| 72 — Deadline-consent fabrication attack | Client unreachable near deadline. | No fabricated consent absent future explicit rule. |
| 73 — Hidden preference oracle attack | Future regret data nudges client to B. | Future satisfaction unavailable. |
| 74 — Contact authority laundering attack | Company employee C attends calls. | No settlement authority without explicit state. |
| 75 — Misunderstanding truth mutation attack | Client believes E4 proves X. | Belief may exist; Case File X not true. |
| 76 — Advice-to-task autoexecution attack | Client authorizes INV-9 after advice. | Task may be enabled/created, result not materialized. |

## 18. Communication-chain pressure test

FA1 → Advice A1 → presented PC1 → attempt CA1 → receipt → understanding CU1 → Decision CD1 → Authorization AU1 → TaskInstance TI1을 단계별로 보존한다. 어느 단계도 다음 단계를 자동 생성하지 않는다.

## 19. Information asymmetry and understanding pressure tests

Firm A1/A2/PA3/CT1/KG4 중 A1/CT1/KG4만 전달하면 client는 A2/PA3을 자동으로 알지 않는다. 같은 Advice가 두 contacts에게 receipt되어도 동일 understanding을 가정하지 않으며 exact psychology/probability는 만들지 않는다.

## 20. Goal, advice-version and authorization pressure tests

Recovery-oriented Client A와 confidentiality/speed-oriented Client B는 같은 legal merits 아래 다른 tradeoffs를 가질 수 있다. D1→A1, new E8→A2, D2→A2 lineage를 보존한다. D7 filing authorization은 Draft finalization, SubmissionAttempt, acceptance 또는 CourtRecord를 자동 생성하지 않는다.

## 21. Client blocker, relationship and workload pressure tests

Draft가 pending ClientDecision에 의존하면 awaiting-client/blocked가 가능하고 silence는 approval이 아니다. High-trust disagreement와 low-trust agreement 모두 유효하다. Direct/delegated consultations는 operational capacity와 event history를 공유한다.

## 22. Cross-case invariant matrix

| Boundary family | Cases | Result | Note |
|---|---|---|---|
| Knowledge/presentation/receipt/understanding | 1–7, 69, 75 | PASS candidate | no auto-sync |
| Advice/truth/prediction/goal | 10–24, 70, 73 | PASS candidate | no oracle/scores |
| Client assertions/leads/corrections | 25–31, 75 | PASS candidate | epistemic history |
| Options/recommendation/decision | 32–39 | PASS candidate | no hidden best |
| Authorization/instruction | 40–46, 71–72, 76 | PASS candidate | scoped; no execution |
| Organizational authority/disagreement/relationship | 47–53, 74 | PASS candidate | no obedience formula |
| Advice/decision versioning | 54–59 | PASS candidate | consumed version fixed |
| Workload/blocker/deadline | 60–64, 72 | PASS candidate | no fabricated consent |
| Settlement/filing/delegation/hidden state | 65–68, 73, 76 | PASS candidate | downstream Tasks required |

## 23. Contradiction audit

Firm/client knowledge, available/communicated/received/understood/agreed/authorized/executed collapse; Advice truth/prediction oracle; goal/merit, preference/decision, personality/understanding score, mind control; belief/world truth; lead/acquisition; correction/history; hidden best option; decision/authorization; unlimited authority; instruction/execution; contact/decision-maker; relationship/trust; advice version rewrite; free interaction; pending/deadline bypass; settlement/advice; authorization/filing; future outcome; knowledge sync; task autoexecution을 모두 금지한다. 실제 Korean ethics/privilege/authority doctrine은 주장하지 않는다.

## 24. False-PASS / False-PARTIAL audit

PASS를 위해 Korean authorization/professional-responsibility/privilege/corporate/settlement doctrine, emergency consent, client psychology, trust, satisfaction, communication probability 또는 future legal outcome을 발명하지 않는다. Psychology, UI, taxonomy, ethics, NPC AI와 economics가 TBD인 것만으로 PARTIAL을 주지 않는다.

## 25. Explicit TBD

- client identity/contact and organizational authority schema
- goals/preferences and understanding mechanics
- communication medium/delivery effects
- trust/relationship mechanics
- authorization scope/requirements
- professional responsibility and privilege/confidentiality
- responsiveness and advice generation
- client NPC decision AI and satisfaction/reputation
- billing/cost estimates
- UI/dialogue
- save/schema/API/Godot
- balancing/performance

## 26. Risks / anti-patterns

| Failure condition | Why harmful | Mitigation direction |
|---|---|---|
| Passive yes-button | client agency disappears | separate understanding/decision/authorization |
| Charisma mind control | capability overrides goals | clarity components only |
| Advice hidden answer | truth oracle | authorized fallible WorkProduct |
| Always optimal choice | uncertainty erased | non-optimal choice valid |
| One personality score | context lost | structured preferences |
| Goals irrelevant | client fantasy weakened | goal-aware tradeoffs |
| Decisions no consequence | interaction cosmetic | explicit Task updates |
| Dialogue busywork | player fatigue | bounded meaningful interactions |
| Client micromanagement | firm scaling fails | delegated updates/escalations |
| Hidden world leak | epistemic breach | no hidden inputs |
| Knowledge auto-sync | communication meaningless | presented/received tracking |
| Authorization meaningless | agency/procedure collapse | scoped permission |
| Deadline creates consent | autonomy violation | blocked/risk state |
| Relationship obedience meter | social context trivialized | no deterministic formula |
| Contact becomes authority | organizational ambiguity lost | typed decision-maker refs |
| NPC auto-advice controls player | player agency lost | same ontology/visible basis |
| Repetitive calls at scale | operational overload | ownership/escalation, exact UI TBD |

## 27. Player-facing and gameplay principle

Player should see firm assumptions, communicated content, known understanding/questions, known goals/preferences, options, recommendation, decision, authorization scope, pending decisions, history and client-blocked Tasks. Hidden correct advice, optimal choice, satisfaction, judge reaction, outcome or unknown client thoughts are not shown.

```text
best legal strategy for firm ≠ best outcome under client goals
lawyer recommendation ≠ client command
client autonomy → real strategic constraints
```

## 28. Solo → firm progression

Solo player handles consultations; associates may prepare routine explanations/updates; seniors handle complex advice; partners handle key strategic decisions/clients; larger firms may use relationship ownership and escalation chains. Exact titles and role restrictions remain future/TBD.

## 29. Suggested TEST-026

`TEST-026_CLIENT_INTERACTION_AND_ADVICE.md` should manually verify Cases 1–76 with case-specific Fixture, Expected and Observed reasoning. Repeated generic boilerplate is insufficient. This DEC does not create TEST-026.

## 30. DEC-028 candidates

Settlement / Negotiation, Witness Preparation / Court Examination, Hearing / Oral Advocacy, Firm Organization/Titles/Teams, Firm Economics/Billing을 compare한다. TEST-026에 blocker가 없으면 default는 **DEC-028 — Settlement / Negotiation**이다. ClientDecision/Authorization이 meaningful negotiation authority의 prerequisite다.

## 31. Decision summary

### Inherited Accepted

Typed Case File, Advice inputs, Task/WorkProduct, workload/capacity, drafting/filing, history/provenance와 hidden-state boundaries.

### Core Accepted candidates

CLI1–CLI52: explicit communication chain, information asymmetry, advice/decision/authorization, autonomy, workload, versions, downstream Task and no-oracle boundaries.

### Accepted candidates

None separately; all proposed decisions are core boundary candidates.

### TBD

§25 identity/psychology/authority/ethics/medium/AI/UI/economics and implementation details.

### Forbidden

- Firm/client knowledge auto-sync and any communication-stage collapse.
- Advice truth/future oracle, hidden optimal choice, personality/understanding/trust/rationality control scores.
- agreement→authorization, instruction→execution, contact→decision authority, deadline→consent.
- history rewrite, free/infinite interaction, hidden court/settlement/satisfaction access or client agency removal.

## 32. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | CLI1–CLI52 define client information asymmetry, AdviceWorkProduct, understanding/decision/scoped authorization, autonomy, operational integration, 68 invariants and 76 case-specific pressure fixtures. |

