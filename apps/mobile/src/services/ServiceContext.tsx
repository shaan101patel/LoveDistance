import { PropsWithChildren, createContext, useContext, useMemo } from 'react';

import { createServiceRegistry } from '@/services/factory';
import type { ServiceRegistry } from '@/services/ports';

const ServiceContext = createContext<ServiceRegistry | null>(null);

export function ServiceProvider({ children }: PropsWithChildren) {
  const services = useMemo(() => createServiceRegistry(), []);
  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}

export function useServices(): ServiceRegistry {
  const services = useContext(ServiceContext);
  if (!services) {
    throw new Error('useServices must be called inside ServiceProvider.');
  }
  return services;
}
