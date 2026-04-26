import { BlurView } from 'expo-blur';
import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/primitives/Card';
import type { PartnerRowModel } from '@/features/prompts/threadViewModel';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  row: PartnerRowModel;
  title: string;
};

/**
 * Renders the partner’s side of the thread. When obscured, the real answer is not shown; native uses blur, web uses a frosted overlay.
 */
export function PartnerAnswerPanel({ row, title }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionLabel: { ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.xs },
        body: { ...theme.type.body, color: theme.colors.textPrimary },
        meta: { ...theme.type.caption, color: theme.colors.textMuted, marginTop: spacing.xs },
        obscuredBox: {
          position: 'relative' as const,
          minHeight: 112,
          borderRadius: radius.lg,
          overflow: 'hidden' as const,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceAlt,
        },
        blurInner: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center' as const,
          padding: spacing.lg,
          zIndex: 1,
        },
        overlayWeb: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(255, 249, 246, 0.9)',
          justifyContent: 'center' as const,
          padding: spacing.lg,
        },
        obscuredText: { ...theme.type.bodySm, color: theme.colors.textSecondary, textAlign: 'center' as const },
      }),
    [theme],
  );

  if (row.kind === 'waiting') {
    return (
      <View accessibilityRole="text">
        <Text style={styles.sectionLabel}>{title}</Text>
        <Text style={styles.body}>
          Waiting for {row.partnerFirstName} to share their answer…
        </Text>
      </View>
    );
  }

  if (row.kind === 'obscured') {
    return (
      <View>
        <Text style={styles.sectionLabel}>{title}</Text>
        <View style={styles.obscuredBox} accessibilityLabel="Partner answer hidden until you both share">
          {Platform.OS === 'web' ? (
            <View style={styles.overlayWeb}>
              <Text style={styles.obscuredText}>
                Hidden until you both answer—you will see each other when the thread unlocks.
              </Text>
            </View>
          ) : (
            <>
              <BlurView intensity={55} style={StyleSheet.absoluteFill} tint="light" />
              <View style={styles.blurInner}>
                <Text style={styles.obscuredText}>
                  Hidden until you both answer—you will see each other when the thread unlocks.
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionLabel}>{title}</Text>
      <Text style={styles.body}>{row.text}</Text>
      <Text style={styles.meta}>
        {new Date(row.submittedAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

type AnswerCardProps = { heading: string; text: string; submittedAt: string };

/** Full answer display once the thread is unlocked. */
export function UnlockedAnswerCard({ heading, text, submittedAt }: AnswerCardProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: { ...theme.type.caption, color: theme.colors.textMuted, marginBottom: spacing.xs },
        body: { ...theme.type.body, color: theme.colors.textPrimary },
        meta: { ...theme.type.caption, color: theme.colors.textMuted, marginTop: spacing.sm },
      }),
    [theme],
  );
  return (
    <Card elevated={false} style={{ gap: 0 }}>
      <Text style={styles.label}>{heading}</Text>
      <Text style={styles.body}>{text}</Text>
      <Text style={styles.meta}>
        {new Date(submittedAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
    </Card>
  );
}
