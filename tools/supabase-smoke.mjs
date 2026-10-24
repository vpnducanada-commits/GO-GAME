#!/usr/bin/env node
/**
 * Smoke test public du backend Supabase GO GAME.
 * Vérifie uniquement les lectures publiques protégées par RLS.
 * Aucune clé secrète n'est utilisée.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const configPath = join(rootDir, 'supabase', 'public-config.json');
const fileConfig = JSON.parse(await readFile(configPath, 'utf8'));

const supabaseUrl = (process.env.GO_GAME_SUPABASE_URL || fileConfig.supabaseUrl).replace(/\/$/, '');
const publishableKey = process.env.GO_GAME_SUPABASE_PUBLISHABLE_KEY || fileConfig.publishableKey;

if (!supabaseUrl || !publishableKey) {
  console.error('❌ Configuration publique GO GAME incomplète.');
  process.exit(1);
}

const endpoints = [
  '/rest/v1/leaderboard?select=*&limit=5',
  '/rest/v1/player_profiles?select=id,display_name,country_code&limit=5',
  '/rest/v1/shared_replays?select=id,title,is_public,replay_hash,game_version,created_at&is_public=eq.true&order=created_at.desc&limit=5',
];

let failures = 0;
for (const endpoint of endpoints) {
  const response = await fetch(`${supabaseUrl}${endpoint}`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      Accept: 'application/json',
    },
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  const ok = response.ok && Array.isArray(body);
  console.log(`${ok ? '✅' : '❌'} ${endpoint} → HTTP ${response.status}`);
  if (!ok) {
    failures += 1;
    console.error(String(text).slice(0, 400));
  }
}

if (failures) process.exit(1);
console.log('✅ Backend public GO GAME reachable; RLS public reads OK.');
