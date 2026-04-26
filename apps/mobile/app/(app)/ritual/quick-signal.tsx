import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body } from '@/components/ui';
import { useCurrentUserId, useLogRitualSignal, useRitualSignals } from '@/features/hooks';
import type { RitualSignalKind } from '@/types/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typeBase } from '@/theme/tokens';

function parseKind(raw: string | string[] | undefined): RitualSignalKind | null {
  if (raw == null) return null;
  const v = typeof raw === 'string' ? raw : raw[0];
  if (v === 'good_night' || v === 'miss_you') return v;
  return null;
}

export default function QuickSignalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { kind: kindParam } = useLocalSearchParams<{ kind?: string | string[] }>();
  const kind = parseKind(kindParam);
  const [body, setBody] = useState('');
  const log = useLogRitualSignal();
  const { data: recent } = useRitualSignals(5);
  const { meId } = useCurrentUserId();

  const lastMine = useMemo(() => {
    if (!meId || !recent?.length) return undefined;
    return recent.find((r) => r.authorId === meId);
  }, [meId, recent]);

  const title = kind === 'good_night' ? 'Good night note' : kind === 'miss_you' ? 'Miss-you check-in' : 'Quick signal';
  const lead =
    kind === 'good_night'
      ? 'A short line your partner can read when they wake up. Saved in mock data only—no push yet.'
      : kind === 'miss_you'
        ? 'Tell them you are thinking of them. Mock-only log for now.'
        : 'Pick a valid ritual from Home.';

  if (!kind) {
    return (
      <SectionScaffold kicker="Rituals" title="Quick signal" lead={lead} scrollable>
        <Body>Use Home quick rituals to open this screen with a kind.</Body>
        <Button label="Back" onPress={() => router.back()} />
      </SectionScaffold>
    );
  }

  return (
    <SectionScaffold kicker="Rituals" title={title} lead={lead} scrollable>
      {lastMine ? (
        <View style={{ marginBottom: spacing.sm }}>
          <Body>
            Last you sent ({lastMine.kind.replace('_', ' ')}): “
            {lastMine.body.length > 80 ? `${lastMine.body.slice(0, 77)}…` : lastMine.body}”
          </Body>
        </View>
      ) : null}

      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={kind === 'good_night' ? 'Sleep well, thinking of you…' : 'Miss you—here is a tiny update…'}
        placeholderTextColor={theme.colors.textMuted}
        multiline
        style={{
          minHeight: 120,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 12,
          padding: spacing.md,
          ...typeBase.body,
          color: theme.colors.textPrimary,
          textAlignVertical: 'top',
        }}
      />

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Button
          label={log.isPending ? 'Sending…' : 'Send'}
          disabled={log.isPending || !body.trim()}
          onPress={() => {
            log.mutate(
              { kind, body },
              {
                onSuccess: () => router.back(),
              },
            );
          }}
        />
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </SectionScaffold>
  );
}
