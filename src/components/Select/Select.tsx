import { Check, ChevronDown } from 'lucide-react';
import {
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  type Key,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import { FieldParts } from '../Field/Field';
import { fieldClassName, fieldStyles as s, type FieldBaseProps } from '../Field/fieldUtils';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends FieldBaseProps {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
}

/**
 * Choose one option from a list (Field / Select / Small, Medium).
 * Listbox pattern: Enter, Space or ↓ opens; ↑/↓ move; Enter selects; Esc closes without change; type-ahead.
 */
export function Select({
  label,
  hideLabel,
  description,
  optional,
  error,
  size = 'md',
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  disabled,
  required,
  className,
  ...rest
}: SelectProps) {
  return (
    <AriaSelect
      {...rest}
      value={value as Key | null | undefined}
      defaultValue={defaultValue as Key | null | undefined}
      onChange={(key) => onChange?.(key === null ? null : String(key))}
      placeholder={placeholder}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error}
      validationBehavior="aria"
      className={fieldClassName(size, false, cx(styles.select, className))}
    >
      <FieldParts label={label} hideLabel={hideLabel} description={description} optional={optional} error={error}>
        <AriaButton className={cx(s.control, styles.trigger)}>
          <SelectValue className={styles.value} />
          <ChevronDown className={cx(s.trailingIcon, styles.chevron)} size={16} aria-hidden="true" />
        </AriaButton>
      </FieldParts>
      <Popover className={styles.popover} offset={4}>
        <ListBox className={styles.listbox} items={options.map((o) => ({ ...o, id: o.value }))}>
          {(o) => (
            <ListBoxItem id={o.value} textValue={o.label} isDisabled={o.disabled} className={styles.option}>
              {({ isSelected }) => (
                <>
                  <span className={styles.optionLabel}>{o.label}</span>
                  {isSelected && <Check size={16} className={styles.check} aria-hidden="true" />}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
