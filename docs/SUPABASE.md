# Supabase (LoveDistance)

The repo includes SQL migrations under `supabase/migrations/` and an Edge Function for invite acceptance. The mobile app talks to Supabase when `EXPO_PUBLIC_API_MODE=supabase` (see [ENVIRONMENT.md](./ENVIRONMENT.md)).

## Project layout

| Path | Purpose |
|------|---------|
| `supabase/migrations/` | Ordered DDL: extensions, profiles, couples, invites, prompts, presence, habits, memories, notifications, RLS, RPCs (`create_invite`), triggers (e.g. prompt reveal, timeline memory sync, partner notifications). |
| `supabase/functions/accept-invite/` | Edge Function: validates invite token, completes couple, consumes invite (uses service role on server). |
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

Deploy the invite function after schema is ready:

```bash
supabase functions deploy accept-invite
```

Configure secrets the function needs (e.g. Supabase URL and **service role** key) via Dashboard → Edge Functions → Secrets, or `supabase secrets set`—**never** embed the service role in the mobile app.

## Storage

Buckets such as `presence` and `prompt_attachments` are defined in migrations / storage migration—ensure policies match your product needs after changes.

## Optional: Cursor MCP

If the Supabase MCP is enabled in Cursor, you can run read-only checks (e.g. list tables, `execute_sql` for validation). It does not replace migrations in git or `db push` for schema of record.
