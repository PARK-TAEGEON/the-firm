# THE FIRM — 작업 기록 (Changelog)

에이전트(Claude, Codex)와 사람이 공유하는 활동 기록이다. 최신이 위. 새 작업을 병합할 때마다 한 항목을 추가한다.
형식: 날짜 · 무엇을 · 어디에 · 누가 · 결정/미결정. 설계 상세는 `docs/DESIGN-NOTES-2026-09.md`.

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
