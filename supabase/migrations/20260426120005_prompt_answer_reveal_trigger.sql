-- Keep couple_prompts.is_revealed in sync with prompt_answers (delayed reveal: both partners answered).

create or replace function public.refresh_couple_prompt_reveal(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  should_reveal boolean;
begin
  select coalesce(count(distinct pa.user_id) >= 2, false)
  into should_reveal
  from public.prompt_answers pa
  where pa.couple_prompt_id = target_id;

  update public.couple_prompts
  set is_revealed = should_reveal
  where id = target_id;
end;
$$;

revoke all on function public.refresh_couple_prompt_reveal(uuid) from public;

create or replace function public.prompt_answers_touch_reveal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'delete' then
    perform public.refresh_couple_prompt_reveal(old.couple_prompt_id);
    return old;
  end if;
  perform public.refresh_couple_prompt_reveal(new.couple_prompt_id);
  return new;
end;
$$;

revoke all on function public.prompt_answers_touch_reveal() from public;

drop trigger if exists prompt_answers_reveal_trigger on public.prompt_answers;

create trigger prompt_answers_reveal_trigger
after insert or update or delete on public.prompt_answers
for each row
execute function public.prompt_answers_touch_reveal();

-- Backfill rows that already have two distinct answerers.
update public.couple_prompts cp
set is_revealed = (
  select count(distinct pa.user_id) >= 2
  from public.prompt_answers pa
  where pa.couple_prompt_id = cp.id
);
