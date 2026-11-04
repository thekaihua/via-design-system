import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Link } from '../Link/Link';
import styles from './Layout.module.css';

export interface ContentPanelProps {
  title?: string;
  description?: string;
  /** Controls at the end of the header, e.g. a link or button. */
  actions?: ReactNode;
  children?: ReactNode;
  headingLevel?: 2 | 3;
  /** Element to render. Use `section` (default) when it has a title, `div` for a plain surface. */
  as?: 'section' | 'div';
  className?: string;
}

/** Surface for one group of related content (Layout / Content panel). */
export function ContentPanel({ title, description, actions, children, headingLevel = 2, as = 'section', className }: ContentPanelProps) {
  const Heading = `h${headingLevel}` as const;
  const headingId = useId();
  const Root = as;
  return (
    <Root className={cx(styles.panel, className)} aria-labelledby={title && as === 'section' ? headingId : undefined}>
      {(title || actions) && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && (
              <Heading id={headingId} className={styles.title}>
                {title}
              </Heading>
            )}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {children}
    </Root>
  );
}

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Divides content into meaningful parts for screen readers. Off by default: most dividers are visual. */
  semantic?: boolean;
  className?: string;
}

/** 1 px rule (Layout / Divider, Layout / Divider / Vertical). */
export function Divider({ orientation = 'horizontal', semantic = false, className }: DividerProps) {
  return (
    <div
      className={cx(styles.divider, orientation === 'vertical' && styles.vertical, className)}
      role={semantic ? 'separator' : undefined}
      aria-orientation={semantic && orientation === 'vertical' ? 'vertical' : undefined}
      aria-hidden={semantic ? undefined : true}
    />
  );
}

export interface SupportingResourcesProps {
  links: { label: string; href: string; external?: boolean }[];
  /** Names the navigation landmark. */
  label?: string;
  className?: string;
}

/** Row of help links at the end of a page (Navigation / Supporting resources). */
export function SupportingResources({ links, label = 'Supporting resources', className }: SupportingResourcesProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className={styles.resources}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} external={l.external}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
