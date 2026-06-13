-- MindMirror schema. Every table is protected by Row Level Security so a user
-- can only ever read/write their own rows (auth.uid() = user_id).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  exam_type    text not null check (exam_type in ('NEET','JEE','CUET','CAT','GATE','UPSC')),
  display_name text not null check (char_length(display_name) between 1 and 60),
  tone_pref    text not null check (tone_pref in ('gentle','motivational','practical')),
  consent_at   timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- journal_entries
-- ---------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 5000),
  mood_score smallint not null check (mood_score between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- insights
-- ---------------------------------------------------------------------------
create table if not exists public.insights (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  triggers         jsonb not null default '[]'::jsonb,
  patterns         jsonb not null default '[]'::jsonb,
  burnout_score    smallint not null check (burnout_score between 0 and 100),
  suggested_action text not null,
  distress_level   text not null check (distress_level in ('none','mild','moderate','acute')),
  generated_at     timestamptz not null default now()
);
create index if not exists insights_user_generated_idx
  on public.insights (user_id, generated_at desc);

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null check (char_length(content) between 1 and 8000),
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.journal_entries enable row level security;
alter table public.insights        enable row level security;
alter table public.chat_messages   enable row level security;

-- profiles: id is the user's own auth id.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Generic owner policies for the per-user tables.
do $$
declare t text;
begin
  foreach t in array array['journal_entries','insights','chat_messages']
  loop
    execute format($f$
      create policy "%1$s_select_own" on public.%1$s
        for select using (auth.uid() = user_id);
      create policy "%1$s_insert_own" on public.%1$s
        for insert with check (auth.uid() = user_id);
      create policy "%1$s_delete_own" on public.%1$s
        for delete using (auth.uid() = user_id);
    $f$, t);
  end loop;
end$$;

-- ---------------------------------------------------------------------------
-- "Delete all my data" — privacy by design.
-- ---------------------------------------------------------------------------
create or replace function public.delete_all_user_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.chat_messages   where user_id = auth.uid();
  delete from public.insights        where user_id = auth.uid();
  delete from public.journal_entries where user_id = auth.uid();
  delete from public.profiles        where id = auth.uid();
end;
$$;

revoke all on function public.delete_all_user_data() from public;
grant execute on function public.delete_all_user_data() to authenticated, anon;
