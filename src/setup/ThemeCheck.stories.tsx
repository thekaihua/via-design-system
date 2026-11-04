import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ThemeCheck } from './ThemeCheck';

const meta = {
  title: 'Setup/Theme check',
  component: ThemeCheck,
  tags: ['!autodocs'],
} satisfies Meta<typeof ThemeCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

const bodyBackground = () => getComputedStyle(document.body).backgroundColor;

export const Light: Story = {
  globals: { theme: 'light' },
  play: async ({ canvas }) => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    await expect(bodyBackground()).toBe('rgb(255, 255, 255)');
    await expect(canvas.getByRole('heading', { name: 'Theme check' })).toBeVisible();
  },
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  play: async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expect(bodyBackground()).toBe('rgb(16, 24, 32)');
  },
};
