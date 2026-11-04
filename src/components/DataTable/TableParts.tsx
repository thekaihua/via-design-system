import type { ReactNode } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import { Pagination } from '../Pagination/Pagination';
import styles from './TableParts.module.css';

export interface TableToolbarProps {
  /** Section title above the table (rendered as h2 by default). */
  title?: string;
  titleLevel?: 2 | 3;
  /** Buttons on the title row, e.g. Export. */
  actions?: ReactNode;
  /** Search and filter controls on the second row. */
  children?: ReactNode;
  className?: string;
}

/** Title, actions and controls above a table (Data / Table toolbar). */
export function TableToolbar({ title, titleLevel = 2, actions, children, className }: TableToolbarProps) {
  const Heading = `h${titleLevel}` as const;
  return (
    <div className={cx(styles.toolbar, className)}>
      {(title || actions) && (
        <div className={styles.titleRow}>
          {title && <Heading className={styles.title}>{title}</Heading>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {children && <div className={styles.controls}>{children}</div>}
    </div>
  );
}

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  /** Shows "Select all {total}" when not everything is selected (e.g. across pages). */
  onSelectAll?: () => void;
  onClear?: () => void;
  /** Actions for the selected rows, e.g. Export, Revoke 2 keys. */
  actions: ReactNode;
  className?: string;
}

/** Selection summary and bulk actions (Data / Bulk action bar). The count is announced politely. */
export function BulkActionBar({ selectedCount, totalCount, onSelectAll, onClear, actions, className }: BulkActionBarProps) {
  return (
    <div className={cx(styles.bulk, className)} role="region" aria-label="Bulk actions">
      <span className={styles.count} aria-live="polite">
        {selectedCount} of {totalCount} selected
      </span>
      {onSelectAll && selectedCount < totalCount && (
        <Button variant="secondary" size="sm" onClick={onSelectAll}>
          Select all {totalCount}
        </Button>
      )}
      {onClear && (
        <AriaButton className={styles.clear} onPress={onClear}>
          Clear selection
        </AriaButton>
      )}
      <span className={styles.spacer} />
      <div className={styles.bulkActions}>{actions}</div>
    </div>
  );
}

export interface TableFooterProps {
  /** e.g. "Showing 1–25 of 48 records". */
  summary: string;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  /** Extra content, e.g. a "View all" link. */
  children?: ReactNode;
  className?: string;
}

/** Result count and pagination under a table (Data / Table footer). */
export function TableFooter({ summary, page, pageCount, onPageChange, children, className }: TableFooterProps) {
  return (
    <div className={cx(styles.footer, className)}>
      <span className={styles.summary}>{summary}</span>
      {children}
      {page !== undefined && pageCount !== undefined && onPageChange && (
        <Pagination variant="inline" page={page} pageCount={pageCount} onPageChange={onPageChange} />
      )}
    </div>
  );
}
