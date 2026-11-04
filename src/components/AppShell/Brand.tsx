import { cx } from '../../utils/cx';
import logo from './via-logo.svg?raw';
import styles from './AppShell.module.css';

export interface BrandProps {
  /** Accessible name. Pass "" when the logo sits inside a link that already has a name. */
  label?: string;
  /** Height in px; width follows the artwork. */
  height?: number;
  /** `mark`: the symbol only, for very narrow headers. */
  variant?: 'wordmark' | 'mark';
  className?: string;
}

// The artwork is 100 × 34.8; the symbol is its first 35 units.
const WIDTH = 100, HEIGHT = 34.8, MARK = 35;
const mark = logo.replace(`viewBox="0 0 ${WIDTH} ${HEIGHT}"`, `viewBox="0 0 ${MARK} ${HEIGHT}"`);

/**
 * The via logo: the default in AppHeader until an app passes its own `logo`.
 * Drawn with currentColor and two custom properties (--via-logo-accent, --via-logo-surface),
 * so it follows the theme.
 */
export function Brand({ label = 'via', height = 28, variant = 'wordmark', className }: BrandProps) {
  const width = ((variant === 'mark' ? MARK : WIDTH) / HEIGHT) * height;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cx(styles.brand, className)}
      style={{ width, height }}
      dangerouslySetInnerHTML={{ __html: variant === 'mark' ? mark : logo }}
    />
  );
}
