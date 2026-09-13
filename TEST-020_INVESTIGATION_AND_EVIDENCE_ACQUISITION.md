# THE FIRM — Investigation and Evidence Acquisition

문서 ID: TEST-020  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: `DEC-LITIGATION-021_INVESTIGATION_AND_EVIDENCE_ACQUISITION.md` v0.1 Proposed / design review required

## 1. Purpose

이 문서는 DEC-021의 Investigation & Evidence Acquisition semantics를 synthetic fixture에 수동 적용해 다음 chain을 검증한다.

```text
world existence ≠ discoverable ≠ discovered ≠ accessible ≠ acquired ≠ reviewed
```

또한 `Investigation ≠ Evidence Review`, `Lead ≠ SourceMaterial ≠ truth`, `search found nothing ≠ target does not exist`, `acquired source ≠ reviewed source ≠ truth ≠ CourtRecord` 경계를 확인한다. `Observed`는 코드 실행 결과가 아닌 DEC-021의 manual fixture application이다. 이 문서는 구현 테스트나 실제 한국 법률 실무 검증이 아니다.

## 2. Verdict rules and scope

`PASS`는 DEC-021이 fixture 결과를 충분히 결정하고 inherited boundary와 모순되지 않을 때 사용한다. `PARTIAL`은 semantic boundary가 불충분하거나 둘 이상의 해석이 가능해 결과를 정할 수 없을 때만 사용한다. 알고리즘, 확률, UI, DB, NPC AI, 한국 절차가 TBD라는 이유만으로 PARTIAL을 주지 않는다. `FAIL`은 ActualStateRecord query, hidden-state leakage, Investigation/Review 또는 stage collapse, CourtRecord bypass, history overwrite, reload reroll, invented coercive power가 발생할 때다.

## 3. Inherited boundaries

- `ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`.
- Investigation Task는 ActualStateRecord를 omniscient search API로 조회하지 않는다.
- Investigation은 acquired/authorized source의 Evidence Review를 대신하지 않는다.
- Lead, source, assertion, acquisition status는 objective truth가 아니다.
- `person discovered ≠ contacted ≠ interviewed ≠ Statement obtained`.
- WorkProduct/Case File은 explicit valid procedural materialization 없이 CourtRecord/JII/ChoicePoint/finding/outcome을 바꾸지 않는다.
- Clear result는 deterministic을 지향하고, 허용된 borderline 결과는 event로 한 번 materialize하며 reload는 reroll하지 않는다.

## 4. Core cases

모든 fixture는 synthetic이다. 각 case의 `Input`은 declared starting basis, bounded domain, action과 허용 입력을 포함하며, world hidden state는 허용 입력이 아니다.

### Case 1 — Known missing attachment

**Purpose**

KnownGap이 합법적 Investigation starting basis가 되는지 확인한다.

**Fixture**

E4가 attachment A1을 참조하지만 A1은 Case File에 없다. Task는 client-authorized records에서 A1을 trace/request한다.

**Manual verification**

E4/Gap provenance, bounded domain, request action, acquisition result stage를 기록하고 hidden A1 content를 읽지 않는다.

**Expected**

유효한 시작 근거다. A1은 discovered/requested/pending/acquired 중 실제 event가 만든 단계까지만 알려진다.

**Observed**

KnownGap → bounded request Task로 표현되며, attachment 내용은 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

정확한 request route/response mechanics는 NOT TESTED / TBD.

### Case 2 — No starting basis

**Purpose**

Answer-key target과 valid investigation basis를 구분한다.

**Fixture**

Player가 근거 없이 “Find the secret offshore account”라고 요청한다.

**Manual verification**

KnownGap, Hypothesis, Issue, source/person/identifier, Lead, bounded domain 중 어느 것도 제공되지 않았는지 확인한다.

**Expected**

숨은 B4를 직접 지정해 찾는 것은 invalid다. 별도 explicit basis/domain이 생기기 전에는 omniscient target search가 없다.

**Observed**

Hidden account가 공개되지 않고 task가 유효한 Investigation으로 성립하지 않는다.

**Verdict**

PASS

**Boundary note**

Starting basis가 answer identifier일 필요가 없는 경우는 Case 38에서 별도 검증한다.

### Case 3 — Hidden world source

**Purpose**

World 존재와 발견을 분리한다.

**Fixture**

ActualStateRecord에는 E99가 있으나 Case File/Lead/domain에 E99를 가리키는 정보가 없다.

**Manual verification**

Task input에 E99가 포함되지 않았는지, search action이 hidden index를 호출하지 않는지 확인한다.

**Expected**

E99는 자동 발견되지 않고 unknown으로 남는다.

**Observed**

허용된 basis가 없어 E99가 WorkProduct에 나타나지 않는다.

**Verdict**

PASS

**Boundary note**

Discoverability algorithm은 TBD이며, discoverability metadata를 player에게 노출하지 않는다.

### Case 4 — Lead from source

**Purpose**

Source assertion에서 Lead가 생성되는 chain을 검증한다.

**Fixture**

E4가 Person P7을 언급한다.

**Manual verification**

E4 assertion → Lead L-P7 origin과 suggested action을 기록한다.

**Expected**

P7은 provenance-bearing Lead/known candidate가 될 수 있다.

**Observed**

P7은 방향 정보로만 생성되고 witness, evidence, truth로 승격되지 않는다.

**Verdict**

PASS

**Boundary note**

Lead relevance/cooperation은 NOT TESTED / TBD.

### Case 5 — Lead from witness

**Purpose**

Known witness의 assertion이 후속 Lead가 되는지 확인한다.

**Fixture**

Known W3가 “P7 may know something”이라고 말한다.

**Manual verification**

W3 statement/assertion provenance와 P7 Lead를 연결한다.

**Expected**

P7 Lead는 유효하다. P7의 관련성·진실성·협조는 미결이다.

**Observed**

Lead만 생성되고 Statement나 evidence는 자동 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

Interview/Statement semantics는 future DEC/TBD.

### Case 6 — False Lead

**Purpose**

False/dead Lead가 정상 결과인지 확인한다.

**Fixture**

P7을 접촉했으나 사건과 관련된 정보를 알지 못한다.

**Manual verification**

Lead origin, contact ActionAttempt, no-useful-result Result와 time/provenance를 보존한다.

**Expected**

False 또는 dead Lead와 structured no-useful result가 가능하다.

**Observed**

P7이 자동으로 유용한 source로 바뀌지 않고 실패 이력이 남는다.

**Verdict**

PASS

**Boundary note**

False-lead classification vocabulary는 TBD.

### Case 7 — Source existence discovered

**Purpose**

Discovery와 acquisition을 분리한다.

**Fixture**

Investigator가 CCTV가 존재한다는 사실을 합법적 interaction으로 알게 된다.

**Manual verification**

source-existence ref, discovery event, access/acquisition 상태를 별도 기록한다.

**Expected**

CCTV existence/discovery만 생성된다. 영상은 자동 acquired/reviewed되지 않는다.

**Observed**

다음 request route가 별도 Task로 남는다.

**Verdict**

PASS

**Boundary note**

Access route와 provider response는 TBD.

### Case 8 — Acquisition succeeds

**Purpose**

획득 성공이 Review나 truth를 의미하지 않음을 확인한다.

**Fixture**

CCTV가 명시된 route와 event를 통해 legitimately obtained된다.

**Manual verification**

SourceMaterial, provider, acquirer, time, route, source version, limitations provenance를 기록한다.

**Expected**

새 SourceMaterial이 `acquired / unreviewed`로 Case File에 들어간다.

**Observed**

영상 의미, admissibility, truth는 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

실제 admissibility와 acquisition route는 NOT TESTED / TBD.

### Case 9 — Acquisition refused

**Purpose**

Refusal을 structured result로 보존한다.

**Fixture**

Provider가 source request를 거부한다.

**Manual verification**

request ActionAttempt와 refusal Result를 분리하고 source content를 입력에서 제외한다.

**Expected**

Refusal/status/gap가 provenance와 함께 남는다.

**Observed**

source 내용은 노출되지 않고 재시도 가능성이 별도 history로 남는다.

**Verdict**

PASS

**Boundary note**

협조/refusal rule은 TBD.

### Case 10 — Unavailable or destroyed source

**Purpose**

Unavailable/destroyed source와 hidden content를 구분한다.

**Fixture**

Valid interaction이 target이 unavailable/destroyed라고 보고한다.

**Manual verification**

bounded status와 source-of-report provenance를 기록한다.

**Expected**

KnownGap 또는 unavailable/destroyed status가 생성된다.

**Observed**

없어진 source의 내용을 추정하지 않는다.

**Verdict**

PASS

**Boundary note**

Status vocabulary는 TBD.

### Case 11 — Request pending

**Purpose**

Pending acquisition을 success로 조기 승격하지 않는지 확인한다.

**Fixture**

요청은 전송됐으나 provider 응답이 없다.

**Manual verification**

request time, provider, pending state와 no-content boundary를 확인한다.

**Expected**

Pending만 기록된다.

**Observed**

acquired 또는 refused로 가정하지 않는다.

**Verdict**

PASS

**Boundary note**

Pending timeout mechanics는 TBD.

### Case 12 — Partial acquisition

**Purpose**

부분 획득과 잔여 KnownGap을 표현한다.

**Fixture**

요청한 record 중 일부만 수신된다.

**Manual verification**

acquired subset, remaining scope, provider response와 provenance를 분리한다.

**Expected**

Partial acquisition과 remaining KnownGap이 함께 남는다.

**Observed**

전체 request가 완료되었다고 표시되지 않는다.

**Verdict**

PASS

**Boundary note**

Partial completion rule은 TBD.

### Case 13 — Search finds nothing

**Purpose**

Bounded negative observation을 검증한다.

**Fixture**

Registry R에 query Q를 수행했으나 match가 없다.

**Manual verification**

Registry, query, time, result를 기록하고 global absence 문장을 배제한다.

**Expected**

`No match in R using Q at T`만 valid하다.

**Observed**

target이 world 어디에도 없다고 결론내리지 않는다.

**Verdict**

PASS

**Boundary note**

Exhaustive-domain rule은 발명하지 않는다.

### Case 14 — Public record, wrong search

**Purpose**

Public availability가 automatic discovery가 아님을 확인한다.

**Fixture**

R8은 public registry에 존재하지만 investigator가 잘못된 identifier/domain을 사용한다.

**Manual verification**

actual query/action과 domain을 Case File input으로 한정한다.

**Expected**

R8이 발견되지 않을 수 있다.

**Observed**

public source가 미리 Case File에 채워지지 않는다.

**Verdict**

PASS

**Boundary note**

Registry completeness와 search algorithm은 TBD.

### Case 15 — Correct public search

**Purpose**

Valid query가 source discovery를 낳을 수 있지만 자동 전체검색은 아님을 검증한다.

**Fixture**

적절한 registry/domain, valid identifier, fixture에 선언된 discovery rule이 있다.

**Manual verification**

query, action, rule, discovered ref와 acquisition stage를 provenance로 연결한다.

**Expected**

R8이 discovery/acquisition 후보가 될 수 있다.

**Observed**

선언된 domain 밖의 public data는 노출되지 않는다.

**Verdict**

PASS

**Boundary note**

정확한 registry rule은 NOT TESTED / TBD.

### Case 16 — Exceptional investigator / no Lead

**Purpose**

Capability와 omniscience를 분리한다.

**Fixture**

Investigator profile은 exceptional이지만 starting basis/domain이 없다.

**Manual verification**

profile capability가 hidden target을 입력에 추가하지 않는지 확인한다.

**Expected**

임의 source discovery가 일어나지 않는다.

**Observed**

capability는 Lead를 자동 생성하지 않는다.

**Verdict**

PASS

**Boundary note**

Capability→component mapping은 TBD.

### Case 17 — Exceptional investigator / false Lead

**Purpose**

높은 capability가 false Lead를 true로 만들지 않음을 확인한다.

**Fixture**

Exceptional investigator가 사건과 무관한 Lead를 pursue한다.

**Manual verification**

Lead origin과 action result를 분리해 기록한다.

**Expected**

Dead/irrelevant result가 가능하다.

**Observed**

False Lead가 source/truth로 변환되지 않는다.

**Verdict**

PASS

**Boundary note**

정확한 miss/relevance mechanics는 TBD.

### Case 18 — Limited time

**Purpose**

Time/resource constraint를 profile mutation과 구분한다.

**Fixture**

여러 Lead가 있으나 allocated time이 제한된다.

**Manual verification**

pursued/unpursued Leads와 resource history를 확인한다.

**Expected**

일부 Lead가 남을 수 있으며 profile은 unchanged다.

**Observed**

universal percentage penalty나 permanent downgrade가 없다.

**Verdict**

PASS

**Boundary note**

Cost/capacity formula는 TBD.

### Case 19 — Multiple Leads

**Purpose**

한 action의 branching과 provenance를 검증한다.

**Fixture**

Interaction이 P7, Company C2, document D9를 언급한다.

**Manual verification**

각 Lead와 origin, suggested action, priority를 별도 기록한다.

**Expected**

세 개의 분리된 Lead가 가능하다.

**Observed**

correct Lead badge나 hidden answer ranking이 없다.

**Verdict**

PASS

**Boundary note**

Lead prioritization은 TBD.

### Case 20 — Follow-up scope expansion

**Purpose**

Material scope expansion이 새 Task를 요구하는지 확인한다.

**Fixture**

IT-1은 L7을 발견하지만 원래 scope는 attachment tracing이다.

**Manual verification**

IT-1과 IT-2 candidate, L7 provenance 및 scope를 분리한다.

**Expected**

IT-2 follow-up candidate가 valid하다. IT-1이 무제한 확장되지 않는다.

**Observed**

새 branch는 explicit Task가 있어야 한다.

**Verdict**

PASS

**Boundary note**

Scheduler/creation mechanics는 TBD.

### Case 21 — Dead end then later useful

**Purpose**

후속 정보가 과거 dead end를 소급 삭제하지 않는지 검증한다.

**Fixture**

L1은 T1에 dead end였으나 T2 새 source가 L1과 관련된다.

**Manual verification**

T1 result와 T2 refinement/current status를 history로 보존한다.

**Expected**

과거 dead-end와 후속 useful relation이 공존한다.

**Observed**

나중 성공이 초기 실패를 덮어쓰지 않는다.

**Verdict**

PASS

**Boundary note**

Status transition vocabulary는 TBD.

### Case 22 — Witness discovered

**Purpose**

Person discovery와 witness/interview를 분리한다.

**Fixture**

P7이 potential contact/witness로 식별된다.

**Manual verification**

person node, Lead, potential role hypothesis를 분리한다.

**Expected**

discovered person/Lead만 생성된다.

**Observed**

Statement가 자동 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

Witness role confirmation은 future DEC/TBD.

### Case 23 — Witness contact failure

**Purpose**

Contact attempt와 interview를 구분한다.

**Fixture**

P7에게 연락했으나 응답이 없다.

**Manual verification**

ContactAttempt와 no-response Result를 기록한다.

**Expected**

접촉 실패 이력이 남고 testimony는 없다.

**Observed**

응답 없음이 Statement 내용으로 변환되지 않는다.

**Verdict**

PASS

**Boundary note**

Cooperation probability/behavior는 TBD.

### Case 24 — Witness contacted

**Purpose**

Successful contact와 interview를 분리한다.

**Fixture**

P7이 연락에 응답한다.

**Manual verification**

contact success event와 interview/Statement references의 부재를 확인한다.

**Expected**

Contact success만 기록된다.

**Observed**

Interview Task 또는 Statement가 자동 실행되지 않는다.

**Verdict**

PASS

**Boundary note**

Interview mechanics는 TBD.

### Case 25 — Investigation auto-interview attack

**Purpose**

Discovery가 testimony를 자동 생성하지 않음을 강하게 검증한다.

**Fixture**

P7 discovery 직후 system이 full testimony를 만들려 한다.

**Manual verification**

explicit Interview Task/authorization/event가 없는지 확인한다.

**Expected**

자동 Statement는 forbidden이다.

**Observed**

Interview는 별도 Task/rule 없이는 발생하지 않는다.

**Verdict**

PASS

**Boundary note**

정확한 interview system은 DEC-022 후보/TBD.

### Case 26 — Client reveals source

**Purpose**

Client disclosure와 source acquisition을 분리한다.

**Fixture**

Client가 D4가 존재한다고 말한다.

**Manual verification**

client assertion, source-existence Lead, acquisition state를 별도 둔다.

**Expected**

source-existence candidate/assertion만 valid하다.

**Observed**

D4 content, truth, acquisition이 자동 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

Client interaction mechanics는 TBD.

### Case 27 — Client provides source

**Purpose**

Client-provided source의 provenance를 검증한다.

**Fixture**

Client가 D4를 실제로 전달한다.

**Manual verification**

provider/client, acquired time, source version, route와 review status를 기록한다.

**Expected**

D4는 acquired SourceMaterial / unreviewed가 된다.

**Observed**

내용 해석이나 truth promotion이 없다.

**Verdict**

PASS

**Boundary note**

Metadata visibility의 exact scope는 NOT TESTED / TBD.

### Case 28 — Client statement truth attack

**Purpose**

Client assertion도 truth가 아님을 확인한다.

**Fixture**

Client가 X라고 말한다.

**Manual verification**

speaker/client provenance와 SourceAssertion을 분리한다.

**Expected**

X는 assertion으로만 Case File에 들어간다.

**Observed**

X가 objective fact가 되지 않는다.

**Verdict**

PASS

**Boundary note**

Assertion reliability rule은 TBD.

### Case 29 — Acquisition auto-review attack

**Purpose**

Acquisition과 Evidence Review의 hard separation을 검증한다.

**Fixture**

Investigation이 D4를 얻은 직후 그 의미를 보고하려 한다.

**Manual verification**

별도 Evidence Review Task가 없는지, only source metadata가 있는지 확인한다.

**Expected**

RecordedExtraction/SourceAssertion/ProfessionalAnalysis를 자동 생성하는 것은 forbidden이다.

**Observed**

D4는 `acquired ≠ reviewed ≠ understood` 상태로 남는다.

**Verdict**

PASS

**Boundary note**

획득 시 보이는 제한적 metadata 범위는 TBD이며 내용 이해를 의미하지 않는다.

### Case 30 — Investigation → CourtRecord attack

**Purpose**

Acquisition과 CourtRecord/JII를 분리한다.

**Fixture**

Acquired D4를 바로 judge input으로 넣으려 한다.

**Manual verification**

explicit procedural materialization/allowance가 없는지 확인한다.

**Expected**

직접 CourtRecord/JII/finding input은 forbidden이다.

**Observed**

후속 filing/procedure 없이는 court system이 D4를 consume하지 않는다.

**Verdict**

PASS

**Boundary note**

Admission/filing semantics는 inherited system/TBD.

### Case 31 — Duplicate discovery

**Purpose**

여러 Lead chain이 같은 entity/source를 찾을 때 provenance를 보존한다.

**Fixture**

L4와 L9가 각각 P7 또는 동일 source를 발견한다.

**Manual verification**

두 discovery origin과 가능한 identity relation을 모두 보존한다.

**Expected**

Entity resolution candidate가 가능하되 원래 chain은 삭제되지 않는다.

**Observed**

중복이 하나로 보이더라도 discovery provenance는 둘 다 남는다.

**Verdict**

PASS

**Boundary note**

Dedup/entity-resolution algorithm은 TBD.

### Case 32 — Later success after failed search

**Purpose**

Retry success가 prior failure를 overwrite하지 않는지 확인한다.

**Fixture**

T1 search는 실패하고 T2 retry가 성공한다.

**Manual verification**

두 ActionAttempt/Result와 current state를 시간순으로 보존한다.

**Expected**

T1 failure와 T2 success가 모두 history에 남는다.

**Observed**

후속 성공이 과거 실패를 지우지 않는다.

**Verdict**

PASS

**Boundary note**

Retry scheduling은 TBD.

### Case 33 — Save/load reroll

**Purpose**

Materialized event의 replay 안정성을 검증한다.

**Fixture**

Borderline contact/search outcome이 `ContactAttemptEvent CE-1`로 materialize됐다.

**Manual verification**

save/load 후 동일 Task/context에서 CE-1을 재사용하는지 확인한다.

**Expected**

동일 결과다. 새 시도는 새 Task/event여야 한다.

**Observed**

reload가 새 hidden result를 만들지 않는다.

**Verdict**

PASS

**Boundary note**

Borderline probability/event generation은 NOT TESTED / TBD.

### Case 34 — Hidden clue counter

**Purpose**

Unknown unknown leakage를 검증한다.

**Fixture**

UI가 “3 undiscovered witnesses remain”을 표시한다.

**Manual verification**

표시값이 known Leads/known bounded set에서 유래했는지 확인한다.

**Expected**

hidden count/list는 forbidden이다.

**Observed**

player는 현재 발견한 Lead와 gap만 본다.

**Verdict**

PASS

**Boundary note**

Legitimate known-set local count의 exact UX는 TBD.

### Case 35 — Investigation success score

**Purpose**

Universal InvestigationScore collapse를 거부한다.

**Fixture**

`InvestigationSuccess = 78%`가 semantic authority로 제시된다.

**Manual verification**

해당 값이 action, Lead, acquisition result, provenance를 대체하는지 확인한다.

**Expected**

Canonical result로 invalid하다.

**Observed**

구조화된 attempt/result가 source of truth로 유지된다.

**Verdict**

PASS

**Boundary note**

Internal tuning number 자체는 이 TEST 범위 밖이나 semantic authority가 될 수 없다.

### Case 36 — NPC hidden discovery engine

**Purpose**

Delegated execution의 hidden clue engine을 금지한다.

**Fixture**

Delegated NPC가 allowed Leads/domain과 무관한 hidden clue를 random으로 받는다.

**Manual verification**

NPC Task가 동일 basis/domain/action/event/WorkProduct ontology를 사용하는지 확인한다.

**Expected**

무관한 clue와 hidden success percentage는 forbidden이다.

**Observed**

NPC는 authorized input과 explicit world-facing result만 사용한다.

**Verdict**

PASS

**Boundary note**

NPC AI는 TBD지만 omniscient divergence는 허용되지 않는다.

### Case 37 — Discoverability oracle attack

**Purpose**

Discoverability와 firm/player-known 정보를 분리한다.

**Fixture**

World에는 E99, W20, B4가 있고 current Task basis는 E99만 향한다. System이 W20/B4도 discoverable이라고 알고 “2 other discoverable clues remain”을 표시하려 한다.

**Manual verification**

discoverability metadata가 player-facing count/list/Case File node/hint oracle로 사용되는지 확인한다.

**Expected**

Forbidden. `discoverable ≠ known to player/firm`이다.

**Observed**

E99 외 hidden target/count는 노출되지 않는다.

**Verdict**

PASS

**Boundary note**

Discoverability simulation rule은 TBD이나 pre-discovery disclosure는 허용되지 않는다.

### Case 38 — Starting-basis overrestriction attack

**Purpose**

Starting basis가 answer-key object ID를 요구하지 않는지 검증한다.

**Fixture**

Issue I3는 payment authorization origin이 unresolved다. Player는 client-authorized accounting records에서 I3 관련 payment-origin identifiers를 찾는 bounded Task를 만든다. 별도로 “secret account B4”를 직접 지정하는 요청도 제시한다.

**Manual verification**

I3가 explicit basis인지, domain/action이 bounded인지, hidden answer query가 없는지 비교한다.

**Expected**

I3 기반 exploratory Task는 valid할 수 있다. B4를 근거 없이 직접 targeting하는 Task는 invalid다.

**Observed**

Issue/KnownGap/Hypothesis가 inquiry를 시작할 수 있으면서도 unlimited search는 열리지 않는다.

**Verdict**

PASS

**Boundary note**

정확한 탐색 결과/algorithm은 TBD이며, 이 case는 basis/domain boundary만 검증한다.

### Case 39 — Negative-result overreach attack

**Purpose**

Negative observation과 global absence를 구분한다.

**Fixture**

Registry A, query Q, time T1에서 no match가 발생한다.

**Manual verification**

다음 세 문장을 비교한다: (1) no match in A/Q/T1, (2) Company X does not exist, (3) no record anywhere.

**Expected**

(1)만 valid bounded observation이다. (2)(3)은 별도 exhaustive authority 없이는 forbidden이다.

**Observed**

Search result가 global world fact로 확장되지 않는다.

**Verdict**

PASS

**Boundary note**

DEC-021은 exhaustive registry rule을 발명하지 않는다.

### Case 40 — Acquired-source auto-understanding attack

**Purpose**

획득 직후 extraction/analysis가 자동 생성되지 않음을 검증한다.

**Fixture**

Investigation이 D20을 acquired SourceMaterial로 얻는다. D20에는 나중 Review에서 중요한 text가 있을 수 있다.

**Manual verification**

Evidence Review Task/WorkProduct 없이 SourceAssertion A20, Contradiction CR4, ProfessionalAnalysis PA7이 생성되는지 확인한다.

**Expected**

유효한 상태는 `D20 acquired / unreviewed / provenance attached`다. A20/CR4/PA7 자동 생성은 forbidden이다.

**Observed**

D20은 별도 Evidence Review 전까지 의미가 해석되지 않는다.

**Verdict**

PASS

**Boundary note**

획득 metadata와 content observation의 정확한 범위는 NOT TESTED / TBD.

## 5. Unknown-unknown pressure test

World에 W9, D20, B4가 있으나 Case File에는 없다. unrelated L1을 pursue하면 세 항목은 모두 unknown으로 남는다. 이후 `L1 → S4 → S4 mentions W9`라는 legitimate chain이 materialize되면 W9만 discovered Lead/known candidate가 될 수 있고 D20/B4는 계속 숨겨진다. 이는 `unknown unknown → legitimate discovery → known candidate`의 점진적 변환을 검증한다. Hidden world count/list는 노출하지 않는다.

## 6. Starting-basis pressure test

| Fixture | Result |
|---|---|
| KnownGap: E4가 참조한 A1 missing → trace/request | Valid starting basis |
| Issue I3: payment destination unresolved → client-authorized ledger search | Potentially valid broad-but-bounded inquiry |
| Unknown “secret Swiss account #8821” 직접 지정 | Invalid answer-key targeting |
| “Search all databases for anything useful” | Invalid unlimited search |

원칙은 `starting basis constrains inquiry without requiring the hidden answer identifier`이다.

## 7. Lead pressure test

E4와 W3가 각각 P7을 언급하면 shared P7 Lead와 두 provenance path가 보존될 수 있다. 이 Lead는 relevance, witness status, cooperation, truth 또는 correct path를 의미하지 않는다. 후속 action은 false/dead end가 될 수 있다.

## 8. Discovery/access/acquisition pressure test

`CCTV exists learned → discovered`, valid route가 생기면 `accessible/requestable`, request가 전송되면 `pending`, provider가 전달하면 `acquired`로 각 stage를 별도 기록한다. 어느 앞 단계도 뒤 단계나 review를 imply하지 않는다.

## 9. Search-negative pressure test

Public registry no match, client-internal records no file under identifier, witness contact no response는 각각 registry/query/time, internal domain/identifier, contact action/time에 묶인 bounded negatives다. 셋 모두 global absence가 아니다.

## 10. Failure and false-lead pressure test

`L1 → P7`이 irrelevant, `L2 → Company C`가 no result, `L3 → D9`가 acquired인 chain에서 L1/L2 실패, L3 성공, 사용된 time/resources와 provenance가 모두 남는다. “correct lead” retroactive badge는 없다.

## 11. Acquisition-review pressure test

Acquired D4는 provider, route, time과 함께 `SourceMaterial / unreviewed`로만 Case File에 추가된다. `D4 proves X`, `D4 contradicts S3`, `D4 mentions P7`, `D4 supports I4`는 subsequent Evidence Review가 만들기 전에는 허용되지 않는다. Acquisition metadata visibility의 exact scope는 TBD이며 `acquired ≠ reviewed ≠ understood`를 변경하지 않는다.

## 12. Witness-stage pressure test

`person discovered ≠ potential witness ≠ contacted ≠ contact successful ≠ interviewed ≠ Statement obtained`. 이 TEST는 collapse 금지만 검증하며 exact Interview/Statement semantics는 future DEC/TBD다.

## 13. Public-data pressure test

R8 public record에 대해 (A) no search, (B) wrong registry, (C) right registry/wrong identifier는 R8을 known으로 만들지 않는다. (D) right registry + valid identifier + fixture discovery rule은 R8 discovery/acquisition을 허용할 수 있다. Public availability는 automatic knowledge가 아니다.

## 14. Direct/delegated pressure test

Player direct와 delegated worker는 동일한 InvestigationTaskDefinition, basis, bounded domain, Lead, ActionAttempt, Result, materialized event, WorkProduct, provenance families를 사용한다. `Player → structured chain; NPC → hidden success %`는 invalid다.

## 15. Materialized-event pressure test

Genuinely borderline contact result가 `CE-1: no response`로 materialize되면 reload에서도 CE-1을 재사용한다. 새 contact는 새 Task/event다. Probability나 event-generation algorithm은 발명하지 않는다.

## 16. Scope-expansion pressure test

IT-1의 scope가 A1 attachment tracing이고 결과로 L7 provider가 발견되면, L7 pursuit는 IT-2 candidate가 된다. IT-1이 provider·company·family·account·all records를 무한히 따라가는 것은 금지한다.

## 17. Acquisition provenance pressure test

D9 SourceMaterial acquisition은 discovery origin, Lead, Task, action, provider/location, learned/acquired time, source version, route/category, limitations를 표현할 수 있어야 한다. 필드명/schema는 TBD이며 provenance 부재를 허용하는 의미는 아니다.

## 18. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---|---|---|
| Investigation is explicit Task | 1–2, 20 | PASS candidate | Basis, domain, action required |
| Investigation ≠ Evidence Review | 8, 29, 40 | PASS candidate | Acquisition leaves source unreviewed |
| No ActualStateRecord omniscient query | 2–3, 16, 36–38 | PASS candidate | Hidden index forbidden |
| Explicit starting basis | 1–5, 38 | PASS candidate | Issue/Gap can support exploration |
| Bounded search domain | 1–2, 13–15, 38–39 | PASS candidate | Unlimited search invalid |
| World existence ≠ discoverability | 3, 37 | PASS candidate | Simulation relation not UI fact |
| Discoverability ≠ discovery/player-known | 3, 34, 37 | PASS candidate | No oracle count/list |
| Discovery ≠ access | 7–11 | PASS candidate | Stages separate |
| Access ≠ acquisition | 7–12 | PASS candidate | Attempt/result required |
| Acquisition ≠ review | 8, 27, 29, 40 | PASS candidate | Evidence Review gate |
| Lead ≠ SourceMaterial/truth | 4–6, 19, 37–38 | PASS candidate | Direction only |
| False Lead/dead end valid | 6, 17, 21 | PASS candidate | Failure is useful history |
| Unknown unknown non-disclosure | 3, 34, 36–38, §5 | PASS candidate | Legitimate discovery only |
| Acquisition provenance | 8, 12, 15, 26–27, §17 | PASS candidate | Route/provider/time refs |
| Failed attempts preserved | 6, 9–13, 21, 32 | PASS candidate | No overwrite |
| Negative result bounded | 13–15, 39, §9 | PASS candidate | No global absence |
| No-result ≠ world absence | 13–14, 39 | PASS candidate | Exhaustive rule absent |
| Investigator may miss | 13–18 | PASS candidate | No guaranteed discovery |
| Capability ≠ omniscience | 16–18, 35–36 | PASS candidate | No universal score |
| No InvestigationScore/weighted sum | 16–18, 35 | PASS candidate | Structured actions/results |
| ActionAttempt ≠ Result | 7–12, 23–24, §8 | PASS candidate | Pending/refusal possible |
| Borderline event materialized once | 33, §15 | PASS candidate | Exact probability TBD |
| Reload no reroll | 33 | PASS candidate | New attempt is new Task |
| Lead chain provenance | 4–5, 19–21, §7 | PASS candidate | No teleporting knowledge |
| Scope expansion explicit | 20, §16 | PASS candidate | Follow-up Task |
| Witness stages separate | 22–25, §12 | PASS candidate | No auto-Statement |
| Public availability ≠ known | 14–15, §13 | PASS candidate | Search action required |
| Direct/delegated same ontology | 36, §14 | PASS candidate | No NPC hidden engine |
| Duplicate provenance preserved | 31 | PASS candidate | Dedup does not erase origins |
| History preserved | 21, 32–33 | PASS candidate | Failure/retry/event lineage |
| Acquired source ≠ truth | 8, 26–30, 40 | PASS candidate | SourceMaterial only |
| Acquired source ≠ reviewed | 8, 27, 29, 40 | PASS candidate | Separate Review Task |
| Acquired source ≠ CourtRecord | 8, 30 | PASS candidate | Procedure gate |
| No direct JII/finding | 30 | PASS candidate | Existing Litigation path only |
| No hidden clue count | 3, 34, 36–37 | PASS candidate | Player sees known state only |
| No invented Korean powers | 9, 30, §15 | PASS candidate | Generic routes only |

## 19. Contradiction audit

| Check | Result | Note |
|---|---|---|
| DEC-021 internal contradiction | None observed | Starting basis permits bounded exploration while forbidding answer-key targeting |
| DEC-020 Review boundary | No violation | Acquired source remains unreviewed |
| DEC-019 Case File epistemic boundary | No violation | Leads/statuses are provenance-bearing knowledge, not truth |
| DEC-018 Task/WorkProduct semantics | No violation | Explicit Task, context, event and history used |
| DEC-017 capability semantics | No violation | No omniscience/score/weighted sum |
| DEC-016 provenance boundary | No violation | Internal/player-visible state not conflated |
| DEC-015 history/version | No violation | Attempts/events remain historical |
| DEC-013/014 judicial/ChoicePoint boundary | No violation | No direct JII, finding or CP effect |
| ActualStateRecord query API | Rejected | Cases 2–3, 16, 36–38 |
| Discoverable/player-known collapse | Rejected | Case 37 |
| Starting basis answer-key overrestriction | Rejected | Case 38 allows Issue-based bounded inquiry |
| Unlimited search leakage | Rejected | Cases 2, 38 and §6 |
| Lead/truth and Lead/source collapse | Rejected | Cases 4–6, 19 |
| Discovery/access/acquisition collapse | Rejected | Cases 7–12 |
| Acquisition/review/truth collapse | Rejected | Cases 8, 29, 40 |
| Negative result/global absence collapse | Rejected | Cases 13, 39 |
| Witness discovery/Statement collapse | Rejected | Cases 22–25 |
| Public data/automatic knowledge collapse | Rejected | Cases 14–15 |
| False Leads impossible | Rejected | Cases 6, 17, 21 |
| Failure history overwrite | Rejected | Cases 21, 32 |
| Duplicate provenance deletion | Rejected | Case 31 |
| Reload reroll | Rejected | Case 33 |
| Hidden InvestigationScore/NPC engine | Rejected | Cases 35–36 |
| CourtRecord bypass | Rejected | Case 30 |
| Invented Korean compulsory powers | Rejected | Generic route interface only |
| Tester invented discovery/access rules | None accepted | Exact mechanisms remain TBD |

## 20. False-PASS audit

각 PASS는 DEC-021이 선언한 basis/domain/stage/provenance boundary에만 근거한다. World-search API, hidden clue map, discovery probability, source accessibility, provider/witness cooperation, registry completeness, relevance/reliability, legal authority 또는 automatic review를 보충해 PASS를 만들지 않았다. Exact algorithm과 확률은 어느 fixture의 semantic result에도 필요하지 않으므로 NOT TESTED / TBD다.

## 21. False-PARTIAL audit

Core case의 semantic boundary는 모두 결정 가능하므로 PARTIAL 사유가 없다. Search algorithm, probability, route, registry, cooperation, UI, AI, Korean procedure, schema/Godot가 TBD인 것은 의도된 범위이며 PARTIAL 근거가 아니다. 특히 Case 37의 discoverability와 Case 38의 Issue-based broad-but-bounded basis는 DEC-021의 명시적 구분으로 결정된다.

## 22. Remaining TBD / NOT TESTED

- Investigation Task catalog/schema, Lead taxonomy, discoverability and search algorithms/probability.
- Search-domain, source-accessibility, acquisition-route and cooperation/refusal vocabulary.
- Witness contact/interview/Statement mechanics and witness role taxonomy.
- Capability mappings, investigator roles, source reliability, entity/duplicate resolution.
- Public registries, client interaction and legal authority/Korean compulsory process.
- Cost/time/workload formulas, NPC AI, player UI/minigames.
- Evidence Review internals, CourtRecord admission and procedural materialization.
- Save/API/schema/Godot implementation, performance and balancing.

## 23. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Omniscient world search | Task scans ActualStateRecord | Agent knowledge collapses into answer key | Require basis/domain/action/event |
| Every Task finds something | No-result impossible | Investigation becomes loot roll | Structured failures/dead ends |
| Success-only history | Failed attempts disappear | Cost and reasoning become opaque | Immutable attempt/result history |
| Hidden clue counters | UI lists undiscovered answers | Unknown unknown leakage | Show known Leads/gaps only |
| Skill guarantees discovery | Exceptional worker finds all | Capability becomes omniscience | Constraints/misses remain possible |
| Public data magically known | Registries preloaded | Search provenance disappears | Explicit query/action |
| False Leads impossible | Every Lead is correct | Railroading | Lead ≠ truth; dead ends valid |
| Acquisition auto-review | Received source is understood | DEC-020 bypass | Separate Evidence Review Task |
| Acquisition auto-truth | Possession proves content | Epistemic collapse | SourceMaterial only |
| Witness auto-testimony | Discovery creates Statement | Fabricated evidence | Separate stages/Interview Task |
| Negative search=absence | Local no-match becomes global fact | Hidden oracle | Domain/query/time-bounded negative |
| History overwrite | Retry deletes prior failure | Non-replayable state | Preserve attempts/events |
| Save-scum reroll | Reload changes result | State instability | Materialize once |
| NPC hidden percentage | Delegation gets random clue | Semantic divergence | Shared ontology |
| Unlimited scope | Task recursively searches world | Authorization/cost vanish | Explicit follow-up Task |
| Random clicking | Actions lack basis | No meaningful reasoning | Lead/basis requirements |
| Too many Leads | Noise overwhelms player | Case File unusable | Bounded generation/projection TBD |
| Document-count grind | Volume alone controls outcome | Ignores domain/structure | Structured demands |
| Fabricated legal powers | Generic request compels source | False legal assumptions | Generic route interface/TBD |

## 24. Player-facing design principle

Player는 pursuing Lead, 그 출처, attempted action, discovered/failed/pending/blocked result, acquisition 여부와 follow-up path를 볼 수 있어야 한다. Player는 hidden-world clue count, correct Lead highlight, guaranteed evidence marker, undiscovered witness list, hidden source importance 또는 future judge effect를 보지 않는다.

## 25. Solo → firm progression hook

```text
Solo → player pursues Leads and requests sources manually
Support/assistants → administrative tracing, request tracking, permitted searches
Associates/investigators → delegated Investigation Tasks
Larger firm → parallel investigation branches and follow-up Tasks
Partner/player → resource and strategic Lead prioritization
```

이는 supported architecture이며 mandatory progression이나 implementation claim이 아니다.

## 26. TEST-021 plan

TEST-021은 작성하지 않는다. 다음 검증에서는 Witness / Interview / Statement Model 또는 Legal Research & Issue Analysis 중 Investigation에서 남은 가장 강한 prerequisite를 선택해 explicit Task/Case File boundaries를 이어간다.

## 27. DEC-022 candidates

| Candidate | Prerequisite fit | Risk |
|---|---|---|
| Witness / Interview / Statement Model | INV27의 discovery/contact/interview/Statement 분리를 직접 닫음 | Assertion/credibility/procedure를 truth로 만들 위험 |
| Legal Research & Issue Analysis | Discovered sources와 Issues를 substantive analysis로 연결 | Legal content model 선행 필요 |
| Case Theory / Evidence Synthesis | 여러 Leads/WorkProducts 통합 요구 | 자동 truth synthesis 위험 |
| Client Interaction | Client-provided source/assertion 경계 구체화 | 넓은 social/dialogue 의존성 |
| Task Assignment / Workload / Team Coordination | parallel branch scaling을 정교화 | 더 많은 Task family가 필요 |

**Default recommendation:** `DEC-022 — Witness / Interview / Statement Model`. DEC-021이 person discovery, contact와 acquisition까지만 정의하고 interview/Statement를 명시적으로 열어 두었기 때문이다. 단 TEST-020에서 다른 prerequisite가 발견되면 순서는 재검토할 수 있다.

## 28. Final verification summary

```text
Total core cases: 40
PASS: 40
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none  
FAIL cases: none

- DEC-021 reopen required: No semantic reopen indicated.
- Internal contradiction: None observed.
- Inherited boundary violation: None accepted.
- ActualStateRecord query leakage: Rejected; none accepted.
- Discoverability oracle leak: Rejected in Case 37.
- Starting-basis overrestriction: Rejected in Case 38; Issue/Gap-based bounded inquiry remains valid.
- Unlimited search leakage: Rejected.
- Lead/truth collapse: Rejected.
- Discovery/access/acquisition collapse: Rejected.
- Acquisition/review collapse: Rejected in Cases 29 and 40.
- Negative-result overreach: Rejected in Case 39.
- Public-data omniscience: Rejected.
- Witness-stage collapse: Rejected.
- History overwrite: None accepted.
- Reroll issue: None accepted.
- CourtRecord bypass: Rejected.
- Issue blocking DEC-021 promotion: None at fixture-level.
- Issue blocking DEC-022: None at fixture-level.

## 29. Promotion recommendation

이 수동 fixture-level 결과에는 semantic blocker가 없으므로 다음을 design-review에 권고한다.

```text
DEC-021 v0.1 → v0.2 Accepted
TEST-020 v0.1 → v0.2 Accepted / manual fixture-level verification
```

TEST 문서가 DEC 상태를 자동 변경하는 것은 아니다. Exact discovery/access/acquisition algorithms, probabilities, route/cooperation, witness system 및 구현은 계속 TBD다.

## 30. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-021 INV1–INV35를 기준으로 40개 core fixture, unknown-unknown, starting-basis, Lead, stage, negative-result, acquisition-review, witness, invariant 및 contradiction audits 작성. |
