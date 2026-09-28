# DEMO-001 — 데모 수준 프로토타입

Lane: experiment
Owner: Claude
Branch: task/demo-001 (GEN-001 병합 후 시작)
Owns: courtroom-prototype/trial.html, ui/trial-*, data/demo-*.js
Read only: docs/CURRENT.md, courtroom-prototype/EXPERIMENT_RULES.md의 v0.10 절

## 목표
GEN-001의 사건 하나로 사건 파일 선택 → 준비 → 재판 → 결과 분기 → 복기까지 처음 보는 사람이 완주한다.

## 범위
- 시작 화면: 사건 파일 2~3개 중 선택(나머지는 일상 사건 요약)
- 결과 분기 3~4개: 무죄, 유죄, 일부 인정, 합의(재판 전 합의 제안 수락)
- 각 결과별 복기 문구와 "다음에 시도해 볼 것" 한 줄
- 기존 v0.10 엔진 재사용. 엔진 규칙 변경은 계약서에 적고 진행

## 완료 기준
- 모든 분기에 도달하는 경로가 있음(자동 경로 테스트)
- 1440 / 390 폭에서 완주, 가로 넘침 없음
- 처음 보는 사람이 설명 없이 완주 (PLAYTEST-001에서 확인)
