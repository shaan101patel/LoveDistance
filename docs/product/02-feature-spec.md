# LoveDistance Feature Spec

## Feature Groups

## 1. Pairing and account setup
### Requirements
- Users can sign up and create a private account.
- One user can invite a partner through a secure invite link.
- After pairing, the app becomes a couple-only shared space.
- Users can manage privacy settings, permissions, and lock settings.

### Acceptance criteria
- A user can pair successfully from a fresh account.
- Invite links route directly into the pairing flow.
- Unpaired users cannot access couple content.

## 2. Daily prompt system
### Requirements
- Show one curated daily prompt.
- Support optional prompt categories.
- Each partner submits independently.
- Answers remain blurred until both partners answer the current prompt.
- After both answer, the thread fully unlocks.
- Thread supports emoji reactions, comments, and follow-up replies.

### Acceptance criteria
- Both users see the same daily prompt.
- Each user can answer only once unless editing is intentionally enabled.
- Reveal logic works correctly for both users.
- Once unlocked, the thread remains readable.

## 3. Gratitude and memory layer
### Requirements
- Support gratitude entries with optional photo attachment.
- Save prompts, gratitude, photos, milestones, and favorites into a searchable timeline.
- Users can save or favorite meaningful moments.

### Acceptance criteria
- Timeline can be filtered by type.
- Users can search past entries.
- Favorite content is easy to retrieve.

## 4. Photo presence system
### Requirements
- Users can send a photo instantly from camera or camera roll.
- Photo post may include short caption, mood tag, and location label.
- Partner sees latest visual update in the home feed.
- Support lightweight reactions.
- Keep chronological photo history.

### Acceptance criteria
- Photo upload is fast and reliable.
- Latest photo appears in the shared home feed.
- Reactions do not require a full comment flow.
- Photo archive is ordered and persistent.

## 5. Prompt + photo fusion
### Requirements
- Daily prompt answers may include an optional photo.
- Photos can trigger optional follow-up conversation starters.

### Acceptance criteria
- A prompt answer can contain text only or text plus photo.
- Suggested conversation starter is optional and non-blocking.

## 6. Long-distance rituals
### Requirements
- Good morning photo.
- Good night note.
- Miss-you check-in.
- Countdown to reunion.
- Time-zone-aware reminders.

### Acceptance criteria
- Ritual actions are quick to complete.
- Countdown supports a future reunion date.
- Notifications respect each partner’s local time.

## 7. Shared habits and calendar
### Requirements
- Month and week calendar views.
- Support mine / yours / ours habits.
- Include default LDR-friendly habits.
- Support shared goals.
- Support either-partner-completes and both-must-complete logic.
- Morning wake-up check-in logs wake time / sleep consistency and unlocks the day’s prompt.

### Acceptance criteria
- Habit completion appears correctly on calendar views.
- Shared logic is visible and understandable.
- Wake-up check-in affects prompt availability as designed.
- Streaks update correctly.

## 8. Dashboard and milestones
### Requirements
- Show trends like prompt consistency, gratitude frequency, favorite categories, and saved memories.
- Maintain a combined milestone timeline for prompts, photos, anniversaries, trips, and streak wins.

### Acceptance criteria
- Users can understand trends at a glance.
- Dashboard feels supportive, not clinical.

## 9. Notifications
### Requirements
- Notifications for unanswered prompts, new photos, reactions, habit reminders, anniversaries, countdown milestones, and missed shared habits.
- Users can tune notification preferences.

### Acceptance criteria
- Notifications are granular and can be disabled per type.
- Time-zone handling works reliably.

## 10. Deep linking
### Requirements
- Any shareable page or thread can be opened directly from a copied link.
- Links should route users to the exact thread, memory, or page when authorized.

### Acceptance criteria
- Shared URLs navigate directly to intended app content.
- Unauthorized users are redirected into auth/pairing safely.

## 11. Offline and sync
### Requirements
- Users can draft answers, captions, and habit check-ins offline.
- App syncs when the connection returns.

### Acceptance criteria
- Offline drafts are visibly pending.
- Sync resolution does not duplicate entries.

## 12. Monetization
### Requirements
- Free core experience.
- Premium upsells for extra prompt packs, advanced widgets, customization, exports, and deeper analytics.

### Acceptance criteria
- Free flow is fully usable.
- Premium boundaries are clear and non-disruptive.
