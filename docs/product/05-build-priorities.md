# LoveDistance Build Priorities

## Phase 1: Must build first
- Frontend shell and navigation.
- Couple pairing flow at the UI level.
- Shared home shell.
- Daily prompt engine.
- Delayed reveal logic.
- Prompt thread and reactions.
- Photo sharing.
- Shared habit calendar.
- Notifications foundation.
- Basic timeline.
- Deep linking.

## Phase 2: Should build next
- Gratitude flow.
- Favorites and saved memories.
- Reunion countdown.
- Shared goals.
- Time-zone-aware reminders.
- Better search and filtering.
- Privacy locks and permissions.
- Supabase backend design after frontend flows are validated.
- Replacing mock services with real Supabase integrations.

## Phase 3: Good expansion work
- Voice notes.
- Sunday recap with ranking.
- Emotional dashboard.
- Widget rotation cards.
- Calendar integrations.
- Offline drafting and sync queue.
- Premium features.

## Engineering priorities
- Get the core couple loop working before edge polish.
- Build frontend flows with mocked data before locking backend structure.
- Optimize for mobile speed and clarity.
- Keep state transitions explicit for prompts, habits, and notifications.
- Use Supabase as the future backend platform for auth, storage, database, realtime, and server-side logic.
- Use Supabase MCP or the Supabase CLI when backend implementation or changes begin.

## Definition of MVP done
MVP is done when a real couple can:
- Pair successfully.
- Complete a daily prompt and unlock replies.
- Send and react to photos.
- Track shared habits.
- Receive useful notifications.
- Revisit shared memories.
- Open deep links to exact content.
