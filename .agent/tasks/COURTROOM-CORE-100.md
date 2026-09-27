# COURTROOM-CORE-100 — Adversarial Trial experiment (v0.10.0)

## Goal

법정 공방을 "질문 하나하나 고르기"에서 **준비한 것을 들고 상대와 다투는 흐름**으로 바꿔 재미를 검증한다. 풋볼 매니저의 경기처럼 대부분은 흘러가고, 결정적인 순간에만 플레이어가 개입한다.

사용자 결정 (2026-09-27 대화, 제품 방향 승인):

- 준비(조사)가 법정의 무기(카드)가 된다. 조사하지 않은 것으로는 싸울 수 없다.
- 상대(검사)의 증거목록은 제목만 보이고, 내용은 조사해야 안다.
- 검사 주신문은 자동으로 흐르고, 개입 창에서 이의 여부만 결정한다.
- 반대신문은 질문 대신 **접근법**을 고른다. 성공 후 몰아붙일지 멈출지 결정한다.
- 검사가 재주신문으로 상처를 수습한다. 준비한 반박 카드가 있으면 막을 수 있다.
- 개회사에서 공개한 입장과 모순되는 행동은 검사가 공격에 사용한다.
- 판세는 숫자가 아니라 **재판장 메모**로 표시한다. 재판장 신뢰와 신문 시간은 자원이다.
- 판결 후 기록 기반 **복기**로 유효했던 것과 놓친 것을 보여 준다.

이 작업은 **실험(Experiment)** 이다. 00_GAME_CONSTITUTION 및 Accepted DEC 문서를 변경하지 않으며, 여기서 정한 수치·규칙은 플레이테스트용 authored 규칙이다.

## Read First

- `00_GAME_CONSTITUTION.md` (4장 재판 철학, 8장 금지 원칙)
- `AGENTS.md`, `WORKFLOW.md`
- `docs/CURRENT.md`
- `courtroom-prototype/EXPERIMENT_RULES.md` (B동 창고 사건의 사실관계와 Hard Counter `P_SIGN_LIGHT`가 "현장 사진이나 조도 자료"를 요구한다는 기존 결정)

## Current Baseline

- `courtroom-core-v0.9` tag, HEAD `37d5b69` (v0.9.1 polish, 독립 리뷰 대기).
- 기존 법정(`index.html`, `engine/*`, `services/courtroom.js`, `data/case.js`, `ui/app.js`, `ui/courtroom.css`)은 이 작업에서 **byte-identical**로 유지한다.

## Implementation Scope

별도 진입점 `courtroom-prototype/trial.html`에 한 사건의 전체 공판 라운드를 구현한다.

1. **준비:** 반나절 4회 예산. 조사 6종(비용 1~2). 조사 결과는 카드로 획득. 검찰 증거목록 3건은 제목만 공개, 기록 열람 조사로 내용 공개.
2. **개회사:** 주력 쟁점(식별/칼/균형 → 증인별 신문 시간 배분)과 칼 접촉 입장(인정/언급 안 함/부인)을 확정. 공개 후 변경 불가.
3. **증인 2명 × (주신문 → 반대신문 → 재주신문 → 재반대):**
   - 주신문: authored 대사 자동 진행, 이의 창 1회(정당한 이의/미끼 질문).
   - 반대신문: 접근법 4종 + 한정 결론 요구 + 과한 결론 요구. 신문 시간 소모.
   - 재주신문: 검사가 authored 수습 논거 사용. 반박 카드가 있으면 재반대로 무력화.
4. **판결:** 필수 쟁점 2개(공격자 동일성, 범행 당시 칼 사용) 모두 입증되어야 유죄. 쟁점 하나라도 합리적 의심이면 무죄.
5. **복기:** 기록만 읽어 유효했던 행동, 역효과, 놓친 준비를 생성.

아키텍처: `data/trial-case.js` → `engine/trial.js`(순수 함수) → `services/trial.js`(명령/원자성/append-only 기록) → `ui/trial-app.js`(표현만). 무작위 없음. 쟁점 판세·판결·복기는 **기록(records)만** 읽는다(UI 상태, 클릭 수 미사용).

## Allowed Changes

- 신규: `courtroom-prototype/trial.html`, `data/trial-case.js`, `engine/trial.js`, `services/trial.js`, `ui/trial-app.js`, `ui/trial.css`, `tests/trial.test.js`, `tests/browser-trial.test.js`
- 수정: `courtroom-prototype/package.json`(버전, 스크립트 추가), `README.md`, `EXPERIMENT_RULES.md`(v0.10 절 추가), `REVIEW_PACKET.md`, `test-results.log`, 루트 `REVIEW_REQUEST.md`, `docs/CURRENT.md`, 이 계약서

## Forbidden Scope

- 기존 법정 엔진/서비스/데이터/UI/index.html 변경
- Godot `litigation-skeleton/` 변경, 저장소에 이미 있던 미커밋 변경 수정·커밋
- 헌법/DEC 문서 변경, 새로운 Accepted 설계 주장
- 저장/불러오기, 배심원, 합의, 항소, 여러 사건, 경영 루프, 아트 에셋 추가
- 확률·무작위, 승률 숫자 노출

## Acceptance Criteria

- 준비 예산 초과, 카드 없는 접근법, 시간 초과, 잘못된 단계 명령은 실패하고 상태와 ID를 변경하지 않는다.
- 같은 명령 순서는 항상 같은 결과를 낸다. 기록 replay가 서비스 판세와 같다.
- 준비에 따라 무죄/유죄가 모두 도달 가능하다. 준비 없는 플레이는 유죄, 식별 집중 준비와 칼 집중 준비는 각각 무죄 경로가 있다.
- 과한 결론 요구는 항상 역효과. 한정 결론 요구는 쌓인 근거가 충분할 때만 성공.
- 조도 조사 카드가 있으면 간판 불빛 수습을 재반대로 막을 수 있고, 없으면 복기에서 놓친 준비로 표시된다.
- 칼 접촉을 부인한 개회사는 지문 증언 시 검사가 모순으로 공격한다(신뢰 하락). 의뢰인 재면담이 이 함정을 드러낸다.
- 미끼 이의는 기각되어 신뢰가 떨어지고, 신뢰가 바닥이면 다음 신문 시간이 줄어든다.
- 화면에 승률·점수 숫자가 없다. 판세는 재판장 메모 문장으로만 표시.
- 1440×900, 390×844에서 전체 흐름 완주, 가로 넘침 없음. 기존 Node 228 회귀 통과.

## Required Tests

- `npm test` (기존 228 + trial 신규)
- `node tests/browser-trial.test.js` (desktop/mobile full flow, 무죄·유죄 경로, 가로 넘침, 숫자 미노출)
- 기존 browser/budget 회귀는 환경에서 실행 가능한 범위 기록

## Completion Handoff

`REVIEW_PACKET.md`(v0.10 절), 루트 `REVIEW_REQUEST.md`, `docs/CURRENT.md`, `test-results.log` 갱신 후 범위 파일만 하나의 commit으로 남긴다. push 금지. 사람 플레이테스트 질문 목록을 REVIEW_REQUEST에 포함한다.
