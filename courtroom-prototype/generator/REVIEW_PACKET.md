# GEN-002 마무리 — REVIEW_PACKET

2026-10-06 · Lane: experiment · 브랜치 task/gen-001
작업 위치: C:/Users/Admin/Documents/ChatGPT/The Firm/courtroom-prototype/generator/

## 목적과 상태

조사 오류·겹치는 관계 표현·내부 카드 표지를 제거하고 원형별 세 문장 구조와 절도 장소 변화를 제공한다. 공개 정보 전망의 초보 편향을 보정하고 기존 판정·밸런스는 보존했다. 자동 검증 완료, 사람 플레이테스트와 커밋·병합 결정 대기. 다음 단계 UI/세계 통합은 시작하지 않았다.

## 변경 파일과 요약

모두 generator/ 기준이다.

| 파일 | 변경 |
|---|---|
| content/korean.js (신규) | 조사 다섯 쌍, ㄹ 예외, 명시적 치환 슬롯과 입력 검증 |
| content/sentence-variants.js (신규) | 원형 10종의 별도 추가 원고 둘; 브리핑·주신문 질문/답변 세 구조 |
| content/catalog-content.js | 공통 한국어 렌더러 연결 |
| content/catalog-voices.js, content/catalog-discoveries.js | 받침 조사 슬롯, 겹치는 관계 표현 제거 |
| content/catalog-facts.js | 절도 세 장소 순환, 기존 두 원형의 장면 데이터 |
| content/index.js | 원고 변형 연결, 카드 assessment 필드와 자연어 본문, 판사 발화 수정 |
| core/forecast.js | 문자열 파싱 제거, 보유 카드 필드 기반 추정, 초보 기준 보정 |
| content/finish.test.js (신규) | 조사 양성/음성, 600개 사건 전수, 문장/장소 변형, 공개 필드 경계, 별도 시드 보정 검증 |
| verify.js | 마무리 테스트 포함 |
| report-gen002.js | 구 전망 비교 전용 함수, 정책별 보정 전후 표 |
| REPORT.md | 6,000건 정책별 행렬·보정 표, 30건 공판 전문 갱신 |
| RULES.md, TASK-GEN-002.md, REVIEW_PACKET.md | 마무리 범위·실험 규칙·인계 |

## 새 invariant와 검증

- 장소·인물의 받침에 맞게 을/를·이/가·은/는·과/와·으로/로를 선택한다. ㄹ 받침은 로를 쓴다. 잘못된 조사 문장을 음성 예제로 검출한다.
- 원형 10종 × 60시드의 표시 문자열 및 실제 공판을 검사한다. 기존 문서 누출·중복 증언 검사도 유지한다.
- 원형마다 세 브리핑/주신문 구조가 실제로 달라진다. 절도는 연속 세 시드에 세 장소가 나온다.
- 확보하지 않은 카드의 메타데이터는 전망에 들어가지 않는다. 카드 제목·본문을 바꿔도 전망은 동일하며 추가 발견 필드 변경은 전망에 반영된다.
- 숨은 baseline, 판정 수치, 압박 성공 조건, 엔진 예행/재생은 전망에 사용하지 않는다. 기존 VM 경계 테스트 유지.
- 보정용 1~300시드와 다른 1001~1060시드에서 초보 일치 증가 및 비관적 무죄 감소를 검증한다.

## 실행

courtroom-prototype에서 node generator/verify.js 및 node generator/report-gen002.js.
git diff --check, git diff 검토, git check-ignore, 이전/현재 balance 로그 동일성 비교.

| 검증 | checks | failures | exit code |
|---|---:|---:|---:|
| 생성기 회귀 | 113 | 0 | 0 |
| 기존 npm 회귀 | 247 | 0 | 0 |
| 밸런스 게이트 | 40 | 0 | 0 |
| 합계 | 400 | 0 | 0 |

최신 로그: out/test-results.log, out/npm-test-results.log, out/balance-test-results.log. out/verification.json에 실행 합계. 로그/백업은 기존 .gitignore의 /out/로 제외한다. 기존 대비 밸런스 로그 전체가 동일하다.

## Fixture·한계·TBD

콘텐츠·정책·전망은 authored 실험 규칙이다. 전망의 유리는 승소 보증이 아니며, 무죄 누락을 줄이는 대신 일부 유죄를 낙관적으로 예상한다. REPORT의 전체 행렬에 이를 드러낸다. 법률 추론·자동 양형·합의 종결·UI 연결·세계 통합은 미구현이며 이번 범위에서 건드리지 않았다. 사람의 재미·자연스러움 판단은 대기한다.

## 범위 및 Git

generator 밖 변경 없음. 시작 전부터 있던 미추적 _to_delete/는 건드리지 않았다. 실제 저장소의 diff를 검토했으며 Orca의 별도 task-world-001 작업 폴더는 수정하지 않았다. commit/push/병합은 하지 않았다.
