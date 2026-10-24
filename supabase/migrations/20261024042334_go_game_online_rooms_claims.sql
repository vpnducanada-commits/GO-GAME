-- GO GAME — salons privés, signalisation WebRTC et claims de résultats co-signés.
-- Les clients ne peuvent pas écrire directement un match classé vérifié.

alter table public.match_results add column if not exists match_key text;
create unique index if not exists match_results_match_key_key on public.match_results (match_key) where match_key is not null;

create table if not exists public.online_rooms (
  code text primary key check (code ~ '^[A-Z0-9]{4,8}$'),
  host_id uuid not null references auth.users(id) on delete cascade,
  guest_id uuid references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open','locked','playing','closed')),
  config jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (guest_id is null or guest_id <> host_id)
);
create index if not exists online_rooms_status_expires_idx on public.online_rooms (status, expires_at);
alter table public.online_rooms enable row level security;
drop policy if exists online_rooms_select_visible on public.online_rooms;
create policy online_rooms_select_visible on public.online_rooms for select to authenticated using (status = 'open' or auth.uid() = host_id or auth.uid() = guest_id);
drop policy if exists online_rooms_insert_host on public.online_rooms;
create policy online_rooms_insert_host on public.online_rooms for insert to authenticated with check (auth.uid() = host_id and guest_id is null);
drop policy if exists online_rooms_update_participants on public.online_rooms;
create policy online_rooms_update_participants on public.online_rooms for update to authenticated using (auth.uid() = host_id or auth.uid() = guest_id) with check (auth.uid() = host_id or auth.uid() = guest_id);
drop policy if exists online_rooms_delete_participants on public.online_rooms;
create policy online_rooms_delete_participants on public.online_rooms for delete to authenticated using (auth.uid() = host_id or auth.uid() = guest_id);
drop trigger if exists online_rooms_set_updated_at on public.online_rooms;
create trigger online_rooms_set_updated_at before update on public.online_rooms for each row execute function public.set_updated_at();

create or replace function public.join_online_room(room_code text, guest_config jsonb default '{}'::jsonb)
returns public.online_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  r public.online_rooms;
  safe_guest jsonb;
begin
  if uid is null then raise exception 'authentication required'; end if;
  select * into r from public.online_rooms where code = upper(room_code) for update;
  if not found then raise exception 'room not found'; end if;
  if r.host_id = uid then raise exception 'host cannot join own room'; end if;
  if r.guest_id is not null and r.guest_id <> uid then raise exception 'room already has a guest'; end if;
  if r.status <> 'open' and r.guest_id <> uid then raise exception 'room is not open'; end if;
  if r.expires_at <= now() then raise exception 'room expired'; end if;
  safe_guest := jsonb_build_object(
    'guestId', uid::text,
    'guestName', left(coalesce(guest_config->>'guestName', 'Joueur 2'), 24),
    'guestChar', case when coalesce(guest_config->>'guestChar','1') ~ '^[0-5]$' then (guest_config->>'guestChar')::int else 1 end,
    'guestCountry', upper(left(coalesce(guest_config->>'guestCountry', 'GA'), 2)),
    'guestInitial', left(coalesce(guest_config->>'guestInitial', 'J'), 2),
    'guestSkin', coalesce(guest_config->'guestSkin', '{}'::jsonb)
  );
  update public.online_rooms
  set guest_id = uid, status = 'locked', config = r.config || safe_guest
  where code = r.code
  returning * into r;
  return r;
end;
$$;
revoke all on function public.join_online_room(text, jsonb) from public;
grant execute on function public.join_online_room(text, jsonb) to authenticated;

create table if not exists public.online_signals (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.online_rooms(code) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('offer','answer','ice','ready','bye')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists online_signals_room_created_idx on public.online_signals (room_code, created_at);
create unique index if not exists online_signals_one_sdp_idx on public.online_signals (room_code, sender_id, kind) where kind in ('offer','answer');
alter table public.online_signals enable row level security;
drop policy if exists online_signals_select_participants on public.online_signals;
create policy online_signals_select_participants on public.online_signals for select to authenticated using (
  exists (select 1 from public.online_rooms r where r.code = room_code and (auth.uid() = r.host_id or auth.uid() = r.guest_id))
);
drop policy if exists online_signals_insert_participants on public.online_signals;
create policy online_signals_insert_participants on public.online_signals for insert to authenticated with check (
  auth.uid() = sender_id and exists (select 1 from public.online_rooms r where r.code = room_code and (auth.uid() = r.host_id or auth.uid() = r.guest_id))
);
drop policy if exists online_signals_delete_own on public.online_signals;
create policy online_signals_delete_own on public.online_signals for delete to authenticated using (auth.uid() = sender_id);

create table if not exists public.match_result_claims (
  id uuid primary key default gen_random_uuid(),
  match_key text not null check (char_length(match_key) between 8 and 120),
  player_id uuid not null references auth.users(id) on delete cascade,
  opponent_id uuid not null references auth.users(id) on delete cascade,
  player_one_id uuid not null references auth.users(id) on delete cascade,
  player_two_id uuid not null references auth.users(id) on delete cascade,
  winner_id uuid not null references auth.users(id) on delete cascade,
  player_one_fighter text,
  player_two_fighter text,
  arena text,
  arena_mood text check (arena_mood is null or arena_mood in ('auto','jour','crepuscule','nuit')),
  mode text not null default 'online',
  verification_hash text not null,
  replay_hash text,
  replay_id uuid references public.shared_replays(id) on delete set null,
  claim jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (match_key, player_id),
  check (player_id = player_one_id or player_id = player_two_id),
  check (opponent_id = player_one_id or opponent_id = player_two_id),
  check (player_id <> opponent_id),
  check (winner_id = player_one_id or winner_id = player_two_id)
);
create index if not exists match_result_claims_match_idx on public.match_result_claims (match_key, player_id);
alter table public.match_result_claims enable row level security;
-- Aucune policy client : seule l'Edge Function (service_role) écrit/valide les claims.

grant select, insert, update, delete on public.online_rooms to authenticated;
grant select, insert, delete on public.online_signals to authenticated;
