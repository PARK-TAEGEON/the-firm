# THE FIRM — Current State

갱신: **2026-10-14** · 이 문서는 **GitHub에서 확인된 상태와 사용자 진행 보고**를 구분하는 짧은 진입점이다.

**진행 상황을 먼저 보려면 [ROADMAP.md 분야별 Markmap 현황판](../ROADMAP.md)을 펼친다.**  
- ✅ main 확인 · 🧪 별도 PR/브랜치 · ▶️ 사용자 작업 중(원격 확인 전) · 📝 Proposed/설계만 · ⏸️ 보류
- **GitHub `main` 기준:** `30dc3b25fa7cef6a600a689cd0b1a1cac49cd1d8` (2026-10-14 조회, 마지막 커밋 10/8). 로컬 `Documents/ChatGPT/The Firm` 미커밋 변경이나 외부 Codex/Orca 미푸시 변경은 조회할 수 없었다.
- **이 문서의 '진행 중'은 완료/승인을 뜻하지 않는다.** 브랜치 보고된 자동 테스트와 현재 재판 P0/P1 구현 검증을 합산하지 않는다.

## 바로 보는 이번 우선순위

1. **재판 P0:** 증거 출처/필수요건/결과 계약의 판정 안정화. 10/14 Court System v1.0 설계는 대화에 공유됨. GitHub 구현/최종 리뷰 완료 여부는 **미확인**.
2. **재판 P1:** 정민호 사건 준비 → 배정/능력 E/A/I → 자동 공방 → 조건부 개입 → 판결/OutcomeEnvelope. **사용자가 작업 중이라고 보고**, 현재 원격 diff·테스트 결과 미확인.
3. **UI:** 재판 UI 작업 **사용자 보고 진행 중**. 이후 Figma 디자인 스프린트; 실제 구현 확인 후 화면 구조/브라우저·사람 검증.
4. **후속 기획:** 조직/HR 및 World·Business 규칙은 기존 DEC/실험을 활용, 새 수치와 인사 정책은 Proposed로 유지. 재판 구현을 막지 않음.

## 분야별 현황 (2026-10-14 확인)

| 분야 | 확인된 산출물/상태 | 다음 검수 |
| --- | --- | --- |
| **재판·Litigation** | **main:** 웹 v0.9.1 `index.html`, v0.10 `trial.html`, Godot VS-001~006 (한정된 사실인정). **별도:** [PLAN-DEMO PR #12](https://github.com/PARK-TAEGEON/the-firm/pull/12) 상담·계획·자동 실행·기록. **사용자:** P0/P1 작업 중 | P0 새 회귀 확인 → P1 수직 슬라이스 실제 완주·개입 0회/기록 기반 판단 |
| **UI/UX** | 기존 main 법정 UI 및 PR #12 화면. 현재 UI 개선은 사용자 보고이며 코드 상태 원격 미확인 | 정보 구조·가독성·모바일 확인, 다음 Figma 디자인 |
| **사건 제작/GEN** | [task/gen-001](https://github.com/PARK-TAEGEON/the-firm/tree/task/gen-001) GEN-002 사건/문구/자동 정책 실험. [REPORT](https://github.com/PARK-TAEGEON/the-firm/blob/task/gen-001/courtroom-prototype/generator/REPORT.md)에 당시 자동 검증 보고. **main 미통합** | 생성물이 새 Court v1.0 데이터 계약과 맞는지, 다른 사건의 전략 차이·사람 플레이 검증 |
| **World·Career** | [task/world-001](https://github.com/PARK-TAEGEON/the-firm/tree/task/world-001/courtroom-prototype/world) 74명·10년 headless 실험; 자동 검증 보고, 사람 리뷰 대기. [WORLD-002 계약](../.agent/tasks/WORLD-002.md)은 구현 보장 아님 | 사건·이력·명성·NPC 조직 이동 연결 |
| **Organization·HR** | [DEC-017](../DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md)·[DEC-026](../DEC-LITIGATION-026_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md) 핵심 불변 조건 Accepted. [ORG-HR-001](plans/ORG-HR-001.md): 4+1 직급, 승진·보수·성향/존경·만족·이직 **Proposed** | 인사 3~5년 시뮬레이션, 사건팀 검토 병목, 실제 임금/고용 법규 확인 |
| **사무실·인간관계** | [PR #13](https://github.com/PARK-TAEGEON/the-firm/pull/13)에 ORG-OFFICE-001 및 WORLD-RELATIONSHIPS-001. **미병합 설계** | 사무실 구역 UI, 관계 첫인상/영구 ID·페이스팩/별칭 에디터 후순위 |
| **Business·수임** | [SYS-004 v0.3](https://github.com/PARK-TAEGEON/the-firm/blob/task/sys-004/SYS-004_BUSINESS.md) 현금·미수·수입·재정 위기 및 인건비 산식 **Proposed 별도 브랜치** | 사건 추가 수임·고용 비용·현금흐름 및 법적 형태의 실제 경계 검증 |
| **QA/릴리스** | main의 과거 단위/브라우저·Godot 테스트와 별도 실험 보고 존재. **현재 Court v1.0의 통합 플레이/브라우저·사람 검수는 미확인** | P0/P1 리뷰 → 외부 플레이 → 출시 목표 재산정 |

## 저장소 기준선과 착각하기 쉬운 경계

- **웹 법정 v0.9.1**은 CaseTheory→Opening→증인 2인→Closing→기록 기반 사실인정의 **별도 수동 실험**이다. 구현돼 있다고 해서 새 자동 재판 v1.0이 완성된 것은 아니다.
- **웹 대립 공판 v0.10**은 준비→공방→판정→복기의 기존 실험이다. 숨은 숫자·절차 수순 문제 때문에 v1.0에서는 구조를 선별 활용한다.
- **PLAN-DEMO PR #12**는 '재판 시작 전 현장 대응 포함 여부'를 바꿔 자동 재생한 실험이다. 공통 E/A/I 및 **재판 중 판단 요청·중단·재개**까지 구현했다고 보지 않는다.
- **Godot VS-006**은 출처·버전·scope의 한정된 사실인정 검증이다. 전 범용 판결·Business 연결·자동 상대 AI가 구현된 것이 아니다.
- **GEN/WORLD/SYS-004**는 서로 다른 브랜치의 작업. 테스트를 재실행하거나 병합하지 않았으므로 현재 main 구현으로 표시하지 않는다.
- 과거 9월 작업 계약과 `WORKFLOW.md`의 요일별 일정을 현재 최우선순위로 사용하지 않는다. [CHANGELOG](CHANGELOG.md)와 Git 이력은 그대로 보존한다.

## 설계 권위와 작업 루틴

- 최상위 원칙: [게임 헌법](../00_GAME_CONSTITUTION.md), [SYSTEM MAP](../01_SYSTEM_MAP.md), [ARCHITECTURE RULES](../02_ARCHITECTURE_RULES.md), **Accepted DEC**.
- 최근 재판 방향: 2026-10-14 Court v1.0 설계 패키지(대화 제공, GitHub 미반영), [PR #9 수직 슬라이스 계획](https://github.com/PARK-TAEGEON/the-firm/pull/9), [PR #11 재판 설계 현황판](https://github.com/PARK-TAEGEON/the-firm/pull/11). 후자의 내용은 별도 브랜치에 있으며 main에 병합되지 않았다.
- 이후 조직 설계: [ORG-HR-001](plans/ORG-HR-001.md)과 [PR #13](https://github.com/PARK-TAEGEON/the-firm/pull/13). **수치/알고리즘은 Proposed**, 현재 확정 기능 아님.
- 실행·테스트와 코드 리뷰: [AGENTS](../AGENTS.md), [WORKFLOW](../WORKFLOW.md). 실험과 Production의 리뷰 조건을 구분한다.
- 과거 코드 상세·기술부채는 [법정 REVIEW_PACKET](../courtroom-prototype/REVIEW_PACKET.md), [Godot README](../litigation-skeleton/README.md), [CHANGELOG](CHANGELOG.md)에 보존.
- 기존 2027년 2월 Next Fest 출품 목표는 **재판·UI·사람 플레이테스트가 확인되기 전까지 현재 확정 일정으로 간주하지 않는다**.

## 다음 보고 시 갱신 규칙

- 새 항목은 `main/별도 브랜치/사용자 보고/Proposed/보류` 중 근거 있는 상태 하나를 붙인다.
- 구현 완료는 코드 경로+diff+실행 결과/검수 근거가 있어야 한다. 자동 테스트 ≠ 재미/법률 검증.
- 변경된 것은 [ROADMAP.md](../ROADMAP.md) Markmap에도 반영한다. 과거 기록과 미병합 PR을 조용히 완료로 바꾸지 않는다.
