# 실험 결과 / Review packet

2026-10-08. 브랜치 `task/courtroom-core-loop-lab`. 구현·자동 검증 완료, **사람 플레이테스트 미완료**. 병합하지 않는다.

## 목적과 변경

법정 전체 절차 대신 행동 → 상대 반박 → 논증 수정의 반복을 플레이 가능한 독립 웹 실험으로 만든다. 기존 B동 창고 상해 사건의 인물/두 쟁점을 참조하고 기존 코드 의존성 없이 구현했다.

추가 파일: data.js(사건·대사), engine.js(순수 전이·서비스·기록·투영), app.js/UI·index.html·style.css, serve.js, package.json, tests/engine.test.js, tests/browser.test.js, README/RULES/REPORT/REVIEW_PACKET/test-results.log. 별도 작업 계약 `.agent/tasks/COURTROOM-CORE-LOOP-LAB.md` 추가. 기존 데모·Godot·Accepted 문서·루트 리뷰 문서 수정 없음.

## 완료 기준과 근거

- 두 쟁점·한 장면·6공방: 구현. 주력 선택, 상대 주장, 질문/증거/인정, 상태 기반 반박, 강화/축소/전환, 기록 기반 복기.
- 복수 경로: 식별/칼 모두 두 출처의 순서를 바꿔도 넓은 주장 성립; 양쪽 좁은 주장 전략도 목표 달성. 자동 검증됨. 깊이·동등한 재미는 미검증.
- 비용·회복: 집중/공방 비용과 상대 대비 사전 표시. 부족하면 무료 기록 정리로 회복. 축소/인정은 되돌릴 수 없다고 안내.
- 상태/기록: 실패 시 상태·명령 로그 불변, 고유 append-only ID, 동일 명령 replay 동일 결과. 같은 출처 반복 사용 불가. 강화는 기존 출처 상한 회복이며 별도 증거/점수 생성 없음.
- UI: 첫 화면 안내, 용어 툴팁·설명, 반응형, 키보드 포커스, 6개 브라우저 완주 조합. 툴팁이 버튼을 가리는 결함을 수정 후 통과. 실제 화면 스크린샷 확인.
- 5–10분: 읽기/복기를 포함한 목표만 설정. 사람 측정 미완료; 빠른 플레이는 훨씬 짧을 수 있다.
- 기존 회귀 전부 통과: **미충족**. 아래 실패는 수정하지 않은 기존 데모에서 발생. 독립 프로토타입은 기존 코드/서버를 import하지 않는다.

## 테스트 실행 결과

- `core-loop-lab: npm test` — 13 tests / 0 failures / exit 0. 내부에 250개 결정적 경로 검사 포함.
- `core-loop-lab: npm run test:browser` — 108 checks / 0 failures / exit 0. HTTP/file, desktop/mobile, broad/narrow/empty. 테스트 Playwright는 번들 NODE_PATH 사용.
- `courtroom-prototype: npm test` — 247 tests / 0 failures / exit 0.
- `courtroom-prototype: npm run test:browser` — 앞 8개 스위트 591 checks 통과. browser-full-flow에서 `Record sheet returns focus to rebuilt opener` 실패, 전체 exit 1. 단독 재실행에서도 재현.
- `courtroom-prototype: node tests/browser-trial.test.js` — `desktop/acquit: no page errors`, 리소스 404 감지로 exit 1. 기존 코드 변경 없음.
- `courtroom-prototype: npm run test:budget` — ui-budget 14 checks 통과. ui-flow-budget이 같은 full-flow 포커스 실패로 exit 1. 최초 NODE_PATH 누락은 수정해 재실행한 결과다.

## 새 규칙·한계

새 실험 규칙 전부 [RULES.md](RULES.md)에 명시. 상대는 두 상태의 결정적 authored 반박이지 범용 AI가 아니다. 모든 자료는 fixture이며 생성/수사/증거능력/판결 추론을 구현하지 않는다. 저장·불러오기 없음. 판세는 수치 대신 언어로 표시.

**가장 큰 재미 위험:** 두 공방에 넓은 주장을 완성하고 남은 공방을 회복으로 넘길 수 있다. 상대가 이미 완성한 논증을 다시 공격하지 않아 후반 긴장이 약할 수 있다. 이것을 자동 테스트 통과로 재미가 검증된 것처럼 주장하지 않는다. 질문과 증거 각 하나라 재플레이 다양성은 제한적이며 전술을 이해한 뒤 수순으로 느낄 가능성이 있다. 공방 수를 늘리거나 범용 설계로 덮지 않고 사람 반응을 먼저 받는다.

## 사람 플레이테스트 질문 (3개)

1. 어느 선택에서 상대의 다음 반응을 예상해 계획을 바꿨나요? 기억나는 순간이 없다면 무엇이 자동 선택처럼 느껴졌나요?
2. 일부 인정/축소가 지키기 위한 선택으로 느껴졌나요, 손해 없는 정답처럼 느껴졌나요? 포기한 범위를 설명할 수 있나요?
3. 몇 분 걸렸고, 언제 결과가 이미 정해졌다고 느꼈나요? 다른 쟁점 또는 다른 범위로 한 번 더 하고 싶은가요?

추가 설계/제품 방향은 미결정. 기존 시스템 통합, 자동 병합, 다음 단계 구현은 수행하지 않았다.
