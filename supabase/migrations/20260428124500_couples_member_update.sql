-- Members of a complete couple may update couple-level fields (e.g. reunion_date).
-- with check keeps is_complete true so clients cannot unpublish the couple via RLS.

create policy couples_update_member on public.couples
  for update
  using (
    id in (select public.user_couple_ids())
    and is_complete is true
  )
  with check (
    id in (select public.user_couple_ids())
    and is_complete is true
  );
