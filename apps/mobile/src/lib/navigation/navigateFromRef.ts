import type { Href } from 'expo-router';
import { router } from 'expo-router';

import { getPathFromRef } from '@/lib/deepLinking/deepLinkService';
import type { DeepLinkRef } from '@/types/domain';

export function navigateFromRef(ref: DeepLinkRef) {
  router.push(getPathFromRef(ref) as Href);
}
