import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Textarea } from './Textarea';

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: {
    label: 'Message',
    description: 'Include the markets and payment options you need.',
    placeholder: 'Tell us about your payment needs.',
  },
  decorators: [(Story) => <div style={{ maxWidth: 400 }}>{Story()}</div>],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCharacterCount: Story = {
  args: { maxLength: 30 },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.type(box, 'Card payments in SG');
    await expect(canvas.getByText('19 / 30')).toBeInTheDocument();
    await expect(canvas.getByText('11 characters remaining')).toBeInTheDocument();
  },
};

export const Invalid: Story = { args: { error: 'Tell us what you need.' } };

export const Disabled: Story = { args: { disabled: true } };
