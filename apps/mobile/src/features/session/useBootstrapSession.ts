import { useEffect } from 'react';

import { useOnboardingStore } from '@/features/session/onboardingStore';
import { useSessionStore } from '@/features/session/sessionStore';
import { useServices } from '@/services/ServiceContext';

export function useBootstrapSession() {
  const services = useServices();
  const setHydrated = useSessionStore((state) => state.setHydrated);
  const setSignedIn = useSessionStore((state) => state.setSignedIn);
  const setPaired = useSessionStore((state) => state.setPaired);
  const rehydrateOnboarding = useOnboardingStore((state) => state.rehydrate);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await rehydrateOnboarding();
      const [session, couple] = await Promise.all([
        services.auth.getSession(),
        services.couple.getCouple(),
      ]);
      if (cancelled) {
        return;
      }
      setSignedIn(Boolean(session));
      setPaired(Boolean(couple));
      setHydrated(true);
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [rehydrateOnboarding, services.auth, services.couple, setHydrated, setPaired, setSignedIn]);
}
