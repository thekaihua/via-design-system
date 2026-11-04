import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { Chart, type ChartSeries } from './Chart';
import { ChartPanel, Meter, Metric, MetricGroup } from './Metrics';

const days = ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'];
const volume = days.map((d, i) => ({
  day: d,
  successful: [1820, 2040, 1950, 2210, 1480, 1310, 2380][i],
  failed: [42, 38, 51, 47, 22, 19, 61][i],
  previous: [1700, 1880, 1990, 2050, 1400, 1250, 2100][i],
}));

const series: ChartSeries[] = [
  { key: 'successful', label: 'Successful', color: 1 },
  { key: 'previous', label: 'Previous week', color: 2, dashed: true },
  { key: 'failed', label: 'Failed', color: 'error' },
];

const meta = {
  title: 'Data/Chart',
  component: Chart,
  args: {
    title: 'Payment requests',
    summary: 'Requests rose 12% on last week; failures stayed under 3%.',
    context: 'Times in UTC · updated 09:41',
    data: volume,
    series,
    xKey: 'day',
    xType: 'date',
    locale: 'en-SG',
  },
  decorators: [(Story) => <div style={{ maxWidth: 880 }}>{Story()}</div>],
} satisfies Meta<typeof Chart<(typeof volume)[number]>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('figure', { name: 'Payment requests' })).toBeVisible();
    await expect(canvas.getByText(/Requests rose 12%/)).toBeVisible();
    // The plot is decorative; the summary and table carry the data.
    await expect(canvas.getByRole('group', { name: 'Series' })).toBeVisible();
  },
};

export const Keyboard: Story = {
  name: 'Keyboard: move between points',
  play: async ({ canvas, canvasElement }) => {
    const plot = canvas.getByRole('group', { name: 'Payment requests, chart' });
    // In the tab order, after the legend.
    await expect(plot).toHaveAttribute('tabindex', '0');
    canvas.getByRole('button', { name: 'Failed' }).focus();
    await userEvent.tab();
    await expect(plot).toHaveFocus();
    const live = () => canvasElement.querySelector('[aria-live="polite"]')!;
    // Focus starts on the latest period and announces every series together.
    await waitFor(() => expect(live()).toHaveTextContent('02 Nov 2026: Successful 2,380, Previous week 2,100, Failed 61'));
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(live()).toHaveTextContent(/^01 Nov 2026: Successful 1,310/));
    await waitFor(() => expect(canvasElement.querySelector('.recharts-tooltip-wrapper')).toHaveTextContent('01 Nov 2026'));
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(live()).toHaveTextContent(/^27 Oct 2026/));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(live()).toHaveTextContent(''));
  },
};

export const LegendToggle: Story = {
  play: async ({ canvas }) => {
    const failed = canvas.getByRole('button', { name: 'Failed' });
    await expect(failed).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(failed);
    await expect(failed).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Previous week' }));
    // The last visible series can't be hidden.
    await expect(canvas.getByRole('button', { name: 'Successful' })).toBeDisabled();
  },
};

export const ViewAsTable: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'View data' }));
    const table = await canvas.findByRole('table', { name: 'Payment requests' });
    await expect(table).toBeVisible();
    await expect(canvas.getByRole('cell', { name: '2,380' })).toBeVisible();
    await expect(canvas.getByRole('cell', { name: '02 Nov 2026' })).toBeVisible();
  },
};

/** Failures are ~2% of requests: on one axis their line sits flat at zero. Stacked panels give each its own scale and keep the days aligned. */
export const Stacked: Story = {
  name: 'Stacked: successes and failures',
  args: {
    title: 'Requests and failures',
    summary: 'Failures peaked on 02 Nov at 61, the busiest day.',
    series: [
      { key: 'successful', label: 'Successful', color: 1 },
      { key: 'failed', label: 'Failed', color: 'error', panel: 1 },
    ],
  },
  play: async ({ canvasElement, canvas }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('.recharts-surface').length).toBeGreaterThanOrEqual(2));
    // Hiding the only series in a panel removes the panel.
    await userEvent.click(canvas.getByRole('button', { name: 'Failed' }));
    await waitFor(() => expect(canvasElement.querySelectorAll('.recharts-wrapper').length).toBe(1));
  },
};

export const Bars: Story = {
  args: {
    title: 'Volume by day',
    type: 'bar',
    showValues: true,
    series: [{ key: 'successful', label: 'Successful', color: 1 }],
    summary: 'Monday was the busiest day, with 2,380 requests.',
  },
};

export const Area: Story = {
  args: {
    title: 'Settled amount',
    type: 'area',
    series: [{ key: 'successful', label: 'SGD settled', color: 1 }],
    yFormat: { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 },
    summary: 'SGD 14,190 settled over 7 days.',
  },
};

export const Loading: Story = {
  args: { state: 'loading' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'View data' })).toBeNull();
  },
};

export const Empty: Story = { args: { data: [], summary: 'No requests in the last 7 days.' } };

const onRetry = fn();
export const ErrorState: Story = {
  args: { state: 'error', onRetry },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(onRetry).toHaveBeenCalled());
  },
};

export const Metrics: StoryObj = {
  render: () => (
    <MetricGroup label="Last 7 days">
      <Metric label="Requests" value="13,190" context="Last 7 days" delta={{ value: '12%', direction: 'up' }} />
      <Metric label="Success rate" value="97.9%" definition="Successful ÷ all requests" />
      <Metric label="Failures" value="280" tone="error" delta={{ value: '4%', direction: 'up', good: 'down' }} trend={volume.map((v) => v.failed)} />
      <Metric label="Webhooks" value="—" loading />
    </MetricGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Last 7 days' })).toBeVisible();
    await expect(canvas.getAllByText('Up 12%')[0]).toBeVisible();
  },
};

export const Meters: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 480 }}>
      <Meter label="API calls this month" value={46210} max={100000} locale="en-SG" />
      <Meter label="Sandbox requests" value={8400} max={10000} locale="en-SG" />
      <Meter label="Webhook retries · today" value={920} max={1000} locale="en-SG" />
    </div>
  ),
  play: async ({ canvas }) => {
    const m = canvas.getByRole('meter', { name: 'API calls this month' });
    await expect(m).toHaveAttribute('aria-valuetext', '46,210 of 100,000');
    // Warning (≥ 80%) and critical (≥ 90%) name the percentage too, so colour isn't the only signal.
    await expect(canvas.getByRole('meter', { name: 'Sandbox requests' })).toHaveAttribute('aria-valuetext', '8,400 of 10,000 · 84%');
    await expect(canvas.getByRole('meter', { name: 'Webhook retries · today' })).toHaveAttribute('aria-valuetext', '920 of 1,000 · 92%');
  },
};

export const Panel: StoryObj = {
  render: () => (
    <ChartPanel
      title="Payments"
      metrics={
        <MetricGroup label="Payments summary">
          <Metric label="Requests" value="13,190" delta={{ value: '12%', direction: 'up' }} />
          <Metric label="Success rate" value="97.9%" />
          <Metric label="Failures" value="280" tone="error" />
        </MetricGroup>
      }
      footer="Data can be up to 5 minutes behind."
    >
      <Chart {...(meta.args as Story['args'] & typeof meta.args)} title="Requests per day" />
    </ChartPanel>
  ),
};
