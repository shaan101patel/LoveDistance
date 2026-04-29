import { Text, View } from 'react-native';

import type { Habit } from '@/types/domain';
import type { HabitContextIds } from '@/features/habits/habitPolicy';
import { getHabitDayDisplayState } from '@/features/habits/habitDisplayState';
import { HabitDayCell } from '@/components/calendar/HabitDayCell';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typeBase } from '@/theme/tokens';

const HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type Props = {
  /** Mon → Sun, YYYY-MM-DD */
  ymds: string[];
  habit: Habit;
  ctx: HabitContextIds;
  onDayPress: (ymd: string) => void;
  dayInteractive: (ymd: string) => boolean;
  dayMeta: (ymd: string) => { dayNum: number; a11yDate: string };
  isReunionDay: (ymd: string) => boolean;
};

export function HabitWeekStrip({ ymds, habit, ctx, onDayPress, dayInteractive, dayMeta, isReunionDay }: Props) {
  const theme = useTheme();

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          marginBottom: spacing.sm,
        }}
      >
        {ymds.map((ymd, i) => (
          <View key={`h-${ymd}`} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ ...typeBase.caption, color: theme.colors.textMuted, fontSize: 11 }}>
              {HEADER[i]}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {ymds.map((ymd) => {
          const { dayNum, a11yDate } = dayMeta(ymd);
          const state = getHabitDayDisplayState(habit, ymd, ctx);
          return (
            <View key={ymd} style={{ flex: 1, alignItems: 'center' }}>
              <HabitDayCell
                dayLabel=""
                dayNumber={dayNum}
                numberOnly
                accessibilityDate={a11yDate}
                state={state}
                interactive={dayInteractive(ymd)}
                reunionHighlight={isReunionDay(ymd)}
                onPress={() => onDayPress(ymd)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
