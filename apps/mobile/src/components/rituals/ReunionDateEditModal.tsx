import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/primitives';
import {
  calendarDateForReunionPicker,
  formatYmdInTimeZone,
  reunionEndOfDayIsoFromYmdInZone,
  reunionIsoFromYmdInZone,
} from '@/features/rituals/ritualTimePresentation';
import { formatYmdLocal, parseYmdLocal } from '@/lib/calendarDates';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

export type ReunionWindowSavePayload = {
  reunionDate: string;
  reunionEndDate: string;
};

function defaultStartCalendarDate(homeTimeZone: string): Date {
  const todayYmd = formatYmdInTimeZone(new Date(), homeTimeZone);
  const base = parseYmdLocal(todayYmd);
  if (!base) {
    return new Date();
  }
  base.setDate(base.getDate() + 14);
  return base;
}

function defaultEndFromStart(start: Date): Date {
  const t = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  t.setDate(t.getDate() + 3);
  return t;
}

function ymdFaceFromPickerDate(d: Date): string {
  return formatYmdLocal(d);
}

function localYmdOnOrAfter(a: Date, b: Date): boolean {
  return ymdFaceFromPickerDate(a) >= ymdFaceFromPickerDate(b);
}

type AndroidPickerTarget = 'start' | 'end';

type Props = {
  visible: boolean;
  homeTimeZone: string;
  initialReunionIso?: string;
  initialReunionEndIso?: string;
  canClear: boolean;
  onClose: () => void;
  onSave: (payload: ReunionWindowSavePayload) => Promise<void>;
  onClear?: () => Promise<void>;
  isSubmitting: boolean;
  errorText: string | null;
};

export function ReunionDateEditModal({
  visible,
  homeTimeZone,
  initialReunionIso,
  initialReunionEndIso,
  canClear,
  onClose,
  onSave,
  onClear,
  isSubmitting,
  errorText,
}: Props) {
  const theme = useTheme();
  const [draftStart, setDraftStart] = useState(() => defaultStartCalendarDate(homeTimeZone));
  const [draftEnd, setDraftEnd] = useState(() =>
    defaultEndFromStart(defaultStartCalendarDate(homeTimeZone)),
  );
  const [webYmdStart, setWebYmdStart] = useState(() =>
    formatYmdLocal(defaultStartCalendarDate(homeTimeZone)),
  );
  const [webYmdEnd, setWebYmdEnd] = useState(() =>
    formatYmdLocal(defaultEndFromStart(defaultStartCalendarDate(homeTimeZone))),
  );
  const [androidPicker, setAndroidPicker] = useState<AndroidPickerTarget | null>(null);
  const [webParseError, setWebParseError] = useState<string | null>(null);

  const resetDraft = useCallback(() => {
    const start = initialReunionIso
      ? calendarDateForReunionPicker(initialReunionIso, homeTimeZone)
      : defaultStartCalendarDate(homeTimeZone);
    const end = initialReunionEndIso
      ? calendarDateForReunionPicker(initialReunionEndIso, homeTimeZone)
      : initialReunionIso
        ? calendarDateForReunionPicker(initialReunionEndIso ?? initialReunionIso, homeTimeZone)
        : defaultEndFromStart(start);
    const endAdjusted = localYmdOnOrAfter(end, start) ? end : start;
    setDraftStart(start);
    setDraftEnd(endAdjusted);
    setWebYmdStart(formatYmdLocal(start));
    setWebYmdEnd(formatYmdLocal(endAdjusted));
  }, [initialReunionIso, initialReunionEndIso, homeTimeZone]);

  useEffect(() => {
    if (visible) {
      resetDraft();
      setAndroidPicker(null);
      setWebParseError(null);
    }
  }, [visible, resetDraft]);

  const persistNative = async () => {
    if (!localYmdOnOrAfter(draftEnd, draftStart)) {
      setWebParseError('End date must be on or after the start date.');
      return;
    }
    setWebParseError(null);
    const startYmd = ymdFaceFromPickerDate(draftStart);
    const endYmd = ymdFaceFromPickerDate(draftEnd);
    await onSave({
      reunionDate: reunionIsoFromYmdInZone(startYmd, homeTimeZone),
      reunionEndDate: reunionEndOfDayIsoFromYmdInZone(endYmd, homeTimeZone),
    });
  };

  const persistWeb = async () => {
    const start = parseYmdLocal(webYmdStart);
    const end = parseYmdLocal(webYmdEnd);
    if (!start || !end) {
      setWebParseError('Use valid YYYY-MM-DD for both dates.');
      return;
    }
    if (!localYmdOnOrAfter(end, start)) {
      setWebParseError('End date must be on or after the start date.');
      return;
    }
    setWebParseError(null);
    await onSave({
      reunionDate: reunionIsoFromYmdInZone(webYmdStart.trim(), homeTimeZone),
      reunionEndDate: reunionEndOfDayIsoFromYmdInZone(webYmdEnd.trim(), homeTimeZone),
    });
  };

  const handleAndroidChange = (target: AndroidPickerTarget) => (event: DateTimePickerEvent, date?: Date) => {
    setAndroidPicker(null);
    if (event.type === 'set' && date) {
      if (target === 'start') {
        setDraftStart(date);
        setDraftEnd((prev) => (localYmdOnOrAfter(prev, date) ? prev : date));
      } else {
        setDraftEnd(date);
      }
    }
  };

  if (!visible) {
    return null;
  }

  const save = Platform.OS === 'web' ? persistWeb : persistNative;

  const card = {
    backgroundColor: theme.colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 400,
    width: '100%' as const,
  };

  const dateLine = (d: Date) =>
    d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const iosPickers = (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>Visit starts</Text>
        <DateTimePicker
          value={draftStart}
          mode="date"
          display="spinner"
          themeVariant={theme.scheme === 'dark' ? 'dark' : 'light'}
          onChange={(_e, date) => {
            if (!date) return;
            setDraftStart(date);
            setDraftEnd((prev) => (localYmdOnOrAfter(prev, date) ? prev : date));
          }}
        />
      </View>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>Visit ends</Text>
        <DateTimePicker
          value={draftEnd}
          mode="date"
          display="spinner"
          themeVariant={theme.scheme === 'dark' ? 'dark' : 'light'}
          onChange={(_e, date) => {
            if (!date) return;
            setDraftEnd(localYmdOnOrAfter(date, draftStart) ? date : draftStart);
          }}
        />
      </View>
    </View>
  );

  const androidPickers = (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>Visit starts</Text>
        <Text style={{ ...typeBase.body, color: theme.colors.textPrimary }}>{dateLine(draftStart)}</Text>
        <Button
          label="Choose start date"
          variant="secondary"
          disabled={isSubmitting}
          onPress={() => setAndroidPicker('start')}
        />
      </View>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>Visit ends</Text>
        <Text style={{ ...typeBase.body, color: theme.colors.textPrimary }}>{dateLine(draftEnd)}</Text>
        <Button
          label="Choose end date"
          variant="secondary"
          disabled={isSubmitting}
          onPress={() => setAndroidPicker('end')}
        />
      </View>
      {androidPicker === 'start' ? (
        <DateTimePicker
          value={draftStart}
          mode="date"
          display="default"
          onChange={handleAndroidChange('start')}
        />
      ) : null}
      {androidPicker === 'end' ? (
        <DateTimePicker
          value={draftEnd}
          mode="date"
          display="default"
          onChange={handleAndroidChange('end')}
        />
      ) : null}
    </View>
  );

  const webFields = (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>Visit starts (YYYY-MM-DD)</Text>
        <TextInput
          value={webYmdStart}
          onChangeText={setWebYmdStart}
          placeholder="2026-06-10"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            color: theme.colors.textPrimary,
            fontSize: 16,
          }}
        />
      </View>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typeBase.caption, color: theme.colors.textMuted }}>Visit ends (YYYY-MM-DD)</Text>
        <TextInput
          value={webYmdEnd}
          onChangeText={setWebYmdEnd}
          placeholder="2026-06-15"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            color: theme.colors.textPrimary,
            fontSize: 16,
          }}
        />
      </View>
    </View>
  );

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
          onPress={onClose}
        />
        <View pointerEvents="box-none" style={[styles.sheetWrap, { padding: spacing.lg }]}>
          <View style={card}>
            <Text style={{ ...typeBase.h2, color: theme.colors.textPrimary }}>Reunion dates</Text>
            <Text style={{ ...typeBase.bodySm, color: theme.colors.textSecondary }}>
              Countdown uses the start date; together-time uses through the end date. Calendar days use your
              profile time zone ({homeTimeZone}).
            </Text>

            {Platform.OS === 'web' ? webFields : Platform.OS === 'android' ? androidPickers : iosPickers}

            {errorText || webParseError ? (
              <Text style={{ ...typeBase.bodySm, color: theme.colors.danger }}>
                {errorText ?? webParseError}
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
              <Button label="Cancel" variant="ghost" disabled={isSubmitting} onPress={onClose} />
              {canClear && onClear ? (
                <Button
                  label="Clear"
                  variant="ghost"
                  disabled={isSubmitting}
                  onPress={() => {
                    void onClear();
                  }}
                />
              ) : null}
              <Button
                label="Save"
                disabled={isSubmitting}
                onPress={() => {
                  void save();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
