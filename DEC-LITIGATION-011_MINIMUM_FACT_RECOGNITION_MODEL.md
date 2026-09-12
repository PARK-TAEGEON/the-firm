# THE FIRM — 최소 사실인정 모델

문서 ID: DEC-LITIGATION-011
버전: v0.1 — 초안
상태: **Proposed / 기획자 채택 필요**
상위 기준: [00_GAME_CONSTITUTION.md](00_GAME_CONSTITUTION.md) v0.2, [01_SYSTEM_MAP.md](01_SYSTEM_MAP.md) v0.2
시스템 기준: [SYS-001_LITIGATION.md](SYS-001_LITIGATION.md) v0.2
직접 결정 기준: [DEC-LITIGATION-007_JUDGE_ACCEPTANCE.md](DEC-LITIGATION-007_JUDGE_ACCEPTANCE.md), [DEC-LITIGATION-008_FINAL_ADJUDICATION.md](DEC-LITIGATION-008_FINAL_ADJUDICATION.md), [DEC-LITIGATION-009_PROCEDURAL_FLOW.md](DEC-LITIGATION-009_PROCEDURAL_FLOW.md), [DEC-LITIGATION-010_APPEAL_AND_COURT_LEVELS.md](DEC-LITIGATION-010_APPEAL_AND_COURT_LEVELS.md) — 각 v0.2 Accepted 범위
검증 근거: [TEST-006_JUDGE_ACCEPTANCE.md](TEST-006_JUDGE_ACCEPTANCE.md), [TEST-007_FINAL_ADJUDICATION.md](TEST-007_FINAL_ADJUDICATION.md), [TEST-008_MULTI_HEARING_CASE.md](TEST-008_MULTI_HEARING_CASE.md), [TEST-009_APPEAL_AND_REMAND.md](TEST-009_APPEAL_AND_REMAND.md)

## 1. 목적과 결정 경계

제출되고 현재 판단에 사용할 수 있는 evidence / record를 바탕으로 법원이 특정 사실명제를 어느 범위에서 인정하는지, 현 기록으로 인정하지 못하는지, 또는 별도의 반대명제까지 인정하는지를 구별하는 최소 구조를 제안한다.

이 문서는 DEC-007의 `자료 내용·신빙성 → 사실 인정·충분성` 사이에 남아 있던 구조적 공백을 좁힌다. 사실인정 결과를 청구 효과로 연결하는 DEC-008의 입증 부담·최종 판정은 변경하지 않는다. 절차상 증거 사용 가능성, 상급심의 새 증거 허용, 손해액, 판사 성향, 판례 효력도 결정하지 않는다.

이번 v0.1은 **채택 전 초안**이다. 아래 F1~F10은 기존 Accepted 결정에서 강제되는 부분을 정리한 **채택 후보**이지, 문서 작성만으로 Accepted된 규칙이 아니다. 실제 대한민국 법률의 일반 규칙이나 사실인정 기준을 새로 선언하지 않는다. 기준이 필요한데 기존 문서나 테스트 콘텐츠에 없으면 `[상세 사실인정 기준 미정]`으로 중단한다.

## 2. 기존 Accepted 결정에서 그대로 이어지는 제약

다음은 이번 초안의 새 선택지가 아니라 이미 Accepted된 범위다.

| 기존 결정 | DEC-011이 보존해야 하는 제약 |
|---|---|
| DEC-007 J0~J3 | 제출 입력, 자료 내용·신빙성, 사실 충분성, 법률 적용을 한 값으로 합산하지 않는다 |
| DEC-007 J1·J7 | 판사는 실제 제출·전달되어 판단 대상으로 사용할 수 있는 내용만 본다. 숨은 AP·내부 전략·자기 평가를 읽지 않는다 |
| DEC-007 J2 | 사실 미인정은 반대 사실 인정이 아니다. 조건부 법적 관계 수용도 사실 전제 충족이 아니다 |
| DEC-007 J3 | 신빙성과 충분성을 구별한다. 증거 개수·직함·등급의 단순 합산을 사용하지 않는다 |
| DEC-007 J9 | 실제 판단 입력·범위·이유를 기록하고 디버그 정보와 플레이어 공개 범위를 구별한다 |
| DEC-008 A1~A4 | 사실 부족의 불이익은 명시된 입증 부담·법적 효과가 있을 때만 최종 결론에 연결한다. 기준 부재를 당사자 실패로 바꾸지 않는다 |
| DEC-008 A6~A7 | 공통 사실은 여러 청구가 일관되게 참조할 수 있으나 효력이 복제되지 않는다. 실제 중간 판단에서 최종 이유까지 원인 연결을 보존한다 |
| DEC-009 P4·P6 | 제출·판단 이력을 덮어쓰지 않고 관련 범위만 재검토한다. 절차 종결과 judgment-ready를 구별한다 |
| DEC-010 A4·A6·A11 | 역사 보존과 상급심 사용 허용은 다르다. 원심 판단·이유를 보존하고 허용된 공격·환송 범위만 재검토한다 |

## 3. F1 — actual truth와 court-recognized fact의 분리

| 후보 | 구조 | 위험·적합성 |
|---|---|---|
| A. 하나의 `fact = true/false`를 세계와 법원이 공유 | 단순 | 판사가 미제출 정보와 사건 정답을 읽는 전지적 모델이 됨 |
| B. 실제 진실 없이 법원 판단만 저장 | 정보 누출은 줄어듦 | 세계 사건의 실제 발생·자료 생성·향후 발견과 법원 판단의 차이를 표현하기 어려움 |
| C. 사건 실제 상태와 심급별 사실인정 기록을 별도 저장소·입력 경계로 분리 | 실제 발생과 법적 판단의 불일치, 오판·미입증·후속 발견을 기록 가능 | 접근 통제와 테스트가 필요 |

**F1-C를 채택 후보로 제안한다.**

- `ActualStateRecord`는 사건 세계에서 실제로 발생하거나 발생하지 않은 내용을 위한 별도 데이터다. 모든 사실명제에 전지적 참/거짓을 강제로 작성할 필요는 없으며, 콘텐츠가 실제 상태를 정하지 않은 부분은 `unspecified`로 남길 수 있다.
- `FactProposition`은 법원이 판단할 수 있는 명시적 문장과 범위다. 같은 사건 실제 상태에서 여러 구체·부분·경쟁 명제가 존재할 수 있다.
- `CourtFactFinding`은 특정 Court Stage가 특정 Record Snapshot으로 그 명제를 어떻게 판단했는지 기록한다.
- 사실인정 처리에는 `ActualStateRecord`를 전달하지 않는다. actual truth는 자료 발생·게임 세계 일관성·허용된 디버그 대조에는 쓰일 수 있지만, 판사의 판단 이유나 플레이어용 판결 설명에 역류하지 않는다.
- ActualStateRecord는 세계에서 일어난 사건을 보존하는 데이터이지 사실인정의 정확도·확신을 나타내는 `truth meter`가 아니다. 이 값을 수치화해 court finding과의 거리를 계산하지 않는다.
- 실제 진실과 법원 인정이 일치하는지는 별도의 사후 검증 질문일 수 있다. 일치 여부 자체를 판사 정확도 점수나 승률 보너스로 만들지 않는다.

## 4. F2 — 미인정과 반대사실 인정의 구별

### 4.1 정규 사실명제 상태

DEC-007의 네 수용 상태를 사실 층에서 다음처럼 구체화하는 후보를 제안한다. 이는 기존 상태를 대체하는 새 전 사건 판정 목록이 아니다.

| 사실 층의 기록 | DEC-007과의 관계 | 의미 |
|---|---|---|
| `recognized` | 수용 | 특정 사실명제를 명시한 범위에서 인정 |
| `recognized_limited` | 한정 수용 | 명제 전체가 아니라 명시한 부분·기간·대상·범위만 인정 |
| `not_established_on_record` | 현 근거로 배척의 사실명제 적용 | 현재 사용할 수 있는 기록과 적용 기준으로 그 명제를 인정하지 못함. 명제의 부정은 확정하지 않음 |
| `undetermined` | 판단 유보 | 절차 기회가 남았거나, 충돌이 미해결이거나, 필요한 설계 기준이 없어 판단을 닫지 못함 |

`not_established_on_record`와 `undetermined`는 모두 플레이어 언어로 넓게는 “인정하지 못함”일 수 있지만 원인이 다르다. 전자는 사용할 기준이 존재하고 현 기록이 그 기준을 충족하지 못한 경우에만 사용할 수 있다. 기준 자체가 없으면 반드시 `undetermined`와 `[상세 사실인정 기준 미정]`을 사용한다.

### 4.2 반대사실 인정

**`contrary_recognized`를 명제 자체의 독립 상태로 저장하지 않는 후보를 제안한다.** 다음 세 조건이 모두 충족될 때만 비교 결과 또는 설명으로 도출한다.

1. 반대 내용을 가진 별도의 `FactProposition`이 존재한다.
2. 콘텐츠 또는 Accepted 관계가 두 명제를 해당 범위에서 양립 불가능하다고 명시한다.
3. 그 반대명제가 자기 근거와 이유로 `recognized` 또는 해당 범위의 `recognized_limited` 상태다.

따라서 `P = not_established_on_record`만으로 `not-P = recognized`를 만들지 않는다. `P`와 `Q`가 긴장 관계일 뿐 논리적으로 양립 가능한 경우에도 반대사실 인정으로 표시하지 않는다. 명제의 부정·배타·부분 중첩 관계가 정의되지 않았다면 `[사실명제 관계 미정]`으로 남긴다.

## 5. F3 — 동일 evidence의 여러 사용과 중복 strength 방지

| 후보 | 구조 | 위험·적합성 |
|---|---|---|
| A. EvidenceUse마다 강도를 새로 더함 | 계산 단순 | 같은 문서의 복사·재인용·다중 청구 연결로 강도 파밍 |
| B. 한 evidence는 사건 전체에서 한 fact에만 사용 | 중복 합산 차단 | 하나의 이메일이 시점과 통지 사실을 함께 뒷받침하는 정당한 다중 사용을 막음 |
| C. 근원 evidence는 한 번 식별하고 fact별 사용 관계만 여러 개 연결 | 다중 관련성을 허용하면서 복제 가산을 차단 | 근원 동일성과 독립 출처 판별 경계가 필요 |

**F3-C를 채택 후보로 제안한다.**

- 사건의 실제 자료에는 영구 `evidence_id`와 근원 계보를 나타내는 `source_lineage_id`를 둔다.
- 제출 사본, 인용, 발췌, 번역, 전문가가 같은 자료를 다시 언급한 부분은 원자료와의 `derived_from` 관계를 보존한다. 단순 복제는 독립 corroboration이 아니다.
- 한 evidence는 서로 다른 FactProposition에 각각 관련될 수 있다. 각 `EvidenceUse`는 해당 사실에 어떤 내용 범위가 `supports / undermines / limits / contextualizes` 역할을 하는지 기록한다.
- 같은 `source_lineage_id + content_scope`의 기여는 한 FactProposition 평가 안에서 개수만큼 반복 가산하지 않는다.
- 다른 FactProposition으로 연결됐다고 원자료가 “소비”되거나 강도가 나뉘지도 않는다. 각 사실에서 관련 범위와 한계를 별도로 평가한다.
- 독립 출처인지, 같은 소문의 반복인지, 전문가의 독립 분석이 새 근거인지의 판별 기준은 사건 콘텐츠 또는 후속 결정이 제공해야 한다. 기준이 없으면 독립 강화로 처리하지 않는다.

이 구조는 strength 숫자를 제안하지 않는다. 중복 방지는 같은 기여의 식별과 계보 보존으로 수행한다.

## 6. F4 — credibility와 sufficiency의 분리

**F4의 채택 후보는 평가 대상과 질문을 분리하는 것이다.**

| 구분 | 붙는 대상 | 묻는 질문 | 자동으로 따라오지 않는 결론 |
|---|---|---|---|
| credibility | evidence 안의 특정 진술·내용 범위와 해당 심급 평가 | 이 진술을 이 범위에서 믿을 근거와 한계는 무엇인가? | 믿을 만하므로 관련 사실 전체가 충분히 입증됨 |
| sufficiency | FactProposition과 현재 Record Snapshot 전체 | 사용할 수 있는 근거들을 함께 보아 이 명제를 어느 범위까지 인정할 수 있는가? | 근거 개수가 많거나 모두 credible이면 자동 인정 |

신빙성 기록은 전 자료에 붙는 영구 등급이 아니라 `내용 범위 + 판단 단계 + 이유`에 연결한다. 같은 증인이 직접 본 시점에 대해서는 신빙성이 인정되어도 가치 규모에 관한 추정까지 같은 평가를 복사하지 않는다.

최소 상태 후보는 `not_assessed / accepted_for_scope / limited_for_scope / disputed / not_accepted_for_scope`다. 이 값은 왜 그 진술 범위를 사실 판단에 의존했거나 의존하지 않았는지 기록하는 정성 상태이며, evidence admissibility나 숫자 가중치가 아니다. `not_accepted_for_scope`도 그 진술 내용의 반대가 참이라는 뜻은 아니다.

충분성은 관련 EvidenceUse, 신빙성 평가, 미해결 충돌, 빠진 범위와 적용한 `recognition_criterion_ref`를 함께 참조한다. 이를 평균·합계·숨은 확률로 환산하지 않는다. 신빙성 높은 하나의 자료도 명제의 필요한 범위를 말하지 않으면 부족할 수 있고, 여러 자료가 있어도 같은 근원의 반복이면 공백을 메우지 못할 수 있다.

어떤 신빙성 사유가 허용되는지, 어떤 사실에 어느 정도 근거가 충분한지, 입증 기준의 내용은 이번 문서에서 만들지 않는다. 테스트에서는 명시적 가상 criterion을 주입하고 실제 법률 일반 규칙으로 확대하지 않는다.

## 7. F5 — conflicting evidence 기록

**F5 채택 후보는 충돌을 증거 삭제나 점수 상쇄가 아닌 명시적 `EvidenceConflict`로 보존하는 것이다.**

최소 의미 정보는 다음과 같다.

- 충돌 ID와 대상 FactProposition 또는 양립 불가능한 명제 관계.
- 충돌하는 EvidenceUse들의 ID와 정확히 충돌하는 내용 범위.
- `direct_conflict / scope_difference / qualification / source_dependency`처럼 콘텐츠가 명시한 관계. 자동 자연어 추론으로 관계를 발명하지 않는다.
- 각 진술의 별도 credibility 평가와 한계.
- `unresolved / resolved_for_scope / remains_after_limited_finding`의 처리 상태와 실제 이유.
- 해결이 영향을 미친 FactFinding과 영향을 주지 않은 범위.

충돌 자료는 한쪽을 선택했다고 역사에서 삭제하지 않는다. `unresolved`는 자동 절반 인정도 양쪽 배척도 아니다. 한쪽의 일부 범위만 받아들일 수 있으며, 그 경우 인정 범위와 남은 충돌을 함께 기록한다. 해결 기준이 없으면 `[상세 사실인정 기준 미정]`으로 중단한다.

## 8. F6 — submitted / allowed record 경계와의 연결

**F6 채택 후보는 각 사실인정이 하나의 `CourtRecordSnapshot`을 필수 입력으로 참조하게 하는 것이다.**

```text
사건에 존재하는 evidence
  → 당사자가 보유·인지
    → Submission에 실제 포함
      → 법원이 실제 수신
        → 해당 단계·목적에 사용 가능하다고 외부 절차가 표시
          → CourtRecordSnapshot
            → EvidenceUse
              → CourtFactFinding
```

- 사실인정 모듈은 `submitted`, `received`, `allowed_for_fact_finding` 및 허용 범위가 확정된 RecordEntry만 소비한다.
- `allowed_for_fact_finding`은 이 문서가 판정하지 않는다. 증거능력·절차적 사용 가능성은 외부 결정 또는 테스트의 명시적 주입값이다.
- 제출되었지만 아직 수신되지 않은 자료, 수신됐지만 해당 목적 사용이 허용되지 않은 부분, 내부 WorkProduct, actual truth는 snapshot에 들어가지 않는다.
- 같은 자료라도 허용된 발췌 범위만 EvidenceUse로 연결한다. 판사는 숨은 전문이나 원자료의 미제출 부분을 복원하지 않는다.
- Record Snapshot은 판단 당시 입력을 재현할 수 있도록 ID와 cutoff / stage를 보존한다. 이후 새 자료가 들어와도 과거 snapshot과 finding을 덮어쓰지 않는다.

## 9. F7 — appeal / supreme / remand의 원심 사실인정 보존

**F7 채택 후보는 사실인정을 append-only 단계 버전으로 저장하고, 후속 심급의 현재 취급을 별도 연결로 표현하는 것이다.**

| 상황 | 보존·처리 후보 |
|---|---|
| 항소 시작 | 원심 FactFinding·Record Snapshot·이유를 그대로 보존. 상급심 전달·사용 허용 범위를 별도 기록 |
| 허용 범위 밖 사실 | 원심 이력과 당시 적용 범위를 유지. 곧바로 영원한 확정 사실이라고 선언하지 않음 |
| 허용된 사실 공격 | `prior_finding_ref → appeal_ground → permitted_review_scope → new finding`을 연결. 원심 finding을 수정하지 않음 |
| 항소심 유지 | 새 단계가 원심 finding을 어떤 범위에서 유지했는지 이유와 함께 연결 |
| 항소심 변경 | 바뀐 범위의 새 FactFinding을 만들고 원심·상급심 두 기록을 모두 보존 |
| 최상급심 | DEC-010 A9에 따라 법률 구조 중심 역할을 유지. 사실 재검토 허용 범위가 명시되지 않으면 원심·항소심 사실을 재계산하지 않음 |
| 환송 | 상급심 이유·반환 범위가 연 새 사실 범위만 새 proceeding에서 판단. 나머지는 이력과 현재 적용 관계를 보존 |

후속 심급에서 원심 사실인정이 갖는 정확한 법적 효력, 최상급심이 사실 전제를 사용할 범위, 환송 이유의 구속력은 `[상세 상급심 절차 기준 미정]` 또는 `[상세 환송 기준 미정]`이다. DEC-011은 `preserved / opened_for_review / maintained_for_scope / changed_for_scope / remanded_for_reconsideration` 같은 의미 연결 후보만 제안하며, 어느 연결이 법적으로 발생하는지 판정하지 않는다.

## 10. F8 — 내부 상태와 player explanation의 분리

**F8 채택 후보는 내부 원인 기록과 공개 설명을 별도 산출물로 두는 것이다.**

### 내부 `FactFindingTrace`

- 정확한 Case / Stage / Record Snapshot / FactProposition ID.
- 사용한 RecordEntry·EvidenceUse와 source lineage.
- 범위별 credibility 평가, EvidenceConflict, 적용한 criterion ID.
- 이전 finding과 재검토·유지·변경 관계.
- 결과 상태, 한정 범위, 빠진 근거, 중단 사유.
- 재현·감사용 버전 정보. 실제로 중앙 RNG를 사용한 다른 단계가 있다면 그 참조만 보존하며, 사실인정용 새 RNG를 만들지 않음.

### 공개 `FactFindingExplanation`

- 플레이어에게 공개 가능한 사실명제 표현과 인정 범위.
- 공개 가능한 제출 자료·진술의 내용 범위와 출처.
- 어떤 근거가 어떤 범위를 뒷받침하거나 흔들었는지.
- 신빙성 한계와 미해결 충돌 중 공개 가능한 이유.
- `인정 / 일부 범위 인정 / 현 기록상 인정 불충분 / 판단 기준 미정·절차 미완료`의 구분.
- 반대사실 인정이라면 별도 반대명제와 그 자체의 인정 근거.

설명은 내부 trace의 허용된 projection으로 만든다. actual truth, 미제출 자료, 상대의 숨은 전략, 내부 AP, 비공개 WorkProduct, 플레이어가 접근할 수 없는 기록, 사후에 발견한 정보는 설명에 넣지 않는다. 공개 범위가 미정인 정보는 누출하기보다 제외 사유를 남긴다.

## 11. F9 — probability / hidden score 없는 explainable result

**F9 채택 후보는 숫자 강도 대신 구조화된 이유 연결로 결과를 설명하는 것이다.**

최소 연결은 다음과 같다.

```text
FactProposition과 판단 범위
  → 실제 허용 Record Snapshot
  → 관련 EvidenceUse와 근원 계보
  → 범위별 credibility와 한계
  → 충돌과 빠진 범위
  → 명시된 recognition criterion
  → FactFinding 상태와 이유
```

설명은 예를 들어 다음 수준을 목표로 한다.

- “E1의 해당 문구는 납품 시점을 직접 뒷받침하고 그 부분의 신빙성 다툼은 해결되었으므로, F1의 시점 범위를 인정했다.”
- “E2는 일부 사용을 말하지만 가치의 범위를 말하지 않고, E2의 사본 E2-copy는 같은 근원이라 새 독립 근거가 아니다. 따라서 가치 명제는 현 기록상 인정하기 부족하다.”
- “F3은 인정하지 못했지만 이는 `not-F3`의 인정이 아니다. 반대명제 F4도 별도 근거로 인정되지 않았다.”

위 문장은 형식 예시이며 Q2나 실제 한국법의 인정 기준을 확정하지 않는다. `recognition_criterion_ref`가 없거나 적용 이유를 기록할 수 없으면 결과를 먼저 고른 뒤 설명을 생성하지 않고 `[상세 사실인정 기준 미정]`으로 중단한다.

## 12. F10 — 설계 공백에서의 중단

**F10 채택 후보는 다음 입력 중 하나라도 필요한데 없으면 자동 결과를 만들지 않는 것이다.**

- 판단할 FactProposition과 범위.
- 당시의 CourtRecordSnapshot과 허용된 RecordEntry 범위.
- EvidenceUse의 근원 계보와 실제 관련 내용.
- 필요한 credibility 판단 또는 그 판단을 생략할 수 있다는 명시 기준.
- 충돌이 결과에 중요할 때 이를 처리할 기준.
- 해당 사실에 적용할 recognition criterion.
- 반대사실을 말하려면 별도 반대명제와 양립 불가능 관계.
- 후속 심급이면 prior finding, 허용 review / remand scope.

누락 시 원인에 맞게 `[상세 사실인정 기준 미정]`, `[사실명제 관계 미정]`, `[상세 상급심 절차 기준 미정]`, `[상세 환송 기준 미정]`으로 중단한다. 이 중단은 어느 당사자의 입증 실패·패소·반대사실 인정이 아니다.

## 13. 최소 데이터 구조 제안

아래는 의미 구조 제안이며 Godot 클래스·저장 포맷·API 확정안이 아니다. 모든 ID는 영구적이며 재사용하지 않는 기존 원칙을 따른다.

| 레코드 | 최소 의미 필드 | 경계 |
|---|---|---|
| `ActualStateRecord` | `actual_state_id`, `case_id`, `world_fact_key`, `state_or_payload`, `source_event_ids` | Simulation 전용. CourtFactFinding 입력·공개 설명에서 제외 |
| `FactProposition` | `fact_id`, `case_id`, `statement_ref`, `scope`, `relation_ids` | 법원이 판단하는 명시 문장. actual truth 값을 보유하지 않음 |
| `FactRelation` | `relation_id`, `fact_ids`, `relation_type`, `scope`, `authority_ref` | 반대·배타·부분 중첩을 콘텐츠가 명시. 자동 부정 생성 금지 |
| `EvidenceItem` | `evidence_id`, `case_id`, `source_lineage_id`, `content_ref`, `derived_from_ids` | 원자료·사본·발췌의 계보 보존. strength 점수 없음 |
| `RecordEntry` | `record_entry_id`, `stage_id`, `submission_id`, `evidence_id`, `received_scope`, `allowed_scope`, `status_source_ref` | 허용 여부를 소비할 뿐 증거능력을 판정하지 않음 |
| `CourtRecordSnapshot` | `record_snapshot_id`, `stage_id`, `cutoff_event_id`, `allowed_record_entry_ids` | 판단 당시 실제 입력을 고정. 이후 입력으로 덮어쓰기 금지 |
| `EvidenceUse` | `evidence_use_id`, `fact_id`, `record_entry_id`, `content_scope`, `role`, `lineage_contribution_key` | 한 evidence의 여러 fact 사용 허용, 동일 기여 중복 가산 금지 |
| `CredibilityAssessment` | `credibility_id`, `stage_id`, `evidence_use_id`, `assessed_scope`, `state`, `reason_refs` | 증거 진술 범위에 붙음. Fact sufficiency와 분리 |
| `EvidenceConflict` | `conflict_id`, `fact_or_relation_id`, `evidence_use_ids`, `conflict_scope`, `state`, `reason_refs` | 충돌 양측과 미해결 범위를 모두 보존 |
| `RecognitionCriterionRef` | `criterion_ref`, `content_scope`, `authority_source`, `version` | 판정 기준의 참조. 기준 내용·한국법 일반화는 이번 문서 밖 |
| `CourtFactFinding` | `finding_id`, `stage_id`, `fact_id`, `record_snapshot_id`, `status`, `recognized_scope`, `evidence_use_ids`, `credibility_ids`, `conflict_ids`, `criterion_ref`, `reason_codes` | proposition-level canonical 결과. contrary는 별도 recognized proposition과 관계에서 도출 |
| `FindingLineage` | `lineage_id`, `prior_finding_id`, `later_stage_id`, `review_scope_ref`, `treatment`, `later_finding_id`, `reason_ref` | 원심 finding을 덮어쓰지 않고 유지·변경·환송 관계 기록 |
| `FactFindingExplanation` | `explanation_id`, `finding_id`, `public_fact_text_ref`, `public_record_refs`, `public_reason_codes`, `disclosure_basis` | 내부 trace의 공개 가능한 projection. hidden truth·score 금지 |

최소 구조의 핵심은 `ActualStateRecord`와 `CourtFactFinding`의 물리적·논리적 분리, `EvidenceItem`과 `EvidenceUse`의 분리, `CredibilityAssessment`와 proposition-level sufficiency 결과의 분리, stage별 append-only finding이다.

## 14. Accepted 후보와 TBD 후보의 분리

### 14.1 이번 결정에서 채택을 제안하는 후보

| ID | 채택 후보 | 상태 |
|---|---|---|
| F1 | actual truth와 court finding의 별도 저장·입력 경계 | Proposed |
| F2 | proposition-level 인정·한정 인정·현 기록상 불충분·유보, 반대사실은 별도 명제 인정으로만 도출 | Proposed |
| F3 | source lineage 기반 evidence 식별과 fact별 EvidenceUse, 복제 가산 금지 | Proposed |
| F4 | 범위별 credibility와 proposition-level sufficiency의 분리 | Proposed |
| F5 | 충돌 자료·범위·해결 상태를 삭제 없이 명시적으로 보존 | Proposed |
| F6 | 실제 수신·허용 범위의 CourtRecordSnapshot만 사실인정 입력으로 사용 | Proposed |
| F7 | 심급별 FactFinding append-only 보존과 허용 범위의 lineage 재검토 | Proposed |
| F8 | 내부 trace와 공개 explanation을 분리하고 공개 projection만 사용 | Proposed |
| F9 | 확률·숨은 점수 대신 proposition→record→근거→한계→기준→결과의 이유 연결 | Proposed |
| F10 | 필수 기준·범위가 없으면 원인별 TBD로 중단 | Proposed |

### 14.2 이번에 채택하지 말아야 할 TBD

- 실제 대한민국 법률의 증명도, 입증 기준, 사실 추정, 자백·무응답·다투지 않은 사실의 효과.
- 어떤 evidence가 절차적으로 제출·채택·배제되는지의 evidence admissibility.
- 문서·증언·전문가 의견 유형별 신빙성 공식, 가중치, 확률, 임계값.
- 독립 corroboration과 동일 근원 반복을 모든 콘텐츠에 자동 판정하는 범용 의미 추론.
- 자연어 evidence에서 FactProposition·반대명제·배타 관계를 자동 생성하는 법률 reasoning engine.
- 입증 부족을 어느 당사자에게 귀속해 어떤 청구 효과를 닫는지. DEC-008의 명시적 부담 관계를 그대로 사용하며 새 일반 규칙을 만들지 않음.
- 판사 personality·성향·오류·집중 차이가 credibility 또는 sufficiency를 바꾸는 방식.
- 항소·상고에서 원심 사실인정의 정확한 법적 효력, 신규 증거·새 주장 허용, 심리 범위·확정.
- 환송 이유의 구속력과 열린 사실 범위, 환송심의 추가 제출 허용.
- damages / remedy / 지급액·감액·부분 반환 공식.
- precedent effect와 World 반영.
- judgment engine, 상대·판사 AI, workload 공식, Career / Business / World 통합, UI·save schema.
- 플레이어에게 공개할 문구·시점·상세 수준. F8은 분리 원칙만 제안하며 실제 UI는 정하지 않음.

## 15. DEC-007~010과의 충돌 검토

| 기존 결정 | 충돌 여부 | 검토 결과와 주의점 |
|---|---|---|
| DEC-007 | **직접 충돌 없음** | J1~J3·J9를 구조화한다. `not_established_on_record`는 사실명제에 대한 ‘현 근거로 배척’의 구체 표현이며 반대사실 인정이 아니다. `contrary_recognized`를 새 다섯 번째 수용 상태로 만들면 충돌하므로 파생 설명으로만 둔다 |
| DEC-008 | **직접 충돌 없음** | DEC-011은 중간 사실인정까지만 다룬다. sufficiency 부족을 청구 패소로 직접 연결하거나 새 부담 배분을 만들면 A1~A4와 충돌한다. 같은 fact를 여러 청구가 참조해도 evidence strength를 복제하지 않는 구조는 A6와 일치한다 |
| DEC-009 | **직접 충돌 없음** | stage/cutoff별 Record Snapshot과 append-only finding은 P4 누적·부분 재검토와 일치한다. 새 제출 시 과거 finding을 삭제하거나 사건 전체를 재계산하면 충돌한다. F6은 외부에서 정해진 allowed flag를 소비만 하므로 P4의 상세 절차 미정을 침범하지 않는다 |
| DEC-010 | **직접 충돌 없음** | FindingLineage는 A4·A6·A11의 역사 보존과 범위 재검토를 지원한다. 다만 원심 finding을 자동 진실·자동 구속으로 승격하거나 최상급심에서 fact를 전면 재평가하면 충돌한다. review/remand 허용은 계속 주입 또는 TBD다 |

**조건부 충돌 위험:** F2의 상태를 DEC-007의 네 상태와 별개인 전역 enum으로 구현하거나, F6의 `allowed_scope`를 사실인정 모듈이 자체 결정하거나, F7의 `treatment` 값만으로 법적 구속력을 자동 발생시키면 기존 Accepted 범위를 넘어선다. 채택 시에도 이 세 경계를 명시적으로 유지해야 한다.

## 16. Failure conditions

다음 중 하나라도 발생하면 최소 사실인정 모델의 실패로 본다.

1. actual truth를 바꾸고 제출·허용 기록은 고정했는데 법원 finding이 달라진다.
2. 법원 이유나 player explanation이 미제출 자료·내부 AP·숨은 WorkProduct·사후 truth를 인용한다.
3. `P`가 부족하다는 이유만으로 `not-P`를 인정하거나 상대 청구를 자동 인용한다.
4. 명시적 반대명제나 배타 관계 없이 “반대사실 인정”을 생성한다.
5. 같은 문서의 사본·발췌·재인용·동일 의견 반복으로 credibility 또는 sufficiency가 상승한다.
6. 같은 evidence가 여러 FactProposition에 쓰였다는 이유로 사실들 사이에 strength가 복제되거나, 반대로 첫 사용 뒤 evidence가 소진된다.
7. 전문가 직함·증거 개수·문서 등급을 proposition의 충분성 점수로 직접 합산한다.
8. credibility가 높다는 이유로 자료가 말하지 않는 범위까지 충분하다고 인정한다.
9. 충돌 evidence 중 불리한 항목을 기록에서 삭제하거나, unresolved conflict를 자동 절반 인정·자동 양쪽 배척으로 처리한다.
10. 제출됐다는 사실만으로 received / allowed / fact-finding use를 모두 충족한 것으로 처리한다.
11. 허용된 발췌를 근거로 미허용 전문을 복원한다.
12. 새 제출·항소·환송 때 원심 finding과 당시 Record Snapshot을 덮어쓰거나 삭제한다.
13. 상급심 진입만으로 fact를 재추첨하거나 모든 원심 사실을 자동 재심리한다.
14. 원심 finding을 역사 보존했다는 이유만으로 모든 후속 심급에서 자동 사용·구속한다.
15. 동일 입력의 결과를 판사 personality, 숨은 확률, 마지막 RNG로 뒤집는다.
16. recognition criterion이 없는데 결과를 먼저 고르고 사후 설명을 생성한다.
17. `[상세 사실인정 기준 미정]`을 사건 당사자의 입증 실패나 패소로 기록한다.
18. 공개 explanation과 내부 trace가 같은 객체여서 접근 권한 변화 없이 actual truth나 비공개 근거가 노출된다.
19. 일부 범위 인정이 전체 기간·대상·수량·가치에 대한 인정으로 확대된다.
20. FactProposition ID, EvidenceItem ID, finding 이력을 재사용해 과거 판단의 원인을 재현할 수 없게 된다.

## 17. TEST-010에서 검증해야 할 항목

다음 단계는 `TEST-010_MINIMUM_FACT_RECOGNITION.md`의 작성과 실행이다. DEC-011이 아직 Proposed이므로, 아래는 **채택 후 검증 계획 후보**다. 이번 문서는 테스트를 작성하거나 실행하지 않는다.

테스트는 우선 고정된 FactProposition, Record Snapshot, allowed 범위, credibility 판단, recognition criterion을 사용하는 **입력 처리 검사**로 수행할 수 있다. 이 값을 주입하면 범용 사실인정 엔진·증거능력·법률 reasoning의 성공으로 보고하지 않는다.

| 번호 | 고정·변경 입력 | 반드시 확인할 결과 |
|---|---|---|
| 1. truth 비간섭 | 제출·허용 record와 criterion은 동일, ActualStateRecord만 서로 다르게 주입 | CourtFactFinding과 공개 이유가 동일. 디버그 대조만 다를 수 있음 |
| 2. record 민감성 | actual truth는 동일, 실제 allowed evidence 범위만 변경 | 변경된 근거와 직접 관련된 fact·범위만 재평가 |
| 3. 부족 vs 반대 | P 근거 부족 변형과, 배타 Q가 별도 근거로 인정된 변형 | 전자는 P만 `not_established`; 후자만 반대사실 인정 설명 |
| 4. 기준 부재 vs 사건 부족 | 한 변형은 criterion 없음, 다른 변형은 criterion 존재하나 필요한 record 부족 | 전자는 `undetermined/TBD`, 후자는 `not_established_on_record` |
| 5. 동일 사본 공격 | 같은 source lineage의 원본·사본·발췌 개수를 증가 | sufficiency·credibility가 개수만으로 상승하지 않음 |
| 6. 다중 fact 사용 | 하나의 evidence를 관련 범위가 다른 F1·F2에 연결 | 각 fact의 관련 범위를 별도 평가. 교차 가산·evidence 소진 없음 |
| 7. 독립 근거 경계 | 명시적으로 같은 lineage인 두 자료와 독립 lineage로 주입한 두 자료 비교 | 같은 lineage는 새 corroboration 아님. 독립성의 실질 효과 기준이 없으면 그 지점에서 중단 |
| 8. credibility / sufficiency 교차 | credible하지만 범위 부족, contested지만 다른 독립 근거 존재, irrelevant하지만 credible한 입력 | credibility 상태와 proposition 결과가 동일 값으로 복사되지 않음 |
| 9. conflict 보존 | 동일 fact에 직접 충돌하는 두 EvidenceUse와 제한된 해결 범위 주입 | 양측 근거·충돌·남은 범위 보존. 해결된 부분만 finding에 반영 |
| 10. submitted / allowed 경계 | 미제출, 제출·미수신, 수신·미허용, 부분 허용, 전체 허용 변형 | CourtRecordSnapshot은 실제 허용 범위만 포함. 증거능력 판단을 자체 생성하지 않음 |
| 11. 내부 정보 비간섭 | hidden AP·내부 평가·미제출 WorkProduct만 변경 | finding·공개 이유 불변, 정보 누출 없음 |
| 12. 설명 역추적 | finding에서 proposition→criterion→conflict/credibility→EvidenceUse→RecordEntry까지 추적 | 실제 기록에 없는 사후 이유나 truth가 없음 |
| 13. 원심 보존 | Trial finding 뒤 Appeal stage 생성 | Trial finding·snapshot 불변, 상급심 사용 가능 범위는 별도 |
| 14. 항소 부분 재검토 | 하나의 원심 fact만 허용 review scope로 주입 | 새 stage finding만 추가, 무관 원심 fact 유지·재계산 금지 |
| 15. 최상급심 경계 | 법률 연결 공격만 허용하고 fact review 권한은 주입하지 않음 | fact finding 재추첨·새 evidence 사용 없음 |
| 16. 환송 범위 | 특정 fact만 remand scope로 열고 나머지는 유지 입력 | 열린 fact의 새 finding과 lineage 생성, 과거·무관 finding 보존 |
| 17. 공개 projection | 같은 내부 trace를 court-public / party-limited / debug 관점으로 투영 | 각 공개 범위에 허용된 근거만 보이고 actual truth·숨은 정보는 없음 |
| 18. 결정성 | 같은 Case·Stage·Snapshot·criterion·명령 순서를 반복 | byte-equivalent 또는 의미상 동일 snapshot과 finding. 새 RNG 없음 |
| 19. 범위 한정 | 기간·수량·대상 일부만 뒷받침하는 evidence | `recognized_limited`가 전체 인정으로 확대되지 않음 |
| 20. 실패 원자성 | 잘못된 fact ID, record 밖 evidence, 재사용 ID, 허용 범위 초과 참조 | 명령 거부, 정확한 error, 전체 state snapshot 불변 |

TEST-010 결과는 `통과 / 부분 통과 / 실패 / 기준 미정으로 미실행`을 구분해야 한다. 1~20의 고정 입력 처리가 통과해도 자연어 증거 해석, 증거능력, 법률상 신빙성·충분성, 실제 판결·항소 결과 생성이 검증됐다고 보고하지 않는다.

## 18. 이번에 구현하거나 확정하지 않는 사항

이번 문서 초안에서는 코드, judgment engine, evidence admissibility, appeal admissibility, damages / remedy, judge personality, precedent effect를 구현하거나 확정하지 않는다. 상대·판사 AI, 법률 reasoning engine, workload, Career / Business / World 통합, UI, save / migration도 범위 밖이다.

DEC-011이 채택되더라도 첫 구현 범위는 고정·주입 입력에 대한 상태·이력·정보 경계 검증용 skeleton이어야 한다. `recognition_criterion_ref`의 내용을 추측하거나 주입 표식을 제거해 자동 사실인정 기능으로 보고해서는 안 된다.

## 19. 결정 이력

| 버전 | 상태 | 내용 |
|---|---|---|
| v0.1 | Proposed / 기획자 채택 필요 | actual truth / court finding 분리, 미인정 / 반대사실 인정 구별, evidence lineage 기반 중복 방지, credibility / sufficiency 분리, conflict 보존, allowed record snapshot, 심급별 finding lineage, 내부 trace / 공개 explanation 분리, 비수치 이유 연결과 TEST-010 후보 제안. 법률 기준·admissibility·최종 판결·상급심 허용·remedy·판사 성향·판례 효력은 TBD 유지 |
