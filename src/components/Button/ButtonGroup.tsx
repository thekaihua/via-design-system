import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface ButtonGroupProps {
  /** Alignment of the buttons. Dialog and form actions sit at the end. */
  align?: 'start' | 'end';
  /** Names the group for screen readers when the context isn't obvious. */
  'aria-label'?: string;
  className?: string;
  children: ReactNode;
}

/** Lays out related buttons 8 px apart (Button / Group master). Put the primary action last. */
export function ButtonGroup({ align = 'end', className, children, ...rest }: ButtonGroupProps) {
  return (
    <div
      role="group"
      {...rest}
      className={cx(className)}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--via-space-small)',
        justifyContent: align === 'end' ? 'flex-end' : 'flex-start',
      }}
    >
      {children}
    </div>
  );
}
