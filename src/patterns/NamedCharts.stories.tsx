import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Chart } from '../components/Chart/Chart';
import { paymentVolume, requestActivity, webhookActivity } from './charts';

/**
 * The design's named charts (Chart / Request activity, Webhook activity, Payment volume) are the same
 * Chart component with different data, so they are configurations, not components.
 */
const meta = {
  title: 'Patterns/Named charts',
  decorators: [(Story) => <div style={{ maxWidth: 960 }}>{Story()}</div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const RequestActivity: Story = {
  name: 'Request activity',
  render: () => (
    <Chart
      title="Requests"
      summary="Errors peaked at 9 between 10:10 and 10:40, while successful requests peaked at 17."
      unit="Requests / 30 minutes"
      context="Times in UTC"
      data={requestActivity}
      xKey="time"
      series={[
        { key: 'successful', label: 'Successful', color: 1, legendValue: '94' },
        { key: 'errors', label: 'Errors', color: 'error', legendValue: '49' },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Requests, chart' })).toBeInTheDocument();
  },
};

export const WebhookActivity: Story = {
  name: 'Webhook activity',
  render: () => (
    <Chart
      title="Webhook deliveries"
      summary="Deliveries rose to 221 in the latest 30 minutes."
      unit="Webhook deliveries / 30 minutes"
      context="Times in UTC"
      data={webhookActivity}
      xKey="time"
      series={[{ key: 'deliveries', label: 'Deliveries', color: 1 }]}
    />
  ),
};

export const PaymentVolume: Story = {
  name: 'Payment volume',
  render: () => (
    <Chart
      title="Successful payment volume"
      summary="USD 140 so far today, against none at this time yesterday."
      unit="Successful payment volume · USD"
      context="Cumulative · times in UTC"
      data={paymentVolume}
      xKey="time"
      yFormat={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      locale="en-SG"
      series={[
        { key: 'volume', label: 'Today', color: 1 },
        { key: 'previous', label: 'Previous day', color: 2, dashed: true },
      ]}
    />
  ),
};
