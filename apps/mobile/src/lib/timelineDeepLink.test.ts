import { describe, expect, it } from 'vitest';

import {
  hrefFromTimelineDeepLinkRef,
  timelineDeepLinkTargetsMemorySelf,
} from '@/lib/timelineDeepLink';

describe('hrefFromTimelineDeepLinkRef', () => {
  it('maps prompt photo memory habit', () => {
    expect(hrefFromTimelineDeepLinkRef('prompt:abc')).toBe('/(app)/prompt/abc');
    expect(hrefFromTimelineDeepLinkRef('photo:post-1')).toBe('/(app)/photo/post-1');
    expect(hrefFromTimelineDeepLinkRef('memory:m1')).toBe('/(app)/memory/m1');
    expect(hrefFromTimelineDeepLinkRef('habit:h1')).toBe('/(app)/habit/h1');
  });

  it('falls back to home for bad ref', () => {
    expect(hrefFromTimelineDeepLinkRef('')).toBe('/(app)/(tabs)/home');
    expect(hrefFromTimelineDeepLinkRef('nocolon')).toBe('/(app)/(tabs)/home');
    expect(hrefFromTimelineDeepLinkRef(':onlykind')).toBe('/(app)/(tabs)/home');
  });
});

describe('timelineDeepLinkTargetsMemorySelf', () => {
  it('detects self memory ref', () => {
    expect(timelineDeepLinkTargetsMemorySelf('memory:abc', 'abc')).toBe(true);
    expect(timelineDeepLinkTargetsMemorySelf('memory:abc', 'other')).toBe(false);
    expect(timelineDeepLinkTargetsMemorySelf('prompt:x', 'x')).toBe(false);
  });
});
