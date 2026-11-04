import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, RotateCw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge, type BadgeTone } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { OverflowMenu } from '../OverflowMenu/OverflowMenu';
import { RegionState } from '../RegionState/RegionState';
import { SearchField } from '../SearchField/SearchField';
import { DataTable, type DataTableColumn, type SortState } from './DataTable';
import { BulkActionBar, TableFooter, TableToolbar } from './TableParts';

interface Payment {
  id: string;
  customer: string;
  service: string;
  status: 'Succeeded' | 'Pending' | 'Failed';
  amount: number;
  created: string;
}

const statusTone: Record<Payment['status'], BadgeTone> = { Succeeded: 'positive', Pending: 'info', Failed: 'negative' };

const payments: Payment[] = [
  { id: 'pay_1', customer: 'ana@shop.example', service: 'App A', status: 'Succeeded', amount: 25, created: '2026-10-28' },
  { id: 'pay_2', customer: 'ben@shop.example', service: 'App A', status: 'Failed', amount: 9.9, created: '2026-10-27' },
  { id: 'pay_3', customer: 'chi@shop.example', service: 'Service B', status: 'Pending', amount: 120, created: '2026-10-27' },
  { id: 'pay_4', customer: 'dev@shop.example', service: 'Service B', status: 'Succeeded', amount: 4.5, created: '2026-10-25' },
  { id: 'pay_5', customer: 'eli@shop.example', service: 'App A', status: 'Succeeded', amount: 60, created: '2026-10-24' },
];

const sgd = new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' });

const columns: DataTableColumn<Payment>[] = [
  { key: 'customer', header: 'Customer', sortable: true, secondary: (r) => r.id },
  { key: 'service', header: 'Service', width: 160 },
  { key: 'status', header: 'Status', width: 140, render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
  { key: 'amount', header: 'Amount', width: 140, numeric: true, sortable: true, render: (r) => sgd.format(r.amount) },
  { key: 'created', header: 'Created', width: 140, sortable: true },
  {
    key: 'actions',
    header: 'Actions',
    width: 88,
    align: 'end',
    render: (r) => (
      <OverflowMenu label={`Actions for ${r.customer}`} items={[{ label: 'Refund', onSelect: () => {} }]} />
    ),
  },
];

function sortRows(rows: Payment[], sort?: SortState) {
  if (!sort) return rows;
  const dir = sort.direction === 'ascending' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[sort.key as keyof Payment];
    const y = b[sort.key as keyof Payment];
    return (x > y ? 1 : x < y ? -1 : 0) * dir;
  });
}

const openPayment = fn();

function Example({ initialSelected = [] as string[] }) {
  const [sort, setSort] = useState<SortState | undefined>({ key: 'created', direction: 'descending' });
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState('');
  const rows = useMemo(
    () => sortRows(payments.filter((p) => p.customer.includes(query)), sort),
    [query, sort],
  );
  return (
    <div>
      <TableToolbar
        title="Payments"
        actions={
          <Button variant="secondary" leadingIcon={Download}>
            Export
          </Button>
        }
      >
        <SearchField label="Search payments" placeholder="Search by customer" value={query} onChange={setQuery} />
      </TableToolbar>
      <DataTable
        caption="Payments"
        columns={columns}
        rows={rows}
        sort={sort}
        onSort={setSort}
        selectable
        selected={selected}
        onSelect={setSelected}
        rowLabel={(r) => `Select payment from ${r.customer}`}
        onRowClick={openPayment}
        bulkActions={
          <BulkActionBar
            selectedCount={selected.length}
            totalCount={48}
            onSelectAll={() => setSelected(payments.map((p) => p.id))}
            onClear={() => setSelected([])}
            actions={
              <>
                <Button variant="secondary" size="sm" leadingIcon={Download}>
                  Export
                </Button>
                <Button variant="destructive" size="sm" leadingIcon={Trash2}>
                  Refund {selected.length}
                </Button>
              </>
            }
          />
        }
        empty={
          <RegionState
            kind="no-results"
            title="No payments match your search"
            description="Try a different customer email."
            action={
              <Button variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            }
          />
        }
        footer={<TableFooter summary={`Showing 1–${rows.length} of 48 records`} page={1} pageCount={10} onPageChange={() => {}} />}
      />
    </div>
  );
}

const meta = {
  title: 'Data/DataTable',
  component: DataTable,
  render: () => <Example />,
  parameters: { layout: 'padded' },
  args: { caption: 'Payments', columns: [], rows: [] },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: 'Payments' });
    const created = within(table).getByRole('columnheader', { name: /Created/ });
    await expect(created).toHaveAttribute('aria-sort', 'descending');
    // Sort by amount.
    await userEvent.click(within(table).getByRole('button', { name: /Amount/ }));
    await expect(within(table).getByRole('columnheader', { name: /Amount/ })).toHaveAttribute('aria-sort', 'ascending');
    const firstRow = within(table).getAllByRole('row')[1];
    await expect(firstRow).toHaveTextContent('dev@shop.example');
  },
};

export const Selection: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select payment from ana@shop.example' }));
    const bar = await canvas.findByRole('region', { name: 'Bulk actions' });
    await expect(bar).toHaveTextContent('1 of 48 selected');
    const all = canvas.getByRole('checkbox', { name: 'Select all rows' });
    await expect((all as HTMLInputElement).indeterminate).toBe(true);
    await userEvent.click(all);
    await expect(bar).toHaveTextContent('5 of 48 selected');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
    await expect(canvas.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();
  },
};

export const RowClick: Story = {
  name: 'Open a row (mouse and keyboard)',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'ben@shop.example' }));
    await expect(openPayment).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'pay_2' }));
    // Clicking the row's checkbox doesn't open it.
    openPayment.mockClear();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select payment from chi@shop.example' }));
    await expect(openPayment).not.toHaveBeenCalled();
  },
};

export const Empty: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('searchbox'), 'nobody');
    await expect(canvas.getByText('No payments match your search')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  render: () => <DataTable caption="Payments" columns={columns} rows={[]} loading />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  },
};

export const LoadError: Story = {
  name: 'Error',
  render: () => (
    <DataTable
      caption="Payments"
      columns={columns}
      rows={[]}
      error={
        <RegionState
          kind="error"
          title="We couldn't load payments"
          description="Try again. Your filters are kept."
          action={
            <Button variant="secondary" leadingIcon={RotateCw}>
              Try again
            </Button>
          }
        />
      }
    />
  ),
};

export const Mobile: Story = {
  name: 'Stacked cards (mobile)',
  globals: { viewport: { value: 'mobile1' } },
  decorators: [(Story) => <div style={{ maxWidth: 375 }}>{Story()}</div>],
};
