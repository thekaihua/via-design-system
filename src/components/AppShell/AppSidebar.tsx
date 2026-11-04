import { Building2, Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { Button as AriaButton, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';
import { cx } from '../../utils/cx';
import menu from '../OverflowMenu/OverflowMenu.module.css';
import { useShell } from './AppShell';
import { NavList, type NavItem } from './SideNav';
import styles from './AppShell.module.css';

export interface Workspace {
  id: string;
  name: string;
  /** e.g. "Sandbox workspace", "Admin console". */
  context?: string;
  icon?: LucideIcon;
}

export interface AppSidebarProps {
  workspace: Workspace;
  /** Other workspaces the user can switch to. Without them the switcher is a plain label. */
  workspaces?: Workspace[];
  onWorkspaceChange?: (id: string) => void;
  items: NavItem[];
  /** Pinned to the bottom (Settings, documentation). */
  secondaryItems?: NavItem[];
  /** id of the current page's item. */
  active?: string;
  /** Small caption at the very bottom. */
  caption?: string;
  /** Names the navigation landmark. */
  'aria-label'?: string;
}

/** Workspace name with an optional menu to switch (Navigation / Workspace switcher). */
function WorkspaceSwitcher({ workspace, workspaces, onWorkspaceChange, rail }: Pick<AppSidebarProps, 'workspace' | 'workspaces' | 'onWorkspaceChange'> & { rail: boolean }) {
  const Icon = workspace.icon ?? Building2;
  const body = (
    <>
      <Icon size={20} className={styles.workspaceIcon} aria-hidden="true" />
      <span className={rail ? 'via-visually-hidden' : styles.workspaceText}>
        <span className={styles.workspaceName}>{workspace.name}</span>
        {workspace.context && <span className={styles.workspaceContext}>{workspace.context}</span>}
      </span>
    </>
  );
  if (!workspaces?.length) return <div className={styles.workspace}>{body}</div>;
  return (
    <MenuTrigger>
      <AriaButton className={cx(styles.workspace, styles.workspaceButton)}>
        {body}
        <span className="via-visually-hidden">switch workspace</span>
        {!rail && <ChevronDown size={16} className={styles.navChevron} aria-hidden="true" />}
      </AriaButton>
      <Popover placement="bottom start" offset={4} className={menu.popover}>
        <Menu
          className={menu.menu}
          selectionMode="single"
          selectedKeys={[workspace.id]}
          onAction={(key) => onWorkspaceChange?.(String(key))}
        >
          {workspaces.map((w) => (
            <MenuItem key={w.id} id={w.id} textValue={w.name} className={menu.item}>
              {({ isSelected }) => (
                <>
                  <span className={menu.label}>
                    {w.name}
                    {w.context && <span className={styles.menuContext}>{w.context}</span>}
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

/**
 * Side navigation (Application / Sidebar / Full-page, Admin).
 * ≥ 1024 px: 248 px with labels. 768–1023 px: 72 px icon rail with tooltips. Under 768 px: shown in a drawer.
 */
export function AppSidebar({
  workspace,
  workspaces,
  onWorkspaceChange,
  items,
  secondaryItems = [],
  active,
  caption,
  'aria-label': ariaLabel = 'Main',
}: AppSidebarProps) {
  const { size } = useShell();
  const rail = size === 'tablet';
  return (
    <nav aria-label={ariaLabel} className={cx(styles.sidebar, rail && styles.rail)}>
      <WorkspaceSwitcher workspace={workspace} workspaces={workspaces} onWorkspaceChange={onWorkspaceChange} rail={rail} />
      <NavList items={items} activeId={active} rail={rail} />
      <div className={styles.spacer} />
      {secondaryItems.length > 0 && <NavList items={secondaryItems} activeId={active} rail={rail} />}
      {caption && !rail && <p className={styles.caption}>{caption}</p>}
    </nav>
  );
}
