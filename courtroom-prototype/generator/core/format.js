(function (root) {
'use strict';
// GEN-001 — 사건 생성기 데이터 형식.
// 이 파일은 형식 정의만 담는다. 생성 로직·RNG·검증기는 포함하지 않는다 (다음 단계).
// 참고: docs/DESIGN-NOTES-2026-09.md §1, courtroom-prototype/data/trial-case.js (승부 사건 출력 형식 목표)

/**
 * @typedef {Object} Archetype
 * 사건 = 원형 × 변수 × 반전 × 인물 (DESIGN-NOTES §1.3). 원형은 실제 판결문 여러 건에서
 * 추출한 법적 뼈대다. 실명·날짜·장소를 복원하지 않는다 (§1.5).
 * @property {string} id                 - 'ARCH_' 접두. 영구 ID, 재사용 금지.
 * @property {string} title              - 한글 제목.
 * @property {'criminal_assault'|'dui'|'lease_deposit'} field - GEN-001 범위 3개 분야.
 * @property {string} side               - 플레이어 의뢰인의 편 (예: '원고(임차인)', '피고인').
 * @property {{ retainer: [number, number], success_pct: [number, number] }} fee - retainer는 만원, success_pct는 %.
 * @property {[number, number]} duration_weeks
 * @property {ArchetypeIssue[]} issues   - 최소 1개. 승부 사건 전환 시 trial-case.js의 issues[]가 된다.
 * @property {string[]} defenses         - 상대측이 흔히 쓰는 항변 (authored 문구 후보).
 * @property {string[]} twists_allowed   - 이 원형에 붙을 수 있는 TwistModule id 목록.
 * @property {Object<string, [number, number]>} truth_params - 숨은 진실 파라미터. 원형마다 authored, 시드로 값 확정.
 */

/**
 * @typedef {Object} ArchetypeIssue
 * @property {string} id           - 사건 내 고유. 'ISSUE_' 접두 권장.
 * @property {string} question     - trial-case.js issues[].question과 같은 역할.
 * @property {string[]} evidence   - 흔한 증거 유형 후보 (authored). 실제 사건은 이 중 일부만 채택한다.
 */

/**
 * @typedef {Object} TwistModule
 * 반전 하나 = 대응 조사 카드 + 상대의 수습 + 재반대 한 세트 (DESIGN-NOTES §1.3).
 * v0.10 trial-case.js의 "간판 불빛 수습 ↔ 조도 측정 카드"가 이 구조의 원형이다.
 * @property {string} id                 - 'TWIST_' 접두.
 * @property {string} title
 * @property {string[]} appliesTo        - Archetype id 목록, 또는 ['ANY'].
 * @property {string} truthEffect        - 숨은 진실에 추가/변경되는 사실 (authored 서술; 진실을 먼저 만든다 — §1.4).
 * @property {TwistInvestigationCard} investigationCard - trial-case.js investigations[]+cards[] 한 쌍에 대응.
 * @property {TwistRecovery} opponentRecovery - 상대가 카드 없이도 먼저 내놓는 수습. trial-case.js redirect[].lines에 대응.
 * @property {TwistCounter} playerCounter     - 카드를 확보했을 때만 가능한 재반박. trial-case.js redirect[].rebuttal에 대응.
 */

/**
 * @typedef {Object} TwistInvestigationCard
 * @property {string} investigationTitle - 조사 항목 제목 (trial-case.js investigations[].title).
 * @property {number} cost               - 반나절 단위.
 * @property {string} cardTitle          - 카드 제목 (trial-case.js cards[].title).
 * @property {string} cardText           - 카드 본문.
 */

/**
 * @typedef {Object} TwistRecovery
 * @property {string} text - 카드 없이 진행됐을 때 상대가 먼저 주장하는 수습 문구.
 */

/**
 * @typedef {Object} TwistCounter
 * @property {string} text - 카드를 확보했을 때만 가능한 재반박 문구.
 */

/**
 * @typedef {Object} PersonSlot
 * 인물(의뢰인·상대·증인)의 변수 범위. 값은 시드 기반 결정적 난수로 확정한다 (§1.3).
 * @property {'client'|'opponent'|'witness'} role
 * @property {Object<string, [number, number]>} traitRanges - 예: { reliability: [0,1], hostility: [0,1] }.
 */

/**
 * @typedef {'daily'|'contested'|'signature'} CaseGrade
 * - daily: 완전 절차 생성. 요약 파일 출력 (등급표 §1.2).
 * - contested: 원형 + 반전 모듈. trial-case.js 형식 출력.
 * - signature: 전부 직접 작성. 생성기 범위 밖 (구현 대상 아님).
 */

/**
 * @typedef {Object} DailyCaseSummary
 * 일상 사건 출력 (요약 파일). 수임·배정·합의 여부 판단에만 쓰인다.
 * @property {string} id
 * @property {string} archetypeId
 * @property {number} seed
 * @property {string} title
 * @property {{ retainer: number, success_pct: number }} fee  - 원형 범위에서 시드로 확정된 값.
 * @property {number} durationWeeks
 * @property {string} outcomeSummary
 */

/**
 * @typedef {Object} ContestedCaseOutput
 * 승부 사건 출력. courtroom-prototype/data/trial-case.js와 같은 형식으로 만든다 — 이 typedef는
 * trial-case.js의 필드를 다시 선언하지 않고 원형/반전 필드가 어디로 흘러가는지만 적는다.
 *
 * 대응표:
 *   trialCase.id / title / charge   ← archetype.id / title + 확정된 인물명
 *   trialCase.issues                ← archetype.issues (baseline은 truth_params에서 파생)
 *   trialCase.investigations/cards  ← 선택된 TwistModule[].investigationCard들의 합
 *   trialCase.witnesses[].redirect  ← 선택된 TwistModule.opponentRecovery / .playerCounter
 *   trialCase.adjudication.required ← archetype.issues 전체 id
 */

const CASE_GRADES = ['daily', 'contested', 'signature'];
const FIELDS = ['criminal_assault', 'dui', 'lease_deposit'];

const formatModule = { CASE_GRADES, FIELDS };
if (typeof module !== 'undefined' && module.exports) module.exports = formatModule; else root.FirmGeneratorFormat = formatModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
