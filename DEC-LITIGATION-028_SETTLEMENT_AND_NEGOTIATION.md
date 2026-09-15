# THE FIRM — Settlement and Negotiation

문서 ID: DEC-LITIGATION-028  
버전: v0.1 — Proposed / design review required  
상태: **Proposed / design review required**  
프로젝트: THE FIRM  
문서 유형: Design Decision  
직접 기준: `DEC-LITIGATION-027_CLIENT_INTERACTION_AND_ADVICE.md` v0.2 Accepted, `TEST-026_CLIENT_INTERACTION_AND_ADVICE.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-026_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md` v0.2 Accepted, `TEST-025_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md` v0.2 Accepted / manual fixture-level verification, `DEC-LITIGATION-025_DRAFTING_PLEADING_AND_FILING.md` v0.2 Accepted, `DEC-LITIGATION-024_CASE_THEORY_AND_EVIDENCE_SYNTHESIS.md` v0.2 Accepted, `DEC-LITIGATION-023_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.2 Accepted, `DEC-LITIGATION-022_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.2 Accepted, `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.2 Accepted, `DEC-LITIGATION-020_EVIDENCE_REVIEW.md` v0.2 Accepted, `DEC-LITIGATION-019_CASE_FILE_AND_MATTER_KNOWLEDGE_MODEL.md`, `DEC-LITIGATION-018_LAWYER_TASK_AND_WORKPRODUCT_RESOLUTION.md`, `DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md`, `DEC-LITIGATION-016_LEGAL_PROFESSIONAL_PROFILE_RELATIONSHIP_AND_INTERACTION.md`  
상위 기준: `00_GAME_CONSTITUTION.md`, `01_SYSTEM_MAP.md`, `SYS-001_LITIGATION.md`

## 1. Purpose

당사자와 대리인이 법원 판단 외의 조건 합의를 탐색·교환·검토·확정하고, 유효한 합의가 별도 이행 및 절차 Task를 거쳐 사건 상태에 영향을 줄 수 있는 최소 semantic model을 정의한다.

```text
CaseTheory / IssueAnalysis / client goals / procedural status
+ NegotiationTask + known counterpart communication
+ scoped Client Authorization + lawyer strategy
→ NegotiationPosition → Offer / Counteroffer / Inquiry / Rejection / Withdrawal
→ communicated negotiation events → possible Acceptance
→ SettlementAgreementCandidate → explicit finalization
→ implementation/procedural Tasks → possible Case status transition
```

```text
NegotiationPosition ≠ Offer ≠ communicated Offer ≠ Acceptance
Acceptance ≠ SettlementAgreement ≠ performance ≠ ProceduralDisposition ≠ CaseClosure
client willingness ≠ lawyer authority
opponent position ≠ opponent hidden reservation value
```

## 2. Core problem and governing boundary

DEC-027의 Advice → ClientDecision → scoped Authorization을 실제 협상 행위로 연결하되 hidden-information gameplay와 consent laundering을 금지한다. ‘try settlement’는 무제한 체결 권한이 아니며, Offer 작성은 전달이 아니고, 우호적 답변은 Acceptance가 아니며, Agreement는 사건종결이 아니다.

## 3. Required semantic layers

```text
NegotiationStrategy
≠ NegotiationPosition
≠ OfferDraft
≠ CommunicatedOffer / Counteroffer / Inquiry / Rejection / Withdrawal
≠ AcceptanceCommunication
≠ SettlementTerms / SettlementAgreementCandidate
≠ SettlementAgreement
≠ Performance
≠ ProceduralDisposition
≠ CaseClosure
```

Exact class names may differ; these boundaries may not.

## 4. Negotiation Task and internal position

`NegotiationTaskDefinition`은 Matter/parties, authorized Case File snapshot, CaseTheory/IssueAnalysis, procedural posture, known client goals, ClientDecision/Authorization, known costs, counterpart communications, deadlines, channel, eligible roles, resources와 dependencies를 참조한다. NegotiationPosition은 desired result, acceptable conditions, priority/non-negotiable terms, possible concessions, disclosure choices, timing, fallback, assumptions, risks와 authority refs를 가진 내부 전략이다. No `NegotiationDifficulty`.

## 5. Offer, communication and response

Offer는 offering party, recipient, Matter, monetary/non-monetary terms, conditions, expiration, authorization, author/approver, time/version과 communication status를 보존한다. OfferDraft는 communication action 전까지 내부다. Sent, delivered, received, understood는 분리한다. Counteroffer는 parent를 참조하는 새 Offer다. Rejection, Inquiry, Withdrawal, Expiration, NoResponse는 서로 다른 사건/상태다.

## 6. Authority and client decision

Authority to explore, make offer, counter, accept, reject, withdraw는 fixture/policy가 구분할 수 있다. 범위·조건·기한·terms를 명시하며 later Authorization은 earlier act를 소급 변경하지 않는다. 중요한 제안은 OfferEvaluation/Advice → ClientDecision → scoped Authorization을 거친다. 정확한 한국법상 권한 요건은 TBD다.

## 7. Information asymmetry and statements

Firm은 legitimately communicated/discovered information만 안다. Opponent reservation value, internal authority, secret goals, urgency, future concession, satisfaction과 case assessment는 hidden state다. ‘never above X’ 또는 ‘ready for trial’은 NegotiationStatement이며 truth나 internal maximum이 아니다. InternalPosition과 disclosed content를 별도로 추적한다.

## 8. Evaluation, capability and autonomy

OfferEvaluation은 known client goals, costs, risks, terms와 current analysis에 기반한 fallible ProfessionalAnalysis다. No NegotiationSkill, LeverageScore, SettlementPower, hidden weighted formula or universal rationality optimizer. 뛰어난 협상가는 framing·sequencing·questions를 개선할 수 있지만 threshold를 읽거나 동의를 강제하지 않는다. Client와 opponent 모두 비최적 선택을 할 수 있다.

## 9. Acceptance, candidate and final agreement

Acceptance는 supplied semantics에 따른 explicit event다. Silence, friendly response, inquiry, counteroffer, payment discussion과 partial agreement는 Acceptance가 아니다. ConditionalAcceptance는 조건을 보존한다. agreed terms와 unresolved terms는 공존할 수 있다. term convergence 뒤 `SettlementAgreementCandidate`를 만들 수 있으나 explicit confirmation/finalization 전에는 `SettlementAgreement`가 아니다.

## 10. Agreement, performance and procedural consequences

SettlementAgreement는 parties, Matter, agreed terms, conditions/effectivity, authority refs, source events, versions/amendments, obligations와 provenance를 보존한다. Agreement reached ≠ obligations performed. Agreement ≠ withdrawal/dismissal/filing ≠ ProceduralDisposition ≠ CaseClosure. 필요한 implementation 및 DEC-025 procedural Tasks가 명시적으로 완료된 뒤에만 case status transition이 가능하다.

## 11. History, parallel threads and workload

모든 draft, Offer, communication attempt/result, evaluation, ClientDecision, Authorization, response, pause/resume와 Agreement version은 보존한다. New evidence/ruling은 새 analysis를 만들 뿐 old Offer를 rewrite하지 않는다. Multi-party/issue threads는 자동 병합하지 않는다. Negotiation preparation, client consultation, communication과 drafting은 DEC-026의 유한 capacity를 소비하며 blocker와 pending response는 유효하다.

## 12. Court and hidden-state boundary

NegotiationCommunication은 CourtRecord, JudgeInterpretationInput 또는 CourtFactFinding이 아니다. Judge는 explicit valid procedural pathway가 만든 authorized CourtRecord input만 사용할 수 있고 hidden rejected offers를 읽지 않는다. ActualStateRecord, hidden legal model, hidden opponent utility, future judge/settlement result는 negotiation strategy나 recommendation의 input이 아니다.

## 13. Direct/delegated gameplay boundary

Player와 NPC lawyer는 동일한 NegotiationTask, Position, OfferDraft, Authorization, Communication, Response, Agreement와 history ontology를 사용한다. Direct play may choose terms, timing, disclosure, concession, clarification and authority requests; exact dialogue/minigame/AI는 TBD다. Delegation은 percentage result shortcut이 아니다.

## 14. Design decisions

| ID | Problem | Alternatives | Failure modes | Recommendation | Status | Reason |
|---|---|---|---|---|---|---|
| NEG1 | 협상 업무의 추적 단위 | 암묵적 대화 / explicit NegotiationTask | 협상 준비·권한·산출물의 provenance가 사라진다 | NegotiationTaskDefinition과 TaskInstance를 명시한다 | **Core Accepted candidate** | 협상도 DEC-026의 유한한 업무다 |
| NEG2 | 내부 입장과 외부 제안 | 동일 객체 / 분리 | 초안 전략이 상대방에게 자동 공개된다 | NegotiationPosition과 Offer를 분리한다 | **Core Accepted candidate** | 내부 판단은 communication이 아니다 |
| NEG3 | 제안 초안과 전달 | 작성 즉시 효력 / 분리 | 검토 전 제안이 전송된다 | OfferDraft와 CommunicatedOffer를 분리한다 | **Core Accepted candidate** | 작성과 외부 행위는 별도다 |
| NEG4 | 전송과 수신 | 동일 상태 / 전달 결과 분리 | 실패한 전달이 수신으로 기록된다 | Sent와 Received를 별도 event/state로 둔다 | **Core Accepted candidate** | communication chain을 보존한다 |
| NEG5 | 수신과 이해 | 자동 이해 / 명시 상태 | 오해와 clarification이 표현되지 않는다 | Received와 Understood를 분리한다 | **Core Accepted candidate** | 상대방 인지는 추정하지 않는다 |
| NEG6 | 협상 권한과 체결 권한 | 포괄 권한 / scoped authority | 탐색 허가가 합의 체결로 확대된다 | authority to negotiate와 settle을 분리한다 | **Core Accepted candidate** | DEC-027의 authorization 경계를 상속한다 |
| NEG7 | 권한 범위 | 암묵적 확대 / 조건·기간·항목 보존 | 범위 밖 양보가 사후 정당화된다 | Authorization scope와 version을 보존한다 | **Core Accepted candidate** | 권한은 행위별로 제한된다 |
| NEG8 | 전략 선택 | hidden optimum / 구조화된 판단 | 미래 결과가 현재 전략을 결정한다 | hidden optimal strategy를 금지한다 | **Core Accepted candidate** | 불확실성 아래 전략이어야 한다 |
| NEG9 | Offer provenance | latest-only / version lineage | 누가 무엇을 언제 제안했는지 사라진다 | 모든 Offer의 author·authority·terms·time을 보존한다 | **Core Accepted candidate** | 협상 history의 기본 단위다 |
| NEG10 | 만료와 거절 | 동일 상태 / 분리 | 무응답 만료가 거절 의사로 세탁된다 | Expired와 Rejected를 분리한다 | **Core Accepted candidate** | 서로 다른 사건이다 |
| NEG11 | Offer withdrawal | 삭제 / 역사적 event | 철회 전 전달 사실이 사라진다 | Withdrawal은 Offer를 보존한 채 상태를 추가한다 | **Core Accepted candidate** | 철회는 비존재가 아니다 |
| NEG12 | Counteroffer | 기존 Offer 수정 / 새 객체 | 협상 경로와 조건 차이가 지워진다 | Counteroffer를 parent Offer를 참조하는 새 객체로 둔다 | **Core Accepted candidate** | 각 라운드를 추적한다 |
| NEG13 | 거절 | 침묵 추정 / 명시 event | 응답 지연이 거절로 오인된다 | Rejection은 알려진 명시 communication이어야 한다 | **Core Accepted candidate** | 의사표시를 추정하지 않는다 |
| NEG14 | 무응답 | 자동 거절 / pending | 상대방 agency와 지연 상태가 사라진다 | NoResponse를 pending 가능한 상태로 둔다 | **Core Accepted candidate** | 침묵은 거절이 아니다 |
| NEG15 | Inquiry | 수락·counter와 혼합 / 별도 event | 질문이 동의로 승격된다 | Inquiry/Clarification을 별도 타입으로 둔다 | **Core Accepted candidate** | 질문은 조건 동의가 아니다 |
| NEG16 | 상대방 내부값 | 노출 / 정보 경계 | 협상이 hidden-number guessing이 된다 | reservation value 등 hidden state 접근을 금지한다 | **Core Accepted candidate** | 합법적으로 알려진 정보만 사용한다 |
| NEG17 | 협상 발언 | truth / typed statement | 블러프가 세계 사실로 변한다 | NegotiationStatement를 assertion으로 보존한다 | **Core Accepted candidate** | 말한 내용은 진실 보증이 아니다 |
| NEG18 | 내부·공개 정보 | 자동 동기화 / 선택적 disclosure | 내부 양보 한계가 노출된다 | InternalPosition과 DisclosedPosition을 분리한다 | **Core Accepted candidate** | 무엇을 공개했는지 추적한다 |
| NEG19 | 협상 disclosure와 법원 | 자동 CourtRecord / 별도 절차 | 협상 문서가 우회 제출된다 | Disclosure는 CourtRecordEntry를 만들지 않는다 | **Core Accepted candidate** | DEC-025 gate를 유지한다 |
| NEG20 | 협상 능력 | 단일 NegotiationSkill / component contribution | 한 숫자가 결과 확률을 소유한다 | communication·strategy 등 component별 기여만 허용한다 | **Core Accepted candidate** | 보편 점수를 배제한다 |
| NEG21 | 탁월한 협상가 | oracle / fallible performer | 숨은 한계와 미래 결과를 읽는다 | 탁월함은 더 나은 framing 가능성이지 oracle이 아니다 | **Core Accepted candidate** | 능력 경계를 보존한다 |
| NEG22 | 설득 | mind control / 상대방 agency | 높은 스탯이 강제 동의를 만든다 | persuasion은 acceptance를 보장하지 않는다 | **Core Accepted candidate** | 상대방 선택을 유지한다 |
| NEG23 | OfferEvaluation | objective optimum / analysis | 평가가 client choice를 대체한다 | OfferEvaluation을 fallible ProfessionalAnalysis로 둔다 | **Core Accepted candidate** | 가치·전략 판단은 truth가 아니다 |
| NEG24 | 중요 제안의 의사결정 | 자동응답 / ClientDecision | 법률가가 client agency를 우회한다 | 필요한 fixture에서는 explicit ClientDecision을 요구한다 | **Core Accepted candidate** | DEC-027 chain을 재사용한다 |
| NEG25 | 사전권한 | 무제한 / scoped range | 인접 조건까지 권한이 확장된다 | PreAuthorization의 range·conditions·expiry를 보존한다 | **Core Accepted candidate** | 반복 협상도 범위 안에서만 가능하다 |
| NEG26 | Acceptance | 추론 / 명시 event | 우호적 반응이 수락이 된다 | AcceptanceCommunication을 명시적으로 materialize한다 | **Core Accepted candidate** | 최종 동의는 별도 의미다 |
| NEG27 | 침묵과 수락 | 자동 수락 / pending | 무응답이 계약과 종료를 만든다 | Silence는 Acceptance가 아니다 | **Core Accepted candidate** | 미래 법 규칙을 발명하지 않는다 |
| NEG28 | 부분 합의 | 자동 전체 합의 / unresolved terms | 미해결 조건이 사라진다 | AgreedTerms와 UnresolvedTerms를 함께 보존한다 | **Core Accepted candidate** | 부분 수렴은 settlement가 아니다 |
| NEG29 | 조건 수렴과 최종화 | 자동 final / candidate | 검토·확인이 생략된다 | SettlementAgreementCandidate를 별도로 둔다 | **Core Accepted candidate** | terms convergence만으로 최종 합의가 아니다 |
| NEG30 | SettlementAgreement | 암묵 상태 / explicit object | 당사자·조건·권한·근거가 사라진다 | Agreement를 provenance-bearing explicit object로 둔다 | **Core Accepted candidate** | 후속 의무와 절차의 근거다 |
| NEG31 | 합의와 이행 | 동시 / 분리 | 미지급 상태를 표현할 수 없다 | Agreement와 performance events를 분리한다 | **Core Accepted candidate** | 약속과 수행은 다르다 |
| NEG32 | 합의와 사건종결 | 즉시 종료 / 절차 분리 | 필요한 withdrawal/disposition을 건너뛴다 | Agreement ≠ CaseClosure를 강제한다 | **Core Accepted candidate** | 사건 상태는 explicit procedure로 변한다 |
| NEG33 | 협상 실패 | 오류 / 유효 outcome | 합의만이 성공으로 강제된다 | rejection·expiry·stalemate·suspension을 유효하게 둔다 | **Core Accepted candidate** | 비합의도 전략적 결과다 |
| NEG34 | pause/resume | 초기화 / 연속 history | 재개 시 과거 권한·제안이 사라진다 | Pause/Resume event와 기존 thread를 보존한다 | **Core Accepted candidate** | 시간적 맥락이 필요하다 |
| NEG35 | 여러 라운드 | latest-only / lineage | 양보 경로가 지워진다 | O1…On 전체를 보존한다 | **Core Accepted candidate** | 현재 projection과 history를 분리한다 |
| NEG36 | 병렬 협상 | 자동 병합 / 별도 threads | 상대·이슈별 권한과 terms가 섞인다 | ParallelNegotiationThread를 별도로 유지한다 | **Core Accepted candidate** | 병합은 explicit work가 필요하다 |
| NEG37 | 복수 client authority | 협상 자체 추정 / DEC-027 적용 | contact가 decision-maker로 승격된다 | ClientDecision/Authorization은 DEC-027을 따른다 | **Core Accepted candidate** | 협상은 권한 doctrine을 만들지 않는다 |
| NEG38 | deadline pressure | 강제 동의 / context | 마감이 client/opponent consent를 생성한다 | deadline은 전략 input일 뿐 consent가 아니다 | **Core Accepted candidate** | 압박과 의사표시를 구분한다 |
| NEG39 | 새 litigation event | 과거 offer rewrite / 새 분석 | 당시 정보가 사라진다 | 새 event는 새 evaluation/offer를 만들고 과거를 보존한다 | **Core Accepted candidate** | temporal provenance가 필요하다 |
| NEG40 | CaseTheory와 leverage | truth score / perceived factors | 숨은 세계가 leverage를 보정한다 | CaseTheory는 인지된 전략 input일 뿐이다 | **Core Accepted candidate** | theory ≠ objective leverage |
| NEG41 | Leverage 표현 | universal score / structured factors | 점수가 정답과 권위를 갖는다 | LeverageScore/SettlementPower를 canonical로 금지한다 | **Core Accepted candidate** | 근거·위험·비용을 구조적으로 비교한다 |
| NEG42 | 관계·명성 | aura bonus / context | 상대방 concession이 자동 발생한다 | relationship/reputation은 context만 제공한다 | **Core Accepted candidate** | 사회적 상태는 강제력이 아니다 |
| NEG43 | 상대방 선택 | 항상 최적 / 비최적 가능 | 유리한 offer 거절이 버그가 된다 | bounded-information non-optimal choice를 허용한다 | **Core Accepted candidate** | 상대방 agency를 보존한다 |
| NEG44 | 의사결정 엔진 | universal optimizer / contextual AI TBD | hidden utility가 정답을 강제한다 | canonical rationality optimizer를 금지한다 | **Core Accepted candidate** | 목표·인지·권한은 구조적으로 남긴다 |
| NEG45 | 직접·위임 | 별도 shortcut / 동일 ontology | NPC 협상이 성공 확률로 축약된다 | player/NPC에 동일 Task·Offer·authority·event 모델을 쓴다 | **Core Accepted candidate** | 경로가 semantics를 바꾸지 않는다 |
| NEG46 | 운영 비용 | 무료 / DEC-026 capacity | 무한 협상과 firm scaling 왜곡이 생긴다 | 준비·상담·communication·drafting은 capacity를 소비한다 | **Core Accepted candidate** | 업무 그래프에 연결한다 |
| NEG47 | blocker | 자동 우회 / blocked state | 없는 권한·응답·분석이 만들어진다 | Authorization/evidence/response dependency block을 허용한다 | **Core Accepted candidate** | 대기는 유효 상태다 |
| NEG48 | response delay | 자동 결론 / pending | 시간 경과가 acceptance/rejection을 만든다 | NoResponse may remain pending | **Core Accepted candidate** | timing mechanics는 TBD다 |
| NEG49 | history provenance | 요약만 / full lineage | 사후 검증과 authority audit이 불가능하다 | 모든 draft·attempt·response·decision을 추적한다 | **Core Accepted candidate** | 협상 경로를 설명한다 |
| NEG50 | 법원 기록 | 자동 입력 / explicit procedural path | 내부 협상이 JII로 누출된다 | NegotiationCommunication ≠ CourtRecord | **Core Accepted candidate** | DEC-025 materialization gate를 따른다 |
| NEG51 | 사실인정 | 협상 상태가 finding / 분리 | 양보·발언이 사실로 세탁된다 | Negotiation ≠ CourtFactFinding | **Core Accepted candidate** | 법원 판단은 downstream이다 |
| NEG52 | Judge 접근 | hidden negotiation read / authorized record only | 거절한 offer가 비밀 penalty를 만든다 | Judge는 hidden negotiation을 읽지 못한다 | **Core Accepted candidate** | 법원 epistemic boundary를 유지한다 |
| NEG53 | 합의 후속 | 즉시 상태변경 / explicit Tasks | 합의가 filing·withdrawal·closure를 생략한다 | implementation/procedural Task 후에만 status transition 가능하다 | **Core Accepted candidate** | DEC-025/026 chain을 보존한다 |
| NEG54 | 합의·협상 history | case close 시 삭제 / 영구 provenance | offer와 authority 변경이 사라진다 | Agreement와 모든 prior events를 보존한다 | **Core Accepted candidate** | 종결은 history 삭제가 아니다 |

## 15. Recommended reference model

```text
NegotiationTaskInstance
├─ Matter / thread / parties
├─ authorized snapshot / CaseTheory / IssueAnalysis
├─ ClientDecision / Authorization refs
├─ NegotiationPosition versions
├─ OfferDrafts
├─ CommunicationAttempts and delivery/receipt states
├─ Offers / Counteroffers / Statements / Inquiries / Rejections
├─ Evaluations / Advice / ClientDecisions
├─ Acceptance / partial terms / unresolved terms
├─ SettlementAgreementCandidates / Agreements
├─ performance and procedural follow-up Task refs
└─ provenance / history / blockers
```

This is a conceptual boundary model, not a final save/schema/API design.

## 16. Hard invariants

| # | Invariant |
|---:|---|
| 1 | NegotiationTask는 explicit TaskInstance다. |
| 2 | Task 생성은 NegotiationPosition 생성을 뜻하지 않는다. |
| 3 | NegotiationPosition ≠ Offer. |
| 4 | InternalPosition ≠ DisclosedPosition. |
| 5 | OfferDraft ≠ CommunicatedOffer. |
| 6 | Offer 작성 ≠ 전송. |
| 7 | Sent ≠ Delivered. |
| 8 | Delivered ≠ Received. |
| 9 | Received ≠ Understood. |
| 10 | Understood ≠ Accepted. |
| 11 | authority to explore ≠ authority to make Offer. |
| 12 | authority to negotiate ≠ authority to settle. |
| 13 | authority to counter ≠ authority to accept. |
| 14 | Authorization은 terms·range·conditions·time 범위를 보존한다. |
| 15 | 새 권한은 과거 무권한 행위를 소급 정당화하지 않는다. |
| 16 | 협상 전략에는 hidden optimal marker가 없다. |
| 17 | Offer는 author·party·recipient·terms·time·authority provenance를 가진다. |
| 18 | Offer version은 in-place overwrite되지 않는다. |
| 19 | Expired ≠ Rejected. |
| 20 | Expired Offer도 history에 남는다. |
| 21 | Withdrawal ≠ deletion. |
| 22 | Counteroffer는 새 객체다. |
| 23 | Counteroffer ≠ Acceptance. |
| 24 | Rejection은 알려진 explicit event다. |
| 25 | NoResponse ≠ Rejection. |
| 26 | NoResponse ≠ Acceptance. |
| 27 | Inquiry ≠ Counteroffer. |
| 28 | Inquiry ≠ Acceptance. |
| 29 | Friendly response ≠ Acceptance. |
| 30 | 상대방 reservation value는 firm knowledge가 아니다. |
| 31 | 상대방 internal authority는 자동 노출되지 않는다. |
| 32 | NegotiationStatement ≠ truth. |
| 33 | Bluff 가능성은 statement를 ActualStateRecord로 승격하지 않는다. |
| 34 | Disclosure ≠ evidence acquisition. |
| 35 | Disclosure ≠ CourtRecordEntry. |
| 36 | NegotiationCommunication ≠ JudgeInterpretationInput. |
| 37 | NegotiationCommunication ≠ CourtFactFinding. |
| 38 | No universal NegotiationSkill. |
| 39 | No hidden weighted negotiation formula. |
| 40 | Exceptional negotiator ≠ reservation-value oracle. |
| 41 | Exceptional negotiator ≠ guaranteed agreement. |
| 42 | Persuasion ≠ mind control. |
| 43 | OfferEvaluation ≠ objective value. |
| 44 | OfferEvaluation ≠ ClientDecision. |
| 45 | Recommended response ≠ chosen response. |
| 46 | ClientDecision은 consumed Offer/Advice snapshot을 보존한다. |
| 47 | PreAuthorization은 unlimited authority가 아니다. |
| 48 | Acceptance는 explicit event/state다. |
| 49 | ConditionalAcceptance ≠ unconditional Acceptance. |
| 50 | PartialAgreement ≠ full SettlementAgreement. |
| 51 | AgreedTerms와 UnresolvedTerms가 공존할 수 있다. |
| 52 | Term convergence ≠ final agreement. |
| 53 | SettlementAgreementCandidate ≠ SettlementAgreement. |
| 54 | SettlementAgreement는 authority와 source events를 보존한다. |
| 55 | SettlementAgreement ≠ performance. |
| 56 | Payment promised ≠ payment completed. |
| 57 | SettlementAgreement ≠ ProceduralDisposition. |
| 58 | SettlementAgreement ≠ CaseClosure. |
| 59 | Failed negotiation은 유효 outcome이다. |
| 60 | Pause ≠ termination. |
| 61 | Resume는 history를 초기화하지 않는다. |
| 62 | Multiple rounds는 모든 Offer를 보존한다. |
| 63 | Parallel threads는 auto-merge되지 않는다. |
| 64 | 복수 client authority는 DEC-027을 따른다. |
| 65 | Deadline ≠ client consent. |
| 66 | Deadline ≠ opponent acceptance. |
| 67 | 새 evidence는 old Offer를 rewrite하지 않는다. |
| 68 | CaseTheory ≠ objective leverage truth. |
| 69 | No universal LeverageScore or SettlementPower. |
| 70 | High reputation ≠ automatic concession. |
| 71 | Good relationship ≠ automatic agreement. |
| 72 | Opponent may make non-optimal choices. |
| 73 | No universal rationality optimizer. |
| 74 | Direct/delegated negotiation use same ontology. |
| 75 | Negotiation consumes finite workload/capacity. |
| 76 | Blocked negotiation may remain pending. |
| 77 | Reload does not reroll materialized negotiation events. |
| 78 | Judge cannot read hidden negotiation state. |
| 79 | Settlement consequences require explicit implementation/procedural Tasks. |
| 80 | Case status transition preserves agreement and negotiation history. |
| 81 | NegotiationTask and strategy do not query ActualStateRecord. |
| 82 | Hidden legal model is unavailable to OfferEvaluation and Advice. |
| 83 | Future settlement outcome and future opponent satisfaction are unavailable. |
| 84 | Client willingness ≠ lawyer authority. |
| 85 | An agreement or Case status transition never deletes prior negotiation events. |

Count: **85 invariants**.

## 17. Pressure tests (Cases 1–84)

| Case | Fixture | Expected semantic result |
|---:|---|---|
| 1 — Basic NegotiationTask | M1의 CT-1, client goal 'speed', pending hearing과 AU-EXPLORE를 입력으로 NT-1을 생성한다. | NT-1은 scope·authorized snapshot·performer·dependencies를 가진다. Task 생성만으로 Offer나 합의는 생기지 않는다. |
| 2 — Internal position | NP-1에 목표 120, fallback litigation, condition C와 공개하지 않을 한계를 기록한다. | NP-1은 firm-internal strategy다. 상대방 knowledge와 CommunicatedOffer는 변하지 않는다. |
| 3 — Internal position auto-offer attack | NP-2가 승인되자 시스템이 같은 terms의 O-2를 상대방 inbox에 넣으려 한다. | NEG2가 이를 금지한다. 별도 OfferDraft·authorization·communication event가 필요하다. |
| 4 — OfferDraft | 변호사가 OD-1에 130 지급과 10일 기한을 작성했으나 검토 중이다. | OD-1은 내부 versioned WorkProduct다. counterparty response는 존재할 수 없다. |
| 5 — OfferDraft auto-send attack | associate가 OD-2 저장 버튼을 누르자 CA-2와 delivery가 자동 생성된다. | 작성은 전송이 아니므로 금지된다. 전송 action과 authority 검사가 별도다. |
| 6 — Offer sent | AU-3 범위 안의 OD-3를 lawyer가 ForumMessage 채널로 전송해 CA-3=sent를 만든다. | sent event와 exact version/terms/authorization을 보존하되 receipt는 아직 추정하지 않는다. |
| 7 — Sent but delivery failed | CA-4는 잘못된 address로 sent 후 delivery_failed가 materialize된다. | O-4는 전달되지 않았다. opponent knowledge나 response Task를 만들 수 없다. |
| 8 — Received but no response | O-5 delivery/receipt가 확인됐지만 4일간 답이 없다. | 상태는 received/pending이다. rejection 또는 acceptance를 생성하지 않는다. |
| 9 — Received but misunderstood | O-6의 installment 조건을 상대방이 lump-sum으로 이해했다는 reply가 온다. | 오해를 NegotiationStatement/clarification need로 보존하고 원 terms는 변경하지 않는다. |
| 10 — Authority to explore settlement | client AU-10은 '가능성 탐색과 inquiry'만 허용한다. | 변호사는 관심 여부를 물을 수 있지만 Offer나 Acceptance를 만들 권한은 없다. |
| 11 — Explore authority auto-settle attack | 상대가 100을 제시하자 AU-10만으로 lawyer가 accept하려 한다. | explore와 settle authority가 다르므로 blocked/request-client-decision이 된다. |
| 12 — Scoped offer authority | AU-12는 110–130, no confidentiality, 금요일까지 counter 권한을 준다. | 범위 안 Offer만 authorized로 표시할 수 있고 scope ref를 붙인다. |
| 13 — Authority-range violation attack | lawyer가 AU-12로 90 및 confidentiality를 포함한 O-13을 보내려 한다. | 금액·term 모두 범위 밖이다. 새 authorization 없이는 authorized communication이 아니다. |
| 14 — Client revises authority | T1 AU-R1=120–130, T2 client가 AU-R2=100–130으로 명시 확장한다. | R1/R2를 별도 version/history로 보존하고 T2 이후 행위만 R2를 사용할 수 있다. |
| 15 — Old authority overwrite attack | R2 생성 후 시스템이 T1의 110 offer를 R1 승인으로 표시하려 한다. | 소급 갱신은 provenance 위조다. 당시 범위 밖 상태가 그대로 남는다. |
| 16 — Opening Offer O1 | O1은 150, payment in 30 days, condition A로 전달·수신된다. | O1은 첫 negotiation event이며 수락 여부와 별개로 완전한 terms/history를 가진다. |
| 17 — Counteroffer O2 | 상대방은 O1에 대해 100, 60 days, condition B의 O2를 보낸다. | O2는 O1을 참조하는 새 Offer이고 O1은 active/history projection 규칙과 별개로 남는다. |
| 18 — O2 overwrite O1 attack | UI가 counteroffer 수신 시 O1 terms를 O2 terms로 교체한다. | 금지된다. concession path와 당사자별 제안을 별도 객체로 보존해야 한다. |
| 19 — Explicit rejection | counterparty가 message R-19로 'O2를 거절한다'고 명시하고 receipt가 확인된다. | RejectionEvent가 O2를 참조할 수 있다. 다른 future Offer 가능성까지 닫지는 않는다. |
| 20 — Silence as rejection attack | O3 수신 후 reply가 없다는 이유로 시스템이 rejected=true로 둔다. | NoResponse는 pending일 수 있으므로 금지된다. expiration도 별도 조건이다. |
| 21 — Inquiry | 상대방이 '지급일을 45일로 바꿀 수 있는가?'라고 묻는다. | InquiryEvent와 response Task를 만들 수 있으나 Counteroffer/Acceptance로 승격하지 않는다. |
| 22 — Inquiry as acceptance attack | O4 질의가 원금액 동의라는 표시로 바뀐다. | 질문은 합의 의사가 아니므로 Acceptance나 agreed term을 만들 수 없다. |
| 23 — Offer expiration | O5에 fixture-declared expiry T가 있고 T가 지나도록 acceptance가 없다. | Expired state를 기록하고 original Offer 및 receipt history를 보존한다. |
| 24 — Expired as rejected attack | 시스템이 O5 expiry를 opponent rejection rationale로 기록한다. | 만료는 명시 거절이 아니므로 금지된다. |
| 25 — Offer withdrawal | fixture가 허용한 상태에서 sender가 O6 withdrawal communication을 보낸다. | WithdrawalEvent가 O6를 참조하며 과거 전송·수신은 남는다. |
| 26 — Withdrawal deletes history attack | withdraw 후 O6와 CA-6를 데이터에서 제거한다. | withdrawal은 deletion이 아니므로 full history가 보존되어야 한다. |
| 27 — Counterpart says never above X | 상대방 NegotiationStatement NS-27은 '100 이상은 절대 불가'라고 말한다. | firm은 발언 사실을 알지만 실제 maximum이나 authority는 알지 못한다. |
| 28 — Statement as hidden reservation value attack | NS-27을 OpponentReservationValue=100으로 canonicalize한다. | 말과 내부 한계가 다를 수 있으므로 hidden-value laundering이다. |
| 29 — Counterpart says ready for trial | NS-29='우리는 재판 준비가 끝났다'는 communication이 기록된다. | 전략 signal로 분석할 수 있지만 실제 준비도·의도 truth는 아니다. |
| 30 — Statement as truth attack | NS-29 때문에 opponent litigation readiness가 confirmed fact로 변한다. | NegotiationStatement는 assertion이므로 world/CaseFile truth mutation이 금지된다. |
| 31 — Internal strategy info withheld | NP-31에 최저 105와 급한 자금 need가 있으나 PresentedContent에는 없다. | 상대방은 해당 내부 정보를 자동으로 알지 못한다. omission은 Case File 삭제도 아니다. |
| 32 — Disclosure | firm이 E7의 존재와 ARG-2를 O7 explanation에 명시적으로 포함한다. | 상대방에게 전달된 content refs는 추적하되 사실성·법적 정확성은 승격하지 않는다. |
| 33 — Disclosure auto-CourtRecord attack | O7 첨부 negotiation memo를 시스템이 CR-7에 자동 삽입한다. | 별도 DEC-025 procedural materialization 없이 CourtRecordEntry를 만들 수 없다. |
| 34 — Exceptional negotiator | senior N은 known factors를 정리해 concession sequence와 질문을 더 명료하게 만든다. | component 기여는 가능하지만 합의·better terms·truth를 보장하지 않는다. |
| 35 — Exceptional negotiator hidden threshold attack | N의 높은 profile 때문에 UI가 opponent minimum 97을 표시한다. | capability는 hidden reservation-value access 권한이 아니므로 금지된다. |
| 36 — NegotiationSkill percentage attack | NegotiationSkill=92가 settlement chance 92%와 auto outcome을 결정한다. | universal skill/percentage authority를 금지하고 explicit components/events를 사용한다. |
| 37 — Persuasion mind-control attack | lawyer의 framing stat이 opponent의 reject decision을 accept로 덮어쓴다. | 상대방 agency를 침해하므로 금지된다. |
| 38 — OfferEvaluation | AE-1은 O8의 cost, timing, unresolved liability와 client goals를 비교한다. | AE-1은 current information 기반 ProfessionalAnalysis이며 객관적 value가 아니다. |
| 39 — Evaluation auto-decision attack | AE-1이 favorable이므로 시스템이 ClientDecision=accept를 생성한다. | Advice/Evaluation과 ClientDecision이 분리되어야 한다. |
| 40 — ClientDecision accept | client decision-maker가 A-1/AE-2를 받고 O9 accept를 선택한다. | CD-40은 snapshot·rationale(if expressed)·time을 보존하고 필요한 Acceptance authorization으로 이어질 수 있다. |
| 41 — ClientDecision reject | client가 publicity condition 때문에 O10을 reject하기로 한다. | 겉보기 monetary value와 무관하게 유효한 client choice다. |
| 42 — ClientDecision counter | client가 O11 대신 125와 no-publicity term을 counter하도록 결정한다. | 결정은 새 scoped authorization/Offer 작업의 근거이지 O12 자체는 아니다. |
| 43 — Pre-authorized range | AU-43은 115–125와 condition C 내 counter/accept를 허용한다. | lawyer는 각 행위가 범위 안인지 확인하고 authority ref를 보존한다. |
| 44 — Range exceeded | 상대방 O13=130을 lawyer가 AU-43으로 accept하려 한다. | 130은 범위 밖이므로 새 client decision/authorization 없이 blocked다. |
| 45 — Silence as acceptance attack | client와 opponent 모두 O14에 답하지 않았는데 accepted=true가 생성된다. | 어느 쪽 silence도 explicit Acceptance를 대신하지 못한다. |
| 46 — Conditional acceptance | counterparty가 'condition C가 문서화되면 accept'라고 답한다. | ConditionalAcceptance/remaining condition으로 보존하며 final agreement로 취급하지 않는다. |
| 47 — Partial agreement | 양측이 payment amount에는 동의했지만 timing과 confidentiality는 unresolved다. | AgreedTerm과 UnresolvedTerm이 공존하며 full settlement는 없다. |
| 48 — Partial agreement auto-settlement attack | payment 합의만으로 시스템이 SA-48을 final 처리한다. | fixture상 unresolved required terms가 있으므로 금지된다. |
| 49 — Term convergence | O15/O16 후 parties가 모든 논의 term에 같은 문구를 제안했지만 final confirmation 전이다. | SettlementAgreementCandidate 작성은 가능하나 term convergence 자체는 final agreement가 아니다. |
| 50 — SettlementAgreementCandidate | SAC-1은 parties·terms·authority refs·source offers를 모아 review 중이다. | candidate는 versioned work object이며 CaseStatus나 performance를 바꾸지 않는다. |
| 51 — Candidate auto-finalization attack | SAC-1 생성 즉시 FinalSettlementAgreement와 closure를 만든다. | 명시 confirmation/finalization boundary를 건너뛰므로 금지된다. |
| 52 — Final SettlementAgreement | fixture의 명시 confirmation event 후 SA-1이 parties, terms, conditions, authority와 lineage를 가진다. | SA-1은 agreement object일 뿐 이행·procedural disposition은 별도다. |
| 53 — Agreement auto-performance attack | SA-1이 30일 후 payment를 약속하자 payment_completed가 즉시 생성된다. | future obligation과 performance event를 분리해야 한다. |
| 54 — Agreement auto-case-closure attack | SA-1 finalization이 CaseStatus=Closed를 직접 만든다. | explicit implementation/procedural Tasks 없이 closure는 금지된다. |
| 55 — Payment/performance pending | SA-2의 첫 installment due date가 미래이고 아직 event가 없다. | Agreement active와 performance pending을 함께 표현할 수 있다. |
| 56 — Failed negotiation | client가 final offer를 거절하고 firm이 thread를 종료한다. | NoAgreement outcome은 유효하며 lawyer failure나 case merit mutation을 뜻하지 않는다. |
| 57 — Stalemate | O20과 O21의 핵심 terms 차이가 좁혀지지 않고 양측이 추가 제안을 보류한다. | Stalemate/pending suspension을 기록하고 hidden winner를 만들지 않는다. |
| 58 — Pause | hearing result를 기다리기 위해 NT-3을 paused로 둔다. | Offer/history는 남고 pause는 rejection이나 termination이 아니다. |
| 59 — Resume | new procedural event 후 NT-3을 resume하고 새 NP version을 만든다. | 기존 Offer·authority·pause interval을 보존하며 초기화하지 않는다. |
| 60 — Multiple rounds | O1=150, O2=100, O3=130+C, O4=rejection response, O5=125가 순차 발생한다. | 각 객체·sender·time·terms·response lineage가 남고 latest view는 history를 대체하지 않는다. |
| 61 — Parallel negotiation threads | Party B와 payment thread, Party C와 confidentiality thread가 동시에 진행된다. | thread별 authorization/terms를 유지하며 CT-Final처럼 자동 병합하지 않는다. |
| 62 — Deadline pressure | hearing T가 다가와 firm이 response deadline risk를 표시한다. | 압박은 strategy/priority input일 뿐 client consent나 opponent action을 생성하지 않는다. |
| 63 — Deadline forces opponent attack | T 직전이라는 이유로 NPC가 O30을 자동 accept한다. | deadline만으로 opponent agency를 제거할 수 없다. |
| 64 — New evidence changes negotiation Advice | E12 acquisition 후 AE-v2는 exposure를 다르게 평가하고 new Offer 후보를 제시한다. | 새 evaluation은 허용되나 AE-v1/O-old는 당시 snapshot과 함께 남는다. |
| 65 — Old offer rewrite attack | E12 때문에 이미 전달된 O31의 rationale/terms를 새 분석에 맞춰 바꾼다. | historical communication을 소급 변경하므로 금지된다. |
| 66 — CaseTheory leverage | CT-A와 known gap KG2를 NegotiationPosition이 perceived strength/vulnerability로 참조한다. | 전략적 leverage analysis는 가능하지만 ActualState 정합성이나 truth score가 아니다. |
| 67 — Hidden LeverageScore attack | ActualState와 future ruling을 사용해 Leverage=84를 표시하고 Offer를 자동 선택한다. | hidden inputs와 universal authority를 모두 위반한다. |
| 68 — High reputation auto-concession attack | firm reputation이 높다는 이유만으로 opponent O33가 20% 양보한다. | 명시 interaction/event 없이 aura concession은 금지된다. |
| 69 — Opponent rejects favorable offer | known goals상 유리해 보이는 O34를 opponent가 비금전 목적 때문에 reject한다. | 비최적처럼 보이는 선택도 유효하며 system correction 대상이 아니다. |
| 70 — Rationality optimizer attack | hidden utility 계산 U(O35)=91이 opponent decision을 강제한다. | canonical optimizer가 agency와 bounded knowledge를 대체하므로 금지된다. |
| 71 — Direct player negotiation | player가 terms 선택, authority 확인, OD-36 작성, send action을 수행한다. | 동일 Offer/Communication/response/history ontology를 사용한다. |
| 72 — Delegated negotiation | associate가 같은 NT definition으로 OD-37을 만들고 승인 후 전달한다. | NPC percentage shortcut 없이 동일 authority와 event gates를 통과한다. |
| 73 — Negotiation consumes workload | lawyer에게 preparation 2 blocks, client call, offer drafting과 response review commitments가 생긴다. | 정확한 시간 공식 없이도 DEC-026 workload에 포함되며 무한 무료 action이 아니다. |
| 74 — Client authorization blocker | O38 대응 Task가 AU-38 부재로 assigned-but-blocked다. | priority가 높아도 consent를 만들지 않으며 client advice/decision Task가 필요하다. |
| 75 — Counterparty response blocker | O39가 received 뒤 pending이어서 planned CounterEvaluation이 response dependency를 기다린다. | NoResponse 상태를 유지하며 reply 내용을 생성하지 않는다. |
| 76 — Negotiation→CourtRecord attack | NT-9 전체 transcript를 filing 없이 judge input으로 넘긴다. | NEG50–52와 DEC-025를 위반하므로 CourtRecord/JII/finding 변화가 없다. |
| 77 — Hidden reservation-value oracle attack | opponent internal model의 minimum X를 UI가 'Opponent minimum=X'로 노출한다. | 정당한 communication/discovery가 없으므로 hidden state leakage로 금지된다. |
| 78 — Offer authority retroactive expansion attack | T1 R1만 허용된 O40 뒤 T2 R2 확장이 생기자 O40을 authorized로 rewrite한다. | 권한은 당시 version에 묶이므로 later expansion은 과거 행위를 치유하지 않는다. |
| 79 — Friendly-response acceptance laundering attack | reply가 '훨씬 가까워졌습니다. 계속 논의하죠'라고만 한다. | positive NegotiationStatement/continuation이지 explicit Acceptance가 아니다. |
| 80 — Settlement agreement / case closure collapse attack | SA-4가 final이지만 fixture가 withdrawal filing을 요구하고 아직 Task가 없다. | Case remains procedurally active; 즉시 Closed 전환은 금지된다. |
| 81 — Negotiation statement / factual truth laundering attack | opponent가 '문서를 받지 못했다'고 말한다. | NS-81로 보존할 수 있으나 CaseFile fact 'not received'로 mutate하지 않는다. |
| 82 — Client preauthorization / unlimited concession attack | AU-R은 금액범위만 허용하는데 lawyer가 unrelated IP waiver를 추가한다. | 비금전 term은 scope 밖이므로 새 authorization 없이는 허용되지 않는다. |
| 83 — Judge hidden settlement awareness attack | Judge AI가 CourtRecord에 없는 rejected O41을 읽어 disposition을 불리하게 조정한다. | explicit valid procedural path가 없으므로 hidden negotiation 접근과 penalty 모두 금지된다. |
| 84 — Settlement history erasure attack | O1→O2→O3→SA5 뒤 시스템이 SA5만 남긴다. | Offer·communication·authority·decision lineage 전체가 보존되어야 한다. |

Count: **84 cases**.

## 18. Negotiation-chain pressure test

```text
NP1 internal
→ OD1 draft
→ AU1 scope check
→ CA1 send/delivery/receipt
→ O1 communicated
→ O2 Counteroffer
→ AE2 Advice/Evaluation
→ CD2 / AU2
→ explicit Acceptance
→ SAC1 candidate
→ explicit SA1 finalization
→ implementation/procedural Tasks
→ possible Case status transition
```

각 화살표는 action, event, authority 또는 supplied rule을 요구한다. 앞 단계의 존재만으로 뒤 단계가 자동 materialize되지 않는다.

## 19. Hidden-information pressure test

Opponent hidden model may contain reservation value, preferred outcome, urgency, authority, assessment, future concession and satisfaction. 이 값은 legitimate communication/acquisition 없이는 firm/player-visible knowledge, Advice input, tooltip 또는 assignee recommendation이 될 수 없다. Hidden value와 우연히 일치하는 Offer에도 correctness badge를 부여하지 않는다.

## 20. Authorization pressure test

```text
Authorization AU-X
range: 100–130
condition: no confidentiality clause
expires: Friday
```

AU-X는 90 제안, 140 수락, confidentiality 추가, Friday 이후 action 또는 unrelated right waiver를 허용하지 않는다. 새 AU-Y는 이후 행위를 허용할 수 있으나 과거 범위 밖 행위를 소급 승인한 것으로 rewrite하지 않는다.

## 21. Offer-history and partial-agreement pressure tests

O1=150 → O2=120 → O3=130+C → explicit rejection → O5=125의 전 라운드를 보존한다. Current active offer projection은 history가 아니다. Payment amount/date에 합의해도 confidentiality/dismissal timing이 fixture상 unresolved라면 partial agreement이며 full SettlementAgreement가 아니다. 어떤 term이 법적으로 필수인지는 이 DEC가 발명하지 않는다.

## 22. Settlement/procedure pressure test

Fixture가 SA1 이후 withdrawal filing을 요구하면 Case는 그 explicit Task와 procedural result 전까지 active다. SA1은 filing, acceptance, CourtRecord, disposition을 자동 생성하지 않는다. Agreement가 CourtRecord로 materialize될 수 있는 구체 경로는 DEC-025와 future procedure rule의 관할이다.

## 23. Relationship, reputation and direct/delegated pressure tests

High reputation + refusal, poor relationship + acceptance 모두 유효하다. Relationship은 context이고 concession aura가 아니다. 동일 NegotiationTaskDefinition에서 player와 NPC는 동일 authority, Offer, communication, response, history gates를 사용한다. `NegotiationSkill 88 → settlement 88%`는 허용되지 않는다.

## 24. Cross-case invariant matrix

| Boundary | Decisions | Tested in | Result | Note |
|---|---|---|---|---|
| Position/Draft/Communication | NEG2–NEG5 | Cases 2–9, 67 | PASS candidate | 각 단계가 독립 event/object다 |
| Authority scope | NEG6–NEG7, NEG24–NEG25, NEG37 | Cases 10–15, 40–44, 69, 78, 82 | PASS candidate | 협상·체결 권한과 temporal scope를 보존한다 |
| Offer lifecycle/history | NEG9–NEG15, NEG34–NEG35, NEG49 | Cases 16–26, 58–60, 70, 84 | PASS candidate | expiration/rejection/withdrawal/counter를 분리한다 |
| Hidden opponent state | NEG8, NEG16–NEG17 | Cases 27–30, 35, 77 | PASS candidate | 발언과 reservation value를 구분한다 |
| Disclosure/court | NEG18–NEG19, NEG50–NEG52 | Cases 31–33, 76, 81, 83 | PASS candidate | NegotiationCommunication은 court input이 아니다 |
| Capability/autonomy | NEG20–NEG23, NEG42–NEG44 | Cases 34–39, 68–70, 73 | PASS candidate | score·mind control·optimizer가 없다 |
| Acceptance/partial/candidate | NEG26–NEG30 | Cases 45–52, 71, 79 | PASS candidate | 침묵·질문·부분합의와 final agreement를 분리한다 |
| Agreement/performance/closure | NEG31–NEG33, NEG53–NEG54 | Cases 53–57, 72, 80, 84 | PASS candidate | 합의 후 explicit Task/procedure가 필요하다 |
| Parallel/change/history | NEG34–NEG39 | Cases 58–65, 78, 84 | PASS candidate | 새 사건은 과거 offer를 rewrite하지 않는다 |
| Theory/leverage | NEG40–NEG41 | Cases 66–67 | PASS candidate | CaseTheory와 score는 objective leverage가 아니다 |
| Direct/delegated/workload/blockers | NEG45–NEG48 | Cases 71–75 | PASS candidate | 동일 ontology와 finite capacity를 쓴다 |

모든 NEG1–NEG54는 위 matrix 및 Cases 1–84 중 하나 이상에서 검증 가능하다.

## 25. Contradiction audit

| Audit target | Finding | Reason |
|---|---|---|
| Internal position/Offer collapse | 없음 | NEG2–NEG3가 작성·공개를 분리한다. |
| Draft/send and sent/received collapse | 없음 | NEG3–NEG5가 communication stages를 분리한다. |
| Negotiate/settle authority collapse | 없음 | NEG6–NEG7과 DEC-027 scoped Authorization을 상속한다. |
| Authorization retroactive expansion | 없음 | later authority는 earlier history를 rewrite하지 않는다. |
| Hidden reservation-value leak | 없음 | NEG16이 firm-visible boundary를 닫는다. |
| Statement/truth collapse | 없음 | NEG17이 NegotiationStatement의 assertion 성격을 보존한다. |
| Disclosure/CourtRecord bypass | 없음 | NEG19/50과 DEC-025 gate가 요구된다. |
| NegotiationSkill/persuasion oracle | 없음 | NEG20–NEG22가 universal score와 mind control을 금지한다. |
| Evaluation/decision collapse | 없음 | NEG23–NEG25가 Advice·Decision·Authorization을 분리한다. |
| Silence/inquiry/counter/acceptance collapse | 없음 | NEG13–15 및 NEG26–27이 explicit acceptance를 요구한다. |
| Partial/candidate/final collapse | 없음 | NEG28–NEG30이 unresolved terms와 finalization을 보존한다. |
| Agreement/performance/closure collapse | 없음 | NEG31–NEG32/53이 후속 Task와 procedure를 요구한다. |
| CaseTheory/leverage truth | 없음 | NEG40–NEG41이 hidden score를 금지한다. |
| Relationship/reputation aura | 없음 | NEG42가 social context를 결정력과 구분한다. |
| Rationality optimizer | 없음 | NEG43–NEG44가 non-optimal agency를 허용한다. |
| History overwrite | 없음 | NEG9/11/12/34/35/39/49/54가 전 lineage를 보존한다. |
| Hidden judge access | 없음 | NEG50–NEG52가 negotiation/court boundary를 유지한다. |
| Inherited DEC-027 conflict | 없음 | ClientDecision/Authorization chain을 그대로 재사용한다. |
| Inherited DEC-025 conflict | 없음 | Agreement가 filing/record/disposition을 우회하지 않는다. |
| Fabricated Korean settlement doctrine | 없음 | validity·verbal effect·authority·admissibility는 TBD다. |

## 26. False-PASS / False-PARTIAL audit

PASS를 만들기 위해 한국 settlement contract law, offer/acceptance doctrine, verbal agreement effect, confidentiality/admissibility, authority, reservation value, NPC psychology, success probability, mandatory terms 또는 dismissal requirements를 발명해서는 안 된다. Fixture-declared rule과 inherited semantic boundary만 사용한다.

**Do not invent Korean settlement law.**

Settlement law, communication medium, negotiation AI, reputation effects, bargaining algorithm, economics 또는 UI가 TBD라는 이유만으로 PARTIAL로 내리지 않는다. PARTIAL은 Position/Offer, authority, acceptance, Agreement 또는 court boundary 자체가 두 해석을 허용할 때만 사용한다.

## 27. Explicit TBD

- Offer/Agreement exact schema
- negotiation thread and multi-party model
- authority requirements and catalog
- Korean settlement validity doctrine
- verbal/written agreement rules
- expiration/withdrawal legal doctrine
- confidentiality/admissibility
- counterpart goals/preferences and NPC AI
- valuation/economics
- performance/breach/reopening
- procedural termination path
- communication channel effects
- UI/minigame
- save/schema/API/Godot
- balancing/performance

## 28. Risks / anti-patterns

| Risk | Consequence | Mitigation |
|---|---|---|
| Hidden threshold guessing | 협상이 숫자 맞히기가 된다 | reservation value 비공개, known communications만 사용 |
| Persuasion mind control | opponent agency가 사라진다 | explicit response event와 non-optimal choice 허용 |
| Meaningless client authority | lawyer가 scope 밖 합의를 한다 | term/range/time별 Authorization gate |
| Offer history overwrite | 양보·권한 audit가 불가능하다 | immutable version/event lineage |
| Settlement auto-closes case | procedure와 performance가 사라진다 | explicit downstream Task/disposition |
| Opponent always rational | 행동 다양성과 목표가 사라진다 | bounded information/autonomy |
| Reputation concession aura | 사회 stat가 hidden bonus가 된다 | relationship을 context로만 사용 |
| Micromanagement overload | 모든 문구 선택이 busywork가 된다 | 중요 terms/decisions 중심의 추상화 TBD |
| Delegated probability machine | NPC 경로가 ontology를 우회한다 | direct/delegated 동일 객체와 gates |
| Hidden judge awareness | 비공개 협상이 court penalty가 된다 | CourtRecord materialization 없이는 접근 금지 |
| Case strength becomes leverage score | truth와 전략이 collapse한다 | structured factors, no aggregate authority |
| Settlement always superior/inferior | 선택이 사라진다 | client goals/cost/time/uncertainty 보존 |
| Client goals ignored | 법적 merits만으로 선택된다 | Advice/Decision에 known goals 명시 |
| No-response treated as rejection | pending 전략이 사라진다 | NoResponse 별도 상태 |
| Partial agreement ends case | 미해결 term과 procedure가 지워진다 | candidate/final/closure gate |
| Authority creep | 인접 권리까지 양보한다 | scope validation 및 새 authorization |
| Infinite negotiation | workload가 무의미해진다 | DEC-026 capacity와 blockers |
| Fabricated doctrine | 잘못된 현실법 claim이 된다 | 법적 효과·요건을 explicit TBD/fixture rule로 제한 |

## 29. Player-facing principle

Player should see known opponent communications, current/old Offers, internal strategy, client authority scope, known goals/costs/deadlines, pending response, unresolved terms and complete settlement history. Player should not see hidden reservation value, acceptance threshold, opponent utility, guaranteed Offer success, hidden judge reaction, future settlement result or canonical best Offer.

## 30. Gameplay principle

```text
legal analysis + client goals + uncertainty + scoped authority
+ time pressure + information asymmetry
→ strategic bargaining
```

Not:

```text
find hidden number → offer correct number → win negotiation
```

Client와 opponent 모두 agency를 유지한다.

## 31. Solo → firm progression

| Stage | Supported architecture |
|---|---|
| Solo | player가 Position, authority 확인과 talks를 직접 담당한다 |
| Small firm | associate가 OfferEvaluation/OfferDraft를 준비하고 player가 승인한다 |
| Senior practice | senior가 복잡한 bargaining, concessions와 clarification을 담당한다 |
| Partner-led | major terms와 client authority escalation을 관리한다 |
| Larger firm | negotiation teams, issue threads, approval chains와 workload coordination을 사용한다 |

Exact titles and organizational authority remain a future Firm Organization decision.

## 32. Suggested TEST-027

다음 문서를 후속 manual semantic verification으로 권고한다.

```text
TEST-027_SETTLEMENT_AND_NEGOTIATION.md
minimum 84 case-specific core fixtures
```

Generic boilerplate PASS는 금지하며 각 case가 concrete fixture, attacked boundary, permitted/forbidden result와 reasoning을 가져야 한다.

## 33. DEC-029 candidates

| Candidate | Dependency fit | Recommendation |
|---|---|---|
| Witness Preparation / Court Examination | Statement/interview와 courtroom bridge를 연결한다 | **Default DEC-029** if TEST-027 passes |
| Hearing / Oral Advocacy / Trial Presentation | Court presentation에 중요하나 witness preparation 선행이 유리하다 | Later |
| Firm Organization / Titles / Teams / Staffing Structure | scaling의 조직 구조를 구체화한다 | Strong parallel candidate |
| Firm Economics / Billing / Revenue | cost advice와 resource pressure를 구체화한다 | Later prerequisite candidate |
| Settlement Performance / Enforcement | Agreement 후 obligations를 확장한다 | Create only if TEST-027 exposes need |

Default: `DEC-029 — Witness Preparation / Court Examination`, provided TEST-027 confirms negotiation authority, history and court boundaries.

## 34. Decision summary

### Inherited Accepted

- DEC-016–027의 role/profile, Task/WorkProduct, Case File epistemic, Evidence/Interview/Research/Theory, Drafting/Filing, Operations와 ClientAdvice boundaries
- 특히 DEC-027의 ClientDecision/scoped Authorization과 DEC-025의 explicit CourtRecord materialization gate

### Core Accepted candidates

- NEG1–NEG54
- NegotiationPosition, OfferDraft, communication, response, Acceptance, Agreement와 procedural consequences의 단계별 분리
- scoped authority, hidden-information boundary, full negotiation provenance

### Accepted candidates

- Failed/pending/paused negotiation, partial agreement와 non-optimal client/opponent choice를 정상 상태로 인정
- Direct/delegated 동일 ontology와 DEC-026 workload integration
- Agreement 이후 explicit implementation/procedural Task를 통한 case status transition

### TBD

- §27의 exact schema, settlement doctrine, authority, AI, economics, performance, procedure와 UI

### Forbidden

- Position→Offer, Draft→Send, Sent→Received, Response→Acceptance 자동 승격
- authorization scope expansion/retroactive cure, hidden reservation-value/optimal strategy oracle
- silence/rejection/acceptance laundering, statement/truth laundering, partial/full settlement collapse
- SettlementAgreement→performance/CaseClosure, negotiation→CourtRecord/finding, hidden judge access
- NegotiationSkill/LeverageScore/reputation aura/rationality optimizer와 history deletion

## 35. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / design review required | Initial settlement and negotiation semantic model; NEG1–NEG54, 85 hard invariants and 84 pressure fixtures |
