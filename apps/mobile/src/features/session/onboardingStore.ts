import { create } from 'zustand';

import {
  clearOnboardingAfterSignOut,
  loadOnboardingFlags,
  persistExplainerDone,
  persistProfileSetupDone,
  persistWelcomeSeen,
} from '@/features/session/onboardingStorage';

type OnboardingState = {
  isRehydrated: boolean;
  welcomeSeen: boolean;
  explainerDone: boolean;
  profileSetupDone: boolean;
  setWelcomeSeen: (v: boolean) => void;
  setExplainerDone: (v: boolean) => void;
  setProfileSetupDone: (v: boolean) => void;
  rehydrate: () => Promise<void>;
  resetForSignOut: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isRehydrated: false,
  welcomeSeen: false,
  explainerDone: false,
  profileSetupDone: false,
  setWelcomeSeen: (v) => {
    set({ welcomeSeen: v });
    void persistWelcomeSeen(v);
  },
  setExplainerDone: (v) => {
    set({ explainerDone: v });
    void persistExplainerDone(v);
  },
  setProfileSetupDone: (v) => {
    set({ profileSetupDone: v });
    void persistProfileSetupDone(v);
  },
  rehydrate: async () => {
    const flags = await loadOnboardingFlags();
    set({
      isRehydrated: true,
      ...flags,
    });
  },
  resetForSignOut: async () => {
    set({ explainerDone: false, profileSetupDone: false });
    await clearOnboardingAfterSignOut();
  },
}));
