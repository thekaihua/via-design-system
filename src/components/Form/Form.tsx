import { CircleAlert } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Form.module.css';

export interface FormSectionProps {
  title: string;
  description?: ReactNode;
  /** Heading level of the title. */
  headingLevel?: 2 | 3;
  children: ReactNode;
  className?: string;
}

/** A titled group of fields (Form / Section). Fields stack in one column, max 560 px on tablet. */
export function FormSection({ title, description, headingLevel = 2, children, className }: FormSectionProps) {
  const Heading = `h${headingLevel}` as const;
  const id = useId();
  return (
    <section className={cx(styles.section, className)} aria-labelledby={id}>
      <div className={styles.sectionHeading}>
        <Heading id={id} className={styles.sectionTitle}>
          {title}
        </Heading>
        {description && <div className={styles.sectionDescription}>{description}</div>}
      </div>
      <div className={styles.sectionFields}>{children}</div>
    </section>
  );
}

/** Puts short fields side by side (city / postcode) at 1024 px and up; stacks them below. */
export function FormRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.row, className)}>{children}</div>;
}

export interface FieldGroupProps {
  /** Rendered as the fieldset's legend. */
  legend: string;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Related fields answered together (Form / Field group): a fieldset with a legend. */
export function FieldGroup({ legend, description, error, children, className }: FieldGroupProps) {
  const id = useId();
  const describedBy = [description && `${id}-desc`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset className={cx(styles.group, className)} aria-describedby={describedBy}>
      <legend className={styles.legend}>{legend}</legend>
      {description && (
        <p id={`${id}-desc`} className={styles.groupDescription}>
          {description}
        </p>
      )}
      <div className={styles.groupFields}>{children}</div>
      {error && (
        <p id={`${id}-err`} className={styles.groupError}>
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Form buttons under a divider (Form / Actions). Put Cancel first and the primary action last. */
export function FormActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.actions, className)}>{children}</div>;
}

export interface ErrorSummaryItem {
  /** id of the field's input, so the link can move focus to it. */
  fieldId: string;
  message: string;
}

export interface ErrorSummaryProps {
  errors: ErrorSummaryItem[];
  /** Defaults to "There is a problem" / "There are N problems". */
  title?: string;
  /** Move focus to the summary when it appears or the errors change (after a failed submit). */
  autoFocus?: boolean;
  className?: string;
}

/**
 * List of problems after a failed submit (Feedback / Error summary). Takes focus so screen readers
 * announce it; each item links to its field and focuses it.
 */
export function ErrorSummary({ errors, title, autoFocus = true, className }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const key = errors.map((e) => e.fieldId).join('|');
  useEffect(() => {
    if (autoFocus && errors.length) ref.current?.focus();
  }, [autoFocus, key, errors.length]);

  if (!errors.length) return null;
  const heading = title ?? (errors.length === 1 ? 'There is a problem' : `There are ${errors.length} problems`);
  const id = `error-summary-${key.length}`;
  return (
    <div ref={ref} tabIndex={-1} className={cx(styles.summary, className)} role="alert" aria-labelledby={id}>
      <h2 id={id} className={styles.summaryTitle}>
        {heading}
      </h2>
      <ul className={styles.summaryList}>
        {errors.map((e) => (
          <li key={e.fieldId}>
            <a
              href={`#${e.fieldId}`}
              className={styles.summaryLink}
              onClick={(ev) => {
                const field = document.getElementById(e.fieldId);
                if (!field) return;
                ev.preventDefault();
                field.focus();
                field.scrollIntoView({ block: 'center' });
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
