alter table public.couples
  add column if not exists reunion_end_date timestamptz;

comment on column public.couples.reunion_end_date is 'Last day of the in-person visit (local end-of-day stored as timestamptz).';
