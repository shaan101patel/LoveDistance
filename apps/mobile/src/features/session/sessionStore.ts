import { create } from 'zustand';

type SessionState = {
  isHydrated: boolean;
  isSignedIn: boolean;
  isPaired: boolean;
  returnPath: string | null;
  setHydrated: (value: boolean) => void;
  setSignedIn: (value: boolean) => void;
  setPaired: (value: boolean) => void;
  setReturnPath: (value: string | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  isHydrated: false,
  isSignedIn: false,
  isPaired: false,
  returnPath: null,
  setHydrated: (value) => set({ isHydrated: value }),
  setSignedIn: (value) => set({ isSignedIn: value }),
  setPaired: (value) => set({ isPaired: value }),
  setReturnPath: (value) => set({ returnPath: value }),
}));
