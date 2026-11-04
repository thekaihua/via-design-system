import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stepper } from './Stepper';

const meta = {
  title: 'Navigation/Stepper',
  component: Stepper,
  args: {
    'aria-label': 'Create service progress',
    steps: ['Service details', 'API products', 'Locations', 'Pricing', 'Review'],
    current: 0,
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list', { name: 'Create service progress' });
    const items = within(list).getAllByRole('listitem');
    await expect(items[0]).toHaveAttribute('aria-current', 'step');
    await expect(items[0]).toHaveTextContent('Service details, current step');
  },
};

export const MidFlow: Story = {
  args: { current: 2 },
  play: async ({ canvas }) => {
    const items = canvas.getAllByRole('listitem');
    await expect(items[1]).toHaveTextContent('API products, completed');
    await expect(items[2]).toHaveAttribute('aria-current', 'step');
  },
};

export const ThreeSteps: Story = { args: { steps: ['Company details', 'Owners', 'Bank account'], current: 1 } };
