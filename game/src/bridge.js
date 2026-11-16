(function (root) {
'use strict';
// PORTFOLIO-001 bridge: 사무소 한 주(경영 엔진)와 공판(재판 엔진)을 잇는 순수 함수.
// 두 엔진은 vendor/ 아래 원본 그대로이며 서로를 모른다. 이 파일만 양쪽 상태를 읽는다.
// 여기의 수치는 실험용 authored 규칙이다(RULES.md). Accepted DEC가 아니다. 무작위 없음.

const CASE_ID = 'jung';
const REVIEW_TASK = 'jung-review';
const ORGANIZE_TASK = 'jung-organize';

// 공판 준비 횟수: 사무소가 정민호 기록 검토를 언제 마쳤는가로 정한다.
const PREP_TIERS = Object.freeze([
  { id: 'on_time', budget: 4, label: '기록 검토를 기한 안에 마쳤습니다', detail: '검토 메모가 제때 책상에 올라와 공판 전 반나절 4번을 모두 쓸 수 있습니다.' },
  { id: 'late', budget: 3, label: '기록 검토가 기한을 넘겼습니다', detail: '검토 메모가 하루 늦어 공판 전 반나절이 4번에서 3번으로 줄었습니다.' },
  { id: 'unfinished', budget: 2, label: '기록 검토를 마치지 못했습니다', detail: '기록을 직접 다시 읽어야 해 공판 전 반나절이 2번만 남았습니다.' }
]);

// 성공보수: 판결 종류별 고정액(원). 착수금은 주간 시작 전에 받은 것으로 본다.
const SUCCESS_FEE = Object.freeze({ acquittal: 3000000, dismissal: 3000000, assault: 1500000, injury: 0 });
const OUTCOME_ORDER = Object.freeze(['injury', 'assault', 'dismissal', 'acquittal']);

function taskOf(state, id) { return state.tasks.find(t => t.id === id) || null; }

// completedDay: 실제 완료일(진행 중이면 forecast의 예상 완료일을 넘긴다). null = 주간 안에 못 끝냄.
function tierFor(completedDay, dueDay) {
  if (completedDay === null || completedDay === undefined) return PREP_TIERS[2];
  return completedDay <= dueDay ? PREP_TIERS[0] : PREP_TIERS[1];
}

function prepFromFirm(state) {
  const review = taskOf(state, REVIEW_TASK);
  if (!review) throw new Error('정민호 기록 검토 업무를 찾을 수 없습니다.');
  const tier = tierFor(review.completedDay, review.dueDay);
  return { tierId: tier.id, budget: tier.budget, label: tier.label, detail: tier.detail,
    completedDay: review.completedDay, dueDay: review.dueDay };
}

// 진행 중 전망: forecast(state).tasks 의 예상 완료일로 같은 규칙을 미리 보여 준다.
function prepOutlook(state, forecast) {
  const review = taskOf(state, REVIEW_TASK);
  const predicted = forecast.tasks.find(t => t.taskId === REVIEW_TASK);
  const day = review.completedDay !== null ? review.completedDay : predicted.predictedCompletionDay;
  const tier = tierFor(day, review.dueDay);
  return { tierId: tier.id, budget: tier.budget, label: tier.label, predictedDay: day, dueDay: review.dueDay,
    settled: review.completedDay !== null };
}

// 사건 정의는 건드리지 않고 사본의 준비 횟수만 바꾼다. 원본 객체는 그대로다.
function caseForTrial(caseDef, budget) {
  if (!Number.isInteger(budget) || budget < 1 || budget > 4) throw new Error('준비 횟수는 1~4여야 합니다.');
  const copy = JSON.parse(JSON.stringify(caseDef));
  Object.values(copy.variants).forEach(v => { v.prep.budget = budget; });
  return copy;
}

// 판결과 한 주의 경영을 하나의 결산으로 묶는다. 엔진 상태는 바꾸지 않는다(읽기 전용).
function settle(firmState, firmSummary, outcomeKey) {
  if (!(outcomeKey in SUCCESS_FEE)) throw new Error('알 수 없는 판결 결과: ' + outcomeKey);
  const fee = SUCCESS_FEE[outcomeKey];
  const kept = firmState.tasks.filter(t => t.completedDay !== null && t.completedDay <= t.dueDay).length;
  const intake = firmState.intake.status;
  return {
    outcomeKey, successFee: fee,
    weekCash: firmSummary.cash, openingCash: firmState.openingCash,
    weekDelta: firmSummary.cash - firmState.openingCash,
    finalCash: firmSummary.cash + fee,
    promisesKept: kept, promisesTotal: firmState.tasks.length,
    refundPaid: firmSummary.refundPaid, intake,
    rank: OUTCOME_ORDER.indexOf(outcomeKey)
  };
}

const api = { CASE_ID, REVIEW_TASK, ORGANIZE_TASK, PREP_TIERS, SUCCESS_FEE, OUTCOME_ORDER,
  tierFor, prepFromFirm, prepOutlook, caseForTrial, settle };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmBridge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
