# Environment variables (mobile app)

All variables are read by the **Expo** app under `apps/mobile`. Only names prefixed with `EXPO_PUBLIC_` are exposed to the client bundle—**treat them as public** (safe for anon keys scoped by RLS, not service-role secrets).

Configuration template: [`apps/mobile/.env.example`](../apps/mobile/.env.example).

## Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_MODE` | No (default: `mock`) | `mock` — in-memory [`mockServices`](../apps/mobile/src/services/mock/mockServices.ts). `supabase` — [`supabaseServices`](../apps/mobile/src/services/supabase/supabaseServices.ts) against your Supabase project. |
| `EXPO_PUBLIC_SUPABASE_URL` | Yes when mode is `supabase` | Project URL, e.g. `https://<ref>.supabase.co` (Dashboard → Project Settings → API). |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes when mode is `supabase` | **Anon** public key (same screen). Used with RLS; never use the **service_role** key in the app. |

## Runtime behavior

- If `EXPO_PUBLIC_API_MODE=supabase` but URL or anon key is missing, [`isSupabaseConfigured`](../apps/mobile/src/services/supabase/client.ts) is false and the client may not initialize—sign-in and other live calls can fail until env is fixed.
- Switching from `mock` to `supabase` does **not** migrate mock data; users re-authenticate and re-pair against Postgres.

## Security practices

- Do **not** commit `.env` or paste **service_role** keys into the mobile app.
- Rotate keys if they leak; update EAS / local `.env` together.
- For production builds, set variables in **EAS Secrets** (or your CI) rather than only on a developer machine.
