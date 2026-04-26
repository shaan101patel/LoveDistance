import { type PropsWithChildren, type ReactNode } from 'react';

import { Body } from '@/components/ui';
import { usePremiumFeature } from '@/features/hooks';
import type { PremiumFeature } from '@/types/domain';

type Props = PropsWithChildren<{
  feature: PremiumFeature;
  /** Shown when the user does not have access; default is a single quiet line. */
  fallback?: ReactNode;
}>;

export function PremiumGate({ feature, fallback, children }: Props) {
  const { hasAccess } = usePremiumFeature(feature);
  if (hasAccess) {
    return children;
  }
  return (
    fallback ?? (
      <Body>
        Available with LoveDistance Plus when billing is ready—your core experience stays free.
      </Body>
    )
  );
}
