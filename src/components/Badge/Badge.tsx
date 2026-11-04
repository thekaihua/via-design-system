import { CircleCheck, CircleX, Circle, Info, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'positive' | 'warning' | 'negative' | 'urgent';

export interface BadgeProps {
  tone?: BadgeTone;
  /** Show the tone's status icon, or pass a lucide icon to use instead. The text always carries the meaning. */
  icon?: boolean | LucideIcon;
  className?: string;
  children: string;
}

const icons: Record<BadgeTone, LucideIcon> = {
  neutral: Circle,
  info: Info,
  positive: CircleCheck,
  warning: TriangleAlert,
  negative: CircleX,
  urgent: OctagonAlert,
};

/** Status label (Badge / Neutral … Urgent). Use for object status, not for actions. */
export function Badge({ tone = 'neutral', icon = true, className, children }: BadgeProps) {
  const Icon = typeof icon === 'boolean' ? icons[tone] : icon;
  return (
    <span className={cx(styles.badge, styles[tone], className)}>
      {icon && <Icon className={styles.icon} aria-hidden="true" />}
      {children}
    </span>
  );
}
