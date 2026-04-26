-- Allow each partner to read the other’s profile row (needed for CoupleProfile in the app).
create policy profiles_select_couple_partners on public.profiles
  for select using (
    id in (
      select cm2.user_id
      from public.couple_members cm1
      join public.couple_members cm2 on cm2.couple_id = cm1.couple_id
      where cm1.user_id = auth.uid()
    )
  );
