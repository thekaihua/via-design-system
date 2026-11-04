import { CircleX, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Banner.module.css';

export type BannerType = 'default' | 'caution' | 'critical';

export interface BannerProps {
  /** default = information, caution = needs attention soon, critical = blocking problem. */
  type?: BannerType;
  title: string;
  description?: ReactNode;
  /** Usually one or two small secondary Buttons. */
  actions?: ReactNode;
  /** Shows a dismiss button when provided. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. */
  dismissLabel?: string;
  className?: string;
}

const icons: Record<BannerType, LucideIcon> = { default: Info, caution: TriangleAlert, critical: CircleX };

/**
 * Page-level message (Banner / Default, Caution, Critical).
 * Announced politely (role=status); critical banners interrupt (role=alert).
 */
export function Banner({ type = 'default', title, description, actions, onDismiss, dismissLabel = 'Dismiss', className }: BannerProps) {
  const Icon = icons[type];
  return (
    <div role={type === 'critical' ? 'alert' : 'status'} className={cx(styles.banner, styles[type], className)}>
      <Icon className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.text}>
          <p className={styles.title}>{title}</p>
          {description && <div className={styles.description}>{description}</div>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {onDismiss && (
        <AriaButton className={styles.dismiss} onPress={onDismiss} aria-label={dismissLabel}>
          <X size={16} aria-hidden="true" />
        </AriaButton>
      )}
    </div>
  );
}
