# PLAN-DEMO-001 · 실행 및 플레이테스트

기존 **정민호 사건**, 기존 **DEMO-001 재판 서비스**, 새 **내부 계획 검토 화면**을 연결한 별도 실험이다. 원본 demo.html을 변경하지 않았다.

## 실행

저장소에서 task/plan-demo-001 브랜치를 체크아웃하거나 별도 worktree로 연다.

```sh
git fetch origin task/plan-demo-001
git worktree add ../the-firm-plan-demo origin/task/plan-demo-001
cd ../the-firm-plan-demo/courtroom-prototype
npm start
```

브라우저: http://127.0.0.1:4173/plan-demo.html

다른 작업 폴더를 변경하기 싫으면 위 worktree 방식으로 독립 실행한다. Node.js 필요. 웹 자산은 같은 로컬 서버에서 로딩된다. 인터넷이나 LLM 호출은 없다.

## 체험할 경로

1. 초기 변론 계획을 그대로 승인 → 전체 법정 진행 화면 → **실행 기록**으로 이동.
2. 반대 계획으로 돌아가 현장 동선 대응을 제외 → 다시 승인 → **신문 수행과 미실행 차이** 확인.
3. 각 사건에서 **전체 법정 발언 펼치기**로 원본 서비스 기록을 확인.

## 판정해야 할 질문

- 아무것도 수정하지 않아도 자연스럽게 사건을 마칠 수 있는가?
- 계획을 수정한 효과가 실제 법정 발언 및 기록에 보이는가?
- 기록에서 행동, 확보된 발언, 검사의 반론, 법원의 최종 판단을 혼동하지 않는가?

**실험 경계:** 재판 준비 자료 네 개는 자동 확보하는 고정 전제다. 의뢰인 합의·수임·일정은 이번 수직 슬라이스에서 조작하지 않는다. 원래 DEMO-001의 신문 시간/증거 신청 및 임시 양형 규칙은 여전히 존재한다. 다른 사건으로 확장된 자동화 시스템이나 공통 생성기는 아니다.

테스트: `node --test tests/plan-demo.test.js`. 원본 서비스 회귀: `node --test tests/demo.test.js tests/plan-demo.test.js`.

기술·게임성 검증 상태: [REPORT](REPORT.md), [RULES](RULES.md).
