(function (root) {
'use strict';
// Presentation only. byId maps persistent person IDs to image URLs relative to demo.html.
// pool is reserved for future tagged assignment; no assignment behavior is implemented.
const portraits = { default: 'assets/portraits/default.svg', byId: {}, pool: [] };
if (typeof module !== 'undefined' && module.exports) module.exports = portraits; else root.FirmDemoPortraits = portraits;
})(typeof globalThis !== 'undefined' ? globalThis : this);
