# TF-UI-001 · 리뷰 패킷 v1.0.0

## 목적과 범위

PR #12 d6fa4a3의 상담→계획→법정→기록을 보존한 독립 디자인 검증물. G0 근거 고정, G1 세 시안/시스템/브라우저 증거를 제출하고 G2 사람 디자인 선택을 기다린다. G3 게임 UI 구현과 G4 기능·사람 체험은 시작하지 않았다.

변경 경로는 .agent/tasks/TF-UI-001.md와 docs/sprints/TF-UI-001/**만이다. 원본 checkout의 미커밋 변경, main, 다른 PR, Godot, 기존 HTML/UI/서비스/엔진/데이터/테스트/CI는 수정하지 않는다. baseline의 tracked 파일 303개 SHA-256을 모두 보호한다. baseline PR #12/#11 두 HEAD는 지정 SHA와 동일했다.

## 변경 파일과 요약

- Task Contract: G0–G2 Owns와 닫힌 G3/G4, 역할·검수·commit 경계.
- BASELINE / IA: 버전·실행·기존 한계·상태 출처·Godot 참고 구분.
- index.html: 세 안 비교, 추천 A와 이유, 네 단계·시스템·영상 링크.
- variants/A,B,C/index.html + 각 크기 PNG: 사건철 / 발언 무대 / 세로 업무 흐름.
- fixture.js: 기존 공개 상담 8개·카드 4개·포함/제외 실제 기록과 outcome의 고정 스냅샷.
- mockup.js / styles.css: 표시 상태와 탐색만 수행. 원본 게임 로직을 로드·복제하지 않음.
- DESIGN-SYSTEM / tokens / components: 공통 의미, 시각 토큰, 키보드, 긴 한글·발언, 미실행·기회 없음·오류.
- RULES / DECISIONS / REPORT: authored 표시 규칙, 미승인 상태, 자체 점검.
- tools 및 evidence: 재현 도구, 전후 회귀, 보호 해시, 실제 Edge 화면·영상, 결과.
- REVIEW.md: 독립 Reviewer **PASS — G0/G1에 한정**. P0/P1 없음, P2 2건은 1차 수정 후 해결 확인.

## 강제하는 불변 조건과 검사

1. 상담 원문 그대로; fixture 발언 ID/순서/내용·outcome은 기준 서비스와 일치.
2. renderer와 반복 탐색/승인 연습이 fixture 원본을 바꾸거나 기록을 중복시키지 않음.
3. 계획 포함, 실제 수행, 증인 답변, 검찰 반론, 법원 판단이 서로 다른 표시.
4. actor의 전체 lines를 보존. 방어 측 record 안의 검찰 발언도 반론으로 표시.
5. 내부 숫자·숨은 진실 없음; raw verdict 마커 대신 session outcome 표시.
6. 303개 원본 보호 해시 불변; 허용 경로 밖 변경 없음.
7. 세 크기 실제 Edge overflow/주 행동/키보드·focus·콘솔, 원문 접근·수정 취소/저장·상담 재방문 검사.

G1 상태·표시 불변 검사이며 G3 실제 서비스 integration 검사의 대체가 아니다. 새 invariant positive/negative는 포함 vs 제외, 수정 취소 vs 저장, 반복 재진입 및 fixture 불변을 대조한다. 표시 오류/기회 없음은 합성 fixture, 실제 실패 command의 원자성은 기존 필수 서비스 회귀에 맡긴다.

## 실행 명령과 결과

courtroom-prototype: npm test; node --test tests/demo.test.js tests/plan-demo.test.js tests/plan-demo-ui.test.js; npm run test:browser; npm run test:trial; npm run test:budget.
repo: node docs/sprints/TF-UI-001/tools/verify.cjs --video.
환경은 BASELINE에 기록. 최신 합계/failures/exit code는 evidence/test-results.log와 evidence/results.json / evidence/post-tests에 확정한다. 최초 자체 점검의 A 짧은 화면 버튼 위치와 hex shorthand 검사기 오류를 수정했으며 최종 결과만 최신 로그로 제시한다.

## 남은 한계·미구현·설계 판단

### 최종 실행 결과 / 1차 검토 수정

필수 기존 회귀 286/0/exit0, 실제 Edge 목업 526/0/exit0(보호303 포함), 영상 72.56초. 필수+목업 reported checks812/0이며 고유 게임 테스트 수로 합산하지 않는다. 기존 optional 세 명령은 focus/favicon의 baseline 실패로 남았고 예산 경로도 무변경 baseline에서 동일 실패를 재현했다. 모든 검사 통과라고 포장하지 않는다.

독립 Reviewer의 P2 편집 조작 마찰을 1차 수정했다: checkbox로 초점이 이동해도 저장/취소 toolbar가 보이도록 편집 중에만 고정한다. 1280/390에서 버튼 노출·체크박스 가림 없음 12 checks 추가, 관련 G1 전체 및 필수286 재실행. C의 줄바꿈 숨김으로 문장이 붙어 보이던 부분은 공백과 최종 화면 재촬영으로 정리했다. Reviewer는 구현 파일을 수정하지 않았다.

승인 artifact 집합: 67 files, SHA-256 digest 7c5a032d57348945cd434b0ea8822849b785ed2214054d60e35a0103d4fe3fbc. 정본 evidence/artifact-manifest.json. sprint 내부 .gitattributes는 Windows checkout 변환으로 승인 파일 바이트가 달라지지 않도록 -text만 적용한다. 다른 폴더에 영향 없음.

모든 결과는 고정 fixture. 단순 시안 탐색 탭은 실제 서비스 lifecycle gate가 아니다. 실제 게임 UI, service mutation, 저장, live simulation, 새로운 개입, 자동 판정 엔진, 법률 감사, 사람 선택·플레이테스트는 미실시. 기존 제출 타이밍/질문 순서 의존을 고치거나 승인하지 않는다. Accepted 설계/사건/판정 수정과 Godot 재개는 범위 밖이다.

G0 GO / G1 독립 Reviewer PASS. G2 제출 가능하며 사람의 디자인 선택은 승인 대기다. Reviewer PASS는 디자인 패킷의 기술 검수이며 사람의 디자인 선택/게임 재미/병합 승인이 아니다. 다음 단계는 사용자 A/B/C 또는 수정점 응답이다.

최종 git diff --cached --check 통과. 변경은 허용 경로의 신규 파일뿐이며 원본 303 파일과 승인집합 67 파일의 worktree/staged bytes를 모두 대조했다. 기존 로컬 task/gen-001의 변경 목록·브랜치는 시작 시와 동일하다. PowerShell raw 로그는 저장 시 UTF-8/LF로 정규화했으며 출력 문구·실패·exit code를 변경하지 않았다. 범위 외 변경 없음. 다음 단계 착수 없음.
