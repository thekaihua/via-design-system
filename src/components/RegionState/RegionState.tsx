import { CircleX, Inbox, Search, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Spinner } from '../Spinner/Spinner';
import styles from './RegionState.module.css';
import { Illustration, type IllustrationName } from '../Illustration/Illustration';

export type RegionStateKind = 'empty' | 'no-results' | 'error' | 'loading';

export interface RegionStateProps {
  kind: RegionStateKind;
  title: string;
  description?: ReactNode;
  /** One recovery action: Create, Clear filters, Try again. */
  action?: ReactNode;
  /** Override the default icon for the kind. */
  icon?: LucideIcon;
  /** A spot illustration instead of the icon, for first-use empty states with room for it. */
  illustration?: IllustrationName;
  className?: string;
}

const icons: Record<Exclude<RegionStateKind, 'loading'>, LucideIcon> = {
  empty: Inbox,
  'no-results': Search,
  error: CircleX,
};

/**
 * Empty, no-results, error or loading content for a data region (Data / Region state).
 * Keep filters when showing an error; offer one way forward.
 */
export function RegionState({ kind, title, description, action, icon, illustration, className }: RegionStateProps) {
  if (kind === 'loading') {
    // Feedback / Loading: status line, then skeleton lines. Announced once as a status.
    return (
      <div className={cx(styles.state, styles.loading, className)} role="status">
        <div className={styles.loadingRow}>
          <Spinner size="sm" label={null} />
          <span className={styles.loadingText}>{title}</span>
        </div>
        <span className={styles.skeleton} aria-hidden="true" />
        <span className={cx(styles.skeleton, styles.skeletonShort)} aria-hidden="true" />
      </div>
    );
  }
  const Icon = icon ?? icons[kind];
  return (
    <div className={cx(styles.state, kind === 'error' && styles.error, className)} role={kind === 'error' ? 'alert' : undefined}>
      {illustration ? <Illustration name={illustration} width={160} /> : Icon && <Icon className={styles.icon} size={28} aria-hidden="true" />}
      <p className={styles.title}>{title}</p>
      {description && <div className={styles.description}>{description}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
