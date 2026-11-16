# PORTFOLIO-002 — 변론 계획서 + 자동 공판

Lane: experiment
Branch: `task/portfolio-002` (base `task/portfolio-001`) · Owns: `game/`, 루트 `README.md`, `docs/CURRENT.md`·`docs/CHANGELOG.md`(안내 항목 추가만)
사용자 결정(2026-11-16~17): 수정 방향 승인(계획 보드 중심 + 자동 공판, 중요한 순간만 개입), 사무소↔재판 연결은 "조사 횟수" 대신 "초안의 충실도", 능력치를 숫자로 적극 도입, 재미없는 요소 쳐내기, 노련한 검사는 데모에서 제외, 명조는 한양 바탕, 사건 정리 노트·플레이어 수정은 필기체.

## Goal
PORTFOLIO-001의 수동 법정을 걷어내고, 한 판의 중심을 **변호사가 쓴 변론 계획서를 플레이어가 펜으로 고치고 날인하는 화면**으로 옮긴다. 공판은 계획대로 자동으로 흐르고, 담당 변호사의 법정 대응이 낮을 때만 결정적인 순간에 플레이어를 부른다.

## Scope
- `src/plan.js`(신규): 변호사 능력치, 초안, 계획 수정, 계획 → 공판 명령, 자동 공판의 다음 한 수. 순수 함수.
- `src/case-sheet.js`(신규): 계획 보드용 이름표·연결표(판정 수치 없음).
- `src/session.js`: 장면 `plan`, 명령 `beginPlan`·`editPlan`·`sealPlan`·`decide`. 저장 v2.
- `src/bridge.js`: 기록 검토 단계 값을 "초안 확인 항목 기본값"(3/2/1)으로.
- `src/ui.js`·`style.css`: 토큰 v2(기록철), 계획서 화면, 자동 공판 재생·개입 화면. 사무소 화면은 문구와 토큰만.
- `assets/fonts/`: Firm Batang(한양 바탕 OFL 부분집합, 이름 변경), Firm Pen(나눔손글씨 펜 OFL 부분집합, 예약 이름 때문에 이름 변경).

## Forbidden
- `vendor/` 수정(해시 테스트), 엔진 안의 판정·경제 수치 변경, 무작위.
- `courtroom-prototype/`, `litigation-skeleton/`, Accepted DEC 수정.

## 완료 기준
1. 타이틀 → 상담 → 5업무일 → 계획서 → 자동 공판(개입) → 결산이 막힘 없이 이어진다.
2. 기록 검토 시점과 담당 변호사 능력치가 초안의 확인 항목 수·합의 조언·개입 횟수·질문 수를 바꾸고, 그 차이가 판결까지 이어진다(테스트).
3. 같은 선택 → 같은 기록·판결. 실패한 명령은 상태를 바꾸지 않는다. 결정 대기 중 저장을 다시 읽으면 같은 화면.
4. 새 규칙은 `game/RULES.md`, 자체 점검은 `game/REPORT.md`.

## Tests
`cd game && node --test tests/game.test.js` · `python3 tests/browser_play.py`

## 통과 기준
위 완료 기준과 **사람 플레이테스트**. 자동 검사 통과는 재미의 증거가 아니다. 병합은 사람이 결정한다.
