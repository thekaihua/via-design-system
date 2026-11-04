import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import {
  Button as AriaButton,
  Group,
  Input,
  ListBox,
  ListBoxItem,
  NumberField,
  Popover,
  Select as AriaSelect,
  SelectValue,
  type Key,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import { FieldParts } from '../Field/Field';
import { fieldClassName, fieldStyles as s, type FieldBaseProps } from '../Field/fieldUtils';
import styles from './CurrencyField.module.css';

/** Currencies settled without minor units (Behaviour spec › Validation). */
const ZERO_DECIMAL = new Set(['JPY', 'IDR', 'KRW', 'VND']);

export function fractionDigits(currency: string, locale?: string): number {
  if (ZERO_DECIMAL.has(currency)) return 0;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

export interface CurrencyFieldProps extends Omit<FieldBaseProps, 'size'> {
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  /** ISO 4217 code, e.g. "SGD". */
  currency?: string;
  /** Offer a currency picker. Without it the code is a fixed prefix. */
  currencies?: string[];
  onCurrencyChange?: (currency: string) => void;
  /** Formatting locale. Defaults to the browser's. */
  locale?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
}

const round = (v: number, digits: number) => Math.round(v * 10 ** digits) / 10 ** digits;

/**
 * Money amount (Field / Currency). Decimal keyboard on touch devices; the value is rounded and formatted on
 * blur with the currency's decimal places (0 for JPY and IDR). A decimal point is always accepted, so
 * "1500.7" in JPY becomes 1,501 rather than 15,007.
 */
export function CurrencyField({
  label,
  hideLabel,
  description,
  optional,
  error,
  value,
  defaultValue,
  onChange,
  currency = 'SGD',
  currencies,
  onCurrencyChange,
  locale,
  min = 0,
  max,
  disabled,
  required,
  name,
  className,
}: CurrencyFieldProps) {
  const digits = fractionDigits(currency, locale);
  const currencyLabelId = useId();
  // Controlled internally so the rounded value is what's shown after blur.
  const [inner, setInner] = useState<number | null>(defaultValue ?? null);
  const current = value === undefined ? inner : value;
  return (
    <NumberField
      value={current === null ? NaN : current}
      onChange={(v) => {
        const next = Number.isNaN(v) ? null : round(v, digits);
        setInner(next);
        onChange?.(next);
      }}
      // Parse up to 2 decimals even for zero-decimal currencies, then round; display uses the currency's digits.
      formatOptions={{ style: 'decimal', minimumFractionDigits: digits, maximumFractionDigits: Math.max(digits, 2) }}
      minValue={min}
      maxValue={max}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error}
      validationBehavior="aria"
      name={name}
      className={fieldClassName('md', false, className)}
    >
      <FieldParts label={label} hideLabel={hideLabel} description={description} optional={optional} error={error}>
        <Group className={cx(s.control, styles.control)}>
          {currencies?.length ? (
            // Outside NumberField's button slots: a separate, labelled picker.
            <CurrencyPicker currency={currency} currencies={currencies} onChange={onCurrencyChange} disabled={disabled} />
          ) : (
            <span id={currencyLabelId} className={styles.prefix}>
              {currency}
            </span>
          )}
          {/* Decimal keypad when the currency has minor units (React Aria defaults to numeric on most platforms). */}
          <Input
            className={cx(s.input, styles.input)}
            inputMode={digits > 0 ? 'decimal' : 'numeric'}
            aria-describedby={currencies?.length ? undefined : currencyLabelId}
          />
        </Group>
      </FieldParts>
    </NumberField>
  );
}

function CurrencyPicker({
  currency,
  currencies,
  onChange,
  disabled,
}: {
  currency: string;
  currencies: string[];
  onChange?: (c: string) => void;
  disabled?: boolean;
}) {
  return (
    <AriaSelect
      aria-label="Currency"
      value={currency as Key}
      onChange={(k) => k !== null && onChange?.(String(k))}
      isDisabled={disabled}
      className={styles.pickerRoot}
    >
      <AriaButton slot={null} className={cx(styles.prefix, styles.prefixButton)}>
        <SelectValue />
        <ChevronDown size={14} aria-hidden="true" />
      </AriaButton>
      <Popover className={styles.popover} offset={4} placement="bottom start">
        <ListBox className={styles.listbox} items={currencies.map((c) => ({ id: c }))}>
          {(c) => (
            <ListBoxItem id={c.id} textValue={c.id} className={styles.option}>
              {c.id}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
