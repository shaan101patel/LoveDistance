import { Text, View } from 'react-native';

import { PremiumGate, PremiumPlaceholderCard } from '@/components/premium';
import {
  FavoriteCategoriesCard,
  GratitudeWeekCard,
  PromptRhythmCard,
  SavedMemoriesCard,
} from '@/components/relationshipDashboard';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useRelationshipDashboard } from '@/features/hooks';
import {
  authScreenCopy,
  isSupabaseApiMode,
  relationshipDashboardCopy,
} from '@/services/apiMode';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function RelationshipDashboardScreen() {
  const theme = useTheme();
  const live = isSupabaseApiMode();
  const { data, isLoading, isError } = useRelationshipDashboard();

  return (
    <SectionScaffold
      kicker="Together"
      lead={authScreenCopy.relationshipDashboardLead(live)}
      title="Your rhythm"
    >
      {isLoading ? (
        <SectionCard>
          <Body>Gathering your little patterns…</Body>
        </SectionCard>
      ) : isError || !data ? (
        <SectionCard>
          <Body>We couldn’t load this view just now. Try again in a moment.</Body>
        </SectionCard>
      ) : (
        <View style={{ gap: spacing.lg }}>
          <Text
            style={{
              ...theme.type.body,
              color: theme.colors.textPrimary,
              fontSize: 17,
              lineHeight: 24,
              fontWeight: '500',
            }}
          >
            {data.headline}
          </Text>
          <PromptRhythmCard block={data.promptRhythm} />
          <GratitudeWeekCard block={data.gratitude} />
          <FavoriteCategoriesCard block={data.favoriteCategories} />
          <SavedMemoriesCard block={data.savedMemories} />
          <PremiumGate
            feature="deeper_analytics"
            fallback={
              <PremiumPlaceholderCard
                title="Deeper analytics"
                body="Seasonal trends, exports, and more detail—shipping with Plus. Your rhythm above stays fully available on the free tier."
              />
            }
          >
            <PremiumPlaceholderCard
              title="Deeper analytics (preview)"
              body={relationshipDashboardCopy.plusPreviewBody(live)}
            />
          </PremiumGate>
        </View>
      )}
    </SectionScaffold>
  );
}
