import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button as AriaButton } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /**
   * `full`: page numbers (Navigation / Pagination). `compact`: "1 of 3" above two equal buttons, for narrow
   * screens (Pagination compact). `inline`: Previous · 1 of 3 · Next on one row (Data / Table footer).
   */
  variant?: 'full' | 'compact' | 'inline';
  /** Names the navigation landmark. */
  'aria-label'?: string;
  className?: string;
}

/** Page numbers with gaps: 1 … 4 5 6 … 12 */
function pageList(page: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages = new Set([1, count, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

/** Page navigation (Navigation / Pagination, Pagination compact). */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  variant = 'full',
  'aria-label': ariaLabel = 'Pagination',
  className,
}: PaginationProps) {
  const prev = (
    <Button variant="secondary" className={styles.pageButton} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
      Previous
    </Button>
  );
  const next = (
    <Button variant="secondary" className={styles.pageButton} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
      Next
    </Button>
  );

  if (variant === 'inline') {
    return (
      <nav aria-label={ariaLabel} className={cx(styles.inline, className)}>
        {prev}
        <span className={styles.count} aria-current="page">
          {page} of {pageCount}
        </span>
        {next}
      </nav>
    );
  }

  if (variant === 'compact') {
    // Pagination compact: the count on top, then two equal Previous / Next buttons (narrow screens).
    return (
      <nav aria-label={ariaLabel} className={cx(styles.compact, className)}>
        <span className={styles.count} aria-current="page">
          {page} of {pageCount}
        </span>
        <div className={styles.compactActions}>
          <Button variant="secondary" fullWidth leadingIcon={ChevronLeft} className={styles.pageButton} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <Button variant="secondary" fullWidth className={cx(styles.pageButton, styles.nextButton)} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
            Next
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label={ariaLabel} className={cx(styles.full, className)}>
      {prev}
      <ol className={styles.pages}>
        {pageList(page, pageCount).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <AriaButton
                className={cx(styles.page, p === page && styles.current)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                onPress={() => p !== page && onPageChange(p)}
              >
                {p}
              </AriaButton>
            </li>
          ),
        )}
      </ol>
      {next}
    </nav>
  );
}
