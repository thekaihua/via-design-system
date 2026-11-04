import { useEffect, useRef, type ReactNode } from 'react';
import { Dialog as AriaDialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { cx } from '../../utils/cx';
import o from '../Overlay/Overlay.module.css';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  /** Form fields or other content between the description and the actions. */
  children?: ReactNode;
  /** Usually a ButtonGroup: Cancel then the primary or destructive action. */
  actions: ReactNode;
  /** 560 px (sm) or 720 px (md) wide; full width minus 16 px under 768 px. */
  size?: 'sm' | 'md';
  /**
   * Allow Esc and a scrim click to close. Turn off for decisions that must be answered. There's no × button
   * (Overlay / Dialog): every dialog has a Cancel or Close action of its own.
   */
  dismissible?: boolean;
  /** `alertdialog` for confirmations and warnings that need an answer. */
  role?: 'dialog' | 'alertdialog';
  /**
   * Confirms a destructive action (Behaviour spec: "Destructive dialogs initially focus Cancel").
   * Focus starts on the first action, so put Cancel first. Implies `role="alertdialog"`.
   */
  destructive?: boolean;
}

/**
 * Modal dialog (Overlay / Dialog). Traps focus, makes the page inert and returns focus to the opener.
 * Focus starts on the first field, on Cancel for `destructive` dialogs, or on the dialog itself.
 * Only the message and fields scroll on short screens; the title and actions stay visible.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'sm',
  dismissible = true,
  role = 'dialog',
  destructive = false,
}: DialogProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const target = destructive
        ? actionsRef.current?.querySelector<HTMLElement>('button')
        : bodyRef.current?.querySelector<HTMLElement>('input:not([type=hidden]), textarea, select');
      target?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, destructive]);

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      isDismissable={dismissible}
      isKeyboardDismissDisabled={!dismissible}
      className={cx(o.scrim, styles.overlay)}
    >
      <Modal className={cx(styles.modal, size === 'md' && styles.md)}>
        <AriaDialog role={destructive ? 'alertdialog' : role} className={styles.dialog}>
          <div className={styles.header}>
            <Heading slot="title" className={cx(o.heading, styles.title)}>
              {title}
            </Heading>
          </div>
          <div className={styles.content}>
            {description && <div className={styles.description}>{description}</div>}
            {children && (
              <div ref={bodyRef} className={styles.body}>
                {children}
              </div>
            )}
          </div>
          <div ref={actionsRef} className={styles.actions}>
            {actions}
          </div>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
