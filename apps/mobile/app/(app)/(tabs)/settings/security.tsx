import { View } from 'react-native';

import { SettingsToggleRow } from '@/components/settings';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useAppLock } from '@/features/hooks';
import { spacing } from '@/theme/tokens';

export default function SettingsSecurityScreen() {
  const { query, mutation } = useAppLock();
  const lock = query.data;
  const biometricOk = Boolean(lock?.requirePasscode);

  return (
    <SectionScaffold
      kicker="Device"
      lead="Expo + native Keychain and LocalAuthentication will plug in here. For now, toggles only update mock state."
      title="App lock"
    >
      {query.isLoading ? <Body>Loading…</Body> : null}
      {query.isError ? <Body>Could not load app lock settings.</Body> : null}
      {lock ? (
        <>
          <SectionCard>
            <View style={{ gap: spacing.lg }}>
              <SettingsToggleRow
                description="Mock: we mark a passcode as 'set' without storing digits. Turning this off clears Face ID / Touch ID in mock mode."
                label="Require passcode"
                onValueChange={(v) => mutation.mutate({ requirePasscode: v })}
                value={lock.requirePasscode}
              />
              <SettingsToggleRow
                description={
                  lock.requirePasscode
                    ? 'Mock only — your device will use real biometrics in the production app.'
                    : 'Turn on passcode first to enable biometrics (standard pattern).'
                }
                disabled={!lock.requirePasscode}
                label="Face ID / Touch ID"
                onValueChange={(v) => mutation.mutate({ useBiometric: v })}
                value={lock.useBiometric && biometricOk}
              />
            </View>
          </SectionCard>
          <SectionCard>
            <Body>Passcode status (mock): {lock.isPasscodeSet ? 'set' : 'not set'}</Body>
          </SectionCard>
        </>
      ) : null}
    </SectionScaffold>
  );
}
