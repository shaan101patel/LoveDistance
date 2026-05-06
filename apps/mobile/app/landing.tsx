import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/primitives';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, Heading, SectionCard } from '@/components/ui';
import { isValidWaitlistEmail, submitWaitlistEmail } from '@/lib/waitlist';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function LandingScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  async function onJoinWaitlist() {
    setFormError('');
    setDoneMessage(null);
    if (!isValidWaitlistEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitWaitlistEmail(email);
      if (result === 'unconfigured') {
        setFormError('Waitlist is not available in this build (Supabase is not configured).');
        return;
      }
      if (result === 'duplicate') {
        setDoneMessage('You are already on the list—we will be in touch.');
        return;
      }
      setDoneMessage('You are on the list. Thank you!');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SectionScaffold
      kicker="LoveDistance"
      title="Stay close, even at a distance"
      lead="For best friends or couples who want one place to share photos, explore conversation prompts, and keep small rituals together—so miles apart still feels connected."
    >
      <View style={{ gap: spacing.md }}>
        <Body>
          LoveDistance is in active development. Join the waitlist to hear when we open wider access
          or ship major updates.
        </Body>
      </View>

      <SectionCard>
        <Heading>What you can look forward to</Heading>
        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          <Body>• Shared photos and a timeline of moments you both add to.</Body>
          <Body>• Daily-style prompts and threads so you always have something meaningful to talk about.</Body>
          <Body>• Habits and light rituals—nudges that help you show up for each other from far away.</Body>
        </View>
      </SectionCard>

      <SectionCard>
        <Heading>Join the waitlist</Heading>
        <Body>We will only use your email to reach you about LoveDistance.</Body>
        {!isSupabaseConfigured ? (
          <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.xs, fontSize: 14 }}>
            The waitlist requires Supabase URL and anon key in this environment.
          </Text>
        ) : null}
        {doneMessage ? (
          <Text style={{ color: theme.colors.primary, marginTop: spacing.sm, fontWeight: '600' }}>
            {doneMessage}
          </Text>
        ) : null}
        {formError ? (
          <Text style={{ color: theme.colors.danger, marginTop: spacing.sm }}>{formError}</Text>
        ) : null}
        {!doneMessage ? (
          <>
            <Input
              accessibilityLabel="Email for waitlist"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@email.com"
              value={email}
            />
            <View style={{ marginTop: spacing.sm }}>
              <Button
                disabled={submitting}
                label={submitting ? 'Joining…' : 'Join waitlist'}
                onPress={onJoinWaitlist}
              />
            </View>
          </>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Body>Already exploring the app?</Body>
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Button label="Get started" onPress={() => router.push('/(auth)/sign-up')} />
          <Button
            label="I have an account"
            onPress={() => router.push('/(auth)/sign-in')}
            variant="ghost"
          />
        </View>
      </SectionCard>
    </SectionScaffold>
  );
}
