# LoveDistance Mobile (Expo)

Expo + TypeScript + Expo Router app: auth, onboarding, pairing, tabs (Home, Prompt, Photos, Calendar, Timeline, Settings), and stack routes (prompt thread, photo compose, habits, notifications, weekly recap, etc.).

## Monorepo docs (start here)

- **[Setup & run](../../docs/SETUP.md)** — install, `.env`, Expo start, optional Supabase CLI  
- **[Environment variables](../../docs/ENVIRONMENT.md)** — `EXPO_PUBLIC_API_MODE`, Supabase URL/key  
- **[Supabase](../../docs/SUPABASE.md)** — migrations, Edge `accept-invite`, linking  
- **[Release checklist](../../docs/RELEASE_CHECKLIST.md)** — pre-ship gates and smoke tests  

Product briefs and flows: **`../../docs/product/`**.

## Service modes

- **`EXPO_PUBLIC_API_MODE=mock`** (default): in-memory services for all domains.  
- **`EXPO_PUBLIC_API_MODE=supabase`**: Postgres + Storage + Edge-backed services; requires URL + anon key in `.env`.

See [`src/services/factory.ts`](src/services/factory.ts).

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run start` | Expo dev server |
| `npm run ios` / `npm run android` | Platform shortcuts |
| `npm run web` | Web export dev |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` / `npm run format:write` | Prettier |
| `npm run test` / `npm run test:watch` | Vitest |

## Environment file

```bash
cp .env.example .env
```

Never commit `.env`. Template: [`.env.example`](./.env.example).

## Deep links

Parsed in [`src/lib/deepLinking/deepLinkService.ts`](src/lib/deepLinking/deepLinkService.ts) (e.g. `invite/`, `prompt/`, `photo/`, tabs). Root layout wires initial URL + foreground URLs.

## Design system

- Tokens: `src/theme/tokens.ts`; semantic themes: `src/theme/schemes.ts` via `useTheme()`.
- Primitives: `src/components/primitives`.
- Gallery: route `/(app)/design-system` (linked from Settings when paired).

## Maestro (optional E2E)

Flow example: [`.maestro/pairing-and-prompt.yaml`](./.maestro/pairing-and-prompt.yaml). Run when a simulator is available; not required for CI unless you add it.
