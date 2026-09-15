# THE FIRM — Witness Interview and Statement Model

문서 ID: TEST-021  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: `DEC-LITIGATION-022_WITNESS_INTERVIEW_AND_STATEMENT_MODEL.md` v0.1 Proposed / design review required

## 1. Purpose

이 문서는 DEC-022의 Witness / Interview / Statement semantics를 synthetic fixture에 수동 적용하여 다음 separation을 검증한다.

```text
Person
≠ WitnessRole
≠ Contact
≠ Interview
≠ Utterance
≠ RecordedStatement
≠ SourceAssertion
≠ ProfessionalAnalysis
≠ CourtRecord
≠ CourtFactFinding
```

또한:

```text
ActualStateRecord
≠ PersonKnowledge / Memory / Belief
≠ InterviewResponse
≠ RecordedStatement
≠ ProfessionalAnalysis
```

이 TEST는 구현 테스트나 한국 법률 실무 검증이 아니다. `Observed`는 코드 실행 결과가 아니라 DEC-022 semantics의 manual fixture application이다.

## 2. Verdict rules and scope

`PASS`는 DEC-022가 fixture 결과를 충분히 결정하고 inherited boundary와 모순되지 않을 때 사용한다. `PARTIAL`은 semantic separation 자체가 불분명하거나 둘 이상의 해석이 가능할 때만 사용한다. psychology, memory, deception, cooperation, dialogue, transcription, credibility, Korean procedure, UI, AI, schema/Godot가 TBD라는 이유만으로 PARTIAL을 주지 않는다. `FAIL`은 ActualStateRecord truth query, hidden knowledge leak, layer/truth collapse, CourtRecord bypass, history overwrite 또는 reload reroll이 실제로 발생할 때다.

## 3. Inherited boundaries

- `ActualStateRecord ≠ PersonKnowledge/Memory/Belief ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`.
- Person discovery/contact/interview/Statement 단계는 분리한다. Interview가 새 Person/source를 언급하면 DEC-021 Lead/acquisition chain으로 돌아간다.
- Acquired SourceMaterial은 DEC-020 Evidence Review 없이는 자동 extraction/analysis되지 않는다.
- Utterance/source content, RecordedStatement, SourceAssertion, ProfessionalAnalysis는 각각 fallible/provenance-bearing layer이며 truth가 아니다.
- Internal Interview Statement는 explicit valid procedural materialization 없이는 CourtRecord/JII/ChoicePoint/finding/outcome을 변경하지 않는다.
- Direct/delegated execution, component capability, materialized event, immutable history와 no-reload-reroll을 상속한다.

## 4. Core cases

모든 fixture는 synthetic이다. 각 case는 Person 상태, WitnessRole/relevance 후보, Contact 상태, Interview Task/Event, utterance/source content, RecordedStatement, SourceAssertion, ProfessionalAnalysis, hidden world truth 및 CourtRecord 경계를 구분해 수동 적용한다.

### Case 1 — Person discovered

**Purpose**

Investigation discovery가 곧 witness나 testimony가 아님을 검증한다.

**Fixture**

P7이 DEC-021 Investigation을 통해 discovered Person/Lead가 된다.

**Manual verification**

Person node, Lead provenance, WitnessRole/Contact/Interview/Statement 부재를 각각 기록한다.

**Expected**

Person/Lead만 Case File에 존재한다.

**Observed**

P7 discovery가 Statement나 CourtRecord를 생성하지 않는다.

**Verdict**

PASS

**Boundary note**

Person discovery algorithm은 NOT TESTED / TBD.

### Case 2 — Potential witness designation

**Purpose**

Potential witness 관계와 confirmed/useful witness를 분리한다.

**Fixture**

Player가 P7을 잠재적으로 relevant한 사람으로 표시한다.

**Manual verification**

Role/relevance candidate의 origin과 Person identity를 분리한다.

**Expected**

Case-relative potential relation만 valid하다.

**Observed**

P7이 useful, credible 또는 truthful witness로 확정되지 않는다.

**Verdict**

PASS

**Boundary note**

Witness relevance taxonomy는 TBD.

### Case 3 — Contact failure

**Purpose**

No response가 Interview나 negative fact가 아님을 검증한다.

**Fixture**

P7 ContactAttempt에 응답이 없다.

**Manual verification**

Contact action/result/time/history와 Interview/Statement 부재를 확인한다.

**Expected**

Structured no-response result가 남는다.

**Observed**

Interview가 생성되지 않고, 질문의 명제가 false라고 추론되지 않는다.

**Verdict**

PASS

**Boundary note**

Cooperation/contact behavior는 TBD.

### Case 4 — Contact success

**Purpose**

Contact success와 Interview completion을 분리한다.

**Fixture**

P7이 나중에 말하기로 동의한다.

**Manual verification**

Contact success event와 Interview Task/Event/Statement 부재를 구분한다.

**Expected**

Contact success만 기록된다.

**Observed**

동의가 질문 답변이나 Interview 완료로 변환되지 않는다.

**Verdict**

PASS

**Boundary note**

Interview scheduling은 TBD.

### Case 5 — Interview begins

**Purpose**

Explicit Interview Task/Event의 최소 scope를 검증한다.

**Fixture**

Target P7, purpose `March 14 meeting`, authorized Case File snapshot, topics, performer, time이 선언된 Interview Task/Event가 시작된다.

**Manual verification**

Target, basis, scope, performer, inputs, event provenance를 확인한다.

**Expected**

Valid scoped Interview execution basis다.

**Observed**

Unbounded knowledge dump나 hidden world query 없이 interaction이 시작된다.

**Verdict**

PASS

**Boundary note**

정확한 TaskDefinition schema는 TBD.

### Case 6 — Witness knows X and says X

**Purpose**

Person knowledge, utterance, Statement, Assertion과 truth를 분리한다.

**Fixture**

P7의 legitimate person-facing state에 X가 있고 Interview에서 X를 말한다.

**Manual verification**

Person state, utterance, RecordedStatement, SourceAssertion, provenance를 각각 기록한다.

**Expected**

Statement/Assertion X가 생성되지만 X는 objective fact가 아니다.

**Observed**

Firm이 받은 것은 P7이 X라고 말한 기록이다.

**Verdict**

PASS

**Boundary note**

Person learning/memory mechanics는 TBD.

### Case 7 — Witness knows X but does not mention X

**Purpose**

Knowledge와 disclosure를 분리한다.

**Fixture**

P7은 X를 알지만 Interview에서 X를 언급하지 않는다.

**Manual verification**

X가 Interview content/WorkProduct/Case File에 자동 추가되는지 확인한다.

**Expected**

X는 firm에 revealed되지 않는다.

**Observed**

Person knowledge가 auto-dump되지 않는다.

**Verdict**

PASS

**Boundary note**

Disclosure mechanics는 TBD이나 non-disclosure boundary는 명확하다.

### Case 8 — Interviewer fails to ask about X

**Purpose**

Question scope가 disclosure를 제한하는지 검증한다.

**Fixture**

Interview topics/questions가 X를 다루지 않는다.

**Manual verification**

Asked topics, unanswered scope, Person state와 Case File output을 분리한다.

**Expected**

X는 자동으로 드러나지 않는다.

**Observed**

질문되지 않은 내용은 Interview output에 포함되지 않는다.

**Verdict**

PASS

**Boundary note**

질문 UI/전략 mechanics는 TBD.

### Case 9 — Witness does not know X

**Purpose**

Exceptional interviewer가 uninformed Person에서 truth를 만들 수 없음을 검증한다.

**Fixture**

P7의 legitimate epistemic state에 X가 없는데 exceptional interviewer가 X를 질문한다.

**Manual verification**

Person state와 response를 비교하고 ActualStateRecord read가 없는지 확인한다.

**Expected**

No recollection, ignorance, refusal 또는 기타 bounded response만 가능하다.

**Observed**

X가 hidden truth에서 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

정확한 response rule은 TBD.

### Case 10 — Witness mistaken memory

**Purpose**

잘못된 기억도 유효한 epistemic state인지 검증한다.

**Fixture**

P7이 실제 world date와 다른 날짜를 기억해 말한다.

**Manual verification**

Statement 내용, Person memory/belief, hidden world truth와 provenance를 분리한다.

**Expected**

Wrong Statement가 존재할 수 있다.

**Observed**

오류가 자동으로 deception이나 truth로 분류되지 않는다.

**Verdict**

PASS

**Boundary note**

Memory accuracy는 TBD.

### Case 11 — Witness uncertain

**Purpose**

Qualification과 정확한 사실을 분리한다.

**Fixture**

P7이 `around four, I think`라고 답한다.

**Manual verification**

Utterance/RecordedStatement의 uncertainty/qualification을 보존한다.

**Expected**

Approximate qualified response다.

**Observed**

4:00 PM exact fact로 normalize되지 않는다.

**Verdict**

PASS

**Boundary note**

Uncertainty vocabulary는 TBD.

### Case 12 — RecordedStatement paraphrase

**Purpose**

Paraphrase가 별도 provenance layer로 표현되는지 확인한다.

**Fixture**

Utterance는 `around four`, RecordedStatement는 `approximately 4 PM`이다.

**Manual verification**

Utterance source와 RS origin/context를 분리하고 exact equivalence를 가정하지 않는다.

**Expected**

Provenance-bearing paraphrase가 potentially valid하다.

**Observed**

RS가 utterance나 objective truth를 overwrite하지 않는다.

**Verdict**

PASS

**Boundary note**

Paraphrase/transcription mechanics는 TBD.

### Case 13 — Mistaken RecordedStatement

**Purpose**

Fallible RecordedStatement와 source content를 분리한다.

**Fixture**

Utterance는 `around four`, RS는 `3:00 PM`이다.

**Manual verification**

원래 utterance, mistaken RS, dependent analysis와 correction lineage를 각각 보존한다.

**Expected**

RS는 틀릴 수 있고 source utterance는 변경되지 않는다.

**Observed**

Later correction이 가능하며 old RS/analysis가 역사로 남는다.

**Verdict**

PASS

**Boundary note**

Transcription error probability/correction workflow는 TBD.

### Case 14 — ProfessionalAnalysis

**Purpose**

Analysis가 Statement와 별도인지 검증한다.

**Fixture**

Lawyer가 timing을 해석해 `P7 places himself before the meeting`라고 분석한다.

**Manual verification**

PA basis, RS/Statement refs, analyst/profile/time와 uncertainty를 연결한다.

**Expected**

PA는 interpretation이며 truth가 아니다.

**Observed**

PA가 Statement content를 rewrite하거나 CourtFactFinding이 되지 않는다.

**Verdict**

PASS

**Boundary note**

Analysis correctness는 TBD.

### Case 15 — Statement truth laundering

**Purpose**

Witness statement가 objective fact로 승격되지 않는지 확인한다.

**Fixture**

Witness가 X라고 말하고 system이 X를 true로 표시하려 한다.

**Manual verification**

SourceAssertion과 objective/world/Court state의 분리를 확인한다.

**Expected**

Truth promotion은 forbidden이다.

**Observed**

Assertion X만 valid하다.

**Verdict**

PASS

**Boundary note**

Source reliability/credibility rule은 TBD.

### Case 16 — Multiple Statements

**Purpose**

시간에 따른 Statements가 distinct한지 검증한다.

**Fixture**

P가 T1 S1, T2 S2를 제공한다.

**Manual verification**

각 Interview/time/context/interviewer/topic/version를 별도로 기록한다.

**Expected**

두 Statement가 공존한다.

**Observed**

Timeless testimony blob으로 merge되지 않는다.

**Verdict**

PASS

**Boundary note**

Version storage granularity는 TBD.

### Case 17 — Statement correction

**Purpose**

Later correction과 historical S1을 분리한다.

**Fixture**

S2가 S1을 명시적으로 correct한다.

**Manual verification**

Correction/supersession relation과 current projection을 history와 분리한다.

**Expected**

S1이 보존되고 S2가 linked later statement가 된다.

**Observed**

In-place overwrite가 발생하지 않는다.

**Verdict**

PASS

**Boundary note**

Correction status vocabulary는 TBD.

### Case 18 — Statement contradiction

**Purpose**

Inconsistency와 deception을 구분한다.

**Fixture**

S1은 3 PM, S2는 4 PM이라고 한다.

**Manual verification**

두 Statement provenance와 contradiction candidate를 기록한다.

**Expected**

Inconsistency candidate는 valid하나 lie 판정은 아니다.

**Observed**

어느 statement도 자동 winner가 되지 않는다.

**Verdict**

PASS

**Boundary note**

Contradiction algorithm은 TBD.

### Case 19 — Lie inference attack

**Purpose**

Contradiction에서 deliberate lie를 자동 도출하지 않는지 검증한다.

**Fixture**

System이 S1/S2 inconsistency를 `Witness lied`로 바꾸려 한다.

**Manual verification**

Memory/context/error 가능성을 제거하지 않고 deception semantics가 별도인지 확인한다.

**Expected**

Confirmed lie는 forbidden without separate support다.

**Observed**

ProfessionalAnalysis의 suspicion까지만 가능하다.

**Verdict**

PASS

**Boundary note**

Deception intent mechanics는 TBD.

### Case 20 — False Statement without intent

**Purpose**

Falsity와 intent를 분리한다.

**Fixture**

Person이 honest하게 mistaken X를 말한다.

**Manual verification**

Statement falsehood, Person belief, player knowledge, deception intent를 별도 층으로 둔다.

**Expected**

False content는 deliberate lie 없이도 valid하다.

**Observed**

ActualStateRecord 차이가 player에게 intent로 노출되지 않는다.

**Verdict**

PASS

**Boundary note**

Intent/psychology는 TBD.

### Case 21 — Refusal

**Purpose**

Refusal이 negative fact가 아님을 확인한다.

**Fixture**

P7이 Q4에 답변을 거부한다.

**Manual verification**

Question action와 refusal result를 기록하고 proposition status를 변경하지 않는다.

**Expected**

Structured refusal이 valid하다.

**Observed**

Q4의 답이 false/true라고 결론내리지 않는다.

**Verdict**

PASS

**Boundary note**

Refusal behavior는 TBD.

### Case 22 — No recollection

**Purpose**

No recollection response를 negative fact와 분리한다.

**Fixture**

P7이 `I do not remember`라고 말한다.

**Manual verification**

Response qualification과 unanswered scope를 보존한다.

**Expected**

No-recollection outcome만 기록된다.

**Observed**

사건이 일어나지 않았다고 추론되지 않는다.

**Verdict**

PASS

**Boundary note**

Memory model은 TBD.

### Case 23 — Partial answer

**Purpose**

Partial disclosure를 complete answer와 분리한다.

**Fixture**

Multipart question 중 한 부분만 답변된다.

**Manual verification**

Answered/unanswered components와 RecordedStatement refs를 분리한다.

**Expected**

Partial response와 remaining scope가 valid하다.

**Observed**

전체 topic이 answered로 표시되지 않는다.

**Verdict**

PASS

**Boundary note**

Question component taxonomy는 TBD.

### Case 24 — Interview terminated

**Purpose**

종료된 Interview의 bounded history를 검증한다.

**Fixture**

P7이 remaining topics 전에 Interview를 종료한다.

**Manual verification**

Stop reason, covered/uncovered scope, event/time/history를 기록한다.

**Expected**

Bounded incomplete InterviewWorkProduct가 생성된다.

**Observed**

미질문 topic이 answered로 취급되지 않는다.

**Verdict**

PASS

**Boundary note**

Completion vocabulary는 TBD.

### Case 25 — Document confrontation

**Purpose**

Authorized document 제시가 truth를 강제하지 않음을 확인한다.

**Fixture**

E12를 W3에게 보여 주고 date discrepancy를 질문한다.

**Manual verification**

Shown-source ref, question, response 및 Statement/Lead outputs를 provenance로 연결한다.

**Expected**

Recognition, denial, clarification, uncertainty, new Lead 또는 refusal 모두 가능하다.

**Observed**

E12 제시가 confession/truth를 강제하지 않는다.

**Verdict**

PASS

**Boundary note**

Confrontation response mechanics는 TBD.

### Case 26 — New Person Lead

**Purpose**

Interview-generated Lead가 Investigation으로 반환되는지 검증한다.

**Fixture**

W3가 `Ask P8`이라고 말한다.

**Manual verification**

Statement → P8 Lead provenance와 후속 Task candidate를 분리한다.

**Expected**

P8 Lead만 생성된다.

**Observed**

P8이 auto-contact/interview/testimony가 되지 않는다.

**Verdict**

PASS

**Boundary note**

Follow-up Investigation mechanics는 DEC-021/TBD.

### Case 27 — New document Lead

**Purpose**

Source mention과 acquisition을 분리한다.

**Fixture**

W3가 spreadsheet D9가 있었다고 말한다.

**Manual verification**

Source-existence Lead/KnownGap와 D9 SourceMaterial/acquisition 상태를 분리한다.

**Expected**

D9 existence candidate만 valid하다.

**Observed**

D9 content나 possession이 자동 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

Acquisition route는 DEC-021/TBD.

### Case 28 — Auto-acquisition attack

**Purpose**

Mentioned source가 자동 acquired되지 않는지 검증한다.

**Fixture**

System이 D9 mention 직후 D9 SourceMaterial을 acquired로 표시한다.

**Manual verification**

Separate Investigation Task/ActionAttempt/Result가 존재하는지 확인한다.

**Expected**

Auto-acquisition은 forbidden이다.

**Observed**

D9는 source-existence Lead/KnownGap로만 남는다.

**Verdict**

PASS

**Boundary note**

정확한 acquisition mechanics는 TBD.

### Case 29 — Auto-review attack

**Purpose**

Acquired source가 Interview system에서 자동 해석되지 않는지 확인한다.

**Fixture**

D9가 later acquired되자 witness system이 D9 meaning/contradiction을 자동 생성한다.

**Manual verification**

Evidence Review Task가 없고 RecordedExtraction/Analysis provenance가 없는지 확인한다.

**Expected**

Auto-review는 forbidden이다.

**Observed**

D9는 acquired/unreviewed이며 DEC-020 Review를 기다린다.

**Verdict**

PASS

**Boundary note**

Review mechanics는 DEC-020/TBD.

### Case 30 — Witness omniscience attack

**Purpose**

Witness가 unrelated hidden state를 밝히는지 검증한다.

**Fixture**

W3의 legitimate knowledge path가 없는데 hidden W99를 reveal한다.

**Manual verification**

Person state, authorized context, ActualStateRecord access와 output을 비교한다.

**Expected**

W99 reveal은 forbidden이다.

**Observed**

Witness는 legitimate person-facing knowledge 밖의 정보를 제공하지 않는다.

**Verdict**

PASS

**Boundary note**

PersonKnowledge generation은 TBD; hidden query 금지는 확정이다.

### Case 31 — Exceptional interviewer

**Purpose**

High capability가 truth extraction을 보장하지 않음을 확인한다.

**Fixture**

Exceptional interviewer가 uninformed Person을 인터뷰한다.

**Manual verification**

Profile contribution과 Person knowledge boundary를 별도 기록한다.

**Expected**

Unknown X가 conjure되지 않는다.

**Observed**

Capability는 explicit component/action에만 기여한다.

**Verdict**

PASS

**Boundary note**

Capability mapping은 TBD.

### Case 32 — Limited time

**Purpose**

Time constraint와 capability/profile mutation을 분리한다.

**Fixture**

High-capability interviewer가 모든 topics 전에 time을 소진한다.

**Manual verification**

Covered/uncovered scope, stop event, profile version을 확인한다.

**Expected**

Incomplete Interview이 가능하고 capability는 unchanged다.

**Observed**

Permanent downgrade나 full completion guarantee가 없다.

**Verdict**

PASS

**Boundary note**

Workload/time formula는 TBD.

### Case 33 — Direct player Interview

**Purpose**

Player-direct interaction이 common ontology를 사용하는지 검증한다.

**Fixture**

Player가 questions, order, shown documents, follow-up, stop point를 선택한다.

**Manual verification**

선택과 actions를 Interview Task input 및 WorkProduct/provenance로 연결한다.

**Expected**

Player path가 structured Interview semantics를 사용한다.

**Observed**

Player에게 truth shortcut이나 hidden answer highlight가 없다.

**Verdict**

PASS

**Boundary note**

Dialogue UI/minigame은 TBD.

### Case 34 — Delegated Interview

**Purpose**

Delegated Interview이 direct path와 동일 ontology인지 확인한다.

**Fixture**

Associate가 같은 InterviewTaskDefinition, target, authorized context, topics를 수행한다.

**Manual verification**

Question/action, utterance/record, Statement/Lead, WorkProduct, event/history family를 비교한다.

**Expected**

동일 semantic output families가 사용된다.

**Observed**

`83% truth extracted` hidden engine이 없다.

**Verdict**

PASS

**Boundary note**

NPC AI는 TBD이나 semantic divergence는 금지된다.

### Case 35 — Credibility score attack

**Purpose**

Universal credibility score가 truth/judge authority가 아님을 검증한다.

**Fixture**

`WitnessCredibility = 82`가 canonical authority로 제시된다.

**Manual verification**

Inconsistency, first-hand basis, relationship, uncertainty, corroboration을 structured observations/analysis로 분리한다.

**Expected**

Score-only abstraction은 invalid하다.

**Observed**

Structured ProfessionalAnalysis만 허용되고 truth/JII를 직접 정하지 않는다.

**Verdict**

PASS

**Boundary note**

Credibility taxonomy/formula는 TBD.

### Case 36 — Cooperation equals truth attack

**Purpose**

Cooperation과 truth/credibility를 분리한다.

**Fixture**

Highly cooperative witness가 답변한다.

**Manual verification**

Cooperation event와 content/assertion/analysis를 분리한다.

**Expected**

Cooperation은 truthfulness나 credibility를 prove하지 않는다.

**Observed**

Cooperative mistaken witness와 cooperative truthful witness 모두 의미상 가능하다.

**Verdict**

PASS

**Boundary note**

Behavioral engine은 TBD.

### Case 37 — Statement to CourtRecord attack

**Purpose**

Internal Statement가 자동 CourtRecord가 아님을 확인한다.

**Fixture**

Internal RecordedStatement/Statement를 judge input에 직접 넣으려 한다.

**Manual verification**

Filed statement/testimony/procedural materialization/admission의 부재를 확인한다.

**Expected**

Direct CourtRecord/JII/finding feed는 forbidden이다.

**Observed**

Interview output은 internal Case File/WorkProduct에만 남는다.

**Verdict**

PASS

**Boundary note**

Formal procedure/admission은 TBD.

### Case 38 — Reload reroll

**Purpose**

Materialized interaction event의 replay 안정성을 검증한다.

**Fixture**

`InterviewResponseEvent IRE-1: refuses Q4`가 materialize된 뒤 save를 reload한다.

**Manual verification**

동일 Task/context에서 IRE-1 재사용 여부와 new attempt 구분을 확인한다.

**Expected**

Reload는 same response를 사용한다. 새 시도는 새 Task/Event다.

**Observed**

새 random response가 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

Event probability/generation은 TBD.

### Case 39 — Hidden clue count through witness

**Purpose**

PersonKnowledge의 unrevealed content count leak을 차단한다.

**Fixture**

UI가 `witness has 3 unrevealed facts`라고 표시한다.

**Manual verification**

Known unanswered topics와 hidden PersonKnowledge count를 구분한다.

**Expected**

Hidden fact count/list는 forbidden이다.

**Observed**

Player는 실제로 asked/recorded/gap인 정보만 본다.

**Verdict**

PASS

**Boundary note**

Player-facing projection은 TBD이나 hidden leakage 금지는 확정이다.

### Case 40 — Question not asked / hidden answer

**Purpose**

Unasked known answer가 자동 Case File에 들어가지 않는지 검증한다.

**Fixture**

P가 Y를 알고 있지만 Interview scope에는 Y가 없다.

**Manual verification**

Person state, question scope, InterviewWorkProduct output을 비교한다.

**Expected**

Y는 unrevealed로 남는다.

**Observed**

Auto utterance/Assertion/Analysis가 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

Disclosure mechanics는 TBD.

### Case 41 — PersonKnowledge truth-cache attack

**Purpose**

PersonKnowledge가 ActualStateRecord filtered copy가 아닌지 검증한다.

**Fixture**

World에는 X happened, Y did not happen, Z exists가 있다. P는 legitimate path로 X만 관찰했다. Attack은 PersonKnowledgeState에 X/Y/Z를 모두 넣는다.

**Manual verification**

각 item의 learning/observation/belief origin을 확인하고 world existence만으로 state가 채워졌는지 검사한다.

**Expected**

Attack은 forbidden이다. `PersonKnowledgeState ≠ filtered ActualStateRecord copy`다.

**Observed**

P state에는 legitimate path가 있는 X만 있을 수 있고 Y/Z는 자동 추가되지 않는다.

**Verdict**

PASS

**Boundary note**

정확한 learning/memory algorithm은 발명하지 않았다.

### Case 42 — Unrevealed knowledge leakage attack

**Purpose**

Person knows와 firm knows/disclosed를 분리한다.

**Fixture**

P는 X와 Y를 알지만 Interview는 X만 묻고 X만 답한다. System이 Y도 InterviewWorkProduct에 넣으려 한다.

**Manual verification**

Asked topic, utterance, RS, Y의 Person state와 Case File write를 구분한다.

**Expected**

Y auto-inclusion은 forbidden이다. X만 disclosed/recorded되고 Y는 unrevealed다.

**Observed**

`known by Person ≠ disclosed ≠ known by firm`가 유지된다.

**Verdict**

PASS

**Boundary note**

Remaining-knowledge counter나 response probability는 만들지 않았다.

### Case 43 — RecordedStatement overwrite attack

**Purpose**

Mistaken RecordedStatement가 utterance/source content를 overwrite하지 않는지 검증한다.

**Fixture**

Utterance는 `I arrived around four`; RS는 `I arrived at three`다. RS 의존 PA와 historical strategy가 존재한다.

**Manual verification**

Utterance, RS, PA, strategy, later correction lineage를 각각 보존한다.

**Expected**

Overwrite는 forbidden이다. Later correction은 old layers/history를 삭제하지 않는다.

**Observed**

Source content와 mistaken RS가 분리되고 PA/strategy의 historical dependency가 traceable하다.

**Verdict**

PASS

**Boundary note**

Transcription error/correction mechanics는 TBD.

### Case 44 — Falsity/deception collapse attack

**Purpose**

Objective falsity, player-known falsity와 deliberate deception을 분리한다.

**Fixture**

ActualStateRecord는 X false를 나타내지만 witness는 sincerely X라고 말한다. Later evidence가 X와 conflict를 legitimate하게 드러낸다.

**Manual verification**

Statement X, hidden falsity, later contradiction analysis, player disclosure와 deception intent를 분리한다.

**Expected**

Initial player view에는 Statement X만 있다. Later PA는 inconsistency/deception suspicion을 기록할 수 있으나 confirmed lie는 아니다.

**Observed**

ActualStateRecord 차이가 hidden lie flag로 노출되지 않으며 intent는 별도 TBD다.

**Verdict**

PASS

**Boundary note**

Deception/intent algorithm은 NOT TESTED / TBD.

## 5. PersonKnowledge pressure test

World에서 Event A/B가 발생하고 Document D9가 존재한다. P는 A를 관찰했고 B에 대한 mistaken account를 들었으며 D9는 본 적이 없다. A 질문은 A-related Statement를, B 질문은 mistaken belief를 만들 수 있다. D9 질문은 world 존재만으로 D9를 reveal하지 않는다. 이 test는 정확한 memory object를 만들지 않고 PersonKnowledge/Memory/Belief와 ActualStateRecord의 경계만 검증한다.

## 6. Disclosure pressure test

P가 X/Y/Z를 알고 X 질문에만 답한다. Case File에는 X의 utterance/RS/Assertion만 추가된다. 이후 Y를 명시적으로 질문하는 새 Interview에서 Y가 fixture rule에 따라 disclose될 수 있다. Auto-dump이나 hidden remaining-knowledge count는 허용하지 않는다.

## 7. Question/answer pressure test

다음은 모두 독립적인 valid outcomes다: 질문→refusal, 질문→no recollection, 질문→partial answer, 질문하지 않음→no answer, uninformed Person에게 질문→hidden truth 없음. `asked ≠ answered`, `unanswered ≠ proposition false`를 확인한다.

## 8. Utterance / RecordedStatement pressure test

`around four`→`approximately 4 PM`은 potentially valid provenance-bearing paraphrase다. `around four`→`exactly 4:00 PM`은 false precision risk를 보존해야 한다. `around four`→`3:00 PM`은 mistaken RS다. 세 경우 모두 utterance/source content와 RS를 합치거나 source를 rewrite하지 않는다.

## 9. Multiple-statement pressure test

P의 S1(T1: 3 PM), S2(T2: 4 PM), S3(T3: unsure anymore)는 세 개의 Statement로 보존한다. Contradiction/qualification/correction relation은 가능하지만 timeless merge, 삭제, 자동 truth winner, automatic deception 판정은 금지한다.

## 10. Truth/deception pressure test

S1이 X라고 하고 hidden world가 not-X여도 player는 hidden falsity를 자동으로 보지 않는다. Later E9가 conflict를 드러내면 `S1 appears inconsistent with E9` 분석은 가능하지만 `Witness definitely lied`는 별도 intent semantics 없이 금지된다.

## 11. Cooperation pressure test

Highly cooperative truthful, highly cooperative mistaken, hostile truthful, hostile mistaken witness 네 조합이 모두 개념적으로 가능하다. Cooperation은 interaction state이지 truthfulness/credibility가 아니다.

## 12. Credibility pressure test

Inconsistency, first-hand observation, party relationship, uncertainty, corroboration은 structured observations/ProfessionalAnalysis로 남긴다. `Credibility = 81` 또는 high credibility→statement true는 canonical authority가 아니다. Judge assessment는 downstream separate system이다.

## 13. Document confrontation pressure test

Authorized E12를 보여준 뒤 recognition, denial, uncertainty, explanation, new Person Lead, refusal을 각각 supplied fixture outcome으로 허용할 수 있다. Showing E12 alone은 confession/truth를 강제하지 않는다.

## 14. Interview-generated Lead pressure test

`W3 says Ask P8 → Statement → P8 Lead → DEC-021 Investigation Task candidate`만 valid chain이다. P8 auto-contact/interview/testimony는 새 Task/Event 없이는 발생하지 않는다.

## 15. Interview-generated source pressure test

`There was a spreadsheet D9`는 source-existence Lead/KnownGap다. D9 auto-acquisition, content creation, auto-review는 forbidden이다. Valid chain은 Statement→source Lead→Investigation→acquisition→Evidence Review다.

## 16. Direct/delegated pressure test

Player와 associate는 target, authorized context, topics/questions, actions/results, utterance/record, Statement provenance, Leads, WorkProduct, events/history를 공유한다. `Player=structured; NPC=83% truth extraction`은 invalid다.

## 17. Materialized-event pressure test

Borderline `InterviewResponseEvent IRE-1: refuses Q4`가 materialize되면 reload 후 IRE-1을 재사용한다. 새 contact/interview는 새 Task/Event다. Probability나 global interview roll은 발명하지 않는다.

## 18. Court boundary pressure test

Internal Statement/RS가 존재해도 `filed statement`, `testimony`, `allowed CourtRecord`, `CourtFactFinding`과 동일하지 않다. Explicit valid procedural materialization 없이는 judge/JII/finding에 들어가지 않는다.

## 19. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Person ≠ WitnessRole | 1–2 | PASS candidate | Case-relative potential relation |
| Contact ≠ Interview | 3–5 | PASS candidate | Stages separate |
| Interview requires explicit Task/Event | 5 | PASS candidate | Scope/provenance required |
| ActualStateRecord ≠ PersonKnowledge | 6–10, 30–31, 41, §5 | PASS candidate | No truth cache |
| PersonKnowledge not player-visible | 7–9, 39–42 | PASS candidate | No hidden leakage |
| Person knows ≠ reveals | 7–8, 40, 42, §6 | PASS candidate | Questions/context gate disclosure |
| Uninformed Person cannot reveal hidden fact | 9, 30–31 | PASS candidate | No conjuring |
| Interview scope bounded | 5, 8, 24, 32 | PASS candidate | Uncovered topics remain |
| Asked ≠ answered | 8, 21–24 | PASS candidate | Refusal/partial valid |
| Refusal/no recollection ≠ negative fact | 3, 21–22, §7 | PASS candidate | No proposition mutation |
| Uncertainty preserved | 11–12, 22 | PASS candidate | No false precision |
| Utterance ≠ RecordedStatement | 12–13, 43, §8 | PASS candidate | Fallible record layer |
| RecordedStatement may be mistaken | 13, 43 | PASS candidate | Source not rewritten |
| Mistaken RS cannot overwrite utterance | 13, 43 | PASS candidate | History traceable |
| RecordedStatement ≠ ProfessionalAnalysis | 13–14 | PASS candidate | Content/meaning separated |
| Statement ≠ truth | 6, 10, 15, 20, 44 | PASS candidate | Assertion only |
| SourceAssertion ≠ truth | 6, 15, 28 | PASS candidate | No promotion |
| Multiple Statements distinct | 16–18, §9 | PASS candidate | Context/version retained |
| Correction preserves history | 17, 43 | PASS candidate | No overwrite |
| Contradiction ≠ deception | 18–20, 44 | PASS candidate | Intent TBD |
| Falsity ≠ deliberate lie | 10, 19–20, 44, §10 | PASS candidate | Separate concepts |
| Objective falsity ≠ player-known falsity | 20, 44, §10 | PASS candidate | Hidden state not leaked |
| Interview may miss known information | 7–8, 24, 32, 40–42 | PASS candidate | Exact mechanics TBD |
| Capability ≠ disclosure guarantee | 9, 31, 35 | PASS candidate | No universal score |
| No universal InterviewScore | 31, 35 | PASS candidate | Structured components |
| No hidden weighted formula | 31, 34–35 | PASS candidate | No truth probability |
| Authorized context only | 5, 25, 30, 33–34 | PASS candidate | No hidden prep |
| Confrontation ≠ forced truth | 25, §13 | PASS candidate | Responses remain fallible |
| Interview-generated Lead returns to Investigation | 26–28, §14–15 | PASS candidate | No auto-acquisition |
| Mentioned source ≠ acquired source | 27–29, §15 | PASS candidate | DEC-021 gate |
| Acquired source returns to Evidence Review | 29 | PASS candidate | DEC-020 gate |
| Credibility analysis ≠ objective credibility | 14, 19, 35, §12 | PASS candidate | Downstream separate |
| Cooperation ≠ truth/credibility | 21, 36, §11 | PASS candidate | Interaction state only |
| Direct/delegated same ontology | 33–34, §16 | PASS candidate | No NPC hidden engine |
| Materialized response/no reroll | 38, §17 | PASS candidate | New attempt = new event |
| Internal Statement ≠ CourtRecord | 37, §18 | PASS candidate | Procedure gate |
| No direct JII/finding | 37 | PASS candidate | Litigation boundary |
| No witness hidden-clue count | 30, 39, 42 | PASS candidate | No omniscient UI |
| Witness cannot expose unrelated unknowns | 9, 30, 41–42 | PASS candidate | Person-facing knowledge only |

## 20. Contradiction audit

| Check | Result | Note |
|---|---|---|
| DEC-022 internal contradiction | None observed | Layer separation and bounded disclosure are consistent |
| DEC-021 Investigation boundary | No violation | New Person/source returns as Lead, not auto-action |
| DEC-020 Evidence Review boundary | No violation | Acquired source remains unreviewed |
| DEC-019 Case File boundary | No violation | Statements/analyses are epistemic objects |
| DEC-018 Task/WorkProduct boundary | No violation | Interview is explicit Task/Event |
| DEC-017 capability boundary | No violation | No score/omniscience |
| DEC-015 history/version | No violation | Statements and corrections preserve lineage |
| DEC-013/014 Court/JII/ChoicePoint | No violation | No direct judicial effect |
| PersonKnowledge = ActualStateRecord | Rejected | Cases 9, 30, 41 |
| PersonKnowledge player-visible leak | Rejected | Cases 39, 42 |
| Person knows = disclosure | Rejected | Cases 7, 8, 40, 42 |
| Uninformed Person reveals hidden truth | Rejected | Cases 9, 31 |
| Contact = Interview | Rejected | Cases 3–5 |
| Interview = Statement blob | Rejected | Cases 5, 16, 24 |
| Utterance = RecordedStatement | Rejected | Cases 12–13, 43 |
| RS = ProfessionalAnalysis | Rejected | Cases 13–14 |
| Statement = truth | Rejected | Cases 6, 15, 44 |
| Contradiction = deception | Rejected | Cases 18–20 |
| Falsity = intent | Rejected | Cases 20, 44 |
| Uncertainty = exact fact | Rejected | Cases 11–12 |
| Refusal/non-answer = negative fact | Rejected | Cases 3, 21–22 |
| Cooperation = credibility/truth | Rejected | Case 36 |
| Witness Lead auto-executes Investigation | Rejected | Cases 26–28 |
| Source mention auto-acquires/reviews | Rejected | Cases 27–29 |
| Correction overwrites history | Rejected | Cases 17, 43 |
| Direct/delegated divergence | Rejected | Cases 33–34 |
| Reload reroll | Rejected | Case 38 |
| CourtRecord bypass | Rejected | Case 37 |
| Tester invents psychology | None accepted | Exact mechanics remain TBD |

## 21. False-PASS audit

PASS 판정은 DEC-022의 semantic separations와 declared fixture facts에만 근거한다. PersonKnowledge content, memory accuracy, deception intent, cooperation, response probability, question effectiveness, transcription accuracy, credibility/bias, relevance 또는 legal testimony/admission rule을 발명해 결과를 강제하지 않았다. Exact mechanisms는 NOT TESTED / TBD이며 PASS의 전제가 아니다.

## 22. False-PARTIAL audit

현재 semantic boundary가 명확하므로 PARTIAL 사유가 없다. Psychology, memory, deception algorithm, cooperation probability, dialogue/transcription, credibility, Korean procedure, UI, NPC AI, schema/Godot가 TBD인 것은 의도된 범위이며 PARTIAL 근거가 아니다. PersonKnowledge truth-cache(Case 41), disclosure leakage(Case 42), RS overwrite(Case 43), falsity/deception collapse(Case 44)는 DEC-022의 명시적 경계로 결정된다.

## 23. Remaining TBD / NOT TESTED

- PersonKnowledge/Memory/Belief implementation, learning and memory model.
- Witness relevance/role, contact/cooperation and response behavior.
- Interview question taxonomy, dialogue/response generation, scope/completion.
- Memory accuracy, deception intent and lie-detection mechanics.
- Transcription/paraphrase/recording and correction workflow.
- Capability mappings, Interview components, materialized-event probability.
- Credibility, demeanor, bias and relationship taxonomy/effects.
- Legal witness status, formal Statement/testimony, Korean procedure and admission.
- Client/witness social system, player UI/dialogue/minigames and NPC AI.
- CourtRecord admission/materialization details.
- Save/schema/API/Godot implementation, performance and balancing.

## 24. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Witness truth dispenser | Answers mirror ActualStateRecord | Epistemic gameplay collapses | Fallible PersonKnowledge boundary |
| Interviewer truth scanner | Skill extracts any hidden fact | Capability becomes omniscience | Scope/knowledge/action gates |
| Every Person useful | All Persons know relevant facts | Contact choices become fake | Irrelevant/uninformed Persons valid |
| Every Interview progresses | No refusal/miss/dead end | Uncertainty disappears | Structured incomplete outcomes |
| Contradiction means lying | Inconsistency fixes intent | Memory/context erased | Separate contradiction/falsity/deception |
| Credibility score authority | One number selects truth | Evidence structure disappears | Structured observations/analysis |
| Cooperation means truth | Helpful behavior proves claims | Bias shortcut | Separate cooperation/content |
| Cosmetic questions | All Person knowledge auto-dumped | Player choice meaningless | Explicit question/topic coverage |
| Hidden clue counters | UI lists unrevealed knowledge | Unknown state leaks | Show asked/recorded/gaps only |
| Dialogue explosion | Every utterance manually authored | Scale becomes unusable | Scoped Tasks/projections/delegation |
| Interview farming | Same interaction rerolls | Exploit/history instability | Materialize events/new Tasks |
| RS overwrite | Correction changes source utterance | Provenance corruption | Separate fallible record layer |
| Auto-acquisition/review | Mentioned source appears understood | DEC-021/020 bypass | Lead→Investigation→Review gates |
| Statement auto-CourtRecord | Internal note becomes testimony | Procedure bypass | Explicit materialization |
| Witness duplicates Investigation | Mention auto-finds source/person | Scope collapse | Return as Lead only |

## 25. Player-facing design principle

Player should see why a Person matters, contact/Interview status, what was asked, what was recorded, uncertainty/refusal, Statement versions, contradiction/corroboration candidates and follow-up Leads. Player should not see secret PersonKnowledge, hidden truthfulness/lie flags, remaining unrevealed-facts count, objective credibility or future judge belief.

## 26. Solo → firm progression hook

```text
Solo → player conducts key Interviews
Associates → delegated routine/factual Interviews
Specialists/investigators → role-permitted factual interviewing
Larger firm → preparation, Interview, review and follow-up Tasks split among staff
Partner/player → critical witnesses and strategy
```

This is supported architecture, not mandatory progression or a claim about Korean role law.

## 27. Suggested TEST-021 status / no TEST-022

This document is the TEST-021 artifact and does not create TEST-022. Any later test should target the next accepted DEC, not retroactively add psychology or procedure mechanics here.

## 28. DEC-023 candidates

| Candidate | Prerequisite fit | Risk |
|---|---|---|
| Legal Research & Issue Analysis | Uses separated Assertions, Statements and ProfessionalAnalysis | Doctrine/content boundary required |
| Case Theory / Evidence Synthesis | Integrates witness/evidence interpretations | May auto-resolve truth |
| Client Interaction / Information Provision | Extends source provision and Person assertions | Social system dependency |
| Task Assignment / Workload / Team Coordination | Scales delegated interviews/review | More Task families needed |
| Witness Preparation / Court Examination | Continues lifecycle toward formal hearing | Depends on testimony/procedure |

**Default recommendation:** `DEC-023 — Legal Research & Issue Analysis`, unless TEST-021 review reveals a stronger prerequisite. It can consume the now-separated Statement/Assertion/Analysis objects without prematurely defining formal testimony or deception mechanics.

## 29. Final verification summary

```text
Total core cases: 44
PASS: 44
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none  
FAIL cases: none

- DEC-022 reopen required: No semantic reopen indicated.
- Internal contradiction: None observed.
- Inherited boundary violation: None accepted.
- ActualStateRecord truth-query leakage: Rejected.
- PersonKnowledge truth-cache leak: Rejected in Case 41.
- Hidden PersonKnowledge/player leak: Rejected in Cases 39 and 42.
- Disclosure leakage: Rejected in Cases 7, 8, 40 and 42.
- Contact/Interview collapse: Rejected.
- Utterance/RecordedStatement collapse: Rejected in Cases 12, 13 and 43.
- Statement/truth collapse: Rejected.
- Falsity/deception collapse: Rejected in Cases 19, 20 and 44.
- Cooperation/credibility collapse: Rejected.
- Interview-generated Investigation bypass: Rejected.
- Source acquisition/review bypass: Rejected.
- History overwrite: None accepted.
- Reload reroll: None accepted.
- CourtRecord bypass: Rejected.
- Issue blocking DEC-022 promotion: None at fixture-level.
- Issue blocking DEC-023: None at fixture-level.

## 30. Promotion recommendation

Fixture-level result에 semantic blocker가 없으므로 다음을 design-review에 권고한다.

```text
DEC-022 v0.1 → v0.2 Accepted
TEST-021 v0.1 → v0.2 Accepted / manual fixture-level verification
```

TEST 자체가 DEC 상태를 자동 변경하는 것은 아니다. Exact person psychology, memory, deception, cooperation, recording, procedure 및 implementation은 계속 TBD다.

## 31. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-022 WIT1–WIT35를 기준으로 Person/contact/Interview/utterance/RecordedStatement/Assertion/Analysis separation, PersonKnowledge/disclosure, falsity/deception, Investigation/Review/CourtRecord boundaries와 44개 core fixture를 작성. |
