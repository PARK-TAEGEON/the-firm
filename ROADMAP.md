---
markmap:
  initialExpandLevel: 2
  colorFreezeLevel: 2
---

# THE FIRM · 분야별 작업 현황판 · 2026-10-14

## 🔎 읽는 법
- ✅ **main 확인**: 저장소 기본 브랜치에 있는 구현·Accepted 결정
- 🧪 **별도 브랜치/PR**: 작업물이 있지만 아직 main에 병합되지 않음
- ▶️ **사용자 진행 보고**: 대화에서 진행 중이라고 확인, 로컬 작업/테스트 완료 여부는 원격에서 미확인
- 📝 **설계/제안**: 문서는 있으나 기능 구현·실제 플레이 검증과 구분
- ⏸️ **후순위/미정**: 요구는 있지만 지금의 P0/P1 완료 조건은 아님

## 🎯 이번 우선순위
- ⚖️ [Court v1.0 P0 → P1](docs/CURRENT.md): 판정 안정화 → 정민호 사건 자동 재판·조건부 개입·결과 연결
- 🎨 UI/UX: 사용자 별도 작업 진행 중. 정보 구조와 가독성 우선; **Figma 최종 디자인은 후속**
- 🧪 P1 게이트: 동일 기록 동일 판결, 능력 E/A/I의 업무·기록 효과, 필수 개입 0회, 실제 데모 완주
- 🗂️ 문서 정리: **구현·브랜치·미래 설계**를 서로 혼동하지 않기

## ⚖️ Litigation · 재판 시스템
### ✅ main에 있는 실험 기준
- [v0.9.1 신문 법정](courtroom-prototype/index.html): CaseTheory → 증인 신문 → 판정, 수동 조작 실험
- [v0.10 대립 공판](courtroom-prototype/trial.html): 조사·신문·이의·재주신문·복기
- [Godot VS-001~006](litigation-skeleton/README.md): 조사·분석·제출·한정된 사실인정, **범용 재판 엔진 아님**
### 🧪 별도 실험 및 설계
- [PR #12 PLAN-DEMO](https://github.com/PARK-TAEGEON/the-firm/pull/12): 상담 → 계획 검토 → 자동 실행 → 기록 확인; 실시간 부분 개입/공통 능력 엔진과 구분
- [PR #9 수직 슬라이스 계획](https://github.com/PARK-TAEGEON/the-firm/pull/9) · [PR #11 설계 현황판](https://github.com/PARK-TAEGEON/the-firm/pull/11) (미병합)
- 📝 2026-10-14 **Court System v1.0 설계 패키지**: 대화에 전달됨, 저장소 본류 구현 완료 아님
### ▶️ 현재 사용자 작업 · 원격 완료 확인 전
- P0: 입증 조건·중복 출처·조기 제출·결과 계약 점검
- P1: 정민호 사건 준비 → E/A/I 담당 → 자동 진행 → 조건부 개입 → OutcomeEnvelope
### ⏭ 다음 검증
- 실제 코드 diff·회귀·브라우저/사람 플레이 결과 확인 → 다음 기능으로 확장

## 🖥️ UI/UX · 표현
### ✅ 기존 화면
- [main 법정 2종](courtroom-prototype/) 및 [PLAN-DEMO 화면(PR #12)](https://github.com/PARK-TAEGEON/the-firm/pull/12)
### ▶️ 사용자 진행 보고
- 재판 UI 개선 작업 **진행 중**, 로컬 구현/브랜치 상태 미확인
### 📝 후속 설계
- [사무실 풍경·좌석·직급별 배치 (PR #13)](https://github.com/PARK-TAEGEON/the-firm/pull/13)
- Figma 스프린트: 로펌 허브 → 변론 계획 → 프로필/사무실 → 법정 화면
- 디자인은 표시 계층. 재판·인력·재무 계산은 UI에 넣지 않음

## 🗃️ Cases / GEN · 사건 제작
### 🧪 생성기 실험 브랜치
- [task/gen-001](https://github.com/PARK-TAEGEON/the-firm/tree/task/gen-001): 원형·반전·사실/증거/문구·자동 정책
- [GEN-002 보고](https://github.com/PARK-TAEGEON/the-firm/blob/task/gen-001/courtroom-prototype/generator/REPORT.md): 자동 검증 보고, 사람 재미·문구 검증은 별도
### ⏭ 다음 검증
- Court v1.0의 재사용 가능한 CaseDefinition / 출처/법률 요건 계약과 생성물 일치
- 다종 사건이 **실제로 다른 판단**을 유도하는지 검사. 대량 생산은 보류

## 🌍 World / Career · 법조 세계·명성
### 🧪 시뮬레이션
- [WORLD-001 headless 실험](https://github.com/PARK-TAEGEON/the-firm/tree/task/world-001/courtroom-prototype/world): 74명 출발·10년 진행·뉴스; 사람 리뷰·병합 대기
- [WORLD-002 작업 계약](.agent/tasks/WORLD-002.md): 사건 → 커리어·명성·뉴스, 구현 완료로 표시하지 않음
### 📝 후속 설계
- [법조인 관계·첫인상·페이스팩(PR #13)](https://github.com/PARK-TAEGEON/the-firm/pull/13)
- 명성 별 0.5~5는 공개 업계 평가의 요약, 실력·호감·법정 가산점 아님
### ⏭ 다음 검증
- 주요 인물 영구 ID·사건 이력·영입/이탈·명성 기록 연결

## 👥 Organization / HR · 조직·인사·팀
### ✅ 확립된 경계
- [DEC-017 역량·성장](DEC-LITIGATION-017_LAWYER_CAPABILITY_AND_PRACTICE_PROFILE.md) · [DEC-026 업무·검토·인수인계](DEC-LITIGATION-026_TASK_ASSIGNMENT_WORKLOAD_AND_TEAM_COORDINATION.md)
- 상설팀 / 사건별 팀 / 지도 관계 분리, 실제 작업·검토 시간이 소모되는 구조
### 📝 제안/설계
- [ORG-HR-001](docs/plans/ORG-HR-001.md): 4+1 직급, 승진·보수·NPC 성향/존경/만족·협상·이직
- [ORG-OFFICE-001 (PR #13)](https://github.com/PARK-TAEGEON/the-firm/pull/13): 사무실 계층·좌석·조직 성장
- 7단계 규모 S0~S6, 비법인/법인 형태 분리, 파트너 운영 정책: **대화 기반 제안, 아직 새 Accepted DEC 아님**
### ⏭ 다음 검증
- 인력 10~20명·3~5년 보수/이직/교육 실험, 사건팀 인수인계·검토 병목 확인

## 💰 Business · 수임·재무·법적 형태
### 🧪/📝 별도 경영 설계
- [SYS-004 v0.3 (task/sys-004)](https://github.com/PARK-TAEGEON/the-firm/blob/task/sys-004/SYS-004_BUSINESS.md): 현금·미수·인건비·생존/수요 산식 **Proposed**
- 수임료·인건비 예시와 조직 법적 형태는 실험값/확인 필요 법률을 구분
### ⏭ 다음 검증
- 사건·직원 채용이 **추가 수임**, 실제 수행시간, 인수인계 비용, 현금 지급과 연동되는지
- 법인 전환 강제 금지. 비법인 공동사무소/법무법인/유한은 법적 형태와 규모를 별도 관리

## 🧪 Test & Review · 품질 게이트
### ✅ 기존 기록(당시 기준)
- v0.10 / Godot VS 테스트 기록은 해당 기능 범위만 의미
- PLAN-DEMO, GEN, WORLD의 자동 테스트는 각각 **별도 브랜치 보고**, 현재 Court v1.0 구현 테스트로 합산 금지
### ▶️ 미확인 또는 대기
- 현재 로컬 P0/P1 코드·UI 브라우저 검증 미확인
- 실제 사람 플레이테스트는 자동 테스트와 분리하여 판정
### ⏭ 검수 순서
- P0 기록·법리 불변 조건 → P1 한 사건 완주/UX → 두 번째 사건 → 복수 사건 경영

## 🧭 프로젝트 운영 · 출시
### 📚 읽는 순서
- [CURRENT 요약](docs/CURRENT.md) → **이 Markmap** → 분야별 DEC/Proposed → 해당 작업 계약
- [WORKFLOW 개발 규칙](WORKFLOW.md) · [AGENTS 권한/브랜치 정책](AGENTS.md)
### 📌 Git 상태
- `main`은 이전 버전 실험 기준; 열린 PR #7~#13 중 작업별 미병합 항목 존재
- 로컬 미커밋 파일·Codex/Orca의 미푸시 작업은 이 지도에서 원격 확인 불가
### ⏸️ 출시 계획
- 이전 로드맵의 2027년 2월 Next Fest 목표는 **현행 일정 확정이 아닌 재검토 대상**
- 데모 완주·사람 플레이테스트 결과를 확보한 뒤 외부 일정 결정
