# GEN-002 전망 재보정 — REVIEW_PACKET

2026-10-07 · Lane: experiment · task/gen-001 · main 작업 폴더

## 목적과 상태

전망만 보수적으로 조정하고 브리핑을 대표에게 보고하는 존댓말로 통일한다. 사건 생성·신문 정책·판정은 보존했다. **분포 목표는 미충족**이므로 요청 전체 완료나 Reviewer PASS로 표시하지 않는다. 커밋·병합·다음 단계는 시작하지 않았다.

## 변경 파일

모두 courtroom-prototype/generator/ 안이다.

| 파일 | 변경 요약 |
|---|---|
| core/forecast.js | 전체 핵심 쟁점 자료 누락·상대 추가 반박이면 불리, 신참 유리 엄격화, 정석/변수 구분, 숫자 없는 보고체 설명 |
| core/automatic.js | 정석/변수를 기존 실제 다툼으로 환산해 비교하는 감사 항목만 변경; runPolicy·outcomeBand 불변 |
| content/catalog-voices.js, content/copy.js, content/sentence-variants.js | 브리핑 원고의 종결어미만 보고체로 교정; 사실·주신문·증인/의뢰인 대사는 유지 |
| core/tests/forecast.test.js (신규) | 전 쟁점 확보·누락·반박·중복·공개 판세·정석/변수 경계 양성/음성, 입력 불변, 언어 전망, 10종×60시드 브리핑 |
| core/tests/automatic.test.js, content/rework.test.js | 기존 공개 정보·결정성·원자성·재생·역전 검사 유지; 새 규칙에 맞게 양쪽 쟁점 준비 fixture와 네 단계 순위 조정 |
| content/finish.test.js | 폐기된 낙관적 전망 기대값 갱신; 별도 600건에서 실제 서비스 기록·결과 보존 확인 |
| report-gen002.js | 기존 조사 schedule·30건 전문 유지, 네 전망×세 실제 결과 행렬 지원, 새 보고서 진입점 연결 |
| report-forecast.js (신규) | 신참 1,000건 분포·목표 충족 여부·실제 결과 행렬·환산 일치율 생성 |
| REPORT.md | 실측 표, 목표 미달 원인, 완료 기준별 상태, 갱신한 30건 전문 |
| RULES.md, TASK-GEN-002.md, REVIEW_PACKET.md | 현재 범위·표시 전용 실험 기준·한계·인계 |

## 새 invariant

- 어느 핵심 쟁점이든 우리 기본 관찰 자료가 없거나 확보한 상대 추가 반박이 있으면 불리다. 심리 중 의심 표시로 이 조건을 우회하지 않는다.
- 신참 유리는 모든 핵심 쟁점의 독립 기본 관찰 자료 쌍이 있고 알려진 반박·입증 유지 표시가 없을 때만 허용한다.
- 같은 카드 ID는 중복으로 세지 않는다. 미확보 카드·숨은 강도·진실·미래 판결은 읽지 않는다. 기존 VM 경계·자료 본문 독립성 검사를 유지한다.
- 전망은 유리/정석/변수/불리와 존댓말 설명뿐이다. 실제 판정은 기존 유리/다툼/불리 그대로다. 일치율은 정석/변수를 다툼으로 합친 환산 일치이며 네 단계 정확 일치가 아니다.

## 실행 및 결과

courtroom-prototype에서:

```powershell
node generator/verify.js
node generator/report-gen002.js
Get-Content -Raw generator/out/compare-head.source.txt | node -
```

| 검증 | checks | failures | exit code |
|---|---:|---:|---:|
| 생성기 회귀 | 115 | 0 | 0 |
| 기존 npm 회귀 | 247 | 0 | 0 |
| 기존 밸런스 게이트 | 40 | 0 | 0 |
| 회귀·게이트 합계 | 402 | 0 | 0 |
| HEAD 대비 1,000건 사건 정의(briefing 제외)·공판 기록·판결 보존 | 3000 | 0 | 0 |

최신 실행 결과는 out/test-results.log, out/npm-test-results.log, out/balance-test-results.log 및 out/verification.json에 있다. 추가 보존 검사 코드·결과도 out/에 보관했다. `git diff --check`와 최종 diff를 검토했다. 이전 보정의 ‘일치율을 높여야 한다’ 테스트는 이번 보수적 전망 요청과 충돌하므로 실제 결과 보존 검사로 교체했으며 생성·판정 검사는 삭제하지 않았다.

## 실측·미충족·사람 판단

- 기존 조사 일정의 신참 1,000건: 유리 0%, 정석 0%, 변수 0%, 불리 100%. 환산 일치 89/1000 = 8.9%. 분포 목표 네 항목 모두 미충족이다.
- 기존 schedule은 한 쟁점만 조사하므로 다른 핵심 쟁점의 자료가 늘 비어 있다. 불리 조건을 유지하면서 이 표본의 불리를 줄일 수 없다. 생성 규칙·조사 정책·표본 비중을 임의 변경하지 않았다.
- **TBD:** 실제 플레이를 대표할 조사 상태 모집단. 사람이 그 기준을 정한 뒤 같은 계산기로 분포를 다시 측정해야 한다.
- 기존 데이터에는 개별 자료의 ‘결정성’ 등급이 없다. 이번 표시 전용 실험에서는 독립 기본 자료 쌍을 결정적 준비의 대용 기준으로 삼았으며 법적 결정성이나 새 판정력을 구현했다고 주장하지 않는다. RULES.md에 명시했다.

## Fixture·범위

사건·대사·반전·신참/숙련 자동 정책은 authored 실험이다. 법률 추론, 증거능력, 항소, 양형·합의 종결, 판사/상대 AI, World/Career/Business, UI/save는 건드리지 않았다. 사람 플레이테스트는 별도 대기한다.

generator 밖 변경 없음. root DESIGN.md는 계약의 Read only여서 표시 규칙은 Owns의 RULES.md와 계약 기록에 갱신했다. 시작 전부터 있던 미추적 _to_delete/는 그대로다. commit/push/병합 없음.
