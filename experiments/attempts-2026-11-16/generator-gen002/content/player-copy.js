'use strict';
// Authored visible-string audit. Metadata IDs are not text, and are never sanitized away.
const visibleKeys = new Set(['title', 'text', 'question', 'answer', 'name', 'role', 'initial', 'blurb', 'memo', 'hint',
  'ground', 'ruling', 'missed', 'content', 'deadlineLabel', 'unitLabel', 'close', 'explanation']);
function playerStrings(d) {
  const found = [];
  function walk(value, key, path) {
    if (typeof value === 'string') { if (visibleKeys.has(key)) found.push({ path, text: value }); return; }
    if (!value || typeof value !== 'object') return;
    if (key === 'lines') { value.forEach((line, i) => found.push({ path: `${path}.${i}`, text: line[1] })); return; }
    if (key === 'briefing') { value.forEach((text, i) => found.push({ path: `${path}.${i}`, text })); return; }
    if (key === 'question' && Array.isArray(value)) { found.push({ path, text: value[1] }); return; }
    if (key === 'memo') { Object.entries(value).forEach(([k, text]) => found.push({ path: `${path}.${k}`, text })); return; }
    Object.entries(value).forEach(([k, v]) => walk(v, k, `${path}.${k}`));
  }
  for (const key of ['title', 'charge', 'client', 'briefing', 'clientStatements', 'issues', 'prep', 'cards', 'investigations',
    'prosecutionExhibits', 'opening', 'witnesses', 'adjudication', 'missedPrep']) walk(d[key], key === 'charge' ? 'title' : key, key);
  Object.entries(d.lines).forEach(([k, lines]) => walk(lines, 'lines', `lines.${k}`));
  return found;
}
const forbidden = /(?:https?:\/\/|\[[^\]]*\]\([^)]*\)|\*\*|`|^\s*#{1,6}\s|\b(?:[A-Z]\d+|DEC-\d+|GEN-\d+|ARCH_[A-Z_]+|ISSUE_[A-Z_]+)\b|\[(?:확인 필요|검토)[^\]]*\]|PLACEHOLDER|TBD|작성 규칙|설계 문서|검토 메모|authored)/im;
function copyErrors(d) { return playerStrings(d).filter(x => forbidden.test(x.text)); }
function duplicateSentences(lines) {
  const seen = new Set(), duplicates = [];
  for (const text of lines) for (const sentence of text.match(/[^.!?。！？]+[.!?。！？]?/g) || []) {
    const normalized = sentence.trim().replace(/\s+/g, ' ');
    if (!normalized) continue;
    if (seen.has(normalized)) duplicates.push(normalized);
    seen.add(normalized);
  }
  return duplicates;
}
module.exports = { playerStrings, copyErrors, duplicateSentences, forbidden };
