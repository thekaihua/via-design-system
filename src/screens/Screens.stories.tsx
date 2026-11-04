import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { DevelopersOverview, Transactions, PaymentDetail, Webhooks, ReviewQueue, BusinessReview } from './screens';

const meta = {
  title: 'Screens',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DevelopersOverviewScreen: Story = {
  name: 'Developers · Overview',
  render: () => <DevelopersOverview />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Chart filters' })).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Requests per 30 minutes, chart' })).toBeInTheDocument();
  },
};

export const TransactionsScreen: Story = {
  name: 'Transactions',
  render: () => <Transactions />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search payments' }), 'pay_0005');
    await waitFor(() => expect(canvas.getByText('Showing 1–1 of 1 payments')).toBeInTheDocument());
  },
};

export const PaymentDetailScreen: Story = { name: 'Payment detail', render: () => <PaymentDetail /> };

export const WebhooksScreen: Story = { name: 'Developers · Webhooks', render: () => <Webhooks /> };

export const ReviewQueueScreen: Story = {
  name: 'Admin · Review queue',
  render: () => <ReviewQueue />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Assignee filter/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Unassigned' }));
    await waitFor(() => expect(canvas.getByText('Showing 3 of 12')).toBeInTheDocument());
  },
};

export const BusinessReviewScreen: Story = {
  name: 'Admin · Business review',
  render: () => <BusinessReview />,
  play: async ({ canvas }) => {
    // Reject is final: it asks first.
    await userEvent.click(canvas.getByRole('button', { name: 'Reject' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Reject Number One?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(canvas.getByText('Approved', { selector: 'span' })).toBeInTheDocument());
  },
};
