import { Circle, CircleAlert, CircleCheck, CircleX, Hourglass, Loader, type LucideIcon } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Badge, type BadgeTone } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Link } from '../Link/Link';
import { TextField } from '../TextField/TextField';
import styles from './Review.module.css';

export type ReviewState = 'in-review' | 'approved' | 'changes-needed' | 'rejected';

export interface ReviewStage {
  title: string;
  /** Date or short status, e.g. "29 Oct 2026" or "In progress". */
  meta?: string;
  state: 'done' | 'current' | 'upcoming';
}

export interface ReviewStatusProps {
  state: ReviewState;
  title: string;
  description: string;
  /** Badge text. Defaults per state ("In review", "Approved", "Changes needed", "Rejected"). */
  badge?: string;
  /** Submitted → review → decision timeline. */
  stages?: ReviewStage[];
  /** What to fix, for `changes-needed`. Usually RequestedChange items. */
  children?: ReactNode;
  /** Primary button and/or a link. */
  actions?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
}

const stateMeta: Record<ReviewState, { icon: LucideIcon; tone: BadgeTone; badge: string; iconClass: string }> = {
  'in-review': { icon: Hourglass, tone: 'info', badge: 'In review', iconClass: styles.info },
  approved: { icon: CircleCheck, tone: 'positive', badge: 'Approved', iconClass: styles.success },
  'changes-needed': { icon: CircleAlert, tone: 'negative', badge: 'Changes needed', iconClass: styles.error },
  rejected: { icon: CircleX, tone: 'negative', badge: 'Rejected', iconClass: styles.error },
};

const stageMeta: Record<ReviewStage['state'], { icon: LucideIcon; text: string; iconClass: string }> = {
  done: { icon: CircleCheck, text: 'Done', iconClass: styles.success },
  current: { icon: Loader, text: 'In progress', iconClass: styles.info },
  upcoming: { icon: Circle, text: 'Not started', iconClass: styles.muted },
};

/** Where a business or service is in review (Feedback / Review status, … / Approved, … / Changes needed). */
export function ReviewStatus({ state, title, description, badge, stages, children, actions, headingLevel = 2, className }: ReviewStatusProps) {
  const m = stateMeta[state];
  const Heading = `h${headingLevel}` as const;
  const headingId = useId();
  const Icon = m.icon;
  return (
    <section className={cx(styles.card, className)} aria-labelledby={headingId}>
      <div className={styles.heading}>
        <Icon size={24} className={m.iconClass} aria-hidden="true" />
        <Heading id={headingId} className={styles.title}>
          {title}
        </Heading>
        <Badge tone={m.tone} icon={state === 'changes-needed' ? CircleAlert : true}>
          {badge ?? m.badge}
        </Badge>
      </div>
      <p className={styles.description}>{description}</p>
      {stages && (
        <ol className={styles.timeline} aria-label="Review progress">
          {stages.map((s) => {
            const sm = stageMeta[s.state];
            const StageIcon = sm.icon;
            return (
              <li key={s.title} className={styles.stage} aria-current={s.state === 'current' ? 'step' : undefined}>
                <StageIcon size={18} className={sm.iconClass} aria-hidden="true" />
                <span className={styles.stageTitle}>{s.title}</span>
                <span className="via-visually-hidden">{sm.text}</span>
                {s.meta && <span className={styles.meta}>{s.meta}</span>}
              </li>
            );
          })}
        </ol>
      )}
      {children && <div className={styles.changes}>{children}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
}

export interface RequestedChangeProps {
  title: string;
  reason: string;
  /** Where to fix it. */
  href?: string;
  /** Visible link text; the accessible name adds the title ("Fix identity documents"). */
  actionLabel?: string;
}

/** One thing the reviewer asked the business to change (Review / Requested change). */
export function RequestedChange({ title, reason, href, actionLabel = 'Fix' }: RequestedChangeProps) {
  return (
    <div className={styles.row}>
      <CircleAlert size={18} className={styles.error} aria-hidden="true" />
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowDetail}>{reason}</span>
      </div>
      {href && (
        <Link href={href} className={styles.rowAction}>
          {actionLabel}
          <span className="via-visually-hidden"> {title.toLowerCase()}</span>
        </Link>
      )}
    </div>
  );
}

export type CheckResult = 'passed' | 'failed' | 'needs-review';

export interface CheckItemProps {
  title: string;
  detail: string;
  result: CheckResult;
  /** Badge text. Defaults to "Passed", "Failed" or "Flagged". */
  resultLabel?: string;
}

const checkMeta: Record<CheckResult, { icon: LucideIcon; tone: BadgeTone; label: string; iconClass: string }> = {
  passed: { icon: CircleCheck, tone: 'positive', label: 'Passed', iconClass: styles.success },
  failed: { icon: CircleX, tone: 'negative', label: 'Failed', iconClass: styles.error },
  'needs-review': { icon: CircleAlert, tone: 'warning', label: 'Flagged', iconClass: styles.warning },
};

/** One automated or manual check in an admin review (Review / Check item). */
export function CheckItem({ title, detail, result, resultLabel }: CheckItemProps) {
  const m = checkMeta[result];
  const Icon = m.icon;
  return (
    <div className={cx(styles.row, styles.checkRow)}>
      <Icon size={18} className={m.iconClass} aria-hidden="true" />
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowDetail}>{detail}</span>
      </div>
      <Badge tone={m.tone}>{resultLabel ?? m.label}</Badge>
    </div>
  );
}

export interface DecisionPanelProps {
  description?: string;
  onApprove: (note: string) => void;
  onRequestChanges: (note: string) => void;
  onReject: (note: string) => void;
  /** Shows the buttons as busy while a decision is saving. */
  pending?: 'approve' | 'request-changes' | 'reject';
  className?: string;
}

/**
 * Approve, request changes or reject (Review / Decision panel). The note is internal. Reject is final, so
 * the screen using this should confirm it in a Dialog before calling the API.
 */
export function DecisionPanel({
  description = "Approving creates the customer's live API keys and emails them the decision. Any admin can decide. Notes stay internal.",
  onApprove,
  onRequestChanges,
  onReject,
  pending,
  className,
}: DecisionPanelProps) {
  const [note, setNote] = useState('');
  const headingId = useId();
  const busy = pending !== undefined;
  return (
    <section className={cx(styles.card, styles.decision, className)} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        Decision
      </h2>
      <p className={styles.decisionDescription}>{description}</p>
      <TextField label="Internal note" size="sm" optional value={note} onChange={setNote} />
      <Button fullWidth loading={pending === 'approve'} disabled={busy && pending !== 'approve'} onClick={() => onApprove(note)}>
        Approve
      </Button>
      <Button
        variant="secondary"
        fullWidth
        loading={pending === 'request-changes'}
        disabled={busy && pending !== 'request-changes'}
        onClick={() => onRequestChanges(note)}
      >
        Request changes
      </Button>
      <Button variant="destructive" fullWidth loading={pending === 'reject'} disabled={busy && pending !== 'reject'} onClick={() => onReject(note)}>
        Reject
      </Button>
    </section>
  );
}
