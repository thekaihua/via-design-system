import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { OverviewPage, DetailPage, SettingsPage } from './templates';

const meta = {
  title: 'Patterns/Page templates',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <OverviewPage />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1, name: 'Good morning, Shop Example' })).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Last 7 days' })).toBeInTheDocument();
  },
};

export const Detail: Story = {
  name: 'Detail + Focus view',
  render: () => <DetailPage />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Edit service' }));
    const view = await screen.findByRole('dialog', { name: 'Edit service' });
    const url = within(view).getByRole('textbox', { name: /Endpoint URL/ });
    await userEvent.clear(url);
    await userEvent.type(url, 'https://shop.example/hooks');
    await userEvent.click(within(view).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(canvas.getByText('https://shop.example/hooks')).toBeInTheDocument());
  },
};

export const Settings: Story = {
  render: () => <SettingsPage />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Close account…' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Close Shop Example?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Keep account' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog', { name: 'Close Shop Example?' })).toBeNull());
  },
};
