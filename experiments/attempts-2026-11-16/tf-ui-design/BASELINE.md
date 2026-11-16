# TF-UI-001 · 기준선과 G0 범위

조사일: 2026-10-13 (Asia/Seoul). 이 문서는 G0/G1 디자인 검증 기준이며 게임 UI 구현 승인이 아니다. 현재 G3/G4는 닫혀 있다.

## 1. 기준 버전과 작업 소유

| 용도 | 고정 기준 | 재확인 결과 |
| --- | --- | --- |
| 런타임 | [PR #12](https://github.com/PARK-TAEGEON/the-firm/pull/12), `task/plan-demo-001`, `d6fa4a303691f60eedf79b829780f443f915e245` | 2026-10-13 조사 시 SHA 동일, Draft/open/unmerged |
| 설계 참고 | [PR #11](https://github.com/PARK-TAEGEON/the-firm/pull/11)의 `docs/TRIAL-DESIGN.md` §1–5, `6888997ed3c49c8e11cd419389cb6f0982712598` | 2026-10-13 조사 시 SHA 동일, Draft/open/unmerged |
| G0 조사 checkout | `task/tf-ui-001-audit` | runtime HEAD 그대로, 원본 게임 코드 수정 없음 |
| 디자인 작업 checkout | `task/tf-ui-001` | runtime HEAD에서 분리, 부모 계약의 Owns만 수정 |

두 PR의 최신 상태/CI 조회는 스프린트 조정자가 수행하고 이 감사에 전달했다. SHA 변경이 없으므로 기준 변경 diff는 없다. PR #11을 런타임 브랜치에 병합하지 않았다. `docs/CURRENT.md`의 v0.10 설명은 문서 시점의 상태이며 이번 네 단계 흐름의 런타임 입구는 PR #12 `plan-demo.html`이다.

원래 `C:/Users/Admin/Documents/ChatGPT/The Firm`의 `task/gen-001` 작업 폴더, 기존 미커밋 변경, main, DEMO-001 원본, 다른 실험 브랜치를 건드리지 않는다. `start-vs.ps1`를 사용하지 않으며 가짜 VS나 선행 게이트 우회가 없다. 작업 계약은 `.agent/tasks/TF-UI-001.md`; 소유 범위는 계약 파일과 `docs/sprints/TF-UI-001/**`이다. G1은 고정 공개 fixture와 별도 목업만 만들며 기존 런타임 파일을 수정하지 않는다.

## 2. 실제 실행 입구와 아키텍처

`courtroom-prototype/`에서 `npm start` 후 `http://127.0.0.1:4173/plan-demo.html`을 연다. 원본 `demo.html`, `index.html`, `trial.html`은 독립 진입점이며 자동 교체하지 않는다.

`plan-demo.html` → `ui/plan-demo-app.js` → `services/plan-demo.js` → `services/demo-session.js` / `services/demo-trial.js` → 기존 `engine/trial.js`. 최종 사건 결과는 `services/demo-outcome.js`와 `data/demo-ko-pack.js`를 거친 session `outcome`이다. 화면은 서비스 결과를 읽는다. G1 목업은 이 체인을 재구현하거나 게임 서비스를 호출하지 않는다.

상담은 기존 `ui/trial-demo-consultation.js`가 `data/demo-separated-moments.js`의 `presentation.consultation`을 표시한다. 장소는 `demo-locations.js`의 `office_lounge`, 인물은 `demo-portraits.js`의 기본 SVG/initial fallback을 사용한다. 실제 인물별 초상은 현재 `byId:{}`이며 새로 존재한다고 주장하지 않는다. 기존 배경 사진과 기본 인물 표식을 시안에 재사용할 수 있다.

## 3. 보존할 기존 동작과 실제 출처

| 화면/동작 | 기준 동작 | 상태의 실제 출처 |
| --- | --- | --- |
| 첫 상담 | 원문 8개 대사 순차 보기, 전체 보기, 마침 후 계획 진입. 처음 접촉 부인 대사를 재면담 진술로 바꾸지 않음 | 사건 데이터 `presentation.consultation.lines`; 상담 컴포넌트의 로컬 index/all. CourtRecord와 별개 |
| 상담 재생 | 계획에서 다시 열고 닫아도 수정한 현장 동선 선택 보존 | `ui/plan-demo-app.js`의 `useLayout`; 상담 close는 plan으로 돌아올 뿐 새 trial 실행 안 함 |
| 계획 검토 | 검찰의 주장과 담당 변호사의 검토를 분리. 밀침 인정, 상해 연결 다툼. 기본 영상/진료신문 고정, 현장 동선만 포함/제외 수정 | `OWNED_PLAN`(`S_SIG_CONTACT`, `F_SIG_CAUSE`), `PREP` 4종 및 기존 사건 자료. 화면 체크는 내부 계획 선택 |
| 수정 취소/저장 | 취소는 `beforeEdit`로 복원, 저장은 현재 `useLayout` 유지 | UI의 편집 사본. 아직 외부 제출/법정 발언/증언 아님 |
| 계획 승인 | `FirmPlanDemo.play({useLayout})` 한 번으로 기존 사건 세션을 새로 만들어 준비→증거 의견→신문→종결→실험 판결까지 수행 | service command의 실제 반환. 승인 자체의 체크는 증거가 아님 |
| 법정 화면 | 승인 호출이 끝난 후 완료된 법정 기록을 표시. 질문마다 개입하지 않음 | `report.records`의 순서와 `lines`; 실시간 시뮬레이션 재생 아님 |
| 영상·진료 수행 | 두 `approach`가 생성되고 `blockedReason`이 없을 때 수행 | `results.video`/`results.medical`, 원 record의 kind/refId/lines/cardsUsed |
| 현장 동선 수행 | 포함했고 실제 재반대 기회에서 `RH_SIG_CAUSE`의 `rebuttal`이 기록되고 차단되지 않은 경우 수행 | `results.layout`; 포함 자체가 수행을 증명하지 않음 |
| 답변과 반론 | 말한 사람과 문맥을 붙인 실제 대사. 검찰 반론이 증인 답변에 합쳐지지 않음 | `records[].lines[].speaker/text`. `source:'defense'` record 안에도 검찰 발언이 있을 수 있음 |
| 판결/복기 | 원본 DEMO의 실험 판정과 실제 기록을 별도 표시 | `report.outcome`의 judgment/offense/sentence/issues. 원본 간이 법률·양형 규칙 |
| 재비교 | 반대 계획/현재 계획으로 돌아가 별도 실행. 기록 화면 재진입이나 렌더링 자체는 실행 아님 | UI page/report와 명시적 approve action |

동일한 공개 내용으로 A/B/C를 비교한다. 원본 대사는 그대로, 자료 요약은 원문 경계를 보존한다. 작가용 진실, 미래 답변, 상대 비공개 정보를 상담·계획 단계에 노출하지 않는다. `INV_SIG_CLIENT`, `INV_SIG_SEQUENCE`, `INV_SIG_MEDICAL`, `INV_SIG_LAYOUT`의 검토 완료 스냅샷에서 알려진 자료만 계획에 쓴다. 실제 runtime은 승인 안에서 이 네 조사를 수행하며 계획 화면의 '검토 완료'는 기존 실험 전제다.

### 고정 비교 경로

| 항목 | 현장 동선 포함 | 현장 동선 제외 |
| --- | --- | --- |
| 신참 검사/기본 입장/주력 쟁점 | 동일 | 동일 |
| 영상·진료 `approach` | 모두 수행 | 모두 수행 |
| 현장 대응 | `rebuttal`, `RH_SIG_CAUSE` | `rebuttal_pass`, `RH_SIG_CAUSE` |
| 원 기록 개수 | 50 | 50 |
| 원본 DEMO 최종 결과 | 유죄 · 폭행 — 벌금 100만 원 | 유죄 · 상해 — 징역 6월에 집행유예 1년 |

포함 경로에서 원시 trial `verdict.outcome`은 `not_guilty`지만 이는 엔진의 상해 본죄 결과다. session의 최종 `outcome`은 축소사실 폭행까지 평가한다. UI가 원시 마커를 '무죄'로 번역하면 잘못이다. 판결 제목/주문은 session `outcome`, 발언 기록은 원 `records`로 구분한다. 원본 화면이 양쪽 결과를 모두 `judgment.label`인 '유죄'로만 요약하는 한계는 정보 설계에서 개선 후보이며 엔진 판정 변경이 아니다.

## 4. Godot에서 참고한 흐름과 구분

Read only 범위인 `.agent/tasks/VS-003.md` Goal/Implement/Required Regression/UI Scope와 `investigation_service.gd`의 결과/획득 projection, `.agent/tasks/VS-005.md` Goal/Implementation Scope/Acceptance와 `submission_service.gd`의 CourtRecord materialization/projection만 참고했다.

- Godot VS-003: 조사 작업 실행 → authored InvestigationResult → 명시적 AcquisitionEvent → 허용 source scope의 자료 열람. 조사 계획/실행/자료 획득을 별개로 표시하고 조회가 기록을 만들지 않는 점을 참고한다. 조사 완료를 CourtRecord나 법원 판단으로 표시하지 않는다.
- Godot VS-005: FinalizedDocument → 명시적 SubmissionAttempt → 별도 procedural result → 허용된 CourtRecordEntry. 거절 이력도 남기고 제출 결과와 실체 판단을 분리하는 기록 표기를 참고한다.
- 웹 PR #12는 이 Godot API나 UI를 호출하지 않는다. 웹의 카드·append-only trial record·session outcome은 별도 실험 구현이다. 이 스프린트는 엔진 교체/Godot 폐기/두 시스템 통합 결정이 아니다.
- Godot litigation-skeleton의 injected-input validation을 범용 법률 추론, 자동 판결 생성, 항소·증거 적격성, 선례, 업무량, 판사/상대 AI, 커리어·세계 통합, 저장 시스템으로 확대 해석하지 않는다. Godot 개발은 재개하지 않았다.

## 5. 알려진 결함·제약과 미구현

| 관찰 | 기준 근거 | 이번 처리 |
| --- | --- | --- |
| 현장 자료를 일찍 신청하면 `preparedAgainst` 차단; 어댑터가 기존 허용 창에서 지연 신청 | `plan-demo/RULES.md`, `services/plan-demo.js` | 기존 호환 제약을 기록. UI를 위해 절차/판정을 고치지 않음 |
| `minPoints`/특정 질문 순서 의존은 PR #11에서 미해결로 기록 | 설계 참고의 기존 코드 한계 | 새 기본 규칙/정답 수순으로 승인하지 않음 |
| 원본 화면 계획 체크와 수행 체크가 비슷하며 판결 제목이 두 경로 모두 '유죄' | 원본 `ui/plan-demo-app.js` | 시안에서 계획/수행/답변/반론/판단을 텍스트와 구조로 분리 |
| 전체 영역 `aria-live`, 페이지 전환/편집 재렌더 뒤 초점 BODY | 원본 코드, `baseline-browser/results.json` | G1 목업의 포커스 설계에서 해결. 기존 코드 수정 금지 |
| 데스크톱 짧은 높이에서 계획 승인, 두 데스크톱에서 법정→기록 버튼이 긴 내용 아래 | 원본 baseline 화면/측정 | 주요 행동을 시안의 초기 viewport에서 확인하도록 설계 |
| 기존 전체 흐름 브라우저 테스트의 record sheet focus assertion 실패 | `baseline-tests/browser.log`; 같은 실행의 budget 경로에서는 full-flow 187 checks 통과 | 타이밍/경로 의존 가능성을 기록. 기준 실패를 숨기지 않고 기대값 유지; 동일 환경 전후 비교 |
| 기존 trial 브라우저 테스트의 콘솔 404 실패 | `baseline-tests/trial.log`, `trial-network.json`: `/favicon.ico` 404 확인 | 기존 페이지/서버 수정 없이 기준 실패로 격리 |
| 미실행·기회 없음은 원본 record renderer의 상태 분기지만 고정 정상 경로 두 개가 모든 오류를 재현하지 않음 | 원본 `recordItem()` | 상태 갤러리에는 합성 UI fixture라고 표기; 새로운 법정 사건을 만들지 않음 |

전체 판사/상대 AI, 새로운 개입 창, 자동 법률 추론, 새 증인/사진 공방, 비용·능력 보너스·승률, 저장, World/Career/Business 통합은 미구현/범위 밖이다. 합의 상담과 검사 선택도 PLAN-DEMO 고정 경로에서 실행하지 않는다. 간이 결과를 실제 양형기준이나 법률 검수 완료로 취급하지 않는다. 사람의 재미/가독성 검증은 별도다.

## 6. 보호 파일과 해시

정본 목록·원래 SHA256·사후 비교는 [evidence/protected-files.json](evidence/protected-files.json)에 둔다(스프린트 조정자가 생성). 기준 SHA는 위 PR #12이고 Git tracked 파일의 원본 바이트를 기준으로 한다. 새 산출물은 계약 허용 경로 밖에 쓰지 않는다.

최소 보호 범위: Accepted DEC·헌법·root 설계·기존 `/docs`, `courtroom-prototype/data/**`, `engine/**`, `services/**`, `generator/**`, `world/**`, `litigation-skeleton/**`, 기존 상담 컴포넌트/아트/인물·지역 데이터, 원본 `demo.html/index.html/trial.html`, 승인 전 `plan-demo.html`/`ui/plan-demo*`, 기존 모든 테스트, CI 구성. `AGENTS.md`, `WORKFLOW.md`, 기존 계약과 Review Packet도 보호한다. 테스트가 만드는 ignored `courtroom-prototype/tests/artifacts/**`는 실행 산출물로 따로 구분하며 tracked 기대값을 수정하지 않는다.

## 7. 검사 명령과 증거

실행 환경: Windows, Node `v24.19.0`, npm `11.17.0`, 실제 Edge `142.0.3595.94`, Playwright는 번들 런타임의 `NODE_PATH` 사용. 기존 브라우저 테스트는 `msedge`를 실행했다. Node VM smoke를 브라우저 검사로 부르지 않는다.

`courtroom-prototype/`에서:

```powershell
$env:NODE_PATH = 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
npm test
node --test tests/demo.test.js tests/plan-demo.test.js tests/plan-demo-ui.test.js
npm run test:browser
npm run test:trial
npm run test:budget
```

추가 baseline 실제 브라우저는 저장소 root에서 `node docs/sprints/TF-UI-001/evidence/baseline-browser/inspect.cjs`. 1440×900, 1280×720, 390×844에서 8개 대사 순차/전체 보기, 계획 취소/저장, 상담 재생 후 계획 유지, 제외 실행/기록, overflow/콘솔을 조사하고 화면 12장을 저장한다.

정확한 명령·시간·exit는 [baseline-tests/runs.json](evidence/baseline-tests/runs.json), 원본 로그는 같은 폴더의 `*.log`; actual browser 결과는 [baseline-browser/results.json](evidence/baseline-browser/results.json). 모든 기록은 변경 전 SHA에 연결한다. 변경 후 회귀는 부모 작업에서 같은 환경으로 실행하며 기존 실패와 신규 실패를 분리한다.

### 변경 전 실행 결과

| 명령/검사 | 완료된 checks/tests | 실패 | Exit |
| --- | ---: | --- | ---: |
| `npm test` | 247 tests 통과 | 0 | 0 |
| 명시한 demo/plan-demo/UI Node 테스트 | 39 tests 통과 | 0 | 0 |
| `npm run test:browser` | 앞 8개 묶음 591 checks 통과; 뒤 묶음은 중단되어 총수 확정 불가 | `browser-full-flow`: Record sheet returns focus to rebuilt opener, assertion 1건 | 1 |
| `npm run test:trial` | Node 19 tests 통과; 브라우저 전체 total 미출력 | desktop/acquit 콘솔 `/favicon.ico` 404 assertion 1건 | 1 |
| `npm run test:budget` | UI budget 14 + full-flow browser 187 + full-flow budget 61 = 262 checks 통과 | 0 | 0 |
| 추가 원본 plan-demo 실제 브라우저 | 세 크기 합계 36 checks 통과 | 0 | 0 |

명시한 필수 Node 검사 합계는 **286 tests / 0 failures**다. optional 테스트 묶음은 중복 실행을 포함하므로 위 항목을 전부 더해 고유 테스트 수로 보고하지 않는다. 두 기존 브라우저 명령은 baseline에서 실패했다. budget이 내부에서 부른 full-flow 경로가 통과했다는 사실도 함께 보존하며 실패를 무조건 재현 가능한 제품 결함으로 단정하지 않는다.

원본 plan-demo actual browser에서는 세 크기 모두 가로 overflow/콘솔 오류 없이 상담→편집→재상담→제외 실행→기록을 완료했다. 관찰한 초점 소실·버튼 위치는 assertion 합격과 별도의 디자인 부채다. `courtroom-prototype/tests/artifacts/**`에 기존 테스트가 생성한 ignored 파일이 있고, 신규 untracked는 `docs/sprints/TF-UI-001/**`뿐이다. 기존 tracked 파일 diff는 비어 있다.

기준 CI는 [Godot Tests #38350752663](https://github.com/PARK-TAEGEON/the-firm/actions/runs/38350752663), [PLAN-DEMO-001 #38350752670](https://github.com/PARK-TAEGEON/the-firm/actions/runs/38350752670)가 해당 runtime HEAD에서 success로 확인됐다. CI 성공은 실제 브라우저 시각검사나 사람 경험 평가와 별개다.

## 8. G0 판정

### 변경 후 및 무변경 재확인

최종 필수 회귀는 286/0/exit0이다. test:browser는 baseline과 같은 focus assertion, test:trial은 같은 console 404로 실패했다. test:budget도 post에서는 14 checks 뒤 같은 focus assertion으로 중단됐다. 기준 worktree를 수정하지 않고 한 번 재실행한 결과 역시 14 checks 뒤 동일 위치·메시지로 실패했다. 최초 baseline 262 통과와 무변경 재실패를 모두 보존한다: [budget-repeat](evidence/baseline-tests/budget-repeat.json), [post 결과](evidence/post-tests/results.json). 기존 기대값이나 코드를 바꾸지 않았다. 이 결과를 전체 legacy PASS라고 보고하지 않는다.

대상 runtime에 상담→계획→법정→기록이 존재하고, 작업 소유와 공개 표시 출처가 특정됐다. **G0 GO**: 보호 해시 manifest를 결합하여 G1 디자인 비교를 진행할 수 있다. 기존 브라우저 focus 실패/표시 한계는 baseline debt로 남긴다. G0 GO는 게임 UI 구현, 엔진 변경, 자동 병합이나 사람 디자인 승인이 아니다. 사건 진실 누출/모순/범위 충돌이 발견되면 해당 기능은 NO-GO로 고정하고 영향 없는 시안 작업만 계속한다.
