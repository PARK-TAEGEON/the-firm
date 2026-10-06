'use strict';
// A deliberately coarse estimate, not a second hearing. No engine/service imports.
const labels = { proven: '입증 유지', shaken: '다툼', doubt: '의심' };
function publicForecastInput(view, { targetIssue, skill = 'experienced' } = {}) {
  const target = view.projection.issues.find(i => i.id === targetIssue);
  if (!target) throw Error('unknown target issue');
  // The existing UI hides baseline bands until a hearing record supplies a note.
  const started = view.state.phase === 'trial' || view.state.phase === 'verdict';
  return {
    skill, target: target.title,
    issues: view.projection.issues.map(i => ({ title: i.title,
      band: started && i.notes.length ? labels[i.band] : '아직 심리 전' })),
    investigations: view.investigations.map(i => ({ title: i.title, done: i.done })),
    cards: view.cards.map(c => ({ title: c.title, text: c.text, appearance: c.text.split('\n')[1] }))
  };
}
function forecastFromPublic(input) {
  if (!['novice', 'experienced'].includes(input.skill)) throw Error('unknown automatic policy');
  const issue = input.issues.find(i => i.title === input.target);
  if (!issue) throw Error('unknown public target');
  const cards = input.cards.filter(c => c.text.split('\n')[0] === input.target);
  const basic = new Set(cards.filter(c => c.appearance === '신문 자료').map(c => c.title));
  const adverse = cards.filter(c => c.appearance === '수습 대응 자료' && c.text.split('\n')[2] === '추가 확인 사항 있음');
  let band;
  if (issue.band === '의심') band = '유리';
  else if (basic.size === 0) band = '불리';
  else if (basic.size < 2 || input.skill === 'novice' || issue.band === '입증 유지') band = '다툼';
  else band = '유리';
  // A novice does not execute a rebuttal. Discovered adverse material can worsen an estimate.
  if (input.skill === 'novice' && adverse.length) band = '불리';
  const pending = input.investigations.some(i => !i.done);
  const explanation = [
    basic.size >= 2 ? '선택한 쟁점을 서로 다른 자료로 다툴 준비가 되어 있습니다.' :
      basic.size ? '쟁점에 연결할 자료가 있지만 증언을 한정할 근거는 더 필요합니다.' : '선택한 쟁점을 뒷받침할 조사 자료가 없습니다.',
    adverse.length ? '확보한 추가 자료에는 상대가 이용할 내용도 있어 대응이 필요합니다.' : '',
    issue.band === '아직 심리 전' ? '아직 법정에서 확인한 판세는 없습니다.' : `현재 판세는 ${issue.band}입니다.`,
    pending ? '남은 조사가 있어 새로운 사실이 나오면 전망은 달라질 수 있습니다.' : '조사를 마쳤어도 신문에서 자료를 어떻게 연결하느냐에 따라 결과는 달라집니다.'
  ].filter(Boolean).join(' ');
  return { band, explanation };
}
module.exports = { publicForecastInput, forecastFromPublic };
