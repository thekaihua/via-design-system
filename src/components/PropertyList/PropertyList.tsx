import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { CopyButton } from '../CopyButton/CopyButton';
import styles from './PropertyList.module.css';

export interface PropertyItem {
  label: string;
  value: ReactNode;
  /** Text to copy; shows a copy button. */
  copyable?: string;
  /** Monospace value, for IDs and keys. */
  mono?: boolean;
}

export interface PropertyListProps {
  items: PropertyItem[];
  /** `inline`: label and value on one row (Data / Property). `stacked`: label above value in a grid (Property / Stacked). */
  layout?: 'inline' | 'stacked';
  className?: string;
}

/** Label–value pairs as a description list (Data / Property list). */
export function PropertyList({ items, layout = 'inline', className }: PropertyListProps) {
  return (
    <dl className={cx(styles.list, styles[layout], className)}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={cx(styles.value, item.mono && styles.mono)}>
            <span className={styles.valueText}>{item.value}</span>
            {item.copyable && <CopyButton value={item.copyable} label={item.label} />}
          </dd>
        </div>
      ))}
    </dl>
  );
}
