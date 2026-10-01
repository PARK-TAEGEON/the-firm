# DEMO-001 — 데모 수준 프로토타입

Lane: experiment
Owner: Claude
Branch: task/demo-001 (GEN-001 병합 후 시작)
Owns: courtroom-prototype/trial.html, ui/trial-*, data/demo-*.js, services/demo-*.js
  - 2026-10-01 구현 착수 시 함께 추가: courtroom-prototype/demo.html(데모 진입점, v0.10 trial.html은 그대로 보존), tests/demo-*.js(자동 경로 테스트), courtroom-prototype/demo/(RULES.md·REPORT.md)
Do not modify: engine/trial.js (기존 v0.10 엔진 그대로 재사용), services/trial.js
Read only: docs/CURRENT.md, courtroom-prototype/EXPERIMENT_RULES.md의 v0.10 절, generator/content/SIGNATURE.md §1, generator/content/DEMO-DESIGN.md, docs/DESIGN-NOTES-2026-09.md §1.9~1.13, DEC-031, DEC-032

## 개정 이력
- 2026-10-01 사용자 결정: Owns에 `services/demo-*.js`, `data/demo-*.js` 추가(합의·양형용). `engine/trial.js` 수정 금지. 합의 분기 포함, 유죄 시 양형은 실험용 단순 규칙 표.

## 목표
GEN-001의 대표 사건 하나로 사건 파일 선택 → 준비(합의 포함) → 재판 → 결과 분기 → 복기까지 처음 보는 사람이 완주한다.

## 범위
- 사건: SIGNATURE §1 “두 장면 사이”, 죄명 상해. 판정은 SIGNATURE의 더하기 방식(기존 엔진). DEMO-DESIGN §1.4의 “갱신” 방식은 쓰지 않는다.
- 시작 화면: 사건 파일 선택(대표 사건 1 + 일상 사건 요약 1~2) + 검사 신참/베테랑 선택
- 신참/베테랑 검사: 상대 행동 데이터로만 차이(재주신문 복구 신참 0·베테랑 +1, 베테랑의 유효 이의는 플레이어 신문 시간 −1, 증인 준비 = 카드 제시 후 인정 범위). 숨은 판정 보너스 금지(DEC-031 N4). 자료 없는 추궁에 증인이 물러서는 대사 금지(§1.10). 강점 유형·조언 창구(§1.12)는 범위 밖
- 재판 전 합의(§1.13): 피해자 측 제안 → 의뢰인 수락/거부(DEC-027 의뢰인 자율) → 수락 시 처벌불원서 확보. 합의해도 재판은 계속된다
- 결과(한국 법 값은 `data/demo-ko-pack.js`, DEC-032):
  - 밀침 입증 실패 → 무죄
  - 밀침 입증 + 상해 인과 입증 → 상해 유죄(처벌불원은 양형 감경 사유일 뿐)
  - 밀침 입증 + 인과 의심 → 축소사실 폭행. 선고 전 처벌불원서 있으면 공소기각(반의사불벌), 없으면 폭행 유죄
- 양형: 실험용 규칙 표(초범 전제). 상해 유죄: 처벌불원 있으면 벌금, 없으면 징역 집행유예. 폭행 유죄: 벌금. 화면에 “실험용 단순화 — 실제 양형기준 아님”
- 결과별 복기 문구 + “다음에 시도해 볼 것” 한 줄 + “상대가 막은 것 / 당신이 뚫은 것”. 판세 “다툼 있음”에서 유죄면 이유 설명
- 확인 못 한 조문·효과는 코드 주석과 REPORT에 [확인 필요]

## 완료 기준
- 모든 결과(무죄 / 공소기각 / 폭행 유죄 / 상해 유죄 + 양형 두 종)에 도달하는 경로가 있음(자동 경로 테스트)
- 신참/베테랑 두 버전 모두 무죄 또는 공소기각 경로가 존재하고, 베테랑 버전은 표면 접근만으로는 무죄가 나지 않음(자동 경로 테스트)
- 같은 기록이면 같은 결과(자동 테스트)
- 1440 / 390 폭에서 완주, 가로 넘침 없음. 기존 v0.10 trial.html 회귀 유지
- 처음 보는 사람이 설명 없이 완주 (PLAYTEST-001에서 확인)
- `courtroom-prototype/demo/REPORT.md` 자체 점검. 커밋은 사람이 한다
