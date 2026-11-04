import type { ReactElement } from 'react';
import { Tooltip as AriaTooltip, TooltipTrigger } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** Short label, or the title when `description` is set. */
  content: string;
  /** Longer explanation (Overlay / Tooltip / Description). */
  description?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * A single focusable via design system element (Button, Link) or a react-aria-components element.
   * Never put interactive content inside the tooltip itself.
   */
  children: ReactElement;
}

/**
 * Supplementary label for a control (Overlay / Tooltip / Label, Description).
 * Shows after 300 ms on hover and immediately on keyboard focus; Esc hides it. Linked with aria-describedby.
 */
export function Tooltip({ content, description, side = 'top', children }: TooltipProps) {
  return (
    <TooltipTrigger delay={300} closeDelay={100}>
      {children}
      <AriaTooltip placement={side} offset={6} className={cx(styles.tooltip, description && styles.withDescription)}>
        {description ? (
          <>
            <strong className={styles.title}>{content}</strong>
            <span>{description}</span>
          </>
        ) : (
          content
        )}
      </AriaTooltip>
    </TooltipTrigger>
  );
}
