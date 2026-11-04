import { CalendarDays } from 'lucide-react';
import {
  Button as AriaButton,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog as AriaDialog,
  Group,
  I18nProvider,
  Popover,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import { FieldParts } from '../Field/Field';
import { fieldClassName, fieldStyles as s, type FieldBaseProps } from '../Field/fieldUtils';
import { Calendar } from './Calendar';
import { DATE_INPUT_LOCALE, toCalendarDate, toISO, type ISODate } from './dates';
import styles from './DateField.module.css';

export interface DateFieldProps extends Omit<FieldBaseProps, 'size'> {
  value?: ISODate | null;
  defaultValue?: ISODate | null;
  onChange?: (value: ISODate | null) => void;
  /** Earliest allowed date (ISO). */
  min?: ISODate;
  max?: ISODate;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
}

/**
 * Single date (Field / Date). Type each part, or open the calendar.
 * Values are ISO dates ("2026-11-14"); typed as day / month / year in every locale.
 */
export function DateField({
  label,
  hideLabel,
  description,
  optional,
  error,
  value,
  defaultValue,
  onChange,
  min,
  max,
  disabled,
  required,
  className,
  ...rest
}: DateFieldProps) {
  return (
    <I18nProvider locale={DATE_INPUT_LOCALE}>
    <DatePicker
      {...rest}
      value={value === undefined ? undefined : toCalendarDate(value)}
      defaultValue={toCalendarDate(defaultValue)}
      onChange={(d) => onChange?.(toISO(d))}
      minValue={toCalendarDate(min)}
      maxValue={toCalendarDate(max)}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error}
      validationBehavior="aria"
      className={fieldClassName('md', false, className)}
    >
      <FieldParts label={label} hideLabel={hideLabel} description={description} optional={optional} error={error}>
        <Group className={cx(s.control, styles.control)}>
          <DateInput className={styles.input}>{(segment) => <DateSegment segment={segment} className={styles.segment} />}</DateInput>
          <AriaButton className={styles.iconButton} aria-label="Open calendar">
            <CalendarDays size={20} aria-hidden="true" />
          </AriaButton>
        </Group>
      </FieldParts>
      <Popover className={styles.popover} placement="bottom start" offset={4}>
        <AriaDialog className={styles.dialog} aria-label={`Choose ${label.toLowerCase()}`}>
          <Calendar />
        </AriaDialog>
      </Popover>
    </DatePicker>
    </I18nProvider>
  );
}
