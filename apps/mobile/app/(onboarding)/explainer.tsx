import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '@/components/primitives';
import { Body, Heading, Screen, SectionCard } from '@/components/ui';
import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const SLIDES = [
  {
    title: 'Built for the in-between',
    body: "Daily prompts, shared presence, and small habits help you feel close when you're not in the same place.",
  },
  {
    title: 'A private space for just you two',
    body: 'What you share stays between you. Pairing links your account with your partner so the right memories land in the right room.',
  },
  {
    title: 'You’re in control',
    body: 'Notifications and rituals are yours to shape—start simple and add more as you go.',
  },
] as const;

export default function ExplainerScreen() {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const setExplainerDone = useOnboardingStore((s) => s.setExplainerDone);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);

  const isLast = index === SLIDES.length - 1;

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    setIndex(Math.round(x / width));
  }

  function goNext() {
    if (isLast) {
      setExplainerDone(true);
      router.replace('/(onboarding)/profile-setup');
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  }

  return (
    <Screen>
      <Heading>How it works</Heading>
      <Body>Swipe or tap through—three quick ideas</Body>
      <FlatList
        ref={listRef}
        data={[...SLIDES]}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        horizontal
        keyExtractor={(_, i) => `explainer-${i}`}
        onMomentumScrollEnd={onScrollEnd}
        pagingEnabled
        renderItem={({ item }) => (
          <View style={{ width, paddingTop: spacing.md }}>
            <SectionCard>
              <Heading>{item.title}</Heading>
              <Body>{item.body}</Body>
            </SectionCard>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.xs,
          marginTop: spacing.md,
        }}
      >
        {SLIDES.map((_, i) => (
          <View
            key={String(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === index ? theme.colors.primary : theme.colors.border,
            }}
          />
        ))}
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <Button label={isLast ? 'Continue' : 'Next'} onPress={goNext} />
      </View>
    </Screen>
  );
}
