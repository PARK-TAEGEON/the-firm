# Courtroom v0.10.0 — Adversarial Trial experiment — Review packet

Date: 2026-09-27 KST. Base: HEAD 37d5b69 (v0.9.1 polish, courtroom-core-v0.9 lineage). Contract: ../.agent/tasks/COURTROOM-CORE-100.md. Scope: isolated experiment beside the existing courtroom. Implementation and automated checks complete; independent Reviewer PASS and human playtest not yet obtained.

## 작업 목적

법정 공방을 "질문을 하나씩 고르는" 방식에서 "준비한 것을 들고 상대와 다투는" 흐름으로 바꿔 재미를 검증한다(사용자 제품 방향 결정, 2026-09-27). 풋볼 매니저의 경기처럼 대부분은 흘러가고, 결정적인 순간(이의, 접근법, 결론 요구, 재반대)에만 플레이어가 개입한다. 기존 v0.9.1 법정은 비교 플레이를 위해 그대로 둔다.

## 변경 파일

신규 (전부 `courtroom-prototype/`):
- `trial.html` — 새 진입점. 3열(내 사건 파일 · 법정 · 재판장 메모) + 하단 개입 바.
- `data/trial-case.js` — B동 창고 사건의 authored 공판 데이터: 조사 6종/예산 4, 카드 7장, 검찰 증거목록 3건(열람 전 봉인), 개회사 선택지, 증인 2명의 주신문·이의 창·접근법·결론 요구·재주신문·재반대, 판결 규칙, 복기 문구. 사실관계는 data/case.js와 동일하며, 기존 Hard Counter `P_SIGN_LIGHT`가 요구하던 "조도 자료"를 조사 카드(`CARD_SIGN_ANGLE`)로 구현했다.
- `engine/trial.js` — 순수 함수. validate, project(records→판세/신뢰/카드/증인 상태), evalWhen, resolveApproach, pressSucceeds, adjudicate(all_required), replay, review(복기).
- `services/trial.js` — 유일한 상태 변경 주체. 명령: investigate, finishPrep, open, continue, objection, approach, press, endCross, rebut, verdict, reset. 흐름 커서(intro→direct→cross→redirect→다음 증인→closed)와 pending 결정(이의/재반대).
- `ui/trial-app.js`, `ui/trial.css` — 표현만 담당. 모든 변경은 service.command 경유.
- `tests/trial.test.js` (19), `tests/browser-trial.test.js` (217 checks).

수정:
- `package.json` — 0.10.0, npm test/test:browser에 trial 추가, `test:trial` 스크립트.
- `README.md`, `EXPERIMENT_RULES.md` — v0.10 절 추가(기존 내용 보존).
- 이 파일, `test-results.log`, 루트 `REVIEW_REQUEST.md`, `docs/CURRENT.md`, `.agent/tasks/COURTROOM-CORE-100.md`.

변경하지 않음: `index.html`, `engine/{core,procedure,opening,closing,adjudication}.js`, `services/courtroom.js`, `data/case.js`, `ui/app.js`, `ui/courtroom.css`, Godot 전체, 헌법·DEC 문서.

## 게임 흐름 요약

1. 준비: 반나절 4회. 조사는 되돌릴 수 없다. 검찰 수사기록 열람은 상대 증거목록 내용(현장 사진의 간판 불빛 등)을 공개해 다음 조사 판단을 바꾼다. 의뢰인 재면담은 "칼은 만진 적 없다"는 첫 진술이 틀렸음을 드러낸다.
2. 개회사: 주력 쟁점(증인별 신문 시간 4/2, 3/3, 2/4)과 칼 접촉 입장(인정/언급 안 함/부인) 공개. 이후 변경 불가.
3. 증인별: 검사 주신문 자동 진행 → 이의 창(서지훈: 정당한 유도신문 이의, 한서윤: 기각되는 미끼) → 반대신문(접근법 3종, 한정 결론, 과한 결론, 시간 소진 시 자동 종료) → 검사 재주신문(조건부 수습) → 반박 카드가 있으면 재반대.
4. 판결: 필수 쟁점 2개가 모두 입증되어야 유죄. 판세는 재판장 메모의 문장(입증/의문/합리적 의심)으로만 표시.
5. 복기: 유효했던 것 / 역효과 / 놓친 준비를 기록에서 생성.

## 새로 강제되는 invariant

- 판세·판결·복기는 records만 읽는다. UI draft, 클릭 수, 화면 상태를 읽지 않는다. `T.replay(records)`는 서비스 projection과 동일하다.
- 무작위 없음. 같은 명령 순서 → 같은 records(ID 제외) → 같은 판결.
- 실패한 명령은 state와 ID serial을 변경하지 않는다(draft copy 후 커밋).
- records는 append-only. reset은 새 session 번호로 ID를 재사용하지 않는다.
- 카드 없는 접근법, 소진된 신문 시간, 중복 접근법/결론 요구, 근거 없는 결론 요구, 단계 밖 명령은 거부된다.
- 과한 결론 요구는 항상 역효과(+판세, 신뢰 −1). 한정 결론은 authored 근거 조건 충족 시에만 성공.
- 재판장 신뢰가 1 이하이면 다음 반대신문 시간이 1 줄어든다.
- 개회사 "부인" 입장은 지문 증언에서 검사가 모순으로 공격하고(신뢰 −1), 이전 사용 접근은 입장 번복 기록을 남긴다.
- 엔진/서비스/UI 코드는 사건 고유 ID를 검사하지 않는다(테스트로 강제). 사건별 차이는 data의 조건(when, stanceConflict, caution)으로 표현한다.
- 화면에 승률·점수 숫자를 표시하지 않는다(browser test로 메모 검사).

## 밸런스 확인 (authored, 결정적)

| 경로 | 결과 |
|---|---|
| 준비 없음 | 유죄 |
| 수사기록+현장(식별 집중) | 무죄 (식별 합리적 의심) |
| 현장+조도(식별 집중) | 무죄 (재반대로 간판 불빛 무력화) |
| 현장만(식별 집중, 이의 없음) | 유죄 (간판 불빛·6년 친분 수습) |
| 보고서+재면담, 인정(칼 집중) | 무죄 |
| 보고서+비품, 언급 안 함(칼 집중) | 무죄 (경계선) |
| 보고서+재면담, 부인 | 유죄 (개회사 모순) |
| 이른 결론 요구·과욕 | 유죄 |

## 실행 명령과 결과

- `npm test`: 247 tests (기존 228 + trial 19), 0 fail, exit 0.
- `node tests/browser-trial.test.js`: 217 checks, 0 failures, exit 0. desktop 1440×900 / short 1280×720 / mobile 390×844 × 무죄·유죄 경로, localhost + mobile direct-file, 가로 넘침·숫자 미노출·포커스·복기·reset·Space 진행. 이 환경에는 Edge가 없어 번들 Chromium으로 fallback(`PW_CHANNEL`로 지정 가능).
- 기존 browser 회귀(Chromium 대체 실행, 원본 파일은 수정하지 않고 임시 사본의 channel만 제거): browser 87, flow 47, tactics 35, opening 52, commitment-scope 37, closing 58, closing-profile 67, adjudication 208 = 591 checks, 0 failures.
- 기존 `browser-full-flow.test.js`: "Record sheet returns focus to rebuilt opener" 1건 실패. **변경 전 HEAD 37d5b69를 같은 Chromium으로 실행해도 동일하게 실패**하므로 이번 변경과 무관한 Chromium/Edge 포커스 차이로 판단한다. Edge 환경 재실행 필요. 같은 이유로 `ui-flow-budget.js`는 이 환경에서 완료되지 않았고, `ui-budget.js`는 14 checks 통과.
- Godot: 변경 범위 밖이므로 재실행하지 않음.

## Fixture / injected

- 테스트 plan은 실제 배포 데이터(data/trial-case.js)를 사용한다. 합성 fixture는 validation 음성 테스트(깨진 참조)뿐이다.

## 미구현 / TBD

- 최후변론(Closing)과 기존 v0.8 Closing 엔진 연결, 기존 신문 엔진(Proposition/Inference)과 접근법 모델의 통합 여부.
- 검사 성향은 `thorough` 하나. 공격형/여론형 검사, 판사 성향 없음.
- 캐릭터 일러스트·효과음·음악 없음(이니셜 원형 초상은 자리표시). Noto Serif KR·손글씨 폰트는 설치 시에만 사용.
- 저장/불러오기, 여러 사건, 경영 루프, Godot 조사 결과와의 연결.

## 설계 판단이 필요해 건드리지 않은 부분

- 이 실험의 규칙(쟁점 판세 정수, 밴드 5/2, 신뢰 3, 시간 배분)은 authored 플레이테스트 값이며 DEC로 승격되지 않았다. 정식 채택 시 판정 모델을 DEC-LITIGATION-011/012(사실 인정·증명 기준)와 맞출지 결정이 필요하다.
- 헌법 8장 "정답 퍼즐 금지"와의 관계: 복수 승리 경로(식별/칼/혼합)를 두었지만, 사건이 하나라 경로를 외우면 반복 가치가 떨어진다. 사건 생성·다양화는 별도 결정.
- 기존 v0.9.1 법정을 대체할지, 두 방식을 합칠지는 사람 플레이테스트 후 결정.

## 범위 외 변경

없음. 저장소에 원래 있던 미커밋 변경(.agent/*, litigation-skeleton/*, 일부 courtroom 파일의 CRLF 줄바꿈)은 건드리지 않았고 커밋하지 않았다. 이번에 편집한 문서 4개(CURRENT.md, REVIEW_PACKET.md, test-results.log, package.json)는 작업 전 CRLF만 다른 상태였으므로 HEAD 내용으로 되돌린 뒤 편집했다(내용 차이 없음).

---

# Courtroom Core v0.65 — Review packet

Date: 2026-09-22. Base: v0.6 c0a62e1. Contract: ../.agent/tasks/COURTROOM-CORE-065.md. Scope: isolated web experiment. Implementation and regression checks complete; independent Reviewer PASS has not been obtained. No next VS or Opening implementation started.

## Purpose and behavior

The same conclusion question now has different responses depending on explicit earlier testimony. The forensic prior-use opportunity and inability to exclude earlier contact are separate propositions. Timing → prior contact locks the latter; premature broad questioning opens adverse narrative. Asking beyond an achieved concession adds a linked qualification/counter and rehabilitation opportunity, while keeping the favorable concession and Frame.

Two witnesses use the same engine grammar. No case/proposition/fingerprint IDs are inspected in engine or services. There is no RNG, order bonus, attack score or new permanent panel.

## Changed files

- `.agent/tasks/COURTROOM-CORE-065.md`, root `DESIGN.md`: active bounded contract and stable tactical grammar. Godot Accepted documents unchanged.
- `data/case.js`: final declarative literal replaces late push/overwrite mutations; authored commitment metadata, two sets of four claims, stateful prior-contact response, linked qualifications, adverse narrative/overreach records and bounded evaluations. Original inference sets and legacy response rules retained.
- `engine/core.js`: generic record commitment extraction, authored route matching/validation, per-claim repeat filtering, duplicate-proposition tag deduplication, record-derived relation/support/rehabilitation assessment. Diff: 43 added / 8 removed lines; net +35. Compact line count is not a complexity estimate.
- `engine/procedure.js`: claim-sensitive repetition, explicit broad claim reuses limited-inference form opening, nonduplicated default form response, alternate address-only data fixture, shared claim/procedure ID namespace. 6 added / 5 removed lines.
- `services/courtroom.js`: append-only commitment/relation evidence, optional claim in Press advocacy/history, routed fact answers, validated explicit claim commands. 12 added / 8 removed lines.
- `ui/app.js`: actual claim questions, pre-Press strength hidden, single-question direct entry, sibling disclosure/selection, grouped repeated testimony and linked explanation detail. State mutations remain in service; UI choices only affect presentation until a command.
- `ui/courtroom.css`, `ui/fonts/PretendardVariable.woff2`, `ui/fonts/Pretendard-LICENSE.txt`, `ui/fonts/README.md`: locally bundled UI font, optional installed serif dialogue, normal button weights, quiet record controls.
- `index.html`, `package.json`: v0.65 and test entries.
- `tests/tactics.test.js`, `tests/browser-tactics.test.js`: 28 tactical tests and 35 actual-shipped-content browser checks.
- `tests/procedure.test.js`: three Court Address tests explicitly request address-only fixture. Default duplicate removed, mechanism retained.
- `tests/browser.test.js`, `tests/browser-flow.test.js`: legacy resolver fixture explicitly removes claimVariants; tests adapt single-question navigation, removed strength hint, three distinct form actions. Old browser address UI assertions replaced by default merged path; address service coverage remains. 87 + 47 checks. These are compatibility tests, not evidence that actual new claims use the old resolver.
- `tests/ui-budget.js`, `tests/ui-budget-baseline.json`: released v0.6 measurements as comparison, wait for font readiness.
- README, EXPERIMENT_RULES, UI_TEXT_AUDIT, this packet, test-results.log: current behavior, boundaries and evidence.
- Local v0.65 ZIP: deliverable, ignored by Git; prior ZIPs preserved. Contains root DESIGN.md snapshot.

## Invariants and tests

- Explicit commitment must be among that answer's propositions and scoped to its witness/plan. Claims and procedure rules share persistent ID namespace. Invalid references, fallback, relation kinds, foreign claims and missing linkage fail validation or atomic commands.
- Evidence is append-only. Original admissions survive qualifications and overreach; contradiction/retreat release affected commitments for future routing without deleting original evidence. Tag counts do not count repeated statements of the same proposition twice.
- Claims and goal routes depend on records, not asked order indexes. Existing narrative changes later response even after setup. Premature and prepared versions of the same final question are tested for both witnesses.
- Claim scope is separate from exact inference strength. Explicit claims can start before collection; Frame still requires a valid exact inference. No-claim compatibility calls still require a valid inference.
- Same claim + same/subset basis repeats; strict supersets reinforce. Claim IDs distinguish different conclusion questions without changing canonical premise signature. Existing v0.6 signature tests and new explicit-claim reinforcement pass.
- Record-only evaluation reproduces concessions, qualifications, support states, adverse narrative and rehabilitation refs without UI selection/thread/history. Full persistent-ID renamed tactical fixture passes.
- Browser checks cover actual question selection, premature narrative, safe and broad responses, overreach, retained gain/Frame, both witnesses, multi-basis transaction, missing strength hints, disclosure separation, mobile selection, offline font load and blocked-font fallback.

## Executed commands and results

- `npm test`: 160 tests (132 existing + 28 tactical), 0 failures, exit 0.
- `npm run test:browser`: 87 legacy UI + 47 flow + 35 actual tactical checks = 169, 0 failures, exit 0. Playwright/Edge via bundled NODE_PATH.
- `npm run test:budget`: 14 assertions, 0 failures, exit 0. Baseline v0.6. Detailed 4-row measurements in UI_TEXT_AUDIT.md.
- Godot `--headless --path litigation-skeleton --script`: run_regressions 214; run_slice_regressions 73; run_vs002 72; run_vs003 260; run_vs004 256; run_vs005 351; run_vs006 1054. All 2280 checks pass, each exit 0.
- Godot `--headless --path litigation-skeleton --quit-after 3`: exit 0.
- Total: 2609 regression tests/checks; 2623 including UI-budget assertions; 0 failures. Smoke separately listed.
- Scoped diff reviewed and whitespace checked before commit. Original reference and prior releases unchanged. Generated screenshots/raw logs in ignored tests/artifacts.

Intermediate failures resolved: three old tests assumed duplicate form Maintain; made their intended Court Address fixture explicit. Browser single-question shortcut initially duplicated the selected goal; removed duplicate rendering. No failures remain in latest runs. Initial sandbox font download failed before writing; official font and license then downloaded successfully through approved access.

## Direct answers to the 12 requested questions

1. **Commitment는 실제 플레이를 바꾼다.** 시점 불명과 이전 접촉 배제 불가를 인정받으면 같은 결론 질문에 인정하고, 그 입장이 없으면 추가 정황을 설명한다. 기록의 commitment만 제거한 fixture에서도 반응이 달라진다.
2. **같은 Basis에서 결론 범위를 선택한다.** 좁은 확인은 기존 사실을 확인하고, 한정된 큰 결론은 새로운 인정을 얻을 수 있으며, “사용하지 않았다”는 요구는 반박을 부른다. 질문 문장으로 선택한다. 실제 고민의 깊이는 플레이테스트가 필요하다.
3. **질문 순서가 Response Route를 바꾼다.** 시점을 먼저 물으면 이후 이전 접촉의 배제 불가까지 인정한다. 반대 순서에서는 사용 기회만 확보한다. 나중에 명시적으로 다시 확인할 수 있으므로 되돌릴 수 없는 순서 퍼즐은 아니다.
4. **너무 이른 큰 질문으로 손해 볼 수 있다.** 혈흔·현장 정황 또는 목격자의 다른 식별 근거가 불리한 기록으로 남고 설명 기회가 생긴다. 나중에 유리한 인정을 받아도 그 기록은 지워지지 않는다.
5. **좋은 답변 뒤 한 질문을 더 해서 후회할 결과가 있다.** 기존 인정과 Frame은 보존되지만, 증인이 “입증 못함”과 “일어나지 않음”을 구분하며 한정 설명과 Counter를 남긴다.
6. **Stop의 판단 근거가 분명해졌다.** 얻은 인정을 보존할지 설명 기회를 열지 선택한다. 별도 보너스는 없다. 플레이어에게 실제로 더 어려운 결정인지는 아직 측정하지 않았다.
7. **Setup → Lock → Exploit는 대사로 표현된다.** “앞서 말씀드린 대로…”가 이전 인정을 이어받고, 마지막 질문이 그 의미를 요구한다. 시스템 이름이나 잠금 배지는 없다. 짧은 authored 장면이라 분기를 익히면 패턴이 보이는 한계는 남는다.
8. **모든 행동 소진이 우월하지는 않다.** 광원 후속 질문이나 과도한 결론은 기록을 악화시키며, 모든 사실 없이도 유용한 인정을 얻을 수 있다. 다만 무해한 준비 질문을 전부 묻는 비용은 여전히 작다. 이를 해결했다고 주장하지 않으며 임의의 시간·점수 벌칙도 추가하지 않았다.
9. **상시 UI 복잡성은 크게 늘지 않았다.** 데스크톱 일반/논증 화면 +4/+7자, 모바일 +3/+6자이며 모바일 문서 높이는 감소했다. 결론 선택 때만 네 질문 문장이 나타난다. 새 상시 패널·배지·게이지·튜토리얼은 없다.
10. **서체의 역할 구분은 확인했다.** Pretendard는 실제 로컬·오프라인 로딩된다. 발언은 설치된 Noto Serif KR 또는 Batang/serif를 쓴다. Noto Serif KR 자체를 번들한 것은 아니다. 화면을 직접 검토했지만 몰입 개선은 사용자 실험으로 검증한 결과가 아니다.
11. **더 삭제할 수 있는 텍스트는 접힌 상세의 반복 전제 목록과 일반적인 Hard Counter 설명이다.** 현재는 추적성을 위해 남겼다. 실행 전 강도, 중복 중요도 힌트, 중복 절차 행동은 제거했다. 질문 범위와 답변의 차이를 설명하는 실제 문장은 유지한다.
12. **현재 범위의 Examination Core는 동결하고 다음 설계 단계로 넘어갈 수 있다.** 요청한 전술 문법과 회귀 검증은 갖췄다. 독립 리뷰 후 Opening에서 사건 전체 전략을 검증하는 편이 낫다. 무해한 질문 수집과 불리한 설명에서의 회복은 콘텐츠·전체 사건 평가 과제로 남긴다. 이번 작업에서 Opening을 시작하거나 범용 법률 추론 엔진이 완성됐다고 선언하지 않는다.

## Fixtures, TBD and forbidden scope

All testimony, claims, inferences, support transitions and response routes are authored case fixtures. There is no semantic NLP contradiction detector: an author declares relation meaning; validator verifies structure and ownership. Existing direct testimony is still seeded authored input. Hard narrative/overreach counters have no new immediate rebuttal route in this slice. Actual rehabilitation/Redirect, Closing valuation and whole-case victory are not implemented. Address-only and strict-judge variants are test data, with no judge-selection UI.

Godot skeleton/accepted rules, Opening/Closing/Verdict, third witness, new case, civil, Re-cross, jury, Frame slots, RNG/AI, relationship scores and staff were not touched. Unrelated automation modifications present at start remain untouched. No scope-external refactor, publishing or push.

## 2026-09-23 — Documentation and v0.65 baseline freeze

Purpose: preserve the accepted four-document draft from the referenced design conversation, reconcile CURRENT with the existing v0.65 code, and define v0.7 without implementing it.

Changes: added repository-root docs/DESIGN.md (principles), docs/CURRENT.md (verified implementation and outstanding debt), docs/IMPLEMENT.md (future v0.7 delta), docs/REVIEW.md (fixed review standard). Appended this handoff and test-results.log under repository AGENTS.md requirements. Root DESIGN.md and all runtime/test source remain unchanged.

Baseline: df648a1e7a73a5d63bed0308a1441ebde1666abd. Local v0.65 ZIP SHA-256 AA38FDE794B752636F21FEEF39B870B00A796087B5B3BE0424ACD9CA8D03E455 matches the independent review supplied in conversation 6ab0a8af-5d50-83ee-a96c-22d554ef97b6. That later review reported no P0/P1; the earlier review-not-obtained statement above describes the original implementation handoff. This documentation task is not a new independent product review.

Verification rerun: npm test — 160 pass; npm run test:browser — 87 + 47 + 35 = 169 checks; npm run test:budget — 14 checks. Total 343 tests/checks, 0 failures, all exit 0. Browser runs used bundled Playwright with Edge. Existing tests only; no new runtime invariant or tests introduced. Godot suites were not rerun for this documentation-only change. No new manual human playtest claimed.

Remaining authored/fixture limitations: response routes and relations are authored; legacy browser tests use compatibility fixtures. Opening/public Major Commitment creation and persistent strategy-conflict records remain future work. Relation duplication/first-match targeting, procedure three-rule constraint and Claim UX are documented, not fixed. No v0.65.1/v0.7, Godot, UI, automation, publishing or push work performed. Existing unrelated user changes are excluded from the commit.

## v0.7 — Opening / Strategy (2026-09-23)

Purpose: implement docs/IMPLEMENT.md only. New engine/opening.js handles authored option validation, factual strategy conflicts, record-only case projection. services/courtroom.js creates append-only public positions and strategy revisions; data/case.js adds Opening fragments and explicit working positions. ui/app.js reuses existing scene/action/record surfaces; CSS only adds compact opening groups. index/package version is 0.7.

Frozen core: engine/core.js changes only availability for opening and pre-opening witness navigation; engine/procedure.js and all examination response/pressure/routing/evaluation code remain unchanged. Root DESIGN.md and the 070 task contract explain the authorized delta; docs/CURRENT.md reports actual state. REVIEW_REQUEST.md is the independent review handoff.

Invariants: public positions have only Advocacy as storage; opening never creates evidence or a Frame; revisions never rewrite previous records; conflicts explicitly reference original major commitment and revision; issue-priority change alone is not a factual contradiction; failed commands roll back state and serial; record-only replay does not use UI/history.

Tests: Node 168/0; Browser 221/0 (87 basic, 47 flow, 35 tactical, 52 opening); budget 14/0. Commands: npm test, npm run test:browser, npm run test:budget, all exit 0. Playwright uses Edge and bundled NODE_PATH. Existing Node 160 tests use case-v065 (only Opening disabled); existing basic/flow browser compatibility fixtures disable Opening alongside claimVariants. Actual-data tactics traverses Opening; new Opening tests include semantic equivalence of examination with/without Opening. Opening browser paths A/B/C run large/short/mobile including direct file; screenshots visually inspected.

Fixtures/limits: same warehouse, two authored witnesses, two theories, finite authored opening fragments and explicit contact conflict semantics. No generic contradiction or legal inference engine, no new intent evidence, no score, no Closing/Verdict/Redirect, no whole-session save/load. Existing relation metadata duplication and first-target selection remain deferred. No unrelated automation or Godot changes. Independent review and human playtest pending; this is implementation verification, not Reviewer PASS.

## v0.7.1 — cross-issue Major Commitment isolation (2026-09-25)

Purpose: fix independent-review finding. engine/core.js now reviews only same-issue commitments with scoped active counters; priority evaluation and authored strategy conflict remain separate. No record mutations changed. engine/opening.js requires explicit per-Theory position keys, treats unspecified as uncommitted, and marks case links as issue_progression. case.js explicitly declares Theory A contact unspecified. Package/index are 0.7.1.

Added 7 Node tests and browser-commitment-scope.test.js. Five new bug/priority tests failed on v0.7 and pass on this patch. Positive same-issue review, both cross-issue exclusions, priority change without evidence, Opening/strategy preservation and record replay are verified. New browser paths use UI actions on desktop/mobile. Reverse INTENT direction is a test-only plan-scope fixture, not new production content.

Full commands: npm test (175/0), npm run test:browser (258/0), npm run test:budget (14/0), exit 0 each; total 447. Existing v0.65 Node/tactical browser and all Opening A/B/C regressions pass. UI budget unchanged apart from two desktop version-label characters. Core scope filter, opening validation/metadata, case workingPositions, tests, version metadata and review/current/task documents are the only modified areas. Service, procedure and UI app/CSS untouched.

Invariant: a foreign-issue counter never enters commitmentReviewRefs; priority alone never implies evidentiary challenge. Strategy conflicts remain append-only and separate. Limitations: issue-level challenge only; no statement-specific contradiction inference, Intent gameplay, Closing/Verdict/FactFinding or new UI. Prior relation debt deferred. Godot untouched; independent re-review pending. Full changed-file list and fixture details: root REVIEW_REQUEST.md.

## v0.8 — Closing and case-wide synthesis (2026-09-25)

Purpose: Closing as selected record interpretation, not new evidence or verdict. engine/closing.js reads all plans, exact recorded premise sets, Frames, admissions, counters/qualification, current priority/objectives. services adds beginClosing/submitClosing and append-only public revision/conflict references; core changes only phase availability. data adds phase/actions and Closing tense fragments; UI reuses center/record disclosures and preview. No new permanent panels/scores or forbidden systems. Full changed-file list and details: root REVIEW_REQUEST.md.

Invariants: Evidence/Procedural unchanged by Closing; only selected arguments enter speech, with all premises explicitly cited; record-only prepare/final replay; Core/Peripheral preserved; old public commitments/strategy conflicts untouched; invalid/duplicate/foreign/missing references fail atomically. Two witness arguments remain separately linked to their records. Counter treatment does not automatically remove adversity.

Commands/results: npm test 188/0; npm run test:browser 316/0; npm run test:budget 14/0; total 518, exit 0 each. Closing adds 13 Node tests and 58 browser checks. Existing 175 Node and all 258 browser regressions rerun. Desktop large/short/mobile, direct file, preview/cancel/publish, counter/revision conflict/replay paths passed. Existing budget unchanged; short-height Closing record overflow fixed with scoped scrolling. Screenshots inspected.

Fixtures: existing compatibility suites unchanged; Closing uses shipped authored data. No general inference/contradiction solver, intent evidence, opponent Closing, fact finding, verdict or session loading. Prior relation duplication/target debt deferred. v0.7.1 tag courtroom-core-v0.7.1 = 839b201 with user-reported independent PASS. v0.8 independent review pending. Godot/user automation untouched, no next-stage or multi-agent work.

# v0.8.1 Independent Review Request

Status: PASS candidate; independent review pending. Base: e581aaa (v0.8).

## Corrections
- engine/core.js: reject partial optional Closing lifecycle; profile-aware beginClosing/submitClosing availability. closing/closed phases and both actions form a complete bundle. No-Closing remains resolved after both witnesses.
- engine/closing.js: deduplicate spoken final position text only, with revision wording when any source revises. All revision/conflict records and selection references retained; service record writer unchanged.
- index.html: phase-neutral 법정 진행 accessible name; version 0.8.1. No last-witness UI redesign.
- package.json: version and new tests. tests/closing-profile-fixture.js, closing-profile.test.js, browser-closing-profile.test.js: full/absent/partial profile, atomic rejection, speech/replay/record preservation.
- docs/CURRENT.md, root DESIGN.md, .agent/tasks/COURTROOM-CORE-081.md, REVIEW_REQUEST.md, prototype REVIEW_PACKET.md/UI_TEXT_AUDIT.md/test-results.log: status and handoff.

## Verification
Run in courtroom-prototype: npm test; npm run test:browser; npm run test:budget. Playwright uses installed Edge and bundled NODE_PATH.
Node 198 / Browser 383 / UI budget 14 = 595 checks, 0 failures, all exit 0. Existing Node 188 and Browser 316 retained. Added Node 10 and browser 67. Eight valid new regressions failed before correction. Mixed-mode fixture was corrected to use legal same-issue revisions before final testing.
Browser sizes: 1440×1080, 1280×720, 390×844. Existing localhost/direct-file paths retained. New full/none profiles play Opening → two witnesses → resolved; full proceeds through Closing preview and publication. Confirmed 2 revision and 2 conflict records while one final sentence is spoken, Evidence/Procedural unchanged, JSON record-only replay equivalent. Partial declarations fail construction in Node. UI budget unchanged, no new panel or horizontal overflow; neutral accessible name verified in resolved and closed phases.

## Reviewer focus
1. Profile availability and command rejection agree; each partial lifecycle fails construction.
2. No-Closing UI terminates normally and offers reset without Closing.
3. Dedup affects speech only, including mixed maintain/revise; trace multiplicity and historical advocacy survive.
4. Existing examination, opening, strategy, cross-issue and synthesis regressions remain unchanged.

## Limits / scope
Full profile is shipped criminal data. Absent/partial profiles are fixtures, not civil implementation. Speech dedupe uses exact final text, not semantic paraphrase matching. Existing relation metadata debt remains. No CFF/Verdict/Jury/Settlement/civil, core mechanics changes, panels or Closing redesign. Unrelated user modifications remain untouched. No push.

# v0.9 Independent Review Request

Status: implementation verified, independent review pending. Baseline tag courtroom-core-v0.8.1 → 529371f3679318154d8508daf11d6f2785113508 (user-reported Independent Reviewer PASS, implementation d54006d).

## What changed
CourtRecord now feeds a separate Judge finding/decision layer. It reads local Evidence, admissions, active/qualified counters, witness relations and support states, retaining Frame/Opening/Closing and procedural references as separate context. Proof uses authored exact premise sets and explicit doubts/conflicts, without point totals or argument-strength conversion.

CaseDefinition.adjudication declares finding rules, required issues, burden party, standard, all_required decision rule and outcome labels. Currently only judge and beyond_reasonable_doubt are supported; invalid/partial configurations fail construction. No general legal rule language or additional proceeding is introduced.

The service adds profile-aware deliverVerdict availability/command. It is enabled after both witnesses and published Closing, or after both examinations when Closing is absent. It appends one verdict_delivered judicial Procedural record with fixed input refs/version; all Evidence/Advocacy and prior Procedural remain identical. Replay reads those referenced records and the fixed definition, not UI/history/session or later records. Missing refs/version mismatch fail explicitly.

The center displays the outcome and two short required-issue findings, with expandable evidence. The existing record panel contains the judicial decision. No new permanent panel, gauge, score or recommendation. Verdict heading gains focus and is scrolled clear of the mobile sticky header.

## Files
- courtroom-prototype/engine/adjudication.js: validation, availability, issue findings, decision rule, referenced-input replay.
- courtroom-prototype/data/case.js: minimal authored adjudication definition, verdict phase/action.
- courtroom-prototype/services/courtroom.js: additive decision command and projection; original response/Opening/Closing mutation code unchanged.
- courtroom-prototype/ui/app.js, ui/courtroom.css, index.html: phase-local result/disclosure, procedural record presentation, focus and module load.
- courtroom-prototype/package.json: 0.9.0, new test scripts.
- courtroom-prototype/tests/adjudication.test.js, browser-adjudication.test.js: new invariants and browser journeys.
- courtroom-prototype/tests/opening.test.js, browser-commitment-scope.test.js: reverse INTENT fixture opts out of adjudication because its remapped issue cannot use original IDENTITY rules; original assertions retained.
- docs/CURRENT.md, root DESIGN.md, .agent/tasks/COURTROOM-CORE-090.md, REVIEW_REQUEST.md and prototype review/log/text audit: implementation and handoff.

## Reviewer priorities
1. Evidence vs Advocacy vs Procedure: a public admission is never witness evidence; winning an objection cannot prove a fact. Decision only adds a judicial marker.
2. Exact recorded premise routes, explicit doubts, qualification provenance and unresolved contradictions; scope cannot leak in either direction.
3. Closing changes argument context, never evidence or the proof finding. Sparse Closing cannot invent absent identity/intent testimony.
4. Required issues/burden and all_required outcome; synthetic positive paths clearly separated from shipped content.
5. Record-only replay using frozen input references, no silent mutation and atomic invalid commands.
6. no-Closing and no-adjudication profiles, partial config rejection, existing examination and Closing regression.

## Verification
Commands from courtroom-prototype: npm test; npm run test:browser; npm run test:budget. Browser: Playwright with installed Edge, bundled NODE_PATH where needed. Detailed totals are recorded in test-results.log and CURRENT.md.
Browser paths: recorded facts + admission/counter + selected Closing argument; sparse Closing; no-Closing direct decision. Each at 1440×1080, 1280×720, 390×844; mobile direct-file mode. Existing all-version browser paths retained. Checks include unchanged Evidence/Advocacy, one judicial marker, reference replay, issue isolation, context, heading focus/visibility, record sheet, no overflow/new panel, and verdict center under 280 characters. Desktop/mobile PNGs visually inspected.

## Limits requiring attention
The shipped record contains no complete proof path for attacker identity or offense-time use. Its required issues therefore fail proof on all current real journeys; only reasons, limitations and advocacy context differ. This is deliberate preservation of existing evidence, not a claim that guilt/innocence has been fully authored. Positive proof, opposing proof and burden/required-issue variation are synthetic fixtures only. Identity background statements, exhibits available in the sidebar and Opening admissions are not silently entered as evidence.

INTENT has no evidence and is outside required issues for this narrow slice. This is not a complete criminal law model. Only one proof standard is supported; unsupported standards fail validation. Same-version CaseDefinition is needed with saved CourtRecord; full UI/session save/load remains out of scope. Explicit authored doubts and linked contradictions are handled; semantic contradiction discovery is not implemented. Existing relation metadata debt remains.

No Jury/Sentencing/Appeal/Settlement/Civil/Redirect/Opponent Closing AI/long-form judgment/Staff/multi-agent/Orca. No push. Unrelated user changes preserved. Historical docs/IMPLEMENT.md v0.7 exclusions are superseded only by the explicit v0.9 request and current task contract.

Final verification: Node 228 + Browser 591 + UI budget 14 = 833 checks, 0 failures, all exit 0. See root REVIEW_REQUEST.md for review limitations. Opposing complete proof routes cannot both be accepted; case data maps party evidence sides. No frozen engine/core.js, engine/opening.js, engine/closing.js or engine/procedure.js changes.

# v0.9.1 Independent Review Request

Status: polish implementation verified; independent review pending. Baseline courtroom-core-v0.9 → 839628409b3563cbe13473b5cc855cd1db173ba8, implementation f143986. PASS was reported by the user.

## Purpose and changes
Full-play UI/UX polish only. All engine modules, services/courtroom.js and shipped data/case.js are byte-identical to v0.9. The case still has no complete guilty proof path; no mechanic/rule/content was added.

- Central next-witness action reuses witness command after examination ends.
- Opening/Closing/Verdict hide last-witness tabs/exhibits and unavailable strategy control. Same three columns, no new panel.
- Compact Opening/Closing title area; after Opening, first witness name replaces repeated Opening speech as current headline. Original speech remains in dialogue/record.
- Closing citation/counter selection opens existing record sheet directly: one fewer click, no duplicate selected-title list, no automatic choice.
- Remove strength labels, repeated issue grading and long developer scope disclaimer from witness-result details. Scoped substantive result remains; regression verifies actual issue scope and absence of verdict.
- Keep concise issue findings and final verdict sentence on one screen; no artificial FactFinding intermediate phase.
- Phase/witness changes focus and scroll to current heading below sticky header. Same-phase selection retains focus/details/scroll. Dialog close restores focus to a rebuilt opener.
- Reset clears presentation disclosures, scroll, hidden Closing preview and opener references, alongside unchanged engine reset. Duplicate reset control hidden; clearer 다시 시작 label.
- Neutral budget artifact names and full-flow comparisons against v0.9.

## Files
Production: ui/app.js, ui/courtroom.css, index.html, package.json.
Tests: browser-full-flow.test.js, alternate-verdict-fixture.js, ui-flow-budget.js, ui-flow-baseline.json, ui-budget.js; existing browser scripts updated only for new visible reset/citation path, removed disclaimer semantics or neutral screenshot naming. Existing gameplay assertions retained.
Documentation: docs/CURRENT.md, root DESIGN.md, .agent/tasks/COURTROOM-CORE-091.md, REVIEW_REQUEST.md, prototype REVIEW_PACKET.md/UI_TEXT_AUDIT.md/test-results.log.

## Verification
Node 228; Browser 1189 (591 existing + 598 full-flow); UI budget 75 (14 historical examination + 61 full-flow). Total 1492 unique checks, 0 failures; npm test, npm run test:browser and npm run test:budget exit 0. Budget command additionally reruns 187 A-path assertions already covered above; not counted twice. Baseline v0.9 run: 424 checks, separate comparison evidence.

A/B/C/D all run at 1440×1080, 1280×720, 390×844. A plays through reset and a second Theory B run; B uses Peripheral argument; C keeps Strategy and Closing conflicts; D injects test-only direct testimony and proof routes, then uses normal UI/service/engine to render guilty. Shipped A/B/C render not_guilty. Existing localhost/direct-file, keyboard selection, procedure, no-Closing and record-only replay tests remain. No-adjudication compatibility remains in the existing Node suite.

Reset checks empty record layers, witness history, public commitments, Closing/adjudication projections and draft choices, exactly one new Opening/Closing/verdict marker, new runtime IDs, no prior conflicts or hidden preview. Phase checks verify current heading focus/visibility, no stale witness controls, one or zero open modals and no overflow. Closing sheet returns focus and preserves disclosure. Desktop/mobile PNGs inspected.

## Budget comparison
Neutral generated files: tests/artifacts/ui-budget-examination-current.json and ui-budget-flow-current.json. Historical ui-budget-baseline.json remains intact. New ui-flow-baseline.json was captured using the same A path on v0.9. All sampled phase text <= v0.9, height <= prior +10%, no overflow, exactly two existing aside panels. Historical artifacts are not deleted or reinterpreted.

Representative A mobile: Opening 161→148 chars / 1210→903px; Closing 213→190 / 1345→931px; Verdict 270→241 / 1300→1043px; examination 187 chars unchanged. Desktop A: Opening 173→156, Closing 225→198, Verdict 282→249 chars. Original examination budget is desktop 191/214 and mobile 183/213 chars. Mobile touch targets add only 4–6px to examination height and stay within the unchanged baseline limit.

## Direct answers to the eight requested questions
1. Does it play continuously like one game? On tested A/B/C/D paths, yes; setup through verdict, reset and a fresh theory run complete without a dead end. This is observed functional flow, not a substitute for human enjoyment testing.
2. Most awkward transition? End of examination sent the player to the sidebar to find the next witness. An in-place action now exposes that next step; Closing citations also lose one nested navigation click.
3. Remaining click-heavy part? Choosing multiple premises for Closing and opening repeated CourtRecord summaries. Automatic citation or record merging would change decisions/trace behavior, so they remain P2.
4. Removed text/elements? Stale witness/exhibit controls, disabled strategy button, duplicated Opening headline, citation disclosure and repeated selection titles, result strength/grading/scope boilerplate, duplicate reset, visible version. Preview return label shortened.
5. Is Verdict concise? Yes: outcome title, two short issue findings, final result sentence; evidence remains collapsed and no extra phase or panel is added.
6. Biggest mobile friction? Old witness information and empty title space pushed current choices down; compact phase views and explicit focus/scroll reduce it. Record sheets remain the main interaction cost.
7. Must-fix UI/UX before v1.0? No blocker found in tested paths. Repeated citation/record navigation needs human playtest feedback, and multi-browser/native mobile testing is not claimed.
8. Can it be fixed as a v1.0 polish candidate? Yes, as a candidate for independent review and human playtest; not final v1.0 approval or a claim of varied shipped verdict outcomes.

## Review focus / limits
Confirm same-phase focus and scroll remain stable, phase focus is not hidden by sticky header, reset leaks nothing, direct citation shortcut never auto-selects evidence, and no engine/data diff exists. Review full text audit for deletions vs preserved substantive record text. D is a clearly labelled synthetic fixture only. No Save/Load, new case, proof route, witness mechanic or excluded system. Unrelated user changes remain untouched; no push.
