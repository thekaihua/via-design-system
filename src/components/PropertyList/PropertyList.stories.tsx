import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Badge } from '../Badge/Badge';
import { Link } from '../Link/Link';
import { PropertyList } from './PropertyList';

const meta = {
  title: 'Data/PropertyList',
  component: PropertyList,
  args: {
    items: [
      { label: 'Service ID', value: 'svc_7Hq2LmX9', mono: true, copyable: 'svc_7Hq2LmX9' },
      { label: 'Status', value: <Badge tone="positive">Live</Badge> },
      { label: 'Mode', value: 'Live' },
      {
        label: 'Webhook URL',
        value: (
          <Link href="https://shop.example/webhooks/payments" external>
            https://shop.example/webhooks/payments
          </Link>
        ),
      },
      { label: 'Settlement', value: 'SGD · weekly on Monday' },
    ],
  },
  argTypes: { items: { control: false } },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}>{Story()}</div>],
} satisfies Meta<typeof PropertyList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Service ID').tagName).toBe('DT');
    await userEvent.click(canvas.getByRole('button', { name: 'Copy Service ID' }));
    await waitFor(() => expect(canvas.getByText('Copied')).toBeInTheDocument());
  },
};

export const Stacked: Story = {
  args: {
    layout: 'stacked',
    items: [
      { label: 'Created', value: '12 Oct 2026, 09:41' },
      { label: 'Last used', value: '2 hours ago' },
      { label: 'Environment', value: 'Sandbox' },
      { label: 'Requests (30 days)', value: '18,204' },
    ],
  },
};
