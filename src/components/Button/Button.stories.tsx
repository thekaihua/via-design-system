import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Trash2 } from 'lucide-react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { bg, outline, tokenColor } from '../../test/helpers';
import { Button } from './Button';
import { ButtonGroup } from './ButtonGroup';

const meta = {
  title: 'Actions/Button',
  component: Button,
  args: { children: 'Create service', onClick: fn() },
  argTypes: {
    leadingIcon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Use one primary button per view. Disabled buttons stay focusable with `aria-disabled` so a tooltip can explain why. `loading` keeps the label, shows a spinner and ignores repeat presses. `gradient` is for marketing and hero CTAs only.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Create service' });
    await expect(bg(button)).toBe(tokenColor('--via-semantic-action-background'));
    const hover = tokenColor('--via-semantic-action-hover');
    await userEvent.hover(button);
    await waitFor(() => expect(bg(button)).toBe(hover));
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = { args: { variant: 'secondary', children: 'Export' } };

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Revoke key', leadingIcon: Trash2 },
};

export const Gradient: Story = { args: { variant: 'gradient', size: 'lg' } };

export const Sizes: Story = {
  render: (args) => (
    <ButtonGroup align="start">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </ButtonGroup>
  ),
};

export const WithIcon: Story = { args: { leadingIcon: Plus } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Create service' });
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    // Still reachable by keyboard, but does nothing.
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    const disabled = tokenColor('--via-semantic-disabled-background');
    await waitFor(() => expect(bg(button)).toBe(disabled));
  },
};

export const Loading: Story = {
  args: { loading: true, children: 'Saving' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: /Saving/ });
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(button).toHaveAttribute('data-pending', 'true');
  },
};

export const FocusRing: Story = {
  name: 'Focus ring (keyboard)',
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const ring = outline(button);
    await expect(ring.width).toBe('3px');
    await expect(ring.offset).toBe('2px');
    await expect(ring.color).toBe(tokenColor('--via-semantic-focus-ring'));
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['primary', 'secondary', 'destructive', 'gradient'] as const).map((variant) => (
        <ButtonGroup key={variant} align="start" aria-label={variant}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} {...args} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
          <Button {...args} variant={variant} disabled>
            Disabled
          </Button>
          <Button {...args} variant={variant} loading>
            Loading
          </Button>
        </ButtonGroup>
      ))}
    </div>
  ),
};
