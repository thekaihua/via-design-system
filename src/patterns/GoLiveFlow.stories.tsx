import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { PageHeader } from '../components/AppShell/PageHeader';
import { Banner } from '../components/Banner/Banner';
import { Button } from '../components/Button/Button';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { DateField } from '../components/DateField/DateField';
import { FileUpload, type UploadedFile } from '../components/FileUpload/FileUpload';
import { FocusView } from '../components/FocusView/FocusView';
import { FormRow } from '../components/Form/Form';
import { Link } from '../components/Link/Link';
import { RequestedChange, ReviewStatus, type ReviewStage } from '../components/Review/Review';
import { Select } from '../components/Select/Select';
import { SetupTasks } from '../components/SetupTasks/SetupTasks';
import { TextField } from '../components/TextField/TextField';
import { toast } from '../components/Toast/Toast';
import { CustomerFrame } from './frame';
import styles from './patterns.module.css';

type Phase = 'ready' | 'in-review' | 'changes-needed' | 'approved';

const STEPS = ['Company details', 'Individual details', 'Bank details'];
const MB = 1024 * 1024;

/** Stepped Focus view: values survive Back, close-with-changes asks first, each step checks its own fields. */
function GoLiveView({ open, onClose, onSubmit, startStep = 0 }: { open: boolean; onClose: () => void; onSubmit: () => void; startStep?: number }) {
  const [step, setStep] = useState(startStep);
  const [v, setV] = useState({ company: 'Number One', uen: '', first: '', last: '', account: '', confirm: '', terms: false });
  const [docs, setDocs] = useState<UploadedFile[]>([]);
  const [tried, setTried] = useState(false);
  const set = (k: keyof typeof v) => (x: string | boolean) => setV((s) => ({ ...s, [k]: x }));
  const stepErrors: Record<number, Record<string, string | undefined>> = {
    0: { uen: /^[0-9A-Z]{9,10}$/.test(v.uen) ? undefined : 'Enter the UEN, like 201912345K.' },
    1: { first: v.first ? undefined : 'Enter the first name.', last: v.last ? undefined : 'Enter the last name.' },
    2: {
      account: /^\d{6,}$/.test(v.account) ? undefined : 'Enter the account number, digits only.',
      confirm: v.confirm === v.account ? undefined : 'Account numbers don’t match.',
      terms: v.terms ? undefined : 'Agree to the terms to submit.',
    },
  };
  const err = (k: string) => (tried ? stepErrors[step][k] : undefined);
  const dirty = v.uen !== '' || v.first !== '' || docs.length > 0;
  return (
    <FocusView
      open={open}
      onClose={onClose}
      title="Go live"
      description="Number One · reviewed before live payments"
      steps={STEPS}
      currentStep={step}
      confirmClose={dirty}
      onBack={() => {
        setTried(false);
        setStep((s) => s - 1);
      }}
      onNext={() => {
        setTried(true);
        if (Object.values(stepErrors[step]).some(Boolean)) return;
        setTried(false);
        if (step === STEPS.length - 1) onSubmit();
        else setStep((s) => s + 1);
      }}
      nextLabel={step === STEPS.length - 1 ? 'Submit for review' : undefined}
    >
      {step === 0 && (
        <>
          <p className={styles.taskIntro}>Tell us about the business that will accept payments.</p>
          <TextField label="Company name" value={v.company} onChange={set('company')} autoComplete="organization" />
          <TextField label="Company website" type="url" placeholder="https://" optional />
          <Select label="Company location" options={[{ value: 'SG', label: 'Singapore' }, { value: 'MY', label: 'Malaysia' }]} defaultValue="SG" />
          <TextField label="Company UEN" value={v.uen} onChange={set('uen')} error={err('uen')} />
          <FileUpload
            label="Business documents"
            description="Upload the business registration certificate."
            accept="application/pdf,image/jpeg,image/png"
            maxSize={10 * MB}
            maxFiles={2}
            files={docs}
            onFiles={(fs) => setDocs((d) => [...d, ...fs.map((f, i) => ({ id: `${f.name}-${i}`, name: f.name, size: f.size, status: 'done' as const }))])}
            onRemove={(id) => setDocs((d) => d.filter((x) => x.id !== id))}
          />
        </>
      )}
      {step === 1 && (
        <>
          <p className={styles.taskIntro}>The person who owns or controls the business. We use this to verify their identity.</p>
          <FormRow>
            <TextField label="First name" value={v.first} onChange={set('first')} error={err('first')} autoComplete="given-name" />
            <TextField label="Last name" value={v.last} onChange={set('last')} error={err('last')} autoComplete="family-name" />
          </FormRow>
          <DateField label="Date of birth" />
          <Select label="Identity document" options={[{ value: 'nric', label: 'NRIC' }, { value: 'passport', label: 'Passport' }]} defaultValue="nric" />
        </>
      )}
      {step === 2 && (
        <>
          <p className={styles.taskIntro}>Where we send your payouts. The account must be in the company’s name.</p>
          <TextField label="Account number" inputMode="numeric" value={v.account} onChange={set('account')} error={err('account')} />
          <TextField label="Confirm account number" inputMode="numeric" value={v.confirm} onChange={set('confirm')} error={err('confirm')} />
          <TextField label="Statement descriptor" description="Shown on your customers’ card or bank statement." defaultValue="NUMBER ONE" />
          <Checkbox label="I agree to the Acme Pay Terms & Conditions." checked={v.terms} onChange={set('terms')} error={err('terms')} />
          <Banner title="Compliance reviews your application" description="We check every business for anti-money-laundering and prohibited services. You can keep using sandbox meanwhile." />
        </>
      )}
    </FocusView>
  );
}

const reviewStages = (phase: Phase): ReviewStage[] => [
  { title: 'Application submitted', meta: '29 Oct 2026', state: 'done' },
  { title: 'Compliance review', meta: phase === 'in-review' ? 'In progress' : 'Done', state: phase === 'in-review' ? 'current' : 'done' },
  {
    title: 'Decision',
    meta: phase === 'approved' ? 'Approved · 04 Nov 2026' : 'Approved businesses can switch to live mode',
    state: phase === 'approved' ? 'done' : 'upcoming',
  },
];

function Home({ initial = 'ready' as Phase }) {
  const [phase, setPhase] = useState<Phase>(initial);
  const [open, setOpen] = useState(false);
  return (
    <CustomerFrame active="home" environment={phase === 'approved' ? 'live' : 'sandbox'}>
      <PageHeader title="Home" description="Shop Example · Sandbox workspace" />
      <div className={styles.stack} style={{ maxWidth: 688 }}>
        {phase === 'ready' && (
          <>
            <SetupTasks
              title="Get ready to accept live payments"
              tasks={[
                { id: 'svc', title: 'Create your first service', description: 'Done 12 Oct', status: 'done', href: '#svc' },
                { id: 'test', title: 'Test in sandbox', description: 'Done 14 Oct', status: 'done', href: '#test' },
                { id: 'kyc', title: 'Submit business details', description: 'Company, owner and bank details. About 10 minutes.', status: 'current' },
                { id: 'review', title: 'Compliance review', description: 'We check every business before it goes live.', status: 'todo' },
              ]}
            />
            <div>
              <Button size="lg" onClick={() => setOpen(true)}>
                Go live
              </Button>
            </div>
          </>
        )}
        {phase === 'in-review' && (
          <ReviewStatus
            state="in-review"
            title="Your business is under review"
            description="We check every business for anti-money-laundering risks and prohibited services. Most reviews take a few days. We email you when there is a decision."
            stages={reviewStages(phase)}
            actions={<Link href="#application">View application</Link>}
          />
        )}
        {phase === 'changes-needed' && (
          <ReviewStatus
            state="changes-needed"
            title="Changes needed before you can go live"
            description="We couldn't verify some of your details. Fix the items below and resubmit. Everything else you entered is kept."
            actions={
              <>
                <Button onClick={() => setOpen(true)}>Fix and resubmit</Button>
                <Link href="#contact">Contact support</Link>
              </>
            }
          >
            <RequestedChange title="Bank account" reason="The account name doesn't match the registered business name." href="#bank" />
          </ReviewStatus>
        )}
        {phase === 'approved' && (
          <ReviewStatus
            state="approved"
            title="Your business is live"
            description="We approved your business and created your live API keys. Switch to live mode to accept real payments."
            stages={reviewStages(phase)}
            actions={
              <>
                <Button>Switch to live mode</Button>
                <Link href="#keys">View live keys</Link>
              </>
            }
          />
        )}
      </div>
      <GoLiveView
        open={open}
        startStep={phase === 'changes-needed' ? 2 : 0}
        onClose={() => setOpen(false)}
        onSubmit={() => {
          setOpen(false);
          setPhase('in-review');
          toast('Submitted for review. We’ll email you when there’s a decision.');
        }}
      />
    </CustomerFrame>
  );
}

const meta = {
  title: 'Patterns/Full-page flow',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const GoLive: Story = {
  name: '1–3 · Sandbox → go live → review',
  render: () => <Home />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Go live' }));
    const view = await screen.findByRole('dialog', { name: 'Go live' });
    const v = within(view);
    await waitFor(() => expect(view).toBeVisible());
    // Each step checks its own fields before moving on.
    await userEvent.click(v.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(v.getByText('Enter the UEN, like 201912345K.')).toBeVisible());
    await userEvent.type(v.getByRole('textbox', { name: 'Company UEN' }), '201912345K');
    await userEvent.click(v.getByRole('button', { name: 'Continue' }));
    await userEvent.type(await v.findByRole('textbox', { name: 'First name' }), 'Mei');
    await userEvent.type(v.getByRole('textbox', { name: 'Last name' }), 'Tan');
    // Back keeps what was typed.
    await userEvent.click(v.getByRole('button', { name: 'Back' }));
    await expect(await v.findByRole('textbox', { name: 'Company UEN' })).toHaveValue('201912345K');
    await userEvent.click(v.getByRole('button', { name: 'Continue' }));
    await userEvent.click(v.getByRole('button', { name: 'Continue' }));
    await userEvent.type(await v.findByRole('textbox', { name: 'Account number' }), '123456789');
    await userEvent.type(v.getByRole('textbox', { name: 'Confirm account number' }), '123456789');
    await userEvent.click(v.getByRole('checkbox', { name: /I agree/ }));
    await userEvent.click(v.getByRole('button', { name: 'Submit for review' }));
    await waitFor(() => expect(canvas.getByRole('region', { name: 'Your business is under review' })).toBeVisible());
  },
};

export const UnderReview: Story = { name: '3 · Under review', render: () => <Home initial="in-review" /> };
export const ChangesNeeded: Story = {
  name: '4 · Decision: changes needed',
  render: () => <Home initial="changes-needed" />,
  play: async ({ canvas }) => {
    // Resubmitting opens straight on the step that needs fixing.
    await userEvent.click(canvas.getByRole('button', { name: 'Fix and resubmit' }));
    const view = await screen.findByRole('dialog', { name: 'Go live' });
    await waitFor(() => expect(within(view).getByRole('textbox', { name: 'Account number' })).toBeVisible());
  },
};
export const Approved: Story = { name: '4 · Decision: approved', render: () => <Home initial="approved" /> };
