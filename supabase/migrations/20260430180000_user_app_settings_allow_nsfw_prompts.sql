-- Optional intimate (18+) daily prompts; default off.
alter table public.user_app_settings
  add column if not exists allow_nsfw_prompts boolean not null default false;

comment on column public.user_app_settings.allow_nsfw_prompts is
  'When true, daily prompt picker may include NSFW-tagged library entries (e.g. sexual intimacy).';
