# ARGUMENT-NARROWING-001 실행 보고

2026-10-08 KST · 기준/PR 대상: task/demo-001 @ 288e1e7276a56887f42f7b5f02146c74b583d50d.
구현 브랜치: task/argument-narrowing-001. 구현·자체 검토 완료, 사람 플레이테스트·독립 리뷰·병합 미실시.

## 검토와 구현

최신 원격 데모 HEAD가 기준 리뷰 커밋과 같음을 확인했다. 이전 대화에서 사용자가 제공한 리뷰와 요청은 읽었으나 일부 과거 assistant 답변은 내용 대신 참조 마커만 반환되어 그 설계 세부를 추정하지 않았다.

기존 서비스는 증거 확보/신청, 증거 동의, 신문·재주신문 기록을 보존하지만 최후변론은 세 정적 문구 중 선택이다. 결과는 별도 demo-outcome과 기존 engine/trial이 기록 effects로 계산한다. 이 구조에 기본 비활성 실험만 추가했다.

- 데이터: 실제 기록 종류/ID에 연결하는 사건별 근거·반론·대사.
- 서비스: 강한 주장 선언, 실제 근거 선택을 검증하는 축소 명령, 기록 기반 읽기 모델과 최후변론 조립.
- UI: 기존 모두진술/최후변론/결과 화면에 하나의 논증 편집 영역. 미해결 반론은 노출하고 출처 원문은 펼쳐 읽는다. 수정 뒤 근거 목록은 접어 반복을 줄인다. 다른 최후변론도 접힌 영역에서 선택 가능하다.
- 원래 주장 → 수정 → 검사 응답 → 최후변론의 record ID 연결. 증거·판정 수치 변경 없음.
- 추가 검증에서 같은 탭의 새 판에 과거 근거 ID가 재사용되는 경계를 발견했다. 실험 모드에 부모 세션 번호를 전달해 차단했으며 비활성 동작은 유지했다.

## 실행 결과

Node v24.19.0, Windows, Playwright + 설치된 Edge. 실행 위치는 courtroom-prototype.

| 명령/검사 | 결과 |
| --- | --- |
| npm test | 247 tests, 0 failures, exit 0 |
| node --test tests/demo.test.js tests/demo-profiles.test.js | 33 tests, 0 failures, exit 0 |
| node --test experiments/argument-narrowing/service.test.js | 12 tests, 0 failures, exit 0 |
| node experiments/argument-narrowing/browser.test.js | 104 checks, 0 failures, exit 0; HTTP/file × 1440/390 × 신참/베테랑 = 실제 UI 8회 완주 |
| node tests/demo-browser.test.js | 3,940 checks, 0 failures, exit 0 |
| demo-profiles / demo-procedure / demo-cleanup / demo-art browser tests | 212 / 154 / 122 / 24 checks, 각각 0 failures, exit 0 |
| npm run test:browser | 앞 8개 suite 591 checks 통과; browser-full-flow의 포커스 assertion에서 exit 1 |
| npm run test:budget | ui-budget 14 checks 통과; ui-flow-budget에서 같은 포커스 assertion, exit 1 |
| node tests/browser-trial.test.js (별도 실행) | desktop/acquit의 404 console-error assertion, exit 1 |

완료된 통과 suite 합계 5,453 checks/tests. 실패 suite의 실패 전 통과 assertion과 기준 비교 재실행은 합계에서 제외했다. **전체 기존 회귀가 모두 통과한 것은 아니다.**

두 종류의 기존 실패를 수정 없는 별도 288e1e72 체크아웃에서도 각각 재현했다:

- browser-full-flow / ui-flow-budget: `Record sheet returns focus to rebuilt opener`.
- browser-trial: `desktop/acquit: no page errors ... 404 (Not Found)`.

기존 파일이나 기대값은 이 실패를 숨기기 위해 수정하지 않았다. Chromium headless 실행 파일이 없는 네 데모 suite는 외부 테스트 런타임 어댑터로 `chromium.launch({ channel: 'msedge', ...options })`만 지정해 실행했다. 앱·테스트 assertion은 그대로다. 기본 런타임의 최초 실행 실패와 어댑터 재실행을 구분한다.

새 테스트는 결정성/기록 재구성, 명령 실패의 전체 상태 불변, 미제출·중복·타 기록·이전 판 근거 거절, 과욕 보존, 단계/재수정/수정 없는 제출 거절, 선택한 근거만 변론에 포함, 검사 반론 유지/일부 한정, 대체 최후변론, 기본 비활성, 판정 동일성을 검증한다.

브라우저에서는 모든 행동을 UI로 수행하고 서비스는 읽기 전용으로 관찰했다. 키보드로 수정 실행·포커스 복귀, 가로 넘침 없음, 최후변론 참조, 결과 복기, 플래그 없이 다시 열기, pageerror 없음 확인. 1440/390 스크린샷도 직접 확인했다. 자동 완주는 사람의 이해도나 재미를 검증하지 않는다.

## 대표 경로 관찰

진료+영상 신문, 유효 이의 두 번, 한정 결론, 합의 없음:

| 상대/추가 공방 | 수정 뒤 결과 | 남은 반론 |
| --- | --- | --- |
| 신참, 동선 반박 없음 | 폭행 | 상처 존재·재주신문 |
| 베테랑, 동선 반박 없음 | 상해 | 상처 존재·밀침 영향 배제 불가 |
| 베테랑, 동선 재반대 성공 | 폭행 | 상처는 남음; 재주신문은 일부 한정, 실제 다른 원인 미확정 |

이 차이는 기존 증거 공방 효과다. 같은 증거 기록에서 주장 축소 전후 engine 판정은 동일하고, 기본 모드의 같은 경로와 주문/죄명/양형이 같다. 과한 결론 뒤 수정해도 과욕 효과는 환급되지 않는다.

## 완료 기준 점검

1. 기본 비활성 및 기존 판정 경로 보존: 충족. 기존 engine/data/outcome/tests 변경 없음.
2. append-only 주장/근거/반론/검사 응답/최후변론 연결: 충족. RULES 규칙 1–8 및 새 서비스 테스트.
3. 결정성·원자성·근거 검증·새 판 격리: 충족. 12 tests.
4. 실험 1440/390 완주·검증: 충족. 기존 전체 회귀 통과 조건은 미충족이며 위 두 기존 실패를 기준 커밋에서도 재현.
5. 문서·자체 검토: 충족. draft PR로 전달하며 사람 플레이테스트/병합 결정은 미완료.

## 새 규칙과 한계

새 authored 규칙 전체는 RULES.md에 있다. 일반 법률 추론/검사 AI가 아니며 이 사건의 특정 기록에 연결한 고정 문구와 분기다. 수정 시점은 증거 공방이 끝난 최후변론 직전 1회이며 중간 공방 재설계, 시간 환급, 최종 판정 보너스, 자동 증거 선택, 저장/불러오기는 없다.

강한 주장은 별도 실험 선택으로 공개하거나 기존 과한 결론 질문에서 가져온다. 실험의 대사 구성 품질과 실제 최후변론의 설득력 평가는 사람 확인이 필요하다. 특히 사건의 모든 가능한 반론을 포괄하는 범용 분류기가 아니다. 상처의 존재 자체가 인과관계 입증이라는 뜻은 아니며 UI에서 증언·자료와 재판부 사실인정을 구분한다.

## 다음 플레이테스트

법률 비전문가 3–5명, 설명 없이 기본/실험 순서를 번갈아 배정한다. 신참/베테랑, 동선 없음/재반대 성공, 과욕 후 수정, 수정 없이 유지 경로를 나눠 비교한다. 선택까지 걸린 시간, 근거 선택/원문 열람, 도움 요청, 최후변론 선택과 설명을 기록한다. 외부 참여자 테스트는 아직 수행하지 않았다.

사람에게 물을 질문은 세 개다:

1. “관계가 없다”에서 “입증이 충분하지 않다”로 바뀐 범위와 철회하지 않은 사실을 자기 말로 설명할 수 있는가?
2. 수정 뒤에도 검사가 무엇을 반박하고 있는지, 수정 버튼만으로 결과가 바뀌지 않는 이유를 이해하는가?
3. 근거를 골라 변론을 만드는 과정이 논증을 다듬는 느낌인가, 추가 클릭 절차인가?

답변과 기본/실험 비교 후 유지·수정·폐기는 사람이 결정한다. 재미를 자동 검사 통과로 선언하지 않는다.
