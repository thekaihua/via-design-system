import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from '../Button/Button';
import { ButtonGroup } from '../Button/ButtonGroup';
import { TextField } from '../TextField/TextField';
import { Dialog, type DialogProps } from './Dialog';

function Demo(props: Partial<DialogProps> & { trigger?: string; confirmLabel?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant={props.role === 'alertdialog' ? 'destructive' : 'primary'} onClick={() => setOpen(true)}>
        {props.trigger ?? 'Open dialog'}
      </Button>
      <Dialog
        title="Delete this API key?"
        description="Applications using this key will stop working. Create a replacement before deleting it."
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button variant={props.confirmLabel ? 'primary' : 'destructive'} onClick={close}>
              {props.confirmLabel ?? 'Delete key'}
            </Button>
          </ButtonGroup>
        }
        {...props}
        open={open}
        onClose={close}
      />
    </>
  );
}

const meta = {
  title: 'Overlays/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  args: { open: false, onClose: () => {}, title: 'Delete this API key?', actions: null },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
  render: () => <Demo role="alertdialog" destructive trigger="Delete key" />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Delete key' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete this API key?' });
    await waitFor(() => expect(dialog).toBeVisible());
    // Destructive: focus starts on Cancel, not on the destructive action.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
    // Esc closes and focus returns to the opener.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const WithForm: Story = {
  render: () => (
    <Demo trigger="Rename key" title="Rename API key" description={undefined} confirmLabel="Save">
      <TextField label="Key name" defaultValue="Production server" description="1–60 characters." />
    </Demo>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Rename key' }));
    const field = await screen.findByRole('textbox', { name: 'Key name' });
    // Focus starts on the first field.
    await waitFor(() => expect(field).toHaveFocus());
    // Tab stays inside the dialog.
    for (let i = 0; i < 4; i++) await userEvent.tab();
    await expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  },
};

export const NotDismissible: Story = {
  render: () => <Demo dismissible={false} trigger="Open required decision" />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open required decision' }));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await expect(screen.getByRole('dialog')).toBeInTheDocument();
    await expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  },
};

export const Medium: Story = { render: () => <Demo size="md" trigger="Open wide dialog" /> };
