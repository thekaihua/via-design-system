import { createContext, useContext, useState, type ReactNode } from 'react';
import { Dialog as AriaDialog, Modal, ModalOverlay } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { useShellSize, type ShellSize } from '../../utils/useMediaQuery';
import o from '../Overlay/Overlay.module.css';
import styles from './AppShell.module.css';

interface ShellContextValue {
  size: ShellSize;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const ShellContext = createContext<ShellContextValue>({ size: 'desktop', drawerOpen: false, setDrawerOpen: () => {} });

/** Layout size and mobile drawer state, for the header menu button and the sidebar. */
export const useShell = () => useContext(ShellContext);

export interface AppShellProps {
  /** Usually <AppHeader>. */
  header: ReactNode;
  /** Usually <AppSidebar>. Full 248 px ≥ 1024, 72 px icon rail 768–1023, drawer under 768. */
  sidebar: ReactNode;
  children: ReactNode;
  /** Label of the skip link. */
  skipLabel?: string;
}

/**
 * Application frame: skip link → header → sidebar → main (Behaviour spec focus order).
 * `main` has id="main" and tabIndex=-1 so the skip link can move focus there.
 */
export function AppShell({ header, sidebar, children, skipLabel = 'Skip to main content' }: AppShellProps) {
  const size = useShellSize();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // The drawer only exists on mobile: close it when the size changes (state reset during render, not in an effect).
  const [prevSize, setPrevSize] = useState(size);
  if (size !== prevSize) {
    setPrevSize(size);
    if (size !== 'mobile') setDrawerOpen(false);
  }

  return (
    <ShellContext.Provider value={{ size, drawerOpen, setDrawerOpen }}>
      <div className={cx(styles.shell, styles[size])}>
        <a
          href="#main"
          className={styles.skipLink}
          onClick={(e) => {
            // Move focus explicitly: following a fragment doesn't move focus in every browser.
            const main = document.getElementById('main');
            if (!main) return;
            e.preventDefault();
            main.focus();
            main.scrollIntoView();
          }}
        >
          {skipLabel}
        </a>
        <div className={styles.headerSlot}>{header}</div>
        <div className={styles.body}>
          {size !== 'mobile' && <div className={styles.sidebarSlot}>{sidebar}</div>}
          <main id="main" tabIndex={-1} className={styles.main}>
            {children}
          </main>
        </div>
        {size === 'mobile' && (
          <ModalOverlay isOpen={drawerOpen} onOpenChange={setDrawerOpen} isDismissable className={cx(o.scrim, styles.drawerOverlay)}>
            <Modal className={styles.drawer}>
              <AriaDialog aria-label="Navigation" className={styles.drawerDialog}>
                {sidebar}
              </AriaDialog>
            </Modal>
          </ModalOverlay>
        )}
      </div>
    </ShellContext.Provider>
  );
}
