import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Tabs } from './Tabs';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  args: {
    'aria-label': 'Developer sections',
    items: [
      { id: 'overview', label: 'Overview', content: <p>Request activity and recent errors.</p> },
      { id: 'keys', label: 'API keys', content: <p>Create, roll and revoke keys.</p> },
      { id: 'events', label: 'Event log', content: <p>Every event sent to your endpoints.</p> },
      { id: 'webhooks', label: 'Webhooks', content: <p>Endpoints and delivery status.</p> },
      { id: 'more', label: 'More', disabled: true },
    ],
    onChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  play: async ({ canvas, args }) => {
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await userEvent.tab();
    await expect(overview).toHaveFocus();
    // Manual activation: arrows move focus only.
    await userEvent.keyboard('{ArrowRight}');
    const keys = canvas.getByRole('tab', { name: 'API keys' });
    await expect(keys).toHaveFocus();
    await expect(keys).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(keys).toHaveAttribute('aria-selected', 'true');
    await expect(args.onChange).toHaveBeenCalledWith('keys');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Create, roll and revoke keys.');
  },
};

export const Page: Story = { args: { variant: 'page' } };

export const Small: Story = { args: { size: 'sm' } };
