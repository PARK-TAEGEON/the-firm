# DEMO-001 첫인상 개선 Review Packet — 2026-10-07

목적: 명확한 사건·인물 소개, 1회 브리핑, 점진 공개, 모바일 패널 전환. 자체 점검이며 독립 Reviewer PASS를 대신하지 않는다.

## 이번 추가 변경 파일

- data/demo-separated-moments.js: 표시명·정민호(38세)·브리핑 presentation 데이터. trial 정의 그대로.
- data/demo-daily-cases.js: 절도 혐의 사건 제목 명확화. 임대차 제목은 점검 후 유지.
- services/demo-session.js: 표시 데이터 projection·사건 파일 표시명만 연결. 공판 명령/판정/기록 쓰기는 그대로.
- demo.html: 탭 제목·모바일 패널 영역·native dialog.
- ui/trial-demo-app.js: 브리핑·재열람·인물 표시·카드/근거/조서/복기 disclosure·증거 팝업·패널 전환·새 판 초기화.
- ui/trial-demo.css: 위 표시·모바일·포커스 스타일.
- tests/demo-browser.test.js: 브리핑·모달·키보드·기록 불변·펼침/유지/초기화·패널·가로 넘침 검사.
- demo/RULES.md §9, REPORT.md, REVIEW_PACKET.md, test-results.log: 이번 표시 규칙과 검증 갱신.

앞선 사용자 요청의 변경 파일은 아래 이전 packet에 보존했다. 그중 engine/trial.js·services/trial.js·trial.html은 전체 작업에서 무변경이다.

## 불변 조건·검증

자료 열람·브리핑·탭·펼침은 공판 명령을 실행하지 않고 기록·판정을 변경하지 않는다. 미열람 증거는 공개하지 않는다. 강조는 service가 제공한 현재 사용 가능성만 읽는다. 진행 중 펼침 유지, 새 판 초기화. 폼·팝업은 키보드 접근 가능하며 모달 닫기 후 포커스를 복구한다.

node --test tests/demo.test.js: 21 / 0 / 0. node tests/demo-browser.test.js: 1002 / 0 / 0. npm test: 247 / 0 / 0. node tests/browser-trial.test.js: 217 / 0 / 0 (tests/checks, failures, exit). 합계 1487 / 0 / 0. git diff --check 및 diff 검토 완료. 명령 환경은 test-results.log.

고정 사건·대사·합의·양형은 authored fixture. 증거는 기존 발췌문만 열람. 사람 플레이테스트·독립 리뷰·커밋·병합 미실시. 판정 규칙·기록·다음 VS·범위 외 파일 변경 없음. 이전 P2의 설계 판단은 계속 보류.

---

# DEMO-001 수정 Review Packet — 2026-10-07

목적: 리뷰 P1-1(방법 a)·P1-2·P1-3·P3 복기 오류, 요청 문구·시작 안내·플레이테스트 키트 수정. 구현자 자체 점검이며 독립 Reviewer PASS를 선언하지 않는다.

## 변경 파일

| 파일(courtroom-prototype 기준) | 변경 |
| --- | --- |
| data/demo-separated-moments.js | 이의 통과 설명·재면담 복기 조건/모순 문구·용어·재주신문·난이도 안내 |
| data/demo-ko-pack.js | 주문 낭독·증인 호출·절차 표시·양형 표기 |
| services/demo-outcome.js | 실제 기록 기반 통과 이의·판결 근거별 놓친 준비·중복 제거·재면담 처리·주문 projection |
| services/demo-session.js | 원본 보존 displayRecords·데모 오류 용어 치환 |
| ui/trial-demo-app.js | 5칸 복기·주문 표시·표시 기록 사용·문구·요약 토글 |
| ui/trial-demo-text.js | 표시 전용 을/를 함수(신규) |
| demo.html | 표시 함수 스크립트 로드 |
| tests/demo.test.js | P1/P3 양방향·출처·기록 불변·조사 회귀 6개 |
| tests/demo-browser.test.js | 3경로 추가·모바일 전 경로 file://·수정 복기와 문구 확인 |
| demo/RULES.md | 표시 규칙 §8·현재 용어 |
| demo/REPORT.md | 요청별 수정·계약 기준·결과·한계 |
| demo/REVIEW_PACKET.md | 이 인계 문서(신규) |
| demo/test-results.log | 최신 검증 요약(신규) |
| ../docs/playtest/PLAYTEST-KIT.md | 요청한 운영·기록·질문·5인 집계 보완 |

## 강제되는 불변 조건

복기는 실제 기록에 연결된다. 통과시키지 않은 이의는 통과했다고 쓰지 않는다. 조사한 재면담을 미수행으로 설명하지 않는다. 무죄·공소기각에 패소 근거처럼 놓친 준비를 표시하지 않는다. 유죄도 근거 쟁점만 표시한다. 동일 카드의 준비 안내는 한 줄이다. 표시 문구 변경은 원본 기록·effects·질문 시간·points를 바꾸지 않는다.

## 검증

실행 명령과 환경은 REPORT와 test-results.log 참조. node --test tests/demo.test.js 21/0/0, node tests/demo-browser.test.js 578/0/0, npm test 247/0/0, node tests/browser-trial.test.js 217/0/0 (checks 또는 tests / failures / exit code). 합계 1063 / 0 / 0. 최종 조사 수정 뒤 관련 tests 7개·demo browser 578 checks 재확인.
기존 원자성 테스트는 실패 명령이 세션·공판 상태를 오염시키지 않음을 확인한다. git diff --check 및 변경 diff 검토 완료. 금지 파일 engine/trial.js·services/trial.js와 trial.html은 무변경.

## 남는 사항과 범위

고정 사건·대사·합의·양형은 authored fixture. 법률 검수 unverified는 그대로이며 새 법률 규칙은 만들지 않았다. 사람 플레이테스트·독립 리뷰·커밋·병합은 미실시. 리뷰 P2-1/P2-2/P2-6의 규칙 판단은 건드리지 않았다. 다음 VS 작업 없음. Owns 및 사용자 명시 문서 외 수정 없음; 공용 보고서는 보존하고 demo/ 아래에 인계한다.
