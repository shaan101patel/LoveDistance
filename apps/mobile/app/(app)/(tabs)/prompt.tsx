import { Link, router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { EmptyState } from '@/components/primitives';
import { PremiumGate, PremiumUpsellBanner } from '@/components/premium';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { isSupabaseApiMode, promptTabCopy } from '@/services/apiMode';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export default function PromptTabScreen() {
  const theme = useTheme();
  const live = isSupabaseApiMode();
  return (
    <SectionScaffold
      kicker="Today"
      lead="One thoughtful question, answered when you are both ready. Thread and reactions will live here."
      title="Prompt"
    >
      <SectionCard>
        <EmptyState
          title={promptTabCopy.emptyTitle(live)}
          description={promptTabCopy.emptyDescription(live)}
        />
        <Link href="/(app)/prompt/prompt-placeholder">
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
            {promptTabCopy.openThreadLinkLabel(live)}
          </Text>
        </Link>
      </SectionCard>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ ...theme.type.bodySm, color: theme.colors.textMuted, fontWeight: '600' }}>
          Extra prompt packs
        </Text>
        <PremiumGate
          feature="extra_prompt_packs"
          fallback={
            <View style={{ gap: spacing.sm }}>
              <PremiumUpsellBanner
                message="Seasonal and long-distance packs—gentle add-ons, never required."
                onPress={() => router.push('/(app)/plus' as Href)}
              />
              <Body>Your daily prompt above stays exactly as it is for everyone.</Body>
            </View>
          }
        >
          <SectionCard>
            <Body>{promptTabCopy.plusUnlockedBody(live)}</Body>
          </SectionCard>
        </PremiumGate>
      </View>
    </SectionScaffold>
  );
}
