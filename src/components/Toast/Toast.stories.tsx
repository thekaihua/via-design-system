import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { ButtonGroup } from '../Button/ButtonGroup';
import { toast, toastQueue, ToastRegion } from './Toast';

const undo = fn();

function Demo() {
  return (
    <>
      <ButtonGroup align="start">
        <Button onClick={() => toast('Your settings were saved.')}>Save settings</Button>
        <Button variant="secondary" onClick={() => toast('Key ID copied', { tone: 'info', duration: 3000 })}>
          Copy key ID
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast('Endpoint deleted', { action: { label: 'Undo', onClick: undo }, duration: 10000 })}
        >
          Delete endpoint
        </Button>
        <Button variant="secondary" onClick={() => toast("We couldn't save your settings.", { tone: 'error' })}>
          Fail
        </Button>
      </ButtonGroup>
      <ToastRegion />
    </>
  );
}

const meta = {
  title: 'Feedback/Toast',
  component: ToastRegion,
  render: () => <Demo />,
  parameters: { layout: 'padded' },
  beforeEach: () => {
    // Start each story with an empty stack.
    toastQueue.visibleToasts.forEach((t) => toastQueue.close(t.key));
  },
} satisfies Meta<typeof ToastRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save settings' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    await expect(within(region).getByText('Your settings were saved.')).toBeInTheDocument();
    await userEvent.click(within(region).getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(within(region).queryByText('Your settings were saved.')).not.toBeInTheDocument());
  },
};

export const WithAction: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delete endpoint' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    await expect(undo).toHaveBeenCalled();
  },
};

export const MaxThree: Story = {
  name: 'Stack shows at most 3',
  play: async ({ canvas }) => {
    const save = canvas.getByRole('button', { name: 'Save settings' });
    for (let i = 0; i < 4; i++) await userEvent.click(save);
    const region = await screen.findByRole('region', { name: 'Notifications' });
    await waitFor(() => expect(within(region).getAllByText('Your settings were saved.')).toHaveLength(3));
  },
};
