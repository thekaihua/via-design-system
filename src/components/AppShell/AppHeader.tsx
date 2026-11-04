import { Bell, Check, ChevronDown, Circle, CircleCheck, Menu as MenuIcon, Search, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button as AriaButton, Link as AriaLink, Menu, MenuItem, MenuTrigger, Popover, Separator } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { Badge } from '../Badge/Badge';
import { Link } from '../Link/Link';
import menu from '../OverflowMenu/OverflowMenu.module.css';
import { useShell } from './AppShell';
import { Brand } from './Brand';
import styles from './AppShell.module.css';

export type Environment = 'sandbox' | 'live';

export interface EnvironmentControlProps {
  environment: Environment;
  onChange?: (environment: Environment) => void;
}

/**
 * Sandbox / Live switch (Navigation / Environment control). Live uses the positive tone so the
 * two are never confused; the state is always in text.
 */
export function EnvironmentControl({ environment, onChange }: EnvironmentControlProps) {
  const live = environment === 'live';
  const Icon = live ? CircleCheck : Circle;
  return (
    <MenuTrigger>
      <AriaButton className={cx(styles.environment, live && styles.environmentLive)}>
        <Icon size={12} aria-hidden="true" />
        <span>{live ? 'Live' : 'Sandbox'}</span>
        <span className="via-visually-hidden">environment</span>
        <ChevronDown size={16} aria-hidden="true" />
      </AriaButton>
      <Popover placement="bottom end" offset={4} className={menu.popover}>
        <Menu className={menu.menu} selectionMode="single" selectedKeys={[environment]} onAction={(k) => onChange?.(k as Environment)}>
          {(
            [
              ['sandbox', 'Sandbox', 'Test with sample data'],
              ['live', 'Live', 'Real payments'],
            ] as const
          ).map(([id, label, hint]) => (
            <MenuItem key={id} id={id} textValue={label} className={menu.item}>
              {({ isSelected }) => (
                <>
                  <span className={menu.label}>
                    {label}
                    <span className={styles.menuContext}>{hint}</span>
                  </span>
                  {isSelected && <Check size={16} aria-hidden="true" />}
                </>
              )}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

export interface AccountMenuItem {
  label: string;
  onSelect?: () => void;
  href?: string;
}

export interface AppHeaderProps {
  /** Where the logo links. */
  homeHref?: string;
  /** Your product's name: names the home link ("Acme Pay home"). */
  productName?: string;
  /**
   * Your logo. Pass an element, or a function that gets `narrow` (under 480 px, where only a mark fits).
   * Defaults to the via logo.
   */
  logo?: ReactNode | ((narrow: boolean) => ReactNode);
  /** `admin` swaps the environment control for an "Admin" badge (Application / Header / Admin). */
  role?: 'customer' | 'admin';
  /** Search field shown at 768 px and up, usually a SearchField that opens CommandSearch. */
  search?: ReactNode;
  /** Under 768 px a search icon replaces the field; it calls this (e.g. to open CommandSearch). */
  onSearch?: () => void;
  environment?: Environment;
  onEnvironmentChange?: (environment: Environment) => void;
  docsHref?: string;
  onNotifications?: () => void;
  /** Unread count, announced in the button's name. */
  notificationCount?: number;
  user: { name: string; initials?: string };
  accountItems?: AccountMenuItem[];
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/**
 * Top bar (Application / Header, Header / Admin): brand, search, environment, documentation,
 * notifications and account. Under 768 px it shows a menu button that opens the navigation drawer.
 */
export function AppHeader({
  homeHref = '/',
  productName = 'via',
  logo,
  role = 'customer',
  search,
  onSearch,
  environment = 'sandbox',
  onEnvironmentChange,
  docsHref,
  onNotifications,
  notificationCount = 0,
  user,
  accountItems = [{ label: 'Profile' }, { label: 'Sign out' }],
}: AppHeaderProps) {
  const { size, drawerOpen, setDrawerOpen } = useShell();
  const mobile = size === 'mobile';
  // Under 480 px the row can't hold everything (Reflow at 320 px): the brand becomes the mark and
  // notifications move into the account menu. Sandbox / Live always stays visible.
  const narrow = useMediaQuery('(max-width: 479px)');
  const notificationsLabel = notificationCount ? `Notifications, ${notificationCount} unread` : 'Notifications';
  const items: AccountMenuItem[] = narrow && onNotifications ? [{ label: notificationsLabel, onSelect: onNotifications }, ...accountItems] : accountItems;
  return (
    <header className={cx(styles.header, narrow && styles.headerNarrow)}>
      <div className={styles.headerStart}>
        {mobile && (
          <AriaButton className={styles.iconButton} aria-label="Open navigation" aria-expanded={drawerOpen} onPress={() => setDrawerOpen(true)}>
            <MenuIcon size={20} aria-hidden="true" />
          </AriaButton>
        )}
        <AriaLink href={homeHref} className={styles.brandLink} aria-label={`${productName} home`}>
          {typeof logo === 'function' ? logo(narrow) : (logo ?? <Brand height={28} variant={narrow ? 'mark' : 'wordmark'} label="" />)}
        </AriaLink>
      </div>
      {!mobile && search && <div className={styles.headerSearch}>{search}</div>}
      <div className={styles.headerUtilities}>
        {role === 'admin' ? (
          <Badge tone="neutral" icon={ShieldCheck}>
            Admin
          </Badge>
        ) : (
          <EnvironmentControl environment={environment} onChange={onEnvironmentChange} />
        )}
        {mobile && onSearch && (
          <AriaButton className={styles.iconButton} aria-label="Search" aria-keyshortcuts="Meta+K" onPress={onSearch}>
            <Search size={20} aria-hidden="true" />
          </AriaButton>
        )}
        {!mobile && docsHref && <Link href={docsHref}>Documentation</Link>}
        {onNotifications && !narrow && (
          <AriaButton
            className={styles.iconButton}
            aria-label={notificationsLabel}
            onPress={onNotifications}
          >
            <Bell size={20} aria-hidden="true" />
            {notificationCount > 0 && <span className={styles.dot} aria-hidden="true" />}
          </AriaButton>
        )}
        <MenuTrigger>
          <AriaButton className={styles.account}>
            <span className={styles.avatar} aria-hidden="true">
              {user.initials ?? initialsOf(user.name)}
            </span>
            <span className={mobile ? 'via-visually-hidden' : styles.accountName}>{user.name}</span>
            <span className="via-visually-hidden">account menu{narrow && notificationCount ? `, ${notificationCount} unread notifications` : ''}</span>
            {narrow && notificationCount > 0 && <span className={styles.dot} aria-hidden="true" />}
            {!narrow && <ChevronDown size={16} className={styles.navChevron} aria-hidden="true" />}
          </AriaButton>
          <Popover placement="bottom end" offset={4} className={menu.popover}>
            <Menu className={menu.menu}>
              {items.map((item, i) => [
                i === items.length - 1 && items.length > 1 ? <Separator key={`sep-${i}`} className={menu.separator} /> : null,
                <MenuItem key={item.label} id={item.label} href={item.href} onAction={item.onSelect} className={menu.item}>
                  <span className={menu.label}>{item.label}</span>
                </MenuItem>,
              ])}
            </Menu>
          </Popover>
        </MenuTrigger>
      </div>
    </header>
  );
}
