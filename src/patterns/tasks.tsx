import { useEffect, useRef, useState, type FormEvent } from 'react';
import { fn } from 'storybook/test';
import { Banner } from '../components/Banner/Banner';
import { Button } from '../components/Button/Button';
import { ButtonGroup } from '../components/Button/ButtonGroup';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { Dialog } from '../components/Dialog/Dialog';
import { ErrorSummary, type ErrorSummaryItem } from '../components/Form/Form';
import { Link } from '../components/Link/Link';
import { PasswordField } from '../components/PasswordField/PasswordField';
import { PropertyList } from '../components/PropertyList/PropertyList';
import { Select } from '../components/Select/Select';
import { Textarea } from '../components/Textarea/Textarea';
import { TextField } from '../components/TextField/TextField';
import { cx } from '../utils/cx';
import { Illustration } from '../components/Illustration/Illustration';
import styles from './patterns.module.css';

const EMAIL = /^\S+@\S+\.\S+$/;

/** Validate on submit, show the summary, and keep every value (Implementation rules shared by every pattern). */
function useSubmit<T extends Record<string, string>>(values: T, rules: (v: T) => ErrorSummaryItem[], onValid: (v: T) => void) {
  const [errors, setErrors] = useState<ErrorSummaryItem[]>([]);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = rules(values);
    setErrors(next);
    if (next.length === 0) onValid(values);
  };
  const errorFor = (id: string) => errors.find((x) => x.fieldId === id)?.message;
  return { errors, onSubmit, errorFor };
}

export const onSignIn = fn();
export function SignIn() {
  const [v, setV] = useState({ email: '', password: '' });
  const { errors, onSubmit, errorFor } = useSubmit(
    v,
    (x) => [
      ...(EMAIL.test(x.email) ? [] : [{ fieldId: 'signin-email', message: 'Enter your work email, like name@company.com.' }]),
      ...(x.password ? [] : [{ fieldId: 'signin-password', message: 'Enter your password.' }]),
    ],
    (x) => onSignIn(x.email),
  );
  return (
    <div className={styles.signInSplit}>
      <main className={styles.task}>
        <h1 className={styles.taskTitle}>Sign in to Acme Pay</h1>
        <p className={styles.taskIntro}>Enter your work email and password. Both fields are required. You can paste or use your password manager.</p>
        <ErrorSummary errors={errors} />
        <form noValidate onSubmit={onSubmit} className={styles.form}>
          <TextField
            id="signin-email"
            label="Work email"
            description="Use the address linked to your account."
            type="email"
            autoComplete="username"
            placeholder="name@company.com"
            value={v.email}
            onChange={(email) => setV((s) => ({ ...s, email }))}
            error={errorFor('signin-email')}
          />
          <PasswordField
            id="signin-password"
            label="Password"
            autoComplete="current-password"
            value={v.password}
            onChange={(password) => setV((s) => ({ ...s, password }))}
            error={errorFor('signin-password')}
          />
          <Checkbox label="Remember this device for 30 days" />
          <Button type="submit" size="lg" fullWidth>
            Sign in
          </Button>
        </form>
        <Link href="#reset">Forgot your password?</Link>
      </main>
      {/* Decorative; only where there's room beside the form (1024 px and up). */}
      <div className={styles.signInArt}>
        <Illustration name="sign-in" width={400} />
      </div>
    </div>
  );
}

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { errors, onSubmit, errorFor } = useSubmit(
    { email },
    (x) => (EMAIL.test(x.email) ? [] : [{ fieldId: 'reset-email', message: 'Enter your work email, like name@company.com.' }]),
    () => setSent(true),
  );
  return (
    <main className={styles.task}>
      <h1 className={styles.taskTitle}>Reset your password</h1>
      {sent ? (
        // Same message whether or not the account exists, so the page doesn't reveal who has an account.
        <Banner title="Check your email" description={`If an account exists for ${email}, we've sent a link to reset your password. The link expires in 30 minutes.`} />
      ) : (
        <>
          <p className={styles.taskIntro}>Work email is required. We will send a link if an account exists. You can paste or use autofill.</p>
          <ErrorSummary errors={errors} />
          <form noValidate onSubmit={onSubmit} className={styles.form}>
            <TextField
              id="reset-email"
              label="Work email"
              description="Use the email linked to your account."
              type="email"
              autoComplete="username"
              value={email}
              onChange={setEmail}
              error={errorFor('reset-email')}
            />
            <Button type="submit" size="lg" fullWidth>
              Send reset link
            </Button>
          </form>
        </>
      )}
      <Link href="#signin">Back to sign in</Link>
    </main>
  );
}

export function VerifyIdentity() {
  const [code, setCode] = useState('');
  const { errors, onSubmit, errorFor } = useSubmit(
    { code },
    (x) => (/^\d{6}$/.test(x.code.replace(/\s/g, '')) ? [] : [{ fieldId: 'verify-code', message: 'Enter the 6-digit code from your message.' }]),
    () => {},
  );
  return (
    <main className={styles.task}>
      <h1 className={styles.taskTitle}>Verify your identity</h1>
      <p className={styles.taskIntro}>Enter the 6-digit code from your message. Paste the whole code or use your device’s code autofill.</p>
      <ErrorSummary errors={errors} />
      <form noValidate onSubmit={onSubmit} className={styles.form}>
        {/* One field, not six boxes: paste and one-time-code autofill work. */}
        <TextField
          id="verify-code"
          label="Verification code"
          description="Use all 6 digits. Request a new code if it expires."
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={setCode}
          error={errorFor('verify-code')}
        />
        <Button type="submit" size="lg" fullWidth>
          Verify code
        </Button>
      </form>
      <Link href="#magic-link">Use a sign-in link instead</Link>
    </main>
  );
}

export const onExtend = fn();
export function SessionWarning({ seconds = 60 }: { seconds?: number }) {
  const [open, setOpen] = useState(true);
  const [left, setLeft] = useState(seconds);
  const [ended, setEnded] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => {
    if (!open) return;
    timer.current = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer.current);
  }, [open]);
  if (ended || left === 0) return <SessionEnded />;
  return (
    <main className={styles.task}>
      <h1 className={styles.taskTitle}>Create service</h1>
      <TextField label="Service name" defaultValue="Production orders" />
      <Dialog
        open={open}
        onClose={() => {}}
        dismissible={false}
        role="alertdialog"
        title="Need more time?"
        // Announced once when the dialog opens. The countdown is not a live region: no announcement every second.
        description={`Your session ends in ${left} seconds. Stay signed in to keep working. Your entries will be kept for this visit.`}
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setEnded(true)}>
              End session
            </Button>
            <Button
              onClick={() => {
                onExtend();
                setOpen(false);
              }}
            >
              Stay signed in
            </Button>
          </ButtonGroup>
        }
      />
    </main>
  );
}

export function SessionEnded() {
  return (
    <main className={styles.task}>
      <h1 className={styles.taskTitle}>Session ended</h1>
      <p className={styles.taskIntro}>Your entries are saved for this visit. Sign in again to continue from where you left off.</p>
      <Button size="lg" fullWidth>
        Sign in and continue
      </Button>
      <Button size="lg" variant="secondary" fullWidth>
        Discard saved entries
      </Button>
      <p className={styles.note}>Non-secret form entries stay in memory for this visit. Passwords and verification codes are cleared.</p>
    </main>
  );
}

const countries = [
  { value: 'SG', label: 'Singapore' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'TH', label: 'Thailand' },
  { value: 'PH', label: 'Philippines' },
  { value: 'ID', label: 'Indonesia' },
];

export const onSend = fn();
/** Contact form → review your enquiry → sent. Values survive errors and "Edit details". */
export function ContactFlow({
  initialStep = 'form',
  initialValues = { name: '', email: '', country: '', message: '' },
}: {
  initialStep?: 'form' | 'review' | 'sent';
  initialValues?: { name: string; email: string; country: string; message: string };
} = {}) {
  const [step, setStep] = useState<'form' | 'review' | 'sent'>(initialStep);
  const [v, setV] = useState(initialValues);
  const set = (k: keyof typeof v) => (x: string | null) => setV((s) => ({ ...s, [k]: x ?? '' }));
  const { errors, onSubmit, errorFor } = useSubmit(
    v,
    (x) => [
      ...(x.name.trim() ? [] : [{ fieldId: 'contact-name', message: 'Enter your name.' }]),
      ...(EMAIL.test(x.email) ? [] : [{ fieldId: 'contact-email', message: 'Enter your work email, like name@company.com.' }]),
      ...(x.message.trim() ? [] : [{ fieldId: 'contact-message', message: 'Tell us what you are building.' }]),
    ],
    () => setStep('review'),
  );
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), [step]);

  if (step === 'sent')
    return (
      <main className={cx(styles.task, styles.wideTask)}>
        <h1 ref={heading} tabIndex={-1} className={styles.taskTitle}>
          Enquiry sent
        </h1>
        <p className={styles.taskIntro}>Thanks, {v.name}. Our payment team replies within 2 working days to {v.email}.</p>
      </main>
    );
  if (step === 'review')
    return (
      <main className={cx(styles.task, styles.wideTask)}>
        <h1 ref={heading} tabIndex={-1} className={styles.taskTitle}>
          Review your enquiry
        </h1>
        <p className={styles.taskIntro}>Your earlier entries are filled in. Review them before sending; use Edit details to make a correction.</p>
        <PropertyList
          layout="stacked"
          className={styles.oneColumn}
          items={[
            { label: 'Name', value: v.name },
            { label: 'Work email', value: v.email },
            { label: 'Country or region', value: countries.find((c) => c.value === v.country)?.label ?? 'Not given' },
            { label: 'Message', value: v.message },
          ]}
        />
        <div className={styles.stackedActions}>
          <Button variant="secondary" size="lg" fullWidth onClick={() => setStep('form')}>
            Edit details
          </Button>
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              onSend(v);
              setStep('sent');
            }}
          >
            Send enquiry
          </Button>
        </div>
      </main>
    );
  return (
    <main className={cx(styles.task, styles.wideTask)}>
      <h1 ref={heading} tabIndex={-1} className={styles.taskTitle}>
        Talk to our payment team
      </h1>
      <p className={styles.taskIntro}>Tell us what you are building. Name, work email and message are required. Country and payment insights are optional.</p>
      <ErrorSummary errors={errors} />
      <form noValidate onSubmit={onSubmit} className={styles.form}>
        <TextField id="contact-name" label="Name" description="Enter the name we should use when replying." autoComplete="name" value={v.name} onChange={set('name')} error={errorFor('contact-name')} />
        <TextField
          id="contact-email"
          label="Work email"
          type="email"
          autoComplete="email"
          value={v.email}
          onChange={set('email')}
          error={errorFor('contact-email')}
        />
        <Select label="Country or region" optional description="Choose where your business is registered." options={countries} value={v.country || null} onChange={set('country')} placeholder="Select a country" />
        <Textarea id="contact-message" label="Message" value={v.message} onChange={set('message')} error={errorFor('contact-message')} rows={4} />
        <Checkbox label="Send me occasional payment insights" description="Optional. Unsubscribe any time." />
        <Button type="submit" size="lg">
          Review enquiry
        </Button>
        <p className={styles.note}>Your details are used to respond to this enquiry.</p>
      </form>
    </main>
  );
}

