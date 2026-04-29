import { getTimezoneOffset } from 'date-fns-tz';

export type TimeZoneCatalogEntry = {
  /** Full line shown in settings and on Home (UTC offset + regions). */
  label: string;
  /** IANA id stored on `profiles.time_zone` and used for date math. */
  iana: string;
};

/**
 * Fixed list for profile time zone (one representative IANA per row).
 * Order matches standard UTC offset progression.
 */
export const TIME_ZONE_CATALOG: TimeZoneCatalogEntry[] = [
  {
    label: 'UTC-12:00: Baker Island, Howland Island (International Date Line West)',
    iana: 'Etc/GMT+12',
  },
  { label: 'UTC-11:00: Niue, American Samoa', iana: 'Pacific/Pago_Pago' },
  { label: 'UTC-10:00: Hawaii, French Polynesia (Tahiti)', iana: 'Pacific/Honolulu' },
  { label: 'UTC-09:30: Marquesas Islands', iana: 'Pacific/Marquesas' },
  { label: 'UTC-09:00: Alaska, Gambier Islands', iana: 'America/Anchorage' },
  {
    label: 'UTC-08:00: Pacific Time (US, Canada), Baja California',
    iana: 'America/Los_Angeles',
  },
  {
    label: 'UTC-07:00: Mountain Time (US, Canada), Mexico',
    iana: 'America/Denver',
  },
  {
    label: 'UTC-06:00: Central Time (US, Canada), Central America',
    iana: 'America/Chicago',
  },
  {
    label: 'UTC-05:00: Eastern Time (US, Canada), Colombia, Peru',
    iana: 'America/New_York',
  },
  {
    label: 'UTC-04:00: Bolivia, Venezuela, Atlantic Time (Canada)',
    iana: 'America/Caracas',
  },
  {
    label: 'UTC-03:30: Newfoundland Time (Canada)',
    iana: 'America/St_Johns',
  },
  { label: 'UTC-03:00: Brazil, Argentina, Chile', iana: 'America/Sao_Paulo' },
  {
    label: 'UTC-02:00: South Georgia and the South Sandwich Islands',
    iana: 'Atlantic/South_Georgia',
  },
  { label: 'UTC-01:00: Cabo Verde, Azores', iana: 'Atlantic/Cape_Verde' },
  {
    label: 'UTC+00:00: Greenwich Mean Time (UK), Western Europe, West Africa',
    iana: 'Europe/London',
  },
  {
    label: 'UTC+01:00: Central Europe, West Africa',
    iana: 'Europe/Berlin',
  },
  {
    label: 'UTC+02:00: Eastern Europe, Southern Africa',
    iana: 'Europe/Athens',
  },
  {
    label: 'UTC+03:00: Moscow Time, East Africa, Saudi Arabia',
    iana: 'Europe/Moscow',
  },
  { label: 'UTC+03:30: Iran', iana: 'Asia/Tehran' },
  { label: 'UTC+04:00: Dubai, Azerbaijan, Samara Time', iana: 'Asia/Dubai' },
  { label: 'UTC+04:30: Afghanistan', iana: 'Asia/Kabul' },
  {
    label: 'UTC+05:00: Pakistan, Uzbekistan, West Russia',
    iana: 'Asia/Karachi',
  },
  { label: 'UTC+05:30: India, Sri Lanka', iana: 'Asia/Kolkata' },
  { label: 'UTC+05:45: Nepal', iana: 'Asia/Kathmandu' },
  {
    label: 'UTC+06:00: Bangladesh, Bhutan, Novosibirsk Time',
    iana: 'Asia/Dhaka',
  },
  { label: 'UTC+06:30: Myanmar, Cocos Islands', iana: 'Asia/Yangon' },
  {
    label: 'UTC+07:00: Thailand, Vietnam, Western Indonesia',
    iana: 'Asia/Bangkok',
  },
  {
    label: 'UTC+08:00: China, Western Australia, Philippines',
    iana: 'Asia/Shanghai',
  },
  { label: 'UTC+08:45: Eucla (Western Australia)', iana: 'Australia/Eucla' },
  { label: 'UTC+09:00: Japan, South Korea', iana: 'Asia/Tokyo' },
  {
    label: 'UTC+09:30: Australia (Northern Territory, South Australia)',
    iana: 'Australia/Darwin',
  },
  {
    label: 'UTC+10:00: Eastern Australia, Papua New Guinea',
    iana: 'Australia/Sydney',
  },
  { label: 'UTC+10:30: Lord Howe Island', iana: 'Australia/Lord_Howe' },
  {
    label: 'UTC+11:00: New Caledonia, Solomon Islands',
    iana: 'Pacific/Noumea',
  },
  { label: 'UTC+12:00: New Zealand, Fiji', iana: 'Pacific/Auckland' },
  { label: 'UTC+12:45: Chatham Islands', iana: 'Pacific/Chatham' },
  { label: 'UTC+13:00: Tonga, Samoa', iana: 'Pacific/Tongatapu' },
  { label: 'UTC+14:00: Kiribati (Line Islands)', iana: 'Pacific/Kiritimati' },
];

const byIana = new Map(TIME_ZONE_CATALOG.map((e) => [e.iana, e]));

/** `UTC±HH:MM` for an IANA zone at `referenceDate` (DST-aware). */
export function formatUtcOffsetPrefix(iana: string, referenceDate: Date = new Date()): string {
  const ms = getTimezoneOffset(iana, referenceDate);
  const absMs = Math.abs(ms);
  const totalMinutes = Math.round(absMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const sign = ms <= 0 ? '-' : '+';
  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}

/** Human line for settings / Home; catalog match or offset + IANA fallback. */
export function getTimeZoneDisplayLine(iana: string, referenceDate: Date = new Date()): string {
  const hit = byIana.get(iana);
  if (hit) return hit.label;
  const human = iana.replace(/_/g, ' ');
  return `${formatUtcOffsetPrefix(iana, referenceDate)}: ${human}`;
}

export function getCatalogEntryByIana(iana: string): TimeZoneCatalogEntry | undefined {
  return byIana.get(iana);
}
