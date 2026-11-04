import { useState, type Ref } from 'react';
import { Group, TextArea, TextField as AriaTextField } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { FieldParts } from '../Field/Field';
import { fieldClassName, fieldStyles as s, type FieldBaseProps } from '../Field/fieldUtils';
import styles from './Textarea.module.css';

export interface TextareaProps extends Omit<FieldBaseProps, 'size'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Visible rows before the field scrolls. */
  rows?: number;
  /** Shows a character count; screen readers hear the remaining count once 20 or fewer are left. */
  maxLength?: number;
  name?: string;
  /** Sets the textarea's id, e.g. so an ErrorSummary can link to it. */
  id?: string;
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

/** Multi-line text input (Field / Textarea). */
export function Textarea({
  label,
  hideLabel,
  description,
  optional,
  error,
  disabled,
  readOnly,
  required,
  placeholder,
  rows = 4,
  maxLength,
  value,
  defaultValue,
  onChange,
  className,
  ref,
  id,
  ...rest
}: TextareaProps) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const current = value ?? internal;
  const remaining = maxLength !== undefined ? maxLength - current.length : undefined;
  return (
    <AriaTextField
      {...rest}
      value={value}
      defaultValue={defaultValue}
      onChange={(v) => {
        setInternal(v);
        onChange?.(v);
      }}
      maxLength={maxLength}
      isInvalid={!!error}
      isDisabled={disabled}
      isReadOnly={readOnly}
      isRequired={required}
      validationBehavior="aria"
      className={fieldClassName('md', readOnly, className)}
    >
      <FieldParts label={label} hideLabel={hideLabel} description={description} optional={optional} error={error}>
        <Group className={cx(s.control, styles.control)} isDisabled={disabled} isInvalid={!!error}>
          <TextArea ref={ref} id={id} className={cx(s.input, styles.textarea)} rows={rows} placeholder={placeholder} />
        </Group>
        {maxLength !== undefined && (
          <>
            <span className={styles.count} aria-hidden="true">
              {current.length} / {maxLength}
            </span>
            <span className="via-visually-hidden" aria-live="polite">
              {remaining !== undefined && remaining <= 20 ? `${remaining} characters remaining` : ''}
            </span>
          </>
        )}
      </FieldParts>
    </AriaTextField>
  );
}
