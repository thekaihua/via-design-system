import { useSyncExternalStore } from 'react';

export type SeriesColor = 1 | 2 | 3 | 4 | 5 | 6 | 'error';

const VARS = {
  1: '--via-chart-series-1',
  2: '--via-chart-series-2',
  3: '--via-chart-series-3',
  4: '--via-chart-series-4',
  5: '--via-chart-series-5',
  6: '--via-chart-series-6',
  error: '--via-semantic-error-foreground',
  grid: '--via-chart-grid',
  axis: '--via-chart-axis',
} as const;

export type ChartColors = Record<keyof typeof VARS, string>;

let cache: { key: string; value: ChartColors } | null = null;

function read(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  const value = Object.fromEntries(Object.entries(VARS).map(([k, v]) => [k, style.getPropertyValue(v).trim()])) as ChartColors;
  const key = JSON.stringify(value);
  if (cache?.key !== key) cache = { key, value };
  return cache.value;
}

/**
 * Resolved chart token colours for the current theme. SVG attributes need real colour values, so this
 * reads the CSS custom properties and re-renders when `data-theme` changes on <html>.
 */
export function useChartColors(): ChartColors {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
      return () => observer.disconnect();
    },
    read,
    () => ({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', error: '', grid: '', axis: '' }),
  );
}
