import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';
import { outline } from '../../test/helpers';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: { label: 'Email me receipts', onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('checkbox', { name: 'Email me receipts' });
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(box).not.toBeChecked();
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

export const WithDescription: Story = {
  args: { label: 'Remember me on this device', description: 'Stay signed in for 30 days.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox')).toHaveAccessibleDescription('Stay signed in for 30 days.');
  },
};

export const Indeterminate: Story = {
  args: { label: 'Select all services', indeterminate: true },
  play: async ({ canvas }) => {
    await expect((canvas.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(true);
  },
};

export const Invalid: Story = {
  args: { label: 'I accept the platform terms', error: 'Accept the terms to continue.' },
};

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };

export const FocusRing: Story = {
  name: 'Focus ring (keyboard)',
  play: async ({ canvas }) => {
    await userEvent.tab();
    const indicator = canvas.getByRole('checkbox').closest('label')!.querySelector('[aria-hidden="true"]')!;
    await expect(outline(indicator).width).toBe('3px');
  },
};

function SelectAllExample() {
  const items = ['Service A', 'Service B', 'Service C'];
  const [selected, setSelected] = useState<string[]>(['Service A']);
  const all = selected.length === items.length;
  return (
    <div>
      <Checkbox
        label="All services"
        checked={all}
        indeterminate={selected.length > 0 && !all}
        onChange={(c) => setSelected(c ? items : [])}
      />
      <div style={{ paddingLeft: 32 }}>
        {items.map((item) => (
          <Checkbox
            key={item}
            label={item}
            checked={selected.includes(item)}
            onChange={(c) => setSelected((s) => (c ? [...s, item] : s.filter((x) => x !== item)))}
          />
        ))}
      </div>
    </div>
  );
}

export const SelectAll: Story = {
  name: 'Select all (indeterminate)',
  render: () => <SelectAllExample />,
};
