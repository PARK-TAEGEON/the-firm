# Litigation 검증용 Godot 골격

TEST-008/009에서 추린 고정 입력으로 **상태·이력·정보 경계**를 검사한다. 판단 내용과 업무 완료는 주입 입력이다. 법률 판단이나 AI 성능을 검증하는 엔진이 아니다.

## 실행

Godot 4 콘솔 실행 파일을 사용한다. 프로젝트 폴더에서:

```powershell
& 'Godot 실행 파일의 절대 경로' --headless --path . --log-file ./test-results.log --script res://tests/run_regressions.gd
```

창이나 main scene 없이 실행한다. 각 검사에 PASS/FAIL을 출력하고 정상 종료는 0, 검사 또는 fixture 적용 실패는 1을 반환한다.

검증 환경: Godot 4.7.2 stable, Windows. 최근 실행 결과: **185 checks, 0 failures**, 종료 코드 0. 이 검사는 네트워크를 사용하지 않는다.

## 구성

| 파일 | 책임 |
|---|---|
| `data/litigation_state.gd` | Case, 기록, 현재 commitment, 사용 시간 및 명령 이력의 저장 |
| `services/litigation_service.gd` | 참조 검증, 상태 추가, 명시적 전달, 조회 복사본 |
| `fixtures/test008.json` | Q2의 W1/W2/Wbeta, S0~S4, J1→J2 부분 판단 이력, T0~T11 |
| `fixtures/test009.json` | 동일 Q2-AP의 J0→JA→JS-R→RM-r1, 양측 불복 대상, 검토와 T12~T20 |
| `tests/run_regressions.gd` | fixture 재생, 불변조건 및 잘못된 명령의 무변경 거절 검사 |

현재 하나의 stage 기록이 CourtStage/Proceeding 한 회차를 나타낸다. Case는 단계 ID를 순서대로 보존한다. Trial은 루트 단계이고, fixture가 명시한 계보인 trial → appeal → supreme → remand에서 각 후속 단계는 직전 stage의 Judgment를 참조해야 한다. 존재하지 않거나 다른 Case에 속한 Judgment, 단계 건너뛰기, self/future 참조는 거절된다. 추가 항소 경로의 적법성 규칙은 만들지 않았다.

AppealTarget은 실제 prior Judgment의 Reason만 참조할 수 있다. Appeal/Supreme에서 생성되는 Reason과 Judgment는 해당 stage의 AppealTarget들이 명시한 `scope` 합집합 안의 범위를 직접 선언해야 한다. Remand에서 생성되는 Reason과 Judgment도 RemandScope의 반환 `scope`만 선언할 수 있다. payload의 법률 의미나 dependency를 추론하지 않으며 whole-case reopening도 자동 부여하지 않는다.

Submission은 명시적으로 작성한 공식 입력이며 WorkProduct를 자동 복사하지 않는다. 다른 심급에 공식 기록을 편입해도 전달 권한은 생기지 않는다. 수신자·심급을 지정한 전달이 있어야 해당 공식 조회에 나타난다. 공개 조회와 내부 조회는 복사본을 반환한다.

배정 자체는 작업 완료나 검토를 만들지 않는다. commitment의 완료는 Case, stage, lawyer, work를 포함한 사용 시간 이력으로 남는다. 검토는 같은 Case와 stage에서 같은 lawyer가 완료한 time 및 그 stage의 AppealTarget 참조를 요구한다. 같은 인물의 같은 기호 시간대는 다른 사건에서도 중복 사용할 수 없다. 이것은 명시적으로 겹치는 집중 업무의 fixture 조건이며 workload 공식이나 최대 사건 수 모델이 아니다.

## 자동 검사 범위

- Case 하나에 원심·항소·최상급심·환송 이력이 누적된다.
- 사실, WorkProduct, 기존 중간 판단 및 과거 사용 시간이 보존된다.
- 내부 기록의 공식 편입·전달·판단 근거 참조는 거절된다.
- 원심에 속하지 않은 Reason을 항소 대상으로 지정하거나 다른 Case·잘못된 순서·self/future 단계 참조를 사용할 수 없다.
- 항소 범위 밖 또는 환송 반환 범위 밖의 Reason/Judgment 연결은 거절된다.
- 사건 재생성, 초기화, 중복 완료 및 다른 Case·stage·lawyer·미완료 commitment의 시간으로 검토 완료가 거절된다.
- 새 배정은 사용 시간을 만들지 않으며 사건 간 동시간 업무 충돌이 거절된다.
- 거절된 명령은 상태를 바꾸지 않고 조회 복사본 변경은 원본에 영향을 주지 않는다.
- 동일 seed·동일 명령 입력을 재생하면 동일 snapshot이 나온다.

185개는 fixture 명령 적용 검사와 불변조건 검사의 합계이며, 독립된 법률 사례 185개를 뜻하지 않는다. 각 실패 명령은 거절과 snapshot 불변을 별도로 검사한다. TEST-008/009 전체 수동 검증의 자동화를 주장하지 않는다. TEST-009는 JS-R 환송 경로를 사용하며 JS-K 대안 경로는 이 fixture에 포함하지 않았다.

## 남겨 둔 경계

판결·중간 판단·공격 범위·허용된 편입·업무 결과는 신뢰된 fixture가 공급한다. Service는 명시된 `scope` 경계를 검사하지만 opaque payload의 문구가 실제로 어느 청구를 변경하는지 해석하지 않는다. 참조의 존재와 유형을 검사하되 제출 내용의 법적 타당성, dependency expansion, binding doctrine, 모든 판단 입력의 절차적 허용 여부, 심리 종결 또는 judgment-ready의 자동 판별은 하지 않는다. 후속 단계 생성도 일반적인 적법성 판정이 아니다.

seed는 재현 메타데이터다. 현재 난수 선택을 하지 않으므로 RNG 품질이나 확률 재현 검사는 아니다. schema_version은 있으나 영구 세이브와 마이그레이션은 구현하지 않았다.

`debug_snapshot()`은 신뢰된 테스트 전용이다. 내부 저장소 접근은 GDScript 관례로 제한하며 보안 격리 장치가 아니다. 향후 상대·판사에는 제한된 공식 조회만 연결해야 한다.

실제 판결 생성, AI, 신규 증거 허용, 판례 효력, workload 수치, UI 및 Career/Business/World는 구현하지 않았다. 기존 설계 문서와 인접 시스템은 수정하지 않았다.
