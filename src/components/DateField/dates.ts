import {
  endOfMonth,
  parseDate,
  startOfMonth,
  today,
  type CalendarDate,
} from '@internationalized/date';

/** A calendar date as an ISO string, e.g. "2026-11-14". No time, no time zone: no off-by-one-day bugs. */
export type ISODate = string;

export interface DateRange {
  start: ISODate;
  end: ISODate;
}

export const toCalendarDate = (iso?: ISODate | null): CalendarDate | null => (iso ? parseDate(iso) : null);
export const toISO = (d: { toString(): string } | null | undefined): ISODate | null => (d ? d.toString() : null);

/** "UTC+8" for a time zone, from the browser's own data. */
export function utcOffsetLabel(timeZone: string, at = new Date()): string {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')?.value;
  return (part ?? 'UTC').replace('GMT', 'UTC').replace(/^UTC$/, 'UTC+0');
}

export interface DatePreset {
  id: string;
  label: string;
  /** Returns the range for "today" in the given time zone. */
  range: (todayInZone: CalendarDate) => { start: CalendarDate; end: CalendarDate };
}

/** Presets from the design (Overlay / Date range picker › Presets). "Custom" is the calendar itself. */
export const defaultPresets: DatePreset[] = [
  { id: 'today', label: 'Today', range: (t) => ({ start: t, end: t }) },
  { id: 'last7', label: 'Last 7 days', range: (t) => ({ start: t.subtract({ days: 6 }), end: t }) },
  { id: 'last30', label: 'Last 30 days', range: (t) => ({ start: t.subtract({ days: 29 }), end: t }) },
  { id: 'mtd', label: 'Month to date', range: (t) => ({ start: startOfMonth(t), end: t }) },
  {
    id: 'lastQuarter',
    label: 'Last quarter',
    range: (t) => {
      const firstMonthOfQuarter = Math.floor((t.month - 1) / 3) * 3 + 1;
      const start = t.set({ month: firstMonthOfQuarter, day: 1 }).subtract({ months: 3 });
      return { start, end: endOfMonth(start.add({ months: 2 })) };
    },
  },
];

export const todayIn = (timeZone: string) => today(timeZone);

/** Inclusive number of days in a range. */
export function daysIn(range: { start: CalendarDate; end: CalendarDate }): number {
  return range.end.compare(range.start) + 1;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Date format: "03 Nov 2026" (DD MMM YYYY), the same in every locale. Built by hand rather than with
 * Intl because some locales spell months differently (en-GB gives "Sept").
 * A `Date` (an instant) is shown in `timeZone`, default UTC; ISO dates and CalendarDates have no zone.
 */
export function formatDate(
  value: ISODate | CalendarDate | Date,
  { year = true, timeZone = 'UTC' }: { year?: boolean; timeZone?: string } = {},
): string {
  let y: number, m: number, d: number;
  if (value instanceof Date) {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' })
        .formatToParts(value)
        .map((p) => [p.type, p.value]),
    );
    [y, m, d] = [Number(parts.year), Number(parts.month), Number(parts.day)];
  } else {
    const c = typeof value === 'string' ? parseDate(value.slice(0, 10)) : value;
    [y, m, d] = [c.year, c.month, c.day];
  }
  return `${pad(d)} ${MONTHS[m - 1]}${year ? ` ${y}` : ''}`;
}

/** "27 Oct 2026 – 02 Nov 2026". */
export const formatDateRange = (start: ISODate | CalendarDate, end: ISODate | CalendarDate) => `${formatDate(start)} – ${formatDate(end)}`;

/**
 * Locale for date inputs, which only decides the order of the typed parts. en-GB gives day / month / year
 * (month stays numeric while typing; React Aria segments can't show "Nov").
 */
export const DATE_INPUT_LOCALE = 'en-GB';

/** "09:41", 24-hour, in `timeZone` (default UTC). */
export function formatTime(value: Date | string, { timeZone = 'UTC' }: { timeZone?: string } = {}): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
}

/** "12 Oct 2026, 09:41" in `timeZone` (default UTC). Say which zone nearby, e.g. "Times in UTC". */
export function formatDateTime(value: Date | string, { timeZone = 'UTC' }: { timeZone?: string } = {}): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${formatDate(d, { timeZone })}, ${formatTime(d, { timeZone })}`;
}
