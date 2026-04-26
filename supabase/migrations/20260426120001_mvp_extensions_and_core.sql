-- LoveDistance MVP: extensions, profiles, couples, invites, domain tables (Phase A–D).
-- Apply order: 001 → 002 → 003

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (Phase A)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  display_name text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_profiles_updated_at();

-- ---------------------------------------------------------------------------
-- Couples + membership + invites (Phase A)
-- ---------------------------------------------------------------------------
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  reunion_date timestamptz,
  is_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

create index couple_members_user_id_idx on public.couple_members (user_id);
create index couple_members_couple_id_idx on public.couple_members (couple_id);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  couple_id uuid not null references public.couples (id) on delete cascade,
  inviter_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  consumed_by_user_id uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index invites_token_idx on public.invites (token);

-- ---------------------------------------------------------------------------
-- Prompts + thread (Phase B)
-- ---------------------------------------------------------------------------
create table public.couple_prompts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  prompt_date date not null,
  question text not null,
  category jsonb,
  is_revealed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (couple_id, prompt_date)
);

create index couple_prompts_couple_id_idx on public.couple_prompts (couple_id);

create table public.prompt_answers (
  id uuid primary key default gen_random_uuid(),
  couple_prompt_id uuid not null references public.couple_prompts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null default '',
  image_storage_path text,
  submitted_at timestamptz not null default now(),
  unique (couple_prompt_id, user_id)
);

create table public.prompt_reactions (
  id uuid primary key default gen_random_uuid(),
  couple_prompt_id uuid not null references public.couple_prompts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (couple_prompt_id, user_id, emoji)
);

create table public.prompt_replies (
  id uuid primary key default gen_random_uuid(),
  couple_prompt_id uuid not null references public.couple_prompts (id) on delete cascade,
  parent_reply_id uuid references public.prompt_replies (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index prompt_replies_couple_prompt_idx on public.prompt_replies (couple_prompt_id);

create table public.prompt_reply_reactions (
  id uuid primary key default gen_random_uuid(),
  reply_id uuid not null references public.prompt_replies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (reply_id, user_id, emoji)
);

create table public.prompt_voice_placeholders (
  id uuid primary key default gen_random_uuid(),
  couple_prompt_id uuid not null references public.couple_prompts (id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Presence (Phase C)
-- ---------------------------------------------------------------------------
create table public.presence_posts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  caption text,
  mood text,
  location_label text,
  storage_path text not null,
  created_at timestamptz not null default now(),
  reaction_count integer not null default 0
);

create index presence_posts_couple_created_idx on public.presence_posts (couple_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Habits, rituals, memories (Phase D)
-- ---------------------------------------------------------------------------
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null,
  type text not null check (type in ('mine', 'yours', 'ours')),
  completion_policy text not null check (completion_policy in ('either_partner', 'both_required')),
  goal jsonb,
  created_at timestamptz not null default now()
);

create index habits_couple_id_idx on public.habits (couple_id);

create table public.habit_completions (
  habit_id uuid not null references public.habits (id) on delete cascade,
  ymd date not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (habit_id, ymd, user_id)
);

create table public.ritual_signals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('good_night', 'miss_you')),
  body text not null,
  created_at timestamptz not null default now()
);

create index ritual_signals_couple_created_idx on public.ritual_signals (couple_id, created_at desc);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  type text not null check (type in ('prompt', 'photo', 'gratitude', 'milestone')),
  title text not null,
  summary text not null default '',
  deep_link_ref text not null default '',
  is_favorite boolean not null default false,
  milestone_kind text check (milestone_kind is null or milestone_kind in ('anniversary', 'trip', 'streak_win', 'notable')),
  image_storage_path text,
  created_at timestamptz not null default now()
);

create index memories_couple_created_idx on public.memories (couple_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Notifications + settings (Phase D)
-- ---------------------------------------------------------------------------
create table public.user_notification_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  unanswered_prompt boolean not null default true,
  new_photo boolean not null default true,
  habit_reminder boolean not null default true,
  milestones boolean not null default true,
  reactions boolean not null default true,
  anniversaries boolean not null default true,
  countdown_updates boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (
    category in ('prompt', 'photo', 'reaction', 'habit', 'anniversary', 'countdown')
  ),
  title text not null,
  summary text not null default '',
  read boolean not null default false,
  href text,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

create table public.user_app_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  share_presence boolean not null default true,
  product_analytics boolean not null default true,
  redact_previews boolean not null default false,
  require_passcode boolean not null default false,
  use_biometric boolean not null default false,
  is_passcode_set boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Auth bootstrap (after all public tables referenced by the trigger exist)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '')
  )
  on conflict (id) do nothing;

  insert into public.user_notification_prefs (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_app_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
