-- Optional IANA timezone for reunion/calendar UX (null = use device default).
alter table public.profiles
  add column if not exists time_zone text;

comment on column public.profiles.time_zone is 'IANA zone id (e.g. America/Chicago); null means use device timezone.';
