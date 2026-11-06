import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Activity,
  ArrowLeftRight,
  BadgePercent,
  BookOpen,
  Building2,
  CodeXml,
  House,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Layers,
  List,
  Plus,
  ScrollText,
  Settings,
  ShieldCheck,
  Webhook,
} from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { SearchField } from '../SearchField/SearchField';
import { Tabs } from '../Tabs/Tabs';
import { AppHeader, type Environment } from './AppHeader';
import { AppShell } from './AppShell';
import { AppSidebar } from './AppSidebar';
import type { NavItem } from './SideNav';
import { PageHeader } from './PageHeader';

const customerNav: NavItem[] = [
  { id: 'home', label: 'Home', icon: House, href: '#home' },
  { id: 'services', label: 'Services', icon: Layers, href: '#services' },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, href: '#transactions' },
  { id: 'rates', label: 'Rate card', icon: BadgePercent, href: '#rates' },
  {
    id: 'developers',
    label: 'Developers',
    icon: CodeXml,
    href: '#developers',
    children: [
      { id: 'dev-overview', label: 'Overview', icon: Activity, href: '#developers' },
      { id: 'keys', label: 'API keys', icon: KeyRound, href: '#keys' },
      { id: 'events', label: 'Event log', icon: List, href: '#events' },
      { id: 'webhooks', label: 'Webhooks', icon: Webhook, href: '#webhooks' },
    ],
  },
];

const secondary: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '#settings' },
  { id: 'docs', label: 'Full Documentation', icon: BookOpen, href: '#docs' },
];

function CustomerApp({ active = 'dev-overview' }: { active?: string }) {
  const [env, setEnv] = useState<Environment>('sandbox');
  return (
    <AppShell
      header={
        <AppHeader
          search={<SearchField label="Search services or transactions" placeholder="Search services or transactions" shortcut="/" />}
          onSearch={() => {}}
          environment={env}
          onEnvironmentChange={setEnv}
          docsHref="#docs"
          onNotifications={() => {}}
          notificationCount={2}
          user={{ name: 'Timothy Cain' }}
        />
      }
      sidebar={
        <AppSidebar
          workspace={{ id: 'op', name: 'Acme Pay', context: env === 'live' ? 'Live workspace' : 'Sandbox workspace', icon: Building2 }}
          workspaces={[
            { id: 'op', name: 'Acme Pay', context: 'Sandbox workspace' },
            { id: 'shop', name: 'Shop Example Pte Ltd', context: 'Live workspace' },
          ]}
          items={customerNav}
          secondaryItems={secondary}
          active={active}
        />
      }
    >
      <PageHeader
        context="Developers"
        title="Developer overview"
        description="Monitor your sandbox integration and investigate failed requests."
        actions={<Button leadingIcon={Plus}>Create API key</Button>}
        tabs={
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
        }
      />
      <p>Page content.</p>
    </AppShell>
  );
}

function AdminApp() {
  return (
    <AppShell
      header={<AppHeader role="admin" search={<SearchField label="Search customers" placeholder="Search customers or reviews" />} docsHref="#docs" user={{ name: 'Aisha Lim' }} />}
      sidebar={
        <AppSidebar
          workspace={{ id: 'admin', name: 'Acme Pay', context: 'Admin console', icon: ShieldCheck }}
          items={[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '#overview' },
            { id: 'queue', label: 'Review queue', icon: Inbox, href: '#queue', badge: '12' },
            { id: 'customers', label: 'Customers', icon: Building2, href: '#customers' },
            { id: 'audit', label: 'Audit log', icon: ScrollText, href: '#audit' },
          ]}
          secondaryItems={secondary}
          active="queue"
          aria-label="Admin"
        />
      }
    >
      <PageHeader title="Review queue" description="Businesses and services waiting for a decision." />
    </AppShell>
  );
}

const meta = {
  title: 'App shell/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: { header: null, sidebar: null, children: null },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Customer: Story = {
  render: () => <CustomerApp />,
  play: async ({ canvas }) => {
    // Skip link is first in the tab order and moves focus to main.
    await userEvent.tab();
    const skip = canvas.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('main')).toHaveFocus();
    // The page title isn't hidden under the sticky header after skipping.
    const header = canvas.getByRole('banner').getBoundingClientRect();
    await expect(canvas.getByRole('heading', { level: 1 }).getBoundingClientRect().top).toBeGreaterThanOrEqual(header.bottom);

    const nav = canvas.getByRole('navigation', { name: 'Main' });
    // The current page is marked, and its group starts open.
    await expect(within(nav).getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    const group = within(nav).getByRole('button', { name: 'Developers' });
    await expect(group).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(group);
    await expect(group).toHaveAttribute('aria-expanded', 'false');
    // Collapsed means not rendered, not just announced as collapsed (the browser decides, not the attribute).
    const keys = within(nav).getByRole('link', { name: 'API keys', hidden: true });
    await expect(keys.checkVisibility()).toBe(false);
    await userEvent.click(group);
    await expect(within(nav).getByRole('link', { name: 'API keys' })).toBeVisible();
    await expect(canvas.getByRole('heading', { level: 1, name: 'Developer overview' })).toBeInTheDocument();
  },
};

export const LandmarksAndHeader: Story = {
  name: 'Header controls',
  render: () => <CustomerApp active="transactions" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^Sandbox environment/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^Timothy Cain account menu/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'via home' })).toBeInTheDocument();
  },
};

export const Admin: Story = { render: () => <AdminApp /> };

export const Tablet: Story = {
  name: 'Icon rail (tablet)',
  render: () => <CustomerApp />,
  globals: { viewport: { value: 'tablet' } },
  play: async ({ canvas }) => {
    await document.fonts.ready;
    // Every rail icon shares one centre line, workspace switcher included.
    const rail = canvas.getByRole('navigation', { name: 'Main' });
    const centres = [...rail.querySelectorAll('svg')].map((svg) => {
      const r = svg.getBoundingClientRect();
      return Math.round(r.left + r.width / 2);
    });
    await expect(new Set(centres).size).toBe(1);
    // A classic scroll bar, when the system shows one, takes the same space on both sides.
    await expect(getComputedStyle(rail).scrollbarGutter).toBe('stable both-edges');
    // The account button keeps a round avatar and the name on one line.
    const account = canvas.getByRole('button', { name: /account menu/ });
    const avatar = account.querySelector('[aria-hidden="true"]')!.getBoundingClientRect();
    await expect([Math.round(avatar.width), Math.round(avatar.height)]).toEqual([36, 36]);
    const name = within(account).getByText('Timothy Cain');
    // One line is about 20 px; a wrapped name is about 40.
    await expect(name.getBoundingClientRect().height).toBeLessThan(30);
  },
};

export const Mobile: Story = {
  name: 'Drawer (mobile)',
  render: () => <CustomerApp />,
  globals: { viewport: { value: 'mobile2' } },
};
