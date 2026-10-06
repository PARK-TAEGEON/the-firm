'use strict';
const C = require('./content');
const { automaticCase } = require('./core/automatic');
function formatResult(player) {
  return [player.title, `전망: ${player.forecast}`, player.explanation, `결과: ${player.outcome}`, `판세: ${player.resultBand}`,
    ...player.discoveries.flatMap(x => [x.text, x.missed]),
    ...player.review.effective.map(x => x.text), ...player.review.missed.map(x => x.text)].join('\n');
}
if (require.main === module) {
  const id = process.argv[2] || 'ARCH_THEFT';
  const seed = Number(process.argv[3] || 1);
  if (!Number.isSafeInteger(seed) || seed < 1) throw Error('seed must be a positive integer');
  const d = C.buildContestedCase(id, seed), targetIssue = d.issues[0].id;
  const investigations = d.investigations.filter(i => i.id.startsWith(`INV_${targetIssue}_`)).map(i => i.id);
  console.log(formatResult(automaticCase(d, { targetIssue, investigations, skill: process.argv[4] || 'experienced' }).player));
}
module.exports = { formatResult };
