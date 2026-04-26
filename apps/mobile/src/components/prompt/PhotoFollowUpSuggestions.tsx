import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFollowUpSuggestions } from '@/features/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { Body, SectionCard } from '@/components/ui';

type Props = {
  imageUri: string;
  promptQuestion: string;
  partnerName?: string;
  onSelectLine: (line: string) => void;
};

/**
 * Mock conversation starters when your partner’s answer includes a photo (unlocked thread).
 */
export function PhotoFollowUpSuggestions({
  imageUri,
  promptQuestion,
  partnerName,
  onSelectLine,
}: Props) {
  const theme = useTheme();
  const { data, isLoading, isError } = useFollowUpSuggestions({
    imageUri,
    promptQuestion,
    partnerName,
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: { ...theme.type.body, color: theme.colors.textPrimary, fontWeight: '600' as const },
        chip: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          backgroundColor: theme.colors.surfaceAlt,
        },
        chipText: { ...theme.type.bodySm, color: theme.colors.textSecondary },
      }),
    [theme],
  );

  if (isLoading) {
    return (
      <SectionCard>
        <Body>Loading idea starters…</Body>
      </SectionCard>
    );
  }
  if (isError || !data?.length) {
    return null;
  }

  return (
    <SectionCard>
      <Text style={styles.title}>Try asking</Text>
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        {data.map((line) => (
          <Pressable
            key={line}
            accessibilityLabel={`Use suggestion: ${line}`}
            onPress={() => onSelectLine(line)}
            style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.chipText}>{line}</Text>
          </Pressable>
        ))}
      </View>
    </SectionCard>
  );
}
