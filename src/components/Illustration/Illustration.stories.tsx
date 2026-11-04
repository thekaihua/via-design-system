import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Illustration, type IllustrationName } from './Illustration';

const spots: IllustrationName[] = ['empty', 'empty-payments', 'empty-webhooks', 'no-results', 'error', 'success'];

const meta = {
  title: 'Feedback/Illustration',
  component: Illustration,
  args: { name: 'empty-payments' },
} satisfies Meta<typeof Illustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Decorative: hidden from assistive tech; the text beside it carries the meaning.
    await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Spots: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
      {spots.map((name) => (
        <figure key={name} style={{ margin: 0, display: 'grid', justifyItems: 'center', gap: 8, fontFamily: 'var(--via-font-ui)', fontSize: 13 }}>
          <Illustration name={name} />
          <figcaption>{name}</figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const SignIn: Story = { args: { name: 'sign-in', width: 400 } };
