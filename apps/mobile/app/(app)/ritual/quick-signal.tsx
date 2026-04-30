import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body } from '@/components/ui';
import { useCurrentUserId, useLogRitualSignal, useRitualSignals } from '@/features/hooks';
import { isSupabaseApiMode, quickSignalScreenCopy } from '@/services/apiMode';
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
  const live = isSupabaseApiMode();
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
      ? quickSignalScreenCopy.goodNightLead(live)
      : kind === 'miss_you'
        ? quickSignalScreenCopy.missYouLead(live)
        : 'This screen needs a ritual type in the link (good_night or miss_you).';

  if (!kind) {
    return (
      <SectionScaffold kicker="Rituals" title="Quick signal" lead={lead} scrollable>
        <Body>Open this screen with ?kind=good_night or ?kind=miss_you in the URL.</Body>
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
