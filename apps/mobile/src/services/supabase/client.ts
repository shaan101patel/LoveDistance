import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/services/supabase/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** In-memory storage for web static export / SSR where `window` is undefined. */
function createEphemeralAuthStorage() {
  const memory = new Map<string, string>();
  return {
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: async (key: string) => {
      memory.delete(key);
    },
  };
}

function getAuthStorage() {
  // `expo export -p web` runs Supabase auth init in Node; AsyncStorage's web
  // implementation reads `window` and throws ReferenceError during the build.
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    return createEphemeralAuthStorage();
  }
  return AsyncStorage;
}

export const supabaseClient =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: getAuthStorage(),
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;
