import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { SetupTasks } from './SetupTasks';

const meta = {
  title: 'Patterns/SetupTasks',
  component: SetupTasks,
  args: {
    title: 'Get ready to accept live payments',
    tasks: [
      { id: 'service', title: 'Create your first service', description: 'Choose the APIs and markets for your app.', status: 'current', href: '#create' },
      { id: 'sandbox', title: 'Test in sandbox', description: 'Use sandbox keys to try payments without business details.', status: 'todo', href: '#sandbox' },
      { id: 'kyc', title: 'Submit business details', description: 'Company, owner and bank details for KYC.', status: 'todo', href: '#kyc' },
      { id: 'review', title: 'Compliance review', description: 'We check every business before it goes live.', status: 'todo' },
    ],
  },
  decorators: [(Story) => <div style={{ maxWidth: 688 }}>{Story()}</div>],
} satisfies Meta<typeof SetupTasks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewBusiness: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Get ready to accept live payments' })).toBeInTheDocument();
    await expect(canvas.getByText('0 of 4 done')).toBeInTheDocument();
    const link = canvas.getByRole('link', { name: /Create your first service/ });
    await expect(link).toHaveAccessibleName(/In progress/);
  },
};

export const InProgress: Story = {
  args: {
    tasks: [
      { id: 'service', title: 'Create your first service', status: 'done', href: '#create' },
      { id: 'sandbox', title: 'Test in sandbox', status: 'done', href: '#sandbox' },
      { id: 'kyc', title: 'Submit business details', description: 'We asked for changes to 2 details.', status: 'attention', href: '#kyc' },
      { id: 'review', title: 'Compliance review', description: 'We check every business before it goes live.', status: 'todo' },
    ],
  },
};
