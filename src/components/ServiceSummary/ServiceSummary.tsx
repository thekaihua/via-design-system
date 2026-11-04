import { cx } from '../../utils/cx';
import { Badge, type BadgeTone } from '../Badge/Badge';
import { Link } from '../Link/Link';
import styles from './ServiceSummary.module.css';

export interface Service {
  id: string;
  name: string;
  mode: 'Sandbox' | 'Live';
  status: { label: string; tone: BadgeTone };
  href: string;
}

/**
 * One service as a card (Data / Service summary). Use it for short lists and under 768 px, where the
 * services table becomes a list of these cards.
 */
export function ServiceSummary({ service, headingLevel = 3, className }: { service: Service; headingLevel?: 2 | 3 | 4; className?: string }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className={cx(styles.card, className)} aria-label={service.name}>
      <Heading className={styles.name}>{service.name}</Heading>
      <span className={styles.meta}>
        {service.id} · {service.mode}
      </span>
      <Badge tone={service.status.tone}>{service.status.label}</Badge>
      <Link href={service.href}>
        View service<span className="via-visually-hidden"> {service.name}</span>
      </Link>
    </article>
  );
}
