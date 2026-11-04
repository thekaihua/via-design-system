import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link as AriaLink } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './ListItem.module.css';

export interface ListItemProps {
  title: string;
  description?: ReactNode;
  /** Time or short status at the end, e.g. "2 min ago". */
  meta?: ReactNode;
  icon?: LucideIcon;
  /** Makes the whole row a link to the item's detail. */
  href?: string;
}

/** A row in a short list of events, resources or results (Content / List item). Renders an <li>. */
export function ListItem({ title, description, meta, icon: Icon, href }: ListItemProps) {
  const body = (
    <>
      {Icon && (
        <span className={styles.iconFrame} aria-hidden="true">
          <Icon size={16} />
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      {meta && <span className={styles.meta}>{meta}</span>}
      {href && <ChevronRight size={16} className={styles.chevron} aria-hidden="true" />}
    </>
  );
  return (
    <li className={styles.item}>
      {href ? (
        <AriaLink href={href} className={cx(styles.row, styles.link)}>
          {body}
        </AriaLink>
      ) : (
        <div className={styles.row}>{body}</div>
      )}
    </li>
  );
}

/** List of ListItems. Give it a name when the page has more than one list. */
export function ItemList({ children, label, className }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <ul className={cx(styles.list, className)} aria-label={label}>
      {children}
    </ul>
  );
}
