-- GO GAME / GÉDÉON - Godson ARENA — backend Supabase initial
-- Migration appliquée sur le projet Supabase « GO GAME » (ref: mcyousugmxgugfremmsq)
-- Sécurité : RLS activé partout ; aucun accès en écriture aux résultats classés côté client.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.player_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 3 and 24),
  country_code char(2) not null default 'GA',
  main_fighter text check (main_fighter is null or char_length(main_fighter) <= 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists player_profiles_display_name_lower_key on public.player_profiles (lower(display_name));

alter table public.player_profiles enable row level security;
drop policy if exists profiles_select_public on public.player_profiles;
create policy profiles_select_public on public.player_profiles for select using (true);
drop policy if exists profiles_insert_own on public.player_profiles;
create policy profiles_insert_own on public.player_profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update_own on public.player_profiles;
create policy profiles_update_own on public.player_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists profiles_delete_own on public.player_profiles;
create policy profiles_delete_own on public.player_profiles for delete using (auth.uid() = id);
drop trigger if exists player_profiles_set_updated_at on public.player_profiles;
create trigger player_profiles_set_updated_at before update on public.player_profiles for each row execute function public.set_updated_at();

create table if not exists public.cloud_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot text not null default 'main' check (char_length(slot) between 1 and 40),
  save_data jsonb not null default '{}'::jsonb,
  game_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slot)
);
alter table public.cloud_saves enable row level security;
drop policy if exists cloud_saves_select_own on public.cloud_saves;
create policy cloud_saves_select_own on public.cloud_saves for select using (auth.uid() = user_id);
drop policy if exists cloud_saves_insert_own on public.cloud_saves;
create policy cloud_saves_insert_own on public.cloud_saves for insert with check (auth.uid() = user_id);
drop policy if exists cloud_saves_update_own on public.cloud_saves;
create policy cloud_saves_update_own on public.cloud_saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists cloud_saves_delete_own on public.cloud_saves;
create policy cloud_saves_delete_own on public.cloud_saves for delete using (auth.uid() = user_id);
drop trigger if exists cloud_saves_set_updated_at on public.cloud_saves;
create trigger cloud_saves_set_updated_at before update on public.cloud_saves for each row execute function public.set_updated_at();

create table if not exists public.shared_replays (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Replay GO GAME' check (char_length(title) between 1 and 80),
  is_public boolean not null default false,
  replay_data jsonb not null,
  replay_hash text,
  game_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shared_replays_owner_created_idx on public.shared_replays (owner_id, created_at desc);
alter table public.shared_replays enable row level security;
drop policy if exists shared_replays_select_public_or_own on public.shared_replays;
create policy shared_replays_select_public_or_own on public.shared_replays for select using (is_public or auth.uid() = owner_id);
drop policy if exists shared_replays_insert_own on public.shared_replays;
create policy shared_replays_insert_own on public.shared_replays for insert with check (auth.uid() = owner_id);
drop policy if exists shared_replays_update_own on public.shared_replays;
create policy shared_replays_update_own on public.shared_replays for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists shared_replays_delete_own on public.shared_replays;
create policy shared_replays_delete_own on public.shared_replays for delete using (auth.uid() = owner_id);
drop trigger if exists shared_replays_set_updated_at on public.shared_replays;
create trigger shared_replays_set_updated_at before update on public.shared_replays for each row execute function public.set_updated_at();

create table if not exists public.match_results (
  id uuid primary key default gen_random_uuid(),
  player_one_id uuid references auth.users(id) on delete set null,
  player_two_id uuid references auth.users(id) on delete set null,
  winner_id uuid references auth.users(id) on delete set null,
  player_one_fighter text,
  player_two_fighter text,
  arena text,
  arena_mood text check (arena_mood is null or arena_mood in ('auto','jour','crepuscule','nuit')),
  mode text,
  verified boolean not null default false,
  verification_hash text,
  replay_id uuid references public.shared_replays(id) on delete set null,
  created_at timestamptz not null default now(),
  check (winner_id is null or winner_id = player_one_id or winner_id = player_two_id)
);
create index if not exists match_results_players_idx on public.match_results (player_one_id, player_two_id, created_at desc);
alter table public.match_results enable row level security;
drop policy if exists match_results_select_verified_or_players on public.match_results;
create policy match_results_select_verified_or_players on public.match_results for select using (verified or auth.uid() = player_one_id or auth.uid() = player_two_id);

create or replace view public.leaderboard with (security_invoker = true) as
select
  p.id as player_id,
  p.display_name,
  p.country_code,
  count(*) filter (where m.winner_id = p.id) as wins,
  count(*) filter (where m.winner_id is not null and m.winner_id <> p.id) as losses,
  count(*) as matches
from public.player_profiles p
join public.match_results m on (m.player_one_id = p.id or m.player_two_id = p.id)
where m.verified = true
group by p.id, p.display_name, p.country_code;

grant select on public.player_profiles to anon, authenticated;
grant insert, update, delete on public.player_profiles to authenticated;
grant select, insert, update, delete on public.cloud_saves to authenticated;
grant select on public.shared_replays to anon, authenticated;
grant insert, update, delete on public.shared_replays to authenticated;
grant select on public.match_results to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
