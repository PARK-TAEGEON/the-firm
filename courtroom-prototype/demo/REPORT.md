# DEMO-001 절차 라운드 정리 — 자체 점검 (2026-10-07)

판정 규칙·수치·기존 경로 결과는 유지. 이전 공판 절차 변경 위에 이번 정리를 적용했다. 커밋·stage·push 없음.

## 요청별 전/후

| 항목 | 전 | 후 |
| --- | --- | --- |
| 증거 의견 법률 안내 | 제318조·unverified 표시 | 화면에서 삭제. 팩 값 보존 |
| 최후변론 안내 | 판정에 영향이 없다는 설명 | “재판부에 마지막으로 할 말을 고르세요.” 판정 무관 안내는 판결 후 복기에만 유지 |
| 조사 결과(required) | 세 선택지+별도 보류하고 닫기 | 증거 신청/신청 안 함/보류 세 선택지만. 선택 직후 닫힘, Esc/바깥 클릭은 보류 유지 |
| 검찰 증거 | 조사로 원문 열람 해제 | 네 증거 모두 처음부터 원문 열람. 미열람 문구·경고 제거 |
| 조사 데이터 | grants+reveals | grants만. 조사로 확보하는 준비 카드와 예산은 기존대로 |
| 법체계 팩 | 기록 열람 항목 없음 | procedure.recordAccess: 형사소송법 제266조의3, verified:'unverified'. 화면 비노출 |
| SVG 서버 | application/octet-stream | image/svg+xml |
| 브라우저 환경 | 데모 file://만 | HTTP와 file:// 각각 1440/390, 기존 7경로씩 총 28회 완주 |

판결 근거의 기존 “조문 표기는 법률 검수 전” 문구와 판결 후 최후변론 복기는 유지했다.
조사 정의에서 reveals를 제거했다. 기록의 reveals:[]는 변경 금지인 v0.10 엔진의 investigation record 형식 호환용으로만 남는다. 읽을 수 있는 검찰 원문은 데모 projection의 초기 제공 정보이며 판정 효과를 추가하지 않는다.

## 검증

| 명령 | tests/checks | failures | exit |
| --- | ---: | ---: | ---: |
| node --test tests/demo.test.js | 30 | 0 | 0 |
| node tests/demo-browser.test.js | 3828 | 0 | 0 |
| node tests/demo-cleanup-browser.test.js | 122 | 0 | 0 |
| node tests/demo-procedure-browser.test.js | 46 | 0 | 0 |
| node tests/demo-art-browser.test.js | 24 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node tests/browser-trial.test.js | 217 | 0 | 0 |
| 합계 | 4514 | 0 | 0 |

기존 신참 무죄/공소기각/폭행/상해, 노련한 검사 공소기각/상해를 포함한 결과 5종 기대값 그대로 통과.
추가 검증: 시작 직후 4원문/조사 grants, HTTP SVG MIME, 화면 법률 메타데이터 제거, 최후변론 안내, 세 신청 선택/ESC/바깥 클릭의 닫힘·상태, 390 넘침.
초기 브라우저 실행에서 조사 창을 닫은 뒤 카드 키보드 펼침이 한 번 실패했다. 늦게 도착한 close 이벤트가 새 포커스를 빼앗을 수 있는 처리를 보완하고 같은 틱에 닫기→카드 포커스를 주는 회귀를 추가했다. 최종 전체 브라우저 재실행 통과.
git diff --check·diff 검토 완료. engine/trial.js·services/trial.js·trial.html·원본 에셋 무변경.

## 화면 확인 스크린샷

아래는 HTTP 캡처. file://도 cleanup-file-* 이름으로 동일하게 저장했다. tests/artifacts/는 기존 gitignore 대상, 파일은 로컬 보존한다.

| 확인 화면 | 데스크톱 | 모바일 |
| --- | --- | --- |
| 초기 원문 열람 | [보기](../tests/artifacts/cleanup-http-desktop-document.png) | [보기](../tests/artifacts/cleanup-http-mobile-document.png) |
| 조사 결과 세 선택지 | [보기](../tests/artifacts/cleanup-http-1440-result-choices.png) | [보기](../tests/artifacts/cleanup-http-390-result-choices.png) |
| 증거 의견·문구 삭제 | [보기](../tests/artifacts/cleanup-http-desktop-evidence.png) | [보기](../tests/artifacts/cleanup-http-mobile-evidence.png) |
| 최후변론 안내 | [보기](../tests/artifacts/cleanup-http-desktop-closing.png) | [보기](../tests/artifacts/cleanup-http-mobile-closing.png) |

## 규칙·범위·한계

RULES.md §15가 이전 미열람/조사 해제 규칙을 대체한다. serve.js 수정은 이번 사용자 5번의 명시적 허용 범위.
새 판정/수치 규칙 없음. 기록 열람 조문은 사용자 지정 팩 값이며 검증 완료를 뜻하지 않는다. 대사·증거·구형은 기존 authored fixture.
사람 플레이테스트·독립 리뷰·단일 HTML 묶기·커밋은 미실시. 다음 단계 작업 없음.
사람 판단 질문: 항상 읽을 수 있는 검찰 원문과 조사로 얻는 준비 카드의 구분이 명확한가?

---

# DEMO-001 공판 절차 보강 — 자체 점검 (2026-10-07)

사용자의 이번 실험 규칙을 구현했다. 기존 v0.10 엔진·서비스는 유지하고 데모 전용 공판 서비스를 추가했다. 커밋·stage·push 없음.

## 완료 기준

| 요청 | 결과·근거 |
| --- | --- |
| 공판 흐름 | 준비 → 모두진술 → 증거 의견 → 소환된 증인신문 → 구형 → 최후변론 → 최후진술 → 선고 기일 → 판결. 상단은 준비/모두진술/증거 의견/소환 증인/최종 변론/판결 |
| 증거 4종 | 기존 조서·진단서·정지 사진 ID 유지, PX_SIG_REPORT 신규. 각각 의견 필수, 확정 후 변경 불가. 미열람 경고 |
| 진술 증거 동의 | 해당 증인 미소환, admittedContent에 내용 보존, 상해 연결 +1과 요청한 메모. 0명/1명/2명 분기 테스트 |
| 진단서·사진 부동의 | 항목마다 질문과 신뢰 −1 기록, 쟁점 효과 없음 |
| 조사/신청 | 조사별 2줄 결과 묘사+카드. required는 기본 보류·신청/미신청/보류, none은 신청 불필요. 카드 상태와 변경 버튼, 마감 전 변경 가능 |
| 미신청 사용 | 질문 기록/시간 소비, 효과·points·neutralizes 없음, 재판장 안내. 반대/재반대 버튼에 신청 필요 표시 |
| 검사 사전 대비 | veteran redirect.preparedAgainst 데이터만 조회. 사전 신청한 현장 사진의 재반대는 효과 0과 대비 기록. 신참에는 해당 데이터 없음 |
| 늦은 신청 | 검사 종류와 무관하게 신뢰 −1·질문 기록. 현장 사진 늦은 신청은 사전 대비 대상이 아님 |
| 보류 마감 | 구형 직전 argument_closed, 남은 보류를 미신청으로 각각 기록 |
| 최종 절차 | 구형은 결과를 읽지 않는 팩 고정 문구. 최후변론 3선택과 합의×입장 6개 최후진술. 별도 “2주 뒤 · 제2회 공판기일 · 선고” |
| 복기 | 신청/의견 이력과 신뢰 효과, 제출 누락/대비 차단, 최후변론과 판결 근거의 대응 표시. 절차 기록과 역효과 섹션의 같은 기록 중복은 제외 |
| 직급 | 최형석 · 노련한 공판검사 · 공판 전담 10년차. 선택 안내도 변경 |
| ko 팩 | 제318조/제294조/제302조/제303조/제318조의2와 절차 값에 verified:'unverified'. 이번에 법률 검증을 했다는 뜻이 아님 |
| 불변 조건 | 무작위 없음. 최후변론/최후진술 삭제해도 adjudication 동일. 동일 입력 동일 raw 기록. 실패 명령 원자성 유지 |

## 새 시점 규칙과 구현 경계

RULES.md §14에 실험용 authored 규칙으로 기록했다.
- “늦은 신청” 경계는 모두진술 명령 후 증거 의견 화면 진입부터다. 그 전은 early, 이후는 late. 의견 확정 후 늦게 내는 대표 경로도 검증했다.
- 공판 전 제출했다가 철회/보류 후 다시 신청해도 이미 드러난 자료에 대한 사전 대비 이력은 사라지지 않는다. 재신청은 새 신청 기록이며 late면 신뢰 비용을 다시 낸다.
- 신청하지 않은 자료의 재반대에도 timeCost:1 기록. 데모 projection은 이 기록을 신문 사용량에 합산한다. 남은 시간 UI는 0 미만으로 표시하지 않는다.
- 기존 사건/자료/증인/질문 ID 및 record ID 형식은 유지. 이미 쓴 기록을 삭제·수정·재번호하지 않는다. 새 절차가 추가되어 새 실행의 뒤쪽 seq는 과거 실행과 달라질 수 있다.
- services/demo-trial.js는 고정된 v0.10 command service에서 분리한 데모 전용 상태 소유자다. engine/trial.js의 순수 projection/질문 해석/판정/복기를 재사용한다. services/trial.js·engine/trial.js·trial.html 무변경.
- 과거 전수 탐색 테스트는 원래 신문 규칙의 회귀다. 이번 전체 신청 상태 조합을 전수 탐색했다고 주장하지 않는다. 새 절차는 분기/대표 경로/불변성 테스트로 검증했다.

## 새 공략 경로

공통: 조서와 수사보고서는 부동의, 진단서·현장 사진은 동의. 유효 이의는 “넘어뜨린 동작”/“밀침 때문에 다쳤다” 두 질문에만 제기한다. 아래 명시 외에는 신문을 마친다. 최후변론은 어느 선택도 결과를 바꾸지 않는다.

| 검사·결과 | 준비·신청 | 모두진술·신문 |
| --- | --- | --- |
| 신참 무죄 | 최초 진술+연속 영상 조사, 영상 사전 신청 | 목격자 집중·기록 확인 입장. 최초 진술 대조 → 영상 대조 → 제한된 결론. 기존 경로처럼 이의 없이도 도달 |
| 신참 공소기각 | 영상+진료기록 조사/사전 신청, 상해 인정 문구를 뺀 합의 | 상해 연결 집중·밀침 인정, 유효 이의 2개. 수사관 진료기록 → 영상 → 제한된 결론 |
| 신참 폭행 유죄 | 위 자료/신문, 합의 없음 | 상해 연결은 끊지만 처벌불원서 없음 |
| 신참 상해·벌금 | 재면담+상해 인정 문구를 뺀 합의 | 균형·밀침 인정, 신문 없이 진행 |
| 신참 상해·집행유예 | 조사·합의 없음 | 균형·기록 확인 입장, 신문 없이 진행 |
| 노련한 검사 공소기각 | 영상+진료+현장 동선 조사, 영상/진료 사전 신청, 현장은 보류. 상해 인정 문구를 뺀 합의 | 연결 집중·밀침 인정, 의견 확정 뒤 현장 사진 늦은 신청(신뢰 −1). 유효 이의 2개. 진료 → 영상 → 제한된 결론 → 현장 동선 재반대 |
| 노련한 검사 상해·벌금 | 위와 같지만 현장 사진까지 사전 신청 | 검사가 준비한 답으로 현장 재반대를 막아 효과 0 |
| 노련한 검사 상해·집행유예 | 조사·합의 없음 | 균형·기록 확인 입장, 신문 없이 진행 |
| 노련한 검사 폭행 유죄(기존 경로도 유지) | 영상+진료+현장+재면담 4회, 합의 없음. 현장만 늦은 신청 | 위 공소기각과 같은 연결 신문/재반대 |

## 검증

| 명령 | tests/checks | failures | exit |
| --- | ---: | ---: | ---: |
| node --test tests/demo.test.js | 29 | 0 | 0 |
| node tests/demo-browser.test.js | 1795 | 0 | 0 |
| node tests/demo-procedure-browser.test.js | 46 | 0 | 0 |
| node tests/demo-art-browser.test.js | 24 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node tests/browser-trial.test.js | 217 | 0 | 0 |
| 합계 | 2358 | 0 | 0 |

데모는 기존 SVG MIME 제약 때문에 두 폭 모두 file://, v0.10은 기존 HTTP 방식. 브라우저 1440/390 완주·가로 넘침·조사 결과·신청·의견·최후 절차 확인.
중간 실패: 기존 이의 테스트에 새 의견 확정 단계가 빠져 추가했다. 별도 재반대 시간 테스트의 고정 총량은 그 경로의 신뢰 경고를 누락해, 원본 신문 사용량+기록된 timeCost 비교로 수정했다. 실패 명령이 상태를 바꾸지 않는 검사는 그대로 통과.
금지 파일 무변경, git diff --check 및 diff 자체 검토 완료.

## 단계별 스크린샷

| 화면 | 데스크톱 | 모바일 |
| --- | --- | --- |
| 조사 결과 | [보기](../tests/artifacts/procedure-desktop-investigation.png) | [보기](../tests/artifacts/procedure-mobile-investigation.png) |
| 증거 의견 | [보기](../tests/artifacts/procedure-desktop-evidence.png) | [보기](../tests/artifacts/procedure-mobile-evidence.png) |
| 구형 | [보기](../tests/artifacts/procedure-desktop-request.png) | [보기](../tests/artifacts/procedure-mobile-request.png) |
| 최후변론 | [보기](../tests/artifacts/procedure-desktop-closing.png) | [보기](../tests/artifacts/procedure-mobile-closing.png) |
| 최후진술 | [보기](../tests/artifacts/procedure-desktop-statement.png) | [보기](../tests/artifacts/procedure-mobile-statement.png) |
| 선고 기일 | [보기](../tests/artifacts/procedure-desktop-sentencing-date.png) | [보기](../tests/artifacts/procedure-mobile-sentencing-date.png) |
| 무증인 판결/절차 복기 | [보기](../tests/artifacts/procedure-1440-no-witness-result.png) | [보기](../tests/artifacts/procedure-390-no-witness-result.png) |

상담/법정 기존 art-*.png와 결과 demo-*.png도 유지. artifacts는 기존 gitignore 대상으로 로컬 보존.

## 한계·사람 판단

증거 동의/신청 효과·고정 구형·선고 간격은 요청한 실험 규칙이며 실제 법적 증거능력/양형 엔진이 아니다. 대사·6가지 최후진술은 authored fixture. 법률 항목은 unverified, 사람 플레이테스트/독립 리뷰/단일 HTML 묶기는 미실시.
판단할 질문: (1) 사전 제출 대비와 늦은 신청 비용의 차이가 이해되는가? (2) 최후변론이 판정을 바꾸지 않아도 선택 의미가 느껴지는가?
범위 밖 변경·다음 단계 작업·커밋 없음.

---

# DEMO-001 장소 사진·기본 초상 — 자체 점검 (2026-10-07)

UI 다듬기 1차 위 표시 변경. 판정·기록·수치·기존 결과 기대값 불변. 커밋·stage·push 없음.

## 완료 기준

- office_lounge: “사무실 응접실” → “사무실 회의실”, image는 assets/locations/office_lounge.jpg.
- 초상: byId 우선 → 없으면 assets/portraits/default.svg → 선택한 이미지 로드 실패 시 기존 성/역할 initial. pool은 읽지 않는다.
- 상담: 초상 데스크톱 96×112, 모바일 56×66. 대사 크기와 계속 버튼 위치 유지.
- 법정: 검사·증인·변호인 ID로 초상을 조회한다. 원형 안에 object-fit:cover, overflow:hidden. 파랑/주황/금색 테두리 유지.
- 사진: 기존 .58 오버레이와 고정 높이·하단 대화창 유지. 사진 경로 없음/로드 실패는 라벨·그라데이션·내용 높이 대체 화면.
- 모든 경로는 demo.html 기준 상대경로. assets 3개 SHA-256을 작업 전후 비교하여 byte-identical 확인. 기존 에셋 수정 없음.
- 390px 가로 넘침 없음. 사진 위 장소/제목, 대화창 글자 대비를 실제 스크린샷으로 확인.

## 스크린샷

| 화면 | 데스크톱 | 모바일 |
| --- | --- | --- |
| 첫 상담 | [사진+초상](../tests/artifacts/art-desktop-consultation.png) | [사진+초상](../tests/artifacts/art-mobile-consultation.png) |
| 법정 | [원형 초상 3명](../tests/artifacts/art-desktop-court.png) | [원형 초상 3명](../tests/artifacts/art-mobile-court.png) |

기존 tests/artifacts/ ignore 정책 유지. 스크린샷은 로컬에 보존, 강제 stage 없음.

## 검증

| 명령 | tests/checks | failures | exit |
| --- | ---: | ---: | ---: |
| node --test tests/demo.test.js | 22 | 0 | 0 |
| node tests/demo-browser.test.js | 1647 | 0 | 0 |
| node tests/demo-art-browser.test.js | 24 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node tests/browser-trial.test.js | 217 | 0 | 0 |
| 합계 | 2157 | 0 | 0 |

데모 브라우저 14회 완주(1440/390 file://). 별도 art 테스트는 실제 없는 파일 URL로 이미지 실패를 유발하고 정상 에셋으로 복구, byId 우선/원형/테두리/초상 크기/오버레이/축소 대체/넘침을 검사한다.
기존 결과 5종과 이름 변경 시 raw 기록/판정 동일 검증을 그대로 유지했다. git diff --check 통과. engine/trial.js·services/trial.js·trial.html·demo-outcome 무변경.

## 환경 제한·인계

첫 HTTP 실행은 SVG 로드 실패: 기존 serve.js가 SVG를 application/octet-stream으로 전송한다. 허용 범위 밖 서버는 수정하지 않았다. 이번 에셋 포함 데모 테스트는 실제 파일 직접 열기 방식으로 실행했다. HTTP 배포 시 SVG에 image/svg+xml을 보내는 정적 서버가 필요하다. v0.10 HTTP 회귀는 기존 방식 그대로 통과.
단일 HTML 묶기는 요청대로 리뷰어 작업이며 이번에 생성하지 않았다.
**사람이 커밋할 대상에 assets/ 폴더 전체(office_lounge.jpg, default.svg, CREDITS.md)를 포함한다.** 에셋은 현재 untracked이며 수정·stage하지 않았다.
규칙은 RULES.md §13의 표시 규칙만. 실제 인물 자동 배정/사진 생성/판정 입력 추가 없음. byId 테스트의 GIF/사진 매핑만 fixture.
사람 플레이테스트·독립 리뷰 미실시. 판단할 질문: 사진 밝기와 실루엣 크기가 대사를 읽는 데 적절한가?
범위 밖 수정·다음 단계 작업 없음.

---

# DEMO-001 UI 다듬기 1차 — 자체 점검 (2026-10-07)

화면 표시만 수정. 판정·원본 기록·수치·기존 결과 기대값 불변. 커밋·stage·push 없음.

## 요청별 전/후 · 모두 충족

| 위치 | 전 | 후 |
| --- | --- | --- |
| 첫 상담 | 대화창 클릭/Enter 안내문 | 포커스된 계속 ▸ 버튼. 마지막 줄에는 할 일·사건 파일 열기 |
| 사건 선택 | 검사 미선택으로 시작 불가 | 신참 기본 선택, 사건 선택으로 돌아올 때도 신참 |
| 상단 | 사건명 + 별도 죄명 + 검사 역할 | 사건명 · 상대 윤가람/최형석 검사 |
| 공판 준비 안내 | 긴 안내와 힌트 | 마감 · 반나절 4번. 조사할 자료를 고르세요. |
| 준비 배치 | 합의 전문 → 조사 | 조사 → 합의 접힘(제목·금액·상태), 펼침 상태 진행 중 유지 |
| 준비 메모 | 메모 패널/탭 항상 표시 | 준비 중 숨김·가운데 확장, 모두진술부터 복원 |
| 메모 범례 | 설명 상시 표시 | 읽는 법 ⓘ 펼침 |
| 미열람 증거 | 내용 미열람 · 조사 후 열람 가능 | 미열람. 팝업 설명 유지 |
| 모두진술 | 첫 변론 소제목·긴 안내 | 소제목 삭제. 인정할 것과 다툴 것을 고르세요. 공개한 입장은 되돌릴 수 없습니다. |
| 반대신문 바 | 역할·남은 시간·긴 설명 | 반대신문 · 증인 이름. 시간은 상단 게이지 |
| 반대신문 선택지 | 작은 글씨·440px 이상 중앙 영역·하단 고정 | 제목16/설명13/칩12/추궁15px, 중앙은 내용 높이, 선택지는 바로 다음 흐름 |

## 스크린샷

실제 파일은 tests/artifacts/에 남겼다(저장소의 기존 ignore 대상, 강제 stage하지 않음). 전은 1440×900/390×900, 후는 기존 브라우저 테스트의 1440×900/390×844. 비교는 화면 배치와 표시 변화 기준이다.
| 단계 | 데스크톱 전 → 후 | 모바일 전 → 후 |
| --- | --- | --- |
| 사건 선택 | [전](../tests/artifacts/ui1-before-desktop-select.png) → [후](../tests/artifacts/ui1-after-desktop-select.png) | [전](../tests/artifacts/ui1-before-mobile-select.png) → [후](../tests/artifacts/ui1-after-mobile-select.png) |
| 첫 상담 | [전](../tests/artifacts/ui1-before-desktop-consultation.png) → [후](../tests/artifacts/ui1-after-desktop-consultation.png) | [전](../tests/artifacts/ui1-before-mobile-consultation.png) → [후](../tests/artifacts/ui1-after-mobile-consultation.png) |
| 공판 준비 | [전](../tests/artifacts/ui1-before-desktop-prep.png) → [후](../tests/artifacts/ui1-after-desktop-prep.png) | [전](../tests/artifacts/ui1-before-mobile-prep.png) → [후](../tests/artifacts/ui1-after-mobile-prep.png) |
| 모두진술 | [전](../tests/artifacts/ui1-before-desktop-opening.png) → [후](../tests/artifacts/ui1-after-desktop-opening.png) | [전](../tests/artifacts/ui1-before-mobile-opening.png) → [후](../tests/artifacts/ui1-after-mobile-opening.png) |
| 반대신문 | [전](../tests/artifacts/ui1-before-desktop-cross.png) → [후](../tests/artifacts/ui1-after-desktop-cross.png) | [전](../tests/artifacts/ui1-before-mobile-cross.png) → [후](../tests/artifacts/ui1-after-mobile-cross.png) |

합의 펼침: [데스크톱](../tests/artifacts/ui1-after-desktop-settlement.png), [모바일](../tests/artifacts/ui1-after-mobile-settlement.png).
판결은 기존 demo-compact-{desktop,mobile}-*.png / demo-{desktop,mobile}-*.png로 계속 저장한다.
수정 후 스크린샷은 애니메이션을 끝낸 상태로 캡처한다. 준비·상담·반대신문 시각 점검 완료.

## 검증

| 실행 명령 | tests/checks | failures | exit |
| --- | ---: | ---: | ---: |
| node --test tests/demo.test.js | 22 | 0 | 0 |
| node tests/demo-browser.test.js | 1595 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node tests/browser-trial.test.js | 217 | 0 | 0 |
| 합계 | 2081 | 0 | 0 |

추가/변경 검증: 상담 계속 버튼 포커스와 클릭/Enter 완주, 마지막 버튼 교체, 신참 기본값/초기화, 상단 제목, 준비 메모 패널/탭 숨김과 모두진술 복원, 합의 접힘/펼침, 범례 펼침, 1440/390 가로 넘침. 기존 결과 5종 기대값 및 원본 기록 불변 테스트 그대로 통과.
중간 실행에서 flex:0의 높이 축소로 조서와 선택지가 겹친 것을 발견해 flex:0 0 auto로 수정했다. 최종 브라우저 전체 재실행 통과.
변경 전 캡처 스크립트는 가려진 radio 직접 클릭으로 한 번 timeout; label 클릭으로 바꿔 캡처 완료. 서비스 상태/데이터 파일 오염 없음.
git diff --check 통과. 금지 engine/trial.js·services/trial.js, trial.html, demo-outcome 무변경. 기존 미커밋 파일과 사용자 assets/는 보존했다.

## 규칙·한계

RULES.md §12: 표시 규칙만. 새 판정 규칙 없음. 첫 상담/자료/결과는 기존 authored fixture, 사진/초상 및 pool 상태를 바꾸지 않음.
사람 플레이테스트와 독립 리뷰는 미실시. 판단할 질문: 조사와 합의 순서가 자연스러운가? 반대신문 선택지 크기와 간격이 읽기 편한가?
범위 밖 변경·다음 단계 작업 없음.

---

# DEMO-001 몰입 라운드 후속 — 자체 점검 (2026-10-07)

Codex · Lane: experiment. 커밋·stage·병합·push 없음. 아래 이전 보고서는 변경 이력이다.

## 완료 기준과 근거

- 인물: 정민호(38), 오태윤(41), 한지수(34), 서동국 경위, 윤가람/최형석을 presentation 데이터에 추가. 법정·공판 조서 화자, 검사 선택, 합의 대화, 사건 메모에 이름과 역할을 표시한다. 법정 얼굴은 한/서/윤/최.
- 사정: 공동 작업실 운영·정산 다툼, 방송 외주 갱신과 “형사처벌 이력 시 해지”, 오태윤의 3주째 작업 불가를 메모/상담/합의에 반영했다.
- 첫 상담: 8줄(정민호 5·변호인 3). 최초 접촉 부인과 재면담 반전 유지. 할 일 2줄·Enter/클릭·전체 보기·종료 포커스 유지.
- 결과: 유죄는 계약 조항 걱정, 무죄/공소기각은 계약 유지 한 줄 추가. outcome 데이터는 변경하지 않는다.
- 무사진: 은은한 세로 그라데이션, 장소·제목 바로 아래 대화창, 내용에 맞는 창 높이. 1440/390에서 위/아래 빈 공간과 가로 넘침 검사. 사진 fixture에서는 기존 배경·어두운 오버레이 유지.
- 판정·기록·수치: 원본 variants/settlement 데이터가 작업 전 snapshot과 동일. 표시명을 바꾼 10개 대표 경로의 세션 기록·공판 기록·전체 outcome deepEqual. 기존 결과 5종 기대값 그대로. 베테랑 무죄 불가도 기존 전수 탐색으로 유지.
- 금지 파일: engine/trial.js, services/trial.js, trial.html, services/demo-outcome.js 무변경. 제외 아트 2개 미사용·미수정·미stage.

## 대사 전/후

상담 순서 기준. 동일한 대사도 반전 보존 확인을 위해 기재한다.

| 새 순서 | 전 | 후 |
| --- | --- | --- |
| 1 | 변호사님, 작업실에서 정산 문제로 말다툼을 했어요. 그런데 제가 사람을 다치게 했다며 재판을 받게 됐습니다. | 저는 프리랜서 영상 편집자입니다. 오태윤 씨와 작업실을 같이 운영하는데, 정산 문제로 말다툼을 했어요. |
| 2 | 우선 앉으세요. 서두르지 않으셔도 됩니다. 그날 어떤 일이 있었는지 말씀해 주세요. | 우선 앉으세요. 서두르지 않으셔도 됩니다. 그날 어떤 일이 있었는지 말씀해 주세요. |
| 3 | 말이 좀 심하게 오가긴 했습니다. 그래도 몸은 건드리지 않았어요. | 말이 좀 심하게 오가긴 했습니다. 그래도 몸은 건드리지 않았어요. |
| 4 | 그 사람이 넘어져 손목을 다쳤다고 하더라고요. 검찰에서는 제가 밀어서 그렇게 됐다는 거예요. | 태윤 씨가 넘어져 손목을 다쳤다고 하더라고요. 검찰에서는 제가 밀어서 그렇게 됐다며 상해로 기소했습니다. |
| 5 | 검찰은 목격자 진술과 진단서를 냈습니다. 민호 씨 말씀도 듣고, 그 자료가 어디까지 확인해 주는지 살펴보겠습니다. | 같은 작업실을 쓰는 한지수 씨의 진술과 진단서가 나와 있네요. 민호 씨 말씀도 듣고, 자료가 어디까지 확인해 주는지 살펴보겠습니다. |
| 6 | (신규) | 다음 달에 방송 외주 계약을 갱신해야 해요. 계약서에 “형사처벌 이력 시 해지”라고 적혀 있어서, 일을 계속할 수 있을지 걱정입니다. |
| 7 | 합의 이야기도 들었습니다. 돈을 드리면 재판까지 끝나는 건가요? | 합의 이야기도 들었습니다. 돈을 드리면 재판까지 끝나는 건가요? |
| 8 | 합의해도 재판은 계속될 수 있어요. 조건을 함께 읽고 어떤 의미인지 설명드리겠습니다. 결정은 그다음에 하시죠. | 합의해도 재판은 계속될 수 있어요. 합의 조건과 걱정하시는 계약 조항을 함께 살펴보겠습니다. 설명을 들으신 뒤 결정하시죠. |

| 표시 위치 | 전 | 후 |
| --- | --- | --- |
| 법정/조서 화자 | 목격자 / 담당 수사관 | 한지수 · 목격자 · 공동 작업자 / 서동국 · 담당 수사관 · 경위 |
| 검사 선택/화자 | 신참 검사 / 베테랑 검사 | 윤가람 · 신참 검사 / 최형석 · 베테랑 검사 |
| 합의 피해자 화자 | 피해자 측 | 오태윤 · 피해자 |
| 합의 사정 | 없음 | 오태윤 씨는 손목 부상으로 3주째 편집 작업을 못 하고 있습니다. |
| 유죄 결과 부연 | 없음 | 정민호 씨는 다음 달 방송 외주 계약 갱신을 앞두고, 계약서의 “형사처벌 이력 시 해지” 조항이 걱정입니다. |
| 무죄·공소기각 부연 | 없음 | 정민호 씨는 이번 사건의 형사처벌 이력으로 계약이 끊길 걱정을 덜고, 방송 외주 계약을 유지합니다. |

## 검증

실행 위치 courtroom-prototype/. NODE_PATH/PW_CHANNEL은 test-results.log에 기록.

| 명령 | tests/checks | failures | exit |
| --- | ---: | ---: | ---: |
| node --test tests/demo.test.js | 22 | 0 | 0 |
| node tests/demo-browser.test.js | 1460 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node tests/browser-trial.test.js | 217 | 0 | 0 |
| 합계 | 1946 | 0 | 0 |

브라우저는 1440 HTTP / 390 file://, 14회 완주. 이름/성 initial/상담 사정/합의/계약 결과/팝업/펼침/포커스/이미지 fixture/가로 넘침 검증.
첫 실행의 스크린샷에서 상담 창 하단 여백을 발견하여 height:fit-content로 수정했고 위·아래 간격 회귀를 추가해 재실행했다.

## 새 규칙·한계

RULES.md §11의 표시 규칙만 추가. 인물과 계약은 authored 서사이며 계약 해지/갱신 simulation은 없다. 이름은 원본 기록에 저장하지 않고 기존 ID를 화면에서 해석한다.
실제 사진·초상은 없고 이미지 테스트는 작은 GIF fixture다. pool 자동 배정은 미구현. 판정·법률 규칙·수치는 추가하지 않았다.
사람 플레이테스트/독립 리뷰/병합은 미실시. 사람이 판단할 질문: 상담 말투가 자연스러운가? 계약 사정이 부담을 이해하는 데 도움이 되는가?
다음 단계 작업과 범위 외 변경 없음.

---

# DEMO-001 B — 첫 상담 장면 자체 점검 (2026-10-07)

Codex · Lane: experiment · 커밋·stage·병합·push 없음. 아래는 이전 변경 이력이다.

## 이번 요청과 완료 기준

| 항목 | 결과 |
| --- | --- |
| 시작 장면 | 사건 메모 자동 표시 대신 사무실 응접실 첫 상담. scene.location = office_lounge |
| 장소 매니페스트 | data/demo-locations.js에 key/label 및 선택 image 구조. 현재 사진 없이 단색·장소 라벨. 이미지 fixture에서 오버레이 확인 |
| 대화창 | 화면 하단. 정민호 4줄·변호인 3줄, 클릭/Enter 한 줄 진행·전체 보기. 처음에는 몸을 건드리지 않았다고 말해 재면담 반전 유지 |
| 마지막 행동 | 할 일 두 줄·사건 파일 열기. 마지막 대사 또는 전체 보기 전에는 종료 버튼 없음 |
| 초상 | data/demo-portraits.js의 빈 byId/pool. 인물 ID별 URL만 조회; 기본 정/변 initial. pool 자동 배정 미구현 |
| 참고 자료 | 상단 사건 메모 재열기 유지. 정민호 이름·38세·사건 사정과 안내 유지 |
| 접근성 | 상담 Esc/바깥 클릭 차단, Enter 진행, 완료 후 #phaseTitle 포커스. 390px 가로 넘침 없음 |
| 판정·기록 | 상담 전후 raw 기록·outcome snapshot 동일. engine/trial.js·services/trial.js·trial.html 및 demo 판정 서비스 무변경 |
| 제외 아트 | 기존 untracked ui/trial-demo-art.js와 ui/art/consult-scene.svg는 읽거나 로드·수정·stage하지 않음. 커밋 대상 제외 |

## 검증

실행 위치 courtroom-prototype/. 기존 임시 Playwright 설치와 bundled Chromium 사용(NODE_PATH/PW_CHANNEL은 test-results.log).

| 명령 | tests/checks | failures | exit |
| --- | ---: | ---: | ---: |
| node --test tests/demo.test.js | 21 | 0 | 0 |
| node tests/demo-browser.test.js | 1218 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node tests/browser-trial.test.js | 217 | 0 | 0 |
| 합계 | 1703 | 0 | 0 |

브라우저: 1440×900 HTTP 및 390×844 file:// 각 7경로 완주. 상담 7줄 클릭/Enter, 전체 보기, 마지막 할 일, Esc/바깥 클릭 차단, 포커스 복귀, 매 판 초기화, 그림 없는 대체 표시, 인물 ID 초상 매칭/비매칭, 장소 이미지 오버레이, pool 미사용, UI 조작 전후 기록 불변과 기존 점진 공개 회귀를 확인했다. 데스크톱/모바일 첫 상담 스크린샷을 직접 검토했다.
기존 계약의 5종 결과·검사별 경로·결정성·전수 탐색·회귀·폭별 완주는 유지한다. 사람의 첫 완주·재미는 PLAYTEST-001에서 확인해야 한다.

## 범위와 한계

변경 목록은 demo/REVIEW_PACKET.md, 새 표시 규칙은 RULES §10. 실제 사진·초상은 추가하지 않았다. pool 자동 배정·법률 규칙·새 공판 기능은 구현하지 않는다. 상담 7줄과 메모는 고정 authored 안내다. 사건 메모의 초기 진술은 이후 재면담 기록을 대체하지 않는다.

사람이 확인할 질문: 상담 말투가 자연스러운가? 7줄의 길이가 적당한가? 마지막 두 줄만 읽고 조사·합의로 이동할 수 있는가?

---

# DEMO-001 첫인상·점진 공개 자체 점검 (2026-10-07)

Codex · Lane: experiment · 커밋·병합·push 없음. 이전 P1 수정은 아래 이력에 보존한다.

## 요청별 완료 확인

| 요청 | 결과·근거 |
| --- | --- |
| 사건 표시명 | 작업실 정산 다툼 상해 사건. HTML 탭·선택·상단에서 적용, 두 장면 사이는 화면에서 제거 |
| 의뢰인 이름·나이 | 정민호(38세). 브리핑·자료 패널·상담 화자·상담 버튼·조서 화자에 표시. 일반 설명의 의뢰인 표현은 자연스러운 문맥에서 유지 |
| 최초 사건 메모·재열람 | 선택 후 native dialog로 한 번 자동 표시. 혐의·경위 3항목, 양측 주장, 할 일 3항목, 지정 마무리 문구·사건 파일 열기. 진행 중 상단에서 다시 열기 |
| 일상 사건 제목 | 원룸 보증금 반환 유지; 두 번째는 공용 보관대 물건 오인 반출 · 절도 혐의로 명확화 |
| 준비 자료 | 제목 기본·클릭/Enter로 본문 펼침. service의 현재 available 카드·pending 재반대 카드 강조 |
| 검찰 증거 | 제목+한 줄 요약, 팝업에서 수록 원문 발췌 전체 표시. 미열람 내용은 숨김. Esc·바깥 클릭·닫기·포커스 복귀·키보드 트랩 확인 |
| 재판장 메모·법정 기록 | 판세/최근 문답만 기본. 모든 근거/전체 조서는 펼침. 기록 내용과 순서 보존 |
| 판결 복기 | 결과+핵심 3항목 우선, 판결 근거/양형·세부 복기는 접힘. 유죄의 통과시킨 이의는 핵심에서 우선 설명 |
| 모바일 | 390폭에서 자료/법정/메모 한 패널씩 전환. 1440폭은 3열 유지 |
| 펼침 유지·초기화 | 진행 중 카드·메모·조서·복기 상태 유지, 새 판 초기화. 모바일 탭도 법정으로 초기화 |
| 판정·기록 보존 | UI 열람 전후 snapshot 동일. 추가 데이터는 presentation 필드뿐이며 기존 trial 정의·원본 기록·판정 규칙 변경 없음 |

## 최신 검증

실행 위치 courtroom-prototype/. Playwright NODE_PATH 및 PW_CHANNEL=none-bundled는 demo/test-results.log에 기록.

| 명령 | tests/checks | failures | exit |
| --- | ---: | ---: | ---: |
| node --test tests/demo.test.js | 21 | 0 | 0 |
| node tests/demo-browser.test.js | 1002 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node tests/browser-trial.test.js | 217 | 0 | 0 |
| 합계 | 1487 | 0 | 0 |

브라우저 1440×900 HTTP / 390×844 file:// 각 7경로. 최초 브리핑·재열람, 카드 키보드 펼침·유지, 미열람 증거 차단·원문 팝업·Esc/바깥 클릭·포커스, 메모·조서·복기 펼침, 가로 넘침, 새 판 초기화, UI 조작 전후 기록 불변을 추가 검증했다. 브리핑·접힌 판결 및 펼친 화면 스크린샷도 확인했다. 중간 실행에서 잘못된 작업 디렉터리로 브라우저 명령을 한 번 실패했으며 경로 수정 후 전체 실행은 통과했다.

계약 완료 기준: 결과 5종/두 검사 경로/베테랑 제한/결정성은 21개 테스트의 기존 대표 경로·전수 탐색으로 충족. 1440/390 완주·v0.10 회귀 충족. 처음 보는 사람의 설명 없는 완주·재미는 사람이 PLAYTEST-001에서 확인해야 하며 자동 테스트로 충족을 주장하지 않는다.

새 표시 규칙: RULES §9. 파일별 요약: demo/REVIEW_PACKET.md. git diff 검토·diff --check 통과, 금지 파일 및 trial.html 무변경. Owns에 따라 공용 보고서 대신 demo/ 안의 REPORT·REVIEW_PACKET·test-results.log를 갱신했다. 다음 VS 시작 없음.

## 한계·사람 판단

증거 팝업은 데모 데이터에 이미 수록된 발췌문이며 실제 조서·진단서 전체 문서를 새로 만들지 않았다. 고정 authored 사건·합의·양형·기존 unverified 상태는 유지한다. 일반 법률 추론·save·월드 통합은 추가하지 않았다. 이 세션 앞선 문구·복기 수정 및 PLAYTEST-KIT 변경도 미커밋 상태로 함께 남아 있다.

사람에게 남긴 질문(3개): 브리핑만으로 역할이 이해되는가? 펼쳐 읽는 자료를 신문에 연결할 수 있는가? 모바일 패널 전환이 흐름을 방해하지 않는가?

---

# DEMO-001 수정 자체 점검 (2026-10-07)

Lane: experiment · Codex · 커밋·병합·push 없음(사람이 수행).
기준: 사용자 수정 요청, .agent/reviews/DEMO-001.md P1-1~3·P3, docs/playtest/DEMO-TEXT.md의 우선 문구.

## 이번 변경과 검증

- P1-1 방법 a: 효과 있는 유효 이의 통과를 실제 recordId로 찾아 **통과시킨 이의**에 설명한다. 인용·무효 이의 통과는 제외한다.
- P1-2: 재면담 카드가 있으면 다시 만났다면 안내를 제거하고 실제 모순을 역효과에 표시한다. v0.10 when은 hasCard를 지원하지 않으므로 사건 데이터의 missedUnlessCard/knownMemo와 데모 복기 projection으로 처리했다. 주신문·판정 효과는 그대로다.
- P1-3: 놓친 준비는 유죄 근거 쟁점에만 표시한다. 무죄·공소기각은 없음, 폭행 유죄에는 인과 쟁점 안내를 넣지 않는다.
- P3: 동선 조사처럼 표현만 다른 중복은 카드 기준으로 합치며 실제 기록 안내를 우선한다. 확보했지만 미제시한 경우는 그 선택을 설명한다.
- 문구: 모두진술(부제 첫 변론), 검사 측 증인 호출, 담당 수사관, 의견을 묻는 신문, ko 팩의 주문 낭독, 선고 · 상대:, 접촉 사실은 양측 인정, 베테랑 재주신문 질문·답변과 복기 설명, 징역 6월에 집행유예 1년, 을/를 조사 함수를 반영했다. 요약 보기/닫기와 어려움 모드 안내도 반영했다.
- PLAYTEST-KIT: HTML 더블클릭(옆의 의존 폴더 보존), 녹화 동의, 30~40분·중단 규칙, 3분 막힘 후 3단계 힌트, 깨달음 기록, 테스터 사이 새로고침, 5명 집계, 종료 질문 5개 확정.

실행 위치: courtroom-prototype/. 기존 임시 Playwright 설치를 NODE_PATH로 지정하고 PW_CHANNEL=none-bundled로 Chromium을 사용했다(저장소 의존성 변경 없음).

| 실행 명령 | checks/tests | failures | exit |
| --- | ---: | ---: | ---: |
| node --test tests/demo.test.js | 21 | 0 | 0 |
| node tests/demo-browser.test.js | 578 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node tests/browser-trial.test.js | 217 | 0 | 0 |
| 합계(독립 테스트·checks 합산) | 1063 | 0 | 0 |

단위 테스트 6개 추가: 무관한 준비 제외, 유효 이의 통과 출처, 재면담 유무 양방향, 동선 중복·미사용, 팩 주문·원본 기록 불변, 받침 유무 조사. 기존 실패 명령 원자성·결정성·결과 5종·전수 탐색도 통과했다. 마지막 조사 표기 수정 후 관련 단위 테스트 7개와 브라우저 578 checks를 재실행했다(모두 통과, 위 합계에는 중복 실행 제외).
브라우저는 1440×900 localhost / 390×844 file:// 각각 7경로, 가로 넘침·콘솔 오류 없음. 통과 이의/재면담 부인/카드 미제시 경로를 추가했다. 모바일 통과 이의 선고 스크린샷도 직접 확인했다.

## 완료 기준 확인

| 계약 기준 | 상태·근거 |
| --- | --- |
| 모든 결과 도달 | 충족: 기존 10개 대표 경로·5개 결과 테스트 유지 |
| 양 검사 버전 무죄 또는 공소기각 경로 | 충족: 신참 무죄/공소기각, 베테랑 공소기각 |
| 베테랑 표면 접근만으로 무죄 불가 | 충족: 기존 전수 탐색 통과, 판정 수치 변경 없음 |
| 같은 기록이면 같은 결과 | 충족: 재실행·다른 검사 정의 재평가 테스트 통과 |
| 1440/390 완주·가로 넘침 없음 | 충족: 브라우저 14회 완주 |
| v0.10 회귀 유지 | 충족: 247 단위 tests + 217 browser checks, trial.html·금지 파일 diff 없음 |
| 처음 보는 사람이 설명 없이 완주 | 미확인: 사람 플레이테스트 필요, 자동 테스트로 대체하지 않음 |
| 자체 점검 | 이 REPORT, RULES §8, demo/REVIEW_PACKET.md, demo/test-results.log 갱신 |

새로 정한 표시 규칙은 [RULES.md](RULES.md) §8 참조. 게임 판정 규칙은 추가하지 않았다.
Owns 제한을 따라 기존 공용 REVIEW_PACKET.md·test-results.log·root DESIGN.md는 보존하고 데모 폴더에 수정 보고·최신 검증 로그·설계 변경 기록을 두었다. PLAYTEST-KIT은 이번 사용자 요청으로 허용된 문서다. 병합하지 않았으므로 CURRENT/CHANGELOG는 변경하지 않았다.

## 한계·범위·미결정

고정 authored 사건·대사·합의·양형 표이며 실제 법률 추론/일반 AI/월드 통합은 구현하지 않았다. 기존 조문 unverified와 법률 검수 전 표시는 유지한다. 리뷰 P2-1의 자료 없는 질문 point, P2-2 윤리 효과, P2-6 추가 시간 차감은 요청 범위 밖으로 그대로 남겼다. v0.10 화면의 옛 용어도 변경하지 않았다. 세부 파일별 변경과 범위 검토는 [REVIEW_PACKET.md](REVIEW_PACKET.md).
사람이 판단할 질문 3개는 아래 이전 보고 §6과 같다. 이번 수정이 재미·공정성 문제까지 해결했는지는 PLAYTEST-001에서 확인해야 한다.

---

## 이전 구현 보고 (2026-10-01, 아래 수치·문구는 당시 기록)

Lane: experiment · 브랜치 `task/demo-001` · 커밋하지 않음(사람이 커밋). 규칙 전체는 [RULES.md](RULES.md).

## 1. 테스트 실행과 결과

실행 위치 `courtroom-prototype/`. Playwright는 저장소에 설치돼 있지 않아 임시 폴더에 설치하고 `NODE_PATH`로 지정했다.

| 명령 | 결과 |
| --- | --- |
| `node --test tests/demo.test.js` (신규) | 15 tests / 15 pass / 0 fail, 약 60초(경로 전수 탐색 포함) |
| `node tests/demo-browser.test.js` (신규) | 274 checks / 0 failures. 1440×900·390×844 × 4경로(무죄, 공소기각, 상해 유죄+집유, 폭행 유죄), localhost + file:// |
| `npm test` (기존 회귀) | 247 / 247 pass |
| `node tests/browser-trial.test.js` (v0.10 회귀) | 217 checks / 0 failures (`PW_CHANNEL=none-bundled`로 번들 Chromium 사용) |

환경 메모: 이 PC의 Edge로 v0.10 브라우저 테스트를 돌리면 `/favicon.ico` 404 콘솔 오류로 실패한다. 코드 문제가 아니라 Edge 헤드리스의 파비콘 요청이며, 번들 Chromium에서는 통과한다. `demo.html`은 빈 아이콘을 지정해 Edge에서도 통과한다. `test-results.log`·`REVIEW_PACKET.md`·`package.json`은 Owns 밖이라 갱신하지 않았다.

## 2. 완료 기준

| 기준 | 상태 | 근거 |
| --- | --- | --- |
| 모든 결과 도달(무죄/공소기각/폭행 유죄/상해 유죄+벌금/상해 유죄+집행유예) | 충족 | `outcome: every result is reachable` — 10개 대표 경로, 양 검사 버전 |
| 두 버전 모두 무죄 또는 공소기각 경로 | 충족 | 신참: 무죄·공소기각, 베테랑: 공소기각(동선 재반대 + 합의) |
| 베테랑은 표면 접근만으로 무죄 불가 | 충족(더 강하게) | 예산을 풀고 모든 카드를 쥔 상위집합에서 모든 합법 명령열 전수 탐색: 베테랑 무죄 0건, 연결 “의심”은 동선 재반대를 쓴 경로에서만 |
| 같은 기록이면 같은 결과 | 충족 | 재실행 기록 동일, 기록을 다른 검사 정의로 재평가해도 결과·양형 동일, 처벌불원 제출 순서는 기록에서 읽음 |
| 1440/390 완주, 가로 넘침 없음 | 충족 | 브라우저 테스트가 각 단계마다 scrollWidth 검사 |
| v0.10 trial.html 회귀 유지 | 충족 | trial.html·엔진·서비스 무수정, 위 회귀 통과 |
| 처음 보는 사람이 설명 없이 완주 | 미확인 | PLAYTEST-001에서 사람이 확인 |
| 계약서 개정 | 완료 | `.agent/tasks/DEMO-001.md` — Owns에 services/demo-*.js 추가, 엔진 수정 금지, 합의·양형 범위 |

사용자 지시별: 1 사건(상해) ✓ · 2 더하기 방식 ✓ · 3 재주신문 0/+1, 베테랑 이의 시간 −1(해석은 아래 질문 1), 숨은 보너스 없음 ✓ · 4 §1.10, 차이는 카드 제시 후 인정 범위 ✓ · 5 결과 판정, 값은 ko 팩 ✓ · 6 합의·의뢰인 자율 ✓ · 7 양형 표·표시 ✓ · 8 복기·다음 시도·막은 것/뚫은 것·“다툼 있음” 유죄 설명 ✓ · 9 시작 화면 ✓ · 10 테스트 ✓ · 11 [확인 필요] 표시 ✓

## 3. 새로 정한 규칙

[RULES.md](RULES.md) §2~7: 사건 수치·SIGNATURE에서 바꾼 사실 세부, 검사 버전 차이 표, 합의 제안·상담 비용·조언 3종과 의뢰인 반응, 결과 판정 순서, 양형 표, 복기·다음 시도 규칙.

변경·추가 파일: `.agent/tasks/DEMO-001.md`(개정), `demo.html`, `data/demo-separated-moments.js`, `data/demo-ko-pack.js`, `data/demo-daily-cases.js`, `services/demo-session.js`, `services/demo-outcome.js`, `ui/trial-demo-app.js`, `ui/trial-demo.css`, `tests/demo.test.js`, `tests/demo-browser.test.js`, `demo/RULES.md`, `demo/REPORT.md`. `demo.html`·`tests/demo-*`·`demo/`는 사용자가 지정한 Owns 추가 항목 밖이라 계약서 개정에 “구현에 필요해 함께 추가”로 적었다.

## 4. [확인 필요] — 조문·효과

- 상해 공소사실 중 폭행만 인정되고 처벌불원이 있을 때 공소장 변경 없이 공소기각하는 실무·판례(`lesserIncluded`, unverified).
- 형사소송법 제232조 제1·3항의 2026-10 적용본(링크가 2027-12-31 시행 예정본으로 열렸음, DEMO-DESIGN §6).
- 형사소송법 제325조(무죄) 원문.
- 양형 값(벌금 300만/100만 원, 징역 6개월 집유 1년)과 양형위원회 기준의 차이. 법정형 범위 안에서 고른 값이다.
- 형법 제257조·제260조·제262조, 형사소송법 제327조 제6호, 형법 제62조는 DEMO-DESIGN §6(2026-09-30)의 원문 확인을 따랐다. 이번 작업에서 재확인하지 않았다.
- 화면에는 “조문 표기는 법률 검수 전”을 함께 표시한다.

## 5. 알려진 한계

- 일상 사건 2개는 요약만 보여 준다(자동 진행 없음).
- 베테랑 버전은 무죄가 구조적으로 불가능하다(목격자가 준비돼 밀침 쟁점 최소 “다툼 있음”). 최선은 공소기각이며, 동선 조사·합의·두 유효 이의·연결 집중이 모두 필요해 예산 4를 정확히 쓴다. 너무 빡빡할 수 있다.
- 합의는 준비 단계에서만, 고정 제안 하나. 선고 직전 합의·기일 연기·공탁은 범위 밖.
- 엔진 제약으로 증인의 접근법 효과는 그 증인의 쟁점에만 작용한다. 목격자의 이의 창 통과 효과는 의도적으로 연결 쟁점에 걸었다(이의 효과는 쟁점 지정 가능).

## 6. 사람이 판단할 질문

1. 베테랑 이의의 “신문 시간 −1”을 “인용된 질문의 시간이 답 없이 소진”으로 해석했다. 추가 차감이 필요하면 공판 서비스(Owns 밖) 변경이 필요하다. 이대로 괜찮은가?
2. 베테랑 버전에서 무죄가 아예 없고 공소기각이 최선인 설계가 의도에 맞는가? 아니면 베테랑에게도 깊은 무죄 경로(예: 밀침 쟁점의 별도 실마리)를 둘까?
3. 합의 상담이 반나절 1을 쓰게 해 “조사 하나 vs 합의”를 맞바꾸게 했다. 이 긴장이 재미에 도움이 되는지 플레이테스트에서 볼 것인가?
