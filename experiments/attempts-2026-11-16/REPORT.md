# 보관 작업 자체 점검 · 2026-11-16

이 작업은 소스·로그의 역사적 보관이다. 게임 기능/규칙을 구현하거나 결함을 수정하지 않았다.

## 완료 기준

- 충족: management/UI, 로컬 GEN, World, TF-UI 디자인 4개 시도를 별도 폴더에 보관. 기존 원격 PR 8개는 링크로 구분.
- 충족: attempts.json에 출처 commit/ZIP 해시, 재검증 범위, 미완료 사항, 재개 조건 명시. 스냅샷 원문 323개 파일을 manifest로 고정.
- 충족: AI 진입점은 docs/CURRENT.md의 짧은 링크와 archive README/attempts.json. 원래 TASK/REPORT는 과거 자료임을 archive AGENTS에 명시.
- 충족: 기존 제품 런타임, Godot, Accepted DEC, 기존 docs/DESIGN.md 변경 없음. docs/CURRENT/CHANGELOG에는 보관 안내만 추가.
- 충족: 복구 Git bundle·전체 대화·삭제 대기 자료·GEN/WORLD 생성 out은 게시 대상 제외. 원본 사용자 저장소와 다른 worktree는 수정하지 않음.

## 이번 검증

- `node experiments/attempts-2026-11-16/verify.cjs`: 4개 index 항목, 스냅샷 323파일 크기/SHA256 검증 PASS, 실패 0.
- `cd courtroom-prototype && npm test`: 247 tests, failures 0, exit 0. 원본 로그 evidence/archive-base-node.log.
- staged diff scope 검사: 기존 runtime/Accepted DEC 수정 없이 보관 폴더, 작업 계약, CURRENT/CHANGELOG만 변경. 새 작성 파일의 whitespace를 검사한다. 과거 스냅샷/증거의 공백·줄바꿈은 원문 해시를 보존하기 위해 수정하지 않으며 .gitattributes로 줄바꿈 자동 변환을 막는다.
- 사전 내용 검토에서 실행한 경영 Node/브라우저/빌드, GEN 전망 실측, 기존 법정 브라우저 실패는 evidence/INTEGRATION_REVIEW.md와 attempts.json에서 이번 보관 무결성 검사와 구분.

## 새 규칙·한계

새 게임 규칙 없음. RULES.md는 역사적 자료의 지위와 production import 금지 경계만 정한다.

GEN과 World는 이 새 경로에서 바로 실행하는 모듈이 아니다. World의 Git 이력 의존과 GEN 전망 분포 미달은 해결하지 않았다. TF-UI 디자인 선택·사람 플레이테스트·생산 통합은 이번 범위가 아니다. 기존 법정 브라우저 focus/404 실패는 이전 검토에서 원본 main에도 재현됐고 여기서 수정하지 않았다. 최신 경영 HTML만 독립 실행 가능한 보관본이다.

이번 결과로 사람에게 새 결정/승인을 요구하지 않는다. 향후 재개할 때 해당 항목의 resume_conditions를 따른다. PR 보관 후 main 병합은 별도 결정이다.
