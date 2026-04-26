import { useEffect } from 'react';

import { useServices } from '@/services/ServiceContext';
import { useSessionStore } from '@/features/session/sessionStore';

export function useBootstrapSession() {
  const services = useServices();
  const setHydrated = useSessionStore((state) => state.setHydrated);
  const setSignedIn = useSessionStore((state) => state.setSignedIn);
  const setPaired = useSessionStore((state) => state.setPaired);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const session = await services.auth.getSession();
      const couple = await services.couple.getCouple();
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
  }, [services.auth, services.couple, setHydrated, setPaired, setSignedIn]);
}
