-- Phase 1: timeline aggregation (memories) from presence + prompt reveal
-- Phase 2: partner notification fan-out (SECURITY DEFINER)
-- Phase 3: default habits when couple has two members

-- ---------------------------------------------------------------------------
-- 1) Memory row for each new presence post
-- ---------------------------------------------------------------------------
create or replace function public.sync_memory_from_presence_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap text;
  summ text;
begin
  cap := left(coalesce(nullif(trim(NEW.caption), ''), 'New photo'), 120);
  summ := left(coalesce(nullif(trim(NEW.caption), ''), 'Shared to your couple feed'), 200);

  insert into public.memories (
    couple_id, type, title, summary, deep_link_ref, is_favorite, image_storage_path, created_at
  ) values (
    NEW.couple_id,
    'photo',
    cap,
    summ,
    'photo:' || NEW.id::text,
    false,
    NEW.storage_path,
    NEW.created_at
  );
  return NEW;
end;
$$;

revoke all on function public.sync_memory_from_presence_post() from public;

drop trigger if exists presence_posts_sync_memory on public.presence_posts;

create trigger presence_posts_sync_memory
after insert on public.presence_posts
for each row
execute function public.sync_memory_from_presence_post();

-- ---------------------------------------------------------------------------
-- 1b) Memory when a daily prompt becomes revealed (both answered)
-- ---------------------------------------------------------------------------
create or replace function public.sync_memory_from_prompt_reveal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  q text;
  tid text;
begin
  if tg_op <> 'update' then
    return NEW;
  end if;
  if coalesce(OLD.is_revealed, false) is not distinct from coalesce(NEW.is_revealed, false) then
    return NEW;
  end if;
  if NEW.is_revealed is not true then
    return NEW;
  end if;

  tid := 'prompt:' || NEW.id::text;
  if exists (
    select 1 from public.memories m
    where m.couple_id = NEW.couple_id and m.deep_link_ref = tid
  ) then
    return NEW;
  end if;

  q := left(coalesce(nullif(trim(NEW.question), ''), 'Daily prompt'), 120);
  insert into public.memories (couple_id, type, title, summary, deep_link_ref, is_favorite, created_at)
  values (
    NEW.couple_id,
    'prompt',
    q,
    'You both answered—saved to your timeline.',
    tid,
    false,
    now()
  );
  return NEW;
end;
$$;

revoke all on function public.sync_memory_from_prompt_reveal() from public;

drop trigger if exists couple_prompts_reveal_sync_memory on public.couple_prompts;

create trigger couple_prompts_reveal_sync_memory
after update on public.couple_prompts
for each row
execute function public.sync_memory_from_prompt_reveal();

-- ---------------------------------------------------------------------------
-- 2) Partner inbox row (respect new_photo pref when present)
-- ---------------------------------------------------------------------------
create or replace function public.internal_insert_notification(
  p_user_id uuid,
  p_category text,
  p_title text,
  p_summary text,
  p_href text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, category, title, summary, href)
  values (p_user_id, p_category, p_title, p_summary, p_href);
end;
$$;

revoke all on function public.internal_insert_notification(uuid, text, text, text, text) from public;

create or replace function public.notify_partner_new_presence_photo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  partner uuid;
  wants_photo boolean;
begin
  select cm.user_id into partner
  from public.couple_members cm
  where cm.couple_id = NEW.couple_id
    and cm.user_id <> NEW.author_id
  limit 1;

  if partner is null then
    return NEW;
  end if;

  select coalesce(
    (select p.new_photo from public.user_notification_prefs p where p.user_id = partner),
    true
  ) into wants_photo;

  if wants_photo is false then
    return NEW;
  end if;

  perform public.internal_insert_notification(
    partner,
    'photo',
    'New photo from your partner',
    left(coalesce(nullif(trim(NEW.caption), ''), 'They shared a new moment.'), 200),
    '/(app)/(tabs)/photos'
  );
  return NEW;
end;
$$;

revoke all on function public.notify_partner_new_presence_photo() from public;

drop trigger if exists presence_posts_notify_partner on public.presence_posts;

create trigger presence_posts_notify_partner
after insert on public.presence_posts
for each row
execute function public.notify_partner_new_presence_photo();

-- ---------------------------------------------------------------------------
-- 3) Default habits when the second couple_member row appears
-- ---------------------------------------------------------------------------
create or replace function public.seed_default_habits_for_couple(p_couple_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.habits h where h.couple_id = p_couple_id) then
    return;
  end if;

  insert into public.habits (couple_id, title, type, completion_policy, goal)
  values
    (p_couple_id, 'Morning check-in', 'ours', 'either_partner', null),
    (p_couple_id, 'Evening wind-down', 'ours', 'either_partner', null),
    (p_couple_id, 'Share a tiny win', 'yours', 'either_partner', null);
end;
$$;

revoke all on function public.seed_default_habits_for_couple(uuid) from public;

create or replace function public.couple_members_seed_habits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  select count(*)::int into n from public.couple_members where couple_id = NEW.couple_id;
  if n >= 2 then
    perform public.seed_default_habits_for_couple(NEW.couple_id);
  end if;
  return NEW;
end;
$$;

revoke all on function public.couple_members_seed_habits() from public;

drop trigger if exists couple_members_seed_habits_trigger on public.couple_members;

create trigger couple_members_seed_habits_trigger
after insert on public.couple_members
for each row
execute function public.couple_members_seed_habits();

-- Backfill habits for existing complete couples that have none
insert into public.habits (couple_id, title, type, completion_policy, goal)
select c.id, v.title, v.typ, v.pol, null::jsonb
from public.couples c
cross join (
  values
    ('Morning check-in', 'ours', 'either_partner'),
    ('Evening wind-down', 'ours', 'either_partner'),
    ('Share a tiny win', 'yours', 'either_partner')
) as v(title, typ, pol)
where c.is_complete = true
  and (select count(*) from public.couple_members cm where cm.couple_id = c.id) >= 2
  and not exists (select 1 from public.habits h where h.couple_id = c.id);
