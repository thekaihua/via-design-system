import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import { Accordion, IntegrationGuide } from './Disclosure';

const meta = {
  title: 'Disclosure/Accordion',
  component: Accordion,
  args: {
    items: [
      {
        id: 'links',
        title: 'What is a payment link?',
        content: 'A payment link opens a hosted checkout page. Share it by email or chat, and customers pay without you building a checkout. Payment methods depend on the market.',
      },
      { id: 'markets', title: 'Which markets are supported?', content: 'Singapore, Malaysia, Thailand, the Philippines and Indonesia.' },
      { id: 'fees', title: 'How are fees charged?', content: 'Fees are deducted from each settlement. See the rate card for your markets.' },
    ],
  },
  decorators: [(Story) => <div style={{ maxWidth: 940 }}>{Story()}</div>],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'What is a payment link?' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Titles stay headings so screen-reader heading navigation still finds them.
    await expect(canvas.getByRole('heading', { level: 3, name: 'What is a payment link?' })).toBeInTheDocument();
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(canvas.getByText(/customers pay without you building a checkout/)).toBeVisible());
  },
};

export const OneAtATime: Story = {
  args: { allowMultiple: false, defaultExpanded: ['links'] },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Which markets are supported?' }));
    await expect(canvas.getByRole('button', { name: 'What is a payment link?' })).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Guide: StoryObj = {
  name: 'Integration guide',
  render: () => (
    <IntegrationGuide title="Getting started" description="API guides and integration setup">
      <ol style={{ margin: 0, paddingInlineStart: 20, display: 'grid', gap: 12 }}>
        <li>Create a sandbox API key on the API keys tab.</li>
        <li>
          Send a test payment:
          <CodeBlock language="cURL" code={'curl https://sandbox.api.acmepay.example/v1/payments \\\n  -H "Authorization: Bearer $ACME_KEY"'} />
        </li>
        <li>Add a webhook endpoint to receive payment events.</li>
      </ol>
    </IntegrationGuide>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'View guide: Getting started' });
    await userEvent.click(trigger);
    await expect(canvas.getByRole('button', { name: 'Hide guide: Getting started' })).toHaveAttribute('aria-expanded', 'true');
  },
};
