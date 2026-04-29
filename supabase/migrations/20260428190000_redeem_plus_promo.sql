-- Promo: redeem code BG to grant Plus (premium) to both members of a complete couple.

create or replace function public.redeem_plus_promo(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  couple_id_found uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if upper(trim(p_code)) <> 'BG' then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  select c.id into couple_id_found
  from public.couples c
  join public.couple_members cm on cm.couple_id = c.id
  where cm.user_id = uid
    and c.is_complete
  limit 1;

  if couple_id_found is null then
    return jsonb_build_object('ok', false, 'error', 'couple_required');
  end if;

  update public.profiles p
  set subscription_tier = 'premium'
  from public.couple_members cm
  where cm.couple_id = couple_id_found
    and cm.user_id = p.id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.redeem_plus_promo(text) to authenticated;
