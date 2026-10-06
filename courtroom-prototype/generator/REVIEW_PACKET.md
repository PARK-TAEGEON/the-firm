# GEN-002 1단계 재작업 — REVIEW_PACKET

2026-10-06 · Lane: experiment · 브랜치 task/gen-001
실제 작업 위치: C:/Users/Admin/Documents/ChatGPT/The Firm/courtroom-prototype/generator/

## 목적과 상태

기존 숫자 게이트를 그대로 유지하면서 카탈로그 8종의 공통 인물·대사와 문서 흔적을 제거했다. 실제 화면용 사건 사실, 엔진 예행 없는 공개 정보 전망, 구조화된 한국 팩, 사람이 읽을 공판 전문을 제공한다. 사용자 6개 요청의 증거와 원형별 3시드 전문 30건은 REPORT.md에 있다.

구현과 자동 검증 완료. 사람 플레이테스트·병합·커밋 결정은 대기한다. 커밋과 push는 하지 않았다. 다음 단계 UI·세계 통합은 시작하지 않았다.

## 변경 파일 목록

모두 generator/ 기준이다. 작업 전부터 있던 미추적 README-GEN002.md, REVIEW_PACKET.md, TASK-GEN-002.md는 이번 재작업에 맞게 갱신했다. 다른 미추적 world/는 건드리지 않았다.

| 파일 | 변경 요약 |
|---|---|
| content/catalog-voices.js (신규) | 의뢰인 8명, 증인 16명의 이름·직업·말투, 주신문·반박·저항·압박·과욕·이의 및 원형별 선고문 |
| content/catalog-discoveries.js (신규) | 24개 반전의 발생/미발생 조사 결과; 실제 사실을 카드 문장에 연결 |
| content/catalog-dialogue.js | 작성 지시 대신 검찰 주장·변호인 재반대를 원형별 발화로 집필 |
| content/catalog-facts.js | 기존 진실 RNG를 소비하지 않는 장소·관계·금액·날짜·시각 스트림 |
| content/catalog-content.js | 개별 원고를 사건 사실과 결합; 쟁점 문구에서 문서 참조 제거; 이의 인용 후 한정 답변과 과욕에 대한 재판장 답변 분리 |
| content/index.js | 사실과 화면용 원고 연결, 카드의 공개 쟁점·용도·발견 표시, 합의금 분기를 팩으로 이동, 콘텐츠 버전 0.0.6 |
| content/copy.js, content/hearing-copy.js | 기존 폭행·음주운전의 반복 단답만 제거; 사건 수치/구조 보존 |
| content/packs/ko.json | gen-002-2: 10종 원형의 반의사불벌·친고죄·합의 효과와 예외·실행 제한, 폭행/모욕 variant, 합의금 문구 |
| content/import-catalog.js | 카탈로그 재가져오기가 구조화된 팩 필드·버전을 덮어 지우지 않도록 보존 |
| content/player-copy.js (신규) | 플레이어 문자열 수집·문서 흔적 검사·동일 증언 문장 검출 |
| content/rework.test.js (신규) | 누출 양성/음성, 10종 반복 문장, 8종 인물 독립성, 시드 사실 연결, 전망 경계, 팩/합의금, 공판 전문 30건 회귀 |
| core/forecast.js (신규) | 공개 텍스트와 언어 밴드만 받는 순수 전망; import·엔진 실행 없음 |
| core/automatic.js | 관측 사건 복제·미리 실행·replay 제거; 실제 공판만 실행; 불일치의 미조사 자료 동반 여부와 추정 오차 구분 |
| core/playthrough.js | 공개 도움말 표현 교체에 맞춰 정책이 같은 상수를 읽음; 행동 조건·수치는 불변 |
| core/tests/automatic.test.js | 팩 버전 갱신, 실제 기록 재생 회귀 보존, 새 공개 전망 검증; 제거된 observedDefinition 테스트를 공개 입력 동등성으로 대체 |
| auto.js | raw JSON 대신 내부 코드·기록 ID 없이 읽을 수 있는 자동 진행 결과 출력 |
| verify.js (신규) | 생성기·npm·숫자 게이트 실행과 out/ 로그/합계 저장 |
| report-gen002.js | 10종 × 2정책 × 300시드 일치 행렬, 전문 30건 및 대안 대사 생성 |
| .gitignore (신규) | /out/ 제외 |
| content/test-results.log (이동) | out/previous-content-test-results.log로 기존 내용 보존; 기존 루트 로그/집계도 out/previous-*로 이동 |
| REPORT.md | 요청별 완료 기준, 6,000건 전망 비교, 30개 공판 전문, 한계·사람 질문 |
| RULES.md | 기존 전망 예행 가정 폐기, 새 실험 규칙과 법체계 팩 실행 제한 명시 |
| README-GEN002.md, TASK-GEN-002.md, REVIEW_PACKET.md | 실행·재작업 범위·검토 인계 갱신 |

## 새 invariant

- 새 8종은 의뢰인 8명·증인 16명·각 범주의 실제 대사가 서로 다르다. 증언 문장을 공백 정규화 후 원형 안에서 2회 이상 쓰면 실패한다. 기존 2종도 검사한다.
- 화면에 사용할 문자열과 대안 분기에 마크다운, 링크, 검토 표시, T1/N1 등 내부 코드가 없어야 한다. 이를 넣은 음성 테스트가 실제 실패를 검출한다.
- 같은 원형·시드는 같은 사실/대사를 만든다. 장면용 RNG는 판정 스트림·수치·반전 조건을 바꾸지 않는다.
- 전망에는 초기 숨은 강도, 미래 수습/압박 성공 조건, 미보유 카드, 실제 판결을 넘기지 않는다. 준비 화면 판세는 아직 심리 전이다. 엔진 import를 차단한 VM에서도 순수 전망 함수가 동작한다.
- 합의 지급만으로 무죄/종결을 만들지 않는다. 조건부 법률 분류의 미확인은 unresolved이며 절차·양형 실행은 false다.
- 로그/임시 파일은 out/에만 둔다. 사람의 커밋·병합 결정을 대신하지 않는다.

## 실행 결과

courtroom-prototype에서:

- node generator/verify.js
- node generator/report-gen002.js
- 문구 최종 검토 후 생성기 전체 node --test --test-reporter=tap 재실행
- git diff --check, git diff 검토, git check-ignore, 기존/현재 숫자 게이트 비율 비교

| 검증 | checks | failures | exit code |
|---|---:|---:|---:|
| 생성기 전체 회귀 | 108 | 0 | 0 |
| npm test 기존 회귀 | 247 | 0 | 0 |
| 10종 × 300시드 네 숫자 게이트 | 40 | 0 | 0 |
| 합계 | 395 | 0 | 0 |

40개 게이트의 실제 (a)~(d) 건수·비율은 재작업 전 previous-balance-results.log와 동일하다. 가장 마지막 문구 조정은 이의 답변·개회사·재판장 말투와 버전 표시뿐이며 생성기 회귀를 다시 통과했다. 판정 코드/서비스/밸런스 기준은 수정하지 않았다. 실패 명령의 상태 불변, 결정성, 실제 기록 재생은 기존 회귀에서도 계속 확인한다.

친족 조건부 분류의 합의 필드를 마지막으로 일관되게 맞춘 뒤 content/rework.test.js 8개를 추가 재실행했다(8/8, 실패 0, exit 0; 중복 실행이므로 위 고유 체크 합계에 더하지 않음). 최종 검사에서 공판 전문/판결 각각 30건, out/ 밖 로그 0개, git diff --check 오류 0개, out/ ignore 적용, task-world-001의 clean 상태를 확인했다.

전망 일치표는 10종 × 두 정책, 6,000건이다. 일치율은 44.3~68.0%이며 수치를 숨기거나 실제 엔진 결과로 전망을 보정하지 않았다. 미조사 사실 동반 오차와 그 밖의 추정 오차를 모두 표에 싣는다. 이는 예측 품질의 한계이며 모든 불일치를 숨은 반전 탓으로 처리하지 않는다.

## fixture / 미구현 / 설계 판단

- 인물·대사·사실 후보·반전·판정 강도는 실험용 authored 콘텐츠다. 범용 법률 추론·사실인정 AI가 아니다.
- 법체계 팩의 기계 필드는 분류/설명 데이터다. 사건별 적용시점·친족 예외·교통 특례는 미검증이므로 자동 소추 조건/공소기각/양형/합의 종결을 구현했다고 주장하지 않는다.
- 증거능력, 항소, 판사/상대 AI, World/Career/Business 통합, UI 연결과 save는 미구현이다. 이번에는 새로운 브라우저 UI 작업을 하지 않았다.
- 판결 범위 확대나 다음 단계 설계는 결정하지 않았다. root DESIGN.md와 기존 엔진/서비스는 계약의 Read only로 보존했다.
- 사람이 판단할 질문은 REPORT의 세 가지: 인물 구별, 증언 한정의 설득력, 전망 차이의 수용 가능성.

## 범위 검토

수정은 generator/ 안에만 있다. DEMO-DESIGN.md, SIGNATURE.md, 기존 engine/services, world/와 현재 Orca의 task-world-001 체크아웃은 변경하지 않았다. 리뷰 중 발견한 이의 인용 후에도 넓은 답변을 유지하던 문구와 과욕에 검사를 호명하던 재판장 문구를 원형별로 고쳤다. git diff를 검토했고 커밋·push·병합은 하지 않았다.
