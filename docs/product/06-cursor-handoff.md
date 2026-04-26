# Cursor Handoff Notes

## What these docs are for
These documents define the minimum planning context needed before implementation. They are meant to help Cursor generate code with less ambiguity.

## What Cursor should optimize for
- Mobile-first UX.
- Fast daily interactions.
- Couple-only privacy.
- Clean domain boundaries.
- Explicit state handling.
- Frontend-first implementation with mocked data.
- Easy extension into Supabase, widgets, premium features, and analytics later.

## Constraints
- Do not overcomplicate the first version.
- Favor clean architecture over premature abstraction.
- Build the smallest complete frontend vertical slices first.
- Do not lock in a backend schema too early.
- Avoid broad refactors unless required by validated product flows.

## Backend note
Cursor or any other coding agent reading this should assume it may have access to Supabase MCP and/or the Supabase CLI.

Use those tools when backend implementation begins or when backend-related changes are needed. That includes inspecting environments, managing migrations, checking table definitions, generating types, working with storage, and validating integration details more accurately.

## Suggested implementation order for Cursor
1. Generate repo architecture and scaffold.
2. Build the frontend shell, navigation, and design system.
3. Implement prompt engine and delayed reveal thread flow with mock data.
4. Implement photo sharing and home feed with mock data.
5. Implement habits and calendar with mock data.
6. Implement timeline, milestones, notifications, and deep linking at the frontend level.
7. After frontend flows are validated, design Supabase backend structure.
8. Replace mock services with Supabase integrations.
9. Use Supabase MCP or CLI actively during backend implementation and follow-up backend changes.
10. Add gratitude, dashboard, recap, premium, and other V2 features after core stability.

## Suggested first Cursor prompt
Use the provided docs to propose a production-ready mobile-first app architecture for LoveDistance. Then generate a phased implementation plan, repo structure, mocked service boundaries, and frontend-first MVP slices. Do not lock in a final backend schema yet. Start with the smallest complete frontend vertical slices.

## Suggested review rule
Every generated PR or code batch should clearly state:
- what feature it implements,
- what files it changed,
- what assumptions it made,
- what remains unfinished,
- and how to test it locally.
