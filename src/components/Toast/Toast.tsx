import { CircleCheck, CircleX, Info, X, type LucideIcon } from 'lucide-react';
import {
  Button as AriaButton,
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Toast.module.css';

/*
 * Built on React Aria's toast (still marked UNSTABLE upstream). It's wrapped here so
 * an upstream API change only touches this file.
 */

export type ToastTone = 'success' | 'info' | 'error';

interface ToastContentValue {
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

export interface ToastOptions {
  tone?: ToastTone;
  /** One short action, e.g. Undo. Toasts with an action should stay a little longer. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it closes. Paused while hovered or focused. Default 6000. */
  duration?: number;
  onClose?: () => void;
}

/** App-wide queue: at most 3 toasts on screen. */
export const toastQueue = new ToastQueue<ToastContentValue>({ maxVisibleToasts: 3 });

/** Shows a toast, e.g. `toast('API key created')`. Returns its key, for `toastQueue.close(key)`. */
export function toast(message: string, { tone = 'success', action, duration = 6000, onClose }: ToastOptions = {}) {
  return toastQueue.add({ message, tone, action }, { timeout: duration, onClose });
}

const icons: Record<ToastTone, LucideIcon> = { success: CircleCheck, info: Info, error: CircleX };

/**
 * Renders the toast stack (Feedback / Toast). Place once near the app root.
 * A labelled landmark (F6 moves to it); each toast is announced politely.
 */
export function ToastRegion() {
  return (
    <AriaToastRegion queue={toastQueue} className={styles.region} aria-label="Notifications">
      {({ toast: t }) => {
        const Icon = icons[t.content.tone];
        return (
          <AriaToast toast={t} className={styles.toast}>
            <Icon className={cx(styles.icon, styles[t.content.tone])} size={20} aria-hidden="true" />
            <ToastContent className={styles.content}>
              <Text slot="title" className={styles.message}>
                {t.content.message}
              </Text>
            </ToastContent>
            {t.content.action && (
              <AriaButton
                className={styles.action}
                onPress={() => {
                  t.content.action?.onClick();
                  toastQueue.close(t.key);
                }}
              >
                {t.content.action.label}
              </AriaButton>
            )}
            <AriaButton slot="close" className={styles.close} aria-label="Dismiss">
              <X size={18} aria-hidden="true" />
            </AriaButton>
          </AriaToast>
        );
      }}
    </AriaToastRegion>
  );
}
