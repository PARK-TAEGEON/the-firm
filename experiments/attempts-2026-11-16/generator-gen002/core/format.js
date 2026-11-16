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
 * @property {[number, number]} claim_amount - 만원. 청구금액(예: 보증금 원금). fee.retainer(착수금)와 다른 값 — 혼동 금지.
 * @property {ArchetypeIssue[]} issues   - 최소 1개. 승부 사건 전환 시 trial-case.js의 issues[]가 된다.
 * @property {string[]} defenses         - 상대측이 흔히 쓰는 항변 (authored 문구 후보).
 * @property {string[]} twists_allowed   - 이 원형에 붙을 수 있는 TwistModule id 목록.
 * @property {Object<string, [number, number]>} truth_params - 숨은 진실 파라미터. 원형마다 authored, 시드로 값 확정.
 * @property {EvidenceStrengthRule[]} evidence_strength_rules - 쟁점별 truth_params → 증거 강도 도출 규칙 (§1.4).
 */

/**
 * @typedef {Object} ArchetypeIssue
 * @property {string} id           - 사건 내 고유. 'ISSUE_' 접두 권장.
 * @property {string} question     - trial-case.js issues[].question과 같은 역할.
 * @property {string[]} evidence   - 흔한 증거 유형 후보 (authored). 실제 사건은 이 중 일부만 채택한다.
 */

/**
 * @typedef {Object} EvidenceStrengthRule
 * 진실→증거 도출 규칙 (§1.4 "진실에서 증거·증언·서류를 도출. 잡음 필터를 거친다").
 * 방향 규약: strength 값이 높을수록 원형의 side 반대편(opponent)에게 유리하다. TwistModule의
 * recovery/counter delta 부호 규약과 동일하다 — 양수 delta·높은 strength = 상대에게 유리.
 * @property {string} issueId     - ArchetypeIssue.id.
 * @property {string} truthParam  - archetype.truth_params의 키.
 * @property {'direct'|'inverse'} direction - direct: truth 값이 클수록 strength도 커진다. inverse: 반대.
 * @property {[number, number]} strengthRange - trial-case.js issues[].baseline과 같은 척도 (보통 [1,7]).
 * @property {number} noise       - 잡음 폭. 최종 strength = base ± (0~noise) 균등분포, seed로 결정.
 */

/**
 * @typedef {Object} TwistModule
 * 반전 하나 = 대응 조사 카드 + 상대의 수습 + 재반대 한 세트 (DESIGN-NOTES §1.3).
 * v0.10 trial-case.js의 "간판 불빛 수습 ↔ 조도 측정 카드"가 이 구조의 원형이다.
 * 아래 기계적 필드는 trial-case.js의 witnesses[].redirect[] 항목 하나로 그대로 변환하기 위한 것이다:
 *   targetIssue + opponentRecovery(+text/effect) → redirect 항목 본체 (delta, lines, tone)
 *   investigationCard.cardId + playerCounter(+text/effect) → redirect[].rebuttal (card, delta, lines)
 * @property {string} id                 - 'TWIST_' 접두.
 * @property {string} title
 * @property {string[]} appliesTo        - Archetype id 목록, 또는 ['ANY'].
 * @property {string} targetIssue        - 이 반전이 흔드는 ArchetypeIssue.id. appliesTo 원형에 실재해야 한다.
 * @property {TwistActivation} activation - 진실 값 조건. 만족해야 이 반전이 사건에 실제로 붙는다.
 * @property {string} truthEffect        - 숨은 진실에 추가/변경되는 사실 (authored 서술; 진실을 먼저 만든다 — §1.4).
 * @property {TwistInvestigationCard} investigationCard - trial-case.js investigations[]+cards[] 한 쌍에 대응.
 * @property {TwistRecovery} opponentRecovery - 상대가 카드 없이도 먼저 내놓는 수습. trial-case.js redirect[] 본문에 대응.
 * @property {TwistCounter} playerCounter     - 카드를 확보했을 때만 가능한 재반박. trial-case.js redirect[].rebuttal에 대응.
 */

/**
 * @typedef {Object} TwistActivation
 * @property {string} param  - archetype.truth_params의 키.
 * @property {'>='|'<='|'>'|'<'|'=='} op
 * @property {number} value
 */

/**
 * @typedef {Object} TwistInvestigationCard
 * @property {string} investigationId    - trial-case.js investigations[].id.
 * @property {string} investigationTitle - 조사 항목 제목 (trial-case.js investigations[].title).
 * @property {number} cost               - 반나절 단위.
 * @property {string} cardId             - trial-case.js cards[].id. playerCounter/rebuttal이 이 id를 요구한다.
 * @property {string} cardTitle          - 카드 제목 (trial-case.js cards[].title).
 * @property {string} cardText           - 카드 본문.
 */

/**
 * @typedef {Object} TwistRecovery
 * @property {string} text - 카드 없이 진행됐을 때 상대가 먼저 주장하는 수습 문구.
 * @property {{ issue: string, delta: number }} effect - 쟁점 판세 변화. issue는 targetIssue와 같아야 한다.
 *   양수 delta = 상대에게 유리. trial-case.js redirect[].delta에 대응.
 */

/**
 * @typedef {Object} TwistCounter
 * @property {string} text - 카드를 확보했을 때만 가능한 재반박 문구.
 * @property {{ issue: string, delta: number }} effect - 쟁점 판세 변화. 보통 음수(플레이어에게 유리).
 *   trial-case.js redirect[].rebuttal.delta에 대응.
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
 * GEN-001 2단계 사람 결정: 이번 버전에서는 형사 원형만 이 출력을 만든다(REPORT.md).
 *
 * 두 생성원이 있다 (generator/core/contested.js):
 *   1) 기계적 템플릿 — archetype.issues[].evidence 각 항목 → investigation/card/approach 한 세트.
 *      항상 생성된다(반전과 무관).
 *   2) activation을 만족한 TwistModule만 — selectActivatedTwists가 archetype.twists_allowed 중
 *      truth 조건을 만족하는 것만 고른다. 없으면 반전 없는 사건이 된다.
 *
 * 대응표:
 *   trialCase.id / title / charge     ← archetype.id / title
 *   trialCase.issues                  ← archetype.issues (baseline은 evidence_strength_rules로 truth_params에서 파생)
 *   trialCase.investigations/cards    ← 템플릿(evidence 항목별) + 활성화된 TwistModule[].investigationCard의 합
 *   trialCase.witnesses[].approaches  ← 템플릿(evidence 항목별, requiresAny로 카드 연결) + 활성화된 twist가 있으면
 *                                        stance 충돌 접근법(byStance 전부 0 + stanceConflict, S_DENY에서만 발동)
 *   trialCase.witnesses[].direct      ← 소개 1개 + 이의 창 1개(proper/improper, 쟁점 인덱스로 교대)
 *   trialCase.witnesses[].presses     ← limited(minPoints = evidence 개수) + overreach(항상 실패) 2개
 *   trialCase.witnesses[].redirect    ← 활성화된 TwistModule.opponentRecovery / .playerCounter만 (비활성 twist는 없음)
 *   trialCase.opening.focus           ← 균형 1개 + archetype.issues별 1개(쟁점 증인 +1·나머지 -1 시간)
 *   trialCase.opening.stance          ← 고정 3개: S_CONTEST/S_ADMIT/S_DENY
 *   trialCase.prep.budget             ← max(2, round(조사 총비용 × 0.6)) — 총비용보다 작다(전부 조사 불가)
 *   trialCase.roles / guilty.title    ← KO_PACK (contested.js) — DEC-LITIGATION-032 D3 한국 고유 명칭 자리
 *   trialCase.adjudication.required   ← archetype.issues 전체 id
 *
 * generator/content/hearing-copy.js가 focus[쟁점id]/stance.{contest,admit,deny}/witnesses[쟁점id].
 * {proper,improper,overreach} 슬롯 이름으로 이 구조에 맞춰 문구를 제공한다(2026-09-30 core 수정,
 * REPORT.md 2026-09-30 절 참고). 문구 연결은 generator/content/index.js가 한다 — 이 파일은 형식만 정의한다.
 */

const CASE_GRADES = ['daily', 'contested', 'signature'];
const FIELDS = ['criminal_assault', 'dui', 'lease_deposit', 'criminal_catalog'];
const ACTIVATION_OPS = ['>=', '<=', '>', '<', '=='];

// TwistActivation 평가. 순수 함수 — RNG 없음. 시드로 확정된 truth 값에만 의존하므로 결정적이다.
function evaluateActivation(activation, truth) {
  const value = truth[activation.param];
  switch (activation.op) {
    case '>=': return value >= activation.value;
    case '<=': return value <= activation.value;
    case '>': return value > activation.value;
    case '<': return value < activation.value;
    case '==': return value === activation.value;
    default: throw new Error(`알 수 없는 activation.op: ${activation.op}`);
  }
}

// EvidenceStrengthRule → 잡음 적용 전 base strength. 순수 함수 — RNG 없음.
// 잡음(±noise)은 seed 기반 rng가 필요하므로 generate.js에서 이 값 위에 더한다.
function computeBaseStrength(rule, truthValue) {
  const [min, max] = rule.strengthRange;
  const t = rule.direction === 'inverse' ? (1 - truthValue) : truthValue;
  return min + t * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const formatModule = { CASE_GRADES, FIELDS, ACTIVATION_OPS, evaluateActivation, computeBaseStrength, clamp };
if (typeof module !== 'undefined' && module.exports) module.exports = formatModule; else root.FirmGeneratorFormat = formatModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
