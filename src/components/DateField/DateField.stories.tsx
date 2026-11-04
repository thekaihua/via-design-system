import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';
import { DateField } from './DateField';
import { DateRangePicker } from './DateRangePicker';
import type { DateRange } from './dates';

const meta = {
  title: 'Forms/DateField',
  component: DateField,
  args: { label: 'Go-live date', description: 'The day you plan to accept live payments.', onChange: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 320, minHeight: 420 }}>{Story()}</div>],
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: '2026-11-14' },
  play: async ({ canvas, args }) => {
    // Typed parts are day / month / year whatever the browser locale.
    const parts = canvas.getAllByRole('spinbutton').map((el) => el.getAttribute('aria-label') ?? el.textContent);
    await expect(parts.slice(0, 3).map((p) => p?.toLowerCase().replace(/,.*/, ''))).toEqual(['day', 'month', 'year']);
    await userEvent.click(canvas.getByRole('button', { name: /Open calendar/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Choose go-live date' });
    await waitFor(() => expect(dialog).toBeVisible());
    // Keyboard: arrow to the next day, Enter picks it.
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(args.onChange).toHaveBeenCalledWith('2026-11-15');
  },
};

export const Empty: Story = {};

export const Invalid: Story = { args: { error: 'Choose a date after today.', defaultValue: '2026-01-01' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-11-14' } };

function RangeDemo() {
  const [value, setValue] = useState<DateRange | null>({ start: '2026-10-02', end: '2026-10-31' });
  return (
    <div style={{ maxWidth: 520 }}>
      <DateRangePicker label="Date range" value={value} onChange={setValue} timeZone="Asia/Singapore" />
      <output data-testid="value" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
        {value ? `${value.start} → ${value.end}` : 'none'}
      </output>
    </div>
  );
}

export const Range: Story = {
  name: 'Date range picker',
  render: () => <RangeDemo />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Times in Asia\/Singapore \(UTC\+8\)/)).toBeInTheDocument();
    const trigger = canvas.getByRole('button', { name: /choose dates/ });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Choose date range' });
    await waitFor(() => expect(dialog).toBeVisible());
    // A preset fills the draft; nothing changes until Apply.
    await userEvent.click(screen.getByRole('button', { name: 'Today' }));
    // Summary in the system date format: DD MMM YYYY.
    await expect(screen.getByText(/^\d{2} [A-Z][a-z]{2} \d{4} – \d{2} [A-Z][a-z]{2} \d{4} · 1 day$/)).toBeVisible();
    await expect(canvas.getByTestId('value')).toHaveTextContent('2026-10-02 → 2026-10-31');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(canvas.getByTestId('value')).not.toHaveTextContent('2026-10-02'));
    await expect(trigger).toHaveAccessibleName(/^Today, choose dates/);
  },
};

export const RangeCancel: Story = {
  name: 'Date range picker: Cancel discards',
  render: () => <RangeDemo />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /choose dates/ }));
    await screen.findByRole('dialog', { name: 'Choose date range' });
    await userEvent.click(screen.getByRole('button', { name: 'Last 7 days' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByTestId('value')).toHaveTextContent('2026-10-02 → 2026-10-31');
  },
};

export const RangeFits: Story = {
  name: 'Date range picker: dates are never clipped',
  render: () => <RangeDemo />,
  play: async ({ canvasElement }) => {
    // Measure with the real font: the fallback font is narrower and hides clipping.
    await document.fonts.ready;
    const group = canvasElement.querySelector<HTMLElement>('[class*="rangeControl"]')!;
    const g = group.getBoundingClientRect();
    const inputs = [...group.querySelectorAll<HTMLElement>('[class*="_input_"]')];
    await expect(inputs).toHaveLength(2);
    for (const i of inputs) {
      await expect(i.scrollWidth).toBeLessThanOrEqual(i.clientWidth + 1);
      await expect(i.getBoundingClientRect().right).toBeLessThanOrEqual(g.right + 1);
    }
  },
};
