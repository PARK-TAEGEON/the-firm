'use strict';
const pairs = {
  '을/를': ['을', '를'], '이/가': ['이', '가'], '은/는': ['은', '는'],
  '과/와': ['과', '와'], '으로/로': ['으로', '로']
};
function finalConsonant(word) {
  const normalized = String(word).normalize('NFC').replace(/[\s”’"'」』)\]]+$/u, '');
  if (!normalized) throw Error('particle needs a noun');
  const last = normalized.at(-1), code = last.codePointAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28;
  // Korean readings of digits: 영 일 이 삼 사 오 육 칠 팔 구.
  if (/\d/.test(last)) return [21, 8, 0, 16, 0, 0, 1, 8, 8, 0][Number(last)];
  throw Error(`unknown Korean noun ending: ${word}`);
}
function particle(word, pair) {
  if (!Object.hasOwn(pairs, pair)) throw Error(`unsupported particle: ${pair}`);
  const final = finalConsonant(word);
  return pairs[pair][final === 0 || (pair === '으로/로' && final === 8) ? 1 : 0];
}
function withParticle(word, pair) { return String(word) + particle(word, pair); }
// Explicit particle slots prevent a noun's final syllable from determining grammar in the authoring file.
function render(value, facts) {
  if (typeof value === 'string') return value.replace(/\{(\w+)(?::([^{}]+))?\}/g, (_, key, pair) => {
    if (!Object.hasOwn(facts, key)) throw Error(`missing scene fact: ${key}`);
    return pair ? withParticle(facts[key], pair) : String(facts[key]);
  });
  if (Array.isArray(value)) return value.map(x => render(x, facts));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, render(v, facts)]));
  return value;
}
module.exports = { particle, withParticle, render };
