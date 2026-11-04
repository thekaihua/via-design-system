import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { Pagination, type PaginationProps } from './Pagination';

function Controlled(props: Omit<PaginationProps, 'page' | 'onPageChange'> & { initial?: number }) {
  const [page, setPage] = useState(props.initial ?? 1);
  return <Pagination {...props} page={page} onPageChange={setPage} />;
}

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 3, onPageChange: () => {} },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  render: () => <Controlled pageCount={3} />,
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Pagination' });
    await expect(canvas.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('button', { name: 'Previous' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await expect(nav).toBeInTheDocument();
  },
};

export const ManyPages: Story = { render: () => <Controlled pageCount={12} initial={6} /> };

export const Compact: Story = {
  render: () => <Controlled variant="compact" pageCount={3} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByText('2 of 3')).toBeInTheDocument();
  },
};
