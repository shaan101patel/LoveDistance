import { describe, expect, it } from 'vitest';

import { hasPremiumAccess, isPremiumTier, premiumUnlocks } from '@/features/premium/entitlements';

describe('entitlements', () => {
  it('isPremiumTier', () => {
    expect(isPremiumTier({ tier: 'premium', renewsAtIso: null, source: 'mock' })).toBe(true);
    expect(isPremiumTier({ tier: 'free', renewsAtIso: null, source: 'mock' })).toBe(false);
  });

  it('premiumUnlocks is false for free', () => {
    expect(premiumUnlocks('deeper_analytics', 'free')).toBe(false);
    expect(premiumUnlocks('extra_prompt_packs', 'free')).toBe(false);
  });

  it('premiumUnlocks is true for premium', () => {
    expect(premiumUnlocks('deeper_analytics', 'premium')).toBe(true);
  });

  it('hasPremiumAccess', () => {
    expect(hasPremiumAccess(null, 'data_export')).toBe(false);
    expect(
      hasPremiumAccess({ tier: 'premium', renewsAtIso: null, source: 'mock' }, 'theme_customization'),
    ).toBe(true);
  });
});
