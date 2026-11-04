import { cx } from '../../utils/cx';
import styles from './Field.module.css';

export type FieldSize = 'sm' | 'md';

/** Props shared by every labelled field (TextField, Select, Textarea, …). */
export interface FieldBaseProps {
  /** Visible label. Always required, even when hidden, so the field has an accessible name. */
  label: string;
  /** Hide the label visually; it stays available to screen readers. */
  hideLabel?: boolean;
  /** Help text under the label, linked with aria-describedby. */
  description?: string;
  /** Shows an "Optional" tag next to the label. */
  optional?: boolean;
  /** Error message. Setting it marks the field invalid (aria-invalid) and links the message. */
  error?: string;
  /** Control height: 32 px (sm) or 40 px (md). */
  size?: FieldSize;
}

/** Class names from Field.module.css, for fields that compose the shared parts. */
export const fieldStyles: Readonly<Record<string, string>> = styles;

export function fieldClassName(size: FieldSize = 'md', readOnly?: boolean, className?: string) {
  return cx(styles.field, size === 'sm' && styles.sm, readOnly && styles.readOnly, className);
}
