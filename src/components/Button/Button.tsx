import type { LucideIcon } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** `gradient` is for marketing and hero CTAs only. */
  variant?: ButtonVariant;
  /** Visual height 28 / 32 / 40 px; the touch target is always at least 44 px. */
  size?: ButtonSize;
  /** A lucide-react icon shown before the label. */
  leadingIcon?: LucideIcon;
  /** Shows a spinner, keeps the label, ignores presses and announces the busy state. */
  loading?: boolean;
  /** Disabled buttons stay focusable (aria-disabled) so a tooltip can explain why. */
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Required when the button has no visible text. */
  'aria-label'?: string;
  form?: string;
  name?: string;
  value?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <AriaButton
      {...rest}
      // Never submit a form while disabled; keep the element focusable.
      type={disabled ? 'button' : type}
      aria-disabled={disabled || undefined}
      isPending={loading}
      onPress={disabled ? undefined : onClick}
      className={cx(styles.button, styles[variant], size !== 'md' && styles[size], fullWidth && styles.fullWidth, className)}
    >
      {loading ? (
        <Spinner size="sm" label={null} inheritColor className={styles.icon} />
      ) : (
        Icon && <Icon className={styles.icon} aria-hidden="true" />
      )}
      <span>{children}</span>
    </AriaButton>
  );
}
