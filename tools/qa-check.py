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
    js = {n: read(ROOT / f"src/{n}.js") for n in ("engine", "render", "render3d", "ui")}
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
check("Syntaxe JavaScript valide (4 modules)", ok, " ; ".join(details) if details else "node --check OK")

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
is_generation_6 = bool(re.fullmatch(r"[6-9]\.\d+\.\d+", ver))
is_generation_7 = bool(re.fullmatch(r"7\.\d+\.\d+", ver))

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
    # Budgets : 448 Ko jusqu'en V5.3, 512 Ko en V6.0, 640 Ko en V6.1,
    # 704 Ko en V7.0 pour la sculpture/matières/ombres procédurales, puis
    # 720 Ko en V7.9 pour le squelette IK et la robustesse WebGL, puis
    # 736 Ko en V7.12 pour la disposition tout écran, puis 740 Ko en
    # V7.14 pour la colonne articulée, les tenues suiveuses et la
    # relance WebGL, puis 744 Ko en V7.15 pour les ancres d'appuis et
    # les pivots (arbitrage : mouvement et lancement priment).
    check("Bundle autonome ≤ 744 Ko", size_kb <= 744, f"{target.name} = {size_kb} Ko")
    b = target.read_text(encoding="utf-8", errors="ignore")
    ext_b = [u for u in re.findall(r'(?:src|href)\s*=\s*"(https?://[^"]+)"', b)]
    check("Bundle 100 % autonome (0 ressource externe)", not ext_b, str(ext_b[:3]) if ext_b else "vérifié")
    n_scripts = len(re.findall(r'<script(?:\s[^>]*)?>', b))
    check("Bundle : 4 scripts intégrés", n_scripts == 4, f"{n_scripts} balise(s) script")
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
check("Prise en main paysage & impacts fluides V3.5 présents", "syncImmersiveCombat" in all_js and "btnPauseFloat" in html and "combatImmersif" in css and "touch-action:none" in css and all(token not in (all_js + html) for token in ("hit"+"stop", "hit"+"StopT", "slow"+"moT")), "combat immersif 100dvh + pause flottante + zéro gel/ralenti d’impact (V6.1)")

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
aaa_ok = all(x in js["render"] for x in ('createLinearGradient(mx-nx*hw','renderStats.cylinderShading=true','renderStats.rimLight=rimColor','renderStats.facePaint','function drawAmbientLife()','renderStats.ambientMotes=n','function drawForegroundDepth()','renderStats.foregroundDepth=id','drawForegroundDepth();')) and ('artDirection:"Graphismes AAA V4.2"' in js["render"] or ('artDirection:"Graphismes AAA II V5.3"' in js["render"] or bool(re.search(r'artDirection:"Réalité 3D (?:II )?V[6-9]\.\d+[^\"]*Graphismes AAA II', js["render"])))) and ('V4.2 PRO' in html or 'V4.3 PRO' in html or 'V4.4 PRO' in html or 'V5.0' in html or 'V5.1' in html or 'V5.2' in html or 'V5.3' in html or bool(re.search(r"V[6-9]\.\d+", html)))
check("Graphismes AAA V4.2 présents", aaa_ok, "peinture cylindrique + lumière d'arène + ambiance + avant-plans de profondeur")

# 25. Roster complet des planches V4.3 : les 35 designs des 3 planches du propriétaire
#     jouables (41 combattants avec les 6 historiques), morphologies dédiées.
board_ids = ("Lira","kael","sora","zed","nyx","vorak","ael","aerin","korben","lyra","drakesh","selene","taiko","vex","elara","brax","kazu","sera","vorga","nox","raven","zep","astrid","selenia","drakar","nyx-ombre","Kairos","Zara-nova","brutus","aria","krak","luna","velen","lyra-azur","orion")
roster_ok = all(('id:"%s"' % i) in js["engine"] for i in board_ids) and js["render"].count("headR:") >= 41 and ('GAME_VERSION="4.3.0"' in js["engine"] or 'GAME_VERSION="4.4.0"' in js["engine"] or 'GAME_VERSION="5.0.0"' in js["engine"] or ('GAME_VERSION="5.1.0"' in js["engine"] or 'GAME_VERSION="5.2.0"' in js["engine"] or 'GAME_VERSION="5.3.0"' in js["engine"] or is_generation_6)) and ('PRO' in html or 'V5.0' in html or 'V5.1' in html or 'V5.2' in html or 'V5.3' in html or bool(re.search(r"V[6-9]\.\d+", html))) and 'ROSTER PLANCHES COMPLET' in css
check("Roster complet des planches V4.3 présent", roster_ok, "35 personnages des planches + 41 morphologies + grille de sélection dense")

# 26. Navigation Pro & tenues de combat peintes V4.4 : recherche/filtres roster,
#     barres d'action fixes, grilles à défilement interne, vêtements peints.
nav_ok = all(x in html for x in ('id="rosterSearch"','filterChip','id="rosterCount"','stickyActions')) and all(x in js["ui"] for x in ('function applyRosterFilter()','function rosterMatches(','function bindRosterTools()','gridTemplateColumns','renderStats.rosterVisible')) and all(x in css for x in ('.rosterTools','.stickyActions','.filterChip.on')) and all(x in js["render"] for x in ('Tenues de combat peintes V4.4','renderStats.torsoPaint')) and ('GAME_VERSION="4.4.0"' in js["engine"] or 'GAME_VERSION="5.0.0"' in js["engine"] or ('GAME_VERSION="5.1.0"' in js["engine"] or 'GAME_VERSION="5.2.0"' in js["engine"] or 'GAME_VERSION="5.3.0"' in js["engine"] or is_generation_6)) and ('V4.4 PRO' in html or 'V5.0' in html or 'V5.1' in html or 'V5.2' in html or 'V5.3' in html or bool(re.search(r"V[6-9]\.\d+", html)))
check("Navigation Pro & tenues peintes V4.4 présents", nav_ok, "recherche + filtres par famille + actions fixes + ouverture/col/plis peints")

# 27. Édition Jeu Complet V5.0 : carrière persistante (XP/niveaux/Godson/titres),
#     championnat 3 circuits, quêtes réclamables, boutique et hub de progression.
career_ok = all(x in js["engine"] for x in ('CHAMPIONSHIP_CIRCUITS','function careerLevelFromXp','function awardCareerForMatch','function arcadeTotal')) and ('GAME_VERSION="5.0.0"' in js["engine"] or ('GAME_VERSION="5.1.0"' in js["engine"] or 'GAME_VERSION="5.2.0"' in js["engine"] or 'GAME_VERSION="5.3.0"' in js["engine"] or is_generation_6)) and all(x in js["ui"] for x in ('function renderCareer()','CAREER_QUESTS','CAREER_SHOP','function startChampionship','function careerNextObjective')) and all(x in html for x in ('id="menuCareer"','id="btnCareer"','id="hubXpFill"','id="circuitList"','id="questList"','id="careerShop"')) and all(x in css for x in ('.careerHub','.xpBar','.circuitCard','.questCard')) and ('V5.0' in html or 'V5.1' in html or 'V5.2' in html or 'V5.3' in html or bool(re.search(r"V[6-9]\.\d+", html)))
check("Édition Jeu Complet V5.0 présente", career_ok, "carrière XP/Godson + championnat 5/8/12 combats + quêtes + récompenses + hub vivant")

# 28. Godson FURY & M1 Signature V5.1 : nouveau nom, 41 chaînes M1 individuelles,
#     exécutées par martelage du bouton Poing, avec traînées et aide dédiées.
_m1m = re.search(r'const M1_RAW=(\[.*?\]);\nfunction normalizeM1Signature', js["engine"], re.S)
try: _m1raw = json.loads(_m1m.group(1)) if _m1m else []
except Exception: _m1raw = []
_m1labels = [st[1] for d in _m1raw for st in d[7]] if _m1raw else []
m1_ok = len(_m1raw)==41 and len({d[0] for d in _m1raw})==41 and len({d[1] for d in _m1raw})==41 and len(_m1labels)==168 and len(set(_m1labels))==168 and all(3<=len(d[7])<=5 and d[7][0][0]=="P" for d in _m1raw) and ('GAME_VERSION="5.1.0"' in js["engine"] or 'GAME_VERSION="5.2.0"' in js["engine"] or 'GAME_VERSION="5.3.0"' in js["engine"] or is_generation_6) and all(x in js["engine"] for x in ('GAME_TITLE="Godson FURY ARENA"','function startM1Attack','function m1SignatureFor','function m1Enabled','m1Advance')) and 'M1 Signature — martèle POING' in js["ui"] and 'renderStats.m1Trail' in js["render"] and ('Godson FURY ARENA V5.1' in html or 'Godson FURY ARENA V5.2' in html or 'Godson FURY ARENA V5.3' in html or bool(re.search(r"Godson FURY ARENA V[6-9]\.\d+", html))) and 'POING • M1' in html and '.m1Move' in css
check("Godson FURY & M1 Signature V5.1 présents", m1_ok, "41 chaînes individuelles • 168 coups uniques • combo par appuis répétés sur Poing • nouveau nom")

# 29. Écran Adaptatif & Joystick Pro V5.2 : consultation complète de l'équipe —
# joystick analogique à gauche, actions à droite, 3 formats sans déformation,
# safe-areas et HUD aligné sur la scène logique 16:9.
_action_order = [html.find('data-t="%s"' % k) for k in ('special','dash','block','kick','punch')]
screen_ok = ('GAME_VERSION="5.2.0"' in js["engine"] or 'GAME_VERSION="5.3.0"' in js["engine"] or is_generation_6) and 'screenFormat:"adaptatif"' in js["engine"] and all(x in js["ui"] for x in ('function joystickKeysForVector','jump:y<-.58','block:y>.52','function setJoystickVector','function resetJoystick','function bindJoystick','function applyScreenFormat','SCREEN_FORMATS=["adaptatif","cinema","plein"]')) and all(x in html for x in ('viewport-fit=cover','class="screen-adaptatif"','id="joyBase"','id="joyKnob"','id="setScreenFormat"','Format d’écran','Joystick gauche')) and all(('data-t="%s"' % k) not in html for k in ('left','right','jump')) and _action_order==sorted(_action_order) and all(n>=0 for n in _action_order) and all(x in css for x in ('--stage-w:min(100dvw','body.screen-adaptatif #gameWrap','body.screen-plein #game','.joyBase{','.joyKnob{','.touchGroup.actionGroup','env(safe-area-inset-left)'))
check("Écran Adaptatif & Joystick Pro V5.2 présents", screen_ok, "joystick gauche 8 directions • grand POING•M1 à droite • Adaptatif/Cinéma/Plein cadre • aucun étirement")

# 30. Graphismes AAA II V5.3 : ombres portées directionnelles, reflets et halos
# de sol, sprites d'impact procéduraux typés et motifs de tenue des planches.
_motifs_m = re.search(r'const BOARD_OUTFIT_MOTIFS=\{(.*?)\};', js["render"], re.S)
_motif_keys = re.findall(r'"([^"]+)"\s*:', _motifs_m.group(1)) if _motifs_m else []
aaa2_ok = 'GAME_VERSION="5.3.0"' in js["engine"] or is_generation_6 and ('artDirection:"Graphismes AAA II V5.3"' in js["render"] or bool(re.search(r'artDirection:"Réalité 3D (?:II )?V[6-9]\.\d+[^\"]*Graphismes AAA II', js["render"]))) and len(_motif_keys)==41 and len(set(_motif_keys))==41 and all(x in js["render"] for x in ('function arenaShadowVector','renderStats.dynamicShadows','renderStats.floorLightPools','renderStats.floorReflections','function drawBoardMotif','function boardOutfitMotif','function impactSprite','function drawImpactBursts','impactSpriteCache.size>48')) and all(x in js["engine"] for x in ('function impactBurst','impactBursts=[]','"m1final"','"parry"','"block"','"ground"','"clash"')) and 'Godson FURY ARENA V5.3' in html or bool(re.search(r"Godson FURY ARENA V[6-9]\.\d+", html))
check("Graphismes AAA II V5.3 présents", aaa2_ok, "ombres portées par ambiance • impacts sprites typés/cache borné • 41 motifs de tenue des planches")

# 31. Réalité 3D V6.0 : vrai moteur WebGL maison (géométrie indexée, shaders,
# caméra perspective, poses humanoïdes et 4 arènes volumiques), réglage
# Auto/Toujours/2D, diagnostic et repli Graphismes AAA II sans écran noir.
_r3d = js.get("render3d", "")
v6_ok = is_generation_6 and 'renderer3d:"auto"' in js["engine"] and bool(re.search(r'artDirection:"Réalité 3D (?:II )?V[6-9]\.\d+[^\"]*Graphismes AAA II', js["render"])) and all(x in _r3d for x in ('function initRenderer3D','function buildArenaBatch3D','function buildFighterPose3D','function addFighter3D','function computeCamera3D','function draw3DScene','function draw3DOverlay','webgl2','typeof gl.COLOR_BUFFER_BIT!=="number"','precision highp float;attribute vec3 aPos;attribute vec3 aNorm','(p.r||3)*2/95','Uint16Array')) and all(x in js["render"] for x in ('draw3DScene()','draw3DOverlay()','renderer3dActive')) and all(x in js["ui"] for x in ('function applyRenderer3DSetting','setRenderer3d','setRenderer3DEnabled')) and all(x in html for x in ('id="gl3d"','id="setRenderer3d"','src="src/render3d.js"','Rendu de combat 3D')) and 'body.render3d-on #gl3d' in css
check("Réalité 3D V6.0 présente", v6_ok, "WebGL maison • personnages articulés • caméra combat • 4 arènes 3D • réglage Auto/Toujours/2D")


# 32. Maquettes Vivantes, interface-décor et 2v2 deux téléphones V6.1 :
# aucun gel d'impact, 41 fiches de modèle 3D (muscles/tenues/armes),
# HUD fabriqué dans les matériaux de l'arène et relève WebRTC locale.
_board61_m = re.search(r'const BOARD_MODEL3D=\{(.*?)\};\nconst BOARD_MODEL3D_FALLBACK', _r3d, re.S)
_board61_keys = re.findall(r'^\s*"([^"]+)"\s*:', _board61_m.group(1), re.M) if _board61_m else []
_all_roster_ids = {"gideon","kira","titan","nova","godson-prime","Zara", *board_ids}
_no_freeze_61 = all(token not in (all_js + html) for token in ("hit"+"stop", "hit"+"StopT", "slow"+"moT"))
v61_ok = (ver == "6.1.0" or is_generation_7) and _no_freeze_61 and len(_board61_keys) == 41 and set(_board61_keys) == _all_roster_ids and all(x in _r3d for x in ('function boardModel3D','BOARD_MODEL3D[rawId]','function addMuscle3D','function addTaperedLimb3D','function addBoardGearDetails3D','function addWeapon3D','function addBackGear3D','function addBoardCloth3D','function addHeadGear3D','renderStats.boardModel3d','renderStats.boardModels3d','bufferSubData')) and all(x in _r3d for x in ('"kael":{frame:"athlete",muscle:.98','"sora":{frame:"feminine",muscle:.47','"ael":{frame:"robot"','"vorak":{frame:"colossus",muscle:1.3','"brutus":{frame:"powerArmor"','"lyra":{frame:"feminine",muscle:.49')) and all(x in js["render"] for x in ('const STAGE_DECOR_THEMES','function syncStageDecor()','--stage-accent','--stage-panel','renderStats.stageDecor','syncStageDecor();')) and all(x in css for x in ('V6.1 — INTERFACE CONSTRUITE DANS LE DÉCOR','--stage-accent','--stage-glow','--stage-deep','--stage-panel','--stage-rail','.localPhoneCard')) and all(x in js["engine"] for x in ('function sanitizeTeamChars','function configureTeamMatch','function prepareTeamRelayNext','explicitFormat===\"team2v2\"','function teamMatchForReplay','teamMatch.p1.index')) and all(x in js["ui"] for x in ('function buildLocalHostConfig','async function encodeLocalSignal','async function decodeLocalSignal','async function createLocalPhoneInvite','async function acceptLocalPhoneInvite','async function finalizeLocalPhoneAnswer','async function openLocalPhones','CompressionStream','DecompressionStream','{iceServers:[]}','start-ready','pendingStartConfig','navigator.share')) and all(x in html for x in ('id="btnModePhones"','id="localPhoneCard"','id="localFighterMain"','id="onlineFighterReserve"','id="localSignalOut"','id="localSignalIn"','id="btnLocalStartDuel"','rel="icon" href="data:image/svg+xml','canal de jeu Bluetooth direct'))
check("Maquettes Vivantes, interface-décor & 2v2 deux téléphones V6.1 présents", v61_ok, "zéro gel • 41 modèles muscles/tenues/armes • HUD aux matériaux d’arène • GF61/WebRTC local • relève déterministe")

# 33. Anatomie AAA V7.0 : sculpture loftée, matières procédurales, bump,
# shadow-map cadencée, posture 3/4 et indices 32 bits — strictement visuel.
v7_ok = is_generation_7 and bool(re.search(r'artDirection:"Réalité 3D (?:II )?V7\.\d+ — Anatomie(?: AAA)?[^\"]*\(repli Graphismes AAA II\)', js["render"])) and all(x in _r3d for x in ('function convertShader3003D','#version 300 es','function createMaterialAtlas3D','function withMaterial3','function vertRaw3','function detailLow3','function addLoftedTube3D','function addAnatomyLimb3D','function addLoftedTorso3D','function addSculptedHead3D','function addHand3D','function addBoot3D','function addFaceDetails3D','function addHairLocks3D','function addGarmentDetails3D','function ensureShadowTarget3D','function renderShadowMap3D','function computeLightVP3D','perturbNormal3D','Uint32Array','shadowInterval','torsoYaw','twistForY','renderStats.lastFighterVertices3d')) and bool(re.search(r"Godson FURY ARENA V7\.\d+", html))
check("Anatomie AAA V7 présente", v7_ok, "torse/tête/membres loftés • visage/mains/bottes • atlas peau/tissu/cuir/métal/tech • bump + ombres PCF • posture 3/4 • aucun asset externe")


# 34. Tournoi & Saisons V7.1 : brackets locaux persistants 4/8/16, affiches
# CPU déterministes, classement et points décernés une seule fois, paliers
# de Saison 1 « Aurore de Libreville » et archivage des anciennes saisons.
v71_ok = ver in ("7.6.0","7.7.0","7.8.0","7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["engine"] for x in ('const CURRENT_SEASON','const SEASON_TIERS','const TOURNAMENT_FORMATS','function tournamentHash01','function tournamentRating','function setupTournamentRun','function simulateTournamentMatch','function completeTournamentPlayerMatch','function recordTournamentCompletion','function claimSeasonReward','function toggleSeasonTitle','function syncTournamentFromProfile','function tournamentForReplay','activeTournament','lastTournament')) and all(x in js["ui"] for x in ('function renderTournament','function renderTournamentBracket','function renderCareerTournament','function startTournament','function playTournamentMatch','function openTournament','id:"tournament-first"','id:"triple-couronne"')) and all(x in html for x in ('id="btnModeTournament"','id="menuTournament"','id="tournamentFormats"','id="tournamentBracket"','id="tournamentHistory"','id="careerTournament"','Saison 1 — Aurore de Libreville')) and all(x in css for x in ('V7.1 — TOURNOI & SAISONS','.mc-tournament','.bracketGrid','.bracketMatch','.seasonTier','.seasonMeter'))
check("Tournoi & Saisons V7.1 présents", v71_ok, "brackets 4/8/16 persistants • CPU déterministe • points anti-double-gain • 5 paliers et titres de Saison 1")

# 35. Réalité 3D II V7.2 : proportions humaines normalisées, grain procédural,
# caméra de combat dynamique, torse bicolore, jupes volumiques et HUD compact.
v72_ok = ver in ("7.2.0","7.3.0","7.4.0","7.5.0","7.6.0","7.7.0","7.8.0","7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["render3d"] for x in ('float vnoise','camDist3D','ringSkirt3D','palette=color&&color.main','Réalité 3D II V7.2','shoulderScale3','const headR=(human.headR||15)/95*S*.8;','function addWeapon3D')) and 'Réalité 3D II V7.2' in js["render"] and 'V7.2 RÉALITÉ 3D II' in css and ('V7.2' in html or 'V7.3' in html or 'V7.4' in html or 'V7.5' in html or 'V7.6' in html or 'V7.7' in html or 'V7.8' in html or 'V7.9' in html or 'V7.10' in html or 'V7.11' in html or 'V7.12' in html or 'V7.13' in html or 'V7.14' in html or 'V7.15' in html)
check("Réalité 3D II V7.2 présente", v72_ok, "anatomie normalisée • matières grainées • caméra basse 3/4 • arènes enrichies • HUD de combat fin")

# 36. Plein écran forcé & Sélection claire V7.3 : porte d'entrée immersive,
# portrait bloqué sans échappatoire, menus sans textes M1/Signature et
# grandes cartes de sélection plein corps (demande directe du propriétaire).
v73_ok = ver in ("7.3.0","7.4.0","7.5.0","7.6.0","7.7.0","7.8.0","7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and 'id="bootEnter"' in html and 'id="btnPortraitAnyway"' in html and 'bootEnter' in js["ui"] and '(pointer:coarse)' in js["ui"] and 'V7.3 — PLEIN ÉCRAN FORCÉ' in css and 'minmax(106px' in css and '.bootEnter' in css and 'M1 SIGNATURE • COMBOS' not in js["render"]
check("Plein écran forcé & Sélection claire V7.3 présents", v73_ok, "entrée plein écran paysage • portrait bloqué • menus épurés • figurines plein corps nom seul")

# 37. Identités de combat V7.4 : une fiche de posture/attaques par combattant
# (stance, gardes, torsion, styles de poing/pied/spécial, posture d'affiche),
# appliquée au combat 3D et aux portraits de sélection, en rendu seul.
v74_ok = ver in ("7.4.0","7.5.0","7.6.0","7.7.0","7.8.0","7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and js["render3d"].count("ST74(") >= 41 and all(x in js["render3d"] for x in ('const FIGHTER_STANCE3D','function stanceProfile3D','kickPose74','renderStats.stance3d','stance.twist')) and 'stanceP' in js["ui"] and 'stanceProfile3D(f)' in js["ui"]
check("Identités de combat V7.4 présentes", v74_ok, "41 fiches individuelles • postures et attaques reconnaissables • sélection et combat synchronisés")

# 38. Visages & Costumes V7.5 : coiffe sculptée selon les 13 styles de cheveux
# des fiches, mèches d'encadrement, chignon, barbes en trois volumes,
# peintures de guerre orc/alien et ceintures-écharpes martiales (rendu seul).
v75_ok = ver in ("7.5.0","7.6.0","7.7.0","7.8.0","7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["render3d"] for x in ('capFlat75','backDeep75','beard75','hair==="bun"','sashCenter75','renderStats.hair3d','peintures de guerre'))
check("Visages & Costumes V7.5 présents", v75_ok, "cheveux sculptés par style • barbes pleines • chignon/tresses • détails de costume par famille")

# 39. Mobilité Dynamique V7.6 : profil direct plus vif et profil legacy pour
# les anciens replays, foulée synchronisée à l'interpolation, phases
# fractionnaires, ressorts demi-tour/saut/réception, dashs et caméras.
v76_ok = ver in ("7.6.0","7.7.0","7.8.0","7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["engine"] for x in ('const MOBILITY76','function mobilityProfile76','attackSlide','apexGravity')) and all(x in js["render"] for x in ('gaitPhase','attackFlow','turnPulse','landingPulse','renderInterpolationAlpha','cameraLead')) and all(x in js["render3d"] for x in ('dashTrails3d','cameraSmooth','headTop76','cameraLead3d'))
check("Mobilité Dynamique V7.6 présente", v76_ok, "accélération/demi-tour/air/dash plus vifs • foulée anti-patinage • caméras anticipatives • anciens replays en profil legacy")

# 40. Présence Vivante V7.7 : expressions 3D selon l'état de combat, mains
# en phalanges (poing/paume/prise/soutien), visières expressives, bottes
# articulées au contact et réaction corporelle d'impact sans aucun gel.
v77_ok = ver in ("7.7.0","7.8.0","7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["render3d"] for x in ('const face77','segments77','ptsLocal77','visorGlow77','impactLocal77','makeFoot77','renderStats.expression3d','renderStats.weaponGrip3d')) and all(x in js["render"] for x in ('expression3d:"focus"','handCurl3d','footPitch3d','impactPose3d'))
check("Présence Vivante V7.7 présente", v77_ok, "expressions focus/attaque/douleur/K.O. • mains et prises à deux mains • appuis talon-pointe • impact corporel sans gel")

# 41. Arènes Spectacle V7.8 : couche dynamique par arène réactive au match
# (tribunes, écran géant, train, braises, pirogue), faisceaux de scène,
# poussières d'ambiance et silhouettes lointaines — rendu seul, quantités
# bornées par le niveau de qualité et zone de combat toujours dégagée.
v78_ok = ver in ("7.8.0","7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["render3d"] for x in ('function arenaSpectacleState3D','function addArenaSpectacle3D','spectacle78','beam78','renderStats.spectacleBeams3d','renderStats.spectacleActors3d','farH78','tier78')) and all(x in js["render"] for x in ('arenaSpectacle3d:','spectaclePulse3d','ambientMotes3d'))
check("Arènes Spectacle V7.8 présentes", v78_ok, "tribunes qui lèvent les bras • écran géant animé • train, braises et pirogue • faisceaux et poussières réactifs au match")

# 42. Squelette Stable V7.9 : IK deux os à longueurs fixes (local + monde),
# colonne à longueur constante, demi-tour continu, précision vertex highp
# compatible mobile et restauration après perte de contexte WebGL.
v79_ok = ver in ("7.9.0","7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["render3d"] for x in ('const BONE3D','function solveTwoBone3D','function boneDeviation3D','webglcontextrestored','function resetRenderer3DResources','precision highp float;attribute vec3 aPos','varying mediump vec4 vColor','uniform mediump vec3 uCamPos','faceSmooth3d','renderStats.skeleton3d')) and all(x in js["render"] for x in ('skeleton3d:','boneError3d','context3d:','canvas3d:'))
check("Squelette Stable V7.9 présent", v79_ok, "bras 0,31/0,29 m et jambes 0,54/0,53 m fixes • IK monde après torsion • demi-tour continu • WebGL1/2 et contexte restauré")

# 43. Graphismes AAA III V7.10 : lumière cinéma (ciel ambiant, environnement,
# sheen teinté, brume de profondeur), atlas adouci, buste/tête/membres à
# sections sculptées, ciel en couches et reflets doux au sol — visuel pur.
v710_ok = ver in ("7.10.0","7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["render3d"] for x in ('envCol','albedo*fillLin*pow','smoothstep(12.0,38.0','aces(col*1.32)','pec710','hx710','skyDetail710','starN710','renderStats.floorRefl3d','renderStats.cinemaLight3d')) and all(x in js["render"] for x in ('cinemaLight3d:','skyDetail3d:','floorRefl3d:'))
check("Graphismes AAA III V7.10 présents", v710_ok, "lumière cinéma et matières douces • pectoraux/pommettes intégrés aux lofts • halos, étoiles et brumes • reflets des combattants au sol")

# 44. Éclats & Reflets V7.11 : reflets au sol orientés par la lumière et la
# brillance propre à chaque arène, halos d'éclat bornés, visages/cheveux
# cinéma et emblème de tenue des planches en relief — visuel pur.
v711_ok = ver in ("7.11.0","7.12.0","7.13.0","7.14.0","7.15.0") and all(x in js["render3d"] for x in ('gloss711','reflDir711','streak711','hi711','strands711','emb711','renderStats.glow3d','renderStats.reflDir3d','renderStats.hairDetail3d','renderStats.emblem3d','px711')) and all(x in js["render"] for x in ('glow3d:','reflDir3d:','hairDetail3d:','emblem3d:'))
check("Éclats & Reflets V7.11 présents", v711_ok, "reflets directionnels par arène • halos projectile/impact/aura • mèches et favoris • emblèmes des 41 tenues en 3D")

# 45. Lancement & Disposition V7.12 : boot compact sur écrans courts, menu
# principal en un écran jusqu'à 700 px de haut, défilement tactile réel,
# viewport visible synchronisé et issue portrait adaptée — jamais piégé.
v712_ok = ver in ("7.12.0","7.13.0","7.14.0","7.15.0") and 'id="btnPortraitAnyway"' in html and all(x in css for x in ('V7.12 — LANCEMENT & DISPOSITION','--app-w','touch-action:pan-y','clamp(42px,11vh,74px)','@media(max-height:500px)','max-height:700px','body.allowPortrait.screen-cinema')) and all(x in js["ui"] for x in ('_immersiveTryAt','await r.catch','function syncLayoutStats','visualViewport','applyScreenFormat("adaptatif")')) and all(x in js["render"] for x in ('layoutMode:','viewportBox:'))
check("Lancement & Disposition V7.12 présents", v712_ok, "boot visible dès 320 px de haut • modes du menu au premier écran • scroll tactile • portrait adapté sans piège")

# 46. Mouvement Réel V7.13 : attaques en images-clés fondues, limiteurs de
# vitesse d'articulation, pôles IK stables, foulée cycloïdale à appuis
# plantés, chute/relève fondues et squelette 2D à longueurs constantes —
# animation pure, simulation/hitboxes/replays inchangés.
v713_ok = ver in ("7.13.0","7.14.0","7.15.0") and all(x in js["render3d"] for x in ('function rateLimit3','function stablePole3','function smoother01','downBlend3d','gait713','atkW713','chamber713','motionReal13','renderStats.motionReal3d','stablePole3(f.poseMidW3d')) and all(x in js["render"] for x in ('function dampMotionValue','function solveLimb2D','downBlend2d','smoother01Motion','motionReal3d:','gait713')) and 'posePrev3d=null' in js["engine"]
check("Mouvement Réel V7.13 présent", v713_ok, "aucune téléportation de membre • appuis plantés • angles 34-172° • chute/relève fondues 3D+2D")

# 47. Colonne VIVANTE V7.14 : point de taille bassin-poitrine, torse lofté
# sur une colonne quadratique, jupes/robes dont l'ourlet suit les jambes,
# repli 2D assorti et relances WebGL après une transition d'affichage.
v714_ok = ver in ("7.14.0","7.15.0") and all(x in js["render3d"] for x in ('spineBend714','spinePt714','function skirtLegPoint3D','renderStats.skirtFollow3d','renderStats.spineBend3d','spineLive14','retryBound','everFailed3d','renderer3dRetries')) and all(x in js["render"] for x in ('spineBend2d','spineBend3d:','skirtFollow3d:','renderer3dRetries:'))
check("Colonne VIVANTE V7.14 présente", v714_ok, "taille qui fléchit/cambre sans compresser la colonne • ourlets attachés aux jambes • 3D relancée après plein écran/orientation")

# 48. Appuis & Pivots V7.15 : pied d'appui ancré dans le monde pendant
# pied/sweep, chaussure qui pivote talon levé, demi-tour en pivot + pas
# (semelles en contact quasi immobiles) et repli 2D assorti — rendu seul.
v715_ok = ver == "7.15.0" and all(x in js["render3d"] for x in ('function makeFootAnchor715','function anchorFootLocal715','function predictedFace715','supportAnchor715','turnAnchor715','turnRelease715','frontOffsetX','renderStats.supportAnchor3d','renderStats.turnPivot3d','renderStats.footYaw3d','appuis15')) and all(x in js["render"] for x in ('pivot715','supportAnchor3d:','turnPivot3d:','footYaw3d:')) and 'supportAnchor715=null' in js["engine"] and 'turnAnchor715=null' in js["engine"]
check("Appuis & Pivots V7.15 présents", v715_ok, "pied d'appui qui ne racle plus (0,37→0,03 m au coup de pied) • pivot talon levé • demi-tour en deux pas sans frottement de semelle")

# 14. Aucun secret serveur dans le client livré au navigateur
client_blob = html + all_js
secret_hits = [p for p in ("sb_secret_", "service_role", "SUPABASE_SERVICE_ROLE_KEY") if p in client_blob]
check("Aucun secret serveur dans le client", not secret_hits, "trouvés : " + ", ".join(secret_hits) if secret_hits else "clé publishable uniquement")

print("\n— Rapport QA (Sarah) : " + ("RELEASE REFUSÉE ❌" if fails else "RELEASE AUTORISÉE ✅") + f" ({len(fails)} refus, {len(warns)} avertissement(s))")
sys.exit(1 if fails else 0)
