-- create_invite used gen_random_bytes(12) which is not on search_path=public
-- (pgcrypto lives in the extensions schema on Supabase). Build the token from
-- gen_random_uuid() instead, matching 20260426120002_mvp_rls_rpc.sql.
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
