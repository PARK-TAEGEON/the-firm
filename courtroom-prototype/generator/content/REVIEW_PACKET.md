# GEN-001 조정 — REVIEW_PACKET

날짜: 2026-10-01. 브랜치: task/gen-001. 기준 HEAD: b7bfeba. Lane: experiment. 커밋·병합은 사람이 한다.

## 목적

새 core 구조에 콘텐츠 회귀와 balance 정책을 맞추고, 사용자 목표 (a)~(d)에 맞춰 콘텐츠 원형 강도를 조정한다. 요청한 법률 문서 정정을 반영한다.

## 변경 파일

| 파일 (generator/ 기준) | 변경 |
| --- | --- |
| core/playthrough.js | 새 상식적 신문 정책, 기존 무작위 보존, 최선 경로의 무근거 접근 제외·limited 조건 확인, 조사 대조군 옵션 |
| balance.js | (c)/(e) 분리, 조사만 바꾸는 (d), 기존 전략 차이 참고 출력, 4개 게이트 및 오류 실패 처리 |
| content/archetypes.js | 쟁점 strengthRange [3,4]·[3,5] |
| content/content.test.js | 실패 7개 수리, 정책 3개 추가, 카드/점수·원자성·replay 조건 유지 및 새 분기 검증 |
| content/check-balance.js | 이의/재반대 처리 분리, 새 (c) 비율 검증 및 기존 고정 준비 참고 출력 |
| content/CATALOG.md | 명예훼손·모욕, 친족상도례·2024 결정·2025 개정, 공탁, 무고 목적, 공용부 주거성 및 공식 출처 |
| content/SIGNATURE.md | 9행 §1.10 설명, §3 민사 엔진 제한만 수정 |
| content/RULES.md | 이번 실험 정책·수치·측정 정의 |
| REPORT.md | 전후 표·진단·완료 기준·전체 테스트/balance 출력 |
| content/REPORT.md | 최신 결과 및 통합 REPORT 링크 |
| content/REVIEW_PACKET.md | 이 인계 |
| content/test-results.log | 최신 5개 검증 명령 출력 |

## 강제 불변식과 검증

- 새 (c): 예산 준수·보유 카드만 사용·overreach 없음·limited 성공 조건 충족·가능한 재반대 사용·동일 seed 재현·기록 replay.
- 기존 카드 없음/다른 카드 거부, unsupported 무효, 실패 원자성, limited 근거 2개 필요, overreach 항상 실패를 유지한다.
- byStance 점수 0·DENY 충돌 비용, 이의·재주신문·재반대 문구와 효과를 검증한다.
- (d)는 opening과 신문 정책을 고정하고 조사 우선순위만 바꾼다.
- 판정 RNG·능력 가산·UI 도메인 로직을 추가하지 않는다.
- DEMO-DESIGN 전체와 SIGNATURE §1은 HEAD 대조 결과 변경 없음.

## 실행 명령과 결과

courtroom-prototype/에서 실행:

| 명령 | checks | failures | exit |
| --- | ---: | ---: | ---: |
| node --test generator/core/tests/*.test.js | 43 | 0 | 0 |
| node --test generator/content/content.test.js | 17 | 0 | 0 |
| npm test | 247 | 0 | 0 |
| node generator/balance.js | 8 | 0 | 0 |
| node generator/content/check-balance.js | 2 | 0 | 0 |
| **합계** | **317** | **0** | **0** |

원본 content 실패 7개 및 balance 실패, Node의 디렉터리 테스트 경로 오류는 [REPORT](../REPORT.md)에 보존했다. 최종 검증은 위 명령으로 모두 통과했다. git diff --check 및 수정 파일 diff 검토 완료.

## Fixture·미구현·설계 판단

- 원형·대사·반전·이의 proper/improper 배치는 authored fixture다.
- (b)는 쟁점별 집중 경로 탐색이며 모든 명령열의 완전 탐색이 아니다.
- seed 1~300은 조정에 쓴 표본이다. 전 seed 보증·holdout 성능을 주장하지 않는다.
- 옛 (d)는 조정 후 0%; 새 (d)는 조사만 바꾸는 인과 비교로 두 원형 100%. 정의와 전후 비교 한계는 REPORT에 명시했다.
- 민사 공판, 법률 자동 적용·양형, 새 원형 구현, DEMO 실행/UI는 범위 밖으로 남겼다.
- 원 계약의 분야 3개 × 10개 사람 검수와 체감 난도·법률 적용 검토는 미완이다. 사람 질문 3개는 REPORT 참조.
- 범위 외 수정 없음. 사용자 추가 허용인 core/playthrough.js·balance.js 외 core 파일은 수정하지 않았다. 기존 미추적 world/도 그대로다.
