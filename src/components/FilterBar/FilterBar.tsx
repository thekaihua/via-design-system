import { Check, CirclePlus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  type Key,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './FilterBar.module.css';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterChipProps {
  label: string;
  value?: string | null;
  options: FilterOption[];
  onChange: (value: string | null) => void;
  className?: string;
}

/**
 * One filter (Chip / Filter, Chip / Filter / Applied). Opens a list of values; an applied chip shows
 * the value and a remove button.
 */
export function FilterChip({ label, value, options, onChange, className }: FilterChipProps) {
  const applied = options.find((o) => o.value === value);
  return (
    <div className={cx(styles.chip, applied && styles.applied, className)}>
      <AriaSelect
        // The name starts with the visible text (WCAG 2.5.3): "Assignee Unassigned, filter".
        aria-label={applied ? `${label} ${applied.label}, filter` : `${label} filter`}
        value={(value ?? null) as Key | null}
        onChange={(k) => onChange(k === null ? null : String(k))}
        className={styles.select}
      >
        <AriaButton className={styles.trigger}>
          {applied ? (
            <>
              <span className={styles.label}>{label}</span>{' '}
              <span className={styles.value}>{applied.label}</span>
            </>
          ) : (
            <>
              <CirclePlus size={14} className={styles.addIcon} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </>
          )}
        </AriaButton>
        <Popover className={styles.popover} offset={4} placement="bottom start">
          <ListBox className={styles.listbox} items={options.map((o) => ({ ...o, id: o.value }))}>
            {(o) => (
              <ListBoxItem id={o.value} textValue={o.label} className={styles.option}>
                {({ isSelected }) => (
                  <>
                    <span className={styles.optionLabel}>{o.label}</span>
                    {isSelected && <Check size={16} aria-hidden="true" />}
                  </>
                )}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </AriaSelect>
      {applied && (
        <AriaButton className={styles.remove} aria-label={`Remove ${label} filter`} onPress={() => onChange(null)}>
          <X size={14} aria-hidden="true" />
        </AriaButton>
      )}
    </div>
  );
}

export interface FilterDefinition {
  id: string;
  label: string;
  value?: string | null;
  options: FilterOption[];
}

export interface FilterBarProps {
  filters: FilterDefinition[];
  onChange: (id: string, value: string | null) => void;
  /** Shown once any filter is applied. */
  onClearAll?: () => void;
  /** Usually a small SearchField, placed first. */
  search?: ReactNode;
  /** Placed at the end, e.g. Export. */
  actions?: ReactNode;
  className?: string;
}

/** Search, filter chips and actions above a list (Data / Filter bar). Chips wrap on narrow screens. */
export function FilterBar({ filters, onChange, onClearAll, search, actions, className }: FilterBarProps) {
  const anyApplied = filters.some((f) => f.value != null);
  return (
    <div className={cx(styles.bar, className)} role="group" aria-label="Filters">
      {search && <div className={styles.search}>{search}</div>}
      {filters.map((f) => (
        <FilterChip key={f.id} label={f.label} value={f.value} options={f.options} onChange={(v) => onChange(f.id, v)} />
      ))}
      {anyApplied && onClearAll && (
        <AriaButton className={styles.clearAll} onPress={onClearAll}>
          Clear filters
        </AriaButton>
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
