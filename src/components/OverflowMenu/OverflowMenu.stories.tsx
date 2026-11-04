import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';
import { OverflowMenu } from './OverflowMenu';

const copy = fn();
const roll = fn();
const revoke = fn();

const meta = {
  title: 'Actions/OverflowMenu',
  component: OverflowMenu,
  args: {
    label: 'Actions for key Production server',
    groups: [
      {
        title: 'Manage',
        items: [
          { label: 'Copy key ID', icon: Copy, shortcut: '⌘C', onSelect: copy },
          { label: 'Roll key…', icon: RefreshCw, onSelect: roll },
          { label: 'Edit restrictions', icon: Pencil, disabled: true, onSelect: () => {} },
        ],
      },
      { items: [{ label: 'Revoke key', icon: Trash2, destructive: true, onSelect: revoke }] },
    ],
  },
  argTypes: { groups: { control: false }, items: { control: false } },
  decorators: [(Story) => <div style={{ display: 'flex', justifyContent: 'center', minHeight: 300 }}>{Story()}</div>],
} satisfies Meta<typeof OverflowMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Actions for key Production server' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    await expect(menu).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Copy key ID/ })).toHaveFocus());
    // Disabled items are skipped.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(screen.getByRole('menuitem', { name: 'Revoke key' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(revoke).toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Escape: Story = {
  name: 'Esc closes and returns focus',
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button');
    await userEvent.click(trigger);
    await screen.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const FlatList: Story = {
  args: {
    groups: undefined,
    items: [
      { label: 'View details', onSelect: () => {} },
      { label: 'Duplicate', onSelect: () => {} },
    ],
  },
};
