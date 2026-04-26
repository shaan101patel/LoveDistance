import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  welcomeSeen: 'ld_welcome_seen',
  explainerDone: 'ld_onboarding_explainer_done',
  profileSetupDone: 'ld_profile_setup_done',
  onboardingVersion: 'ld_onboarding_version',
} as const;

export const ONBOARDING_VERSION = 1;

export async function setOnboardingVersion() {
  await AsyncStorage.setItem(KEYS.onboardingVersion, String(ONBOARDING_VERSION));
}

export async function loadOnboardingFlags() {
  const [welcomeSeen, explainerDone, profileSetupDone, versionStr] = await Promise.all([
    AsyncStorage.getItem(KEYS.welcomeSeen),
    AsyncStorage.getItem(KEYS.explainerDone),
    AsyncStorage.getItem(KEYS.profileSetupDone),
    AsyncStorage.getItem(KEYS.onboardingVersion),
  ]);
  const version = versionStr ? Number.parseInt(versionStr, 10) : 0;
  const resetByVersion = version < ONBOARDING_VERSION;
  if (resetByVersion) {
    await setOnboardingVersion();
  }
  return {
    welcomeSeen: welcomeSeen === '1',
    explainerDone: !resetByVersion && explainerDone === '1',
    profileSetupDone: !resetByVersion && profileSetupDone === '1',
  };
}

export async function persistWelcomeSeen(value: boolean) {
  await AsyncStorage.setItem(KEYS.welcomeSeen, value ? '1' : '0');
}

export async function persistExplainerDone(value: boolean) {
  await AsyncStorage.setItem(KEYS.explainerDone, value ? '1' : '0');
}

export async function persistProfileSetupDone(value: boolean) {
  await AsyncStorage.setItem(KEYS.profileSetupDone, value ? '1' : '0');
}

/** After sign out: re-show explainer + profile for next account. Keep welcome seen so returning users go to sign-in. */
export async function clearOnboardingAfterSignOut() {
  await Promise.all([
    AsyncStorage.setItem(KEYS.explainerDone, '0'),
    AsyncStorage.setItem(KEYS.profileSetupDone, '0'),
  ]);
}
