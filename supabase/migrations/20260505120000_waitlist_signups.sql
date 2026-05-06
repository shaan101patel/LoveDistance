-- Public landing waitlist: anonymous INSERT only (no client SELECT).

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_nonempty check (length(trim(email)) > 0)
);

create unique index waitlist_signups_email_uidx on public.waitlist_signups (email);

create or replace function public.waitlist_signups_normalize_email()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

create trigger waitlist_signups_normalize
  before insert on public.waitlist_signups
  for each row
  execute function public.waitlist_signups_normalize_email();

alter table public.waitlist_signups enable row level security;

create policy waitlist_signups_insert_anon
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

create policy waitlist_signups_insert_authenticated
  on public.waitlist_signups
  for insert
  to authenticated
  with check (true);

grant insert on public.waitlist_signups to anon, authenticated;
