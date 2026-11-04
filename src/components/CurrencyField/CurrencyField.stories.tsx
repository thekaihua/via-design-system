import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';
import { CurrencyField, fractionDigits } from './CurrencyField';

const meta = {
  title: 'Forms/CurrencyField',
  component: CurrencyField,
  args: { label: 'Rate per transaction', description: 'Charged on successful payments only.', onChange: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 280, minHeight: 200 }}>{Story()}</div>],
} satisfies Meta<typeof CurrencyField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Rate per transaction' });
    await expect(input).toHaveAttribute('inputmode', 'decimal');
    await expect(input).toHaveAccessibleDescription(/SGD/);
    await userEvent.type(input, '0.35');
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith(0.35);
    await expect(input).toHaveValue('0.35');
  },
};

export const ZeroDecimal: Story = {
  name: 'Zero-decimal currency (JPY)',
  args: { currency: 'JPY', label: 'Minimum payout' },
  play: async ({ canvas }) => {
    await expect(fractionDigits('JPY')).toBe(0);
    const input = canvas.getByRole('textbox', { name: 'Minimum payout' });
    await expect(input).toHaveAttribute('inputmode', 'numeric');
    // No minor units: a typed decimal is rounded, never dropped (1500.7 must not become 15,007).
    await userEvent.type(input, '1500.7');
    await userEvent.tab();
    await expect(input).toHaveValue('1,501');
  },
};

function WithPickerDemo() {
  const [currency, setCurrency] = useState('SGD');
  return (
    <CurrencyField
      label="Minimum payout"
      currency={currency}
      currencies={['SGD', 'MYR', 'IDR', 'THB', 'PHP', 'JPY']}
      onCurrencyChange={setCurrency}
      defaultValue={100}
    />
  );
}

export const WithCurrencyPicker: Story = { render: () => <WithPickerDemo /> };

export const Invalid: Story = { args: { error: 'Enter an amount with up to 2 decimal places.' } };
