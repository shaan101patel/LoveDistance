import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSupportEmail } from '@/lib/supportEmail';

describe('getSupportEmail', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses EXPO_PUBLIC_SUPPORT_EMAIL when set', () => {
    vi.stubEnv('EXPO_PUBLIC_SUPPORT_EMAIL', '  hello@example.com  ');
    expect(getSupportEmail()).toBe('hello@example.com');
  });

  it('falls back when unset', () => {
    vi.stubEnv('EXPO_PUBLIC_SUPPORT_EMAIL', '');
    expect(getSupportEmail()).toBe('support@lovedistance.com');
  });
});
