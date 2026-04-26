# Release checklist (LoveDistance mobile)

Use before a store submission, major demo, or production promotion. Adjust for your branching and CI.

## Automated gates

- [ ] `cd apps/mobile && npm run typecheck` — clean
- [ ] `npm run lint` — clean (or only accepted warnings documented)
- [ ] `npm run test` — all Vitest tests pass

## Backend (Supabase)

- [ ] Migrations applied to **target** project (`supabase db push` or equivalent pipeline)
- [ ] Edge Function **`accept-invite`** deployed and secrets set
- [ ] Auth redirect URLs / site URL match your app scheme if using deep links
- [ ] Storage buckets and RLS reviewed for any migration changes

## Client configuration

- [ ] `EXPO_PUBLIC_API_MODE=supabase` for production builds (or your chosen default)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` set in **EAS** (or CI), not only local `.env`
- [ ] No service-role or private keys in the app bundle

## Smoke tests (device or simulator)

- [ ] Sign up / sign in / sign out
- [ ] Onboarding through pairing; invite link or code path if shipping pairing
- [ ] Home + daily prompt open, answer, reveal behavior as designed
- [ ] Photo share + timeline entry (if using Supabase triggers)
- [ ] Notifications inbox (e.g. partner photo) if enabled
- [ ] Settings: profile, prefs, critical toggles

## Known limitations (ship awareness)

- Scheduled **push** reminders are not fully implemented; in-app notification rows are largely **event-driven** (see codebase comments in `factory.ts`).
- Mock mode does not represent production security or data durability.

## After release

- [ ] Tag git release / update changelog if you maintain one
- [ ] Monitor Supabase dashboard (errors, Edge logs) for first sessions
