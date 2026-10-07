(function (root) {
'use strict';
// Presentation only. Optional image is a URL relative to demo.html.
const locations = [{ key: 'office_lounge', label: '사무실 회의실', image: 'assets/locations/office_lounge.jpg' }];
if (typeof module !== 'undefined' && module.exports) module.exports = locations; else root.FirmDemoLocations = locations;
})(typeof globalThis !== 'undefined' ? globalThis : this);
