import { Linking, Pressable, Text, View } from 'react-native';

import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { getSupportEmail } from '@/lib/supportEmail';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function SettingsDeleteAccountScreen() {
  const theme = useTheme();
  const accountDeletionEmail = getSupportEmail();

  return (
    <SectionScaffold
      kicker="Account"
      lead="We do not offer self‑serve account deletion in this build. To remove your data from our systems, reach out using the address below."
      title="Delete account"
    >
      <SectionCard>
        <Body>
          To request deletion of your account and all associated data, email us at the address below.
          Include the email address you use to sign in so we can verify and process your request.
        </Body>
        <View style={{ marginTop: spacing.lg }}>
          <Pressable
            accessibilityLabel={`Email ${accountDeletionEmail}`}
            accessibilityRole="link"
            onPress={() => void Linking.openURL(`mailto:${accountDeletionEmail}`)}
            style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
          >
            <Text
              style={{
                ...theme.type.body,
                color: theme.colors.primary,
                fontWeight: '600',
              }}
            >
              {accountDeletionEmail}
            </Text>
          </Pressable>
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
