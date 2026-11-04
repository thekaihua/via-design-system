import { Search, X } from 'lucide-react';
import { useEffect, useRef, type Ref } from 'react';
import { Button as AriaButton, Group, Input, SearchField as AriaSearchField } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { FieldParts } from '../Field/Field';
import { fieldClassName, fieldStyles as s, type FieldBaseProps } from '../Field/fieldUtils';
import styles from './SearchField.module.css';

export interface SearchFieldProps extends Omit<FieldBaseProps, 'hideLabel' | 'error' | 'optional'> {
  /** Search fields usually rely on the placeholder visually; the label stays for screen readers. */
  hideLabel?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  /** A single key (e.g. "/") that focuses the field from anywhere on the page. Shown as a hint. */
  shortcut?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

/** Search input (Field / Search field / Small, Medium). Esc clears; the clear button appears once there's text. */
export function SearchField({
  label,
  hideLabel = true,
  description,
  size = 'md',
  placeholder,
  shortcut,
  disabled,
  autoFocus,
  className,
  ref,
  ...rest
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
      if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && e.key === shortcut) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <AriaSearchField
      {...rest}
      isDisabled={disabled}
      autoFocus={autoFocus}
      aria-keyshortcuts={shortcut}
      className={fieldClassName(size, false, cx(styles.search, className))}
    >
      {({ isEmpty }) => (
        <FieldParts label={label} hideLabel={hideLabel} description={description}>
          <Group className={s.control} isDisabled={disabled}>
            <Search className={s.trailingIcon} size={size === 'sm' ? 16 : 20} aria-hidden="true" />
            <Input ref={setRefs} className={cx(s.input, styles.input)} placeholder={placeholder} />
            {!isEmpty ? (
              <AriaButton className={styles.clear} aria-label="Clear search">
                <X size={16} aria-hidden="true" />
              </AriaButton>
            ) : (
              shortcut && (
                <kbd className={styles.shortcut} aria-hidden="true">
                  {shortcut}
                </kbd>
              )
            )}
          </Group>
        </FieldParts>
      )}
    </AriaSearchField>
  );
}
