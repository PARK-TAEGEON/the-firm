# THE FIRM — TEST-027 Settlement and Negotiation

문서 ID: TEST-LITIGATION-027  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual semantic verification  
Source of truth: `DEC-LITIGATION-028_SETTLEMENT_AND_NEGOTIATION.md` v0.1 Proposed / design review required; inherited DEC/TEST documents through DEC-027/TEST-026 v0.2 Accepted.

## 1. Purpose

DEC-028의 negotiation semantics를 implementation이나 실제 한국 settlement law가 아닌 synthetic fixture-level application으로 검증한다.

```text
NegotiationStrategy ≠ NegotiationPosition ≠ OfferDraft ≠ CommunicatedOffer
CommunicatedOffer ≠ Counteroffer ≠ Inquiry ≠ Rejection ≠ Acceptance
Acceptance ≠ SettlementAgreementCandidate ≠ SettlementAgreement ≠ Performance
SettlementAgreement ≠ ProceduralDisposition ≠ CaseClosure
```

## 2. Verdict rules

- **PASS** — DEC-028 boundary만으로 결과가 결정되고 inherited DEC와 모순 없음.
- **PARTIAL** — semantic boundary가 실제로 모호하거나 상충하는 경우에만.
- **FAIL** — 자동 승격, hidden oracle, scope/history/court boundary collapse가 관찰되는 경우.

TBD인 settlement doctrine, AI, economics, UI, performance mechanics 자체는 PARTIAL 사유가 아니다. 실제 한국법·숨은 상태·심리 확률을 발명하지 않는다.

## 3. Core fixture results (Cases 1–92)

### Case 1 — Basic NegotiationTask

**Purpose**
DEC-028의 basic negotiationtask 경계를 독립적으로 확인한다.

**Fixture**
M1의 CT-1, client goal 'speed', pending hearing과 AU-EXPLORE를 입력으로 NT-1을 생성한다.

**Manual verification**
입력에 표시된 basic negotiationtask의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NT-1은 scope·authorized snapshot·performer·dependencies를 가진다. Task 생성만으로 Offer나 합의는 생기지 않는다.

**Observed**
수동 적용 결과, nt-1은 scope·authorized snapshot·performer·dependencies를 가진다. task 생성만으로 offer나 합의는 생기지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 basic negotiationtask와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 2 — Internal position

**Purpose**
DEC-028의 internal position 경계를 독립적으로 확인한다.

**Fixture**
NP-1에 목표 120, fallback litigation, condition C와 공개하지 않을 한계를 기록한다.

**Manual verification**
입력에 표시된 internal position의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NP-1은 firm-internal strategy다. 상대방 knowledge와 CommunicatedOffer는 변하지 않는다.

**Observed**
수동 적용 결과, np-1은 firm-internal strategy다. 상대방 knowledge와 communicatedoffer는 변하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 internal position와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 3 — Internal position auto-offer attack

**Purpose**
DEC-028의 internal position auto-offer attack 경계를 독립적으로 확인한다.

**Fixture**
NP-2가 승인되자 시스템이 같은 terms의 O-2를 상대방 inbox에 넣으려 한다.

**Manual verification**
입력에 표시된 internal position auto-offer attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NEG2가 이를 금지한다. 별도 OfferDraft·authorization·communication event가 필요하다.

**Observed**
수동 적용 결과, neg2가 이를 금지한다. 별도 offerdraft·authorization·communication event가 필요하다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 internal position auto-offer attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 4 — OfferDraft

**Purpose**
DEC-028의 offerdraft 경계를 독립적으로 확인한다.

**Fixture**
변호사가 OD-1에 130 지급과 10일 기한을 작성했으나 검토 중이다.

**Manual verification**
입력에 표시된 offerdraft의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
OD-1은 내부 versioned WorkProduct다. counterparty response는 존재할 수 없다.

**Observed**
수동 적용 결과, od-1은 내부 versioned workproduct다. counterparty response는 존재할 수 없다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 offerdraft와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 5 — OfferDraft auto-send attack

**Purpose**
DEC-028의 offerdraft auto-send attack 경계를 독립적으로 확인한다.

**Fixture**
associate가 OD-2 저장 버튼을 누르자 CA-2와 delivery가 자동 생성된다.

**Manual verification**
입력에 표시된 offerdraft auto-send attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
작성은 전송이 아니므로 금지된다. 전송 action과 authority 검사가 별도다.

**Observed**
수동 적용 결과, 작성은 전송이 아니므로 금지된다. 전송 action과 authority 검사가 별도다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 offerdraft auto-send attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 6 — Offer sent

**Purpose**
DEC-028의 offer sent 경계를 독립적으로 확인한다.

**Fixture**
AU-3 범위 안의 OD-3를 lawyer가 ForumMessage 채널로 전송해 CA-3=sent를 만든다.

**Manual verification**
입력에 표시된 offer sent의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
sent event와 exact version/terms/authorization을 보존하되 receipt는 아직 추정하지 않는다.

**Observed**
수동 적용 결과, sent event와 exact version/terms/authorization을 보존하되 receipt는 아직 추정하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 offer sent와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 7 — Sent but delivery failed

**Purpose**
DEC-028의 sent but delivery failed 경계를 독립적으로 확인한다.

**Fixture**
CA-4는 잘못된 address로 sent 후 delivery_failed가 materialize된다.

**Manual verification**
입력에 표시된 sent but delivery failed의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
O-4는 전달되지 않았다. opponent knowledge나 response Task를 만들 수 없다.

**Observed**
수동 적용 결과, o-4는 전달되지 않았다. opponent knowledge나 response task를 만들 수 없다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 sent but delivery failed와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 8 — Received but no response

**Purpose**
DEC-028의 received but no response 경계를 독립적으로 확인한다.

**Fixture**
O-5 delivery/receipt가 확인됐지만 4일간 답이 없다.

**Manual verification**
입력에 표시된 received but no response의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
상태는 received/pending이다. rejection 또는 acceptance를 생성하지 않는다.

**Observed**
수동 적용 결과, 상태는 received/pending이다. rejection 또는 acceptance를 생성하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 received but no response와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 9 — Received but misunderstood

**Purpose**
DEC-028의 received but misunderstood 경계를 독립적으로 확인한다.

**Fixture**
O-6의 installment 조건을 상대방이 lump-sum으로 이해했다는 reply가 온다.

**Manual verification**
입력에 표시된 received but misunderstood의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
오해를 NegotiationStatement/clarification need로 보존하고 원 terms는 변경하지 않는다.

**Observed**
수동 적용 결과, 오해를 negotiationstatement/clarification need로 보존하고 원 terms는 변경하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 received but misunderstood와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 10 — Authority to explore settlement

**Purpose**
DEC-028의 authority to explore settlement 경계를 독립적으로 확인한다.

**Fixture**
client AU-10은 '가능성 탐색과 inquiry'만 허용한다.

**Manual verification**
입력에 표시된 authority to explore settlement의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
변호사는 관심 여부를 물을 수 있지만 Offer나 Acceptance를 만들 권한은 없다.

**Observed**
수동 적용 결과, 변호사는 관심 여부를 물을 수 있지만 offer나 acceptance를 만들 권한은 없다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 authority to explore settlement와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 11 — Explore authority auto-settle attack

**Purpose**
DEC-028의 explore authority auto-settle attack 경계를 독립적으로 확인한다.

**Fixture**
상대가 100을 제시하자 AU-10만으로 lawyer가 accept하려 한다.

**Manual verification**
입력에 표시된 explore authority auto-settle attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
explore와 settle authority가 다르므로 blocked/request-client-decision이 된다.

**Observed**
수동 적용 결과, explore와 settle authority가 다르므로 blocked/request-client-decision이 된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 explore authority auto-settle attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 12 — Scoped offer authority

**Purpose**
DEC-028의 scoped offer authority 경계를 독립적으로 확인한다.

**Fixture**
AU-12는 110–130, no confidentiality, 금요일까지 counter 권한을 준다.

**Manual verification**
입력에 표시된 scoped offer authority의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
범위 안 Offer만 authorized로 표시할 수 있고 scope ref를 붙인다.

**Observed**
수동 적용 결과, 범위 안 offer만 authorized로 표시할 수 있고 scope ref를 붙인다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 scoped offer authority와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 13 — Authority-range violation attack

**Purpose**
DEC-028의 authority-range violation attack 경계를 독립적으로 확인한다.

**Fixture**
lawyer가 AU-12로 90 및 confidentiality를 포함한 O-13을 보내려 한다.

**Manual verification**
입력에 표시된 authority-range violation attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
금액·term 모두 범위 밖이다. 새 authorization 없이는 authorized communication이 아니다.

**Observed**
수동 적용 결과, 금액·term 모두 범위 밖이다. 새 authorization 없이는 authorized communication이 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 authority-range violation attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 14 — Client revises authority

**Purpose**
DEC-028의 client revises authority 경계를 독립적으로 확인한다.

**Fixture**
T1 AU-R1=120–130, T2 client가 AU-R2=100–130으로 명시 확장한다.

**Manual verification**
입력에 표시된 client revises authority의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
R1/R2를 별도 version/history로 보존하고 T2 이후 행위만 R2를 사용할 수 있다.

**Observed**
수동 적용 결과, r1/r2를 별도 version/history로 보존하고 t2 이후 행위만 r2를 사용할 수 있다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 client revises authority와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 15 — Old authority overwrite attack

**Purpose**
DEC-028의 old authority overwrite attack 경계를 독립적으로 확인한다.

**Fixture**
R2 생성 후 시스템이 T1의 110 offer를 R1 승인으로 표시하려 한다.

**Manual verification**
입력에 표시된 old authority overwrite attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
소급 갱신은 provenance 위조다. 당시 범위 밖 상태가 그대로 남는다.

**Observed**
수동 적용 결과, 소급 갱신은 provenance 위조다. 당시 범위 밖 상태가 그대로 남는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 old authority overwrite attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 16 — Opening Offer O1

**Purpose**
DEC-028의 opening offer o1 경계를 독립적으로 확인한다.

**Fixture**
O1은 150, payment in 30 days, condition A로 전달·수신된다.

**Manual verification**
입력에 표시된 opening offer o1의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
O1은 첫 negotiation event이며 수락 여부와 별개로 완전한 terms/history를 가진다.

**Observed**
수동 적용 결과, o1은 첫 negotiation event이며 수락 여부와 별개로 완전한 terms/history를 가진다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 opening offer o1와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 17 — Counteroffer O2

**Purpose**
DEC-028의 counteroffer o2 경계를 독립적으로 확인한다.

**Fixture**
상대방은 O1에 대해 100, 60 days, condition B의 O2를 보낸다.

**Manual verification**
입력에 표시된 counteroffer o2의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
O2는 O1을 참조하는 새 Offer이고 O1은 active/history projection 규칙과 별개로 남는다.

**Observed**
수동 적용 결과, o2는 o1을 참조하는 새 offer이고 o1은 active/history projection 규칙과 별개로 남는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 counteroffer o2와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 18 — O2 overwrite O1 attack

**Purpose**
DEC-028의 o2 overwrite o1 attack 경계를 독립적으로 확인한다.

**Fixture**
UI가 counteroffer 수신 시 O1 terms를 O2 terms로 교체한다.

**Manual verification**
입력에 표시된 o2 overwrite o1 attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
금지된다. concession path와 당사자별 제안을 별도 객체로 보존해야 한다.

**Observed**
수동 적용 결과, 금지된다. concession path와 당사자별 제안을 별도 객체로 보존해야 한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 o2 overwrite o1 attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 19 — Explicit rejection

**Purpose**
DEC-028의 explicit rejection 경계를 독립적으로 확인한다.

**Fixture**
counterparty가 message R-19로 'O2를 거절한다'고 명시하고 receipt가 확인된다.

**Manual verification**
입력에 표시된 explicit rejection의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
RejectionEvent가 O2를 참조할 수 있다. 다른 future Offer 가능성까지 닫지는 않는다.

**Observed**
수동 적용 결과, rejectionevent가 o2를 참조할 수 있다. 다른 future offer 가능성까지 닫지는 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 explicit rejection와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 20 — Silence as rejection attack

**Purpose**
DEC-028의 silence as rejection attack 경계를 독립적으로 확인한다.

**Fixture**
O3 수신 후 reply가 없다는 이유로 시스템이 rejected=true로 둔다.

**Manual verification**
입력에 표시된 silence as rejection attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NoResponse는 pending일 수 있으므로 금지된다. expiration도 별도 조건이다.

**Observed**
수동 적용 결과, noresponse는 pending일 수 있으므로 금지된다. expiration도 별도 조건이다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 silence as rejection attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 21 — Inquiry

**Purpose**
DEC-028의 inquiry 경계를 독립적으로 확인한다.

**Fixture**
상대방이 '지급일을 45일로 바꿀 수 있는가?'라고 묻는다.

**Manual verification**
입력에 표시된 inquiry의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
InquiryEvent와 response Task를 만들 수 있으나 Counteroffer/Acceptance로 승격하지 않는다.

**Observed**
수동 적용 결과, inquiryevent와 response task를 만들 수 있으나 counteroffer/acceptance로 승격하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 inquiry와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 22 — Inquiry as acceptance attack

**Purpose**
DEC-028의 inquiry as acceptance attack 경계를 독립적으로 확인한다.

**Fixture**
O4 질의가 원금액 동의라는 표시로 바뀐다.

**Manual verification**
입력에 표시된 inquiry as acceptance attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
질문은 합의 의사가 아니므로 Acceptance나 agreed term을 만들 수 없다.

**Observed**
수동 적용 결과, 질문은 합의 의사가 아니므로 acceptance나 agreed term을 만들 수 없다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 inquiry as acceptance attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 23 — Offer expiration

**Purpose**
DEC-028의 offer expiration 경계를 독립적으로 확인한다.

**Fixture**
O5에 fixture-declared expiry T가 있고 T가 지나도록 acceptance가 없다.

**Manual verification**
입력에 표시된 offer expiration의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Expired state를 기록하고 original Offer 및 receipt history를 보존한다.

**Observed**
수동 적용 결과, expired state를 기록하고 original offer 및 receipt history를 보존한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 offer expiration와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 24 — Expired as rejected attack

**Purpose**
DEC-028의 expired as rejected attack 경계를 독립적으로 확인한다.

**Fixture**
시스템이 O5 expiry를 opponent rejection rationale로 기록한다.

**Manual verification**
입력에 표시된 expired as rejected attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
만료는 명시 거절이 아니므로 금지된다.

**Observed**
수동 적용 결과, 만료는 명시 거절이 아니므로 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 expired as rejected attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 25 — Offer withdrawal

**Purpose**
DEC-028의 offer withdrawal 경계를 독립적으로 확인한다.

**Fixture**
fixture가 허용한 상태에서 sender가 O6 withdrawal communication을 보낸다.

**Manual verification**
입력에 표시된 offer withdrawal의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
WithdrawalEvent가 O6를 참조하며 과거 전송·수신은 남는다.

**Observed**
수동 적용 결과, withdrawalevent가 o6를 참조하며 과거 전송·수신은 남는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 offer withdrawal와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 26 — Withdrawal deletes history attack

**Purpose**
DEC-028의 withdrawal deletes history attack 경계를 독립적으로 확인한다.

**Fixture**
withdraw 후 O6와 CA-6를 데이터에서 제거한다.

**Manual verification**
입력에 표시된 withdrawal deletes history attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
withdrawal은 deletion이 아니므로 full history가 보존되어야 한다.

**Observed**
수동 적용 결과, withdrawal은 deletion이 아니므로 full history가 보존되어야 한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 withdrawal deletes history attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 27 — Counterpart says never above X

**Purpose**
DEC-028의 counterpart says never above x 경계를 독립적으로 확인한다.

**Fixture**
상대방 NegotiationStatement NS-27은 '100 이상은 절대 불가'라고 말한다.

**Manual verification**
입력에 표시된 counterpart says never above x의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
firm은 발언 사실을 알지만 실제 maximum이나 authority는 알지 못한다.

**Observed**
수동 적용 결과, firm은 발언 사실을 알지만 실제 maximum이나 authority는 알지 못한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 counterpart says never above x와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 28 — Statement as hidden reservation value attack

**Purpose**
DEC-028의 statement as hidden reservation value attack 경계를 독립적으로 확인한다.

**Fixture**
NS-27을 OpponentReservationValue=100으로 canonicalize한다.

**Manual verification**
입력에 표시된 statement as hidden reservation value attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
말과 내부 한계가 다를 수 있으므로 hidden-value laundering이다.

**Observed**
수동 적용 결과, 말과 내부 한계가 다를 수 있으므로 hidden-value laundering이다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 statement as hidden reservation value attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 29 — Counterpart says ready for trial

**Purpose**
DEC-028의 counterpart says ready for trial 경계를 독립적으로 확인한다.

**Fixture**
NS-29='우리는 재판 준비가 끝났다'는 communication이 기록된다.

**Manual verification**
입력에 표시된 counterpart says ready for trial의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
전략 signal로 분석할 수 있지만 실제 준비도·의도 truth는 아니다.

**Observed**
수동 적용 결과, 전략 signal로 분석할 수 있지만 실제 준비도·의도 truth는 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 counterpart says ready for trial와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 30 — Statement as truth attack

**Purpose**
DEC-028의 statement as truth attack 경계를 독립적으로 확인한다.

**Fixture**
NS-29 때문에 opponent litigation readiness가 confirmed fact로 변한다.

**Manual verification**
입력에 표시된 statement as truth attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NegotiationStatement는 assertion이므로 world/CaseFile truth mutation이 금지된다.

**Observed**
수동 적용 결과, negotiationstatement는 assertion이므로 world/casefile truth mutation이 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 statement as truth attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 31 — Internal strategy info withheld

**Purpose**
DEC-028의 internal strategy info withheld 경계를 독립적으로 확인한다.

**Fixture**
NP-31에 최저 105와 급한 자금 need가 있으나 PresentedContent에는 없다.

**Manual verification**
입력에 표시된 internal strategy info withheld의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
상대방은 해당 내부 정보를 자동으로 알지 못한다. omission은 Case File 삭제도 아니다.

**Observed**
수동 적용 결과, 상대방은 해당 내부 정보를 자동으로 알지 못한다. omission은 case file 삭제도 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 internal strategy info withheld와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 32 — Disclosure

**Purpose**
DEC-028의 disclosure 경계를 독립적으로 확인한다.

**Fixture**
firm이 E7의 존재와 ARG-2를 O7 explanation에 명시적으로 포함한다.

**Manual verification**
입력에 표시된 disclosure의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
상대방에게 전달된 content refs는 추적하되 사실성·법적 정확성은 승격하지 않는다.

**Observed**
수동 적용 결과, 상대방에게 전달된 content refs는 추적하되 사실성·법적 정확성은 승격하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 disclosure와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 33 — Disclosure auto-CourtRecord attack

**Purpose**
DEC-028의 disclosure auto-courtrecord attack 경계를 독립적으로 확인한다.

**Fixture**
O7 첨부 negotiation memo를 시스템이 CR-7에 자동 삽입한다.

**Manual verification**
입력에 표시된 disclosure auto-courtrecord attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
별도 DEC-025 procedural materialization 없이 CourtRecordEntry를 만들 수 없다.

**Observed**
수동 적용 결과, 별도 dec-025 procedural materialization 없이 courtrecordentry를 만들 수 없다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 disclosure auto-courtrecord attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 34 — Exceptional negotiator

**Purpose**
DEC-028의 exceptional negotiator 경계를 독립적으로 확인한다.

**Fixture**
senior N은 known factors를 정리해 concession sequence와 질문을 더 명료하게 만든다.

**Manual verification**
입력에 표시된 exceptional negotiator의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
component 기여는 가능하지만 합의·better terms·truth를 보장하지 않는다.

**Observed**
수동 적용 결과, component 기여는 가능하지만 합의·better terms·truth를 보장하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 exceptional negotiator와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 35 — Exceptional negotiator hidden threshold attack

**Purpose**
DEC-028의 exceptional negotiator hidden threshold attack 경계를 독립적으로 확인한다.

**Fixture**
N의 높은 profile 때문에 UI가 opponent minimum 97을 표시한다.

**Manual verification**
입력에 표시된 exceptional negotiator hidden threshold attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
capability는 hidden reservation-value access 권한이 아니므로 금지된다.

**Observed**
수동 적용 결과, capability는 hidden reservation-value access 권한이 아니므로 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 exceptional negotiator hidden threshold attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 36 — NegotiationSkill percentage attack

**Purpose**
DEC-028의 negotiationskill percentage attack 경계를 독립적으로 확인한다.

**Fixture**
NegotiationSkill=92가 settlement chance 92%와 auto outcome을 결정한다.

**Manual verification**
입력에 표시된 negotiationskill percentage attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
universal skill/percentage authority를 금지하고 explicit components/events를 사용한다.

**Observed**
수동 적용 결과, universal skill/percentage authority를 금지하고 explicit components/events를 사용한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 negotiationskill percentage attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 37 — Persuasion mind-control attack

**Purpose**
DEC-028의 persuasion mind-control attack 경계를 독립적으로 확인한다.

**Fixture**
lawyer의 framing stat이 opponent의 reject decision을 accept로 덮어쓴다.

**Manual verification**
입력에 표시된 persuasion mind-control attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
상대방 agency를 침해하므로 금지된다.

**Observed**
수동 적용 결과, 상대방 agency를 침해하므로 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 persuasion mind-control attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 38 — OfferEvaluation

**Purpose**
DEC-028의 offerevaluation 경계를 독립적으로 확인한다.

**Fixture**
AE-1은 O8의 cost, timing, unresolved liability와 client goals를 비교한다.

**Manual verification**
입력에 표시된 offerevaluation의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
AE-1은 current information 기반 ProfessionalAnalysis이며 객관적 value가 아니다.

**Observed**
수동 적용 결과, ae-1은 current information 기반 professionalanalysis이며 객관적 value가 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 offerevaluation와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 39 — Evaluation auto-decision attack

**Purpose**
DEC-028의 evaluation auto-decision attack 경계를 독립적으로 확인한다.

**Fixture**
AE-1이 favorable이므로 시스템이 ClientDecision=accept를 생성한다.

**Manual verification**
입력에 표시된 evaluation auto-decision attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Advice/Evaluation과 ClientDecision이 분리되어야 한다.

**Observed**
수동 적용 결과, advice/evaluation과 clientdecision이 분리되어야 한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 evaluation auto-decision attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 40 — ClientDecision accept

**Purpose**
DEC-028의 clientdecision accept 경계를 독립적으로 확인한다.

**Fixture**
client decision-maker가 A-1/AE-2를 받고 O9 accept를 선택한다.

**Manual verification**
입력에 표시된 clientdecision accept의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
CD-40은 snapshot·rationale(if expressed)·time을 보존하고 필요한 Acceptance authorization으로 이어질 수 있다.

**Observed**
수동 적용 결과, cd-40은 snapshot·rationale(if expressed)·time을 보존하고 필요한 acceptance authorization으로 이어질 수 있다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 clientdecision accept와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 41 — ClientDecision reject

**Purpose**
DEC-028의 clientdecision reject 경계를 독립적으로 확인한다.

**Fixture**
client가 publicity condition 때문에 O10을 reject하기로 한다.

**Manual verification**
입력에 표시된 clientdecision reject의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
겉보기 monetary value와 무관하게 유효한 client choice다.

**Observed**
수동 적용 결과, 겉보기 monetary value와 무관하게 유효한 client choice다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 clientdecision reject와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 42 — ClientDecision counter

**Purpose**
DEC-028의 clientdecision counter 경계를 독립적으로 확인한다.

**Fixture**
client가 O11 대신 125와 no-publicity term을 counter하도록 결정한다.

**Manual verification**
입력에 표시된 clientdecision counter의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
결정은 새 scoped authorization/Offer 작업의 근거이지 O12 자체는 아니다.

**Observed**
수동 적용 결과, 결정은 새 scoped authorization/offer 작업의 근거이지 o12 자체는 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 clientdecision counter와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 43 — Pre-authorized range

**Purpose**
DEC-028의 pre-authorized range 경계를 독립적으로 확인한다.

**Fixture**
AU-43은 115–125와 condition C 내 counter/accept를 허용한다.

**Manual verification**
입력에 표시된 pre-authorized range의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
lawyer는 각 행위가 범위 안인지 확인하고 authority ref를 보존한다.

**Observed**
수동 적용 결과, lawyer는 각 행위가 범위 안인지 확인하고 authority ref를 보존한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 pre-authorized range와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 44 — Range exceeded

**Purpose**
DEC-028의 range exceeded 경계를 독립적으로 확인한다.

**Fixture**
상대방 O13=130을 lawyer가 AU-43으로 accept하려 한다.

**Manual verification**
입력에 표시된 range exceeded의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
130은 범위 밖이므로 새 client decision/authorization 없이 blocked다.

**Observed**
수동 적용 결과, 130은 범위 밖이므로 새 client decision/authorization 없이 blocked다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 range exceeded와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 45 — Silence as acceptance attack

**Purpose**
DEC-028의 silence as acceptance attack 경계를 독립적으로 확인한다.

**Fixture**
client와 opponent 모두 O14에 답하지 않았는데 accepted=true가 생성된다.

**Manual verification**
입력에 표시된 silence as acceptance attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
어느 쪽 silence도 explicit Acceptance를 대신하지 못한다.

**Observed**
수동 적용 결과, 어느 쪽 silence도 explicit acceptance를 대신하지 못한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 silence as acceptance attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 46 — Conditional acceptance

**Purpose**
DEC-028의 conditional acceptance 경계를 독립적으로 확인한다.

**Fixture**
counterparty가 'condition C가 문서화되면 accept'라고 답한다.

**Manual verification**
입력에 표시된 conditional acceptance의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
ConditionalAcceptance/remaining condition으로 보존하며 final agreement로 취급하지 않는다.

**Observed**
수동 적용 결과, conditionalacceptance/remaining condition으로 보존하며 final agreement로 취급하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 conditional acceptance와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 47 — Partial agreement

**Purpose**
DEC-028의 partial agreement 경계를 독립적으로 확인한다.

**Fixture**
양측이 payment amount에는 동의했지만 timing과 confidentiality는 unresolved다.

**Manual verification**
입력에 표시된 partial agreement의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
AgreedTerm과 UnresolvedTerm이 공존하며 full settlement는 없다.

**Observed**
수동 적용 결과, agreedterm과 unresolvedterm이 공존하며 full settlement는 없다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 partial agreement와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 48 — Partial agreement auto-settlement attack

**Purpose**
DEC-028의 partial agreement auto-settlement attack 경계를 독립적으로 확인한다.

**Fixture**
payment 합의만으로 시스템이 SA-48을 final 처리한다.

**Manual verification**
입력에 표시된 partial agreement auto-settlement attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
fixture상 unresolved required terms가 있으므로 금지된다.

**Observed**
수동 적용 결과, fixture상 unresolved required terms가 있으므로 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 partial agreement auto-settlement attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 49 — Term convergence

**Purpose**
DEC-028의 term convergence 경계를 독립적으로 확인한다.

**Fixture**
O15/O16 후 parties가 모든 논의 term에 같은 문구를 제안했지만 final confirmation 전이다.

**Manual verification**
입력에 표시된 term convergence의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
SettlementAgreementCandidate 작성은 가능하나 term convergence 자체는 final agreement가 아니다.

**Observed**
수동 적용 결과, settlementagreementcandidate 작성은 가능하나 term convergence 자체는 final agreement가 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 term convergence와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 50 — SettlementAgreementCandidate

**Purpose**
DEC-028의 settlementagreementcandidate 경계를 독립적으로 확인한다.

**Fixture**
SAC-1은 parties·terms·authority refs·source offers를 모아 review 중이다.

**Manual verification**
입력에 표시된 settlementagreementcandidate의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
candidate는 versioned work object이며 CaseStatus나 performance를 바꾸지 않는다.

**Observed**
수동 적용 결과, candidate는 versioned work object이며 casestatus나 performance를 바꾸지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 settlementagreementcandidate와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 51 — Candidate auto-finalization attack

**Purpose**
DEC-028의 candidate auto-finalization attack 경계를 독립적으로 확인한다.

**Fixture**
SAC-1 생성 즉시 FinalSettlementAgreement와 closure를 만든다.

**Manual verification**
입력에 표시된 candidate auto-finalization attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
명시 confirmation/finalization boundary를 건너뛰므로 금지된다.

**Observed**
수동 적용 결과, 명시 confirmation/finalization boundary를 건너뛰므로 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 candidate auto-finalization attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 52 — Final SettlementAgreement

**Purpose**
DEC-028의 final settlementagreement 경계를 독립적으로 확인한다.

**Fixture**
fixture의 명시 confirmation event 후 SA-1이 parties, terms, conditions, authority와 lineage를 가진다.

**Manual verification**
입력에 표시된 final settlementagreement의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
SA-1은 agreement object일 뿐 이행·procedural disposition은 별도다.

**Observed**
수동 적용 결과, sa-1은 agreement object일 뿐 이행·procedural disposition은 별도다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 final settlementagreement와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 53 — Agreement auto-performance attack

**Purpose**
DEC-028의 agreement auto-performance attack 경계를 독립적으로 확인한다.

**Fixture**
SA-1이 30일 후 payment를 약속하자 payment_completed가 즉시 생성된다.

**Manual verification**
입력에 표시된 agreement auto-performance attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
future obligation과 performance event를 분리해야 한다.

**Observed**
수동 적용 결과, future obligation과 performance event를 분리해야 한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 agreement auto-performance attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 54 — Agreement auto-case-closure attack

**Purpose**
DEC-028의 agreement auto-case-closure attack 경계를 독립적으로 확인한다.

**Fixture**
SA-1 finalization이 CaseStatus=Closed를 직접 만든다.

**Manual verification**
입력에 표시된 agreement auto-case-closure attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
explicit implementation/procedural Tasks 없이 closure는 금지된다.

**Observed**
수동 적용 결과, explicit implementation/procedural tasks 없이 closure는 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 agreement auto-case-closure attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 55 — Payment/performance pending

**Purpose**
DEC-028의 payment/performance pending 경계를 독립적으로 확인한다.

**Fixture**
SA-2의 첫 installment due date가 미래이고 아직 event가 없다.

**Manual verification**
입력에 표시된 payment/performance pending의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Agreement active와 performance pending을 함께 표현할 수 있다.

**Observed**
수동 적용 결과, agreement active와 performance pending을 함께 표현할 수 있다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 payment/performance pending와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 56 — Failed negotiation

**Purpose**
DEC-028의 failed negotiation 경계를 독립적으로 확인한다.

**Fixture**
client가 final offer를 거절하고 firm이 thread를 종료한다.

**Manual verification**
입력에 표시된 failed negotiation의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NoAgreement outcome은 유효하며 lawyer failure나 case merit mutation을 뜻하지 않는다.

**Observed**
수동 적용 결과, noagreement outcome은 유효하며 lawyer failure나 case merit mutation을 뜻하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 failed negotiation와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 57 — Stalemate

**Purpose**
DEC-028의 stalemate 경계를 독립적으로 확인한다.

**Fixture**
O20과 O21의 핵심 terms 차이가 좁혀지지 않고 양측이 추가 제안을 보류한다.

**Manual verification**
입력에 표시된 stalemate의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Stalemate/pending suspension을 기록하고 hidden winner를 만들지 않는다.

**Observed**
수동 적용 결과, stalemate/pending suspension을 기록하고 hidden winner를 만들지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 stalemate와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 58 — Pause

**Purpose**
DEC-028의 pause 경계를 독립적으로 확인한다.

**Fixture**
hearing result를 기다리기 위해 NT-3을 paused로 둔다.

**Manual verification**
입력에 표시된 pause의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Offer/history는 남고 pause는 rejection이나 termination이 아니다.

**Observed**
수동 적용 결과, offer/history는 남고 pause는 rejection이나 termination이 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 pause와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 59 — Resume

**Purpose**
DEC-028의 resume 경계를 독립적으로 확인한다.

**Fixture**
new procedural event 후 NT-3을 resume하고 새 NP version을 만든다.

**Manual verification**
입력에 표시된 resume의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
기존 Offer·authority·pause interval을 보존하며 초기화하지 않는다.

**Observed**
수동 적용 결과, 기존 offer·authority·pause interval을 보존하며 초기화하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 resume와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 60 — Multiple rounds

**Purpose**
DEC-028의 multiple rounds 경계를 독립적으로 확인한다.

**Fixture**
O1=150, O2=100, O3=130+C, O4=rejection response, O5=125가 순차 발생한다.

**Manual verification**
입력에 표시된 multiple rounds의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
각 객체·sender·time·terms·response lineage가 남고 latest view는 history를 대체하지 않는다.

**Observed**
수동 적용 결과, 각 객체·sender·time·terms·response lineage가 남고 latest view는 history를 대체하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 multiple rounds와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 61 — Parallel negotiation threads

**Purpose**
DEC-028의 parallel negotiation threads 경계를 독립적으로 확인한다.

**Fixture**
Party B와 payment thread, Party C와 confidentiality thread가 동시에 진행된다.

**Manual verification**
입력에 표시된 parallel negotiation threads의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
thread별 authorization/terms를 유지하며 CT-Final처럼 자동 병합하지 않는다.

**Observed**
수동 적용 결과, thread별 authorization/terms를 유지하며 ct-final처럼 자동 병합하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 parallel negotiation threads와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 62 — Deadline pressure

**Purpose**
DEC-028의 deadline pressure 경계를 독립적으로 확인한다.

**Fixture**
hearing T가 다가와 firm이 response deadline risk를 표시한다.

**Manual verification**
입력에 표시된 deadline pressure의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
압박은 strategy/priority input일 뿐 client consent나 opponent action을 생성하지 않는다.

**Observed**
수동 적용 결과, 압박은 strategy/priority input일 뿐 client consent나 opponent action을 생성하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 deadline pressure와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 63 — Deadline forces opponent attack

**Purpose**
DEC-028의 deadline forces opponent attack 경계를 독립적으로 확인한다.

**Fixture**
T 직전이라는 이유로 NPC가 O30을 자동 accept한다.

**Manual verification**
입력에 표시된 deadline forces opponent attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
deadline만으로 opponent agency를 제거할 수 없다.

**Observed**
수동 적용 결과, deadline만으로 opponent agency를 제거할 수 없다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 deadline forces opponent attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 64 — New evidence changes negotiation Advice

**Purpose**
DEC-028의 new evidence changes negotiation advice 경계를 독립적으로 확인한다.

**Fixture**
E12 acquisition 후 AE-v2는 exposure를 다르게 평가하고 new Offer 후보를 제시한다.

**Manual verification**
입력에 표시된 new evidence changes negotiation advice의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
새 evaluation은 허용되나 AE-v1/O-old는 당시 snapshot과 함께 남는다.

**Observed**
수동 적용 결과, 새 evaluation은 허용되나 ae-v1/o-old는 당시 snapshot과 함께 남는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 new evidence changes negotiation advice와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 65 — Old offer rewrite attack

**Purpose**
DEC-028의 old offer rewrite attack 경계를 독립적으로 확인한다.

**Fixture**
E12 때문에 이미 전달된 O31의 rationale/terms를 새 분석에 맞춰 바꾼다.

**Manual verification**
입력에 표시된 old offer rewrite attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
historical communication을 소급 변경하므로 금지된다.

**Observed**
수동 적용 결과, historical communication을 소급 변경하므로 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 old offer rewrite attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 66 — CaseTheory leverage

**Purpose**
DEC-028의 casetheory leverage 경계를 독립적으로 확인한다.

**Fixture**
CT-A와 known gap KG2를 NegotiationPosition이 perceived strength/vulnerability로 참조한다.

**Manual verification**
입력에 표시된 casetheory leverage의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
전략적 leverage analysis는 가능하지만 ActualState 정합성이나 truth score가 아니다.

**Observed**
수동 적용 결과, 전략적 leverage analysis는 가능하지만 actualstate 정합성이나 truth score가 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 casetheory leverage와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 67 — Hidden LeverageScore attack

**Purpose**
DEC-028의 hidden leveragescore attack 경계를 독립적으로 확인한다.

**Fixture**
ActualState와 future ruling을 사용해 Leverage=84를 표시하고 Offer를 자동 선택한다.

**Manual verification**
입력에 표시된 hidden leveragescore attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
hidden inputs와 universal authority를 모두 위반한다.

**Observed**
수동 적용 결과, hidden inputs와 universal authority를 모두 위반한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 hidden leveragescore attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 68 — High reputation auto-concession attack

**Purpose**
DEC-028의 high reputation auto-concession attack 경계를 독립적으로 확인한다.

**Fixture**
firm reputation이 높다는 이유만으로 opponent O33가 20% 양보한다.

**Manual verification**
입력에 표시된 high reputation auto-concession attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
명시 interaction/event 없이 aura concession은 금지된다.

**Observed**
수동 적용 결과, 명시 interaction/event 없이 aura concession은 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 high reputation auto-concession attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 69 — Opponent rejects favorable offer

**Purpose**
DEC-028의 opponent rejects favorable offer 경계를 독립적으로 확인한다.

**Fixture**
known goals상 유리해 보이는 O34를 opponent가 비금전 목적 때문에 reject한다.

**Manual verification**
입력에 표시된 opponent rejects favorable offer의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
비최적처럼 보이는 선택도 유효하며 system correction 대상이 아니다.

**Observed**
수동 적용 결과, 비최적처럼 보이는 선택도 유효하며 system correction 대상이 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 opponent rejects favorable offer와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 70 — Rationality optimizer attack

**Purpose**
DEC-028의 rationality optimizer attack 경계를 독립적으로 확인한다.

**Fixture**
hidden utility 계산 U(O35)=91이 opponent decision을 강제한다.

**Manual verification**
입력에 표시된 rationality optimizer attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
canonical optimizer가 agency와 bounded knowledge를 대체하므로 금지된다.

**Observed**
수동 적용 결과, canonical optimizer가 agency와 bounded knowledge를 대체하므로 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 rationality optimizer attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 71 — Direct player negotiation

**Purpose**
DEC-028의 direct player negotiation 경계를 독립적으로 확인한다.

**Fixture**
player가 terms 선택, authority 확인, OD-36 작성, send action을 수행한다.

**Manual verification**
입력에 표시된 direct player negotiation의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
동일 Offer/Communication/response/history ontology를 사용한다.

**Observed**
수동 적용 결과, 동일 offer/communication/response/history ontology를 사용한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 direct player negotiation와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 72 — Delegated negotiation

**Purpose**
DEC-028의 delegated negotiation 경계를 독립적으로 확인한다.

**Fixture**
associate가 같은 NT definition으로 OD-37을 만들고 승인 후 전달한다.

**Manual verification**
입력에 표시된 delegated negotiation의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NPC percentage shortcut 없이 동일 authority와 event gates를 통과한다.

**Observed**
수동 적용 결과, npc percentage shortcut 없이 동일 authority와 event gates를 통과한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 delegated negotiation와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 73 — Negotiation consumes workload

**Purpose**
DEC-028의 negotiation consumes workload 경계를 독립적으로 확인한다.

**Fixture**
lawyer에게 preparation 2 blocks, client call, offer drafting과 response review commitments가 생긴다.

**Manual verification**
입력에 표시된 negotiation consumes workload의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
정확한 시간 공식 없이도 DEC-026 workload에 포함되며 무한 무료 action이 아니다.

**Observed**
수동 적용 결과, 정확한 시간 공식 없이도 dec-026 workload에 포함되며 무한 무료 action이 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 negotiation consumes workload와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 74 — Client authorization blocker

**Purpose**
DEC-028의 client authorization blocker 경계를 독립적으로 확인한다.

**Fixture**
O38 대응 Task가 AU-38 부재로 assigned-but-blocked다.

**Manual verification**
입력에 표시된 client authorization blocker의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
priority가 높아도 consent를 만들지 않으며 client advice/decision Task가 필요하다.

**Observed**
수동 적용 결과, priority가 높아도 consent를 만들지 않으며 client advice/decision task가 필요하다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 client authorization blocker와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 75 — Counterparty response blocker

**Purpose**
DEC-028의 counterparty response blocker 경계를 독립적으로 확인한다.

**Fixture**
O39가 received 뒤 pending이어서 planned CounterEvaluation이 response dependency를 기다린다.

**Manual verification**
입력에 표시된 counterparty response blocker의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NoResponse 상태를 유지하며 reply 내용을 생성하지 않는다.

**Observed**
수동 적용 결과, noresponse 상태를 유지하며 reply 내용을 생성하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 counterparty response blocker와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 76 — Negotiation→CourtRecord attack

**Purpose**
DEC-028의 negotiation→courtrecord attack 경계를 독립적으로 확인한다.

**Fixture**
NT-9 전체 transcript를 filing 없이 judge input으로 넘긴다.

**Manual verification**
입력에 표시된 negotiation→courtrecord attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NEG50–52와 DEC-025를 위반하므로 CourtRecord/JII/finding 변화가 없다.

**Observed**
수동 적용 결과, neg50–52와 dec-025를 위반하므로 courtrecord/jii/finding 변화가 없다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 negotiation→courtrecord attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 77 — Hidden reservation-value oracle attack

**Purpose**
DEC-028의 hidden reservation-value oracle attack 경계를 독립적으로 확인한다.

**Fixture**
opponent internal model의 minimum X를 UI가 'Opponent minimum=X'로 노출한다.

**Manual verification**
입력에 표시된 hidden reservation-value oracle attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
정당한 communication/discovery가 없으므로 hidden state leakage로 금지된다.

**Observed**
수동 적용 결과, 정당한 communication/discovery가 없으므로 hidden state leakage로 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 hidden reservation-value oracle attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 78 — Offer authority retroactive expansion attack

**Purpose**
DEC-028의 offer authority retroactive expansion attack 경계를 독립적으로 확인한다.

**Fixture**
T1 R1만 허용된 O40 뒤 T2 R2 확장이 생기자 O40을 authorized로 rewrite한다.

**Manual verification**
입력에 표시된 offer authority retroactive expansion attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
권한은 당시 version에 묶이므로 later expansion은 과거 행위를 치유하지 않는다.

**Observed**
수동 적용 결과, 권한은 당시 version에 묶이므로 later expansion은 과거 행위를 치유하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 offer authority retroactive expansion attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 79 — Friendly-response acceptance laundering attack

**Purpose**
DEC-028의 friendly-response acceptance laundering attack 경계를 독립적으로 확인한다.

**Fixture**
reply가 '훨씬 가까워졌습니다. 계속 논의하죠'라고만 한다.

**Manual verification**
입력에 표시된 friendly-response acceptance laundering attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
positive NegotiationStatement/continuation이지 explicit Acceptance가 아니다.

**Observed**
수동 적용 결과, positive negotiationstatement/continuation이지 explicit acceptance가 아니다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 friendly-response acceptance laundering attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 80 — Settlement agreement / case closure collapse attack

**Purpose**
DEC-028의 settlement agreement / case closure collapse attack 경계를 독립적으로 확인한다.

**Fixture**
SA-4가 final이지만 fixture가 withdrawal filing을 요구하고 아직 Task가 없다.

**Manual verification**
입력에 표시된 settlement agreement / case closure collapse attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Case remains procedurally active; 즉시 Closed 전환은 금지된다.

**Observed**
수동 적용 결과, case remains procedurally active; 즉시 closed 전환은 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 settlement agreement / case closure collapse attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 81 — Negotiation statement / factual truth laundering attack

**Purpose**
DEC-028의 negotiation statement / factual truth laundering attack 경계를 독립적으로 확인한다.

**Fixture**
opponent가 '문서를 받지 못했다'고 말한다.

**Manual verification**
입력에 표시된 negotiation statement / factual truth laundering attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
NS-81로 보존할 수 있으나 CaseFile fact 'not received'로 mutate하지 않는다.

**Observed**
수동 적용 결과, ns-81로 보존할 수 있으나 casefile fact 'not received'로 mutate하지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 negotiation statement / factual truth laundering attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 82 — Client preauthorization / unlimited concession attack

**Purpose**
DEC-028의 client preauthorization / unlimited concession attack 경계를 독립적으로 확인한다.

**Fixture**
AU-R은 금액범위만 허용하는데 lawyer가 unrelated IP waiver를 추가한다.

**Manual verification**
입력에 표시된 client preauthorization / unlimited concession attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
비금전 term은 scope 밖이므로 새 authorization 없이는 허용되지 않는다.

**Observed**
수동 적용 결과, 비금전 term은 scope 밖이므로 새 authorization 없이는 허용되지 않는다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 client preauthorization / unlimited concession attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 83 — Judge hidden settlement awareness attack

**Purpose**
DEC-028의 judge hidden settlement awareness attack 경계를 독립적으로 확인한다.

**Fixture**
Judge AI가 CourtRecord에 없는 rejected O41을 읽어 disposition을 불리하게 조정한다.

**Manual verification**
입력에 표시된 judge hidden settlement awareness attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
explicit valid procedural path가 없으므로 hidden negotiation 접근과 penalty 모두 금지된다.

**Observed**
수동 적용 결과, explicit valid procedural path가 없으므로 hidden negotiation 접근과 penalty 모두 금지된다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 judge hidden settlement awareness attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 84 — Settlement history erasure attack

**Purpose**
DEC-028의 settlement history erasure attack 경계를 독립적으로 확인한다.

**Fixture**
O1→O2→O3→SA5 뒤 시스템이 SA5만 남긴다.

**Manual verification**
입력에 표시된 settlement history erasure attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Offer·communication·authority·decision lineage 전체가 보존되어야 한다.

**Observed**
수동 적용 결과, offer·communication·authority·decision lineage 전체가 보존되어야 한다. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 settlement history erasure attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 85 — Acceptance without matching terms attack

**Purpose**
DEC-028의 acceptance without matching terms attack 경계를 독립적으로 확인한다.

**Fixture**
O1=120 payable Day30 with confidentiality=yes; reply says “accept 120, but Day60.”

**Manual verification**
입력에 표시된 acceptance without matching terms attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Changed terms cannot be recorded as unconditional acceptance of O1; response is conditional/counter/fixture-defined.

**Observed**
수동 적용 결과, changed terms cannot be recorded as unconditional acceptance of o1; response is conditional/counter/fixture-defined. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 acceptance without matching terms attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 86 — Expired authorization used for valid offer attack

**Purpose**
DEC-028의 expired authorization used for valid offer attack 경계를 독립적으로 확인한다.

**Fixture**
AU1 allows 100–130 offers until Friday; lawyer sends 120 on Monday.

**Manual verification**
입력에 표시된 expired authorization used for valid offer attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Attempt may be logged, but AU1 is expired and cannot mark O2 authorized.

**Observed**
수동 적용 결과, attempt may be logged, but au1 is expired and cannot mark o2 authorized. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 expired authorization used for valid offer attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 87 — Opponent authority laundering attack

**Purpose**
DEC-028의 opponent authority laundering attack 경계를 독립적으로 확인한다.

**Fixture**
Employee E sends “We accept”; no counterparty authority state is established.

**Manual verification**
입력에 표시된 opponent authority laundering attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Communication can be recorded, but final agreement cannot be created automatically.

**Observed**
수동 적용 결과, communication can be recorded, but final agreement cannot be created automatically. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 opponent authority laundering attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 88 — Negotiation disclosure auto-evidence attack

**Purpose**
DEC-028의 negotiation disclosure auto-evidence attack 경계를 독립적으로 확인한다.

**Fixture**
Party sends D7 solely to explain bargaining position; no acquisition or filing event occurs.

**Manual verification**
입력에 표시된 negotiation disclosure auto-evidence attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Disclosure is not acquired/admitted evidence or CourtRecord without separate provenance and procedure.

**Observed**
수동 적용 결과, disclosure is not acquired/admitted evidence or courtrecord without separate provenance and procedure. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 negotiation disclosure auto-evidence attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 89 — Settlement candidate history merge attack

**Purpose**
DEC-028의 settlement candidate history merge attack 경계를 독립적으로 확인한다.

**Fixture**
O1→O2→O3 produce SAC1; each contains changed price and unresolved objection.

**Manual verification**
입력에 표시된 settlement candidate history merge attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
SAC1 references parents; it cannot delete disagreements or rewrite offers.

**Observed**
수동 적용 결과, sac1 references parents; it cannot delete disagreements or rewrite offers. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 settlement candidate history merge attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 90 — Agreement amendment retroactive overwrite attack

**Purpose**
DEC-028의 agreement amendment retroactive overwrite attack 경계를 독립적으로 확인한다.

**Fixture**
SA1 at T1 says Day30; SA2 at T2 changes to Day45.

**Manual verification**
입력에 표시된 agreement amendment retroactive overwrite attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
SA1 remains historical; SA2 has amendment lineage and effective context.

**Observed**
수동 적용 결과, sa1 remains historical; sa2 has amendment lineage and effective context. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 agreement amendment retroactive overwrite attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 91 — Delegated negotiator authority inheritance attack

**Purpose**
DEC-028의 delegated negotiator authority inheritance attack 경계를 독립적으로 확인한다.

**Fixture**
Partner P has broad AU-P; associate A is merely assigned NT-A.

**Manual verification**
입력에 표시된 delegated negotiator authority inheritance attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
A does not inherit P’s client authority absent explicit delegation object.

**Observed**
수동 적용 결과, a does not inherit p’s client authority absent explicit delegation object. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 delegated negotiator authority inheritance attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

### Case 92 — Negotiation pause resets authority/history attack

**Purpose**
DEC-028의 negotiation pause resets authority/history attack 경계를 독립적으로 확인한다.

**Fixture**
NT1 pauses after O1 and AU1; resumes after a week.

**Manual verification**
입력에 표시된 negotiation pause resets authority/history attack의 object/state를 다른 단계와 대조하고, 명시된 communication·authority·history 조건만 적용한다. hidden ActualStateRecord, hidden legal model, 미래 결과는 조회하지 않는다.

**Expected**
Pause/resume preserves offers, response states and authority versions; no clean reset.

**Observed**
수동 적용 결과, pause/resume preserves offers, response states and authority versions; no clean reset. DEC-028에서 허용된다. 별도 action/rule 없이 다음 단계로 자동 승격하거나 과거 기록을 변경하지 않는다.

**Verdict**
PASS

**Boundary note**
이 fixture의 판정은 negotiation pause resets authority/history attack와 명시된 입력에 한정된다. truth, hidden reservation value, court finding, success probability를 추론하지 않는다.

## 4. Negotiation-chain pressure test

```text
NegotiationPosition NP1 → OfferDraft OD1 → scoped Authorization AU1
→ CommunicationAttempt CA1 → delivery/receipt → CommunicatedOffer O1
→ Counteroffer O2 → OfferEvaluation AE2 → ClientDecision CD2 → Authorization AU2
→ explicit Acceptance A1 → SettlementAgreementCandidate SAC1 → explicit finalization
→ SettlementAgreement SA1 → implementation/performance Tasks → procedural Tasks → possible CaseStatus transition
```

각 transition은 독립 action/event/rule이 필요하며, 앞 단계가 뒤 단계를 자동 materialize하지 않는다.

## 5. Authority pressure test

`AU-X: range 100–130; no confidentiality; counter authority only; expires Friday`를 기준으로 90 offer, 120 Friday counter, 120 Monday offer, 120 acceptance, confidentiality 추가, unrelated waiver를 분리 검사한다. 범위·term·시간 밖 행위는 기존 권한으로 authorized 되지 않으며 invalid 행위의 구체 법적 효과는 발명하지 않는다.

## 6. Hidden reservation-value pressure test

Opponent hidden state(최저 수락액, preferred outcome, urgency, authority, satisfaction)는 visible input이 아니다. 우연히 threshold에 맞는 제안에도 `Correct Threshold` 또는 성공 보장을 표시하지 않는다.

## 7. Statement, response and no-response pressure test

‘never above 100’ 후 115 offer, friendly continuation reply, inquiry, no response와 명시 rejection을 각각 statement/pending/explicit event로 보존한다. NoResponse는 expiry가 명시된 경우에도 Expired일 뿐 자동 Rejected가 아니다.

## 8. Partial agreement and lifecycle pressure test

Payment amount/date만 합의되고 confidentiality·dismissal timing이 unresolved인 경우 PartialAgreement다. SAC는 source Offers를 참조하는 candidate이며, SA finalization 후에도 payment/performance와 procedural closure는 별도 Tasks다.

## 9. Court-boundary pressure test

Negotiation transcript, rejected offer, settlement amount 또는 internal concession range는 explicit valid procedural path 없이는 CourtRecord/JudgeInterpretationInput/CourtFactFinding이 아니다. Judge가 hidden negotiation을 읽거나 penalty를 부여하면 FAIL이다.

## 10. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---|---|---|
| Position ≠ Offer; Draft ≠ communicated | 1–5, 85 | PASS | 내부 전략·초안·외부 행위를 분리 |
| Sent/received/understood 분리 | 6–9, 55, 79 | PASS | 전달 실패·무응답·오해를 보존 |
| Explore/offer/negotiate/settle authority | 10–15, 20, 43–44, 82, 86, 91 | PASS | scope/range/expiry와 delegated authority를 확인 |
| Offer/response lifecycle | 16–26, 45, 58–60, 79, 85, 92 | PASS | counter/inquiry/rejection/expiry/withdrawal이 새 event |
| Hidden reservation/statement truth | 27–30, 35, 67, 77, 81, 87 | PASS | 상대 발언은 hidden value나 truth가 아님 |
| Disclosure/CourtRecord/finding | 31–33, 76, 81, 88 | PASS | 협상 disclosure는 법원 기록·증거 admission 아님 |
| Skill/persuasion/evaluation | 34–39, 67–70 | PASS | oracle·mind control·hidden score 없음 |
| Client decision/authorization | 40–44, 69, 82, 86, 91 | PASS | DEC-027 scoped decision chain 유지 |
| Acceptance/partial/candidate/agreement | 45–57, 71, 79, 85, 89–90 | PASS | changed terms·partial·candidate·amendment 분리 |
| Performance/closure/procedure | 53–57, 72, 80 | PASS | 합의 후 explicit downstream Task 필요 |
| History/pause/parallel/new events | 58–65, 78, 84, 89, 90, 92 | PASS | 과거 Offer·권한·thread를 삭제하지 않음 |
| Leverage/reputation/rationality | 66–70, 73 | PASS | objective leverage/사회 aura/optimizer 금지 |
| Direct/delegated/workload/blockers | 71–75, 83, 91 | PASS | 동일 ontology와 finite capacity |

## 11. Contradiction audit

| Audit | Result | Manual finding |
|---|---|---|
| DEC-028 internal separation | PASS | Position, Offer, Acceptance, Agreement and Performance are separately defined and independently tested. |
| DEC-027 authority chain | PASS | ClientDecision and scoped Authorization remain prerequisites where required; willingness never expands scope. |
| DEC-026 workload | PASS | Preparation, calls and review consume task capacity; blocked negotiation is representable. |
| DEC-025 court boundary | PASS | Negotiation disclosure and agreement do not bypass filing/materialization gates. |
| Hidden information | PASS | Reservation value, authority, utility and future outcomes remain unavailable. |
| Acceptance semantics | PASS | Silence, inquiry, changed terms and friendly responses are not unconditional acceptance. |
| Agreement lifecycle | PASS | Candidate, Agreement, performance and case closure are separate events. |
| History/provenance | PASS | Rounds, amendments, pauses, authority versions and rejected paths remain traceable. |
| False-PASS risk | PASS | No Korean doctrine, psychology probability or hidden correctness is invented. |
| False-PARTIAL risk | PASS | TBD implementation mechanics do not obscure semantic verdicts. |

검토한 항목에는 Position/Offer, draft/send, sent/received, receipt/understanding, authority scope/expiry/retroactivity, opponent authority, statement/truth, disclosure/evidence/CourtRecord, skill/persuasion, evaluation/decision, silence/inquiry/counter/changed-term acceptance, partial/candidate/final, agreement/performance/closure, amendment/pause/history, leverage/reputation/rationality, delegation, hidden judge access 및 fabricated Korean doctrine이 포함된다.

## 12. False-PASS / False-PARTIAL audit

각 PASS는 hidden truth, legal correctness, reservation value, authority doctrine, psychology probability, settlement success, mandatory terms 또는 judge reaction을 발명하지 않고 fixture-declared semantics만 사용했다. Exact settlement law, offer validity, AI, economics, UI와 performance mechanics가 TBD라는 이유로 PARTIAL을 부여하지 않았다.

## 13. Remaining TBD / NOT TESTED

- Offer/Agreement schema and negotiation thread model
- authority and counterparty authority doctrine
- Korean settlement validity and verbal/written effects
- expiry/withdrawal/confidentiality/admissibility
- multi-party negotiation and NPC AI
- valuation/economics and performance/breach/reopening
- procedural termination specifics
- UI/minigame, save/schema/API/Godot, balancing/performance

## 14. Final verification summary

```text
Total core cases: 92
PASS: 92
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none
FAIL cases: none

`PASS + PARTIAL + FAIL = 92` (92 + 0 + 0 = 92).

## 15. Promotion and next DEC

DEC-028 reopen required? **No.** Internal contradiction? **None observed.** Inherited boundary violation, hidden reservation-value/authority/legal state access, acceptance/history/court collapse 및 fabricated Korean settlement doctrine? **None observed.** Issue blocking DEC-028 promotion? **None.** Issue blocking DEC-029? **None.**

권고: `DEC-028 v0.1 → v0.2 Accepted`, `TEST-027 v0.1 → v0.2 Accepted / manual fixture-level verification`.

다음 후보는 `DEC-029 — Witness Preparation / Court Examination`이다. Witness Interview/Statement → CaseTheory → Drafting/Advice/Settlement 이후 courtroom preparation·examination·CourtRecord-compatible testimony 경계를 정의하되 prepared witness ≠ truthful witness ≠ accepted fact으로 유지한다.

## 16. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | 92 case-specific manual applications; PASS 92 / PARTIAL 0 / FAIL 0 |

