#!/usr/bin/env python3
"""Génère la version autonome 1 fichier de GÉDÉON - Godson ARENA V2.8 PRO.
Fusionne index.html + src/style.css + src/*.js en un seul HTML partageable.
Usage : python3 tools/build-single.py
Signé : Gideon - Godson
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "src" / "style.css").read_text(encoding="utf-8")

html = html.replace(
    '<link rel="stylesheet" href="src/style.css">',
    "<style>\n" + css + "\n</style>",
)
for name in ("engine.js", "render.js", "ui.js"):
    js = (ROOT / "src" / name).read_text(encoding="utf-8")
    assert "</script>" not in js, f"Balise fermante interdite dans {name}"
    html = html.replace(
        f'<script src="src/{name}"></script>',
        "<script>\n" + js + "\n</script>",
    )

out = ROOT / "Gedeon-GODSON-Arena-V2.8-PRO.html"
header = "<!-- GÉDÉON - Godson ARENA V2.8 PRO — version autonome 1 fichier — signé Gideon - Godson © 2026 -->\n"
out.write_text(header + html, encoding="utf-8")
print(f"OK -> {out.name} ({out.stat().st_size/1024:.0f} Ko)")
