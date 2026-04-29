import { mockServices } from '@/services/mock/mockServices';
import type { ServiceRegistry } from '@/services/ports';
import { supabaseServices } from '@/services/supabase/supabaseServices';

/**
 * Service registry: `EXPO_PUBLIC_API_MODE=supabase` uses Postgres + Storage + Edge-backed
 * [`supabaseServices`](./supabase/supabaseServices.ts); otherwise in-memory [`mockServices`](./mock/mockServices.ts).
 * There is no automatic migration of mock data into Supabase—switch env and re-pair / re-enter content as needed.
 *
 * Inbox rows come from DB triggers (photo, prompt, reactions, milestones) plus `run_notification_digest_job`
 * (schedule via Supabase Edge `notification-digest` or pg_cron). Expo push dispatch is optional (`dispatch-expo-push`).
 */
export function createServiceRegistry(): ServiceRegistry {
  const mode = process.env.EXPO_PUBLIC_API_MODE ?? 'mock';
  if (mode === 'supabase') {
    return supabaseServices;
  }
  return mockServices;
}
