(function (root) {
'use strict';
// DEMO-001 결과 판정. 순수 함수: 사건 데이터 + 법체계 팩 + 기록(공판·재판 전) → 주문·양형·복기.
// 엔진(engine/trial.js)은 그대로 쓰고, 그 위에서 “기소된 죄 → 축소사실 → 피해자 의사(소송조건) → 양형”을 차례로 읽는다.
// 법체계 중립: 죄명·조문·반의사불벌 여부·마감·양형 값은 모두 pack에서 온다(DEC-032). 사건 ID·검사 버전을 읽지 않는다(DEC-031 N4).
// Owns 제약으로 services/ 아래에 두지만 상태를 바꾸지 않는 판정 함수다.
const T = typeof module !== 'undefined' && module.exports ? require('../engine/trial.js') : root.FirmTrial;

const sum = r => (r.effects || []).reduce((s, [, x]) => s + x, 0);
const fill = (text, vars) => String(text || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));

// 피해자 처벌불원 의사가 마감 전에 제출됐는가. 마감 종류는 팩이 정한다.
function victimWillBefore(pack, sessionRecords, verdictRecord) {
  const filed = sessionRecords.find(r => r.kind === 'victim_will_filed');
  if (!filed) return null;
  if (pack.victimWill.deadline === 'first_instance_verdict') return filed.trialSeq < verdictRecord.seq ? filed : null;
  throw new Error('unknown victim-will deadline: ' + pack.victimWill.deadline);
}

function matches(when, ctx) {
  if (when.outcome && when.outcome !== ctx.key) return false;
  if (when.hasCard && !ctx.cards.includes(when.hasCard)) return false;
  if (when.lacksCard && ctx.cards.includes(when.lacksCard)) return false;
  if (when.lacksRebuttal && ctx.rebuttals.includes(when.lacksRebuttal)) return false;
  if (when.recovered && !ctx.recoveredIssues.includes(when.recovered)) return false;
  if (when.shaken && ctx.bands[when.shaken] !== 'shaken') return false;
  if (when.focusNot && ctx.focusId === when.focusNot) return false;
  return true;
}

function decide(caseDef, pack, trialDef, trialRecords, sessionRecords) {
  const verdict = trialRecords.find(r => r.kind === 'verdict');
  if (!verdict) return null;
  const p = T.project(trialDef, trialRecords);
  const issue = id => p.issues.find(i => i.id === id);
  const { offense: chargedId, actIssue, causationIssue } = caseDef.charge;
  const act = issue(actIssue), cause = issue(causationIssue);
  const will = victimWillBefore(pack, sessionRecords || [], verdict);

  // 1) 행위 자체가 의심이면 기소된 죄도 그 안의 죄도 성립하지 않는다 → 무죄.
  // 2) 행위는 인정되지만 결과(상해)와의 연결이 의심이면 → 축소사실(그 안에 포함된 죄)로 판단.
  //    그 죄가 피해자 의사에 반해 처벌할 수 없는 죄이고 마감 전 처벌불원이 있으면 → 공소기각.
  // 3) 둘 다 인정 → 기소된 죄로 유죄. 처벌불원은 양형에서만 고려된다.
  let key, judgment, offenseId = null;
  if (act.band === 'doubt') { key = 'acquittal'; judgment = pack.judgments.acquittal; }
  else if (cause.band === 'doubt') {
    offenseId = pack.lesserIncluded[chargedId];
    const lesser = pack.offenses[offenseId];
    if (lesser.victimWillBar && will) { key = 'dismissal'; judgment = pack.judgments.dismissal; }
    else { key = offenseId; judgment = pack.judgments.conviction; }
  } else { offenseId = chargedId; key = chargedId; judgment = pack.judgments.conviction; }
  const convicted = key !== 'acquittal' && key !== 'dismissal';
  const offense = offenseId ? pack.offenses[offenseId] : null;

  let sentence = null;
  if (convicted) {
    const row = pack.sentencing.table.find(x => x.offense === offenseId && x.victimWill === !!will);
    sentence = row ? { kind: row.sentence, label: pack.sentencing.labels[row.sentence], pronouncement: row.pronouncement, text: row.text, reason: row.reason, disclaimer: pack.sentencing.disclaimer, premise: pack.sentencing.premise }
                   : { kind: null, label: pack.sentencing.unassessed, text: pack.sentencing.unassessed, reason: '', disclaimer: pack.sentencing.disclaimer, premise: pack.sentencing.premise };
  }

  const vars = { offense: offense ? offense.label : '', deadline: pack.victimWill.deadlineLabel, article: judgment.article || '', document: pack.victimWill.documentLabel };
  const text = caseDef.outcomes[key];
  const reviewText = key === chargedId && will && text.reviewWithWill ? text.reviewWithWill : text.review;

  // 판세 “다툼 있음”에서 유죄가 나온 이유. 유죄의 근거가 된 쟁점만 본다.
  const witnessOf = id => trialDef.witnesses.find(w => w.issue === id);
  const recovered = trialRecords.filter(r => r.kind === 'redirect' && sum(r) > 0);
  const basis = !convicted ? [] : offenseId === chargedId ? [act, cause] : [act];
  const shaken = basis.filter(i => i.band === 'shaken').map(i => {
    const w = witnessOf(i.id), rec = recovered.find(r => w && r.witnessId === w.id);
    return fill(caseDef.shakenNote, { issue: i.title }) + (rec ? ' ' + fill(caseDef.shakenRecovered, { memo: rec.memo }) : '');
  });

  // 복기: 당신이 뚫은 것 / 상대가 막은 것 / 역효과 / 놓친 준비. 모두 실제 기록에서만 인용한다.
  const rv = T.review(trialDef, trialRecords);
  const directOf = r => r && r.kind === 'direct'
    ? trialDef.witnesses.find(w => w.id === r.witnessId).direct.find(x => x.id === r.refId) : null;
  const backfired = rv.backfired.filter(m => !['evidence_opinion', 'evidence_filing'].includes(trialRecords.find(r => r.id === m.recordId)?.kind)).map(m => {
    const step = directOf(trialRecords.find(r => r.id === m.recordId));
    return step && p.cards.includes(step.missedUnlessCard) && step.knownMemo ? { ...m, text: step.knownMemo } : m;
  });
  const blocked = trialRecords.filter(r => (r.kind === 'redirect' && sum(r) > 0) || (r.kind === 'approach' && r.tone === 'prosecution') || r.blockedReason)
    .map(r => ({ recordId: r.id, text: r.memo }));
  const passed = trialRecords.filter(r => r.kind === 'objection' && r.ruling === 'pass' && sum(r) > 0)
    .flatMap(r => {
      const step = trialDef.witnesses.find(w => w.id === r.witnessId).direct.find(x => x.id === r.refId);
      return step.proper && step.pass.missed ? [{ recordId: r.id, text: step.pass.missed }] : [];
    });
  // Only verdict-basis issues; prefer a concrete record to a generic reminder
  // for the same preparation card even when their authored wording differs.
  const basisIds = new Set(basis.map(i => i.id));
  const missedKeys = new Set();
  const missed = rv.missed.filter(m => {
    const rec = trialRecords.find(r => r.id === m.recordId);
    const step = directOf(rec);
    if (step && p.cards.includes(step.missedUnlessCard)) return false;
    const w = rec && trialDef.witnesses.find(w => w.id === rec.witnessId);
    const reminder = !rec && trialDef.missedPrep.find(x => x.text === m.text);
    const redirect = w && w.redirect.find(x => x.id === rec.refId);
    const card = reminder ? reminder.card : redirect && redirect.rebuttal && redirect.rebuttal.card;
    const issueId = reminder ? reminder.issue : w && w.issue;
    const key = card || m.text;
    if (!basisIds.has(issueId) || missedKeys.has(key)) return false;
    missedKeys.add(key); return true;
  });
  const ctx = { key, cards: p.cards, focusId: p.focusId,
    bands: Object.fromEntries(p.issues.map(i => [i.id, i.band])),
    recoveredIssues: recovered.map(r => trialDef.witnesses.find(w => w.id === r.witnessId).issue),
    rebuttals: trialRecords.filter(r => r.kind === 'rebuttal' && sum(r) < 0).map(r => r.refId) };
  const next = (caseDef.nextTry.find(n => matches(n.when, ctx)) || { text: '' }).text;

  const final = trialRecords.find(r => r.kind === 'closing_argument');
  const closingMatch = final && (final.basis === 'act' ? act.band === 'doubt' : final.basis === 'cause' ? cause.band === 'doubt' : convicted);
  const closingReview = final ? final.title + ' — ' + (closingMatch ? '판결 근거와 맞닿았습니다.' : '판결 근거와 달랐습니다.') + ' (선택 자체는 판정에 영향 없음)' : null;
  const procedureReview = trialRecords.filter(r => ['evidence_opinion', 'evidence_filing', 'sentencing_request'].includes(r.kind)).map(r => ({ recordId: r.id, text: r.memo }));
  return {
    closingReview, procedureReview,
    key, convicted, victimWill: !!will,
    judgment: { label: judgment.label, article: judgment.article || null },
    offense: offense ? { id: offenseId, label: offense.label, article: offense.article } : null,
    sentence,
    pronouncement: sentence ? sentence.pronouncement : judgment.pronouncement,
    headline: text.headline + (sentence ? ' — ' + sentence.text : ''),
    text: fill(text.text, vars),
    reviewText,
    issues: [act, cause].map(i => ({ id: i.id, title: i.title, band: i.band, bandLabel: caseDef.bandLabels[i.band], memo: i.memo })),
    shaken,
    broke: rv.effective.map(x => ({ recordId: x.recordId, text: x.text })),
    blocked, passed, backfired, missed,
    next,
    engineVerdict: verdict.outcome
  };
}

const api = { decide };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmDemoOutcome = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
