-- Storage buckets + RLS for presence and prompt attachments.
-- Object path convention: couple/<couple_id>/<filename>

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('presence', 'presence', false, 52428800, null),
  ('prompt_attachments', 'prompt_attachments', false, 52428800, null)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit;

-- presence: members of the couple in path segment 2 may read/write under couple/<couple_id>/
create policy presence_objects_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'presence'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  );

create policy presence_objects_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'presence'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  );

create policy presence_objects_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'presence'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  )
  with check (
    bucket_id = 'presence'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  );

create policy presence_objects_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'presence'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  );

-- prompt_attachments: same path prefix rule
create policy prompt_attachments_objects_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'prompt_attachments'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  );

create policy prompt_attachments_objects_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'prompt_attachments'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  );

create policy prompt_attachments_objects_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'prompt_attachments'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  )
  with check (
    bucket_id = 'prompt_attachments'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  );

create policy prompt_attachments_objects_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'prompt_attachments'
    and (storage.foldername(name))[1] = 'couple'
    and public.is_member_of_couple((storage.foldername(name))[2]::uuid, auth.uid())
  );
