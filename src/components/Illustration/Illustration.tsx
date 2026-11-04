import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Illustration.module.css';

export type IllustrationName = 'empty' | 'empty-payments' | 'empty-webhooks' | 'no-results' | 'error' | 'success' | 'sign-in';

export interface IllustrationProps {
  name: IllustrationName;
  /** Width in px; height follows the artwork. Spots are 160 × 120, sign-in is 400 × 320. */
  width?: number;
  className?: string;
}

/*
 * Spot illustrations, drawn for this system. Every colour is a token (through classes), so they follow
 * light and dark themes. They are decorative: the text next to them carries the meaning.
 */
const card = (x: number, y: number, w: number, h: number, r = 10) => <rect className={styles.card} x={x} y={y} width={w} height={h} rx={r} />;
const line = (x: number, y: number, w: number, cls = styles.line) => <rect className={cls} x={x} y={y} width={w} height={6} rx={3} />;
const route = (d: string) => <path className={styles.route} d={d} />;
const node = (cx: number, cy: number, r = 5, cls = styles.nodeOpen) => <circle className={cls} cx={cx} cy={cy} r={r} />;

const art: Record<IllustrationName, { viewBox: string; body: ReactNode }> = {
  empty: {
    viewBox: '0 0 160 120',
    body: (
      <>
        <ellipse className={styles.ground} cx="80" cy="104" rx="56" ry="8" />
        <path className={styles.tint} d="M36 54 L80 34 L124 54 L124 92 L36 92 Z" />
        {card(44, 24, 72, 52, 8)}
        {line(54, 36, 40)}
        {line(54, 48, 52)}
        <path className={styles.tray} d="M30 58 H58 L64 70 H96 L102 58 H130 V96 H30 Z" />
        {node(120, 22, 4, styles.nodeAccent)}
        {node(132, 34, 3)}
      </>
    ),
  },
  'empty-payments': {
    viewBox: '0 0 160 120',
    body: (
      <>
        <ellipse className={styles.ground} cx="80" cy="106" rx="58" ry="8" />
        {card(28, 30, 84, 60)}
        <rect className={styles.tint} x="28" y="44" width="84" height="12" />
        {line(38, 70, 30)}
        {line(38, 80, 18)}
        {card(70, 46, 64, 50)}
        <circle className={styles.accentSoft} cx="102" cy="66" r="12" />
        <path className={styles.stroke} d="M96 66 H108 M102 60 V72" />
        {line(84, 84, 36)}
        {route('M14 22 C30 10 44 20 52 12')}
        {node(14, 22, 4, styles.nodeAccent)}
        {node(52, 12, 4)}
      </>
    ),
  },
  'empty-webhooks': {
    viewBox: '0 0 160 120',
    body: (
      <>
        <ellipse className={styles.ground} cx="80" cy="106" rx="60" ry="8" />
        {card(18, 40, 44, 44, 12)}
        <path className={styles.stroke} d="M30 56 L40 62 L30 68 M44 70 H52" />
        {card(98, 40, 44, 44, 12)}
        <circle className={styles.accentSoft} cx="120" cy="62" r="11" />
        {route('M62 62 C74 40 86 84 98 62')}
        {node(62, 62, 5, styles.nodeAccent)}
        {node(98, 62, 5)}
        {node(80, 62, 3, styles.nodeAccent)}
      </>
    ),
  },
  'no-results': {
    viewBox: '0 0 160 120',
    body: (
      <>
        <ellipse className={styles.ground} cx="80" cy="106" rx="52" ry="8" />
        {card(30, 22, 76, 70)}
        {line(42, 36, 44)}
        {line(42, 50, 52, styles.lineFaint)}
        {line(42, 64, 36, styles.lineFaint)}
        <circle className={styles.lens} cx="104" cy="70" r="20" />
        <path className={styles.handle} d="M118 84 L134 100" />
        <path className={styles.stroke} d="M97 70 H111" />
      </>
    ),
  },
  error: {
    viewBox: '0 0 160 120',
    body: (
      <>
        <ellipse className={styles.ground} cx="80" cy="106" rx="56" ry="8" />
        {route('M18 64 H58')}
        {route('M102 64 H142')}
        {card(54, 46, 22, 36, 6)}
        {card(84, 46, 22, 36, 6)}
        <path className={styles.stroke} d="M76 56 H84 M76 72 H84" />
        <circle className={styles.errorSoft} cx="80" cy="28" r="11" />
        <path className={styles.errorMark} d="M75 23 L85 33 M85 23 L75 33" />
        {node(18, 64, 4, styles.nodeAccent)}
        {node(142, 64, 4)}
      </>
    ),
  },
  success: {
    viewBox: '0 0 160 120',
    body: (
      <>
        <ellipse className={styles.ground} cx="80" cy="106" rx="50" ry="8" />
        <circle className={styles.successSoft} cx="80" cy="56" r="34" />
        <circle className={styles.successRing} cx="80" cy="56" r="24" />
        <path className={styles.successMark} d="M69 56 L77 64 L92 48" />
        {node(30, 30, 4, styles.nodeAccent)}
        {node(132, 26, 3)}
        {node(128, 86, 4, styles.nodeAccent)}
        {node(26, 82, 3)}
      </>
    ),
  },
  'sign-in': {
    viewBox: '0 0 400 320',
    body: (
      <>
        <rect className={styles.panel} x="0" y="0" width="400" height="320" rx="24" />
        {route('M40 270 C90 230 120 250 160 214 S240 170 280 180 S340 120 362 70')}
        {node(40, 270, 8, styles.nodeAccent)}
        {node(160, 214, 7)}
        {node(280, 180, 7)}
        {node(362, 70, 9, styles.nodeAccent)}
        {card(70, 56, 200, 124, 16)}
        {line(92, 78, 70)}
        <path className={styles.chart} d="M92 150 L122 132 L150 140 L182 110 L212 120 L246 96" />
        <path className={styles.chartTint} d="M92 150 L122 132 L150 140 L182 110 L212 120 L246 96 L246 160 L92 160 Z" />
        {card(214, 196, 132, 72, 14)}
        {line(232, 214, 56)}
        <rect className={styles.metric} x="232" y="232" width="80" height="16" rx="5" />
        {card(300, 116, 68, 68, 34)}
        <rect className={styles.lockBody} x="320" y="148" width="28" height="22" rx="5" />
        <path className={styles.stroke} d="M326 148 V140 A8 8 0 0 1 342 140 V148" />
      </>
    ),
  },
};

/** Decorative spot illustration for empty states, results, errors, success and sign-in. */
export function Illustration({ name, width, className }: IllustrationProps) {
  const a = art[name];
  const [, , w, h] = a.viewBox.split(' ').map(Number);
  const size = width ?? w;
  return (
    <svg className={cx(styles.illustration, className)} viewBox={a.viewBox} width={size} height={(size / w) * h} aria-hidden="true" focusable="false">
      {a.body}
    </svg>
  );
}
