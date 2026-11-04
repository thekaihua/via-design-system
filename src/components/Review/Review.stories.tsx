import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from '../Button/Button';
import { Link } from '../Link/Link';
import { CheckItem, DecisionPanel, RequestedChange, ReviewStatus } from './Review';

const meta = {
  title: 'Feedback/ReviewStatus',
  component: ReviewStatus,
  decorators: [(Story) => <div style={{ maxWidth: 688 }}>{Story()}</div>],
  args: {
    state: 'in-review',
    title: 'Your business is under review',
    description:
      'We check every business for anti-money-laundering risks and prohibited services. Most reviews take a few days. We email you when there is a decision.',
    stages: [
      { title: 'Application submitted', meta: '29 Oct 2026', state: 'done' },
      { title: 'Compliance review', meta: 'In progress', state: 'current' },
      { title: 'Decision', meta: 'Approved businesses can switch to live mode', state: 'upcoming' },
    ],
    actions: <Link href="#application">View application</Link>,
  },
} satisfies Meta<typeof ReviewStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InReview: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Your business is under review' })).toBeVisible();
    await expect(canvas.getByText('In review')).toBeVisible();
    const current = canvas.getByRole('listitem', { current: 'step' });
    await expect(current).toHaveTextContent('Compliance review');
  },
};

export const Approved: Story = {
  args: {
    state: 'approved',
    title: 'Your business is live',
    description: 'We approved your business and created your live API keys. Switch to live mode to accept real payments.',
    stages: [
      { title: 'Application submitted', meta: '31 Oct 2026', state: 'done' },
      { title: 'Compliance review', meta: 'Done', state: 'done' },
      { title: 'Decision', meta: 'Approved · 04 Nov 2026', state: 'done' },
    ],
    actions: (
      <>
        <Button>Switch to live mode</Button>
        <Link href="#keys">View live keys</Link>
      </>
    ),
  },
};

export const ChangesNeeded: Story = {
  args: {
    state: 'changes-needed',
    title: 'Changes needed before you can go live',
    description: "We couldn't verify some of your details. Fix the items below and resubmit. Everything else you entered is kept.",
    stages: undefined,
    children: (
      <>
        <RequestedChange title="Identity documents" reason="The NRIC photo is blurred. Upload a clearer photo of the front and back." href="#identity" />
        <RequestedChange title="Bank account" reason="The account name doesn't match the registered business name." href="#bank" />
      </>
    ),
    actions: (
      <>
        <Button>Fix and resubmit</Button>
        <Link href="#contact">Contact support</Link>
      </>
    ),
  },
  play: async ({ canvas }) => {
    // Each "Fix" link says what it fixes.
    await expect(canvas.getByRole('link', { name: 'Fix identity documents' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Fix bank account' })).toBeVisible();
  },
};

export const Checks: StoryObj = {
  name: 'Admin: check items',
  render: () => (
    <div>
      <CheckItem title="Company registration" detail="UEN matches the uploaded registration certificate." result="passed" />
      <CheckItem title="Director identity" detail="Name on NRIC differs from ACRA record." result="needs-review" />
      <CheckItem title="Sanctions screening" detail="Director matched a sanctions list entry." result="failed" />
    </div>
  ),
};

const onApprove = fn();
const onReject = fn();
export const Decision: StoryObj = {
  name: 'Admin: decision panel',
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <DecisionPanel onApprove={onApprove} onRequestChanges={fn()} onReject={onReject} />
    </div>
  ),
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: /Internal note/ }), 'Docs verified by phone');
    await userEvent.click(canvas.getByRole('button', { name: 'Approve' }));
    await expect(onApprove).toHaveBeenCalledWith('Docs verified by phone');
  },
};

export const DecisionSaving: StoryObj = {
  name: 'Admin: decision saving',
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <DecisionPanel onApprove={fn()} onRequestChanges={fn()} onReject={onReject} pending="approve" />
    </div>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Reject' }));
    await expect(onReject).not.toHaveBeenCalled();
  },
};
