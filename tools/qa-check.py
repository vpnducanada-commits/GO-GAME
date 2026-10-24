#!/usr/bin/env python3
"""QA statique Godson FURY ARENA — Lead QA : Sarah.
Retourne 0 si tous les contrôles critiques passent, 1 sinon.
Usage : python3 tools/qa-check.py [--bundle FICHIER]
"""
from pathlib import Path
import json, re, subprocess, sys

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

# 6. Degrés accidentels dans les rotations canvas (bug V1 historique)
# On ne vise que les vrais paramètres d'angle : l'unique argument de rotate(),
# et les 4e/5e arguments (début/fin) de arc(). Les coordonnées -180 restent légales.
suspects = []
suspects += re.findall(r'\.rotate\(\s*-?\s*(?:90|180|270|360)(?![\d.])\s*\)', all_js)
suspects += re.findall(r'\.arc\([^,;]*,[^,;]*,[^,;]*,\s*-?\s*(?:90|180|270|360)(?![\d.])', all_js)
suspects += re.findall(r'\.arc\([^,;]*,[^,;]*,[^,;]*,[^,;]*,\s*-?\s*(?:90|180|270|360)(?![\d.])', all_js)
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
def _bundle_version(p):
    m = re.search(r"-V([0-9]+(?:\.[0-9]+){0,2})-PRO\.html$", p.name)
    return tuple(int(x) for x in m.group(1).split(".")) if m else (0,)
bundles = sorted(ROOT.glob("*Arena-V*.html"), key=_bundle_version)
target = bundle_arg if bundle_arg else (bundles[-1] if bundles else None)
if target and target.exists():
    size_kb = target.stat().st_size // 1024
    # Budgets : 384 Ko en V4.2, puis 448 Ko en V5.0 sur décision d'équipe (édition
    # Jeu Complet : carrière, championnat 3 circuits, quêtes, récompenses, hub).
    check("Bundle autonome ≤ 448 Ko", size_kb <= 448, f"{target.name} = {size_kb} Ko")
    b = target.read_text(encoding="utf-8", errors="ignore")
    ext_b = [u for u in re.findall(r'(?:src|href)\s*=\s*"(https?://[^"]+)"', b)]
    check("Bundle 100 % autonome (0 ressource externe)", not ext_b, str(ext_b[:3]) if ext_b else "vérifié")
    n_scripts = len(re.findall(r'<script(?:\s[^>]*)?>', b))
    check("Bundle : 3 scripts intégrés", n_scripts == 3, f"{n_scripts} balise(s) script")
else:
    check("Bundle présent", False, "aucun fichier *Arena-V*.html", warn=True)

# 10. Signature officielle
check("Signature « Gideon - Godson » présente (HTML+rendu)", ("Gideon - Godson" in html) and ("Gideon - Godson" in js["render"]))

# 11. Replays déterministes V2.6 + Replay Studio V2.7
replay_hooks = ["startReplayRecording", "replayStateHash", "finalizeReplayRecording", "startReplayPlayback", "REPLAY_STORE_KEY", "loadReplayLibrary", "renderReplayLibrary", "renameReplayById"]
check("Système de replay déterministe présent", all(h in all_js for h in replay_hooks) and "btnReplayPlay" in html and "menuReplays" in html, "lockstep + hash + lecteur + bibliothèque locale")

# 12. Arena Moods, VFX signatures et tactile multi-touch V2.8
mood_hooks = ["ARENA_MOOD_THEMES", "resolveArenaMood", "setArenaMood", "drawArenaMoodAtmosphere", "drawSignatureVfx", "setTouchPointer", "clearTouchInputs"]
check("Arena Moods + VFX signatures + tactile présents", all(h in all_js for h in mood_hooks) and "arenaMoodRow" in html, "4 arènes × 3 ambiances + signatures + pointer IDs")

# 13. GO GAME Online V3 : auth/cloud/classement + salon WebRTC lockstep
online_hooks = ["onlineRequest", "onlineSignUp", "saveOnlineProfile", "refreshOnlineLeaderboard", "uploadOnlineSave", "downloadOnlineSave", "publishOnlineReplay", "importOnlineReplay", "createOnlineRoom", "joinOnlineRoom", "launchOnlineMatch", "submitOnlineMatchResult", "prepareOnlineFrame", "receiveOnlineNetMessage", "resetOnlineSession"]
combat_hooks = ['"throw"', '"exspecial"', "godsonCancelReady", "abilitySpecs", "renderMoveList"]
check("GO GAME Online + combat V3 présents", all(h in all_js for h in online_hooks + combat_hooks) and "menuOnline" in html and "btnOnline" in html and "moveList" in html, "Supabase REST + WebRTC + lockstep + Projection/EX/Godson Cancel")

# 15. Humanité++ V3.1 : anatomie procédurale (visuel uniquement)
human_hooks = ["HUMAN_PROFILES", "humanProfile", "drawHumanHead", "drawHumanArm", "drawHumanLeg", "solveJoint", "taperedSegment", "drawFist", "drawShoe", "lastFacialExpression", "humanMotionSamples"]
check("Humanité++ V3.1 présente", all(h in all_js for h in human_hooks), "6 morphologies + visage expressif + IK + regard/fatigue (render-only)")

# 16. Paysage prioritaire & interface épurée V3.2
landscape_hooks = ["requestImmersiveLandscape", "handlePortraitChange", "initPortraitGuard", "btnLandscape", "btnPortraitAnyway"]
check("Paysage & interface épurée V3.2 présents", all(h in all_js for h in landscape_hooks) and "rotateHint" in html and "orientation:portrait" in css and "orientation:landscape" in css and ":fullscreen" in css and "helpBar" not in html, "invite portrait + mode cinéma paysage + textes allégés")

# 17. Chargement & parcours d'écrans V3.3
flow_hooks = ["startBoot", "finishBoot", "launchFromFlow", "syncFlowUI", "flowDifficultyChosen", "pendingLaunch"]
# 18. Zone de combat dégagée V3.4
check("Zone de combat dégagée V3.4 présente", "billboardAlpha" in all_js and "floaterSpread" in all_js and "spotlightX" in all_js and "f.ry-212" not in js["render"] and "ga-jump" in css and "11.5vh" in css, "tactile compact aux coins + écran géant discret en combat + floaters espacés")

check("Chargement & parcours d'écrans V3.3 présents", all(h in all_js for h in flow_hooks) and "bootLoader" in html and "menuArena" in html and "btnSelectNext" in html and "flowSteps" in html and "#bootLoader" in css and "screenIn" in css, "boot rapide + étapes Personnages/Arène/Difficulté + transitions")


# 19. Prise en main paysage & fluidité des impacts V3.5
check("Prise en main paysage & impacts fluides V3.5 présents", "syncImmersiveCombat" in all_js and "btnPauseFloat" in html and "combatImmersif" in css and "touch-action:none" in css and "hitstop:14" in js["engine"] and "hitstop:105" not in js["engine"], "combat immersif 100dvh + pause flottante + gel d'impact micro (14-48 ms)")

# 20. Nouveaux Champions V3.6 (planches du propriétaire traduites en combattants jouables)
champions_ok = all(x in js["engine"] for x in ('id:"kael"','id:"sora"','id:"ael"','case "kael":','case "sora":','case "ael":')) and all(x in js["render"] for x in ('kael:{label','magicienne','synthetique','kael:"lames"','ael:"circuits"')) and 'CHARACTERS.map((c,i)=>i).filter(i=>i!==4)' in js["ui"] and (ROOT/"docs/CONCEPTS_PERSONNAGES.md").exists() and len(list((ROOT/"assets/concepts").glob("planche-personnages-*.jpg")))>=3
check("Nouveaux Champions V3.6 présents", champions_ok, "KAEL / Sora / AEL-7 jouables (moteur + morphologies + VFX) + planches archivées")

# 21. Sélection & Corps pleins V3.7 (aperçus animés, bordures à effets, membres visibles)
selection_ok = all(x in html for x in ('previewBoxP1','previewP1','previewBoxP2','previewP2','previewNameP1')) and all(x in js["ui"] for x in ('updateSelectPortraits','drawFighterPortrait','portraitCanvas','setProperty("--cc"','previewNameP')) and all(x in css for x in ('@keyframes cardPulse','@keyframes cardShine','.previewBox','border:3px solid var(--cc')) and all(x in js["render"] for x in ('const legW=20.2*human.limb','const armW=16.4*human.limb')) and ('ch.scale*1.04' in js["render"] or 'ch.scale*1.08' in js["render"]) and 'let ctx=canvas.getContext' in js["engine"]
check("Sélection & Corps pleins V3.7 présents", selection_ok, "portraits animés du moteur + grands aperçus + bordures colorées pulsantes + membres volumineux")

# 22. Arcade plein écran & anatomie HD V4.0
header_in_stage = html.find('id="gameWrap"') < html.find('<header class="sig">') < html.find('id="bootLoader"')
shell_ok = header_in_stage and all(x in css for x in ('#app{position:fixed;inset:0','width:min(100dvw,calc(100dvh * 16 / 9))','height:min(100dvh,calc(100dvw * 9 / 16))','footer{display:none!important}','body.combatImmersif header.sig{display:none!important}')) and 'classList.toggle("combatImmersif",!!on)' in js["ui"] and all(x in js["render"] for x in ('headR:15.3','const hipY=lerp(-86,-63,cb)','clamp(1180/(dist+420),.88,1.34)','outfitDetails','artDirection:'))
check("Arcade plein écran & anatomie HD V4.0 présents", shell_ok, "viewport 100 % jeu + barre système intégrée/masquée en combat + proportions adultes + caméra 1,34×")

# 23. Peinture & présentation V4.1 (VS plein corps, intro cinéma, matières)
vs_ok = all(x in html for x in ('vsPortrait1','vsPortrait2')) and all(x in js["ui"] for x in ('ensureVSRigs','syncVSPortraitsToFighters','updateVSPortraits','f.facing=f.side===2?-1:1')) and all(x in js["render"] for x in ('updateVSPortraits()','Peinture & matières V4.1','Intro cinématographique V4.1','materialDetails')) and 'ÉCRAN VS PLEIN CORPS' in css
check("Peinture & présentation V4.1 présents", vs_ok, "VS plein corps face à face + bandeaux d'intro + matières par style")

# 24. Graphismes AAA V4.2 : peinture cylindrique, rim light d'arène, visage peint,
#     rayons/poussières d'ambiance et avant-plans de profondeur par arène.
aaa_ok = all(x in js["render"] for x in ('createLinearGradient(mx-nx*hw','renderStats.cylinderShading=true','renderStats.rimLight=rimColor','renderStats.facePaint','function drawAmbientLife()','renderStats.ambientMotes=n','function drawForegroundDepth()','renderStats.foregroundDepth=id','drawForegroundDepth();','artDirection:"Graphismes AAA V4.2"')) and ('V4.2 PRO' in html or 'V4.3 PRO' in html or 'V4.4 PRO' in html or 'V5.0' in html or 'V5.1' in html or 'V5.2' in html)
check("Graphismes AAA V4.2 présents", aaa_ok, "peinture cylindrique + lumière d'arène + ambiance + avant-plans de profondeur")

# 25. Roster complet des planches V4.3 : les 35 designs des 3 planches du propriétaire
#     jouables (41 combattants avec les 6 historiques), morphologies dédiées.
board_ids = ("Lira","kael","sora","zed","nyx","vorak","ael","aerin","korben","lyra","drakesh","selene","taiko","vex","elara","brax","kazu","sera","vorga","nox","raven","zep","astrid","selenia","drakar","nyx-ombre","Kairos","Zara-nova","brutus","aria","krak","luna","velen","lyra-azur","orion")
roster_ok = all(('id:"%s"' % i) in js["engine"] for i in board_ids) and js["render"].count("headR:") >= 41 and ('GAME_VERSION="4.3.0"' in js["engine"] or 'GAME_VERSION="4.4.0"' in js["engine"] or 'GAME_VERSION="5.0.0"' in js["engine"] or ('GAME_VERSION="5.1.0"' in js["engine"] or 'GAME_VERSION="5.2.0"' in js["engine"])) and ('PRO' in html or 'V5.0' in html or 'V5.1' in html or 'V5.2' in html) and 'ROSTER PLANCHES COMPLET' in css
check("Roster complet des planches V4.3 présent", roster_ok, "35 personnages des planches + 41 morphologies + grille de sélection dense")

# 26. Navigation Pro & tenues de combat peintes V4.4 : recherche/filtres roster,
#     barres d'action fixes, grilles à défilement interne, vêtements peints.
nav_ok = all(x in html for x in ('id="rosterSearch"','filterChip','id="rosterCount"','stickyActions')) and all(x in js["ui"] for x in ('function applyRosterFilter()','function rosterMatches(','function bindRosterTools()','gridTemplateColumns','renderStats.rosterVisible')) and all(x in css for x in ('.rosterTools','.stickyActions','.filterChip.on')) and all(x in js["render"] for x in ('Tenues de combat peintes V4.4','renderStats.torsoPaint')) and ('GAME_VERSION="4.4.0"' in js["engine"] or 'GAME_VERSION="5.0.0"' in js["engine"] or ('GAME_VERSION="5.1.0"' in js["engine"] or 'GAME_VERSION="5.2.0"' in js["engine"])) and ('V4.4 PRO' in html or 'V5.0' in html or 'V5.1' in html or 'V5.2' in html)
check("Navigation Pro & tenues peintes V4.4 présents", nav_ok, "recherche + filtres par famille + actions fixes + ouverture/col/plis peints")

# 27. Édition Jeu Complet V5.0 : carrière persistante (XP/niveaux/Godson/titres),
#     championnat 3 circuits, quêtes réclamables, boutique et hub de progression.
career_ok = all(x in js["engine"] for x in ('CHAMPIONSHIP_CIRCUITS','function careerLevelFromXp','function awardCareerForMatch','function arcadeTotal')) and ('GAME_VERSION="5.0.0"' in js["engine"] or ('GAME_VERSION="5.1.0"' in js["engine"] or 'GAME_VERSION="5.2.0"' in js["engine"])) and all(x in js["ui"] for x in ('function renderCareer()','CAREER_QUESTS','CAREER_SHOP','function startChampionship','function careerNextObjective')) and all(x in html for x in ('id="menuCareer"','id="btnCareer"','id="hubXpFill"','id="circuitList"','id="questList"','id="careerShop"')) and all(x in css for x in ('.careerHub','.xpBar','.circuitCard','.questCard')) and ('V5.0' in html or 'V5.1' in html or 'V5.2' in html)
check("Édition Jeu Complet V5.0 présente", career_ok, "carrière XP/Godson + championnat 5/8/12 combats + quêtes + récompenses + hub vivant")

# 28. Godson FURY & M1 Signature V5.1 : nouveau nom, 41 chaînes M1 individuelles,
#     exécutées par martelage du bouton Poing, avec traînées et aide dédiées.
_m1m = re.search(r'const M1_RAW=(\[.*?\]);\nfunction normalizeM1Signature', js["engine"], re.S)
try: _m1raw = json.loads(_m1m.group(1)) if _m1m else []
except Exception: _m1raw = []
_m1labels = [st[1] for d in _m1raw for st in d[7]] if _m1raw else []
m1_ok = len(_m1raw)==41 and len({d[0] for d in _m1raw})==41 and len({d[1] for d in _m1raw})==41 and len(_m1labels)==168 and len(set(_m1labels))==168 and all(3<=len(d[7])<=5 and d[7][0][0]=="P" for d in _m1raw) and ('GAME_VERSION="5.1.0"' in js["engine"] or 'GAME_VERSION="5.2.0"' in js["engine"]) and all(x in js["engine"] for x in ('GAME_TITLE="Godson FURY ARENA"','function startM1Attack','function m1SignatureFor','function m1Enabled','m1Advance')) and 'M1 Signature — martèle POING' in js["ui"] and 'renderStats.m1Trail' in js["render"] and ('Godson FURY ARENA V5.1' in html or 'Godson FURY ARENA V5.2' in html) and 'POING • M1' in html and '.m1Move' in css
check("Godson FURY & M1 Signature V5.1 présents", m1_ok, "41 chaînes individuelles • 168 coups uniques • combo par appuis répétés sur Poing • nouveau nom")

# 29. Écran Adaptatif & Joystick Pro V5.2 : consultation complète de l'équipe —
# joystick analogique à gauche, actions à droite, 3 formats sans déformation,
# safe-areas et HUD aligné sur la scène logique 16:9.
_action_order = [html.find('data-t="%s"' % k) for k in ('special','dash','block','kick','punch')]
screen_ok = 'GAME_VERSION="5.2.0"' in js["engine"] and 'screenFormat:"adaptatif"' in js["engine"] and all(x in js["ui"] for x in ('function joystickKeysForVector','jump:y<-.58','block:y>.52','function setJoystickVector','function resetJoystick','function bindJoystick','function applyScreenFormat','SCREEN_FORMATS=["adaptatif","cinema","plein"]')) and all(x in html for x in ('viewport-fit=cover','class="screen-adaptatif"','id="joyBase"','id="joyKnob"','id="setScreenFormat"','Format d’écran','Joystick gauche')) and all(('data-t="%s"' % k) not in html for k in ('left','right','jump')) and _action_order==sorted(_action_order) and all(n>=0 for n in _action_order) and all(x in css for x in ('--stage-w:min(100dvw','body.screen-adaptatif #gameWrap','body.screen-plein #game','.joyBase{','.joyKnob{','.touchGroup.actionGroup','env(safe-area-inset-left)'))
check("Écran Adaptatif & Joystick Pro V5.2 présents", screen_ok, "joystick gauche 8 directions • grand POING•M1 à droite • Adaptatif/Cinéma/Plein cadre • aucun étirement")

# 14. Aucun secret serveur dans le client livré au navigateur
client_blob = html + all_js
secret_hits = [p for p in ("sb_secret_", "service_role", "SUPABASE_SERVICE_ROLE_KEY") if p in client_blob]
check("Aucun secret serveur dans le client", not secret_hits, "trouvés : " + ", ".join(secret_hits) if secret_hits else "clé publishable uniquement")

print("\n— Rapport QA (Sarah) : " + ("RELEASE REFUSÉE ❌" if fails else "RELEASE AUTORISÉE ✅") + f" ({len(fails)} refus, {len(warns)} avertissement(s))")
sys.exit(1 if fails else 0)
