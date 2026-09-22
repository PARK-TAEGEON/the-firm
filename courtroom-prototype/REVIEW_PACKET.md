# Courtroom Core v0.6 — Review Packet

## 목적과 범위

두 번째 감식 증인을 같은 법정 문법으로 구현하고, 질문 방향 → 대화 → 기록 → 논점 구성으로 UI를 바꿨다. 기반 커밋은 v0.5 `1758a5a`. Active contract는 `.agent/tasks/COURTROOM-CORE-006.md`이며 별도 웹 실험이다. Godot Accepted 설계 및 다음 VS는 변경하지 않았다.

## 변경 파일

| 파일 | 변경 요약 |
|---|---|
| root `DESIGN.md` | 반복 프롬프트 대신 읽을 웹 실험 설계 기준, stable rules와 현재 범위/TBD |
| root `AGENTS.md` | courtroom-prototype 작업 전 DESIGN.md를 읽도록 좁은 지침 추가 |
| `.agent/tasks/COURTROOM-CORE-006.md` | 허용 범위와 v0.6 작업 계약 |
| `courtroom-prototype/data/case.js` | 두 증인 ownership, 네 Thread, 조명 follow-up, 감식 증언·자료·7 propositions·11 Inference Variants, response/resolution 및 basis-choice data |
| `engine/core.js` | 단일 증인 가정 해제, ownership 검증, 현재 증인/plan의 질문·pressure·record 평가 범위 |
| `engine/procedure.js` | plan별 profile/문구/축소 질문 설정, 1~2개 선택 basis refs 및 coverage 검증 |
| `services/courtroom.js` | 증인·Thread 이동, 증인별 종료, 기본 주신문 1회 기록, 대화 witness provenance, projection |
| `ui/app.js` | 의도/주제 흐름, paired 질문/답변, 기록의 선택 재료 전환, 복수 근거 장면, 절차 transaction 묶음 |
| `ui/courtroom.css`, `index.html` | v0.6 레이아웃·모바일·자연어 표기 |
| `package.json` | 버전 및 새 회귀/브라우저/budget 실행 |
| `tests/core.test.js`, `tests/strategy.test.js` | 기존 목격자 전용 테스트의 goal 열거를 해당 witness로 한정 |
| `tests/flow.test.js` | 신규 32 tests: 감식, scoped replay, 이동/종료, 선택 근거, profile, ID remapping, 실패 원자성 |
| `tests/browser.test.js` | 기존 92개 브라우저 검증을 새 진입 흐름/transaction 표시에 맞춤 |
| `tests/browser-flow.test.js` | 신규 실제 클릭 경로 47개, 모바일 근거 sheet와 다중 basis 포함 |
| `tests/ui-budget.js`, `tests/ui-budget-baseline.json` | 동일 장면 네 상태 비교 및 14개 예산 assertion |
| `README.md`, `EXPERIMENT_RULES.md`, `UI_TEXT_AUDIT.md`, `REVIEW_PACKET.md`, `test-results.log` | 실행·사건 규칙·텍스트 감사·결과·한계 |

원본 reference, 이전 ZIP, Godot 코드/테스트, 기존 automation 변경은 보존했다.

## 주요 invariant

- witness→plan, goal/thread/counter→witness, proposition→plan의 ownership을 검증한다. 다른 증인 질문/전제를 현재 신문에 사용할 수 없다.
- 증인 이동은 기록과 Press history를 보존한다. 서명에는 기존과 같이 plan+witness+선택 전제가 들어간다. 닫힌 증인은 이동으로 재개되지 않는다.
- 감식 기본 주신문은 최초 진입에만 기록되며 source/witness/examination provenance를 갖는다. 시간 한계 논증은 지문·혈액 검출을 지우지 않는다.
- `endThread`는 CourtRecord와 종료 평가를 바꾸지 않는다. 후속 질문 이전에 멈추면 해당 증거가 만들어지지 않는다.
- exact-premise Inference, Frame와 증언의 구분, 기존 Press matcher, qualification provenance, record-only evaluation을 유지한다.
- 평가에는 명시적인 authored plan scope를 전달한다. 다른 plan의 concession/counter는 섞이지 않으며 lane 선택/질문 수/이의 성공이 증거가 되지 않는다.
- 선택 basis는 현재 후보의 typed refs 1~2개만 허용한다. 중복·위조·미확보·다른 증인 refs와 잘못된 issue/inference는 상태/ID를 오염시키지 않고 거부한다.
- 이의 진행 중에는 증인/Thread 이동과 신문 종료도 차단한다. 판사 허용 transaction과 실제 witness answer transaction은 분리되어 있다.
- Procedural Record는 event 배열 그대로 저장하고 UI에서만 questionId별로 묶는다. Major Commitment는 Advocacy 단일 저장 위치를 유지한다.

## 검증 결과와 실행 명령

```text
node --test courtroom-prototype/tests/core.test.js courtroom-prototype/tests/strategy.test.js courtroom-prototype/tests/inference.test.js courtroom-prototype/tests/procedure.test.js courtroom-prototype/tests/flow.test.js
node courtroom-prototype/tests/browser.test.js
node courtroom-prototype/tests/browser-flow.test.js
node courtroom-prototype/tests/ui-budget.js v06
```

Node/Playwright/설치된 Edge 사용. localhost와 file URL을 검증했다. v0.5 ZIP에서도 같은 UI 측정을 수행하여 baseline fixture에 보존했다. UI 스크린샷은 데스크톱 기본/논점/후속 질문/이의/근거 선택, 모바일 기록 sheet/절차 선택을 직접 검토했다.

| 검증 | Checks/tests | Failures | Exit |
|---|---:|---:|---:|
| 기존 Node | 100 | 0 | 0 |
| 새 감식/흐름 Node | 32 | 0 | 0 |
| 기존 UI 경로 | 92 | 0 | 0 |
| 새 흐름 UI 경로 | 47 | 0 | 0 |
| Godot base | 214 | 0 | 0 |
| Godot VS-001 | 73 | 0 | 0 |
| Godot VS-002 | 72 | 0 | 0 |
| Godot VS-003 | 260 | 0 | 0 |
| Godot VS-004 | 256 | 0 | 0 |
| Godot VS-005 | 351 | 0 | 0 |
| Godot VS-006 | 1,054 | 0 | 0 |
| 회귀 합계 | **2,551** | **0** | **0** |
| UI budget (별도) | 14 | 0 | 0 |

Godot 4.7.2 각 runner를 `--headless --path litigation-skeleton --script <runner>`로 실행했다. 경로는 base `tests/run_regressions.gd`, VS-001 `vertical_slice/tests/run_slice_regressions.gd`, 나머지 `vertical_slice/tests/run_vs002_regressions.gd`부터 `run_vs006_regressions.gd`다. `--headless --path litigation-skeleton --quit-after 3` 시작 검사도 exit 0.

기존 100개 Node assertion 경로를 유지했다. 전체 goals의 순열을 만들던 목격자 fixture 두 곳은 새 증인의 질문까지 섞지 않도록 witness로 한정했다. v0.5의 서지훈 11개 Inference, responseRules, 기존 답변 및 resolutionRules를 이전 커밋과 직접 비교하여 변경 없음을 확인했다.

수정 과정에서 기존 record-only 테스트가 잘못된 UI plan ID의 영향을 받는 문제를 발견해 평가 scope를 증인의 authored plan에서 정하도록 고쳤다. 기록을 재료로 이동하면서 생긴 focus 복귀/중복 selector 문제도 수정했다. 브라우저 시작 시 한 차례 초기 전략 selector timeout이 발생했고 재실행 및 최종 회귀는 통과했다. 최신 결과만 위 표에 집계했다.

## 요청된 10개 질문에 대한 답

1. **엔진을 얼마나 수정했는가?** Git 기준 core.js +26/-13줄, procedure.js +31/-12줄, service +24/-9줄이다. 압축된 코드 줄 수이므로 변경 난이도를 뜻하지는 않는다. 주요 의미 변화는 ownership/평가 scope, 증인·Thread 상태 전환, 선택 근거 coverage다. Inference 매칭과 response rule matcher를 새로 만들지 않았다.
2. **fingerprint 전용 하드코딩이 생겼는가?** engine/service에 fingerprint·증인·Proposition ID 분기 없음. 사건 전용 ID는 data/UI 테스트에 있고, 새 감식 경로의 모든 persistent ID를 바꾼 fixture도 통과한다. 예전 조명 foundation 문구 일부는 기존 procedure engine에 남아 있어 완전한 콘텐츠 분리를 주장하지 않는다.
3. **다른 논증이 기존 engine으로 표현됐는가?** 시점+공용과 시점+이전 기회가 다른 문장/강도를 만들고, 세 전제의 강한 연결과 Press 인정도 같은 matcher로 처리한다. 검출 사실을 없애는 방식 대신 추론 연결의 한계를 남긴다.
4. **더 신문하는 느낌인가?** 의도 선택 뒤 실제 질문과 답변을 함께 보여주고, 현재 방향에 집중하며, 기록에서 논점을 구성하도록 바꿨다. 구현·화면 검토상 흐름은 명확해졌지만 실제 플레이어의 몰입 개선은 사용자 테스트 전에는 단정하지 않는다.
5. **여전히 순서대로 버튼을 누르는 부분은?** 작성된 사실 질문은 사용 후 사라지며 감식 답변도 고정이다. 감식 자료를 모두 모으는 플레이는 여전히 버튼 소진처럼 느껴질 수 있다. 이번 버전에서 랜덤 분기나 긴 대사를 넣어 감추지 않았다.
6. **Thread는 선택인가 장식인가?** 현재 방향, 가능한 의도, 후속 질문 종료/이동을 실제 상태로 가진다. 조명 follow-up에서는 기록 결과가 달라진다. 그 밖의 Thread는 주로 질문을 묶는 내비게이션이며 추가 전략 보너스나 강제 순서를 만들지 않았다.
7. **Follow-up Stop은 자연스러운가?** 조명 답변 직후 광원까지 확인/다른 논점으로가 나타난다. 중단 시 간판 불빛이 생기지 않고 다른 방향을 계속할 수 있다. 전체 신문 Stop과는 별도이며 실제 두 경로를 검증했다. 자연스러움의 사용자 평가는 남는다.
8. **복수 Basis는 논증인가 체크리스트인가?** 현재 결론 질문에 최대 두 근거를 붙인다. 감식 보고서 또는 실제 시점 기록과 단순 접근 기회는 다른 범위를 정당화한다. 선택 refs가 그대로 보존된다. 다만 한 장면의 authored mapping이므로 반복하면 통과 답을 외울 수 있는 한계는 있다. 모든 후보를 선택하도록 요구하지 않는다.
9. **삭제 가능한 새 UI는?** 중복 토큰 은행, 각 절차 event의 개별 목록 줄, Thread 설명·완료 표시·진행률·추천 행동을 제거했다. 남은 context 안내는 빈 논점 또는 모바일 기록 열기 때만 보인다. 실제 질문은 답변의 의미를 이해하는 데 필요해 유지했다. 상세 감사는 UI_TEXT_AUDIT.md.
10. **다음 시스템으로 넘어가도 되는가?** 이 두 패턴의 최소 재사용성은 확인했다. 범용화를 이유로 더 큰 engine 재설계는 권하지 않는다. 다음 시스템은 별도 요청/설계·review 뒤 진행할 수 있다. 다만 사용자 플레이테스트와 독립 review가 남으며, 여러 Plan이 같은 Proposition을 공유하거나 여러 증인의 종합 판단이 필요해질 때 ownership 모델은 다시 검토해야 한다. 이번 작업은 v0.7/다음 VS를 시작하지 않는다.

## UI 예산

동일 장면 desktop 기본 167→185자, 논점 183→205자. 높이는 둘 다 1080px 유지. mobile 기본 1216→1148px, 논점 1231→1272px. 실제 질문·증인 선택을 포함한 수치다. +30자/높이 +10% 이내라는 표본 예산을 통과했다. 누적 사건 기록의 모든 상황에서 같다고 주장하지 않는다.

## Fixture / injected / TBD

- 주신문·질문·답변·Inference·근거 coverage·판사 ruling은 authored data. 과학 분석·법률 reasoning·완전한 상대 AI가 아니다.
- strict 판사는 고정 test fixture로만 주입한다. 새 판사 선택 UI 없음.
- 감식 자료는 처음부터 준비된 사건 자료다. 별도 획득·증거능력 심사 없음.
- 증인당 Plan 하나, Proposition당 소유 Plan 하나다. 공유 전제, 종합 verdict, 다수 전문 증인, 지속 저장은 TBD/미구현.
- 초심자 플레이테스트·독립 Reviewer PASS는 아직 없다. 자체 scope/diff 검토를 독립 review라고 표시하지 않는다.
- formal Godot litigation integration, 세 번째 증인, Opening/Closing/Verdict, 배심원, 민사, 협상/항소, 관계/직원 시스템은 건드리지 않았다.

## Handoff

scoped Git diff와 whitespace를 검토하고, 이 작업의 파일만 한 로컬 커밋으로 저장한다. 기존 `.agent/scripts`/`.agent/context` 변경은 제외한다. push하지 않는다. 다음 작업은 root DESIGN.md와 그 작업의 새 contract부터 읽는다.
