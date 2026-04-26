# Local development setup

## Prerequisites

- **Node.js** 20 LTS (or 18+) and **npm**
- **Git**
- **iOS**: Xcode + Simulator (macOS only), or a physical iPhone with Expo Go
- **Android**: Android Studio + emulator, or a physical device with Expo Go
- Optional: **Supabase CLI** for running migrations locally or against a linked project ([install](https://supabase.com/docs/guides/cli))

## 1. Clone and install

```bash
git clone <repository-url>
cd LoveDistance/apps/mobile
npm install
```

## 2. Environment

```bash
cp .env.example .env
```

Edit `.env` (never commit it). See [ENVIRONMENT.md](./ENVIRONMENT.md) for variable meanings.

- For **UI and navigation work** without a backend: keep `EXPO_PUBLIC_API_MODE=mock` and leave Supabase URL/key empty.
- For **real data**: set `EXPO_PUBLIC_API_MODE=supabase` and fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from the Supabase project dashboard.

## 3. Run the app

From `apps/mobile`:

```bash
npm run start
```

Then press `i` (iOS Simulator), `a` (Android emulator), or scan the QR code with **Expo Go**.

Other useful scripts:

| Command | Purpose |
|--------|---------|
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run ios` / `npm run android` | Start with platform shortcut |

## 4. Supabase (optional for local stack)

From the **repository root** (where `supabase/config.toml` lives):

```bash
supabase start    # local Postgres, Auth, Storage, Studio
supabase stop     # when finished
```

Apply migrations to a **linked remote** project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

See [SUPABASE.md](./SUPABASE.md) for linking, Edge Functions, and storage.

## 5. Product and architecture context

High-level product docs live under `docs/product/` (brief, flows, backend strategy, etc.).
