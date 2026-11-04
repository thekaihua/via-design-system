import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';
import { Select } from './Select';

const events = [
  { value: 'payment.succeeded', label: 'payment.succeeded' },
  { value: 'payment.failed', label: 'payment.failed' },
  { value: 'refund.created', label: 'refund.created' },
  { value: 'subscription.cancelled', label: 'subscription.cancelled', disabled: true },
];

const meta = {
  title: 'Forms/Select',
  component: Select,
  args: { label: 'Event type', options: events, onChange: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 320, minHeight: 260 }}>{Story()}</div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole('button', { name: /Event type/ });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const listbox = await screen.findByRole('listbox');
    // The popover fades in (overlay-enter motion).
    await waitFor(() => expect(listbox).toBeVisible());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onChange).toHaveBeenCalledWith('payment.failed');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('payment.failed');
  },
};

export const WithValue: Story = { args: { defaultValue: 'payment.succeeded' } };

export const Small: Story = { args: { size: 'sm', defaultValue: 'payment.succeeded' } };

export const WithDescription: Story = { args: { description: 'Only these events are sent to the endpoint.' } };

export const Invalid: Story = { args: { error: 'Choose an event type.' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'payment.succeeded' } };

export const EscapeKeepsValue: Story = {
  name: 'Esc closes without change',
  args: { defaultValue: 'payment.succeeded' },
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole('button', { name: /Event type/ });
    await userEvent.click(trigger);
    await screen.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveTextContent('payment.succeeded');
    // Focus returns to the trigger once the close animation ends.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
