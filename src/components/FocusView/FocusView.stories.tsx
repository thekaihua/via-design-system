import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { Banner } from '../Banner/Banner';
import { Button } from '../Button/Button';
import { ButtonGroup } from '../Button/ButtonGroup';
import { Switch } from '../Switch/Switch';
import { TextField } from '../TextField/TextField';
import { FocusView } from './FocusView';

function AddEndpoint() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const close = () => {
    setOpen(false);
    setUrl('');
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Add endpoint</Button>
      <FocusView
        open={open}
        onClose={close}
        title="Add webhook endpoint"
        description="Production orders · Live mode"
        confirmClose={url !== ''}
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Add endpoint</Button>
          </ButtonGroup>
        }
      >
        <TextField label="Endpoint URL" description="Must use HTTPS." value={url} onChange={setUrl} type="url" />
        <Switch label="Retry failed deliveries" description="Up to 3 days with exponential back-off." defaultChecked />
        <Banner title="Send a test event after saving" description="Use the Event log to confirm delivery." />
      </FocusView>
    </>
  );
}

const steps = ['Company details', 'Owners', 'Bank account'];

function GoLive() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const close = () => {
    setOpen(false);
    setStep(0);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Go live</Button>
      <FocusView
        open={open}
        onClose={close}
        title="Go live"
        description={steps[step]}
        steps={steps}
        currentStep={step}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => (step === steps.length - 1 ? close() : setStep((s) => s + 1))}
      >
        <TextField label={`${steps[step]} — example field`} />
      </FocusView>
    </>
  );
}

const meta = {
  title: 'Overlays/FocusView',
  component: FocusView,
  args: { open: false, onClose: () => {}, title: 'Add webhook endpoint', children: null },
} satisfies Meta<typeof FocusView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => <AddEndpoint />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Add endpoint' });
    await userEvent.click(trigger);
    const title = await screen.findByRole('heading', { name: 'Add webhook endpoint' });
    await waitFor(() => expect(title).toHaveFocus());
    // Unsaved changes: Esc asks first.
    await userEvent.type(screen.getByRole('textbox', { name: 'Endpoint URL' }), 'https://shop.example/hooks');
    await userEvent.keyboard('{Escape}');
    const confirm = await screen.findByRole('alertdialog', { name: 'Discard changes?' });
    await userEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    await waitFor(() => expect(confirm).not.toBeInTheDocument());
    await expect(screen.getByRole('textbox', { name: 'Endpoint URL' })).toHaveValue('https://shop.example/hooks');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const Stepped: Story = {
  render: () => <GoLive />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Go live' }));
    await screen.findByText('Step 1 of 3');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    // Back on step 1 closes the view.
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  },
};
