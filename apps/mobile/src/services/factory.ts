import { mockServices } from '@/services/mock/mockServices';
import type { ServiceRegistry } from '@/services/ports';
import { supabaseServices } from '@/services/supabase/supabaseServices';

export function createServiceRegistry(): ServiceRegistry {
  const mode = process.env.EXPO_PUBLIC_API_MODE ?? 'mock';
  if (mode === 'supabase') {
    return supabaseServices;
  }
  return mockServices;
}
