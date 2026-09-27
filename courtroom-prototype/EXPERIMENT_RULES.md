# Courtroom Core v0.6 — 사건 전용 시연 규칙

이 규칙은 B동 창고의 두 증인 반대신문 실험만을 위한 authored data다. 실제 법률 판단이나 정식 THE FIRM 설계를 자동으로 변경하지 않는다.

## 기록

- 답변과 Proposition을 구분한다. 증언 기록은 객관적 진실 확정이 아니다.
- 같은 Proposition은 Evidence Record에 한 번만 기록한다.
- Argument Frame은 Evidence가 아니라 Advocacy Record에 남는다.
- 최종 평가는 Evidence Record, Advocacy Record, 현재 Theory ID와 명시된 authored Plan 범위만 읽는다. 선택 상태, 질문 수, Press 횟수, 렌더링 상태는 읽지 않는다.

## Inference Variant

`PLAN_IDENTIFICATION`의 유효한 Proposition 조합은 정확히 하나의 authored variant에 대응한다. 각 variant는 고유한 제목, 문장, 강도(`limited`, `strong`, `compelling`)를 가진다. Frame record에는 inference ID와 정확한 premise 집합을 함께 보존한다. 평가 시 둘이 맞지 않으면 유효한 Frame으로 인정하지 않는다.

- 두 전제 조합은 내용에 따라 limited 또는 strong이다.
- 세 전제 조합은 이 사건에서 strong이다.
- 거리·조명·관찰 시간·최초 불확실을 모두 연결한 조합은 compelling이다.
- 이는 범용 개수 점수가 아니라 `case.js`에 작성된 11개 정확한 조합의 결과다.

## 정보 탐색

- 거리, 조명, 관찰 시간, 최초 진술은 현재 사건에서 defense에 유리한 탐색이다.
- 주변 광원 질문은 `mixed`다. 주변이 어두웠다는 사실과 얼굴을 비춘 간판 불빛을 함께 기록한다.
- `informationType`은 내부 작성 메타데이터다. UI는 질문에 “위험”이라는 정답 라벨을 붙이지 않는다.
- 이미 응답이 만들 모든 Proposition이 기록된 질문은 다시 사용할 수 없다.

## Stop / Frame / Press

- Stop: 현재 기록을 보존하고 신문을 끝낸다. 보너스나 자동 논증은 없다.
- Frame: 현재 선택 조합의 authored Inference를 Advocacy Record에 남긴다. 강도는 조합에서 나오며 증인의 인정이 아니다.
- Press: 현재 Inference의 전제를 근거로 증인의 결론을 공격한다. 성공 시 Admission, 실패 시 Resist/Explain/Counter가 가능하다.
- Frame과 Press는 함께 사용할 수 있다. 각각의 기록 성격은 유지된다.

## Press signature

서명은 plan + witness + 정렬된 premise ID 집합이다. 같은 집합, 순서 변경, 이전 집합의 부분집합은 repeated다. 이전 집합의 엄격한 상위집합은 reinforced다. 새 Proposition을 확보만 하고 선택하지 않으면 reinforced가 아니다.

반응 우선순위:

1. repeated: 친분 설명, 이미 기록됐으면 Resist.
2. 최초 불확실 + observation 2개 이상: 식별 한계 Admission.
3. 조명 제한이 있고 최초 불확실과 간판 불빛이 아직 없을 때: 간판 불빛 Explain.
4. 그 밖: Resist.

## Counter Proposition

- `P_FAMILIARITY`는 contestable이다. 최초 불확실 기록으로 의미를 제한할 수 있다. 원 기록은 삭제하지 않으며 qualification이 두 record ID를 연결한다.
- `P_SIGN_LIGHT`는 hard다. 현재 준비된 자료로 즉시 제한할 수 없다. UI는 현장 사진이나 조도 자료가 더 필요하다고 표시한다.
- Hard Counter에 가짜 정답 버튼을 만들지 않는다. active counter는 최종 결과를 `CONFLICTING`으로 만든다.

## 판정

우선순위는 다음과 같다.

1. 직접 식별 한계 Admission + active counter 없음 → `WITNESS_ADMISSION`
2. active counter 있음 → `CONFLICTING`
3. compelling Frame → `COMPELLING_ARGUMENT`
4. strong Frame → `WEAKENED`
5. limited Frame → `LIMITED_ARGUMENT`
6. observation 2개 이상 또는 최초 불확실만 기록 → `DOUBT_RECORDED`
7. 그 밖 → `INSUFFICIENT`

## CaseTheory와 Commitment

같은 식별 Inference는 Theory A에서 core, Theory B에서 peripheral이다. Theory B의 Intent는 이 신문만으로 해결되지 않는다. 질문과 증언 반응을 Theory별로 인위적으로 잠그지 않는다.

Argument Frame과 Press record는 하위 advocacy다. CaseTheory 수준의 Major Commitment와 분리한다. Major Commitment의 유일한 저장 위치는 `records.advocacy`의 `kind: major_commitment`다. 평가기와 UI가 이 기록만 읽는다. 별도 `state.majorCommitments`는 없으며, 이 slice에서는 새 Major Commitment 행동을 만들지 않는다.

## 미구현

세 번째 증인/다중 plan, 플레이어 이의제기, 판사 관계·편향, 상대 CaseTheory AI, Closing/Verdict, 협상, 항소, 저장, 실제 민사 플레이, 복잡성 기반 난이도, 범용 법률 추론, Godot 통합.

## v0.5 절차: 사건 전용 규칙

실제 법률의 적법성·증거능력 기준이 아니라 이 실험에서 작성한 세 가지 개입 조건이다. 기존 신문 resolver의 반응 순위는 **질문이 허용되어 증인이 답할 때** 적용한다. 절차가 차단한 질문에는 적용하지 않는다.

- 반복: 기존 pressure signature가 repeated인 결론 질문. 앞서 명확히 인정한 결론은 항상 차단한다. 직전 관련 답변이 RESIST/EXPLAIN인 확인 질문만 tolerance=patient에서 허용하고 firm에서는 차단한다. 동일한 결과를 내는 근거 제시 버튼은 이 상황에서 생략한다.
- 근거 미확립: 주변 광원 질문이 전제하는 조명 제한이 아직 기록되지 않았을 때. 단순 유지는 차단한다. 최초 진술서의 어두웠다는 설명을 제시하면 진술과의 대조 질문으로 허용한다. 그 자료가 사실로 자동 인정되지는 않는다. 좁히면 조명 상태만 확인하며 원래의 주변 광원 질문을 완료하지 않는다.
- 질문 형식: limited Inference로 식별 결론을 요구할 때. 강한 근거의 첫 Press나 보강된 Press에 자동 이의하지 않는다. 유지는 판사의 쟁점 연결 설명 요청으로 이어진다. 근거 제시 또는 설명은 현재 Issue, 정확한 Inference ID, 선택 전제의 Evidence Record ID들을 연결해야 한다.

기본 판사는 standard / patient / broad다. proceduralStrictness=strict 또는 advocacyLatitude=narrow는 연결된 형식 이의에도 관찰 조건까지만 허용한다. 두 성향은 이 최소 모델에서 같은 제한 결과를 낼 수 있다. tolerance는 애매한 반복 확인에만 관여한다. 어떤 프로필도 누락된 근거의 단순 유지나 이미 인정된 결론 반복을 허용하지 않는다. 무작위 보정, 감정·친밀도 수치는 없다.

Narrow Press는 관찰 조건 확인만 남기며 식별 한계 Admission·새 Proposition·원래 Press/Frame·signature 이력을 만들지 않는다. 원래 결론을 얻을 기회를 포기하는 선택이다. Withdraw 역시 증인 답변 없이 절차 기록만 남긴다.

Pending question은 질문 ID, 기존 행동과 payload, 선택 전제·Inference를 고정한다. 이의/설명/답변 대기 중에는 전략 전환·전제 선택·새 질문·Frame·Stop을 잠근다. 새 질문, response, ruling, 제한·철회·instruction은 절차 기록에 연결된다. 판사 허용은 별도 service transaction이며 증거를 만들지 않는다. 이어지는 answer command만 기존 resolver를 실행한다. UI는 허용 후 answer를 즉시 호출하므로 사용자에게 추가 확인 클릭을 요구하지 않는다.

Sustained / Withdrawn / Limited / Overruled를 지원한다. Reformulated는 별도 상태 없이 Narrow→Limited로 표현한다. Procedural Record는 기록 평가의 증거·논증으로 집계하지 않는다. 실패한 명령은 전체 상태와 ID 할당을 보존한다.

## v0.6: 두 증인, 같은 법정 문법

증인은 서지훈(목격자)과 한서윤(감식 담당 수사관) 두 명이다. 각 Witness는 하나의 Argument Plan, 사건 자료, 질문 Thread를 참조한다. 질문/Counter route는 witnessId, Proposition은 planId로 소유 범위를 명시한다. 이는 한 사건의 두 패턴을 격리하는 최소 범위 지정이며 다중 사건/종합 판결 시스템이 아니다.

한서윤에게 처음 진입하면 작성된 검찰 주신문 답변 `R_FORENSIC_DIRECT`를 한 번 기록한다. 지문 검출과 피해자 혈액은 `examination: direct`, 실제 witnessId, source witness ID를 보존한다. 이후 반대신문으로 시간적 한계와 공용 사용·이전 사용 기회를 확립한다. 검출 사실 자체를 지우거나 범행 시점을 자동 추정하지 않는다.

감식 논증 역시 exact-premise Inference 11개, 기존 responseRules matcher, Frame, Press signature를 사용한다. 시점+공용은 limited, 시점+이전 기회는 strong, 시점+공용+이전 기회는 compelling이다. 감식 범위까지 포함한 다른 조합도 각각 문장을 작성했다. 시점+이전 기회에 공용 또는 해석 범위를 함께 선택한 Press는 범행 당시 사용 연결의 한계 인정을 얻는다. 나머지는 한계를 설명하거나 반복 답변을 한다. 이는 사건 전용 authored response다.

평가는 `evaluateRecord(definition, records, theoryId, planId)`로 범위를 명시한다. 일시적인 lane 선택/질문 수/절차 성공은 평가에 쓰지 않는다. 다른 증인의 concession/counter가 현재 논점의 결론으로 섞이지 않는다. Theory A에서는 식별과 범행 당시 사용이 core, Theory B에서는 두 논증 모두 peripheral이다. 두 신문을 합친 유무죄/고의 판단은 없다.

### Thread와 종료

관찰 조건 / 진술 변화, 감식 한계 / 접촉 경위를 자유롭게 오갈 수 있다. Thread 순서는 필수 조건이 아니며 답한 질문을 다 소진할 필요가 없다. `thread`는 현재 방향을 정하고 `endThread`는 그 방향과 follow-up을 접는다. CourtRecord는 변하지 않는다. `stop`은 현재 증인 신문을 닫는다. 다른 증인으로 이동해도 기존 기록과 Press history는 보존하고, 닫힌 신문은 열람만 가능하다.

조명 답변 후의 `G_LIGHT_SOURCE`는 선택적 follow-up이다. 멈추거나 다른 Thread로 가면 간판 불빛 기록이 생기지 않는다. 더 물으면 조명 제한과 불리한 간판 불빛이 남는다. 이 판단을 모든 질문 뒤에 강요하지 않는다.

### 한 장면의 선택 근거

`INF_PRINT_TIME_SHARED`로 결론을 요구하여 형식 이의가 생긴 장면 하나에서 1~2개 근거를 선택한다. 후보는 감식 보고서, 공용 비품 기록, 확보한 지문 시점 불명 Record, 이전 사용 진술이다. 없는 증언 Record는 후보가 되지 않는다.

후보의 authored coverage 중 `analysis`가 있으면 분석의 한계를 묻는 원 질문을 정당화한다. 단순 `access` 근거만 있으면 감식 결론의 범위를 설명하지 못하므로 제한 질문으로 바뀐다. 자동 정답 선택은 없고, 선택한 typed refs만 response record에 저장한다. 보고서/기록 자체가 증인 답변 대신 새로운 Evidence를 생성하지 않는다. 기본 프로필은 연결된 질문을 허용하고, strict fixture는 같은 근거도 좁혀 허용한다. 이 mapping은 게임 실험용이며 일반 증거능력/법률 기준이 아니다.

기존 한 후보 질문은 자동 연결한다. 기존 고정 전제 연결은 필수 ref set을 그대로 확인하며 매번 선택기를 만들지 않는다. 반복 확인은 그대로 요청/좁히기/철회, 선택 근거 장면은 근거 연결/좁히기/철회로 중복 대응을 줄인다.

### 표현

기본은 기록 요약, 논점 구성 중에만 해당 법정 기록의 호환 사실을 선택 버튼으로 바꾼다. 중앙에는 선택한 근거와 Inference를 보여준다. 모바일은 기존 기록 sheet를 재사용한다. 질문과 답변은 증인별로 연결한다. 절차 저장 구조는 평평한 event 배열 그대로이며 UI만 questionId별 transaction 하나로 접는다.

범용성의 남은 한계: 현재는 증인당 Plan 하나, Proposition 소유 Plan 하나다. 여러 Plan이 동일 Proposition을 공유하거나 여러 증언을 종합 평가하는 것은 다음 설계 결정이 필요하다. 이 버전에서 미리 추상화하지 않았다. v0.5의 '다중 증인 미구현' 범위는 정확히 두 명까지 이번 요청으로 해제되었다.

## v0.65 — authored tactical extension

This section supersedes earlier descriptions of one fixed UI Press question and duplicate form responses. Existing no-claim service calls retain the v0.6 resolver for compatibility fixtures; the shipped UI always chooses a claim variant.

- `responses[].commitments` names explicit admitted propositions also present in `adds`. Service evidence records carry `commitment`, with the speaker and response provenance. Later relations use runtime record refs and one of qualification/clarification/contradiction/retreat. Original records are immutable; contradiction/retreat release that commitment from later route matching. These meanings are authored, not inferred from natural language.
- `goals[].responseRoutes` and `argumentPlans[].claimVariants[].routes` use the same recorded-commitment/tag matcher. The prior-use opportunity proposition is distinct from the inability to exclude earlier contact. Asking prior use after timing establishes both; asking it earlier only establishes opportunity. A later explicit possibility claim can obtain the missing lock.
- Claim variants are actual questions, not strength levels. Explicit claims can be asked with no selected premises. Frame still requires an exact authored inference. Different claim IDs are different questions; repetitions and reinforced supersets keep the original canonical basis signature within one claim. Procedure checks the same claim when finding its preceding answer.
- The broad variant uses existing form handling when the selected inference is limited. With no inference it can open a narrative response directly. The forensic pair still exposes multi-basis selection. Default form actions are basis/narrow/withdraw. An `address` content fixture retains maintain → Court Address as the sole substantive route, without exposing both equivalent routes together.
- Both witnesses have narrow confirmation, intermediate limitation, bounded concession, excessive negation, and premature narrative responses. An existing narrative changes a later bounded concession to a qualified explanation. No numeric risk or question-order score exists.
- Support effects and rehabilitation opportunities live on evidence records. Replay derives current support states and refs. They do not start Redirect and do not alter fingerprint identity/blood findings. Premature narrative and overreach counters are hard within this bounded slice; no fabricated immediate rebuttal is supplied.
- Duplicate proposition testimony is grouped only for display. Selection is a sibling of disclosure. No commitment badge or permanent argument map. UI has a bundled Pretendard and optional installed Noto Serif KR/Batang fallback for spoken statements only.

No formal game rule, actual evidentiary admissibility standard, scientific fingerprint-dating model, automatic judgment or general-purpose witness AI is added. Further recovery from narrative hard counters, Redirect and whole-case valuation remain TBD/out of scope.

## v0.10 — Adversarial Trial experiment (trial.html)

기존 신문 엔진과 분리된 실험이다. 기존 규칙(위 절들)은 index.html 법정에만 적용되며 변경하지 않았다.

### 판세 모델
- 쟁점 2개(공격자 동일성, 범행 당시 칼 사용). 각 쟁점은 authored 기준값에서 시작하고 기록의 effects가 더하거나 뺀다(검찰 쪽 +, 변호인 쪽 −).
- 밴드: 5 이상 입증 방향, 3–4 의문 제기, 2 이하 합리적 의심. UI는 밴드별 재판장 메모 문장과 개별 메모만 표시하고 숫자는 표시하지 않는다.
- 판결: all_required. 필수 쟁점 중 하나라도 합리적 의심이면 무죄.

### 준비
- 예산 4(반나절). 조사 비용 1–2. 조사는 즉시 기록되고 되돌릴 수 없다. 카드와 검찰 증거 공개는 조사 기록에서만 생긴다.

### 개회사
- 주력 쟁점이 증인별 반대신문 시간을 정한다(4/2, 3/3, 2/4).
- 칼 입장: 인정 + 이전 사용 카드 → 이전 사용 접근 효과 최대. 인정인데 카드 없음 → 검사가 "변호인도 사용을 인정" 공격. 언급 안 함 → 중간 효과. 부인 → 지문 증언 때 모순 공격(신뢰 −1)과 이전 사용 접근 시 입장 번복 기록.

### 법정
- 이의 창: 정당한 이의는 인용되어 검찰 효과를 줄인다. 부당한 이의는 기각되어 신뢰 −1과 검찰 효과.
- 접근법은 요구 카드 중 하나라도 있어야 쓸 수 있다(카드 없이 가능한 접근도 있음). 각 접근·결론 요구는 시간 1.
- 한정 결론: 서지훈은 서로 다른 의문점 3개 이상, 한서윤은 시점 + (공용 또는 이전 사용). 미충족 시 증인이 반박하고 검찰 효과.
- 과한 결론: 항상 역효과와 신뢰 −1.
- 재판장 신뢰 1 이하로 반대신문을 시작하면 시간 −1과 경고.
- 재주신문: 조건을 만족한 수습만 실행한다. 최초 진술 대조는 "6년 친분" 수습을 무력화한다. 조도 측정 카드가 있으면 간판 불빛 수습 후 재반대 기회가 생긴다.

### 복기
- 유효했던 것: 변호인 기록 중 검찰 효과를 줄인 것, 인용된 이의.
- 역효과: 기각된 이의, 실패한 결론 요구, 과욕, 개회사 모순.
- 놓친 준비: 실행된 수습/공격에 대응 카드가 없었던 경우, 입증 방향으로 끝난 쟁점에 필요한 카드가 없던 경우, 준비한 반박을 쓰지 않은 경우.

이 수치와 조건은 플레이테스트용 authored 규칙이며 실제 법률 기준이나 Accepted 설계가 아니다.
