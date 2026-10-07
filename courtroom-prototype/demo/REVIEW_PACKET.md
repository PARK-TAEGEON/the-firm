# DEMO-001 장소 사진·기본 초상 Review Packet (2026-10-07)

목적: 기존 사진/실루엣 연결, 정상/실패 대체 표시 검증. 표시만 변경.
변경 파일:
- data/demo-locations.js: 회의실 라벨/상대 사진 URL.
- data/demo-portraits.js: default URL.
- ui/trial-demo-consultation.js: byId 없으면 default.
- ui/trial-demo-app.js: 법정 ID별 초상과 로드 실패 initial.
- ui/trial-demo.css: 원형 cover, 상담 초상 크기.
- tests/demo-browser.test.js: 실제 에셋/스냅샷, file:// 검증.
- tests/demo-art-browser.test.js: 이미지 실패/없음/복구/byId/테두리/원형/크기/넘침 24 checks.
- demo/REPORT.md, RULES.md §13, REVIEW_PACKET.md, test-results.log.

커밋 후보에 assets/ 전체(사진·실루엣·CREDITS)를 포함해야 한다. 현재 미추적 에셋 SHA-256 작업 전후 동일, 수정/커밋/stage 없음.
새 invariant: byId → default, 실패 → initial; optional art는 판정/기록에 영향 없음.
명령/결과: node --test tests/demo.test.js 22, node tests/demo-browser.test.js 1647, node tests/demo-art-browser.test.js 24, npm test 247, node tests/browser-trial.test.js 217. 합계 2157 tests/checks / 0 failures / 모든 exit 0.
git diff --check·diff 검토 완료. engine/trial.js/services/trial.js/trial.html/demo-outcome 무변경.
Fixture: byId 테스트 GIF/사진. 실제 사용자 에셋은 원본 유지.
제한: serve.js의 SVG MIME 미지원으로 데모는 file:// 검증. HTTP 호스트는 image/svg+xml 설정 필요. 서버 수정은 범위 밖이라 미실시.
단일 HTML 묶기는 리뷰어 담당, 사람 플레이테스트·독립 리뷰 미실시. 추가 게임 규칙·범위 밖 변경·다음 단계 작업 없음.

---

# DEMO-001 UI 다듬기 1차 Review Packet (2026-10-07)

목적: 상담 진행을 명시하고 준비/반대신문 화면 정보를 줄인다. 표시만 변경.

이번 수정 파일:
- ui/trial-demo-consultation.js: 계속 버튼, 초기/진행 포커스, 마지막 버튼 교체.
- ui/trial-demo-app.js: 신참 기본값, 제목/안내, 합의 disclosure/배치, 준비 단계 메모/탭 숨김, 범례, 반대신문 표시.
- ui/trial-demo.css: 준비 2열/메모 숨김, 합의/버튼 스타일, 내용 높이 반대신문과 글자 크기.
- tests/demo-browser.test.js: 새 표시 동작·포커스·접힘/펼침·메모 단계·신참/상단 검증, 단계별 스크린샷.
- demo/REPORT.md, RULES.md §12, test-results.log, REVIEW_PACKET.md.
기존 미커밋 인물/상담 도입 데이터·서비스·단위테스트 변경은 유지. 이번에는 변경하지 않았다. 사용자 assets/ 미수정.

불변: 판정·원본 기록·수치·기존 결과 기대값. 금지 engine/trial.js/services/trial.js 및 trial.html 무변경.
실행: node --test tests/demo.test.js 22, node tests/demo-browser.test.js 1595, npm test 247, node tests/browser-trial.test.js 217.
합계 2081 tests/checks, failures 0, 모든 exit 0. git diff --check 및 diff 자체 검토 완료.
스크린샷: tests/artifacts/ui1-before-*, ui1-after-* (기존 ignore 대상). REPORT에 단계별 전/후 링크.
Fixture/injected: 기존 authored 상담·증거·결과와 이미지 fixture 유지. 새로운 게임 규칙 없음.
미구현/TBD: 사람 플레이테스트·독립 리뷰. 설계 판단으로 건드리지 않은 부분: 판정/기록/수치 전부.
범위 외 수정·다음 단계 작업 없음. 커밋·stage·push 없음.

---

# DEMO-001 몰입 라운드 후속 Review Packet (2026-10-07)

목적: 인물·생활 사정을 표시하고 무사진 상담 창의 빈 공간을 제거한다. 판정/기록/수치 불변.

이번 후속 변경 파일:
- data/demo-separated-moments.js: presentation 인물/사정/8줄 상담/메모/결과 부연.
- services/demo-session.js: 조회 projection에만 인물 이름/역할/initial 적용.
- ui/trial-demo-app.js: 화자·법정·합의·결과·메모 이름/사정 표시.
- ui/trial-demo-consultation.js, ui/trial-demo.css: 사진 유무/실패에 따른 compact 창과 gradient.
- tests/demo.test.js: 표시 데이터 변경 시 10경로 raw 기록/전체 outcome 동일.
- tests/demo-browser.test.js: 법정/조서 이름, surname, 상담/합의/결과 사정, 창 위·아래 여백 검증.
- demo/REPORT.md, RULES.md §11, test-results.log, REVIEW_PACKET.md: 검증/규칙/인계.

기존 미커밋 상담 도입 파일(data/demo-locations.js, data/demo-portraits.js, demo.html 포함)은 유지한다.
제외: ui/trial-demo-art.js, ui/art/consult-scene.svg 미사용·미수정·미stage.

불변 조건: 이름/사정/초상은 판정에 영향 없음. persistent ID와 원본 기록 보존. 기존 결과 5종 및 베테랑 무죄 불가 유지.
검증 명령: node --test tests/demo.test.js (22), node tests/demo-browser.test.js (1460), npm test (247), node tests/browser-trial.test.js (217).
합계 1946 tests/checks / failures 0 / exit 0. 환경과 개별 결과는 test-results.log. git diff 검토·금지 파일 무변경 확인.

Fixture/injected: authored 인물·사정·상담, 이미지 검증용 GIF. 실제 사진/초상·pool 자동 배정·계약 simulation은 없음/TBD.
설계 판단을 위해 건드리지 않은 것: 판정·수치·기록·게임 규칙 전부. 추가 stage 없음, 범위 외 수정 없음.
사람 플레이테스트·독립 리뷰·커밋·병합은 미실시. 커밋은 사람이 한다.

---

# DEMO-001 B — 첫 상담 장면 Review Packet (2026-10-07)

목적: 시작 브리핑을 장소 배경+하단 대화창 상담으로 교체. 판정/기록 변경 없는 표시 작업.

## 이번 변경·커밋 후보 파일 (커밋은 사람이 수행)

- data/demo-locations.js (신규): office_lounge, 사무실 응접실, image 선택.
- data/demo-portraits.js (신규): 빈 byId/pool; ID별 URL 구조, pool 예약만.
- data/demo-separated-moments.js: presentation.consultation 데이터(7대사·2할 일·화자 ID).
- demo.html: 상담 dialog 및 위 매니페스트/상담 UI 스크립트 로드.
- ui/trial-demo-consultation.js (신규): 로컬 진행 상태·대체 이미지·전체 보기·접근성. service 호출 없음.
- ui/trial-demo-app.js: start 시 상담 열기; 사건 메모는 참고용만 유지.
- ui/trial-demo.css: 장소/오버레이/초상/하단 대화창과 모바일 스타일.
- tests/demo-browser.test.js: 상담·이미지 매핑·pool 미사용·키보드·기록 불변 회귀.
- demo/RULES.md §10, REPORT.md, REVIEW_PACKET.md, test-results.log: 규칙·검증·인계.

**커밋 제외:** 기존 untracked ui/trial-demo-art.js, ui/art/consult-scene.svg. 미사용·미수정·미stage. 이 목록에 포함하지 않는다.

## 불변 조건·테스트

상담은 기존 raw 공판/세션 기록과 판정에 영향 없음. initial 부인 유지. 이미지가 없어도 진행 가능. 그림은 인물 ID만으로 선택하며 pool은 읽지 않는다. 상담 종료는 마지막 버튼으로만, 종료 포커스는 #phaseTitle. 기존 증거/메모 팝업은 별개 동작 유지.

node --test tests/demo.test.js 21/0/0, node tests/demo-browser.test.js 1218/0/0, npm test 247/0/0, node tests/browser-trial.test.js 217/0/0 (tests/checks / failures / exit). 합계 1703/0/0. 환경은 test-results.log. 금지 파일·trial.html·demo 판정 서비스 무변경. git diff --check와 diff 자체 검토 완료.

상담 대사는 authored fixture. 실제 사진·태그 기반 자동 배정·추가 게임 규칙은 없음. 사람 플레이테스트·독립 리뷰·커밋·병합은 미실시. 요청 범위 외 수정과 다음 VS 작업 없음.

---

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
