(function (root) {
'use strict';
// 효과음은 WebAudio로 합성한다(음원 파일 없음). 첫 입력 뒤에만 소리가 난다. 표현 전용.
let ctx = null, muted = false;
try { muted = localStorage.getItem('thefirm.muted') === '1'; } catch (e) { /* 저장소 없음 */ }

function ensure() {
  if (muted) return null;
  try {
    if (!ctx) { const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) { return null; }
}
function tone(freq, start, dur, type, gain) {
  const c = ensure(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + start;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}
function thud(start) {
  const c = ensure(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + start;
  o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.16);
  g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.36);
}
const sounds = {
  tick() { tone(660, 0, 0.05, 'triangle', 0.05); },
  page() { tone(320, 0, 0.07, 'sine', 0.05); tone(480, 0.05, 0.08, 'sine', 0.04); },
  alert() { tone(392, 0, 0.14, 'triangle', 0.08); tone(311, 0.13, 0.22, 'triangle', 0.08); },
  gain() { tone(523, 0, 0.12, 'sine', 0.07); tone(784, 0.1, 0.24, 'sine', 0.06); },
  gavel() { thud(0); thud(0.42); },
  day() { tone(262, 0, 0.18, 'sine', 0.06); tone(392, 0.14, 0.3, 'sine', 0.05); }
};
const api = {
  play(name) { if (sounds[name]) sounds[name](); },
  isMuted: () => muted,
  toggle() { muted = !muted; try { localStorage.setItem('thefirm.muted', muted ? '1' : '0'); } catch (e) { /* 무시 */ } return muted; }
};
root.FirmAudio = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
