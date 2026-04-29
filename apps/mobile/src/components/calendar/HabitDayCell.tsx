import { Pressable, Text, View, type ViewStyle } from 'react-native';

import type { HabitDayDisplayState } from '@/features/habits/habitDisplayState';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

type Props = {
  dayLabel: string;
  dayNumber: number;
  state: HabitDayDisplayState;
  onPress: () => void;
  /** When false, onPress is no-op; still show a11y state. */
  interactive: boolean;
  /** Lower opacity for out-of-month cells in month grid. */
  inRange?: boolean;
  /** If true, only the number is shown (week row has M–S headers above). */
  numberOnly?: boolean;
  /** Spoken / override for a11y when `numberOnly` (e.g. "January 15, 2026"). */
  accessibilityDate?: string;
  /** Reunion visit window includes this device-local calendar day. */
  reunionHighlight?: boolean;
};

function stateBackground(
  state: HabitDayDisplayState,
  theme: { colors: { surface: string; surfaceAlt: string; primary: string; border: string } },
): { bg: string; border: string } {
  if (state === 'satisfied') {
    return { bg: theme.colors.primary + '33', border: theme.colors.primary };
  }
  if (state === 'partial') {
    return { bg: theme.colors.primary + '18', border: theme.colors.border };
  }
  return { bg: theme.colors.surface, border: theme.colors.border };
}

function a11yLabel(
  dayLabel: string,
  dayNumber: number,
  state: HabitDayDisplayState,
  numberOnly: boolean,
  accessibilityDate: string | undefined,
  reunionHighlight: boolean,
): { label: string; checked: boolean } {
  const datePart = accessibilityDate ?? (numberOnly ? String(dayNumber) : `${dayLabel} ${dayNumber}`);
  const reunionSuffix = reunionHighlight ? ', reunion visit' : '';
  if (state === 'satisfied') {
    return { label: `${datePart}, done${reunionSuffix}`, checked: true };
  }
  if (state === 'partial') {
    return { label: `${datePart}, waiting for partner${reunionSuffix}`, checked: false };
  }
  return { label: `${datePart}, not done${reunionSuffix}`, checked: false };
}

export function HabitDayCell({
  dayLabel,
  dayNumber,
  state,
  onPress,
  interactive,
  inRange = true,
  numberOnly = false,
  accessibilityDate,
  reunionHighlight = false,
}: Props) {
  const theme = useTheme();
  const { bg, border } = stateBackground(state, theme);
  const a11y = a11yLabel(dayLabel, dayNumber, state, numberOnly, accessibilityDate, reunionHighlight);
  const borderColor = reunionHighlight ? theme.colors.success : border;
  const borderWidth = reunionHighlight ? 2 : 1;

  const size: ViewStyle = {
    minWidth: 40,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth,
    borderColor,
    backgroundColor: bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    opacity: inRange ? 1 : 0.35,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !interactive, checked: a11y.checked }}
      accessibilityLabel={a11y.label}
      onPress={interactive ? onPress : undefined}
      style={({ pressed }) => [size, pressed && interactive ? { opacity: 0.85 } : null]}
    >
      <View style={{ alignItems: 'center' }}>
        {numberOnly ? null : (
          <Text
            style={{
              ...typeBase.caption,
              color: theme.colors.textMuted,
              fontSize: 10,
              lineHeight: 12,
              marginBottom: 2,
            }}
          >
            {dayLabel}
          </Text>
        )}
        <Text
          style={{
            ...typeBase.body,
            color: theme.colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          {dayNumber}
        </Text>
      </View>
    </Pressable>
  );
}
