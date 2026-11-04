import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { PasswordField } from './PasswordField';

const meta = {
  title: 'Forms/PasswordField',
  component: PasswordField,
  args: { label: 'Password', description: 'Use your account password.', autoComplete: 'current-password' },
  decorators: [(Story) => <div style={{ maxWidth: 400 }}>{Story()}</div>],
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Password');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).toHaveAttribute('autocomplete', 'current-password');
    const toggle = canvas.getByRole('button', { name: 'Show password' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(input).toHaveAttribute('type', 'text');
  },
};

export const NewPassword: Story = {
  args: { label: 'Create a password', description: 'At least 12 characters.', autoComplete: 'new-password' },
};

export const Invalid: Story = { args: { error: 'Enter your password.' } };

export const WithoutToggle: Story = { args: { showToggle: false } };
