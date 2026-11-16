# TF-UI-001 · 자체 점검

G0/G1 디자인 승인 패킷. 실제 게임 UI 구현, 재미 검증, G4 사람 체험 완료가 아니다.

## 완료 기준과 증거

| 기준 | 상태 | 근거 |
|---|---|---|
| 기준 SHA·대상 흐름·표시 출처 확정 | 충족 | BASELINE.md / IA.md / 보호 파일 manifest |
| A/B/C 동일 실제 내용, 서로 다른 정보 구조 | 충족 | 공통 fixture.js, A 대조/B 발언/C 업무 rail |
| 네 단계 12장, 세 안 계획/기록 좁은 화면 | 충족 | variants 각 consultation/plan/court/record-1440.png, -390.png; -1280도 추가 |
| 비교 목업과 60–90초 화면 순회 | 충족 | index.html / evidence/design-tour.webm; 실제 재생 72.56초 |
| 디자인 시스템/토큰/상태 컴포넌트 | 충족 | DESIGN-SYSTEM.md / tokens.json / components.html |
| 원문·출처와 수행/판단 구분 | 충족 | 자료 원문 및 발언 문맥 disclosure, 별도 outcome |
| 세 크기/포커스/overflow/긴 발언/오류 | 충족 | 실제 Edge 526 checks/0, evidence/results.json; 편집 toolbar 별도 6장 |
| 관련 기존 필수 회귀·보호 범위 | 충족 | 필수286/0; 보호303/303. 선택 회귀는 기존 focus/favicon 실패를 전후 분리 |
| 독립 Reviewer | PASS | REVIEW.md; 1차 P2 수정 재검토 완료, G0/G1에 한정 |
| 사람의 디자인 선택 | 대기 | DECISIONS.md; G3/G4 닫힘 |

## 검사 실행과 합계

- courtroom-prototype에서 npm test: 247/0/exit0. node --test tests/demo.test.js tests/plan-demo.test.js tests/plan-demo-ui.test.js: 39/0/exit0. Reviewer 1차 수정 후 두 묶음을 재실행했다.
- repo에서 node docs/sprints/TF-UI-001/tools/verify.cjs --video: 526 checks/0/exit0. 원문/fixture/보호303·18색쌍·세 크기·키보드·편집부 노출 검사 포함.
- npm run test:browser: baseline/post 591 reported checks 뒤 focus assertion 실패/exit1. npm run test:trial: Node19 pass 뒤 console404 실패/exit1. npm run test:budget: 최초 baseline262pass, post/무변경 baseline 재실행은14pass 뒤 같은 focus assertion 실패/exit1. 전체 legacy PASS 아님.
- 필수+디자인 reported checks812/0. 서로 다른 검사 단위이며 고유 게임 테스트812개라는 뜻이 아니다. 상세는 evidence/test-results.log와 각 원본 로그.

## 새로 정한 규칙 목록

RULES.md의 10개 목업/표시 규칙. 게임 수치·판정·사건 내용 변경 없음. 실험용 authored 시각 규칙이며 DEC가 아니다.

## 알려진 한계와 사람에게 남길 질문

고정 fixture 목업, 실제 서비스 실행/저장/새로고침 복원 없음. 합성 상태 예시는 정상 고정 경로에서 발생했다고 주장하지 않는다. 기존 사진과 기본 실루엣만 존재한다. 법률 감사·게임 재미·5–8분 실플레이 미실시. 기존 test:browser focus와 test:trial favicon 실패는 기준 환경의 결과로 별도 기록한다.

사람의 결정 질문은 하나: **A/B/C 중 선택 또는 구체적인 수정점은 무엇인가?** G4 이해도 1–2와 경험 3의 질문은 승인 후 기능 구현·기술 검증을 마친 다음에만 요청한다.
