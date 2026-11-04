import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { FieldError, Label, Text } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Field.module.css';
import type { FieldBaseProps } from './fieldUtils';

/** Label row, description and error that wrap a field's control. */
export function FieldParts({
  label,
  hideLabel,
  description,
  optional,
  error,
  children,
}: Omit<FieldBaseProps, 'size'> & { children: ReactNode }) {
  return (
    <>
      <div className={cx(styles.labelRow, hideLabel && 'via-visually-hidden')}>
        <Label className={styles.label}>{label}</Label>
        {optional && <span className={styles.optional}>Optional</span>}
      </div>
      {description && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
      {children}
      <FieldError className={styles.error}>
        <CircleAlert size={16} aria-hidden="true" />
        <span>{error}</span>
      </FieldError>
    </>
  );
}
