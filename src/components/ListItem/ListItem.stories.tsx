import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banknote, CircleX, Webhook } from 'lucide-react';
import { expect } from 'storybook/test';
import { ItemList, ListItem } from './ListItem';

const meta = {
  title: 'Data/ListItem',
  component: ListItem,
  args: { title: 'payment.succeeded' },
  render: () => (
    <ItemList label="Recent events">
      <ListItem icon={Webhook} title="payment.succeeded" description="SGD 25.00 · cus_8812" meta="2 min ago" href="#evt_1" />
      <ListItem icon={CircleX} title="payment.failed" description="Insufficient balance · cus_1290" meta="14 min ago" href="#evt_2" />
      <ListItem icon={Banknote} title="payout.paid" description="SGD 4,820.00 to DBS ••42" meta="1 h ago" href="#evt_3" />
    </ItemList>
  ),
  decorators: [(Story) => <div style={{ maxWidth: 560 }}>{Story()}</div>],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Events: Story = {
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list', { name: 'Recent events' });
    await expect(list.querySelectorAll('li')).toHaveLength(3);
    await expect(canvas.getByRole('link', { name: /payment.failed/ })).toHaveAttribute('href', '#evt_2');
  },
};
