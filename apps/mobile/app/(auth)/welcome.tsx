import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useOnboardingStore } from '@/features/session/onboardingStore';
import { spacing } from '@/theme/tokens';

export default function WelcomeScreen() {
  const setWelcomeSeen = useOnboardingStore((s) => s.setWelcomeSeen);

  function toSignUp() {
    setWelcomeSeen(true);
    router.push('/(auth)/sign-up');
  }

  function toSignIn() {
    setWelcomeSeen(true);
    router.push('/(auth)/sign-in');
  }

  return (
    <SectionScaffold centerContent hideHero>
      <View style={{ marginBottom: spacing.md, alignItems: 'center' }}>
        <Body>
          Stay close, even at a distance—prompts, presence, and small rituals for long-distance love.
        </Body>
      </View>
      <SectionCard>
        <View style={{ gap: spacing.md }}>
          <Button label="Get started" onPress={toSignUp} />
          <Button label="I have an account" onPress={toSignIn} variant="ghost" />
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
