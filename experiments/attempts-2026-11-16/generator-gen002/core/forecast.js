'use strict';
// A deliberately coarse estimate, not a second hearing. No engine/service imports.
const labels = { proven: '입증 유지', shaken: '다툼', doubt: '의심' };
function publicForecastInput(view, { targetIssue, skill = 'experienced' } = {}) {
  const target = view.projection.issues.find(i => i.id === targetIssue);
  if (!target) throw Error('unknown target issue');
  // The existing UI hides baseline bands until a hearing record supplies a note.
  const started = view.state.phase === 'trial' || view.state.phase === 'verdict';
  return {
    skill, targetIssue: target.id,
    issues: view.projection.issues.map(i => ({ id: i.id, title: i.title,
      band: started && i.notes.length ? labels[i.band] : '아직 심리 전' })),
    investigations: view.investigations.map(i => ({ title: i.title, done: i.done })),
    cards: view.cards.map(c => ({ id: c.id, title: c.title, text: c.text,
      issueId: c.assessment.issueId, kind: c.assessment.kind, finding: c.assessment.finding }))
  };
}
function forecastFromPublic(input) {
  if (!['novice', 'experienced'].includes(input.skill)) throw Error('unknown automatic policy');
  const issue = input.issues.find(i => i.id === input.targetIssue);
  if (!issue) throw Error('unknown public target');
  const cards = input.cards.filter(c => c.issueId === input.targetIssue);
  const basic = new Set(cards.filter(c => c.kind === 'foundation').map(c => c.id));
  let band;
  if (issue.band === '의심') band = '유리';
  else if (basic.size === 0) band = '다툼';
  else if (basic.size < 2 || issue.band === '입증 유지') band = '다툼';
  else band = '유리';
  const coverage = input.issues.map(i => new Set(input.cards
    .filter(c => c.issueId === i.id && c.kind === 'foundation' && c.finding === 'observation')
    .map(c => c.id)).size);
  const knownAdverse = input.cards.some(c => input.issues.some(i => i.id === c.issueId)
    && c.kind === 'response' && c.finding === 'additional');
  const missing = coverage.some(n => n === 0);
  // Preparation bands only: never infer a future verdict or inspect unheld discoveries.
  if (missing || knownAdverse) band = '불리';
  else if (input.skill === 'novice') {
    if (coverage.every(n => n >= 2) && input.issues.every(i => i.band !== '입증 유지')) band = '유리';
    else if (coverage[input.issues.findIndex(i => i.id === input.targetIssue)] >= 2 && issue.band !== '입증 유지') band = '정석';
    else band = '변수';
  } else if (band === '다툼') band = '변수';
  const pending = input.investigations.some(i => !i.done);
  const explanation = input.skill === 'novice' ? [
    missing ? '대표님, 우리 자료가 없는 핵심 쟁점이 남아 있어 불리하게 보고 있습니다.' :
      knownAdverse ? '대표님, 확보한 자료에서 상대의 강한 반박 근거가 확인되어 불리하게 보고 있습니다.' :
      band === '유리' ? '대표님, 핵심 쟁점마다 서로 대조할 근거를 확보했고, 현재 확인된 강한 반박 자료가 없어 유리하게 보고 있습니다.' :
      band === '정석' ? '대표님, 주력 쟁점을 다툴 근거는 갖췄습니다. 나머지 쟁점은 자료를 더 보완해야 합니다.' :
        '대표님, 핵심 쟁점의 자료는 있지만 충분히 대조하지 못해 변수가 남아 있습니다.',
    missing && knownAdverse ? '확보한 자료에서도 상대의 강한 반박 근거가 확인됐습니다.' : '',
    pending ? '남은 조사에서 새로운 사실이 확인되면 전망이 달라질 수 있습니다.' : '확보한 자료를 신문에서 어떻게 연결하느냐에 따라 결과가 달라질 수 있습니다.',
    '현재 전망으로 결과를 확정할 수는 없습니다.'
  ].filter(Boolean).join(' ') : [
    missing ? '대표님, 우리 자료가 없는 핵심 쟁점이 남아 있습니다.' : '대표님, 확보한 자료를 바탕으로 보고드립니다.',
    basic.size >= 2 ? '선택한 쟁점을 서로 다른 자료로 다툴 준비가 되어 있습니다.' :
      basic.size ? '쟁점에 연결할 자료가 있지만 증언을 한정할 근거는 더 필요합니다.' : '선택한 쟁점을 뒷받침할 조사 자료가 없습니다.',
    knownAdverse ? '확보한 추가 자료에는 상대의 강한 반박 근거가 있어 대응이 필요합니다.' : '',
    issue.band === '아직 심리 전' ? '아직 법정에서 확인한 판세는 없습니다.' : `현재 판세는 ${issue.band}입니다.`,
    pending ? '남은 조사가 있어 새로운 사실이 나오면 전망은 달라질 수 있습니다.' : '조사를 마쳤어도 신문에서 자료를 어떻게 연결하느냐에 따라 결과는 달라집니다.'
  ].filter(Boolean).join(' ');
  return { band, explanation };
}
// Actual hearings retain their existing three bands; both middle forecasts describe a contest.
function comparableForecastBand(band) {
  return ['정석', '변수'].includes(band) ? '다툼' : band;
}
module.exports = { publicForecastInput, forecastFromPublic, comparableForecastBand };
