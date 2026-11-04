import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen, Inbox, LockKeyhole, RotateCw } from 'lucide-react';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Badge } from '../components/Badge/Badge';
import { Banner } from '../components/Banner/Banner';
import { Button } from '../components/Button/Button';
import { DataTable, type DataTableColumn } from '../components/DataTable/DataTable';
import { TableToolbar } from '../components/DataTable/TableParts';
import { RegionState } from '../components/RegionState/RegionState';
import styles from './patterns.module.css';

interface EventRow {
  id: string;
  type: string;
  status: 'Delivered' | 'Failed';
  time: string;
}

const events: EventRow[] = [
  { id: 'evt_3Fq81', type: 'payment.succeeded', status: 'Delivered', time: '09:41' },
  { id: 'evt_3Fq7z', type: 'payment.failed', status: 'Failed', time: '09:38' },
  { id: 'evt_3Fq7c', type: 'payout.paid', status: 'Delivered', time: '09:12' },
  { id: 'evt_3Fq6w', type: 'payment.succeeded', status: 'Delivered', time: '08:57' },
];

const columns: DataTableColumn<EventRow>[] = [
  { key: 'id', header: 'ID', width: 140 },
  { key: 'type', header: 'Event' },
  { key: 'status', header: 'Status', width: 140, render: (r) => <Badge tone={r.status === 'Failed' ? 'negative' : 'positive'}>{r.status}</Badge> },
  { key: 'time', header: 'Time (UTC)', width: 120, align: 'end' },
];

/**
 * Event log that keeps the last good results when a refresh fails (Data / Retain results on refresh failure).
 * `fail` simulates the next refresh failing.
 */
function EventLog({ initial = 'data' as 'data' | 'stale' | 'error' | 'loading' }) {
  const [state, setState] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const toolbar = useRef<HTMLDivElement>(null);
  const refresh = (ok: boolean, fromBanner = false) => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setState(ok ? 'data' : 'error');
      // The banner (and its button) goes away on success: put focus somewhere that still exists.
      if (ok && fromBanner) toolbar.current?.querySelector('button')?.focus();
    }, 300);
  };
  return (
    <div className={styles.stack}>
      {state === 'stale' && (
        <Banner type="caution" title="Showing the last loaded snapshot" description="Data may be out of date. Your previous results remain visible." />
      )}
      {state === 'error' && (
        <Banner
          type="critical"
          title="Couldn’t refresh activity"
          description="Your previous results are still displayed. Try refreshing again."
          actions={
            // No pending state here: the button is removed when the retry works, and the table already shows it's busy.
            <Button size="sm" variant="secondary" leadingIcon={RotateCw} disabled={refreshing} onClick={() => refresh(true, true)}>
              Try again
            </Button>
          }
        />
      )}
      <div ref={toolbar}>
      <TableToolbar
        title="Event log"
        actions={
          <Button size="sm" variant="secondary" leadingIcon={RotateCw} loading={refreshing} onClick={() => refresh(false)}>
            Refresh
          </Button>
        }
      />
      </div>
      <DataTable caption="Event log" columns={columns} rows={state === 'loading' ? [] : events} loading={state === 'loading' || refreshing} />
    </div>
  );
}

const meta = {
  title: 'Patterns/Dashboard recovery',
  decorators: [(Story) => <div style={{ maxWidth: 960 }}>{Story()}</div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const RegionStates: Story = {
  name: 'Empty, no match and no access',
  render: () => (
    <div className={styles.stack}>
      <RegionState
        kind="empty"
        icon={Inbox}
        title="No activity yet"
        description="Events will appear after the first request reaches your service."
        action={
          <Button variant="secondary" leadingIcon={BookOpen}>
            View API docs
          </Button>
        }
      />
      <RegionState kind="no-results" title="No results match your filters" description="Try a broader search or clear the active filters." action={<Button variant="secondary">Clear filters</Button>} />
      <RegionState
        kind="empty"
        icon={LockKeyhole}
        title="You don’t have access"
        description="Ask your workspace owner to enable access to this data."
        action={<Button variant="secondary">Request access</Button>}
      />
    </div>
  ),
};

export const Loading: Story = {
  name: 'Loading table',
  render: () => <EventLog initial="loading" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: 'Event log' })).toHaveAttribute('aria-busy', 'true');
  },
};

export const Stale: Story = { name: 'Stale: keep the snapshot', render: () => <EventLog initial="stale" /> };

export const RefreshFails: Story = {
  name: 'Refresh fails: keep the results',
  render: () => <EventLog />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Refresh' }));
    // The error explains itself, and the last good rows stay on screen.
    await canvas.findByText('Couldn’t refresh activity', {}, { timeout: 2000 });
    await expect(canvas.getByRole('cell', { name: 'evt_3Fq7z' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(canvas.queryByText('Couldn’t refresh activity')).toBeNull(), { timeout: 2000 });
    await expect(canvas.getByRole('button', { name: 'Refresh' })).toHaveFocus();
  },
};
