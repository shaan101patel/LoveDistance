import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import type { CouplesPromptLibraryEntry } from '@/data/generatedCouplesPromptLibrary';
import { buildExtraQuestionBody } from '@/features/prompts/extraPromptReplyFormat';
import { eligiblePromptEntries, pickRandomPrompt } from '@/components/promptTab/libraryRandom';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const SWIPE_OUT = 120;

type Props = {
  allowNsfw: boolean;
  library: readonly CouplesPromptLibraryEntry[];
  onSend: (body: string) => void;
  sendPending: boolean;
};

export function PromptQuestionSwipeDeck({ allowNsfw, library, onSend, sendPending }: Props) {
  const theme = useTheme();
  const eligible = useMemo(() => eligiblePromptEntries(allowNsfw, library), [allowNsfw, library]);
  const [current, setCurrent] = useState(() => pickRandomPrompt(eligible));
  const [answer, setAnswer] = useState('');
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const currentTextRef = useRef(current.text);
  currentTextRef.current = current.text;

  const advance = useCallback(
    (avoid?: string) => {
      setCurrent(pickRandomPrompt(eligible, avoid));
      setAnswer('');
      translateX.setValue(0);
      opacity.setValue(1);
    },
    [eligible, opacity, translateX],
  );

  const runSwipeOut = useCallback((direction: 1 | -1, then: () => void) => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction * 400,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      then();
    });
  }, [opacity, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
        onPanResponderMove: (_, g) => {
          translateX.setValue(g.dx);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > SWIPE_OUT) {
            runSwipeOut(1, () => advance(currentTextRef.current));
          } else if (g.dx < -SWIPE_OUT) {
            runSwipeOut(-1, () => advance(currentTextRef.current));
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              friction: 6,
            }).start();
          }
        },
      }),
    [advance, runSwipeOut, translateX],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hint: { ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.sm },
        cardBody: { minHeight: 120, justifyContent: 'center' as const },
        prompt: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '600' },
        skip: { alignSelf: 'flex-start', marginTop: spacing.sm },
        skipText: { ...theme.type.caption, color: theme.colors.primary, fontWeight: '600' },
        input: {
          marginTop: spacing.md,
          minHeight: 72,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          ...theme.type.body,
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.surface,
        },
      }),
    [theme],
  );

  return (
    <View>
      <Text style={styles.hint}>Swipe the card away for another question. Add a line below, then send.</Text>
      <Animated.View
        style={{
          transform: [{ translateX }],
          opacity,
        }}
        {...panResponder.panHandlers}
      >
        <Card elevated>
          <View style={styles.cardBody}>
            <Text style={styles.prompt}>{current.text}</Text>
          </View>
        </Card>
      </Animated.View>
      <Pressable
        accessibilityLabel="Skip to another question"
        style={styles.skip}
        onPress={() => runSwipeOut(1, () => advance(currentTextRef.current))}
      >
        <Text style={styles.skipText}>Skip question</Text>
      </Pressable>
      <TextInput
        accessibilityLabel="Your thoughts on this question"
        multiline
        placeholder="Optional: add your thoughts…"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        textAlignVertical="top"
        value={answer}
        onChangeText={setAnswer}
      />
      <View style={{ marginTop: spacing.md }}>
        <Button
          disabled={sendPending}
          label={sendPending ? 'Sending…' : 'Send'}
          onPress={() => {
            const body = buildExtraQuestionBody(current.text, answer);
            onSend(body);
            advance(currentTextRef.current);
          }}
        />
      </View>
    </View>
  );
}
