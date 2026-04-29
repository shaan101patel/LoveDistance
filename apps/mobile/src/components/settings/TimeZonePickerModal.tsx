import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/primitives';
import { listTimeZoneOptions } from '@/lib/timeZoneOptions';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typeBase } from '@/theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (ianaId: string) => void;
};

export function TimeZonePickerModal({ visible, onClose, onSelect }: Props) {
  const theme = useTheme();
  const allZones = useMemo(() => listTimeZoneOptions(), []);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return allZones;
    return allZones.filter((z) => z.toLowerCase().includes(needle));
  }, [allZones, q]);

  useEffect(() => {
    if (visible) {
      setQ('');
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
          onPress={onClose}
        />
        <View
          pointerEvents="box-none"
          style={[styles.sheetWrap, { padding: spacing.lg, alignItems: 'center' }]}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: radius.lg,
              padding: spacing.lg,
              gap: spacing.md,
              maxWidth: 440,
              width: '100%' as const,
              maxHeight: '80%',
            }}
          >
            <Text style={{ ...typeBase.h2, color: theme.colors.textPrimary }}>Time zone</Text>
            <TextInput
              accessibilityLabel="Search time zones"
              placeholder="Search (e.g. Tokyo)"
              placeholderTextColor={theme.colors.textMuted}
              value={q}
              onChangeText={setQ}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                color: theme.colors.textPrimary,
                fontSize: 16,
              }}
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              initialNumToRender={20}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onSelect(item);
                    setQ('');
                    onClose();
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: spacing.sm,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ ...typeBase.body, color: theme.colors.textPrimary }}>{item}</Text>
                </Pressable>
              )}
            />
            <Button label="Cancel" variant="ghost" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
});
