import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { CodeBlock, CopyableValue } from './CodeBlock';

const curl = `curl $VIA_API_BASE/v1/payments \\
  -u sk_test_51Hx…a9Q: \\
  -d amount=2500 \\
  -d currency=sgd`;

const meta = {
  title: 'Data/CodeBlock',
  component: CodeBlock,
  args: { code: curl, language: 'cURL', onCopy: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 720 }}>{Story()}</div>],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByLabelText('cURL code')).toHaveAttribute('tabindex', '0');
    await userEvent.click(canvas.getByRole('button', { name: /Copy/ }));
    await waitFor(() => expect(args.onCopy).toHaveBeenCalled());
    await expect(canvas.getAllByText('Copied').length).toBeGreaterThan(0);
  },
};

export const WithoutLineNumbers: Story = { args: { showLineNumbers: false } };

export const SecretKey: Story = {
  name: 'Copyable value (masked)',
  render: () => (
    <CopyableValue
      label="Secret key"
      value="sk_test_51HxQwErTyUiOpA9a9Q"
      masked
      description="Created 12 Oct 2026 · last used 2 hours ago"
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('sk_test_51HxQwErTyUiOpA9a9Q')).not.toBeInTheDocument();
    const reveal = canvas.getByRole('button', { name: 'Show Secret key' });
    await userEvent.click(reveal);
    await expect(reveal).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText('sk_test_51HxQwErTyUiOpA9a9Q')).toBeInTheDocument();
  },
};

export const PublicValue: Story = {
  name: 'Copyable value',
  render: () => <CopyableValue label="Webhook signing secret ID" value="whsec_id_8f2c" />,
};
