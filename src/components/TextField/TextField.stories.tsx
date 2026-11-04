import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { outline, tokenColor } from '../../test/helpers';
import { Button } from '../Button/Button';
import { TextField } from './TextField';

const meta = {
  title: 'Forms/TextField',
  component: TextField,
  args: {
    label: 'Endpoint name',
    description: 'Shown in the Dashboard and webhook logs.',
    placeholder: 'e.g. Production orders',
  },
  argTypes: { trailingIcon: { control: false } },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}>{Story()}</div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Endpoint name' });
    await expect(input).toHaveAccessibleDescription('Shown in the Dashboard and webhook logs.');
    await userEvent.type(input, 'Production orders');
    await expect(input).toHaveValue('Production orders');
    const ring = outline(input.parentElement!);
    await expect(ring.width).toBe('3px');
    await expect(ring.offset).toBe('2px');
  },
};

export const Small: Story = { args: { size: 'sm' } };

export const Optional: Story = { args: { optional: true } };

export const Invalid: Story = {
  args: { error: 'Enter an endpoint name.', defaultValue: '' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Endpoint name' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(/Enter an endpoint name\./);
    const red = tokenColor('--via-semantic-error-foreground');
    await waitFor(() => expect(getComputedStyle(input.parentElement!).borderTopColor).toBe(red));
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Production orders' } };

export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'whsec_8f2…', description: undefined } };

export const WithIcon: Story = { args: { label: 'Email', type: 'email', trailingIcon: Mail, description: undefined } };

export const HiddenLabel: Story = {
  args: { hideLabel: true, description: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Endpoint name' })).toBeVisible();
  },
};

function ValidateOnSubmit(args: Parameters<typeof TextField>[0]) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      style={{ display: 'grid', gap: 12 }}
    >
      <TextField {...args} value={value} onChange={setValue} error={submitted && !value ? 'Enter an endpoint name.' : undefined} />
      <div>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}

/** Validation on submit: the error appears after the first attempt. */
export const Controlled: Story = {
  render: (args) => <ValidateOnSubmit {...args} />,
};
