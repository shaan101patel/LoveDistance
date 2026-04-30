/**
 * Public support / legal contact for mailto links.
 * Set `EXPO_PUBLIC_SUPPORT_EMAIL` in env (see apps/mobile/.env.example).
 */
export function getSupportEmail(): string {
  const v = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim();
  if (v) {
    return v;
  }
  return 'support@lovedistance.com';
}
