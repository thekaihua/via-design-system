import { ExternalLink } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { Link as AriaLink } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Link.module.css';

export interface LinkProps {
  href: string;
  /** Opens in a new tab and adds an icon plus "(opens in new tab)" for screen readers. */
  external?: boolean;
  /** 14 px (md) or 16 px (lg). Ignored when `inline`. */
  size?: 'md' | 'lg';
  /**
   * For links inside a sentence: inherits the text size and is always underlined,
   * so it doesn't rely on colour alone (WCAG 1.4.1). Standalone links underline on hover.
   */
  inline?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  ref?: Ref<HTMLAnchorElement>;
  children: ReactNode;
}

/** Text link (Action / Text link, Action / App link). Use Button for actions that don't navigate. */
export function Link({ href, external, size = 'md', inline, disabled, onClick, className, children, ...rest }: LinkProps) {
  return (
    <AriaLink
      {...rest}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      isDisabled={disabled}
      onPress={onClick}
      className={cx(styles.link, size === 'lg' && styles.lg, inline && styles.inline, className)}
    >
      {children}
      {external && (
        <>
          <ExternalLink className={styles.external} aria-hidden="true" />
          <span className="via-visually-hidden"> (opens in new tab)</span>
        </>
      )}
    </AriaLink>
  );
}
