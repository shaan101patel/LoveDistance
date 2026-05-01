import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COUPLES_PROMPT_LIBRARY } from '@/data/generatedCouplesPromptLibrary';
import { useAddThreadReply } from '@/features/hooks';
import { PromptDiscoverPanel } from '@/components/promptTab/PromptDiscoverPanel';
import { PromptNotePanel } from '@/components/promptTab/PromptNotePanel';
import { PromptQuestionSwipeDeck } from '@/components/promptTab/PromptQuestionSwipeDeck';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

export type PromptTabExtraMode = 'question' | 'note' | 'discover';

type Props = {
  promptId: string;
  allowNsfw: boolean;
};

export function PromptTabExtraModes({ promptId, allowNsfw }: Props) {
  const theme = useTheme();
  const [mode, setMode] = useState<PromptTabExtraMode>('question');
  const addReply = useAddThreadReply();

  const onSend = (body: string) => {
    addReply.mutate({ promptId, body, parentReplyId: null });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
        tab: {
          flex: 1,
          minHeight: 48,
          borderRadius: radius.lg,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.xs,
        },
        tabLabel: { ...theme.type.caption, fontWeight: '700' as const, textAlign: 'center' as const },
        panel: { marginTop: spacing.lg },
      }),
    [theme],
  );

  const TabBtn = ({
    m,
    label,
  }: {
    m: PromptTabExtraMode;
    label: string;
  }) => {
    const on = mode === m;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        style={[
          styles.tab,
          {
            borderColor: on ? theme.colors.primary : theme.colors.border,
            backgroundColor: on ? theme.colors.surfaceAlt : theme.colors.surface,
          },
        ]}
        onPress={() => setMode(m)}
      >
        <Text style={[styles.tabLabel, { color: on ? theme.colors.primary : theme.colors.textPrimary }]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View>
      <View style={styles.row}>
        <TabBtn m="question" label="Question" />
        <TabBtn m="note" label="Note" />
        <TabBtn m="discover" label="Discover" />
      </View>
      <View style={styles.panel}>
        {mode === 'question' ? (
          <PromptQuestionSwipeDeck
            key={allowNsfw ? 'nsfw-on' : 'nsfw-off'}
            allowNsfw={allowNsfw}
            library={COUPLES_PROMPT_LIBRARY}
            sendPending={addReply.isPending}
            onSend={onSend}
          />
        ) : null}
        {mode === 'note' ? <PromptNotePanel sendPending={addReply.isPending} onSend={onSend} /> : null}
        {mode === 'discover' ? (
          <PromptDiscoverPanel
            key={allowNsfw ? 'discover-on' : 'discover-off'}
            allowNsfw={allowNsfw}
            sendPending={addReply.isPending}
            onSend={onSend}
          />
        ) : null}
      </View>
    </View>
  );
}
