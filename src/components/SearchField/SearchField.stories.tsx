import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { SearchField } from './SearchField';

const meta = {
  title: 'Forms/SearchField',
  component: SearchField,
  args: { label: 'Search events', placeholder: 'Search by ID or email', onSubmit: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}>{Story()}</div>],
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('searchbox', { name: 'Search events' });
    await userEvent.type(box, 'evt_123{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('evt_123');
    await userEvent.keyboard('{Escape}');
    await expect(box).toHaveValue('');
  },
};

export const WithShortcut: Story = {
  args: { shortcut: '/' },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('searchbox');
    await userEvent.keyboard('/');
    await expect(box).toHaveFocus();
  },
};

export const Small: Story = { args: { size: 'sm' } };

export const WithClearButton: Story = {
  args: { defaultValue: 'payment.failed' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(canvas.getByRole('searchbox')).toHaveValue('');
  },
};
