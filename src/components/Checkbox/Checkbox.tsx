import { Check, CircleAlert, Minus } from 'lucide-react';
import { useId } from 'react';
import { Checkbox as AriaCheckbox } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  label: string;
  /** Hide the label visually (e.g. row selection in a table); it stays available to screen readers. */
  hideLabel?: boolean;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  /** Mixed state, e.g. a "select all" when some rows are selected (aria-checked=mixed). */
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Error message; marks the checkbox invalid. */
  error?: string;
  name?: string;
  value?: string;
  className?: string;
}

/** Checkbox with label (Control / Checkbox). */
export function Checkbox({
  label,
  hideLabel,
  description,
  checked,
  defaultChecked,
  indeterminate,
  onChange,
  disabled,
  error,
  className,
  ...rest
}: CheckboxProps) {
  const id = useId();
  const describedBy = [description && `${id}-desc`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx(styles.root, className)}>
      <AriaCheckbox
        {...rest}
        isSelected={checked}
        defaultSelected={defaultChecked}
        isIndeterminate={indeterminate}
        onChange={onChange}
        isDisabled={disabled}
        isInvalid={!!error}
        aria-describedby={describedBy}
        className={cx(styles.checkbox, hideLabel && styles.compact)}
      >
        {({ isSelected, isIndeterminate }) => (
          <>
            <span className={styles.indicator} aria-hidden="true">
              {isIndeterminate ? <Minus size={14} strokeWidth={3} /> : isSelected && <Check size={14} strokeWidth={3} />}
            </span>
            <span className={hideLabel ? 'via-visually-hidden' : styles.label}>{label}</span>
          </>
        )}
      </AriaCheckbox>
      {description && (
        <span id={`${id}-desc`} className={styles.description}>
          {description}
        </span>
      )}
      {error && (
        <span id={`${id}-err`} className={styles.error}>
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}
