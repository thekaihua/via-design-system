import { Search, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import {
  Autocomplete,
  Dialog as AriaDialog,
  Header,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Modal,
  ModalOverlay,
  SearchField as AriaSearchField,
  Text,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import o from '../Overlay/Overlay.module.css';
import styles from './CommandSearch.module.css';

export interface CommandSearchItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export interface CommandSearchGroup {
  group: string;
  items: CommandSearchItem[];
}

export interface CommandSearchProps {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  /** Results for the current query, already filtered by the app (e.g. from the API). */
  results: CommandSearchGroup[];
  onSelect: (id: string) => void;
  placeholder?: string;
}

/**
 * Workspace search (Overlay / Resource search). Opens with ⌘K / Ctrl+K via `useCommandSearchShortcut`.
 * The input keeps focus; ↑/↓ move through results (aria-activedescendant), Enter opens, Esc closes.
 */
export function CommandSearch({
  open,
  onClose,
  query,
  onQueryChange,
  results,
  onSelect,
  placeholder = 'Search workspace',
}: CommandSearchProps) {
  const groups = results.filter((g) => g.items.length > 0);
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      isDismissable
      className={cx(o.scrim, styles.overlay)}
    >
      <Modal className={styles.modal}>
        <AriaDialog aria-label="Search" className={styles.dialog}>
          <Autocomplete inputValue={query} onInputChange={onQueryChange}>
            <AriaSearchField aria-label={placeholder} autoFocus className={styles.searchField}>
              <Search size={20} className={styles.searchIcon} aria-hidden="true" />
              <Input placeholder={placeholder} className={styles.input} />
            </AriaSearchField>
            <ListBox
              aria-label="Results"
              className={styles.results}
              onAction={(key) => {
                onSelect(String(key));
                onClose();
              }}
              renderEmptyState={() => (
                <p className={styles.empty}>{query ? `No results for “${query}”` : 'Type to search services, payments and keys.'}</p>
              )}
            >
              {groups.map((g) => (
                <ListBoxSection key={g.group} id={g.group} className={styles.section}>
                  <Header className={styles.groupTitle}>{g.group}</Header>
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <ListBoxItem key={item.id} id={item.id} textValue={item.label} className={styles.item}>
                        {Icon && <Icon size={20} className={styles.icon} aria-hidden="true" />}
                        <span className={styles.text}>
                          <Text slot="label" className={styles.label}>
                            {item.label}
                          </Text>
                          {item.description && (
                            <Text slot="description" className={styles.description}>
                              {item.description}
                            </Text>
                          )}
                        </span>
                      </ListBoxItem>
                    );
                  })}
                </ListBoxSection>
              ))}
            </ListBox>
          </Autocomplete>
          <p className={styles.hint} aria-hidden="true">
            ↑ ↓ to navigate · Enter to open · Esc to close
          </p>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

/** Opens command search on ⌘K (macOS) or Ctrl+K. */
export function useCommandSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpen();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onOpen]);
}
