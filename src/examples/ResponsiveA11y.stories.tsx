/**
 * The design's Examples page (Responsive & accessibility), applied to the app: real screens at 320 px
 * reflow, at 200% zoom, with WCAG text spacing, the header fitting its content, and a destructive dialog
 * on a short landscape screen. Every story measures; none relies on looking.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../components/Button/Button';
import { ButtonGroup } from '../components/Button/ButtonGroup';
import { Dialog } from '../components/Dialog/Dialog';
import { ContactFlow, SignIn } from '../patterns/tasks';
import { DetailPage, OverviewPage, SettingsPage } from '../patterns/templates';
import { BusinessReview, DevelopersOverview, ReviewQueue, Transactions, Webhooks } from '../screens/screens';
import { applyTextSpacing, clippedText, nextFrame, overflowingElements, overlappingText } from './a11y';


async function expectReflow() {
  await nextFrame();
  await waitFor(() => expect(overflowingElements()).toEqual([]), { timeout: 2000 });
  await expect(overlappingText(document.querySelector('main') ?? document)).toEqual([]);
}

const meta = {
  title: 'Examples/Responsive and accessibility',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// 1 · Reflow at 320 px (WCAG 1.4.10): nothing needs sideways scrolling except data tables and code.
export const Reflow320Developers: Story = {
  name: 'Reflow 320 · Developers overview',
  globals: { viewport: { value: 'reflow320' } },
  render: () => <DevelopersOverview />,
  play: expectReflow,
};
export const Reflow320Transactions: Story = {
  name: 'Reflow 320 · Transactions',
  globals: { viewport: { value: 'reflow320' } },
  render: () => <Transactions />,
  play: expectReflow,
};
export const Reflow320Review: Story = {
  name: 'Reflow 320 · Admin business review',
  globals: { viewport: { value: 'reflow320' } },
  render: () => <BusinessReview />,
  play: expectReflow,
};
export const Reflow320Settings: Story = {
  name: 'Reflow 320 · Settings',
  globals: { viewport: { value: 'reflow320' } },
  render: () => <SettingsPage />,
  play: expectReflow,
};
export const Reflow320Contact: Story = {
  name: 'Reflow 320 · Contact form with errors',
  globals: { viewport: { value: 'reflow320' } },
  render: () => <ContactFlow />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Review enquiry' }));
    await canvas.findByRole('alert');
    await expectReflow();
  },
};
export const Reflow320SkipLink: Story = {
  name: 'Reflow 320 · Skip link',
  globals: { viewport: { value: 'reflow320' } },
  render: () => <Transactions />,
  play: async ({ canvas }) => {
    await userEvent.tab();
    const skip = canvas.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toHaveFocus();
    const r = skip.getBoundingClientRect();
    // Fully on screen and at least 44 px tall when focused.
    await expect(r.left >= 0 && r.right <= window.innerWidth && r.height >= 44).toBe(true);
  },
};

// 2 · 200% zoom (WCAG 1.4.4): a 1280 px window at 200% lays out at 640 CSS px.
export const Zoom200Overview: Story = {
  name: '200% zoom · Overview template',
  globals: { viewport: { value: 'zoom200' } },
  render: () => <OverviewPage />,
  play: expectReflow,
};
export const Zoom200Webhooks: Story = {
  name: '200% zoom · Webhooks',
  globals: { viewport: { value: 'zoom200' } },
  render: () => <Webhooks />,
  play: expectReflow,
};

// 3 · Text spacing (WCAG 1.4.12): wider letters, words and lines must not clip or overlap.
function spacingTest(viewportCheck = true) {
  return async () => {
    const undo = applyTextSpacing();
    try {
      await nextFrame();
      await waitFor(() => expect(clippedText()).toEqual([]), { timeout: 2000 });
      if (viewportCheck) await expectReflow();
    } finally {
      undo();
    }
  };
}
export const SpacingDetail: Story = {
  name: 'Text spacing · Detail template',
  globals: { viewport: { value: 'desktop' } },
  render: () => <DetailPage />,
  play: spacingTest(),
};
export const SpacingReviewQueue: Story = {
  name: 'Text spacing · Review queue (mobile)',
  globals: { viewport: { value: 'mobile375' } },
  render: () => <ReviewQueue />,
  play: spacingTest(),
};
export const SpacingSignIn: Story = {
  name: 'Text spacing · Sign in (320)',
  globals: { viewport: { value: 'reflow320' } },
  render: () => <SignIn />,
  play: spacingTest(),
};

// 4 · Navigation fit: the header uses the menu whenever its content doesn't fit, not only under 768 px.
async function headerFits() {
  await nextFrame();
  const header = document.querySelector<HTMLElement>('header')!;
  await waitFor(() => expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth + 1), { timeout: 2000 });
  await expectReflow();
}
export const NavFit800: Story = {
  name: 'Navigation fit · 800 px',
  globals: { viewport: { value: 'nav800' } },
  render: () => <DevelopersOverview />,
  play: headerFits,
};
export const NavFit800Spacing: Story = {
  name: 'Navigation fit · 800 px with text spacing',
  globals: { viewport: { value: 'nav800' } },
  render: () => <DevelopersOverview />,
  play: async () => {
    const undo = applyTextSpacing();
    try {
      await headerFits();
    } finally {
      undo();
    }
  },
};
export const NavFitDesktopSpacing: Story = {
  name: 'Navigation fit · 1440 px with text spacing',
  globals: { viewport: { value: 'desktop' } },
  render: () => <DevelopersOverview />,
  play: async () => {
    const undo = applyTextSpacing();
    try {
      await headerFits();
    } finally {
      undo();
    }
  },
};

// 5 · Short-screen destructive modal: 667 × 375, focus on Cancel, actions visible, long text scrolls.
function ShortScreenDialog() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ padding: 16 }}>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Revoke key
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        destructive
        title="Revoke the live secret key?"
        description={
          <>
            <p>Requests signed with sk_live_••••a9Q fail immediately, including payments already in progress in your checkout.</p>
            <p>Create and deploy a replacement key first. Revoking can’t be undone, and the key can’t be restored later.</p>
            <p>We record who revoked the key in the audit log.</p>
          </>
        }
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Revoke key
            </Button>
          </ButtonGroup>
        }
      />
    </div>
  );
}
export const ShortScreenModal: Story = {
  name: 'Short screen · destructive dialog 667 × 375',
  globals: { viewport: { value: 'landscape' } },
  render: () => <ShortScreenDialog />,
  play: async () => {
    const dialog = await screen.findByRole('alertdialog', { name: 'Revoke the live secret key?' });
    await waitFor(() => expect(dialog).toBeVisible());
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    await waitFor(() => expect(cancel).toHaveFocus());
    // Both actions are on screen without scrolling the dialog.
    for (const name of ['Cancel', 'Revoke key']) {
      const r = within(dialog).getByRole('button', { name }).getBoundingClientRect();
      await expect(r.bottom).toBeLessThanOrEqual(window.innerHeight);
      await expect(r.top).toBeGreaterThanOrEqual(0);
    }
    // The title stays visible too.
    await expect(within(dialog).getByRole('heading', { name: 'Revoke the live secret key?' }).getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  },
};

export const Reflow320Header: Story = {
  name: 'Reflow 320 · Header keeps every action',
  globals: { viewport: { value: 'reflow320' } },
  render: () => <Transactions />,
  play: async ({ canvas }) => {
    // Sandbox / Live stays in the bar; notifications move into the account menu.
    await expect(canvas.getByRole('button', { name: /^Sandbox environment/ })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /^Notifications/ })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: /account menu/ }));
    const item = await screen.findByRole('menuitem', { name: 'Notifications' });
    await waitFor(() => expect(item).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await expectReflow();
  },
};
