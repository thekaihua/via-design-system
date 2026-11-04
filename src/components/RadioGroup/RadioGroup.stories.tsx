import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { RadioGroup } from './RadioGroup';

const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Enquiry type',
    options: [
      { value: 'business', label: 'Business development' },
      { value: 'technical', label: 'Technical support', description: 'Integration, API keys and webhooks' },
      { value: 'billing', label: 'Billing' },
    ],
    defaultValue: 'business',
    onChange: fn(),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const group = canvas.getByRole('radiogroup', { name: 'Enquiry type' });
    await expect(group).toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'Business development' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const technical = canvas.getByRole('radio', { name: /Technical support/ });
    await expect(technical).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith('technical');
  },
};

export const Horizontal: Story = { args: { orientation: 'horizontal' } };

export const Invalid: Story = { args: { defaultValue: undefined, error: 'Choose an enquiry type.' } };

export const Disabled: Story = { args: { disabled: true } };
