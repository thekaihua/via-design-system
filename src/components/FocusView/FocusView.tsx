import { X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button as AriaButton, Dialog as AriaDialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import { ButtonGroup } from '../Button/ButtonGroup';
import { Dialog } from '../Dialog/Dialog';
import o from '../Overlay/Overlay.module.css';
import styles from './FocusView.module.css';

export interface FocusViewProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Context under the title, e.g. "Production orders · Live mode". */
  description?: string;
  children: ReactNode;
  /** Footer actions for a single-step view (e.g. Cancel + Add endpoint). Ignored when `steps` is set. */
  actions?: ReactNode;
  /** Step names for a multi-step flow. Shows "Step n of m", progress segments, Back and Continue. */
  steps?: string[];
  /** Zero-based index of the current step. */
  currentStep?: number;
  onBack?: () => void;
  onNext?: () => void;
  /** Label of the forward button. Defaults to "Continue", and "Submit" on the last step. */
  nextLabel?: string;
  /** Disables Continue while the step is invalid or saving. */
  nextLoading?: boolean;
  /** Ask before closing, e.g. when the form has unsaved changes. */
  confirmClose?: boolean;
}

/**
 * Full-height side panel for a focused task (Overlay / Focus view, Focus view / Stepped).
 * Focus moves to the title on open. Esc or close asks to discard unsaved changes when `confirmClose` is set.
 * Back on the first step closes the view.
 */
export function FocusView({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  steps,
  currentStep = 0,
  onBack,
  onNext,
  nextLabel,
  nextLoading,
  confirmClose,
}: FocusViewProps) {
  const [confirming, setConfirming] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, currentStep]);

  const requestClose = () => (confirmClose ? setConfirming(true) : onClose());
  const isFirst = currentStep === 0;
  const isLast = steps ? currentStep === steps.length - 1 : false;

  return (
    <>
      <ModalOverlay
        isOpen={open}
        onOpenChange={(isOpen) => !isOpen && requestClose()}
        isDismissable
        className={cx(o.scrim, styles.overlay)}
      >
        <Modal className={styles.panel}>
          <AriaDialog className={styles.dialog}>
            {/* Not <header>: inside a modal it would be a second page banner landmark. */}
            <div className={styles.header}>
              <div className={styles.heading}>
                <Heading slot="title" ref={headingRef} tabIndex={-1} className={cx(o.heading, styles.title)}>
                  {title}
                </Heading>
                {description && <p className={styles.description}>{description}</p>}
              </div>
              <AriaButton className={o.close} aria-label="Close" onPress={requestClose}>
                <X size={18} aria-hidden="true" />
              </AriaButton>
            </div>
            <div className={styles.body}>{children}</div>
            <footer className={styles.footer}>
              {steps ? (
                <>
                  <div className={styles.progress}>
                    <span className={styles.stepLabel}>
                      Step {currentStep + 1} of {steps.length}
                      <span className="via-visually-hidden">: {steps[currentStep]}</span>
                    </span>
                    <span className={styles.segments} aria-hidden="true">
                      {steps.map((s, i) => (
                        <span key={s} className={cx(styles.segment, i <= currentStep && styles.segmentDone)} />
                      ))}
                    </span>
                  </div>
                  <ButtonGroup>
                    <Button variant="secondary" onClick={isFirst ? requestClose : onBack}>
                      Back
                    </Button>
                    <Button onClick={onNext} loading={nextLoading}>
                      {nextLabel ?? (isLast ? 'Submit' : 'Continue')}
                    </Button>
                  </ButtonGroup>
                </>
              ) : (
                <div className={styles.actions}>{actions}</div>
              )}
            </footer>
          </AriaDialog>
        </Modal>
      </ModalOverlay>
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        destructive
        title="Discard changes?"
        description="Your changes won't be saved."
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Keep editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirming(false);
                onClose();
              }}
            >
              Discard
            </Button>
          </ButtonGroup>
        }
      />
    </>
  );
}
