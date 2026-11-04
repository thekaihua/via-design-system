import { useId, useMemo, useState, type ReactNode } from 'react';
import { ToggleButton } from 'react-aria-components';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RotateCw } from 'lucide-react';
import { cx } from '../../utils/cx';
import { usePrefersReducedMotion, useShellSize } from '../../utils/useMediaQuery';
import { Button } from '../Button/Button';
import { DataTable } from '../DataTable/DataTable';
import { formatDate } from '../DateField/dates';
import { RegionState } from '../RegionState/RegionState';
import { useChartColors, type SeriesColor } from './useChartColors';
import styles from './Chart.module.css';

export interface ChartSeries {
  key: string;
  label: string;
  /** Token colour: series 1–6, or `error` for failures. */
  color?: SeriesColor;
  /** Dashed line, e.g. a comparison period or failures (never colour alone). Failures are dashed by default. */
  dashed?: boolean;
  /** Draw as `bar`, `line` or filled `area`. Defaults to the chart's type. */
  as?: 'bar' | 'line' | 'area';
  /**
   * Stack series into separate panels that share the x axis, each with its own y scale. Use it when one
   * series is much smaller than another (failures next to successes) instead of a second y axis. Default 0.
   */
  panel?: number;
  /** Value shown after the label in the legend, e.g. the window's total ("94"). */
  legendValue?: string;
}

export type ChartState = 'data' | 'loading' | 'empty' | 'error';

export interface ChartProps<T extends Record<string, unknown>> {
  /** Visible title (h3). */
  title: string;
  /** One-sentence takeaway shown under the chart and read by screen readers, e.g. "Payments rose 12% this week." */
  summary: string;
  data: T[];
  series: ChartSeries[];
  /** Field for the x axis (dates, categories). */
  xKey: keyof T & string;
  type?: 'bar' | 'line' | 'area';
  /** Unit above the y axis, e.g. "Requests / 30 minutes" (Chart / Request activity). */
  unit?: string;
  /** Print each bar's value above it (Chart / Bar chart). */
  showValues?: boolean;
  /** `date`: x values are ISO dates, shown as DD MMM YYYY (DD MMM on the axis). */
  xType?: 'date' | 'category';
  /** Custom x formatting for ticks, tooltip and table. Overrides `xType`. */
  xFormat?: (value: T[keyof T]) => string;
  /** Format y values. Ticks use `compact` notation; the tooltip uses the full format. */
  yFormat?: Intl.NumberFormatOptions;
  /** Formatting locale. */
  locale?: string;
  /** Overrides the responsive height (200 / 240 / 280 px). */
  height?: number;
  state?: ChartState;
  /** Shown in the empty state. */
  emptyMessage?: string;
  onRetry?: () => void;
  /** Controls next to the title, e.g. a range Select. */
  actions?: ReactNode;
  /** Small text under the chart, e.g. "Times in UTC · updated 09:41". */
  context?: ReactNode;
  className?: string;
}

const HEIGHTS = { mobile: 200, tablet: 240, desktop: 280 } as const;

/**
 * Chart with design tokens, formatting, states and accessibility (Charts page): a figure with a title,
 * a written summary, a legend that toggles series, and "View data" for the same data.
 */
export function Chart<T extends Record<string, unknown>>({
  title,
  summary,
  data,
  series,
  xKey,
  type = 'line',
  xType = 'category',
  unit,
  showValues = false,
  xFormat,
  yFormat = {},
  locale,
  height,
  state = 'data',
  emptyMessage = 'No data for this period',
  onRetry,
  actions,
  context,
  className,
}: ChartProps<T>) {
  const colors = useChartColors();
  const size = useShellSize();
  const reducedMotion = usePrefersReducedMotion();
  const [hidden, setHidden] = useState<string[]>([]);
  const [asTable, setAsTable] = useState(false);
  const titleId = useId();

  const full = useMemo(() => new Intl.NumberFormat(locale, yFormat), [locale, yFormat]);
  const compact = useMemo(() => new Intl.NumberFormat(locale, { ...yFormat, notation: 'compact', maximumFractionDigits: 1 }), [locale, yFormat]);
  // Dates: "03 Nov" on the axis (the year is in the tooltip and table), "03 Nov 2026" elsewhere.
  const fFull = (v: unknown) => (xFormat ? xFormat(v as T[keyof T]) : xType === 'date' ? formatDate(String(v)) : String(v));
  const fAxis = (v: unknown) => (xFormat ? xFormat(v as T[keyof T]) : xType === 'date' ? formatDate(String(v), { year: false }) : String(v));
  const [hoverPanel, setHoverPanel] = useState(0);
  // Keyboard: the focused time bucket (Chart / Keyboard focus state). null = no keyboard point.
  const [keyIndex, setKeyIndex] = useState<number | null>(null);
  const hintId = useId();
  const syncId = useId();
  const colorOf = (s: ChartSeries) => colors[s.color ?? 1];
  const dashOf = (s: ChartSeries) => (s.dashed ?? s.color === 'error' ? '6 4' : undefined);
  const chartHeight = height ?? HEIGHTS[size];
  // Under 768 px thin the x-axis labels to about 4.
  const tickInterval = size === 'mobile' ? Math.max(0, Math.ceil(data.length / 4) - 1) : 'preserveStartEnd';

  let body: ReactNode;
  if (state === 'loading') {
    body = <div className={styles.skeleton} style={{ height: chartHeight }} aria-hidden="true" />;
  } else if (state === 'error') {
    body = (
      <RegionState
        kind="error"
        title="We couldn't load this chart"
        description="Try again in a moment."
        action={
          onRetry && (
            <Button variant="secondary" leadingIcon={RotateCw} onClick={onRetry}>
              Try again
            </Button>
          )
        }
      />
    );
  } else if (state === 'empty' || data.length === 0) {
    body = <RegionState kind="empty" title={emptyMessage} />;
  } else if (asTable) {
    body = (
      <DataTable
        caption={title}
        columns={[
          { key: xKey, header: 'Period', render: (r: T) => fFull(r[xKey]) },
          ...series.map((s) => ({ key: s.key, header: s.label, numeric: true, render: (r: T) => full.format(Number(r[s.key])) })),
        ]}
        rows={data}
        getRowId={(r) => String(r[xKey])}
      />
    );
  } else {
    // One panel per `series.panel`, stacked and sharing the x axis (only the bottom one shows its labels).
    const visible = series.filter((s) => !hidden.includes(s.key));
    const panels = [...new Set(series.map((s) => s.panel ?? 0))].sort((a, b) => a - b);
    const shownPanels = panels.filter((p) => visible.some((s) => (s.panel ?? 0) === p));
    body = (
      <div
        className={styles.plot}
        role="group"
        tabIndex={0}
        aria-label={`${title}, chart`}
        aria-describedby={hintId}
        onFocus={(e) => {
          if (e.target !== e.currentTarget) return;
          setHoverPanel(shownPanels[0]);
          setKeyIndex((i) => i ?? data.length - 1);
        }}
        onBlur={() => setKeyIndex(null)}
        onKeyDown={(e) => {
          const last = data.length - 1;
          const moves: Record<string, (i: number) => number> = {
            ArrowLeft: (i) => Math.max(0, i - 1),
            ArrowRight: (i) => Math.min(last, i + 1),
            Home: () => 0,
            End: () => last,
          };
          if (moves[e.key]) {
            e.preventDefault();
            setKeyIndex((i) => moves[e.key](i ?? last));
          } else if (e.key === 'Escape' && keyIndex !== null) {
            e.preventDefault();
            setKeyIndex(null);
          }
        }}
      >
        {unit && <span className={styles.unit}>{unit}</span>}
        <span id={hintId} className="via-visually-hidden">
          Use the left and right arrow keys to move between {data.length} periods. Escape hides the values.
        </span>
        {/* One announcement per move: the period and every visible series together. */}
        <span className="via-visually-hidden" aria-live="polite" aria-atomic="true">
          {keyIndex !== null && data[keyIndex]
            ? `${fFull(data[keyIndex][xKey])}: ${visible.map((s) => `${s.label} ${full.format(Number(data[keyIndex][s.key]))}`).join(', ')}`
            : ''}
        </span>
        <div aria-hidden="true">
        {shownPanels.map((panel, i) => {
          const last = i === shownPanels.length - 1;
          const panelSeries = visible.filter((s) => (s.panel ?? 0) === panel);
          const panelHeight = i === 0 ? chartHeight : Math.round(chartHeight * 0.5);
          return (
            <div key={panel} onMouseEnter={() => setHoverPanel(panel)} className={cx(!last && styles.panelGap)}>
              <ResponsiveContainer width="100%" height={panelHeight}>
                <ComposedChart
                  data={data}
                  syncId={shownPanels.length > 1 ? syncId : undefined}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  accessibilityLayer={false}
                >
                  <CartesianGrid vertical={false} stroke={colors.grid} />
                  <XAxis
                    dataKey={xKey as string}
                    hide={!last}
                    tickFormatter={fAxis}
                    interval={tickInterval}
                    tick={{ fill: colors.axis, fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: colors.grid }}
                    minTickGap={8}
                  />
                  <YAxis
                    tickFormatter={(v) => compact.format(v)}
                    tick={{ fill: colors.axis, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickCount={i === 0 ? 5 : 3}
                  />
                  <RechartsTooltip
                    {...(keyIndex !== null ? { active: true, defaultIndex: keyIndex } : {})}
                    cursor={{ stroke: colors.grid, fill: colors.grid, fillOpacity: 0.3 }}
                    isAnimationActive={false}
                    // Synced panels all get a cursor; only the hovered one shows the box, listing every series.
                    content={({ active, label }) => {
                      if (!active || (shownPanels.length > 1 && hoverPanel !== panel)) return null;
                      const row = data.find((r) => String(r[xKey]) === String(label));
                      if (!row) return null;
                      return (
                        <div className={styles.tooltip}>
                          <span className={styles.tooltipTitle}>{fFull(label)}</span>
                          {visible.map((s) => (
                            <span key={s.key} className={styles.tooltipRow}>
                              <span className={cx(styles.swatch, dashOf(s) && styles.legendDashed)} style={{ color: colorOf(s), background: dashOf(s) ? undefined : colorOf(s) }} />
                              <span className={styles.tooltipLabel}>{s.label}</span>
                              <strong>{full.format(Number(row[s.key]))}</strong>
                            </span>
                          ))}
                        </div>
                      );
                    }}
                  />
                  {panelSeries.map((s) => {
                    const as = s.as ?? type;
                    const common = {
                      dataKey: s.key,
                      name: s.label,
                      isAnimationActive: !reducedMotion,
                      animationDuration: 200,
                    };
                    if (as === 'bar')
                      return (
                        <Bar key={s.key} {...common} fill={colorOf(s)} radius={[4, 4, 0, 0]} maxBarSize={48}>
                          {showValues && <LabelList dataKey={s.key} position="top" fill={colors.axis} fontSize={11} formatter={(v: unknown) => compact.format(Number(v))} />}
                        </Bar>
                      );
                    if (as === 'area')
                      return (
                        <Area
                          key={s.key}
                          {...common}
                          type="linear"
                          stroke={colorOf(s)}
                          strokeWidth={2}
                          strokeDasharray={dashOf(s)}
                          fill={colorOf(s)}
                          fillOpacity={0.12}
                        />
                      );
                    return (
                      <Line key={s.key} {...common} type="linear" stroke={colorOf(s)} strokeWidth={2} strokeDasharray={dashOf(s)} dot={false} activeDot={{ r: 4 }} />
                    );
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          );
        })}
        </div>
      </div>
    );
  }

  const showControls = state === 'data' && data.length > 0;
  return (
    <figure className={cx(styles.figure, className)} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        <div className={styles.actions}>
          {actions}
          {showControls && (
            <ToggleButton className={styles.tableToggle} isSelected={asTable} onChange={setAsTable}>
              View data
            </ToggleButton>
          )}
        </div>
      </div>
      {showControls && series.length > 1 && !asTable && (
        <ChartLegend series={series} hidden={hidden} onToggle={(key) => setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : [...h, key]))} colorOf={colorOf} dashOf={dashOf} />
      )}
      {body}
      <figcaption className={styles.caption}>
        {summary}
        {context && <span className={styles.context}>{context}</span>}
      </figcaption>
    </figure>
  );
}

/** Legend whose items toggle their series (Chart / Legend, Legend item). */
function ChartLegend({
  series,
  hidden,
  onToggle,
  colorOf,
  dashOf,
}: {
  series: ChartSeries[];
  hidden: string[];
  onToggle: (key: string) => void;
  colorOf: (s: ChartSeries) => string;
  dashOf: (s: ChartSeries) => string | undefined;
}) {
  return (
    <div className={styles.legend} role="group" aria-label="Series">
      {series.map((s) => {
        const shown = !hidden.includes(s.key);
        return (
          <ToggleButton
            key={s.key}
            isSelected={shown}
            onChange={() => onToggle(s.key)}
            className={styles.legendItem}
            // Keep at least one series visible.
            isDisabled={shown && hidden.length === series.length - 1}
          >
            <span
              className={cx(styles.legendSwatch, dashOf(s) && styles.legendDashed)}
              style={{ color: colorOf(s), background: dashOf(s) ? undefined : colorOf(s) }}
              aria-hidden="true"
            />
            {s.label}
            {s.legendValue && <strong className={styles.legendValue}>{s.legendValue}</strong>}
          </ToggleButton>
        );
      })}
    </div>
  );
}
