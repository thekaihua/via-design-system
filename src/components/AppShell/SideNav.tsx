import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Button as AriaButton, Link as AriaLink } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './AppShell.module.css';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  /** Small count or status after the label, e.g. "3". */
  badge?: ReactNode;
  /** Sub-destinations shown in a disclosure (Navigation / Developer group). */
  children?: Omit<NavItem, 'children'>[];
}

interface ItemProps {
  item: Omit<NavItem, 'children'>;
  active: boolean;
  /** Icon rail: label hidden visually and shown as a tooltip. */
  rail?: boolean;
  nested?: boolean;
}

/** One destination (Navigation / Side item). The current page gets aria-current="page". */
export function SideNavItem({ item, active, rail, nested }: ItemProps) {
  const Icon = item.icon;
  const link = (
    <AriaLink
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cx(styles.navItem, active && styles.navItemActive, nested && styles.navItemNested)}
    >
      <Icon size={20} className={styles.navIcon} aria-hidden="true" />
      <span className={rail ? 'via-visually-hidden' : styles.navLabel}>{item.label}</span>
      {item.badge && !rail && <span className={styles.navBadge}>{item.badge}</span>}
    </AriaLink>
  );
  return rail ? (
    <Tooltip content={item.label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

interface GroupProps {
  item: NavItem;
  activeId?: string;
  rail?: boolean;
}

/** A destination with sub-pages behind a disclosure (Navigation / Developer disclosure, Developer group). */
export function NavGroup({ item, activeId, rail }: GroupProps) {
  const children = item.children ?? [];
  const containsActive = children.some((c) => c.id === activeId);
  const [open, setOpen] = useState(containsActive);
  const id = useId();
  const Icon = item.icon;

  // In the icon rail the group collapses to its first page.
  if (rail) {
    return <SideNavItem item={{ ...item, href: children[0]?.href ?? item.href }} active={containsActive || activeId === item.id} rail />;
  }

  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <div className={styles.navGroup}>
      <AriaButton
        className={cx(styles.navItem, styles.navDisclosure, containsActive && !open && styles.navItemActive)}
        aria-expanded={open}
        aria-controls={id}
        onPress={() => setOpen((o) => !o)}
      >
        <Icon size={20} className={styles.navIcon} aria-hidden="true" />
        <span className={styles.navLabel}>{item.label}</span>
        <Chevron size={16} className={styles.navChevron} aria-hidden="true" />
      </AriaButton>
      <ul id={id} hidden={!open} className={styles.navChildren}>
        {children.map((c) => (
          <li key={c.id}>
            <SideNavItem item={c} active={c.id === activeId} nested />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NavList({ items, activeId, rail }: { items: NavItem[]; activeId?: string; rail?: boolean }) {
  return (
    <ul className={styles.navList}>
      {items.map((item) => (
        <li key={item.id}>
          {item.children?.length ? (
            <NavGroup item={item} activeId={activeId} rail={rail} />
          ) : (
            <SideNavItem item={item} active={item.id === activeId} rail={rail} />
          )}
        </li>
      ))}
    </ul>
  );
}
