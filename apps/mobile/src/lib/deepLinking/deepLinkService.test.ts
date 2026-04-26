import { getPathFromRef, parseDeepLink } from '@/lib/deepLinking/deepLinkService';

describe('deepLinkService', () => {
  it('parses prompt links', () => {
    expect(parseDeepLink('lovedistance://prompt/prompt-123')).toEqual({
      kind: 'prompt',
      id: 'prompt-123',
    });
  });

  it('builds app path from memory ref', () => {
    expect(getPathFromRef({ kind: 'memory', id: 'memory-1' })).toBe('/(app)/memory/memory-1');
  });

  it('parses main tab deep link', () => {
    expect(parseDeepLink('lovedistance://tabs/calendar')).toEqual({
      kind: 'tab',
      name: 'calendar',
    });
  });

  it('resolves tab ref to tab route', () => {
    expect(getPathFromRef({ kind: 'tab', name: 'timeline' })).toBe('/(app)/(tabs)/timeline');
  });
});
