import { Linking, Pressable, Text, View } from 'react-native';

import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const FEEDBACK_EMAIL = 'placeholder@gmail.com';
const FEEDBACK_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('LoveDistance feedback')}`;

export default function SettingsFeedbackScreen() {
  const theme = useTheme();

  return (
    <SectionScaffold
      kicker="Help us improve"
      lead="There is no in-app feedback form in this build. Share bugs, ideas, or anything that would make LoveDistance better for you—email us below."
      title="Send feedback"
    >
      <SectionCard>
        <Body>
          Tell us what is working, what is not, and what you wish the app could do. Mention your device and OS version if you are reporting a bug—it helps us reproduce issues faster.
        </Body>
        <View style={{ marginTop: spacing.lg }}>
          <Pressable
            accessibilityLabel={`Email ${FEEDBACK_EMAIL}`}
            accessibilityRole="link"
            onPress={() => void Linking.openURL(FEEDBACK_MAILTO)}
            style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
          >
            <Text
              style={{
                ...theme.type.body,
                color: theme.colors.primary,
                fontWeight: '600',
              }}
            >
              {FEEDBACK_EMAIL}
            </Text>
          </Pressable>
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
