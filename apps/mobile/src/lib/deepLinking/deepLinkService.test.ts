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

  it('parses invite deep links to token ref', () => {
    expect(parseDeepLink('lovedistance://invite/inv-abc-xyz12')).toEqual({
      kind: 'invite',
      token: 'inv-abc-xyz12',
    });
  });

  it('resolves invite ref to onboarding invite route', () => {
    expect(getPathFromRef({ kind: 'invite', token: 'inv-abc-xyz12' })).toBe(
      '/(onboarding)/invite/inv-abc-xyz12',
    );
  });
});
