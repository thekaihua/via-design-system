import type { ReactNode } from 'react';
import { Tab, TabList, TabPanel, Tabs as AriaTabs, type Key } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  /** Panel content. Omit it to render the selected view yourself (e.g. below a page header); an empty panel is kept for aria-controls. */
  content?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Names the tab list for screen readers, e.g. "Developer sections". */
  'aria-label': string;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** 44 px (md) or 36 px (sm) tall. */
  size?: 'sm' | 'md';
  /** `page` adds the full-width divider used under page headers (Navigation / Page tabs). */
  variant?: 'inline' | 'page';
  className?: string;
}

/**
 * Tabs (Navigation / Tab item, Navigation / Page tabs).
 * ←/→ move focus, Home/End jump, Enter/Space select (manual activation). Only the selected tab is in the Tab order.
 */
export function Tabs({ items, value, defaultValue, onChange, size = 'md', variant = 'inline', className, ...rest }: TabsProps) {
  return (
    <AriaTabs
      selectedKey={value as Key | undefined}
      defaultSelectedKey={(defaultValue ?? items.find((i) => !i.disabled)?.id) as Key | undefined}
      onSelectionChange={(k) => onChange?.(String(k))}
      disabledKeys={items.filter((i) => i.disabled).map((i) => i.id)}
      keyboardActivation="manual"
      className={cx(styles.tabs, className)}
    >
      <TabList aria-label={rest['aria-label']} className={cx(styles.list, variant === 'page' && styles.page)}>
        {items.map((item) => (
          <Tab key={item.id} id={item.id} className={cx(styles.tab, size === 'sm' && styles.sm)}>
            {/* data-label reserves the bold width so selecting a tab doesn't shift the row. */}
            <span className={styles.label} data-label={item.label}>
              {item.label}
            </span>
          </Tab>
        ))}
      </TabList>
      {/* Panels always render so each tab's aria-controls points at a real element. */}
      {items.map((item) => (
        <TabPanel key={item.id} id={item.id} className={item.content !== undefined ? styles.panel : styles.emptyPanel}>
          {item.content}
        </TabPanel>
      ))}
    </AriaTabs>
  );
}
