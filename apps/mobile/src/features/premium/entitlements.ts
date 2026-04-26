import type { PremiumFeature, SubscriptionState, SubscriptionTier } from '@/types/domain';

export function isPremiumTier(state: SubscriptionState): boolean {
  return state.tier === 'premium';
}

/** Today: every listed premium feature unlocks with `premium` tier only. */
export function premiumUnlocks(feature: PremiumFeature, tier: SubscriptionTier): boolean {
  void feature;
  return tier === 'premium';
}

export function hasPremiumAccess(state: SubscriptionState | null | undefined, feature: PremiumFeature): boolean {
  if (!state) {
    return false;
  }
  return premiumUnlocks(feature, state.tier);
}
