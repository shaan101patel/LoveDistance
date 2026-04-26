import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Share, Text, View } from 'react-native';

import { Button } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useSessionStore } from '@/features/session/sessionStore';
import { isSupabaseApiMode, pairingScreenCopy } from '@/services/apiMode';
import { useServices } from '@/services/ServiceContext';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type Phase = 'idle' | 'loading' | 'ready' | 'error';

export default function CreateInviteScreen() {
  const theme = useTheme();
  const live = isSupabaseApiMode();
  const services = useServices();
  const isPaired = useSessionStore((s) => s.isPaired);
  const [phase, setPhase] = useState<Phase>('idle');
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');

  if (isPaired) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  async function onCreate() {
    setMessage('');
    setLink('');
    setPhase('loading');
    try {
      const url = await services.couple.createInviteLink();
      setLink(url);
      setPhase('ready');
    } catch (e) {
      setPhase('error');
      setMessage(e instanceof Error ? e.message : 'Could not create an invite');
    }
  }

  async function onShare() {
    if (!link) {
      return;
    }
    try {
      await Share.share({ message: link, url: link, title: 'Join me on LoveDistance' });
    } catch {
      // User dismissed share sheet — ignore
    }
  }

  return (
    <SectionScaffold
      kicker="Invite"
      lead={pairingScreenCopy.createInviteLead(live)}
      title="Create an invite"
    >
      {phase === 'error' && message ? (
        <Text style={{ color: theme.colors.danger, marginBottom: spacing.sm }}>{message}</Text>
      ) : null}

      {phase === 'loading' ? (
        <SectionCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Body>{pairingScreenCopy.createInviteLoadingBody(live)}</Body>
          </View>
        </SectionCard>
      ) : null}

      {phase === 'ready' && link ? (
        <SectionCard>
          <Body>
            Your invite is ready. Share it safely—only the person you trust should have it.
          </Body>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
            }}
          >
            <Text selectable style={{ color: theme.colors.textPrimary, fontSize: 15 }}>
              {link}
            </Text>
          </View>
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <Button label="Share link" onPress={onShare} />
            <Button label="Create another" onPress={onCreate} variant="secondary" />
          </View>
        </SectionCard>
      ) : phase === 'loading' ? null : (
        <SectionCard>
          <Button label="Generate invite link" onPress={onCreate} />
        </SectionCard>
      )}

      <View style={{ marginTop: spacing.lg }}>
        <Button label="Back" onPress={() => router.back()} variant="ghost" />
      </View>
    </SectionScaffold>
  );
}
