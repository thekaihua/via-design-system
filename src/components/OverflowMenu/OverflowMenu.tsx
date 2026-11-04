import { Ellipsis, type LucideIcon } from 'lucide-react';
import { Fragment } from 'react';
import {
  Button as AriaButton,
  Header,
  Keyboard,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
  Separator,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './OverflowMenu.module.css';

export interface OverflowMenuItem {
  label: string;
  icon?: LucideIcon;
  /** Shown as a hint only; wire the shortcut up in the app. */
  shortcut?: string;
  /** Red styling for irreversible actions. Usually last, after a separator. */
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export interface OverflowMenuGroup {
  title?: string;
  items: OverflowMenuItem[];
}

export interface OverflowMenuProps {
  /** Accessible name of the "…" trigger, e.g. "Actions for key Production server". */
  label: string;
  /** A flat list. Use `groups` for titled sections; groups are separated by a divider. */
  items?: OverflowMenuItem[];
  groups?: OverflowMenuGroup[];
  className?: string;
}

/**
 * "More actions" menu (Action / Overflow trigger, Menu, Menu item).
 * Enter, Space or ↓ opens on the first item, ↑ on the last; arrows move; type-ahead; Esc closes and returns focus.
 */
export function OverflowMenu({ label, items, groups, className }: OverflowMenuProps) {
  const sections: OverflowMenuGroup[] = groups ?? [{ items: items ?? [] }];
  return (
    <MenuTrigger>
      <AriaButton aria-label={label} className={cx(styles.trigger, className)}>
        <Ellipsis size={20} aria-hidden="true" />
      </AriaButton>
      <Popover placement="bottom end" offset={4} className={styles.popover}>
        <Menu className={styles.menu}>
          {sections.map((section, i) => (
            <Fragment key={section.title ?? i}>
              {i > 0 && <Separator className={styles.separator} />}
              <MenuSection className={styles.section}>
                {section.title && <Header className={styles.groupTitle}>{section.title}</Header>}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <MenuItem
                      key={item.label}
                      id={item.label}
                      textValue={item.label}
                      isDisabled={item.disabled}
                      onAction={item.onSelect}
                      className={cx(styles.item, item.destructive && styles.destructive)}
                    >
                      {Icon && <Icon className={styles.icon} size={16} aria-hidden="true" />}
                      <span className={styles.label}>{item.label}</span>
                      {item.shortcut && <Keyboard className={styles.shortcut}>{item.shortcut}</Keyboard>}
                    </MenuItem>
                  );
                })}
              </MenuSection>
            </Fragment>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
