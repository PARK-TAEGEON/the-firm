'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = __dirname;
const index = JSON.parse(fs.readFileSync(path.join(root, 'attempts.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'SNAPSHOT_MANIFEST.json'), 'utf8'));
assert.equal(index.status, 'archived_experiments_not_adopted');
assert.equal(index.production_imports_permitted, false);
assert.equal(index.authority.accepted_design, false);
assert.equal(index.attempts.length, 4);
const resolve = rel => {
  const resolved = path.resolve(root, rel);
  assert.ok(resolved.startsWith(root + path.sep), 'Path outside archive: ' + rel);
  return resolved;
};
for (const attempt of index.attempts) {
  assert.ok(fs.statSync(resolve(attempt.path)).isDirectory());
  assert.ok(attempt.limitations.length && attempt.resume_conditions.length);
  if (attempt.entrypoint) assert.ok(fs.statSync(resolve(attempt.entrypoint)).isFile());
  if (attempt.source.tracked_patch) assert.ok(fs.statSync(resolve(attempt.source.tracked_patch)).isFile());
}
const paths = new Set();
let indexedFiles = 0;
let indexBlobs;
let gitRoot;
if (process.argv.includes('--index')) {
  const {execFileSync} = require('node:child_process');
  gitRoot = execFileSync('git', ['rev-parse','--show-toplevel'], {cwd:root,encoding:'utf8'}).trim();
  const listing = execFileSync('git',['ls-files','--stage','-z'],{cwd:gitRoot,encoding:'utf8',maxBuffer:4*1024*1024});
  indexBlobs = new Map(listing.split('\0').filter(Boolean).map(row => {
    const match = row.match(/^\d+ ([a-f0-9]+) 0\t(.+)$/);
    assert.ok(match, 'Invalid or unmerged index entry');
    return [match[2],match[1]];
  }));
}
for (const file of manifest) {
  assert.ok(!paths.has(file.path)); paths.add(file.path);
  const bytes = fs.readFileSync(resolve(file.path));
  assert.equal(bytes.length, file.bytes, file.path + ' size');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path + ' hash');
  if (indexBlobs) {
    const rel = path.relative(gitRoot,resolve(file.path)).split(path.sep).join('/');
    const blob = crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
    assert.equal(indexBlobs.get(rel),blob, file.path + ' staged bytes');
    indexedFiles++;
  }
}
const html = fs.readFileSync(resolve(index.attempts[0].entrypoint));
assert.equal(crypto.createHash('sha256').update(html).digest('hex'), index.attempts[0].verification_2026_11_16.html_sha256);
console.log(JSON.stringify({status:'PASS',attempts:index.attempts.length,snapshotFiles:manifest.length,indexedFiles,hashFailures:0,indexFailures:0}));
