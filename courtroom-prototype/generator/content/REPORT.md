# GEN-001 콘텐츠 자체 점검 — 2026-09-30

작성: Codex. Lane: experiment. 이번 작성 범위는 `generator/content/`뿐이다.

## 동일 요청 재확인

기준 HEAD `02a13a3`에서 기존 콘텐츠가 이미 저장돼 있음을 확인했다. 계약서와 generator 보고서, 설계 메모 §1.3·§1.5를 다시 읽었다. 콘텐츠를 중복 작성하거나 core를 수정하지 않았다.

- 관련 회귀 재실행: 42 tests / 42 pass / 0 fail / exit 0. 두 원형 각 500시드의 문구 완결 검증도 통과했다.
- `node generator/balance.js` 재실행: 2 checks / 0 failures / exit 0. 준비 없이 무죄 0/300, 모두 준비 후 173/300(57.7%)으로 아래 기록과 동일하다.
- 아래 `npm test`, 전체 탐색, 콘텐츠 별도 밸런스 수치는 앞선 실행 기록이다. 이번에는 다시 실행하지 않았다. 기존 템플릿만 검사하는 balance.js의 범위와 폭행 콘텐츠 77.0%에 관한 미결정 사항은 유지한다.
- 이번 변경은 content 내 보고서·검토 자료·실행 로그의 재확인 기록뿐이다. 다음 단계는 시작하지 않는다.

## 결과

1. **폭행 반전 4개 작성:** `twists.js`. 진실 조건, 조사 ID·비용·카드, 상대 수습, 재반대, 쟁점별 효과가 모두 기존 TwistModule 형식에 맞는다.
2. **폭행 문구 작성:** `copy.js`와 `index.js`. 사건 개요, 의뢰인 진술, 검찰 제출 자료, 조사·카드, 증인 주신문·반대신문·결론 요구, 재주신문·재반대, 쟁점 메모, 개회사, 진행·판결·복기 문구를 채웠다. 콘텐츠 진입점 출력 500시드에서 PLACEHOLDER 잔존 0건.
3. **ARCH_DUI 작성:** `archetypes.js`에 같은 Archetype 형식으로 추가하고 공판·일상 사건 문구도 채웠다. 운전자 특정과 운전 당시 음주 상태를 분리했다. 폭행 반전은 DUI에 적용하지 않는다.

특정 실제 사건의 실명·날짜·장소를 사용하지 않았다. 실제 판결 여러 건을 추출·대조한 결과물은 아니며, 법리·현실성 검토는 남아 있다. 새로운 실험 규칙은 [RULES.md](RULES.md)에 모두 정리했다.

## 사용

`courtroom-prototype/`에서:

```js
const content = require('./generator/content');
const assault = content.buildContestedCase('ARCH_CRIMINAL_ASSAULT', 42);
const dui = content.buildContestedCase('ARCH_DUI', 42);
const daily = content.generateDailyCase('ARCH_DUI', 42);
```

`core/contested.js`를 직접 부르면 기존 템플릿이 나온다. 기존 웹 페이지의 데이터 연결은 변경하지 않았다. 콘텐츠 진입점은 기존 생성기 반환값의 문구를 채우며 수치·효과·상태 변경·판정은 기존 계층에 둔다.

## 요청한 밸런스 명령 결과

실행 위치: `courtroom-prototype/`.

```text
node generator/balance.js
GEN-001 밸런스 점검 — 300시드, ARCH_CRIMINAL_ASSAULT
  준비 없이: 유죄 300 / 무죄 0
  모든 준비: 유죄 127 / 무죄 173 (무죄율 57.7%)
  PASS (a) 준비 없이 진행 시 무죄 0건 — 무죄 0건 / 300건
  PASS (b) 모든 준비 후 무죄 30~70% — 무죄 173/300건 = 57.7%
```

**2 checks / 0 failures / exit 0.** 이 스크립트는 `core/archetype.criminal.example.js`와 `core/contested.js`를 읽고 반전 후보로 `[]`를 넘긴다. 따라서 위 PASS는 기존 템플릿의 결과다.

### 콘텐츠를 실제 사용한 추가 관찰

동일한 `core/playthrough.js`를 콘텐츠 진입점 출력에 적용했다. 원형별 seed 1~300, 준비 없음/모두 준비, 접근법 우선 정책. 예외 0건, 총 1,200회 판결까지 완주, 진단 명령 exit 0.

| 원형 | 준비 없이 무죄 | 모두 준비 후 무죄 | 재반대 실행 기록 수 |
| --- | --- | --- | --- |
| ARCH_CRIMINAL_ASSAULT | 0/300 | 231/300 (77.0%) | 452 |
| ARCH_DUI | 0/300 | 172/300 (57.3%) | 0 |

**폭행 콘텐츠의 77.0%는 스크립트의 30~70% 구간을 벗어난다.** 해당 구간을 새 콘텐츠에도 적용하면 미충족이다. 수치를 맞추기 위한 튜닝은 하지 않았다. 기존 원형과 새 원형은 진실 파라미터 수가 달라 RNG 소비 순서도 다르므로, 증가분 전부를 반전 효과라고 단정할 수 없다.

재현 명령:

```powershell
node -e "const C=require('./generator/content'); const {playThrough}=require('./generator/core/playthrough'); for(const id of Object.keys(C.archetypes)){let noPrep=0,fullPrep=0,rebuttals=0;for(let seed=1;seed<=300;seed++){const d=C.buildContestedCase(id,seed);noPrep+=playThrough(d,{fullPrep:false}).outcome==='not_guilty';const full=playThrough(d,{fullPrep:true});fullPrep+=full.outcome==='not_guilty';rebuttals+=full.view.records.filter(r=>r.kind==='rebuttal').length;}console.log(JSON.stringify({id,seeds:300,noPrepAcquittals:noPrep,fullPrepAcquittals:fullPrep,rebuttals}));}"
```

## 회귀 결과

| 명령 | 합계 | 통과 | 실패 | exit |
| --- | ---: | ---: | ---: | ---: |
| `node --test generator/core/tests/*.test.js generator/content/content.test.js` | 42 | 42 | 0 | 0 |
| `npm test` | 247 | 247 | 0 | 0 |
| `node --test` | 331 | 321 | 10 | 1 |

전수 탐색의 10건은 기존 보고서에도 있던 `Cannot find module 'playwright'` 오류다. 실패 파일은 `test-results.log`에 기록했다. 의존성 설치나 범위 밖 테스트 수정은 하지 않았다. 위 집계는 서로 겹치므로 합산하지 않는다.

신규 회귀 12개: 원형·반전 형식, 활성 조건 경계 양쪽, 다른 원형 배제, 500시드씩 결정성·엔진 검증·문구 완결, 폭행 반전 16조합, 비활성 카드·재주신문 부재, 문구 적용 전후 기계적 값 보존, 일상 문구, 실제 서비스 완주·실패 명령 원자성·기록 재생, truth 문구 분기, 잘못된 원형 요청 후 원본 보존. 실제 서비스 회귀는 원형별 20시드 × 준비 2종을 포함한다.

## 계약 완료 기준 점검

| GEN-001 기준 | 상태·근거 |
| --- | --- |
| 3분야 × 10건 사람 검수, 모순·어색함 없음 | 미충족. 이번 범위는 폭행·DUI 초안이며 사람 검수는 하지 않았다. 임대차·대형 사건은 미작성. |
| 절대 못 이기는 승부 사건 0개 | 미검증. 위 드라이버는 한 정책만 실행하며 가능한 모든 전략을 탐색하지 않는다. 무죄율을 이 기준의 충족으로 해석하지 않는다. |
| 준비 없이 이기는 사건 0개 | 지정 정책·seed 1~300에서 두 원형 모두 0건. 모든 전략·시드에 대한 증명은 아니다. |
| 결정성·검증기 테스트 통과 | 관련 42/42 통과. 전체 탐색은 기존 브라우저 의존성 오류 10건으로 미통과. |

## fixture·TBD·범위

- 모든 사건 사실과 대사는 작성된 실험 시나리오다. 진실 파라미터는 관찰·증거 정황을 표현하며 실제 행위자·상해 원인의 완전한 인과 모형은 아니다.
- 기존 ISSUE_CAUSATION은 인과관계와 정당방위 정황을 함께 담는다. 쟁점 분리나 정당방위 판단 엔진은 이번에 설계하지 않았다.
- 판결·증거능력·역산·법률 추론 시스템을 새로 구현하지 않았다. 표시된 판결은 기존 실험 엔진 결과다.
- 검찰 증거서류의 문구는 채웠지만 기존 core 조사에는 `reveals`가 없다. 웹 연결·서류 공개 동선 변경은 남아 있다.
- 기존 준비 예산은 모든 조사를 허용한다. 시간·비용·효과·AI·UI·저장·경제 연동은 변경하지 않았다.
- 작업 중 다른 작업자가 `generator/core/`, `generator/REPORT.md`, `generator/balance.js`를 추가·수정했다. 2.5단계 보고서를 다시 확인하고 새 출력 필드의 문구도 채웠다. 이 변경들은 이번 콘텐츠 변경에 포함하지 않았다.
- 범위 밖 변경 없음. 리뷰 자료·규칙·로그도 content 안에만 작성했다. 전수 회귀 실패와 콘텐츠 밸런스 미충족을 남긴 상태로 커밋·병합·push하지 않았다. 다음 단계도 시작하지 않는다.

## 사람이 판단할 질문

1. 폭행의 준비 후 무죄율 77.0%를 유지할지, 다음 작업에서 수습·재반대 효과를 조정할지?
2. 네 반전이 동시에 있을 때 조사와 재주신문 분량이 재미를 유지하는지?
3. 음주운전에서 운전자와 측정 시점을 분리한 공방이 설득력 있게 읽히는지?
