import { parseDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { formatDate, formatDateRange } from './dates';

describe('formatDate (DD MMM YYYY)', () => {
  it('formats ISO dates, CalendarDates and instants', () => {
    expect(formatDate('2026-11-03')).toBe('03 Nov 2026');
    expect(formatDate(parseDate('2026-09-30'))).toBe('30 Sep 2026');
    expect(formatDate('2026-01-05', { year: false })).toBe('05 Jan');
  });
  it('shows an instant in the given time zone', () => {
    const t = new Date('2026-11-02T18:30:00Z');
    expect(formatDate(t)).toBe('02 Nov 2026');
    expect(formatDate(t, { timeZone: 'Asia/Singapore' })).toBe('03 Nov 2026');
  });
  it('formats ranges', () => {
    expect(formatDateRange('2026-10-27', '2026-11-02')).toBe('27 Oct 2026 – 02 Nov 2026');
  });
});

describe('formatDateTime', async () => {
  const { formatDateTime, formatTime } = await import('./dates');
  it('formats in the given zone, 24-hour', () => {
    expect(formatDateTime('2026-10-12T01:41:00Z', { timeZone: 'Asia/Singapore' })).toBe('12 Oct 2026, 09:41');
    expect(formatTime('2026-10-12T00:05:00Z')).toBe('00:05');
  });
});
