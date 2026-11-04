import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { Checkbox } from '../Checkbox/Checkbox';
import { RegionState } from '../RegionState/RegionState';
import styles from './DataTable.module.css';

export type SortDirection = 'ascending' | 'descending';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** Numbers, amounts and dates align to the end. */
  align?: 'start' | 'end';
  /** Monospace, end-aligned figures (Table / Numeric cell). */
  numeric?: boolean;
  sortable?: boolean;
  /** CSS width, e.g. 180 or '20%'. Columns without a width share the rest. */
  width?: number | string;
  /** Cell content. Defaults to `row[key]`. */
  render?: (row: T) => ReactNode;
  /** Smaller second line under the value (Table / Cell › Secondary value). */
  secondary?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  /** Names the table for screen readers (rendered as a visually hidden caption). */
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Stable id for each row. Defaults to `row.id`. */
  getRowId?: (row: T) => string;
  sort?: SortState;
  onSort?: (sort: SortState) => void;
  /** Adds a checkbox column. Use with `selected` and `onSelect`. */
  selectable?: boolean;
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  /** Accessible name for a row's checkbox, e.g. row => `Select ${row.name}`. Defaults to the first column's value. */
  rowLabel?: (row: T) => string;
  /**
   * Makes rows open something. The first column becomes a button for keyboard and screen-reader users;
   * clicking anywhere on the row does the same with a mouse.
   */
  onRowClick?: (row: T) => void;
  /** Shows skeleton rows and sets aria-busy. Keep the previous rows by not clearing `rows` while refreshing. */
  loading?: boolean;
  /** Shown when there are no rows. Defaults to a generic empty state. */
  empty?: ReactNode;
  /** Shown instead of rows when loading failed. */
  error?: ReactNode;
  /** Shown above the header while rows are selected, e.g. <BulkActionBar>. */
  bulkActions?: ReactNode;
  /** Usually <TableFooter>. */
  footer?: ReactNode;
  className?: string;
}

const SKELETON_ROWS = 5;

/**
 * Data table (Table / Container, Header row, Cell, Selection cell, Row / Compact).
 * Native table semantics: Tab reaches sortable headers, row buttons/links and checkboxes; there is no
 * cell-by-cell grid navigation. Under 768 px rows become stacked cards.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId = (row) => String((row as { id?: unknown }).id),
  sort,
  onSort,
  selectable,
  selected = [],
  onSelect,
  rowLabel,
  onRowClick,
  loading,
  empty,
  error,
  bulkActions,
  footer,
  className,
}: DataTableProps<T>) {
  const ids = rows.map(getRowId);
  const selectedSet = new Set(selected);
  const allSelected = ids.length > 0 && ids.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && ids.some((id) => selectedSet.has(id));
  const colCount = columns.length + (selectable ? 1 : 0);
  const first = columns[0];

  const valueOf = (row: T, col: DataTableColumn<T>): ReactNode =>
    col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as ReactNode);
  const labelOf = (row: T) => (rowLabel ? rowLabel(row) : `Select ${String(valueOf(row, first) ?? getRowId(row))}`);

  const toggleSort = (key: string) =>
    onSort?.({ key, direction: sort?.key === key && sort.direction === 'ascending' ? 'descending' : 'ascending' });

  const fullRow = (content: ReactNode) => (
    <tr role="row" className={styles.stateRow}>
      <td role="cell" colSpan={colCount} className={styles.stateCell}>
        {content}
      </td>
    </tr>
  );

  let body: ReactNode;
  if (error) {
    body = fullRow(error);
  } else if (loading && rows.length === 0) {
    body = Array.from({ length: SKELETON_ROWS }, (_, i) => (
      <tr role="row" key={`skeleton-${i}`} className={styles.row} aria-hidden="true">
        {selectable && <td role="cell" className={styles.selectCell} />}
        {columns.map((c) => (
          <td role="cell" key={c.key} className={styles.cell}>
            <span className={styles.skeleton} style={{ width: `${50 + ((i * 17 + c.key.length * 7) % 40)}%` }} />
          </td>
        ))}
      </tr>
    ));
  } else if (rows.length === 0) {
    body = fullRow(empty ?? <RegionState kind="empty" title="Nothing here yet" />);
  } else {
    body = rows.map((row) => {
      const id = getRowId(row);
      const isSelected = selectedSet.has(id);
      return (
        <tr
          role="row"
          key={id}
          className={cx(styles.row, onRowClick && styles.clickable, isSelected && styles.selected)}
          onClick={
            onRowClick
              ? (e) => {
                  // Clicks on controls inside the row (checkbox, links, menus) keep their own behaviour.
                  if ((e.target as HTMLElement).closest('a, button, input, label, [role=menu]')) return;
                  onRowClick(row);
                }
              : undefined
          }
        >
          {selectable && (
            <td role="cell" className={styles.selectCell}>
              <Checkbox
                label={labelOf(row)}
                hideLabel
                checked={isSelected}
                onChange={(c) => onSelect?.(c ? [...selected, id] : selected.filter((s) => s !== id))}
              />
            </td>
          )}
          {columns.map((col, i) => {
            const value = valueOf(row, col);
            const secondary = col.secondary?.(row);
            const content =
              i === 0 && onRowClick ? (
                <AriaButton className={styles.rowButton} onPress={() => onRowClick(row)}>
                  {value}
                </AriaButton>
              ) : (
                value
              );
            return (
              <td
                role="cell"
                key={col.key}
                data-label={col.header}
                className={cx(styles.cell, (col.align === 'end' || col.numeric) && styles.end, col.numeric && styles.numeric)}
              >
                <span className={styles.primary}>{content}</span>
                {secondary && <span className={styles.secondary}>{secondary}</span>}
              </td>
            );
          })}
        </tr>
      );
    });
  }

  return (
    <div className={cx(styles.container, className)}>
      {bulkActions && selected.length > 0 && <div className={styles.bulk}>{bulkActions}</div>}
      <ScrollRegion label={caption}>
        <table role="table" className={styles.table} aria-busy={loading || undefined}>
          <caption className="via-visually-hidden">{caption}</caption>
          <colgroup>
            {selectable && <col style={{ width: 60 }} />}
            {columns.map((c) => (
              <col key={c.key} style={{ width: c.width } as CSSProperties} />
            ))}
          </colgroup>
          <thead className={styles.head}>
            <tr role="row">
              {selectable && (
                <th role="columnheader" scope="col" className={styles.selectCell}>
                  <Checkbox
                    label="Select all rows"
                    hideLabel
                    checked={allSelected}
                    indeterminate={someSelected}
                    disabled={rows.length === 0}
                    onChange={(c) => onSelect?.(c ? ids : [])}
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const SortIcon = isSorted ? (sort.direction === 'ascending' ? ArrowUp : ArrowDown) : ArrowDownUp;
                return (
                  <th
                    role="columnheader"
                    key={col.key}
                    scope="col"
                    aria-sort={col.sortable ? (isSorted ? sort.direction : 'none') : undefined}
                    className={cx(styles.headerCell, (col.align === 'end' || col.numeric) && styles.end)}
                  >
                    {col.sortable ? (
                      <AriaButton
                        className={cx(styles.sortButton, isSorted && styles.sorted)}
                        onPress={() => toggleSort(col.key)}
                      >
                        {col.header}
                        <SortIcon size={16} className={styles.sortIcon} aria-hidden="true" />
                      </AriaButton>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </ScrollRegion>
      {footer}
    </div>
  );
}

/**
 * Horizontal scroller for wide tables. When it actually scrolls it becomes a named, focusable region so
 * keyboard users can scroll it with the arrow keys (WCAG 2.1.1); otherwise it adds no tab stop.
 */
function ScrollRegion({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={styles.scroll}
      {...(scrolls ? { tabIndex: 0, role: 'region', 'aria-label': `${label} (scrolls sideways)` } : {})}
    >
      {children}
    </div>
  );
}
