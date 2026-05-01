import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import {
  COUPLES_PROMPT_LIBRARY,
  type CouplesPromptLibraryEntry,
} from '@/data/generatedCouplesPromptLibrary';
import { eligiblePromptEntries } from '@/components/promptTab/libraryRandom';
import { buildDiscoverBody } from '@/features/prompts/extraPromptReplyFormat';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Cat = { id: string; label: string };

type Props = {
  allowNsfw: boolean;
  onSend: (body: string) => void;
  sendPending: boolean;
};

function uniqueCategories(library: readonly CouplesPromptLibraryEntry[]): Cat[] {
  const map = new Map<string, string>();
  for (const e of library) {
    map.set(e.categoryId, e.categoryLabel);
  }
  return [...map.entries()].map(([id, label]) => ({ id, label }));
}

export function PromptDiscoverPanel({ allowNsfw, onSend, sendPending }: Props) {
  const theme = useTheme();
  const categories = useMemo(() => uniqueCategories(COUPLES_PROMPT_LIBRARY), []);
  const eligible = useMemo(() => eligiblePromptEntries(allowNsfw, COUPLES_PROMPT_LIBRARY), [allowNsfw]);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? '');
  const [selected, setSelected] = useState<CouplesPromptLibraryEntry | null>(null);
  const [answer, setAnswer] = useState('');

  const rows = useMemo(
    () => eligible.filter((e) => e.categoryId === categoryId),
    [categoryId, eligible],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        chipScroll: { marginBottom: spacing.md },
        chip: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.pill,
          borderWidth: 1,
          marginRight: spacing.sm,
        },
        chipText: { ...theme.type.caption, fontWeight: '600' as const },
        row: {
          paddingVertical: spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        },
        rowText: { ...theme.type.body, color: theme.colors.textPrimary },
        preview: { ...theme.type.bodySm, color: theme.colors.textSecondary, marginTop: spacing.sm },
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {categories.map((c) => {
          const on = c.id === categoryId;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[
                styles.chip,
                {
                  borderColor: on ? theme.colors.primary : theme.colors.border,
                  backgroundColor: on ? theme.colors.surfaceAlt : theme.colors.surface,
                },
              ]}
              onPress={() => {
                setCategoryId(c.id);
                setSelected(null);
                setAnswer('');
              }}
            >
              <Text style={[styles.chipText, { color: on ? theme.colors.primary : theme.colors.textPrimary }]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={rows}
        keyExtractor={(item) => `${item.categoryId}-${item.promptNum}`}
        ListEmptyComponent={<Text style={styles.preview}>No prompts in this filter.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => {
              setSelected(item);
              setAnswer('');
            }}
          >
            <Text style={styles.rowText}>{item.text}</Text>
          </Pressable>
        )}
        scrollEnabled={rows.length > 6}
        style={{ maxHeight: 220 }}
      />

      {selected ? (
        <View style={{ marginTop: spacing.md }}>
          <Text style={styles.preview}>Selected</Text>
          <Text style={styles.rowText}>{selected.text}</Text>
          <TextInput
            accessibilityLabel="Optional message with discover prompt"
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
                onSend(buildDiscoverBody(selected.categoryLabel, selected.text, answer));
                setSelected(null);
                setAnswer('');
              }}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
