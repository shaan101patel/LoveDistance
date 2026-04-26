import { mockDb, mockPartner, refreshRevealState, upsertPromptPhotoFusionMemory } from '@/services/mock/mockData';

/**
 * Mock-only: append partner's answer so a single device can reach unlocked state.
 * No-op in production data paths; used from __DEV__ UI or tests.
 */
export function devSimulatePartnerTodayAnswer(): void {
  if (mockDb.prompt.answers.some((a) => a.userId === mockPartner.id)) {
    return;
  }
  mockDb.prompt.answers.push({
    userId: mockPartner.id,
    answer: 'I felt close when we laughed on the call last night.',
    submittedAt: new Date().toISOString(),
    imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  });
  refreshRevealState();
  upsertPromptPhotoFusionMemory();
}

/**
 * Mock-only: append a reaction as the partner (distinct from the signed-in user).
 */
export function devSimulatePartnerTodayReaction(emoji = '❤️'): void {
  if (mockDb.prompt.reactions.some((r) => r.userId === mockPartner.id)) {
    return;
  }
  mockDb.prompt.reactions.push({
    id: `reaction-partner-${Date.now()}`,
    userId: mockPartner.id,
    emoji,
  });
  refreshRevealState();
}
