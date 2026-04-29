/** Curated IANA ids when `Intl.supportedValuesOf` is unavailable (e.g. some Hermes builds). */
const FALLBACK_TIME_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Athens',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
] as const;

export function listTimeZoneOptions(): string[] {
  try {
    const supported = Intl.supportedValuesOf?.('timeZone');
    if (Array.isArray(supported) && supported.length > 0) {
      return [...supported].sort((a, b) => a.localeCompare(b));
    }
  } catch {
    /* ignore */
  }
  return [...FALLBACK_TIME_ZONES];
}
