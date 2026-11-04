import { cx } from '../../utils/cx';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  /** 16 px (sm) or 32 px (lg). */
  size?: 'sm' | 'lg';
  /** Announced to screen readers. Pass `null` when a parent already announces loading (e.g. a pending Button). */
  label?: string | null;
  /** Use the surrounding text colour instead of the action colour. */
  inheritColor?: boolean;
  className?: string;
}

const dims = { sm: { box: 16, stroke: 2 }, lg: { box: 32, stroke: 3.5 } };

/** Indeterminate loading indicator (Feedback / Spinner masters). */
export function Spinner({ size = 'sm', label = 'Loading', inheritColor, className }: SpinnerProps) {
  const { box, stroke } = dims[size];
  const r = (box - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const arc = (100 / 360) * circumference; // 100° arc, as in the design
  return (
    <span
      className={cx(styles.spinner, inheritColor && styles.inherit, className)}
      role={label ? 'status' : undefined}
    >
      <svg className={styles.svg} width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <circle className={styles.track} cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className={styles.arc}
          cx={box / 2}
          cy={box / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${circumference}`}
        />
      </svg>
      {label && <span className="via-visually-hidden">{label}</span>}
    </span>
  );
}
