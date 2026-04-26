import type { AppTabName, DeepLinkRef, SettingsDeepLinkSubsection } from '@/types/domain';

const tabNames: AppTabName[] = ['home', 'prompt', 'photos', 'calendar', 'timeline', 'settings'];

const settingsSubsections: SettingsDeepLinkSubsection[] = [
  'notifications',
  'privacy',
  'profile',
  'security',
  'relationship',
];

function isTabName(value: string): value is AppTabName {
  return tabNames.includes(value as AppTabName);
}

function stripQuery(path: string): string {
  const q = path.indexOf('?');
  return q >= 0 ? path.slice(0, q) : path;
}

function isSettingsSubsection(value: string): value is SettingsDeepLinkSubsection {
  return settingsSubsections.includes(value as SettingsDeepLinkSubsection);
}

function tryParsePath(rawPath: string): DeepLinkRef | null {
  const path = stripQuery(rawPath);

  if (path.startsWith('invite/')) {
    return { kind: 'invite', token: path.replace('invite/', '') };
  }

  if (path === 'photo/compose') {
    return { kind: 'photo_compose' };
  }
  if (path.startsWith('photo/')) {
    return { kind: 'photo', id: path.replace('photo/', '') };
  }

  if (path.startsWith('prompt/')) return { kind: 'prompt', id: path.replace('prompt/', '') };
  if (path.startsWith('memory/')) return { kind: 'memory', id: path.replace('memory/', '') };
  if (path.startsWith('habit/')) return { kind: 'habit', id: path.replace('habit/', '') };

  if (path.startsWith('tabs/settings/')) {
    const sub = path.replace('tabs/settings/', '').split('/')[0]!;
    if (isSettingsSubsection(sub)) return { kind: 'settings', subsection: sub };
  }
  if (path.startsWith('settings/')) {
    const sub = path.replace('settings/', '').split('/')[0]!;
    if (isSettingsSubsection(sub)) return { kind: 'settings', subsection: sub };
  }

  if (path === 'notifications' || path === 'tabs/notifications') {
    return { kind: 'notifications' };
  }

  if (path.startsWith('tabs/')) {
    const name = path.replace('tabs/', '');
    if (isTabName(name)) return { kind: 'tab', name };
  }
  if (path.startsWith('tab/')) {
    const name = path.replace('tab/', '');
    if (isTabName(name)) return { kind: 'tab', name };
  }
  if (!path.includes('/') && isTabName(path)) {
    return { kind: 'tab', name: path };
  }

  return null;
}

export function parseDeepLink(url: string): DeepLinkRef | null {
  let normalized: URL;
  try {
    normalized = new URL(url);
  } catch {
    return null;
  }

  const host = normalized.host.replace(/^\/+/, '');
  const pathname = normalized.pathname.replace(/^\/+/, '');
  const variants = [pathname, host ? `${host}/${pathname}`.replace(/\/+$/, '') : ''];

  for (const raw of variants) {
    if (!raw) continue;
    const hit = tryParsePath(raw);
    if (hit) {
      return hit;
    }
  }
  return null;
}

export function getPathFromRef(ref: DeepLinkRef): string {
  switch (ref.kind) {
    case 'tab':
      return `/(app)/(tabs)/${ref.name}`;
    case 'prompt':
      return `/(app)/prompt/${ref.id}`;
    case 'memory':
      return `/(app)/memory/${ref.id}`;
    case 'photo':
      return `/(app)/photo/${ref.id}`;
    case 'habit':
      return `/(app)/habit/${ref.id}`;
    case 'settings':
      return `/(app)/(tabs)/settings/${ref.subsection}`;
    case 'notifications':
      return '/(app)/notifications';
    case 'photo_compose':
      return '/(app)/photo/compose';
    case 'invite':
      return `/(onboarding)/invite/${ref.token}`;
    default: {
      const _never: never = ref;
      return _never;
    }
  }
}
