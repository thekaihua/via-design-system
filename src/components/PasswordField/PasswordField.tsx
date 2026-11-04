import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { ToggleButton } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { TextField, type TextFieldProps } from '../TextField/TextField';
import styles from './PasswordField.module.css';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'autoComplete' | 'trailingIcon'> {
  /** Lets people check what they typed. On by default. */
  showToggle?: boolean;
  /** Tells password managers whether to fill an existing password or suggest a new one. */
  autoComplete: 'current-password' | 'new-password';
}

/** Password input with a "Show password" toggle below it (Field / Password). */
export function PasswordField({ showToggle = true, className, id, ...props }: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={cx(styles.wrapper, className)}>
      <TextField {...props} id={inputId} type={revealed ? 'text' : 'password'} />
      {showToggle && (
        <ToggleButton
          className={styles.toggle}
          isSelected={revealed}
          onChange={setRevealed}
          isDisabled={props.disabled}
          aria-controls={inputId}
        >
          {revealed ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          Show password
        </ToggleButton>
      )}
    </div>
  );
}
