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

const rngModule = { createRng, randRange };
if (typeof module !== 'undefined' && module.exports) module.exports = rngModule; else root.FirmGeneratorRng = rngModule;
})(typeof globalThis !== 'undefined' ? globalThis : this);
