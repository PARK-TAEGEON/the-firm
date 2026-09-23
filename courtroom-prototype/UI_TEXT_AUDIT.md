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
