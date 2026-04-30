import { View } from 'react-native';

import { SettingsToggleRow } from '@/components/settings';
import { SectionScaffold } from '@/components/section/SectionScaffold';
import { Body, SectionCard } from '@/components/ui';
import { useAppLock } from '@/features/hooks';
import { isSupabaseApiMode, securityScreenCopy } from '@/services/apiMode';
import { spacing } from '@/theme/tokens';

export default function SettingsSecurityScreen() {
  const live = isSupabaseApiMode();
  const { query, mutation } = useAppLock();
  const lock = query.data;
  const biometricOk = Boolean(lock?.requirePasscode);

  return (
    <SectionScaffold
      kicker="Device"
      lead={securityScreenCopy.scaffoldLead(live)}
      title="App lock"
    >
      {query.isLoading ? <Body>Loading…</Body> : null}
      {query.isError ? <Body>Could not load app lock settings.</Body> : null}
      {lock ? (
        <>
          <SectionCard>
            <View style={{ gap: spacing.lg }}>
              <SettingsToggleRow
                description={securityScreenCopy.passcodeRowDescription(live)}
                label="Require passcode"
                onValueChange={(v) => mutation.mutate({ requirePasscode: v })}
                value={lock.requirePasscode}
              />
              <SettingsToggleRow
                description={
                  lock.requirePasscode
                    ? securityScreenCopy.biometricRowDescriptionWhenPasscodeOn(live)
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
            <Body>{securityScreenCopy.passcodeStatusLine(live, lock.isPasscodeSet)}</Body>
          </SectionCard>
        </>
      ) : null}
    </SectionScaffold>
  );
}
