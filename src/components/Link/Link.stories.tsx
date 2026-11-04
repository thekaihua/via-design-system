import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Link } from './Link';

const meta = {
  title: 'Actions/Link',
  component: Link,
  args: { href: '#docs', children: 'Explore card payments' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = { args: { size: 'lg' } };

export const External: Story = {
  args: { href: 'https://example.com', external: true, children: 'API reference' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'API reference (opens in new tab)' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

export const Inline: Story = {
  render: (args) => (
    <p style={{ maxWidth: 480 }}>
      Read the <Link {...args} inline>integration guide</Link> before you create your first live service.
    </p>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'integration guide' });
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline');
  },
};

export const Disabled: Story = { args: { disabled: true } };
