# LoveDistance Backend Strategy

## Backend direction
LoveDistance will use Supabase for all backend-related work.

That includes:
- database tables,
- authentication,
- file storage,
- photo uploads,
- realtime features where needed,
- edge functions,
- row-level security,
- cron or scheduled backend jobs where applicable,
- and backend-facing integration points.

Supabase should be treated as the primary backend platform rather than a temporary service.

## Important planning note
A final schema is not defined yet.

That is intentional. The current build strategy is to avoid locking into a data model too early because the product surface is still evolving and the frontend experience will likely shape how backend entities should actually be modeled.

## Build order
The intended order is:
1. Build the full frontend product experience first.
2. Flesh out screens, flows, components, states, and navigation.
3. Confirm how the product should feel and behave.
4. Then design the backend structure in Supabase.
5. Then add backend integration and connect the UI to real data.

This means the first implementation pass should prioritize a clean frontend architecture with mocked data, realistic state handling, and component boundaries that can later map cleanly onto Supabase-backed services.

## MCP and CLI access
Any coding agent working on this project should assume it may have access to Supabase MCP and/or the Supabase CLI.

If MCP or CLI access is available, the agent should take advantage of it when building or changing backend-related functionality. That includes inspecting project settings, working with local or remote Supabase environments, creating migrations, reviewing table structures, generating types, managing storage-related setup, and helping wire integrations more accurately.

Even with MCP or CLI available, the agent should still avoid prematurely locking the final schema before the frontend product flows are validated.

## What this means for Cursor or any coding agent
Cursor or any other agent should not assume the final database schema yet.

Instead, the agent should:
- build frontend-first,
- use mock data and mock services where needed,
- keep data access abstracted behind clear interfaces,
- avoid overcommitting to database field names too early,
- prepare the codebase so Supabase can be introduced cleanly in a later phase,
- and use Supabase MCP or CLI capabilities whenever backend work begins or backend changes are needed.

## Expected Supabase responsibilities later
When backend work begins, Supabase is expected to handle:
- auth and session management,
- couple pairing persistence,
- prompt and response storage,
- prompt thread comments and reactions,
- gratitude entries,
- photo/media storage,
- habit definitions and completions,
- milestone timeline persistence,
- notification-triggering backend logic,
- deep-link related content fetching,
- premium gating support if needed,
- recap pipelines and edge-function powered logic,
- and any secure server-side logic that should not live in the client.

## Architectural guidance
The frontend should be built in a way that makes this later transition straightforward.

Recommended approach:
- keep feature modules separated,
- centralize service boundaries,
- define lightweight frontend types that can evolve,
- use repository or service layers for data reads and writes,
- and isolate mock implementations so they can be swapped with Supabase implementations later.

## Anti-goals for now
- Do not finalize the schema prematurely.
- Do not tightly couple UI components to guessed database shapes.
- Do not let backend uncertainty block frontend progress.

## Summary
The current strategy is frontend first, Supabase later, then full integration.

Supabase is the long-term backend choice for essentially all backend responsibilities, and agents should use Supabase MCP or CLI access when available, but schema design should follow the frontend rather than constrain it too early.
