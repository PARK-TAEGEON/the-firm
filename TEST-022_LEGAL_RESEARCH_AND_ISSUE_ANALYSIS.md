# THE FIRM — Legal Research and Issue Analysis

문서 ID: TEST-022  
버전: v0.1 — Manual verification draft  
상태: **Proposed / manual fixture-level verification**  
프로젝트: THE FIRM  
문서 유형: Manual Verification Test  
Source DEC: `DEC-LITIGATION-023_LEGAL_RESEARCH_AND_ISSUE_ANALYSIS.md` v0.1 Proposed / design review required

## 1. Purpose

이 문서는 DEC-023의 Legal Research & Issue Analysis semantics를 synthetic fixture에 수동 적용해 다음 separation을 검증한다.

```text
LegalSource
≠ LegalAuthorityCitation
≠ RecordedLegalExtraction
≠ RuleStatement
≠ InterpretationCandidate
≠ IssueApplicationAnalysis
≠ Argument
≠ Court-adopted interpretation
≠ CourtFactFinding
```

또한:

```text
source exists ≠ source found ≠ source reviewed ≠ source understood
≠ source interpreted correctly ≠ source correctly applied
```

이 TEST는 구현 테스트나 실제 한국 법률 실무 검증이 아니다. `Observed`는 DEC-023 semantics의 manual fixture application이다.

## 2. Verdict rules and scope

`PASS`는 DEC-023 semantic boundary가 fixture 결과를 결정하고 inherited DEC와 모순되지 않을 때 사용한다. `PARTIAL`은 semantic separation 자체가 불명확하거나 둘 이상의 해석이 가능할 때만 사용한다. Substantive law, hierarchy, precedent, jurisdiction, search engine, probability, UI, NPC AI, schema/Godot가 TBD라는 이유만으로 PARTIAL을 주지 않는다. `FAIL`은 hidden correct-law query, source/rule/truth collapse, ActualStateRecord leakage, CourtRecord/JII/finding bypass, history overwrite 또는 hidden score/oracle가 실제로 발생할 때다.

## 3. Inherited boundaries

- `ActualStateRecord ≠ CaseFileState ≠ CourtRecord ≠ CourtFactFinding`.
- Legal Research는 DEC-020 Evidence Review 또는 DEC-021 Investigation을 대체하지 않는다.
- SourceAssertion, Witness Statement, ProfessionalAnalysis는 typed Case File inputs이지 accepted facts가 아니다.
- LegalSource, RecordedLegalExtraction, RuleStatement, InterpretationCandidate, IssueAnalysis와 Argument는 분리한다.
- Research는 hidden legal model/hidden winning authority/미래 judge acceptance를 query하지 않는다.
- Direct/delegated Tasks, structured WorkProducts, materialized events, no reload reroll 및 immutable history를 상속한다.
- Research/IssueAnalysis/Argument는 explicit later procedural path 없이 CourtRecord/JII/ChoicePoint/finding/outcome을 변경하지 않는다.

## 4. Core cases

모든 fixture는 synthetic이다. 각 case는 legal question/Issue basis, bounded search domain, LegalSource/citation, extraction/rule/interpretation/application/argument layers, hidden legal model과 CourtRecord/JII/finding 경계를 구분한다.

### Case 1 — Basic legal research Task

**Purpose**

Explicit legal question과 bounded research Task를 검증한다.

**Fixture**

Issue I3, question `What rule governs termination-notice timing?`, authorized factual context, defined source collection, lawyer assignment와 time이 있다.

**Manual verification**

Task basis/domain, queries, found/reviewed sources, outputs와 provenance를 기록한다.

**Expected**

Valid Legal Research Task와 structured WorkProduct가 가능하다.

**Observed**

Question/domain이 answer-key query로 확장되지 않는다.

**Verdict**

PASS

**Boundary note**

Exact TaskDefinition/schema는 NOT TESTED / TBD.

### Case 2 — No explicit legal question

**Purpose**

Unbounded `find useful law` 요청을 거부한다.

**Fixture**

Issue/question/domain 없이 `Find useful law`만 제시된다.

**Manual verification**

Explicit Issue/question, source domain, scope와 output requirement의 부재를 확인한다.

**Expected**

Research Task basis가 insufficient/invalid하다.

**Observed**

Hidden winning authority가 반환되지 않는다.

**Verdict**

PASS

**Boundary note**

Question authoring UX는 TBD.

### Case 3 — Hidden correct-law query

**Purpose**

Hidden legal model의 canonical interpretation query를 차단한다.

**Fixture**

Issue I3가 engine에 `return the correct interpretation`을 요청한다.

**Manual verification**

허용된 source/query path 없이 hidden model이 결과를 주는지 확인한다.

**Expected**

Forbidden.

**Observed**

Research는 source-based candidate만 생산한다.

**Verdict**

PASS

**Boundary note**

Substantive legal content는 TBD.

### Case 4 — Bounded statute search

**Purpose**

정의된 statute collection과 topic domain을 검증한다.

**Fixture**

Question Q가 topic/jurisdiction statute collection D에서 검색된다.

**Manual verification**

Query, domain, source refs와 resulting candidates를 기록한다.

**Expected**

Bounded research가 valid하다.

**Observed**

Applicability가 자동 확정되지 않는다.

**Verdict**

PASS

**Boundary note**

Statute hierarchy는 TBD.

### Case 5 — Bounded case-law search

**Purpose**

Defined decision collection에서의 case-law search를 검증한다.

**Fixture**

I4/query와 authorized decision collection이 있다.

**Manual verification**

Found citations, ResearchLeads, reviewed status와 context를 확인한다.

**Expected**

Candidate cases가 provenance와 함께 생성될 수 있다.

**Observed**

모든 관련 판례가 보장되거나 controlling으로 표시되지 않는다.

**Verdict**

PASS

**Boundary note**

Search infrastructure는 TBD.

### Case 6 — Search all law everywhere attack

**Purpose**

Global omniscient legal search를 차단한다.

**Fixture**

`Search everything and return what wins` 요청이 들어온다.

**Manual verification**

Bounded question/domain이 없는지 확인한다.

**Expected**

Invalid; narrower explicit Task가 필요하다.

**Observed**

Global answer가 반환되지 않는다.

**Verdict**

PASS

**Boundary note**

No Korean doctrine is inferred.

### Case 7 — Authority exists but not found

**Purpose**

Source existence와 discovery를 분리한다.

**Fixture**

Authority A9가 source universe에 있으나 query/path가 A9에 도달하지 않는다.

**Manual verification**

Universe existence, path, result scope와 player-visible knowledge를 구분한다.

**Expected**

A9는 unfound로 남는다.

**Observed**

Hidden decisive-authority count가 표시되지 않는다.

**Verdict**

PASS

**Boundary note**

Miss probability는 TBD.

### Case 8 — Authority found but not read

**Purpose**

Citation discovery와 review/understanding을 분리한다.

**Fixture**

A4 citation은 발견됐지만 source content는 아직 열지 않았다.

**Manual verification**

Citation/Lead와 reviewed source/RuleStatement를 분리한다.

**Expected**

Found-only state다.

**Observed**

A4가 자동 rule이나 analysis가 되지 않는다.

**Verdict**

PASS

**Boundary note**

Review depth mechanics는 TBD.

### Case 9 — Authority read but misinterpreted

**Purpose**

Researcher error를 표현한다.

**Fixture**

Researcher가 A4를 읽었지만 limiting language를 놓친다.

**Manual verification**

Source content, RecordedLegalExtraction, RuleStatement와 analysis를 별도 기록한다.

**Expected**

Fallible extraction/RuleStatement가 valid하다.

**Observed**

Source가 rewrite되지 않고 hidden model이 auto-correct하지 않는다.

**Verdict**

PASS

**Boundary note**

Error frequency/algorithm은 TBD.

### Case 10 — RuleStatement extracted

**Purpose**

Source에서 candidate rule을 추출하는 단계를 검증한다.

**Fixture**

A4 reviewed; researcher가 R4를 만들고 citation/context를 연결한다.

**Manual verification**

LegalSource, extraction, R4 provenance와 limits를 확인한다.

**Expected**

Provenance-bearing RuleStatement candidate가 valid하다.

**Observed**

R4가 governing law가 되지 않는다.

**Verdict**

PASS

**Boundary note**

Rule extraction vocabulary는 TBD.

### Case 11 — RuleStatement overstates source

**Purpose**

Overbroad legal synthesis와 source를 분리한다.

**Fixture**

A4는 exception C를 포함하지만 R4는 `always applies`라고 쓴다.

**Manual verification**

Exception, source version, R4 limitation과 later correction history를 기록한다.

**Expected**

Mistaken/overbroad R4가 가능하며 A4는 unchanged다.

**Observed**

R4가 자동 governing law로 승격되지 않는다.

**Verdict**

PASS

**Boundary note**

Correction mechanics는 TBD.

### Case 12 — Authority found ≠ applicable

**Purpose**

Topic similarity와 case applicability를 분리한다.

**Fixture**

A4가 유사 doctrine을 다루지만 I3 적용성은 unresolved다.

**Manual verification**

Found/cited status와 application candidate를 분리한다.

**Expected**

A4는 contextual candidate다.

**Observed**

Discovery만으로 controlling/applicable flag가 생기지 않는다.

**Verdict**

PASS

**Boundary note**

Authority hierarchy는 TBD.

### Case 13 — Wrong jurisdiction authority

**Purpose**

Jurisdiction mismatch를 보존한다.

**Fixture**

A7은 다른 jurisdiction/context의 source다.

**Manual verification**

Source jurisdiction, question context, warning/limitation을 연결한다.

**Expected**

A7은 candidate일 수 있으나 automatic governing authority가 아니다.

**Observed**

Mismatch가 숨겨지거나 해결되지 않는다.

**Verdict**

PASS

**Boundary note**

Actual jurisdiction rules는 TBD.

### Case 14 — Old or superseded source

**Purpose**

Temporal/version validity를 검증한다.

**Fixture**

A1-v1은 historical source이고 later context에서 superseded 가능성이 있다.

**Manual verification**

Version/effective time/research time를 WorkProduct에 보존한다.

**Expected**

Time-limited candidate로 남는다.

**Observed**

Current law로 silent update되지 않는다.

**Verdict**

PASS

**Boundary note**

Supersession semantics는 TBD.

### Case 15 — Conflicting authorities

**Purpose**

Conflicting authority coexistence를 검증한다.

**Fixture**

A는 X, B는 Y를 지지한다.

**Manual verification**

각 source, citation, RuleStatement/InterpretationCandidate와 conflict relation을 보존한다.

**Expected**

X/Y branch가 모두 존재할 수 있다.

**Observed**

Automatic legal winner가 없다.

**Verdict**

PASS

**Boundary note**

Conflict resolution은 TBD.

### Case 16 — Majority-authority attack

**Purpose**

Authority count가 truth를 결정하지 않음을 검증한다.

**Fixture**

세 citations가 X, 하나가 Y를 지지한다.

**Manual verification**

Count와 authority context/quality를 분리한다.

**Expected**

`3 vs 1 → X is law`는 invalid다.

**Observed**

Count는 structured context일 뿐 legal truth authority가 아니다.

**Verdict**

PASS

**Boundary note**

No binding/persuasive hierarchy is invented.

### Case 17 — Search finds nothing

**Purpose**

Bounded negative research result를 검증한다.

**Fixture**

Domain D/query Q/time T에서 relevant authority가 없다.

**Manual verification**

No-result scope와 global proposition을 구분한다.

**Expected**

`No relevant result in D using Q at T`만 valid하다.

**Observed**

`No supporting authority exists`로 확장되지 않는다.

**Verdict**

PASS

**Boundary note**

Exhaustive-domain rule은 TBD이며 발명하지 않는다.

### Case 18 — Exceptional researcher misses authority

**Purpose**

Capability와 exhaustive research를 분리한다.

**Fixture**

Exceptional researcher의 path가 A9를 놓친다.

**Manual verification**

Profile, search path, missing result와 player knowledge를 구분한다.

**Expected**

A9 miss가 valid하다.

**Observed**

No hidden missed-decisive count가 생성된다.

**Verdict**

PASS

**Boundary note**

Miss mechanics는 TBD.

### Case 19 — Specialist with wrong Issue scope

**Purpose**

Specialization과 scope correctness를 분리한다.

**Fixture**

Specialist가 overly narrow/wrong question을 연구한다.

**Manual verification**

Task scope, specialist profile, output scope와 unrelated sources를 구분한다.

**Expected**

Scope-bound result가 valid하다.

**Observed**

Specialist가 case-wide legal oracle가 되지 않는다.

**Verdict**

PASS

**Boundary note**

Specialist mapping은 TBD.

### Case 20 — Legal source version update

**Purpose**

New authority version이 old memo를 rewrite하지 않음을 검증한다.

**Fixture**

A-v1/M1/R1이 T1에 존재하고 A-v2가 T2에 나타난다.

**Manual verification**

Version/time refs와 follow-up Task candidate를 보존한다.

**Expected**

M1/R1은 v1에 tied되고 v2는 new review candidate다.

**Observed**

Retroactive mutation이 없다.

**Verdict**

PASS

**Boundary note**

Delta-review mechanics는 TBD.

### Case 21 — Duplicate citation/provenance

**Purpose**

같은 authority에 도달한 path들의 provenance를 보존한다.

**Fixture**

Search path Q1/Q2가 동일 A4를 reference한다.

**Manual verification**

Identity candidate와 두 discovery/research path를 유지한다.

**Expected**

Duplicate relation은 가능하지만 provenance 삭제는 금지된다.

**Observed**

A4 source history가 하나의 citation으로 소실되지 않는다.

**Verdict**

PASS

**Boundary note**

Dedup algorithm은 TBD.

### Case 22 — ResearchLead from citation chain

**Purpose**

Citation이 follow-up ResearchLead가 되는 chain을 검증한다.

**Fixture**

A4가 A8을 cite한다.

**Manual verification**

A4 → A8 Lead provenance와 authority status를 분리한다.

**Expected**

A8 Lead가 생성될 수 있다.

**Observed**

A8이 controlling/correct authority로 표시되지 않는다.

**Verdict**

PASS

**Boundary note**

Lead taxonomy는 TBD.

### Case 23 — Follow-up research Task

**Purpose**

Research scope expansion을 explicit Task로 제한한다.

**Fixture**

A8 Lead가 original scope 밖의 research를 제안한다.

**Manual verification**

Original Task, Lead와 follow-up Task candidate를 분리한다.

**Expected**

새 Task가 valid하다.

**Observed**

Original Task가 무한 citation traversal을 하지 않는다.

**Verdict**

PASS

**Boundary note**

Scheduler/auto-task mechanics는 TBD.

### Case 24 — IssueAnalysis with SourceAssertions

**Purpose**

Typed SourceAssertion을 legal application에 사용하는지 검증한다.

**Fixture**

I3 analysis가 A1/A7 assertions와 R3를 사용한다.

**Manual verification**

Assertion refs, RuleStatement, application reasoning과 assumptions를 분리한다.

**Expected**

Valid conditional IssueAnalysis가 가능하다.

**Observed**

A1/A7이 AcceptedFacts로 변환되지 않는다.

**Verdict**

PASS

**Boundary note**

Issue schema/IRAC projection은 TBD.

### Case 25 — IssueAnalysis with Witness Statement

**Purpose**

Witness Statement의 epistemic type을 보존한다.

**Fixture**

I3 analysis가 S4와 R3를 사용한다.

**Manual verification**

Statement provenance, conditional wording과 conclusion candidate를 확인한다.

**Expected**

S4 remains Statement; conditional application is valid.

**Observed**

S4가 true로 mutation되지 않는다.

**Verdict**

PASS

**Boundary note**

Witness credibility rules는 TBD.

### Case 26 — IssueAnalysis with ProfessionalAnalysis

**Purpose**

Analysis-on-analysis를 truth promotion 없이 표현한다.

**Fixture**

I3가 Evidence Review PA2를 factual/legal context로 참조한다.

**Manual verification**

PA2 source/task/provenance와 새로운 PA의 uncertainty를 연결한다.

**Expected**

ProfessionalAnalysis remains analysis.

**Observed**

PA2가 objective fact로 flatten되지 않는다.

**Verdict**

PASS

**Boundary note**

Analysis correctness는 TBD.

### Case 27 — Hidden ActualStateRecord fact injected

**Purpose**

ActualStateRecord가 legal-analysis input이 아님을 확인한다.

**Fixture**

Hidden F9가 Case File에 없는데 IssueAnalysis에 삽입된다.

**Manual verification**

Authorized snapshot과 hidden source를 비교한다.

**Expected**

Injection은 forbidden이다.

**Observed**

F9가 analysis/RuleStatement에 나타나지 않는다.

**Verdict**

PASS

**Boundary note**

Hidden model semantics는 TBD이나 access 금지는 확정이다.

### Case 28 — Conditional application

**Purpose**

Assumption과 accepted fact를 분리한다.

**Fixture**

`If A1 is accepted, R supports C`가 작성된다.

**Manual verification**

If-clause, A1 type, R, C와 Case File mutation을 확인한다.

**Expected**

Valid conditional conclusion candidate다.

**Observed**

A1이나 C가 true로 설정되지 않는다.

**Verdict**

PASS

**Boundary note**

Conditional syntax/schema는 TBD.

### Case 29 — Two factual scenarios

**Purpose**

Competing factual branches를 보존한다.

**Fixture**

Scenario A는 S1을, Scenario B는 E3 analysis를 전제로 한다.

**Manual verification**

Typed assumptions, source refs와 application outputs를 별도 유지한다.

**Expected**

두 factual scenario가 coexist할 수 있다.

**Observed**

자동 factual winner가 없다.

**Verdict**

PASS

**Boundary note**

Scenario presentation은 TBD.

### Case 30 — Two legal interpretations

**Purpose**

Competing legal interpretations를 보존한다.

**Fixture**

동일 factual inputs에 X/Y interpretation candidates가 있다.

**Manual verification**

Authorities, RuleStatements, interpretation provenance와 limitations를 기록한다.

**Expected**

X/Y가 모두 candidate다.

**Observed**

Researcher skill/count가 법을 자동 선택하지 않는다.

**Verdict**

PASS

**Boundary note**

Court interpretation은 downstream/TBD.

### Case 31 — Conclusion candidate

**Purpose**

Qualified conclusion과 judgment를 분리한다.

**Fixture**

Analysis가 `argument is supportable but contested`라고 결론낸다.

**Manual verification**

Assumptions, strengths/weaknesses, uncertainty와 conclusion type을 보존한다.

**Expected**

Conclusion candidate가 valid하다.

**Observed**

Judgment/outcome이 생성되지 않는다.

**Verdict**

PASS

**Boundary note**

Conclusion vocabulary는 TBD.

### Case 32 — Conclusion truth attack

**Purpose**

Lawyer conclusion이 case result가 아님을 검증한다.

**Fixture**

System이 lawyer conclusion C를 legal outcome으로 설정하려 한다.

**Manual verification**

Conclusion candidate와 CourtFactFinding/outcome mutation을 비교한다.

**Expected**

Forbidden.

**Observed**

Internal analysis만 남는다.

**Verdict**

PASS

**Boundary note**

No substantive outcome rule is invented.

### Case 33 — Argument candidate

**Purpose**

Argument와 IssueAnalysis를 분리한다.

**Fixture**

Lawyer가 uncertainty를 알면서 Interpretation X를 advocate하기로 선택한다.

**Manual verification**

Analysis assessment와 advocacy formulation, source refs를 분리한다.

**Expected**

Argument candidate가 valid하다.

**Observed**

X가 correct law로 승격되지 않는다.

**Verdict**

PASS

**Boundary note**

Drafting/filing mechanics는 TBD.

### Case 34 — Argument equals correct law attack

**Purpose**

Selected Argument를 canonical law로 만드는 것을 차단한다.

**Fixture**

Argument X가 `correct interpretation`으로 저장된다.

**Manual verification**

Argument, RuleStatement/InterpretationCandidate와 governing-law status를 분리한다.

**Expected**

Forbidden.

**Observed**

Argument는 advocacy candidate로만 남는다.

**Verdict**

PASS

**Boundary note**

No authority hierarchy is inferred.

### Case 35 — CaseStrength=82 attack

**Purpose**

Universal case score collapse를 검증한다.

**Fixture**

System이 `CaseStrength=82` 또는 `IssueWinChance=74%`를 canonical truth로 제시한다.

**Manual verification**

Sources, assertions, gaps, branches와 number authority를 비교한다.

**Expected**

Score-only result는 invalid하다.

**Observed**

Structured strengths/weaknesses/assumptions가 source of truth다.

**Verdict**

PASS

**Boundary note**

Non-authoritative tuning value는 이 TEST 범위 밖이다.

### Case 36 — Direct player research

**Purpose**

Player-direct research가 common ontology를 쓰는지 검증한다.

**Fixture**

Player가 question, terms, source, depth, stop point를 선택한다.

**Manual verification**

선택, query/path, source, extraction, rule, analysis와 provenance를 연결한다.

**Expected**

Valid structured direct execution이다.

**Observed**

Player에게 hidden correct answer가 표시되지 않는다.

**Verdict**

PASS

**Boundary note**

UI/minigame mechanics는 TBD.

### Case 37 — Delegated research

**Purpose**

Delegated research의 semantic equivalence를 확인한다.

**Fixture**

Associate가 동일 LegalResearchTaskDefinition, domain, context, direction을 수행한다.

**Manual verification**

Player path와 source/citation/extraction/rule/analysis/history families를 비교한다.

**Expected**

동일 ontology가 사용된다.

**Observed**

별도 simplified NPC engine이 없다.

**Verdict**

PASS

**Boundary note**

NPC AI는 TBD.

### Case 38 — Hidden success-percentage delegation

**Purpose**

Delegation correctness percentage를 차단한다.

**Fixture**

NPC가 `87% correct legal answer`를 결과로 받는다.

**Manual verification**

Number가 WorkProduct/source/rule/analysis를 대체하는지 확인한다.

**Expected**

Invalid/forbidden canonical abstraction이다.

**Observed**

명시적 research outputs만 의미를 갖는다.

**Verdict**

PASS

**Boundary note**

Internal tuning numbers는 semantic authority가 될 수 없다.

### Case 39 — Research memo update

**Purpose**

Memo revision lineage를 검증한다.

**Fixture**

Review Task가 Memo v1을 v2로 수정한다.

**Manual verification**

Source versions, reviewer/task, changes, unresolved issues와 current projection을 연결한다.

**Expected**

v1과 v2가 lineage로 보존된다.

**Observed**

v1이 삭제/overwrite되지 않는다.

**Verdict**

PASS

**Boundary note**

Revision merge mechanics는 TBD.

### Case 40 — Later authority challenges old memo

**Purpose**

Later authority가 old research를 retroactively rewrite하지 않음을 확인한다.

**Fixture**

A-new이 M1/R1 assumptions와 conflict한다.

**Manual verification**

Challenge/supersession analysis와 old memo provenance를 분리한다.

**Expected**

M1은 historical, new analysis는 later challenge다.

**Observed**

T1의 strategy/history가 유지된다.

**Verdict**

PASS

**Boundary note**

Supersession vocabulary는 TBD.

### Case 41 — ResearchWorkProduct to CourtRecord attack

**Purpose**

Internal research가 자동 CourtRecord가 아님을 검증한다.

**Fixture**

LegalResearchWorkProduct를 직접 CourtRecord에 넣으려 한다.

**Manual verification**

Draft/submission/procedural materialization 부재를 확인한다.

**Expected**

Forbidden.

**Observed**

후속 valid procedure 없이는 court input이 되지 않는다.

**Verdict**

PASS

**Boundary note**

Admission/filing는 TBD.

### Case 42 — IssueAnalysis to JII attack

**Purpose**

IssueAnalysis가 JII/ChoicePoint를 직접 수정하지 않음을 확인한다.

**Fixture**

Strong IssueAnalysis가 JudgeInterpretationInput을 직접 바꾸려 한다.

**Manual verification**

Analysis output과 JII/CP mutation을 비교한다.

**Expected**

Forbidden.

**Observed**

후속 argument/procedure path만 허용된다.

**Verdict**

PASS

**Boundary note**

Judge interpretation mechanics는 inherited/TBD.

### Case 43 — IssueAnalysis to CourtFactFinding attack

**Purpose**

Lawyer conclusion이 CourtFactFinding이 아님을 검증한다.

**Fixture**

IssueAnalysis C가 finding을 직접 변경하려 한다.

**Manual verification**

ProfessionalAnalysis와 court state를 분리한다.

**Expected**

Forbidden.

**Observed**

Internal analysis만 Case File에 남는다.

**Verdict**

PASS

**Boundary note**

No outcome formula is created.

### Case 44 — Hidden winning authority marker

**Purpose**

Hidden decisive source/interpretation marker를 차단한다.

**Fixture**

UI가 undiscovered case를 `winning authority`로 표시한다.

**Manual verification**

Marker/count가 legitimate research result인지 hidden model leakage인지 확인한다.

**Expected**

Forbidden.

**Observed**

Known relevance/interpretation candidates만 표시될 수 있다.

**Verdict**

PASS

**Boundary note**

Player-facing projection은 TBD지만 answer-key leak은 금지된다.

### Case 45 — Hidden legal model truth-cache attack

**Purpose**

Hidden canonical law가 firm research output으로 복제되지 않는지 검증한다.

**Fixture**

Hidden model은 I3의 canonical interpretation B와 decisive A9를 안다. Research path는 A9/B에 도달하지 않았다. System이 R-B와 `Recommended authority A9`를 삽입한다.

**Manual verification**

Hidden model input과 actual source/query/research provenance를 비교한다.

**Expected**

Forbidden. Hidden model ≠ firm knowledge/research output/analysis다.

**Observed**

A9/B가 legitimate path 없이 나타나지 않는다.

**Verdict**

PASS

**Boundary note**

Substantive law를 발명하지 않았다.

### Case 46 — RuleStatement governing-law laundering attack

**Purpose**

RuleStatement와 governing law를 분리한다.

**Fixture**

A4는 nuanced language를 가지지만 researcher가 R4 `Requirement C always applies`를 만들고 system이 GoverningLaw로 저장한다.

**Manual verification**

A4, extraction, R4 provenance/limits와 governing-law status를 구분한다.

**Expected**

GoverningLaw 승격은 forbidden. R4는 wrong/overbroad/context-bound일 수 있다.

**Observed**

A4와 R4 history가 유지되고 later correction이 가능하다.

**Verdict**

PASS

**Boundary note**

Hierarchy/status mechanics는 TBD.

### Case 47 — Conditional assumption truth-laundering attack

**Purpose**

Conditional application이 fact/outcome mutation이 아닌지 검증한다.

**Fixture**

`If Statement S4 is accepted, Rule R may support Conclusion C`가 IssueAnalysis에 있다. System이 S4 accepted와 C true를 설정한다.

**Manual verification**

Assumption, Statement, Rule, Conclusion candidate와 Case File/Court state를 비교한다.

**Expected**

Forbidden. Conditional application ≠ truth mutation.

**Observed**

Branch는 useful하게 남되 S4/C가 확정되지 않는다.

**Verdict**

PASS

**Boundary note**

Branch schema는 TBD.

### Case 48 — Branch auto-collapse into case answer attack

**Purpose**

Competing factual/legal branches가 자동 case answer가 되지 않음을 검증한다.

**Fixture**

I8에 `Fact Scenario A + Legal Interpretation X`와 `Fact Scenario B + Legal Interpretation Y`가 있다.

**Manual verification**

각 branch의 provenance, assumptions, analysis와 final-answer output을 비교한다.

**Expected**

Downstream adjudicative/procedural rule 없이 `Scenario A + X wins`는 forbidden이다.

**Observed**

Branches가 coexist하며 IssueAnalysis로만 남는다.

**Verdict**

PASS

**Boundary note**

Synthesis/adjudication algorithm은 TBD.

## 5. Hidden-law-model pressure test

HiddenLegalModel이 I3의 canonical interpretation B를 알고, firm은 A1/A2에서 A를 지지하는 materials만 찾은 fixture를 적용한다. Research output은 found materials에 근거한 A candidate일 수 있지만 hidden model은 memo를 auto-correct하거나 B/A9를 reveal하거나 `one decisive authority remains`를 표시하지 않는다. Hidden legal model은 player-visible correctness oracle가 아니다.

## 6. Source/discovery/review pressure test

A9에 대해 `exists in source universe → citation discovered → source opened/reviewed → RecordedLegalExtraction → RuleStatement → InterpretationCandidate → IssueAnalysis` 단계를 별도로 기록한다. 어떤 앞 단계도 뒤 단계를 imply하지 않으며, 발견되지 않은 A9의 내용을 WorkProduct에 넣지 않는다.

## 7. Legal extraction pressure test

LegalSource가 `R applies where C1 and C2`라고 말하지만 RecordedLegalExtraction이 `C1`만 기록할 수 있다. Source는 unchanged이고 mistaken extraction/RuleStatement/analysis는 fallible history로 남는다. Error probability나 correction algorithm은 만들지 않는다.

## 8. RuleStatement pressure test

다음 네 층을 구분한다: (A) Source A says R under C, (B) RecordedLegalExtraction records that proposition, (C) RuleStatement synthesizes `R applies under C`, (D) IssueAnalysis says `if C is established, R may support O`. 어느 것도 자동 governing law나 outcome이 아니다.

## 9. Authority applicability pressure test

Same-topic but unresolved, wrong-jurisdiction/context, historical/superseded 세 A4 사례에서 source/citation은 valid research object로 남지만 applicability/controlling status는 별도 candidate다. Discovery만으로 status를 확정하지 않는다.

## 10. Conflicting-authority pressure test

A→X, B→Y, C→X를 provenance와 함께 보존한다. `2 vs 1`, researcher confidence, seniority 또는 UI order로 X를 law로 확정하지 않는다.

## 11. Negative research pressure test

Domain D/query Q/T에서 no-result를 `bounded negative observation`으로만 기록한다. Explicit exhaustive-domain rule 없이는 `no authority exists`가 되지 않는다.

## 12. Research miss pressure test

A9가 universe에 있어도 path가 도달하지 않으면 unfound다. Exceptional profile도 hidden miss count나 decisive authority를 얻지 않는다.

## 13. Version pressure test

A-v1/M1/R1이 T1에, A-v2가 T2에 존재한다. M1/R1은 v1에 tied되고 v2는 follow-up candidate다. Old research는 retroactively mutate되지 않는다.

## 14. Typed factual-input pressure test

IssueAnalysis가 SourceAssertion A1, Witness Statement S2, Evidence Review PA3, procedural status P1을 사용할 때 네 type/provenance가 유지된다. 어느 것도 `AcceptedFacts`로 flatten되지 않는다.

## 15. Conditional branch pressure test

`If S1 accepted → R → C1`과 `If E3 analysis accepted → R → C2`가 coexist할 수 있다. Branch 생성은 S1/E3 truth mutation이 아니다.

## 16. Competing legal interpretation pressure test

동일 factual inputs의 X/Y interpretation candidates가 공존하고, lawyer가 X를 Argument로 선택할 수 있다. 선택은 correctness가 아니다.

## 17. IssueAnalysis vs Argument pressure test

IssueAnalysis가 X/Y의 strengths와 uncertainty를 기술하고 Argument가 X를 advocate한다. Advocacy 선택은 legal truth나 judge acceptance가 아니다.

## 18. CaseStrength pressure test

`CaseStrength=81`/`IssueWinChance=74%`가 sources, conflicts, assumptions, gaps를 대체하려 하면 invalid다. Local non-authoritative display가 있더라도 structured semantics가 source of truth다.

## 19. Direct/delegated pressure test

Player/direct와 associate/delegated가 question, domain, source/citation, extraction, RuleStatement, interpretation, IssueAnalysis, history/provenance를 공유한다. `Player structured / NPC 87% answer`는 invalid다.

## 20. Court boundary pressure test

LegalResearchWorkProduct, RuleStatement, IssueAnalysis, Argument는 direct CourtRecord, JII, ChoicePoint activation, CourtFactFinding 또는 outcome modifier가 아니다. Future explicit procedural/argument path만 court exposure를 허용할 수 있다.

## 21. Cross-case invariant matrix

| Invariant | Tested in | Result | Note |
|---|---:|---|---|
| Explicit Legal Research Task | 1–2 | PASS candidate | Question/domain required |
| Research ≠ Evidence Review | 1, 24–26 | PASS candidate | Legal source vs factual source work |
| Research ≠ Investigation | 1, 22–23 | PASS candidate | No source acquisition |
| Explicit Issue/question basis | 1–3, 6 | PASS candidate | No winning-law prompt |
| Bounded source domain | 4–6, 17 | PASS candidate | No all-law query |
| No hidden correct-law query | 3, 44–45, §5 | PASS candidate | Hidden model inaccessible |
| Source exists ≠ found | 7, §6 | PASS candidate | Miss valid |
| Found ≠ reviewed | 8, §6 | PASS candidate | Citation not reading |
| Reviewed ≠ correctly understood/applied | 9, 11, §7–8 | PASS candidate | Fallible work |
| LegalSource ≠ RecordedLegalExtraction | 9–11, §7–8 | PASS candidate | Source unchanged |
| RecordedLegalExtraction may be mistaken | 9, 11, §7 | PASS candidate | Error history |
| Mistaken extraction cannot rewrite source | 9, 11 | PASS candidate | Immutable source |
| RuleStatement ≠ LegalSource | 10–11, §8 | PASS candidate | Synthesis layer |
| RuleStatement ≠ governing law | 10–12, 46 | PASS candidate | Candidate only |
| Citation ≠ controlling authority | 8, 12–14 | PASS candidate | Context required |
| Authority count ≠ legal truth | 15–16 | PASS candidate | No voting |
| Conflicting authorities coexist | 15–16, 30 | PASS candidate | No auto-winner |
| Jurisdiction/version/time preserved | 13–14, 20 | PASS candidate | Limitations retained |
| Search no result ≠ authority absent | 17, §11 | PASS candidate | Bounded negative |
| Research may miss | 7, 18–19, §12 | PASS candidate | No oracle |
| Capability ≠ exhaustive/correct research | 18–19, 31 | PASS candidate | Component only |
| No universal ResearchScore | 18, 35, 38 | PASS candidate | Structured output |
| No hidden weighted sum | 18, 35, 38 | PASS candidate | No power formula |
| IssueAnalysis uses authorized Case File only | 24–27 | PASS candidate | Typed inputs |
| ActualStateRecord unavailable | 27, §5 | PASS candidate | No hidden facts |
| SourceAssertion remains assertion | 24, §14 | PASS candidate | No fact flattening |
| Statement remains Statement | 25, §14 | PASS candidate | Witness type retained |
| ProfessionalAnalysis remains analysis | 26 | PASS candidate | Analysis-on-analysis |
| Assumed fact ≠ accepted fact | 25, 28–29, 47 | PASS candidate | Conditional branch |
| Conditional analysis ≠ truth mutation | 28, 47, §15 | PASS candidate | If-clause preserved |
| Competing factual scenarios coexist | 29, 48, §15 | PASS candidate | No factual winner |
| Competing legal interpretations coexist | 15, 30, 48, §16 | PASS candidate | No legal winner |
| IssueAnalysis ≠ objective outcome | 31–32, 42–43 | PASS candidate | ProfessionalAnalysis |
| Conclusion ≠ judgment | 31–32 | PASS candidate | Candidate only |
| Argument ≠ correct law | 33–34 | PASS candidate | Advocacy choice |
| Specialist ≠ oracle | 18–19 | PASS candidate | Scope/fallibility |
| Direct/delegated same ontology | 36–38 | PASS candidate | No NPC percentage |
| History/version preserved | 20–21, 39–40 | PASS candidate | No overwrite |
| WorkProduct ≠ CourtRecord | 41, §20 | PASS candidate | Procedure gate |
| No direct JII | 42 | PASS candidate | Downstream path only |
| No direct CourtFactFinding | 43 | PASS candidate | No adjudication bypass |
| No hidden winning authority | 3, 44–45 | PASS candidate | No marker/count |
| No CaseStrength authority | 35 | PASS candidate | Typed structure |
| Explicit research gaps/follow-up | 17, 22–23 | PASS candidate | Bounded expansion |

## 22. Contradiction audit

| Check | Result | Note |
|---|---|---|
| DEC-023 internal contradictions | None observed | Source/rule/application/argument layers remain distinct |
| DEC-022 witness boundary | No violation | Statements remain typed inputs |
| DEC-021 Investigation boundary | No violation | Legal Research does not acquire sources |
| DEC-020 Evidence Review boundary | No violation | Factual review and legal research remain separate |
| DEC-019 Case File boundary | No violation | Assertions/analyses are not truth |
| DEC-018 Task/WorkProduct boundary | No violation | Explicit tasks and structured outputs |
| DEC-017 capability boundary | No violation | No universal score/oracle |
| DEC-013/014 court/JII boundaries | No violation | No direct judge/finding effect |
| Hidden legal model answer | Rejected | Cases 3, 44–45, §5 |
| LegalSource/extraction collapse | Rejected | Cases 9–11, §7–8 |
| Extraction/RuleStatement collapse | Rejected | Cases 9–11 |
| RuleStatement/governing-law collapse | Rejected | Cases 10–12, 46 |
| Found/applicable authority collapse | Rejected | Cases 12–14 |
| Authority count/legal truth | Rejected | Cases 15–16 |
| Jurisdiction/version ignored | Rejected | Cases 13–14, 20 |
| Search no-result/global absence | Rejected | Case 17 |
| Research skill/oracle | Rejected | Cases 18–19, 31, 35 |
| ActualStateRecord input | Rejected | Case 27 |
| Assertion/Statement/Analysis fact laundering | Rejected | Cases 24–26 |
| Conditional assumption/truth collapse | Rejected | Cases 28, 47 |
| Competing branch auto-resolution | Rejected | Cases 29–30, 48 |
| Conclusion/judgment collapse | Rejected | Cases 31–32 |
| Argument/correct-law collapse | Rejected | Cases 33–34 |
| CaseStrength authority | Rejected | Case 35 |
| Direct/delegated divergence | Rejected | Cases 36–38 |
| History overwrite | Rejected | Cases 20, 39–40, 46 |
| CourtRecord/JII/finding bypass | Rejected | Cases 41–43 |
| Hidden winning marker/count | Rejected | Cases 3, 44–45 |
| Tester invented substantive law | None | Law/hierarchy/doctrine remain TBD |

## 23. False-PASS audit

PASS 판정은 DEC-023 semantic boundary와 declared fixture inputs에만 근거한다. Substantive Korean law, hierarchy, binding/persuasive effect, jurisdiction rule, precedent rule, source availability, search algorithm, hidden interpretation, judge acceptance 또는 case outcome을 발명해 결과를 강제하지 않았다. Exact mechanics/probabilities는 NOT TESTED / TBD다.

## 24. False-PARTIAL audit

현재 core fixture의 semantic separation은 결정 가능하므로 PARTIAL 사유가 없다. Legal content, database, hierarchy, jurisdiction, search/probability, citation, UI, NPC AI, schema/Godot가 TBD인 것은 의도된 범위이며 PARTIAL 근거가 아니다. Hidden law model(Case 45), governing-law laundering(Case 46), conditional truth laundering(Case 47), branch collapse(Case 48)는 DEC-023 경계로 결정된다.

## 25. Remaining TBD / NOT TESTED

- Substantive legal content, Korean statutes/cases/doctrine and source taxonomy.
- Authority hierarchy, jurisdiction, precedent, binding/persuasive and temporal effect.
- Source database/access, query/search algorithms, miss/error probability and citation format.
- RecordedLegalExtraction implementation, source updating and duplicate handling.
- Capability mappings, Issue/IRAC taxonomy and Argument model.
- Research depth/completion, ResearchLead, conflict/synthesis and parallel coordination.
- Drafting, pleading, filing and judge legal-interpretation input mechanics.
- Player UI/minigames, NPC AI, save/schema/API/Godot, performance and balancing.

## 26. Risks / anti-patterns

| Risk | Failure condition | Why harmful | Mitigation direction |
|---|---|---|---|
| Google-for-answer | Query returns hidden correct law | Research becomes spoiler | Explicit question/source path |
| Hidden winning authority | UI marks decisive case | Answer-key leak | Candidate relevance only |
| Every query useful | No misses/no-result | Choices become cosmetic | Incomplete research valid |
| Skill guarantees law | Specialist always correct | Capability=oracle | Component/fallibility boundary |
| Majority decides law | Citation count selects rule | Context/hierarchy erased | Preserve conflicts |
| Old source ignored | New version rewrites old memo | History/time lost | Version/effective context |
| Jurisdiction ignored | Any authority governs | Fabricated doctrine | Context refs/TBD rules |
| RuleStatement treated as law | Memo synthesis becomes governing | Errors impossible | Separate layers |
| IssueAnalysis treated as outcome | Conclusion changes case | Adjudication bypass | ProfessionalAnalysis only |
| CaseStrength score | One number replaces structure | Facts/law/uncertainty collapse | Typed branches/gaps |
| Conditional fact laundering | If-clause sets fact true | Assumption disappears | Explicit conditional branch |
| Authority overload | All citations shown equally | Player cannot reason | Scope/filter/synthesis aids TBD |
| Legal realism overload | Doctrinal detail overwhelms play | Poor usability | Layered abstraction |
| Fabricated Korean doctrine | Generic rules imply real law | Accuracy risk | Leave content/procedure TBD |
| Delegated percentage engine | NPC returns correctness % | Semantic divergence | Shared ontology |
| Auto-winning Argument | Research writes guaranteed filing | Strategy collapses | Argument candidate only |
| Direct judge effect | Analysis modifies JII/finding | Litigation boundary bypass | Explicit procedural path |

## 27. Player-facing design principle

Player should see legal question, found/reviewed sources, recorded propositions, RuleStatements, conflicts, jurisdiction/version warnings, factual assumptions, application reasoning, alternative interpretations, research gaps and follow-up Tasks. Player should not see hidden correct interpretation, winning authority, guaranteed judge acceptance, objective CaseStrength, undiscovered decisive-case count or future outcome.

## 28. Solo → firm progression hook

```text
Solo → player researches core questions
Associate → delegated first-pass research
Specialist → domain-specific deeper research
Larger firm → parallel research branches and Issue ownership
Partner/player → selects strategic Issues, interpretations and Arguments
```

Supported architecture only; not mandatory progression or Korean-law claim.

## 29. Suggested TEST-022 status / no TEST-023

This document is the TEST-022 artifact and does not create TEST-023. Future testing should target the next accepted DEC without adding substantive law or hidden-model mechanics here.

## 30. DEC-024 candidates

| Candidate | Prerequisite fit | Risk |
|---|---|---|
| Case Theory & Evidence Synthesis | Combines factual scenarios, legal interpretations, Statements and evidence | May collapse branches into truth/CaseStrength |
| Drafting / Pleading / Filing | Converts selected Arguments into procedural artifacts | Needs synthesis/strategy boundary |
| Client Interaction | Extends source/assertion/advice exchange | Social/ethics dependency |
| Task Assignment / Workload / Team Coordination | Scales parallel research ownership | More Task families needed |
| Witness Preparation / Court Examination | Continues witness lifecycle toward court | Depends on testimony/procedure |

**Default recommendation:** `DEC-024 — Case Theory & Evidence Synthesis`, only if TEST-022 confirms factual/legal branches remain separate and no truth laundering occurs. Final order remains subject to design review.

## 31. Final verification summary

```text
Total core cases: 48
PASS: 48
PARTIAL: 0
FAIL: 0
```

PARTIAL cases: none  
FAIL cases: none

- DEC-023 reopen required: No semantic reopen indicated.
- Internal contradiction: None observed.
- Inherited boundary violation: None accepted.
- Hidden legal model leak: Rejected in Cases 3, 44–45.
- Hidden winning-authority leak: Rejected.
- LegalSource/RuleStatement collapse: Rejected.
- RuleStatement/governing-law collapse: Rejected in Case 46.
- Authority/applicability collapse: Rejected.
- Search-negative overreach: Rejected.
- Research oracle issue: Rejected.
- ActualStateRecord leakage: Rejected.
- Assertion/fact laundering: Rejected.
- Conditional truth laundering: Rejected in Case 47.
- Branch auto-collapse: Rejected in Case 48.
- Conclusion/judgment collapse: Rejected.
- Argument/correct-law collapse: Rejected.
- CaseStrength issue: Rejected.
- History overwrite: None accepted.
- CourtRecord bypass: Rejected.
- JII/finding bypass: Rejected.
- Issue blocking DEC-023 promotion: None at fixture-level.
- Issue blocking DEC-024: None at fixture-level.

## 32. Promotion recommendation

Fixture-level result에 semantic blocker가 없으므로 다음을 design-review에 권고한다.

```text
DEC-023 v0.1 → v0.2 Accepted
TEST-022 v0.1 → v0.2 Accepted / manual fixture-level verification
```

TEST 문서가 DEC 상태를 자동 변경하는 것은 아니다. Substantive law, hierarchy, search/probability, procedure와 implementation은 계속 TBD다.

## 33. Decision history

| Version | Status | Change |
|---|---|---|
| v0.1 | Proposed / manual fixture-level verification | DEC-023 LAW1–LAW35를 기준으로 48개 core fixture, hidden-law/extraction/rule/conditional-branch attacks, invariant/contradiction 및 false-pass/partial audits를 작성. |
