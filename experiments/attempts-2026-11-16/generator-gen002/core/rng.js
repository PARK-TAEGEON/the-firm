(function (root) {
'use strict';
// GEN-001 — 시드 기반 결정적 난수 (mulberry32). 같은 시드 → 같은 사건.
// AGENTS.md: gameplay RNG는 중앙화되고 재현 가능해야 한다. 생성 로직은 Math.random을 직접 쓰지 않고
// 이 모듈을 거친다.

function createRng(seed) {
  let state = seed >>> 0;
  return function rng() {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randRange(rng, range, integer) {
  const [min, max] = range;
  const value = min + rng() * (max - min);
  return integer ? Math.round(value) : value;
}

// GEN-001 3단계(core 수정) 항목 6 — 원형마다 RNG 스트림을 분리한다. 같은 seed 번호라도 원형마다
// (그리고 필요하면 다른 태그마다) 독립된 스트림을 얻는다 — 그렇지 않으면 두 원형이 같은 seed에서
// 우연히 상관된 truth 값을 뽑는다("이 seed는 모든 원형에서 불리하다" 같은 의도치 않은 패턴).
// FNV-1a 계열 문자열 해시 + seed 결합. 암호학적 강도는 필요 없다 — 결정적이고 원형별로만 분리되면 된다.
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// seed(정수) + tag(문자열, 보통 archetype.id) → 그 조합에서만 쓰는 새 정수 시드.
// createRng(seedFor(seed, archetype.id))로 원형별 독립 스트림을 만든다.
function seedFor(seed, tag) {
  const h = hashString(String(tag));
  return (Math.imul(seed >>> 0, 2654435761) ^ h) >>> 0;
}

const rngModule = { createRng, randRange, hashString, seedFor };
if (typeof module !== 'undefined' && module.exports) module.exports = rngModule; else root.FirmGeneratorRng = rngModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
