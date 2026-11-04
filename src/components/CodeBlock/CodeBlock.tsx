import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { ToggleButton } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { CopyButton } from '../CopyButton/CopyButton';
import copyStyles from '../CopyButton/CopyButton.module.css';
import styles from './CodeBlock.module.css';

export interface CodeBlockProps {
  code: string;
  /** Shown in the header, e.g. "cURL", "Node.js". */
  language?: string;
  showLineNumbers?: boolean;
  onCopy?: () => void;
  className?: string;
}

/**
 * Read-only code sample with a copy button (Content / Code block).
 * The code area scrolls horizontally and can be focused for keyboard scrolling.
 */
export function CodeBlock({ code, language, showLineNumbers = true, onCopy, className }: CodeBlockProps) {
  const lines = code.replace(/\n$/, '').split('\n');
  const name = language ? `${language} code` : 'Code';
  return (
    <figure className={cx(styles.block, className)}>
      <div className={styles.header}>
        <figcaption className={styles.language}>{language ?? 'Code'}</figcaption>
        <CopyButton value={code} label={name} showText onCopy={onCopy} />
      </div>
      <pre className={styles.pre} tabIndex={0} aria-label={name}>
        <code className={styles.code}>
          {lines.map((line, i) => (
            <span key={i} className={styles.line}>
              {showLineNumbers && (
                <span className={styles.number} aria-hidden="true">
                  {i + 1}
                </span>
              )}
              <span>{line || ' '}</span>
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

export interface CopyableValueProps {
  label: string;
  value: string;
  /** Hide the value (e.g. secret keys) until revealed. Copy always copies the full value. */
  masked?: boolean;
  /** e.g. "Created 12 Oct 2026 · last used 2 hours ago". */
  description?: string;
  onCopy?: () => void;
  className?: string;
}

/** Keeps a recognisable prefix and the last 3 characters: sk_test_••••••••a9Q */
function mask(value: string) {
  const prefix = value.match(/^([a-z]+_(?:test_|live_)?)/i)?.[1] ?? value.slice(0, 3);
  return `${prefix}${'•'.repeat(16)}${value.slice(-3)}`;
}

/** A key or ID people copy, with optional reveal (Content / Copyable value). */
export function CopyableValue({ label, value, masked, description, onCopy, className }: CopyableValueProps) {
  const [revealed, setRevealed] = useState(false);
  const id = useId();
  const hidden = masked && !revealed;
  return (
    <div className={cx(styles.copyable, className)} role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className={styles.valueLabel}>
        {label}
      </span>
      <div className={styles.valueControl}>
        <code className={styles.value} aria-describedby={description ? `${id}-desc` : undefined}>
          {hidden ? (
            <>
              <span aria-hidden="true">{mask(value)}</span>
              <span className="via-visually-hidden">Hidden. Ends in {value.slice(-3)}</span>
            </>
          ) : (
            value
          )}
        </code>
        {masked && (
          <ToggleButton
            className={copyStyles.button}
            isSelected={revealed}
            onChange={setRevealed}
            aria-label={`Show ${label}`}
          >
            {revealed ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </ToggleButton>
        )}
        <CopyButton value={value} label={label} onCopy={onCopy} />
      </div>
      {description && (
        <span id={`${id}-desc`} className={styles.valueDescription}>
          {description}
        </span>
      )}
    </div>
  );
}
