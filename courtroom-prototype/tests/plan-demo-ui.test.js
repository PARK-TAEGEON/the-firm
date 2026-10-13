'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function boot() {
  const node = { innerHTML: '', handlers: {}, addEventListener(type, cb) { this.handlers[type] = cb; } };
  const win = { scrollTo() {} };
  const context = { console, window: win, document: { getElementById(id) { assert.equal(id,'app'); return node; } } };
  Object.assign(win, context);
  context.globalThis = win;
  // In the real browser window and globalThis are the same object.
  const js = [
    'data/demo-ko-pack.js',
    'data/demo-separated-moments.js',
    'engine/trial.js',
    'services/demo-trial.js',
    'services/demo-outcome.js',
    'services/demo-session.js',
    'services/plan-demo.js',
    'ui/plan-demo-app.js'
  ];
  for (const file of js) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInNewContext(source, context, { filename:file, timeout:15000 });
  }
  const click = action => node.handlers.click({
    target: { closest(s) { assert.equal(s,'button[data-action]'); return { dataset:{action} }; } }
  });
  const changeLayout = checked => node.handlers.change({target:{id:'layout-toggle',checked}});
  return {node,click,changeLayout};
}

test('page: approve default plan, inspect actual hearing, review record', () => {
  const ui = boot();
  assert.match(ui.node.innerHTML,/법률 검토/);
  assert.match(ui.node.innerHTML,/변론 계획/);
  ui.click('approve');
  assert.match(ui.node.innerHTML,/공판 진행/);
  assert.match(ui.node.innerHTML,/실제 실행 기록 확인/);
  assert.doesNotMatch(ui.node.innerHTML,/role="alert"/);
  ui.click('show-record');
  assert.match(ui.node.innerHTML,/법정 기록/);
  assert.match(ui.node.innerHTML,/연속 영상 · 신문 수행/);
  assert.match(ui.node.innerHTML,/진료기록 · 신문 수행/);
  assert.match(ui.node.innerHTML,/현장 동선 · 신문 수행/);
});

test('page: toggle only the layout response and compare against default', () => {
  const ui=boot();
  ui.click('approve'); ui.click('show-record');
  ui.click('flip');
  assert.match(ui.node.innerHTML,/계획 검토/);
  ui.click('edit'); ui.changeLayout(false); ui.click('save-edit');
  assert.match(ui.node.innerHTML,/별도 신문 계획에서 제외/);
  ui.click('approve'); ui.click('show-record');
  assert.match(ui.node.innerHTML,/연속 영상 · 신문 수행/);
  assert.match(ui.node.innerHTML,/진료기록 · 신문 수행/);
  assert.match(ui.node.innerHTML,/현장 동선 · 미실행/);
  assert.doesNotMatch(ui.node.innerHTML,/role="alert"/);
});
