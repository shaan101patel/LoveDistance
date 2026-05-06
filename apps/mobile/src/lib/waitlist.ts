import { supabaseClient, isSupabaseConfigured } from '@/services/supabase/client';

export type WaitlistSubmitResult = 'ok' | 'duplicate' | 'unconfigured';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidWaitlistEmail(email: string): boolean {
  const t = email.trim();
  return t.length > 0 && EMAIL_RE.test(t);
}

export async function submitWaitlistEmail(email: string): Promise<WaitlistSubmitResult> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return 'unconfigured';
  }
  const normalized = email.trim().toLowerCase();
  const { error } = await supabaseClient.from('waitlist_signups').insert({ email: normalized });
  if (!error) {
    return 'ok';
  }
  const code = error.code;
  const msg = (error.message ?? '').toLowerCase();
  if (code === '23505' || msg.includes('duplicate key')) {
    return 'duplicate';
  }
  throw new Error(error.message);
}
