# GEN-001 조정 결과 — 2026-10-01

브랜치 `task/gen-001`, 기준 HEAD `b7bfeba`. Lane: experiment. 사용자 결정으로 `core/playthrough.js`·`balance.js` 수정까지 포함했다. 커밋·병합은 하지 않았다.

## 결과와 전후 비교

폭행·음주운전 각각 seed 1~300, 총 600사건. 난수는 기존 `createRng(seedFor(seed, archetypeId + ':random-policy'))`를 사용한다. 판정에는 난수를 추가하지 않는다.

| 원형·단계 | (a) 무준비 무죄 | (b) 최선 경로 무죄 가능 | (c) 무작위 준비 + 상식적 신문 | (d) 조사만 바꿔 결과 변경 | (e) 완전 무작위 참고 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 폭행: 조정 전 원본 | 0/300 (0%) | 189/300 (63.0%) | 미구현 | 미측정 | 9/300 (3.0%) |
| 폭행: 정책·경로 수정, 수치 전 | 0/300 (0%) | 257/300 (85.7%) | 52/300 (17.3%) | 256/300 (85.3%) | 9/300 (3.0%) |
| **폭행: 조정 후** | **0/300 (0%)** | **300/300 (100%)** | **133/300 (44.3%)** | **300/300 (100%)** | 26/300 (8.7%) |
| 음주운전: 조정 전 원본 | 0/300 (0%) | 184/300 (61.3%) | 미구현 | 미측정 | 6/300 (2.0%) |
| 음주운전: 정책·경로 수정, 수치 전 | 0/300 (0%) | 255/300 (85.0%) | 46/300 (15.3%) | 255/300 (85.0%) | 6/300 (2.0%) |
| **음주운전: 조정 후** | **0/300 (0%)** | **300/300 (100%)** | **133/300 (44.3%)** | **300/300 (100%)** | 21/300 (7.0%) |
| 요청 기준 | 0% | ≥90% | 40~65% | ≥50% | 참고 출력 |

원본의 (c)는 완전 무작위였으므로 새 (e) 열에 옮겼다. 원본 (d)는 조사 외에 집중 쟁점·신문 대상도 함께 바꾸는 지표였다(폭행 48.3%, 음주운전 49.0%). 이번 (d)는 같은 target·focus·stance·신문 정책에서 **해당 쟁점 조사 우선 / 다른 쟁점 조사 우선**만 비교한다. 쟁점 중 하나라도 결과가 달라지면 사건 1건으로 센다. 두 경로 모두 예산 제한을 지킨다. 새 수치에서는 두 쟁점 모두 잘 준비하면 무죄가 가능해 옛 지표는 두 원형 모두 **0%**다. 이 값도 balance 출력에 남겼다. 서로 다른 정의를 동일 지표의 개선으로 비교하지 않는다.

### 원인과 수정

- 완전 무작위는 카드 없는 접근·과욕·신문 조기 종료·준비한 재반대 포기를 섞어, 준비 효과보다 행동 낭비를 측정했다.
- 새 (c)는 예산 안 조사 순서를 섞고, focus·stance·이의를 무작위 선택한다. 반대신문은 보유 카드의 접근법을 무작위 순서로 쓴다. 입장 충돌 접근법도 카드가 있으면 후보에 포함한다. overreach는 쓰지 않고, limited는 서비스에서 사용 가능하며 엔진의 근거 점수 조건도 충족할 때만 쓴다. 가능한 재반대는 전부 한다. 신문 시간 제한은 그대로 적용한다.
- 최선 경로는 준비한 접근법 뒤에도 `_UNSUPPORTED` 접근법을 먼저 골라 세 번째 시간을 소모했다. 카드 있는 증거 접근법만 고르게 해 limited까지 도달하도록 수정했다. limited의 성공 조건도 확인한다.
- `strengthRange`는 폭행 IDENTITY·음주 DRIVER **[3,7] → [3,4]**, 폭행 CAUSATION·음주 INTOXICATION **[3,7] → [3,5]**. 하한 3은 doubt 2보다 커서 무준비 무죄를 막는다. 각 원형의 noise 1과 truth 방향은 유지했다.
- 접근법 -1, limited 성공 -1/실패 +1, overreach +2·credibility -1, 반전의 회복/재반대 ±1·±2는 유지했다. 예산도 `max(2, round(총비용 × 0.6))` 유지(정수 반올림 때문에 실제 비율은 사건별로 다름). 이번 수치 변경은 콘텐츠 원형 범위뿐이다.
- `check-balance.js`도 objection/rebuttal을 구분한다. 카드 없이 추궁한 무죄 0% 검증은 유지했고, 40~65% 검증 대상은 새 (c)로 맞췄다. 옛 고정 순서 준비는 fullPrep 참고 출력으로 남겼다.

## 테스트와 불변식

기존 content 14개 중 7개 실패 → **17개 전부 통과**(기존 14개 수리 + 정책 회귀 3개). 기존 core **43/43**, 프로토타입 **247/247** 통과. 합계 **307 tests / 0 failures**, balance **8/8 checks**, 콘텐츠 보조 점검 **2/2**. 총 **317 checks / 0 failures**, 최종 명령 모두 exit 0.

- 문구 완결 검증은 overreach에 없는 success를 억지로 요구하지 않고, limited success 필수·overreach success 부재·모든 fail 및 이의·입장 충돌·재주신문·재반대 문구를 검증한다.
- 수치 보존 검증에 byStance·입장 충돌 비용·이의 효과·overreach credibility를 포함한다.
- 서비스 테스트는 예산 안 조사로 완주하며, 예산 초과·존재하지 않는 조사 실패 후 상태 불변을 확인한다.
- 기본 접근법은 해당 카드일 때만 -1/근거 1개를 만든다. 다른 카드/카드 없음은 거부되고 상태가 그대로다. limited는 근거 1개로 실패·2개로 성공, overreach는 2개여도 실패한다. 입장 충돌 접근법은 점수 0, DENY에서만 credibility -1이다.
- 새 (c) 기록에서 카드 보유·지출 한도·limited 성공 조건·재반대 사용·focus/stance/이의 분기·같은 seed 재현 및 replay를 확인한다. (e)의 과욕·무근거 추궁·재반대 포기 경로도 남아 있다.
- (b)/(d)는 prepared 접근법 뒤 limited가 실제 실행되는지, 조사 순서를 바꿔도 opening이 같은지, 두 기록이 replay되는지 확인한다.

코어 디렉터리를 직접 넘긴 `node --test generator/core/tests`는 이 Node 환경에서 모듈 경로 오류(exit 1)가 났다. 파일 glob 명령으로 다시 실행해 43개를 통과했다. 실패 실행은 파일·게임 상태를 변경하지 않았다. 아래에 해당 출력도 보존했다.

## 문서와 법률 정정

[CATALOG.md](content/CATALOG.md)에 공식 조문·판례 링크를 붙였다. 형법 307·309조 및 정보통신망법 70조의 반의사불벌, 모욕 311조의 친고죄를 확정 기재했다. 사기·횡령에는 친족상도례와 2024 헌법불합치 결정, 이후 2025.12.31. 개정을 함께 적고 사건별 친족 관계·행위 시점·경과 규정은 **[확인 필요]**로 남겼다. 형사공탁(294조의6)과 피해자 의견 청취를 사기·횡령·기존 폭행류 검토 항목에 추가했다. 무고 목적에 징계처분, 주거침입에 공용 복도·계단의 보호 가능성을 반영했다. 법률 적용·양형 기능은 구현하지 않았다.

SIGNATURE 9행의 §1.10 부재 문구를 갱신하고 §3이 민사여서 현 형사 공판 엔진으로 구현할 수 없음을 명시했다. **DEMO-DESIGN.md 전체와 SIGNATURE §1은 HEAD와 비교해 변경 없음**을 확인했다.

## 완료 기준·한계·인계

| 기준 | 상태·근거 |
| --- | --- |
| 새 (c), 기존 완전 무작위 (e) | 충족: 별도 정책·참고 출력·기록 회귀 |
| content.test 7개 실패 수리, 불변식 유지 | 충족: 기존 14개 + 새 3개 통과 |
| (a)~(d) 목표 및 전후 표 | 충족: 두 원형 각 300시드, 8개 게이트 통과 |
| CATALOG 법률 정정 | 충족: 요청 항목 및 공식 출처 반영 |
| SIGNATURE 지정 부분 정정·금지 부분 보존 | 충족: §1·DEMO-DESIGN 보존 비교 |
| 관련 테스트·balance 출력 전체 | 충족: 아래 전문 및 content/test-results.log |
| 원 계약의 분야 3개 × 10개 사람 읽기 검수 | **미완: 사람 검수 필요**. 이번에 민사 공판을 확장하지 않음 |
| 원 계약의 못 이기는 승부 사건 0개 | 이번 검증 600건에서는 충족. 전체 seed 공간 보증은 아님 |

새로 정한 실험용 규칙은 [RULES.md](content/RULES.md) 맨 위에 정리했다. 사건 원형·대사·이의 proper/improper 순서는 authored fixture다. (b)는 쟁점별 집중 경로를 찾는 드라이버이며 모든 가능한 행동 조합을 완전 탐색하는 증명기는 아니다. seed 1~300은 조정에 사용한 표본으로, 별도 holdout 성능을 주장하지 않는다. 좁아진 strengthRange와 두 쟁점 모두 준비하면 이길 수 있는 구조가 재미있는지는 사람 판단이 남아 있다.

사람 판단 질문:
1. 새 (c)의 44.3%와 준비한 최선 경로 100%가 체감 난도에 맞는가?
2. 두 쟁점 어느 쪽도 잘 준비하면 이길 수 있는 구성이 반복 플레이에 충분한 차이를 주는가?
3. 카탈로그의 사건별 법률 적용·경과 규정 검토를 다음 콘텐츠 구체화 전에 확정할 수 있는가?

수정은 `generator/` 안의 사용자 허용 파일과 인계 문서뿐이다. 기존 미추적 `courtroom-prototype/world/`는 건드리지 않았다. engine/services/UI·보호 문서·다음 단계 작업은 변경하지 않았다. 상세 변경 파일·명령은 [REVIEW_PACKET.md](content/REVIEW_PACKET.md). 사람 커밋·병합 대기.

## 최신 실행 출력 전체

실행 위치: `courtroom-prototype/`.

### node --test generator/core/tests/*.test.js

```text
✔ selectActivatedTwists: activation을 만족하면 고른다 (1.6624ms)
✔ selectActivatedTwists: activation을 만족하지 않으면 고르지 않는다 (버그 회귀) (0.3ms)
✔ selectActivatedTwists: 후보 목록이 비어 있으면 언제나 빈 배열이다 (0.158ms)
✔ selectActivatedTwists: appliesTo가 다른 원형이면 activation과 무관하게 고르지 않는다 (0.2258ms)
✔ buildContestedCase: activation false면 witness redirect가 비어 있고 twist 카드가 안 붙는다 (1.2521ms)
✔ buildContestedCase: activation true면 witness redirect에 twist가 정확히 변환되어 붙는다 (0.721ms)
✔ buildContestedCase: 같은 시드는 twistsApplied를 포함해 같은 사건을 만든다 (1.1323ms)
✔ buildContestedCase: 후보 twist 없이도 반전 없는 사건을 만든다 (하나도 없으면 반전 없는 사건) (1.254ms)
✔ 항목1: 준비 예산이 조사 총비용의 약 55~65%이고 최소 2다 (twist 없음/있음 둘 다) (4.3649ms)
✔ 항목2: opening.focus는 균형 1개 + 쟁점별 1개(2개 원형이면 3개), stance는 3개다 (0.9339ms)
✔ 항목2: 쟁점별 focus는 그 쟁점의 증인에게 더 많은 시간을, 다른 증인에게는 더 적게 준다 (0.3272ms)
✔ 항목2: 활성화된 twist가 있는 쟁점에는 stance 충돌 접근법(byStance + stanceConflict)이 붙는다 (3.5018ms)
✔ 항목3: 증인마다 이의 창이 정확히 1개이고, 두 증인 사이에 proper/improper가 섞인다 (0.3863ms)
✔ 항목4: 증인마다 press가 limited 1개 + overreach 1개다 (0.469ms)
✔ 항목4: 결론 요구 성공이 경계선 사건을 doubt로 뒤집는 실제 경로가 존재한다 (578.6891ms)
✔ 항목4: 과욕(overreach) press는 항상 실패하고 credibility를 깎는다 (0.2955ms)
✔ 항목5 유틸: playBestPathForIssue는 결정적이다(같은 입력 같은 출력) (4.7037ms)
✔ 항목5 유틸: playThroughRandom은 같은 rng 시퀀스면 같은 결과, 다른 시드면 최소 하나는 값이 다르다 (83.0014ms)
✔ 항목6: 같은 seed 번호라도 원형이 다르면 truth 스트림이 분리된다 (0.3486ms)
✔ 항목6: seedFor는 결정적이다(같은 입력 같은 출력) — createRng(seedFor(seed, id))로 매번 같은 스트림을 얻는다 (0.2006ms)
✔ 신규 구조 스모크: validate 통과 + playThrough(양쪽) 완주, 여러 시드 (33.7573ms)
✔ archetype.criminal.example: 형식 검증을 통과한다 (1.5714ms)
✔ buildContestedCase(criminal, seed, []): 반전 후보가 없으면 템플릿만으로 사건을 만든다 (1.0231ms)
✔ buildContestedCase(criminal): engine/trial.js validate()를 통과한다 (빠른 구조 점검, 여러 시드) (2.9559ms)
✔ buildContestedCase(criminal) → playThrough: 준비 없이도 판결까지 끝까지 진행된다 (acceptance bar) (19.1801ms)
✔ buildContestedCase(criminal) → playThrough: 모든 준비 후에도 판결까지 끝까지 진행된다 (acceptance bar) (19.6056ms)
✔ playThrough: 준비 없이 진행하면 카드가 없어 approach를 쓸 수 없고 무죄가 나오지 않는다 (2.5단계 항목 a 단위 회귀) (1.9988ms)
✔ buildContestedCase(criminal): 같은 시드는 같은 사건을 만든다 (0.8971ms)
✔ buildContestedCase(criminal): issue baseline이 항상 bands.doubt보다 크다 (2단계 항목 2) (10.1775ms)
✔ buildContestedCase(criminal): 전역 id가 모두 유일하다 (engine validate의 암묵적 요구사항) (1.0035ms)
✔ generateDailyCase: 같은 시드는 같은 사건을 만든다 (2.33ms)
✔ generateDailyCase: 다른 시드는 다른 사건을 만든다 (0.3626ms)
✔ generateDailyCase: 값이 원형 범위 안에 있다 (0.4032ms)
✔ generateDailyCase: outcomeSummary는 claim_amount(보증금)를 쓰고 retainer(착수금)와 섞이지 않는다 (0.1975ms)
✔ evaluateActivation: 연산자별로 truth 값을 올바르게 비교한다 (0.2291ms)
✔ computeBaseStrength: direct/inverse 방향이 반대로 움직인다 (0.1416ms)
✔ validateArchetype: 유효한 예시 원형은 문제가 없다 (0.4294ms)
✔ validateArchetype: issue를 커버하지 않는 evidence_strength_rules는 거부된다 (0.2152ms)
✔ validateArchetype: claim_amount 범위가 없으면 거부된다 (0.2162ms)
✔ validateTwist: 유효한 예시 반전은 문제가 없다 (0.4489ms)
✔ validateTwist: targetIssue가 원형에 없으면 거부된다 (0.2238ms)
✔ validateTwist: activation.param이 truth_params에 없으면 거부된다 (0.1646ms)
✔ validateTwist: opponentRecovery.effect.issue가 targetIssue와 다르면 거부된다 (0.1312ms)
ℹ tests 43
ℹ suites 0
ℹ pass 43
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 851.7225
exit code: 0
```

### node --test generator/content/content.test.js

```text
✔ 폭행 4개·DUI 3개 반전이 기존 형식에 맞고 다른 원형 참조는 거부된다 (3.8993ms)
✔ 일곱 반전은 0.60에서 활성화·0.59에서 비활성화하고 다른 원형에는 붙지 않는다 (1.7084ms)
✔ ARCH_CRIMINAL_ASSAULT: 500시드 결정성·엔진 검증·문구 완결·활성/비활성 카드 참조 (309.3689ms)
✔ ARCH_CRIMINAL_ASSAULT: 콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다 (5.2097ms)
✔ ARCH_CRIMINAL_ASSAULT: 일상 사건 문구에 민사 보증금이 섞이지 않고 입력이 결정적이다 (0.7123ms)
✔ ARCH_CRIMINAL_ASSAULT: 준비 유무 양쪽에서 실제 서비스 완주·실패 원자성·기록 재생 (234.1333ms)
✔ ARCH_DUI: 500시드 결정성·엔진 검증·문구 완결·활성/비활성 카드 참조 (194.5963ms)
✔ ARCH_DUI: 콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다 (3.7472ms)
✔ ARCH_DUI: 일상 사건 문구에 민사 보증금이 섞이지 않고 입력이 결정적이다 (0.3594ms)
✔ ARCH_DUI: 준비 유무 양쪽에서 실제 서비스 완주·실패 원자성·기록 재생 (207.1303ms)
✔ 진실에 대응하는 문구가 분기 경계 양쪽을 반영한다 (0.4896ms)
✔ 주신문은 입증할 내용을 말하고 한계·방어 정황은 카드 제시 때 드러난다 (0.4862ms)
✔ 모든 접근법은 카드 없음·다른 카드·해당 카드의 기록과 근거 점수를 구분한다 (1.6714ms)
✔ 알 수 없는 콘텐츠 요청은 원형 데이터를 오염시키지 않는다 (0.7604ms)
✔ 정책 c: 예산·카드·limited 조건, 재반대 사용, 결정성과 기록 재생 (2325.0242ms)
✔ 정책 e: 기존 무작위의 과욕·무근거 추궁·재반대 포기를 참고 경로로 보존 (244.4308ms)
✔ 정책 b/d: 준비된 접근법 뒤 limited, 조사 우선순위만 바꾼 대조군 (565.2105ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4286.4143
exit code: 0
```

### npm test

```text

> the-firm-courtroom-experiment@0.10.0 test
> node --test tests/core.test.js tests/strategy.test.js tests/inference.test.js tests/procedure.test.js tests/flow.test.js tests/tactics.test.js tests/opening.test.js tests/closing.test.js tests/closing-profile.test.js tests/adjudication.test.js tests/trial.test.js

✔ decision appends procedural marker only, preserving all prior record layers (75.9038ms)
✔ same JSON CourtRecord produces identical finding and verdict without UI state (28.0795ms)
✔ decision cannot run prematurely and unavailable before Closing publication (33.8448ms)
✔ no Closing profile ends examinations and permits direct decision (15.3675ms)
✔ legacy profile without adjudication still resolves normally (12.4517ms)
✔ sparse Closing does not supply missing facts; direct testimony remains real evidence (28.0314ms)
✔ Opening, procedural success and eloquent claims cannot substitute for evidence (0.6315ms)
✔ issue scope cannot leak either direction (1.0136ms)
✔ active Counter and valid qualification change local finding, never foreign finding (38.9966ms)
✔ admission and subsequent overreach qualification both remain in findings (13.8363ms)
✔ selected Closing arguments change context only, not evidence-based findings (19.5215ms)
✔ required issues and assigned burden determine verdict using complete proof routes (25.2389ms)
✔ all required issues must satisfy burden and recorded doubts defeat otherwise complete proof (2.6357ms)
✔ duplicate evidence and duplicated advocacy never accumulate into proof (1.5871ms)
✔ unresolved witness contradiction blocks proof and stays local (2.9768ms)
✔ replay freezes referenced decision input and rejects missing input/version mismatch (12.1623ms)
✔ reject unsupported/partial adjudication d=>delete d.adjudication (16.5877ms)
✔ reject unsupported/partial adjudication d=>delete d.profile.phases.verdict (2.5769ms)
✔ reject unsupported/partial adjudication d=>d.profile.actions=d.profile.actions.filter(a=>a!=='deliverVerdict') (3.1018ms)
✔ reject unsupported/partial adjudication d=>d.adjudication.requiredIssues[0].standard='score_75' (1.7988ms)
✔ reject unsupported/partial adjudication d=>d.adjudication.requiredIssues[0].burden='jury' (2.2309ms)
✔ reject unsupported/partial adjudication d=>d.adjudication.factFinder='jury' (2.4642ms)
✔ reject unsupported/partial adjudication d=>d.adjudication.decisionRule='sum' (2.2924ms)
✔ reject unsupported/partial adjudication d=>d.adjudication.requiredIssues=[] (18.1458ms)
✔ reject unsupported/partial adjudication d=>d.adjudication.issues[0].doubts[0].all=['P_PRINT_TIME_UNKNOWN'] (24.0996ms)
✔ public commitment conflict is advocacy context, never a substitute for evidentiary doubt (1.3213ms)
✔ finding reads records without mutation and does not infer evidence from available exhibits (2.3309ms)
✔ proof route requires every recorded premise rather than number of facts (1.2299ms)
✔ opposing complete proof paths remain unresolved instead of silently choosing a side (2.0762ms)
✔ party evidence labels are authored data, not criminal strings in engine (1.4794ms)
✔ reject partial Closing phaseOnly (15.7452ms)
✔ reject partial Closing actionOnly (1.5979ms)
✔ reject incomplete lifecycle missing closing (1.7299ms)
✔ reject incomplete lifecycle missing closed (2.107ms)
✔ reject incomplete lifecycle missing beginClosing (2.8472ms)
✔ reject incomplete lifecycle missing submitClosing (9.5043ms)
✔ no Closing resolves both witnesses and rejects both commands atomically (43.2677ms)
✔ complete profile availability and commands agree through Closing (27.5116ms)
✔ speech dedupe preserves every position, revision and conflict: mixed=false (12.8583ms)
✔ speech dedupe preserves every position, revision and conflict: mixed=true (21.7489ms)
✔ Closing requires both ended examinations and cannot create evidence or alter earlier advocacy (59.2771ms)
✔ Case-wide catalog uses both witnesses and recorded frames; unrecorded variants unavailable (32.8289ms)
✔ same CourtRecord and different selected arguments yield different Advocacy without auto inclusion (97.3597ms)
✔ published Closing replays from JSON CourtRecord without UI, history or witness state (58.3794ms)
✔ closing draft phase also replays from records, and reset clears it (45.5944ms)
✔ Core/Peripheral independent of closing selection and no fabricated intent support (43.5941ms)
✔ Opening revision links original commitment and appends conflict, preserving Strategy Revision history (22.8673ms)
✔ maintaining or omitting public positions does not silently rewrite or invent conflicts (44.0832ms)
✔ missing, foreign, duplicate and incomplete argument references fail atomically (83.5913ms)
✔ active counters and later witness qualifications remain in selected closing synthesis (45.0253ms)
✔ qualified counter uses only actual recorded qualification and preserves adverse record (46.9408ms)
✔ unaddressed counters survive synthesis without being silently resolved (13.5069ms)
✔ two witness arguments combine only their own cited premises in one Closing (99.6355ms)
✔ authored content is valid and original input is not mutated (18.4219ms)
✔ all favorable fact orders: G_DISTANCE/G_LIGHTING/G_DURATION/G_INITIAL (24.7197ms)
✔ all favorable fact orders: G_DISTANCE/G_LIGHTING/G_INITIAL/G_DURATION (13.3631ms)
✔ all favorable fact orders: G_DISTANCE/G_DURATION/G_LIGHTING/G_INITIAL (11.902ms)
✔ all favorable fact orders: G_DISTANCE/G_DURATION/G_INITIAL/G_LIGHTING (71.8263ms)
✔ all favorable fact orders: G_DISTANCE/G_INITIAL/G_LIGHTING/G_DURATION (12.1619ms)
✔ all favorable fact orders: G_DISTANCE/G_INITIAL/G_DURATION/G_LIGHTING (10.0472ms)
✔ all favorable fact orders: G_LIGHTING/G_DISTANCE/G_DURATION/G_INITIAL (34.4241ms)
✔ all favorable fact orders: G_LIGHTING/G_DISTANCE/G_INITIAL/G_DURATION (47.284ms)
✔ all favorable fact orders: G_LIGHTING/G_DURATION/G_DISTANCE/G_INITIAL (10.4675ms)
✔ all favorable fact orders: G_LIGHTING/G_DURATION/G_INITIAL/G_DISTANCE (33.7588ms)
✔ all favorable fact orders: G_LIGHTING/G_INITIAL/G_DISTANCE/G_DURATION (29.5241ms)
✔ all favorable fact orders: G_LIGHTING/G_INITIAL/G_DURATION/G_DISTANCE (11.6735ms)
✔ all favorable fact orders: G_DURATION/G_DISTANCE/G_LIGHTING/G_INITIAL (14.8295ms)
✔ all favorable fact orders: G_DURATION/G_DISTANCE/G_INITIAL/G_LIGHTING (23.0767ms)
✔ all favorable fact orders: G_DURATION/G_LIGHTING/G_DISTANCE/G_INITIAL (9.9788ms)
✔ all favorable fact orders: G_DURATION/G_LIGHTING/G_INITIAL/G_DISTANCE (21.8638ms)
✔ all favorable fact orders: G_DURATION/G_INITIAL/G_DISTANCE/G_LIGHTING (12.6417ms)
✔ all favorable fact orders: G_DURATION/G_INITIAL/G_LIGHTING/G_DISTANCE (41.9217ms)
✔ all favorable fact orders: G_INITIAL/G_DISTANCE/G_LIGHTING/G_DURATION (11.3227ms)
✔ all favorable fact orders: G_INITIAL/G_DISTANCE/G_DURATION/G_LIGHTING (9.764ms)
✔ all favorable fact orders: G_INITIAL/G_LIGHTING/G_DISTANCE/G_DURATION (23.1893ms)
✔ all favorable fact orders: G_INITIAL/G_LIGHTING/G_DURATION/G_DISTANCE (10.1124ms)
✔ all favorable fact orders: G_INITIAL/G_DURATION/G_DISTANCE/G_LIGHTING (10.0548ms)
✔ all favorable fact orders: G_INITIAL/G_DURATION/G_LIGHTING/G_DISTANCE (30.6415ms)
✔ ADMIT from uncertain statement plus two observation conditions (22.0368ms)
✔ EXPLAIN adds durable counter and repeat adds familiarity (21.5094ms)
✔ RESIST has no invented proposition (16.4702ms)
✔ record context changes response without changing selected lighting premises (18.7006ms)
✔ early stop is always available, including zero evidence (4.552ms)
✔ one premise cannot press/frame, two can; unrecorded and duplicate premises fail atomically (22.5827ms)
✔ counter propositions are recorded but incompatible with plan (12.5815ms)
✔ all failed commands preserve complete state and ID allocation (31.4243ms)
✔ Frame remains advocacy; duplicate combination rejected even if reordered (13.8474ms)
✔ working strategy changes preserve argument frames without inventing a major commitment (7.0892ms)
✔ theory B does not manufacture an intent finding (10.6588ms)
✔ resolution reads records, not question counts, selection, advocacy or question IDs (5.2677ms)
✔ returned state and input definition are defensive copies (13.8473ms)
✔ reset creates a new session with no reused runtime IDs (10.8493ms)
✔ complete sessions have globally unique runtime record IDs (18.9311ms)
✔ terminal state rejects all gameplay commands atomically (48.1578ms)
✔ a selected plan can be used before exhausting available facts (6.9979ms)
✔ deterministic replay (27.7598ms)
✔ content validator rejects missing proposition (1.7028ms)
✔ content validator rejects missing evidence (1.4645ms)
✔ content validator rejects duplicate ID (1.2391ms)
✔ content validator rejects unreachable premise (1.175ms)
✔ content validator rejects missing fallback (1.3851ms)
✔ content validator rejects unknown condition (1.3169ms)
✔ content validator rejects invalid tag (1.4156ms)
✔ content validator rejects invalid bounds (1.2509ms)
✔ civil architecture smoke: all IDs and content replaced without engine edits (10.6887ms)
✔ forensic direct testimony is evidence once, attributed to the correct witness (74.6297ms)
✔ either witness can be first without a seeding special case (25.7828ms)
✔ exact new inference INF_PRINT_TIME_SHARED (33.0976ms)
✔ exact new inference INF_PRINT_TIME_PRIOR (17.0956ms)
✔ exact new inference INF_PRINT_TIME_SHARED_PRIOR (21.42ms)
✔ strong new Press uses existing resolver and preserves adverse findings (26.1686ms)
✔ limited then reinforced forensic Press remains signature based (38.1518ms)
✔ same new argument has core versus peripheral value without locking questions (23.3902ms)
✔ thread navigation is non-linear and ending a thread does not stop examination (28.5502ms)
✔ lighting follow-up can be stopped, switched away or deliberately pursued (23.6701ms)
✔ witness navigation preserves records and pressures without cross-witness reuse (39.0308ms)
✔ closed witness stays closed and second witness remains examinable (31.8757ms)
✔ current witness cannot ask another witness goals or select foreign evidence (23.8767ms)
✔ multiple basis scene exposes available candidates, not a preselected solution (10.2275ms)
✔ chosen basis changes procedural scope: report (24.2434ms)
✔ chosen basis changes procedural scope: timing (30.1649ms)
✔ chosen basis changes procedural scope: report-access (20.3983ms)
✔ chosen basis changes procedural scope: access (19.8474ms)
✔ strict data profile limits same connected basis with unchanged engine (17.1453ms)
✔ basis size, duplicate, fabricated and foreign refs fail without state/ID pollution (72.242ms)
✔ pending procedure locks witness and topic changes and stops (36.2632ms)
✔ one available evidence basis retains automatic connection semantics (8.0953ms)
✔ scoped record replay ignores other witness concessions and procedure transactions (16.4594ms)
✔ forensic path works with every authored persistent ID renamed (17.7579ms)
✔ engine and service contain no fingerprint/case/proposition-specific branch identifiers (2.3551ms)
✔ data validation rejects foreign plan premise (1.6973ms)
✔ data validation rejects foreign topic (1.4622ms)
✔ data validation rejects foreign witness plan (1.7153ms)
✔ data validation rejects foreign basis (1.7274ms)
✔ data validation rejects missing direct response (2.4989ms)
✔ data validation rejects bad judge (3.1191ms)
✔ data validation rejects missing resolution fallback (1.5698ms)
✔ different proposition combinations resolve to authored inference variants (64.1109ms)
✔ weak, strong and compelling Frames create different record-only outcomes (39.8531ms)
✔ mixed light-source exploration adds favorable and hard counter propositions (22.3135ms)
✔ stopping before a mixed exploration preserves a strong uncontested argument (53.6152ms)
✔ hard counter remains in CourtRecord without an immediate response route (7.2625ms)
✔ argument frame is separate from a CaseTheory-level major commitment (20.1376ms)
✔ the same inference remains core in Theory A and peripheral in Theory B (6.1523ms)
✔ inference evaluation replays from CourtRecord and rejects forged variants (24.6711ms)
✔ content validation rejects duplicate inference basis and invalid hard-counter routes (5.4702ms)
✔ opening gates examination, choices are advocacy only and cannot be resubmitted (34.943ms)
✔ invalid, duplicate and mutually inconsistent opening choices fail atomically (36.8443ms)
✔ strategy revisions preserve opening and evidence, record explicit referential conflicts (33.7942ms)
✔ priority change alone is not a factual conflict and initial private/public conflict is visible (27.4184ms)
✔ record-only replay recovers public state and latest strategy with no history or selection (8.2701ms)
✔ opening issue links reach witness arguments and actual evidence; Theory B remains peripheral (24.8358ms)
✔ bad authored opening references fail construction (13.972ms)
✔ same examination commands yield identical semantic evidence and outcomes with/without opening (34.1814ms)
✔ IDENTITY counter reviews only same-issue public commitments after Opening and strategy revision (28.158ms)
✔ INTENT counter reviews only same-issue public commitments after Opening and strategy revision (12.5319ms)
✔ peripheral Frame keeps priority without challenging its same-issue commitment (13.3678ms)
✔ record-only IDENTITY counter cannot contaminate the opposite issue (1.7977ms)
✔ record-only INTENT counter cannot contaminate the opposite issue (0.7988ms)
✔ all theories must explicitly declare every position key, including unspecified (34.8956ms)
✔ case-wide links explicitly represent issue progression, not evidentiary support (5.5538ms)
✔ clean facts and strong Press proceed without objections (70.7662ms)
✔ foundation objection and Overruled are procedural only until witness answers (33.212ms)
✔ Sustained creates no evidence, advocacy, asked fact or press history (12.7922ms)
✔ Withdraw leaves only procedure and permits a different question (37.2948ms)
✔ Narrow foundation sacrifices mixed exploration and only records limited answer (36.315ms)
✔ Narrow Press abandons original conclusion without consuming Press history (24.6036ms)
✔ form Maintain requests Court Address tied to frozen record, issue and inference (39.244ms)
✔ Press Basis resumes original resolver exactly after ruling (13.8106ms)
✔ Maintain repetition is Overruled for an ambiguous preceding answer (23.7073ms)
✔ form discretion limits an otherwise connected conclusion {"proceduralStrictness":"strict"} (25.784ms)
✔ form discretion limits an otherwise connected conclusion {"advocacyLatitude":"narrow"} (13.5442ms)
✔ firm tolerance blocks repetition after ambiguous answer (35.6213ms)
✔ judge cannot override missing foundation or already admitted conclusion {} (20.4459ms)
✔ judge cannot override missing foundation or already admitted conclusion {"proceduralStrictness":"strict","tolerance":"firm","advocacyLatitude":"narrow"} (39.4065ms)
✔ pending question freezes other commands at all procedural stages (93.7451ms)
✔ invalid, duplicate, stale and unconnected basis payloads fail atomically (46.3436ms)
✔ Court Address rejects absent or wrong record linkage; allows withdrawal (16.0232ms)
✔ failed commands do not consume IDs or change subsequent results (35.1088ms)
✔ procedural history cannot change record evaluation; Frame remains advocacy (12.6485ms)
✔ major commitment source is advocacy only; legacy state is ignored (4.9512ms)
✔ invalid procedural data fails validation without a running simulation (8.6972ms)
✔ unused response metadata cannot inject unvalidated procedural basis (6.8874ms)
✔ Safe / Constructive / Aggressive have distinct payoffs and advocacy records (96.1706ms)
✔ Press can be worse than safe/framed play from identical premises (40.6555ms)
✔ reinforced Press with new selected basis obtains admission (23.6655ms)
✔ permutations and newly banked but unselected facts do not evade repetition (18.5633ms)
✔ subsets and restoring an earlier strong basis remain repeated (21.8807ms)
✔ incomparable new premise combination is not a simple repeat (15.1864ms)
✔ counter requires both counter and initial statement; failures atomic (60.9461ms)
✔ counter rebuttal preserves original, records provenance and improves framed outcome (35.0473ms)
✔ familiarity rebuttal never erases sign-light counter (29.6404ms)
✔ qualification without provenance does not neutralize counter (15.6621ms)
✔ same record/argument means core progress in A and peripheral argument in B without a major commitment (27.5783ms)
✔ identification counter conflicts with A but not contact-conceding B (15.3532ms)
✔ record-only evaluation ignores invalid UI plan/selection and question/pressure history (10.457ms)
✔ nested UI/pressure-dependent final rules are rejected (4.8443ms)
✔ counter definitions reject missing targets, basis, qualification and action (5.5592ms)
✔ invalid or press-only advocacy cannot create a Frame payoff (4.9348ms)
✔ reinforced admission and qualified counter replay from record only (25.6225ms)
✔ CONTACT: explicit commitments change same broad question response (53.5141ms)
✔ CONTACT: identical basis supports different scopes and adverse overreach (37.0252ms)
✔ CONTACT: stop preserves gain, extra conclusion leaves linked qualification (71.4329ms)
✔ CONTACT: final assessment replays with no UI or question history (12.1866ms)
✔ CONTACT: invalid foreign or missing claims are atomic (48.7209ms)
✔ SIGHT: explicit commitments change same broad question response (22.011ms)
✔ SIGHT: identical basis supports different scopes and adverse overreach (11.4972ms)
✔ SIGHT: stop preserves gain, extra conclusion leaves linked qualification (21.5838ms)
✔ SIGHT: final assessment replays with no UI or question history (7.7443ms)
✔ SIGHT: invalid foreign or missing claims are atomic (22.9708ms)
✔ opportunity before timing differs from locked prior-contact limitation (46.3735ms)
✔ middle question can recover a missing lock without silently deleting adverse narrative (16.7163ms)
✔ narrow claim does not allow repeating an admitted same claim; another scope is distinct (17.5561ms)
✔ recorded support is qualified then re-emphasized without deleting original finding (12.1563ms)
✔ default form has one substantive basis route, address fixture has one address route (17.8259ms)
✔ tactical authoring rejects duplicate (2.2672ms)
✔ tactical authoring rejects missing (1.8127ms)
✔ tactical authoring rejects foreign (1.7292ms)
✔ tactical authoring rejects fallback (1.7649ms)
✔ tactical authoring rejects relation (2.0519ms)
✔ tactical authoring rejects commitment (1.7351ms)
✔ tactical authoring rejects silentConflict (2.336ms)
✔ authored contradiction explicitly links and preserves earlier admission (30.921ms)
✔ explicit claim reinforcement keeps the canonical premise signature and uses new lock (20.8093ms)
✔ tactical response uses evidence commitments, never asked/history or a witness-specific ID (8.3543ms)
✔ full renamed content retains both witness tactical grammar (11.2997ms)
✔ claim and procedure IDs share one persistent namespace (3.4777ms)
✔ retreat releases a commitment for future routing but keeps original evidence (13.6225ms)
✔ definition validates and service does not mutate input (68.8257ms)
✔ validation rejects broken references (1.951ms)
✔ prep budget is enforced atomically and investigations are irreversible (3.574ms)
✔ prosecution exhibits stay sealed until records are inspected; client reinterview adds a statement (1.2429ms)
✔ phase gates: commands out of phase fail without state change (3.9316ms)
✔ objection window blocks progress until decided (1.9247ms)
✔ bait objection is overruled and costs judge credibility (19.3763ms)
✔ approaches require prepared cards; time is limited per opening focus (6.4918ms)
✔ no preparation leads to conviction (21.3644ms)
✔ identity-focused preparation can win; knife-focused preparation can win (23.641ms)
✔ limited press succeeds only with enough grounds; overreach always backfires (37.5203ms)
✔ sign-light redirect: rebuttal card neutralizes it, absence is reported as missed prep (33.5687ms)
✔ initial-statement contrast neutralizes the familiarity redirect (15.3112ms)
✔ opening denial is attacked by the prosecutor; client reinterview reveals the trap (32.6182ms)
✔ low credibility shortens the next cross-examination (17.3435ms)
✔ determinism and record-only replay (35.7234ms)
✔ records are append-only across commands and reset starts clean (2.1455ms)
✔ projection exposes no numeric win probability or issue strength to the UI text (7.6046ms)
✔ engine and service do not inspect case-specific ids (10.5658ms)
ℹ tests 247
ℹ suites 0
ℹ pass 247
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1182.2037
exit code: 0
```

### node generator/balance.js

```text
GEN-001 ARCH_CRIMINAL_ASSAULT seeds 1..300
  (a) no preparation: 0/300 (0.0%)
  (b) best path: 300/300 (100.0%)
  (c) random preparation + sensible cross: 133/300 (44.3%)
  (d) investigation choice alone: 300/300 (100.0%)
  (e) legacy completely random (reference): 26/300 (8.7%)
  old (d) different target strategies (reference): 0/300 (0.0%)
  Unwinnable seeds: none
  Errors: 0
  PASS (a) no preparation: 0%
  PASS (b) best path: >=90%
  PASS (c) random preparation + sensible cross: 40..65%
  PASS (d) investigation choice alone: >=50%
GEN-001 ARCH_DUI seeds 1..300
  (a) no preparation: 0/300 (0.0%)
  (b) best path: 300/300 (100.0%)
  (c) random preparation + sensible cross: 133/300 (44.3%)
  (d) investigation choice alone: 300/300 (100.0%)
  (e) legacy completely random (reference): 21/300 (7.0%)
  old (d) different target strategies (reference): 0/300 (0.0%)
  Unwinnable seeds: none
  Errors: 0
  PASS (a) no preparation: 0%
  PASS (b) best path: >=90%
  PASS (c) random preparation + sensible cross: 40..65%
  PASS (d) investigation choice alone: >=50%
Checks: 8, failures: 0
exit code: 0
```

### node generator/content/check-balance.js

```text
{"id":"ARCH_CRIMINAL_ASSAULT","seedCount":300,"noPrep":0,"unsupported":0,"fullPrep":70,"sensible":133,"rate":0.44333333333333336,"rebuttals":6,"pass":true}
{"id":"ARCH_DUI","seedCount":300,"noPrep":0,"unsupported":0,"fullPrep":89,"sensible":133,"rate":0.44333333333333336,"rebuttals":0,"pass":true}
exit code: 0
```

## 조정 전 출력 전체

### 원본 content.test.js (7개 실패)

```text
✔ 폭행 4개·DUI 3개 반전이 기존 형식에 맞고 다른 원형 참조는 거부된다 (4.2978ms)
✔ 일곱 반전은 0.60에서 활성화·0.59에서 비활성화하고 다른 원형에는 붙지 않는다 (0.6241ms)
✖ ARCH_CRIMINAL_ASSAULT: 500시드 결정성·엔진 검증·문구 완결·활성/비활성 카드 참조 (6.1636ms)
✖ ARCH_CRIMINAL_ASSAULT: 콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다 (1.1744ms)
✔ ARCH_CRIMINAL_ASSAULT: 일상 사건 문구에 민사 보증금이 섞이지 않고 입력이 결정적이다 (0.6098ms)
✖ ARCH_CRIMINAL_ASSAULT: 준비 유무 양쪽에서 실제 서비스 완주·실패 원자성·기록 재생 (6.9393ms)
✖ ARCH_DUI: 500시드 결정성·엔진 검증·문구 완결·활성/비활성 카드 참조 (2.197ms)
✖ ARCH_DUI: 콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다 (0.4114ms)
✔ ARCH_DUI: 일상 사건 문구에 민사 보증금이 섞이지 않고 입력이 결정적이다 (0.3128ms)
✖ ARCH_DUI: 준비 유무 양쪽에서 실제 서비스 완주·실패 원자성·기록 재생 (3.2345ms)
✔ 진실에 대응하는 문구가 분기 경계 양쪽을 반영한다 (0.6078ms)
✔ 주신문은 입증할 내용을 말하고 한계·방어 정황은 카드 제시 때 드러난다 (0.6361ms)
✖ 모든 접근법은 카드 없음·다른 카드·해당 카드의 기록과 근거 점수를 구분한다 (1.5901ms)
✔ 알 수 없는 콘텐츠 요청은 원형 데이터를 오염시키지 않는다 (0.886ms)
ℹ tests 14
ℹ suites 0
ℹ pass 7
ℹ fail 7
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 162.5977

✖ failing tests:

test at generator\content\content.test.js:42:3
✖ ARCH_CRIMINAL_ASSAULT: 500시드 결정성·엔진 검증·문구 완결·활성/비활성 카드 참조 (6.1636ms)
  TypeError: Cannot read properties of undefined (reading 'lines')
      at C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:62:115
      at Array.flatMap (<anonymous>)
      at TestContext.<anonymous> (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:62:91)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7)

test at generator\content\content.test.js:74:3
✖ ARCH_CRIMINAL_ASSAULT: 콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다 (1.1744ms)
  TypeError: Cannot read properties of undefined (reading 'delta')
      at C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:86:68
      at Array.map (<anonymous>)
      at C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:86:21
      at Array.map (<anonymous>)
      at mechanics (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:84:32)
      at TestContext.<anonymous> (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:89:24)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)

test at generator\content\content.test.js:100:3
✖ ARCH_CRIMINAL_ASSAULT: 준비 유무 양쪽에서 실제 서비스 완주·실패 원자성·기록 재생 (6.9393ms)
  AssertionError [ERR_ASSERTION]: rebut: 재반대신문할 수 없습니다.

  false !== true

      at ok (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:110:16)
      at TestContext.<anonymous> (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:118:34)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }

test at generator\content\content.test.js:42:3
✖ ARCH_DUI: 500시드 결정성·엔진 검증·문구 완결·활성/비활성 카드 참조 (2.197ms)
  TypeError: Cannot read properties of undefined (reading 'lines')
      at C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:62:115
      at Array.flatMap (<anonymous>)
      at TestContext.<anonymous> (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:62:91)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7)

test at generator\content\content.test.js:74:3
✖ ARCH_DUI: 콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다 (0.4114ms)
  TypeError: Cannot read properties of undefined (reading 'delta')
      at C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:86:68
      at Array.map (<anonymous>)
      at C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:86:21
      at Array.map (<anonymous>)
      at mechanics (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:84:32)
      at TestContext.<anonymous> (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:89:24)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)

test at generator\content\content.test.js:100:3
✖ ARCH_DUI: 준비 유무 양쪽에서 실제 서비스 완주·실패 원자성·기록 재생 (3.2345ms)
  AssertionError [ERR_ASSERTION]: rebut: 재반대신문할 수 없습니다.

  false !== true

      at ok (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:110:16)
      at TestContext.<anonymous> (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:118:34)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }

test at generator\content\content.test.js:169:1
✖ 모든 접근법은 카드 없음·다른 카드·해당 카드의 기록과 근거 점수를 구분한다 (1.5901ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

  false !== true

      at TestContext.<anonymous> (C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\content\content.test.js:191:14)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }
exit code: 1
```

### 원본 balance.js

```text
GEN-001 밸런스 점검 — 300시드, ARCH_CRIMINAL_ASSAULT
  (a) 준비 없이: 유죄 300 / 무죄 0
  (b) 최선 경로 무죄 가능: 189/300 (63.0%)
      재판으로 못 이기는 사건(111건): 1, 3, 4, 5, 7, 8, 9, 12, 17, 19, 24, 27, 28, 30, 31, 35, 36, 40, 41, 43, 44, 45, 46, 47, 49, 50, 55, 59, 66, 68 ...
  (c) 무작위 준비·무작위 선택 무죄: 9/300 (3.0%)
  (d) 조사 선택에 따라 결과가 달라지는 사건: 145/300 (48.3%)
  PASS (a) 준비 없이 진행 시 무죄 0% — 무죄 0건 / 300건
  FAIL (b) 최선 경로 기준 무죄 가능 사건 ≥ 90% — 189/300건 = 63.0%, 못 이기는 사건 111건
  FAIL (c) 무작위 준비·무작위 선택 무죄 40~65% — 9/300건 = 3.0%
  FAIL (d, 참고) 조사 선택에 따라 결과가 달라지는 사건 비율 ≥ 50% — 145/300건 = 48.3%

GEN-001 밸런스 점검 — 300시드, ARCH_DUI
  (a) 준비 없이: 유죄 300 / 무죄 0
  (b) 최선 경로 무죄 가능: 184/300 (61.3%)
      재판으로 못 이기는 사건(116건): 2, 9, 17, 18, 21, 26, 27, 30, 34, 36, 37, 38, 40, 44, 45, 47, 49, 55, 56, 57, 63, 64, 68, 70, 72, 80, 88, 91, 94, 95 ...
  (c) 무작위 준비·무작위 선택 무죄: 6/300 (2.0%)
  (d) 조사 선택에 따라 결과가 달라지는 사건: 147/300 (49.0%)
  PASS (a) 준비 없이 진행 시 무죄 0% — 무죄 0건 / 300건
  FAIL (b) 최선 경로 기준 무죄 가능 사건 ≥ 90% — 184/300건 = 61.3%, 못 이기는 사건 116건
  FAIL (c) 무작위 준비·무작위 선택 무죄 40~65% — 6/300건 = 2.0%
  FAIL (d, 참고) 조사 선택에 따라 결과가 달라지는 사건 비율 ≥ 50% — 147/300건 = 49.0%
exit code: 1
```

### 정책·경로 수정 후 / 수치 조정 전 balance.js

```text
GEN-001 ARCH_CRIMINAL_ASSAULT seeds 1..300
  (a) no preparation: 0/300 (0.0%)
  (b) best path: 257/300 (85.7%)
  (c) random preparation + sensible cross: 52/300 (17.3%)
  (d) investigation choice alone: 256/300 (85.3%)
  (e) legacy completely random (reference): 9/300 (3.0%)
  old (d) different target strategies (reference): 132/300 (44.0%)
  Unwinnable seeds: 5, 7, 17, 19, 24, 28, 30, 31, 45, 46, 47, 49, 50, 55, 77, 83, 115, 119, 126, 128, 149, 158, 161, 162, 167, 169, 179, 188, 200, 202, 203, 212, 248, 257, 259, 264, 267, 268, 270, 276, 278, 283, 294
  Errors: 0
  PASS (a) no preparation: 0%
  FAIL (b) best path: >=90%
  FAIL (c) random preparation + sensible cross: 40..65%
  PASS (d) investigation choice alone: >=50%
GEN-001 ARCH_DUI seeds 1..300
  (a) no preparation: 0/300 (0.0%)
  (b) best path: 255/300 (85.0%)
  (c) random preparation + sensible cross: 46/300 (15.3%)
  (d) investigation choice alone: 255/300 (85.0%)
  (e) legacy completely random (reference): 6/300 (2.0%)
  old (d) different target strategies (reference): 131/300 (43.7%)
  Unwinnable seeds: 2, 9, 21, 26, 30, 36, 37, 38, 45, 49, 55, 56, 70, 72, 80, 88, 97, 99, 106, 108, 109, 122, 137, 144, 149, 151, 153, 161, 170, 173, 176, 179, 186, 192, 193, 201, 205, 222, 230, 244, 273, 275, 288, 289, 300
  Errors: 0
  PASS (a) no preparation: 0%
  FAIL (b) best path: >=90%
  FAIL (c) random preparation + sensible cross: 40..65%
  PASS (d) investigation choice alone: >=50%
Checks: 8, failures: 4
exit code: 1
```

### 실행 경로 오류 및 수정

```text
$ node --test generator/core/tests
node:internal/modules/cjs/loader:1520
  throw err;
  ^

Error: Cannot find module 'C:\Users\Admin\Documents\ChatGPT\The Firm\courtroom-prototype\generator\core\tests'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1517:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1122:12)
    at Module._load (node:internal/modules/cjs/loader:1294:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.19.0
✖ generator\core\tests (111.3864ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 122.5126

✖ failing tests:

test at generator\core\tests:1:1
✖ generator\core\tests (111.3864ms)
  'test failed'
exit code: 1
```

최신 성공 명령은 `node --test generator/core/tests/*.test.js`이며 출력은 위에 있다.

---

## 이전 라운드 기록 (이하 내용은 당시 상태)

# GEN-001 core 수정 (2026-09-30) — 자체 점검

Lane: experiment. 브랜치 task/gen-001. 소유 범위: `generator/core/`, `generator/balance.js`,
`generator/content/index.js`의 연결 부분. `generator/content/`의 나머지(archetypes.js, twists.js,
copy.js, hearing-copy.js, SIGNATURE.md, content.test.js)는 읽기만 했다 — Codex 소유, 문구 수정 안 함.
기준 문서: `docs/DESIGN-NOTES-2026-09.md` §1.9~1.11, `DEC-LITIGATION-031`(N1~N7),
`DEC-LITIGATION-032`. 커밋은 하지 않았다 — 사람이 한다.

## 변경 요약

### 1) 준비 예산 < 조사 총비용
`contested.js`: `budget = max(2, round(총비용 × 0.6))`. 이전엔 `budget = 총비용`(전부 조사 가능)이었다.
`playthrough.js`의 `fullPrep` 정책도 "전부 산다"에서 "예산이 허락하는 만큼, 등장 순서대로 산다"로
고쳤다 — 안 고쳤으면 예산 초과로 `investigate` 커맨드가 실패해 playThrough 자체가 깨졌을 것이다.

### 2) 개회사 focus 2~3개·stance 3개, "잘못된 조합의 비용"
`buildOpening()`이 균형 focus 1개 + 쟁점별 focus(그 쟁점 증인 시간 +1, 다른 증인 -1, 최소 1) N개를
만든다(N=archetype.issues.length, 현재 2 → 총 3개). stance는 고정 3개 `S_CONTEST`/`S_ADMIT`/`S_DENY`.
`hearing-copy.js`가 이미 정확히 이 슬롯 이름(`focus.balanced`/`focus[쟁점id]`,
`stance.contest`/`admit`/`deny`)으로 문구를 갖고 있었다 — `index.js`가 이제 그 문구를 실제로 연결한다
(이전엔 balanced/contest 1개씩만 연결됐다).

활성화된 twist가 있는 쟁점에는 `buildStanceConflictApproach()`가 접근법을 추가한다: 그 twist의 카드가
있어야만 쓸 수 있고(`requiresAny`), 쟁점 점수는 바꾸지 않지만(`byStance` 전부 0) stance가 `S_DENY`면
`stanceConflict`로 credibility -1이 난다. **새 엔진 로직은 만들지 않았다** — `engine/trial.js`의
`crossStart`가 이미 credibility ≤ `warnAtOrBelow`면 다음 신문 시간을 자동으로 줄인다. v0.10의
`D_HAN_DENY`, `SIGNATURE.md` §1의 `A_SIG_OBS_CONTACT`와 같은 패턴을 재사용했다.

### 3) 증인별 이의 창 1개, proper/improper 교대
`buildObjectionStep()`이 쟁점 인덱스 짝/홀로 proper(인용될 유도신문)/improper(기각될 이의)를 교대한다.
`index.js`가 `hearing.witnesses[쟁점id].proper` 또는 `.improper`를 그 플래그에 맞춰 채운다 — content가
어느 쪽을 쓸지 결정하지 않는다.

### 4) 결론 요구(press) 2종, 경계선 사건에서 실제로 영향을 주는 경로
`limited`의 `minPoints`를 1 → 그 쟁점의 증거 개수(2)로 올렸다(접근법을 전부 써야 성공 가능). 새로
`overreach`를 추가했다 — `engine/trial.js`의 `pressSucceeds`가 이 kind는 항상 실패시키므로 always
+2·credibility -1이다. 균형 focus는 증거 접근법 2개로 신문 시간이 정확히 소진돼 press를 못 쓴다 —
**쟁점별 focus를 골라야 그 증인에게 press 쓸 시간이 남는다.** `core-revision.test.js`의 "결론 요구
성공이 경계선 사건을 doubt로 뒤집는 실제 경로가 존재한다" 테스트로 실제로 그런 시드가 있음을 확인했다.

### 5) 원형별 RNG 스트림 분리
`rng.js`에 `seedFor(seed, tag)`(FNV류 문자열 해시 + seed 결합) 추가. `resolveContestedInputs`,
`generateDailyCase`가 `createRng(seed)` 대신 `createRng(seedFor(seed, archetype.id))`를 쓴다. **이
때문에 이전 버전과 같은 seed라도 폭행·DUI 둘 다 truth/baseline이 달라진다** — 결정성은 유지되지만
(같은 seed → 같은 결과) 과거 스냅샷 값과는 다르다.

### 6) DEC-LITIGATION-032 — 한국 고유 명칭을 KO_PACK 하나로
`contested.js` 상단에 `KO_PACK = { roles: {judge,prosecutor,defense}, outcomeLabels: {guilty,notGuilty} }`.
D4(과잉 설계 금지)를 따라 별도 팩 파일·로더는 만들지 않았다 — "코드 여기저기 흩어 두지 않고 한 자리에
모으기"만 했다. 준비 예산 비율(0.6) 같은 게임 밸런스 상수는 한국 고유 규칙이 아니므로 그대로 코드
상수로 뒀다(D3는 "한국 고유 규칙"만 데이터로 요구한다).

### 7) content 슬롯 연결 (index.js)
`hearing-copy.js`의 focus/stance/이의(proper·improper)/overreach를 전부 연결했다. stance 충돌
접근법은 hearing-copy에 전용 문구가 없어 이미 작성된 twist의 `truthEffect`/`opponentRecovery` 문구를
재구성하고, 판사·검사의 절차적 반응 두 줄만 `d.lines`(기존에도 index.js가 직접 채우던 보일러플레이트)와
같은 성격으로 새로 뒀다 — 사건마다 달라지는 대사는 짓지 않았다. **content 문구(copy.js, hearing-copy.js,
archetypes.js, twists.js) 자체는 한 글자도 고치지 않았다.** 60개 샘플 사건(2원형 × 30시드)에서
PLACEHOLDER 잔존 0건을 확인했다.

### balance.js — content 진입점으로 모든 원형 검사, 기준 교체
`content.buildContestedCase`로 `content.archetypes`(현재 `ARCH_CRIMINAL_ASSAULT`, `ARCH_DUI`)를
자동 순회한다(이전엔 `core/archetype.criminal.example.js` 하나만). `playthrough.js`에 새 정책 둘을
추가했다:
- `playThroughRandom(caseDef, rng)` — 예산 안에서 무작위 순서로 조사를 사고, focus/stance/이의/재반대/
  cross 행동을 전부 무작위로 고른다. (c) 측정에 쓴다.
- `playBestPathForIssue(caseDef, issueId)` — 전지적 시점으로 그 쟁점 하나를 doubt로 미는 데 전념한다
  (그 쟁점 증거·twist 투자 우선구매 → 쟁점별 focus → 안전한 S_CONTEST → 유리한 이의 선택 → 접근법·
  press 전부 → 재반대 항상 사용). (b)(d) 측정에 쓴다 — `adjudicate()`는 필수 쟁점 중 하나라도 doubt면
  무죄이므로, 쟁점 하나만 제대로 밀어도 이길 수 있다.

## balance.js 출력 전체 (`node generator/balance.js`, seed 1~300 × 2원형)

```
GEN-001 밸런스 점검 — 300시드, ARCH_CRIMINAL_ASSAULT
  (a) 준비 없이: 유죄 300 / 무죄 0
  (b) 최선 경로 무죄 가능: 189/300 (63.0%)
      재판으로 못 이기는 사건(111건): 1, 3, 4, 5, 7, 8, 9, 12, 17, 19, 24, 27, 28, 30, 31, 35, 36, 40, 41, 43, 44, 45, 46, 47, 49, 50, 55, 59, 66, 68 ...
  (c) 무작위 준비·무작위 선택 무죄: 9/300 (3.0%)
  (d) 조사 선택에 따라 결과가 달라지는 사건: 145/300 (48.3%)
  PASS (a) 준비 없이 진행 시 무죄 0% — 무죄 0건 / 300건
  FAIL (b) 최선 경로 기준 무죄 가능 사건 ≥ 90% — 189/300건 = 63.0%, 못 이기는 사건 111건
  FAIL (c) 무작위 준비·무작위 선택 무죄 40~65% — 9/300건 = 3.0%
  FAIL (d, 참고) 조사 선택에 따라 결과가 달라지는 사건 비율 ≥ 50% — 145/300건 = 48.3%

GEN-001 밸런스 점검 — 300시드, ARCH_DUI
  (a) 준비 없이: 유죄 300 / 무죄 0
  (b) 최선 경로 무죄 가능: 184/300 (61.3%)
      재판으로 못 이기는 사건(116건): 2, 9, 17, 18, 21, 26, 27, 30, 34, 36, 37, 38, 40, 44, 45, 47, 49, 55, 56, 57, 63, 64, 68, 70, 72, 80, 88, 91, 94, 95 ...
  (c) 무작위 준비·무작위 선택 무죄: 6/300 (2.0%)
  (d) 조사 선택에 따라 결과가 달라지는 사건: 147/300 (49.0%)
  PASS (a) 준비 없이 진행 시 무죄 0% — 무죄 0건 / 300건
  FAIL (b) 최선 경로 기준 무죄 가능 사건 ≥ 90% — 184/300건 = 61.3%, 못 이기는 사건 116건
  FAIL (c) 무작위 준비·무작위 선택 무죄 40~65% — 6/300건 = 2.0%
  FAIL (d, 참고) 조사 선택에 따라 결과가 달라지는 사건 비율 ≥ 50% — 147/300건 = 49.0%
```

**exit 1** (두 원형 다 (a)만 PASS, (b)(c)(d)는 FAIL). **항목 8 지시대로 튜닝하지 않았다** — (b)(c)(d)는
이번엔 측정·출력만 한다. 숫자를 맞추려고 twist delta, 접근법 delta, 활성 임계값, budget 비율을 손대지
않았다.

**FAIL을 그대로 둔 이유와 다음 조정 후보 (Codex 몫):**
- (c) 3.0%/2.0%가 특히 낮다. 예산이 총비용의 60%뿐이라 무작위 구매가 그 쟁점에 필요한 카드 조합(2개
  다)을 못 살 확률이 높고, cross 행동을 매 순간 균등 무작위로 고르는 정책 자체가 "대충이라도 합리적인
  플레이어"보다 훨씬 약하다. (c)의 목표(40~65%)가 애초에 "완전 무작위"가 아니라 "무작위 준비 + 그래도
  뭘 좀 쓰는 플레이"를 가정한 것이라면 정책(playThroughRandom) 쪽을 조정해야 할 수도 있고, budget 비율을
  올리는 선택지도 있다 — 둘 다 사람 판단이 필요해 손대지 않았다.
- (b) 61~63%는 "쟁점 하나에 올인해도 못 이기는" 시드가 37~39%라는 뜻이다. baseline 분포(evidence_
  strength_rules의 strengthRange [3,7])나 접근법/press delta 크기를 키우면 오를 것이다.
- (d) 48~49%는 목표(50%)에 근접했다 — 미세 조정 범위.
- 폭행과 DUI가 거의 같은 패턴(63.0/61.3, 3.0/2.0, 48.3/49.0)을 보인다 — 원형별 문제라기보다 이번에
  새로 만든 지표·정책 자체의 특성일 가능성이 높다.

## 테스트 결과

```
node --test generator/core/tests/*.test.js
```
→ **43 pass, 0 fail** (기존 30개 전부 유지 + 신규 `core-revision.test.js` 13개: 항목 1~6 전용 회귀).

```
node --test generator/core/tests/*.test.js generator/content/content.test.js
```
→ **37 pass, 7 fail.** 실패 7개는 전부 `generator/content/content.test.js`(Codex 소유, 이번에 수정
안 함)다 — 원인은 그 테스트가 **이전 core 계약**을 가정한다는 것:
- "500시드 결정성·엔진 검증·문구 완결" / "콘텐츠 구성은 기존 준비 접근법과 truth·시드·수치를 보존한다":
  `w.presses[0]`/`w.approaches[0]`만 있다고 가정한 인덱싱이 새 구조(presses 2개, stance 충돌 접근법
  추가)와 안 맞는다.
- "준비 유무 양쪽에서 실제 서비스 완주": `d.investigations.forEach(i => ok('investigate', {id: i.id}))`로
  **전부** 사는데, 이제 예산이 총비용보다 작아서 일부 `investigate` 커맨드가 정상적으로 거부된다
  (`ok('investigate', ...)`가 `result.ok===true`를 요구하므로 실패). 이건 버그가 아니라 항목 1이 의도한
  동작이다.
- "모든 접근법은 카드 없음·다른 카드·해당 카드의 기록과 근거 점수를 구분한다": 비슷하게 옛 접근법 개수
  가정.
**이 테스트 파일은 내 소유가 아니라 고치지 않았다.** Codex가 core 계약 변경(예산, press 2종, stance
충돌 접근법)에 맞춰 자기 테스트를 갱신해야 한다 — 다음 라운드로 넘긴다.

```
node --test
```
(전수 탐색) → 기존 `Cannot find module 'playwright'` 10건 외에 신규 실패는 위 7건(content.test.js)뿐이다.

## TBD / 다음 라운드로 넘기는 것

- **content.test.js 갱신** — 위에서 설명한 7개 실패. Codex 몫.
- **balance.js (b)(c)(d) 미달** — 튜닝은 다음 라운드. 후보는 위 "다음 조정 후보" 참고.
- **stance 충돌 접근법의 index.js 문구가 완전히 authored는 아니다** — twist의 기존 문구를 재구성 +
  판사·검사의 절차적 반응 2줄(새로 지음, 사건마다 안 바뀌는 보일러플레이트)이다. 사람이 읽었을 때
  자연스러운지는 확인 안 됨.
- **SIGNATURE.md §1의 이의 창 2개(유효+무효 둘 다), `_UNSUPPORTED` 접근법의 byStance 버전(`A_SIG_
  OBS_CONTACT`처럼 credibility 충돌이 있는 일반 접근법), 합의 분기**는 이번 core 템플릿에 반영하지
  않았다 — SIGNATURE.md는 DEMO-001용 literal 사건이지 생성기 템플릿 사양이 아니라서, "구조 참고"로만
  썼다(이의 창 1개로 줄인 것, stanceConflict 패턴 재사용 등). 전면 반영은 요청 범위를 넘는다고 판단했다.
- **`generator/content/CATALOG.md`, `check-balance.js`** 등 이번 세션 중 Codex가 새로 만든 파일은
  읽지 않았다(내 스코프 밖).

## 범위 확인

- 수정한 파일: `generator/core/contested.js`, `generator/core/playthrough.js`, `generator/core/rng.js`,
  `generator/core/generate.js`, `generator/core/format.js`(문서만), `generator/core/tests/core-revision.test.js`(신규),
  `generator/balance.js`, `generator/content/index.js`, `generator/content/RULES.md`(위 "이번 변경" 절만 추가).
- `generator/content/archetypes.js`, `twists.js`, `copy.js`, `hearing-copy.js`, `SIGNATURE.md`,
  `content.test.js`는 읽기만 했다 — 한 글자도 고치지 않았다.
- `engine/trial.js`, `services/trial.js`는 require로 읽기만 했다.
- 커밋하지 않았다. 사람이 한다.

---

# GEN-001 3단계 — 자체 점검

Lane: experiment. 이번 수정은 `generator/balance.js` 하나뿐이다. `generator/core/`, `generator/content/`는
건드리지 않았다(둘 다 require해서 읽기만 했다).

## 한 일

`generator/balance.js`를 `core.buildContestedCase` 직접 호출에서 `generator/content` 진입점
(`content.buildContestedCase(archetypeId, seed)`)으로 바꿨다. `content.archetypes`의 키를 순회해서
**등록된 모든 원형**(현재 `ARCH_CRIMINAL_ASSAULT`, `ARCH_DUI`)을 자동으로 점검한다 — 원형이 추가돼도
`balance.js`를 다시 고칠 필요가 없다.

원형별로 seed 1~300을 `core/playthrough.js`의 `playThrough`로 끝까지 플레이하고 네 가지를 낸다:

- (a) 준비 없이 진행 시 무죄 건수 (0이어야 PASS)
- (b) 모든 준비 후 무죄율 — 기준을 이번 요청대로 **40~65%**로 좁혔다(2.5단계는 30~70%였다)
- (c) `caseDef.twistsApplied.length >= 1`인 시드 비율 — content가 만든 사건에 반전이 실제로 붙는 빈도
- (d) 재반대(rebuttal) 발생 수 — 모든 준비 시나리오에서 `records`에 `kind:'rebuttal'`로 남은 기록 합계
  (카드가 있어야만 `rebut({use:true})`가 실제 rebuttal 기록을 남긴다 — `rebutPass`는 세지 않는다)

## 주의: 작업 중 `generator/content/`가 다른 에이전트에 의해 동시에 수정되고 있었다

`balance.js`를 다 고친 뒤 검증차 여러 번 실행했는데, 그때마다 숫자가 달랐다. 원인은 코드 버그가 아니라
**다른 에이전트(Codex)가 같은 작업 트리의 `generator/content/`를 이번 작업 도중 계속 고치고 있었기
때문**이다. 관찰한 3번의 실행:

1. 1차: ARCH_CRIMINAL_ASSAULT 무죄율 77.0%(231/300, `content/REPORT.md`에 Codex가 남긴 수기 값과 일치),
   ARCH_DUI는 `twists_allowed: []`라 (c)(d)가 0.
2. 2차(직후 재확인차 재실행): DUI만 172→170으로 살짝 바뀜. `git diff`로 확인하니 그 사이
   `archetypes.js`의 `ARCH_DUI.twists_allowed`에 `TWIST_DUI_*` 3개 id가 추가되고 `truth_params`도 3개
   늘어 있었다 — 다만 `twists.js`엔 아직 그 모듈 실체가 없어 `selectActivatedTwists`가 조용히
   무시했고(2단계 설계), `truth_params`가 늘어난 만큼 `resolveTruth`의 rng 소비 순서가 바뀌어 DUI의
   baseline만 살짝 움직였다.
3. 3차(같은 명령 재실행): `twists.js`에 `TWIST_DUI_*` 3개가 마저 채워져 있었다. 이번엔 ARCH_DUI의
   (c)(d)가 실제 값(77.0%/231, 344회)으로 뛰었고, **ARCH_CRIMINAL_ASSAULT의 무죄율도 77.0%→57.7%로
   바뀌었다** — 같은 커밋 묶음에서 Codex가 assault의 twist delta도 함께 조정한 것으로 보인다(콘텐츠
   파일 자체는 내가 건드리지 않았다. `content/twists.js`의 diff는 이 세션의 내 변경분이 아니다).
4. 그 뒤 두 번 더 실행해 **완전히 같은 결과**를 확인했다(해시로도 `twists.js`/`archetypes.js`가 더는
   바뀌지 않음을 확인) — 아래를 최종값으로 쓴다.

## 최종 실행 결과 (`node generator/balance.js`, seed 1~300 × 2원형, 안정화 확인 후)

```
GEN-001 밸런스 점검 — 300시드, ARCH_CRIMINAL_ASSAULT
  준비 없이: 유죄 300 / 무죄 0
  모든 준비: 유죄 127 / 무죄 173 (무죄율 57.7%)
  (c) 반전 1개 이상 붙는 시드 비율: 257/300 (85.7%)
  (d) 재반대(rebuttal) 발생 수(모든 준비 시나리오 합계): 452
  PASS (a) 준비 없이 진행 시 무죄 0건 — 무죄 0건 / 300건
  PASS (b) 모든 준비 후 무죄 40~65% — 무죄 173/300건 = 57.7%

GEN-001 밸런스 점검 — 300시드, ARCH_DUI
  준비 없이: 유죄 300 / 무죄 0
  모든 준비: 유죄 130 / 무죄 170 (무죄율 56.7%)
  (c) 반전 1개 이상 붙는 시드 비율: 231/300 (77.0%)
  (d) 재반대(rebuttal) 발생 수(모든 준비 시나리오 합계): 344
  PASS (a) 준비 없이 진행 시 무죄 0건 — 무죄 0건 / 300건
  PASS (b) 모든 준비 후 무죄 40~65% — 무죄 170/300건 = 56.7%
```

**exit 0. 두 원형 모두 (a)(b) 전부 PASS.**

| 원형 | (a) 준비없이 무죄 | (b) 모든준비 무죄율 | (c) 반전≥1 비율 | (d) 재반대 수 | 판정 |
| --- | --- | --- | --- | --- | --- |
| ARCH_CRIMINAL_ASSAULT | 0/300 | 173/300 = 57.7% | 257/300 = 85.7% | 452 | PASS / PASS |
| ARCH_DUI | 0/300 | 170/300 = 56.7% | 231/300 = 77.0% | 344 | PASS / PASS |

두 원형 다 (c)가 77~86%로 높다 — 두 원형 모두 반전이 대부분의 시드에 최소 1개는 붙게 설계돼 있다는
뜻이다. (d) 재반대 수(452/344)는 (c)와 비슷한 비율로, 카드를 확보하면 재반대가 거의 매번 발동한다는
뜻이다(카드 없이는 애초에 재반대 옵션 자체가 뜨지 않는다).

## 튜닝 여부

**하지 않았다.** 이번 요청은 "core는 이 수정 외에 건드리지 말고"였다 — (b)를 맞추려면 twist의
`opponentRecovery`/`playerCounter` delta(`generator/content/twists.js`)나 approach/press 수치
(`generator/core/contested.js`)를 건드려야 하는데 둘 다 이번 범위 밖이라 `balance.js`만 바꿨다. 위
"주의" 절에서 보듯 assault의 (b)가 77.0%→57.7%로 바뀐 것은 이 세션 중 Codex가 `content/twists.js`를
고친 결과이지, 내가 튜닝한 것이 아니다.

## 아직 안 된 것 / TBD

- **이번 세션 동안 콘텐츠가 두 번 더 바뀔 수 있었다.** 위 표는 "3번 연속 동일 결과"로 안정화를 확인한
  뒤의 값이지만, 이 보고서를 읽는 시점에 `generator/content/`가 또 바뀌었다면 다시 `node
  generator/balance.js`를 실행해서 확인해야 한다 — 이 보고서의 숫자를 코드보다 신뢰하지 않는다.
- (c)(d)는 처음 정의한 지표라 "정상 범위"에 대한 기준 자체가 없다 — 이번 실행값(85.7%/452,
  77.0%/344)을 베이스라인으로 남긴다. 두 원형 다 (c)가 77~86%로 상당히 높다는 점은 "반전이 거의 항상
  붙는" 현재 진실 파라미터 임계값(대부분 `>= 0.6`, 균등분포에서 40% 확률)과 반전 개수(원형당 3~4개)의
  조합에서 나온 결과다 — 의도한 빈도인지는 사람 판단이 필요하다.
- `generator/balance.js`는 여전히 정책 하나(접근법 우선 → 압박 → endCross, 재반대는 카드 있으면 항상
  사용)만 실행한다. "절대 못 이기는 사건 0개"를 모든 전략에 대해 증명한 것은 아니다(기존 TBD 유지).
- (b)가 이번엔 두 원형 다 PASS로 나왔지만, 이건 Codex가 이번 세션 중 assault twist delta를 조정한
  결과로 보인다(내가 조정한 게 아니다). 그 조정이 의도된 것인지, 어떤 값에서 어떤 값으로 왜 바뀌었는지는
  `generator/content/`쪽 커밋 로그·REPORT를 봐야 한다 — 이 파일은 그 변경의 저자가 아니다.

## 범위 확인

- 바꾼 파일은 `generator/balance.js` 하나뿐이다. `generator/core/*`, `generator/content/*`는 require로
  읽기만 했다 — 그쪽이 이 세션 중 바뀐 것은 다른 에이전트(Codex)의 동시 작업 때문이며 내가 수정한 것이
  아니다(위 "주의" 절 참고).
- 여기서 멈춘다.

---

# GEN-001 2.5단계 — 자체 점검

Lane: experiment. 범위: `courtroom-prototype/generator/` 안에서만 작업했다(`services/trial.js`,
`engine/trial.js`는 읽기·require만 했고 수정하지 않았다).

## 한 일

### buildContestedCase 출력을 services/trial.js로 끝까지 플레이

- `contested.js`의 `buildContestedCase` 반환값에 `services/trial.js`(`createTrialService`)가 무조건
  읽는 필드를 채웠다:
  - `lines`: `trialOpen`/`crossStart`/`crossWarn`/`crossTimeUp`/`crossStop`/`noRedirect`/`rebutPass`/
    `witnessDone`/`verdictLead` 9개 전부. `(placeholder)` 문구지만 `services/trial.js`가 `.map(([s,t])=>...)`
    로 바로 소비할 수 있는 `[speaker, text]` 배열 형식이다. 이전엔 `lines: {}`였고, `open`/`crossStart` 등에서
    `d.lines.trialOpen.map(...)` 호출 시 `undefined.map`으로 즉시 터졌다.
  - `clientStatements`(1개 placeholder), `prosecutionExhibits`(issue당 1개, `PX_ISSUE_...`).
  - 이전에 비어 있던 `prosecutionExhibits: []`, `missedPrep: []`는 유지(서비스가 `missedPrep`을 직접
    읽지 않는다 — `engine/trial.js`의 `review()`가 읽지만 이번 2.5단계 acceptance bar는 verdict까지지
    review는 아니다).

### generator/core/playthrough.js — 공용 플레이 드라이버

- `playThrough(caseDef, { fullPrep })`: `createTrialService`로 실제 서비스를 만들어 `reset → (fullPrep이면
  모든 investigation) → finishPrep → open → (반복: pending 처리 / cross에서 approach·press·endCross /
  intro·direct·redirect에서 continue / closed에서 verdict) → verdict`까지 몬다. 각 command가 `ok:false`를
  반환하면 즉시 예외를 던진다 — "정상적으로 플레이했는데 막혔다"를 조용히 넘기지 않기 위해서다.
- `fullPrep=false`(준비 없이): investigate를 하나도 안 해서 카드가 없다 → cross의 모든 approach가
  `requiresAny` 카드 부족으로 막힘 → press도 `approaches.length>0` 조건에 걸려 막힘 → 매 witness마다
  `endCross`만 호출. baseline은 2단계에서 이미 `strengthRange:[3,7]`로 고쳐서 doubt(≤2)에서 시작하지
  않으므로, 아무 delta도 안 붙으면 doubt에 못 들어간다 — 무죄가 구조적으로 나올 수 없다.
- `fullPrep=true`(모든 준비 후): 모든 investigation → cross마다 "쓸 수 있는 approach 우선, 없으면 press,
  둘 다 없으면 endCross" → `rebut`이 pending이면 `use:true`. 실제로 해보니 신문 시간(`opening.focus.time`,
  witness당 2)이 evidence 개수(witness당 2)와 정확히 같아서 approach 2개를 쓰고 나면 시간이 다 돼
  `afterCrossAction`이 자동으로 cross를 끝낸다 — press는 실제로 못 쓴다(시간 제약, 버그 아님). 결과적으로
  witness당 `-1 + -1 = -2` delta만 적용된다.

### generator/balance.js — 300시드 밸런스 점검 스크립트

- `node generator/balance.js`로 실행하는 plain 스크립트(repo의 `tests/ui-budget.js`와 같은 관례 —
  `node:test`가 아니다). `ARCH_CRIMINAL_ASSAULT` × seed 1~300으로 두 시나리오를 각각 `playThrough`하고:
  - **(a) 준비 없이 진행 시 무죄 0건**: 300/300 무죄 0건. **PASS**.
  - **(b) 모든 준비 후 무죄 30~70%**: 무죄 173/300 = **57.7%**. **PASS**.
  - 두 체크 모두 통과하면 exit 0, 실패하면 exit 1과 함께 실패한 seed 목록(최대 10개)을 stdout에 남긴다.
  - 재실행해서 완전히 같은 숫자(유죄/무죄 카운트 전부 동일)가 나오는 것도 확인했다 — 결정성.
  - **튜닝은 하지 않았다.** 2단계에서 정한 `strengthRange:[3,7]`, 기계적 템플릿의 approach `delta:-1`,
    witness당 evidence 2개·cross 시간 2를 그대로 실행했더니 첫 실행부터 (a)(b) 둘 다 통과했다(우연히도
    "approach 2개 쓰면 시간이 딱 떨어져 press를 못 씀"이라는 제약이 delta 합계를 -2로 묶어놔서 범위 안에
    들어왔다). 손으로 미리 계산해본 값(약 58.9%)과 실제 실행 결과(57.7%)가 비슷해 계산도 맞았다는 걸
    확인했다.

### 테스트 기준 변경 (validate → 끝까지 진행)

- `generator/core/tests/criminal-template.test.js`에 acceptance bar를 추가했다: `playThrough`로 seed
  6개(`fullPrep` true/false 각각)를 판결까지 몰아 `outcome`이 `'guilty'`/`'not_guilty'` 중 하나인지
  확인한다. 기존 `engine/trial.js validate()` 테스트는 "빠른 구조 점검"으로 이름만 바꿔 남겨뒀다(삭제하지
  않음 — 구조가 깨지면 playThrough보다 먼저, 더 싼 값에 잡아준다).
  준비 없이 진행하면 항상 `guilty`이고 어떤 issue도 `doubt` band에 들어가지 않는다는 단위 회귀도 추가했다.
- `generator/core/contested.criminal.example.output.json`을 새 필드(lines 등) 포함해서 다시 저장했다
  (seed 1). `validate() === true`, `playThrough({fullPrep:false}).outcome === 'guilty'`,
  `playThrough({fullPrep:true}).outcome === 'not_guilty'` 모두 확인.

## 검증

```
node --test generator/core/tests/*.test.js
```
→ **30 pass, 0 fail** (2단계 27개 + playThrough 기반 신규 3개).

```
node generator/balance.js
```
→ (a) PASS 무죄 0/300, (b) PASS 무죄 173/300 (57.7%). exit 0.

`node --test`(인자 없음) 재확인: 전체 319개 중 309 pass / 10 fail, 실패 10개는 여전히 기존
`Cannot find module 'playwright'` 사전 존재 문제뿐이다(신규 실패 없음).

## 아직 안 된 것 / TBD

- **재반대(rebuttal) 경로는 이번 밸런스 점검에서 실제로 타지 않았다.** `ARCH_CRIMINAL_ASSAULT`엔 아직
  붙는 TwistModule이 없어서(`twists_allowed` id만 있고 콘텐츠 없음, 2단계 TBD) `redirect` 배열이 항상
  비어 있다 — `playThrough`의 `pending.type==='rebuttal'` 분기는 코드는 있지만 이 아키타입으로는 실행되지
  않는다. 형사 원형용 twist가 생기면(Codex 또는 후속 작업) 이 분기도 실제로 exercise된다.
- **밸런스 수치는 "approach 우선, 그다음 press" 정책 + 현재 template 수치(delta -1, evidence 2개, cross
  시간 2)에서 나온 결과다.** Codex가 대사를 채우면서 evidence 개수나 접근법 수를 늘리면(예: evidence 3개)
  이 숫자가 바뀐다 — `node generator/balance.js`를 그때 다시 돌려야 한다.
- **`review()`(복기)와 `missedPrep`은 이번 acceptance bar에 없다.** verdict까지만 확인했고, 복기 화면이
  실제로 의미 있게 뜨는지는 확인하지 않았다.
- 원형 2개(음주운전 등), 나머지 반전 4개, 대형 사건 3개 설계 문서, 승부 사건이 아닌 일상 사건 10개×3분야
  사람 검수는 여전히 시작 안 함.

## 범위 확인

- `courtroom-prototype/generator/` 밖은 `services/trial.js`, `engine/trial.js`를 require해서 읽기만 했다.
  수정하지 않았다.
- 여기서 멈춘다. 다음은 Codex가 대사와 나머지 반전을 채우는 단계(이전 리뷰에서 이미 예고됨).

---

# GEN-001 2단계 — 자체 점검

Lane: experiment. 범위: `courtroom-prototype/generator/` 안에서만 작업했다(`engine/trial.js`는 읽기·require만
했고 수정하지 않았다). 읽은 문서: `.agent/tasks/GEN-001.md`, 1.5단계 REPORT.md의 TBD, 이번 리뷰 3항목.

## 한 일

### 1) 버그 수정 — activation이 false인 twist를 붙이지 않는다

- `contested.js`에 `selectActivatedTwists(archetype, truth, availableTwists)` 추가. `archetype.twists_allowed`
  에 있고 `appliesTo`가 이 원형에 맞는 후보만 추려서, 그중 `evaluateActivation(twist.activation, truth)`가
  true인 것만 반환한다. 형식이 깨진 후보는 (activation 평가 전에) `validateTwist`로 즉시 예외를 던진다.
  하나도 만족하지 않으면 빈 배열 — "반전 없는 사건"이 된다.
- `buildContestedCase(archetype, seed, availableTwists)`로 시그니처를 바꿨다(이전: `(archetype, twist, seed)`,
  twist를 무조건 붙였던 게 버그였다). 활성화된 twist만큼만 `investigations`/`cards`/해당 witness의
  `redirect`에 반영한다.
- 회귀: `generator/core/tests/contested.test.js` 8개. `ARCH_LEASE_DEPOSIT` + `TWIST_CLIENT_HIDES_DAMAGE`로
  activation true/false 양쪽, appliesTo 불일치, 후보 없음, "twistsApplied는 비었는데 카드는 남아있음" 같은
  회귀를 직접 테스트한다.
- 버그를 하나 더 잡았다: 처음 짠 테스트가 `resolveTruth(archetype, createRng(seed))`로 truth를 따로
  계산했는데, `buildContestedCase` 내부는 `claimAmount`·`retainer`를 먼저 뽑은 **뒤**에 truth를 뽑는다.
  같은 seed라도 rng 소비 순서가 다르면 다른 truth가 나와 테스트가 두 개 다 거꾸로 실패했다. `resolveContestedInputs(archetype, seed)`
  를 추출해 `buildContestedCase`와 테스트가 같은 함수를 쓰게 고쳤다 — "같은 seed로 truth를 두 번 다른 경로로
  계산하지 않는다"를 이후 불변식으로 남긴다.

### 2) 시작 강도 — doubt 구간에서 시작하지 않게

- `evidence_strength_rules[].strengthRange`를 `[1,7]` → `[3,7]`로 바꿨다(`archetype.example.js`,
  `archetype.criminal.example.js` 둘 다). `deriveIssueStrengths`가 이미 `clamp(base+noise, min, max)`를
  쓰고 있어서 데이터만 바꾸면 됐다 — `bands.doubt=2`이므로 최솟값 3이면 항상 `shaken` 이상에서 시작한다.
- **500시드 분포 (ARCH_CRIMINAL_ASSAULT, `buildContestedCase(archetype, seed, [])`, seed 1~500)**:

  | issue | min | max | mean | 히스토그램(3/4/5/6/7) |
  |---|---|---|---|---|
  | ISSUE_IDENTITY | 3 | 7 | 5.05 | 52 / 125 / 131 / 129 / 63 |
  | ISSUE_CAUSATION | 3 | 7 | 5.00 | 64 / 118 / 139 / 113 / 66 |
  | 합계(1000개) | 3 | 7 | — | 116 / 243 / 270 / 242 / 129 |

  `doubt(≤2)` 개수: **0/1000**, 목표 달성. 다만 `proven(≥5)`에서 시작하는 비율이 64.1%(641/1000)로 높다 —
  이건 이번 항목이 요구한 "doubt에서 시작 안 함"과는 다른 문제이고, 실제 밸런스(준비 없이 이기는 사건 0개)는
  재반대·접근법까지 시뮬레이션해야 판단할 수 있어 손대지 않았다. TBD로 아래에 남긴다.
- 회귀: `criminal-template.test.js`의 "issue baseline이 항상 bands.doubt보다 크다" — seed 1~500 전수 확인.

### 3) 사람 결정 반영 — 승부 사건은 형사 원형만, ARCH_CRIMINAL_ASSAULT + 기계적 템플릿

- `archetype.example.js`(ARCH_LEASE_DEPOSIT)는 daily-only로 명시하는 주석을 추가했다. `buildContestedCase`를
  이 원형으로 호출하는 코드는 남겨뒀지만(제네릭 함수 자체를 막지는 않음 — 범용 로직 재사용성 유지), 실제
  사용은 `contested.test.js`의 activation 게이팅 회귀뿐이고 그 외에는 호출하지 않는다.
- `generator/core/archetype.criminal.example.js`: `ARCH_CRIMINAL_ASSAULT`(폭행치상). v0.10 trial-case.js의
  IDENTITY/KNIFE 두 쟁점 구조를 따라 `ISSUE_IDENTITY`/`ISSUE_CAUSATION` 2개, `evidence_strength_rules` 2개
  (하나는 `direction: 'inverse'`로 — 1.5단계엔 없던 방향도 테스트했다). `claim_amount`는 이 원형에 청구금액
  개념이 없어 "합의금 참고 구간"으로 재해석했다(주석에 명시, 판결 로직에는 안 쓴다).
- `contested.js`에 기계적 템플릿을 추가했다: `buildEvidenceTemplate(issueId, evidenceType, index)`가
  evidence 문자열 하나를 investigation 1개 + card 1개 + approach 1개로, `buildWitnessTemplate(issue)`가
  issue 하나를 witness 1개(direct/approaches/presses/redirect 포함)로 기계적으로 만든다. 대사·제목은 전부
  `(PLACEHOLDER ...)` 문자열이다 — content 단계(Codex)가 이 자리만 authored 문구로 바꾸면 된다.
- **engine validate() 통과 확인**: `criminal-template.test.js`가 `require('../../../engine/trial.js')`로
  실제 엔진 파일을 읽어(수정 아님) `FirmTrial.validate(buildContestedCase(archetype, seed, []))`가
  seed `[1,2,3,42,777,123456]` 전부 `true`임을 확인한다. `engine/trial.js`의 `validate()`는 모든 id
  (issue/witness/card/investigation/direct/approach/press/redirect/focus/stance)가 **문서 전체에서 유일**해야
  한다는 걸 코드로 확인했다(`unique()`가 카테고리별이 아니라 전역 `ids` Set 하나를 공유) — id 접두 규칙
  (`ISSUE_`, `W_`, `INV_`, `CARD_`, `A_`, `P_`, `D_`, `F_`, `S_`, `RH_` + issue id 포함)으로 이를 만족시켰고
  "전역 id가 모두 유일하다" 테스트로 고정했다.
- 실제 출력을 `generator/core/contested.criminal.example.output.json`에 저장했다(seed 1, twist 없음,
  `engine/trial.js`의 `validate()` 통과 확인됨). 1.5단계에서 만든 lease 기반
  `contested.example.output.json`은 이번 결정으로 더는 대표 출력이 아니라서 지웠다(이번 세션에 내가
  만든 파일이라 정리했다 — REVIEW_PACKET류 삭제가 아니라 스크래치 산출물 정리).

## 검증

```
node --test generator/core/tests/*.test.js
```
→ **27 pass, 0 fail** (1.5단계 18개 + `contested.test.js` 8개 + `criminal-template.test.js`에서 이전
`generate.test.js`의 buildContestedCase 7개를 이관·재작성).

`node --test`(인자 없음, 자동 탐색)도 함께 실행해 실패가 늘지 않음을 확인했다(같은 10개 `Cannot find
module 'playwright'` 사전 존재 실패만 남고, generator 쪽은 전부 통과 — 이번 세션에 다른 작업 디렉터리
(`courtroom-prototype/world/` 등)의 파일이 같은 작업 트리에 나타나 있어 전체 개수는 달라 보이지만
generator/ 관련 테스트는 모두 초록이다).

## 아직 안 된 것 / TBD

- **proven(≥5)에서 시작하는 비율이 64%로 높다.** doubt 회피는 됐지만 "준비 없이 이기는 사건 0개" 전체
  밸런스는 재반대/접근법 delta까지 시뮬레이션해야 판단 가능 — 별도 밸런스 점검 스크립트가 필요하다(GEN-001
  범위 항목, 아직 시작 안 함).
- **witnesses[].direct/approaches/presses/opening/lines/briefing/memo가 전부 placeholder다.** 구조는
  engine validate를 통과하지만 실제로 읽을 수 있는 사건은 아니다 — content 단계(Codex) 필요. 이 리뷰
  요청의 마지막 문장("그 뒤에 Codex가 대사와 나머지 반전을 채운다")대로 다음 순서다.
- **ARCH_CRIMINAL_ASSAULT의 twists_allowed 3개는 아직 TwistModule로 구현되지 않았다.** id만 있고
  `selectActivatedTwists`가 항상 걸러낸다(candidates가 비어서). 사람 결정에 따라 이번 2단계에서는 만들지
  않았다.
- **`credibility`/`opening.close`/`lines`/`missedPrep`/`briefing`/`client` 등은 engine validate()가 검사하지
  않는 필드라 최소 placeholder로만 채웠다.** `project()`/`review()` 같은 다른 엔진 함수까지 실제로 도는지는
  확인하지 않았다 — 이번 항목이 요구한 건 `validate()` 통과였다.
- 1.5단계 TBD 중 "ARCH_LEASE_DEPOSIT에 civil 필드명(`claimType`/`roles.prosecutor`)을 형사 template에서
  재사용한 문제"는 이번 사람 결정(승부 사건은 형사만)으로 **해소됐다** — lease는 이제 daily-only라
  `roles`/`charge` 문제 자체가 발생하지 않는다.

## 범위 확인

- `courtroom-prototype/generator/` 밖은 `engine/trial.js`를 require해서 읽기만 했다(테스트에서 `validate()`
  호출). 수정하지 않았다.
- 반전 5개 중 여전히 1개(TWIST_CLIENT_HIDES_DAMAGE, lease용)만 있다. 형사 원형용 반전은 이번 항목 범위가
  아니라 만들지 않았다. 밸런스 점검 스크립트, 나머지 원형(음주운전), 대형 사건 3개 설계 문서는 시작하지
  않았다.
- 여기서 멈춘다. 다음은 Codex가 대사와 나머지 반전을 채우는 단계다.

---

# GEN-001 1.5단계 — 자체 점검

Lane: experiment. 범위: `courtroom-prototype/generator/` 안에서만 작업했다.
읽은 문서: `.agent/tasks/GEN-001.md`, `docs/DESIGN-NOTES-2026-09.md` §1.3·§1.4, `courtroom-prototype/data/trial-case.js`(참고).

## 한 일

1. **TwistModule 기계적 필드** (`generator/core/format.js`)
   - `targetIssue`, `activation`(`TwistActivation`: param/op/value), `investigationCard.investigationId`/`cardId`,
     `opponentRecovery.effect`/`playerCounter.effect`(각 `{issue, delta}`)를 추가했다.
   - `evaluateActivation(activation, truth)` 순수 함수 추가 — truth 값이 조건을 만족하는지 결정적으로 판정.
   - 부호 규약을 문서화했다: strength/delta가 높을수록 원형의 `side` 반대편(opponent)에게 유리하다.
     `trial-case.js`의 redirect(양수=검찰/상대에게 유리)·rebuttal(음수=변호인/player에게 유리) 부호와 동일하다.

2. **진실→증거 강도 규칙** (`generator/core/format.js` + `archetype.example.js`)
   - `EvidenceStrengthRule` 형식: `{issueId, truthParam, direction, strengthRange, noise}`.
   - `computeBaseStrength(rule, truthValue)` 순수 함수(RNG 없음) + `generate.js`의
     `deriveIssueStrengths(archetype, truth, rng)`(seed 기반 잡음 ±noise 추가)로 분리했다.
   - 예시 원형에 `evidence_strength_rules` 2개를 채워 두 issue(CONTRACT_END, DEDUCTION) 모두 truth_param
     근거를 갖게 했다.

3. **claim_amount 추가 + 보증금/착수금 버그 수정**
   - `Archetype.claim_amount`(만원, 청구금액=보증금 원금) 추가. `fee.retainer`(착수금)와 분리.
   - `generate.js`의 `outcomeSummary`가 `retainer`(착수금 482만원)를 "보증금"이라 표기하던 버그를
     `claimAmount`로 고쳤다. 회귀 테스트(`outcomeSummary는 claim_amount를 쓰고...`)로 고정했다.

4. **예시 반전 1개 + 승부 사건 실제 출력 + 검증기 + 결정성 테스트**
   - `generator/core/twist.example.js`: `TWIST_CLIENT_HIDES_DAMAGE` 완전한 형태로 작성.
     진실(damage_by_tenant≥0.6일 때만 발동) → 조사 카드(의뢰인 재면담) → 상대 수습(전체 재시공 주장,
     delta +2) → 재반대(카드 필요, 파손 범위 한정 주장, delta −3)로 모순 없이 이어지게 구성했다.
   - `generator/core/contested.js`: `buildContestedCase(archetype, twist, seed)` — 원형+반전+시드를
     `trial-case.js` 형식 객체로 변환한다. 실제 출력을 `generator/core/contested.example.output.json`에
     저장했다(seed 6, 5000개 안에서 첫 activation-true 시드를 찾아 사용).
   - `generator/core/validate.js`: `validateArchetype`, `validateTwist` — 형식 위반을 문자열 배열로
     보고한다(예외 아님). `buildContestedCase`는 내부에서 `validateTwist`를 호출해 실패 시 예외를 던진다.
   - `generator/core/tests/generate.test.js`: `node:test` 18개. 결정성(같은 시드→같은 daily/contested
     출력, dict 비교), 범위 검증, activation 연산자, direction 부호, validate 양성/음성 케이스,
     redirect/rebuttal 변환 정확성, baseline 범위, activation 가능 시드 존재를 확인한다.

## 검증

```
node --test generator/core/tests/generate.test.js
```
→ 18 pass, 0 fail.

`node --test`(인자 없음, 자동 탐색)도 이 파일을 함께 실행함을 확인했다. 같은 실행에서
`tests/browser-*.test.js` 10개가 `Cannot find module 'playwright'`로 실패하지만, 이는 Playwright
미설치라는 기존 환경 문제이며 이번 변경과 무관하다(이 브랜치에서 새로 만들지 않았고, generator/ 밖 파일도
손대지 않았다).

## 아직 안 된 것 / TBD

- **witnesses[].direct/approaches/presses가 비어 있다.** TwistModule의 기계적 필드(이번 1.5단계 범위)만으로는
  주신문 스크립트·반대신문 접근법을 만들 수 없다. authored 대사이므로 content 단계(Codex) 필요.
- **`claimType`/`roles.prosecutor` 필드명이 민사 사건에 형사 template(trial-case.js)의 키를 그대로 재사용한다.**
  `engine/trial.js`가 `roles.prosecutor`를 문자열로 하드코딩하지 않는 것은 확인했지만(grep 결과 없음),
  `ui/trial-app.js`나 라벨 문구가 civil 사건을 실제로 지원하는지는 확인하지 않았다. `charge` 대신
  `claimType`, `guilty/notGuilty` 대신 `granted/denied`를 썼는데 이 이름이 맞는 관례인지는 설계 판단이 필요해
  추측하지 않고 TBD로 남긴다.
- **`truth_params.notice_defective`를 DESIGN-NOTES §1.7 원문 예시에 없던 값으로 새로 추가했다.** 두 issue 모두
  truth_param 근거를 갖게 하려는 이번 요구(항목 2) 때문이며, `landlord_solvent`는 여전히 강도 계산에 쓰지
  않는다(회수 가능성 등 후속 로직용으로 주석에 남김).
- **issues[].memo 텍스트는 구조 검증용 placeholder다.** "상대측 주장 쪽으로 정리됨" 같은 템플릿 문장이며
  최종 authored 문구가 아니다(주석에 명시).
- 반전 모듈 5개 중 1개만 만들었다. 원형 3개 중 1개만 만들었다. 밸런스 점검 스크립트는 아직 시작하지 않았다.

## 범위 확인

- `courtroom-prototype/generator/` 밖 파일은 읽기만 했고 수정하지 않았다(`engine/trial.js`를 grep으로
  확인만 함).
- 다음 단계(반전 4개 추가, 원형 2개 추가, 밸런스 점검, witnesses 대사 authoring)는 시작하지 않고 여기서 멈춘다.
