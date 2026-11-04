import { Circle, CircleAlert, CircleCheck, CircleDot, type LucideIcon } from 'lucide-react';
import { useId } from 'react';
import { Link as AriaLink } from 'react-aria-components';
import { cx } from '../../utils/cx';
import styles from './SetupTasks.module.css';

export type SetupTaskStatus = 'todo' | 'current' | 'done' | 'attention';

export interface SetupTask {
  id: string;
  title: string;
  description?: string;
  status: SetupTaskStatus;
  /** Where the task is done. Omit for tasks the platform completes (e.g. review). */
  href?: string;
}

export interface SetupTasksProps {
  title: string;
  tasks: SetupTask[];
  /** Heading level for the title. */
  headingLevel?: 2 | 3;
  className?: string;
}

const meta: Record<SetupTaskStatus, { icon: LucideIcon; text: string }> = {
  todo: { icon: Circle, text: 'Not started' },
  current: { icon: CircleDot, text: 'In progress' },
  done: { icon: CircleCheck, text: 'Completed' },
  attention: { icon: CircleAlert, text: 'Needs attention' },
};

/** Checklist that gets a business ready (Pattern / Setup tasks, Navigation / Task …). Status is always in text. */
export function SetupTasks({ title, tasks, headingLevel = 2, className }: SetupTasksProps) {
  const done = tasks.filter((t) => t.status === 'done').length;
  const Heading = `h${headingLevel}` as const;
  const headingId = useId();
  return (
    <section className={cx(styles.card, className)} aria-labelledby={headingId}>
      <div className={styles.heading}>
        <Heading id={headingId} className={styles.title}>
          {title}
        </Heading>
        <span className={styles.count}>
          {done} of {tasks.length} done
        </span>
      </div>
      <ol className={styles.list}>
        {tasks.map((task) => {
          const { icon: Icon, text } = meta[task.status];
          const body = (
            <>
              <Icon className={styles.icon} size={20} aria-hidden="true" />
              <span className={styles.text}>
                <span className={styles.taskTitle}>{task.title}</span>
                {task.description && <span className={styles.description}>{task.description}</span>}
              </span>
              <span className={styles.status}>{text}</span>
            </>
          );
          return (
            <li key={task.id} className={cx(styles.task, styles[task.status])} aria-current={task.status === 'current' ? 'step' : undefined}>
              {task.href ? (
                <AriaLink href={task.href} className={styles.row}>
                  {body}
                </AriaLink>
              ) : (
                <div className={styles.row}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
