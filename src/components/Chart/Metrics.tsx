import { ArrowDownRight, ArrowUpRight, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link as AriaLink } from 'react-aria-components';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { cx } from '../../utils/cx';
import { usePrefersReducedMotion } from '../../utils/useMediaQuery';
import { Button } from '../Button/Button';
import { useChartColors, type SeriesColor } from './useChartColors';
import styles from './Chart.module.css';

export interface SparklineProps {
  data: number[];
  color?: SeriesColor;
  width?: number | string;
  height?: number;
}

/** Tiny trend line (Chart / Sparkline). Decorative: the metric value carries the meaning. */
export function Sparkline({ data, color = 1, width = 120, height = 32 }: SparklineProps) {
  const colors = useChartColors();
  const reduced = usePrefersReducedMotion();
  return (
    <div aria-hidden="true" style={{ width, height }} className={styles.sparkline}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 2, bottom: 2, left: 2 }} accessibilityLayer={false}>
          <Line dataKey="v" type="monotone" stroke={colors[color]} strokeWidth={2} dot={false} isAnimationActive={!reduced} animationDuration={200} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface MetricProps {
  label: string;
  /** Already formatted, e.g. "12,480" or "65.73%". */
  value: string;
  /** Window and unit, e.g. "143 requests · same window". */
  context?: string;
  /** How it's calculated, e.g. "Successful ÷ all requests". */
  definition?: string;
  /** Change against the previous period. The direction is always in text, not colour alone. */
  delta?: { value: string; direction: 'up' | 'down'; /** Whether up is good (default) or bad, e.g. errors. */ good?: 'up' | 'down' };
  /** Adds a sparkline and draws the metric as a card (Dashboard / Metric / Trend). */
  trend?: number[];
  /** Show the value in the error colour, e.g. an error count. */
  tone?: 'default' | 'error';
  /** Makes the whole metric a link to its detail. */
  href?: string;
  loading?: boolean;
  className?: string;
}

/** A key number (Dashboard / Metric, Metric / Trend). */
export function Metric({ label, value, context, definition, delta, trend, tone = 'default', href, loading, className }: MetricProps) {
  const good = delta && (delta.good ?? 'up') === delta.direction;
  const DeltaIcon = delta?.direction === 'up' ? ArrowUpRight : ArrowDownRight;
  const content = (
    <>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricRow}>
        <span className={styles.metricValues}>
          {loading ? (
            <span className={styles.metricSkeleton} aria-label="Loading" role="status" />
          ) : (
            <span className={cx(styles.metricValue, trend && styles.metricValueCard, tone === 'error' && styles.metricError)}>{value}</span>
          )}
          {delta && !loading && (
            <span className={cx(styles.delta, good ? styles.deltaGood : styles.deltaBad)}>
              <DeltaIcon size={14} aria-hidden="true" />
              {delta.direction === 'up' ? 'Up' : 'Down'} {delta.value}
            </span>
          )}
        </span>
        {trend && !loading && <Sparkline data={trend} color={tone === 'error' ? 'error' : 1} />}
      </span>
      {context && <span className={styles.metricContext}>{context}</span>}
      {definition && <span className={styles.metricDefinition}>{definition}</span>}
    </>
  );
  const cls = cx(styles.metric, trend && styles.metricCard, href && styles.metricLink, className);
  return href ? (
    <AriaLink href={href} className={cls}>
      {content}
    </AriaLink>
  ) : (
    <div className={cls}>{content}</div>
  );
}

/** Metrics in a row: 1 column under 768 px, 2 up to 1023 px, then up to 4 (Dashboard / Metric group). */
export function MetricGroup({ children, label, className }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <div className={cx(styles.metricGroup, className)} role="group" aria-label={label}>
      {children}
    </div>
  );
}

export interface MeterProps {
  label: string;
  value: number;
  max: number;
  /** Text next to the label, e.g. "46,210 of 100,000". Defaults to "value of max". */
  valueText?: string;
  locale?: string;
  className?: string;
}

/**
 * Usage against a limit (Chart / Meter). From the design: the fill switches to warning at 80 % and to
 * destructive at 90 %, and the value text then adds the percentage ("920 of 1,000 · 92%") so the state
 * isn't carried by colour alone.
 */
export function Meter({ label, value, max, valueText, locale, className }: MeterProps) {
  const nf = new Intl.NumberFormat(locale);
  const ratio = max > 0 ? value / max : 0;
  const level = ratio >= 0.9 ? 'critical' : ratio >= 0.8 ? 'warning' : 'normal';
  const pctText = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);
  const text = valueText ?? `${nf.format(value)} of ${nf.format(max)}${level === 'normal' ? '' : ` · ${pctText}`}`;
  return (
    <div className={cx(styles.meter, className)}>
      <div className={styles.meterHeader}>
        <span className={styles.meterLabel}>{label}</span>
        <span className={cx(styles.meterValue, styles[`meterValue-${level}`])}>{text}</span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={text}
        className={styles.meterTrack}
      >
        <span className={cx(styles.meterFill, styles[`meter-${level}`])} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
      </div>
    </div>
  );
}

export interface ChartPanelProps {
  title: string;
  /** Range picker, filters or a link, at the end of the header. */
  actions?: ReactNode;
  /** Usually a MetricGroup above the chart. */
  metrics?: ReactNode;
  children: ReactNode;
  /** Small footer text or a link to the full report. */
  footer?: ReactNode;
  className?: string;
}

/** Card around one or more charts (Dashboard / Chart panel, Chart header). */
export function ChartPanel({ title, actions, metrics, children, footer, className }: ChartPanelProps) {
  return (
    <section className={cx(styles.panel, className)} aria-label={title}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{title}</h2>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {metrics}
      {children}
      {footer && <div className={styles.panelFooter}>{footer}</div>}
    </section>
  );
}

export interface AnalyticsFilterBarProps {
  /** The filters, usually Selects or a DateRangePicker for period, granularity and comparison. */
  children: ReactNode;
  /** Scope in words, e.g. "UTC · sandbox sample". Always say the time zone and mode. */
  context?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Names the group of filters. */
  label?: string;
  className?: string;
}

/** Period, granularity and comparison above dashboard charts (Analytics / Filter bar). */
export function AnalyticsFilterBar({ children, context, onRefresh, refreshing, label = 'Chart filters', className }: AnalyticsFilterBarProps) {
  return (
    <div className={cx(styles.filterBar, className)} role="group" aria-label={label}>
      {children}
      {context && <span className={styles.filterContext}>{context}</span>}
      {onRefresh && (
        <Button variant="secondary" leadingIcon={RotateCw} onClick={onRefresh} loading={refreshing} className={styles.filterRefresh}>
          Refresh
        </Button>
      )}
    </div>
  );
}
