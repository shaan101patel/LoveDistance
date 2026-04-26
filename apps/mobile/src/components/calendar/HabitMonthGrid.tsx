import { Text, View } from 'react-native';

import type { Habit } from '@/types/domain';
import type { HabitContextIds } from '@/features/habits/habitPolicy';
import { getHabitDayDisplayState } from '@/features/habits/habitDisplayState';
import { HabitDayCell } from '@/components/calendar/HabitDayCell';
import type { MonthGridCell } from '@/lib/calendarDates';
import { WEEKDAY_LABELS_MON_FIRST } from '@/lib/calendarDates';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typeBase } from '@/theme/tokens';

type Props = {
  cells: MonthGridCell[];
  habit: Habit;
  ctx: HabitContextIds;
  onDayPress: (ymd: string) => void;
  dayInteractive: (ymd: string) => boolean;
  dayMeta: (ymd: string) => { dayNum: number; a11yDate: string };
};

export function HabitMonthGrid({ cells, habit, ctx, onDayPress, dayInteractive, dayMeta }: Props) {
  const theme = useTheme();
  const rows: MonthGridCell[][] = [];
  for (let r = 0; r < 6; r += 1) {
    rows.push(cells.slice(r * 7, r * 7 + 7));
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
        {WEEKDAY_LABELS_MON_FIRST.map((l) => (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ ...typeBase.caption, color: theme.colors.textMuted, fontSize: 11 }}>{l}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={`row-${ri}`} style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
          {row.map((cell) => {
            const { dayNum, a11yDate } = dayMeta(cell.ymd);
            const state = getHabitDayDisplayState(habit, cell.ymd, ctx);
            const inRange = cell.inCurrentMonth;
            return (
              <View key={cell.key} style={{ flex: 1, alignItems: 'center' }}>
                <HabitDayCell
                  dayLabel=""
                  dayNumber={dayNum}
                  numberOnly
                  accessibilityDate={a11yDate}
                  state={state}
                  interactive={inRange && dayInteractive(cell.ymd)}
                  inRange={inRange}
                  onPress={() => onDayPress(cell.ymd)}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
