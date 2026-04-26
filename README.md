# LoveDistance

LoveDistance is a couples app (Expo + React Native) with optional **Supabase** backend: auth, pairing, prompts, presence, timeline, habits, and notifications. A **mock** mode runs everything in-memory for fast local UX work.

## Repository layout

| Path | Description |
|------|-------------|
| [`apps/mobile`](apps/mobile) | Expo app (Expo Router, TypeScript, TanStack Query, Zustand). |
| [`supabase`](supabase) | Postgres migrations, local CLI config, Edge Function `accept-invite`. |
| [`docs`](docs) | Setup, environment, Supabase, and release docs (this index expands below). |
| [`docs/product`](docs/product) | Product brief, flows, and build priorities. |

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/SETUP.md](docs/SETUP.md) | Prerequisites, install, `.env`, run commands, optional local Supabase. |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | `EXPO_PUBLIC_*` variables and security notes. |
| [docs/SUPABASE.md](docs/SUPABASE.md) | Linking, migrations, Edge Functions, storage overview. |
| [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) | Pre-release verification and smoke list. |
| [apps/mobile/README.md](apps/mobile/README.md) | App-specific scripts and deep links. |

## Quick start

```bash
cd apps/mobile
cp .env.example .env
npm install
npm run start
```

See [docs/SETUP.md](docs/SETUP.md) for details and [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for Supabase vs mock.

## Testing

From `apps/mobile`:

```bash
npm run typecheck && npm run lint && npm run test
```

## Known limitations and next steps

- **Push scheduling**: In-app notifications are largely event-driven; durable scheduled reminders / push pipeline can be a future phase (see `apps/mobile/src/services/factory.ts` comment).
- **Mock vs Supabase**: No automatic data migration when switching `EXPO_PUBLIC_API_MODE`; use Supabase for shared QA accounts and migrations in git as the schema source of truth.
- **Broader polish**: Settings and secondary screens may still contain mock-oriented copy; product-wide copy pass is optional.

For roadmap and priorities, see `docs/product/`.
