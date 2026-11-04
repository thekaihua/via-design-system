import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from '../Button/Button';
import { Banner } from './Banner';

const meta = {
  title: 'Feedback/Banner',
  component: Banner,
  args: {
    title: 'Webhooks are in test mode',
    description: 'Events are sent to your test endpoint only.',
    actions: (
      <Button variant="secondary" size="sm">
        View endpoints
      </Button>
    ),
    onDismiss: fn(),
  },
  argTypes: { actions: { control: false } },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

export const Caution: Story = {
  args: {
    type: 'caution',
    title: 'API key expires in 7 days',
    description: 'Rotate the key to avoid failed requests.',
    actions: (
      <Button variant="secondary" size="sm">
        Rotate key
      </Button>
    ),
  },
};

export const Critical: Story = {
  args: {
    type: 'critical',
    title: 'Payouts are paused',
    description: 'Verify your business details to resume payouts.',
    actions: (
      <Button variant="secondary" size="sm">
        Verify details
      </Button>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

export const TitleOnly: Story = { args: { description: undefined, actions: undefined, onDismiss: undefined } };
