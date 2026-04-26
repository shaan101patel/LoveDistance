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

  it('parses settings subsection paths', () => {
    expect(parseDeepLink('lovedistance://settings/privacy')).toEqual({
      kind: 'settings',
      subsection: 'privacy',
    });
    expect(parseDeepLink('lovedistance://tabs/settings/notifications')).toEqual({
      kind: 'settings',
      subsection: 'notifications',
    });
  });

  it('round-trips settings ref to Expo path', () => {
    const ref = { kind: 'settings' as const, subsection: 'relationship' as const };
    expect(getPathFromRef(ref)).toBe('/(app)/(tabs)/settings/relationship');
    expect(parseDeepLink('lovedistance://settings/relationship')).toEqual(ref);
  });

  it('parses notifications inbox deep link', () => {
    expect(parseDeepLink('lovedistance://notifications')).toEqual({ kind: 'notifications' });
    expect(parseDeepLink('lovedistance://tabs/notifications')).toEqual({ kind: 'notifications' });
    expect(getPathFromRef({ kind: 'notifications' })).toBe('/(app)/notifications');
  });

  it('parses photo compose before generic photo id', () => {
    expect(parseDeepLink('lovedistance://photo/compose')).toEqual({ kind: 'photo_compose' });
    expect(getPathFromRef({ kind: 'photo_compose' })).toBe('/(app)/photo/compose');
    expect(parseDeepLink('lovedistance://photo/album-1')).toEqual({
      kind: 'photo',
      id: 'album-1',
    });
  });

  it('strips query string for path matching', () => {
    expect(parseDeepLink('lovedistance://photo/compose?ritual=1')).toEqual({
      kind: 'photo_compose',
    });
  });
});
