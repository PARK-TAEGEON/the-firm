#!/usr/bin/env python3
"""Build a self-contained offline review HTML. Python standard library only."""
from pathlib import Path
import base64

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist' / 'THE_FIRM_Management_Play_v0.4.html'
COMPAT_OUT = ROOT / 'dist' / 'THE_FIRM_Management_Play_v0.3.html'

def data_url(path: Path, mime: str) -> str:
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode('ascii')

def build() -> Path:
    font = ROOT / 'assets/fonts/FirmSans-Subset.ttf'
    if not font.exists():
        font = ROOT / 'assets/fonts/NotoSansKR.ttf'
    font_css = "@font-face{font-family:'Firm Sans';src:url('" + data_url(font, 'font/ttf') + "') format('truetype');font-weight:100 900;font-style:normal;font-display:swap}"
    css = (ROOT / 'src/style.css').read_text(encoding='utf-8').replace('/*__ATLAS__*/', data_url(ROOT / 'assets/art/staff-atlas.png', 'image/png'))
    html = (ROOT / 'src/index.template.html').read_text(encoding='utf-8')
    replacements = {
        '/*__FONT__*/': font_css,
        '/*__STYLE__*/': css,
        '/*__ENGINE__*/': (ROOT / 'src/engine.js').read_text(encoding='utf-8'),
        '/*__UI__*/': (ROOT / 'src/ui.js').read_text(encoding='utf-8'),
    }
    for marker, value in replacements.items():
        if marker not in html:
            raise RuntimeError('Missing template marker: ' + marker)
        html = html.replace(marker, value)
    if '/*__' in html:
        raise RuntimeError('Unresolved build marker')
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding='utf-8')
    # Keep the existing verification entry point usable; this is the same new build.
    COMPAT_OUT.write_text(html, encoding='utf-8')
    print(str(OUT))
    print(f'{OUT.stat().st_size:,} bytes; offline font and portraits embedded')
    return OUT

if __name__ == '__main__':
    build()
