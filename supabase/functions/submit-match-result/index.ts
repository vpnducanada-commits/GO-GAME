// GO GAME — validation co-signée d'un résultat de duel en ligne.
// Un résultat classé n'est créé que si les DEUX joueurs soumettent le même
// match_key, le même vainqueur et le même hash final déterministe.
//
// Implémentation volontairement sans import externe : Auth et PostgREST sont
// appelés avec fetch. Le fichier peut donc être déployé tel quel par l'API
// Supabase sans étape de transpile/bundle susceptible de provoquer un
// BOOT_ERROR avant même l'exécution du handler.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function clean(value, max = 120) {
  return String(value ?? "").trim().slice(0, max);
}
function uuidOrNull(value) {
  const v = clean(value, 40);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ? v : null;
}
async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch (_err) { return text; }
}
function errorDetail(data) {
  if (!data) return "";
  if (typeof data === "string") return data.slice(0, 240);
  return String(data.message || data.error_description || data.error || data.detail || "").slice(0, 240);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "server_not_configured" }, 500);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "missing_bearer_token" }, 401);

  async function adminRest(path, options = {}) {
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    };
    if (options.prefer) headers.Prefer = options.prefer;
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body == null ? undefined : JSON.stringify(options.body),
    });
    return { ok: response.ok, status: response.status, data: await readJson(response) };
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: authHeader },
  });
  const user = await readJson(userResponse);
  if (!userResponse.ok || !user || !user.id) return json({ error: "invalid_session" }, 401);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ error: "invalid_json" }, 400);

  const matchKey = clean(body.match_key ?? body.matchKey, 120);
  const playerOneId = uuidOrNull(body.player_one_id ?? body.playerOneId);
  const playerTwoId = uuidOrNull(body.player_two_id ?? body.playerTwoId);
  const winnerId = uuidOrNull(body.winner_id ?? body.winnerId);
  const verificationHash = clean(body.verification_hash ?? body.verificationHash, 80);
  const replayHash = clean(body.replay_hash ?? body.replayHash, 80) || null;
  let replayId = uuidOrNull(body.replay_id ?? body.replayId);

  if (matchKey.length < 8 || !playerOneId || !playerTwoId || !winnerId || verificationHash.length < 6) {
    return json({ error: "missing_or_invalid_fields" }, 400);
  }
  if (playerOneId === playerTwoId) return json({ error: "players_must_differ" }, 400);
  if (user.id !== playerOneId && user.id !== playerTwoId) return json({ error: "caller_not_in_match" }, 403);
  if (winnerId !== playerOneId && winnerId !== playerTwoId) return json({ error: "winner_not_in_match" }, 400);

  const opponentId = user.id === playerOneId ? playerTwoId : playerOneId;
  const playerOneFighter = clean(body.player_one_fighter ?? body.playerOneFighter, 48) || null;
  const playerTwoFighter = clean(body.player_two_fighter ?? body.playerTwoFighter, 48) || null;
  const arena = clean(body.arena, 48) || null;
  const arenaMoodRaw = clean(body.arena_mood ?? body.arenaMood, 24).toLowerCase();
  const arenaMood = ["auto", "jour", "crepuscule", "nuit"].includes(arenaMoodRaw) ? arenaMoodRaw : null;

  if (replayId) {
    const replayResult = await adminRest(`shared_replays?select=owner_id,replay_hash&id=eq.${encodeURIComponent(replayId)}&limit=1`);
    const replay = replayResult.ok && Array.isArray(replayResult.data) ? replayResult.data[0] : null;
    if (!replay || ![playerOneId, playerTwoId].includes(replay.owner_id) || (replay.replay_hash && replayHash && replay.replay_hash !== replayHash)) {
      replayId = null;
    }
  }

  const claim = {
    match_key: matchKey,
    player_id: user.id,
    opponent_id: opponentId,
    player_one_id: playerOneId,
    player_two_id: playerTwoId,
    winner_id: winnerId,
    player_one_fighter: playerOneFighter,
    player_two_fighter: playerTwoFighter,
    arena,
    arena_mood: arenaMood,
    mode: "online",
    verification_hash: verificationHash,
    replay_hash: replayHash,
    replay_id: replayId,
    claim: { game_version: clean(body.game_version ?? body.gameVersion, 24), submitted_at: new Date().toISOString() },
  };

  const claimResult = await adminRest("match_result_claims?on_conflict=match_key,player_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: claim,
  });
  if (!claimResult.ok) return json({ error: "claim_failed", detail: errorDetail(claimResult.data) }, 500);

  const existingResult = await adminRest(`match_results?select=id&match_key=eq.${encodeURIComponent(matchKey)}&limit=1`);
  if (!existingResult.ok) return json({ error: "existing_lookup_failed", detail: errorDetail(existingResult.data) }, 500);
  const existing = Array.isArray(existingResult.data) ? existingResult.data[0] : null;
  if (existing) return json({ status: "already_verified", match_id: existing.id });

  const counterResult = await adminRest(`match_result_claims?select=*&match_key=eq.${encodeURIComponent(matchKey)}&player_id=eq.${encodeURIComponent(opponentId)}&limit=1`);
  if (!counterResult.ok) return json({ error: "counterclaim_lookup_failed", detail: errorDetail(counterResult.data) }, 500);
  const counterClaim = Array.isArray(counterResult.data) ? counterResult.data[0] : null;
  if (!counterClaim) return json({ status: "waiting_counterparty" });

  const same = counterClaim.player_one_id === playerOneId &&
    counterClaim.player_two_id === playerTwoId &&
    counterClaim.winner_id === winnerId &&
    counterClaim.verification_hash === verificationHash &&
    (counterClaim.replay_hash === replayHash || !counterClaim.replay_hash || !replayHash) &&
    (counterClaim.player_one_fighter === playerOneFighter || !counterClaim.player_one_fighter || !playerOneFighter) &&
    (counterClaim.player_two_fighter === playerTwoFighter || !counterClaim.player_two_fighter || !playerTwoFighter) &&
    (counterClaim.arena === arena || !counterClaim.arena || !arena) &&
    (counterClaim.arena_mood === arenaMood || !counterClaim.arena_mood || !arenaMood);
  if (!same) return json({ status: "mismatch", error: "counterparty_claim_differs" }, 409);

  const insertedResult = await adminRest("match_results", {
    method: "POST",
    prefer: "return=representation",
    body: {
      match_key: matchKey,
      player_one_id: playerOneId,
      player_two_id: playerTwoId,
      winner_id: winnerId,
      player_one_fighter: playerOneFighter,
      player_two_fighter: playerTwoFighter,
      arena,
      arena_mood: arenaMood,
      mode: "online",
      verified: true,
      verification_hash: verificationHash,
      replay_id: replayId ?? counterClaim.replay_id ?? null,
    },
  });

  if (!insertedResult.ok) {
    if (insertedResult.data && insertedResult.data.code === "23505") return json({ status: "already_verified" });
    return json({ error: "verified_insert_failed", detail: errorDetail(insertedResult.data) }, 500);
  }
  const inserted = Array.isArray(insertedResult.data) ? insertedResult.data[0] : insertedResult.data;
  return json({ status: "verified", match_id: inserted && inserted.id ? inserted.id : null });
});
