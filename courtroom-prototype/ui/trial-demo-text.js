(function (root) {
'use strict';
// Display-only Korean inflection. Raw trial records stay unchanged.
function objectParticle(noun) {
  const last = String(noun).trim().slice(-1).charCodeAt(0);
  return noun + (last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0 ? '을' : '를');
}
function format(text) {
  return String(text || '').replace(/([가-힣]+)을\(를\)/g, (_, noun) => objectParticle(noun));
}
const api = { objectParticle, format };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FirmDemoText = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
