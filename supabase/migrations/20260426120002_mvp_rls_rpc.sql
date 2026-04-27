-- RLS, helper functions, create_invite RPC

-- Helpers (SECURITY DEFINER: fixed search_path, minimal surface)
create or replace function public.user_couple_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select cm.couple_id
  from public.couple_members cm
  where cm.user_id = auth.uid();
$$;

create or replace function public.is_member_of_couple(p_couple_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.couple_members cm
    where cm.couple_id = p_couple_id
      and cm.user_id = p_user_id
  );
$$;

grant execute on function public.user_couple_ids() to authenticated;
grant execute on function public.is_member_of_couple(uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- create_invite: sole entry for issuing invites from the client (anon key + JWT)
-- ---------------------------------------------------------------------------
create or replace function public.create_invite(expires_in interval default interval '7 days')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_couple_id uuid;
  new_token text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if exists (
    select 1
    from public.couple_members cm
    join public.couples c on c.id = cm.couple_id
    where cm.user_id = uid
      and c.is_complete
  ) then
    raise exception 'already_paired';
  end if;

  delete from public.couples c
  where c.is_complete = false
    and (
      select count(*)::int
      from public.couple_members m
      where m.couple_id = c.id
    ) = 1
    and exists (
      select 1
      from public.couple_members m2
      where m2.couple_id = c.id
        and m2.user_id = uid
    );

  new_couple_id := gen_random_uuid();
  new_token := 'inv-' || left(
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
    24
  );

  insert into public.couples (id, is_complete)
  values (new_couple_id, false);

  insert into public.couple_members (couple_id, user_id)
  values (new_couple_id, uid);

  insert into public.invites (token, couple_id, inviter_id, expires_at)
  values (new_token, new_couple_id, uid, now() + expires_in);

  return jsonb_build_object(
    'token', new_token,
    'couple_id', new_couple_id,
    'deep_link', 'lovedistance://invite/' || new_token
  );
end;
$$;

grant execute on function public.create_invite(interval) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.invites enable row level security;
alter table public.couple_prompts enable row level security;
alter table public.prompt_answers enable row level security;
alter table public.prompt_reactions enable row level security;
alter table public.prompt_replies enable row level security;
alter table public.prompt_reply_reactions enable row level security;
alter table public.prompt_voice_placeholders enable row level security;
alter table public.presence_posts enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.ritual_signals enable row level security;
alter table public.memories enable row level security;
alter table public.user_notification_prefs enable row level security;
alter table public.notifications enable row level security;
alter table public.user_app_settings enable row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- couples (members only; writes via SECURITY DEFINER / service role)
create policy couples_select_member on public.couples
  for select using (id in (select public.user_couple_ids()));

-- couple_members
create policy couple_members_select_same_couple on public.couple_members
  for select using (couple_id in (select public.user_couple_ids()));

-- invites: inviter can see their pending rows (no broad token listing)
create policy invites_select_inviter on public.invites
  for select using (inviter_id = auth.uid());

-- couple_prompts
create policy couple_prompts_select on public.couple_prompts
  for select using (couple_id in (select public.user_couple_ids()));

create policy couple_prompts_insert on public.couple_prompts
  for insert with check (couple_id in (select public.user_couple_ids()));

create policy couple_prompts_update on public.couple_prompts
  for update using (couple_id in (select public.user_couple_ids()))
  with check (couple_id in (select public.user_couple_ids()));

create policy couple_prompts_delete on public.couple_prompts
  for delete using (couple_id in (select public.user_couple_ids()));

-- prompt_answers
create policy prompt_answers_select on public.prompt_answers
  for select using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
  );

create policy prompt_answers_insert on public.prompt_answers
  for insert with check (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and user_id = auth.uid()
  );

create policy prompt_answers_update on public.prompt_answers
  for update using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and user_id = auth.uid()
  ) with check (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and user_id = auth.uid()
  );

create policy prompt_answers_delete on public.prompt_answers
  for delete using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and user_id = auth.uid()
  );

-- prompt_reactions
create policy prompt_reactions_select on public.prompt_reactions
  for select using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
  );

create policy prompt_reactions_insert on public.prompt_reactions
  for insert with check (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and user_id = auth.uid()
  );

create policy prompt_reactions_delete on public.prompt_reactions
  for delete using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and user_id = auth.uid()
  );

-- prompt_replies
create policy prompt_replies_select on public.prompt_replies
  for select using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
  );

create policy prompt_replies_insert on public.prompt_replies
  for insert with check (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and author_id = auth.uid()
  );

create policy prompt_replies_update on public.prompt_replies
  for update using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and author_id = auth.uid()
  ) with check (author_id = auth.uid());

create policy prompt_replies_delete on public.prompt_replies
  for delete using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
    and author_id = auth.uid()
  );

-- prompt_reply_reactions
create policy prompt_reply_reactions_all on public.prompt_reply_reactions
  for all using (
    reply_id in (
      select pr.id from public.prompt_replies pr
      join public.couple_prompts cp on cp.id = pr.couple_prompt_id
      where cp.couple_id in (select public.user_couple_ids())
    )
  ) with check (
    reply_id in (
      select pr.id from public.prompt_replies pr
      join public.couple_prompts cp on cp.id = pr.couple_prompt_id
      where cp.couple_id in (select public.user_couple_ids())
    )
    and user_id = auth.uid()
  );

-- prompt_voice_placeholders
create policy prompt_voice_placeholders_all on public.prompt_voice_placeholders
  for all using (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
  ) with check (
    couple_prompt_id in (
      select cp.id from public.couple_prompts cp
      where cp.couple_id in (select public.user_couple_ids())
    )
  );

-- presence_posts
create policy presence_posts_select on public.presence_posts
  for select using (couple_id in (select public.user_couple_ids()));

create policy presence_posts_insert on public.presence_posts
  for insert with check (
    couple_id in (select public.user_couple_ids())
    and author_id = auth.uid()
  );

create policy presence_posts_update on public.presence_posts
  for update using (couple_id in (select public.user_couple_ids()))
  with check (couple_id in (select public.user_couple_ids()));

create policy presence_posts_delete on public.presence_posts
  for delete using (
    couple_id in (select public.user_couple_ids())
    and author_id = auth.uid()
  );

-- habits
create policy habits_all on public.habits
  for all using (couple_id in (select public.user_couple_ids()))
  with check (couple_id in (select public.user_couple_ids()));

-- habit_completions
create policy habit_completions_all on public.habit_completions
  for all using (
    habit_id in (
      select h.id from public.habits h
      where h.couple_id in (select public.user_couple_ids())
    )
  ) with check (
    habit_id in (
      select h.id from public.habits h
      where h.couple_id in (select public.user_couple_ids())
    )
    and user_id = auth.uid()
  );

-- ritual_signals
create policy ritual_signals_select on public.ritual_signals
  for select using (couple_id in (select public.user_couple_ids()));

create policy ritual_signals_insert on public.ritual_signals
  for insert with check (
    couple_id in (select public.user_couple_ids())
    and author_id = auth.uid()
  );

-- memories
create policy memories_all on public.memories
  for all using (couple_id in (select public.user_couple_ids()))
  with check (couple_id in (select public.user_couple_ids()));

-- user_notification_prefs
create policy user_notification_prefs_select on public.user_notification_prefs
  for select using (auth.uid() = user_id);

create policy user_notification_prefs_insert on public.user_notification_prefs
  for insert with check (auth.uid() = user_id);

create policy user_notification_prefs_update on public.user_notification_prefs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- notifications
create policy notifications_select on public.notifications
  for select using (auth.uid() = user_id);

create policy notifications_update on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy notifications_insert on public.notifications
  for insert with check (auth.uid() = user_id);

-- user_app_settings
create policy user_app_settings_select on public.user_app_settings
  for select using (auth.uid() = user_id);

create policy user_app_settings_insert on public.user_app_settings
  for insert with check (auth.uid() = user_id);

create policy user_app_settings_update on public.user_app_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
