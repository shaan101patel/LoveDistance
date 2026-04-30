import type { Href } from 'expo-router';

/** Maps `MemoryItem.deepLinkRef` (`kind:id`) to an in-app route. */
export function hrefFromTimelineDeepLinkRef(ref: string): Href {
  const idx = ref.indexOf(':');
  if (idx <= 0) {
    return '/(app)/(tabs)/home' as Href;
  }
  const kind = ref.slice(0, idx);
  const id = ref.slice(idx + 1);
  if (kind === 'prompt') {
    return `/(app)/prompt/${id}` as Href;
  }
  if (kind === 'photo') {
    return `/(app)/photo/${id}` as Href;
  }
  if (kind === 'memory') {
    return `/(app)/memory/${id}` as Href;
  }
  if (kind === 'habit') {
    return `/(app)/habit/${id}` as Href;
  }
  return '/(app)/(tabs)/home' as Href;
}

export function timelineDeepLinkTargetsMemorySelf(
  ref: string,
  currentMemoryId: string,
): boolean {
  const idx = ref.indexOf(':');
  if (idx <= 0) return false;
  const kind = ref.slice(0, idx);
  const id = ref.slice(idx + 1);
  return kind === 'memory' && id === currentMemoryId;
}
