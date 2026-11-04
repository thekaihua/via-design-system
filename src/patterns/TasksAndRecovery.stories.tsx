import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { SignIn, ResetPassword, VerifyIdentity, SessionWarning, SessionEnded, ContactFlow, onSignIn, onExtend, onSend } from './tasks';

const meta = {
  title: 'Patterns/Tasks and recovery',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignInForm: Story = {
  name: 'Sign in',
  render: () => <SignIn />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    const summary = await canvas.findByRole('alert', { name: 'There are 2 problems' });
    await waitFor(() => expect(summary).toHaveFocus());
    await userEvent.click(canvas.getByRole('link', { name: 'Enter your password.' }));
    await expect(canvas.getByLabelText('Password', { selector: 'input' })).toHaveFocus();
    await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), 'ops@shop.example');
    await userEvent.type(canvas.getByLabelText('Password', { selector: 'input' }), 'correct horse');
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await expect(onSignIn).toHaveBeenCalledWith('ops@shop.example');
  },
};

export const PasswordRecovery: Story = {
  name: 'Reset password',
  render: () => <ResetPassword />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), 'ops@shop.example');
    await userEvent.click(canvas.getByRole('button', { name: 'Send reset link' }));
    await expect(await canvas.findByText(/If an account exists for ops@shop.example/)).toBeVisible();
  },
};

export const Verify: Story = {
  name: 'Verify identity',
  render: () => <VerifyIdentity />,
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: /Verification code/ });
    await expect(field).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(field).toHaveAttribute('inputmode', 'numeric');
    await userEvent.type(field, '12345');
    await userEvent.click(canvas.getByRole('button', { name: 'Verify code' }));
    await expect(await canvas.findByRole('alert', { name: 'There is a problem' })).toBeVisible();
  },
};

export const Warning: Story = {
  name: 'Session warning',
  render: () => <SessionWarning />,
  play: async () => {
    const dialog = await screen.findByRole('alertdialog', { name: 'Need more time?' });
    await waitFor(() => expect(dialog).toBeVisible());
    // Escape doesn't close it: the choice matters.
    await userEvent.keyboard('{Escape}');
    await expect(dialog).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Stay signed in' }));
    await expect(onExtend).toHaveBeenCalled();
  },
};

export const Ended: Story = { name: 'Session ended', render: () => <SessionEnded /> };

export const Contact: Story = {
  name: 'Contact form: errors, review, send',
  render: () => <ContactFlow />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: /^Name/ }), 'Alex Tan');
    await userEvent.click(canvas.getByRole('button', { name: 'Review enquiry' }));
    // Two problems; the name typed so far is kept.
    await canvas.findByRole('alert', { name: 'There are 2 problems' });
    await expect(canvas.getByRole('textbox', { name: /^Name/ })).toHaveValue('Alex Tan');
    await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), 'alex@example.com');
    await userEvent.type(canvas.getByRole('textbox', { name: /Message/ }), 'We need card payments in Singapore.');
    await userEvent.click(canvas.getByRole('button', { name: 'Review enquiry' }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Review your enquiry' })).toHaveFocus());
    await userEvent.click(canvas.getByRole('button', { name: 'Edit details' }));
    await expect(canvas.getByRole('textbox', { name: /Work email/ })).toHaveValue('alex@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Review enquiry' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Send enquiry' }));
    await expect(onSend).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alex Tan', country: '' }));
    await expect(canvas.getByRole('heading', { name: 'Enquiry sent' })).toBeVisible();
  },
};
