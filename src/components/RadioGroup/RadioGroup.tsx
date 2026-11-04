import { CircleAlert } from 'lucide-react';
import { FieldError, Label, Radio, RadioGroup as AriaRadioGroup, Text } from 'react-aria-components';
import { cx } from '../../utils/cx';
import cb from '../Checkbox/Checkbox.module.css';
import { fieldStyles as f } from '../Field/fieldUtils';
import styles from './RadioGroup.module.css';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group label (rendered as the radiogroup's name). */
  label: string;
  description?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  name?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/** Choose one option (Control / Radio). One Tab stop; arrow keys move and select. */
export function RadioGroup({
  label,
  description,
  options,
  disabled,
  required,
  error,
  orientation = 'vertical',
  className,
  ...rest
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...rest}
      orientation={orientation}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error}
      validationBehavior="aria"
      className={cx(styles.group, className)}
    >
      <Label className={f.label}>{label}</Label>
      {description && (
        <Text slot="description" className={f.description}>
          {description}
        </Text>
      )}
      <div className={cx(styles.options, orientation === 'horizontal' && styles.horizontal)}>
        {options.map((o) => (
          <Radio key={o.value} value={o.value} isDisabled={o.disabled} className={cx(cb.checkbox, cb.radio)}>
            <span className={cb.indicator} aria-hidden="true">
              <span className={styles.dotSlot}>
                <span className={cb.dot} />
              </span>
            </span>
            <span className={styles.text}>
              <span>{o.label}</span>
              {o.description && <span className={styles.optionDescription}>{o.description}</span>}
            </span>
          </Radio>
        ))}
      </div>
      <FieldError className={f.error}>
        <CircleAlert size={16} aria-hidden="true" />
        <span>{error}</span>
      </FieldError>
    </AriaRadioGroup>
  );
}
