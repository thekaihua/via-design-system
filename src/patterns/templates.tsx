import { Banknote, CircleX, Webhook } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/AppShell/PageHeader';
import { Badge } from '../components/Badge/Badge';
import { Banner } from '../components/Banner/Banner';
import { Button } from '../components/Button/Button';
import { ButtonGroup } from '../components/Button/ButtonGroup';
import { Chart } from '../components/Chart/Chart';
import { ChartPanel, Meter, Metric, MetricGroup } from '../components/Chart/Metrics';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { CopyableValue } from '../components/CodeBlock/CodeBlock';
import { DateRangePicker } from '../components/DateField/DateRangePicker';
import type { DateRange } from '../components/DateField/dates';
import { Dialog } from '../components/Dialog/Dialog';
import { FocusView } from '../components/FocusView/FocusView';
import { ContentPanel } from '../components/Layout/Layout';
import { ItemList, ListItem } from '../components/ListItem/ListItem';
import { OverflowMenu } from '../components/OverflowMenu/OverflowMenu';
import { PropertyList } from '../components/PropertyList/PropertyList';
import { Select } from '../components/Select/Select';
import { SetupTasks } from '../components/SetupTasks/SetupTasks';
import { Switch } from '../components/Switch/Switch';
import { Tabs } from '../components/Tabs/Tabs';
import { TextField } from '../components/TextField/TextField';
import { toast } from '../components/Toast/Toast';
import { Columns, CustomerFrame } from './frame';
import styles from './patterns.module.css';

const days = ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'];
const payments = days.map((day, i) => ({ day, payments: [1620, 1810, 1745, 1990, 1402, 1288, 2625][i] }));

/** Template / Overview page: greeting, period, key metrics, a chart, usage, and the next task. */
export function OverviewPage() {
  const [range, setRange] = useState<DateRange | null>({ start: '2026-10-27', end: '2026-11-02' });
  return (
    <CustomerFrame active="home">
      <PageHeader
        context="Home"
        title="Good morning, Shop Example"
        actions={<DateRangePicker label="Period" hideLabel value={range} onChange={setRange} timeZone="Asia/Singapore" />}
      />
      <Columns
        primary={
          <>
            <MetricGroup label="Last 7 days">
              <Metric label="Successful payments" value="12,480" delta={{ value: '8.2%', direction: 'up' }} context="vs previous period" trend={[9, 11, 10, 12, 11, 13, 14]} />
              <Metric label="Gross volume" value="SGD 312,400" delta={{ value: '5.1%', direction: 'up' }} context="vs previous period" trend={[20, 21, 22, 21, 24, 25, 26]} />
              <Metric
                label="Failed payments"
                value="214"
                tone="error"
                delta={{ value: '12%', direction: 'up', good: 'down' }}
                context="vs previous period"
                trend={[3, 2, 4, 3, 5, 4, 6]}
              />
            </MetricGroup>
            <ChartPanel title="Payments by day">
              <Chart title="Successful payments" summary="Monday 02 Nov was the busiest day, with 2,625 payments." data={payments} xKey="day" xType="date" type="bar" series={[{ key: 'payments', label: 'Payments', color: 1 }]} context="Times in Asia/Singapore" />
            </ChartPanel>
            <ContentPanel title="Plan usage">
              <Meter label="API calls · November" value={46210} max={100000} locale="en-SG" />
              <Meter label="Webhook endpoints" value={4} max={5} locale="en-SG" />
            </ContentPanel>
          </>
        }
        side={
          <SetupTasks
            title="Go live · 2 of 4 done"
            tasks={[
              { id: 'svc', title: 'Create a sandbox service', description: 'Done 12 Oct', status: 'done', href: '#svc' },
              { id: 'test', title: 'Send a test payment', description: 'Done 14 Oct', status: 'done', href: '#test' },
              { id: 'kyc', title: 'Verify business details', description: 'About 5 minutes', status: 'current', href: '#kyc' },
              { id: 'bank', title: 'Add a settlement account', description: 'After verification', status: 'todo' },
            ]}
          />
        }
      />
    </CustomerFrame>
  );
}

/** Template / Detail page: title + status, summary strip, details and activity, keys at the side. Edit opens a Focus view. */
export function DetailPage() {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState('https://shop.example/webhooks/payments');
  const [draft, setDraft] = useState(url);
  return (
    <CustomerFrame active="services" environment="live">
      <PageHeader
        context="Services / Production orders"
        title="Production orders"
        description={<Badge tone="positive">Live</Badge>}
        actions={
          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(url);
                setEditing(true);
              }}
            >
              Edit service
            </Button>
            <OverflowMenu
              label="More actions for Production orders"
              items={[
                { label: 'Duplicate service', onSelect: () => {} },
                { label: 'Pause service', destructive: true, onSelect: () => {} },
              ]}
            />
          </ButtonGroup>
        }
      />
      <PropertyList
        layout="stacked"
        className={styles.summaryStrip}
        items={[
          { label: 'Created', value: '12 Oct 2026, 09:41' },
          { label: 'Mode', value: 'Live' },
          { label: 'API version', value: '2026-09-30' },
          { label: 'Owner', value: 'ops@shop.example' },
        ]}
      />
      <Columns
        primary={
          <>
            <ContentPanel title="Details">
              <PropertyList
                items={[
                  { label: 'Service ID', value: 'svc_7Hq2LmX9', mono: true, copyable: 'svc_7Hq2LmX9' },
                  { label: 'Service type', value: 'Card payments' },
                  { label: 'Settlement', value: 'SGD · weekly on Monday' },
                  { label: 'Webhook URL', value: url, mono: true },
                ]}
              />
            </ContentPanel>
            <ContentPanel title="Recent events">
              <ItemList>
                <ListItem icon={Webhook} title="payment.succeeded" description="SGD 25.00 · cus_8812" meta="2 min ago" href="#evt_1" />
                <ListItem icon={CircleX} title="payment.failed" description="Insufficient balance · cus_1290" meta="14 min ago" href="#evt_2" />
                <ListItem icon={Banknote} title="payout.paid" description="SGD 4,820.00 to DBS ••42" meta="1 h ago" href="#evt_3" />
              </ItemList>
            </ContentPanel>
          </>
        }
        side={
          <>
            <Banner type="caution" title="Secret key expires in 14 days" description="Roll the key before 18 Nov 2026 to avoid failed requests." actions={<Button size="sm" variant="secondary">Roll key</Button>} />
            <ContentPanel title="API keys">
              <CopyableValue label="Publishable key" value="pk_live_51HxR2kQ2c" description="Safe to use in client code" />
              <CopyableValue label="Secret key" value="sk_live_9fK2mPq7Ra9Q" masked description="Last used 2 hours ago" />
            </ContentPanel>
          </>
        }
      />
      <FocusView
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit service"
        description="Production orders · Live mode"
        confirmClose={draft !== url}
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setUrl(draft);
                setEditing(false);
                toast('Service saved');
              }}
            >
              Save
            </Button>
          </ButtonGroup>
        }
      >
        <TextField label="Endpoint URL" type="url" value={draft} onChange={setDraft} description="We send payment events here." />
        <Checkbox label="Retry failed deliveries for 3 days" defaultChecked />
      </FocusView>
    </CustomerFrame>
  );
}

/** Template / Settings view: tabs, then sections with an intro on the left and fields on the right. */
export function SettingsPage() {
  const [closing, setClosing] = useState(false);
  return (
    <CustomerFrame active="settings">
      <PageHeader
        title="Settings"
        tabs={
          <Tabs
            aria-label="Settings sections"
            variant="page"
            items={[
              { id: 'business', label: 'Business' },
              { id: 'team', label: 'Team' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'developers', label: 'Developers' },
            ]}
          />
        }
      />
      <section className={styles.settingsSection} aria-labelledby="s-profile">
        <div>
          <h2 id="s-profile" className={styles.sectionTitle}>
            Business profile
          </h2>
          <p className={styles.note}>Shown on receipts and to payment partners.</p>
        </div>
        <form className={styles.sectionFields} onSubmit={(e) => e.preventDefault()}>
          <TextField label="Legal business name" defaultValue="Shop Example Pte. Ltd." autoComplete="organization" />
          <TextField label="Support email" type="email" defaultValue="support@shop.example" />
          <Select
            label="Business timezone"
            description="Used for reports, payouts and date filters."
            defaultValue="Asia/Singapore"
            options={[
              { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
              { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala Lumpur (UTC+8)' },
              { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
            ]}
          />
          <ButtonGroup>
            <Button variant="secondary">Discard changes</Button>
            <Button type="submit" onClick={() => toast('Profile saved')}>
              Save profile
            </Button>
          </ButtonGroup>
        </form>
      </section>
      <section className={styles.settingsSection} aria-labelledby="s-email">
        <div>
          <h2 id="s-email" className={styles.sectionTitle}>
            Email notifications
          </h2>
          <p className={styles.note}>Changes apply immediately.</p>
        </div>
        <div className={styles.sectionFields}>
          <Switch label="Failed payments" description="When a payment fails twice for the same customer." defaultChecked />
          <Switch label="Payout summaries" description="Weekly, every Monday at 09:00." defaultChecked />
          <Switch label="Product updates" description="New features and API changes." />
        </div>
      </section>
      <section className={styles.settingsSection} aria-labelledby="s-close">
        <div>
          <h2 id="s-close" className={styles.sectionTitle}>
            Close account
          </h2>
          <p className={styles.note}>Permanently remove this account, its services and keys.</p>
        </div>
        <div className={styles.sectionFields}>
          <Banner type="critical" title="This cannot be undone" description="Settle open payouts before closing. Transaction history is kept for 7 years as required by law." />
          <div>
            <Button variant="destructive" onClick={() => setClosing(true)}>
              Close account…
            </Button>
          </div>
        </div>
      </section>
      <Dialog
        open={closing}
        onClose={() => setClosing(false)}
        destructive
        title="Close Shop Example?"
        description="Your services and API keys stop working immediately. You can’t reopen the account."
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setClosing(false)}>
              Keep account
            </Button>
            <Button variant="destructive" onClick={() => setClosing(false)}>
              Close account
            </Button>
          </ButtonGroup>
        }
      />
    </CustomerFrame>
  );
}

