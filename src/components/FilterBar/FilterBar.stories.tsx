import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from '../Button/Button';
import { SearchField } from '../SearchField/SearchField';
import { FilterBar, type FilterDefinition } from './FilterBar';

const definitions: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { value: 'succeeded', label: 'Succeeded' },
      { value: 'failed', label: 'Failed' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  { id: 'service', label: 'Service', options: [{ value: 'a', label: 'App A' }, { value: 'b', label: 'Service B' }] },
  { id: 'date', label: 'Date', options: [{ value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }] },
];

function Demo({ initial = {} as Record<string, string | null> }) {
  const [values, setValues] = useState(initial);
  return (
    <FilterBar
      filters={definitions.map((d) => ({ ...d, value: values[d.id] ?? null }))}
      onChange={(id, value) => setValues((v) => ({ ...v, [id]: value }))}
      onClearAll={() => setValues({})}
      search={<SearchField label="Search payments" placeholder="Search" size="sm" />}
      actions={
        <Button variant="secondary" size="sm" leadingIcon={Download}>
          Export
        </Button>
      }
    />
  );
}

const meta = {
  title: 'Data/FilterBar',
  component: FilterBar,
  render: () => <Demo />,
  args: { filters: [], onChange: () => {} },
  decorators: [(Story) => <div style={{ minHeight: 240 }}>{Story()}</div>],
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Status filter/, expanded: false }));
    await userEvent.click(await screen.findByRole('option', { name: 'Failed' }));
    const remove = await canvas.findByRole('button', { name: 'Remove Status filter' });
    // Applied: the name starts with what's visible.
    await expect(canvas.getByRole('button', { name: /^Status Failed, filter/, expanded: false })).toHaveTextContent('Status Failed');
    await userEvent.click(remove);
    await waitFor(() => expect(canvas.queryByRole('button', { name: 'Remove Status filter' })).not.toBeInTheDocument());
  },
};

export const Applied: Story = {
  render: () => <Demo initial={{ status: 'failed', service: 'a' }} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await expect(canvas.queryByRole('button', { name: /^Remove/ })).not.toBeInTheDocument();
  },
};
