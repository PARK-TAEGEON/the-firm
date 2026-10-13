'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function boot() {
  const node = { innerHTML: '', handlers: {}, addEventListener(type, cb) { this.handlers[type] = cb; } };
  const classes = new Set();
  const dialog = {
    innerHTML: '', open: false, handlers: {},
    classList: {
      toggle(name, enabled) { const on = enabled === undefined ? !classes.has(name) : enabled; if (on) classes.add(name); else classes.delete(name); },
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); }
    },
    addEventListener(type, cb) { this.handlers[type] = cb; },
    querySelectorAll() { return []; },
    querySelector() { return { focus() {} }; },
    showModal() { this.open = true; },
    close() { this.open = false; this.handlers.close?.({}); }
  };
  const win = { scrollTo() {} };
  const pageTitle = { focus() {} };
  const context = { console, window: win, document: {
    getElementById(id) { if (id === 'app') return node; if (id === 'page-title') return pageTitle; throw new Error('Unexpected id: ' + id); },
    querySelector(selector) { if (selector === '#consultation') return dialog; throw new Error('Unexpected selector: ' + selector); }
  } };
  Object.assign(win, context);
  context.globalThis = win;
  // In the real browser window and globalThis are the same object.
  const js = [
    'data/demo-locations.js',
    'data/demo-portraits.js',
    'data/demo-ko-pack.js',
    'data/demo-separated-moments.js',
    'engine/trial.js',
    'services/demo-trial.js',
    'services/demo-outcome.js',
    'services/demo-session.js',
    'services/plan-demo.js',
    'ui/trial-demo-consultation.js',
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
  const sceneAction = action => dialog.handlers.click({target:{ closest() { return {disabled:false,dataset:{scene:action}}; } }});
  const finishIntro = () => {sceneAction('all');sceneAction('finish');};
  return {node,dialog,click,changeLayout,sceneAction,finishIntro};
}

test('page: approve default plan, inspect actual hearing, review record', () => {
  const ui = boot();
  ui.finishIntro();
  assert.match(ui.node.innerHTML, /<li class="past">1\. 첫 상담<\/li>/);
  assert.match(ui.node.innerHTML, /<li class="active" aria-current="step">2\. 계획 검토<\/li>/);
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
  ui.finishIntro();
  ui.click('approve'); ui.click('show-record');
  ui.click('flip');
  assert.match(ui.node.innerHTML,/계획 검토/);
  ui.click('edit'); ui.changeLayout(false); ui.click('save-edit');
  assert.match(ui.node.innerHTML,/이번 계획에서 제외/);
  ui.click('approve'); ui.click('show-record');
  assert.match(ui.node.innerHTML,/연속 영상 · 신문 수행/);
  assert.match(ui.node.innerHTML,/진료기록 · 신문 수행/);
  assert.match(ui.node.innerHTML,/현장 동선 · 미실행/);
  assert.doesNotMatch(ui.node.innerHTML,/role="alert"/);
});

test('first consultation reuses the original eight-line authored scene and continues to plan', () => {
  const ui = boot();
  assert.equal(ui.dialog.open, true, 'consultation opens on first visit');
  assert.match(ui.dialog.innerHTML, /첫 상담/);
  assert.match(ui.dialog.innerHTML, /저는 프리랜서 영상 편집자입니다/);
  assert.doesNotMatch(ui.node.innerHTML, /법률 검토/, 'plan is not displayed before consultation');
  for (let i = 0; i < 7; i++) ui.sceneAction('next');
  assert.match(ui.dialog.innerHTML, /이제 할 일/);
  assert.match(ui.dialog.innerHTML, /의뢰인 재면담과 기존 영상·진료·현장 자료/);
  assert.doesNotMatch(ui.dialog.innerHTML, /반나절 4번/);
  ui.sceneAction('finish');
  assert.equal(ui.dialog.open, false);
  assert.match(ui.node.innerHTML, /법률 검토/);
  assert.match(ui.node.innerHTML, /재면담·자료 검토 완료/);
});

test('consultation replay leaves a partially edited internal plan untouched', () => {
  const ui = boot();
  ui.finishIntro();
  ui.click('edit'); ui.changeLayout(false); ui.click('save-edit');
  assert.match(ui.node.innerHTML, /이번 계획에서 제외/);
  ui.click('replay-intro');
  assert.equal(ui.dialog.open, true);
  ui.finishIntro();
  assert.equal(ui.dialog.open, false);
  assert.match(ui.node.innerHTML, /이번 계획에서 제외/);
  ui.click('approve'); ui.click('show-record');
  assert.match(ui.node.innerHTML, /현장 동선 · 미실행/);
});
