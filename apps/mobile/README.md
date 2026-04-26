# LoveDistance Mobile Scaffold

This is the mobile-first scaffold for LoveDistance using Expo + TypeScript + Expo Router.

## What is included

- Base navigation shell (`(auth)`, `(onboarding)`, `(app)` route groups)
- App shell: bottom tabs **Home, Prompt, Photos, Calendar, Timeline, Settings**; stack screens for design system, detail routes (`prompt/`, `memory/`, `photo/`, `habit/`, …)
- Mock session only: unauthenticated users see sign-in; signed-in but unpaired users see pairing; paired users land in the main tabs
- Deep link helpers support `tabs/<section>` and existing thread routes (see `src/lib/deepLinking/deepLinkService.ts`)
- Design system (first pass): semantic light/dark themes, warm palette, and reusable primitives in `src/theme` and `src/components/primitives`
- In-app component gallery at route `/(app)/design-system` (Settings has a link when signed in and paired)
- Feature-based folder structure under `src/features`
- Mock-first service boundaries in `src/services` with future Supabase placeholders
- Tooling for linting, formatting, typechecking, and tests

## Product docs

- `../../docs/product/01-product-brief.md`
- `../../docs/product/02-feature-spec.md`
- `../../docs/product/03-user-flows.md`
- `../../docs/product/04-backend-strategy.md`
- `../../docs/product/05-build-priorities.md`
- `../../docs/product/06-cursor-handoff.md`

## Scripts

- `npm run start`
- `npm run ios`
- `npm run android`
- `npm run web`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:write`
- `npm run typecheck`
- `npm run test`

## Design system usage

- **Tokens**: `src/theme/tokens.ts` (raw palette, spacing, radius, type scale). **Semantic colors & shadows** per mode: `src/theme/schemes.ts` via `useTheme()` from `src/theme/ThemeProvider.tsx`.
- **Primitives**: import from `src/components/primitives` (`Button`, `Card`, `Input`, `TopBar`, `BottomNav`, etc.) or the legacy `Screen` / `SectionCard` helpers in `src/components/ui.tsx`.
- **Dark mode**: follows system appearance; toggle in the simulator or device settings to validate both themes.

## Environment placeholders

Copy `.env.example` to `.env` and fill values when backend integration starts.

- `EXPO_PUBLIC_API_MODE=mock|supabase`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
