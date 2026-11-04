import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Badge } from '../Badge/Badge';
import { DataTable } from '../DataTable/DataTable';
import { TableFooter } from '../DataTable/TableParts';
import { Link } from '../Link/Link';
import { ServiceSummary, type Service } from './ServiceSummary';

const services: Service[] = [
  { id: 'svc_demo_001', name: 'Card payments · Singapore', mode: 'Sandbox', status: { label: 'Active', tone: 'positive' }, href: '#svc_demo_001' },
  { id: 'svc_demo_002', name: 'Bank transfers · Malaysia', mode: 'Sandbox', status: { label: 'Pending', tone: 'warning' }, href: '#svc_demo_002' },
];

/** Data / Services table: a DataTable configuration. Under 768 px rows become cards like Service summary. */
function ServicesTable() {
  return (
    <DataTable
      caption="Services"
      rows={services}
      columns={[
        { key: 'name', header: 'Service', secondary: (s) => s.id },
        { key: 'mode', header: 'Mode', width: 180 },
        { key: 'status', header: 'Status', width: 160, render: (s) => <Badge tone={s.status.tone}>{s.status.label}</Badge> },
        {
          key: 'action',
          header: 'Action',
          width: 140,
          render: (s) => (
            <Link href={s.href}>
              View service<span className="via-visually-hidden"> {s.name}</span>
            </Link>
          ),
        },
      ]}
      footer={<TableFooter summary="2 services" />}
    />
  );
}

const meta = {
  title: 'Data/ServiceSummary',
  component: ServiceSummary,
  args: {
    service: { id: 'svc_demo_001', name: 'Card payments · Singapore', mode: 'Sandbox', status: { label: 'Active', tone: 'positive' }, href: '#svc_demo_001' },
  },
} satisfies Meta<typeof ServiceSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 375 }}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'View service Card payments · Singapore' })).toBeVisible();
  },
};

export const Pending: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 375 }}>{Story()}</div>],
  args: { service: { id: 'svc_demo_002', name: 'Bank transfers · Malaysia', mode: 'Live', status: { label: 'In review', tone: 'info' }, href: '#svc_demo_002' } },
};

export const Table: StoryObj = {
  name: 'Services table',
  render: () => <ServicesTable />,
  decorators: [(Story) => <div style={{ maxWidth: 1240 }}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: 'Services' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'View service Bank transfers · Malaysia' })).toBeInTheDocument();
  },
};

export const TableMobile: StoryObj = {
  name: 'Services table (mobile cards)',
  render: () => <ServicesTable />,
  globals: { viewport: { value: 'mobile375' } },
};
