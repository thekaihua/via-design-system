import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './AppShell.module.css';

export interface PageHeaderProps {
  /** The page's h1. One per page. */
  title: string;
  /** Section above the title, e.g. "Developers", or a breadcrumb. */
  context?: ReactNode;
  description?: ReactNode;
  /** Page actions. Under 768 px they move below the title. */
  actions?: ReactNode;
  /** Usually <Tabs variant="page">. */
  tabs?: ReactNode;
  className?: string;
}

/** Title block at the top of a page (Application / Page header). */
export function PageHeader({ title, context, description, actions, tabs, className }: PageHeaderProps) {
  return (
    <div className={cx(styles.pageHeader, className)}>
      <div className={styles.pageHeaderRow}>
        <div className={styles.pageHeading}>
          {context && <div className={styles.pageContext}>{context}</div>}
          <h1 className={styles.pageTitle}>{title}</h1>
          {description && <div className={styles.pageDescription}>{description}</div>}
        </div>
        {actions && <div className={styles.pageActions}>{actions}</div>}
      </div>
      {tabs}
    </div>
  );
}
