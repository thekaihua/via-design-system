/**
 * Representative screens from the design file, built only from library components. They prove the
 * components compose into real pages; they are not product code.
 */
import { CircleCheck, CircleX, Plus, Send, Webhook } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/AppShell/PageHeader';
import { Badge, type BadgeTone } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { ButtonGroup } from '../components/Button/ButtonGroup';
import { Chart } from '../components/Chart/Chart';
import { AnalyticsFilterBar, ChartPanel, Metric, MetricGroup } from '../components/Chart/Metrics';
import { DataTable, type DataTableColumn } from '../components/DataTable/DataTable';
import { TableFooter } from '../components/DataTable/TableParts';
import { Dialog } from '../components/Dialog/Dialog';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { ContentPanel } from '../components/Layout/Layout';
import { ItemList, ListItem } from '../components/ListItem/ListItem';
import { OverflowMenu } from '../components/OverflowMenu/OverflowMenu';
import { PropertyList } from '../components/PropertyList/PropertyList';
import { CheckItem, DecisionPanel } from '../components/Review/Review';
import { SearchField } from '../components/SearchField/SearchField';
import { Select } from '../components/Select/Select';
import { Tabs } from '../components/Tabs/Tabs';
import { toast } from '../components/Toast/Toast';
import { paymentVolume, requestActivity, webhookActivity } from '../patterns/charts';
import { AdminFrame, Columns, CustomerFrame } from '../patterns/frame';
import styles from '../patterns/patterns.module.css';

const devTabs = (
  <Tabs
    aria-label="Developer sections"
    variant="page"
    items={[
      { id: 'overview', label: 'Overview' },
      { id: 'keys', label: 'API keys' },
      { id: 'events', label: 'Event log' },
      { id: 'webhooks', label: 'Webhooks' },
    ]}
  />
);

function Filters({ range = '8:10–12:10 UTC', granularity = '30 minutes', context = 'UTC · sandbox sample' }) {
  return (
    <AnalyticsFilterBar context={context} onRefresh={() => toast('Analytics refreshed')}>
      <Select label="Period" size="md" defaultValue="r" options={[{ value: 'r', label: range }]} />
      <Select label="Granularity" defaultValue="g" options={[{ value: 'g', label: granularity }, { value: 'h', label: 'Hourly' }]} />
      <Select label="Compare with" defaultValue="none" options={[{ value: 'none', label: 'No comparison' }, { value: 'prev', label: 'Previous period' }]} />
    </AnalyticsFilterBar>
  );
}

const fixture = 'Illustrative sandbox fixture · 8:10–12:10 UTC · sample snapshot 12:10 UTC';

function WebhookPanel() {
  return (
    <ChartPanel
      title="Webhook deliveries"
      metrics={
        <MetricGroup label="Webhook totals">
          <Metric label="Total deliveries" value="1,458" context="8:10–12:10 UTC" definition="Sum of 8 delivery buckets" />
        </MetricGroup>
      }
      footer={fixture}
    >
      <Chart
        title="Deliveries per 30 minutes"
        summary="Deliveries rose to 221 in the latest 30 minutes."
        type="bar"
        data={webhookActivity}
        xKey="time"
        series={[{ key: 'deliveries', label: 'Deliveries', color: 1 }]}
      />
    </ChartPanel>
  );
}

export function DevelopersOverview() {
  return (
    <CustomerFrame active="dev-overview">
      <PageHeader context="Developers" title="Developers" description="Test and monitor your integration: keys, requests, events and webhooks." tabs={devTabs} />
      <div className={styles.stack}>
        <Filters />
        <ChartPanel
          title="Request activity"
          metrics={
            <MetricGroup label="Request totals">
              <Metric label="Successful" value="94" context="143 requests · same window" definition="Successful responses" />
              <Metric label="Errors" value="49" tone="error" context="143 requests · same window" definition="Failed responses" />
              <Metric label="Success rate" value="65.73%" context="94 of 143 requests" definition="94 ÷ (94 + 49) × 100" />
            </MetricGroup>
          }
          footer={fixture}
        >
          <Chart
            title="Requests per 30 minutes"
            summary="Errors peaked at 9 between 10:10 and 10:40; the success rate for the window is 65.73%."
            data={requestActivity}
            xKey="time"
            series={[
              { key: 'successful', label: 'Successful', color: 1 },
              { key: 'errors', label: 'Errors', color: 'error' },
            ]}
          />
        </ChartPanel>
        <WebhookPanel />
      </div>
    </CustomerFrame>
  );
}

interface Payment {
  id: string;
  date: string;
  status: 'Succeeded' | 'Failed';
  amount: string;
  description: string;
}
const payments: Payment[] = [
  { id: 'pay_0001', date: '29 Jun 2018', status: 'Succeeded', amount: '$35.00', description: 'Test' },
  { id: 'pay_0002', date: '29 Jun 2018', status: 'Succeeded', amount: '$35.00', description: 'Test' },
  { id: 'pay_0003', date: '29 Jun 2018', status: 'Succeeded', amount: '$35.00', description: 'Test' },
  { id: 'pay_0004', date: '29 Jun 2018', status: 'Succeeded', amount: '$35.00', description: 'Test' },
  { id: 'pay_0005', date: '29 Jun 2018', status: 'Failed', amount: '$35.00', description: 'Test' },
];

export function Transactions({ onOpen }: { onOpen?: (p: Payment) => void }) {
  const [q, setQ] = useState('');
  const rows = payments.filter((p) => !q || p.id.includes(q) || p.description.toLowerCase().includes(q.toLowerCase()));
  const columns: DataTableColumn<Payment>[] = [
    { key: 'date', header: 'Date', width: 160 },
    { key: 'status', header: 'Status', width: 160, render: (p) => <Badge tone={p.status === 'Failed' ? 'negative' : 'positive'}>{p.status}</Badge> },
    { key: 'amount', header: 'Amount (USD)', numeric: true, width: 160 },
    { key: 'description', header: 'Description' },
  ];
  return (
    <CustomerFrame active="transactions">
      <PageHeader title="Transactions" description="Payments across all your services. Open a payment to see its details." />
      <div className={styles.stack}>
        <Filters range="29 Jun 2018" granularity="Hourly" context="USD · UTC · sandbox sample" />
        <ChartPanel
          title="Gross volume"
          metrics={
            <MetricGroup label="Volume">
              <Metric label="Gross volume" value="$140.00" context="29 Jun 2018 · USD" definition="4 successful payments × $35" />
              <Metric label="Previous day" value="$0.00" context="28 Jun 2018 · USD" definition="Previous sample day" />
            </MetricGroup>
          }
        >
          <Chart
            title="Cumulative volume"
            summary="$140.00 by 11:10, against none the previous day."
            type="area"
            data={paymentVolume}
            xKey="time"
            locale="en-US"
            yFormat={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
            series={[
              { key: 'volume', label: '29 Jun 2018', color: 1 },
              { key: 'previous', label: 'Previous day', color: 2, dashed: true, as: 'line' },
            ]}
          />
        </ChartPanel>
        <ContentPanel title="Transactions" actions={<SearchField label="Search payments" hideLabel placeholder="Search payments" size="sm" value={q} onChange={setQ} />}>
          <DataTable
            caption="Transactions"
            columns={columns}
            rows={rows}
            onRowClick={onOpen}
            rowLabel={(p) => `${p.amount} payment ${p.id}`}
            footer={<TableFooter summary={`Showing 1–${rows.length} of ${rows.length} payments`} />}
          />
        </ContentPanel>
      </div>
    </CustomerFrame>
  );
}

export function PaymentDetail() {
  return (
    <CustomerFrame active="transactions">
      <PageHeader
        context="Transactions / Payment"
        title="$35.00"
        description={<Badge tone="positive">Succeeded</Badge>}
        actions={
          <OverflowMenu
            label="Actions for payment pay_sample_0001"
            items={[
              { label: 'Copy payment ID', onSelect: () => toast('Payment ID copied') },
              { label: 'Refund payment', destructive: true, onSelect: () => {} },
            ]}
          />
        }
      />
      <PropertyList
        layout="stacked"
        className={styles.summaryStrip}
        items={[
          { label: 'Date', value: '29 Jun 2018, 14:02' },
          { label: 'Service', value: 'App A' },
          { label: 'API product', value: 'Card payments' },
          { label: 'Market', value: 'Singapore' },
        ]}
      />
      <Columns
        primary={
          <ContentPanel title="Payment details">
            <PropertyList
              items={[
                { label: 'Payment ID', value: 'pay_sample_0001', mono: true, copyable: 'pay_sample_0001' },
                { label: 'Amount', value: '$35.00 USD' },
                { label: 'Description', value: 'Test' },
                { label: 'Customer', value: '+65 •••• 4567' },
              ]}
            />
          </ContentPanel>
        }
        side={
          <ContentPanel title="Timeline">
            <ItemList label="Payment timeline">
              <ListItem icon={CircleCheck} title="Payment succeeded" description="29 Jun 2018, 14:02" />
              <ListItem icon={Webhook} title="Webhook delivered" description="29 Jun 2018, 14:02" />
              <ListItem icon={Send} title="Payment created" description="29 Jun 2018, 14:01" />
            </ItemList>
          </ContentPanel>
        }
      />
    </CustomerFrame>
  );
}

interface Endpoint {
  id: string;
  url: string;
  service: string;
  status: { label: string; tone: BadgeTone };
  events: string;
  success: string;
}
const endpoints: Endpoint[] = [
  { id: 'we_1', url: 'https://api.numberone.sg/webhooks/via', service: 'App A · Production', status: { label: 'Active', tone: 'positive' }, events: '4 events', success: '99.2%' },
  { id: 'we_2', url: 'https://staging.numberone.sg/hooks', service: 'Service B · Staging', status: { label: 'Paused', tone: 'neutral' }, events: '2 events', success: '—' },
  { id: 'we_3', url: 'https://hooks.example.com/payments', service: 'Product C', status: { label: 'Failing', tone: 'negative' }, events: '1 event', success: '61.0%' },
];

export function Webhooks() {
  return (
    <CustomerFrame active="webhooks">
      <PageHeader
        context="Developers"
        title="Developers"
        description="Test and monitor your integration: keys, requests, events and webhooks."
        actions={<Button leadingIcon={Plus}>Add endpoint</Button>}
        tabs={devTabs}
      />
      <div className={styles.stack}>
        <Filters />
        <WebhookPanel />
        <ContentPanel title="Endpoints" description="We send events to these URLs.">
          <DataTable
            caption="Endpoints"
            columns={[
              { key: 'url', header: 'Endpoint', render: (e) => e.url, secondary: (e) => e.service },
              { key: 'status', header: 'Status', width: 140, render: (e) => <Badge tone={e.status.tone}>{e.status.label}</Badge> },
              { key: 'events', header: 'Events', width: 120 },
              { key: 'success', header: 'Success · 7 days', numeric: true, width: 160 },
            ]}
            rows={endpoints}
            onRowClick={() => {}}
            rowLabel={(e) => e.url}
            footer={<TableFooter summary="3 endpoints" />}
          />
        </ContentPanel>
      </div>
    </CustomerFrame>
  );
}

interface Business {
  id: string;
  name: string;
  scope: string;
  submitted: string;
  waiting: string;
  assignee: string;
  status: { label: string; tone: BadgeTone };
}
const businesses: Business[] = [
  { id: 'b1', name: 'Kopi Games Pte Ltd', scope: 'Singapore · 2 services', submitted: '24 Oct 2026', waiting: '8 days', assignee: 'Aisha Lim', status: { label: 'In review', tone: 'info' } },
  { id: 'b2', name: 'Lumen Pay', scope: 'Thailand · 1 service', submitted: '25 Oct 2026', waiting: '7 days', assignee: 'Unassigned', status: { label: 'In review', tone: 'info' } },
  { id: 'b3', name: 'Halo Studio Apps', scope: 'Philippines · 3 services', submitted: '29 Oct 2026', waiting: '3 days', assignee: 'Daniel Ong', status: { label: 'Resubmitted', tone: 'warning' } },
  { id: 'b4', name: 'Number One', scope: 'Singapore · 3 services', submitted: '31 Oct 2026', waiting: '1 day', assignee: 'Unassigned', status: { label: 'In review', tone: 'info' } },
  { id: 'b5', name: 'Mango Media', scope: 'Singapore · 1 service', submitted: '31 Oct 2026', waiting: '1 day', assignee: 'Unassigned', status: { label: 'In review', tone: 'info' } },
];

export function ReviewQueue() {
  const [filters, setFilters] = useState<Record<string, string | null>>({ status: null, assignee: null, market: null });
  const rows = businesses.filter(
    (b) =>
      (!filters.assignee || (filters.assignee === 'none' ? b.assignee === 'Unassigned' : b.assignee !== 'Unassigned')) &&
      (!filters.market || b.scope.startsWith(filters.market)),
  );
  return (
    <AdminFrame active="queue">
      <PageHeader
        title="Review queue"
        description="Go-live applications and new services waiting for a decision. Oldest first."
        tabs={
          <Tabs
            aria-label="Review queue"
            variant="page"
            items={[
              { id: 'businesses', label: 'Businesses · 12' },
              { id: 'services', label: 'Services · 5' },
              { id: 'decided', label: 'Decided' },
            ]}
          />
        }
      />
      <div className={styles.stack}>
        <FilterBar
          search={<SearchField label="Search businesses" hideLabel placeholder="Search businesses" size="sm" />}
          filters={[
            { id: 'status', label: 'Status', value: filters.status, options: [{ value: 'review', label: 'In review' }, { value: 'resubmitted', label: 'Resubmitted' }] },
            { id: 'assignee', label: 'Assignee', value: filters.assignee, options: [{ value: 'none', label: 'Unassigned' }, { value: 'any', label: 'Assigned' }] },
            { id: 'market', label: 'Market', value: filters.market, options: ['Singapore', 'Thailand', 'Philippines'].map((m) => ({ value: m, label: m })) },
          ]}
          onChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
          onClearAll={() => setFilters({ status: null, assignee: null, market: null })}
        />
        <ContentPanel title="Businesses awaiting review">
          <DataTable
            caption="Businesses awaiting review"
            columns={[
              { key: 'name', header: 'Business', secondary: (b) => b.scope },
              { key: 'submitted', header: 'Submitted', width: 140 },
              { key: 'waiting', header: 'Waiting', width: 100 },
              { key: 'assignee', header: 'Assignee', width: 140 },
              { key: 'status', header: 'Status', width: 140, render: (b) => <Badge tone={b.status.tone}>{b.status.label}</Badge> },
            ]}
            rows={rows}
            onRowClick={() => {}}
            rowLabel={(b) => b.name}
            footer={<TableFooter summary={`Showing ${rows.length} of 12`} page={1} pageCount={3} onPageChange={() => {}} />}
          />
        </ContentPanel>
      </div>
    </AdminFrame>
  );
}

export function BusinessReview() {
  const [confirmReject, setConfirmReject] = useState(false);
  const [decided, setDecided] = useState<string | null>(null);
  return (
    <AdminFrame active="queue">
      <PageHeader
        context="Review queue / Businesses / Number One"
        title="Number One"
        description={<Badge tone={decided ? 'positive' : 'info'}>{decided ?? 'In review'}</Badge>}
        actions={
          <ButtonGroup>
            <Button variant="secondary">Assign to me</Button>
            <OverflowMenu label="More actions for Number One" items={[{ label: 'View audit log', onSelect: () => {} }]} />
          </ButtonGroup>
        }
      />
      <PropertyList
        layout="stacked"
        className={styles.summaryStrip}
        items={[
          { label: 'Submitted', value: '31 Oct 2026' },
          { label: 'Waiting', value: '1 day' },
          { label: 'Services', value: '3 · all in sandbox' },
          { label: 'Market', value: 'Singapore' },
        ]}
      />
      <Columns
        primary={
          <>
            <ContentPanel title="Checks" description="Complete every check before you decide. 3 of 5 passed.">
              <div>
                <CheckItem title="Company registration" detail="UEN A0123456Z matches the uploaded certificate." result="passed" />
                <CheckItem title="Identity of controller" detail="NRIC photo is blurred; name can't be read." result="needs-review" />
                <CheckItem title="Sanctions and AML screening" detail="No matches for the company or controller." result="passed" />
                <CheckItem title="Bank account" detail="Account name doesn't match the company name." result="failed" />
                <CheckItem title="Prohibited categories" detail="3 services checked. None in a prohibited category." result="passed" />
              </div>
            </ContentPanel>
            <ContentPanel title="Company details">
              <PropertyList
                items={[
                  { label: 'Company name', value: 'Number One' },
                  { label: 'UEN', value: 'A0123456Z', mono: true },
                  { label: 'Type of business', value: 'Company' },
                  { label: 'Address', value: 'Street 123, Singapore 123456' },
                ]}
              />
            </ContentPanel>
            <ContentPanel title="Individual details">
              <PropertyList
                items={[
                  { label: 'Name', value: 'Timothy Cain' },
                  { label: 'Identity document', value: 'NRIC · S1234567A' },
                  { label: 'Documents', value: 'nric-front.jpg, nric-back.jpg' },
                ]}
              />
            </ContentPanel>
            <ContentPanel title="Bank details">
              <PropertyList
                items={[
                  { label: 'Bank and branch code', value: '1234 · 123' },
                  { label: 'Account number', value: '•••• 6789' },
                  { label: 'Account name', value: 'T. Cain' },
                  { label: 'Statement descriptor', value: 'NUMBER ONE' },
                ]}
              />
            </ContentPanel>
          </>
        }
        side={
          <>
            <DecisionPanel
              onApprove={() => {
                setDecided('Approved');
                toast('Number One approved. Live keys created and the customer emailed.');
              }}
              onRequestChanges={() => toast('Requested changes sent to Number One.')}
              onReject={() => setConfirmReject(true)}
            />
            <ContentPanel title="Activity">
              <ItemList label="Review activity">
                <ListItem icon={Send} title="Submitted by Timothy Cain" meta="31 Oct 2026" />
                <ListItem icon={CircleCheck} title="Automatic AML screening passed" meta="31 Oct 2026" />
              </ItemList>
            </ContentPanel>
          </>
        }
      />
      <Dialog
        open={confirmReject}
        onClose={() => setConfirmReject(false)}
        destructive
        title="Reject Number One?"
        description="The business can’t go live and can’t resubmit for 30 days. They get an email with your reason."
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setConfirmReject(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              leadingIcon={CircleX}
              onClick={() => {
                setConfirmReject(false);
                setDecided('Rejected');
              }}
            >
              Reject business
            </Button>
          </ButtonGroup>
        }
      />
    </AdminFrame>
  );
}

