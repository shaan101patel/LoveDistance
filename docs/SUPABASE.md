# Supabase (LoveDistance)

The repo includes SQL migrations under `supabase/migrations/` and an Edge Function for invite acceptance. The mobile app talks to Supabase when `EXPO_PUBLIC_API_MODE=supabase` (see [ENVIRONMENT.md](./ENVIRONMENT.md)).

## Project layout

| Path | Purpose |
|------|---------|
| `supabase/migrations/` | Ordered DDL: extensions, profiles, couples, invites, prompts, presence, habits, memories, notifications, RLS, RPCs (`create_invite`), triggers (e.g. prompt reveal, timeline memory sync, partner notifications). |
| `supabase/functions/accept-invite/` | Edge Function: validates invite token, completes couple, consumes invite (uses service role on server). |
| `supabase/functions/notification-digest/` | Edge Function: runs `run_notification_digest_job()` (unanswered EOD, habit nudge, pairing anniversary, reunion countdown). Call on a schedule with **service role** `Authorization`. |
| `supabase/functions/dispatch-expo-push/` | Edge Function: POST body `{ "record": { "id": "<notification id>", "user_id": "…" } }` (or Database Webhook payload); sends Expo push to `user_push_tokens` for that user. Requires `EXPO_ACCESS_TOKEN` secret. |
| `supabase/config.toml` | Local CLI defaults; may include `project_id` after linking for convenience—**do not** rely on it for secrets. |

## Linking and migrations

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli).
2. From the repo root:

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

3. Push migrations to the linked remote:

```bash
supabase db push
```

For a fresh local stack: `supabase start` then apply migrations (CLI applies them on start when configured).

## Edge Functions

Deploy after schema is ready:

```bash
supabase functions deploy accept-invite
supabase functions deploy notification-digest
supabase functions deploy dispatch-expo-push
```

Configure secrets via Dashboard → Edge Functions → Secrets, or `supabase secrets set`—**never** embed the service role in the mobile app.

- **notification-digest**: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`. Schedule hourly (or daily) in Supabase Dashboard → Edge Functions → Schedules, invoking this function’s URL.
- **dispatch-expo-push**: same auth header. Wire a [Database Webhook](https://supabase.com/docs/guides/database/webhooks) on `public.notifications` INSERT (optionally filter in the webhook) to POST the row payload; set `EXPO_ACCESS_TOKEN` from your Expo account access tokens. Respects `user_app_settings.redact_previews` for the push body.

## Notifications (inbox + triggers)

- **Tables**: `notifications`, `user_notification_prefs`, `notification_digest_keys` (dedupe for scheduled jobs), `user_push_tokens` (Expo device tokens; RLS: user manages own rows).
- **Realtime**: `notifications` is added to `supabase_realtime` so the mobile app can subscribe while signed in.
- **Event triggers** (partner prefs respected): new presence photo; first `prompt_answers` row of the day (nudge partner); `prompt_reactions`; `prompt_reply_reactions`; milestone-style `memories` inserts.
- **Scheduled digest** (`run_notification_digest_job`): local-time unanswered prompt (from 20:00), shared habit nudge (18:00), pairing anniversary on `couples.created_at` calendar day (09:00), reunion countdown milestones 30/7/1/0 days (10:00). Requires `profiles.time_zone` (optional); defaults to UTC when null.

### Notifications QA (manual, two test accounts)

1. Pair two users; confirm each has `user_notification_prefs` rows (signup trigger).
2. **New photo**: User A posts presence; User B receives inbox row when B’s `new_photo` is true; toggle false and repeat—no row.
3. **First answer**: A answers today’s prompt first; B gets `prompt` row when B’s `unanswered_prompt` is true.
4. **Reaction**: A adds `prompt_reaction`; B notified when B’s `reactions` is true.
5. **Reply reaction**: B reacts to A’s reply; A notified when `reactions` is true.
6. **Milestone memory**: insert or trigger a milestone memory; both members receive rows matching prefs (`milestones` / `anniversaries` / `countdown_updates` by `milestone_kind`).
7. **Mark read / mark all**: inbox updates and persists.
8. **Digest**: call `select run_notification_digest_job();` as service role or invoke `notification-digest`; verify dedupe keys prevent duplicate rows the same day.
9. **Push** (optional): register app with Expo; set `EXPO_ACCESS_TOKEN`; fire webhook for one notification; `push_dispatched_at` set on success.

## Storage

Buckets such as `presence` and `prompt_attachments` are defined in migrations / storage migration—ensure policies match your product needs after changes.

## Optional: Cursor MCP

If the Supabase MCP is enabled in Cursor, you can run read-only checks (e.g. list tables, `execute_sql` for validation). It does not replace migrations in git or `db push` for schema of record.
