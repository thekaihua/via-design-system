import { Check } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Stepper.module.css';

export interface StepperProps {
  /** Step names, in order. */
  steps: string[];
  /** Zero-based index of the current step. Earlier steps show as completed. */
  current: number;
  /** Names the list, e.g. "Create service progress". */
  'aria-label'?: string;
  className?: string;
}

/** Progress through a multi-step flow (Navigation / Stepper, Step, Step / Current, Step / Completed). */
export function Stepper({ steps, current, 'aria-label': ariaLabel = 'Progress', className }: StepperProps) {
  return (
    <ol className={cx(styles.stepper, className)} aria-label={ariaLabel}>
      {steps.map((step, i) => {
        const state = i < current ? 'completed' : i === current ? 'current' : 'upcoming';
        return (
          <li key={step} className={cx(styles.step, styles[state])} aria-current={state === 'current' ? 'step' : undefined}>
            <span className={styles.track} aria-hidden="true">
              <span className={cx(styles.connector, i === 0 && styles.hidden)} />
              <span className={styles.indicator}>{state === 'completed' ? <Check size={18} strokeWidth={3} /> : i + 1}</span>
              <span className={cx(styles.connector, styles.trailing, i === steps.length - 1 && styles.hidden)} />
            </span>
            <span className={styles.label}>
              {step}
              <span className="via-visually-hidden">
                {state === 'completed' ? ', completed' : state === 'current' ? ', current step' : ''}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
