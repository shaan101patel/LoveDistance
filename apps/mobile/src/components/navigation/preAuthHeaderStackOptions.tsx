import type { ReactElement } from 'react';

import { MeHeaderAvatarButton } from '@/components/navigation/MeHeaderAvatarButton';
import type { AppTheme } from '@/theme/types';

/** Stack options for (auth) and (onboarding): native header + profile control (signed-in → app profile, signed-out → guest profile). */
export function preAuthHeaderStackOptions(theme: AppTheme) {
  return {
    headerShown: true as const,
    headerStyle: { backgroundColor: theme.colors.surface },
    headerTintColor: theme.colors.textPrimary,
    headerTitleStyle: { fontWeight: '600' as const },
    headerShadowVisible: true,
    headerRight: (): ReactElement => <MeHeaderAvatarButton />,
  };
}
