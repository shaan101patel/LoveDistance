import type { AppTabName, DeepLinkRef } from '@/types/domain';

const tabNames: AppTabName[] = ['home', 'prompt', 'photos', 'calendar', 'timeline', 'settings'];

function isTabName(value: string): value is AppTabName {
  return tabNames.includes(value as AppTabName);
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

  for (const path of variants) {
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
    if (path.startsWith('prompt/')) return { kind: 'prompt', id: path.replace('prompt/', '') };
    if (path.startsWith('memory/')) return { kind: 'memory', id: path.replace('memory/', '') };
    if (path.startsWith('photo/')) return { kind: 'photo', id: path.replace('photo/', '') };
    if (path.startsWith('habit/')) return { kind: 'habit', id: path.replace('habit/', '') };
    if (path.startsWith('invite/')) return { kind: 'invite', token: path.replace('invite/', '') };
  }
  return null;
}

export function getPathFromRef(ref: DeepLinkRef): string {
  if (ref.kind === 'tab') return `/(app)/(tabs)/${ref.name}`;
  if (ref.kind === 'prompt') return `/(app)/prompt/${ref.id}`;
  if (ref.kind === 'memory') return `/(app)/memory/${ref.id}`;
  if (ref.kind === 'photo') return `/(app)/photo/${ref.id}`;
  if (ref.kind === 'habit') return `/(app)/habit/${ref.id}`;
  return `/(onboarding)/invite/${ref.token}`;
}
