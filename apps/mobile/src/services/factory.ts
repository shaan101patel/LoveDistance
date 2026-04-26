import { mockServices } from '@/services/mock/mockServices';
import type { ServiceRegistry } from '@/services/ports';
import { supabaseServices } from '@/services/supabase/supabaseServices';

/**
 * Service registry: `EXPO_PUBLIC_API_MODE=supabase` uses Postgres + Storage + Edge-backed
 * [`supabaseServices`](./supabase/supabaseServices.ts); otherwise in-memory [`mockServices`](./mock/mockServices.ts).
 * There is no automatic migration of mock data into Supabase—switch env and re-pair / re-enter content as needed.
 *
 * Scheduled reminder pushes are not implemented yet (Track A): inbox rows are event-driven only
 * (e.g. partner photo notifications from DB triggers). A future outbox + cron or push provider can add scheduling.
 */
export function createServiceRegistry(): ServiceRegistry {
  const mode = process.env.EXPO_PUBLIC_API_MODE ?? 'mock';
  if (mode === 'supabase') {
    return supabaseServices;
  }
  return mockServices;
}
