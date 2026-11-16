#!/usr/bin/env python3
"""Package the verified experiment, preserving private QA screenshots locally."""
from pathlib import Path
import argparse
import difflib
import hashlib
import json
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def included(p):
    rel = p.relative_to(ROOT)
    return (p.is_file() and not any(x in {'.git', '__pycache__', 'node_modules'} for x in rel.parts)
            and not (rel.parts[0] == 'docs' and p.suffix.lower() in {'.png','.jpg','.jpeg','.webp'}))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', required=True)
    parser.add_argument('--baseline-zip', required=True)
    args = parser.parse_args()
    out = Path(args.out).resolve()
    baseline = Path(args.baseline_zip).resolve()
    out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(baseline) as z:
        previous = {n.split('the-firm-management-slice/',1)[-1]:z.read(n)
                    for n in z.namelist() if not n.endswith('/')}
    changed, diff = [], []
    for p in sorted(ROOT.rglob('*')):
        if not included(p):
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel in {'docs/play-source-diff.patch','docs/play-provenance.json'}:
            continue
        data = p.read_bytes()
        if previous.get(rel) == data:
            continue
        changed.append(rel)
        if p.suffix in {'.js','.cjs','.py','.md','.css'} and len(data) < 200000:
            old = previous.get(rel,b'').decode('utf-8-sig').splitlines(keepends=True)
            new = data.decode('utf-8-sig').splitlines(keepends=True)
            diff.extend(difflib.unified_diff(old,new,fromfile='before/'+rel,tofile='after/'+rel))
    old_godot = {r for r in previous if r.startswith('godot/')}
    new_godot = {p.relative_to(ROOT).as_posix() for p in (ROOT/'godot').rglob('*') if p.is_file()}
    godot_same = old_godot == new_godot and all((ROOT/r).read_bytes()==previous[r] for r in old_godot)
    if not godot_same:
        raise RuntimeError('Godot changed outside the contract')
    (ROOT/'docs/play-source-diff.patch').write_text(''.join(diff),encoding='utf-8')
    metadata = {
        'baseline_zip_sha256':sha(baseline.read_bytes()),
        'godot_files_byte_identical':godot_same,
        'changed_or_new_files':changed,
        'source_has_git':(ROOT/'.git').exists(),
        'runtime_html_sha256':sha((ROOT/'dist/THE_FIRM_Management_Play_v0.4.html').read_bytes()),
        'engine_sha256':sha((ROOT/'src/engine.js').read_bytes()),
        'screenshots_in_deliverable':False,
    }
    (ROOT/'docs/play-provenance.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    source = out/'THE_FIRM_Management_Play_v0.4_Source.zip'
    with zipfile.ZipFile(source,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for p in sorted(ROOT.rglob('*')):
            if included(p):
                z.write(p,Path('the-firm-management-slice')/p.relative_to(ROOT))
    with zipfile.ZipFile(source) as z:
        assert z.testzip() is None
        for name in ['PLAY_REPORT.md','docs/PLAY_REVIEW.md','tools/play-verify.cjs']:
            assert 'the-firm-management-slice/'+name in z.namelist()
    html=out/'THE_FIRM_Management_Play_v0.4.html'
    shutil.copyfile(ROOT/'dist/THE_FIRM_Management_Play_v0.4.html',html)
    for p in [html,source]:
        print(json.dumps({'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())}))

if __name__=='__main__':
    main()
