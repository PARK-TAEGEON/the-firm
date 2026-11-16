'use strict';
// Executes the actual UI renderer with a minimal DOM. Browser/layout checks remain ui-smoke.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const E = require('../src/engine.js');
const source = fs.readFileSync(path.join(__dirname, process.argv.includes('--baseline') ? 'fixtures/ui-before-audit.js' : '../src/ui.js'), 'utf8');
function render(state, mode = 'brief') {
  assert.equal(E.validateState(state).ok, true);
  const elements = new Map();
  const listeners = {};
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, { innerHTML: '', style: {}, addEventListener() {}, classList: { add() {}, remove() {} } });
    return elements.get(selector);
  }
  vm.runInNewContext(source, {
    window: { FirmEngine: E, scrollTo() {} },
    document: { querySelector: element, body: { style: {} }, addEventListener(type, callback) { listeners[type] = callback; } },
    localStorage: { getItem(key) { return key.endsWith('.view') ? mode : JSON.stringify(state); }, setItem() {} },
    setTimeout() {}, clearTimeout() {}, requestAnimationFrame() {},
  });
  return {
    html: () => element('#app').innerHTML,
    nav(id) { listeners.click({ target: { classList: { contains: () => false }, closest: () => ({ dataset: { action: 'nav', id } }) } }); },
  };
}
test('positive final cash cannot conceal a temporary forecast deficit', () => {
  let state = E.createInitialState(); state.cash = state.openingCash = 100000;
  state = E.command(state, { type: 'ACCEPT_INTAKE' }).state;
  const forecast = E.forecast(state);
  assert.ok(forecast.projectedCash > 0);
  assert.ok(forecast.warnings.some(w => w.code === 'cash_shortfall'));
  for (const mode of ['brief', 'dossier', 'operations']) {
    const ui = render(state, mode);
    assert.match(ui.html(), /업무일 중 현금 부족 예상/);
    for (const page of ['finance', 'people', 'cases', 'reports']) { ui.nav(page); assert.match(ui.html(), /업무일 중 현금 부족 예상/); }
  }
});
test('current negative cash is visible even if future receipts recover it', () => {
  let state = E.createInitialState(); state.cash = state.openingCash = 100000;
  state = E.command(state, { type: 'ACCEPT_INTAKE' }).state;
  state = E.command(state, { type: 'ADVANCE_DAY' }).state;
  assert.equal(state.cash, -274000);
  assert.match(render(state).html(), /현재 현금 부족/);
});
test('valid imported capacities determine A/C/people total capacity', () => {
  const state = E.createInitialState(); state.staff.find(p => p.id === 'lee').capacity = 1;
  for (const mode of ['brief', 'operations']) {
    const ui = render(state, mode);
    assert.match(ui.html(), /\/ 12(?:시간|h)/);
    ui.nav('people'); assert.match(ui.html(), /\/ 12시간/);
  }
});
test('default state retains original 14h and has no cash warning', () => {
  const ui = render(E.createInitialState());
  assert.match(ui.html(), /\/ 14시간/);
  assert.doesNotMatch(ui.html(), /data-cash-warning/);
});
