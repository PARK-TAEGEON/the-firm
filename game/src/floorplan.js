(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FirmFloorplan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // All coordinates are local SVG drawing units. Shared letters survive a move.
  var plans = {
    1: {
      width: 464, right: 438, entry: 298, windows: [76, 222],
      anchors: { A: [95, 101], B: [257, 113], C: [164, 196] },
      labels: [[70, 71, '업무실']], shelves: [[38, 173]], plants: [[403, 61]],
      partitions: '', doors: [], tables: []
    },
    2: {
      width: 696, right: 670, entry: 280, windows: [72, 224, 486],
      anchors: { A: [86, 99], B: [239, 99], C: [72, 195], D: [193, 196], E: [319, 190] },
      labels: [[62, 70, '업무실'], [474, 71, '소회의 공간']],
      shelves: [[38, 114], [634, 166]], plants: [[408, 61], [610, 67]],
      partitions: 'M447 30V180 M447 226V284', doors: [[447, 226, -90]], tables: [[549, 140]]
    },
    3: {
      width: 940, right: 914, entry: 370, windows: [76, 228, 418, 692],
      anchors: { A: [84, 92], B: [242, 92], C: [86, 193], D: [242, 193],
        E: [427, 92], F: [427, 193], G: [741, 215] },
      labels: [[62, 63, '업무실'], [436, 63, '창가'], [657, 63, '회의실'], [657, 193, '대표실']],
      shelves: [[37, 131], [873, 190]], plants: [[566, 66], [863, 58], [865, 256]],
      partitions: 'M610 30V92 M610 138V212 M610 258V284 M610 162H914',
      doors: [[610, 138, -90], [610, 258, -90]], tables: [[762, 101]]
    }
  };

  function groupAt(x, y, art, angle) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (angle || 0) + ')">' + art + '</g>';
  }
  function windowBay(x) {
    return groupAt(x, 30, '<rect class="plan-glass" x="0" y="-4" width="104" height="8"/>' +
      '<path class="plan-line" d="M0 0h104 M52 -4v8"/>');
  }
  function door(x, y, angle) {
    return groupAt(x, y, '<path class="plan-swing" d="M0 -46 A46 46 0 0 1 46 0"/>' +
      '<path class="plan-line" d="M0 0v-46"/>', angle);
  }
  function shelves(x, y) {
    return groupAt(x, y, '<rect class="plan-wood" width="18" height="74"/>' +
      '<path class="plan-line" d="M4 3v68 M4 12h12 M4 19h12 M4 29l12 -3 M4 40h12 M4 47h12 M4 59h12 M4 65h12"/>');
  }
  function plant(x, y) {
    return groupAt(x, y, '<rect class="plan-wood" x="-8" y="-8" width="16" height="16"/>' +
      '<path class="plan-leaf" d="M0 1Q-23 -1 -17 -17Q-4 -15 0 1 M1 0Q2 -22 17 -18Q15 -4 1 0 M0 0Q19 1 18 15Q3 16 0 0 M0 0Q-2 19 -17 16Q-18 3 0 0"/>');
  }
  function meetingTable(x, y) {
    return groupAt(x, y, '<g class="plan-chair"><rect x="-35" y="-31" width="21" height="16"/>' +
      '<rect x="13" y="-31" width="21" height="16"/><rect x="-35" y="14" width="21" height="16"/>' +
      '<rect x="13" y="14" width="21" height="16"/></g><rect class="plan-wood" x="-53" y="-19" width="106" height="38"/>' +
      '<path class="plan-line" d="M-50 -14h100"/><rect class="plan-sheet" x="13" y="-9" width="18" height="12"/>');
  }
  function render(tier, anchorButton) {
    var plan = plans[tier];
    var w = plan.right;
    var entry = plan.entry;
    var walls = 'M' + entry + ' 284H28V30H' + w + 'V284H' + (entry + 46);
    var art = '<defs><pattern id="floor-boards" patternUnits="userSpaceOnUse" width="120" height="48">' +
      '<path class="plan-joint" d="M0 0h120 M0 24h120 M35 0v24 M92 24v24"/></pattern></defs>' +
      '<g aria-hidden="true"><rect class="plan-floor" x="28" y="30" width="' + (w - 28) + '" height="254"/>' +
      '<rect fill="url(#floor-boards)" x="28" y="30" width="' + (w - 28) + '" height="254"/>' +
      '<path class="plan-wall" d="' + walls + ' ' + plan.partitions + '"/>' +
      plan.windows.map(windowBay).join('') + door(entry, 284, 0) +
      plan.doors.map(function (d) { return door(d[0], d[1], d[2]); }).join('') +
      plan.shelves.map(function (p) { return shelves(p[0], p[1]); }).join('') +
      plan.plants.map(function (p) { return plant(p[0], p[1]); }).join('') +
      plan.tables.map(function (p) { return meetingTable(p[0], p[1]); }).join('') +
      plan.labels.map(function (p) { return '<text class="plan-room" x="' + p[0] + '" y="' + p[1] + '">' + p[2] + '</text>'; }).join('') +
      '<text class="plan-entry" x="' + (entry + 11) + '" y="307">입구</text></g>';
    var anchors = Object.entries(plan.anchors).map(function (item) {
      var id = item[0], pt = item[1];
      return '<foreignObject x="' + pt[0] + '" y="' + pt[1] + '" width="92" height="68">' +
        anchorButton(id) + '</foreignObject>';
    }).join('');
    return '<svg class="floorplan" width="' + plan.width + '" height="322" viewBox="0 0 ' + plan.width +
      ' 322" role="group" aria-label="사무실 평면도">' + art + anchors + '</svg>';
  }
  return { render: render };
});
