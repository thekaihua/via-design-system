import { ArrowRight, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Button as AriaButton,
  ButtonContext,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Dialog as AriaDialog,
  DialogTrigger,
  Group,
  I18nProvider,
  Popover,
  Provider,
  RangeCalendarContext,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import { FieldParts } from '../Field/Field';
import { fieldClassName, fieldStyles as s, type FieldBaseProps } from '../Field/fieldUtils';
import { RangeCalendar } from './Calendar';
import {
  DATE_INPUT_LOCALE,
  daysIn,
  defaultPresets,
  formatDateRange,
  todayIn,
  toCalendarDate,
  utcOffsetLabel,
  type DatePreset,
  type DateRange,
} from './dates';
import styles from './DateField.module.css';

export interface DateRangePickerProps extends Omit<FieldBaseProps, 'size'> {
  value: DateRange | null;
  onChange: (value: DateRange | null) => void;
  presets?: DatePreset[];
  /** IANA time zone the range is in (workspace time zone). Shown under the field with its UTC offset. */
  timeZone?: string;
  /** Earliest / latest allowed dates (ISO). */
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Date range with presets (Field / Date range, Overlay / Date range picker).
 * Type dates directly, or open the picker: choose a preset or two days, then Apply. Cancel, Esc or clicking
 * outside discards the choice.
 */
export function DateRangePicker({
  label,
  hideLabel,
  description,
  error,
  value,
  onChange,
  presets = defaultPresets,
  timeZone = 'UTC',
  min,
  max,
  disabled,
  className,
}: DateRangePickerProps) {
  const today = todayIn(timeZone);
  const current = value ? { start: toCalendarDate(value.start)!, end: toCalendarDate(value.end)! } : null;
  const matchingPreset = current
    ? presets.find((p) => {
        const r = p.range(today);
        return r.start.compare(current.start) === 0 && r.end.compare(current.end) === 0;
      })
    : undefined;

  const [open, setOpen] = useState(false);
  // When the container is too narrow the dates wrap under the preset; mark it so it can be styled.
  const groupRef = useRef<HTMLDivElement>(null);
  const [stacked, setStacked] = useState(false);
  useEffect(() => {
    const group = groupRef.current;
    const dates = group?.querySelector<HTMLElement>(`.${styles.rangeDates}`);
    const preset = group?.querySelector<HTMLElement>(`.${styles.presetButton}`);
    const container = group?.closest(`.${styles.range}`)?.parentElement;
    if (!group || !dates || !preset || !container) return;
    // Compare the room one row needs with the room available, so the stacked styles can't hold it stacked.
    const check = () => setStacked(preset.scrollWidth + dates.scrollWidth + 16 > container.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    document.fonts?.ready.then(check);
    return () => ro.disconnect();
  }, []);
  const [draft, setDraft] = useState(current);
  const [draftPreset, setDraftPreset] = useState<string | undefined>(matchingPreset?.id);

  const openPicker = (isOpen: boolean) => {
    if (isOpen) {
      setDraft(current);
      setDraftPreset(matchingPreset?.id);
    }
    setOpen(isOpen);
  };

  const apply = () => {
    onChange(draft ? { start: draft.start.toString(), end: draft.end.toString() } : null);
    setOpen(false);
  };

  const zoneNote = `Times in ${timeZone} (${utcOffsetLabel(timeZone)}).`;
  const presetLabel = matchingPreset?.label ?? (current ? 'Custom' : 'Choose dates');

  return (
    <I18nProvider locale={DATE_INPUT_LOCALE}>
    <AriaDateRangePicker
      value={current}
      onChange={(r) => onChange(r ? { start: r.start.toString(), end: r.end.toString() } : null)}
      minValue={toCalendarDate(min)}
      maxValue={toCalendarDate(max)}
      isDisabled={disabled}
      isInvalid={!!error}
      validationBehavior="aria"
      className={fieldClassName('md', false, cx(styles.range, className))}
    >
      <FieldParts label={label} hideLabel={hideLabel} description={description ?? zoneNote} error={error}>
        <Group ref={groupRef} className={cx(s.control, styles.rangeControl)} data-stacked={stacked || undefined}>
          {/*
            The picker is a separate dialog so the choice can be applied or discarded. Clear the date
            range picker's own button and calendar contexts so they don't capture these controls.
          */}
          <Provider values={[[ButtonContext, null], [RangeCalendarContext, null]]}>
          <DialogTrigger isOpen={open} onOpenChange={openPicker}>
            <AriaButton className={styles.presetButton} aria-label={`${presetLabel}, choose dates`}>
              {presetLabel}
              <ChevronDown size={16} aria-hidden="true" />
            </AriaButton>
            <Popover className={styles.popover} placement="bottom start" offset={4}>
              <AriaDialog className={styles.rangeDialog} aria-label={`Choose ${label.toLowerCase()}`}>
                <div className={styles.pickerBody}>
                  <ul className={styles.presets} aria-label="Presets">
                    {presets.map((p) => (
                      <li key={p.id}>
                        <AriaButton
                          className={cx(styles.preset, draftPreset === p.id && styles.presetActive)}
                          aria-pressed={draftPreset === p.id}
                          onPress={() => {
                            setDraft(p.range(today));
                            setDraftPreset(p.id);
                          }}
                        >
                          {p.label}
                        </AriaButton>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.pickerCalendar}>
                    <RangeCalendar
                      value={draft}
                      onChange={(r) => {
                        setDraft(r);
                        setDraftPreset(undefined);
                      }}
                      minValue={toCalendarDate(min)}
                      maxValue={toCalendarDate(max)}
                      defaultFocusedValue={draft?.end ?? today}
                    />
                  </div>
                </div>
                <div className={styles.pickerFooter}>
                  <span className={styles.summary} aria-live="polite">
                    {draft ? `${formatDateRange(draft.start, draft.end)} · ${daysIn(draft)} ${daysIn(draft) === 1 ? 'day' : 'days'}` : 'No dates chosen'}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={apply} disabled={!draft}>
                    Apply
                  </Button>
                </div>
              </AriaDialog>
            </Popover>
          </DialogTrigger>
          </Provider>
          <div className={styles.rangeDates}>
            <DateInput slot="start" className={styles.input}>
              {(segment) => <DateSegment segment={segment} className={styles.segment} />}
            </DateInput>
            <ArrowRight size={16} className={s.trailingIcon} aria-hidden="true" />
            <DateInput slot="end" className={styles.input}>
              {(segment) => <DateSegment segment={segment} className={styles.segment} />}
            </DateInput>
          </div>
        </Group>
      </FieldParts>
    </AriaDateRangePicker>
    </I18nProvider>
  );
}
