import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  RangeCalendar as AriaRangeCalendar,
  type CalendarProps,
  type DateValue,
  type RangeCalendarProps,
} from 'react-aria-components';
import styles from './DateField.module.css';

function Header() {
  return (
    <header className={styles.calendarHeader}>
      <AriaButton slot="previous" className={styles.navButton} aria-label="Previous month">
        <ChevronLeft size={16} aria-hidden="true" />
      </AriaButton>
      <Heading className={styles.calendarHeading} />
      <AriaButton slot="next" className={styles.navButton} aria-label="Next month">
        <ChevronRight size={16} aria-hidden="true" />
      </AriaButton>
    </header>
  );
}

function Grid() {
  return (
    <CalendarGrid className={styles.grid} weekdayStyle="short">
      <CalendarGridHeader>{(day) => <CalendarHeaderCell className={styles.weekday}>{day}</CalendarHeaderCell>}</CalendarGridHeader>
      <CalendarGridBody>{(date) => <CalendarCell date={date} className={styles.cell} />}</CalendarGridBody>
    </CalendarGrid>
  );
}

/**
 * Month grid (Overlay / Date range picker › Calendar). Arrows move by day, PageUp/PageDown by month,
 * Home/End to the start/end of the week.
 */
export function Calendar<T extends DateValue>(props: CalendarProps<T>) {
  return (
    <AriaCalendar {...props} className={styles.calendar}>
      <Header />
      <Grid />
    </AriaCalendar>
  );
}

export function RangeCalendar<T extends DateValue>(props: RangeCalendarProps<T>) {
  return (
    <AriaRangeCalendar {...props} className={styles.calendar}>
      <Header />
      <Grid />
    </AriaRangeCalendar>
  );
}
