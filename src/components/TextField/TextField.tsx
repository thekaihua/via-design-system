import type { LucideIcon } from 'lucide-react';
import type { Ref } from 'react';
import { Group, Input, TextField as AriaTextField } from 'react-aria-components';
import { FieldParts } from '../Field/Field';
import { fieldClassName, fieldStyles as s, type FieldBaseProps } from '../Field/fieldUtils';

export interface TextFieldProps extends FieldBaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'url' | 'tel' | 'password' | 'search';
  /** Decorative icon at the end of the control. */
  trailingIcon?: LucideIcon;
  name?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'url' | 'tel' | 'numeric' | 'decimal' | 'search';
  /** Sets the input's id (e.g. for aria-controls from another control). */
  id?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

/** Single-line text input (Field / Text field / Small, Medium). */
export function TextField({
  label,
  hideLabel,
  description,
  optional,
  error,
  size = 'md',
  disabled,
  readOnly,
  required,
  placeholder,
  trailingIcon: Icon,
  className,
  ref,
  ...rest
}: TextFieldProps) {
  return (
    <AriaTextField
      {...rest}
      isInvalid={!!error}
      isDisabled={disabled}
      isReadOnly={readOnly}
      isRequired={required}
      validationBehavior="aria"
      className={fieldClassName(size, readOnly, className)}
    >
      <FieldParts label={label} hideLabel={hideLabel} description={description} optional={optional} error={error}>
        <Group className={s.control} isDisabled={disabled} isInvalid={!!error}>
          <Input ref={ref} className={s.input} placeholder={placeholder} />
          {Icon && <Icon className={s.trailingIcon} size={size === 'sm' ? 16 : 20} aria-hidden="true" />}
        </Group>
      </FieldParts>
    </AriaTextField>
  );
}
