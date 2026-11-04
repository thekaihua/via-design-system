import { ChevronDown, Info, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  type Key,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './Disclosure.module.css';

export interface AccordionItemData {
  id: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** Let more than one item be open (default). Set false to close the others when one opens. */
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  /** Heading level of each item's title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * Questions and answers or other content people open one at a time (Disclosure / Accordion item).
 * Each title is a heading containing a button with aria-expanded, so headings navigation still works.
 */
export function Accordion({ items, allowMultiple = true, defaultExpanded, headingLevel = 3, className }: AccordionProps) {
  return (
    <DisclosureGroup
      allowsMultipleExpanded={allowMultiple}
      defaultExpandedKeys={defaultExpanded as Key[] | undefined}
      className={cx(styles.accordion, className)}
    >
      {items.map((item) => (
        <AriaDisclosure key={item.id} id={item.id} className={styles.item}>
          <Heading level={headingLevel} className={styles.itemHeading}>
            <AriaButton slot="trigger" className={styles.trigger}>
              <span className={styles.question}>{item.title}</span>
              <ChevronDown size={20} className={styles.chevron} aria-hidden="true" />
            </AriaButton>
          </Heading>
          <DisclosurePanel className={styles.answer}>{item.content}</DisclosurePanel>
        </AriaDisclosure>
      ))}
    </DisclosureGroup>
  );
}

export interface IntegrationGuideProps {
  title: string;
  description?: string;
  /** Visible trigger text. */
  actionLabel?: string;
  icon?: LucideIcon;
  defaultExpanded?: boolean;
  /** The guide's steps or links, shown when opened. */
  children: ReactNode;
  className?: string;
}

/** Collapsed strip that opens setup instructions (Disclosure / Integration guide). */
export function IntegrationGuide({
  title,
  description,
  actionLabel = 'View guide',
  icon: Icon = Info,
  defaultExpanded,
  children,
  className,
}: IntegrationGuideProps) {
  return (
    <AriaDisclosure defaultExpanded={defaultExpanded} className={cx(styles.guide, className)}>
      {({ isExpanded }) => (
        <>
          <div className={styles.guideBar}>
            <Icon size={20} className={styles.guideIcon} aria-hidden="true" />
            <span className={styles.guideText}>
              <span className={styles.guideTitle}>{title}</span>
              {description && <span className={styles.guideDescription}>{description}</span>}
            </span>
            {/* The name starts with the visible text (WCAG 2.5.3) and adds which guide. */}
            <AriaButton slot="trigger" className={styles.guideTrigger} aria-label={`${isExpanded ? 'Hide guide' : actionLabel}: ${title}`}>
              {isExpanded ? 'Hide guide' : actionLabel}
              <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
            </AriaButton>
          </div>
          <DisclosurePanel className={styles.guidePanel}>{children}</DisclosurePanel>
        </>
      )}
    </AriaDisclosure>
  );
}
