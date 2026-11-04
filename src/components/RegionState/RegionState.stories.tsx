import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, RotateCw } from 'lucide-react';
import { Button } from '../Button/Button';
import { RegionState } from './RegionState';

const meta = {
  title: 'Data/RegionState',
  component: RegionState,
  args: {
    kind: 'empty',
    title: 'No API keys yet',
    description: 'Create a sandbox key to start testing.',
    action: <Button leadingIcon={Plus}>Create key</Button>,
  },
  argTypes: { action: { control: false }, icon: { control: false } },
} satisfies Meta<typeof RegionState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

/** First use, where the region has room: a spot illustration instead of the icon. */
export const FirstUse: Story = {
  name: 'Empty (first use, illustration)',
  args: {
    illustration: 'empty-payments',
    title: 'No payments yet',
    description: 'Payments appear here once customers pay you. Try a test payment in the sandbox.',
    action: <Button leadingIcon={Plus}>Create test payment</Button>,
  },
};

export const NoResults: Story = {
  args: {
    kind: 'no-results',
    title: 'No results match your filters',
    description: 'Try a broader search or clear the active filters.',
    action: <Button variant="secondary">Clear filters</Button>,
  },
};

export const ErrorState: Story = {
  name: 'Error',
  args: {
    kind: 'error',
    title: "We couldn't load transactions",
    description: 'Check your connection and try again. Your filters are kept.',
    action: (
      <Button variant="secondary" leadingIcon={RotateCw}>
        Try again
      </Button>
    ),
  },
};

export const Loading: Story = { args: { kind: 'loading', title: 'Loading your services…', description: undefined, action: undefined } };
