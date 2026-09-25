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
