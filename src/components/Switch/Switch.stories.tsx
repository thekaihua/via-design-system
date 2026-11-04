import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Switch } from './Switch';

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  args: {
    label: 'Send test webhooks',
    description: 'Applies immediately to the sandbox endpoint.',
    onChange: fn(),
  },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  play: async ({ canvas, args }) => {
    const sw = canvas.getByRole('switch', { name: 'Send test webhooks' });
    await expect(sw).toHaveAccessibleDescription('Applies immediately to the sandbox endpoint.');
    await userEvent.click(sw);
    await expect(sw).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

export const On: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };
