# THE FIRM — 작업 기록 (Changelog)

에이전트(Claude, Codex)와 사람이 공유하는 활동 기록이다. 최신이 위. 새 작업을 병합할 때마다 한 항목을 추가한다.
형식: 날짜 · 무엇을 · 어디에 · 누가 · 결정/미결정. 설계 상세는 `docs/DESIGN-NOTES-2026-09.md`.

---

## 2026-10-07 (오전 2) — SYS-004 마지막 결정 4개

- 사용자 결정(추천대로): (1) 수요 기준을 "사건을 직접 받는 변호사" 기준으로 재계산 후 게임 조정 폭 재설정. (2) 시장 구분: 대형 로펌은 일정 금액 이하 일상 사건을 맡지 않음 + 경력자 독립(스핀아웃) 흐름. (3) 독립 운영 유지율 목표는 시뮬레이션 결과로 조정. (4) 파산은 커리어 **중단**(면책 시 복권, 채무자회생법 574조 [확인 필요]): 1~2년 자격 정지·명성 큰 하락 후 복귀 가능.
- 다음: WORLD-005에서 SYS-004 경영 모델을 WORLD에 반영.

## 2026-10-07 (오전) — SYS-004 결정 3개, 재정 위기 단계

- 사용자 결정: (1) 신규 로펌 생존은 현실적 조건(기존 로펌 평판 우위, 인맥 0~2)으로 계산, 부족하면 수요를 높이되 "게임 조정"으로 명시. (2) 생존 지표 = 1년·2년 **독립 운영 유지율**(합류·휴업·폐업 없이). (3) 기준 시나리오는 SYS-004 §7 하나.
- 재정 위기는 단계형 선택: 대출(이자·한도) → 축소(공유오피스·직원 감축·광고 중단) → 부업형 수입(국선 확대·협업 하청) → 합류 제안 수락·휴업 → 파산(드묾, 변호사법상 결격 사유라 커리어 치명). 위법 유혹(사무장·브로커)은 위기 때 등장.

## 2026-10-07 — 설정 2차 방향, 명성 감쇠

- 사용자 결정: 개성은 로펌보다 변호사에게, 로펌은 현실적 구조로만 가볍게 구분, 과한 설정 금지, 주인공 연결은 가벼운 생성형 몇 개. 이름·전설·안전 문장·판례는 검토 추천대로. 명성은 천천히 식고 최고점·직함이 바닥. DESIGN-NOTES §2.10 보완.

## 2026-10-06 — 사건-커리어 연결·명성·세계관 기본 결정

- 사용자 결정: 공식 기록은 법률 용어(일부 승소 등), 기사는 기자 말투 허용. 명성은 별(기록 기반·기대 대비), 직함은 출발점만. 실제 도시명만 사용·나머지 가상, 연도는 흐리게, 주인공은 1인 개업 신입. 시작 세계는 혼합 방식(연차 섞인 명단 + 저밀도 선행 시뮬).
- DESIGN-NOTES §2.9·§2.10 추가, §2.8의 "판정승" 예시 정정. 기준 데이터 docs/reference/ (변호사·로펌 현황 2026.9, 로펌 매출 2025, 사법연감 2026).
- 계약서: WORLD-002(사건-커리어 연결), SETTING-001(세계관 설정집 초안).

## 2026-09-30 (저녁 2) — DEC-032 법체계 팩

- 사용자 결정 “올리자”. `DEC-LITIGATION-032` Accepted: 한국 법 근간, 가상 세계 표현, 엔진 중립 + `ko` 팩, 과잉 설계 금지, 하드코딩 검사 테스트. 기존 실험 코드는 production 이관 시 정리.
- System Map “법률 범위” 미정 해소. AGENTS.md 한 줄 추가.

## 2026-09-30 (저녁) — 재판 전 물밑 작업, 법체계 팩

- 사용자 결정: 한국 법에 근간을 둔다(미국식 deposition·디스커버리 미도입).
- DESIGN-NOTES §1.13 재판 전 물밑 작업(계획): 기록 열람, 증거 동의/부동의, 선고 전 합의 마감, 형사공탁, 양형 자료, 증거보전, 보석, 불기소 의견서, 면담, 사설 조사, 언론. 윤리 위험이 핵심 긴장.
- §1.14 법체계 팩: 다른 나라 전환 원칙은 기존 문서에 명시돼 있지 않고 흔적만 있음을 확인. 엔진은 법체계 중립, 한국 규칙은 `ko` 팩 데이터로 모으되 두 번째 팩은 필요할 때(ARCH §10). DEC 승격 여부는 사람 결정.

## 2026-09-30 (오후 3) — 역량 체감 설계

- DEC-031 v1.1: N4를 "능력은 행동과 기록을 통해 작용한다"로 명확화. 준비·신문·증거 연결·상대 측·자동 진행 경로 명시.
- DESIGN-NOTES §1.11 강한 상대와 역전 설계, §1.12 베테랑 강점 유형(법리/인맥/기술 고문/육각형)·이름표만 공개·동료 조언 창구(계획, 데모 이후).
- DEMO-001: 같은 사건을 신참/베테랑 검사 두 버전으로. 차이는 상대 행동 데이터로만.

## 2026-09-30 (오후 2) — DEC-031 수치 판정 모델, Proposed DEC 일괄 정리

- 사용자 결정 “전부 권장사항대로 진행”. `DEC-LITIGATION-031` 신설(Accepted).
- 판정: 내부 수치·합산·쟁점별 최소 요건 허용, 플레이어에겐 언어만. 같은 출처 비중첩, 능력·관계·전관 비가산, 기록 단위 설명, 법정 RNG 금지. DEC-012 부분 대체.
- DEC-014 원칙만(절차 대체), 015·016·027·029 채택, 017 개정 채택(내부 수치 허용), 022 원칙 채택, 028 채택 + 형사 피해자 합의(처벌불원) 보완. 남은 Proposed DEC 없음.
- AGENTS.md: DEC의 Hard invariants는 구속, semantic 층 분리는 참고(병합 가능).

## 2026-09-30 (오후) — 문서 정합성 점검

- `docs/AUDIT-2026-09.md` 추가. 결정이 아니라 점검 결과다.
- 최대 모순: DEC-012 등의 숫자 합산·능력 가산 금지 ↔ v0.10·GEN-001·WORLD-001·§1.9의 숫자 모델. 플레이테스트 후 사람 결정.
- Accepted DEC-018~021·023~026이 Proposed 014~017·022에 의존. SYS-002~007 부재(경영 설계 공백).
- 한국 실무 공백: 증거동의/부동의, 처벌불원·합의, 양형·집행유예, 형사 성공보수 무효(2015다200111, generator는 이미 0 처리), 국선, 국민참여재판.

## 2026-09-30 (오전) — 자동 진행·증언 원칙, GEN-001 진행

- GEN-001(Claude Code + Codex): 반전 발동 버그 수정, 시작 강도 조정, 형사 원형 2개(폭행치상, 음주운전), 폭행 반전 4개, 끝까지 플레이 가능. 42 테스트 통과. 콘텐츠 기준 무죄율 폭행 77%(목표 초과), 음주운전 57%(반전 0개)
- 결정(사람): 승부 사건 생성은 당분간 형사 원형만. 임대차는 일상 사건 출력만(민사 입증 책임 모델 미정)
- 결정(사람): 일상 사건 자동 진행과 전망 → `DESIGN-NOTES-2026-09.md` §1.9. 역배는 주사위가 아니라 조사하지 않은 숨은 반전으로 설명한다
- 결정(사람): 증언은 성실하지만 틀릴 수 있다 → §1.10. 콘텐츠 대사 기준

---

## 2026-09-30 — WORLD-001 2·3차, 업계 소식 설계

- WORLD-001 2차(Codex, 로컬 커밋만): 휴직 연 6.2~6.5%, 인구 고정 제거(680→785~801), 수입 기준 순위, 10배 규모(로펌 35·변호사 600·판사 50·검사 30), 시드 3개 비교. 10년 약 11초
- 리뷰(Claude)에서 발견: 첫 달 152명이 1인 사무소로 몰림(채용 정원 없음), 사건 공급이 인구에 비해 1/6, 로펌 12개 상한으로 개업 불가, 기업 자문 수입 편중 → 3차 진행 중
- 결정(사람): WORLD-001은 가상 실험이므로 라운드마다 커밋하지 않는다. 결과 파일(`out/`)은 커밋하지 않고, 괜찮다고 판단한 시점이나 교차 리뷰 전에만 `RULES.md`·`REPORT.md`를 커밋
- 결정(사람): 인게임 "업계 소식" 화면을 만든다 → `DESIGN-NOTES-2026-09.md` §2.8. 다음 라운드에서 기사에 분류·중요도·관련 ID를 붙이고 연말 10대 뉴스 추가. 대형 사건 판정승과 판례 수정자는 WORLD-002로

---

## 2026-09-28 — CURRENT를 현재 상태 중심으로 축소

- Codex: `docs/CURRENT.md`를 현재 버전·목표·lane·구현 요약·안정 코어·부채·제품 질문·활성 계약·미결정·핵심 링크로 정리.
- 이 CHANGELOG에 없던 v0.65/v0.7 기준점과 v0.7.1〜v0.9.1 핵심 구현·검증 이력을 아래에 요약 이동. 이미 있는 v0.10 이력은 중복 추가하지 않음.
- 결정 상태 유지: 본류·엔진·통합·출시 일정 판단과 사람 플레이테스트 대기는 그대로다. Accepted design, 9월 실험 설계 메모, 코드·프로토타입은 변경하지 않음.
- 검증: 문서 링크·필수 항목·diff 확인. 문서만 변경하여 실행 테스트·기존 테스트 로그·Review Packet은 갱신하지 않음.

---

## 2026-09-28 (오후) — 실험 lane 규칙 보완

- `AGENTS.md` 실험 lane: 에이전트가 계약서 범위 안의 규칙을 정하고 `RULES.md`에 기록(DEC 모순 시에만 질문), 완료 전 `REPORT.md` 자체 점검 필수, 목요일 교차 리뷰 — Claude
- 계기: WORLD-001 착수 시 Codex가 "DEC에 없는 규칙 임의 구현 금지"와 충돌해 멈춤. 사람이 "진행, RULES.md에 기록"으로 결정

---

## 2026-09-28 — 워크플로 확립, 저장소 정리

**커밋**
- `2efadab` 두 갈래(실험/생산) 워크플로, markmap 로드맵, 이번 주 작업 계약서 4개 — Claude
  - `AGENTS.md`: Work Lanes, Context budget, Parallel agents(Orca) 절 추가 (기존 규칙보다 우선)
  - `CLAUDE.md`: Claude Code가 `AGENTS.md`를 따르도록 연결
  - `WORKFLOW.md`: 주간 리듬(월 계약 → 화~수 구현 → 목 통합·교차 리뷰 → 금 플레이테스트)
  - `ROADMAP.md`: VS Code Markmap으로 보는 진행 지도
  - `.gitattributes`: LF 통일 (CRLF 잡음 제거)
  - `.agent/tasks/`: GEN-001(사건 생성기), WORLD-001(세계 시뮬레이터), DEMO-001(데모), PLAYTEST-001

**저장소 정리 (사람, Claude 안내)**
- 병합 완료된 옛 worktree 11개 제거, 로컬 브랜치 정리. GitHub 원격은 `main`만 남김
- 커밋 안 된 작업은 버리지 않고 보관 브랜치로 이동:
  - `archive/dec-030-034-drafts`: DEC-030~034, TEST-029~033, AUDIT-001 초안 11개 (main에 없음. main의 DEC-030은 다른 문서)
  - `archive/old-main-wip`, `archive/vs-005-wip`: 옛 초안 (main에 최신본 있음)
  - `backup/wip-0928`: 정리 직전 main의 미커밋 변경 전체
- 보관 파일 보기: `git show archive/dec-030-034-drafts:<파일명>`

**도구**
- Orca(병렬 에이전트), Claude Code CLI, Codex CLI 사용. 작업마다 `task/<계약서 ID 소문자>` worktree
- Claude GitHub 앱 연결 완료 (클라우드 세션에서 저장소 읽기 가능)

**결정**
- 목표: 2027년 2월 Steam Next Fest (2/22~3/1, 등록 마감 1/10, 언론 데모 1/25). 얼리 액세스는 페스트 **이후** (페스트 전 출시 시 참가 불가, 게임당 1회만 참가)
- 10월 말 판정: 외부 3~5명이 "한 판 더"를 원하면 2월, 아니면 6월(6/14~21, 등록 4/25)
- 법정 연출은 텍스트 중심. 그래픽 연출은 당분간 범위 밖 (사용자 결정)

**미결정**
- 최종 엔진: 웹(Electron 포장) 권장만 됨. Godot `litigation-skeleton/`은 보관 상태
- 대립 공판(v0.10)과 신문 법정(v0.9.1) 중 어느 방식을 본류로 할지 → 플레이테스트 후

---

## 2026-09-27 — v0.10 대립 공판 실험

- `462fa5d`(로컬 원본) → main 적용 커밋: Add v0.10 adversarial trial experiment — Claude
- `courtroom-prototype/trial.html` 새 진입점. 기존 `index.html` 법정과 엔진은 변경 없음
- 흐름: 준비(반나절 4회 조사 → 카드) → 개회사(주력 쟁점, 칼 접촉 입장) → 검사 주신문 자동 진행 + 이의 창 → 반대신문 접근법·결론 요구 → 검사 재주신문 → 재반대 → 판결(all_required) → 복기
- 판세는 재판장 메모 문장으로만 표시, 숫자 없음. 무작위 없음
- 검증: Node 247, trial browser 217. 상세 `courtroom-prototype/REVIEW_PACKET.md` v0.10 절, 규칙 `EXPERIMENT_RULES.md` v0.10 절
- 사람 플레이테스트 질문 9개: 루트 `REVIEW_REQUEST.md`

---

## 2026-09-25 — v0.7.1〜v0.9.1 구현·검증 이력 요약

2026-09-28 Codex가 기존 `docs/CURRENT.md`에서 옮긴 기록이다. 아래 수치는 당시 실행 결과이며 이번 문서 정리에서 재실행한 결과가 아니다. 상세 구현·회귀 설명은 Git의 정리 전 CURRENT와 각 `.agent/tasks/COURTROOM-CORE-*.md`에서 확인한다.

### v0.9.1 — 전체 흐름 UI/UX polish

- 구현 `37d5b69`, 기준 `courtroom-core-v0.9` → `839628409b3563cbe13473b5cc855cd1db173ba8`. 엔진, `services/courtroom.js`, `data/case.js`는 기준과 byte-identical.
- 중앙 다음 증인 action, 단계별 증인 자료·불가능한 버튼 숨김, Closing 기록 sheet 연결, focus/scroll/details 보존, reset UI 상태 초기화와 중복 문구 정리. 자동 인용·새 사건·판정 규칙은 추가하지 않음.
- large/short/mobile에서 A(전체 흐름·reset 후 B 재시작), B(Peripheral), C(전략·Closing conflict), D(test-only guilty)를 검증. 배포 사건은 `not_guilty` 유지.
- Node 228 + Browser 1189 + UI budget 75 = **1492 고유 검사, 실패 0**, 각 명령 exit 0. budget의 재실행 187개와 기준 캡처 424개는 합계에서 제외.
- 모바일 A 경로 높이: Opening 1210→903, Closing 1345→931, Verdict 1300→1043px. 기존 신문 budget과 전체 단계 비교를 유지하며 산출물은 `ui-budget-examination-current.json`, `ui-budget-flow-current.json`으로 정리.
- 당시 문서 상태는 독립 리뷰·사용자 플레이테스트 대기, v1.0 polish 후보이며 최종 승인과 구분. 남은 P2는 Closing 수동 인용과 누적 기록 탐색의 반복 클릭감이다.

### v0.9 — 기록 기반 FactFinding / Verdict

- 구현 `f143986`; 사용자 전달 Independent Reviewer PASS를 기록한 기준 tag `courtroom-core-v0.9`는 `8396284`. 이전 기준 v0.8.1 tag는 `529371f3679318154d8508daf11d6f2785113508`.
- authored proof/doubt, 필수 쟁점과 부담 선언, 세 CourtRecord 층의 입력 참조를 사용하는 판정·replay 추가. 양측 완전 입증이 상충하면 미해결로 유지. `verdict_delivered` 외 기존 기록을 보존.
- Node 228 + Browser 591 + UI budget 14 = **833, 실패 0**, 각 명령 exit 0. recorded/sparse/no-Closing × 3화면과 mobile direct-file, JSON replay, 기록 불변을 검증.
- 배포 사건에는 완전 입증 경로가 없어 입증 실패; 입증 성공은 synthetic fixture다. 고의는 필수 쟁점 제외. 범용 법률 엔진·전체 세션 저장은 범위 밖.

### v0.8.1 — Closing profile / 문장 중복 교정

- 구현 `d54006d`; 사용자 전달 Independent Reviewer PASS(2026-09-25), 기준 tag `courtroom-core-v0.8.1`.
- Closing phase/action을 전부 선언하거나 생략하는 optional lifecycle 강제, partial profile 거부. 동일 최종 입장 문장만 중복 제거하며 revision/conflict·원 Commitment·기록 replay는 보존.
- Node 198 + Browser 383 + UI budget 14 = **595, 실패 0**. 신규 Node 10개 중 8개가 수정 전 버그 재현; 3화면 full/none profile, direct-file, 기록 불변·replay 검증. No-Closing/partial은 fixture이며 새 사건이 아님.

### v0.8 — Closing / Case-wide Argument Synthesis

- 확보된 authored inference, 수동 Evidence/Admission 인용, Counter 한계·Qualification, Opening 입장 유지/수정으로 Closing을 구성. `closing_position`과 revision/conflict를 기록하고 Evidence/Procedural은 보존.
- Node 188 + Browser 316 + UI budget 14 = **518, 실패 0**, 각 명령 exit 0. 3화면과 mobile direct-file에서 두 증인 → Closing 선택·수정·확정 → replay 검증. 기존 신문 budget과 무패널 추가 유지.
- Counter 대응은 기록 인용/한계 인정이며 새 증거를 생성하지 않음. 당시 판결 미구현 문구는 v0.8 시점의 제한으로, 후속 v0.9 구현을 부정하지 않는다.

### v0.7.1 — Commitment scope / priority 교정

- 구현 `2b499e1`; 사용자 전달 Independent Review PASS(2026-09-25), 기준 tag `courtroom-core-v0.7.1`은 PASS 기록 포함 commit.
- 같은 issue의 active counter가 있을 때만 Major Commitment 검토. priority·authored strategy conflict와 evidentiary challenge 분리. Theory position 값/명시적 unspecified 선언 검증.
- Node 175 + Browser 258 + UI budget 14 = **447, 모두 통과**. 오염/priority 신규 5개는 수정 전 실패·수정 후 통과, validation/progression 2개 추가. 역방향 INTENT counter는 scope fixture이며 배포 고의 증거가 아님.

---

## 2026-09-23 — v0.7 및 v0.65 과거 기준점

- v0.7: Opening authored 조합, 공개 Major Commitment, Working Strategy revision/conflict와 기록 replay 추가. Node 168 + Browser 221 + UI budget 14, 모두 통과. 3화면·localhost/direct-file 검증, v0.65 신문 회귀 유지.
- v0.65 기준 구현: `df648a1e7a73a5d63bed0308a1441ebde1666abd`, tag `courtroom-core-v0.65`. ZIP `courtroom-prototype/THE-FIRM-Courtroom-Core-v0.65.zip`, SHA-256 `AA38FDE794B752636F21FEEF39B870B00A796087B5B3BE0424ACD9CA8D03E455`는 참조 대화 독립 리뷰 대상과 일치한 과거 기준점이다.
- 위 기준점은 변경하지 않는다. `docs/IMPLEMENT.md`의 v0.7 원문과 당시 미구현 목록도 역사적 기록이다. 기존 Review Packet의 독립 리뷰 미확보 문구는 구현 당시 상태이며, 이후 대화의 Witness Examination Core 독립 리뷰에서는 P0/P1 없음이 보고됐다. 사용자 재미 평가는 별도다.
