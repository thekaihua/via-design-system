import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './CopyButton.module.css';

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers or contexts without the async clipboard API.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export interface CopyButtonProps {
  /** Text put on the clipboard. */
  value: string;
  /** What is copied, for the accessible name: "Copy {label}". */
  label: string;
  /** Show "Copy" text next to the icon (Code block header). Icon-only by default. */
  showText?: boolean;
  onCopy?: () => void;
  className?: string;
}

/** Copies a value and announces "Copied" politely. The icon turns into a check for 2 seconds. */
export function CopyButton({ value, label, showText, onCopy, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    if (await writeClipboard(value)) {
      setCopied(true);
      onCopy?.();
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const Icon = copied ? Check : Copy;
  return (
    <>
      <AriaButton
        className={cx(styles.button, showText && styles.withText, className)}
        aria-label={showText ? undefined : `Copy ${label}`}
        onPress={copy}
      >
        <Icon size={showText ? 14 : 16} aria-hidden="true" />
        {showText && (
          <span>
            {copied ? 'Copied' : 'Copy'}
            <span className="via-visually-hidden"> {label}</span>
          </span>
        )}
      </AriaButton>
      <span className="via-visually-hidden" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </>
  );
}
