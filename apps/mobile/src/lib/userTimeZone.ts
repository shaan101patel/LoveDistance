/** Resolved IANA id for reunion/calendar UX (profile override or device). */
export function resolveUserTimeZone(profileTimeZone: string | null | undefined): string {
  const t = profileTimeZone?.trim();
  return t && t.length > 0 ? t : Intl.DateTimeFormat().resolvedOptions().timeZone;
}
