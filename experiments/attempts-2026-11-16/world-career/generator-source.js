'use strict';
// Read-only, commit-pinned CommonJS loading. No checkout, copy, or generator edits.
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const Module = require('node:module');
const COMMIT = 'b6a15ea37ed54864bdb13058a2b3b2874fd4d231';
const root = path.resolve(__dirname, '../..');
const cache = new Map();
let files;
function read(file) {
  return execFileSync('git', ['show', `${COMMIT}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}
function load(request, parent = 'courtroom-prototype/generator/entry.js') {
  if (Module.isBuiltin(request)) return require(request);
  if (!request.startsWith('.')) throw Error(`external dependency forbidden: ${request}`);
  files ||= new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', COMMIT, 'courtroom-prototype'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/));
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(parent), request));
  const file = [base, `${base}.js`, `${base}.json`, `${base}/index.js`].find(f => files.has(f));
  if (!file || !file.startsWith('courtroom-prototype/')) throw Error(`missing pinned dependency: ${request}`);
  if (cache.has(file)) return cache.get(file).exports;
  const m = new Module(path.join(root, file));
  cache.set(file, m);
  try {
    if (file.endsWith('.json')) m.exports = JSON.parse(read(file));
    else {
      m.filename = path.join(root, file);
      m.require = child => load(child, file);
      m._compile(read(file), m.filename);
    }
    return m.exports;
  } catch (e) { cache.delete(file); throw e; }
}
function generator() {
  return { content: load('./content'), automatic: load('./core/automatic'),
    trial: load('../engine/trial'), catalog: load('./content/catalog-data.json'), commit: COMMIT };
}
// Presentation helper appeared after the pinned trial engine. Load that one
// dependency at a separate immutable revision; adjudication stays unchanged.
const KOREAN_COMMIT = '00b59c6cb086f526f9fa610c03a3404b987e9b18';
let koreanModule;
function korean() {
  if (!koreanModule) {
    const file = 'courtroom-prototype/generator/content/korean.js';
    const source = execFileSync('git', ['show', `${KOREAN_COMMIT}:${file}`], { cwd: root, encoding: 'utf8' });
    const m = new Module(path.join(root, file));
    m.filename = path.join(root, file);
    m.require = () => { throw Error('unexpected Korean helper dependency'); };
    m._compile(source, m.filename); koreanModule = m.exports;
  }
  return koreanModule;
}
module.exports = { generator, COMMIT, korean, KOREAN_COMMIT };
