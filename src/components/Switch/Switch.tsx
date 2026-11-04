import { useId } from 'react';
import { Switch as AriaSwitch } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Switch.module.css';

export interface SwitchProps {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  /** Switches apply immediately; use a Checkbox for choices confirmed with a submit button. */
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** On/off setting that applies immediately (Control / Switch, Control / Switch / On). */
export function Switch({ label, description, checked, defaultChecked, disabled, className, ...rest }: SwitchProps) {
  const id = useId();
  // The description sits outside the <label> so it isn't read as part of the name.
  return (
    <div className={cx(styles.root, className)}>
      <AriaSwitch
        {...rest}
        isSelected={checked}
        defaultSelected={defaultChecked}
        isDisabled={disabled}
        aria-describedby={description ? `${id}-desc` : undefined}
        className={styles.switch}
      >
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
        <span className={styles.label}>{label}</span>
      </AriaSwitch>
      {description && (
        <span id={`${id}-desc`} className={styles.description}>
          {description}
        </span>
      )}
    </div>
  );
}
