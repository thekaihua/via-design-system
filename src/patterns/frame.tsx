/**
 * Shared app frames for pattern and screen stories. Not exported from the library: products compose
 * AppShell, AppHeader and AppSidebar themselves.
 */
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
  ScrollText,
  Settings,
  ShieldCheck,
  Webhook,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AppHeader, type Environment } from '../components/AppShell/AppHeader';
import { AppShell } from '../components/AppShell/AppShell';
import { AppSidebar } from '../components/AppShell/AppSidebar';
import type { NavItem } from '../components/AppShell/SideNav';
import { SearchField } from '../components/SearchField/SearchField';
import { ToastRegion } from '../components/Toast/Toast';
import styles from './patterns.module.css';

export const customerNav: NavItem[] = [
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

export function CustomerFrame({
  active,
  environment = 'sandbox',
  children,
}: {
  active: string;
  environment?: Environment;
  children: ReactNode;
}) {
  const [env, setEnv] = useState<Environment>(environment);
  return (
    <>
      <AppShell
        header={
          <AppHeader
            search={<SearchField label="Search services or transactions" placeholder="Search services or transactions" shortcut="/" />}
            onSearch={() => {}}
            environment={env}
            onEnvironmentChange={setEnv}
            docsHref="#docs"
            onNotifications={() => {}}
            user={{ name: 'Timothy Cain' }}
          />
        }
        sidebar={
          <AppSidebar
            workspace={{ id: 'shop', name: 'Shop Example', context: env === 'live' ? 'Live workspace' : 'Sandbox workspace', icon: Building2 }}
            workspaces={[
              { id: 'shop', name: 'Shop Example', context: 'Sandbox workspace' },
              { id: 'op', name: 'Acme Pay', context: 'Sandbox workspace' },
            ]}
            items={customerNav}
            secondaryItems={secondary}
            active={active}
          />
        }
      >
        {children}
      </AppShell>
      <ToastRegion />
    </>
  );
}

export function AdminFrame({ active, children }: { active: string; children: ReactNode }) {
  return (
    <>
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
            active={active}
            aria-label="Admin"
          />
        }
      >
        {children}
      </AppShell>
      <ToastRegion />
    </>
  );
}

/** Two-column body used by the templates: primary content, and a 400 px side column ≥ 1024 px. */
export function Columns({ primary, side }: { primary: ReactNode; side: ReactNode }) {
  return (
    <div className={styles.columns}>
      <div className={styles.primary}>{primary}</div>
      <div className={styles.side}>{side}</div>
    </div>
  );
}
