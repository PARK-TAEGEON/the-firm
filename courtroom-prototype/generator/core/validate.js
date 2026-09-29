(function (root) {
'use strict';
// GEN-001 — 검증기. Archetype/TwistModule이 generator/core/format.js 형식과 §1.4 진실→증거 규칙을
// 지키는지 확인한다. 문장 품질(모순·어색함)은 다루지 않는다 — 그건 사람이 읽는 완료 기준이다.

const formatModule = (typeof module !== 'undefined' && module.exports) ? require('./format.js') : root.FirmGeneratorFormat;
const { FIELDS, ACTIVATION_OPS } = formatModule;

function isRange(value) {
  return Array.isArray(value) && value.length === 2
    && typeof value[0] === 'number' && typeof value[1] === 'number'
    && value[0] <= value[1];
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

// @returns {string[]} 문제 목록. 비어 있으면 유효하다.
function validateArchetype(archetype) {
  const errors = [];
  if (!archetype || typeof archetype !== 'object') return ['archetype이 객체가 아니다'];

  if (!nonEmptyString(archetype.id) || !archetype.id.startsWith('ARCH_')) errors.push(`id는 'ARCH_' 접두 문자열이어야 한다: ${archetype.id}`);
  if (!nonEmptyString(archetype.title)) errors.push('title이 비어 있다');
  if (!FIELDS.includes(archetype.field)) errors.push(`field가 GEN-001 범위 밖이다: ${archetype.field}`);
  if (!nonEmptyString(archetype.side)) errors.push('side가 비어 있다');

  if (!archetype.fee || !isRange(archetype.fee.retainer)) errors.push('fee.retainer 범위가 유효하지 않다');
  if (!archetype.fee || !isRange(archetype.fee.success_pct)) errors.push('fee.success_pct 범위가 유효하지 않다');
  if (!isRange(archetype.duration_weeks)) errors.push('duration_weeks 범위가 유효하지 않다');
  if (!isRange(archetype.claim_amount)) errors.push('claim_amount 범위가 유효하지 않다');

  const issueIds = new Set();
  if (!Array.isArray(archetype.issues) || archetype.issues.length === 0) {
    errors.push('issues는 최소 1개 이상이어야 한다');
  } else {
    for (const issue of archetype.issues) {
      if (!nonEmptyString(issue.id)) { errors.push('issue.id가 비어 있다'); continue; }
      if (issueIds.has(issue.id)) errors.push(`issue.id 중복: ${issue.id}`);
      issueIds.add(issue.id);
      if (!nonEmptyString(issue.question)) errors.push(`issue ${issue.id}: question이 비어 있다`);
      if (!Array.isArray(issue.evidence) || issue.evidence.length === 0) errors.push(`issue ${issue.id}: evidence가 비어 있다`);
    }
  }

  if (!Array.isArray(archetype.defenses)) errors.push('defenses가 배열이 아니다');
  if (!Array.isArray(archetype.twists_allowed)) errors.push('twists_allowed가 배열이 아니다');

  if (!archetype.truth_params || typeof archetype.truth_params !== 'object') {
    errors.push('truth_params가 없다');
  } else {
    for (const [key, range] of Object.entries(archetype.truth_params)) {
      if (!isRange(range)) errors.push(`truth_params.${key} 범위가 유효하지 않다`);
    }
  }

  if (!Array.isArray(archetype.evidence_strength_rules) || archetype.evidence_strength_rules.length === 0) {
    errors.push('evidence_strength_rules가 비어 있다');
  } else {
    const coveredIssues = new Set();
    for (const rule of archetype.evidence_strength_rules) {
      if (!issueIds.has(rule.issueId)) errors.push(`evidence_strength_rules: issueId가 archetype.issues에 없다: ${rule.issueId}`);
      if (!archetype.truth_params || !(rule.truthParam in archetype.truth_params)) errors.push(`evidence_strength_rules: truthParam이 truth_params에 없다: ${rule.truthParam}`);
      if (!['direct', 'inverse'].includes(rule.direction)) errors.push(`evidence_strength_rules: direction이 유효하지 않다: ${rule.direction}`);
      if (!isRange(rule.strengthRange)) errors.push(`evidence_strength_rules(${rule.issueId}): strengthRange 범위가 유효하지 않다`);
      if (typeof rule.noise !== 'number' || rule.noise < 0) errors.push(`evidence_strength_rules(${rule.issueId}): noise가 유효하지 않다`);
      coveredIssues.add(rule.issueId);
    }
    for (const issueId of issueIds) {
      if (!coveredIssues.has(issueId)) errors.push(`issue ${issueId}에 대응하는 evidence_strength_rules가 없다`);
    }
  }

  return errors;
}

// @returns {string[]} 문제 목록. 비어 있으면 유효하다. archetype 검증도 함께 실행한다.
function validateTwist(archetype, twist) {
  const errors = validateArchetype(archetype);
  if (!twist || typeof twist !== 'object') return [...errors, 'twist가 객체가 아니다'];

  if (!nonEmptyString(twist.id) || !twist.id.startsWith('TWIST_')) errors.push(`twist.id는 'TWIST_' 접두 문자열이어야 한다: ${twist.id}`);
  if (!nonEmptyString(twist.title)) errors.push('twist.title이 비어 있다');
  if (!Array.isArray(twist.appliesTo) || twist.appliesTo.length === 0) errors.push('twist.appliesTo가 비어 있다');
  if (!(twist.appliesTo || []).includes(archetype.id) && !(twist.appliesTo || []).includes('ANY')) {
    errors.push(`twist.appliesTo에 ${archetype.id}(또는 'ANY')가 없다`);
  }

  const issueIds = new Set((archetype.issues || []).map((i) => i.id));
  if (!issueIds.has(twist.targetIssue)) errors.push(`twist.targetIssue가 archetype.issues에 없다: ${twist.targetIssue}`);

  if (!twist.activation || !nonEmptyString(twist.activation.param)) {
    errors.push('twist.activation.param이 비어 있다');
  } else if (!archetype.truth_params || !(twist.activation.param in archetype.truth_params)) {
    errors.push(`twist.activation.param이 truth_params에 없다: ${twist.activation.param}`);
  }
  if (!twist.activation || !ACTIVATION_OPS.includes(twist.activation.op)) errors.push(`twist.activation.op가 유효하지 않다: ${twist.activation && twist.activation.op}`);
  if (!twist.activation || typeof twist.activation.value !== 'number') errors.push('twist.activation.value가 숫자가 아니다');

  if (!nonEmptyString(twist.truthEffect)) errors.push('twist.truthEffect가 비어 있다');

  const card = twist.investigationCard;
  if (!card) {
    errors.push('twist.investigationCard가 없다');
  } else {
    if (!nonEmptyString(card.investigationId)) errors.push('investigationCard.investigationId가 비어 있다');
    if (!nonEmptyString(card.investigationTitle)) errors.push('investigationCard.investigationTitle이 비어 있다');
    if (typeof card.cost !== 'number' || card.cost <= 0) errors.push('investigationCard.cost가 유효하지 않다');
    if (!nonEmptyString(card.cardId)) errors.push('investigationCard.cardId가 비어 있다');
    if (!nonEmptyString(card.cardTitle)) errors.push('investigationCard.cardTitle이 비어 있다');
    if (!nonEmptyString(card.cardText)) errors.push('investigationCard.cardText가 비어 있다');
  }

  for (const [label, part] of [['opponentRecovery', twist.opponentRecovery], ['playerCounter', twist.playerCounter]]) {
    if (!part || !nonEmptyString(part.text)) { errors.push(`twist.${label}.text가 비어 있다`); continue; }
    if (!part.effect || part.effect.issue !== twist.targetIssue) errors.push(`twist.${label}.effect.issue가 targetIssue와 다르다`);
    if (!part.effect || typeof part.effect.delta !== 'number' || part.effect.delta === 0) errors.push(`twist.${label}.effect.delta가 0이거나 숫자가 아니다`);
  }

  return errors;
}

const validateModule = { validateArchetype, validateTwist };
if (typeof module !== 'undefined' && module.exports) module.exports = validateModule; else root.FirmGeneratorValidate = validateModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
