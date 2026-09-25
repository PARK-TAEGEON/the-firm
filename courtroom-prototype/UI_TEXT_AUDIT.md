# v0.65 UI text audit

Audited actual rendered desktop/mobile screens and new strings in ui/app.js and data/case.js. No new permanent panel, tutorial, completion mark, strength badge, risk label or gauge.

- Retained four authored question sentences per witness: the wording is the player's scope decision, so shortening to “좁음/넓음” would remove necessary information.
- Reused “확답을 요구한다”, “신문을 마친다”, “질문으로”, “이 논점을 남긴다”. Normal screen adds only the conclusion-entry action.
- Removed pre-Press strength from conclusion tooltip and inference detail. Core/peripheral label also removed from that detail; theory remains in the case panel and record evaluation.
- Removed default form “그대로 요청 → 기록 연결” duplicate. The existing address engine is exercised separately by an authored fixture with no competing direct-basis route.
- Single remaining question is a direct intention control. Exhausted topics disappear; no completion badge.
- “근거” is the short sibling selection control in composition only; accessible label includes the record's name. Disclosure still opens testimony. Selection controls are hidden during claim choice.
- Relation wording (“범위를 한정함”, “뜻을 설명함”, “앞선 진술과 충돌”, “앞선 진술을 물림”) appears only in record detail. It identifies how the new testimony relates to earlier testimony; no permanent status label.
- Narrative and excessive-conclusion statements retain the distinction between inability to prove use and proof of non-use. Removing that distinction would conceal the consequence of the question.
- Still removable: repeated premise text inside advocacy detail and generic “이번 신문…” hard-counter explanation. Left in collapsed detail for provenance; neither is an always-visible instruction. No further always-visible explanatory sentence was added.

Measured with the same three facts and viewports as released v0.6, fonts ready:

| View | v0.6 chars → v0.65 | Document px | Examination px |
|---|---:|---:|---:|
| Desktop normal | 185 → 189 | 1080 → 1080 | 189 → 187 |
| Desktop argument | 205 → 212 | 1080 → 1080 | 217 → 213 |
| Mobile normal | 173 → 176 | 1148 → 1136 | 181 → 179 |
| Mobile argument | 200 → 206 | 1272 → 1194 | 251 → 237 |

No horizontal overflow; desktop lane ends at 960px within 1080px. Claim choice is a temporary four-question list and is not included in the ordinary-screen character budget. Mobile full-page captures require scrolling; this is not a claim that every action fits one phone viewport. Screens inspected: claim choice, successful admission/overreach, mobile claims and record material sheet.

Pretendard variable font is bundled from official v1.3.9; SIL OFL accompanies it. Source: https://github.com/orioncactus/pretendard/tree/v1.3.9 . No runtime external font requests. Noto Serif KR is not bundled: installed font or Batang/serif fallback is used. Visual separation was inspected; no user study of immersion was performed.

## v0.7 Opening text audit (2026-09-23)

Opening reuses #scene and #examination: four short legends (인정 / 다툼 / 강조 / 소개할 논증), authored position fragments, one action 이 입장으로 시작. No finished-speech choices, checkmarks, badges, numerical gauges, recommended opening or tutorial panel. Selection uses existing chip styling and aria-pressed.

CourtRecord disclosure titles add 개회사 / 공개 입장 / 전략 변경 / 공개 입장과 충돌. Full statements and conflict text appear inside existing collapsed record details. No additional permanent panel. Errors appear only after invalid submission. Focus is restored after opening selection/strategy changes; the opening speech uses the small existing live region.

Existing examination budget unchanged: desktop 195/218 visible characters (normal/argument), mobile 183/213; no horizontal overflow. Opening screenshots checked at 1440×1080, 1280×720 and 390×844. Mobile uses existing vertical scrolling; no new overlay or navigation system.

## v0.8 Closing UI audit

Center/action region becomes 최종변론 준비; 중심 쟁점 chips plus three disclosures: 사용할 논증 / 인용과 약점 대응 / 개회사 입장. CourtRecord gains phase-local 인용 / 다룬다 buttons, with original witness records kept readable. Public-position select offers omission, maintenance or authored fragments, never complete final speeches. Preview assembles the selected material and can be edited before publication. No badges, scores, strength/recommendation text or permanent panel. Closing-specific fragments avoid promises to conduct future examination.

Closing preparation choices remain below 100 visible characters when collapsed. Existing examination budget remains desktop 195/218 and mobile 183/213 visible characters. Existing record panel scroll is bounded only in Closing, including mobile sheet; selection focus and panel scroll preserved. Long final speech is content, not tutorial/status explanation; repeated qualification sentences are removed. Large/short/mobile screenshots reviewed.

## v0.8.1 correction audit

Accessible courtroom name: 法廷 phase-neutral Korean 법정 진행, replacing 반대신문. No visible instructional text or panel added. Identical final public-position sentences occur once in generated speech; source revision/conflict disclosure remains complete. Existing UI budget retained.
Final version-label budget: desktop 197/220 characters, mobile 183/213. Original budget limits unchanged, all 14 pass. Mobile no-Closing resolved screenshot visually reviewed.

## v0.9 adjudication UI audit

판결을 듣는다 is the one phase-local action after Closing or completed no-Closing examinations. The courtroom center shows the authored outcome and required-issue reasoning; 판단 근거 disclosures list only recorded testimony. Existing record panel gets a collapsed 판결 item. No new persistent panel, score/checkmark/strength/recommendation or long judgment. Mobile decision title receives focus and is scrolled clear of the sticky header. Verdict center budget: under 280 characters collapsed; original examination budget retained. Desktop/short/mobile screenshots inspected.

## v0.9.1 full-flow text audit

Audited Theory, Opening, question/Claim, CourtRecord, objection/basis, witness completion, Closing preview/publication, Findings/Verdict and reset at desktop/short/mobile. Authored testimony, question options, case facts and reasoning are unchanged; substantive record text is never edited to simplify an outcome.

| Text/element | Decision and purpose |
| --- | --- |
| Witness tabs and exhibit cards outside examination | Hidden; these referred to the last witness during Opening/Closing/Verdict. Existing case/record remain. |
| Disabled 전략 button | Removed when strategy is unavailable; no repeated status explanation. |
| Opening speech as first witness headline | Moved out of the current headline; original speech remains in dialogue/record. Witness name identifies who receives the next question. |
| Large empty preparation headline space | Reduced in Opening/Closing; choices become visible sooner. |
| Claim questions | Kept actual question sentences. No difficulty labels, correct-answer hints, checkmarks or new claims. |
| Closing 인용과 약점 대응 disclosure + 기록에서 고른다 | Replaced with one 인용과 반박을 고른다 action. Removes one navigation click per opening of citations. |
| Repeated chosen citation titles outside CourtRecord | Removed; actual selected records retain aria-pressed. No automatic evidence selection. |
| 개회사 입장 / 사용할 논증 | Kept collapsed; meaningful player decisions with full record trace preserved. |
| 돌아가서 수정 | Shortened to 수정; action unchanged. |
| Witness result 강함/제한적, remaining-issue grading and long resolutionNotice | Removed from disclosure; scoped result reasoning/Frame titles remain. Test checks actual issue scope and absence of verdict instead of the removed disclaimer. |
| 다시 신문 | Replaced with 다시 시작 to reflect whole-run reset. Duplicate footer reset hidden when center reset exists. |
| COURTROOM / version | Visible version removed; package and document title retain version. |
| Verdict title + issue findings + short conclusion | Kept, reordered to put final reasoning after findings. Evidence detail stays closed. No new rewritten facts. |
| CourtRecord summaries / full testimony / procedural transactions | Kept because records differ even when summary labels repeat. No trace deduplication. |
| Validation errors and objection/basis actions | Kept transient and contextual, never a permanent tutorial panel. |
| CaseTheory / objectives / case facts | Kept in existing disclosure; no score or recommended strategy. |
| aria-live / region labels | 법정 진행 stays phase-neutral. Announcements stay limited to actual utterances; selection/reset checks retained. |

New text: [next witness name]에게 묻는다 exposes an existing action; no new system. Full-flow visible text is no greater than v0.9 in every sampled phase/viewport. Record-only semantics and engine/data hashes are unchanged.
