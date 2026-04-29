-- Partner alerts: reactions, first prompt answer nudge, milestone memories.
-- Scheduled digest job + dedupe keys; push token storage; realtime publication; optional push_dispatched_at.

-- ---------------------------------------------------------------------------
-- Realtime (in-app live refresh)
-- ---------------------------------------------------------------------------
do $pub$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end
$pub$;

-- ---------------------------------------------------------------------------
-- Dedupe keys for scheduled / digest notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notification_digest_keys (
  user_id uuid not null references auth.users (id) on delete cascade,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, dedupe_key)
);

revoke all on public.notification_digest_keys from public;
grant select, insert, delete on public.notification_digest_keys to postgres;
grant select, insert, delete on public.notification_digest_keys to service_role;

-- ---------------------------------------------------------------------------
-- Expo push tokens (one row per device token; token is globally unique)
-- ---------------------------------------------------------------------------
create table if not exists public.user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null,
  platform text not null default 'unknown',
  updated_at timestamptz not null default now(),
  unique (expo_push_token)
);

create index if not exists user_push_tokens_user_idx on public.user_push_tokens (user_id);

alter table public.user_push_tokens enable row level security;

create policy user_push_tokens_select on public.user_push_tokens
  for select using (auth.uid() = user_id);

create policy user_push_tokens_insert on public.user_push_tokens
  for insert with check (auth.uid() = user_id);

create policy user_push_tokens_update on public.user_push_tokens
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy user_push_tokens_delete on public.user_push_tokens
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Optional: mark when a server-side push was attempted (Edge Function updates)
-- ---------------------------------------------------------------------------
alter table public.notifications
  add column if not exists push_dispatched_at timestamptz;

-- ---------------------------------------------------------------------------
-- Helper: other member in the couple
-- ---------------------------------------------------------------------------
create or replace function public.notification_partner_for_couple(p_couple_id uuid, p_user_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select cm.user_id
  from public.couple_members cm
  where cm.couple_id = p_couple_id
    and cm.user_id <> p_user_id
  limit 1;
$$;

revoke all on function public.notification_partner_for_couple(uuid, uuid) from public;

-- ---------------------------------------------------------------------------
-- First answer on a daily prompt → nudge partner ("your turn")
-- ---------------------------------------------------------------------------
create or replace function public.notify_partner_prompt_first_answer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
  partner uuid;
  wants boolean;
  cnt int;
begin
  select cp.couple_id into cid
  from public.couple_prompts cp
  where cp.id = new.couple_prompt_id;

  if cid is null then
    return new;
  end if;

  select count(*)::int into cnt
  from public.prompt_answers pa
  where pa.couple_prompt_id = new.couple_prompt_id;

  if cnt <> 1 then
    return new;
  end if;

  partner := public.notification_partner_for_couple(cid, new.user_id);
  if partner is null then
    return new;
  end if;

  select coalesce(p.unanswered_prompt, true) into wants
  from public.user_notification_prefs p
  where p.user_id = partner;

  if wants is false then
    return new;
  end if;

  perform public.internal_insert_notification(
    partner,
    'prompt',
    'Your partner answered',
    'It''s your turn on today''s prompt.',
    '/(app)/prompt/' || new.couple_prompt_id::text
  );
  return new;
end;
$$;

revoke all on function public.notify_partner_prompt_first_answer() from public;

drop trigger if exists prompt_answers_notify_partner_first on public.prompt_answers;

create trigger prompt_answers_notify_partner_first
after insert on public.prompt_answers
for each row
execute function public.notify_partner_prompt_first_answer();

-- ---------------------------------------------------------------------------
-- Partner reacted on the daily prompt card
-- ---------------------------------------------------------------------------
create or replace function public.notify_partner_prompt_reaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
  partner uuid;
  wants boolean;
begin
  select cp.couple_id into cid
  from public.couple_prompts cp
  where cp.id = new.couple_prompt_id;

  partner := public.notification_partner_for_couple(cid, new.user_id);
  if partner is null then
    return new;
  end if;

  select coalesce(p.reactions, true) into wants
  from public.user_notification_prefs p
  where p.user_id = partner;

  if wants is false then
    return new;
  end if;

  perform public.internal_insert_notification(
    partner,
    'reaction',
    'New reaction',
    'Reacted with ' || new.emoji || ' on today''s prompt.',
    '/(app)/prompt/' || new.couple_prompt_id::text
  );
  return new;
end;
$$;

revoke all on function public.notify_partner_prompt_reaction() from public;

drop trigger if exists prompt_reactions_notify_partner on public.prompt_reactions;

create trigger prompt_reactions_notify_partner
after insert on public.prompt_reactions
for each row
execute function public.notify_partner_prompt_reaction();

-- ---------------------------------------------------------------------------
-- Reaction on a thread reply → notify reply author
-- ---------------------------------------------------------------------------
create or replace function public.notify_author_prompt_reply_reaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reply_author uuid;
  cp_id uuid;
  wants boolean;
begin
  select pr.author_id, pr.couple_prompt_id
  into reply_author, cp_id
  from public.prompt_replies pr
  where pr.id = new.reply_id;

  if reply_author is null or reply_author = new.user_id then
    return new;
  end if;

  select coalesce(p.reactions, true) into wants
  from public.user_notification_prefs p
  where p.user_id = reply_author;

  if wants is false then
    return new;
  end if;

  perform public.internal_insert_notification(
    reply_author,
    'reaction',
    'Reaction on your reply',
    'Reacted with ' || new.emoji || '.',
    '/(app)/prompt/' || cp_id::text
  );
  return new;
end;
$$;

revoke all on function public.notify_author_prompt_reply_reaction() from public;

drop trigger if exists prompt_reply_reactions_notify_author on public.prompt_reply_reactions;

create trigger prompt_reply_reactions_notify_author
after insert on public.prompt_reply_reactions
for each row
execute function public.notify_author_prompt_reply_reaction();

-- ---------------------------------------------------------------------------
-- Milestone / timeline memory → notify each couple member (prefs vary by kind)
-- ---------------------------------------------------------------------------
create or replace function public.notify_couple_milestone_memory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_uid uuid;
  wants boolean;
  cat text;
  href text;
begin
  if new.type <> 'milestone' and new.milestone_kind is null then
    return new;
  end if;

  href := '/(app)/(tabs)/timeline';
  if new.deep_link_ref like 'prompt:%' then
    href := '/(app)/prompt/' || substring(new.deep_link_ref from 8);
  elsif new.deep_link_ref like 'photo:%' then
    href := '/(app)/(tabs)/photos';
  end if;

  for member_uid in
    select cm.user_id from public.couple_members cm where cm.couple_id = new.couple_id
  loop
    cat := 'habit';
    wants := true;

    if new.milestone_kind = 'anniversary' then
      cat := 'anniversary';
      select coalesce(p.anniversaries, true) into wants
      from public.user_notification_prefs p
      where p.user_id = member_uid;
    elsif new.milestone_kind = 'trip' then
      cat := 'countdown';
      select coalesce(p.countdown_updates, true) into wants
      from public.user_notification_prefs p
      where p.user_id = member_uid;
    else
      select coalesce(p.milestones, true) into wants
      from public.user_notification_prefs p
      where p.user_id = member_uid;
    end if;

    if wants is false then
      continue;
    end if;

    perform public.internal_insert_notification(
      member_uid,
      cat,
      left(coalesce(nullif(trim(new.title), ''), 'New milestone'), 120),
      left(coalesce(nullif(trim(new.summary), ''), 'Saved to your timeline.'), 200),
      href
    );
  end loop;

  return new;
end;
$$;

revoke all on function public.notify_couple_milestone_memory() from public;

drop trigger if exists memories_notify_milestone on public.memories;

create trigger memories_notify_milestone
after insert on public.memories
for each row
execute function public.notify_couple_milestone_memory();

-- ---------------------------------------------------------------------------
-- Scheduled digest: unanswered EOD, habit nudge, pairing anniversary, reunion countdown
-- Call from Supabase Scheduled Triggers or pg_cron: select public.run_notification_digest_job();
-- ---------------------------------------------------------------------------
create or replace function public.run_notification_digest_job()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  local_d date;
  local_h int;
  cp record;
  wants boolean;
  ins_cnt int;
  h record;
  c record;
  reunion_local date;
  days int;
  milestone int;
begin
  for r in
    select p.id as user_id, coalesce(nullif(trim(p.time_zone), ''), 'UTC') as tz
    from public.profiles p
    where exists (select 1 from public.couple_members cm where cm.user_id = p.id)
  loop
    local_d := (timezone(r.tz, now()))::date;
    local_h := extract(hour from timezone(r.tz, now()))::int;

    -- End-of-day nudge: still no answer for today's prompt (local 20:00+)
    if local_h >= 20 then
      for cp in
        select cp2.id as prompt_id, cp2.couple_id
        from public.couple_prompts cp2
        join public.couple_members cm2 on cm2.couple_id = cp2.couple_id and cm2.user_id = r.user_id
        where cp2.prompt_date = local_d
          and not exists (
            select 1 from public.prompt_answers pa
            where pa.couple_prompt_id = cp2.id and pa.user_id = r.user_id
          )
      loop
        with ins as (
          insert into public.notification_digest_keys (user_id, dedupe_key)
          values (r.user_id, 'unanswered_eod:' || cp.prompt_id::text || ':' || local_d::text)
          on conflict do nothing
          returning 1
        )
        select count(*)::int into ins_cnt from ins;

        if ins_cnt > 0 then
          select coalesce(p.unanswered_prompt, true) into wants
          from public.user_notification_prefs p
          where p.user_id = r.user_id;

          if wants is true then
            perform public.internal_insert_notification(
              r.user_id,
              'prompt',
              'Daily prompt waiting',
              'You have not answered today''s question yet.',
              '/(app)/prompt/' || cp.prompt_id::text
            );
          end if;
        end if;
      end loop;
    end if;

    -- Shared habits not completed today (local 18:00)
    if local_h = 18 then
      for h in
        select hab.id as habit_id, hab.couple_id
        from public.habits hab
        join public.couple_members cm3 on cm3.couple_id = hab.couple_id and cm3.user_id = r.user_id
        where hab.type = 'ours'
          and not exists (
            select 1 from public.habit_completions hc
            where hc.habit_id = hab.id
              and hc.user_id = r.user_id
              and hc.ymd = local_d
          )
      loop
        with ins as (
          insert into public.notification_digest_keys (user_id, dedupe_key)
          values (r.user_id, 'habit_open:' || h.habit_id::text || ':' || local_d::text)
          on conflict do nothing
          returning 1
        )
        select count(*)::int into ins_cnt from ins;

        if ins_cnt > 0 then
          select coalesce(p.habit_reminder, true) into wants
          from public.user_notification_prefs p
          where p.user_id = r.user_id;

          if wants is true then
            perform public.internal_insert_notification(
              r.user_id,
              'habit',
              'Habit check-in',
              'A shared habit is still open for today.',
              '/(app)/(tabs)/calendar'
            );
          end if;
        end if;
      end loop;
    end if;

    -- Pairing anniversary (local 09:00, month/day match couple created_at)
    if local_h = 9 then
      for c in
        select coup.id as couple_id, coup.created_at
        from public.couples coup
        join public.couple_members cm4 on cm4.couple_id = coup.id and cm4.user_id = r.user_id
        where coup.is_complete is true
          and extract(month from timezone(r.tz, coup.created_at))::int = extract(month from timezone(r.tz, now()))::int
          and extract(day from timezone(r.tz, coup.created_at))::int = extract(day from timezone(r.tz, now()))::int
      loop
        with ins as (
          insert into public.notification_digest_keys (user_id, dedupe_key)
          values (
            r.user_id,
            'anniv:' || c.couple_id::text || ':' || extract(year from timezone(r.tz, now()))::text
          )
          on conflict do nothing
          returning 1
        )
        select count(*)::int into ins_cnt from ins;

        if ins_cnt > 0 then
          select coalesce(p.anniversaries, true) into wants
          from public.user_notification_prefs p
          where p.user_id = r.user_id;

          if wants is true then
            perform public.internal_insert_notification(
              r.user_id,
              'anniversary',
              'Happy LoveDistance anniversary',
              'Celebrating the day you joined as a couple here.',
              '/(app)/(tabs)/timeline'
            );
          end if;
        end if;
      end loop;
    end if;

    -- Reunion countdown milestones (local 10:00)
    if local_h = 10 then
      for c in
        select coup.id as couple_id, coup.reunion_date
        from public.couples coup
        join public.couple_members cm5 on cm5.couple_id = coup.id and cm5.user_id = r.user_id
        where coup.reunion_date is not null
      loop
        reunion_local := (timezone(r.tz, c.reunion_date))::date;
        days := reunion_local - local_d;

        if days in (0, 1, 7, 30) then
          milestone := days;
        else
          continue;
        end if;

        with ins as (
          insert into public.notification_digest_keys (user_id, dedupe_key)
          values (
            r.user_id,
            'countdown:' || c.couple_id::text || ':' || reunion_local::text || ':' || milestone::text
          )
          on conflict do nothing
          returning 1
        )
        select count(*)::int into ins_cnt from ins;

        if ins_cnt > 0 then
          select coalesce(p.countdown_updates, true) into wants
          from public.user_notification_prefs p
          where p.user_id = r.user_id;

          if wants is true then
            perform public.internal_insert_notification(
              r.user_id,
              'countdown',
              case milestone
                when 0 then 'Reunion day'
                when 1 then 'One day to reunion'
                else 'Reunion countdown'
              end,
              case milestone
                when 0 then 'Enjoy every moment together.'
                when 1 then 'Almost there—one day left.'
                when 7 then 'One week until you are together.'
                when 30 then 'One month until reunion.'
                else 'Reunion is coming up.'
              end,
              '/(app)/(tabs)/home'
            );
          end if;
        end if;
      end loop;
    end if;
  end loop;
end;
$$;

revoke all on function public.run_notification_digest_job() from public;
grant execute on function public.run_notification_digest_job() to postgres;
grant execute on function public.run_notification_digest_job() to service_role;
