'use strict';
// Renderer checks complement (and do not replace) the real-browser play-ui-smoke suite.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('../src/engine.js');
const source = fs.readFileSync(path.join(__dirname, '../src/ui.js'), 'utf8');
const KEY = 'thefirm.management.0.3';
function mount(initial, mode = 'brief') {
  if (initial) assert.equal(E.validateState(initial).ok, true);
  const elements = new Map(), listeners = {}, saved = new Map();
  saved.set(KEY + '.view', mode); if (initial) saved.set(KEY, JSON.stringify(initial));
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, { innerHTML: '', style: {}, value: '', focus() {}, addEventListener() {}, classList: { add() {}, remove() {} } });
    return elements.get(selector);
  }
  vm.runInNewContext(source, {
    window: { FirmEngine: E, scrollTo() {} },
    document: { querySelector: element, body: { style: {} }, addEventListener(type, fn) { listeners[type] = fn; } },
    localStorage: { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) },
    setTimeout() {}, clearTimeout() {}, requestAnimationFrame() {},
  });
  return {
    html: () => element('#app').innerHTML,
    modal: () => element('#modal-root').innerHTML,
    state: () => JSON.parse(saved.get(KEY) || 'null'),
    click(action, id) { listeners.click({ target: { classList: { contains: () => false }, closest: () => ({ dataset: { action, id } }) } }); },
  };
}
function command(state, action) { const result = E.command(state, action); assert.ok(result.ok, result.error); return result.state; }
function finish(state) {
  state = command(state, { type: 'ACCEPT_INTAKE' });
  while (!state.completed) state = command(state, { type: 'ADVANCE_DAY' });
  return state;
}
function metric(html, key) {
  const tag = html.match(new RegExp('<[^>]+data-metric="' + key + '"[^>]*>'));
  assert.ok(tag, 'Missing separate metric ' + key);
  const value = tag[0].match(/data-value="(-?\d+)"/);
  assert.ok(value, 'Missing numeric metric value ' + key);
  return Number(value[1]);
}
test('fresh UI uses the visible commitment contract only after acceptance', () => {
  const ui = mount(); ui.click('intake');
  assert.match(ui.modal(), /환급/); assert.match(ui.modal(), /50%/);
  ui.click('accept');
  assert.equal(ui.state().version, '0.4.0');
  assert.deepEqual(ui.state().experiment, { id: 'commitment-v1', refundPercent: 50 });
  assert.equal(ui.state().cash, 18200000);
});
test('legacy save restores original rules and viewing screens cannot upgrade it', () => {
  const old = E.createInitialState(), ui = mount(old);
  for (const view of ['brief', 'dossier', 'operations']) { ui.click('mode', view); assert.deepEqual(ui.state(), old); }
  ui.click('intake'); assert.deepEqual(ui.state(), old);
  ui.click('accept'); assert.equal(ui.state().version, '0.3.0'); assert.equal(ui.state().experiment, undefined);
});
test('completed experiment exposes money, work, timeliness and refund independently', () => {
  const state = finish(E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50 }));
  const ui = mount(state); ui.click('nav', 'reports'); const summary = E.summarize(state);
  for (const key of ['cash', 'receivables', 'minimumCash', 'negativeCashDays', 'readyCases', 'lateTasks', 'refundPaid']) assert.equal(metric(ui.html(), key), summary[key], key);
  assert.equal(metric(ui.html(), 'refundPaid'), 1200000);
  assert.match(ui.html(), /환급/);
});
test('positive final cash cannot erase the displayed historical deficit', () => {
  const state = finish(E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50, openingCash: 200000 }));
  const summary = E.summarize(state); assert.ok(summary.cash > 0); assert.ok(summary.minimumCash < 0);
  for (const view of ['brief', 'dossier', 'operations']) {
    const ui = mount(state, view); ui.click('nav', 'reports');
    assert.equal(metric(ui.html(), 'minimumCash'), summary.minimumCash);
    assert.equal(metric(ui.html(), 'negativeCashDays'), summary.negativeCashDays);
  }
});
test('assignment preview shows portfolio effects but cancel leaves the game unchanged', () => {
  const state = command(E.createInitialState({ experiment: 'commitment-v1', refundPercent: 50 }), { type: 'ACCEPT_INTAKE' });
  const ui = mount(state); ui.click('assign', 'jung-organize'); ui.click('choose-person', 'kim');
  assert.match(ui.modal(), /data-plan-impact/);
  assert.deepEqual(ui.state(), state);
  ui.click('close'); assert.deepEqual(ui.state(), state);
});
