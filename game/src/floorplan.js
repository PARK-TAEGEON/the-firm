(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FirmFloorplan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Coordinates are on the floor. Partitions are runs [x, y, dx, dy] with gaps for doors.
  const plans = {
    1: {
      w: 300, d: 194, bays: [5, 3],
      rooms: [
        { name: '업무실', label: [32, 176], seats: { A: [60, 67], B: [160, 64], C: [132, 135] } },
        { name: '접수', label: [256, 165] }
      ],
      partitions: [[209, 0, 0, 71]],
      furniture: [['files', 31, 26], ['counter', 255, 110], ['plant', 273, 31], ['bench', 253, 39]]
    },
    2: {
      w: 464, d: 282, bays: [7, 4],
      rooms: [
        { name: '업무실', label: [50, 245], seats: { A: [70, 73], B: [215, 73], C: [70, 170], D: [220, 170], E: [155, 235] } },
        { name: '소회의실', label: [337, 132], wood: [302, 0, 162, 152] },
        { name: '대기 공간', label: [375, 250] }
      ],
      partitions: [[302, 0, 0, 87], [302, 125, 0, 27], [302, 152, 104, 0]],
      furniture: [['shelf', 95, 21], ['meeting', 383, 72], ['sofa', 387, 186], ['lowTable', 384, 217],
        ['counter', 265, 246], ['plant', 437, 250], ['files', 30, 225]]
    },
    3: {
      w: 650, d: 375, bays: [10, 6],
      rooms: [
        { name: '민사 송무팀', label: [70, 194], seats: { A: [64, 75], C: [125, 145], E: [163, 42] } },
        { name: '형사팀', label: [294, 196], seats: { B: [285, 78], D: [345, 148], F: [372, 42] } },
        { name: '회의실', label: [505, 140], wood: [440, 0, 210, 171] },
        { name: '대기실', label: [316, 344] },
        { name: '접수', label: [114, 341] },
        { name: '대표실', label: [540, 341], seats: { G: [546, 253] }, wood: [440, 175, 210, 200] }
      ],
      partitions: [[222, 0, 0, 118], [0, 219, 112, 0], [239, 219, 100, 0], [440, 0, 0, 102],
        [440, 145, 0, 27], [440, 173, 210, 0], [440, 177, 0, 70], [440, 305, 0, 70]],
      furniture: [['files', 35, 147], ['shelf', 274, 18], ['meeting', 548, 75], ['shelf', 579, 190],
        ['counter', 96, 275], ['files', 38, 268], ['sofa', 305, 256], ['bench', 373, 295],
        ['lowTable', 310, 297], ['plant', 412, 337], ['plant', 618, 199]]
    }
  };

  function project(x, y, z = 0) { return [x - y, (x + y) / 2 - z]; }
  function points(vertices) { return vertices.map(v => project(...v).join(',')).join(' '); }
  function face(material, vertices) {
    return '<polygon fill="var(--iso-' + material + ')" points="' + points(vertices) + '"/>';
  }
  function surface(x, y, w, d, z) {
    return [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]];
  }
  function block(material, x, y, z, w, d, h) {
    const top = surface(x, y, w, d, z + h);
    const base = surface(x, y, w, d, z);
    return face(material + '-left', [top[3], top[2], base[2], base[3]]) +
      face(material + '-right', [top[1], top[2], base[2], base[1]]) + face(material + '-top', top);
  }
  function at(x, y, body) {
    return '<g transform="translate(' + project(x, y).join(' ') + ')">' + body + '</g>';
  }
  function escape(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function windows(axis, length, bays) {
    const frame = axis === 'x' ? 'matrix(1 .5 0 -1 0 0)' : 'matrix(-1 .5 0 -1 0 0)';
    const heights = [24, 38, 31, 43, 26, 35, 29];
    let skyline = '', mullions = '';
    for (let i = 0; i < bays * 3; i++) {
      const step = length / (bays * 3);
      const h = heights[(i + (axis === 'x' ? 0 : 3)) % heights.length];
      skyline += '<rect x="' + (i * step) + '" y="9" width="' + (step - 2) + '" height="' + h + '"/>';
    }
    for (let i = 0; i <= bays; i++) {
      mullions += '<path d="M' + (i * length / bays) + ' 6v62"/>';
    }
    return '<g transform="' + frame + '"><rect class="iso-window" width="' + length + '" height="70"/>' +
      '<g class="iso-skyline">' + skyline + '</g><g class="iso-frame">' + mullions +
      '<path d="M0 15h' + length + ' M0 57h' + length + '"/></g></g>';
  }
  function curtainWall(plan) {
    const { w, d, bays } = plan;
    return windows('x', w, bays[0]) + windows('y', d, bays[1]) +
      block('frame', -3, -3, 68, w + 6, 4, 4) + block('frame', -3, 0, 68, 4, d + 3, 4) +
      block('frame', -3, -3, 0, 5, 5, 72) + block('frame', 0, 0, 0, w, 4, 8) +
      block('frame', 0, 0, 0, 4, d, 8) + block('frame', w - 3, 0, 0, 5, 5, 72) +
      block('frame', 0, d - 3, 0, 5, 5, 72);
  }
  function glassPanel(dx, dy) {
    const pane = [[0, 0, 3], [dx, dy, 3], [dx, dy, 43], [0, 0, 43]];
    return '<polygon class="iso-partition" points="' + points(pane) + '"/>' +
      block('metal', 0, 0, 42, dx || 2, dy || 2, 2) +
      block('metal', 0, 0, 0, 2, 2, 44) + block('metal', dx, dy, 0, 2, 2, 44);
  }

  function chair(x, y) {
    return at(x, y, block('dark', -7, -6, 0, 14, 13, 2) + block('metal', -2, -2, 2, 4, 4, 9) +
      block('dark', -8, -7, 11, 16, 14, 4) + block('dark', -8, -8, 15, 16, 3, 14) +
      block('metal', -6, -5, 24, 12, 1, 1));
  }
  function table(x, y, w, d, h, material) {
    let legs = '';
    for (const dx of [2, w - 5]) for (const dy of [2, d - 5]) legs += block('metal', x + dx, y + dy, 0, 3, 3, h);
    return legs + block(material, x, y, h, w, d, 3);
  }
  function desk(occupied) {
    let person = '';
    if (occupied) {
      person = block('suit', -7, -19, 14, 14, 10, 14) +
        face('portrait', [[-4,-17,29], [3,-17,29], [4,-13,32], [3,-12,38], [-3,-13,39], [-5,-16,36]]) +
        block('dark', -4, -18, 37, 7, 6, 3);
    }
    return chair(0, -15) + person + table(-22, -6, 44, 22, 18, 'white') +
      block('metal', -4, 4, 21, 9, 4, 1) + block('dark', 0, 5, 22, 2, 2, 5) +
      block('dark', -9, 6, 26, 21, 2, 12) +
      face('screen', [[-7,8,27], [10,8,27], [10,8,36], [-7,8,36]]) +
      face('keypad', surface(-7,-3,15,5,21.2)) + face('paper', surface(14, 7, 5, 7, 21.2));
  }
  function cabinet(tall) {
    if (!tall) return block('metal', -13,-9,0,26,18,27) +
      [7,16,25].map(z => block('dark', -7,9,z,14,1,1)).join('');
    let books = '';
    for (const z of [7, 25]) {
      for (let i = 0; i < 7; i++) books += block(i % 3 ? 'stone' : 'dark', -17 + i * 5, 0, z, 3.5, 6, 9 + i % 4);
    }
    return block('wood', -21,-7,0,42,6,46) + block('wood', -22,-6,0,3,15,45) +
      books + [4,22,44].map(z => block('wood', -22,-7,z,45,16,2)).join('');
  }
  function sofa(w) {
    return block('dark', -w/2+3,-9,0,w-6,18,5) + block('fabric', -w/2,-12,5,w,24,9) +
      block('fabric', -w/2,-13,14,w,5,13) + block('fabric', -w/2,-8,14,5,20,8) +
      block('fabric', w/2-5,-8,14,5,20,8) +
      block('fabric', -w/2+6,-6,14,w/2-7,17,2) + block('fabric', 1,-6,14,w/2-7,17,2);
  }
  function plant() {
    let leaves = '';
    for (const [x,y,z] of [[-14,-3,32],[0,-14,40],[11,-8,34],[-10,11,39],[9,10,43],[14,3,29],[-4,14,30]]) {
      leaves += face('leaf-left', [[0,0,15],[x-4,y,z-6],[x,y,z]]) +
        face('leaf-top', [[0,0,15],[x,y,z],[x+4,y,z-7]]);
    }
    return block('stone', -8,-8,0,16,16,18) + face('soil', surface(-6,-6,12,12,18.2)) + leaves;
  }
  const fixtures = {
    shelf: () => cabinet(true), files: () => cabinet(false), plant: plant,
    counter: () => block('wood', -27,-10,0,54,20,25) + block('stone', -29,-12,25,58,24,3) + block('dark', 4,-3,28,13,2,7),
    sofa: () => sofa(60), bench: () => sofa(36),
    lowTable: () => table(-16,-8,32,16,9,'wood'),
    meeting: () => chair(-19,-18) + chair(19,-18) + table(-38,-14,76,28,20,'wood') +
      face('paper', surface(-22,-4,9,7,23.2)) + face('keypad', surface(13,0,10,5,23.2)) + chair(-19,20) + chair(19,20)
  };

  const footprint = points(surface(-30,-23,60,46,0));
  function anchor(id, status, onWood) {
    const { placed, full, person, selected, lockLabel } = status;
    const disabled = !placed && full;
    const label = id + ' 자리 · ' + (placed ? person || '빈 책상' : disabled ? lockLabel : '책상 놓기');
    return '<g id="anchor-' + id + '" class="iso-anchor' + (onWood ? ' on-wood' : '') + '" role="button" tabindex="' + (disabled ? -1 : 0) +
      '" data-act="' + (placed ? 'chooseDesk' : 'placeDesk') + '" data-anchor="' + id + '" aria-label="' + escape(label) + '"' +
      (disabled ? ' aria-disabled="true"' : '') + (placed ? ' aria-expanded="' + selected + '"' : '') + '>' +
      '<polygon class="iso-hit ' + (placed ? 'installed' : 'empty') + '" points="' + footprint + '"/>' +
      (placed ? desk(person) : '<text class="iso-letter" y="' + (disabled ? -1 : 4) + '">' + id + '</text>' +
        (disabled ? '<text class="iso-cost" y="12">' + escape(lockLabel) + '</text>' : '')) + '</g>';
  }

  function nameplate(id, name) {
    return '<g class="iso-nameplate" data-seat="' + id + '" transform="translate(8 -46)">' +
      '<path d="M-29 -17h58v20H3L0 7l-3 -4h-26Z"/><text y="-3">' + escape(name) + '</text></g>';
  }
  function plaque(d, owner) {
    const [x,y] = project(12,d, -1);
    const name = owner + ' 법률사무소';
    return '<g class="iso-plaque" transform="matrix(1 .5 0 1 ' + x + ' ' + y + ')"><rect width="119" height="16"/>' +
      '<text x="59.5" y="12"' + (name.length > 13 ? ' textLength="112" lengthAdjust="spacingAndGlyphs"' : '') + '>' + escape(name) + '</text></g>';
  }
  function render(tier, readSeat, owner) {
    const plan = plans[tier], { w,d } = plan;
    const width = w + d + 36, height = (w+d)/2 + 113;
    let floor = block('slab',0,0,-20,w,d,20) + face('stone-top', surface(0,0,w,d,0));
    let labels = '', tags = '';
    const objects = [];
    function add(kind,x,y,body) { objects.push({ kind, depth: x+y, art: at(x,y,body) }); }
    for (const room of plan.rooms) {
      if (room.wood) floor += face('wood-top', surface(...room.wood,0));
      labels += at(...room.label, '<text class="iso-room' + (room.wood ? ' on-wood' : '') +
        '" transform="matrix(1 .5 -.42 .8 0 0)">' + room.name + '</text>');
      for (const [id,[x,y]] of Object.entries(room.seats || {})) {
        const status = readSeat(id);
        add('anchor', x,y, anchor(id,status,room.wood));
        if (status.person) tags += at(x,y,nameplate(id,status.person));
      }
    }
    for (const [kind,x,y] of plan.furniture) add(kind,x,y,fixtures[kind]());
    for (const [x,y,dx,dy] of plan.partitions) {
      const count = Math.ceil((dx+dy)/45);
      for (let i=0; i<count; i++) {
        const sx = dx/count, sy = dy/count;
        const xx=x+sx*i, yy=y+sy*i;
        objects.push({kind:'glass', depth:xx+yy+(sx+sy)/2, art:at(xx,yy,glassPanel(sx,sy))});
      }
    }
    objects.sort((a,b) => a.depth-b.depth);
    const scene = objects.map(o => '<g data-fixture="' + o.kind + '" data-depth="' + o.depth + '">' + o.art + '</g>').join('');
    return '<svg class="office-iso" width="' + width + '" viewBox="' + (-d-18) + ' -84 ' + width + ' ' + height +
      '" role="group" aria-label="사무실 배치도">' + floor + labels + curtainWall(plan) + scene +
      block('frame',0,d,0,w,2,2) + block('frame',w,0,0,2,d,2) + plaque(d,owner) + tags + '</svg>';
  }
  return { project, render };
});
