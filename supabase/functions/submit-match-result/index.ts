// GO GAME — validation co-signée d'un résultat de duel en ligne.
// Un résultat classé n'est créé que si les DEUX joueurs soumettent le même
// match_key, le même vainqueur et le même hash final déterministe.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function clean(value: unknown, max = 120): string {
  return String(value ?? "").trim().slice(0, max);
}
function uuidOrNull(value: unknown): string | null {
  const v = clean(value, 40);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ? v : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "server_not_configured" }, 500);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "missing_bearer_token" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user) return json({ error: "invalid_session" }, 401);

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json({ error: "invalid_json" }, 400);

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

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (replayId) {
    const { data: replay } = await admin
      .from("shared_replays")
      .select("owner_id,replay_hash")
      .eq("id", replayId)
      .maybeSingle();
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

  const { error: claimError } = await admin
    .from("match_result_claims")
    .upsert(claim, { onConflict: "match_key,player_id" });
  if (claimError) return json({ error: "claim_failed", detail: claimError.message }, 500);

  const { data: existing } = await admin
    .from("match_results")
    .select("id")
    .eq("match_key", matchKey)
    .maybeSingle();
  if (existing) return json({ status: "already_verified", match_id: existing.id });

  const { data: counterClaim, error: counterError } = await admin
    .from("match_result_claims")
    .select("*")
    .eq("match_key", matchKey)
    .eq("player_id", opponentId)
    .maybeSingle();
  if (counterError) return json({ error: "counterclaim_lookup_failed", detail: counterError.message }, 500);
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

  const { data: inserted, error: insertError } = await admin
    .from("match_results")
    .insert({
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
    })
    .select("id")
    .single();

  if (insertError) {
    if ((insertError as { code?: string }).code === "23505") return json({ status: "already_verified" });
    return json({ error: "verified_insert_failed", detail: insertError.message }, 500);
  }
  return json({ status: "verified", match_id: inserted.id });
});
