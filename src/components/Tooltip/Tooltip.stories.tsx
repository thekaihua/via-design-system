import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy } from 'lucide-react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from '../Button/Button';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  args: {
    content: 'Copy key ID',
    children: (
      <Button variant="secondary" leadingIcon={Copy}>
        Copy
      </Button>
    ),
  },
  argTypes: { children: { control: false } },
  decorators: [(Story) => <div style={{ padding: '64px 120px' }}>{Story()}</div>],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Label: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Copy' });
    // Keyboard focus shows it immediately.
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tip = await screen.findByRole('tooltip');
    await expect(tip).toHaveTextContent('Copy key ID');
    await expect(trigger).toHaveAccessibleDescription('Copy key ID');
    // Esc hides it.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  },
};

export const WithDescription: Story = {
  args: {
    content: 'Success rate',
    description: 'Successful requests ÷ all requests in the selected period.',
    children: <Button variant="secondary">Success rate</Button>,
  },
};

/** Disabled buttons stay focusable, so the tooltip can explain why. */
export const OnDisabledButton: Story = {
  args: {
    content: 'Verify your business to go live',
    children: <Button disabled>Go live</Button>,
  },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Go live' })).toHaveFocus();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent('Verify your business to go live');
  },
};

export const Bottom: Story = { args: { side: 'bottom' } };
