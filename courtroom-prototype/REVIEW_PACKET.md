# Courtroom Core v0.5 — Review Packet

## 목적과 범위

v0.4의 신문 코어를 유지하고 검사 이의 → 플레이어 대응 → 판사 결정 → 질문 진행/축소/차단을 추가했다. 상시 정보량을 줄이고 Evidence / Advocacy / Procedural 기록을 한 Court Record에서 확인하게 했다.

Active contract: `.agent/tasks/COURTROOM-CORE-005.md`. 별도 웹 실험이며 정식 Accepted Godot 설계나 다음 VS를 변경하지 않는다.

저장소 HEAD는 v0.3였다. 실제 v0.4 ZIP을 가져와 기반으로 삼았으므로 이번 Git diff에는 v0.4 Inference Variant·mixed exploration 도입도 포함된다. 기반 ZIP SHA256: `059B16753ECA631D99CEB8388998BA773906CBEF7681D40DB88F551745520737`. 원본 reference와 이전 ZIP은 보존했다. 가져온 v0.4 원본에서 Node 78 / browser 51 통과를 먼저 확인했다.

## 변경 파일과 요약

| 파일 | 변경 |
|---|---|
| `.agent/tasks/COURTROOM-CORE-005.md` | 허용 범위, 실제 기반 배포본, 불변 조건, 검증 예산 |
| `courtroom-prototype/data/case.js` | v0.4 데이터 가져오기; 3개 절차 opening, 최소 판사 profile, 축소 질문 데이터 |
| `engine/core.js` | v0.4 Inference/record 평가 유지; pending 동안 기존 행동 차단 |
| `engine/procedure.js` | 신규: opening, 맥락별 대응, 근거 연결 검증, 제한된 판사 재량 |
| `services/courtroom.js` | pending transaction, procedure 기록, 허용 후 기존 resolver 재개, 단일 commitment 저장 |
| `ui/app.js` | 중앙 영역 일시 전환, 통합 기록 필터/상세, 조용한 기본 화면, 작은 live region |
| `ui/courtroom.css`, `index.html` | v0.5 간결한 배치, 접근성 구조, procedure 로딩 |
| `package.json` | v0.5 및 새 절차 테스트 포함 |
| `tests/core.test.js`, `tests/strategy.test.js` | 기존 의미론을 절차 gate 너머에서 검증; legacy commitment 상태 제거 |
| `tests/inference.test.js` | 실제 v0.4의 11개 Inference/탐색 위험 회귀 가져오기 |
| `tests/settle-procedure.js` | 기존 신문 테스트용 명시적 절차 완료 helper; production에는 미사용 |
| `tests/procedure.test.js` | 신규 22 tests: 모든 요청 경로·기록 분리·profile 경계·실패 원자성 |
| `tests/browser.test.js` | 기존 의미 경로와 간결한 UI/모바일/이의/접근성 검증 92 checks |
| `tests/ui-budget.js` | 동일 장면 표시 문자/높이 측정, v0.5 예산 3개 assertion |
| `EXPERIMENT_RULES.md` | 사건 전용 절차 규칙, 정식 법률 설계와의 경계 |
| `README.md`, `UI_TEXT_AUDIT.md`, `REVIEW_PACKET.md`, `test-results.log` | 실행·검증·텍스트 감사·한계 |

## 강제되는 invariant

- 이의/설명/허용 대기 중 원 질문과 전제는 고정. 새 신문·전략·Frame·Stop으로 우회할 수 없다.
- Objection, 대응, Ruling, instruction, 제한·철회는 Procedural Record에만 남는다.
- 허용 결정만으로 Evidence나 Press advocacy를 만들지 않는다. 별도 answer command가 증인 resolver를 실행한다.
- 차단·철회는 증언·Proposition·원래 Press history를 만들지 않는다.
- Narrow는 원 결론을 포기한다. Narrow Press는 새로운 Admission이나 원래 Press signature를 만들지 않는다.
- Court Address/Basis는 현재 Issue, 정확한 Inference, 실제 기록/자료 ref의 전체 연결을 검증한다. 잘못된·중복·과거 ID는 거부한다.
- Major Commitment는 `records.advocacy kind=major_commitment` 하나만 저장·조회한다. Working Strategy는 별도 mutable state다.
- 판사 profile은 애매한 형식·반복 확인에만 영향. 누락 근거 단순 유지와 이미 인정된 결론 반복을 허용하지 못한다.
- 실패한 command는 state와 ID serial을 보존한다. 기록 평가에 Procedural Record를 추가해도 사실/논증 결론은 바뀌지 않는다.

## 실행과 결과

작업 디렉터리 repository root. Node/browser commands:

```text
node --test courtroom-prototype/tests/core.test.js courtroom-prototype/tests/strategy.test.js courtroom-prototype/tests/inference.test.js courtroom-prototype/tests/procedure.test.js
node courtroom-prototype/tests/browser.test.js
node courtroom-prototype/tests/ui-budget.js v05
```

브라우저 테스트 런타임: Playwright, 설치된 Edge, 1440×1080 / 1440×800 / 390×844, localhost 및 file URL. 앱에는 런타임 패키지 의존성이 없다.

Godot 4.7.2 각 runner를 `--headless --path litigation-skeleton --script <runner>`로 실행:

| Runner | Checks | Failures | Exit |
|---|---:|---:|---:|
| tests/run_regressions.gd | 214 | 0 | 0 |
| vertical_slice/tests/run_slice_regressions.gd | 73 | 0 | 0 |
| vertical_slice/tests/run_vs002_regressions.gd | 72 | 0 | 0 |
| vertical_slice/tests/run_vs003_regressions.gd | 260 | 0 | 0 |
| vertical_slice/tests/run_vs004_regressions.gd | 256 | 0 | 0 |
| vertical_slice/tests/run_vs005_regressions.gd | 351 | 0 | 0 |
| vertical_slice/tests/run_vs006_regressions.gd | 1,054 | 0 | 0 |
| Node | 100 | 0 | 0 |
| Browser | 92 | 0 | 0 |
| 합계 | **2,472** | **0** | **0** |

추가로 Godot `--headless --path litigation-skeleton --quit-after 3` 시작 검사 exit 0, UI budget 3개 assertion 통과. 별도 숫자로 보고하며 위 합계에 중복 계산하지 않았다.

초기 실행 오류: Python 별칭 사용 불가로 Node를 사용했다. 첫 Godot 호출은 프로젝트 위치를 repository root로 잘못 지정해 runner를 찾지 못했으며, 정확한 `litigation-skeleton` 경로로 7개 모두 다시 실행해 통과했다. 첫 새 테스트의 기대값 `fresh`를 기존 core의 실제 enum `first`로 바로잡았다. 최신 결과에 실패 없음.

기존 78 Node test의 핵심 신문 assertion을 유지했다. 이전 ‘인정 후 같은 결론 반복’의 반대증언 생성 assertion 하나는 이번 요청의 Asked-and-Answered 차단으로 대체했다. 이는 절차 gate의 의도된 변화다. 허용된 질문의 기존 resolver는 변경하지 않았다. 기존 browser badge/count assertion은 제거된 UI 대신 증언·기록·결과·상세로 검증한다.

## 요청된 8개 질문에 대한 답

1. **실제 판단인가?** 범위 축소는 원 결론을 포기하고, 철회는 답변 없이 끝내며, 근거 제시는 불리한 답변까지 포함한 원 질문을 재개한다. 결과가 달라진다. 다만 이 한 사건에서 규칙을 외우면 Basis가 익숙한 통과 클릭이 될 수 있다. 추가 판사 확인 클릭은 없앴다.
2. **상대가 절차적 이유로 행동하는가?** 예. 현재 signature, 미확립 전제, 제한적 Inference의 결론 요구만 감지한다. 강한 첫 질문·보강 질문에는 이의하지 않으며 RNG가 없다. 사람의 체감 평가는 미실시다.
3. **판사는 법률 퀴즈 정답 판정기인가?** 이의 유형을 맞히지 않는다. 현재 질문을 유지/축소/철회하거나 자신이 만든 기록과 논증을 연결한다. 판사 성향은 애매한 범위에만 영향을 준다. 범용 법률 판단은 구현하지 않았다.
4. **기록은 자연스럽게 결합됐는가?** 세 배열의 의미는 분리하고 UI는 하나의 시계열 목록·필터·상세다. 판사 허용은 증거로 계산되지 않는다. 현재 평가는 종전 Evidence/Advocacy만 읽는다.
5. **상시 정보량은 얼마나 늘었는가?** 동일 표본에서 1,004→183자, 약 81.8% 감소. 문서 높이 1,080px 유지, 행동 영역 624→283px. Lane은 95px 아래로 이동했지만 모든 행동이 viewport 안에 남는다. 절차 기록이 쌓인 장면까지 같은 감소율을 주장하지 않는다.
6. **삭제 가능한 새 문구가 남았는가?** 중복 상태·힌트·설명은 제거하고 행동, 실제 대사, 접힌 근거를 남겼다. 세부 감사는 `UI_TEXT_AUDIT.md`. 각 문구를 행동 필요성·새 정보·중복·축약 가능성으로 검토했다.
7. **불필요한 장식은 추가했는가?** 체크·완료·성공/실패·강도 배지·판사 게이지를 추가하지 않았다. 기존 배지도 제거했다. 전제 선택의 aria-pressed와 색상은 실제 선택 조작을 위한 것이다.
8. **초심자가 긴 설명 없이 이해 가능한가?** 실제 이의 대사와 3~4개 짧은 행동, 필요할 때 펼치는 근거로 구성했다. 자동 브라우저 경로와 화면은 확인했으나 초심자 사용자 테스트는 하지 않아 이해도를 단정하지 않는다.

## Fixture / injected / TBD

- 단일 사건·증인, 11개 Inference, 증인 답변, 이의 조건, 판사 프로필 및 ruling은 authored data/rules다. 완전한 상대/판사 AI가 아니다.
- Major Commitment 생성 행동은 미구현. 단일 저장 source와 평가 경로는 synthetic record fixture로 검사했다.
- 다른 판사 profile은 headless 테스트로 주입한다. 플레이용 판사 선택 기능은 만들지 않았다.
- 실제 법률 추론·증거능력·자동 판결·민사·다중 증인·Closing·합의·항소·관계/편향·저장·Career/Business/World 통합은 미구현이다.
- 이 웹 실험을 정식 Godot Accepted design에 편입할지, 절차 정책을 어떻게 일반화할지는 결정하지 않았다.

## 범위 검토 / handoff

Scoped diff를 검토했다. 원본 reference, 이전 ZIP, Godot production/test, root 설계, 사용자의 기존 automation 변경은 건드리지 않았다. 변경 범위는 위 contract와 courtroom-prototype 내부다. Git diff whitespace check 통과. 다음 VS 작업을 시작하지 않았고 push하지 않는다.

자체 구현 검토 완료. 독립 Reviewer PASS를 주장하지 않는다. 다음 VS는 별도 Reviewer PASS 전까지 진행하지 않는다.
