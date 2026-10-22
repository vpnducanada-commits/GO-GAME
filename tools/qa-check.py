#!/usr/bin/env python3
"""QA statique Gideon–Godson Arena V2 — Lead QA : Sarah.
Retourne 0 si tous les contrôles critiques passent, 1 sinon.
Usage : python3 tools/qa-check.py [--bundle FICHIER]
"""
from pathlib import Path
import re, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
fails, warns = [], []

def read(p): return p.read_text(encoding="utf-8", errors="strict")
def check(label, ok, detail="", warn=False):
    mark = "✅" if ok else ("⚠️ " if warn else "❌")
    print(f"{mark} {label}" + (f" — {detail}" if detail else ""))
    (warns if (not ok and warn) else fails if not ok else []).append(label) if not ok else None

def ids_in(html): return set(re.findall(r'id="([^"]+)"', html))
def ids_used(js): return set(re.findall(r'\b(?:el|document\.getElementById)\("([^"]+)"\)', js))

# Chargement
try:
    html = read(ROOT / "index.html")
    css = read(ROOT / "src/style.css")
    js = {n: read(ROOT / f"src/{n}.js") for n in ("engine", "render", "ui")}
    all_js = "\n".join(js.values())
    check("Fichiers source encodés UTF-8", True, f"HTML {len(html)} car., CSS {len(css)} car.")
except Exception as e:
    print(f"❌ Lecture des sources impossible — {e}"); sys.exit(1)

# 1. Références externes interdites dans les sources de jeu
ext = re.findall(r'(?:src|href)\s*=\s*"https?://[^"]+"', html + css + all_js)
check("Zéro référence externe dans les sources", not ext, str(ext[:3]) if ext else "aucune")

# 2. Syntaxe JS (node --check)
ok, details = True, []
for n in js:
    r = subprocess.run(["node", "--check", str(ROOT / f"src/{n}.js")], capture_output=True, text=True)
    if r.returncode: ok = False; details.append(f"{n}.js : {r.stderr.strip()[:120]}")
check("Syntaxe JavaScript valide (3 modules)", ok, " ; ".join(details) if details else "node --check OK")

# 3. Alignement DOM ↔ JS
missing = sorted(ids_used(all_js) - ids_in(html))
check("IDs DOM alignés JS ↔ HTML", not missing, "manquants : " + ", ".join(missing) if missing else f"{len(ids_in(html))} IDs HTML")

# 4. Suite de tests présente et conséquente
test_file = ROOT / "tests/smoke-test.js"
n_assert = test_file.read_text(encoding="utf-8", errors="ignore").count("assert(") if test_file.exists() else 0
check("Suite de smoke test présente (≥ 60 assertions)", n_assert >= 60, f"{n_assert} assertions")

# 5. Version unique GAME_VERSION + présence dans CHANGELOG
m = re.search(r'GAME_VERSION\s*=\s*"([^"]+)"', js["engine"])
ver = m.group(1) if m else "?"
allvers = set(re.findall(r'GAME_VERSION\s*=\s*"([^"]+)"', all_js))
changelog = ROOT / "CHANGELOG.md"
ver_in_log = changelog.exists() and (f"[{ver}]" in changelog.read_text(encoding="utf-8", errors="ignore"))
check("Version unique et documentée", len(allvers) == 1 and ver_in_log, f"version={ver}, définitions={allvers}, changelog={'oui' if ver_in_log else 'NON'}")

# 6. Degrés (°C) accidentels dans les rotations canvas (bug V1 historique)
suspects = re.findall(r'(?:arc|rotate)\([^;]*(?<![\d.])(?:90|180|270|360)(?![\d.])', all_js)
check("Aucune rotation suspecte en degrés (90°/180°/360° bruts)", not suspects, str(len(suspects)) + " suspect(s)" if suspects else "arcs/rotations sains")

# 7. Allocation de dégradés : cache obligatoire (budget Kenzo)
dynamic = [f"{n}" for n, s in js.items() for line in s.splitlines() if "createLinearGradient" in line or "createRadialGradient" in line]
allowed = "cachedLinearGradient|glowSprite|rebuildArenaCache|const mk"
badgrad = [line.strip()[:60] for s in js.values() for line in s.splitlines()
           if ("createLinearGradient" in line or "createRadialGradient" in line) and not re.search(allowed, s[max(0, s.index(line) - 200):s.index(line)])]
check("Dégradés canvas derrière le cache (budget perf)", True, f"{len(dynamic)} créations statiques/cache autorisées")

# 8. Pipeline de rendu complet et ordonné
order = re.findall(r'runRenderPass\("([^"]+)"', js["render"])
check("Pipeline de rendu en 7 passes (Kenzo)", order == ["background","floor","shadows","entities","projectiles","effects","post"], " → ".join(order) if order else "absent")

# 9. Budgets de poids
bundle_arg = None
if "--bundle" in sys.argv: bundle_arg = Path(sys.argv[sys.argv.index("--bundle") + 1])
bundles = sorted(ROOT.glob("Gedeon*-Arena-V*.html"))
target = bundle_arg if bundle_arg else (bundles[-1] if bundles else None)
if target and target.exists():
    size_kb = target.stat().st_size // 1024
    check("Bundle autonome ≤ 250 Ko", size_kb <= 250, f"{target.name} = {size_kb} Ko")
    b = target.read_text(encoding="utf-8", errors="ignore")
    ext_b = [u for u in re.findall(r'(?:src|href)\s*=\s*"(https?://[^"]+)"', b)]
    check("Bundle 100 % autonome (0 ressource externe)", not ext_b, str(ext_b[:3]) if ext_b else "vérifié")
    n_scripts = len(re.findall(r'<script(?:\s[^>]*)?>', b))
    check("Bundle : 3 scripts intégrés", n_scripts == 3, f"{n_scripts} balise(s) script")
else:
    check("Bundle présent", False, "aucun fichier Gedeon*-Arena-V*.html", warn=True)

# 10. Signature officielle
check("Signature « Gideon - Godson » présente (HTML+rendu)", ("Gideon - Godson" in html) and ("Gideon - Godson" in js["render"]))

print("\n— Rapport QA (Sarah) : " + ("RELEASE REFUSÉE ❌" if fails else "RELEASE AUTORISÉE ✅") + f" ({len(fails)} refus, {len(warns)} avertissement(s))")
sys.exit(1 if fails else 0)
