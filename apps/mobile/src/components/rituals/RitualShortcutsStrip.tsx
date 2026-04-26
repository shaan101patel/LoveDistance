import { useRouter, type Href } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { RitualActionCard } from '@/components/rituals/RitualActionCard';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typeBase } from '@/theme/tokens';

type Props = {
  partnerFirstName: string;
};

export function RitualShortcutsStrip({ partnerFirstName }: Props) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ ...typeBase.body, color: theme.colors.textPrimary, fontWeight: '600' }}>
        Quick rituals
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        <RitualActionCard
          emoji="☀️"
          title="Good morning photo"
          subtitle="Share a sunrise or coffee—opens the photo composer with a gentle preset."
          onPress={() => router.push('/(app)/photo/compose?ritual=good_morning' as Href)}
        />
        <RitualActionCard
          emoji="🌙"
          title="Good night note"
          subtitle={`Send a short line for ${partnerFirstName} to wake up to (mock log only).`}
          onPress={() => router.push('/(app)/ritual/quick-signal?kind=good_night' as Href)}
        />
        <RitualActionCard
          emoji="💌"
          title="Miss-you check-in"
          subtitle="One tap to say you are thinking of them—saved as a mock signal."
          onPress={() => router.push('/(app)/ritual/quick-signal?kind=miss_you' as Href)}
        />
      </ScrollView>
    </View>
  );
}
