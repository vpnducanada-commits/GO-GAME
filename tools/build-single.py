#!/usr/bin/env python3
"""Génère la version autonome 1 fichier de Godson FURY ARENA.
Fusionne index.html + src/style.css + src/*.js en un seul HTML partageable.
La version est lue depuis GAME_VERSION dans src/engine.js : aucune
constante de release ne doit être recopiée à la main dans ce builder.
Usage : python3 tools/build-single.py
Signé : Gédéon - Godson
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "src" / "style.css").read_text(encoding="utf-8")
engine = (ROOT / "src" / "engine.js").read_text(encoding="utf-8")

version_match = re.search(r'GAME_VERSION\s*=\s*"([0-9]+(?:\.[0-9]+){1,2})"', engine)
if not version_match:
    raise SystemExit("GAME_VERSION introuvable dans src/engine.js")
version = version_match.group(1)
short_version = ".".join(version.split(".")[:2])

html = html.replace(
    '<link rel="stylesheet" href="src/style.css">',
    "<style>\n" + css + "\n</style>",
)
for name in ("engine.js", "render.js", "render3d.js", "ui.js"):
    js = engine if name == "engine.js" else (ROOT / "src" / name).read_text(encoding="utf-8")
    assert "</script>" not in js, f"Balise fermante interdite dans {name}"
    html = html.replace(
        f'<script src="src/{name}"></script>',
        "<script>\n" + js + "\n</script>",
    )

out = ROOT / f"Godson-FURY-Arena-V{short_version}-PRO.html"
header = f"<!-- Godson FURY ARENA V{short_version} — L’Arène des Légendes — version autonome 1 fichier — signé Gédéon - Godson © 2026 -->\n"
out.write_text(header + html, encoding="utf-8")
print(f"OK -> {out.name} ({out.stat().st_size/1024:.0f} Ko)")
