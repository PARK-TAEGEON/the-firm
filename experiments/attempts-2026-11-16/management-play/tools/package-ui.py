#!/usr/bin/env python3
"""Package the UI-only revision, prove frozen source parity, and record provenance."""
from pathlib import Path
import argparse, difflib, hashlib, json, shutil, zipfile

ROOT = Path(__file__).resolve().parents[1]
def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--baseline-zip', required=True)
    parser.add_argument('--out', required=True)
    args = parser.parse_args()
    baseline = Path(args.baseline_zip).resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(baseline) as z:
        previous = {n[len('project/'):]: z.read(n) for n in z.namelist()
                    if n.startswith('project/') and not n.endswith('/')}
    if not previous:
        raise RuntimeError('Expected handoff archive project/ source')
    frozen = [r for r in previous if r == 'src/engine.js' or r == 'RULES.md'
              or r.startswith('assets/') or r.startswith('godot/')]
    for rel in frozen:
        if not (ROOT / rel).is_file() or (ROOT / rel).read_bytes() != previous[rel]:
            raise RuntimeError('Out-of-scope source changed: ' + rel)
    changed, patch = [], []
    exclude = {'docs/ui-source-diff.patch', 'docs/ui-provenance.json'}
    def included(p):
        rel = p.relative_to(ROOT)
        if not p.is_file() or any(x in {'.git','__pycache__','node_modules'} for x in rel.parts):
            return False
        if rel.parts[0] == 'docs' and p.suffix.lower() in {'.png','.jpg','.jpeg','.webp'}:
            return len(rel.parts) > 1 and rel.parts[1] in {'ui-before','ui-after'}
        return True
    for p in sorted(ROOT.rglob('*')):
        if not included(p):
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel in exclude:
            continue
        data = p.read_bytes()
        if previous.get(rel) == data:
            continue
        changed.append(rel)
        if p.suffix in {'.js','.cjs','.py','.md','.css','.html'} and len(data) < 250000:
            patch.extend(difflib.unified_diff(previous.get(rel,b'').decode('utf-8-sig').splitlines(keepends=True),
                data.decode('utf-8-sig').splitlines(keepends=True), fromfile='before/'+rel,tofile='after/'+rel))
    (ROOT/'docs/ui-source-diff.patch').write_text(''.join(patch),encoding='utf-8')
    html = ROOT/'dist/THE_FIRM_Management_Play_v0.4.html'
    provenance = dict(baseline_zip_sha256=digest(baseline.read_bytes()),
        baseline_html_sha256=digest(previous['dist/THE_FIRM_Management_Play_v0.4.html']),
        engine_sha256=digest((ROOT/'src/engine.js').read_bytes()),
        frozen_files_checked=len(frozen),frozen_files_byte_identical=True,
        engine_schema_or_economy_changed=False,source_has_git=(ROOT/'.git').exists(),
        github_reference='PARK-TAEGEON/the-firm@30dc3b25fa7cef6a600a689cd0b1a1cac49cd1d8',
        changed_or_new_files=changed,runtime_html_sha256=digest(html.read_bytes()))
    (ROOT/'docs/ui-provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    target_html = out/'THE_FIRM_UI_Improved.html'
    shutil.copyfile(html,target_html)
    source = out/'THE_FIRM_UI_Improved_Source.zip'
    with zipfile.ZipFile(source,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for p in sorted(ROOT.rglob('*')):
            if included(p): z.write(p,Path('THE_FIRM_UI_Improved')/p.relative_to(ROOT))
        references=ROOT.parent/'references'
        if references.is_dir():
            for p in sorted(references.rglob('*')):
                if p.is_file(): z.write(p,Path('THE_FIRM_UI_Improved/references')/p.relative_to(references))
        for original,exported in [('01_UI_IMPROVEMENT_TASK.md','UI_IMPROVEMENT_TASK.md'),
                ('02_REFERENCE_BRIEF.md','REFERENCE_BRIEF.md'),
                ('03_ACCEPTANCE_CHECKLIST.md','ACCEPTANCE_CHECKLIST.md'),('MANIFEST.json','INPUT_MANIFEST.json')]:
            p=ROOT.parent/original
            if p.is_file(): z.write(p,Path('THE_FIRM_UI_Improved')/exported)
        z.write(html,'THE_FIRM_UI_Improved.html')
        z.writestr('START_THE_FIRM.cmd','@echo off\r\nstart "" "%~dp0THE_FIRM_UI_Improved.html"\r\n')
        z.writestr('START_HERE.txt',('THE FIRM UI improvement\r\n'
            'Open THE_FIRM_UI_Improved.html in Chrome or Edge. No server or network required.\r\n'
            'Source and tests: THE_FIRM_UI_Improved/\r\n'
            'Before/after: THE_FIRM_UI_Improved/docs/UI_COMPARISON.html\r\n'
            'Report: THE_FIRM_UI_Improved/REPORT.md\r\n'))
    with zipfile.ZipFile(source) as z:
        if z.testzip() is not None: raise RuntimeError('Archive validation failed')
        if z.read('THE_FIRM_UI_Improved.html') != html.read_bytes(): raise RuntimeError('HTML mismatch')
        if z.read('THE_FIRM_UI_Improved/src/engine.js') != previous['src/engine.js']:
            raise RuntimeError('Engine mismatch')
    for p in (target_html,source): print(json.dumps(dict(path=str(p),bytes=p.stat().st_size,sha256=digest(p.read_bytes()))))

if __name__ == '__main__':
    main()
