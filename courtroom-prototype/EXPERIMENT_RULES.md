# Courtroom Core v0.5 — 사건 전용 시연 규칙

이 규칙은 B동 창고 목격자 반대신문 실험만을 위한 authored data다. 실제 법률 판단이나 정식 THE FIRM 설계를 자동으로 변경하지 않는다.

## 기록

- 답변과 Proposition을 구분한다. 증언 기록은 객관적 진실 확정이 아니다.
- 같은 Proposition은 Evidence Record에 한 번만 기록한다.
- Argument Frame은 Evidence가 아니라 Advocacy Record에 남는다.
- 최종 평가는 Evidence Record, Advocacy Record, 현재 Theory ID만 읽는다. 선택 상태, 질문 수, Press 횟수, 렌더링 상태는 읽지 않는다.

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

다중 증인/plan, 플레이어 이의제기, 판사 관계·편향, 상대 CaseTheory AI, Closing/Verdict, 협상, 항소, 저장, 실제 민사 플레이, 복잡성 기반 난이도, 범용 법률 추론, Godot 통합.

## v0.5 절차: 사건 전용 규칙

실제 법률의 적법성·증거능력 기준이 아니라 이 실험에서 작성한 세 가지 개입 조건이다. 기존 신문 resolver의 반응 순위는 **질문이 허용되어 증인이 답할 때** 적용한다. 절차가 차단한 질문에는 적용하지 않는다.

- 반복: 기존 pressure signature가 repeated인 결론 질문. 앞서 명확히 인정한 결론은 항상 차단한다. 직전 관련 답변이 RESIST/EXPLAIN인 확인 질문만 tolerance=patient에서 허용하고 firm에서는 차단한다. 동일한 결과를 내는 근거 제시 버튼은 이 상황에서 생략한다.
- 근거 미확립: 주변 광원 질문이 전제하는 조명 제한이 아직 기록되지 않았을 때. 단순 유지는 차단한다. 최초 진술서의 어두웠다는 설명을 제시하면 진술과의 대조 질문으로 허용한다. 그 자료가 사실로 자동 인정되지는 않는다. 좁히면 조명 상태만 확인하며 원래의 주변 광원 질문을 완료하지 않는다.
- 질문 형식: limited Inference로 식별 결론을 요구할 때. 강한 근거의 첫 Press나 보강된 Press에 자동 이의하지 않는다. 유지는 판사의 쟁점 연결 설명 요청으로 이어진다. 근거 제시 또는 설명은 현재 Issue, 정확한 Inference ID, 선택 전제의 Evidence Record ID들을 연결해야 한다.

기본 판사는 standard / patient / broad다. proceduralStrictness=strict 또는 advocacyLatitude=narrow는 연결된 형식 이의에도 관찰 조건까지만 허용한다. 두 성향은 이 최소 모델에서 같은 제한 결과를 낼 수 있다. tolerance는 애매한 반복 확인에만 관여한다. 어떤 프로필도 누락된 근거의 단순 유지나 이미 인정된 결론 반복을 허용하지 않는다. 무작위 보정, 감정·친밀도 수치는 없다.

Narrow Press는 관찰 조건 확인만 남기며 식별 한계 Admission·새 Proposition·원래 Press/Frame·signature 이력을 만들지 않는다. 원래 결론을 얻을 기회를 포기하는 선택이다. Withdraw 역시 증인 답변 없이 절차 기록만 남긴다.

Pending question은 질문 ID, 기존 행동과 payload, 선택 전제·Inference를 고정한다. 이의/설명/답변 대기 중에는 전략 전환·전제 선택·새 질문·Frame·Stop을 잠근다. 새 질문, response, ruling, 제한·철회·instruction은 절차 기록에 연결된다. 판사 허용은 별도 service transaction이며 증거를 만들지 않는다. 이어지는 answer command만 기존 resolver를 실행한다. UI는 허용 후 answer를 즉시 호출하므로 사용자에게 추가 확인 클릭을 요구하지 않는다.

Sustained / Withdrawn / Limited / Overruled를 지원한다. Reformulated는 별도 상태 없이 Narrow→Limited로 표현한다. Procedural Record는 기록 평가의 증거·논증으로 집계하지 않는다. 실패한 명령은 전체 상태와 ID 할당을 보존한다.
